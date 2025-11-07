//frontend\src\app\api\admin\facturacion\desactivar-todas\route.ts

import { NextResponse } from "next/server";
import pool from "@/lib/db";
import crypto from "crypto";

/**
 * ============================================================
 *  API: /api/admin/facturacion/desactivar-todas
 *  Descripción: Cambia todas las facturas activas a estado "en_revision".
 *  Incluye:
 *   - Transacción segura
 *   - Auditoría completa (tabla auditorias)
 *   - Hash SHA-256 de integridad
 *   - Control de errores robusto
 * ============================================================
 */

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    // ==================== Contexto del request ====================
    const ip_origen =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      "0.0.0.0";
    const user_agent = req.headers.get("user-agent") || "unknown";
    const entorno = process.env.NODE_ENV || "produccion";
    const servicio_origen = "api-admin-facturacion";
    const modulo = "facturacion";
    const accion = "desactivar_todas";
    const id_usuario = 1; // ⚙️ Reemplazar con usuario autenticado
    const id_centro = 1; // ⚙️ Reemplazar según contexto

    // ==================== Actualización principal ====================
    const [result]: any = await conn.query(`
      UPDATE facturacion
      SET estado = 'en_revision',
          fecha_modificacion = NOW()
      WHERE estado IN ('emitida', 'pagada', 'parcial', 'vencida')
    `);

    const desactivadas = result.affectedRows || 0;

    // ==================== Auditoría ====================
    const hash_integridad = crypto
      .createHash("sha256")
      .update(`${modulo}|${accion}|${desactivadas}|${Date.now()}`)
      .digest("hex");

    const datos_nuevos = JSON.stringify({
      total_desactivadas: desactivadas,
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
        `Desactivadas ${desactivadas} facturas activas (emitida/pagada/parcial/vencida)`,
      ]
    );

    await conn.commit();

    return NextResponse.json({
      success: true,
      message: `⚠️ ${desactivadas} facturas marcadas como "en revisión" correctamente.`,
      desactivadas,
      audit_hash: hash_integridad,
    });
  } catch (err: any) {
    await conn.rollback();
    console.error("Error al desactivar facturas:", err);

    // Auditoría de error
    try {
      const hash_error = crypto
        .createHash("sha256")
        .update(`error|desactivar_todas|${Date.now()}`)
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
          "desactivar_todas",
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
      { success: false, error: err.message || "Error al desactivar facturas" },
      { status: 500 }
    );
  } finally {
    conn.release();
  }
}
