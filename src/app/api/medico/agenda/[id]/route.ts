//frontend\src\app\api\medico\agenda\[id]\route.ts
// frontend/src/app/api/medico/agenda/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { RowDataPacket, ResultSetHeader } from "mysql2";

// =============== helpers compartidos ===============

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
      SELECT 
        m.id_medico,
        m.id_usuario,
        m.id_centro_principal
      FROM medicos m
      WHERE m.id_usuario = ? AND m.estado = 'activo'
      LIMIT 1
    `,
    [idUsuario]
  );

  if (rows.length === 0) return null;
  return rows[0] as {
    id_medico: number;
    id_usuario: number;
    id_centro_principal: number;
  };
}

async function validarDisponibilidad(
  idMedico: number,
  fechaInicioISO: string,
  fechaFinISO: string,
  idCitaExcluir?: number
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

  if (idCitaExcluir) {
    query += " AND id_cita != ?";
    params.push(idCitaExcluir);
  }

  const [rows] = await pool.query<RowDataPacket[]>(query, params);
  return rows[0].conflictos === 0;
}

// =============== GET /api/medico/agenda/[id] ===============
export async function GET(
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

    // validar sesión
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
        { success: false, error: "Sesión inválida o expirada" },
        { status: 401 }
      );
    }

    const idUsuario = sesiones[0].id_usuario;

    // actualizar última actividad
    await pool.query(
      `UPDATE sesiones_usuarios SET ultima_actividad = NOW() WHERE token = ?`,
      [sessionToken]
    );

    const medico = await obtenerMedicoAutenticado(idUsuario);
    if (!medico) {
      return NextResponse.json(
        { success: false, error: "No tienes un registro de médico activo" },
        { status: 403 }
      );
    }

    const idCita = Number(params.id);
    if (Number.isNaN(idCita)) {
      return NextResponse.json(
        { success: false, error: "ID de cita inválido" },
        { status: 400 }
      );
    }

    const [citas] = await pool.query<RowDataPacket[]>(
      `
      SELECT c.*, 
             p.id_paciente,
             CONCAT(p.nombre, ' ', p.apellido_paterno, ' ', COALESCE(p.apellido_materno,'')) AS paciente_nombre,
             TIMESTAMPDIFF(YEAR, p.fecha_nacimiento, CURDATE()) AS paciente_edad,
             p.genero AS paciente_genero,
             p.telefono AS paciente_telefono,
             p.email AS paciente_email
      FROM citas c
      INNER JOIN pacientes p ON c.id_paciente = p.id_paciente
      WHERE c.id_cita = ? AND c.id_medico = ?
      LIMIT 1
      `,
      [idCita, medico.id_medico]
    );

    if (citas.length === 0) {
      return NextResponse.json(
        { success: false, error: "Cita no encontrada" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        cita: citas[0],
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("❌ Error en GET /api/medico/agenda/[id]:", error);
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

// =============== PUT /api/medico/agenda/[id] ===============
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // helper local
  const toMySQLDateTime = (d: Date) => {
    const pad = (n: number) => (n < 10 ? `0${n}` : n);
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
  };

  try {
    const sessionToken = getSessionToken(request);
    if (!sessionToken) {
      return NextResponse.json(
        { success: false, error: "No hay sesión activa" },
        { status: 401 }
      );
    }

    // validar sesión
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
        { success: false, error: "Sesión inválida o expirada" },
        { status: 401 }
      );
    }

    const idUsuario = sesiones[0].id_usuario;

    // actualizar última actividad
    await pool.query(
      `UPDATE sesiones_usuarios SET ultima_actividad = NOW() WHERE token = ?`,
      [sessionToken]
    );

    // obtener médico
    const medico = await obtenerMedicoAutenticado(idUsuario);
    if (!medico) {
      return NextResponse.json(
        { success: false, error: "No tienes un registro de médico activo" },
        { status: 403 }
      );
    }

    const idCita = Number(params.id);
    if (Number.isNaN(idCita)) {
      return NextResponse.json(
        { success: false, error: "ID de cita inválido" },
        { status: 400 }
      );
    }

    // verificar que la cita pertenece a este médico
    const [citaActualRows] = await pool.query<RowDataPacket[]>(
      `SELECT * FROM citas WHERE id_cita = ? AND id_medico = ? LIMIT 1`,
      [idCita, medico.id_medico]
    );

    if (citaActualRows.length === 0) {
      return NextResponse.json(
        { success: false, error: "Cita no encontrada" },
        { status: 404 }
      );
    }

    const citaActual = citaActualRows[0];

    // leer body
    const body = await request.json().catch(() => ({}));
    const {
      fecha_hora_inicio,
      duracion_minutos,
      tipo_cita,
      motivo,
      notas,
      notas_privadas,
      estado,
      prioridad,
      id_especialidad,
      id_sala,
      monto,
      origen,
    } = body || {};

    const updates: string[] = [];
    const paramsUpdate: any[] = [];

    // si cambia fecha o duración recalculamos fin y validamos disponibilidad
    if (fecha_hora_inicio || duracion_minutos) {
      // fecha base
      const inicioDate = fecha_hora_inicio
        ? new Date(fecha_hora_inicio)
        : new Date(citaActual.fecha_hora_inicio);

      // ojo: si la fecha viene rara y da Invalid Date
      if (isNaN(inicioDate.getTime())) {
        return NextResponse.json(
          {
            success: false,
            error: "Formato de fecha inválido. Usa 'YYYY-MM-DD HH:MM:SS'",
          },
          { status: 400 }
        );
      }

      const duracion =
        duracion_minutos !== undefined
          ? Number(duracion_minutos)
          : Number(citaActual.duracion_minutos ?? 30);

      const finDate = new Date(inicioDate.getTime() + duracion * 60000);

      const inicioMySQL = toMySQLDateTime(inicioDate);
      const finMySQL = toMySQLDateTime(finDate);

      // validar disponibilidad
      const disponible = await validarDisponibilidad(
        medico.id_medico,
        inicioMySQL,
        finMySQL,
        idCita
      );

      if (!disponible) {
        return NextResponse.json(
          {
            success: false,
            error: "El horario seleccionado no está disponible",
          },
          { status: 409 }
        );
      }

      updates.push("fecha_hora_inicio = ?");
      paramsUpdate.push(inicioMySQL);
      updates.push("fecha_hora_fin = ?");
      paramsUpdate.push(finMySQL);
      updates.push("duracion_minutos = ?");
      paramsUpdate.push(duracion);
    }

    if (tipo_cita !== undefined) {
      updates.push("tipo_cita = ?");
      paramsUpdate.push(tipo_cita);
    }

    if (motivo !== undefined) {
      updates.push("motivo = ?");
      paramsUpdate.push(motivo);
    }

    if (notas !== undefined) {
      updates.push("notas = ?");
      paramsUpdate.push(notas);
    }

    if (notas_privadas !== undefined) {
      updates.push("notas_privadas = ?");
      paramsUpdate.push(notas_privadas);
    }

    if (estado !== undefined) {
      updates.push("estado = ?");
      paramsUpdate.push(estado);
    }

    if (prioridad !== undefined) {
      updates.push("prioridad = ?");
      paramsUpdate.push(prioridad);
    }

    if (id_especialidad !== undefined) {
      updates.push("id_especialidad = ?");
      paramsUpdate.push(id_especialidad);
    }

    if (id_sala !== undefined) {
      updates.push("id_sala = ?");
      paramsUpdate.push(id_sala);
    }

    if (monto !== undefined) {
      updates.push("monto = ?");
      paramsUpdate.push(monto);
    }

    if (origen !== undefined) {
      updates.push("origen = ?");
      paramsUpdate.push(origen);
    }

    // siempre registrar quién modificó
    updates.push("modificado_por = ?");
    paramsUpdate.push(idUsuario);

    if (updates.length === 0) {
      return NextResponse.json(
        { success: false, error: "No hay campos para actualizar" },
        { status: 400 }
      );
    }

    paramsUpdate.push(idCita);

    await pool.query(
      `UPDATE citas SET ${updates.join(", ")} WHERE id_cita = ?`,
      paramsUpdate
    );

    const [citaActualizada] = await pool.query<RowDataPacket[]>(
      `SELECT * FROM citas WHERE id_cita = ?`,
      [idCita]
    );

    return NextResponse.json(
      {
        success: true,
        message: "Cita actualizada exitosamente",
        cita: citaActualizada[0],
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("❌ Error en PUT /api/medico/agenda/[id]:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Error interno del servidor",
        // esto te ayuda mientras desarrollas
        details: error?.message,
      },
      { status: 500 }
    );
  }
}


// =============== DELETE /api/medico/agenda/[id] ===============
export async function DELETE(
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
        { success: false, error: "Sesión inválida o expirada" },
        { status: 401 }
      );
    }

    const idUsuario = sesiones[0].id_usuario;

    // actualizar última actividad
    await pool.query(
      `UPDATE sesiones_usuarios SET ultima_actividad = NOW() WHERE token = ?`,
      [sessionToken]
    );

    const medico = await obtenerMedicoAutenticado(idUsuario);
    if (!medico) {
      return NextResponse.json(
        { success: false, error: "No tienes un registro de médico activo" },
        { status: 403 }
      );
    }

    const idCita = Number(params.id);
    if (Number.isNaN(idCita)) {
      return NextResponse.json(
        { success: false, error: "ID de cita inválido" },
        { status: 400 }
      );
    }

    // comprobar que la cita es del médico
    const [cita] = await pool.query<RowDataPacket[]>(
      `SELECT * FROM citas WHERE id_cita = ? AND id_medico = ?`,
      [idCita, medico.id_medico]
    );

    if (cita.length === 0) {
      return NextResponse.json(
        { success: false, error: "Cita no encontrada" },
        { status: 404 }
      );
    }

    // intentar leer motivo del body (si lo mandas)
    let motivo = "medico_no_disponible";
    let detalle = "Cancelada por el médico desde la agenda";
    try {
      const body = await request.json();
      if (body?.motivo) detalle = body.motivo;
      if (body?.motivo_codigo) motivo = body.motivo_codigo;
    } catch (_) {
      // si no hay body no pasa nada
    }

    // marcar como cancelada
    await pool.query(
      `UPDATE citas SET estado = 'cancelada', modificado_por = ? WHERE id_cita = ?`,
      [idUsuario, idCita]
    );

    // registrar en cancelaciones
    await pool.query(
      `
      INSERT INTO cancelaciones (
        id_cita,
        fecha_cancelacion,
        motivo,
        detalle_motivo,
        cancelado_por,
        cancelado_por_tipo
      ) VALUES (?, NOW(), ?, ?, ?, 'medico')
      `,
      [idCita, motivo, detalle, idUsuario]
    );

    return NextResponse.json(
      { success: true, message: "Cita cancelada exitosamente" },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("❌ Error en DELETE /api/medico/agenda/[id]:", error);
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
