//frontend\src\app\api\medico\credenciales\route.ts
// frontend/src/app/api/medico/credenciales/route.ts
import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { RowDataPacket, ResultSetHeader } from "mysql2";

export const dynamic = "force-dynamic";

// mismas cookies que en los otros endpoints
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

  // actualizar última actividad
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

/**
 * GET /api/medico/credenciales
 * Lista todas las credenciales del médico autenticado
 */
export async function GET(request: NextRequest) {
  try {
    const ctx = await getContext(request);
    if (!ctx.ok) {
      return NextResponse.json({ success: false, message: ctx.message }, { status: ctx.status });
    }
    const { idMedico } = ctx;

    // credenciales básicas, ordenando primero las principales
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
      WHERE mc.id_medico = ?
      ORDER BY mc.es_principal DESC, mc.fecha_emision DESC, mc.id_credencial DESC
      `,
      [idMedico]
    );

    return NextResponse.json({ success: true, credenciales: rows }, { status: 200 });
  } catch (error: any) {
    console.error("❌ GET /api/medico/credenciales:", error);
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

/**
 * POST /api/medico/credenciales
 * Crea una credencial para el médico. Si viene es_principal = true, desmarca las demás.
 * Body esperado:
 * {
 *   "tipo": "Título profesional",
 *   "nombre": "Médico Cirujano",
 *   "numero": "ABC123",
 *   "entidad_emisora": "Universidad ...",
 *   "fecha_emision": "2022-01-01",
 *   "fecha_expiracion": null,
 *   "url_documento": "https://...",
 *   "estado": "vigente",
 *   "es_principal": true,
 *   "notas": "..."
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const ctx = await getContext(request);
    if (!ctx.ok) {
      return NextResponse.json({ success: false, message: ctx.message }, { status: ctx.status });
    }
    const { idMedico } = ctx;
    const body = await request.json().catch(() => ({}));

    const {
      tipo = null,
      nombre,
      numero = null,
      entidad_emisora = null,
      fecha_emision = null,
      fecha_expiracion = null,
      url_documento = null,
      estado = "vigente",
      es_principal = false,
      notas = null,
    } = body as {
      tipo?: string | null;
      nombre?: string;
      numero?: string | null;
      entidad_emisora?: string | null;
      fecha_emision?: string | null;
      fecha_expiracion?: string | null;
      url_documento?: string | null;
      estado?: string | null;
      es_principal?: boolean;
      notas?: string | null;
    };

    if (!nombre || typeof nombre !== "string") {
      return NextResponse.json(
        { success: false, message: "El nombre de la credencial es obligatorio." },
        { status: 400 }
      );
    }

    // insert
    const [insertRes] = await pool.query<ResultSetHeader>(
      `
      INSERT INTO medicos_credenciales (
        id_medico,
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
        fecha_creacion
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
      `,
      [
        idMedico,
        tipo,
        nombre.trim(),
        numero,
        entidad_emisora,
        fecha_emision,
        fecha_expiracion,
        url_documento,
        estado || "vigente",
        es_principal ? 1 : 0,
        notas,
      ]
    );

    const idCredencial = insertRes.insertId;

    // si la marcó como principal, desmarcamos las otras
    if (es_principal) {
      await pool.query(
        `
        UPDATE medicos_credenciales
        SET es_principal = 0
        WHERE id_medico = ? AND id_credencial <> ?
        `,
        [idMedico, idCredencial]
      );
    }

    // marcamos al médico como "requiere revisión"
    await pool.query(
      `UPDATE medicos SET requiere_revision_credenciales = 1 WHERE id_medico = ?`,
      [idMedico]
    );

    return NextResponse.json(
      {
        success: true,
        message: "Credencial registrada.",
        id_credencial: idCredencial,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("❌ POST /api/medico/credenciales:", error);
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

/**
 * DELETE /api/medico/credenciales
 * fallback para front que manda body
 * body: { id_credencial }
 */
export async function DELETE(request: NextRequest) {
  try {
    const ctx = await getContext(request);
    if (!ctx.ok) {
      return NextResponse.json({ success: false, message: ctx.message }, { status: ctx.status });
    }
    const { idMedico } = ctx;
    const body = await request.json().catch(() => ({}));
    const id_credencial = Number(body.id_credencial);

    if (!id_credencial) {
      return NextResponse.json(
        { success: false, message: "id_credencial requerido" },
        { status: 400 }
      );
    }

    // comprobar que sea suya
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT es_principal FROM medicos_credenciales WHERE id_medico = ? AND id_credencial = ?`,
      [idMedico, id_credencial]
    );

    if (rows.length === 0) {
      return NextResponse.json(
        { success: false, message: "No se encontró esta credencial en tu perfil." },
        { status: 404 }
      );
    }

    // si es principal, no dejamos borrarla directo
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
      [idMedico, id_credencial]
    );

    // avisamos que debe revisar admin
    await pool.query(
      `UPDATE medicos SET requiere_revision_credenciales = 1 WHERE id_medico = ?`,
      [idMedico]
    );

    return NextResponse.json({ success: true, message: "Credencial eliminada." }, { status: 200 });
  } catch (error: any) {
    console.error("❌ DELETE /api/medico/credenciales:", error);
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
