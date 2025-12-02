// frontend/src/app/api/telemedicina/nueva/route.ts
export const dynamic = "force-dynamic";

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

interface CrearSesionRequest {
  id_cita: number;
  id_paciente: number;
  fecha_hora_inicio: string;
  fecha_hora_fin: string;
  proveedor_servicio?: string;
  grabacion_autorizada?: boolean;
}

interface CrearSesionResponse {
  success: boolean;
  message?: string;
  error?: string;
  data?: {
    id_sesion: number;
    token_acceso: string;
    url_sesion: string;
    fecha_hora_inicio_programada: string;
    fecha_hora_fin_programada: string;
  };
  details?: string;
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
  // 1) revisar cookies
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

  // 2) revisar headers de autorización (minúscula o mayúscula)
  const authLower = request.headers.get("authorization");
  const authUpper = request.headers.get("Authorization");

  const auth = authLower || authUpper;

  if (auth && auth.startsWith("Bearer ")) {
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
}

async function validarCitaYPaciente(
  idCita: number,
  idPaciente: number,
  idMedico: number
): Promise<{ valida: boolean; error?: string; cita?: RowDataPacket }> {
  const [citas] = await pool.query<RowDataPacket[]>(
    `
    SELECT 
      c.id_cita,
      c.id_paciente,
      c.id_medico,
      c.estado,
      c.tipo_cita,
      c.motivo,
      c.fecha_hora_programada
    FROM citas c
    WHERE c.id_cita = ? 
      AND c.id_paciente = ? 
      AND c.id_medico = ?
      AND c.estado IN ('programada', 'confirmada')
    LIMIT 1
    `,
    [idCita, idPaciente, idMedico]
  );

  if (citas.length === 0) {
    return {
      valida: false,
      error: "La cita no existe, no pertenece a este paciente o no está disponible",
    };
  }

  // Verificar que no exista ya una sesión para esta cita
  const [sesionesExistentes] = await pool.query<RowDataPacket[]>(
    `
    SELECT id_sesion FROM telemedicina_sesiones
    WHERE id_cita = ? AND estado != 'cancelada'
    LIMIT 1
    `,
    [idCita]
  );

  if (sesionesExistentes.length > 0) {
    return {
      valida: false,
      error: "Ya existe una sesión activa para esta cita",
    };
  }

  return {
    valida: true,
    cita: citas[0],
  };
}

async function validarPaciente(idPaciente: number): Promise<boolean> {
  const [pacientes] = await pool.query<RowDataPacket[]>(
    `
    SELECT id_paciente FROM pacientes
    WHERE id_paciente = ? AND estado = 'activo'
    LIMIT 1
    `,
    [idPaciente]
  );

  return pacientes.length > 0;
}

function generarTokenAcceso(): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 15);
  const hash = Math.random().toString(36).substring(2, 15);
  return `tele_${timestamp}_${random}_${hash}`;
}

function construirUrlSesion(idSesion: number, tokenAcceso: string): string {
  return `/medico/telemedicina/sala?sesion=${idSesion}&token=${tokenAcceso}`;
}

// ========================================
// VALIDACIONES
// ========================================

function validarDatos(body: any): { valido: boolean; error?: string } {
  const { id_cita, id_paciente, fecha_hora_inicio, fecha_hora_fin } = body;

  if (!id_cita || typeof id_cita !== "number") {
    return { valido: false, error: "id_cita es requerido y debe ser un número" };
  }

  if (!id_paciente || typeof id_paciente !== "number") {
    return {
      valido: false,
      error: "id_paciente es requerido y debe ser un número",
    };
  }

  if (!fecha_hora_inicio || typeof fecha_hora_inicio !== "string") {
    return {
      valido: false,
      error: "fecha_hora_inicio es requerida y debe ser una cadena ISO 8601",
    };
  }

  if (!fecha_hora_fin || typeof fecha_hora_fin !== "string") {
    return {
      valido: false,
      error: "fecha_hora_fin es requerida y debe ser una cadena ISO 8601",
    };
  }

  // Validar que las fechas sean válidas
  const inicio = new Date(fecha_hora_inicio);
  const fin = new Date(fecha_hora_fin);

  if (isNaN(inicio.getTime())) {
    return { valido: false, error: "fecha_hora_inicio no es una fecha válida" };
  }

  if (isNaN(fin.getTime())) {
    return { valido: false, error: "fecha_hora_fin no es una fecha válida" };
  }

  // Validar que fin sea después de inicio
  if (fin <= inicio) {
    return {
      valido: false,
      error: "fecha_hora_fin debe ser posterior a fecha_hora_inicio",
    };
  }

  // Validar que no sea en el pasado
  if (inicio < new Date()) {
    return {
      valido: false,
      error: "No se pueden crear sesiones en el pasado",
    };
  }

  return { valido: true };
}

// ========================================
// HANDLER POST - Crear nueva sesión
// ========================================

