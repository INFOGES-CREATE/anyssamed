// src/app/api/tareas/route.ts

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

// ========================================
// HANDLER GET - LISTAR TAREAS
// ========================================

// ========================================
// HANDLER GET - LISTAR TAREAS DEL USUARIO
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

    const idUsuario = await verificarSesion(sessionToken);

    if (!idUsuario) {
      return NextResponse.json(
        { success: false, error: "Sesión inválida o expirada" },
        { status: 401 }
      );
    }

    const url = new URL(request.url);
    const searchParams = url.searchParams;

    const estadoFiltro = searchParams.get("estado");
    const prioridadFiltro = searchParams.get("prioridad");
    const centroFiltro = searchParams.get("centro");
    const sucursalFiltro = searchParams.get("sucursal");

    const limit = Math.min(
      parseInt(searchParams.get("limit") || "200", 10) || 200,
      500
    );
    const offset = parseInt(searchParams.get("offset") || "0", 10) || 0;

    // ================================
    // 🔥 SOLO TAREAS DEL USUARIO
    // ================================
    let sql = `
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
      
      -- 👇 Todas las asignaciones de cualquier usuario
      LEFT JOIN tareas_asignaciones ta2
        ON ta2.id_tarea = t.id_tarea

      LEFT JOIN usuarios uc  ON uc.id_usuario = t.id_creador
      LEFT JOIN usuarios ur  ON ur.id_usuario = t.id_responsable
      LEFT JOIN usuarios ua  ON ua.id_usuario = ta2.id_usuario
      LEFT JOIN centros_medicos cm ON cm.id_centro = t.id_centro
      LEFT JOIN sucursales s  ON s.id_sucursal = t.id_sucursal

      WHERE 
        (
          t.id_creador = ?            -- tareas creadas por este usuario
          OR t.id_responsable = ?     -- tareas donde el usuario es responsable
          OR ta2.id_usuario = ?        -- tareas asignadas al usuario
        )
    `;

    const params: any[] = [idUsuario, idUsuario, idUsuario];

    // ================================
    // 🔎 Filtros opcionales
    // ================================
    if (estadoFiltro && estadoFiltro !== "todos") {
      sql += ` AND t.estado = ? `;
      params.push(estadoFiltro);
    }

    if (prioridadFiltro && prioridadFiltro !== "todas") {
      sql += ` AND t.prioridad = ? `;
      params.push(prioridadFiltro);
    }

    if (centroFiltro && centroFiltro !== "0") {
      sql += ` AND t.id_centro = ? `;
      params.push(Number(centroFiltro));
    }

    if (sucursalFiltro && sucursalFiltro !== "0") {
      sql += ` AND t.id_sucursal = ? `;
      params.push(Number(sucursalFiltro));
    }

    sql += `
      GROUP BY t.id_tarea
      ORDER BY 
        CASE t.prioridad
          WHEN 'critica' THEN 1
          WHEN 'alta'    THEN 2
          WHEN 'media'   THEN 3
          ELSE 4
        END ASC,
        t.fecha_limite IS NULL ASC,
        t.fecha_limite ASC,
        t.fecha_creacion DESC
      LIMIT ? OFFSET ?
    `;

    params.push(limit, offset);

    const [rows] = await pool.query<RowDataPacket[]>(sql, params);

    // ================================
    // 🔁 Mapeo final
    // ================================
    const tareas: TareaAPI[] = rows.map((row) => {
      const centro =
        row.id_centro != null
          ? { id_centro: Number(row.id_centro), nombre: row.centro_nombre }
          : null;

      const sucursal =
        row.id_sucursal != null
          ? { id_sucursal: Number(row.id_sucursal), nombre: row.sucursal_nombre }
          : null;

      const creadorNombre =
        row.creador_nombre || "Usuario desconocido";

      const responsableId =
        row.id_responsable ??
        row.asignado_id_usuario ??
        row.id_creador;

      const responsableNombre =
        row.responsable_nombre ||
        row.asignado_nombre ||
        creadorNombre;

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
        fecha_limite: row.fecha_limite
          ? row.fecha_limite.toISOString()
          : null,
        tags,
        puede_editar: esCreador || esResponsable,
        puede_cambiar_estado:
          esResponsable || esAsignadoPrincipal || esCreador,
        puede_eliminar: esCreador,
      };
    });

    await pool.query(
      `UPDATE sesiones_usuarios SET ultima_actividad = NOW() WHERE token = ?`,
      [sessionToken]
    );

    return NextResponse.json(
      {
        success: true,
        tareas,
        count: tareas.length,
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("❌ Error en GET /api/tareas:", error);

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
// HANDLER POST - CREAR NUEVA TAREA
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

    const idUsuario = await verificarSesion(sessionToken);

    if (!idUsuario) {
      return NextResponse.json(
        { success: false, error: "Sesión inválida o expirada" },
        { status: 401 }
      );
    }

    // Obtener datos del body
    const contentType = request.headers.get("content-type") || "";
    let payload: any;

    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      const payloadStr = formData.get("payload") as string;
      payload = JSON.parse(payloadStr);
      // Los archivos se procesarían aquí
    } else {
      payload = await request.json();
    }

    const {
      titulo,
      descripcion,
      prioridad = "media",
      estado = "pendiente",
      tipo_tarea,
      id_centro,
      id_sucursal,
      fecha_limite,
      tags = [],
      id_responsable,
      subtareas = [],
      colaboradores = [],
    } = payload;

    // Validaciones
    if (!titulo || !titulo.trim()) {
      return NextResponse.json(
        { success: false, error: "El título es obligatorio" },
        { status: 400 }
      );
    }

    if (!tipo_tarea) {
      return NextResponse.json(
        { success: false, error: "El tipo de tarea es obligatorio" },
        { status: 400 }
      );
    }

    // Validar que el tipo_tarea sea válido
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

    // Validar prioridad
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

    // Validar estado
    const estadosValidos: TareaEstadoDB[] = [
      "pendiente",
      "en_progreso",
      "en_revision",
      "en_espera",
      "rechazada",
      "resuelta",
      "cerrada",
    ];
    if (!estadosValidos.includes(estado)) {
      return NextResponse.json(
        { success: false, error: "Estado no válido" },
        { status: 400 }
      );
    }

    const connection = await pool.getConnection();

    try {
      await connection.beginTransaction();

      // 1. Insertar la tarea principal
      const [resultTarea] = await connection.query<ResultSetHeader>(
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
          tags,
          creado_por
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
        [
          titulo.trim(),
          descripcion?.trim() || null,
          idUsuario,
          id_responsable || idUsuario,
          id_centro || null,
          id_sucursal || null,
          prioridad,
          estado,
          tipo_tarea,
          fecha_limite || null,
          tags.length > 0 ? JSON.stringify(tags) : null,
          idUsuario,
        ]
      );

      const idTarea = resultTarea.insertId;

      // 2. Insertar asignación principal (responsable)
      const responsableFinal = id_responsable || idUsuario;
      
      await connection.query(
        `
        INSERT INTO tareas_asignaciones (
          id_tarea,
          id_usuario,
          rol_asignado,
          es_principal,
          estado
        ) VALUES (?, ?, ?, 1, 'asignado')
        `,
        [idTarea, responsableFinal, tipo_tarea]
      );

      // 3. Insertar colaboradores (evitando duplicados)
      if (colaboradores && Array.isArray(colaboradores)) {
        const colaboradoresUnicos = [...new Set(colaboradores)]
          .filter((id) => id && id !== responsableFinal)
          .map((id) => Number(id))
          .filter((id) => !isNaN(id));

        for (const idColab of colaboradoresUnicos) {
          try {
            await connection.query(
              `
              INSERT INTO tareas_asignaciones (
                id_tarea,
                id_usuario,
                rol_asignado,
                es_principal,
                estado
              ) VALUES (?, ?, ?, 0, 'asignado')
              `,
              [idTarea, idColab, tipo_tarea]
            );
          } catch (err: any) {
            // Ignorar errores de duplicados (UNIQUE KEY)
            if (err.code !== "ER_DUP_ENTRY") {
              throw err;
            }
          }
        }
      }

      // 4. Insertar subtareas
      if (subtareas && Array.isArray(subtareas)) {
        for (const subtarea of subtareas) {
          if (subtarea.titulo && subtarea.titulo.trim()) {
            await connection.query(
              `
              INSERT INTO tareas_subtareas (
                id_tarea,
                titulo,
                estado
              ) VALUES (?, ?, 'pendiente')
              `,
              [idTarea, subtarea.titulo.trim()]
            );
          }
        }
      }

      // 5. Registrar en historial
      await connection.query(
        `
        INSERT INTO tareas_historial (
          id_tarea,
          id_usuario,
          accion,
          detalle
        ) VALUES (?, ?, 'creacion', ?)
        `,
        [
          idTarea,
          idUsuario,
          JSON.stringify({
            titulo,
            prioridad,
            estado,
            tipo_tarea,
            responsable: responsableFinal,
            colaboradores: colaboradores?.length || 0,
            subtareas: subtareas?.length || 0,
            fecha_creacion: new Date().toISOString(),
          }),
        ]
      );

      await connection.commit();

      // Actualizar última actividad
      await pool.query(
        `UPDATE sesiones_usuarios SET ultima_actividad = NOW() WHERE token = ?`,
        [sessionToken]
      );

      return NextResponse.json(
        {
          success: true,
          message: "Tarea creada exitosamente",
          tarea: {
            id_tarea: idTarea,
            titulo,
            prioridad,
            estado,
            tipo_tarea,
          },
        },
        { status: 201 }
      );
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error: any) {
    console.error("❌ Error en POST /api/tareas:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Error al crear la tarea",
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
