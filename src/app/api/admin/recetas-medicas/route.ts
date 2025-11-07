//frontend\src\app\api\admin\recetas-medicas\route.ts

import { NextResponse } from "next/server";
import pool from "@/lib/db";
import type { RowDataPacket, ResultSetHeader } from "mysql2/promise";

export const dynamic = "force-dynamic";

// Utils
const toInt = (v: any, d = 0) => (Number.isFinite(Number(v)) ? Number(v) : d);
const like = (s: string) => `%${s}%`;

async function colExists(table: string, col: string) {
  try {
    const [rows]: any = await pool.query(`SHOW COLUMNS FROM ${table} LIKE ?`, [col]);
    return rows?.length > 0;
  } catch { return false; }
}

async function getCols(table: string): Promise<Set<string>> {
  const [rows]: any = await pool.query(`SHOW COLUMNS FROM ${table}`);
  return new Set((rows || []).map((r: any) => r.Field));
}

// ================= GET (list) =================
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const pagina   = Math.max(1, toInt(searchParams.get("pagina") ?? searchParams.get("page") ?? 1));
    const pageSize = Math.min(100, Math.max(1, toInt(searchParams.get("pageSize") ?? 20)));
    const offset   = (pagina - 1) * pageSize;

    const search   = (searchParams.get("search") ?? searchParams.get("q") ?? "").trim();
    const estado   = (searchParams.get("estado") ?? "").trim();
    const tipo     = (searchParams.get("tipo_receta") ?? searchParams.get("tipo") ?? "").trim();
    const idCentro = searchParams.get("id_centro")   ? Number(searchParams.get("id_centro"))   : null;
    const idMedico = searchParams.get("id_medico")   ? Number(searchParams.get("id_medico"))   : null;
    const idPaciente = searchParams.get("id_paciente") ? Number(searchParams.get("id_paciente")) : null;
    const desde    = (searchParams.get("desde") ?? "").trim();
    const hasta    = (searchParams.get("hasta") ?? "").trim();

    const where: string[] = [];
    const params: any[] = [];

    if (search) {
      where.push(`(
        p.rut LIKE ? OR p.nombre LIKE ? OR p.apellido_paterno LIKE ? OR p.apellido_materno LIKE ?
        OR rm.numero_receta LIKE ? OR rm.titulo LIKE ?
        OR CONCAT(mu.nombre,' ',mu.apellido_paterno,' ',IFNULL(mu.apellido_materno,'')) LIKE ?
      )`);
      params.push(like(search), like(search), like(search), like(search), like(search), like(search), like(search));
    }
    if (estado && await colExists("recetas_medicas", "estado")) { where.push(`rm.estado = ?`); params.push(estado); }
    if (tipo   && await colExists("recetas_medicas", "tipo_receta")) { where.push(`rm.tipo_receta = ?`); params.push(tipo); }
    if (idCentro)   { where.push(`rm.id_centro = ?`); params.push(idCentro); }
    if (idMedico)   { where.push(`rm.id_medico = ?`); params.push(idMedico); }
    if (idPaciente) { where.push(`rm.id_paciente = ?`); params.push(idPaciente); }
    if (desde && await colExists("recetas_medicas","fecha_emision")) { where.push(`rm.fecha_emision >= ?`); params.push(desde); }
    if (hasta && await colExists("recetas_medicas","fecha_emision")) { where.push(`rm.fecha_emision <= ?`); params.push(hasta); }
    const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";

    // ------- Conteo y stats -------
    // Si existe columna estado -> agrupa; si no, solo total
    let stats = { total: 0, emitidas: 0, parciales: 0, dispensadas: 0, anuladas: 0 };
    if (await colExists("recetas_medicas","estado")) {
      const [cnt]: any = await pool.query(
        `SELECT 
           COUNT(*) AS total,
           SUM(CASE WHEN rm.estado='emitida' THEN 1 ELSE 0 END) AS emitidas,
           SUM(CASE WHEN rm.estado='parcial' THEN 1 ELSE 0 END) AS parciales,
           SUM(CASE WHEN rm.estado='dispensada' THEN 1 ELSE 0 END) AS dispensadas,
           SUM(CASE WHEN rm.estado='anulada' THEN 1 ELSE 0 END) AS anuladas
         FROM recetas_medicas rm
         JOIN pacientes p ON p.id_paciente = rm.id_paciente
         JOIN medicos md  ON md.id_medico  = rm.id_medico
         JOIN usuarios mu ON mu.id_usuario = md.id_usuario
         JOIN centros_medicos c ON c.id_centro = rm.id_centro
         ${whereSql}`, params
      );
      stats = {
        total: Number(cnt?.[0]?.total ?? 0),
        emitidas: Number(cnt?.[0]?.emitidas ?? 0),
        parciales: Number(cnt?.[0]?.parciales ?? 0),
        dispensadas: Number(cnt?.[0]?.dispensadas ?? 0),
        anuladas: Number(cnt?.[0]?.anuladas ?? 0),
      };
    } else {
      const [cnt]: any = await pool.query(
        `SELECT COUNT(*) AS total
         FROM recetas_medicas rm
         JOIN pacientes p ON p.id_paciente = rm.id_paciente
         JOIN medicos md  ON md.id_medico  = rm.id_medico
         JOIN usuarios mu ON mu.id_usuario = md.id_usuario
         JOIN centros_medicos c ON c.id_centro = rm.id_centro
         ${whereSql}`, params
      );
      stats.total = Number(cnt?.[0]?.total ?? 0);
    }

    // ------- Data principal (con agregados del detalle) -------
    const fechaSel = (await colExists("recetas_medicas","fecha_emision")) ? "rm.fecha_emision" : "rm.fecha_creacion";
    const numeroSel = (await colExists("recetas_medicas","numero_receta")) ? "rm.numero_receta" : "NULL";

    const dataSql = `
      SELECT
        rm.id_receta,
        rm.id_paciente,
        rm.id_medico,
        rm.id_centro,
        ${fechaSel} AS fecha_emision,
        ${numeroSel} AS numero_receta,
        ${await colExists("recetas_medicas","tipo_receta") ? "rm.tipo_receta" : "NULL"} AS tipo_receta,
        ${await colExists("recetas_medicas","estado") ? "rm.estado" : "NULL"} AS estado,
        ${await colExists("recetas_medicas","titulo") ? "rm.titulo" : "NULL"} AS titulo,
        p.rut AS paciente_rut,
        CONCAT(p.nombre,' ',p.apellido_paterno,' ',IFNULL(p.apellido_materno,'')) AS paciente_nombre,
        CONCAT(mu.nombre,' ',mu.apellido_paterno,' ',IFNULL(mu.apellido_materno,'')) AS medico_nombre,
        c.nombre AS centro_nombre,
        COALESCE(ri.items_total, 0) AS items_total,
        COALESCE(ri.items_controlados, 0) AS items_controlados,
        COALESCE(ri.items_dispensados, 0) AS items_dispensados
      FROM recetas_medicas rm
      JOIN pacientes p ON p.id_paciente = rm.id_paciente
      JOIN medicos md  ON md.id_medico  = rm.id_medico
      JOIN usuarios mu ON mu.id_usuario = md.id_usuario
      JOIN centros_medicos c ON c.id_centro = rm.id_centro
      LEFT JOIN (
        SELECT id_receta,
               COUNT(*) AS items_total,
               SUM(CASE WHEN es_controlado=1 THEN 1 ELSE 0 END) AS items_controlados,
               SUM(CASE WHEN dispensado=1 THEN 1 ELSE 0 END) AS items_dispensados
        FROM receta_medicamentos
        GROUP BY id_receta
      ) ri ON ri.id_receta = rm.id_receta
      ${whereSql}
      ORDER BY ${fechaSel} DESC, rm.id_receta DESC
      LIMIT ? OFFSET ?
    `;
    const [rows] = await pool.query<RowDataPacket[]>(dataSql, [...params, pageSize, offset]);

    return NextResponse.json({
      success: true,
      pagina,
      pageSize,
      total: stats.total,
      stats,
      items: rows,
    });
  } catch (err: any) {
    console.error("GET /recetas-medicas error:", err);
    return NextResponse.json({ success: false, error: err?.message ?? "Error inesperado" }, { status: 500 });
  }
}

