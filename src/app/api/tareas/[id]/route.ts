// src/app/api/tareas/[id]/route.ts

export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { RowDataPacket, ResultSetHeader } from "mysql2";

// ========================================
// TIPOS
// ========================================

type TareaPrioridad = "baja" | "media" | "alta" | "critica";

type TareaEstadoDB =
  | "pendiente"
  | "en_progreso"
  | "en_revision"
  | "en_espera"
  | "rechazada"
  | "resuelta"
  | "cerrada";

type TareaEstadoUI =
  | "pendiente"
  | "en_progreso"
  | "en_revision"
  | "completada"
  | "rechazada"
  | "cancelada";

type TareaTipo = "tecnico" | "secretaria" | "administrativo" | "sistema";

interface TareaAPI {
  id_tarea: number;
  titulo: string;
  descripcion: string | null;
  prioridad: TareaPrioridad;
  estado: TareaEstadoUI;
  tipo: string;
  centro: {
    id_centro: number;
    nombre: string;
  } | null;
  sucursal: {
    id_sucursal: number;
    nombre: string;
  } | null;
  creador: {
    id_usuario: number;
    nombre_completo: string;
    rol: string;
  };
  responsable: {
    id_usuario: number;
    nombre_completo: string;
    rol: string;
  };
  fecha_creacion: string;
  fecha_limite: string | null;
  tags: string[];
  puede_editar: boolean;
  puede_cambiar_estado: boolean;
  puede_eliminar: boolean;
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

function mapEstadoDBToUI(estadoDb: string | null): TareaEstadoUI {
  const e = (estadoDb || "").toLowerCase();

  switch (e) {
    case "pendiente":
      return "pendiente";
    case "en_progreso":
      return "en_progreso";
    case "en_revision":
    case "en_espera":
      return "en_revision";
    case "rechazada":
      return "rechazada";
    case "resuelta":
      return "completada";
    case "cerrada":
      return "cancelada";
    default:
      return "pendiente";
  }
}

function mapEstadoUIToDB(estadoUi: string | null): TareaEstadoDB {
  const e = (estadoUi || "").toLowerCase();

  switch (e) {
    case "pendiente":
      return "pendiente";
    case "en_progreso":
      return "en_progreso";
    case "en_revision":
      return "en_revision";
    case "en_espera":
      return "en_espera";
    case "rechazada":
      return "rechazada";
    case "completada":
      return "resuelta";
    case "cancelada":
      return "cerrada";
    // si ya viene en formato DB, la dejamos
    case "resuelta":
      return "resuelta";
    case "cerrada":
      return "cerrada";
    default:
      return "pendiente";
  }
}

function parseTags(raw: any): string[] {
  if (!raw) return [];

  try {
    if (typeof raw === "string") {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed.map((t) => String(t));
      }
      return [];
    }

    if (Array.isArray(raw)) {
      return raw.map((t) => String(t));
    }

    return [];
  } catch {
    return [];
  }
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

function mapRowToTarea(row: any, idUsuario: number): TareaAPI {
  const centro =
    row.id_centro != null
      ? { id_centro: Number(row.id_centro), nombre: row.centro_nombre }
      : null;

  const sucursal =
    row.id_sucursal != null
      ? { id_sucursal: Number(row.id_sucursal), nombre: row.sucursal_nombre }
      : null;

  const creadorNombre = row.creador_nombre || "Usuario desconocido";

  const responsableId =
    row.id_responsable ?? row.asignado_id_usuario ?? row.id_creador;

  const responsableNombre =
    row.responsable_nombre || row.asignado_nombre || creadorNombre;

  const tags = parseTags(row.tags);
  const estadoUI = mapEstadoDBToUI(row.estado_db);
  const prioridad = (row.prioridad || "media") as TareaPrioridad;

  const esCreador = idUsuario === row.id_creador;
  const esResponsable = idUsuario === responsableId;
  const esAsignadoPrincipal = row.es_principal === 1;

  return {
    id_tarea: row.id_tarea,
    titulo: row.titulo,
    descripcion: row.descripcion || null,
    prioridad,
    estado: estadoUI,
    tipo: row.tipo_tarea,
    centro,
    sucursal,
    creador: {
      id_usuario: row.id_creador,
      nombre_completo: creadorNombre,
      rol: "Creador",
    },
    responsable: {
      id_usuario: responsableId,
      nombre_completo: responsableNombre,
      rol: "Responsable",
    },
    fecha_creacion: row.fecha_creacion.toISOString(),
    fecha_limite: row.fecha_limite ? row.fecha_limite.toISOString() : null,
    tags,
    puede_editar: esCreador || esResponsable,
    puede_cambiar_estado: esResponsable || esAsignadoPrincipal || esCreador,
    puede_eliminar: esCreador,
  };
}

async function cargarTareaCompleta(
  idTarea: number,
  idUsuario: number
): Promise<TareaAPI | null> {
  const [rows] = await pool.query<RowDataPacket[]>(
    `
    SELECT 
      t.id_tarea,
      t.titulo,
      t.descripcion,
      t.prioridad,
      t.estado AS estado_db,
      t.tipo_tarea,
      t.fecha_creacion,
      t.fecha_limite,
      t.tags,

      t.id_centro,
      cm.nombre AS centro_nombre,

      t.id_sucursal,
      s.nombre AS sucursal_nombre,

      t.id_creador,
      CONCAT(
        uc.nombre, ' ', uc.apellido_paterno, 
        ' ', COALESCE(uc.apellido_materno, '')
      ) AS creador_nombre,

      t.id_responsable,
      CONCAT(
        ur.nombre, ' ', ur.apellido_paterno, 
        ' ', COALESCE(ur.apellido_materno, '')
      ) AS responsable_nombre,

      ta2.id_usuario AS asignado_id_usuario,
      CONCAT(
        ua.nombre, ' ', ua.apellido_paterno,
        ' ', COALESCE(ua.apellido_materno, '')
      ) AS asignado_nombre,
      ta2.rol_asignado,
      ta2.estado AS estado_asignacion,
      ta2.es_principal

    FROM tareas t
    
    LEFT JOIN tareas_asignaciones ta2
      ON ta2.id_tarea = t.id_tarea

    LEFT JOIN usuarios uc  ON uc.id_usuario = t.id_creador
    LEFT JOIN usuarios ur  ON ur.id_usuario = t.id_responsable
    LEFT JOIN usuarios ua  ON ua.id_usuario = ta2.id_usuario
    LEFT JOIN centros_medicos cm ON cm.id_centro = t.id_centro
    LEFT JOIN sucursales s  ON s.id_sucursal = t.id_sucursal

    WHERE 
      t.id_tarea = ?
      AND (
        t.id_creador = ?
        OR t.id_responsable = ?
        OR ta2.id_usuario = ?
      )
    GROUP BY t.id_tarea
    LIMIT 1
    `,
    [idTarea, idUsuario, idUsuario, idUsuario]
  );

  if (rows.length === 0) return null;

  return mapRowToTarea(rows[0], idUsuario);
}

// ========================================
// GET /api/tareas/[id] - OBTENER UNA TAREA
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

