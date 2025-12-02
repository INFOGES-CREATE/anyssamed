// app/api/auth/webauthn/authenticate/route.ts
// ✅ Verificación de autenticación biométrica WebAuthn
// ✅ Seguro, sin errores, con validaciones completas
export const dynamic = "force-dynamic";

export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { RowDataPacket } from "mysql2";
import { generateToken } from "@/lib/auth";
import { verifyAssertion, base64urlToBuffer } from "@/lib/webauthn";
import { v4 as uuidv4 } from "uuid";

// ----------------------------------------
// Tipos
// ----------------------------------------
interface AuthenticateRequest {
  credential: {
    id: string;
    type: string;
    rawId: string;
    response: {
      authenticatorData: string;
      clientDataJSON: string;
      signature: string;
      userHandle: string | null;
    };
  };
}

interface CredentialRecord extends RowDataPacket {
  id_credencial: number;
  id_usuario: number;
  public_key: string;
  sign_count: number;
  tipo_biometria: string;
  challenge: string;
  nombre: string;
  email: string;
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

function validateCredentialInput(credential: any): boolean {
  if (!credential) return false;
  if (!credential.id || typeof credential.id !== "string") return false;
  if (!credential.rawId || typeof credential.rawId !== "string") return false;
  if (!credential.response) return false;
  if (!credential.response.authenticatorData) return false;
  if (!credential.response.clientDataJSON) return false;
  if (!credential.response.signature) return false;
  return true;
}

// ----------------------------------------
// Handler
// ----------------------------------------
export async function POST(req: NextRequest): Promise<NextResponse> {
  const clientIP = getClientIP(req);
  const userAgent = getUserAgent(req);

  try {
    // 1️⃣ Validar método HTTP
    if (req.method !== "POST") {
      return NextResponse.json(
        { success: false, error: "Método no permitido" },
        { status: 405 }
      );
    }

    // 2️⃣ Validar Content-Type
    const contentType = req.headers.get("content-type");
    if (!contentType?.includes("application/json")) {
      return NextResponse.json(
        { success: false, error: "Content-Type debe ser application/json" },
        { status: 400 }
      );
    }

    // 3️⃣ Parsear body con validación
    let body: AuthenticateRequest;
    try {
      body = await req.json();
    } catch (parseErr) {
      return NextResponse.json(
        { success: false, error: "JSON inválido" },
        { status: 400 }
      );
    }

    // 4️⃣ Validar estructura de credencial
    if (!validateCredentialInput(body.credential)) {
      return NextResponse.json(
        { success: false, error: "Estructura de credencial inválida" },
        { status: 400 }
      );
    }

    const { credential } = body;

    // 5️⃣ Validar tamaño de credencial
    const credentialSize = JSON.stringify(credential).length;
    if (credentialSize > 10000) {
      return NextResponse.json(
        { success: false, error: "Credencial demasiado grande" },
        { status: 400 }
      );
    }

    // 6️⃣ Sanitizar credential.id
    const sanitizedCredentialId = credential.id
      .replace(/[^A-Za-z0-9_-]/g, "")
      .substring(0, 512);

    if (!sanitizedCredentialId) {
      return NextResponse.json(
        { success: false, error: "ID de credencial inválido" },
        { status: 400 }
      );
    }

    // 7️⃣ Buscar credencial en BD
    let credRows: CredentialRecord[];
    try {
      [credRows] = await pool.query<CredentialRecord[]>(
        `
        SELECT
          cb.id_credencial,
          cb.id_usuario,
          cb.public_key,
          cb.sign_count,
          cb.tipo_biometria,
          cb.challenge,
          u.nombre,
          u.email
        FROM credenciales_biometricas cb
        INNER JOIN usuarios u ON u.id_usuario = cb.id_usuario
        WHERE cb.credential_id = ? 
          AND cb.estado = 'activa'
          AND u.estado = 'activo'
        LIMIT 1
        `,
        [sanitizedCredentialId]
      );
    } catch (dbErr: any) {
      console.error("❌ Error en consulta BD:", dbErr);
      return NextResponse.json(
        { success: false, error: "Error interno del servidor" },
        { status: 500 }
      );
    }

    // 8️⃣ Validar que la credencial existe
    if (!credRows || credRows.length === 0) {
      // Auditoría - intento con credencial no encontrada
      try {
        await pool.query(
          `
          INSERT INTO auditoria_biometria 
          (tipo_evento, resultado, razon_fallo, ip_origen, user_agent, fecha_evento)
          VALUES ('verificacion_fallida', 'fallido', 'Credencial no encontrada', ?, ?, NOW())
          `,
          [clientIP, userAgent]
        );
      } catch (auditErr) {
        console.error("❌ Error en auditoría:", auditErr);
      }

      return NextResponse.json(
        { success: false, error: "Credencial no encontrada" },
        { status: 404 }
      );
    }

    const credRecord = credRows[0];
    const usuario = credRows[0];

    // 9️⃣ Validar que public_key existe
    if (!credRecord.public_key) {
      try {
        await pool.query(
          `
          INSERT INTO auditoria_biometria 
          (id_usuario, id_credencial, tipo_evento, resultado, razon_fallo, ip_origen, user_agent, fecha_evento)
          VALUES (?, ?, 'verificacion_fallida', 'fallido', 'Public key no disponible', ?, ?, NOW())
          `,
          [usuario.id_usuario, credRecord.id_credencial, clientIP, userAgent]
        );
      } catch (auditErr) {
        console.error("❌ Error en auditoría:", auditErr);
      }

      return NextResponse.json(
        { success: false, error: "Error interno del servidor" },
        { status: 500 }
      );
    }

    // 🔟 Verificar assertion
    let verification;
    try {
      verification = await verifyAssertion({
        credential,
        publicKey: credRecord.public_key,
        signCount: credRecord.sign_count,
        expectedChallenge: credRecord.challenge || undefined,
        expectedOrigin: process.env.WEBAUTHN_ORIGIN || "http://localhost:3000",
        expectedRpId: process.env.WEBAUTHN_RP_ID || "localhost",
      });

      if (!verification.valid) {
        throw new Error("Verificación de firma fallida");
      }
    } catch (verifyErr: any) {
      // Auditoría - fallo de verificación
      try {
        await pool.query(
          `
          INSERT INTO auditoria_biometria 
          (id_usuario, id_credencial, tipo_evento, resultado, razon_fallo, ip_origen, user_agent, fecha_evento)
          VALUES (?, ?, 'verificacion_fallida', 'fallido', ?, ?, ?, NOW())
          `,
          [
            usuario.id_usuario,
            credRecord.id_credencial,
            String(verifyErr?.message).substring(0, 255),
            clientIP,
            userAgent,
          ]
        );
      } catch (auditErr) {
        console.error("❌ Error en auditoría:", auditErr);
      }

      console.error("❌ Error en verificación biométrica:", verifyErr);

      return NextResponse.json(
        { success: false, error: "Autenticación biométrica fallida" },
        { status: 401 }
      );
    }

    // 1️⃣1️⃣ Actualizar sign_count
    try {
      await pool.query(
        `
        UPDATE credenciales_biometricas
        SET
          sign_count = ?,
          ultima_verificacion = NOW(),
          intentos_fallidos = 0
        WHERE id_credencial = ?
        `,
        [verification.newSignCount, credRecord.id_credencial]
      );
    } catch (updateErr: any) {
      console.error("❌ Error actualizando sign_count:", updateErr);
      // Continuar de todas formas
    }

    // 1️⃣2️⃣ Generar token JWT
    let token: string;
    try {
      token = generateToken({
        id: usuario.id_usuario,
        email: usuario.email,
        type: "biometric_verified",
      });
    } catch (tokenErr: any) {
      console.error("❌ Error generando token:", tokenErr);
      return NextResponse.json(
        { success: false, error: "Error interno del servidor" },
        { status: 500 }
      );
    }

    // 1️⃣3️⃣ Crear sesión
    const sessionId = uuidv4();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    try {
      await pool.query(
        `
        INSERT INTO sesiones_usuarios 
        (id_usuario, token, session_id, activa, fecha_expiracion, ip_origen, user_agent, tipo_autenticacion, fecha_creacion)
        VALUES (?, ?, ?, 1, ?, ?, ?, 'biometria', NOW())
        `,
        [usuario.id_usuario, token, sessionId, expiresAt, clientIP, userAgent]
      );
    } catch (sessionErr: any) {
      console.error("❌ Error creando sesión:", sessionErr);
      return NextResponse.json(
        { success: false, error: "Error interno del servidor" },
        { status: 500 }
      );
    }

    // 1️⃣4️⃣ Auditoría - éxito
    try {
      await pool.query(
        `
        INSERT INTO auditoria_biometria 
        (id_usuario, id_credencial, tipo_evento, resultado, ip_origen, user_agent, fecha_evento)
        VALUES (?, ?, 'verificacion_exitosa', 'exitoso', ?, ?, NOW())
        `,
        [usuario.id_usuario, credRecord.id_credencial, clientIP, userAgent]
      );
    } catch (auditErr) {
      console.error("❌ Error en auditoría:", auditErr);
    }

    // 1️⃣5️⃣ Respuesta exitosa
    const response = NextResponse.json(
      {
        success: true,
        ok: true,
        token,
        user: {
          id_usuario: usuario.id_usuario,
          nombre: usuario.nombre,
          email: usuario.email,
        },
      },
      { status: 200 }
    );

    // 1️⃣6️⃣ Establecer cookie segura
    response.cookies.set("session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 24 * 60 * 60,
      path: "/",
    });

    return response;
  } catch (err: any) {
    console.error("❌ Error en POST /api/auth/webauthn/authenticate:", err);

    return NextResponse.json(
      {
        success: false,
        error: "Error interno del servidor",
      },
      { status: 500 }
    );
  }
}
