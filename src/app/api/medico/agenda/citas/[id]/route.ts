// frontend/src/app/api/medico/agenda/citas/[id]/route.ts
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { RowDataPacket, ResultSetHeader } from "mysql2";

// las mismas cookies que estás usando en las otras rutas
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

// para que el PUT pueda validar solapamiento igual que tu /api/medico/agenda
async function existeConflictoHorario(
  idMedico: number,
  fechaInicioISO: string,
  fechaFinISO: string,
  excluirCitaId?: number
): Promise<boolean> {
  let query = `
    SELECT COUNT(*) AS conflictos
    FROM citas
    WHERE id_medico = ?
      AND estado NOT IN ('cancelada', 'no_asistio')
      AND (
        (fecha_hora_inicio <= ? AND fecha_hora_fin > ?)
        OR (fecha_hora_inicio < ? AND fecha_hora_fin >= ?)
        OR (fecha_hora_inicio >= ? AND fecha_hora_fin <= ?)
      )
  `;
  const params: any[] = [
    idMedico,
    fechaInicioISO,
    fechaInicioISO,
    fechaFinISO,
    fechaFinISO,
    fechaInicioISO,
    fechaFinISO,
  ];

  if (excluirCitaId) {
    query += ` AND id_cita != ?`;
    params.push(excluirCitaId);
  }

  const [rows] = await pool.query<RowDataPacket[]>(query, params);
  return rows[0].conflictos > 0;
}

