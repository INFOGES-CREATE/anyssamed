// frontend/src/app/api/admin/usuarios/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { RowDataPacket, ResultSetHeader } from "mysql2";
import { registrarLog } from "@/lib/logs";
import crypto from "crypto";
import bcrypt from "bcryptjs";

// ============================================================================
// ⚙️ CONFIG / CONSTANTES
// ============================================================================

// TODO: reemplazar esto con el ID real del usuario autenticado (session / JWT)
const ADMIN_USER_ID_FALLBACK = 1;
const BCRYPT_ROUNDS = 12;

// ============================================================================
// 📚 INTERFACES
// ============================================================================

interface Usuario extends RowDataPacket {
  id_usuario: number;
  username: string;
  nombre: string;
  apellido_paterno: string;
  apellido_materno?: string | null;
  email: string;
  password_hash?: string;
  reset_token?: string | null;
  reset_token_expiry?: string | null;
  secret_2fa?: string | null;
  rut: string;
  telefono?: string | null;
  celular?: string | null;
  fecha_nacimiento?: string | null;
  genero?: string | null;
  direccion?: string | null;
  ciudad?: string | null;
  region?: string | null;
  id_centro_principal?: number | null;
  id_sucursal_principal?: number | null;
  foto_perfil_url?: string | null;
  requiere_cambio_password: number; // TINYINT(1)
  autenticacion_doble_factor: number; // TINYINT(1)
  estado: string;
  fecha_creacion: string;
  fecha_modificacion?: string | null;
  ultimo_login?: string | null;
  intentos_fallidos: number;
  created_by?: number | null;
}

interface Estadisticas extends RowDataPacket {
  total_citas: number;
  citas_completadas: number;
  citas_canceladas: number;
  total_logs: number;
  logs_error: number;
  ultima_actividad?: string | null;
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
  id_centro?: number | null;
  id_sucursal?: number | null;
  centro_asignado?: string | null;
  sucursal_asignada?: string | null;
  asignado_por?: number | null;
  asignado_por_nombre?: string | null;
  rol_estado: string;
}

interface PermisoConsolidado extends RowDataPacket {
  id_permiso: number;
  codigo: string;
  nombre: string;
  descripcion: string;
  modulo: string;
  tipo: string;
  es_critico: number;
}

interface UpdateUsuarioBody {
  username?: string;
  nombre?: string;
  apellido_paterno?: string;
  apellido_materno?: string;
  email?: string;
  rut?: string;
  telefono?: string;
  celular?: string;
  fecha_nacimiento?: string;
  genero?: string;
  direccion?: string;
  ciudad?: string;
  region?: string;
  id_centro_principal?: number | null;
  id_sucursal_principal?: number | null;
  roles?: number[];
  foto_perfil_url?: string;
  requiere_cambio_password?: boolean;
  autenticacion_doble_factor?: boolean;
  estado?: string;
}

// ============================================================================
// 🔐 INTERFACES SEGURIDAD (POST /acciones)
// ============================================================================

interface AccionSeguridadBody {
  action:
    | "toggle_2fa"
    | "reset_password"
    | "force_password_change"
    | "send_reset_link"
    | "block_user"
    | "unblock_user"
    | "reset_failed_attempts";

  // toggle_2fa
  enable?: boolean;

  // reset_password
  new_password?: string;
  force_change?: boolean;

  // block_user
  motivo?: string;
  detalles?: string;
  fecha_expiracion?: string; // ISO datetime opcional
}

// ============================================================================
// 🛠 FUNCIONES AUXILIARES
// ============================================================================

function obtenerIP(request: NextRequest): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}

function obtenerUserAgent(request: NextRequest): string {
  return request.headers.get("user-agent") || "unknown";
}

function limpiarDatosSensibles<T extends Record<string, any>>(usuario: T): T {
  const usuarioLimpio = { ...usuario };
  delete usuarioLimpio.password_hash;
  delete usuarioLimpio.reset_token;
  delete usuarioLimpio.reset_token_expiry;
  delete usuarioLimpio.secret_2fa;
  return usuarioLimpio;
}

