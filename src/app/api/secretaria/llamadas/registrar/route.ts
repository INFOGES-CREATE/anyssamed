// app/api/secretaria/llamadas/registrar/route.ts
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { RowDataPacket, ResultSetHeader } from "mysql2";

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

interface RegistrarLlamadaPayload {
  id_cita: number;
  confirmada?: boolean | null;
  respuesta?: string | null;
  canal_respuesta?: string | null;
  observaciones?: string | null;
}

interface LlamadaSimple {
  id_confirmacion: number;
  id_cita: number;
  tipo_confirmacion: string;
  fecha_envio_solicitud: string;
  fecha_confirmacion: string | null;
  confirmada: boolean | null;
  respuesta: string | null;
  canal_respuesta: string | null;
  observaciones: string | null;
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
// HANDLER POST - REGISTRAR LLAMADA
// ========================================

export async function POST(request: NextRequest) {
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

    // Actualizar última actividad
    await pool.query(
      `UPDATE sesiones_usuarios SET ultima_actividad = NOW() WHERE token = ?`,
      [sessionToken]
    );

    // Leer payload
    let payload: RegistrarLlamadaPayload;
    try {
      payload = await request.json();
    } catch (e) {
      return NextResponse.json(
        { success: false, error: "JSON inválido" },
        { status: 400 }
      );
    }

    if (!payload.id_cita || isNaN(Number(payload.id_cita))) {
      return NextResponse.json(
        { success: false, error: "id_cita es obligatorio y debe ser numérico" },
        { status: 400 }
      );
    }

    const idCita = Number(payload.id_cita);

    // Validar que la cita exista y pertenezca al centro de la secretaria
    const [citaRows] = await pool.query<RowDataPacket[]>(
      `
      SELECT 
        c.id_cita,
        c.id_centro,
        c.estado,
        c.confirmado_por_paciente,
        c.fecha_confirmacion
      FROM citas c
      WHERE c.id_cita = ?
        AND c.id_centro = ?
      LIMIT 1
      `,
      [idCita, secretaria.id_centro]
    );

    if (citaRows.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error:
            "La cita no existe o no pertenece a tu centro. No se puede registrar la llamada.",
        },
        { status: 404 }
      );
    }

    const cita = citaRows[0];

    // Normalizar confirmada
    const confirmadaVal =
      typeof payload.confirmada === "boolean" ? payload.confirmada : null;
    const confirmadaDb =
      confirmadaVal === null ? null : confirmadaVal ? 1 : 0;
    const fechaConfirmacion = confirmadaVal ? new Date() : null;

    const canal =
      (payload.canal_respuesta && payload.canal_respuesta.trim()) || "telefono";

    // Insertar en confirmaciones como llamada
    const [insertRes] = await pool.query<ResultSetHeader>(
      `
      INSERT INTO confirmaciones (
        id_cita,
        tipo_confirmacion,
        fecha_envio_solicitud,
        fecha_confirmacion,
        confirmada,
        respuesta,
        canal_respuesta,
        confirmado_por,
        observaciones
      )
      VALUES (
        ?,               -- id_cita
        'llamada',       -- tipo_confirmacion
        NOW(),           -- fecha_envio_solicitud
        ?,               -- fecha_confirmacion
        ?,               -- confirmada
        ?,               -- respuesta
        ?,               -- canal_respuesta
        ?,               -- confirmado_por
        ?                -- observaciones
      )
      `,
      [
        idCita,
        fechaConfirmacion,
        confirmadaDb,
        payload.respuesta ?? null,
        canal,
        idUsuario,
        payload.observaciones ?? null,
      ]
    );

    const idConfirmacion = insertRes.insertId;

    // Si la llamada terminó con confirmación positiva, actualizamos la cita + historial
    if (confirmadaVal === true) {
      // Actualizar cita
      await pool.query(
        `
        UPDATE citas
        SET 
          confirmado_por_paciente = 1,
          fecha_confirmacion = COALESCE(fecha_confirmacion, ?),
          estado = CASE 
            WHEN estado = 'programada' THEN 'confirmada'
            ELSE estado
          END
        WHERE id_cita = ?
        `,
        [fechaConfirmacion, idCita]
      );

      // Registrar en historial_cambios_citas
      const descripcionCambio = JSON.stringify({
        tipo: "llamada",
        confirmada: true,
        respuesta: payload.respuesta ?? null,
        canal_respuesta: canal,
      });

      const ipAddress =
        (request.headers.get("x-forwarded-for") || "").split(",")[0] || null;

      await pool.query(
        `
        INSERT INTO historial_cambios_citas (
          id_cita,
          id_usuario,
          campo_modificado,
          valor_anterior,
          valor_nuevo,
          tipo_cambio,
          observaciones,
          ip_address
        )
        VALUES (
          ?,                -- id_cita
          ?,                -- id_usuario
          'confirmacion_llamada', -- campo_modificado
          NULL,             -- valor_anterior
          ?,                -- valor_nuevo (JSON)
          'confirmacion',   -- tipo_cambio
          ?,                -- observaciones
          ?                 -- ip_address
        )
        `,
        [
          idCita,
          idUsuario,
          descripcionCambio,
          payload.observaciones ?? null,
          ipAddress,
        ]
      );
    }

    // Recuperar la llamada recién creada (forma simple para el front)
    const [llamadaRows] = await pool.query<RowDataPacket[]>(
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
        conf.observaciones
      FROM confirmaciones conf
      INNER JOIN citas c
        ON c.id_cita = conf.id_cita
      WHERE conf.id_confirmacion = ?
        AND c.id_centro = ?
      LIMIT 1
      `,
      [idConfirmacion, secretaria.id_centro]
    );

    if (llamadaRows.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error:
            "La llamada fue insertada pero no se pudo recuperar el registro.",
        },
        { status: 500 }
      );
    }

    const lr = llamadaRows[0];

    const llamada: LlamadaSimple = {
      id_confirmacion: Number(lr.id_confirmacion),
      id_cita: Number(lr.id_cita),
      tipo_confirmacion: lr.tipo_confirmacion,
      fecha_envio_solicitud: toIsoString(lr.fecha_envio_solicitud),
      fecha_confirmacion: toIsoNullable(lr.fecha_confirmacion),
      confirmada: mapConfirmada(lr.confirmada),
      respuesta: lr.respuesta || null,
      canal_respuesta: lr.canal_respuesta || null,
      observaciones: lr.observaciones || null,
    };

    // Estado actual de la cita
    const [citaEstadoRows] = await pool.query<RowDataPacket[]>(
      `
      SELECT 
        c.estado,
        c.confirmado_por_paciente,
        c.fecha_confirmacion
      FROM citas c
      WHERE c.id_cita = ?
      LIMIT 1
      `,
      [idCita]
    );

    const citaActualizada =
      citaEstadoRows.length > 0
        ? {
            estado: citaEstadoRows[0].estado,
            confirmado_por_paciente: !!citaEstadoRows[0].confirmado_por_paciente,
            fecha_confirmacion: toIsoNullable(
              citaEstadoRows[0].fecha_confirmacion
            ),
          }
        : null;

    return NextResponse.json(
      {
        success: true,
        llamada,
        cita_actualizada: citaActualizada,
        timestamp: new Date().toISOString(),
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("❌ Error en POST /api/secretaria/llamadas/registrar:", error);

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
// OTROS MÉTODOS NO PERMITIDOS
// ========================================

export async function GET() {
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
