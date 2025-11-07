// frontend/src/app/api/telemedicina/configuracion/route.ts
import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { RowDataPacket, ResultSetHeader } from "mysql2";

// =====================================================
// 1. tipos de tus tablas
// =====================================================
interface SesionUsuarioRow extends RowDataPacket {
  id_usuario: number;
}

interface MedicoRow extends RowDataPacket {
  id_medico: number;
  id_usuario: number;
  id_centro_principal: number;
}

interface TelemedicinaConfigRow extends RowDataPacket {
  id_configuracion: number;
  id_centro: number;
  id_medico: number | null;
  prefijo_sala: string;
  zona_horaria: string;
  nivel_seguridad: "normal" | "alto" | "maximo";
  calidad_video_default: string | null;
  grabacion_automatica: 0 | 1;
  duracion_sesion_default: number | null;
  tiempo_buffer_entre_sesiones: number;
  proveedor_servicio: string;
  proveedor_servicio_backup: string | null;
  api_key: string | null;
  api_secret: string | null;
  cuenta_id: string | null;
  configuracion_json: string | null;
  consulta_telemedicina_habilitada: 0 | 1;
  requerir_consentimiento: 0 | 1;
  id_plantilla_consentimiento: number | null;
  forzar_2fa_acceso: 0 | 1;
  politica_encriptacion: "auto" | "e2ee" | "hipaa";
  auditoria_detallada: 0 | 1;
  tiempo_espera_minutos: number;
  sala_espera_virtual: 0 | 1;
  sala_espera_media_url: string | null;
  mensaje_sala_espera: string | null;
  permitir_autotest_dispositivo: 0 | 1;
  recordatorio_minutos_antes: number;
  enviar_recordatorios: 0 | 1;
  reintentos_notificacion: number;
  prioridad_notificacion: "email" | "sms" | "ambos";
  minutos_recordatorio: number;
  notificar_por_email: 0 | 1;
  notificar_por_sms: 0 | 1;
  webhook_eventos: string | null;
  webhook_eventos_secundario: string | null;
  publicar_en_portal_paciente: 0 | 1;
  branding_logo_url: string | null;
  branding_color_primario: string | null;
  idioma_interfaz: string;
  idioma_paciente_preferido: string | null;
  max_participantes: number;
  compartir_pantalla_habilitado: 0 | 1;
  chat_habilitado: 0 | 1;
  permitir_chat_seguro: 0 | 1;
  permitir_telefono_respaldo: 0 | 1;
  telefono_respaldo_numero: string | null;
  permite_grabacion: 0 | 1;
  retencion_grabaciones_dias: number;
  visibilidad_grabacion: "solo_medico" | "medico_paciente" | "equipo_clinico";
  transcripcion_automatica: 0 | 1;
  guardar_transcripcion: 0 | 1;
  generar_resumen_ia: 0 | 1;
  idioma_resumen_ia: string | null;
  proveedor_ia: string | null;
  precio_consulta_telemedicina: string; // decimal
  horario_atencion: string | null;
  dias_disponibles: string | null;
  configuracion_avanzada: string | null;
  activo: 0 | 1;
  modo_mantenimiento: 0 | 1;
  motivo_mantenimiento: string | null;
  creado_por: number;
}

// lo que el FRONT “humano” va a usar
interface ConfigDTO {
  id_configuracion: number;
  id_centro: number;
  id_medico: number | null;
  proveedor_video: string;
  proveedor_video_backup: string | null;
  prefijo_sala: string;
  zona_horaria: string;
  nivel_seguridad: "normal" | "alto" | "maximo";
  calidad_video: "auto" | "sd" | "hd" | "fullhd" | string;
  duracion_sesion_default: number;
  tiempo_buffer_entre_sesiones: number;
  permitir_grabacion: boolean;
  consulta_telemedicina_habilitada: boolean;
  requerir_consentimiento: boolean;
  id_plantilla_consentimiento: number | null;
  forzar_2fa_acceso: boolean;
  politica_encriptacion: "auto" | "e2ee" | "hipaa";
  auditoria_detallada: boolean;
  tiempo_espera_minutos: number;
  sala_espera_virtual: boolean;
  sala_espera_media_url: string | null;
  mensaje_sala_espera: string | null;
  permitir_autotest_dispositivo: boolean;
  enviar_recordatorios: boolean;
  minutos_recordatorio: number;
  reintentos_notificacion: number;
  prioridad_notificacion: "email" | "sms" | "ambos";
  notificar_por_email: boolean;
  notificar_por_sms: boolean;
  webhook_eventos: string | null;
  webhook_eventos_secundario: string | null;
  publicar_en_portal_paciente: boolean;
  branding_logo_url: string | null;
  branding_color_primario: string | null;
  idioma_interfaz: string;
  idioma_paciente_preferido: string | null;
  max_participantes: number;
  compartir_pantalla_habilitado: boolean;
  chat_habilitado: boolean;
  permitir_chat_seguro: boolean;
  permitir_telefono_respaldo: boolean;
  telefono_respaldo_numero: string | null;
  retencion_grabaciones_dias: number;
  visibilidad_grabacion: "solo_medico" | "medico_paciente" | "equipo_clinico";
  transcripcion_automatica: boolean;
  guardar_transcripcion: boolean;
  generar_resumen_ia: boolean;
  idioma_resumen_ia: string | null;
  proveedor_ia: string | null;
  precio_consulta_telemedicina: number;
  horario_atencion: any;
  dias_disponibles: string[];
  configuracion_avanzada: any;
  modo_mantenimiento: boolean;
  motivo_mantenimiento: string | null;
  raw?: any;
}

