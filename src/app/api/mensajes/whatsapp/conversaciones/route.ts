// app/api/mensajes/whatsapp/conversaciones/route.ts
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
// HANDLER GET - Obtener Conversaciones WhatsApp
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

    // 3. Obtener conversaciones de WhatsApp
    // Por ahora retornamos datos de ejemplo (luego se conectará a la tabla real)
    const conversacionesEjemplo = [
      {
        id_conversacion: 1,
        paciente: {
          id_paciente: 1,
          nombre_completo: "María González Pérez",
          foto_url: null,
          telefono: "+56912345678",
          whatsapp: "+56912345678",
          email: "maria.gonzalez@example.com",
        },
        ultimo_mensaje: {
          contenido: "Perfecto, nos vemos mañana a las 10:00. ¡Muchas gracias!",
          fecha_hora: new Date().toISOString(),
          enviado_por_secretaria: false,
          leido: true,
          tipo: "texto",
        },
        mensajes_sin_leer: 0,
        estado: "activa",
        etiquetas: ["cita-confirmada"],
        prioridad: "normal",
        tiene_cita_pendiente: true,
        proxima_cita: new Date(Date.now() + 86400000).toISOString(),
      },
      {
        id_conversacion: 2,
        paciente: {
          id_paciente: 2,
          nombre_completo: "Juan Pérez Morales",
          foto_url: null,
          telefono: "+56987654321",
          whatsapp: "+56987654321",
          email: null,
        },
        ultimo_mensaje: {
          contenido: "Buenos días, quería consultar por una hora para endodoncia",
          fecha_hora: new Date(Date.now() - 3600000).toISOString(),
          enviado_por_secretaria: false,
          leido: false,
          tipo: "texto",
        },
        mensajes_sin_leer: 2,
        estado: "activa",
        etiquetas: ["nuevo-paciente"],
        prioridad: "alta",
        tiene_cita_pendiente: false,
        proxima_cita: null,
      },
      {
        id_conversacion: 3,
        paciente: {
          id_paciente: 3,
          nombre_completo: "Ana Martínez Silva",
          foto_url: null,
          telefono: "+56923456789",
          whatsapp: "+56923456789",
          email: "ana.martinez@example.com",
        },
        ultimo_mensaje: {
          contenido: "Gracias por la información sobre los resultados",
          fecha_hora: new Date(Date.now() - 7200000).toISOString(),
          enviado_por_secretaria: false,
          leido: true,
          tipo: "texto",
        },
        mensajes_sin_leer: 0,
        estado: "activa",
        etiquetas: ["resultados"],
        prioridad: "normal",
        tiene_cita_pendiente: false,
        proxima_cita: null,
      },
      {
        id_conversacion: 4,
        paciente: {
          id_paciente: 4,
          nombre_completo: "Carlos Rodríguez López",
          foto_url: null,
          telefono: "+56934567890",
          whatsapp: "+56934567890",
          email: null,
        },
        ultimo_mensaje: {
          contenido: "¿Podría cambiar mi cita de mañana?",
          fecha_hora: new Date(Date.now() - 1800000).toISOString(),
          enviado_por_secretaria: false,
          leido: false,
          tipo: "texto",
        },
        mensajes_sin_leer: 1,
        estado: "activa",
        etiquetas: ["reagendamiento"],
        prioridad: "alta",
        tiene_cita_pendiente: true,
        proxima_cita: new Date(Date.now() + 86400000).toISOString(),
      },
    ];

    return NextResponse.json(
      {
        success: true,
        conversaciones: conversacionesEjemplo,
        total: conversacionesEjemplo.length,
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("❌ Error al obtener conversaciones de WhatsApp:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Error al obtener conversaciones",
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
