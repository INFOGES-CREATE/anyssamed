// app/api/secretaria/llamadas/route.ts
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
  region: string;
  telefono: string | null;
  email: string | null;
  logo_url: string | null;
  plan: "basico" | "profesional" | "premium" | "empresarial";
}

interface ResumenLlamadas {
  total_mes: number;
  confirmadas_mes: number;
  no_confirmadas_mes: number;
  efectividad_mes: number; // porcentaje 0–100
  llamadas_hoy: number;
  llamadas_ayer: number;
  llamadas_ultimos_7_dias: number;
}

interface LlamadaReciente {
  id_confirmacion: number;
  id_cita: number;
  fecha_llamada: string; // ISO
  fecha_envio_solicitud: string;
  fecha_confirmacion: string | null;
  confirmada: boolean | null;
  respuesta: string | null;
  canal_respuesta: string | null;
  observaciones: string | null;
  paciente: {
    id_paciente: number;
    nombre_completo: string;
    telefono: string | null;
    celular: string | null;
    whatsapp: string | null;
    foto_url: string | null;
    es_vip: boolean;
    clasificacion_riesgo: string | null; // bajo|medio|alto|critico|null
  };
  cita: {
    fecha_hora_inicio: string;
    estado: string;
    motivo: string | null;
  };
  secretaria: {
    id_usuario: number | null;
    nombre_completo: string | null;
  };
}

interface LlamadaPendiente {
  id_cita: number;
  fecha_hora_inicio: string;
  estado_cita: string;
  motivo: string | null;
  paciente: {
    id_paciente: number;
    nombre_completo: string;
    telefono: string | null;
    celular: string | null;
    whatsapp: string | null;
    preferencia_contacto:
      | "email"
      | "telefono"
      | "sms"
      | "whatsapp"
      | "ninguno"
      | null;
    es_vip: boolean;
    clasificacion_riesgo: string | null;
  };
  tiene_llamadas_previas: boolean;
  fecha_ultima_llamada: string | null;
}

interface PuntoSerieLlamadas {
  fecha: string; // YYYY-MM-DD
  total: number;
  confirmadas: number;
  no_confirmadas: number;
}

interface PlantillaMensajeLlamada {
  id_plantilla: number;
  nombre: string;
  tipo: string; // sms | whatsapp | ...
  categoria: string;
  descripcion: string | null;
  es_html: boolean;
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
// FUNCIONES AUXILIARES
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

/**
 * Obtiene la información de la secretaria autenticada
 */
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

/**
 * Obtiene la información del centro médico
 */
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

    return rows.length > 0 ? (rows[0] as CentroMedicoInfo) : null;
  } catch (error) {
    console.error("Error al obtener centro médico:", error);
    throw error;
  }
}

/**
 * Convierte un valor fecha de MySQL a ISO string
 */
function toIsoString(value: any): string {
  if (!value) return new Date().toISOString();
  if (value instanceof Date) return value.toISOString();
  return new Date(value).toISOString();
}

function toIsoNullable(value: any): string | null {
  if (!value) return null;
  if (value instanceof Date) return value.toISOString();
  return new Date(value).toISOString();
}

/**
 * Resumen de llamadas del mes para esta secretaria y centro
 */
