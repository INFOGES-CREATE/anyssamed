// frontend/src/app/api/admin/centros/[id]/estadisticas/route.ts
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { RowDataPacket } from "mysql2";

// ============================================================================
// INTERFACES Y TIPOS
// ============================================================================

interface ResumenGeneral {
  consultas_totales: number;
  ingresos_totales: number;
  promedio_consultas_diarias: number;
  tasa_ocupacion: number;
}

interface EstadisticasResponse {
  centro: any;
  usuarios: any;
  profesionales_salud: any;
  pacientes: any;
  consultas_mes: any[];
  ingresos_mes: any[];
  top_especialidades: any[];
  resumen_general: ResumenGeneral;
}

// ============================================================================
// FUNCIONES DE VALIDACIÓN
// ============================================================================

/**
 * Valida que los datos de la fila sean números válidos
 * [[0]](#__0): Type safety en TypeScript para datos de base de datos
 */
const validarNumero = (valor: any, defecto: number = 0): number => {
  const num = Number(valor);
  return isNaN(num) ? defecto : num;
};

/**
 * Calcula el resumen general de estadísticas
 * [[1]](#__1): Aggregate functions en SQL para optimizar cálculos
 */
const calcularResumenGeneral = async (
  id_centro: string
): Promise<ResumenGeneral> => {
  try {
    // Consulta única para obtener todos los datos agregados
    const [resumen] = await pool.query<RowDataPacket[]>(
      `SELECT 
        COUNT(DISTINCT hc.id_historial) as consultas_totales,
        COALESCE(SUM(f.total), 0) as ingresos_totales,
        ROUND(COUNT(DISTINCT hc.id_historial) / 
          DATEDIFF(CURDATE(), MIN(hc.fecha_atencion)) + 1, 2) as promedio_consultas_diarias,
        ROUND((COUNT(DISTINCT hc.id_paciente) / 
          (SELECT COUNT(*) FROM pacientes WHERE id_centro_registro = ?) * 100), 2) as tasa_ocupacion
      FROM historial_clinico hc
      LEFT JOIN facturacion f ON hc.id_historial = f.id_historial
      WHERE hc.id_centro = ?`,
      [id_centro, id_centro]
    );

    if (!resumen || resumen.length === 0) {
      return {
        consultas_totales: 0,
        ingresos_totales: 0,
        promedio_consultas_diarias: 0,
        tasa_ocupacion: 0,
      };
    }

    const fila = resumen[0];
    return {
      consultas_totales: validarNumero(fila.consultas_totales, 0),
      ingresos_totales: validarNumero(fila.ingresos_totales, 0),
      promedio_consultas_diarias: validarNumero(
        fila.promedio_consultas_diarias,
        0
      ),
      tasa_ocupacion: validarNumero(fila.tasa_ocupacion, 0),
    };
  } catch (error) {
    console.error("❌ Error al calcular resumen general:", error);
    return {
      consultas_totales: 0,
      ingresos_totales: 0,
      promedio_consultas_diarias: 0,
      tasa_ocupacion: 0,
    };
  }
};

/**
 * Calcula el crecimiento mensual porcentual
 * [[2]](#__2): Cálculo de tendencias en datos históricos
 */
const calcularCrecimientoMensual = async (
  tabla: string,
  columnaFecha: string,
  condicion: string,
  id_centro: string
): Promise<number> => {
  try {
    const [datos] = await pool.query<RowDataPacket[]>(
      `SELECT 
        SUM(CASE WHEN MONTH(${columnaFecha}) = MONTH(CURDATE()) AND YEAR(${columnaFecha}) = YEAR(CURDATE()) THEN 1 ELSE 0 END) as mes_actual,
        SUM(CASE WHEN MONTH(${columnaFecha}) = MONTH(DATE_SUB(CURDATE(), INTERVAL 1 MONTH)) AND YEAR(${columnaFecha}) = YEAR(DATE_SUB(CURDATE(), INTERVAL 1 MONTH)) THEN 1 ELSE 0 END) as mes_anterior
      FROM ${tabla}
      WHERE ${condicion} = ?`,
      [id_centro]
    );

    if (!datos || datos.length === 0) return 0;

    const mesActual = validarNumero(datos[0].mes_actual, 0);
    const mesAnterior = validarNumero(datos[0].mes_anterior, 0);

    if (mesAnterior === 0) return mesActual > 0 ? 100 : 0;

    return Math.round(((mesActual - mesAnterior) / mesAnterior) * 100);
  } catch (error) {
    console.error("❌ Error al calcular crecimiento mensual:", error);
    return 0;
  }
};

