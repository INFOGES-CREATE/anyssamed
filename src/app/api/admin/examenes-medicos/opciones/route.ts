import { NextResponse } from "next/server";
import pool from "@/lib/db";
import type { RowDataPacket } from "mysql2/promise";

export const dynamic = "force-dynamic";

/* ================= Utils ================= */
const like = (s: string) => `%${s}%`;
const toInt = (v: any, d = 0) => (Number.isFinite(Number(v)) ? Number(v) : d);

/** Query tolerante a fallo: ante error devuelve [] */
async function safeQuery<T extends RowDataPacket[]>(
  sql: string,
  params: any[] = []
): Promise<T> {
  try {
    const [rows] = await pool.query<T>(sql, params);
    return rows;
  } catch (e) {
    console.warn("[telemedicina-sesiones/opciones] safeQuery:", (e as any)?.message || e);
    return [] as unknown as T;
  }
}

/** Lee valores ENUM reales desde INFORMATION_SCHEMA; si falla, retorna null */
async function readEnum(table: string, column: string): Promise<string[] | null> {
  try {
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT COLUMN_TYPE
         FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_SCHEMA = DATABASE()
          AND TABLE_NAME = ?
          AND COLUMN_NAME = ?
        LIMIT 1`,
      [table, column]
    );
    const ct = (rows?.[0] as any)?.COLUMN_TYPE as string | undefined;
    if (!ct) return null;
    const m = ct.match(/^enum\((.*)\)$/i);
    if (!m) return null;
    return m[1]
      .split(",")
      .map((s) => s.trim().replace(/^'(.*)'$/, "$1"));
  } catch {
    return null;
  }
}

/* ================= GET ================= */
/**
 * GET /api/admin/telemedicina-sesiones/opciones
 * Query:
 *  - id_centro?: filtra médicos y salas por centro
 *  - id_medico?: (opcional) influye en selección de features efectivas
 *  - q?: filtra pacientes por nombre/apellidos/rut
 *  - limit?: límite pacientes (50..5000; default 1000)
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id_centro = searchParams.get("id_centro");
    const id_medico = searchParams.get("id_medico");
    const q = (searchParams.get("q") || "").trim();
    const limit = Math.min(5000, Math.max(50, toInt(searchParams.get("limit") ?? 1000)));

    // Filtros composables para centro en médicos/salas
    const paramsCentroMed: any[] = [];
    const whereCentroMed =
      id_centro
        ? (() => {
            const v = Number(id_centro);
            // considera id_centro y id_centro_principal en medicos
            paramsCentroMed.push(v, v);
            return "WHERE (COALESCE(m.id_centro, m.id_centro_principal) = ? OR m.id_centro_principal = ?)";
          })()
        : "";

    const paramsCentroSala: any[] = [];
    const whereCentroSala = id_centro ? (paramsCentroSala.push(Number(id_centro)), "WHERE id_centro = ?") : "";

    /* ---------- Cargas principales en paralelo ---------- */
    const [
      centrosRows,
      medicosRows,
      pacientesRows,
      salasRows,
      proveedoresRows,
      estadosEnum,
      calidadEnum,
      tiposSalaEnum,
      configRow,
    ] = await Promise.all([
      safeQuery<RowDataPacket[]>(
        `SELECT id_centro, nombre
           FROM centros_medicos
          ORDER BY nombre`
      ),
      safeQuery<RowDataPacket[]>(
        `
        SELECT
          m.id_medico,
          COALESCE(m.id_centro, m.id_centro_principal) AS id_centro,
          u.nombre, u.apellido_paterno, IFNULL(u.apellido_materno,'') AS apm
        FROM medicos m
        JOIN usuarios u ON u.id_usuario = m.id_usuario
        ${whereCentroMed}
        ORDER BY u.nombre, u.apellido_paterno
      `,
        paramsCentroMed
      ),
      safeQuery<RowDataPacket[]>(
        `
        SELECT
          p.id_paciente, p.rut, p.nombre,
          p.apellido_paterno,
          IFNULL(p.apellido_materno,'') AS apm
        FROM pacientes p
        ${q ? "WHERE (p.rut LIKE ? OR p.nombre LIKE ? OR p.apellido_paterno LIKE ? OR p.apellido_materno LIKE ?)" : ""}
        ORDER BY p.nombre, p.apellido_paterno
        LIMIT ?
      `,
        q ? [like(q), like(q), like(q), like(q), limit] : [limit]
      ),
      safeQuery<RowDataPacket[]>(
        `
        SELECT
          id_sala_virtual, id_centro, IFNULL(id_medico,0) AS id_medico,
          nombre, tipo, proveedor_servicio, estado
        FROM telemedicina_salas_virtuales
        ${whereCentroSala}
        ORDER BY nombre
      `,
        paramsCentroSala
      ),
      // Distinct proveedores desde configuraciones y sesiones (si no hay, fallback)
      safeQuery<RowDataPacket[]>(
        `
        SELECT DISTINCT proveedor_servicio
          FROM (
                 SELECT proveedor_servicio FROM telemedicina_configuraciones
                 UNION ALL
                 SELECT proveedor_servicio FROM telemedicina_sesiones
               ) t
         WHERE proveedor_servicio IS NOT NULL
           AND proveedor_servicio <> ''
         ORDER BY proveedor_servicio
      `),
      readEnum("telemedicina_sesiones", "estado"),
      readEnum("telemedicina_sesiones", "calidad_conexion"),
      readEnum("telemedicina_salas_virtuales", "tipo"),
      // Config efectiva por centro/medico (médico tiene prioridad)
      (async () => {
        const params: any[] = [];
        let where = "WHERE activo = 1";
        if (id_centro) {
          where += " AND id_centro = ?";
          params.push(Number(id_centro));
        }
        if (id_medico) {
          // prioriza config de médico si existe; si no, que caiga a centro
          where += " AND (id_medico IS NULL OR id_medico = ?)";
          params.push(Number(id_medico));
        }
        const rows = await safeQuery<RowDataPacket[]>(
          `
          SELECT *
            FROM telemedicina_configuraciones
            ${where}
           ORDER BY (id_medico IS NOT NULL) DESC, fecha_modificacion DESC
           LIMIT 1
        `,
          params
        );
        return rows?.[0] || null;
      })(),
    ]);

    /* ---------- Map a opciones ---------- */
    const centros = centrosRows.map((c: any) => ({
      value: c.id_centro,
      label: c.nombre,
      id_centro: c.id_centro,
    }));

    const medicos = medicosRows.map((m: any) => ({
      value: m.id_medico,
      label: `${m.nombre} ${m.apellido_paterno} ${m.apm}`.replace(/\s+/g, " ").trim(),
      id_centro: m.id_centro,
    }));

    const pacientes = pacientesRows.map((p: any) => ({
      value: p.id_paciente,
      label: `${p.nombre} ${p.apellido_paterno} ${p.apm}${p.rut ? " • " + p.rut : ""}`
        .replace(/\s+/g, " ")
        .trim(),
      rut: p.rut ?? null,
    }));

    const salas = salasRows.map((s: any) => ({
      value: s.id_sala_virtual,
      label: s.nombre,
      id_centro: s.id_centro,
      id_medico: s.id_medico,
      tipo: s.tipo,
      proveedor_servicio: s.proveedor_servicio,
      estado: s.estado,
    }));

    const proveedoresFallback = ["Zoom", "Google Meet", "Microsoft Teams", "Whereby", "Vonage", "Twilio", "Jitsi", "Daily"];
    const proveedores =
      proveedoresRows.length > 0
        ? proveedoresRows.map((r: any) => ({ value: r.proveedor_servicio, label: r.proveedor_servicio }))
        : proveedoresFallback.map((p) => ({ value: p, label: p }));

    const estados =
      (Array.isArray(estadosEnum) && estadosEnum.length ? estadosEnum : ["programada", "en_espera", "en_curso", "finalizada", "cancelada", "no_asistio", "problema_tecnico"])
        .map((s) => ({ value: s, label: s.replaceAll("_", " ").replace(/\b\w/g, (m) => m.toUpperCase()) }));

    const calidad_conexion =
      (Array.isArray(calidadEnum) && calidadEnum.length ? calidadEnum : ["excelente", "buena", "regular", "mala", "muy_mala"])
        .map((s) => ({ value: s, label: s.replaceAll("_", " ").replace(/\b\w/g, (m) => m.toUpperCase()) }));

    const tipos_sala_virtual =
      (Array.isArray(tiposSalaEnum) && tiposSalaEnum.length ? tiposSalaEnum : ["consulta", "procedimiento", "reunion", "capacitacion"])
        .map((s) => ({ value: s, label: s.replaceAll("_", " ").replace(/\b\w/g, (m) => m.toUpperCase()) }));

    /* ---------- Features efectivas (con defaults enterprise) ---------- */
    const features = {
      proveedor_preferido: configRow?.proveedor_servicio ?? null,
      tiempo_espera_minutos: Number(configRow?.tiempo_espera_minutos ?? 15),
      recordatorio_minutos_antes: Number(configRow?.recordatorio_minutos_antes ?? 10),
      max_participantes: Number(configRow?.max_participantes ?? 2),
      permite_compartir_pantalla: !!(configRow?.permite_compartir_pantalla ?? 1),
      permite_chat: !!(configRow?.permite_chat ?? 1),
      permite_grabacion: !!(configRow?.permite_grabacion ?? 0),
    };

    /* ---------- Catálogos “pro” de apoyo (fallbacks) ---------- */
    const recordatorio_minutos = [5, 10, 15, 30, 60, 120, 1440].map((n) => ({
      value: String(n),
      label: n >= 60 ? `${n / 60} h` : `${n} min`,
    }));
    const duraciones_sugeridas = [10, 15, 20, 30, 40, 45, 60].map((n) => ({ value: String(n), label: `${n} min` }));
    const slots_sugeridos = ["08:00", "08:30", "09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "12:00", "15:00", "15:30", "16:00", "16:30", "17:00", "17:30"]
      .map((t) => ({ value: t, label: t }));

    /* ---------- Payload (misma estructura + espejo en opciones) ---------- */
    const payload = {
      success: true,
      centros,
      medicos,
      pacientes,
      salas,
      proveedores,
      estados,
      calidad_conexion,
      tipos_sala_virtual,

      // catálogos de apoyo
      recordatorio_minutos,
      duraciones_sugeridas,
      slots_sugeridos,

      // config efectiva
      features,

      // meta + espejo
      meta: {
        pacientes_limit: limit,
        filtered_by_centro: id_centro ? Number(id_centro) : null,
        filtered_by_medico: id_medico ? Number(id_medico) : null,
      },
      opciones: {
        centros,
        medicos,
        pacientes,
        salas,
        proveedores,
        estados,
        calidad_conexion,
        tipos_sala_virtual,
        recordatorio_minutos,
        duraciones_sugeridas,
        slots_sugeridos,
        features,
      },
    };

    return NextResponse.json(payload);
  } catch (err: any) {
    console.error("GET /telemedicina-sesiones/opciones error:", err);
    return NextResponse.json(
      { success: false, error: err?.sqlMessage ?? err?.message ?? "Error inesperado" },
      { status: 500 }
    );
  }
}
