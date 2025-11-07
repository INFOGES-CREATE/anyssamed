// frontend/src/app/api/telemedicina/sala/transcripcion/route.ts

import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { RowDataPacket, ResultSetHeader } from "mysql2";

// ========================================
// TIPOS
// ========================================

interface MedicoData {
  id_medico: number;
  id_usuario: number;
  id_centro_principal: number;
}

// ========================================
// HELPER PARA OBTENER TOKEN
// ========================================

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

// ========================================
// FUNCIONES AUXILIARES
// ========================================

async function obtenerMedicoAutenticado(
  idUsuario: number
): Promise<MedicoData | null> {
  try {
    const [rows] = await pool.query<RowDataPacket[]>(
      `
      SELECT 
        m.id_medico,
        m.id_usuario,
        m.id_centro_principal
      FROM medicos m
      WHERE m.id_usuario = ? AND m.estado = 'activo'
      LIMIT 1
      `,
      [idUsuario]
    );

    if (rows.length === 0) {
      return null;
    }

    return rows[0] as MedicoData;
  } catch (error) {
    console.error("Error al obtener médico:", error);
    throw error;
  }
}

// Función simulada de análisis con IA
// En producción, aquí integrarías OpenAI, Google Cloud Speech-to-Text, etc.
async function analizarTranscripcionConIA(
  texto: string
): Promise<{
  sintomas: string[];
  diagnosticos_sugeridos: string[];
  medicamentos_mencionados: string[];
  examenes_sugeridos: string[];
  resumen: string;
}> {
  // SIMULACIÓN - En producción usar IA real
  return {
    sintomas: ["Dolor de cabeza", "Mareos", "Fatiga"],
    diagnosticos_sugeridos: ["Hipertensión arterial", "Estrés"],
    medicamentos_mencionados: ["Enalapril", "Paracetamol"],
    examenes_sugeridos: [
      "Hemograma completo",
      "Perfil lipídico",
      "Electrocardiograma",
    ],
    resumen:
      "Paciente refiere dolor de cabeza persistente y mareos ocasionales. Se menciona tratamiento actual con Enalapril. Se sugiere control de presión arterial y exámenes complementarios.",
  };
}

// ========================================
// HANDLER POST - Procesar transcripción
// ========================================

export async function POST(request: NextRequest) {
  try {
    const sessionToken = getSessionToken(request);

    if (!sessionToken) {
      return NextResponse.json(
        { success: false, error: "No hay sesión activa" },
        { status: 401 }
      );
    }

    // Validar sesión
    const [sesiones] = await pool.query<RowDataPacket[]>(
      `
      SELECT su.id_usuario
      FROM sesiones_usuarios su
      INNER JOIN usuarios u ON su.id_usuario = u.id_usuario
      WHERE su.token = ?
        AND su.activa = 1
        AND su.fecha_expiracion > NOW()
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
    const medico = await obtenerMedicoAutenticado(idUsuario);

    if (!medico) {
      return NextResponse.json(
        { success: false, error: "No tienes un registro de médico activo" },
        { status: 403 }
      );
    }

    // Obtener datos del body
    const body = await request.json();
    const {
      id_sesion_telemedicina,
      id_paciente,
      id_historial,
      texto_transcripcion,
      idioma = "es-ES",
      analizar_con_ia = true,
    } = body;

    if (!id_paciente || !texto_transcripcion) {
      return NextResponse.json(
        { success: false, error: "Faltan datos requeridos" },
        { status: 400 }
      );
    }

    // Analizar con IA si está habilitado
    let analisisIA = null;
    if (analizar_con_ia) {
      analisisIA = await analizarTranscripcionConIA(texto_transcripcion);
    }

    // Guardar transcripción en notas clínicas
    const [resultNota] = await pool.query<ResultSetHeader>(
      `
      INSERT INTO notas_clinicas (
        id_paciente,
        id_historial,
        id_usuario,
        fecha_nota,
        tipo_nota,
        contenido,
        nivel_privacidad,
        estado,
        etiquetas
      ) VALUES (?, ?, ?, NOW(), 'evolucion', ?, 'normal', 'activo', 'transcripcion_ia')
      `,
      [
        id_paciente,
        id_historial || null,
        idUsuario,
        `TRANSCRIPCIÓN AUTOMÁTICA:\n\n${texto_transcripcion}\n\n${
          analisisIA
            ? `\n\nANÁLISIS CON IA:\n- Síntomas detectados: ${analisisIA.sintomas.join(
                ", "
              )}\n- Diagnósticos sugeridos: ${analisisIA.diagnosticos_sugeridos.join(
                ", "
              )}\n- Medicamentos mencionados: ${analisisIA.medicamentos_mencionados.join(
                ", "
              )}\n- Exámenes sugeridos: ${analisisIA.examenes_sugeridos.join(
                ", "
              )}\n\nRESUMEN: ${analisisIA.resumen}`
            : ""
        }`,
      ]
    );

    // Actualizar última actividad
    await pool.query(
      `UPDATE sesiones_usuarios SET ultima_actividad = NOW() WHERE token = ?`,
      [sessionToken]
    );

    return NextResponse.json(
      {
        success: true,
        message: "Transcripción procesada exitosamente",
        id_nota: resultNota.insertId,
        analisis_ia: analisisIA,
        timestamp: new Date().toISOString(),
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error(
      "❌ Error en POST /api/telemedicina/sala/transcripcion:",
      error
    );
    return NextResponse.json(
      {
        success: false,
        error: "Error interno del servidor",
        details:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}
