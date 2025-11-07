//frontend\src\app\api\admin\facturacion\[id]\marcar-no-pagada\route.ts

import { NextResponse } from "next/server";
import pool from "@/lib/db";
import crypto from "crypto";

/**
 * ============================================================
 *  API: /api/admin/facturacion/[id]/marcar-no-pagada
 *  Descripción:
 *    Permite al administrador revertir una factura pagada,
 *    cambiándola a "emitida" y recalculando su saldo.
 *    Registra auditoría completa e integridad criptográfica.
 * ============================================================
 */

export const dynamic = "force-dynamic";

export async function POST(_req: Request, { params }: { params: { id: string } }) {
  const conn = await pool.getConnection();
  try {
    const id_factura = Number(params.id);
    if (!id_factura) {
      return NextResponse.json({ success: false, error: "ID de factura inválido" }, { status: 400 });
    }

    await conn.beginTransaction();

    // ==================== Contexto ====================
    const ip_origen =
      _req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      _req.headers.get("x-real-ip") ||
      "0.0.0.0";
    const user_agent = _req.headers.get("user-agent") || "unknown";
    const entorno = process.env.NODE_ENV || "produccion";
    const servicio_origen = "api-admin-facturacion";
    const modulo = "facturacion";
    const accion = "marcar_no_pagada";
    const id_usuario = 1; // ⚙️ reemplazar por usuario autenticado
    const id_centro = 1;  // ⚙️ reemplazar según contexto

    // ==================== Validar existencia ====================
    const [rowsFactura]: any = await conn.query(
      `SELECT id_factura, estado, total, pagado FROM facturacion WHERE id_factura = ?`,
      [id_factura]
    );

    if (rowsFactura.length === 0)
      return NextResponse.json({ success: false, error: "Factura no encontrada" }, { status: 404 });

    const factura = rowsFactura[0];

    if (factura.estado !== "pagada") {
      return NextResponse.json({
        success: false,
        error: `La factura no está pagada (estado actual: ${factura.estado})`,
      });
    }

    // ==================== Actualizar estado ====================
    const [result]: any = await conn.query(
      `
      UPDATE facturacion
      SET 
        estado = 'emitida',
        saldo = total - pagado,
        fecha_modificacion = NOW()
      WHERE id_factura = ? AND estado = 'pagada'
      `,
      [id_factura]
    );

    if (result.affectedRows === 0) {
      return NextResponse.json({
        success: false,
        error: "Factura no encontrada o ya revertida",
      });
    }

    // ==================== Auditoría ====================
    const hash_integridad = crypto
      .createHash("sha256")
      .update(`${modulo}|${accion}|${id_factura}|${Date.now()}`)
      .digest("hex");

    const datos_nuevos = JSON.stringify({
      id_factura,
      nuevo_estado: "emitida",
      saldo: factura.total - factura.pagado,
      fecha: new Date().toISOString(),
    });

    await conn.query(
      `
      INSERT INTO auditorias (
        id_transaccion_global, id_centro, id_usuario, entorno,
        accion, modulo, servicio_origen, tabla,
        entidad_id, entidad_tipo, datos_nuevos,
        ip_origen, user_agent, hash_integridad,
        resultado, nivel_criticidad, severidad_numerica,
        afecta_datos_sensibles, requiere_revision, sincronizado_cloud, detalle_adicional
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        crypto.randomUUID(),
        id_centro,
        id_usuario,
        entorno,
        accion,
        modulo,
        servicio_origen,
        "facturacion",
        id_factura.toString(),
        "factura",
        datos_nuevos,
        ip_origen,
        user_agent,
        hash_integridad,
        "exitoso",
        "alto",
        3,
        0,
        0,
        0,
        `Factura #${id_factura} revertida de "pagada" a "emitida" por administrador.`,
      ]
    );

    await conn.commit();

    return NextResponse.json({
      success: true,
      message: `✅ Factura #${id_factura} marcada como no pagada correctamente.`,
      audit_hash: hash_integridad,
    });
  } catch (err: any) {
    await conn.rollback();
    console.error("Error al marcar factura como no pagada:", err);

    // Auditoría de error
    try {
      const hash_error = crypto
        .createHash("sha256")
        .update(`error|marcar_no_pagada|${Date.now()}`)
        .digest("hex");

      await pool.query(
        `
        INSERT INTO auditorias (
          id_transaccion_global, accion, modulo, resultado,
          mensaje_error, hash_integridad, nivel_criticidad,
          severidad_numerica, requiere_revision
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
        [
          crypto.randomUUID(),
          "marcar_no_pagada",
          "facturacion",
          "error",
          err.message,
          hash_error,
          "critico",
          4,
          1,
        ]
      );
    } catch (e) {
      console.error("Error registrando auditoría de fallo:", e);
    }

    return NextResponse.json(
      { success: false, error: err.message || "Error al revertir factura" },
      { status: 500 }
    );
  } finally {
    conn.release();
  }
}
