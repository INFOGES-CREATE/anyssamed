// app/api/medico/dashboard/route.ts
import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { RowDataPacket } from "mysql2";

// ========================================
// TIPOS
// ========================================

interface MedicoData {
  id_medico: number;
  id_usuario: number;
  id_centro_principal: number;
  numero_registro_medico: string;
  titulo_profesional: string;
  especialidad_principal: string;
  anos_experiencia: number;
  calificacion_promedio: number;
}

interface EstadisticasResumen {
  citas_hoy: number;
  citas_pendientes: number;
  citas_completadas_hoy: number;
  citas_canceladas_hoy: number;
  pacientes_nuevos_mes: number;
  total_pacientes: number;
  consultas_mes: number;
  consultas_ano: number;
  recetas_emitidas_mes: number;
  ordenes_examen_mes: number;
  interconsultas_pendientes: number;
  mensajes_sin_leer: number;
  calificacion_promedio: number;
  total_resenas: number;
  ingresos_mes: number;
  telemedicina_activas: number;
  certificados_emitidos: number;
  procedimientos_mes: number;
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
    grupo_sanguineo: string;
  };
  motivo: string | null;
  notas: string | null;
  sala: string | null;
}

interface AlertaUrgente {
  id_alerta: number;
  tipo: "critica" | "alta" | "media" | "baja";
  titulo: string;
  descripcion: string;
  fecha_hora: string;
  leida: boolean;
  paciente?: {
    id_paciente: number;
    nombre_completo: string;
  };
  accion_requerida: string | null;
  url_accion?: string;
}

