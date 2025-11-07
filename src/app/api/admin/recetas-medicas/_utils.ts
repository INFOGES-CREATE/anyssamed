// frontend/src/app/api/admin/recetas-medicas/_utils.ts
import pool from "@/lib/db";

export function tipoAbbr(tipo?: string | null) {
  const t = (tipo || "").toLowerCase();
  if (t.includes("electr")) return "E";
  if (t.includes("ret"))    return "RT";
  if (t.includes("dup"))    return "DP";
  return "S"; // simple (default)
}

/** Devuelve el siguiente número de receta y lo deja reservado (atomic). */
export async function nextRecetaNumber(
  id_centro: number,
  tipo_receta: string | null,
  fecha_emision?: string | null, // "YYYY-MM-DD HH:mm:ss" o "YYYY-MM-DD"
) {
  const conn = await pool.getConnection();
  try {
    const date = fecha_emision ? new Date(fecha_emision) : new Date();
    const anio  = date.getFullYear();

    // 1) Reservar número (atomic)
    const [r]: any = await conn.query(`
      INSERT INTO receta_consecutivos (id_centro, tipo_receta, anio, last_val)
      VALUES (?, COALESCE(?, 'simple'), ?, 1)
      ON DUPLICATE KEY UPDATE last_val = LAST_INSERT_ID(last_val + 1)
    `, [id_centro, tipo_receta, anio]);

    // 2) Tomar el valor generado
    const seq: number = r.insertId; // gracias a LAST_INSERT_ID

    // 3) Formateo: RM-<abbr>-<centro>-<año>-<000001>
    const abbr = tipoAbbr(tipo_receta);
    const num  = String(seq).padStart(6, "0");
    const formatted = `RM-${abbr}-${id_centro}-${anio}-${num}`;

    return { numero: formatted, anio, secuencia: seq };
  } finally {
    conn.release();
  }
}

/** Vista previa (NO incrementa), útil para el placeholder. */
export async function previewRecetaNumber(
  id_centro: number,
  tipo_receta: string | null,
  fecha_emision?: string | null,
) {
  const date = fecha_emision ? new Date(fecha_emision) : new Date();
  const anio  = date.getFullYear();
  const [rows]: any = await pool.query(
    `SELECT last_val FROM receta_consecutivos
     WHERE id_centro=? AND tipo_receta=COALESCE(?, 'simple') AND anio=? LIMIT 1`,
    [id_centro, tipo_receta, anio]
  );
  const next = (rows?.[0]?.last_val ?? 0) + 1;
  const abbr = tipoAbbr(tipo_receta);
  const formatted = `RM-${abbr}-${id_centro}-${anio}-${String(next).padStart(6, "0")}`;
  return { numero: formatted, anio, next };
}
