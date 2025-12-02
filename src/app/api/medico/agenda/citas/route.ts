// app/api/medico/agenda/citas/route.ts
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { RowDataPacket, ResultSetHeader } from "mysql2";

// ============================
// helpers de sesión
// ============================
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

function toMySQLDateTime(d: Date) {
  return d.toISOString().slice(0, 19).replace("T", " ");
}

function addMinutes(date: Date, minutes: number) {
  return new Date(date.getTime() + minutes * 60 * 1000);
}

// enums válidos según tu DDL
const TIPOS_CITA_VALIDOS = new Set([
  "primera_vez",
  "control",
  "procedimiento",
  "urgencia",
  "telemedicina",
]);

const ESTADOS_CITA_VALIDOS = new Set([
  "programada",
  "confirmada",
  "en_sala_espera",
  "en_atencion",
  "completada",
  "cancelada",
  "no_asistio",
  "reprogramada",
]);

const PRIORIDADES_VALIDAS = new Set(["normal", "alta", "urgente"]);

const ORIGENES_VALIDOS = new Set([
  "presencial",
  "telefono",
  "web",
  "whatsapp",
  "chatbot",
  "app_movil",
]);

// ======================================================
// GET: listar citas del médico en un rango
// ======================================================
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const now = new Date();
    const fechaInicioParam = searchParams.get("fecha_inicio");
    const fechaFinParam = searchParams.get("fecha_fin");

    let fechaInicio: string;
    let fechaFin: string;

    if (fechaInicioParam && fechaFinParam) {
      const fi = new Date(fechaInicioParam);
      const ff = new Date(fechaFinParam);
      if (isNaN(fi.getTime()) || isNaN(ff.getTime())) {
        return NextResponse.json(
          { success: false, error: "Fechas inválidas" },
          { status: 400 }
        );
      }
      fi.setHours(0, 0, 0, 0);
      ff.setHours(23, 59, 59, 999);
      fechaInicio = toMySQLDateTime(fi);
      fechaFin = toMySQLDateTime(ff);
    } else {
      const fi = new Date(now);
      const ff = new Date(now);
      fi.setHours(0, 0, 0, 0);
      ff.setHours(23, 59, 59, 999);
      fechaInicio = toMySQLDateTime(fi);
      fechaFin = toMySQLDateTime(ff);
    }

    // sesión
    const sessionToken = getSessionToken(request);
    if (!sessionToken) {
      return NextResponse.json(
        { success: false, error: "No hay sesión activa" },
        { status: 401 }
      );
    }

    // obtener médico de la sesión
    const [sesiones] = await pool.query<RowDataPacket[]>(
      `
      SELECT su.id_usuario, m.id_medico, m.id_centro
      FROM sesiones_usuarios su
      INNER JOIN medicos m ON su.id_usuario = m.id_usuario
      WHERE su.token = ?
        AND su.activa = 1
        AND su.fecha_expiracion > NOW()
        AND m.estado = 'activo'
      LIMIT 1
      `,
      [sessionToken]
    );

    if (sesiones.length === 0) {
      return NextResponse.json(
        { success: false, error: "Sesión inválida o médico no activo" },
        { status: 401 }
      );
    }

    const idMedico = sesiones[0].id_medico;

    // actualizar última actividad
    await pool.query(
      `UPDATE sesiones_usuarios SET ultima_actividad = NOW() WHERE token = ?`,
      [sessionToken]
    );

    // citas
    const [citas] = await pool.query<RowDataPacket[]>(
      `
      SELECT 
        c.id_cita,
        c.id_centro,
        c.id_sucursal,
        c.fecha_hora_inicio,
        c.fecha_hora_fin,
        c.duracion_minutos,
        c.tipo_cita,
        c.estado,
        c.prioridad,
        c.motivo,
        c.notas,
        c.notas_privadas,
        c.confirmado_por_paciente,
        c.recordatorio_enviado,
        c.pagada,
        c.monto,
        c.origen,
        c.id_cita_anterior,
        p.id_paciente,
        CONCAT(p.nombre, ' ', p.apellido_paterno, ' ', COALESCE(p.apellido_materno, '')) AS nombre_completo,
        TIMESTAMPDIFF(YEAR, p.fecha_nacimiento, CURDATE()) AS edad,
        p.genero,
        p.foto_url,
        p.telefono,
        p.celular,
        p.email,
        p.grupo_sanguineo,
        p.rut,
        s.id_sala,
        s.nombre AS sala_nombre,
        s.tipo AS sala_tipo,
        e.id_especialidad,
        e.nombre AS especialidad_nombre
      FROM citas c
      INNER JOIN pacientes p ON c.id_paciente = p.id_paciente
      LEFT JOIN salas s ON c.id_sala = s.id_sala
      LEFT JOIN especialidades e ON c.id_especialidad = e.id_especialidad
      WHERE c.id_medico = ?
        AND c.fecha_hora_inicio BETWEEN ? AND ?
      ORDER BY c.fecha_hora_inicio ASC
      `,
      [idMedico, fechaInicio, fechaFin]
    );

    const citasFormateadas = citas.map((cita) => ({
      id_cita: cita.id_cita,
      id_centro: cita.id_centro,
      id_sucursal: cita.id_sucursal,
      fecha_hora_inicio: cita.fecha_hora_inicio,
      fecha_hora_fin: cita.fecha_hora_fin,
      duracion_minutos: cita.duracion_minutos,
      tipo_cita: cita.tipo_cita,
      // modalidad la derivamos del tipo o del origen
      modalidad: cita.tipo_cita === "telemedicina" ? "telemedicina" : "presencial",
      estado: cita.estado,
      prioridad: cita.prioridad,
      paciente: {
        id_paciente: cita.id_paciente,
        nombre_completo: cita.nombre_completo,
        edad: cita.edad,
        genero: cita.genero,
        foto_url: cita.foto_url,
        telefono: cita.telefono,
        celular: cita.celular,
        email: cita.email,
        grupo_sanguineo: cita.grupo_sanguineo,
        rut: cita.rut,
      },
      motivo: cita.motivo,
      notas: cita.notas,
      notas_privadas: cita.notas_privadas,
      sala: cita.id_sala
        ? {
            id_sala: cita.id_sala,
            nombre: cita.sala_nombre,
            tipo: cita.sala_tipo,
          }
        : null,
      especialidad: cita.id_especialidad
        ? {
            id_especialidad: cita.id_especialidad,
            nombre: cita.especialidad_nombre,
          }
        : null,
      confirmado_por_paciente: Boolean(cita.confirmado_por_paciente),
      recordatorio_enviado: Boolean(cita.recordatorio_enviado),
      pagada: Boolean(cita.pagada),
      monto: cita.monto,
      origen: cita.origen,
      id_cita_anterior: cita.id_cita_anterior,
    }));

    // bloques horarios
    const [bloques] = await pool.query<RowDataPacket[]>(
      `
      SELECT 
        bh.id_bloque,
        bh.id_centro,
        bh.id_sucursal,
        bh.fecha_inicio,
        bh.fecha_fin,
        bh.duracion_minutos,
        bh.estado,
        bh.tipo_atencion,
        bh.cupo_maximo,
        bh.cupo_actual,
        bh.visible_web,
        s.id_sala,
        s.nombre AS sala_nombre
      FROM bloques_horarios bh
      LEFT JOIN salas s ON bh.id_sala = s.id_sala
      WHERE bh.id_medico = ?
        AND bh.fecha_inicio BETWEEN ? AND ?
      ORDER BY bh.fecha_inicio ASC
      `,
      [idMedico, fechaInicio, fechaFin]
    );

    const bloquesFormateados = bloques.map((bloque) => ({
      id_bloque: bloque.id_bloque,
      id_centro: bloque.id_centro,
      id_sucursal: bloque.id_sucursal,
      fecha_inicio: bloque.fecha_inicio,
      fecha_fin: bloque.fecha_fin,
      duracion_minutos: bloque.duracion_minutos,
      estado: bloque.estado,
      tipo_atencion: bloque.tipo_atencion,
      cupo_maximo: bloque.cupo_maximo,
      cupo_actual: bloque.cupo_actual,
      visible_web: Boolean(bloque.visible_web),
      sala: bloque.id_sala
        ? {
            id_sala: bloque.id_sala,
            nombre: bloque.sala_nombre,
          }
        : null,
    }));

    return NextResponse.json(
      {
        success: true,
        citas: citasFormateadas,
        bloques_horarios: bloquesFormateados,
        filtros: {
          fecha_inicio: fechaInicio,
          fecha_fin: fechaFin,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error al obtener citas:", error);
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

// ======================================================
// POST: crear nueva cita
// ======================================================
export async function POST(request: NextRequest) {
  try {
    // sesión
    const sessionToken = getSessionToken(request);
    if (!sessionToken) {
      return NextResponse.json(
        { success: false, error: "No hay sesión activa" },
        { status: 401 }
      );
    }

    // obtener médico + centro + usuario creador
    const [sesiones] = await pool.query<RowDataPacket[]>(
      `
      SELECT su.id_usuario, m.id_medico, m.id_centro
      FROM sesiones_usuarios su
      INNER JOIN medicos m ON su.id_usuario = m.id_usuario
      WHERE su.token = ?
        AND su.activa = 1
        AND su.fecha_expiracion > NOW()
        AND m.estado = 'activo'
      LIMIT 1
      `,
      [sessionToken]
    );

    if (sesiones.length === 0) {
      return NextResponse.json(
        { success: false, error: "Sesión inválida o médico no activo" },
        { status: 401 }
      );
    }

    const idUsuarioCreador = sesiones[0].id_usuario;
    const idMedico = sesiones[0].id_medico;
    const idCentroSesion = sesiones[0].id_centro as number | null;

    // body
    const body = await request.json().catch(() => null);
    if (!body) {
      return NextResponse.json(
        { success: false, error: "Body inválido" },
        { status: 400 }
      );
    }

    // el centro puede venir del médico o del body (por si el médico no tiene)
    const idCentroBody = body.id_centro
      ? Number(body.id_centro)
      : null;
    const idCentroFinal = idCentroSesion || idCentroBody;

    if (!idCentroFinal) {
      return NextResponse.json(
        {
          success: false,
          error: "El médico no tiene centro asociado y la cita requiere id_centro",
        },
        { status: 400 }
      );
    }

    const {
      id_paciente,
      fecha_hora_inicio,
      duracion_minutos = 30,
      // aquí usamos un valor que sí existe en tu enum
      tipo_cita = "primera_vez",
      estado = "programada",
      prioridad = "normal",
      motivo = null,
      notas = null,
      notas_privadas = null,
      id_sala = null,
      id_especialidad = null,
      id_sucursal = null,
      origen = "presencial", // este sí existe en tu enum
      pagada = 0,
      monto = null,
      confirmado_por_paciente = 0,
      recordatorio_enviado = 0,
      id_cita_anterior = null,
    } = body;

    // validaciones básicas
    if (!id_paciente) {
      return NextResponse.json(
        { success: false, error: "id_paciente es obligatorio" },
        { status: 400 }
      );
    }

    if (!fecha_hora_inicio) {
      return NextResponse.json(
        { success: false, error: "fecha_hora_inicio es obligatoria" },
        { status: 400 }
      );
    }

    const inicioDate = new Date(fecha_hora_inicio);
    if (isNaN(inicioDate.getTime())) {
      return NextResponse.json(
        { success: false, error: "fecha_hora_inicio inválida" },
        { status: 400 }
      );
    }

    // validar enums contra la tabla real
    if (!TIPOS_CITA_VALIDOS.has(tipo_cita)) {
      return NextResponse.json(
        {
          success: false,
          error: `tipo_cita inválido. Permitidos: ${Array.from(
            TIPOS_CITA_VALIDOS
          ).join(", ")}`,
        },
        { status: 400 }
      );
    }

    if (!ESTADOS_CITA_VALIDOS.has(estado)) {
      return NextResponse.json(
        {
          success: false,
          error: `estado inválido. Permitidos: ${Array.from(
            ESTADOS_CITA_VALIDOS
          ).join(", ")}`,
        },
        { status: 400 }
      );
    }

    if (!PRIORIDADES_VALIDAS.has(prioridad)) {
      return NextResponse.json(
        {
          success: false,
          error: `prioridad inválida. Permitidos: ${Array.from(
            PRIORIDADES_VALIDAS
          ).join(", ")}`,
        },
        { status: 400 }
      );
    }

    if (!ORIGENES_VALIDOS.has(origen)) {
      return NextResponse.json(
        {
          success: false,
          error: `origen inválido. Permitidos: ${Array.from(
            ORIGENES_VALIDOS
          ).join(", ")}`,
        },
        { status: 400 }
      );
    }

    const finDate = addMinutes(inicioDate, duracion_minutos);
    const fechaInicioMySQL = toMySQLDateTime(inicioDate);
    const fechaFinMySQL = toMySQLDateTime(finDate);

    // validar paciente
    const [pacientes] = await pool.query<RowDataPacket[]>(
      `SELECT id_paciente FROM pacientes WHERE id_paciente = ? LIMIT 1`,
      [id_paciente]
    );
    if (pacientes.length === 0) {
      return NextResponse.json(
        { success: false, error: "Paciente no encontrado" },
        { status: 404 }
      );
    }

    // validar solapamiento
    const [solapes] = await pool.query<RowDataPacket[]>(
      `
      SELECT id_cita
      FROM citas
      WHERE id_medico = ?
        AND estado IN ('programada','confirmada','en_atencion')
        AND fecha_hora_inicio < ?
        AND fecha_hora_fin > ?
      LIMIT 1
      `,
      [idMedico, fechaFinMySQL, fechaInicioMySQL]
    );

    if (solapes.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: "El médico ya tiene una cita en ese horario",
          code: "CITA_SOLAPADA",
        },
        { status: 409 }
      );
    }

    // INSERT alineado con tu tabla
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
        notas_privadas,
        recordatorio_enviado,
        confirmado_por_paciente,
        creado_por,
        id_cita_anterior
      ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
      `,
      [
        id_paciente,
        idMedico,
        idCentroFinal,
        id_sucursal ? Number(id_sucursal) : null,
        fechaInicioMySQL,
        fechaFinMySQL,
        duracion_minutos,
        tipo_cita,
        motivo,
        estado,
        prioridad,
        id_especialidad,
        origen,
        pagada ? 1 : 0,
        monto,
        id_sala,
        notas,
        notas_privadas,
        recordatorio_enviado ? 1 : 0,
        confirmado_por_paciente ? 1 : 0,
        idUsuarioCreador,
        id_cita_anterior,
      ]
    );

    const newId = result.insertId;

    // devolver la cita creada
    const [rowsNueva] = await pool.query<RowDataPacket[]>(
      `
      SELECT 
        c.id_cita,
        c.id_centro,
        c.id_sucursal,
        c.fecha_hora_inicio,
        c.fecha_hora_fin,
        c.duracion_minutos,
        c.tipo_cita,
        c.estado,
        c.prioridad,
        c.motivo,
        c.notas,
        c.notas_privadas,
        c.confirmado_por_paciente,
        c.recordatorio_enviado,
        c.pagada,
        c.monto,
        c.origen,
        c.id_cita_anterior,
        p.id_paciente,
        CONCAT(p.nombre, ' ', p.apellido_paterno, ' ', COALESCE(p.apellido_materno, '')) AS nombre_completo,
        TIMESTAMPDIFF(YEAR, p.fecha_nacimiento, CURDATE()) AS edad,
        p.genero,
        p.foto_url,
        p.telefono,
        p.celular,
        p.email,
        p.grupo_sanguineo,
        p.rut,
        s.id_sala,
        s.nombre AS sala_nombre,
        s.tipo AS sala_tipo,
        e.id_especialidad,
        e.nombre AS especialidad_nombre
      FROM citas c
      INNER JOIN pacientes p ON c.id_paciente = p.id_paciente
      LEFT JOIN salas s ON c.id_sala = s.id_sala
      LEFT JOIN especialidades e ON c.id_especialidad = e.id_especialidad
      WHERE c.id_cita = ?
      LIMIT 1
      `,
      [newId]
    );

    // actualizar última actividad
    await pool.query(
      `UPDATE sesiones_usuarios SET ultima_actividad = NOW() WHERE token = ?`,
      [sessionToken]
    );

    return NextResponse.json(
      {
        success: true,
        cita: rowsNueva.length ? rowsNueva[0] : null,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error al crear cita:", error);
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
