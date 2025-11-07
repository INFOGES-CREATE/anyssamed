// frontend/src/app/api/admin/centros/route.ts
import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { RowDataPacket, ResultSetHeader } from "mysql2";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const estado = searchParams.get("estado");
    const busqueda = searchParams.get("busqueda");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = (page - 1) * limit;

    console.log("🔍 GET /api/admin/centros - Parámetros:", { estado, busqueda, page, limit });

    let whereConditions: string[] = [];
    let queryParams: any[] = [];

    if (estado && estado !== "todos") {
      whereConditions.push("cm.estado = ?");
      queryParams.push(estado);
    }

    if (busqueda && busqueda.trim() !== "") {
      whereConditions.push(
        "(cm.nombre LIKE ? OR cm.rut LIKE ? OR cm.ciudad LIKE ? OR cm.region LIKE ? OR cm.razon_social LIKE ?)"
      );
      const searchTerm = `%${busqueda.trim()}%`;
      queryParams.push(searchTerm, searchTerm, searchTerm, searchTerm, searchTerm);
    }

    const whereClause = whereConditions.length > 0 
      ? `WHERE ${whereConditions.join(" AND ")}` 
      : "";

    const [centros] = await pool.query<RowDataPacket[]>(
      `SELECT 
        cm.id_centro,
        cm.nombre,
        cm.razon_social,
        cm.rut,
        cm.direccion,
        cm.ciudad,
        cm.region,
        cm.codigo_postal,
        cm.telefono_principal as telefono,
        cm.email_contacto as email,
        cm.sitio_web,
        cm.logo_url,
        cm.descripcion,
        cm.horario_apertura,
        cm.horario_cierre,
        cm.dias_atencion,
        cm.estado,
        cm.fecha_inicio_operacion,
        cm.capacidad_pacientes_dia,
        cm.nivel_complejidad,
        cm.especializacion_principal,
        cm.fecha_creacion,
        cm.fecha_modificacion as fecha_actualizacion,
        
        COUNT(DISTINCT u.id_usuario) as usuarios_count,
        COUNT(DISTINCT CASE WHEN u.estado = 'activo' THEN u.id_usuario END) as usuarios_activos,
        COUNT(DISTINCT m.id_medico) as medicos_count,
        COUNT(DISTINCT CASE WHEN m.estado = 'activo' THEN m.id_medico END) as medicos_activos,
        COUNT(DISTINCT p.id_paciente) as pacientes_count,
        COUNT(DISTINCT CASE WHEN p.estado = 'activo' THEN p.id_paciente END) as pacientes_activos,
        COUNT(DISTINCT s.id_sucursal) as sucursales_count,
        COUNT(DISTINCT CASE 
          WHEN MONTH(hc.fecha_atencion) = MONTH(CURDATE()) 
          AND YEAR(hc.fecha_atencion) = YEAR(CURDATE()) 
          THEN hc.id_historial 
        END) as consultas_mes,
        COUNT(DISTINCT CASE 
          WHEN YEAR(hc.fecha_atencion) = YEAR(CURDATE()) 
          THEN hc.id_historial 
        END) as consultas_ano,
        
        CASE 
          WHEN cm.capacidad_pacientes_dia > 100 THEN 'enterprise'
          WHEN cm.capacidad_pacientes_dia > 50 THEN 'profesional'
          ELSE 'basico'
        END as plan,
        
        4.5 as satisfaccion,
        'Hace 2 horas' as ultima_actividad
        
      FROM centros_medicos cm
      LEFT JOIN usuarios u ON u.id_centro_principal = cm.id_centro
      LEFT JOIN medicos m ON m.id_centro_principal = cm.id_centro
      LEFT JOIN pacientes p ON p.id_centro_registro = cm.id_centro
      LEFT JOIN sucursales s ON s.id_centro = cm.id_centro
      LEFT JOIN historial_clinico hc ON hc.id_centro = cm.id_centro
      ${whereClause}
      GROUP BY cm.id_centro
      ORDER BY cm.fecha_creacion DESC
      LIMIT ? OFFSET ?`,
      [...queryParams, limit, offset]
    );

    const [countResult] = await pool.query<RowDataPacket[]>(
      `SELECT COUNT(DISTINCT cm.id_centro) as total
       FROM centros_medicos cm
       ${whereClause}`,
      queryParams
    );

    const total = countResult[0]?.total || 0;
    const totalPages = Math.ceil(total / limit);

    const [estadisticas] = await pool.query<RowDataPacket[]>(`
      SELECT 
        COUNT(*) as total_centros,
        SUM(CASE WHEN estado = 'activo' THEN 1 ELSE 0 END) as centros_activos,
        SUM(CASE WHEN estado = 'inactivo' THEN 1 ELSE 0 END) as centros_inactivos,
        SUM(CASE WHEN estado = 'suspendido' THEN 1 ELSE 0 END) as centros_suspendidos,
        AVG(capacidad_pacientes_dia) as capacidad_promedio,
        SUM(capacidad_pacientes_dia) as capacidad_total,
        COUNT(CASE WHEN nivel_complejidad = 'alta' THEN 1 END) as centros_alta_complejidad,
        COUNT(CASE WHEN nivel_complejidad = 'media' THEN 1 END) as centros_media_complejidad,
        COUNT(CASE WHEN nivel_complejidad = 'baja' THEN 1 END) as centros_baja_complejidad
      FROM centros_medicos
    `);

    const [distribucionRegion] = await pool.query<RowDataPacket[]>(`
      SELECT 
        region,
        COUNT(*) as cantidad,
        COUNT(CASE WHEN estado = 'activo' THEN 1 END) as activos
      FROM centros_medicos
      GROUP BY region
      ORDER BY cantidad DESC
      LIMIT 10
    `);

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
      razon_social,
      rut,
      direccion,
      ciudad,
      region,
      codigo_postal,
      telefono,
      email,
      sitio_web,
      logo_url,
      descripcion,
      horario_apertura,
      horario_cierre,
      dias_atencion,
      estado,
      fecha_inicio_operacion,
      capacidad_pacientes_dia,
      nivel_complejidad,
      especializacion_principal,
    } = body;

    if (!nombre || !razon_social || !rut || !direccion || !ciudad || !region || !telefono || !email) {
      return NextResponse.json(
        { 
          success: false, 
          error: "Faltan campos obligatorios",
          campos_requeridos: ["nombre", "razon_social", "rut", "direccion", "ciudad", "region", "telefono", "email"]
        },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, error: "Formato de email inválido" },
        { status: 400 }
      );
    }

    if (!rut || rut.length < 8) {
      return NextResponse.json(
        { success: false, error: "Formato de RUT inválido" },
        { status: 400 }
      );
    }

    const connection = await pool.getConnection();

    try {
      await connection.beginTransaction();

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
            centro_existente: existingRut[0].nombre
          },
          { status: 400 }
        );
      }

      const [result] = await connection.query<ResultSetHeader>(
        `INSERT INTO centros_medicos (
          nombre, razon_social, rut, direccion, ciudad, region, codigo_postal,
          telefono_principal, email_contacto, sitio_web, logo_url, descripcion,
          horario_apertura, horario_cierre, dias_atencion, estado,
          fecha_inicio_operacion, capacidad_pacientes_dia, nivel_complejidad,
          especializacion_principal
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          nombre,
          razon_social || nombre,
          rut,
          direccion,
          ciudad,
          region,
          codigo_postal || null,
          telefono,
          email,
          sitio_web || null,
          logo_url || null,
          descripcion || null,
          horario_apertura || "08:00:00",
          horario_cierre || "20:00:00",
          dias_atencion || "Lunes a Viernes",
          estado || "activo",
          fecha_inicio_operacion || new Date(),
          capacidad_pacientes_dia || 50,
          nivel_complejidad || "media",
          especializacion_principal || null,
        ]
      );

      const [newCentro] = await connection.query<RowDataPacket[]>(
        `SELECT 
          cm.*,
          cm.telefono_principal as telefono,
          cm.email_contacto as email,
          cm.fecha_modificacion as fecha_actualizacion,
          0 as usuarios_count,
          0 as usuarios_activos,
          0 as medicos_count,
          0 as medicos_activos,
          0 as pacientes_count,
          0 as pacientes_activos,
          0 as sucursales_count,
          0 as consultas_mes,
          0 as consultas_ano,
          CASE 
            WHEN cm.capacidad_pacientes_dia > 100 THEN 'enterprise'
            WHEN cm.capacidad_pacientes_dia > 50 THEN 'profesional'
            ELSE 'basico'
          END as plan,
          0 as satisfaccion,
          'Recién creado' as ultima_actividad
        FROM centros_medicos cm
        WHERE cm.id_centro = ?`,
        [result.insertId]
      );

      await connection.commit();

      console.log("✅ Centro creado exitosamente:", newCentro[0].nombre);

      return NextResponse.json({
        success: true,
        data: newCentro[0],
        message: "Centro médico creado exitosamente",
        id_centro: result.insertId,
      }, { status: 201 });

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
