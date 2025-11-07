// frontend/src/app/api/admin/centros/[id]/medicos/route.ts
import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { RowDataPacket } from "mysql2";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    console.log(`👨‍⚕️ GET /api/admin/centros/${params.id}/medicos`);

    const [medicos] = await pool.query<RowDataPacket[]>(
      `SELECT 
        m.id_medico,
        CONCAT(u.nombre, ' ', u.apellido_paterno) as nombre_completo,
        u.email,
        m.numero_colegiatura,
        m.estado,
        e.nombre as especialidad_principal,
        COUNT(DISTINCT hc.id_historial) as total_consultas,
        COUNT(DISTINCT CASE 
          WHEN MONTH(hc.fecha_atencion) = MONTH(CURDATE()) 
          THEN hc.id_historial 
        END) as consultas_mes
      FROM medicos m
      INNER JOIN usuarios u ON m.id_usuario = u.id_usuario
      LEFT JOIN medicos_especialidades me ON m.id_medico = me.id_medico AND me.es_principal = 1
      LEFT JOIN especialidades e ON me.id_especialidad = e.id_especialidad
      LEFT JOIN historial_clinico hc ON m.id_medico = hc.id_medico
      WHERE m.id_centro_principal = ?
      GROUP BY m.id_medico
      ORDER BY m.fecha_creacion DESC`,
      [params.id]
    );

    console.log(`✅ ${medicos.length} médicos encontrados`);

    return NextResponse.json({
      success: true,
      data: medicos,
      total: medicos.length,
    });
  } catch (error: any) {
    console.error(`❌ Error en GET /api/admin/centros/${params.id}/medicos:`, error);
    return NextResponse.json(
      {
        success: false,
        error: "Error al obtener médicos",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
