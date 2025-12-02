// app/api/medico/agenda/configuracion/route.ts
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { RowDataPacket } from "mysql2";

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

export async function GET(request: NextRequest) {
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
    const searchParams = request.nextUrl.searchParams;
    const idMedico = searchParams.get("id_medico");

    if (!idMedico) {
      return NextResponse.json(
        { success: false, error: "ID de médico requerido" },
        { status: 400 }
      );
    }

    // Obtener preferencias del usuario
    const [preferencias] = await pool.query<RowDataPacket[]>(
      `
      SELECT 
        hora_inicio_jornada,
        hora_fin_jornada,
        duracion_cita_default,
        auto_confirmar_citas,
        enviar_recordatorios_automaticos,
        bloquear_citas_mismo_horario,
        permitir_overbooking
      FROM preferencias_usuarios
      WHERE id_usuario = ?
      LIMIT 1
      `,
      [idUsuario]
    );

    let config = {
      duracion_predeterminada: 30,
      hora_inicio: "08:00",
      hora_fin: "18:00",
      intervalo_citas: 15,
      permite_sobrecupo: false,
      maximo_sobrecupo: 2,
      tiempo_minimo_anticipacion: 60,
      tiempo_maximo_anticipacion: 2160,
      permite_cancelacion: true,
      tiempo_minimo_cancelacion: 120,
      dias_laborables: ["lunes", "martes", "miercoles", "jueves", "viernes"],
      auto_confirmar: false,
      enviar_recordatorios: true,
      bloquear_mismo_horario: true,
    };

    if (preferencias.length > 0) {
      const pref = preferencias[0];
      config = {
        ...config,
        duracion_predeterminada: pref.duracion_cita_default || 30,
        hora_inicio: pref.hora_inicio_jornada || "08:00",
        hora_fin: pref.hora_fin_jornada || "18:00",
        auto_confirmar: pref.auto_confirmar_citas === 1,
        enviar_recordatorios: pref.enviar_recordatorios_automaticos === 1,
        bloquear_mismo_horario: pref.bloquear_citas_mismo_horario === 1,
        permite_sobrecupo: pref.permitir_overbooking === 1,
      };
    }

    await pool.query(
      `UPDATE sesiones_usuarios SET ultima_actividad = NOW() WHERE token = ?`,
      [sessionToken]
    );

    return NextResponse.json(
      {
        success: true,
        configuracion: config,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("❌ Error en GET /api/medico/agenda/configuracion:", error);

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