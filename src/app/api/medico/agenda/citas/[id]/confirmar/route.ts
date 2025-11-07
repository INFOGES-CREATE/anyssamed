// frontend\src\app\api\medico\agenda\citas\[id]\confirmar\route.ts
import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { RowDataPacket } from "mysql2";

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
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

    // Verificar que la cita pertenece al médico
    const [citas] = await pool.query<RowDataPacket[]>(
      `SELECT id_cita, estado FROM citas WHERE id_cita = ? AND id_medico = ?`,
      [idCita, idMedico]
    );

    if (citas.length === 0) {
      return NextResponse.json({ success: false, error: "Cita no encontrada" }, { status: 404 });
    }

    // Actualizar estado a confirmada
    await pool.query(
      `UPDATE citas 
       SET estado = 'confirmada', 
           fecha_confirmacion = NOW(),
           modificado_por = ?
       WHERE id_cita = ?`,
      [sesiones[0].id_usuario, idCita]
    );

    // Registrar confirmación
    await pool.query(
      `INSERT INTO confirmaciones 
       (id_cita, tipo_confirmacion, fecha_envio_solicitud, fecha_confirmacion, 
        confirmada, canal_respuesta, confirmado_por)
       VALUES (?, 'medico', NOW(), NOW(), 1, 'sistema', ?)`,
      [idCita, sesiones[0].id_usuario]
    );

    // Registrar en historial de cambios
    await pool.query(
      `INSERT INTO historial_cambios_citas 
       (id_cita, id_usuario, campo_modificado, valor_anterior, valor_nuevo, tipo_cambio)
       VALUES (?, ?, 'estado', ?, 'confirmada', 'confirmacion')`,
      [idCita, sesiones[0].id_usuario, citas[0].estado]
    );

    return NextResponse.json(
      {
        success: true,
        message: "Cita confirmada exitosamente",
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error al confirmar cita:", error);
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
