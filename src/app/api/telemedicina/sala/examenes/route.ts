// frontend/src/app/api/telemedicina/sala/examenes/route.ts

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

function generarNumeroOrden(idCentro: number): string {
  const fecha = new Date();
  const año = fecha.getFullYear();
  const mes = (fecha.getMonth() + 1).toString().padStart(2, "0");
  const dia = fecha.getDate().toString().padStart(2, "0");
  const random = crypto.randomBytes(3).toString("hex").toUpperCase();
  return `ORD-${idCentro}-${año}${mes}${dia}-${random}`;
}

// ========================================
// HANDLER GET - Obtener exámenes
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
    const estado = searchParams.get("estado");

    if (!idPaciente) {
      return NextResponse.json(
        { success: false, error: "ID de paciente requerido" },
        { status: 400 }
      );
    }

    // Obtener exámenes
    let query = `
      SELECT 
        em.id_examen,
        em.id_paciente,
        em.id_tipo_examen,
        em.id_medico_solicitante,
        em.id_centro,
        em.fecha_solicitud,
        em.fecha_programada,
        em.fecha_realizacion,
        em.estado,
        em.prioridad,
        em.motivo_solicitud,
        em.diagnostico,
        em.codigo_cie10,
        em.instrucciones_especificas,
        em.numero_orden,
        em.requiere_preparacion,
        em.confirmacion_preparacion,
        em.lugar_realizacion,
        em.pagado,
        em.costo,
        em.cubierto_seguro,
        em.fecha_creacion,
        te.nombre as tipo_examen_nombre,
        te.categoria as tipo_examen_categoria,
        te.requiere_ayuno,
        te.tiempo_resultado_horas,
        CONCAT(p.nombre, ' ', p.apellido_paterno) as paciente_nombre,
        cm.nombre as centro_nombre
      FROM examenes_medicos em
      INNER JOIN tipos_examenes te ON em.id_tipo_examen = te.id_tipo_examen
      INNER JOIN pacientes p ON em.id_paciente = p.id_paciente
      INNER JOIN centros_medicos cm ON em.id_centro = cm.id_centro
      WHERE em.id_paciente = ?
        AND em.id_medico_solicitante = ?
    `;

    const params: any[] = [idPaciente, medico.id_medico];

    if (idHistorial) {
      query += ` AND em.id_historial = ?`;
      params.push(idHistorial);
    }

    if (estado) {
      query += ` AND em.estado = ?`;
      params.push(estado);
    }

    query += ` ORDER BY em.fecha_solicitud DESC`;

    const [examenes] = await pool.query<RowDataPacket[]>(query, params);

    // Obtener resultados de cada examen si existen
    for (const examen of examenes) {
      const [resultados] = await pool.query<RowDataPacket[]>(
        `
        SELECT 
          re.id_resultado,
          re.fecha_resultado,
          re.titulo,
          re.formato,
          re.resultado_texto,
          re.resultado_numerico,
          re.unidad_medida,
          re.resultado_positivo,
          re.url_resultado,
          re.interpretacion,
          re.observaciones,
          re.estado,
          re.es_critico,
          re.notificado_medico,
          re.validado,
          re.requiere_seguimiento
        FROM resultados_examenes re
        WHERE re.id_examen = ?
        ORDER BY re.fecha_resultado DESC
        `,
        [examen.id_examen]
      );

      examen.resultados = resultados;
    }

    // Actualizar última actividad
    await pool.query(
      `UPDATE sesiones_usuarios SET ultima_actividad = NOW() WHERE token = ?`,
      [sessionToken]
    );

    return NextResponse.json(
      {
        success: true,
        examenes: examenes,
        total: examenes.length,
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("❌ Error en GET /api/telemedicina/sala/examenes:", error);
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
// HANDLER POST - Solicitar examen médico
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
      id_tipo_examen,
      id_historial,
      fecha_programada,
      prioridad = "normal",
      motivo_solicitud,
      diagnostico,
      codigo_cie10,
      instrucciones_especificas,
      requiere_preparacion = false,
      lugar_realizacion,
    } = body;

    if (!id_paciente || !id_tipo_examen) {
      return NextResponse.json(
        { success: false, error: "Faltan datos requeridos" },
        { status: 400 }
      );
    }

    // Verificar que el tipo de examen existe
    const [tipoExamen] = await pool.query<RowDataPacket[]>(
      `SELECT id_tipo_examen, nombre FROM tipos_examenes WHERE id_tipo_examen = ? AND activo = 1`,
      [id_tipo_examen]
    );

    if (tipoExamen.length === 0) {
      return NextResponse.json(
        { success: false, error: "Tipo de examen no encontrado o inactivo" },
        { status: 404 }
      );
    }

    // Generar número de orden
    const numeroOrden = generarNumeroOrden(medico.id_centro_principal);

    // Insertar examen médico
    const [result] = await pool.query<ResultSetHeader>(
      `
      INSERT INTO examenes_medicos (
        id_paciente,
        id_tipo_examen,
        id_medico_solicitante,
        id_centro,
        fecha_solicitud,
        fecha_programada,
        estado,
        prioridad,
        motivo_solicitud,
        diagnostico,
        codigo_cie10,
        instrucciones_especificas,
        numero_orden,
        requiere_preparacion,
        lugar_realizacion,
        id_historial
      ) VALUES (?, ?, ?, ?, NOW(), ?, 'solicitado', ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        id_paciente,
        id_tipo_examen,
        medico.id_medico,
        medico.id_centro_principal,
        fecha_programada || null,
        prioridad,
        motivo_solicitud || null,
        diagnostico || null,
        codigo_cie10 || null,
        instrucciones_especificas || null,
        numeroOrden,
        requiere_preparacion ? 1 : 0,
        lugar_realizacion || null,
        id_historial || null,
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
        message: "Examen médico solicitado exitosamente",
        id_examen: result.insertId,
        numero_orden: numeroOrden,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("❌ Error en POST /api/telemedicina/sala/examenes:", error);
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
// HANDLER PUT - Actualizar examen
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
    const {
      id_examen,
      estado,
      fecha_programada,
      instrucciones_especificas,
      prioridad,
    } = body;

    if (!id_examen) {
      return NextResponse.json(
        { success: false, error: "ID de examen requerido" },
        { status: 400 }
      );
    }

    // Verificar que el examen pertenezca al médico
    const [examenRows] = await pool.query<RowDataPacket[]>(
      `SELECT id_examen FROM examenes_medicos WHERE id_examen = ? AND id_medico_solicitante = ?`,
      [id_examen, medico.id_medico]
    );

    if (examenRows.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Examen no encontrado o no tienes permisos para modificarlo",
        },
        { status: 404 }
      );
    }

    // Actualizar examen
    const updates: string[] = [];
    const params: any[] = [];

    if (estado !== undefined) {
      updates.push("estado = ?");
      params.push(estado);
    }

    if (fecha_programada !== undefined) {
      updates.push("fecha_programada = ?");
      params.push(fecha_programada);
    }

    if (instrucciones_especificas !== undefined) {
      updates.push("instrucciones_especificas = ?");
      params.push(instrucciones_especificas);
    }

    if (prioridad !== undefined) {
      updates.push("prioridad = ?");
      params.push(prioridad);
    }

    if (updates.length === 0) {
      return NextResponse.json(
        { success: false, error: "No hay datos para actualizar" },
        { status: 400 }
      );
    }

    params.push(id_examen);

    await pool.query(
      `UPDATE examenes_medicos SET ${updates.join(", ")} WHERE id_examen = ?`,
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
        message: "Examen actualizado exitosamente",
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("❌ Error en PUT /api/telemedicina/sala/examenes:", error);
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
