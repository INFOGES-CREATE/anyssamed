// frontend/src/app/api/admin/centros/[id]/route.ts
import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { RowDataPacket, ResultSetHeader } from "mysql2";

// GET - OBTENER CENTRO POR ID
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    console.log(`🔍 GET /api/admin/centros/${params.id}`);

    const [centro] = await pool.query<RowDataPacket[]>(
      `SELECT 
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
        cm.logo_url,
        cm.descripcion,
        cm.horario_apertura,
        cm.horario_cierre,
        cm.dias_atencion,
        cm.estado,
        cm.fecha_inicio_operacion,
        cm.capacidad_pacientes_dia,
        cm.nivel_complejidad,
        cm.especializacion_principal,
        cm.fecha_creacion,
        cm.fecha_modificacion as fecha_actualizacion,
        
        COUNT(DISTINCT u.id_usuario) as usuarios_count,
        COUNT(DISTINCT CASE WHEN u.estado = 'activo' THEN u.id_usuario END) as usuarios_activos,
        COUNT(DISTINCT m.id_medico) as medicos_count,
        COUNT(DISTINCT CASE WHEN m.estado = 'activo' THEN m.id_medico END) as medicos_activos,
        COUNT(DISTINCT p.id_paciente) as pacientes_count,
        COUNT(DISTINCT CASE WHEN p.estado = 'activo' THEN p.id_paciente END) as pacientes_activos,
        COUNT(DISTINCT s.id_sucursal) as sucursales_count,
        COUNT(DISTINCT CASE 
          WHEN MONTH(hc.fecha_atencion) = MONTH(CURDATE()) 
          AND YEAR(hc.fecha_atencion) = YEAR(CURDATE()) 
          THEN hc.id_historial 
        END) as consultas_mes
        
      FROM centros_medicos cm
      LEFT JOIN usuarios u ON u.id_centro_principal = cm.id_centro
      LEFT JOIN medicos m ON m.id_centro_principal = cm.id_centro
      LEFT JOIN pacientes p ON p.id_centro_registro = cm.id_centro
      LEFT JOIN sucursales s ON s.id_centro = cm.id_centro
      LEFT JOIN historial_clinico hc ON hc.id_centro = cm.id_centro
      WHERE cm.id_centro = ?
      GROUP BY cm.id_centro`,
      [params.id]
    );

    if (centro.length === 0) {
      return NextResponse.json(
        { success: false, error: "Centro no encontrado" },
        { status: 404 }
      );
    }

    console.log("✅ Centro encontrado:", centro[0].nombre);

    return NextResponse.json({
      success: true,
      data: centro[0],
    });
  } catch (error: any) {
    console.error(`❌ Error en GET /api/admin/centros/${params.id}:`, error);
    return NextResponse.json(
      {
        success: false,
        error: "Error al obtener centro médico",
        details: error.message,
      },
      { status: 500 }
    );
  }
}

// PUT - ACTUALIZAR CENTRO
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    console.log(`📝 PUT /api/admin/centros/${params.id}`);

    const connection = await pool.getConnection();

    try {
      await connection.beginTransaction();

      const [existing] = await connection.query<RowDataPacket[]>(
        "SELECT id_centro, nombre FROM centros_medicos WHERE id_centro = ?",
        [params.id]
      );

      if (existing.length === 0) {
        await connection.rollback();
        return NextResponse.json(
          { success: false, error: "Centro no encontrado" },
          { status: 404 }
        );
      }

      const fieldsToUpdate: string[] = [];
      const values: any[] = [];

      const fieldMapping: Record<string, string> = {
        nombre: "nombre",
        razon_social: "razon_social",
        rut: "rut",
        direccion: "direccion",
        ciudad: "ciudad",
        region: "region",
        codigo_postal: "codigo_postal",
        telefono: "telefono_principal",
        email: "email_contacto",
        sitio_web: "sitio_web",
        logo_url: "logo_url",
        descripcion: "descripcion",
        horario_apertura: "horario_apertura",
        horario_cierre: "horario_cierre",
        dias_atencion: "dias_atencion",
        estado: "estado",
        capacidad_pacientes_dia: "capacidad_pacientes_dia",
        nivel_complejidad: "nivel_complejidad",
        especializacion_principal: "especializacion_principal",
      };

      Object.entries(fieldMapping).forEach(([bodyKey, dbColumn]) => {
        if (body[bodyKey] !== undefined) {
          fieldsToUpdate.push(`${dbColumn} = ?`);
          values.push(body[bodyKey]);
        }
      });

      if (fieldsToUpdate.length === 0) {
        await connection.rollback();
        return NextResponse.json(
          { success: false, error: "No hay campos para actualizar" },
          { status: 400 }
        );
      }

      fieldsToUpdate.push("fecha_modificacion = NOW()");
      values.push(params.id);

      await connection.query(
        `UPDATE centros_medicos SET ${fieldsToUpdate.join(", ")} WHERE id_centro = ?`,
        values
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

      console.log(`✅ Centro ${params.id} actualizado:`, updatedCentro[0].nombre);

      return NextResponse.json({
        success: true,
        data: updatedCentro[0],
        message: "Centro actualizado exitosamente",
      });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error: any) {
    console.error(`❌ Error en PUT /api/admin/centros/${params.id}:`, error);
    return NextResponse.json(
      {
        success: false,
        error: "Error al actualizar centro",
        details: error.message,
      },
      { status: 500 }
    );
  }
}

// DELETE - ELIMINAR CENTRO
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    console.log(`🗑️ DELETE /api/admin/centros/${params.id}`);

    const connection = await pool.getConnection();

    try {
      await connection.beginTransaction();

      const [existing] = await connection.query<RowDataPacket[]>(
        "SELECT id_centro, nombre FROM centros_medicos WHERE id_centro = ?",
        [params.id]
      );

      if (existing.length === 0) {
        await connection.rollback();
        return NextResponse.json(
          { success: false, error: "Centro no encontrado" },
          { status: 404 }
        );
      }

      const [usuarios] = await connection.query<RowDataPacket[]>(
        "SELECT COUNT(*) as count FROM usuarios WHERE id_centro_principal = ?",
        [params.id]
      );

      const [medicos] = await connection.query<RowDataPacket[]>(
        "SELECT COUNT(*) as count FROM medicos WHERE id_centro_principal = ?",
        [params.id]
      );

      const [pacientes] = await connection.query<RowDataPacket[]>(
        "SELECT COUNT(*) as count FROM pacientes WHERE id_centro_registro = ?",
        [params.id]
      );

      if (usuarios[0].count > 0 || medicos[0].count > 0 || pacientes[0].count > 0) {
        await connection.rollback();
        return NextResponse.json(
          {
            success: false,
            error: "No se puede eliminar el centro porque tiene registros asociados",
            detalles: {
              usuarios: usuarios[0].count,
              medicos: medicos[0].count,
              pacientes: pacientes[0].count,
            },
          },
          { status: 400 }
        );
      }

      await connection.query(
        "DELETE FROM centros_medicos WHERE id_centro = ?",
        [params.id]
      );

      await connection.commit();

      console.log(`✅ Centro ${params.id} eliminado:`, existing[0].nombre);

      return NextResponse.json({
        success: true,
        message: "Centro eliminado exitosamente",
        centro_eliminado: existing[0].nombre,
      });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error: any) {
    console.error(`❌ Error en DELETE /api/admin/centros/${params.id}:`, error);
    return NextResponse.json(
      {
        success: false,
        error: "Error al eliminar centro",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
