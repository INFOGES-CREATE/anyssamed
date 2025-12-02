// app/api/tareas/completadas/route.ts
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { RowDataPacket, ResultSetHeader } from "mysql2";

// =========================
// TIPOS
// =========================

type TareaPrioridad = "baja" | "media" | "alta" | "critica";

type TareaEstadoBD =
  | "pendiente"
  | "en_progreso"
  | "en_revision"
  | "en_espera"
  | "rechazada"
  | "resuelta"
  | "cerrada";

type TareaTipoTarea = "tecnico" | "secretaria" | "administrativo" | "sistema";

type AsignacionEstado =
  | "asignado"
  | "aceptado"
  | "rechazado"
  | "finalizado";

type RolAsignado = "tecnico" | "secretaria" | "administrativo" | "supervisor";

interface TareaCompletadaDTO {
  id_tarea: number;
  titulo: string;
  descripcion: string | null;

  prioridad: TareaPrioridad;
  estado: TareaEstadoBD;
  tipo_tarea: TareaTipoTarea;

  fecha_creacion: string;
  fecha_limite: string | null;
  fecha_resolucion: string | null;

  creador: string | null;
  responsable: string | null;

  centro: string | null;
  sucursal: string | null;

  estado_asignacion: AsignacionEstado | null;
  rol_asignado: RolAsignado | null;
  es_principal: boolean;
  fecha_asignacion: string | null;

  tags: string[];
}

// =========================
// CONSTANTES / HELPERS
// =========================

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

function parseTags(raw: any): string[] {
  if (!raw) return [];
  try {
    if (Array.isArray(raw)) {
      return raw.map((t) => String(t));
    }
    if (typeof raw === "string") {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed.map((t) => String(t));
      }
    }
  } catch (e) {
    // ignorar errores de parseo
  }
  return [];
}

// =========================
// GET: listar tareas COMPLETADAS
// =========================

