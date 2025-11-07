//frontend\src\app\api\admin\facturacion\reactivar-todas\route.ts

import { NextResponse } from "next/server";
import pool from "@/lib/db";
import crypto from "crypto";

/**
 * ============================================================
 *  API: /api/admin/facturacion/reactivar-todas
 *  Descripción: Reactiva todas las facturas anuladas o en revisión.
 *  Incluye:
 *   - Auditoría completa (tabla auditorias)
 *   - Control de errores transaccional
 *   - Hash de integridad
 *   - Retorno detallado
 * ============================================================
 */

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    // IP y contexto
    const ip_origen =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      "0.0.0.0";
    const user_agent = req.headers.get("user-agent") || "unknown";
    const entorno = process.env.NODE_ENV || "produccion";
    const servicio_origen = "api-admin-facturacion";
    const modulo = "facturacion";
    const accion = "reactivar_todas";
    const id_usuario = 1; // ✅ reemplazar por usuario autenticado
    const id_centro = 1; // ✅ opcional: contexto actual del centro

    // Actualización principal
    const [result]: any = await conn.query(`
      UPDATE facturacion
      SET estado = 'emitida',
          saldo = total - pagado,
          fecha_modificacion = NOW()
      WHERE estado IN ('anulada', 'en_revision')
    `);

    const reactivadas = result.affectedRows || 0;

    // ============================================================
    // AUDITORÍA
    // ============================================================
    const hash_integridad = crypto
      .createHash("sha256")
      .update(`${modulo}|${accion}|${reactivadas}|${Date.now()}`)
      .digest("hex");

    const datos_nuevos = JSON.stringify({
      total_reactivadas: reactivadas,
      fecha: new Date().toISOString(),
    });

    await conn.query(
      `
      INSERT INTO auditorias (
        id_transaccion_global, id_centro, id_usuario, entorno,
        accion, modulo, servicio_origen, tabla,
        datos_nuevos, ip_origen, user_agent, hash_integridad,
        resultado, nivel_criticidad, severidad_numerica,
        afecta_datos_sensibles, requiere_revision, sincronizado_cloud, detalle_adicional
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
        `Reactivadas ${reactivadas} facturas anuladas o en revisión`,
      ]
    );

    await conn.commit();

    return NextResponse.json({
      success: true,
      message: `✅ ${reactivadas} facturas reactivadas correctamente.`,
      reactivadas,
      audit_hash: hash_integridad,
    });
  } catch (err: any) {
    await conn.rollback();
    console.error("Error al reactivar facturas:", err);

    // Registrar auditoría de error
    try {
      const hash_error = crypto
        .createHash("sha256")
        .update(`error|reactivar_todas|${Date.now()}`)
        .digest("hex");

      await pool.query(
        `
        INSERT INTO auditorias (
          id_transaccion_global, accion, modulo, resultado,
          mensaje_error, hash_integridad, nivel_criticidad,
          severidad_numerica, requiere_revision
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
        [
          crypto.randomUUID(),
          "reactivar_todas",
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
      { success: false, error: err.message || "Error al reactivar facturas" },
      { status: 500 }
    );
  } finally {
    conn.release();
  }
}
