// frontend/src/app/api/admin/medicos/route.ts
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { RowDataPacket, ResultSetHeader } from "mysql2";
import { registrarLog } from "@/lib/logs";

// ============================================================================
// GET - LISTAR MÉDICOS (tipo_profesional = 'medico')
// ============================================================================
//
// Devuelve:
// {
//   success: true,
//   medicos: Medico[],                 // alias para compatibilidad
//   profesionales_salud: Medico[],     // nombre real según tabla
//   especialidades: Especialidad[],
//   centros: CentroMedico[],
//   estadisticas: Estadisticas,
//   pagination: { ... }
// }
// ============================================================================

export async function GET(request: NextRequest) {
  let connection;

  try {
    const { searchParams } = new URL(request.url);

    // paginación
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(
      100,
      Math.max(1, parseInt(searchParams.get("limit") || "100"))
    );
    const offset = (page - 1) * limit;

    connection = await pool.getConnection();

    // -----------------------------------------------------------------------
    // Filtro base: solo médicos desde profesionales_salud
    // -----------------------------------------------------------------------
    const whereClause = `WHERE m.tipo_profesional = 'medico'`;

    // -----------------------------------------------------------------------
    // 1. Traer médicos + joins + métricas (1 fila por médico)
    // -----------------------------------------------------------------------
    const medicosQuery = `
      SELECT
        m.id_profesional,
        m.id_usuario,
        m.id_centro_principal,
        m.id_centro,
        m.id_sucursal,
        m.tipo_profesional,

        -- Datos profesionales
        m.numero_registro_profesional,
        m.titulo_profesional,
        m.universidad,
        m.ano_graduacion,
        m.anos_experiencia,
        m.biografia,

        -- Modalidad de atención
        m.acepta_nuevos_pacientes,
        m.atiende_particular,
        m.atiende_fonasa,
        m.atiende_isapre,
        m.consulta_presencial,
        m.consulta_telemedicina,
        m.duracion_consulta_min,

        -- Firma y verificación
        m.firma_digital,
        m.firma_digital_url,
        m.verificado_por_admin,
        m.requiere_revision_credenciales,

        -- Estado y métricas
        m.estado,
        m.calificacion_promedio,
        m.numero_opiniones,
        m.fecha_inicio_actividad,
        m.fecha_creacion,
        m.fecha_modificacion,

        -- especialidad principal (en la propia tabla)
        m.id_especialidad_principal,
        m.especialidad_principal,

        -- info catálogo especialidad (para fallback)
        ep.codigo               AS especialidad_codigo,
        ep.nombre               AS especialidad_catalogo_nombre,

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

        -- Métricas dinámicas (pacientes y consultas)
        (
          SELECT COUNT(DISTINCT pm.id_paciente)
          FROM pacientes_medico pm
          WHERE pm.id_profesional = m.id_profesional
            AND pm.activo = 1
        ) AS total_pacientes,

        (
          SELECT COUNT(*)
          FROM citas ci
          WHERE ci.id_profesional = m.id_profesional
            AND ci.fecha_hora_inicio >= DATE_FORMAT(NOW(), '%Y-%m-01')
            AND ci.fecha_hora_inicio < DATE_ADD(DATE_FORMAT(NOW(), '%Y-%m-01'), INTERVAL 1 MONTH)
        ) AS consultas_mes_actual,

        (
          SELECT COUNT(*)
          FROM citas ci
          WHERE ci.id_profesional = m.id_profesional
            AND YEAR(ci.fecha_hora_inicio) = YEAR(NOW())
        ) AS consultas_ano_actual,

        (
          SELECT MIN(ci.fecha_hora_inicio)
          FROM citas ci
          WHERE ci.id_profesional = m.id_profesional
            AND ci.fecha_hora_inicio >= NOW()
        ) AS proxima_cita

      FROM profesionales_salud m
      INNER JOIN usuarios u
        ON m.id_usuario = u.id_usuario
      INNER JOIN centros_medicos c
        ON m.id_centro_principal = c.id_centro
      LEFT JOIN especialidades ep
        ON m.id_especialidad_principal = ep.id_especialidad
      ${whereClause}
      ORDER BY m.fecha_modificacion DESC
      LIMIT ? OFFSET ?
    `;

    const [medicosRows] = await connection.query<RowDataPacket[]>(
      medicosQuery,
      [limit, offset]
    );

    // -----------------------------------------------------------------------
    // 1.b Traer especialidades desde la tabla puente profesionales_especialidades
    //     para todos los médicos de esta página
    // -----------------------------------------------------------------------
    const profesionalesIds = medicosRows.map((r) => r.id_profesional) as number[];

    const especialidadesPorProfesional: Record<
      number,
      {
        id_especialidad: number;
        nombre: string;
        codigo: string;
        es_principal: boolean;
        anos_experiencia: number;
      }[]
    > = {};

    if (profesionalesIds.length > 0) {
      const [espRows] = await connection.query<RowDataPacket[]>(
        `
          SELECT
            pe.id_profesional,
            pe.id_especialidad,
            e.nombre,
            e.codigo,
            pe.es_principal,
            pe.anos_experiencia
          FROM profesionales_especialidades pe
          INNER JOIN especialidades e
            ON pe.id_especialidad = e.id_especialidad
          WHERE pe.id_profesional IN (?)
          ORDER BY pe.id_profesional ASC, pe.es_principal DESC, e.nombre ASC
        `,
        [profesionalesIds]
      );

      for (const er of espRows) {
        const pid = Number(er.id_profesional);
        if (!especialidadesPorProfesional[pid]) {
          especialidadesPorProfesional[pid] = [];
        }
        especialidadesPorProfesional[pid].push({
          id_especialidad: Number(er.id_especialidad),
          nombre: er.nombre || "",
          codigo: er.codigo || "",
          es_principal: er.es_principal === 1,
          anos_experiencia:
            er.anos_experiencia !== null ? Number(er.anos_experiencia) : 0,
        });
      }
    }

    // -----------------------------------------------------------------------
    // Normalizar filas al shape que tu React espera
    // -----------------------------------------------------------------------
    const profesionales_salud = medicosRows.map((row) => {
      // 1) Intentar construir especialidades desde la tabla puente
      let especialidadesMedico =
        especialidadesPorProfesional[row.id_profesional] || [];

      // 2) Si no hay en la tabla puente, usar la especialidad principal de la propia tabla
      if (especialidadesMedico.length === 0) {
        especialidadesMedico = [
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
        ].filter((e) => e.id_especialidad || e.nombre);
      }

      return {
        id_profesional: row.id_profesional,
        id_usuario: row.id_usuario,
        id_centro_principal: row.id_centro_principal,
        id_centro: row.id_centro,
        id_sucursal: row.id_sucursal,
        tipo_profesional: row.tipo_profesional,

        numero_registro_profesional: row.numero_registro_profesional,
        titulo_profesional: row.titulo_profesional,
        universidad: row.universidad,
        ano_graduacion: row.ano_graduacion,
        biografia: row.biografia,
        anos_experiencia:
          row.anos_experiencia !== null
            ? Number(row.anos_experiencia)
            : 0,

        acepta_nuevos_pacientes: row.acepta_nuevos_pacientes === 1,
        atiende_particular: row.atiende_particular === 1,
        atiende_fonasa: row.atiende_fonasa === 1,
        atiende_isapre: row.atiende_isapre === 1,
        estado: row.estado,
        consulta_presencial: row.consulta_presencial === 1,
        consulta_telemedicina: row.consulta_telemedicina === 1,
        duracion_consulta_min: row.duracion_consulta_min,

        firma_digital: row.firma_digital === 1,
        firma_digital_url: row.firma_digital_url,
        verificado_por_admin: row.verificado_por_admin === 1,
        requiere_revision_credenciales:
          row.requiere_revision_credenciales === 1,

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
        disponibilidad_semanal: 0, // placeholder hasta que actives disponibilidad real
      };
    });

    // -----------------------------------------------------------------------
    // 2. Listado de especialidades (para filtros)
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
    // 3. Listado de centros médicos (para filtros)
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
    // 4. Estadísticas globales para las tarjetas de arriba
    // -----------------------------------------------------------------------
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
        FROM profesionales_salud m
        WHERE m.tipo_profesional = 'medico'
      `
    );

    const statsBase = statsBaseRows[0] || {};

    // Total de consultas en últimos 30 días SOLO de médicos
    const [consultasMesRows] = await connection.query<RowDataPacket[]>(
      `
        SELECT 
          COUNT(*) AS total_consultas_mes
        FROM citas ci
        INNER JOIN profesionales_salud m
          ON ci.id_profesional = m.id_profesional
        WHERE ci.fecha_hora_inicio >= DATE_SUB(NOW(), INTERVAL 30 DAY)
          AND m.tipo_profesional = 'medico'
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
    // 5. Total para paginación
    // -----------------------------------------------------------------------
    const [countRows] = await connection.query<RowDataPacket[]>(
      `
        SELECT COUNT(*) AS total
        FROM profesionales_salud m
        WHERE m.tipo_profesional = 'medico'
      `
    );

    const total = countRows[0]?.total || 0;
    const totalPages = Math.ceil(total / limit);

    connection.release();

    return NextResponse.json({
      success: true,
      // alias para que tu UI no se rompa si aún usa "medicos"
      medicos: profesionales_salud,
      // nombre real alineado a la tabla
      profesionales_salud,
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
// POST - CREAR MÉDICO (profesionales_salud + profesionales_especialidades)
// ============================================================================
//
// Campos mínimos esperados en body:
// - id_usuario
// - id_centro_principal
// - numero_registro_profesional
// - titulo_profesional
// - universidad
// - ano_graduacion
//
// Opcionales / recomendados:
// - id_especialidad_principal
// - especialidad_principal
// - anos_experiencia
// - biografia
// - acepta_nuevos_pacientes, atiende_particular, atiende_fonasa, atiende_isapre
// - consulta_presencial, consulta_telemedicina
// - firma_digital_url
// - fecha_inicio_actividad
// - id_centro, id_sucursal
//
// Plus opcional:
// - especialidades: [{ id_especialidad, es_principal?, anos_experiencia? }, ...]
//   -> si viene este array, se inserta en profesionales_especialidades
//   -> si NO viene, se crea un registro SOLO con id_especialidad_principal (si existe)
// ============================================================================

export async function POST(request: NextRequest) {
  let connection;

  try {
    const body = await request.json();

    const {
      id_usuario, // FK obligatorio a usuarios.id_usuario
      id_centro_principal,
      id_especialidad_principal = null,
      numero_registro_profesional,
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

      // opcional: array de especialidades para la tabla puente
      especialidades,
    } = body;

    // Validaciones básicas
    if (
      !id_usuario ||
      !id_centro_principal ||
      !numero_registro_profesional ||
      !titulo_profesional ||
      !universidad ||
      !ano_graduacion
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Faltan campos obligatorios: id_usuario, id_centro_principal, numero_registro_profesional, titulo_profesional, universidad, ano_graduacion",
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
        SELECT id_profesional
        FROM profesionales_salud
        WHERE id_usuario = ?
          AND tipo_profesional = 'medico'
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

    // 3. Insertar en profesionales_salud como médico
    const [insertResult] = await connection.query<ResultSetHeader>(
      `
        INSERT INTO profesionales_salud (
          id_usuario,
          id_centro,
          id_sucursal,
          id_centro_principal,
          id_especialidad_principal,
          numero_registro_profesional,
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
        numero_registro_profesional,
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

    // 3.b Insertar especialidades en la tabla puente (si corresponde)
    const especialidadesArray = Array.isArray(especialidades)
      ? especialidades
      : [];

    if (especialidadesArray.length > 0) {
      const values: any[] = [];
      const placeholders: string[] = [];

      for (const esp of especialidadesArray) {
        if (!esp || !esp.id_especialidad) continue;

        placeholders.push("(?,?,?,?,NOW())");
        values.push(
          nuevoIdMedico,
          esp.id_especialidad,
          esp.es_principal ? 1 : 0,
          esp.anos_experiencia ?? null
        );
      }

      if (placeholders.length > 0) {
        await connection.query<ResultSetHeader>(
          `
            INSERT INTO profesionales_especialidades (
              id_profesional,
              id_especialidad,
              es_principal,
              anos_experiencia,
              fecha_creacion
            )
            VALUES ${placeholders.join(",")}
          `,
          values
        );
      }
    } else if (id_especialidad_principal) {
      // Si no viene array pero sí hay una especialidad principal, la guardamos igual en la tabla puente
      await connection.query<ResultSetHeader>(
        `
          INSERT INTO profesionales_especialidades (
            id_profesional,
            id_especialidad,
            es_principal,
            anos_experiencia
          ) VALUES (?, ?, 1, ?)
        `,
        [nuevoIdMedico, id_especialidad_principal, anos_experiencia || 0]
      );
    }

    // 4. Traer el médico recién creado con el mismo SELECT base (1 fila)
    const [nuevoMedicoRows] = await connection.query<RowDataPacket[]>(
      `
        SELECT
          m.id_profesional,
          m.id_usuario,
          m.id_centro_principal,
          m.id_centro,
          m.id_sucursal,
          m.tipo_profesional,

          m.numero_registro_profesional,
          m.titulo_profesional,
          m.universidad,
          m.ano_graduacion,
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
          m.fecha_inicio_actividad,
          m.fecha_creacion,
          m.fecha_modificacion,

          m.id_especialidad_principal,
          m.especialidad_principal,

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
            WHERE pm.id_profesional = m.id_profesional
              AND pm.activo = 1
          ) AS total_pacientes,

          (
            SELECT COUNT(*)
            FROM citas ci
            WHERE ci.id_profesional = m.id_profesional
              AND ci.fecha_hora_inicio >= DATE_FORMAT(NOW(), '%Y-%m-01')
              AND ci.fecha_hora_inicio < DATE_ADD(DATE_FORMAT(NOW(), '%Y-%m-01'), INTERVAL 1 MONTH)
          ) AS consultas_mes_actual,

          (
            SELECT COUNT(*)
            FROM citas ci
            WHERE ci.id_profesional = m.id_profesional
              AND YEAR(ci.fecha_hora_inicio) = YEAR(NOW())
          ) AS consultas_ano_actual,

          (
            SELECT MIN(ci.fecha_hora_inicio)
            FROM citas ci
            WHERE ci.id_profesional = m.id_profesional
              AND ci.fecha_hora_inicio >= NOW()
          ) AS proxima_cita

        FROM profesionales_salud m
        INNER JOIN usuarios u
          ON m.id_usuario = u.id_usuario
        INNER JOIN centros_medicos c
          ON m.id_centro_principal = c.id_centro
        LEFT JOIN especialidades ep
          ON m.id_especialidad_principal = ep.id_especialidad
        WHERE m.id_profesional = ?
        LIMIT 1
      `,
      [nuevoIdMedico]
    );

    const row = nuevoMedicoRows[0];

    // Especialidades del médico recién creado desde la tabla puente
    const [espRows] = await connection.query<RowDataPacket[]>(
      `
        SELECT
          pe.id_especialidad,
          e.nombre,
          e.codigo,
          pe.es_principal,
          pe.anos_experiencia
        FROM profesionales_especialidades pe
        INNER JOIN especialidades e
          ON pe.id_especialidad = e.id_especialidad
        WHERE pe.id_profesional = ?
        ORDER BY pe.es_principal DESC, e.nombre ASC
      `,
      [nuevoIdMedico]
    );

    let especialidadesMedico: any[] = [];

    if (espRows.length > 0) {
      especialidadesMedico = espRows.map((er) => ({
        id_especialidad: er.id_especialidad,
        nombre: er.nombre || "",
        codigo: er.codigo || "",
        es_principal: er.es_principal === 1,
        anos_experiencia:
          er.anos_experiencia !== null
            ? Number(er.anos_experiencia)
            : 0,
      }));
    } else {
      // fallback a la especialidad principal de la propia tabla
      especialidadesMedico = [
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
      ].filter((e: any) => e.id_especialidad || e.nombre);
    }

    const nuevoMedico = {
      id_profesional: row.id_profesional,
      id_usuario: row.id_usuario,
      id_centro_principal: row.id_centro_principal,
      id_centro: row.id_centro,
      id_sucursal: row.id_sucursal,
      tipo_profesional: row.tipo_profesional,

      numero_registro_profesional: row.numero_registro_profesional,
      titulo_profesional: row.titulo_profesional,
      universidad: row.universidad,
      ano_graduacion: row.ano_graduacion,
      biografia: row.biografia,
      anos_experiencia:
        row.anos_experiencia !== null
          ? Number(row.anos_experiencia)
          : 0,

      acepta_nuevos_pacientes: row.acepta_nuevos_pacientes === 1,
      atiende_particular: row.atiende_particular === 1,
      atiende_fonasa: row.atiende_fonasa === 1,
      atiende_isapre: row.atiende_isapre === 1,
      estado: row.estado,
      consulta_presencial: row.consulta_presencial === 1,
      consulta_telemedicina: row.consulta_telemedicina === 1,
      duracion_consulta_min: row.duracion_consulta_min,

      firma_digital: row.firma_digital === 1,
      firma_digital_url: row.firma_digital_url,
      verificado_por_admin: row.verificado_por_admin === 1,
      requiere_revision_credenciales:
        row.requiere_revision_credenciales === 1,

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
      disponibilidad_semanal: 0,
    };

    // 5. Log auditoría
    await registrarLog({
      id_usuario: null, // idealmente: el admin autenticado que creó el médico
      tipo: "audit",
      modulo: "profesionales_salud",
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
      modulo: "profesionales_salud",
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
