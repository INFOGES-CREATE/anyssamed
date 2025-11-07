// frontend/src/app/api/auth/logout/route.ts

import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    // leer token de cookie
    const token = req.cookies.get("session")?.value;

    if (token) {
      // marcar sesión como inactiva
      await pool.query(
        `
        UPDATE sesiones_usuarios
        SET activa = 0, fecha_expiracion = NOW()
        WHERE token = ?
        `,
        [token]
      );
    }

    const res = NextResponse.json(
      { ok: true, message: "Sesión cerrada" },
      { status: 200 }
    );

    // borrar cookie
    res.cookies.set("session", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 0,
    });

    return res;
  } catch (error: any) {
    console.error("❌ LOGOUT ERROR:", error?.message || error);
    return NextResponse.json(
      { ok: false, error: "Error cerrando sesión" },
      { status: 500 }
    );
  }
}
