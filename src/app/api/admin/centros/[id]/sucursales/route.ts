// frontend/src/app/api/admin/centros/[id]/sucursales/route.ts
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { RowDataPacket } from "mysql2";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    console.log(`🏢 GET /api/admin/centros/${params.id}/sucursales`);

    const [sucursales] = await pool.query<RowDataPacket[]>(
      `SELECT 
        s.*,
        COUNT(DISTINCT u.id_usuario) as usuarios_count,
        COUNT(DISTINCT m.id_medico) as profesionales_salud_count
      FROM sucursales s
      LEFT JOIN usuarios u ON s.id_sucursal = u.id_sucursal_principal
      LEFT JOIN profesionales_salud m ON s.id_sucursal = m.id_sucursal_principal
      WHERE s.id_centro = ?
      GROUP BY s.id_sucursal
      ORDER BY s.fecha_creacion DESC`,
      [params.id]
    );

    console.log(`✅ ${sucursales.length} sucursales encontradas`);

    return NextResponse.json({
      success: true,
      data: sucursales,
      total: sucursales.length,
    });
  } catch (error: any) {
    console.error(`❌ Error en GET /api/admin/centros/${params.id}/sucursales:`, error);
    return NextResponse.json(
      {
        success: false,
        error: "Error al obtener sucursales",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
