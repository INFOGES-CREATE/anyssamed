// frontend\src\lib\auth.ts
// 🔐 Módulo de Autenticación - MediSuite Pro
// ============================================================
// Compatibilidad total con Next.js 14 App Router
// Integra bcryptjs para contraseñas y JWT para sesiones
// ============================================================

import bcrypt from "bcryptjs";
import jwt, { JwtPayload } from "jsonwebtoken";

// ============================================================
// 🔧 Clave secreta JWT (usa variable de entorno en producción)
// ============================================================
const JWT_SECRET = process.env.JWT_SECRET || "clave-ultra-secreta-dev";

// ============================================================
// ✅ Función: verificar contraseña con bcrypt
// ============================================================
export async function verifyPassword(
  plainPassword: string,
  hashedPassword: string
): Promise<boolean> {
  try {
    if (!plainPassword || !hashedPassword) return false;

    // Si está en modo de prueba y no se usó hash, comparar directamente
    if (!hashedPassword.startsWith("$2")) {
      return plainPassword === hashedPassword;
    }

    // Comparación segura con bcrypt
    return await bcrypt.compare(plainPassword, hashedPassword);
  } catch (err) {
    console.error("❌ Error al verificar contraseña:", err);
    return false;
  }
}

// ============================================================
// ✅ Función: generar token de sesión JWT
// ============================================================
export function signSession(payload: Record<string, any>): string {
  try {
    // Firmar token con expiración de 8 horas
    return jwt.sign(payload, JWT_SECRET, { expiresIn: "8h" });
  } catch (err) {
    console.error("❌ Error al firmar token JWT:", err);
    throw new Error("No se pudo generar el token JWT");
  }
}

// ============================================================
// ✅ Función: verificar token JWT
// ============================================================
export function verifyToken(token: string): JwtPayload | null {
  try {
    if (!token) return null;
    return jwt.verify(token, JWT_SECRET) as JwtPayload;
  } catch (err) {
    console.error("⚠️ Token inválido o expirado:", err);
    return null;
  }
}

// ============================================================
// ✅ Función: decodificar token sin verificar (solo lectura rápida)
// ============================================================
export function decodeToken(token: string): JwtPayload | null {
  try {
    if (!token) return null;
    return jwt.decode(token) as JwtPayload;
  } catch (err) {
    console.error("⚠️ Error al decodificar token:", err);
    return null;
  }
}

// ============================================================
// 🔁 Función: refrescar token cuando está por expirar
// ============================================================
export function refreshSession(token: string): string | null {
  try {
    const decoded = verifyToken(token);
    if (!decoded) return null;

    const { iat, exp, ...payload } = decoded;
    return signSession(payload);
  } catch (err) {
    console.error("⚠️ No se pudo refrescar el token:", err);
    return null;
  }
}

// ============================================================
// 🧩 Exportación por defecto
// ============================================================
export default {
  verifyPassword,
  signSession,
  verifyToken,
  decodeToken,
  refreshSession,
};
