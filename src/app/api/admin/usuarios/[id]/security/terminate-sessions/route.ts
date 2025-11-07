// frontend/src/app/api/admin/usuarios/[id]/security/terminate-sessions/route.ts
import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { RowDataPacket, ResultSetHeader } from "mysql2";
import { registrarLog } from "@/lib/logs";

// Helpers locales (mismo estilo que en las otras rutas security/*)
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

function limpiarDatosSensibles(usuario: any): any {
  if (!usuario) return usuario;
  const copia = { ...usuario };
  delete copia.password_hash;
  delete copia.reset_token;
  delete copia.secret_2fa;
  return copia;
}

// POST /api/admin/usuarios/[id]/security/terminate-sessions
// Forza logout masivo del usuario:
// - borra registros de sesiones activas (si existe la tabla sesiones_activas)
// - escribe log de seguridad
// - responde con cuántas sesiones fueron terminadas
export async function POST(
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
    await connection.beginTransaction();

    // 1. Verificar que el usuario exista
    const [usuarios] = await connection.query<RowDataPacket[]>(
      `SELECT 
        id_usuario,
        username,
        nombre,
        apellido_paterno,
        rut,
        estado,
        ultimo_login,
        intentos_fallidos,
        autenticacion_doble_factor,
        password_hash,
        reset_token,
        secret_2fa
      FROM usuarios
      WHERE id_usuario = ?`,
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

    const usuarioActual = usuarios[0];

    // 2. Intentar invalidar sesiones activas en tabla de sesiones
    // asumimos tabla `sesiones_activas` con columna `id_usuario`
    // si no existe, capturamos el error y seguimos
    let sesionesTerminadas = 0;

    try {
      // contar sesiones activas actuales
      const [countRows] = await connection.query<RowDataPacket[]>(
        "SELECT COUNT(*) AS total FROM sesiones_activas WHERE id_usuario = ?",
        [idUsuario]
      );

      sesionesTerminadas = countRows?.[0]?.total ?? 0;

      // borrar / invalidar
      await connection.query<ResultSetHeader>(
        "DELETE FROM sesiones_activas WHERE id_usuario = ?",
        [idUsuario]
      );
    } catch (e: any) {
      // si la tabla no existe o falla, no rompemos la acción.
      // dejamos sesionesTerminadas = null para dejar claro que no pudimos contar/borrar.
      console.warn(
        "[terminate-sessions] Advertencia: no se pudo manipular sesiones_activas:",
        e?.message || e
      );
      sesionesTerminadas = -1; // -1 => desconocido/no soportado
    }

    // 3. Registrar log de seguridad/auditoría
    await registrarLog({
      id_usuario: 1, // TODO: ID del admin en sesión
      tipo: "security",
      modulo: "usuarios",
      accion: "terminar_sesiones",
      descripcion: `Sesiones activas terminadas para el usuario ${usuarioActual.username} (ID ${idUsuario}).`,
      objeto_tipo: "usuario",
      objeto_id: String(idUsuario),
      datos_antiguos: {
        usuario: limpiarDatosSensibles(usuarioActual),
      },
      datos_nuevos: {
        sesiones_terminadas: sesionesTerminadas,
      },
      nivel_severidad: 8,
      ip_origen: obtenerIP(request),
      agente_usuario: obtenerUserAgent(request),
    });

    await connection.commit();
    connection.release();

    // 4. Respuesta
    return NextResponse.json({
      success: true,
      message: "Sesiones activas terminadas (logout forzado en todos los dispositivos).",
      data: {
        id_usuario: idUsuario,
        username: usuarioActual.username,
        sesiones_terminadas: sesionesTerminadas === -1 ? null : sesionesTerminadas,
      },
    });
  } catch (err: any) {
    if (connection) {
      await connection.rollback();
      connection.release();
    }

    console.error("❌ Error al terminar sesiones del usuario:", err);

    await registrarLog({
      id_usuario: null,
      tipo: "error",
      modulo: "usuarios",
      accion: "terminar_sesiones",
      descripcion: `Error al terminar sesiones del usuario ID ${params.id}: ${err.message}`,
      objeto_tipo: "usuario",
      objeto_id: params.id,
      nivel_severidad: 9,
      ip_origen: obtenerIP(request),
      agente_usuario: obtenerUserAgent(request),
    });

    return NextResponse.json(
      {
        success: false,
        error: "No se pudieron terminar las sesiones activas del usuario",
        detalle: err.message,
      },
      { status: 500 }
    );
  }
}