interface PacienteReciente {
  id_paciente: number;
  nombre_completo: string;
  edad: number;
  genero: string;
  foto_url: string | null;
  ultima_consulta: string;
  diagnostico_principal: string | null;
  estado_salud: "estable" | "atencion" | "critico";
  proxima_cita: string | null;
  alergias_criticas: number;
  condiciones_cronicas: number;
  grupo_sanguineo: string;
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
  tipo: "cita" | "cirugia" | "reunion" | "capacitacion" | "otro";
  fecha_hora_inicio: string;
  fecha_hora_fin: string;
  paciente?: string;
  ubicacion: string;
  estado: string;
  color: string;
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

// ========================================
// HELPER PARA OBTENER EL TOKEN
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

/**
 * Obtiene la información del médico autenticado
 */
async function obtenerMedicoAutenticado(
  idUsuario: number
): Promise<MedicoData | null> {
  try {
    const [rows] = await pool.query<RowDataPacket[]>(
      `
      SELECT 
        m.id_medico,
        m.id_usuario,
        m.id_centro_principal,
        m.numero_registro_medico,
        m.titulo_profesional,
        m.especialidad_principal,
        m.anos_experiencia,
        m.calificacion_promedio
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

/**
 * Obtiene las estadísticas resumen del médico
 */
async function obtenerEstadisticas(
  idMedico: number
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
    const inicioAno = new Date(new Date().getFullYear(), 0, 1)
      .toISOString()
      .split("T")[0];

    // Consultas paralelas para mejor rendimiento
    const [
      citasHoy,
      citasPendientes,
      citasCompletadasHoy,
      citasCanceladasHoy,
      pacientesNuevosMes,
      totalPacientes,
      consultasMes,
      consultasAno,
      recetasMes,
      ordenesMes,
      interconsultasPendientes,
      mensajesSinLeer,
      calificacion,
      ingresosMes,
      telemedicina,
      certificadosMes,
      procedimientosMes,
    ] = await Promise.all([
      // Citas de hoy
      pool.query<RowDataPacket[]>(
        `SELECT COUNT(*) as total FROM citas 
         WHERE id_medico = ? AND DATE(fecha_hora_inicio) = ? 
         AND estado NOT IN ('cancelada', 'no_asistio')`,
        [idMedico, hoy]
      ),

      // Citas pendientes
      pool.query<RowDataPacket[]>(
        `SELECT COUNT(*) as total FROM citas 
         WHERE id_medico = ? AND estado IN ('programada', 'pendiente') 
         AND fecha_hora_inicio > NOW()`,
        [idMedico]
      ),

      // Citas completadas hoy
      pool.query<RowDataPacket[]>(
        `SELECT COUNT(*) as total FROM citas 
         WHERE id_medico = ? AND DATE(fecha_hora_inicio) = ? 
         AND estado = 'completada'`,
        [idMedico, hoy]
      ),

      // Citas canceladas hoy
      pool.query<RowDataPacket[]>(
        `SELECT COUNT(*) as total FROM citas c 
         INNER JOIN cancelaciones can ON c.id_cita = can.id_cita 
         WHERE c.id_medico = ? AND DATE(can.fecha_cancelacion) = ?`,
        [idMedico, hoy]
      ),

      // Pacientes nuevos del mes
      pool.query<RowDataPacket[]>(
        `SELECT COUNT(DISTINCT pm.id_paciente) as total 
         FROM pacientes_medico pm 
         WHERE pm.id_medico = ? AND pm.fecha_asignacion >= ? AND pm.activo = 1`,
        [idMedico, inicioMes]
      ),

      // Total pacientes activos
      pool.query<RowDataPacket[]>(
        `SELECT COUNT(DISTINCT id_paciente) as total 
         FROM pacientes_medico WHERE id_medico = ? AND activo = 1`,
        [idMedico]
      ),

      // Consultas del mes
      pool.query<RowDataPacket[]>(
        `SELECT COUNT(*) as total FROM historial_clinico 
         WHERE id_medico = ? AND fecha_atencion >= ? AND estado_registro != 'anulado'`,
        [idMedico, inicioMes]
      ),

      // Consultas del año
      pool.query<RowDataPacket[]>(
        `SELECT COUNT(*) as total FROM historial_clinico 
         WHERE id_medico = ? AND fecha_atencion >= ? AND estado_registro != 'anulado'`,
        [idMedico, inicioAno]
      ),

      // Recetas del mes
      pool.query<RowDataPacket[]>(
        `SELECT COUNT(*) as total FROM recetas_medicas 
         WHERE id_medico = ? AND fecha_emision >= ? AND estado != 'anulada'`,
        [idMedico, inicioMes]
      ),

      // Órdenes de examen del mes
      pool.query<RowDataPacket[]>(
        `SELECT COUNT(*) as total FROM ordenes_examenes 
         WHERE id_medico = ? AND fecha_emision
 >= ? AND estado != 'anulada'`,
        [idMedico, inicioMes]
      ),

      // Interconsultas pendientes
      pool.query<RowDataPacket[]>(
        `SELECT COUNT(*) as total FROM interconsultas 
         WHERE id_medico_solicitante = ? AND estado IN ('pendiente', 'en_revision')`,
        [idMedico]
      ),

      // Mensajes sin leer
      pool.query<RowDataPacket[]>(
        `SELECT COUNT(*) as total FROM mensajes_chat 
         WHERE id_destinatario = (SELECT id_usuario FROM medicos WHERE id_medico = ?) 
         AND leido = 0`,
        [idMedico]
      ),

      // Calificación promedio
      pool.query<RowDataPacket[]>(
        `SELECT COALESCE(AVG(calificacion), 0) as promedio, COUNT(*) as total 
         FROM valoraciones_medicas WHERE id_medico = ? AND estado = 'visible'`,
        [idMedico]
      ),

      // Ingresos del mes
      pool.query<RowDataPacket[]>(
        `SELECT COALESCE(SUM(monto), 0) as total FROM citas 
         WHERE id_medico = ? AND fecha_hora_inicio >= ? AND pagada = 1 AND estado = 'completada'`,
        [idMedico, inicioMes]
      ),

      // Telemedicina activas
      pool.query<RowDataPacket[]>(
        `SELECT COUNT(*) as total FROM telemedicina_sesiones 
         WHERE id_medico = ? AND estado IN ('en_espera', 'en_curso')`,
        [idMedico]
      ),

      // Certificados emitidos del mes
      pool.query<RowDataPacket[]>(
        `SELECT COUNT(*) as total FROM certificados_medicos 
         WHERE id_medico = ? AND fecha_emision >= ? AND estado != 'anulado'`,
        [idMedico, inicioMes]
      ),

      // Procedimientos del mes
      pool.query<RowDataPacket[]>(
        `SELECT COUNT(*) as total FROM procedimientos 
         WHERE id_medico = ? AND fecha_procedimiento >= ? AND estado != 'cancelado'`,
        [idMedico, inicioMes]
      ),
    ]);

    return {
      citas_hoy: citasHoy[0][0]?.total || 0,
      citas_pendientes: citasPendientes[0][0]?.total || 0,
      citas_completadas_hoy: citasCompletadasHoy[0][0]?.total || 0,
      citas_canceladas_hoy: citasCanceladasHoy[0][0]?.total || 0,
      pacientes_nuevos_mes: pacientesNuevosMes[0][0]?.total || 0,
      total_pacientes: totalPacientes[0][0]?.total || 0,
      consultas_mes: consultasMes[0][0]?.total || 0,
      consultas_ano: consultasAno[0][0]?.total || 0,
      recetas_emitidas_mes: recetasMes[0][0]?.total || 0,
      ordenes_examen_mes: ordenesMes[0][0]?.total || 0,
      interconsultas_pendientes: interconsultasPendientes[0][0]?.total || 0,
      mensajes_sin_leer: mensajesSinLeer[0][0]?.total || 0,
      calificacion_promedio: parseFloat(calificacion[0][0]?.promedio || "0"),
      total_resenas: calificacion[0][0]?.total || 0,
      ingresos_mes: parseFloat(ingresosMes[0][0]?.total || "0"),
      telemedicina_activas: telemedicina[0][0]?.total || 0,
      certificados_emitidos: certificadosMes[0][0]?.total || 0,
      procedimientos_mes: procedimientosMes[0][0]?.total || 0,
    };
  } catch (error) {
    console.error("Error al obtener estadísticas:", error);
    throw error;
  }
}

/**
 * Obtiene las citas próximas del médico para hoy
 */
async function obtenerCitasProximas(
  idMedico: number
): Promise<CitaProxima[]> {
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
        c.notas,
        p.id_paciente,
        CONCAT(p.nombre, ' ', p.apellido_paterno, ' ', COALESCE(p.apellido_materno, '')) as nombre_completo,
        TIMESTAMPDIFF(YEAR, p.fecha_nacimiento, CURDATE()) as edad,
        p.foto_url,
        p.telefono,
        p.grupo_sanguineo,
        COALESCE(s.nombre, 'Consultorio Principal') as sala
      FROM citas c
      INNER JOIN pacientes p ON c.id_paciente = p.id_paciente
      LEFT JOIN salas s ON c.id_sala = s.id_sala
      WHERE c.id_medico = ?
        AND DATE(c.fecha_hora_inicio) = ?
        AND c.estado NOT IN ('cancelada', 'no_asistio')
      ORDER BY c.fecha_hora_inicio ASC
      LIMIT 20
      `,
      [idMedico, hoy]
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
        grupo_sanguineo: row.grupo_sanguineo || "N/A",
      },
      motivo: row.motivo,
      notas: row.notas,
      sala: row.sala,
    }));
  } catch (error) {
    console.error("Error al obtener citas próximas:", error);
    throw error;
  }
}

