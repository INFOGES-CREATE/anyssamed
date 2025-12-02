// app/api/auth/session/route.ts
// ✅ Verificación de sesión (JWT) + chequeo en tabla sesiones_usuarios
// Compatible con Next.js 14 (App Router)
// 🌍 Global, seguro y escalable
// ✨ Adaptado a estructura existente de sesiones_usuarios
export const dynamic = "force-dynamic";

export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { RowDataPacket } from "mysql2";
import { verifyToken } from "@/lib/auth";

// ========================================
// TIPOS
// ========================================

interface UsuarioSesion {
  id_usuario: number;
  username: string;
  email: string;
  nombre: string;
  apellido_paterno: string;
  apellido_materno: string | null;
  foto_perfil_url: string | null;
  telefono: string | null;
  celular: string | null;
  direccion: string | null;
  ciudad: string | null;
  region: string | null;
  fecha_nacimiento: string | null;
  genero: string | null;
  id_centro_principal: number | null;
  id_sucursal_principal: number | null;
  
  rol: {
    id_rol: number;
    nombre: string;
    nivel_jerarquia: number;
    permisos: string[];
  };

  centro_principal?: {
    id_centro: number;
    nombre: string;
    plan: "basico" | "profesional" | "premium" | "empresarial";
    logo_url: string | null;
    ciudad: string;
    region: string;
  } | null;

  medico?: {
    id_profesional: number;
    numero_registro_medico: string;
    titulo_profesional: string;
    anos_experiencia?: number;
    especialidad_principal?: string;
    especialidades: Array<{
      id_especialidad: number;
      nombre: string;
      es_principal: boolean;
    }>;
    id_centro_principal: number | null;
    centro_principal: {
      id_centro: number;
      nombre: string;
      plan: "basico" | "profesional" | "premium" | "empresarial";
      logo_url: string | null;
      ciudad: string;
      region: string;
    } | null;
  };

  administrativo?: {
    id_administrativo: number;
    cargo: string;
    nivel_acceso: "basico" | "intermedio" | "avanzado" | "administrador";
    id_centro: number;
    id_sucursal: number | null;
  };

  secretaria?: {
    id_secretaria: number;
    id_centro: number;
    id_sucursal: number | null;
  };

  tecnico?: {
    id_tecnico: number;
    area_tecnica: string;
    nivel_acceso: "basico" | "intermedio" | "avanzado" | "administrador";
    id_centro: number;
  };

  paciente?: {
    id_paciente: number;
    numero_historia_clinica: string | null;
    fecha_nacimiento: string | null;
  };

  // Metadata de sesión (usando campos existentes)
  sesion_metadata?: {
    id_sesion: number;
    token_expira_en: number; // segundos
    ultima_actividad: string;
    ip_address: string | null;
    user_agent: string | null;
    fecha_creacion: string;
    activa: boolean;
  };
}

interface SesionUsuarioRow extends RowDataPacket {
  id_sesion: number;
  id_usuario: number;
  token: string;
  ip_address: string | null;
  user_agent: string | null;
  activa: number;
  fecha_creacion: string;
  fecha_expiracion: string;
  ultima_actividad: string;
}

// ========================================
// HELPERS
// ========================================

function normalizeRole(s: string): string {
  return (s || "")
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .trim();
}

function prettyRole(s: string): string {
  const n = normalizeRole(s);
  if (n.includes("medico")) return "Médico";
  if (n.includes("secretaria")) return "Secretaria";
  if (n.includes("tecnico")) return "Técnico";
  if (n.includes("superadmin")) return "SuperAdministrador";
  if (n.includes("administrativo")) return "Administrativo";
  if (n.includes("paciente")) return "Paciente";
  return s || "Usuario";
}

function getTokenFromRequest(req: NextRequest): string | null {
  // 1. Cookie
  const cookieToken = req.cookies.get("session")?.value;
  if (cookieToken) return cookieToken;

  // 2. Authorization header (case-insensitive)
  const auth = 
    req.headers.get("authorization") || 
    req.headers.get("Authorization");
  
  if (auth && auth.startsWith("Bearer ")) {
    return auth.slice(7);
  }

  return null;
}

function getClientIp(req: NextRequest): string | null {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    req.headers.get("cf-connecting-ip") ||
    req.headers.get("x-client-ip") ||
    null
  );
}

function calculateTokenExpiry(expirationDate: string): number {
  const expiry = new Date(expirationDate).getTime();
  const now = Date.now();
  return Math.max(0, Math.floor((expiry - now) / 1000));
}

// ========================================
// HANDLER PRINCIPAL
// ========================================

