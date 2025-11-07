// app/api/auth/session/route.ts
// ✅ Verificación de sesión (JWT) + chequeo en tabla sesiones_usuarios
// Compatible con Next.js 14 (App Router)

export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { RowDataPacket } from "mysql2";
import { verifyToken } from "@/lib/auth";

// ----------------------------------------
// Tipos
// ----------------------------------------
interface UsuarioSesion {
  id_usuario: number;
  username: string;
  email: string;
  nombre: string;
  apellido_paterno: string;
  apellido_materno: string | null;
  foto_perfil_url: string | null;
  rol: {
    id_rol: number;
    nombre: string;
    nivel_jerarquia: number;
    permisos: string[];
  };
  medico?: {
    id_medico: number;
    numero_registro_medico: string;
    titulo_profesional: string;
    especialidades: Array<{
      id_especialidad: number;
      nombre: string;
      es_principal: boolean;
    }>;
    id_centro_principal: number;
    centro_principal: {
      id_centro: number;
      nombre: string;
      // ampliamos los planes que usas en FE
      plan: "basico" | "profesional" | "premium" | "empresarial";
      logo_url: string | null;
      ciudad: string;
      region: string;
    };
  };
}

// ----------------------------------------
// Helpers
// ----------------------------------------
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
  return s || "Usuario";
}

// toma token desde cookie o desde Authorization
function getTokenFromRequest(req: NextRequest): string | null {
  // 1) cookie "session"
  const cookieToken = req.cookies.get("session")?.value;
  if (cookieToken) return cookieToken;

  // 2) Authorization: Bearer ...
  const authLower = req.headers.get("authorization");
  const authUpper = req.headers.get("Authorization");
  const auth = authLower || authUpper;
  if (auth && auth.startsWith("Bearer ")) {
    return auth.slice(7);
  }

  return null;
}

