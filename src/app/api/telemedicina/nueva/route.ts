// frontend/src/app/api/telemedicina/nueva/route.ts
import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { RowDataPacket, ResultSetHeader } from "mysql2";
import crypto from "crypto";

export const dynamic = "force-dynamic";

const SESSION_COOKIE_CANDIDATES = [
  "session",
  "session_token",
  "medisalud_session",
  "auth_session",
  "next-auth.session-token",
  "__Secure-next-auth.session-token",
];

// ==============================
// helpers
// ==============================
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
      if (cookies[name]) return decodeURIComponent(cookies[name]);
    }
  }

  const auth =
    request.headers.get("authorization") ||
    request.headers.get("Authorization");
  if (auth?.startsWith("Bearer ")) return auth.slice(7);

  return null;
}

async function obtenerMedicoAutenticado(idUsuario: number) {
  const [rows] = await pool.query<RowDataPacket[]>(
    `
    SELECT 
      m.id_medico,
      m.id_usuario,
      m.id_centro_principal
    FROM medicos m
    WHERE m.id_usuario = ?
      AND m.estado = 'activo'
    LIMIT 1
    `,
    [idUsuario]
  );
  return rows.length ? rows[0] : null;
}

// ===================================================
// GET /api/telemedicina/nueva
// ===================================================
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
    const medico = await obtenerMedicoAutenticado(idUsuario);
    if (!medico) {
      return NextResponse.json(
        { success: false, error: "No tienes un registro de médico activo" },
        { status: 403 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const search = (searchParams.get("search") || "").trim();
    const idPaciente = searchParams.get("id_paciente");

    // actualizar actividad
    await pool.query(
      `UPDATE sesiones_usuarios SET ultima_actividad = NOW() WHERE token = ?`,
      [sessionToken]
    );

    // traer un paciente puntual
    if (idPaciente) {
      const [rows] = await pool.query<RowDataPacket[]>(
        `
        SELECT 
          p.id_paciente,
          p.nombre,
          p.apellido_paterno,
          p.apellido_materno,
          p.rut,
          p.telefono,
          p.email,
          p.direccion,
          p.fecha_nacimiento,
          TIMESTAMPDIFF(YEAR, p.fecha_nacimiento, CURDATE()) AS edad,
          p.genero,
          p.foto_url,
          p.id_usuario
        FROM pacientes p
        WHERE p.id_paciente = ?
        LIMIT 1
        `,
        [Number(idPaciente)]
      );

      if (!rows.length) {
        return NextResponse.json(
          { success: false, error: "Paciente no encontrado" },
          { status: 404 }
        );
      }

      const p = rows[0];
      const nombre_completo = `${p.nombre ?? ""} ${p.apellido_paterno ?? ""} ${
        p.apellido_materno ?? ""
      }`
        .trim()
        .replace(/\s+/g, " ");

      return NextResponse.json(
        {
          success: true,
          paciente: {
            id_paciente: p.id_paciente,
            nombre_completo,
            rut: p.rut,
            telefono: p.telefono,
            email: p.email,
            direccion: p.direccion,
            edad: p.edad,
            genero: p.genero,
            foto_url: p.foto_url,
            id_usuario: p.id_usuario,
          },
        },
        { status: 200 }
      );
    }

    // sin search -> vacío
    if (!search) {
      return NextResponse.json({ success: true, pacientes: [] }, { status: 200 });
    }

    // búsqueda
    const searchRut = search.replace(/\./g, "").replace(/-/g, "").replace(/\s+/g, "");
    const like = `%${search}%`;

    const [pacientes] = await pool.query<RowDataPacket[]>(
      `
      SELECT 
        p.id_paciente,
        p.nombre,
        p.apellido_paterno,
        p.apellido_materno,
        p.rut,
        p.telefono,
        p.email,
        p.direccion,
        p.fecha_nacimiento,
        TIMESTAMPDIFF(YEAR, p.fecha_nacimiento, CURDATE()) AS edad,
        p.genero,
        p.foto_url,
        p.id_usuario
      FROM pacientes p
      WHERE
        CONCAT_WS(' ', p.nombre, p.apellido_paterno, p.apellido_materno) LIKE ? OR
        p.nombre LIKE ? OR
        p.apellido_paterno LIKE ? OR
        p.apellido_materno LIKE ? OR
        p.email LIKE ? OR
        p.telefono LIKE ? OR
        REPLACE(REPLACE(p.rut, '.', ''), '-', '') LIKE ?
      ORDER BY p.nombre ASC
      LIMIT 25
      `,
      [like, like, like, like, like, like, `%${searchRut}%`]
    );

    let pacientesDTO = pacientes.map((p) => ({
      id_paciente: p.id_paciente,
      nombre_completo: `${p.nombre ?? ""} ${p.apellido_paterno ?? ""} ${
        p.apellido_materno ?? ""
      }`
        .trim()
        .replace(/\s+/g, " "),
      rut: p.rut,
      telefono: p.telefono,
      email: p.email,
      direccion: p.direccion,
      edad: p.edad,
      genero: p.genero,
      foto_url: p.foto_url,
      id_usuario: p.id_usuario,
    }));

    // si no hay resultados, mostrar últimos pacientes del médico
    if (!pacientesDTO.length) {
      const [recientes] = await pool.query<RowDataPacket[]>(
        `
        SELECT DISTINCT
          p.id_paciente,
          p.nombre,
          p.apellido_paterno,
          p.apellido_materno,
          p.rut,
          p.telefono,
          p.email,
          p.direccion,
          p.fecha_nacimiento,
          TIMESTAMPDIFF(YEAR, p.fecha_nacimiento, CURDATE()) AS edad,
          p.genero,
          p.foto_url,
          p.id_usuario
        FROM telemedicina_sesiones ts
        INNER JOIN pacientes p ON p.id_paciente = ts.id_paciente
        WHERE ts.id_medico = ?
        ORDER BY COALESCE(ts.fecha_hora_inicio_real, ts.fecha_hora_inicio_programada, ts.fecha_creacion) DESC
        LIMIT 20
        `,
        [medico.id_medico]
      );

      pacientesDTO = recientes.map((p) => ({
        id_paciente: p.id_paciente,
        nombre_completo: `${p.nombre ?? ""} ${p.apellido_paterno ?? ""} ${
          p.apellido_materno ?? ""
        }`
          .trim()
          .replace(/\s+/g, " "),
        rut: p.rut,
        telefono: p.telefono,
        email: p.email,
        direccion: p.direccion,
        edad: p.edad,
        genero: p.genero,
        foto_url: p.foto_url,
        id_usuario: p.id_usuario,
      }));
    }

    return NextResponse.json(
      {
        success: true,
        pacientes: pacientesDTO,
      },
      { status: 200 }
    );
  } catch (err: any) {
    console.error("❌ Error en GET /api/telemedicina/nueva:", err);
    return NextResponse.json(
      { success: false, error: "Error interno del servidor", details: err.message },
      { status: 500 }
    );
  }
}

// ===================================================
// POST /api/telemedicina/nueva
// ===================================================
export async function POST(request: NextRequest) {
  let conn: any = null;
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
    const medico = await obtenerMedicoAutenticado(idUsuario);
    if (!medico) {
      return NextResponse.json(
        { success: false, error: "No tienes un registro de médico activo" },
        { status: 403 }
      );
    }

    const body = await request.json();

    const {
      id_paciente,
      id_cita,
      fecha_hora_inicio_programada,
      duracion_minutos,
      motivo,
      notas_tecnicas,
      canal,
      proveedor_servicio,
      prioridad,
      // estos vienen del front pero tu tabla de sesiones NO los tiene
      telefono_paciente,
      email_paciente,
      ubicacion_paciente,
    } = body ?? {};

    if (!id_paciente) {
      return NextResponse.json(
        { success: false, error: "Falta id_paciente" },
        { status: 400 }
      );
    }

    // validar paciente
    const [pacRows] = await pool.query<RowDataPacket[]>(
      `SELECT id_paciente, id_usuario FROM pacientes WHERE id_paciente = ? LIMIT 1`,
      [id_paciente]
    );
    if (!pacRows.length) {
      return NextResponse.json(
        { success: false, error: "El paciente no existe" },
        { status: 404 }
      );
    }

    if (!fecha_hora_inicio_programada) {
      return NextResponse.json(
        { success: false, error: "Falta fecha_hora_inicio_programada" },
        { status: 400 }
      );
    }

    const inicio = new Date(fecha_hora_inicio_programada);
    if (Number.isNaN(inicio.getTime())) {
      return NextResponse.json(
        { success: false, error: "La fecha/hora no es válida" },
        { status: 400 }
      );
    }

    const duracion = Number(duracion_minutos) > 0 ? Number(duracion_minutos) : 30;
    const fin = new Date(inicio.getTime() + duracion * 60_000);

    conn = await pool.getConnection();
    await conn.beginTransaction();

    // 1) crear cita si no vino
    let idCitaCreada: number;
    if (!id_cita) {
      if (!medico.id_centro_principal) {
        await conn.rollback();
        return NextResponse.json(
          {
            success: false,
            error:
              "El médico no tiene centro principal configurado, no se puede crear la cita",
          },
          { status: 400 }
        );
      }

      const [resCita] = await conn.query<ResultSetHeader>(
        `
        INSERT INTO citas (
          id_paciente,
          id_medico,
          id_centro,
          id_sucursal,
          fecha_hora_inicio,
          fecha_hora_fin,
          duracion_minutos,
          tipo_cita,
          motivo,
          estado,
          prioridad,
          origen,
          pagada,
          creado_por
        ) VALUES (?, ?, ?, NULL, ?, ?, ?, 'telemedicina', ?, 'programada', ?, 'web', 0, ?)
        `,
        [
          id_paciente,
          medico.id_medico,
          medico.id_centro_principal,
          inicio,
          fin,
          duracion,
          motivo || null,
          prioridad || "normal",
          idUsuario,
        ]
      );
      idCitaCreada = resCita.insertId;
    } else {
      const [citaRows] = await conn.query<RowDataPacket[]>(
        `SELECT id_cita FROM citas WHERE id_cita = ? LIMIT 1`,
        [id_cita]
      );
      if (!citaRows.length) {
        await conn.rollback();
        return NextResponse.json(
          { success: false, error: "La cita indicada no existe" },
          { status: 404 }
        );
      }
      idCitaCreada = Number(id_cita);
    }

    // 2) crear sesión de telemedicina
    const baseUrl =
      process.env.TELEMEDICINA_BASE_URL ||
      process.env.NEXT_PUBLIC_APP_URL ||
      "http://localhost:3000";

    const tokenSesion = crypto.randomBytes(24).toString("hex");

    // 👇 aquí usamos la ruta REAL de tu frontend
    const urlSesion = `${baseUrl}/medico/telemedicina/sala/video?token=${tokenSesion}`;

    // proveedor
    let proveedorFinal = proveedor_servicio || null;
    if (!proveedorFinal) {
      const [provRows] = await conn.query<RowDataPacket[]>(
        `
        SELECT codigo
        FROM telemedicina_proveedores
        WHERE activo = 1
        ORDER BY es_default DESC, id_proveedor ASC
        LIMIT 1
        `
      );
      proveedorFinal = provRows.length ? provRows[0].codigo : "plataforma_interna";
    }

    // tu tabla telemedicina_sesiones NO tenía telefono_paciente/email/ubicacion,
    // así que NO las metemos acá
    const [resSesion] = await conn.query<ResultSetHeader>(
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
        duracion_segundos,
        proveedor_servicio,
        notas_tecnicas,
        grabacion_autorizada
      ) VALUES (?, ?, ?, ?, ?, 'programada', ?, ?, ?, ?, ?, 0)
      `,
      [
        idCitaCreada,
        id_paciente,
        medico.id_medico,
        tokenSesion,
        urlSesion,
        inicio,
        fin,
        duracion * 60,
        proveedorFinal,
        notas_tecnicas || motivo || null,
      ]
    );

    const idSesionCreada = resSesion.insertId;

    // 3) enlaces: usamos tu definición con id_usuario obligatorio
    const ahora = new Date();
    const expira = new Date(ahora.getTime() + 2 * 60 * 60 * 1000); // +2h

    const tokenPaciente = crypto.randomBytes(20).toString("hex");
    const tokenMedico = crypto.randomBytes(20).toString("hex");

    // las URLs deben ir a tu página real del front
    const urlPaciente = `${baseUrl}/medico/telemedicina/sala/video?token=${tokenPaciente}`;
    const urlMedico = `${baseUrl}/medico/telemedicina/sala/video?token=${tokenMedico}`;

    // si el paciente NO tiene id_usuario en la tabla pacientes, usamos el médico
    const idUsuarioPaciente =
      pacRows[0].id_usuario && pacRows[0].id_usuario > 0
        ? pacRows[0].id_usuario
        : idUsuario;

    await conn.query(
      `
      INSERT INTO telemedicina_enlaces (
        id_sesion,
        id_usuario,
        tipo_usuario,
        tipo_enlace,
        token,
        token_acceso,
        url_acceso,
        fecha_generacion,
        fecha_expiracion,
        acceso_unico,
        utilizado,
        usado,
        estado,
        creado_por
      ) VALUES
        (?, ?, 'paciente', 'paciente', ?, ?, ?, ?, ?, 1, 0, 0, 'activo', ?),
        (?, ?, 'medico',   'medico',   ?, ?, ?, ?, ?, 1, 0, 0, 'activo', ?)
      `,
      [
        // fila paciente
        idSesionCreada,
        idUsuarioPaciente,
        tokenPaciente,
        tokenPaciente,
        urlPaciente,
        ahora,
        expira,
        idUsuario,

        // fila médico
        idSesionCreada,
        idUsuario,
        tokenMedico,
        tokenMedico,
        urlMedico,
        ahora,
        expira,
        idUsuario,
      ]
    );

    // 4) actualizar actividad sesión
    await conn.query(
      `UPDATE sesiones_usuarios SET ultima_actividad = NOW() WHERE token = ?`,
      [sessionToken]
    );

    await conn.commit();

    return NextResponse.json(
      {
        success: true,
        message: "Sesión de telemedicina creada correctamente",
        cita: {
          id_cita: idCitaCreada,
          id_paciente,
          id_medico: medico.id_medico,
          id_centro: medico.id_centro_principal,
          fecha_hora_inicio: inicio,
          fecha_hora_fin: fin,
          estado: "programada",
        },
        sesion: {
          id_sesion: idSesionCreada,
          id_cita: idCitaCreada,
          id_paciente,
          id_medico: medico.id_medico,
          token_acceso: tokenSesion,
          url_sesion: urlSesion,
          estado: "programada",
          fecha_hora_inicio_programada: inicio,
          fecha_hora_fin_programada: fin,
          duracion_segundos: duracion * 60,
          proveedor_servicio: proveedorFinal,
          notas_tecnicas: notas_tecnicas || motivo || null,
          canal: canal || "video",
        },
        enlaces: {
          paciente: {
            token: tokenPaciente,
            url: urlPaciente,
            expira,
          },
          medico: {
            token: tokenMedico,
            url: urlMedico,
            expira,
          },
        },
      },
      { status: 201 }
    );
  } catch (err: any) {
    console.error("❌ Error en POST /api/telemedicina/nueva:", err);
    if (conn) {
      try {
        await conn.rollback();
      } catch (_) {}
    }
    return NextResponse.json(
      {
        success: false,
        error: "Error interno del servidor",
        details: err.message,
      },
      { status: 500 }
    );
  } finally {
    if (conn) conn.release();
  }
}
