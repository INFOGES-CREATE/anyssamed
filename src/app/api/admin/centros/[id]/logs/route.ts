// frontend/src/app/api/admin/centros/[id]/logs/route.ts
import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { RowDataPacket } from "mysql2";

// ============================================================================
// INTERFACES
// ============================================================================

interface LogRow extends RowDataPacket {
  id_log: number;
  id_usuario: number | null;
  fecha_hora: string;
  tipo: string;
  modulo: string;
  accion: string;
  descripcion: string;
  ip_origen: string | null;
  agente_usuario: string | null;
  objeto_tipo: string | null;
  objeto_id: string | null;
  datos_antiguos: string | null;
  datos_nuevos: string | null;
  exitoso: number;
  mensaje_error: string | null;
  nivel_severidad: number;
  usuario_nombre: string | null;
  usuario_email: string | null;
}

interface CountRow extends RowDataPacket {
  total: number;
}

// ============================================================================
// GET - OBTENER LOGS
// ============================================================================

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  let connection;
  
  try {
    console.log(`\n${"=".repeat(80)}`);
    console.log(`📋 GET /api/admin/centros/${params.id}/logs`);
    console.log(`⏰ ${new Date().toISOString()}`);
    console.log(`${"=".repeat(80)}\n`);

    const { searchParams } = new URL(request.url);

    // Parámetros de paginación
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "50")));
    const offset = (page - 1) * limit;

    // Parámetros de filtros
    const filtroTipo = searchParams.get("tipo") || "todos";
    const filtroNivel = searchParams.get("nivel") || "todos";

    console.log(`📄 Paginación: Página ${page}, Límite ${limit}, Offset ${offset}`);
    console.log(`🔍 Filtros: Tipo=${filtroTipo}, Nivel=${filtroNivel}`);

    // Obtener conexión del pool
    connection = await pool.getConnection();
    console.log(`✅ Conexión a BD obtenida`);

    // ========================================================================
    // CONSTRUCCIÓN DE WHERE CLAUSE
    // ========================================================================
    const whereConditions: string[] = [
      "l.objeto_tipo = ?",
      "l.objeto_id = ?"
    ];
    const queryParams: any[] = ["centro", params.id];

    // Filtro por tipo de acción
    if (filtroTipo !== "todos") {
      whereConditions.push("l.accion LIKE ?");
      queryParams.push(`%${filtroTipo}%`);
    }

    // Filtro por nivel
    if (filtroNivel !== "todos") {
      whereConditions.push("l.tipo = ?");
      queryParams.push(filtroNivel);
    }

    const whereClause = whereConditions.join(" AND ");
    console.log(`📝 WHERE: ${whereClause}`);
    console.log(`📊 Params:`, queryParams);

    // ========================================================================
    // QUERY 1: OBTENER LOGS
    // ========================================================================
    const logsQuery = `
      SELECT 
        l.id_log,
        l.id_usuario,
        l.fecha_hora,
        l.tipo,
        l.modulo,
        l.accion,
        l.descripcion,
        l.ip_origen,
        l.agente_usuario,
        l.objeto_tipo,
        l.objeto_id,
        l.datos_antiguos,
        l.datos_nuevos,
        l.exitoso,
        l.mensaje_error,
        l.nivel_severidad,
        COALESCE(
          CONCAT(u.nombre, ' ', u.apellido_paterno, ' ', COALESCE(u.apellido_materno, '')),
          'Sistema'
        ) as usuario_nombre,
        COALESCE(u.email, 'sistema@medicalcrm.cl') as usuario_email
      FROM logs_sistema l
      LEFT JOIN usuarios u ON l.id_usuario = u.id_usuario
      WHERE ${whereClause}
      ORDER BY l.fecha_hora DESC, l.id_log DESC
      LIMIT ? OFFSET ?
    `;

    console.log(`\n🔄 Ejecutando query de logs...`);
    const [logs] = await connection.query<LogRow[]>(
      logsQuery,
      [...queryParams, limit, offset]
    );
    console.log(`✅ ${logs.length} logs obtenidos`);

    // ========================================================================
    // QUERY 2: CONTAR TOTAL
    // ========================================================================
    const countQuery = `
      SELECT COUNT(*) as total
      FROM logs_sistema l
      WHERE ${whereClause}
    `;

    console.log(`\n🔢 Ejecutando query de conteo...`);
    const [countResult] = await connection.query<CountRow[]>(
      countQuery,
      queryParams
    );
    const total = countResult[0]?.total || 0;
    const totalPages = Math.ceil(total / limit);

    console.log(`📊 Total: ${total}, Páginas: ${totalPages}`);

    // ========================================================================
    // QUERY 3: ESTADÍSTICAS
    // ========================================================================
    const statsQuery = `
      SELECT 
        l.tipo,
        COUNT(*) as total
      FROM logs_sistema l
      WHERE ${whereClause}
      GROUP BY l.tipo
    `;

    console.log(`\n📈 Ejecutando query de estadísticas...`);
    const [stats] = await connection.query<RowDataPacket[]>(
      statsQuery,
      queryParams
    );

    const estadisticas = {
      info: stats.find((s) => s.tipo === "info")?.total || 0,
      warning: stats.find((s) => s.tipo === "warning")?.total || 0,
      error: stats.find((s) => s.tipo === "error")?.total || 0,
      security: stats.find((s) => s.tipo === "security")?.total || 0,
      audit: stats.find((s) => s.tipo === "audit")?.total || 0,
    };

    console.log(`📊 Estadísticas:`, estadisticas);

    // ========================================================================
    // FORMATEAR LOGS
    // ========================================================================
    const logsFormateados = logs.map((log) => {
      let datosAntiguos = null;
      let datosNuevos = null;

      // Parsear JSON de forma segura
      try {
        if (log.datos_antiguos) {
          datosAntiguos = typeof log.datos_antiguos === 'string' 
            ? JSON.parse(log.datos_antiguos) 
            : log.datos_antiguos;
        }
      } catch (e) {
        console.warn(`⚠️  Error parseando datos_antiguos del log ${log.id_log}`);
      }

      try {
        if (log.datos_nuevos) {
          datosNuevos = typeof log.datos_nuevos === 'string' 
            ? JSON.parse(log.datos_nuevos) 
            : log.datos_nuevos;
        }
      } catch (e) {
        console.warn(`⚠️  Error parseando datos_nuevos del log ${log.id_log}`);
      }

      return {
        id_log: log.id_log,
        id_usuario: log.id_usuario,
        accion: log.accion,
        tipo_accion: extraerTipoAccion(log.accion),
        descripcion: log.descripcion,
        usuario_nombre: (log.usuario_nombre || "Sistema").trim(),
        usuario_email: log.usuario_email || "sistema@medicalcrm.cl",
        ip_address: log.ip_origen || "N/A",
        user_agent: log.agente_usuario || "N/A",
        fecha_creacion: log.fecha_hora,
        datos_anteriores: datosAntiguos,
        datos_nuevos: datosNuevos,
        modulo: log.modulo,
        nivel: log.tipo,
        exitoso: log.exitoso === 1,
        mensaje_error: log.mensaje_error,
        nivel_severidad: log.nivel_severidad,
      };
    });

    // Liberar conexión
    connection.release();
    console.log(`✅ Conexión liberada`);

    console.log(`\n${"=".repeat(80)}`);
    console.log(`✅ Respuesta exitosa con ${logsFormateados.length} logs`);
    console.log(`${"=".repeat(80)}\n`);

    // ========================================================================
    // RESPUESTA
    // ========================================================================
    return NextResponse.json({
      success: true,
      data: logsFormateados,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
      estadisticas: {
        porTipo: estadisticas,
        totalRegistros: total,
      },
    });

  } catch (error: any) {
    console.error(`\n❌ ERROR CRÍTICO:`);
    console.error(`📛 Mensaje: ${error.message}`);
    console.error(`📍 Stack: ${error.stack}`);
    console.error(`🔧 SQL State: ${error.sqlState}`);
    console.error(`🔢 Error Code: ${error.code}`);
    console.error(`${"=".repeat(80)}\n`);

    // Liberar conexión en caso de error
    if (connection) {
      try {
        connection.release();
        console.log(`✅ Conexión liberada después del error`);
      } catch (releaseError) {
        console.error(`❌ Error al liberar conexión:`, releaseError);
      }
    }

    return NextResponse.json(
      {
        success: false,
        error: "Error al obtener logs del centro",
        details: process.env.NODE_ENV === "development" ? {
          message: error.message,
          code: error.code,
          sqlState: error.sqlState,
          stack: error.stack,
        } : undefined,
      },
      { status: 500 }
    );
  }
}

// ============================================================================
// FUNCIÓN AUXILIAR
// ============================================================================

function extraerTipoAccion(accion: string): string {
  const accionLower = accion.toLowerCase();

  if (accionLower.includes("crear") || accionLower.includes("registr")) return "crear";
  if (accionLower.includes("editar") || accionLower.includes("actualiz") || accionLower.includes("modific")) return "editar";
  if (accionLower.includes("eliminar") || accionLower.includes("borrar")) return "eliminar";
  if (accionLower.includes("activar")) return "activar";
  if (accionLower.includes("desactivar")) return "desactivar";
  if (accionLower.includes("suspender")) return "suspender";
  if (accionLower.includes("restaurar")) return "restaurar";
  if (accionLower.includes("login") || accionLower.includes("ingres")) return "login";
  if (accionLower.includes("logout") || accionLower.includes("cerrar")) return "logout";

  return "otro";
}
