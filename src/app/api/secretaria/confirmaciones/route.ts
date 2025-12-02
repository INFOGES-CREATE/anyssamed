// app/api/secretaria/confirmaciones/route.ts
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { RowDataPacket } from "mysql2";

// ========================================
// TIPOS
// ========================================

interface SecretariaData {
  id_secretaria: number;
  id_usuario: number;
  id_centro: number;
  id_sucursal: number | null;
  id_departamento: number | null;
  jornada: "completa" | "media" | "parcial";
  extension_telefonica: string | null;
  estado: "activo" | "inactivo" | "suspendido" | "vacaciones";
}

interface CentroMedicoInfo {
  id_centro: number;
  nombre: string;
  ciudad: string;
  region: string | null;
  telefono: string | null;
  email: string | null;
  logo_url: string | null;
  plan: string; // en tu tabla: 'basico' | 'profesional' | 'enterprise'
}

type CanalConfirmacion =
  | "email"
  | "sms"
  | "whatsapp"
  | "llamada"
  | "presencial"
  | "app_movil";

type EstadoConfirmacionApi =
  | "confirmada"
  | "pendiente"
  | "sin_registro"
  | "cancelada";

interface ResumenConfirmaciones {
  total_citas_rango: number;
  total_con_intentos: number;
  total_confirmadas: number;
  total_pendientes: number;
  total_canceladas: number;
  total_sin_contactar: number;
  tasa_confirmacion: number;
  por_canal: {
    email: number;
    sms: number;
    whatsapp: number;
    llamada: number;
    presencial: number;
    app_movil: number;
  };
}

interface ConfirmacionItem {
  id_cita: number;
  id_confirmacion: number | null;

  fecha_cita: string; // ISO
  fecha_fin: string | null;
  estado_cita: string;
  estado_confirmacion: EstadoConfirmacionApi;

  tipo_cita: string;
  origen: string;
  prioridad: string;

  canal_ultimo_intento: CanalConfirmacion | null;
  fecha_envio_solicitud: string | null;
  fecha_confirmacion: string | null;
  confirmado: boolean;
  confirmado_por_paciente: boolean;

  paciente: {
    id_paciente: number;
    nombre_completo: string;
    edad: number | null;
    foto_url: string | null;
    telefono: string | null;
    email: string | null;
  };

  profesional: {
    id_profesional: number | null;
    nombre_completo: string | null;
    especialidad_principal: string | null;
  };

  sucursal: {
    id_sucursal: number | null;
    nombre: string | null;
  };

  tiene_recordatorios: boolean;
  ultima_fecha_recordatorio: string | null;
}

interface ListadoConfirmacionesResponse {
  items: ConfirmacionItem[];
  total: number;
  pagina: number;
  por_pagina: number;
  total_paginas: number;
}

// ========================================
// CONSTANTES
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
// FUNCIONES AUXILIARES GENERALES
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

function toSqlDate(date: Date): string {
  return date.toISOString().split("T")[0]!;
}

function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

// ========================================
// FUNCIONES AUXILIARES DE DOMINIO
// ========================================

async function obtenerSecretariaAutenticada(
  idUsuario: number
): Promise<SecretariaData | null> {
  try {
    const [rows] = await pool.query<RowDataPacket[]>(
      `
      SELECT 
        s.id_secretaria,
        s.id_usuario,
        s.id_centro,
        s.id_sucursal,
        s.id_departamento,
        s.jornada,
        s.extension_telefonica,
        s.estado
      FROM secretarias s
      WHERE s.id_usuario = ?
        AND s.estado IN ('activo', 'suspendido')
      LIMIT 1
      `,
      [idUsuario]
    );

    return rows.length > 0 ? (rows[0] as SecretariaData) : null;
  } catch (error) {
    console.error("Error al obtener secretaria:", error);
    throw error;
  }
}

