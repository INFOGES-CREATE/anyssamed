// frontend/src/app/api/admin/centros/[id]/restaurar/route.ts
import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { RowDataPacket, ResultSetHeader } from "mysql2";

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    console.log(`🔄 POST /api/admin/centros/${params.id}/restaurar`);

    const connection = await pool.getConnection();

    try {
      await connection.beginTransaction();

      const [existing] = await connection.query<RowDataPacket[]>(
        "SELECT id_centro, nombre, estado FROM centros_medicos WHERE id_centro = ?",
        [params.id]
      );

      if (existing.length === 0) {
        await connection.rollback();
        return NextResponse.json(
          { success: false, error: "Centro no encontrado" },
          { status: 404 }
        );
      }

      if (existing[0].estado !== "suspendido" && existing[0].estado !== "inactivo") {
        await connection.rollback();
        return NextResponse.json({
          success: false,
          error: "Solo se pueden restaurar centros suspendidos o inactivos",
          estado_actual: existing[0].estado,
        }, { status: 400 });
      }

      await connection.query<ResultSetHeader>(
        "UPDATE centros_medicos SET estado = 'activo', fecha_modificacion = NOW() WHERE id_centro = ?",
        [params.id]
      );

      const [updatedCentro] = await connection.query<RowDataPacket[]>(
        "SELECT * FROM centros_medicos WHERE id_centro = ?",
        [params.id]
      );

      await connection.commit();

      console.log(`✅ Centro ${params.id} restaurado:`, existing[0].nombre);

      return NextResponse.json({
        success: true,
        message: "Centro restaurado exitosamente",
        data: updatedCentro[0],
      });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error: any) {
    console.error(`❌ Error en POST /api/admin/centros/${params.id}/restaurar:`, error);
    return NextResponse.json(
      {
        success: false,
        error: "Error al restaurar centro",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
