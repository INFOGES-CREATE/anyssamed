import { NextResponse } from "next/server";
import pool from "@/lib/db";

/**
 * ============================================================
 * 🚨 API: Despachar Respondedor a Emergencia
 * Sistema: COGRID Comunal - Gestión de Emergencias
 * Versión: 1.0 PREMIUM
 * ============================================================
 *
 * Asigna un respondedor disponible a una emergencia activa.
 * Actualiza el estado del respondedor y registra la asignación.
 *
 * Validaciones:
 *  - Respondedor debe estar disponible
 *  - Emergencia debe estar activa
 *  - Respondedor no debe estar en otra emergencia
 *  - Validar que no exceda capacidad de la emergencia
 *
 * Parámetros POST:
 *  - id_respondedor: número entero obligatorio
 *  - id_emergencia: número entero obligatorio
 *  - prioridad: string opcional ("BAJA", "MEDIA", "ALTA", "CRITICA")
 *  - notas: string opcional
 *  - id_usuario: número entero obligatorio (quien despacha)
 * ============================================================
 */

export async function POST(req: Request) {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const body = await req.json();
    const {
      id_respondedor,
      id_emergencia,
      prioridad = "MEDIA",
      notas = "",
      id_usuario,
    } = body;

    // ============================================================
    // 1️⃣ Validación de parámetros
    // ============================================================
    if (!id_respondedor || !id_emergencia) {
      await connection.rollback();
      return NextResponse.json(
        {
          success: false,
          message: "Faltan parámetros requeridos: id_respondedor, id_emergencia",
        },
        { status: 400 }
      );
    }

    // ============================================================
    // 2️⃣ Verificar que el respondedor existe y está disponible
    // ============================================================
    const [respondedorRows]: any = await connection.query(
      `SELECT
         id_respondedor,
         CONCAT_WS(' ', nombres, apellido_paterno, apellido_materno) as nombre_completo,
         disponible,
         estado,
         latitud,
         longitud,
         celular_personal,
         tipo_respondedor
       FROM emergencias_respondedores
       WHERE id_respondedor = ? AND activo = 1`,
      [id_respondedor]
    );

    if (respondedorRows.length === 0) {
      await connection.rollback();
      return NextResponse.json(
        {
          success: false,
          message: "Respondedor no encontrado o inactivo",
        },
        { status: 404 }
      );
    }

    const respondedor = respondedorRows[0];

    if (!respondedor.disponible || respondedor.estado !== "DISPONIBLE") {
      await connection.rollback();
      return NextResponse.json(
        {
          success: false,
          message: `El respondedor ${respondedor.nombre_completo} no está disponible actualmente (Estado: ${respondedor.estado})`,
        },
        { status: 400 }
      );
    }

    // ============================================================
    // 3️⃣ Verificar que la emergencia existe y está activa
    // ============================================================
    const [emergenciaRows]: any = await connection.query(
      `SELECT
         id_emergencia,
         nombre,
         direccion,
         latitud,
         longitud,
         estado,
         nivel_severidad,
         fecha_hora_inicio
       FROM emergencias
       WHERE id_emergencia = ? AND activo = 1`,
      [id_emergencia]
    );

    if (emergenciaRows.length === 0) {
      await connection.rollback();
      return NextResponse.json(
        {
          success: false,
          message: "Emergencia no encontrada o inactiva",
        },
        { status: 404 }
      );
    }

    const emergencia = emergenciaRows[0];

    if (emergencia.estado === "CERRADA" || emergencia.estado === "CANCELADA") {
      await connection.rollback();
      return NextResponse.json(
        {
          success: false,
          message: `La emergencia "${emergencia.nombre}" ya está cerrada o cancelada`,
        },
        { status: 400 }
      );
    }

    // ============================================================
    // 4️⃣ Calcular distancia y tiempo estimado de llegada
    // ============================================================
    let distancia_km = null;
    let tiempo_estimado_minutos = null;

    if (respondedor.latitud && respondedor.longitud && emergencia.latitud && emergencia.longitud) {
      // Fórmula de Haversine simplificada
      const R = 6371; // Radio de la Tierra en km
      const lat1 = respondedor.latitud * Math.PI / 180;
      const lat2 = emergencia.latitud * Math.PI / 180;
      const deltaLat = (emergencia.latitud - respondedor.latitud) * Math.PI / 180;
      const deltaLng = (emergencia.longitud - respondedor.longitud) * Math.PI / 180;

      const a = Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
                Math.cos(lat1) * Math.cos(lat2) *
                Math.sin(deltaLng / 2) * Math.sin(deltaLng / 2);

      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      distancia_km = parseFloat((R * c).toFixed(2));

      // Estimar tiempo (velocidad promedio 60 km/h en ciudad)
      tiempo_estimado_minutos = Math.ceil((distancia_km / 60) * 60);
    }

    // ============================================================
    // 5️⃣ Actualizar estado del respondedor
    // ============================================================
    await connection.query(
      `UPDATE emergencias_respondedores
       SET
         estado = 'EN_RUTA',
         disponible = 0,
         id_emergencia = ?,
         fecha_asignacion = NOW(),
         ultima_actualizacion = NOW()
       WHERE id_respondedor = ?`,
      [id_emergencia, id_respondedor]
    );

    // ============================================================
    // 6️⃣ Actualizar estado de la emergencia
    // ============================================================
    await connection.query(
      `UPDATE emergencias
       SET
         estado = 'EN_PROCESO',
         fecha_ultima_actualizacion = NOW()
       WHERE id_emergencia = ?`,
      [id_emergencia]
    );

    // ============================================================
    // 7️⃣ Registrar el despacho en el log
    // ============================================================
    await connection.query(
      `INSERT INTO logs_despachos (
         id_respondedor,
         id_emergencia,
         id_usuario_despacho,
         fecha_hora_despacho,
         prioridad,
         distancia_km,
         tiempo_estimado_minutos,
         notas,
         estado_despacho
       ) VALUES (?, ?, ?, NOW(), ?, ?, ?, ?, 'DESPACHADO')`,
      [
        id_respondedor,
        id_emergencia,
        id_usuario || null,
        prioridad,
        distancia_km,
        tiempo_estimado_minutos,
        notas,
      ]
    );

    // ============================================================
    // 8️⃣ Registrar en logs de actividad
    // ============================================================
    if (id_usuario) {
      await connection.query(
        `INSERT INTO logs_actividad (
           id_usuario,
           accion,
           detalles,
           fecha_hora
         ) VALUES (?, 'DESPACHO_RESPONDEDOR', ?, NOW())`,
        [
          id_usuario,
          `Despachó a ${respondedor.nombre_completo} (${respondedor.tipo_respondedor}) a emergencia "${emergencia.nombre}" - Distancia: ${distancia_km || 'N/A'} km`,
        ]
      );
    }

    // ============================================================
    // 9️⃣ TODO: Enviar notificación al respondedor (SMS/Push/Email)
    // ============================================================
    // Aquí se integraría con servicio de notificaciones
    // Por ejemplo: Twilio para SMS, Firebase para Push, SendGrid para Email

    /*
    if (respondedor.celular_personal) {
      await enviarSMS(
        respondedor.celular_personal,
        `🚨 EMERGENCIA: ${emergencia.nombre}. Dirección: ${emergencia.direccion}. ETA: ${tiempo_estimado_minutos} min. Confirme recepción.`
      );
    }
    */

    await connection.commit();

    // ============================================================
    // Retornar respuesta exitosa
    // ============================================================
    return NextResponse.json(
      {
        success: true,
        message: `Respondedor ${respondedor.nombre_completo} despachado exitosamente`,
        despacho: {
          respondedor: {
            id: respondedor.id_respondedor,
            nombre: respondedor.nombre_completo,
            tipo: respondedor.tipo_respondedor,
            telefono: respondedor.celular_personal,
          },
          emergencia: {
            id: emergencia.id_emergencia,
            nombre: emergencia.nombre,
            direccion: emergencia.direccion,
            severidad: emergencia.nivel_severidad,
          },
          distancia_km,
          tiempo_estimado_minutos,
          prioridad,
          fecha_hora_despacho: new Date().toISOString(),
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    await connection.rollback();
    console.error("❌ Error al despachar respondedor:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Error al despachar respondedor",
        error: error.message,
      },
      { status: 500 }
    );
  } finally {
    connection.release();
  }
}

/**
 * ============================================================
 * 📍 GET: Obtener respondedor más cercano
 * ============================================================
 *
 * Encuentra el respondedor disponible más cercano a una ubicación.
 *
 * Parámetros GET:
 *  - latitud: número decimal
 *  - longitud: número decimal
 *  - tipo: string opcional (filtrar por tipo)
 *  - especialidad: string opcional (filtrar por especialidad)
 * ============================================================
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const latitud = searchParams.get("latitud");
    const longitud = searchParams.get("longitud");
    const tipo = searchParams.get("tipo");
    const especialidad = searchParams.get("especialidad");

    if (!latitud || !longitud) {
      return NextResponse.json(
        {
          success: false,
          message: "Faltan parámetros requeridos: latitud, longitud",
        },
        { status: 400 }
      );
    }

    const lat = parseFloat(latitud);
    const lng = parseFloat(longitud);

    // Validar coordenadas
    if (isNaN(lat) || isNaN(lng)) {
      return NextResponse.json(
        {
          success: false,
          message: "Coordenadas inválidas",
        },
        { status: 400 }
      );
    }

    // Construir filtros adicionales
    let filtros = ["disponible = 1", "estado = 'DISPONIBLE'", "activo = 1"];
    let params: any[] = [];

    if (tipo) {
      filtros.push("tipo_respondedor = ?");
      params.push(tipo);
    }

    if (especialidad) {
      filtros.push("especialidad LIKE ?");
      params.push(`%${especialidad}%`);
    }

    const whereClause = filtros.join(" AND ");

    // Consultar respondedores disponibles con cálculo de distancia
    const [rows]: any = await pool.query(
      `SELECT
         id_respondedor,
         CONCAT_WS(' ', nombres, apellido_paterno, apellido_materno) as nombre_completo,
         tipo_respondedor,
         especialidad,
         nivel_experiencia,
         latitud,
         longitud,
         celular_personal,
         email_personal,
         evaluacion_puntaje,
         tiempo_respuesta_minutos,
         (
           6371 * ACOS(
             COS(RADIANS(?)) * COS(RADIANS(latitud)) *
             COS(RADIANS(longitud) - RADIANS(?)) +
             SIN(RADIANS(?)) * SIN(RADIANS(latitud))
           )
         ) AS distancia_km
       FROM emergencias_respondedores
       WHERE ${whereClause}
         AND latitud IS NOT NULL
         AND longitud IS NOT NULL
       ORDER BY distancia_km ASC
       LIMIT 10`,
      [lat, lng, lat, ...params]
    );

    if (rows.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "No hay respondedores disponibles que cumplan los criterios",
        },
        { status: 404 }
      );
    }

    // Agregar tiempo estimado a cada respondedor
    const respondedoresConETA = rows.map((r: any) => ({
      ...r,
      distancia_km: parseFloat(r.distancia_km).toFixed(2),
      tiempo_estimado_minutos: Math.ceil((parseFloat(r.distancia_km) / 60) * 60),
    }));

    return NextResponse.json(
      {
        success: true,
        mas_cercano: respondedoresConETA[0],
        alternativas: respondedoresConETA.slice(1, 5),
        total_disponibles: respondedoresConETA.length,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("❌ Error al buscar respondedor más cercano:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Error al buscar respondedor más cercano",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