// ============================================================================
// HANDLER GET
// ============================================================================

/**
 * Endpoint para obtener estadísticas completas del centro
 * [[3]](#__3): API route handlers en Next.js 13+ con error handling
 */
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  let connection;

  try {
    console.log(`📊 GET /api/admin/centros/${params.id}/estadisticas`);

    // Validar ID del centro
    if (!params.id || isNaN(Number(params.id))) {
      return NextResponse.json(
        { success: false, error: "ID del centro inválido" },
        { status: 400 }
      );
    }

    // ========================================================================
    // 1. OBTENER INFORMACIÓN DEL CENTRO
    // ========================================================================

    const [centro] = await pool.query<RowDataPacket[]>(
      `SELECT 
        id_centro,
        nombre,
        ciudad,
        direccion,
        estado,
        nivel_complejidad,
        capacidad_pacientes_dia
      FROM centros_medicos 
      WHERE id_centro = ?`,
      [params.id]
    );

    if (!centro || centro.length === 0) {
      console.warn(`⚠️ Centro ${params.id} no encontrado`);
      return NextResponse.json(
        { success: false, error: "Centro no encontrado" },
        { status: 404 }
      );
    }

    // ========================================================================
    // 2. ESTADÍSTICAS DE USUARIOS
    // ========================================================================

    const [usuarios] = await pool.query<RowDataPacket[]>(
      `SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN estado = 'activo' THEN 1 END) as activos,
        COUNT(CASE WHEN estado = 'bloqueado' THEN 1 END) as bloqueados
      FROM usuarios 
      WHERE id_centro_principal = ?`,
      [params.id]
    );

    const crecimientoUsuarios = await calcularCrecimientoMensual(
      "usuarios",
      "fecha_creacion",
      "id_centro_principal",
      params.id
    );

    const usuariosData = usuarios[0] || {
      total: 0,
      activos: 0,
      bloqueados: 0,
    };

    // ========================================================================
    // 3. ESTADÍSTICAS DE MÉDICOS
    // ========================================================================

    const [profesionales_salud] = await pool.query<RowDataPacket[]>(
      `SELECT 
        COUNT(DISTINCT m.id_profesional) as total,
        COUNT(DISTINCT CASE WHEN m.estado = 'activo' THEN m.id_profesional END) as activos,
        COUNT(DISTINCT me.id_especialidad) as especialidades
      FROM profesionales_salud m
      LEFT JOIN profesionales_especialidades me ON m.id_profesional = me.id_profesional
      WHERE m.id_centro_principal = ?`,
      [params.id]
    );

    const crecimientoMedicos = await calcularCrecimientoMensual(
      "profesionales_salud",
      "fecha_registro",
      "id_centro_principal",
      params.id
    );

    const medicosData = profesionales_salud[0] || {
      total: 0,
      activos: 0,
      especialidades: 0,
    };

    // ========================================================================
    // 4. ESTADÍSTICAS DE PACIENTES
    // ========================================================================

    const [pacientes] = await pool.query<RowDataPacket[]>(
      `SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN estado = 'activo' THEN 1 END) as activos,
        COUNT(CASE WHEN MONTH(fecha_registro) = MONTH(CURDATE()) 
          AND YEAR(fecha_registro) = YEAR(CURDATE()) THEN 1 END) as nuevos_mes
      FROM pacientes 
      WHERE id_centro_registro = ?`,
      [params.id]
    );

    const crecimientoPacientes = await calcularCrecimientoMensual(
      "pacientes",
      "fecha_registro",
      "id_centro_registro",
      params.id
    );

    const pacientesData = pacientes[0] || {
      total: 0,
      activos: 0,
      nuevos_mes: 0,
    };

    // ========================================================================
    // 5. CONSULTAS POR MES (ÚLTIMOS 6 MESES)
    // ========================================================================

    const [consultasMes] = await pool.query<RowDataPacket[]>(
      `SELECT 
        DATE_FORMAT(fecha_atencion, '%Y-%m') as mes,
        COUNT(*) as total
      FROM historial_clinico
      WHERE id_centro = ?
      AND fecha_atencion >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
      GROUP BY DATE_FORMAT(fecha_atencion, '%Y-%m')
      ORDER BY mes ASC`,
      [params.id]
    );

    // Validar datos de consultas
    const consultasMesValidas = (consultasMes || []).map((item) => ({
      mes: item.mes || "N/A",
      total: validarNumero(item.total, 0),
    }));

    // ========================================================================
    // 6. INGRESOS POR MES (ÚLTIMOS 6 MESES)
    // ========================================================================

    const [ingresosMes] = await pool.query<RowDataPacket[]>(
      `SELECT 
        DATE_FORMAT(fecha_emision, '%Y-%m') as mes,
        COALESCE(SUM(total), 0) as ingresos,
        COUNT(*) as facturas
      FROM facturacion
      WHERE id_centro = ?
      AND fecha_emision >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
      GROUP BY DATE_FORMAT(fecha_emision, '%Y-%m')
      ORDER BY mes ASC`,
      [params.id]
    );

    // Validar datos de ingresos
    const ingresosValidos = (ingresosMes || []).map((item) => ({
      mes: item.mes || "N/A",
      ingresos: validarNumero(item.ingresos, 0),
      facturas: validarNumero(item.facturas, 0),
    }));

    // ========================================================================
    // 7. TOP 5 ESPECIALIDADES MÁS CONSULTADAS
    // ========================================================================

    const [topEspecialidades] = await pool.query<RowDataPacket[]>(
      `SELECT 
        e.nombre,
        COUNT(DISTINCT hc.id_historial) as consultas,
        ROUND((COUNT(DISTINCT hc.id_historial) / 
          (SELECT COUNT(*) FROM historial_clinico WHERE id_centro = ?) * 100), 1) as porcentaje
      FROM historial_clinico hc
      INNER JOIN profesionales_salud m ON hc.id_profesional = m.id_profesional
      INNER JOIN profesionales_especialidades me ON m.id_profesional = me.id_profesional
      INNER JOIN especialidades e ON me.id_especialidad = e.id_especialidad
      WHERE hc.id_centro = ?
      GROUP BY e.id_especialidad, e.nombre
      ORDER BY consultas DESC
      LIMIT 5`,
      [params.id, params.id]
    );

    // Validar datos de especialidades
    const especialidadesValidas = (topEspecialidades || []).map((item) => ({
      nombre: item.nombre || "Especialidad Desconocida",
      consultas: validarNumero(item.consultas, 0),
      porcentaje: validarNumero(item.porcentaje, 0),
    }));

    // ========================================================================
    // 8. CALCULAR RESUMEN GENERAL
    // ========================================================================

    const resumenGeneral = await calcularResumenGeneral(params.id);

    // ========================================================================
    // 9. CONSTRUIR RESPUESTA COMPLETA
    // ========================================================================

    const respuesta: EstadisticasResponse = {
      centro: centro[0],
      usuarios: {
        total: validarNumero(usuariosData.total, 0),
        activos: validarNumero(usuariosData.activos, 0),
        bloqueados: validarNumero(usuariosData.bloqueados, 0),
        crecimiento_mes: crecimientoUsuarios,
      },
      profesionales_salud: {
        total: validarNumero(medicosData.total, 0),
        activos: validarNumero(medicosData.activos, 0),
        especialidades: validarNumero(medicosData.especialidades, 0),
        crecimiento_mes: crecimientoMedicos,
      },
      pacientes: {
        total: validarNumero(pacientesData.total, 0),
        activos: validarNumero(pacientesData.activos, 0),
        nuevos_mes: validarNumero(pacientesData.nuevos_mes, 0),
        crecimiento_mes: crecimientoPacientes,
      },
      consultas_mes: consultasMesValidas,
      ingresos_mes: ingresosValidos,
      top_especialidades: especialidadesValidas,
      resumen_general: resumenGeneral,
    };

    console.log(`✅ Estadísticas del centro ${params.id} obtenidas exitosamente`);

    return NextResponse.json(
      {
        success: true,
        data: respuesta,
        timestamp: new Date().toISOString(),
        cache: "no-store",
      },
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
        },
      }
    );
  } catch (error: any) {
    console.error(
      `❌ Error en GET /api/admin/centros/${params.id}/estadisticas:`,
      error
    );

    return NextResponse.json(
      {
        success: false,
        error: "Error al obtener estadísticas del centro",
        details: process.env.NODE_ENV === "development" ? error.message : undefined,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

// ============================================================================
// CONFIGURACIÓN DE REVALIDACIÓN
// ============================================================================

/**
 * Revalidar cada 5 minutos para datos frescos
 * [[4]](#__4): Next.js ISR (Incremental Static Regeneration) para caché
 */
export const revalidate = 300; // 5 minutos
