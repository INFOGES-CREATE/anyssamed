// frontend/src/app/api/admin/secretarias/[id]/route.ts
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { RowDataPacket, ResultSetHeader } from "mysql2";
import { registrarLog } from "@/lib/logs";
import crypto from "crypto";
import bcrypt from "bcryptjs";

// ============================================================================
// ⚙️ CONFIG / CONSTANTES
// ============================================================================

const ADMIN_USER_ID_FALLBACK = 1;
const BCRYPT_ROUNDS = 12;

// ============================================================================
// 📚 INTERFACES
// ============================================================================

interface SecretariaDetalle extends RowDataPacket {
  // SECRETARIA
  id_secretaria: number;
  id_usuario: number;
  id_centro: number | null;
  id_sucursal: number | null;
  id_departamento: number | null;
  jornada: string;
  extension_telefonica: string | null;
  estado_secretaria: string;
  fecha_creacion_secretaria: string;
  fecha_modificacion_secretaria: string | null;

  // USUARIO
  username: string;
  nombre: string;
  apellido_paterno: string;
  apellido_materno?: string | null;
  email: string;
  rut: string;
  telefono?: string | null;
  celular?: string | null;
  fecha_nacimiento?: string | null;
  genero?: string | null;
  direccion?: string | null;
  ciudad?: string | null;
  region?: string | null;
  estado: string; // estado usuario (original u.estado)
  password_hash?: string;
  reset_token?: string | null;
  reset_token_expiry?: string | null;
  secret_2fa?: string | null;
  requiere_cambio_password: number;
  autenticacion_doble_factor: number;
  fecha_creacion: string;
  fecha_modificacion?: string | null;
  ultimo_login?: string | null;
  intentos_fallidos: number;
  created_by?: number | null;

  // AGREGADOS
  roles_ids?: string | null;
  roles_nombres?: string | null;
  roles_descripciones?: string | null;

  centro_nombre?: string | null;
  centro_direccion?: string | null;
  centro_telefono?: string | null;
  centro_email?: string | null;
  centro_estado?: string | null;

  sucursal_nombre?: string | null;
  sucursal_direccion?: string | null;
  sucursal_estado?: string | null;

  nombre_completo: string;
  edad?: number | null;
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

interface UpdateSecretariaBody {
  // Datos usuario
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
  estado?: string; // estado usuario

