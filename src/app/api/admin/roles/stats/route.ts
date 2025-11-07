// app/api/admin/roles/stats/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getConnection } from "@/lib/db";
import { RowDataPacket } from "mysql2/promise";

/**
 * GET /api/admin/roles/stats
 * Obtiene estadísticas generales de roles y permisos
 */
export async function GET(request: NextRequest) {
  const conn = await getConnection();
  
  try {
    // Total de roles
    const [totalRoles] = await conn.query<RowDataPacket[]>(
      "SELECT COUNT(*) as total FROM roles"
    );
    
    // Roles activos
    const [rolesActivos] = await conn.query<RowDataPacket[]>(
      "SELECT COUNT(*) as total FROM roles WHERE estado = 'activo'"
    );
    
    // Roles inactivos
    const [rolesInactivos] = await conn.query<RowDataPacket[]>(
      "SELECT COUNT(*) as total FROM roles WHERE estado = 'inactivo'"
    );
    
    // Total de permisos
    const [totalPermisos] = await conn.query<RowDataPacket[]>(
      "SELECT COUNT(*) as total FROM permisos WHERE estado = 'activo'"
    );
    
    // Permisos críticos
    const [permisosCriticos] = await conn.query<RowDataPacket[]>(
      "SELECT COUNT(*) as total FROM permisos WHERE es_critico = 1 AND estado = 'activo'"
    );
    
    // Total de usuarios con roles
    const [totalUsuarios] = await conn.query<RowDataPacket[]>(
      "SELECT COUNT(DISTINCT id_usuario) as total FROM usuarios_roles WHERE activo = 1"
    );
    
    // Roles por nivel de jerarquía
    const [rolesPorNivel] = await conn.query<RowDataPacket[]>(
      `SELECT 
        nivel_jerarquia,
        COUNT(*) as cantidad,
        SUM(CASE WHEN estado = 'activo' THEN 1 ELSE 0 END) as activos
       FROM roles
       GROUP BY nivel_jerarquia
       ORDER BY nivel_jerarquia`
    );
    
    // Top roles por usuarios
    const [topRoles] = await conn.query<RowDataPacket[]>(
      `SELECT 
        r.nombre,
        COUNT(ur.id_usuario) as usuarios
       FROM roles r
       LEFT JOIN usuarios_roles ur ON r.id_rol = ur.id_rol AND ur.activo = 1
       GROUP BY r.id_rol
       ORDER BY usuarios DESC
       LIMIT 10`
    );
    
    // Distribución de permisos por módulo
    const [permisosPorModulo] = await conn.query<RowDataPacket[]>(
      `SELECT 
        modulo,
        COUNT(*) as cantidad,
        SUM(CASE WHEN es_critico = 1 THEN 1 ELSE 0 END) as criticos
       FROM permisos
       WHERE estado = 'activo'
       GROUP BY modulo
       ORDER BY cantidad DESC`
    );
    
    // Roles sin usuarios asignados
    const [rolesSinUsuarios] = await conn.query<RowDataPacket[]>(
      `SELECT COUNT(*) as total
       FROM roles r
       LEFT JOIN usuarios_roles ur ON r.id_rol = ur.id_rol AND ur.activo = 1
       WHERE ur.id_usuario IS NULL`
    );
    
    return NextResponse.json({
      success: true,
      stats: {
        total_roles: totalRoles[0].total,
        roles_activos: rolesActivos[0].total,
        roles_inactivos: rolesInactivos[0].total,
        total_permisos: totalPermisos[0].total,
        permisos_criticos: permisosCriticos[0].total,
        total_usuarios: totalUsuarios[0].total,
        roles_sin_usuarios: rolesSinUsuarios[0].total,
        roles_por_nivel: rolesPorNivel,
        top_roles: topRoles,
        permisos_por_modulo: permisosPorModulo,
      },
    });
    
  } catch (error: any) {
    console.error("Error en GET /api/admin/roles/stats:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Error al obtener estadísticas" },
      { status: 500 }
    );
  } finally {
    conn.release();
  }
}