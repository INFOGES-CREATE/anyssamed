// app/api/secretaria/llamadas/[id]/route.ts
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

interface DetalleLlamadaAPI {
  id_confirmacion: number;
  tipo_confirmacion: string;
  fecha_envio_solicitud: string;
  fecha_confirmacion: string | null;
  confirmada: boolean | null;
  respuesta: string | null;
  canal_respuesta: string | null;
  observaciones: string | null;
  creada_en: string;
  modificada_en: string;

  cita: {
    id_cita: number;
    fecha_hora_inicio: string;
    fecha_hora_fin: string;
    duracion_minutos: number;
    tipo_cita: string;
    estado: string;
    prioridad: string;
    origen: string;
    motivo: string | null;
    notas: string | null;
    pagada: boolean;
    monto: string | null;
  };

  paciente: {
    id_paciente: number;
    nombre_completo: string;
    rut: string;
    telefono: string | null;
    celular: string | null;
    whatsapp: string | null;
    email: string | null;
    fecha_nacimiento: string;
    genero: string;
    es_vip: boolean;
    clasificacion_riesgo: string | null;
    preferencia_contacto: string;
    foto_url: string | null;
  };

  profesional: {
    id_profesional: number;
    titulo_profesional: string;
    tipo_profesional: string;
    especialidad_principal: string | null;
    calificacion_promedio: number;
    numero_opiniones: number;
  } | null;

  centro: {
    id_centro: number;
    nombre: string;
    ciudad: string;
    region: string | null;
    telefono: string;
    email: string;
  };

  sucursal: {
    id_sucursal: number;
    nombre: string;
    ciudad: string;
    region: string;
    telefono: string;
  } | null;

  registrada_por: {
    id_usuario: number | null;
    nombre_completo: string | null;
  };

  otras_confirmaciones: {
    id_confirmacion: number;
    tipo_confirmacion: string;
    fecha_envio_solicitud: string;
    fecha_confirmacion: string | null;
    confirmada: boolean | null;
    canal_respuesta: string | null;
  }[];

  recordatorios: {
    id_recordatorio: number;
    tipo: string;
    estado: string;
    fecha_programada: string;
    fecha_envio: string | null;
    destinatario: string;
    intentos: number;
    resultado_envio: string | null;
  }[];

