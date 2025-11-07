// app/api/medico/recetas/estadisticas/route.ts
import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { RowDataPacket } from "mysql2";

// ========================================
// TIPOS
// ========================================

interface MedicoData {
  id_medico: number;
  id_usuario: number;
  numero_registro_medico: string;
  nombre_completo: string;
}

interface FiltrosEstadisticas {
  fecha_desde?: string;
  fecha_hasta?: string;
  id_centro?: number;
  tipo_receta?: string;
  agrupar_por?: "dia" | "semana" | "mes" | "año";
}

interface EstadisticasGenerales {
  total_recetas: number;
  recetas_emitidas: number;
  recetas_dispensadas: number;
  recetas_anuladas: number;
  recetas_vencidas: number;
  recetas_cronicas: number;
  promedio_medicamentos_por_receta: number;
  total_medicamentos_prescritos: number;
  medicamentos_controlados: number;
  tasa_dispensacion: number;
  tasa_anulacion: number;
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
        m.numero_registro_medico,
        CONCAT(u.nombre, ' ', u.apellido_paterno, ' ', COALESCE(u.apellido_materno, '')) as nombre_completo
      FROM medicos m
      INNER JOIN usuarios u ON m.id_usuario = u.id_usuario
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
 * Construye cláusula WHERE según filtros
 */
function construirWhereClause(
  filtros: FiltrosEstadisticas,
  idMedico: number
): { whereClause: string; params: any[] } {
  const conditions = ["r.id_medico = ?"];
  const params: any[] = [idMedico];

  if (filtros.fecha_desde) {
    conditions.push("r.fecha_emision >= ?");
    params.push(filtros.fecha_desde);
  }

  if (filtros.fecha_hasta) {
    conditions.push("r.fecha_emision <= ?");
    params.push(filtros.fecha_hasta);
  }

  if (filtros.id_centro) {
    conditions.push("r.id_centro = ?");
    params.push(filtros.id_centro);
  }

  if (filtros.tipo_receta) {
    conditions.push("r.tipo_receta = ?");
    params.push(filtros.tipo_receta);
  }

  return {
    whereClause: conditions.join(" AND "),
    params,
  };
}

/**
 * Obtiene estadísticas generales
 */
async function obtenerEstadisticasGenerales(
  idMedico: number,
  filtros: FiltrosEstadisticas
): Promise<EstadisticasGenerales> {
  try {
    const { whereClause, params } = construirWhereClause(filtros, idMedico);

    const [stats] = await pool.query<RowDataPacket[]>(
      `
      SELECT 
        COUNT(*) as total_recetas,
        COUNT(CASE WHEN r.estado = 'emitida' THEN 1 END) as recetas_emitidas,
        COUNT(CASE WHEN r.estado = 'dispensada' THEN 1 END) as recetas_dispensadas,
        COUNT(CASE WHEN r.estado = 'anulada' THEN 1 END) as recetas_anuladas,
        COUNT(CASE WHEN r.estado = 'vencida' THEN 1 END) as recetas_vencidas,
        COUNT(CASE WHEN r.es_cronica = 1 THEN 1 END) as recetas_cronicas,
        
        -- Tasas
        ROUND(
          COUNT(CASE WHEN r.estado = 'dispensada' THEN 1 END) * 100.0 / 
          NULLIF(COUNT(*), 0), 
          2
        ) as tasa_dispensacion,
        ROUND(
          COUNT(CASE WHEN r.estado = 'anulada' THEN 1 END) * 100.0 / 
          NULLIF(COUNT(*), 0), 
          2
        ) as tasa_anulacion
        
      FROM recetas r
      WHERE ${whereClause}
      `,
      params
    );

    const [medicamentosStats] = await pool.query<RowDataPacket[]>(
      `
      SELECT 
        COUNT(*) as total_medicamentos_prescritos,
        COUNT(CASE WHEN mr.es_controlado = 1 THEN 1 END) as medicamentos_controlados,
        ROUND(COUNT(*) * 1.0 / NULLIF(COUNT(DISTINCT mr.id_receta), 0), 2) as promedio_medicamentos_por_receta
      FROM medicamentos_receta mr
      INNER JOIN recetas r ON mr.id_receta = r.id_receta
      WHERE ${whereClause}
      `,
      params
    );

    return {
      ...stats[0],
      ...medicamentosStats[0],
    } as EstadisticasGenerales;
  } catch (error) {
    console.error("Error al obtener estadísticas generales:", error);
    throw error;
  }
}

/**
 * Obtiene evolución temporal de recetas
 */
async function obtenerEvolucionTemporal(
  idMedico: number,
  filtros: FiltrosEstadisticas
): Promise<any[]> {
  try {
    const { whereClause, params } = construirWhereClause(filtros, idMedico);

    let groupByClause = "";
    let selectClause = "";

    switch (filtros.agrupar_por) {
      case "dia":
        selectClause = "DATE(r.fecha_emision) as periodo";
        groupByClause = "DATE(r.fecha_emision)";
        break;
      case "semana":
        selectClause =
          "YEARWEEK(r.fecha_emision, 1) as periodo, DATE(DATE_SUB(r.fecha_emision, INTERVAL WEEKDAY(r.fecha_emision) DAY)) as fecha_inicio";
        groupByClause = "YEARWEEK(r.fecha_emision, 1)";
        break;
      case "mes":
        selectClause =
          "DATE_FORMAT(r.fecha_emision, '%Y-%m') as periodo, DATE_FORMAT(r.fecha_emision, '%Y-%m-01') as fecha_inicio";
        groupByClause = "DATE_FORMAT(r.fecha_emision, '%Y-%m')";
        break;
      case "año":
        selectClause = "YEAR(r.fecha_emision) as periodo";
        groupByClause = "YEAR(r.fecha_emision)";
        break;
      default:
        selectClause = "DATE(r.fecha_emision) as periodo";
        groupByClause = "DATE(r.fecha_emision)";
    }

    const [evolucion] = await pool.query<RowDataPacket[]>(
      `
      SELECT 
        ${selectClause},
        COUNT(*) as total,
        COUNT(CASE WHEN r.estado = 'emitida' THEN 1 END) as emitidas,
        COUNT(CASE WHEN r.estado = 'dispensada' THEN 1 END) as dispensadas,
        COUNT(CASE WHEN r.estado = 'anulada' THEN 1 END) as anuladas,
        COUNT(CASE WHEN r.es_cronica = 1 THEN 1 END) as cronicas
      FROM recetas r
      WHERE ${whereClause}
      GROUP BY ${groupByClause}
      ORDER BY periodo DESC
      LIMIT 50
      `,
      params
    );

    return evolucion;
  } catch (error) {
    console.error("Error al obtener evolución temporal:", error);
    throw error;
  }
}

/**
 * Obtiene distribución por tipo de receta
 */
async function obtenerDistribucionTipos(
  idMedico: number,
  filtros: FiltrosEstadisticas
): Promise<any[]> {
  try {
    const { whereClause, params } = construirWhereClause(filtros, idMedico);

    const [distribucion] = await pool.query<RowDataPacket[]>(
      `
      SELECT 
        r.tipo_receta,
        COUNT(*) as cantidad,
        ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM recetas WHERE ${whereClause}), 2) as porcentaje
      FROM recetas r
      WHERE ${whereClause}
      GROUP BY r.tipo_receta
      ORDER BY cantidad DESC
      `,
      params
    );

    return distribucion;
  } catch (error) {
    console.error("Error al obtener distribución por tipos:", error);
    throw error;
  }
}

/**
 * Obtiene distribución por estado
 */
async function obtenerDistribucionEstados(
  idMedico: number,
  filtros: FiltrosEstadisticas
): Promise<any[]> {
  try {
    const { whereClause, params } = construirWhereClause(filtros, idMedico);

    const [distribucion] = await pool.query<RowDataPacket[]>(
      `
      SELECT 
        r.estado,
        COUNT(*) as cantidad,
        ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM recetas WHERE ${whereClause}), 2) as porcentaje
      FROM recetas r
      WHERE ${whereClause}
      GROUP BY r.estado
      ORDER BY cantidad DESC
      `,
      params
    );

    return distribucion;
  } catch (error) {
    console.error("Error al obtener distribución por estados:", error);
    throw error;
  }
}

/**
 * Obtiene medicamentos más prescritos
 */
async function obtenerMedicamentosMasPrescritos(
  idMedico: number,
  filtros: FiltrosEstadisticas,
  limite: number = 20
): Promise<any[]> {
  try {
    const { whereClause, params } = construirWhereClause(filtros, idMedico);

    const [medicamentos] = await pool.query<RowDataPacket[]>(
      `
      SELECT 
        mr.nombre_medicamento,
        mr.codigo_medicamento,
        COUNT(*) as veces_prescrito,
        COUNT(DISTINCT r.id_paciente) as pacientes_unicos,
        mr.es_controlado,
        GROUP_CONCAT(DISTINCT mr.dosis ORDER BY mr.dosis SEPARATOR ', ') as dosis_comunes,
        AVG(mr.cantidad) as cantidad_promedio
      FROM medicamentos_receta mr
      INNER JOIN recetas r ON mr.id_receta = r.id_receta
      WHERE ${whereClause}
      GROUP BY mr.nombre_medicamento, mr.codigo_medicamento, mr.es_controlado
      ORDER BY veces_prescrito DESC
      LIMIT ?
      `,
      [...params, limite]
    );

    return medicamentos;
  } catch (error) {
    console.error("Error al obtener medicamentos más prescritos:", error);
    throw error;
  }
}

/**
 * Obtiene diagnósticos más frecuentes
 */
async function obtenerDiagnosticosFrecuentes(
  idMedico: number,
  filtros: FiltrosEstadisticas,
  limite: number = 20
): Promise<any[]> {
  try {
    const { whereClause, params } = construirWhereClause(filtros, idMedico);

    const [diagnosticos] = await pool.query<RowDataPacket[]>(
      `
      SELECT 
        r.diagnostico,
        COUNT(*) as frecuencia,
        COUNT(DISTINCT r.id_paciente) as pacientes_unicos,
        ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM recetas WHERE ${whereClause}), 2) as porcentaje,
        AVG((SELECT COUNT(*) FROM medicamentos_receta WHERE id_receta = r.id_receta)) as promedio_medicamentos
      FROM recetas r
      WHERE ${whereClause} AND r.diagnostico IS NOT NULL AND r.diagnostico != ''
      GROUP BY r.diagnostico
      ORDER BY frecuencia DESC
      LIMIT ?
      `,
      [...params, limite]
    );

    return diagnosticos;
  } catch (error) {
    console.error("Error al obtener diagnósticos frecuentes:", error);
    throw error;
  }
}

/**
 * Obtiene estadísticas por centro médico
 */
async function obtenerEstadisticasPorCentro(
  idMedico: number,
  filtros: FiltrosEstadisticas
): Promise<any[]> {
  try {
    const { whereClause, params } = construirWhereClause(filtros, idMedico);

    const [centros] = await pool.query<RowDataPacket[]>(
      `
      SELECT 
        c.id_centro,
        c.nombre as centro_nombre,
        COUNT(*) as total_recetas,
        COUNT(CASE WHEN r.estado = 'dispensada' THEN 1 END) as dispensadas,
        COUNT(CASE WHEN r.estado = 'anulada' THEN 1 END) as anuladas,
        COUNT(DISTINCT r.id_paciente) as pacientes_atendidos,
        ROUND(
          COUNT(CASE WHEN r.estado = 'dispensada' THEN 1 END) * 100.0 / 
          NULLIF(COUNT(*), 0), 
          2
        ) as tasa_dispensacion
      FROM recetas r
      INNER JOIN centros_medicos c ON r.id_centro = c.id_centro
      WHERE ${whereClause}
      GROUP BY c.id_centro, c.nombre
      ORDER BY total_recetas DESC
      `,
      params
    );

    return centros;
  } catch (error) {
    console.error("Error al obtener estadísticas por centro:", error);
    throw error;
  }
}

/**
 * Obtiene estadísticas de pacientes
 */
async function obtenerEstadisticasPacientes(
  idMedico: number,
  filtros: FiltrosEstadisticas
): Promise<any> {
  try {
    const { whereClause, params } = construirWhereClause(filtros, idMedico);

    const [pacientesStats] = await pool.query<RowDataPacket[]>(
      `
      SELECT 
        COUNT(DISTINCT r.id_paciente) as total_pacientes,
        COUNT(DISTINCT CASE WHEN r.es_cronica = 1 THEN r.id_paciente END) as pacientes_cronicos,
        ROUND(AVG(recetas_por_paciente.total), 2) as promedio_recetas_por_paciente
      FROM recetas r
      LEFT JOIN (
        SELECT id_paciente, COUNT(*) as total
        FROM recetas
        WHERE ${whereClause}
        GROUP BY id_paciente
      ) as recetas_por_paciente ON r.id_paciente = recetas_por_paciente.id_paciente
      WHERE ${whereClause}
      `,
      params
    );

    const [pacientesTop] = await pool.query<RowDataPacket[]>(
      `
      SELECT 
        p.id_paciente,
        CONCAT(p.nombre, ' ', p.apellido_paterno) as paciente_nombre,
        p.rut,
        COUNT(*) as total_recetas,
        MAX(r.fecha_emision) as ultima_receta
      FROM recetas r
      INNER JOIN pacientes p ON r.id_paciente = p.id_paciente
      WHERE ${whereClause}
      GROUP BY p.id_paciente, p.nombre, p.apellido_paterno, p.rut
      ORDER BY total_recetas DESC
      LIMIT 10
      `,
      params
    );

    return {
      resumen: pacientesStats[0],
      top_pacientes: pacientesTop,
    };
  } catch (error) {
    console.error("Error al obtener estadísticas de pacientes:", error);
    throw error;
  }
}

/**
 * Obtiene estadísticas de tiempo
 */
async function obtenerEstadisticasTiempo(
  idMedico: number,
  filtros: FiltrosEstadisticas
): Promise<any> {
  try {
    const { whereClause, params } = construirWhereClause(filtros, idMedico);

    const [tiempoStats] = await pool.query<RowDataPacket[]>(
      `
      SELECT 
        ROUND(AVG(DATEDIFF(
          COALESCE(r.fecha_vencimiento, DATE_ADD(r.fecha_emision, INTERVAL 30 DAY)),
          r.fecha_emision
        )), 2) as promedio_dias_vigencia,
        
        ROUND(AVG(CASE 
          WHEN r.estado = 'dispensada' THEN 
            DATEDIFF(
              (SELECT MIN(fecha_dispensacion) 
               FROM medicamentos_receta 
               WHERE id_receta = r.id_receta AND dispensado = 1),
              r.fecha_emision
            )
        END), 2) as promedio_dias_hasta_dispensacion,
        
        COUNT(CASE 
          WHEN r.fecha_vencimiento IS NOT NULL 
          AND r.fecha_vencimiento < NOW() 
          AND r.estado = 'emitida' 
          THEN 1 
        END) as recetas_vencidas_sin_dispensar
        
      FROM recetas r
      WHERE ${whereClause}
      `,
      params
    );

    // Distribución por día de la semana
    const [distribucionDias] = await pool.query<RowDataPacket[]>(
      `
      SELECT 
        DAYNAME(r.fecha_emision) as dia_semana,
        DAYOFWEEK(r.fecha_emision) as dia_numero,
        COUNT(*) as cantidad
      FROM recetas r
      WHERE ${whereClause}
      GROUP BY DAYOFWEEK(r.fecha_emision), DAYNAME(r.fecha_emision)
      ORDER BY dia_numero
      `,
      params
    );

    // Distribución por hora del día
    const [distribucionHoras] = await pool.query<RowDataPacket[]>(
      `
      SELECT 
        HOUR(r.fecha_emision) as hora,
        COUNT(*) as cantidad
      FROM recetas r
      WHERE ${whereClause}
      GROUP BY HOUR(r.fecha_emision)
      ORDER BY hora
      `,
      params
    );

    return {
      resumen: tiempoStats[0],
      distribucion_dias_semana: distribucionDias,
      distribucion_horas: distribucionHoras,
    };
  } catch (error) {
    console.error("Error al obtener estadísticas de tiempo:", error);
    throw error;
  }
}

/**
 * Obtiene comparativa con períodos anteriores
 */
async function obtenerComparativaPeriodos(
  idMedico: number,
  filtros: FiltrosEstadisticas
): Promise<any> {
  try {
    if (!filtros.fecha_desde || !filtros.fecha_hasta) {
      return null;
    }

    const diasPeriodo = Math.ceil(
      (new Date(filtros.fecha_hasta).getTime() -
        new Date(filtros.fecha_desde).getTime()) /
        (1000 * 60 * 60 * 24)
    );

    const fechaDesdeAnterior = new Date(filtros.fecha_desde);
    fechaDesdeAnterior.setDate(fechaDesdeAnterior.getDate() - diasPeriodo);

    const fechaHastaAnterior = new Date(filtros.fecha_desde);
    fechaHastaAnterior.setDate(fechaHastaAnterior.getDate() - 1);

    // Período actual
    const statsActual = await obtenerEstadisticasGenerales(idMedico, filtros);

    // Período anterior
    const statsAnterior = await obtenerEstadisticasGenerales(idMedico, {
      ...filtros,
      fecha_desde: fechaDesdeAnterior.toISOString().split("T")[0],
      fecha_hasta: fechaHastaAnterior.toISOString().split("T")[0],
    });

    // Calcular variaciones
    const calcularVariacion = (actual: number, anterior: number) => {
      if (anterior === 0) return actual > 0 ? 100 : 0;
      return Math.round(((actual - anterior) / anterior) * 100);
    };

    return {
      periodo_actual: {
        fecha_desde: filtros.fecha_desde,
        fecha_hasta: filtros.fecha_hasta,
        estadisticas: statsActual,
      },
      periodo_anterior: {
        fecha_desde: fechaDesdeAnterior.toISOString().split("T")[0],
        fecha_hasta: fechaHastaAnterior.toISOString().split("T")[0],
        estadisticas: statsAnterior,
      },
      variaciones: {
        total_recetas: calcularVariacion(
          statsActual.total_recetas,
          statsAnterior.total_recetas
        ),
        recetas_dispensadas: calcularVariacion(
          statsActual.recetas_dispensadas,
          statsAnterior.recetas_dispensadas
        ),
        tasa_dispensacion:
          statsActual.tasa_dispensacion - statsAnterior.tasa_dispensacion,
        medicamentos_prescritos: calcularVariacion(
          statsActual.total_medicamentos_prescritos,
          statsAnterior.total_medicamentos_prescritos
        ),
      },
    };
  } catch (error) {
    console.error("Error al obtener comparativa de períodos:", error);
    return null;
  }
}

/**
 * Obtiene indicadores clave de rendimiento (KPIs)
 */
async function obtenerKPIs(
  idMedico: number,
  filtros: FiltrosEstadisticas
): Promise<any> {
  try {
    const statsGenerales = await obtenerEstadisticasGenerales(
      idMedico,
      filtros
    );
    const statsPacientes = await obtenerEstadisticasPacientes(
      idMedico,
      filtros
    );
    const statsTiempo = await obtenerEstadisticasTiempo(idMedico, filtros);

    return {
      productividad: {
        total_recetas: statsGenerales.total_recetas,
        promedio_recetas_dia: Math.round(
          statsGenerales.total_recetas /
            Math.max(
              1,
              Math.ceil(
                (new Date(filtros.fecha_hasta || Date.now()).getTime() -
                  new Date(filtros.fecha_desde || Date.now()).getTime()) /
                  (1000 * 60 * 60 * 24)
              )
            )
        ),
        pacientes_atendidos: statsPacientes.resumen.total_pacientes,
      },
      calidad: {
        tasa_dispensacion: statsGenerales.tasa_dispensacion,
        tasa_anulacion: statsGenerales.tasa_anulacion,
        promedio_medicamentos_por_receta:
          statsGenerales.promedio_medicamentos_por_receta,
        recetas_vencidas_sin_dispensar:
          statsTiempo.resumen.recetas_vencidas_sin_dispensar,
      },
      eficiencia: {
        promedio_dias_hasta_dispensacion:
          statsTiempo.resumen.promedio_dias_hasta_dispensacion,
        promedio_dias_vigencia: statsTiempo.resumen.promedio_dias_vigencia,
        recetas_cronicas_porcentaje: Math.round(
          (statsGenerales.recetas_cronicas / statsGenerales.total_recetas) *
            100
        ),
      },
      seguridad: {
        medicamentos_controlados: statsGenerales.medicamentos_controlados,
        porcentaje_controlados: Math.round(
          (statsGenerales.medicamentos_controlados /
            statsGenerales.total_medicamentos_prescritos) *
            100
        ),
      },
    };
  } catch (error) {
    console.error("Error al obtener KPIs:", error);
    throw error;
  }
}

// ========================================
// HANDLER GET - Obtener estadísticas
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
      SELECT su.id_usuario
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
          error: "No tienes un registro de médico activo",
        },
        { status: 403 }
      );
    }

    // 4. Obtener parámetros
    const searchParams = request.nextUrl.searchParams;

    const filtros: FiltrosEstadisticas = {
      fecha_desde: searchParams.get("fecha_desde") || undefined,
      fecha_hasta: searchParams.get("fecha_hasta") || undefined,
      id_centro: searchParams.get("id_centro")
        ? parseInt(searchParams.get("id_centro")!)
        : undefined,
      tipo_receta: searchParams.get("tipo_receta") || undefined,
      agrupar_por:
        (searchParams.get("agrupar_por") as any) || "mes",
    };

    // Si no hay fechas, usar últimos 30 días
    if (!filtros.fecha_desde) {
      const hace30Dias = new Date();
      hace30Dias.setDate(hace30Dias.getDate() - 30);
      filtros.fecha_desde = hace30Dias.toISOString().split("T")[0];
    }

    if (!filtros.fecha_hasta) {
      filtros.fecha_hasta = new Date().toISOString().split("T")[0];
    }

    // 5. Obtener tipo de reporte
    const tipoReporte = searchParams.get("tipo") || "completo";

    // 6. Construir respuesta según tipo
    let respuesta: any = {
      success: true,
      medico: {
        id: medico.id_medico,
        nombre: medico.nombre_completo,
        registro: medico.numero_registro_medico,
      },
      periodo: {
        fecha_desde: filtros.fecha_desde,
        fecha_hasta: filtros.fecha_hasta,
      },
      filtros_aplicados: filtros,
      timestamp: new Date().toISOString(),
    };

    switch (tipoReporte) {
      case "resumen":
        respuesta.estadisticas = await obtenerEstadisticasGenerales(
          medico.id_medico,
          filtros
        );
        respuesta.kpis = await obtenerKPIs(medico.id_medico, filtros);
        break;

      case "evolucion":
        respuesta.evolucion = await obtenerEvolucionTemporal(
          medico.id_medico,
          filtros
        );
        break;

      case "medicamentos":
        respuesta.medicamentos_mas_prescritos =
          await obtenerMedicamentosMasPrescritos(medico.id_medico, filtros, 30);
        break;

      case "diagnosticos":
        respuesta.diagnosticos_frecuentes =
          await obtenerDiagnosticosFrecuentes(medico.id_medico, filtros, 30);
        break;

      case "centros":
        respuesta.estadisticas_por_centro =
          await obtenerEstadisticasPorCentro(medico.id_medico, filtros);
        break;

      case "pacientes":
        respuesta.estadisticas_pacientes = await obtenerEstadisticasPacientes(
          medico.id_medico,
          filtros
        );
        break;

      case "tiempo":
        respuesta.estadisticas_tiempo = await obtenerEstadisticasTiempo(
          medico.id_medico,
          filtros
        );
        break;

      case "comparativa":
        respuesta.comparativa = await obtenerComparativaPeriodos(
          medico.id_medico,
          filtros
        );
        break;

      case "completo":
      default:
        // Reporte completo con todas las estadísticas
        respuesta.estadisticas_generales = await obtenerEstadisticasGenerales(
          medico.id_medico,
          filtros
        );
        respuesta.kpis = await obtenerKPIs(medico.id_medico, filtros);
        respuesta.evolucion_temporal = await obtenerEvolucionTemporal(
          medico.id_medico,
          filtros
        );
        respuesta.distribucion_tipos = await obtenerDistribucionTipos(
          medico.id_medico,
          filtros
        );
        respuesta.distribucion_estados = await obtenerDistribucionEstados(
          medico.id_medico,
          filtros
        );
        respuesta.medicamentos_mas_prescritos =
          await obtenerMedicamentosMasPrescritos(medico.id_medico, filtros, 20);
        respuesta.diagnosticos_frecuentes =
          await obtenerDiagnosticosFrecuentes(medico.id_medico, filtros, 20);
        respuesta.estadisticas_por_centro =
          await obtenerEstadisticasPorCentro(medico.id_medico, filtros);
        respuesta.estadisticas_pacientes = await obtenerEstadisticasPacientes(
          medico.id_medico,
          filtros
        );
        respuesta.estadisticas_tiempo = await obtenerEstadisticasTiempo(
          medico.id_medico,
          filtros
        );
        respuesta.comparativa = await obtenerComparativaPeriodos(
          medico.id_medico,
          filtros
        );
        break;
    }

    return NextResponse.json(respuesta, { status: 200 });
  } catch (error: any) {
    console.error(
      "❌ Error en GET /api/medico/recetas/estadisticas:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error: "Error al obtener estadísticas",
        details:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}
