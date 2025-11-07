// frontend/src/app/api/telemedicina/historial/route.ts
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
      if (cookies[name]) return decodeURIComponent(cookies[name]);
    }
  }

  const auth = request.headers.get("authorization") || request.headers.get("Authorization");
  if (auth?.startsWith("Bearer ")) return auth.slice(7);

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
    WHERE m.id_usuario = ?
      AND m.estado = 'activo'
    LIMIT 1
    `,
    [idUsuario]
  );
  return rows.length ? rows[0] : null;
}

// normalizador para que el frontend no muestre "Invalid Date"
function mapSesionFilaToDTO(s: any) {
  const nombrePaciente = `${s.paciente_nombre ?? ""} ${s.paciente_apellido_paterno ?? ""} ${
    s.paciente_apellido_materno ?? ""
  }`
    .trim()
    .replace(/\s+/g, " ");

  const fecha_inicio =
    s.fecha_hora_inicio_real ||
    s.fecha_hora_inicio_programada ||
    s.fecha_creacion ||
    null;

  const fecha_fin = s.fecha_hora_fin_real || s.fecha_hora_fin_programada || null;

  const duracion_minutos =
    typeof s.duracion_segundos === "number" && s.duracion_segundos !== null
      ? Math.max(1, Math.round(s.duracion_segundos / 60))
      : null;

  const canal = s.proveedor_servicio ? "video" : "video";

  const resumen =
    s.notas_tecnicas ||
    null;

  return {
    id_sesion: s.id_sesion,
    id_paciente: s.id_paciente,
    nombre_paciente: nombrePaciente || "Paciente sin nombre",
    rut_paciente: s.paciente_rut ?? null,
    fecha_inicio,
    fecha_fin,
    estado: s.estado,
    motivo: null, // no lo tenemos en tu esquema actual
    canal,
    duracion_minutos,
    calificacion: s.calificacion ? Number(s.calificacion) : null,
    resumen,
    url_grabacion: s.url_grabacion || s.url_grabacion_extra || null,
    telefono_paciente: s.paciente_telefono ?? null,
    email_paciente: s.paciente_email ?? null,
    ubicacion_paciente: s.paciente_direccion ?? null,
  };
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

    // validar sesión
    const [sesiones] = await pool.query<RowDataPacket[]>(
      `
      SELECT su.id_usuario
      FROM sesiones_usuarios su
      INNER JOIN usuarios u ON u.id_usuario = su.id_usuario
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
    const medico = await obtenerMedicoAutenticado(idUsuario);
    if (!medico) {
      return NextResponse.json(
        { success: false, error: "No tienes un registro de médico activo" },
        { status: 403 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const idPacienteParam = searchParams.get("paciente") || searchParams.get("id_paciente");
    const limite = Number(searchParams.get("limite") || 200);

    // ============================
    // MODO 1: LISTA GENERAL
    // ============================
    if (!idPacienteParam) {
      const [sesionesTele] = await pool.query<RowDataPacket[]>(
        `
        SELECT 
          ts.id_sesion,
          ts.id_cita,
          ts.id_paciente,
          ts.id_medico,
          ts.url_sesion,
          ts.estado,
          ts.fecha_hora_inicio_programada,
          ts.fecha_hora_fin_programada,
          ts.fecha_hora_inicio_real,
          ts.fecha_hora_fin_real,
          ts.duracion_segundos,
          ts.proveedor_servicio,
          ts.calidad_conexion,
          ts.grabacion_autorizada,
          ts.url_grabacion,
          ts.notas_tecnicas,
          ts.fecha_creacion,

          p.nombre AS paciente_nombre,
          p.apellido_paterno AS paciente_apellido_paterno,
          p.apellido_materno AS paciente_apellido_materno,
          p.rut AS paciente_rut,
          p.telefono AS paciente_telefono,
          p.email AS paciente_email,
          p.direccion AS paciente_direccion,

          (
            SELECT es.valoracion_general
            FROM encuestas_satisfaccion es
            WHERE es.id_paciente = ts.id_paciente
              AND (es.id_medico IS NULL OR es.id_medico = ts.id_medico)
            ORDER BY es.fecha_encuesta DESC
            LIMIT 1
          ) AS calificacion,

          (
            SELECT tg.url_grabacion
            FROM telemedicina_grabaciones tg
            WHERE tg.id_sesion = ts.id_sesion
            ORDER BY tg.fecha_inicio_grabacion DESC
            LIMIT 1
          ) AS url_grabacion_extra

        FROM telemedicina_sesiones ts
        INNER JOIN pacientes p ON p.id_paciente = ts.id_paciente
        -- si quieres puedes dejar LEFT JOIN citas c ON c.id_cita = ts.id_cita
        WHERE ts.id_medico = ?
          AND ts.estado <> 'eliminada'
        ORDER BY COALESCE(ts.fecha_hora_inicio_real, ts.fecha_hora_inicio_programada, ts.fecha_creacion) DESC
        LIMIT ?
        `,
        [medico.id_medico, limite]
      );

      const sesionesNormalizadas = sesionesTele.map(mapSesionFilaToDTO);

      await pool.query(
        `UPDATE sesiones_usuarios SET ultima_actividad = NOW() WHERE token = ?`,
        [sessionToken]
      );

      return NextResponse.json(
        {
          success: true,
          modo: "lista",
          sesiones: sesionesNormalizadas,
          timestamp: new Date().toISOString(),
        },
        { status: 200 }
      );
    }

    // ============================
    // MODO 2: POR PACIENTE
    // ============================
    const idPaciente = Number(idPacienteParam);
    if (Number.isNaN(idPaciente)) {
      return NextResponse.json(
        { success: false, error: "ID de paciente inválido" },
        { status: 400 }
      );
    }

    const [pacRows] = await pool.query<RowDataPacket[]>(
      `
      SELECT 
        p.id_paciente,
        p.nombre,
        p.apellido_paterno,
        p.apellido_materno,
        p.rut,
        p.fecha_nacimiento,
        TIMESTAMPDIFF(YEAR, p.fecha_nacimiento, CURDATE()) AS edad,
        p.genero,
        p.telefono,
        p.email,
        p.direccion,
        p.foto_url,
        p.grupo_sanguineo
      FROM pacientes p
      WHERE p.id_paciente = ?
      LIMIT 1
      `,
      [idPaciente]
    );

    if (pacRows.length === 0) {
      return NextResponse.json(
        { success: false, error: "Paciente no encontrado" },
        { status: 404 }
      );
    }

    const paciente = {
      id_paciente: pacRows[0].id_paciente,
      nombre_completo: `${pacRows[0].nombre} ${pacRows[0].apellido_paterno ?? ""} ${
        pacRows[0].apellido_materno ?? ""
      }`.trim(),
      rut: pacRows[0].rut,
      edad: pacRows[0].edad,
      genero: pacRows[0].genero,
      telefono: pacRows[0].telefono,
      email: pacRows[0].email,
      direccion: pacRows[0].direccion,
      foto_url: pacRows[0].foto_url,
      grupo_sanguineo: pacRows[0].grupo_sanguineo,
    };

    const [sesionesTele] = await pool.query<RowDataPacket[]>(
      `
      SELECT 
        ts.id_sesion,
        ts.id_cita,
        ts.id_paciente,
        ts.id_medico,
        ts.url_sesion,
        ts.estado,
        ts.fecha_hora_inicio_programada,
        ts.fecha_hora_fin_programada,
        ts.fecha_hora_inicio_real,
        ts.fecha_hora_fin_real,
        ts.duracion_segundos,
        ts.proveedor_servicio,
        ts.id_sala_virtual,
        ts.calidad_conexion,
        ts.dispositivo_paciente,
        ts.navegador_paciente,
        ts.ip_paciente,
        ts.notas_tecnicas,
        ts.grabacion_autorizada,
        ts.url_grabacion,
        ts.evaluacion_paciente,
        ts.evaluacion_medico,
        ts.fecha_creacion,

        p.nombre AS paciente_nombre,
        p.apellido_paterno AS paciente_apellido_paterno,
        p.apellido_materno AS paciente_apellido_materno,
        p.rut AS paciente_rut,
        p.telefono AS paciente_telefono,
        p.email AS paciente_email,
        p.direccion AS paciente_direccion,

        (
          SELECT es.valoracion_general
          FROM encuestas_satisfaccion es
          WHERE es.id_paciente = ts.id_paciente
            AND (es.id_medico IS NULL OR es.id_medico = ts.id_medico)
            AND (es.id_cita IS NULL OR es.id_cita = ts.id_cita)
          ORDER BY es.fecha_encuesta DESC
          LIMIT 1
        ) AS calificacion,

        (
          SELECT tg.url_grabacion
          FROM telemedicina_grabaciones tg
          WHERE tg.id_sesion = ts.id_sesion
          ORDER BY tg.fecha_inicio_grabacion DESC
          LIMIT 1
        ) AS url_grabacion_extra

      FROM telemedicina_sesiones ts
      INNER JOIN pacientes p ON p.id_paciente = ts.id_paciente
      WHERE ts.id_paciente = ?
        AND ts.id_medico = ?
        AND ts.estado <> 'eliminada'
      ORDER BY COALESCE(ts.fecha_hora_inicio_real, ts.fecha_hora_inicio_programada, ts.fecha_creacion) DESC
      LIMIT ?
      `,
      [idPaciente, medico.id_medico, limite]
    );

    const sesionesNormalizadas = sesionesTele.map(mapSesionFilaToDTO);

    // grabaciones
    const [grabaciones] = await pool.query<RowDataPacket[]>(
      `
      SELECT 
        tg.id_grabacion,
        tg.id_sesion,
        tg.url_grabacion,
        tg.fecha_inicio_grabacion,
        tg.fecha_fin_grabacion,
        tg.duracion_segundos,
        tg.tamano_bytes,
        tg.formato,
        tg.estado,
        tg.consentimiento_paciente
      FROM telemedicina_grabaciones tg
      INNER JOIN telemedicina_sesiones ts ON ts.id_sesion = tg.id_sesion
      WHERE ts.id_paciente = ?
        AND ts.id_medico = ?
      ORDER BY tg.fecha_inicio_grabacion DESC
      LIMIT 200
      `,
      [idPaciente, medico.id_medico]
    );

    // enlaces
    const [enlaces] = await pool.query<RowDataPacket[]>(
      `
      SELECT 
        te.id_enlace,
        te.id_sesion,
        te.tipo_enlace,
        te.url_acceso,
        te.fecha_generacion,
        te.fecha_expiracion,
        te.acceso_unico,
        te.utilizado,
        te.fecha_uso,
        te.estado
      FROM telemedicina_enlaces te
      INNER JOIN telemedicina_sesiones ts ON ts.id_sesion = te.id_sesion
      WHERE ts.id_paciente = ?
        AND ts.id_medico = ?
      ORDER BY te.fecha_generacion DESC
      LIMIT 200
      `,
      [idPaciente, medico.id_medico]
    );

    // notas (si existe la tabla)
    const [notas] = await pool
      .query<RowDataPacket[]>(
        `
        SELECT 
          n.id_nota,
          n.id_paciente,
          n.fecha_nota,
          n.tipo_nota,
          n.contenido,
          n.nivel_privacidad,
          n.estado,
          n.etiquetas,
          COALESCE(CONCAT(u.nombre, ' ', u.apellido_paterno), u.nombre, CONCAT('Usuario #', n.id_usuario)) AS autor
        FROM notas_clinicas n
        LEFT JOIN usuarios u ON u.id_usuario = n.id_usuario
        WHERE n.id_paciente = ?
        ORDER BY n.fecha_nota DESC
        LIMIT 200
        `,
        [idPaciente]
      )
      .catch(() => [[] as any] as any);

    // signos (si existe)
    const [signosVitales] = await pool
      .query<RowDataPacket[]>(
        `
        SELECT 
          sv.id_signo_vital,
          sv.fecha_medicion,
          sv.presion_sistolica,
          sv.presion_diastolica,
          sv.pulso,
          sv.frecuencia_respiratoria,
          sv.temperatura,
          sv.saturacion_oxigeno,
          sv.peso,
          sv.talla,
          sv.imc,
          sv.observaciones
        FROM signos_vitales sv
        WHERE sv.id_paciente = ?
        ORDER BY sv.fecha_medicion DESC
        LIMIT 200
        `,
        [idPaciente]
      )
      .catch(() => [[] as any] as any);

    // documentos (si existe)
    const [documentos] = await pool
      .query<RowDataPacket[]>(
        `
        SELECT 
          d.id_documento,
          d.tipo_documento,
          d.nombre_archivo,
          d.url_archivo,
          d.descripcion,
          d.fecha_documento,
          d.origen,
          d.entidad_origen,
          d.etiquetas,
          d.estado
        FROM documentos_adjuntos d
        WHERE d.id_paciente = ?
          AND d.estado = 'activo'
        ORDER BY COALESCE(d.fecha_documento, d.fecha_subida) DESC
        LIMIT 200
        `,
        [idPaciente]
      )
      .catch(() => [[] as any] as any);

    // citas: aquí hacemos SELECT c.* para no rompernos con columnas que no existen
    const [citas] = await pool
      .query<RowDataPacket[]>(
        `
        SELECT c.*
        FROM citas c
        WHERE c.id_paciente = ?
          AND c.id_medico = ?
        ORDER BY c.fecha_hora_inicio DESC
        LIMIT 200
        `,
        [idPaciente, medico.id_medico]
      )
      .catch(() => [[] as any] as any);

    await pool.query(
      `UPDATE sesiones_usuarios SET ultima_actividad = NOW() WHERE token = ?`,
      [sessionToken]
    );

    return NextResponse.json(
      {
        success: true,
        modo: "paciente",
        paciente,
        telemedicina: {
          sesiones: sesionesNormalizadas,
          grabaciones,
          enlaces,
        },
        clinico: {
          notas,
          signos_vitales: signosVitales,
          documentos,
          citas,
        },
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch (err: any) {
    console.error("❌ Error en GET /api/telemedicina/historial:", err);
    return NextResponse.json(
      {
        success: false,
        error: "Error interno del servidor",
        details: err.message,
      },
      { status: 500 }
    );
  }
}
