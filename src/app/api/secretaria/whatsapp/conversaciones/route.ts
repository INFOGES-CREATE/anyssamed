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

    // Obtener conversaciones de WhatsApp para esta secretaria
    // Por ahora retornamos datos de ejemplo, luego se conectará a la base de datos
    const conversacionesEjemplo = [
      {
        id_conversacion: 1,
        paciente: {
          id_paciente: 1,
          nombre_completo: "María González Pérez",
          foto_url: null,
          telefono: "+56912345678",
          whatsapp: "+56912345678",
          email: "maria.gonzalez@example.com",
        },
        ultimo_mensaje: {
          contenido: "Perfecto, nos vemos mañana a las 10:00. ¡Muchas gracias!",
          fecha_hora: new Date().toISOString(),
          enviado_por_secretaria: false,
          leido: true,
          tipo: "texto",
        },
        mensajes_sin_leer: 0,
        estado: "activa",
        etiquetas: ["cita-confirmada"],
        prioridad: "normal",
        tiene_cita_pendiente: true,
        proxima_cita: new Date(Date.now() + 86400000).toISOString(),
      },
      {
        id_conversacion: 2,
        paciente: {
          id_paciente: 2,
          nombre_completo: "Juan Pérez Morales",
          foto_url: null,
          telefono: "+56987654321",
          whatsapp: "+56987654321",
          email: null,
        },
        ultimo_mensaje: {
          contenido: "Buenos días, quería consultar por una hora para endodoncia",
          fecha_hora: new Date(Date.now() - 3600000).toISOString(),
          enviado_por_secretaria: false,
          leido: false,
          tipo: "texto",
        },
        mensajes_sin_leer: 2,
        estado: "activa",
        etiquetas: ["nuevo-paciente"],
        prioridad: "alta",
        tiene_cita_pendiente: false,
        proxima_cita: null,
      },
      {
        id_conversacion: 3,
        paciente: {
          id_paciente: 3,
          nombre_completo: "Ana Martínez Silva",
          foto_url: null,
          telefono: "+56923456789",
          whatsapp: "+56923456789",
          email: "ana.martinez@example.com",
        },
        ultimo_mensaje: {
          contenido: "Gracias por la información sobre los resultados",
          fecha_hora: new Date(Date.now() - 7200000).toISOString(),
          enviado_por_secretaria: false,
          leido: true,
          tipo: "texto",
        },
        mensajes_sin_leer: 0,
        estado: "activa",
        etiquetas: ["resultados"],
        prioridad: "normal",
        tiene_cita_pendiente: false,
        proxima_cita: null,
      },
      {
        id_conversacion: 4,
        paciente: {
          id_paciente: 4,
          nombre_completo: "Carlos Rodríguez López",
          foto_url: null,
          telefono: "+56934567890",
          whatsapp: "+56934567890",
          email: null,
        },
        ultimo_mensaje: {
          contenido: "¿Podría cambiar mi cita de mañana?",
          fecha_hora: new Date(Date.now() - 1800000).toISOString(),
          enviado_por_secretaria: false,
          leido: false,
          tipo: "texto",
        },
        mensajes_sin_leer: 1,
        estado: "activa",
        etiquetas: ["reagendamiento"],
        prioridad: "alta",
        tiene_cita_pendiente: true,
        proxima_cita: new Date(Date.now() + 86400000).toISOString(),
      },
    ];

    return NextResponse.json({
      success: true,
      conversaciones: conversacionesEjemplo,
    });
  } catch (error) {
    console.error("Error al obtener conversaciones de WhatsApp:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Error al obtener conversaciones",
      },
      { status: 500 }
    );
  }
}
