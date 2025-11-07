import { NextResponse } from "next/server";
import pool from "@/lib/db";
import type { ResultSetHeader } from "mysql2/promise";

export const dynamic = "force-dynamic";

async function getCols(table: string): Promise<Set<string>> {
  const [rows]: any = await pool.query(`SHOW COLUMNS FROM ${table}`);
  return new Set((rows || []).map((r: any) => r.Field));
}

// -------- GET /recetas-medicas/[id]
export async function GET(_req: Request, { params }: { params: { id: string } }) {
  try {
    const id = Number(params.id);
    const [rows]: any = await pool.query(
      `SELECT rm.*,
              p.rut AS paciente_rut,
              CONCAT(p.nombre,' ',p.apellido_paterno,' ',IFNULL(p.apellido_materno,'')) AS paciente_nombre,
              CONCAT(mu.nombre,' ',mu.apellido_paterno,' ',IFNULL(mu.apellido_materno,'')) AS medico_nombre,
              c.nombre AS centro_nombre
       FROM recetas_medicas rm
       JOIN pacientes p ON p.id_paciente = rm.id_paciente
       JOIN medicos md  ON md.id_medico  = rm.id_medico
       JOIN usuarios mu ON mu.id_usuario = md.id_usuario
       JOIN centros_medicos c ON c.id_centro = rm.id_centro
       WHERE rm.id_receta = ?`, [id]
    );
    if (!rows?.length) {
      return NextResponse.json({ success: false, error: "No encontrado" }, { status: 404 });
    }
    const receta = rows[0];

    const [items]: any = await pool.query(
      `SELECT * FROM receta_medicamentos WHERE id_receta = ? ORDER BY id_receta_medicamento ASC`,
      [id]
    );

    return NextResponse.json({ success: true, receta, items });
  } catch (e: any) {
    console.error("GET /recetas-medicas/[id] error:", e);
    return NextResponse.json({ success: false, error: e?.message ?? "Error" }, { status: 500 });
  }
}

// -------- PUT /recetas-medicas/[id]
export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const conn = await pool.getConnection();
  try {
    const id = Number(params.id);
    const body = await req.json();
    const masterCols = await getCols("recetas_medicas");

    const up: string[] = [];
    const vals: any[] = [];
    Object.entries(body).forEach(([k, v]) => {
      if (k === "items" || k === "items_replace" || k === "items_delete") return;
      if (v !== undefined && masterCols.has(k)) {
        up.push(`${k} = ?`);
        vals.push(v);
      }
    });

    await conn.beginTransaction();

    if (up.length) {
      const [res]: any = await conn.query<ResultSetHeader>(
        `UPDATE recetas_medicas SET ${up.join(", ")} WHERE id_receta = ?`,
        [...vals, id]
      );
      if (!res.affectedRows) throw new Error("No se pudo actualizar la receta");
    }

    // Manejo de items:
    // - items_replace = true -> borra todos e inserta nuevos "items"
    // - items (array) -> upsert simple (borra e inserta si así lo pides)
    if (body.items_replace === true) {
      await conn.query(`DELETE FROM receta_medicamentos WHERE id_receta = ?`, [id]);
    }
    if (Array.isArray(body.items)) {
      const sqlItem = `
        INSERT INTO receta_medicamentos
          (id_receta, id_medicamento, nombre_medicamento, dosis, frecuencia, duracion,
           cantidad, unidad, via_administracion, instrucciones, es_controlado,
           codigo_medicamento, dispensado, fecha_dispensacion, dispensado_por, observaciones_dispensacion)
        VALUES
          (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      for (const it of body.items) {
        await conn.query(sqlItem, [
          id,
          it.id_medicamento ?? null,
          it.nombre_medicamento ?? "",
          it.dosis ?? "",
          it.frecuencia ?? "",
          it.duracion ?? null,
          Number.isFinite(Number(it.cantidad)) ? Number(it.cantidad) : 0,
          it.unidad ?? "",
          it.via_administracion ?? "",
          it.instrucciones ?? null,
          it.es_controlado ? 1 : 0,
          it.codigo_medicamento ?? null,
          it.dispensado ? 1 : 0,
          it.fecha_dispensacion ?? null,
          it.dispensado_por ?? null,
          it.observaciones_dispensacion ?? null,
        ]);
      }
    }
    if (Array.isArray(body.items_delete) && body.items_delete.length) {
      await conn.query(
        `DELETE FROM receta_medicamentos WHERE id_receta = ? AND id_receta_medicamento IN (${body.items_delete.map(()=>"?").join(",")})`,
        [id, ...body.items_delete]
      );
    }

    await conn.commit();
    conn.release();
    return NextResponse.json({ success: true });
  } catch (e: any) {
    try { await conn.rollback(); conn.release(); } catch {}
    console.error("PUT /recetas-medicas/[id] error:", e);
    return NextResponse.json({ success: false, error: e?.message ?? "Error" }, { status: 500 });
  }
}

// -------- DELETE /recetas-medicas/[id]
export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  try {
    const id = Number(params.id);
    const [res]: any = await pool.query(`DELETE FROM recetas_medicas WHERE id_receta = ?`, [id]);
    if (!res.affectedRows) {
      return NextResponse.json({ success: false, error: "No encontrado" }, { status: 404 });
    }
    return NextResponse.json({ success: true, deleted: true });
  } catch (e: any) {
    console.error("DELETE /recetas-medicas/[id] error:", e);
    return NextResponse.json({ success: false, error: e?.message ?? "Error" }, { status: 500 });
  }
}
