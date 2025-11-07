// app/api/medico/pacientes/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { RowDataPacket, ResultSetHeader } from "mysql2";

// los mismos candidatos de cookie que usas en la lista
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

interface MedicoData {
  id_medico: number;
  id_usuario: number;
  id_centro_principal: number;
  numero_registro_medico: string;
  titulo_profesional: string;
  especialidad_principal: string;
}

async function obtenerMedicoAutenticado(
  idUsuario: number
): Promise<MedicoData | null> {
  const [rows] = await pool.query<RowDataPacket[]>(
    `
    SELECT 
      m.id_medico,
      m.id_usuario,
      m.id_centro_principal,
      m.numero_registro_medico,
      m.titulo_profesional,
      m.especialidad_principal
    FROM medicos m
    WHERE m.id_usuario = ? AND m.estado = 'activo'
    LIMIT 1
    `,
    [idUsuario]
  );

  if (rows.length === 0) return null;
  return rows[0] as MedicoData;
}

// =====================================================
// GET /api/medico/pacientes/[id]  -> obtener 1 paciente
// =====================================================
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const idPaciente = Number(params.id);
    if (!idPaciente) {
      return NextResponse.json(
        { success: false, error: "ID de paciente inválido" },
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
    const medico = await obtenerMedicoAutenticado(idUsuario);

    if (!medico) {
      return NextResponse.json(
        {
          success: false,
          error: "No tienes un registro de médico activo.",
        },
        { status: 403 }
      );
    }

    // actualizar última actividad
    await pool.query(
      `UPDATE sesiones_usuarios SET ultima_actividad = NOW() WHERE token = ?`,
      [sessionToken]
    );

    // sacar datos del paciente, asegurando que sea de este médico
    const [rows] = await pool.query<RowDataPacket[]>(
      `
      SELECT 
        p.id_paciente,
        p.rut,
        p.nombre,
        p.apellido_paterno,
        p.apellido_materno,
        CONCAT(p.nombre, ' ', p.apellido_paterno, ' ', COALESCE(p.apellido_materno, '')) as nombre_completo,
        p.fecha_nacimiento,
        TIMESTAMPDIFF(YEAR, p.fecha_nacimiento, CURDATE()) as edad,
        p.genero,
        p.email,
        p.telefono,
        p.celular,
        p.direccion,
        p.ciudad,
        p.region,
        p.foto_url,
        p.grupo_sanguineo,
        p.estado,
        p.es_vip,
        p.fecha_registro,
        p.clasificacion_riesgo,
        p.peso_kg,
        p.altura_cm,
        p.imc,
        p.notas_importantes,
        p.tags,

        -- última consulta con este médico
        (
          SELECT MAX(hc.fecha_atencion)
          FROM historial_clinico hc
          WHERE hc.id_paciente = p.id_paciente
            AND hc.id_medico = ?
            AND hc.estado_registro != 'anulado'
        ) as ultima_consulta,

        -- próxima cita con este médico
        (
          SELECT MIN(c.fecha_hora_inicio)
          FROM citas c
          WHERE c.id_paciente = p.id_paciente
            AND c.id_medico = ?
            AND c.fecha_hora_inicio > NOW()
            AND c.estado NOT IN ('cancelada', 'no_asistio')
        ) as proxima_cita,

        -- total consultas con este médico
        (
          SELECT COUNT(*)
          FROM historial_clinico hc
          WHERE hc.id_paciente = p.id_paciente
            AND hc.id_medico = ?
            AND hc.estado_registro != 'anulado'
        ) as total_consultas,

        -- total citas con este médico
        (
          SELECT COUNT(*)
          FROM citas c
          WHERE c.id_paciente = p.id_paciente
            AND c.id_medico = ?
        ) as total_citas,

        -- alergias críticas
        (
          SELECT COUNT(*)
          FROM alergias_pacientes ap
          WHERE ap.id_paciente = p.id_paciente
            AND ap.estado = 'activa'
            AND ap.severidad IN ('severa', 'potencialmente_mortal')
        ) as alergias_criticas,

        -- condiciones crónicas
        (
          SELECT COUNT(*)
          FROM condiciones_cronicas cc
          WHERE cc.id_paciente = p.id_paciente
            AND cc.estado IN ('activa', 'controlada', 'en_tratamiento')
        ) as condiciones_cronicas,

        -- medicamentos activos (usa tu tabla con fecha_fin_tratamiento)
        (
          SELECT COUNT(DISTINCT rm.id_medicamento)
          FROM receta_medicamentos rm
          INNER JOIN recetas_medicas rec ON rm.id_receta = rec.id_receta
          WHERE rec.id_paciente = p.id_paciente
            AND rec.id_medico = ?
            AND rec.estado = 'activa'
            AND (rec.fecha_fin_tratamiento IS NULL OR rec.fecha_fin_tratamiento >= CURDATE())
        ) as medicamentos_activos,

        -- exámenes pendientes
        (
          SELECT COUNT(*)
          FROM ordenes_examenes oe
          WHERE oe.id_paciente = p.id_paciente
            AND oe.id_medico = ?
            AND oe.estado IN ('pendiente', 'en_proceso')
        ) as examenes_pendientes,

        -- documentos pendientes
        (
          SELECT COUNT(*)
          FROM documentos_adjuntos da
          WHERE da.id_paciente = p.id_paciente
            AND da.estado = 'activo'
            AND da.es_publico = 0
        ) as documentos_pendientes,

        -- diagnóstico principal
        (
          SELECT d.diagnostico
          FROM diagnosticos d
          WHERE d.id_paciente = p.id_paciente
            AND d.id_medico = ?
            AND d.tipo = 'principal'
            AND d.estado IN ('activo', 'cronico', 'en_tratamiento')
          ORDER BY d.fecha_diagnostico DESC
          LIMIT 1
        ) as diagnostico_principal

      FROM pacientes p
      INNER JOIN pacientes_medico pm ON p.id_paciente = pm.id_paciente
      WHERE p.id_paciente = ?
        AND pm.id_medico = ?
        AND pm.activo = 1
      LIMIT 1
      `,
      [
        medico.id_medico, // ultima consulta
        medico.id_medico, // proxima cita
        medico.id_medico, // total consultas
        medico.id_medico, // total citas
        medico.id_medico, // medicamentos activos
        medico.id_medico, // examenes pend
        medico.id_medico, // diag principal
        idPaciente,
        medico.id_medico,
      ]
    );

    if (rows.length === 0) {
      return NextResponse.json(
        { success: false, error: "Paciente no encontrado o no asignado al médico" },
        { status: 404 }
      );
    }

    const p = rows[0];

    return NextResponse.json(
      {
        success: true,
        paciente: {
          id_paciente: p.id_paciente,
          rut: p.rut,
          nombre: p.nombre,
          apellido_paterno: p.apellido_paterno,
          apellido_materno: p.apellido_materno,
          nombre_completo: p.nombre_completo,
          fecha_nacimiento: p.fecha_nacimiento,
          edad: p.edad,
          genero: p.genero,
          email: p.email,
          telefono: p.telefono,
          celular: p.celular,
          direccion: p.direccion,
          ciudad: p.ciudad,
          region: p.region,
          foto_url: p.foto_url,
          grupo_sanguineo: p.grupo_sanguineo || "desconocido",
          estado: p.estado,
          es_vip: Boolean(p.es_vip),
          fecha_registro: p.fecha_registro,
          clasificacion_riesgo: p.clasificacion_riesgo,
          peso_kg: p.peso_kg,
          altura_cm: p.altura_cm,
          imc: p.imc,
          notas_importantes: p.notas_importantes,
          tags: p.tags
            ? typeof p.tags === "string"
              ? JSON.parse(p.tags)
              : p.tags
            : [],
          ultima_consulta: p.ultima_consulta,
          proxima_cita: p.proxima_cita,
          total_consultas: p.total_consultas || 0,
          total_citas: p.total_citas || 0,
          alergias_criticas: p.alergias_criticas || 0,
          condiciones_cronicas: p.condiciones_cronicas || 0,
          medicamentos_activos: p.medicamentos_activos || 0,
          examenes_pendientes: p.examenes_pendientes || 0,
          documentos_pendientes: p.documentos_pendientes || 0,
          diagnostico_principal: p.diagnostico_principal,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("❌ Error en GET /api/medico/pacientes/[id]:", error);
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

// =====================================================
// PUT /api/medico/pacientes/[id]  -> actualizar 1 paciente
// =====================================================
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const idPaciente = Number(params.id);
    if (!idPaciente) {
      return NextResponse.json(
        { success: false, error: "ID de paciente inválido" },
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
    const medico = await obtenerMedicoAutenticado(idUsuario);

    if (!medico) {
      return NextResponse.json(
        { success: false, error: "No tienes un registro de médico activo." },
        { status: 403 }
      );
    }

    // asegurarnos que el paciente está asignado a este médico
    const [asignacion] = await pool.query<RowDataPacket[]>(
      `
      SELECT 1
      FROM pacientes_medico
      WHERE id_paciente = ? AND id_medico = ? AND activo = 1
      LIMIT 1
      `,
      [idPaciente, medico.id_medico]
    );

    if (asignacion.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Paciente no asignado a este médico",
        },
        { status: 403 }
      );
    }

    const body = await request.json();

    // los mismos campos que manda tu frontend
    const {
      rut,
      nombre,
      apellido_paterno,
      apellido_materno,
      fecha_nacimiento,
      genero,
      email,
      telefono,
      celular,
      direccion,
      ciudad,
      region,
      grupo_sanguineo,
      es_vip,
      clasificacion_riesgo,
      peso_kg,
      altura_cm,
      imc,
      estado_civil,
      ocupacion,
      notas_importantes,
      id_centro_registro,
    } = body;

    // armamos UPDATE solo con columnas reales de tu tabla `pacientes`
    const [result] = await pool.query<ResultSetHeader>(
      `
      UPDATE pacientes
      SET
        rut = ?,
        nombre = ?,
        apellido_paterno = ?,
        apellido_materno = ?,
        fecha_nacimiento = ?,
        genero = ?,
        email = ?,
        telefono = ?,
        celular = ?,
        direccion = ?,
        ciudad = ?,
        region = ?,
        grupo_sanguineo = ?,
        es_vip = ?,
        clasificacion_riesgo = ?,
        peso_kg = ?,
        altura_cm = ?,
        imc = ?,
        estado_civil = ?,
        ocupacion = ?,
        notas_importantes = ?,
        id_centro_registro = ?
      WHERE id_paciente = ?
      LIMIT 1
      `,
      [
        rut || null,
        nombre,
        apellido_paterno,
        apellido_materno || null,
        fecha_nacimiento,
        genero,
        email || null,
        telefono || null,
        celular || null,
        direccion || null,
        ciudad || null,
        region || null,
        grupo_sanguineo || "desconocido",
        es_vip ? 1 : 0,
        clasificacion_riesgo || null,
        // numéricos a null si vienen vacíos
        peso_kg !== "" && peso_kg !== undefined ? peso_kg : null,
        altura_cm !== "" && altura_cm !== undefined ? altura_cm : null,
        imc !== "" && imc !== undefined ? imc : null,
        estado_civil || null,
        ocupacion || null,
        notas_importantes || null,
        id_centro_registro || null,
        idPaciente,
      ]
    );

    if (result.affectedRows === 0) {
      return NextResponse.json(
        { success: false, error: "No se pudo actualizar el paciente" },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    console.error("❌ Error en PUT /api/medico/pacientes/[id]:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Error al guardar el paciente",
        details:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}

// si quieres bloquear DELETE por ahora
export async function DELETE() {
  return NextResponse.json(
    { success: false, error: "Método no permitido" },
    { status: 405 }
  );
}