async function obtenerResumenLlamadas(
  idSecretaria: number,
  idCentro: number
): Promise<ResumenLlamadas> {
  try {
    const ahora = new Date();
    const hoy = ahora.toISOString().split("T")[0];

    const ayerDate = new Date(
      ahora.getFullYear(),
      ahora.getMonth(),
      ahora.getDate() - 1
    );
    const ayer = ayerDate.toISOString().split("T")[0];

    const inicioMesDate = new Date(ahora.getFullYear(), ahora.getMonth(), 1);
    const inicioMes = inicioMesDate.toISOString().split("T")[0];

    const queries = [
      // total llamadas mes
      pool.query<RowDataPacket[]>(
        `
        SELECT COUNT(*) AS total
        FROM confirmaciones conf
        INNER JOIN citas c ON c.id_cita = conf.id_cita
        INNER JOIN usuarios u ON u.id_usuario = conf.confirmado_por
        INNER JOIN secretarias s ON s.id_usuario = u.id_usuario
        WHERE s.id_secretaria = ?
          AND c.id_centro = ?
          AND conf.tipo_confirmacion = 'llamada'
          AND DATE(conf.fecha_creacion) >= ?
        `,
        [idSecretaria, idCentro, inicioMes]
      ),
      // confirmadas mes
      pool.query<RowDataPacket[]>(
        `
        SELECT COUNT(*) AS total
        FROM confirmaciones conf
        INNER JOIN citas c ON c.id_cita = conf.id_cita
        INNERJOIN usuarios u ON u.id_usuario = conf.confirmado_por
        INNER JOIN secretarias s ON s.id_usuario = u.id_usuario
        WHERE s.id_secretaria = ?
          AND c.id_centro = ?
          AND conf.tipo_confirmacion = 'llamada'
          AND DATE(conf.fecha_creacion) >= ?
          AND conf.confirmada = 1
        `,
        [idSecretaria, idCentro, inicioMes]
      ),
      // NO confirmadas mes (NULL o 0)
      pool.query<RowDataPacket[]>(
        `
        SELECT COUNT(*) AS total
        FROM confirmaciones conf
        INNER JOIN citas c ON c.id_cita = conf.id_cita
        INNER JOIN usuarios u ON u.id_usuario = conf.confirmado_por
        INNER JOIN secretarias s ON s.id_usuario = u.id_usuario
        WHERE s.id_secretaria = ?
          AND c.id_centro = ?
          AND conf.tipo_confirmacion = 'llamada'
          AND DATE(conf.fecha_creacion) >= ?
          AND (conf.confirmada IS NULL OR conf.confirmada = 0)
        `,
        [idSecretaria, idCentro, inicioMes]
      ),
      // llamadas hoy
      pool.query<RowDataPacket[]>(
        `
        SELECT COUNT(*) AS total
        FROM confirmaciones conf
        INNER JOIN citas c ON c.id_cita = conf.id_cita
        INNER JOIN usuarios u ON u.id_usuario = conf.confirmado_por
        INNER JOIN secretarias s ON s.id_usuario = u.id_usuario
        WHERE s.id_secretaria = ?
          AND c.id_centro = ?
          AND conf.tipo_confirmacion = 'llamada'
          AND DATE(conf.fecha_creacion) = ?
        `,
        [idSecretaria, idCentro, hoy]
      ),
      // llamadas ayer
      pool.query<RowDataPacket[]>(
        `
        SELECT COUNT(*) AS total
        FROM confirmaciones conf
        INNER JOIN citas c ON c.id_cita = conf.id_cita
        INNER JOIN usuarios u ON u.id_usuario = conf.confirmado_por
        INNER JOIN secretarias s ON s.id_usuario = u.id_usuario
        WHERE s.id_secretaria = ?
          AND c.id_centro = ?
          AND conf.tipo_confirmacion = 'llamada'
          AND DATE(conf.fecha_creacion) = ?
        `,
        [idSecretaria, idCentro, ayer]
      ),
      // llamadas últimos 7 días
      pool.query<RowDataPacket[]>(
        `
        SELECT COUNT(*) AS total
        FROM confirmaciones conf
        INNER JOIN citas c ON c.id_cita = conf.id_cita
        INNER JOIN usuarios u ON u.id_usuario = conf.confirmado_por
        INNER JOIN secretarias s ON s.id_usuario = u.id_usuario
        WHERE s.id_secretaria = ?
          AND c.id_centro = ?
          AND conf.tipo_confirmacion = 'llamada'
          AND conf.fecha_creacion >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
        `,
        [idSecretaria, idCentro]
      ),
    ];

    const results = await Promise.all(queries);

    const totalMes = Number(results[0][0][0]?.total || 0);
    const confirmadasMes = Number(results[1][0][0]?.total || 0);
    const noConfirmadasMes = Number(results[2][0][0]?.total || 0);
    const llamadasHoy = Number(results[3][0][0]?.total || 0);
    const llamadasAyer = Number(results[4][0][0]?.total || 0);
    const llamadas7dias = Number(results[5][0][0]?.total || 0);

    const efectividad =
      totalMes > 0 ? Math.round((confirmadasMes * 100) / totalMes) : 0;

    return {
      total_mes: totalMes,
      confirmadas_mes: confirmadasMes,
      no_confirmadas_mes: noConfirmadasMes,
      efectividad_mes: efectividad,
      llamadas_hoy: llamadasHoy,
      llamadas_ayer: llamadasAyer,
      llamadas_ultimos_7_dias: llamadas7dias,
    };
  } catch (error) {
    console.error("Error al obtener resumen de llamadas:", error);
    throw error;
  }
}

