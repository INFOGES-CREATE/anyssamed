// app/api/mensajes/enviar/route.ts
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { RowDataPacket, ResultSetHeader } from "mysql2";

// ========================================
// TIPOS
// ========================================

type TipoMensajeBD =
  | "texto"
  | "imagen"
  | "archivo"
  | "audio"
  | "video"
  | "ubicacion"
  | "sistema";

interface EnviarMensajeBody {
  id_usuario_receptor: number;
  contenido: string;
  tipo_mensaje?: TipoMensajeBD;
  id_mensaje_respuesta?: number;
  metadata?: Record<string, any>;
}

interface MensajeResponse {
  id_mensaje: number;
  id_usuario_emisor: number;
  id_usuario_receptor: number;
  contenido: string;
  fecha_envio: string;
  tipo_mensaje: TipoMensajeBD;
  id_conversacion: string;
  id_mensaje_respuesta: number | null;
  metadata: Record<string, any> | null;
  archivos_adjuntos: boolean;
  estado_envio: string;
  leido: boolean;
  fecha_lectura: string | null;
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

const MAX_CONTENIDO_LENGTH = 5000;
const MAX_METADATA_SIZE = 1_000_000; // ~1MB

// ========================================
// HELPER: Obtener Token de Sesión
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

// ========================================
// HELPER: Obtener Usuario Autenticado
// ========================================

async function obtenerUsuarioAutenticado(
  token: string
): Promise<{ id_usuario: number; rol: string } | null> {
  try {
    const [sesiones] = await pool.query<RowDataPacket[]>(
      `
      SELECT 
        su.id_usuario,
        su.rol_en_sesion,
        u.estado
      FROM sesiones_usuarios su
      INNER JOIN usuarios u ON su.id_usuario = u.id_usuario
      WHERE su.token = ?
        AND su.activa = 1
        AND su.fecha_expiracion > NOW()
        AND u.estado = 'activo'
      LIMIT 1
      `,
      [token]
    );

    if (sesiones.length === 0) {
      return null;
    }

    return {
      id_usuario: sesiones[0].id_usuario,
      rol: sesiones[0].rol_en_sesion || "usuario",
    };
  } catch (error) {
    console.error("❌ Error al obtener usuario:", error);
    throw error;
  }
}

// ========================================
// HELPER: Validar Permisos
// ========================================

async function validarPermisoEnviarMensaje(
  idUsuario: number,
  idReceptor: number
): Promise<boolean> {
  try {
    // Validar que el usuario no esté bloqueado
    const [usuario] = await pool.query<RowDataPacket[]>(
      `
      SELECT 
        u.estado,
        u.bloqueado_hasta
      FROM usuarios u
      WHERE u.id_usuario = ?
      LIMIT 1
      `,
      [idUsuario]
    );

    if (usuario.length === 0 || usuario[0].estado !== "activo") {
      return false;
    }

    if (
      usuario[0].bloqueado_hasta &&
      new Date(usuario[0].bloqueado_hasta) > new Date()
    ) {
      return false;
    }

    // Validar que el receptor existe y está activo
    const [receptor] = await pool.query<RowDataPacket[]>(
      `
      SELECT u.id_usuario
      FROM usuarios u
      WHERE u.id_usuario = ? AND u.estado = 'activo'
      LIMIT 1
      `,
      [idReceptor]
    );

    return receptor.length > 0;
  } catch (error) {
    console.error("❌ Error al validar permisos:", error);
    return false;
  }
}

// ========================================
// HELPER: Generar ID de Conversación
// ========================================

function generarIdConversacion(idUsuario1: number, idUsuario2: number): string {
  const ids = [idUsuario1, idUsuario2].sort((a, b) => a - b);
  return `conv_${ids[0]}_${ids[1]}`;
}

// ========================================
// HELPER: Validar Contenido (según FRONT)
// ========================================

function validarContenido(
  contenido: string,
  tipo: TipoMensajeBD,
  tieneArchivos: boolean
): { valido: boolean; error?: string } {
  const texto = (contenido ?? "").toString();

  if (!tieneArchivos) {
    if (!texto.trim()) {
      return { valido: false, error: "El contenido no puede estar vacío" };
    }
  }

  if (texto.length > MAX_CONTENIDO_LENGTH) {
    return {
      valido: false,
      error: `El contenido no puede exceder ${MAX_CONTENIDO_LENGTH} caracteres`,
    };
  }

  return { valido: true };
}

// ========================================
// HELPER: Parsear request según tu FRONT (FormData)
// ========================================

async function parsearRequestMensaje(request: NextRequest): Promise<{
  body: EnviarMensajeBody;
  tieneArchivos: boolean;
}> {
  const contentType = request.headers.get("content-type") || "";

  if (contentType.includes("multipart/form-data")) {
    const form = await request.formData();

    const id_usuario_receptor = Number(form.get("id_usuario_receptor") || 0);
    const contenido = String(form.get("contenido") ?? "");
    const tipoRaw = (form.get("tipo_mensaje") as string) || "texto";
    const posibles: TipoMensajeBD[] = [
      "texto",
      "imagen",
      "archivo",
      "audio",
      "video",
      "ubicacion",
      "sistema",
    ];
    const tipo_mensaje: TipoMensajeBD = posibles.includes(
      tipoRaw as TipoMensajeBD
    )
      ? (tipoRaw as TipoMensajeBD)
      : "texto";

    const id_mensaje_respuesta = form.get("id_mensaje_respuesta")
      ? Number(form.get("id_mensaje_respuesta"))
      : undefined;

    // Ubicación (JSON en string)
    let ubicacion: any = null;
    const ubicacionStr = form.get("ubicacion");
    if (ubicacionStr) {
      try {
        ubicacion = JSON.parse(String(ubicacionStr));
      } catch {
        ubicacion = null;
      }
    }

    // Archivos adjuntos
    const archivos: File[] = [];
    for (const [key, value] of form.entries()) {
      if (key.startsWith("archivos[")) {
        if (
          value &&
          typeof value === "object" &&
          "arrayBuffer" in (value as any)
        ) {
          const file = value as File;
          if (file.size > 0) {
            archivos.push(file);
          }
        }
      }
    }

    const tieneArchivos = archivos.length > 0;

    const metadata: Record<string, any> = {};
    if (ubicacion) metadata.ubicacion = ubicacion;
    if (tieneArchivos) {
      metadata.tieneArchivos = true;
      metadata.cantidadArchivos = archivos.length;
      metadata.tiposArchivos = [
        ...new Set(archivos.map((f) => f.type || "desconocido")),
      ];
    }

    const body: EnviarMensajeBody = {
      id_usuario_receptor,
      contenido,
      tipo_mensaje,
      id_mensaje_respuesta,
      metadata: Object.keys(metadata).length > 0 ? metadata : undefined,
    };

    return { body, tieneArchivos };
  }

  // Fallback JSON
  const json = await request.json().catch(() => null);
  if (!json || typeof json !== "object") {
    throw new Error("JSON inválido");
  }

  const body: EnviarMensajeBody = {
    id_usuario_receptor: Number((json as any).id_usuario_receptor),
    contenido: String((json as any).contenido ?? ""),
    tipo_mensaje: ((json as any).tipo_mensaje as TipoMensajeBD) || "texto",
    id_mensaje_respuesta: (json as any).id_mensaje_respuesta
      ? Number((json as any).id_mensaje_respuesta)
      : undefined,
    metadata:
      (json as any).metadata && typeof (json as any).metadata === "object"
        ? ((json as any).metadata as Record<string, any>)
        : undefined,
  };

  const tieneArchivos =
    Array.isArray((json as any).archivos) &&
    (json as any).archivos.length > 0;

  return { body, tieneArchivos };
}

// ========================================
// HANDLER POST - Enviar Mensaje (optimizado)
// ========================================

export async function POST(request: NextRequest) {
  try {
    // 1. Obtener token
    const sessionToken = getSessionToken(request);
    if (!sessionToken) {
      return NextResponse.json(
        {
          success: false,
          error: "No hay sesión activa",
          code: "NO_SESSION",
        },
        { status: 401 }
      );
    }

    // 2. Usuario autenticado
    const usuarioAuth = await obtenerUsuarioAutenticado(sessionToken);
    if (!usuarioAuth) {
      return NextResponse.json(
        {
          success: false,
          error: "Sesión inválida o expirada",
          code: "INVALID_SESSION",
        },
        { status: 401 }
      );
    }

    // 3. Parseo ultra rápido del body
    let parsed;
    try {
      parsed = await parsearRequestMensaje(request);
    } catch (e) {
      console.error("❌ Error al parsear body:", e);
      return NextResponse.json(
        {
          success: false,
          error: "Body inválido (FormData/JSON)",
          code: "INVALID_BODY",
        },
        { status: 400 }
      );
    }

    const { body, tieneArchivos } = parsed;

    // 4. Validaciones mínimas
    if (
      !body.id_usuario_receptor ||
      Number.isNaN(body.id_usuario_receptor) ||
      body.id_usuario_receptor <= 0
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "id_usuario_receptor inválido",
          code: "MISSING_FIELDS",
        },
        { status: 400 }
      );
    }