export async function GET(req: NextRequest) {
  const startTime = Date.now();
  const clientIp = getClientIp(req);
  const userAgent = req.headers.get("user-agent");

  try {
    // 1️⃣ OBTENER TOKEN
    const token = getTokenFromRequest(req);
    if (!token) {
      return NextResponse.json(
        { 
          success: false, 
          error: "No hay sesión activa",
          code: "NO_SESSION"
        },
        { status: 401 }
      );
    }

    // 2️⃣ VERIFICAR JWT
    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json(
        { 
          success: false, 
          error: "Sesión inválida o expirada (token)",
          code: "INVALID_TOKEN"
        },
        { status: 401 }
      );
    }

    const idUsuario = Number(payload.id ?? payload.userId ?? payload.uid);
    if (!idUsuario) {
      return NextResponse.json(
        { 
          success: false, 
          error: "Token sin id de usuario",
          code: "MISSING_USER_ID"
        },
        { status: 401 }
      );
    }

    // 3️⃣ VALIDAR SESIÓN EN BD (usando campos existentes)
    const [sesRows] = await pool.query<SesionUsuarioRow[]>(
      `
      SELECT 
        su.id_sesion,
        su.id_usuario,
        su.token,
        su.ip_address,
        su.user_agent,
        su.activa,
        su.fecha_creacion,
        su.fecha_expiracion,
        su.ultima_actividad
      FROM sesiones_usuarios su
      INNER JOIN usuarios u ON u.id_usuario = su.id_usuario
      WHERE su.token = ?
        AND su.activa = 1
        AND su.fecha_expiracion > NOW()
        AND u.estado = 'activo'
      LIMIT 1
      `,
      [token]
    );

    if (sesRows.length === 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: "Sesión inválida o expirada",
          code: "INVALID_SESSION"
        },
        { status: 401 }
      );
    }

    const sesionRow = sesRows[0];

    // 4️⃣ ACTUALIZAR ÚLTIMA ACTIVIDAD (solo campos existentes)
    await pool.query(
      `
      UPDATE sesiones_usuarios 
      SET ultima_actividad = NOW()
      WHERE token = ?
      `,
      [token]
    );

    // 5️⃣ CARGAR USUARIO + ROL PRINCIPAL
    const [rolesUsuario] = await pool.query<RowDataPacket[]>(
      `
      SELECT
        u.id_usuario,
        u.username,
        u.email,
        u.nombre,
        u.apellido_paterno,
        u.apellido_materno,
        u.foto_perfil_url,
        u.estado,
        u.telefono,
        u.celular,
        u.direccion,
        u.ciudad,
        u.region,
        u.fecha_nacimiento,
        u.genero,
        u.id_centro_principal,
        u.id_sucursal_principal,
        r.id_rol,
        r.nombre AS rol_nombre,
        r.nivel_jerarquia
      FROM usuarios u
      INNER JOIN usuarios_roles ur 
        ON ur.id_usuario = u.id_usuario AND ur.activo = 1
      INNER JOIN roles r 
        ON r.id_rol = ur.id_rol AND r.estado = 'activo'
      WHERE u.id_usuario = ? AND u.estado = 'activo'
      ORDER BY
        CASE
          WHEN LOWER(r.nombre) LIKE '%medico%' THEN 1
          WHEN LOWER(r.nombre) LIKE '%super%' THEN 2
          WHEN LOWER(r.nombre) LIKE '%admin%' THEN 3
          ELSE 4
        END,
        r.nivel_jerarquia DESC
      LIMIT 1
      `,
      [idUsuario]
    );

    if (rolesUsuario.length === 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: "Usuario no encontrado o inactivo",
          code: "USER_NOT_FOUND"
        },
        { status: 404 }
      );
    }

    const u = rolesUsuario[0];

    // 6️⃣ CARGAR PERMISOS DEL ROL
    const [permRows] = await pool.query<RowDataPacket[]>(
      `
      SELECT p.codigo
      FROM roles_permisos rp
      INNER JOIN permisos p ON p.id_permiso = rp.id_permiso
      WHERE rp.id_rol = ? AND p.estado = 'activo'
      `,
      [u.id_rol]
    );

    const permisos = permRows.map((p) => String(p.codigo));

    // 7️⃣ CONSTRUIR OBJETO USUARIO BASE
    const usuarioSesion: UsuarioSesion = {
      id_usuario: u.id_usuario,
      username: u.username,
      email: u.email,
      nombre: u.nombre,
      apellido_paterno: u.apellido_paterno,
      apellido_materno: u.apellido_materno,
      foto_perfil_url: u.foto_perfil_url,
      telefono: u.telefono,
      celular: u.celular,
      direccion: u.direccion,
      ciudad: u.ciudad,
      region: u.region,
      fecha_nacimiento: u.fecha_nacimiento,
      genero: u.genero,
      id_centro_principal: u.id_centro_principal ?? null,
      id_sucursal_principal: u.id_sucursal_principal ?? null,
      rol: {
        id_rol: u.id_rol,
        nombre: prettyRole(u.rol_nombre),
        nivel_jerarquia: u.nivel_jerarquia,
        permisos,
      },
      sesion_metadata: {
        id_sesion: sesionRow.id_sesion,
        token_expira_en: calculateTokenExpiry(sesionRow.fecha_expiracion),
        ultima_actividad: sesionRow.ultima_actividad,
        ip_address: sesionRow.ip_address,
        user_agent: sesionRow.user_agent,
        fecha_creacion: sesionRow.fecha_creacion,
        activa: Boolean(sesionRow.activa),
      },
    };

    // 8️⃣ CARGAR CENTRO PRINCIPAL (si existe)
    if (usuarioSesion.id_centro_principal) {
      const [centroRows] = await pool.query<RowDataPacket[]>(
        `
        SELECT 
          id_centro,
          nombre,
          plan,
          logo_url,
          ciudad,
          region
        FROM centros_medicos
        WHERE id_centro = ? AND estado = 'activo'
        LIMIT 1
        `,
        [usuarioSesion.id_centro_principal]
      );

      if (centroRows.length > 0) {
        const centro = centroRows[0];
        usuarioSesion.centro_principal = {
          id_centro: centro.id_centro,
          nombre: centro.nombre,
          plan: (centro.plan as any) || "basico",
          logo_url: centro.logo_url,
          ciudad: centro.ciudad,
          region: centro.region,
        };
      }
    }

    // 9️⃣ CARGAR INFO DE MÉDICO (si aplica)
    if (normalizeRole(u.rol_nombre).includes("medico")) {
      await loadMedicoInfo(usuarioSesion, idUsuario);
    }

    // 🔟 CARGAR INFO DE ADMINISTRATIVO (si aplica)
    if (normalizeRole(u.rol_nombre).includes("administrativo")) {
      await loadAdministrativoInfo(usuarioSesion, idUsuario);
    }

    // 1️⃣1️⃣ CARGAR INFO DE SECRETARIA (si aplica)
    if (normalizeRole(u.rol_nombre).includes("secretaria")) {
      await loadSecretariaInfo(usuarioSesion, idUsuario);
    }

    // 1️⃣2️⃣ CARGAR INFO DE TÉCNICO (si aplica)
    if (normalizeRole(u.rol_nombre).includes("tecnico")) {
      await loadTecnicoInfo(usuarioSesion, idUsuario);
    }

    // 1️⃣3️⃣ CARGAR INFO DE PACIENTE (si aplica)
    if (normalizeRole(u.rol_nombre).includes("paciente")) {
      await loadPacienteInfo(usuarioSesion, idUsuario);
    }

    // ✅ RESPONDER
    const responseTime = Date.now() - startTime;
    return NextResponse.json(
      { 
        success: true, 
        usuario: usuarioSesion,
        _meta: {
          responseTime: `${responseTime}ms`,
          timestamp: new Date().toISOString(),
        }
      },
      { status: 200 }
    );

  } catch (err: any) {
    console.error("❌ Error en GET /api/auth/session:", err);
    
    return NextResponse.json(
      {
        success: false,
        error: "Error interno del servidor",
        code: "INTERNAL_ERROR",
        details:
          process.env.NODE_ENV === "development"
            ? {
                message: err?.message,
                stack: err?.stack?.split("\n").slice(0, 5),
              }
            : undefined,
      },
      { status: 500 }
    );
  }
}

