// frontend/src/app/api/admin/medicos/[id]/estadisticas/route.ts
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { RowDataPacket } from "mysql2";

// GET - OBTENER ESTADÍSTICAS DEL MÉDICO
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    console.log(`📊 GET /api/admin/medicos/${params.id}/estadisticas`);

    // Verificar que el médico existe
    const [medico] = await pool.query<RowDataPacket[]>(
      "SELECT id_profesional FROM profesionales_salud WHERE id_profesional = ?",
      [params.id]
    );

    if (medico.length === 0) {
      return NextResponse.json(
        { success: false, error: "Médico no encontrado" },
        { status: 404 }
      );
    }

    // Estadísticas generales
    const [estadisticas] = await pool.query<RowDataPacket[]>(
      `SELECT 
        COUNT(DISTINCT c.id_cita) as total_consultas,
        COUNT(DISTINCT CASE 
          WHEN MONTH(c.fecha_hora_inicio) = MONTH(CURDATE()) 
          AND YEAR(c.fecha_hora_inicio) = YEAR(CURDATE()) 
          THEN c.id_cita 
        END) as consultas_mes,
        COUNT(DISTINCT CASE 
          WHEN c.estado = 'completada' 
          THEN c.id_paciente 
        END) as pacientes_atendidos,
        COUNT(DISTINCT CASE 
          WHEN c.estado = 'completada' 
          AND MONTH(c.fecha_hora_inicio) = MONTH(CURDATE())
          THEN c.id_paciente
        END) as pacientes_mes,
        COUNT(DISTINCT CASE 
          WHEN c.estado = 'programada' 
          THEN c.id_cita 
        END) as citas_pendientes,
        COUNT(DISTINCT CASE 
          WHEN c.estado = 'cancelada' 
          THEN c.id_cita 
        END) as citas_canceladas,
        COUNT(DISTINCT CASE 
          WHEN c.estado = 'no_asistio' 
          THEN c.id_cita 
        END) as citas_no_asistidas
      FROM citas c
      WHERE c.id_profesional = ?`,
      [params.id]
    );

    // Estadísticas por tipo de cita
    const [porTipoCita] = await pool.query<RowDataPacket[]>(
      `SELECT 
        c.tipo_cita,
        COUNT(*) as total,
        COUNT(CASE WHEN c.estado = 'completada' THEN 1 END) as completadas,
        COUNT(CASE WHEN c.estado = 'cancelada' THEN 1 END) as canceladas
      FROM citas c
      WHERE c.id_profesional = ?
      GROUP BY c.tipo_cita`,
      [params.id]
    );

    // Estadísticas por modalidad
    const [porModalidad] = await pool.query<RowDataPacket[]>(
      `SELECT 
        CASE 
          WHEN c.tipo_cita = 'telemedicina' THEN 'Telemedicina'
          ELSE 'Presencial'
        END as modalidad,
        COUNT(*) as total,
        COUNT(CASE WHEN c.estado = 'completada' THEN 1 END) as completadas
      FROM citas c
      WHERE c.id_profesional = ?
      GROUP BY modalidad`,
      [params.id]
    );

    // Ingresos estimados
    const [ingresos] = await pool.query<RowDataPacket[]>(
      `SELECT 
        COUNT(CASE WHEN c.pagada = 1 THEN 1 END) as consultas_pagadas,
        COALESCE(SUM(CASE WHEN c.pagada = 1 THEN c.monto END), 0) as ingresos_totales,
        COALESCE(SUM(CASE 
          WHEN c.pagada = 1 
          AND MONTH(c.fecha_hora_inicio) = MONTH(CURDATE())
          AND YEAR(c.fecha_hora_inicio) = YEAR(CURDATE())
          THEN c.monto 
        END), 0) as ingresos_mes
      FROM citas c
      WHERE c.id_profesional = ?`,
      [params.id]
    );

    // Horarios más solicitados
    const [horariosPopulares] = await pool.query<RowDataPacket[]>(
      `SELECT 
        HOUR(c.fecha_hora_inicio) as hora,
        COUNT(*) as total_citas,
        COUNT(CASE WHEN c.estado = 'completada' THEN 1 END) as completadas
      FROM citas c
      WHERE c.id_profesional = ?
      GROUP BY HOUR(c.fecha_hora_inicio)
      ORDER BY total_citas DESC
      LIMIT 5`,
      [params.id]
    );

    console.log(`✅ Estadísticas obtenidas para médico ${params.id}`);

    return NextResponse.json({
      success: true,
      data: {
        generales: estadisticas[0],
        por_tipo_cita: porTipoCita,
        por_modalidad: porModalidad,
        ingresos: ingresos[0],
        horarios_populares: horariosPopulares,
      },
    });
  } catch (error: any) {
    console.error(
      `❌ Error en GET /api/admin/medicos/${params.id}/estadisticas:`,
      error
    );
    return NextResponse.json(
      {
        success: false,
        error: "Error al obtener estadísticas",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
