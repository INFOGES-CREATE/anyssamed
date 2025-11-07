// frontend/src/app/api/admin/recetas-medicas/opciones/route.ts
import { NextResponse } from "next/server";
import pool from "@/lib/db";
import type { RowDataPacket } from "mysql2/promise";

export const dynamic = "force-dynamic";

/* ================= Utils ================= */
const like = (s: string) => `%${s}%`;
const toInt = (v: any, d = 0) => (Number.isFinite(Number(v)) ? Number(v) : d);

/** Query tolerante a fallo: ante error devuelve [] */
async function safeQuery<T extends RowDataPacket[]>(
  sql: string,
  params: any[] = []
): Promise<T> {
  try {
    const [rows] = await pool.query<T>(sql, params);
    return rows;
  } catch (e) {
    console.warn("[recetas-medicas/opciones] safeQuery:", (e as any)?.message || e);
    return [] as unknown as T;
  }
}

/* ============= Medicamentos: detectar columna de nombre ============= */
const NAME_CANDIDATES = [
  "nombre",
  "nombre_medicamento",
  "denominacion_comun",
  "nombre_generico",
  "nombre_comercial",
  "producto",
  "presentacion",
  "descripcion",
  "titulo",
] as const;

async function findWorkingNameColumnOnMedicamentos(): Promise<string | null> {
  // 1) INFORMATION_SCHEMA si hay permisos
  try {
    for (const col of NAME_CANDIDATES) {
      // eslint-disable-next-line no-await-in-loop
      const [rows] = await pool.query<RowDataPacket[]>(
        `
        SELECT 1
        FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_SCHEMA = DATABASE()
          AND TABLE_NAME = 'medicamentos'
          AND COLUMN_NAME = ?
        LIMIT 1
      `,
        [col]
      );
      if (rows.length) return col;
    }
  } catch {
    // 2) Sin permisos: probar por intento
    for (const col of NAME_CANDIDATES) {
      try {
        // eslint-disable-next-line no-await-in-loop
        await pool.query(`SELECT id_medicamento, ${col} FROM medicamentos LIMIT 1`);
        return col;
      } catch (e: any) {
        if (e?.code === "ER_BAD_FIELD_ERROR") continue;
        throw e;
      }
    }
  }
  return null;
}

async function fetchMedicamentos() {
  const col = await findWorkingNameColumnOnMedicamentos();
  if (col) {
    const rows = await safeQuery<RowDataPacket[]>(
      `
      SELECT id_medicamento AS value, ${col} AS label
      FROM medicamentos
      ORDER BY ${col}
      LIMIT 10000
    `
    );
    return { medicamentos: rows, labelColumn: col };
  }
  // Fallback si no existe ninguna columna “nombre-like”
  const rows = await safeQuery<RowDataPacket[]>(
    `
    SELECT id_medicamento AS value,
           CONCAT('Medicamento #', id_medicamento) AS label
    FROM medicamentos
    ORDER BY id_medicamento
    LIMIT 10000
  `
  );
  return { medicamentos: rows, labelColumn: null };
}

