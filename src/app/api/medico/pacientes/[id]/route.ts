// app/api/medico/pacientes/[id]/route.ts
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

// ============================
// helpers de sesión
// ============================
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

  const auth = request.headers.get("authorization");
  if (auth?.startsWith("Bearer ")) return auth.slice(7);

  return null;
}

async function obtenerMedicoAutenticado(idUsuario: number) {
  const [rows] = await pool.query<RowDataPacket[]>(
    `
    SELECT 
      m.id_medico,
      m.id_centro_principal
    FROM medicos m
    WHERE m.id_usuario = ? AND m.estado = 'activo'
    LIMIT 1
    `,
    [idUsuario]
  );

  if (rows.length === 0) return null;
  return rows[0];
}

// ============================
// GET: detalle de un paciente
// ============================
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

    const medico = await obtenerMedicoAutenticado(sesiones[0].id_usuario);
    if (!medico) {
      return NextResponse.json(
        {
          success: false,
          error: "No tienes un registro de médico activo.",
        },
        { status: 403 }
      );
    }

    const idPaciente = parseInt(params.id, 10);
    if (Number.isNaN(idPaciente)) {
      return NextResponse.json(
        { success: false, error: "ID de paciente inválido" },
        { status: 400 }
      );
    }

    // traemos lo mismo que en el listado: datos + última consulta + próxima cita + diagnóstico principal
    const [rows] = await pool.query<RowDataPacket[]>(
      `
      SELECT 
        p.id_paciente,
        p.rut,
        p.nombre,
        p.apellido_paterno,
        p.apellido_materno,
        p.fecha_nacimiento,
        TIMESTAMPDIFF(YEAR, p.fecha_nacimiento, CURDATE()) AS edad,
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
        p.notas_administrativas,
        p.tags,
        (
          SELECT d.diagnostico
          FROM diagnosticos d
          WHERE d.id_paciente = p.id_paciente
            AND d.id_medico = ?
            AND d.tipo = 'principal'
            AND d.estado IN ('activo','cronico','en_tratamiento')
          ORDER BY d.fecha_diagnostico DESC
          LIMIT 1
        ) AS diagnostico_principal,
        (
          SELECT MAX(hc.fecha_atencion)
          FROM historial_clinico hc
          WHERE hc.id_paciente = p.id_paciente
            AND hc.id_medico = ?
            AND hc.estado_registro != 'anulado'
        ) AS ultima_consulta,
        (
          SELECT MIN(c.fecha_hora_inicio)
          FROM citas c
          WHERE c.id_paciente = p.id_paciente
            AND c.id_medico = ?
            AND c.fecha_hora_inicio > NOW()
            AND c.estado NOT IN ('cancelada','no_asistio')
        ) AS proxima_cita
      FROM pacientes p
      INNER JOIN pacientes_medico pm ON p.id_paciente = pm.id_paciente
      WHERE p.id_paciente = ?
        AND pm.id_medico = ?
        AND pm.activo = 1
      LIMIT 1
      `,
      [
        medico.id_medico,
        medico.id_medico,
        medico.id_medico,
        idPaciente,
        medico.id_medico,
      ]
    );

    if (rows.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Paciente no encontrado o no asignado a este médico",
        },
        { status: 404 }
      );
    }

    const paciente = rows[0];

    // refrescamos actividad
    await pool.query(
      `UPDATE sesiones_usuarios SET ultima_actividad = NOW() WHERE token = ?`,
      [sessionToken]
    );

    return NextResponse.json(
      {
        success: true,
        paciente: {
          id_paciente: paciente.id_paciente,
          rut: paciente.rut,
          nombre: paciente.nombre,
          apellido_paterno: paciente.apellido_paterno,
          apellido_materno: paciente.apellido_materno,
          nombre_completo: `${paciente.nombre} ${paciente.apellido_paterno} ${paciente.apellido_materno ?? ""}`.trim(),
          fecha_nacimiento: paciente.fecha_nacimiento,
          edad: paciente.edad,
          genero: paciente.genero,
          email: paciente.email,
          telefono: paciente.telefono,
          celular: paciente.celular,
          direccion: paciente.direccion,
          ciudad: paciente.ciudad,
          region: paciente.region,
          foto_url: paciente.foto_url,
          grupo_sanguineo: paciente.grupo_sanguineo,
          estado: paciente.estado,
          es_vip: Boolean(paciente.es_vip),
          fecha_registro: paciente.fecha_registro,
          ultima_consulta: paciente.ultima_consulta,
          proxima_cita: paciente.proxima_cita,
          clasificacion_riesgo: paciente.clasificacion_riesgo,
          peso_kg: paciente.peso_kg,
          altura_cm: paciente.altura_cm,
          imc: paciente.imc,
          diagnostico_principal: paciente.diagnostico_principal ?? null,
          notas_importantes: paciente.notas_administrativas ?? null,
          tags: paciente.tags
            ? typeof paciente.tags === "string"
              ? JSON.parse(paciente.tags)
              : paciente.tags
            : [],
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

// ============================
// PUT: actualizar paciente
// ============================
export async function PUT(
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

    const medico = await obtenerMedicoAutenticado(sesiones[0].id_usuario);
    if (!medico) {
      return NextResponse.json(
        { success: false, error: "No tienes un registro de médico activo" },
        { status: 403 }
      );
    }

    const idPaciente = parseInt(params.id, 10);
    if (Number.isNaN(idPaciente)) {
      return NextResponse.json(
        { success: false, error: "ID de paciente inválido" },
        { status: 400 }
      );
    }

    // verificar que el paciente esté asignado a este médico
    const [asignacion] = await pool.query<RowDataPacket[]>(
      `
      SELECT 1
      FROM pacientes_medico
      WHERE id_paciente = ?
        AND id_medico = ?
        AND activo = 1
      LIMIT 1
      `,
      [idPaciente, medico.id_medico]
    );

    if (asignacion.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Este paciente no está asignado a este médico",
        },
        { status: 403 }
      );
    }

    const body = await request.json();

    // armamos el update dinámico
    const campos: string[] = [];
    const valores: any[] = [];

    // mapeo body -> campos de tabla pacientes
    const mapeo: Record<string, string> = {
      rut: "rut",
      nombre: "nombre",
      apellido_paterno: "apellido_paterno",
      apellido_materno: "apellido_materno",
      fecha_nacimiento: "fecha_nacimiento",
      genero: "genero",
      email: "email",
      telefono: "telefono",
      celular: "celular",
      direccion: "direccion",
      ciudad: "ciudad",
      region: "region",
      grupo_sanguineo: "grupo_sanguineo",
      clasificacion_riesgo: "clasificacion_riesgo",
      peso_kg: "peso_kg",
      altura_cm: "altura_cm",
      imc: "imc",
      estado: "estado",
      foto_url: "foto_url",
      // en tu tabla este campo se llama notas_administrativas
      notas_importantes: "notas_administrativas",
    };

    for (const [campoBody, campoDB] of Object.entries(mapeo)) {
      if (body[campoBody] !== undefined) {
        // limpiar rut si viene
        if (campoBody === "rut" && typeof body[campoBody] === "string") {
          const rutLimpio = (body[campoBody] as string).replace(/[^0-9kK]/g, "");
          campos.push(`${campoDB} = ?`);
          valores.push(rutLimpio);
        } else {
          campos.push(`${campoDB} = ?`);
          valores.push(body[campoBody]);
        }
      }
    }

    // es_vip
    if (body.es_vip !== undefined) {
      campos.push("es_vip = ?");
      valores.push(body.es_vip ? 1 : 0);
    }

    // tags (json)
    if (body.tags !== undefined) {
      campos.push("tags = ?");
      valores.push(JSON.stringify(body.tags ?? []));
    }

    if (campos.length === 0) {
      return NextResponse.json(
        { success: false, error: "No hay campos para actualizar" },
        { status: 400 }
      );
    }

    const sql = `
      UPDATE pacientes
      SET ${campos.join(", ")}
      WHERE id_paciente = ?
      LIMIT 1
    `;
    valores.push(idPaciente);

    await pool.query(sql, valores);

    // refrescar sesión
    await pool.query(
      `UPDATE sesiones_usuarios SET ultima_actividad = NOW() WHERE token = ?`,
      [sessionToken]
    );

    return NextResponse.json(
      {
        success: true,
        message: "Paciente actualizado",
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("❌ Error en PUT /api/medico/pacientes/[id]:", error);
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

// ============================
// DELETE: desasignar paciente
// ============================
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

    const medico = await obtenerMedicoAutenticado(sesiones[0].id_usuario);
    if (!medico) {
      return NextResponse.json(
        { success: false, error: "No tienes un registro de médico activo" },
        { status: 403 }
      );
    }

    const idPaciente = parseInt(params.id, 10);
    if (Number.isNaN(idPaciente)) {
      return NextResponse.json(
        { success: false, error: "ID de paciente inválido" },
        { status: 400 }
      );
    }

    // desasignar del médico (deja el registro, solo lo marca inactivo)
    await pool.query(
      `
      UPDATE pacientes_medico
      SET 
        activo = 0,
        fecha_desasignacion = NOW(),
        modificado_por = ?,
        fecha_modificacion = NOW()
      WHERE id_paciente = ?
        AND id_medico = ?
        AND activo = 1
      `,
      [sesiones[0].id_usuario, idPaciente, medico.id_medico]
    );

    // refrescar sesión
    await pool.query(
      `UPDATE sesiones_usuarios SET ultima_actividad = NOW() WHERE token = ?`,
      [sessionToken]
    );

    return NextResponse.json(
      {
        success: true,
        message: "Paciente desasignado del médico",
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("❌ Error en DELETE /api/medico/pacientes/[id]:", error);
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
