// frontend/src/app/api/admin/centros/[id]/suspender/route.ts
import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { RowDataPacket, ResultSetHeader } from "mysql2";

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { motivo } = body;

    console.log(`⚠️ POST /api/admin/centros/${params.id}/suspender - Motivo:`, motivo);

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

      if (existing[0].estado === "suspendido") {
        await connection.rollback();
        return NextResponse.json({
          success: true,
          message: "El centro ya está suspendido",
          data: existing[0],
        });
      }

      await connection.query<ResultSetHeader>(
        "UPDATE centros_medicos SET estado = 'suspendido', fecha_modificacion = NOW() WHERE id_centro = ?",
        [params.id]
      );

      // Registrar motivo de suspensión
      if (motivo) {
        await connection.query(
          `INSERT INTO logs_sistema (accion, modulo, descripcion, ip_address) 
           VALUES (?, ?, ?, ?)`,
          [
            "suspension_centro",
            "centros",
            `Centro "${existing[0].nombre}" suspendido. Motivo: ${motivo}`,
            request.headers.get("x-forwarded-for") || "unknown",
          ]
        );
      }

      const [updatedCentro] = await connection.query<RowDataPacket[]>(
        "SELECT * FROM centros_medicos WHERE id_centro = ?",
        [params.id]
      );

      await connection.commit();

      console.log(`⚠️ Centro ${params.id} suspendido:`, existing[0].nombre);

      return NextResponse.json({
        success: true,
        message: "Centro suspendido exitosamente",
        data: updatedCentro[0],
        motivo: motivo || "No especificado",
      });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error: any) {
    console.error(`❌ Error en POST /api/admin/centros/${params.id}/suspender:`, error);
    return NextResponse.json(
      {
        success: false,
        error: "Error al suspender centro",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