// ================ POST (crear receta + items) ================
export async function POST(req: Request) {
  const conn = await pool.getConnection();
  try {
    const body = await req.json();

    // Requeridos mínimos para maestro
    const id_centro   = body.id_centro;
    const id_paciente = body.id_paciente;
    const id_medico   = body.id_medico;
    const fecha_emision = body.fecha_emision ?? body.fecha ? null : null; // si no envían, confía en default/trigger

    if (!id_centro || !id_paciente || !id_medico) {
      return NextResponse.json({ success: false, error: "Faltan: id_centro, id_paciente, id_medico" }, { status: 400 });
    }

    const masterCols = await getCols("recetas_medicas");
    const candidates: Record<string, any> = {
      id_centro, id_paciente, id_medico,
      fecha_emision,
      numero_receta: body.numero_receta ?? null,
      tipo_receta: body.tipo_receta ?? null,
      titulo: body.titulo ?? null,
      estado: body.estado ?? "emitida",
      diagnosticos: body.diagnosticos ?? null,
      indicaciones_generales: body.indicaciones_generales ?? null,
      es_confidencial: body.es_confidencial ?? null,
      es_controlada: body.es_controlada ?? null,
      id_historial: body.id_historial ?? null,
      creado_por: body.creado_por ?? null,
    };

    const fields: string[] = [];
    const values: any[] = [];
    Object.entries(candidates).forEach(([k, v]) => {
      if (v !== undefined && masterCols.has(k)) {
        fields.push(k);
        values.push(v);
      }
    });

    if (!fields.length) {
      return NextResponse.json({ success: false, error: "No hay columnas válidas para insertar en recetas_medicas" }, { status: 400 });
    }

    await conn.beginTransaction();

    const [ins]: any = await conn.query<ResultSetHeader>(
      `INSERT INTO recetas_medicas (${fields.join(",")}) VALUES (${fields.map(()=>"?").join(",")})`,
      values
    );
    const id_receta = ins.insertId;

    // Inserta items (usa tu tabla exacta receta_medicamentos)
    const items: any[] = Array.isArray(body.items) ? body.items : [];
    if (items.length) {
      const sqlItem = `
        INSERT INTO receta_medicamentos
          (id_receta, id_medicamento, nombre_medicamento, dosis, frecuencia, duracion,
           cantidad, unidad, via_administracion, instrucciones, es_controlado,
           codigo_medicamento, dispensado, fecha_dispensacion, dispensado_por, observaciones_dispensacion)
        VALUES
          (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      for (const it of items) {
        await conn.query(sqlItem, [
          id_receta,
          it.id_medicamento ?? null,
          it.nombre_medicamento ?? "",
          it.dosis ?? "",
          it.frecuencia ?? "",
          it.duracion ?? null,
          toInt(it.cantidad ?? 0, 0),
          it.unidad ?? "",
          it.via_administracion ?? "",
          it.instrucciones ?? null,
          it.es_controlado ? 1 : 0,
          it.codigo_medicamento ?? null,
          it.dispensado ? 1 : 0,
          it.fecha_dispensacion ?? null,
          it.dispensado_por ?? null,
          it.observaciones_dispensacion ?? null,
        ]);
      }
    }

    await conn.commit();
    conn.release();
    return NextResponse.json({ success: true, id_receta, items_insertados: items.length });
  } catch (err: any) {
    try { await conn.rollback(); conn.release(); } catch {}
    console.error("POST /recetas-medicas error:", err);
    return NextResponse.json({ success: false, error: err?.message ?? "Error inesperado" }, { status: 500 });
  }
}