/**
 * Llamadas recientes realizadas por la secretaria (últimas 50)
 */
async function obtenerLlamadasRecientes(
  idSecretaria: number,
  idCentro: number
): Promise<LlamadaReciente[]> {
  try {
    const [rows] = await pool.query<RowDataPacket[]>(
      `
      SELECT 
        conf.id_confirmacion,
        conf.id_cita,
        conf.fecha_creacion       AS fecha_llamada,
        conf.fecha_envio_solicitud,
        conf.fecha_confirmacion,
        conf.confirmada,
        conf.respuesta,
        conf.canal_respuesta,
        conf.observaciones,

        c.fecha_hora_inicio,
        c.estado                  AS estado_cita,
        c.motivo,

        p.id_paciente,
        p.nombre                  AS p_nombre,
        p.apellido_paterno        AS p_apellido_paterno,
        p.apellido_materno        AS p_apellido_materno,
        p.telefono,
        p.celular,
        p.whatsapp,
        p.foto_url,
        p.es_vip,
        p.clasificacion_riesgo,

        u.id_usuario              AS sec_id_usuario,
        u.nombre                  AS sec_nombre,
        u.apellido_paterno        AS sec_apellido_paterno,
        u.apellido_materno        AS sec_apellido_materno

      FROM confirmaciones conf
      INNER JOIN citas c
        ON c.id_cita = conf.id_cita
      INNER JOIN pacientes p
        ON p.id_paciente = c.id_paciente
      LEFT JOIN usuarios u
        ON u.id_usuario = conf.confirmado_por
      INNER JOIN secretarias s
        ON s.id_usuario = u.id_usuario
      WHERE s.id_secretaria = ?
        AND c.id_centro = ?
        AND conf.tipo_confirmacion = 'llamada'
      ORDER BY conf.fecha_creacion DESC
      LIMIT 50
      `,
      [idSecretaria, idCentro]
    );

    return rows.map((row) => {
      const nombrePaciente = `${row.p_nombre} ${row.p_apellido_paterno} ${
        row.p_apellido_materno || ""
      }`.trim();

      const nombreSecretaria =
        row.sec_nombre && row.sec_apellido_paterno
          ? `${row.sec_nombre} ${row.sec_apellido_paterno} ${
              row.sec_apellido_materno || ""
            }`.trim()
          : null;

      const confirmadaRaw = row.confirmada;
      const confirmada =
        confirmadaRaw === null || confirmadaRaw === undefined
          ? null
          : Number(confirmadaRaw) === 1;

      return {
        id_confirmacion: Number(row.id_confirmacion),
        id_cita: Number(row.id_cita),
        fecha_llamada: toIsoString(row.fecha_llamada),
        fecha_envio_solicitud: toIsoString(row.fecha_envio_solicitud),
        fecha_confirmacion: toIsoNullable(row.fecha_confirmacion),
        confirmada,
        respuesta: row.respuesta || null,
        canal_respuesta: row.canal_respuesta || null,
        observaciones: row.observaciones || null,
        paciente: {
          id_paciente: Number(row.id_paciente),
          nombre_completo: nombrePaciente,
          telefono: row.telefono || null,
          celular: row.celular || null,
          whatsapp: row.whatsapp || null,
          foto_url: row.foto_url || null,
          es_vip: !!row.es_vip,
          clasificacion_riesgo: row.clasificacion_riesgo || null,
        },
        cita: {
          fecha_hora_inicio: toIsoString(row.fecha_hora_inicio),
          estado: row.estado_cita,
          motivo: row.motivo || null,
        },
        secretaria: {
          id_usuario: row.sec_id_usuario ? Number(row.sec_id_usuario) : null,
          nombre_completo: nombreSecretaria,
        },
      } as LlamadaReciente;
    });
  } catch (error) {
    console.error("Error al obtener llamadas recientes:", error);
    throw error;
  }
}

