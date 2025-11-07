// app/api/admin/roles/export/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getConnection } from "@/lib/db";
import { RowDataPacket } from "mysql2/promise";

/**
 * GET /api/admin/roles/export
 * Exporta roles en diferentes formatos
 */
export async function GET(request: NextRequest) {
  const conn = await getConnection();
  
  try {
    const { searchParams } = new URL(request.url);
    const format = searchParams.get("format") || "json";
    const idsParam = searchParams.get("ids") || "";
    
    let query = `
      SELECT 
        r.id_rol,
        r.nombre,
        r.descripcion,
        r.nivel_jerarquia,
        r.es_predefinido,
        r.estado,
        r.fecha_creacion,
        r.fecha_modificacion,
        GROUP_CONCAT(p.codigo SEPARATOR ',') as permisos_json
      FROM roles r
      LEFT JOIN roles_permisos rp ON r.id_rol = rp.id_rol
      LEFT JOIN permisos p ON rp.id_permiso = p.id_permiso
    `;
    
    const params: any[] = [];
    
    // Filtrar por IDs si se proporcionan
    if (idsParam) {
      const ids = idsParam.split(",").map(id => parseInt(id)).filter(id => !isNaN(id));
      if (ids.length > 0) {
        const placeholders = ids.map(() => "?").join(",");
        query += ` WHERE r.id_rol IN (${placeholders})`;
        params.push(...ids);
      }
    }
    
    query += ` GROUP BY r.id_rol ORDER BY r.nivel_jerarquia, r.nombre`;
    
    const [roles] = await conn.query<RowDataPacket[]>(query, params);
    
    // Transformar datos
    const rolesExport = roles.map((r: any) => ({
      id_rol: r.id_rol,
      nombre: r.nombre,
      descripcion: r.descripcion,
      nivel_jerarquia: r.nivel_jerarquia,
      es_predefinido: r.es_predefinido,
      estado: r.estado,
      permisos: r.permisos_json ? r.permisos_json.split(",") : [],
      fecha_creacion: r.fecha_creacion,
      fecha_modificacion: r.fecha_modificacion,
    }));
    
    switch (format) {
      case "json":
        return new NextResponse(
          JSON.stringify(rolesExport, null, 2),
          {
            headers: {
              "Content-Type": "application/json",
              "Content-Disposition": `attachment; filename="roles_export_${Date.now()}.json"`,
            },
          }
        );
        
      case "csv":
        // Generar CSV
        const csvHeader = "ID,Nombre,Descripción,Nivel Jerarquía,Predefinido,Estado,Permisos\n";
        const csvRows = rolesExport.map(r => 
          `${r.id_rol},"${r.nombre}","${r.descripcion || ''}",${r.nivel_jerarquia},${r.es_predefinido ? 'Sí' : 'No'},${r.estado},"${r.permisos.join(';')}"`
        ).join("\n");
        const csv = csvHeader + csvRows;
        
        return new NextResponse(csv, {
          headers: {
            "Content-Type": "text/csv; charset=utf-8",
            "Content-Disposition": `attachment; filename="roles_export_${Date.now()}.csv"`,
          },
        });
        
      case "excel":
        // Para Excel, retornar JSON y el frontend lo procesa con una librería
        return NextResponse.json({
          success: true,
          data: rolesExport,
          format: "excel",
          message: "Use una librería como xlsx en el frontend para procesar estos datos",
        });
        
      default:
        return NextResponse.json(
          { success: false, error: "Formato no soportado" },
          { status: 400 }
        );
    }
    
  } catch (error: any) {
    console.error("Error en GET /api/admin/roles/export:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Error al exportar roles" },
      { status: 500 }
    );
  } finally {
    conn.release();
  }
}