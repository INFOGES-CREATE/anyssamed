// frontend/src/app/api/admin/centros/[id]/micrositio/config/route.ts
import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { RowDataPacket, ResultSetHeader } from "mysql2";

// GET - Obtener configuración actual del micrositio
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    console.log(`📡 Obteniendo configuración del micrositio del centro ID: ${params.id}`);

    // Obtener datos básicos del centro
    const [centroRows] = await pool.query<RowDataPacket[]>(`
      SELECT 
        nombre,
        descripcion,
        logo_url,
        sitio_web
      FROM centros_medicos
      WHERE id_centro = ?
    `, [params.id]);

    if (!centroRows || centroRows.length === 0) {
      return NextResponse.json(
        { success: false, error: "Centro no encontrado" },
        { status: 404 }
      );
    }

    const centro = centroRows[0];

    // Intentar obtener configuración personalizada
    let configuracion: any = {};
    try {
      const [configRows] = await pool.query<RowDataPacket[]>(`
        SELECT clave, valor, tipo_dato
        FROM configuraciones_centro
        WHERE id_centro = ? AND grupo = 'micrositio'
      `, [params.id]);

      // Convertir array de configuraciones a objeto
      configRows.forEach((row: any) => {
        let valor = row.valor;
        
        // Parsear según tipo de dato
        switch (row.tipo_dato) {
          case 'boolean':
            valor = valor === '1' || valor === 'true';
            break;
          case 'integer':
            valor = parseInt(valor);
            break;
          case 'float':
            valor = parseFloat(valor);
            break;
          case 'json':
            try {
              valor = JSON.parse(valor);
            } catch {
              valor = {};
            }
            break;
        }
        
        configuracion[row.clave] = valor;
      });
    } catch (err) {
      console.warn("⚠️ No se pudo cargar configuración personalizada");
    }

    // Configuración por defecto si no existe
    const configCompleta = {
      nombre: centro.nombre,
      descripcion: centro.descripcion || "",
      logo_url: centro.logo_url || "",
      banner_url: configuracion.banner_url || "",
      colores_tema: configuracion.colores_tema || {
        primario: "#4F46E5",
        secundario: "#7C3AED",
        acento: "#EC4899",
      },
      mostrar_servicios: configuracion.mostrar_servicios !== undefined ? configuracion.mostrar_servicios : true,
      mostrar_profesionales: configuracion.mostrar_profesionales !== undefined ? configuracion.mostrar_profesionales : true,
      mostrar_promociones: configuracion.mostrar_promociones !== undefined ? configuracion.mostrar_promociones : true,
      mostrar_resenas: configuracion.mostrar_resenas !== undefined ? configuracion.mostrar_resenas : true,
      mostrar_galeria: configuracion.mostrar_galeria !== undefined ? configuracion.mostrar_galeria : true,
      mostrar_blog: configuracion.mostrar_blog !== undefined ? configuracion.mostrar_blog : false,
      facebook_url: configuracion.facebook_url || "",
      instagram_url: configuracion.instagram_url || "",
      twitter_url: configuracion.twitter_url || "",
      linkedin_url: configuracion.linkedin_url || "",
      youtube_url: configuracion.youtube_url || "",
      meta_titulo: configuracion.meta_titulo || `${centro.nombre} - Centro Médico`,
      meta_descripcion: configuracion.meta_descripcion || centro.descripcion || "",
      meta_keywords: configuracion.meta_keywords || "",
      analytics_id: configuracion.analytics_id || "",
      chat_widget_enabled: configuracion.chat_widget_enabled || false,
      booking_widget_enabled: configuracion.booking_widget_enabled !== undefined ? configuracion.booking_widget_enabled : true,
    };

    return NextResponse.json({
      success: true,
      data: configCompleta,
    });
  } catch (error: any) {
    console.error(`❌ Error en GET /api/admin/centros/${params.id}/micrositio/config:`, error);
    return NextResponse.json(
      {
        success: false,
        error: "Error al obtener configuración",
        details: error.message,
      },
      { status: 500 }
    );
  }
}

// PUT - Actualizar configuración del micrositio
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    console.log(`📝 Actualizando configuración del micrositio del centro ID: ${params.id}`);

    const body = await request.json();

    // Iniciar transacción
    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      // Actualizar datos básicos en centros_medicos
      await connection.query(`
        UPDATE centros_medicos
        SET 
          nombre = ?,
          descripcion = ?,
          logo_url = ?
        WHERE id_centro = ?
      `, [body.nombre, body.descripcion, body.logo_url, params.id]);

      // Actualizar o insertar cada configuración
      const configuraciones = [
        { clave: 'banner_url', valor: body.banner_url, tipo: 'string' },
        { clave: 'colores_tema', valor: JSON.stringify(body.colores_tema), tipo: 'json' },
        { clave: 'mostrar_servicios', valor: body.mostrar_servicios ? '1' : '0', tipo: 'boolean' },
        { clave: 'mostrar_profesionales', valor: body.mostrar_profesionales ? '1' : '0', tipo: 'boolean' },
        { clave: 'mostrar_promociones', valor: body.mostrar_promociones ? '1' : '0', tipo: 'boolean' },
        { clave: 'mostrar_resenas', valor: body.mostrar_resenas ? '1' : '0', tipo: 'boolean' },
        { clave: 'mostrar_galeria', valor: body.mostrar_galeria ? '1' : '0', tipo: 'boolean' },
        { clave: 'mostrar_blog', valor: body.mostrar_blog ? '1' : '0', tipo: 'boolean' },
        { clave: 'facebook_url', valor: body.facebook_url, tipo: 'string' },
        { clave: 'instagram_url', valor: body.instagram_url, tipo: 'string' },
        { clave: 'twitter_url', valor: body.twitter_url, tipo: 'string' },
        { clave: 'linkedin_url', valor: body.linkedin_url, tipo: 'string' },
        { clave: 'youtube_url', valor: body.youtube_url, tipo: 'string' },
        { clave: 'meta_titulo', valor: body.meta_titulo, tipo: 'string' },
        { clave: 'meta_descripcion', valor: body.meta_descripcion, tipo: 'string' },
        { clave: 'meta_keywords', valor: body.meta_keywords, tipo: 'string' },
        { clave: 'analytics_id', valor: body.analytics_id, tipo: 'string' },
        { clave: 'chat_widget_enabled', valor: body.chat_widget_enabled ? '1' : '0', tipo: 'boolean' },
        { clave: 'booking_widget_enabled', valor: body.booking_widget_enabled ? '1' : '0', tipo: 'boolean' },
      ];

      for (const config of configuraciones) {
        await connection.query(`
          INSERT INTO configuraciones_centro 
            (id_centro, clave, valor, tipo_dato, grupo, modificable_por_centro)
          VALUES (?, ?, ?, ?, 'micrositio', 1)
          ON DUPLICATE KEY UPDATE
            valor = VALUES(valor),
            tipo_dato = VALUES(tipo_dato)
        `, [params.id, config.clave, config.valor, config.tipo]);
      }

      await connection.commit();
      connection.release();

      return NextResponse.json({
        success: true,
        message: "Configuración actualizada exitosamente",
      });
    } catch (error) {
      await connection.rollback();
      connection.release();
      throw error;
    }
  } catch (error: any) {
    console.error(`❌ Error en PUT /api/admin/centros/${params.id}/micrositio/config:`, error);
    return NextResponse.json(
      {
        success: false,
        error: "Error al actualizar configuración",
        details: error.message,
      },
      { status: 500 }
    );
  }
}