/**
 * Citas que requieren llamada (pendientes de confirmación)
 * - Estado = programada
 * - futuro
 * - no confirmada por paciente
 * - sin llamada confirmada previa tipo 'llamada'
 */
async function obtenerLlamadasPendientes(
  idCentro: number
): Promise<LlamadaPendiente[]> {
  try {
    const [rows] = await pool.query<RowDataPacket[]>(
      `
      SELECT 
        c.id_cita,
        c.fecha_hora_inicio,
        c.estado          AS estado_cita,
        c.motivo,

        p.id_paciente,
        p.nombre          AS p_nombre,
        p.apellido_paterno,
        p.apellido_materno,
        p.telefono,
        p.celular,
        p.whatsapp,
        p.preferencia_contacto,
        p.es_vip,
        p.clasificacion_riesgo,

        ult.ultima_llamada_fecha,
        ult.ultima_confirmada

      FROM citas c
      INNER JOIN pacientes p
        ON p.id_paciente = c.id_paciente
      LEFT JOIN (
        SELECT 
          id_cita,
          MAX(fecha_creacion) AS ultima_llamada_fecha,
          MAX(confirmada)     AS ultima_confirmada
        FROM confirmaciones
        WHERE tipo_confirmacion = 'llamada'
        GROUP BY id_cita
      ) ult
        ON ult.id_cita = c.id_cita
      WHERE c.id_centro = ?
        AND c.estado = 'programada'
        AND c.fecha_hora_inicio > NOW()
        AND c.confirmado_por_paciente = 0
        AND (ult.ultima_confirmada IS NULL OR ult.ultima_confirmada = 0)
      ORDER BY c.fecha_hora_inicio ASC
      LIMIT 50
      `,
      [idCentro]
    );

    return rows.map((row) => {
      const nombrePaciente = `${row.p_nombre} ${row.apellido_paterno} ${
        row.apellido_materno || ""
      }`.trim();

      const tienePrevias = !!row.ultima_llamada_fecha;

      return {
        id_cita: Number(row.id_cita),
        fecha_hora_inicio: toIsoString(row.fecha_hora_inicio),
        estado_cita: row.estado_cita,
        motivo: row.motivo || null,
        paciente: {
          id_paciente: Number(row.id_paciente),
          nombre_completo: nombrePaciente,
          telefono: row.telefono || null,
          celular: row.celular || null,
          whatsapp: row.whatsapp || null,
          preferencia_contacto: row.preferencia_contacto || null,
          es_vip: !!row.es_vip,
          clasificacion_riesgo: row.clasificacion_riesgo || null,
        },
        tiene_llamadas_previas: tienePrevias,
        fecha_ultima_llamada: toIsoNullable(row.ultima_llamada_fecha),
      } as LlamadaPendiente;
    });
  } catch (error) {
    console.error("Error al obtener llamadas pendientes:", error);
    throw error;
  }
}

/**
 * Serie temporal de llamadas de los últimos 30 días
 */
