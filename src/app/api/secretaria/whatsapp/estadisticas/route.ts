import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  try {
    const supabase = await getSupabaseServer();
    const { searchParams } = new URL(request.url);
    const id_secretaria = searchParams.get("id_secretaria");

    if (!id_secretaria) {
      return NextResponse.json(
        { success: false, error: "ID de secretaria requerido" },
        { status: 400 }
      );
    }

    // Calcular estadísticas de WhatsApp
    // Por ahora retornamos datos de ejemplo
    const estadisticas = {
      mensajes_enviados_hoy: 45,
      mensajes_recibidos_hoy: 38,
      conversaciones_activas: 12,
      tasa_respuesta: 95,
      tiempo_promedio_respuesta: 8, // minutos
      plantillas_mas_usadas: [
        {
          id_plantilla: 1,
          nombre: "Recordatorio de Cita",
          contenido:
            "Hola {{nombre}}, te recordamos tu cita con {{medico}} el día {{fecha}} a las {{hora}}. Por favor confirma tu asistencia.",
          categoria: "recordatorio",
          variables: ["nombre", "medico", "fecha", "hora"],
          uso_frecuente: true,
          veces_usada: 245,
        },
        {
          id_plantilla: 2,
          nombre: "Confirmación de Cita",
          contenido:
            "¡Perfecto {{nombre}}! Tu cita ha sido confirmada para el {{fecha}} a las {{hora}}.",
          categoria: "confirmacion",
          variables: ["nombre", "fecha", "hora"],
          uso_frecuente: true,
          veces_usada: 189,
        },
        {
          id_plantilla: 3,
          nombre: "Saludo Inicial",
          contenido:
            "Hola {{nombre}}, soy {{secretaria}} del Centro Médico {{centro}}. ¿En qué puedo ayudarte hoy?",
          categoria: "general",
          variables: ["nombre", "secretaria", "centro"],
          uso_frecuente: true,
          veces_usada: 156,
        },
      ],
    };

    return NextResponse.json({
      success: true,
      estadisticas,
    });
  } catch (error) {
    console.error("Error al obtener estadísticas:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Error al obtener estadísticas",
      },
      { status: 500 }
    );
  }
}
