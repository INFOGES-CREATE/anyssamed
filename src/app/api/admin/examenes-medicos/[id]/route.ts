import { NextResponse } from "next/server";
import pool from "@/lib/db";
import type { RowDataPacket } from "mysql2/promise";

export const dynamic = "force-dynamic";

/* Utils */
async function safeQuery<T extends RowDataPacket[]>(sql: string, params: any[] = []): Promise<T> {
  try {
    const [rows] = await pool.query<T>(sql, params);
    return rows;
  } catch (e) {
    console.warn("[examenes-medicos/:id] safeQuery:", (e as any)?.message || e);
    return [] as unknown as T;
  }
}
async function columnExists(table: string, column: string): Promise<boolean> {
  try {
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS
       WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = ? LIMIT 1`,
      [table, column]
    );
    return rows.length > 0;
  } catch {
    return false;
  }
}
async function resolveCol(table: string, candidates: string[], fallback: string): Promise<string> {
  for (const c of candidates) {
    // eslint-disable-next-line no-await-in-loop
    if (await columnExists(table, c)) return c;
  }
  return fallback;
}

/* ===== GET detalle ===== */
export async function GET(_req: Request, { params }: { params: { id: string } }) {
  try {
    const id = Number(params.id);
    if (!Number.isFinite(id)) return NextResponse.json({ success: false, error: "ID inválido" }, { status: 400 });

    const teLabelCol = await resolveCol("tipos_examenes", ["nombre", "nombre_examen", "descripcion", "titulo", "tipo_examen"], "nombre");
    const labLabelCol = (await columnExists("integracion_laboratorios", "nombre_laboratorio"))
      ? "l.nombre_laboratorio"
      : (await columnExists("integracion_laboratorios", "nombre")) ? "l.nombre"
      : (await columnExists("integracion_laboratorios", "razon_social")) ? "l.razon_social"
      : (await columnExists("integracion_laboratorios", "descripcion")) ? "l.descripcion"
      : "NULL";

    const rows = await safeQuery<RowDataPacket[]>(
      `
      SELECT
        e.*,
        p.rut AS paciente_rut,
        CONCAT(p.nombre,' ',p.apellido_paterno,' ',IFNULL(p.apellido_materno,'')) AS paciente_nombre,
        te.${teLabelCol} AS tipo_examen_nombre,
        te.codigo AS tipo_examen_codigo,
        te.categoria AS tipo_examen_categoria,
        CONCAT(u.nombre,' ',u.apellido_paterno,' ',IFNULL(u.apellido_materno,'')) AS medico_nombre,
        c.nombre AS centro_nombre,
        ${labLabelCol} AS nombre_laboratorio,
        (SELECT COUNT(*) FROM resultados_examenes r WHERE r.id_examen = e.id_examen) AS resultados_count
      FROM examenes_medicos e
      JOIN pacientes p ON p.id_paciente = e.id_paciente
      JOIN tipos_examenes te ON te.id_tipo_examen = e.id_tipo_examen
      JOIN medicos m ON m.id_medico = e.id_medico_solicitante
      JOIN usuarios u ON u.id_usuario = m.id_usuario
      JOIN centros_medicos c ON c.id_centro = e.id_centro
      LEFT JOIN integracion_laboratorios l ON l.id_integracion = e.id_laboratorio
      WHERE e.id_examen = ?
      LIMIT 1
      `,
      [id]
    );

    if (!rows.length) return NextResponse.json({ success: false, error: "No encontrado" }, { status: 404 });

    const resultados = await safeQuery<RowDataPacket[]>(
      `
      SELECT id_resultado, id_examen, titulo, formato, estado, es_critico, fecha_resultado
      FROM resultados_examenes
      WHERE id_examen = ?
      ORDER BY fecha_resultado DESC, id_resultado DESC
      `,
      [id]
    );

    return NextResponse.json({ success: true, examen: rows[0], resultados });
  } catch (err: any) {
    console.error("GET /examenes-medicos/:id error:", err);
    return NextResponse.json({ success: false, error: err?.message || "Error" }, { status: 500 });
  }
}

/* ===== PUT actualizar (parcial) ===== */
export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const conn = await pool.getConnection();
  try {
    const id = Number(params.id);
    if (!Number.isFinite(id)) return NextResponse.json({ success: false, error: "ID inválido" }, { status: 400 });

    const body = await req.json();
    const [colsRows] = await pool.query<RowDataPacket[]>(
      `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS
       WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'examenes_medicos'`
    );
    const cols = new Set(colsRows.map((r: any) => String(r.COLUMN_NAME)));

    // armar SET dinâmico
    const updates: string[] = [];
    const paramsArr: any[] = [];
    Object.keys(body || {}).forEach((k) => {
      if (cols.has(k)) {
        updates.push(`${k} = ?`);
        paramsArr.push(body[k]);
      }
    });

    if (!updates.length) return NextResponse.json({ success: false, error: "Nada para actualizar" }, { status: 400 });

    await conn.beginTransaction();
    await conn.query(`UPDATE examenes_medicos SET ${updates.join(", ")} WHERE id_examen = ?`, [...paramsArr, id]);
    await conn.commit();

    return NextResponse.json({ success: true });
  } catch (err: any) {
    try { await (pool as any).rollback?.(); } catch {}
    console.error("PUT /examenes-medicos/:id error:", err);
    return NextResponse.json({ success: false, error: err?.sqlMessage ?? err?.message ?? "Error" }, { status: 400 });
  } finally {
    try { conn.release(); } catch {}
  }
}

/* ===== DELETE ===== */
export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  try {
    const id = Number(params.id);
    if (!Number.isFinite(id)) return NextResponse.json({ success: false, error: "ID inválido" }, { status: 400 });
    const [res] = await pool.query<any>(`DELETE FROM examenes_medicos WHERE id_examen = ?`, [id]);
    if (res.affectedRows === 0) return NextResponse.json({ success: false, error: "No encontrado" }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("DELETE /examenes-medicos/:id error:", err);
    return NextResponse.json({ success: false, error: err?.sqlMessage ?? err?.message ?? "Error" }, { status: 400 });
  }
}
