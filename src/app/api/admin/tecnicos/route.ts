// frontend/src/app/api/admin/tecnicos/route.ts
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { RowDataPacket, ResultSetHeader } from "mysql2";
import { registrarLog } from "@/lib/logs";

// ============================================================================
// GET - LISTAR TÉCNICOS (PAGINADO + FILTROS + ESTADÍSTICAS)
// ============================================================================
export async function GET(request: NextRequest) {
  let connection;

  try {
    const { searchParams } = new URL(request.url);

    // Paginación
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(
      200,
      Math.max(1, parseInt(searchParams.get("limit") || "100"))
    );
    const offset = (page - 1) * limit;

    // Filtros
    const estado = searchParams.get("estado") || "todos"; // activo, inactivo, suspendido, todos
    const disponibilidad =
      searchParams.get("disponibilidad") || "todos"; // disponible, ocupado, fuera_servicio, todos
    const turno = searchParams.get("turno") || "todos"; // manana, tarde, noche, completo, todos
    const tipo = searchParams.get("tipo") || "todos"; // soporte, mantenimiento, etc., todos
    const centro = searchParams.get("centro") || ""; // id_centro
    const busqueda = searchParams.get("busqueda") || "";
    const ordenar = searchParams.get("ordenar") || "prioridad_desc";

    connection = await pool.getConnection();

    // WHERE dinámico
    const whereConditions: string[] = [];
    const queryParams: any[] = [];

    if (estado !== "todos") {
      whereConditions.push("t.estado = ?");
      queryParams.push(estado);
    }

    if (disponibilidad !== "todos") {
      whereConditions.push("t.disponibilidad = ?");
      queryParams.push(disponibilidad);
    }

    if (turno !== "todos") {
      whereConditions.push("t.turno = ?");
      queryParams.push(turno);
    }

    if (tipo !== "todos") {
      whereConditions.push("t.tipo_tecnico = ?");
      queryParams.push(tipo);
    }

    if (centro) {
      whereConditions.push("t.id_centro = ?");
      queryParams.push(parseInt(centro));
    }

    if (busqueda) {
      const term = `%${busqueda}%`;
      whereConditions.push(
        `(
          u.nombre LIKE ? OR 
          u.apellido_paterno LIKE ? OR 
          u.apellido_materno LIKE ? OR 
          CONCAT(u.nombre, ' ', u.apellido_paterno, ' ', COALESCE(u.apellido_materno, '')) LIKE ? OR
          t.area_tecnica LIKE ? OR
          t.especialidad_tecnica LIKE ? OR
          t.region LIKE ? OR
          t.pais LIKE ? OR
          c.nombre LIKE ? OR
          s.nombre LIKE ?
        )`
      );
      queryParams.push(
        term,
        term,
        term,
        term,
        term,
        term,
        term,
        term,
        term,
        term
      );
    }

    const whereClause =
      whereConditions.length > 0
        ? "WHERE " + whereConditions.join(" AND ")
        : "";

    // FROM + JOIN común a todas las consultas
    // IMPORTANTE: administrativos NO tiene nombre, se obtiene desde usuarios (u_supervisor)
    const fromJoin = `
      FROM tecnicos t
      JOIN usuarios u ON u.id_usuario = t.id_usuario
      LEFT JOIN centros_medicos c ON t.id_centro = c.id_centro
      LEFT JOIN sucursales s ON t.id_sucursal = s.id_sucursal
      LEFT JOIN administrativos a ON t.supervisor_id = a.id_administrativo
      LEFT JOIN usuarios u_supervisor ON a.id_usuario = u_supervisor.id_usuario
    `;

    // Ordenamiento
    let orderBy = `
      FIELD(t.prioridad, 'critica','alta','media','baja') DESC,
      FIELD(t.disponibilidad, 'disponible','ocupado','fuera_servicio') ASC,
      t.calificacion_promedio DESC
    `;

    switch (ordenar) {
      case "nombre_asc":
        orderBy = "usuario_nombre ASC";
        break;
      case "nombre_desc":
        orderBy = "usuario_nombre DESC";
        break;
      case "prioridad_asc":
        orderBy =
          "FIELD(t.prioridad, 'baja','media','alta','critica') ASC, usuario_nombre ASC";
        break;
      case "prioridad_desc":
        orderBy =
          "FIELD(t.prioridad, 'critica','alta','media','baja') DESC, usuario_nombre ASC";
        break;
      case "calificacion_desc":
        orderBy = "t.calificacion_promedio DESC, usuario_nombre ASC";
        break;
      case "calificacion_asc":
        orderBy = "t.calificacion_promedio ASC, usuario_nombre ASC";
        break;
      case "tickets_desc":
        orderBy = "t.tickets_resueltos DESC";
        break;
      case "tickets_asc":
        orderBy = "t.tickets_resueltos ASC";
        break;
      case "fecha_inicio_asc":
        orderBy = "t.fecha_inicio ASC";
        break;
      case "fecha_inicio_desc":
        orderBy = "t.fecha_inicio DESC";
        break;
    }

    // QUERY PRINCIPAL (lista de técnicos)
    const sqlTecnicos = `
      SELECT
        t.*,
        CONCAT(u.nombre, ' ', u.apellido_paterno, ' ', COALESCE(u.apellido_materno, '')) AS usuario_nombre,
        c.nombre AS centro_nombre,
        s.nombre AS sucursal_nombre,
        CONCAT(
          u_supervisor.nombre,
          ' ',
          u_supervisor.apellido_paterno,
          ' ',
          COALESCE(u_supervisor.apellido_materno, '')
        ) AS supervisor_nombre
      ${fromJoin}
      ${whereClause}
      GROUP BY t.id_tecnico
      ORDER BY ${orderBy}
      LIMIT ? OFFSET ?
    `;

    const [tecnicos] = await connection.query<RowDataPacket[]>(
      sqlTecnicos,
      [...queryParams, limit, offset]
    );

    // TOTAL para paginación
    const sqlCount = `
      SELECT COUNT(DISTINCT t.id_tecnico) AS total
      ${fromJoin}
      ${whereClause}
    `;

    const [countRows] = await connection.query<RowDataPacket[]>(
      sqlCount,
      queryParams
    );
    const total = countRows[0]?.total || 0;
    const totalPages = Math.ceil(total / limit);

    // ESTADÍSTICAS generales
    const sqlStats = `
      SELECT
        COUNT(DISTINCT t.id_tecnico) AS total_tecnicos,
        SUM(CASE WHEN t.estado = 'activo' THEN 1 ELSE 0 END) AS tecnicos_activos,
        SUM(CASE WHEN t.estado = 'inactivo' THEN 1 ELSE 0 END) AS tecnicos_inactivos,
        SUM(CASE WHEN t.estado = 'suspendido' THEN 1 ELSE 0 END) AS tecnicos_suspendidos,
        SUM(CASE WHEN t.disponibilidad = 'disponible' THEN 1 ELSE 0 END) AS tecnicos_disponibles,
        SUM(CASE WHEN t.disponibilidad = 'ocupado' THEN 1 ELSE 0 END) AS tecnicos_ocupados,
        SUM(CASE WHEN t.disponibilidad = 'fuera_servicio' THEN 1 ELSE 0 END) AS tecnicos_fuera_servicio,
        ROUND(AVG(t.calificacion_promedio), 2) AS promedio_calificacion,
        ROUND(AVG(t.tickets_resueltos), 2) AS promedio_tickets_resueltos,
        ROUND(AVG(t.tiempo_promedio_resolucion), 2) AS promedio_tiempo_resolucion
      ${fromJoin}
      ${whereClause}
    `;

    const [statsRows] = await connection.query<RowDataPacket[]>(
      sqlStats,
      queryParams
    );

    connection.release();

    return NextResponse.json({
      success: true,
      tecnicos, // para el frontend de técnicos
      data: tecnicos, // por consistencia con otros endpoints
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
      estadisticas: statsRows[0] || null,
      filtros: {
        estado,
        disponibilidad,
        turno,
        tipo,
        centro,
        busqueda,
        ordenar,
      },
    });
  } catch (error: any) {
    if (connection) connection.release();
    console.error("Error al listar técnicos:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Error al obtener técnicos",
        detalles: error.message,
      },
      { status: 500 }
    );
  }
}

