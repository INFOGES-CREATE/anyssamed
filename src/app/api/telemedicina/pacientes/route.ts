// frontend/src/app/api/telemedicina/pacientes/route.ts

import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { RowDataPacket } from "mysql2";

// ========================================
// TIPOS
// ========================================

interface MedicoData {
  id_medico: number;
  id_usuario: number;
  id_centro_principal: number;
}

interface PacienteFrecuente {
  id_paciente: number;
  nombre_completo: string;
  edad: number;
  genero: string;
  telefono: string | null;
  email: string | null;
  foto_url: string | null;
  grupo_sanguineo: string;
  total_consultas: number;
  consultas_telemedicina: number;
  ultima_consulta: string | null;
  dias_desde_ultima: number;
  estado: string;
  alergias_criticas: number;
  alergias_nombres: string[];
  condiciones_cronicas: string[];
  calificacion_promedio: number;
}

// ========================================
// HELPER PARA OBTENER TOKEN
// ========================================

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

// ========================================
// FUNCIONES AUXILIARES
// ========================================

async function obtenerMedicoAutenticado(idUsuario: number): Promise<MedicoData | null> {
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
  return rows[0] as MedicoData;
}

async function obtenerPacientesFrecuentes(
  idMedico: number,
  limite: number = 20
): Promise<PacienteFrecuente[]> {
  // OJO: aquí todo está con tus nombres de columnas
  const [rows] = await pool.query<RowDataPacket[]>(
    `
    SELECT 
      p.id_paciente,
      CONCAT(p.nombre, ' ', p.apellido_paterno, ' ', COALESCE(p.apellido_materno, '')) AS nombre_completo,
      TIMESTAMPDIFF(YEAR, p.fecha_nacimiento, CURDATE()) AS edad,
      p.genero,
      p.telefono,
      p.email,
      p.foto_url,
      p.grupo_sanguineo,
      p.estado,

      -- Total de consultas con este médico
      (
        SELECT COUNT(*)
        FROM citas c
        WHERE c.id_paciente = p.id_paciente
          AND c.id_medico = ?
          AND c.estado IN ('completada', 'finalizada')
      ) AS total_consultas,

      -- Consultas de telemedicina
      (
        SELECT COUNT(*)
        FROM telemedicina_sesiones ts
        WHERE ts.id_paciente = p.id_paciente
          AND ts.id_medico = ?
          AND ts.estado = 'finalizada'
      ) AS consultas_telemedicina,

      -- Última consulta
      (
        SELECT MAX(c.fecha_hora_inicio)
        FROM citas c
        WHERE c.id_paciente = p.id_paciente
          AND c.id_medico = ?
          AND c.estado IN ('completada', 'finalizada')
      ) AS ultima_consulta,

      -- Días desde última consulta
      DATEDIFF(
        CURDATE(),
        (
          SELECT MAX(c.fecha_hora_inicio)
          FROM citas c
          WHERE c.id_paciente = p.id_paciente
            AND c.id_medico = ?
            AND c.estado IN ('completada', 'finalizada')
        )
      ) AS dias_desde_ultima,

      -- Alergias críticas según tu tabla (severa, potencialmente_mortal)
      (
        SELECT COUNT(*)
        FROM alergias_pacientes ap
        WHERE ap.id_paciente = p.id_paciente
          AND ap.estado = 'activa'
          AND ap.severidad IN ('severa', 'potencialmente_mortal')
      ) AS alergias_criticas,

      -- Nombres de alérgenos activos
      (
        SELECT GROUP_CONCAT(ap.nombre_alergeno SEPARATOR '|')
        FROM alergias_pacientes ap
        WHERE ap.id_paciente = p.id_paciente
          AND ap.estado = 'activa'
      ) AS alergias_nombres,

      -- Condiciones crónicas activas
      (
        SELECT GROUP_CONCAT(cc.nombre_condicion SEPARATOR '|')
        FROM condiciones_cronicas cc
        WHERE cc.id_paciente = p.id_paciente
          AND cc.estado = 'activa'
      ) AS condiciones_cronicas,

      -- Calificación promedio tomada de encuestas_satisfaccion
      (
        SELECT AVG(es.valoracion_general)
        FROM encuestas_satisfaccion es
        WHERE es.id_paciente = p.id_paciente
          AND es.id_medico = ?
          AND es.valoracion_general IS NOT NULL
      ) AS calificacion_promedio

    FROM pacientes p
    WHERE EXISTS (
      SELECT 1
      FROM citas c
      WHERE c.id_paciente = p.id_paciente
        AND c.id_medico = ?
        AND c.estado IN ('completada', 'finalizada')
    )
      AND p.estado = 'activo'
    ORDER BY total_consultas DESC, ultima_consulta DESC
    LIMIT ?
    `,
    [
      idMedico,
      idMedico,
      idMedico,
      idMedico,
      idMedico, // para encuestas_satisfaccion
      idMedico, // para EXISTS
      limite,
    ]
  );

  return rows.map((row) => ({
    id_paciente: row.id_paciente,
    nombre_completo: row.nombre_completo,
    edad: row.edad,
    genero: row.genero,
    telefono: row.telefono,
    email: row.email,
    foto_url: row.foto_url,
    grupo_sanguineo: row.grupo_sanguineo || "N/A",
    total_consultas: row.total_consultas || 0,
    consultas_telemedicina: row.consultas_telemedicina || 0,
    ultima_consulta: row.ultima_consulta,
    dias_desde_ultima: row.dias_desde_ultima ?? 0,
    estado: row.estado,
    alergias_criticas: row.alergias_criticas || 0,
    alergias_nombres: row.alergias_nombres ? row.alergias_nombres.split("|") : [],
    condiciones_cronicas: row.condiciones_cronicas ? row.condiciones_cronicas.split("|") : [],
    calificacion_promedio: row.calificacion_promedio ? parseFloat(Number(row.calificacion_promedio).toFixed(1)) : 0,
  }));
}

