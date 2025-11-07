// frontend/src/app/api/telemedicina/sesiones/route.ts

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

// 👉 versión más tolerante: cookies + Authorization + Authorization (mayúscula)
function getSessionToken(request: NextRequest): string | null {
  // 1) revisar cookies
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

  // 2) revisar headers de autorización (minúscula o mayúscula)
  const authLower = request.headers.get("authorization");
  const authUpper = request.headers.get("Authorization");

  const auth = authLower || authUpper;

  if (auth && auth.startsWith("Bearer ")) {
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
}

async function obtenerSesionesTelemedicina(
  idMedico: number,
  fechaInicio: string,
  fechaFin: string,
  estados?: string[]
): Promise<any[]> {
  let query = `
    SELECT 
      ts.id_sesion,
      ts.id_cita,
      ts.id_paciente,
      ts.id_medico,
      ts.token_acceso,
      ts.url_sesion,
      ts.estado,
      ts.fecha_hora_inicio_programada,
      ts.fecha_hora_fin_programada,
      ts.fecha_hora_inicio_real,
      ts.fecha_hora_fin_real,
      ts.duracion_segundos,
      ts.proveedor_servicio,
      ts.calidad_conexion,
      ts.grabacion_autorizada,
      ts.url_grabacion,
      ts.evaluacion_paciente,
      ts.evaluacion_medico,

      -- Paciente
      p.id_paciente,
      p.nombre AS paciente_nombre,
      p.apellido_paterno AS paciente_apellido_paterno,
      p.apellido_materno AS paciente_apellido_materno,
      TIMESTAMPDIFF(YEAR, p.fecha_nacimiento, CURDATE()) AS paciente_edad,
      p.genero AS paciente_genero,
      p.telefono AS paciente_telefono,
      p.email AS paciente_email,
      p.foto_url AS paciente_foto_url,
      p.grupo_sanguineo AS paciente_grupo_sanguineo,
      p.alergias AS paciente_alergias,
      p.condiciones_cronicas AS paciente_condiciones_cronicas,

      -- Cita
      c.id_cita,
      c.motivo AS cita_motivo,
      c.tipo_cita,
      c.notas AS cita_notas_previas

    FROM telemedicina_sesiones ts
    INNER JOIN pacientes p ON ts.id_paciente = p.id_paciente
    INNER JOIN citas c ON ts.id_cita = c.id_cita
    WHERE ts.id_medico = ?
      AND DATE(ts.fecha_hora_inicio_programada) BETWEEN ? AND ?
  `;

  const params: any[] = [idMedico, fechaInicio, fechaFin];

  if (estados && estados.length > 0) {
    query += ` AND ts.estado IN (${estados.map(() => "?").join(",")})`;
    params.push(...estados);
  }

  query += ` ORDER BY ts.fecha_hora_inicio_programada ASC`;

  const [rows] = await pool.query<RowDataPacket[]>(query, params);

  return rows.map((row) => {
    let alergias: string[] = [];
    let condiciones_cronicas: string[] = [];

    // tus campos en pacientes son TEXT que dicen "JSON ..." → intentamos parsear
    try {
      if (row.paciente_alergias) {
        const parsed = JSON.parse(row.paciente_alergias);
        if (Array.isArray(parsed)) alergias = parsed;
      }
    } catch {
      alergias = [];
    }

    try {
      if (row.paciente_condiciones_cronicas) {
        const parsed = JSON.parse(row.paciente_condiciones_cronicas);
        if (Array.isArray(parsed)) condiciones_cronicas = parsed;
      }
    } catch {
      condiciones_cronicas = [];
    }

    return {
      id_sesion: row.id_sesion,
      id_cita: row.id_cita,
      id_paciente: row.id_paciente,
      id_medico: row.id_medico,
      token_acceso: row.token_acceso,
      url_sesion: `/medico/telemedicina/sala?sesion=${row.id_sesion}`,
      estado: row.estado,
      fecha_hora_inicio_programada: row.fecha_hora_inicio_programada,
      fecha_hora_fin_programada: row.fecha_hora_fin_programada,
      fecha_hora_inicio_real: row.fecha_hora_inicio_real,
      fecha_hora_fin_real: row.fecha_hora_fin_real,
      duracion_segundos: row.duracion_segundos,
      proveedor_servicio: row.proveedor_servicio,
      calidad_conexion: row.calidad_conexion,
      grabacion_autorizada: row.grabacion_autorizada === 1,
      url_grabacion: row.url_grabacion,
      evaluacion_paciente: row.evaluacion_paciente,
      evaluacion_medico: row.evaluacion_medico,
      paciente: {
        id_paciente: row.id_paciente,
        nombre_completo: `${row.paciente_nombre} ${row.paciente_apellido_paterno} ${row.paciente_apellido_materno || ""}`.trim(),
        edad: row.paciente_edad,
        genero: row.paciente_genero,
        telefono: row.paciente_telefono,
        email: row.paciente_email,
        foto_url: row.paciente_foto_url,
        grupo_sanguineo: row.paciente_grupo_sanguineo || "N/A",
        alergias,
        condiciones_cronicas,
      },
      cita: {
        id_cita: row.id_cita,
        motivo: row.cita_motivo,
        tipo_cita: row.tipo_cita,
        notas_previas: row.cita_notas_previas,
      },
    };
  });
}

// ========================================
// HANDLER GET - Obtener sesiones
// ========================================

export async function GET(request: NextRequest) {
  try {
    const sessionToken = getSessionToken(request);
    console.log("🧩 TOKEN DETECTADO GET /telemedicina/sesiones:", sessionToken);

    if (!sessionToken) {
      return NextResponse.json(
        { success: false, error: "No hay sesión activa" },
        { status: 401 }
      );
    }

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

    const searchParams = request.nextUrl.searchParams;
    const fechaInicio =
      searchParams.get("fecha_inicio") ||
      new Date().toISOString().split("T")[0];
    const fechaFin =
      searchParams.get("fecha_fin") || new Date().toISOString().split("T")[0];
    const estados = searchParams.get("estados")?.split(",");

    await pool.query(
      `UPDATE sesiones_usuarios SET ultima_actividad = NOW() WHERE token = ?`,
      [sessionToken]
    );

    const sesionesTele = await obtenerSesionesTelemedicina(
      medico.id_medico,
      fechaInicio,
      fechaFin,
      estados
    );

    return NextResponse.json(
      {
        success: true,
        sesiones: sesionesTele,
        filtros: {
          fecha_inicio: fechaInicio,
          fecha_fin: fechaFin,
          estados: estados || [],
        },
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("❌ Error en GET /api/telemedicina/sesiones:", error);
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
// HANDLER POST - Crear sesión
// ========================================

export async function POST(request: NextRequest) {
  try {
    const sessionToken = getSessionToken(request);
    console.log("🧩 TOKEN DETECTADO POST /telemedicina/sesiones:", sessionToken);

    if (!sessionToken) {
      return NextResponse.json(
        { success: false, error: "No hay sesión activa" },
        { status: 401 }
      );
    }

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

    const body = await request.json();
    const {
      id_cita,
      id_paciente,
      fecha_hora_inicio,
      fecha_hora_fin,
      proveedor_servicio = "AnySSA Video Conference",
    } = body;

    if (!id_cita || !id_paciente || !fecha_hora_inicio || !fecha_hora_fin) {
      return NextResponse.json(
        { success: false, error: "Faltan datos requeridos" },
        { status: 400 }
      );
    }

    const tokenAcceso = `tele_${Date.now()}_${Math.random()
      .toString(36)
      .substring(7)}`;
    const urlSesion = `/medico/telemedicina/sala?token=${tokenAcceso}`;

    const [result] = await pool.query<ResultSetHeader>(
      `
      INSERT INTO telemedicina_sesiones (
        id_cita,
        id_paciente,
        id_medico,
        token_acceso,
        url_sesion,
        estado,
        fecha_hora_inicio_programada,
        fecha_hora_fin_programada,
        proveedor_servicio
      ) VALUES (?, ?, ?, ?, ?, 'programada', ?, ?, ?)
      `,
      [
        id_cita,
        id_paciente,
        medico.id_medico,
        tokenAcceso,
        urlSesion,
        fecha_hora_inicio,
        fecha_hora_fin,
        proveedor_servicio,
      ]
    );

    return NextResponse.json(
      {
        success: true,
        message: "Sesión de telemedicina creada exitosamente",
        id_sesion: result.insertId,
        token_acceso: tokenAcceso,
        url_sesion: urlSesion,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("❌ Error en POST /api/telemedicina/sesiones:", error);
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
// HANDLER PUT - Actualizar sesión
// ========================================

export async function PUT(request: NextRequest) {
  try {
    const sessionToken = getSessionToken(request);
    console.log("🧩 TOKEN DETECTADO PUT /telemedicina/sesiones:", sessionToken);

    if (!sessionToken) {
      return NextResponse.json(
        { success: false, error: "No hay sesión activa" },
        { status: 401 }
      );
    }

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

    const body = await request.json();
    const { id_sesion, estado, calidad_conexion, evaluacion_medico } = body;

    if (!id_sesion) {
      return NextResponse.json(
        { success: false, error: "ID de sesión requerido" },
        { status: 400 }
      );
    }

    const updates: string[] = [];
    const params: any[] = [];

    if (estado) {
      updates.push("estado = ?");
      params.push(estado);

      if (estado === "en_curso") {
        updates.push("fecha_hora_inicio_real = NOW()");
      }

      if (estado === "finalizada") {
        updates.push("fecha_hora_fin_real = NOW()");
        updates.push(
          "duracion_segundos = TIMESTAMPDIFF(SECOND, fecha_hora_inicio_real, NOW())"
        );
      }
    }

    if (calidad_conexion) {
      updates.push("calidad_conexion = ?");
      params.push(calidad_conexion);
    }

    if (evaluacion_medico !== undefined) {
      updates.push("evaluacion_medico = ?");
      params.push(evaluacion_medico);
    }

    params.push(id_sesion, medico.id_medico);

    await pool.query(
      `UPDATE telemedicina_sesiones SET ${updates.join(
        ", "
      )} WHERE id_sesion = ? AND id_medico = ?`,
      params
    );

    return NextResponse.json(
      {
        success: true,
        message: "Sesión actualizada exitosamente",
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("❌ Error en PUT /api/telemedicina/sesiones:", error);
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
