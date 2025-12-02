// ============================================================
// 🔐 Reset Password API - AnyssaMed (MySQL) | Next.js 14
// ============================================================
export const dynamic = "force-dynamic";

export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import pool, { getUserByEmail } from "@/lib/db";
import { hashPassword } from "@/lib/auth";

// ------------------------------------------------------------
// 🧩 Esquema de validación
// ------------------------------------------------------------
const ResetSchema = z.object({
  email: z.string().email("Correo inválido"),
  password: z.string().min(12, "Mínimo 12 caracteres"),
  token: z.string().min(6, "Token inválido"),
});

// ------------------------------------------------------------
// 🧩 Handler principal
// ------------------------------------------------------------
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password, token } = ResetSchema.parse(body);

    const normalizedEmail = email.trim().toLowerCase();
    const tokenOrCode = token.trim();

    // 1) Buscar token válido
    const [rows]: any = await pool.query(
      `
      SELECT *
      FROM password_reset_tokens
      WHERE email = ?
        AND usado = 0
        AND fecha_expiracion > NOW()
        AND (token = ? OR code = ?)
      ORDER BY fecha_creacion DESC
      LIMIT 1
      `,
      [normalizedEmail, tokenOrCode, tokenOrCode]
    );

    const tokenRow = Array.isArray(rows) ? rows[0] : null;

    if (!tokenRow) {
      return NextResponse.json(
        { ok: false, error: "Token o código inválido o expirado" },
        { status: 400 }
      );
    }

    // 2) Obtener usuario
    const user = await getUserByEmail(normalizedEmail);

    if (!user || user.id_usuario !== tokenRow.id_usuario) {
      return NextResponse.json(
        {
          ok: false,
          error: "Usuario no coincide con el token",
        },
        { status: 400 }
      );
    }

    // 3) Hash de contraseña nueva
    const hashed = await hashPassword(String(password));

    // 4) Actualizar contraseña EN TU TABLA REAL
    await pool.query(
      `
      UPDATE usuarios
      SET
        password_hash = ?,
        requiere_cambio_password = 0,
        fecha_modificacion = NOW()
      WHERE id_usuario = ?
      `,
      [hashed, user.id_usuario]
    );

    // 5) Marcar token como usado
    await pool.query(
      `
      UPDATE password_reset_tokens
      SET usado = 1, fecha_uso = NOW()
      WHERE id = ?
      `,
      [tokenRow.id]
    );

    return NextResponse.json(
      {
        ok: true,
        message: "Contraseña actualizada correctamente",
      },
      { status: 200 }
    );
  } catch (err: any) {
    console.error("❌ RESET PASSWORD ERROR:", err?.message || err);
    return NextResponse.json(
      { ok: false, error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
