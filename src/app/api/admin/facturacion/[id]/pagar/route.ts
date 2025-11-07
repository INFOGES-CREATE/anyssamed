//frontend\src\app\api\admin\facturacion\[id]\pagar\route.ts

import { NextResponse } from "next/server";
import pool from "@/lib/db";
import type { PoolConnection, RowDataPacket } from "mysql2/promise";
import { createHash, randomUUID } from "crypto";

type BodyPago = {
  monto: number;                 // requerido (>0)
  moneda?: "CLP" | "USD" | "EUR";
  id_metodo_pago?: number | null; // opcional (transacciones.id_metodo_pago)
  metodo_pago_nombre?: string | null; // para facturacion.metodo_pago (texto legible)
  fecha_transaccion?: string | null;  // "YYYY-MM-DD HH:mm:ss"
  numero_referencia?: string | null;
  codigo_autorizacion?: string | null;
  descripcion?: string | null;
  notas?: string | null;
  url_comprobante?: string | null;
  datos_transaccion_json?: any | null;
  gateway_transaccion?: string | null;
  id_transaccion_gateway?: string | null;
};

function getClientIp(req: Request) {
  const xf = req.headers.get("x-forwarded-for");
  if (xf) return xf.split(",")[0].trim();
  return req.headers.get("x-real-ip") || "0.0.0.0";
}

function toCLP2(n: any) {
  const v = Number(n);
  return Number.isFinite(v) ? Number(v.toFixed(2)) : 0;
}

