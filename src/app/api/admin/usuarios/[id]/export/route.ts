// frontend/src/app/api/admin/usuarios/[id]/export/route.ts

import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { RowDataPacket } from "mysql2";
import { registrarLog } from "@/lib/logs";

// ───────────────────────────────────────────
// Tipos que ya usamos en otros endpoints
// ───────────────────────────────────────────
interface Usuario extends RowDataPacket {
  id_usuario: number;
  username: string;
  nombre: string;
  apellido_paterno: string;
  apellido_materno?: string;
  email: string;
  password_hash?: string;
  reset_token?: string;
  secret_2fa?: string;
  rut: string;
  telefono?: string;
  celular?: string;
  fecha_nacimiento?: string;
  genero?: string;
  direccion?: string;
  ciudad?: string;
  region?: string;
  id_centro_principal?: number;
  id_sucursal_principal?: number;
  foto_perfil_url?: string;
  requiere_cambio_password: boolean;
  autenticacion_doble_factor: boolean;
  estado: string;
  fecha_creacion: string;
  fecha_modificacion?: string;
  ultimo_login?: string;
  intentos_fallidos: number;
  created_by?: number;
  centro_nombre?: string;
  centro_direccion?: string;
  centro_estado?: string;
  sucursal_nombre?: string;
  sucursal_direccion?: string;
  sucursal_estado?: string;
  roles_ids?: string;
  roles_nombres?: string;
  roles_descripciones?: string;
  nombre_completo?: string;
  edad?: number;
}

interface Estadisticas extends RowDataPacket {
  total_citas: number;
  citas_completadas: number;
  citas_canceladas: number;
  total_logs: number;
  logs_error: number;
  ultima_actividad?: string;
}

interface Actividad extends RowDataPacket {
  fecha_hora: string;
  tipo: string;
  modulo: string;
  accion: string;
  descripcion: string;
  ip_origen: string;
  nivel_severidad?: number;
}

interface RolDetallado extends RowDataPacket {
  id_rol: number;
  nombre: string;
  descripcion: string;
  nivel_jerarquia: number;
  fecha_asignacion: string;
  id_centro?: number;
  id_sucursal?: number;
  centro_asignado?: string;
  sucursal_asignada?: string;
  asignado_por?: number;
  asignado_por_nombre?: string;
  rol_estado: string;
}

interface PermisoDetallado extends RowDataPacket {
  id_permiso: number;
  codigo: string;
  nombre: string;
  descripcion: string;
  modulo: string;
  tipo: string;
  es_critico: number;
}

interface HistorialEstadoUsuario extends RowDataPacket {
  fecha_hora: string;
  descripcion: string;
  datos_antiguos: any;
  datos_nuevos: any;
  ip_origen: string;
}

// ───────────────────────────────────────────
// Helpers locales (los mismos estilos que usas ya)
// ───────────────────────────────────────────
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

// quita hash, reset_token, secret_2fa etc.
function limpiarDatosSensibles(usuario: any): any {
  if (!usuario) return usuario;
  const u = { ...usuario };
  delete u.password_hash;
  delete u.reset_token;
  delete u.secret_2fa;
  return u;
}

// yyyyMMdd_HHmmss para el filename
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

