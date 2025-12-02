// frontend/src/app/api/admin/paises/route.ts
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { RowDataPacket, ResultSetHeader } from "mysql2";
import { registrarLog } from "@/lib/logs";

// ============================================================================
// GET - LISTAR PAISES
// ============================================================================
export async function GET(request: NextRequest) {
  let connection;

  try {
    const { searchParams } = new URL(request.url);

    // Parámetros
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "50")));
    const offset = (page - 1) * limit;
    const activos_solo = searchParams.get("activos_solo") === "true";
    const busqueda = searchParams.get("busqueda") || "";
    const ordenar = searchParams.get("ordenar") || "prioridad_asc";

    connection = await pool.getConnection();

    // Construir WHERE
    const whereConditions: string[] = [];
    const queryParams: any[] = [];

    if (activos_solo) {
      whereConditions.push("p.activo = 1");
    }

    if (busqueda) {
      whereConditions.push(
        "(p.nombre LIKE ? OR p.codigo_iso2 LIKE ? OR p.codigo_iso3 LIKE ? OR p.capital LIKE ?)"
      );
      const searchTerm = `%${busqueda}%`;
      queryParams.push(searchTerm, searchTerm, searchTerm, searchTerm);
    }

    const whereClause = whereConditions.length > 0 ? "WHERE " + whereConditions.join(" AND ") : "";

    // Ordenamiento
    let orderBy = "p.prioridad ASC, p.nombre ASC";
    switch (ordenar) {
      case "nombre_asc":
        orderBy = "p.nombre ASC";
        break;
      case "nombre_desc":
        orderBy = "p.nombre DESC";
        break;
      case "prioridad_asc":
        orderBy = "p.prioridad ASC";
        break;
      case "prioridad_desc":
        orderBy = "p.prioridad DESC";
        break;
    }

    // Query principal
    const query = `
      SELECT 
        p.id_pais,
        p.nombre,
        p.codigo_iso2,
        p.codigo_iso3,
        p.phone_code,
        p.capital,
        p.continente,
        p.moneda,
        p.codigo_moneda,
        p.idioma_oficial,
        p.dominio_internet,
        p.bandera_url,
        p.prioridad,
        p.activo,
        p.fecha_creacion,
        p.fecha_modificacion,
        COUNT(DISTINCT r.id_region) as total_regiones,
        COUNT(DISTINCT c.id_comuna) as total_comunas,
        COUNT(DISTINCT cm.id_centro) as total_centros,
        COUNT(DISTINCT u.id_usuario) as total_usuarios
      FROM paises p
      LEFT JOIN regiones r ON p.id_pais = r.id_pais AND r.activo = 1
      LEFT JOIN comunas c ON r.id_region = c.id_region AND c.activo = 1
      LEFT JOIN centros_medicos cm ON p.id_pais = cm.id_pais AND cm.estado = 'activo'
      LEFT JOIN usuarios u ON cm.id_centro = u.id_centro_principal AND u.estado = 'activo'
      ${whereClause}
      GROUP BY p.id_pais
      ORDER BY ${orderBy}
      LIMIT ? OFFSET ?
    `;

    const [paises] = await connection.query<RowDataPacket[]>(
      query,
      [...queryParams, limit, offset]
    );

    // Contar total
    const countQuery = `
      SELECT COUNT(DISTINCT p.id_pais) as total
      FROM paises p
      LEFT JOIN regiones r ON p.id_pais = r.id_pais
      LEFT JOIN comunas c ON r.id_region = c.id_region
      ${whereClause}
    `;

    const [countResult] = await connection.query<RowDataPacket[]>(countQuery, queryParams);
    const total = countResult[0]?.total || 0;
    const totalPages = Math.ceil(total / limit);

    // Estadísticas
    const [stats] = await connection.query<RowDataPacket[]>(`
      SELECT 
        COUNT(DISTINCT p.id_pais) as total_paises,
        SUM(CASE WHEN p.activo = 1 THEN 1 ELSE 0 END) as paises_activos,
        SUM(CASE WHEN p.activo = 0 THEN 1 ELSE 0 END) as paises_inactivos,
        COUNT(DISTINCT r.id_region) as total_regiones,
        COUNT(DISTINCT c.id_comuna) as total_comunas,
        COUNT(DISTINCT cm.id_centro) as total_centros
      FROM paises p
      LEFT JOIN regiones r ON p.id_pais = r.id_pais
      LEFT JOIN comunas c ON r.id_region = c.id_region
      LEFT JOIN centros_medicos cm ON p.id_pais = cm.id_pais
      ${whereClause}
    `, queryParams);

    connection.release();

    return NextResponse.json({
      success: true,
      data: paises,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
      estadisticas: stats[0],
      filtros: { activos_solo, busqueda, ordenar },
    });
  } catch (error: any) {
    if (connection) connection.release();
    console.error("Error al listar países:", error);
    return NextResponse.json(
      { success: false, error: "Error al obtener países", detalles: error.message },
      { status: 500 }
    );
  }
}

