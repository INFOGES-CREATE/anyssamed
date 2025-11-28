import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const supabase = await getSupabaseServer();
    const body = await request.json();
    const { id_conversacion, contenido, tipo } = body;

    if (!id_conversacion || !contenido) {
      return NextResponse.json(
        { success: false, error: "Datos incompletos" },
        { status: 400 }
      );
    }

    // Aquí se integraría con la API de WhatsApp Business
    // Por ahora simulamos el envío

    // Simular delay de envío
    await new Promise((resolve) => setTimeout(resolve, 500));

    // En producción, aquí iría:
    // 1. Envío a la API de WhatsApp Business
    // 2. Guardar el mensaje en la base de datos
    // 3. Actualizar el estado de la conversación
    // 4. Enviar notificación en tiempo real (WebSocket/Pusher)

    const nuevoMensaje = {
      id_mensaje: Date.now(),
      id_conversacion,
      contenido,
      fecha_hora: new Date().toISOString(),
      enviado_por_secretaria: true,
      leido: false,
      entregado: true,
      tipo: tipo || "texto",
      archivo_url: null,
      archivo_nombre: null,
      metadata: null,
    };

    // Aquí se guardaría en la base de datos
    // const { data, error } = await supabase
    //   .from('whatsapp_mensajes')
    //   .insert(nuevoMensaje)
    //   .select()
    //   .single();

    return NextResponse.json({
      success: true,
      mensaje: nuevoMensaje,
      info: "Mensaje enviado correctamente (modo demo)",
    });
  } catch (error) {
    console.error("Error al enviar mensaje:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Error al enviar mensaje",
      },
      { status: 500 }
    );
  }
}
