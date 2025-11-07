// frontend/src/app/api/admin/historial-clinico/config/route.ts
import { NextResponse } from "next/server";
import pool from "@/lib/db";
import type {
  RowDataPacket,
  ResultSetHeader,
  PoolConnection,
  FieldPacket,
} from "mysql2/promise";

export const dynamic = "force-dynamic";

/**
 * Claves soportadas:
 *  - historial.nivel_acceso_default  => "completo" | "basico" | "restringido"
 *  - historial.requiere_firma         => "0" | "1"
 *  - historial.ia_resumen_activo      => "0" | "1"
 */
const CFG_KEYS = [
  "historial.nivel_acceso_default",
  "historial.requiere_firma",
  "historial.ia_resumen_activo",
] as const;

type CfgKey = typeof CFG_KEYS[number];

const DEFAULT_CFG: Record<CfgKey, string> = {
  "historial.nivel_acceso_default": "completo",
  "historial.requiere_firma": "0",
  "historial.ia_resumen_activo": "0",
};

// =============== Helpers ===============
const toInt = (v: any) => (Number.isFinite(Number(v)) ? Number(v) : NaN);
const as01 = (v: any) => (v === 1 || v === "1" || v === true ? "1" : "0");
const isCfgKey = (k: string): k is CfgKey =>
  (CFG_KEYS as readonly string[]).includes(k);

function normalizePair(key: CfgKey, value: any): string | null {
  switch (key) {
    case "historial.nivel_acceso_default": {
      const v = String(value ?? "").toLowerCase().trim();
      return ["completo", "basico", "restringido"].includes(v) ? v : null;
    }
    case "historial.requiere_firma":
    case "historial.ia_resumen_activo":
      return as01(value);
    default:
      return null;
  }
}

// =============== GET ===============
/**
 * GET /api/admin/historial-clinico/config?id_centro=#
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id_centro = toInt(searchParams.get("id_centro"));

    if (!Number.isFinite(id_centro)) {
      return NextResponse.json(
        { success: false, error: "id_centro requerido o inválido" },
        { status: 400 }
      );
    }

    const placeholders = CFG_KEYS.map(() => "?").join(",");
    const sql = `
      SELECT clave, valor
      FROM configuraciones_centro
      WHERE id_centro = ? AND clave IN (${placeholders})
    `;
    const [rows] = await pool.query<RowDataPacket[] & FieldPacket[]>(
      sql,
      [id_centro, ...CFG_KEYS]
    );

    const config: Record<CfgKey, string> = { ...DEFAULT_CFG };
    for (const r of rows as RowDataPacket[]) {
      const clave = r.clave as string;
      if (isCfgKey(clave)) {
        const normalized = normalizePair(clave, r.valor);
        if (normalized !== null) config[clave] = normalized;
      }
    }

    return NextResponse.json({ success: true, id_centro, config });
  } catch (err: any) {
    console.error("GET /historial-clinico/config error:", err);
    return NextResponse.json(
      { success: false, error: err?.message ?? "Error inesperado" },
      { status: 500 }
    );
  }
}

// =============== PUT ===============
/**
 * PUT /api/admin/historial-clinico/config
 * body: { id_centro: number, values: Record<string, string|number|boolean> }
 */
export async function PUT(req: Request) {
  let conn: PoolConnection | null = null;
  try {
    const body = await req.json();
    const id_centro = toInt(body?.id_centro);
    const values = body?.values as Record<string, any>;

    if (!Number.isFinite(id_centro) || !values || typeof values !== "object") {
      return NextResponse.json(
        { success: false, error: "Datos inválidos (id_centro/values)" },
        { status: 400 }
      );
    }

    // Validar/normalizar entradas
    const validEntries: Array<[CfgKey, string]> = [];
    const skipped: string[] = [];

    for (const [rawKey, rawVal] of Object.entries(values)) {
      if (!isCfgKey(rawKey)) {
        skipped.push(rawKey);
        continue;
      }
      const normalized = normalizePair(rawKey, rawVal);
      if (normalized === null) {
        skipped.push(rawKey);
        continue;
      }
      validEntries.push([rawKey, normalized]);
    }

    if (validEntries.length === 0) {
      return NextResponse.json(
        { success: false, error: "Nada válido para actualizar", skipped },
        { status: 400 }
      );
    }

    conn = await pool.getConnection();
    await conn.beginTransaction();

    // Recomendado: índice único para (id_centro, clave)
    // ALTER TABLE configuraciones_centro ADD UNIQUE KEY uniq_centro_clave (id_centro, clave);

    const upsertSql = `
      INSERT INTO configuraciones_centro (id_centro, clave, valor, tipo_dato, descripcion, grupo)
      VALUES (?, ?, ?, 'string', 'Configuración Historial Clínico', 'historial')
      ON DUPLICATE KEY UPDATE valor = VALUES(valor), fecha_modificacion = NOW()
    `;

    for (const [clave, valor] of validEntries) {
      try {
        // Preferir execute<> (mejores tipos en mysql2/promise)
        await conn.execute<ResultSetHeader>(upsertSql, [id_centro, clave, valor]);
      } catch {
        // Fallback si no hay UNIQUE KEY: UPDATE -> si 0 filas, INSERT
        const updateSql = `
          UPDATE configuraciones_centro
          SET valor = ?, fecha_modificacion = NOW()
          WHERE id_centro = ? AND clave = ?
        `;
        const [u] = await conn.execute<ResultSetHeader>(updateSql, [
          valor,
          id_centro,
          clave,
        ]);
        if ((u as ResultSetHeader).affectedRows === 0) {
          const insertSql = `
            INSERT INTO configuraciones_centro
              (id_centro, clave, valor, tipo_dato, descripcion, grupo)
            VALUES (?, ?, ?, 'string', 'Configuración Historial Clínico', 'historial')
          `;
          await conn.execute<ResultSetHeader>(insertSql, [
            id_centro,
            clave,
            valor,
          ]);
        }
      }
    }

    await conn.commit();
    conn.release();
    conn = null;

    // Devolver config consolidada
    const placeholders = CFG_KEYS.map(() => "?").join(",");
    const [rows] = await pool.query<RowDataPacket[] & FieldPacket[]>(
      `SELECT clave, valor FROM configuraciones_centro WHERE id_centro = ? AND clave IN (${placeholders})`,
      [id_centro, ...CFG_KEYS]
    );

    const config: Record<CfgKey, string> = { ...DEFAULT_CFG };
    for (const r of rows as RowDataPacket[]) {
      const clave = r.clave as string;
      if (isCfgKey(clave)) {
        const normalized = normalizePair(clave, r.valor);
        if (normalized !== null) config[clave] = normalized;
      }
    }

    return NextResponse.json({
      success: true,
      id_centro,
      updated: validEntries.map(([k]) => k),
      skipped,
      config,
    });
  } catch (err: any) {
    if (conn) {
      try {
        await conn.rollback();
      } catch {}
      try {
        conn.release();
      } catch {}
    }
    console.error("PUT /historial-clinico/config error:", err);
    return NextResponse.json(
      { success: false, error: err?.message ?? "Error inesperado" },
      { status: 500 }
    );
  }
}