// =====================================================
// 2. helpers de sesión
// =====================================================
const SESSION_COOKIE_CANDIDATES = [
  "session",
  "session_token",
  "medisalud_session",
  "auth_session",
  "next-auth.session-token",
  "__Secure-next-auth.session-token",
];

function getSessionToken(req: NextRequest): string | null {
  const cookieHeader = req.headers.get("cookie") || "";
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
      if (cookies[name]) return decodeURIComponent(cookies[name]);
    }
  }
  const auth = req.headers.get("authorization");
  if (auth?.startsWith("Bearer ")) return auth.slice(7);
  return null;
}

async function obtenerUsuarioDeSesion(token: string): Promise<number | null> {
  const [rows] = await pool.query<SesionUsuarioRow[]>(
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
    [token]
  );
  if (!rows.length) return null;
  return rows[0].id_usuario;
}

async function obtenerMedicoPorUsuario(idUsuario: number): Promise<MedicoRow | null> {
  const [rows] = await pool.query<MedicoRow[]>(
    `
    SELECT m.id_medico, m.id_usuario, m.id_centro_principal
    FROM medicos m
    WHERE m.id_usuario = ? AND m.estado = 'activo'
    LIMIT 1
    `,
    [idUsuario]
  );
  if (!rows.length) return null;
  return rows[0];
}

// =====================================================
// 3. helpers de configuración
// =====================================================
function safeJSONParse(v: any) {
  if (!v) return {};
  if (typeof v === "object") return v;
  try {
    return JSON.parse(v);
  } catch {
    return {};
  }
}

async function buscarConfig(idCentro: number, idMedico: number | null) {
  // 1. primero la del médico
  if (idMedico) {
    const [rows] = await pool.query<TelemedicinaConfigRow[]>(
      `
      SELECT *
      FROM telemedicina_configuraciones
      WHERE id_centro = ? AND id_medico = ? AND activo = 1
      ORDER BY fecha_actualizacion DESC
      LIMIT 1
      `,
      [idCentro, idMedico]
    );
    if (rows.length) return rows[0];
  }

  // 2. si no, la del centro
  const [rowsCentro] = await pool.query<TelemedicinaConfigRow[]>(
    `
    SELECT *
    FROM telemedicina_configuraciones
    WHERE id_centro = ? AND (id_medico IS NULL OR id_medico = 0) AND activo = 1
    ORDER BY fecha_actualizacion DESC
    LIMIT 1
    `,
    [idCentro]
  );
  if (rowsCentro.length) return rowsCentro[0];

  return null;
}

