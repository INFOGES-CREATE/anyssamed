// app/api/medico/agenda/citas/[id]/cancelar/route.ts
import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { RowDataPacket } from "mysql2";

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const idCita = parseInt(params.id);
    const { motivo } = await request.json();

    if (isNaN(idCita)) {
      return NextResponse.json({ success: false, error: "ID de cita inválido" }, { status: 400 });
    }

    if (!motivo) {
      return NextResponse.json({ success: false, error: "El motivo es requerido" }, { status: 400 });
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

    // Verificar que la cita pertenece al médico
    const [citas] = await pool.query<RowDataPacket[]>(
      `SELECT c.id_cita, c.estado, c.id_paciente, p.nombre, p.apellido_paterno, p.email, p.celular
       FROM citas c
       INNER JOIN pacientes p ON c.id_paciente = p.id_paciente
       WHERE c.id_cita = ? AND c.id_medico = ?`,
      [idCita, idMedico]
    );

    if (citas.length === 0) {
      return NextResponse.json({ success: false, error: "Cita no encontrada" }, { status: 404 });
    }

    const cita = citas[0];

    // Actualizar estado a cancelada
    await pool.query(
      `UPDATE citas 
       SET estado = 'cancelada', 
           fecha_cancelacion = NOW(),
           motivo_cancelacion = ?,
           cancelado_por = ?
       WHERE id_cita = ?`,
      [motivo, sesiones[0].id_usuario, idCita]
    );

    // Registrar cancelación
    await pool.query(
      `INSERT INTO cancelaciones 
       (id_cita, motivo_cancelacion, cancelado_por_tipo, cancelado_por_id, fecha_cancelacion)
       VALUES (?, ?, 'medico', ?, NOW())`,
      [idCita, motivo, sesiones[0].id_usuario]
    );

    // Registrar en historial
    await pool.query(
      `INSERT INTO historial_cambios_citas 
       (id_cita, id_usuario, campo_modificado, valor_anterior, valor_nuevo, tipo_cambio, observaciones)
       VALUES (?, ?, 'estado', ?, 'cancelada', 'cancelacion', ?)`,
      [idCita, sesiones[0].id_usuario, cita.estado, motivo]
    );

    // Enviar notificación al paciente (implementar según sistema de notificaciones)
    // await enviarNotificacionCancelacion(cita, motivo);

    return NextResponse.json(
      {
        success: true,
        message: "Cita cancelada exitosamente",
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error al cancelar cita:", error);
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
