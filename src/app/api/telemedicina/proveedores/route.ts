// frontend/src/app/api/telemedicina/proveedores/route.ts
import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { RowDataPacket, ResultSetHeader } from "mysql2";

// =====================================================
// 1. Tipos que esperamos de la BD
//    (ajusta los nombres si tu tabla tiene otros)
// =====================================================
interface SesionUsuarioRow extends RowDataPacket {
  id_usuario: number;
}

interface ProveedorRow extends RowDataPacket {
  id_proveedor: number;
  codigo: string;
  nombre: string;
  descripcion: string | null;
  api_base_url: string | null;
  panel_url: string | null;
  requiere_api_key: 0 | 1;
  doc_url: string | null;
  color: string | null;
  caracteristicas: string | null; // lo guardamos como JSON/text
  es_default: 0 | 1;
  activo: 0 | 1;
  fecha_creacion: Date;
  fecha_actualizacion: Date;
  creado_por: number;
}

// lo que le mandamos al front (limpio)
interface ProveedorDTO {
  id_proveedor: number;
  codigo: string;
  nombre: string;
  descripcion: string | null;
  api_base_url: string | null;
  panel_url: string | null;
  requiere_api_key: boolean;
  doc_url: string | null;
  color: string | null;
  caracteristicas: string[]; // ya parseado
  es_default: 0 | 1;
  activo: 0 | 1;
}

// =====================================================
// 2. helpers de sesión (igual que en tu otra ruta)
// =====================================================
const SESSION_COOKIE_CANDIDATES = [
  "session",
  "session_token",
  "medisalud_session",
  "auth_session",
  "next-auth.session-token",
  "__Secure-next-auth.session-token",
];

function getSessionToken(request: NextRequest): string | null {
  const cookieHeader = request.headers.get("cookie") || "";

  if (cookieHeader) {
    const cookies = cookieHeader
      .split(";")
      .map((c) => c.trim())
      .filter(Boolean)
      .reduce((acc, c) => {
        const [k, ...rest] = c.split("=");
        acc[k] = rest.join("=");
        return acc;
      }, {} as Record<string, string>);

    for (const name of SESSION_COOKIE_CANDIDATES) {
      if (cookies[name]) {
        return decodeURIComponent(cookies[name]);
      }
    }
  }

  const auth = request.headers.get("authorization");
  if (auth?.startsWith("Bearer ")) {
    return auth.slice(7);
  }

  return null;
}

async function obtenerUsuarioDeSesion(token: string): Promise<number | null> {
  const [rows] = await pool.query<SesionUsuarioRow[]>(
    `
    SELECT su.id_usuario
    FROM sesiones_usuarios su
    INNER JOIN usuarios u ON su.id_usuario = u.id_usuario
    WHERE su.token = ?
      AND su.activa = 1
      AND su.fecha_expiracion > NOW()
      AND u.estado = 'activo'
    LIMIT 1
    `,
    [token]
  );

  if (!rows.length) return null;
  return rows[0].id_usuario;
}

function safeParseArray(v: string | null): string[] {
  if (!v) return [];
  try {
    const parsed = JSON.parse(v);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    // si guardaron "Baja latencia,Buena calidad" en vez de JSON
    if (v.includes(",")) {
      return v.split(",").map((x) => x.trim());
    }
    return [];
  }
}

