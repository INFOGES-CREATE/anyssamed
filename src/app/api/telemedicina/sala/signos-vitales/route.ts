// frontend/src/app/api/telemedicina/sala/signos-vitales/route.ts

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

function calcularIMC(peso: number, talla: number): number | null {
  if (!peso || !talla || talla === 0) return null;
  const tallaMts = talla / 100;
  return parseFloat((peso / (tallaMts * tallaMts)).toFixed(2));
}

// ========================================
// HANDLER GET - Obtener signos vitales
// ========================================

export async function GET(request: NextRequest) {
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

    // Obtener parámetros
    const searchParams = request.nextUrl.searchParams;
    const idPaciente = searchParams.get("id_paciente");
    const idHistorial = searchParams.get("id_historial");
    const limite = parseInt(searchParams.get("limite") || "10");

    if (!idPaciente) {
      return NextResponse.json(
        { success: false, error: "ID de paciente requerido" },
        { status: 400 }
      );
    }

    // Obtener signos vitales
    let query = `
      SELECT 
        sv.id_signo_vital,
        sv.id_paciente,
        sv.id_historial,
        sv.fecha_medicion,
        sv.presion_sistolica,
        sv.presion_diastolica,
        sv.pulso,
        sv.frecuencia_respiratoria,
        sv.temperatura,
        sv.saturacion_oxigeno,
        sv.peso,
        sv.talla,
        sv.imc,
        sv.circunferencia_cintura,
        sv.dolor_eva,
        sv.glucemia,
        sv.estado_conciencia,
        sv.observaciones,
        sv.fecha_creacion,
        CONCAT(u.nombre, ' ', u.apellido_paterno) as registrado_por_nombre
      FROM signos_vitales sv
      INNER JOIN usuarios u ON sv.registrado_por = u.id_usuario
      WHERE sv.id_paciente = ?
    `;

    const params: any[] = [idPaciente];

    if (idHistorial) {
      query += ` AND sv.id_historial = ?`;
      params.push(idHistorial);
    }

    query += ` ORDER BY sv.fecha_medicion DESC LIMIT ?`;
    params.push(limite);

    const [signosVitales] = await pool.query<RowDataPacket[]>(query, params);

    // Actualizar última actividad
    await pool.query(
      `UPDATE sesiones_usuarios SET ultima_actividad = NOW() WHERE token = ?`,
      [sessionToken]
    );

    return NextResponse.json(
      {
        success: true,
        signos_vitales: signosVitales,
        total: signosVitales.length,
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error(
      "❌ Error en GET /api/telemedicina/sala/signos-vitales:",
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

// ========================================
// HANDLER POST - Registrar signos vitales
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
      id_paciente,
      id_historial,
      presion_sistolica,
      presion_diastolica,
      pulso,
      frecuencia_respiratoria,
      temperatura,
      saturacion_oxigeno,
      peso,
      talla,
      circunferencia_cintura,
      dolor_eva,
      glucemia,
      estado_conciencia,
      observaciones,
    } = body;

    if (!id_paciente) {
      return NextResponse.json(
        { success: false, error: "ID de paciente requerido" },
        { status: 400 }
      );
    }

    // Calcular IMC si hay peso y talla
    const imc =
      peso && talla ? calcularIMC(parseFloat(peso), parseFloat(talla)) : null;

    // Insertar signos vitales
    const [result] = await pool.query<ResultSetHeader>(
      `
      INSERT INTO signos_vitales (
        id_paciente,
        id_historial,
        fecha_medicion,
        presion_sistolica,
        presion_diastolica,
        pulso,
        frecuencia_respiratoria,
        temperatura,
        saturacion_oxigeno,
        peso,
        talla,
        imc,
        circunferencia_cintura,
        dolor_eva,
        glucemia,
        estado_conciencia,
        observaciones,
        registrado_por
      ) VALUES (?, ?, NOW(), ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        id_paciente,
        id_historial || null,
        presion_sistolica || null,
        presion_diastolica || null,
        pulso || null,
        frecuencia_respiratoria || null,
        temperatura || null,
        saturacion_oxigeno || null,
        peso || null,
        talla || null,
        imc,
        circunferencia_cintura || null,
        dolor_eva || null,
        glucemia || null,
        estado_conciencia || null,
        observaciones || null,
        idUsuario,
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
        message: "Signos vitales registrados exitosamente",
        id_signo_vital: result.insertId,
        imc: imc,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error(
      "❌ Error en POST /api/telemedicina/sala/signos-vitales:",
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

// ========================================
// HANDLER PUT - Actualizar signos vitales
// ========================================

export async function PUT(request: NextRequest) {
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
    const { id_signo_vital, ...campos } = body;

    if (!id_signo_vital) {
      return NextResponse.json(
        { success: false, error: "ID de signo vital requerido" },
        { status: 400 }
      );
    }

    // Verificar que el signo vital existe
    const [signoRows] = await pool.query<RowDataPacket[]>(
      `SELECT id_signo_vital, peso, talla FROM signos_vitales WHERE id_signo_vital = ?`,
      [id_signo_vital]
    );

    if (signoRows.length === 0) {
      return NextResponse.json(
        { success: false, error: "Signo vital no encontrado" },
        { status: 404 }
      );
    }

    // Recalcular IMC si se actualiza peso o talla
    let imc = null;
    const pesoActual = campos.peso || signoRows[0].peso;
    const tallaActual = campos.talla || signoRows[0].talla;

    if (pesoActual && tallaActual) {
      imc = calcularIMC(parseFloat(pesoActual), parseFloat(tallaActual));
    }

    // Construir query de actualización
    const updates: string[] = [];
    const params: any[] = [];

    Object.keys(campos).forEach((key) => {
      if (campos[key] !== undefined) {
        updates.push(`${key} = ?`);
        params.push(campos[key]);
      }
    });

    if (imc !== null) {
      updates.push("imc = ?");
      params.push(imc);
    }

    updates.push("modificado_por = ?");
    params.push(idUsuario);

    params.push(id_signo_vital);

    await pool.query(
      `UPDATE signos_vitales SET ${updates.join(", ")} WHERE id_signo_vital = ?`,
      params
    );

    // Actualizar última actividad
    await pool.query(
      `UPDATE sesiones_usuarios SET ultima_actividad = NOW() WHERE token = ?`,
      [sessionToken]
    );

    return NextResponse.json(
      {
        success: true,
        message: "Signos vitales actualizados exitosamente",
        imc: imc,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error(
      "❌ Error en PUT /api/telemedicina/sala/signos-vitales:",
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
