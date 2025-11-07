// frontend/src/app/api/admin/centros/[id]/estado/route.ts
import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { RowDataPacket, ResultSetHeader } from "mysql2";

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { estado } = body;

    console.log(`🔄 PATCH /api/admin/centros/${params.id}/estado - Nuevo estado:`, estado);

    if (!estado) {
      return NextResponse.json(
        { success: false, error: "El campo 'estado' es requerido" },
        { status: 400 }
      );
    }

    const estadosValidos = ["activo", "inactivo", "suspendido"];
    if (!estadosValidos.includes(estado)) {
      return NextResponse.json(
        { 
          success: false, 
          error: "Estado inválido",
          estados_validos: estadosValidos
        },
        { status: 400 }
      );
    }

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

      const estadoAnterior = existing[0].estado;

      if (estadoAnterior === estado) {
        await connection.rollback();
        return NextResponse.json({
          success: true,
          message: "El centro ya tiene ese estado",
          data: {
            id_centro: params.id,
            nombre: existing[0].nombre,
            estado: estado,
          },
        });
      }

      await connection.query<ResultSetHeader>(
        "UPDATE centros_medicos SET estado = ?, fecha_modificacion = NOW() WHERE id_centro = ?",
        [estado, params.id]
      );

      const [updatedCentro] = await connection.query<RowDataPacket[]>(
        `SELECT 
          cm.*,
          cm.telefono_principal as telefono,
          cm.email_contacto as email,
          cm.fecha_modificacion as fecha_actualizacion
        FROM centros_medicos cm
        WHERE cm.id_centro = ?`,
        [params.id]
      );

      await connection.commit();

      console.log(`✅ Estado actualizado: ${estadoAnterior} → ${estado}`);

      return NextResponse.json({
        success: true,
        message: `Estado del centro actualizado exitosamente`,
        data: updatedCentro[0],
        cambio: {
          estado_anterior: estadoAnterior,
          estado_nuevo: estado,
          fecha_cambio: new Date().toISOString(),
        },
      });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error: any) {
    console.error(`❌ Error en PATCH /api/admin/centros/${params.id}/estado:`, error);
    return NextResponse.json(
      {
        success: false,
        error: "Error al cambiar el estado del centro",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
