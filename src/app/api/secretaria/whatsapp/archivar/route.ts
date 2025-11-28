import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase/server";

export async function PUT(request: NextRequest) {
  try {
    const supabase = await getSupabaseServer();
    const body = await request.json();
    const { id_conversacion } = body;

    if (!id_conversacion) {
      return NextResponse.json(
        { success: false, error: "ID de conversación requerido" },
        { status: 400 }
      );
    }

    // Archivar la conversación
    // Por ahora simulamos la operación

    // En producción:
    // const { data, error } = await supabase
    //   .from('whatsapp_conversaciones')
    //   .update({ estado: 'archivada', fecha_archivado: new Date().toISOString() })
    //   .eq('id_conversacion', id_conversacion);

    return NextResponse.json({
      success: true,
      message: "Conversación archivada correctamente",
    });
  } catch (error) {
    console.error("Error al archivar conversación:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Error al archivar conversación",
      },
      { status: 500 }
    );
  }
}
