import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET() {
  try {
    const [rows]: any = await pool.query(
      `SELECT id_centro, nombre FROM centros_medicos WHERE estado='activo' ORDER BY nombre ASC`
    );
    return NextResponse.json({ success: true, data: rows });
  } catch (error: any) {
    console.error("❌ catalogos/centros:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
