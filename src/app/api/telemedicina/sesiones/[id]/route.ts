// frontend/src/app/api/telemedicina/sesiones/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { RowDataPacket } from "mysql2";

// ========================================
// CONST: posibles cookies de sesión
// ========================================
const SESSION_COOKIE_CANDIDATES = [
  "session",
  "session_token",
  "medisalud_session",
  "auth_session",
  "next-auth.session-token",
  "__Secure-next-auth.session-token",
];

// ========================================
// HELPER: obtener token desde cookies o header
// ========================================
function getSessionToken(request: NextRequest): string | null {
  const cookieHeader = request.headers.get("cookie") || "";

  // 1. intentar por cookie
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

  // 2. intentar por Authorization: Bearer
  const authLower = request.headers.get("authorization");
  const authUpper = request.headers.get("Authorization");
  const auth = authLower || authUpper;

  if (auth && auth.startsWith("Bearer ")) {
    return auth.slice(7);
  }

  return null;
}

// ========================================
// HELPER: obtener médico a partir del usuario
// ========================================
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

  if (rows.length === 0) return null;

  return rows[0] as {
    id_medico: number;
    id_usuario: number;
    id_centro_principal: number;
  };
}

// ========================================
// GET /api/telemedicina/sesiones/[id]
// ========================================
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // -------------------------------
    // 0. token
    // -------------------------------
    const sessionToken = getSessionToken(request);
    if (!sessionToken) {
      return NextResponse.json(
        { success: false, error: "No hay sesión activa" },
        { status: 401 }
      );
    }

    // -------------------------------
    // 1. validar sesión de usuario
    // -------------------------------
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

    // -------------------------------
    // 2. obtener médico ligado al usuario
    // -------------------------------
    const medico = await obtenerMedicoAutenticado(idUsuario);
    if (!medico) {
      return NextResponse.json(
        { success: false, error: "No tienes un registro de médico activo" },
        { status: 403 }
      );
    }

    // -------------------------------
    // 3. validar id de la sesión
    // -------------------------------
    const idSesion = Number(params.id);
    if (Number.isNaN(idSesion)) {
      return NextResponse.json(
        { success: false, error: "ID de sesión inválido" },
        { status: 400 }
      );
    }

    // -------------------------------
    // 4. obtener sesión de telemedicina
    //     (solo si pertenece a este médico)
    // -------------------------------
    const [rows] = await pool.query<RowDataPacket[]>(
      `
      SELECT 
        -- sesión
        ts.id_sesion,
        ts.id_cita,
        ts.id_paciente,
        ts.id_medico,
        ts.token_acceso,
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
        ts.evaluacion_paciente,
        ts.evaluacion_medico,

        -- paciente
        p.nombre AS paciente_nombre,
        p.apellido_paterno AS paciente_apellido_paterno,
        p.apellido_materno AS paciente_apellido_materno,
        TIMESTAMPDIFF(YEAR, p.fecha_nacimiento, CURDATE()) AS paciente_edad,
        p.genero AS paciente_genero,
        p.telefono AS paciente_telefono,
        p.email AS paciente_email,
        p.foto_url AS paciente_foto_url,
        p.grupo_sanguineo AS paciente_grupo_sanguineo,
        p.alergias AS paciente_alergias,
        p.condiciones_cronicas AS paciente_condiciones_cronicas,

        -- cita
        c.motivo AS cita_motivo,
        c.tipo_cita,
        c.notas AS cita_notas_previas

      FROM telemedicina_sesiones ts
      INNER JOIN pacientes p ON ts.id_paciente = p.id_paciente
      INNER JOIN citas c ON ts.id_cita = c.id_cita
      WHERE ts.id_sesion = ?
        AND ts.id_medico = ?
      LIMIT 1
      `,
      [idSesion, medico.id_medico]
    );

    if (rows.length === 0) {
      return NextResponse.json(
        { success: false, error: "Sesión no encontrada" },
        { status: 404 }
      );
    }

    const row = rows[0];

    // -------------------------------
    // 5. parsear campos JSON del paciente
    // -------------------------------
    let alergias: string[] = [];
    let condiciones_cronicas: string[] = [];

    try {
      if (row.paciente_alergias) {
        const parsed = JSON.parse(row.paciente_alergias);
        if (Array.isArray(parsed)) alergias = parsed;
      }
    } catch {
      // silencio: dejamos []
    }

    try {
      if (row.paciente_condiciones_cronicas) {
        const parsed = JSON.parse(row.paciente_condiciones_cronicas);
        if (Array.isArray(parsed)) condiciones_cronicas = parsed;
      }
    } catch {
      // silencio: dejamos []
    }

    // -------------------------------
    // 6. armar objeto principal de sesión
    // -------------------------------
    const sesion = {
      id_sesion: row.id_sesion,
      id_cita: row.id_cita,
      id_paciente: row.id_paciente,
      id_medico: row.id_medico,
      token_acceso: row.token_acceso,
      url_sesion:
        row.url_sesion || `/medico/telemedicina/sala?sesion=${row.id_sesion}`,
      estado: row.estado,
      fecha_hora_inicio_programada: row.fecha_hora_inicio_programada,
      fecha_hora_fin_programada: row.fecha_hora_fin_programada,
      fecha_hora_inicio_real: row.fecha_hora_inicio_real,
      fecha_hora_fin_real: row.fecha_hora_fin_real,
      duracion_segundos: row.duracion_segundos,
      proveedor_servicio: row.proveedor_servicio,
      calidad_conexion: row.calidad_conexion,
      grabacion_autorizada: row.grabacion_autorizada === 1,
      url_grabacion: row.url_grabacion,
      evaluacion_paciente: row.evaluacion_paciente,
      evaluacion_medico: row.evaluacion_medico,
      paciente: {
        id_paciente: row.id_paciente,
        nombre_completo: `${row.paciente_nombre} ${row.paciente_apellido_paterno} ${
          row.paciente_apellido_materno || ""
        }`.trim(),
        edad: row.paciente_edad,
        genero: row.paciente_genero,
        telefono: row.paciente_telefono,
        email: row.paciente_email,
        foto_url: row.paciente_foto_url,
        grupo_sanguineo: row.paciente_grupo_sanguineo || "N/A",
        alergias,
        condiciones_cronicas,
      },
      cita: {
        id_cita: row.id_cita,
        motivo: row.cita_motivo,
        tipo_cita: row.tipo_cita,
        notas_previas: row.cita_notas_previas,
      },
    };

    // -------------------------------
    // 7. panel del paciente: historial
    // -------------------------------
    const [historial] = await pool.query<RowDataPacket[]>(
      `
      SELECT 
        hc.id_historial,
        hc.fecha_atencion AS fecha,
        hc.diagnostico_principal AS diagnostico,
        hc.plan_tratamiento AS tratamiento,
        hc.observaciones AS notas
      FROM historial_clinico hc
      WHERE hc.id_paciente = ?
      ORDER BY hc.fecha_atencion DESC
      LIMIT 20
      `,
      [row.id_paciente]
    );

    // -------------------------------
    // 8. panel del paciente: recetas + medicamentos
    // -------------------------------
    const [recetasFlat] = await pool.query<RowDataPacket[]>(
      `
      SELECT 
        r.id_receta,
        r.id_paciente,
        r.id_medico,
        r.id_centro,
        r.tipo_receta,
        r.fecha_emision,
        r.fecha_vencimiento,
        r.estado,
        r.numero_receta,
        r.url_documento,
        r.diagnostico,
        r.codigo_cie10,
        r.es_cronica,
        r.observaciones,

        rm.id_receta_medicamento,
        rm.id_medicamento,
        rm.nombre_medicamento,
        rm.dosis,
        rm.frecuencia,
        rm.duracion,
        rm.cantidad,
        rm.unidad,
        rm.via_administracion,
        rm.instrucciones,
        rm.es_controlado,
        rm.dispensado,
        rm.fecha_dispensacion
      FROM recetas_medicas r
      LEFT JOIN receta_medicamentos rm ON r.id_receta = rm.id_receta
      WHERE r.id_paciente = ?
      ORDER BY r.fecha_emision DESC, r.id_receta DESC
      LIMIT 50
      `,
      [row.id_paciente]
    );

    // agrupar por receta
    const recetasMap = new Map<number, any>();
    for (const r of recetasFlat) {
      if (!recetasMap.has(r.id_receta)) {
        recetasMap.set(r.id_receta, {
          id_receta: r.id_receta,
          id_paciente: r.id_paciente,
          id_medico: r.id_medico,
          id_centro: r.id_centro,
          tipo_receta: r.tipo_receta,
          fecha_emision: r.fecha_emision,
          fecha_vencimiento: r.fecha_vencimiento,
          estado: r.estado,
          numero_receta: r.numero_receta,
          url_documento: r.url_documento,
          diagnostico: r.diagnostico,
          codigo_cie10: r.codigo_cie10,
          es_cronica: r.es_cronica === 1,
          observaciones: r.observaciones,
          medicamentos: [] as any[],
        });
      }

      if (r.id_receta_medicamento) {
        recetasMap.get(r.id_receta).medicamentos.push({
          id_receta_medicamento: r.id_receta_medicamento,
          id_medicamento: r.id_medicamento,
          nombre_medicamento: r.nombre_medicamento,
          dosis: r.dosis,
          frecuencia: r.frecuencia,
          duracion: r.duracion,
          cantidad: r.cantidad,
          unidad: r.unidad,
          via_administracion: r.via_administracion,
          instrucciones: r.instrucciones,
          es_controlado: r.es_controlado === 1,
          dispensado: r.dispensado === 1,
          fecha_dispensacion: r.fecha_dispensacion,
        });
      }
    }
    const recetas = Array.from(recetasMap.values());

    // -------------------------------
    // 9. panel del paciente: exámenes
    // -------------------------------
    const [examenes] = await pool.query<RowDataPacket[]>(
      `
      SELECT 
        e.id_examen,
        e.tipo_examen,
        e.nombre_examen,
        e.prioridad,
        e.indicaciones,
        e.fecha_solicitud,
        e.estado_resultado,
        e.url_resultado
      FROM examenes_solicitados e
      WHERE e.id_paciente = ?
      ORDER BY e.fecha_solicitud DESC
      LIMIT 20
      `,
      [row.id_paciente]
    );

    // -------------------------------
    // 10. actualizar actividad de la sesión
    // -------------------------------
    await pool.query(
      `UPDATE sesiones_usuarios SET ultima_actividad = NOW() WHERE token = ?`,
      [sessionToken]
    );

    // -------------------------------
    // 11. responder
    // -------------------------------
    return NextResponse.json(
      {
        success: true,
        sesion,
        panel: {
          historial,
          recetas,
          examenes,
        },
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("❌ Error en GET /api/telemedicina/sesiones/[id]:", error);
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
