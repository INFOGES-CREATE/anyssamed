// frontend/src/app/api/admin/telemedicina-sesiones/[id]/route.ts
import { NextResponse } from "next/server";
import pool from "@/lib/db";
import type { RowDataPacket, ResultSetHeader } from "mysql2/promise";

export const dynamic = "force-dynamic";

async function getCols(table: string): Promise<Set<string>> {
  const [rows]: any = await pool.query(`SHOW COLUMNS FROM ${table}`);
  return new Set((rows || []).map((r: any) => r.Field));
}

/* ===== GET detalle ===== */
export async function GET(_req: Request, { params }: { params: { id: string } }) {
  try {
    const id = Number(params.id);
    const cols = await getCols("telemedicina_sesiones");
    const selProv = cols.has("proveedor_servicio") ? "ts.proveedor_servicio" : "NULL";
    const selToken= cols.has("token_acceso") ? "ts.token_acceso" : "NULL";
    const selUrl  = cols.has("url_sesion") ? "ts.url_sesion" : "NULL";
    const selEstado = cols.has("estado") ? "ts.estado" : "NULL";

    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT
         ts.*, ${selProv} AS proveedor_servicio, ${selToken} AS token_acceso, ${selUrl} AS url_sesion, ${selEstado} AS estado,
         CONCAT(p.nombre,' ',p.apellido_paterno,' ',IFNULL(p.apellido_materno,'')) AS paciente_nombre, p.rut AS paciente_rut,
         CONCAT(u.nombre,' ',u.apellido_paterno,' ',IFNULL(u.apellido_materno,'')) AS medico_nombre,
         c.nombre AS centro_nombre, m.id_centro
       FROM telemedicina_sesiones ts
       JOIN pacientes p ON p.id_paciente = ts.id_paciente
       JOIN medicos m   ON m.id_medico   = ts.id_medico
       JOIN usuarios u  ON u.id_usuario  = m.id_usuario
       LEFT JOIN centros_medicos c ON c.id_centro = m.id_centro
       WHERE ts.id_sesion = ? LIMIT 1`, [id]
    );
    return NextResponse.json({ success:true, item: rows?.[0] ?? null });
  } catch (err:any) {
    console.error("GET /telemedicina-sesiones/:id error:", err);
    return NextResponse.json({ success:false, error: err?.message ?? "Error inesperado" }, { status:500 });
  }
}

/* ===== PUT actualizar / acciones rápidas ===== */
export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const conn = await pool.getConnection();
  try {
    const id = Number(params.id);
    const url = new URL(req.url);
    const action = url.searchParams.get("action"); // en_espera | en_curso | finalizada | cancelada
    const body = (await req.json().catch(()=> ({}))) || {};

    const cols = await getCols("telemedicina_sesiones");
    const patch: Record<string, any> = {};
    const trySet = (k:string, v:any) => { if (v !== undefined && cols.has(k)) patch[k] = v; };

    if (action && cols.has("estado")) {
      trySet("estado", action);
      if (action === "en_curso" && cols.has("fecha_hora_inicio_real")) patch["fecha_hora_inicio_real"] = new Date();
      if (action === "finalizada" && cols.has("fecha_hora_fin_real")) patch["fecha_hora_fin_real"] = new Date();
    }

    // Parches del body
    ["id_cita","id_paciente","id_medico","proveedor_servicio","id_sala_virtual","estado",
     "fecha_hora_inicio_programada","fecha_hora_fin_programada","fecha_hora_inicio_real","fecha_hora_fin_real",
     "token_acceso","url_sesion","calidad_conexion","grabacion_autorizada","notas_tecnicas"].forEach(k => {
      if (body[k] !== undefined) trySet(k, body[k]);
    });

    // Calcular duracion si tenemos ambas fechas reales
    if (cols.has("duracion_segundos") && (patch["fecha_hora_inicio_real"] || patch["fecha_hora_fin_real"])) {
      const [[cur]]: any = await conn.query<RowDataPacket[]>(`SELECT fecha_hora_inicio_real, fecha_hora_fin_real FROM telemedicina_sesiones WHERE id_sesion = ?`, [id]);
      const start = new Date(patch["fecha_hora_inicio_real"] ?? cur?.fecha_hora_inicio_real ?? null);
      const end   = new Date(patch["fecha_hora_fin_real"]   ?? cur?.fecha_hora_fin_real   ?? null);
      if (start instanceof Date && !Number.isNaN(start.getTime()) && end instanceof Date && !Number.isNaN(end.getTime())) {
        patch["duracion_segundos"] = Math.max(0, Math.floor((end.getTime() - start.getTime())/1000));
      }
    }

    if (!Object.keys(patch).length) return NextResponse.json({ success:false, error:"Nada que actualizar" }, { status:400 });

    await conn.beginTransaction();
    const setSql = Object.keys(patch).map(k=>`${k} = ?`).join(", ");
    await conn.query(`UPDATE telemedicina_sesiones SET ${setSql} WHERE id_sesion = ?`, [...Object.values(patch), id]);
    await conn.commit(); conn.release();
    return NextResponse.json({ success:true, id_sesion:id, updated: Object.keys(patch) });
  } catch (err:any) {
    try { await (conn as any).rollback(); (conn as any).release(); } catch {}
    console.error("PUT /telemedicina-sesiones/:id error:", err);
    return NextResponse.json({ success:false, error: err?.message ?? "Error inesperado" }, { status:500 });
  }
}

/* ===== DELETE: hard o soft ===== */
export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const conn = await pool.getConnection();
  try {
    const id = Number(params.id);
    const { searchParams } = new URL(req.url);
    const soft = searchParams.get("soft") !== "0"; // por defecto soft=true

    await conn.beginTransaction();
    if (soft) {
      // cancelación lógica
      const cols = await getCols("telemedicina_sesiones");
      if (cols.has("estado")) {
        await conn.query(`UPDATE telemedicina_sesiones SET estado='cancelada' WHERE id_sesion=?`, [id]);
      } else {
        await conn.query(`DELETE FROM telemedicina_sesiones WHERE id_sesion=?`, [id]);
      }
    } else {
      await conn.query(`DELETE FROM telemedicina_sesiones WHERE id_sesion=?`, [id]);
    }
    await conn.commit(); conn.release();
    return NextResponse.json({ success:true, id_sesion:id, soft });
  } catch (err:any) {
    try { await (conn as any).rollback(); (conn as any).release(); } catch {}
    console.error("DELETE /telemedicina-sesiones/:id error:", err);
    return NextResponse.json({ success:false, error: err?.message ?? "Error inesperado" }, { status:500 });
  }
}
