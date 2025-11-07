// src/app/api/admin/recetas-medicas/tipos/route.ts
import { NextResponse } from "next/server";
import pool from "@/lib/db";
import type { RowDataPacket, ResultSetHeader } from "mysql2/promise";

export const dynamic = "force-dynamic";

/* ============ helpers básicos ============ */
const like = (s: string) => `%${s}%`;
const toInt = (v: any, d: any = 0) =>
  v === null || v === undefined || v === "" ? d : (Number.isFinite(Number(v)) ? Number(v) : d);
const toBoolInt = (v: any, d = 0) =>
  v === true || v === 1 || v === "1" ? 1 : v === false || v === 0 || v === "0" ? 0 : d;

const ORDER_WHITELIST = new Set(["nombre","codigo","control_categoria","activo","orden","created_at","updated_at"]);
const sanitizeOrderBy = (v: string | null) => (ORDER_WHITELIST.has((v||"").toLowerCase()) ? (v||"").toLowerCase() : "nombre");
const sanitizeDir = (v: string | null) => ((v||"").toUpperCase() === "DESC" ? "DESC" : "ASC");
const safeCategoria = (v: any): "general"|"antimicrobianos"|"psicotropicos"|"estupefacientes"|"magistral" => {
  const x = String(v||"").toLowerCase();
  const ok = ["general","antimicrobianos","psicotropicos","estupefacientes","magistral"] as const;
  return (ok as readonly string[]).includes(x) ? (x as any) : "general";
};

async function safeQuery<T extends RowDataPacket[]>(sql: string, params: any[] = []): Promise<T> {
  try {
    const [rows] = await pool.query<T>(sql, params);
    return rows;
  } catch (e) {
    console.warn("[recetas-medicas/tipos] safeQuery:", (e as any)?.message || e);
    return [] as unknown as T;
  }
}

/* ============ GET ============ */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const q = (searchParams.get("q") || "").trim();
    const controlCategoria = (searchParams.get("control_categoria") || "").trim();
    const activoStr = searchParams.get("activo");

    const limit = Math.min(10000, Math.max(1, toInt(searchParams.get("limit") ?? 1000)));
    const offset = Math.max(0, toInt(searchParams.get("offset") ?? 0));
    const orderBy = sanitizeOrderBy(searchParams.get("orderBy"));
    const orderDir = sanitizeDir(searchParams.get("orderDir"));

    const filters: string[] = [];
    const params: any[] = [];

    if (q) { filters.push(`(tr.codigo LIKE ? OR tr.nombre LIKE ? OR tr.descripcion LIKE ?)`); params.push(like(q), like(q), like(q)); }
    if (controlCategoria) { filters.push(`tr.control_categoria = ?`); params.push(safeCategoria(controlCategoria)); }
    if (activoStr === "0" || activoStr === "1") { filters.push(`tr.activo = ?`); params.push(Number(activoStr)); }

    const where = filters.length ? `WHERE ${filters.join(" AND ")}` : "";

    const totalRows = await safeQuery<RowDataPacket[]>(`SELECT COUNT(*) AS total FROM tipos_receta tr ${where}`, params);
    const total = Number(totalRows[0]?.total || 0);

    const rows = await safeQuery<RowDataPacket[]>(
      `
      SELECT
        tr.id_tipo_receta, tr.codigo, tr.nombre, tr.descripcion,
        tr.controlado, tr.validez_dias, tr.requiere_rut, tr.exige_firma,
        tr.control_categoria, tr.requiere_retencion, tr.requiere_duplicado, tr.requiere_firma_digital,
        tr.vigencia_dias, tr.max_repeticiones, tr.permite_parcial, tr.activo, tr.orden,
        tr.created_at, tr.updated_at
      FROM tipos_receta tr
      ${where}
      ORDER BY tr.${orderBy} ${orderDir}
      LIMIT ? OFFSET ?
      `,
      [...params, limit, offset]
    );

    const items = rows.map((r: any) => ({ value: r.codigo, label: r.nombre, ...r }));

    return NextResponse.json(
      { success: true, total, count: items.length, pageSize: limit, offset, orderBy, orderDir, items, tiposReceta: items, opciones: { tiposReceta: items } },
      { status: 200, headers: { "Cache-Control": "no-store, max-age=0" } }
    );
  } catch (err: any) {
    console.error("GET /recetas-medicas/tipos error:", err);
    return NextResponse.json({ success: false, error: err?.message ?? "Error inesperado" }, { status: 500, headers: { "Cache-Control": "no-store, max-age=0" } });
  }
}

