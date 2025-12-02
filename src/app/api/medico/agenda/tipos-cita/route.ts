// app/api/medico/agenda/tipos-cita/route.ts
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
      .filter(Boolean)
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
        { success: false, error: "No hay sesión activa" },
        { status: 401 }
      );
    }

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
      [sessionToken]
    );

    if (sesiones.length === 0) {
      return NextResponse.json(
        { success: false, error: "Sesión inválida" },
        { status: 401 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const idCentro = searchParams.get("id_centro");

    if (!idCentro) {
      return NextResponse.json(
        { success: false, error: "ID de centro requerido" },
        { status: 400 }
      );
    }

    const [tipos] = await pool.query<RowDataPacket[]>(
      `
      SELECT 
        id_tipo_cita,
        nombre,
        descripcion,
        duracion_predeterminada,
        color,
        precio_sugerido,
        requiere_preparacion,
        instrucciones_preparacion,
        visible_web,
        activo
      FROM tipos_cita
      WHERE id_centro = ? AND activo = 1
      ORDER BY nombre ASC
      `,
      [idCentro]
    );

    await pool.query(
      `UPDATE sesiones_usuarios SET ultima_actividad = NOW() WHERE token = ?`,
      [sessionToken]
    );

    return NextResponse.json(
      {
        success: true,
        tipos: tipos.map((t) => ({
          id_tipo_cita: t.id_tipo_cita,
          nombre: t.nombre,
          descripcion: t.descripcion,
          duracion_predeterminada: t.duracion_predeterminada,
          color: t.color,
          precio_sugerido: parseFloat(t.precio_sugerido || 0),
          requiere_preparacion: t.requiere_preparacion === 1,
          instrucciones_preparacion: t.instrucciones_preparacion,
          visible_web: t.visible_web === 1,
        })),
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("❌ Error en GET /api/medico/agenda/tipos-cita:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Error interno del servidor",
        details: process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}