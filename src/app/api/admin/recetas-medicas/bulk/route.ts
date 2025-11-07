// frontend/src/app/api/admin/recetas-medicas/bulk/route.ts
import { NextResponse } from "next/server";
import pool from "@/lib/db";
import type { ResultSetHeader } from "mysql2/promise";

export const dynamic = "force-dynamic";

async function colExists(table: string, col: string) {
  const [rows]: any = await pool.query(`SHOW COLUMNS FROM ${table} LIKE ?`, [col]);
  return rows?.length > 0;
}

export async function POST(req: Request) {
  const conn = await pool.getConnection();
  try {
    const body = await req.json();
    const action = String(body.action || "").toLowerCase() as
      | "emitir" | "dispensar" | "anular" | "reactivar" | "delete";
    const ids: number[] = Array.isArray(body.ids) ? body.ids.map((x:any)=>Number(x)).filter(Boolean) : [];

    if (!action || !ids.length) {
      return NextResponse.json({ success: false, error: "action e ids requeridos" }, { status: 400 });
    }

    const hasEstado = await colExists("recetas_medicas", "estado");

    await conn.beginTransaction();
    let affected = 0;

    if (action === "emitir" && hasEstado) {
      const [r] = await conn.query<ResultSetHeader>(
        `UPDATE recetas_medicas SET estado='emitida' WHERE id_receta IN (${ids.map(()=>"?").join(",")})`,
        ids
      );
      affected += r.affectedRows;
    } else if (action === "anular" && hasEstado) {
      const [r] = await conn.query<ResultSetHeader>(
        `UPDATE recetas_medicas SET estado='anulada' WHERE id_receta IN (${ids.map(()=>"?").join(",")})`,
        ids
      );
      affected += r.affectedRows;
    } else if (action === "reactivar" && hasEstado) {
      const [r] = await conn.query<ResultSetHeader>(
        `UPDATE recetas_medicas SET estado='emitida' WHERE estado='anulada' AND id_receta IN (${ids.map(()=>"?").join(",")})`,
        ids
      );
      affected += r.affectedRows;
    } else if (action === "dispensar") {
      if (hasEstado) {
        const [r] = await conn.query<ResultSetHeader>(
          `UPDATE recetas_medicas SET estado='dispensada' WHERE id_receta IN (${ids.map(()=>"?").join(",")})`,
          ids
        );
        affected += r.affectedRows;
      }
      await conn.query(
        `UPDATE receta_medicamentos
           SET dispensado=1, fecha_dispensacion=NOW()
         WHERE id_receta IN (${ids.map(()=>"?").join(",")})`,
        ids
      );
    } else if (action === "delete") {
      await conn.query(`DELETE FROM receta_medicamentos WHERE id_receta IN (${ids.map(()=>"?").join(",")})`, ids);
      const [r] = await conn.query<ResultSetHeader>(
        `DELETE FROM recetas_medicas WHERE id_receta IN (${ids.map(()=>"?").join(",")})`,
        ids
      );
      affected += r.affectedRows;
    } else {
      await conn.rollback(); conn.release();
      return NextResponse.json({ success: false, error: "action inválida" }, { status: 400 });
    }

    await conn.commit(); conn.release();
    return NextResponse.json({ success: true, action, affected, ids }, { headers: { "Cache-Control": "no-store" } });
  } catch (e:any) {
    try { await conn.rollback(); } catch {}
    try { conn.release(); } catch {}
    console.error("POST /recetas-medicas/bulk error:", e);
    return NextResponse.json({ success:false, error: e?.message ?? "Error inesperado" }, { status:500 });
  }
}
