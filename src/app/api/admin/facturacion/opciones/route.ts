// frontend/src/app/api/admin/facturacion/opciones/route.ts
import { NextResponse } from "next/server";
import pool from "@/lib/db";
import type { RowDataPacket } from "mysql2/promise";

/** Helpers */
const cap = (s: string) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : "");
const enumToOptions = <T extends string>(vals: readonly T[], labels?: Partial<Record<T, string>>) =>
  vals.map((v) => ({ value: v, label: labels?.[v] ?? cap(v.replace(/_/g, " ")) }));

async function safeQuery<T = RowDataPacket[]>(
  sql: string,
  params: any[] = []
): Promise<T extends RowDataPacket[] ? RowDataPacket[] : any[]> {
  try {
    const [rows] = await pool.query<RowDataPacket[]>(sql, params);
    return rows as any;
  } catch (e) {
    console.error("[/facturacion/opciones] Query error:", e);
    return [] as any;
  }
}

export async function GET() {
  // ====== Defaults de respuesta (estructura fija) ======
  const resp: {
    success: true;
    centros: Array<{ value: number; label: string }>;
    pacientes: Array<{ value: number; label: string; rut: string; email: string }>;
    metodosPago: Array<{ value: number; label: string; tipo: string }>;
    convenios: Array<{ value: number; label: string }>;
    estados: Array<{ value: string; label: string }>;
    tiposDocumento: Array<{ value: string; label: string }>;
    monedas: Array<{ value: "CLP" | "USD" | "EUR"; label: string; simbolo: string }>;
  } = {
    success: true,
    centros: [],
    pacientes: [],
    metodosPago: [],
    convenios: [],
    estados: [],
    tiposDocumento: [],
    monedas: [],
  };

  // ====== Catálogos fijos (enums) ======
  const ESTADOS = ["emitida", "pagada", "anulada", "vencida", "parcial", "en_revision"] as const;
  const TIPOS = ["factura", "boleta", "presupuesto", "nota_credito", "nota_debito"] as const;

  resp.estados = enumToOptions(ESTADOS);
  resp.tiposDocumento = enumToOptions(TIPOS, {
    nota_credito: "Nota de crédito",
    nota_debito: "Nota de débito",
  });
  resp.monedas = [
    { value: "CLP", label: "Peso chileno (CLP)", simbolo: "$" },
    { value: "USD", label: "Dólar (USD)", simbolo: "US$" },
    { value: "EUR", label: "Euro (EUR)", simbolo: "€" },
  ];

  // ====== Ejecutamos consultas en paralelo con tolerancia a errores ======
  const centrosQ = safeQuery(
    `
    SELECT id_centro, nombre
    FROM centros_medicos
    WHERE estado = 'activo'
    ORDER BY nombre
    LIMIT 1000
    `
  );

  const pacientesQ = safeQuery(
    `
    SELECT
      id_paciente,
      rut,
      CONCAT(nombre, ' ', apellido_paterno, IFNULL(CONCAT(' ', apellido_materno), '')) AS nombre_completo
    FROM pacientes
    ORDER BY nombre_completo
    LIMIT 2000
    `
  );

  const metodosPagoQ = safeQuery(
    `
    SELECT id_metodo_pago, nombre, tipo
    FROM metodos_pago
    WHERE activo = 1
    ORDER BY COALESCE(orden, 999999), nombre
    LIMIT 1000
    `
  );

  // ====== CONVENIOS (corregido según tu tabla) ======
  // Usamos la tabla `convenios` con sus columnas reales.
  // Filtramos por estado vigente y fecha (si aplica).
  const conveniosQ = safeQuery(
    `
    SELECT
      id_convenio,
      nombre_convenio,
      estado
    FROM convenios_institucionales
    WHERE estado IN ('activo', 'pendiente')
      AND (fecha_inicio IS NULL OR fecha_inicio <= CURDATE())
      AND (fecha_fin IS NULL OR fecha_fin >= CURDATE())
    ORDER BY COALESCE(prioridad, 999), nombre_convenio
    LIMIT 1000
    `
  );

  const [centrosRows, pacientesRows, metodosRows, conveniosRows] = await Promise.all([
    centrosQ,
    pacientesQ,
    metodosPagoQ,
    conveniosQ,
  ]);

  // ====== Mapas seguros ======
  resp.centros = (centrosRows as RowDataPacket[]).map((r) => ({
    value: Number(r.id_centro),
    label: String(r.nombre || "").trim(),
  }));

  resp.pacientes = (pacientesRows as RowDataPacket[]).map((r) => ({
    value: Number(r.id_paciente),
    label: String(r.nombre_completo || "").trim(),
    rut: String(r.rut || ""),
    // Evitamos "unknown column" si tu tabla no tiene email; si luego agregas, lo mapeas aquí.
    email: "",
  }));

  resp.metodosPago = (metodosRows as RowDataPacket[]).map((r) => ({
    value: Number(r.id_metodo_pago),
    label: String(r.nombre || "").trim(),
    tipo: String(r.tipo || "").trim(),
  }));

  // Fallback si no hay metodos_pago (tabla inexistente o vacía)
  if (!resp.metodosPago.length) {
    resp.metodosPago = [
      { value: 1, label: "Efectivo", tipo: "presencial" },
      { value: 2, label: "Tarjeta débito/crédito", tipo: "pos" },
      { value: 3, label: "Transferencia bancaria", tipo: "transferencia" },
    ];
  }

  // Convenios → mantener la misma forma { value, label } para no romper el frontend.
  resp.convenios = (conveniosRows as RowDataPacket[]).map((r) => ({
    value: Number(r.id_convenio),
    label: String(r.nombre_convenio || "").trim(),
  }));

  return NextResponse.json(resp, {
    headers: {
      "Cache-Control": "private, max-age=60",
    },
  });
}