/* ====== helpers de UPDATE/UPSERT (sin autollamada) ====== */
function buildUpdate(body: any) {
  const sets: string[] = [];
  const params: any[] = [];

  // básicos
  if (body.codigo !== undefined) { sets.push(`codigo=?`); params.push(String(body.codigo)); }
  if (body.nombre !== undefined) { sets.push(`nombre=?`); params.push(String(body.nombre)); }
  if (body.descripcion !== undefined) { sets.push(`descripcion=?`); params.push(body.descripcion ?? null); }

  // simples
  if (body.controlado !== undefined) { sets.push(`controlado=?`); params.push(toBoolInt(body.controlado, 0)); }
  if (body.validez_dias !== undefined) { sets.push(`validez_dias=?`); params.push(body.validez_dias === null || body.validez_dias === "" ? null : toInt(body.validez_dias, null as any)); }
  if (body.requiere_rut !== undefined) { sets.push(`requiere_rut=?`); params.push(toBoolInt(body.requiere_rut, 0)); }
  if (body.exige_firma !== undefined) { sets.push(`exige_firma=?`); params.push(toBoolInt(body.exige_firma, 0)); }

  // avanzados
  if (body.control_categoria !== undefined) { sets.push(`control_categoria=?`); params.push(safeCategoria(body.control_categoria)); }
  if (body.requiere_retencion !== undefined) { sets.push(`requiere_retencion=?`); params.push(toBoolInt(body.requiere_retencion, 0)); }
  if (body.requiere_duplicado !== undefined) { sets.push(`requiere_duplicado=?`); params.push(toBoolInt(body.requiere_duplicado, 0)); }
  if (body.requiere_firma_digital !== undefined) { sets.push(`requiere_firma_digital=?`); params.push(toBoolInt(body.requiere_firma_digital, 0)); }
  if (body.vigencia_dias !== undefined) { sets.push(`vigencia_dias=?`); params.push(body.vigencia_dias === null || body.vigencia_dias === "" ? null : toInt(body.vigencia_dias, null as any)); }
  if (body.max_repeticiones !== undefined) { sets.push(`max_repeticiones=?`); params.push(toInt(body.max_repeticiones, 0)); }
  if (body.permite_parcial !== undefined) { sets.push(`permite_parcial=?`); params.push(toBoolInt(body.permite_parcial, 1)); }
  if (body.activo !== undefined) { sets.push(`activo=?`); params.push(toBoolInt(body.activo, 1)); }
  if (body.orden !== undefined) { sets.push(`orden=?`); params.push(toInt(body.orden, 100)); }

  return { sets, params };
}

async function conflictByCodigo(newCodigo: string, currentId?: number | null, currentCodigo?: string | null) {
  const rows = await safeQuery<RowDataPacket[]>(
    "SELECT id_tipo_receta, codigo FROM tipos_receta WHERE codigo=? LIMIT 1",
    [String(newCodigo)]
  );
  if (!rows.length) return null;
  const conflictId = Number(rows[0].id_tipo_receta);
  // si es el mismo registro, no es conflicto
  if (currentId && conflictId === currentId) return null;
  if (!currentId && currentCodigo && String(rows[0].codigo) === String(currentCodigo)) return null;
  return conflictId;
}

async function doUpdate(body: any) {
  const id = body.id_tipo_receta ? toInt(body.id_tipo_receta, 0) : null;
  const codigoWhere = body.codigo_original ?? body.codigo ?? null;
  if (!id && !codigoWhere)
    return NextResponse.json({ success: false, error: "id_tipo_receta o codigo_original/codigo requerido" }, { status: 400 });

  // Antiduplicado si cambia el código
  if (body.codigo !== undefined) {
    const conflict = await conflictByCodigo(String(body.codigo), id, codigoWhere);
    if (conflict !== null) {
      return NextResponse.json(
        { success: false, error: `codigo ya existe (${body.codigo})`, conflict_id: conflict },
        { status: 409 }
      );
    }
  }

  const { sets, params } = buildUpdate(body);
  if (sets.length === 0) return NextResponse.json({ success: false, error: "Nada para actualizar" }, { status: 400 });

  const where = id ? "id_tipo_receta=?" : "codigo=?";
  params.push(id ?? String(codigoWhere));

  const [r] = await pool.query<ResultSetHeader>(`UPDATE tipos_receta SET ${sets.join(", ")} WHERE ${where} LIMIT 1`, params);
  return NextResponse.json({ success: true, updated: r.affectedRows > 0, touched: (r as any).changedRows ?? undefined }, { status: 200 });
}

