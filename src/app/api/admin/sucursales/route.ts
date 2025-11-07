// frontend/src/app/api/admin/sucursales/route.ts
import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { RowDataPacket } from "mysql2";

interface Sucursal extends RowDataPacket {
  id_sucursal: number;
  nombre: string;
  id_centro: number;
  direccion: string;
  telefono: string;
  email: string;
  estado: string;
  centro_nombre: string;
}

// GET - Listar sucursales
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const idCentro = searchParams.get("id_centro");
    const estado = searchParams.get("estado");
    const busqueda = searchParams.get("busqueda");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "100");
    const offset = (page - 1) * limit;

    console.log("🔍 GET /api/admin/sucursales - Parámetros:", {
      idCentro,
      estado,
      busqueda,
      page,
      limit,
    });

    let query = `
      SELECT 
        s.*,
        c.nombre as centro_nombre
      FROM sucursales s
      INNER JOIN centros_medicos c ON s.id_centro = c.id_centro
      WHERE 1=1
    `;

    const params: any[] = [];

    if (idCentro) {
      query += " AND s.id_centro = ?";
      params.push(idCentro);
    }

    if (estado) {
      query += " AND s.estado = ?";
      params.push(estado);
    }

    if (busqueda) {
      query += " AND (s.nombre LIKE ? OR s.direccion LIKE ?)";
      params.push(`%${busqueda}%`, `%${busqueda}%`);
    }

    query += " ORDER BY c.nombre, s.nombre";
    query += " LIMIT ? OFFSET ?";
    params.push(limit, offset);

    const [sucursales] = await pool.execute<Sucursal[]>(query, params);

    // Obtener total
    let countQuery = `
      SELECT COUNT(*) as total 
      FROM sucursales s
      INNER JOIN centros_medicos c ON s.id_centro = c.id_centro
      WHERE 1=1
    `;
    const countParams: any[] = [];

    if (idCentro) {
      countQuery += " AND s.id_centro = ?";
      countParams.push(idCentro);
    }

    if (estado) {
      countQuery += " AND s.estado = ?";
      countParams.push(estado);
    }

    if (busqueda) {
      countQuery += " AND (s.nombre LIKE ? OR s.direccion LIKE ?)";
      countParams.push(`%${busqueda}%`, `%${busqueda}%`);
    }

    const [countResult] = await pool.execute<RowDataPacket[]>(
      countQuery,
      countParams
    );
    const total = countResult[0].total;

    console.log("✅ Sucursales encontradas:", sucursales.length);

    return NextResponse.json({
      success: true,
      data: sucursales,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error("❌ Error en GET /api/admin/sucursales:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Error al obtener sucursales",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