async function crearConfigDefault(
  idCentro: number,
  idMedico: number | null,
  creadoPor: number
): Promise<TelemedicinaConfigRow> {
  const horarioDefault = {
    lunes: { inicio: "09:00", fin: "18:00", habilitado: true },
    martes: { inicio: "09:00", fin: "18:00", habilitado: true },
    miercoles: { inicio: "09:00", fin: "18:00", habilitado: true },
    jueves: { inicio: "09:00", fin: "18:00", habilitado: true },
    viernes: { inicio: "09:00", fin: "18:00", habilitado: true },
  };
  const diasDefault = ["lunes", "martes", "miercoles", "jueves", "viernes"];

  const json = {
    nivel_seguridad: "alto",
    zona_horaria: "America/Santiago",
    calidad_video: "auto",
    prefijo_sala: "med",
    enviar_recordatorios: true,
    minutos_recordatorio: 30,
    idioma_interfaz: "es",
  };

  const [result] = await pool.query<ResultSetHeader>(
    `
    INSERT INTO telemedicina_configuraciones (
      id_centro,
      id_medico,
      prefijo_sala,
      zona_horaria,
      nivel_seguridad,
      calidad_video_default,
      grabacion_automatica,
      duracion_sesion_default,
      tiempo_buffer_entre_sesiones,
      proveedor_servicio,
      configuracion_json,
      consulta_telemedicina_habilitada,
      requerir_consentimiento,
      tiempo_espera_minutos,
      sala_espera_virtual,
      enviar_recordatorios,
      minutos_recordatorio,
      notificar_por_email,
      notificar_por_sms,
      idioma_interfaz,
      max_participantes,
      compartir_pantalla_habilitado,
      chat_habilitado,
      permitir_chat_seguro,
      permitir_telefono_respaldo,
      permite_grabacion,
      retencion_grabaciones_dias,
      visibilidad_grabacion,
      precio_consulta_telemedicina,
      horario_atencion,
      dias_disponibles,
      activo,
      creado_por
    ) VALUES (
      ?, ?, 'med', 'America/Santiago', 'alto', 'HD', 0, 30, 10,
      'anyssa_video', ?, 1, 1, 15, 1, 1, 30, 1, 0, 'es', 2, 1, 1, 1, 1, 0, 90, 'solo_medico',
      0.00, ?, ?, 1, ?
    )
    `,
    [
      idCentro,
      idMedico,
      JSON.stringify(json),
      JSON.stringify(horarioDefault),
      JSON.stringify(diasDefault),
      creadoPor,
    ]
  );

  const [rows] = await pool.query<TelemedicinaConfigRow[]>(
    `SELECT * FROM telemedicina_configuraciones WHERE id_configuracion = ?`,
    [result.insertId]
  );
  return rows[0];
}

// convierte fila de BD → DTO bonito
function mapDBToDTO(row: TelemedicinaConfigRow): ConfigDTO {
  const extra = safeJSONParse(row.configuracion_json);

  return {
    id_configuracion: row.id_configuracion,
    id_centro: row.id_centro,
    id_medico: row.id_medico ?? null,
    proveedor_video: row.proveedor_servicio || "anyssa_video",
    proveedor_video_backup: row.proveedor_servicio_backup || null,
    prefijo_sala: row.prefijo_sala || extra.prefijo_sala || "med",
    zona_horaria: row.zona_horaria || extra.zona_horaria || "America/Santiago",
    nivel_seguridad: row.nivel_seguridad || extra.nivel_seguridad || "alto",
    calidad_video: (row.calidad_video_default as any) || extra.calidad_video || "auto",
    duracion_sesion_default: row.duracion_sesion_default || 30,
    tiempo_buffer_entre_sesiones: row.tiempo_buffer_entre_sesiones || 10,
    permitir_grabacion: row.permite_grabacion === 1,
    consulta_telemedicina_habilitada: row.consulta_telemedicina_habilitada === 1,
    requerir_consentimiento: row.requerir_consentimiento === 1,
    id_plantilla_consentimiento: row.id_plantilla_consentimiento ?? null,
    forzar_2fa_acceso: row.forzar_2fa_acceso === 1,
    politica_encriptacion: row.politica_encriptacion || "auto",
    auditoria_detallada: row.auditoria_detallada === 1,
    tiempo_espera_minutos: row.tiempo_espera_minutos || 15,
    sala_espera_virtual: row.sala_espera_virtual === 1,
    sala_espera_media_url: row.sala_espera_media_url,
    mensaje_sala_espera: row.mensaje_sala_espera,
    permitir_autotest_dispositivo: row.permitir_autotest_dispositivo === 1,
    enviar_recordatorios: row.enviar_recordatorios === 1,
    minutos_recordatorio: row.minutos_recordatorio || row.recordatorio_minutos_antes || 30,
    reintentos_notificacion: row.reintentos_notificacion || 3,
    prioridad_notificacion: row.prioridad_notificacion || "email",
    notificar_por_email: row.notificar_por_email === 1,
    notificar_por_sms: row.notificar_por_sms === 1,
    webhook_eventos: row.webhook_eventos,
    webhook_eventos_secundario: row.webhook_eventos_secundario,
    publicar_en_portal_paciente: row.publicar_en_portal_paciente === 1,
    branding_logo_url: row.branding_logo_url,
    branding_color_primario: row.branding_color_primario,
    idioma_interfaz: row.idioma_interfaz || "es",
    idioma_paciente_preferido: row.idioma_paciente_preferido,
    max_participantes: row.max_participantes || 2,
    compartir_pantalla_habilitado: row.compartir_pantalla_habilitado === 1,
    chat_habilitado: row.chat_habilitado === 1,
    permitir_chat_seguro: row.permitir_chat_seguro === 1,
    permitir_telefono_respaldo: row.permitir_telefono_respaldo === 1,
    telefono_respaldo_numero: row.telefono_respaldo_numero,
    retencion_grabaciones_dias: row.retencion_grabaciones_dias || 90,
    visibilidad_grabacion: row.visibilidad_grabacion || "solo_medico",
    transcripcion_automatica: row.transcripcion_automatica === 1,
    guardar_transcripcion: row.guardar_transcripcion === 1,
    generar_resumen_ia: row.generar_resumen_ia === 1,
    idioma_resumen_ia: row.idioma_resumen_ia,
    proveedor_ia: row.proveedor_ia,
    precio_consulta_telemedicina: Number(row.precio_consulta_telemedicina || 0),
    horario_atencion: safeJSONParse(row.horario_atencion),
    dias_disponibles: safeJSONParse(row.dias_disponibles) || [],
    configuracion_avanzada: safeJSONParse(row.configuracion_avanzada),
    modo_mantenimiento: row.modo_mantenimiento === 1,
    motivo_mantenimiento: row.motivo_mantenimiento,
    raw: extra,
  };
}