// =====================================================
// 3. GET: lista de proveedores de telemedicina
// =====================================================
export async function GET(request: NextRequest) {
  try {
    const token = getSessionToken(request);
    if (!token) {
      return NextResponse.json(
        { success: false, error: "No hay sesión activa" },
        { status: 401 }
      );
    }

    const idUsuario = await obtenerUsuarioDeSesion(token);
    if (!idUsuario) {
      return NextResponse.json(
        { success: false, error: "Sesión inválida o expirada" },
        { status: 401 }
      );
    }

    // actualizamos última actividad (igual que en tu otra ruta)
    await pool.query(
      `UPDATE sesiones_usuarios SET ultima_actividad = NOW() WHERE token = ?`,
      [token]
    );

    // leemos proveedores reales de la tabla
    // NOTA: si tu tabla tiene otros nombres, cámbialos aquí.
    const [rows] = await pool.query<ProveedorRow[]>(
      `
      SELECT
        id_proveedor,
        codigo,
        nombre,
        descripcion,
        api_base_url,
        panel_url,
        requiere_api_key,
        doc_url,
        color,
        caracteristicas,
        es_default,
        activo,
        fecha_creacion,
        fecha_actualizacion,
        creado_por
      FROM telemedicina_proveedores
      WHERE activo = 1
      ORDER BY es_default DESC, nombre ASC
      `
    );

    const proveedores: ProveedorDTO[] = rows.map((r) => ({
      id_proveedor: r.id_proveedor,
      codigo: r.codigo,
      nombre: r.nombre,
      descripcion: r.descripcion,
      api_base_url: r.api_base_url,
      panel_url: r.panel_url,
      requiere_api_key: r.requiere_api_key === 1,
      doc_url: r.doc_url,
      color: r.color,
      caracteristicas: safeParseArray(r.caracteristicas),
      es_default: r.es_default,
      activo: r.activo,
    }));

    return NextResponse.json(
      {
        success: true,
        proveedores,
        total: proveedores.length,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("❌ Error en GET /api/telemedicina/proveedores:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Error interno del servidor",
        details:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}

// =====================================================
// 4. POST: crear/registrar un proveedor en la tabla
//    (para que luego el front lo pueda listar)
// =====================================================
export async function POST(request: NextRequest) {
  try {
    const token = getSessionToken(request);
    if (!token) {
      return NextResponse.json(
        { success: false, error: "No hay sesión activa" },
        { status: 401 }
      );
    }

    const idUsuario = await obtenerUsuarioDeSesion(token);
    if (!idUsuario) {
      return NextResponse.json(
        { success: false, error: "Sesión inválida o expirada" },
        { status: 401 }
      );
    }

    const body = await request.json();

    const codigo: string = body.codigo;
    const nombre: string = body.nombre;
    if (!codigo || !nombre) {
      return NextResponse.json(
        {
          success: false,
          error: "Faltan campos obligatorios: codigo, nombre",
        },
        { status: 400 }
      );
    }

    const descripcion: string | null = body.descripcion ?? null;
    const api_base_url: string | null = body.api_base_url ?? null;
    const panel_url: string | null = body.panel_url ?? null;
    const requiere_api_key: 0 | 1 = body.requiere_api_key ? 1 : 0;
    const doc_url: string | null = body.doc_url ?? null;
    const color: string | null = body.color ?? null;
    const caracteristicas: string | null = body.caracteristicas
      ? JSON.stringify(body.caracteristicas)
      : null;
    const es_default: 0 | 1 = body.es_default ? 1 : 0;
    const activo: 0 | 1 = body.activo === 0 ? 0 : 1;

    // si viene es_default = 1, dejamos los demás en 0
    if (es_default === 1) {
      await pool.query(
        `UPDATE telemedicina_proveedores SET es_default = 0 WHERE es_default = 1`
      );
    }

    const [result] = await pool.query<ResultSetHeader>(
      `
      INSERT INTO telemedicina_proveedores (
        codigo,
        nombre,
        descripcion,
        api_base_url,
        panel_url,
        requiere_api_key,
        doc_url,
        color,
        caracteristicas,
        es_default,
        activo,
        creado_por,
        fecha_creacion,
        fecha_actualizacion
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
      `,
      [
        codigo,
        nombre,
        descripcion,
        api_base_url,
        panel_url,
        requiere_api_key,
        doc_url,
        color,
        caracteristicas,
        es_default,
        activo,
        idUsuario,
      ]
    );

    const insertId = result.insertId;

    const [rowsInserted] = await pool.query<ProveedorRow[]>(
      `
      SELECT
        id_proveedor,
        codigo,
        nombre,
        descripcion,
        api_base_url,
        panel_url,
        requiere_api_key,
        doc_url,
        color,
        caracteristicas,
        es_default,
        activo,
        fecha_creacion,
        fecha_actualizacion,
        creado_por
      FROM telemedicina_proveedores
      WHERE id_proveedor = ?
      LIMIT 1
      `,
      [insertId]
    );

    const inserted = rowsInserted[0];

    const dto: ProveedorDTO = {
      id_proveedor: inserted.id_proveedor,
      codigo: inserted.codigo,
      nombre: inserted.nombre,
      descripcion: inserted.descripcion,
      api_base_url: inserted.api_base_url,
      panel_url: inserted.panel_url,
      requiere_api_key: inserted.requiere_api_key === 1,
      doc_url: inserted.doc_url,
      color: inserted.color,
      caracteristicas: safeParseArray(inserted.caracteristicas),
      es_default: inserted.es_default,
      activo: inserted.activo,
    };

    return NextResponse.json(
      {
        success: true,
        proveedor: dto,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("❌ Error en POST /api/telemedicina/proveedores:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Error interno del servidor",
        details:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}

// =====================================================
// 5. Opcional: puedes agregar un PUT aquí para editar
//    /api/telemedicina/proveedores?id=...
//    pero lo principal (GET para el front y POST para cargar) ya está.
// =====================================================
