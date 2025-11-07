// frontend/src/lib/database/connection.ts
import mysql from "mysql2/promise";

// Crear pool de conexiones
const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASS || "",
  database: process.env.DB_NAME || "Anyssamed",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
});

// Test de conexión
pool.getConnection()
  .then((connection) => {
    console.log("✅ Conectado a MySQL - Base de datos:", process.env.DB_NAME);
    connection.release();
  })
  .catch((err) => {
    console.error("❌ Error conectando a MySQL:", err.message);
  });

export default pool;
