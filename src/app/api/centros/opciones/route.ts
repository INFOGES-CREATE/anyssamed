// app/api/centros/opciones/route.ts
// Devuelve opciones para selects: centros, regiones, ciudades, estados
export const dynamic = "force-dynamic";

export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { RowDataPacket } from "mysql2";

// ---------------------------------------------------------
// GET — obtener opciones rápidas
// ---------------------------------------------------------
export async function GET(req: NextRequest) {
  try {
    // ------------------------------------------
    // Centros activos
    // ------------------------------------------
    const [centros] = await pool.query<RowDataPacket[]>(
      `
      SELECT 
        id_centro,
        nombre,
        ciudad,
        region,
        estado
      FROM centros_medicos
      WHERE estado = 'activo'
      ORDER BY nombre ASC
      `
    );

    // ------------------------------------------
    // Regiones
    // ------------------------------------------
    const [regiones] = await pool.query<RowDataPacket[]>(
      `
      SELECT DISTINCT region
      FROM centros_medicos
      WHERE region IS NOT NULL AND region <> ''
      ORDER BY region ASC
      `
    );

    // ------------------------------------------
    // Ciudades
    // ------------------------------------------
    const [ciudades] = await pool.query<RowDataPacket[]>(
      `
      SELECT DISTINCT ciudad
      FROM centros_medicos
      WHERE ciudad IS NOT NULL AND ciudad <> ''
      ORDER BY ciudad ASC
      `
    );

    // ------------------------------------------
    // Estados permitidos
    // ------------------------------------------
    const estadosCentro = ["activo", "inactivo", "suspendido"];

    return NextResponse.json(
      {
        success: true,
        opciones: {
          centros,
          regiones: regiones.map((r) => r.region),
          ciudades: ciudades.map((c) => c.ciudad),
          estados: estadosCentro,
        },
      },
      { status: 200 }
    );
  } catch (err: any) {
    console.error("❌ GET /api/centros/opciones:", err);
    return NextResponse.json(
      {
        success: false,
        error: "Error al obtener opciones",
        details: err.message,
      },
      { status: 500 }
    );
  }
}
