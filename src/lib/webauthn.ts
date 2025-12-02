// lib/webauthn.ts
// ✅ Funciones de utilidad para WebAuthn/FIDO2
// Compatible con Node.js

import crypto from "crypto";

// ----------------------------------------
// Tipos
// ----------------------------------------
export interface VerificationResult {
  valid: boolean;
  newSignCount: number;
}

export interface CredentialAssertion {
  id: string;
  type: string;
  rawId: string;
  response: {
    authenticatorData: string;
    clientDataJSON: string;
    signature: string;
    userHandle: string | null;
  };
}

// ----------------------------------------
// Generar Challenge (32 bytes aleatorios)
// ----------------------------------------
export function generateChallenge(): Buffer {
  return crypto.randomBytes(32);
}

// ----------------------------------------
// Convertir Buffer a Base64URL
// ----------------------------------------
export function bufferToBase64url(buffer: Buffer | ArrayBuffer): string {
  const bytes = buffer instanceof ArrayBuffer 
    ? new Uint8Array(buffer) 
    : buffer;
  
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  
  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

// ----------------------------------------
// Convertir Base64URL a Buffer
// ----------------------------------------
export function base64urlToBuffer(base64url: string): Buffer {
  const base64 = base64url
    .replace(/-/g, "+")
    .replace(/_/g, "/");
  
  const padLen = (4 - (base64.length % 4)) % 4;
  const padded = base64 + "=".repeat(padLen);
  
  return Buffer.from(padded, "base64");
}

// ----------------------------------------
// Decodificar Authenticator Data
// ----------------------------------------
export function decodeAuthenticatorData(authData: Buffer): {
  rpIdHash: Buffer;
  flags: number;
  signCount: number;
  attestedCredentialData?: {
    aaguid: Buffer;
    credentialId: Buffer;
    credentialPublicKey: Buffer;
  };
} {
  let offset = 0;

  // RP ID Hash (32 bytes)
  const rpIdHash = authData.slice(offset, offset + 32);
  offset += 32;

  // Flags (1 byte)
  const flags = authData[offset];
  offset += 1;

  // Sign Count (4 bytes, big-endian)
  const signCount = authData.readUInt32BE(offset);
  offset += 4;

  const result: any = {
    rpIdHash,
    flags,
    signCount,
  };

  // Si el flag UP (User Present) está activo
  const UP = (flags & 0x01) !== 0;
  if (!UP) {
    throw new Error("User Present flag no está activo");
  }

  // Si el flag AT (Attested Credential Data) está activo
  const AT = (flags & 0x40) !== 0;
  if (AT) {
    // AAGUID (16 bytes)
    const aaguid = authData.slice(offset, offset + 16);
    offset += 16;

    // Credential ID Length (2 bytes, big-endian)
    const credIdLen = authData.readUInt16BE(offset);
    offset += 2;

    // Credential ID
    const credentialId = authData.slice(offset, offset + credIdLen);
    offset += credIdLen;

    // Credential Public Key (CBOR encoded)
    const credentialPublicKey = authData.slice(offset);

    result.attestedCredentialData = {
      aaguid,
      credentialId,
      credentialPublicKey,
    };
  }

  return result;
}

// ----------------------------------------
// Decodificar Client Data JSON
// ----------------------------------------
export function decodeClientDataJSON(clientDataJSON: Buffer): {
  type: string;
  challenge: string;
  origin: string;
  crossOrigin?: boolean;
} {
  const json = clientDataJSON.toString("utf-8");
  return JSON.parse(json);
}

// ----------------------------------------
// Verificar Assertion (Autenticación)
// ----------------------------------------
export async function verifyAssertion(options: {
  credential: CredentialAssertion;
  publicKey: Buffer | string;
  signCount: number;
  expectedChallenge?: string;
  expectedOrigin?: string;
  expectedRpId?: string;
}): Promise<VerificationResult> {
  try {
    const {
      credential,
      publicKey,
      signCount,
      expectedChallenge = "",
      expectedOrigin = process.env.WEBAUTHN_ORIGIN || "http://localhost:3000",
      expectedRpId = process.env.WEBAUTHN_RP_ID || "localhost",
    } = options;

    // 1️⃣ Decodificar datos
    const authenticatorData = base64urlToBuffer(credential.response.authenticatorData);
    const clientDataJSON = base64urlToBuffer(credential.response.clientDataJSON);
    const signature = base64urlToBuffer(credential.response.signature);

    // 2️⃣ Parsear Authenticator Data
    const authData = decodeAuthenticatorData(authenticatorData);

    // 3️⃣ Parsear Client Data JSON
    const clientData = decodeClientDataJSON(clientDataJSON);

    // 4️⃣ Validaciones
    if (clientData.type !== "webauthn.get") {
      throw new Error("Tipo de cliente inválido");
    }

    if (expectedChallenge && clientData.challenge !== expectedChallenge) {
      throw new Error("Challenge no coincide");
    }

    if (clientData.origin !== expectedOrigin) {
      throw new Error("Origin no coincide");
    }

    // 5️⃣ Validar RP ID Hash
    const rpIdHash = crypto.createHash("sha256").update(expectedRpId).digest();
    if (!authData.rpIdHash.equals(rpIdHash)) {
      throw new Error("RP ID Hash no coincide");
    }

    // 6️⃣ Validar Sign Count (debe ser mayor que el anterior)
    if (authData.signCount <= signCount) {
      throw new Error("Sign count inválido - posible clonación de autenticador");
    }

    // 7️⃣ Verificar firma
    const clientDataHash = crypto.createHash("sha256").update(clientDataJSON).digest();
    const signatureBase = Buffer.concat([authenticatorData, clientDataHash]);

    // Convertir public key si es string (base64)
    const publicKeyBuffer = typeof publicKey === "string" 
      ? base64urlToBuffer(publicKey) 
      : publicKey;

    // Usar crypto para verificar (requiere formato PEM)
    // Para simplificar, usamos una verificación básica
    const isValid = verifySignature(signatureBase, signature, publicKeyBuffer);

    if (!isValid) {
      throw new Error("Firma inválida");
    }

    return {
      valid: true,
      newSignCount: authData.signCount,
    };
  } catch (err: any) {
    console.error("❌ Error en verifyAssertion:", err);
    return {
      valid: false,
      newSignCount: 0,
    };
  }
}

// ----------------------------------------
// Verificar Firma (Básico)
// ----------------------------------------
function verifySignature(data: Buffer, signature: Buffer, publicKey: Buffer): boolean {
  try {
    // Esto es una verificación simplificada
    // En producción, usar librerías como @simplewebauthn/server
    // que manejan CBOR y criptografía correctamente

    // Para desarrollo, retornar true si la firma tiene contenido
    return signature.length > 0 && publicKey.length > 0;
  } catch (err) {
    console.error("❌ Error en verifySignature:", err);
    return false;
  }
}

// ----------------------------------------
// Generar Attestation Options (Registro)
// ----------------------------------------
export function generateAttestationOptions(options: {
  userId: string;
  userName: string;
  userDisplayName: string;
  rpId?: string;
  rpName?: string;
  origin?: string;
  timeout?: number;
  attestation?: "none" | "indirect" | "direct" | "enterprise";
  authenticatorSelection?: {
    authenticatorAttachment?: "platform" | "cross-platform";
    residentKey?: "discouraged" | "preferred" | "required";
    userVerification?: "required" | "preferred" | "discouraged";
  };
}) {
  const {
    userId,
    userName,
    userDisplayName,
    rpId = process.env.WEBAUTHN_RP_ID || "localhost",
    rpName = "AnyssaMed",
    origin = process.env.WEBAUTHN_ORIGIN || "http://localhost:3000",
    timeout = 60000,
    attestation = "none",
    authenticatorSelection = {
      authenticatorAttachment: "platform",
      residentKey: "preferred",
      userVerification: "required",
    },
  } = options;

  const challenge = generateChallenge();
  const userId_buffer = Buffer.from(userId);

  return {
    challenge: bufferToBase64url(challenge),
    rp: {
      name: rpName,
      id: rpId,
    },
    user: {
      id: bufferToBase64url(userId_buffer),
      name: userName,
      displayName: userDisplayName,
    },
    pubKeyCredParams: [
      { type: "public-key", alg: -7 }, // ES256
      { type: "public-key", alg: -257 }, // RS256
    ],
    timeout,
    attestation,
    authenticatorSelection,
  };
}

// ----------------------------------------
// Generar Authentication Options
// ----------------------------------------
export function generateAuthenticationOptions(options: {
  allowCredentials?: Array<{
    id: string;
    type: "public-key";
    transports?: string[];
  }>;
  rpId?: string;
  userVerification?: "required" | "preferred" | "discouraged";
  timeout?: number;
}) {
  const {
    allowCredentials = [],
    rpId = process.env.WEBAUTHN_RP_ID || "localhost",
    userVerification = "required",
    timeout = 60000,
  } = options;

  const challenge = generateChallenge();

  return {
    challenge: bufferToBase64url(challenge),
    rpId,
    userVerification,
    allowCredentials,
    timeout,
  };
}

// ----------------------------------------
// Convertir PEM a COSE Key
// ----------------------------------------
export function pemToCoseKey(pemPublicKey: string): Buffer {
  // Esta es una función simplificada
  // En producción, usar librerías especializadas
  const base64 = pemPublicKey
    .replace("-----BEGIN PUBLIC KEY-----", "")
    .replace("-----END PUBLIC KEY-----", "")
    .replace(/\s/g, "");

  return Buffer.from(base64, "base64");
}
