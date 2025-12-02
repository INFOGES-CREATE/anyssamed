// ============================================================
// 🔐 Verify Code API - AnyssaMed (MySQL) | Next.js 14
// ============================================================
export const dynamic = "force-dynamic";

export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import pool from "@/lib/db";

// ------------------------------------------------------------
// 🧩 Esquema de validación
// ------------------------------------------------------------
const VerifySchema = z.object({
  email: z.string().email("Correo inválido"),
  code: z.string().min(6, "Código inválido").max(6, "Código inválido"),
});

// ------------------------------------------------------------
// 🧩 Handler principal
// ------------------------------------------------------------
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, code } = VerifySchema.parse(body);

    const normalizedEmail = email.trim().toLowerCase();
    const codeSanitized = code.trim();

    // 1) Buscar token válido
    const [rows]: any = await pool.query(
      `
      SELECT *
      FROM password_reset_tokens
      WHERE email = ?
        AND code = ?
        AND usado = 0
        AND fecha_expiracion > NOW()
      ORDER BY fecha_creacion DESC
      LIMIT 1
      `,
      [normalizedEmail, codeSanitized]
    );

    const tokenRow = Array.isArray(rows) ? rows[0] : null;

    if (!tokenRow) {
      return NextResponse.json(
        { ok: false, error: "Código incorrecto o expirado" },
        { status: 400 }
      );
    }

    // Opcional: podrías marcar aquí un flag de "verificado"
    // pero como igual volveremos a validar en /reset, basta con esto.

    return NextResponse.json(
      {
        ok: true,
        message: "Código verificado correctamente",
      },
      { status: 200 }
    );
  } catch (err: any) {
    console.error("❌ VERIFY CODE ERROR:", err?.message || err);
    return NextResponse.json(
      { ok: false, error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
