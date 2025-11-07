// frontend/src/app/api/admin/centros/[id]/estadisticas/route.ts
import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { RowDataPacket } from "mysql2";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    console.log(`📊 GET /api/admin/centros/${params.id}/estadisticas`);

    const [centro] = await pool.query<RowDataPacket[]>(
      "SELECT id_centro, nombre FROM centros_medicos WHERE id_centro = ?",
      [params.id]
    );

    if (centro.length === 0) {
      return NextResponse.json(
        { success: false, error: "Centro no encontrado" },
        { status: 404 }
      );
    }

    // Estadísticas de usuarios
    const [usuarios] = await pool.query<RowDataPacket[]>(
      `SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN estado = 'activo' THEN 1 END) as activos,
        COUNT(CASE WHEN estado = 'bloqueado' THEN 1 END) as bloqueados
      FROM usuarios WHERE id_centro_principal = ?`,
      [params.id]
    );

    // Estadísticas de médicos
    const [medicos] = await pool.query<RowDataPacket[]>(
      `SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN estado = 'activo' THEN 1 END) as activos,
        COUNT(DISTINCT id_especialidad) as especialidades
      FROM medicos m
      LEFT JOIN medicos_especialidades me ON m.id_medico = me.id_medico
      WHERE m.id_centro_principal = ?`,
      [params.id]
    );

    // Estadísticas de pacientes
    const [pacientes] = await pool.query<RowDataPacket[]>(
      `SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN estado = 'activo' THEN 1 END) as activos,
        COUNT(CASE WHEN MONTH(fecha_registro) = MONTH(CURDATE()) THEN 1 END) as nuevos_mes
      FROM pacientes WHERE id_centro_registro = ?`,
      [params.id]
    );

    // Consultas por mes (últimos 6 meses)
    const [consultasMes] = await pool.query<RowDataPacket[]>(
      `SELECT 
        DATE_FORMAT(fecha_atencion, '%Y-%m') as mes,
        COUNT(*) as total
      FROM historial_clinico
      WHERE id_centro = ?
      AND fecha_atencion >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
      GROUP BY mes
      ORDER BY mes DESC`,
      [params.id]
    );

    // Ingresos por mes
    const [ingresosMes] = await pool.query<RowDataPacket[]>(
      `SELECT 
        DATE_FORMAT(fecha_emision, '%Y-%m') as mes,
        SUM(total) as ingresos,
        COUNT(*) as facturas
      FROM facturacion
      WHERE id_centro = ?
      AND fecha_emision >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
      GROUP BY mes
      ORDER BY mes DESC`,
      [params.id]
    );

    // Top especialidades
    const [topEspecialidades] = await pool.query<RowDataPacket[]>(
      `SELECT 
        e.nombre,
        COUNT(DISTINCT hc.id_historial) as consultas
      FROM historial_clinico hc
      INNER JOIN medicos m ON hc.id_medico = m.id_medico
      INNER JOIN medicos_especialidades me ON m.id_medico = me.id_medico
      INNER JOIN especialidades e ON me.id_especialidad = e.id_especialidad
      WHERE hc.id_centro = ?
      GROUP BY e.id_especialidad
      ORDER BY consultas DESC
      LIMIT 5`,
      [params.id]
    );

    console.log(`✅ Estadísticas del centro ${params.id} obtenidas`);

    return NextResponse.json({
      success: true,
      data: {
        centro: centro[0],
        usuarios: usuarios[0],
        medicos: medicos[0],
        pacientes: pacientes[0],
        consultas_mes: consultasMes,
        ingresos_mes: ingresosMes,
        top_especialidades: topEspecialidades,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error(`❌ Error en GET /api/admin/centros/${params.id}/estadisticas:`, error);
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
