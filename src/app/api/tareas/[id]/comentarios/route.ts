export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { RowDataPacket, ResultSetHeader } from "mysql2";

// ========================================
// TIPOS (ALINEADOS CON EL FRONT)
// ========================================

interface ComentarioAPI {
  id_comentario: number;
  id_tarea: number;
  contenido: string;
  fecha: string; // 👈 ahora se llama igual que en el front
  autor: {
    id_usuario: number;
    nombre_completo: string;
    rol: string;
    foto_perfil_url?: string | null;
  };
  es_del_responsable?: boolean;
}

// (mismas constantes que en /api/tareas)
const SESSION_COOKIE_CANDIDATES = [
  "session",
  "session_token",
  "medisalud_session",
  "auth_session",
  "next-auth.session-token",
  "__Secure-next-auth.session-token",
];

const ROL_LABEL_MAP: Record<string, string> = {
  tecnico: "Técnico",
  secretaria: "Secretaría",
  administrativo: "Administrativo",
  supervisor: "Supervisor",
  sistema: "Sistema",
};

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

async function verificarSesion(sessionToken: string) {
  const [sesiones] = await pool.query<RowDataPacket[]>(
    `
    SELECT 
      su.id_usuario,
      u.nombre,
      u.apellido_paterno
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
    return null;
  }

  return sesiones[0].id_usuario as number;
}

function mapComentarioRow(row: any): ComentarioAPI {
  // ================================
  // Construir nombre completo
  // ================================
  const nombreCompleto = `${row.nombre || ""} ${row.apellido_paterno || ""} ${
    row.apellido_materno || ""
  }`.trim();

  // ================================
  // Formato de fecha siempre válido
  // ================================
  let fechaIso = "1970-01-01T00:00:00.000Z";
  try {
    fechaIso =
      row.fecha_creacion instanceof Date
        ? row.fecha_creacion.toISOString()
        : new Date(row.fecha_creacion).toISOString();
  } catch {
    fechaIso = new Date().toISOString(); // fallback seguro
  }

  // ================================
  // RETURN EXACTO COMO TU FRONT LO PIDE
  // ================================
  return {
    id_comentario: Number(row.id_comentario),
    id_tarea: Number(row.id_tarea),
    contenido: row.contenido || "",

    // 👇 ESTE NOMBRE ES EXACTO AL QUE USA TU FRONT
    fecha: fechaIso,

    autor: {
      id_usuario: Number(row.id_usuario),

      // 👇 EXACTAMENTE como tu front espera
      nombre_completo: nombreCompleto || "Usuario desconocido",

      rol: row.rol_nombre || row.autor_rol || "sin rol",

      foto_perfil_url: row.foto_perfil_url || row.autor_foto || null,
    },

    // Responsable correcto (0 o 1 → boolean)
    es_del_responsable: Boolean(row.es_del_responsable),
  };
}

// ========================================
// GET  -> LISTAR COMENTARIOS DE UNA TAREA
// ========================================

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const sessionToken = getSessionToken(request);

    if (!sessionToken) {
      return NextResponse.json(
        { success: false, error: "No hay sesión activa" },
        { status: 401 }
      );
    }

    const idUsuario = await verificarSesion(sessionToken);

    if (!idUsuario) {
      return NextResponse.json(
        { success: false, error: "Sesión inválida o expirada" },
        { status: 401 }
      );
    }

    const tareaId = Number(params.id);
    if (!tareaId || Number.isNaN(tareaId)) {
      return NextResponse.json(
        { success: false, error: "ID de tarea no válido" },
        { status: 400 }
      );
    }

    const [rows] = await pool.query<RowDataPacket[]>(
      `
      SELECT
        c.id_comentario,
        c.id_tarea,
        c.id_usuario,

        -- BACKEND devuelve el contenido que tu front necesita
        c.comentario AS contenido,
        c.fecha_creacion,

        -- Datos crudos para mapComentarioRow
        u.nombre,
        u.apellido_paterno,
        u.apellido_materno,
        u.foto_perfil_url,
        r.nombre AS rol_nombre,

        CASE 
          WHEN t.id_responsable = c.id_usuario THEN 1
          ELSE 0
        END AS es_del_responsable

      FROM tareas_comentarios c
      INNER JOIN usuarios u ON u.id_usuario = c.id_usuario
      LEFT JOIN usuarios_roles ur ON ur.id_usuario = u.id_usuario
      LEFT JOIN roles r ON r.id_rol = ur.id_rol
      LEFT JOIN tareas t ON t.id_tarea = c.id_tarea

      WHERE c.id_tarea = ?
        AND c.estado = 'visible'
        AND c.eliminado = 0

      ORDER BY c.fecha_creacion DESC
      `,
      [tareaId]
    );

    const comentarios: ComentarioAPI[] = rows.map(mapComentarioRow);

    // Actualizar última actividad
    await pool.query(
      `UPDATE sesiones_usuarios SET ultima_actividad = NOW() WHERE token = ?`,
      [sessionToken]
    );

    return NextResponse.json(
      { success: true, comentarios, count: comentarios.length },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("❌ Error en GET /api/tareas/[id]/comentarios:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Error interno del servidor",
        message: error.message || "Error desconocido",
      },
      { status: 500 }
    );
  }
}

// ========================================
// POST -> AGREGAR COMENTARIO A UNA TAREA
// ========================================

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const sessionToken = getSessionToken(request);

    if (!sessionToken) {
      return NextResponse.json(
        { success: false, error: "No hay sesión activa" },
        { status: 401 }
      );
    }

    const idUsuario = await verificarSesion(sessionToken);

    if (!idUsuario) {
      return NextResponse.json(
        { success: false, error: "Sesión inválida o expirada" },
        { status: 401 }
      );
    }

    const tareaId = Number(params.id);
    if (!tareaId || Number.isNaN(tareaId)) {
      return NextResponse.json(
        { success: false, error: "ID de tarea no válido" },
        { status: 400 }
      );
    }

    const body = (await request.json().catch(() => ({}))) as any;
    const {
      contenido,
      tipo,
      id_comentario_padre,
      comentarioPadreId,
      privado,
      adjuntos,
    } = body;

    if (!contenido || !String(contenido).trim()) {
      return NextResponse.json(
        { success: false, error: "El contenido del comentario es obligatorio" },
        { status: 400 }
      );
    }

    // Normalizar campos premium opcionales
    const tipoValido: string[] = [
      "texto",
      "sistema",
      "evento",
      "archivo",
      "respuesta",
    ];
    const tipoFinal =
      tipo && tipoValido.includes(tipo) ? tipo : ("texto" as const);

    const padreId =
      typeof id_comentario_padre === "number"
        ? id_comentario_padre
        : typeof comentarioPadreId === "number"
        ? comentarioPadreId
        : null;

    const esPrivado = privado ? 1 : 0;

    let adjuntosJson: string | null = null;
    if (adjuntos !== undefined && adjuntos !== null) {
      try {
        adjuntosJson = JSON.stringify(adjuntos);
      } catch {
        adjuntosJson = null;
      }
    }

    // 1) Insertar comentario
    const [resultComentario] = await pool.query<ResultSetHeader>(
      `
      INSERT INTO tareas_comentarios (
        id_tarea,
        id_usuario,
        comentario,
        tipo,
        id_comentario_padre,
        adjuntos,
        privado,
        creado_por,
        estado,
        eliminado
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'visible', 0)
      `,
      [
        tareaId,
        idUsuario,
        String(contenido).trim(),
        tipoFinal,
        padreId,
        adjuntosJson,
        esPrivado,
        idUsuario,
      ]
    );

    const idComentario = resultComentario.insertId;

    // 2) Registrar en historial (opcional)
    try {
      await pool.query(
        `
        INSERT INTO tareas_historial (
          id_tarea,
          id_usuario,
          accion,
          detalle
        ) VALUES (?, ?, 'comentario', ?)
        `,
        [
          tareaId,
          idUsuario,
          JSON.stringify({
            comentario_id: idComentario,
            preview: String(contenido).trim().slice(0, 120),
          }),
        ]
      );
    } catch (e) {
      console.warn("No se pudo registrar en tareas_historial:", e);
    }

    // 3) Traer el comentario recién creado con datos del usuario
    const [rows] = await pool.query<RowDataPacket[]>(
      `
      SELECT
        c.id_comentario,
        c.id_tarea,
        c.id_usuario,
        c.comentario AS contenido,
        c.fecha_creacion,
        u.nombre,
        u.apellido_paterno,
        u.apellido_materno,
        u.foto_perfil_url,
        r.nombre AS rol_nombre,
        CASE 
          WHEN t.id_responsable = c.id_usuario THEN 1 
          ELSE 0 
        END AS es_del_responsable
      FROM tareas_comentarios c
      INNER JOIN usuarios u ON u.id_usuario = c.id_usuario
      LEFT JOIN usuarios_roles ur 
        ON ur.id_usuario = u.id_usuario
      LEFT JOIN roles r ON r.id_rol = ur.id_rol
      LEFT JOIN tareas t ON t.id_tarea = c.id_tarea
      WHERE c.id_comentario = ?
      LIMIT 1
      `,
      [idComentario]
    );

    const comentario =
      rows.length > 0 ? mapComentarioRow(rows[0]) : (null as any);

    // Actualizar última actividad
    await pool.query(
      `UPDATE sesiones_usuarios SET ultima_actividad = NOW() WHERE token = ?`,
      [sessionToken]
    );

    return NextResponse.json(
      {
        success: true,
        message: "Comentario agregado correctamente",
        comentario, // 👈 ya viene con { autor: { nombre_completo, ... }, fecha }
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("❌ Error en POST /api/tareas/[id]/comentarios:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Error al agregar comentario",
        message: error.message || "Error desconocido",
      },
      { status: 500 }
    );
  }
}

// ========================================
// MÉTODOS NO IMPLEMENTADOS
// ========================================

export async function PUT() {
  return NextResponse.json(
    { success: false, error: "Método PUT no implementado" },
    { status: 501 }
  );
}

export async function DELETE() {
  return NextResponse.json(
    { success: false, error: "Método DELETE no implementado" },
    { status: 501 }
  );
}
