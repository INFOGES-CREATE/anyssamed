// app/api/admin/centros/stats/route.ts
import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET() {
  try {
    // 1. Totales de centros por estado
    const [[centrosStats]]: any = await pool.query(`
      SELECT 
        COUNT(*) AS total_centros,
        SUM(estado='activo') AS centros_activos,
        SUM(estado='inactivo') AS centros_inactivos,
        SUM(estado='suspendido') AS centros_suspendidos,
        IFNULL(SUM(capacidad_pacientes_dia), 0) AS capacidad_total
      FROM centros_medicos
    `);

    // 2. Usuarios totales (admin, asistente, secretaria, etc)
    const [[usuariosStats]]: any = await pool.query(`
      SELECT 
        COUNT(*) AS total_usuarios
      FROM usuarios
    `);

    // 3. Médicos totales
    const [[medicosStats]]: any = await pool.query(`
      SELECT 
        COUNT(*) AS total_medicos
      FROM medicos
      WHERE estado='activo'
    `);

    // 4. Pacientes totales
    const [[pacientesStats]]: any = await pool.query(`
      SELECT 
        COUNT(*) AS total_pacientes
      FROM pacientes
    `);

    // 5. Sucursales totales
    const [[sucursalesStats]]: any = await pool.query(`
      SELECT 
        COUNT(*) AS total_sucursales
      FROM sucursales
    `);

    // 6. Consultas de este mes (todas las atenciones clínicas registradas)
    const [[consultasStats]]: any = await pool.query(`
      SELECT 
        COUNT(*) AS consultas_mes
      FROM historial_clinico
      WHERE MONTH(fecha_atencion) = MONTH(CURDATE())
        AND YEAR(fecha_atencion) = YEAR(CURDATE())
    `);

    // 7. Ingresos facturados este mes
    const [[facturacionStats]]: any = await pool.query(`
      SELECT 
        IFNULL(SUM(CASE 
          WHEN MONTH(fecha_emision) = MONTH(CURDATE())
           AND YEAR(fecha_emision) = YEAR(CURDATE())
        THEN total ELSE 0 END), 0) AS ingresos_mes
      FROM facturacion
    `);

    // ===============================
    // KPIs derivados
    // ===============================
    const capacidad_total = Number(centrosStats.capacidad_total) || 0;
    const consultas_mes = Number(consultasStats.consultas_mes) || 0;
    // ocupación_promedio (aprox): cuánta demanda mensual vs capacidad diaria agregada
    // esto es heurístico (no tenemos días hábiles ni horas). Ajusta tu fórmula real.
    const ocupacion_promedio =
      capacidad_total > 0
        ? Math.min(
            100,
            Math.round((consultas_mes / capacidad_total) * 100)
          )
        : 0;

    const respuesta = {
      total_centros: Number(centrosStats.total_centros) || 0,
      centros_activos: Number(centrosStats.centros_activos) || 0,
      centros_inactivos: Number(centrosStats.centros_inactivos) || 0,
      centros_suspendidos: Number(centrosStats.centros_suspendidos) || 0,

      total_usuarios: Number(usuariosStats.total_usuarios) || 0,
      total_medicos: Number(medicosStats.total_medicos) || 0,
      total_pacientes: Number(pacientesStats.total_pacientes) || 0,
      total_sucursales: Number(sucursalesStats.total_sucursales) || 0,

      consultas_mes,
      ingresos_mes: Number(facturacionStats.ingresos_mes) || 0,

      capacidad_total,
      ocupacion_promedio, // %
      satisfaccion_promedio: 4.7, // placeholder, igual que dashboard
      crecimiento_mensual: 12.5,   // placeholder %
    };

    return NextResponse.json(respuesta);
  } catch (error: any) {
    console.error("❌ Error GET /api/admin/centros/stats:", error);
    return NextResponse.json(
      {
        error: "Error al obtener estadísticas de centros",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
