import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { RowDataPacket } from "mysql2";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const idCentro = params.id;
  console.log(`🌐 [PUBLIC MICROSITIO FULL] Centro ID = ${idCentro}`);

  try {
    // =========================================================
    // 1) DATOS PRINCIPALES DEL CENTRO
    // =========================================================
    const [centroRows] = await pool.query<RowDataPacket[]>(
      `
      SELECT 
        id_centro,
        nombre,
        razon_social,
        rut,
        descripcion,
        direccion,
        ciudad,
        region,
        codigo_postal,
        telefono_principal AS telefono,
        email_contacto AS email,
        sitio_web,
        logo_url,
        horario_apertura,
        horario_cierre,
        dias_atencion,
        capacidad_pacientes_dia,
        nivel_complejidad,
        especializacion_principal,
        estado,
        fecha_inicio_operacion
      FROM centros_medicos
      WHERE id_centro = ? AND estado = 'activo'
      LIMIT 1
    `,
      [idCentro]
    );

    if (!centroRows || centroRows.length === 0) {
      console.warn(`⚠️ Centro ${idCentro} no encontrado o inactivo`);
      return NextResponse.json(
        { success: false, error: "Centro no encontrado" },
        { status: 404 }
      );
    }

    const centroDB = centroRows[0];

    // armamos objeto centro con defaults "premium"
    // (cosas que quizá aún no tienes en la tabla)
    const centro = {
      id_centro: centroDB.id_centro,
      nombre: centroDB.nombre,
      razon_social: centroDB.razon_social,
      rut: centroDB.rut,
      descripcion: centroDB.descripcion,
      direccion: centroDB.direccion,
      ciudad: centroDB.ciudad,
      region: centroDB.region,
      codigo_postal: centroDB.codigo_postal,
      telefono: centroDB.telefono,
      email: centroDB.email,
      sitio_web: centroDB.sitio_web,
      logo_url: centroDB.logo_url,
      // esto lo puedes guardar luego en la BD (ej: campo banner_url en configuraciones_centro)
      banner_url: null,

      horario_apertura: centroDB.horario_apertura,
      horario_cierre: centroDB.horario_cierre,
      dias_atencion: centroDB.dias_atencion,
      capacidad_pacientes_dia: centroDB.capacidad_pacientes_dia,
      nivel_complejidad: centroDB.nivel_complejidad,
      especializacion_principal: centroDB.especializacion_principal,
      estado: centroDB.estado,
      fecha_inicio_operacion: centroDB.fecha_inicio_operacion,

      // flags "premium" que más adelante vas a sacar de otras tablas/config
      acreditado_minsal: false,
      telemedicina_disponible: false,
      atencion_24h: false,
    };

    // =========================================================
    // 2) SUCURSALES ACTIVAS
    // =========================================================
    let sucursales: RowDataPacket[] = [];
    try {
      const [sucRows] = await pool.query<RowDataPacket[]>(
        `
        SELECT 
          id_sucursal,
          nombre,
          direccion,
          ciudad,
          region,
          telefono,
          email_contacto,
          dias_atencion,
          horario_apertura,
          horario_cierre,
          estado
        FROM sucursales
        WHERE id_centro = ? AND estado = 'activo'
        ORDER BY nombre ASC
      `,
        [idCentro]
      );

      sucursales = sucRows || [];

      // si alguna sucursal es 24/7, marcamos el centro como 24h
      const tiene24hSucursal = sucursales.some(
        (s) =>
          s.horario_apertura === "00:00:00" &&
          (s.horario_cierre === "23:59:59" || s.horario_cierre === "00:00:00")
      );
      if (tiene24hSucursal) {
        centro.atencion_24h = true;
      }
    } catch (err) {
      console.warn("⚠️ Error al cargar sucursales:", err);
      sucursales = [];
    }

    // =========================================================
    // 3) SERVICIOS / ESPECIALIDADES QUE OFRECE EL CENTRO
    //    (si la tabla aún no existe, no rompemos)
    // =========================================================
    let servicios: RowDataPacket[] = [];
    try {
      const [srvRows] = await pool.query<RowDataPacket[]>(
        `
        SELECT 
          nombre_servicio,
          descripcion_servicio
        FROM servicios_centros
        WHERE id_centro = ? AND activo = 1
        ORDER BY prioridad ASC
      `,
        [idCentro]
      );

      servicios = srvRows || [];
    } catch (err) {
      console.warn("⚠️ Tabla 'servicios_centros' no encontrada — se omite.");
      servicios = [];
    }

    // =========================================================
    // 4) MÉDICOS DESTACADOS DEL CENTRO
    //    sacamos info de:
    //    medicos, usuarios, medicos_especialidades, especialidades
    // =========================================================
    let medicosDestacados: RowDataPacket[] = [];
    try {
      const [docsRows] = await pool.query<RowDataPacket[]>(
        `
        SELECT
          m.id_medico,
          CONCAT(
            u.nombre, ' ',
            u.apellido_paterno, ' ',
            COALESCE(u.apellido_materno, '')
          ) AS nombre_completo,
          u.foto_perfil_url AS foto_url,
          m.atiende_fonasa,
          m.atiende_isapre,
          m.consulta_telemedicina,
          TIMESTAMPDIFF(
            YEAR,
            m.fecha_inicio_actividad,
            CURDATE()
          ) AS anos_experiencia,
          m.biografia AS frase,
          (
            SELECT e.nombre
            FROM medicos_especialidades me
            JOIN especialidades e
              ON e.id_especialidad = me.id_especialidad
            WHERE me.id_medico = m.id_medico
            ORDER BY me.es_principal DESC
            LIMIT 1
          ) AS especialidad_principal
        FROM medicos m
        JOIN usuarios u ON u.id_usuario = m.id_usuario
        WHERE m.id_centro_principal = ?
          AND m.estado = 'activo'
        LIMIT 6
      `,
        [idCentro]
      );

      medicosDestacados = docsRows || [];
    } catch (err) {
      console.warn("⚠️ No se pudo cargar medicosDestacados:", err);
      medicosDestacados = [];
    }

    // si algún doctor ofrece telemedicina → marcamos centro.telemedicina_disponible
    if (
      medicosDestacados.some(
        (m: any) => m.consulta_telemedicina === 1 || m.consulta_telemedicina === true
      )
    ) {
      centro.telemedicina_disponible = true;
    }

    // =========================================================
    // 5) CONVENIOS DE SALUD / COBERTURAS
    //    ejemplo tabla: convenios_institucionales (ajusta a tu schema real)
    // =========================================================
    let convenios: RowDataPacket[] = [];
    try {
      const [convRows] = await pool.query<RowDataPacket[]>(
        `
        SELECT 
          tipo_convenio   AS tipo,
          descripcion     AS detalle
        FROM convenios_institucionales
        WHERE id_centro = ?
          AND activo = 1
        ORDER BY tipo_convenio ASC
      `,
        [idCentro]
      );

      convenios = convRows || [];
    } catch (err) {
      console.warn("⚠️ No se pudo cargar convenios:", err);
      convenios = [];
    }

    // =========================================================
    // 6) PROMOCIONES / CAMPAÑAS DEL CENTRO
    //    ejemplo tabla: promociones / campanas_marketing
    // =========================================================
    let promociones: RowDataPacket[] = [];
    try {
      const [promoRows] = await pool.query<RowDataPacket[]>(
        `
        SELECT
          id_promocion      AS id_promo,
          titulo,
          descripcion,
          precio_desde,
          valido_hasta
        FROM promociones
        WHERE id_centro = ?
          AND activo = 1
        ORDER BY valido_hasta ASC
        LIMIT 10
      `,
        [idCentro]
      );

      promociones = promoRows || [];
    } catch (err) {
      console.warn("⚠️ No se pudo cargar promociones:", err);
      promociones = [];
    }

    // =========================================================
    // 7) RESEÑAS / EXPERIENCIA PACIENTES
    //    ejemplo tabla: resenas, encuestas_satisfaccion
    // =========================================================
    let resenas: RowDataPacket[] = [];
    try {
      const [reviewRows] = await pool.query<RowDataPacket[]>(
        `
        SELECT
          paciente_alias        AS paciente_anon,
          rating,
          comentario,
          fecha_creacion        AS fecha
        FROM resenas
        WHERE id_centro = ?
          AND visible_publico = 1
        ORDER BY fecha_creacion DESC
        LIMIT 6
      `,
        [idCentro]
      );

      resenas = reviewRows || [];
    } catch (err) {
      console.warn("⚠️ No se pudo cargar reseñas:", err);
      resenas = [];
    }

    // =========================================================
    // 8) TELEMEDICINA (config del centro)
    //    ejemplo tabla: telemedicina_configuraciones
    // =========================================================
    let telemedicina: any = null;
    try {
      const [teleRows] = await pool.query<RowDataPacket[]>(
        `
        SELECT
          disponible,
          whatsapp_contacto    AS whatsapp,
          url_sala_virtual     AS url_video_consulta,
          instrucciones_publicas AS instrucciones,
          horario_atencion     AS horario_telemedicina
        FROM telemedicina_configuraciones
        WHERE id_centro = ?
        LIMIT 1
      `,
        [idCentro]
      );

      if (teleRows && teleRows.length > 0) {
        telemedicina = {
          disponible:
            teleRows[0].disponible === 1 ||
            teleRows[0].disponible === true ||
            teleRows[0].disponible === "1",
          whatsapp: teleRows[0].whatsapp,
          url_video_consulta: teleRows[0].url_video_consulta,
          instrucciones: teleRows[0].instrucciones,
          horario_telemedicina: teleRows[0].horario_telemedicina,
        };
      }
    } catch (err) {
      console.warn("⚠️ No se pudo cargar telemedicina_configuraciones:", err);
      telemedicina = null;
    }

    // fallback: si no hay tabla telemedicina, pero algún doc hace telemedicina
    if (!telemedicina && centro.telemedicina_disponible) {
      telemedicina = {
        disponible: true,
        whatsapp: null,
        url_video_consulta: null,
        instrucciones:
          "Atención remota disponible con especialistas del centro.",
        horario_telemedicina: "Lunes a Viernes 09:00 - 18:00",
      };
    }

    // =========================================================
    // 9) RESPUESTA FINAL
    // =========================================================
    return NextResponse.json({
      success: true,
      data: {
        centro,
        sucursales,
        servicios,
        medicosDestacados: medicosDestacados,
        convenios,
        promociones,
        resenas,
        telemedicina,
      },
    });
  } catch (error: any) {
    console.error(
      `❌ Error en GET /api/admin/centros/${idCentro}/micrositio-full:`,
      error
    );

    return NextResponse.json(
      {
        success: false,
        error: "Error al obtener información del centro",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
