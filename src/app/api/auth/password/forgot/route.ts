// ============================================================
// 🔐 Forgot Password API - AnyssaMed (MySQL) | Next.js 14
// ============================================================

export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import crypto from "crypto";
import pool, { getUserByEmail } from "@/lib/db";
import { sendMail } from "@/lib/mail";
import { recoveryEmailTemplate } from "@/lib/mail-templates";

// ------------------------------------------------------------
// 🧩 Esquema de validación
// ------------------------------------------------------------
const ForgotSchema = z.object({
  email: z.string().email("Correo inválido"),
});

// ------------------------------------------------------------
// 🧩 Handler principal
// ------------------------------------------------------------
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email } = ForgotSchema.parse(body);

    const normalizedEmail = email.trim().toLowerCase();

    // 1) Buscar usuario
    const user = await getUserByEmail(normalizedEmail);

    // Evitar enumeración de usuarios
    if (!user) {
      console.warn(
        "[FORGOT PASSWORD] Solicitud para correo no encontrado:",
        normalizedEmail
      );

      return NextResponse.json(
        {
          ok: true,
          message:
            "Si el correo existe en nuestro sistema, se han enviado instrucciones de recuperación.",
        },
        { status: 200 }
      );
    }

    // 2) Generar código de 6 dígitos y token largo
    const code = crypto.randomInt(0, 1_000_000).toString().padStart(6, "0");
    const token = crypto.randomBytes(32).toString("hex");

    // 3) Invalidar tokens anteriores
    await pool.query(
      `
      UPDATE password_reset_tokens
      SET usado = 1
      WHERE id_usuario = ? AND email = ? AND usado = 0
      `,
      [user.id_usuario, normalizedEmail]
    );

    // 4) Insertar nuevo token (10 minutos)
    await pool.query(
      `
      INSERT INTO password_reset_tokens (
        id_usuario,
        email,
        token,
        code,
        usado,
        fecha_creacion,
        fecha_expiracion
      ) VALUES (
        ?, ?, ?, ?, 0, NOW(), DATE_ADD(NOW(), INTERVAL 10 MINUTE)
      )
      `,
      [user.id_usuario, normalizedEmail, token, code]
    );

    // ======================================================
    // 5) Enviar correo REAL con SMTP seguro
    // ======================================================
    const resetUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/recuperar-password?email=${encodeURIComponent(
      normalizedEmail
    )}&token=${token}`;

   const html = recoveryEmailTemplate(
  user.nombre || "Usuario",
  code,
  resetUrl,
  10 // minutos que dura el token
);


    const sent = await sendMail({
      to: normalizedEmail,
      subject: "🔐 Recuperación de contraseña - AnyssaMed",
      html,
    });

    if (!sent) {
      console.error("❌ No se pudo enviar el correo de recuperación");
    }

    // ======================================================
    // 6) Respuesta final (NO revelamos si el usuario existe)
    // ======================================================
    return NextResponse.json(
      {
        ok: true,
        message:
          "Si el correo existe en nuestro sistema, se han enviado instrucciones de recuperación.",
        dev:
          process.env.NODE_ENV !== "production"
            ? { code, token, resetUrl }
            : undefined,
      },
      { status: 200 }
    );
  } catch (err: any) {
    console.error("❌ FORGOT PASSWORD ERROR:", err?.message || err);
    return NextResponse.json(
      { ok: false, error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
