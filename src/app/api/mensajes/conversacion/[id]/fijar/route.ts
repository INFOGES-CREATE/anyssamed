// app/api/mensajes/conversacion/[id]/fijar/route.ts
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { RowDataPacket } from "mysql2";

// ========================================
// TIPOS
// ========================================

interface FijarBody {
  fijada: boolean;
}

// ========================================
// HELPER PARA OBTENER EL TOKEN
// ========================================

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

// ========================================
// FUNCIONES AUXILIARES
// ========================================

async function obtenerUsuarioAutenticado(token: string): Promise<number | null> {
  try {
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
      return null;
    }

    return sesiones[0].id_usuario;
  } catch (error) {
    console.error("Error al obtener usuario:", error);
    throw error;
  }
}

/**
 * Actualiza el estado de fijado de la conversación
 */
async function actualizarEstadoFijado(
  idConversacion: string,
  idUsuario: number,
  fijada: boolean
): Promise<void> {
  try {
    // Simulación de actualización
    // En producción, esto debería guardarse en una tabla de preferencias
    console.log(`Conversación ${idConversacion} ${fijada ? 'fijada' : 'desfijada'} por usuario ${idUsuario}`);
  } catch (error) {
    console.error("Error al actualizar estado fijado:", error);
    throw error;
  }
}

// ========================================
// HANDLER PUT - Fijar/Desfijar conversación
// ========================================

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const idConversacion = params.id;

    // 1. Obtener token
    const sessionToken = getSessionToken(request);

    if (!sessionToken) {
      return NextResponse.json(
        {
          success: false,
          error: "No hay sesión activa",
        },
        { status: 401 }
      );
    }

    // 2. Verificar sesión
    const idUsuario = await obtenerUsuarioAutenticado(sessionToken);

    if (!idUsuario) {
      return NextResponse.json(
        {
          success: false,
          error: "Sesión inválida o expirada",
        },
        { status: 401 }
      );
    }

    // 3. Obtener body
    const body: FijarBody = await request.json();

    if (typeof body.fijada !== "boolean") {
      return NextResponse.json(
        {
          success: false,
          error: "El campo 'fijada' es requerido y debe ser booleano",
        },
        { status: 400 }
      );
    }

    // 4. Actualizar estado
    await actualizarEstadoFijado(idConversacion, idUsuario, body.fijada);

    // 5. Respuesta exitosa
    return NextResponse.json(
      {
        success: true,
        message: body.fijada 
          ? "Conversación fijada exitosamente" 
          : "Conversación desfijada exitosamente",
        fijada: body.fijada,
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("❌ Error en PUT fijar:", error);

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

// ========================================
// MÉTODOS NO PERMITIDOS
// ========================================

export async function GET() {
  return NextResponse.json(
    { success: false, error: "Método no permitido" },
    { status: 405 }
  );
}

export async function POST() {
  return NextResponse.json(
    { success: false, error: "Método no permitido" },
    { status: 405 }
  );
}

export async function DELETE() {
  return NextResponse.json(
    { success: false, error: "Método no permitido" },
    { status: 405 }
  );
}