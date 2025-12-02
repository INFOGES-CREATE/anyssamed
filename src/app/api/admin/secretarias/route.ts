// frontend/src/app/api/admin/secretarias/route.ts
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { RowDataPacket, ResultSetHeader } from "mysql2";
import { registrarLog } from "@/lib/logs";

// ============================================================================
// GET - LISTAR SECRETARIAS (PAGINADO + FILTROS + ESTADÍSTICAS)
// ============================================================================
export async function GET(request: NextRequest) {
  let connection;

  try {
    const { searchParams } = new URL(request.url);

    // Parámetros de paginación
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "50")));
    const offset = (page - 1) * limit;

    // Filtros
    const estado = searchParams.get("estado") || "todas";   // activo, inactivo, suspendido, vacaciones, todas
    const jornada = searchParams.get("jornada") || "todas"; // completa, media, parcial, todas
    const centro = searchParams.get("centro") || "";        // nombre centro (texto)
    const buscar = searchParams.get("buscar") || "";        // texto libre
    const ordenar = searchParams.get("ordenar") || "fecha_desc";

    connection = await pool.getConnection();

    // Construir WHERE
    const whereConditions: string[] = [];
    const queryParams: any[] = [];

    if (estado !== "todas") {
      whereConditions.push("sec.estado = ?");
      queryParams.push(estado);
    }

    if (jornada !== "todas") {
      whereConditions.push("sec.jornada = ?");
      queryParams.push(jornada);
    }

    if (centro) {
      whereConditions.push("c.nombre LIKE ?");
      queryParams.push(`%${centro}%`);
    }

    if (buscar) {
      whereConditions.push(
        "(" +
          "u.nombre LIKE ? OR " +
          "u.apellido_paterno LIKE ? OR " +
          "u.apellido_materno LIKE ? OR " +
          "u.email LIKE ? OR " +
          "u.rut LIKE ? OR " +
          "sec.numero_empleado LIKE ?" +
        ")"
      );
      const searchTerm = `%${buscar}%`;
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
      whereConditions.length > 0 ? "WHERE " + whereConditions.join(" AND ") : "";

    // Ordenamiento
    let orderBy = "sec.fecha_creacion DESC";
    switch (ordenar) {
      case "nombre_asc":
        orderBy = "u.nombre ASC, u.apellido_paterno ASC";
        break;
      case "nombre_desc":
        orderBy = "u.nombre DESC, u.apellido_paterno DESC";
        break;
      case "fecha_asc":
        orderBy = "sec.fecha_creacion ASC";
        break;
      case "fecha_desc":
        orderBy = "sec.fecha_creacion DESC";
        break;
      case "centro":
        orderBy = "c.nombre ASC, u.nombre ASC, u.apellido_paterno ASC";
        break;
    }

    // Query principal
    const query = `
      SELECT
        sec.id_secretaria,
        sec.id_usuario,
        u.rut,
        u.nombre,
        u.apellido_paterno,
        u.apellido_materno,
        CONCAT(u.nombre, ' ', u.apellido_paterno, ' ', COALESCE(u.apellido_materno, '')) AS nombre_completo,
        u.email,
        u.telefono,

        sec.id_centro,
        sec.id_sucursal,
        sec.id_departamento,

        c.nombre AS centro_nombre,
        s.nombre AS sucursal_nombre,
        d.nombre AS departamento_nombre,

        sec.estado,
        sec.jornada,
        sec.extension_telefonica,

        DATE_FORMAT(sec.fecha_inicio, '%Y-%m-%d') AS fecha_inicio,
        DATE_FORMAT(sec.fecha_termino, '%Y-%m-%d') AS fecha_termino,

        sec.supervisor_id,
        CONCAT(u_sup.nombre, ' ', u_sup.apellido_paterno, ' ', COALESCE(u_sup.apellido_materno, '')) AS supervisor_nombre,

        sec.numero_empleado,
        sec.id_profesional_asignado,
        CONCAT(u_med.nombre, ' ', u_med.apellido_paterno, ' ', COALESCE(u_med.apellido_materno, '')) AS medico_principal_nombre,

        (
          SELECT COUNT(*)
          FROM secretarias_medicos sm
          WHERE sm.id_secretaria = sec.id_secretaria
            AND sm.estado = 'activo'
        ) AS total_medicos_asignados

      FROM secretarias sec
      INNER JOIN usuarios u ON sec.id_usuario = u.id_usuario
      LEFT JOIN centros_medicos c ON sec.id_centro = c.id_centro
      LEFT JOIN sucursales s ON sec.id_sucursal = s.id_sucursal
      LEFT JOIN departamentos d ON sec.id_departamento = d.id_departamento

      LEFT JOIN administrativos adm ON sec.supervisor_id = adm.id_administrativo
      LEFT JOIN usuarios u_sup ON adm.id_usuario = u_sup.id_usuario

      LEFT JOIN profesionales_salud med ON sec.id_profesional_asignado = med.id_profesional
      LEFT JOIN usuarios u_med ON med.id_usuario = u_med.id_usuario

      ${whereClause}
      GROUP BY sec.id_secretaria
      ORDER BY ${orderBy}
      LIMIT ? OFFSET ?
    `;

    const [secretarias] = await connection.query<RowDataPacket[]>(
      query,
      [...queryParams, limit, offset]
    );

    // Contar total
    const countQuery = `
      SELECT COUNT(DISTINCT sec.id_secretaria) AS total
      FROM secretarias sec
      INNER JOIN usuarios u ON sec.id_usuario = u.id_usuario
      LEFT JOIN centros_medicos c ON sec.id_centro = c.id_centro
      ${whereClause}
    `;

    const [countResult] = await connection.query<RowDataPacket[]>(
      countQuery,
      queryParams
    );
    const total = countResult[0]?.total || 0;
    const totalPages = Math.ceil(total / limit);

    // Estadísticas generales
    const [stats] = await connection.query<RowDataPacket[]>(
      `
      SELECT
        COUNT(DISTINCT sec.id_secretaria) AS total,
        SUM(CASE WHEN sec.estado = 'activo' THEN 1 ELSE 0 END) AS activas,
        SUM(CASE WHEN sec.estado = 'inactivo' THEN 1 ELSE 0 END) AS inactivas,
        SUM(CASE WHEN sec.estado = 'suspendido' THEN 1 ELSE 0 END) AS suspendidas,
        SUM(CASE WHEN sec.estado = 'vacaciones' THEN 1 ELSE 0 END) AS en_vacaciones,

        SUM(CASE WHEN sec.jornada = 'completa' THEN 1 ELSE 0 END) AS jornada_completa,
        SUM(CASE WHEN sec.jornada = 'media' THEN 1 ELSE 0 END) AS jornada_media,
        SUM(CASE WHEN sec.jornada = 'parcial' THEN 1 ELSE 0 END) AS jornada_parcial,

        SUM(CASE WHEN sec.id_profesional_asignado IS NOT NULL THEN 1 ELSE 0 END) AS con_medico_principal,
        SUM(CASE WHEN sec.id_profesional_asignado IS NULL THEN 1 ELSE 0 END) AS sin_medico_principal,

        SUM(CASE WHEN sec.fecha_creacion >= DATE_SUB(NOW(), INTERVAL 30 DAY) THEN 1 ELSE 0 END) AS nuevas_ultimo_mes
      FROM secretarias sec
      INNER JOIN usuarios u ON sec.id_usuario = u.id_usuario
      LEFT JOIN centros_medicos c ON sec.id_centro = c.id_centro
      ${whereClause}
    `,
      queryParams
    );

    connection.release();

    return NextResponse.json({
      success: true,
      data: secretarias,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
      estadisticas: stats[0],
      filtros: { estado, jornada, centro, buscar, ordenar },
    });
  } catch (error: any) {
    if (connection) connection.release();
    console.error("Error al listar secretarias:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Error al obtener secretarias",
        detalles: error.message,
      },
      { status: 500 }
    );
  }
}

