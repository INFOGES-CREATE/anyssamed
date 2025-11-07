// frontend/src/app/api/admin/telemedicina-sesiones/route.ts
import { NextResponse } from "next/server";
import pool from "@/lib/db";
import type { RowDataPacket, ResultSetHeader, PoolConnection } from "mysql2/promise";
import { randomBytes } from "crypto";

export const dynamic = "force-dynamic";
export const revalidate = 0;

/* ================= Utils ================= */
const like = (s: string) => `%${s}%`;
const toInt = (v: any, d = 0) => (Number.isFinite(Number(v)) ? Number(v) : d);

async function getCols(table: string): Promise<Set<string>> {
  const [rows]: any = await pool.query(`SHOW COLUMNS FROM ${table}`);
  return new Set((rows || []).map((r: any) => r.Field));
}
async function colExists(table: string, col: string) {
  try {
    const [rows]: any = await pool.query(`SHOW COLUMNS FROM ${table} LIKE ?`, [col]);
    return rows?.length > 0;
  } catch {
    return false;
  }
}

/** Nullability y default reales de una columna */
async function getColMeta(
  table: string,
  column: string
): Promise<{ isNullable: boolean; hasDefault: boolean }> {
  try {
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT IS_NULLABLE, COLUMN_DEFAULT
         FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_SCHEMA = DATABASE()
          AND TABLE_NAME = ?
          AND COLUMN_NAME = ?
        LIMIT 1`,
      [table, column]
    );
    const r = rows?.[0] as any;
    const isNullable = String(r?.IS_NULLABLE ?? "YES").toUpperCase() === "YES";
    const hasDefault = r?.COLUMN_DEFAULT !== null && r?.COLUMN_DEFAULT !== undefined;
    return { isNullable, hasDefault };
  } catch {
    // Fallback conservador
    return { isNullable: true, hasDefault: false };
  }
}

/* ================= GET: Listado ================= */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const pagina = Math.max(1, toInt(searchParams.get("pagina") ?? searchParams.get("page") ?? 1));
    const pageSize = Math.min(100, Math.max(1, toInt(searchParams.get("pageSize") ?? 20)));
    const offset = (pagina - 1) * pageSize;

    const search = (searchParams.get("search") ?? searchParams.get("q") ?? "").trim();
    const estado = (searchParams.get("estado") ?? "").trim();
    const proveedor = (searchParams.get("proveedor") ?? "").trim();
    const idCentro = searchParams.get("id_centro") ? Number(searchParams.get("id_centro")) : null;
    const idMedico = searchParams.get("id_medico") ? Number(searchParams.get("id_medico")) : null;
    const idPaciente = searchParams.get("id_paciente") ? Number(searchParams.get("id_paciente")) : null;
    const desde = (searchParams.get("desde") ?? "").trim();
    const hasta = (searchParams.get("hasta") ?? "").trim();

    const cols = await getCols("telemedicina_sesiones");
    const hasEstado = cols.has("estado");
    const hasProv = cols.has("proveedor_servicio");
    const hasToken = cols.has("token_acceso");
    const hasUrl = cols.has("url_sesion");

    const dateCol =
      ["fecha_hora_inicio_programada", "fecha_creacion", "fecha_hora_inicio_real"].find((c) =>
        cols.has(c)
      ) || "id_sesion";

    const where: string[] = [];
    const params: any[] = [];

    if (search) {
      const parts = [
        "p.rut LIKE ?",
        "p.nombre LIKE ?",
        "p.apellido_paterno LIKE ?",
        "p.apellido_materno LIKE ?",
        "CONCAT(u.nombre,' ',u.apellido_paterno,' ',IFNULL(u.apellido_materno,'')) LIKE ?",
      ];
      const p = [like(search), like(search), like(search), like(search), like(search)];
      if (hasToken) {
        parts.push("ts.token_acceso LIKE ?");
        p.push(like(search));
      }
      if (hasUrl) {
        parts.push("ts.url_sesion LIKE ?");
        p.push(like(search));
      }
      where.push(`(${parts.join(" OR ")})`);
      params.push(...p);
    }
    if (hasEstado && estado) {
      where.push("ts.estado = ?");
      params.push(estado);
    }
    if (hasProv && proveedor) {
      where.push("ts.proveedor_servicio = ?");
      params.push(proveedor);
    }
    if (idCentro) {
      where.push("m.id_centro = ?");
      params.push(idCentro);
    }
    if (idMedico) {
      where.push("ts.id_medico = ?");
      params.push(idMedico);
    }
    if (idPaciente) {
      where.push("ts.id_paciente = ?");
      params.push(idPaciente);
    }
    if (desde) {
      where.push(`ts.${dateCol} >= ?`);
      params.push(desde);
    }
    if (hasta) {
      where.push(`ts.${dateCol} <= ?`);
      params.push(hasta);
    }

    const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";

    const baseFrom = `
      FROM telemedicina_sesiones ts
      JOIN pacientes p ON p.id_paciente = ts.id_paciente
      JOIN medicos m   ON m.id_medico   = ts.id_medico
      JOIN usuarios u  ON u.id_usuario  = m.id_usuario
      LEFT JOIN centros_medicos c ON c.id_centro = m.id_centro
    `;

    const stats: any = {
      total: 0,
      programadas: 0,
      en_espera: 0,
      en_curso: 0,
      finalizadas: 0,
      canceladas: 0,
      no_asistio: 0,
      problema_tecnico: 0,
    };
    const [cntTotal]: any = await pool.query(`SELECT COUNT(*) total ${baseFrom} ${whereSql}`, params);
    stats.total = Number(cntTotal?.[0]?.total ?? 0);
    if (hasEstado) {
      const estados = [
        "programada",
        "en_espera",
        "en_curso",
        "finalizada",
        "cancelada",
        "no_asistio",
        "problema_tecnico",
      ];
      await Promise.all(
        estados.map(async (es) => {
          const [r]: any = await pool.query(
            `SELECT COUNT(*) n ${baseFrom} ${whereSql ? whereSql + " AND " : "WHERE "} ts.estado = ?`,
            [...params, es]
          );
          stats[es.replace(/-/g, "_")] = Number(r?.[0]?.n ?? 0);
        })
      );
    }

    const selectProv = hasProv ? "ts.proveedor_servicio" : "NULL";
    const selectToken = hasToken ? "ts.token_acceso" : "NULL";
    const selectUrl = hasUrl ? "ts.url_sesion" : "NULL";
    const selectEstado = hasEstado ? "ts.estado" : "NULL";

    const dataSql = `
      SELECT
        ts.id_sesion, ts.id_cita, ts.id_paciente, ts.id_medico,
        m.id_centro,
        ${selectProv} AS proveedor_servicio,
        ${selectEstado} AS estado,
        ts.fecha_hora_inicio_programada, ts.fecha_hora_fin_programada,
        ts.fecha_hora_inicio_real, ts.fecha_hora_fin_real,
        ts.duracion_segundos,
        ${selectToken} AS token_acceso,
        ${selectUrl}   AS url_sesion,
        CONCAT(p.nombre,' ',p.apellido_paterno,' ',IFNULL(p.apellido_materno,'')) AS paciente_nombre,
        p.rut AS paciente_rut,
        CONCAT(u.nombre,' ',u.apellido_paterno,' ',IFNULL(u.apellido_materno,'')) AS medico_nombre,
        c.nombre AS centro_nombre,
        ts.calidad_conexion
      ${baseFrom}
      ${whereSql}
      ORDER BY ts.${dateCol} DESC, ts.id_sesion DESC
      LIMIT ? OFFSET ?
    `;
    const [rows] = await pool.query<RowDataPacket[]>(dataSql, [...params, pageSize, offset]);

    return NextResponse.json({
      success: true,
      pagina,
      pageSize,
      total: stats.total,
      stats,
      items: rows,
    });
  } catch (err: any) {
    console.error("GET /telemedicina-sesiones error:", err);
    return NextResponse.json(
      { success: false, error: err?.message ?? "Error inesperado" },
      { status: 500 }
    );
  }
}

/* ================= POST: Crear ================= */
export async function POST(req: Request) {
  let conn: PoolConnection | null = null;
  try {
    const body = await req.json();

    // Requeridos de negocio (id_cita puede ser opcional)
    const required = [
      "id_paciente",
      "id_medico",
      "fecha_hora_inicio_programada",
      "fecha_hora_fin_programada",
      "proveedor_servicio",
    ] as const;
    const faltantes = required.filter((k) => !body[k]);
    if (faltantes.length) {
      return NextResponse.json(
        { success: false, error: `Campos requeridos faltantes: ${faltantes.join(", ")}` },
        { status: 400 }
      );
    }
    if (
      new Date(body.fecha_hora_inicio_programada).getTime() >
      new Date(body.fecha_hora_fin_programada).getTime()
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "La fecha de inicio programada no puede ser mayor que la de fin programada.",
        },
        { status: 400 }
      );
    }

    const cols = await getCols("telemedicina_sesiones");
    const hasToken = cols.has("token_acceso");
    const hasUrl = cols.has("url_sesion");

    // Base para URL de join configurable (fallback: /admin/telemedicina/join)
    const baseJoin = (process.env.NEXT_PUBLIC_TELEMEDICINA_JOIN_BASE ||
      "/admin/telemedicina/join")!.replace(/\/+$/, "");

    const norm = (v: unknown) => (typeof v === "string" ? v.trim() : "");

    // token_acceso sólo si existe la columna
    let token: string | null = null;
    if (hasToken) {
      token = norm((body as any).token_acceso) || randomBytes(24).toString("hex");
    }

    // url_sesion sólo si existe la columna y hay token (o cliente mandó url explícita)
    let url: string | null = null;
    if (hasUrl) {
      const bodyUrl = norm((body as any).url_sesion);
      url = bodyUrl || (token ? `${baseJoin}/${token}` : null);
    }

    // Validación/estrategia para id_cita según esquema real
    let idCitaInclude = false;
    let idCitaValue: number | null | undefined = undefined;
    if (cols.has("id_cita")) {
      const meta = await getColMeta("telemedicina_sesiones", "id_cita");
      const inBody = (body.id_cita ?? undefined) as number | undefined;

      if (inBody !== undefined && inBody !== null) {
        idCitaInclude = true;
        idCitaValue = Number(inBody);
      } else if (meta.isNullable) {
        idCitaInclude = true;
        idCitaValue = null;
      } else if (meta.hasDefault) {
        // Omitir columna para que aplique DEFAULT
        idCitaInclude = false;
      } else {
        // NOT NULL sin DEFAULT => exigirlo claramente
        return NextResponse.json(
          { success: false, error: "id_cita es requerido por el esquema (NOT NULL sin DEFAULT)." },
          { status: 400 }
        );
      }
    }

    // Candidatos (sólo se insertan columnas existentes y con valor !== undefined)
    const candidates: Record<string, any> = {
      id_paciente: body.id_paciente,
      id_medico: body.id_medico,
      proveedor_servicio: body.proveedor_servicio,
      fecha_hora_inicio_programada: body.fecha_hora_inicio_programada,
      fecha_hora_fin_programada: body.fecha_hora_fin_programada,
      estado: cols.has("estado") ? body.estado ?? "programada" : undefined,
      token_acceso: hasToken ? token : undefined,
      url_sesion: hasUrl ? url : undefined,
      id_sala_virtual: body.id_sala_virtual ?? null,
      grabacion_autorizada: body.grabacion_autorizada ? 1 : 0,
    };

    const fields: string[] = [];
    const values: any[] = [];

    // id_cita primero (si aplica)
    if (cols.has("id_cita") && idCitaInclude) {
      fields.push("id_cita");
      values.push(idCitaValue);
    }

    Object.entries(candidates).forEach(([k, v]) => {
      if (!cols.has(k)) return;
      if (v === undefined) return; // omitir undefined (p.ej., columnas no presentes o sin valor)
      fields.push(k);
      values.push(v);
    });

    if (!fields.length) {
      return NextResponse.json({ success: false, error: "Payload vacío" }, { status: 400 });
    }

    const columnsSql = fields.map((f) => `\`${f}\``).join(", ");
    const placeholdersSql = fields.map(() => "?").join(", ");
    const sql = `INSERT INTO \`telemedicina_sesiones\` (${columnsSql}) VALUES (${placeholdersSql})`;

    conn = await pool.getConnection();
    await conn.beginTransaction();
    const [ins] = await conn.query<ResultSetHeader>(sql, values);
    const id_sesion = (ins as ResultSetHeader).insertId;
    await conn.commit();

    return NextResponse.json({
      success: true,
      id_sesion,
      token_acceso: hasToken ? token : null,
      url_sesion: hasUrl ? url : null,
    });
  } catch (err: any) {
    try {
      if (conn) await conn.rollback();
    } catch {}
    console.error("POST /telemedicina-sesiones error:", err);
    return NextResponse.json(
      { success: false, error: err?.sqlMessage ?? err?.message ?? "Error inesperado" },
      { status: 500 }
    );
  } finally {
    try {
      if (conn) conn.release();
    } catch {}
  }
}
