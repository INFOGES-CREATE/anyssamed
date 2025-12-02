// frontend/src/app/api/admin/medicos/[id]/route.ts
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { RowDataPacket } from "mysql2";
import { registrarLog } from "@/lib/logs";

// ============================================================================
// GET - OBTENER MÉDICO POR ID
// ============================================================================
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  let connection;

  try {
    const medicoId = parseInt(params.id, 10);

    if (isNaN(medicoId) || medicoId <= 0) {
      return NextResponse.json(
        {
          success: false,
          data: null,
          error: "ID de médico inválido",
        },
        { status: 400 }
      );
    }

    connection = await pool.getConnection();

    // 1. Datos del médico + usuario + centro + métricas
    const medicoQuery = `
      SELECT
        m.id_profesional,
        m.id_usuario,
        m.id_centro,
        m.id_sucursal,
        m.id_centro_principal,
        m.numero_registro_profesional,
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
        m.firma_digital,
        m.requiere_revision_credenciales,
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
        c.direccion             AS centro_direccion,

        -- info catálogo especialidad
        ep.codigo               AS especialidad_codigo,
        ep.nombre               AS especialidad_catalogo_nombre,

        -- Métricas dinámicas
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
          SELECT COUNT(*)
          FROM citas ci
          WHERE ci.id_profesional = m.id_profesional
        ) AS total_consultas,

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
    `;

    const [medicoRows] = await connection.query<RowDataPacket[]>(
      medicoQuery,
      [medicoId]
    );

    if (medicoRows.length === 0) {
      connection.release();
      return NextResponse.json(
        {
          success: false,
          data: null,
          error: "Médico no encontrado",
        },
        { status: 404 }
      );
    }

    const row = medicoRows[0];

    // 2. Especialidades del médico (tabla medicos_especialidades)
    const [especialidadesMedicoRows] = await connection.query<RowDataPacket[]>(
      `
        SELECT
          me.id_especialidad,
          e.nombre,
          e.codigo,
          e.descripcion,
          me.anos_experiencia,
          me.es_principal,
          me.fecha_creacion AS fecha_registro
        FROM profesionales_especialidades me
        INNER JOIN especialidades e
          ON me.id_especialidad = e.id_especialidad
        WHERE me.id_profesional = ?
        ORDER BY me.es_principal DESC, e.nombre ASC
      `,
      [medicoId]
    );

    const especialidades =
      especialidadesMedicoRows.length > 0
        ? especialidadesMedicoRows.map((e) => ({
            id_especialidad: e.id_especialidad,
            nombre: e.nombre,
            codigo: e.codigo,
            descripcion: e.descripcion,
            es_principal: e.es_principal === 1,
            anos_experiencia: Number(e.anos_experiencia || 0),
            fecha_registro: e.fecha_registro,
          }))
        : [
            {
              id_especialidad: row.id_especialidad_principal,
              nombre:
                row.especialidad_principal ||
                row.especialidad_catalogo_nombre ||
                "",
              codigo: row.especialidad_codigo || "",
              descripcion: null,
              es_principal: true,
              anos_experiencia: Number(row.anos_experiencia || 0),
              fecha_registro: row.fecha_creacion,
            },
          ].filter((e) => e.id_especialidad || e.nombre);

    // 3. Disponibilidad semanal del médico
    const [disponibilidadRows] = await connection.query<RowDataPacket[]>(
      `
        SELECT
          id_disponibilidad,
          dia_semana,
          hora_inicio,
          hora_fin,
          estado
        FROM disponibilidad_medicos
        WHERE id_profesional = ?
        ORDER BY dia_semana ASC, hora_inicio ASC
      `,
      [medicoId]
    );

    const disponibilidad = disponibilidadRows.map((d) => ({
      id_disponibilidad: d.id_disponibilidad,
      dia_semana: d.dia_semana,
      hora_inicio: d.hora_inicio,
      hora_fin: d.hora_fin,
      estado: d.estado,
      activo: d.estado === "activo",
    }));

    // 4. Últimas reseñas/valoraciones
    const [reseniasRows] = await connection.query<RowDataPacket[]>(
      `
        SELECT
          vm.id_valoracion,
          vm.id_paciente,
          vm.id_profesional,
          vm.calificacion,
          vm.comentario,
          vm.fecha_creacion,
          p.nombre AS paciente_nombre,
          p.apellido_paterno AS paciente_apellido,
          p.foto_url AS paciente_foto
        FROM valoraciones_medicas vm
        INNER JOIN pacientes p
          ON vm.id_paciente = p.id_paciente
        WHERE vm.id_profesional = ?
        ORDER BY vm.fecha_creacion DESC
        LIMIT 10
      `,
      [medicoId]
    );

    const resenas = reseniasRows.map((r) => ({
      id_valoracion: r.id_valoracion,
      id_paciente: r.id_paciente,
      calificacion: Number(r.calificacion),
      comentario: r.comentario,
      fecha_creacion: r.fecha_creacion,
      paciente_nombre: `${r.paciente_nombre} ${r.paciente_apellido}`,
      paciente_foto: r.paciente_foto || null,
    }));

    // 5. Construir objeto médico completo
    const medico = {
      id_profesional: row.id_profesional,
      id_usuario: row.id_usuario,
      id_centro: row.id_centro,
      id_sucursal: row.id_sucursal,
      id_centro_principal: row.id_centro_principal,
      numero_registro_profesional: row.numero_registro_profesional,
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
      firma_digital: row.firma_digital === 1,
      requiere_revision_credenciales:
        row.requiere_revision_credenciales === 1,
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
        direccion: row.centro_direccion,
      },

      especialidades,
      disponibilidad,
      resenas,

      total_pacientes: Number(row.total_pacientes || 0),
      consultas_mes_actual: Number(row.consultas_mes_actual || 0),
      consultas_ano_actual: Number(row.consultas_ano_actual || 0),
      total_consultas: Number(row.total_consultas || 0),
      calificacion_promedio: Number(row.calificacion_promedio || 0),
      total_resenas: Number(row.numero_opiniones || 0),
      proxima_cita: row.proxima_cita || null,
    };

    connection.release();

    return NextResponse.json({
      success: true,
      data: medico,
      message: "Médico obtenido exitosamente",
    });
  } catch (error: any) {
    if (connection) connection.release();
    console.error("Error al obtener médico:", error);

    await registrarLog({
      tipo: "error",
      modulo: "profesionales_salud",
      accion: "obtener_medico",
      descripcion: `Error al obtener médico ID ${params.id}`,
      mensaje_error: error.message,
      exitoso: false,
      nivel_severidad: 6,
    });

    return NextResponse.json(
      {
        success: false,
        data: null,
        error: "Error al obtener médico",
        detalles: error.sqlMessage || error.message,
      },
      { status: 500 }
    );
  }
}

