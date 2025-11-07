// frontend/src/app/api/telemedicina/sala/estado/route.ts

import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { RowDataPacket, ResultSetHeader } from "mysql2";

// ========================================
// TIPOS
// ========================================

interface MedicoData {
  id_medico: number;
  id_usuario: number;
  id_centro_principal: number;
}

interface ActualizacionEstado {
  id_sesion: number;
  estado?: "programada" | "en_espera" | "en_curso" | "finalizada" | "cancelada" | "problema_tecnico";
  calidad_conexion?: "excelente" | "buena" | "regular" | "mala" | "muy_mala";
  evento?: string;
  datos_adicionales?: any;
}

// ========================================
// HELPER PARA OBTENER TOKEN
// ========================================

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

// ========================================
// FUNCIONES AUXILIARES
// ========================================

async function obtenerMedicoAutenticado(
  idUsuario: number
): Promise<MedicoData | null> {
  try {
    const [rows] = await pool.query<RowDataPacket[]>(
      `
      SELECT 
        m.id_medico,
        m.id_usuario,
        m.id_centro_principal
      FROM medicos m
      WHERE m.id_usuario = ? AND m.estado = 'activo'
      LIMIT 1
      `,
      [idUsuario]
    );

    if (rows.length === 0) {
      return null;
    }

    return rows[0] as MedicoData;
  } catch (error) {
    console.error("Error al obtener médico:", error);
    throw error;
  }
}

async function validarAccesoSesion(
  idSesion: number,
  idMedico: number
): Promise<boolean> {
  try {
    const [rows] = await pool.query<RowDataPacket[]>(
      `
      SELECT COUNT(*) as tiene_acceso
      FROM telemedicina_sesiones
      WHERE id_sesion = ?
        AND id_medico = ?
      `,
      [idSesion, idMedico]
    );

    return rows[0].tiene_acceso > 0;
  } catch (error) {
    console.error("Error al validar acceso:", error);
    throw error;
  }
}

async function obtenerEstadoActual(idSesion: number): Promise<any> {
  try {
    const [rows] = await pool.query<RowDataPacket[]>(
      `
      SELECT 
        id_sesion,
        estado,
        fecha_hora_inicio_real,
        fecha_hora_fin_real,
        duracion_segundos,
        calidad_conexion
      FROM telemedicina_sesiones
      WHERE id_sesion = ?
      LIMIT 1
      `,
      [idSesion]
    );

    return rows.length > 0 ? rows[0] : null;
  } catch (error) {
    console.error("Error al obtener estado actual:", error);
    throw error;
  }
}

async function registrarEvento(
  idSesion: number,
  tipoEvento: string,
  descripcion: string,
  datosAdicionales: any = null
): Promise<void> {
  try {
    await pool.query(
      `
      INSERT INTO eventos (
        tipo_entidad,
        id_entidad,
        tipo_evento,
        descripcion,
        datos_adicionales,
        fecha_evento
      ) VALUES ('telemedicina_sesion', ?, ?, ?, ?, NOW())
      `,
      [idSesion, tipoEvento, descripcion, JSON.stringify(datosAdicionales)]
    );
  } catch (error) {
    console.error("Error al registrar evento:", error);
    // No lanzar error, solo log
  }
}

async function actualizarCitaRelacionada(
  idCita: number,
  estado: string
): Promise<void> {
  try {
    let estadoCita = "en_curso";

    if (estado === "finalizada") {
      estadoCita = "completada";
    } else if (estado === "cancelada") {
      estadoCita = "cancelada";
    }

    await pool.query(
      `UPDATE citas SET estado = ? WHERE id_cita = ?`,
      [estadoCita, idCita]
    );
  } catch (error) {
    console.error("Error al actualizar cita relacionada:", error);
    // No lanzar error, solo log
  }
}

async function notificarCambioEstado(
  idSesion: number,
  idPaciente: number,
  nuevoEstado: string
): Promise<void> {
  try {
    let mensaje = "";
    let tipo = "info";

    switch (nuevoEstado) {
      case "en_espera":
        mensaje = "El médico está listo para atenderte. Por favor, ingresa a la sala.";
        tipo = "info";
        break;
      case "en_curso":
        mensaje = "La consulta ha iniciado.";
        tipo = "success";
        break;
      case "finalizada":
        mensaje = "La consulta ha finalizado. Gracias por tu tiempo.";
        tipo = "success";
        break;
      case "cancelada":
        mensaje = "La consulta ha sido cancelada.";
        tipo = "warning";
        break;
      case "problema_tecnico":
        mensaje = "Se ha detectado un problema técnico. Por favor, intenta reconectar.";
        tipo = "error";
        break;
    }

    await pool.query(
      `
      INSERT INTO notificaciones (
        id_usuario,
        tipo,
        titulo,
        mensaje,
        leido,
        fecha_creacion
      )
      SELECT 
        u.id_usuario,
        ?,
        'Actualización de Telemedicina',
        ?,
        0,
        NOW()
      FROM pacientes p
      INNER JOIN usuarios u ON p.id_usuario = u.id_usuario
      WHERE p.id_paciente = ?
      `,
      [tipo, mensaje, idPaciente]
    );
  } catch (error) {
    console.error("Error al notificar cambio de estado:", error);
    // No lanzar error, solo log
  }
}

