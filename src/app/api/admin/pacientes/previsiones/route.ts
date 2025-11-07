import { NextResponse } from "next/server";
import pool from "@/lib/db";

export const dynamic = "force-dynamic";
export const revalidate = 0;

/**
 * ============================================================
 *  📘 API: /api/admin/previsiones
 *  Descripción:
 *    - Devuelve todas las previsiones de salud disponibles
 *    - Soporta búsqueda, filtrado por tipo y estado
 *    - Formato JSON estandarizado para frontend
 * ============================================================
 */

type Filtro = {
  tipo?: string;
  activo?: string;
  search?: string;
};

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const filtros: Filtro = {
      tipo: searchParams.get("tipo") || "",
      activo: searchParams.get("activo") || "",
      search: searchParams.get("search") || "",
    };

    // 🔎 Validar existencia de tabla
    const [tableExists]: any = await pool.query(`
      SELECT COUNT(*) AS existe
      FROM information_schema.tables
      WHERE table_schema = DATABASE() AND table_name = 'previsiones_salud'
    `);
    if (!tableExists?.[0]?.existe) {
      return NextResponse.json(
        { success: false, error: "La tabla previsiones_salud no existe" },
        { status: 404 }
      );
    }

    // 🔧 Construcción dinámica del filtro SQL
    const where: string[] = [];
    const params: any[] = [];

    if (filtros.tipo) {
      where.push("tipo = ?");
      params.push(filtros.tipo);
    }

    if (filtros.activo) {
      where.push("activo = ?");
      params.push(Number(filtros.activo));
    }

    if (filtros.search) {
      where.push("(nombre LIKE ? OR codigo LIKE ?)");
      params.push(`%${filtros.search}%`, `%${filtros.search}%`);
    }

    const whereSQL = where.length ? `WHERE ${where.join(" AND ")}` : "";

    // 🩺 Consulta principal
    const [rows]: any = await pool.query(
      `
      SELECT 
        id_prevision,
        nombre,
        codigo,
        tipo,
        cobertura,
        CASE WHEN activo = 1 THEN 'Activo' ELSE 'Inactivo' END AS estado,
        activo,
        DATE_FORMAT(fecha_creacion, '%Y-%m-%d %H:%i:%s') AS fecha_creacion,
        DATE_FORMAT(fecha_actualizacion, '%Y-%m-%d %H:%i:%s') AS fecha_actualizacion
      FROM previsiones_salud
      ${whereSQL}
      ORDER BY tipo, nombre ASC
      `,
      params
    );

    // 📊 Estadísticas resumen
    const [stats]: any = await pool.query(`
      SELECT 
        COUNT(*) AS total,
        SUM(CASE WHEN activo=1 THEN 1 ELSE 0 END) AS activas,
        SUM(CASE WHEN tipo='Pública' THEN 1 ELSE 0 END) AS publicas,
        SUM(CASE WHEN tipo='Privada' THEN 1 ELSE 0 END) AS privadas,
        SUM(CASE WHEN tipo LIKE '%Internacional%' THEN 1 ELSE 0 END) AS internacionales
      FROM previsiones_salud;
    `);

    return NextResponse.json({
      success: true,
      total: rows.length,
      data: rows,
      stats: stats?.[0] || {},
      filtros_aplicados: filtros,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("❌ GET /api/admin/previsiones:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Error interno" },
      { status: 500 }
    );
  }
}

/**
 * ============================================================
 *  POST: Crear nueva previsión (admin)
 * ============================================================
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();

    const { nombre, codigo, tipo, cobertura, activo = 1 } = body;
    if (!nombre || !codigo || !tipo) {
      return NextResponse.json(
        { success: false, error: "Campos requeridos: nombre, codigo, tipo" },
        { status: 400 }
      );
    }

    const [exists]: any = await pool.query(
      "SELECT id_prevision FROM previsiones_salud WHERE codigo = ? LIMIT 1",
      [codigo]
    );
    if (exists.length > 0) {
      return NextResponse.json(
        { success: false, error: `El código '${codigo}' ya existe` },
        { status: 409 }
      );
    }

    await pool.query(
      `INSERT INTO previsiones_salud (nombre, codigo, tipo, cobertura, activo)
       VALUES (?, ?, ?, ?, ?)`,
      [nombre, codigo, tipo, cobertura || "Nacional", activo ? 1 : 0]
    );

    return NextResponse.json({
      success: true,
      message: "Previsión agregada correctamente",
      data: { nombre, codigo, tipo, cobertura, activo },
    });
  } catch (error: any) {
    console.error("❌ POST /api/admin/previsiones:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Error al crear previsión" },
      { status: 500 }
    );
  }
}
