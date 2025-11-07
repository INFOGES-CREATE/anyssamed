// app/api/medico/agenda/route.ts
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

interface Cita {
  id_cita: number;
  id_paciente: number;
  id_medico: number;
  fecha_hora_inicio: string;
  fecha_hora_fin: string;
  duracion_minutos: number;
  tipo_cita: string;
  estado: string;
  prioridad: string;
  motivo: string | null;
  notas: string | null;
  confirmado_por_paciente: boolean;
  pagada: boolean;
  monto: number | null;
}

interface EstadisticasAgenda {
  total_citas: number;
  confirmadas: number;
  pendientes: number;
  completadas: number;
  canceladas: number;
  no_asistio: number;
  en_sala_espera: number;
  tasa_asistencia: number;
  tasa_confirmacion: number;
  duracion_promedio: number;
  tiempo_promedio_espera: number;
  horas_agendadas: number;
  horas_disponibles: number;
  ocupacion: number;
  ingresos_estimados: number;
  ingresos_reales: number;
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
 * Obtiene la información del médico autenticado
 */
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

/**
 * Obtiene las citas del médico según filtros
 */
async function obtenerCitas(
  idMedico: number,
  fechaInicio: string,
  fechaFin: string,
  estados?: string[],
  tipos?: string[],
  paciente?: string
): Promise<any[]> {
  try {
    let query = `
      SELECT 
        c.id_cita,
        c.id_paciente,
        c.id_medico,
        c.id_centro,
        c.id_sucursal,
        c.fecha_hora_inicio,
        c.fecha_hora_fin,
        c.duracion_minutos,
        c.tipo_cita,
        c.motivo,
        c.estado,
        c.prioridad,
        c.id_especialidad,
        c.origen,
        c.pagada,
        c.monto,
        c.id_sala,
        c.notas,
        c.notas_privadas,
        c.recordatorio_enviado,
        c.fecha_recordatorio,
        c.confirmacion_enviada,
        c.fecha_confirmacion,
        c.confirmado_por_paciente,
        
        -- Datos del paciente
        p.id_paciente,
        CONCAT(p.nombre, ' ', p.apellido_paterno, ' ', COALESCE(p.apellido_materno, '')) as paciente_nombre_completo,
        TIMESTAMPDIFF(YEAR, p.fecha_nacimiento, CURDATE()) as paciente_edad,
        p.genero as paciente_genero,
        p.telefono as paciente_telefono,
        p.email as paciente_email,
        p.foto_url as paciente_foto_url,
        p.grupo_sanguineo as paciente_grupo_sanguineo,
        
        -- Contar alergias críticas
        (
          SELECT COUNT(*)
          FROM alergias
          WHERE id_paciente = p.id_paciente
            AND estado = 'activa'
            AND severidad IN ('severa', 'fatal')
        ) as paciente_alergias_criticas,
        
        -- Datos de la sala
        s.id_sala,
        s.nombre as sala_nombre,
        s.tipo as sala_tipo,
        
        -- Datos de la especialidad
        e.id_especialidad,
        e.nombre as especialidad_nombre
        
      FROM citas c
      INNER JOIN pacientes p ON c.id_paciente = p.id_paciente
      LEFT JOIN salas s ON c.id_sala = s.id_sala
      LEFT JOIN especialidades e ON c.id_especialidad = e.id_especialidad
      WHERE c.id_medico = ?
        AND DATE(c.fecha_hora_inicio) BETWEEN ? AND ?
    `;

    const params: any[] = [idMedico, fechaInicio, fechaFin];

    // Filtro por estados
    if (estados && estados.length > 0) {
      query += ` AND c.estado IN (${estados.map(() => "?").join(",")})`;
      params.push(...estados);
    }

    // Filtro por tipos
    if (tipos && tipos.length > 0) {
      query += ` AND c.tipo_cita IN (${tipos.map(() => "?").join(",")})`;
      params.push(...tipos);
    }

    // Filtro por paciente
    if (paciente && paciente.trim()) {
      query += ` AND (
        CONCAT(p.nombre, ' ', p.apellido_paterno, ' ', COALESCE(p.apellido_materno, '')) LIKE ?
        OR p.rut LIKE ?
        OR p.email LIKE ?
      )`;
      const searchTerm = `%${paciente}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }

    query += ` ORDER BY c.fecha_hora_inicio ASC`;

    const [rows] = await pool.query<RowDataPacket[]>(query, params);

    // Formatear los resultados
    return rows.map((row) => ({
      id_cita: row.id_cita,
      id_paciente: row.id_paciente,
      id_medico: row.id_medico,
      id_centro: row.id_centro,
      id_sucursal: row.id_sucursal,
      fecha_hora_inicio: row.fecha_hora_inicio,
      fecha_hora_fin: row.fecha_hora_fin,
      duracion_minutos: row.duracion_minutos,
      tipo_cita: row.tipo_cita,
      motivo: row.motivo,
      estado: row.estado,
      prioridad: row.prioridad,
      id_especialidad: row.id_especialidad,
      origen: row.origen,
      pagada: row.pagada === 1,
      monto: row.monto,
      id_sala: row.id_sala,
      notas: row.notas,
      notas_privadas: row.notas_privadas,
      recordatorio_enviado: row.recordatorio_enviado === 1,
      fecha_recordatorio: row.fecha_recordatorio,
      confirmacion_enviada: row.confirmacion_enviada === 1,
      fecha_confirmacion: row.fecha_confirmacion,
      confirmado_por_paciente: row.confirmado_por_paciente === 1,
      paciente: {
        id_paciente: row.id_paciente,
        nombre_completo: row.paciente_nombre_completo,
        edad: row.paciente_edad,
        genero: row.paciente_genero,
        telefono: row.paciente_telefono,
        email: row.paciente_email,
        foto_url: row.paciente_foto_url,
        grupo_sanguineo: row.paciente_grupo_sanguineo || "N/A",
        alergias_criticas: row.paciente_alergias_criticas,
      },
      sala: row.id_sala
        ? {
            id_sala: row.id_sala,
            nombre: row.sala_nombre,
            tipo: row.sala_tipo,
          }
        : null,
      especialidad: row.id_especialidad
        ? {
            id_especialidad: row.id_especialidad,
            nombre: row.especialidad_nombre,
          }
        : null,
    }));
  } catch (error) {
    console.error("Error al obtener citas:", error);
    throw error;
  }
}

/**
 * Obtiene los bloques horarios del médico
 */
async function obtenerBloquesHorarios(
  idMedico: number,
  fechaInicio: string,
  fechaFin: string
): Promise<any[]> {
  try {
    const [rows] = await pool.query<RowDataPacket[]>(
      `
      SELECT 
        b.id_bloque,
        b.id_medico,
        b.fecha_inicio,
        b.fecha_fin,
        b.duracion_minutos,
        b.estado,
        b.tipo_atencion,
        b.id_sala,
        b.cupo_maximo,
        b.cupo_actual,
        b.visible_web,
        s.nombre as sala_nombre
      FROM bloques_horarios b
      LEFT JOIN salas s ON b.id_sala = s.id_sala
      WHERE b.id_medico = ?
        AND DATE(b.fecha_inicio) BETWEEN ? AND ?
      ORDER BY b.fecha_inicio ASC
      `,
      [idMedico, fechaInicio, fechaFin]
    );

    return rows.map((row) => ({
      id_bloque: row.id_bloque,
      id_medico: row.id_medico,
      fecha_inicio: row.fecha_inicio,
      fecha_fin: row.fecha_fin,
      duracion_minutos: row.duracion_minutos,
      estado: row.estado,
      tipo_atencion: row.tipo_atencion,
      id_sala: row.id_sala,
      cupo_maximo: row.cupo_maximo,
      cupo_actual: row.cupo_actual,
      visible_web: row.visible_web === 1,
      sala_nombre: row.sala_nombre,
    }));
  } catch (error) {
    console.error("Error al obtener bloques horarios:", error);
    throw error;
  }
}

/**
 * Calcula las estadísticas de la agenda
 */
async function calcularEstadisticas(
  idMedico: number,
  fechaInicio: string,
  fechaFin: string
): Promise<EstadisticasAgenda> {
  try {
    const [estadisticas] = await pool.query<RowDataPacket[]>(
      `
      SELECT 
        COUNT(*) as total_citas,
        SUM(CASE WHEN estado = 'confirmada' THEN 1 ELSE 0 END) as confirmadas,
        SUM(CASE WHEN estado IN ('programada', 'pendiente') THEN 1 ELSE 0 END) as pendientes,
        SUM(CASE WHEN estado = 'completada' THEN 1 ELSE 0 END) as completadas,
        SUM(CASE WHEN estado = 'cancelada' THEN 1 ELSE 0 END) as canceladas,
        SUM(CASE WHEN estado = 'no_asistio' THEN 1 ELSE 0 END) as no_asistio,
        SUM(CASE WHEN estado = 'en_sala_espera' THEN 1 ELSE 0 END) as en_sala_espera,
        SUM(CASE WHEN confirmado_por_paciente = 1 THEN 1 ELSE 0 END) as total_confirmadas,
        AVG(duracion_minutos) as duracion_promedio,
        SUM(duracion_minutos) / 60 as horas_agendadas,
        SUM(CASE WHEN pagada = 1 THEN monto ELSE 0 END) as ingresos_reales,
        SUM(monto) as ingresos_estimados
      FROM citas
      WHERE id_medico = ?
        AND DATE(fecha_hora_inicio) BETWEEN ? AND ?
      `,
      [idMedico, fechaInicio, fechaFin]
    );

    const stats = estadisticas[0];

    // Calcular horas disponibles (8 horas por día hábil)
    const diasHabiles = calcularDiasHabiles(fechaInicio, fechaFin);
    const horas_disponibles = diasHabiles * 8;

    // Calcular tasas
    const tasa_asistencia =
      stats.total_citas > 0
        ? (stats.completadas / stats.total_citas) * 100
        : 0;
    const tasa_confirmacion =
      stats.total_citas > 0
        ? (stats.total_confirmadas / stats.total_citas) * 100
        : 0;
    const ocupacion =
      horas_disponibles > 0
        ? (stats.horas_agendadas / horas_disponibles) * 100
        : 0;

    return {
      total_citas: stats.total_citas || 0,
      confirmadas: stats.confirmadas || 0,
      pendientes: stats.pendientes || 0,
      completadas: stats.completadas || 0,
      canceladas: stats.canceladas || 0,
      no_asistio: stats.no_asistio || 0,
      en_sala_espera: stats.en_sala_espera || 0,
      tasa_asistencia: parseFloat(tasa_asistencia.toFixed(2)),
      tasa_confirmacion: parseFloat(tasa_confirmacion.toFixed(2)),
      duracion_promedio: parseFloat((stats.duracion_promedio || 0).toFixed(2)),
      tiempo_promedio_espera: 0, // TODO: Implementar cálculo
      horas_agendadas: parseFloat((stats.horas_agendadas || 0).toFixed(2)),
      horas_disponibles: horas_disponibles,
      ocupacion: parseFloat(ocupacion.toFixed(2)),
      ingresos_estimados: parseFloat(stats.ingresos_estimados || 0),
      ingresos_reales: parseFloat(stats.ingresos_reales || 0),
    };
  } catch (error) {
    console.error("Error al calcular estadísticas:", error);
    throw error;
  }
}

/**
 * Calcula días hábiles entre dos fechas
 */
function calcularDiasHabiles(fechaInicio: string, fechaFin: string): number {
  const inicio = new Date(fechaInicio);
  const fin = new Date(fechaFin);
  let dias = 0;

  for (let d = new Date(inicio); d <= fin; d.setDate(d.getDate() + 1)) {
    const diaSemana = d.getDay();
    if (diaSemana !== 0 && diaSemana !== 6) {
      // No es domingo ni sábado
      dias++;
    }
  }

  return dias;
}

/**
 * Valida disponibilidad para una nueva cita
 */
async function validarDisponibilidad(
  idMedico: number,
  fechaInicio: string,
  fechaFin: string,
  idCitaExcluir?: number
): Promise<boolean> {
  try {
    let query = `
      SELECT COUNT(*) as conflictos
      FROM citas
      WHERE id_medico = ?
        AND estado NOT IN ('cancelada', 'no_asistio')
        AND (
          (fecha_hora_inicio <= ? AND fecha_hora_fin > ?)
          OR (fecha_hora_inicio < ? AND fecha_hora_fin >= ?)
          OR (fecha_hora_inicio >= ? AND fecha_hora_fin <= ?)
        )
    `;

    const params: any[] = [
      idMedico,
      fechaInicio,
      fechaInicio,
      fechaFin,
      fechaFin,
      fechaInicio,
      fechaFin,
    ];

    if (idCitaExcluir) {
      query += ` AND id_cita != ?`;
      params.push(idCitaExcluir);
    }

    const [rows] = await pool.query<RowDataPacket[]>(query, params);

    return rows[0].conflictos === 0;
  } catch (error) {
    console.error("Error al validar disponibilidad:", error);
    throw error;
  }
}

// ========================================
// HANDLER GET - Obtener citas
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
        {
          success: false,
          error: "Sesión inválida o expirada",
        },
        { status: 401 }
      );
    }

    const idUsuario = sesiones[0].id_usuario;

    // 3. Verificar que sea médico
    const medico = await obtenerMedicoAutenticado(idUsuario);

    if (!medico) {
      return NextResponse.json(
        {
          success: false,
          error: "No tienes un registro de médico activo",
        },
        { status: 403 }
      );
    }

    // 4. Obtener parámetros de consulta
    const searchParams = request.nextUrl.searchParams;
    const fechaInicio = searchParams.get("fecha_inicio") || new Date().toISOString().split("T")[0];
    const fechaFin = searchParams.get("fecha_fin") || new Date().toISOString().split("T")[0];
    const estados = searchParams.get("estados")?.split(",");
    const tipos = searchParams.get("tipos")?.split(",");
    const paciente = searchParams.get("paciente") || "";

    // 5. Actualizar última actividad
    await pool.query(
      `UPDATE sesiones_usuarios SET ultima_actividad = NOW() WHERE token = ?`,
      [sessionToken]
    );

    // 6. Obtener datos
    const [citas, bloquesHorarios, estadisticas] = await Promise.all([
      obtenerCitas(medico.id_medico, fechaInicio, fechaFin, estados, tipos, paciente),
      obtenerBloquesHorarios(medico.id_medico, fechaInicio, fechaFin),
      calcularEstadisticas(medico.id_medico, fechaInicio, fechaFin),
    ]);

    // 7. Respuesta exitosa
    return NextResponse.json(
      {
        success: true,
        citas,
        bloques_horarios: bloquesHorarios,
        estadisticas,
        filtros: {
          fecha_inicio: fechaInicio,
          fecha_fin: fechaFin,
          estados: estados || [],
          tipos: tipos || [],
          paciente: paciente || "",
        },
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("❌ Error en GET /api/medico/agenda:", error);

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
// HANDLER POST - Crear nueva cita
// ========================================

export async function POST(request: NextRequest) {
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
        {
          success: false,
          error: "Sesión inválida o expirada",
        },
        { status: 401 }
      );
    }

    const idUsuario = sesiones[0].id_usuario;

    // 3. Verificar que sea médico
    const medico = await obtenerMedicoAutenticado(idUsuario);

    if (!medico) {
      return NextResponse.json(
        {
          success: false,
          error: "No tienes un registro de médico activo",
        },
        { status: 403 }
      );
    }

    // 4. Obtener datos del body
    const body = await request.json();

    const {
      id_paciente,
      fecha_hora_inicio,
      duracion_minutos = 30,
      tipo_cita = "control",
      motivo,
      notas,
      id_especialidad,
      id_sala,
      prioridad = "normal",
      origen = "web",
      monto,
    } = body;

    // 5. Validar datos requeridos
    if (!id_paciente || !fecha_hora_inicio) {
      return NextResponse.json(
        {
          success: false,
          error: "Faltan datos requeridos",
        },
        { status: 400 }
      );
    }

    // 6. Calcular fecha de fin
    const fechaInicio = new Date(fecha_hora_inicio);
    const fechaFin = new Date(fechaInicio.getTime() + duracion_minutos * 60000);

    // 7. Validar disponibilidad
    const disponible = await validarDisponibilidad(
      medico.id_medico,
      fechaInicio.toISOString(),
      fechaFin.toISOString()
    );

    if (!disponible) {
      return NextResponse.json(
        {
          success: false,
          error: "El horario seleccionado no está disponible",
        },
        { status: 409 }
      );
    }

    // 8. Insertar cita
    const [result] = await pool.query<ResultSetHeader>(
      `
      INSERT INTO citas (
        id_paciente,
        id_medico,
        id_centro,
        id_sucursal,
        fecha_hora_inicio,
        fecha_hora_fin,
        duracion_minutos,
        tipo_cita,
        motivo,
        estado,
        prioridad,
        id_especialidad,
        origen,
        pagada,
        monto,
        id_sala,
        notas,
        creado_por
      ) VALUES (?, ?, ?, NULL, ?, ?, ?, ?, ?, 'programada', ?, ?, ?, 0, ?, ?, ?, ?)
      `,
      [
        id_paciente,
        medico.id_medico,
        medico.id_centro_principal,
        fechaInicio.toISOString(),
        fechaFin.toISOString(),
        duracion_minutos,
        tipo_cita,
        motivo || null,
        prioridad,
        id_especialidad || null,
        origen,
        monto || null,
        id_sala || null,
        notas || null,
        idUsuario,
      ]
    );

    // 9. Obtener la cita creada
    const [citaNueva] = await pool.query<RowDataPacket[]>(
      `SELECT * FROM citas WHERE id_cita = ?`,
      [result.insertId]
    );

    // 10. Respuesta exitosa
    return NextResponse.json(
      {
        success: true,
        message: "Cita creada exitosamente",
        cita: citaNueva[0],
        id_cita: result.insertId,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("❌ Error en POST /api/medico/agenda:", error);

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
// HANDLER PUT - Actualizar cita
// ========================================

export async function PUT(request: NextRequest) {
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
        {
          success: false,
          error: "Sesión inválida o expirada",
        },
        { status: 401 }
      );
    }

    const idUsuario = sesiones[0].id_usuario;

    // 3. Verificar que sea médico
    const medico = await obtenerMedicoAutenticado(idUsuario);

    if (!medico) {
      return NextResponse.json(
        {
          success: false,
          error: "No tienes un registro de médico activo",
        },
        { status: 403 }
      );
    }

    // 4. Obtener datos del body
    const body = await request.json();

    const {
      id_cita,
      fecha_hora_inicio,
      duracion_minutos,
      tipo_cita,
      motivo,
      notas,
      estado,
      prioridad,
      id_especialidad,
      id_sala,
      monto,
    } = body;

    // 5. Validar que la cita existe y pertenece al médico
    const [citaActual] = await pool.query<RowDataPacket[]>(
      `SELECT * FROM citas WHERE id_cita = ? AND id_medico = ?`,
      [id_cita, medico.id_medico]
    );

    if (citaActual.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Cita no encontrada",
        },
        { status: 404 }
      );
    }

    // 6. Si se cambia el horario, validar disponibilidad
    if (fecha_hora_inicio || duracion_minutos) {
      const fechaInicio = fecha_hora_inicio
        ? new Date(fecha_hora_inicio)
        : new Date(citaActual[0].fecha_hora_inicio);
      const duracion = duracion_minutos || citaActual[0].duracion_minutos;
      const fechaFin = new Date(fechaInicio.getTime() + duracion * 60000);

      const disponible = await validarDisponibilidad(
        medico.id_medico,
        fechaInicio.toISOString(),
        fechaFin.toISOString(),
        id_cita
      );

      if (!disponible) {
        return NextResponse.json(
          {
            success: false,
            error: "El horario seleccionado no está disponible",
          },
          { status: 409 }
        );
      }
    }

    // 7. Construir query de actualización
    const updates: string[] = [];
    const params: any[] = [];

    if (fecha_hora_inicio) {
      updates.push("fecha_hora_inicio = ?");
      params.push(fecha_hora_inicio);

      const duracion = duracion_minutos || citaActual[0].duracion_minutos;
      const fechaFin = new Date(
        new Date(fecha_hora_inicio).getTime() + duracion * 60000
      );
      updates.push("fecha_hora_fin = ?");
      params.push(fechaFin.toISOString());
    }

    if (duracion_minutos) {
      updates.push("duracion_minutos = ?");
      params.push(duracion_minutos);

      if (!fecha_hora_inicio) {
        const fechaFin = new Date(
          new Date(citaActual[0].fecha_hora_inicio).getTime() +
            duracion_minutos * 60000
        );
        updates.push("fecha_hora_fin = ?");
        params.push(fechaFin.toISOString());
      }
    }

    if (tipo_cita) {
      updates.push("tipo_cita = ?");
      params.push(tipo_cita);
    }

    if (motivo !== undefined) {
      updates.push("motivo = ?");
      params.push(motivo);
    }

    if (notas !== undefined) {
      updates.push("notas = ?");
      params.push(notas);
    }

    if (estado) {
      updates.push("estado = ?");
      params.push(estado);
    }

    if (prioridad) {
      updates.push("prioridad = ?");
      params.push(prioridad);
    }

    if (id_especialidad !== undefined) {
      updates.push("id_especialidad = ?");
      params.push(id_especialidad);
    }

    if (id_sala !== undefined) {
      updates.push("id_sala = ?");
      params.push(id_sala);
    }

    if (monto !== undefined) {
      updates.push("monto = ?");
      params.push(monto);
    }

    updates.push("modificado_por = ?");
    params.push(idUsuario);

    params.push(id_cita);

    // 8. Ejecutar actualización
    await pool.query(
      `UPDATE citas SET ${updates.join(", ")} WHERE id_cita = ?`,
      params
    );

    // 9. Obtener cita actualizada
    const [citaActualizada] = await pool.query<RowDataPacket[]>(
      `SELECT * FROM citas WHERE id_cita = ?`,
      [id_cita]
    );

    // 10. Respuesta exitosa
    return NextResponse.json(
      {
        success: true,
        message: "Cita actualizada exitosamente",
        cita: citaActualizada[0],
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("❌ Error en PUT /api/medico/agenda:", error);

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
// HANDLER DELETE - Cancelar cita
// ========================================

export async function DELETE(request: NextRequest) {
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
        {
          success: false,
          error: "Sesión inválida o expirada",
        },
        { status: 401 }
      );
    }

    const idUsuario = sesiones[0].id_usuario;

    // 3. Verificar que sea médico
    const medico = await obtenerMedicoAutenticado(idUsuario);

    if (!medico) {
      return NextResponse.json(
        {
          success: false,
          error: "No tienes un registro de médico activo",
        },
        { status: 403 }
      );
    }

    // 4. Obtener parámetros
    const searchParams = request.nextUrl.searchParams;
    const idCita = searchParams.get("id_cita");
    const motivo = searchParams.get("motivo") || "Cancelada por el médico";

    if (!idCita) {
      return NextResponse.json(
        {
          success: false,
          error: "ID de cita requerido",
        },
        { status: 400 }
      );
    }

    // 5. Validar que la cita existe y pertenece al médico
    const [cita] = await pool.query<RowDataPacket[]>(
      `SELECT * FROM citas WHERE id_cita = ? AND id_medico = ?`,
      [idCita, medico.id_medico]
    );

    if (cita.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Cita no encontrada",
        },
        { status: 404 }
      );
    }

    // 6. Actualizar estado de la cita
    await pool.query(
      `UPDATE citas SET estado = 'cancelada', modificado_por = ? WHERE id_cita = ?`,
      [idUsuario, idCita]
    );

    // 7. Registrar la cancelación
    await pool.query(
      `
      INSERT INTO cancelaciones (
        id_cita,
        fecha_cancelacion,
        motivo,
        detalle_motivo,
        cancelado_por,
        cancelado_por_tipo
      ) VALUES (?, NOW(), 'medico_solicita', ?, ?, 'medico')
      `,
      [idCita, motivo, idUsuario]
    );

    // 8. Respuesta exitosa
    return NextResponse.json(
      {
        success: true,
        message: "Cita cancelada exitosamente",
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("❌ Error en DELETE /api/medico/agenda:", error);

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