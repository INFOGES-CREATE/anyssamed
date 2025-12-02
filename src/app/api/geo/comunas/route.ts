import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import type { RowDataPacket } from "mysql2";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// =========================
// Copiamos misma lógica de sesión
// =========================
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
      if (cookies[name]) return decodeURIComponent(cookies[name]);
    }
  }

  const auth = request.headers.get("authorization");
  if (auth?.startsWith("Bearer ")) return auth.slice(7);

  return null;
}

async function validarSesion(request: NextRequest): Promise<number | null> {
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

  return rows[0].id_usuario as number;
}

// Tipo de respuesta
interface ComunaResponse {
  id_comuna: string;
  nombre: string;
  activo: number;
  prioridad: number;
}

// =======================================
// DATASET GLOBAL DE COMUNAS (NO EXPIRA)
// =======================================
import comunasGlobal from "@/data/comunas_global";

// =======================================
// GET: COMUNAS / CIUDADES DE UNA REGIÓN
// =======================================
export async function GET(request: NextRequest) {
  try {
    const idUsuario = await validarSesion(request);
    if (!idUsuario) {
      return NextResponse.json(
        { success: false, error: "Sesión inválida o expirada" },
        { status: 401 }
      );
    }

    const id_pais = request.nextUrl.searchParams.get("id_pais");
    const id_region = request.nextUrl.searchParams.get("id_region");

    if (!id_pais || !id_region) {
      return NextResponse.json(
        { success: false, error: "id_pais e id_region son requeridos" },
        { status: 400 }
      );
    }

    console.log(`🌎 GET /api/geo/comunas -> comunas de ${id_pais} / ${id_region}`);

    // FILTRAMOS DEL DATASET MUNDIAL
    const comunas: ComunaResponse[] = comunasGlobal
      .filter(
        (c: any) =>
          c.country_code === id_pais.toUpperCase() &&
          c.region_code === id_region.toUpperCase()
      )
      .map((c: any) => ({
        id_comuna: c.code,
        nombre: c.name,
        activo: 1,
        prioridad: 100,
      }))
      .sort((a: ComunaResponse, b: ComunaResponse) =>
        a.nombre.localeCompare(b.nombre, "es")
      );

    console.log(`✅ Comunas encontradas: ${comunas.length}`);

    return NextResponse.json(
      { success: true, comunas, total: comunas.length },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("❌ GET /api/geo/comunas error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Error interno del servidor",
        details:
          process.env.NODE_ENV === "development"
            ? error.message
            : undefined,
      },
      { status: 500 }
    );
  }
}