/**
 * Genera alertas urgentes basadas en múltiples criterios
 */
async function obtenerAlertasUrgentes(
  idMedico: number
): Promise<AlertaUrgente[]> {
  try {
    const alertas: AlertaUrgente[] = [];
    let idAlerta = 1;

    // 1. Pacientes con signos vitales críticos (últimas 24 horas)
    const [signosVitalesCriticos] = await pool.query<RowDataPacket[]>(
      `
      SELECT DISTINCT
        sv.id_paciente,
        CONCAT(p.nombre, ' ', p.apellido_paterno) as nombre_completo,
        sv.presion_sistolica,
        sv.presion_diastolica,
        sv.pulso as frecuencia_cardiaca,
        sv.temperatura,
        sv.saturacion_oxigeno,
        sv.fecha_creacion as fecha_hora_registro
      FROM signos_vitales sv
      INNER JOIN pacientes p ON sv.id_paciente = p.id_paciente
      INNER JOIN pacientes_medico pm ON p.id_paciente = pm.id_paciente
      WHERE pm.id_medico = ?
        AND pm.activo = 1
        AND sv.fecha_creacion >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
        AND (
          sv.presion_sistolica > 180 OR sv.presion_sistolica < 90
          OR sv.presion_diastolica > 120 OR sv.presion_diastolica < 60
          OR sv.pulso > 120 OR sv.pulso < 50
          OR sv.temperatura > 39 OR sv.temperatura < 35
          OR sv.saturacion_oxigeno < 90
        )
      ORDER BY sv.fecha_creacion DESC
      LIMIT 5
      `,
      [idMedico]
    );

    for (const signo of signosVitalesCriticos) {
      const problemas = [];
      if (signo.presion_sistolica > 180 || signo.presion_sistolica < 90)
        problemas.push(`Presión sistólica: ${signo.presion_sistolica} mmHg`);
      if (signo.presion_diastolica > 120 || signo.presion_diastolica < 60)
        problemas.push(
          `Presión diastólica: ${signo.presion_diastolica} mmHg`
        );
      if (signo.frecuencia_cardiaca > 120 || signo.frecuencia_cardiaca < 50)
        problemas.push(
          `Frecuencia cardíaca: ${signo.frecuencia_cardiaca} lpm`
        );
      if (signo.temperatura > 39 || signo.temperatura < 35)
        problemas.push(`Temperatura: ${signo.temperatura}°C`);
      if (signo.saturacion_oxigeno < 90)
        problemas.push(`SpO2: ${signo.saturacion_oxigeno}%`);

      alertas.push({
        id_alerta: idAlerta++,
        tipo: "critica",
        titulo: "🚨 Signos Vitales Críticos",
        descripcion: `${signo.nombre_completo}: ${problemas.join(", ")}`,
        fecha_hora: signo.fecha_hora_registro,
        leida: false,
        paciente: {
          id_paciente: signo.id_paciente,
          nombre_completo: signo.nombre_completo,
        },
        accion_requerida: "Evaluar inmediatamente al paciente",
        url_accion: `/medico/pacientes/${signo.id_paciente}`,
      });
    }

    // 2. Resultados de exámenes críticos pendientes
    const [examenesCriticos] = await pool.query<RowDataPacket[]>(
      `
      SELECT 
        re.id_resultado,
        re.id_paciente,
        CONCAT(p.nombre, ' ', p.apellido_paterno) as nombre_completo,
        oe.tipo_examen,
        re.fecha_resultado,
        re.resultado_preliminar
      FROM resultados_examenes re
      INNER JOIN ordenes_examenes oe ON re.id_orden = oe.id_orden
      INNER JOIN pacientes p ON re.id_paciente = p.id_paciente
      INNER JOIN pacientes_medico pm ON p.id_paciente = pm.id_paciente
      WHERE oe.id_medico = ?
        AND pm.activo = 1
        AND re.estado = 'disponible'
        AND re.revisado_por_medico = 0
        AND (
          re.resultado_preliminar LIKE '%anormal%'
          OR re.resultado_preliminar LIKE '%crítico%'
          OR re.resultado_preliminar LIKE '%urgente%'
          OR re.alerta_valor_critico = 1
        )
      ORDER BY re.fecha_resultado DESC
      LIMIT 5
      `,
      [idMedico]
    );

    for (const examen of examenesCriticos) {
      alertas.push({
        id_alerta: idAlerta++,
        tipo: "alta",
        titulo: "⚠️ Examen con Valores Críticos",
        descripcion: `${examen.nombre_completo}: ${examen.tipo_examen} requiere revisión urgente`,
        fecha_hora: examen.fecha_resultado,
        leida: false,
        paciente: {
          id_paciente: examen.id_paciente,
          nombre_completo: examen.nombre_completo,
        },
        accion_requerida: "Revisar resultados y contactar al paciente",
        url_accion: `/medico/examenes/${examen.id_resultado}`,
      });
    }

    // 3. Citas sin confirmar (próximas 24 horas)
    const [citasSinConfirmar] = await pool.query<RowDataPacket[]>(
      `
      SELECT 
        c.id_cita,
        c.id_paciente,
        CONCAT(p.nombre, ' ', p.apellido_paterno) as nombre_completo,
        c.fecha_hora_inicio,
        c.tipo_cita
      FROM citas c
      INNER JOIN pacientes p ON c.id_paciente = p.id_paciente
      WHERE c.id_medico = ?
        AND c.estado = 'programada'
        AND c.confirmado_por_paciente = 0
        AND c.fecha_hora_inicio BETWEEN NOW() AND DATE_ADD(NOW(), INTERVAL 24 HOUR)
      ORDER BY c.fecha_hora_inicio ASC
      LIMIT 5
      `,
      [idMedico]
    );

    for (const cita of citasSinConfirmar) {
      alertas.push({
        id_alerta: idAlerta++,
        tipo: "media",
        titulo: "📅 Cita Sin Confirmar",
        descripcion: `${cita.nombre_completo} - Cita pendiente de confirmación`,
        fecha_hora: cita.fecha_hora_inicio,
        leida: false,
        paciente: {
          id_paciente: cita.id_paciente,
          nombre_completo: cita.nombre_completo,
        },
        accion_requerida: "Contactar al paciente",
        url_accion: `/medico/agenda/${cita.id_cita}`,
      });
    }

    // 4. Tratamientos vencidos
    const [tratamientosVencidos] = await pool.query<RowDataPacket[]>(
      `
      SELECT 
        rm.id_receta,
        rm.id_paciente,
        CONCAT(p.nombre, ' ', p.apellido_paterno) as nombre_completo,
        rm.fecha_fin_tratamiento,
        COUNT(DISTINCT rmed.id_medicamento) as num_medicamentos
      FROM recetas_medicas rm
      INNER JOIN receta_medicamentos rmed ON rm.id_receta = rmed.id_receta
      INNER JOIN pacientes p ON rm.id_paciente = p.id_paciente
      INNER JOIN pacientes_medico pm ON p.id_paciente = pm.id_paciente
      WHERE rm.id_medico = ?
        AND pm.activo = 1
        AND rm.estado = 'activa'
        AND rm.fecha_fin_tratamiento < CURDATE()
        AND rm.requiere_seguimiento = 1
      GROUP BY rm.id_receta
      ORDER BY rm.fecha_fin_tratamiento DESC
      LIMIT 5
      `,
      [idMedico]
    );

    for (const tratamiento of tratamientosVencidos) {
      alertas.push({
        id_alerta: idAlerta++,
        tipo: "media",
        titulo: "💊 Tratamiento Vencido",
        descripcion: `${tratamiento.nombre_completo}: ${tratamiento.num_medicamentos} medicamento(s) requieren seguimiento`,
        fecha_hora: tratamiento.fecha_fin_tratamiento,
        leida: false,
        paciente: {
          id_paciente: tratamiento.id_paciente,
          nombre_completo: tratamiento.nombre_completo,
        },
        accion_requerida: "Evaluar renovación de tratamiento",
        url_accion: `/medico/recetas/${tratamiento.id_receta}`,
      });
    }

    // 5. Interconsultas urgentes sin respuesta
    const [interconsultasUrgentes] = await pool.query<RowDataPacket[]>(
      `
      SELECT 
        i.id_interconsulta,
        i.id_paciente,
        CONCAT(p.nombre, ' ', p.apellido_paterno) as nombre_completo,
        i.fecha_solicitud,
        e.nombre as especialidad_solicitada
      FROM interconsultas i
      INNER JOIN pacientes p ON i.id_paciente = p.id_paciente
      INNER JOIN especialidades e ON i.id_especialidad_destino = e.id_especialidad
      WHERE i.id_medico_solicitante = ?
        AND i.prioridad = 'urgente'
        AND i.estado = 'pendiente'
        AND i.fecha_solicitud < DATE_SUB(NOW(), INTERVAL 24 HOUR)
      ORDER BY i.fecha_solicitud ASC
      LIMIT 5
      `,
      [idMedico]
    );

    for (const interconsulta of interconsultasUrgentes) {
      alertas.push({
        id_alerta: idAlerta++,
        tipo: "alta",
        titulo: "🔄 Interconsulta Sin Respuesta",
        descripcion: `${interconsulta.nombre_completo}: ${interconsulta.especialidad_solicitada} pendiente +24h`,
        fecha_hora: interconsulta.fecha_solicitud,
        leida: false,
        paciente: {
          id_paciente: interconsulta.id_paciente,
          nombre_completo: interconsulta.nombre_completo,
        },
        accion_requerida: "Seguimiento con especialista",
        url_accion: `/medico/interconsultas/${interconsulta.id_interconsulta}`,
      });
    }

    // Ordenar por prioridad y fecha
    const ordenTipo = { critica: 1, alta: 2, media: 3, baja: 4 };
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
 * Obtiene los pacientes recientes del médico
 */
async function obtenerPacientesRecientes(
  idMedico: number
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
        p.grupo_sanguineo,
        hc.fecha_atencion as ultima_consulta,
        d.diagnostico as diagnostico_principal,
        CASE 
          WHEN EXISTS (
            SELECT 1 FROM signos_vitales sv 
            WHERE sv.id_paciente = p.id_paciente 
            AND sv.fecha_creacion >= DATE_SUB(NOW(), INTERVAL 7 DAY)
            AND (sv.presion_sistolica > 180 OR sv.presion_diastolica > 120 
                 OR sv.pulso > 120 OR sv.pulso < 50
                 OR sv.temperatura > 39 OR sv.saturacion_oxigeno < 90)
          ) THEN 'critico'
          WHEN EXISTS (
            SELECT 1 FROM signos_vitales sv 
            WHERE sv.id_paciente = p.id_paciente 
            AND sv.fecha_creacion >= DATE_SUB(NOW(), INTERVAL 7 DAY)
            AND (sv.presion_sistolica > 160 OR sv.presion_diastolica > 100 
                 OR sv.pulso > 100 OR sv.temperatura > 38)
          ) THEN 'atencion'
          ELSE 'estable'
        END as estado_salud,
        (
          SELECT MIN(fecha_hora_inicio)
          FROM citas
          WHERE id_paciente = p.id_paciente
            AND id_medico = ?
            AND fecha_hora_inicio > NOW()
            AND estado NOT IN ('cancelada', 'no_asistio')
        ) as proxima_cita,
        (
          SELECT COUNT(*)
          FROM alergias
          WHERE id_paciente = p.id_paciente
            AND estado = 'activa'
            AND severidad IN ('severa', 'fatal')
        ) as alergias_criticas,
        (
          SELECT COUNT(*)
          FROM antecedentes
          WHERE id_paciente = p.id_paciente
            AND estado = 'activo'
            AND tipo = 'patologico'
        ) as condiciones_cronicas
      FROM pacientes p
      INNER JOIN pacientes_medico pm ON p.id_paciente = pm.id_paciente
      LEFT JOIN historial_clinico hc ON p.id_paciente = hc.id_paciente
        AND hc.id_medico = ?
        AND hc.id_historial = (
          SELECT MAX(id_historial)
          FROM historial_clinico
          WHERE id_paciente = p.id_paciente AND id_medico = ?
        )
      LEFT JOIN diagnosticos d ON p.id_paciente = d.id_paciente
        AND d.tipo = 'principal' AND d.estado = 'activo'
        AND d.id_diagnostico = (
          SELECT MAX(id_diagnostico)
          FROM diagnosticos
          WHERE id_paciente = p.id_paciente 
            AND tipo = 'principal' AND estado = 'activo'
        )
      WHERE pm.id_medico = ?
        AND pm.activo = 1
        AND hc.fecha_atencion >= DATE_SUB(NOW(), INTERVAL 30 DAY)
      ORDER BY hc.fecha_atencion DESC
      LIMIT 10
      `,
      [idMedico, idMedico, idMedico, idMedico]
    );

    return rows.map((row) => ({
      id_paciente: row.id_paciente,
      nombre_completo: row.nombre_completo,
      edad: row.edad,
      genero: row.genero,
      foto_url: row.foto_url,
      ultima_consulta: row.ultima_consulta,
      diagnostico_principal: row.diagnostico_principal,
      estado_salud: row.estado_salud,
      proxima_cita: row.proxima_cita,
      alergias_criticas: row.alergias_criticas,
      condiciones_cronicas: row.condiciones_cronicas,
      grupo_sanguineo: row.grupo_sanguineo || "N/A",
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
  idMedico: number
): Promise<MetricaRendimiento[]> {
  try {
    const inicioMesActual = new Date(
      new Date().getFullYear(),
      new Date().getMonth(),
      1
    )
      .toISOString()
      .split("T")[0];
    const inicioMesAnterior = new Date(
      new Date().getFullYear(),
      new Date().getMonth() - 1,
      1
    )
      .toISOString()
      .split("T")[0];
    const finMesAnterior = new Date(
      new Date().getFullYear(),
      new Date().getMonth(),
      0
    )
      .toISOString()
      .split("T")[0];

    const [
      consultasActual,
      consultasAnterior,
      pacientesActual,
      pacientesAnterior,
      asistenciaActual,
      asistenciaAnterior,
      ingresosActual,
      ingresosAnterior,
    ] = await Promise.all([
      pool.query<RowDataPacket[]>(
        `SELECT COUNT(*) as total FROM historial_clinico 
         WHERE id_medico = ? AND fecha_atencion >= ?`,
        [idMedico, inicioMesActual]
      ),
      pool.query<RowDataPacket[]>(
        `SELECT COUNT(*) as total FROM historial_clinico 
         WHERE id_medico = ? AND fecha_atencion BETWEEN ? AND ?`,
        [idMedico, inicioMesAnterior, finMesAnterior]
      ),
      pool.query<RowDataPacket[]>(
        `SELECT COUNT(DISTINCT id_paciente) as total FROM historial_clinico 
         WHERE id_medico = ? AND fecha_atencion >= ?`,
        [idMedico, inicioMesActual]
      ),
      pool.query<RowDataPacket[]>(
        `SELECT COUNT(DISTINCT id_paciente) as total FROM historial_clinico 
         WHERE id_medico = ? AND fecha_atencion BETWEEN ? AND ?`,
        [idMedico, inicioMesAnterior, finMesAnterior]
      ),
      pool.query<RowDataPacket[]>(
        `SELECT 
          COUNT(CASE WHEN estado = 'completada' THEN 1 END) as completadas,
          COUNT(*) as total
         FROM citas WHERE id_medico = ? AND fecha_hora_inicio >= ?`,
        [idMedico, inicioMesActual]
      ),
      pool.query<RowDataPacket[]>(
        `SELECT 
          COUNT(CASE WHEN estado = 'completada' THEN 1 END) as completadas,
          COUNT(*) as total
         FROM citas WHERE id_medico = ? AND fecha_hora_inicio BETWEEN ? AND ?`,
        [idMedico, inicioMesAnterior, finMesAnterior]
      ),
      pool.query<RowDataPacket[]>(
        `SELECT COALESCE(SUM(monto), 0) as total FROM citas 
         WHERE id_medico = ? AND fecha_hora_inicio >= ? 
         AND pagada = 1 AND estado = 'completada'`,
        [idMedico, inicioMesActual]
      ),
      pool.query<RowDataPacket[]>(
        `SELECT COALESCE(SUM(monto), 0) as total FROM citas 
         WHERE id_medico = ? AND fecha_hora_inicio BETWEEN ? AND ? 
         AND pagada = 1 AND estado = 'completada'`,
        [idMedico, inicioMesAnterior, finMesAnterior]
      ),
    ]);

    const calcularMetrica = (
      actual: number,
      anterior: number,
      unidad: string,
      nombre: string,
      icono: string,
      color: string,
      descripcion: string
    ): MetricaRendimiento => {
      const cambio =
        anterior > 0 ? ((actual - anterior) / anterior) * 100 : 0;
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

    const tasaAsistenciaActual =
      asistenciaActual[0][0].total > 0
        ? (asistenciaActual[0][0].completadas / asistenciaActual[0][0].total) *
          100
        : 0;
    const tasaAsistenciaAnterior =
      asistenciaAnterior[0][0].total > 0
        ? (asistenciaAnterior[0][0].completadas /
            asistenciaAnterior[0][0].total) *
          100
        : 0;

    return [
      calcularMetrica(
        consultasActual[0][0].total,
        consultasAnterior[0][0].total,
        "",
        "Consultas",
        "Activity",
        "from-blue-500 to-cyan-500",
        "Total de consultas realizadas este mes"
      ),
      calcularMetrica(
        pacientesActual[0][0].total,
        pacientesAnterior[0][0].total,
        "",
        "Pacientes",
        "Users",
        "from-green-500 to-emerald-500",
        "Pacientes únicos atendidos este mes"
      ),
      calcularMetrica(
        Math.round(tasaAsistenciaActual),
        Math.round(tasaAsistenciaAnterior),
        "%",
        "Asistencia",
        "CheckCircle2",
        "from-purple-500 to-pink-500",
        "Porcentaje de citas completadas"
      ),
      calcularMetrica(
        parseFloat(ingresosActual[0][0].total),
        parseFloat(ingresosAnterior[0][0].total),
        "$",
        "Ingresos",
        "DollarSign",
        "from-emerald-500 to-teal-500",
        "Ingresos generados este mes"
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
  idMedico: number
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
        CONCAT(p.nombre, ' ', p.apellido_paterno) as paciente,
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
      WHERE c.id_medico = ?
        AND DATE(c.fecha_hora_inicio) = ?
        AND c.estado NOT IN ('cancelada', 'no_asistio')
      ORDER BY c.fecha_hora_inicio ASC
      `,
      [idMedico, hoy]
    );

    return rows.map((row) => ({
      id: row.id,
      titulo: row.titulo,
      tipo: row.tipo,
      fecha_hora_inicio: row.fecha_hora_inicio,
      fecha_hora_fin: row.fecha_hora_fin,
      paciente: row.paciente,
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
  idMedico: number
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
          WHEN l.tipo = 'consulta' THEN 'ClipboardCheck'
          WHEN l.tipo = 'receta' THEN 'Pill'
          WHEN l.tipo = 'examen' THEN 'TestTube'
          WHEN l.tipo = 'certificado' THEN 'FileText'
          ELSE 'Activity'
        END as icono,
        CASE 
          WHEN l.tipo = 'consulta' THEN 'from-blue-500 to-cyan-500'
          WHEN l.tipo = 'receta' THEN 'from-green-500 to-emerald-500'
          WHEN l.tipo = 'examen' THEN 'from-purple-500 to-pink-500'
          WHEN l.tipo = 'certificado' THEN 'from-orange-500 to-red-500'
          ELSE 'from-gray-500 to-slate-500'
        END as color
      FROM logs_sistema l
      INNER JOIN usuarios u ON l.id_usuario = u.id_usuario
      WHERE l.id_usuario = (SELECT id_usuario FROM medicos WHERE id_medico = ?)
      ORDER BY l.fecha_hora DESC
      LIMIT 10
      `,
      [idMedico]
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
    console.error("Error al obtener actividades:", error);
    // Retornar array vacío en caso de error
    return [];
  }
}

// ========================================
// HANDLER GET
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
          error:
            "No tienes un registro de médico activo. Contacta al administrador.",
        },
        { status: 403 }
      );
    }

    // 4. Actualizar última actividad
    await pool.query(
      `UPDATE sesiones_usuarios SET ultima_actividad = NOW() WHERE token = ?`,
      [sessionToken]
    );

    // 5. Obtener todos los datos en paralelo
    const [
      estadisticas,
      citasProximas,
      alertasUrgentes,
      pacientesRecientes,
      metricasRendimiento,
      eventosCalendario,
      actividadesRecientes,
    ] = await Promise.all([
      obtenerEstadisticas(medico.id_medico),
      obtenerCitasProximas(medico.id_medico),
      obtenerAlertasUrgentes(medico.id_medico),
      obtenerPacientesRecientes(medico.id_medico),
      obtenerMetricasRendimiento(medico.id_medico),
      obtenerEventosCalendario(medico.id_medico),
      obtenerActividadesRecientes(medico.id_medico),
    ]);

    // 6. Respuesta exitosa
    return NextResponse.json(
      {
        success: true,
        medico: {
          id_medico: medico.id_medico,
          numero_registro_medico: medico.numero_registro_medico,
          titulo_profesional: medico.titulo_profesional,
          especialidad_principal: medico.especialidad_principal,
          anos_experiencia: medico.anos_experiencia,
          calificacion_promedio: medico.calificacion_promedio,
        },
        estadisticas,
        citas_proximas: citasProximas,
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
    console.error("❌ Error en GET /api/medico/dashboard:", error);

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