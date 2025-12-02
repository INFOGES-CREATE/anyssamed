// frontend/src/app/api/admin/administrativos/route.ts
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { RowDataPacket, ResultSetHeader } from "mysql2";
import { registrarLog } from "@/lib/logs";

// ============================================================================
// TIPOS
// ============================================================================
interface AdministrativoListado extends RowDataPacket {
  id_administrativo: number;
  id_usuario: number;
  id_centro: number;
  id_sucursal: number | null;
  id_departamento: number | null;
  cargo: string;
  extension_telefonica: string | null;
  nivel_acceso: "basico" | "intermedio" | "avanzado" | "administrador";
  estado_administrativo: "activo" | "inactivo" | "suspendido" | "vacaciones";
  jornada: "completa" | "media" | "parcial";
  numero_empleado: string | null;
  descripcion: string | null;
  supervisor_id: number | null;
  fecha_inicio: string;
  fecha_termino: string | null;
  fecha_creacion: string;
  fecha_modificacion: string;

  // usuario
  username: string;
  rut: string;
  nombre: string;
  apellido_paterno: string;
  apellido_materno: string | null;
  nombre_completo: string;
  email: string;
  telefono: string | null;
  celular: string | null;
  fecha_nacimiento: string | null;
  genero: string | null;
  direccion: string | null;
  ciudad: string | null;
  region: string | null;

  // centro / sucursal / depto / supervisor
  centro_nombre: string | null;
  centro_estado: string | null;
  sucursal_nombre: string | null;
  departamento_nombre: string | null;
  supervisor_administrativo_id: number | null;
  supervisor_nombre: string | null;
}

