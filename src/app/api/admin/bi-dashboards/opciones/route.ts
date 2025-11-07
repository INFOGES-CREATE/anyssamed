import { NextResponse } from "next/server";
import mysql from "mysql2/promise";

export const dynamic = "force-dynamic";

function getPool() {
  const {
    MYSQL_HOST, MYSQL_PORT, MYSQL_DATABASE, MYSQL_USER, MYSQL_PASSWORD,
    DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASS,
  } = process.env;

  // @ts-ignore
  if (!globalThis.__DB_POOL__) {
    // @ts-ignore
    globalThis.__DB_POOL__ = mysql.createPool({
      host: MYSQL_HOST || DB_HOST || "localhost",
      port: Number(MYSQL_PORT || DB_PORT || 3306),
      user: MYSQL_USER || DB_USER || "root",
      password: MYSQL_PASSWORD || DB_PASS || "",
      database: MYSQL_DATABASE || DB_NAME || "Anyssamed",
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      // IMPORTANTE: charset es el set de caracteres, no la collation
      charset: "utf8mb4",
      dateStrings: true,
    });
  }
  // @ts-ignore
  return globalThis.__DB_POOL__ as mysql.Pool;
}

export async function GET() {
  try {
    const pool = getPool();

    // Asegura collation en la sesión (opcional pero útil si la BD está en unicode_ci)
    await pool.query("SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci");

    const [rows] = await pool.query(
      "SELECT id_centro AS value, nombre AS label FROM centros_medicos ORDER BY nombre ASC"
    );

    // Asegura objetos JSON planos (no RowDataPacket)
    const centros = (Array.isArray(rows) ? rows : []).map((r: any) => ({
      value: r.value,
      label: String(r.label ?? ""),
    }));

    const tipos = [
      { value: "operativo", label: "operativo" },
      { value: "clinico", label: "clinico" },
      { value: "financiero", label: "financiero" },
      { value: "administrativo", label: "administrativo" },
      { value: "ejecutivo", label: "ejecutivo" },
      { value: "personalizado", label: "personalizado" },
    ];

    return NextResponse.json({ success: true, centros, tipos });
  } catch (e: any) {
    return NextResponse.json(
      { success: false, error: e?.message || "Error" },
      { status: 500 }
    );
  }
}
