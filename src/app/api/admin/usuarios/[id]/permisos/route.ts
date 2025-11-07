// frontend/src/app/api/admin/usuarios/[id]/permisos/route.ts
import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { RowDataPacket } from "mysql2";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  let connection;

  try {
    const idUsuario = parseInt(params.id);

    if (isNaN(idUsuario)) {
      return NextResponse.json(
        { success: false, error: "ID de usuario inválido" },
        { status: 400 }
      );
    }

    connection = await pool.getConnection();

    // ========== PERMISOS CONSOLIDADOS ==========
    const [permisos] = await connection.query<RowDataPacket[]>(
      `SELECT DISTINCT
        p.id_permiso,
        p.codigo,
        p.nombre,
        p.descripcion,
        p.modulo,
        p.tipo,
        p.es_critico,
        GROUP_CONCAT(DISTINCT r.nombre ORDER BY r.nivel_jerarquia DESC SEPARATOR ', ') as roles_origen
      FROM permisos p
      INNER JOIN roles_permisos rp ON p.id_permiso = rp.id_permiso
      INNER JOIN usuarios_roles ur ON rp.id_rol = ur.id_rol
      INNER JOIN roles r ON ur.id_rol = r.id_rol
      WHERE ur.id_usuario = ? AND ur.activo = 1 AND p.estado = 'activo' AND r.estado = 'activo'
      GROUP BY p.id_permiso, p.codigo, p.nombre, p.descripcion, p.modulo, p.tipo, p.es_critico
      ORDER BY p.modulo, p.tipo, p.nombre`,
      [idUsuario]
    );

    // ========== PERMISOS POR MÓDULO ==========
    const [permisosPorModulo] = await connection.query<RowDataPacket[]>(
      `SELECT 
        p.modulo,
        COUNT(DISTINCT p.id_permiso) as total_permisos,
        SUM(CASE WHEN p.tipo = 'lectura' THEN 1 ELSE 0 END) as lectura,
        SUM(CASE WHEN p.tipo = 'escritura' THEN 1 ELSE 0 END) as escritura,
        SUM(CASE WHEN p.tipo = 'eliminacion' THEN 1 ELSE 0 END) as eliminacion,
        SUM(CASE WHEN p.tipo = 'administracion' THEN 1 ELSE 0 END) as administracion,
        SUM(CASE WHEN p.es_critico = 1 THEN 1 ELSE 0 END) as criticos
      FROM permisos p
      INNER JOIN roles_permisos rp ON p.id_permiso = rp.id_permiso
      INNER JOIN usuarios_roles ur ON rp.id_rol = ur.id_rol
      WHERE ur.id_usuario = ? AND ur.activo = 1 AND p.estado = 'activo'
      GROUP BY p.modulo
      ORDER BY total_permisos DESC`,
      [idUsuario]
    );

    // ========== PERMISOS CRÍTICOS ==========
    const [permisosCriticos] = await connection.query<RowDataPacket[]>(
      `SELECT DISTINCT
        p.codigo,
        p.nombre,
        p.descripcion,
        p.modulo,
        GROUP_CONCAT(DISTINCT r.nombre SEPARATOR ', ') as roles_origen
      FROM permisos p
      INNER JOIN roles_permisos rp ON p.id_permiso = rp.id_permiso
      INNER JOIN usuarios_roles ur ON rp.id_rol = ur.id_rol
      INNER JOIN roles r ON ur.id_rol = r.id_rol
      WHERE ur.id_usuario = ? AND ur.activo = 1 AND p.es_critico = 1 AND p.estado = 'activo'
      GROUP BY p.id_permiso, p.codigo, p.nombre, p.descripcion, p.modulo
      ORDER BY p.modulo, p.nombre`,
      [idUsuario]
    );

    connection.release();

    return NextResponse.json({
      success: true,
      data: {
        permisos: permisos,
        resumen_por_modulo: permisosPorModulo,
        permisos_criticos: permisosCriticos,
        totales: {
          total_permisos: permisos.length,
          permisos_criticos: permisosCriticos.length,
          modulos: permisosPorModulo.length,
        },
      },
    });
  } catch (error: any) {
    if (connection) connection.release();
    console.error("❌ Error al obtener permisos:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Error al obtener permisos",
        detalles: error.message,
      },
      { status: 500 }
    );
  }
}
