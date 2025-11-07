// frontend/src/app/api/admin/usuarios/[id]/security/enable-2fa/route.ts

import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { ResultSetHeader, RowDataPacket } from "mysql2";
import { registrarLog } from "@/lib/logs";
import crypto from "crypto";

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

// Genera un secreto aleatorio para 2FA (ej: usarlo luego en TOTP)
function generarSecreto2FA(bytes = 20): string {
  return crypto.randomBytes(bytes).toString("hex");
}

// Limpiar campos que NO queremos devolver al frontend
function limpiarDatosSensibles<T extends Record<string, any>>(usuario: T): T {
  const data = { ...usuario };
  delete data.password_hash;
  delete data.reset_token;
  delete data.reset_token_expiry;
  delete data.secret_2fa; // <- importante, no exponemos datos previos
  return data;
}

// ============================================================================
// POST /api/admin/usuarios/[id]/security/enable-2fa
// Activa / habilita 2FA para el usuario objetivo.
// Genera un secret_2fa nuevo y marca autenticacion_doble_factor = 1.
//
// Respuesta (200):
// {
//   success: true,
//   message: "2FA activado",
//   data: {
//     id_usuario: 123,
//     autenticacion_doble_factor: 1,
//     secret_2fa: "abc123...",
//     otpauth_url: "otpauth://totp/..."
//   }
// }
//
// Nota sobre otpauth_url:
// - Aquí devolvemos un formato estándar TOTP (Google Authenticator).
// - Ajusta "issuer" y "app" según tu marca real.
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
    // 4. Generar nuevo secreto 2FA
    // =========================================================================
    const secret2FA = generarSecreto2FA(20); // 40 chars hex
    //
    // IMPORTANTE:
    // Normalmente para TOTP se ocupa Base32, no hex.
    // Acá lo dejamos en hex porque es lo que estamos guardando.
    // Si después quieres compatibilidad directa con Google Authenticator,
    // deberíamos guardar Base32. Pero mantenemos tu estructura actual.

    // otpauth://totp/<issuer>:<username>?secret=<secret>&issuer=<issuer>&algorithm=SHA1&period=30&digits=6
    // vamos a construir una URL estándar para QR
    // OJO: usamos secret2FA directo. Si luego migras a Base32, cambia aquí.
    const issuer = encodeURIComponent("MediSuite");
    const accountName = encodeURIComponent(
      `${usuarioAntes.email || usuarioAntes.username || "usuario"}`
    );
    const otpauthUrl = `otpauth://totp/${issuer}:${accountName}?secret=${secret2FA}&issuer=${issuer}&algorithm=SHA1&period=30&digits=6`;

    // =========================================================================
    // 5. Actualizar base de datos
    // =========================================================================
    await connection.query<ResultSetHeader>(
      `UPDATE usuarios
       SET autenticacion_doble_factor = 1,
           secret_2fa = ?,
           fecha_modificacion = NOW()
       WHERE id_usuario = ?`,
      [secret2FA, idUsuarioObjetivo]
    );

    // =========================================================================
    // 6. Registrar log de seguridad
    // =========================================================================
    await registrarLog({
      id_usuario: ADMIN_USER_ID_FALLBACK, // admin que ejecuta la acción
      tipo: "security",
      modulo: "usuarios",
      accion: "activar_2fa",
      descripcion: `2FA activado para usuario ID ${idUsuarioObjetivo}`,
      objeto_tipo: "usuario",
      objeto_id: idUsuarioObjetivo.toString(),
      datos_antiguos: limpiarDatosSensibles(usuarioAntes),
      datos_nuevos: {
        autenticacion_doble_factor: 1,
      },
      ip_origen: obtenerIP(request),
      agente_usuario: obtenerUserAgent(request),
      nivel_severidad: 7,
    });

    await connection.commit();
    connection.release();

    // =========================================================================
    // 7. Respuesta al frontend
    // =========================================================================
    // A diferencia de limpiarDatosSensibles, acá SÍ devolvemos secret_2fa nuevo
    // porque el frontend lo necesita para generar el código QR que el usuario
    // debe escanear en Authenticator.
    return NextResponse.json({
      success: true,
      message: "2FA activado",
      data: {
        id_usuario: idUsuarioObjetivo,
        autenticacion_doble_factor: 1,
        secret_2fa: secret2FA,
        otpauth_url: otpauthUrl,
      },
    });
  } catch (error: any) {
    if (connection) {
      await connection.rollback();
      connection.release();
    }

    console.error("❌ Error al activar 2FA:", error);

    await registrarLog({
      id_usuario: null,
      tipo: "error",
      modulo: "usuarios",
      accion: "activar_2fa",
      descripcion: `Error al activar 2FA en usuario ID ${params.id}: ${error.message}`,
      ip_origen: obtenerIP(request),
      agente_usuario: obtenerUserAgent(request),
      nivel_severidad: 9,
    });

    return NextResponse.json(
      {
        success: false,
        error: "Error al activar 2FA",
        detalles: error.message,
      },
      { status: 500 }
    );
  }
}
