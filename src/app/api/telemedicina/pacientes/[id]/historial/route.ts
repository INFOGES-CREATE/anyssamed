import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { RowDataPacket } from "mysql2";

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
    for (const name of ["session", "session_token", "medisalud_session", "auth_session"]) {
      if (cookies[name]) return decodeURIComponent(cookies[name]);
    }
  }
  const auth = request.headers.get("authorization") || request.headers.get("Authorization");
  if (auth && auth.startsWith("Bearer ")) return auth.slice(7);
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

    // usa tu tabla sesiones_usuarios
    const [sesiones] = await pool.query<RowDataPacket[]>(
      `
      SELECT su.id_usuario
      FROM sesiones_usuarios su
      WHERE su.token = ?
        AND su.activa = 1
        AND su.fecha_expiracion > NOW()
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

    const idPaciente = Number(params.id);
    if (Number.isNaN(idPaciente)) {
      return NextResponse.json(
        { success: false, error: "ID de paciente inválido" },
        { status: 400 }
      );
    }

    // datos del paciente
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
        p.email
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
      nombre_completo: `${pacRows[0].nombre} ${pacRows[0].apellido_paterno ?? ""} ${pacRows[0].apellido_materno ?? ""}`.trim(),
      rut: pacRows[0].rut,
      edad: pacRows[0].edad,
      genero: pacRows[0].genero,
      telefono: pacRows[0].telefono,
      email: pacRows[0].email,
    };

    // ===== NOTAS CLÍNICAS (aquí estaba tu error) =====
    const [notas] = await pool.query<RowDataPacket[]>(
      `
      SELECT 
        n.id_nota,
        n.id_paciente,
        n.fecha_nota,
        n.tipo_nota,
        n.contenido,
        COALESCE(
          CONCAT(u.nombre, ' ', u.apellido_paterno),
          u.nombre,
          CONCAT('Usuario #', n.id_usuario)
        ) AS autor_nombre,
        n.nivel_privacidad,
        n.estado,
        n.etiquetas
      FROM notas_clinicas n
      LEFT JOIN usuarios u ON u.id_usuario = n.id_usuario
      WHERE n.id_paciente = ?
      ORDER BY n.fecha_nota DESC
      LIMIT 200
      `,
      [idPaciente]
    );

    // ===== SIGNOS VITALES =====
    const [signosVitales] = await pool.query<RowDataPacket[]>(
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
        sv.dolor_eva,
        sv.glucemia,
        sv.estado_conciencia,
        sv.observaciones
      FROM signos_vitales sv
      WHERE sv.id_paciente = ?
      ORDER BY sv.fecha_medicion DESC
      LIMIT 200
      `,
      [idPaciente]
    );

    // ===== DOCUMENTOS ADJUNTOS =====
    const [documentos] = await pool.query<RowDataPacket[]>(
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
    );

    // ===== EXÁMENES SOLICITADOS =====
    const [examenesSolicitados] = await pool.query<RowDataPacket[]>(
      `
      SELECT 
        es.id_examen,
        es.id_paciente,
        es.id_medico,
        es.id_centro,
        es.tipo_examen,
        es.nombre_examen,
        es.prioridad,
        es.indicaciones,
        es.estado_resultado,
        es.fecha_solicitud,
        es.fecha_resultado,
        es.url_resultado
      FROM examenes_solicitados es
      WHERE es.id_paciente = ?
      ORDER BY es.fecha_solicitud DESC
      LIMIT 200
      `,
      [idPaciente]
    );

    // ===== RESULTADOS DE EXÁMENES =====
    const [resultadosExamenes] = await pool.query<RowDataPacket[]>(
      `
      SELECT 
        re.id_resultado,
        re.id_examen,
        re.fecha_resultado,
        re.titulo,
        re.formato,
        re.resultado_texto,
        re.resultado_numerico,
        re.unidad_medida,
        re.url_resultado,
        re.interpretacion,
        re.estado,
        re.es_critico
      FROM resultados_examenes re
      WHERE re.id_paciente = ?
      ORDER BY re.fecha_resultado DESC
      LIMIT 500
      `,
      [idPaciente]
    );

    const resultadosPorExamen = new Map<number, any[]>();
    for (const r of resultadosExamenes) {
      if (!resultadosPorExamen.has(r.id_examen)) {
        resultadosPorExamen.set(r.id_examen, []);
      }
      resultadosPorExamen.get(r.id_examen)!.push(r);
    }

    const examenes = examenesSolicitados.map((e) => ({
      id_examen: e.id_examen,
      tipo_examen: e.tipo_examen,
      nombre_examen: e.nombre_examen,
      prioridad: e.prioridad,
      estado: e.estado_resultado,
      fecha_solicitud: e.fecha_solicitud,
      fecha_resultado: e.fecha_resultado,
      url_resultado: e.url_resultado,
      resultados: resultadosPorExamen.get(e.id_examen) || [],
    }));

    // ===== PLANES AUTOCUIDADO =====
    const [planes] = await pool.query<RowDataPacket[]>(
      `
      SELECT 
        pa.id_plan,
        pa.nombre,
        pa.descripcion,
        pa.objetivos,
        pa.fecha_inicio,
        pa.fecha_fin,
        pa.estado,
        pa.nivel_complejidad,
        pa.progreso_porcentaje
      FROM planes_autocuidado pa
      WHERE pa.id_paciente = ?
      ORDER BY pa.fecha_inicio DESC
      `,
      [idPaciente]
    );

    // actualizar actividad
    await pool.query(
      `UPDATE sesiones_usuarios SET ultima_actividad = NOW() WHERE token = ?`,
      [sessionToken]
    );

    return NextResponse.json(
      {
        success: true,
        paciente,
        historial: {
          notas,
          signos_vitales: signosVitales,
          documentos,
          examenes,
          planes_autocuidado: planes,
        },
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch (err: any) {
    console.error("Error en historial:", err);
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
