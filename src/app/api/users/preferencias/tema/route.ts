// frontend/src/app/api/users/preferencias/tema/route.ts
import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { RowDataPacket, ResultSetHeader } from "mysql2";

// ================================
// MISMOS CANDIDATOS DE COOKIE
// ================================
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

// ================================
// GET: obtener tema del usuario
// ================================
export async function GET(request: NextRequest) {
  try {
    const sessionToken = getSessionToken(request);

    if (!sessionToken) {
      return NextResponse.json(
        { success: false, error: "No hay sesión activa" },
        { status: 401 }
      );
    }

    // validar sesión
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
        { success: false, error: "Sesión inválida o expirada" },
        { status: 401 }
      );
    }

    const idUsuario = sesiones[0].id_usuario;

    // actualizar última actividad
    await pool.query(
      `UPDATE sesiones_usuarios SET ultima_actividad = NOW() WHERE token = ?`,
      [sessionToken]
    );

    // traer preferencias
    const [prefs] = await pool.query<RowDataPacket[]>(
      `
      SELECT tema_color
      FROM preferencias_usuarios
      WHERE id_usuario = ?
      LIMIT 1
      `,
      [idUsuario]
    );

    // si no tiene fila, devolvemos dark (tu defecto real)
    const tema = prefs.length > 0 ? prefs[0].tema_color : "dark";

    return NextResponse.json(
      {
        success: true,
        id_usuario: idUsuario,
        tema_color: tema,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("❌ Error en GET /api/users/preferencias/tema:", error);
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

// ================================
// PUT: guardar / actualizar tema
// ================================
export async function PUT(request: NextRequest) {
  try {
    const sessionToken = getSessionToken(request);

    if (!sessionToken) {
      return NextResponse.json(
        { success: false, error: "No hay sesión activa" },
        { status: 401 }
      );
    }

    // validar sesión
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
        { success: false, error: "Sesión inválida o expirada" },
        { status: 401 }
      );
    }

    const idUsuario = sesiones[0].id_usuario;

    const body = await request.json();
    const tema = body?.tema_color as
      | "light"
      | "dark"
      | "blue"
      | "purple"
      | "green"
      | undefined;

    if (!tema) {
      return NextResponse.json(
        { success: false, error: "tema_color es requerido" },
        { status: 400 }
      );
    }

    // upsert en preferencias_usuarios
    await pool.query<ResultSetHeader>(
      `
      INSERT INTO preferencias_usuarios (id_usuario, tema_color)
      VALUES (?, ?)
      ON DUPLICATE KEY UPDATE
        tema_color = VALUES(tema_color),
        fecha_actualizacion = CURRENT_TIMESTAMP
      `,
      [idUsuario, tema]
    );

    // actualizar última actividad
    await pool.query(
      `UPDATE sesiones_usuarios SET ultima_actividad = NOW() WHERE token = ?`,
      [sessionToken]
    );

    return NextResponse.json(
      {
        success: true,
        message: "Preferencia de tema actualizada",
        tema_color: tema,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("❌ Error en PUT /api/users/preferencias/tema:", error);
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
