// frontend/src/app/api/admin/usuarios/[id]/estadisticas/route.ts
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { RowDataPacket } from "mysql2";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  let connection;

  try {
    const idUsuario = parseInt(params.id);

    if (isNaN(idUsuario)) {
      return NextResponse.json(
        { success: false, error: "ID de usuario inválido" },
        { status: 400 }
      );
    }

    connection = await pool.getConnection();

    // ========== ESTADÍSTICAS GENERALES ==========
    const [estadisticasGenerales] = await connection.query<RowDataPacket[]>(
      `SELECT 
        -- Citas
        COALESCE((SELECT COUNT(*) FROM citas WHERE id_paciente = ? OR id_medico = ?), 0) as total_citas,
        COALESCE((SELECT COUNT(*) FROM citas WHERE (id_paciente = ? OR id_medico = ?) AND estado = 'completada'), 0) as citas_completadas,
        COALESCE((SELECT COUNT(*) FROM citas WHERE (id_paciente = ? OR id_medico = ?) AND estado = 'cancelada'), 0) as citas_canceladas,
        COALESCE((SELECT COUNT(*) FROM citas WHERE (id_paciente = ? OR id_medico = ?) AND estado = 'programada'), 0) as citas_programadas,
        COALESCE((SELECT COUNT(*) FROM citas WHERE (id_paciente = ? OR id_medico = ?) AND estado = 'confirmada'), 0) as citas_confirmadas,
        COALESCE((SELECT COUNT(*) FROM citas WHERE (id_paciente = ? OR id_medico = ?) AND estado = 'no_asistio'), 0) as citas_no_asistio,
        COALESCE((SELECT COUNT(*) FROM citas WHERE (id_paciente = ? OR id_medico = ?) AND fecha_hora_inicio >= CURDATE()), 0) as citas_futuras,
        COALESCE((SELECT COUNT(*) FROM citas WHERE (id_paciente = ? OR id_medico = ?) AND prioridad = 'urgente'), 0) as citas_urgentes,
        COALESCE((SELECT SUM(monto) FROM citas WHERE (id_paciente = ? OR id_medico = ?) AND pagada = 1), 0) as ingresos_totales,
        COALESCE((SELECT COUNT(*) FROM citas WHERE (id_paciente = ? OR id_medico = ?) AND pagada = 0), 0) as citas_sin_pagar,
        
        -- Logs
        COALESCE((SELECT COUNT(*) FROM logs_sistema WHERE id_usuario = ?), 0) as total_logs,
        COALESCE((SELECT COUNT(*) FROM logs_sistema WHERE id_usuario = ? AND tipo = 'error'), 0) as logs_error,
        COALESCE((SELECT COUNT(*) FROM logs_sistema WHERE id_usuario = ? AND tipo = 'security'), 0) as logs_seguridad,
        COALESCE((SELECT COUNT(*) FROM logs_sistema WHERE id_usuario = ? AND tipo = 'audit'), 0) as logs_auditoria,
        COALESCE((SELECT COUNT(*) FROM logs_sistema WHERE id_usuario = ? AND tipo = 'warning'), 0) as logs_advertencia,
        COALESCE((SELECT COUNT(*) FROM logs_sistema WHERE id_usuario = ? AND exitoso = 0), 0) as logs_fallidos,
        
        -- Actividad
        (SELECT fecha_hora FROM logs_sistema WHERE id_usuario = ? ORDER BY fecha_hora DESC LIMIT 1) as ultima_actividad,
        (SELECT COUNT(*) FROM logs_sistema WHERE id_usuario = ? AND DATE(fecha_hora) = CURDATE()) as actividad_hoy,
        (SELECT COUNT(*) FROM logs_sistema WHERE id_usuario = ? AND fecha_hora >= DATE_SUB(NOW(), INTERVAL 7 DAY)) as actividad_semana,
        (SELECT COUNT(*) FROM logs_sistema WHERE id_usuario = ? AND fecha_hora >= DATE_SUB(NOW(), INTERVAL 30 DAY)) as actividad_mes,
        
        -- Información del usuario
        (SELECT COUNT(DISTINCT id_paciente) FROM citas WHERE id_medico = ?) as pacientes_atendidos,
        (SELECT COUNT(DISTINCT id_medico) FROM citas WHERE id_paciente = ?) as medicos_consultados
      `,
      [
        idUsuario, idUsuario, // total_citas
        idUsuario, idUsuario, // completadas
        idUsuario, idUsuario, // canceladas
        idUsuario, idUsuario, // programadas
        idUsuario, idUsuario, // confirmadas
        idUsuario, idUsuario, // no_asistio
        idUsuario, idUsuario, // futuras
        idUsuario, idUsuario, // urgentes
        idUsuario, idUsuario, // ingresos_totales
        idUsuario, idUsuario, // sin_pagar
        idUsuario, // total_logs
        idUsuario, // logs_error
        idUsuario, // logs_seguridad
        idUsuario, // logs_auditoria
        idUsuario, // logs_advertencia
        idUsuario, // logs_fallidos
        idUsuario, // ultima_actividad
        idUsuario, // actividad_hoy
        idUsuario, // actividad_semana
        idUsuario, // actividad_mes
        idUsuario, // pacientes_atendidos
        idUsuario, // medicos_consultados
      ]
    );

    // ========== ESTADÍSTICAS POR MES (ÚLTIMOS 6 MESES) ==========
    const [actividadMensual] = await connection.query<RowDataPacket[]>(
      `SELECT 
        DATE_FORMAT(fecha_hora, '%Y-%m') as mes,
        DATE_FORMAT(fecha_hora, '%b %Y') as mes_formato,
        COUNT(*) as total_actividades,
        COUNT(DISTINCT DATE(fecha_hora)) as dias_activos,
        SUM(CASE WHEN tipo = 'error' THEN 1 ELSE 0 END) as errores,
        SUM(CASE WHEN tipo = 'security' THEN 1 ELSE 0 END) as eventos_seguridad,
        SUM(CASE WHEN exitoso = 0 THEN 1 ELSE 0 END) as acciones_fallidas
      FROM logs_sistema
      WHERE id_usuario = ?
        AND fecha_hora >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
      GROUP BY DATE_FORMAT(fecha_hora, '%Y-%m')
      ORDER BY mes DESC`,
      [idUsuario]
    );

    // ========== CITAS POR ESTADO ==========
    const [citasPorEstado] = await connection.query<RowDataPacket[]>(
      `SELECT 
        estado,
        COUNT(*) as cantidad,
        ROUND((COUNT(*) * 100.0 / (SELECT COUNT(*) FROM citas WHERE id_paciente = ? OR id_medico = ?)), 2) as porcentaje
      FROM citas
      WHERE id_paciente = ? OR id_medico = ?
      GROUP BY estado
      ORDER BY cantidad DESC`,
      [idUsuario, idUsuario, idUsuario, idUsuario]
    );

    // ========== CITAS POR TIPO ==========
    const [citasPorTipo] = await connection.query<RowDataPacket[]>(
      `SELECT 
        tipo_cita,
        COUNT(*) as cantidad,
        ROUND((COUNT(*) * 100.0 / (SELECT COUNT(*) FROM citas WHERE id_paciente = ? OR id_medico = ?)), 2) as porcentaje,
        COALESCE(SUM(CASE WHEN pagada = 1 THEN monto ELSE 0 END), 0) as ingresos
      FROM citas
      WHERE id_paciente = ? OR id_medico = ?
      GROUP BY tipo_cita
      ORDER BY cantidad DESC`,
      [idUsuario, idUsuario, idUsuario, idUsuario]
    );

    // ========== CITAS POR ORIGEN ==========
    const [citasPorOrigen] = await connection.query<RowDataPacket[]>(
      `SELECT 
        origen,
        COUNT(*) as cantidad,
        ROUND((COUNT(*) * 100.0 / (SELECT COUNT(*) FROM citas WHERE id_paciente = ? OR id_medico = ?)), 2) as porcentaje
      FROM citas
      WHERE id_paciente = ? OR id_medico = ?
      GROUP BY origen
      ORDER BY cantidad DESC`,
      [idUsuario, idUsuario, idUsuario, idUsuario]
    );

    // ========== CITAS POR PRIORIDAD ==========
    const [citasPorPrioridad] = await connection.query<RowDataPacket[]>(
      `SELECT 
        prioridad,
        COUNT(*) as cantidad,
        ROUND((COUNT(*) * 100.0 / (SELECT COUNT(*) FROM citas WHERE id_paciente = ? OR id_medico = ?)), 2) as porcentaje
      FROM citas
      WHERE id_paciente = ? OR id_medico = ?
      GROUP BY prioridad
      ORDER BY cantidad DESC`,
      [idUsuario, idUsuario, idUsuario, idUsuario]
    );

    // ========== MÓDULOS MÁS UTILIZADOS ==========
    const [modulosMasUsados] = await connection.query<RowDataPacket[]>(
      `SELECT 
        modulo,
        COUNT(*) as accesos,
        COUNT(DISTINCT DATE(fecha_hora)) as dias_uso,
        MAX(fecha_hora) as ultimo_acceso,
        SUM(CASE WHEN tipo = 'error' THEN 1 ELSE 0 END) as errores,
        SUM(CASE WHEN exitoso = 0 THEN 1 ELSE 0 END) as fallos
      FROM logs_sistema
      WHERE id_usuario = ?
        AND fecha_hora >= DATE_SUB(NOW(), INTERVAL 30 DAY)
      GROUP BY modulo
      ORDER BY accesos DESC
      LIMIT 10`,
      [idUsuario]
    );

    // ========== ACCIONES MÁS FRECUENTES ==========
    const [accionesFrecuentes] = await connection.query<RowDataPacket[]>(
      `SELECT 
        accion,
        modulo,
        COUNT(*) as frecuencia,
        MAX(fecha_hora) as ultima_vez,
        SUM(CASE WHEN exitoso = 0 THEN 1 ELSE 0 END) as fallos,
        SUM(CASE WHEN tipo = 'error' THEN 1 ELSE 0 END) as errores
      FROM logs_sistema
      WHERE id_usuario = ?
        AND fecha_hora >= DATE_SUB(NOW(), INTERVAL 30 DAY)
      GROUP BY accion, modulo
      ORDER BY frecuencia DESC
      LIMIT 15`,
      [idUsuario]
    );

    // ========== HORARIOS DE ACTIVIDAD ==========
    const [horarioActividad] = await connection.query<RowDataPacket[]>(
      `SELECT 
        HOUR(fecha_hora) as hora,
        CONCAT(LPAD(HOUR(fecha_hora), 2, '0'), ':00') as hora_formato,
        COUNT(*) as actividades,
        COUNT(DISTINCT DATE(fecha_hora)) as dias,
        SUM(CASE WHEN tipo = 'error' THEN 1 ELSE 0 END) as errores
      FROM logs_sistema
      WHERE id_usuario = ?
        AND fecha_hora >= DATE_SUB(NOW(), INTERVAL 30 DAY)
      GROUP BY HOUR(fecha_hora)
      ORDER BY hora`,
      [idUsuario]
    );

    // ========== DÍAS DE LA SEMANA MÁS ACTIVOS ==========
    const [diasSemana] = await connection.query<RowDataPacket[]>(
      `SELECT 
        DAYNAME(fecha_hora) as dia_semana,
        DAYOFWEEK(fecha_hora) as dia_numero,
        COUNT(*) as actividades,
        COUNT(DISTINCT DATE(fecha_hora)) as ocurrencias,
        SUM(CASE WHEN tipo = 'error' THEN 1 ELSE 0 END) as errores
      FROM logs_sistema
      WHERE id_usuario = ?
        AND fecha_hora >= DATE_SUB(NOW(), INTERVAL 30 DAY)
      GROUP BY DAYNAME(fecha_hora), DAYOFWEEK(fecha_hora)
      ORDER BY dia_numero`,
      [idUsuario]
    );

    // ========== ERRORES RECIENTES ==========
    const [erroresRecientes] = await connection.query<RowDataPacket[]>(
      `SELECT 
        id_log,
        fecha_hora,
        modulo,
        accion,
        descripcion,
        nivel_severidad,
        ip_origen,
        mensaje_error
      FROM logs_sistema
      WHERE id_usuario = ?
        AND tipo = 'error'
      ORDER BY fecha_hora DESC
      LIMIT 15`,
      [idUsuario]
    );

    // ========== EVENTOS DE SEGURIDAD ==========
    const [eventosSeguridad] = await connection.query<RowDataPacket[]>(
      `SELECT 
        id_log,
        fecha_hora,
        accion,
        descripcion,
        ip_origen,
        nivel_severidad,
        agente_usuario,
        objeto_tipo,
        objeto_id
      FROM logs_sistema
      WHERE id_usuario = ?
        AND tipo = 'security'
      ORDER BY fecha_hora DESC
      LIMIT 15`,
      [idUsuario]
    );

    // ========== AUDITORÍA RECIENTE ==========
    const [auditReciente] = await connection.query<RowDataPacket[]>(
      `SELECT 
        id_log,
        fecha_hora,
        accion,
        modulo,
        descripcion,
        objeto_tipo,
        objeto_id,
        exitoso
      FROM logs_sistema
      WHERE id_usuario = ?
        AND tipo = 'audit'
      ORDER BY fecha_hora DESC
      LIMIT 15`,
      [idUsuario]
    );

    // ========== CITAS RECIENTES ==========
    const [citasRecientes] = await connection.query<RowDataPacket[]>(
      `SELECT 
        c.id_cita,
        c.fecha_hora_inicio,
        c.fecha_hora_fin,
        c.tipo_cita,
        c.estado,
        c.prioridad,
        c.pagada,
        c.monto,
        c.origen,
        CASE 
          WHEN c.id_paciente = ? THEN CONCAT(u.nombre, ' ', u.apellido_paterno)
          ELSE 'Paciente'
        END as nombre_paciente,
        CASE 
          WHEN c.id_medico = ? THEN CONCAT(u.nombre, ' ', u.apellido_paterno)
          ELSE 'Médico'
        END as nombre_medico
      FROM citas c
      LEFT JOIN usuarios u ON (c.id_paciente = u.id_usuario OR c.id_medico = u.id_usuario)
      WHERE c.id_paciente = ? OR c.id_medico = ?
      ORDER BY c.fecha_hora_inicio DESC
      LIMIT 20`,
      [idUsuario, idUsuario, idUsuario, idUsuario]
    );

    // ========== TIPOS DE ACCIONES POR MÓDULO ==========
    const [accionesPorModulo] = await connection.query<RowDataPacket[]>(
      `SELECT 
        modulo,
        accion,
        COUNT(*) as cantidad
      FROM logs_sistema
      WHERE id_usuario = ?
        AND fecha_hora >= DATE_SUB(NOW(), INTERVAL 30 DAY)
      GROUP BY modulo, accion
      ORDER BY modulo, cantidad DESC`,
      [idUsuario]
    );

    // ========== DISTRIBUCIÓN DE SEVERIDAD ==========
    const [distribucionSeveridad] = await connection.query<RowDataPacket[]>(
      `SELECT 
        nivel_severidad,
        COUNT(*) as cantidad,
        ROUND((COUNT(*) * 100.0 / (SELECT COUNT(*) FROM logs_sistema WHERE id_usuario = ?)), 2) as porcentaje
      FROM logs_sistema
      WHERE id_usuario = ?
      GROUP BY nivel_severidad
      ORDER BY nivel_severidad`,
      [idUsuario, idUsuario]
    );

    // ========== ESTADÍSTICAS DE PAGOS ==========
    const [estadisticasPagos] = await connection.query<RowDataPacket[]>(
      `SELECT 
        COUNT(*) as total_citas,
        SUM(CASE WHEN pagada = 1 THEN 1 ELSE 0 END) as citas_pagadas,
        SUM(CASE WHEN pagada = 0 THEN 1 ELSE 0 END) as citas_sin_pagar,
        COALESCE(SUM(CASE WHEN pagada = 1 THEN monto ELSE 0 END), 0) as total_pagado,
        COALESCE(SUM(CASE WHEN pagada = 0 THEN monto ELSE 0 END), 0) as total_pendiente,
        ROUND(COALESCE(AVG(CASE WHEN pagada = 1 THEN monto ELSE NULL END), 0), 2) as promedio_pago
      FROM citas
      WHERE id_paciente = ? OR id_medico = ?`,
      [idUsuario, idUsuario]
    );

    // ========== TASA DE ÉXITO DE ACCIONES ==========
    const [tasaExito] = await connection.query<RowDataPacket[]>(
      `SELECT 
        COUNT(*) as total_acciones,
        SUM(CASE WHEN exitoso = 1 THEN 1 ELSE 0 END) as acciones_exitosas,
        SUM(CASE WHEN exitoso = 0 THEN 1 ELSE 0 END) as acciones_fallidas,
        ROUND((SUM(CASE WHEN exitoso = 1 THEN 1 ELSE 0 END) * 100.0 / COUNT(*)), 2) as porcentaje_exito
      FROM logs_sistema
      WHERE id_usuario = ?
        AND fecha_hora >= DATE_SUB(NOW(), INTERVAL 30 DAY)`,
      [idUsuario]
    );

    connection.release();

    return NextResponse.json({
      success: true,
      data: {
        resumen: estadisticasGenerales[0] || {},
        actividad_mensual: actividadMensual,
        citas_por_estado: citasPorEstado,
        citas_por_tipo: citasPorTipo,
        citas_por_origen: citasPorOrigen,
        citas_por_prioridad: citasPorPrioridad,
        modulos_mas_usados: modulosMasUsados,
        acciones_frecuentes: accionesFrecuentes,
        horario_actividad: horarioActividad,
        dias_semana: diasSemana,
        errores_recientes: erroresRecientes,
        eventos_seguridad: eventosSeguridad,
        auditoria_reciente: auditReciente,
        citas_recientes: citasRecientes,
        acciones_por_modulo: accionesPorModulo,
        distribucion_severidad: distribucionSeveridad,
        estadisticas_pagos: estadisticasPagos[0] || {},
        tasa_exito: tasaExito[0] || {},
      },
    });
  } catch (error: any) {
    if (connection) connection.release();
    console.error("❌ Error al obtener estadísticas:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Error al obtener estadísticas",
        detalles: error.message,
      },
      { status: 500 }
    );
  }
}