// ============================================================================
// PUT - ACTUALIZAR MÉDICO
// ============================================================================
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  let connection;

  try {
    const medicoId = parseInt(params.id, 10);

    if (isNaN(medicoId) || medicoId <= 0) {
      return NextResponse.json(
        {
          success: false,
          data: null,
          error: "ID de médico inválido",
        },
        { status: 400 }
      );
    }

    const body = await request.json();

    const {
      numero_registro_profesional,
      titulo_profesional,
      universidad,
      ano_graduacion,
      biografia,
      especialidad_principal,
      id_especialidad_principal,
      anos_experiencia,
      acepta_nuevos_pacientes,
      atiende_particular,
      atiende_fonasa,
      atiende_isapre,
      consulta_presencial,
      consulta_telemedicina,
      duracion_consulta_min,
      estado,
      firma_digital_url,
    } = body;

    connection = await pool.getConnection();
    await connection.beginTransaction();

    const [existeRows] = await connection.query<RowDataPacket[]>(
      `
        SELECT id_profesional
        FROM profesionales_salud
        WHERE id_profesional = ?
        LIMIT 1
      `,
      [medicoId]
    );

    if (existeRows.length === 0) {
      await connection.rollback();
      connection.release();
      return NextResponse.json(
        {
          success: false,
          data: null,
          error: "Médico no encontrado",
        },
        { status: 404 }
      );
    }

    const updateFields: string[] = [];
    const updateValues: any[] = [];

    if (numero_registro_profesional !== undefined) {
      updateFields.push("numero_registro_profesional = ?");
      updateValues.push(numero_registro_profesional);
    }
    if (titulo_profesional !== undefined) {
      updateFields.push("titulo_profesional = ?");
      updateValues.push(titulo_profesional);
    }
    if (universidad !== undefined) {
      updateFields.push("universidad = ?");
      updateValues.push(universidad);
    }
    if (ano_graduacion !== undefined) {
      updateFields.push("ano_graduacion = ?");
      updateValues.push(ano_graduacion);
    }
    if (biografia !== undefined) {
      updateFields.push("biografia = ?");
      updateValues.push(biografia);
    }
    if (especialidad_principal !== undefined) {
      updateFields.push("especialidad_principal = ?");
      updateValues.push(especialidad_principal);
    }
    if (id_especialidad_principal !== undefined) {
      updateFields.push("id_especialidad_principal = ?");
      updateValues.push(id_especialidad_principal);
    }
if (anos_experiencia !== undefined) {
  let experiencia = anos_experiencia;

  // Si viene null, vacío, undefined, NaN -> poner 0
  if (
    experiencia === "" ||
    experiencia === null ||
    experiencia === undefined ||
    Number.isNaN(Number(experiencia))
  ) {
    experiencia = 0;
  }

  updateFields.push("anos_experiencia = ?");
  updateValues.push(Number(experiencia));
}


    if (acepta_nuevos_pacientes !== undefined) {
      updateFields.push("acepta_nuevos_pacientes = ?");
      updateValues.push(acepta_nuevos_pacientes ? 1 : 0);
    }
    if (atiende_particular !== undefined) {
      updateFields.push("atiende_particular = ?");
      updateValues.push(atiende_particular ? 1 : 0);
    }
    if (atiende_fonasa !== undefined) {
      updateFields.push("atiende_fonasa = ?");
      updateValues.push(atiende_fonasa ? 1 : 0);
    }
    if (atiende_isapre !== undefined) {
      updateFields.push("atiende_isapre = ?");
      updateValues.push(atiende_isapre ? 1 : 0);
    }
    if (consulta_presencial !== undefined) {
      updateFields.push("consulta_presencial = ?");
      updateValues.push(consulta_presencial ? 1 : 0);
    }
    if (consulta_telemedicina !== undefined) {
      updateFields.push("consulta_telemedicina = ?");
      updateValues.push(consulta_telemedicina ? 1 : 0);
    }
    if (duracion_consulta_min !== undefined) {
      updateFields.push("duracion_consulta_min = ?");
      updateValues.push(duracion_consulta_min);
    }
    if (estado !== undefined) {
      const estadosValidos = ["activo", "inactivo", "vacaciones", "suspendido"];
      if (!estadosValidos.includes(estado)) {
        await connection.rollback();
        connection.release();
        return NextResponse.json(
          {
            success: false,
            data: null,
            error: `Estado inválido. Debe ser uno de: ${estadosValidos.join(
              ", "
            )}`,
          },
          { status: 400 }
        );
      }
      updateFields.push("estado = ?");
      updateValues.push(estado);
    }
    if (firma_digital_url !== undefined) {
      updateFields.push("firma_digital_url = ?");
      updateValues.push(firma_digital_url);
    }

    updateFields.push("fecha_modificacion = NOW()");

    if (updateFields.length === 1) {
      await connection.rollback();
      connection.release();
      return NextResponse.json(
        {
          success: false,
          data: null,
          error: "No hay campos para actualizar",
        },
        { status: 400 }
      );
    }

    updateValues.push(medicoId);

    const updateQuery = `
      UPDATE profesionales_salud
      SET ${updateFields.join(", ")}
      WHERE id_profesional = ?
    `;

    await connection.query(updateQuery, updateValues);

    const [medicoActualizado] = await connection.query<RowDataPacket[]>(
      `
        SELECT
          m.id_profesional,
          m.id_usuario,
          m.id_centro,
          m.id_sucursal,
          m.id_centro_principal,
          m.numero_registro_profesional,
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
          m.firma_digital,
          m.requiere_revision_credenciales,
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
          c.direccion             AS centro_direccion,

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
            SELECT COUNT(*)
            FROM citas ci
            WHERE ci.id_profesional = m.id_profesional
          ) AS total_consultas,

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
      [medicoId]
    );

    const r = medicoActualizado[0];

    const medico = {
      id_profesional: r.id_profesional,
      id_usuario: r.id_usuario,
      id_centro: r.id_centro,
      id_sucursal: r.id_sucursal,
      id_centro_principal: r.id_centro_principal,
      numero_registro_profesional: r.numero_registro_profesional,
      titulo_profesional: r.titulo_profesional,
      universidad: r.universidad,
      ano_graduacion: r.ano_graduacion,
      biografia: r.biografia,
      acepta_nuevos_pacientes: r.acepta_nuevos_pacientes === 1,
      atiende_particular: r.atiende_particular === 1,
      atiende_fonasa: r.atiende_fonasa === 1,
      atiende_isapre: r.atiende_isapre === 1,
      estado: r.estado,
      consulta_presencial: r.consulta_presencial === 1,
      consulta_telemedicina: r.consulta_telemedicina === 1,
      firma_digital: r.firma_digital === 1,
      requiere_revision_credenciales:
        r.requiere_revision_credenciales === 1,
      firma_digital_url: r.firma_digital_url,
      duracion_consulta_min: r.duracion_consulta_min,
      fecha_inicio_actividad: r.fecha_inicio_actividad,
      fecha_creacion: r.fecha_creacion,
      fecha_modificacion: r.fecha_modificacion,

      usuario: {
        nombre: r.usuario_nombre,
        apellido_paterno: r.usuario_apellido_paterno,
        apellido_materno: r.usuario_apellido_materno,
        email: r.usuario_email,
        telefono: r.usuario_telefono,
        celular: r.usuario_celular,
        foto_perfil_url: r.usuario_foto_perfil_url,
        rut: r.usuario_rut,
        fecha_nacimiento: r.usuario_fecha_nacimiento,
        genero: r.usuario_genero,
      },

      centro_principal: {
        nombre: r.centro_nombre,
        ciudad: r.centro_ciudad,
        region: r.centro_region,
        direccion: r.centro_direccion,
      },

      especialidades: [
        {
          id_especialidad: r.id_especialidad_principal,
          nombre:
            r.especialidad_principal ||
            r.especialidad_catalogo_nombre ||
            "",
          codigo: r.especialidad_codigo || "",
          es_principal: true,
          anos_experiencia: Number(r.anos_experiencia || 0),
        },
      ].filter((e) => e.id_especialidad || e.nombre),

      total_pacientes: Number(r.total_pacientes || 0),
      consultas_mes_actual: Number(r.consultas_mes_actual || 0),
      consultas_ano_actual: Number(r.consultas_ano_actual || 0),
      total_consultas: Number(r.total_consultas || 0),
      calificacion_promedio: Number(r.calificacion_promedio || 0),
      total_resenas: Number(r.numero_opiniones || 0),
      proxima_cita: r.proxima_cita || null,
    };

    await registrarLog({
      id_usuario: null,
      tipo: "audit",
      modulo: "profesionales_salud",
      accion: "actualizar_medico",
      descripcion: `Médico actualizado ID ${medicoId}`,
      objeto_tipo: "medico",
      objeto_id: String(medicoId),
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

    return NextResponse.json({
      success: true,
      data: medico,
      message: "Médico actualizado exitosamente",
    });
  } catch (error: any) {
    if (connection) {
      await connection.rollback();
      connection.release();
    }

    console.error("Error al actualizar médico:", error);

    await registrarLog({
      tipo: "error",
      modulo: "profesionales_salud",
      accion: "actualizar_medico",
      descripcion: `Error al actualizar médico ID ${params.id}`,
      mensaje_error: error.message,
      exitoso: false,
      nivel_severidad: 8,
    });

    return NextResponse.json(
      {
        success: false,
        data: null,
        error: "Error al actualizar médico",
        detalles: error.sqlMessage || error.message,
      },
      { status: 500 }
    );
  }
}

// ============================================================================
// DELETE - ELIMINAR MÉDICO
// ============================================================================
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  let connection;

  try {
    const medicoId = parseInt(params.id, 10);

    if (isNaN(medicoId) || medicoId <= 0) {
      return NextResponse.json(
        {
          success: false,
          data: null,
          error: "ID de médico inválido",
        },
        { status: 400 }
      );
    }

    connection = await pool.getConnection();
    await connection.beginTransaction();

    const [existeRows] = await connection.query<RowDataPacket[]>(
      `
        SELECT id_profesional, numero_registro_profesional
        FROM profesionales_salud
        WHERE id_profesional = ?
        LIMIT 1
      `,
      [medicoId]
    );

    if (existeRows.length === 0) {
      await connection.rollback();
      connection.release();
      return NextResponse.json(
        {
          success: false,
          data: null,
          error: "Médico no encontrado",
        },
        { status: 404 }
      );
    }

    const medicoData = existeRows[0];

    const [citasRows] = await connection.query<RowDataPacket[]>(
      `
        SELECT COUNT(*) AS total_citas
        FROM citas
        WHERE id_profesional = ?
          AND fecha_hora_inicio >= NOW()
          AND estado NOT IN ('cancelada', 'completada')
      `,
      [medicoId]
    );

    if (citasRows[0].total_citas > 0) {
      await connection.rollback();
      connection.release();
      return NextResponse.json(
        {
          success: false,
          data: null,
          error: `No se puede eliminar. El médico tiene ${citasRows[0].total_citas} cita(s) activa(s) o pendiente(s)`,
        },
        { status: 409 }
      );
    }

    const [pacientesRows] = await connection.query<RowDataPacket[]>(
      `
        SELECT COUNT(*) AS total_pacientes
        FROM pacientes_medico
        WHERE id_profesional = ?
          AND activo = 1
      `,
      [medicoId]
    );

    if (pacientesRows[0].total_pacientes > 0) {
      await connection.rollback();
      connection.release();
      return NextResponse.json(
        {
          success: false,
          data: null,
          error: `No se puede eliminar. El médico tiene ${pacientesRows[0].total_pacientes} paciente(s) asignado(s)`,
        },
        { status: 409 }
      );
    }

    await connection.query(
      `
        DELETE FROM disponibilidad_medicos
        WHERE id_profesional = ?
      `,
      [medicoId]
    );

    await connection.query(
      `
        DELETE FROM profesionales_especialidades
        WHERE id_profesional = ?
      `,
      [medicoId]
    );

    await connection.query(
      `
        DELETE FROM profesionales_salud
        WHERE id_profesional = ?
      `,
      [medicoId]
    );

    await registrarLog({
      id_usuario: null,
      tipo: "audit",
      modulo: "profesionales_salud",
      accion: "eliminar_medico",
      descripcion: `Médico eliminado ID ${medicoId} (Registro: ${medicoData.numero_registro_profesional})`,
      objeto_tipo: "medico",
      objeto_id: String(medicoId),
      datos_nuevos: medicoData,
      ip_origen:
        request.headers.get("x-forwarded-for") ||
        request.headers.get("x-real-ip") ||
        "unknown",
      agente_usuario: request.headers.get("user-agent") || "unknown",
      nivel_severidad: 7,
    });

    await connection.commit();
    connection.release();

    return NextResponse.json({
      success: true,
      data: null,
      message: `Médico ${medicoData.numero_registro_profesional} eliminado exitosamente`,
    });
  } catch (error: any) {
    if (connection) {
      await connection.rollback();
      connection.release();
    }

    console.error("Error al eliminar médico:", error);

    await registrarLog({
      tipo: "error",
      modulo: "profesionales_salud",
      accion: "eliminar_medico",
      descripcion: `Error al eliminar médico ID ${params.id}`,
      mensaje_error: error.message,
      exitoso: false,
      nivel_severidad: 8,
    });

    return NextResponse.json(
      {
        success: false,
        data: null,
        error: "Error al eliminar médico",
        detalles: error.sqlMessage || error.message,
      },
      { status: 500 }
    );
  }
}

// ============================================================================
// PATCH - CAMBIAR ESTADO DEL MÉDICO
// ============================================================================
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  let connection;

  try {
    const medicoId = parseInt(params.id, 10);

    if (isNaN(medicoId) || medicoId <= 0) {
      return NextResponse.json(
        {
          success: false,
          data: null,
          error: "ID de médico inválido",
        },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { estado, razon } = body;

    if (!estado) {
      return NextResponse.json(
        {
          success: false,
          data: null,
          error: "El campo 'estado' es obligatorio",
        },
        { status: 400 }
      );
    }

    const estadosValidos = ["activo", "inactivo", "vacaciones", "suspendido"];
    if (!estadosValidos.includes(estado)) {
      return NextResponse.json(
        {
          success: false,
          data: null,
          error: `Estado inválido. Debe ser uno de: ${estadosValidos.join(
            ", "
          )}`,
        },
        { status: 400 }
      );
    }

    connection = await pool.getConnection();
    await connection.beginTransaction();

    const [existeRows] = await connection.query<RowDataPacket[]>(
      `
        SELECT id_profesional, estado AS estado_anterior
        FROM profesionales_salud
        WHERE id_profesional = ?
        LIMIT 1
      `,
      [medicoId]
    );

    if (existeRows.length === 0) {
      await connection.rollback();
      connection.release();
      return NextResponse.json(
        {
          success: false,
          data: null,
          error: "Médico no encontrado",
        },
        { status: 404 }
      );
    }

    const estadoAnterior = existeRows[0].estado_anterior;

    await connection.query(
      `
        UPDATE profesionales_salud
        SET estado = ?, fecha_modificacion = NOW()
        WHERE id_profesional = ?
      `,
      [estado, medicoId]
    );

    if (estado === "suspendido") {
      await connection.query(
        `
          UPDATE citas
          SET estado = 'cancelada', motivo_cancelacion = ?
          WHERE id_profesional = ?
            AND fecha_hora_inicio >= NOW()
            AND estado NOT IN ('cancelada', 'completada')
        `,
        [razon || "Médico suspendido", medicoId]
      );
    }

    const [medicoActualizado] = await connection.query<RowDataPacket[]>(
      `
        SELECT
          m.id_profesional,
          m.id_usuario,
          m.id_centro_principal,
          m.numero_registro_profesional,
          m.titulo_profesional,
          m.especialidad_principal,
          m.estado,
          m.fecha_modificacion,
          u.nombre AS usuario_nombre,
          u.email AS usuario_email
        FROM profesionales_salud m
        INNER JOIN usuarios u
          ON m.id_usuario = u.id_usuario
        WHERE m.id_profesional = ?
        LIMIT 1
      `,
      [medicoId]
    );

    const row = medicoActualizado[0];

    await registrarLog({
      id_usuario: null,
      tipo: "audit",
      modulo: "profesionales_salud",
      accion: "cambiar_estado_medico",
      descripcion: `Estado del médico ${medicoId} cambió de ${estadoAnterior} a ${estado}`,
      objeto_tipo: "medico",
      objeto_id: String(medicoId),
      datos_nuevos: { estado, razon },
      ip_origen:
        request.headers.get("x-forwarded-for") ||
        request.headers.get("x-real-ip") ||
        "unknown",
      agente_usuario: request.headers.get("user-agent") || "unknown",
      nivel_severidad: 5,
    });

    await connection.commit();
    connection.release();

    return NextResponse.json({
      success: true,
      data: {
        id_profesional: row.id_profesional,
        numero_registro_profesional: row.numero_registro_profesional,
        estado_anterior: estadoAnterior,
        estado_nuevo: estado,
        fecha_cambio: row.fecha_modificacion,
      },
      message: `Estado del médico cambió a ${estado}`,
    });
  } catch (error: any) {
    if (connection) {
      await connection.rollback();
      connection.release();
    }

    console.error("Error al cambiar estado del médico:", error);

    await registrarLog({
      tipo: "error",
      modulo: "profesionales_salud",
      accion: "cambiar_estado_medico",
      descripcion: `Error al cambiar estado del médico ID ${params.id}`,
      mensaje_error: error.message,
      exitoso: false,
      nivel_severidad: 8,
    });

    return NextResponse.json(
      {
        success: false,
        data: null,
        error: "Error al cambiar estado del médico",
        detalles: error.sqlMessage || error.message,
      },
      { status: 500 }
    );
  }
}