// ========================================
// FUNCIONES AUXILIARES PARA CARGAR DATOS
// ========================================

async function loadMedicoInfo(
  usuarioSesion: UsuarioSesion,
  idUsuario: number
): Promise<void> {
  try {
    const [medRows] = await pool.query<RowDataPacket[]>(
      `
      SELECT
        m.id_profesional,
        m.numero_registro_profesional,
        m.titulo_profesional,
        m.anos_experiencia,
        m.id_centro_principal AS med_id_centro_principal,
        cm.nombre AS centro_nombre,
        cm.plan,
        cm.logo_url,
        cm.ciudad AS centro_ciudad,
        cm.region AS centro_region
      FROM profesionales_salud m
      LEFT JOIN centros_medicos cm 
        ON cm.id_centro = m.id_centro_principal
      WHERE m.id_usuario = ? 
        AND m.estado = 'activo'
      LIMIT 1
      `,
      [idUsuario]
    );

    // No existe profesional → no bloquear sesión
    if (medRows.length === 0) {
      console.warn(`⚠ Usuario ${idUsuario} tiene rol médico pero no tiene registro en profesionales_salud.`);
      return;
    }

    const med = medRows[0];

    // Cargar especialidades reales
    const [espRows] = await pool.query<RowDataPacket[]>(
      `
      SELECT 
        e.id_especialidad, 
        e.nombre, 
        pe.es_principal
      FROM profesionales_especialidades pe
      INNER JOIN especialidades e 
        ON e.id_especialidad = pe.id_especialidad
      WHERE pe.id_profesional = ?
      ORDER BY pe.es_principal DESC, e.nombre ASC
      `,
      [med.id_profesional]
    );

    usuarioSesion.medico = {
      id_profesional: med.id_profesional,
      numero_registro_medico: med.numero_registro_profesional ?? "SIN-REGISTRO",
      titulo_profesional: med.titulo_profesional,
      anos_experiencia: med.anos_experiencia ?? 0,
      especialidad_principal:
        espRows.find((e) => e.es_principal)?.nombre ?? null,
      especialidades: espRows.map((e) => ({
        id_especialidad: e.id_especialidad,
        nombre: e.nombre,
        es_principal: Boolean(e.es_principal),
      })),
      id_centro_principal: med.med_id_centro_principal,
      centro_principal: med.med_id_centro_principal
        ? {
            id_centro: med.med_id_centro_principal,
            nombre: med.centro_nombre,
            plan: med.plan || "basico",
            logo_url: med.logo_url,
            ciudad: med.centro_ciudad,
            region: med.centro_region,
          }
        : null,
    };
  } catch (err) {
    console.error("❌ Error cargando info de médico:", err);
  }
}


