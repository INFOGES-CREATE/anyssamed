// app/api/tecnico/tickets/config/centro/route.ts
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import type { RowDataPacket, ResultSetHeader } from "mysql2";
import { createHash } from "crypto";

// ========================================
// TIPOS
// ========================================

interface TecnicoData {
  id_tecnico: number;
  id_usuario: number;
  id_centro: number;
  id_sucursal: number | null;
  id_departamento: number | null;
  area_tecnica: string | null;
  tipo_tecnico: "soporte" | "mantenimiento" | "ingenieria" | "biomedico";
  estado: "activo" | "inactivo" | "suspendido" | "vacaciones";
  nivel_acceso: "basico" | "intermedio" | "avanzado" | "administrador";
}

interface ConfigCentroTicketsPayload {
  id_config?: number | null;
  id_centro: number;

  nombre_centro?: string;

  habilitado: boolean;
  permite_tickets_pacientes: boolean;
  permite_tickets_internos: boolean;

  canales: {
    web: boolean;
    email: boolean;
    telefono: boolean;
    whatsapp: boolean;
    app_movil: boolean;
    kiosko: boolean;
  };

  tipos_activos: {
    soporte: boolean;
    mantenimiento: boolean;
    ingenieria: boolean;
    biomedico: boolean;
    infraestructura: boolean;
  };

  sla_minutos: {
    critica: number;
    alta: number;
    media: number;
    baja: number;
  };

  horario_operacion: {
    desde: string; // "HH:MM"
    hasta: string; // "HH:MM"
    permite_fuera_horario: boolean;
  };

  autoasignacion: {
    habilitada: boolean;
    max_tickets_abiertos: number;
  };

  notificaciones: {
    email_resumen_diario: boolean;
    alerta_ticket_critico: boolean;
    copia_jefatura: boolean;
    copia_mantencion: boolean;
  };

  ult_actualizacion?: string | null;
}

