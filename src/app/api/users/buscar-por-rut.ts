// frontend/src/app/api/admin/usuarios/buscar-por-rut/route.ts
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { RowDataPacket } from "mysql2";
import { registrarLog } from "@/lib/logs";

// ============================================================================
// Helpers para RUT (limpiar y formatear)
// ============================================================================
function limpiarRut(rut: string): string {
  // Deja solo dígitos y k/K
  return rut.replace(/[^0-9kK]/g, "").toLowerCase();
}

function formatearRut(rut: string): string {
  const limpio = limpiarRut(rut);
  if (limpio.length < 2) return rut;

  const cuerpo = limpio.slice(0, -1);
  const dv = limpio.slice(-1).toUpperCase();
  return `${cuerpo}-${dv}`;
}

// ============================================================================
// GET - BUSCAR USUARIO POR RUT (robusto, con tu tabla `usuarios` real)
// ============================================================================
export async function GET(request: NextRequest) {
  let connection;

  try {
    const { searchParams } = new URL(request.url);
    const rutParamRaw = (searchParams.get("rut") || "").trim();

    if (!rutParamRaw) {
      return NextResponse.json(
        {
          success: false,
          error: "El parámetro 'rut' es obligatorio",
        },
        { status: 400 }
      );
    }

    // Versión normalizada que usamos para comparar
    const rutNormalizadoIndex = limpiarRut(rutParamRaw);

    if (rutNormalizadoIndex.length < 2) {
      return NextResponse.json(
        {
          success: false,
          error: "RUT inválido (muy corto o sin dígito verificador)",
        },
        { status: 400 }
      );
    }

    connection = await pool.getConnection();

    // IMPORTANTE:
    // - Comparamos por:
    //   1) RUT tal como está guardado (ignorando mayúsculas)
    //   2) RUT sin puntos, sin guion, sin espacios
    //
    // Así cubrimos:
    //   "26.235.507-1"
    //   "26235507-1"
    //   "26 235 507-1"
    //   etc.
    const [rows] = await connection.query<RowDataPacket[]>(
      `
      SELECT
        u.id_usuario,
        u.username            AS nombre_usuario,
        u.nombre              AS nombres,
        CONCAT(u.apellido_paterno, ' ', COALESCE(u.apellido_materno, '')) AS apellidos,
        u.email,
        u.email               AS correo,
        u.rut,
        u.foto_perfil_url     AS foto_perfil
      FROM usuarios u
      WHERE
        LOWER(TRIM(u.rut)) = LOWER(TRIM(?))
        OR REPLACE(REPLACE(REPLACE(LOWER(TRIM(u.rut)), '.', ''), '-', ''), ' ', '') = ?
      LIMIT 1
      `,
      [
        rutParamRaw,          // comparación "tal cual" (solo case-insensitive)
        rutNormalizadoIndex,  // comparación sin puntos, sin guion, sin espacios
      ]
    );

    connection.release();
    connection = undefined;

    let usuario: any = rows[0] || null;
    let rutFormateado: string | null = null;

    if (usuario && usuario.rut) {
      rutFormateado = formatearRut(String(usuario.rut));
      usuario.rut = rutFormateado;
      usuario.rut_normalizado = rutFormateado;
    }

    const ipOrigen =
      request.headers.get("x-forwarded-for") ||
      request.headers.get("x-real-ip") ||
      "unknown";
    const agenteUsuario = request.headers.get("user-agent") || "unknown";

    await registrarLog({
      tipo: "info",
      modulo: "usuarios",
      accion: "buscar_por_rut",
      descripcion: `Búsqueda de usuario por RUT ${
        rutFormateado || rutParamRaw
      } - ${usuario ? "encontrado" : "no encontrado"}`,
      ip_origen: ipOrigen,
      agente_usuario: agenteUsuario,
      exitoso: true,
      nivel_severidad: 3,
    });

    return NextResponse.json({
      success: true,
      rut_busqueda: rutParamRaw,
      rut_normalizado_index: rutNormalizadoIndex,
      usuario: usuario || null,
    });
  } catch (error: any) {
    if (connection) {
      connection.release();
    }

    console.error("Error al buscar usuario por RUT:", error);

    try {
      await registrarLog({
        tipo: "error",
        modulo: "usuarios",
        accion: "buscar_por_rut",
        descripcion: "Error al buscar usuario por RUT",
        mensaje_error: error.message,
        exitoso: false,
        nivel_severidad: 8,
      });
    } catch (e) {
      console.error("Error al registrar log de error en buscar_por_rut:", e);
    }

    return NextResponse.json(
      {
        success: false,
        error: "Error al buscar usuario por RUT",
        detalles: error.message,
      },
      { status: 500 }
    );
  }
}
