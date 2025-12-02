// src/app/api/mensajes/usuarios-disponibles/route.ts
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { RowDataPacket } from "mysql2";

// ========================================
// TIPOS
// ========================================

interface UsuarioDisponible {
  id_usuario: number;
  nombre: string;
  apellido_paterno: string;
  apellido_materno: string | null;
  foto_perfil_url: string | null;
  rol: {
    nombre: string;
    nivel_jerarquia: number;
  };
  estado_online: boolean;
  ultima_conexion: string | null;
  profesional: {
    especialidad: string;
    tipo_profesional: string;
  } | null;
}

interface UsuarioSesion {
  id_usuario: number;
  centro_id: number | null;
  sucursal_id: number | null;
}

// ========================================
// COOKIES DE SESIÓN POSIBLES
// ========================================

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

// ========================================
// OBTENER USUARIO AUTENTICADO DESDE SESIÓN
// ========================================

async function obtenerUsuarioAutenticado(
  token: string
): Promise<UsuarioSesion | null> {
  try {
    const [sesiones] = await pool.query<RowDataPacket[]>(
      `
      SELECT 
        su.id_usuario,
        su.centro_id,
        su.sucursal_id
      FROM sesiones_usuarios su
      INNER JOIN usuarios u ON su.id_usuario = u.id_usuario
      WHERE su.token = ?
        AND su.activa = 1
        AND (su.fecha_expiracion IS NULL OR su.fecha_expiracion > NOW())
        AND u.estado = 'activo'
      ORDER BY su.ultima_actividad DESC
      LIMIT 1
      `,
      [token]
    );

    if (sesiones.length === 0) {
      return null;
    }

    const row = sesiones[0];

    return {
      id_usuario: row.id_usuario,
      centro_id: row.centro_id ?? null,
      sucursal_id: row.sucursal_id ?? null,
    };
  } catch (error) {
    console.error("Error al obtener usuario autenticado:", error);
    throw error;
  }
}

// ========================================
// RESOLVER CENTRO / SUCURSAL EFECTIVOS
// (Profesional, Administrativo, Secretaria, Técnico, Usuario)
// ========================================

async function obtenerCentroYSucursalEfectivos(
  idUsuario: number,
  centroSesion: number | null,
  sucursalSesion: number | null
): Promise<{ idCentro: number | null; idSucursal: number | null }> {
  // 1) Si la sesión ya trae centro/sucursal, respetar eso
  if (centroSesion) {
    return {
      idCentro: centroSesion,
      idSucursal: sucursalSesion ?? null,
    };
  }

  // 2) Resolver según rol / tablas específicas + fallback a usuarios.*
  const [rows] = await pool.query<RowDataPacket[]>(
    `
    SELECT
      COALESCE(
        -- Profesional de salud
        (SELECT ps.id_centro_principal 
         FROM profesionales_salud ps 
         WHERE ps.id_usuario = u.id_usuario 
         LIMIT 1),
        -- Administrativo
        (SELECT a.id_centro 
         FROM administrativos a 
         WHERE a.id_usuario = u.id_usuario 
           AND a.estado = 'activo'
         LIMIT 1),
        -- Secretaria
        (SELECT s.id_centro 
         FROM secretarias s 
         WHERE s.id_usuario = u.id_usuario 
           AND s.estado = 'activo'
         LIMIT 1),
        -- Técnico (asociado a un centro)
        (SELECT t.id_centro 
         FROM tecnicos t 
         WHERE t.id_usuario = u.id_usuario 
           AND t.estado = 'activo'
           AND t.es_global = 0
         LIMIT 1),
        -- Fallback: centro principal del usuario
        u.id_centro_principal
      ) AS id_centro,
      COALESCE(
        (SELECT ps.id_sucursal 
         FROM profesionales_salud ps 
         WHERE ps.id_usuario = u.id_usuario 
         LIMIT 1),
        (SELECT a.id_sucursal 
         FROM administrativos a 
         WHERE a.id_usuario = u.id_usuario 
           AND a.estado = 'activo'
         LIMIT 1),
        (SELECT s.id_sucursal 
         FROM secretarias s 
         WHERE s.id_usuario = u.id_usuario 
           AND s.estado = 'activo'
         LIMIT 1),
        (SELECT t.id_sucursal 
         FROM tecnicos t 
         WHERE t.id_usuario = u.id_usuario 
           AND t.estado = 'activo'
           AND t.es_global = 0
         LIMIT 1),
        u.id_sucursal_principal
      ) AS id_sucursal
    FROM usuarios u
    WHERE u.id_usuario = ?
    LIMIT 1
    `,
    [idUsuario]
  );

  if (rows.length === 0) {
    return { idCentro: null, idSucursal: null };
  }

  return {
    idCentro: rows[0].id_centro ?? null,
    idSucursal: rows[0].id_sucursal ?? null,
  };
}

// ========================================
// OBTENER USUARIOS DISPONIBLES PARA CHAT
// (TODOS los usuarios activos del MISMO centro)
// ========================================