// ----------------------------------------
// Handler principal
// ----------------------------------------
export async function GET(req: NextRequest) {
  try {
    // 1️⃣ leer token de la request
    const token = getTokenFromRequest(req);
    if (!token) {
      return NextResponse.json(
        { success: false, error: "No hay sesión activa" },
        { status: 401 }
      );
    }

    // 2️⃣ verificar JWT
    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json(
        { success: false, error: "Sesión inválida o expirada (token)" },
        { status: 401 }
      );
    }

    // id dentro del JWT (según tu login)
    const idUsuario = Number(payload.id ?? payload.userId ?? payload.uid);
    if (!idUsuario) {
      return NextResponse.json(
        { success: false, error: "Token sin id de usuario" },
        { status: 401 }
      );
    }

    // 3️⃣ comprobar que esa sesión está viva en tu tabla sesiones_usuarios
    // (esto lo hicimos en el login nuevo, así que lo chequeamos aquí también)
    const [sesRows] = await pool.query<RowDataPacket[]>(
      `
      SELECT su.id_usuario
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
      // hay token JWT, pero no hay sesión en tabla → la consideramos expirada
      return NextResponse.json(
        { success: false, error: "Sesión inválida o expirada" },
        { status: 401 }
      );
    }

    // opcional: actualizar última actividad
    await pool.query(
      `UPDATE sesiones_usuarios SET ultima_actividad = NOW() WHERE token = ?`,
      [token]
    );

    // 4️⃣ Cargar usuario + roles
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
        r.id_rol,
        r.nombre AS rol_nombre,
        r.nivel_jerarquia
      FROM usuarios u
      INNER JOIN usuarios_roles ur ON ur.id_usuario = u.id_usuario AND ur.activo = 1
      INNER JOIN roles r ON r.id_rol = ur.id_rol AND r.estado = 'activo'
      WHERE u.id_usuario = ? AND u.estado = 'activo'
      ORDER BY
        CASE
          WHEN LOWER(r.nombre) LIKE '%medico%' THEN 1
          WHEN LOWER(r.nombre) LIKE '%super%' THEN 2
          ELSE 3
        END,
        r.nivel_jerarquia DESC
      `,
      [idUsuario]
    );

    if (rolesUsuario.length === 0) {
      return NextResponse.json(
        { success: false, error: "Usuario no encontrado o inactivo" },
        { status: 404 }
      );
    }

    const u = rolesUsuario[0];

    // 5️⃣ Permisos del rol
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

    const usuarioSesion: UsuarioSesion = {
      id_usuario: u.id_usuario,
      username: u.username,
      email: u.email,
      nombre: u.nombre,
      apellido_paterno: u.apellido_paterno,
      apellido_materno: u.apellido_materno,
      foto_perfil_url: u.foto_perfil_url,
      rol: {
        id_rol: u.id_rol,
        nombre: prettyRole(u.rol_nombre),
        nivel_jerarquia: u.nivel_jerarquia,
        permisos,
      },
    };

    // 6️⃣ Si el rol principal es médico → anexar info de médico y centro (con plan premium/profesional)
    if (normalizeRole(u.rol_nombre).includes("medico")) {
      const [medRows] = await pool.query<RowDataPacket[]>(
        `
        SELECT
          m.id_medico,
          m.numero_registro_medico,
          m.titulo_profesional,
          m.id_centro_principal,
          cm.nombre AS centro_nombre,
          cm.plan,
          cm.logo_url,
          cm.ciudad,
          cm.region
        FROM medicos m
        LEFT JOIN centros_medicos cm ON cm.id_centro = m.id_centro_principal
        WHERE m.id_usuario = ? AND m.estado IN ('activo', 'habilitado')
        ORDER BY m.id_medico DESC
        LIMIT 1
        `,
        [idUsuario]
      );

      if (medRows.length > 0) {
        const med = medRows[0];

        const [espRows] = await pool.query<RowDataPacket[]>(
          `
          SELECT e.id_especialidad, e.nombre, me.es_principal
          FROM medicos_especialidades me
          INNER JOIN especialidades e ON e.id_especialidad = me.id_especialidad
          WHERE me.id_medico = ?
          ORDER BY me.es_principal DESC, e.nombre ASC
          `,
          [med.id_medico]
        );

        // normalizamos el plan a los que usas en FE
        const planDb = (med.plan as string) || "basico";
        const planNormalizado =
          planDb === "premium" ||
          planDb === "profesional" ||
          planDb === "empresarial" ||
          planDb === "basico"
            ? (planDb as "basico" | "profesional" | "premium" | "empresarial")
            : "basico";

        usuarioSesion.medico = {
          id_medico: med.id_medico,
          numero_registro_medico: med.numero_registro_medico ?? "SIN-REGISTRO",
          titulo_profesional: med.titulo_profesional ?? "Médico",
          especialidades: espRows.map((e) => ({
            id_especialidad: e.id_especialidad,
            nombre: e.nombre,
            es_principal: Boolean(e.es_principal),
          })),
          id_centro_principal: med.id_centro_principal ?? 0,
          centro_principal: {
            id_centro: med.id_centro_principal ?? 0,
            nombre: med.centro_nombre ?? "Centro Médico No Asignado",
            plan: planNormalizado,
            logo_url: med.logo_url ?? null,
            ciudad: med.ciudad ?? "No definida",
            region: med.region ?? "No definida",
          },
        };
      } else {
        console.warn(
          `⚠️ Usuario ${idUsuario} tiene rol MÉDICO pero no registro en tabla 'medicos'.`
        );
      }
    }

    // 7️⃣ responder
    return NextResponse.json(
      { success: true, usuario: usuarioSesion },
      { status: 200 }
    );
  } catch (err: any) {
    console.error("❌ Error en GET /api/auth/session:", err);
    return NextResponse.json(
      {
        success: false,
        error: "Error interno del servidor",
        details:
          process.env.NODE_ENV === "development"
            ? String(err?.message ?? err)
            : undefined,
      },
      { status: 500 }
    );
  }
}