async function obtenerDetallePaciente(idPaciente: number, idMedico: number): Promise<any> {
  // detalle principal del paciente
  const [rows] = await pool.query<RowDataPacket[]>(
    `
    SELECT 
      p.id_paciente,
      CONCAT(p.nombre, ' ', p.apellido_paterno, ' ', COALESCE(p.apellido_materno, '')) AS nombre_completo,
      p.rut,
      p.fecha_nacimiento,
      TIMESTAMPDIFF(YEAR, p.fecha_nacimiento, CURDATE()) AS edad,
      p.genero,
      p.telefono,
      p.email,
      p.direccion,
      p.foto_url,
      p.grupo_sanguineo,
      p.estado,
      p.fecha_registro,
      ps.nombre AS prevision_nombre,

      -- total consultas con este médico
      (
        SELECT COUNT(*)
        FROM citas c
        WHERE c.id_paciente = p.id_paciente
          AND c.id_medico = ?
          AND c.estado IN ('completada', 'finalizada')
      ) AS total_consultas,

      -- última consulta
      (
        SELECT MAX(c.fecha_hora_inicio)
        FROM citas c
        WHERE c.id_paciente = p.id_paciente
          AND c.id_medico = ?
          AND c.estado IN ('completada', 'finalizada')
      ) AS ultima_consulta,

      -- próxima cita con este médico
      (
        SELECT MIN(c.fecha_hora_inicio)
        FROM citas c
        WHERE c.id_paciente = p.id_paciente
          AND c.id_medico = ?
          AND c.estado IN ('programada', 'confirmada')
          AND c.fecha_hora_inicio > NOW()
      ) AS proxima_cita

    FROM pacientes p
    LEFT JOIN previsiones_salud ps ON p.id_prevision = ps.id_prevision
    WHERE p.id_paciente = ?
    LIMIT 1
    `,
    [idMedico, idMedico, idMedico, idPaciente]
  );

  if (rows.length === 0) return null;
  const paciente = rows[0];

  // alergias activas (tus columnas)
  const [alergias] = await pool.query<RowDataPacket[]>(
    `
    SELECT 
      tipo_alergia,
      nombre_alergeno,
      severidad,
      reaccion,
      fecha_diagnostico
    FROM alergias_pacientes
    WHERE id_paciente = ?
      AND estado = 'activa'
    ORDER BY 
      FIELD(severidad, 'potencialmente_mortal', 'severa', 'moderada', 'leve'),
      fecha_diagnostico DESC
    `,
    [idPaciente]
  );

  // condiciones crónicas (tus columnas)
  const [condiciones] = await pool.query<RowDataPacket[]>(
    `
    SELECT 
      nombre_condicion,
      codigo_cie10,
      fecha_diagnostico,
      severidad,
      estado,
      tratamiento_actual
    FROM condiciones_cronicas
    WHERE id_paciente = ?
      AND estado = 'activa'
    ORDER BY fecha_diagnostico DESC
    `,
    [idPaciente]
  );

  // últimos signos vitales (esto depende de tu tabla real; dejo como estaba)
  const [signosVitales] = await pool.query<RowDataPacket[]>(
    `
    SELECT 
      presion_sistolica,
      presion_diastolica,
      frecuencia_cardiaca,
      temperatura,
      saturacion_oxigeno,
      frecuencia_respiratoria,
      peso,
      altura,
      imc,
      fecha_registro
    FROM signos_vitales
    WHERE id_paciente = ?
    ORDER BY fecha_registro DESC
    LIMIT 1
    `,
    [idPaciente]
  );

  // calificación promedio desde encuestas_satisfaccion
  const [encuestas] = await pool.query<RowDataPacket[]>(
    `
    SELECT AVG(valoracion_general) AS calificacion_promedio
    FROM encuestas_satisfaccion
    WHERE id_paciente = ?
      AND id_medico = ?
      AND valoracion_general IS NOT NULL
    `,
    [idPaciente, idMedico]
  );

  return {
    ...paciente,
    alergias,
    condiciones_cronicas: condiciones,
    ultimos_signos_vitales: signosVitales.length > 0 ? signosVitales[0] : null,
    calificacion_promedio: encuestas[0]?.calificacion_promedio
      ? parseFloat(Number(encuestas[0].calificacion_promedio).toFixed(1))
      : 0,
  };
}

