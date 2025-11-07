//frontend\src\app\api\admin\facturacion\[id]\anular\route.ts

import { NextResponse } from "next/server";
import pool from "@/lib/db";
import type { RowDataPacket, ResultSetHeader } from "mysql2/promise";
import { createHash, randomUUID } from "crypto";

function getClientIp(req: Request) {
  const xf = req.headers.get("x-forwarded-for");
  if (xf) return xf.split(",")[0].trim();
  return req.headers.get("x-real-ip") || "0.0.0.0";
}

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const conn = await pool.getConnection();
  try {
    const id_factura = Number(params.id);
    if (!Number.isFinite(id_factura)) {
      return NextResponse.json({ success: false, error: "ID inválido" }, { status: 400 });
    }

    const body = await req.json();
    const { motivo = null, id_centro = null, id_usuario_procesador = null } = body || {};

    await conn.beginTransaction();

    // Bloqueamos la factura para operar con consistencia
    const [fRows] = await conn.query<RowDataPacket[]>(
      `
      SELECT
        f.id_factura, f.id_centro, f.id_paciente, f.numero_factura,
        f.estado, f.total, f.pagado, f.saldo, f.moneda
      FROM facturacion f
      WHERE f.id_factura = ?
      FOR UPDATE
      `,
      [id_factura]
    );
    if (!(fRows as any).length) {
      await conn.rollback();
      return NextResponse.json({ success: false, error: "Factura no encontrada" }, { status: 404 });
    }

    const f: any = (fRows as any)[0];
    // Si ya está anulada, idempotencia
    if (f.estado === "anulada") {
      await conn.rollback();
      return NextResponse.json({ success: true, message: "La factura ya estaba anulada" });
    }

    // 1) Registrar transacción contable de anulación por el monto pagado a la fecha
    //    (si prefieres anular por TOTAL, cambia f.pagado -> f.total)
    const insertCols = `
      id_centro, id_factura, id_paciente, id_metodo_pago, fecha_transaccion,
      monto, moneda, tipo_transaccion, estado,
      codigo_autorizacion, numero_referencia, descripcion,
      codigo_error, mensaje_error,
      datos_transaccion_json, gateway_transaccion, id_transaccion_gateway,
      ip_cliente, id_usuario_procesador, notas, url_comprobante
    `;
    const insertSql = `
      INSERT INTO transacciones (${insertCols})
      VALUES (?,?,?,?,?,
              ?,?,?,?,
              ?,?,?,?,
              ?,?,?,?,
              ?,?,?,?)
    `;

    const ipCliente = getClientIp(req);
    const descripcion = motivo || "Anulación de factura";
    const now = new Date();
    const fechaTrans = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 19)
      .replace("T", " ");

    const [txRes] = await conn.query<ResultSetHeader>(insertSql, [
      id_centro ?? f.id_centro,  // 1
      f.id_factura,              // 2
      f.id_paciente,             // 3
      null,                      // 4 id_metodo_pago
      fechaTrans,                // 5 fecha_transaccion
      Number(f.pagado) || 0,     // 6 monto (reverso de lo ya pagado)
      f.moneda || "CLP",         // 7 moneda
      "anulacion",               // 8 tipo_transaccion
      "aprobada",                // 9 estado
      null,                      // 10 codigo_autorizacion
      f.numero_factura || null,  // 11 numero_referencia
      descripcion,               // 12 descripcion
      null,                      // 13 codigo_error
      null,                      // 14 mensaje_error
      null,                      // 15 datos_transaccion_json
      null,                      // 16 gateway_transaccion
      null,                      // 17 id_transaccion_gateway
      ipCliente,                 // 18 ip_cliente
      id_usuario_procesador,     // 19 id_usuario_procesador
      motivo,                    // 20 notas
      null                       // 21 url_comprobante
    ]);
    const id_transaccion = txRes.insertId;

    // 2) Anular factura (no tocamos 'pagado' para conservar trazabilidad; dejamos saldo=0)
    await conn.query<ResultSetHeader>(
      `
      UPDATE facturacion
      SET estado = 'anulada',
          saldo = 0,
          fecha_modificacion = NOW()
      WHERE id_factura = ?
      `,
      [id_factura]
    );

    // (Opcional) Si quisieras resetear pagado a 0, cambia el UPDATE anterior por:
    //  SET estado='anulada', saldo=0, pagado=0, fecha_modificacion = NOW()

    // 3) Traer snapshot post-anulación
    const [postRows] = await conn.query<RowDataPacket[]>(
      `SELECT id_factura, estado, total, pagado, saldo, numero_factura, moneda
       FROM facturacion WHERE id_factura = ?`,
      [id_factura]
    );
    await conn.commit();

    // 4) Auditoría (no bloqueante)
    try {
      const headers = req.headers;
      const txId = headers.get("x-tx-id") || randomUUID();
      const userAgent = headers.get("user-agent") || null;
      const ip = headers.get("x-forwarded-for")?.split(",")[0]?.trim() || ipCliente || null;
      const entorno = process.env.NODE_ENV || "produccion";
      const zonaHoraria = "America/Santiago";

      const datosAntiguos = JSON.stringify({
        id_factura,
        estado: f.estado,
        total: Number(f.total),
        pagado: Number(f.pagado),
        saldo: Number(f.saldo),
      });

      const post: any = (postRows as any)[0] || {};
      const datosNuevos = JSON.stringify({
        id_factura,
        estado: post.estado,
        total: Number(post.total),
        pagado: Number(post.pagado),
        saldo: Number(post.saldo),
        transaccion_anulacion: {
          id_transaccion,
          monto: Number(f.pagado) || 0,
          moneda: f.moneda || "CLP",
          fecha_transaccion: fechaTrans,
          referencia: f.numero_factura || null,
        },
      });

      const hash_integridad = createHash("sha256").update(datosNuevos).digest("hex");

      await pool.query(
        `
        INSERT INTO auditorias (
          id_transaccion_global, id_centro, creado_en_servidor, entorno,
          id_usuario, zona_horaria, accion, modulo, servicio_origen, tabla,
          entidad_id, entidad_tipo, datos_antiguos, datos_nuevos,
          ip_origen, origen_sistema, user_agent, hash_integridad,
          resultado, codigo_referencia, nivel_criticidad,
          afecta_datos_sensibles, requiere_revision, sesion_id, token_id, detalle_adicional
        ) VALUES (?,?,?,?,?,
                  ?,?,?,?,?,?,
                  ?,?,?,
                  ?,?,?,?,
                  'exitoso', ?, 'medio',
                  0, 0, NULL, NULL, ?)
        `,
        [
          txId, f.id_centro ?? null, "api.facturacion", entorno,
          id_usuario_procesador ?? null,
          zonaHoraria, "anular_factura", "facturacion", "api:nextjs", "facturacion",
          String(id_factura), "factura", datosAntiguos, datosNuevos,
          ip, "frontend", userAgent, hash_integridad,
          f.numero_factura || null,
          motivo || "Anulación solicitada por administrador"
        ]
      );
    } catch (auditErr) {
      console.warn("Auditoría (anulación) falló:", auditErr);
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    await (conn as any).rollback?.().catch(() => {});
    console.error("POST /facturacion/[id]/anular error:", error);
    return NextResponse.json({ success: false, error: error?.message || "Error interno" }, { status: 500 });
  } finally {
    (conn as any).release?.();
  }
}