async function obtenerUsuariosDisponibles(
  sesion: UsuarioSesion
): Promise<UsuarioDisponible[]> {
  try {
    const { id_usuario, centro_id, sucursal_id } = sesion;

    // 1) Resolver centro/sucursal efectivos
    const { idCentro } = await obtenerCentroYSucursalEfectivos(
      id_usuario,
      centro_id,
      sucursal_id
    );

    // Si no se pudo inferir el centro, no devolvemos usuarios
    if (!idCentro) {
      return [];
    }

    // 2) Usuarios candidatos = TODOS los usuarios activos del MISMO centro,
    //    sin importar rol ni si están logueados:
    //
    //    - Profesionales de salud (id_centro_principal)
    //    - Administrativos (id_centro)
    //    - Secretarias (id_centro)
    //    - Técnicos (id_centro)
    //    - Usuarios base cuyo id_centro_principal = idCentro
    //
    const [rows] = await pool.query<RowDataPacket[]>(
      `
      SELECT
        u.id_usuario,
        u.nombre,
        u.apellido_paterno,
        u.apellido_materno,
        u.foto_perfil_url,
        COALESCE(MIN(r.nombre), 'Usuario') AS rol_nombre,
        COALESCE(MIN(r.nivel_jerarquia), 999) AS nivel_jerarquia,
        CASE 
          WHEN MAX(su.ultima_actividad) IS NOT NULL 
               AND MAX(su.ultima_actividad) >= DATE_SUB(NOW(), INTERVAL 5 MINUTE)
          THEN 1
          ELSE 0
        END AS estado_online,
        MAX(su.ultima_actividad) AS ultima_conexion,
        ps.especialidad_principal,
        ps.tipo_profesional
      FROM (
        SELECT DISTINCT id_usuario
        FROM (
          -- Profesionales de salud del centro
          SELECT ps.id_usuario
          FROM profesionales_salud ps
          WHERE ps.estado = 'activo'
            AND ps.id_centro_principal = ?

          UNION

          -- Administrativos del centro
          SELECT a.id_usuario
          FROM administrativos a
          WHERE a.estado = 'activo'
            AND a.id_centro = ?

          UNION

          -- Secretarias del centro
          SELECT s.id_usuario
          FROM secretarias s
          WHERE s.estado = 'activo'
            AND s.id_centro = ?

          UNION

          -- Técnicos del centro (solo mismo centro)
          SELECT t.id_usuario
          FROM tecnicos t
          WHERE t.estado = 'activo'
            AND t.id_centro = ?

          UNION

          -- Usuarios base cuyo centro_principal es el mismo centro
          SELECT u2.id_usuario
          FROM usuarios u2
          WHERE u2.estado = 'activo'
            AND u2.id_centro_principal = ?
        ) candidatos
      ) c
      INNER JOIN usuarios u 
        ON u.id_usuario = c.id_usuario
       AND u.estado = 'activo'
       AND u.id_usuario <> ?
      LEFT JOIN usuarios_roles ur 
        ON ur.id_usuario = u.id_usuario
      LEFT JOIN roles r 
        ON r.id_rol = ur.id_rol
       AND r.estado = 'activo'
      LEFT JOIN sesiones_usuarios su 
        ON su.id_usuario = u.id_usuario
       AND su.activa = 1
       AND (su.fecha_expiracion IS NULL OR su.fecha_expiracion > NOW())
      LEFT JOIN profesionales_salud ps 
        ON ps.id_usuario = u.id_usuario
       AND ps.estado = 'activo'
      GROUP BY
        u.id_usuario,
        u.nombre,
        u.apellido_paterno,
        u.apellido_materno,
        u.foto_perfil_url,
        ps.especialidad_principal,
        ps.tipo_profesional
      ORDER BY
        estado_online DESC,
        nivel_jerarquia ASC,
        u.nombre ASC
      LIMIT 200
      `,
      [idCentro, idCentro, idCentro, idCentro, idCentro, id_usuario]
    );

    return rows.map((row) => ({
      id_usuario: row.id_usuario,
      nombre: row.nombre,
      apellido_paterno: row.apellido_paterno,
      apellido_materno: row.apellido_materno,
      foto_perfil_url: row.foto_perfil_url,
      rol: {
        nombre: row.rol_nombre,
        nivel_jerarquia: Number(row.nivel_jerarquia ?? 999),
      },
      estado_online: row.estado_online === 1,
      ultima_conexion: row.ultima_conexion,
      profesional: row.especialidad_principal
        ? {
            especialidad: row.especialidad_principal,
            tipo_profesional: row.tipo_profesional,
          }
        : null,
    }));
  } catch (error) {
    console.error("Error al obtener usuarios disponibles:", error);
    throw error;
  }
}

// ========================================
// HANDLER GET
// ========================================

export async function GET(request: NextRequest) {
  try {
    // 1. Obtener token desde cookie o Authorization
    const sessionToken = getSessionToken(request);

    if (!sessionToken) {
      return NextResponse.json(
        {
          success: false,
          error: "No hay sesión activa",
        },
        { status: 401 }
      );
    }

    // 2. Verificar sesión y usuario
    const sesion = await obtenerUsuarioAutenticado(sessionToken);

    if (!sesion) {
      return NextResponse.json(
        {
          success: false,
          error: "Sesión inválida o expirada",
        },
        { status: 401 }
      );
    }

    // 3. Obtener usuarios disponibles para chat
    const usuarios = await obtenerUsuariosDisponibles(sesion);

    // 4. Respuesta
    return NextResponse.json(
      {
        success: true,
        data: usuarios,
        total: usuarios.length,
        online: usuarios.filter((u) => u.estado_online).length,
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("❌ Error en GET /api/mensajes/usuarios-disponibles:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Error interno del servidor",
        details: process.env.NODE_ENV === "development" ? error.message : undefined,
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
