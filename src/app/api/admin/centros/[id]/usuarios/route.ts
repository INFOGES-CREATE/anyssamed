// frontend/src/app/api/admin/centros/[id]/usuarios/route.ts
import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { RowDataPacket } from "mysql2";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    console.log(`👥 GET /api/admin/centros/${params.id}/usuarios`);

    const [usuarios] = await pool.query<RowDataPacket[]>(
      `SELECT 
        u.id_usuario,
        u.nombre,
        u.apellido_paterno,
        u.apellido_materno,
        u.email,
        u.telefono,
        u.estado,
        u.fecha_creacion,
        r.nombre as rol,
        CASE
          WHEN EXISTS(SELECT 1 FROM medicos WHERE id_usuario = u.id_usuario) THEN 'medico'
          WHEN EXISTS(SELECT 1 FROM administrativos WHERE id_usuario = u.id_usuario) THEN 'administrativo'
          WHEN EXISTS(SELECT 1 FROM secretarias WHERE id_usuario = u.id_usuario) THEN 'secretaria'
          ELSE 'otro'
        END as tipo_usuario
      FROM usuarios u
      LEFT JOIN usuarios_roles ur ON u.id_usuario = ur.id_usuario AND ur.activo = 1
      LEFT JOIN roles r ON ur.id_rol = r.id_rol
      WHERE u.id_centro_principal = ?
      ORDER BY u.fecha_creacion DESC`,
      [params.id]
    );

    console.log(`✅ ${usuarios.length} usuarios encontrados`);

    return NextResponse.json({
      success: true,
      data: usuarios,
      total: usuarios.length,
    });
  } catch (error: any) {
    console.error(`❌ Error en GET /api/admin/centros/${params.id}/usuarios:`, error);
    return NextResponse.json(
      {
        success: false,
        error: "Error al obtener usuarios",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
