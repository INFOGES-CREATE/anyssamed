// frontend/src/app/api/admin/centros/[id]/route.ts
export const dynamic = "force-dynamic";

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
        cm.pais,
        cm.razon_social,
        cm.rut,
        cm.direccion,
        cm.ciudad,
        cm.region,
        cm.comuna,
        cm.codigo_postal,
        cm.telefono_principal,
        cm.telefono_secundario,
        cm.email_contacto,
        cm.email_secundario,
        cm.sitio_web,
        cm.logo_url,
        cm.descripcion,
        cm.horario_apertura,
        cm.horario_cierre,
        cm.dias_atencion,
        cm.plan,
        cm.estado,
        cm.fecha_inicio_operacion,
        cm.capacidad_pacientes_dia,
        cm.nivel_complejidad,
        cm.especializacion_principal,
        cm.tipo_establecimiento,
        cm.fecha_creacion,
        cm.fecha_modificacion as fecha_actualizacion,
        cm.created_by,
        cm.id_pais,
        cm.id_region,
        cm.id_comuna,
        
        COUNT(DISTINCT u.id_usuario) as usuarios_count,
        COUNT(DISTINCT CASE WHEN u.estado = 'activo' THEN u.id_usuario END) as usuarios_activos,
        COUNT(DISTINCT m.id_profesional) as profesionales_salud_count,
        COUNT(DISTINCT CASE WHEN m.estado = 'activo' THEN m.id_profesional END) as profesionales_salud_activos,
        COUNT(DISTINCT pat.id_paciente) as pacientes_count,
        COUNT(DISTINCT CASE WHEN pat.estado = 'activo' THEN pat.id_paciente END) as pacientes_activos,
        COUNT(DISTINCT s.id_sucursal) as sucursales_count,
        COUNT(DISTINCT CASE 
          WHEN MONTH(hc.fecha_atencion) = MONTH(CURDATE()) 
          AND YEAR(hc.fecha_atencion) = YEAR(CURDATE()) 
          THEN hc.id_historial 
        END) as consultas_mes
        
      FROM centros_medicos cm
      LEFT JOIN usuarios u ON u.id_centro_principal = cm.id_centro
      LEFT JOIN profesionales_salud m ON m.id_centro_principal = cm.id_centro
      LEFT JOIN pacientes pat ON pat.id_centro_registro = cm.id_centro
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

console.log("✅ Centro encontrado:", centro[0]?.nombre || "(sin nombre)");

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

      // Validaciones
      if (body.nombre && !body.nombre.trim()) {
        await connection.rollback();
        return NextResponse.json(
          { success: false, error: "El nombre del centro es requerido" },
          { status: 400 }
        );
      }

      if (body.email_contacto && !body.email_contacto.trim()) {
        await connection.rollback();
        return NextResponse.json(
          { success: false, error: "El email de contacto es requerido" },
          { status: 400 }
        );
      }

      if (body.pais && !body.pais.trim()) {
        await connection.rollback();
        return NextResponse.json(
          { success: false, error: "El país es requerido" },
          { status: 400 }
        );
      }

      if (body.region && !body.region.trim()) {
        await connection.rollback();
        return NextResponse.json(
          { success: false, error: "La región es requerida" },
          { status: 400 }
        );
      }

      const fieldsToUpdate: string[] = [];
      const values: any[] = [];

      const fieldMapping: Record<string, string> = {
        nombre: "nombre",
        pais: "pais",
        razon_social: "razon_social",
        rut: "rut",
        direccion: "direccion",
        ciudad: "ciudad",
        region: "region",
        comuna: "comuna",
        codigo_postal: "codigo_postal",
        telefono_principal: "telefono_principal",
        telefono_secundario: "telefono_secundario",
        email_contacto: "email_contacto",
        email_secundario: "email_secundario",
        sitio_web: "sitio_web",
        logo_url: "logo_url",
        descripcion: "descripcion",
        horario_apertura: "horario_apertura",
        horario_cierre: "horario_cierre",
        dias_atencion: "dias_atencion",
        plan: "plan",
        estado: "estado",
        capacidad_pacientes_dia: "capacidad_pacientes_dia",
        nivel_complejidad: "nivel_complejidad",
        especializacion_principal: "especializacion_principal",
        tipo_establecimiento: "tipo_establecimiento",
        id_pais: "id_pais",
        id_region: "id_region",
        id_comuna: "id_comuna",
      };

      Object.entries(fieldMapping).forEach(([bodyKey, dbColumn]) => {
        if (body[bodyKey] !== undefined && body[bodyKey] !== null && body[bodyKey] !== "") {
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
          cm.id_centro,
          cm.nombre,
          cm.pais,
          cm.razon_social,
          cm.rut,
          cm.direccion,
          cm.ciudad,
          cm.region,
          cm.comuna,
          cm.codigo_postal,
          cm.telefono_principal,
          cm.telefono_secundario,
          cm.email_contacto,
          cm.email_secundario,
          cm.sitio_web,
          cm.logo_url,
          cm.descripcion,
          cm.horario_apertura,
          cm.horario_cierre,
          cm.dias_atencion,
          cm.plan,
          cm.estado,
          cm.fecha_inicio_operacion,
          cm.capacidad_pacientes_dia,
          cm.nivel_complejidad,
          cm.especializacion_principal,
          cm.tipo_establecimiento,
          cm.fecha_creacion,
          cm.fecha_modificacion as fecha_actualizacion,
          cm.created_by,
          cm.id_pais,
          cm.id_region,
          cm.id_comuna
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

      const [profesionales_salud] = await connection.query<RowDataPacket[]>(
        "SELECT COUNT(*) as count FROM profesionales_salud WHERE id_centro_principal = ?",
        [params.id]
      );

      const [pacientes] = await connection.query<RowDataPacket[]>(
        "SELECT COUNT(*) as count FROM pacientes WHERE id_centro_registro = ?",
        [params.id]
      );

      if (usuarios[0].count > 0 || profesionales_salud[0].count > 0 || pacientes[0].count > 0) {
        await connection.rollback();
        return NextResponse.json(
          {
            success: false,
            error: "No se puede eliminar el centro porque tiene registros asociados",
            detalles: {
              usuarios: usuarios[0].count,
              medicos: profesionales_salud[0].count,
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