export async function GET(request: NextRequest) {
  try {
    const sessionToken = getSessionToken(request);

    if (!sessionToken) {
      return NextResponse.json(
        { success: false, error: "No hay sesión activa" },
        { status: 401 }
      );
    }

    // Usuario autenticado desde sesiones_usuarios
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

    const idUsuario = sesiones[0].id_usuario as number;

    // Filtros desde querystring
    const { searchParams } = new URL(request.url);

    const prioridadParam = searchParams.get("prioridad");
    const prioridad =
      prioridadParam && prioridadParam !== "todas"
        ? (prioridadParam as TareaPrioridad)
        : null;

    const tipoParam = searchParams.get("tipo_tarea");
    const tipo_tarea =
      tipoParam && tipoParam !== "todos"
        ? (tipoParam as TareaTipoTarea)
        : null;

    const centroParam = searchParams.get("centro");
    const sucursalParam = searchParams.get("sucursal");

    const estadoAsignacionParam = searchParams.get("estado_asignacion");
    const estado_asignacion =
      estadoAsignacionParam && estadoAsignacionParam !== "todos"
        ? (estadoAsignacionParam as AsignacionEstado)
        : null;

    const fechaDesde = searchParams.get("fecha_desde"); // formato YYYY-MM-DD
    const fechaHasta = searchParams.get("fecha_hasta"); // formato YYYY-MM-DD

    const q = searchParams.get("q");

    const limiteParam = searchParams.get("limite");
    const limite =
      Number.isNaN(Number(limiteParam)) || !limiteParam
        ? 100
        : Math.min(parseInt(limiteParam, 10), 300);

    // Query principal: tareas asignadas al usuario y COMPLETADAS
    let sql = `
      SELECT 
        t.id_tarea,
        t.titulo,
        t.descripcion,
        t.prioridad,
        t.estado,
        t.tipo_tarea,
        t.fecha_creacion,
        t.fecha_limite,
        t.fecha_resolucion,
        t.tags,
        t.id_centro,
        t.id_sucursal,

        -- creador
        CONCAT(u1.nombre, ' ', u1.apellido_paterno) AS creador,
        -- responsable principal
        CONCAT(u2.nombre, ' ', u2.apellido_paterno) AS responsable,

        cm.nombre AS centro,
        s.nombre AS sucursal,

        ta.id_asignacion,
        ta.estado AS estado_asignacion,
        ta.rol_asignado,
        ta.es_principal,
        ta.fecha_asignacion
      FROM tareas t
      LEFT JOIN tareas_asignaciones ta ON ta.id_tarea = t.id_tarea
      LEFT JOIN usuarios u1 ON u1.id_usuario = t.id_creador
      LEFT JOIN usuarios u2 ON u2.id_usuario = t.id_responsable
      LEFT JOIN centros_medicos cm ON cm.id_centro = t.id_centro
      LEFT JOIN sucursales s ON s.id_sucursal = t.id_sucursal
      WHERE ta.id_usuario = ?
        AND t.estado IN ('resuelta', 'cerrada')
    `;
    const params: any[] = [idUsuario];

    if (prioridad) {
      sql += " AND t.prioridad = ? ";
      params.push(prioridad);
    }

    if (tipo_tarea) {
      sql += " AND t.tipo_tarea = ? ";
      params.push(tipo_tarea);
    }

    if (centroParam && centroParam !== "todos") {
      sql += " AND t.id_centro = ? ";
      params.push(Number(centroParam));
    }

    if (sucursalParam && sucursalParam !== "todas") {
      sql += " AND t.id_sucursal = ? ";
      params.push(Number(sucursalParam));
    }

    if (estado_asignacion) {
      sql += " AND ta.estado = ? ";
      params.push(estado_asignacion);
    }

    if (fechaDesde) {
      sql += " AND DATE(t.fecha_resolucion) >= ? ";
      params.push(fechaDesde);
    }

    if (fechaHasta) {
      sql += " AND DATE(t.fecha_resolucion) <= ? ";
      params.push(fechaHasta);
    }

    if (q && q.trim() !== "") {
      const like = `%${q.trim()}%`;
      sql += `
        AND (
          t.titulo LIKE ?
          OR t.descripcion LIKE ?
          OR cm.nombre LIKE ?
          OR s.nombre LIKE ?
          OR CONCAT(u1.nombre, ' ', u1.apellido_paterno) LIKE ?
          OR CONCAT(u2.nombre, ' ', u2.apellido_paterno) LIKE ?
        )
      `;
      params.push(like, like, like, like, like, like);
    }

    sql += `
      ORDER BY
        CASE t.prioridad
          WHEN 'critica' THEN 1
          WHEN 'alta' THEN 2
          WHEN 'media' THEN 3
          ELSE 4
        END ASC,
        t.fecha_resolucion DESC,
        t.fecha_limite DESC,
        t.fecha_creacion DESC
      LIMIT ?
    `;
    params.push(limite);

    const [rows] = await pool.query<RowDataPacket[]>(sql, params);

    const tareas: TareaCompletadaDTO[] = rows.map((row) => ({
      id_tarea: row.id_tarea,
      titulo: row.titulo,
      descripcion: row.descripcion ?? null,
      prioridad: row.prioridad as TareaPrioridad,
      estado: row.estado as TareaEstadoBD,
      tipo_tarea: row.tipo_tarea as TareaTipoTarea,
      fecha_creacion: row.fecha_creacion,
      fecha_limite: row.fecha_limite ?? null,
      fecha_resolucion: row.fecha_resolucion ?? null,
      creador: row.creador ?? null,
      responsable: row.responsable ?? null,
      centro: row.centro ?? null,
      sucursal: row.sucursal ?? null,
      estado_asignacion: (row.estado_asignacion ??
        null) as AsignacionEstado | null,
      rol_asignado: (row.rol_asignado ?? null) as RolAsignado | null,
      es_principal: Boolean(row.es_principal),
      fecha_asignacion: row.fecha_asignacion ?? null,
      tags: parseTags(row.tags),
    }));

    // refrescar última actividad
    await pool.query(
      `UPDATE sesiones_usuarios SET ultima_actividad = NOW() WHERE token = ?`,
      [sessionToken]
    );

    return NextResponse.json(
      {
        success: true,
        tareas,
        count: tareas.length,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("❌ Error en GET /api/tareas/completadas:", error);
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

// =========================
// POST: crear nueva tarea (general INFOGES)
// =========================

export async function POST(request: NextRequest) {
  try {
    const sessionToken = getSessionToken(request);

    if (!sessionToken) {
      return NextResponse.json(
        { success: false, error: "No hay sesión activa" },
        { status: 401 }
      );
    }

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

    const idUsuario = sesiones[0].id_usuario as number;

    const body = await request.json();

    const titulo = (body.titulo || "").toString().trim();
    const descripcion =
      body.descripcion !== undefined ? String(body.descripcion) : null;

    const prioridadBody = (body.prioridad || "media") as TareaPrioridad;
    const prioridad: TareaPrioridad = ["baja", "media", "alta", "critica"].includes(
      prioridadBody
    )
      ? prioridadBody
      : "media";

    const tipoBody = (body.tipo_tarea || body.tipo || "tecnico") as TareaTipoTarea;
    const tipo_tarea: TareaTipoTarea = ["tecnico", "secretaria", "administrativo", "sistema"].includes(
      tipoBody
    )
      ? tipoBody
      : "tecnico";

    const estadoBody = (body.estado || "pendiente") as TareaEstadoBD;
    const estado: TareaEstadoBD = [
      "pendiente",
      "en_progreso",
      "en_revision",
      "en_espera",
      "rechazada",
      "resuelta",
      "cerrada",
    ].includes(estadoBody)
      ? estadoBody
      : "pendiente";

    const fecha_limite =
      body.fecha_limite !== undefined ? String(body.fecha_limite) : null;
    const fecha_resolucion =
      body.fecha_resolucion !== undefined
        ? String(body.fecha_resolucion)
        : null;

    const id_centro =
      typeof body.id_centro === "number" ? body.id_centro : null;
    const id_sucursal =
      typeof body.id_sucursal === "number" ? body.id_sucursal : null;

    const id_responsable =
      typeof body.id_responsable === "number" ? body.id_responsable : null;

    const idUsuarioAsignado =
      typeof body.id_usuario_asignado === "number"
        ? (body.id_usuario_asignado as number)
        : id_responsable || idUsuario;

    const rolAsignadoBody = (body.rol_asignado ||
      body.rol ||
      "tecnico") as RolAsignado;
    const rol_asignado: RolAsignado = [
      "tecnico",
      "secretaria",
      "administrativo",
      "supervisor",
    ].includes(rolAsignadoBody)
      ? rolAsignadoBody
      : "tecnico";

    const tagsArray: string[] = Array.isArray(body.tags)
      ? body.tags.map((t: any) => String(t))
      : [];
    const tagsJSON = tagsArray.length > 0 ? JSON.stringify(tagsArray) : null;

    if (!titulo) {
      return NextResponse.json(
        { success: false, error: "El título es obligatorio" },
        { status: 400 }
      );
    }

    // Insert en tareas
    const [result] = await pool.query<ResultSetHeader>(
      `
      INSERT INTO tareas (
        titulo,
        descripcion,
        id_creador,
        id_responsable,
        id_centro,
        id_sucursal,
        prioridad,
        estado,
        tipo_tarea,
        fecha_limite,
        fecha_resolucion,
        tags,
        creado_por
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        titulo,
        descripcion,
        idUsuario,
        id_responsable,
        id_centro,
        id_sucursal,
        prioridad,
        estado,
        tipo_tarea,
        fecha_limite,
        fecha_resolucion,
        tagsJSON,
        idUsuario,
      ]
    );

    const id_tarea = result.insertId;

    // Asignación principal (si hay usuario asignado)
    if (idUsuarioAsignado) {
      await pool.query<ResultSetHeader>(
        `
        INSERT INTO tareas_asignaciones (
          id_tarea,
          id_usuario,
          rol_asignado,
          es_principal,
          estado
        )
        VALUES (?, ?, ?, 1, 'asignado')
        `,
        [id_tarea, idUsuarioAsignado, rol_asignado]
      );
    }

    // Historial (opcional)
    await pool.query<ResultSetHeader>(
      `
      INSERT INTO tareas_historial (
        id_tarea,
        id_usuario,
        accion,
        detalle
      )
      VALUES (?, ?, ?, ?)
      `,
      [
        id_tarea,
        idUsuario,
        "Creación de tarea",
        JSON.stringify({
          titulo,
          prioridad,
          tipo_tarea,
          estado_inicial: estado,
        }),
      ]
    );

    // Log opcional
    await pool.query(
      `
      INSERT INTO logs_sistema (id_usuario, tipo, accion, fecha_hora)
      VALUES (?, 'tarea', CONCAT('Creación de tarea global: ', ?), NOW())
      `,
      [idUsuario, titulo]
    );

    // Devolver la tarea recién creada con el mismo formato que GET
    const [rows] = await pool.query<RowDataPacket[]>(
      `
      SELECT 
        t.id_tarea,
        t.titulo,
        t.descripcion,
        t.prioridad,
        t.estado,
        t.tipo_tarea,
        t.fecha_creacion,
        t.fecha_limite,
        t.fecha_resolucion,
        t.tags,
        t.id_centro,
        t.id_sucursal,

        CONCAT(u1.nombre, ' ', u1.apellido_paterno) AS creador,
        CONCAT(u2.nombre, ' ', u2.apellido_paterno) AS responsable,

        cm.nombre AS centro,
        s.nombre AS sucursal,

        ta.id_asignacion,
        ta.estado AS estado_asignacion,
        ta.rol_asignado,
        ta.es_principal,
        ta.fecha_asignacion
      FROM tareas t
      LEFT JOIN tareas_asignaciones ta 
        ON ta.id_tarea = t.id_tarea 
        AND ta.id_usuario = ?
      LEFT JOIN usuarios u1 ON u1.id_usuario = t.id_creador
      LEFT JOIN usuarios u2 ON u2.id_usuario = t.id_responsable
      LEFT JOIN centros_medicos cm ON cm.id_centro = t.id_centro
      LEFT JOIN sucursales s ON s.id_sucursal = t.id_sucursal
      WHERE t.id_tarea = ?
      LIMIT 1
      `,
      [idUsuarioAsignado || idUsuario, id_tarea]
    );

    const row = rows[0] as RowDataPacket;

    const tareaDTO: TareaCompletadaDTO = {
      id_tarea: row.id_tarea,
      titulo: row.titulo,
      descripcion: row.descripcion ?? null,
      prioridad: row.prioridad as TareaPrioridad,
      estado: row.estado as TareaEstadoBD,
      tipo_tarea: row.tipo_tarea as TareaTipoTarea,
      fecha_creacion: row.fecha_creacion,
      fecha_limite: row.fecha_limite ?? null,
      fecha_resolucion: row.fecha_resolucion ?? null,
      creador: row.creador ?? null,
      responsable: row.responsable ?? null,
      centro: row.centro ?? null,
      sucursal: row.sucursal ?? null,
      estado_asignacion: (row.estado_asignacion ??
        null) as AsignacionEstado | null,
      rol_asignado: (row.rol_asignado ?? null) as RolAsignado | null,
      es_principal: Boolean(row.es_principal),
      fecha_asignacion: row.fecha_asignacion ?? null,
      tags: parseTags(row.tags),
    };

    return NextResponse.json(
      {
        success: true,
        tarea: tareaDTO,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("❌ Error en POST /api/tareas/completadas:", error);
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

// =========================
// Otros métodos no permitidos
// =========================

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
