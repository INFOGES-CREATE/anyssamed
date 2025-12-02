// app/api/medico/agenda/acciones/route.ts
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
    SELECT m.id_medico, m.id_centro_principal, c.plan
    FROM medicos m
    INNER JOIN centros_medicos c ON c.id_centro = m.id_centro_principal
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

    // puedes condicionar por plan
    const accionesBase = [
      {
        id: "nueva_cita",
        label: "Nueva cita",
        tipo: "modal",
        icon: "Plus",
      },
      {
        id: "bloques",
        label: "Bloques y disponibilidad",
        url: "/medico/agenda/bloques",
        icon: "Clock",
      },
      {
        id: "telemedicina",
        label: "Telemedicina",
        url: "/medico/telemedicina",
        icon: "Video",
      },
      {
        id: "pacientes",
        label: "Pacientes",
        url: "/medico/pacientes",
        icon: "Users",
      },
    ];

    // si el plan es enterprise le agregas más
    if (medico.plan === "enterprise") {
      accionesBase.push({
        id: "estadisticas",
        label: "Ver métricas",
        url: "/medico/estadisticas",
        icon: "BarChart3",
      });
    }

    return NextResponse.json(
      {
        success: true,
        data: accionesBase,
      },
      { status: 200 }
    );
  } catch (err: any) {
    console.error("GET /api/medico/agenda/acciones error:", err);
    return NextResponse.json(
      { success: false, error: "Error interno", details: err.message },
      { status: 500 }
    );
  }
}
