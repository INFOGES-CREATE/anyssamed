// app/api/medico/pacientes/buscar/route.ts
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { RowDataPacket } from "mysql2";

// ========================================
// TIPOS
// ========================================

interface Paciente {
  id_paciente: number;
  nombre: string;
  segundo_nombre: string | null;
  apellido_paterno: string;
  apellido_materno: string | null;
  rut: string;
  fecha_nacimiento: string;
  edad: number;
  genero: string;
  telefono: string | null;
  celular: string | null;
  email: string | null;
  direccion: string | null;
  ciudad: string | null;
  region: string | null;
  grupo_sanguineo: string;
  foto_url: string | null;
  estado: string;
  es_vip: boolean;
  clasificacion_riesgo: string | null;
  alergias_criticas: number;
  enfermedades_cronicas: string | null;
  ultima_consulta: string | null;
}

// ========================================
// HELPER PARA OBTENER TOKEN
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
// FUNCIONES AUXILIARES
// ========================================

/**
 * Busca pacientes por nombre, RUT, email o teléfono
 */
async function buscarPacientes(
  termino: string,
  idMedico: number,
  limite: number = 10
): Promise<Paciente[]> {
  try {
    // Limpiar el término de búsqueda
    const terminoLimpio = termino.trim().replace(/[^\w\s@.-]/g, "");
    const searchTerm = `%${terminoLimpio}%`;

    // si más adelante quieres validar permisos, cambia este 1 por una variable
    const esBusquedaGlobal = 1;

    const [rows] = await pool.query<RowDataPacket[]>(
      `
      SELECT DISTINCT
        p.id_paciente,
        p.nombre,
        p.segundo_nombre,
        p.apellido_paterno,
        p.apellido_materno,
        p.rut,
        p.fecha_nacimiento,
        TIMESTAMPDIFF(YEAR, p.fecha_nacimiento, CURDATE()) as edad,
        p.genero,
        p.telefono,
        p.celular,
        p.email,
        p.direccion,
        p.ciudad,
        p.region,
        p.grupo_sanguineo,
        p.foto_url,
        p.estado,
        p.es_vip,
        p.clasificacion_riesgo,
        
        -- Contar alergias críticas
        (
          SELECT COUNT(*)
          FROM alergias a
          WHERE a.id_paciente = p.id_paciente
            AND a.estado = 'activa'
            AND a.severidad IN ('severa', 'fatal')
        ) as alergias_criticas,
        
        -- Enfermedades crónicas (en tu tabla es notas_administrativas)
        p.notas_administrativas as enfermedades_cronicas,
        
        -- Última consulta de ESTE médico con ese paciente
        (
          SELECT MAX(c2.fecha_hora_inicio)
          FROM citas c2
          WHERE c2.id_paciente = p.id_paciente
            AND c2.id_medico = ?
            AND c2.estado = 'completada'
        ) as ultima_consulta
        
      FROM pacientes p
      
      -- Relación directa paciente-médico
      LEFT JOIN pacientes_medico pm ON p.id_paciente = pm.id_paciente
        AND pm.id_medico = ?
        AND pm.activo = 1
      
      -- O citas con ese médico
      LEFT JOIN citas c ON p.id_paciente = c.id_paciente
        AND c.id_medico = ?
      
      WHERE p.estado IN ('activo', 'inactivo')
        AND (
          pm.id_paciente IS NOT NULL
          OR c.id_cita IS NOT NULL
          OR ? = 1  -- búsqueda global habilitada
        )
        AND (
          CONCAT(p.nombre, ' ', p.apellido_paterno, ' ', COALESCE(p.apellido_materno, '')) LIKE ?
          OR CONCAT(p.apellido_paterno, ' ', p.nombre) LIKE ?
          OR p.rut LIKE ?
          OR p.email LIKE ?
          OR p.telefono LIKE ?
          OR p.celular LIKE ?
          OR CONCAT(p.nombre, ' ', p.segundo_nombre, ' ', p.apellido_paterno, ' ', COALESCE(p.apellido_materno, '')) LIKE ?
        )
      
      ORDER BY 
        -- 1) Coincidencia exacta en RUT primero
        CASE WHEN p.rut = ? THEN 0 ELSE 1 END,
        -- 2) VIP primero
        p.es_vip DESC,
        -- 3) Pacientes con consulta reciente primero (truco sin NULLS LAST)
        (ultima_consulta IS NULL) ASC,
        ultima_consulta DESC,
        -- 4) Alfabético
        p.apellido_paterno ASC,
        p.nombre ASC
      
      LIMIT ?
      `,
      [
        // subconsulta última consulta
        idMedico,
        // join pacientes_medico
        idMedico,
        // join citas
        idMedico,
        // búsqueda global
        esBusquedaGlobal,
        // filtros LIKE
        searchTerm,
        searchTerm,
        searchTerm,
        searchTerm,
        searchTerm,
        searchTerm,
        searchTerm,
        // coincidencia exacta RUT
        terminoLimpio,
        // límite
        limite,
      ]
    );

    return rows.map((row) => ({
      id_paciente: row.id_paciente,
      nombre: row.nombre,
      segundo_nombre: row.segundo_nombre,
      apellido_paterno: row.apellido_paterno,
      apellido_materno: row.apellido_materno,
      rut: row.rut,
      fecha_nacimiento: row.fecha_nacimiento,
      edad: row.edad,
      genero: row.genero,
      telefono: row.telefono,
      celular: row.celular,
      email: row.email,
      direccion: row.direccion,
      ciudad: row.ciudad,
      region: row.region,
      grupo_sanguineo: row.grupo_sanguineo || "desconocido",
      foto_url: row.foto_url,
      estado: row.estado,
      es_vip: row.es_vip === 1, // en tu tabla es TINYINT(1)
      clasificacion_riesgo: row.clasificacion_riesgo,
      alergias_criticas: row.alergias_criticas || 0,
      enfermedades_cronicas: row.enfermedades_cronicas,
      ultima_consulta: row.ultima_consulta,
    }));
  } catch (error) {
    console.error("Error al buscar pacientes:", error);
    throw error;
  }
}

