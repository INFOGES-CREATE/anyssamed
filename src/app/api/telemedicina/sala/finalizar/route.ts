// src/app/api/telemedicina/sala/finalizar/route.ts
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

async function obtenerMedicoAutenticado(idUsuario: number) {
  const [rows] = await pool.query<RowDataPacket[]>(
    `
    SELECT m.id_medico, m.id_usuario, m.id_centro_principal
    FROM medicos m
    WHERE m.id_usuario = ? AND m.estado = 'activo'
    LIMIT 1
    `,
    [idUsuario]
  );
  if (rows.length === 0) return null;
  return rows[0] as { id_medico: number; id_usuario: number; id_centro_principal: number };
}

async function validarAccesoSesion(idSesion: number, idMedico: number) {
  const [rows] = await pool.query<RowDataPacket[]>(
    `
    SELECT COUNT(*) AS tiene_acceso
    FROM telemedicina_sesiones
    WHERE id_sesion = ? AND id_medico = ?
    `,
    [idSesion, idMedico]
  );
  return rows[0].tiene_acceso > 0;
}

export async function POST(request: NextRequest) {
  try {
    const sessionToken = getSessionToken(request);
    if (!sessionToken) {
      return NextResponse.json({ success: false, error: "No hay sesión activa" }, { status: 401 });
    }

    // sesión de usuario
    const [sesiones] = await pool.query<RowDataPacket[]>(
      `
      SELECT su.id_usuario
      FROM sesiones_usuarios su
      INNER JOIN usuarios u ON su.id_usuario = u.id_usuario
      WHERE su.token = ?
        AND su.activa = 1
        AND (su.fecha_expiracion IS NULL OR su.fecha_expiracion > NOW())
        AND u.estado = 'activo'
      LIMIT 1
      `,
      [sessionToken]
    );

    if (sesiones.length === 0) {
      return NextResponse.json({ success: false, error: "Sesión inválida o expirada" }, { status: 401 });
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
    const { id_sesion, motivo_finalizacion, notas_medico } = body as {
      id_sesion: number;
      motivo_finalizacion?: string;
      notas_medico?: string;
    };

    if (!id_sesion) {
      return NextResponse.json({ success: false, error: "ID de sesión requerido" }, { status: 400 });
    }

    const tieneAcceso = await validarAccesoSesion(id_sesion, medico.id_medico);
    if (!tieneAcceso) {
      return NextResponse.json({ success: false, error: "No tienes acceso a esta sesión" }, { status: 403 });
    }

    // obtener datos básicos de la sesión
    const [sesionRows] = await pool.query<RowDataPacket[]>(
      `
      SELECT id_sesion, id_cita, id_paciente, estado, fecha_hora_inicio_real, fecha_hora_inicio_programada
      FROM telemedicina_sesiones
      WHERE id_sesion = ?
      LIMIT 1
      `,
      [id_sesion]
    );

    if (sesionRows.length === 0) {
      return NextResponse.json({ success: false, error: "Sesión no encontrada" }, { status: 404 });
    }

    const sesion = sesionRows[0];

    // actualizar sesión
    await pool.query(
      `
      UPDATE telemedicina_sesiones
      SET 
        estado = 'finalizada',
        fecha_hora_fin_real = NOW(),
        duracion_segundos = TIMESTAMPDIFF(
          SECOND,
          COALESCE(fecha_hora_inicio_real, fecha_hora_inicio_programada),
          NOW()
        ),
        -- usamos notas_tecnicas porque sí existe
        notas_tecnicas = CONCAT(
          IFNULL(notas_tecnicas, ''),
          ?
        )
      WHERE id_sesion = ? AND id_medico = ?
      `,
      [
        motivo_finalizacion
          ? `\n[${new Date().toISOString()}] Motivo fin: ${motivo_finalizacion}${
              notas_medico ? " - Notas: " + notas_medico : ""
            }`
          : "",
        id_sesion,
        medico.id_medico,
      ]
    );

    // marcar cita como completada (si hay)
    if (sesion.id_cita) {
      await pool.query(`UPDATE citas SET estado = 'completada' WHERE id_cita = ?`, [sesion.id_cita]);
    }

    // actualizar actividad de la sesión de usuario
    await pool.query(`UPDATE sesiones_usuarios SET ultima_actividad = NOW() WHERE token = ?`, [
      sessionToken,
    ]);

    return NextResponse.json(
      {
        success: true,
        message: "Sesión finalizada exitosamente",
        id_sesion,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("❌ Error en POST /api/telemedicina/sala/finalizar:", error);
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
