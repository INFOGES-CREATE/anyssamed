// frontend/src/app/api/admin/medicos/[id]/disponibilidad/route.ts
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { RowDataPacket } from "mysql2";
import { registrarLog } from "@/lib/logs";

// ============================================================================
// TIPOS AUXILIARES
// ============================================================================
interface DisponibilidadItem {
  id_disponibilidad?: number;
  dia_semana: string | number;
  hora_inicio: string;
  hora_fin: string;
  estado?: string;
}

// ============================================================================
// GET - OBTENER DISPONIBILIDAD DE UN MÉDICO POR ID
// ============================================================================
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  let connection: any;

  try {
    const medicoId = parseInt(params.id, 10);

    if (isNaN(medicoId) || medicoId <= 0) {
      return NextResponse.json(
        { success: false, data: null, error: "ID de médico inválido" },
        { status: 400 }
      );
    }

    connection = await pool.getConnection();

    // Verificar que el médico exista
    const [existeRowsRaw] = await connection.query(
      `
        SELECT id_profesional
        FROM profesionales_salud
        WHERE id_profesional = ?
        LIMIT 1
      `,
      [medicoId]
    );
    const existeRows = existeRowsRaw as RowDataPacket[];

    if (existeRows.length === 0) {
      connection.release();
      return NextResponse.json(
        { success: false, data: null, error: "Médico no encontrado" },
        { status: 404 }
      );
    }

    // Obtener disponibilidad
    const [dispRowsRaw] = await connection.query(
      `
        SELECT
          id_disponibilidad,
          id_profesional,
          dia_semana,
          hora_inicio,
          hora_fin,
          estado
        FROM disponibilidad_medicos
        WHERE id_profesional = ?
        ORDER BY dia_semana ASC, hora_inicio ASC
      `,
      [medicoId]
    );
    const disponibilidadRows = dispRowsRaw as RowDataPacket[];

    const disponibilidad = disponibilidadRows.map((d) => ({
      id_disponibilidad: d.id_disponibilidad,
      id_profesional: d.id_profesional,
      dia_semana: d.dia_semana,
      hora_inicio: d.hora_inicio,
      hora_fin: d.hora_fin,
      estado: d.estado,
      activo: d.estado === "activo",
    }));

    connection.release();

    return NextResponse.json({
      success: true,
      data: disponibilidad,
      message: "Disponibilidad obtenida exitosamente",
    });
  } catch (error: any) {
    if (connection) connection.release();

    console.error("Error al obtener disponibilidad:", error);

    await registrarLog({
      tipo: "error",
      modulo: "disponibilidad_medicos",
      accion: "obtener_disponibilidad",
      descripcion: `Error al obtener disponibilidad médico ID ${params.id}`,
      mensaje_error: error.message,
      exitoso: false,
      nivel_severidad: 6,
    });

    return NextResponse.json(
      {
        success: false,
        data: null,
        error: "Error al obtener disponibilidad del médico",
        detalles: error.sqlMessage || error.message,
      },
      { status: 500 }
    );
  }
}

// ============================================================================
// PUT - REEMPLAZAR COMPLETAMENTE LA DISPONIBILIDAD DE UN MÉDICO
// ============================================================================
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  let connection: any;

  try {
    const medicoId = parseInt(params.id, 10);

    if (isNaN(medicoId) || medicoId <= 0) {
      return NextResponse.json(
        { success: false, data: null, error: "ID de médico inválido" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const disponibilidad: DisponibilidadItem[] = body?.disponibilidad;

    if (!Array.isArray(disponibilidad)) {
      return NextResponse.json(
        {
          success: false,
          data: null,
          error: "El cuerpo de la petición debe incluir 'disponibilidad'",
        },
        { status: 400 }
      );
    }

    for (const [index, item] of disponibilidad.entries()) {
      if (!item.dia_semana || !item.hora_inicio || !item.hora_fin) {
        return NextResponse.json(
          {
            success: false,
            data: null,
            error: `El bloque ${index} es inválido. Requiere 'dia_semana', 'hora_inicio', 'hora_fin'`,
          },
          { status: 400 }
        );
      }
    }

    connection = await pool.getConnection();
    await connection.beginTransaction();

    // Verificar que el médico exista
    const [existeRowsRaw] = await connection.query(
      `
        SELECT id_profesional
        FROM profesionales_salud
        WHERE id_profesional = ?
        LIMIT 1
      `,
      [medicoId]
    );
    const existeRows = existeRowsRaw as RowDataPacket[];

    if (existeRows.length === 0) {
      await connection.rollback();
      connection.release();
      return NextResponse.json(
        { success: false, data: null, error: "Médico no encontrado" },
        { status: 404 }
      );
    }

    // Eliminar disponibilidad actual
    await connection.query(
      `DELETE FROM disponibilidad_medicos WHERE id_profesional = ?`,
      [medicoId]
    );

    if (disponibilidad.length > 0) {
      for (const item of disponibilidad) {
        const estado = item.estado?.trim() || "activo";

        await connection.query(
          `
            INSERT INTO disponibilidad_medicos
              (id_profesional, dia_semana, hora_inicio, hora_fin, estado)
            VALUES (?, ?, ?, ?, ?)
          `,
          [
            medicoId,
            item.dia_semana,
            item.hora_inicio,
            item.hora_fin,
            estado,
          ]
        );
      }
    }

    // Obtener la disponibilidad actualizada
    const [dispRowsRaw] = await connection.query(
      `
        SELECT
          id_disponibilidad,
          id_profesional,
          dia_semana,
          hora_inicio,
          hora_fin,
          estado
        FROM disponibilidad_medicos
        WHERE id_profesional = ?
        ORDER BY dia_semana ASC, hora_inicio ASC
      `,
      [medicoId]
    );
    const disponibilidadRows = dispRowsRaw as RowDataPacket[];

    const disponibilidadActualizada = disponibilidadRows.map((d) => ({
      id_disponibilidad: d.id_disponibilidad,
      id_profesional: d.id_profesional,
      dia_semana: d.dia_semana,
      hora_inicio: d.hora_inicio,
      hora_fin: d.hora_fin,
      estado: d.estado,
      activo: d.estado === "activo",
    }));

    await registrarLog({
      id_usuario: null,
      tipo: "audit",
      modulo: "disponibilidad_medicos",
      accion: "actualizar_disponibilidad",
      descripcion: `Disponibilidad del médico ID ${medicoId} actualizada`,
      objeto_tipo: "medico",
      objeto_id: String(medicoId),
      datos_nuevos: disponibilidad,
      ip_origen:
        request.headers.get("x-forwarded-for") ||
        request.headers.get("x-real-ip") ||
        "unknown",
      agente_usuario: request.headers.get("user-agent") || "unknown",
      nivel_severidad: 5,
    });

    await connection.commit();
    connection.release();

    return NextResponse.json({
      success: true,
      data: disponibilidadActualizada,
      message: "Disponibilidad actualizada exitosamente",
    });
  } catch (error: any) {
    if (connection) {
      await connection.rollback();
      connection.release();
    }

    console.error("Error al actualizar disponibilidad:", error);

    await registrarLog({
      tipo: "error",
      modulo: "disponibilidad_medicos",
      accion: "actualizar_disponibilidad",
      descripcion: `Error al actualizar disponibilidad médico ID ${params.id}`,
      mensaje_error: error.message,
      exitoso: false,
      nivel_severidad: 8,
    });

    return NextResponse.json(
      {
        success: false,
        data: null,
        error: "Error al actualizar disponibilidad del médico",
        detalles: error.sqlMessage || error.message,
      },
      { status: 500 }
    );
  }
}
