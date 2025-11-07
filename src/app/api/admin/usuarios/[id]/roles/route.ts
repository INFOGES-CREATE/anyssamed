// frontend/src/app/api/admin/usuarios/[id]/roles/route.ts
import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { RowDataPacket, ResultSetHeader } from "mysql2";
import { registrarLog } from "@/lib/logs";

export const dynamic = "force-dynamic"; // evita caching en app router

interface AsignarRolBody {
  id_rol: number;
  id_centro?: number | null;
  id_sucursal?: number | null;
}

interface RemoverRolBody {
  id_rol: number;
}

function obtenerIP(request: NextRequest): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}

function obtenerUserAgent(request: NextRequest): string {
  return request.headers.get("user-agent") || "unknown";
}

// ========== GET - ROLES DEL USUARIO + CATÁLOGO DE ROLES ACTIVOS ==========
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  let connection;
  try {
    const idUsuario = parseInt(params.id, 10);
    if (Number.isNaN(idUsuario)) {
      return NextResponse.json(
        { success: false, error: "ID de usuario inválido" },
        { status: 400 }
      );
    }

    connection = await pool.getConnection();

    // Roles asignados (histórico + meta)
    const [rolesAsignados] = await connection.query<RowDataPacket[]>(
      `SELECT 
        r.id_rol,
        r.nombre,
        r.descripcion,
        r.nivel_jerarquia,
        r.es_predefinido,
        r.estado AS rol_estado,
        ur.fecha_asignacion,
        ur.id_centro,
        ur.id_sucursal,
        ur.asignado_por,
        ur.activo,
        c.nombre AS centro_nombre,
        s.nombre AS sucursal_nombre,
        CONCAT(ua.nombre, ' ', ua.apellido_paterno) AS asignado_por_nombre,
        (SELECT COUNT(*) FROM roles_permisos WHERE id_rol = r.id_rol) AS total_permisos
      FROM usuarios_roles ur
      INNER JOIN roles r ON ur.id_rol = r.id_rol
      LEFT JOIN centros_medicos c ON ur.id_centro = c.id_centro
      LEFT JOIN sucursales s ON ur.id_sucursal = s.id_sucursal
      LEFT JOIN usuarios ua ON ur.asignado_por = ua.id_usuario
      WHERE ur.id_usuario = ?
      ORDER BY r.nivel_jerarquia DESC, ur.fecha_asignacion DESC`,
      [idUsuario]
    );

    // Catálogo de roles activos (para poblar la grilla de checkboxes)
    const [catalogo] = await connection.query<RowDataPacket[]>(
      `SELECT 
        r.id_rol,
        r.nombre,
        r.descripcion,
        r.nivel_jerarquia,
        r.es_predefinido,
        r.estado
      FROM roles r
      WHERE r.estado = 'activo'
      ORDER BY r.nivel_jerarquia DESC, r.nombre ASC`
    );

    connection.release();

    const asignadosActivosIds = rolesAsignados
      .filter((r: any) => r.activo === 1)
      .map((r: any) => r.id_rol);

    return NextResponse.json({
      success: true,
      data: {
        // para la UI:
        catalogo,                 // <-- úsalo para roles.map(...)
        asignados_ids: asignadosActivosIds, // <-- para marcar checks
        // info extendida (si quieres mostrar historial/meta):
        roles_asignados: rolesAsignados,
        total_asignados: rolesAsignados.length,
        roles_activos_asignados: asignadosActivosIds.length,
      },
    });
  } catch (error: any) {
    if (connection) connection.release();
    console.error("❌ Error al obtener roles:", error);
    return NextResponse.json(
      { success: false, error: "Error al obtener roles", detalles: error.message },
      { status: 500 }
    );
  }
}

