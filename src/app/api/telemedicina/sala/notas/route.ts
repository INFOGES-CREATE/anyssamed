// frontend/src/app/api/telemedicina/sala/notas/route.ts

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
// HANDLER GET - Obtener notas de la sesión
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
    const medico = await obtenerMedicoAutenticado(idUsuario);

    if (!medico) {
      return NextResponse.json(
        { success: false, error: "No tienes un registro de médico activo" },
        { status: 403 }
      );
    }

    // Obtener parámetros
    const searchParams = request.nextUrl.searchParams;
    const idPaciente = searchParams.get("id_paciente");
    const idHistorial = searchParams.get("id_historial");

    if (!idPaciente) {
      return NextResponse.json(
        { success: false, error: "ID de paciente requerido" },
        { status: 400 }
      );
    }

    // Obtener notas clínicas
    let query = `
      SELECT 
        nc.id_nota,
        nc.id_paciente,
        nc.id_historial,
        nc.id_usuario,
        nc.fecha_nota,
        nc.tipo_nota,
        nc.contenido,
        nc.nivel_privacidad,
        nc.estado,
        nc.etiquetas,
        nc.version,
        nc.fecha_creacion,
        nc.fecha_modificacion,
        CONCAT(u.nombre, ' ', u.apellido_paterno) as autor_nombre
      FROM notas_clinicas nc
      INNER JOIN usuarios u ON nc.id_usuario = u.id_usuario
      WHERE nc.id_paciente = ?
        AND nc.estado = 'activo'
    `;

    const params: any[] = [idPaciente];

    if (idHistorial) {
      query += ` AND nc.id_historial = ?`;
      params.push(idHistorial);
    }

    query += ` ORDER BY nc.fecha_nota DESC`;

    const [notas] = await pool.query<RowDataPacket[]>(query, params);

    // Actualizar última actividad
    await pool.query(
      `UPDATE sesiones_usuarios SET ultima_actividad = NOW() WHERE token = ?`,
      [sessionToken]
    );

    return NextResponse.json(
      {
        success: true,
        notas: notas,
        total: notas.length,
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("❌ Error en GET /api/telemedicina/sala/notas:", error);
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
// HANDLER POST - Crear nota clínica
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
    const medico = await obtenerMedicoAutenticado(idUsuario);

    if (!medico) {
      return NextResponse.json(
        { success: false, error: "No tienes un registro de médico activo" },
        { status: 403 }
      );
    }

    // Obtener datos del body
    const body = await request.json();
    const {
      id_paciente,
      id_historial,
      tipo_nota,
      contenido,
      nivel_privacidad = "normal",
      etiquetas,
    } = body;

    if (!id_paciente || !tipo_nota || !contenido) {
      return NextResponse.json(
        { success: false, error: "Faltan datos requeridos" },
        { status: 400 }
      );
    }

    // Validar tipo de nota
    const tiposValidos = [
      "evolucion",
      "interconsulta",
      "procedimiento",
      "enfermeria",
      "administrativo",
      "otro",
    ];

    if (!tiposValidos.includes(tipo_nota)) {
      return NextResponse.json(
        { success: false, error: "Tipo de nota inválido" },
        { status: 400 }
      );
    }

    // Insertar nota clínica
    const [result] = await pool.query<ResultSetHeader>(
      `
      INSERT INTO notas_clinicas (
        id_paciente,
        id_historial,
        id_usuario,
        fecha_nota,
        tipo_nota,
        contenido,
        nivel_privacidad,
        estado,
        etiquetas
      ) VALUES (?, ?, ?, NOW(), ?, ?, ?, 'activo', ?)
      `,
      [
        id_paciente,
        id_historial || null,
        idUsuario,
        tipo_nota,
        contenido,
        nivel_privacidad,
        etiquetas || null,
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
        message: "Nota clínica creada exitosamente",
        id_nota: result.insertId,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("❌ Error en POST /api/telemedicina/sala/notas:", error);
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
// HANDLER PUT - Actualizar nota clínica
// ========================================

export async function PUT(request: NextRequest) {
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
    const medico = await obtenerMedicoAutenticado(idUsuario);

    if (!medico) {
      return NextResponse.json(
        { success: false, error: "No tienes un registro de médico activo" },
        { status: 403 }
      );
    }

    // Obtener datos del body
    const body = await request.json();
    const { id_nota, contenido, etiquetas, estado } = body;

    if (!id_nota) {
      return NextResponse.json(
        { success: false, error: "ID de nota requerido" },
        { status: 400 }
      );
    }

    // Verificar que la nota pertenezca al médico
    const [notaRows] = await pool.query<RowDataPacket[]>(
      `SELECT id_nota FROM notas_clinicas WHERE id_nota = ? AND id_usuario = ?`,
      [id_nota, idUsuario]
    );

    if (notaRows.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Nota no encontrada o no tienes permisos para modificarla",
        },
        { status: 404 }
      );
    }

    // Actualizar nota
    const updates: string[] = [];
    const params: any[] = [];

    if (contenido !== undefined) {
      updates.push("contenido = ?");
      params.push(contenido);
    }

    if (etiquetas !== undefined) {
      updates.push("etiquetas = ?");
      params.push(etiquetas);
    }

    if (estado !== undefined) {
      updates.push("estado = ?");
      params.push(estado);
    }

    updates.push("version = version + 1");
    updates.push("modificado_por = ?");
    params.push(idUsuario);

    params.push(id_nota);

    await pool.query(
      `UPDATE notas_clinicas SET ${updates.join(", ")} WHERE id_nota = ?`,
      params
    );

    // Actualizar última actividad
    await pool.query(
      `UPDATE sesiones_usuarios SET ultima_actividad = NOW() WHERE token = ?`,
      [sessionToken]
    );

    return NextResponse.json(
      {
        success: true,
        message: "Nota clínica actualizada exitosamente",
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("❌ Error en PUT /api/telemedicina/sala/notas:", error);
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
// HANDLER DELETE - Anular nota clínica
// ========================================

export async function DELETE(request: NextRequest) {
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
    const medico = await obtenerMedicoAutenticado(idUsuario);

    if (!medico) {
      return NextResponse.json(
        { success: false, error: "No tienes un registro de médico activo" },
        { status: 403 }
      );
    }

    // Obtener ID de nota
    const searchParams = request.nextUrl.searchParams;
    const idNota = searchParams.get("id_nota");

    if (!idNota) {
      return NextResponse.json(
        { success: false, error: "ID de nota requerido" },
        { status: 400 }
      );
    }

    // Verificar que la nota pertenezca al médico
    const [notaRows] = await pool.query<RowDataPacket[]>(
      `SELECT id_nota FROM notas_clinicas WHERE id_nota = ? AND id_usuario = ?`,
      [idNota, idUsuario]
    );

    if (notaRows.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Nota no encontrada o no tienes permisos para eliminarla",
        },
        { status: 404 }
      );
    }

    // Anular nota (no eliminar físicamente)
    await pool.query(
      `UPDATE notas_clinicas SET estado = 'anulado', modificado_por = ? WHERE id_nota = ?`,
      [idUsuario, idNota]
    );

    // Actualizar última actividad
    await pool.query(
      `UPDATE sesiones_usuarios SET ultima_actividad = NOW() WHERE token = ?`,
      [sessionToken]
    );

    return NextResponse.json(
      {
        success: true,
        message: "Nota clínica anulada exitosamente",
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("❌ Error en DELETE /api/telemedicina/sala/notas:", error);
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
