//frontend/src/app/api/admin/medicos/route.ts

import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { RowDataPacket, ResultSetHeader } from "mysql2";
import { registrarLog } from "@/lib/logs";

// ============================================================================
// GET - LISTAR MÉDICOS
// ============================================================================
//
// Devuelve:
// {
//   success: true,
//   medicos: Medico[],
//   especialidades: Especialidad[],
//   centros: CentroMedico[],
//   estadisticas: Estadisticas
// }
//
// El shape de cada objeto está hecho para que tu page.tsx funcione tal cual.
//
export async function GET(request: NextRequest) {
  let connection;

  try {
    const { searchParams } = new URL(request.url);

    // paginación opcional (tu page.tsx hoy no la manda, pero soportamos igual)
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(
      100,
      Math.max(1, parseInt(searchParams.get("limit") || "100"))
    );
    const offset = (page - 1) * limit;

    connection = await pool.getConnection();

    // -----------------------------------------------------------------------
    // 1. Traer médicos + joins + métricas (1 fila por médico)
    // -----------------------------------------------------------------------
    //
    // Importante:
    // - NO usamos valoraciones_medicas.
    // - calificacion_promedio y numero_opiniones vienen directo de la tabla medicos.
    // - total_pacientes y consultas_* salen de subqueries a pacientes_medico y citas.
    //
    const medicosQuery = `
      SELECT
        m.id_medico,
        m.id_usuario,
        m.id_centro_principal,
        m.numero_registro_medico,
        m.titulo_profesional,
        m.universidad,
        m.ano_graduacion,
        m.biografia,
        m.acepta_nuevos_pacientes,
        m.atiende_particular,
        m.atiende_fonasa,
        m.atiende_isapre,
        m.estado,
        m.consulta_presencial,
        m.consulta_telemedicina,
        m.firma_digital_url,
        m.duracion_consulta_min,
        m.fecha_inicio_actividad,
        m.fecha_creacion,
        m.fecha_modificacion,

        -- especialidad principal
        m.id_especialidad_principal,
        m.especialidad_principal,
        m.anos_experiencia,
        m.calificacion_promedio,
        m.numero_opiniones,

        -- datos del usuario asociado
        u.nombre                AS usuario_nombre,
        u.apellido_paterno      AS usuario_apellido_paterno,
        u.apellido_materno      AS usuario_apellido_materno,
        u.email                 AS usuario_email,
        u.telefono              AS usuario_telefono,
        u.celular               AS usuario_celular,
        u.foto_perfil_url       AS usuario_foto_perfil_url,
        u.rut                   AS usuario_rut,
        u.fecha_nacimiento      AS usuario_fecha_nacimiento,
        u.genero                AS usuario_genero,

        -- centro principal
        c.nombre                AS centro_nombre,
        c.ciudad                AS centro_ciudad,
        c.region                AS centro_region,

        -- info catálogo especialidad
        ep.codigo               AS especialidad_codigo,
        ep.nombre               AS especialidad_catalogo_nombre,

        -- Métricas dinámicas
        (
          SELECT COUNT(DISTINCT pm.id_paciente)
          FROM pacientes_medico pm
          WHERE pm.id_medico = m.id_medico
            AND pm.activo = 1
        ) AS total_pacientes,

        (
          SELECT COUNT(*)
          FROM citas ci
          WHERE ci.id_medico = m.id_medico
            AND ci.fecha_hora_inicio >= DATE_FORMAT(NOW(), '%Y-%m-01')
            AND ci.fecha_hora_inicio < DATE_ADD(DATE_FORMAT(NOW(), '%Y-%m-01'), INTERVAL 1 MONTH)
        ) AS consultas_mes_actual,

        (
          SELECT COUNT(*)
          FROM citas ci
          WHERE ci.id_medico = m.id_medico
            AND YEAR(ci.fecha_hora_inicio) = YEAR(NOW())
        ) AS consultas_ano_actual,

        (
          SELECT MIN(ci.fecha_hora_inicio)
          FROM citas ci
          WHERE ci.id_medico = m.id_medico
            AND ci.fecha_hora_inicio >= NOW()
        ) AS proxima_cita

      FROM medicos m
      INNER JOIN usuarios u
        ON m.id_usuario = u.id_usuario
      INNER JOIN centros_medicos c
        ON m.id_centro_principal = c.id_centro
      LEFT JOIN especialidades ep
        ON m.id_especialidad_principal = ep.id_especialidad
      ORDER BY m.fecha_modificacion DESC
      LIMIT ? OFFSET ?
    `;

    const [medicosRows] = await connection.query<RowDataPacket[]>(
      medicosQuery,
      [limit, offset]
    );

    // Normalizar filas a la forma que tu React espera
    const medicos = medicosRows.map((row) => {
      // armamos la lista de especialidades del médico.
      // Por ahora metemos sólo la principal, pero en array,
      // para que tu UI (que espera array) funcione.
      const especialidadesMedico = [
        {
          id_especialidad: row.id_especialidad_principal,
          nombre:
            row.especialidad_principal ||
            row.especialidad_catalogo_nombre ||
            "",
          codigo: row.especialidad_codigo || "",
          es_principal: true,
          anos_experiencia:
            row.anos_experiencia !== null
              ? Number(row.anos_experiencia)
              : 0,
        },
      ].filter((e) => e.id_especialidad || e.nombre); // evita item vacío

      return {
        id_medico: row.id_medico,
        id_usuario: row.id_usuario,
        id_centro_principal: row.id_centro_principal,
        numero_registro_medico: row.numero_registro_medico,
        titulo_profesional: row.titulo_profesional,
        universidad: row.universidad,
        ano_graduacion: row.ano_graduacion,
        biografia: row.biografia,
        acepta_nuevos_pacientes: row.acepta_nuevos_pacientes === 1,
        atiende_particular: row.atiende_particular === 1,
        atiende_fonasa: row.atiende_fonasa === 1,
        atiende_isapre: row.atiende_isapre === 1,
        estado: row.estado,
        consulta_presencial: row.consulta_presencial === 1,
        consulta_telemedicina: row.consulta_telemedicina === 1,
        firma_digital_url: row.firma_digital_url,
        duracion_consulta_min: row.duracion_consulta_min,
        fecha_inicio_actividad: row.fecha_inicio_actividad,
        fecha_creacion: row.fecha_creacion,
        fecha_modificacion: row.fecha_modificacion,

        usuario: {
          nombre: row.usuario_nombre,
          apellido_paterno: row.usuario_apellido_paterno,
          apellido_materno: row.usuario_apellido_materno,
          email: row.usuario_email,
          telefono: row.usuario_telefono,
          celular: row.usuario_celular,
          foto_perfil_url: row.usuario_foto_perfil_url,
          rut: row.usuario_rut,
          fecha_nacimiento: row.usuario_fecha_nacimiento,
          genero: row.usuario_genero,
        },

        centro_principal: {
          nombre: row.centro_nombre,
          ciudad: row.centro_ciudad,
          region: row.centro_region,
        },

        especialidades: especialidadesMedico,

        total_pacientes: Number(row.total_pacientes || 0),
        consultas_mes_actual: Number(row.consultas_mes_actual || 0),
        consultas_ano_actual: Number(row.consultas_ano_actual || 0),
        calificacion_promedio: Number(row.calificacion_promedio || 0),
        total_resenas: Number(row.numero_opiniones || 0),
        proxima_cita: row.proxima_cita || null,
        disponibilidad_semanal: 0, // placeholder fijo hasta que tengas disponibilidad_medicos
      };
    });

    // -----------------------------------------------------------------------
    // 2. Listado de especialidades (para el filtro desplegable en la UI)
    // -----------------------------------------------------------------------
    const [especialidadesRows] = await connection.query<RowDataPacket[]>(
      `
        SELECT 
          e.id_especialidad,
          e.nombre,
          e.descripcion,
          e.codigo,
          e.area_medica,
          e.activo
        FROM especialidades e
        ORDER BY e.nombre ASC
      `
    );

    // -----------------------------------------------------------------------
    // 3. Listado de centros médicos (para el filtro de centros en la UI)
    // -----------------------------------------------------------------------
    const [centrosRows] = await connection.query<RowDataPacket[]>(
      `
        SELECT 
          c.id_centro,
          c.nombre,
          c.ciudad,
          c.region,
          c.direccion
        FROM centros_medicos c
        ORDER BY c.nombre ASC
      `
    );

    // -----------------------------------------------------------------------
    // 4. Estadísticas globales para las "tarjetas" de arriba
    // -----------------------------------------------------------------------
    //
    // 4a. Stats base desde tabla medicos
    const [statsBaseRows] = await connection.query<RowDataPacket[]>(
      `
        SELECT 
          COUNT(*) AS total_medicos,
          COUNT(CASE WHEN m.estado = 'activo' THEN 1 END) AS medicos_activos,
          COUNT(CASE WHEN m.estado = 'inactivo' THEN 1 END) AS medicos_inactivos,
          COUNT(CASE WHEN m.estado = 'vacaciones' THEN 1 END) AS medicos_vacaciones,
          COUNT(CASE WHEN m.estado = 'suspendido' THEN 1 END) AS medicos_suspendidos,
          COUNT(DISTINCT m.id_especialidad_principal) AS total_especialidades,
          AVG(m.calificacion_promedio) AS calificacion_promedio_general,
          COUNT(CASE WHEN m.acepta_nuevos_pacientes = 1 THEN 1 END) AS medicos_aceptan_nuevos,
          COUNT(CASE WHEN m.consulta_telemedicina = 1 THEN 1 END) AS medicos_telemedicina
        FROM medicos m
      `
    );

    const statsBase = statsBaseRows[0] || {};

    // 4b. Total de consultas en últimos 30 días (todas las citas)
    const [consultasMesRows] = await connection.query<RowDataPacket[]>(
      `
        SELECT 
          COUNT(*) AS total_consultas_mes
        FROM citas ci
        WHERE ci.fecha_hora_inicio >= DATE_SUB(NOW(), INTERVAL 30 DAY)
      `
    );

    const total_consultas_mes =
      consultasMesRows[0]?.total_consultas_mes || 0;

    const estadisticas = {
      total_medicos: Number(statsBase.total_medicos || 0),
      medicos_activos: Number(statsBase.medicos_activos || 0),
      medicos_inactivos: Number(statsBase.medicos_inactivos || 0),
      medicos_vacaciones: Number(statsBase.medicos_vacaciones || 0),
      medicos_suspendidos: Number(statsBase.medicos_suspendidos || 0),
      total_especialidades: Number(statsBase.total_especialidades || 0),
      total_consultas_mes: Number(total_consultas_mes || 0),
      calificacion_promedio_general: Number(
        statsBase.calificacion_promedio_general || 0
      ),
      medicos_aceptan_nuevos: Number(
        statsBase.medicos_aceptan_nuevos || 0
      ),
      medicos_telemedicina: Number(
        statsBase.medicos_telemedicina || 0
      ),
    };

    // -----------------------------------------------------------------------
    // 5. Total para paginación (aunque tu UI hoy no lo usa directamente)
    // -----------------------------------------------------------------------
    const [countRows] = await connection.query<RowDataPacket[]>(
      `SELECT COUNT(*) AS total FROM medicos`
    );
    const total = countRows[0]?.total || 0;
    const totalPages = Math.ceil(total / limit);

    connection.release();

    return NextResponse.json({
      success: true,
      medicos,
      especialidades: especialidadesRows,
      centros: centrosRows,
      estadisticas,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    });
  } catch (error: any) {
    if (connection) connection.release();
    console.error("Error al listar médicos:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Error al obtener médicos",
        detalles: error.sqlMessage || error.message,
      },
      { status: 500 }
    );
  }
}

