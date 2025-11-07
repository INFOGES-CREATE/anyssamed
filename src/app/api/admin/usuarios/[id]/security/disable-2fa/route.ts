// frontend/src/app/api/admin/usuarios/[id]/security/disable-2fa/route.ts

import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { ResultSetHeader, RowDataPacket } from "mysql2";
import { registrarLog } from "@/lib/logs";

// ============================================================================
// CONFIG
// ============================================================================

// TODO: reemplazar con el ID real del usuario autenticado (admin que hace la acción)
const ADMIN_USER_ID_FALLBACK = 1;

// ============================================================================
// TIPOS / INTERFACES
// ============================================================================

interface Usuario extends RowDataPacket {
  id_usuario: number;
  username: string;
  nombre: string;
  apellido_paterno: string;
  apellido_materno?: string | null;
  email: string;
  rut: string;
  autenticacion_doble_factor: number; // tinyint(1)
  secret_2fa?: string | null;
  estado: string;
  fecha_modificacion?: string | null;
  password_hash?: string;
  reset_token?: string;
  reset_token_expiry?: string;
}

// ============================================================================
// HELPERS
// ============================================================================

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

function limpiarDatosSensibles<T extends Record<string, any>>(usuario: T): T {
  const data = { ...usuario };
  delete data.password_hash;
  delete data.reset_token;
  delete data.reset_token_expiry;
  delete data.secret_2fa;
  return data;
}

// ============================================================================
// POST /api/admin/usuarios/[id]/security/disable-2fa
// Desactiva el 2FA del usuario:
//  - Setea autenticacion_doble_factor = 0
//  - Limpia secret_2fa = NULL
//
// Respuesta (200):
// {
//   success: true,
//   message: "2FA desactivado",
//   data: {
//     id_usuario: 123,
//     autenticacion_doble_factor: 0
//   }
// }
// ============================================================================

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  let connection;

  try {
    // =========================================================================
    // 1. Validar ID
    // =========================================================================
    const idUsuarioObjetivo = parseInt(params.id);

    if (isNaN(idUsuarioObjetivo)) {
      return NextResponse.json(
        { success: false, error: "ID de usuario inválido" },
        { status: 400 }
      );
    }

    // =========================================================================
    // 2. Conexión / transacción
    // =========================================================================
    connection = await pool.getConnection();
    await connection.beginTransaction();

    // =========================================================================
    // 3. Cargar usuario
    // =========================================================================
    const [rowsUsuario] = await connection.query<Usuario[]>(
      "SELECT * FROM usuarios WHERE id_usuario = ?",
      [idUsuarioObjetivo]
    );

    if (rowsUsuario.length === 0) {
      await connection.rollback();
      connection.release();
      return NextResponse.json(
        { success: false, error: "Usuario no encontrado" },
        { status: 404 }
      );
    }

    const usuarioAntes = rowsUsuario[0];

    // =========================================================================
    // 4. Actualizar base de datos (desactivar 2FA)
    // =========================================================================
    await connection.query<ResultSetHeader>(
      `UPDATE usuarios
       SET autenticacion_doble_factor = 0,
           secret_2fa = NULL,
           fecha_modificacion = NOW()
       WHERE id_usuario = ?`,
      [idUsuarioObjetivo]
    );

    // =========================================================================
    // 5. Registrar log de seguridad
    // =========================================================================
    await registrarLog({
      id_usuario: ADMIN_USER_ID_FALLBACK, // admin que ejecuta la acción
      tipo: "security",
      modulo: "usuarios",
      accion: "desactivar_2fa",
      descripcion: `2FA desactivado para usuario ID ${idUsuarioObjetivo}`,
      objeto_tipo: "usuario",
      objeto_id: idUsuarioObjetivo.toString(),
      datos_antiguos: limpiarDatosSensibles(usuarioAntes),
      datos_nuevos: {
        autenticacion_doble_factor: 0,
        secret_2fa: null,
      },
      ip_origen: obtenerIP(request),
      agente_usuario: obtenerUserAgent(request),
      nivel_severidad: 6,
    });

    await connection.commit();
    connection.release();

    // =========================================================================
    // 6. Respuesta ok
    // =========================================================================
    return NextResponse.json({
      success: true,
      message: "2FA desactivado",
      data: {
        id_usuario: idUsuarioObjetivo,
        autenticacion_doble_factor: 0,
      },
    });
  } catch (error: any) {
    if (connection) {
      await connection.rollback();
      connection.release();
    }

    console.error("❌ Error al desactivar 2FA:", error);

    await registrarLog({
      id_usuario: null,
      tipo: "error",
      modulo: "usuarios",
      accion: "desactivar_2fa",
      descripcion: `Error al desactivar 2FA en usuario ID ${params.id}: ${error.message}`,
      ip_origen: obtenerIP(request),
      agente_usuario: obtenerUserAgent(request),
      nivel_severidad: 9,
    });

    return NextResponse.json(
      {
        success: false,
        error: "Error al desactivar 2FA",
        detalles: error.message,
      },
      { status: 500 }
    );
  }
}
