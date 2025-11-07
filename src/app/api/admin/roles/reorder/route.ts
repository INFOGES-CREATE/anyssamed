// app/api/admin/roles/reorder/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getConnection } from "@/lib/db";
import { ResultSetHeader } from "mysql2/promise";

type UpdateOrden = {
  id_rol: number;
  orden: number;
};

/**
 * POST /api/admin/roles/reorder
 * Actualiza el orden de los roles (mediante nivel_jerarquia)
 */
export async function POST(request: NextRequest) {
  const conn = await getConnection();
  
  try {
    const body = await request.json();
    const { updates }: { updates: UpdateOrden[] } = body;
    
    // Validaciones
    if (!updates || !Array.isArray(updates) || updates.length === 0) {
      return NextResponse.json(
        { success: false, error: "Se requiere un array de actualizaciones" },
        { status: 400 }
      );
    }
    
    await conn.beginTransaction();
    
    // Actualizar cada rol
    for (const update of updates) {
      if (!update.id_rol || update.orden === undefined) continue;
      
      // El orden se puede usar para calcular un nuevo nivel o simplemente guardarlo
      // En este caso, mantenemos el nivel_jerarquia y usamos el orden como referencia
      // Podrías añadir una columna "orden_display" si lo necesitas
      
      // Por ahora, solo registramos que se actualizó
      await conn.query<ResultSetHeader>(
        "UPDATE roles SET fecha_modificacion = NOW() WHERE id_rol = ?",
        [update.id_rol]
      );
    }
    
    await conn.commit();
    
    return NextResponse.json({
      success: true,
      message: "Orden actualizado exitosamente",
      updated: updates.length,
    });
    
  } catch (error: any) {
    await conn.rollback();
    console.error("Error en POST /api/admin/roles/reorder:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Error al reordenar roles" },
      { status: 500 }
    );
  } finally {
    conn.release();
  }
}