/* ============ POST ============ */
export async function POST(req: Request) {
  try {
    let body: any = {};
    try { body = await req.json(); }
    catch { return NextResponse.json({ success: false, error: "Body inválido o no-JSON" }, { status: 400 }); }

    const { action } = body || {};
    if (!action) return NextResponse.json({ success: false, error: "action es requerido" }, { status: 400 });

    if (action === "create") {
      const {
        codigo, nombre, descripcion = null,
        controlado = 0, validez_dias = null, requiere_rut = 0, exige_firma = 0,
        control_categoria = "general",
        requiere_retencion = 0, requiere_duplicado = 0, requiere_firma_digital = 0,
        vigencia_dias = null, max_repeticiones = 0, permite_parcial = 1,
        activo = 1, orden = 100,
      } = body || {};

      if (!codigo || !nombre)
        return NextResponse.json({ success: false, error: "codigo y nombre son requeridos" }, { status: 400 });

      const [r] = await pool.query<ResultSetHeader>(
        `INSERT INTO tipos_receta
          (codigo, nombre, descripcion, controlado, validez_dias, requiere_rut, exige_firma,
           control_categoria, requiere_retencion, requiere_duplicado, requiere_firma_digital,
           vigencia_dias, max_repeticiones, permite_parcial, activo, orden)
         VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
        [
          String(codigo), String(nombre), descripcion ?? null,
          toBoolInt(controlado, 0),
          validez_dias === null || validez_dias === "" ? null : toInt(validez_dias, null as any),
          toBoolInt(requiere_rut, 0), toBoolInt(exige_firma, 0),
          safeCategoria(control_categoria),
          toBoolInt(requiere_retencion, 0), toBoolInt(requiere_duplicado, 0), toBoolInt(requiere_firma_digital, 0),
          vigencia_dias === null || vigencia_dias === "" ? null : toInt(vigencia_dias, null as any),
          toInt(max_repeticiones, 0), toBoolInt(permite_parcial, 1), toBoolInt(activo, 1), toInt(orden, 100),
        ]
      );
      return NextResponse.json({ success: true, created: r.affectedRows > 0, codigo }, { status: 200 });
    }

    if (action === "update") {
      return doUpdate(body);
    }

    if (action === "upsert") {
      // Si viene id o codigo_original => tratar como UPDATE (sin autollamada)
      if (body.id_tipo_receta || body.codigo_original) {
        return doUpdate(body);
      }

      // upsert clásico por 'codigo'
      const {
        codigo, nombre, descripcion = null,
        controlado = 0, validez_dias = null, requiere_rut = 0, exige_firma = 0,
        control_categoria = "general",
        requiere_retencion = 0, requiere_duplicado = 0, requiere_firma_digital = 0,
        vigencia_dias = null, max_repeticiones = 0, permite_parcial = 1,
        activo = 1, orden = 100,
      } = body || {};

      if (!codigo || !nombre)
        return NextResponse.json({ success: false, error: "codigo y nombre son requeridos" }, { status: 400 });

      const [r] = await pool.query<ResultSetHeader>(
        `INSERT INTO tipos_receta
          (codigo, nombre, descripcion, controlado, validez_dias, requiere_rut, exige_firma,
           control_categoria, requiere_retencion, requiere_duplicado, requiere_firma_digital,
           vigencia_dias, max_repeticiones, permite_parcial, activo, orden)
         VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
         ON DUPLICATE KEY UPDATE
           nombre=VALUES(nombre),
           descripcion=VALUES(descripcion),
           controlado=VALUES(controlado),
           validez_dias=VALUES(validez_dias),
           requiere_rut=VALUES(requiere_rut),
           exige_firma=VALUES(exige_firma),
           control_categoria=VALUES(control_categoria),
           requiere_retencion=VALUES(requiere_retencion),
           requiere_duplicado=VALUES(requiere_duplicado),
           requiere_firma_digital=VALUES(requiere_firma_digital),
           vigencia_dias=VALUES(vigencia_dias),
           max_repeticiones=VALUES(max_repeticiones),
           permite_parcial=VALUES(permite_parcial),
           activo=VALUES(activo),
           orden=VALUES(orden)
        `,
        [
          String(codigo), String(nombre), descripcion ?? null,
          toBoolInt(controlado, 0),
          validez_dias === null || validez_dias === "" ? null : toInt(validez_dias, null as any),
          toBoolInt(requiere_rut, 0), toBoolInt(exige_firma, 0),
          safeCategoria(control_categoria),
          toBoolInt(requiere_retencion, 0), toBoolInt(requiere_duplicado, 0), toBoolInt(requiere_firma_digital, 0),
          vigencia_dias === null || vigencia_dias === "" ? null : toInt(vigencia_dias, null as any),
          toInt(max_repeticiones, 0), toBoolInt(permite_parcial, 1), toBoolInt(activo, 1), toInt(orden, 100),
        ]
      );
      return NextResponse.json({ success: true, upserted: r.affectedRows > 0, codigo }, { status: 200 });
    }

    if (action === "delete") {
      const { codigo } = body || {};
      if (!codigo) return NextResponse.json({ success: false, error: "codigo requerido" }, { status: 400 });

      const [r] = await pool.query<ResultSetHeader>("DELETE FROM tipos_receta WHERE codigo=?", [String(codigo)]);
      return NextResponse.json({ success: true, deleted: r.affectedRows > 0, codigo }, { status: 200 });
    }

    return NextResponse.json({ success: false, error: "action inválida" }, { status: 400 });
  } catch (e: any) {
    console.error("POST /recetas-medicas/tipos error:", e);
    return NextResponse.json({ success: false, error: e?.sqlMessage ?? e?.message ?? "Error inesperado" }, { status: 500, headers: { "Cache-Control": "no-store, max-age=0" } });
  }
}
