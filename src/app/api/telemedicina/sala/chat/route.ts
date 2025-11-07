// frontend/src/app/api/telemedicina/sala/chat/route.ts

import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { RowDataPacket, ResultSetHeader } from "mysql2";

// ========================================
// TIPOS
// ========================================

interface MedicoData {
  id_medico: number;
  id_usuario: number;
  id_centro_principal: number;
}

// ========================================
// HELPER PARA OBTENER TOKEN
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

async function obtenerMedicoAutenticado(
  idUsuario: number
): Promise<MedicoData | null> {
  try {
    const [rows] = await pool.query<RowDataPacket[]>(
      `
      SELECT 
        m.id_medico,
        m.id_usuario,
        m.id_centro_principal
      FROM medicos m
      WHERE m.id_usuario = ? AND m.estado = 'activo'
      LIMIT 1
      `,
      [idUsuario]
    );

    if (rows.length === 0) {
      return null;
    }

    return rows[0] as MedicoData;
  } catch (error) {
    console.error("Error al obtener médico:", error);
    throw error;
  }
}

// ========================================
// HANDLER GET - Obtener mensajes del chat
// ========================================

export async function GET(request: NextRequest) {
  try {
    const sessionToken = getSessionToken(request);

    if (!sessionToken) {
      return NextResponse.json(
        { success: false, error: "No hay sesión activa" },
        { status: 401 }
      );
    }

    // Validar sesión
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

    // Obtener parámetros
    const searchParams = request.nextUrl.searchParams;
    const idSesion = searchParams.get("id_sesion");
    const limite = parseInt(searchParams.get("limite") || "50");
    const desde = searchParams.get("desde"); // Timestamp para paginación

    if (!idSesion) {
      return NextResponse.json(
        { success: false, error: "ID de sesión requerido" },
        { status: 400 }
      );
    }

    // Verificar que el usuario tiene acceso a esta sesión
    const [sesionRows] = await pool.query<RowDataPacket[]>(
      `
      SELECT st.id_sesion
      FROM sesiones_telemedicina st
      INNER JOIN medicos m ON st.id_medico = m.id_medico
      WHERE st.id_sesion = ?
        AND (m.id_usuario = ? OR st.id_paciente IN (
          SELECT id_paciente FROM pacientes WHERE id_usuario = ?
        ))
      `,
      [idSesion, idUsuario, idUsuario]
    );

    if (sesionRows.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "No tienes acceso a esta sesión de telemedicina",
        },
        { status: 403 }
      );
    }

    // Obtener mensajes
    let query = `
      SELECT 
        ct.id_mensaje,
        ct.id_sesion,
        ct.id_usuario,
        ct.tipo_usuario,
        ct.mensaje,
        ct.tipo_mensaje,
        ct.archivo_url,
        ct.archivo_nombre,
        ct.archivo_tamano,
        ct.leido,
        ct.fecha_lectura,
        ct.fecha_envio,
        CONCAT(u.nombre, ' ', u.apellido_paterno) as nombre_usuario,
        u.foto_perfil_url
      FROM chat_telemedicina ct
      INNER JOIN usuarios u ON ct.id_usuario = u.id_usuario
      WHERE ct.id_sesion = ?
    `;

    const params: any[] = [idSesion];

    if (desde) {
      query += ` AND ct.fecha_envio > ?`;
      params.push(desde);
    }

    query += ` ORDER BY ct.fecha_envio ASC LIMIT ?`;
    params.push(limite);

    const [mensajes] = await pool.query<RowDataPacket[]>(query, params);

    // Marcar mensajes como leídos
    await pool.query(
      `
      UPDATE chat_telemedicina
      SET leido = 1, fecha_lectura = NOW()
      WHERE id_sesion = ?
        AND id_usuario != ?
        AND leido = 0
      `,
      [idSesion, idUsuario]
    );

    // Actualizar última actividad
    await pool.query(
      `UPDATE sesiones_usuarios SET ultima_actividad = NOW() WHERE token = ?`,
      [sessionToken]
    );

    return NextResponse.json(
      {
        success: true,
        mensajes: mensajes,
        total: mensajes.length,
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("❌ Error en GET /api/telemedicina/sala/chat:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Error interno del servidor",
        details:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}

// ========================================
// HANDLER POST - Enviar mensaje
// ========================================

export async function POST(request: NextRequest) {
  try {
    const sessionToken = getSessionToken(request);

    if (!sessionToken) {
      return NextResponse.json(
        { success: false, error: "No hay sesión activa" },
        { status: 401 }
      );
    }

    // Validar sesión
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

    // Obtener datos del body
    const body = await request.json();
    const {
      id_sesion,
      mensaje,
      tipo_mensaje = "texto",
      archivo_url,
      archivo_nombre,
      archivo_tamano,
    } = body;

    if (!id_sesion || !mensaje) {
      return NextResponse.json(
        { success: false, error: "Faltan datos requeridos" },
        { status: 400 }
      );
    }

    // Verificar que el usuario tiene acceso a esta sesión
    const [sesionRows] = await pool.query<RowDataPacket[]>(
      `
      SELECT 
        st.id_sesion,
        CASE 
          WHEN m.id_usuario = ? THEN 'medico'
          WHEN p.id_usuario = ? THEN 'paciente'
          ELSE 'sistema'
        END as tipo_usuario
      FROM sesiones_telemedicina st
      LEFT JOIN medicos m ON st.id_medico = m.id_medico
      LEFT JOIN pacientes p ON st.id_paciente = p.id_paciente
      WHERE st.id_sesion = ?
        AND (m.id_usuario = ? OR p.id_usuario = ?)
      `,
      [idUsuario, idUsuario, id_sesion, idUsuario, idUsuario]
    );

    if (sesionRows.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "No tienes acceso a esta sesión de telemedicina",
        },
        { status: 403 }
      );
    }

    const tipoUsuario = sesionRows[0].tipo_usuario;

    // Insertar mensaje
    const [result] = await pool.query<ResultSetHeader>(
      `
      INSERT INTO chat_telemedicina (
        id_sesion,
        id_usuario,
        tipo_usuario,
        mensaje,
        tipo_mensaje,
        archivo_url,
        archivo_nombre,
        archivo_tamano
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        id_sesion,
        idUsuario,
        tipoUsuario,
        mensaje,
        tipo_mensaje,
        archivo_url || null,
        archivo_nombre || null,
        archivo_tamano || null,
      ]
    );

    // Actualizar última actividad
    await pool.query(
      `UPDATE sesiones_usuarios SET ultima_actividad = NOW() WHERE token = ?`,
      [sessionToken]
    );

    return NextResponse.json(
      {
        success: true,
        message: "Mensaje enviado exitosamente",
        id_mensaje: result.insertId,
        timestamp: new Date().toISOString(),
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("❌ Error en POST /api/telemedicina/sala/chat:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Error interno del servidor",
        details:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}
