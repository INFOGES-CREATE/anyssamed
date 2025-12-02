// frontend/src/lib/auth.ts
// 🔐 Módulo de Autenticación - MediSuite Pro
// ============================================================
// Compatibilidad total con Next.js 14 App Router
// Integra bcryptjs para contraseñas y JWT para sesiones
// ============================================================

import bcrypt from "bcryptjs";
import jwt, { JwtPayload } from "jsonwebtoken";
import pool from "@/lib/db";
import { RowDataPacket } from "mysql2";

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
// ✅ Función: hash de contraseña con bcrypt (para crear / resetear)
// ============================================================
export async function hashPassword(password: string): Promise<string> {
  try {
    if (!password) {
      throw new Error("Contraseña vacía");
    }
    const salt = await bcrypt.genSalt(12); // coste razonable
    return await bcrypt.hash(password, salt);
  } catch (err) {
    console.error("❌ Error al hashear contraseña:", err);
    throw new Error("No se pudo encriptar la contraseña");
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
// ✅ Función: generar token para biometría (WebAuthn)
// ============================================================
export function generateToken(payload: {
  id: number;
  email?: string;
  type?: "biometric_verified" | "password_verified" | "refresh";
}): string {
  try {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: "24h" });
  } catch (err) {
    console.error("❌ Error al generar token:", err);
    throw new Error("No se pudo generar el token");
  }
}

// ============================================================
// ✅ Función: verificar token JWT
// ============================================================
export function verifyToken(token: string): JwtPayload | null {
  try {
    if (!token) return null;
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
    console.log("✅ Token JWT verificado correctamente");
    return decoded;
  } catch (err: any) {
    console.error("⚠️ Token inválido o expirado:", err.message);
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
// 🆕 Función: CREAR SESIÓN EN BD (IMPORTANTE!)
// ============================================================
export async function createSessionInDB(
  idUsuario: number,
  token: string
): Promise<void> {
  try {
    console.log(`\n📝 ========== CREANDO SESIÓN EN BD ==========`);
    console.log(`📌 ID Usuario: ${idUsuario}`);
    console.log(`📌 Token: ${token.substring(0, 30)}...`);

    // Calcular fecha de expiración (7 días)
    const fechaExpiracion = new Date();
    fechaExpiracion.setDate(fechaExpiracion.getDate() + 7);

    // Convertir a formato MySQL (YYYY-MM-DD HH:mm:ss)
    const fechaExpiracionMySQL = fechaExpiracion
      .toISOString()
      .slice(0, 19)
      .replace("T", " ");

    console.log(`📌 Fecha expiración: ${fechaExpiracionMySQL}`);

    // Insertar en BD
    const [result] = await pool.query(
      `
      INSERT INTO sesiones_usuarios 
        (id_usuario, token, activa, fecha_creacion, fecha_expiracion, ultima_actividad)
      VALUES 
        (?, ?, 1, NOW(), ?, NOW())
      ON DUPLICATE KEY UPDATE
        token = VALUES(token),
        activa = 1,
        fecha_expiracion = VALUES(fecha_expiracion),
        ultima_actividad = NOW()
      `,
      [idUsuario, token, fechaExpiracionMySQL]
    );

    console.log(`✅ Sesión creada/actualizada en BD`);
    console.log(`========== FIN CREACIÓN SESIÓN ==========\n`);
  } catch (err: any) {
    console.error("❌ Error al crear sesión en BD:", err.message);
    throw new Error(`No se pudo crear la sesión: ${err.message}`);
  }
}

// ============================================================
// 🆕 Función: INVALIDAR SESIÓN EN BD (logout)
// ============================================================
export async function invalidateSessionInDB(token: string): Promise<void> {
  try {
    console.log(`📝 Invalidando sesión...`);

    await pool.query(
      `
      UPDATE sesiones_usuarios 
      SET activa = 0, fecha_expiracion = NOW()
      WHERE token = ?
      `,
      [token]
    );

    console.log(`✅ Sesión invalidada`);
  } catch (err: any) {
    console.error("❌ Error al invalidar sesión:", err.message);
    throw err;
  }
}

// ============================================================
// 🆕 Función: OBTENER SESIÓN DE BD
// ============================================================
export async function getSessionFromDB(
  token: string
): Promise<RowDataPacket | null> {
  try {
    const [rows] = await pool.query<RowDataPacket[]>(
      `
      SELECT 
        su.id_sesion,
        su.id_usuario,
        su.activa,
        su.fecha_expiracion,
        u.username,
        u.email,
        u.estado
      FROM sesiones_usuarios su
      INNER JOIN usuarios u ON u.id_usuario = su.id_usuario
      WHERE su.token = ?
        AND su.activa = 1
        AND (su.fecha_expiracion IS NULL OR su.fecha_expiracion > NOW())
        AND u.estado IN ('activo', 'pendiente_activacion')
      LIMIT 1
      `,
      [token]
    );

    return rows.length > 0 ? rows[0] : null;
  } catch (err: any) {
    console.error("❌ Error al obtener sesión de BD:", err.message);
    return null;
  }
}

// ============================================================
// 🧩 Exportación por defecto
// ============================================================
export default {
  verifyPassword,
  hashPassword,
  signSession,
  generateToken,
  verifyToken,
  decodeToken,
  refreshSession,
  createSessionInDB,
  invalidateSessionInDB,
  getSessionFromDB,
};
