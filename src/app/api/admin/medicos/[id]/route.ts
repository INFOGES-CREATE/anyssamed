// 📁 frontend/src/app/api/admin/medicos/[id]/route.ts
import { NextResponse } from "next/server";
import pool from "@/lib/db";

// ==========================================================
// 🔹 OBTENER MÉDICO POR ID
// ==========================================================
export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const [rows]: any = await pool.query(
      `SELECT * FROM medicos WHERE id_medico = ?`,
      [params.id]
    );

    if (rows.length === 0) {
      return NextResponse.json({ success: false, error: "Médico no encontrado" }, { status: 404 });
    }

    return NextResponse.json({ success: true, medico: rows[0] });
  } catch (error: any) {
    console.error("❌ Error GET médico:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// ==========================================================
// 🔹 EDITAR MÉDICO
// ==========================================================
export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();

    const {
      titulo_profesional,
      universidad,
      ano_graduacion,
      biografia,
      estado,
    } = body;

    const [result]: any = await pool.query(
      `
      UPDATE medicos
      SET titulo_profesional = ?, universidad = ?, ano_graduacion = ?, biografia = ?, estado = ?, fecha_modificacion = NOW()
      WHERE id_medico = ?
      `,
      [titulo_profesional, universidad, ano_graduacion, biografia, estado, params.id]
    );

    if (result.affectedRows === 0) {
      return NextResponse.json({ success: false, error: "No se actualizó ningún registro" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Médico actualizado correctamente" });
  } catch (error: any) {
    console.error("❌ Error PUT médico:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// ==========================================================
// 🔹 ELIMINAR MÉDICO
// ==========================================================
export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const [result]: any = await pool.query(
      `DELETE FROM medicos WHERE id_medico = ?`,
      [params.id]
    );

    if (result.affectedRows === 0) {
      return NextResponse.json({ success: false, error: "Médico no encontrado" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Médico eliminado correctamente" });
  } catch (error: any) {
    console.error("❌ Error DELETE médico:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
