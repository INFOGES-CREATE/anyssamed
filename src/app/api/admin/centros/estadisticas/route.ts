// frontend/src/app/api/admin/centros/[id]/estadisticas/route.ts
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { RowDataPacket } from "mysql2";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const centroId = params.id;
    console.log(`🔍 GET /api/admin/centros/${centroId}/estadisticas`);

    // ============================
    // 🏥 INFORMACIÓN DEL CENTRO
    // ============================
    const [centroRows] = await pool.query<RowDataPacket[]>(
      `
      SELECT 
        id_centro,
        nombre,
        ciudad,
        direccion,
        estado,
        nivel_complejidad,
        capacidad_pacientes_dia
      FROM centros_medicos
      WHERE id_centro = ?
      `,
      [centroId]
    );

    if (centroRows.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Centro médico no encontrado",
        },
        { status: 404 }
      );
    }

    const centro = centroRows[0];

    // ============================
    // 👥 ESTADÍSTICAS DE USUARIOS
    // ============================
    const [usuariosRows] = await pool.query<RowDataPacket[]>(
      `
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN estado = 'activo' THEN 1 ELSE 0 END) as activos,
        SUM(CASE WHEN estado = 'bloqueado' THEN 1 ELSE 0 END) as bloqueados,
        SUM(CASE WHEN MONTH(fecha_registro) = MONTH(NOW()) AND YEAR(fecha_registro) = YEAR(NOW()) THEN 1 ELSE 0 END) as nuevos_mes,
        ROUND(
          (SUM(CASE WHEN estado = 'activo' THEN 1 ELSE 0 END) / COUNT(*) * 100 - 
           COALESCE((
             SELECT SUM(CASE WHEN estado = 'activo' THEN 1 ELSE 0 END) / COUNT(*) * 100
             FROM usuarios u2
             WHERE u2.id_centro = ?
             AND DATE(u2.fecha_registro) >= DATE_SUB(NOW(), INTERVAL 1 MONTH)
             AND DATE(u2.fecha_registro) < DATE_SUB(NOW(), INTERVAL 0 MONTH)
           ), 0))
        , 1) as crecimiento_mes
      FROM usuarios
      WHERE id_centro = ?
      `,
      [centroId, centroId]
    );

    const usuarios = usuariosRows[0] || {
      total: 0,
      activos: 0,
      bloqueados: 0,
      nuevos_mes: 0,
      crecimiento_mes: 0,
    };

    // ============================
    // 🩺 ESTADÍSTICAS DE MÉDICOS
    // ============================
    const [medicosRows] = await pool.query<RowDataPacket[]>(
      `
      SELECT 
        COUNT(DISTINCT m.id_medico) as total,
        SUM(CASE WHEN m.estado = 'activo' THEN 1 ELSE 0 END) as activos,
        COUNT(DISTINCT me.id_especialidad) as especialidades,
        SUM(CASE WHEN MONTH(m.fecha_registro) = MONTH(NOW()) AND YEAR(m.fecha_registro) = YEAR(NOW()) THEN 1 ELSE 0 END) as nuevos_mes,
        ROUND(
          (SUM(CASE WHEN m.estado = 'activo' THEN 1 ELSE 0 END) / COUNT(DISTINCT m.id_medico) * 100 - 
           COALESCE((
             SELECT SUM(CASE WHEN m2.estado = 'activo' THEN 1 ELSE 0 END) / COUNT(DISTINCT m2.id_medico) * 100
             FROM medicos m2
             WHERE m2.id_centro = ?
             AND DATE(m2.fecha_registro) >= DATE_SUB(NOW(), INTERVAL 1 MONTH)
             AND DATE(m2.fecha_registro) < DATE_SUB(NOW(), INTERVAL 0 MONTH)
           ), 0))
        , 1) as crecimiento_mes
      FROM medicos m
      LEFT JOIN medico_especialidades me ON m.id_medico = me.id_medico
      WHERE m.id_centro = ?
      `,
      [centroId, centroId]
    );

    const medicos = medicosRows[0] || {
      total: 0,
      activos: 0,
      especialidades: 0,
      nuevos_mes: 0,
      crecimiento_mes: 0,
    };

    // ============================
    // 👨‍⚕️ ESTADÍSTICAS DE PACIENTES
    // ============================
    const [pacientesRows] = await pool.query<RowDataPacket[]>(
      `
      SELECT 
        COUNT(DISTINCT p.id_paciente) as total,
        SUM(CASE WHEN p.estado = 'activo' THEN 1 ELSE 0 END) as activos,
        SUM(CASE WHEN MONTH(p.fecha_registro) = MONTH(NOW()) AND YEAR(p.fecha_registro) = YEAR(NOW()) THEN 1 ELSE 0 END) as nuevos_mes,
        ROUND(
          (SUM(CASE WHEN p.estado = 'activo' THEN 1 ELSE 0 END) / COUNT(DISTINCT p.id_paciente) * 100 - 
           COALESCE((
             SELECT SUM(CASE WHEN p2.estado = 'activo' THEN 1 ELSE 0 END) / COUNT(DISTINCT p2.id_paciente) * 100
             FROM pacientes p2
             WHERE p2.id_centro = ?
             AND DATE(p2.fecha_registro) >= DATE_SUB(NOW(), INTERVAL 1 MONTH)
             AND DATE(p2.fecha_registro) < DATE_SUB(NOW(), INTERVAL 0 MONTH)
           ), 0))
        , 1) as crecimiento_mes
      FROM pacientes p
      WHERE p.id_centro = ?
      `,
      [centroId, centroId]
    );

    const pacientes = pacientesRows[0] || {
      total: 0,
      activos: 0,
      nuevos_mes: 0,
      crecimiento_mes: 0,
    };

    // ============================
    // 📅 CONSULTAS POR MES (ÚLTIMOS 6 MESES)
    // ============================
    const [consultasMesRows] = await pool.query<RowDataPacket[]>(
      `
      SELECT 
        DATE_FORMAT(c.fecha_consulta, '%Y-%m') as mes,
        COUNT(*) as total
      FROM consultas c
      WHERE c.id_centro = ?
      AND c.fecha_consulta >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
      GROUP BY DATE_FORMAT(c.fecha_consulta, '%Y-%m')
      ORDER BY mes ASC
      `,
      [centroId]
    );

    // Rellenar meses faltantes
    const consultasPorMes = [];
    for (let i = 5; i >= 0; i--) {
      const fecha = new Date();
      fecha.setMonth(fecha.getMonth() - i);
      const mesKey = fecha.toISOString().slice(0, 7);
      const encontrado = consultasMesRows.find((row) => row.mes === mesKey);
      consultasPorMes.push({
        mes: mesKey,
        total: encontrado?.total || 0,
      });
    }

    // ============================
    // 💰 INGRESOS POR MES (ÚLTIMOS 6 MESES)
    // ============================
    const [ingresosMesRows] = await pool.query<RowDataPacket[]>(
      `
      SELECT 
        DATE_FORMAT(f.fecha_factura, '%Y-%m') as mes,
        SUM(f.monto_total) as ingresos,
        COUNT(*) as facturas
      FROM facturas f
      WHERE f.id_centro = ?
      AND f.fecha_factura >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
      AND f.estado = 'pagada'
      GROUP BY DATE_FORMAT(f.fecha_factura, '%Y-%m')
      ORDER BY mes ASC
      `,
      [centroId]
    );

    // Rellenar meses faltantes
    const ingresosPorMes = [];
    for (let i = 5; i >= 0; i--) {
      const fecha = new Date();
      fecha.setMonth(fecha.getMonth() - i);
      const mesKey = fecha.toISOString().slice(0, 7);
      const encontrado = ingresosMesRows.find((row) => row.mes === mesKey);
      ingresosPorMes.push({
        mes: mesKey,
        ingresos: encontrado?.ingresos || 0,
        facturas: encontrado?.facturas || 0,
      });
    }

    // ============================
    // 🏥 TOP 5 ESPECIALIDADES
    // ============================
    const [topEspecialidadesRows] = await pool.query<RowDataPacket[]>(
      `
      SELECT 
        e.nombre,
        COUNT(c.id_consulta) as consultas
      FROM especialidades e
      LEFT JOIN medico_especialidades me ON e.id_especialidad = me.id_especialidad
      LEFT JOIN medicos m ON me.id_medico = m.id_medico
      LEFT JOIN consultas c ON m.id_medico = c.id_medico AND c.id_centro = ?
      WHERE m.id_centro = ?
      GROUP BY e.id_especialidad, e.nombre
      ORDER BY consultas DESC
      LIMIT 5
      `,
      [centroId, centroId]
    );

    // Calcular porcentajes
    const totalConsultasEspecialidades = topEspecialidadesRows.reduce(
      (sum, row) => sum + (row.consultas || 0),
      0
    );

    const topEspecialidades = topEspecialidadesRows.map((row) => ({
      nombre: row.nombre,
      consultas: row.consultas || 0,
      porcentaje: totalConsultasEspecialidades > 0 
        ? Math.round((row.consultas / totalConsultasEspecialidades) * 100)
        : 0,
    }));

    // ============================
    // 📊 RESUMEN GENERAL
    // ============================
    const [resumenRows] = await pool.query<RowDataPacket[]>(
      `
      SELECT 
        COUNT(c.id_consulta) as consultas_totales,
        SUM(f.monto_total) as ingresos_totales,
        ROUND(COUNT(c.id_consulta) / 30) as promedio_consultas_diarias,
        ROUND((COUNT(c.id_consulta) / (? * 30)) * 100) as tasa_ocupacion
      FROM consultas c
      LEFT JOIN facturas f ON c.id_consulta = f.id_consulta AND f.estado = 'pagada'
      WHERE c.id_centro = ?
      AND c.fecha_consulta >= DATE_SUB(NOW(), INTERVAL 1 MONTH)
      `,
      [centro.capacidad_pacientes_dia || 1, centroId]
    );

    const resumen = resumenRows[0] || {
      consultas_totales: 0,
      ingresos_totales: 0,
      promedio_consultas_diarias: 0,
      tasa_ocupacion: 0,
    };

    console.log(`✅ Estadísticas del centro ${centroId} generadas correctamente`);

    return NextResponse.json({
      success: true,
      data: {
        centro: {
          id_centro: centro.id_centro,
          nombre: centro.nombre,
          ciudad: centro.ciudad,
          direccion: centro.direccion,
          estado: centro.estado,
          nivel_complejidad: centro.nivel_complejidad,
          capacidad_pacientes_dia: centro.capacidad_pacientes_dia,
        },
        usuarios: {
          total: usuarios.total || 0,
          activos: usuarios.activos || 0,
          bloqueados: usuarios.bloqueados || 0,
          crecimiento_mes: usuarios.crecimiento_mes || 0,
        },
        medicos: {
          total: medicos.total || 0,
          activos: medicos.activos || 0,
          especialidades: medicos.especialidades || 0,
          crecimiento_mes: medicos.crecimiento_mes || 0,
        },
        pacientes: {
          total: pacientes.total || 0,
          activos: pacientes.activos || 0,
          nuevos_mes: pacientes.nuevos_mes || 0,
          crecimiento_mes: pacientes.crecimiento_mes || 0,
        },
        consultas_mes: consultasPorMes,
        ingresos_mes: ingresosPorMes,
        top_especialidades: topEspecialidades,
        resumen_general: {
          consultas_totales: resumen.consultas_totales || 0,
          ingresos_totales: resumen.ingresos_totales || 0,
          promedio_consultas_diarias: resumen.promedio_consultas_diarias || 0,
          tasa_ocupacion: resumen.tasa_ocupacion || 0,
        },
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error(
      `❌ Error en GET /api/admin/centros/${params.id}/estadisticas:`,
      error
    );
    return NextResponse.json(
      {
        success: false,
        error: "Error al obtener estadísticas del centro médico",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
