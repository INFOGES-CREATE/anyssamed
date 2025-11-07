// app/api/centros/[id]/especialidades/route.ts
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

    const idCentro = parseInt(params.id, 10);
    if (Number.isNaN(idCentro)) {
      return NextResponse.json(
        { success: false, error: "ID de centro inválido" },
        { status: 400 }
      );
    }

    // actualizar última actividad
    await pool.query(
      `UPDATE sesiones_usuarios SET ultima_actividad = NOW() WHERE token = ?`,
      [sessionToken]
    );

    // ======================================================
    // 1) INTENTAR LEER DESDE centros_especialidades (premium)
    // ======================================================
    const [ceRows] = await pool.query<RowDataPacket[]>(
      `
      SELECT 
        e.id_especialidad,
        e.nombre,
        e.descripcion,
        e.codigo,
        e.area_medica,
        e.icono_url,
        e.color,
        ce.es_principal,
        ce.activo,
        ce.visible_en_agenda,
        ce.precio_base,
        ce.duracion_estandar,
        -- cuántos médicos del centro usan esta especialidad
        (
          SELECT COUNT(DISTINCT m.id_medico)
          FROM medicos m
          INNER JOIN medicos_especialidades me ON m.id_medico = me.id_medico
          WHERE m.id_centro_principal = ce.id_centro
            AND me.id_especialidad = ce.id_especialidad
            AND m.estado = 'activo'
        ) AS medicos_asignados
      FROM centros_especialidades ce
      INNER JOIN especialidades e ON ce.id_especialidad = e.id_especialidad
      WHERE ce.id_centro = ?
        AND ce.activo = 1
        AND e.activo = 1
      ORDER BY e.nombre ASC
      `,
      [idCentro]
    );

    if (ceRows.length > 0) {
      return NextResponse.json(
        {
          success: true,
          source: "centro_config",
          especialidades: ceRows,
        },
        { status: 200 }
      );
    }

    // ======================================================
    // 2) SI EL CENTRO NO TIENE CONFIGURADAS, MIRAR LOS MÉDICOS
    // ======================================================
    const [medRows] = await pool.query<RowDataPacket[]>(
      `
      SELECT 
        e.id_especialidad,
        e.nombre,
        e.descripcion,
        e.codigo,
        e.area_medica,
        e.icono_url,
        e.color,
        MAX(me.es_principal) AS es_principal,
        COUNT(DISTINCT m.id_medico) AS medicos_asignados
      FROM medicos m
      INNER JOIN medicos_especialidades me ON m.id_medico = me.id_medico
      INNER JOIN especialidades e ON me.id_especialidad = e.id_especialidad
      WHERE m.id_centro_principal = ?
        AND m.estado = 'activo'
        AND e.activo = 1
      GROUP BY 
        e.id_especialidad,
        e.nombre,
        e.descripcion,
        e.codigo,
        e.area_medica,
        e.icono_url,
        e.color
      ORDER BY e.nombre ASC
      `,
      [idCentro]
    );

    if (medRows.length > 0) {
      return NextResponse.json(
        {
          success: true,
          source: "medicos_del_centro",
          especialidades: medRows.map((r) => ({
            ...r,
            // estos campos no existen en esta ruta, los devolvemos null/por defecto
            activo: 1,
            visible_en_agenda: 1,
            precio_base: null,
            duracion_estandar: null,
          })),
        },
        { status: 200 }
      );
    }

    // ======================================================
    // 3) ÚLTIMO RECURSO: CATÁLOGO GLOBAL ACTIVO
    // ======================================================
    const [globalRows] = await pool.query<RowDataPacket[]>(
      `
      SELECT
        e.id_especialidad,
        e.nombre,
        e.descripcion,
        e.codigo,
        e.area_medica,
        e.icono_url,
        e.color,
        0 AS es_principal,
        0 AS medicos_asignados,
        1 AS activo,
        1 AS visible_en_agenda,
        NULL AS precio_base,
        NULL AS duracion_estandar
      FROM especialidades e
      WHERE e.activo = 1
      ORDER BY e.nombre ASC
      `
    );

    return NextResponse.json(
      {
        success: true,
        source: "catalogo_global",
        especialidades: globalRows,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("❌ Error en GET /api/centros/[id]/especialidades:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Error al obtener especialidades del centro",
        details:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}

export async function POST() {
  return NextResponse.json(
    { success: false, error: "Método no permitido" },
    { status: 405 }
  );
}
