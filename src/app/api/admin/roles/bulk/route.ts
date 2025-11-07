// app/api/admin/roles/bulk/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getConnection } from "@/lib/db";
import { RowDataPacket, ResultSetHeader } from "mysql2/promise";

/**
 * POST /api/admin/roles/bulk
 * Ejecuta operaciones masivas sobre roles
 */
export async function POST(request: NextRequest) {
  const conn = await getConnection();
  
  try {
    const body = await request.json();
    const { action, ids, permisos } = body;
    
    // Validaciones
    if (!action || !ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { success: false, error: "Acción e IDs son requeridos" },
        { status: 400 }
      );
    }
    
    await conn.beginTransaction();
    
    let message = "";
    let affected = 0;
    
    // Preparar placeholders para la query
    const placeholders = ids.map(() => "?").join(",");
    
    switch (action) {
      case "activar":
        // Activar roles
        const [resultActivar] = await conn.query<ResultSetHeader>(
          `UPDATE roles SET estado = 'activo' WHERE id_rol IN (${placeholders}) AND es_predefinido = 0`,
          ids
        );
        affected = resultActivar.affectedRows;
        message = `${affected} rol(es) activado(s)`;
        break;
        
      case "desactivar":
        // Desactivar roles (excepto predefinidos)
        const [resultDesactivar] = await conn.query<ResultSetHeader>(
          `UPDATE roles SET estado = 'inactivo' WHERE id_rol IN (${placeholders}) AND es_predefinido = 0`,
          ids
        );
        affected = resultDesactivar.affectedRows;
        message = `${affected} rol(es) desactivado(s)`;
        break;
        
      case "delete":
        // Verificar que ninguno sea predefinido
        const [predefinidos] = await conn.query<RowDataPacket[]>(
          `SELECT COUNT(*) as count FROM roles WHERE id_rol IN (${placeholders}) AND es_predefinido = 1`,
          ids
        );
        
        if (predefinidos[0].count > 0) {
          await conn.rollback();
          return NextResponse.json(
            { success: false, error: "No se pueden eliminar roles predefinidos" },
            { status: 400 }
          );
        }
        
        // Verificar roles con usuarios asignados
        const [conUsuarios] = await conn.query<RowDataPacket[]>(
          `SELECT r.nombre, COUNT(ur.id_usuario) as usuarios
           FROM roles r
           LEFT JOIN usuarios_roles ur ON r.id_rol = ur.id_rol AND ur.activo = 1
           WHERE r.id_rol IN (${placeholders})
           GROUP BY r.id_rol
           HAVING usuarios > 0`,
          ids
        );
        
        if (conUsuarios.length > 0) {
          await conn.rollback();
          const rolesConUsuarios = conUsuarios.map((r: any) => `${r.nombre} (${r.usuarios} usuarios)`).join(", ");
          return NextResponse.json(
            { 
              success: false, 
              error: `Los siguientes roles tienen usuarios asignados: ${rolesConUsuarios}. Reasigne los usuarios antes de eliminar.` 
            },
            { status: 400 }
          );
        }
        
        // Eliminar roles (las relaciones se eliminan por CASCADE)
        const [resultDelete] = await conn.query<ResultSetHeader>(
          `DELETE FROM roles WHERE id_rol IN (${placeholders}) AND es_predefinido = 0`,
          ids
        );
        affected = resultDelete.affectedRows;
        message = `${affected} rol(es) eliminado(s)`;
        break;
        
      case "clone":
        // Clonar roles
        affected = 0;
        for (const id of ids) {
          // Obtener rol original
          const [rolOriginal] = await conn.query<RowDataPacket[]>(
            `SELECT * FROM roles WHERE id_rol = ?`,
            [id]
          );
          
          if (rolOriginal.length === 0) continue;
          
          const rol = rolOriginal[0];
          const nuevoNombre = `${rol.nombre} (Copia)`;
          
          // Verificar que el nombre no exista
          const [existe] = await conn.query<RowDataPacket[]>(
            "SELECT id_rol FROM roles WHERE nombre = ?",
            [nuevoNombre]
          );
          
          const nombreFinal = existe.length > 0 
            ? `${rol.nombre} (Copia ${Date.now()})`
            : nuevoNombre;
          
          // Crear nuevo rol
          const [resultClone] = await conn.query<ResultSetHeader>(
            `INSERT INTO roles (nombre, descripcion, nivel_jerarquia, es_predefinido, estado)
             VALUES (?, ?, ?, 0, ?)`,
            [nombreFinal, rol.descripcion, rol.nivel_jerarquia, rol.estado]
          );
          
          const nuevoIdRol = resultClone.insertId;
          
          // Copiar permisos
          await conn.query(
            `INSERT INTO roles_permisos (id_rol, id_permiso)
             SELECT ?, id_permiso FROM roles_permisos WHERE id_rol = ?`,
            [nuevoIdRol, id]
          );
          
          affected++;
        }
        message = `${affected} rol(es) clonado(s)`;
        break;
        
      case "asignar_permisos":
        // Asignar permisos a roles
        if (!permisos || !Array.isArray(permisos) || permisos.length === 0) {
          await conn.rollback();
          return NextResponse.json(
            { success: false, error: "Se requieren permisos para asignar" },
            { status: 400 }
          );
        }
        
        // Obtener IDs de permisos
        const placeholdersPermisos = permisos.map(() => "?").join(",");
        const [permisosDB] = await conn.query<RowDataPacket[]>(
          `SELECT id_permiso FROM permisos WHERE codigo IN (${placeholdersPermisos})`,
          permisos
        );
        
        if (permisosDB.length === 0) {
          await conn.rollback();
          return NextResponse.json(
            { success: false, error: "Permisos no válidos" },
            { status: 400 }
          );
        }
        
        // Insertar permisos para cada rol (ignorar duplicados)
        for (const idRol of ids) {
          for (const permiso of permisosDB) {
            await conn.query(
              `INSERT IGNORE INTO roles_permisos (id_rol, id_permiso) VALUES (?, ?)`,
              [idRol, permiso.id_permiso]
            );
          }
        }
        
        affected = ids.length;
        message = `Permisos asignados a ${affected} rol(es)`;
        break;
        
      case "remover_permisos":
        // Remover permisos de roles
        if (!permisos || !Array.isArray(permisos) || permisos.length === 0) {
          await conn.rollback();
          return NextResponse.json(
            { success: false, error: "Se requieren permisos para remover" },
            { status: 400 }
          );
        }
        
        // Obtener IDs de permisos
        const placeholdersRemover = permisos.map(() => "?").join(",");
        const [permisosRemoverDB] = await conn.query<RowDataPacket[]>(
          `SELECT id_permiso FROM permisos WHERE codigo IN (${placeholdersRemover})`,
          permisos
        );
        
        if (permisosRemoverDB.length > 0) {
          const idsPermisos = permisosRemoverDB.map((p: any) => p.id_permiso);
          const placeholdersIds = idsPermisos.map(() => "?").join(",");
          
          const [resultRemover] = await conn.query<ResultSetHeader>(
            `DELETE FROM roles_permisos 
             WHERE id_rol IN (${placeholders}) 
             AND id_permiso IN (${placeholdersIds})`,
            [...ids, ...idsPermisos]
          );
          
          affected = resultRemover.affectedRows;
        }
        
        message = `Permisos removidos de ${ids.length} rol(es)`;
        break;
        
      default:
        await conn.rollback();
        return NextResponse.json(
          { success: false, error: `Acción no válida: ${action}` },
          { status: 400 }
        );
    }
    
    await conn.commit();
    
    return NextResponse.json({
      success: true,
      message,
      affected,
    });
    
  } catch (error: any) {
    await conn.rollback();
    console.error("Error en POST /api/admin/roles/bulk:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Error en operación masiva" },
      { status: 500 }
    );
  } finally {
    conn.release();
  }
}