// ============================================================================
// POST - CREAR PAIS
// ============================================================================
export async function POST(request: NextRequest) {
  let connection;

  try {
    const body = await request.json();
    const {
      nombre,
      codigo_iso2,
      codigo_iso3,
      phone_code,
      capital,
      continente,
      moneda,
      codigo_moneda,
      idioma_oficial,
      dominio_internet,
      bandera_url,
      prioridad = 100,
    } = body;

    // Validaciones
    if (!nombre || !codigo_iso2 || !codigo_iso3) {
      return NextResponse.json(
        { success: false, error: "Faltan campos obligatorios: nombre, codigo_iso2, codigo_iso3" },
        { status: 400 }
      );
    }

    // Validar códigos ISO
    if (codigo_iso2.length !== 2 || codigo_iso3.length !== 3) {
      return NextResponse.json(
        { success: false, error: "Códigos ISO inválidos (ISO2: 2 caracteres, ISO3: 3 caracteres)" },
        { status: 400 }
      );
    }

    connection = await pool.getConnection();
    await connection.beginTransaction();

    // Verificar si el país ya existe
    const [existePais] = await connection.query<RowDataPacket[]>(
      "SELECT id_pais FROM paises WHERE codigo_iso2 = ? OR codigo_iso3 = ?",
      [codigo_iso2, codigo_iso3]
    );

    if (existePais.length > 0) {
      await connection.rollback();
      connection.release();
      return NextResponse.json(
        { success: false, error: "El código ISO ya existe en el sistema" },
        { status: 400 }
      );
    }

    // Insertar país
    const [result] = await connection.query<ResultSetHeader>(
      `INSERT INTO paises (
        nombre, codigo_iso2, codigo_iso3, phone_code, capital, continente,
        moneda, codigo_moneda, idioma_oficial, dominio_internet, bandera_url,
        prioridad, activo, fecha_creacion
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, NOW())`,
      [
        nombre,
        codigo_iso2,
        codigo_iso3,
        phone_code || null,
        capital || null,
        continente || null,
        moneda || null,
        codigo_moneda || null,
        idioma_oficial || null,
        dominio_internet || null,
        bandera_url || null,
        prioridad,
      ]
    );

    const nuevoPaisId = result.insertId;

    // Obtener país creado
    const [nuevoPais] = await connection.query<RowDataPacket[]>(
      `SELECT * FROM paises WHERE id_pais = ?`,
      [nuevoPaisId]
    );

    // Registrar log
    await registrarLog({
      id_usuario: null,
      tipo: "audit",
      modulo: "paises",
      accion: "crear_pais",
      descripcion: `País creado: ${nombre} (${codigo_iso2})`,
      objeto_tipo: "pais",
      objeto_id: nuevoPaisId.toString(),
      datos_nuevos: body,
      ip_origen: request.headers.get("x-forwarded-for") || "unknown",
      agente_usuario: request.headers.get("user-agent") || "unknown",
      nivel_severidad: 5,
    });

    await connection.commit();
    connection.release();

    return NextResponse.json({
      success: true,
      message: "País creado exitosamente",
      data: nuevoPais[0],
    }, { status: 201 });
  } catch (error: any) {
    if (connection) {
      await connection.rollback();
      connection.release();
    }
    console.error("Error al crear país:", error);
    
    await registrarLog({
      tipo: "error",
      modulo: "paises",
      accion: "crear_pais",
      descripcion: "Error al crear país",
      mensaje_error: error.message,
      exitoso: false,
      nivel_severidad: 8,
    });

    return NextResponse.json(
      { success: false, error: "Error al crear país", detalles: error.message },
      { status: 500 }
    );
  }
}