async function loadAdministrativoInfo(
  usuarioSesion: UsuarioSesion,
  idUsuario: number
): Promise<void> {
  try {
    const [adminRows] = await pool.query<RowDataPacket[]>(
      `
      SELECT
        id_administrativo,
        cargo,
        nivel_acceso,
        id_centro,
        id_sucursal
      FROM administrativos
      WHERE id_usuario = ? AND estado = 'activo'
      LIMIT 1
      `,
      [idUsuario]
    );

    if (adminRows.length > 0) {
      const admin = adminRows[0];
      usuarioSesion.administrativo = {
        id_administrativo: admin.id_administrativo,
        cargo: admin.cargo,
        nivel_acceso: admin.nivel_acceso,
        id_centro: admin.id_centro,
        id_sucursal: admin.id_sucursal,
      };
    }
  } catch (err) {
    console.error("❌ Error cargando info de administrativo:", err);
  }
}

async function loadSecretariaInfo(
  usuarioSesion: UsuarioSesion,
  idUsuario: number
): Promise<void> {
  try {
    const [secRows] = await pool.query<RowDataPacket[]>(
      `
      SELECT
        id_secretaria,
        id_centro,
        id_sucursal
      FROM secretarias
      WHERE id_usuario = ? AND estado = 'activo'
      LIMIT 1
      `,
      [idUsuario]
    );

    if (secRows.length > 0) {
      const sec = secRows[0];
      usuarioSesion.secretaria = {
        id_secretaria: sec.id_secretaria,
        id_centro: sec.id_centro,
        id_sucursal: sec.id_sucursal,
      };
    }
  } catch (err) {
    console.error("❌ Error cargando info de secretaria:", err);
  }
}

async function loadTecnicoInfo(
  usuarioSesion: UsuarioSesion,
  idUsuario: number
): Promise<void> {
  try {
    const [tecRows] = await pool.query<RowDataPacket[]>(
      `
      SELECT
        id_tecnico,
        area_tecnica,
        nivel_acceso,
        id_centro
      FROM tecnicos
      WHERE id_usuario = ? AND estado = 'activo'
      LIMIT 1
      `,
      [idUsuario]
    );

    if (tecRows.length > 0) {
      const tec = tecRows[0];
      usuarioSesion.tecnico = {
        id_tecnico: tec.id_tecnico,
        area_tecnica: tec.area_tecnica,
        nivel_acceso: tec.nivel_acceso,
        id_centro: tec.id_centro,
      };
    }
  } catch (err) {
    console.error("❌ Error cargando info de técnico:", err);
  }
}

async function loadPacienteInfo(
  usuarioSesion: UsuarioSesion,
  idUsuario: number
): Promise<void> {
  try {
    const [pacRows] = await pool.query<RowDataPacket[]>(
      `
      SELECT
        id_paciente,
        numero_historia_clinica,
        fecha_nacimiento
      FROM pacientes
      WHERE id_usuario = ? AND estado = 'activo'
      LIMIT 1
      `,
      [idUsuario]
    );

    if (pacRows.length > 0) {
      const pac = pacRows[0];
      usuarioSesion.paciente = {
        id_paciente: pac.id_paciente,
        numero_historia_clinica: pac.numero_historia_clinica,
        fecha_nacimiento: pac.fecha_nacimiento,
      };
    }
  } catch (err) {
    console.error("❌ Error cargando info de paciente:", err);
  }
}
