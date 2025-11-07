// frontend/src/app/api/admin/usuarios/[id]/security/reset-password-token/route.ts

import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { ResultSetHeader, RowDataPacket } from "mysql2";
import { registrarLog } from "@/lib/logs";
import crypto from "crypto";

// ============================================================================
// CONFIG
// ============================================================================

// TODO: reemplazar con ID real del admin autenticado que ejecuta esto
const ADMIN_USER_ID_FALLBACK = 1;

// Token válido por X minutos
const RESET_TOKEN_VALID_MINUTES = 60;

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
  estado: string;
  intentos_fallidos: number;
  autenticacion_doble_factor: number;
  reset_token?: string | null;
  reset_token_expiry?: string | null;
  password_hash?: string;
  secret_2fa?: string | null;
  fecha_modificacion?: string | null;
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

// Genera un token seguro (64 chars hex)
function generarResetToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

// ============================================================================
// POST /api/admin/usuarios/[id]/security/reset-password-token
//
// Genera un nuevo reset_token y reset_token_expiry para el usuario.
// - Guarda token en BD
// - Marca expiración NOW() + 60 min
// - Registra log de seguridad
//
// Respuesta OK (200):
// {
//   success: true,
//   message: "Token de reseteo generado",
//   data: {
//     id_usuario: 123,
//     reset_token: "abcd1234...",
//     reset_token_expiry: "2025-10-29T15:34:00.000Z"
//   }
// }
//
// Nota: En producción normalmente NO devuelves el token plano en la API admin,
// lo enviarías por email / SMS. Aquí sí lo devolvemos para integrarlo rápido.
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
    // 2. Conectar y empezar transacción
    // =========================================================================
    connection = await pool.getConnection();
    await connection.beginTransaction();

    // =========================================================================
    // 3. Obtener usuario actual
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

    // Si quieres poner alguna regla (por ejemplo, no generar token si está bloqueado):
    if (usuarioAntes.estado === "bloqueado") {
      await connection.rollback();
      connection.release();
      return NextResponse.json(
        {
          success: false,
          error:
            "No se puede generar token de reseteo para un usuario bloqueado",
        },
        { status: 403 }
      );
    }

    // =========================================================================
    // 4. Generar token y expiración
    // =========================================================================
    const nuevoToken = generarResetToken();

    // Para devolver la expiración de forma consistente al front:
    const ahora = new Date();
    const expiryDate = new Date(
      ahora.getTime() + RESET_TOKEN_VALID_MINUTES * 60 * 1000
    );

    // =========================================================================
    // 5. Guardar en BD
    // =========================================================================
    await connection.query<ResultSetHeader>(
      `
        UPDATE usuarios
        SET reset_token = ?,
            reset_token_expiry = DATE_ADD(NOW(), INTERVAL ? MINUTE),
            fecha_modificacion = NOW()
        WHERE id_usuario = ?
      `,
      [nuevoToken, RESET_TOKEN_VALID_MINUTES, idUsuarioObjetivo]
    );

    // =========================================================================
    // 6. LOG de seguridad
    // =========================================================================
    await registrarLog({
      id_usuario: ADMIN_USER_ID_FALLBACK, // admin que dispara el reset
      tipo: "security",
      modulo: "usuarios",
      accion: "generar_reset_password_token",
      descripcion: `Generado token de reseteo de contraseña para usuario ID ${idUsuarioObjetivo}`,
      objeto_tipo: "usuario",
      objeto_id: idUsuarioObjetivo.toString(),
      datos_antiguos: limpiarDatosSensibles(usuarioAntes),
      datos_nuevos: {
        reset_token: "[GENERATED]", // no guardamos aquí el real por seguridad en log
        reset_token_expiry: expiryDate.toISOString(),
      },
      ip_origen: obtenerIP(request),
      agente_usuario: obtenerUserAgent(request),
      nivel_severidad: 8,
    });

    await connection.commit();
    connection.release();

    // =========================================================================
    // 7. Respuesta OK
    // =========================================================================
    return NextResponse.json({
      success: true,
      message: "Token de reseteo generado",
      data: {
        id_usuario: idUsuarioObjetivo,
        reset_token: nuevoToken,
        reset_token_expiry: expiryDate.toISOString(),
        expires_in_minutes: RESET_TOKEN_VALID_MINUTES,
      },
    });
  } catch (error: any) {
    if (connection) {
      await connection.rollback();
      connection.release();
    }

    console.error("❌ Error al generar token de reseteo:", error);

    // Log de error
    await registrarLog({
      id_usuario: null,
      tipo: "error",
      modulo: "usuarios",
      accion: "generar_reset_password_token",
      descripcion: `Error al generar token de reseteo para usuario ID ${params.id}: ${error.message}`,
      ip_origen: obtenerIP(request),
      agente_usuario: obtenerUserAgent(request),
      nivel_severidad: 10,
    });

    return NextResponse.json(
      {
        success: false,
        error: "Error al generar token de reseteo",
        detalles: error.message,
      },
      { status: 500 }
    );
  }
}
