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

    // Marcar todos los mensajes de la conversación como leídos
    // Por ahora simulamos la operación

    // En producción:
    // const { data, error } = await supabase
    //   .from('whatsapp_mensajes')
    //   .update({ leido: true })
    //   .eq('id_conversacion', id_conversacion)
    //   .eq('enviado_por_secretaria', false)
    //   .eq('leido', false);

    return NextResponse.json({
      success: true,
      message: "Mensajes marcados como leídos",
    });
  } catch (error) {
    console.error("Error al marcar como leído:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Error al marcar como leído",
      },
      { status: 500 }
    );
  }
}