interface ConfiguracionCentroDb extends RowDataPacket {
  id_configuracion: number;
  id_centro: number;
  clave: string;
  clave_grupo: string | null;
  valor: string | null;
  valor_json: string | null;
  tipo_dato: string;
  descripcion: string | null;
  grupo: string | null;
  modificable_por_centro: 0 | 1;
  estado: 0 | 1;
  version: number;
  hash_config: string | null;
  origen: string | null;
  fecha_creacion: Date;
  fecha_modificacion: Date;
  modificado_por: number | null;
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

const CLAVE_CONFIG_TICKETS = "tickets_config_centro";
const GRUPO_CONFIG_TICKETS = "tickets";
const ORIGEN_CONFIG_TICKETS = "tecnico_panel";

// ========================================
// FUNCIONES AUXILIARES
// ========================================

/**
 * Extrae el token de sesión de las cookies o headers
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

/**
 * Obtiene el usuario autenticado desde el token de sesión
 */
async function obtenerUsuarioDesdeSesion(
  sessionToken: string
): Promise<{ id_usuario: number } | null> {
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

  if (!sesiones || sesiones.length === 0) {
    return null;
  }

  return { id_usuario: sesiones[0].id_usuario as number };
}

/**
 * Obtiene la información del técnico autenticado
 */
async function obtenerTecnicoAutenticado(
  idUsuario: number
): Promise<TecnicoData | null> {
  try {
    const [rows] = await pool.query<RowDataPacket[]>(
      `
      SELECT 
        t.id_tecnico,
        t.id_usuario,
        t.id_centro,
        t.id_sucursal,
        t.id_departamento,
        t.area_tecnica,
        t.tipo_tecnico,
        t.estado,
        t.nivel_acceso
      FROM tecnicos t
      WHERE t.id_usuario = ?
        AND t.estado IN ('activo', 'suspendido')
      LIMIT 1
      `,
      [idUsuario]
    );

    if (!rows || rows.length === 0) return null;

    const row = rows[0];

    return {
      id_tecnico: row.id_tecnico,
      id_usuario: row.id_usuario,
      id_centro: row.id_centro,
      id_sucursal: row.id_sucursal,
      id_departamento: row.id_departamento,
      area_tecnica: row.area_tecnica ?? null,
      tipo_tecnico: row.tipo_tecnico,
      estado: row.estado,
      nivel_acceso: row.nivel_acceso,
    };
  } catch (error) {
    console.error("Error al obtener técnico:", error);
    throw error;
  }
}

/**
 * Obtiene, si existe, la fila de configuraciones_centro para tickets del centro
 */
async function obtenerFilaConfiguracionCentro(
  idCentro: number
): Promise<ConfiguracionCentroDb | null> {
  const [rows] = await pool.query<RowDataPacket[]>(
    `
    SELECT
      c.id_configuracion,
      c.id_centro,
      c.clave,
      c.clave_grupo,
      c.valor,
      c.valor_json,
      c.tipo_dato,
      c.descripcion,
      c.grupo,
      c.modificable_por_centro,
      c.estado,
      c.version,
      c.hash_config,
      c.origen,
      c.fecha_creacion,
      c.fecha_modificacion,
      c.modificado_por
    FROM configuraciones_centro c
    WHERE c.id_centro = ?
      AND c.clave = ?
      AND c.estado = 1
    LIMIT 1
    `,
    [idCentro, CLAVE_CONFIG_TICKETS]
  );

  if (!rows || rows.length === 0) return null;

  return rows[0] as ConfiguracionCentroDb;
}

/**
 * Convierte la fila de BD a objeto de configuración a enviar al front
 */
function construirConfigDesdeDb(
  row: ConfiguracionCentroDb | null
): ConfigCentroTicketsPayload | null {
  if (!row) return null;

  let jsonData: any = {};

  try {
    if (row.valor_json) {
      if (typeof row.valor_json === "string") {
        // Caso 1: ya viene como string JSON
        jsonData = JSON.parse(row.valor_json);
      } else if (typeof row.valor_json === "object") {
        // Caso 2: ya viene como objeto -> usar directamente
        jsonData = row.valor_json;
      } else {
        // Cualquier otra cosa
        console.warn("Formato inesperado en valor_json:", row.valor_json);
      }
    } else if (row.valor) {
      jsonData = JSON.parse(row.valor);
    }
  } catch (err) {
    console.error(
      "Error al parsear valor_json/valor de configuraciones_centro:",
      err
    );
    jsonData = {};
  }

  const fechaMod =
    row.fecha_modificacion instanceof Date
      ? row.fecha_modificacion.toISOString()
      : null;

  const config: ConfigCentroTicketsPayload = {
    ...(jsonData || {}),
    id_config: row.id_configuracion,
    id_centro: row.id_centro,
    ult_actualizacion: fechaMod,
  };

  return config;
}


/**
 * Calcula hash SHA-256 de la configuración
 */
function calcularHashConfig(config: any): string {
  const json = JSON.stringify(config ?? {});
  return createHash("sha256").update(json).digest("hex");
}

/**
 * Valida y normaliza el payload de configuración recibido desde el front
 */
function prepararPayloadConfigDesdeBody(
  body: any,
  tecnico: TecnicoData
): {
  idConfig: number | null;
  idCentro: number;
  config: Omit<ConfigCentroTicketsPayload, "id_centro" | "id_config">;
} {
  if (!body || typeof body !== "object") {
    throw new Error("Payload de configuración inválido");
  }

  const {
    id_config,
    id_centro,
    id_tecnico, // ignoramos este, pero lo validamos por seguridad
    nombre_centro,
    ...rest
  } = body;

  // Validar centro
  const centroFromBody =
    typeof id_centro === "number"
      ? id_centro
      : parseInt(String(id_centro || 0), 10);

  const idCentroFinal = Number.isFinite(centroFromBody)
    ? centroFromBody
    : tecnico.id_centro;

  if (!idCentroFinal || idCentroFinal <= 0) {
    throw new Error("id_centro inválido");
  }

  if (idCentroFinal !== tecnico.id_centro) {
    throw new Error("No puedes modificar la configuración de otro centro");
  }

  // Validar id_tecnico si viene
  if (id_tecnico && Number(id_tecnico) !== tecnico.id_tecnico) {
    throw new Error("Inconsistencia entre el técnico autenticado y el payload");
  }

  // Aseguramos estructura mínima (lo demás lo rellena el front con defaults)
  if (!rest.canales || typeof rest.canales !== "object") {
    throw new Error("Faltan datos de canales en la configuración");
  }
  if (!rest.tipos_activos || typeof rest.tipos_activos !== "object") {
    throw new Error("Faltan tipos de ticket en la configuración");
  }
  if (!rest.sla_minutos || typeof rest.sla_minutos !== "object") {
    throw new Error("Faltan datos de SLA en la configuración");
  }
  if (!rest.horario_operacion || typeof rest.horario_operacion !== "object") {
    throw new Error("Faltan datos de horario_operacion");
  }
  if (!rest.autoasignacion || typeof rest.autoasignacion !== "object") {
    throw new Error("Faltan datos de autoasignacion");
  }
  if (!rest.notificaciones || typeof rest.notificaciones !== "object") {
    throw new Error("Faltan datos de notificaciones");
  }

  const config: Omit<
    ConfigCentroTicketsPayload,
    "id_centro" | "id_config"
  > = {
    habilitado: !!rest.habilitado,
    permite_tickets_pacientes: !!rest.permite_tickets_pacientes,
    permite_tickets_internos: !!rest.permite_tickets_internos,
    canales: rest.canales,
    tipos_activos: rest.tipos_activos,
    sla_minutos: rest.sla_minutos,
    horario_operacion: rest.horario_operacion,
    autoasignacion: rest.autoasignacion,
    notificaciones: rest.notificaciones,
    ult_actualizacion: new Date().toISOString(),
  };

  if (typeof nombre_centro === "string") {
    config.nombre_centro = nombre_centro;
  }

  const idConfigParsed =
    id_config == null
      ? null
      : typeof id_config === "number"
      ? id_config
      : parseInt(String(id_config), 10) || null;

  return {
    idConfig: idConfigParsed,
    idCentro: idCentroFinal,
    config,
  };
}

// ========================================
// HANDLERS
// ========================================

/**
 * GET /api/tecnico/tickets/config/centro?id_centro=...&id_tecnico=...
 *
 * Devuelve la configuración de tickets a nivel de centro
 * Si no existe, success = true y config = null (el front usa defaults)
 */
export async function GET(request: NextRequest) {
  try {
    const sessionToken = getSessionToken(request);

    if (!sessionToken) {
      return NextResponse.json(
        { success: false, error: "No hay sesión activa" },
        { status: 401 }
      );
    }

    const usuarioSesion = await obtenerUsuarioDesdeSesion(sessionToken);

    if (!usuarioSesion) {
      return NextResponse.json(
        { success: false, error: "Sesión inválida o expirada" },
        { status: 401 }
      );
    }

    const tecnico = await obtenerTecnicoAutenticado(usuarioSesion.id_usuario);

    if (!tecnico) {
      return NextResponse.json(
        {
          success: false,
          error:
            "No tienes un registro de técnico activo. Contacta al administrador.",
        },
        { status: 403 }
      );
    }

    const url = new URL(request.url);
    const searchParams = url.searchParams;

    const idCentroParam = searchParams.get("id_centro");
    const idTecnicoParam = searchParams.get("id_tecnico");

    // Validar técnico del query si viene
    if (idTecnicoParam && Number(idTecnicoParam) !== tecnico.id_tecnico) {
      return NextResponse.json(
        {
          success: false,
          error: "No tienes permisos para ver la configuración de otro técnico.",
        },
        { status: 403 }
      );
    }

    let idCentro = tecnico.id_centro;

    if (idCentroParam) {
      const parsed = parseInt(idCentroParam, 10);
      if (!Number.isFinite(parsed) || parsed <= 0) {
        return NextResponse.json(
          { success: false, error: "Parámetro id_centro inválido" },
          { status: 400 }
        );
      }

      if (parsed !== tecnico.id_centro) {
        return NextResponse.json(
          {
            success: false,
            error:
              "No puedes acceder a la configuración de tickets de otro centro.",
          },
          { status: 403 }
        );
      }

      idCentro = parsed;
    }

    // Actualizar última actividad de sesión
    await pool.query(
      `UPDATE sesiones_usuarios SET ultima_actividad = NOW() WHERE token = ?`,
      [sessionToken]
    );

    // Buscar configuración en BD
    const filaConfig = await obtenerFilaConfiguracionCentro(idCentro);
    const config = construirConfigDesdeDb(filaConfig);

    return NextResponse.json(
      {
        success: true,
        config: config ?? null,
        centro: {
          id_centro: idCentro,
        },
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error(
      "❌ Error en GET /api/tecnico/tickets/config/centro:",
      error
    );

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

/**
 * POST /api/tecnico/tickets/config/centro
 *
 * Crea o actualiza (modo upsert) la configuración de tickets del centro del técnico
 * El front decide usar POST cuando no hay id_config.
 */
export async function POST(request: NextRequest) {
  try {
    const sessionToken = getSessionToken(request);

    if (!sessionToken) {
      return NextResponse.json(
        { success: false, error: "No hay sesión activa" },
        { status: 401 }
      );
    }

    const usuarioSesion = await obtenerUsuarioDesdeSesion(sessionToken);

    if (!usuarioSesion) {
      return NextResponse.json(
        { success: false, error: "Sesión inválida o expirada" },
        { status: 401 }
      );
    }

    const tecnico = await obtenerTecnicoAutenticado(usuarioSesion.id_usuario);

    if (!tecnico) {
      return NextResponse.json(
        {
          success: false,
          error:
            "No tienes un registro de técnico activo. Contacta al administrador.",
        },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { idConfig, idCentro, config } = prepararPayloadConfigDesdeBody(
      body,
      tecnico
    );

    // Serializar config (sin id_centro / id_config)
    const jsonToStore = JSON.stringify(config);
    const hashConfig = calcularHashConfig(config);

    // Verificar si ya existe una fila para este centro/clave
    const existingRow = await obtenerFilaConfiguracionCentro(idCentro);

    let idConfigFinal = idConfig ?? null;
    let version = 1;

    if (existingRow) {
      // Ya existe → POST se comporta como update/upsert
      version = (existingRow.version || 1) + 1;
      idConfigFinal = existingRow.id_configuracion;

      await pool.query(
        `
        UPDATE configuraciones_centro
        SET
          valor = ?,
          valor_json = ?,
          tipo_dato = 'json',
          descripcion = ?,
          grupo = ?,
          clave_grupo = ?,
          modificable_por_centro = 1,
          estado = 1,
          version = ?,
          hash_config = ?,
          origen = ?,
          modificado_por = ?
        WHERE id_configuracion = ?
          AND id_centro = ?
        `,
        [
          jsonToStore,
          jsonToStore,
          "Configuración de módulo de tickets a nivel de centro técnico",
          GRUPO_CONFIG_TICKETS,
          CLAVE_CONFIG_TICKETS,
          version,
          hashConfig,
          ORIGEN_CONFIG_TICKETS,
          usuarioSesion.id_usuario,
          idConfigFinal,
          idCentro,
        ]
      );
    } else {
      // No existe → crear nueva fila
      const [insertResult] = await pool.query<ResultSetHeader>(
        `
        INSERT INTO configuraciones_centro (
          id_centro,
          clave,
          clave_grupo,
          valor,
          valor_json,
          tipo_dato,
          descripcion,
          grupo,
          modificable_por_centro,
          estado,
          version,
          hash_config,
          origen,
          modificado_por
        ) VALUES (
          ?, ?, ?, ?, ?, 'json', ?, ?, 1, 1, 1, ?, ?, ?
        )
        `,
        [
          idCentro,
          CLAVE_CONFIG_TICKETS,
          CLAVE_CONFIG_TICKETS,
          jsonToStore,
          jsonToStore,
          "Configuración de módulo de tickets a nivel de centro técnico",
          GRUPO_CONFIG_TICKETS,
          hashConfig,
          ORIGEN_CONFIG_TICKETS,
          usuarioSesion.id_usuario,
        ]
      );

      idConfigFinal = insertResult.insertId;
      version = 1;
    }

    const nowIso = new Date().toISOString();

    const responseConfig: ConfigCentroTicketsPayload = {
      ...config,
      id_centro: idCentro,
      id_config: idConfigFinal,
      ult_actualizacion: nowIso,
    };

    // Actualizar última actividad de sesión
    await pool.query(
      `UPDATE sesiones_usuarios SET ultima_actividad = NOW() WHERE token = ?`,
      [sessionToken]
    );

    return NextResponse.json(
      {
        success: true,
        config: responseConfig,
        version,
        timestamp: nowIso,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error(
      "❌ Error en POST /api/tecnico/tickets/config/centro:",
      error
    );

    const message =
      error instanceof Error ? error.message : "Error interno del servidor";

    return NextResponse.json(
      {
        success: false,
        error: message,
        details:
          process.env.NODE_ENV === "development" ? error.stack ?? message : undefined,
      },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/tecnico/tickets/config/centro
 *
 * Actualiza una configuración existente (requiere id_config válido)
 */
export async function PUT(request: NextRequest) {
  try {
    const sessionToken = getSessionToken(request);

    if (!sessionToken) {
      return NextResponse.json(
        { success: false, error: "No hay sesión activa" },
        { status: 401 }
      );
    }

    const usuarioSesion = await obtenerUsuarioDesdeSesion(sessionToken);

    if (!usuarioSesion) {
      return NextResponse.json(
        { success: false, error: "Sesión inválida o expirada" },
        { status: 401 }
      );
    }

    const tecnico = await obtenerTecnicoAutenticado(usuarioSesion.id_usuario);

    if (!tecnico) {
      return NextResponse.json(
        {
          success: false,
          error:
            "No tienes un registro de técnico activo. Contacta al administrador.",
        },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { idConfig, idCentro, config } = prepararPayloadConfigDesdeBody(
      body,
      tecnico
    );

    if (!idConfig) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Falta id_config para actualizar la configuración. Usa POST para crear una nueva.",
        },
        { status: 400 }
      );
    }

    // Buscar fila existente para verificar que pertenece al centro e indice
    const [rows] = await pool.query<RowDataPacket[]>(
      `
      SELECT
        id_configuracion,
        id_centro,
        version,
        modificable_por_centro,
        estado
      FROM configuraciones_centro
      WHERE id_configuracion = ?
        AND id_centro = ?
        AND clave = ?
      LIMIT 1
      `,
      [idConfig, idCentro, CLAVE_CONFIG_TICKETS]
    );

    if (!rows || rows.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Configuración no encontrada para este centro.",
        },
        { status: 404 }
      );
    }

    const row = rows[0] as ConfiguracionCentroDb;

    if (!row.modificable_por_centro) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Esta configuración no es modificable a nivel de centro. Contacta al administrador.",
        },
        { status: 403 }
      );
    }

    if (row.estado === 0) {
      return NextResponse.json(
        {
          success: false,
          error:
            "La configuración actual está deshabilitada. Contacta al administrador.",
        },
        { status: 403 }
      );
    }

    const newVersion = (row.version || 1) + 1;
    const jsonToStore = JSON.stringify(config);
    const hashConfig = calcularHashConfig(config);
    const nowIso = new Date().toISOString();

    await pool.query(
      `
      UPDATE configuraciones_centro
      SET
        valor = ?,
        valor_json = ?,
        tipo_dato = 'json',
        descripcion = ?,
        grupo = ?,
        clave_grupo = ?,
        version = ?,
        hash_config = ?,
        origen = ?,
        modificado_por = ?,
        estado = 1
      WHERE id_configuracion = ?
        AND id_centro = ?
      `,
      [
        jsonToStore,
        jsonToStore,
        "Configuración de módulo de tickets a nivel de centro técnico",
        GRUPO_CONFIG_TICKETS,
        CLAVE_CONFIG_TICKETS,
        newVersion,
        hashConfig,
        ORIGEN_CONFIG_TICKETS,
        usuarioSesion.id_usuario,
        idConfig,
        idCentro,
      ]
    );

    const responseConfig: ConfigCentroTicketsPayload = {
      ...config,
      id_centro: idCentro,
      id_config: idConfig,
      ult_actualizacion: nowIso,
    };

    // Actualizar última actividad
    await pool.query(
      `UPDATE sesiones_usuarios SET ultima_actividad = NOW() WHERE token = ?`,
      [sessionToken]
    );

    return NextResponse.json(
      {
        success: true,
        config: responseConfig,
        version: newVersion,
        timestamp: nowIso,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error(
      "❌ Error en PUT /api/tecnico/tickets/config/centro:",
      error
    );

    const message =
      error instanceof Error ? error.message : "Error interno del servidor";

    return NextResponse.json(
      {
        success: false,
        error: message,
        details:
          process.env.NODE_ENV === "development" ? error.stack ?? message : undefined,
      },
      { status: 500 }
    );
  }
}

// ========================================
// MÉTODOS NO PERMITIDOS
// ========================================

export async function DELETE() {
  return NextResponse.json(
    { success: false, error: "Método no permitido" },
    { status: 405 }
  );
}

export async function PATCH() {
  return NextResponse.json(
    { success: false, error: "Método no permitido" },
    { status: 405 }
  );
}
