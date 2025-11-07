// app/api/admin/roles/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getConnection } from "@/lib/db";
import { RowDataPacket, ResultSetHeader } from "mysql2/promise";

// Tipo para el rol
type RolDB = {
  id_rol: number;
  nombre: string;
  descripcion: string | null;
  nivel_jerarquia: number;
  es_predefinido: 0 | 1;
  estado: "activo" | "inactivo";
  fecha_creacion: string;
  fecha_modificacion: string;
  permisos_json?: string;
  usuarios_count?: number;
};

type Rol = {
  id_rol: number;
  codigo: string;
  nombre: string;
  descripcion: string | null;
  permisos: string[];
  activo: 0 | 1;
  orden: number;
  nivel_jerarquia: number;
  es_predefinido: 0 | 1;
  usuarios_count: number;
  created_at: string;
  updated_at: string;
};

/**
 * GET /api/admin/roles
 * Obtiene lista de roles con filtros y paginación
 */
export async function GET(request: NextRequest) {
  const conn = await getConnection();
  
  try {
    const { searchParams } = new URL(request.url);
    
    // Parámetros de paginación
    const pagina = parseInt(searchParams.get("pagina") || "1");
    const pageSize = parseInt(searchParams.get("pageSize") || "20");
    const offset = (pagina - 1) * pageSize;
    
    // Parámetros de filtro
    const q = searchParams.get("q") || "";
    const activo = searchParams.get("activo") || "";
    const modulo = searchParams.get("modulo") || "";
    const jerarquia = searchParams.get("jerarquia") || "";
    const permisos = searchParams.get("permisos") || "";
    
    // Construir query base con permisos agregados
    let query = `
      SELECT 
        r.id_rol,
        r.nombre,
        r.descripcion,
        r.nivel_jerarquia,
        r.es_predefinido,
        r.estado,
        r.fecha_creacion,
        r.fecha_modificacion,
        GROUP_CONCAT(p.codigo SEPARATOR ',') as permisos_json,
        COUNT(DISTINCT ur.id_usuario) as usuarios_count
      FROM roles r
      LEFT JOIN roles_permisos rp ON r.id_rol = rp.id_rol
      LEFT JOIN permisos p ON rp.id_permiso = p.id_permiso AND p.estado = 'activo'
      LEFT JOIN usuarios_roles ur ON r.id_rol = ur.id_rol AND ur.activo = 1
      WHERE 1=1
    `;
    
    const params: any[] = [];
    
    // Aplicar filtros
    if (q) {
      query += ` AND (r.nombre LIKE ? OR r.descripcion LIKE ?)`;
      params.push(`%${q}%`, `%${q}%`);
    }
    
    if (activo !== "") {
      const estado = activo === "1" ? "activo" : "inactivo";
      query += ` AND r.estado = ?`;
      params.push(estado);
    }
    
    if (jerarquia !== "") {
      query += ` AND r.nivel_jerarquia = ?`;
      params.push(parseInt(jerarquia));
    }
    
    // Agrupar por rol
    query += ` GROUP BY r.id_rol`;
    
    // Filtro por módulo (después del GROUP BY)
    if (modulo) {
      query = `
        SELECT * FROM (${query}) as roles_con_permisos
        WHERE permisos_json LIKE ?
      `;
      params.push(`%${modulo}%`);
    }
    
    // Filtro por permisos específicos
    if (permisos) {
      const permisosArray = permisos.split(",");
      for (const permiso of permisosArray) {
        query = `
          SELECT * FROM (${query}) as roles_filtrados
          WHERE permisos_json LIKE ?
        `;
        params.push(`%${permiso}%`);
      }
    }
    
    // Obtener total antes de paginar
    const countQuery = `SELECT COUNT(*) as total FROM (${query}) as roles_count`;
    const [countResult] = await conn.query<RowDataPacket[]>(countQuery, params);
    const total = countResult[0]?.total || 0;
    
    // Ordenar y paginar
    query += ` ORDER BY r.nivel_jerarquia ASC, r.nombre ASC LIMIT ? OFFSET ?`;
    params.push(pageSize, offset);
    
    // Ejecutar query principal
    const [rows] = await conn.query<RowDataPacket[]>(query, params);
    
    // Transformar resultados
    const items: Rol[] = (rows as RolDB[]).map((row) => ({
      id_rol: row.id_rol,
      codigo: row.nombre.toUpperCase().replace(/\s+/g, "_"),
      nombre: row.nombre,
      descripcion: row.descripcion,
      permisos: row.permisos_json ? row.permisos_json.split(",").filter(Boolean) : [],
      activo: row.estado === "activo" ? 1 : 0,
      orden: row.nivel_jerarquia * 100 + row.id_rol,
      nivel_jerarquia: row.nivel_jerarquia,
      es_predefinido: row.es_predefinido,
      usuarios_count: row.usuarios_count || 0,
      created_at: row.fecha_creacion,
      updated_at: row.fecha_modificacion,
    }));
    
    return NextResponse.json({
      success: true,
      items,
      total,
      pagina,
      pageSize,
      totalPaginas: Math.ceil(total / pageSize),
    });
    
  } catch (error: any) {
    console.error("Error en GET /api/admin/roles:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Error al obtener roles" },
      { status: 500 }
    );
  } finally {
    conn.release();
  }
}