    if (!body.contenido && !tieneArchivos) {
      return NextResponse.json(
        {
          success: false,
          error: "El contenido no puede estar vacío si no hay archivos",
          code: "MISSING_FIELDS",
        },
        { status: 400 }
      );
    }

    const tipoMensaje: TipoMensajeBD =
      (body.tipo_mensaje as TipoMensajeBD) || "texto";

    const validacion = validarContenido(
      body.contenido,
      tipoMensaje,
      tieneArchivos
    );
    if (!validacion.valido) {
      return NextResponse.json(
        {
          success: false,
          error: validacion.error,
          code: "INVALID_CONTENT",
        },
        { status: 400 }
      );
    }

    // 5. Metadata → string
    let metadataStr: string | null = null;
    if (body.metadata) {
      try {
        metadataStr = JSON.stringify(body.metadata);
      } catch {
        return NextResponse.json(
          {
            success: false,
            error: "Metadata no es JSON válido",
            code: "INVALID_METADATA",
          },
          { status: 400 }
        );
      }

      if (metadataStr.length > MAX_METADATA_SIZE) {
        return NextResponse.json(
          {
            success: false,
            error: "Metadata demasiado grande",
            code: "METADATA_TOO_LARGE",
          },
          { status: 400 }
        );
      }
    }