// ============================================================================
// POST - CREAR SECRETARIA (usa tablas secretarias + secretarias_medicos)
// ============================================================================
export async function POST(request: NextRequest) {
  let connection;

  try {
    const body = await request.json();

    const {
      id_usuario,
      id_centro,
      id_sucursal,
      id_departamento,
      estado = "activo",
      jornada = "completa",
      extension_telefonica,
      fecha_inicio,
      fecha_termino,
      supervisor_id,
      numero_empleado,
      id_profesional_asignado,
      // opcional: lista de médicos a asignar
      medicos_asignados, // [{ id_profesional: number, es_principal?: boolean, permisos_especiales?: string }]
    } = body;

    // Validaciones mínimas
    if (!id_usuario || !id_centro || !fecha_inicio) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Faltan campos obligatorios: id_usuario, id_centro, fecha_inicio",
        },
        { status: 400 }
      );
    }

    connection = await pool.getConnection();
    await connection.beginTransaction();

    // Validar que el usuario exista
    const [usuarioExiste] = await connection.query<RowDataPacket[]>(
      "SELECT id_usuario, nombre, apellido_paterno FROM usuarios WHERE id_usuario = ?",
      [id_usuario]
    );

    if (usuarioExiste.length === 0) {
      await connection.rollback();
      connection.release();
      return NextResponse.json(
        { success: false, error: "El usuario indicado no existe" },
        { status: 400 }
      );
    }

    const usuarioNombre = `${usuarioExiste[0].nombre} ${usuarioExiste[0].apellido_paterno}`;

    // Validar que el usuario no tenga ya una secretaria asociada (por UNIQUE idx_secretaria_usuario)
    const [secretariaExiste] = await connection.query<RowDataPacket[]>(
      "SELECT id_secretaria FROM secretarias WHERE id_usuario = ?",
      [id_usuario]
    );

    if (secretariaExiste.length > 0) {
      await connection.rollback();
      connection.release();
      return NextResponse.json(
        {
          success: false,
          error:
            "Ya existe un registro de secretaria asociado a este usuario",
        },
        { status: 400 }
      );
    }

    // Insertar secretaria
    const [result] = await connection.query<ResultSetHeader>(
      `
      INSERT INTO secretarias (
        id_usuario,
        id_centro,
        id_sucursal,
        id_departamento,
        estado,
        jornada,
        extension_telefonica,
        fecha_inicio,
        fecha_termino,
        supervisor_id,
        fecha_creacion,
        fecha_modificacion,
        numero_empleado,
        id_profesional_asignado
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW(), ?, ?)
    `,
      [
        id_usuario,
        id_centro,
        id_sucursal || null,
        id_departamento || null,
        estado,
        jornada,
        extension_telefonica || null,
        fecha_inicio,
        fecha_termino || null,
        supervisor_id || null,
        numero_empleado || null,
        id_profesional_asignado || null,
      ]
    );

    const nuevaSecretariaId = result.insertId;

    // Insertar asignaciones en secretarias_medicos
    if (Array.isArray(medicos_asignados) && medicos_asignados.length > 0) {
      for (const item of medicos_asignados) {
        if (!item || !item.id_profesional) continue;

        const esPrincipal = item.es_principal ? 1 : 0;
        const permisos = item.permisos_especiales || null;

        await connection.query(
          `
          INSERT INTO secretarias_medicos (
            id_secretaria,
            id_profesional,
            es_principal,
            fecha_asignacion,
            estado,
            permisos_especiales
          ) VALUES (?, ?, ?, CURDATE(), 'activo', ?)
        `,
          [nuevaSecretariaId, item.id_profesional, esPrincipal, permisos]
        );

        // Si marcamos uno como principal y no se envió id_profesional_asignado,
        // lo dejamos como principal en la tabla secretarias.
        if (esPrincipal && !id_profesional_asignado) {
          await connection.query(
            "UPDATE secretarias SET id_profesional_asignado = ? WHERE id_secretaria = ?",
            [item.id_profesional, nuevaSecretariaId]
          );
        }
      }
    } else if (id_profesional_asignado) {
      // Si no viene arreglo pero sí un id_profesional_asignado, creamos la relación principal
      await connection.query(
        `
        INSERT INTO secretarias_medicos (
          id_secretaria,
          id_profesional,
          es_principal,
          fecha_asignacion,
          estado
        ) VALUES (?, ?, 1, CURDATE(), 'activo')
      `,
        [nuevaSecretariaId, id_profesional_asignado]
      );
    }

    // Obtener secretaria creada con todos los datos (mismo SELECT que en el GET, filtrando por id)
    const [nuevaSecretaria] = await connection.query<RowDataPacket[]>(
      `
      SELECT
        sec.id_secretaria,
        sec.id_usuario,
        u.rut,
        u.nombre,
        u.apellido_paterno,
        u.apellido_materno,
        CONCAT(u.nombre, ' ', u.apellido_paterno, ' ', COALESCE(u.apellido_materno, '')) AS nombre_completo,
        u.email,
        u.telefono,

        sec.id_centro,
        sec.id_sucursal,
        sec.id_departamento,

        c.nombre AS centro_nombre,
        s.nombre AS sucursal_nombre,
        d.nombre AS departamento_nombre,

        sec.estado,
        sec.jornada,
        sec.extension_telefonica,

        DATE_FORMAT(sec.fecha_inicio, '%Y-%m-%d') AS fecha_inicio,
        DATE_FORMAT(sec.fecha_termino, '%Y-%m-%d') AS fecha_termino,

        sec.supervisor_id,
        CONCAT(u_sup.nombre, ' ', u_sup.apellido_paterno, ' ', COALESCE(u_sup.apellido_materno, '')) AS supervisor_nombre,

        sec.numero_empleado,
        sec.id_profesional_asignado,
        CONCAT(u_med.nombre, ' ', u_med.apellido_paterno, ' ', COALESCE(u_med.apellido_materno, '')) AS medico_principal_nombre,

        (
          SELECT COUNT(*)
          FROM secretarias_medicos sm
          WHERE sm.id_secretaria = sec.id_secretaria
            AND sm.estado = 'activo'
        ) AS total_medicos_asignados

      FROM secretarias sec
      INNER JOIN usuarios u ON sec.id_usuario = u.id_usuario
      LEFT JOIN centros_medicos c ON sec.id_centro = c.id_centro
      LEFT JOIN sucursales s ON sec.id_sucursal = s.id_sucursal
      LEFT JOIN departamentos d ON sec.id_departamento = d.id_departamento

      LEFT JOIN administrativos adm ON sec.supervisor_id = adm.id_administrativo
      LEFT JOIN usuarios u_sup ON adm.id_usuario = u_sup.id_usuario

      LEFT JOIN profesionales_salud med ON sec.id_profesional_asignado = med.id_profesional
      LEFT JOIN usuarios u_med ON med.id_usuario = u_med.id_usuario

      WHERE sec.id_secretaria = ?
      GROUP BY sec.id_secretaria
    `,
      [nuevaSecretariaId]
    );

    // Registrar log
    await registrarLog({
      id_usuario: id_usuario || null,
      tipo: "audit",
      modulo: "secretarias",
      accion: "crear_secretaria",
      descripcion: `Secretaria creada para usuario ${usuarioNombre} (ID usuario: ${id_usuario})`,
      objeto_tipo: "secretaria",
      objeto_id: nuevaSecretariaId.toString(),
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
        message: "Secretaria creada exitosamente",
        data: nuevaSecretaria[0],
      },
      { status: 201 }
    );
  } catch (error: any) {
    if (connection) {
      await connection.rollback();
      connection.release();
    }

    console.error("Error al crear secretaria:", error);

    await registrarLog({
      tipo: "error",
      modulo: "secretarias",
      accion: "crear_secretaria",
      descripcion: "Error al crear secretaria",
      mensaje_error: error.message,
      exitoso: false,
      nivel_severidad: 8,
    });

    return NextResponse.json(
      {
        success: false,
        error: "Error al crear secretaria",
        detalles: error.message,
      },
      { status: 500 }
    );
  }
}
