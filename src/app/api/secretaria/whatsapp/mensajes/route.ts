import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  try {
    const supabase = await getSupabaseServer();
    const { searchParams } = new URL(request.url);
    const id_conversacion = searchParams.get("id_conversacion");

    if (!id_conversacion) {
      return NextResponse.json(
        { success: false, error: "ID de conversación requerido" },
        { status: 400 }
      );
    }

    // Obtener mensajes de la conversación
    // Por ahora retornamos datos de ejemplo
    const mensajesEjemplo = [
      {
        id_mensaje: 1,
        id_conversacion: parseInt(id_conversacion),
        contenido: "Hola, buenos días. Soy la secretaria del Centro Médico. ¿En qué puedo ayudarle?",
        fecha_hora: new Date(Date.now() - 86400000).toISOString(),
        enviado_por_secretaria: true,
        leido: true,
        entregado: true,
        tipo: "texto",
        archivo_url: null,
        archivo_nombre: null,
        metadata: null,
      },
      {
        id_mensaje: 2,
        id_conversacion: parseInt(id_conversacion),
        contenido: "Hola, quería agendar una hora con el Dr. Pérez",
        fecha_hora: new Date(Date.now() - 82800000).toISOString(),
        enviado_por_secretaria: false,
        leido: true,
        entregado: true,
        tipo: "texto",
        archivo_url: null,
        archivo_nombre: null,
        metadata: null,
      },
      {
        id_mensaje: 3,
        id_conversacion: parseInt(id_conversacion),
        contenido: "Por supuesto. ¿Qué tipo de consulta necesita?",
        fecha_hora: new Date(Date.now() - 82200000).toISOString(),
        enviado_por_secretaria: true,
        leido: true,
        entregado: true,
        tipo: "texto",
        archivo_url: null,
        archivo_nombre: null,
        metadata: null,
      },
      {
        id_mensaje: 4,
        id_conversacion: parseInt(id_conversacion),
        contenido: "Una consulta general, tengo algunos dolores de cabeza recurrentes",
        fecha_hora: new Date(Date.now() - 81600000).toISOString(),
        enviado_por_secretaria: false,
        leido: true,
        entregado: true,
        tipo: "texto",
        archivo_url: null,
        archivo_nombre: null,
        metadata: null,
      },
      {
        id_mensaje: 5,
        id_conversacion: parseInt(id_conversacion),
        contenido: "Entendido. Tengo disponibilidad mañana a las 10:00 o 15:00. ¿Cuál prefiere?",
        fecha_hora: new Date(Date.now() - 81000000).toISOString(),
        enviado_por_secretaria: true,
        leido: true,
        entregado: true,
        tipo: "texto",
        archivo_url: null,
        archivo_nombre: null,
        metadata: null,
      },
      {
        id_mensaje: 6,
        id_conversacion: parseInt(id_conversacion),
        contenido: "A las 10:00 me viene perfecto",
        fecha_hora: new Date(Date.now() - 80400000).toISOString(),
        enviado_por_secretaria: false,
        leido: true,
        entregado: true,
        tipo: "texto",
        archivo_url: null,
        archivo_nombre: null,
        metadata: null,
      },
      {
        id_mensaje: 7,
        id_conversacion: parseInt(id_conversacion),
        contenido: "¡Perfecto! Su cita ha sido agendada para mañana a las 10:00 con el Dr. Pérez. Le enviaré un recordatorio antes de su cita. ¿Necesita algo más?",
        fecha_hora: new Date(Date.now() - 79800000).toISOString(),
        enviado_por_secretaria: true,
        leido: true,
        entregado: true,
        tipo: "texto",
        archivo_url: null,
        archivo_nombre: null,
        metadata: { cita_id: 123 },
      },
      {
        id_mensaje: 8,
        id_conversacion: parseInt(id_conversacion),
        contenido: "No, eso es todo. ¡Muchas gracias!",
        fecha_hora: new Date(Date.now() - 79200000).toISOString(),
        enviado_por_secretaria: false,
        leido: true,
        entregado: true,
        tipo: "texto",
        archivo_url: null,
        archivo_nombre: null,
        metadata: null,
      },
    ];

    return NextResponse.json({
      success: true,
      mensajes: mensajesEjemplo,
    });
  } catch (error) {
    console.error("Error al obtener mensajes:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Error al obtener mensajes",
      },
      { status: 500 }
    );
  }
}
