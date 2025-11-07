// frontend/src/app/api/admin/historial-clinico/[id]/route.ts
import { NextResponse } from "next/server";
import pool from "@/lib/db";
import type { RowDataPacket, ResultSetHeader } from "mysql2/promise";

export const dynamic = "force-dynamic";

// ===== Helpers =====
const toId = (v: any) => Number.isFinite(Number(v)) ? Number(v) : NaN;
const is01 = (v: any) => (v === 1 || v === "1" || v === true) ? 1 : 0;

/**
 * GET /api/admin/historial-clinico/[id]
 * Devuelve el registro con alias compatibles con la UI premium.
 */
export async function GET(_req: Request, { params }: { params: { id: string } }) {
  try {
    const id = toId(params.id);
    if (!Number.isFinite(id)) {
      return NextResponse.json({ success: false, error: "ID inválido" }, { status: 400 });
    }

    const sql = `
      SELECT
        -- Base
        hc.id_historial, hc.id_paciente, hc.id_medico, hc.id_centro, hc.id_especialidad, hc.id_sucursal,
        hc.fecha_atencion,
        hc.motivo_consulta,
        hc.anamnesis,
        hc.examen_fisico,
        hc.diagnostico_principal,
        hc.codigo_cie10,
        hc.plan_tratamiento,
        hc.observaciones,
        hc.estado_registro,
        hc.tipo_atencion,
        hc.duracion_minutos,
        hc.es_ges,
        hc.es_cronica,
        hc.proximo_control,
        hc.id_cita,

        -- Alias amigables para la UI
        hc.motivo_consulta               AS titulo,
        hc.tipo_atencion                 AS tipo_documento,
        hc.anamnesis                     AS resumen,
        hc.diagnostico_principal         AS diagnostico,
        hc.examen_fisico                 AS procedimientos,
        hc.plan_tratamiento              AS indicaciones,
        CASE WHEN hc.estado_registro = 'firmado' THEN 1 ELSE 0 END AS firmado,
        hc.estado_registro               AS estado,

        -- Enriquecidos
        p.rut AS paciente_rut,
        CONCAT(p.nombre,' ',p.apellido_paterno,' ',IFNULL(p.apellido_materno,'')) AS paciente_nombre,

        CONCAT(mu.nombre,' ',mu.apellido_paterno,' ',IFNULL(mu.apellido_materno,'')) AS medico_nombre,
        e.nombre AS especialidad_nombre,
        c.nombre AS centro_nombre,
        s.nombre AS sucursal_nombre
      FROM historial_clinico hc
      JOIN pacientes p ON p.id_paciente = hc.id_paciente
      JOIN medicos m   ON m.id_medico   = hc.id_medico
      JOIN usuarios mu ON mu.id_usuario = m.id_usuario
      JOIN centros_medicos c ON c.id_centro = hc.id_centro
      LEFT JOIN especialidades e ON e.id_especialidad = hc.id_especialidad
      LEFT JOIN sucursales s     ON s.id_sucursal     = hc.id_sucursal
      WHERE hc.id_historial = ?
      LIMIT 1
    `;

    const [rows] = await pool.query<RowDataPacket[]>(sql, [id]);
    if (!rows.length) {
      return NextResponse.json({ success: false, error: "Registro no encontrado" }, { status: 404 });
    }

    return NextResponse.json({ success: true, historial: rows[0] });
  } catch (err: any) {
    console.error("GET /historial-clinico/[id] error:", err);
    return NextResponse.json({ success: false, error: err?.message ?? "Error inesperado" }, { status: 500 });
  }
}

/**
 * PUT /api/admin/historial-clinico/[id]
 * Actualización parcial con mapeo UI → BD y saneo de booleanos.
 */