    const idTarea = Number(params.id);
    if (!idTarea || Number.isNaN(idTarea)) {
      return NextResponse.json(
        { success: false, error: "ID de tarea no válido" },
        { status: 400 }
      );
    }

    const tarea = await cargarTareaCompleta(idTarea, idUsuario);

    if (!tarea) {
      return NextResponse.json(
        { success: false, error: "Tarea no encontrada o sin permisos" },
        { status: 404 }
      );
    }

    await pool.query(
      `UPDATE sesiones_usuarios SET ultima_actividad = NOW() WHERE token = ?`,
      [sessionToken]
    );

    return NextResponse.json(
      {
        success: true,
        tarea,
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("❌ Error en GET /api/tareas/[id]:", error);

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
// PATCH /api/tareas/[id] - ACTUALIZAR TAREA
// ========================================

export async function PATCH(
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

    const idTarea = Number(params.id);
    if (!idTarea || Number.isNaN(idTarea)) {
      return NextResponse.json(
        { success: false, error: "ID de tarea no válido" },
        { status: 400 }
      );
    }

    const payload = await request.json().catch(() => ({}));
    const {
      titulo,
      descripcion,
      prioridad,
      estado,
      tipo_tarea,
      id_centro,
      id_sucursal,
      fecha_limite,
      tags,
    } = payload || {};

    // 1) Cargar tarea básica para validar permisos
    const [rowsBase] = await pool.query<RowDataPacket[]>(
      `
      SELECT 
        t.id_tarea,
        t.titulo,
        t.descripcion,
        t.prioridad,
        t.estado,
        t.tipo_tarea,
        t.id_centro,
        t.id_sucursal,
        t.fecha_limite,
        t.tags,
        t.fecha_creacion,
        t.id_creador,
        t.id_responsable
      FROM tareas t
      WHERE t.id_tarea = ?
      LIMIT 1
      `,
      [idTarea]
    );

    if (rowsBase.length === 0) {
      return NextResponse.json(
        { success: false, error: "Tarea no encontrada" },
        { status: 404 }
      );
    }

    const tareaActual = rowsBase[0];

    const esCreador = idUsuario === tareaActual.id_creador;
    const esResponsable = idUsuario === tareaActual.id_responsable;

    // Misma lógica que en la API de lista: puede_editar => creador o responsable
    if (!esCreador && !esResponsable) {
      return NextResponse.json(
        { success: false, error: "No tienes permisos para editar esta tarea" },
        { status: 403 }
      );
    }

    // 2) Validaciones de campos si vienen en el payload

    // prioridad
    let nuevaPrioridad = tareaActual.prioridad as TareaPrioridad;
    if (typeof prioridad !== "undefined") {
      const prioridadesValidas: TareaPrioridad[] = [
        "baja",
        "media",
        "alta",
        "critica",
      ];
      if (!prioridadesValidas.includes(prioridad)) {
        return NextResponse.json(
          { success: false, error: "Prioridad no válida" },
          { status: 400 }
        );
      }
      nuevaPrioridad = prioridad;
    }

    // estado (viene en formato UI desde el frontend)
    let nuevoEstadoDb = tareaActual.estado as TareaEstadoDB;
    if (typeof estado !== "undefined") {
      nuevoEstadoDb = mapEstadoUIToDB(estado);
    }

    // tipo_tarea
    let nuevoTipoTarea = tareaActual.tipo_tarea as TareaTipo;
    if (typeof tipo_tarea !== "undefined") {
      const tiposValidos: TareaTipo[] = [
        "tecnico",
        "secretaria",
        "administrativo",
        "sistema",
      ];
      if (!tiposValidos.includes(tipo_tarea)) {
        return NextResponse.json(
          { success: false, error: "Tipo de tarea no válido" },
          { status: 400 }
        );
      }
      nuevoTipoTarea = tipo_tarea;
    }

    // 3) Preparar nuevos valores con fallback a los actuales
    const nuevoTitulo =
      typeof titulo === "string" && titulo.trim()
        ? titulo.trim()
        : tareaActual.titulo;

    const nuevaDescripcion =
      typeof descripcion === "string"
        ? descripcion.trim() || null
        : tareaActual.descripcion;

    let nuevoIdCentro: number | null = tareaActual.id_centro ?? null;
    if (typeof id_centro !== "undefined") {
      nuevoIdCentro =
        id_centro === null || id_centro === "" ? null : Number(id_centro);
      if (Number.isNaN(nuevoIdCentro as number)) {
        nuevoIdCentro = null;
      }
    }

    let nuevoIdSucursal: number | null = tareaActual.id_sucursal ?? null;
    if (typeof id_sucursal !== "undefined") {
      nuevoIdSucursal =
        id_sucursal === null || id_sucursal === "" ? null : Number(id_sucursal);
      if (Number.isNaN(nuevoIdSucursal as number)) {
        nuevoIdSucursal = null;
      }
    }

    let nuevaFechaLimite: string | null =
      tareaActual.fecha_limite ?? null;
    if (typeof fecha_limite !== "undefined") {
      if (!fecha_limite) {
        nuevaFechaLimite = null;
      } else {
        nuevaFechaLimite = String(fecha_limite);
      }
    }

    let nuevosTagsJson = tareaActual.tags ?? null;
    let nuevosTagsArray: string[] = parseTags(tareaActual.tags);
    if (typeof tags !== "undefined") {
      const arr = Array.isArray(tags) ? tags : [];
      nuevosTagsArray = arr.map((t) => String(t));
      nuevosTagsJson =
        nuevosTagsArray.length > 0 ? JSON.stringify(nuevosTagsArray) : null;
    }

    const connection = await pool.getConnection();

    try {
      await connection.beginTransaction();

      // 4) Actualizar la tarea
      await connection.query<ResultSetHeader>(
        `
        UPDATE tareas
        SET
          titulo       = ?,
          descripcion  = ?,
          prioridad    = ?,
          estado       = ?,
          tipo_tarea   = ?,
          id_centro    = ?,
          id_sucursal  = ?,
          fecha_limite = ?,
          tags         = ?
        WHERE id_tarea = ?
        `,
        [
          nuevoTitulo,
          nuevaDescripcion,
          nuevaPrioridad,
          nuevoEstadoDb,
          nuevoTipoTarea,
          nuevoIdCentro,
          nuevoIdSucursal,
          nuevaFechaLimite,
          nuevosTagsJson,
          idTarea,
        ]
      );

      // 5) Registrar en historial
      const detalleHistorial = {
        accion: "actualizacion",
        usuario: idUsuario,
        fecha: new Date().toISOString(),
        campos: {
          titulo: {
            antes: tareaActual.titulo,
            despues: nuevoTitulo,
          },
          prioridad: {
            antes: tareaActual.prioridad,
            despues: nuevaPrioridad,
          },
          estado: {
            antes: tareaActual.estado,
            despues: nuevoEstadoDb,
          },
          tipo_tarea: {
            antes: tareaActual.tipo_tarea,
            despues: nuevoTipoTarea,
          },
          id_centro: {
            antes: tareaActual.id_centro,
            despues: nuevoIdCentro,
          },
          id_sucursal: {
            antes: tareaActual.id_sucursal,
            despues: nuevoIdSucursal,
          },
          fecha_limite: {
            antes: tareaActual.fecha_limite,
            despues: nuevaFechaLimite,
          },
          tags: {
            antes: parseTags(tareaActual.tags),
            despues: nuevosTagsArray,
          },
        },
      };

      await connection.query(
        `
        INSERT INTO tareas_historial (
          id_tarea,
          id_usuario,
          accion,
          detalle
        ) VALUES (?, ?, 'actualizacion', ?)
        `,
        [idTarea, idUsuario, JSON.stringify(detalleHistorial)]
      );

      await connection.commit();
      connection.release();

      // 6) Actualizar última actividad
      await pool.query(
        `UPDATE sesiones_usuarios SET ultima_actividad = NOW() WHERE token = ?`,
        [sessionToken]
      );

      // 7) Volver a cargar la tarea con el formato API
      const tareaActualizada = await cargarTareaCompleta(idTarea, idUsuario);

      return NextResponse.json(
        {
          success: true,
          message: "Tarea actualizada correctamente",
          tarea: tareaActualizada,
        },
        { status: 200 }
      );
    } catch (error) {
      await connection.rollback();
      connection.release();
      throw error;
    }
  } catch (error: any) {
    console.error("❌ Error en PATCH /api/tareas/[id]:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Error al actualizar la tarea",
        message: error.message || "Error desconocido",
        details:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}

// ========================================
// MÉTODOS NO IMPLEMENTADOS
// ========================================

export async function POST() {
  return NextResponse.json(
    { success: false, error: "Método POST no implementado en este recurso" },
    { status: 405 }
  );
}

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