// guarda/actualiza
async function guardarConfig(
  idUsuario: number,
  idCentro: number,
  idMedico: number | null,
  body: any
) {
  const fila = await buscarConfig(idCentro, idMedico);

  // reconstruimos configuracion_json mezclando lo que había
  const prevJSON = fila ? safeJSONParse(fila.configuracion_json) : {};

  const mergedJSON = {
    ...prevJSON,
    // todo lo que venga suelto del front
    prefijo_sala: body.prefijo_sala ?? prevJSON.prefijo_sala ?? "med",
    zona_horaria: body.zona_horaria ?? prevJSON.zona_horaria ?? "America/Santiago",
    nivel_seguridad: body.nivel_seguridad ?? prevJSON.nivel_seguridad ?? "alto",
    calidad_video: body.calidad_video ?? prevJSON.calidad_video ?? "auto",
    webhook_eventos: body.webhook_eventos ?? prevJSON.webhook_eventos ?? "",
    webhook_eventos_secundario:
      body.webhook_eventos_secundario ?? prevJSON.webhook_eventos_secundario ?? "",
    idioma_interfaz: body.idioma_interfaz ?? prevJSON.idioma_interfaz ?? "es",
    idioma_paciente_preferido:
      body.idioma_paciente_preferido ?? prevJSON.idioma_paciente_preferido ?? null,
    horario_atencion: body.horario_atencion ?? prevJSON.horario_atencion ?? null,
    dias_disponibles: body.dias_disponibles ?? prevJSON.dias_disponibles ?? [],
    configuracion_avanzada:
      body.configuracion_avanzada ?? prevJSON.configuracion_avanzada ?? {},
  };

  // columnas de la tabla
  const cols = {
    prefijo_sala: body.prefijo_sala ?? fila?.prefijo_sala ?? "med",
    zona_horaria: body.zona_horaria ?? fila?.zona_horaria ?? "America/Santiago",
    nivel_seguridad: body.nivel_seguridad ?? fila?.nivel_seguridad ?? "alto",
    calidad_video_default: body.calidad_video ?? fila?.calidad_video_default ?? "HD",
    grabacion_automatica: body.grabacion_automatica ? 1 : fila?.grabacion_automatica ?? 0,
    duracion_sesion_default: body.duracion_sesion_default ?? fila?.duracion_sesion_default ?? 30,
    tiempo_buffer_entre_sesiones:
      body.tiempo_buffer_entre_sesiones ?? fila?.tiempo_buffer_entre_sesiones ?? 10,
    proveedor_servicio: body.proveedor_video ?? body.proveedor_servicio ?? fila?.proveedor_servicio ?? "anyssa_video",
    proveedor_servicio_backup:
      body.proveedor_video_backup ?? fila?.proveedor_servicio_backup ?? null,
    consulta_telemedicina_habilitada:
      typeof body.consulta_telemedicina_habilitada === "boolean"
        ? body.consulta_telemedicina_habilitada
          ? 1
          : 0
        : fila?.consulta_telemedicina_habilitada ?? 1,
    requerir_consentimiento:
      typeof body.requerir_consentimiento === "boolean"
        ? body.requerir_consentimiento
          ? 1
          : 0
        : fila?.requerir_consentimiento ?? 1,
    id_plantilla_consentimiento:
      body.id_plantilla_consentimiento ?? fila?.id_plantilla_consentimiento ?? null,
    forzar_2fa_acceso:
      typeof body.forzar_2fa_acceso === "boolean"
        ? body.forzar_2fa_acceso
          ? 1
          : 0
        : fila?.forzar_2fa_acceso ?? 0,
    politica_encriptacion: body.politica_encriptacion ?? fila?.politica_encriptacion ?? "auto",
    auditoria_detallada:
      typeof body.auditoria_detallada === "boolean"
        ? body.auditoria_detallada
          ? 1
          : 0
        : fila?.auditoria_detallada ?? 1,
    tiempo_espera_minutos: body.tiempo_espera_minutos ?? fila?.tiempo_espera_minutos ?? 15,
    sala_espera_virtual:
      typeof body.sala_espera_virtual === "boolean"
        ? body.sala_espera_virtual
          ? 1
          : 0
        : fila?.sala_espera_virtual ?? 1,
    sala_espera_media_url: body.sala_espera_media_url ?? fila?.sala_espera_media_url ?? null,
    mensaje_sala_espera: body.mensaje_sala_espera ?? fila?.mensaje_sala_espera ?? null,
    permitir_autotest_dispositivo:
      typeof body.permitir_autotest_dispositivo === "boolean"
        ? body.permitir_autotest_dispositivo
          ? 1
          : 0
        : fila?.permitir_autotest_dispositivo ?? 1,
    recordatorio_minutos_antes:
      body.recordatorio_minutos_antes ?? body.minutos_recordatorio ?? fila?.recordatorio_minutos_antes ?? 10,
    enviar_recordatorios:
      typeof body.enviar_recordatorios === "boolean"
        ? body.enviar_recordatorios
          ? 1
          : 0
        : fila?.enviar_recordatorios ?? 1,
    reintentos_notificacion:
      body.reintentos_notificacion ?? fila?.reintentos_notificacion ?? 3,
    prioridad_notificacion:
      body.prioridad_notificacion ?? fila?.prioridad_notificacion ?? "email",
    minutos_recordatorio:
      body.minutos_recordatorio ?? fila?.minutos_recordatorio ?? 30,
    notificar_por_email:
      typeof body.notificar_por_email === "boolean"
        ? body.notificar_por_email
          ? 1
          : 0
        : fila?.notificar_por_email ?? 1,
    notificar_por_sms:
      typeof body.notificar_por_sms === "boolean"
        ? body.notificar_por_sms
          ? 1
          : 0
        : fila?.notificar_por_sms ?? 0,
    webhook_eventos: body.webhook_eventos ?? fila?.webhook_eventos ?? null,
    webhook_eventos_secundario:
      body.webhook_eventos_secundario ?? fila?.webhook_eventos_secundario ?? null,
    publicar_en_portal_paciente:
      typeof body.publicar_en_portal_paciente === "boolean"
        ? body.publicar_en_portal_paciente
          ? 1
          : 0
        : fila?.publicar_en_portal_paciente ?? 1,
    branding_logo_url: body.branding_logo_url ?? fila?.branding_logo_url ?? null,
    branding_color_primario: body.branding_color_primario ?? fila?.branding_color_primario ?? null,
    idioma_interfaz: body.idioma_interfaz ?? fila?.idioma_interfaz ?? "es",
    idioma_paciente_preferido:
      body.idioma_paciente_preferido ?? fila?.idioma_paciente_preferido ?? null,
    max_participantes: body.max_participantes ?? fila?.max_participantes ?? 2,
    compartir_pantalla_habilitado:
      typeof body.permite_compartir_pantalla === "boolean"
        ? body.permite_compartir_pantalla
          ? 1
          : 0
        : typeof body.compartir_pantalla_habilitado === "boolean"
        ? body.compartir_pantalla_habilitado
          ? 1
          : 0
        : fila?.compartir_pantalla_habilitado ?? 1,
    chat_habilitado:
      typeof body.chat_habilitado === "boolean"
        ? body.chat_habilitado
          ? 1
          : 0
        : fila?.chat_habilitado ?? 1,
    permitir_chat_seguro:
      typeof body.permitir_chat_seguro === "boolean"
        ? body.permitir_chat_seguro
          ? 1
          : 0
        : fila?.permitir_chat_seguro ?? 1,
    permitir_telefono_respaldo:
      typeof body.permitir_telefono_respaldo === "boolean"
        ? body.permitir_telefono_respaldo
          ? 1
          : 0
        : fila?.permitir_telefono_respaldo ?? 1,
    telefono_respaldo_numero: body.telefono_respaldo_numero ?? fila?.telefono_respaldo_numero ?? null,
    permite_grabacion:
      typeof body.permitir_grabacion === "boolean"
        ? body.permitir_grabacion
          ? 1
          : 0
        : fila?.permite_grabacion ?? 0,
    retencion_grabaciones_dias:
      body.retencion_grabaciones_dias ?? fila?.retencion_grabaciones_dias ?? 90,
    visibilidad_grabacion:
      body.visibilidad_grabacion ?? fila?.visibilidad_grabacion ?? "solo_medico",
    transcripcion_automatica:
      typeof body.transcripcion_automatica === "boolean"
        ? body.transcripcion_automatica
          ? 1
          : 0
        : fila?.transcripcion_automatica ?? 0,
    guardar_transcripcion:
      typeof body.guardar_transcripcion === "boolean"
        ? body.guardar_transcripcion
          ? 1
          : 0
        : fila?.guardar_transcripcion ?? 0,
    generar_resumen_ia:
      typeof body.generar_resumen_ia === "boolean"
        ? body.generar_resumen_ia
          ? 1
          : 0
        : fila?.generar_resumen_ia ?? 0,
    idioma_resumen_ia: body.idioma_resumen_ia ?? fila?.idioma_resumen_ia ?? null,
    proveedor_ia: body.proveedor_ia ?? fila?.proveedor_ia ?? null,
    precio_consulta_telemedicina:
      body.precio_consulta_telemedicina ?? fila?.precio_consulta_telemedicina ?? 0.0,
    horario_atencion: JSON.stringify(mergedJSON.horario_atencion ?? null),
    dias_disponibles: JSON.stringify(mergedJSON.dias_disponibles ?? []),
    configuracion_avanzada: JSON.stringify(mergedJSON.configuracion_avanzada ?? {}),
    modo_mantenimiento:
      typeof body.modo_mantenimiento === "boolean"
        ? body.modo_mantenimiento
          ? 1
          : 0
        : fila?.modo_mantenimiento ?? 0,
    motivo_mantenimiento: body.motivo_mantenimiento ?? fila?.motivo_mantenimiento ?? null,
  };

  if (!fila) {
    // insert
    const [res] = await pool.query<ResultSetHeader>(
      `
      INSERT INTO telemedicina_configuraciones (
        id_centro,
        id_medico,
        prefijo_sala,
        zona_horaria,
        nivel_seguridad,
        calidad_video_default,
        grabacion_automatica,
        duracion_sesion_default,
        tiempo_buffer_entre_sesiones,
        proveedor_servicio,
        proveedor_servicio_backup,
        api_key,
        api_secret,
        cuenta_id,
        configuracion_json,
        consulta_telemedicina_habilitada,
        requerir_consentimiento,
        id_plantilla_consentimiento,
        forzar_2fa_acceso,
        politica_encriptacion,
        auditoria_detallada,
        tiempo_espera_minutos,
        sala_espera_virtual,
        sala_espera_media_url,
        mensaje_sala_espera,
        permitir_autotest_dispositivo,
        recordatorio_minutos_antes,
        enviar_recordatorios,
        reintentos_notificacion,
        prioridad_notificacion,
        minutos_recordatorio,
        notificar_por_email,
        notificar_por_sms,
        webhook_eventos,
        webhook_eventos_secundario,
        publicar_en_portal_paciente,
        branding_logo_url,
        branding_color_primario,
        idioma_interfaz,
        idioma_paciente_preferido,
        max_participantes,
        compartir_pantalla_habilitado,
        chat_habilitado,
        permitir_chat_seguro,
        permitir_telefono_respaldo,
        telefono_respaldo_numero,
        permite_grabacion,
        retencion_grabaciones_dias,
        visibilidad_grabacion,
        transcripcion_automatica,
        guardar_transcripcion,
        generar_resumen_ia,
        idioma_resumen_ia,
        proveedor_ia,
        precio_consulta_telemedicina,
        horario_atencion,
        dias_disponibles,
        configuracion_avanzada,
        activo,
        modo_mantenimiento,
        motivo_mantenimiento,
        creado_por
      ) VALUES (
        ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NULL, NULL, NULL, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?, ?
      )
      `,
      [
        idCentro,
        idMedico,
        cols.prefijo_sala,
        cols.zona_horaria,
        cols.nivel_seguridad,
        cols.calidad_video_default,
        cols.grabacion_automatica,
        cols.duracion_sesion_default,
        cols.tiempo_buffer_entre_sesiones,
        cols.proveedor_servicio,
        cols.proveedor_servicio_backup,
        JSON.stringify(mergedJSON),
        cols.consulta_telemedicina_habilitada,
        cols.requerir_consentimiento,
        cols.id_plantilla_consentimiento,
        cols.forzar_2fa_acceso,
        cols.politica_encriptacion,
        cols.auditoria_detallada,
        cols.tiempo_espera_minutos,
        cols.sala_espera_virtual,
        cols.sala_espera_media_url,
        cols.mensaje_sala_espera,
        cols.permitir_autotest_dispositivo,
        cols.recordatorio_minutos_antes,
        cols.enviar_recordatorios,
        cols.reintentos_notificacion,
        cols.prioridad_notificacion,
        cols.minutos_recordatorio,
        cols.notificar_por_email,
        cols.notificar_por_sms,
        cols.webhook_eventos,
        cols.webhook_eventos_secundario,
        cols.publicar_en_portal_paciente,
        cols.branding_logo_url,
        cols.branding_color_primario,
        cols.idioma_interfaz,
        cols.idioma_paciente_preferido,
        cols.max_participantes,
        cols.compartir_pantalla_habilitado,
        cols.chat_habilitado,
        cols.permitir_chat_seguro,
        cols.permitir_telefono_respaldo,
        cols.telefono_respaldo_numero,
        cols.permite_grabacion,
        cols.retencion_grabaciones_dias,
        cols.visibilidad_grabacion,
        cols.transcripcion_automatica,
        cols.guardar_transcripcion,
        cols.generar_resumen_ia,
        cols.idioma_resumen_ia,
        cols.proveedor_ia,
        cols.precio_consulta_telemedicina,
        cols.horario_atencion,
        cols.dias_disponibles,
        cols.configuracion_avanzada,
        cols.modo_mantenimiento,
        cols.motivo_mantenimiento,
        idUsuario,
      ]
    );

    const [rows] = await pool.query<TelemedicinaConfigRow[]>(
      `SELECT * FROM telemedicina_configuraciones WHERE id_configuracion = ?`,
      [res.insertId]
    );
    return rows[0];
  } else {
    // update
    await pool.query(
      `
      UPDATE telemedicina_configuraciones SET
        prefijo_sala = ?,
        zona_horaria = ?,
        nivel_seguridad = ?,
        calidad_video_default = ?,
        grabacion_automatica = ?,
        duracion_sesion_default = ?,
        tiempo_buffer_entre_sesiones = ?,
        proveedor_servicio = ?,
        proveedor_servicio_backup = ?,
        configuracion_json = ?,
        consulta_telemedicina_habilitada = ?,
        requerir_consentimiento = ?,
        id_plantilla_consentimiento = ?,
        forzar_2fa_acceso = ?,
        politica_encriptacion = ?,
        auditoria_detallada = ?,
        tiempo_espera_minutos = ?,
        sala_espera_virtual = ?,
        sala_espera_media_url = ?,
        mensaje_sala_espera = ?,
        permitir_autotest_dispositivo = ?,
        recordatorio_minutos_antes = ?,
        enviar_recordatorios = ?,
        reintentos_notificacion = ?,
        prioridad_notificacion = ?,
        minutos_recordatorio = ?,
        notificar_por_email = ?,
        notificar_por_sms = ?,
        webhook_eventos = ?,
        webhook_eventos_secundario = ?,
        publicar_en_portal_paciente = ?,
        branding_logo_url = ?,
        branding_color_primario = ?,
        idioma_interfaz = ?,
        idioma_paciente_preferido = ?,
        max_participantes = ?,
        compartir_pantalla_habilitado = ?,
        chat_habilitado = ?,
        permitir_chat_seguro = ?,
        permitir_telefono_respaldo = ?,
        telefono_respaldo_numero = ?,
        permite_grabacion = ?,
        retencion_grabaciones_dias = ?,
        visibilidad_grabacion = ?,
        transcripcion_automatica = ?,
        guardar_transcripcion = ?,
        generar_resumen_ia = ?,
        idioma_resumen_ia = ?,
        proveedor_ia = ?,
        precio_consulta_telemedicina = ?,
        horario_atencion = ?,
        dias_disponibles = ?,
        configuracion_avanzada = ?,
        modo_mantenimiento = ?,
        motivo_mantenimiento = ?
      WHERE id_configuracion = ?
      `,
      [
        cols.prefijo_sala,
        cols.zona_horaria,
        cols.nivel_seguridad,
        cols.calidad_video_default,
        cols.grabacion_automatica,
        cols.duracion_sesion_default,
        cols.tiempo_buffer_entre_sesiones,
        cols.proveedor_servicio,
        cols.proveedor_servicio_backup,
        JSON.stringify(mergedJSON),
        cols.consulta_telemedicina_habilitada,
        cols.requerir_consentimiento,
        cols.id_plantilla_consentimiento,
        cols.forzar_2fa_acceso,
        cols.politica_encriptacion,
        cols.auditoria_detallada,
        cols.tiempo_espera_minutos,
        cols.sala_espera_virtual,
        cols.sala_espera_media_url,
        cols.mensaje_sala_espera,
        cols.permitir_autotest_dispositivo,
        cols.recordatorio_minutos_antes,
        cols.enviar_recordatorios,
        cols.reintentos_notificacion,
        cols.prioridad_notificacion,
        cols.minutos_recordatorio,
        cols.notificar_por_email,
        cols.notificar_por_sms,
        cols.webhook_eventos,
        cols.webhook_eventos_secundario,
        cols.publicar_en_portal_paciente,
        cols.branding_logo_url,
        cols.branding_color_primario,
        cols.idioma_interfaz,
        cols.idioma_paciente_preferido,
        cols.max_participantes,
        cols.compartir_pantalla_habilitado,
        cols.chat_habilitado,
        cols.permitir_chat_seguro,
        cols.permitir_telefono_respaldo,
        cols.telefono_respaldo_numero,
        cols.permite_grabacion,
        cols.retencion_grabaciones_dias,
        cols.visibilidad_grabacion,
        cols.transcripcion_automatica,
        cols.guardar_transcripcion,
        cols.generar_resumen_ia,
        cols.idioma_resumen_ia,
        cols.proveedor_ia,
        cols.precio_consulta_telemedicina,
        cols.horario_atencion,
        cols.dias_disponibles,
        cols.configuracion_avanzada,
        cols.modo_mantenimiento,
        cols.motivo_mantenimiento,
        fila.id_configuracion,
      ]
    );

    const [rows] = await pool.query<TelemedicinaConfigRow[]>(
      `SELECT * FROM telemedicina_configuraciones WHERE id_configuracion = ?`,
      [fila.id_configuracion]
    );
    return rows[0];
  }
}

