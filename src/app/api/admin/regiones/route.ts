//src\app\api\admin\regiones\route.ts
export const dynamic = "force-dynamic";


import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

// ============================================================
// GET /api/admin/regiones?id_pais=1
// ============================================================
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id_pais = searchParams.get("id_pais");

    let sql = `SELECT * FROM regiones`;
    let params: any[] = [];

    if (id_pais) {
      sql += ` WHERE id_pais = ?`;
      params.push(id_pais);
    }

    sql += ` ORDER BY nombre ASC`;

    const [rows] = await pool.query(sql, params);

    return NextResponse.json({
      success: true,
      data: rows,
    });

  } catch (error: any) {
    console.error("❌ GET regiones:", error);
    return NextResponse.json(
      { success: false, error: "Error al obtener regiones" },
      { status: 500 }
    );
  }
}

// ============================================================
// POST /api/admin/regiones
// ============================================================
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { id_pais, nombre, codigo } = body;

    if (!id_pais || !nombre) {
      return NextResponse.json(
        { success: false, error: "id_pais y nombre son obligatorios" },
        { status: 400 }
      );
    }

    const [result]: any = await pool.query(
      `INSERT INTO regiones (id_pais, nombre, codigo)
       VALUES (?, ?, ?)`,
      [id_pais, nombre, codigo || null]
    );

    return NextResponse.json({
      success: true,
      message: "Región creada",
      id_region: result.insertId,
    });
  } catch (error: any) {
    console.error("❌ POST regiones:", error);
    return NextResponse.json(
      { success: false, error: "Error al crear región" },
      { status: 500 }
    );
  }
}

// ============================================================
// PUT /api/admin/regiones?id=XX
// ============================================================
export async function PUT(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, error: "ID requerido" },
        { status: 400 }
      );
    }

    const body = await req.json();

    const fields = Object.keys(body);
    const values = Object.values(body);

    const setSql = fields.map((f) => `${f} = ?`).join(", ");

    await pool.query(
      `UPDATE regiones SET ${setSql} WHERE id_region = ?`,
      [...values, id]
    );

    return NextResponse.json({
      success: true,
      message: "Región actualizada",
    });
  } catch (error: any) {
    console.error("❌ PUT regiones:", error);
    return NextResponse.json(
      { success: false, error: "Error al actualizar región" },
      { status: 500 }
    );
  }
}

// ============================================================
// DELETE /api/admin/regiones?id=XX
// ============================================================
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, error: "ID requerido" },
        { status: 400 }
      );
    }

    await pool.query(`DELETE FROM regiones WHERE id_region = ?`, [id]);

    return NextResponse.json({
      success: true,
      message: "Región eliminada",
    });
  } catch (error: any) {
    console.error("❌ DELETE regiones:", error);
    return NextResponse.json(
      { success: false, error: "Error al eliminar región" },
      { status: 500 }
    );
  }
}
