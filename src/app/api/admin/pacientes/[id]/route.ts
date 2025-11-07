// frontend/src/app/api/admin/pacientes/[id]/route.ts
import { NextResponse } from "next/server";
import pool from "@/lib/db";

// ==================== HELPERS ====================
const toTiny = (v: any) => (v ? 1 : 0);
const isDefined = (v: any) => v !== undefined;
const sameVal = (a: any, b: any) => {
  // Normaliza nulos y números/decimales
  if (a === null || a === undefined) a = null;
  if (b === null || b === undefined) b = null;
  // mysql2 retorna DECIMAL como string; comparamos por string “normalizada”
  const na = a === null ? null : String(a);
  const nb = b === null ? null : String(b);
  return na === nb;
};

const ENUMS = {
  documento_tipo: ["rut","dni","passport","ssn","nif","nie","cedula","curp","otros"],
  genero: ["masculino","femenino","no_binario","prefiero_no_decir"],
  lateralidad: ["diestro","zurdo","ambidiestro"],
  clasificacion_riesgo: ["bajo","medio","alto","critico"],
  estado: ["activo","inactivo","bloqueado","fallecido"],
  metodo_verificacion: ["presencial","video_llamada","documento_digital","biometrico","terceros"],
  preferencia_contacto: ["email","telefono","sms","whatsapp","ninguno"],
  grupo_sanguineo: ["A+","A-","B+","B-","AB+","AB-","O+","O-","desconocido"],
  nivel_privacidad: ["publico","restringido","confidencial","ultra_confidencial"]
};

function normalizeBody(body: any) {
  const b = { ...body };

  // Front puede enviar “feminino”: normalizamos
  if (b.genero === "feminino") b.genero = "femenino";

  // Front envía 'tipo_sangre': mapeamos a columna real
  if (!b.grupo_sanguineo && b.tipo_sangre) b.grupo_sanguineo = b.tipo_sangre;

  // Front puede enviar 'activo' (0|1): mapeo a 'estado'
  if (isDefined(b.activo) && !b.estado) b.estado = b.activo ? "activo" : "inactivo";

  // Normaliza booleanos que llegan en string
  const boolKeys = [
    "email_verificado","telefono_verificado","celular_verificado","es_vip",
    "es_donante_organos","verificado","requiere_2fa","acepta_notificaciones_push",
    "acepta_comunicaciones_marketing","acepta_telemedicina","consentimiento_datos",
    "consentimiento_investigacion","consentimiento_compartir_centros",
    "excluir_estadisticas","sincronizado_externamente","es_paciente_compartido"
  ];
  for (const k of boolKeys) if (isDefined(b[k])) b[k] = toTiny(b[k]);

  // Validación básica de ENUMS (si vienen definidos)
  for (const [key, allowed] of Object.entries(ENUMS)) {
    if (isDefined(b[key]) && b[key] !== null && !allowed.includes(b[key])) {
      throw new Error(`Valor inválido para ${key}: ${b[key]}`);
    }
  }

  return b;
}

