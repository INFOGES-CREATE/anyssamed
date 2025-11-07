// ============================================================
// 📁 Subida de imágenes (logo/banner) de micrositios
// ✅ Sin uso de Buffer
// ✅ Compatible con Next.js 14+ (App Router)
// ============================================================

import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { existsSync } from "fs";
import path from "path";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const tipo = formData.get("tipo") as string; // 'logo' o 'banner'
    const centro_id = formData.get("centro_id") as string;

    // ------------------------------------------------------------
    // Validaciones
    // ------------------------------------------------------------
    if (!file) {
      return NextResponse.json(
        { success: false, error: "No se proporcionó ningún archivo" },
        { status: 400 }
      );
    }

    const validTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "image/webp",
    ];
    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        { success: false, error: "Tipo de archivo no válido" },
        { status: 400 }
      );
    }

    const maxSize = tipo === "banner" ? 10 * 1024 * 1024 : 5 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        { success: false, error: "Archivo demasiado grande" },
        { status: 400 }
      );
    }

    // ------------------------------------------------------------
    // Crear directorio si no existe
    // ------------------------------------------------------------
    const uploadDir = path.join(
      process.cwd(),
      "public",
      "uploads",
      "micrositios",
      centro_id
    );

    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    // ------------------------------------------------------------
    // Generar nombre y ruta del archivo
    // ------------------------------------------------------------
    const timestamp = Date.now();
    const extension = file.name.split(".").pop();
    const fileName = `${tipo}-${timestamp}.${extension}`;
    const filePath = path.join(uploadDir, fileName);

    // ------------------------------------------------------------
    // Guardar el archivo sin usar Buffer
    // ------------------------------------------------------------
    const bytes = new Uint8Array(await file.arrayBuffer());
    await writeFile(filePath, bytes);

    // ------------------------------------------------------------
    // URL pública del archivo
    // ------------------------------------------------------------
    const fileUrl = `/uploads/micrositios/${centro_id}/${fileName}`;

    // ------------------------------------------------------------
    // Respuesta final
    // ------------------------------------------------------------
    return NextResponse.json({
      success: true,
      url: fileUrl,
      fileName,
      tipo,
    });
  } catch (error: any) {
    console.error("Error al subir archivo:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Error al subir el archivo",
      },
      { status: 500 }
    );
  }
}
