import { NextResponse } from "next/server";
import pool from "@/lib/db";

export const dynamic = "force-dynamic";
export const revalidate = 0;

/* ========================= Utils generales ========================= */
async function getCurrentDB(): Promise<string> {
  const [rows]: any = await pool.query("SELECT DATABASE() AS db");
  return rows?.[0]?.db || "";
}
async function tableExists(table: string): Promise<boolean> {
  const db = await getCurrentDB();
  const [rows]: any = await pool.query(
    "SELECT 1 FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA=? AND TABLE_NAME=? LIMIT 1",
    [db, table]
  );
  return rows?.length > 0;
}
async function getColumns(table: string): Promise<string[]> {
  const db = await getCurrentDB();
  const [rows]: any = await pool.query(
    "SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA=? AND TABLE_NAME=?",
    [db, table]
  );
  return (rows || []).map((r: any) => r.COLUMN_NAME);
}
function pickColumn(cols: string[], candidates: string[], required = false): string {
  const found = candidates.find((c) => cols.includes(c));
  if (!found && required) {
    throw new Error(`Falta columna requerida (${candidates.join(" | ")})`);
  }
  return found || "";
}
const pad2 = (x: any) => String(x ?? "").toUpperCase().padStart(2, "0");

/* ========================= GET ========================= */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const regionParam = (searchParams.get("region") || "").trim();

    // ==================== TABLAS DINÁMICAS ====================
    const paisesTable   = (await tableExists("paises")) ? "paises" : null;
    const regionesTable = (await tableExists("regiones")) ? "regiones" : null;
    const comunasTable  = (await tableExists("comunas")) ? "comunas" : null;
    const previsionesTable = (await tableExists("previsiones_salud")) ? "previsiones_salud" : null;

    /* ---------- Catálogo: Países ---------- */
    let paises: any[] = [];
    if (paisesTable) {
      const [rows]: any = await pool.query(
        `SELECT id_pais AS id, nombre AS label, codigo_iso3 AS iso3
         FROM ${paisesTable} ORDER BY nombre ASC`
      );
      paises = (rows || []).map((r: any) => ({
        id: r.id,
        label: r.label,
        value: r.iso3 || r.id,
      }));
    }

    /* ---------- Catálogo: Regiones ---------- */
    let regiones: any[] = [];
    if (regionesTable) {
      const [rows]: any = await pool.query(
        `SELECT id_region, nombre AS label, codigo
         FROM ${regionesTable}
         WHERE activo = 1
         ORDER BY nombre ASC`
      );
      regiones = rows.map((r: any) => ({
        id_region: r.id_region,
        label: r.label,
        value: r.codigo || r.id_region,
      }));
    }

    /* ---------- Catálogo: Comunas ---------- */
    let comunas: any[] = [];
    if (comunasTable) {
      const params: any[] = [];
      let where = "";
      if (regionParam) {
        where = "WHERE id_region = ? OR LPAD(id_region,2,'0') = LPAD(?,2,'0')";
        params.push(regionParam, regionParam);
      }
      const [rows]: any = await pool.query(
        `SELECT id_comuna, nombre AS label, codigo, id_region
         FROM ${comunasTable} ${where} ORDER BY nombre ASC`,
        params
      );
      comunas = rows.map((r: any) => ({
        id_comuna: r.id_comuna,
        label: r.label,
        codigo: r.codigo,
        region: pad2(r.id_region),
        value: r.codigo || r.id_comuna,
      }));
    }

    /* ---------- Catálogo: Previsiones de Salud ---------- */
    let previsiones: any[] = [];
    if (previsionesTable) {
      const [rows]: any = await pool.query(`
        SELECT 
          codigo AS value,
          nombre AS label,
          tipo,
          cobertura,
          activo
        FROM ${previsionesTable}
        WHERE activo = 1
        ORDER BY 
          CASE 
            WHEN tipo = 'Pública' THEN 1
            WHEN tipo = 'Privada' THEN 2
            WHEN tipo LIKE '%Internacional%' THEN 3
            ELSE 4
          END, nombre ASC;
      `);
      previsiones = rows.map((r: any) => ({
        value: r.value,
        label: r.label,
        tipo: r.tipo,
        cobertura: r.cobertura,
        activo: r.activo,
      }));
    }

    /* ---------- Otros catálogos del sistema ---------- */
    const [centros]: any = await pool
      .query(
        `SELECT id_centro AS value, nombre AS label
         FROM centros_medicos WHERE activo = 1
         ORDER BY nombre ASC`
      )
      .catch(() => [[]]);

    const [totales]: any = await pool
      .query(
        `SELECT 
          (SELECT COUNT(*) FROM pacientes WHERE estado='activo') AS total_pacientes_activos,
          (SELECT COUNT(*) FROM pacientes WHERE estado='inactivo') AS total_pacientes_inactivos,
          (SELECT COUNT(*) FROM pacientes WHERE es_vip=1) AS total_vip`
      )
      .catch(() => [[{}]]);

    // ==================== RESPUESTA FINAL ====================
    return NextResponse.json(
      {
        success: true,
        geo: { paises, regiones, comunas },
        previsiones,  // ✅ NUEVO CATÁLOGO DE PREVISIONES
        centros: centros || [],
        totales: totales?.[0] || {},
        timestamp: new Date().toISOString(),
      },
      { headers: { "Cache-Control": "no-store, max-age=0" } }
    );
  } catch (error: any) {
    console.error("❌ GET /api/admin/pacientes/opciones:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Error al obtener opciones" },
      { status: 500 }
    );
  }
}

/* ========================= POST: búsqueda rápida (sin cambios) ========================= */
export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { buscar, tipo = "pacientes", limite = 50 } = body;

    if (!buscar || String(buscar).trim().length < 2) {
      return NextResponse.json(
        { success: false, error: "Debe ingresar al menos 2 caracteres para buscar" },
        { status: 400 }
      );
    }

    const safeLimit = Math.max(1, Math.min(Number(limite) || 50, 200));
    const searchTerm = `%${String(buscar).trim()}%`;

    if (tipo === "pacientes") {
      const [pacientesRes]: any = await pool.query(
        `SELECT 
          id_paciente AS value,
          CONCAT(nombre, ' ', apellido_paterno, ' ', IFNULL(apellido_materno, ''), 
                 ' (', IFNULL(rut, IFNULL(pasaporte,'')), ')') AS label,
          rut, nombre, apellido_paterno, apellido_materno, email, telefono, fecha_nacimiento
         FROM pacientes
         WHERE estado IN ('activo','inactivo')
           AND (nombre LIKE ? OR apellido_paterno LIKE ? OR rut LIKE ? OR email LIKE ?)
         ORDER BY apellido_paterno ASC, nombre ASC
         LIMIT ?`,
        [searchTerm, searchTerm, searchTerm, searchTerm, safeLimit]
      );
      return NextResponse.json({
        success: true,
        resultados: pacientesRes || [],
        total: (pacientesRes || []).length,
        tipo,
        buscar,
      });
    }

    return NextResponse.json(
      { success: false, error: `Tipo de búsqueda no soportado: ${tipo}` },
      { status: 400 }
    );
  } catch (error: any) {
    console.error("❌ POST /api/admin/pacientes/opciones:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Error en búsqueda" },
      { status: 500 }
    );
  }
}