// GET /api/medico/agenda/citas/[id]
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

    const sessionToken = getSessionToken(request);
    if (!sessionToken) {
      return NextResponse.json(
        { success: false, error: "No hay sesión activa" },
        { status: 401 }
      );
    }

    // sesión + médico
    const [sesiones] = await pool.query<RowDataPacket[]>(
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
      [sessionToken]
    );

    if (sesiones.length === 0) {
      return NextResponse.json(
        { success: false, error: "Sesión inválida o médico no activo" },
        { status: 401 }
      );
    }

    const idMedico = sesiones[0].id_medico;

    // actualizar actividad
    await pool.query(
      `UPDATE sesiones_usuarios SET ultima_actividad = NOW() WHERE token = ?`,
      [sessionToken]
    );

    // buscar cita que sea de este médico
    const [citas] = await pool.query<RowDataPacket[]>(
      `
      SELECT 
        c.*,
        p.id_paciente,
        CONCAT(p.nombre, ' ', p.apellido_paterno, ' ', COALESCE(p.apellido_materno, '')) AS paciente_nombre_completo,
        TIMESTAMPDIFF(YEAR, p.fecha_nacimiento, CURDATE()) AS paciente_edad,
        p.telefono AS paciente_telefono,
        p.celular AS paciente_celular,
        p.email AS paciente_email,
        p.foto_url AS paciente_foto_url,
        s.id_sala,
        s.nombre AS sala_nombre,
        s.tipo AS sala_tipo,
        e.id_especialidad,
        e.nombre AS especialidad_nombre
      FROM citas c
      INNER JOIN pacientes p ON c.id_paciente = p.id_paciente
      LEFT JOIN salas s ON c.id_sala = s.id_sala
      LEFT JOIN especialidades e ON c.id_especialidad = e.id_especialidad
      WHERE c.id_cita = ? AND c.id_medico = ?
      LIMIT 1
      `,
      [citaId, idMedico]
    );

    if (citas.length === 0) {
      return NextResponse.json(
        { success: false, error: "Cita no encontrada" },
        { status: 404 }
      );
    }

    const c = citas[0];

    return NextResponse.json(
      {
        success: true,
        cita: {
          id_cita: c.id_cita,
          id_paciente: c.id_paciente,
          id_medico: c.id_medico,
          id_centro: c.id_centro,
          id_sucursal: c.id_sucursal,
          fecha_hora_inicio: c.fecha_hora_inicio,
          fecha_hora_fin: c.fecha_hora_fin,
          duracion_minutos: c.duracion_minutos,
          tipo_cita: c.tipo_cita,
          estado: c.estado,
          prioridad: c.prioridad,
          motivo: c.motivo,
          notas: c.notas,
          notas_privadas: c.notas_privadas,
          origen: c.origen,
          pagada: Boolean(c.pagada),
          monto: c.monto,
          confirmado_por_paciente: Boolean(c.confirmado_por_paciente),
          recordatorio_enviado: Boolean(c.recordatorio_enviado),
          paciente: {
            id_paciente: c.id_paciente,
            nombre_completo: c.paciente_nombre_completo,
            edad: c.paciente_edad,
            telefono: c.paciente_telefono || c.paciente_celular,
            email: c.paciente_email,
            foto_url: c.paciente_foto_url,
          },
          sala: c.id_sala
            ? {
                id_sala: c.id_sala,
                nombre: c.sala_nombre,
                tipo: c.sala_tipo,
              }
            : null,
          especialidad: c.id_especialidad
            ? {
                id_especialidad: c.id_especialidad,
                nombre: c.especialidad_nombre,
              }
            : null,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error en GET /api/medico/agenda/citas/[id]:", error);
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

// PUT /api/medico/agenda/citas/[id]  -> actualizar cita
export async function PUT(
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

    const sessionToken = getSessionToken(request);
    if (!sessionToken) {
      return NextResponse.json(
        { success: false, error: "No hay sesión activa" },
        { status: 401 }
      );
    }

    const [sesiones] = await pool.query<RowDataPacket[]>(
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
      [sessionToken]
    );

    if (sesiones.length === 0) {
      return NextResponse.json(
        { success: false, error: "Sesión inválida" },
        { status: 401 }
      );
    }

    const idUsuario = sesiones[0].id_usuario;
    const idMedico = sesiones[0].id_medico;

    const body = await request.json();

    // Traer la actual para saber si es del médico
    const [actual] = await pool.query<RowDataPacket[]>(
      `SELECT * FROM citas WHERE id_cita = ? AND id_medico = ? LIMIT 1`,
      [citaId, idMedico]
    );

    if (actual.length === 0) {
      return NextResponse.json(
        { success: false, error: "Cita no encontrada" },
        { status: 404 }
      );
    }

    const citaActual = actual[0];

    // si cambia horario, validar solapamiento
    let nuevaFechaInicio = body.fecha_hora_inicio
      ? new Date(body.fecha_hora_inicio)
      : new Date(citaActual.fecha_hora_inicio);
    const nuevaDuracion =
      body.duracion_minutos ?? citaActual.duracion_minutos;
    const nuevaFechaFin = new Date(
      nuevaFechaInicio.getTime() + nuevaDuracion * 60000
    );

    // validar disponibilidad solo si cambiamos fecha o duración
    if (body.fecha_hora_inicio || body.duracion_minutos) {
      const conflicto = await existeConflictoHorario(
        idMedico,
        nuevaFechaInicio.toISOString(),
        nuevaFechaFin.toISOString(),
        citaId
      );
      if (conflicto) {
        return NextResponse.json(
          { success: false, error: "El horario seleccionado no está disponible" },
          { status: 409 }
        );
      }
    }

    const updates: string[] = [];
    const params: any[] = [];

    if (body.fecha_hora_inicio) {
      updates.push("fecha_hora_inicio = ?");
      params.push(nuevaFechaInicio.toISOString());
      updates.push("fecha_hora_fin = ?");
      params.push(nuevaFechaFin.toISOString());
    } else if (body.duracion_minutos) {
      // solo cambió la duración
      updates.push("duracion_minutos = ?");
      params.push(body.duracion_minutos);
      updates.push("fecha_hora_fin = ?");
      params.push(nuevaFechaFin.toISOString());
    }

    if (body.tipo_cita) {
      updates.push("tipo_cita = ?");
      params.push(body.tipo_cita);
    }
    if (body.motivo !== undefined) {
      updates.push("motivo = ?");
      params.push(body.motivo);
    }
    if (body.notas !== undefined) {
      updates.push("notas = ?");
      params.push(body.notas);
    }
    if (body.estado) {
      updates.push("estado = ?");
      params.push(body.estado);
    }
    if (body.prioridad) {
      updates.push("prioridad = ?");
      params.push(body.prioridad);
    }
    if (body.id_especialidad !== undefined) {
      updates.push("id_especialidad = ?");
      params.push(body.id_especialidad);
    }
    if (body.id_sala !== undefined) {
      updates.push("id_sala = ?");
      params.push(body.id_sala);
    }
    if (body.monto !== undefined) {
      updates.push("monto = ?");
      params.push(body.monto);
    }

    updates.push("modificado_por = ?");
    params.push(idUsuario);

    params.push(citaId);

    if (updates.length > 0) {
      await pool.query(
        `UPDATE citas SET ${updates.join(", ")} WHERE id_cita = ?`,
        params
      );
    }

    // devolver cita actualizada
    const [citaActualizada] = await pool.query<RowDataPacket[]>(
      `SELECT * FROM citas WHERE id_cita = ?`,
      [citaId]
    );

    return NextResponse.json(
      {
        success: true,
        message: "Cita actualizada",
        cita: citaActualizada[0],
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error en PUT /api/medico/agenda/citas/[id]:", error);
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

// DELETE /api/medico/agenda/citas/[id] -> cancelar cita
export async function DELETE(
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

    const sessionToken = getSessionToken(request);
    if (!sessionToken) {
      return NextResponse.json(
        { success: false, error: "No hay sesión activa" },
        { status: 401 }
      );
    }

    const [sesiones] = await pool.query<RowDataPacket[]>(
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
      [sessionToken]
    );

    if (sesiones.length === 0) {
      return NextResponse.json(
        { success: false, error: "Sesión inválida" },
        { status: 401 }
      );
    }

    const idUsuario = sesiones[0].id_usuario;
    const idMedico = sesiones[0].id_medico;

    // validar que la cita es del médico
    const [cita] = await pool.query<RowDataPacket[]>(
      `SELECT * FROM citas WHERE id_cita = ? AND id_medico = ? LIMIT 1`,
      [citaId, idMedico]
    );

    if (cita.length === 0) {
      return NextResponse.json(
        { success: false, error: "Cita no encontrada" },
        { status: 404 }
      );
    }

    // set estado = cancelada
    await pool.query(
      `UPDATE citas SET estado = 'cancelada', modificado_por = ? WHERE id_cita = ?`,
      [idUsuario, citaId]
    );

    // registrar en cancelaciones (siguiendo tu tabla)
    await pool.query(
      `
      INSERT INTO cancelaciones (
        id_cita,
        fecha_cancelacion,
        motivo,
        detalle_motivo,
        cancelado_por,
        cancelado_por_tipo
      ) VALUES (?, NOW(), 'medico_no_disponible', 'Cancelada desde API del médico', ?, 'medico')
      `,
      [citaId, idUsuario]
    );

    return NextResponse.json(
      { success: true, message: "Cita cancelada" },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error en DELETE /api/medico/agenda/citas/[id]:", error);
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