// ========================================
// HANDLER PUT - Actualizar estado
// ========================================

export async function PUT(request: NextRequest) {
  try {
    // 1. Obtener token
    const sessionToken = getSessionToken(request);

    if (!sessionToken) {
      return NextResponse.json(
        {
          success: false,
          error: "No hay sesión activa",
        },
        { status: 401 }
      );
    }

    // 2. Verificar sesión
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

    if (sesiones.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Sesión inválida o expirada",
        },
        { status: 401 }
      );
    }

    const idUsuario = sesiones[0].id_usuario;

    // 3. Verificar que sea médico
    const medico = await obtenerMedicoAutenticado(idUsuario);

    if (!medico) {
      return NextResponse.json(
        {
          success: false,
          error: "No tienes un registro de médico activo",
        },
        { status: 403 }
      );
    }

    // 4. Obtener datos del body
    const body: ActualizacionEstado = await request.json();
    const { id_sesion, estado, calidad_conexion, evento, datos_adicionales } = body;

    if (!id_sesion) {
      return NextResponse.json(
        {
          success: false,
          error: "ID de sesión requerido",
        },
        { status: 400 }
      );
    }

    // 5. Validar acceso
    const tieneAcceso = await validarAccesoSesion(id_sesion, medico.id_medico);

    if (!tieneAcceso) {
      return NextResponse.json(
        {
          success: false,
          error: "No tienes acceso a esta sesión",
        },
        { status: 403 }
      );
    }

    // 6. Obtener estado actual
    const estadoActual = await obtenerEstadoActual(id_sesion);

    if (!estadoActual) {
      return NextResponse.json(
        {
          success: false,
          error: "Sesión no encontrada",
        },
        { status: 404 }
      );
    }

    // 7. Construir query de actualización
    const updates: string[] = [];
    const params: any[] = [];

    if (estado) {
      updates.push("estado = ?");
      params.push(estado);

      // Actualizar timestamps según el estado
      if (estado === "en_curso" && !estadoActual.fecha_hora_inicio_real) {
        updates.push("fecha_hora_inicio_real = NOW()");
      }

      if (estado === "finalizada") {
        if (!estadoActual.fecha_hora_fin_real) {
          updates.push("fecha_hora_fin_real = NOW()");
        }
        if (!estadoActual.duracion_segundos) {
          updates.push(
            "duracion_segundos = TIMESTAMPDIFF(SECOND, fecha_hora_inicio_real, NOW())"
          );
        }
      }
    }

    if (calidad_conexion) {
      updates.push("calidad_conexion = ?");
      params.push(calidad_conexion);
    }

    if (updates.length === 0 && !evento) {
      return NextResponse.json(
        {
          success: false,
          error: "No hay cambios para actualizar",
        },
        { status: 400 }
      );
    }

    // 8. Ejecutar actualización si hay cambios
    if (updates.length > 0) {
      params.push(id_sesion);
      await pool.query(
        `UPDATE telemedicina_sesiones SET ${updates.join(", ")} WHERE id_sesion = ?`,
        params
      );
    }

    // 9. Registrar evento si se proporcionó
    if (evento) {
      await registrarEvento(
        id_sesion,
        evento,
        `Evento en sesión de telemedicina: ${evento}`,
        datos_adicionales
      );
    }

    // 10. Actualizar cita relacionada si cambió el estado
    if (estado) {
      const [sesionData] = await pool.query<RowDataPacket[]>(
        `SELECT id_cita, id_paciente FROM telemedicina_sesiones WHERE id_sesion = ?`,
        [id_sesion]
      );

      if (sesionData.length > 0) {
        await actualizarCitaRelacionada(sesionData[0].id_cita, estado);
        await notificarCambioEstado(id_sesion, sesionData[0].id_paciente, estado);
      }
    }

    // 11. Obtener estado actualizado
    const estadoNuevo = await obtenerEstadoActual(id_sesion);

    // 12. Respuesta exitosa
    return NextResponse.json(
      {
        success: true,
        message: "Estado actualizado exitosamente",
        estado_anterior: {
          estado: estadoActual.estado,
          calidad_conexion: estadoActual.calidad_conexion,
        },
        estado_nuevo: {
          estado: estadoNuevo.estado,
          calidad_conexion: estadoNuevo.calidad_conexion,
          fecha_hora_inicio_real: estadoNuevo.fecha_hora_inicio_real,
          fecha_hora_fin_real: estadoNuevo.fecha_hora_fin_real,
          duracion_segundos: estadoNuevo.duracion_segundos,
        },
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("❌ Error en PUT /api/telemedicina/sala/estado:", error);

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
// HANDLER GET - Obtener estado actual
// ========================================

export async function GET(request: NextRequest) {
  try {
    // 1. Obtener token
    const sessionToken = getSessionToken(request);

    if (!sessionToken) {
      return NextResponse.json(
        {
          success: false,
          error: "No hay sesión activa",
        },
        { status: 401 }
      );
    }

    // 2. Verificar sesión
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

    if (sesiones.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Sesión inválida o expirada",
        },
        { status: 401 }
      );
    }

    const idUsuario = sesiones[0].id_usuario;

    // 3. Verificar que sea médico
    const medico = await obtenerMedicoAutenticado(idUsuario);

    if (!medico) {
      return NextResponse.json(
        {
          success: false,
          error: "No tienes un registro de médico activo",
        },
        { status: 403 }
      );
    }

    // 4. Obtener parámetros
    const searchParams = request.nextUrl.searchParams;
    const idSesion = searchParams.get("id_sesion");

    if (!idSesion) {
      return NextResponse.json(
        {
          success: false,
          error: "ID de sesión requerido",
        },
        { status: 400 }
      );
    }

    // 5. Validar acceso
    const tieneAcceso = await validarAccesoSesion(
      parseInt(idSesion),
      medico.id_medico
    );

    if (!tieneAcceso) {
      return NextResponse.json(
        {
          success: false,
          error: "No tienes acceso a esta sesión",
        },
        { status: 403 }
      );
    }

    // 6. Obtener estado completo
    const [rows] = await pool.query<RowDataPacket[]>(
      `
      SELECT 
        ts.id_sesion,
        ts.estado,
        ts.fecha_hora_inicio_programada,
        ts.fecha_hora_fin_programada,
        ts.fecha_hora_inicio_real,
        ts.fecha_hora_fin_real,
        ts.duracion_segundos,
        ts.calidad_conexion,
        ts.proveedor_servicio,
        
        -- Participantes conectados
        (
          SELECT COUNT(*)
          FROM telemedicina_dispositivos td
          WHERE td.id_sesion = ts.id_sesion
            AND td.estado = 'conectado'
        ) as participantes_conectados,
        
        -- Eventos recientes
        (
          SELECT JSON_ARRAYAGG(
            JSON_OBJECT(
              'tipo_evento', e.tipo_evento,
              'descripcion', e.descripcion,
              'fecha_evento', e.fecha_evento
            )
          )
          FROM eventos e
          WHERE e.tipo_entidad = 'telemedicina_sesion'
            AND e.id_entidad = ts.id_sesion
          ORDER BY e.fecha_evento DESC
          LIMIT 10
        ) as eventos_recientes
        
      FROM telemedicina_sesiones ts
      WHERE ts.id_sesion = ?
      LIMIT 1
      `,
      [idSesion]
    );

    if (rows.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Sesión no encontrada",
        },
        { status: 404 }
      );
    }

    const sesion = rows[0];

    // 7. Respuesta exitosa
    return NextResponse.json(
      {
        success: true,
        estado: {
          id_sesion: sesion.id_sesion,
          estado: sesion.estado,
          fecha_hora_inicio_programada: sesion.fecha_hora_inicio_programada,
          fecha_hora_fin_programada: sesion.fecha_hora_fin_programada,
          fecha_hora_inicio_real: sesion.fecha_hora_inicio_real,
          fecha_hora_fin_real: sesion.fecha_hora_fin_real,
          duracion_segundos: sesion.duracion_segundos,
          calidad_conexion: sesion.calidad_conexion,
          proveedor_servicio: sesion.proveedor_servicio,
          participantes_conectados: sesion.participantes_conectados,
          eventos_recientes:
            typeof sesion.eventos_recientes === "string"
              ? JSON.parse(sesion.eventos_recientes)
              : sesion.eventos_recientes || [],
        },
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("❌ Error en GET /api/telemedicina/sala/estado:", error);

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