// ============================================================================
// POST - CREAR MÉDICO
// ============================================================================
//
// Nota importante:
// Tu formulario del front (modal "Nuevo Médico") manda datos del usuario
// y del médico juntos, pero NO manda id_usuario.
// Aquí de momento asumimos que ya existe un usuario y que nos mandas
// id_usuario. Si no es así todavía, este POST te va a dar 400.
//
// Cuando definas bien cómo crear también el usuario, podemos ampliar esto
// para insertar primero en `usuarios` y luego en `medicos`.
//
// Campos esperados en body (mínimo):
// - id_usuario
// - id_centro_principal
// - numero_registro_medico
// - titulo_profesional
// - universidad
// - ano_graduacion
// - estado
//
export async function POST(request: NextRequest) {
  let connection;

  try {
    const body = await request.json();

    const {
      id_usuario, // FK obligatorio a usuarios.id_usuario
      id_centro_principal,
      id_especialidad_principal = null,
      numero_registro_medico,
      especialidad_principal = "",
      titulo_profesional,
      universidad,
      ano_graduacion,
      biografia = "",
      acepta_nuevos_pacientes = true,
      atiende_particular = true,
      atiende_fonasa = false,
      atiende_isapre = false,
      estado = "activo",
      consulta_presencial = true,
      consulta_telemedicina = false,
      firma_digital_url = null,
      duracion_consulta_min = 30,
      anos_experiencia = 0,
      fecha_inicio_actividad = null,
      id_centro = null,
      id_sucursal = null,
    } = body;

    // Validaciones básicas
    if (
      !id_usuario ||
      !id_centro_principal ||
      !numero_registro_medico ||
      !titulo_profesional ||
      !universidad ||
      !ano_graduacion
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Faltan campos obligatorios: id_usuario, id_centro_principal, numero_registro_medico, titulo_profesional, universidad, ano_graduacion",
        },
        { status: 400 }
      );
    }

    connection = await pool.getConnection();
    await connection.beginTransaction();

    // 1. Verificar que el usuario exista
    const [usuarioRows] = await connection.query<RowDataPacket[]>(
      `
        SELECT id_usuario
        FROM usuarios
        WHERE id_usuario = ?
        LIMIT 1
      `,
      [id_usuario]
    );

    if (usuarioRows.length === 0) {
      await connection.rollback();
      connection.release();
      return NextResponse.json(
        { success: false, error: "El usuario asociado no existe" },
        { status: 400 }
      );
    }

    // 2. Verificar que ese usuario no esté ya registrado como médico
    const [yaMedicoRows] = await connection.query<RowDataPacket[]>(
      `
        SELECT id_medico
        FROM medicos
        WHERE id_usuario = ?
        LIMIT 1
      `,
      [id_usuario]
    );

    if (yaMedicoRows.length > 0) {
      await connection.rollback();
      connection.release();
      return NextResponse.json(
        {
          success: false,
          error: "Este usuario ya está registrado como médico",
        },
        { status: 400 }
      );
    }

    // 3. Insertar en medicos
    const [insertResult] = await connection.query<ResultSetHeader>(
      `
        INSERT INTO medicos (
          id_usuario,
          id_centro,
          id_sucursal,
          id_centro_principal,
          id_especialidad_principal,
          numero_registro_medico,
          especialidad_principal,
          titulo_profesional,
          universidad,
          ano_graduacion,
          biografia,
          acepta_nuevos_pacientes,
          atiende_particular,
          atiende_fonasa,
          atiende_isapre,
          estado,
          consulta_presencial,
          consulta_telemedicina,
          firma_digital,
          requiere_revision_credenciales,
          firma_digital_url,
          duracion_consulta_min,
          anos_experiencia,
          calificacion_promedio,
          numero_opiniones,
          fecha_inicio_actividad,
          fecha_actualizacion,
          fecha_creacion,
          fecha_modificacion
        ) VALUES (
          ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 1, ?, ?, ?, 0.00, 0, ?, NOW(), NOW(), NOW()
        )
      `,
      [
        id_usuario,
        id_centro,
        id_sucursal,
        id_centro_principal,
        id_especialidad_principal,
        numero_registro_medico,
        especialidad_principal,
        titulo_profesional,
        universidad,
        ano_graduacion,
        biografia,
        acepta_nuevos_pacientes ? 1 : 0,
        atiende_particular ? 1 : 0,
        atiende_fonasa ? 1 : 0,
        atiende_isapre ? 1 : 0,
        estado,
        consulta_presencial ? 1 : 0,
        consulta_telemedicina ? 1 : 0,
        firma_digital_url,
        duracion_consulta_min,
        anos_experiencia,
        fecha_inicio_actividad,
      ]
    );

    const nuevoIdMedico = insertResult.insertId;

    // 4. Traer el médico recién creado con el mismo SELECT base (1 fila)
    const [nuevoMedicoRows] = await connection.query<RowDataPacket[]>(
      `
        SELECT
          m.id_medico,
          m.id_usuario,
          m.id_centro_principal,
          m.numero_registro_medico,
          m.titulo_profesional,
          m.universidad,
          m.ano_graduacion,
          m.biografia,
          m.acepta_nuevos_pacientes,
          m.atiende_particular,
          m.atiende_fonasa,
          m.atiende_isapre,
          m.estado,
          m.consulta_presencial,
          m.consulta_telemedicina,
          m.firma_digital_url,
          m.duracion_consulta_min,
          m.fecha_inicio_actividad,
          m.fecha_creacion,
          m.fecha_modificacion,

          m.id_especialidad_principal,
          m.especialidad_principal,
          m.anos_experiencia,
          m.calificacion_promedio,
          m.numero_opiniones,

          u.nombre                AS usuario_nombre,
          u.apellido_paterno      AS usuario_apellido_paterno,
          u.apellido_materno      AS usuario_apellido_materno,
          u.email                 AS usuario_email,
          u.telefono              AS usuario_telefono,
          u.celular               AS usuario_celular,
          u.foto_perfil_url       AS usuario_foto_perfil_url,
          u.rut                   AS usuario_rut,
          u.fecha_nacimiento      AS usuario_fecha_nacimiento,
          u.genero                AS usuario_genero,

          c.nombre                AS centro_nombre,
          c.ciudad                AS centro_ciudad,
          c.region                AS centro_region,

          ep.codigo               AS especialidad_codigo,
          ep.nombre               AS especialidad_catalogo_nombre,

          (
            SELECT COUNT(DISTINCT pm.id_paciente)
            FROM pacientes_medico pm
            WHERE pm.id_medico = m.id_medico
              AND pm.activo = 1
          ) AS total_pacientes,

          (
            SELECT COUNT(*)
            FROM citas ci
            WHERE ci.id_medico = m.id_medico
              AND ci.fecha_hora_inicio >= DATE_FORMAT(NOW(), '%Y-%m-01')
              AND ci.fecha_hora_inicio < DATE_ADD(DATE_FORMAT(NOW(), '%Y-%m-01'), INTERVAL 1 MONTH)
          ) AS consultas_mes_actual,

          (
            SELECT COUNT(*)
            FROM citas ci
            WHERE ci.id_medico = m.id_medico
              AND YEAR(ci.fecha_hora_inicio) = YEAR(NOW())
          ) AS consultas_ano_actual,

          (
            SELECT MIN(ci.fecha_hora_inicio)
            FROM citas ci
            WHERE ci.id_medico = m.id_medico
              AND ci.fecha_hora_inicio >= NOW()
          ) AS proxima_cita

        FROM medicos m
        INNER JOIN usuarios u
          ON m.id_usuario = u.id_usuario
        INNER JOIN centros_medicos c
          ON m.id_centro_principal = c.id_centro
        LEFT JOIN especialidades ep
          ON m.id_especialidad_principal = ep.id_especialidad
        WHERE m.id_medico = ?
        LIMIT 1
      `,
      [nuevoIdMedico]
    );

    const row = nuevoMedicoRows[0];

    const nuevoMedico = {
      id_medico: row.id_medico,
      id_usuario: row.id_usuario,
      id_centro_principal: row.id_centro_principal,
      numero_registro_medico: row.numero_registro_medico,
      titulo_profesional: row.titulo_profesional,
      universidad: row.universidad,
      ano_graduacion: row.ano_graduacion,
      biografia: row.biografia,
      acepta_nuevos_pacientes: row.acepta_nuevos_pacientes === 1,
      atiende_particular: row.atiende_particular === 1,
      atiende_fonasa: row.atiende_fonasa === 1,
      atiende_isapre: row.atiende_isapre === 1,
      estado: row.estado,
      consulta_presencial: row.consulta_presencial === 1,
      consulta_telemedicina: row.consulta_telemedicina === 1,
      firma_digital_url: row.firma_digital_url,
      duracion_consulta_min: row.duracion_consulta_min,
      fecha_inicio_actividad: row.fecha_inicio_actividad,
      fecha_creacion: row.fecha_creacion,
      fecha_modificacion: row.fecha_modificacion,

      usuario: {
        nombre: row.usuario_nombre,
        apellido_paterno: row.usuario_apellido_paterno,
        apellido_materno: row.usuario_apellido_materno,
        email: row.usuario_email,
        telefono: row.usuario_telefono,
        celular: row.usuario_celular,
        foto_perfil_url: row.usuario_foto_perfil_url,
        rut: row.usuario_rut,
        fecha_nacimiento: row.usuario_fecha_nacimiento,
        genero: row.usuario_genero,
      },

      centro_principal: {
        nombre: row.centro_nombre,
        ciudad: row.centro_ciudad,
        region: row.centro_region,
      },

      especialidades: [
        {
          id_especialidad: row.id_especialidad_principal,
          nombre:
            row.especialidad_principal ||
            row.especialidad_catalogo_nombre ||
            "",
          codigo: row.especialidad_codigo || "",
          es_principal: true,
          anos_experiencia:
            row.anos_experiencia !== null
              ? Number(row.anos_experiencia)
              : 0,
        },
      ].filter((e: any) => e.id_especialidad || e.nombre),

      total_pacientes: Number(row.total_pacientes || 0),
      consultas_mes_actual: Number(row.consultas_mes_actual || 0),
      consultas_ano_actual: Number(row.consultas_ano_actual || 0),
      calificacion_promedio: Number(row.calificacion_promedio || 0),
      total_resenas: Number(row.numero_opiniones || 0),
      proxima_cita: row.proxima_cita || null,
      disponibilidad_semanal: 0,
    };

    // 5. Log auditoría
    await registrarLog({
      id_usuario: null, // idealmente: el admin autenticado que creó el médico
      tipo: "audit",
      modulo: "medicos",
      accion: "crear_medico",
      descripcion: `Médico creado ID ${nuevoIdMedico} (usuario base ${id_usuario})`,
      objeto_tipo: "medico",
      objeto_id: String(nuevoIdMedico),
      datos_nuevos: body,
      ip_origen:
        request.headers.get("x-forwarded-for") ||
        request.headers.get("x-real-ip") ||
        "unknown",
      agente_usuario: request.headers.get("user-agent") || "unknown",
      nivel_severidad: 5,
    });

    await connection.commit();
    connection.release();

    return NextResponse.json(
      {
        success: true,
        message: "Médico creado exitosamente",
        data: nuevoMedico,
      },
      { status: 201 }
    );
  } catch (error: any) {
    if (connection) {
      await connection.rollback();
      connection.release();
    }

    console.error("Error al crear médico:", error);

    await registrarLog({
      tipo: "error",
      modulo: "medicos",
      accion: "crear_medico",
      descripcion: "Error al crear médico",
      mensaje_error: error.message,
      exitoso: false,
      nivel_severidad: 8,
    });

    return NextResponse.json(
      {
        success: false,
        error: "Error al crear médico",
        detalles: error.sqlMessage || error.message,
      },
      { status: 500 }
    );
  }
}
