// frontend/src/app/api/admin/roles/[id]/route.ts
import { NextResponse } from "next/server";
import pool from "@/lib/db";
import type { RowDataPacket, ResultSetHeader } from "mysql2/promise";

export const dynamic = "force-dynamic";

/* ============== GET detalle ============== */
export async function GET(_: Request, { params }: { params: { id: string } }) {
  try {
    const id = Number(params.id);
    if (!id) return NextResponse.json({ success: false, error: "id inválido" }, { status: 400 });

    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT id_rol, codigo, nombre, descripcion, permisos, activo, orden, created_at, updated_at
       FROM roles WHERE id_rol=? LIMIT 1`, [id]
    );
    const r: any = (rows as any[])[0];
    if (!r) return NextResponse.json({ success: false, error: "No existe" }, { status: 404 });

    r.permisos = r.permisos ? (Array.isArray(r.permisos) ? r.permisos : JSON.parse(r.permisos)) : [];

    return NextResponse.json({ success: true, item: r }, { headers: { "Cache-Control": "no-store" } });
  } catch (e: any) {
    console.error("GET /roles/[id] error:", e);
    return NextResponse.json({ success: false, error: e?.message ?? "Error inesperado" }, { status: 500 });
  }
}

/* ============== PUT update ============== */
export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const id = Number(params.id);
    if (!id) return NextResponse.json({ success: false, error: "id inválido" }, { status: 400 });

    const body = await req.json();
    const { codigo, nombre } = body || {};
    if (!codigo || !nombre) {
      return NextResponse.json({ success: false, error: "codigo y nombre son requeridos" }, { status: 400 });
    }

    const descripcion = body.descripcion ?? null;
    const permisosArr: string[] = Array.isArray(body.permisos) ? body.permisos.map(String) : [];
    const activo = body.activo === 0 || body.activo === "0" ? 0 : 1;
    const orden  = Number.isFinite(Number(body.orden)) ? Number(body.orden) : 100;

    await pool.query<ResultSetHeader>(
      `UPDATE roles
         SET codigo=?, nombre=?, descripcion=?, permisos=?, activo=?, orden=?
       WHERE id_rol=? LIMIT 1`,
      [String(codigo), String(nombre), descripcion, JSON.stringify(permisosArr), activo, orden, id]
    );

    return NextResponse.json({ success: true, id_rol: id }, { headers: { "Cache-Control": "no-store" } });
  } catch (e: any) {
    console.error("PUT /roles/[id] error:", e);
    return NextResponse.json({ success: false, error: e?.sqlMessage ?? e?.message ?? "Error inesperado" }, { status: 500 });
  }
}

/* ============== DELETE ============== */
export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  try {
    const id = Number(params.id);
    if (!id) return NextResponse.json({ success: false, error: "id inválido" }, { status: 400 });

    const [r] = await pool.query<ResultSetHeader>(`DELETE FROM roles WHERE id_rol=? LIMIT 1`, [id]);
    return NextResponse.json({ success: true, deleted: (r as ResultSetHeader).affectedRows > 0 }, { headers: { "Cache-Control": "no-store" } });
  } catch (e: any) {
    console.error("DELETE /roles/[id] error:", e);
    return NextResponse.json({ success: false, error: e?.sqlMessage ?? e?.message ?? "Error inesperado" }, { status: 500 });
  }
}
