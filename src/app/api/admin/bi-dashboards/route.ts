import { NextResponse } from "next/server";
import mysql from "mysql2/promise";

export const dynamic = "force-dynamic";

function getPool() {
  const { MYSQL_HOST, MYSQL_PORT, MYSQL_DATABASE, MYSQL_USER, MYSQL_PASSWORD } = process.env;
  if (!MYSQL_HOST || !MYSQL_DATABASE || !MYSQL_USER) {
    throw new Error("Config DB incompleta. Define MYSQL_HOST, MYSQL_DATABASE, MYSQL_USER, MYSQL_PASSWORD");
  }
  // @ts-ignore - memoize in globalThis
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

type Q = {
  search?: string;
  tipo?: string;
  id_centro?: string;
  activo?: string;
  publico?: string;
  requiere_autenticacion?: string;
  desde?: string;
  hasta?: string;
  pagina?: string;
  pageSize?: string;
};

export async function GET(req: Request) {
  try {
    const pool = getPool();
    const { searchParams } = new URL(req.url);

    const q: Q = Object.fromEntries(searchParams.entries()) as any;
    const pagina = Math.max(1, Number(q.pagina || 1));
    const pageSize = Math.min(200, Math.max(1, Number(q.pageSize || 20)));
    const offset = (pagina - 1) * pageSize;

    const where: string[] = [];
    const params: any[] = [];

    if (q.search) {
      where.push(`(d.nombre LIKE ? OR d.descripcion LIKE ? OR d.categorias LIKE ?)`);
      params.push(`%${q.search}%`, `%${q.search}%`, `%${q.search}%`);
    }
    if (q.tipo) { where.push(`d.tipo = ?`); params.push(q.tipo); }
    if (q.id_centro) { where.push(`d.id_centro = ?`); params.push(Number(q.id_centro)); }
    if (q.activo === "0" || q.activo === "1") { where.push(`d.activo = ?`); params.push(Number(q.activo)); }
    if (q.publico === "0" || q.publico === "1") { where.push(`d.publico = ?`); params.push(Number(q.publico)); }
    if (q.requiere_autenticacion === "0" || q.requiere_autenticacion === "1") { where.push(`d.requiere_autenticacion = ?`); params.push(Number(q.requiere_autenticacion)); }
    if (q.desde) { where.push(`(d.fecha_ultima_actualizacion IS NOT NULL AND d.fecha_ultima_actualizacion >= ?)`); params.push(`${q.desde} 00:00:00`); }
    if (q.hasta) { where.push(`(d.fecha_ultima_actualizacion IS NOT NULL AND d.fecha_ultima_actualizacion <= ?)`); params.push(`${q.hasta} 23:59:59`); }

    const whereSQL = where.length ? `WHERE ${where.join(" AND ")}` : "";

    const [rows] = await pool.query(
      `
      SELECT d.*,
             c.nombre AS centro_nombre,
             u.nombre AS creador_nombre
      FROM bi_dashboards d
      LEFT JOIN centros_medicos c ON c.id_centro = d.id_centro
      LEFT JOIN usuarios u ON u.id_usuario = d.creado_por
      ${whereSQL}
      ORDER BY d.fecha_modificacion DESC, d.id_dashboard DESC
      LIMIT ? OFFSET ?
      `,
      [...params, pageSize, offset]
    );

    const [countRows] = await pool.query(
      `SELECT COUNT(*) AS total FROM bi_dashboards d ${whereSQL}`,
      params
    );
    const total = Number((countRows as any[])[0]?.total || 0);

    // stats
    const [byType] = await pool.query(
      `SELECT d.tipo, COUNT(*) cnt FROM bi_dashboards d ${whereSQL} GROUP BY d.tipo`,
      params
    );
    const [onCounts] = await pool.query(
      `SELECT 
          SUM(d.activo=1) activos,
          SUM(d.publico=1) publicos,
          SUM(d.publico=0) privados,
          SUM(d.requiere_autenticacion=1) con_auth
        FROM bi_dashboards d
        ${whereSQL}`,
      params
    );

    const items = (rows as any[]).map((r) => ({
      ...r,
      activo: Number(r.activo) === 1,
      publico: Number(r.publico) === 1,
      requiere_autenticacion: Number(r.requiere_autenticacion) === 1,
      configuracion_json: parseJSONSafe(r.configuracion_json),
    }));

    return NextResponse.json({
      success: true,
      items,
      total,
      pagina,
      pageSize,
      stats: {
        total,
        por_tipo: Object.fromEntries((byType as any[]).map((t: any) => [t.tipo, Number(t.cnt)])),
        ...(onCounts as any[])[0],
      },
    });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e?.message || "Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const pool = getPool();

    // Validación mínima
    if (!body?.id_centro || !body?.nombre || !body?.tipo) {
      return NextResponse.json({ success: false, error: "id_centro, nombre y tipo son obligatorios" }, { status: 400 });
    }

    const configuracion = JSON.stringify(body.configuracion_json ?? {});
    const [res] = await pool.query(
      `INSERT INTO bi_dashboards 
       (id_centro, nombre, descripcion, tipo, configuracion_json, url_acceso, activo, publico, requiere_autenticacion, periodicidad_actualizacion, fecha_ultima_actualizacion, categorias, version, creado_por)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [
        Number(body.id_centro),
        String(body.nombre),
        body.descripcion ?? null,
        String(body.tipo),
        configuracion,
        body.url_acceso ?? null,
        body.activo ? 1 : 0,
        body.publico ? 1 : 0,
        body.requiere_autenticacion ? 1 : 0,
        body.periodicidad_actualizacion ?? null,
        body.fecha_ultima_actualizacion ?? null,
        body.categorias ?? null,
        body.version ?? "1.0",
        body.creado_por ? Number(body.creado_por) : null,
      ]
    );

    const id = (res as any).insertId;
    return NextResponse.json({ success: true, id_dashboard: id });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e?.message || "Error" }, { status: 500 });
  }
}

function parseJSONSafe(v: any) {
  if (v == null) return null;
  try {
    if (typeof v === "string") return JSON.parse(v);
    return v;
  } catch {
    return {};
  }
}
