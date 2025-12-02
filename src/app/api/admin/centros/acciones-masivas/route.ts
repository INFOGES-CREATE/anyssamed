// File: src/app/api/admin/centros/acciones-masivas/route.ts
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { ResultSetHeader } from "mysql2";

/**
 * Endpoint para ejecutar acciones masivas sobre centros médicos.
 *
 * Formato esperado del body (JSON):
 *
 * {
 *   "accion": "activar" | "inactivar" | "suspender" | "cambiar_estado",
 *   "ids": [1, 2, 3],
 *   "nuevo_estado": "activo" | "inactivo" | "suspendido"   // solo para "cambiar_estado"
 * }
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();

    console.log("🧩 POST /api/admin/centros/acciones-masivas - Body:", body);

    const { accion, ids, nuevo_estado } = body || {};

    // ============================
    // 🧪 VALIDACIONES BÁSICAS
    // ============================
    if (!accion) {
      return NextResponse.json(
        {
          success: false,
          error: "El campo 'accion' es obligatorio.",
        },
        { status: 400 }
      );
    }

    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Debe enviar un arreglo 'ids' con al menos un id_centro.",
        },
        { status: 400 }
      );
    }

    // Normalizamos IDs a enteros
    const centrosIds: number[] = ids
      .map((id: any) => parseInt(id, 10))
      .filter((n) => !Number.isNaN(n));

    if (centrosIds.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Los IDs enviados no son válidos.",
        },
        { status: 400 }
      );
    }

    // ============================
    // 🎯 DETERMINAR ACCIÓN / ESTADO
    // ============================
    // estados válidos según tu tabla: 'activo','inactivo','suspendido'
    type EstadoCentro = "activo" | "inactivo" | "suspendido";

    let estadoDestino: EstadoCentro | null = null;

    switch (accion) {
      case "activar":
        estadoDestino = "activo";
        break;
      case "inactivar":
        estadoDestino = "inactivo";
        break;
      case "suspender":
        estadoDestino = "suspendido";
        break;
      case "cambiar_estado":
        if (!nuevo_estado) {
          return NextResponse.json(
            {
              success: false,
              error:
                "Debe enviar 'nuevo_estado' cuando la acción es 'cambiar_estado'.",
            },
            { status: 400 }
          );
        }
        if (!["activo", "inactivo", "suspendido"].includes(nuevo_estado)) {
          return NextResponse.json(
            {
              success: false,
              error:
                "El valor de 'nuevo_estado' no es válido. Use 'activo', 'inactivo' o 'suspendido'.",
            },
            { status: 400 }
          );
        }
        estadoDestino = nuevo_estado as EstadoCentro;
        break;
      default:
        return NextResponse.json(
          {
            success: false,
            error:
              "Acción no soportada. Use 'activar', 'inactivar', 'suspender' o 'cambiar_estado'.",
          },
          { status: 400 }
        );
    }

    if (!estadoDestino) {
      return NextResponse.json(
        {
          success: false,
          error: "No se pudo determinar el estado destino.",
        },
        { status: 400 }
      );
    }

    // ============================
    // 💾 ACTUALIZACIÓN EN BD
    // ============================
    const connection = await pool.getConnection();

    try {
      await connection.beginTransaction();

      // Construimos placeholders dinámicos: ?, ?, ?, ...
      const placeholders = centrosIds.map(() => "?").join(",");

      const [result] = await connection.query<ResultSetHeader>(
        `
          UPDATE centros_medicos
          SET estado = ?
          WHERE id_centro IN (${placeholders})
        `,
        [estadoDestino, ...centrosIds]
      );

      await connection.commit();

      console.log(
        "✅ Acciones masivas sobre centros:",
        accion,
        "Estado destino:",
        estadoDestino,
        "Filas afectadas:",
        result.affectedRows
      );

      return NextResponse.json(
        {
          success: true,
          message: "Acción masiva aplicada correctamente.",
          accion,
          estado_aplicado: estadoDestino,
          ids_enviados: centrosIds,
          filas_afectadas: result.affectedRows,
        },
        { status: 200 }
      );
    } catch (error: any) {
      await connection.rollback();
      console.error(
        "❌ Error en actualización masiva de centros:",
        error?.message || error
      );
      return NextResponse.json(
        {
          success: false,
          error: "Error al ejecutar la acción masiva sobre centros médicos.",
          details: error?.message,
        },
        { status: 500 }
      );
    } finally {
      connection.release();
    }
  } catch (error: any) {
    console.error(
      "❌ Error general en POST /api/admin/centros/acciones-masivas:",
      error
    );
    return NextResponse.json(
      {
        success: false,
        error: "Error interno en el endpoint de acciones masivas.",
        details: error?.message,
      },
      { status: 500 }
    );
  }
}