// ============================================================================
// POST - CREAR TÉCNICO (USANDO TU TABLA `tecnicos`)
// ============================================================================
export async function POST(request: NextRequest) {
  let connection;

  try {
    const body = await request.json();

    const {
      id_usuario,
      id_centro,
      id_sucursal,
      area_tecnica,
      tipo_tecnico = "soporte",
      turno = "completo",
      hora_inicio,
      hora_fin,
      descripcion,
      nivel_acceso = "basico",
      extension_telefonica,
      estado = "activo",
      disponibilidad = "disponible",
      prioridad = "media",
      pais,
      region,
      zona_horaria,
      pin_seguridad,
      firma_digital,
      tickets_resueltos = 0,
      tiempo_promedio_resolucion = 0,
      calificacion_promedio = 0,
      supervisor_id,
      fecha_inicio,
      fecha_termino,
      especialidad_tecnica,
      certificaciones,
      es_global = 0,
      creado_por = null, // idealmente desde sesión
    } = body;

    // Validaciones básicas
    if (!id_usuario || !area_tecnica || !fecha_inicio) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Faltan campos obligatorios: id_usuario, area_tecnica, fecha_inicio",
        },
        { status: 400 }
      );
    }

    connection = await pool.getConnection();
    await connection.beginTransaction();

    // Verificar que el usuario exista
    const [usuarioRows] = await connection.query<RowDataPacket[]>(
      "SELECT id_usuario, nombre, apellido_paterno, email FROM usuarios WHERE id_usuario = ?",
      [id_usuario]
    );

    if (usuarioRows.length === 0) {
      await connection.rollback();
      connection.release();
      return NextResponse.json(
        { success: false, error: "El usuario asociado no existe" },
        { status: 400 }
      );
    }

    const usuario = usuarioRows[0];

    // Verificar que el usuario no tenga ya un técnico asociado (UNIQUE idx_tecnico_usuario)
    const [tecnicoExistente] = await connection.query<RowDataPacket[]>(
      "SELECT id_tecnico FROM tecnicos WHERE id_usuario = ?",
      [id_usuario]
    );

    if (tecnicoExistente.length > 0) {
      await connection.rollback();
      connection.release();
      return NextResponse.json(
        { success: false, error: "Ese usuario ya tiene un técnico asociado" },
        { status: 400 }
      );
    }

    // Insertar técnico
    const [result] = await connection.query<ResultSetHeader>(
      `
      INSERT INTO tecnicos (
        id_usuario,
        id_centro,
        id_sucursal,
        area_tecnica,
        tipo_tecnico,
        turno,
        hora_inicio,
        hora_fin,
        descripcion,
        nivel_acceso,
        extension_telefonica,
        estado,
        disponibilidad,
        prioridad,
        pais,
        region,
        zona_horaria,
        pin_seguridad,
        firma_digital,
        tickets_resueltos,
        tiempo_promedio_resolucion,
        calificacion_promedio,
        supervisor_id,
        fecha_inicio,
        fecha_termino,
        especialidad_tecnica,
        certificaciones,
        es_global,
        creado_por
      ) VALUES (
        ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
      )
    `,
      [
        id_usuario,
        id_centro || null,
        id_sucursal || null,
        area_tecnica,
        tipo_tecnico,
        turno,
        hora_inicio || null,
        hora_fin || null,
        descripcion || null,
        nivel_acceso,
        extension_telefonica || null,
        estado,
        disponibilidad,
        prioridad,
        pais || null,
        region || null,
        zona_horaria || null,
        pin_seguridad || null,
        firma_digital || null,
        tickets_resueltos,
        tiempo_promedio_resolucion,
        calificacion_promedio,
        supervisor_id || null,
        fecha_inicio,
        fecha_termino || null,
        especialidad_tecnica || null,
        certificaciones || null,
        es_global ? 1 : 0,
        creado_por || null,
      ]
    );

    const nuevoTecnicoId = result.insertId;

    // Obtener técnico recién creado con joins (mismo formato que GET)
    const [nuevoTecnicoRows] = await connection.query<RowDataPacket[]>(
      `
      SELECT
        t.*,
        CONCAT(u.nombre, ' ', u.apellido_paterno, ' ', COALESCE(u.apellido_materno, '')) AS usuario_nombre,
        c.nombre AS centro_nombre,
        s.nombre AS sucursal_nombre,
        CONCAT(
          u_supervisor.nombre,
          ' ',
          u_supervisor.apellido_paterno,
          ' ',
          COALESCE(u_supervisor.apellido_materno, '')
        ) AS supervisor_nombre
      FROM tecnicos t
      JOIN usuarios u ON u.id_usuario = t.id_usuario
      LEFT JOIN centros_medicos c ON t.id_centro = c.id_centro
      LEFT JOIN sucursales s ON t.id_sucursal = s.id_sucursal
      LEFT JOIN administrativos a ON t.supervisor_id = a.id_administrativo
      LEFT JOIN usuarios u_supervisor ON a.id_usuario = u_supervisor.id_usuario
      WHERE t.id_tecnico = ?
      LIMIT 1
    `,
      [nuevoTecnicoId]
    );

    const nuevoTecnico = nuevoTecnicoRows[0];

    // Log auditoría
    await registrarLog({
      id_usuario: creado_por || null,
      tipo: "audit",
      modulo: "tecnicos",
      accion: "crear_tecnico",
      descripcion: `Técnico creado para usuario: ${usuario.nombre} ${usuario.apellido_paterno} (${usuario.email})`,
      objeto_tipo: "tecnico",
      objeto_id: nuevoTecnicoId.toString(),
      datos_nuevos: body,
      ip_origen:
        request.headers.get("x-forwarded-for") ||
        request.headers.get("x-real-ip") ||
        "unknown",
      agente_usuario: request.headers.get("user-agent") || "unknown",
      nivel_severidad: 5,
    });

    await connection.commit();
    connection.release();

    return NextResponse.json(
      {
        success: true,
        message: "Técnico creado exitosamente",
        data: nuevoTecnico,
        tecnico: nuevoTecnico,
      },
      { status: 201 }
    );
  } catch (error: any) {
    if (connection) {
      try {
        await connection.rollback();
      } catch {}
      connection.release();
    }

    console.error("Error al crear técnico:", error);

    await registrarLog({
      tipo: "error",
      modulo: "tecnicos",
      accion: "crear_tecnico",
      descripcion: "Error al crear técnico",
      mensaje_error: error.message,
      exitoso: false,
      nivel_severidad: 8,
    });

    return NextResponse.json(
      {
        success: false,
        error: "Error al crear técnico",
        detalles: error.message,
      },
      { status: 500 }
    );
  }
}
