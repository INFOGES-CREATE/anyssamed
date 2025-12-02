// app/api/medico/agenda/citas/[id]/exportar/route.ts
// Exportar una cita del médico (JSON de momento, listo para PDF)
export const dynamic = "force-dynamic";

export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { RowDataPacket } from "mysql2";

// las mismas cookies que usas en /citas/[id]
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
      if (cookies[name]) return decodeURIComponent(cookies[name]);
    }
  }

  const auth = request.headers.get("authorization");
  if (auth?.startsWith("Bearer ")) return auth.slice(7);

  return null;
}

// ---------------------------------------------------------
// GET /api/medico/agenda/citas/[id]/exportar
// ---------------------------------------------------------
export async function GET(
  request: NextRequest,
  ctx: { params: { id: string } }
) {
  try {
    const citaId = Number(ctx.params.id);

    if (!citaId) {
      return NextResponse.json(
        { success: false, error: "ID de cita inválido" },
        { status: 400 }
      );
    }

    const token = getSessionToken(request);
    if (!token) {
      return NextResponse.json(
        { success: false, error: "No hay sesión activa" },
        { status: 401 }
      );
    }

    // validar sesión + obtener médico
    const [sesionRows] = await pool.query<RowDataPacket[]>(
      `
      SELECT su.id_usuario, m.id_medico
      FROM sesiones_usuarios su
      INNER JOIN medicos m ON su.id_usuario = m.id_usuario
      WHERE su.token = ?
        AND su.activa = 1
        AND su.fecha_expiracion > NOW()
        AND m.estado = 'activo'
      LIMIT 1
      `,
      [token]
    );

    if (sesionRows.length === 0) {
      return NextResponse.json(
        { success: false, error: "Sesión inválida o médico no activo" },
        { status: 401 }
      );
    }

    const idMedico = sesionRows[0].id_medico;

    // actualizar actividad
    await pool.query(
      `UPDATE sesiones_usuarios SET ultima_actividad = NOW() WHERE token = ?`,
      [token]
    );

    // ---------------------------------------------------------
    // Verificar que la cita pertenece al médico
    // ---------------------------------------------------------
    const [citaRows] = await pool.query<RowDataPacket[]>(
      `
      SELECT 
        c.*,
        p.id_paciente,
        CONCAT(p.nombre, ' ', p.apellido_paterno, ' ', COALESCE(p.apellido_materno, '')) AS paciente_nombre,
        p.email AS paciente_email,
        p.telefono AS paciente_telefono,
        p.celular AS paciente_celular,
        p.foto_url AS paciente_foto_url,
        s.nombre AS sala_nombre,
        s.tipo AS sala_tipo,
        e.nombre AS especialidad_nombre
      FROM citas c
      INNER JOIN pacientes p ON p.id_paciente = c.id_paciente
      LEFT JOIN salas s ON s.id_sala = c.id_sala
      LEFT JOIN especialidades e ON e.id_especialidad = c.id_especialidad
      WHERE c.id_cita = ?
        AND c.id_medico = ?
      LIMIT 1
      `,
      [citaId, idMedico]
    );

    if (citaRows.length === 0) {
      return NextResponse.json(
        { success: false, error: "Cita no encontrada" },
        { status: 404 }
      );
    }

    const c = citaRows[0];

    // ---------------------------------------------------------
    // Construir objeto exportable (PDF vendrá después)
    // ---------------------------------------------------------
    const exportData = {
      id_cita: c.id_cita,
      fecha_hora_inicio: c.fecha_hora_inicio,
      fecha_hora_fin: c.fecha_hora_fin,
      tipo_cita: c.tipo_cita,
      estado: c.estado,
      motivo: c.motivo,
      notas: c.notas,
      duracion_minutos: c.duracion_minutos,
      origen: c.origen,
      monto: c.monto,

      paciente: {
        id_paciente: c.id_paciente,
        nombre: c.paciente_nombre,
        email: c.paciente_email,
        telefono: c.paciente_telefono || c.paciente_celular,
        foto_url: c.paciente_foto_url,
      },

      sala: c.id_sala
        ? {
            nombre: c.sala_nombre,
            tipo: c.sala_tipo,
          }
        : null,

      especialidad: c.id_especialidad
        ? {
            nombre: c.especialidad_nombre,
          }
        : null,

      generado_en: new Date().toISOString(),
    };

    return NextResponse.json(
      {
        success: true,
        formato: "json",
        cita: exportData,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error en GET /api/medico/agenda/citas/[id]/exportar:", error);
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
