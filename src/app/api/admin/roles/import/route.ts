// app/api/admin/roles/import/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getConnection } from "@/lib/db";
import { RowDataPacket, ResultSetHeader } from "mysql2/promise";

/**
 * POST /api/admin/roles/import
 * Importa roles desde un archivo JSON o CSV
 */
export async function POST(request: NextRequest) {
  const conn = await getConnection();
  
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    
    if (!file) {
      return NextResponse.json(
        { success: false, error: "No se proporcionó ningún archivo" },
        { status: 400 }
      );
    }
    
    // Leer contenido del archivo
    const content = await file.text();
    let rolesImportar: any[] = [];
    
    // Determinar formato y parsear
    if (file.name.endsWith(".json")) {
      try {
        rolesImportar = JSON.parse(content);
      } catch (e) {
        return NextResponse.json(
          { success: false, error: "Archivo JSON inválido" },
          { status: 400 }
        );
      }
    } else if (file.name.endsWith(".csv")) {
      // Parser CSV básico
      const lines = content.split("\n").filter(line => line.trim());
      if (lines.length < 2) {
        return NextResponse.json(
          { success: false, error: "CSV debe tener al menos encabezado y una fila de datos" },
          { status: 400 }
        );
      }
      
      const headers = lines[0].split(",").map(h => h.trim().replace(/"/g, ""));
      
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(",").map(v => v.trim().replace(/"/g, ""));
        const rol: any = {};
        
        headers.forEach((header, idx) => {
          rol[header.toLowerCase().replace(/\s+/g, "_")] = values[idx] || "";
        });
        
        // Convertir permisos de string a array
        if (rol.permisos && typeof rol.permisos === "string") {
          rol.permisos = rol.permisos.split(";").filter(Boolean);
        }
        
        rolesImportar.push(rol);
      }
    } else {
      return NextResponse.json(
        { success: false, error: "Formato de archivo no soportado. Use JSON o CSV" },
        { status: 400 }
      );
    }
    
    // Validar estructura
    if (!Array.isArray(rolesImportar) || rolesImportar.length === 0) {
      return NextResponse.json(
        { success: false, error: "El archivo no contiene roles válidos para importar" },
        { status: 400 }
      );
    }
    
    await conn.beginTransaction();
    
    let imported = 0;
    let skipped = 0;
    const errors: string[] = [];
    
    for (const rolData of rolesImportar) {
      try {
        // Validar campos requeridos
        if (!rolData.nombre) {
          errors.push(`Rol sin nombre - fila omitida`);
          skipped++;
          continue;
        }
        
        // Verificar si el rol ya existe
        const [existe] = await conn.query<RowDataPacket[]>(
          "SELECT id_rol FROM roles WHERE nombre = ?",
          [rolData.nombre]
        );
        
        if (existe.length > 0) {
          errors.push(`Rol "${rolData.nombre}" ya existe - omitido`);
          skipped++;
          continue;
        }
        
        // Insertar rol
        const estado = rolData.estado === "activo" || rolData.estado === 1 ? "activo" : "inactivo";
        const nivel_jerarquia = parseInt(rolData.nivel_jerarquia) || 3;
        
        const [result] = await conn.query<ResultSetHeader>(
          `INSERT INTO roles (nombre, descripcion, nivel_jerarquia, es_predefinido, estado)
           VALUES (?, ?, ?, 0, ?)`,
          [
            rolData.nombre,
            rolData.descripcion || null,
            nivel_jerarquia,
            estado
          ]
        );
        
        const id_rol = result.insertId;
        
        // Insertar permisos si existen
        if (rolData.permisos && Array.isArray(rolData.permisos) && rolData.permisos.length > 0) {
          // Obtener IDs de permisos válidos
          const placeholders = rolData.permisos.map(() => "?").join(",");
          const [permisosDB] = await conn.query<RowDataPacket[]>(
            `SELECT id_permiso FROM permisos WHERE codigo IN (${placeholders}) AND estado = 'activo'`,
            rolData.permisos
          );
          
          if (permisosDB.length > 0) {
            const values = permisosDB.map((p: any) => [id_rol, p.id_permiso]);
            await conn.query(
              "INSERT INTO roles_permisos (id_rol, id_permiso) VALUES ?",
              [values]
            );
          }
        }
        
        imported++;
        
      } catch (error: any) {
        errors.push(`Error al importar "${rolData.nombre}": ${error.message}`);
        skipped++;
      }
    }
    
    await conn.commit();
    
    return NextResponse.json({
      success: true,
      message: `Importación completada: ${imported} roles importados, ${skipped} omitidos`,
      imported,
      skipped,
      errors: errors.length > 0 ? errors : undefined,
    });
    
  } catch (error: any) {
    await conn.rollback();
    console.error("Error en POST /api/admin/roles/import:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Error al importar roles" },
      { status: 500 }
    );
  } finally {
    conn.release();
  }
}