import { NextResponse } from "next/server";
import pool from "@/lib/db";

/**
 * ============================================================
 * 🚑 API: Listar Respondedores Comunitarios
 * Sistema: COGRID Comunal - Gestión de Emergencias
 * Versión: 1.0 PREMIUM
 * ============================================================
 *
 * Retorna el listado completo de respondedores comunitarios
 * con sus coordenadas, estado, disponibilidad y datos de contacto.
 *
 * Incluye información de:
 *  - Datos personales y contacto
 *  - Ubicación geográfica (latitud/longitud)
 *  - Estado y disponibilidad actual
 *  - Estadísticas de desempeño
 *  - Centro de salud asignado
 *  - Emergencia activa (si aplica)
 *
 * Parámetros opcionales (GET):
 *  - disponible: boolean (true/false) - filtrar solo disponibles
 *  - tipo: string - filtrar por tipo de respondedor
 *  - estado: string - filtrar por estado
 *  - centro_id: number - filtrar por centro de salud
 * ============================================================
 */

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const disponible = searchParams.get("disponible");
    const tipo = searchParams.get("tipo");
    const estado = searchParams.get("estado");
    const centro_id = searchParams.get("centro_id");

    // ============================================================
    // Construir condiciones WHERE dinámicas
    // ============================================================
    let whereConditions = ["er.activo = 1"];
    let queryParams: any[] = [];

    if (disponible !== null) {
      whereConditions.push("er.disponible = ?");
      queryParams.push(disponible === "true" ? 1 : 0);
    }

    if (tipo) {
      whereConditions.push("er.tipo_respondedor = ?");
      queryParams.push(tipo);
    }

    if (estado) {
      whereConditions.push("er.estado = ?");
      queryParams.push(estado);
    }

    if (centro_id) {
      whereConditions.push("er.id_centro = ?");
      queryParams.push(parseInt(centro_id));
    }

    const whereClause = whereConditions.join(" AND ");

    // ============================================================
    // Consulta SQL - Obtener respondedores con toda su información
    // ============================================================
    const query = `
      SELECT
        er.id_respondedor,
        er.nombres,
        er.apellido_paterno,
        er.apellido_materno,
        CONCAT_WS(' ', er.nombres, er.apellido_paterno, er.apellido_materno) as nombre_completo,
        er.rut,
        er.celular_personal,
        er.email_personal,
        er.direccion_personal,
        er.localidad,
        er.comuna,
        er.organizacion_pertenece,
        er.tipo_respondedor,
        er.rol_respondedor,
        er.especialidad,
        er.nivel_experiencia,
        er.estado,
        er.disponible,
        CAST(er.latitud AS DECIMAL(10,7)) as latitud,
        CAST(er.longitud AS DECIMAL(10,7)) as longitud,
        er.coordenadas_texto,
        er.fecha_asignacion,
        er.fecha_creacion,
        er.tiempo_respuesta_minutos as tiempo_promedio_respuesta,
        er.evaluacion_puntaje as evaluacion_promedio,
        cs.id_centro,
        cs.nombre AS centro_nombre,
        cs.direccion AS centro_direccion,
        cs.telefono AS centro_telefono,
        e.id_emergencia,
        e.nombre AS emergencia_nombre,
        e.nivel_severidad AS emergencia_severidad,
        e.estado AS emergencia_estado,
        (
          SELECT COUNT(DISTINCT e2.id_emergencia)
          FROM emergencias e2
          INNER JOIN emergencias_respondedores er2 ON e2.id_emergencia = er2.id_emergencia
          WHERE er2.id_respondedor = er.id_respondedor
            AND e2.estado IN ('ABIERTO', 'EN_PROCESO')
            AND e2.activo = 1
        ) as emergencias_activas,
        (
          SELECT COUNT(DISTINCT e3.id_emergencia)
          FROM emergencias e3
          INNER JOIN emergencias_respondedores er3 ON e3.id_emergencia = er3.id_emergencia
          WHERE er3.id_respondedor = er.id_respondedor
            AND e3.activo = 1
        ) as total_emergencias,
        er.ultima_ubicacion,
        er.ultima_actualizacion
      FROM emergencias_respondedores er
      LEFT JOIN centros_salud cs ON er.id_centro = cs.id_centro
      LEFT JOIN emergencias e ON er.id_emergencia = e.id_emergencia AND e.activo = 1
      WHERE ${whereClause}
      GROUP BY er.id_respondedor
      ORDER BY er.fecha_creacion DESC, er.nombres ASC
    `;

    const [rows]: any = await pool.query(query, queryParams);

    // ============================================================
    // Procesar y validar coordenadas
    // ============================================================
    const respondedores = rows.map((row: any) => {
      // Convertir disponible a boolean
      row.disponible = row.disponible === 1 || row.disponible === true;

      // Validar coordenadas para Chile
      if (row.latitud && row.longitud) {
        const lat = parseFloat(row.latitud);
        const lng = parseFloat(row.longitud);

        // Validar rango de coordenadas para Chile
        if (lat >= -56 && lat <= -17 && lng >= -76 && lng <= -66) {
          row.latitud = lat;
          row.longitud = lng;
        } else {
          row.latitud = null;
          row.longitud = null;
        }
      }

      return row;
    });

    // ============================================================
    // Retornar respuesta exitosa
    // ============================================================
    return NextResponse.json(
      {
        success: true,
        respondedores,
        total: respondedores.length,
        filtros_aplicados: {
          disponible: disponible || "todos",
          tipo: tipo || "todos",
          estado: estado || "todos",
          centro_id: centro_id || "todos",
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("❌ Error al listar respondedores:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Error al obtener el listado de respondedores",
        error: error.message,
      },
      { status: 500 }
    );
  }
}

