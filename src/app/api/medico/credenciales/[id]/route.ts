//frontend\src\app\api\medico\credenciales\[id]\route.ts

// frontend/src/app/api/medico/credenciales/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { RowDataPacket, ResultSetHeader } from "mysql2";

export const dynamic = "force-dynamic";

// mismas cookies que en los demás endpoints de médico
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

async function getContext(request: NextRequest) {
  const sessionToken = getSessionToken(request);
  if (!sessionToken) {
    return { ok: false, status: 401, message: "No hay sesión activa" } as const;
  }

  // validar sesión
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

  // actualizar actividad
  await pool.query(`UPDATE sesiones_usuarios SET ultima_actividad = NOW() WHERE token = ?`, [
    sessionToken,
  ]);

  // traer médico
  const [medicos] = await pool.query<RowDataPacket[]>(
    `SELECT id_medico FROM medicos WHERE id_usuario = ? LIMIT 1`,
    [idUsuario]
  );

  if (medicos.length === 0) {
    return { ok: false, status: 404, message: "El usuario no tiene perfil de médico" } as const;
  }

  return {
    ok: true,
    idUsuario,
    idMedico: medicos[0].id_medico as number,
  } as const;
}

// =====================
// GET /api/medico/credenciales/[id]
// Obtener una credencial concreta del médico
// =====================
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const ctx = await getContext(request);
    if (!ctx.ok) {
      return NextResponse.json({ success: false, message: ctx.message }, { status: ctx.status });
    }
    const { idMedico } = ctx;
    const idCredencial = Number(params.id);

    if (!idCredencial) {
      return NextResponse.json(
        { success: false, message: "ID de credencial inválido." },
        { status: 400 }
      );
    }

    const [rows] = await pool.query<RowDataPacket[]>(
      `
      SELECT
        mc.id_credencial,
        mc.id_medico,
        mc.tipo,
        mc.nombre,
        mc.numero,
        mc.entidad_emisora,
        DATE_FORMAT(mc.fecha_emision, '%Y-%m-%d') AS fecha_emision,
        DATE_FORMAT(mc.fecha_expiracion, '%Y-%m-%d') AS fecha_expiracion,
        mc.url_documento,
        mc.estado,
        mc.es_principal,
        mc.notas,
        DATE_FORMAT(mc.fecha_creacion, '%Y-%m-%d %H:%i:%s') AS fecha_creacion
      FROM medicos_credenciales mc
      WHERE mc.id_medico = ? AND mc.id_credencial = ?
      LIMIT 1
      `,
      [idMedico, idCredencial]
    );

    if (rows.length === 0) {
      return NextResponse.json(
        { success: false, message: "No se encontró esta credencial en tu perfil." },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, credencial: rows[0] }, { status: 200 });
  } catch (error: any) {
    console.error("❌ GET /api/medico/credenciales/[id]:", error);
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

// =====================
// PUT /api/medico/credenciales/[id]
// Actualiza datos de la credencial del médico
// =====================
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const ctx = await getContext(request);
    if (!ctx.ok) {
      return NextResponse.json({ success: false, message: ctx.message }, { status: ctx.status });
    }
    const { idMedico } = ctx;
    const idCredencial = Number(params.id);

    if (!idCredencial) {
      return NextResponse.json(
        { success: false, message: "ID de credencial inválido." },
        { status: 400 }
      );
    }

    // verificar que la credencial sea del médico
    const [exist] = await pool.query<RowDataPacket[]>(
      `SELECT es_principal FROM medicos_credenciales WHERE id_medico = ? AND id_credencial = ? LIMIT 1`,
      [idMedico, idCredencial]
    );
    if (exist.length === 0) {
      return NextResponse.json(
        { success: false, message: "Esta credencial no está asociada a tu perfil." },
        { status: 404 }
      );
    }

    const body = await request.json().catch(() => ({}));

    const {
      tipo,
      nombre,
      numero,
      entidad_emisora,
      fecha_emision,
      fecha_expiracion,
      url_documento,
      estado,
      es_principal,
      notas,
    } = body as {
      tipo?: string | null;
      nombre?: string | null;
      numero?: string | null;
      entidad_emisora?: string | null;
      fecha_emision?: string | null;
      fecha_expiracion?: string | null;
      url_documento?: string | null;
      estado?: string | null;
      es_principal?: boolean;
      notas?: string | null;
    };

    const fields: string[] = [];
    const paramsArr: any[] = [];

    if (tipo !== undefined) {
      fields.push("tipo = ?");
      paramsArr.push(tipo);
    }
    if (nombre !== undefined) {
      fields.push("nombre = ?");
      paramsArr.push(nombre);
    }
    if (numero !== undefined) {
      fields.push("numero = ?");
      paramsArr.push(numero);
    }
    if (entidad_emisora !== undefined) {
      fields.push("entidad_emisora = ?");
      paramsArr.push(entidad_emisora);
    }
    if (fecha_emision !== undefined) {
      fields.push("fecha_emision = ?");
      paramsArr.push(fecha_emision);
    }
    if (fecha_expiracion !== undefined) {
      fields.push("fecha_expiracion = ?");
      paramsArr.push(fecha_expiracion);
    }
    if (url_documento !== undefined) {
      fields.push("url_documento = ?");
      paramsArr.push(url_documento);
    }
    if (estado !== undefined) {
      fields.push("estado = ?");
      paramsArr.push(estado);
    }
    if (notas !== undefined) {
      fields.push("notas = ?");
      paramsArr.push(notas);
    }
    if (es_principal !== undefined) {
      fields.push("es_principal = ?");
      paramsArr.push(es_principal ? 1 : 0);
    }

    if (fields.length > 0) {
      paramsArr.push(idMedico, idCredencial);
      await pool.query(
        `
        UPDATE medicos_credenciales
        SET ${fields.join(", ")}
        WHERE id_medico = ? AND id_credencial = ?
        `,
        paramsArr
      );
    }

    // si la marcó como principal, desmarcamos las otras
    if (es_principal === true) {
      await pool.query(
        `
        UPDATE medicos_credenciales
        SET es_principal = 0
        WHERE id_medico = ? AND id_credencial <> ?
        `,
        [idMedico, idCredencial]
      );
    }

    // cada cambio en credenciales deja al médico en "requiere revisión"
    await pool.query(
      `UPDATE medicos SET requiere_revision_credenciales = 1 WHERE id_medico = ?`,
      [idMedico]
    );

    return NextResponse.json(
      { success: true, message: "Credencial actualizada correctamente." },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("❌ PUT /api/medico/credenciales/[id]:", error);
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

// =====================
// DELETE /api/medico/credenciales/[id]
// Quita la credencial del médico (no del catálogo, porque es propia)
// =====================
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
    const idCredencial = Number(params.id);

    if (!idCredencial) {
      return NextResponse.json(
        { success: false, message: "ID de credencial inválido." },
        { status: 400 }
      );
    }

    // comprobar que sea suya y si es principal
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT es_principal FROM medicos_credenciales WHERE id_medico = ? AND id_credencial = ?`,
      [idMedico, idCredencial]
    );

    if (rows.length === 0) {
      return NextResponse.json(
        { success: false, message: "No se encontró esta credencial en tu perfil." },
        { status: 404 }
      );
    }

    if (rows[0].es_principal === 1) {
      return NextResponse.json(
        {
          success: false,
          message: "No puedes eliminar tu credencial principal. Marca otra como principal primero.",
        },
        { status: 400 }
      );
    }

    await pool.query(
      `DELETE FROM medicos_credenciales WHERE id_medico = ? AND id_credencial = ?`,
      [idMedico, idCredencial]
    );

    // marcar revisión
    await pool.query(
      `UPDATE medicos SET requiere_revision_credenciales = 1 WHERE id_medico = ?`,
      [idMedico]
    );

    return NextResponse.json({ success: true, message: "Credencial eliminada." }, { status: 200 });
  } catch (error: any) {
    console.error("❌ DELETE /api/medico/credenciales/[id]:", error);
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
