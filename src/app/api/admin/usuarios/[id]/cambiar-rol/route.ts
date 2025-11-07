// frontend/src/app/api/admin/usuarios/[id]/cambiar-rol/route.ts
import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { RowDataPacket } from "mysql2";
import { registrarLog } from "@/lib/logs";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  let connection;

  try {
    const body = await request.json();
    const { id_rol, motivo } = body;

    if (!id_rol) {
      return NextResponse.json(
        { success: false, error: "Debe especificar un rol" },
        { status: 400 }
      );
    }

    connection = await pool.getConnection();

    // Obtener usuario
    const [usuario] = await connection.query<RowDataPacket[]>(
      "SELECT * FROM usuarios WHERE id_usuario = ?",
      [params.id]
    );

    if (usuario.length === 0) {
      connection.release();
      return NextResponse.json(
        { success: false, error: "Usuario no encontrado" },
        { status: 404 }
      );
    }

    // Verificar que el rol existe
    const [rol] = await connection.query<RowDataPacket[]>(
      "SELECT * FROM roles WHERE id_rol = ?",
      [id_rol]
    );

    if (rol.length === 0) {
      connection.release();
      return NextResponse.json(
        { success: false, error: "Rol no encontrado" },
        { status: 404 }
      );
    }

    const rolAntiguo = usuario[0].id_rol;

    // Actualizar rol
    await connection.query(
      `UPDATE usuarios SET
        id_rol = ?,
        fecha_modificacion = NOW()
      WHERE id_usuario = ?`,
      [id_rol, params.id]
    );

    // Registrar en tabla de auditoría de roles
    await connection.query(
      `INSERT INTO usuarios_roles (id_usuario, id_rol, fecha_asignacion)
       VALUES (?, ?, NOW())
       ON DUPLICATE KEY UPDATE fecha_asignacion = NOW()`,
      [params.id, id_rol]
    );

    // Registrar log
    await registrarLog({
      id_usuario: null,
      tipo: "security",
      modulo: "usuarios",
      accion: "cambiar_rol",
      descripcion: `Rol cambiado para ${usuario[0].nombre} ${usuario[0].apellido_paterno}: ${rol[0].nombre_rol}. Motivo: ${motivo || "No especificado"}`,
      objeto_tipo: "usuario",
      objeto_id: params.id,
      datos_antiguos: { id_rol: rolAntiguo },
      datos_nuevos: { id_rol, motivo },
      ip_origen: request.headers.get("x-forwarded-for") || "unknown",
      agente_usuario: request.headers.get("user-agent") || "unknown",
      nivel_severidad: 7,
    });

    connection.release();

    return NextResponse.json({
      success: true,
      message: "Rol actualizado exitosamente",
      data: {
        rol_anterior: rolAntiguo,
        rol_nuevo: id_rol,
        nombre_rol: rol[0].nombre_rol,
      },
    });
  } catch (error: any) {
    if (connection) connection.release();
    console.error("Error al cambiar rol:", error);
    return NextResponse.json(
      { success: false, error: "Error al cambiar rol" },
      { status: 500 }
    );
  }
}
