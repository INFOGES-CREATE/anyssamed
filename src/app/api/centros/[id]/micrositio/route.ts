// frontend/src/app/api/centros/[id]/micrositio/route.ts
import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { RowDataPacket } from "mysql2";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    console.log(`📡 Cargando micrositio completo del centro ID: ${params.id}`);

    // 1️⃣ Obtener datos principales del centro
    const [centroRows] = await pool.query<RowDataPacket[]>(`
      SELECT 
        id_centro,
        nombre,
        razon_social,
        rut,
        descripcion,
        direccion,
        ciudad,
        region,
        codigo_postal,
        telefono_principal AS telefono,
        email_contacto AS email,
        sitio_web,
        logo_url,
        horario_apertura,
        horario_cierre,
        dias_atencion,
        capacidad_pacientes_dia,
        nivel_complejidad,
        especializacion_principal,
        estado,
        fecha_inicio_operacion
      FROM centros_medicos
      WHERE id_centro = ? AND estado = 'activo'
      LIMIT 1
    `, [params.id]);

    if (!centroRows || centroRows.length === 0) {
      return NextResponse.json(
        { success: false, error: "Centro no encontrado" },
        { status: 404 }
      );
    }

    const centro = centroRows[0];

    // 2️⃣ Obtener las sucursales
    const [sucursales] = await pool.query<RowDataPacket[]>(`
      SELECT 
        id_sucursal,
        nombre,
        direccion,
        ciudad,
        region,
        codigo_postal,
        telefono,
        email_contacto,
        horario_apertura,
        horario_cierre,
        dias_atencion,
        capacidad_pacientes_dia,
        estado
      FROM sucursales
      WHERE id_centro = ? AND estado = 'activo'
      ORDER BY nombre ASC
    `, [params.id]);

    // 3️⃣ Obtener los servicios médicos
    let servicios: RowDataPacket[] = [];
    try {
      [servicios] = await pool.query<RowDataPacket[]>(`
        SELECT 
          id_servicio,
          nombre_servicio, 
          descripcion_servicio,
          prioridad
        FROM servicios_centros 
        WHERE id_centro = ? AND activo = 1
        ORDER BY prioridad ASC, nombre_servicio ASC
      `, [params.id]);
    } catch {
      console.warn("⚠️ Tabla 'servicios_centros' no encontrada");
    }

    // 4️⃣ Obtener los médicos con sus especialidades
    let medicos: RowDataPacket[] = [];
    try {
      [medicos] = await pool.query<RowDataPacket[]>(`
        SELECT 
          m.id_medico,
          u.nombre,
          u.apellido_paterno,
          u.apellido_materno,
          u.foto_perfil_url AS foto_url,
          m.numero_registro_medico,
          m.titulo_profesional,
          m.universidad,
          m.ano_graduacion,
          m.biografia,
          m.acepta_nuevos_pacientes,
          m.atiende_particular,
          m.atiende_fonasa,
          m.atiende_isapre,
          m.consulta_presencial,
          m.consulta_telemedicina,
          m.duracion_consulta_min,
          e.nombre AS especialidad,
          me.anos_experiencia,
          me.es_principal
        FROM medicos m
        INNER JOIN usuarios u ON m.id_usuario = u.id_usuario
        LEFT JOIN medicos_especialidades me ON m.id_medico = me.id_medico AND me.es_principal = 1
        LEFT JOIN especialidades e ON me.id_especialidad = e.id_especialidad
        WHERE m.id_centro_principal = ? AND m.estado = 'activo' AND u.estado = 'activo'
        ORDER BY me.es_principal DESC, u.apellido_paterno ASC
        LIMIT 20
      `, [params.id]);
    } catch {
      console.warn("⚠️ Tabla 'medicos' no encontrada");
    }

    // 5️⃣ Obtener todas las especialidades disponibles en el centro
    let especialidades: RowDataPacket[] = [];
    try {
      [especialidades] = await pool.query<RowDataPacket[]>(`
        SELECT DISTINCT
          e.id_especialidad,
          e.nombre,
          e.descripcion,
          e.codigo,
          e.area_medica,
          e.icono_url,
          e.color,
          COUNT(DISTINCT me.id_medico) AS cantidad_medicos
        FROM especialidades e
        INNER JOIN medicos_especialidades me ON e.id_especialidad = me.id_especialidad
        INNER JOIN medicos m ON me.id_medico = m.id_medico
        WHERE m.id_centro_principal = ? AND e.activo = 1 AND m.estado = 'activo'
        GROUP BY e.id_especialidad
        ORDER BY cantidad_medicos DESC, e.nombre ASC
      `, [params.id]);
    } catch {
      console.warn("⚠️ Tabla 'especialidades' no encontrada");
    }

    // 6️⃣ Obtener reseñas recientes
    let resenas: RowDataPacket[] = [];
    try {
      [resenas] = await pool.query<RowDataPacket[]>(`
        SELECT 
          r.id_resena,
          r.calificacion,
          r.comentario,
          r.fecha_creacion AS fecha,
          CONCAT(p.nombre, ' ', SUBSTRING(p.apellido_paterno, 1, 1), '.') AS nombre_paciente,
          r.estado
        FROM resenas r
        INNER JOIN pacientes p ON r.id_paciente = p.id_paciente
        WHERE r.id_centro = ? AND r.estado = 'publicada'
        ORDER BY r.fecha_creacion DESC
        LIMIT 12
      `, [params.id]);
    } catch {
      console.warn("⚠️ Tabla 'resenas' no encontrada");
    }

    // 7️⃣ Obtener promociones activas
    let promociones: RowDataPacket[] = [];
    try {
      [promociones] = await pool.query<RowDataPacket[]>(`
        SELECT 
          id_promocion,
          titulo,
          descripcion,
          descuento,
          imagen_url,
          fecha_inicio,
          fecha_fin,
          estado
        FROM promociones
        WHERE id_centro = ? 
          AND estado = 'activa'
          AND fecha_inicio <= CURDATE()
          AND fecha_fin >= CURDATE()
        ORDER BY prioridad DESC, fecha_creacion DESC
        LIMIT 6
      `, [params.id]);
    } catch {
      console.warn("⚠️ Tabla 'promociones' no encontrada");
    }

    // 8️⃣ Obtener horarios detallados (si existe la tabla)
    let horariosDetallados: RowDataPacket[] = [];
    try {
      [horariosDetallados] = await pool.query<RowDataPacket[]>(`
        SELECT 
          dia_semana,
          hora_apertura,
          hora_cierre,
          es_festivo,
          fecha_especifica,
          nota
        FROM horarios_atencion
        WHERE id_centro = ? AND id_sucursal IS NULL
        ORDER BY 
          FIELD(dia_semana, 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo')
      `, [params.id]);
    } catch {
      console.warn("⚠️ Tabla 'horarios_atencion' no encontrada");
    }

    // 9️⃣ Obtener recursos educativos (si existe la tabla)
    let recursosEducativos: RowDataPacket[] = [];
    try {
      [recursosEducativos] = await pool.query<RowDataPacket[]>(`
        SELECT 
          id_recurso,
          titulo,
          descripcion,
          tipo_recurso,
          url_recurso,
          imagen_url,
          fecha_publicacion
        FROM recursos_educativos
        WHERE id_centro = ? AND estado = 'publicado'
        ORDER BY fecha_publicacion DESC
        LIMIT 6
      `, [params.id]);
    } catch {
      console.warn("⚠️ Tabla 'recursos_educativos' no encontrada");
    }

    // 🔟 Calcular estadísticas
    const estadisticas = {
      total_medicos: medicos.length,
      total_especialidades: especialidades.length,
      total_servicios: servicios.length,
      total_sucursales: sucursales.length,
      calificacion_promedio: resenas.length > 0
        ? (resenas.reduce((sum: number, r: any) => sum + r.calificacion, 0) / resenas.length).toFixed(1)
        : "5.0",
      total_resenas: resenas.length,
      medicos_telemedicina: medicos.filter((m: any) => m.consulta_telemedicina).length,
      medicos_disponibles: medicos.filter((m: any) => m.acepta_nuevos_pacientes).length,
    };

    // 1️⃣1️⃣ Respuesta final completa
    return NextResponse.json({
      success: true,
      data: {
        centro,
        sucursales: sucursales || [],
        servicios: servicios || [],
        medicos: medicos || [],
        especialidades: especialidades || [],
        resenas: resenas || [],
        promociones: promociones || [],
        horarios_detallados: horariosDetallados || [],
        recursos_educativos: recursosEducativos || [],
        estadisticas,
      },
    });
  } catch (error: any) {
    console.error(`❌ Error en GET /api/centros/${params.id}/micrositio:`, error);
    return NextResponse.json(
      {
        success: false,
        error: "Error al obtener información del centro",
        details: error.message,
      },
      { status: 500 }
    );
  }
}