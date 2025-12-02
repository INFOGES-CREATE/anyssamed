// frontend/src/app/api/medico/especialidades/route.ts
import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { RowDataPacket, ResultSetHeader } from "mysql2";

export const dynamic = "force-dynamic";

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

/**
 * Trae contexto del médico autenticado.
 * Ahora también trae id_centro_principal para poder cruzar con centros_especialidades.
 */
async function getContext(request: NextRequest) {
  const sessionToken = getSessionToken(request);
  if (!sessionToken) {
    return { ok: false, status: 401, message: "No hay sesión activa" } as const;
  }

  const [sesiones] = await pool.query<RowDataPacket[]>(
    `
    SELECT su.id_usuario
    FROM sesiones_usuarios su
    INNER JOIN usuarios u ON u.id_usuario = su.id_usuario
    WHERE su.token = ?
      AND su.activa = 1
      AND (su.fecha_expiracion IS NULL OR su.fecha_expiracion > NOW())
      AND u.estado = 'activo'
    LIMIT 1
    `,
    [sessionToken]
  );

  if (sesiones.length === 0) {
    return { ok: false, status: 401, message: "Sesión inválida o expirada" } as const;
  }

  const idUsuario = sesiones[0].id_usuario as number;

  await pool.query(`UPDATE sesiones_usuarios SET ultima_actividad = NOW() WHERE token = ?`, [
    sessionToken,
  ]);

  const [medicos] = await pool.query<RowDataPacket[]>(
    `SELECT id_medico, id_centro_principal FROM medicos WHERE id_usuario = ? LIMIT 1`,
    [idUsuario]
  );
  if (medicos.length === 0) {
    return { ok: false, status: 404, message: "El usuario no tiene perfil de médico" } as const;
  }

  return {
    ok: true,
    idUsuario,
    idMedico: medicos[0].id_medico as number,
    idCentroPrincipal: medicos[0].id_centro_principal as number,
  } as const;
}

/**
 * GET /api/medico/especialidades
 * Devuelve la lista del médico + la config del centro (si existe en centros_especialidades)
 */
export async function GET(request: NextRequest) {
  try {
    const ctx = await getContext(request);
    if (!ctx.ok) {
      return NextResponse.json({ success: false, message: ctx.message }, { status: ctx.status });
    }
    const { idMedico, idCentroPrincipal } = ctx;

    // Traemos las especialidades del médico + datos del catálogo
    // y además le hacemos LEFT JOIN a la config del centro para esa especialidad
    const [rows] = await pool.query<RowDataPacket[]>(
      `
      SELECT
        me.id_medico,
        me.id_especialidad,
        me.es_principal,
        me.certificado_url,
        DATE_FORMAT(me.fecha_certificacion, '%Y-%m-%d') AS fecha_certificacion,
        me.institucion_certificadora,
        me.anos_experiencia,
        e.nombre,
        e.descripcion,
        e.area_medica,
        e.color,
        e.requiere_certificacion,
        ce.activo AS centro_activo,
        ce.visible_en_agenda AS centro_visible_en_agenda,
        ce.requiere_autorizacion AS centro_requiere_autorizacion,
        ce.duracion_estandar AS centro_duracion_estandar,
        ce.precio_base AS centro_precio_base,
        ce.cupo_diario_max AS centro_cupo_diario_max
      FROM medicos_especialidades me
      INNER JOIN especialidades e ON e.id_especialidad = me.id_especialidad
      LEFT JOIN centros_especialidades ce
        ON ce.id_centro = ? AND ce.id_especialidad = me.id_especialidad
      WHERE me.id_medico = ?
      ORDER BY me.es_principal DESC, e.nombre ASC
      `,
      [idCentroPrincipal, idMedico]
    );

    return NextResponse.json({ success: true, especialidades: rows }, { status: 200 });
  } catch (error: any) {
    console.error("❌ GET /api/medico/especialidades:", error);
    return NextResponse.json(
      { success: false, message: "Error interno del servidor", details: error.message },
      { status: 500 }
    );
  }
}

