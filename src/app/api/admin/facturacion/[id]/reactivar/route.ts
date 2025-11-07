//frontend\src\app\api\admin\facturacion\[id]\reactivar\route.ts

import { NextResponse } from "next/server";
import pool from "@/lib/db";
import crypto from "crypto";

/**
 * ============================================================
 *  API: /api/admin/facturacion/[id]/reactivar
 *  Descripción:
 *    Reactiva una factura específica anulada, volviendo su estado a “emitida”.
 *    Calcula el saldo, registra la auditoría y genera hash de integridad.
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
    const accion = "reactivar_factura";
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

    if (factura.estado !== "anulada") {
      return NextResponse.json({
        success: false,
        error: `La factura no está anulada (estado actual: ${factura.estado})`,
      });
    }

    // ==================== Reactivar factura ====================
    const [result]: any = await conn.query(
      `
      UPDATE facturacion
      SET estado = 'emitida',
          saldo = total - pagado,
          fecha_modificacion = NOW()
      WHERE id_factura = ? AND estado = 'anulada'
      `,
      [id_factura]
    );

    if (result.affectedRows === 0)
      return NextResponse.json({ success: false, error: "Factura no encontrada o ya activa" });

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
        "medio",
        2,
        0,
        0,
        0,
        `Factura #${id_factura} reactivada correctamente.`,
      ]
    );

    await conn.commit();

    return NextResponse.json({
      success: true,
      message: `✅ Factura #${id_factura} reactivada correctamente.`,
      audit_hash: hash_integridad,
    });
  } catch (err: any) {
    await conn.rollback();
    console.error("Error al reactivar factura:", err);

    // Auditoría de error
    try {
      const hash_error = crypto
        .createHash("sha256")
        .update(`error|reactivar_factura|${Date.now()}`)
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
          "reactivar_factura",
          "facturacion",
          "error",
          err.message,
          hash_error,
          "alto",
          3,
          1,
        ]
      );
    } catch (e) {
      console.error("Error registrando auditoría de fallo:", e);
    }

    return NextResponse.json(
      { success: false, error: err.message || "Error al reactivar factura" },
      { status: 500 }
    );
  } finally {
    conn.release();
  }
}
