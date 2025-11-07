// app/api/medico/agenda/citas/[id]/recordatorio/route.ts
import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { RowDataPacket } from "mysql2";

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const idCita = parseInt(params.id);

    if (isNaN(idCita)) {
      return NextResponse.json({ success: false, error: "ID de cita inválido" }, { status: 400 });
    }

    const sessionToken = getSessionToken(request);
    if (!sessionToken) {
      return NextResponse.json({ success: false, error: "No hay sesión activa" }, { status: 401 });
    }

    const [sesiones] = await pool.query<RowDataPacket[]>(
      `SELECT su.id_usuario, m.id_medico
       FROM sesiones_usuarios su
       INNER JOIN medicos m ON su.id_usuario = m.id_usuario
       WHERE su.token = ? AND su.activa = 1`,
      [sessionToken]
    );

    if (sesiones.length === 0) {
      return NextResponse.json({ success: false, error: "Sesión inválida" }, { status: 401 });
    }

    const idMedico = sesiones[0].id_medico;

    // Obtener información de la cita y paciente
    const [citas] = await pool.query<RowDataPacket[]>(
      `SELECT c.id_cita, c.fecha_hora_inicio, c.tipo_cita, c.modalidad,
              p.id_paciente, p.nombre, p.apellido_paterno, p.email, p.celular,
              m.nombre as medico_nombre, m.apellido_paterno as medico_apellido,
              e.nombre as especialidad_nombre
       FROM citas c
       INNER JOIN pacientes p ON c.id_paciente = p.id_paciente
       INNER JOIN medicos m ON c.id_medico = m.id_medico
       LEFT JOIN especialidades e ON c.id_especialidad = e.id_especialidad
       WHERE c.id_cita = ? AND c.id_medico = ?`,
      [idCita, idMedico]
    );

    if (citas.length === 0) {
      return NextResponse.json({ success: false, error: "Cita no encontrada" }, { status: 404 });
    }

    const cita = citas[0];

    // Registrar recordatorio
    await pool.query(
      `INSERT INTO recordatorios 
       (id_cita, tipo_recordatorio, canal_envio, fecha_envio, estado, enviado_por)
       VALUES (?, 'manual', 'email', NOW(), 'enviado', ?)`,
      [idCita, sesiones[0].id_usuario]
    );

    // Actualizar cita
    await pool.query(
      `UPDATE citas 
       SET recordatorio_enviado = TRUE, 
           fecha_ultimo_recordatorio = NOW()
       WHERE id_cita = ?`,
      [idCita]
    );

    // Aquí implementar el envío real del recordatorio
    // await enviarEmailRecordatorio(cita);
    // await enviarSMSRecordatorio(cita);
    // await enviarWhatsAppRecordatorio(cita);

    return NextResponse.json(
      {
        success: true,
        message: "Recordatorio enviado exitosamente",
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error al enviar recordatorio:", error);
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

  const candidates = ["session", "session_token", "medisalud_session"];
  for (const name of candidates) {
    if (cookies[name]) return decodeURIComponent(cookies[name]);
  }

  return null;
}