/**
 * ============================================================
 * 📝 POST: Crear nuevo respondedor
 * ============================================================
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      nombres,
      apellido_paterno,
      apellido_materno,
      rut,
      celular_personal,
      email_personal,
      direccion_personal,
      localidad,
      comuna,
      organizacion_pertenece,
      tipo_respondedor,
      rol_respondedor,
      especialidad,
      nivel_experiencia,
      latitud,
      longitud,
      id_centro,
    } = body;

    // Validar campos requeridos
    if (!nombres || !apellido_paterno || !tipo_respondedor) {
      return NextResponse.json(
        {
          success: false,
          message: "Faltan campos requeridos: nombres, apellido_paterno, tipo_respondedor",
        },
        { status: 400 }
      );
    }

    // Validar coordenadas si se proporcionan
    if (latitud && longitud) {
      const lat = parseFloat(latitud);
      const lng = parseFloat(longitud);

      if (lat < -56 || lat > -17 || lng < -76 || lng > -66) {
        return NextResponse.json(
          {
            success: false,
            message: "Coordenadas inválidas. Deben estar dentro del territorio de Chile.",
          },
          { status: 400 }
        );
      }
    }

    // Insertar nuevo respondedor
    const [result]: any = await pool.query(
      `INSERT INTO emergencias_respondedores (
        nombres,
        apellido_paterno,
        apellido_materno,
        rut,
        celular_personal,
        email_personal,
        direccion_personal,
        localidad,
        comuna,
        organizacion_pertenece,
        tipo_respondedor,
        rol_respondedor,
        especialidad,
        nivel_experiencia,
        latitud,
        longitud,
        id_centro,
        estado,
        disponible,
        activo,
        fecha_creacion
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'DISPONIBLE', 1, 1, NOW())`,
      [
        nombres,
        apellido_paterno,
        apellido_materno,
        rut,
        celular_personal,
        email_personal,
        direccion_personal,
        localidad,
        comuna,
        organizacion_pertenece,
        tipo_respondedor,
        rol_respondedor,
        especialidad,
        nivel_experiencia,
        latitud,
        longitud,
        id_centro,
      ]
    );

    return NextResponse.json(
      {
        success: true,
        message: "Respondedor creado exitosamente",
        id_respondedor: result.insertId,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("❌ Error al crear respondedor:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Error al crear respondedor",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
