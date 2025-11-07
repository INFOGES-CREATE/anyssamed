// frontend/src/app/api/telemedicina/sala/acceso/route.ts

import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { RowDataPacket, ResultSetHeader } from "mysql2";
import crypto from "crypto";

// ========================================
// TIPOS
// ========================================

interface MedicoData {
  id_medico: number;
  id_usuario: number;
  id_centro_principal: number;
}

interface AccesoSala {
  token_acceso: string;
  url_sala: string;
  id_sesion: number;
  tipo_usuario: "medico" | "paciente";
  permisos: {
    video: boolean;
    audio: boolean;
    chat: boolean;
    compartir_pantalla: boolean;
    grabar: boolean;
    invitar: boolean;
    finalizar: boolean;
  };
  configuracion_sala: {
    calidad_video: string;
    max_participantes: number;
    grabacion_automatica: boolean;
    tiempo_maximo_minutos: number;
  };
  datos_sesion: any;
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

function generarTokenSeguro(): string {
  const timestamp = Date.now();
  const random = crypto.randomBytes(32).toString("hex");
  const hash = crypto
    .createHash("sha256")
    .update(`${timestamp}-${random}`)
    .digest("hex");
  return `sala_${timestamp}_${hash.substring(0, 32)}`;
}

async function obtenerSesion(idSesion: number): Promise<any> {
  try {
    const [rows] = await pool.query<RowDataPacket[]>(
      `
      SELECT 
        ts.id_sesion,
        ts.id_cita,
        ts.id_paciente,
        ts.id_medico,
        ts.token_acceso,
        ts.url_sesion,
        ts.estado,
        ts.fecha_hora_inicio_programada,
        ts.fecha_hora_fin_programada,
        ts.fecha_hora_inicio_real,
        ts.fecha_hora_fin_real,
        ts.proveedor_servicio,
        ts.calidad_conexion,
        ts.grabacion_autorizada,
        
        -- Datos del paciente
        p.id_paciente,
        CONCAT(p.nombre, ' ', p.apellido_paterno, ' ', COALESCE(p.apellido_materno, '')) as paciente_nombre,
        p.foto_url as paciente_foto,
        
        -- Datos del médico
        m.id_medico,
        CONCAT(u.nombre, ' ', u.apellido_paterno) as medico_nombre,
        u.foto_perfil_url as medico_foto,
        
        -- Datos de la cita
        c.motivo as cita_motivo,
        c.tipo_cita,
        c.duracion_minutos
        
      FROM telemedicina_sesiones ts
      INNER JOIN pacientes p ON ts.id_paciente = p.id_paciente
      INNER JOIN medicos m ON ts.id_medico = m.id_medico
      INNER JOIN usuarios u ON m.id_usuario = u.id_usuario
      INNER JOIN citas c ON ts.id_cita = c.id_cita
      WHERE ts.id_sesion = ?
      LIMIT 1
      `,
      [idSesion]
    );

    if (rows.length === 0) {
      return null;
    }

    return rows[0];
  } catch (error) {
    console.error("Error al obtener sesión:", error);
    throw error;
  }
}

async function validarAccesoSesion(
  idSesion: number,
  idMedico: number
): Promise<boolean> {
  try {
    const [rows] = await pool.query<RowDataPacket[]>(
      `
      SELECT COUNT(*) as tiene_acceso
      FROM telemedicina_sesiones
      WHERE id_sesion = ?
        AND id_medico = ?
        AND estado IN ('programada', 'en_espera', 'en_curso')
      `,
      [idSesion, idMedico]
    );

    return rows[0].tiene_acceso > 0;
  } catch (error) {
    console.error("Error al validar acceso:", error);
    throw error;
  }
}

async function crearEnlaceAcceso(
  idSesion: number,
  idUsuario: number,
  tipoUsuario: "medico" | "paciente",
  tokenAcceso: string
): Promise<void> {
  try {
    await pool.query(
      `
      INSERT INTO telemedicina_enlaces (
        id_sesion,
        id_usuario,
        tipo_usuario,
        token_acceso,
        fecha_generacion,
        fecha_expiracion,
        usado,
        ip_acceso,
        user_agent
      ) VALUES (?, ?, ?, ?, NOW(), DATE_ADD(NOW(), INTERVAL 24 HOUR), 0, NULL, NULL)
      `,
      [idSesion, idUsuario, tipoUsuario, tokenAcceso]
    );
  } catch (error) {
    console.error("Error al crear enlace de acceso:", error);
    throw error;
  }
}

async function registrarAccesoSala(
  idSesion: number,
  idUsuario: number,
  tipoUsuario: string,
  ipAddress: string | null,
  userAgent: string | null
): Promise<void> {
  try {
    await pool.query(
      `
      INSERT INTO accesos_paciente_log (
        id_usuario,
        tipo_acceso,
        ip_address,
        user_agent,
        fecha_acceso,
        detalles
      ) VALUES (?, ?, ?, ?, NOW(), ?)
      `,
      [
        idUsuario,
        "telemedicina_sala",
        ipAddress,
        userAgent,
        JSON.stringify({
          id_sesion: idSesion,
          tipo_usuario: tipoUsuario,
        }),
      ]
    );
  } catch (error) {
    console.error("Error al registrar acceso:", error);
    // No lanzar error, solo log
  }
}

async function obtenerConfiguracionSala(idMedico: number): Promise<any> {
  try {
    const [rows] = await pool.query<RowDataPacket[]>(
      `
      SELECT 
        calidad_video_default,
        grabacion_automatica,
        duracion_sesion_default,
        chat_habilitado,
        compartir_pantalla_habilitado
      FROM telemedicina_configuraciones
      WHERE id_medico = ?
      LIMIT 1
      `,
      [idMedico]
    );

    if (rows.length === 0) {
      return {
        calidad_video_default: "HD",
        grabacion_automatica: false,
        duracion_sesion_default: 30,
        chat_habilitado: true,
        compartir_pantalla_habilitado: true,
      };
    }

    return rows[0];
  } catch (error) {
    console.error("Error al obtener configuración de sala:", error);
    return {
      calidad_video_default: "HD",
      grabacion_automatica: false,
      duracion_sesion_default: 30,
      chat_habilitado: true,
      compartir_pantalla_habilitado: true,
    };
  }
}

// ========================================
// HANDLER POST - Generar acceso a sala
// ========================================

export async function POST(request: NextRequest) {
  try {
    // 1. Obtener token
    const sessionToken = getSessionToken(request);

    if (!sessionToken) {
      return NextResponse.json(
        {
          success: false,
          error: "No hay sesión activa",
        },
        { status: 401 }
      );
    }

    // 2. Verificar sesión
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
        {
          success: false,
          error: "Sesión inválida o expirada",
        },
        { status: 401 }
      );
    }

