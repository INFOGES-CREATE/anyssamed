// frontend/src/app/api/admin/centros/[id]/activar/route.ts
import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { RowDataPacket, ResultSetHeader } from "mysql2";

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    console.log(`✅ POST /api/admin/centros/${params.id}/activar`);

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

      if (existing[0].estado === "activo") {
        await connection.rollback();
        return NextResponse.json({
          success: true,
          message: "El centro ya está activo",
          data: existing[0],
        });
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

      console.log(`✅ Centro ${params.id} activado:`, existing[0].nombre);

      return NextResponse.json({
        success: true,
        message: "Centro activado exitosamente",
        data: updatedCentro[0],
      });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error: any) {
    console.error(`❌ Error en POST /api/admin/centros/${params.id}/activar:`, error);
    return NextResponse.json(
      {
        success: false,
        error: "Error al activar centro",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
