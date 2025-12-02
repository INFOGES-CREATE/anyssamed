// src/app/api/tareas/opciones/route.ts
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { RowDataPacket } from "mysql2";

// ========================================
// TIPOS
// ========================================

interface CentroResumen {
  id_centro: number;
  nombre: string;
}

interface SucursalResumen {
  id_sucursal: number;
  id_centro: number;
  nombre: string;
}

interface CategoriaTarea {
  id_categoria: number;
  nombre: string;
  color: string;
  icono: string | null;
  activo: boolean;
}

interface UsuarioAsignable {
  id_usuario: number;
  nombre_completo: string;
  rol: string;
  centro?: CentroResumen | null;
  sucursal?: SucursalResumen | null;
}

// ========================================
// SESIÓN
// ========================================

const SESSION_COOKIE_CANDIDATES = [
  "session",
  "session_token",
  "medisalud_session",
  "auth_session",
  "next-auth.session-token",
  "__Secure-next-auth.session-token",
];

/**
 * Extrae el token de sesión desde cookies o header Authorization
 */
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

// ========================================
// GET /api/tareas/opciones
// Devuelve centros, sucursales, categorías, posibles responsables y tags sugeridos
// ========================================

export async function GET(request: NextRequest) {
  try {
    const sessionToken = getSessionToken(request);

    if (!sessionToken) {
      return NextResponse.json(
        { success: false, error: "No hay sesión activa" },
        { status: 401 }
      );
    }

    // Validar sesión igual que en /api/tareas/asignadas
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
    const nombreUsuario = sesiones[0].nombre as string;
    const apellidoPaterno = sesiones[0].apellido_paterno as string;

    const url = new URL(request.url);
    const rolParam = url.searchParams.get("rol") || null;
    // const usuarioParam = url.searchParams.get("usuario"); // si lo quisieras usar

    // ========================================
    // 1) CENTROS
    // ========================================

    const [rowsCentros] = await pool.query<RowDataPacket[]>(
      `
      SELECT id_centro, nombre
      FROM centros_medicos
      ORDER BY nombre ASC
      `
    );

    const centros: CentroResumen[] = rowsCentros.map((row) => ({
      id_centro: Number(row.id_centro),
      nombre: String(row.nombre),
    }));

    // ========================================
    // 2) SUCURSALES
    // ========================================

    const [rowsSucursales] = await pool.query<RowDataPacket[]>(
      `
      SELECT id_sucursal, id_centro, nombre
      FROM sucursales
      ORDER BY nombre ASC
      `
    );

    const sucursales: SucursalResumen[] = rowsSucursales.map((row) => ({
      id_sucursal: Number(row.id_sucursal),
      id_centro: Number(row.id_centro),
      nombre: String(row.nombre),
    }));

    // ========================================
    // 3) CATEGORÍAS DE TAREAS (tareas_categorias)
    // ========================================

    const [rowsCategorias] = await pool.query<RowDataPacket[]>(
      `
      SELECT id_categoria, nombre, color, icono, activo
      FROM tareas_categorias
      WHERE activo = 1
      ORDER BY nombre ASC
      `
    );

    const categorias: CategoriaTarea[] = rowsCategorias.map((row) => ({
      id_categoria: Number(row.id_categoria),
      nombre: String(row.nombre),
      color: row.color ? String(row.color) : "#3498db",
      icono: row.icono ? String(row.icono) : null,
      activo: Boolean(row.activo),
    }));

    // ========================================
    // 4) POSIBLES RESPONSABLES
    //    (de momento: todos los usuarios activos; puedes luego filtrar por rol/centro)
    // ========================================

    const [rowsResponsables] = await pool.query<RowDataPacket[]>(
      `
      SELECT
        u.id_usuario,
        u.nombre,
        u.apellido_paterno,
        u.apellido_materno
      FROM usuarios u
      WHERE u.estado = 'activo'
      ORDER BY u.nombre, u.apellido_paterno
      `
    );

    const posibles_responsables: UsuarioAsignable[] = rowsResponsables.map(
      (row) => {
        const nombre = String(row.nombre || "");
        const apePat = String(row.apellido_paterno || "");
        const apeMat = row.apellido_materno
          ? ` ${String(row.apellido_materno)}`
          : "";

        return {
          id_usuario: Number(row.id_usuario),
          nombre_completo: `${nombre} ${apePat}${apeMat}`.trim(),
          // Aquí podrías mapear a "Secretaria", "Técnico", etc. según tu tabla de roles.
          // Para evitar errores de columnas desconocidas, dejamos un rol genérico.
          rol: "Usuario",
          centro: null,
          sucursal: null,
        };
      }
    );

    // ========================================
    // 5) TAGS SUGERIDOS (DESDE JSON EN t.tags)
    //    SIN JSON_TABLE, COMPATIBLE CON MARIADB
    // ========================================

    let tags_sugeridos: string[] = [];

    try {
      const [rowsTags] = await pool.query<RowDataPacket[]>(
        `
        SELECT tags
        FROM tareas
        WHERE tags IS NOT NULL AND tags <> ''
        LIMIT 500
        `
      );

      const frecuencia: Record<string, number> = {};

      for (const row of rowsTags) {
        const raw = row.tags as any;
        if (!raw) continue;

        let arr: any[] = [];

        try {
          // En MariaDB JSON es un alias de LONGTEXT, así que normalmente llega como string
          if (typeof raw === "string") {
            arr = JSON.parse(raw);
          } else {
            arr = raw;
          }
        } catch {
          // Si una fila tiene un JSON mal formado, la ignoramos
          continue;
        }

        if (!Array.isArray(arr)) continue;

        for (const tag of arr) {
          if (!tag || typeof tag !== "string") continue;
          const limpio = tag.trim().toLowerCase();
          if (!limpio) continue;

          frecuencia[limpio] = (frecuencia[limpio] || 0) + 1;
        }
      }

      tags_sugeridos = Object.entries(frecuencia)
        .sort((a, b) => b[1] - a[1]) // más utilizados primero
        .slice(0, 20)
        .map(([tag]) => tag);
    } catch (error) {
      console.error("Error calculando tags_sugeridos:", error);
      tags_sugeridos = [];
    }

    // ========================================
    // RESPUESTA
    // ========================================

    return NextResponse.json(
      {
        success: true,
        usuario: {
          id_usuario: idUsuario,
          nombre: nombreUsuario,
          apellido_paterno: apellidoPaterno,
        },
        rol_param: rolParam,
        centros,
        sucursales,
        categorias,
        posibles_responsables,
        tags_sugeridos,
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("❌ Error en GET /api/tareas/opciones:", error);

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

// ========================================
// MÉTODOS NO PERMITIDOS
// ========================================

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