export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const id = toId(params.id);
    if (!Number.isFinite(id)) {
      return NextResponse.json({ success: false, error: "ID inválido" }, { status: 400 });
    }

    const body = await req.json();

    // --------- Mapeo desde la UI a columnas reales ---------
    // Soporta tanto nombres "bonitos" (titulo, tipo_documento, etc.)
    // como los nombres de la tabla (motivo_consulta, tipo_atencion, etc.)
    const mapped: Record<string, any> = {
      // Identificadores / FK
      id_ficha:           body.id_ficha,
      id_paciente:        body.id_paciente,
      fecha_atencion:     body.fecha_atencion,
      id_medico:          body.id_medico,
      id_especialidad:    body.id_especialidad,
      id_centro:          body.id_centro,
      id_sucursal:        body.id_sucursal,

      // Clínicos
      motivo_consulta:        body.motivo_consulta ?? body.titulo,
      anamnesis:              body.anamnesis ?? body.resumen,
      examen_fisico:          body.examen_fisico ?? body.procedimientos,
      diagnostico_principal:  body.diagnostico_principal ?? body.diagnostico,
      codigo_cie10:           body.codigo_cie10,
      plan_tratamiento:       body.plan_tratamiento ?? body.indicaciones,
      observaciones:          body.observaciones,

      // Estado / tipo (acepta 'estado' y 'firmado')
      estado_registro: body.estado_registro ?? body.estado,
      tipo_atencion:   body.tipo_atencion ?? body.tipo_documento,

      // Otros
      duracion_minutos: body.duracion_minutos,
      es_ges:           (body.es_ges !== undefined ? is01(body.es_ges) : undefined),
      es_cronica:       (body.es_cronica !== undefined ? is01(body.es_cronica) : undefined),
      proximo_control:  body.proximo_control,
      id_cita:          body.id_cita,
    };

    // Si viene 'firmado' explícito, lo traducimos a estado_registro
    if (body.firmado !== undefined && mapped.estado_registro === undefined) {
      mapped.estado_registro = is01(body.firmado) ? "firmado" : "borrador";
    }

    // --------- Lista blanca de columnas actualizables ---------
    const allowed = [
      "id_ficha","id_paciente","fecha_atencion","id_medico","id_especialidad","id_centro","id_sucursal",
      "motivo_consulta","anamnesis","examen_fisico","diagnostico_principal","codigo_cie10","plan_tratamiento",
      "observaciones","estado_registro","tipo_atencion","duracion_minutos","es_ges","es_cronica","proximo_control","id_cita"
    ] as const;

    const sets: string[] = [];
    const values: any[] = [];

    for (const col of allowed) {
      if (Object.prototype.hasOwnProperty.call(mapped, col) && mapped[col] !== undefined) {
        sets.push(`${col} = ?`);
        values.push(mapped[col]);
      }
    }

    if (sets.length === 0) {
      return NextResponse.json({ success: false, error: "Nada para actualizar" }, { status: 400 });
    }

    const sql = `
      UPDATE historial_clinico
      SET ${sets.join(", ")}
      WHERE id_historial = ?
    `;
    values.push(id);

    const [res] = await pool.query<ResultSetHeader>(sql, values);
    return NextResponse.json({ success: true, affectedRows: (res as ResultSetHeader).affectedRows });
  } catch (err: any) {
    console.error("PUT /historial-clinico/[id] error:", err);
    return NextResponse.json({ success: false, error: err?.message ?? "Error inesperado" }, { status: 500 });
  }
}

/**
 * DELETE /api/admin/historial-clinico/[id]
 */
export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  try {
    const id = toId(params.id);
    if (!Number.isFinite(id)) {
      return NextResponse.json({ success: false, error: "ID inválido" }, { status: 400 });
    }

    const [res] = await pool.query<ResultSetHeader>(
      `DELETE FROM historial_clinico WHERE id_historial = ?`,
      [id]
    );
    if (!(res as ResultSetHeader).affectedRows) {
      return NextResponse.json({ success: false, error: "Registro no encontrado" }, { status: 404 });
    }
    return NextResponse.json({ success: true, deleted: true });
  } catch (err: any) {
    console.error("DELETE /historial-clinico/[id] error:", err);
    return NextResponse.json({ success: false, error: err?.message ?? "Error inesperado" }, { status: 500 });
  }
}
