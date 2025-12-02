// app/api/mensajes/conversaciones/route.ts
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { RowDataPacket } from "mysql2";

// ========================================
// TIPOS
// ========================================

interface Conversacion {
  id_conversacion: string;
  id_usuario_otro: number;
  usuario_otro: {
    id_usuario: number;
    nombre: string;
    apellido_paterno: string;
    apellido_materno: string | null;
    foto_perfil_url: string | null;
    rol: {
      nombre: string;
      nivel_jerarquia: number;
    };
    estado_online: boolean;
    ultima_conexion: string | null;
    profesional: {
      especialidad: string;
      tipo_profesional: string;
    } | null;
  };
  ultimo_mensaje: {
    id_mensaje: number;
    id_usuario_emisor: number;
    contenido: string;
    fecha_envio: string;
    tipo_mensaje: string;
    leido: boolean;
  } | null;
  mensajes_sin_leer: number;
  fecha_ultimo_mensaje: string;
  archivada: boolean;
  fijada: boolean;
  silenciada: boolean;
  favorita: boolean;
  etiqueta: string | null;
  escribiendo: boolean;
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

/**
 * Obtiene el ID de usuario desde el token de sesión
 */
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
 * Genera el ID de conversación único entre dos usuarios
 */
function generarIdConversacion(idUsuario1: number, idUsuario2: number): string {
  const ids = [idUsuario1, idUsuario2].sort((a, b) => a - b);
  return `conv_${ids[0]}_${ids[1]}`;
}

/**
 * Obtiene todas las conversaciones del usuario
 */
async function obtenerConversaciones(idUsuario: number): Promise<Conversacion[]> {
  try {
    // Obtener todos los usuarios con los que ha tenido conversaciones
    const [rows] = await pool.query<RowDataPacket[]>(
      `
      SELECT DISTINCT
        CASE 
          WHEN mc.id_usuario_emisor = ? THEN mc.id_usuario_receptor
          ELSE mc.id_usuario_emisor
        END as id_usuario_otro
      FROM mensajes_chat mc
      WHERE (mc.id_usuario_emisor = ? OR mc.id_usuario_receptor = ?)
        AND mc.eliminado_emisor = 0 
        AND mc.eliminado_receptor = 0
      `,
      [idUsuario, idUsuario, idUsuario]
    );

    const conversaciones: Conversacion[] = [];

    // Para cada usuario, construir la conversación completa
    for (const row of rows) {
      const idUsuarioOtro = row.id_usuario_otro;
      const idConversacion = generarIdConversacion(idUsuario, idUsuarioOtro);

      // Obtener datos del otro usuario
     const [usuarioData] = await pool.query<RowDataPacket[]>(
  `
  SELECT 
    u.id_usuario,
    u.nombre,
    u.apellido_paterno,
    u.apellido_materno,
    u.foto_perfil_url,

    r.nombre AS rol_nombre,
    r.nivel_jerarquia,

    CASE 
      WHEN su.ultima_actividad >= DATE_SUB(NOW(), INTERVAL 5 MINUTE) THEN 1
      ELSE 0
    END AS estado_online,

    su.ultima_actividad AS ultima_conexion,

    ps.especialidad_principal,
    ps.tipo_profesional

  FROM usuarios u

  -- 🔥 aquí va la relación correcta según tus tablas
  LEFT JOIN usuarios_roles ur 
    ON ur.id_usuario = u.id_usuario
    AND ur.activo = 1

  LEFT JOIN roles r 
    ON r.id_rol = ur.id_rol

  LEFT JOIN sesiones_usuarios su 
    ON su.id_usuario = u.id_usuario 
    AND su.activa = 1 
    AND su.fecha_expiracion > NOW()

  LEFT JOIN profesionales_salud ps 
    ON ps.id_usuario = u.id_usuario 
    AND ps.estado = 'activo'

  WHERE u.id_usuario = ?
  LIMIT 1
  `,
  [idUsuarioOtro]
);

      if (usuarioData.length === 0) continue;

      const usuario = usuarioData[0];

      // Obtener último mensaje
      const [ultimoMensaje] = await pool.query<RowDataPacket[]>(
        `
        SELECT 
          id_mensaje,
          id_usuario_emisor,
          contenido,
          fecha_envio,
          tipo_mensaje,
          leido
        FROM mensajes_chat
        WHERE id_conversacion = ?
        ORDER BY fecha_envio DESC
        LIMIT 1
        `,
        [idConversacion]
      );

      // Contar mensajes sin leer
      const [sinLeer] = await pool.query<RowDataPacket[]>(
        `
        SELECT COUNT(*) as total
        FROM mensajes_chat
        WHERE id_conversacion = ?
          AND id_usuario_receptor = ?
          AND leido = 0
          AND eliminado_receptor = 0
        `,
        [idConversacion, idUsuario]
      );

      // Obtener configuración de conversación (simulada por ahora)
      // En producción, estas preferencias se guardarían en una tabla
      const archivada = false;
      const fijada = false;
      const silenciada = false;
      const favorita = false;
      const etiqueta = null;
      const escribiendo = false;

      conversaciones.push({
        id_conversacion: idConversacion,
        id_usuario_otro: idUsuarioOtro,
        usuario_otro: {
          id_usuario: usuario.id_usuario,
          nombre: usuario.nombre,
          apellido_paterno: usuario.apellido_paterno,
          apellido_materno: usuario.apellido_materno,
          foto_perfil_url: usuario.foto_perfil_url,
          rol: {
            nombre: usuario.rol_nombre,
            nivel_jerarquia: usuario.nivel_jerarquia,
          },
          estado_online: usuario.estado_online === 1,
          ultima_conexion: usuario.ultima_conexion,
          profesional: usuario.especialidad_principal
            ? {
                especialidad: usuario.especialidad_principal,
                tipo_profesional: usuario.tipo_profesional,
              }
            : null,
        },
        ultimo_mensaje: ultimoMensaje.length > 0
          ? {
              id_mensaje: ultimoMensaje[0].id_mensaje,
              id_usuario_emisor: ultimoMensaje[0].id_usuario_emisor,
              contenido: ultimoMensaje[0].contenido,
              fecha_envio: ultimoMensaje[0].fecha_envio,
              tipo_mensaje: ultimoMensaje[0].tipo_mensaje,
              leido: ultimoMensaje[0].leido === 1,
            }
          : null,
        mensajes_sin_leer: sinLeer[0].total || 0,
        fecha_ultimo_mensaje: ultimoMensaje.length > 0 
          ? ultimoMensaje[0].fecha_envio 
          : new Date().toISOString(),
        archivada,
        fijada,
        silenciada,
        favorita,
        etiqueta,
        escribiendo,
      });
    }

    // Ordenar por fecha del último mensaje
    conversaciones.sort(
      (a, b) =>
        new Date(b.fecha_ultimo_mensaje).getTime() -
        new Date(a.fecha_ultimo_mensaje).getTime()
    );

    return conversaciones;
  } catch (error) {
    console.error("Error al obtener conversaciones:", error);
    throw error;
  }
}

// ========================================
// HANDLER GET
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

    // 4. Obtener conversaciones
    const conversaciones = await obtenerConversaciones(idUsuario);

    // 5. Respuesta exitosa
    return NextResponse.json(
      {
        success: true,
        data: conversaciones,
        total: conversaciones.length,
        mensajes_sin_leer_total: conversaciones.reduce(
          (sum, c) => sum + c.mensajes_sin_leer,
          0
        ),
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("❌ Error en GET /api/mensajes/conversaciones:", error);

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

export async function DELETE() {
  return NextResponse.json(
    { success: false, error: "Método no permitido" },
    { status: 405 }
  );
}