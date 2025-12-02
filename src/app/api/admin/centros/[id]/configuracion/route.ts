// frontend/src/app/api/admin/centros/[id]/configuracion/route.ts
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { RowDataPacket, ResultSetHeader } from "mysql2";

// Utilidad local para crear slugs limpios tipo "centro-medico-los-niches"
function slugify(value: string) {
  return value
    .normalize("NFD") // separa acentos
    .replace(/[\u0300-\u036f]/g, "") // elimina acentos
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-") // reemplaza todo lo que no es alfanumérico por "-"
    .replace(/^-+|-+$/g, ""); // limpia guiones al inicio/fin
}

// =========================================
// GET /api/admin/centros/[id]/configuracion
// Devuelve la configuración editable en el panel
// =========================================
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    console.log(`⚙️ GET /api/admin/centros/${params.id}/configuracion`);

    const [config] = await pool.query<RowDataPacket[]>(
      `SELECT 
        horario_apertura,
        horario_cierre,
        dias_atencion,
        capacidad_pacientes_dia,
        nivel_complejidad,
        especializacion_principal,
        sitio_web,
        logo_url
      FROM centros_medicos
      WHERE id_centro = ?`,
      [params.id]
    );

    if (config.length === 0) {
      return NextResponse.json(
        { success: false, error: "Centro no encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: config[0],
    });
  } catch (error: any) {
    console.error(`❌ Error en GET /api/admin/centros/${params.id}/configuracion:`, error);
    return NextResponse.json(
      {
        success: false,
        error: "Error al obtener configuración",
        details: error.message,
      },
      { status: 500 }
    );
  }
}

// =========================================
// PUT /api/admin/centros/[id]/configuracion
// Actualiza configuración operativa Y garantiza micrositio
// =========================================
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    console.log(`⚙️ PUT /api/admin/centros/${params.id}/configuracion`, body);

    const connection = await pool.getConnection();

    try {
      await connection.beginTransaction();

      // 1. Bloqueamos y leemos info actual del centro
      const [centroRows] = await connection.query<RowDataPacket[]>(
        `
        SELECT 
          id_centro,
          nombre,
          sitio_web
        FROM centros_medicos
        WHERE id_centro = ?
        FOR UPDATE
        `,
        [params.id]
      );

      if (centroRows.length === 0) {
        await connection.rollback();
        return NextResponse.json(
          { success: false, error: "Centro no encontrado" },
          { status: 404 }
        );
      }

      const centroActual = centroRows[0] as {
        id_centro: number;
        nombre: string;
        sitio_web: string | null;
      };

      // 2. Asegurar que el centro tenga URL pública (micrositio)
      //    Regla:
      //    - Si en el PUT viene `sitio_web`, usamos eso.
      //    - Si NO viene y en DB ya hay `sitio_web`, lo dejamos igual.
      //    - Si NO viene y en DB NO hay `sitio_web`, generamos automático.
      //
      //    El dominio base lo puedes setear vía variable de entorno:
      //    NEXT_PUBLIC_MICROSITE_BASE_URL="https://plataforma.salud.cl"
      //
      //    Resultado final: https://plataforma.salud.cl/centros/centro-medico-x-12
      //
      const baseMicrositeDomain =
        process.env.NEXT_PUBLIC_MICROSITE_BASE_URL ||
        process.env.PUBLIC_MICROSITE_BASE_URL ||
        process.env.NEXT_PUBLIC_BASE_URL ||
        "https://micrositios.example.com";

      let sitioWebFinal = body.sitio_web;

      const noBodySitioWeb =
        sitioWebFinal === undefined ||
        sitioWebFinal === null ||
        (typeof sitioWebFinal === "string" && sitioWebFinal.trim() === "");

      const dbSitioWebVacio =
        !centroActual.sitio_web ||
        (typeof centroActual.sitio_web === "string" &&
          centroActual.sitio_web.trim() === "");

      if (noBodySitioWeb && dbSitioWebVacio) {
        // generar micrositio único usando nombre + id_centro
        const slugBase = slugify(centroActual.nombre || "centro");
        const cleanBase = baseMicrositeDomain.replace(/\/+$/, "");
        sitioWebFinal = `${cleanBase}/centros/${slugBase}-${centroActual.id_centro}`;
        console.log(
          `🌐 Generando micrositio para centro ${centroActual.id_centro}: ${sitioWebFinal}`
        );
      }

      // 3. Construimos payload final a guardar
      //    (inyectamos sitio_webFinal si corresponde)
      const payloadToSave: Record<string, any> = {
        ...body,
      };
      if (sitioWebFinal !== undefined) {
        payloadToSave.sitio_web = sitioWebFinal;
      }

      // 4. Campos permitidos para update
      const allowedFields = [
        "horario_apertura",
        "horario_cierre",
        "dias_atencion",
        "capacidad_pacientes_dia",
        "nivel_complejidad",
        "especializacion_principal",
        "sitio_web",
        "logo_url",
      ];

      const fieldsToUpdate: string[] = [];
      const values: any[] = [];

      allowedFields.forEach((field) => {
        if (payloadToSave[field] !== undefined) {
          fieldsToUpdate.push(`${field} = ?`);
          values.push(payloadToSave[field]);
        }
      });

      if (fieldsToUpdate.length === 0) {
        await connection.rollback();
        return NextResponse.json(
          { success: false, error: "No hay campos para actualizar" },
          { status: 400 }
        );
      }

      // timestamp de modificación
      fieldsToUpdate.push("fecha_modificacion = NOW()");

      // id al final del array de valores
      values.push(params.id);

      // 5. Ejecutamos UPDATE
      await connection.query<ResultSetHeader>(
        `UPDATE centros_medicos 
         SET ${fieldsToUpdate.join(", ")} 
         WHERE id_centro = ?`,
        values
      );

      // 6. Traemos info ya actualizada para devolverla
      const [updatedConfig] = await connection.query<RowDataPacket[]>(
        `SELECT 
          horario_apertura,
          horario_cierre,
          dias_atencion,
          capacidad_pacientes_dia,
          nivel_complejidad,
          especializacion_principal,
          sitio_web,
          logo_url
        FROM centros_medicos
        WHERE id_centro = ?`,
        [params.id]
      );

      await connection.commit();

      console.log(`✅ Configuración actualizada para centro ${params.id}`);

      return NextResponse.json({
        success: true,
        message: "Configuración actualizada exitosamente",
        data: updatedConfig[0],
      });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error: any) {
    console.error(`❌ Error en PUT /api/admin/centros/${params.id}/configuracion:`, error);
    return NextResponse.json(
      {
        success: false,
        error: "Error al actualizar configuración",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
