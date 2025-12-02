// app/api/medico/perfil/route.ts
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { RowDataPacket, ResultSetHeader } from "mysql2";


// las mismas cookies que usas en los otros endpoints
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

/**
 * Carga el mismo objeto "usuario" que espera el front,
 * pero ahora devolvemos MÁS campos del médico (los profesionales).
 */
async function cargarUsuarioSesion(idUsuario: number) {
  // 1. usuario + rol
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

  if (usuarios.length === 0) return null;
  const u = usuarios[0];

  // 2. médico
  const [medicos] = await pool.query<RowDataPacket[]>(
    `
    SELECT 
      m.id_medico,
      m.id_usuario,
      m.id_centro_principal,
      m.id_centro,
      m.id_sucursal,
      m.id_especialidad_principal,
      m.numero_registro_medico,
      m.titulo_profesional,
      m.universidad,
      m.ano_graduacion,
      m.especialidad_principal,
      m.anos_experiencia,
      m.biografia,
      m.acepta_nuevos_pacientes,
      m.atiende_particular,
      m.atiende_fonasa,
      m.atiende_isapre,
      m.consulta_presencial,
      m.consulta_telemedicina,
      m.duracion_consulta_min,
      m.firma_digital,
      m.firma_digital_url,
      m.verificado_por_admin,
      m.requiere_revision_credenciales,
      m.estado,
      m.calificacion_promedio,
      m.numero_opiniones,
      cm.nombre AS centro_nombre,
      cm.logo_url AS centro_logo_url,
      cm.ciudad AS centro_ciudad,
      cm.region AS centro_region
      -- si tu tabla centros_medicos tiene "plan", lo traes así:
      -- , cm.plan AS centro_plan
    FROM medicos m
    LEFT JOIN centros_medicos cm ON cm.id_centro = m.id_centro_principal
    WHERE m.id_usuario = ? AND m.estado IN ('activo','suspendido')
    LIMIT 1
    `,
    [idUsuario]
  );

  let medicoData: any = undefined;

  if (medicos.length > 0) {
    const m = medicos[0];

    // especialidades
    const [especialidades] = await pool.query<RowDataPacket[]>(
      `
      SELECT 
        me.id_especialidad,
        e.nombre,
        me.es_principal
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
      ano_graduacion: m.ano_graduacion,
      especialidad_principal: m.especialidad_principal,
      especialidades: especialidades.map((esp) => ({
        id_especialidad: esp.id_especialidad,
        nombre: esp.nombre,
        es_principal: esp.es_principal === 1,
      })),
      id_centro_principal: m.id_centro_principal,
      centro_principal: {
        id_centro: m.id_centro_principal,
        nombre: m.centro_nombre,
        plan: (m as any).centro_plan || "basico", // si no está en la tabla, fijo
        logo_url: m.centro_logo_url,
        ciudad: m.centro_ciudad,
        region: m.centro_region,
      },
      anos_experiencia: Number(m.anos_experiencia || 0),
      biografia: m.biografia,
      acepta_nuevos_pacientes: !!m.acepta_nuevos_pacientes,
      atiende_particular: !!m.atiende_particular,
      atiende_fonasa: !!m.atiende_fonasa,
      atiende_isapre: !!m.atiende_isapre,
      consulta_presencial: !!m.consulta_presencial,
      consulta_telemedicina: !!m.consulta_telemedicina,
      duracion_consulta_min: Number(m.duracion_consulta_min || 30),
      firma_digital: !!m.firma_digital,
      firma_digital_url: m.firma_digital_url,
      verificado_por_admin: !!m.verificado_por_admin,
      requiere_revision_credenciales: !!m.requiere_revision_credenciales,
      calificacion_promedio: Number(m.calificacion_promedio || 0),
      numero_opiniones: Number(m.numero_opiniones || 0),
      estado: m.estado,
    };
  }

  const usuario = {
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

  return usuario;
}

// ==========================
// helpers nuevos para datos reales
// ==========================

async function cargarMetricasMedico(idMedico: number) {
  // pacientes asignados
  const [pacRows] = await pool.query<RowDataPacket[]>(
    `
    SELECT COUNT(DISTINCT pm.id_paciente) AS total
    FROM pacientes_medico pm
    WHERE pm.id_medico = ? AND pm.activo = 1
    `,
    [idMedico]
  );
  const pacientes_totales = pacRows.length ? Number(pacRows[0].total || 0) : 0;

  // citas de la semana (ISO week)
  const [citasSemanaRows] = await pool.query<RowDataPacket[]>(
    `
    SELECT COUNT(*) AS total
    FROM citas c
    WHERE c.id_medico = ?
      AND YEARWEEK(c.fecha_hora_inicio, 1) = YEARWEEK(CURDATE(), 1)
      AND c.estado IN ('programada','confirmada','en_sala_espera','en_atencion','completada')
    `,
    [idMedico]
  );
  const citas_semana = citasSemanaRows.length ? Number(citasSemanaRows[0].total || 0) : 0;

  // asistencia últimos 30 días
  const [asisRows] = await pool.query<RowDataPacket[]>(
    `
    SELECT
      SUM(c.estado = 'completada') AS completadas,
      SUM(c.estado IN ('completada','no_asistio','cancelada','reprogramada')) AS total_relevante
    FROM citas c
    WHERE c.id_medico = ?
      AND c.fecha_hora_inicio >= (CURDATE() - INTERVAL 30 DAY)
    `,
    [idMedico]
  );

  const completadas = asisRows.length ? Number(asisRows[0].completadas || 0) : 0;
  const total_relevante = asisRows.length ? Number(asisRows[0].total_relevante || 0) : 0;
  const tasa_asistencia =
    total_relevante > 0 ? Math.round((completadas / total_relevante) * 100) : 100;

  // calificación la saca el front de usuario.medico.calificacion_promedio

  return {
    pacientes_totales,
    citas_semana,
    tasa_asistencia,
  };
}

async function cargarActividadReciente(idMedico: number) {
  // últimas 10 citas
  const [rows] = await pool.query<RowDataPacket[]>(
    `
    SELECT 
      'cita' AS tipo,
      CONCAT('Cita con paciente #', c.id_paciente) AS titulo,
      DATE_FORMAT(c.fecha_hora_inicio, '%Y-%m-%d %H:%i') AS fecha,
      CONCAT('Estado: ', c.estado, ' · Origen: ', c.origen) AS descripcion
    FROM citas c
    WHERE c.id_medico = ?
    ORDER BY c.fecha_modificacion DESC, c.fecha_hora_inicio DESC
    LIMIT 10
    `,
    [idMedico]
  );

  return rows;
}

async function cargarDisponibilidad(idMedico: number, idCentro: number) {
  // unificamos por día con bloques
  const [rows] = await pool.query<RowDataPacket[]>(
    `
    SELECT 
      d.dia_semana,
      TIME_FORMAT(d.hora_inicio, '%H:%i') AS hora_inicio,
      TIME_FORMAT(d.hora_fin, '%H:%i') AS hora_fin,
      d.tipo_atencion
    FROM disponibilidad_medicos d
    WHERE d.id_medico = ? 
      AND d.id_centro = ?
      AND d.estado = 'activo'
    ORDER BY FIELD(d.dia_semana, 'lunes','martes','miercoles','jueves','viernes','sabado','domingo'), d.hora_inicio
    `,
    [idMedico, idCentro]
  );

  const agrupado: Record<string, string[]> = {};
  for (const r of rows) {
    if (!agrupado[r.dia_semana]) agrupado[r.dia_semana] = [];
    agrupado[r.dia_semana].push(`${r.hora_inicio}-${r.hora_fin} (${r.tipo_atencion})`);
  }

  return Object.entries(agrupado).map(([dia, bloques]) => ({ dia, bloques }));
}

async function cargarDocumentos(idUsuario: number) {
  // credenciales_profesionales
  const [docs] = await pool.query<RowDataPacket[]>(
    `
    SELECT 
      cp.id_credencial AS id,
      cp.tipo_credencial AS tipo,
      cp.estado,
      DATE_FORMAT(cp.fecha_creacion, '%Y-%m-%d') AS fecha_subida,
      cp.observaciones AS comentario
    FROM credenciales_profesionales cp
    WHERE cp.id_usuario = ?
    ORDER BY cp.fecha_creacion DESC
    `,
    [idUsuario]
  );

  // firma electrónica como otro documento
  const [firmas] = await pool.query<RowDataPacket[]>(
    `
    SELECT 
      fe.id_firma AS id,
      CONCAT('Firma electrónica (', fe.tipo_firma, ')') AS tipo,
      fe.estado,
      DATE_FORMAT(fe.fecha_creacion, '%Y-%m-%d') AS fecha_subida,
      fe.entidad_emisora AS comentario
    FROM firmas_electronicas fe
    WHERE fe.id_usuario = ?
    ORDER BY fe.fecha_creacion DESC
    `,
    [idUsuario]
  );

  return [...docs, ...firmas];
}

async function cargarAuditoriaSesiones(idUsuario: number) {
  const [rows] = await pool.query<RowDataPacket[]>(
    `
    SELECT 
      su.id_sesion AS id,
      CONCAT('Sesión desde ', IFNULL(su.ip_address, 'IP desconocida')) AS accion,
      DATE_FORMAT(su.ultima_actividad, '%Y-%m-%d %H:%i:%s') AS fecha,
      su.ip_address AS ip,
      su.user_agent AS agente
    FROM sesiones_usuarios su
    WHERE su.id_usuario = ?
    ORDER BY su.ultima_actividad DESC
    LIMIT 10
    `,
    [idUsuario]
  );
  return rows;
}

/**
 * Como no tienes tabla de integraciones en ese dump, devolvemos una lista
 * basada en cosas que sí sabemos del médico.
 */
function fabricarIntegraciones(medico: any) {
  return [
    {
      nombre: "Google Calendar",
      clave: "google_calendar",
      conectado: false,
      actualizado: null,
    },
    {
      nombre: "Zoom",
      clave: "zoom",
      conectado: medico?.consulta_telemedicina ? true : false,
      actualizado: medico?.consulta_telemedicina ? new Date().toISOString() : null,
    },
    {
      nombre: "Firma electrónica",
      clave: "firma",
      conectado: medico?.firma_digital ? true : false,
      actualizado: medico?.firma_digital ? new Date().toISOString() : null,
    },
  ];
}

// ======================
// GET: devolver perfil médico (con usuario + datos reales)
// ======================
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
    await pool.query(`UPDATE sesiones_usuarios SET ultima_actividad = NOW() WHERE token = ?`, [
      sessionToken,
    ]);

    const usuario = await cargarUsuarioSesion(idUsuario);
    if (!usuario) {
      return NextResponse.json(
        { success: false, error: "No se pudo cargar el usuario" },
        { status: 404 }
      );
    }

    // si es médico, traemos TODO lo demás
    let metricas: any = null;
    let actividad: any[] = [];
    let disponibilidad: any[] = [];
    let documentos: any[] = [];
    let auditoria: any[] = [];
    let integraciones: any[] = [];

    if (usuario.medico?.id_medico) {
      const idMedico = usuario.medico.id_medico;
      const idCentro = usuario.medico.id_centro_principal;

      metricas = await cargarMetricasMedico(idMedico);
      actividad = await cargarActividadReciente(idMedico);
      disponibilidad = await cargarDisponibilidad(idMedico, idCentro);
      documentos = await cargarDocumentos(idUsuario);
      auditoria = await cargarAuditoriaSesiones(idUsuario);
      integraciones = fabricarIntegraciones(usuario.medico);

      // calculamos % completitud aquí mismo
      const camposClave = [
        usuario.foto_perfil_url,
        usuario.medico.numero_registro_medico,
        usuario.medico.titulo_profesional,
        usuario.medico.especialidad_principal,
        usuario.medico.anos_experiencia,
        usuario.medico.biografia,
      ];
      const llenos = camposClave.filter((v) => v !== null && v !== "" && v !== undefined).length;
      const completitud_perfil = Math.min(100, Math.round((llenos / camposClave.length) * 100));

      metricas = {
        ...metricas,
        calificacion: usuario.medico.calificacion_promedio ?? 5,
        completitud_perfil,
      };
    }

    return NextResponse.json(
      {
        success: true,
        usuario,
        metricas,
        actividad,
        disponibilidad,
        documentos,
        integraciones,
        auditoria,
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("❌ Error en GET /api/medico/perfil:", error);
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

// ======================
// PUT: actualizar perfil y devolver todo actualizado
// ======================
export async function PUT(request: NextRequest) {
  try {
    const sessionToken = getSessionToken(request);
    if (!sessionToken) {
      return NextResponse.json(
        { success: false, message: "No hay sesión activa" },
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
        { success: false, message: "Sesión inválida o expirada" },
        { status: 401 }
      );
    }

    const idUsuario = sesiones[0].id_usuario;
    const body = await request.json();
    const { personal, profesional /* preferencias, notificaciones, publico */ } = body;

    // 1) actualizar usuarios
    if (personal && typeof personal === "object") {
      const campos: string[] = [];
      const params: any[] = [];

      const fields = [
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

      for (const f of fields) {
        if (personal[f] !== undefined) {
          campos.push(`${f} = ?`);
          params.push(personal[f]);
        }
      }

      if (campos.length > 0) {
        params.push(idUsuario);
        await pool.query(
          `UPDATE usuarios SET ${campos.join(
            ", "
          )}, fecha_modificacion = NOW() WHERE id_usuario = ?`,
          params
        );
      }
    }

    // 2) obtener id_medico
    const [medicos] = await pool.query<RowDataPacket[]>(
      `SELECT id_medico FROM medicos WHERE id_usuario = ? LIMIT 1`,
      [idUsuario]
    );
    const idMedico = medicos.length ? medicos[0].id_medico : null;

    // 3) actualizar medicos
    if (idMedico && profesional && typeof profesional === "object") {
      const campos: string[] = [];
      const params: any[] = [];

      const fieldsMedico = [
        "numero_registro_medico",
        "titulo_profesional",
        "universidad",
        "ano_graduacion",
        "anos_experiencia",
        "biografia",
        "acepta_nuevos_pacientes",
        "atiende_particular",
        "atiende_fonasa",
        "atiende_isapre",
        "consulta_presencial",
        "consulta_telemedicina",
        "duracion_consulta_min",
        "especialidad_principal",
      ] as const;

      for (const f of fieldsMedico) {
        if (profesional[f] !== undefined) {
          campos.push(`${f} = ?`);
          params.push(profesional[f]);
        }
      }

      if (campos.length > 0) {
        params.push(idMedico);
        await pool.query(
          `UPDATE medicos SET ${campos.join(
            ", "
          )}, fecha_modificacion = NOW() WHERE id_medico = ?`,
          params
        );
      }

      // sincronizar especialidad en tabla puente
      if (
        profesional.especialidad_principal &&
        typeof profesional.especialidad_principal === "string"
      ) {
        const nombreEsp = profesional.especialidad_principal.trim();

        if (nombreEsp.length > 0) {
          const [espRows] = await pool.query<RowDataPacket[]>(
            `SELECT id_especialidad FROM especialidades WHERE nombre = ? LIMIT 1`,
            [nombreEsp]
          );

          let idEspecialidad: number;

          if (espRows.length > 0) {
            idEspecialidad = espRows[0].id_especialidad;
          } else {
            const codigoBase = nombreEsp
              .normalize("NFD")
              .replace(/[\u0300-\u036f]/g, "")
              .replace(/[^a-zA-Z0-9]+/g, "_")
              .toUpperCase()
              .slice(0, 20);

            const codigoFinal = codigoBase || `ESP_${Date.now()}`;

            const [insertEsp] = await pool.query<ResultSetHeader>(
              `
              INSERT INTO especialidades (nombre, codigo, requiere_certificacion, activo)
              VALUES (?, ?, 1, 1)
              `,
              [nombreEsp, codigoFinal]
            );
            idEspecialidad = insertEsp.insertId;
          }

          await pool.query(
            `
            INSERT INTO medicos_especialidades (id_medico, id_especialidad, es_principal)
            VALUES (?, ?, 1)
            ON DUPLICATE KEY UPDATE es_principal = 1
            `,
            [idMedico, idEspecialidad]
          );

          await pool.query(
            `
            UPDATE medicos_especialidades
            SET es_principal = 0
            WHERE id_medico = ? AND id_especialidad <> ?
            `,
            [idMedico, idEspecialidad]
          );
        }
      }
    }

    // 4) recargar todo para devolverlo al front ya actualizado
    const usuario = await cargarUsuarioSesion(idUsuario);

    let metricas = null;
    let actividad: any[] = [];
    let disponibilidad: any[] = [];
    let documentos: any[] = [];
    let auditoria: any[] = [];
    let integraciones: any[] = [];

    if (usuario?.medico?.id_medico) {
      metricas = await cargarMetricasMedico(usuario.medico.id_medico);
      actividad = await cargarActividadReciente(usuario.medico.id_medico);
      disponibilidad = await cargarDisponibilidad(
        usuario.medico.id_medico,
        usuario.medico.id_centro_principal
      );
      documentos = await cargarDocumentos(idUsuario);
      auditoria = await cargarAuditoriaSesiones(idUsuario);
      integraciones = fabricarIntegraciones(usuario.medico);

      const camposClave = [
        usuario.foto_perfil_url,
        usuario.medico.numero_registro_medico,
        usuario.medico.titulo_profesional,
        usuario.medico.especialidad_principal,
        usuario.medico.anos_experiencia,
        usuario.medico.biografia,
      ];
      const llenos = camposClave.filter((v) => v !== null && v !== "" && v !== undefined).length;
      const completitud_perfil = Math.min(100, Math.round((llenos / camposClave.length) * 100));

      metricas = {
        ...metricas,
        calificacion: usuario.medico.calificacion_promedio ?? 5,
        completitud_perfil,
      };
    }

    return NextResponse.json(
      {
        success: true,
        message: "Perfil actualizado correctamente",
        usuario,
        metricas,
        actividad,
        disponibilidad,
        documentos,
        integraciones,
        auditoria,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("❌ Error en PUT /api/medico/perfil:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Error interno del servidor",
        details: process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}

// métodos no permitidos
export async function POST() {
  return NextResponse.json({ success: false, message: "Método no permitido" }, { status: 405 });
}

export async function DELETE() {
  return NextResponse.json({ success: false, message: "Método no permitido" }, { status: 405 });
}