function validarEmail(email: string): boolean {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

// Validador de RUT chileno
function validarRUT(rut: string): boolean {
  const rutLimpio = rut.replace(/[^0-9kK]/g, "");
  if (rutLimpio.length < 2) return false;

  const cuerpo = rutLimpio.slice(0, -1);
  const dv = rutLimpio.slice(-1).toUpperCase();

  let suma = 0;
  let multiplicador = 2;

  for (let i = cuerpo.length - 1; i >= 0; i--) {
    suma += parseInt(cuerpo[i]) * multiplicador;
    multiplicador = multiplicador === 7 ? 2 : multiplicador + 1;
  }

  const dvEsperado = 11 - (suma % 11);
  const dvCalculado =
    dvEsperado === 11 ? "0" : dvEsperado === 10 ? "K" : dvEsperado.toString();

  return dv === dvCalculado;
}

// Generar token seguro aleatorio (reset password / 2FA secret / etc)
function generarTokenSeguro(bytes = 32): string {
  return crypto.randomBytes(bytes).toString("hex");
}

// Password temporal segura tipo "W9f$A3kQ..."
function generarPasswordTemporal(longitud = 12): string {
  const chars =
    "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%^&*";
  const bytes = crypto.randomBytes(longitud);
  let pass = "";
  for (let i = 0; i < longitud; i++) {
    pass += chars[bytes[i] % chars.length];
  }
  return pass;
}

// ============================================================================
// GET - OBTENER DETALLE COMPLETO DEL USUARIO
// ============================================================================

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

    // ========== 1. DATOS PRINCIPALES DEL USUARIO ==========
    const [usuarios] = await connection.query<Usuario[] & RowDataPacket[]>(
      `SELECT 
        u.*,
        GROUP_CONCAT(DISTINCT r.id_rol ORDER BY r.nivel_jerarquia DESC) AS roles_ids,
        GROUP_CONCAT(DISTINCT r.nombre ORDER BY r.nivel_jerarquia DESC SEPARATOR ', ') AS roles_nombres,
        GROUP_CONCAT(DISTINCT r.descripcion ORDER BY r.nivel_jerarquia DESC SEPARATOR ' | ') AS roles_descripciones,
        c.nombre        AS centro_nombre,
        c.direccion     AS centro_direccion,
        c.telefono_principal AS centro_telefono,
        c.email_contacto     AS centro_email,
        c.estado        AS centro_estado,
        s.nombre        AS sucursal_nombre,
        s.direccion     AS sucursal_direccion,
        s.estado        AS sucursal_estado,
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

    // ========== 2. OBTENER IDS ASOCIADOS A ESTE USUARIO ==========
    // Puede ser médico y/o paciente
    const [medicoRows] = await connection.query<RowDataPacket[]>(
      "SELECT id_medico FROM medicos WHERE id_usuario = ? LIMIT 1",
      [idUsuario]
    );
    const [pacienteRows] = await connection.query<RowDataPacket[]>(
      "SELECT id_paciente FROM pacientes WHERE id_usuario = ? LIMIT 1",
      [idUsuario]
    );

    const idMedico = medicoRows.length ? medicoRows[0].id_medico : null;
    const idPaciente = pacienteRows.length ? pacienteRows[0].id_paciente : null;

    // ========== 3. ESTADÍSTICAS ==========
    const [estadisticas] = await connection.query<Estadisticas[]>(
      `SELECT 
        (SELECT COUNT(*) 
           FROM citas 
          WHERE (id_medico = ? OR id_paciente = ?)
        ) AS total_citas,
        (SELECT COUNT(*) 
           FROM citas 
          WHERE (id_medico = ? OR id_paciente = ?)
            AND estado = 'completada'
        ) AS citas_completadas,
        (SELECT COUNT(*) 
           FROM citas 
          WHERE (id_medico = ? OR id_paciente = ?)
            AND estado = 'cancelada'
        ) AS citas_canceladas,
        (SELECT COUNT(*) 
           FROM logs_sistema 
          WHERE id_usuario = ?
        ) AS total_logs,
        (SELECT COUNT(*) 
           FROM logs_sistema 
          WHERE id_usuario = ?
            AND tipo = 'error'
        ) AS logs_error,
        (SELECT fecha_hora 
           FROM logs_sistema 
          WHERE id_usuario = ?
          ORDER BY fecha_hora DESC 
          LIMIT 1
        ) AS ultima_actividad
      `,
      [
        idMedico ?? null,
        idPaciente ?? null,
        idMedico ?? null,
        idPaciente ?? null,
        idMedico ?? null,
        idPaciente ?? null,
        idUsuario,
        idUsuario,
        idUsuario,
      ]
    );

    // ========== 4. ÚLTIMAS ACTIVIDADES ==========
    const [ultimasActividades] = await connection.query<Actividad[]>(
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

    // ========== 5. ROLES DETALLADOS ==========
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
      INNER JOIN roles r 
        ON ur.id_rol = r.id_rol
      LEFT JOIN centros_medicos c 
        ON ur.id_centro = c.id_centro
      LEFT JOIN sucursales s 
        ON ur.id_sucursal = s.id_sucursal
      LEFT JOIN usuarios ua 
        ON ur.asignado_por = ua.id_usuario
      WHERE ur.id_usuario = ?
        AND ur.activo = 1
        AND r.estado = 'activo'
      ORDER BY r.nivel_jerarquia DESC`,
      [idUsuario]
    );

    // ========== 6. PERMISOS CONSOLIDADOS ==========
    const [permisos] = await connection.query<PermisoConsolidado[]>(
      `SELECT DISTINCT
        p.id_permiso,
        p.codigo,
        p.nombre,
        p.descripcion,
        p.modulo,
        p.tipo,
        p.es_critico
      FROM permisos p
      INNER JOIN roles_permisos rp 
        ON p.id_permiso = rp.id_permiso
      INNER JOIN usuarios_roles ur 
        ON rp.id_rol = ur.id_rol
      WHERE ur.id_usuario = ?
        AND ur.activo = 1
        AND p.estado = 'activo'
      ORDER BY p.modulo, p.nombre`,
      [idUsuario]
    );

    // ========== 7. HISTORIAL DE ESTADO / SEGURIDAD ==========
    const [historialEstados] = await connection.query<RowDataPacket[]>(
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
          'activar_2fa',
          'desactivar_2fa',
          'reset_password_admin'
        )
      ORDER BY fecha_hora DESC
      LIMIT 10`,
      [idUsuario]
    );

    connection.release();

    // ========== 8. LIMPIAR DATOS SENSIBLES ==========
    const usuarioLimpio = limpiarDatosSensibles(usuario);

    // ========== 9. RESPUESTA ==========
    return NextResponse.json({
      success: true,
      data: {
        ...usuarioLimpio,
        estadisticas:
          estadisticas[0] || {
            total_citas: 0,
            citas_completadas: 0,
            citas_canceladas: 0,
            total_logs: 0,
            logs_error: 0,
            ultima_actividad: null,
          },
        ultimas_actividades: ultimasActividades,
        roles_detallados: rolesDetallados,
        permisos: permisos,
        historial_estados: historialEstados,
      },
    });
  } catch (error: any) {
    if (connection) connection.release();
    console.error("❌ Error al obtener usuario:", error);

    await registrarLog({
      id_usuario: null,
      tipo: "error",
      modulo: "usuarios",
      accion: "obtener_usuario",
      descripcion: `Error al obtener usuario ID ${params.id}: ${error.message}`,
      nivel_severidad: 7,
      ip_origen: obtenerIP(request),
      agente_usuario: obtenerUserAgent(request),
    });

    return NextResponse.json(
      {
        success: false,
        error: "Error al obtener usuario",
        detalles: error.message,
      },
      { status: 500 }
    );
  }
}

// ============================================================================
// PUT - ACTUALIZAR DATOS GENERALES DEL USUARIO
// ============================================================================

export async function PUT(
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

    const body: UpdateUsuarioBody = await request.json();
    const {
      username,
      nombre,
      apellido_paterno,
      apellido_materno,
      email,
      rut,
      telefono,
      celular,
      fecha_nacimiento,
      genero,
      direccion,
      ciudad,
      region,
      id_centro_principal,
      id_sucursal_principal,
      roles,
      foto_perfil_url,
      requiere_cambio_password,
      autenticacion_doble_factor,
      estado,
    } = body;

    // ========== VALIDACIONES BÁSICAS ==========
    if (!nombre || !apellido_paterno || !email || !username || !rut) {
      return NextResponse.json(
        {
          success: false,
          error: "Faltan campos obligatorios",
          campos_requeridos: [
            "nombre",
            "apellido_paterno",
            "email",
            "username",
            "rut",
          ],
        },
        { status: 400 }
      );
    }

    if (!validarEmail(email)) {
      return NextResponse.json(
        { success: false, error: "Formato de email inválido" },
        { status: 400 }
      );
    }

    if (!validarRUT(rut)) {
      return NextResponse.json(
        { success: false, error: "RUT inválido" },
        { status: 400 }
      );
    }

    if (!/^[a-zA-Z0-9._-]+$/.test(username)) {
      return NextResponse.json(
        {
          success: false,
          error:
            "El username solo puede contener letras, números, puntos, guiones y guiones bajos",
        },
        { status: 400 }
      );
    }

    connection = await pool.getConnection();
    await connection.beginTransaction();

    // ========== OBTENER DATOS ANTIGUOS ==========
    const [usuariosAntiguos] = await connection.query<Usuario[]>(
      "SELECT * FROM usuarios WHERE id_usuario = ?",
      [idUsuario]
    );

    if (usuariosAntiguos.length === 0) {
      await connection.rollback();
      connection.release();
      return NextResponse.json(
        { success: false, error: "Usuario no encontrado" },
        { status: 404 }
      );
    }

    const usuarioAntiguo = usuariosAntiguos[0];

    // ========== VALIDAR DUPLICADOS ==========
    if (username && username !== usuarioAntiguo.username) {
      const [existeUsername] = await connection.query<RowDataPacket[]>(
        "SELECT id_usuario FROM usuarios WHERE username = ? AND id_usuario != ?",
        [username, idUsuario]
      );
      if (existeUsername.length > 0) {
        await connection.rollback();
        connection.release();
        return NextResponse.json(
          {
            success: false,
            error: "El nombre de usuario ya está registrado por otro usuario",
          },
          { status: 400 }
        );
      }
    }

    if (email && email !== usuarioAntiguo.email) {
      const [existeEmail] = await connection.query<RowDataPacket[]>(
        "SELECT id_usuario FROM usuarios WHERE email = ? AND id_usuario != ?",
        [email, idUsuario]
      );
      if (existeEmail.length > 0) {
        await connection.rollback();
        connection.release();
        return NextResponse.json(
          {
            success: false,
            error: "El email ya está registrado por otro usuario",
          },
          { status: 400 }
        );
      }
    }

    if (rut && rut !== usuarioAntiguo.rut) {
      const [existeRut] = await connection.query<RowDataPacket[]>(
        "SELECT id_usuario FROM usuarios WHERE rut = ? AND id_usuario != ?",
        [rut, idUsuario]
      );
      if (existeRut.length > 0) {
        await connection.rollback();
        connection.release();
        return NextResponse.json(
          { success: false, error: "El RUT ya está registrado por otro usuario" },
          { status: 400 }
        );
      }
    }

    // ========== CENTRO Y SUCURSAL ==========
    if (id_centro_principal) {
      const [centroExiste] = await connection.query<RowDataPacket[]>(
        "SELECT id_centro FROM centros_medicos WHERE id_centro = ? AND estado = 'activo'",
        [id_centro_principal]
      );

      if (centroExiste.length === 0) {
        await connection.rollback();
        connection.release();
        return NextResponse.json(
          {
            success: false,
            error: "El centro médico no existe o no está activo",
          },
          { status: 400 }
        );
      }
    }

    if (id_sucursal_principal && id_centro_principal) {
      const [sucursalExiste] = await connection.query<RowDataPacket[]>(
        "SELECT id_sucursal FROM sucursales WHERE id_sucursal = ? AND id_centro = ? AND estado = 'activo'",
        [id_sucursal_principal, id_centro_principal]
      );

      if (sucursalExiste.length === 0) {
        await connection.rollback();
        connection.release();
        return NextResponse.json(
          {
            success: false,
            error:
              "La sucursal no existe, no pertenece al centro o no está activa",
          },
          { status: 400 }
        );
      }
    }

    // ========== ACTUALIZAR USUARIO ==========
    await connection.query<ResultSetHeader>(
      `UPDATE usuarios SET
        username = ?,
        nombre = ?,
        apellido_paterno = ?,
        apellido_materno = ?,
        email = ?,
        rut = ?,
        telefono = ?,
        celular = ?,
        fecha_nacimiento = ?,
        genero = ?,
        direccion = ?,
        ciudad = ?,
        region = ?,
        id_centro_principal = ?,
        id_sucursal_principal = ?,
        foto_perfil_url = ?,
        requiere_cambio_password = ?,
        autenticacion_doble_factor = ?,
        estado = ?,
        fecha_modificacion = NOW()
      WHERE id_usuario = ?`,
      [
        username,
        nombre,
        apellido_paterno,
        apellido_materno || null,
        email,
        rut,
        telefono || null,
        celular || null,
        fecha_nacimiento || null,
        genero || null,
        direccion || null,
        ciudad || null,
        region || null,
        id_centro_principal || null,
        id_sucursal_principal || null,
        foto_perfil_url || null,
        requiere_cambio_password ? 1 : 0,
        autenticacion_doble_factor ? 1 : 0,
        estado || usuarioAntiguo.estado,
        idUsuario,
      ]
    );

    // ========== ACTUALIZAR ROLES ==========
    if (roles && Array.isArray(roles) && roles.length > 0) {
      // Desactivamos todos los roles actuales
      await connection.query<ResultSetHeader>(
        "UPDATE usuarios_roles SET activo = 0 WHERE id_usuario = ?",
        [idUsuario]
      );

      for (const idRol of roles) {
        // Rol válido/activo
        const [rolExiste] = await connection.query<RowDataPacket[]>(
          "SELECT id_rol FROM roles WHERE id_rol = ? AND estado = 'activo'",
          [idRol]
        );
        if (rolExiste.length === 0) {
          await connection.rollback();
          connection.release();
          return NextResponse.json(
            {
              success: false,
              error: `El rol con ID ${idRol} no existe o no está activo`,
            },
            { status: 400 }
          );
        }

        // Relación existente?
        const [existeRelacion] = await connection.query<RowDataPacket[]>(
          "SELECT id_usuario, id_rol FROM usuarios_roles WHERE id_usuario = ? AND id_rol = ?",
          [idUsuario, idRol]
        );

        if (existeRelacion.length > 0) {
          // Reactivar
          await connection.query<ResultSetHeader>(
            "UPDATE usuarios_roles SET activo = 1 WHERE id_usuario = ? AND id_rol = ?",
            [idUsuario, idRol]
          );
        } else {
          // Crear nueva asignación
          await connection.query<ResultSetHeader>(
            `INSERT INTO usuarios_roles (
              id_usuario, id_rol, id_centro, id_sucursal,
              fecha_asignacion, asignado_por, activo
            ) VALUES (?, ?, ?, ?, NOW(), ?, 1)`,
            [
              idUsuario,
              idRol,
              id_centro_principal || null,
              id_sucursal_principal || null,
              ADMIN_USER_ID_FALLBACK, // admin que asigna
            ]
          );
        }
      }
    }

    // ========== USUARIO ACTUALIZADO PARA RESPUESTA ==========
    const [usuariosActualizados] = await connection.query<
      (Usuario & RowDataPacket)[]
    >(
      `SELECT 
        u.*,
        GROUP_CONCAT(DISTINCT r.id_rol ORDER BY r.nivel_jerarquia DESC) AS roles_ids,
        GROUP_CONCAT(DISTINCT r.nombre ORDER BY r.nivel_jerarquia DESC SEPARATOR ', ') AS roles_nombres,
        c.nombre AS centro_nombre,
        s.nombre AS sucursal_nombre
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

    // ========== LOG AUDITORÍA ==========
    await registrarLog({
      id_usuario: ADMIN_USER_ID_FALLBACK,
      tipo: "audit",
      modulo: "usuarios",
      accion: "editar_usuario",
      descripcion: `Usuario editado: ${nombre} ${apellido_paterno} (ID: ${idUsuario})`,
      objeto_tipo: "usuario",
      objeto_id: idUsuario.toString(),
      datos_antiguos: limpiarDatosSensibles(usuarioAntiguo),
      datos_nuevos: body,
      ip_origen: obtenerIP(request),
      agente_usuario: obtenerUserAgent(request),
      nivel_severidad: 5,
    });

    await connection.commit();
    connection.release();

    const usuarioActualizado = limpiarDatosSensibles(usuariosActualizados[0]);

    return NextResponse.json({
      success: true,
      message: "Usuario actualizado exitosamente",
      data: usuarioActualizado,
    });
  } catch (error: any) {
    if (connection) {
      await connection.rollback();
      connection.release();
    }
    console.error("❌ Error al actualizar usuario:", error);

    await registrarLog({
      id_usuario: null,
      tipo: "error",
      modulo: "usuarios",
      accion: "editar_usuario",
      descripcion: `Error al actualizar usuario ID ${params.id}: ${error.message}`,
      nivel_severidad: 8,
      ip_origen: obtenerIP(request),
      agente_usuario: obtenerUserAgent(request),
    });

    return NextResponse.json(
      {
        success: false,
        error: "Error al actualizar usuario",
        detalles: error.message,
      },
      { status: 500 }
    );
  }
}

