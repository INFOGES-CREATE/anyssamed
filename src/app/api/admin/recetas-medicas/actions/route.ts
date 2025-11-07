import { NextResponse } from "next/server";
import pool from "@/lib/db";
import type { ResultSetHeader } from "mysql2/promise";

export const dynamic = "force-dynamic";

async function tableExists(name: string) {
  const [rows]: any = await pool.query(`SHOW TABLES LIKE ?`, [name]);
  return rows?.length > 0;
}
async function colExists(table: string, col: string) {
  const [rows]: any = await pool.query(`SHOW COLUMNS FROM ${table} LIKE ?`, [col]);
  return rows?.length > 0;
}
async function getCols(table: string): Promise<Set<string>> {
  const [rows]: any = await pool.query(`SHOW COLUMNS FROM ${table}`);
  return new Set((rows || []).map((r: any) => r.Field));
}

async function loadRecetaCompleta(id_receta: number) {
  const [r]: any = await pool.query(
    `SELECT rm.*, p.id_paciente, p.rut, p.nombre, p.apellido_paterno, p.apellido_materno
       , c.id_centro, c.nombre as centro_nombre
    FROM recetas_medicas rm
    JOIN pacientes p ON p.id_paciente = rm.id_paciente
    JOIN centros_medicos c ON c.id_centro = rm.id_centro
    WHERE rm.id_receta = ?`, [id_receta]
  );
  if (!r?.length) throw new Error("Receta no encontrada");
  const receta = r[0];
  const [items]: any = await pool.query(
    `SELECT * FROM receta_medicamentos WHERE id_receta = ? ORDER BY id_receta_medicamento`, [id_receta]
  );
  return { receta, items };
}