// ========================================
// HANDLER GET
// ========================================

export async function GET(request: NextRequest) {
  try {
    const sessionToken = getSessionToken(request);
    if (!sessionToken) {
      return NextResponse.json({ success: false, error: "No hay sesión activa" }, { status: 401 });
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
      return NextResponse.json({ success: false, error: "Sesión inválida o expirada" }, { status: 401 });
    }

    const idUsuario = sesiones[0].id_usuario;

    // médico
    const medico = await obtenerMedicoAutenticado(idUsuario);
    if (!medico) {
      return NextResponse.json(
        { success: false, error: "No tienes un registro de médico activo" },
        { status: 403 }
      );
    }

    // params
    const searchParams = request.nextUrl.searchParams;
    const limite = parseInt(searchParams.get("limite") || "20", 10);
    const idPaciente = searchParams.get("id_paciente");

    // actualizar actividad
    await pool.query(`UPDATE sesiones_usuarios SET ultima_actividad = NOW() WHERE token = ?`, [sessionToken]);

    // paciente específico
    if (idPaciente) {
      const detalle = await obtenerDetallePaciente(parseInt(idPaciente, 10), medico.id_medico);
      if (!detalle) {
        return NextResponse.json({ success: false, error: "Paciente no encontrado" }, { status: 404 });
      }
      return NextResponse.json(
        {
          success: true,
          paciente: detalle,
          timestamp: new Date().toISOString(),
        },
        { status: 200 }
      );
    }

    // lista
    const pacientes = await obtenerPacientesFrecuentes(medico.id_medico, limite);

    const totalPacientes = pacientes.length;
    const totalConsultas = pacientes.reduce((sum, p) => sum + p.total_consultas, 0);
    const totalTelemedicina = pacientes.reduce((sum, p) => sum + p.consultas_telemedicina, 0);
    const promedioConsultasPorPaciente = totalPacientes > 0 ? totalConsultas / totalPacientes : 0;

    return NextResponse.json(
      {
        success: true,
        pacientes,
        estadisticas: {
          total_pacientes: totalPacientes,
          total_consultas: totalConsultas,
          total_telemedicina: totalTelemedicina,
          promedio_consultas_por_paciente: parseFloat(promedioConsultasPorPaciente.toFixed(2)),
        },
        filtros: { limite },
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("❌ Error en GET /api/telemedicina/pacientes:", error);
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