/**
 * POST /api/admin/roles
 * Crea un nuevo rol
 */
export async function POST(request: NextRequest) {
  const conn = await getConnection();
  
  try {
    const body = await request.json();
    const { codigo, nombre, descripcion, activo, orden, nivel_jerarquia, permisos } = body;
    
    // Validaciones
    if (!codigo || !nombre) {
      return NextResponse.json(
        { success: false, error: "Código y nombre son requeridos" },
        { status: 400 }
      );
    }
    
    await conn.beginTransaction();
    
    // Verificar que el nombre no exista
    const [existente] = await conn.query<RowDataPacket[]>(
      "SELECT id_rol FROM roles WHERE nombre = ?",
      [nombre]
    );
    
    if (existente.length > 0) {
      await conn.rollback();
      return NextResponse.json(
        { success: false, error: "Ya existe un rol con ese nombre" },
        { status: 400 }
      );
    }
    
    // Insertar el rol
    const estado = activo === 1 || activo === true ? "activo" : "inactivo";
    const [result] = await conn.query<ResultSetHeader>(
      `INSERT INTO roles (nombre, descripcion, nivel_jerarquia, es_predefinido, estado)
       VALUES (?, ?, ?, 0, ?)`,
      [nombre, descripcion || null, nivel_jerarquia || 3, estado]
    );
    
    const id_rol = result.insertId;
    
    // Insertar permisos si existen
    if (permisos && Array.isArray(permisos) && permisos.length > 0) {
      // Obtener IDs de permisos por código
      const placeholders = permisos.map(() => "?").join(",");
      const [permisosDB] = await conn.query<RowDataPacket[]>(
        `SELECT id_permiso, codigo FROM permisos WHERE codigo IN (${placeholders}) AND estado = 'activo'`,
        permisos
      );
      
      // Insertar relaciones
      if (permisosDB.length > 0) {
        const values = permisosDB.map((p: any) => [id_rol, p.id_permiso]);
        await conn.query(
          "INSERT INTO roles_permisos (id_rol, id_permiso) VALUES ?",
          [values]
        );
      }
    }
    
    await conn.commit();
    
    // Obtener el rol creado con sus permisos
    const [rolesCreado] = await conn.query<RowDataPacket[]>(
      `SELECT 
        r.*,
        GROUP_CONCAT(p.codigo SEPARATOR ',') as permisos_json
       FROM roles r
       LEFT JOIN roles_permisos rp ON r.id_rol = rp.id_rol
       LEFT JOIN permisos p ON rp.id_permiso = p.id_permiso
       WHERE r.id_rol = ?
       GROUP BY r.id_rol`,
      [id_rol]
    );
    
    const rolCreado = rolesCreado[0] as RolDB;
    
    return NextResponse.json({
      success: true,
      message: "Rol creado exitosamente",
      rol: {
        id_rol: rolCreado.id_rol,
        codigo: rolCreado.nombre.toUpperCase().replace(/\s+/g, "_"),
        nombre: rolCreado.nombre,
        descripcion: rolCreado.descripcion,
        permisos: rolCreado.permisos_json ? rolCreado.permisos_json.split(",") : [],
        activo: rolCreado.estado === "activo" ? 1 : 0,
        nivel_jerarquia: rolCreado.nivel_jerarquia,
        es_predefinido: rolCreado.es_predefinido,
      },
    });
    
  } catch (error: any) {
    await conn.rollback();
    console.error("Error en POST /api/admin/roles:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Error al crear rol" },
      { status: 500 }
    );
  } finally {
    conn.release();
  }
}