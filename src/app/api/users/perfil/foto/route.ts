//frontend\src\app\api\users\perfil\foto\route.ts

import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { RowDataPacket } from "mysql2";
import fs from "fs/promises";
import { existsSync } from "fs";
import path from "path";

export const dynamic = "force-dynamic";

// las mismas cookies que usas en las demás rutas
const SESSION_COOKIE_CANDIDATES = [
  "session",
  "session_token",
  "medisalud_session",
  "auth_session",
  "next-auth.session-token",
  "__Secure-next-auth.session-token",
];

function getSessionToken(request: NextRequest): string | null {
  const cookieHeader = request.headers.get("cookie") || "";

  if (cookieHeader) {
    const cookies = cookieHeader
      .split(";")
      .map((c) => c.trim())
      .filter(Boolean)
      .reduce((acc, c) => {
        const [k, ...rest] = c.split("=");
        acc[k] = rest.join("=");
        return acc;
      }, {} as Record<string, string>);

    for (const name of SESSION_COOKIE_CANDIDATES) {
      if (cookies[name]) {
        return decodeURIComponent(cookies[name]);
      }
    }
  }

  const auth = request.headers.get("authorization");
  if (auth?.startsWith("Bearer ")) {
    return auth.slice(7);
  }

  return null;
}

async function guardarArchivoFoto(file: File, idUsuario: number): Promise<string> {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const mime = file.type || "image/jpeg";
  const ext = mime.split("/")[1] || "jpg";

  const uploadDir = path.join(process.cwd(), "public", "uploads", "perfiles");
  if (!existsSync(uploadDir)) {
    await fs.mkdir(uploadDir, { recursive: true });
  }

  const filename = `perfil-${idUsuario}-${Date.now()}.${ext}`;
  const filepath = path.join(uploadDir, filename);

  await fs.writeFile(filepath, buffer);

  // url pública
  return `/uploads/perfiles/${filename}`;
}

export async function POST(request: NextRequest) {
  try {
    // 1. sesión
    const sessionToken = getSessionToken(request);
    if (!sessionToken) {
      return NextResponse.json(
        { success: false, error: "No hay sesión activa" },
        { status: 401 }
      );
    }

    const [sesiones] = await pool.query<RowDataPacket[]>(
      `
      SELECT su.id_usuario
      FROM sesiones_usuarios su
      INNER JOIN usuarios u ON u.id_usuario = su.id_usuario
      WHERE su.token = ?
        AND su.activa = 1
        AND (su.fecha_expiracion IS NULL OR su.fecha_expiracion > NOW())
        AND u.estado = 'activo'
      LIMIT 1
      `,
      [sessionToken]
    );

    if (sesiones.length === 0) {
      return NextResponse.json(
        { success: false, error: "Sesión inválida o expirada" },
        { status: 401 }
      );
    }

    const idUsuario = sesiones[0].id_usuario;

    // 2. recibir form-data (tu front manda FormData con "foto")
    const contentType = request.headers.get("content-type") || "";
    if (!contentType.includes("multipart/form-data")) {
      return NextResponse.json(
        { success: false, error: "Se esperaba multipart/form-data" },
        { status: 400 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("foto") as File | null;

    if (!file) {
      return NextResponse.json(
        { success: false, error: "No se recibió el archivo 'foto'" },
        { status: 400 }
      );
    }

    // 3. guardar archivo en /public/uploads/perfiles
    const nuevaUrl = await guardarArchivoFoto(file, idUsuario);

    // 4. actualizar en la tabla usuarios
    await pool.query(
      `UPDATE usuarios SET foto_perfil_url = ?, fecha_modificacion = NOW() WHERE id_usuario = ?`,
      [nuevaUrl, idUsuario]
    );

    // 5. responder igual que espera tu front
    return NextResponse.json(
      {
        success: true,
        message: "Foto de perfil actualizada",
        foto_perfil_url: nuevaUrl,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("❌ Error en POST /api/users/perfil/foto:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Error al subir la foto",
        details: process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}

// si alguien hace GET a esta ruta:
export async function GET() {
  return NextResponse.json(
    { success: false, error: "Método no permitido" },
    { status: 405 }
  );
}
