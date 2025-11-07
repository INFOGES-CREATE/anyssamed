// frontend/src/app/api/admin/usuarios/[id]/logs/export/route.ts

import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { RowDataPacket } from "mysql2";
import { registrarLog } from "@/lib/logs";

// ===============================================
// Tipos
// ===============================================
interface LogSistema extends RowDataPacket {
  id_log: number;
  id_usuario: number | null;
  fecha_hora: string;
  tipo: "info" | "warning" | "error" | "security" | "audit";
  modulo: string;
  accion: string;
  descripcion: string;
  ip_origen: string | null;
  agente_usuario: string | null;
  objeto_tipo: string | null;
  objeto_id: string | null;
  datos_antiguos: any;
  datos_nuevos: any;
  exitoso: number;
  nivel_severidad: number;
}

interface UsuarioBasico extends RowDataPacket {
  id_usuario: number;
  username: string;
  nombre: string;
  apellido_paterno: string;
  apellido_materno?: string;
  rut: string;
  estado: string;
}

// ===============================================
// Helpers
// ===============================================
function obtenerIP(request: NextRequest): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0] ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}

function obtenerUserAgent(request: NextRequest): string {
  return request.headers.get("user-agent") || "unknown";
}

// yyyyMMdd_HHmmss => para filename
function timestampFilename() {
  const d = new Date();
  const yyyy = d.getFullYear().toString().padStart(4, "0");
  const MM = (d.getMonth() + 1).toString().padStart(2, "0");
  const dd = d.getDate().toString().padStart(2, "0");
  const hh = d.getHours().toString().padStart(2, "0");
  const mm = d.getMinutes().toString().padStart(2, "0");
  const ss = d.getSeconds().toString().padStart(2, "0");
  return `${yyyy}${MM}${dd}_${hh}${mm}${ss}`;
}

