// frontend/src/app/api/admin/telemedicina/join/[token]/route.ts
import { NextResponse } from "next/server";
import pool from "@/lib/db";
import type { RowDataPacket } from "mysql2/promise";

export const dynamic = "force-dynamic";
export const revalidate = 0;

/** Devuelve el set de columnas reales de una tabla (o set vacío si no existe) */
async function getCols(table: string): Promise<Set<string>> {
  try {
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT COLUMN_NAME
         FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ?`,
      [table]
    );
    return new Set((rows || []).map((r: any) => r.COLUMN_NAME));
  } catch {
    return new Set();
  }
}

export async function GET(
  _req: Request,
  { params }: { params: { token: string } }
) {
  try {
    const token = decodeURIComponent(params?.token ?? "").trim();
    if (!token) {
      return NextResponse.json(
        { success: false, error: "Token requerido" },
        { status: 400 }
      );
    }

    // Columnas disponibles (tolerante a tablas/columnas ausentes)
    const sesCols = await getCols("telemedicina_sesiones");
    const salasCols = await getCols("telemedicina_salas_virtuales");

    // Si no tenemos token_acceso, intentaremos fallback por url_sesion
    const hasToken = sesCols.has("token_acceso");
    const hasUrlSesion = sesCols.has("url_sesion");

    if (!hasToken && !hasUrlSesion) {
      return NextResponse.json(
        { success: false, error: "La tabla no tiene token_acceso ni url_sesion" },
        { status: 500 }
      );
    }

    // Partes dinámicas del SELECT
    const selectProv = sesCols.has("proveedor_servicio")
      ? "ts.proveedor_servicio"
      : "NULL";
    const selectUrl = hasUrlSesion ? "ts.url_sesion" : "NULL";
    const selectEstado = sesCols.has("estado") ? "ts.estado" : "NULL";

    // Candidatas a URL externa de la sesión, en ambas tablas
    const tsExternalCandidates = [
      "join_url",
      "meeting_url",
      "enlace",
      "url_externa",
      "link",
    ].filter((c) => sesCols.has(c)).map((c) => `ts.${c}`);

    const svExternalCandidates = [
      "join_url",
      "meeting_url",
      "enlace",
      "url",
      "url_externa",
      "link",
    ].filter((c) => salasCols.has(c)).map((c) => `sv.${c}`);

    const selectExternal =
      tsExternalCandidates.length + svExternalCandidates.length > 0
        ? `COALESCE(${[...tsExternalCandidates, ...svExternalCandidates].join(", ")})`
        : "NULL";

    const salasJoin =
      sesCols.has("id_sala_virtual") && salasCols.size
        ? `LEFT JOIN telemedicina_salas_virtuales sv
             ON sv.id_sala_virtual = ts.id_sala_virtual`
        : "";

    // WHERE dinámico (por token_acceso o por sufijo del path en url_sesion)
    let whereSql = "WHERE ts.token_acceso = ?";
    let whereParam: any = token;

    if (!hasToken && hasUrlSesion) {
      // Busca por URL que termine con /<token>
      whereSql = "WHERE ts.url_sesion LIKE ?";
      whereParam = `%/${token}`;
    }

    const sql = `
      SELECT
        ts.id_sesion, ts.id_cita, ts.id_paciente, ts.id_medico,
        ${selectProv}   AS proveedor_servicio,
        ${selectEstado} AS estado,
        ts.fecha_hora_inicio_programada, ts.fecha_hora_fin_programada,
        ${selectUrl}    AS url_sesion,
        ${selectExternal} AS join_url,
        CONCAT(p.nombre,' ',p.apellido_paterno,' ',IFNULL(p.apellido_materno,'')) AS paciente_nombre,
        p.rut AS paciente_rut,
        CONCAT(u.nombre,' ',u.apellido_paterno,' ',IFNULL(u.apellido_materno,'')) AS medico_nombre,
        c.nombre AS centro_nombre,
        m.id_centro
      FROM telemedicina_sesiones ts
      JOIN pacientes p ON p.id_paciente = ts.id_paciente
      JOIN medicos m   ON m.id_medico   = ts.id_medico
      JOIN usuarios u  ON u.id_usuario  = m.id_usuario
      LEFT JOIN centros_medicos c ON c.id_centro = m.id_centro
      ${salasJoin}
      ${whereSql}
      LIMIT 1
    `;

    const [rows] = await pool.query<RowDataPacket[]>(sql, [whereParam]);
    const r = rows?.[0] as any;
    if (!r) {
      return NextResponse.json(
        { success: false, error: "Sesión no encontrada o token inválido" },
        { status: 404 }
      );
    }

    const external_url: string | null = r.join_url ? String(r.join_url) : null;

    const sesion = {
      id_sesion: r.id_sesion,
      id_cita: r.id_cita ?? null,
      id_paciente: r.id_paciente,
      id_medico: r.id_medico,
      id_centro: r.id_centro ?? null,
      proveedor_servicio: r.proveedor_servicio ?? null,
      estado: r.estado ?? null,
      fecha_hora_inicio_programada: r.fecha_hora_inicio_programada,
      fecha_hora_fin_programada: r.fecha_hora_fin_programada,
      paciente_nombre: r.paciente_nombre,
      paciente_rut: r.paciente_rut ?? null,
      medico_nombre: r.medico_nombre,
      centro_nombre: r.centro_nombre ?? null,
      external_url,
      url_sesion: r.url_sesion ?? null,
    };

    return NextResponse.json({ success: true, sesion });
  } catch (err: any) {
    console.error("GET /api/admin/telemedicina/join/[token] error:", err);
    return NextResponse.json(
      { success: false, error: err?.sqlMessage ?? err?.message ?? "Error inesperado" },
      { status: 500 }
    );
  }
}
