// frontend/src/app/api/admin/farmacia/convenios/[id]/route.ts
import { NextResponse } from "next/server";
import pool from "@/lib/db";
import type { RowDataPacket, ResultSetHeader } from "mysql2/promise";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  try {
    const id = Number(params.id);
    if (!Number.isFinite(id)) {
      return NextResponse.json({ success: false, error: "ID inválido" }, { status: 400 });
    }

    const [rows] = await pool.query<RowDataPacket[]>(
      `
      SELECT
        c.*,
        c.nombre_convenio AS nombre,
        CASE
          WHEN c.fecha_fin IS NOT NULL AND c.fecha_fin < CURDATE() THEN 'vencido'
          WHEN c.fecha_inicio IS NOT NULL AND c.fecha_inicio > CURDATE() THEN 'pendiente'
          ELSE c.estado
        END AS estado_calculado
      FROM farmacia_convenios c
      WHERE c.id_convenio = ?
      LIMIT 1
      `,
      [id]
    );

    if (!(rows as any).length) {
      return NextResponse.json({ success: false, error: "Convenio no encontrado" }, { status: 404 });
    }

    const convenio = (rows as any)[0];
    return NextResponse.json({ success: true, convenio });
  } catch (error: any) {
    console.error("GET /farmacia/convenios/[id] error:", error);
    return NextResponse.json({ success: false, error: error?.message || "Error interno" }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const conn = await pool.getConnection();
  try {
    const id = Number(params.id);
    if (!Number.isFinite(id)) {
      return NextResponse.json({ success: false, error: "ID inválido" }, { status: 400 });
    }

    const body = await req.json();
    const {
      id_centro = null,
      id_proveedor = null,
      nombre_convenio = null,
      descripcion = null,
      fecha_inicio = null,
      fecha_fin = null,
      descuento_porcentaje = null,
      condiciones = null,
      restricciones = null,
      estado = null, // 'activo' | 'inactivo' | 'pendiente' | 'vencido'
      documentos_url = null,
      codigo_convenio = null,
      contacto_convenio = null,
      contacto_telefono = null,
      contacto_email = null,
      creado_por = null, // por si deseas reasignarlo
    } = body || {};

    await conn.beginTransaction();

    const [exists] = await conn.query<RowDataPacket[]>(
      `SELECT id_convenio FROM farmacia_convenios WHERE id_convenio = ? FOR UPDATE`,
      [id]
    );
    if (!(exists as any).length) {
      await conn.rollback();
      return NextResponse.json({ success: false, error: "Convenio no encontrado" }, { status: 404 });
    }

    await conn.query<ResultSetHeader>(
      `
      UPDATE farmacia_convenios
      SET
        id_centro = COALESCE(?, id_centro),
        id_proveedor = COALESCE(?, id_proveedor),
        nombre_convenio = COALESCE(?, nombre_convenio),
        descripcion = COALESCE(?, descripcion),
        fecha_inicio = COALESCE(?, fecha_inicio),
        fecha_fin = COALESCE(?, fecha_fin),
        descuento_porcentaje = COALESCE(?, descuento_porcentaje),
        condiciones = COALESCE(?, condiciones),
        restricciones = COALESCE(?, restricciones),
        estado = COALESCE(?, estado),
        documentos_url = COALESCE(?, documentos_url),
        codigo_convenio = COALESCE(?, codigo_convenio),
        contacto_convenio = COALESCE(?, contacto_convenio),
        contacto_telefono = COALESCE(?, contacto_telefono),
        contacto_email = COALESCE(?, contacto_email),
        creado_por = COALESCE(?, creado_por),
        fecha_modificacion = NOW()
      WHERE id_convenio = ?
      `,
      [
        id_centro,
        id_proveedor,
        nombre_convenio,
        descripcion,
        fecha_inicio,
        fecha_fin,
        descuento_porcentaje,
        condiciones,
        restricciones,
        estado,
        documentos_url,
        codigo_convenio,
        contacto_convenio,
        contacto_telefono,
        contacto_email,
        creado_por,
        id,
      ]
    );

    await conn.commit();
    return NextResponse.json({ success: true });
  } catch (error: any) {
    await (conn as any).rollback?.().catch(() => {});
    console.error("PUT /farmacia/convenios/[id] error:", error);
    return NextResponse.json({ success: false, error: error?.message || "Error interno" }, { status: 500 });
  } finally {
    (conn as any).release?.();
  }
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  try {
    const id = Number(params.id);
    if (!Number.isFinite(id)) {
      return NextResponse.json({ success: false, error: "ID inválido" }, { status: 400 });
    }

    const [res] = await pool.query<ResultSetHeader>(
      `DELETE FROM farmacia_convenios WHERE id_convenio = ?`,
      [id]
    );

    if (res.affectedRows === 0) {
      return NextResponse.json({ success: false, error: "Convenio no encontrado" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("DELETE /farmacia/convenios/[id] error:", error);
    return NextResponse.json({ success: false, error: error?.message || "Error interno" }, { status: 500 });
  }
}