// ===============================================
// GET /api/admin/usuarios/[id]/logs/export
// ===============================================
//
// Devuelve archivo descargable con:
// - metadata de export
// - info básica del usuario
// - logs_sistema recientes del usuario (por defecto 500, ?limit=1000 etc)
//
// Notas de seguridad:
// - No modificamos datos, solo lectura
// - Registramos en logs_sistema que se exportaron logs de este usuario
//
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  let connection;

  try {
    // -------------------------
    // 1. validar ID usuario
    // -------------------------
    const idUsuario = parseInt(params.id);
    if (isNaN(idUsuario)) {
      return NextResponse.json(
        { success: false, error: "ID de usuario inválido" },
        { status: 400 }
      );
    }

    // -------------------------
    // 2. leer query param ?limit=
    //    por defecto: 500
    //    máx: 5000 para no matar la DB
    // -------------------------
    const searchParams = request.nextUrl.searchParams;
    const limitParam = searchParams.get("limit");
    let limit = 500;
    if (limitParam) {
      const parsed = parseInt(limitParam);
      if (!isNaN(parsed) && parsed > 0) {
        limit = parsed;
      }
    }
    if (limit > 5000) {
      limit = 5000;
    }

    connection = await pool.getConnection();

    // -------------------------
    // 3. Traer info básica del usuario para el header del export
    // -------------------------
    const [usuarioRows] = await connection.query<UsuarioBasico[]>(
      `SELECT 
        u.id_usuario,
        u.username,
        u.nombre,
        u.apellido_paterno,
        u.apellido_materno,
        u.rut,
        u.estado
      FROM usuarios u
      WHERE u.id_usuario = ?
      LIMIT 1`,
      [idUsuario]
    );

    if (usuarioRows.length === 0) {
      connection.release();
      return NextResponse.json(
        { success: false, error: "Usuario no encontrado" },
        { status: 404 }
      );
    }

    const usuarioInfo = usuarioRows[0];

    // -------------------------
    // 4. Obtener logs del sistema para este usuario
    // -------------------------
    // IMPORTANTE:
    // - Incluimos TODO lo relevante a auditoría
    // - datos_antiguos / datos_nuevos salen RAW desde DB (JSON en MySQL)
    // - Orden: más reciente primero
    //
    const [logs] = await connection.query<LogSistema[]>(
      `SELECT
        id_log,
        id_usuario,
        fecha_hora,
        tipo,
        modulo,
        accion,
        descripcion,
        ip_origen,
        agente_usuario,
        objeto_tipo,
        objeto_id,
        datos_antiguos,
        datos_nuevos,
        exitoso,
        nivel_severidad
      FROM logs_sistema
      WHERE id_usuario = ?
      ORDER BY fecha_hora DESC, id_log DESC
      LIMIT ?`,
      [idUsuario, limit]
    );

    connection.release();

    // -------------------------
    // 5. Construir payload de export
    // -------------------------
    const exportPayload = {
      metadata: {
        generado_en_iso: new Date().toISOString(),
        generado_por_admin_id: 1, // TODO: ID admin real (sesión)
        ip_admin: obtenerIP(request),
        user_agent_admin: obtenerUserAgent(request),
        version: 1,
        limite_registros: limit,
      },
      usuario: {
        id_usuario: usuarioInfo.id_usuario,
        username: usuarioInfo.username,
        nombre: usuarioInfo.nombre,
        apellido_paterno: usuarioInfo.apellido_paterno,
        apellido_materno: usuarioInfo.apellido_materno || null,
        rut: usuarioInfo.rut,
        estado: usuarioInfo.estado,
        nombre_completo: `${usuarioInfo.nombre} ${usuarioInfo.apellido_paterno}${
          usuarioInfo.apellido_materno ? " " + usuarioInfo.apellido_materno : ""
        }`,
      },
      logs: logs.map((log) => ({
        id_log: log.id_log,
        fecha_hora: log.fecha_hora,
        tipo: log.tipo,
        modulo: log.modulo,
        accion: log.accion,
        descripcion: log.descripcion,
        ip_origen: log.ip_origen,
        agente_usuario: log.agente_usuario,
        objeto: {
          tipo: log.objeto_tipo,
          id: log.objeto_id,
        },
        cambio: {
          antes: log.datos_antiguos || null,
          despues: log.datos_nuevos || null,
        },
        exitoso: !!log.exitoso,
        nivel_severidad: log.nivel_severidad,
      })),
    };

    // -------------------------
    // 6. Registrar en logs_sistema que hicimos export
    // -------------------------
    await registrarLog({
      id_usuario: 1, // TODO: admin de sesión
      tipo: "audit",
      modulo: "usuarios",
      accion: "exportar_logs_usuario",
      descripcion: `Export de logs para usuario ID ${idUsuario} (username: ${usuarioInfo.username}) con límite ${limit}`,
      objeto_tipo: "usuario",
      objeto_id: idUsuario.toString(),
      datos_antiguos: null,
      datos_nuevos: {
        registros_exportados: logs.length,
        limite: limit,
      },
      ip_origen: obtenerIP(request),
      agente_usuario: obtenerUserAgent(request),
      nivel_severidad: 4,
    });

    // -------------------------
    // 7. Devolver como archivo descargable .json
    // -------------------------
    const filename = `usuario_${idUsuario}_logs_${timestampFilename()}.json`;

    return new NextResponse(JSON.stringify(exportPayload, null, 2), {
      status: 200,
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error: any) {
    if (connection) {
      connection.release();
    }

    console.error("❌ Error al exportar logs del usuario:", error);

    // intento registrar el error también
    await registrarLog({
      id_usuario: null,
      tipo: "error",
      modulo: "usuarios",
      accion: "exportar_logs_usuario",
      descripcion: `Error al exportar logs del usuario ID ${params.id}: ${error.message}`,
      objeto_tipo: "usuario",
      objeto_id: params.id,
      datos_antiguos: null,
      datos_nuevos: null,
      ip_origen: obtenerIP(request),
      agente_usuario: obtenerUserAgent(request),
      nivel_severidad: 9,
    });

    return NextResponse.json(
      {
        success: false,
        error: "No se pudo exportar el historial de actividad del usuario",
        detalle: error.message,
      },
      { status: 500 }
    );
  }
}