function buildDiff(orig: any, body: any) {
  const fields: string[] = [];
  const values: any[] = [];

  const add = (col: string, v: any) => {
    if (!sameVal(v, orig[col])) {
      fields.push(`${col} = ?`);
      values.push(v);
    }
  };

  // ====== Lista exhaustiva según tu tabla ======
  // Identificación / sincronización
  if (isDefined(body.uuid_global)) add("uuid_global", body.uuid_global);
  if (isDefined(body.sincronizado_externamente)) add("sincronizado_externamente", body.sincronizado_externamente);
  if (isDefined(body.sistema_origen)) add("sistema_origen", body.sistema_origen);
  if (isDefined(body.id_externo)) add("id_externo", body.id_externo);

  if (isDefined(body.id_usuario)) add("id_usuario", body.id_usuario);
  if (isDefined(body.documento_tipo)) add("documento_tipo", body.documento_tipo);
  if (isDefined(body.rut)) add("rut", body.rut);
  if (isDefined(body.pasaporte)) add("pasaporte", body.pasaporte);
  if (isDefined(body.documento_pais_emision)) add("documento_pais_emision", body.documento_pais_emision);

  // Nombres
  if (isDefined(body.nombre)) add("nombre", body.nombre);
  if (isDefined(body.segundo_nombre)) add("segundo_nombre", body.segundo_nombre);
  if (isDefined(body.apellido_paterno)) add("apellido_paterno", body.apellido_paterno);
  if (isDefined(body.apellido_materno)) add("apellido_materno", body.apellido_materno);
  if (isDefined(body.apellido_casada)) add("apellido_casada", body.apellido_casada);
  if (isDefined(body.nombre_preferido)) add("nombre_preferido", body.nombre_preferido);
  if (isDefined(body.pronombres)) add("pronombres", body.pronombres);

  // Datos básicos
  if (isDefined(body.fecha_nacimiento)) add("fecha_nacimiento", body.fecha_nacimiento);
  if (isDefined(body.genero)) add("genero", body.genero);

  // Contacto
  if (isDefined(body.email)) add("email", body.email);
  if (isDefined(body.email_verificado)) add("email_verificado", body.email_verificado);
  if (isDefined(body.telefono)) add("telefono", body.telefono);
  if (isDefined(body.telefono_verificado)) add("telefono_verificado", body.telefono_verificado);
  if (isDefined(body.celular)) add("celular", body.celular);
  if (isDefined(body.celular_verificado)) add("celular_verificado", body.celular_verificado);
  if (isDefined(body.whatsapp)) add("whatsapp", body.whatsapp);
  if (isDefined(body.telegram)) add("telegram", body.telegram);
  if (isDefined(body.red_social_preferida)) add("red_social_preferida", body.red_social_preferida);
  if (isDefined(body.url_red_social)) add("url_red_social", body.url_red_social);
  if (isDefined(body.preferencia_contacto)) add("preferencia_contacto", body.preferencia_contacto);

  // Dirección
  if (isDefined(body.direccion)) add("direccion", body.direccion);
  if (isDefined(body.ciudad)) add("ciudad", body.ciudad);
  if (isDefined(body.region)) add("region", body.region);
  if (isDefined(body.pais)) add("pais", body.pais);
  if (isDefined(body.codigo_postal)) add("codigo_postal", body.codigo_postal);
  if (isDefined(body.coordenadas_lat)) add("coordenadas_lat", body.coordenadas_lat);
  if (isDefined(body.coordenadas_lng)) add("coordenadas_lng", body.coordenadas_lng);

  // Localización
  if (isDefined(body.zona_horaria)) add("zona_horaria", body.zona_horaria);
  if (isDefined(body.idioma_preferido)) add("idioma_preferido", body.idioma_preferido);
  if (isDefined(body.idiomas_adicionales)) add("idiomas_adicionales", body.idiomas_adicionales);

  // Demográficos
  if (isDefined(body.nacionalidad)) add("nacionalidad", body.nacionalidad);
  if (isDefined(body.estado_civil)) add("estado_civil", body.estado_civil);
  if (isDefined(body.ocupacion)) add("ocupacion", body.ocupacion);
  if (isDefined(body.nivel_educacion)) add("nivel_educacion", body.nivel_educacion);

  // Salud
  if (isDefined(body.grupo_sanguineo)) add("grupo_sanguineo", body.grupo_sanguineo);
  if (isDefined(body.peso_kg)) add("peso_kg", body.peso_kg);
  if (isDefined(body.altura_cm)) add("altura_cm", body.altura_cm);
  if (isDefined(body.imc)) add("imc", body.imc);
  if (isDefined(body.lateralidad)) add("lateralidad", body.lateralidad);
  if (isDefined(body.religion)) add("religion", body.religion);
  if (isDefined(body.etnia)) add("etnia", body.etnia);
  if (isDefined(body.discapacidades)) add("discapacidades", body.discapacidades);
  if (isDefined(body.alergias_criticas)) add("alergias_criticas", body.alergias_criticas);
  if (isDefined(body.clasificacion_riesgo)) add("clasificacion_riesgo", body.clasificacion_riesgo);

  // Estado y categoría
  if (isDefined(body.es_vip)) add("es_vip", body.es_vip);
  if (isDefined(body.categoria_especial)) add("categoria_especial", body.categoria_especial);
  if (isDefined(body.numero_historia_clinica)) add("numero_historia_clinica", body.numero_historia_clinica);
  if (isDefined(body.codigo_barra_historia)) add("codigo_barra_historia", body.codigo_barra_historia);
  if (isDefined(body.tags)) add("tags", body.tags);
  if (isDefined(body.es_donante_organos)) add("es_donante_organos", body.es_donante_organos);
  if (isDefined(body.estado)) add("estado", body.estado); // activo/inactivo/bloqueado/fallecido

  // Bloqueo
  if (isDefined(body.bloqueado_por)) add("bloqueado_por", body.bloqueado_por);
  if (isDefined(body.razon_bloqueo)) add("razon_bloqueo", body.razon_bloqueo);
  // fecha_bloqueo se maneja aparte (evento)

  // Verificación
  if (isDefined(body.verificado)) add("verificado", body.verificado);
  if (isDefined(body.verificado_por)) add("verificado_por", body.verificado_por);
  if (isDefined(body.metodo_verificacion)) add("metodo_verificacion", body.metodo_verificacion);
  if (isDefined(body.documento_verificacion_url)) add("documento_verificacion_url", body.documento_verificacion_url);
  if (isDefined(body.hash_huella_digital)) add("hash_huella_digital", body.hash_huella_digital);
  if (isDefined(body.hash_facial)) add("hash_facial", body.hash_facial);
  if (isDefined(body.requiere_2fa)) add("requiere_2fa", body.requiere_2fa);

  // Foto
  if (isDefined(body.foto_url)) add("foto_url", body.foto_url);

  // Notificaciones
  if (isDefined(body.token_notificaciones_push)) add("token_notificaciones_push", body.token_notificaciones_push);
  if (isDefined(body.dispositivos_registrados)) add("dispositivos_registrados", body.dispositivos_registrados);
  if (isDefined(body.acepta_notificaciones_push)) add("acepta_notificaciones_push", body.acepta_notificaciones_push);
  if (isDefined(body.horario_no_molestar_inicio)) add("horario_no_molestar_inicio", body.horario_no_molestar_inicio);
  if (isDefined(body.horario_no_molestar_fin)) add("horario_no_molestar_fin", body.horario_no_molestar_fin);

  // Consentimientos
  if (isDefined(body.acepta_comunicaciones_marketing)) add("acepta_comunicaciones_marketing", body.acepta_comunicaciones_marketing);
  if (isDefined(body.acepta_telemedicina)) add("acepta_telemedicina", body.acepta_telemedicina);
  if (isDefined(body.consentimiento_datos)) add("consentimiento_datos", body.consentimiento_datos);
  if (isDefined(body.consentimiento_investigacion)) add("consentimiento_investigacion", body.consentimiento_investigacion);
  if (isDefined(body.consentimiento_compartir_centros)) add("consentimiento_compartir_centros", body.consentimiento_compartir_centros);

  // Privacidad
  if (isDefined(body.nivel_privacidad)) add("nivel_privacidad", body.nivel_privacidad);
  if (isDefined(body.excluir_estadisticas)) add("excluir_estadisticas", body.excluir_estadisticas);

  // Eliminación
  if (isDefined(body.fecha_eliminacion_solicitada)) add("fecha_eliminacion_solicitada", body.fecha_eliminacion_solicitada);
  if (isDefined(body.motivo_eliminacion)) add("motivo_eliminacion", body.motivo_eliminacion);

  // Centro
  if (isDefined(body.id_centro_registro)) add("id_centro_registro", body.id_centro_registro);
  if (isDefined(body.id_sucursal_registro)) add("id_sucursal_registro", body.id_sucursal_registro);
  if (isDefined(body.es_paciente_compartido)) add("es_paciente_compartido", body.es_paciente_compartido);
  if (isDefined(body.centros_autorizados)) add("centros_autorizados", body.centros_autorizados);
  if (isDefined(body.centro_principal)) add("centro_principal", body.centro_principal);

  // Auditoría
  if (isDefined(body.modificado_por)) add("modificado_por", body.modificado_por);
  if (isDefined(body.ip_ultima_modificacion)) add("ip_ultima_modificacion", body.ip_ultima_modificacion);
  if (isDefined(body.user_agent_modificacion)) add("user_agent_modificacion", body.user_agent_modificacion);
  if (isDefined(body.notas_administrativas)) add("notas_administrativas", body.notas_administrativas);

  // Sincronización
  if (isDefined(body.sistema_origen)) add("sistema_origen", body.sistema_origen);
  if (isDefined(body.id_externo)) add("id_externo", body.id_externo);

  // Previsión
  if (isDefined(body.prevision_salud)) add("prevision_salud", body.prevision_salud);

  return { fields, values };
}

