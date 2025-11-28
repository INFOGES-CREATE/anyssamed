// app/api/mensajes/whatsapp/archivar/route.ts
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { RowDataPacket, ResultSetHeader } from "mysql2";

// ========================================
// CONSTANTES
// ========================================

const SESSION_COOKIE_CANDIDATES = [
  "session",
  "session_token",
  "medisalud_session",
  "auth_session",
  "next-auth.session-token",
  "__Secure-next-auth.session-token",
];

// ========================================
// HELPER: Obtener Token de Sesión
// ========================================

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

// ========================================
// HELPER: Obtener Usuario Autenticado
// ========================================

async function obtenerUsuarioAutenticado(
  token: string
): Promise<{ id_usuario: number; rol: string } | null> {
  try {
    const [sesiones] = await pool.query<RowDataPacket[]>(
      `
      SELECT
        su.id_usuario,
        su.rol_en_sesion,
        u.estado
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
      return null;
    }

    return {
      id_usuario: sesiones[0].id_usuario,
      rol: sesiones[0].rol_en_sesion || "usuario",
    };
  } catch (error) {
    console.error("❌ Error al obtener usuario:", error);
    throw error;
  }
}

// ========================================
// HANDLER PUT - Archivar Conversación
// ========================================

export async function PUT(request: NextRequest) {
  try {
    // 1. Obtener token
    const sessionToken = getSessionToken(request);
    if (!sessionToken) {
      return NextResponse.json(
        {
          success: false,
          error: "No hay sesión activa",
          code: "NO_SESSION",
        },
        { status: 401 }
      );
    }

    // 2. Usuario autenticado
    const usuarioAuth = await obtenerUsuarioAutenticado(sessionToken);
    if (!usuarioAuth) {
      return NextResponse.json(
        {
          success: false,
          error: "Sesión inválida o expirada",
          code: "INVALID_SESSION",
        },
        { status: 401 }
      );
    }

    // 3. Parsear body
    const body = await request.json().catch(() => null);
    if (!body || !body.id_conversacion) {
      return NextResponse.json(
        { success: false, error: "ID de conversación requerido", code: "MISSING_FIELDS" },
        { status: 400 }
      );
    }

    const { id_conversacion } = body;

    // 4. Archivar conversación (simulado, luego será real)
    // En producción:
    // await pool.query(
    //   `UPDATE conversaciones_whatsapp
    //    SET estado = 'archivada', fecha_archivado = NOW()
    //    WHERE id_conversacion = ?
    //      AND (id_usuario_1 = ? OR id_usuario_2 = ?)`,
    //   [id_conversacion, usuarioAuth.id_usuario, usuarioAuth.id_usuario]
    // );

    return NextResponse.json(
      {
        success: true,
        message: "Conversación archivada correctamente",
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("❌ Error al archivar conversación:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Error al archivar conversación",
        code: "INTERNAL_ERROR",
        details:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}

// ========================================
// MÉTODOS NO PERMITIDOS
// ========================================

export async function GET() {
  return NextResponse.json(
    { success: false, error: "Método no permitido", code: "METHOD_NOT_ALLOWED" },
    { status: 405 }
  );
}

export async function POST() {
  return NextResponse.json(
    { success: false, error: "Método no permitido", code: "METHOD_NOT_ALLOWED" },
    { status: 405 }
  );
}

export async function DELETE() {
  return NextResponse.json(
    { success: false, error: "Método no permitido", code: "METHOD_NOT_ALLOWED" },
    { status: 405 }
  );
}
