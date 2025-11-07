// frontend/src/app/api/auth/login/route.ts

// ============================================================
// 🔐 Login API - MediSuite Pro (MySQL + JWT) | Next.js 14 App Router
// ============================================================

export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getUserByEmail } from "@/lib/db";
import { signSession, verifyPassword } from "@/lib/auth";
import pool from "@/lib/db";

// ------------------------------------------------------------
// 🧩 Esquema de validación
// ------------------------------------------------------------
const LoginSchema = z.object({
  email: z.string().email("Correo inválido"),
  password: z.string().min(6, "Mínimo 6 caracteres"),
});

// ------------------------------------------------------------
// 🧩 Helpers de roles
// ------------------------------------------------------------
function quitarAcentos(s: string) {
  return (s || "").normalize("NFD").replace(/\p{Diacritic}/gu, "");
}

function rolToPath(rolRaw?: string): string {
  const r = quitarAcentos((rolRaw || "usuario").toLowerCase().trim());
  if (r.includes("superadmin") || r.includes("superadministrador")) return "/admin";
  if (r.includes("tecnico")) return "/tecnico";
  if (r.includes("administrativo")) return "/administrativo";
  if (r.includes("secretaria")) return "/secretaria";
  if (r.includes("medico")) return "/medico";
  return "/dashboard";
}

// ------------------------------------------------------------
// 🧩 Endpoint principal
// ------------------------------------------------------------
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = LoginSchema.parse(body);

    // 1) Buscar usuario (ya con la versión que prioriza MÉDICO en src/lib/db.ts)
    const user = await getUserByEmail(email);

    if (!user) {
      return NextResponse.json(
        { ok: false, error: "Usuario no encontrado" },
        { status: 404 }
      );
    }

    if (user.estado && user.estado !== "activo") {
      return NextResponse.json(
        { ok: false, error: "Usuario inactivo" },
        { status: 403 }
      );
    }

    // 2) Verificar password
    const hash = user.password_hash || user.password || "";
    const valid = await verifyPassword(String(password), String(hash));

    if (!valid) {
      return NextResponse.json(
        { ok: false, error: "Contraseña incorrecta" },
        { status: 401 }
      );
    }

    // 3) Redirección según rol
    const redirectTo = rolToPath(user.rol);

    // 4) Firmar token JWT (el mismo que pondremos en la cookie y en la tabla)
    const token = signSession({
      id: user.id_usuario,
      email: user.email,
      rol: user.rol || "usuario",
    });

    // 5) Guardar sesión en la tabla que usa tu endpoint de telemedicina
    //    IMPORTANTE: que sesiones_usuarios tenga UNIQUE(token)
    await pool.query(
      `
      INSERT INTO sesiones_usuarios (
        id_usuario,
        token,
        activa,
        fecha_creacion,
        fecha_expiracion,
        ultima_actividad
      ) VALUES (
        ?, ?, 1, NOW(), DATE_ADD(NOW(), INTERVAL 8 HOUR), NOW()
      )
      ON DUPLICATE KEY UPDATE
        activa = 1,
        fecha_expiracion = VALUES(fecha_expiracion),
        ultima_actividad = NOW()
      `,
      [user.id_usuario, token]
    );

    // 6) Responder con cookie
    const res = NextResponse.json(
      {
        ok: true,
        message: "Inicio de sesión exitoso",
        user: {
          id: user.id_usuario,
          email: user.email,
          nombre: user.nombre,
          apellido: user.apellido_paterno,
          rol: user.rol || "usuario",
        },
        redirectTo,
      },
      {
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );

    // Cookie JWT
    res.cookies.set("session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 8, // 8 horas
    });

    return res;
  } catch (err: any) {
    console.error("❌ LOGIN ERROR:", err?.message || err);
    return NextResponse.json(
      { ok: false, error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
