//  src/app/api/roles/route.ts
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { RowDataPacket } from "mysql2";

// =====================================================
// 🔹 Sesión
// =====================================================
function getSessionToken(req: NextRequest) {
  const cookies = req.headers.get("cookie") || "";
  for (const c of cookies.split(";")) {
    const [key, val] = c.trim().split("=");
    if (key === "session" || key === "medisalud_session") {
      return decodeURIComponent(val);
    }
  }
  return null;
}

async function validarSesion(request: NextRequest) {
  const token = getSessionToken(request);
  if (!token) return null;

  const [rows] = await pool.query<RowDataPacket[]>(
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
    [token]
  );

  if (rows.length === 0) return null;

  await pool.query(
    `UPDATE sesiones_usuarios SET ultima_actividad = NOW() WHERE token = ?`,
    [token]
  );

  return rows[0].id_usuario;
}

// =====================================================
// 🔹 GET ROLES (100% Compatible con tu FRONTEND)
// =====================================================
export async function GET(request: NextRequest) {
  try {
    const idUsuario = await validarSesion(request);
    if (!idUsuario) {
      return NextResponse.json(
        { success: false, error: "Sesión inválida o expirada" },
        { status: 401 }
      );
    }

    const [rows] = await pool.query<RowDataPacket[]>(
      `
      SELECT
        id_rol,
        nombre,
        descripcion,
        nivel_jerarquia,
        es_predefinido,
        estado,
        fecha_creacion,
        fecha_modificacion
      FROM roles
      WHERE estado = 'activo'
      ORDER BY nivel_jerarquia ASC, nombre ASC
      `
    );

    return NextResponse.json(
      {
        success: true,
        data: rows,        // 👈 NECESARIO PARA TU FRONTEND
        total: rows.length,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("❌ GET /api/roles:", error);
    return NextResponse.json(
      { success: false, error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
