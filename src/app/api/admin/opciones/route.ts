import { NextResponse } from "next/server";
import pool from "@/lib/db";
import type { RowDataPacket } from "mysql2/promise";

export const dynamic = "force-dynamic";

const like = (s: string) => `%${s}%`;
const toInt = (v: any, d = 0) => (Number.isFinite(Number(v)) ? Number(v) : d);

async function safeQuery<T extends RowDataPacket[]>(sql: string, params: any[] = []): Promise<T> {
  try {
    const [rows] = await pool.query<T>(sql, params);
    return rows;
  } catch (e) {
    console.warn("[admin/opciones] safeQuery:", (e as any)?.message || e);
    return [] as unknown as T;
  }
}
async function tableExists(table: string): Promise<boolean> {
  try {
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT 1 FROM INFORMATION_SCHEMA.TABLES
       WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? LIMIT 1`,
      [table]
    );
    return rows.length > 0;
  } catch {
    return false;
  }
}
async function columnExists(table: string, column: string): Promise<boolean> {
  try {
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS
       WHERE TABLE_SCHEMA = DATABASE()
         AND TABLE_NAME = ?
         AND COLUMN_NAME = ?
       LIMIT 1`,
      [table, column]
    );
    return rows.length > 0;
  } catch {
    return false;
  }
}

const NAME_CANDIDATES = [
  "nombre",
  "descripcion",
  "titulo",
  "codigo",
  "razon_social",
  "nombre_laboratorio",
  "producto",
] as const;

async function findWorkingNameColumnOn(table: string, candidates: readonly string[]): Promise<string | null> {
  for (const col of candidates) {
    // eslint-disable-next-line no-await-in-loop
    if (await columnExists(table, col)) return col;
  }
  for (const col of candidates) {
    try {
      // eslint-disable-next-line no-await-in-loop
      await pool.query(`SELECT ${col} FROM ${table} LIMIT 1`);
      return col;
    } catch (e: any) {
      if (e?.code === "ER_BAD_FIELD_ERROR") continue;
      throw e;
    }
  }
  return null;
}

/**
 * GET /api/admin/opciones
 * Params:
 *  - tables: csv de tablas, p.ej: "centros_medicos,medicos,integracion_laboratorios"
 *  - id_centro?: filtra recursos dependientes de centro (medicos, tecnicos, sucursales, salas… si aplican)
 *  - q?: texto para LIKE sobre columnas de nombre (si aplica)
 *  - limit?: límite por tabla (50..5000; default 1000)
 *  - value_col?: forzar columna ID (si no, intenta detectar: id, id_<tabla_singular>, codigo, rut)
 *  - label_col?: forzar columna label (si no, autodetección)
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const tablesCsv = (searchParams.get("tables") || "").trim();
    if (!tablesCsv) {
      return NextResponse.json({ success: false, error: "Falta parámetro 'tables'" }, { status: 400 });
    }
    const id_centro = searchParams.get("id_centro");
    const q = (searchParams.get("q") || "").trim();
    const limit = Math.min(5000, Math.max(50, toInt(searchParams.get("limit") ?? 1000)));
    const forceValue = (searchParams.get("value_col") || "").trim();
    const forceLabel = (searchParams.get("label_col") || "").trim();

    const idCentroNum = id_centro ? Number(id_centro) : null;

    const tables = tablesCsv
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    const out: Record<string, any[]> = {};

    for (const table of tables) {
      // eslint-disable-next-line no-await-in-loop
      if (!(await tableExists(table))) {
        out[table] = [];
        continue;
      }

      // value column heuristics
      let valueCol = forceValue || "id";
      const idCandidates = [
        "id",
        `id_${table.replace(/s$/, "")}`,
        `id_${table}`,
        "codigo",
        "rut",
      ];
      if (!forceValue) {
        for (const c of idCandidates) {
          // eslint-disable-next-line no-await-in-loop
          if (await columnExists(table, c)) {
            valueCol = c;
            break;
          }
        }
      }

      // label column
      let labelCol = forceLabel || (await findWorkingNameColumnOn(table, NAME_CANDIDATES)) || valueCol;

      // filtros dependientes de centro (si la tabla posee columna)
      const centroCol = (await columnExists(table, "id_centro"))
        ? "id_centro"
        : (await columnExists(table, "id_centro_principal"))
        ? "id_centro_principal"
        : null;

      // filtro por q
      const whereParts: string[] = [];
      const params: any[] = [];

      if (idCentroNum != null && centroCol) {
        whereParts.push(`${centroCol} = ?`);
        params.push(idCentroNum);
      }
      if (q) {
        whereParts.push(`${labelCol} LIKE ?`);
        params.push(like(q));
      }

      const where = whereParts.length ? `WHERE ${whereParts.join(" AND ")}` : "";

      // join con usuarios si aplica (medicos/tecnicos/secretarias) para label
      const joinUsuarios =
        ["medicos", "tecnicos", "secretarias"].includes(table) &&
        (await columnExists(table, "id_usuario")) &&
        (await tableExists("usuarios"));

      if (joinUsuarios) {
        const centroExpr = centroCol ? `t.${centroCol}` : "NULL";
        const where2 = whereParts.length ? `WHERE ${whereParts.map((p) => p.replace(labelCol, "u.nombre")).join(" AND ")}` : "";
        const rows = await safeQuery<RowDataPacket[]>(
          `SELECT t.${valueCol} AS value,
                  CONCAT(u.nombre,' ',u.apellido_paterno,' ',IFNULL(u.apellido_materno,'')) AS label,
                  ${centroExpr} AS id_centro
           FROM ${table} t
           JOIN usuarios u ON u.id_usuario = t.id_usuario
           ${where2}
           ORDER BY u.nombre, u.apellido_paterno
           LIMIT ?`,
          [...params.map((p) => (p === like(q) ? like(q) : p)), limit]
        );
        out[table] = rows;
        continue;
      }

      // consulta genérica
      const rows = await safeQuery<RowDataPacket[]>(
        `SELECT ${valueCol} AS value,
                ${labelCol} AS label
         FROM ${table}
         ${where}
         ORDER BY ${labelCol}
         LIMIT ?`,
        [...params, limit]
      );
      out[table] = rows;
    }

    return NextResponse.json({ success: true, opciones: out, meta: { limit, filtered_by_centro: idCentroNum } });
  } catch (err: any) {
    console.error("GET /admin/opciones error:", err);
    return NextResponse.json({ success: false, error: err?.message || "Error inesperado" }, { status: 500 });
  }
}
