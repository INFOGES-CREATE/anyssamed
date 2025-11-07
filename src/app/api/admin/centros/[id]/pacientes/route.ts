// frontend/src/app/api/admin/centros/[id]/pacientes/route.ts
import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { RowDataPacket } from "mysql2";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    console.log(`🧑‍⚕️ GET /api/admin/centros/${params.id}/pacientes`);

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = (page - 1) * limit;

    const [pacientes] = await pool.query<RowDataPacket[]>(
      `SELECT 
        p.id_paciente,
        p.nombre,
        p.apellido_paterno,
        p.apellido_materno,
        p.rut,
        p.email,
        p.telefono,
        p.fecha_nacimiento,
        p.estado,
        p.fecha_registro,
        COUNT(DISTINCT hc.id_historial) as total_consultas,
        MAX(hc.fecha_atencion) as ultima_consulta
      FROM pacientes p
      LEFT JOIN historial_clinico hc ON p.id_paciente = hc.id_paciente
      WHERE p.id_centro_registro = ?
      GROUP BY p.id_paciente
      ORDER BY p.fecha_registro DESC
      LIMIT ? OFFSET ?`,
      [params.id, limit, offset]
    );

    const [countResult] = await pool.query<RowDataPacket[]>(
      "SELECT COUNT(*) as total FROM pacientes WHERE id_centro_registro = ?",
      [params.id]
    );

    const total = countResult[0]?.total || 0;

    console.log(`✅ ${pacientes.length} pacientes encontrados`);

    return NextResponse.json({
      success: true,
      data: pacientes,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error(`❌ Error en GET /api/admin/centros/${params.id}/pacientes:`, error);
    return NextResponse.json(
      {
        success: false,
        error: "Error al obtener pacientes",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
