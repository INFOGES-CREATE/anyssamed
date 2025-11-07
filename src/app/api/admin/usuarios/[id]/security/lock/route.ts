// frontend/src/app/api/admin/usuarios/[id]/security/lock/route.ts
import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { RowDataPacket, ResultSetHeader } from "mysql2";
import { registrarLog } from "@/lib/logs";

// ─────────────────────────────────────────────
// helpers locales (mismos helpers que usamos en otros endpoints de seguridad)
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

function limpiarDatosSensibles(usuario: any): any {
  if (!usuario) return usuario;
  const copia = { ...usuario };
  delete copia.password_hash;
  delete copia.reset_token;
  delete copia.secret_2fa;
  return copia;
}

// ─────────────────────────────────────────────
// POST /api/admin/usuarios/[id]/security/lock
//  - Marca el usuario como "bloqueado"
//  - Deja registro en logs_sistema
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

    // 1. Obtener datos actuales del usuario
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

    // 2. Actualizar: forzar estado = 'bloqueado'
    await connection.query<ResultSetHeader>(
      `UPDATE usuarios
       SET estado = 'bloqueado',
           fecha_modificacion = NOW()
       WHERE id_usuario = ?`,
      [idUsuario]
    );

    // 3. Volver a leer para respuesta limpia
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

    // 4. Registrar log de seguridad
    await registrarLog({
      id_usuario: 1, // TODO: reemplazar por el admin autenticado en sesión
      tipo: "security",
      modulo: "usuarios",
      accion: "bloquear_usuario",
      descripcion: `Cuenta bloqueada manualmente. Usuario afectado: ${usuarioActual.username} (ID ${idUsuario})`,
      objeto_tipo: "usuario",
      objeto_id: String(idUsuario),
      datos_antiguos: limpiarDatosSensibles(usuarioActual),
      datos_nuevos: limpiarDatosSensibles(usuarioActualizado),
      nivel_severidad: 9,
      ip_origen: obtenerIP(request),
      agente_usuario: obtenerUserAgent(request),
    });

    await connection.commit();
    connection.release();

    return NextResponse.json({
      success: true,
      message: "Usuario bloqueado exitosamente",
      data: usuarioActualizado,
    });
  } catch (err: any) {
    if (connection) {
      await connection.rollback();
      connection.release();
    }

    console.error("❌ Error al bloquear usuario:", err);

    await registrarLog({
      id_usuario: null,
      tipo: "error",
      modulo: "usuarios",
      accion: "bloquear_usuario",
      descripcion: `Error al bloquear usuario ID ${params.id}: ${err.message}`,
      objeto_tipo: "usuario",
      objeto_id: params.id,
      nivel_severidad: 9,
      ip_origen: obtenerIP(request),
      agente_usuario: obtenerUserAgent(request),
    });

    return NextResponse.json(
      {
        success: false,
        error: "No se pudo bloquear el usuario",
        detalle: err.message,
      },
      { status: 500 }
    );
  }
}
