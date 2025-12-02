// app/api/auth/webauthn/authentication-options/route.ts
// ✅ Obtener opciones de autenticación WebAuthn
// Compatible con Next.js 14 (App Router)
export const dynamic = "force-dynamic";

export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { RowDataPacket } from "mysql2";
import { generateChallenge, bufferToBase64url } from "@/lib/webauthn";

// ----------------------------------------
// Tipos
// ----------------------------------------
interface AuthenticationOptionsResponse {
  publicKey: {
    challenge: string;
    rpId: string;
    rpName: string;
    userVerification: "required" | "preferred" | "discouraged";
    allowCredentials: Array<{
      type: "public-key";
      id: string;
      transports?: string[];
    }>;
    timeout: number;
  };
}

// ----------------------------------------
// Handler
// ----------------------------------------
export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    // 1️⃣ Generar challenge
    const challenge = generateChallenge();
    const challengeBase64url = bufferToBase64url(challenge);

    // 2️⃣ Obtener credenciales biométricas registradas
    const [credRows] = await pool.query<RowDataPacket[]>(
      `
      SELECT credential_id
      FROM credenciales_biometricas
      WHERE estado = 'activa'
      LIMIT 10
      `
    );

    // 3️⃣ Convertir a base64url
    const allowCredentials = credRows.map((cred) => ({
      type: "public-key" as const,
      id: cred.credential_id,
      transports: ["internal", "usb", "ble", "nfc"],
    }));

    // 4️⃣ Respuesta
    const response: AuthenticationOptionsResponse = {
      publicKey: {
        challenge: challengeBase64url,
        rpId: process.env.WEBAUTHN_RP_ID || "localhost",
        rpName: "AnyssaMed",
        userVerification: "required",
        allowCredentials,
        timeout: 60000,
      },
    };

    return NextResponse.json(response, { status: 200 });
  } catch (err: any) {
    console.error("❌ Error en POST /api/auth/webauthn/authentication-options:", err);
    return NextResponse.json(
      {
        success: false,
        error: "Error interno del servidor",
        details: process.env.NODE_ENV === "development" ? String(err?.message) : undefined,
      },
      { status: 500 }
    );
  }
}
