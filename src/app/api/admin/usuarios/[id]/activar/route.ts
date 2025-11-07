// frontend/src/app/api/admin/usuarios/[id]/activar/route.ts
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

    if (usuario[0].estado === "activo") {
      connection.release();
      return NextResponse.json(
        { success: false, error: "El usuario ya está activo" },
        { status: 400 }
      );
    }

    // Activar usuario
    await connection.query(
      `UPDATE usuarios SET
        estado = 'activo',
        bloqueado_hasta = NULL,
        intentos_fallidos = 0,
        fecha_modificacion = NOW()
      WHERE id_usuario = ?`,
      [params.id]
    );

    // Registrar log
    await registrarLog({
      id_usuario: null,
      tipo: "audit",
      modulo: "usuarios",
      accion: "activar_usuario",
      descripcion: `Usuario activado: ${usuario[0].nombre} ${usuario[0].apellido_paterno}`,
      objeto_tipo: "usuario",
      objeto_id: params.id,
      datos_antiguos: { 
        estado: usuario[0].estado,
        bloqueado_hasta: usuario[0].bloqueado_hasta 
      },
      datos_nuevos: { estado: "activo" },
      ip_origen: request.headers.get("x-forwarded-for") || "unknown",
      agente_usuario: request.headers.get("user-agent") || "unknown",
      nivel_severidad: 5,
    });

    connection.release();

    return NextResponse.json({
      success: true,
      message: "Usuario activado exitosamente",
    });
  } catch (error: any) {
    if (connection) connection.release();
    console.error("Error al activar usuario:", error);
    return NextResponse.json(
      { success: false, error: "Error al activar usuario" },
      { status: 500 }
    );
  }
}
