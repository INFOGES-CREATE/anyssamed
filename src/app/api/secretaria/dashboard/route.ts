// app/api/secretaria/dashboard/route.ts
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

interface EstadisticasResumen {
  citas_programadas_hoy: number;
  citas_completadas_hoy: number;
  citas_canceladas_hoy: number;
  citas_pendientes_confirmacion: number;
  pacientes_nuevos_mes: number;
  total_pacientes_activos: number;
  llamadas_realizadas_mes: number;
  recordatorios_enviados_mes: number;
  documentos_procesados_mes: number;
  tareas_pendientes: number;
  mensajes_sin_leer: number;
  reportes_generados_mes: number;
  tiempo_promedio_atencion: number;
  satisfaccion_pacientes: number;
}

interface CitaProxima {
  id_cita: number;
  fecha_hora: string;
  duracion_minutos: number;
  tipo_cita: string;
  modalidad: "presencial" | "telemedicina";
  estado: string;
  paciente: {
    id_paciente: number;
    nombre_completo: string;
    edad: number;
    foto_url: string | null;
    telefono: string | null;
  };
  medico: {
    id_medico: number;
    nombre_completo: string;
    especialidad: string;
  };
  motivo: string | null;
  sala: string | null;
  confirmada: boolean;
}

interface TareasPendientes {
  id_tarea: number;
  titulo: string;
  descripcion: string | null;
  prioridad: "baja" | "media" | "alta" | "critica";
  // tipo "visual" para el dashboard (chips, iconos, etc.)
  tipo: "llamada" | "documento" | "recordatorio" | "seguimiento" | "otra";
  // tipo real de la tarea según tu tabla
  tipo_tarea?: "tecnico" | "secretaria" | "administrativo" | "sistema";
  fecha_vencimiento: string | null;
  estado:
    | "pendiente"
    | "en_progreso"
    | "en_revision"
    | "en_espera"
    | "rechazada"
    | "resuelta"
    | "cerrada";
  asignado_a: string;
  fecha_creacion: string;
  url_accion?: string;

  // Campos extra (opcionales, por si los quieres usar en el futuro)
  centro?: string | null;
  sucursal?: string | null;
  creador?: string | null;
  responsable?: string | null;
  estado_asignacion?: "asignado" | "aceptado" | "rechazado" | "finalizado";
  rol_asignado?: "tecnico" | "secretaria" | "administrativo" | "supervisor";
  es_principal?: 0 | 1;
  fecha_asignacion?: string;
}

interface AlertaUrgente {
  id_alerta: number;
  tipo: "critica" | "alta" | "media" | "baja";
  titulo: string;
  descripcion: string;
  fecha_hora: string;
  leida: boolean;
  accion_requerida: string | null;
  url_accion?: string;
}

interface PacienteReciente {
  id_paciente: number;
  nombre_completo: string;
  edad: number;
  genero: string;
  foto_url: string | null;
  telefono: string | null;
  email: string | null;
  ultima_cita: string;
  proxima_cita: string | null;
  medico_asignado: string;
  estado_registro: "activo" | "inactivo" | "suspendido";
}

interface MetricaRendimiento {
  nombre: string;
  valor_actual: number;
  valor_anterior: number;
  unidad: string;
  tendencia: "up" | "down" | "neutral";
  porcentaje_cambio: number;
  icono: string;
  color: string;
  descripcion: string;
}

interface EventoCalendario {
  id: number;
  titulo: string;
  tipo: "cita" | "reunion" | "capacitacion" | "evento" | "otro";
  fecha_hora_inicio: string;
  fecha_hora_fin: string;
  ubicacion: string;
  estado: string;
  color: string;
  participantes?: number;
}

interface ActividadReciente {
  id: number;
  tipo: string;
  descripcion: string;
  fecha_hora: string;
  usuario: string;
  icono: string;
  color: string;
}

