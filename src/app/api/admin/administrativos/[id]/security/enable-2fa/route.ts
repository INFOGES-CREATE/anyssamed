//src\app\api\admin\administrativos\[id]\security\enable-2fa\route.ts
export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { ResultSetHeader, RowDataPacket } from "mysql2";
import { registrarLog } from "@/lib/logs";
import crypto from "crypto";
import QRCode from "qrcode";

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

// Genera un secreto aleatorio para 2FA
function generarSecreto2FA(bytes = 20): string {
  // seguimos tu formato actual (hex)
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
    const idUsuarioObjetivo = parseInt(params.id, 10);

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

    // issuer = nombre de tu app / marca
    const issuerName = "ANYSSAMED";
    const issuer = encodeURIComponent(issuerName);

    const accountName = encodeURIComponent(
      `${usuarioAntes.email || usuarioAntes.username || "usuario"}`
    );

    // URL estándar TOTP para apps tipo Google Authenticator
    const otpauthUrl = `otpauth://totp/${issuer}:${accountName}?secret=${secret2FA}&issuer=${issuer}&algorithm=SHA1&period=30&digits=6`;

    // =========================================================================
    // 5. Generar QR en base64 para el frontend
    // =========================================================================
    const qrDataUrl = await QRCode.toDataURL(otpauthUrl);

    // =========================================================================
    // 6. Actualizar base de datos
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
    // 7. Registrar log de seguridad
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
    // 8. Respuesta al frontend (compatible con tu modal)
    // =========================================================================
    return NextResponse.json({
      success: true,
      message: "2FA activado",
      qrDataUrl,                  // <- para <img src={twoFA.qrDataUrl} />
      secretBase32: secret2FA,    // <- lo usas así en el front, mantenemos el nombre
      otpauthUrl,                 // opcional, por si quieres debug
      data: {
        id_usuario: idUsuarioObjetivo,
        autenticacion_doble_factor: 1,
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