export async function POST(req: Request) {
  const conn = await pool.getConnection();
  try {
    const body = await req.json();
    const accion = String(body.accion || "").trim(); // validar|stock|dispensar|anular|reemitir|bitacora
    const id_receta = Number(body.id_receta || 0);
    if (!accion) return NextResponse.json({ success: false, error: "Falta 'accion'" }, { status: 400 });
    if (!["validar","stock","dispensar","anular","reemitir","bitacora"].includes(accion))
      return NextResponse.json({ success: false, error: "Acción no soportada" }, { status: 400 });

    // Cargamos receta + items (reutilizado por varias acciones)
    const needLoad = accion !== "bitacora"; // bitácora puede no requerir carga completa
    const data = needLoad ? await loadRecetaCompleta(id_receta) : null;

    /* ---------------- VALIDAR: alergias, duplicados, interacciones básicas, controlados sin firma ---------------- */
    if (accion === "validar") {
      const { receta, items } = data!;
      const issues: { tipo: "warning"|"error"; codigo: string; detalle: string }[] = [];

      // Alergias del paciente
      if (await tableExists("alergias_pacientes")) {
        // tratamos de detectar columnas comunes
        const apCols = await getCols("alergias_pacientes");
        const campoTexto = apCols.has("sustancia") ? "sustancia"
                          : apCols.has("alergeno") ? "alergeno"
                          : apCols.has("medicamento") ? "medicamento" : null;
        if (campoTexto) {
          const [als]: any = await pool.query(
            `SELECT ${campoTexto} AS txt FROM alergias_pacientes WHERE id_paciente = ?`, [receta.id_paciente]
          );
          const alergias = (als||[]).map((a:any)=>String(a.txt||"").toLowerCase()).filter(Boolean);
          if (alergias.length) {
            items.forEach((it:any)=>{
              const nom = String(it.nombre_medicamento||"").toLowerCase();
              if (alergias.some((a:string)=> nom.includes(a)))
                issues.push({ tipo:"error", codigo:"ALERGIA_MATCH", detalle:`'${it.nombre_medicamento}' coincide con alergias del paciente` });
            });
          }
        }
      }

      // Duplicados por nombre + dosis
      const map = new Map<string, number>();
      items.forEach((it:any)=>{
        const key = `${(it.nombre_medicamento||"").toLowerCase()}|${(it.dosis||"").toLowerCase()}`;
        map.set(key, (map.get(key)||0)+1);
      });
      [...map.entries()].forEach(([k,v])=>{ if (v>1) issues.push({tipo:"warning", codigo:"DUPLICADOS", detalle:`${k.replace("|"," · ")} repetido ${v} veces`}); });

      // Interacciones simples si hay tabla 'interacciones' o 'ia_interacciones_medicamentosas'
      const nombres = items.map((it:any)=>String(it.nombre_medicamento||"").trim()).filter(Boolean);
      if (nombres.length && await tableExists("interacciones")) {
        for (let i=0;i<nombres.length;i++){
          for (let j=i+1;j<nombres.length;j++){
            const [rows]: any = await pool.query(
              `SELECT severidad, descripcion FROM interacciones 
               WHERE (med1 = ? AND med2 = ?) OR (med1 = ? AND med2 = ?) LIMIT 1`,
               [nombres[i], nombres[j], nombres[j], nombres[i]]
            );
            if (rows?.length) {
              const sev = String(rows[0].severidad||"").toLowerCase();
              issues.push({
                tipo: (sev==="alta"||sev==="grave") ? "error" : "warning",
                codigo: "INTERACCION",
                detalle: `Posible interacción: ${nombres[i]} ↔ ${nombres[j]} (${sev})`
              });
            }
          }
        }
      }

      // Controlados sin firma (si existe columna)
      if (await colExists("recetas_medicas","firmada") && items.some((x:any)=>x.es_controlado==1) && !receta.firmada) {
        issues.push({ tipo:"warning", codigo:"CONTROLADO_SIN_FIRMA", detalle:"Tiene medicamentos controlados y la receta no está firmada electrónicamente" });
      }

      // Stock preliminar (si quieres validación rápida)
      let stockOk = true;
      if (await tableExists("farmacia_inventario") && await colExists("farmacia_inventario","stock_disponible")) {
        for (const it of items) {
          if (!it.id_medicamento) continue;
          const [s]: any = await pool.query(
            `SELECT stock_disponible FROM farmacia_inventario WHERE id_medicamento = ? LIMIT 1`, [it.id_medicamento]
          );
          const disp = Number(s?.[0]?.stock_disponible ?? 0);
          if (disp < Number(it.cantidad||0)) {
            stockOk = false;
            issues.push({ tipo:"warning", codigo:"STOCK_BAJO", detalle:`Stock insuficiente para '${it.nombre_medicamento}' (${disp} < ${it.cantidad})` });
          }
        }
      }

      return NextResponse.json({ success:true, issues, stockOk });
    }

    /* ---------------- STOCK: detalle de disponibilidad ---------------- */
    if (accion === "stock") {
      const { items } = data!;
      const detalle: any[] = [];
      if (await tableExists("farmacia_inventario")) {
        for (const it of items) {
          let disp = null;
          if (it.id_medicamento) {
            const [s]: any = await pool.query(
              `SELECT stock_disponible FROM farmacia_inventario WHERE id_medicamento = ? LIMIT 1`,
              [it.id_medicamento]
            );
            disp = Number(s?.[0]?.stock_disponible ?? 0);
          }
          detalle.push({
            id_receta_medicamento: it.id_receta_medicamento,
            id_medicamento: it.id_medicamento ?? null,
            nombre: it.nombre_medicamento,
            cantidad: Number(it.cantidad||0),
            disponible: disp
          });
        }
      }
      return NextResponse.json({ success:true, detalle });
    }

    /* ---------------- DISPENSAR: total o parcial ---------------- */
    if (accion === "dispensar") {
      const ids: number[] = Array.isArray(body.ids_items) ? body.ids_items : []; // si vacío => todos
      const idUsuario = Number(body.id_usuario || 0) || null;

      await conn.beginTransaction();

      // Marca items
      const whereItems = ids.length
        ? `id_receta = ? AND id_receta_medicamento IN (${ids.map(()=>"?").join(",")})`
        : `id_receta = ? AND dispensado = 0`;
      const params = ids.length ? [id_receta, ...ids] : [id_receta];
      await conn.query(
        `UPDATE receta_medicamentos
           SET dispensado = 1, fecha_dispensacion = NOW(), dispensado_por = ?
         WHERE ${whereItems}`, [idUsuario, ...params]
      );

      // Recalcula estado
      const [c]: any = await conn.query(
        `SELECT SUM(CASE WHEN dispensado=1 THEN 1 ELSE 0 END) disp, COUNT(*) tot
           FROM receta_medicamentos WHERE id_receta = ?`, [id_receta]
      );
      const disp = Number(c?.[0]?.disp||0), tot = Number(c?.[0]?.tot||0);
      const estado = (disp >= tot && tot>0) ? "dispensada" : "parcial";
      if (await colExists("recetas_medicas","estado")) {
        await conn.query(`UPDATE recetas_medicas SET estado = ? WHERE id_receta = ?`, [estado, id_receta]);
      }

      await conn.commit();
      conn.release();
      return NextResponse.json({ success:true, estado });
    }

    /* ---------------- ANULAR ---------------- */
    if (accion === "anular") {
      const motivo = String(body.motivo || "Anulación administrativamente registrada");
      await conn.beginTransaction();
      if (await colExists("recetas_medicas","estado")) {
        await conn.query(`UPDATE recetas_medicas SET estado='anulada' WHERE id_receta = ?`, [id_receta]);
      }
      if (await tableExists("auditoria_cambios")) {
        await conn.query(
          `INSERT INTO auditoria_cambios (tabla, id_registro, accion, descripcion, fecha_cambio)
           VALUES ('recetas_medicas', ?, 'ANULAR', ?, NOW())`, [id_receta, motivo]
        );
      }
      await conn.commit();
      conn.release();
      return NextResponse.json({ success:true, anulada:true });
    }

    /* ---------------- REEMITIR: clonar (opcional solo no dispensados) ---------------- */
    if (accion === "reemitir") {
      const soloPendientes = body.solo_pendientes === false ? false : true; // por defecto true
      const masterCols = await getCols("recetas_medicas");
      const { receta, items } = data!;

      const camposCopia: Record<string, any> = {
        id_centro: receta.id_centro,
        id_paciente: receta.id_paciente,
        id_medico: receta.id_medico,
        fecha_emision: new Date(),
        numero_receta: null,
        tipo_receta: receta.tipo_receta ?? null,
        titulo: receta.titulo ?? null,
        estado: masterCols.has("estado") ? "emitida" : undefined,
        id_historial: receta.id_historial ?? null
      };

      const cols: string[] = [], vals: any[] = [];
      Object.entries(camposCopia).forEach(([k,v])=>{
        if (v !== undefined && masterCols.has(k)) { cols.push(k); vals.push(v); }
      });

      await conn.beginTransaction();
      const [ins]: any = await conn.query<ResultSetHeader>(
        `INSERT INTO recetas_medicas (${cols.join(",")}) VALUES (${cols.map(()=>"?").join(",")})`, vals
      );
      const idNuevo = ins.insertId;

      const aClonar = soloPendientes ? items.filter((x:any)=>!x.dispensado) : items;
      for (const it of aClonar) {
        await conn.query(
          `INSERT INTO receta_medicamentos
            (id_receta, id_medicamento, nombre_medicamento, dosis, frecuencia, duracion, cantidad, unidad, via_administracion, instrucciones, es_controlado, codigo_medicamento, dispensado)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0)`,
          [idNuevo, it.id_medicamento ?? null, it.nombre_medicamento ?? "", it.dosis ?? "", it.frecuencia ?? "",
           it.duracion ?? null, it.cantidad ?? 0, it.unidad ?? "", it.via_administracion ?? "", it.instrucciones ?? null,
           it.es_controlado ? 1 : 0, it.codigo_medicamento ?? null]
        );
      }

      await conn.commit();
      conn.release();
      return NextResponse.json({ success:true, id_receta_nueva: idNuevo, items: aClonar.length });
    }

    /* ---------------- BITÁCORA ---------------- */
    if (accion === "bitacora") {
      const out:any = { success:true, logs: [] as any[] };
      if (await tableExists("auditoria_cambios")) {
        const [logs]: any = await pool.query(
          `SELECT * FROM auditoria_cambios 
            WHERE tabla='recetas_medicas' AND id_registro = ?
            ORDER BY fecha_cambio DESC LIMIT 200`, [id_receta]
        );
        out.logs = logs || [];
      }
      return NextResponse.json(out);
    }

    return NextResponse.json({ success:false, error:"Acción no manejada" }, { status: 400 });
  } catch (e:any) {
    try { await (pool as any).release?.() } catch {}
    try { await (pool as any).rollback?.() } catch {}
    console.error("POST /recetas-medicas/actions error:", e);
    return NextResponse.json({ success:false, error:e?.message ?? "Error" }, { status: 500 });
  }
}
