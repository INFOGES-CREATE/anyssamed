// app/api/mensajes/conversacion/[id]/favorita/route.ts
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { RowDataPacket } from "mysql2";

// ========================================
// TIPOS
// ========================================

interface FavoritaBody {
  favorita: boolean;
  etiqueta?: string | null; // Opcional: añadir etiqueta personalizada
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
 * Actualiza el estado de favorita de la conversación
 */
async function actualizarEstadoFavorita(
  idConversacion: string,
  idUsuario: number,
  favorita: boolean,
  etiqueta?: string | null
): Promise<void> {
  try {
    // Simulación de actualización con etiqueta
    console.log(`Conversación ${idConversacion} ${favorita ? 'marcada como favorita' : 'desmarcada'} por usuario ${idUsuario}`);
    if (favorita && etiqueta) {
      console.log(`Etiqueta aplicada: ${etiqueta}`);
    }

    // En producción, guardarías esto en una tabla de preferencias:
    // INSERT INTO conversaciones_preferencias (id_conversacion, id_usuario, favorita, etiqueta)
    // VALUES (?, ?, ?, ?)
    // ON DUPLICATE KEY UPDATE favorita = ?, etiqueta = ?
  } catch (error) {
    console.error("Error al actualizar estado favorita:", error);
    throw error;
  }
}

// ========================================
// HANDLER PUT - Marcar/Desmarcar como favorita
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
    const body: FavoritaBody = await request.json();

    if (typeof body.favorita !== "boolean") {
      return NextResponse.json(
        {
          success: false,
          error: "El campo 'favorita' es requerido y debe ser booleano",
        },
        { status: 400 }
      );
    }

    // 4. Validar etiqueta si se proporciona
    if (body.etiqueta !== undefined && body.etiqueta !== null) {
      if (typeof body.etiqueta !== "string" || body.etiqueta.length > 50) {
        return NextResponse.json(
          {
            success: false,
            error: "La etiqueta debe ser un texto de máximo 50 caracteres",
          },
          { status: 400 }
        );
      }
    }

    // 5. Actualizar estado
    await actualizarEstadoFavorita(
      idConversacion, 
      idUsuario, 
      body.favorita,
      body.etiqueta
    );

    // 6. Respuesta exitosa
    return NextResponse.json(
      {
        success: true,
        message: body.favorita 
          ? "Conversación marcada como favorita" 
          : "Conversación desmarcada como favorita",
        favorita: body.favorita,
        etiqueta: body.etiqueta || null,
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("❌ Error en PUT favorita:", error);

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