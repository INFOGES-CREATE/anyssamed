// frontend/src/app/api/telemedicina/sala/documentos/route.ts

import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { RowDataPacket, ResultSetHeader } from "mysql2";
import { writeFile, mkdir } from "fs/promises";
import { existsSync } from "fs";
import path from "path";
import crypto from "crypto";

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

function generarNombreArchivoUnico(nombreOriginal: string): string {
  const timestamp = Date.now();
  const random = crypto.randomBytes(8).toString("hex");
  const extension = path.extname(nombreOriginal);
  const nombreBase = path.basename(nombreOriginal, extension);
  return `${nombreBase}_${timestamp}_${random}${extension}`;
}

// ========================================
// HANDLER GET - Obtener documentos
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
    const tipoDocumento = searchParams.get("tipo_documento");

    if (!idPaciente) {
      return NextResponse.json(
        { success: false, error: "ID de paciente requerido" },
        { status: 400 }
      );
    }

    // Obtener documentos
    let query = `
      SELECT 
        da.id_documento,
        da.id_paciente,
        da.id_historial,
        da.tipo_documento,
        da.nombre_archivo,
        da.url_archivo,
        da.tamano_bytes,
        da.mime_type,
        da.descripcion,
        da.es_publico,
        da.fecha_documento,
        da.origen,
        da.entidad_origen,
        da.etiquetas,
        da.estado,
        da.fecha_subida,
        CONCAT(u.nombre, ' ', u.apellido_paterno) as subido_por_nombre
      FROM documentos_adjuntos da
      INNER JOIN usuarios u ON da.subido_por = u.id_usuario
      WHERE da.id_paciente = ?
        AND da.estado = 'activo'
    `;

    const params: any[] = [idPaciente];

    if (idHistorial) {
      query += ` AND da.id_historial = ?`;
      params.push(idHistorial);
    }

    if (tipoDocumento) {
      query += ` AND da.tipo_documento = ?`;
      params.push(tipoDocumento);
    }

    query += ` ORDER BY da.fecha_subida DESC`;

    const [documentos] = await pool.query<RowDataPacket[]>(query, params);

    // Actualizar última actividad
    await pool.query(
      `UPDATE sesiones_usuarios SET ultima_actividad = NOW() WHERE token = ?`,
      [sessionToken]
    );

    return NextResponse.json(
      {
        success: true,
        documentos: documentos,
        total: documentos.length,
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error(
      "❌ Error en GET /api/telemedicina/sala/documentos:",
      error
    );
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
// HANDLER POST - Subir documento
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

    // Obtener datos del FormData
    const formData = await request.formData();
    const archivo = formData.get("archivo") as File;
    const idPaciente = formData.get("id_paciente") as string;
    const idHistorial = formData.get("id_historial") as string;
    const tipoDocumento = formData.get("tipo_documento") as string;
    const descripcion = formData.get("descripcion") as string;
    const fechaDocumento = formData.get("fecha_documento") as string;
    const esPublico = formData.get("es_publico") === "true";
    const etiquetas = formData.get("etiquetas") as string;

    if (!archivo || !idPaciente || !tipoDocumento) {
      return NextResponse.json(
        { success: false, error: "Faltan datos requeridos" },
        { status: 400 }
      );
    }

    // Validar tamaño del archivo (máximo 50MB)
    const MAX_SIZE = 50 * 1024 * 1024; // 50MB
    if (archivo.size > MAX_SIZE) {
      return NextResponse.json(
        { success: false, error: "El archivo excede el tamaño máximo de 50MB" },
        { status: 400 }
      );
    }

    // Crear directorio si no existe
    const uploadDir = path.join(
      process.cwd(),
      "public",
      "uploads",
      "documentos",
      idPaciente
    );

    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    // Generar nombre único para el archivo
    const nombreArchivoUnico = generarNombreArchivoUnico(archivo.name);
    const rutaArchivo = path.join(uploadDir, nombreArchivoUnico);

    // Guardar archivo
    const bytes = await archivo.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(rutaArchivo, buffer);

    // URL relativa del archivo
    const urlArchivo = `/uploads/documentos/${idPaciente}/${nombreArchivoUnico}`;

    // Insertar registro en base de datos
    const [result] = await pool.query<ResultSetHeader>(
      `
      INSERT INTO documentos_adjuntos (
        id_paciente,
        id_historial,
        tipo_documento,
        nombre_archivo,
        url_archivo,
        tamano_bytes,
        mime_type,
        descripcion,
        es_publico,
        fecha_documento,
        origen,
        subido_por,
        etiquetas,
        estado
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'interno', ?, ?, 'activo')
      `,
      [
        idPaciente,
        idHistorial || null,
        tipoDocumento,
        archivo.name,
        urlArchivo,
        archivo.size,
        archivo.type,
        descripcion || null,
        esPublico ? 1 : 0,
        fechaDocumento || null,
        idUsuario,
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
        message: "Documento subido exitosamente",
        id_documento: result.insertId,
        url_archivo: urlArchivo,
        nombre_archivo: archivo.name,
        tamano_bytes: archivo.size,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error(
      "❌ Error en POST /api/telemedicina/sala/documentos:",
      error
    );
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
// HANDLER DELETE - Eliminar documento
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

    // Obtener ID del documento
    const searchParams = request.nextUrl.searchParams;
    const idDocumento = searchParams.get("id_documento");

    if (!idDocumento) {
      return NextResponse.json(
        { success: false, error: "ID de documento requerido" },
        { status: 400 }
      );
    }

    // Verificar que el documento existe
    const [documentoRows] = await pool.query<RowDataPacket[]>(
      `SELECT id_documento FROM documentos_adjuntos WHERE id_documento = ?`,
      [idDocumento]
    );

    if (documentoRows.length === 0) {
      return NextResponse.json(
        { success: false, error: "Documento no encontrado" },
        { status: 404 }
      );
    }

    // Marcar documento como eliminado (no eliminar físicamente)
    await pool.query(
      `UPDATE documentos_adjuntos SET estado = 'eliminado' WHERE id_documento = ?`,
      [idDocumento]
    );

    // Actualizar última actividad
    await pool.query(
      `UPDATE sesiones_usuarios SET ultima_actividad = NOW() WHERE token = ?`,
      [sessionToken]
    );

    return NextResponse.json(
      {
        success: true,
        message: "Documento eliminado exitosamente",
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error(
      "❌ Error en DELETE /api/telemedicina/sala/documentos:",
      error
    );
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
