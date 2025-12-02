//frontend\src\app\api\admin\centros\exportar\route.ts
// frontend/src/app/api/admin/centros/exportar/route.ts
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { RowDataPacket } from "mysql2";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const estado = searchParams.get("estado");
    const busqueda = searchParams.get("busqueda");
    const formato = (searchParams.get("formato") || "json").toLowerCase(); // json | csv

    console.log("🔍 GET /api/admin/centros/exportar - Parámetros:", {
      estado,
      busqueda,
      formato,
    });

    let whereConditions: string[] = [];
    let queryParams: any[] = [];

    if (estado && estado !== "todos") {
      whereConditions.push("cm.estado = ?");
      queryParams.push(estado);
    }

    if (busqueda && busqueda.trim() !== "") {
      whereConditions.push(
        "(cm.nombre LIKE ? OR cm.rut LIKE ? OR cm.ciudad LIKE ? OR cm.region LIKE ? OR cm.razon_social LIKE ?)"
      );
      const searchTerm = `%${busqueda.trim()}%`;
      queryParams.push(
        searchTerm,
        searchTerm,
        searchTerm,
        searchTerm,
        searchTerm
      );
    }

    const whereClause =
      whereConditions.length > 0
        ? `WHERE ${whereConditions.join(" AND ")}`
        : "";

    // Para exportar normalmente NO paginamos: traemos todo lo que matchea
    const [centros] = await pool.query<RowDataPacket[]>(
      `
      SELECT 
        cm.id_centro,
        cm.nombre,
        cm.razon_social,
        cm.rut,
        cm.direccion,
        cm.ciudad,
        cm.region,
        cm.codigo_postal,
        cm.telefono_principal as telefono,
        cm.email_contacto as email,
        cm.sitio_web,
        cm.estado,
        cm.fecha_inicio_operacion,
        cm.capacidad_pacientes_dia,
        cm.nivel_complejidad,
        cm.especializacion_principal,
        cm.fecha_creacion,
        cm.fecha_modificacion as fecha_actualizacion
      FROM centros_medicos cm
      ${whereClause}
      ORDER BY cm.fecha_creacion DESC
    `,
      queryParams
    );

    console.log(
      "✅ Centros a exportar:",
      centros.length,
      "formato:",
      formato
    );

    // ============================
    // 📤 EXPORTACIÓN JSON
    // ============================
    if (formato === "json") {
      return NextResponse.json({
        success: true,
        formato: "json",
        total: centros.length,
        data: centros,
        timestamp: new Date().toISOString(),
      });
    }

    // ============================
    // 📤 EXPORTACIÓN CSV
    // ============================
    if (formato === "csv") {
      // Definimos las columnas que queremos en el CSV
      const headers = [
        "id_centro",
        "nombre",
        "razon_social",
        "rut",
        "direccion",
        "ciudad",
        "region",
        "codigo_postal",
        "telefono",
        "email",
        "sitio_web",
        "estado",
        "fecha_inicio_operacion",
        "capacidad_pacientes_dia",
        "nivel_complejidad",
        "especializacion_principal",
        "fecha_creacion",
        "fecha_actualizacion",
      ];

      const escapeCsv = (value: any): string => {
        if (value === null || value === undefined) return "";
        const str = String(value);
        // Si contiene coma, comillas o salto de línea, lo encerramos en comillas dobles
        if (/[",\n\r]/.test(str)) {
          return `"${str.replace(/"/g, '""')}"`;
        }
        return str;
      };

      const headerLine = headers.join(",");
      const lines = centros.map((row) =>
        headers
          .map((h) => escapeCsv((row as any)[h]))
          .join(",")
      );

      const csvContent = [headerLine, ...lines].join("\r\n");

      const fileName = `centros_export_${Date.now()}.csv`;

      return new Response(csvContent, {
        status: 200,
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="${fileName}"`,
        },
      });
    }

    // ============================
    // ❌ FORMATO NO SOPORTADO
    // ============================
    return NextResponse.json(
      {
        success: false,
        error: "Formato no soportado. Use 'json' o 'csv'.",
      },
      { status: 400 }
    );
  } catch (error: any) {
    console.error("❌ Error en GET /api/admin/centros/exportar:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Error al exportar centros médicos",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
