// app/api/usuario/perfil/route.ts
import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { RowDataPacket } from "mysql2";
import fs from "fs/promises";
import path from "path";

// si estás en app router con node:
export const dynamic = "force-dynamic";

// ========================================
// TIPOS
// ========================================
interface UsuarioSesion {
  id_usuario: number;
  username: string;
  email: string;
  nombre: string;
  apellido_paterno: string;
  apellido_materno: string | null;
  foto_perfil_url: string | null;
  telefono: string | null;
  celular: string | null;
  direccion: string | null;
  ciudad: string | null;
  region: string | null;
  fecha_nacimiento: string | null;
  genero: string | null;
  rol: {
    id_rol: number;
    nombre: string;
    nivel_jerarquia: number;
  };
  medico?: {
    id_medico: number;
    numero_registro_medico: string;
    titulo_profesional: string;
    universidad: string;
    ano_graduacion: number;
    anos_experiencia: number;
    biografia: string | null;
    especialidades: Array<{
      id_especialidad: number;
      nombre: string;
      es_principal: boolean;
      anos_experiencia: number | null;
      certificado_url: string | null;
      fecha_certificacion: string | null;
      institucion_certificadora: string | null;
    }>;
    id_centro_principal: number;
    centro_principal: {
      id_centro: number;
      nombre: string;
      plan: "basico" | "profesional" | "enterprise";
      logo_url: string | null;
      ciudad: string;
      region: string;
      direccion: string;
      telefono_principal: string;
      email_contacto: string;
      sitio_web: string | null;
    };
    calificacion_promedio: number;
    numero_opiniones: number;
    acepta_nuevos_pacientes: boolean;
    atiende_particular: boolean;
    atiende_fonasa: boolean;
    atiende_isapre: boolean;
    consulta_presencial: boolean;
    consulta_telemedicina: boolean;
    duracion_consulta_min: number;
    firma_digital: boolean;
    firma_digital_url: string | null;
    estado: string;
  };
}

// ========================================
// COOKIES QUE VAMOS A PROBAR
// (igual que en /api/medico/agenda)
// ========================================
const SESSION_COOKIE_CANDIDATES = [
  "session",
  "session_token",
  "medisalud_session",
  "auth_session",
  "next-auth.session-token",
  "__Secure-next-auth.session-token",
];

// ========================================
// HELPERS
// ========================================
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

/**
 * Devuelve el perfil completo del usuario autenticado,
 * incluyendo rol y (si existe) el médico.
 */