/* ================= GET ================= */
/**
 * GET /api/admin/recetas-medicas/opciones
 * Query:
 *  - id_centro?: filtra médicos por centro
 *  - q?: filtra pacientes por nombre/apellidos/rut
 *  - limit?: límite pacientes (50..5000; default 1000)
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id_centro = searchParams.get("id_centro");
    const q = (searchParams.get("q") || "").trim();
    const limit = Math.min(5000, Math.max(50, toInt(searchParams.get("limit") ?? 1000)));

    const paramsCentro: any[] = [];
    const whereCentro = id_centro
      ? (() => {
          const v = Number(id_centro);
          paramsCentro.push(v, v);
          // considera id_centro y id_centro_principal (tu esquema tiene ambos)
          return "WHERE (m.id_centro = ? OR m.id_centro_principal = ?)";
        })()
      : "";

    const [
      centrosRows,
      medicosRows,
      pacientesRows,
      tiposRecetaRows,
      medicamentosBlock,
    ] = await Promise.all([
      safeQuery<RowDataPacket[]>(
        `SELECT id_centro, nombre
           FROM centros_medicos
          ORDER BY nombre`
      ),
      safeQuery<RowDataPacket[]>(
        `
        SELECT
          m.id_medico,
          COALESCE(m.id_centro, m.id_centro_principal) AS id_centro,
          u.nombre, u.apellido_paterno, IFNULL(u.apellido_materno,'') AS apm
        FROM medicos m
        JOIN usuarios u ON u.id_usuario = m.id_usuario
        ${whereCentro}
        ORDER BY u.nombre, u.apellido_paterno
      `,
        paramsCentro
      ),
      safeQuery<RowDataPacket[]>(
        `
        SELECT
          p.id_paciente, p.rut, p.nombre,
          p.apellido_paterno,
          IFNULL(p.apellido_materno,'') AS apm
        FROM pacientes p
        ${q ? "WHERE (p.rut LIKE ? OR p.nombre LIKE ? OR p.apellido_paterno LIKE ? OR p.apellido_materno LIKE ?)" : ""}
        ORDER BY p.nombre, p.apellido_paterno
        LIMIT ?
      `,
        q ? [like(q), like(q), like(q), like(q), limit] : [limit]
      ),
      // Tipos de receta: usa tabla real si existe; si no, fallback consistente con Chile
      (async () => {
        const rows = await safeQuery<RowDataPacket[]>(
          `SELECT codigo, nombre
             FROM tipos_receta
            WHERE activo = 1
            ORDER BY orden, nombre`
        );
        if (rows.length) return rows;
        return [
          { codigo: "SIMPLE",  nombre: "Receta simple" },
          { codigo: "ANTIMIC", nombre: "Receta retenida (Antimicrobianos)" },
          { codigo: "CHEQPSI", nombre: "Receta cheque (Psicotrópicos)" },
          { codigo: "CHEQEST", nombre: "Receta cheque (Estupefacientes)" },
          { codigo: "MAG",     nombre: "Receta magistral" },
          { codigo: "RME",     nombre: "Receta médica electrónica (RME)" },
        ] as unknown as RowDataPacket[];
      })(),
      fetchMedicamentos(),
    ]);

    /* ------- map opciones ------- */
    const centros = centrosRows.map((c: any) => ({
      value: c.id_centro,
      label: c.nombre,
      id_centro: c.id_centro,
    }));

    const medicos = medicosRows.map((m: any) => ({
      value: m.id_medico,
      label: `${m.nombre} ${m.apellido_paterno} ${m.apm}`.replace(/\s+/g, " ").trim(),
      id_centro: m.id_centro,
    }));

    const pacientes = pacientesRows.map((p: any) => ({
      value: p.id_paciente,
      label: `${p.nombre} ${p.apellido_paterno} ${p.apm}${p.rut ? " • " + p.rut : ""}`
        .replace(/\s+/g, " ")
        .trim(),
      rut: p.rut ?? null,
    }));

    const tiposReceta = tiposRecetaRows.map((t: any) => ({
      value: t.codigo,
      label: t.nombre,
    }));

    const { medicamentos, labelColumn } = medicamentosBlock;

    /* ------- payload ------- */
    return NextResponse.json({
      success: true,
      centros,
      medicos,
      pacientes,
      tiposReceta,           // camelCase
      tipos_receta: tiposReceta, // snake_case por compat
      medicamentos,
      meta: {
        pacientes_limit: limit,
        medicamentos_label_column: labelColumn,
        filtered_by_centro: id_centro ? Number(id_centro) : null,
      },
      opciones: {
        centros,
        medicos,
        pacientes,
        tiposReceta,
        medicamentos,
      },
    });
  } catch (err: any) {
    console.error("GET /recetas-medicas/opciones error:", err);
    return NextResponse.json(
      { success: false, error: err?.sqlMessage ?? err?.message ?? "Error inesperado" },
      { status: 500 }
    );
  }
}