interface CentroMedicoInfo {
  id_centro: number;
  nombre: string;
  ciudad: string;
  region: string;
  telefono: string | null;
  email: string | null;
  logo_url: string | null;
  plan: "basico" | "profesional" | "premium" | "empresarial";
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

/**
 * Extrae el token de sesión de las cookies o headers
 */
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

/**
 * Obtiene la información de la secretaria autenticada
 */
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
      WHERE s.id_usuario = ? AND s.estado IN ('activo', 'suspendido')
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

/**
 * Obtiene la información del centro médico
 */
async function obtenerCentroMedico(
  idCentro: number
): Promise<CentroMedicoInfo | null> {
  try {
    const [rows] = await pool.query<RowDataPacket[]>(
      `
      SELECT 
        cm.id_centro,
        cm.nombre,
        cm.ciudad,
        cm.region,
        cm.telefono,
        cm.email_contacto AS email,
        cm.logo_url,
        cm.plan
      FROM centros_medicos cm
      WHERE cm.id_centro = ? AND cm.estado = 'activo'
      LIMIT 1
      `,
      [idCentro]
    );

    return rows.length > 0 ? (rows[0] as CentroMedicoInfo) : null;
  } catch (error) {
    console.error("Error al obtener centro médico:", error);
    throw error;
  }
}

/**
 * Obtiene las estadísticas resumen de la secretaria
 */
async function obtenerEstadisticas(
  idSecretaria: number,
  idCentro: number
): Promise<EstadisticasResumen> {
  try {
    const hoy = new Date().toISOString().split("T")[0];
    const inicioMes = new Date(
      new Date().getFullYear(),
      new Date().getMonth(),
      1
    )
      .toISOString()
      .split("T")[0];

    const queries = [
      // Citas programadas hoy
      pool.query<RowDataPacket[]>(
        `SELECT COUNT(*) as total FROM citas 
         WHERE id_centro = ? AND DATE(fecha_hora_inicio) = ? 
         AND estado NOT IN ('cancelada', 'no_asistio')`,
        [idCentro, hoy]
      ),
      // Citas completadas hoy
      pool.query<RowDataPacket[]>(
        `SELECT COUNT(*) as total FROM citas 
         WHERE id_centro = ? AND DATE(fecha_hora_inicio) = ? 
         AND estado = 'completada'`,
        [idCentro, hoy]
      ),
      // Citas canceladas hoy
      pool.query<RowDataPacket[]>(
        `SELECT COUNT(*) as total FROM citas c 
         INNER JOIN cancelaciones can ON c.id_cita = can.id_cita 
         WHERE c.id_centro = ? AND DATE(can.fecha_cancelacion) = ?`,
        [idCentro, hoy]
      ),
      // Citas pendientes de confirmación
      pool.query<RowDataPacket[]>(
        `SELECT COUNT(*) as total FROM citas 
         WHERE id_centro = ? AND estado = 'programada' 
         AND confirmado_por_paciente = 0 
         AND fecha_hora_inicio > NOW()`,
        [idCentro]
      ),
      // Pacientes nuevos del mes
      pool.query<RowDataPacket[]>(
        `SELECT COUNT(DISTINCT p.id_paciente) as total 
         FROM pacientes p
         INNER JOIN citas c ON p.id_paciente = c.id_paciente
         WHERE c.id_centro = ? AND p.fecha_creacion >= ?`,
        [idCentro, inicioMes]
      ),
      // Total pacientes activos
      pool.query<RowDataPacket[]>(
        `SELECT COUNT(DISTINCT id_paciente) as total 
         FROM pacientes WHERE estado = 'activo'`,
        []
      ),
      // Llamadas realizadas del mes
      pool.query<RowDataPacket[]>(
        `SELECT COUNT(*) as total FROM registro_llamadas 
         WHERE id_secretaria = ? AND DATE(fecha_hora) >= ?`,
        [idSecretaria, inicioMes]
      ),
      // Recordatorios enviados del mes
      pool.query<RowDataPacket[]>(
        `SELECT COUNT(*) as total FROM recordatorios_citas 
         WHERE id_centro = ? AND DATE(fecha_envio) >= ? AND estado = 'enviado'`,
        [idCentro, inicioMes]
      ),
      // Documentos procesados del mes
      pool.query<RowDataPacket[]>(
        `SELECT COUNT(*) as total FROM documentos_pacientes 
         WHERE id_centro = ? AND DATE(fecha_carga) >= ? AND estado = 'procesado'`,
        [idCentro, inicioMes]
      ),
      // Tareas pendientes (USANDO TUS TABLAS REALES)
      pool.query<RowDataPacket[]>(
        `
        SELECT COUNT(*) AS total
        FROM tareas t
        INNER JOIN tareas_asignaciones ta ON ta.id_tarea = t.id_tarea
        INNER JOIN secretarias s ON s.id_usuario = ta.id_usuario
        WHERE s.id_secretaria = ?
          AND (t.id_centro IS NULL OR t.id_centro = s.id_centro)
          AND t.estado IN ('pendiente','en_progreso','en_revision','en_espera')
        `,
        [idSecretaria]
      ),
      // Mensajes sin leer
      pool.query<RowDataPacket[]>(
        `SELECT COUNT(*) as total FROM mensajes_chat 
         WHERE id_destinatario = (SELECT id_usuario FROM secretarias WHERE id_secretaria = ?) 
         AND leido = 0`,
        [idSecretaria]
      ),
      // Reportes generados del mes
      pool.query<RowDataPacket[]>(
        `SELECT COUNT(*) as total FROM reportes_sistema 
         WHERE id_centro = ? AND DATE(fecha_generacion) >= ? AND estado = 'completado'`,
        [idCentro, inicioMes]
      ),
      // Tiempo promedio de atención (en minutos)
      pool.query<RowDataPacket[]>(
        `SELECT COALESCE(AVG(TIMESTAMPDIFF(MINUTE, fecha_inicio, fecha_fin)), 0) as promedio 
         FROM registro_llamadas 
         WHERE id_secretaria = ? AND DATE(fecha_hora) >= ? AND fecha_fin IS NOT NULL`,
        [idSecretaria, inicioMes]
      ),
      // Satisfacción de pacientes (promedio de calificaciones)
      pool.query<RowDataPacket[]>(
        `SELECT COALESCE(AVG(calificacion), 0) as promedio 
         FROM valoraciones_atencion_secretaria 
         WHERE id_secretaria = ? AND DATE(fecha_valoracion) >= ?`,
        [idSecretaria, inicioMes]
      ),
    ];

    const results = await Promise.all(queries);

    return {
      citas_programadas_hoy: results[0][0][0]?.total || 0,
      citas_completadas_hoy: results[1][0][0]?.total || 0,
      citas_canceladas_hoy: results[2][0][0]?.total || 0,
      citas_pendientes_confirmacion: results[3][0][0]?.total || 0,
      pacientes_nuevos_mes: results[4][0][0]?.total || 0,
      total_pacientes_activos: results[5][0][0]?.total || 0,
      llamadas_realizadas_mes: results[6][0][0]?.total || 0,
      recordatorios_enviados_mes: results[7][0][0]?.total || 0,
      documentos_procesados_mes: results[8][0][0]?.total || 0,
      tareas_pendientes: results[9][0][0]?.total || 0,
      mensajes_sin_leer: results[10][0][0]?.total || 0,
      reportes_generados_mes: results[11][0][0]?.total || 0,
      tiempo_promedio_atencion: Math.round(results[12][0][0]?.promedio || 0),
      satisfaccion_pacientes: parseFloat(results[13][0][0]?.promedio || "0"),
    };
  } catch (error) {
    console.error("Error al obtener estadísticas:", error);
    throw error;
  }
}

/**
 * Obtiene las citas próximas del centro para hoy
 */
async function obtenerCitasProximas(idCentro: number): Promise<CitaProxima[]> {
  try {
    const hoy = new Date().toISOString().split("T")[0];

    const [rows] = await pool.query<RowDataPacket[]>(
      `
      SELECT 
        c.id_cita,
        c.fecha_hora_inicio as fecha_hora,
        c.duracion_minutos,
        c.tipo_cita,
        CASE 
          WHEN c.tipo_cita = 'telemedicina' THEN 'telemedicina'
          ELSE 'presencial'
        END as modalidad,
        c.estado,
        c.motivo,
        c.confirmado_por_paciente as confirmada,
        p.id_paciente,
        CONCAT(p.nombre, ' ', p.apellido_paterno, ' ', COALESCE(p.apellido_materno, '')) as nombre_completo,
        TIMESTAMPDIFF(YEAR, p.fecha_nacimiento, CURDATE()) as edad,
        p.foto_url,
        p.telefono,
        m.id_medico,
        CONCAT(m.nombre, ' ', m.apellido_paterno) as medico_nombre,
        m.especialidad_principal,
        COALESCE(s.nombre, 'Consultorio Principal') as sala
      FROM citas c
      INNER JOIN pacientes p ON c.id_paciente = p.id_paciente
      INNER JOIN medicos m ON c.id_medico = m.id_medico
      LEFT JOIN salas s ON c.id_sala = s.id_sala
      WHERE c.id_centro = ?
        AND DATE(c.fecha_hora_inicio) = ?
        AND c.estado NOT IN ('cancelada', 'no_asistio')
      ORDER BY c.fecha_hora_inicio ASC
      LIMIT 20
      `,
      [idCentro, hoy]
    );

    return rows.map((row) => ({
      id_cita: row.id_cita,
      fecha_hora: row.fecha_hora,
      duracion_minutos: row.duracion_minutos,
      tipo_cita: row.tipo_cita,
      modalidad: row.modalidad,
      estado: row.estado,
      paciente: {
        id_paciente: row.id_paciente,
        nombre_completo: row.nombre_completo,
        edad: row.edad,
        foto_url: row.foto_url,
        telefono: row.telefono,
      },
      medico: {
        id_medico: row.id_medico,
        nombre_completo: row.medico_nombre,
        especialidad: row.especialidad_principal,
      },
      motivo: row.motivo,
      sala: row.sala,
      confirmada: row.confirmada === 1,
    }));
  } catch (error) {
    console.error("Error al obtener citas próximas:", error);
    throw error;
  }
}

/**
 * Obtiene las tareas pendientes de la secretaria (USANDO TUS TABLAS REALES)
 */
async function obtenerTareasPendientes(
  idSecretaria: number
): Promise<TareasPendientes[]> {
  try {
    const [rows] = await pool.query<RowDataPacket[]>(
      `
      SELECT 
        t.id_tarea,
        t.titulo,
        t.descripcion,
        t.prioridad,
        t.tipo_tarea,
        t.estado,
        t.fecha_creacion,
        t.fecha_limite,
        t.fecha_resolucion,
        cm.nombre AS centro,
        suc.nombre AS sucursal,
        CONCAT(u_creador.nombre, ' ', u_creador.apellido_paterno) AS creador,
        CONCAT(u_resp.nombre, ' ', u_resp.apellido_paterno) AS responsable,
        ta.estado AS estado_asignacion,
        ta.rol_asignado,
        ta.es_principal,
        ta.fecha_asignacion,
        CONCAT(u_asignado.nombre, ' ', u_asignado.apellido_paterno) AS asignado_a
      FROM tareas t
      INNER JOIN tareas_asignaciones ta ON ta.id_tarea = t.id_tarea
      INNER JOIN secretarias sec ON sec.id_usuario = ta.id_usuario
      INNER JOIN usuarios u_asignado ON u_asignado.id_usuario = ta.id_usuario
      LEFT JOIN usuarios u_creador ON u_creador.id_usuario = t.id_creador
      LEFT JOIN usuarios u_resp ON u_resp.id_usuario = t.id_responsable
      LEFT JOIN centros_medicos cm ON cm.id_centro = t.id_centro
      LEFT JOIN sucursales suc ON suc.id_sucursal = t.id_sucursal
      WHERE sec.id_secretaria = ?
        AND t.estado IN ('pendiente','en_progreso','en_revision','en_espera')
      ORDER BY 
        CASE t.prioridad
          WHEN 'critica' THEN 0
          WHEN 'alta' THEN 1
          WHEN 'media' THEN 2
          ELSE 3
        END ASC,
        t.fecha_limite ASC
      LIMIT 15
      `,
      [idSecretaria]
    );

    const mapTipoTareaToVisual = (
      tipo: string | null
    ): TareasPendientes["tipo"] => {
      switch (tipo) {
        case "tecnico":
          return "seguimiento";
        case "secretaria":
          return "documento";
        case "administrativo":
          return "otra";
        case "sistema":
          return "recordatorio";
        default:
          return "otra";
      }
    };

    return rows.map((row) => ({
      id_tarea: row.id_tarea,
      titulo: row.titulo,
      descripcion: row.descripcion,
      prioridad: row.prioridad,
      tipo: mapTipoTareaToVisual(row.tipo_tarea),
      tipo_tarea: row.tipo_tarea,
      fecha_vencimiento: row.fecha_limite,
      estado: row.estado,
      asignado_a: row.asignado_a,
      fecha_creacion: row.fecha_creacion,
      url_accion: `/secretaria/tareas/${row.id_tarea}`,
      centro: row.centro,
      sucursal: row.sucursal,
      creador: row.creador,
      responsable: row.responsable,
      estado_asignacion: row.estado_asignacion,
      rol_asignado: row.rol_asignado,
      es_principal: row.es_principal,
      fecha_asignacion: row.fecha_asignacion,
    }));
  } catch (error) {
    console.error("Error al obtener tareas pendientes:", error);
    throw error;
  }
}

/**
 * Genera alertas urgentes para la secretaria
 */
async function obtenerAlertasUrgentes(
  idSecretaria: number,
  idCentro: number
): Promise<AlertaUrgente[]> {
  try {
    const alertas: AlertaUrgente[] = [];
    let idAlerta = 1;

    // 1. Citas sin confirmar (próximas 24 horas)
    const [citasSinConfirmar] = await pool.query<RowDataPacket[]>(
      `
      SELECT 
        c.id_cita,
        CONCAT(p.nombre, ' ', p.apellido_paterno) as nombre_completo,
        c.fecha_hora_inicio
      FROM citas c
      INNER JOIN pacientes p ON c.id_paciente = p.id_paciente
      WHERE c.id_centro = ?
        AND c.estado = 'programada'
        AND c.confirmado_por_paciente = 0
        AND c.fecha_hora_inicio BETWEEN NOW() AND DATE_ADD(NOW(), INTERVAL 24 HOUR)
      ORDER BY c.fecha_hora_inicio ASC
      LIMIT 5
      `,
      [idCentro]
    );

    for (const cita of citasSinConfirmar) {
      alertas.push({
        id_alerta: idAlerta++,
        tipo: "media",
        titulo: "📅 Cita Sin Confirmar",
        descripcion: `${cita.nombre_completo} - Cita pendiente de confirmación`,
        fecha_hora: cita.fecha_hora_inicio,
        leida: false,
        accion_requerida: "Contactar al paciente",
        url_accion: `/secretaria/citas/${cita.id_cita}`,
      });
    }

    // 2. Documentos pendientes de procesar
    const [documentosPendientes] = await pool.query<RowDataPacket[]>(
      `
      SELECT 
        dp.id_documento,
        CONCAT(p.nombre, ' ', p.apellido_paterno) as nombre_completo,
        dp.tipo_documento,
        dp.fecha_carga
      FROM documentos_pacientes dp
      INNER JOIN pacientes p ON dp.id_paciente = p.id_paciente
      WHERE dp.id_centro = ?
        AND dp.estado = 'pendiente'
        AND dp.fecha_carga < DATE_SUB(NOW(), INTERVAL 24 HOUR)
      ORDER BY dp.fecha_carga ASC
      LIMIT 5
      `,
      [idCentro]
    );

    for (const doc of documentosPendientes) {
      alertas.push({
        id_alerta: idAlerta++,
        tipo: "alta",
        titulo: "📄 Documento Pendiente",
        descripcion: `${doc.nombre_completo}: ${doc.tipo_documento} requiere procesamiento`,
        fecha_hora: doc.fecha_carga,
        leida: false,
        accion_requerida: "Procesar documento",
        url_accion: `/secretaria/documentos/${doc.id_documento}`,
      });
    }

    // 3. Recordatorios no enviados
    const [recordatoriosPendientes] = await pool.query<RowDataPacket[]>(
      `
      SELECT 
        rc.id_recordatorio,
        CONCAT(p.nombre, ' ', p.apellido_paterno) as nombre_completo,
        rc.fecha_programada
      FROM recordatorios_citas rc
      INNER JOIN citas c ON rc.id_cita = c.id_cita
      INNER JOIN pacientes p ON c.id_paciente = p.id_paciente
      WHERE c.id_centro = ?
        AND rc.estado = 'pendiente'
        AND rc.fecha_programada < NOW()
      ORDER BY rc.fecha_programada ASC
      LIMIT 5
      `,
      [idCentro]
    );

    for (const recordatorio of recordatoriosPendientes) {
      alertas.push({
        id_alerta: idAlerta++,
        tipo: "media",
        titulo: "🔔 Recordatorio Pendiente",
        descripcion: `${recordatorio.nombre_completo} - Recordatorio de cita no enviado`,
        fecha_hora: recordatorio.fecha_programada,
        leida: false,
        accion_requerida: "Enviar recordatorio",
        url_accion: `/secretaria/recordatorios/${recordatorio.id_recordatorio}`,
      });
    }

    // 4. Tareas vencidas (USANDO TUS TABLAS REALES)
    const [tareasVencidas] = await pool.query<RowDataPacket[]>(
      `
      SELECT 
        t.id_tarea,
        t.titulo,
        t.fecha_limite AS fecha_vencimiento,
        t.prioridad
      FROM tareas t
      INNER JOIN tareas_asignaciones ta ON ta.id_tarea = t.id_tarea
      INNER JOIN secretarias s ON s.id_usuario = ta.id_usuario
      WHERE s.id_secretaria = ?
        AND t.estado IN ('pendiente','en_progreso','en_revision','en_espera')
        AND t.fecha_limite IS NOT NULL
        AND t.fecha_limite < NOW()
      ORDER BY t.fecha_limite ASC
      LIMIT 5
      `,
      [idSecretaria]
    );

    for (const tarea of tareasVencidas) {
      const tipoAlerta: AlertaUrgente["tipo"] =
        tarea.prioridad === "critica"
          ? "critica"
          : tarea.prioridad === "alta"
          ? "alta"
          : "media";

      alertas.push({
        id_alerta: idAlerta++,
        tipo: tipoAlerta,
        titulo: "⏰ Tarea Vencida",
        descripcion: `${tarea.titulo} - Fecha de vencimiento superada`,
        fecha_hora: tarea.fecha_vencimiento,
        leida: false,
        accion_requerida: "Completar tarea urgentemente",
        url_accion: `/secretaria/tareas/${tarea.id_tarea}`,
      });
    }

    // Ordenar por prioridad
    const ordenTipo: Record<AlertaUrgente["tipo"], number> = {
      critica: 1,
      alta: 2,
      media: 3,
      baja: 4,
    };

    alertas.sort((a, b) => {
      if (ordenTipo[a.tipo] !== ordenTipo[b.tipo]) {
        return ordenTipo[a.tipo] - ordenTipo[b.tipo];
      }
      return (
        new Date(b.fecha_hora).getTime() - new Date(a.fecha_hora).getTime()
      );
    });

    return alertas;
  } catch (error) {
    console.error("Error al obtener alertas urgentes:", error);
    throw error;
  }
}

/**
 * Obtiene los pacientes recientes del centro
 */
async function obtenerPacientesRecientes(
  idCentro: number
): Promise<PacienteReciente[]> {
  try {
    const [rows] = await pool.query<RowDataPacket[]>(
      `
      SELECT DISTINCT
        p.id_paciente,
        CONCAT(p.nombre, ' ', p.apellido_paterno, ' ', COALESCE(p.apellido_materno, '')) as nombre_completo,
        TIMESTAMPDIFF(YEAR, p.fecha_nacimiento, CURDATE()) as edad,
        p.genero,
        p.foto_url,
        p.telefono,
        p.email,
        p.estado,
        c.fecha_hora_inicio as ultima_cita,
        CONCAT(m.nombre, ' ', m.apellido_paterno) as medico_asignado,
        (
          SELECT MIN(fecha_hora_inicio)
          FROM citas
          WHERE id_paciente = p.id_paciente
            AND id_centro = ?
            AND fecha_hora_inicio > NOW()
            AND estado NOT IN ('cancelada', 'no_asistio')
        ) as proxima_cita
      FROM pacientes p
      INNER JOIN citas c ON p.id_paciente = c.id_paciente
      INNER JOIN medicos m ON c.id_medico = m.id_medico
      WHERE c.id_centro = ?
        AND c.fecha_hora_inicio >= DATE_SUB(NOW(), INTERVAL 30 DAY)
      GROUP BY p.id_paciente
      ORDER BY c.fecha_hora_inicio DESC
      LIMIT 10
      `,
      [idCentro, idCentro]
    );

    return rows.map((row) => ({
      id_paciente: row.id_paciente,
      nombre_completo: row.nombre_completo,
      edad: row.edad,
      genero: row.genero,
      foto_url: row.foto_url,
      telefono: row.telefono,
      email: row.email,
      ultima_cita: row.ultima_cita,
      proxima_cita: row.proxima_cita,
      medico_asignado: row.medico_asignado,
      estado_registro: row.estado,
    }));
  } catch (error) {
    console.error("Error al obtener pacientes recientes:", error);
    throw error;
  }
}

/**
 * Calcula métricas de rendimiento
 */
async function obtenerMetricasRendimiento(
  idSecretaria: number,
  idCentro: number
): Promise<MetricaRendimiento[]> {
  try {
    const ahora = new Date();
    const inicioMesActual = new Date(ahora.getFullYear(), ahora.getMonth(), 1)
      .toISOString()
      .split("T")[0];
    const inicioMesAnterior = new Date(
      ahora.getFullYear(),
      ahora.getMonth() - 1,
      1
    )
      .toISOString()
      .split("T")[0];
    const finMesAnterior = new Date(ahora.getFullYear(), ahora.getMonth(), 0)
      .toISOString()
      .split("T")[0];

    const queries = [
      pool.query<RowDataPacket[]>(
        `SELECT COUNT(*) as total FROM registro_llamadas 
         WHERE id_secretaria = ? AND DATE(fecha_hora) >= ?`,
        [idSecretaria, inicioMesActual]
      ),
      pool.query<RowDataPacket[]>(
        `SELECT COUNT(*) as total FROM registro_llamadas 
         WHERE id_secretaria = ? AND DATE(fecha_hora) BETWEEN ? AND ?`,
        [idSecretaria, inicioMesAnterior, finMesAnterior]
      ),
      pool.query<RowDataPacket[]>(
        `SELECT COUNT(*) as total FROM citas 
         WHERE id_centro = ? AND DATE(fecha_hora_inicio) >= ? 
         AND confirmado_por_paciente = 1`,
        [idCentro, inicioMesActual]
      ),
      pool.query<RowDataPacket[]>(
        `SELECT COUNT(*) as total FROM citas 
         WHERE id_centro = ? AND DATE(fecha_hora_inicio) BETWEEN ? AND ? 
         AND confirmado_por_paciente = 1`,
        [idCentro, inicioMesAnterior, finMesAnterior]
      ),
      pool.query<RowDataPacket[]>(
        `SELECT COUNT(*) as total FROM documentos_pacientes 
         WHERE id_centro = ? AND DATE(fecha_carga) >= ? AND estado = 'procesado'`,
        [idCentro, inicioMesActual]
      ),
      pool.query<RowDataPacket[]>(
        `SELECT COUNT(*) as total FROM documentos_pacientes 
         WHERE id_centro = ? AND DATE(fecha_carga) BETWEEN ? AND ? AND estado = 'procesado'`,
        [idCentro, inicioMesAnterior, finMesAnterior]
      ),
      pool.query<RowDataPacket[]>(
        `SELECT COALESCE(AVG(calificacion), 0) as promedio 
         FROM valoraciones_atencion_secretaria 
         WHERE id_secretaria = ? AND DATE(fecha_valoracion) >= ?`,
        [idSecretaria, inicioMesActual]
      ),
      pool.query<RowDataPacket[]>(
        `SELECT COALESCE(AVG(calificacion), 0) as promedio 
         FROM valoraciones_atencion_secretaria 
         WHERE id_secretaria = ? AND DATE(fecha_valoracion) BETWEEN ? AND ?`,
        [idSecretaria, inicioMesAnterior, finMesAnterior]
      ),
    ];

    const results = await Promise.all(queries);

    const calcularMetrica = (
      actual: number,
      anterior: number,
      unidad: string,
      nombre: string,
      icono: string,
      color: string,
      descripcion: string
    ): MetricaRendimiento => {
      const cambio = anterior > 0 ? ((actual - anterior) / anterior) * 100 : 0;
      const tendencia: "up" | "down" | "neutral" =
        cambio > 5 ? "up" : cambio < -5 ? "down" : "neutral";

      return {
        nombre,
        valor_actual: actual,
        valor_anterior: anterior,
        unidad,
        tendencia,
        porcentaje_cambio: Math.abs(Math.round(cambio)),
        icono,
        color,
        descripcion,
      };
    };

    return [
      calcularMetrica(
        results[0][0][0].total,
        results[1][0][0].total,
        "",
        "Llamadas",
        "Phone",
        "from-blue-500 to-cyan-500",
        "Total de llamadas realizadas este mes"
      ),
      calcularMetrica(
        results[2][0][0].total,
        results[3][0][0].total,
        "",
        "Citas Confirmadas",
        "CheckCircle2",
        "from-green-500 to-emerald-500",
        "Citas confirmadas por pacientes"
      ),
      calcularMetrica(
        results[4][0][0].total,
        results[5][0][0].total,
        "",
        "Documentos",
        "FileText",
        "from-purple-500 to-pink-500",
        "Documentos procesados este mes"
      ),
      calcularMetrica(
        Math.round(parseFloat(results[6][0][0].promedio)),
        Math.round(parseFloat(results[7][0][0].promedio)),
        "⭐",
        "Satisfacción",
        "Star",
        "from-yellow-500 to-orange-500",
        "Calificación promedio de pacientes"
      ),
    ];
  } catch (error) {
    console.error("Error al calcular métricas:", error);
    throw error;
  }
}

/**
 * Obtiene eventos del calendario
 */
async function obtenerEventosCalendario(
  idCentro: number
): Promise<EventoCalendario[]> {
  try {
    const hoy = new Date().toISOString().split("T")[0];

    const [rows] = await pool.query<RowDataPacket[]>(
      `
      SELECT 
        c.id_cita as id,
        CONCAT('Cita: ', p.nombre, ' ', p.apellido_paterno) as titulo,
        'cita' as tipo,
        c.fecha_hora_inicio as fecha_hora_inicio,
        c.fecha_hora_fin as fecha_hora_fin,
        COALESCE(s.nombre, 'Consultorio Principal') as ubicacion,
        c.estado,
        CASE 
          WHEN c.estado = 'completada' THEN '#10b981'
          WHEN c.estado = 'confirmada' THEN '#3b82f6'
          WHEN c.estado = 'programada' THEN '#f59e0b'
          ELSE '#6b7280'
        END as color
      FROM citas c
      INNER JOIN pacientes p ON c.id_paciente = p.id_paciente
      LEFT JOIN salas s ON c.id_sala = s.id_sala
      WHERE c.id_centro = ?
        AND DATE(c.fecha_hora_inicio) = ?
        AND c.estado NOT IN ('cancelada', 'no_asistio')
      ORDER BY c.fecha_hora_inicio ASC
      `,
      [idCentro, hoy]
    );

    return rows.map((row) => ({
      id: row.id,
      titulo: row.titulo,
      tipo: row.tipo,
      fecha_hora_inicio: row.fecha_hora_inicio,
      fecha_hora_fin: row.fecha_hora_fin,
      ubicacion: row.ubicacion,
      estado: row.estado,
      color: row.color,
    }));
  } catch (error) {
    console.error("Error al obtener eventos:", error);
    throw error;
  }
}

/**
 * Obtiene actividades recientes
 */
async function obtenerActividadesRecientes(
  idSecretaria: number
): Promise<ActividadReciente[]> {
  try {
    const [rows] = await pool.query<RowDataPacket[]>(
      `
      SELECT 
        l.id_log as id,
        l.tipo,
        l.accion as descripcion,
        l.fecha_hora,
        CONCAT(u.nombre, ' ', u.apellido_paterno) as usuario,
        CASE 
          WHEN l.tipo = 'llamada' THEN 'Phone'
          WHEN l.tipo = 'cita' THEN 'Calendar'
          WHEN l.tipo = 'documento' THEN 'FileText'
          WHEN l.tipo = 'recordatorio' THEN 'Bell'
          ELSE 'Activity'
        END as icono,
        CASE 
          WHEN l.tipo = 'llamada' THEN 'from-blue-500 to-cyan-500'
          WHEN l.tipo = 'cita' THEN 'from-green-500 to-emerald-500'
          WHEN l.tipo = 'documento' THEN 'from-purple-500 to-pink-500'
          WHEN l.tipo = 'recordatorio' THEN 'from-orange-500 to-red-500'
          ELSE 'from-gray-500 to-slate-500'
        END as color
      FROM logs_sistema l
      INNER JOIN usuarios u ON l.id_usuario = u.id_usuario
      WHERE l.id_usuario = (SELECT id_usuario FROM secretarias WHERE id_secretaria = ?)
      ORDER BY l.fecha_hora DESC
      LIMIT 10
      `,
      [idSecretaria]
    );

    return rows.map((row) => ({
      id: row.id,
      tipo: row.tipo,
      descripcion: row.descripcion,
      fecha_hora: row.fecha_hora,
      usuario: row.usuario,
      icono: row.icono,
      color: row.color,
    }));
  } catch (error) {
    console.error("Error al obtener actividades recientes:", error);
    return [];
  }
}

// ========================================
// HANDLER GET
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