async function cargarPerfilUsuario(
  idUsuario: number
): Promise<UsuarioSesion | null> {
  // 1. Datos base de usuario + rol principal (el de mayor jerarquía)
  const [usuarios] = await pool.query<RowDataPacket[]>(
    `
    SELECT 
      u.id_usuario,
      u.username,
      u.email,
      u.nombre,
      u.apellido_paterno,
      u.apellido_materno,
      u.foto_perfil_url,
      u.telefono,
      u.celular,
      u.direccion,
      u.ciudad,
      u.region,
      DATE_FORMAT(u.fecha_nacimiento, '%Y-%m-%d') AS fecha_nacimiento,
      u.genero,
      r.id_rol,
      r.nombre AS rol_nombre,
      r.nivel_jerarquia
    FROM usuarios u
    LEFT JOIN usuarios_roles ur 
      ON ur.id_usuario = u.id_usuario AND ur.activo = 1
    LEFT JOIN roles r 
      ON r.id_rol = ur.id_rol
    WHERE u.id_usuario = ?
    ORDER BY r.nivel_jerarquia DESC
    LIMIT 1
    `,
    [idUsuario]
  );

  if (usuarios.length === 0) {
    return null;
  }

  const u = usuarios[0];

  // 2. Ver si el usuario es médico
  const [medicos] = await pool.query<RowDataPacket[]>(
    `
    SELECT 
      m.id_medico,
      m.id_usuario,
      m.numero_registro_medico,
      m.titulo_profesional,
      m.universidad,
      m.ano_graduacion,
      m.anos_experiencia,
      m.biografia,
      m.id_centro_principal,
      m.calificacion_promedio,
      m.numero_opiniones,
      m.acepta_nuevos_pacientes,
      m.atiende_particular,
      m.atiende_fonasa,
      m.atiende_isapre,
      m.consulta_presencial,
      m.consulta_telemedicina,
      m.duracion_consulta_min,
      m.firma_digital,
      m.firma_digital_url,
      m.estado,
      cm.nombre AS centro_nombre,
      cm.logo_url AS centro_logo_url,
      cm.ciudad AS centro_ciudad,
      cm.region AS centro_region,
      cm.direccion AS centro_direccion,
      cm.telefono_principal AS centro_telefono_principal,
      cm.email_contacto AS centro_email_contacto,
      cm.sitio_web AS centro_sitio_web
      -- no tienes columna plan en centros_medicos, devolvemos 'basico'
    FROM medicos m
    LEFT JOIN centros_medicos cm ON cm.id_centro = m.id_centro_principal
    WHERE m.id_usuario = ? AND m.estado IN ('activo','suspendido')
    LIMIT 1
    `,
    [idUsuario]
  );

  let medicoData: UsuarioSesion["medico"] | undefined = undefined;

  if (medicos.length > 0) {
    const m = medicos[0];

    // 2b. Especialidades del médico
    const [especialidades] = await pool.query<RowDataPacket[]>(
      `
      SELECT 
        me.id_especialidad,
        e.nombre,
        me.es_principal,
        me.anos_experiencia,
        me.certificado_url,
        DATE_FORMAT(me.fecha_certificacion, '%Y-%m-%d') AS fecha_certificacion,
        me.institucion_certificadora
      FROM medicos_especialidades me
      INNER JOIN especialidades e ON e.id_especialidad = me.id_especialidad
      WHERE me.id_medico = ?
      ORDER BY me.es_principal DESC, e.nombre ASC
      `,
      [m.id_medico]
    );

    medicoData = {
      id_medico: m.id_medico,
      numero_registro_medico: m.numero_registro_medico,
      titulo_profesional: m.titulo_profesional,
      universidad: m.universidad,
      ano_graduacion: Number(m.ano_graduacion),
      anos_experiencia: Number(m.anos_experiencia),
      biografia: m.biografia,
      especialidades: especialidades.map((esp) => ({
        id_especialidad: esp.id_especialidad,
        nombre: esp.nombre,
        es_principal: esp.es_principal === 1,
        anos_experiencia:
          esp.anos_experiencia !== null ? Number(esp.anos_experiencia) : null,
        certificado_url: esp.certificado_url,
        fecha_certificacion: esp.fecha_certificacion,
        institucion_certificadora: esp.institucion_certificadora,
      })),
      id_centro_principal: m.id_centro_principal,
      centro_principal: {
        id_centro: m.id_centro_principal,
        nombre: m.centro_nombre,
        plan: "basico", // no existe en la tabla, devolvemos algo válido
        logo_url: m.centro_logo_url,
        ciudad: m.centro_ciudad,
        region: m.centro_region,
        direccion: m.centro_direccion,
        telefono_principal: m.centro_telefono_principal,
        email_contacto: m.centro_email_contacto,
        sitio_web: m.centro_sitio_web,
      },
      calificacion_promedio: Number(m.calificacion_promedio || 0),
      numero_opiniones: Number(m.numero_opiniones || 0),
      acepta_nuevos_pacientes: m.acepta_nuevos_pacientes === 1,
      atiende_particular: m.atiende_particular === 1,
      atiende_fonasa: m.atiende_fonasa === 1,
      atiende_isapre: m.atiende_isapre === 1,
      consulta_presencial: m.consulta_presencial === 1,
      consulta_telemedicina: m.consulta_telemedicina === 1,
      duracion_consulta_min: Number(m.duracion_consulta_min || 30),
      firma_digital: m.firma_digital === 1,
      firma_digital_url: m.firma_digital_url,
      estado: m.estado,
    };
  }

  const perfil: UsuarioSesion = {
    id_usuario: u.id_usuario,
    username: u.username,
    email: u.email,
    nombre: u.nombre,
    apellido_paterno: u.apellido_paterno,
    apellido_materno: u.apellido_materno,
    foto_perfil_url: u.foto_perfil_url,
    telefono: u.telefono,
    celular: u.celular,
    direccion: u.direccion,
    ciudad: u.ciudad,
    region: u.region,
    fecha_nacimiento: u.fecha_nacimiento,
    genero: u.genero,
    rol: {
      id_rol: u.id_rol || 0,
      nombre: u.rol_nombre || "sin_rol",
      nivel_jerarquia: u.nivel_jerarquia || 0,
    },
    ...(medicoData ? { medico: medicoData } : {}),
  };

  return perfil;
}

/**
 * Guarda una imagen base64 en /public/uploads/perfiles y devuelve la URL
 */
