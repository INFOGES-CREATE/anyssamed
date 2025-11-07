// frontend/src/app/api/admin/usuarios/[id]/estado/route.ts
import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { RowDataPacket, ResultSetHeader } from "mysql2";
import { registrarLog } from "@/lib/logs";

interface CambiarEstadoBody {
  estado: "activo" | "inactivo" | "bloqueado" | "pendiente_activacion";
  motivo?: string;
  bloqueado_hasta?: string; // Para bloqueos temporales
}

function obtenerIP(request: NextRequest): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0] ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}

function obtenerUserAgent(request: NextRequest): string {
  return request.headers.get("user-agent") || "unknown";
}

export async function PUT(
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

    const body: CambiarEstadoBody = await request.json();
    const { estado, motivo, bloqueado_hasta } = body;

    // Validar estado
    const estadosValidos = ["activo", "inactivo", "bloqueado", "pendiente_activacion"];
    if (!estado || !estadosValidos.includes(estado)) {
      return NextResponse.json(
        {
          success: false,
          error: "Estado inválido",
          estados_validos: estadosValidos,
        },
        { status: 400 }
      );
    }

    connection = await pool.getConnection();
    await connection.beginTransaction();

    // Obtener datos actuales
    const [usuarios] = await connection.query<RowDataPacket[]>(
      "SELECT id_usuario, username, nombre, apellido_paterno, estado FROM usuarios WHERE id_usuario = ?",
      [idUsuario]
    );

    if (usuarios.length === 0) {
      await connection.rollback();
      connection.release();
      return NextResponse.json(
        { success: false, error: "Usuario no encontrado" },
        { status: 404 }
      );
    }

    const usuario = usuarios[0];
    const estadoAnterior = usuario.estado;

    // No hacer nada si el estado es el mismo
    if (estadoAnterior === estado) {
      connection.release();
      return NextResponse.json({
        success: true,
        message: "El usuario ya tiene ese estado",
        data: { estado_actual: estado },
      });
    }

    // Actualizar estado
    const updateQuery =
      estado === "bloqueado" && bloqueado_hasta
        ? `UPDATE usuarios SET estado = ?, bloqueado_hasta = ?, fecha_modificacion = NOW() WHERE id_usuario = ?`
        : `UPDATE usuarios SET estado = ?, bloqueado_hasta = NULL, fecha_modificacion = NOW() WHERE id_usuario = ?`;

    const updateParams =
      estado === "bloqueado" && bloqueado_hasta
        ? [estado, bloqueado_hasta, idUsuario]
        : [estado, idUsuario];

    await connection.query<ResultSetHeader>(updateQuery, updateParams);

    // Si se activa, resetear intentos fallidos
    if (estado === "activo") {
      await connection.query<ResultSetHeader>(
        "UPDATE usuarios SET intentos_fallidos = 0, bloqueado_hasta = NULL WHERE id_usuario = ?",
        [idUsuario]
      );
    }

    // Registrar log
    const accion =
      estado === "bloqueado"
        ? "bloquear_usuario"
        : estado === "activo"
        ? "activar_usuario"
        : estado === "inactivo"
        ? "desactivar_usuario"
        : "cambiar_estado_usuario";

    await registrarLog({
      id_usuario: 1, // TODO: Obtener de sesión
      tipo: estado === "bloqueado" ? "security" : "audit",
      modulo: "usuarios",
      accion: accion,
      descripcion: `Estado de usuario cambiado de "${estadoAnterior}" a "${estado}". Usuario: ${usuario.nombre} ${usuario.apellido_paterno}${
        motivo ? `. Motivo: ${motivo}` : ""
      }`,
      objeto_tipo: "usuario",
      objeto_id: idUsuario.toString(),
      datos_antiguos: { estado: estadoAnterior },
      datos_nuevos: { estado, motivo, bloqueado_hasta },
      ip_origen: obtenerIP(request),
      agente_usuario: obtenerUserAgent(request),
      nivel_severidad: estado === "bloqueado" ? 8 : 5,
    });

    await connection.commit();
    connection.release();

    return NextResponse.json({
      success: true,
      message: `Estado del usuario cambiado exitosamente a "${estado}"`,
      data: {
        id_usuario: idUsuario,
        estado_anterior: estadoAnterior,
        estado_nuevo: estado,
        bloqueado_hasta: bloqueado_hasta || null,
        motivo: motivo || null,
      },
    });
  } catch (error: any) {
    if (connection) {
      await connection.rollback();
      connection.release();
    }
    console.error("❌ Error al cambiar estado:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Error al cambiar estado del usuario",
        detalles: error.message,
      },
      { status: 500 }
    );
  }
}
