// frontend/src/app/api/admin/usuarios/route.ts
import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { RowDataPacket, ResultSetHeader } from "mysql2";
import bcrypt from "bcryptjs";
import { registrarLog } from "@/lib/logs";

// ============================================================================
// GET - LISTAR USUARIOS (CORREGIDO CON TU ESTRUCTURA REAL)
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
    const estado = searchParams.get("estado") || "todos";
    const rol = searchParams.get("rol") || "todos";
    const centro = searchParams.get("centro") || "";
    const busqueda = searchParams.get("busqueda") || "";
    const ordenar = searchParams.get("ordenar") || "fecha_desc";

    connection = await pool.getConnection();

    // Construir WHERE
    const whereConditions: string[] = [];
    const queryParams: any[] = [];

    if (estado !== "todos") {
      whereConditions.push("u.estado = ?");
      queryParams.push(estado);
    }

    if (rol !== "todos") {
      whereConditions.push("ur.id_rol = ?");
      queryParams.push(parseInt(rol));
    }

    if (centro) {
      whereConditions.push("u.id_centro_principal = ?");
      queryParams.push(parseInt(centro));
    }

    if (busqueda) {
      whereConditions.push(
        "(u.nombre LIKE ? OR u.apellido_paterno LIKE ? OR u.apellido_materno LIKE ? OR u.email LIKE ? OR u.rut LIKE ? OR u.username LIKE ?)"
      );
      const searchTerm = `%${busqueda}%`;
      queryParams.push(searchTerm, searchTerm, searchTerm, searchTerm, searchTerm, searchTerm);
    }

    const whereClause = whereConditions.length > 0 ? "WHERE " + whereConditions.join(" AND ") : "";

    // Ordenamiento
    let orderBy = "u.fecha_creacion DESC";
    switch (ordenar) {
      case "nombre_asc":
        orderBy = "u.nombre ASC, u.apellido_paterno ASC";
        break;
      case "nombre_desc":
        orderBy = "u.nombre DESC, u.apellido_paterno DESC";
        break;
      case "fecha_asc":
        orderBy = "u.fecha_creacion ASC";
        break;
      case "fecha_desc":
        orderBy = "u.fecha_creacion DESC";
        break;
      case "ultimo_acceso":
        orderBy = "u.ultimo_login DESC";
        break;
    }

    // Query principal (CON TU ESTRUCTURA REAL)
    const query = `
      SELECT 
        u.id_usuario,
        u.username,
        u.rut,
        u.nombre,
        u.apellido_paterno,
        u.apellido_materno,
        u.email,
        u.telefono,
        u.celular,
        u.fecha_nacimiento,
        u.genero,
        u.direccion,
        u.ciudad,
        u.region,
        u.estado,
        u.fecha_creacion,
        u.fecha_modificacion,
        u.ultimo_login,
        u.intentos_fallidos,
        u.id_centro_principal,
        u.id_sucursal_principal,
        u.foto_perfil_url,
        u.requiere_cambio_password,
        u.autenticacion_doble_factor,
        GROUP_CONCAT(DISTINCT r.nombre SEPARATOR ', ') as roles_nombres,
        GROUP_CONCAT(DISTINCT r.id_rol) as roles_ids,
        c.nombre as centro_nombre,
        c.estado as centro_estado,
        s.nombre as sucursal_nombre,
        CONCAT(u.nombre, ' ', u.apellido_paterno, ' ', COALESCE(u.apellido_materno, '')) as nombre_completo,
        (SELECT COUNT(*) FROM citas WHERE id_medico = u.id_usuario OR id_paciente = u.id_usuario) as total_citas,
        (SELECT COUNT(*) FROM logs_sistema WHERE id_usuario = u.id_usuario) as total_logs
      FROM usuarios u
      LEFT JOIN usuarios_roles ur ON u.id_usuario = ur.id_usuario AND ur.activo = 1
      LEFT JOIN roles r ON ur.id_rol = r.id_rol AND r.estado = 'activo'
      LEFT JOIN centros_medicos c ON u.id_centro_principal = c.id_centro
      LEFT JOIN sucursales s ON u.id_sucursal_principal = s.id_sucursal
      ${whereClause}
      GROUP BY u.id_usuario
      ORDER BY ${orderBy}
      LIMIT ? OFFSET ?
    `;

    const [usuarios] = await connection.query<RowDataPacket[]>(
      query,
      [...queryParams, limit, offset]
    );

    // Contar total
    const countQuery = `
      SELECT COUNT(DISTINCT u.id_usuario) as total
      FROM usuarios u
      LEFT JOIN usuarios_roles ur ON u.id_usuario = ur.id_usuario AND ur.activo = 1
      LEFT JOIN roles r ON ur.id_rol = r.id_rol AND r.estado = 'activo'
      ${whereClause}
    `;

    const [countResult] = await connection.query<RowDataPacket[]>(countQuery, queryParams);
    const total = countResult[0]?.total || 0;
    const totalPages = Math.ceil(total / limit);

    // Estadísticas generales (CON TU ESTRUCTURA REAL)
    const [stats] = await connection.query<RowDataPacket[]>(`
      SELECT 
        COUNT(DISTINCT u.id_usuario) as total,
        SUM(CASE WHEN u.estado = 'activo' THEN 1 ELSE 0 END) as activos,
        SUM(CASE WHEN u.estado = 'inactivo' THEN 1 ELSE 0 END) as inactivos,
        SUM(CASE WHEN u.estado = 'bloqueado' THEN 1 ELSE 0 END) as bloqueados,
        SUM(CASE WHEN u.estado = 'pendiente_activacion' THEN 1 ELSE 0 END) as pendientes,
        SUM(CASE WHEN r.nombre LIKE '%medico%' OR r.nombre LIKE '%doctor%' THEN 1 ELSE 0 END) as medicos,
        SUM(CASE WHEN r.nombre LIKE '%admin%' THEN 1 ELSE 0 END) as administrativos,
        SUM(CASE WHEN r.nombre LIKE '%secretaria%' THEN 1 ELSE 0 END) as secretarias,
        SUM(CASE WHEN r.nombre LIKE '%paciente%' THEN 1 ELSE 0 END) as pacientes,
        SUM(CASE WHEN u.ultimo_login >= DATE_SUB(NOW(), INTERVAL 7 DAY) THEN 1 ELSE 0 END) as activos_ultima_semana,
        SUM(CASE WHEN u.fecha_creacion >= DATE_SUB(NOW(), INTERVAL 30 DAY) THEN 1 ELSE 0 END) as nuevos_ultimo_mes,
        SUM(CASE WHEN u.autenticacion_doble_factor = 1 THEN 1 ELSE 0 END) as con_2fa,
        SUM(CASE WHEN u.requiere_cambio_password = 1 THEN 1 ELSE 0 END) as requieren_cambio_password
      FROM usuarios u
      LEFT JOIN usuarios_roles ur ON u.id_usuario = ur.id_usuario AND ur.activo = 1
      LEFT JOIN roles r ON ur.id_rol = r.id_rol AND r.estado = 'activo'
      ${whereClause}
    `, queryParams);

    connection.release();

    return NextResponse.json({
      success: true,
      data: usuarios,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
      estadisticas: stats[0],
      filtros: { estado, rol, centro, busqueda, ordenar },
    });
  } catch (error: any) {
    if (connection) connection.release();
    console.error("Error al listar usuarios:", error);
    return NextResponse.json(
      { success: false, error: "Error al obtener usuarios", detalles: error.message },
      { status: 500 }
    );
  }
}

