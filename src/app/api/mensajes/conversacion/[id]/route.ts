// src\app\api\mensajes\conversacion\[id]\route.ts
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { RowDataPacket } from "mysql2";

// ========================================
// TIPOS
// ========================================

interface Mensaje {
  id_mensaje: number;
  id_usuario_emisor: number;
  id_usuario_receptor: number;
  contenido: string;
  fecha_envio: string;
  fecha_lectura: string | null;
  leido: boolean;
  tipo_mensaje: "texto" | "imagen" | "archivo" | "sistema" | "ubicacion";
  archivos_adjuntos: boolean;
  metadata: any;
  estado_envio: "enviado" | "entregado" | "leido" | "fallido";
  id_mensaje_respuesta: number | null;
  mensaje_respuesta?: Mensaje;
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
 * Obtiene los mensajes de una conversación
 */
async function obtenerMensajes(
  idConversacion: string,
  idUsuario: number
): Promise<Mensaje[]> {
  try {
    const [rows] = await pool.query<RowDataPacket[]>(
      `
      SELECT 
        m.id_mensaje,
        m.id_usuario_emisor,
        m.id_usuario_receptor,
        m.contenido,
        m.fecha_envio,
        m.fecha_lectura,
        m.leido,
        m.tipo_mensaje,
        m.archivos_adjuntos,
        m.metadata,
        m.estado_envio,
        m.id_mensaje_respuesta
      FROM mensajes_chat m
      WHERE m.id_conversacion = ?
        AND ((m.id_usuario_emisor = ? AND m.eliminado_emisor = 0)
             OR (m.id_usuario_receptor = ? AND m.eliminado_receptor = 0))
      ORDER BY m.fecha_envio ASC
      `,
      [idConversacion, idUsuario, idUsuario]
    );

    const mensajes: Mensaje[] = [];

    for (const row of rows) {
      let mensajeRespuesta: Mensaje | undefined;

      // Si tiene mensaje de respuesta, obtenerlo
      if (row.id_mensaje_respuesta) {
        const [respuesta] = await pool.query<RowDataPacket[]>(
          `
          SELECT 
            id_mensaje,
            id_usuario_emisor,
            id_usuario_receptor,
            contenido,
            fecha_envio,
            tipo_mensaje
          FROM mensajes_chat
          WHERE id_mensaje = ?
          LIMIT 1
          `,
          [row.id_mensaje_respuesta]
        );

        if (respuesta.length > 0) {
          mensajeRespuesta = {
            id_mensaje: respuesta[0].id_mensaje,
            id_usuario_emisor: respuesta[0].id_usuario_emisor,
            id_usuario_receptor: respuesta[0].id_usuario_receptor,
            contenido: respuesta[0].contenido,
            fecha_envio: respuesta[0].fecha_envio,
            fecha_lectura: null,
            leido: false,
            tipo_mensaje: respuesta[0].tipo_mensaje,
            archivos_adjuntos: false,
            metadata: null,
            estado_envio: "enviado",
            id_mensaje_respuesta: null,
          };
        }
      }

      mensajes.push({
        id_mensaje: row.id_mensaje,
        id_usuario_emisor: row.id_usuario_emisor,
        id_usuario_receptor: row.id_usuario_receptor,
        contenido: row.contenido,
        fecha_envio: row.fecha_envio,
        fecha_lectura: row.fecha_lectura,
        leido: row.leido === 1,
        tipo_mensaje: row.tipo_mensaje,
        archivos_adjuntos: row.archivos_adjuntos === 1,
        metadata: row.metadata ? JSON.parse(row.metadata) : null,
        estado_envio: row.estado_envio,
        id_mensaje_respuesta: row.id_mensaje_respuesta,
        mensaje_respuesta: mensajeRespuesta,
      });
    }

    return mensajes;
  } catch (error) {
    console.error("Error al obtener mensajes:", error);
    throw error;
  }
}

// ========================================
// HANDLER GET
// ========================================

export async function GET(
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

    // 3. Actualizar última actividad
    await pool.query(
      `UPDATE sesiones_usuarios SET ultima_actividad = NOW() WHERE token = ?`,
      [sessionToken]
    );

    // 4. Obtener mensajes
    const mensajes = await obtenerMensajes(idConversacion, idUsuario);

    // 5. Respuesta exitosa
    return NextResponse.json(
      {
        success: true,
        data: mensajes,
        total: mensajes.length,
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("❌ Error en GET /api/mensajes/conversacion/[id]:", error);

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
// HANDLER DELETE - Eliminar conversación
// ========================================

export async function DELETE(
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

    // 3. Marcar mensajes como eliminados para este usuario
    await pool.query(
      `
      UPDATE mensajes_chat
      SET 
        eliminado_emisor = CASE WHEN id_usuario_emisor = ? THEN 1 ELSE eliminado_emisor END,
        eliminado_receptor = CASE WHEN id_usuario_receptor = ? THEN 1 ELSE eliminado_receptor END
      WHERE id_conversacion = ?
      `,
      [idUsuario, idUsuario, idConversacion]
    );

    // 4. Respuesta exitosa
    return NextResponse.json(
      {
        success: true,
        message: "Conversación eliminada exitosamente",
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("❌ Error en DELETE /api/mensajes/conversacion/[id]:", error);

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

export async function POST() {
  return NextResponse.json(
    { success: false, error: "Método no permitido" },
    { status: 405 }
  );
}

export async function PUT() {
  return NextResponse.json(
    { success: false, error: "Método no permitido" },
    { status: 405 }
  );
}