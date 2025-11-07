// app/api/medico/agenda/citas/route.ts
import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { RowDataPacket } from "mysql2";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const fechaInicio = searchParams.get("fecha_inicio");
    const fechaFin = searchParams.get("fecha_fin");

    if (!fechaInicio || !fechaFin) {
      return NextResponse.json(
        { success: false, error: "Faltan parámetros de fecha" },
        { status: 400 }
      );
    }

    // Obtener sesión
    const sessionToken = getSessionToken(request);
    if (!sessionToken) {
      return NextResponse.json(
        { success: false, error: "No hay sesión activa" },
        { status: 401 }
      );
    }

    // Verificar sesión y obtener médico
    const [sesiones] = await pool.query<RowDataPacket[]>(
      `SELECT su.id_usuario, m.id_medico
       FROM sesiones_usuarios su
       INNER JOIN medicos m ON su.id_usuario = m.id_usuario
       WHERE su.token = ? AND su.activa = 1 AND su.fecha_expiracion > NOW()`,
      [sessionToken]
    );

    if (sesiones.length === 0) {
      return NextResponse.json(
        { success: false, error: "Sesión inválida" },
        { status: 401 }
      );
    }

    const idMedico = sesiones[0].id_medico;

    // Obtener citas
    const [citas] = await pool.query<RowDataPacket[]>(
      `SELECT 
        c.id_cita,
        c.fecha_hora_inicio,
        c.fecha_hora_fin,
        c.duracion_minutos,
        c.tipo_cita,
        CASE 
          WHEN c.tipo_cita = 'telemedicina' THEN 'telemedicina'
          ELSE 'presencial'
        END as modalidad,
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
        p.id_paciente,
        CONCAT(p.nombre, ' ', p.apellido_paterno, ' ', COALESCE(p.apellido_materno, '')) as nombre_completo,
        TIMESTAMPDIFF(YEAR, p.fecha_nacimiento, CURDATE()) as edad,
        p.genero,
        p.foto_url,
        p.telefono,
        p.celular,
        p.email,
        p.grupo_sanguineo,
        p.rut,
        s.id_sala,
        s.nombre as sala_nombre,
        s.tipo as sala_tipo,
        e.id_especialidad,
        e.nombre as especialidad_nombre
      FROM citas c
      INNER JOIN pacientes p ON c.id_paciente = p.id_paciente
      LEFT JOIN salas s ON c.id_sala = s.id_sala
      LEFT JOIN especialidades e ON c.id_especialidad = e.id_especialidad
      WHERE c.id_medico = ?
        AND c.fecha_hora_inicio BETWEEN ? AND ?
      ORDER BY c.fecha_hora_inicio ASC`,
      [idMedico, fechaInicio, fechaFin]
    );

    // Formatear datos
    const citasFormateadas = citas.map((cita) => ({
      id_cita: cita.id_cita,
      fecha_hora_inicio: cita.fecha_hora_inicio,
      fecha_hora_fin: cita.fecha_hora_fin,
      duracion_minutos: cita.duracion_minutos,
      tipo_cita: cita.tipo_cita,
      modalidad: cita.modalidad,
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
    }));

    // Obtener bloques horarios
    const [bloques] = await pool.query<RowDataPacket[]>(
      `SELECT 
        bh.id_bloque,
        bh.fecha_inicio,
        bh.fecha_fin,
        bh.duracion_minutos,
        bh.estado,
        bh.tipo_atencion,
        bh.cupo_maximo,
        bh.cupo_actual,
        bh.visible_web,
        s.id_sala,
        s.nombre as sala_nombre
      FROM bloques_horarios bh
      LEFT JOIN salas s ON bh.id_sala = s.id_sala
      WHERE bh.id_medico = ?
        AND bh.fecha_inicio BETWEEN ? AND ?
      ORDER BY bh.fecha_inicio ASC`,
      [idMedico, fechaInicio, fechaFin]
    );

    const bloquesFormateados = bloques.map((bloque) => ({
      id_bloque: bloque.id_bloque,
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
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error al obtener citas:", error);
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

function getSessionToken(request: NextRequest): string | null {
  const cookieHeader = request.headers.get("cookie") || "";
  const cookies = cookieHeader
    .split(";")
    .map((c) => c.trim())
    .reduce((acc, c) => {
      const [k, ...rest] = c.split("=");
      acc[k] = rest.join("=");
      return acc;
    }, {} as Record<string, string>);

  const candidates = [
    "session",
    "session_token",
    "medisalud_session",
    "auth_session",
  ];

  for (const name of candidates) {
    if (cookies[name]) {
      return decodeURIComponent(cookies[name]);
    }
  }

  const auth = request.headers.get("authorization");
  if (auth?.startsWith("Bearer ")) {
    return auth.slice(7);
  }

  return null;
}
