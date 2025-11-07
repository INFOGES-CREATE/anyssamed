// frontend/src/app/api/admin/examenes-medicos/route.ts
import { NextResponse } from "next/server";
import pool from "@/lib/db";
import type { RowDataPacket, ResultSetHeader } from "mysql2/promise";

export const dynamic = "force-dynamic";

/* ============== Utils ============== */
const toInt = (v: any, d = 0) => (Number.isFinite(Number(v)) ? Number(v) : d);
const like = (s: string) => `%${s}%`;
const toNull = (v: any) =>
  v === "" || v === undefined || v === "null" || v === "undefined" ? null : v;

async function getCols(table: string): Promise<Set<string>> {
  const [rows]: any = await pool.query(`SHOW COLUMNS FROM ${table}`);
  return new Set((rows || []).map((r: any) => r.Field));
}
async function tableExists(table: string): Promise<boolean> {
  const [rows]: any = await pool.query(
    `SELECT 1 FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? LIMIT 1`,
    [table]
  );
  return rows.length > 0;
}
async function columnExists(table: string, column: string): Promise<boolean> {
  const [rows]: any = await pool.query(
    `SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS
     WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = ? LIMIT 1`,
    [table, column]
  );
  return rows.length > 0;
}
async function resolveCol(table: string, candidates: string[], fallback: string) {
  for (const c of candidates) {
    // eslint-disable-next-line no-await-in-loop
    if (await columnExists(table, c)) return c;
  }
  return fallback;
}
function pickExisting(obj: Record<string, any>, allowed: Set<string>) {
  const out: Record<string, any> = {};
  Object.keys(obj).forEach((k) => {
    if (allowed.has(k)) out[k] = obj[k];
  });
  return out;
}
function buildInsert(table: string, record: Record<string, any>) {
  const cols = Object.keys(record);
  const placeholders = cols.map(() => "?").join(", ");
  const sql = `INSERT INTO ${table} (${cols.join(", ")}) VALUES (${placeholders})`;
  const params = cols.map((c) => record[c]);
  return { sql, params };
}
const nowIso = () => new Date().toISOString().slice(0, 19).replace("T", " ");

function genNumeroOrden(prefix = "ORD") {
  const d = new Date();
  const pad = (n: number, w = 2) => String(n).padStart(w, "0");
  const ymd = `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}`;
  const hms = `${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`;
  const rnd = Math.random().toString(16).slice(2, 6).toUpperCase();
  return `${prefix}-${ymd}-${hms}-${rnd}`;
}

