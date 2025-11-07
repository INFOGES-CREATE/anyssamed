// frontend/src/app/api/admin/usuarios/[id]/estadisticas/route.ts
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
        COALESCE((SELECT COUNT(*) FROM citas WHERE (id_paciente = ? OR id_medico = ?) AND estado = 'pendiente'), 0) as citas_pendientes,
        COALESCE((SELECT COUNT(*) FROM citas WHERE (id_paciente = ? OR id_medico = ?) AND fecha_hora >= CURDATE()), 0) as citas_futuras,
        
        -- Logs
        COALESCE((SELECT COUNT(*) FROM logs_sistema WHERE id_usuario = ?), 0) as total_logs,
        COALESCE((SELECT COUNT(*) FROM logs_sistema WHERE id_usuario = ? AND tipo = 'error'), 0) as logs_error,
        COALESCE((SELECT COUNT(*) FROM logs_sistema WHERE id_usuario = ? AND tipo = 'security'), 0) as logs_seguridad,
        COALESCE((SELECT COUNT(*) FROM logs_sistema WHERE id_usuario = ? AND tipo = 'audit'), 0) as logs_auditoria,
        
        -- Actividad
        (SELECT fecha_hora FROM logs_sistema WHERE id_usuario = ? ORDER BY fecha_hora DESC LIMIT 1) as ultima_actividad,
        (SELECT COUNT(*) FROM logs_sistema WHERE id_usuario = ? AND DATE(fecha_hora) = CURDATE()) as actividad_hoy,
        (SELECT COUNT(*) FROM logs_sistema WHERE id_usuario = ? AND fecha_hora >= DATE_SUB(NOW(), INTERVAL 7 DAY)) as actividad_semana,
        (SELECT COUNT(*) FROM logs_sistema WHERE id_usuario = ? AND fecha_hora >= DATE_SUB(NOW(), INTERVAL 30 DAY)) as actividad_mes
      `,
      [
        idUsuario, idUsuario, // total_citas
        idUsuario, idUsuario, // completadas
        idUsuario, idUsuario, // canceladas
        idUsuario, idUsuario, // pendientes
        idUsuario, idUsuario, // futuras
        idUsuario, // total_logs
        idUsuario, // logs_error
        idUsuario, // logs_seguridad
        idUsuario, // logs_auditoria
        idUsuario, // ultima_actividad
        idUsuario, // actividad_hoy
        idUsuario, // actividad_semana
        idUsuario, // actividad_mes
      ]
    );

    // ========== ESTADÍSTICAS POR MES (ÚLTIMOS 6 MESES) ==========
    const [actividadMensual] = await connection.query<RowDataPacket[]>(
      `SELECT 
        DATE_FORMAT(fecha_hora, '%Y-%m') as mes,
        COUNT(*) as total_actividades,
        COUNT(DISTINCT DATE(fecha_hora)) as dias_activos,
        SUM(CASE WHEN tipo = 'error' THEN 1 ELSE 0 END) as errores,
        SUM(CASE WHEN tipo = 'security' THEN 1 ELSE 0 END) as eventos_seguridad
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

    // ========== MÓDULOS MÁS UTILIZADOS ==========
    const [modulosMasUsados] = await connection.query<RowDataPacket[]>(
      `SELECT 
        modulo,
        COUNT(*) as accesos,
        COUNT(DISTINCT DATE(fecha_hora)) as dias_uso,
        MAX(fecha_hora) as ultimo_acceso
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
        MAX(fecha_hora) as ultima_vez
      FROM logs_sistema
      WHERE id_usuario = ?
        AND fecha_hora >= DATE_SUB(NOW(), INTERVAL 30 DAY)
      GROUP BY accion, modulo
      ORDER BY frecuencia DESC
      LIMIT 10`,
      [idUsuario]
    );

    // ========== HORARIOS DE ACTIVIDAD ==========
    const [horarioActividad] = await connection.query<RowDataPacket[]>(
      `SELECT 
        HOUR(fecha_hora) as hora,
        COUNT(*) as actividades,
        COUNT(DISTINCT DATE(fecha_hora)) as dias
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
        COUNT(DISTINCT DATE(fecha_hora)) as ocurrencias
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
        fecha_hora,
        modulo,
        accion,
        descripcion,
        nivel_severidad
      FROM logs_sistema
      WHERE id_usuario = ?
        AND tipo = 'error'
      ORDER BY fecha_hora DESC
      LIMIT 10`,
      [idUsuario]
    );

    // ========== EVENTOS DE SEGURIDAD ==========
    const [eventosSeguridad] = await connection.query<RowDataPacket[]>(
      `SELECT 
        fecha_hora,
        accion,
        descripcion,
        ip_origen,
        nivel_severidad
      FROM logs_sistema
      WHERE id_usuario = ?
        AND tipo = 'security'
      ORDER BY fecha_hora DESC
      LIMIT 10`,
      [idUsuario]
    );

    connection.release();

    return NextResponse.json({
      success: true,
      data: {
        resumen: estadisticasGenerales[0] || {},
        actividad_mensual: actividadMensual,
        citas_por_estado: citasPorEstado,
        modulos_mas_usados: modulosMasUsados,
        acciones_frecuentes: accionesFrecuentes,
        horario_actividad: horarioActividad,
        dias_semana: diasSemana,
        errores_recientes: erroresRecientes,
        eventos_seguridad: eventosSeguridad,
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
