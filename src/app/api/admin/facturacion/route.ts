// frontend/src/app/api/admin/facturacion/route.ts
import { NextResponse } from "next/server";
import pool from "@/lib/db";
import type { PoolConnection, RowDataPacket, ResultSetHeader } from "mysql2/promise";
import { createHash, randomUUID } from "crypto";

// ===================== Helpers =====================
const toInt = (v: any, d = 0) => (Number.isFinite(Number(v)) ? Number(v) : d);
const toNum = (v: any, d = 0) => (isNaN(Number(v)) ? d : Number(v));
const b2 = (v: any) => (v === "1" || v === 1 ? 1 : v === "0" || v === 0 ? 0 : null);
const toMoney = (n: any) => {
  const v = Number(n);
  return Number.isFinite(v) ? Number(v.toFixed(2)) : 0;
};
const todayCL = () => {
  const now = new Date();
  // ISO local sin TZ (YYYY-MM-DD)
  return new Date(now.getTime() - now.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 10);
};

// CSV helpers (premium export)
const csvEscape = (v: any) => {
  if (v === null || v === undefined) return "";
  const s = String(v);
  if (/[",\n;]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
};
const withBOM = (s: string) => "\uFEFF" + s;

type DetalleInput = {
  tipo_item: string;
  codigo_item?: string | null;
  descripcion?: string | null;
  cantidad?: number;
  precio_unitario?: number;
  descuento?: number;
  impuesto?: number;
  total?: number;
  id_cita?: number | null;
  id_procedimiento?: number | null;
  id_examen?: number | null;
  id_producto?: number | null;
  notas?: string | null;
  fecha_servicio?: string | null; // YYYY-MM-DD
};

// ===================== GET /facturacion =====================
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const pagina = Math.max(1, toInt(searchParams.get("pagina"), 1));
    const pageSize = Math.min(100, Math.max(1, toInt(searchParams.get("pageSize"), 20)));
    const offset = (pagina - 1) * pageSize;

    const id_centro = toInt(searchParams.get("id_centro"), 0) || null;
    const id_paciente = toInt(searchParams.get("id_paciente"), 0) || null;
    const estado = searchParams.get("estado") || "";
    const tipo_documento = searchParams.get("tipo_documento") || "";
    const id_metodo_pago = toInt(searchParams.get("id_metodo_pago"), 0) || null;
    const desde = searchParams.get("desde") || "";
    const hasta = searchParams.get("hasta") || "";
    const search = (searchParams.get("search") || "").trim();
    const moneda = (searchParams.get("moneda") || "").trim().toUpperCase();
    const emitida_electronica = b2(searchParams.get("emitida_electronica"));
    const enviada_paciente = b2(searchParams.get("enviada_paciente"));
    const monto_min = searchParams.get("monto_min");
    const monto_max = searchParams.get("monto_max");
    const vencidas = searchParams.get("vencidas") === "1";

    // Export controls
    const exportFmt = (searchParams.get("export") || "").toLowerCase(); // "csv" | "" (normal)
    const exportAll = exportFmt === "csv";

    const where: string[] = [];
    const params: any[] = [];

    if (id_centro) { where.push("f.id_centro = ?"); params.push(id_centro); }
    if (id_paciente) { where.push("f.id_paciente = ?"); params.push(id_paciente); }
    if (estado) { where.push("f.estado = ?"); params.push(estado); }
    if (tipo_documento) { where.push("f.tipo_documento = ?"); params.push(tipo_documento); }
    if (moneda) { where.push("f.moneda = ?"); params.push(moneda); }
    if (emitida_electronica !== null) { where.push("f.emitida_electronica = ?"); params.push(emitida_electronica); }
    if (enviada_paciente !== null) { where.push("f.enviada_paciente = ?"); params.push(enviada_paciente); }
    if (desde) { where.push("f.fecha_emision >= ?"); params.push(desde); }
    if (hasta) { where.push("f.fecha_emision <= ?"); params.push(hasta); }
    if (monto_min) { where.push("f.total >= ?"); params.push(Number(monto_min)); }
    if (monto_max) { where.push("f.total <= ?"); params.push(Number(monto_max)); }
    if (vencidas) {
      // vencida por estado o por regla de vencimiento con saldo > 0
      where.push("(f.estado = 'vencida' OR (f.saldo > 0 AND f.fecha_vencimiento IS NOT NULL AND f.fecha_vencimiento < CURDATE() AND f.estado <> 'anulada'))");
    }
    if (id_metodo_pago) {
      where.push("EXISTS (SELECT 1 FROM transacciones t WHERE t.id_factura = f.id_factura AND t.id_metodo_pago = ?)");
      params.push(id_metodo_pago);
    }
    if (search) {
      where.push(`(
        f.numero_factura LIKE ? OR
        p.rut LIKE ? OR
        CONCAT_WS(' ', p.nombre, p.apellido_paterno, p.apellido_materno) LIKE ?
      )`);
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    const whereSQL = where.length ? `WHERE ${where.join(" AND ")}` : "";

    // Total (para UI)
    const [countRows] = await pool.query<RowDataPacket[]>(
      `SELECT COUNT(*) AS total FROM facturacion f
       LEFT JOIN pacientes p ON p.id_paciente = f.id_paciente
       ${whereSQL}`,
      params
    );
    const total = Number((countRows as any)[0]?.total || 0);

    // Stats (para UI/Export metadata)
    const [statRows] = await pool.query<RowDataPacket[]>(
      `
      SELECT
        COUNT(*)                              AS total_facturas,
        COALESCE(SUM(f.total),0)              AS total_facturado,
        COALESCE(SUM(f.pagado),0)             AS total_pagado,
        COALESCE(SUM(f.saldo),0)              AS total_pendiente,
        SUM(f.estado = 'emitida')             AS facturas_emitidas,
        SUM(f.estado = 'pagada')              AS facturas_pagadas,
        SUM(f.estado = 'vencida')             AS facturas_vencidas,
        SUM(f.estado = 'anulada')             AS facturas_anuladas,
        CASE WHEN COALESCE(SUM(f.total),0) > 0
             THEN ROUND((COALESCE(SUM(f.pagado),0) / COALESCE(SUM(f.total),0))*100,2)
             ELSE 0 END                       AS tasa_cobro,
        COALESCE(
          ROUND(AVG(
            CASE WHEN f.fecha_pago IS NOT NULL AND f.fecha_emision IS NOT NULL
                 THEN DATEDIFF(f.fecha_pago, f.fecha_emision)
                 ELSE NULL
            END
          ),0),0)                             AS promedio_dias_pago
      FROM facturacion f
      LEFT JOIN pacientes p ON p.id_paciente = f.id_paciente
      ${whereSQL}
      `,
      params
    );
    const stats = (statRows as any)[0] || {};

    // Query base (sin limit si export)
    const baseSelect = `
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
      ${whereSQL}
    `;

    if (exportAll) {
      // ========== EXPORT CSV INSTITUCIONAL (premium) ==========
      const [allRows] = await pool.query<RowDataPacket[]>(
        baseSelect + " ORDER BY f.fecha_emision DESC, f.id_factura DESC LIMIT 100000",
        params
      );

      // Cabecera institucional (metadatos dentro del archivo como primeras filas comentadas)
      const ahora = new Date();
      const y = ahora.getFullYear();
      const m = String(ahora.getMonth() + 1).padStart(2, "0");
      const d = String(ahora.getDate()).padStart(2, "0");
      const hh = String(ahora.getHours()).padStart(2, "0");
      const mm = String(ahora.getMinutes()).padStart(2, "0");

      // Elegimos “centro_nombre” del primer registro para el encabezado; si no, genérico.
      const headerCentroNombre = (allRows as any)[0]?.centro_nombre || "Centro de Salud Municipal";
      const headerLines = [
        `# SISTEMA: INFOGES CURICÓ - Módulo de Facturación`,
        `# INSTITUCIÓN/CENTRO: ${headerCentroNombre}`,
        `# GENERADO: ${y}-${m}-${d} ${hh}:${mm}`,
        `# FILTROS: estado=${estado || "-"}, tipo_documento=${tipo_documento || "-"}, moneda=${moneda || "-"}, desde=${desde || "-"}, hasta=${hasta || "-"}`,
        `# TOTALES: facturas=${stats.total_facturas ?? 0}, facturado=${stats.total_facturado ?? 0}, pagado=${stats.total_pagado ?? 0}, pendiente=${stats.total_pendiente ?? 0}, tasa_cobro=${stats.tasa_cobro ?? 0}%`,
        `# NOTA: Archivo CSV UTF-8 con BOM; apto para Excel/LibreOffice`,
        ``,
      ].join("\n");

      // Columnas exportadas (institucionales y claras)
      const headers = [
        "id_factura",
        "numero_factura",
        "tipo_documento",
        "fecha_emision",
        "fecha_vencimiento",
        "estado",
        "moneda",
        "subtotal",
        "descuentos",
        "impuestos",
        "total",
        "pagado",
        "saldo",
        "paciente_rut",
        "paciente_nombre",
        "paciente_email",
        "paciente_telefono",
        "centro_nombre",
        "centro_telefono",
        "centro_email",
        "centro_sitio_web",
        "creador_nombre",
        "emitida_electronica",
        "enviada_paciente",
        "fecha_envio",
        "fecha_pago",
        "metodo_pago",
        "referencia_pago",
        "id_convenio",
        "id_aseguradora",
        "cobertura_seguro",
        "notas"
      ];

      const csvRows = (allRows as RowDataPacket[]).map((r) =>
        headers
          .map((h) => csvEscape((r as any)[h] ?? ""))
          .join(",")
      );

      const csv = withBOM(
        headerLines + headers.join(",") + "\n" + csvRows.join("\n")
      );

      return new NextResponse(csv, {
        status: 200,
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="facturacion_${y}${m}${d}.csv"`,
          "Cache-Control": "private, max-age=0, no-store",
        },
      });
    }

    // ====== Listado paginado normal ======
    const [rows] = await pool.query<RowDataPacket[]>(
      baseSelect + ` ORDER BY f.fecha_emision DESC, f.id_factura DESC LIMIT ? OFFSET ?`,
      [...params, pageSize, offset]
    );

    return NextResponse.json({
      success: true,
      pagina,
      pageSize,
      total,
      stats,
      facturas: rows,
    });
  } catch (error: any) {
    console.error("GET /facturacion error:", error);
    return NextResponse.json({ success: false, error: error?.message || "Error interno" }, { status: 500 });
  }
}

// ===================== POST /facturacion =====================
// Crea factura; autorrellena e infiere campos desde detalles/tablas (premium).
export async function POST(req: Request) {
  let conn: PoolConnection | null = null;
  try {
    const body = await req.json();
    const {
      // posibles campos de entrada
      id_centro: in_id_centro,
      id_paciente: in_id_paciente,
      paciente_rut,
      rut,
      tipo_documento: in_tipo_doc,
      fecha_emision: in_fecha_emision,
      fecha_vencimiento = null,
      moneda: in_moneda,
      subtotal: in_subtotal,
      impuestos: in_impuestos,
      descuentos: in_descuentos,
      total: in_total,
      notas = null,
      creado_por = null,
      numero_factura: in_numero_factura = null,
      datos_facturacion = null,
      id_convenio = null,
      id_aseguradora = null,
      cobertura_seguro = null,
      detalles = [] as DetalleInput[] | undefined,
    } = body || {};

    conn = await pool.getConnection();
    await conn.beginTransaction();

    // -------- 1) Inference id_centro & id_paciente ----------
    let id_centro = toInt(in_id_centro, 0) || null;
    let id_paciente = toInt(in_id_paciente, 0) || null;
    let requireReview = 0;

    // a) por cita en detalles
    let citaId: number | null = null;
    if (Array.isArray(detalles)) {
      for (const d of detalles) {
        if (toInt(d?.id_cita, 0)) { citaId = toInt(d.id_cita, 0); break; }
      }
    }
    if ((!id_centro || !id_paciente) && citaId) {
      const [citaRows] = await conn.query<RowDataPacket[]>(
        `SELECT id_centro, id_paciente FROM citas WHERE id_cita = ? LIMIT 1`,
        [citaId]
      );
      if (citaRows.length) {
        id_centro = id_centro || Number(citaRows[0].id_centro) || null;
        id_paciente = id_paciente || Number(citaRows[0].id_paciente) || null;
      }
    }

    // b) paciente por RUT
    if (!id_paciente && (paciente_rut || rut)) {
      const rutFind = String(paciente_rut || rut).trim();
      if (rutFind) {
        const [pRows] = await conn.query<RowDataPacket[]>(
          `SELECT id_paciente FROM pacientes WHERE rut = ? LIMIT 1`,
          [rutFind]
        );
        if (pRows.length) id_paciente = Number(pRows[0].id_paciente);
      }
    }

    // c) centro desde costos_procedimientos si vino código/id_procedimiento
    if (!id_centro && Array.isArray(detalles)) {
      let centroByCosto: number | null = null;
      for (const d of detalles) {
        if (d?.codigo_item) {
          const [cr] = await conn.query<RowDataPacket[]>(
            `SELECT id_centro FROM costos_procedimientos WHERE codigo_procedimiento = ? LIMIT 1`,
            [d.codigo_item]
          );
          if (cr.length) { centroByCosto = Number(cr[0].id_centro); break; }
        }
        if (!centroByCosto && d?.id_procedimiento) {
          const [cr2] = await conn.query<RowDataPacket[]>(
            `SELECT id_centro FROM costos_procedimientos WHERE id_costo = ? LIMIT 1`,
            [d.id_procedimiento]
          );
          if (cr2.length) { centroByCosto = Number(cr2[0].id_centro); break; }
        }
      }
      if (centroByCosto) id_centro = centroByCosto;
    }

    // d) fallback institucional controlado (no romper creación)
    if (!id_centro) {
      const [cRows] = await conn.query<RowDataPacket[]>(
        `SELECT id_centro FROM centros_medicos ORDER BY id_centro ASC LIMIT 1`
      );
      if (cRows.length) { id_centro = Number(cRows[0].id_centro); requireReview = 1; }
    }
    if (!id_paciente) {
      const [pRows] = await conn.query<RowDataPacket[]>(
        `SELECT id_paciente FROM pacientes ORDER BY id_paciente ASC LIMIT 1`
      );
      if (pRows.length) { id_paciente = Number(pRows[0].id_paciente); requireReview = 1; }
    }

    // -------- 2) Fechas / Tipo / Moneda -----------
    const fecha_emision = (in_fecha_emision && String(in_fecha_emision)) || todayCL();
    const tipo_documento: "factura" | "boleta" | "presupuesto" | "nota_credito" | "nota_debito" =
      (in_tipo_doc as any) || "boleta";
    const moneda: "CLP" | "USD" | "EUR" = (in_moneda as any) || "CLP";

    // -------- 3) Cálculo de totales ----------
    let subtotal = toMoney(in_subtotal);
    let impuestos = toMoney(in_impuestos);
    let descuentos = toMoney(in_descuentos);
    let total = Number.isFinite(Number(in_total)) ? toMoney(in_total) : NaN;

    if (Array.isArray(detalles) && detalles.length > 0) {
      let sSub = 0, sImp = 0, sDesc = 0, sTot = 0;

      for (const d of detalles) {
        let cant = toMoney(d.cantidad ?? 1);
        if (cant <= 0) cant = 1;
        let punit = toMoney(d.precio_unitario ?? 0);
        let desc = toMoney(d.descuento ?? 0);
        let imp = toMoney(d.impuesto ?? 0);

        // Rellenar desde costos_procedimientos si hace falta
        if ((!punit || punit <= 0) && (d.codigo_item || d.id_procedimiento)) {
          let precio: number | null = null;
          let impPct: number | null = null;
          if (d.codigo_item) {
            const [cr] = await conn.query<RowDataPacket[]>(
              `SELECT precio_venta, impuesto_porcentaje FROM costos_procedimientos WHERE codigo_procedimiento = ? LIMIT 1`,
              [d.codigo_item]
            );
            if (cr.length) { precio = Number(cr[0].precio_venta); impPct = Number(cr[0].impuesto_porcentaje); }
          } else if (d.id_procedimiento) {
            const [cr2] = await conn.query<RowDataPacket[]>(
              `SELECT precio_venta, impuesto_porcentaje FROM costos_procedimientos WHERE id_costo = ? LIMIT 1`,
              [d.id_procedimiento]
            );
            if (cr2.length) { precio = Number(cr2[0].precio_venta); impPct = Number(cr2[0].impuesto_porcentaje); }
          }
          if (precio != null) punit = toMoney(precio);
          if (impPct != null && (imp === 0 || !Number.isFinite(imp))) {
            const baseTmp = Math.max(0, cant * punit - desc);
            imp = toMoney(baseTmp * (impPct / 100));
          }
        }

        const lineSub = toMoney(cant * punit);
        const lineDesc = toMoney(desc);
        const base = Math.max(0, lineSub - lineDesc);
        const lineImp = toMoney(imp);
        const lineTot = toMoney(base + lineImp);

        sSub += lineSub;
        sDesc += lineDesc;
        sImp += lineImp;
        sTot += lineTot;
      }

      subtotal = sSub;
      descuentos = sDesc;
      impuestos = sImp;
      total = sTot;
    }

    if (!Number.isFinite(total)) {
      subtotal = toMoney(subtotal);
      descuentos = toMoney(descuentos);
      impuestos = toMoney(impuestos);
      total = toMoney(subtotal - descuentos + impuestos);
    }

    const pagado = 0;
    const saldo = toMoney(total - pagado);

    const estadoFinal: "emitida" | "en_revision" = requireReview ? "en_revision" : "emitida";

    // -------- 4) Insert factura ----------
    const [ins] = await conn.query<ResultSetHeader>(
      `
      INSERT INTO facturacion (
        id_centro, id_paciente, numero_factura, tipo_documento, fecha_emision, fecha_vencimiento,
        estado, subtotal, impuestos, descuentos, total, pagado, saldo, metodo_pago, fecha_pago, referencia_pago,
        moneda, notas, datos_facturacion, id_convenio, id_aseguradora, cobertura_seguro,
        emitida_electronica, url_documento, enviada_paciente, fecha_envio, creado_por
      )
      VALUES (?,?,?,?,?,?,
              ?,?,?,?,?,?,? , NULL, NULL, NULL,
              ?,?,?,?, ?,?,
              0, NULL, 0, NULL, ?)
      `,
      [
        id_centro, id_paciente, in_numero_factura, tipo_documento, fecha_emision, fecha_vencimiento,
        estadoFinal, subtotal ?? 0, impuestos ?? 0, descuentos ?? 0, total, pagado, saldo,
        moneda, notas, datos_facturacion, id_convenio, id_aseguradora, cobertura_seguro,
        creado_por
      ]
    );
    const id_factura = (ins as ResultSetHeader).insertId;

    // -------- 4.1) Autogenerar numero_factura institucional si no vino ----------
    if (!in_numero_factura) {
      const now = new Date();
      const y = now.getFullYear();
      const m = String(now.getMonth() + 1).padStart(2, "0");
      const autoNum = `FAC-${y}${m}-${id_factura}`;
      await conn.query<ResultSetHeader>(
        `UPDATE facturacion SET numero_factura = ? WHERE id_factura = ?`,
        [autoNum, id_factura]
      );
    }

    // -------- 5) Insert detalles ----------
    if (Array.isArray(detalles) && detalles.length > 0) {
      for (const d of detalles) {
        let cant = toMoney(d.cantidad ?? 1);
        if (cant <= 0) cant = 1;
        let punit = toMoney(d.precio_unitario ?? 0);
        let desc = toMoney(d.descuento ?? 0);
        let imp = toMoney(d.impuesto ?? 0);
        let descripcion = (d.descripcion ?? "").toString().trim();

        if ((!punit || punit <= 0) && (d.codigo_item || d.id_procedimiento)) {
          let precio: number | null = null;
          let impPct: number | null = null;
          let nombreProc: string | null = null;
          if (d.codigo_item) {
            const [cr] = await conn.query<RowDataPacket[]>(
              `SELECT nombre_procedimiento, precio_venta, impuesto_porcentaje
               FROM costos_procedimientos WHERE codigo_procedimiento = ? LIMIT 1`,
              [d.codigo_item]
            );
            if (cr.length) {
              nombreProc = cr[0].nombre_procedimiento as string;
              precio = Number(cr[0].precio_venta);
              impPct = Number(cr[0].impuesto_porcentaje);
            }
          } else if (d.id_procedimiento) {
            const [cr2] = await conn.query<RowDataPacket[]>(
              `SELECT nombre_procedimiento, precio_venta, impuesto_porcentaje
               FROM costos_procedimientos WHERE id_costo = ? LIMIT 1`,
              [d.id_procedimiento]
            );
            if (cr2.length) {
              nombreProc = cr2[0].nombre_procedimiento as string;
              precio = Number(cr2[0].precio_venta);
              impPct = Number(cr2[0].impuesto_porcentaje);
            }
          }
          if (precio != null) punit = toMoney(precio);
          if (!descripcion && nombreProc) descripcion = nombreProc;
          if (impPct != null && (imp === 0 || !Number.isFinite(imp))) {
            const baseTmp = Math.max(0, cant * punit - desc);
            imp = toMoney(baseTmp * (impPct / 100));
          }
        }

        const lineSub = toMoney(cant * punit);
        const base = Math.max(0, lineSub - toMoney(desc));
        const lineImp = toMoney(imp);
        const lineTot = toMoney(base + lineImp);

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
            id_factura,
            d.tipo_item,
            d.codigo_item ?? null,
            descripcion || "Detalle",
            cant,
            punit,
            lineSub,
            toMoney(desc),
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
    }

    await conn.commit();

    // ======= Auditoría (no bloqueante) =======
    try {
      const headers = req.headers;
      const txId = headers.get("x-tx-id") || randomUUID();
      const userAgent = headers.get("user-agent") || null;
      const ip = headers.get("x-forwarded-for")?.split(",")[0]?.trim() || null;
      const entorno = process.env.NODE_ENV || "produccion";
      const zonaHoraria = "America/Santiago";

      const datosNuevos = JSON.stringify({
        id_factura,
        id_centro, id_paciente, tipo_documento, fecha_emision, fecha_vencimiento,
        moneda, subtotal, impuestos, descuentos, total, saldo, notas,
        numero_factura: in_numero_factura || `FAC-auto`,
        id_convenio, id_aseguradora, cobertura_seguro, creado_por,
        detalles_count: Array.isArray(detalles) ? detalles.length : 0,
        require_review: requireReview,
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
                  ?,NULL,?,
                  ?,?,?,?,
                  'exitoso', ?, 'bajo',
                  0, ?, NULL, NULL, 'creación de factura (auto-inferida)')
        `,
        [
          txId, id_centro ?? null, "api.facturacion", entorno,
          creado_por ?? null, zonaHoraria, "crear", "facturacion", "api:nextjs", "facturacion",
          String(id_factura), "factura", datosNuevos,
          ip, "frontend", userAgent, hash_integridad,
          in_numero_factura || null,
          requireReview
        ]
      );
    } catch (auditErr) {
      console.warn("Auditoría (crear factura) falló:", auditErr);
    }

    return NextResponse.json(
      { success: true, id_factura },
      { status: 201 }
    );
  } catch (err: any) {
    try { await (conn as PoolConnection | null)?.rollback(); } catch {}
    console.error("POST /facturacion error:", err);
    const msg = err?.sqlMessage ?? err?.message ?? "Error interno";
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  } finally {
    try { (conn as PoolConnection | null)?.release(); } catch {}
  }
}