async function obtenerSerieLlamadas(
  idSecretaria: number,
  idCentro: number
): Promise<PuntoSerieLlamadas[]> {
  try {
    const [rows] = await pool.query<RowDataPacket[]>(
      `
      SELECT 
        DATE(conf.fecha_creacion) AS fecha,
        COUNT(*) AS total,
        SUM(CASE WHEN conf.confirmada = 1 THEN 1 ELSE 0 END) AS confirmadas,
        SUM(
          CASE 
            WHEN conf.confirmada IS NULL OR conf.confirmada = 0 
              THEN 1 
            ELSE 0 
          END
        ) AS no_confirmadas
      FROM confirmaciones conf
      INNER JOIN citas c
        ON c.id_cita = conf.id_cita
      INNER JOIN usuarios u
        ON u.id_usuario = conf.confirmado_por
      INNER JOIN secretarias s
        ON s.id_usuario = u.id_usuario
      WHERE s.id_secretaria = ?
        AND c.id_centro = ?
        AND conf.tipo_confirmacion = 'llamada'
        AND conf.fecha_creacion >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
      GROUP BY DATE(conf.fecha_creacion)
      ORDER BY fecha ASC
      `,
      [idSecretaria, idCentro]
    );

    return rows.map((row) => {
      const fechaVal = row.fecha;
      const fechaStr =
        fechaVal instanceof Date
          ? fechaVal.toISOString().split("T")[0]
          : String(fechaVal);

      return {
        fecha: fechaStr,
        total: Number(row.total || 0),
        confirmadas: Number(row.confirmadas || 0),
        no_confirmadas: Number(row.no_confirmadas || 0),
      } as PuntoSerieLlamadas;
    });
  } catch (error) {
    console.error("Error al obtener serie de llamadas:", error);
    throw error;
  }
}

/**
 * Plantillas de mensajes relacionadas a llamadas (SMS / WhatsApp)
 */
async function obtenerPlantillasLlamadas(
  idCentro: number
): Promise<PlantillaMensajeLlamada[]> {
  try {
    const [rows] = await pool.query<RowDataPacket[]>(
      `
      SELECT
        pm.id_plantilla,
        pm.nombre,
        pm.tipo,
        pm.categoria,
        pm.descripcion,
        pm.es_html
      FROM plantillas_mensajes pm
      WHERE pm.id_centro = ?
        AND pm.tipo IN ('sms','whatsapp')
        AND pm.activo = 1
      ORDER BY pm.categoria, pm.nombre
      `,
      [idCentro]
    );

    return rows.map((row) => ({
      id_plantilla: Number(row.id_plantilla),
      nombre: row.nombre,
      tipo: row.tipo,
      categoria: row.categoria,
      descripcion: row.descripcion || null,
      es_html: !!row.es_html,
    }));
  } catch (error) {
    console.error("Error al obtener plantillas de llamadas:", error);
    throw error;
  }
}

// ========================================
// HANDLER GET - API PRINCIPAL LLAMADAS
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

    // Verificar sesión
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

    // Información del centro médico (para mostrar en el frontend)
    const centroMedico = await obtenerCentroMedico(secretaria.id_centro);

    if (!centroMedico) {
      return NextResponse.json(
        { success: false, error: "Centro médico no encontrado" },
        { status: 404 }
      );
    }

    // Actualizar última actividad de la sesión
    await pool.query(
      `UPDATE sesiones_usuarios 
       SET ultima_actividad = NOW() 
       WHERE token = ?`,
      [sessionToken]
    );

    // Cargar todo en paralelo
    const [
      resumen,
      llamadasRecientes,
      llamadasPendientes,
      serieLlamadas,
      plantillas,
    ] = await Promise.all([
      obtenerResumenLlamadas(secretaria.id_secretaria, secretaria.id_centro),
      obtenerLlamadasRecientes(secretaria.id_secretaria, secretaria.id_centro),
      obtenerLlamadasPendientes(secretaria.id_centro),
      obtenerSerieLlamadas(secretaria.id_secretaria, secretaria.id_centro),
      obtenerPlantillasLlamadas(secretaria.id_centro),
    ]);

    return NextResponse.json(
      {
        success: true,
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
        resumen_llamadas: resumen,
        llamadas_recientes: llamadasRecientes,
        llamadas_pendientes: llamadasPendientes,
        serie_llamadas: serieLlamadas,
        plantillas_mensajes: plantillas,
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("❌ Error en GET /api/secretaria/llamadas:", error);

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