// ============================================================================
// PUT - ACTUALIZAR PAIS
// ============================================================================
export async function PUT(request: NextRequest) {
  let connection;

  try {
    const { searchParams } = new URL(request.url);
    const id_pais = searchParams.get("id_pais");
    const body = await request.json();

    if (!id_pais) {
      return NextResponse.json(
        { success: false, error: "id_pais es requerido" },
        { status: 400 }
      );
    }

    connection = await pool.getConnection();
    await connection.beginTransaction();

    // Obtener país anterior
    const [paisAnterior] = await connection.query<RowDataPacket[]>(
      "SELECT * FROM paises WHERE id_pais = ?",
      [id_pais]
    );

    if (paisAnterior.length === 0) {
      await connection.rollback();
      connection.release();
      return NextResponse.json(
        { success: false, error: "País no encontrado" },
        { status: 404 }
      );
    }

    // Actualizar país
    await connection.query(
      `UPDATE paises SET 
        nombre = ?, codigo_iso2 = ?, codigo_iso3 = ?, phone_code = ?,
        capital = ?, continente = ?, moneda = ?, codigo_moneda = ?,
        idioma_oficial = ?, dominio_internet = ?, bandera_url = ?,
        prioridad = ?, activo = ?, fecha_modificacion = NOW()
      WHERE id_pais = ?`,
      [
        body.nombre || paisAnterior[0].nombre,
        body.codigo_iso2 || paisAnterior[0].codigo_iso2,
        body.codigo_iso3 || paisAnterior[0].codigo_iso3,
        body.phone_code || paisAnterior[0].phone_code,
        body.capital || paisAnterior[0].capital,
        body.continente || paisAnterior[0].continente,
        body.moneda || paisAnterior[0].moneda,
        body.codigo_moneda || paisAnterior[0].codigo_moneda,
        body.idioma_oficial || paisAnterior[0].idioma_oficial,
        body.dominio_internet || paisAnterior[0].dominio_internet,
        body.bandera_url || paisAnterior[0].bandera_url,
        body.prioridad !== undefined ? body.prioridad : paisAnterior[0].prioridad,
        body.activo !== undefined ? body.activo : paisAnterior[0].activo,
        id_pais,
      ]
    );

    // Obtener país actualizado
    const [paisActualizado] = await connection.query<RowDataPacket[]>(
      "SELECT * FROM paises WHERE id_pais = ?",
      [id_pais]
    );

    // Registrar log
    await registrarLog({
      id_usuario: null,
      tipo: "audit",
      modulo: "paises",
      accion: "actualizar_pais",
      descripcion: `País actualizado: ${body.nombre || paisAnterior[0].nombre}`,
      objeto_tipo: "pais",
      objeto_id: id_pais,
      datos_antiguos: paisAnterior[0],
      datos_nuevos: body,
      ip_origen: request.headers.get("x-forwarded-for") || "unknown",
      agente_usuario: request.headers.get("user-agent") || "unknown",
      nivel_severidad: 5,
    });

    await connection.commit();
    connection.release();

    return NextResponse.json({
      success: true,
      message: "País actualizado exitosamente",
      data: paisActualizado[0],
    });
  } catch (error: any) {
    if (connection) {
      await connection.rollback();
      connection.release();
    }
    console.error("Error al actualizar país:", error);
    
    await registrarLog({
      tipo: "error",
      modulo: "paises",
      accion: "actualizar_pais",
      descripcion: "Error al actualizar país",
      mensaje_error: error.message,
      exitoso: false,
      nivel_severidad: 8,
    });

    return NextResponse.json(
      { success: false, error: "Error al actualizar país", detalles: error.message },
      { status: 500 }
    );
  }
}

// ============================================================================
// DELETE - ELIMINAR PAIS
// ============================================================================
export async function DELETE(request: NextRequest) {
  let connection;

  try {
    const { searchParams } = new URL(request.url);
    const id_pais = searchParams.get("id_pais");

    if (!id_pais) {
      return NextResponse.json(
        { success: false, error: "id_pais es requerido" },
        { status: 400 }
      );
    }

    connection = await pool.getConnection();
    await connection.beginTransaction();

    // Obtener país
    const [pais] = await connection.query<RowDataPacket[]>(
      "SELECT * FROM paises WHERE id_pais = ?",
      [id_pais]
    );

    if (pais.length === 0) {
      await connection.rollback();
      connection.release();
      return NextResponse.json(
        { success: false, error: "País no encontrado" },
        { status: 404 }
      );
    }

    // Verificar si hay regiones asociadas
    const [regiones] = await connection.query<RowDataPacket[]>(
      "SELECT COUNT(*) as total FROM regiones WHERE id_pais = ? AND activo = 1",
      [id_pais]
    );

    if (regiones[0].total > 0) {
      await connection.rollback();
      connection.release();
      return NextResponse.json(
        { success: false, error: `No se puede eliminar. Hay ${regiones[0].total} regiones asociadas` },
        { status: 409 }
      );
    }

    // Soft delete
    await connection.query(
      "UPDATE paises SET activo = 0, fecha_modificacion = NOW() WHERE id_pais = ?",
      [id_pais]
    );

    // Registrar log
    await registrarLog({
      id_usuario: null,
      tipo: "audit",
      modulo: "paises",
      accion: "eliminar_pais",
      descripcion: `País eliminado: ${pais[0].nombre}`,
      objeto_tipo: "pais",
      objeto_id: id_pais,
      datos_antiguos: pais[0],
      ip_origen: request.headers.get("x-forwarded-for") || "unknown",
      agente_usuario: request.headers.get("user-agent") || "unknown",
      nivel_severidad: 5,
    });

    await connection.commit();
    connection.release();

    return NextResponse.json({
      success: true,
      message: "País eliminado exitosamente",
    });
  } catch (error: any) {
    if (connection) {
      await connection.rollback();
      connection.release();
    }
    console.error("Error al eliminar país:", error);
    
    await registrarLog({
      tipo: "error",
      modulo: "paises",
      accion: "eliminar_pais",
      descripcion: "Error al eliminar país",
      mensaje_error: error.message,
      exitoso: false,
      nivel_severidad: 8,
    });

    return NextResponse.json(
      { success: false, error: "Error al eliminar país", detalles: error.message },
      { status: 500 }
    );
  }
}
