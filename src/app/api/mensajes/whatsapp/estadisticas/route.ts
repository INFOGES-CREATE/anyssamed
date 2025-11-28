// app/api/mensajes/whatsapp/estadisticas/route.ts
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { RowDataPacket } from "mysql2";

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
// HANDLER GET - Obtener Estadísticas WhatsApp
// ========================================

export async function GET(request: NextRequest) {
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

    // 3. Calcular estadísticas (por ahora ejemplo, luego desde BD)
    const estadisticas = {
      mensajes_enviados_hoy: 45,
      mensajes_recibidos_hoy: 38,
      conversaciones_activas: 12,
      tasa_respuesta: 95,
      tiempo_promedio_respuesta: 8, // minutos
      plantillas_mas_usadas: [
        {
          id_plantilla: 1,
          nombre: "Recordatorio de Cita",
          contenido:
            "Hola {{nombre}}, te recordamos tu cita con {{medico}} el día {{fecha}} a las {{hora}}. Por favor confirma tu asistencia.",
          categoria: "recordatorio",
          variables: ["nombre", "medico", "fecha", "hora"],
          uso_frecuente: true,
          veces_usada: 245,
        },
        {
          id_plantilla: 2,
          nombre: "Confirmación de Cita",
          contenido:
            "¡Perfecto {{nombre}}! Tu cita ha sido confirmada para el {{fecha}} a las {{hora}}.",
          categoria: "confirmacion",
          variables: ["nombre", "fecha", "hora"],
          uso_frecuente: true,
          veces_usada: 189,
        },
        {
          id_plantilla: 3,
          nombre: "Saludo Inicial",
          contenido:
            "Hola {{nombre}}, soy {{secretaria}} del Centro Médico {{centro}}. ¿En qué puedo ayudarte hoy?",
          categoria: "general",
          variables: ["nombre", "secretaria", "centro"],
          uso_frecuente: true,
          veces_usada: 156,
        },
      ],
    };

    return NextResponse.json(
      {
        success: true,
        estadisticas,
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("❌ Error al obtener estadísticas:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Error al obtener estadísticas",
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

export async function POST() {
  return NextResponse.json(
    { success: false, error: "Método no permitido", code: "METHOD_NOT_ALLOWED" },
    { status: 405 }
  );
}

export async function PUT() {
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
