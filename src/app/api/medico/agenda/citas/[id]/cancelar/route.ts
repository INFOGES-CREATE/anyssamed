// app/api/medico/agenda/citas/[id]/cancelar/route.ts
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { RowDataPacket, ResultSetHeader } from "mysql2";

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

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const sessionToken = getSessionToken(request);

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
        { success: false, error: "Sesión inválida" },
        { status: 401 }
      );
    }

    const idUsuario = sesiones[0].id_usuario;
    const idCita = params.id;

    // Verificar que sea médico
    const [medicos] = await pool.query<RowDataPacket[]>(
      `SELECT id_medico FROM medicos WHERE id_usuario = ? AND estado = 'activo'`,
      [idUsuario]
    );

    if (medicos.length === 0) {
      return NextResponse.json(
        { success: false, error: "No eres un médico activo" },
        { status: 403 }
      );
    }

    const idMedico = medicos[0].id_medico;

    // Obtener body
    const body = await request.json();
    const { motivo, detalle_motivo, cobro_aplicado } = body;

    if (!motivo) {
      return NextResponse.json(
        { success: false, error: "Motivo requerido" },
        { status: 400 }
      );
    }

    // Validar que la cita pertenece al médico
    const [citas] = await pool.query<RowDataPacket[]>(
      `SELECT * FROM citas WHERE id_cita = ? AND id_medico = ?`,
      [idCita, idMedico]
    );

    if (citas.length === 0) {
      return NextResponse.json(
        { success: false, error: "Cita no encontrada" },
        { status: 404 }
      );
    }

    // Actualizar estado de la cita
    await pool.query(
      `UPDATE citas SET estado = 'cancelada', modificado_por = ? WHERE id_cita = ?`,
      [idUsuario, idCita]
    );

    // Registrar la cancelación
    await pool.query(
      `
      INSERT INTO cancelaciones (
        id_cita,
        fecha_cancelacion,
        motivo,
        detalle_motivo,
        cobro_aplicado,
        cancelado_por,
        cancelado_por_tipo
      ) VALUES (?, NOW(), ?, ?, ?, ?, 'medico')
      `,
      [idCita, motivo, detalle_motivo || null, cobro_aplicado || null, idUsuario]
    );

    // Registrar en historial
    await pool.query(
      `
      INSERT INTO historial_cambios_citas (
        id_cita,
        id_usuario,
        campo_modificado,
        valor_anterior,
        valor_nuevo,
        tipo_cambio,
        observaciones,
        ip_address
      ) VALUES (?, ?, 'estado', 'programada', 'cancelada', 'cancelacion', ?, ?)
      `,
      [
        idCita,
        idUsuario,
        `Motivo: ${motivo}. ${detalle_motivo || ""}`,
        request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown",
      ]
    );

    await pool.query(
      `UPDATE sesiones_usuarios SET ultima_actividad = NOW() WHERE token = ?`,
      [sessionToken]
    );

    return NextResponse.json(
      {
        success: true,
        message: "Cita cancelada exitosamente",
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("❌ Error en POST /api/medico/agenda/citas/[id]/cancelar:", error);

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