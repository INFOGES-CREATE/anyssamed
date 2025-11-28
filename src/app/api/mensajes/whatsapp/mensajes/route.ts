// app/api/mensajes/whatsapp/mensajes/route.ts
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
// HANDLER GET - Obtener Mensajes de Conversación
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

    // 3. Obtener parámetros
    const { searchParams } = new URL(request.url);
    const id_conversacion = searchParams.get("id_conversacion");

    if (!id_conversacion) {
      return NextResponse.json(
        { success: false, error: "ID de conversación requerido", code: "MISSING_FIELDS" },
        { status: 400 }
      );
    }

    // 4. Obtener mensajes (por ahora ejemplo, luego desde BD)
    const mensajesEjemplo = [
      {
        id_mensaje: 1,
        id_conversacion: parseInt(id_conversacion),
        contenido: "Hola, buenos días. Soy del Centro Médico. ¿En qué puedo ayudarle?",
        fecha_hora: new Date(Date.now() - 86400000).toISOString(),
        enviado_por_secretaria: true,
        leido: true,
        entregado: true,
        tipo: "texto",
        archivo_url: null,
        archivo_nombre: null,
        metadata: null,
      },
      {
        id_mensaje: 2,
        id_conversacion: parseInt(id_conversacion),
        contenido: "Hola, quería agendar una hora con el Dr. Pérez",
        fecha_hora: new Date(Date.now() - 82800000).toISOString(),
        enviado_por_secretaria: false,
        leido: true,
        entregado: true,
        tipo: "texto",
        archivo_url: null,
        archivo_nombre: null,
        metadata: null,
      },
      {
        id_mensaje: 3,
        id_conversacion: parseInt(id_conversacion),
        contenido: "Por supuesto. ¿Qué tipo de consulta necesita?",
        fecha_hora: new Date(Date.now() - 82200000).toISOString(),
        enviado_por_secretaria: true,
        leido: true,
        entregado: true,
        tipo: "texto",
        archivo_url: null,
        archivo_nombre: null,
        metadata: null,
      },
      {
        id_mensaje: 4,
        id_conversacion: parseInt(id_conversacion),
        contenido: "Una consulta general, tengo algunos dolores de cabeza recurrentes",
        fecha_hora: new Date(Date.now() - 81600000).toISOString(),
        enviado_por_secretaria: false,
        leido: true,
        entregado: true,
        tipo: "texto",
        archivo_url: null,
        archivo_nombre: null,
        metadata: null,
      },
      {
        id_mensaje: 5,
        id_conversacion: parseInt(id_conversacion),
        contenido: "Entendido. Tengo disponibilidad mañana a las 10:00 o 15:00. ¿Cuál prefiere?",
        fecha_hora: new Date(Date.now() - 81000000).toISOString(),
        enviado_por_secretaria: true,
        leido: true,
        entregado: true,
        tipo: "texto",
        archivo_url: null,
        archivo_nombre: null,
        metadata: null,
      },
      {
        id_mensaje: 6,
        id_conversacion: parseInt(id_conversacion),
        contenido: "A las 10:00 me viene perfecto",
        fecha_hora: new Date(Date.now() - 80400000).toISOString(),
        enviado_por_secretaria: false,
        leido: true,
        entregado: true,
        tipo: "texto",
        archivo_url: null,
        archivo_nombre: null,
        metadata: null,
      },
      {
        id_mensaje: 7,
        id_conversacion: parseInt(id_conversacion),
        contenido: "¡Perfecto! Su cita ha sido agendada para mañana a las 10:00 con el Dr. Pérez. Le enviaré un recordatorio antes de su cita.",
        fecha_hora: new Date(Date.now() - 79800000).toISOString(),
        enviado_por_secretaria: true,
        leido: true,
        entregado: true,
        tipo: "texto",
        archivo_url: null,
        archivo_nombre: null,
        metadata: { cita_id: 123 },
      },
      {
        id_mensaje: 8,
        id_conversacion: parseInt(id_conversacion),
        contenido: "No, eso es todo. ¡Muchas gracias!",
        fecha_hora: new Date(Date.now() - 79200000).toISOString(),
        enviado_por_secretaria: false,
        leido: true,
        entregado: true,
        tipo: "texto",
        archivo_url: null,
        archivo_nombre: null,
        metadata: null,
      },
    ];

    return NextResponse.json(
      {
        success: true,
        mensajes: mensajesEjemplo,
        total: mensajesEjemplo.length,
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("❌ Error al obtener mensajes:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Error al obtener mensajes",
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
