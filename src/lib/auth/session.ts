// ===============================================================
// 📦 Archivo: src/lib/auth/session.ts
// 🧠 Manejo de sesión: JWT + tabla sesiones_usuarios
// ===============================================================

import jwt from "jsonwebtoken";
import type { NextRequest } from "next/server";
import pool from "@/lib/db";
import { RowDataPacket, ResultSetHeader } from "mysql2";

// usa el mismo secreto que usas en /api/auth/login
const JWT_SECRET = process.env.JWT_SECRET || "dev-secret";

// ===============================================================
// 🧩 Tipos
// ===============================================================
interface JwtPayloadBase {
  id?: number;
  id_usuario?: number;
  userId?: number;
  uid?: number;
  email?: string;
  rol?: string;
  [key: string]: any;
}

interface DbSessionRow extends RowDataPacket {
  id_sesion: number;
  id_usuario: number;
  token: string;
  activa: number;
  fecha_expiracion: Date;
}

// ===============================================================
// 🧠 helper: sacar token del request (cookie o Authorization)
// ===============================================================
export function getTokenFromRequest(req: NextRequest): string | null {
  // 1) cookie "session"
  const cookieToken = req.cookies.get("session")?.value;
  if (cookieToken) return cookieToken;

  // 2) header Authorization
  const auth =
    req.headers.get("authorization") || req.headers.get("Authorization");
  if (auth && auth.startsWith("Bearer ")) {
    return auth.slice(7);
  }

  return null;
}

// ===============================================================
// 🧠 getSession: valida JWT y que exista en la tabla sesiones_usuarios
// ===============================================================
export async function getSession(req: NextRequest) {
  try {
    const token = getTokenFromRequest(req);
    if (!token) return null;

    // 1) validar el JWT
    let decoded: JwtPayloadBase;
    try {
      decoded = jwt.verify(token, JWT_SECRET) as JwtPayloadBase;
    } catch (e) {
      // si el JWT no es válido, no seguimos
      return null;
    }

    // obtener id de usuario del payload
    const idUsuario =
      decoded.id_usuario ||
      decoded.id ||
      decoded.userId ||
      decoded.uid ||
      null;

    if (!idUsuario) {
      return null;
    }

    // 2) validar en la tabla sesiones_usuarios que este token esté activo
    const [rows] = await pool.query<DbSessionRow[]>(
      `
      SELECT id_sesion, id_usuario, token, activa, fecha_expiracion
      FROM sesiones_usuarios
      WHERE token = ?
        AND id_usuario = ?
        AND activa = 1
        AND fecha_expiracion > NOW()
      LIMIT 1
      `,
      [token, idUsuario]
    );

    if (rows.length === 0) {
      // token no está vivo en DB
      return null;
    }

    // 3) actualizar última actividad
    await pool.query(
      `UPDATE sesiones_usuarios SET ultima_actividad = NOW() WHERE token = ?`,
      [token]
    );

    // devolvemos payload enriquecido
    return {
      ...decoded,
      id_usuario: idUsuario,
      token,
    };
  } catch (error) {
    console.error("❌ Error leyendo sesión:", error);
    return null;
  }
}

// ===============================================================
// 🧠 createDbSession: guardar una sesión en la tabla sesiones_usuarios
//     úsalo en el login justo después de firmar el JWT
// ===============================================================
export async function createDbSession(opts: {
  id_usuario: number;
  token: string;
  horas?: number; // duración
  ip?: string | null;
  userAgent?: string | null;
}) {
  const horas = opts.horas ?? 8; // por defecto 8 horas
  // ojo: tu tabla puede no tener ip/user_agent, usa solo lo que tengas
  await pool.query<ResultSetHeader>(
    `
    INSERT INTO sesiones_usuarios (
      id_usuario,
      token,
      activa,
      fecha_creacion,
      fecha_expiracion,
      ultima_actividad
      ${opts.ip ? ", ip_uso" : ""}
      ${opts.userAgent ? ", agente_usuario_uso" : ""}
    )
    VALUES (
      ?,
      ?,
      1,
      NOW(),
      DATE_ADD(NOW(), INTERVAL ? HOUR),
      NOW()
      ${opts.ip ? ", ?" : ""}
      ${opts.userAgent ? ", ?" : ""}
    )
    `,
    [
      opts.id_usuario,
      opts.token,
      horas,
      ...(opts.ip ? [opts.ip] : []),
      ...(opts.userAgent ? [opts.userAgent] : []),
    ]
  );
}

// ===============================================================
// 🔒 Verificar permisos según rol (igual que tenías)
// ===============================================================
export function hasPermission(session: any, rolesPermitidos: string[]) {
  if (!session || !session.rol) return false;

  const rolUsuario = session.rol
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, ""); // elimina acentos

  const rolesNormalizados = rolesPermitidos.map((r) =>
    r.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
  );

  return rolesNormalizados.includes(rolUsuario);
}