export async function POST(req: Request, ctx: { params: { id: string } }) {
  let conn: PoolConnection | null = null;

  try {
    const id_factura = Number(ctx.params.id);
    if (!Number.isFinite(id_factura) || id_factura <= 0) {
      return NextResponse.json({ success: false, error: "ID de factura inválido" }, { status: 400 });
    }

    const body = (await req.json()) as BodyPago;
    const monto = toCLP2(body?.monto);
    if (!monto || monto <= 0) {
      return NextResponse.json({ success: false, error: "El monto es obligatorio y debe ser > 0" }, { status: 400 });
    }

    const now = new Date();
    const fechaTransStr =
      (body.fecha_transaccion && body.fecha_transaccion.trim()) ||
      new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 19).replace("T", " ");

    const moneda = (body.moneda || "CLP") as "CLP" | "USD" | "EUR";
    const ipCliente = getClientIp(req);
    const idMetodoPago = body.id_metodo_pago ?? null;
    const metodoPagoNombre = body.metodo_pago_nombre ?? null;

    conn = await pool.getConnection();
    await conn.beginTransaction();

    // 1) Traer la factura actual (lock FOR UPDATE)
    const [factRows] = await conn.query<RowDataPacket[]>(
      `SELECT f.id_factura, f.id_centro, f.id_paciente, f.estado, f.total, f.pagado, f.saldo, f.numero_factura
       FROM facturacion f
       WHERE f.id_factura = ?
       FOR UPDATE`,
      [id_factura]
    );

    if (!factRows.length) {
      await conn.rollback();
      return NextResponse.json({ success: false, error: "Factura no encontrada" }, { status: 404 });
    }

    const fact = factRows[0] as any;
    if (fact.estado === "anulada") {
      await conn.rollback();
      return NextResponse.json({ success: false, error: "No se puede pagar una factura anulada" }, { status: 400 });
    }

    const id_centro = Number(fact.id_centro) || null;
    const id_paciente = Number(fact.id_paciente) || null;

    // 2) Calcular nuevos totales
    const nuevoPagado = toCLP2(Number(fact.pagado) + monto);
    let nuevoSaldo = toCLP2(Number(fact.total) - nuevoPagado);
    if (nuevoSaldo < 0) nuevoSaldo = 0;

    let nuevoEstado: "pagada" | "parcial" | "emitida" | "vencida" | "en_revision" | "anulada" =
      nuevoSaldo <= 0 ? "pagada" : "parcial";

    // Si estaba "vencida" y pagó parcialmente, queda "parcial"
    if (fact.estado === "vencida" && nuevoSaldo > 0) nuevoEstado = "parcial";

    // 3) Actualizar la factura
    await conn.query(
      `UPDATE facturacion
       SET pagado = ?, saldo = ?, estado = ?,
           fecha_pago = CASE WHEN ? = 'pagada' THEN ? ELSE fecha_pago END,
           metodo_pago = COALESCE(?, metodo_pago),
           referencia_pago = COALESCE(?, referencia_pago),
           moneda = COALESCE(?, moneda),
           fecha_modificacion = NOW()
       WHERE id_factura = ?`,
      [
        nuevoPagado,
        nuevoSaldo,
        nuevoEstado,
        nuevoEstado,
        fechaTransStr,
        metodoPagoNombre,
        body.numero_referencia ?? null,
        moneda,
        id_factura,
      ]
    );

    // 4) Insertar la transacción (columnas alineadas 1:1)
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

    const datosJson =
      body.datos_transaccion_json != null ? JSON.stringify(body.datos_transaccion_json) : null;

    const [insRes]: any = await conn.query(insertSql, [
      id_centro,                            // 1
      id_factura,                           // 2
      id_paciente,                          // 3
      idMetodoPago,                         // 4
      fechaTransStr,                        // 5
      monto,                                // 6
      moneda,                               // 7
      "pago",                               // 8
      "aprobada",                           // 9
      body.codigo_autorizacion ?? null,     // 10
      body.numero_referencia ?? null,       // 11
      body.descripcion ?? "Pago de factura", // 12
      null,                                 // 13
      null,                                 // 14
      datosJson,                            // 15
      body.gateway_transaccion ?? null,     // 16
      body.id_transaccion_gateway ?? null,  // 17
      ipCliente,                            // 18
      null,                                 // 19 (id_usuario_procesador: ajusta si tienes auth)
      body.notas ?? null,                   // 20
      body.url_comprobante ?? null          // 21
    ]);

    const id_transaccion = insRes.insertId;

    // 5) Traer factura actualizada (para responder)
    const [factUpdRows] = await conn.query<RowDataPacket[]>(
      `SELECT id_factura, id_centro, id_paciente, numero_factura, tipo_documento,
              fecha_emision, fecha_vencimiento, estado, subtotal, impuestos, descuentos,
              total, pagado, saldo, metodo_pago, fecha_pago, referencia_pago, moneda
       FROM facturacion
       WHERE id_factura = ?`,
      [id_factura]
    );

    await conn.commit();

    // 6) Auditoría (no bloqueante)
    try {
      const headers = req.headers;
      const txId = headers.get("x-tx-id") || randomUUID();
      const userAgent = headers.get("user-agent") || null;
      const ip = headers.get("x-forwarded-for")?.split(",")[0]?.trim() || ipCliente || null;
      const entorno = process.env.NODE_ENV || "produccion";
      const zonaHoraria = "America/Santiago";

      const datosAntiguos = JSON.stringify({
        id_factura,
        estado: fact.estado,
        total: Number(fact.total),
        pagado: Number(fact.pagado),
        saldo: Number(fact.saldo),
      });

      const datosNuevos = JSON.stringify({
        id_factura,
        estado: nuevoEstado,
        total: Number(fact.total),
        pagado: nuevoPagado,
        saldo: nuevoSaldo,
        transaccion: {
          id_transaccion,
          monto,
          moneda,
          fecha_transaccion: fechaTransStr,
          id_metodo_pago: idMetodoPago,
          numero_referencia: body.numero_referencia ?? null,
          codigo_autorizacion: body.codigo_autorizacion ?? null,
          gateway: body.gateway_transaccion ?? null,
          id_transaccion_gateway: body.id_transaccion_gateway ?? null,
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
                  'exitoso', ?, 'bajo',
                  0, 0, NULL, NULL, 'registro de pago')
        `,
        [
          txId, id_centro ?? null, "api.facturacion", entorno,
          null, // id_usuario (si tienes auth, pásalo)
          zonaHoraria, "registrar_pago", "facturacion", "api:nextjs", "transacciones",
          String(id_transaccion), "transaccion", datosAntiguos, datosNuevos,
          ip, "frontend", userAgent, hash_integridad,
          body.numero_referencia ?? fact.numero_factura ?? null
        ]
      );
    } catch (auditErr) {
      console.warn("Auditoría (pago factura) falló:", auditErr);
    }

    return NextResponse.json({
      success: true,
      message: "Pago registrado correctamente",
      transaccion: {
        id_transaccion,
        id_factura,
        monto,
        moneda,
        estado: "aprobada",
        fecha_transaccion: fechaTransStr,
      },
      factura: factUpdRows[0] || null,
    });
  } catch (error: any) {
    if (conn) { try { await conn.rollback(); } catch {} }
    console.error("[/facturacion/:id/pagar] Error:", error);
    return NextResponse.json(
      { success: false, error: error?.sqlMessage || error?.message || "Error al registrar el pago" },
      { status: 500 }
    );
  } finally {
    if (conn) conn.release();
  }
}