  historial_cita: {
    id_cambio: number;
    campo_modificado: string;
    valor_anterior: string | null;
    valor_nuevo: string | null;
    tipo_cambio: string;
    observaciones: string | null;
    fecha_cambio: string;
    id_usuario: number | null;
  }[];
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
        AND s.estado IN ('activo','suspendido')
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

function mapConfirmada(raw: any): boolean | null {
  if (raw === null || raw === undefined) return null;
  const n = Number(raw);
  if (isNaN(n)) return null;
  return n === 1;
}

// ========================================
// HANDLER GET DETALLE
// ========================================

export async function GET(
  request: NextRequest,
  context: { params: { id: string } }
) {
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

    // Verificar secretaria
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

    const idParam = context.params.id;
    const idConfirmacion = Number(idParam);

    if (!idConfirmacion || isNaN(idConfirmacion)) {
      return NextResponse.json(
        { success: false, error: "ID de llamada inválido" },
        { status: 400 }
      );
    }

    // Actualizar última actividad
    await pool.query(
      `UPDATE sesiones_usuarios SET ultima_actividad = NOW() WHERE token = ?`,
      [sessionToken]
    );

    // 1) Llamada + cita + paciente + profesional + centro + sucursal + usuario que registró
    const [rows] = await pool.query<RowDataPacket[]>(
      `
      SELECT 
        conf.id_confirmacion,
        conf.id_cita,
        conf.tipo_confirmacion,
        conf.fecha_envio_solicitud,
        conf.fecha_confirmacion,
        conf.confirmada,
        conf.respuesta,
        conf.canal_respuesta,
        conf.observaciones,
        conf.fecha_creacion      AS conf_fecha_creacion,
        conf.fecha_modificacion  AS conf_fecha_modificacion,

        c.id_cita                AS c_id_cita,
        c.fecha_hora_inicio,
        c.fecha_hora_fin,
        c.duracion_minutos,
        c.tipo_cita,
        c.estado                 AS estado_cita,
        c.prioridad,
        c.origen,
        c.motivo,
        c.notas,
        c.pagada,
        c.monto,
        c.id_centro              AS c_id_centro,
        c.id_sucursal            AS c_id_sucursal,

        p.id_paciente,
        p.rut,
        p.nombre                 AS p_nombre,
        p.apellido_paterno       AS p_apellido_paterno,
        p.apellido_materno       AS p_apellido_materno,
        p.email,
        p.telefono,
        p.celular,
        p.whatsapp,
        p.fecha_nacimiento,
        p.genero,
        p.es_vip,
        p.clasificacion_riesgo,
        p.preferencia_contacto,
        p.foto_url               AS paciente_foto_url,

        pr.id_profesional,
        pr.titulo_profesional,
        pr.tipo_profesional,
        pr.especialidad_principal,
        pr.calificacion_promedio,
        pr.numero_opiniones,

        cm.id_centro,
        cm.nombre                AS centro_nombre,
        cm.ciudad                AS centro_ciudad,
        cm.region                AS centro_region,
        cm.telefono_principal    AS centro_telefono,
        cm.email_contacto        AS centro_email,

        suc.id_sucursal,
        suc.nombre               AS sucursal_nombre,
        suc.ciudad               AS sucursal_ciudad,
        suc.region               AS sucursal_region,
        suc.telefono             AS sucursal_telefono,

        u_conf.id_usuario        AS usuario_registra_id,
        u_conf.nombre            AS usuario_registra_nombre,
        u_conf.apellido_paterno  AS usuario_registra_apellido_paterno,
        u_conf.apellido_materno  AS usuario_registra_apellido_materno

      FROM confirmaciones conf
      INNER JOIN citas c
        ON c.id_cita = conf.id_cita
      INNER JOIN pacientes p
        ON p.id_paciente = c.id_paciente
      LEFT JOIN profesionales_salud pr
        ON pr.id_profesional = c.id_profesional
      INNER JOIN centros_medicos cm
        ON cm.id_centro = c.id_centro
      LEFT JOIN sucursales suc
        ON suc.id_sucursal = c.id_sucursal
      LEFT JOIN usuarios u_conf
        ON u_conf.id_usuario = conf.confirmado_por
      WHERE conf.id_confirmacion = ?
        AND c.id_centro = ?
        AND conf.tipo_confirmacion = 'llamada'
      LIMIT 1
      `,
      [idConfirmacion, secretaria.id_centro]
    );

    if (rows.length === 0) {
      return NextResponse.json(
        { success: false, error: "Llamada no encontrada o sin acceso" },
        { status: 404 }
      );
    }

    const row = rows[0];

    const nombrePaciente = `${row.p_nombre} ${row.p_apellido_paterno} ${
      row.p_apellido_materno || ""
    }`.trim();

    const nombreSecretaria =
      row.usuario_registra_nombre && row.usuario_registra_apellido_paterno
        ? `${row.usuario_registra_nombre} ${
            row.usuario_registra_apellido_paterno || ""
          } ${row.usuario_registra_apellido_materno || ""}`.trim()
        : null;

    const confirmada = mapConfirmada(row.confirmada);

    const detalleBase: DetalleLlamadaAPI = {
      id_confirmacion: Number(row.id_confirmacion),
      tipo_confirmacion: row.tipo_confirmacion,
      fecha_envio_solicitud: toIsoString(row.fecha_envio_solicitud),
      fecha_confirmacion: toIsoNullable(row.fecha_confirmacion),
      confirmada,
      respuesta: row.respuesta || null,
      canal_respuesta: row.canal_respuesta || null,
      observaciones: row.observaciones || null,
      creada_en: toIsoString(row.conf_fecha_creacion),
      modificada_en: toIsoString(row.conf_fecha_modificacion),

      cita: {
        id_cita: Number(row.c_id_cita),
        fecha_hora_inicio: toIsoString(row.fecha_hora_inicio),
        fecha_hora_fin: toIsoString(row.fecha_hora_fin),
        duracion_minutos: Number(row.duracion_minutos || 0),
        tipo_cita: row.tipo_cita,
        estado: row.estado_cita,
        prioridad: row.prioridad,
        origen: row.origen,
        motivo: row.motivo || null,
        notas: row.notas || null,
        pagada: !!row.pagada,
        monto: row.monto !== null && row.monto !== undefined ? String(row.monto) : null,
      },

      paciente: {
        id_paciente: Number(row.id_paciente),
        nombre_completo: nombrePaciente,
        rut: row.rut,
        telefono: row.telefono || null,
        celular: row.celular || null,
        whatsapp: row.whatsapp || null,
        email: row.email || null,
        fecha_nacimiento: toIsoString(row.fecha_nacimiento),
        genero: row.genero,
        es_vip: !!row.es_vip,
        clasificacion_riesgo: row.clasificacion_riesgo || null,
        preferencia_contacto: row.preferencia_contacto || "telefono",
        foto_url: row.paciente_foto_url || null,
      },

      profesional: row.id_profesional
        ? {
            id_profesional: Number(row.id_profesional),
            titulo_profesional: row.titulo_profesional,
            tipo_profesional: row.tipo_profesional,
            especialidad_principal: row.especialidad_principal || null,
            calificacion_promedio: Number(row.calificacion_promedio || 0),
            numero_opiniones: Number(row.numero_opiniones || 0),
          }
        : null,

      centro: {
        id_centro: Number(row.id_centro),
        nombre: row.centro_nombre,
        ciudad: row.centro_ciudad,
        region: row.centro_region || null,
        telefono: row.centro_telefono,
        email: row.centro_email,
      },

      sucursal: row.id_sucursal
        ? {
            id_sucursal: Number(row.id_sucursal),
            nombre: row.sucursal_nombre,
            ciudad: row.sucursal_ciudad,
            region: row.sucursal_region,
            telefono: row.sucursal_telefono,
          }
        : null,

      registrada_por: {
        id_usuario: row.usuario_registra_id
          ? Number(row.usuario_registra_id)
          : null,
        nombre_completo: nombreSecretaria,
      },

      otras_confirmaciones: [],
      recordatorios: [],
      historial_cita: [],
    };

    const idCita = Number(row.c_id_cita);
    const idCentro = Number(row.c_id_centro);

    // 2) Otras confirmaciones, recordatorios e historial en paralelo
    const [otrasConfRes, recordatoriosRes, historialRes] = await Promise.all([
      pool.query<RowDataPacket[]>(
        `
        SELECT 
          conf2.id_confirmacion,
          conf2.tipo_confirmacion,
          conf2.fecha_envio_solicitud,
          conf2.fecha_confirmacion,
          conf2.confirmada,
          conf2.canal_respuesta
        FROM confirmaciones conf2
        INNER JOIN citas c2
          ON c2.id_cita = conf2.id_cita
        WHERE conf2.id_cita = ?
          AND c2.id_centro = ?
        ORDER BY conf2.fecha_creacion ASC
        `,
        [idCita, idCentro]
      ),
      pool.query<RowDataPacket[]>(
        `
        SELECT
          r.id_recordatorio,
          r.tipo,
          r.estado,
          r.fecha_programada,
          r.fecha_envio,
          r.destinatario,
          r.intentos,
          r.resultado_envio
        FROM recordatorios r
        WHERE r.id_cita = ?
        ORDER BY r.fecha_programada ASC
        `,
        [idCita]
      ),
      pool.query<RowDataPacket[]>(
        `
        SELECT
          h.id_cambio,
          h.campo_modificado,
          h.valor_anterior,
          h.valor_nuevo,
          h.tipo_cambio,
          h.observaciones,
          h.fecha_cambio,
          h.id_usuario
        FROM historial_cambios_citas h
        WHERE h.id_cita = ?
        ORDER BY h.fecha_cambio DESC
        LIMIT 20
        `,
        [idCita]
      ),
    ]);

    const otrasConfRows = otrasConfRes[0];
    const recordatoriosRows = recordatoriosRes[0];
    const historialRows = historialRes[0];

    detalleBase.otras_confirmaciones = otrasConfRows.map((r) => ({
      id_confirmacion: Number(r.id_confirmacion),
      tipo_confirmacion: r.tipo_confirmacion,
      fecha_envio_solicitud: toIsoString(r.fecha_envio_solicitud),
      fecha_confirmacion: toIsoNullable(r.fecha_confirmacion),
      confirmada: mapConfirmada(r.confirmada),
      canal_respuesta: r.canal_respuesta || null,
    }));

    detalleBase.recordatorios = recordatoriosRows.map((r) => ({
      id_recordatorio: Number(r.id_recordatorio),
      tipo: r.tipo,
      estado: r.estado,
      fecha_programada: toIsoString(r.fecha_programada),
      fecha_envio: toIsoNullable(r.fecha_envio),
      destinatario: r.destinatario,
      intentos: Number(r.intentos || 0),
      resultado_envio: r.resultado_envio || null,
    }));

    detalleBase.historial_cita = historialRows.map((r) => ({
      id_cambio: Number(r.id_cambio),
      campo_modificado: r.campo_modificado,
      valor_anterior: r.valor_anterior || null,
      valor_nuevo: r.valor_nuevo || null,
      tipo_cambio: r.tipo_cambio,
      observaciones: r.observaciones || null,
      fecha_cambio: toIsoString(r.fecha_cambio),
      id_usuario: r.id_usuario ? Number(r.id_usuario) : null,
    }));

    return NextResponse.json(
      {
        success: true,
        llamada: detalleBase,
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("❌ Error en GET /api/secretaria/llamadas/[id]:", error);

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
