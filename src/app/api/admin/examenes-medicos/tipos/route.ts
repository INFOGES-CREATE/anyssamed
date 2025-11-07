// frontend/src/app/api/admin/examenes-medicos/tipos/route.ts
import { NextResponse } from "next/server";
import type { RowDataPacket } from "mysql2/promise";
import pool from "@/lib/db";

export const dynamic = "force-dynamic";

const like = (s: string) => `%${s}%`;
const toInt = (v: any, d = 0) => (Number.isFinite(Number(v)) ? Number(v) : d);

async function safeQuery<T extends RowDataPacket[]>(
  sql: string,
  params: any[] = []
): Promise<T> {
  try {
    const [rows] = await pool.query<T>(sql, params);
    return rows;
  } catch (e) {
    console.warn("[examenes-medicos/tipos] safeQuery:", (e as any)?.message || e);
    return [] as unknown as T;
  }
}

const ORDER_WHITELIST = new Set([
  "nombre",
  "codigo",
  "categoria",
  "complejidad",
  "fecha_creacion",
  "fecha_modificacion",
]);

function sanitizeOrderBy(v: string | null) {
  const col = (v || "").toLowerCase();
  return ORDER_WHITELIST.has(col) ? col : "nombre";
}
function sanitizeDir(v: string | null) {
  const d = (v || "").toUpperCase();
  return d === "DESC" ? "DESC" : "ASC";
}

export async function GET(req: Request) {
  try {
    // --- parseo de query params
    const { searchParams } = new URL(req.url);

    const q = (searchParams.get("q") || "").trim();
    const categoria = (searchParams.get("categoria") || "").trim();
    const especialidad = (searchParams.get("especialidad_relacionada") || "").trim();
    const complejidad = (searchParams.get("complejidad") || "").trim(); // baja|media|alta|critica
    const activoStr = searchParams.get("activo"); // "0" | "1" | null

    const limit = Math.min(10000, Math.max(1, toInt(searchParams.get("limit") ?? 1000)));
    const offset = Math.max(0, toInt(searchParams.get("offset") ?? 0));
    const orderBy = sanitizeOrderBy(searchParams.get("orderBy"));
    const orderDir = sanitizeDir(searchParams.get("orderDir"));

    // --- filtros SQL seguros
    const filters: string[] = [];
    const params: any[] = [];

    if (q) {
      filters.push(
        `(te.nombre LIKE ? OR te.codigo LIKE ? OR te.descripcion LIKE ? OR te.categoria LIKE ? OR te.subcategoria LIKE ?)`
      );
      params.push(like(q), like(q), like(q), like(q), like(q));
    }
    if (categoria) {
      filters.push(`te.categoria = ?`);
      params.push(categoria);
    }
    if (especialidad) {
      filters.push(`te.especialidad_relacionada = ?`);
      params.push(especialidad);
    }
    if (complejidad) {
      filters.push(`te.complejidad = ?`);
      params.push(complejidad);
    }
    if (activoStr === "0" || activoStr === "1") {
      filters.push(`te.activo = ?`);
      params.push(Number(activoStr));
    }

    const where = filters.length ? `WHERE ${filters.join(" AND ")}` : "";

    // --- total
    const totalRows = await safeQuery<RowDataPacket[]>(
      `SELECT COUNT(*) AS total FROM tipos_examenes te ${where}`,
      params
    );
    const total = Number(totalRows[0]?.total || 0);

    // --- datos
    const rows = await safeQuery<RowDataPacket[]>(
      `
      SELECT
        te.id_tipo_examen,
        te.codigo,
        te.nombre,
        te.descripcion,
        te.categoria,
        te.subcategoria,
        te.especialidad_relacionada,
        te.requiere_ayuno,
        te.requiere_preparacion,
        te.instrucciones_preparacion,
        te.tiempo_resultado_horas,
        te.codigo_fonasa,
        te.valor_fonasa,
        te.complejidad,
        te.activo,
        te.fecha_creacion,
        te.fecha_modificacion,
        te.creado_por
      FROM tipos_examenes te
      ${where}
      ORDER BY te.${orderBy} ${orderDir}
      LIMIT ? OFFSET ?
      `,
      [...params, limit, offset]
    );

    // --- mapeo consistente para el front
    const tiposExamen = rows.map((r: any) => ({
      value: r.id_tipo_examen,
      label: r.nombre,
      ...r,
    }));

    const payload = {
      success: true,
      total,
      count: tiposExamen.length,
      pageSize: limit,
      offset,
      orderBy,
      orderDir,
      // claves útiles en distintos UIs:
      items: tiposExamen,           // ← tu front puede usar 'items'
      tiposExamen,                  // camelCase
      tipos_examen: tiposExamen,    // snake_case
      opciones: { tiposExamen },    // compatibilidad con selects
    };

    return NextResponse.json(payload, {
      status: 200,
      headers: { "Cache-Control": "no-store, max-age=0" },
    });
  } catch (err: any) {
    console.error("GET /examenes-medicos/tipos error:", err);
    return NextResponse.json(
      { success: false, error: err?.sqlMessage ?? err?.message ?? "Error inesperado" },
      { status: 500, headers: { "Cache-Control": "no-store, max-age=0" } }
    );
  }
}
