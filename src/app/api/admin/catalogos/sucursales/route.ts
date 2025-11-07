import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const centro = searchParams.get("centro");
    const args: any[] = [];
    const where = centro ? "WHERE id_centro = ? AND estado='activo'" : "WHERE estado='activo'";
    if (centro) args.push(Number(centro));

    const [rows]: any = await pool.query(
      `SELECT id_sucursal, id_centro, nombre FROM sucursales ${where} ORDER BY nombre ASC`,
      args
    );
    return NextResponse.json({ success: true, data: rows });
  } catch (error: any) {
    console.error("❌ catalogos/sucursales:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