  // Datos secretaria
  jornada?: "completa" | "media" | "parcial";
  extension_telefonica?: string | null;
  id_departamento?: number | null;
  estado_secretaria?: "activo" | "inactivo" | "suspendido" | "vacaciones";
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

function limpiarDatosSensibles<T extends Record<string, any>>(obj: T): T {
  const limpio: any = { ...obj };
  delete limpio.password_hash;
  delete limpio.reset_token;
  delete limpio.reset_token_expiry;
  delete limpio.secret_2fa;
  return limpio;
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
// (para reset_password admin)
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
// GET - OBTENER DETALLE COMPLETO DE LA SECRETARIA + USUARIO
// ============================================================================

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  let connection;

  try {
    const idSecretaria = parseInt(params.id);

    if (isNaN(idSecretaria)) {
      return NextResponse.json(
        { success: false, error: "ID de secretaria inválido" },
        { status: 400 }
      );
    }

    connection = await pool.getConnection();

    // ========== 1. DATOS PRINCIPALES SECRETARIA + USUARIO ==========
    const [secretarias] = await connection.query<
      SecretariaDetalle[] & RowDataPacket[]
    >(
      `SELECT
        sec.id_secretaria,
        sec.id_usuario,
        sec.id_centro,
        sec.id_sucursal,
        sec.id_departamento,
        sec.jornada,
        sec.extension_telefonica,
        sec.estado AS estado_secretaria,
        sec.fecha_creacion AS fecha_creacion_secretaria,
        sec.fecha_modificacion AS fecha_modificacion_secretaria,

        u.*,
        u.estado AS estado, -- estado usuario

        GROUP_CONCAT(DISTINCT r.id_rol ORDER BY r.nivel_jerarquia DESC) AS roles_ids,
        GROUP_CONCAT(DISTINCT r.nombre ORDER BY r.nivel_jerarquia DESC SEPARATOR ', ') AS roles_nombres,
        GROUP_CONCAT(DISTINCT r.descripcion ORDER BY r.nivel_jerarquia DESC SEPARATOR ' | ') AS roles_descripciones,

        c.nombre            AS centro_nombre,
        c.direccion         AS centro_direccion,
        c.telefono_principal AS centro_telefono,
        c.email_contacto    AS centro_email,
        c.estado            AS centro_estado,

        s.nombre            AS sucursal_nombre,
        s.direccion         AS sucursal_direccion,
        s.estado            AS sucursal_estado,

        CONCAT(u.nombre, ' ', u.apellido_paterno, ' ', COALESCE(u.apellido_materno, '')) AS nombre_completo,
        TIMESTAMPDIFF(YEAR, u.fecha_nacimiento, CURDATE()) AS edad
      FROM secretarias sec
      INNER JOIN usuarios u
        ON sec.id_usuario = u.id_usuario
      LEFT JOIN usuarios_roles ur
        ON u.id_usuario = ur.id_usuario AND ur.activo = 1
      LEFT JOIN roles r
        ON ur.id_rol = r.id_rol AND r.estado = 'activo'
      LEFT JOIN centros_medicos c
        ON sec.id_centro = c.id_centro
      LEFT JOIN sucursales s
        ON sec.id_sucursal = s.id_sucursal
      WHERE sec.id_secretaria = ?
      GROUP BY sec.id_secretaria`,
      [idSecretaria]
    );

    if (secretarias.length === 0) {
      connection.release();
      return NextResponse.json(
        { success: false, error: "Secretaria no encontrada" },
        { status: 404 }
      );
    }

    const secretaria = secretarias[0];
    const idUsuario = secretaria.id_usuario;

    // ========== 2. ESTADÍSTICAS (ORIENTADAS A CITAS QUE CREA LA SECRETARIA) ==========
    const [estadisticas] = await connection.query<Estadisticas[]>(
      `SELECT 
        (SELECT COUNT(*) 
           FROM citas 
          WHERE creado_por = ?
        ) AS total_citas,
        (SELECT COUNT(*) 
           FROM citas 
          WHERE creado_por = ?
            AND estado = 'completada'
        ) AS citas_completadas,
        (SELECT COUNT(*) 
           FROM citas 
          WHERE creado_por = ?
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
      [idUsuario, idUsuario, idUsuario, idUsuario, idUsuario, idUsuario]
    );

    // ========== 3. ÚLTIMAS ACTIVIDADES ==========
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

    // ========== 4. ROLES DETALLADOS ==========
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

    // ========== 5. PERMISOS CONSOLIDADOS ==========
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

    // ========== 6. HISTORIAL DE ESTADO / SEGURIDAD ==========
    const [historialEstados] = await connection.query<RowDataPacket[]>(
      `SELECT 
        fecha_hora,
        descripcion,
        datos_antiguos,
        datos_nuevos,
        ip_origen
      FROM logs_sistema
      WHERE id_usuario = ?
        AND modulo IN ('usuarios','secretarias')
        AND accion IN (
          'cambiar_estado',
          'bloquear_usuario',
          'desbloquear_usuario',
          'editar_usuario',
          'editar_secretaria',
          'activar_2fa',
          'desactivar_2fa',
          'reset_password_admin',
          'forzar_cambio_password',
          'generar_reset_link',
          'reset_intentos_fallidos'
        )
      ORDER BY fecha_hora DESC
      LIMIT 10`,
      [idUsuario]
    );

    connection.release();

    // ========== 7. LIMPIAR DATOS SENSIBLES ==========
    const secretariaLimpia = limpiarDatosSensibles(secretaria);

    // ========== 8. RESPUESTA ==========
    return NextResponse.json({
      success: true,
      data: {
        ...secretariaLimpia,
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
        permisos,
        historial_estados: historialEstados,
      },
    });
  } catch (error: any) {
    if (connection) connection.release();
    console.error("❌ Error al obtener secretaria:", error);

    await registrarLog({
      id_usuario: null,
      tipo: "error",
      modulo: "secretarias",
      accion: "obtener_secretaria",
      descripcion: `Error al obtener secretaria ID ${params.id}: ${error.message}`,
      nivel_severidad: 7,
      ip_origen: obtenerIP(request),
      agente_usuario: obtenerUserAgent(request),
    });

    return NextResponse.json(
      {
        success: false,
        error: "Error al obtener secretaria",
        detalles: error.message,
      },
      { status: 500 }
    );
  }
}

// ============================================================================
// PUT - ACTUALIZAR DATOS DE SECRETARIA + USUARIO
// ============================================================================

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  let connection;

  try {
    const idSecretaria = parseInt(params.id);

    if (isNaN(idSecretaria)) {
      return NextResponse.json(
        { success: false, error: "ID de secretaria inválido" },
        { status: 400 }
      );
    }

    const body: UpdateSecretariaBody = await request.json();
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
      estado, // estado usuario

      // secretaria
      jornada,
      extension_telefonica,
      id_departamento,
      estado_secretaria,
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

    // ========== OBTENER DATOS ANTIGUOS (SECRETARIA + USUARIO) ==========
    const [rowsAntiguos] = await connection.query<SecretariaDetalle[]>(
      `SELECT sec.*, u.*
       FROM secretarias sec
       INNER JOIN usuarios u ON sec.id_usuario = u.id_usuario
       WHERE sec.id_secretaria = ?`,
      [idSecretaria]
    );

    if (rowsAntiguos.length === 0) {
      await connection.rollback();
      connection.release();
      return NextResponse.json(
        { success: false, error: "Secretaria no encontrada" },
        { status: 404 }
      );
    }

    const secretariaAntigua = rowsAntiguos[0];
    const idUsuario = secretariaAntigua.id_usuario;

    // ========== VALIDAR DUPLICADOS EN USUARIOS ==========
    if (username && username !== secretariaAntigua.username) {
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

    if (email && email !== secretariaAntigua.email) {
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

    if (rut && rut !== secretariaAntigua.rut) {
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

    // ========== CENTRO Y SUCURSAL (COMPARTIDOS USUARIO + SECRETARIA) ==========
    const centroAsignado =
      typeof id_centro_principal === "number"
        ? id_centro_principal
        : secretariaAntigua.id_centro;

    const sucursalAsignada =
      typeof id_sucursal_principal === "number"
        ? id_sucursal_principal
        : secretariaAntigua.id_sucursal;

    if (centroAsignado) {
      const [centroExiste] = await connection.query<RowDataPacket[]>(
        "SELECT id_centro FROM centros_medicos WHERE id_centro = ? AND estado = 'activo'",
        [centroAsignado]
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

    if (sucursalAsignada && centroAsignado) {
      const [sucursalExiste] = await connection.query<RowDataPacket[]>(
        "SELECT id_sucursal FROM sucursales WHERE id_sucursal = ? AND id_centro = ? AND estado = 'activo'",
        [sucursalAsignada, centroAsignado]
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
        centroAsignado || null,
        sucursalAsignada || null,
        foto_perfil_url || null,
        requiere_cambio_password ? 1 : 0,
        autenticacion_doble_factor ? 1 : 0,
        estado || secretariaAntigua.estado,
        idUsuario,
      ]
    );

    // ========== ACTUALIZAR SECRETARIA ==========
    await connection.query<ResultSetHeader>(
      `UPDATE secretarias SET
        id_centro = ?,
        id_sucursal = ?,
        id_departamento = ?,
        jornada = COALESCE(?, jornada),
        extension_telefonica = ?,
        estado = COALESCE(?, estado),
        fecha_modificacion = NOW()
      WHERE id_secretaria = ?`,
      [
        centroAsignado || null,
        sucursalAsignada || null,
        typeof id_departamento === "number" ? id_departamento : secretariaAntigua.id_departamento,
        jornada || null,
        extension_telefonica || null,
        estado_secretaria || null,
        idSecretaria,
      ]
    );

    // ========== ACTUALIZAR ROLES (SI SE ENVÍAN) ==========
    if (roles && Array.isArray(roles) && roles.length > 0) {
      await connection.query<ResultSetHeader>(
        "UPDATE usuarios_roles SET activo = 0 WHERE id_usuario = ?",
        [idUsuario]
      );

      for (const idRol of roles) {
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

        const [existeRelacion] = await connection.query<RowDataPacket[]>(
          "SELECT id_usuario, id_rol FROM usuarios_roles WHERE id_usuario = ? AND id_rol = ?",
          [idUsuario, idRol]
        );

        if (existeRelacion.length > 0) {
          await connection.query<ResultSetHeader>(
            "UPDATE usuarios_roles SET activo = 1 WHERE id_usuario = ? AND id_rol = ?",
            [idUsuario, idRol]
          );
        } else {
          await connection.query<ResultSetHeader>(
            `INSERT INTO usuarios_roles (
              id_usuario, id_rol, id_centro, id_sucursal,
              fecha_asignacion, asignado_por, activo
            ) VALUES (?, ?, ?, ?, NOW(), ?, 1)`,
            [
              idUsuario,
              idRol,
              centroAsignado || null,
              sucursalAsignada || null,
              ADMIN_USER_ID_FALLBACK,
            ]
          );
        }
      }
    }

    // ========== RECUPERAR SECRETARIA ACTUALIZADA PARA RESPUESTA ==========
    const [secretariasActualizadas] = await connection.query<SecretariaDetalle[]>(
      `SELECT
        sec.id_secretaria,
        sec.id_usuario,
        sec.id_centro,
        sec.id_sucursal,
        sec.id_departamento,
        sec.jornada,
        sec.extension_telefonica,
        sec.estado AS estado_secretaria,
        sec.fecha_creacion AS fecha_creacion_secretaria,
        sec.fecha_modificacion AS fecha_modificacion_secretaria,

        u.*,
        u.estado AS estado,

        GROUP_CONCAT(DISTINCT r.id_rol ORDER BY r.nivel_jerarquia DESC) AS roles_ids,
        GROUP_CONCAT(DISTINCT r.nombre ORDER BY r.nivel_jerarquia DESC SEPARATOR ', ') AS roles_nombres,

        c.nombre AS centro_nombre,
        s.nombre AS sucursal_nombre
      FROM secretarias sec
      INNER JOIN usuarios u
        ON sec.id_usuario = u.id_usuario
      LEFT JOIN usuarios_roles ur
        ON u.id_usuario = ur.id_usuario AND ur.activo = 1
      LEFT JOIN roles r
        ON ur.id_rol = r.id_rol AND r.estado = 'activo'
      LEFT JOIN centros_medicos c
        ON sec.id_centro = c.id_centro
      LEFT JOIN sucursales s
        ON sec.id_sucursal = s.id_sucursal
      WHERE sec.id_secretaria = ?
      GROUP BY sec.id_secretaria`,
      [idSecretaria]
    );

    const secretariaActualizada = limpiarDatosSensibles(
      secretariasActualizadas[0]
    );

    // ========== LOG AUDITORÍA ==========
    await registrarLog({
      id_usuario: ADMIN_USER_ID_FALLBACK,
      tipo: "audit",
      modulo: "secretarias",
      accion: "editar_secretaria",
      descripcion: `Secretaria editada: ${nombre} ${apellido_paterno} (ID secretaria: ${idSecretaria}, usuario ID: ${idUsuario})`,
      objeto_tipo: "secretaria",
      objeto_id: idSecretaria.toString(),
      datos_antiguos: limpiarDatosSensibles(secretariaAntigua),
      datos_nuevos: body,
      ip_origen: obtenerIP(request),
      agente_usuario: obtenerUserAgent(request),
      nivel_severidad: 5,
    });

    await connection.commit();
    connection.release();

    return NextResponse.json({
      success: true,
      message: "Secretaria actualizada exitosamente",
      data: secretariaActualizada,
    });
  } catch (error: any) {
    if (connection) {
      await connection.rollback();
      connection.release();
    }
    console.error("❌ Error al actualizar secretaria:", error);

    await registrarLog({
      id_usuario: null,
      tipo: "error",
      modulo: "secretarias",
      accion: "editar_secretaria",
      descripcion: `Error al actualizar secretaria ID ${params.id}: ${error.message}`,
      nivel_severidad: 8,
      ip_origen: obtenerIP(request),
      agente_usuario: obtenerUserAgent(request),
    });

    return NextResponse.json(
      {
        success: false,
        error: "Error al actualizar secretaria",
        detalles: error.message,
      },
      { status: 500 }
    );
  }
}

// ============================================================================
// POST - ACCIONES DE SEGURIDAD / CUENTA SOBRE LA SECRETARIA (USUARIO ASOCIADO)
// ============================================================================

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  let connection;

  try {
    const idSecretaria = parseInt(params.id);
    if (isNaN(idSecretaria)) {
      return NextResponse.json(
        { success: false, error: "ID de secretaria inválido" },
        { status: 400 }
      );
    }

    const cuerpo: AccionSeguridadBody = await request.json();
    const ip = obtenerIP(request);
    const agente = obtenerUserAgent(request);

    connection = await pool.getConnection();
    await connection.beginTransaction();

    // Obtener secretaria + usuario actual
    const [rowsSecretaria] = await connection.query<SecretariaDetalle[]>(
      `SELECT sec.*, u.*
       FROM secretarias sec
       INNER JOIN usuarios u ON sec.id_usuario = u.id_usuario
       WHERE sec.id_secretaria = ?`,
      [idSecretaria]
    );

    if (rowsSecretaria.length === 0) {
      await connection.rollback();
      connection.release();
      return NextResponse.json(
        { success: false, error: "Secretaria no encontrada" },
        { status: 404 }
      );
    }

    const secretariaActual = rowsSecretaria[0];
    const idUsuarioObjetivo = secretariaActual.id_usuario;

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
          const secret2FA = generarTokenSeguro(20);
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
            secret_2fa: secret2FA,
          };

          logAccion = "activar_2fa";
          logDescripcion = `2FA activado para usuario ID ${idUsuarioObjetivo} (secretaria ID ${idSecretaria})`;
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
          logDescripcion = `2FA desactivado para usuario ID ${idUsuarioObjetivo} (secretaria ID ${idSecretaria})`;
          nivel_severidad_log = 7;
        }

        break;
      }

      // --------------------------------------------------
      // RESET PASSWORD INMEDIATO
      // --------------------------------------------------
      case "reset_password": {
        const nuevaPasswordPlano =
          cuerpo.new_password && cuerpo.new_password.trim().length >= 8
            ? cuerpo.new_password.trim()
            : generarPasswordTemporal(12);

        const hash = await bcrypt.hash(nuevaPasswordPlano, BCRYPT_ROUNDS);

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
        logDescripcion = `Contraseña reseteada por administrador para usuario ID ${idUsuarioObjetivo} (secretaria ID ${idSecretaria}) (sin exponer pwd en log)`;
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
        logDescripcion = `Forzado cambio de contraseña al usuario ID ${idUsuarioObjetivo} (secretaria ID ${idSecretaria})`;
        nivel_severidad_log = 6;
        break;
      }

      // --------------------------------------------------
      // GENERAR TOKEN DE RECUPERACIÓN
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
        logDescripcion = `Token de reseteo de contraseña generado para usuario ID ${idUsuarioObjetivo} (secretaria ID ${idSecretaria})`;
        nivel_severidad_log = 7;
        break;
      }

      // --------------------------------------------------
      // BLOQUEAR USUARIO + MARCAR SECRETARIA SUSPENDIDA
      // --------------------------------------------------
      case "block_user": {
        const motivo = cuerpo.motivo?.trim() || "Bloqueo administrativo";
        const detalles = cuerpo.detalles?.trim() || null;
        const fechaExp = cuerpo.fecha_expiracion || null;

        await connection.query<ResultSetHeader>(
          `UPDATE usuarios
           SET estado = 'bloqueado',
               fecha_modificacion = NOW()
           WHERE id_usuario = ?`,
          [idUsuarioObjetivo]
        );

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

        // actualizar estado de secretaria
        await connection.query<ResultSetHeader>(
          `UPDATE secretarias
           SET estado = 'suspendido',
               fecha_modificacion = NOW()
           WHERE id_secretaria = ?`,
          [idSecretaria]
        );

        respuestaAccion = {
          estado_usuario: "bloqueado",
          estado_secretaria: "suspendido",
          suspension_activa: true,
        };

        logAccion = "bloquear_usuario";
        logDescripcion = `Usuario ID ${idUsuarioObjetivo} (secretaria ID ${idSecretaria}) bloqueado. Motivo: ${motivo}`;
        nivel_severidad_log = 9;
        break;
      }

      // --------------------------------------------------
      // DESBLOQUEAR USUARIO + REACTIVAR SECRETARIA
      // --------------------------------------------------
      case "unblock_user": {
        await connection.query<ResultSetHeader>(
          `UPDATE usuarios
           SET estado = 'activo',
               intentos_fallidos = 0,
               fecha_modificacion = NOW()
           WHERE id_usuario = ?`,
          [idUsuarioObjetivo]
        );

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

        await connection.query<ResultSetHeader>(
          `UPDATE secretarias
           SET estado = 'activo',
               fecha_modificacion = NOW()
           WHERE id_secretaria = ?`,
          [idSecretaria]
        );

        respuestaAccion = {
          estado_usuario: "activo",
          estado_secretaria: "activo",
          intentos_fallidos: 0,
        };

        logAccion = "desbloquear_usuario";
        logDescripcion = `Usuario ID ${idUsuarioObjetivo} (secretaria ID ${idSecretaria}) desbloqueado por admin`;
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
        logDescripcion = `Intentos fallidos reseteados para usuario ID ${idUsuarioObjetivo} (secretaria ID ${idSecretaria})`;
        nivel_severidad_log = 5;
        break;
      }

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
      modulo: "secretarias",
      accion: logAccion,
      descripcion: logDescripcion,
      objeto_tipo: "secretaria",
      objeto_id: idSecretaria.toString(),
      datos_antiguos: limpiarDatosSensibles(secretariaActual),
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

    console.error("❌ Error en acción de seguridad secretaria:", error);

    await registrarLog({
      id_usuario: null,
      tipo: "error",
      modulo: "secretarias",
      accion: "accion_seguridad_secretaria",
      descripcion: `Error al ejecutar acción de seguridad en secretaria ID ${params.id}: ${error.message}`,
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
// DELETE - ELIMINAR SECRETARIA (ELIMINA USUARIO SI NO TIENE DEPENDENCIAS)
// ============================================================================

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  let connection;

  try {
    const idSecretaria = parseInt(params.id);

    if (isNaN(idSecretaria)) {
      return NextResponse.json(
        { success: false, error: "ID de secretaria inválido" },
        { status: 400 }
      );
    }

    connection = await pool.getConnection();
    await connection.beginTransaction();

    // 1. ¿Existe la secretaria + usuario?
    const [rowsSecretaria] = await connection.query<SecretariaDetalle[]>(
      `SELECT sec.*, u.*
       FROM secretarias sec
       INNER JOIN usuarios u ON sec.id_usuario = u.id_usuario
       WHERE sec.id_secretaria = ?`,
      [idSecretaria]
    );

    if (rowsSecretaria.length === 0) {
      await connection.rollback();
      connection.release();
      return NextResponse.json(
        { success: false, error: "Secretaria no encontrada" },
        { status: 404 }
      );
    }

    const secretaria = rowsSecretaria[0];
    const idUsuario = secretaria.id_usuario;

    // 2. Obtener IDs médico / paciente asociados al usuario
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

    // 3. Dependencias críticas históricas (mismas que en usuarios)
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
            "No se puede eliminar la secretaria porque el usuario asociado tiene registros históricos",
          detalles: dependenciasDetalle,
          sugerencia:
            "Cambiar el estado del usuario/secretaria a 'inactivo' o 'bloqueado' en lugar de eliminarlo para mantener la integridad de los datos.",
        },
        { status: 400 }
      );
    }

    // 4. Eliminar relaciones explícitas usuario_roles
    await connection.query<ResultSetHeader>(
      "DELETE FROM usuarios_roles WHERE id_usuario = ?",
      [idUsuario]
    );

    // NOTA:
    // - secretarias tiene ON DELETE CASCADE con usuarios
    // - medicos / administrativos / tecnicos también
    // - pacientes.id_usuario suele ser ON DELETE SET NULL

    // 5. Eliminar usuario (secretaria cae en cascada)
    await connection.query<ResultSetHeader>(
      "DELETE FROM usuarios WHERE id_usuario = ?",
      [idUsuario]
    );

    // 6. Log de seguridad
    await registrarLog({
      id_usuario: ADMIN_USER_ID_FALLBACK,
      tipo: "security",
      modulo: "secretarias",
      accion: "eliminar_secretaria",
      descripcion: `Secretaria eliminada: ${secretaria.nombre} ${secretaria.apellido_paterno} (ID secretaria: ${idSecretaria}, usuario ID: ${idUsuario}, Username: ${secretaria.username}, RUT: ${secretaria.rut})`,
      objeto_tipo: "secretaria",
      objeto_id: idSecretaria.toString(),
      datos_antiguos: limpiarDatosSensibles(secretaria),
      ip_origen: obtenerIP(request),
      agente_usuario: obtenerUserAgent(request),
      nivel_severidad: 9,
    });

    await connection.commit();
    connection.release();

    return NextResponse.json({
      success: true,
      message: "Secretaria eliminada exitosamente",
      data: {
        id_secretaria: idSecretaria,
        id_usuario: idUsuario,
        nombre_completo: `${secretaria.nombre} ${secretaria.apellido_paterno}${
          secretaria.apellido_materno ? " " + secretaria.apellido_materno : ""
        }`,
        username: secretaria.username,
        rut: secretaria.rut,
      },
    });
  } catch (error: any) {
    if (connection) {
      await connection.rollback();
      connection.release();
    }
    console.error("❌ Error al eliminar secretaria:", error);

    await registrarLog({
      id_usuario: null,
      tipo: "error",
      modulo: "secretarias",
      accion: "eliminar_secretaria",
      descripcion: `Error al eliminar secretaria ID ${params.id}: ${error.message}`,
      nivel_severidad: 9,
      ip_origen: obtenerIP(request),
      agente_usuario: obtenerUserAgent(request),
    });

    return NextResponse.json(
      {
        success: false,
        error: "Error al eliminar secretaria",
        detalles: error.message,
      },
      { status: 500 }
    );
  }
}
