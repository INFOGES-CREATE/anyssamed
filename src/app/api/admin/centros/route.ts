//src\app\api\admin\centros\route.ts
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { RowDataPacket, ResultSetHeader } from "mysql2";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const estado = searchParams.get("estado");
    const busqueda = searchParams.get("busqueda");
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "50", 10);
    const offset = (page - 1) * limit;

    console.log("🔍 GET /api/admin/centros - Parámetros:", {
      estado,
      busqueda,
      page,
      limit,
    });

    const whereConditions: string[] = [];
    const queryParams: any[] = [];

    if (estado && estado !== "todos") {
      whereConditions.push("cm.estado = ?");
      queryParams.push(estado);
    }

    if (busqueda && busqueda.trim() !== "") {
      const searchTerm = `%${busqueda.trim()}%`;
      whereConditions.push(
        `(cm.nombre LIKE ? 
          OR cm.razon_social LIKE ?
          OR cm.rut LIKE ?
          OR cm.ciudad LIKE ?
          OR cm.region LIKE ?
          OR cm.descripcion LIKE ?)`
      );
      queryParams.push(
        searchTerm,
        searchTerm,
        searchTerm,
        searchTerm,
        searchTerm,
        searchTerm
      );
    }

    const whereClause =
      whereConditions.length > 0
        ? `WHERE ${whereConditions.join(" AND ")}`
        : "";

    // SOLO CAMPOS DE LA TABLA centros_medicos
    const [centros] = await pool.query<RowDataPacket[]>(
      `
      SELECT
        cm.id_centro,
        cm.nombre,
        cm.pais,
        cm.razon_social,
        cm.rut,
        cm.direccion,
        cm.ciudad,
        cm.region,
        cm.comuna,
        cm.codigo_postal,
        cm.telefono_principal,
        cm.telefono_secundario,
        cm.email_contacto,
        cm.email_secundario,
        cm.sitio_web,
        cm.logo_url,
        cm.descripcion,
        cm.horario_apertura,
        cm.horario_cierre,
        cm.dias_atencion,
        cm.plan,
        cm.estado,
        cm.fecha_inicio_operacion,
        cm.capacidad_pacientes_dia,
        cm.nivel_complejidad,
        cm.especializacion_principal,
        cm.tipo_establecimiento,
        cm.fecha_creacion,
        cm.fecha_modificacion,
        cm.created_by,
        cm.id_pais,
        cm.id_region,
        cm.id_comuna
      FROM centros_medicos cm
      ${whereClause}
      ORDER BY cm.fecha_creacion DESC
      LIMIT ? OFFSET ?
      `,
      [...queryParams, limit, offset]
    );

    const [countResult] = await pool.query<RowDataPacket[]>(
      `
      SELECT COUNT(DISTINCT cm.id_centro) AS total
      FROM centros_medicos cm
      ${whereClause}
      `,
      queryParams
    );

    const total = countResult[0]?.total || 0;
    const totalPages = Math.ceil(total / limit);

    // Estadísticas generales (solo usando campos de centros_medicos)
    const [estadisticas] = await pool.query<RowDataPacket[]>(
      `
      SELECT 
        COUNT(*) AS total_centros,
        SUM(CASE WHEN estado = 'activo' THEN 1 ELSE 0 END) AS centros_activos,
        SUM(CASE WHEN estado = 'inactivo' THEN 1 ELSE 0 END) AS centros_inactivos,
        SUM(CASE WHEN estado = 'suspendido' THEN 1 ELSE 0 END) AS centros_suspendidos,
        AVG(capacidad_pacientes_dia) AS capacidad_promedio,
        SUM(capacidad_pacientes_dia) AS capacidad_total,
        COUNT(CASE WHEN nivel_complejidad = 'alta' THEN 1 END) AS centros_alta_complejidad,
        COUNT(CASE WHEN nivel_complejidad = 'media' THEN 1 END) AS centros_media_complejidad,
        COUNT(CASE WHEN nivel_complejidad = 'baja' THEN 1 END) AS centros_baja_complejidad
      FROM centros_medicos
      `
    );

    const [distribucionRegion] = await pool.query<RowDataPacket[]>(
      `
      SELECT 
        region,
        COUNT(*) AS cantidad,
        COUNT(CASE WHEN estado = 'activo' THEN 1 END) AS activos
      FROM centros_medicos
      GROUP BY region
      ORDER BY cantidad DESC
      LIMIT 10
      `
    );

    console.log("✅ Centros encontrados:", centros.length);

    return NextResponse.json({
      success: true,
      data: centros,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasMore: page < totalPages,
      },
      estadisticas: estadisticas[0] || {},
      distribucion_region: distribucionRegion,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("❌ Error en GET /api/admin/centros:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Error al obtener centros médicos",
        details: error.message,
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    console.log("📝 POST /api/admin/centros - Creando centro:", body.nombre);

    const {
      nombre,
      pais,
      razon_social,
      rut,
      direccion,
      ciudad,
      region,
      comuna,
      codigo_postal,
      telefono, // lo usamos como telefono_principal
      telefono_secundario,
      email, // lo usamos como email_contacto
      email_secundario,
      sitio_web,
      logo_url,
      descripcion,
      horario_apertura,
      horario_cierre,
      dias_atencion,
      plan,
      estado,
      fecha_inicio_operacion,
      capacidad_pacientes_dia,
      nivel_complejidad,
      especializacion_principal,
      tipo_establecimiento,
      created_by,
      id_pais,
      id_region,
      id_comuna,
    } = body;

    // ✅ Campos obligatorios según la tabla
    if (
      !nombre ||
      !razon_social ||
      !rut ||
      !direccion ||
      !ciudad ||
      !region ||
      !telefono ||
      !email ||
      !horario_apertura ||
      !horario_cierre ||
      !created_by
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Faltan campos obligatorios",
          campos_requeridos: [
            "nombre",
            "razon_social",
            "rut",
            "direccion",
            "ciudad",
            "region",
            "telefono",
            "email",
            "horario_apertura",
            "horario_cierre",
            "created_by",
          ],
        },
        { status: 400 }
      );
    }

    // ✅ Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, error: "Formato de email inválido" },
        { status: 400 }
      );
    }

    // ✅ Validar RUT
    if (!rut || rut.length < 8) {
      return NextResponse.json(
        { success: false, error: "Formato de RUT inválido" },
        { status: 400 }
      );
    }

    const connection = await pool.getConnection();

    try {
      await connection.beginTransaction();

      // ✅ Validar RUT único
      const [existingRut] = await connection.query<RowDataPacket[]>(
        "SELECT id_centro, nombre FROM centros_medicos WHERE rut = ?",
        [rut]
      );

      if (existingRut.length > 0) {
        await connection.rollback();
        return NextResponse.json(
          {
            success: false,
            error: "El RUT ya está registrado",
            centro_existente: existingRut[0].nombre,
          },
          { status: 400 }
        );
      }

      // ✅ INSERT CON EXACTAMENTE 30 PLACEHOLDERS (CORREGIDO)
      const [result] = await connection.query<ResultSetHeader>(
        `
        INSERT INTO centros_medicos (
          nombre,
          pais,
          razon_social,
          rut,
          direccion,
          ciudad,
          region,
          comuna,
          codigo_postal,
          telefono_principal,
          telefono_secundario,
          email_contacto,
          email_secundario,
          sitio_web,
          logo_url,
          descripcion,
          horario_apertura,
          horario_cierre,
          dias_atencion,
          plan,
          estado,
          fecha_inicio_operacion,
          capacidad_pacientes_dia,
          nivel_complejidad,
          especializacion_principal,
          tipo_establecimiento,
          created_by,
          id_pais,
          id_region,
          id_comuna
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
        [
          nombre,                              // 1
          pais || null,                         // 2
          razon_social,                         // 3
          rut,                                  // 4
          direccion,                            // 5
          ciudad,                               // 6
          region,                               // 7
          comuna || null,                       // 8
          codigo_postal || null,                // 9
          telefono,                             // 10
          telefono_secundario || null,          // 11
          email,                                // 12
          email_secundario || null,             // 13
          sitio_web || null,                    // 14
          logo_url || null,                     // 15
          descripcion || null,                  // 16
          horario_apertura,                     // 17
          horario_cierre,                       // 18
          dias_atencion || "Lunes-Viernes",     // 19
          plan || "basico",                     // 20
          estado || "activo",                   // 21
          fecha_inicio_operacion || new Date().toISOString().split('T')[0], // 22
          capacidad_pacientes_dia || 50,        // 23
          nivel_complejidad || "media",         // 24
          especializacion_principal || null,    // 25
          tipo_establecimiento || "clinica",    // 26
          created_by,                           // 27
          id_pais || null,                      // 28
          id_region || null,                    // 29
          id_comuna || null,                    // 30
        ]
      );

      // ✅ Devolver el registro recién creado
      const [newCentro] = await connection.query<RowDataPacket[]>(
        `
        SELECT
          cm.id_centro,
          cm.nombre,
          cm.pais,
          cm.razon_social,
          cm.rut,
          cm.direccion,
          cm.ciudad,
          cm.region,
          cm.comuna,
          cm.codigo_postal,
          cm.telefono_principal,
          cm.telefono_secundario,
          cm.email_contacto,
          cm.email_secundario,
          cm.sitio_web,
          cm.logo_url,
          cm.descripcion,
          cm.horario_apertura,
          cm.horario_cierre,
          cm.dias_atencion,
          cm.plan,
          cm.estado,
          cm.fecha_inicio_operacion,
          cm.capacidad_pacientes_dia,
          cm.nivel_complejidad,
          cm.especializacion_principal,
          cm.tipo_establecimiento,
          cm.fecha_creacion,
          cm.fecha_modificacion,
          cm.created_by,
          cm.id_pais,
          cm.id_region,
          cm.id_comuna
        FROM centros_medicos cm
        WHERE cm.id_centro = ?
        `,
        [result.insertId]
      );

      await connection.commit();

      console.log("✅ Centro creado exitosamente:", newCentro[0]?.nombre);

      return NextResponse.json(
        {
          success: true,
          data: newCentro[0],
          message: "Centro médico creado exitosamente",
          id_centro: result.insertId,
        },
        { status: 201 }
      );
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error: any) {
    console.error("❌ Error en POST /api/admin/centros:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Error al crear centro médico",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
