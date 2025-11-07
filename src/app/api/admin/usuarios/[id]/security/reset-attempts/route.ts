// frontend/src/app/api/admin/usuarios/[id]/security/reset-attempts/route.ts
import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { RowDataPacket, ResultSetHeader } from "mysql2";
import { registrarLog } from "@/lib/logs";

// ─────────────────────────────────────────────
// helpers locales (mismos que usamos en enable-2fa / reset-password-token)
// ─────────────────────────────────────────────
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

// limpiamos datos sensibles antes de loggear o responder
function limpiarDatosSensibles(usuario: any): any {
  if (!usuario) return usuario;
  const copia = { ...usuario };
  delete copia.password_hash;
  delete copia.reset_token;
  delete copia.secret_2fa;
  return copia;
}

// ─────────────────────────────────────────────
// POST /api/admin/usuarios/[id]/security/reset-attempts
//  - Resetea intentos_fallidos = 0
//  - Si el usuario estaba 'bloqueado', lo pasamos a 'activo' (puedes quitar eso si no quieres desbloquearlo automáticamente)
// ─────────────────────────────────────────────
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

    // 1. Traer info actual del usuario
    const [rows] = await connection.query<RowDataPacket[]>(
      `SELECT 
        id_usuario,
        username,
        nombre,
        apellido_paterno,
        rut,
        estado,
        intentos_fallidos,
        autenticacion_doble_factor,
        ultimo_login,
        password_hash,
        reset_token,
        secret_2fa
      FROM usuarios
      WHERE id_usuario = ?`,
      [idUsuario]
    );

    if (rows.length === 0) {
      await connection.rollback();
      connection.release();
      return NextResponse.json(
        { success: false, error: "Usuario no encontrado" },
        { status: 404 }
      );
    }

    const usuarioActual = rows[0];

    // 2. Calcular nuevo estado:
    //    Si estaba 'bloqueado', lo pasamos a 'activo' al resetear intentos.
    //    Puedes comentar esta lógica si NO quieres que se desbloquee solo.
    const nuevoEstado =
      usuarioActual.estado === "bloqueado"
        ? "activo"
        : usuarioActual.estado;

    // 3. Actualizar usuario
    await connection.query<ResultSetHeader>(
      `UPDATE usuarios
       SET intentos_fallidos = 0,
           estado = ?,
           fecha_modificacion = NOW()
       WHERE id_usuario = ?`,
      [nuevoEstado, idUsuario]
    );

    // 4. Traer datos ya actualizados para respuesta
    const [rowsUpdated] = await connection.query<RowDataPacket[]>(
      `SELECT 
        id_usuario,
        username,
        nombre,
        apellido_paterno,
        rut,
        estado,
        intentos_fallidos,
        autenticacion_doble_factor,
        ultimo_login,
        fecha_modificacion
      FROM usuarios
      WHERE id_usuario = ?`,
      [idUsuario]
    );

    const usuarioActualizado = rowsUpdated[0];

    // 5. Log de auditoría / seguridad
    await registrarLog({
      id_usuario: 1, // TODO: reemplazar con el admin autenticado en sesión
      tipo: "security",
      modulo: "usuarios",
      accion: "reset_intentos_login",
      descripcion: `Se reseteó el contador de intentos fallidos y se reactivó acceso si estaba bloqueado. Usuario afectado: ${usuarioActual.username} (ID ${idUsuario})`,
      objeto_tipo: "usuario",
      objeto_id: String(idUsuario),
      datos_antiguos: limpiarDatosSensibles(usuarioActual),
      datos_nuevos: limpiarDatosSensibles(usuarioActualizado),
      nivel_severidad: 6,
      ip_origen: obtenerIP(request),
      agente_usuario: obtenerUserAgent(request),
    });

    await connection.commit();
    connection.release();

    return NextResponse.json({
      success: true,
      message: "Intentos fallidos reseteados correctamente",
      data: usuarioActualizado,
    });
  } catch (err: any) {
    if (connection) {
      await connection.rollback();
      connection.release();
    }

    console.error("❌ Error al resetear intentos fallidos:", err);

    await registrarLog({
      id_usuario: null,
      tipo: "error",
      modulo: "usuarios",
      accion: "reset_intentos_login",
      descripcion: `Error al resetear intentos de usuario ID ${params.id}: ${err.message}`,
      objeto_tipo: "usuario",
      objeto_id: params.id,
      nivel_severidad: 8,
      ip_origen: obtenerIP(request),
      agente_usuario: obtenerUserAgent(request),
    });

    return NextResponse.json(
      {
        success: false,
        error: "No se pudo resetear los intentos fallidos",
        detalle: err.message,
      },
      { status: 500 }
    );
  }
}