    const idUsuario = sesiones[0].id_usuario;

    // Verificar que sea secretaria
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

    // Obtener información del centro médico
    const centroMedico = await obtenerCentroMedico(secretaria.id_centro);

    if (!centroMedico) {
      return NextResponse.json(
        { success: false, error: "Centro médico no encontrado" },
        { status: 404 }
      );
    }

    // Actualizar última actividad
    await pool.query(
      `UPDATE sesiones_usuarios SET ultima_actividad = NOW() WHERE token = ?`,
      [sessionToken]
    );

    // Obtener todos los datos en paralelo
    const [
      estadisticas,
      citasProximas,
      tareasPendientes,
      alertasUrgentes,
      pacientesRecientes,
      metricasRendimiento,
      eventosCalendario,
      actividadesRecientes,
    ] = await Promise.all([
      obtenerEstadisticas(secretaria.id_secretaria, secretaria.id_centro),
      obtenerCitasProximas(secretaria.id_centro),
      obtenerTareasPendientes(secretaria.id_secretaria),
      obtenerAlertasUrgentes(secretaria.id_secretaria, secretaria.id_centro),
      obtenerPacientesRecientes(secretaria.id_centro),
      obtenerMetricasRendimiento(secretaria.id_secretaria, secretaria.id_centro),
      obtenerEventosCalendario(secretaria.id_centro),
      obtenerActividadesRecientes(secretaria.id_secretaria),
    ]);

    return NextResponse.json(
      {
        success: true,
        secretaria: {
          id_secretaria: secretaria.id_secretaria,
          id_usuario: secretaria.id_usuario,
          id_centro: secretaria.id_centro,
          id_sucursal: secretaria.id_sucursal,
          id_departamento: secretaria.id_departamento,
          jornada: secretaria.jornada,
          extension_telefonica: secretaria.extension_telefonica,
          estado: secretaria.estado,
        },
        centro_medico: centroMedico,
        estadisticas,
        citas_proximas: citasProximas,
        tareas_pendientes: tareasPendientes,
        alertas_urgentes: alertasUrgentes,
        pacientes_recientes: pacientesRecientes,
        metricas_rendimiento: metricasRendimiento,
        eventos_calendario: eventosCalendario,
        actividades_recientes: actividadesRecientes,
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("❌ Error en GET /api/secretaria/dashboard:", error);

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
