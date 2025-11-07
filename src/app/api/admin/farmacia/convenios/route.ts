// frontend/src/app/api/admin/farmacia/convenios/route.ts
import { NextResponse } from "next/server";
import pool from "@/lib/db";
import type { RowDataPacket, ResultSetHeader } from "mysql2/promise";

/** ================== Tipos ================== */
type EstadoConvenio = "activo" | "inactivo" | "pendiente" | "vencido";

interface ConvenioListRow extends RowDataPacket {
  id_convenio: number;
  nombre: string; // alias de nombre_convenio
  descripcion: string | null;
  fecha_inicio: string | null;
  fecha_fin: string | null;
  descuento_porcentaje: number | null;
  condiciones: string | null;
  restricciones: string | null;
  estado: EstadoConvenio;
  documentos_url: string | null;
  codigo_convenio: string | null;
  contacto_convenio: string | null;
  contacto_telefono: string | null;
  contacto_email: string | null;
  id_centro: number;
  id_proveedor: number | null;
  fecha_creacion: string;
  fecha_modificacion: string;
  estado_calculado: EstadoConvenio;
}

/** ================== Helpers ================== */
const ESTADOS: EstadoConvenio[] = ["activo", "inactivo", "pendiente", "vencido"];

const toInt = (v: any, def = 0) => (Number.isFinite(Number(v)) ? Number(v) : def);
const normStr = (v: any) => (typeof v === "string" ? v.trim() : "");
const isYYYYMMDD = (s: string) => /^\d{4}-\d{2}-\d{2}$/.test(s);
const isEmail = (s: string) =>
  !!normStr(s) && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normStr(s));
const isPhone = (s: string) =>
  !!normStr(s) && /^[0-9+\-()\s]{6,20}$/.test(normStr(s));

function computeEstadoByDates(fecha_inicio?: string | null, fecha_fin?: string | null): EstadoConvenio {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (fecha_inicio && isYYYYMMDD(fecha_inicio)) {
    const fi = new Date(fecha_inicio);
    if (fi > today) return "pendiente";
  }
  if (fecha_fin && isYYYYMMDD(fecha_fin)) {
    const ff = new Date(fecha_fin);
    ff.setHours(0, 0, 0, 0);
    if (ff < today) return "vencido";
  }
  return "activo";
}

