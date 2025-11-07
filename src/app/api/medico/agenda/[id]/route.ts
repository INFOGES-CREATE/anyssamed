// frontend/src/app/api/medico/agenda/route.ts
import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { RowDataPacket, ResultSetHeader } from "mysql2";

// las mismas helpers que tienes en [id]/route.ts
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

async function obtenerMedicoAutenticado(idUsuario: number) {
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
  if (rows.length === 0) return null;
  return rows[0] as {
    id_medico: number;
    id_usuario: number;
    id_centro_principal: number;
  };
}

// =================== GET /api/medico/agenda ===================
export async function GET(request: NextRequest) {
  try {
    const sessionToken = getSessionToken(request);
    if (!sessionToken) {
      return NextResponse.json(
        { success: false, error: "No hay sesión activa" },
        { status: 401 }
      );
    }

    // validar sesión
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

    // leer filtros del query
    const { searchParams } = new URL(request.url);
    const fechaInicio = searchParams.get("fecha_inicio");
    const fechaFin = searchParams.get("fecha_fin");

    // base
    let where = `c.id_medico = ${medico.id_medico}`;
    if (fechaInicio) {
      where += ` AND DATE(c.fecha_hora_inicio) >= '${fechaInicio}'`;
    }
    if (fechaFin) {
      where += ` AND DATE(c.fecha_hora_inicio) <= '${fechaFin}'`;
    }

    const [citas] = await pool.query<RowDataPacket[]>(
      `
      SELECT 
        c.*,
        p.id_paciente,
        CONCAT(p.nombre, ' ', p.apellido_paterno, ' ', COALESCE(p.apellido_materno,'')) AS paciente_nombre_completo,
        TIMESTAMPDIFF(YEAR, p.fecha_nacimiento, CURDATE()) AS paciente_edad,
        p.genero AS paciente_genero,
        p.telefono AS paciente_telefono,
        p.email AS paciente_email,
        s.id_sala,
        s.nombre AS sala_nombre,
        e.id_especialidad,
        e.nombre AS especialidad_nombre
      FROM citas c
        INNER JOIN pacientes p ON c.id_paciente = p.id_paciente
        LEFT JOIN salas s ON c.id_sala = s.id_sala
        LEFT JOIN especialidades e ON c.id_especialidad = e.id_especialidad
      WHERE ${where}
      ORDER BY c.fecha_hora_inicio ASC
      `
    );

    // estadísticas sencillas
    const total_citas = citas.length;
    const confirmadas = citas.filter((c) => c.confirmado_por_paciente === 1 || c.confirmado_por_paciente === true).length;
    const completadas = citas.filter((c) => c.estado === "completada").length;
    const canceladas = citas.filter((c) => c.estado === "cancelada").length;
    const en_sala_espera = citas.filter((c) => c.estado === "en_sala_espera").length;

    // ojo con toFixed: primero a número
    const tasa_asistencia =
      total_citas > 0 ? Number((completadas / total_citas) * 100) : 0;
    const tasa_confirmacion =
      total_citas > 0 ? Number((confirmadas / total_citas) * 100) : 0;

    return NextResponse.json(
      {
        success: true,
        citas: citas.map((c) => ({
          id_cita: c.id_cita,
          id_paciente: c.id_paciente,
          id_medico: c.id_medico,
          id_centro: c.id_centro,
          id_sucursal: c.id_sucursal,
          fecha_hora_inicio: c.fecha_hora_inicio,
          fecha_hora_fin: c.fecha_hora_fin,
          duracion_minutos: c.duracion_minutos,
          tipo_cita: c.tipo_cita,
          motivo: c.motivo,
          estado: c.estado,
          prioridad: c.prioridad,
          id_especialidad: c.id_especialidad,
          origen: c.origen,
          pagada: !!c.pagada,
          monto: c.monto,
          id_sala: c.id_sala,
          notas: c.notas,
          notas_privadas: c.notas_privadas,
          recordatorio_enviado: !!c.recordatorio_enviado,
          confirmacion_enviada: !!c.confirmacion_enviada,
          confirmado_por_paciente: !!c.confirmado_por_paciente,
          paciente: {
            id_paciente: c.id_paciente,
            nombre_completo: c.paciente_nombre_completo,
            edad: c.paciente_edad,
            genero: c.paciente_genero,
            telefono: c.paciente_telefono,
            email: c.paciente_email,
            foto_url: null,
            grupo_sanguineo: "N/D",
            alergias_criticas: 0,
          },
          sala: c.id_sala
            ? {
                id_sala: c.id_sala,
                nombre: c.sala_nombre,
                tipo: "consulta",
              }
            : null,
          especialidad: c.id_especialidad
            ? {
                id_especialidad: c.id_especialidad,
                nombre: c.especialidad_nombre,
              }
            : null,
        })),
        estadisticas: {
          total_citas,
          confirmadas,
          pendientes: citas.filter((c) => c.estado === "programada").length,
          completadas,
          canceladas,
          no_asistio: citas.filter((c) => c.estado === "no_asistio").length,
          en_sala_espera,
          tasa_asistencia,
          tasa_confirmacion,
          duracion_promedio: 0,
          tiempo_promedio_espera: 0,
          horas_agendadas: 0,
          horas_disponibles: 0,
          ocupacion: tasa_asistencia,
          ingresos_estimados: 0,
          ingresos_reales: 0,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("❌ Error en GET /api/medico/agenda:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Error interno del servidor",
        details: error?.message,
      },
      { status: 500 }
    );
  }
}

// =================== POST /api/medico/agenda ===================
export async function POST(request: NextRequest) {
  try {
    const sessionToken = getSessionToken(request);
    if (!sessionToken) {
      return NextResponse.json(
        { success: false, error: "No hay sesión activa" },
        { status: 401 }
      );
    }

    // validar sesión
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
      id_paciente,
      fecha_hora_inicio,
      fecha_hora_fin,
      duracion_minutos,
      tipo_cita,
      motivo,
      id_especialidad,
      id_sala,
      prioridad,
      notas,
      notas_privadas,
      monto,
      enviar_recordatorio,
      enviar_confirmacion,
      tipo_atencion,
      origen,
    } = body;

    if (!id_paciente || !fecha_hora_inicio || !fecha_hora_fin) {
      return NextResponse.json(
        { success: false, error: "Faltan campos obligatorios" },
        { status: 400 }
      );
    }

    // insertar
    const [result] = await pool.query<ResultSetHeader>(
      `
      INSERT INTO citas (
        id_paciente,
        id_medico,
        id_centro,
        fecha_hora_inicio,
        fecha_hora_fin,
        duracion_minutos,
        tipo_cita,
        motivo,
        id_especialidad,
        id_sala,
        prioridad,
        notas,
        notas_privadas,
        monto,
        origen,
        estado,
        creado_por
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'programada', ?)
      `,
      [
        id_paciente,
        medico.id_medico,
        medico.id_centro_principal,
        fecha_hora_inicio.replace("T", " "),
        fecha_hora_fin.replace("T", " "),
        duracion_minutos ?? 30,
        tipo_cita ?? "control",
        motivo ?? "",
        id_especialidad ?? null,
        id_sala ?? null,
        prioridad ?? "normal",
        notas ?? "",
        notas_privadas ?? "",
        monto ?? null,
        origen ?? "web",
        idUsuario,
      ]
    );

    return NextResponse.json(
      {
        success: true,
        message: "Cita creada exitosamente",
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
        details: error?.message,
      },
      { status: 500 }
    );
  }
}
