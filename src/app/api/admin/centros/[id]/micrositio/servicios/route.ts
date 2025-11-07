// frontend/src/app/api/admin/centros/[id]/servicios/route.ts
import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { RowDataPacket, ResultSetHeader } from "mysql2";

// GET - Obtener todos los servicios del centro
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    console.log(`📡 Obteniendo servicios del centro ID: ${params.id}`);

    const [servicios] = await pool.query<RowDataPacket[]>(`
      SELECT 
        id_servicio,
        id_centro,
        nombre_servicio,
        descripcion_servicio,
        activo,
        prioridad,
        fecha_creacion
      FROM servicios_centros
      WHERE id_centro = ?
      ORDER BY prioridad DESC, nombre_servicio ASC
    `, [params.id]);

    return NextResponse.json({
      success: true,
      data: servicios,
    });
  } catch (error: any) {
    console.error(`❌ Error en GET /api/admin/centros/${params.id}/servicios:`, error);
    return NextResponse.json(
      {
        success: false,
        error: "Error al obtener servicios",
        details: error.message,
      },
      { status: 500 }
    );
  }
}

// POST - Crear nuevo servicio
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    console.log(`📝 Creando nuevo servicio para centro ID: ${params.id}`);

    const body = await request.json();
    const { nombre_servicio, descripcion_servicio, activo, prioridad } = body;

    // Validaciones
    if (!nombre_servicio || !descripcion_servicio) {
      return NextResponse.json(
        { success: false, error: "Nombre y descripción son requeridos" },
        { status: 400 }
      );
    }

    const [result] = await pool.query<ResultSetHeader>(`
      INSERT INTO servicios_centros 
        (id_centro, nombre_servicio, descripcion_servicio, activo, prioridad)
      VALUES (?, ?, ?, ?, ?)
    `, [
      params.id,
      nombre_servicio,
      descripcion_servicio,
      activo ? 1 : 0,
      prioridad || 0,
    ]);

    return NextResponse.json({
      success: true,
      message: "Servicio creado exitosamente",
      data: { id_servicio: result.insertId },
    });
  } catch (error: any) {
    console.error(`❌ Error en POST /api/admin/centros/${params.id}/servicios:`, error);
    return NextResponse.json(
      {
        success: false,
        error: "Error al crear servicio",
        details: error.message,
      },
      { status: 500 }
    );
  }
}