/**
 * POST /api/medico/especialidades
 * Crea (si no existe) la especialidad en catálogo y la asocia al médico.
 * Acepta más campos del front premium.
 *
 * body:
 * {
 *   nombre: string,
 *   es_principal?: boolean,
 *   // campos opcionales que pueden venir del modal
 *   area_medica?: string,
 *   descripcion?: string,
 *   requiere_certificacion?: boolean,
 *   certificado_url?: string,
 *   fecha_certificacion?: string (yyyy-mm-dd),
 *   institucion_certificadora?: string,
 *   anos_experiencia?: number
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const ctx = await getContext(request);
    if (!ctx.ok) {
      return NextResponse.json({ success: false, message: ctx.message }, { status: ctx.status });
    }
    const { idMedico } = ctx;
    const body = await request.json();

    const {
      nombre,
      es_principal = false,
      area_medica = null,
      descripcion = null,
      requiere_certificacion = true,
      certificado_url = null,
      fecha_certificacion = null,
      institucion_certificadora = null,
      anos_experiencia = null,
    } = body as {
      nombre?: string;
      es_principal?: boolean;
      area_medica?: string | null;
      descripcion?: string | null;
      requiere_certificacion?: boolean;
      certificado_url?: string | null;
      fecha_certificacion?: string | null;
      institucion_certificadora?: string | null;
      anos_experiencia?: number | null;
    };

    if (!nombre || typeof nombre !== "string") {
      return NextResponse.json(
        { success: false, message: "Nombre de especialidad requerido" },
        { status: 400 }
      );
    }

    const nombreTrim = nombre.trim();

    // 1) buscar en catálogo
    const [espRows] = await pool.query<RowDataPacket[]>(
      `SELECT id_especialidad FROM especialidades WHERE nombre = ? LIMIT 1`,
      [nombreTrim]
    );

    let idEspecialidad: number;

    if (espRows.length > 0) {
      idEspecialidad = espRows[0].id_especialidad;
    } else {
      // no existe en catálogo: la creamos mínima pero con lo que nos pasó el front
      const codigoBase = nombreTrim
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-zA-Z0-9]+/g, "_")
        .toUpperCase()
        .slice(0, 20);
      const codigoFinal = codigoBase || `ESP_${Date.now()}`;

      const [insertEsp] = await pool.query<ResultSetHeader>(
        `
        INSERT INTO especialidades (nombre, descripcion, codigo, area_medica, requiere_certificacion, activo)
        VALUES (?, ?, ?, ?, ?, 1)
        `,
        [
          nombreTrim,
          descripcion,
          codigoFinal,
          area_medica,
          requiere_certificacion ? 1 : 0,
        ]
      );
      idEspecialidad = insertEsp.insertId;
    }

    // 2) insertar / actualizar en medicos_especialidades
    await pool.query(
      `
      INSERT INTO medicos_especialidades (
        id_medico,
        id_especialidad,
        es_principal,
        certificado_url,
        fecha_certificacion,
        institucion_certificadora,
        anos_experiencia
      )
      VALUES (?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        es_principal = VALUES(es_principal),
        certificado_url = COALESCE(VALUES(certificado_url), certificado_url),
        fecha_certificacion = COALESCE(VALUES(fecha_certificacion), fecha_certificacion),
        institucion_certificadora = COALESCE(VALUES(institucion_certificadora), institucion_certificadora),
        anos_experiencia = COALESCE(VALUES(anos_experiencia), anos_experiencia)
      `,
      [
        idMedico,
        idEspecialidad,
        es_principal ? 1 : 0,
        certificado_url,
        fecha_certificacion,
        institucion_certificadora,
        typeof anos_experiencia === "number" ? anos_experiencia : null,
      ]
    );

    // 3) si es principal, desmarcar otras y reflejar en medicos
    if (es_principal) {
      await pool.query(
        `
        UPDATE medicos_especialidades
        SET es_principal = 0
        WHERE id_medico = ? AND id_especialidad <> ?
        `,
        [idMedico, idEspecialidad]
      );

      await pool.query(
        `UPDATE medicos SET especialidad_principal = ? WHERE id_medico = ?`,
        [nombreTrim, idMedico]
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Especialidad agregada.",
        id_especialidad: idEspecialidad,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("❌ POST /api/medico/especialidades:", error);
    return NextResponse.json(
      { success: false, message: "Error interno del servidor", details: error.message },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/medico/especialidades
 * Body: { id_especialidad }
 * Mantiene la lógica de no borrar la principal.
 */
export async function DELETE(request: NextRequest) {
  try {
    const ctx = await getContext(request);
    if (!ctx.ok) {
      return NextResponse.json({ success: false, message: ctx.message }, { status: ctx.status });
    }
    const { idMedico } = ctx;
    const body = await request.json().catch(() => ({}));
    const id_especialidad = Number(body.id_especialidad);

    if (!id_especialidad) {
      return NextResponse.json(
        { success: false, message: "id_especialidad requerido" },
        { status: 400 }
      );
    }

    const [row] = await pool.query<RowDataPacket[]>(
      `SELECT es_principal FROM medicos_especialidades WHERE id_medico = ? AND id_especialidad = ?`,
      [idMedico, id_especialidad]
    );
    if (row.length === 0) {
      return NextResponse.json(
        { success: false, message: "No tienes registrada esta especialidad" },
        { status: 404 }
      );
    }

    if (row[0].es_principal === 1) {
      return NextResponse.json(
        {
          success: false,
          message:
            "No puedes eliminar tu especialidad principal. Marca otra como principal primero.",
        },
        { status: 400 }
      );
    }

    await pool.query(
      `DELETE FROM medicos_especialidades WHERE id_medico = ? AND id_especialidad = ?`,
      [idMedico, id_especialidad]
    );

    return NextResponse.json({ success: true, message: "Especialidad eliminada." }, { status: 200 });
  } catch (error: any) {
    console.error("❌ DELETE /api/medico/especialidades:", error);
    return NextResponse.json(
      { success: false, message: "Error interno del servidor", details: error.message },
      { status: 500 }
    );
  }
}