async function obtenerCentroMedico(
  idCentro: number
): Promise<CentroMedicoInfo | null> {
  try {
    const [rows] = await pool.query<RowDataPacket[]>(
      `
      SELECT 
        cm.id_centro,
        cm.nombre,
        cm.ciudad,
        cm.region,
        cm.telefono,
        cm.email_contacto AS email,
        cm.logo_url,
        cm.plan
      FROM centros_medicos cm
      WHERE cm.id_centro = ?
        AND cm.estado = 'activo'
      LIMIT 1
      `,
      [idCentro]
    );

    if (rows.length === 0) return null;

    const row = rows[0];
    return {
      id_centro: row.id_centro,
      nombre: row.nombre,
      ciudad: row.ciudad,
      region: row.region ?? null,
      telefono: row.telefono ?? null,
      email: row.email ?? null,
      logo_url: row.logo_url ?? null,
      plan: row.plan ?? "basico",
    };
  } catch (error) {
    console.error("Error al obtener centro médico:", error);
    throw error;
  }
}

// ========================================
// RESUMEN DE CONFIRMACIONES
// ========================================

async function obtenerResumenConfirmaciones(
  idCentro: number,
  idSucursal: number | null,
  fechaDesde: string,
  fechaHasta: string
): Promise<ResumenConfirmaciones> {
  try {
    const paramsBase = [idCentro, fechaDesde, fechaHasta, idSucursal, idSucursal];

    const queries = [
      // Total citas en rango (independiente de confirmación)
      pool.query<RowDataPacket[]>(
        `
        SELECT COUNT(*) AS total
        FROM citas c
        WHERE c.id_centro = ?
          AND DATE(c.fecha_hora_inicio) BETWEEN ? AND ?
          AND (c.id_sucursal = ? OR ? IS NULL)
        `,
        paramsBase
      ),

      // Citas con al menos un intento de confirmación
      pool.query<RowDataPacket[]>(
        `
        SELECT COUNT(DISTINCT c.id_cita) AS total
        FROM citas c
        INNER JOIN confirmaciones conf ON conf.id_cita = c.id_cita
        WHERE c.id_centro = ?
          AND DATE(c.fecha_hora_inicio) BETWEEN ? AND ?
          AND (c.id_sucursal = ? OR ? IS NULL)
        `,
        paramsBase
      ),

      // Citas confirmadas (por paciente o por registro en confirmaciones)
      pool.query<RowDataPacket[]>(
        `
        SELECT COUNT(DISTINCT c.id_cita) AS total
        FROM citas c
        LEFT JOIN confirmaciones conf 
          ON conf.id_cita = c.id_cita
        WHERE c.id_centro = ?
          AND DATE(c.fecha_hora_inicio) BETWEEN ? AND ?
          AND (c.id_sucursal = ? OR ? IS NULL)
          AND (
            c.confirmado_por_paciente = 1
            OR conf.confirmada = 1
          )
        `,
        paramsBase
      ),

      // Citas pendientes de confirmación (no canceladas, no confirmadas)
      pool.query<RowDataPacket[]>(
        `
        SELECT COUNT(DISTINCT c.id_cita) AS total
        FROM citas c
        LEFT JOIN confirmaciones conf ON conf.id_cita = c.id_cita
        WHERE c.id_centro = ?
          AND DATE(c.fecha_hora_inicio) BETWEEN ? AND ?
          AND (c.id_sucursal = ? OR ? IS NULL)
          AND c.estado IN ('programada','confirmada','reprogramada')
          AND (c.confirmado_por_paciente IS NULL OR c.confirmado_por_paciente = 0)
          AND (conf.id_cita IS NULL OR conf.confirmada IS NULL OR conf.confirmada = 0)
        `,
        paramsBase
      ),

      // Citas canceladas en el rango (usando tabla cancelaciones)
      pool.query<RowDataPacket[]>(
        `
        SELECT COUNT(DISTINCT c.id_cita) AS total
        FROM citas c
        INNER JOIN cancelaciones can ON can.id_cita = c.id_cita
        WHERE c.id_centro = ?
          AND DATE(c.fecha_hora_inicio) BETWEEN ? AND ?
          AND (c.id_sucursal = ? OR ? IS NULL)
        `,
        paramsBase
      ),

      // Citas sin contacto (sin confirmaciones ni recordatorios)
      pool.query<RowDataPacket[]>(
        `
        SELECT COUNT(DISTINCT c.id_cita) AS total
        FROM citas c
        LEFT JOIN confirmaciones conf ON conf.id_cita = c.id_cita
        LEFT JOIN recordatorios r ON r.id_cita = c.id_cita
        WHERE c.id_centro = ?
          AND DATE(c.fecha_hora_inicio) BETWEEN ? AND ?
          AND (c.id_sucursal = ? OR ? IS NULL)
          AND c.estado IN ('programada','confirmada','reprogramada')
          AND conf.id_confirmacion IS NULL
          AND r.id_recordatorio IS NULL
        `,
        paramsBase
      ),

      // Confirmaciones por canal (confirmadas)
      pool.query<RowDataPacket[]>(
        `
        SELECT
          SUM(CASE WHEN conf.tipo_confirmacion = 'email' AND conf.confirmada = 1 THEN 1 ELSE 0 END) AS email,
          SUM(CASE WHEN conf.tipo_confirmacion = 'sms' AND conf.confirmada = 1 THEN 1 ELSE 0 END) AS sms,
          SUM(CASE WHEN conf.tipo_confirmacion = 'whatsapp' AND conf.confirmada = 1 THEN 1 ELSE 0 END) AS whatsapp,
          SUM(CASE WHEN conf.tipo_confirmacion = 'llamada' AND conf.confirmada = 1 THEN 1 ELSE 0 END) AS llamada,
          SUM(CASE WHEN conf.tipo_confirmacion = 'presencial' AND conf.confirmada = 1 THEN 1 ELSE 0 END) AS presencial,
          SUM(CASE WHEN conf.tipo_confirmacion = 'app_movil' AND conf.confirmada = 1 THEN 1 ELSE 0 END) AS app_movil
        FROM confirmaciones conf
        INNER JOIN citas c ON c.id_cita = conf.id_cita
        WHERE c.id_centro = ?
          AND DATE(c.fecha_hora_inicio) BETWEEN ? AND ?
          AND (c.id_sucursal = ? OR ? IS NULL)
        `,
        paramsBase
      ),
    ];

    const results = await Promise.all(queries);

    const totalCitasRango = Number(results[0][0][0]?.total || 0);
    const totalConIntentos = Number(results[1][0][0]?.total || 0);
    const totalConfirmadas = Number(results[2][0][0]?.total || 0);
    const totalPendientes = Number(results[3][0][0]?.total || 0);
    const totalCanceladas = Number(results[4][0][0]?.total || 0);
    const totalSinContactar = Number(results[5][0][0]?.total || 0);

    const canalesRow = results[6][0][0] || {};
    const por_canal = {
      email: Number(canalesRow.email || 0),
      sms: Number(canalesRow.sms || 0),
      whatsapp: Number(canalesRow.whatsapp || 0),
      llamada: Number(canalesRow.llamada || 0),
      presencial: Number(canalesRow.presencial || 0),
      app_movil: Number(canalesRow.app_movil || 0),
    };

    const tasa_confirmacion =
      totalCitasRango > 0
        ? Math.round((totalConfirmadas / totalCitasRango) * 100)
        : 0;

    return {
      total_citas_rango: totalCitasRango,
      total_con_intentos: totalConIntentos,
      total_confirmadas: totalConfirmadas,
      total_pendientes: totalPendientes,
      total_canceladas: totalCanceladas,
      total_sin_contactar: totalSinContactar,
      tasa_confirmacion,
      por_canal,
    };
  } catch (error) {
    console.error("Error al obtener resumen de confirmaciones:", error);
    throw error;
  }
}

