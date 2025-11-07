import { NextResponse } from "next/server";
import mysql from "mysql2/promise";

export const dynamic = "force-dynamic";

function getPool() {
  const { MYSQL_HOST, MYSQL_PORT, MYSQL_DATABASE, MYSQL_USER, MYSQL_PASSWORD } = process.env;
  // @ts-ignore
  if (!globalThis.__DB_POOL__) {
    // @ts-ignore
    globalThis.__DB_POOL__ = mysql.createPool({
      host: MYSQL_HOST,
      port: MYSQL_PORT ? Number(MYSQL_PORT) : 3306,
      user: MYSQL_USER,
      password: MYSQL_PASSWORD,
      database: MYSQL_DATABASE,
      connectionLimit: 10,
      charset: "utf8mb4_general_ci",
      dateStrings: true,
    });
  }
  // @ts-ignore
  return globalThis.__DB_POOL__ as mysql.Pool;
}

function parseJSONSafe(v: any) {
  if (v == null) return null;
  try { return typeof v === "string" ? JSON.parse(v) : v; } catch { return {}; }
}

export async function GET(_: Request, ctx: { params: { id: string } }) {
  try {
    const id = Number(ctx.params.id);
    const pool = getPool();
    const [rows] = await pool.query(
      `
      SELECT d.*,
             c.nombre AS centro_nombre,
             u.nombre AS creador_nombre
      FROM bi_dashboards d
      LEFT JOIN centros_medicos c ON c.id_centro = d.id_centro
      LEFT JOIN usuarios u ON u.id_usuario = d.creado_por
      WHERE d.id_dashboard = ?`,
      [id]
    );
    const item = (rows as any[])[0];
    if (!item) return NextResponse.json({ success: false, error: "No encontrado" }, { status: 404 });

    item.activo = Number(item.activo) === 1;
    item.publico = Number(item.publico) === 1;
    item.requiere_autenticacion = Number(item.requiere_autenticacion) === 1;
    item.configuracion_json = parseJSONSafe(item.configuracion_json);

    return NextResponse.json({ success: true, item });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e?.message || "Error" }, { status: 500 });
  }
}

export async function PUT(req: Request, ctx: { params: { id: string } }) {
  try {
    const id = Number(ctx.params.id);
    const body = await req.json();
    const pool = getPool();

    // Campos permitidos para update
    const allowed = new Map<string, any>([
      ["id_centro", body.id_centro != null ? Number(body.id_centro) : undefined],
      ["nombre", body.nombre != null ? String(body.nombre) : undefined],
      ["descripcion", body.descripcion ?? undefined],
      ["tipo", body.tipo != null ? String(body.tipo) : undefined],
      ["configuracion_json", body.configuracion_json != null ? JSON.stringify(body.configuracion_json) : undefined],
      ["url_acceso", body.url_acceso ?? undefined],
      ["activo", body.activo != null ? (body.activo ? 1 : 0) : undefined],
      ["publico", body.publico != null ? (body.publico ? 1 : 0) : undefined],
      ["requiere_autenticacion", body.requiere_autenticacion != null ? (body.requiere_autenticacion ? 1 : 0) : undefined],
      ["periodicidad_actualizacion", body.periodicidad_actualizacion ?? undefined],
      ["fecha_ultima_actualizacion", body.fecha_ultima_actualizacion ?? undefined],
      ["categorias", body.categorias ?? undefined],
      ["version", body.version ?? undefined],
      ["creado_por", body.creado_por != null ? Number(body.creado_por) : undefined],
    ]);

    const setParts: string[] = [];
    const params: any[] = [];
    for (const [k, v] of allowed) {
      if (v !== undefined) {
        setParts.push(`${k} = ?`);
        params.push(v);
      }
    }

    if (!setParts.length) {
      return NextResponse.json({ success: false, error: "Nada para actualizar" }, { status: 400 });
    }

    params.push(id);
    await pool.query(`UPDATE bi_dashboards SET ${setParts.join(", ")} WHERE id_dashboard = ?`, params);

    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e?.message || "Error" }, { status: 500 });
  }
}

export async function DELETE(_: Request, ctx: { params: { id: string } }) {
  try {
    const id = Number(ctx.params.id);
    const pool = getPool();
    await pool.query(`DELETE FROM bi_dashboards WHERE id_dashboard = ?`, [id]);
    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e?.message || "Error" }, { status: 500 });
  }
}