// ============================================================================
// POST - CREAR USUARIO (CON TU ESTRUCTURA REAL)
// ============================================================================
export async function POST(request: NextRequest) {
  let connection;

  try {
    const body = await request.json();
    const {
      username,
      rut,
      nombre,
      apellido_paterno,
      apellido_materno,
      email,
      password,
      telefono,
      celular,
      fecha_nacimiento,
      genero,
      direccion,
      ciudad,
      region,
      id_centro_principal,
      id_sucursal_principal,
      roles, // Array de IDs de roles
      foto_perfil_url,
      requiere_cambio_password = true,
      autenticacion_doble_factor = false,
      enviar_email_bienvenida = true,
    } = body;

    // Validaciones
    if (!username || !rut || !nombre || !apellido_paterno || !email || !password) {
      return NextResponse.json(
        { success: false, error: "Faltan campos obligatorios: username, rut, nombre, apellido_paterno, email, password" },
        { status: 400 }
      );
    }

    // Validar formato email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, error: "Formato de email inválido" },
        { status: 400 }
      );
    }

    // Validar contraseña
    if (password.length < 8) {
      return NextResponse.json(
        { success: false, error: "La contraseña debe tener al menos 8 caracteres" },
        { status: 400 }
      );
    }

    connection = await pool.getConnection();
    await connection.beginTransaction();

    // Verificar si el username ya existe
    const [existeUsername] = await connection.query<RowDataPacket[]>(
      "SELECT id_usuario FROM usuarios WHERE username = ?",
      [username]
    );

    if (existeUsername.length > 0) {
      await connection.rollback();
      connection.release();
      return NextResponse.json(
        { success: false, error: "El nombre de usuario ya está registrado" },
        { status: 400 }
      );
    }

    // Verificar si el RUT ya existe
    const [existeRut] = await connection.query<RowDataPacket[]>(
      "SELECT id_usuario FROM usuarios WHERE rut = ?",
      [rut]
    );

    if (existeRut.length > 0) {
      await connection.rollback();
      connection.release();
      return NextResponse.json(
        { success: false, error: "El RUT ya está registrado en el sistema" },
        { status: 400 }
      );
    }

    // Verificar si el email ya existe
    const [existeEmail] = await connection.query<RowDataPacket[]>(
      "SELECT id_usuario FROM usuarios WHERE email = ?",
      [email]
    );

    if (existeEmail.length > 0) {
      await connection.rollback();
      connection.release();
      return NextResponse.json(
        { success: false, error: "El email ya está registrado en el sistema" },
        { status: 400 }
      );
    }

    // Hashear contraseña
    const passwordHash = await bcrypt.hash(password, 10);

    // Insertar usuario (CON TU ESTRUCTURA REAL)
    const [result] = await connection.query<ResultSetHeader>(
      `INSERT INTO usuarios (
        username, password_hash, rut, nombre, apellido_paterno, apellido_materno, 
        email, telefono, celular, fecha_nacimiento, genero, direccion, ciudad, region,
        id_centro_principal, id_sucursal_principal, foto_perfil_url,
        estado, requiere_cambio_password, autenticacion_doble_factor, 
        fecha_creacion
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'activo', ?, ?, NOW())`,
      [
        username,
        passwordHash,
        rut,
        nombre,
        apellido_paterno,
        apellido_materno || null,
        email,
        telefono || null,
        celular || null,
        fecha_nacimiento || null,
        genero || null,
        direccion || null,
        ciudad || null,
        region || null,
        id_centro_principal || null,
        id_sucursal_principal || null,
        foto_perfil_url || null,
        requiere_cambio_password ? 1 : 0,
        autenticacion_doble_factor ? 1 : 0,
      ]
    );

    const nuevoUsuarioId = result.insertId;

    // Asignar roles si se proporcionaron
    if (roles && Array.isArray(roles) && roles.length > 0) {
      for (const idRol of roles) {
        await connection.query(
          `INSERT INTO usuarios_roles (
            id_usuario, id_rol, id_centro, id_sucursal, 
            fecha_asignacion, asignado_por, activo
          ) VALUES (?, ?, ?, ?, NOW(), ?, 1)`,
          [
            nuevoUsuarioId,
            idRol,
            id_centro_principal || null,
            id_sucursal_principal || null,
            1, // ID del usuario que crea (deberías obtenerlo de la sesión)
          ]
        );
      }
    }

    // Obtener usuario creado con roles
    const [nuevoUsuario] = await connection.query<RowDataPacket[]>(
      `SELECT 
        u.*,
        GROUP_CONCAT(DISTINCT r.nombre SEPARATOR ', ') as roles_nombres,
        c.nombre as centro_nombre,
        s.nombre as sucursal_nombre
      FROM usuarios u
      LEFT JOIN usuarios_roles ur ON u.id_usuario = ur.id_usuario AND ur.activo = 1
      LEFT JOIN roles r ON ur.id_rol = r.id_rol
      LEFT JOIN centros_medicos c ON u.id_centro_principal = c.id_centro
      LEFT JOIN sucursales s ON u.id_sucursal_principal = s.id_sucursal
      WHERE u.id_usuario = ?
      GROUP BY u.id_usuario`,
      [nuevoUsuarioId]
    );

    // Registrar log
    await registrarLog({
      id_usuario: null,
      tipo: "audit",
      modulo: "usuarios",
      accion: "crear_usuario",
      descripcion: `Usuario creado: ${nombre} ${apellido_paterno} (${email})`,
      objeto_tipo: "usuario",
      objeto_id: nuevoUsuarioId.toString(),
      datos_nuevos: { ...body, password: "[OCULTO]", password_hash: "[OCULTO]" },
      ip_origen: request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown",
      agente_usuario: request.headers.get("user-agent") || "unknown",
      nivel_severidad: 5,
    });

    await connection.commit();
    connection.release();

    // Remover password del response
    const usuarioResponse = { ...nuevoUsuario[0] };
    delete usuarioResponse.password_hash;

    return NextResponse.json({
      success: true,
      message: "Usuario creado exitosamente",
      data: usuarioResponse,
    }, { status: 201 });
  } catch (error: any) {
    if (connection) {
      await connection.rollback();
      connection.release();
    }
    console.error("Error al crear usuario:", error);
    
    await registrarLog({
      tipo: "error",
      modulo: "usuarios",
      accion: "crear_usuario",
      descripcion: "Error al crear usuario",
      mensaje_error: error.message,
      exitoso: false,
      nivel_severidad: 8,
    });

    return NextResponse.json(
      { success: false, error: "Error al crear usuario", detalles: error.message },
      { status: 500 }
    );
  }
}
