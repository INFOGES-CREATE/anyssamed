// frontend/src/lib/logs.ts
import pool from "@/lib/db";
import { ResultSetHeader } from "mysql2";

interface LogData {
  id_usuario?: number | null;
  tipo: "info" | "warning" | "error" | "security" | "audit";
  modulo: string;
  accion: string;
  descripcion: string;
  ip_origen?: string;
  agente_usuario?: string;
  objeto_tipo?: string;
  objeto_id?: string;
  datos_antiguos?: any;
  datos_nuevos?: any;
  exitoso?: boolean;
  mensaje_error?: string;
  nivel_severidad?: number;
}

export async function registrarLog(data: LogData) {
  let connection;
  try {
    connection = await pool.getConnection();

    await connection.query(
      `INSERT INTO logs_sistema (
        id_usuario, tipo, modulo, accion, descripcion,
        ip_origen, agente_usuario, objeto_tipo, objeto_id,
        datos_antiguos, datos_nuevos, exitoso, mensaje_error, nivel_severidad
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        data.id_usuario || null,
        data.tipo,
        data.modulo,
        data.accion,
        data.descripcion,
        data.ip_origen || null,
        data.agente_usuario || null,
        data.objeto_tipo || null,
        data.objeto_id || null,
        data.datos_antiguos ? JSON.stringify(data.datos_antiguos) : null,
        data.datos_nuevos ? JSON.stringify(data.datos_nuevos) : null,
        data.exitoso !== false,
        data.mensaje_error || null,
        data.nivel_severidad || 1,
      ]
    );

    connection.release();
  } catch (error) {
    console.error("Error al registrar log:", error);
    if (connection) connection.release();
  }
}