/** Valida y normaliza payload de convenio (crear/actualizar) */
function validatePayload(input: any, isUpdate = false) {
  const errors: string[] = [];
  const out: any = {};

  // Requeridos en create
  if (!isUpdate) {
    if (!Number.isFinite(Number(input?.id_centro))) {
      errors.push("id_centro es obligatorio y debe ser numérico.");
    } else {
      out.id_centro = Number(input.id_centro);
    }
    const nombre_convenio = normStr(input?.nombre_convenio);
    if (!nombre_convenio) errors.push("nombre_convenio es obligatorio.");
    else if (nombre_convenio.length > 100) errors.push("nombre_convenio excede 100 caracteres.");
    else out.nombre_convenio = nombre_convenio;

    const fi = normStr(input?.fecha_inicio);
    if (!fi || !isYYYYMMDD(fi)) errors.push("fecha_inicio es obligatoria en formato YYYY-MM-DD.");
    else out.fecha_inicio = fi;
  }

  // Opcionales (o requeridos condicionalmente en update si vienen)
  if (input?.id_centro !== undefined) {
    if (!Number.isFinite(Number(input.id_centro))) errors.push("id_centro debe ser numérico.");
    else out.id_centro = Number(input.id_centro);
  }
  if (input?.id_proveedor !== undefined && input.id_proveedor !== null && input.id_proveedor !== "") {
    if (!Number.isFinite(Number(input.id_proveedor))) errors.push("id_proveedor debe ser numérico.");
    else out.id_proveedor = Number(input.id_proveedor);
  } else {
    out.id_proveedor = null;
  }

  if (input?.nombre_convenio !== undefined) {
    const v = normStr(input.nombre_convenio);
    if (!v) errors.push("nombre_convenio no puede ser vacío.");
    else if (v.length > 100) errors.push("nombre_convenio excede 100 caracteres.");
    else out.nombre_convenio = v;
  }

  if (input?.descripcion !== undefined) {
    out.descripcion = normStr(input.descripcion) || null;
  }
  if (input?.fecha_inicio !== undefined) {
    const v = normStr(input.fecha_inicio);
    if (!isYYYYMMDD(v)) errors.push("fecha_inicio debe tener formato YYYY-MM-DD.");
    else out.fecha_inicio = v;
  }
  if (input?.fecha_fin !== undefined && input.fecha_fin !== null && input.fecha_fin !== "") {
    const v = normStr(input.fecha_fin);
    if (!isYYYYMMDD(v)) errors.push("fecha_fin debe tener formato YYYY-MM-DD.");
    else out.fecha_fin = v;
  } else if (!isUpdate) {
    out.fecha_fin = null;
  }

  // fecha_fin >= fecha_inicio
  if (out.fecha_inicio && out.fecha_fin) {
    const fi = new Date(out.fecha_inicio);
    const ff = new Date(out.fecha_fin);
    if (ff < fi) errors.push("fecha_fin no puede ser anterior a fecha_inicio.");
  }

  if (input?.descuento_porcentaje !== undefined && input.descuento_porcentaje !== null && input.descuento_porcentaje !== "") {
    const n = Number(input.descuento_porcentaje);
    if (Number.isNaN(n)) errors.push("descuento_porcentaje debe ser numérico.");
    else if (n < 0 || n > 100) errors.push("descuento_porcentaje debe estar entre 0 y 100.");
    else out.descuento_porcentaje = n;
  } else if (!isUpdate) {
    out.descuento_porcentaje = null;
  }

  if (input?.condiciones !== undefined) out.condiciones = normStr(input.condiciones) || null;
  if (input?.restricciones !== undefined) out.restricciones = normStr(input.restricciones) || null;

  if (input?.estado !== undefined) {
    const e = normStr(input.estado).toLowerCase() as EstadoConvenio;
    if (!ESTADOS.includes(e)) errors.push("estado inválido.");
    else out.estado = e;
  }

  if (input?.documentos_url !== undefined) out.documentos_url = normStr(input.documentos_url) || null;

  if (input?.codigo_convenio !== undefined) {
    const v = normStr(input.codigo_convenio);
    if (v && v.length > 50) errors.push("codigo_convenio excede 50 caracteres.");
    out.codigo_convenio = v || null;
  }

  if (input?.contacto_convenio !== undefined) {
    const v = normStr(input.contacto_convenio);
    if (v && v.length > 100) errors.push("contacto_convenio excede 100 caracteres.");
    out.contacto_convenio = v || null;
  }
  if (input?.contacto_telefono !== undefined) {
    const v = normStr(input.contacto_telefono);
    if (v && !isPhone(v)) errors.push("contacto_telefono inválido.");
    out.contacto_telefono = v || null;
  }
  if (input?.contacto_email !== undefined) {
    const v = normStr(input.contacto_email);
    if (v && !isEmail(v)) errors.push("contacto_email inválido.");
    out.contacto_email = v || null;
  }

  if (input?.creado_por !== undefined && input.creado_por !== null && input.creado_por !== "") {
    if (!Number.isFinite(Number(input.creado_por))) errors.push("creado_por debe ser numérico.");
    else out.creado_por = Number(input.creado_por);
  } else if (!isUpdate) {
    out.creado_por = null; // permitido nulo por la FK
  }

  // Si no viene 'estado' explícito, lo inferimos por fechas
  if (!("estado" in out)) {
    const e = computeEstadoByDates(out.fecha_inicio, out.fecha_fin);
    out.estado = e;
  }

  return { valid: errors.length === 0, errors, data: out };
}