    const idUsuario = sesiones[0].id_usuario;

    // 3. Verificar que sea médico
    const medico = await obtenerMedicoAutenticado(idUsuario);

    if (!medico) {
      return NextResponse.json(
        {
          success: false,
          error: "No tienes un registro de médico activo",
        },
        { status: 403 }
      );
    }

    // 4. Obtener datos del body
    const body = await request.json();
    const { id_sesion } = body;

    if (!id_sesion) {
      return NextResponse.json(
        {
          success: false,
          error: "ID de sesión requerido",
        },
        { status: 400 }
      );
    }

    // 5. Validar acceso a la sesión
    const tieneAcceso = await validarAccesoSesion(id_sesion, medico.id_medico);

    if (!tieneAcceso) {
      return NextResponse.json(
        {
          success: false,
          error: "No tienes acceso a esta sesión o ya finalizó",
        },
        { status: 403 }
      );
    }

    // 6. Obtener datos de la sesión
    const datosSesion = await obtenerSesion(id_sesion);

    if (!datosSesion) {
      return NextResponse.json(
        {
          success: false,
          error: "Sesión no encontrada",
        },
        { status: 404 }
      );
    }

    // 7. Generar token de acceso seguro
    const tokenAcceso = generarTokenSeguro();
    const urlSala = `/medico/telemedicina/sala/video?token=${tokenAcceso}&sesion=${id_sesion}`;

    // 8. Actualizar token en la sesión
    await pool.query(
      `
      UPDATE telemedicina_sesiones 
      SET token_acceso = ?,
          url_sesion = ?,
          estado = CASE 
            WHEN estado = 'programada' THEN 'en_espera'
            ELSE estado
          END
      WHERE id_sesion = ?
      `,
      [tokenAcceso, urlSala, id_sesion]
    );

    // 9. Crear enlace de acceso
    await crearEnlaceAcceso(id_sesion, idUsuario, "medico", tokenAcceso);

