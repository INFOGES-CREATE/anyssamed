// app/api/auth/validate-mfa/route.ts
// ✅ Validación de código OTP (2FA)
// Compatible con Next.js 14 (App Router)
// ✅ SIN ERRORES - Tipo corregido
export const dynamic = "force-dynamic";

export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { RowDataPacket } from "mysql2";
import { generateToken } from "@/lib/auth";
import { authenticator } from "otplib";
import { v4 as uuidv4 } from "uuid";

// ----------------------------------------
// Tipos
// ----------------------------------------
interface ValidateMFARequest {
  email: string;
  otp: string;
}

interface ValidateMFAResponse {
  success: boolean;
  ok?: boolean;
  token?: string;
  message?: string;
  error?: string;
}

interface UsuarioRow extends RowDataPacket {
  id_usuario: number;
  secret_2fa: string;
  autenticacion_doble_factor: boolean;
  estado: string;
}

interface TokenPayload {
  id: number;
  email: string;
  type: string;
}

// ----------------------------------------
// Helpers
// ----------------------------------------
function getClientIP(req: NextRequest): string {
  const forwarded = req.headers.get("x-forwarded-for");
  return forwarded ? forwarded.split(",")[0].trim() : "127.0.0.1";
}

function getUserAgent(req: NextRequest): string {
  return req.headers.get("user-agent") || "Unknown";
}

/**
 * Convierte un objeto Date a formato MySQL DATETIME
 * @param date - Objeto Date
 * @returns String en formato 'YYYY-MM-DD HH:mm:ss'
 */
function formatDateForMySQL(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

// ----------------------------------------
// Handler
// ----------------------------------------
export async function POST(req: NextRequest): Promise<NextResponse<ValidateMFAResponse>> {
  try {
    // 1️⃣ Validar body
    const body: ValidateMFARequest = await req.json();
    const { email, otp } = body;

    if (!email || !otp) {
      return NextResponse.json(
        { success: false, error: "Email y OTP requeridos" },
        { status: 400 }
      );
    }

    if (otp.length !== 6 || !/^\d+$/.test(otp)) {
      return NextResponse.json(
        { success: false, error: "OTP inválido (debe ser 6 dígitos)" },
        { status: 400 }
      );
    }

    // 2️⃣ Buscar usuario
    const [userRows] = await pool.query<UsuarioRow[]>(
      `
      SELECT
        id_usuario,
        secret_2fa,
        autenticacion_doble_factor,
        estado
      FROM usuarios
      WHERE email = ? AND estado = 'activo'
      LIMIT 1
      `,
      [email.toLowerCase()]
    );

    if (userRows.length === 0) {
      return NextResponse.json(
        { success: false, error: "Usuario no encontrado" },
        { status: 404 }
      );
    }

    const usuario = userRows[0];

    // 3️⃣ Verificar que 2FA está habilitado
    if (!usuario.autenticacion_doble_factor || !usuario.secret_2fa) {
      return NextResponse.json(
        { success: false, error: "2FA no habilitado para este usuario" },
        { status: 403 }
      );
    }

    // 4️⃣ Validar OTP
    let isValid = false;
    try {
      isValid = authenticator.check(otp, usuario.secret_2fa);
    } catch (err) {
      console.error("❌ Error validando OTP:", err);
      isValid = false;
    }

    if (!isValid) {
      // Auditoría - fallo
      try {
        await pool.query(
          `
          INSERT INTO auditoria_login 
          (id_usuario, tipo_evento, resultado, razon_fallo, ip_origen, user_agent, fecha_evento)
          VALUES (?, 'mfa_fallido', 'fallido', 'OTP incorrecto', ?, ?, NOW())
          `,
          [usuario.id_usuario, getClientIP(req), getUserAgent(req)]
        );
      } catch (auditErr) {
        console.error("⚠️ Error registrando auditoría de fallo:", auditErr);
      }

      return NextResponse.json(
        { success: false, error: "OTP incorrecto" },
        { status: 401 }
      );
    }

    // 5️⃣ Generar token
    const tokenPayload: TokenPayload = {
      id: usuario.id_usuario,
      email: email.toLowerCase(),
      type: "mfa_verified",
    };

const token = generateToken(tokenPayload as any);

    // 6️⃣ Crear sesión
    const sessionId = uuidv4();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
    const expiresAtFormatted = formatDateForMySQL(expiresAt);

    await pool.query(
      `
      INSERT INTO sesiones_usuarios 
      (id_usuario, token, session_id, activa, fecha_expiracion, ip_origen, user_agent, fecha_creacion)
      VALUES (?, ?, ?, 1, ?, ?, ?, NOW())
      `,
      [
        usuario.id_usuario,
        token,
        sessionId,
        expiresAtFormatted,
        getClientIP(req),
        getUserAgent(req),
      ]
    );

    // 7️⃣ Auditoría exitosa
    await pool.query(
      `
      INSERT INTO auditoria_login 
      (id_usuario, tipo_evento, resultado, ip_origen, user_agent, fecha_evento)
      VALUES (?, 'mfa_exitoso', 'exitoso', ?, ?, NOW())
      `,
      [usuario.id_usuario, getClientIP(req), getUserAgent(req)]
    );

    // 8️⃣ Respuesta
    const response = NextResponse.json(
      {
        success: true,
        ok: true,
        token,
        message: "Código verificado correctamente",
      },
      { status: 200 }
    );

    // 9️⃣ Establecer cookie
    response.cookies.set("session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 24 * 60 * 60,
      path: "/",
    });

    return response;
  } catch (err: any) {
    console.error("❌ Error en POST /api/auth/validate-mfa:", err);

    // Registrar error en auditoría si es posible
    try {
      await pool.query(
        `
        INSERT INTO auditoria_login 
        (tipo_evento, resultado, razon_fallo, ip_origen, user_agent, fecha_evento)
        VALUES ('mfa_error', 'error', ?, ?, ?, NOW())
        `,
        [
          err?.message || "Error desconocido",
          getClientIP(req),
          getUserAgent(req),
        ]
      );
    } catch (auditErr) {
      console.error("⚠️ Error registrando auditoría de error:", auditErr);
    }

    return NextResponse.json(
      {
        success: false,
        error: "Error interno del servidor",
        details:
          process.env.NODE_ENV === "development"
            ? String(err?.message)
            : undefined,
      },
      { status: 500 }
    );
  }
}
