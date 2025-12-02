// app/api/medico/agenda/notificaciones/route.ts
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { RowDataPacket } from "mysql2";

const SESSION_COOKIE_CANDIDATES = [
  "session",
  "session_token",
  "medisalud_session",
  "auth_session",
  "next-auth.session-token",
  "__Secure-next-auth.session-token",
];

function getSessionToken(req: NextRequest): string | null {
  const cookieHeader = req.headers.get("cookie") || "";
  if (cookieHeader) {
    const cookies = cookieHeader
      .split(";")
      .map((c) => c.trim())
      .reduce((acc, c) => {
        const [k, ...rest] = c.split("=");
        acc[k] = rest.join("=");
        return acc;
      }, {} as Record<string, string>);
    for (const c of SESSION_COOKIE_CANDIDATES) {
      if (cookies[c]) return decodeURIComponent(cookies[c]);
    }
  }
  const auth = req.headers.get("authorization");
  if (auth?.startsWith("Bearer ")) return auth.slice(7);
  return null;
}

async function obtenerMedicoPorUsuario(idUsuario: number) {
  const [rows] = await pool.query<RowDataPacket[]>(
    `
    SELECT m.id_medico
    FROM medicos m
    WHERE m.id_usuario = ? AND m.estado = 'activo'
    LIMIT 1
    `,
    [idUsuario]
  );
  return rows[0] || null;
}

export async function GET(req: NextRequest) {
  try {
    const token = getSessionToken(req);
    if (!token) return NextResponse.json({ success: false, error: "No hay sesión" }, { status: 401 });

    const [sesiones] = await pool.query<RowDataPacket[]>(
      `
      SELECT su.id_usuario
      FROM sesiones_usuarios su
      INNER JOIN usuarios u ON su.id_usuario = u.id_usuario
      WHERE su.token = ?
        AND su.activa = 1
        AND su.fecha_expiracion > NOW()
        AND u.estado = 'activo'
      LIMIT 1
      `,
      [token]
    );
    if (sesiones.length === 0) {
      return NextResponse.json({ success: false, error: "Sesión inválida" }, { status: 401 });
    }

    const medico = await obtenerMedicoPorUsuario(sesiones[0].id_usuario);
    if (!medico) {
      return NextResponse.json({ success: false, error: "Médico no encontrado" }, { status: 403 });
    }

    // 1) cancelaciones recientes (últimas 12h)
    const [cancelaciones] = await pool.query<RowDataPacket[]>(
      `
      SELECT c.id_cancelacion, c.id_cita, c.fecha_cancelacion, c.motivo, ca.paciente_nombre
      FROM cancelaciones c
      INNER JOIN (
        SELECT ci.id_cita, CONCAT(p.nombre,' ',p.apellido_paterno) AS paciente_nombre
        FROM citas ci
        INNER JOIN pacientes p ON ci.id_paciente = p.id_paciente
        WHERE ci.id_medico = ?
      ) AS ca ON ca.id_cita = c.id_cita
      WHERE c.fecha_cancelacion >= (NOW() - INTERVAL 12 HOUR)
      ORDER BY c.fecha_cancelacion DESC
      LIMIT 10
      `,
      [medico.id_medico]
    );

    // 2) citas urgentes de hoy
    const [urgentes] = await pool.query<RowDataPacket[]>(
      `
      SELECT c.id_cita, c.fecha_hora_inicio, c.motivo,
             CONCAT(p.nombre,' ',p.apellido_paterno) AS paciente_nombre
      FROM citas c
      INNER JOIN pacientes p ON c.id_paciente = p.id_paciente
      WHERE c.id_medico = ?
        AND DATE(c.fecha_hora_inicio) = CURDATE()
        AND c.prioridad = 'urgente'
      ORDER BY c.fecha_hora_inicio ASC
      `,
      [medico.id_medico]
    );

    // 3) recordatorios fallidos (opcional)
    const [recordatorios] = await pool.query<RowDataPacket[]>(
      `
      SELECT r.id_recordatorio, r.fecha_programada, r.destinatario, r.tipo, r.estado,
             ci.id_cita
      FROM recordatorios r
      INNER JOIN citas ci ON r.id_cita = ci.id_cita
      WHERE ci.id_medico = ?
        AND r.estado IN ('fallido')
        AND r.fecha_programada >= (NOW() - INTERVAL 24 HOUR)
      ORDER BY r.fecha_programada DESC
      LIMIT 10
      `,
      [medico.id_medico]
    );

    // unificamos
    const notif: any[] = [];

    cancelaciones.forEach((c) => {
      notif.push({
        tipo: "cancelacion",
        mensaje: `Paciente canceló la cita (${c.motivo || "sin motivo"})`,
        paciente: c.paciente_nombre,
        id_cita: c.id_cita,
        fecha: c.fecha_cancelacion,
        nivel: "warning",
      });
    });

    urgentes.forEach((u) => {
      notif.push({
        tipo: "urgente",
        mensaje: `Cita urgente: ${u.paciente_nombre}`,
        id_cita: u.id_cita,
        fecha: u.fecha_hora_inicio,
        nivel: "danger",
      });
    });

    recordatorios.forEach((r) => {
      notif.push({
        tipo: "recordatorio_fallido",
        mensaje: `Recordatorio ${r.tipo} fallido a ${r.destinatario}`,
        id_cita: r.id_cita,
        fecha: r.fecha_programada,
        nivel: "info",
      });
    });

    // ordenar por fecha desc
    notif.sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());

    return NextResponse.json(
      {
        success: true,
        data: notif.slice(0, 20),
      },
      { status: 200 }
    );
  } catch (err: any) {
    console.error("GET /api/medico/agenda/notificaciones error:", err);
    return NextResponse.json(
      { success: false, error: "Error interno", details: err.message },
      { status: 500 }
    );
  }
}