    // 6. Permisos
    const tienePermiso = await validarPermisoEnviarMensaje(
      usuarioAuth.id_usuario,
      body.id_usuario_receptor
    );

    if (!tienePermiso) {
      return NextResponse.json(
        {
          success: false,
          error: "No tienes permiso para enviar este mensaje",
          code: "PERMISSION_DENIED",
        },
        { status: 403 }
      );
    }

    // 7. Conversación
    const idConversacion = generarIdConversacion(
      usuarioAuth.id_usuario,
      body.id_usuario_receptor
    );

    // 8. INSERT ultra directo (sin transacción, una sola query fuerte)
    const fechaEnvio = new Date(); // para respuesta inmediata
    const [result] = await pool.query<ResultSetHeader>(
      `
      INSERT INTO mensajes_chat (
        id_usuario_emisor,
        id_usuario_receptor,
        contenido,
        fecha_envio,
        tipo_mensaje,
        id_conversacion,
        id_mensaje_respuesta,
        metadata,
        archivos_adjuntos,
        estado_envio
      ) VALUES (?, ?, ?, NOW(), ?, ?, ?, ?, ?, 'enviado')
      `,
      [
        usuarioAuth.id_usuario,
        body.id_usuario_receptor,
        body.contenido?.trim() ?? "",
        tipoMensaje,
        idConversacion,
        body.id_mensaje_respuesta || null,
        metadataStr,
        tieneArchivos ? 1 : 0,
      ]
    );

    const idMensaje = result.insertId;

    // 9. Notificación en segundo plano (no bloquea respuesta)
    (async () => {
      try {
        await pool.query(
          `
          INSERT INTO notificaciones (
            id_usuario_destino,
            id_usuario_origen,
            tipo,
            titulo,
            mensaje,
            fecha_generacion,
            leida,
            urgente,
            url_accion,
            tipo_objeto,
            id_objeto,
            estado
          ) VALUES (?, ?, 'mensaje_chat', 'Nuevo mensaje', ?, NOW(), 0, 0, '/mensajes', 'mensaje', ?, 'pendiente')
          `,
          [
            body.id_usuario_receptor,
            usuarioAuth.id_usuario,
            `Nuevo mensaje: ${body.contenido.substring(0, 50)}${
              body.contenido.length > 50 ? "..." : ""
            }`,
            idMensaje,
          ]
        );
      } catch (e) {
        console.error("⚠️ Error al crear notificación de mensaje:", e);
      }
    })();

    // 10. Construimos respuesta SIN otro SELECT
    const mensajeResponse: MensajeResponse = {
      id_mensaje: idMensaje,
      id_usuario_emisor: usuarioAuth.id_usuario,
      id_usuario_receptor: body.id_usuario_receptor,
      contenido: body.contenido?.trim() ?? "",
      // Formato compatible con lo que esperas (ajustable)
      fecha_envio: fechaEnvio.toISOString().slice(0, 19).replace("T", " "),
      tipo_mensaje: tipoMensaje,
      id_conversacion: idConversacion,
      id_mensaje_respuesta: body.id_mensaje_respuesta || null,
      metadata: body.metadata ?? null,
      archivos_adjuntos: !!tieneArchivos,
      estado_envio: "enviado",
      leido: false,
      fecha_lectura: null,
    };

    return NextResponse.json(
      {
        success: true,
        message: "Mensaje enviado exitosamente",
        data: mensajeResponse,
        timestamp: new Date().toISOString(),
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("❌ Error en POST /api/mensajes/enviar:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Error interno del servidor",
        code: "INTERNAL_ERROR",
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

export async function GET() {
  return NextResponse.json(
    { success: false, error: "Método no permitido", code: "METHOD_NOT_ALLOWED" },
    { status: 405 }
  );
}

export async function PUT() {
  return NextResponse.json(
    { success: false, error: "Método no permitido", code: "METHOD_NOT_ALLOWED" },
    { status: 405 }
  );
}

export async function DELETE() {
  return NextResponse.json(
    { success: false, error: "Método no permitido", code: "METHOD_NOT_ALLOWED" },
    { status: 405 }
  );
}
