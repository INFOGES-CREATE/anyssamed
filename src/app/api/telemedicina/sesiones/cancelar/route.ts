//frontend\src\app\api\telemedicina\sesiones\cancelar\route.ts
// app/api/telemedicina/sesiones/cancelar/route.ts
// Cancelar una sesión de telemedicina del médico
export const dynamic = "force-dynamic";

export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { RowDataPacket, ResultSetHeader } from "mysql2";

// ========================================
// MISMAS COOKIES
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
// TOKEN: MISMO FORMATO DEL ARCHIVO PRINCIPAL
// ========================================
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

  const authLower = request.headers.get("authorization");
  const authUpper = request.headers.get("Authorization");

  const auth = authLower || authUpper;
  if (auth?.startsWith("Bearer ")) return auth.slice(7);

  return null;
}

// ========================================
// OBTENER MEDICO AUTENTICADO
// ========================================
async function obtenerMedicoAutenticado(idUsuario: number) {
  const [rows] = await pool.query<RowDataPacket[]>(
    `
    SELECT id_medico, id_usuario, id_centro_principal
    FROM medicos
    WHERE id_usuario = ? AND estado = 'activo'
    LIMIT 1
    `,
    [idUsuario]
  );

  return rows.length ? rows[0] : null;
}

// ========================================
// DELETE /api/telemedicina/sesiones/cancelar
// ========================================

export async function DELETE(request: NextRequest) {
  try {
    const sessionToken = getSessionToken(request);
    console.log("🧩 TOKEN DETECTADO DELETE /telemedicina/sesiones/cancelar:", sessionToken);

    if (!sessionToken) {
      return NextResponse.json(
        { success: false, error: "No hay sesión activa" },
        { status: 401 }
      );
    }

    // validar sesión
    const [sesRows] = await pool.query<RowDataPacket[]>(
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

    if (sesRows.length === 0) {
      return NextResponse.json(
        { success: false, error: "Sesión inválida o expirada" },
        { status: 401 }
      );
    }

    const idUsuario = sesRows[0].id_usuario;

    // obtener médico
    const medico = await obtenerMedicoAutenticado(idUsuario);
    if (!medico) {
      return NextResponse.json(
        { success: false, error: "No tienes un registro de médico activo" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { id_sesion, motivo = "cancelada_por_medico" } = body;

    if (!id_sesion) {
      return NextResponse.json(
        { success: false, error: "ID de sesión requerido" },
        { status: 400 }
      );
    }

    // verificar que la sesión exista y sea del médico
    const [sesionRows] = await pool.query<RowDataPacket[]>(
      `
      SELECT *
      FROM telemedicina_sesiones
      WHERE id_sesion = ? AND id_medico = ?
      LIMIT 1
      `,
      [id_sesion, medico.id_medico]
    );

    if (sesionRows.length === 0) {
      return NextResponse.json(
        { success: false, error: "Sesión no encontrada" },
        { status: 404 }
      );
    }

    // marcar como cancelada
    await pool.query(
      `
      UPDATE telemedicina_sesiones
      SET estado = 'cancelada', fecha_hora_fin_real = NOW()
      WHERE id_sesion = ? AND id_medico = ?
      `,
      [id_sesion, medico.id_medico]
    );

    // guardar registro de cancelación
    await pool.query(
      `
      INSERT INTO telemedicina_cancelaciones (
        id_sesion,
        id_medico,
        motivo,
        fecha_cancelacion
      ) VALUES (?, ?, ?, NOW())
      `,
      [id_sesion, medico.id_medico, motivo]
    );

    // actualizar actividad de sesión del usuario
    await pool.query(
      `UPDATE sesiones_usuarios SET ultima_actividad = NOW() WHERE token = ?`,
      [sessionToken]
    );

    return NextResponse.json(
      {
        success: true,
        message: "Sesión cancelada correctamente",
        id_sesion,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("❌ Error en DELETE /api/telemedicina/sesiones/cancelar:", error);

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
