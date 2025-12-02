// frontend/src/app/api/admin/centros/[id]/medicos/route.ts
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { RowDataPacket } from "mysql2";

// ============================================================
// GET - MÉDICOS/PROFESIONALES ASOCIADOS A UN CENTRO
// ============================================================
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    console.log(`🩺 GET /api/admin/centros/${params.id}/medicos`);

    const idCentro = parseInt(params.id, 10);
    if (isNaN(idCentro)) {
      return NextResponse.json(
        { success: false, error: "ID de centro inválido" },
        { status: 400 }
      );
    }

    // =============== VALIDAR QUE EL CENTRO EXISTA ==================
    const [centro] = await pool.query<RowDataPacket[]>(
      `SELECT id_centro, nombre 
       FROM centros_medicos 
       WHERE id_centro = ?`,
      [idCentro]
    );

    if (centro.length === 0) {
      return NextResponse.json(
        { success: false, error: "Centro médico no encontrado" },
        { status: 404 }
      );
    }

    console.log("🏥 Centro localizado:", centro[0].nombre);

    // =============== CARGAR PROFESIONALES ==================
    //
    // ⚠️ Importante:
    // Ya no existen:
    //   - id_especialidad_principal
    //   - especialidad_principal
    //   - numero_registro_medico
    //
    // Ahora usamos:
    //   - numero_registro_profesional
    //   - profesionales_especialidades → es_principal = 1
    //
    // ========================================================

    const [medicos] = await pool.query<RowDataPacket[]>(
      `
      SELECT
        m.id_profesional,
        m.id_usuario,

        m.id_centro,
        m.id_sucursal,
        m.id_centro_principal,

        m.tipo_profesional,
        m.numero_registro_profesional,
        m.titulo_profesional,
        m.universidad,
        m.ano_graduacion,
        m.anos_experiencia,
        m.biografia,

        m.acepta_nuevos_pacientes,
        m.atiende_particular,
        m.atiende_fonasa,
        m.atiende_isapre,
        m.consulta_presencial,
        m.consulta_telemedicina,
        m.duracion_consulta_min,

        m.firma_digital,
        m.firma_digital_url,
        m.verificado_por_admin,
        m.requiere_revision_credenciales,

        m.estado,
        m.calificacion_promedio,
        m.numero_opiniones,
        m.fecha_inicio_actividad,
        m.fecha_creacion,
        m.fecha_modificacion,

        -- Datos del usuario asociado
        CONCAT(u.nombre, ' ', u.apellido_paterno, ' ', IFNULL(u.apellido_materno,'')) AS nombre_completo,
        u.email,
        u.telefono,
        u.foto_perfil_url,

        -- Especialidad principal REAL
        esp.id_especialidad AS especialidad_id,
        esp.nombre AS especialidad_nombre,
        esp.codigo AS especialidad_codigo,

        -- Estadísticas clínicas
        (
          SELECT COUNT(*) 
          FROM historial_clinico hc
          WHERE hc.id_profesional = m.id_profesional
        ) AS total_consultas,

        (
          SELECT COUNT(*) 
          FROM historial_clinico hc
          WHERE hc.id_profesional = m.id_profesional
            AND MONTH(hc.fecha_atencion) = MONTH(CURDATE())
            AND YEAR(hc.fecha_atencion) = YEAR(CURDATE())
        ) AS consultas_mes,

        (
          SELECT COUNT(DISTINCT hc.id_paciente)
          FROM historial_clinico hc
          WHERE hc.id_profesional = m.id_profesional
        ) AS pacientes_atendidos

      FROM profesionales_salud m
      LEFT JOIN usuarios u 
        ON u.id_usuario = m.id_usuario

      -- Especialidad principal desde la tabla nueva
      LEFT JOIN profesionales_especialidades pe
        ON pe.id_profesional = m.id_profesional AND pe.es_principal = 1

      LEFT JOIN especialidades esp
        ON esp.id_especialidad = pe.id_especialidad

      WHERE m.tipo_profesional = 'medico'
        AND (m.id_centro = ? OR m.id_centro_principal = ?)

      ORDER BY m.calificacion_promedio DESC, m.anos_experiencia DESC
      `,
      [idCentro, idCentro]
    );

    console.log(`✅ ${medicos.length} médicos encontrados.`);

    return NextResponse.json({
      success: true,
      centro: centro[0],
      total: medicos.length,
      data: medicos,
    });
  } catch (error: any) {
    console.error(
      `❌ Error en GET /api/admin/centros/${params.id}/medicos:`,
      error
    );
    return NextResponse.json(
      {
        success: false,
        error: "Error al obtener médicos del centro",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
