// app/api/medico/centro/salas/route.ts
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

function getSessionToken(request: NextRequest): string | null {
  const cookieHeader = request.headers.get("cookie") || "";
  if (cookieHeader) {
    const cookies = cookieHeader
      .split(";")
      .map((c) => c.trim())
      .reduce((acc, c) => {
        const [k, ...rest] = c.split("=");
        acc[k] = rest.join("=");
        return acc;
      }, {} as Record<string, string>);

    for (const name of SESSION_COOKIE_CANDIDATES) {
      if (cookies[name]) {
        return decodeURIComponent(cookies[name]);
      }
    }
  }
  const auth = request.headers.get("authorization");
  if (auth?.startsWith("Bearer ")) {
    return auth.slice(7);
  }
  return null;
}

export async function GET(request: NextRequest) {
  try {
    const sessionToken = getSessionToken(request);
    if (!sessionToken) {
      return NextResponse.json(
        { success: false, error: "No hay sesión" },
        { status: 401 }
      );
    }

    // sacar médico + centro desde la sesión
    const [rows] = await pool.query<RowDataPacket[]>(
      `
      SELECT m.id_profesional, m.id_centro_principal AS id_centro
      FROM sesiones_usuarios su
      INNER JOIN medicos m ON su.id_usuario = m.id_usuario
      WHERE su.token = ?
        AND su.activa = 1
        AND su.fecha_expiracion > NOW()
        AND m.estado = 'activo'
      LIMIT 1
      `,
      [sessionToken]
    );

    if (rows.length === 0) {
      return NextResponse.json(
        { success: false, error: "Sesión inválida o médico no activo" },
        { status: 401 }
      );
    }

    const idCentro = rows[0].id_centro;

    // traer salas activas de ese centro
    const [salas] = await pool.query<RowDataPacket[]>(
      `
      SELECT 
        id_sala,
        nombre,
        tipo,
        capacidad,
        piso,
        numero,
        estado
      FROM salas
      WHERE id_centro = ?
        AND estado = 'activa'
      ORDER BY nombre ASC
      `,
      [idCentro]
    );

    return NextResponse.json(
      {
        success: true,
        salas: salas.map((s) => ({
          id_sala: s.id_sala,
          nombre: s.nombre,
          tipo: s.tipo,
          capacidad: s.capacidad,
          piso: s.piso,
          numero: s.numero,
        })),
      },
      { status: 200 }
    );
  } catch (err: any) {
    console.error("Error al obtener salas:", err);
    return NextResponse.json(
      { success: false, error: "Error interno" },
      { status: 500 }
    );
  }
}
