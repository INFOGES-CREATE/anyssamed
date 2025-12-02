// app/api/tareas/estadisticas/route.ts
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { RowDataPacket } from "mysql2";

// ============================
// TIPOS
// ============================

type PrioridadTarea = "baja" | "media" | "alta" | "critica";

type EstadoBDTarea =
  | "pendiente"
  | "en_progreso"
  | "en_revision"
  | "en_espera"
  | "rechazada"
  | "resuelta"
  | "cerrada";

interface EstadisticasRow extends RowDataPacket {
  total: number | null;
  pendientes: number | null;
  en_progreso: number | null;
  en_revision: number | null;
  completadas: number | null;
  rechazadas: number | null;
  criticas: number | null;
  vencidas: number | null;
  hoy: number | null;
}

interface EstadisticasTareas {
  total: number;
  pendientes: number;
  en_progreso: number;
  en_revision: number;
  completadas: number;
  rechazadas: number;
  criticas: number;
  vencidas: number;
  hoy: number;
}

// ============================
// SESIÓN (igual que en /tareas/asignadas)
// ============================

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

// ============================
// GET /api/tareas/estadisticas
// ============================

export async function GET(request: NextRequest) {
  try {
    const sessionToken = getSessionToken(request);

    if (!sessionToken) {
      return NextResponse.json(
        { success: false, error: "No hay sesión activa" },
        { status: 401 }
      );
    }

    // Mismo check que en /api/tareas/asignadas
    const [sesiones] = await pool.query<RowDataPacket[]>(
      `
      SELECT su.id_usuario, u.nombre, u.apellido_paterno
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

    const idUsuario = sesiones[0].id_usuario as number;

    // Actualizar última actividad
    await pool.query(
      `UPDATE sesiones_usuarios SET ultima_actividad = NOW() WHERE token = ?`,
      [sessionToken]
    );

    // (Opcional) si quieres leer rol, pero aquí NO filtramos por él:
    const url = new URL(request.url);
    const rolParam = url.searchParams.get("rol") || null;

    // ============================
    // QUERY: ESTADÍSTICAS
    // BASE: tareas + tareas_asignaciones, WHERE ta.id_usuario = ?
    // ============================

    const sql = `
      SELECT
        COUNT(*) AS total,
        SUM(t.estado = 'pendiente') AS pendientes,
        SUM(t.estado = 'en_progreso') AS en_progreso,
        SUM(t.estado = 'en_revision') AS en_revision,

        -- Completadas = resueltas o cerradas
        SUM(t.estado IN ('resuelta','cerrada')) AS completadas,

        SUM(t.estado = 'rechazada') AS rechazadas,
        SUM(t.prioridad = 'critica') AS criticas,

        -- Vencidas: fecha_limite pasada y estado no finalizado
        SUM(
          t.fecha_limite IS NOT NULL
          AND t.fecha_limite < NOW()
          AND t.estado IN ('pendiente','en_progreso','en_revision','en_espera')
        ) AS vencidas,

        -- Hoy: tareas creadas hoy
        SUM(DATE(t.fecha_creacion) = CURDATE()) AS hoy

      FROM tareas t
      LEFT JOIN tareas_asignaciones ta
        ON ta.id_tarea = t.id_tarea
      WHERE
        ta.id_usuario = ?
    `;

    const params: any[] = [idUsuario];

    const [rows] = await pool.query<EstadisticasRow[]>(sql, params);
    const row = rows[0];

    const estadisticas: EstadisticasTareas = {
      total: Number(row?.total ?? 0),
      pendientes: Number(row?.pendientes ?? 0),
      en_progreso: Number(row?.en_progreso ?? 0),
      en_revision: Number(row?.en_revision ?? 0),
      completadas: Number(row?.completadas ?? 0),
      rechazadas: Number(row?.rechazadas ?? 0),
      criticas: Number(row?.criticas ?? 0),
      vencidas: Number(row?.vencidas ?? 0),
      hoy: Number(row?.hoy ?? 0),
    };

    return NextResponse.json(
      {
        success: true,
        usuario: {
          id_usuario: idUsuario,
          nombre: sesiones[0].nombre,
          apellido_paterno: sesiones[0].apellido_paterno,
        },
        rol: rolParam,
        estadisticas,
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("❌ Error en GET /api/tareas/estadisticas:", error);

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

// Métodos no permitidos
export async function POST() {
  return NextResponse.json(
    { success: false, error: "Método no permitido" },
    { status: 405 }
  );
}
export async function PUT() {
  return NextResponse.json(
    { success: false, error: "Método no permitido" },
    { status: 405 }
  );
}
export async function DELETE() {
  return NextResponse.json(
    { success: false, error: "Método no permitido" },
    { status: 405 }
  );
}