// ========== POST - ASIGNAR NUEVO ROL ==========
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  let connection;
  try {
    const idUsuario = parseInt(params.id, 10);
    if (Number.isNaN(idUsuario)) {
      return NextResponse.json(
        { success: false, error: "ID de usuario inválido" },
        { status: 400 }
      );
    }

    const body: AsignarRolBody = await request.json();
    const { id_rol, id_centro = null, id_sucursal = null } = body;

    if (!id_rol) {
      return NextResponse.json(
        { success: false, error: "El ID del rol es obligatorio" },
        { status: 400 }
      );
    }

    connection = await pool.getConnection();
    await connection.beginTransaction();

    const [usuarios] = await connection.query<RowDataPacket[]>(
      "SELECT id_usuario, nombre, apellido_paterno FROM usuarios WHERE id_usuario = ?",
      [idUsuario]
    );
    if (usuarios.length === 0) {
      await connection.rollback(); connection.release();
      return NextResponse.json({ success: false, error: "Usuario no encontrado" }, { status: 404 });
    }
    const usuario = usuarios[0];

    const [roles] = await connection.query<RowDataPacket[]>(
      "SELECT id_rol, nombre, descripcion FROM roles WHERE id_rol = ? AND estado = 'activo'",
      [id_rol]
    );
    if (roles.length === 0) {
      await connection.rollback(); connection.release();
      return NextResponse.json({ success: false, error: "El rol no existe o no está activo" }, { status: 404 });
    }
    const rol = roles[0];

    const [existeRelacion] = await connection.query<RowDataPacket[]>(
      "SELECT id_usuario, id_rol, activo FROM usuarios_roles WHERE id_usuario = ? AND id_rol = ?",
      [idUsuario, id_rol]
    );

    if (existeRelacion.length > 0) {
      if (existeRelacion[0].activo === 1) {
        await connection.rollback(); connection.release();
        return NextResponse.json(
          { success: false, error: "El usuario ya tiene este rol asignado y activo" },
          { status: 400 }
        );
      } else {
        await connection.query<ResultSetHeader>(
          "UPDATE usuarios_roles SET activo = 1, fecha_asignacion = NOW(), id_centro = ?, id_sucursal = ? WHERE id_usuario = ? AND id_rol = ?",
          [id_centro, id_sucursal, idUsuario, id_rol]
        );
      }
    } else {
      await connection.query<ResultSetHeader>(
        `INSERT INTO usuarios_roles (
          id_usuario, id_rol, id_centro, id_sucursal,
          fecha_asignacion, asignado_por, activo
        ) VALUES (?, ?, ?, ?, NOW(), ?, 1)`,
        [idUsuario, id_rol, id_centro, id_sucursal, 1] // TODO: admin real
      );
    }

    await registrarLog({
      id_usuario: 1, // TODO: admin de sesión
      tipo: "audit",
      modulo: "usuarios",
      accion: "asignar_rol",
      descripcion: `Rol "${rol.nombre}" asignado a ${usuario.nombre} ${usuario.apellido_paterno}`,
      objeto_tipo: "usuario_rol",
      objeto_id: `${idUsuario}-${id_rol}`,
      datos_nuevos: { id_rol, id_centro, id_sucursal },
      ip_origen: obtenerIP(request),
      agente_usuario: obtenerUserAgent(request),
      nivel_severidad: 5,
    });

    await connection.commit();
    connection.release();

    return NextResponse.json({
      success: true,
      message: "Rol asignado exitosamente",
      data: { id_usuario: idUsuario, id_rol, nombre_rol: rol.nombre },
    });
  } catch (error: any) {
    if (connection) { await connection.rollback(); connection.release(); }
    console.error("❌ Error al asignar rol:", error);
    return NextResponse.json(
      { success: false, error: "Error al asignar rol", detalles: error.message },
      { status: 500 }
    );
  }
}

// ========== DELETE - REMOVER ROL ==========
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  let connection;
  try {
    const idUsuario = parseInt(params.id, 10);
    if (Number.isNaN(idUsuario)) {
      return NextResponse.json(
        { success: false, error: "ID de usuario inválido" },
        { status: 400 }
      );
    }

    const body: RemoverRolBody = await request.json();
    const { id_rol } = body;

    if (!id_rol) {
      return NextResponse.json(
        { success: false, error: "El ID del rol es obligatorio" },
        { status: 400 }
      );
    }

    connection = await pool.getConnection();
    await connection.beginTransaction();

    const [relacion] = await connection.query<RowDataPacket[]>(
      `SELECT ur.*, r.nombre AS rol_nombre, u.nombre AS usuario_nombre, u.apellido_paterno
       FROM usuarios_roles ur
       INNER JOIN roles r ON ur.id_rol = r.id_rol
       INNER JOIN usuarios u ON ur.id_usuario = u.id_usuario
       WHERE ur.id_usuario = ? AND ur.id_rol = ?`,
      [idUsuario, id_rol]
    );

    if (relacion.length === 0) {
      await connection.rollback(); connection.release();
      return NextResponse.json(
        { success: false, error: "El usuario no tiene este rol asignado" },
        { status: 404 }
      );
    }

    const rel = relacion[0];

    await connection.query<ResultSetHeader>(
      "UPDATE usuarios_roles SET activo = 0 WHERE id_usuario = ? AND id_rol = ?",
      [idUsuario, id_rol]
    );

    await registrarLog({
      id_usuario: 1, // TODO: admin de sesión
      tipo: "audit",
      modulo: "usuarios",
      accion: "remover_rol",
      descripcion: `Rol "${rel.rol_nombre}" removido de ${rel.usuario_nombre} ${rel.apellido_paterno}`,
      objeto_tipo: "usuario_rol",
      objeto_id: `${idUsuario}-${id_rol}`,
      datos_antiguos: rel,
      ip_origen: obtenerIP(request),
      agente_usuario: obtenerUserAgent(request),
      nivel_severidad: 5,
    });

    await connection.commit();
    connection.release();

    return NextResponse.json({
      success: true,
      message: "Rol removido exitosamente",
      data: { id_usuario: idUsuario, id_rol, nombre_rol: rel.rol_nombre },
    });
  } catch (error: any) {
    if (connection) { await connection.rollback(); connection.release(); }
    console.error("❌ Error al remover rol:", error);
    return NextResponse.json(
      { success: false, error: "Error al remover rol", detalles: error.message },
      { status: 500 }
    );
  }
}