// ============================================================================
// GET - LISTAR ADMINISTRATIVOS
// ============================================================================
export async function GET(request: NextRequest) {
  let connection;

  try {
    const { searchParams } = new URL(request.url);

    // Paginación
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(
      100,
      Math.max(1, parseInt(searchParams.get("limit") || "50"))
    );
    const offset = (page - 1) * limit;

    // Filtros
    const estado = searchParams.get("estado") || "todos";
    const centro = searchParams.get("centro") || "";
    const sucursal = searchParams.get("sucursal") || "";
    const jornada = searchParams.get("jornada") || "todas";
    const nivel_acceso = searchParams.get("nivel_acceso") || "todos";
    const busqueda = searchParams.get("busqueda") || "";
    const ordenar = searchParams.get("ordenar") || "fecha_desc";

    connection = await pool.getConnection();

    // WHERE dinámico
    const whereConditions: string[] = [];
    const queryParams: any[] = [];

    if (estado !== "todos") {
      whereConditions.push("a.estado = ?");
      queryParams.push(estado);
    }

    if (centro) {
      whereConditions.push("a.id_centro = ?");
      queryParams.push(parseInt(centro));
    }

    if (sucursal) {
      whereConditions.push("a.id_sucursal = ?");
      queryParams.push(parseInt(sucursal));
    }

    if (jornada !== "todas") {
      whereConditions.push("a.jornada = ?");
      queryParams.push(jornada);
    }

    if (nivel_acceso !== "todos") {
      whereConditions.push("a.nivel_acceso = ?");
      queryParams.push(nivel_acceso);
    }

    if (busqueda) {
      const term = `%${busqueda}%`;
      whereConditions.push(
        "(" +
          [
            "u.nombre LIKE ?",
            "u.apellido_paterno LIKE ?",
            "u.apellido_materno LIKE ?",
            "u.email LIKE ?",
            "u.rut LIKE ?",
            "u.username LIKE ?",
            "a.cargo LIKE ?",
            "a.numero_empleado LIKE ?",
          ].join(" OR ") +
          ")"
      );
      queryParams.push(
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
      whereConditions.length > 0 ? `WHERE ${whereConditions.join(" AND ")}` : "";

    // Orden
    let orderBy = "a.fecha_creacion DESC";
    switch (ordenar) {
      case "nombre_asc":
        orderBy =
          "u.nombre ASC, u.apellido_paterno ASC, u.apellido_materno ASC";
        break;
      case "nombre_desc":
        orderBy =
          "u.nombre DESC, u.apellido_paterno DESC, u.apellido_materno DESC";
        break;
      case "cargo_asc":
        orderBy = "a.cargo ASC";
        break;
      case "cargo_desc":
        orderBy = "a.cargo DESC";
        break;
      case "fecha_asc":
        orderBy = "a.fecha_creacion ASC";
        break;
      case "fecha_desc":
      default:
        orderBy = "a.fecha_creacion DESC";
        break;
    }

    // Query principal
    const query = `
      SELECT
        a.id_administrativo,
        a.id_usuario,
        a.id_centro,
        a.id_sucursal,
        a.id_departamento,
        a.cargo,
        a.extension_telefonica,
        a.nivel_acceso,
        a.estado AS estado_administrativo,
        a.jornada,
        a.numero_empleado,
        a.descripcion,
        a.supervisor_id,
        a.fecha_inicio,
        a.fecha_termino,
        a.fecha_creacion,
        a.fecha_modificacion,
        u.username,
        u.rut,
        u.nombre,
        u.apellido_paterno,
        u.apellido_materno,
        CONCAT(
          u.nombre,
          ' ',
          u.apellido_paterno,
          ' ',
          COALESCE(u.apellido_materno, '')
        ) AS nombre_completo,
        u.email,
        u.telefono,
        u.celular,
        u.fecha_nacimiento,
        u.genero,
        u.direccion,
        u.ciudad,
        u.region,
        c.nombre AS centro_nombre,
        c.estado AS centro_estado,
        s.nombre AS sucursal_nombre,
        d.nombre AS departamento_nombre,
        sup.id_administrativo AS supervisor_administrativo_id,
        CONCAT(
          supUser.nombre,
          ' ',
          supUser.apellido_paterno,
          ' ',
          COALESCE(supUser.apellido_materno, '')
        ) AS supervisor_nombre
      FROM administrativos a
      INNER JOIN usuarios u ON a.id_usuario = u.id_usuario
      LEFT JOIN centros_medicos c ON a.id_centro = c.id_centro
      LEFT JOIN sucursales s ON a.id_sucursal = s.id_sucursal
      LEFT JOIN departamentos d ON a.id_departamento = d.id_departamento
      LEFT JOIN administrativos sup ON a.supervisor_id = sup.id_administrativo
      LEFT JOIN usuarios supUser ON sup.id_usuario = supUser.id_usuario
      ${whereClause}
      ORDER BY ${orderBy}
      LIMIT ? OFFSET ?
    `;

    const [administrativos] =
      await connection.query<AdministrativoListado[]>(query, [
        ...queryParams,
        limit,
        offset,
      ]);

    // Conteo total
    const countQuery = `
      SELECT COUNT(*) AS total
      FROM administrativos a
      INNER JOIN usuarios u ON a.id_usuario = u.id_usuario
      ${whereClause}
    `;
    const [countResult] = await connection.query<RowDataPacket[]>(
      countQuery,
      queryParams
    );
    const total = countResult[0]?.total || 0;
    const totalPages = Math.ceil(total / limit);

    // Estadísticas generales
    const statsQuery = `
      SELECT
        COUNT(*) AS total,
        SUM(CASE WHEN a.estado = 'activo' THEN 1 ELSE 0 END) AS activos,
        SUM(CASE WHEN a.estado = 'inactivo' THEN 1 ELSE 0 END) AS inactivos,
        SUM(CASE WHEN a.estado = 'suspendido' THEN 1 ELSE 0 END) AS suspendidos,
        SUM(CASE WHEN a.estado = 'vacaciones' THEN 1 ELSE 0 END) AS vacaciones,
        SUM(CASE WHEN a.jornada = 'completa' THEN 1 ELSE 0 END) AS jornada_completa,
        SUM(CASE WHEN a.jornada = 'media' THEN 1 ELSE 0 END) AS jornada_media,
        SUM(CASE WHEN a.jornada = 'parcial' THEN 1 ELSE 0 END) AS jornada_parcial,
        SUM(CASE WHEN a.nivel_acceso = 'basico' THEN 1 ELSE 0 END) AS nivel_basico,
        SUM(CASE WHEN a.nivel_acceso = 'intermedio' THEN 1 ELSE 0 END) AS nivel_intermedio,
        SUM(CASE WHEN a.nivel_acceso = 'avanzado' THEN 1 ELSE 0 END) AS nivel_avanzado,
        SUM(CASE WHEN a.nivel_acceso = 'administrador' THEN 1 ELSE 0 END) AS nivel_administrador,
        COUNT(DISTINCT a.id_centro) AS centros_distintos,
        COUNT(DISTINCT a.id_sucursal) AS sucursales_distintas
      FROM administrativos a
      INNER JOIN usuarios u ON a.id_usuario = u.id_usuario
      ${whereClause}
    `;
    const [stats] = await connection.query<RowDataPacket[]>(
      statsQuery,
      queryParams
    );

    connection.release();

    return NextResponse.json({
      success: true,
      data: administrativos,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
      estadisticas: stats[0],
      filtros: {
        estado,
        centro,
        sucursal,
        jornada,
        nivel_acceso,
        busqueda,
        ordenar,
      },
    });
  } catch (error: any) {
    if (connection) connection.release();
    console.error("Error al listar administrativos:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Error al obtener administrativos",
        detalles: error.message,
      },
      { status: 500 }
    );
  }
}

// ============================================================================
// POST - CREAR ADMINISTRATIVO
// ============================================================================
// Aquí asumimos que el usuario YA existe y se pasa id_usuario en el body.
// Si tu flujo crea también al usuario, lo podemos ajustar después.
export async function POST(request: NextRequest) {
  let connection;

  try {
    const body = await request.json();

    const {
      id_usuario,
      id_centro,
      id_sucursal,
      id_departamento,
      cargo,
      extension_telefonica,
      nivel_acceso = "basico",
      estado = "activo",
      jornada = "completa",
      numero_empleado,
      descripcion,
      supervisor_id,
      fecha_inicio,
      fecha_termino,
    } = body;

    if (!id_usuario || !cargo || !fecha_inicio) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Faltan campos obligatorios: id_usuario, cargo, fecha_inicio",
        },
        { status: 400 }
      );
    }

    connection = await pool.getConnection();
    await connection.beginTransaction();

    // Obtener usuario para usar centro/sucursal por defecto si no vienen
    const [usuarioRows] = await connection.query<RowDataPacket[]>(
      `
      SELECT
        id_usuario,
        id_centro_principal,
        id_sucursal_principal,
        nombre,
        apellido_paterno
      FROM usuarios
      WHERE id_usuario = ?
    `,
      [id_usuario]
    );

    if (usuarioRows.length === 0) {
      await connection.rollback();
      connection.release();
      return NextResponse.json(
        { success: false, error: "Usuario no encontrado" },
        { status: 400 }
      );
    }

    const usuario = usuarioRows[0];
    const centroFinal = id_centro || usuario.id_centro_principal || null;
    const sucursalFinal = id_sucursal || usuario.id_sucursal_principal || null;

    // Insertar administrativo
    const [result] = await connection.query<ResultSetHeader>(
      `
      INSERT INTO administrativos (
        id_usuario,
        id_centro,
        id_sucursal,
        id_departamento,
        cargo,
        extension_telefonica,
        nivel_acceso,
        estado,
        jornada,
        numero_empleado,
        descripcion,
        supervisor_id,
        fecha_inicio,
        fecha_termino
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
      [
        id_usuario,
        centroFinal,
        sucursalFinal,
        id_departamento || null,
        cargo,
        extension_telefonica || null,
        nivel_acceso,
        estado,
        jornada,
        numero_empleado || null,
        descripcion || null,
        supervisor_id || null,
        fecha_inicio,
        fecha_termino || null,
      ]
    );

    const id_administrativo = result.insertId;

    // Traer registro completo recién creado
    const [nuevoAdministrativo] = await connection.query<
      AdministrativoListado[]
    >(
      `
      SELECT
        a.id_administrativo,
        a.id_usuario,
        a.id_centro,
        a.id_sucursal,
        a.id_departamento,
        a.cargo,
        a.extension_telefonica,
        a.nivel_acceso,
        a.estado AS estado_administrativo,
        a.jornada,
        a.numero_empleado,
        a.descripcion,
        a.supervisor_id,
        a.fecha_inicio,
        a.fecha_termino,
        a.fecha_creacion,
        a.fecha_modificacion,
        u.username,
        u.rut,
        u.nombre,
        u.apellido_paterno,
        u.apellido_materno,
        CONCAT(
          u.nombre,
          ' ',
          u.apellido_paterno,
          ' ',
          COALESCE(u.apellido_materno, '')
        ) AS nombre_completo,
        u.email,
        u.telefono,
        u.celular,
        u.fecha_nacimiento,
        u.genero,
        u.direccion,
        u.ciudad,
        u.region,
        c.nombre AS centro_nombre,
        c.estado AS centro_estado,
        s.nombre AS sucursal_nombre,
        d.nombre AS departamento_nombre,
        sup.id_administrativo AS supervisor_administrativo_id,
        CONCAT(
          supUser.nombre,
          ' ',
          supUser.apellido_paterno,
          ' ',
          COALESCE(supUser.apellido_materno, '')
        ) AS supervisor_nombre
      FROM administrativos a
      INNER JOIN usuarios u ON a.id_usuario = u.id_usuario
      LEFT JOIN centros_medicos c ON a.id_centro = c.id_centro
      LEFT JOIN sucursales s ON a.id_sucursal = s.id_sucursal
      LEFT JOIN departamentos d ON a.id_departamento = d.id_departamento
      LEFT JOIN administrativos sup ON a.supervisor_id = sup.id_administrativo
      LEFT JOIN usuarios supUser ON sup.id_usuario = supUser.id_usuario
      WHERE a.id_administrativo = ?
    `,
      [id_administrativo]
    );

    // Log auditoría
    await registrarLog({
      id_usuario: null, // aquí podrías poner el ID del admin autenticado
      tipo: "audit",
      modulo: "administrativos",
      accion: "crear_administrativo",
      descripcion: `Administrativo creado para usuario #${id_usuario} (${usuario.nombre} ${usuario.apellido_paterno})`,
      objeto_tipo: "administrativo",
      objeto_id: String(id_administrativo),
      datos_nuevos: body,
      ip_origen:
        request.headers.get("x-forwarded-for") ||
        request.headers.get("x-real-ip") ||
        "unknown",
      agente_usuario: request.headers.get("user-agent") || "unknown",
      nivel_severidad: 4,
    });

    await connection.commit();
    connection.release();

    return NextResponse.json(
      {
        success: true,
        message: "Administrativo creado exitosamente",
        data: nuevoAdministrativo[0],
      },
      { status: 201 }
    );
  } catch (error: any) {
    if (connection) {
      await connection.rollback();
      connection.release();
    }

    console.error("Error al crear administrativo:", error);

    await registrarLog({
      tipo: "error",
      modulo: "administrativos",
      accion: "crear_administrativo",
      descripcion: "Error al crear administrativo",
      mensaje_error: error.message,
      exitoso: false,
      nivel_severidad: 8,
    });

    return NextResponse.json(
      {
        success: false,
        error: "Error al crear administrativo",
        detalles: error.message,
      },
      { status: 500 }
    );
  }
}