// =====================================================
// 4. HANDLERS
// =====================================================
export async function GET(req: NextRequest) {
  try {
    const token = getSessionToken(req);
    if (!token) {
      return NextResponse.json({ success: false, error: "No hay sesión activa" }, { status: 401 });
    }

    const idUsuario = await obtenerUsuarioDeSesion(token);
    if (!idUsuario) {
      return NextResponse.json({ success: false, error: "Sesión inválida" }, { status: 401 });
    }

    const medico = await obtenerMedicoPorUsuario(idUsuario);
    if (!medico) {
      return NextResponse.json(
        { success: false, error: "No tienes un médico asociado" },
        { status: 403 }
      );
    }

    // actualizar última actividad
    await pool.query(`UPDATE sesiones_usuarios SET ultima_actividad = NOW() WHERE token = ?`, [
      token,
    ]);

    let fila = await buscarConfig(medico.id_centro_principal, medico.id_medico);
    if (!fila) {
      fila = await crearConfigDefault(medico.id_centro_principal, medico.id_medico, idUsuario);
    }

    const dto = mapDBToDTO(fila);

    return NextResponse.json(
      {
        success: true,
        configuracion: dto,
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch (err: any) {
    console.error("❌ Error en GET /api/telemedicina/configuracion:", err);
    return NextResponse.json(
      {
        success: false,
        error: "Error interno del servidor",
        details: process.env.NODE_ENV === "development" ? err.message : undefined,
      },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const token = getSessionToken(req);
    if (!token) {
      return NextResponse.json({ success: false, error: "No hay sesión activa" }, { status: 401 });
    }

    const idUsuario = await obtenerUsuarioDeSesion(token);
    if (!idUsuario) {
      return NextResponse.json({ success: false, error: "Sesión inválida" }, { status: 401 });
    }

    const medico = await obtenerMedicoPorUsuario(idUsuario);
    if (!medico) {
      return NextResponse.json(
        { success: false, error: "No tienes un médico asociado" },
        { status: 403 }
      );
    }

    const body = await req.json();

    const fila = await guardarConfig(
      idUsuario,
      medico.id_centro_principal,
      medico.id_medico,
      body
    );

    const dto = mapDBToDTO(fila);

    return NextResponse.json(
      {
        success: true,
        configuracion: dto,
      },
      { status: 200 }
    );
  } catch (err: any) {
    console.error("❌ Error en POST /api/telemedicina/configuracion:", err);
    return NextResponse.json(
      {
        success: false,
        error: "Error interno del servidor",
        details: process.env.NODE_ENV === "development" ? err.message : undefined,
      },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  return POST(req);
}