// ==================== GET ====================
export async function GET(_req: Request, { params }: { params: { id: string } }) {
  try {
    const id_paciente = Number(params.id);
    if (isNaN(id_paciente)) {
      return NextResponse.json({ success: false, error: "ID de paciente inválido" }, { status: 400 });
    }

    // Paciente + derivados
    const [rows]: any = await pool.query(
      `SELECT 
        p.*,
        TIMESTAMPDIFF(YEAR, p.fecha_nacimiento, CURDATE()) AS edad,
        CONCAT(p.nombre, ' ', p.apellido_paterno, ' ', IFNULL(p.apellido_materno, '')) AS nombre_completo,
        cm.nombre AS centro_registro_nombre,
        cm.direccion AS centro_registro_direccion,
        suc.nombre AS sucursal_registro_nombre,
        cp.nombre AS centro_principal_nombre,
        u_reg.nombre AS registrado_por_nombre,
        u_mod.nombre AS modificado_por_nombre,
        u_bloq.nombre AS bloqueado_por_nombre,
        u_verif.nombre AS verificado_por_nombre
       FROM pacientes p
       LEFT JOIN centros_medicos cm ON cm.id_centro = p.id_centro_registro
       LEFT JOIN sucursales suc ON suc.id_sucursal = p.id_sucursal_registro
       LEFT JOIN centros_medicos cp ON cp.id_centro = p.centro_principal
       LEFT JOIN usuarios u_reg ON u_reg.id_usuario = p.registrado_por
       LEFT JOIN usuarios u_mod ON u_mod.id_usuario = p.modificado_por
       LEFT JOIN usuarios u_bloq ON u_bloq.id_usuario = p.bloqueado_por
       LEFT JOIN usuarios u_verif ON u_verif.id_usuario = p.verificado_por
       WHERE p.id_paciente = ?
       LIMIT 1`,
      [id_paciente]
    );

    if (!rows || rows.length === 0) {
      return NextResponse.json({ success: false, error: "Paciente no encontrado" }, { status: 404 });
    }

    const paciente = rows[0];

    // Médicos asignados
    const [medicos]: any = await pool.query(
      `SELECT 
        pm.*,
        m.id_medico,
        m.rut AS medico_rut,
        m.registro_nacional AS medico_registro,
        CONCAT(u.nombre, ' ', u.apellido_paterno, ' ', IFNULL(u.apellido_materno, '')) AS medico_nombre,
        c.nombre AS centro_nombre,
        GROUP_CONCAT(DISTINCT e.nombre ORDER BY e.nombre SEPARATOR ', ') AS especialidades
       FROM pacientes_medico pm
       INNER JOIN medicos m ON m.id_medico = pm.id_medico
       INNER JOIN usuarios u ON u.id_usuario = m.id_usuario
       INNER JOIN centros_medicos c ON c.id_centro = m.id_centro
       LEFT JOIN medicos_especialidades me ON me.id_medico = m.id_medico
       LEFT JOIN especialidades e ON e.id_especialidad = me.id_especialidad
       WHERE pm.id_paciente = ? AND pm.activo = 1
       GROUP BY pm.id_paciente, pm.id_medico, m.id_medico, m.rut, m.registro_nacional,
                u.nombre, u.apellido_paterno, u.apellido_materno, c.nombre,
                pm.fecha_asignacion, pm.fecha_desasignacion, pm.es_principal, pm.activo, pm.notas
       ORDER BY pm.es_principal DESC, pm.fecha_asignacion DESC`,
      [id_paciente]
    );

    // Stats de citas
    const [citasStats]: any = await pool.query(
      `SELECT 
        COUNT(*) AS total_citas,
        SUM(CASE WHEN c.estado = 'completada' THEN 1 ELSE 0 END) AS citas_completadas,
        SUM(CASE WHEN c.estado = 'cancelada' THEN 1 ELSE 0 END) AS citas_canceladas,
        SUM(CASE WHEN c.estado = 'no_asistio' THEN 1 ELSE 0 END) AS citas_no_asistio,
        SUM(CASE WHEN c.estado IN ('programada', 'confirmada') THEN 1 ELSE 0 END) AS citas_pendientes,
        MAX(c.fecha_hora_inicio) AS ultima_cita,
        MIN(c.fecha_hora_inicio) AS primera_cita,
        ROUND((SUM(CASE WHEN c.estado = 'completada' THEN 1 ELSE 0 END) * 100.0) / NULLIF(COUNT(*), 0), 2) AS tasa_asistencia
       FROM citas c
       WHERE c.id_paciente = ?`,
      [id_paciente]
    );

    // Próximas 5
    const [proximasCitas]: any = await pool.query(
      `SELECT 
        c.*,
        CONCAT(u.nombre, ' ', u.apellido_paterno) AS medico_nombre,
        cm.nombre AS centro_nombre,
        s.nombre AS sala_nombre
       FROM citas c
       INNER JOIN medicos m ON m.id_medico = c.id_medico
       INNER JOIN usuarios u ON u.id_usuario = m.id_usuario
       INNER JOIN centros_medicos cm ON cm.id_centro = c.id_centro
       LEFT JOIN salas s ON s.id_sala = c.id_sala
       WHERE c.id_paciente = ?
         AND c.estado IN ('programada', 'confirmada')
         AND c.fecha_hora_inicio >= NOW()
       ORDER BY c.fecha_hora_inicio ASC
       LIMIT 5`,
      [id_paciente]
    );

    // Últimas 10 completadas
    const [ultimasCitas]: any = await pool.query(
      `SELECT 
        c.*,
        CONCAT(u.nombre, ' ', u.apellido_paterno) AS medico_nombre,
        cm.nombre AS centro_nombre,
        s.nombre AS sala_nombre
       FROM citas c
       INNER JOIN medicos m ON m.id_medico = c.id_medico
       INNER JOIN usuarios u ON u.id_usuario = m.id_usuario
       INNER JOIN centros_medicos cm ON cm.id_centro = c.id_centro
       LEFT JOIN salas s ON s.id_sala = c.id_sala
       WHERE c.id_paciente = ? AND c.estado = 'completada'
       ORDER BY c.fecha_hora_inicio DESC
       LIMIT 10`,
      [id_paciente]
    );

    const [contactosEmergencia]: any = await pool.query(
      `SELECT * FROM contactos_emergencia
       WHERE id_paciente = ? AND activo = 1
       ORDER BY prioridad ASC, fecha_creacion ASC`,
      [id_paciente]
    );

    const [alergias]: any = await pool.query(
      `SELECT * FROM alergias_pacientes
       WHERE id_paciente = ? AND activo = 1
       ORDER BY severidad DESC, fecha_diagnostico DESC`,
      [id_paciente]
    );

    const [antecedentes]: any = await pool.query(
      `SELECT * FROM antecedentes
       WHERE id_paciente = ? AND activo = 1
       ORDER BY fecha_diagnostico DESC`,
      [id_paciente]
    );

    const [valoraciones]: any = await pool.query(
      `SELECT 
        v.*,
        CONCAT(u.nombre, ' ', u.apellido_paterno) AS medico_nombre
       FROM valoraciones_medicas v
       INNER JOIN medicos m ON m.id_medico = v.id_medico
       INNER JOIN usuarios u ON u.id_usuario = m.id_usuario
       WHERE v.id_paciente = ? AND v.estado = 'visible'
       ORDER BY v.fecha_valoracion DESC
       LIMIT 10`,
      [id_paciente]
    );

    return NextResponse.json({
      success: true,
      paciente: paciente,
      medicos_asignados: medicos || [],
      citas_stats: citasStats?.[0] || {
        total_citas: 0, citas_completadas: 0, citas_canceladas: 0, citas_no_asistio: 0,
        citas_pendientes: 0, ultima_cita: null, primera_cita: null, tasa_asistencia: 0,
      },
      proximas_citas: proximasCitas || [],
      ultimas_citas: ultimasCitas || [],
      contactos_emergencia: contactosEmergencia || [],
      alergias: alergias || [],
      antecedentes: antecedentes || [],
      valoraciones: valoraciones || [],
    });
  } catch (error: any) {
    console.error("❌ GET /api/admin/pacientes/[id]:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// ==================== PUT ====================
export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const id_paciente = Number(params.id);
  if (isNaN(id_paciente)) {
    return NextResponse.json({ success: false, error: "ID de paciente inválido" }, { status: 400 });
  }

  let body: any = {};
  try {
    body = await req.json();
  } catch {
    body = {};
  }

  try {
    // Normalización / validación
    try {
      body = normalizeBody(body);
    } catch (valErr: any) {
      return NextResponse.json({ success: false, error: valErr.message }, { status: 400 });
    }

    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();

      // Lock row
      const [origRows]: any = await conn.query(
        `SELECT * FROM pacientes WHERE id_paciente = ? FOR UPDATE`,
        [id_paciente]
      );
      if (!origRows || origRows.length === 0) {
        await conn.rollback();
        conn.release();
        return NextResponse.json({ success: false, error: "Paciente no encontrado" }, { status: 404 });
      }
      const orig = origRows[0];

      // Duplicados: RUT
      if (isDefined(body.rut) && body.rut !== orig.rut) {
        const [r]: any = await conn.query(
          `SELECT id_paciente FROM pacientes WHERE rut = ? AND id_paciente != ? LIMIT 1`,
          [body.rut, id_paciente]
        );
        if (r?.length > 0) {
          await conn.rollback();
          conn.release();
          return NextResponse.json({ success: false, error: `Ya existe otro paciente con RUT ${body.rut}` }, { status: 409 });
        }
      }
      // Duplicados: Pasaporte
      if (isDefined(body.pasaporte) && body.pasaporte !== orig.pasaporte) {
        const [p]: any = await conn.query(
          `SELECT id_paciente FROM pacientes WHERE pasaporte = ? AND id_paciente != ? LIMIT 1`,
          [body.pasaporte, id_paciente]
        );
        if (p?.length > 0) {
          await conn.rollback();
          conn.release();
          return NextResponse.json({ success: false, error: `Ya existe otro paciente con pasaporte ${body.pasaporte}` }, { status: 409 });
        }
      }
      // Duplicados: NHC (único)
      if (isDefined(body.numero_historia_clinica) && body.numero_historia_clinica !== orig.numero_historia_clinica) {
        const [n]: any = await conn.query(
          `SELECT id_paciente FROM pacientes WHERE numero_historia_clinica = ? AND id_paciente != ? LIMIT 1`,
          [body.numero_historia_clinica, id_paciente]
        );
        if (n?.length > 0) {
          await conn.rollback();
          conn.release();
          return NextResponse.json({ success: false, error: `El número de historia clínica ya está en uso` }, { status: 409 });
        }
      }

      // IMC (si hay peso/altura y no viene imc definido)
      let imcCalculado: number | undefined = body.imc;
      const peso = isDefined(body.peso_kg) ? Number(body.peso_kg) : (orig.peso_kg != null ? Number(orig.peso_kg) : undefined);
      const altura = isDefined(body.altura_cm) ? Number(body.altura_cm) : (orig.altura_cm != null ? Number(orig.altura_cm) : undefined);
      if (!isDefined(body.imc) && isDefined(peso) && isDefined(altura) && peso && altura) {
        const m = Number(altura) / 100;
        if (m > 0) {
          imcCalculado = Math.round((Number(peso) / (m * m)) * 100) / 100;
          body.imc = imcCalculado;
        }
      }

      // Si bloquea: set fecha_bloqueo
      if (isDefined(body.estado) && body.estado === "bloqueado" && !orig.fecha_bloqueo) {
        // Se agregará más abajo como set
        (body as any).__set_fecha_bloqueo = true;
      }
      // Si verificado cambia a 1
      if (isDefined(body.verificado) && Number(body.verificado) === 1 && Number(orig.verificado) !== 1) {
        (body as any).__set_fecha_verificacion = true;
      }
      // Si sincronizado_externamente = 1
      if (isDefined(body.sincronizado_externamente) && Number(body.sincronizado_externamente) === 1) {
        (body as any).__set_ultima_sincronizacion = true;
      }

      // Construir diff
      const { fields, values } = buildDiff(orig, body);

      // Fechas evento (bloqueo/verificación/sincronización)
      if ((body as any).__set_fecha_bloqueo) fields.push(`fecha_bloqueo = NOW()`);
      if ((body as any).__set_fecha_verificacion) fields.push(`fecha_verificacion = NOW()`);
      if ((body as any).__set_ultima_sincronizacion) fields.push(`ultima_sincronizacion = NOW()`);

      // Si no hay cambios => éxito “sin cambios”
      if (fields.length === 0) {
        await conn.rollback(); // no alteramos nada
        conn.release();
        return NextResponse.json({ success: true, message: "Sin cambios que aplicar" });
      }

      // version++ siempre que haya cambios
      fields.push(`version = version + 1`);

      const sql = `UPDATE pacientes SET ${fields.join(", ")} WHERE id_paciente = ?`;
      values.push(id_paciente);

      await conn.query(sql, values);
      await conn.commit();
      conn.release();

      return NextResponse.json({ success: true, message: "Paciente actualizado exitosamente" });
    } catch (e: any) {
      try { await (pool as any).query("ROLLBACK"); } catch {}
      return NextResponse.json({ success: false, error: e.message }, { status: 500 });
    }
  } catch (error: any) {
    console.error("❌ PUT /api/admin/pacientes/[id]:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// ==================== DELETE ====================
export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  try {
    const id_paciente = Number(params.id);
    if (isNaN(id_paciente)) {
      return NextResponse.json({ success: false, error: "ID de paciente inválido" }, { status: 400 });
    }

    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();

      const [exists]: any = await conn.query(
        `SELECT id_paciente, rut, nombre, apellido_paterno FROM pacientes WHERE id_paciente = ? FOR UPDATE`,
        [id_paciente]
      );
      if (!exists || exists.length === 0) {
        await conn.rollback();
        conn.release();
        return NextResponse.json({ success: false, error: "Paciente no encontrado" }, { status: 404 });
      }

      // CASCADE debe estar configurado en FK
      await conn.query(`DELETE FROM pacientes WHERE id_paciente = ?`, [id_paciente]);

      await conn.commit();
      conn.release();

      const p = exists[0];
      return NextResponse.json({
        success: true,
        message: `Paciente ${p.nombre} ${p.apellido_paterno} (${p.rut}) eliminado permanentemente`,
      });
    } catch (e: any) {
      await conn.rollback();
      conn.release();
      console.error("❌ DELETE /api/admin/pacientes/[id] TX:", e);
      return NextResponse.json({ success: false, error: e.message }, { status: 500 });
    }
  } catch (error: any) {
    console.error("❌ DELETE /api/admin/pacientes/[id]:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
