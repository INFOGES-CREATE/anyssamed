import { NextResponse } from "next/server";
import pool from "@/lib/db";

/**
 * ============================================================
 * 📊 API: Estadísticas de Respondedores Comunitarios
 * Sistema: COGRID Comunal - Gestión de Emergencias
 * Versión: 1.0 PREMIUM
 * ============================================================
 *
 * Retorna estadísticas completas del sistema de respondedores:
 *  - Total de respondedores activos
 *  - Disponibles vs Ocupados vs Fuera de servicio
 *  - Respondedores en servicio (en ruta + en sitio)
 *  - Tiempo promedio de respuesta
 *  - Evaluación promedio del equipo
 *  - Emergencias activas
 *  - Distribución por tipo
 *  - Distribución por especialidad
 *  - Distribución por nivel de experiencia
 *  - Cobertura geográfica
 *
 * Sin parámetros requeridos - retorna todas las estadísticas
 * ============================================================
 */

export async function GET(req: Request) {
  try {
    // ============================================================
    // 1️⃣ Total de respondedores activos
    // ============================================================
    const [totalRows]: any = await pool.query(
      `SELECT COUNT(DISTINCT id_respondedor) as total
       FROM emergencias_respondedores
       WHERE activo = 1`
    );
    const total_respondedores = totalRows[0]?.total || 0;

    // ============================================================
    // 2️⃣ Respondedores disponibles
    // ============================================================
    const [disponiblesRows]: any = await pool.query(
      `SELECT COUNT(DISTINCT id_respondedor) as total
       FROM emergencias_respondedores
       WHERE activo = 1 AND disponible = 1 AND estado NOT IN ('EN_RUTA', 'EN_SITIO', 'OCUPADO')`
    );
    const disponibles = disponiblesRows[0]?.total || 0;

    // ============================================================
    // 3️⃣ Respondedores en servicio (en ruta + en sitio)
    // ============================================================
    const [enServicioRows]: any = await pool.query(
      `SELECT COUNT(DISTINCT er.id_respondedor) as total
       FROM emergencias_respondedores er
       INNER JOIN emergencias e ON er.id_emergencia = e.id_emergencia
       WHERE er.activo = 1
         AND er.estado IN ('EN_RUTA', 'EN_SITIO')
         AND e.estado IN ('ABIERTO', 'EN_PROCESO')
         AND e.activo = 1`
    );
    const en_servicio = enServicioRows[0]?.total || 0;

    // ============================================================
    // 4️⃣ Respondedores fuera de servicio
    // ============================================================
    const [fueraServicioRows]: any = await pool.query(
      `SELECT COUNT(DISTINCT id_respondedor) as total
       FROM emergencias_respondedores
       WHERE activo = 1 AND estado = 'FUERA_DE_SERVICIO'`
    );
    const fuera_servicio = fueraServicioRows[0]?.total || 0;

    // ============================================================
    // 5️⃣ Tiempo promedio de respuesta
    // ============================================================
    const [tiempoRows]: any = await pool.query(
      `SELECT AVG(tiempo_respuesta_minutos) as promedio
       FROM emergencias_respondedores
       WHERE activo = 1 AND tiempo_respuesta_minutos IS NOT NULL`
    );
    const tiempo_promedio_respuesta = parseFloat(tiempoRows[0]?.promedio || 0).toFixed(1);

    // ============================================================
    // 6️⃣ Evaluación promedio
    // ============================================================
    const [evaluacionRows]: any = await pool.query(
      `SELECT AVG(evaluacion_puntaje) as promedio
       FROM emergencias_respondedores
       WHERE activo = 1 AND evaluacion_puntaje IS NOT NULL`
    );
    const evaluacion_promedio = parseFloat(evaluacionRows[0]?.promedio || 0).toFixed(2);

    // ============================================================
    // 7️⃣ Emergencias activas
    // ============================================================
    const [emergenciasRows]: any = await pool.query(
      `SELECT COUNT(DISTINCT id_emergencia) as total
       FROM emergencias
       WHERE estado IN ('ABIERTO', 'EN_PROCESO') AND activo = 1`
    );
    const emergencias_activas = emergenciasRows[0]?.total || 0;

    // ============================================================
    // 8️⃣ Distribución por tipo de respondedor
    // ============================================================
    const [porTipoRows]: any = await pool.query(
      `SELECT
         tipo_respondedor,
         COUNT(*) as cantidad,
         ROUND((COUNT(*) * 100.0 / (SELECT COUNT(*) FROM emergencias_respondedores WHERE activo = 1)), 1) as porcentaje
       FROM emergencias_respondedores
       WHERE activo = 1
       GROUP BY tipo_respondedor
       ORDER BY cantidad DESC`
    );

    // ============================================================
    // 9️⃣ Distribución por especialidad
    // ============================================================
    const [porEspecialidadRows]: any = await pool.query(
      `SELECT
         especialidad,
         COUNT(*) as cantidad
       FROM emergencias_respondedores
       WHERE activo = 1
         AND especialidad IS NOT NULL
         AND especialidad != ''
       GROUP BY especialidad
       ORDER BY cantidad DESC
       LIMIT 10`
    );

    // ============================================================
    // 🔟 Distribución por nivel de experiencia
    // ============================================================
    const [porExperienciaRows]: any = await pool.query(
      `SELECT
         nivel_experiencia,
         COUNT(*) as cantidad,
         ROUND((COUNT(*) * 100.0 / (SELECT COUNT(*) FROM emergencias_respondedores WHERE activo = 1)), 1) as porcentaje
       FROM emergencias_respondedores
       WHERE activo = 1
       GROUP BY nivel_experiencia
       ORDER BY
         CASE nivel_experiencia
           WHEN 'EXPERTO' THEN 1
           WHEN 'AVANZADO' THEN 2
           WHEN 'INTERMEDIO' THEN 3
           WHEN 'BASICO' THEN 4
           ELSE 5
         END`
    );

    // ============================================================
    // 1️⃣1️⃣ Respondedores por centro de salud
    // ============================================================
    const [porCentroRows]: any = await pool.query(
      `SELECT
         cs.nombre as centro_nombre,
         cs.tipo as centro_tipo,
         COUNT(DISTINCT er.id_respondedor) as cantidad_respondedores,
         SUM(CASE WHEN er.disponible = 1 THEN 1 ELSE 0 END) as disponibles,
         SUM(CASE WHEN er.estado IN ('EN_RUTA', 'EN_SITIO') THEN 1 ELSE 0 END) as en_servicio
       FROM emergencias_respondedores er
       LEFT JOIN centros_salud cs ON er.id_centro = cs.id_centro
       WHERE er.activo = 1
       GROUP BY cs.id_centro, cs.nombre, cs.tipo
       ORDER BY cantidad_respondedores DESC
       LIMIT 10`
    );

    // ============================================================
    // 1️⃣2️⃣ Cobertura geográfica (área aproximada)
    // ============================================================
    const [coberturaRows]: any = await pool.query(
      `SELECT
         MIN(latitud) as lat_min,
         MAX(latitud) as lat_max,
         MIN(longitud) as lng_min,
         MAX(longitud) as lng_max,
         COUNT(*) as respondedores_con_ubicacion
       FROM emergencias_respondedores
       WHERE activo = 1
         AND latitud IS NOT NULL
         AND longitud IS NOT NULL
         AND latitud BETWEEN -56 AND -17
         AND longitud BETWEEN -76 AND -66`
    );

    const cobertura = coberturaRows[0];
    let cobertura_km2 = 0;

    if (cobertura && cobertura.respondedores_con_ubicacion > 0) {
      // Cálculo aproximado del área de cobertura
      const lat_diff = Math.abs(cobertura.lat_max - cobertura.lat_min);
      const lng_diff = Math.abs(cobertura.lng_max - cobertura.lng_min);

      // Aproximación: 1 grado de latitud ≈ 111 km, 1 grado de longitud ≈ 111 km * cos(latitud)
      const lat_km = lat_diff * 111;
      const lng_km = lng_diff * 111 * Math.cos((cobertura.lat_min + cobertura.lat_max) / 2 * Math.PI / 180);

      cobertura_km2 = parseFloat((lat_km * lng_km).toFixed(2));
    }

    // ============================================================
    // 1️⃣3️⃣ Distribución por estado
    // ============================================================
    const [porEstadoRows]: any = await pool.query(
      `SELECT
         estado,
         COUNT(*) as cantidad,
         ROUND((COUNT(*) * 100.0 / (SELECT COUNT(*) FROM emergencias_respondedores WHERE activo = 1)), 1) as porcentaje
       FROM emergencias_respondedores
       WHERE activo = 1
       GROUP BY estado
       ORDER BY cantidad DESC`
    );

    // ============================================================
    // 1️⃣4️⃣ Top respondedores (mejor evaluados)
    // ============================================================
    const [topRespondedoresRows]: any = await pool.query(
      `SELECT
         id_respondedor,
         CONCAT_WS(' ', nombres, apellido_paterno, apellido_materno) as nombre_completo,
         tipo_respondedor,
         evaluacion_puntaje,
         tiempo_respuesta_minutos,
         (
           SELECT COUNT(*)
           FROM emergencias e
           INNER JOIN emergencias_respondedores er2 ON e.id_emergencia = er2.id_emergencia
           WHERE er2.id_respondedor = er.id_respondedor AND e.activo = 1
         ) as total_emergencias_atendidas
       FROM emergencias_respondedores er
       WHERE activo = 1
         AND evaluacion_puntaje IS NOT NULL
       ORDER BY evaluacion_puntaje DESC, tiempo_respuesta_minutos ASC
       LIMIT 10`
    );

    // ============================================================
    // 1️⃣5️⃣ Tendencias temporales (últimos 7 días)
    // ============================================================
    const [tendenciasRows]: any = await pool.query(
      `SELECT
         DATE(fecha_creacion) as fecha,
         COUNT(*) as nuevos_respondedores
       FROM emergencias_respondedores
       WHERE activo = 1
         AND fecha_creacion >= DATE_SUB(NOW(), INTERVAL 7 DAY)
       GROUP BY DATE(fecha_creacion)
       ORDER BY fecha DESC`
    );

    // ============================================================
    // Retornar todas las estadísticas
    // ============================================================
    return NextResponse.json(
      {
        success: true,
        timestamp: new Date().toISOString(),
        resumen: {
          total_respondedores: parseInt(total_respondedores),
          disponibles: parseInt(disponibles),
          en_servicio: parseInt(en_servicio),
          fuera_servicio: parseInt(fuera_servicio),
          ocupados: parseInt(total_respondedores) - parseInt(disponibles) - parseInt(en_servicio) - parseInt(fuera_servicio),
          tiempo_promedio_respuesta: parseFloat(tiempo_promedio_respuesta),
          evaluacion_promedio: parseFloat(evaluacion_promedio),
          emergencias_activas: parseInt(emergencias_activas),
          cobertura_km2,
        },
        porcentajes: {
          disponibles_pct: ((parseInt(disponibles) / parseInt(total_respondedores)) * 100).toFixed(1),
          en_servicio_pct: ((parseInt(en_servicio) / parseInt(total_respondedores)) * 100).toFixed(1),
          fuera_servicio_pct: ((parseInt(fuera_servicio) / parseInt(total_respondedores)) * 100).toFixed(1),
        },
        distribucion: {
          por_tipo: porTipoRows,
          por_especialidad: porEspecialidadRows,
          por_experiencia: porExperienciaRows,
          por_estado: porEstadoRows,
          por_centro: porCentroRows,
        },
        top_respondedores: topRespondedoresRows,
        tendencias_ultimos_7_dias: tendenciasRows,
        cobertura_geografica: {
          area_km2: cobertura_km2,
          respondedores_con_ubicacion: cobertura?.respondedores_con_ubicacion || 0,
          limites: cobertura ? {
            lat_min: parseFloat(cobertura.lat_min),
            lat_max: parseFloat(cobertura.lat_max),
            lng_min: parseFloat(cobertura.lng_min),
            lng_max: parseFloat(cobertura.lng_max),
          } : null,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("❌ Error al obtener estadísticas:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Error al obtener estadísticas de respondedores",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
