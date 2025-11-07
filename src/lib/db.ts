// ===============================================================
// 📦 Archivo: src/lib/db.ts
// 🧠 Descripción: Configuración central de conexión a MySQL y utilidades
// ===============================================================

import mysql from "mysql2/promise";
import type { PoolConnection } from "mysql2/promise"; // ← (solo tipo)

// ===============================================================
// 🔗 Conexión al pool MySQL (segura, reutilizable y escalable)
// ===============================================================
const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASS || "",
  database: process.env.DB_NAME || "Anyssamed",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  multipleStatements: false,
  namedPlaceholders: true,
});

// ===============================================================
// 🧩 Función genérica para ejecutar consultas seguras
// ===============================================================
export async function query(sql: string, params: any[] = []) {
  try {
    const [rows] = await pool.query(sql, params);
    return rows;
  } catch (error: any) {
    console.error("❌ Error en query MySQL:", error.message);
    throw new Error(`Error en consulta: ${error.message}`);
  }
}

// ===============================================================
// 👤 Obtener usuario por email o username (para login o validaciones)
// ✅ Versión que PRIORIZA el rol MÉDICO y solo toma roles activos
// ===============================================================
export async function getUserByEmail(emailOrUsername: string) {
  const sql = `
    SELECT 
      u.id_usuario,
      u.email,
      u.username,
      u.nombre,
      u.apellido_paterno,
      u.password_hash,
      -- si no hay rol, devolvemos 'Sin Rol'
      COALESCE(r.nombre, 'Sin Rol') AS rol
    FROM usuarios u
    -- solo roles activos del usuario
    LEFT JOIN usuarios_roles ur 
      ON u.id_usuario = ur.id_usuario
      AND ur.activo = 1
    -- solo roles activos en la tabla roles
    LEFT JOIN roles r 
      ON ur.id_rol = r.id_rol
      AND r.estado = 'activo'
    WHERE (u.email = ? OR u.username = ?)
      AND u.estado = 'activo'
    -- PRIORIDAD de rol:
    -- 1) médico
    -- 2) superadmin
    -- 3) admin/administrativo
    -- 4) secretaria
    -- 5) técnico
    -- 6) lo que quede
    ORDER BY
      CASE
        WHEN LOWER(r.nombre) LIKE '%medico%' THEN 1
        WHEN LOWER(r.nombre) LIKE '%super%' THEN 2
        WHEN LOWER(r.nombre) LIKE '%admin%' THEN 3
        WHEN LOWER(r.nombre) LIKE '%secret%' THEN 4
        WHEN LOWER(r.nombre) LIKE '%tecnic%' THEN 5
        ELSE 99
      END,
      r.nivel_jerarquia DESC
    LIMIT 1
  `;
  const [rows]: any = await pool.query(sql, [emailOrUsername, emailOrUsername]);
  return Array.isArray(rows) && rows.length > 0 ? rows[0] : null;
}

// ===============================================================
// 🔒 Verificar credenciales del usuario
// ===============================================================
export async function verifyUserCredentials(emailOrUsername: string, passwordHash: string) {
  const user = await getUserByEmail(emailOrUsername);
  if (!user) return null;
  if (user.password_hash !== passwordHash) return null;
  return user;
}

// ===============================================================
// 📊 Ejemplo de utilidad: obtener estadísticas globales
// ===============================================================
export async function getGlobalStats() {
  const [[stats]]: any = await pool.query(`
    SELECT 
      (SELECT COUNT(*) FROM usuarios) AS total_usuarios,
      (SELECT COUNT(*) FROM pacientes) AS total_pacientes,
      (SELECT COUNT(*) FROM medicos) AS total_medicos,
      (SELECT COUNT(*) FROM centros_medicos) AS total_centros
  `);
  return stats;
}

// ===============================================================
// 🔌 NUEVO: obtener una conexión dedicada (para transacciones)
// ===============================================================
export async function getConnection(): Promise<PoolConnection> {
  const conn = await pool.getConnection();
  try {
    await conn.ping(); // valida la conexión
  } catch (e) {
    conn.release();
    throw e;
  }
  return conn;
}

// ===============================================================
// 🔁 NUEVO (opcional): helper para ejecutar en transacción
// ===============================================================
export async function withTransaction<T>(
  fn: (conn: PoolConnection) => Promise<T>
): Promise<T> {
  const conn = await getConnection();
  try {
    await conn.beginTransaction();
    const result = await fn(conn);
    await conn.commit();
    return result;
  } catch (err) {
    try { await conn.rollback(); } catch {}
    throw err;
  } finally {
    try { conn.release(); } catch {}
  }
}

// ===============================================================
// 🔁 Exportar conexión global
// ===============================================================
export default pool;

// (opcional) re-export del tipo para usarlo en rutas si quieres tipar parámetros
export type { PoolConnection };
