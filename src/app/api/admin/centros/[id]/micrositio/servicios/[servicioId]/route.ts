// frontend/src/app/api/admin/centros/[id]/servicios/[servicioId]/route.ts
import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { RowDataPacket, ResultSetHeader } from "mysql2";

// GET - Obtener un servicio específico
export async function GET(
  request: Request,
  { params }: { params: { id: string; servicioId: string } }
) {
  try {
    console.log(`📡 Obteniendo servicio ID: ${params.servicioId} del centro ID: ${params.id}`);

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
      WHERE id_servicio = ? AND id_centro = ?
      LIMIT 1
    `, [params.servicioId, params.id]);

    if (!servicios || servicios.length === 0) {
      return NextResponse.json(
        { success: false, error: "Servicio no encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: servicios[0],
    });
  } catch (error: any) {
    console.error(`❌ Error en GET servicio:`, error);
    return NextResponse.json(
      {
        success: false,
        error: "Error al obtener servicio",
        details: error.message,
      },
      { status: 500 }
    );
  }
}

// PUT - Actualizar servicio
export async function PUT(
  request: Request,
  { params }: { params: { id: string; servicioId: string } }
) {
  try {
    console.log(`📝 Actualizando servicio ID: ${params.servicioId} del centro ID: ${params.id}`);

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
      UPDATE servicios_centros
      SET 
        nombre_servicio = ?,
        descripcion_servicio = ?,
        activo = ?,
        prioridad = ?
      WHERE id_servicio = ? AND id_centro = ?
    `, [
      nombre_servicio,
      descripcion_servicio,
      activo ? 1 : 0,
      prioridad || 0,
      params.servicioId,
      params.id,
    ]);

    if (result.affectedRows === 0) {
      return NextResponse.json(
        { success: false, error: "Servicio no encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Servicio actualizado exitosamente",
    });
  } catch (error: any) {
    console.error(`❌ Error en PUT servicio:`, error);
    return NextResponse.json(
      {
        success: false,
        error: "Error al actualizar servicio",
        details: error.message,
      },
      { status: 500 }
    );
  }
}

// DELETE - Eliminar servicio
export async function DELETE(
  request: Request,
  { params }: { params: { id: string; servicioId: string } }
) {
  try {
    console.log(`🗑️ Eliminando servicio ID: ${params.servicioId} del centro ID: ${params.id}`);

    const [result] = await pool.query<ResultSetHeader>(`
      DELETE FROM servicios_centros
      WHERE id_servicio = ? AND id_centro = ?
    `, [params.servicioId, params.id]);

    if (result.affectedRows === 0) {
      return NextResponse.json(
        { success: false, error: "Servicio no encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Servicio eliminado exitosamente",
    });
  } catch (error: any) {
    console.error(`❌ Error en DELETE servicio:`, error);
    return NextResponse.json(
      {
        success: false,
        error: "Error al eliminar servicio",
        details: error.message,
      },
      { status: 500 }
    );
  }
}