//frontend/src/app/api/admin/medicos/next-registro/route.ts

import { NextResponse } from "next/server";
import pool from "@/lib/db";

// GET /api/admin/medicos/next-registro
// Devuelve el próximo correlativo basado en MAX(numero_registro_medico) + 1.
// Parte en 1000 si no hay registros.
export async function GET() {
  try {
    const [[row]]: any = await pool.query(`
      SELECT COALESCE(MAX(CAST(numero_registro_medico AS UNSIGNED)), 999) + 1 AS next
      FROM medicos
    `);

    const next = String(row?.next ?? 1000);
    return NextResponse.json({ success: true, next });
  } catch (error: any) {
    console.error("❌ Error next-registro:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