/** ================== GET (listado con filtros) ================== */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const q = (searchParams.get("q") ?? "").trim();
    const id_centro = searchParams.get("id_centro");
    const id_proveedor = searchParams.get("id_proveedor");
    const estadoParam = (searchParams.get("estado") ?? "").trim(); // "activo,pendiente"
    const vigentes = searchParams.get("vigentes"); // "1" -> por fechas

    const page = Math.max(1, Number(searchParams.get("page") ?? 1));
    const pageSize = Math.min(100, Math.max(1, Number(searchParams.get("pageSize") ?? 50)));

    const sortByParam = (searchParams.get("sortBy") ?? "nombre").toLowerCase();
    const sortDirParam = (searchParams.get("sortDir") ?? "asc").toLowerCase();

    const sortMap: Record<string, string> = {
      nombre: "c.nombre_convenio",
      fecha_inicio: "c.fecha_inicio",
      fecha_fin: "c.fecha_fin",
      actualizado: "c.fecha_modificacion",
      creado: "c.fecha_creacion",
      descuento: "c.descuento_porcentaje",
      estado: "c.estado",
    };

    const sortBy = sortMap[sortByParam] ?? sortMap["nombre"];
    const sortDir = sortDirParam === "desc" ? "DESC" : "ASC";

    const where: string[] = [];
    const params: any[] = [];

    if (estadoParam) {
      const estados = estadoParam
        .split(",")
        .map((s) => s.trim().toLowerCase())
        .filter((s) => ESTADOS.includes(s as EstadoConvenio));
      if (estados.length) {
        where.push(`c.estado IN (${estados.map(() => "?").join(",")})`);
        params.push(...estados);
      }
    } else {
      where.push(`c.estado IN ('activo','pendiente')`);
    }

    if (vigentes === "1") where.push(`(c.fecha_fin IS NULL OR c.fecha_fin >= CURDATE())`);
    if (id_centro && !isNaN(Number(id_centro))) {
      where.push(`c.id_centro = ?`);
      params.push(Number(id_centro));
    }
    if (id_proveedor && !isNaN(Number(id_proveedor))) {
      where.push(`c.id_proveedor = ?`);
      params.push(Number(id_proveedor));
    }
    if (q) {
      where.push(`(c.nombre_convenio LIKE CONCAT('%', ?, '%') OR c.codigo_convenio LIKE CONCAT('%', ?, '%'))`);
      params.push(q, q);
    }

    const whereSQL = where.length ? `WHERE ${where.join(" AND ")}` : "";
    const offset = (page - 1) * pageSize;

    const [countRows] = await pool.query<RowDataPacket[]>(
      `SELECT COUNT(*) AS total FROM farmacia_convenios c ${whereSQL};`,
      params,
    );
    const total = Number((countRows as any)[0]?.total ?? 0);

    const [rows] = await pool.query<ConvenioListRow[]>(
      `
      SELECT
        c.id_convenio,
        c.nombre_convenio AS nombre,
        c.descripcion,
        c.fecha_inicio,
        c.fecha_fin,
        c.descuento_porcentaje,
        c.condiciones,
        c.restricciones,
        c.estado,
        c.documentos_url,
        c.codigo_convenio,
        c.contacto_convenio,
        c.contacto_telefono,
        c.contacto_email,
        c.id_centro,
        c.id_proveedor,
        c.fecha_creacion,
        c.fecha_modificacion,
        CASE
          WHEN c.fecha_fin IS NOT NULL AND c.fecha_fin < CURDATE() THEN 'vencido'
          WHEN c.fecha_inicio IS NOT NULL AND c.fecha_inicio > CURDATE() THEN 'pendiente'
          ELSE c.estado
        END AS estado_calculado
      FROM farmacia_convenios c
      ${whereSQL}
      ORDER BY ${sortBy} ${sortDir}
      LIMIT ? OFFSET ?;
      `,
      [...params, pageSize, offset],
    );

    return NextResponse.json({ success: true, page, pageSize, total, data: rows });
  } catch (error: any) {
    console.error("GET /api/admin/farmacia/convenios error:", error);
    return NextResponse.json(
      { success: false, error: error?.sqlMessage || error?.message || "Error desconocido" },
      { status: 500 },
    );
  }
}

