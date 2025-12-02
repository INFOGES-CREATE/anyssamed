// frontend/src/app/api/medico/especialidades/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { RowDataPacket, ResultSetHeader } from "mysql2";

export const dynamic = "force-dynamic";

// mismas cookies que el resto
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
 * Trae usuario → médico → centro principal
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

// ======================================================
// GET /api/medico/especialidades/[id]
// ahora también trae la config del centro (centros_especialidades)
// ======================================================
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const ctx = await getContext(request);
    if (!ctx.ok) {
      return NextResponse.json({ success: false, message: ctx.message }, { status: ctx.status });
    }
    const { idMedico, idCentroPrincipal } = ctx;
    const idEspecialidad = Number(params.id);

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
        e.area_medica,
        e.color,
        e.descripcion,
        e.requiere_certificacion,
        ce.activo AS centro_activo,
        ce.visible_en_agenda AS centro_visible_en_agenda,
        ce.requiere_autorizacion AS centro_requiere_autorizacion,
        ce.duracion_estandar AS centro_duracion_estandar,
        ce.precio_base AS centro_precio_base,
        ce.cupo_diario_max AS centro_cupo_diario_max
      FROM medicos_especialidades me
      INNER JOIN especialidades e
        ON e.id_especialidad = me.id_especialidad
      LEFT JOIN centros_especialidades ce
        ON ce.id_centro = ? AND ce.id_especialidad = me.id_especialidad
      WHERE me.id_medico = ? AND me.id_especialidad = ?
      LIMIT 1
      `,
      [idCentroPrincipal, idMedico, idEspecialidad]
    );

    if (rows.length === 0) {
      return NextResponse.json(
        { success: false, message: "No tienes registrada esta especialidad" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, especialidad: rows[0] }, { status: 200 });
  } catch (error: any) {
    console.error("❌ GET /api/medico/especialidades/[id]", error);
    return NextResponse.json(
      { success: false, message: "Error interno del servidor", details: error.message },
      { status: 500 }
    );
  }
}

// ======================================================
// PUT /api/medico/especialidades/[id]
// ahora también puede upsert en centros_especialidades
// ======================================================
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const ctx = await getContext(request);
    if (!ctx.ok) {
      return NextResponse.json({ success: false, message: ctx.message }, { status: ctx.status });
    }
    const { idMedico, idCentroPrincipal } = ctx;
    const idEspecialidad = Number(params.id);

    const body = await request.json();

    const {
      // relación médico-especialidad
      certificado_url,
      fecha_certificacion,
      institucion_certificadora,
      anos_experiencia,
      es_principal,

      // catálogo
      nombre,
      area_medica,
      color,
      descripcion,
      requiere_certificacion,

      // config del centro (vienen del modal premium)
      centro_activo,
      centro_visible_en_agenda,
      centro_requiere_autorizacion,
      centro_duracion_estandar,
      centro_precio_base,
      centro_cupo_diario_max,
    } = body;

    // 0) comprobar que el médico la tenga
    const [meRows] = await pool.query<RowDataPacket[]>(
      `SELECT es_principal FROM medicos_especialidades WHERE id_medico = ? AND id_especialidad = ? LIMIT 1`,
      [idMedico, idEspecialidad]
    );
    if (meRows.length === 0) {
      return NextResponse.json(
        { success: false, message: "Esta especialidad no está asociada a tu perfil." },
        { status: 404 }
      );
    }

    // 1) actualizar relación médico ↔ especialidad
    const relFields: string[] = [];
    const relParams: any[] = [];

    if (certificado_url !== undefined) {
      relFields.push("certificado_url = ?");
      relParams.push(certificado_url);
    }
    if (fecha_certificacion !== undefined) {
      relFields.push("fecha_certificacion = ?");
      relParams.push(fecha_certificacion);
    }
    if (institucion_certificadora !== undefined) {
      relFields.push("institucion_certificadora = ?");
      relParams.push(institucion_certificadora);
    }
    if (anos_experiencia !== undefined) {
      relFields.push("anos_experiencia = ?");
      relParams.push(anos_experiencia);
    }

    if (relFields.length > 0) {
      relParams.push(idMedico, idEspecialidad);
      await pool.query(
        `
        UPDATE medicos_especialidades
        SET ${relFields.join(", ")}
        WHERE id_medico = ? AND id_especialidad = ?
        `,
        relParams
      );
    }

    // 2) actualizar catálogo si mandaron algo
    const catFields: string[] = [];
    const catParams: any[] = [];

    if (nombre !== undefined) {
      catFields.push("nombre = ?");
      catParams.push(nombre);
    }
    if (area_medica !== undefined) {
      catFields.push("area_medica = ?");
      catParams.push(area_medica);
    }
    if (color !== undefined) {
      catFields.push("color = ?");
      catParams.push(color);
    }
    if (descripcion !== undefined) {
      catFields.push("descripcion = ?");
      catParams.push(descripcion);
    }
    if (requiere_certificacion !== undefined) {
      catFields.push("requiere_certificacion = ?");
      catParams.push(requiere_certificacion ? 1 : 0);
    }

    if (catFields.length > 0) {
      catParams.push(idEspecialidad);
      await pool.query(
        `
        UPDATE especialidades
        SET ${catFields.join(", ")}
        WHERE id_especialidad = ?
        `,
        catParams
      );
    }

    // 3) marcar como principal si viene así
    if (es_principal === true) {
      await pool.query(
        `
        UPDATE medicos_especialidades
        SET es_principal = 1
        WHERE id_medico = ? AND id_especialidad = ?
        `,
        [idMedico, idEspecialidad]
      );

      await pool.query(
        `
        UPDATE medicos_especialidades
        SET es_principal = 0
        WHERE id_medico = ? AND id_especialidad <> ?
        `,
        [idMedico, idEspecialidad]
      );

      // reflejar nombre final
      let nombreFinal = nombre;
      if (!nombreFinal) {
        const [nameRows] = await pool.query<RowDataPacket[]>(
          `SELECT nombre FROM especialidades WHERE id_especialidad = ? LIMIT 1`,
          [idEspecialidad]
        );
        nombreFinal = nameRows.length ? (nameRows[0].nombre as string) : null;
      }
      if (nombreFinal) {
        await pool.query(
          `UPDATE medicos SET especialidad_principal = ? WHERE id_medico = ?`,
          [nombreFinal, idMedico]
        );
      }
    }

    // 4) OPCIONAL: actualizar / insertar configuración del centro para esta especialidad
    // Solo lo hacemos si vino al menos 1 campo de centro_...
    const hayCentroData =
      centro_activo !== undefined ||
      centro_visible_en_agenda !== undefined ||
      centro_requiere_autorizacion !== undefined ||
      centro_duracion_estandar !== undefined ||
      centro_precio_base !== undefined ||
      centro_cupo_diario_max !== undefined;

    if (hayCentroData) {
      // upsert
      await pool.query(
        `
        INSERT INTO centros_especialidades (
          id_centro,
          id_especialidad,
          activo,
          visible_en_agenda,
          requiere_autorizacion,
          duracion_estandar,
          precio_base,
          cupo_diario_max
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          activo = VALUES(activo),
          visible_en_agenda = VALUES(visible_en_agenda),
          requiere_autorizacion = VALUES(requiere_autorizacion),
          duracion_estandar = VALUES(duracion_estandar),
          precio_base = VALUES(precio_base),
          cupo_diario_max = VALUES(cupo_diario_max)
        `,
        [
          idCentroPrincipal,
          idEspecialidad,
          centro_activo !== undefined ? (centro_activo ? 1 : 0) : 1,
          centro_visible_en_agenda !== undefined ? (centro_visible_en_agenda ? 1 : 0) : 1,
          centro_requiere_autorizacion !== undefined ? (centro_requiere_autorizacion ? 1 : 0) : 0,
          centro_duracion_estandar !== undefined ? centro_duracion_estandar : null,
          centro_precio_base !== undefined ? centro_precio_base : null,
          centro_cupo_diario_max !== undefined ? centro_cupo_diario_max : null,
        ]
      );
    }

    return NextResponse.json(
      { success: true, message: "Especialidad actualizada correctamente." },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("❌ PUT /api/medico/especialidades/[id]", error);
    return NextResponse.json(
      {
        success: false,
        message: "Error interno del servidor",
        details: process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}

// ======================================================
// DELETE /api/medico/especialidades/[id]
// ======================================================
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const ctx = await getContext(request);
    if (!ctx.ok) {
      return NextResponse.json({ success: false, message: ctx.message }, { status: ctx.status });
    }
    const { idMedico } = ctx;
    const idEspecialidad = Number(params.id);

    const [meRows] = await pool.query<RowDataPacket[]>(
      `SELECT es_principal FROM medicos_especialidades WHERE id_medico = ? AND id_especialidad = ?`,
      [idMedico, idEspecialidad]
    );

    if (meRows.length === 0) {
      return NextResponse.json(
        { success: false, message: "No tienes registrada esta especialidad" },
        { status: 404 }
      );
    }

    if (meRows[0].es_principal === 1) {
      return NextResponse.json(
        {
          success: false,
          message: "No puedes eliminar tu especialidad principal. Marca otra como principal primero.",
        },
        { status: 400 }
      );
    }

    await pool.query(
      `DELETE FROM medicos_especialidades WHERE id_medico = ? AND id_especialidad = ?`,
      [idMedico, idEspecialidad]
    );

    return NextResponse.json({ success: true, message: "Especialidad eliminada." }, { status: 200 });
  } catch (error: any) {
    console.error("❌ DELETE /api/medico/especialidades/[id]", error);
    return NextResponse.json(
      { success: false, message: "Error interno del servidor", details: error.message },
      { status: 500 }
    );
  }
}
