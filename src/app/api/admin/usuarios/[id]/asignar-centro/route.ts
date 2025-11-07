// frontend/src/app/api/admin/usuarios/[id]/asignar-centro/route.ts
import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { RowDataPacket } from "mysql2";
import { registrarLog } from "@/lib/logs";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  let connection;

  try {
    const body = await request.json();
    const { id_centro, motivo } = body;

    connection = await pool.getConnection();

    // Obtener usuario
    const [usuario] = await connection.query<RowDataPacket[]>(
      "SELECT * FROM usuarios WHERE id_usuario = ?",
      [params.id]
    );

    if (usuario.length === 0) {
      connection.release();
      return NextResponse.json(
        { success: false, error: "Usuario no encontrado" },
        { status: 404 }
      );
    }

    let centroNombre = "Sin centro";

    // Si se asigna un centro, verificar que existe
    if (id_centro) {
      const [centro] = await connection.query<RowDataPacket[]>(
        "SELECT * FROM centros_medicos WHERE id_centro = ?",
        [id_centro]
      );

      if (centro.length === 0) {
        connection.release();
        return NextResponse.json(
          { success: false, error: "Centro médico no encontrado" },
          { status: 404 }
        );
      }

      if (centro[0].estado !== "activo") {
        connection.release();
        return NextResponse.json(
          { success: false, error: "El centro médico no está activo" },
          { status: 400 }
        );
      }

      centroNombre = centro[0].nombre;
    }

    const centroAntiguo = usuario[0].id_centro;

    // Actualizar centro
    await connection.query(
      `UPDATE usuarios SET
        id_centro = ?,
        fecha_modificacion = NOW()
      WHERE id_usuario = ?`,
      [id_centro || null, params.id]
    );

    // Registrar log
    await registrarLog({
      id_usuario: null,
      tipo: "audit",
      modulo: "usuarios",
      accion: "asignar_centro",
      descripcion: `Centro asignado a ${usuario[0].nombre} ${usuario[0].apellido_paterno}: ${centroNombre}. Motivo: ${motivo || "No especificado"}`,
      objeto_tipo: "usuario",
      objeto_id: params.id,
      datos_antiguos: { id_centro: centroAntiguo },
      datos_nuevos: { id_centro, motivo },
      ip_origen: request.headers.get("x-forwarded-for") || "unknown",
      agente_usuario: request.headers.get("user-agent") || "unknown",
      nivel_severidad: 5,
    });

    connection.release();

    return NextResponse.json({
      success: true,
      message: "Centro asignado exitosamente",
      data: {
        centro_anterior: centroAntiguo,
        centro_nuevo: id_centro,
        nombre_centro: centroNombre,
      },
    });
  } catch (error: any) {
    if (connection) connection.release();
    console.error("Error al asignar centro:", error);
    return NextResponse.json(
      { success: false, error: "Error al asignar centro" },
      { status: 500 }
    );
  }
}
