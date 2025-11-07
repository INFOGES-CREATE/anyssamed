//frontend\src\app\api\admin\facturacion\[id]\route.ts

import { NextResponse } from "next/server";
import pool from "@/lib/db";
import type { RowDataPacket, ResultSetHeader } from "mysql2/promise";

type DetalleInput = {
  tipo_item: string;
  codigo_item?: string | null;
  descripcion: string;
  cantidad: number;
  precio_unitario: number;
  descuento?: number;
  impuesto?: number;
  total?: number;         // puede venir, pero será recalculado
  id_cita?: number | null;
  id_procedimiento?: number | null;
  id_examen?: number | null;
  id_producto?: number | null;
  notas?: string | null;
  fecha_servicio?: string | null; // YYYY-MM-DD
};

const toNum = (v: any, d = 0) => (isNaN(Number(v)) ? d : Number(v));

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  try {
    const id = Number(params.id);
    if (!Number.isFinite(id)) {
      return NextResponse.json({ success: false, error: "ID inválido" }, { status: 400 });
    }

    const [factRows] = await pool.query<RowDataPacket[]>(
      `
      SELECT 
        f.*,
        p.rut AS paciente_rut,
        CONCAT_WS(' ', p.nombre, p.apellido_paterno, p.apellido_materno) AS paciente_nombre,
        p.email AS paciente_email,
        COALESCE(p.celular, p.telefono) AS paciente_telefono,
        c.nombre AS centro_nombre,
        c.telefono_principal AS centro_telefono,
        c.email_contacto AS centro_email,
        c.sitio_web AS centro_sitio_web,
        CONCAT_WS(' ', u.nombre, u.apellido_paterno, u.apellido_materno) AS creador_nombre
      FROM facturacion f
      LEFT JOIN pacientes p ON p.id_paciente = f.id_paciente
      LEFT JOIN centros_medicos c ON c.id_centro = f.id_centro
      LEFT JOIN usuarios u ON u.id_usuario = f.creado_por
      WHERE f.id_factura = ?
      `,
      [id]
    );

    if (!factRows.length) {
      return NextResponse.json({ success: false, error: "Factura no encontrada" }, { status: 404 });
    }

    const factura = factRows[0];

    const [detRows] = await pool.query<RowDataPacket[]>(
      `SELECT * FROM facturacion_detalles WHERE id_factura = ? ORDER BY id_detalle ASC`,
      [id]
    );

    const [txRows] = await pool.query<RowDataPacket[]>(
      `
      SELECT t.*, mp.nombre AS metodo_pago_nombre
      FROM transacciones t
      LEFT JOIN metodos_pago mp ON mp.id_metodo_pago = t.id_metodo_pago
      WHERE t.id_factura = ?
      ORDER BY t.fecha_transaccion DESC, t.id_transaccion DESC
      `,
      [id]
    );

    return NextResponse.json({
      success: true,
      factura,
      detalles: detRows,
      transacciones: txRows,
    });
  } catch (error: any) {
    console.error("GET /facturacion/[id] error:", error);
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
      // campos de factura
      numero_factura = null,
      tipo_documento = null,
      fecha_emision = null,
      fecha_vencimiento = null,
      moneda = null,
      notas = null,
      datos_facturacion = null,
      id_convenio = null,
      id_aseguradora = null,
      cobertura_seguro = null,
      emitida_electronica = null,
      url_documento = null,
      enviada_paciente = null,
      fecha_envio = null,
      metodo_pago = null,
      referencia_pago = null,

      // posibilidad de reemplazar detalles completamente
      detalles: detallesInput = null,
      // permitir tocar subtotal/impuestos/descuentos/total si viene sin detalles (igual recalc por seguridad)
      subtotal = null,
      impuestos = null,
      descuentos = null,
      total = null,
    } = body || {};

    await conn.beginTransaction();

    // Traer factura actual (para recalcular saldo)
    const [curRows] = await conn.query<RowDataPacket[]>(
      `SELECT id_factura, total, pagado, saldo, estado FROM facturacion WHERE id_factura = ? FOR UPDATE`,
      [id]
    );
    if (!(curRows as any).length) {
      await conn.rollback();
      return NextResponse.json({ success: false, error: "Factura no encontrada" }, { status: 404 });
    }
    const current = (curRows as any)[0];

    let newSubtotal = toNum(subtotal, undefined as any);
    let newImpuestos = toNum(impuestos, undefined as any);
    let newDescuentos = toNum(descuentos, undefined as any);
    let newTotal = toNum(total, undefined as any);

    // Si vienen detalles, reemplazamos todos y recalculamos totales
    if (Array.isArray(detallesInput)) {
      await conn.query(`DELETE FROM facturacion_detalles WHERE id_factura = ?`, [id]);

      let sSub = 0, sImp = 0, sDesc = 0, sTot = 0;

      for (const d of detallesInput as DetalleInput[]) {
        const cant = toNum(d.cantidad, 0);
        const punit = toNum(d.precio_unitario, 0);
        const desc = toNum(d.descuento, 0);
        const imp = toNum(d.impuesto, 0);

        const lineSub = cant * punit;
        const lineDesc = desc;
        const base = Math.max(0, lineSub - lineDesc);
        const lineImp = imp;
        const lineTot = base + lineImp;

        sSub += lineSub;
        sDesc += lineDesc;
        sImp += lineImp;
        sTot += lineTot;

        await conn.query<ResultSetHeader>(
          `
          INSERT INTO facturacion_detalles
            (id_factura, tipo_item, codigo_item, descripcion, cantidad, precio_unitario,
             subtotal, descuento, impuesto, total, id_cita, id_procedimiento, id_examen, id_producto, notas, fecha_servicio)
          VALUES
            (?, ?, ?, ?, ?, ?,
             ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `,
          [
            id,
            d.tipo_item,
            d.codigo_item ?? null,
            d.descripcion,
            cant,
            punit,
            lineSub,
            lineDesc,
            lineImp,
            lineTot,
            d.id_cita ?? null,
            d.id_procedimiento ?? null,
            d.id_examen ?? null,
            d.id_producto ?? null,
            d.notas ?? null,
            d.fecha_servicio ?? null,
          ]
        );
      }

      newSubtotal = sSub;
      newDescuentos = sDesc;
      newImpuestos = sImp;
      newTotal = sTot;
    }

    // Si no vinieron detalles pero quieren tocar totales, normalizamos
    if (newSubtotal === undefined || newImpuestos === undefined || newDescuentos === undefined || newTotal === undefined) {
      // usar los valores actuales si no se reemplazan
      const [oldRows] = await conn.query<RowDataPacket[]>(
        `SELECT subtotal, impuestos, descuentos, total FROM facturacion WHERE id_factura = ?`,
        [id]
      );
      const old = (oldRows as any)[0];
      newSubtotal = newSubtotal === undefined ? Number(old.subtotal) : newSubtotal;
      newImpuestos = newImpuestos === undefined ? Number(old.impuestos) : newImpuestos;
      newDescuentos = newDescuentos === undefined ? Number(old.descuentos) : newDescuentos;
      newTotal = newTotal === undefined ? Number(old.total) : newTotal;
    }

    // Recalcular saldo en base a pagado actual
    const newSaldo = Math.max(0, Number(newTotal) - Number(current.pagado));
    let newEstado = current.estado;
    if (newSaldo === 0 && Number(current.pagado) >= Number(newTotal)) newEstado = "pagada";
    else if (Number(current.pagado) > 0 && newSaldo > 0) newEstado = "parcial";
    else if (newEstado === "pagada" && newSaldo > 0) newEstado = "emitida"; // si cambiaron total

    // Update principal
    await conn.query<ResultSetHeader>(
      `
      UPDATE facturacion
      SET
        numero_factura = COALESCE(?, numero_factura),
        tipo_documento = COALESCE(?, tipo_documento),
        fecha_emision = COALESCE(?, fecha_emision),
        fecha_vencimiento = COALESCE(?, fecha_vencimiento),
        moneda = COALESCE(?, moneda),
        notas = COALESCE(?, notas),
        datos_facturacion = COALESCE(?, datos_facturacion),
        id_convenio = COALESCE(?, id_convenio),
        id_aseguradora = COALESCE(?, id_aseguradora),
        cobertura_seguro = COALESCE(?, cobertura_seguro),
        emitida_electronica = COALESCE(?, emitida_electronica),
        url_documento = COALESCE(?, url_documento),
        enviada_paciente = COALESCE(?, enviada_paciente),
        fecha_envio = COALESCE(?, fecha_envio),
        metodo_pago = COALESCE(?, metodo_pago),
        referencia_pago = COALESCE(?, referencia_pago),
        subtotal = ?,
        impuestos = ?,
        descuentos = ?,
        total = ?,
        saldo = ?,
        estado = ?,
        fecha_modificacion = NOW()
      WHERE id_factura = ?
      `,
      [
        numero_factura, tipo_documento, fecha_emision, fecha_vencimiento, moneda,
        notas, datos_facturacion, id_convenio, id_aseguradora, cobertura_seguro,
        emitida_electronica, url_documento, enviada_paciente, fecha_envio,
        metodo_pago, referencia_pago,
        newSubtotal, newImpuestos, newDescuentos, newTotal, newSaldo, newEstado, id
      ]
    );

    await conn.commit();
    return NextResponse.json({ success: true });
  } catch (error: any) {
    await (conn as any).rollback?.().catch(() => {});
    console.error("PUT /facturacion/[id] error:", error);
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
      `DELETE FROM facturacion WHERE id_factura = ?`,
      [id]
    );
    if (res.affectedRows === 0) {
      return NextResponse.json({ success: false, error: "Factura no encontrada" }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("DELETE /facturacion/[id] error:", error);
    return NextResponse.json({ success: false, error: error?.message || "Error interno" }, { status: 500 });
  }
}
