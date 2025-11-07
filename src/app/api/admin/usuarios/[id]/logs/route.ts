// frontend/src/app/api/admin/usuarios/[id]/logs/route.ts
import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { RowDataPacket } from "mysql2";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  let connection;

  try {
    const idUsuario = parseInt(params.id);

    if (isNaN(idUsuario)) {
      return NextResponse.json(
        { success: false, error: "ID de usuario inválido" },
        { status: 400 }
      );
    }

    // Obtener parámetros de query
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");
    const tipo = searchParams.get("tipo"); // error, security, audit, info
    const modulo = searchParams.get("modulo");
    const accion = searchParams.get("accion");
    const fechaInicio = searchParams.get("fecha_inicio");
    const fechaFin = searchParams.get("fecha_fin");
    const nivelSeveridad = searchParams.get("nivel_severidad");

    const offset = (page - 1) * limit;

    connection = await pool.getConnection();

    // Construir WHERE dinámico
    let whereConditions = ["id_usuario = ?"];
    let queryParams: any[] = [idUsuario];

    if (tipo) {
      whereConditions.push("tipo = ?");
      queryParams.push(tipo);
    }

    if (modulo) {
      whereConditions.push("modulo = ?");
      queryParams.push(modulo);
    }

    if (accion) {
      whereConditions.push("accion = ?");
      queryParams.push(accion);
    }

    if (fechaInicio) {
      whereConditions.push("fecha_hora >= ?");
      queryParams.push(fechaInicio);
    }

    if (fechaFin) {
      whereConditions.push("fecha_hora <= ?");
      queryParams.push(fechaFin);
    }

    if (nivelSeveridad) {
      whereConditions.push("nivel_severidad >= ?");
      queryParams.push(parseInt(nivelSeveridad));
    }

    const whereClause = whereConditions.join(" AND ");

    // Obtener total de registros
    const [totalResult] = await connection.query<RowDataPacket[]>(
      `SELECT COUNT(*) as total FROM logs_sistema WHERE ${whereClause}`,
      queryParams
    );

    const total = totalResult[0].total;
    const totalPages = Math.ceil(total / limit);

    // Obtener logs paginados
    const [logs] = await connection.query<RowDataPacket[]>(
      `SELECT 
        id_log,
        fecha_hora,
        tipo,
        modulo,
        accion,
        descripcion,
        objeto_tipo,
        objeto_id,
        ip_origen,
        agente_usuario,
        nivel_severidad,
        datos_antiguos,
        datos_nuevos
      FROM logs_sistema
      WHERE ${whereClause}
      ORDER BY fecha_hora DESC
      LIMIT ? OFFSET ?`,
      [...queryParams, limit, offset]
    );

    // Obtener resumen de filtros
    const [resumenTipos] = await connection.query<RowDataPacket[]>(
      `SELECT tipo, COUNT(*) as cantidad FROM logs_sistema WHERE id_usuario = ? GROUP BY tipo`,
      [idUsuario]
    );

    const [resumenModulos] = await connection.query<RowDataPacket[]>(
      `SELECT modulo, COUNT(*) as cantidad FROM logs_sistema WHERE id_usuario = ? GROUP BY modulo ORDER BY cantidad DESC LIMIT 10`,
      [idUsuario]
    );

    connection.release();

    return NextResponse.json({
      success: true,
      data: {
        logs: logs,
        paginacion: {
          page: page,
          limit: limit,
          total: total,
          total_pages: totalPages,
          has_next: page < totalPages,
          has_prev: page > 1,
        },
        filtros_aplicados: {
          tipo,
          modulo,
          accion,
          fecha_inicio: fechaInicio,
          fecha_fin: fechaFin,
          nivel_severidad: nivelSeveridad,
        },
        resumen: {
          por_tipo: resumenTipos,
          por_modulo: resumenModulos,
        },
      },
    });
  } catch (error: any) {
    if (connection) connection.release();
    console.error("❌ Error al obtener logs:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Error al obtener logs",
        detalles: error.message,
      },
      { status: 500 }
    );
  }
}