// ============================================================================
// POST - ACCIONES DE SEGURIDAD / CUENTA (2FA, bloqueo, reset pass, etc.)
// ============================================================================
//
// Esto da soporte directo a los botones del tab "Seguridad" del frontend:
// - Activar / desactivar 2FA
// - Resetear contraseña / forzar cambio
// - Enviar token de recuperación
// - Bloquear / desbloquear usuario
// - Resetear intentos fallidos
//
// Body esperado (JSON):
// {
//   action: "toggle_2fa" | "reset_password" | "force_password_change" |
//           "send_reset_link" | "block_user" | "unblock_user" |
//           "reset_failed_attempts",
//   ...según acción...
// }
//
// ============================================================================

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  let connection;

  try {
    const idUsuarioObjetivo = parseInt(params.id);
    if (isNaN(idUsuarioObjetivo)) {
      return NextResponse.json(
        { success: false, error: "ID de usuario inválido" },
        { status: 400 }
      );
    }

    const cuerpo: AccionSeguridadBody = await request.json();
    const ip = obtenerIP(request);
    const agente = obtenerUserAgent(request);

    connection = await pool.getConnection();
    await connection.beginTransaction();

    // Obtener usuario actual
    const [rowsUsuario] = await connection.query<Usuario[]>(
      "SELECT * FROM usuarios WHERE id_usuario = ?",
      [idUsuarioObjetivo]
    );

    if (rowsUsuario.length === 0) {
      await connection.rollback();
      connection.release();
      return NextResponse.json(
        { success: false, error: "Usuario no encontrado" },
        { status: 404 }
      );
    }

    const usuarioActual = rowsUsuario[0];

    // ======================================================================
    // SWITCH DE ACCIONES
    // ======================================================================
    let respuestaAccion: any = {};
    let logAccion = "";
    let logDescripcion = "";
    let nivel_severidad_log = 6;

    switch (cuerpo.action) {
      // --------------------------------------------------
      // ACTIVAR / DESACTIVAR 2FA
      // --------------------------------------------------
      case "toggle_2fa": {
        const enable = cuerpo.enable === true;

        if (enable) {
          const secret2FA = generarTokenSeguro(20); // secreto para TOTP u OTP app
          await connection.query<ResultSetHeader>(
            `UPDATE usuarios
             SET autenticacion_doble_factor = 1,
                 secret_2fa = ?,
                 fecha_modificacion = NOW()
             WHERE id_usuario = ?`,
            [secret2FA, idUsuarioObjetivo]
          );

          respuestaAccion = {
            autenticacion_doble_factor: 1,
            secret_2fa: secret2FA, // el front puede usar esto para generar QR
          };

          logAccion = "activar_2fa";
          logDescripcion = `2FA activado para usuario ID ${idUsuarioObjetivo}`;
          nivel_severidad_log = 7;
        } else {
          await connection.query<ResultSetHeader>(
            `UPDATE usuarios
             SET autenticacion_doble_factor = 0,
                 secret_2fa = NULL,
                 fecha_modificacion = NOW()
             WHERE id_usuario = ?`,
            [idUsuarioObjetivo]
          );

          respuestaAccion = {
            autenticacion_doble_factor: 0,
          };

          logAccion = "desactivar_2fa";
          logDescripcion = `2FA desactivado para usuario ID ${idUsuarioObjetivo}`;
          nivel_severidad_log = 7;
        }

        break;
      }

      // --------------------------------------------------
      // RESET PASSWORD INMEDIATO (ADMIN DEFINE O AUTO-GENERA)
      // --------------------------------------------------
      case "reset_password": {
        // Generar o usar la contraseña nueva
        const nuevaPasswordPlano =
          cuerpo.new_password && cuerpo.new_password.trim().length >= 8
            ? cuerpo.new_password.trim()
            : generarPasswordTemporal(12);

        const hash = await bcrypt.hash(nuevaPasswordPlano, BCRYPT_ROUNDS);

        // Actualizar hash y marcar si debe cambiarla al próximo login
        await connection.query<ResultSetHeader>(
          `UPDATE usuarios
           SET password_hash = ?,
               requiere_cambio_password = ?,
               reset_token = NULL,
               reset_token_expiry = NULL,
               fecha_modificacion = NOW()
           WHERE id_usuario = ?`,
          [hash, cuerpo.force_change ? 1 : 0, idUsuarioObjetivo]
        );

        respuestaAccion = {
          temp_password: nuevaPasswordPlano,
          requiere_cambio_password: cuerpo.force_change ? 1 : 0,
        };

        logAccion = "reset_password_admin";
        logDescripcion = `Contraseña reseteada por administrador para usuario ID ${idUsuarioObjetivo} (sin exponer pwd en log)`;
        nivel_severidad_log = 9;
        break;
      }

      // --------------------------------------------------
      // FORZAR CAMBIO DE CONTRASEÑA
      // --------------------------------------------------
      case "force_password_change": {
        await connection.query<ResultSetHeader>(
          `UPDATE usuarios
           SET requiere_cambio_password = 1,
               fecha_modificacion = NOW()
           WHERE id_usuario = ?`,
          [idUsuarioObjetivo]
        );

        respuestaAccion = {
          requiere_cambio_password: 1,
        };

        logAccion = "forzar_cambio_password";
        logDescripcion = `Forzado cambio de contraseña al usuario ID ${idUsuarioObjetivo}`;
        nivel_severidad_log = 6;
        break;
      }

      // --------------------------------------------------
      // GENERAR TOKEN DE RECUPERACIÓN (ENVIAR LINK EXTERNO)
      // --------------------------------------------------
      case "send_reset_link": {
        const token = generarTokenSeguro(32);

        await connection.query<ResultSetHeader>(
          `UPDATE usuarios
           SET reset_token = ?,
               reset_token_expiry = DATE_ADD(NOW(), INTERVAL 1 HOUR),
               fecha_modificacion = NOW()
           WHERE id_usuario = ?`,
          [token, idUsuarioObjetivo]
        );

        respuestaAccion = {
          reset_token: token,
          reset_token_expiry: "1h",
        };

        logAccion = "generar_reset_link";
        logDescripcion = `Token de reseteo de contraseña generado para usuario ID ${idUsuarioObjetivo}`;
        nivel_severidad_log = 7;
        break;
      }

      // --------------------------------------------------
      // BLOQUEAR USUARIO (estado='bloqueado' + usuarios_suspensiones)
      // --------------------------------------------------
      case "block_user": {
        const motivo = cuerpo.motivo?.trim() || "Bloqueo administrativo";
        const detalles = cuerpo.detalles?.trim() || null;
        const fechaExp = cuerpo.fecha_expiracion || null;

        // Cambiar estado del usuario a 'bloqueado'
        await connection.query<ResultSetHeader>(
          `UPDATE usuarios
           SET estado = 'bloqueado',
               fecha_modificacion = NOW()
           WHERE id_usuario = ?`,
          [idUsuarioObjetivo]
        );

        // Registrar en tabla de suspensiones
        await connection.query<ResultSetHeader>(
          `INSERT INTO usuarios_suspensiones (
              id_usuario,
              motivo,
              detalles,
              suspendido_por,
              tipo_suspension,
              fecha_suspension,
              fecha_expiracion,
              estado,
              ip_origen,
              user_agent,
              fecha_creacion,
              fecha_modificacion
            )
            VALUES (?, ?, ?, ?, 'manual', NOW(), ?, 'activa', ?, ?, NOW(), NOW())`,
          [
            idUsuarioObjetivo,
            motivo,
            detalles,
            ADMIN_USER_ID_FALLBACK,
            fechaExp,
            ip,
            agente,
          ]
        );

        respuestaAccion = {
          estado: "bloqueado",
          suspension_activa: true,
        };

        logAccion = "bloquear_usuario";
        logDescripcion = `Usuario ID ${idUsuarioObjetivo} bloqueado. Motivo: ${motivo}`;
        nivel_severidad_log = 9;
        break;
      }

      // --------------------------------------------------
      // DESBLOQUEAR USUARIO (marcar suspensiones activas como levantadas)
      // --------------------------------------------------
      case "unblock_user": {
        // Usuario vuelve a 'activo' y se limpian intentos fallidos
        await connection.query<ResultSetHeader>(
          `UPDATE usuarios
           SET estado = 'activo',
               intentos_fallidos = 0,
               fecha_modificacion = NOW()
           WHERE id_usuario = ?`,
          [idUsuarioObjetivo]
        );

        // Marcar suspensiones activas como levantadas
        await connection.query<ResultSetHeader>(
          `UPDATE usuarios_suspensiones
           SET estado = 'levantada',
               levantada_por = ?,
               fecha_levantamiento = NOW(),
               fecha_modificacion = NOW()
           WHERE id_usuario = ?
             AND estado = 'activa'`,
          [ADMIN_USER_ID_FALLBACK, idUsuarioObjetivo]
        );

        respuestaAccion = {
          estado: "activo",
          intentos_fallidos: 0,
        };

        logAccion = "desbloquear_usuario";
        logDescripcion = `Usuario ID ${idUsuarioObjetivo} desbloqueado por admin`;
        nivel_severidad_log = 8;
        break;
      }

      // --------------------------------------------------
      // RESET INTENTOS FALLIDOS LOGIN
      // --------------------------------------------------
      case "reset_failed_attempts": {
        await connection.query<ResultSetHeader>(
          `UPDATE usuarios
           SET intentos_fallidos = 0,
               fecha_modificacion = NOW()
           WHERE id_usuario = ?`,
          [idUsuarioObjetivo]
        );

        respuestaAccion = {
          intentos_fallidos: 0,
        };

        logAccion = "reset_intentos_fallidos";
        logDescripcion = `Intentos fallidos reseteados para usuario ID ${idUsuarioObjetivo}`;
        nivel_severidad_log = 5;
        break;
      }

      // --------------------------------------------------
      default: {
        await connection.rollback();
        connection.release();
        return NextResponse.json(
          {
            success: false,
            error: "Acción inválida o no soportada",
            detalle: cuerpo.action,
          },
          { status: 400 }
        );
      }
    }

    // ======================================================================
    // REGISTRAR EN logs_sistema
    // ======================================================================
    await registrarLog({
      id_usuario: ADMIN_USER_ID_FALLBACK,
      tipo: "security",
      modulo: "usuarios",
      accion: logAccion,
      descripcion: logDescripcion,
      objeto_tipo: "usuario",
      objeto_id: idUsuarioObjetivo.toString(),
      datos_antiguos: limpiarDatosSensibles(usuarioActual),
      datos_nuevos: respuestaAccion,
      ip_origen: ip,
      agente_usuario: agente,
      nivel_severidad: nivel_severidad_log,
    });

    await connection.commit();
    connection.release();

    return NextResponse.json({
      success: true,
      message: "Acción de seguridad ejecutada correctamente",
      data: respuestaAccion,
    });
  } catch (error: any) {
    if (connection) {
      await connection.rollback();
      connection.release();
    }

    console.error("❌ Error en acción de seguridad usuario:", error);

    await registrarLog({
      id_usuario: null,
      tipo: "error",
      modulo: "usuarios",
      accion: "accion_seguridad_usuario",
      descripcion: `Error al ejecutar acción de seguridad en usuario ID ${params.id}: ${error.message}`,
      nivel_severidad: 9,
      ip_origen: obtenerIP(request),
      agente_usuario: obtenerUserAgent(request),
    });

    return NextResponse.json(
      {
        success: false,
        error: "Error al ejecutar acción de seguridad",
        detalles: error.message,
      },
      { status: 500 }
    );
  }
}