/** ================== POST (crear convenio) ================== */
export async function POST(req: Request) {
  const cn = await pool.getConnection();
  try {
    const body = await req.json();
    const { valid, errors, data } = validatePayload(body, false);
    if (!valid) return NextResponse.json({ success: false, errors }, { status: 400 });

    // Verificaciones FK básicas
    const [centro] = await cn.query<RowDataPacket[]>(
      "SELECT 1 FROM centros_medicos WHERE id_centro = ? LIMIT 1;",
      [data.id_centro],
    );
    if ((centro as any).length === 0) {
      return NextResponse.json({ success: false, error: "id_centro no existe." }, { status: 400 });
    }
    if (data.id_proveedor) {
      const [prov] = await cn.query<RowDataPacket[]>(
        "SELECT 1 FROM farmacia_proveedores WHERE id_proveedor = ? LIMIT 1;",
        [data.id_proveedor],
      );
      if ((prov as any).length === 0) {
        return NextResponse.json({ success: false, error: "id_proveedor no existe." }, { status: 400 });
      }
    }
    if (data.creado_por) {
      const [usr] = await cn.query<RowDataPacket[]>(
        "SELECT 1 FROM usuarios WHERE id_usuario = ? LIMIT 1;",
        [data.creado_por],
      );
      if ((usr as any).length === 0) {
        return NextResponse.json({ success: false, error: "creado_por no existe." }, { status: 400 });
      }
    }

    // Unicidad opcional por codigo_convenio (si viene)
    if (data.codigo_convenio) {
      const [dup] = await cn.query<RowDataPacket[]>(
        "SELECT id_convenio FROM farmacia_convenios WHERE codigo_convenio = ? LIMIT 1;",
        [data.codigo_convenio],
      );
      if ((dup as any).length > 0) {
        return NextResponse.json(
          { success: false, error: "codigo_convenio ya existe. Use otro código." },
          { status: 409 },
        );
      }
    }

    await cn.beginTransaction();
    const [res] = await cn.query<ResultSetHeader>(
      `
      INSERT INTO farmacia_convenios (
        id_centro, id_proveedor, nombre_convenio, descripcion,
        fecha_inicio, fecha_fin, descuento_porcentaje,
        condiciones, restricciones, estado,
        documentos_url, codigo_convenio,
        contacto_convenio, contacto_telefono, contacto_email,
        creado_por
      ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?);
      `,
      [
        data.id_centro ?? null,
        data.id_proveedor ?? null,
        data.nombre_convenio ?? null,
        data.descripcion ?? null,
        data.fecha_inicio ?? null,
        data.fecha_fin ?? null,
        data.descuento_porcentaje ?? null,
        data.condiciones ?? null,
        data.restricciones ?? null,
        data.estado ?? "activo", // default controlado por validador
        data.documentos_url ?? null,
        data.codigo_convenio ?? null,
        data.contacto_convenio ?? null,
        data.contacto_telefono ?? null,
        data.contacto_email ?? null,
        data.creado_por ?? null,
      ],
    );

    const id_convenio = res.insertId;

    // Devolvemos el registro creado
    const [row] = await cn.query<RowDataPacket[]>(
      `
      SELECT
        c.*, 
        CASE
          WHEN c.fecha_fin IS NOT NULL AND c.fecha_fin < CURDATE() THEN 'vencido'
          WHEN c.fecha_inicio IS NOT NULL AND c.fecha_inicio > CURDATE() THEN 'pendiente'
          ELSE c.estado
        END AS estado_calculado
      FROM farmacia_convenios c
      WHERE c.id_convenio = ? LIMIT 1;
      `,
      [id_convenio],
    );

    await cn.commit();
    return NextResponse.json({ success: true, id_convenio, data: (row as any)[0] }, { status: 201 });
  } catch (error: any) {
    await cn.rollback();
    console.error("POST /api/admin/farmacia/convenios error:", error);
    return NextResponse.json(
      { success: false, error: error?.sqlMessage || error?.message || "Error desconocido" },
      { status: 500 },
    );
  } finally {
    cn.release();
  }
}