    // 10. Obtener configuración de sala
    const configuracionSala = await obtenerConfiguracionSala(medico.id_medico);

    // 11. Registrar acceso
    const ipAddress =
      request.headers.get("x-forwarded-for") ||
      request.headers.get("x-real-ip") ||
      null;
    const userAgent = request.headers.get("user-agent") || null;

    await registrarAccesoSala(
      id_sesion,
      idUsuario,
      "medico",
      ipAddress,
      userAgent
    );

    // 12. Definir permisos del médico
    const permisos = {
      video: true,
      audio: true,
      chat: configuracionSala.chat_habilitado === 1,
      compartir_pantalla: configuracionSala.compartir_pantalla_habilitado === 1,
      grabar: true,
      invitar: true,
      finalizar: true,
    };

    // 13. Configuración de la sala
    const configuracion_sala = {
      calidad_video: configuracionSala.calidad_video_default || "HD",
      max_participantes: 2,
      grabacion_automatica: configuracionSala.grabacion_automatica === 1,
      tiempo_maximo_minutos: configuracionSala.duracion_sesion_default || 30,
    };

    // 14. Preparar respuesta
    const accesoSala: AccesoSala = {
      token_acceso: tokenAcceso,
      url_sala: urlSala,
      id_sesion: id_sesion,
      tipo_usuario: "medico",
      permisos,
      configuracion_sala,
      datos_sesion: {
        id_sesion: datosSesion.id_sesion,
        id_cita: datosSesion.id_cita,
        estado: datosSesion.estado,
        fecha_hora_inicio: datosSesion.fecha_hora_inicio_programada,
        fecha_hora_fin: datosSesion.fecha_hora_fin_programada,
        duracion_minutos: datosSesion.duracion_minutos,
        motivo: datosSesion.cita_motivo,
        tipo_cita: datosSesion.tipo_cita,
        paciente: {
          id_paciente: datosSesion.id_paciente,
          nombre: datosSesion.paciente_nombre,
          foto_url: datosSesion.paciente_foto,
        },
        medico: {
          id_medico: datosSesion.id_medico,
          nombre: datosSesion.medico_nombre,
          foto_url: datosSesion.medico_foto,
        },
      },
    };

    // 15. Respuesta exitosa
    return NextResponse.json(
      {
        success: true,
        message: "Token de acceso generado exitosamente",
        acceso: accesoSala,
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("❌ Error en POST /api/telemedicina/sala/acceso:", error);

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
// HANDLER GET - Validar token de acceso
// ========================================

export async function GET(request: NextRequest) {
  try {
    // 1. Obtener parámetros
    const searchParams = request.nextUrl.searchParams;
    const tokenAcceso = searchParams.get("token");

    if (!tokenAcceso) {
      return NextResponse.json(
        {
          success: false,
          error: "Token de acceso requerido",
        },
        { status: 400 }
      );
    }

    // 2. Validar token
    const [enlaces] = await pool.query<RowDataPacket[]>(
      `
      SELECT 
        te.id_enlace,
        te.id_sesion,
        te.id_usuario,
        te.tipo_usuario,
        te.fecha_expiracion,
        te.usado,
        ts.estado as sesion_estado
      FROM telemedicina_enlaces te
      INNER JOIN telemedicina_sesiones ts ON te.id_sesion = ts.id_sesion
      WHERE te.token_acceso = ?
        AND te.fecha_expiracion > NOW()
      LIMIT 1
      `,
      [tokenAcceso]
    );

    if (enlaces.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Token inválido o expirado",
        },
        { status: 401 }
      );
    }

    const enlace = enlaces[0];

    // 3. Verificar estado de la sesión
    if (!["programada", "en_espera", "en_curso"].includes(enlace.sesion_estado)) {
      return NextResponse.json(
        {
          success: false,
          error: "La sesión ya finalizó o fue cancelada",
        },
        { status: 410 }
      );
    }

    // 4. Obtener datos de la sesión
    const datosSesion = await obtenerSesion(enlace.id_sesion);

    // 5. Respuesta exitosa
    return NextResponse.json(
      {
        success: true,
        valido: true,
        sesion: {
          id_sesion: datosSesion.id_sesion,
          estado: datosSesion.estado,
          tipo_usuario: enlace.tipo_usuario,
          fecha_expiracion: enlace.fecha_expiracion,
        },
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("❌ Error en GET /api/telemedicina/sala/acceso:", error);

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