/**
 * Obtiene la información del médico autenticado
 */
async function obtenerMedicoAutenticado(idUsuario: number): Promise<number | null> {
  try {
    const [rows] = await pool.query<RowDataPacket[]>(
      `
      SELECT id_medico
      FROM medicos
      WHERE id_usuario = ? AND estado = 'activo'
      LIMIT 1
      `,
      [idUsuario]
    );

    if (rows.length === 0) {
      return null;
    }

    return rows[0].id_medico;
  } catch (error) {
    console.error("Error al obtener médico:", error);
    throw error;
  }
}

// ========================================
// HANDLER GET - Buscar pacientes
// ========================================

export async function GET(request: NextRequest) {
  try {
    // 1. Obtener token
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

    // 2. Verificar sesión
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
        {
          success: false,
          error: "Sesión inválida o expirada",
        },
        { status: 401 }
      );
    }

    const idUsuario = sesiones[0].id_usuario;

    // 3. Verificar que sea médico
    const idMedico = await obtenerMedicoAutenticado(idUsuario);

    if (!idMedico) {
      return NextResponse.json(
        {
          success: false,
          error: "No tienes un registro de médico activo",
        },
        { status: 403 }
      );
    }

    // 4. Obtener parámetros de búsqueda
    const searchParams = request.nextUrl.searchParams;
    const termino = searchParams.get("termino") || "";
    const limite = parseInt(searchParams.get("limite") || "10", 10);

    // 5. Validar término de búsqueda
    if (termino.length < 3) {
      return NextResponse.json(
        {
          success: false,
          error: "El término de búsqueda debe tener al menos 3 caracteres",
        },
        { status: 400 }
      );
    }

    // 6. Actualizar última actividad
    await pool.query(
      `UPDATE sesiones_usuarios SET ultima_actividad = NOW() WHERE token = ?`,
      [sessionToken]
    );

    // 7. Buscar pacientes
    const pacientes = await buscarPacientes(termino, idMedico, limite);

    // 8. Respuesta exitosa
    return NextResponse.json(
      {
        success: true,
        pacientes,
        total: pacientes.length,
        termino_busqueda: termino,
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("❌ Error en GET /api/medico/pacientes/buscar:", error);

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
