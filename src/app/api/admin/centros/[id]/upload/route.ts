// frontend\src\app\api\admin\centros\[id]\upload\route.ts
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import path from "path";

export async function POST(request: Request) {
  try {
    console.log("📤 POST /api/upload");

    const formData = await request.formData();
    const file = formData.get("file") as File;
    const tipo = formData.get("tipo") as string;

    if (!file) {
      return NextResponse.json(
        { success: false, error: "No se proporcionó archivo" },
        { status: 400 }
      );
    }

    // Validar tipo de archivo
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/svg+xml"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { success: false, error: "Tipo de archivo no permitido. Solo JPG, PNG, WEBP o SVG" },
        { status: 400 }
      );
    }

    // Validar tamaño (máximo 5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        { success: false, error: "El archivo es demasiado grande. Máximo 5MB" },
        { status: 400 }
      );
    }

    // Crear directorio según tipo
    const uploadDir = join(process.cwd(), "public", "uploads", tipo || "general");
    await mkdir(uploadDir, { recursive: true });

    // Generar nombre único
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(7);
    const extension = path.extname(file.name);
    const filename = `${tipo}_${timestamp}_${random}${extension}`;
    const filepath = join(uploadDir, filename);

    // Guardar archivo
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filepath, buffer);

    // URL pública
    const url = `/uploads/${tipo}/${filename}`;

    console.log(`✅ Archivo subido: ${filename}`);

    return NextResponse.json({
      success: true,
      message: "Archivo subido exitosamente",
      url: url,
      filename: filename,
      tipo: tipo,
    });
  } catch (error: any) {
    console.error("❌ Error en POST /api/upload:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Error al subir archivo",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
