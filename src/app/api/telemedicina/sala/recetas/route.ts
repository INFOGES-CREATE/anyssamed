// frontend/src/app/api/telemedicina/sala/recetas/route.ts

import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { RowDataPacket, ResultSetHeader } from "mysql2";
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

function generarNumeroReceta(idCentro: number): string {
  const fecha = new Date();
  const año = fecha.getFullYear();
  const mes = (fecha.getMonth() + 1).toString().padStart(2, "0");
  const random = crypto.randomBytes(4).toString("hex").toUpperCase();
  return `REC-${idCentro}-${año}${mes}-${random}`;
}

function generarCodigoVerificacion(): string {
  return crypto.randomBytes(8).toString("hex").toUpperCase();
}

// ========================================
// HANDLER GET - Obtener recetas
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

    // Obtener recetas con medicamentos
    let query = `
      SELECT 
        r.id_receta,
        r.id_centro,
        r.id_paciente,
        r.id_medico,
        r.tipo_receta,
        r.fecha_emision,
        r.fecha_vencimiento,
        r.estado,
        r.numero_receta,
        r.codigo_verificacion,
        r.diagnostico,
        r.codigo_cie10,
        r.es_cronica,
        r.observaciones,
        r.fecha_creacion,
        CONCAT(p.nombre, ' ', p.apellido_paterno) as paciente_nombre,
        cm.nombre as centro_nombre
      FROM recetas_medicas r
      INNER JOIN pacientes p ON r.id_paciente = p.id_paciente
      INNER JOIN centros_medicos cm ON r.id_centro = cm.id_centro
      WHERE r.id_paciente = ?
        AND r.id_medico = ?
    `;

    const params: any[] = [idPaciente, medico.id_medico];

    if (idHistorial) {
      query += ` AND r.id_historial = ?`;
      params.push(idHistorial);
    }

    query += ` ORDER BY r.fecha_emision DESC`;

    const [recetas] = await pool.query<RowDataPacket[]>(query, params);

    // Obtener medicamentos de cada receta
    for (const receta of recetas) {
      const [medicamentos] = await pool.query<RowDataPacket[]>(
        `
        SELECT 
          rm.id_receta_medicamento,
          rm.nombre_medicamento,
          rm.dosis,
          rm.frecuencia,
          rm.duracion,
          rm.cantidad,
          rm.unidad,
          rm.via_administracion,
          rm.instrucciones,
          rm.es_controlado,
          rm.dispensado,
          rm.fecha_dispensacion
        FROM receta_medicamentos rm
        WHERE rm.id_receta = ?
        ORDER BY rm.fecha_creacion ASC
        `,
        [receta.id_receta]
      );

      receta.medicamentos = medicamentos;
    }

    // Actualizar última actividad
    await pool.query(
      `UPDATE sesiones_usuarios SET ultima_actividad = NOW() WHERE token = ?`,
      [sessionToken]
    );

    return NextResponse.json(
      {
        success: true,
        recetas: recetas,
        total: recetas.length,
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("❌ Error en GET /api/telemedicina/sala/recetas:", error);
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
// HANDLER POST - Crear receta médica
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
      tipo_receta = "simple",
      diagnostico,
      codigo_cie10,
      es_cronica = false,
      observaciones,
      medicamentos,
    } = body;

    if (!id_paciente || !medicamentos || medicamentos.length === 0) {
      return NextResponse.json(
        { success: false, error: "Faltan datos requeridos" },
        { status: 400 }
      );
    }

    // Generar número de receta y código de verificación
    const numeroReceta = generarNumeroReceta(medico.id_centro_principal);
    const codigoVerificacion = generarCodigoVerificacion();

    // Calcular fecha de vencimiento (30 días para recetas simples, 90 días para crónicas)
    const fechaVencimiento = new Date();
    fechaVencimiento.setDate(
      fechaVencimiento.getDate() + (es_cronica ? 90 : 30)
    );

    // Insertar receta médica
    const [resultReceta] = await pool.query<ResultSetHeader>(
      `
      INSERT INTO recetas_medicas (
        id_centro,
        id_paciente,
        id_medico,
        tipo_receta,
        fecha_emision,
        fecha_vencimiento,
        estado,
        numero_receta,
        codigo_verificacion,
        id_historial,
        diagnostico,
        codigo_cie10,
        es_cronica,
        observaciones
      ) VALUES (?, ?, ?, ?, CURDATE(), ?, 'emitida', ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        medico.id_centro_principal,
        id_paciente,
        medico.id_medico,
        tipo_receta,
        fechaVencimiento,
        numeroReceta,
        codigoVerificacion,
        id_historial || null,
        diagnostico || null,
        codigo_cie10 || null,
        es_cronica ? 1 : 0,
        observaciones || null,
      ]
    );

    const idReceta = resultReceta.insertId;

    // Insertar medicamentos
    for (const med of medicamentos) {
      await pool.query(
        `
        INSERT INTO receta_medicamentos (
          id_receta,
          nombre_medicamento,
          dosis,
          frecuencia,
          duracion,
          cantidad,
          unidad,
          via_administracion,
          instrucciones,
          es_controlado
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
        [
          idReceta,
          med.nombre_medicamento,
          med.dosis,
          med.frecuencia,
          med.duracion || null,
          med.cantidad,
          med.unidad,
          med.via_administracion,
          med.instrucciones || null,
          med.es_controlado ? 1 : 0,
        ]
      );
    }

    // Actualizar última actividad
    await pool.query(
      `UPDATE sesiones_usuarios SET ultima_actividad = NOW() WHERE token = ?`,
      [sessionToken]
    );

    return NextResponse.json(
      {
        success: true,
        message: "Receta médica creada exitosamente",
        id_receta: idReceta,
        numero_receta: numeroReceta,
        codigo_verificacion: codigoVerificacion,
        fecha_vencimiento: fechaVencimiento,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("❌ Error en POST /api/telemedicina/sala/recetas:", error);
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