// ============================================================================
// DELETE - ELIMINAR USUARIO (SOLO SI NO TIENE DEPENDENCIAS CRÍTICAS)
// ============================================================================
//
// IMPORTANTE: Por integridad, no permitimos borrar si el usuario dejó rastro
// en tablas que tienen ON DELETE RESTRICT o son históricas/auditables.
//
// Ejemplos de dependencias que bloquean la eliminación:
// - citas.creado_por
// - notas_clinicas.id_usuario
// - signos_vitales.registrado_por
// - documentos_adjuntos.subido_por
// - bloques_horarios.creado_por
// - tipos_cita.creado_por
// - etc.
//
// Si hay dependencias, devolvemos error con detalle y sugerimos marcarlo
// como "inactivo" o "bloqueado" en vez de borrarlo.
//
// ============================================================================

export async function DELETE(
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
    await connection.beginTransaction();

    // 1. ¿Existe el usuario?
    const [usuarios] = await connection.query<Usuario[]>(
      "SELECT * FROM usuarios WHERE id_usuario = ?",
      [idUsuario]
    );

    if (usuarios.length === 0) {
      await connection.rollback();
      connection.release();
      return NextResponse.json(
        { success: false, error: "Usuario no encontrado" },
        { status: 404 }
      );
    }

    const usuario = usuarios[0];

    // 2. Obtener IDs médico / paciente asociados (por si tiene citas históricas)
    const [medicoRows] = await connection.query<RowDataPacket[]>(
      "SELECT id_medico FROM medicos WHERE id_usuario = ? LIMIT 1",
      [idUsuario]
    );
    const [pacienteRows] = await connection.query<RowDataPacket[]>(
      "SELECT id_paciente FROM pacientes WHERE id_usuario = ? LIMIT 1",
      [idUsuario]
    );

    const idMedico = medicoRows.length ? medicoRows[0].id_medico : null;
    const idPaciente = pacienteRows.length ? pacienteRows[0].id_paciente : null;

    // 3. Dependencias críticas históricas
    const [citasCount] = await connection.query<RowDataPacket[]>(
      `SELECT COUNT(*) AS total
       FROM citas
       WHERE (id_medico = ? OR id_paciente = ?)`,
      [idMedico ?? null, idPaciente ?? null]
    );

    const [notasCount] = await connection.query<RowDataPacket[]>(
      `SELECT COUNT(*) AS total
       FROM notas_clinicas
       WHERE id_usuario = ?`,
      [idUsuario]
    );

    const [signosCount] = await connection.query<RowDataPacket[]>(
      `SELECT COUNT(*) AS total
       FROM signos_vitales
       WHERE registrado_por = ?`,
      [idUsuario]
    );

    const [docsCount] = await connection.query<RowDataPacket[]>(
      `SELECT COUNT(*) AS total
       FROM documentos_adjuntos
       WHERE subido_por = ?`,
      [idUsuario]
    );

    const [citasCreadasCount] = await connection.query<RowDataPacket[]>(
      `SELECT COUNT(*) AS total
       FROM citas
       WHERE creado_por = ?`,
      [idUsuario]
    );

    const [bloquesCount] = await connection.query<RowDataPacket[]>(
      `SELECT COUNT(*) AS total
       FROM bloques_horarios
       WHERE creado_por = ?`,
      [idUsuario]
    );

    const [tiposCitaCount] = await connection.query<RowDataPacket[]>(
      `SELECT COUNT(*) AS total
       FROM tipos_cita
       WHERE creado_por = ?`,
      [idUsuario]
    );

    const [salasCount] = await connection.query<RowDataPacket[]>(
      `SELECT COUNT(*) AS total
       FROM salas
       WHERE creado_por = ?`,
      [idUsuario]
    );

    // Suma dependencias relevantes
    const dependenciasDetalle = {
      citas_asociadas_como_medico_o_paciente: citasCount[0]?.total || 0,
      notas_clinicas_autor: notasCount[0]?.total || 0,
      signos_vitales_registrados: signosCount[0]?.total || 0,
      documentos_subidos: docsCount[0]?.total || 0,
      citas_creadas: citasCreadasCount[0]?.total || 0,
      bloques_horarios_creados: bloquesCount[0]?.total || 0,
      tipos_cita_creados: tiposCitaCount[0]?.total || 0,
      salas_creadas: salasCount[0]?.total || 0,
    };

    const totalDependencias = Object.values(dependenciasDetalle).reduce(
      (acc, num) => acc + (typeof num === "number" ? num : 0),
      0
    );

    if (totalDependencias > 0) {
      await connection.rollback();
      connection.release();

      return NextResponse.json(
        {
          success: false,
          error:
            "No se puede eliminar el usuario porque tiene registros históricos asociados",
          detalles: dependenciasDetalle,
          sugerencia:
            "Cambiar el estado del usuario a 'inactivo' o 'bloqueado' en lugar de eliminarlo para mantener la integridad de los datos.",
        },
        { status: 400 }
      );
    }

    // 4. Eliminar relaciones explícitas (por prolijidad)
    await connection.query<ResultSetHeader>(
      "DELETE FROM usuarios_roles WHERE id_usuario = ?",
      [idUsuario]
    );

    // NOTA:
    // - Tablas como medicos / administrativos / secretarias / tecnicos
    //   tienen ON DELETE CASCADE con usuarios, entonces caerán en cascada.
    // - pacientes.id_usuario es ON DELETE SET NULL, así que no bloquea.

    // 5. Eliminar el usuario
    await connection.query<ResultSetHeader>(
      "DELETE FROM usuarios WHERE id_usuario = ?",
      [idUsuario]
    );

    // 6. Registrar log de seguridad
    await registrarLog({
      id_usuario: ADMIN_USER_ID_FALLBACK,
      tipo: "security",
      modulo: "usuarios",
      accion: "eliminar_usuario",
      descripcion: `Usuario eliminado: ${usuario.nombre} ${usuario.apellido_paterno} (ID: ${idUsuario}, Username: ${usuario.username}, RUT: ${usuario.rut})`,
      objeto_tipo: "usuario",
      objeto_id: idUsuario.toString(),
      datos_antiguos: limpiarDatosSensibles(usuario),
      ip_origen: obtenerIP(request),
      agente_usuario: obtenerUserAgent(request),
      nivel_severidad: 9,
    });

    await connection.commit();
    connection.release();

    return NextResponse.json({
      success: true,
      message: "Usuario eliminado exitosamente",
      data: {
        id_usuario: idUsuario,
        nombre_completo: `${usuario.nombre} ${usuario.apellido_paterno}${
          usuario.apellido_materno ? " " + usuario.apellido_materno : ""
        }`,
        username: usuario.username,
        rut: usuario.rut,
      },
    });
  } catch (error: any) {
    if (connection) {
      await connection.rollback();
      connection.release();
    }
    console.error("❌ Error al eliminar usuario:", error);

    await registrarLog({
      id_usuario: null,
      tipo: "error",
      modulo: "usuarios",
      accion: "eliminar_usuario",
      descripcion: `Error al eliminar usuario ID ${params.id}: ${error.message}`,
      nivel_severidad: 9,
      ip_origen: obtenerIP(request),
      agente_usuario: obtenerUserAgent(request),
    });

    return NextResponse.json(
      {
        success: false,
        error: "Error al eliminar usuario",
        detalles: error.message,
      },
      { status: 500 }
    );
  }
}
