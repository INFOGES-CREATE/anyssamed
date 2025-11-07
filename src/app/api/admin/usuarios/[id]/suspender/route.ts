// frontend/src/app/api/admin/usuarios/[id]/suspender/route.ts
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
    const { motivo, duracion_dias } = body;

    if (!motivo) {
      return NextResponse.json(
        { success: false, error: "Debe especificar un motivo para la suspensión" },
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

    if (usuario[0].estado === "bloqueado") {
      connection.release();
      return NextResponse.json(
        { success: false, error: "El usuario ya está suspendido" },
        { status: 400 }
      );
    }

    // Calcular fecha de bloqueo
    const bloqueadoHasta = duracion_dias
      ? new Date(Date.now() + duracion_dias * 24 * 60 * 60 * 1000)
      : null;

    // Suspender usuario
    await connection.query(
      `UPDATE usuarios SET
        estado = 'bloqueado',
        bloqueado_hasta = ?,
        fecha_modificacion = NOW()
      WHERE id_usuario = ?`,
      [bloqueadoHasta, params.id]
    );

    // Cerrar todas las sesiones activas
    await connection.query(
      "UPDATE sesiones_usuario SET activa = 0 WHERE id_usuario = ?",
      [params.id]
    );

    // Cancelar citas futuras
    await connection.query(
      `UPDATE citas SET 
        estado = 'cancelada',
        motivo_cancelacion = 'Usuario suspendido'
      WHERE (id_medico = ? OR id_paciente = ?) 
      AND fecha_hora > NOW() 
      AND estado IN ('programada', 'confirmada')`,
      [params.id, params.id]
    );

    // Registrar log
    await registrarLog({
      id_usuario: null,
      tipo: "security",
      modulo: "usuarios",
      accion: "suspender_usuario",
      descripcion: `Usuario suspendido: ${usuario[0].nombre} ${usuario[0].apellido_paterno}. Motivo: ${motivo}`,
      objeto_tipo: "usuario",
      objeto_id: params.id,
      datos_antiguos: { estado: usuario[0].estado },
      datos_nuevos: { 
        estado: "bloqueado", 
        bloqueado_hasta: bloqueadoHasta, 
        motivo,
        duracion_dias 
      },
      ip_origen: request.headers.get("x-forwarded-for") || "unknown",
      agente_usuario: request.headers.get("user-agent") || "unknown",
      nivel_severidad: 7,
    });

    connection.release();

    return NextResponse.json({
      success: true,
      message: "Usuario suspendido exitosamente",
      data: {
        bloqueado_hasta: bloqueadoHasta,
        citas_canceladas: true,
      },
    });
  } catch (error: any) {
    if (connection) connection.release();
    console.error("Error al suspender usuario:", error);
    return NextResponse.json(
      { success: false, error: "Error al suspender usuario" },
      { status: 500 }
    );
  }
}