async function guardarImagenBase64(
  base64: string,
  idUsuario: number
): Promise<string> {
  // limpia el header data:image/png;base64,...
  const matches = base64.match(/^data:(image\/\w+);base64,(.+)$/);
  const mime = matches ? matches[1] : "image/png";
  const data = matches ? matches[2] : base64;

  const buffer = Buffer.from(data, "base64");

  const ext = mime.split("/")[1] || "png";

  const uploadDir = path.join(process.cwd(), "public", "uploads", "perfiles");
  await fs.mkdir(uploadDir, { recursive: true });

  const filename = `perfil-${idUsuario}-${Date.now()}.${ext}`;
  const filepath = path.join(uploadDir, filename);

  await fs.writeFile(filepath, buffer);

  // la URL pública
  return `/uploads/perfiles/${filename}`;
}

// ========================================
// GET - obtener el perfil del usuario logueado
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

    // validar sesión
    const [sesiones] = await pool.query<RowDataPacket[]>(
      `
      SELECT su.id_usuario
      FROM sesiones_usuarios su
      INNER JOIN usuarios u ON u.id_usuario = su.id_usuario
      WHERE su.token = ?
        AND su.activa = 1
        AND (su.fecha_expiracion IS NULL OR su.fecha_expiracion > NOW())
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

    // actualizar última actividad
    await pool.query(
      `UPDATE sesiones_usuarios SET ultima_actividad = NOW() WHERE token = ?`,
      [sessionToken]
    );

    const perfil = await cargarPerfilUsuario(idUsuario);

    return NextResponse.json(
      {
        success: true,
        perfil,
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("❌ Error en GET /api/usuario/perfil:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Error interno del servidor",
        details: process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}

// ========================================
// POST - guardar foto de perfil
// espera { foto_base64: string } o { foto_perfil_url: string }
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

    const [sesiones] = await pool.query<RowDataPacket[]>(
      `
      SELECT su.id_usuario
      FROM sesiones_usuarios su
      INNER JOIN usuarios u ON u.id_usuario = su.id_usuario
      WHERE su.token = ?
        AND su.activa = 1
        AND (su.fecha_expiracion IS NULL OR su.fecha_expiracion > NOW())
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
    const body = await request.json();

    let nuevaUrl: string | null = null;

    if (body.foto_base64) {
      nuevaUrl = await guardarImagenBase64(body.foto_base64, idUsuario);
    } else if (body.foto_perfil_url) {
      // si desde el front ya subiste la imagen a otro lado y solo mandas la URL
      nuevaUrl = body.foto_perfil_url;
    } else {
      return NextResponse.json(
        { success: false, error: "No se envió foto_base64 ni foto_perfil_url" },
        { status: 400 }
      );
    }

    // actualizar en DB
    await pool.query(
      `UPDATE usuarios SET foto_perfil_url = ?, fecha_modificacion = NOW() WHERE id_usuario = ?`,
      [nuevaUrl, idUsuario]
    );

    // devolver perfil actualizado
    const perfil = await cargarPerfilUsuario(idUsuario);

    return NextResponse.json(
      {
        success: true,
        message: "Foto de perfil actualizada",
        foto_perfil_url: nuevaUrl,
        perfil,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("❌ Error en POST /api/usuario/perfil:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Error interno del servidor",
        details: process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}

// ========================================
// PUT - actualizar datos básicos del perfil
// (nombre, apellidos, teléfonos, dirección, etc.)
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

    const [sesiones] = await pool.query<RowDataPacket[]>(
      `
      SELECT su.id_usuario
      FROM sesiones_usuarios su
      INNER JOIN usuarios u ON u.id_usuario = su.id_usuario
      WHERE su.token = ?
        AND su.activa = 1
        AND (su.fecha_expiracion IS NULL OR su.fecha_expiracion > NOW())
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
    const body = await request.json();

    const campos: string[] = [];
    const params: any[] = [];

    const updatableFields = [
      "nombre",
      "apellido_paterno",
      "apellido_materno",
      "telefono",
      "celular",
      "direccion",
      "ciudad",
      "region",
      "genero",
      "fecha_nacimiento",
    ] as const;

    for (const f of updatableFields) {
      if (body[f] !== undefined) {
        campos.push(`${f} = ?`);
        params.push(body[f]);
      }
    }

    if (campos.length === 0) {
      return NextResponse.json(
        { success: false, error: "No hay campos para actualizar" },
        { status: 400 }
      );
    }

    params.push(idUsuario);

    await pool.query(
      `UPDATE usuarios SET ${campos.join(", ")}, fecha_modificacion = NOW() WHERE id_usuario = ?`,
      params
    );

    const perfil = await cargarPerfilUsuario(idUsuario);

    return NextResponse.json(
      {
        success: true,
        message: "Perfil actualizado",
        perfil,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("❌ Error en PUT /api/usuario/perfil:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Error interno del servidor",
        details: process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}
