//src\app\api\admin\comunas\route.ts
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

// ========================= GET =========================
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id_region = searchParams.get("id_region");

    let sql = `SELECT * FROM comunas`;
    let params: any[] = [];

    if (id_region) {
      sql += ` WHERE id_region = ?`;
      params.push(id_region);
    }

    sql += ` ORDER BY nombre ASC`;

    const [rows] = await pool.query(sql, params);

    return NextResponse.json({ success: true, data: rows });

  } catch (error: any) {
    console.error("❌ GET comunas:", error);
    return NextResponse.json(
      { success: false, error: "Error al obtener comunas" },
      { status: 500 }
    );
  }
}

// ========================= POST =========================
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { id_region, nombre, codigo } = body;

    if (!id_region || !nombre) {
      return NextResponse.json(
        { success: false, error: "id_region y nombre son obligatorios" },
        { status: 400 }
      );
    }

    const [result]: any = await pool.query(
      `INSERT INTO comunas (id_region, nombre, codigo)
       VALUES (?, ?, ?)`,
      [id_region, nombre, codigo || null]
    );

    return NextResponse.json({
      success: true,
      message: "Comuna creada",
      id_comuna: result.insertId,
    });

  } catch (error: any) {
    console.error("❌ POST comunas:", error);
    return NextResponse.json(
      { success: false, error: "Error al crear comuna" },
      { status: 500 }
    );
  }
}

// ========================= PUT =========================
export async function PUT(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const body = await req.json();

    const fields = Object.keys(body).map((f) => `${f} = ?`).join(", ");
    const values = Object.values(body);

    await pool.query(
      `UPDATE comunas SET ${fields} WHERE id_comuna = ?`,
      [...values, id]
    );

    return NextResponse.json({
      success: true,
      message: "Comuna actualizada",
    });

  } catch (error: any) {
    console.error("❌ PUT comunas:", error);
    return NextResponse.json(
      { success: false, error: "Error al actualizar comuna" },
      { status: 500 }
    );
  }
}

// ========================= DELETE =========================
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    await pool.query(`DELETE FROM comunas WHERE id_comuna = ?`, [id]);

    return NextResponse.json({
      success: true,
      message: "Comuna eliminada",
    });

  } catch (error: any) {
    console.error("❌ DELETE comunas:", error);
    return NextResponse.json(
      { success: false, error: "Error al eliminar comuna" },
      { status: 500 }
    );
  }
}