// ───────────────────────────────────────────
// GET /api/admin/usuarios/[id]/export
// Genera un archivo JSON descargable con:
// - Perfil del usuario (sin campos sensibles)
// - Roles asignados
// - Permisos efectivos
// - Métricas básicas / actividad
// - Historial reciente de cambios de estado
// También registra log de auditoría
// ───────────────────────────────────────────
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  let connection;

  try {
    const idUsuario = parseInt(params.id);

    if (isNaN(idUsuario)) {
      return NextResponse.json(
        { success: false, error: "ID de usuario inválido" },
        { status: 400 }
      );
    }

    connection = await pool.getConnection();

    // 1. Datos principales del usuario
    const [usuarios] = await connection.query<Usuario[]>(
      `SELECT 
        u.*,
        GROUP_CONCAT(DISTINCT r.id_rol ORDER BY r.nivel_jerarquia DESC) AS roles_ids,
        GROUP_CONCAT(DISTINCT r.nombre ORDER BY r.nivel_jerarquia DESC SEPARATOR ', ') AS roles_nombres,
        GROUP_CONCAT(DISTINCT r.descripcion ORDER BY r.nivel_jerarquia DESC SEPARATOR ' | ') AS roles_descripciones,
        c.nombre AS centro_nombre,
        c.direccion AS centro_direccion,
        c.estado AS centro_estado,
        s.nombre AS sucursal_nombre,
        s.direccion AS sucursal_direccion,
        s.estado AS sucursal_estado,
        CONCAT(u.nombre, ' ', u.apellido_paterno, ' ', COALESCE(u.apellido_materno, '')) AS nombre_completo,
        TIMESTAMPDIFF(YEAR, u.fecha_nacimiento, CURDATE()) AS edad
      FROM usuarios u
      LEFT JOIN usuarios_roles ur
        ON u.id_usuario = ur.id_usuario AND ur.activo = 1
      LEFT JOIN roles r
        ON ur.id_rol = r.id_rol AND r.estado = 'activo'
      LEFT JOIN centros_medicos c
        ON u.id_centro_principal = c.id_centro
      LEFT JOIN sucursales s
        ON u.id_sucursal_principal = s.id_sucursal
      WHERE u.id_usuario = ?
      GROUP BY u.id_usuario`,
      [idUsuario]
    );

    if (usuarios.length === 0) {
      connection.release();
      return NextResponse.json(
        { success: false, error: "Usuario no encontrado" },
        { status: 404 }
      );
    }

    const usuario = usuarios[0];

    // 2. Estadísticas generales
    const [estadisticasRows] = await connection.query<Estadisticas[]>(
      `SELECT 
        COALESCE((SELECT COUNT(*) FROM citas WHERE id_paciente = ? OR id_medico = ?), 0) AS total_citas,
        COALESCE((SELECT COUNT(*) FROM citas WHERE (id_paciente = ? OR id_medico = ?) AND estado = 'completada'), 0) AS citas_completadas,
        COALESCE((SELECT COUNT(*) FROM citas WHERE (id_paciente = ? OR id_medico = ?) AND estado = 'cancelada'), 0) AS citas_canceladas,
        COALESCE((SELECT COUNT(*) FROM logs_sistema WHERE id_usuario = ?), 0) AS total_logs,
        COALESCE((SELECT COUNT(*) FROM logs_sistema WHERE id_usuario = ? AND tipo = 'error'), 0) AS logs_error,
        (SELECT fecha_hora FROM logs_sistema WHERE id_usuario = ? ORDER BY fecha_hora DESC LIMIT 1) AS ultima_actividad
      `,
      [
        idUsuario,
        idUsuario,
        idUsuario,
        idUsuario,
        idUsuario,
        idUsuario,
        idUsuario,
        idUsuario,
        idUsuario,
      ]
    );

    const estadisticas = estadisticasRows?.[0] || {
      total_citas: 0,
      citas_completadas: 0,
      citas_canceladas: 0,
      total_logs: 0,
      logs_error: 0,
      ultima_actividad: null,
    };

    // 3. Últimas actividades (logs recientes)
    const [actividades] = await connection.query<Actividad[]>(
      `SELECT 
        fecha_hora,
        tipo,
        modulo,
        accion,
        descripcion,
        ip_origen,
        nivel_severidad
      FROM logs_sistema
      WHERE id_usuario = ?
      ORDER BY fecha_hora DESC
      LIMIT 20`,
      [idUsuario]
    );

    // 4. Roles detallados
    const [rolesDetallados] = await connection.query<RolDetallado[]>(
      `SELECT 
        r.id_rol,
        r.nombre,
        r.descripcion,
        r.nivel_jerarquia,
        r.estado AS rol_estado,
        ur.fecha_asignacion,
        ur.id_centro,
        ur.id_sucursal,
        ur.asignado_por,
        c.nombre AS centro_asignado,
        s.nombre AS sucursal_asignada,
        CONCAT(ua.nombre, ' ', ua.apellido_paterno) AS asignado_por_nombre
      FROM usuarios_roles ur
      INNER JOIN roles r ON ur.id_rol = r.id_rol
      LEFT JOIN centros_medicos c ON ur.id_centro = c.id_centro
      LEFT JOIN sucursales s ON ur.id_sucursal = s.id_sucursal
      LEFT JOIN usuarios ua ON ur.asignado_por = ua.id_usuario
      WHERE ur.id_usuario = ? AND ur.activo = 1 AND r.estado = 'activo'
      ORDER BY r.nivel_jerarquia DESC`,
      [idUsuario]
    );

    // 5. Permisos efectivos (merge de todos los roles activos)
    const [permisos] = await connection.query<PermisoDetallado[]>(
      `SELECT DISTINCT
        p.id_permiso,
        p.codigo,
        p.nombre,
        p.descripcion,
        p.modulo,
        p.tipo,
        p.es_critico
      FROM permisos p
      INNER JOIN roles_permisos rp ON p.id_permiso = rp.id_permiso
      INNER JOIN usuarios_roles ur ON rp.id_rol = ur.id_rol
      WHERE ur.id_usuario = ?
        AND ur.activo = 1
        AND p.estado = 'activo'
      ORDER BY p.modulo, p.nombre`,
      [idUsuario]
    );

    // 6. Historial de cambios de estado / seguridad últimos 10
    const [historialEstados] = await connection.query<HistorialEstadoUsuario[]>(
      `SELECT 
        fecha_hora,
        descripcion,
        datos_antiguos,
        datos_nuevos,
        ip_origen
      FROM logs_sistema
      WHERE id_usuario = ?
        AND modulo = 'usuarios'
        AND accion IN (
          'cambiar_estado',
          'bloquear_usuario',
          'desbloquear_usuario',
          'editar_usuario',
          'terminar_sesiones',
          'habilitar_2fa',
          'deshabilitar_2fa',
          'generar_reset_password'
        )
      ORDER BY fecha_hora DESC
      LIMIT 10`,
      [idUsuario]
    );

    connection.release();

    // 7. Armamos el payload exportable
    const exportPayload = {
      metadata: {
        generado_en: new Date().toISOString(),
        generado_por_admin_id: 1, // TODO: admin actual desde sesión
        ip_admin: obtenerIP(request),
        user_agent_admin: obtenerUserAgent(request),
        version: 1,
      },
      usuario: limpiarDatosSensibles(usuario),
      estadisticas,
      roles_detallados: rolesDetallados,
      permisos,
      ultimas_actividades: actividades,
      historial_estados: historialEstados,
    };

    // 8. Registramos log de auditoría de exportación
    await registrarLog({
      id_usuario: 1, // TODO: admin actual desde sesión
      tipo: "audit",
      modulo: "usuarios",
      accion: "exportar_usuario",
      descripcion: `Export de datos del usuario ID ${idUsuario} (${usuario.username}) generado.`,
      objeto_tipo: "usuario",
      objeto_id: String(idUsuario),
      datos_antiguos: null,
      datos_nuevos: {
        campos_incluidos: Object.keys(exportPayload),
      },
      ip_origen: obtenerIP(request),
      agente_usuario: obtenerUserAgent(request),
      nivel_severidad: 4,
    });

    // 9. Lo devolvemos como archivo descargable .json
    const filename = `usuario_${idUsuario}_${timestampFilename()}.json`;

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

    console.error("❌ Error al exportar usuario:", error);

    // intentamos registrar el error también
    await registrarLog({
      id_usuario: null,
      tipo: "error",
      modulo: "usuarios",
      accion: "exportar_usuario",
      descripcion: `Error exportando usuario ID ${params.id}: ${error.message}`,
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
        error: "No se pudo exportar la información del usuario",
        detalle: error.message,
      },
      { status: 500 }
    );
  }
}
