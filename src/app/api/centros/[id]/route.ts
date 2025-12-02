// app/api/centros/[id]/route.ts
// CRUD individual de centros médicos
// Compatible con Next.js 14 (App Router)
export const dynamic = "force-dynamic";

export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { RowDataPacket, ResultSetHeader } from "mysql2";

// ---------------------------------------------------------
// GET — Obtener centro por ID
// ---------------------------------------------------------
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = Number(params.id);

    if (!id || isNaN(id)) {
      return NextResponse.json(
        { success: false, error: "ID inválido" },
        { status: 400 }
      );
    }

    const [rows] = await pool.query<RowDataPacket[]>(
      `
      SELECT
        cm.*,
        cm.telefono_principal AS telefono,
        cm.email_contacto AS email,
        cm.fecha_modificacion AS fecha_actualizacion
      FROM centros_medicos cm
      WHERE cm.id_centro = ?
      LIMIT 1
      `,
      [id]
    );

    if (rows.length === 0) {
      return NextResponse.json(
        { success: false, error: "Centro no encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: rows[0] });
  } catch (err: any) {
    console.error("❌ GET /api/centros/[id]:", err);
    return NextResponse.json(
      { success: false, error: "Error interno", details: err.message },
      { status: 500 }
    );
  }
}

// ---------------------------------------------------------
// PUT — Actualizar centro
// ---------------------------------------------------------
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = Number(params.id);
    if (!id || isNaN(id)) {
      return NextResponse.json(
        { success: false, error: "ID inválido" },
        { status: 400 }
      );
    }

    const body = await req.json();

    const {
      nombre,
      razon_social,
      rut,
      direccion,
      ciudad,
      region,
      codigo_postal,
      telefono,
      email,
      sitio_web,
      logo_url,
      descripcion,
      horario_apertura,
      horario_cierre,
      dias_atencion,
      estado,
      capacidad_pacientes_dia,
      nivel_complejidad,
      especializacion_principal,
    } = body;

    const [result] = await pool.query<ResultSetHeader>(
      `
      UPDATE centros_medicos SET
        nombre = ?,
        razon_social = ?,
        rut = ?,
        direccion = ?,
        ciudad = ?,
        region = ?,
        codigo_postal = ?,
        telefono_principal = ?,
        email_contacto = ?,
        sitio_web = ?,
        logo_url = ?,
        descripcion = ?,
        horario_apertura = ?,
        horario_cierre = ?,
        dias_atencion = ?,
        estado = ?,
        capacidad_pacientes_dia = ?,
        nivel_complejidad = ?,
        especializacion_principal = ?
      WHERE id_centro = ?
      `,
      [
        nombre,
        razon_social,
        rut,
        direccion,
        ciudad,
        region,
        codigo_postal,
        telefono,
        email,
        sitio_web,
        logo_url,
        descripcion,
        horario_apertura,
        horario_cierre,
        dias_atencion,
        estado,
        capacidad_pacientes_dia,
        nivel_complejidad,
        especializacion_principal,
        id,
      ]
    );

    return NextResponse.json({
      success: true,
      message: "Centro actualizado correctamente",
    });
  } catch (err: any) {
    console.error("❌ PUT /api/centros/[id]:", err);
    return NextResponse.json(
      { success: false, error: "Error interno", details: err.message },
      { status: 500 }
    );
  }
}

// ---------------------------------------------------------
// DELETE — Eliminar centro
// ---------------------------------------------------------
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = Number(params.id);

    if (!id || isNaN(id)) {
      return NextResponse.json(
        { success: false, error: "ID inválido" },
        { status: 400 }
      );
    }

    await pool.query(
      `DELETE FROM centros_medicos WHERE id_centro = ? LIMIT 1`,
      [id]
    );

    return NextResponse.json({
      success: true,
      message: "Centro eliminado correctamente",
    });
  } catch (err: any) {
    console.error("❌ DELETE /api/centros/[id]:", err);
    return NextResponse.json(
      { success: false, error: "Error interno", details: err.message },
      { status: 500 }
    );
  }
}
