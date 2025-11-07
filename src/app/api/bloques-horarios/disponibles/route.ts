import { NextResponse } from "next/server";
import pool from "@/lib/db";

/**
 * ============================================================
 * 🕒 API: Bloques Horarios Disponibles
 * Sistema: MediSuite Pro
 * Versión: 3.5 ULTRA PROFESSIONAL
 * ============================================================
 *
 * Retorna únicamente los bloques de horario DISPONIBLES para un médico
 * en una fecha específica. Se excluyen los bloques:
 *  - no disponibles (estado != 'disponible')
 *  - no visibles en web (visible_web = 0)
 *  - con cupos llenos (cupo_actual >= cupo_maximo)
 *  - ya asignados en la tabla `citas` (estado activo)
 *
 * Parámetros (GET):
 *  - id_medico: número entero obligatorio
 *  - fecha: string (YYYY-MM-DD) obligatorio
 * ============================================================
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id_medico = searchParams.get("id_medico");
    const fecha = searchParams.get("fecha");

    // ============================================================
    // 1️⃣ Validación de parámetros
    // ============================================================
    if (!id_medico || !fecha) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Faltan parámetros requeridos. Debes incluir id_medico y fecha (YYYY-MM-DD).",
        },
        { status: 400 }
      );
    }

    // ============================================================
    // 2️⃣ Consulta SQL mejorada: solo bloques realmente disponibles
    // ============================================================
    const [rows]: any = await pool.query(
      `
      SELECT 
        bh.id_bloque,
        bh.id_medico,
        bh.id_centro,
        bh.id_sucursal,
        bh.fecha_inicio,
        bh.fecha_fin,
        bh.duracion_minutos,
        bh.tipo_atencion,
        bh.cupo_maximo,
        bh.cupo_actual,
        bh.estado,
        bh.visible_web,
        u.nombre AS nombre_medico,
        u.apellido_paterno AS apellido_medico,
        c.nombre AS nombre_centro
      FROM bloques_horarios bh
      INNER JOIN medicos m ON m.id_medico = bh.id_medico
      INNER JOIN usuarios u ON u.id_usuario = m.id_usuario
      INNER JOIN centros_medicos c ON c.id_centro = bh.id_centro
      WHERE 
        bh.id_medico = ?
        AND DATE(bh.fecha_inicio) = DATE(?)
        AND bh.estado = 'disponible'
        AND bh.visible_web = 1
        AND (bh.cupo_maximo IS NULL OR bh.cupo_actual < bh.cupo_maximo)
        AND NOT EXISTS (
          SELECT 1 FROM citas ci
          WHERE ci.id_medico = bh.id_medico
          AND ci.fecha_hora_inicio = bh.fecha_inicio
          AND ci.estado IN ('programada', 'confirmada', 'en_atencion')
        )
      ORDER BY bh.fecha_inicio ASC;
      `,
      [id_medico, fecha]
    );

    // ============================================================
    // 3️⃣ Sin resultados
    // ============================================================
    if (!rows || rows.length === 0) {
      return NextResponse.json({
        success: true,
        bloques: [],
        message: "No hay horarios disponibles para esta fecha.",
      });
    }

    // ============================================================
    // 4️⃣ Mapeo estructurado para el frontend
    // ============================================================
    const bloques = rows.map((b: any) => ({
      id_bloque: b.id_bloque,
      id_medico: b.id_medico,
      medico: `${b.nombre_medico} ${b.apellido_medico}`,
      centro: b.nombre_centro,
      inicio: b.fecha_inicio,
      fin: b.fecha_fin,
      duracion_minutos: b.duracion_minutos,
      tipo_atencion: b.tipo_atencion,
      cupos: {
        maximo: b.cupo_maximo,
        actual: b.cupo_actual,
        disponible:
          b.cupo_maximo && b.cupo_actual !== null
            ? Math.max(b.cupo_maximo - b.cupo_actual, 0)
            : null,
      },
    }));

    // ============================================================
    // 5️⃣ Retorno final
    // ============================================================
    return NextResponse.json({
      success: true,
      total_disponibles: bloques.length,
      bloques,
    });
  } catch (err: any) {
    console.error("❌ Error en /api/bloques/disponibles:", err);
    return NextResponse.json(
      {
        success: false,
        message:
          "Error al obtener los horarios disponibles. Intenta nuevamente.",
        error: err.message,
      },
      { status: 500 }
    );
  }
}
