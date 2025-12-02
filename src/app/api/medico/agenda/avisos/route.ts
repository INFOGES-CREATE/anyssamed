// app/api/medico/agenda/avisos/route.ts
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
    if (sesiones.length === 0)
      return NextResponse.json({ success: false, error: "Sesión inválida" }, { status: 401 });

    const medico = await obtenerMedicoPorUsuario(sesiones[0].id_usuario);
    if (!medico)
      return NextResponse.json({ success: false, error: "Médico no encontrado" }, { status: 403 });

    // citas de hoy sin confirmar
    const [sinConfirmar] = await pool.query<RowDataPacket[]>(
      `
      SELECT COUNT(*) AS total
      FROM citas
      WHERE id_medico = ?
        AND DATE(fecha_hora_inicio) = CURDATE()
        AND estado = 'programada'
        AND confirmado_por_paciente = 0
      `,
      [medico.id_medico]
    );

    // cancelaciones de hoy
    const [canceladas] = await pool.query<RowDataPacket[]>(
      `
      SELECT COUNT(*) AS total
      FROM citas
      WHERE id_medico = ?
        AND DATE(fecha_hora_inicio) = CURDATE()
        AND estado = 'cancelada'
      `,
      [medico.id_medico]
    );

    // telemedicina de hoy
    const [telemed] = await pool.query<RowDataPacket[]>(
      `
      SELECT COUNT(*) AS total
      FROM citas
      WHERE id_medico = ?
        AND DATE(fecha_hora_inicio) = CURDATE()
        AND tipo_cita = 'telemedicina'
      `,
      [medico.id_medico]
    );

    const avisos = [];

    if (sinConfirmar[0].total > 0) {
      avisos.push({
        tipo: "pendientes",
        mensaje: `${sinConfirmar[0].total} citas de hoy no están confirmadas`,
        nivel: "warning",
      });
    }

    if (canceladas[0].total > 0) {
      avisos.push({
        tipo: "canceladas",
        mensaje: `${canceladas[0].total} citas de hoy fueron canceladas`,
        nivel: "danger",
      });
    }

    if (telemed[0].total > 0) {
      avisos.push({
        tipo: "telemedicina",
        mensaje: `Tienes ${telemed[0].total} citas de telemedicina hoy`,
        nivel: "info",
      });
    }

    return NextResponse.json(
      {
        success: true,
        data: avisos,
      },
      { status: 200 }
    );
  } catch (err: any) {
    console.error("GET /api/medico/agenda/avisos error:", err);
    return NextResponse.json(
      { success: false, error: "Error interno", details: err.message },
      { status: 500 }
    );
  }
}