// ========================================
// LISTADO DE CONFIRMACIONES
// ========================================

function mapEstadoConfirmacion(
  estadoCita: string,
  confirmadoPorPaciente: number | null,
  confirmadaFlag: number | null,
  idConfirmacion: number | null
): EstadoConfirmacionApi {
  if (estadoCita === "cancelada" || estadoCita === "no_asistio") {
    return "cancelada";
  }

  const confirmado =
    (confirmadoPorPaciente ?? 0) === 1 || (confirmadaFlag ?? 0) === 1;

  if (confirmado) return "confirmada";
  if (!idConfirmacion) return "sin_registro";
  return "pendiente";
}

async function obtenerListadoConfirmaciones(
  idCentro: number,
  idSucursal: number | null,
  fechaDesde: string,
  fechaHasta: string,
  pagina: number,
  porPagina: number,
  estadoFiltro: EstadoConfirmacionApi | "todas"
): Promise<ListadoConfirmacionesResponse> {
  try {
    const paramsBase = [idCentro, fechaDesde, fechaHasta, idSucursal, idSucursal];

    const [rows] = await pool.query<RowDataPacket[]>(
      `
      SELECT 
        c.id_cita,
        c.fecha_hora_inicio,
        c.fecha_hora_fin,
        c.estado AS estado_cita,
        c.tipo_cita,
        c.origen,
        c.prioridad,
        c.confirmado_por_paciente,

        p.id_paciente,
        CONCAT(
          p.nombre, ' ', p.apellido_paterno, ' ', COALESCE(p.apellido_materno, '')
        ) AS paciente_nombre,
        TIMESTAMPDIFF(YEAR, p.fecha_nacimiento, CURDATE()) AS paciente_edad,
        p.foto_url AS paciente_foto,
        p.telefono AS paciente_telefono,
        p.email AS paciente_email,

        ps.id_profesional,
        CONCAT(
          u_pro.nombre, ' ', u_pro.apellido_paterno, ' ', COALESCE(u_pro.apellido_materno, '')
        ) AS profesional_nombre,
        ps.especialidad_principal,

        s.id_sucursal,
        s.nombre AS sucursal_nombre,

        conf.id_confirmacion,
        conf.tipo_confirmacion,
        conf.fecha_envio_solicitud,
        conf.fecha_confirmacion,
        conf.confirmada AS confirmada_flag,
        conf.canal_respuesta,
        conf.respuesta,

        (
          SELECT COUNT(*)
          FROM recordatorios r
          WHERE r.id_cita = c.id_cita
            AND r.estado IN ('pendiente','enviado')
        ) AS total_recordatorios_pend_o_env,

        (
          SELECT MAX(r.fecha_envio)
          FROM recordatorios r
          WHERE r.id_cita = c.id_cita
        ) AS ultima_fecha_recordatorio
      FROM citas c
      INNER JOIN pacientes p ON p.id_paciente = c.id_paciente
      LEFT JOIN profesionales_salud ps ON ps.id_profesional = c.id_profesional
      LEFT JOIN usuarios u_pro ON u_pro.id_usuario = ps.id_usuario
      LEFT JOIN sucursales s ON s.id_sucursal = c.id_sucursal
      LEFT JOIN confirmaciones conf ON conf.id_confirmacion = (
        SELECT c2.id_confirmacion
        FROM confirmaciones c2
        WHERE c2.id_cita = c.id_cita
        ORDER BY c2.fecha_creacion DESC
        LIMIT 1
      )
      WHERE c.id_centro = ?
        AND DATE(c.fecha_hora_inicio) BETWEEN ? AND ?
        AND (c.id_sucursal = ? OR ? IS NULL)
        AND c.estado NOT IN ('cancelada','no_asistio')
      ORDER BY c.fecha_hora_inicio ASC
      `,
      paramsBase
    );

    const mapped: ConfirmacionItem[] = rows.map((row) => {
      const fechaInicio =
        row.fecha_hora_inicio instanceof Date
          ? row.fecha_hora_inicio.toISOString()
          : new Date(row.fecha_hora_inicio).toISOString();

      const fechaFin =
        row.fecha_hora_fin instanceof Date
          ? row.fecha_hora_fin.toISOString()
          : row.fecha_hora_fin
          ? new Date(row.fecha_hora_fin).toISOString()
          : null;

      const fechaEnvio =
        row.fecha_envio_solicitud instanceof Date
          ? row.fecha_envio_solicitud.toISOString()
          : row.fecha_envio_solicitud
          ? new Date(row.fecha_envio_solicitud).toISOString()
          : null;

      const fechaConfirmacion =
        row.fecha_confirmacion instanceof Date
          ? row.fecha_confirmacion.toISOString()
          : row.fecha_confirmacion
          ? new Date(row.fecha_confirmacion).toISOString()
          : null;

      const ultimaFechaRecordatorio =
        row.ultima_fecha_recordatorio instanceof Date
          ? row.ultima_fecha_recordatorio.toISOString()
          : row.ultima_fecha_recordatorio
          ? new Date(row.ultima_fecha_recordatorio).toISOString()
          : null;

      const confirmadoPorPaciente = Number(row.confirmado_por_paciente ?? 0);
      const confirmadaFlag = row.confirmada_flag != null ? Number(row.confirmada_flag) : null;

      const estadoConfirmacion = mapEstadoConfirmacion(
        row.estado_cita,
        confirmadoPorPaciente,
        confirmadaFlag,
        row.id_confirmacion ?? null
      );

      const confirmado =
        confirmadoPorPaciente === 1 || (confirmadaFlag ?? 0) === 1;

      const canal: CanalConfirmacion | null = row.tipo_confirmacion ?? null;

      return {
        id_cita: Number(row.id_cita),
        id_confirmacion: row.id_confirmacion ? Number(row.id_confirmacion) : null,

        fecha_cita: fechaInicio,
        fecha_fin: fechaFin,
        estado_cita: row.estado_cita,
        estado_confirmacion: estadoConfirmacion,

        tipo_cita: row.tipo_cita,
        origen: row.origen,
        prioridad: row.prioridad,

        canal_ultimo_intento: canal,
        fecha_envio_solicitud: fechaEnvio,
        fecha_confirmacion: fechaConfirmacion,
        confirmado,
        confirmado_por_paciente: confirmadoPorPaciente === 1,

        paciente: {
          id_paciente: Number(row.id_paciente),
          nombre_completo: row.paciente_nombre,
          edad:
            row.paciente_edad !== null && row.paciente_edad !== undefined
              ? Number(row.paciente_edad)
              : null,
          foto_url: row.paciente_foto ?? null,
          telefono: row.paciente_telefono ?? null,
          email: row.paciente_email ?? null,
        },

        profesional: {
          id_profesional: row.id_profesional
            ? Number(row.id_profesional)
            : null,
          nombre_completo: row.profesional_nombre ?? null,
          especialidad_principal: row.especialidad_principal ?? null,
        },

        sucursal: {
          id_sucursal: row.id_sucursal ? Number(row.id_sucursal) : null,
          nombre: row.sucursal_nombre ?? null,
        },

        tiene_recordatorios:
          Number(row.total_recordatorios_pend_o_env || 0) > 0,
        ultima_fecha_recordatorio: ultimaFechaRecordatorio,
      };
    });

    const estadoFiltroNormalizado =
      estadoFiltro && estadoFiltro !== "todas" ? estadoFiltro : null;

    const filtrados = estadoFiltroNormalizado
      ? mapped.filter(
          (m) => m.estado_confirmacion === estadoFiltroNormalizado
        )
      : mapped;

    const total = filtrados.length;
    const totalPaginas = Math.max(Math.ceil(total / porPagina), 1);
    const paginaSafe = Math.min(Math.max(pagina, 1), totalPaginas);
    const offset = (paginaSafe - 1) * porPagina;
    const items = filtrados.slice(offset, offset + porPagina);

    return {
      items,
      total,
      pagina: paginaSafe,
      por_pagina: porPagina,
      total_paginas: totalPaginas,
    };
  } catch (error) {
    console.error("Error al obtener listado de confirmaciones:", error);
    throw error;
  }
}

