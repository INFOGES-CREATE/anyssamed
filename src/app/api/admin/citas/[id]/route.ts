import { NextResponse } from "next/server";
import pool from "@/lib/db";

const toBool = (v: any) => (v ? 1 : 0);

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  try {
    const [rows]: any = await pool.query(
      `
      SELECT
        c.*, p.rut AS paciente_rut,
        CONCAT(p.nombre,' ',p.apellido_paterno,' ',IFNULL(p.apellido_materno,'')) AS paciente_nombre,
        CONCAT(u.nombre,' ',u.apellido_paterno) AS medico_nombre
      FROM citas c
        JOIN pacientes p ON p.id_paciente=c.id_paciente
        JOIN medicos m ON m.id_medico=c.id_medico
        JOIN usuarios u ON u.id_usuario=m.id_usuario
      WHERE c.id_cita = ?`,
      [params.id]
    );
    if (!rows?.length)
      return NextResponse.json({ success: false, error: "Cita no encontrada" }, { status: 404 });
    return NextResponse.json({ success: true, cita: rows[0] });
  } catch (e: any) {
    console.error("❌ GET /citas/[id]:", e);
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}

// ===========================================
// PUT: editar, cancelar o reprogramar cita
// ===========================================
export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const id_cita = Number(params.id);
  try {
    const body = await req.json().catch(() => ({}));
    const {
      id_paciente,
      id_medico,
      id_centro,
      id_sucursal = null,
      tipo_cita,
      motivo = null,
      prioridad = "normal",
      id_especialidad = null,
      origen = "web",
      pagada = 0,
      monto = null,
      id_sala = null,
      notas = null,
      fecha_hora_inicio,
      duracion_minutos,
      estado,
      cancelacion_motivo,
      cancelacion_detalle,
      cancelado_por,
      cancelado_por_tipo,
      reprogramar = false,
      nueva_fecha_hora_inicio,
      nueva_duracion_minutos,
      modificado_por,
    } = body;

    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();

      // === 1️⃣ Buscar cita original ===
      const [origRows]: any = await conn.query(`SELECT * FROM citas WHERE id_cita=? FOR UPDATE`, [id_cita]);
      if (!origRows?.length) {
        await conn.rollback(); conn.release();
        return NextResponse.json({ success: false, error: "Cita no existe" }, { status: 404 });
      }
      const orig = origRows[0];

      // === 2️⃣ Cancelación ===
      if (estado === "cancelada") {
        if (!cancelado_por || !cancelado_por_tipo || !cancelacion_motivo) {
          await conn.rollback(); conn.release();
          return NextResponse.json({ success: false, error: "Datos de cancelación incompletos" }, { status: 400 });
        }

        await conn.query(
          `UPDATE citas SET estado='cancelada', fecha_modificacion=NOW(), modificado_por=? WHERE id_cita=?`,
          [modificado_por || cancelado_por, id_cita]
        );

        await conn.query(
          `INSERT INTO cancelaciones 
            (id_cita, fecha_cancelacion, motivo, detalle_motivo, cobro_aplicado, notificada, cancelado_por, cancelado_por_tipo)
           VALUES (?, NOW(), ?, ?, NULL, 0, ?, ?)`,
          [id_cita, cancelacion_motivo, cancelacion_detalle || null, cancelado_por, cancelado_por_tipo]
        );

        await conn.commit(); conn.release();
        return NextResponse.json({ success: true, message: "Cita cancelada" });
      }

      // === 3️⃣ Reprogramación ===
      if (reprogramar) {
        const inicio = new Date(nueva_fecha_hora_inicio || fecha_hora_inicio || orig.fecha_hora_inicio);
        const dur = Number(nueva_duracion_minutos || duracion_minutos || orig.duracion_minutos || 30);
        const fin = new Date(inicio.getTime() + dur * 60000);

        // validar solapamiento
        const [over]: any = await conn.query(
          `SELECT COUNT(1) AS solapes
           FROM citas
           WHERE id_medico=? AND estado IN ('programada','confirmada','en_sala_espera','en_atencion','reprogramada')
             AND (? < fecha_hora_fin) AND (? > fecha_hora_inicio)`,
          [id_medico || orig.id_medico, inicio, fin]
        );
        if (over?.[0]?.solapes > 0) {
          await conn.rollback(); conn.release();
          return NextResponse.json({ success: false, error: "Colisión de horario con otra cita." }, { status: 409 });
        }

        await conn.query(
          `UPDATE citas SET estado='reprogramada', fecha_modificacion=NOW(), modificado_por=? WHERE id_cita=?`,
          [modificado_por || null, id_cita]
        );

        // ✅ INSERT correcto con todas las columnas necesarias
        const [ins]: any = await conn.query(
          `INSERT INTO citas (
            id_paciente, id_medico, id_centro, id_sucursal,
            fecha_hora_inicio, fecha_hora_fin, duracion_minutos,
            tipo_cita, motivo, estado, prioridad, id_especialidad,
            origen, pagada, monto, id_sala, notas, notas_privadas,
            recordatorio_enviado, fecha_recordatorio,
            confirmacion_enviada, fecha_confirmacion,
            confirmado_por_paciente, creado_por, modificado_por, id_cita_anterior
          )
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'programada', ?, ?, ?, ?, ?, ?, ?, NULL, 0, NULL, 0, NULL, 0, ?, ?, ?)`,
          [
            id_paciente || orig.id_paciente,
            id_medico || orig.id_medico,
            id_centro || orig.id_centro,
            id_sucursal ?? orig.id_sucursal,
            inicio,
            fin,
            dur,
            tipo_cita || orig.tipo_cita,
            motivo ?? orig.motivo,
            prioridad || orig.prioridad,
            id_especialidad ?? orig.id_especialidad,
            origen || orig.origen,
            toBool(pagada ?? orig.pagada),
            monto ?? orig.monto,
            id_sala ?? orig.id_sala,
            notas ?? orig.notas,
            modificado_por || null,
            modificado_por || null,
            id_cita,
          ]
        );

        await conn.commit(); conn.release();
        return NextResponse.json({
          success: true,
          message: "Cita reprogramada correctamente",
          nueva_cita_id: ins.insertId,
        });
      }

      // === 4️⃣ Edición normal ===
      const inicio = fecha_hora_inicio ? new Date(fecha_hora_inicio) : new Date(orig.fecha_hora_inicio);
      const dur = Number(duracion_minutos || orig.duracion_minutos || 30);
      const fin = new Date(inicio.getTime() + dur * 60000);

      const checkMed = id_medico || orig.id_medico;
      const [over2]: any = await conn.query(
        `SELECT COUNT(1) AS solapes
         FROM citas
         WHERE id_medico=? AND id_cita <> ? AND estado IN ('programada','confirmada','en_sala_espera','en_atencion','reprogramada')
           AND (? < fecha_hora_fin) AND (? > fecha_hora_inicio)`,
        [checkMed, id_cita, inicio, fin]
      );
      if (over2?.[0]?.solapes > 0) {
        await conn.rollback(); conn.release();
        return NextResponse.json({ success: false, error: "Conflicto de horario." }, { status: 409 });
      }

      await conn.query(
        `UPDATE citas SET
           id_paciente=?, id_medico=?, id_centro=?, id_sucursal=?,
           fecha_hora_inicio=?, fecha_hora_fin=?, duracion_minutos=?,
           tipo_cita=?, motivo=?, estado=?, prioridad=?, id_especialidad=?, origen=?,
           pagada=?, monto=?, id_sala=?, notas=?, modificado_por=?, fecha_modificacion=NOW()
         WHERE id_cita=?`,
        [
          id_paciente || orig.id_paciente,
          id_medico || orig.id_medico,
          id_centro || orig.id_centro,
          id_sucursal ?? orig.id_sucursal,
          inicio,
          fin,
          dur,
          tipo_cita || orig.tipo_cita,
          motivo ?? orig.motivo,
          estado || orig.estado,
          prioridad || orig.prioridad,
          id_especialidad ?? orig.id_especialidad,
          origen || orig.origen,
          toBool(pagada ?? orig.pagada),
          monto ?? orig.monto,
          id_sala ?? orig.id_sala,
          notas ?? orig.notas,
          modificado_por || null,
          id_cita,
        ]
      );

      await conn.commit(); conn.release();
      return NextResponse.json({ success: true, message: "Cita actualizada correctamente" });
    } catch (e: any) {
      await conn.rollback(); conn.release();
      console.error("❌ PUT /citas/[id] TX:", e);
      return NextResponse.json({ success: false, error: e.message }, { status: 500 });
    }
  } catch (error: any) {
    console.error("❌ PUT /citas/[id]:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  try {
    const [res]: any = await pool.query(`DELETE FROM citas WHERE id_cita=?`, [params.id]);
    if (!res.affectedRows)
      return NextResponse.json({ success: false, error: "Cita no encontrada" }, { status: 404 });
    return NextResponse.json({ success: true, message: "Cita eliminada permanentemente" });
  } catch (e: any) {
    console.error("❌ DELETE /citas/[id]:", e);
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}