/* ============== GET (listado + filtros + stats) ============== */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const pagina = Math.max(1, toInt(searchParams.get("pagina") ?? searchParams.get("page") ?? 1));
    const pageSize = Math.min(500, Math.max(1, toInt(searchParams.get("pageSize") ?? 20)));
    const offset = (pagina - 1) * pageSize;

    const search = (searchParams.get("search") ?? searchParams.get("q") ?? "").trim();
    const fEstado = (searchParams.get("estado") ?? "").trim();
    const fPrioridad = (searchParams.get("prioridad") ?? "").trim();
    const fTipo = searchParams.get("id_tipo_examen") ? Number(searchParams.get("id_tipo_examen")) : null;
    const fCentro = searchParams.get("id_centro") ? Number(searchParams.get("id_centro")) : null;
    const fMedico = searchParams.get("id_medico") ? Number(searchParams.get("id_medico")) : null;
    const fPaciente = searchParams.get("id_paciente") ? Number(searchParams.get("id_paciente")) : null;
    const fDesde = (searchParams.get("desde") ?? "").trim();
    const fHasta = (searchParams.get("hasta") ?? "").trim();
    const fConRes = searchParams.get("con_resultados");
    const fPagado = searchParams.get("pagado");
    const fReqPrep = searchParams.get("requiere_preparacion");
    const fPrepConf = searchParams.get("confirmacion_preparacion");

    const estadoCol = await resolveCol("examenes_medicos", ["estado", "estado_examen"], "estado");
    const prioridadCol = await resolveCol("examenes_medicos", ["prioridad"], "prioridad");

    const hasPagado = await columnExists("examenes_medicos", "pagado");
    const hasReqPrep = await columnExists("examenes_medicos", "requiere_preparacion");
    const hasPrepConf = await columnExists("examenes_medicos", "confirmacion_preparacion");

    const teLabelCol = await resolveCol(
      "tipos_examenes",
      ["nombre", "nombre_examen", "descripcion", "titulo", "tipo_examen"],
      "nombre"
    );

    const labLabelCol =
      (await columnExists("integracion_laboratorios", "nombre_laboratorio")) ? "l.nombre_laboratorio"
      : (await columnExists("integracion_laboratorios", "nombre")) ? "l.nombre"
      : (await columnExists("integracion_laboratorios", "razon_social")) ? "l.razon_social"
      : (await columnExists("integracion_laboratorios", "descripcion")) ? "l.descripcion"
      : "NULL";

    const where: string[] = [];
    const params: any[] = [];

    if (search) {
      where.push(`(
        e.numero_orden LIKE ? OR
        p.rut LIKE ? OR p.nombre LIKE ? OR p.apellido_paterno LIKE ? OR p.apellido_materno LIKE ?
        OR te.codigo LIKE ? OR te.${teLabelCol} LIKE ?
      )`);
      params.push(like(search), like(search), like(search), like(search), like(search), like(search), like(search));
    }
    if (fEstado) { where.push(`e.${estadoCol} = ?`); params.push(fEstado); }
    if (fPrioridad) { where.push(`e.${prioridadCol} = ?`); params.push(fPrioridad); }
    if (fTipo) { where.push(`e.id_tipo_examen = ?`); params.push(fTipo); }
    if (fCentro) { where.push(`e.id_centro = ?`); params.push(fCentro); }
    if (fMedico) { where.push(`e.id_medico_solicitante = ?`); params.push(fMedico); }
    if (fPaciente) { where.push(`e.id_paciente = ?`); params.push(fPaciente); }
    if (fDesde) { where.push(`e.fecha_solicitud >= ?`); params.push(fDesde + (fDesde.length === 10 ? " 00:00:00" : "")); }
    if (fHasta) { where.push(`e.fecha_solicitud <= ?`); params.push(fHasta + (fHasta.length === 10 ? " 23:59:59" : "")); }
    if (fConRes === "1") where.push(`EXISTS (SELECT 1 FROM resultados_examenes r WHERE r.id_examen = e.id_examen)`);
    if (fConRes === "0") where.push(`NOT EXISTS (SELECT 1 FROM resultados_examenes r WHERE r.id_examen = e.id_examen)`);
    if (hasPagado && (fPagado === "1" || fPagado === "0")) { where.push(`e.pagado = ?`); params.push(Number(fPagado)); }
    if (hasReqPrep && (fReqPrep === "1" || fReqPrep === "0")) { where.push(`e.requiere_preparacion = ?`); params.push(Number(fReqPrep)); }
    if (hasPrepConf && (fPrepConf === "1" || fPrepConf === "0")) { where.push(`e.confirmacion_preparacion = ?`); params.push(Number(fPrepConf)); }

    const WHERE = where.length ? `WHERE ${where.join(" AND ")}` : "";

    // total
    const [tot] = await pool.query<RowDataPacket[]>(
      `SELECT COUNT(*) AS total
       FROM examenes_medicos e
       JOIN pacientes p ON p.id_paciente = e.id_paciente
       JOIN tipos_examenes te ON te.id_tipo_examen = e.id_tipo_examen
       JOIN medicos m ON m.id_medico = e.id_medico_solicitante
       JOIN usuarios u ON u.id_usuario = m.id_usuario
       JOIN centros_medicos c ON c.id_centro = e.id_centro
       LEFT JOIN integracion_laboratorios l ON l.id_integracion = e.id_laboratorio
       ${WHERE}`,
      params
    );
    const total = Number(tot?.[0]?.total ?? 0);

    // listado
    const [rows] = await pool.query<RowDataPacket[]>(
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
      ${WHERE}
      ORDER BY e.fecha_solicitud DESC, e.id_examen DESC
      LIMIT ? OFFSET ?`,
      [...params, pageSize, offset]
    );

    // stats
    const [st] = await pool.query<RowDataPacket[]>(
      `
      SELECT
        COUNT(*) AS total_examenes,
        SUM(CASE WHEN e.${estadoCol}='solicitado' THEN 1 ELSE 0 END) AS s_solicitado,
        SUM(CASE WHEN e.${estadoCol}='programado' THEN 1 ELSE 0 END) AS s_programado,
        SUM(CASE WHEN e.${estadoCol}='realizado' THEN 1 ELSE 0 END) AS s_realizado,
        SUM(CASE WHEN e.${estadoCol}='resultados_disponibles' THEN 1 ELSE 0 END) AS s_resultados,
        SUM(CASE WHEN e.${estadoCol}='cancelado' THEN 1 ELSE 0 END) AS s_cancelado,
        SUM(CASE WHEN e.${estadoCol}='anulado' THEN 1 ELSE 0 END) AS s_anulado,
        SUM(CASE WHEN e.${prioridadCol}='normal' THEN 1 ELSE 0 END) AS p_normal,
        SUM(CASE WHEN e.${prioridadCol}='urgente' THEN 1 ELSE 0 END) AS p_urgente,
        SUM(CASE WHEN e.${prioridadCol}='critica' THEN 1 ELSE 0 END) AS p_critica,
        SUM(CASE WHEN EXISTS(SELECT 1 FROM resultados_examenes r WHERE r.id_examen = e.id_examen) THEN 1 ELSE 0 END) AS con_resultados,
        ${hasPagado ? "SUM(CASE WHEN e.pagado=1 THEN 1 ELSE 0 END)" : "0"} AS pagados,
        ${hasReqPrep ? "SUM(CASE WHEN e.requiere_preparacion=1 THEN 1 ELSE 0 END)" : "0"} AS requieren_preparacion,
        ${hasPrepConf ? "SUM(CASE WHEN e.confirmacion_preparacion=1 THEN 1 ELSE 0 END)" : "0"} AS prep_confirmada
      FROM examenes_medicos e
      ${WHERE}`,
      params
    );

    return NextResponse.json({
      success: true,
      examenes: rows,
      total,
      pagina,
      pageSize,
      stats: st?.[0] ?? null,
    });
  } catch (err: any) {
    console.error("GET /examenes-medicos error:", err);
    return NextResponse.json({ success: false, error: err?.message ?? "Error inesperado" }, { status: 500 });
  }
}

/* ============== POST (crear 1 o MUCHOS exámenes) ============== */
/**
 * Body single:
 * {
 *   id_paciente, id_tipo_examen, id_medico_solicitante, id_centro,
 *   estado?, prioridad?, numero_orden?, fecha_solicitud?, fecha_programada?, ...
 * }
 *
 * Body batch:
 * {
 *   id_paciente, id_medico_solicitante, id_centro,
 *   estado?, prioridad?, numero_orden?, fecha_solicitud?, motivo_solicitud?, diagnostico?, ...
 *   items: [{ id_tipo_examen, fecha_programada?, requiere_preparacion?, id_laboratorio?, costo?, ... }, ...]
 * }
 */
export async function POST(req: Request) {
  const conn = await pool.getConnection();
  try {
    const body = await req.json();
    const isBatch = Array.isArray(body?.items) && body.items.length > 0;

    const must = (v: any, name: string) => {
      if (v == null || v === "") throw new Error(`Falta ${name}`);
      return v;
    };

    const cols = await getCols("examenes_medicos");
    const estadoCol = await resolveCol("examenes_medicos", ["estado", "estado_examen"], "estado");
    const prioridadCol = await resolveCol("examenes_medicos", ["prioridad"], "prioridad");

    // comparte número de orden entre todos los exámenes del lote
    const numero_orden_shared =
      (isBatch && typeof body?.numero_orden === "string" && body.numero_orden.trim()
        ? String(body.numero_orden)
        : null) || genNumeroOrden("ORD");

    await conn.beginTransaction();
    const created: number[] = [];

    if (isBatch) {
      const id_paciente = toInt(must(body.id_paciente, "id_paciente"));
      const id_medico_solicitante = toInt(must(body.id_medico_solicitante, "id_medico_solicitante"));
      const id_centro = toInt(must(body.id_centro, "id_centro"));

      const header: Record<string, any> = {
        id_paciente,
        id_medico_solicitante,
        id_centro,
        numero_orden: numero_orden_shared,
        [estadoCol]: String(body[estadoCol] ?? body.estado ?? "solicitado"),
        [prioridadCol]: String(body[prioridadCol] ?? body.prioridad ?? "normal"),
        fecha_solicitud: body.fecha_solicitud ? String(body.fecha_solicitud).slice(0, 19).replace("T", " ") : nowIso(),
        motivo_solicitud: toNull(body.motivo_solicitud),
        diagnostico: toNull(body.diagnostico),
        codigo_cie10: toNull(body.codigo_cie10),
        instrucciones_especificas: toNull(body.instrucciones_especificas),
        notas_tecnicas: toNull(body.notas_tecnicas),
        requiere_preparacion: body.requiere_preparacion ? 1 : 0,
        confirmacion_preparacion: body.confirmacion_preparacion ? 1 : 0,
        id_profesional_realiza: toNull(body.id_profesional_realiza),
        id_laboratorio: toNull(body.id_laboratorio),
        lugar_realizacion: toNull(body.lugar_realizacion),
        id_cita: toNull(body.id_cita),
        id_historial: toNull(body.id_historial),
        id_orden: toNull(body.id_orden),
        pagado: body.pagado ? 1 : 0,
        costo: toNull(body.costo),
        cubierto_seguro: body.cubierto_seguro ? 1 : 0,
      };

      const MAX = 200;
      const items = body.items.slice(0, MAX);

      for (const it of items) {
        const rec: Record<string, any> = {
          ...header,
          id_tipo_examen: toInt(must(it.id_tipo_examen, "id_tipo_examen")),
          fecha_programada: it.fecha_programada ? String(it.fecha_programada).slice(0, 19).replace("T", " ") : null,
          requiere_preparacion: it.requiere_preparacion != null ? (it.requiere_preparacion ? 1 : 0) : header.requiere_preparacion,
          confirmacion_preparacion: it.confirmacion_preparacion != null ? (it.confirmacion_preparacion ? 1 : 0) : header.confirmacion_preparacion,
          instrucciones_especificas: toNull(it.instrucciones_especificas) ?? header.instrucciones_especificas,
          notas_tecnicas: toNull(it.notas_tecnicas) ?? header.notas_tecnicas,
          id_laboratorio: toNull(it.id_laboratorio) ?? header.id_laboratorio,
          costo: toNull(it.costo) ?? header.costo,
        };

        const record = pickExisting(rec, cols);
        const colsArr = Object.keys(record);
        const placeholders = colsArr.map(() => "?").join(", ");
        const sql = `INSERT INTO examenes_medicos (${colsArr.join(", ")}) VALUES (${placeholders})`;
        const params = colsArr.map((k) => record[k]);

        const [res] = await conn.query<ResultSetHeader>(sql, params);
        created.push(Number(res.insertId));
      }
    } else {
      const id_paciente = toInt(must(body.id_paciente, "id_paciente"));
      const id_tipo_examen = toInt(must(body.id_tipo_examen, "id_tipo_examen"));
      const id_medico_solicitante = toInt(must(body.id_medico_solicitante, "id_medico_solicitante"));
      const id_centro = toInt(must(body.id_centro, "id_centro"));

      const rec: Record<string, any> = {
        id_paciente,
        id_tipo_examen,
        id_medico_solicitante,
        id_centro,
        numero_orden: typeof body?.numero_orden === "string" && body.numero_orden.trim()
          ? String(body.numero_orden)
          : numero_orden_shared,
        [estadoCol]: String(body[estadoCol] ?? body.estado ?? "solicitado"),
        [prioridadCol]: String(body[prioridadCol] ?? body.prioridad ?? "normal"),
        fecha_solicitud: body.fecha_solicitud ? String(body.fecha_solicitud).slice(0, 19).replace("T", " ") : nowIso(),
        fecha_programada: body.fecha_programada ? String(body.fecha_programada).slice(0, 19).replace("T", " ") : null,
        fecha_realizacion: body.fecha_realizacion ? String(body.fecha_realizacion).slice(0, 19).replace("T", " ") : null,
        motivo_solicitud: toNull(body.motivo_solicitud),
        diagnostico: toNull(body.diagnostico),
        codigo_cie10: toNull(body.codigo_cie10),
        instrucciones_especificas: toNull(body.instrucciones_especificas),
        notas_tecnicas: toNull(body.notas_tecnicas),
        id_profesional_realiza: toNull(body.id_profesional_realiza),
        id_laboratorio: toNull(body.id_laboratorio),
        lugar_realizacion: toNull(body.lugar_realizacion),
        id_cita: toNull(body.id_cita),
        id_historial: toNull(body.id_historial),
        id_orden: toNull(body.id_orden),
        pagado: body.pagado ? 1 : 0,
        costo: toNull(body.costo),
        cubierto_seguro: body.cubierto_seguro ? 1 : 0,
        requiere_preparacion: body.requiere_preparacion ? 1 : 0,
        confirmacion_preparacion: body.confirmacion_preparacion ? 1 : 0,
      };

      const record = pickExisting(rec, cols);
      const { sql, params } = buildInsert("examenes_medicos", record);
      const [res] = await conn.query<ResultSetHeader>(sql, params);
      created.push(Number((res as ResultSetHeader).insertId));
    }

    await conn.commit();
    return NextResponse.json({
      success: true,
      numero_orden: numero_orden_shared,
      created_ids: created,
      count: created.length,
    });
  } catch (err: any) {
    try { await (await pool.getConnection()).query("ROLLBACK"); } catch {}
    console.error("POST /examenes-medicos error:", err);
    return NextResponse.json(
      { success: false, error: err?.sqlMessage ?? err?.message ?? "Error inesperado" },
      { status: 400 }
    );
  } finally {
    try { (await pool.getConnection()).release(); } catch {}
  }
}