// ========================================
// HANDLER GET
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

    // Verificar sesión en sesiones_usuarios + usuarios
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

    const idUsuario = Number(sesiones[0].id_usuario);

    // Verificar que sea secretaria
    const secretaria = await obtenerSecretariaAutenticada(idUsuario);

    if (!secretaria) {
      return NextResponse.json(
        {
          success: false,
          error:
            "No tienes un registro de secretaria activo. Contacta al administrador.",
        },
        { status: 403 }
      );
    }

    // Obtener información del centro médico
    const centroMedico = await obtenerCentroMedico(secretaria.id_centro);

    if (!centroMedico) {
      return NextResponse.json(
        { success: false, error: "Centro médico no encontrado" },
        { status: 404 }
      );
    }

    // Actualizar última actividad
    await pool.query(
      `UPDATE sesiones_usuarios SET ultima_actividad = NOW() WHERE token = ?`,
      [sessionToken]
    );

    // Parámetros de filtro
    const url = new URL(request.url);
    const searchParams = url.searchParams;

    const ahora = new Date();
    const fechaDesdeParam = searchParams.get("fecha_desde");
    const fechaHastaParam = searchParams.get("fecha_hasta");
    const paginaParam = searchParams.get("pagina");
    const porPaginaParam = searchParams.get("por_pagina");
    const estadoParam = searchParams.get("estado");

    const fechaDesde =
      fechaDesdeParam && fechaDesdeParam.trim() !== ""
        ? fechaDesdeParam
        : toSqlDate(ahora);

    const fechaHasta =
      fechaHastaParam && fechaHastaParam.trim() !== ""
        ? fechaHastaParam
        : toSqlDate(addDays(ahora, 7)); // por defecto próximos 7 días

    const pagina =
      paginaParam && !Number.isNaN(Number(paginaParam))
        ? Math.max(parseInt(paginaParam, 10), 1)
        : 1;

    const porPaginaRaw =
      porPaginaParam && !Number.isNaN(Number(porPaginaParam))
        ? parseInt(porPaginaParam, 10)
        : 20;

    const porPagina = Math.min(Math.max(porPaginaRaw, 1), 100);

    const estadoFiltro: EstadoConfirmacionApi | "todas" =
      estadoParam === "confirmada" ||
      estadoParam === "pendiente" ||
      estadoParam === "sin_registro" ||
      estadoParam === "cancelada"
        ? (estadoParam as EstadoConfirmacionApi)
        : "todas";

    // Obtener datos en paralelo
    const [resumen, listado] = await Promise.all([
      obtenerResumenConfirmaciones(
        secretaria.id_centro,
        secretaria.id_sucursal,
        fechaDesde,
        fechaHasta
      ),
      obtenerListadoConfirmaciones(
        secretaria.id_centro,
        secretaria.id_sucursal,
        fechaDesde,
        fechaHasta,
        pagina,
        porPagina,
        estadoFiltro
      ),
    ]);

    return NextResponse.json(
      {
        success: true,
        filtros: {
          fecha_desde: fechaDesde,
          fecha_hasta: fechaHasta,
          estado: estadoFiltro,
          pagina: listado.pagina,
          por_pagina: listado.por_pagina,
          total: listado.total,
          total_paginas: listado.total_paginas,
        },
        secretaria: {
          id_secretaria: secretaria.id_secretaria,
          id_usuario: secretaria.id_usuario,
          id_centro: secretaria.id_centro,
          id_sucursal: secretaria.id_sucursal,
          id_departamento: secretaria.id_departamento,
          jornada: secretaria.jornada,
          extension_telefonica: secretaria.extension_telefonica,
          estado: secretaria.estado,
        },
        centro_medico: centroMedico,
        resumen,
        confirmaciones: listado.items,
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("❌ Error en GET /api/secretaria/confirmaciones:", error);
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