export async function POST(
  request: NextRequest
): Promise<NextResponse<CrearSesionResponse>> {
  const startTime = Date.now();

  try {
    console.log("🚀 POST /api/telemedicina/nueva - Iniciando...");

    // 1️⃣ Obtener y validar token de sesión
    const sessionToken = getSessionToken(request);
    console.log("🧩 TOKEN DETECTADO:", sessionToken ? "✅ Presente" : "❌ Ausente");

    if (!sessionToken) {
      return NextResponse.json<CrearSesionResponse>(
        {
          success: false,
          error: "No hay sesión activa. Autentícate primero.",
        },
        { status: 401 }
      );
    }

    // 2️⃣ Validar sesión en BD
    const [sesiones] = await pool.query<RowDataPacket[]>(
      `
      SELECT su.id_usuario, u.rol
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
      return NextResponse.json<CrearSesionResponse>(
        {
          success: false,
          error: "Sesión inválida o expirada",
        },
        { status: 401 }
      );
    }

    const idUsuario = sesiones[0].id_usuario;
    const rol = sesiones[0].rol;

    console.log(`👤 Usuario autenticado: ${idUsuario} | Rol: ${rol}`);

    // 3️⃣ Validar que sea médico
    if (rol !== "medico") {
      return NextResponse.json<CrearSesionResponse>(
        {
          success: false,
          error: "Solo los médicos pueden crear sesiones de telemedicina",
        },
        { status: 403 }
      );
    }

    // 4️⃣ Obtener datos del médico
    const medico = await obtenerMedicoAutenticado(idUsuario);

    if (!medico) {
      return NextResponse.json<CrearSesionResponse>(
        {
          success: false,
          error: "No tienes un registro de médico activo en el sistema",
        },
        { status: 403 }
      );
    }

    console.log(`🏥 Médico: ${medico.id_medico} | Centro: ${medico.id_centro_principal}`);

    // 5️⃣ Parsear y validar body
    const body = await request.json();
    console.log("📦 Datos recibidos:", {
      id_cita: body.id_cita,
      id_paciente: body.id_paciente,
      fecha_hora_inicio: body.fecha_hora_inicio,
      fecha_hora_fin: body.fecha_hora_fin,
    });

    const validacion = validarDatos(body);
    if (!validacion.valido) {
      return NextResponse.json<CrearSesionResponse>(
        {
          success: false,
          error: validacion.error,
        },
        { status: 400 }
      );
    }

    const {
      id_cita,
      id_paciente,
      fecha_hora_inicio,
      fecha_hora_fin,
      proveedor_servicio = "AnySSA Video Conference",
      grabacion_autorizada = false,
    }: CrearSesionRequest = body;

    // 6️⃣ Validar que el paciente existe
    const pacienteValido = await validarPaciente(id_paciente);
    if (!pacienteValido) {
      return NextResponse.json<CrearSesionResponse>(
        {
          success: false,
          error: "El paciente no existe o está inactivo",
        },
        { status: 404 }
      );
    }

    // 7️⃣ Validar cita y paciente
    const validacionCita = await validarCitaYPaciente(
      id_cita,
      id_paciente,
      medico.id_medico
    );

    if (!validacionCita.valida) {
      return NextResponse.json<CrearSesionResponse>(
        {
          success: false,
          error: validacionCita.error,
        },
        { status: 400 }
      );
    }

    console.log("✅ Validaciones completadas");

    // 8️⃣ Generar credenciales de sesión
    const tokenAcceso = generarTokenAcceso();
    const urlSesion = construirUrlSesion(0, tokenAcceso); // ID se obtiene después del INSERT

    console.log("🔐 Token generado:", tokenAcceso);

    // 9️⃣ Insertar sesión en BD (SIN notas_sesion)
    const [result] = await pool.query<ResultSetHeader>(
      `
      INSERT INTO telemedicina_sesiones (
        id_cita,
        id_paciente,
        id_medico,
        token_acceso,
        url_sesion,
        estado,
        fecha_hora_inicio_programada,
        fecha_hora_fin_programada,
        proveedor_servicio,
        grabacion_autorizada
      ) VALUES (?, ?, ?, ?, ?, 'programada', ?, ?, ?, ?)
      `,
      [
        id_cita,
        id_paciente,
        medico.id_medico,
        tokenAcceso,
        urlSesion,
        fecha_hora_inicio,
        fecha_hora_fin,
        proveedor_servicio,
        grabacion_autorizada ? 1 : 0,
      ]
    );

    const idSesion = result.insertId;
    const urlSesionFinal = construirUrlSesion(idSesion, tokenAcceso);

    // 🔟 Actualizar URL en BD
    await pool.query(
      `UPDATE telemedicina_sesiones SET url_sesion = ? WHERE id_sesion = ?`,
      [urlSesionFinal, idSesion]
    );

    // 1️⃣1️⃣ Actualizar última actividad
    await pool.query(
      `UPDATE sesiones_usuarios SET ultima_actividad = NOW() WHERE token = ?`,
      [sessionToken]
    );

    const duracion = Math.round(
      (new Date(fecha_hora_fin).getTime() -
        new Date(fecha_hora_inicio).getTime()) /
        1000
    );

    console.log(`✅ Sesión creada: ${idSesion} | Duración: ${duracion}s`);
    console.log(`⏱️  Tiempo total: ${Date.now() - startTime}ms`);

    return NextResponse.json<CrearSesionResponse>(
      {
        success: true,
        message: "Sesión de telemedicina creada exitosamente",
        data: {
          id_sesion: idSesion,
          token_acceso: tokenAcceso,
          url_sesion: urlSesionFinal,
          fecha_hora_inicio_programada: fecha_hora_inicio,
          fecha_hora_fin_programada: fecha_hora_fin,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("❌ Error en POST /api/telemedicina/nueva:", error);
    console.error("Stack:", error.stack);

    return NextResponse.json<CrearSesionResponse>(
      {
        success: false,
        error: "Error interno del servidor",
        details:
          process.env.NODE_ENV === "development"
            ? `${error.message} | ${error.code || ""}`
            : undefined,
      },
      { status: 500 }
    );
  }
}

// ========================================
// HANDLER OPTIONS - CORS
// ========================================

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}
