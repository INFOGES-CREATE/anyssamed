// app/api/medico/preferencias/route.ts
import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { RowDataPacket, ResultSetHeader } from "mysql2";

// ========================================
// GET - Obtener preferencias del usuario
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

    // Verificar sesión y obtener usuario
    const [sesiones] = await pool.query<RowDataPacket[]>(
      `SELECT su.id_usuario, m.id_medico
       FROM sesiones_usuarios su
       INNER JOIN medicos m ON su.id_usuario = m.id_usuario
       WHERE su.token = ? AND su.activa = 1 AND su.fecha_expiracion > NOW()`,
      [sessionToken]
    );

    if (sesiones.length === 0) {
      return NextResponse.json(
        { success: false, error: "Sesión inválida" },
        { status: 401 }
      );
    }

    const idUsuario = sesiones[0].id_usuario;

    // Obtener preferencias
    const [preferencias] = await pool.query<RowDataPacket[]>(
      `SELECT * FROM preferencias_usuarios WHERE id_usuario = ?`,
      [idUsuario]
    );

    if (preferencias.length === 0) {
      // Crear preferencias por defecto si no existen
      await pool.query(
        `INSERT INTO preferencias_usuarios (id_usuario, tema_color, vista_agenda_default)
         VALUES (?, 'light', 'dia')`,
        [idUsuario]
      );

      // Obtener las preferencias recién creadas
      const [nuevasPreferencias] = await pool.query<RowDataPacket[]>(
        `SELECT * FROM preferencias_usuarios WHERE id_usuario = ?`,
        [idUsuario]
      );

      return NextResponse.json(
        {
          success: true,
          preferencias: formatearPreferencias(nuevasPreferencias[0]),
        },
        { status: 200 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        preferencias: formatearPreferencias(preferencias[0]),
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error al obtener preferencias:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Error interno del servidor",
        details: process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}

// ========================================
// PUT - Actualizar preferencias del usuario
// ========================================

export async function PUT(request: NextRequest) {
  try {
    const sessionToken = getSessionToken(request);
    if (!sessionToken) {
      return NextResponse.json(
        { success: false, error: "No hay sesión activa" },
        { status: 401 }
      );
    }

    // Verificar sesión y obtener usuario
    const [sesiones] = await pool.query<RowDataPacket[]>(
      `SELECT su.id_usuario, m.id_medico
       FROM sesiones_usuarios su
       INNER JOIN medicos m ON su.id_usuario = m.id_usuario
       WHERE su.token = ? AND su.activa = 1 AND su.fecha_expiracion > NOW()`,
      [sessionToken]
    );

    if (sesiones.length === 0) {
      return NextResponse.json(
        { success: false, error: "Sesión inválida" },
        { status: 401 }
      );
    }

    const idUsuario = sesiones[0].id_usuario;
    const body = await request.json();

    // Construir query de actualización dinámicamente
    const camposPermitidos = [
      "tema_color",
      "modo_compacto",
      "animaciones_habilitadas",
      "vista_agenda_default",
      "mostrar_estadisticas",
      "mostrar_filtros_avanzados",
      "hora_inicio_jornada",
      "hora_fin_jornada",
      "duracion_cita_default",
      "notificaciones_email",
      "notificaciones_push",
      "notificaciones_sms",
      "recordatorio_citas_minutos",
      "idioma",
      "zona_horaria",
      "formato_fecha",
      "formato_hora",
      "mostrar_foto_perfil",
      "compartir_disponibilidad",
      "permitir_reserva_online",
      "auto_confirmar_citas",
      "enviar_recordatorios_automaticos",
      "bloquear_citas_mismo_horario",
      "permitir_overbooking",
    ];

    const camposActualizar: string[] = [];
    const valores: any[] = [];

    Object.keys(body).forEach((campo) => {
      if (camposPermitidos.includes(campo)) {
        camposActualizar.push(`${campo} = ?`);
        valores.push(body[campo]);
      }
    });

    if (camposActualizar.length === 0) {
      return NextResponse.json(
        { success: false, error: "No hay campos válidos para actualizar" },
        { status: 400 }
      );
    }

    valores.push(idUsuario);

    // Actualizar preferencias
    await pool.query(
      `UPDATE preferencias_usuarios 
       SET ${camposActualizar.join(", ")}, fecha_actualizacion = NOW()
       WHERE id_usuario = ?`,
      valores
    );

    // Obtener preferencias actualizadas
    const [preferenciasActualizadas] = await pool.query<RowDataPacket[]>(
      `SELECT * FROM preferencias_usuarios WHERE id_usuario = ?`,
      [idUsuario]
    );

    // Registrar actividad
    await pool.query(
      `INSERT INTO logs_actividad (id_usuario, tipo_actividad, descripcion, ip_address, user_agent)
       VALUES (?, 'actualizacion_preferencias', 'Usuario actualizó sus preferencias de agenda', ?, ?)`,
      [
        idUsuario,
        request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown",
        request.headers.get("user-agent") || "unknown",
      ]
    );

    return NextResponse.json(
      {
        success: true,
        message: "Preferencias actualizadas exitosamente",
        preferencias: formatearPreferencias(preferenciasActualizadas[0]),
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error al actualizar preferencias:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Error interno del servidor",
        details: process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}

// ========================================
// DELETE - Restaurar preferencias por defecto
// ========================================

export async function DELETE(request: NextRequest) {
  try {
    const sessionToken = getSessionToken(request);
    if (!sessionToken) {
      return NextResponse.json(
        { success: false, error: "No hay sesión activa" },
        { status: 401 }
      );
    }

    // Verificar sesión y obtener usuario
    const [sesiones] = await pool.query<RowDataPacket[]>(
      `SELECT su.id_usuario, m.id_medico
       FROM sesiones_usuarios su
       INNER JOIN medicos m ON su.id_usuario = m.id_usuario
       WHERE su.token = ? AND su.activa = 1 AND su.fecha_expiracion > NOW()`,
      [sessionToken]
    );

    if (sesiones.length === 0) {
      return NextResponse.json(
        { success: false, error: "Sesión inválida" },
        { status: 401 }
      );
    }

    const idUsuario = sesiones[0].id_usuario;

    // Restaurar valores por defecto
    await pool.query(
      `UPDATE preferencias_usuarios 
       SET tema_color = 'light',
           modo_compacto = FALSE,
           animaciones_habilitadas = TRUE,
           vista_agenda_default = 'dia',
           mostrar_estadisticas = TRUE,
           mostrar_filtros_avanzados = FALSE,
           hora_inicio_jornada = '08:00:00',
           hora_fin_jornada = '18:00:00',
           duracion_cita_default = 30,
           notificaciones_email = TRUE,
           notificaciones_push = TRUE,
           notificaciones_sms = FALSE,
           recordatorio_citas_minutos = 60,
           idioma = 'es',
           zona_horaria = 'America/Santiago',
           formato_fecha = 'DD/MM/YYYY',
           formato_hora = '24h',
           mostrar_foto_perfil = TRUE,
           compartir_disponibilidad = TRUE,
           permitir_reserva_online = TRUE,
           auto_confirmar_citas = FALSE,
           enviar_recordatorios_automaticos = TRUE,
           bloquear_citas_mismo_horario = TRUE,
           permitir_overbooking = FALSE,
           fecha_actualizacion = NOW()
       WHERE id_usuario = ?`,
      [idUsuario]
    );

    // Obtener preferencias restauradas
    const [preferenciasRestauradas] = await pool.query<RowDataPacket[]>(
      `SELECT * FROM preferencias_usuarios WHERE id_usuario = ?`,
      [idUsuario]
    );

    return NextResponse.json(
      {
        success: true,
        message: "Preferencias restauradas a valores por defecto",
        preferencias: formatearPreferencias(preferenciasRestauradas[0]),
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error al restaurar preferencias:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Error interno del servidor",
        details: process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}

// ========================================
// FUNCIONES AUXILIARES
// ========================================

function formatearPreferencias(preferencias: any) {
  return {
    id_preferencia: preferencias.id_preferencia,
    id_usuario: preferencias.id_usuario,
    tema_color: preferencias.tema_color,
    modo_compacto: Boolean(preferencias.modo_compacto),
    animaciones_habilitadas: Boolean(preferencias.animaciones_habilitadas),
    vista_agenda_default: preferencias.vista_agenda_default,
    mostrar_estadisticas: Boolean(preferencias.mostrar_estadisticas),
    mostrar_filtros_avanzados: Boolean(preferencias.mostrar_filtros_avanzados),
    hora_inicio_jornada: preferencias.hora_inicio_jornada,
    hora_fin_jornada: preferencias.hora_fin_jornada,
    duracion_cita_default: preferencias.duracion_cita_default,
    notificaciones_email: Boolean(preferencias.notificaciones_email),
    notificaciones_push: Boolean(preferencias.notificaciones_push),
    notificaciones_sms: Boolean(preferencias.notificaciones_sms),
    recordatorio_citas_minutos: preferencias.recordatorio_citas_minutos,
    idioma: preferencias.idioma,
    zona_horaria: preferencias.zona_horaria,
    formato_fecha: preferencias.formato_fecha,
    formato_hora: preferencias.formato_hora,
    mostrar_foto_perfil: Boolean(preferencias.mostrar_foto_perfil),
    compartir_disponibilidad: Boolean(preferencias.compartir_disponibilidad),
    permitir_reserva_online: Boolean(preferencias.permitir_reserva_online),
    auto_confirmar_citas: Boolean(preferencias.auto_confirmar_citas),
    enviar_recordatorios_automaticos: Boolean(preferencias.enviar_recordatorios_automaticos),
    bloquear_citas_mismo_horario: Boolean(preferencias.bloquear_citas_mismo_horario),
    permitir_overbooking: Boolean(preferencias.permitir_overbooking),
  };
}

function getSessionToken(request: NextRequest): string | null {
  const cookieHeader = request.headers.get("cookie") || "";
  const cookies = cookieHeader
    .split(";")
    .map((c) => c.trim())
    .reduce((acc, c) => {
      const [k, ...rest] = c.split("=");
      acc[k] = rest.join("=");
      return acc;
    }, {} as Record<string, string>);

  const candidates = ["session", "session_token", "medisalud_session", "auth_session"];

  for (const name of candidates) {
    if (cookies[name]) {
      return decodeURIComponent(cookies[name]);
    }
  }

  const auth = request.headers.get("authorization");
  if (auth?.startsWith("Bearer ")) {
    return auth.slice(7);
  }

  return null;
}

