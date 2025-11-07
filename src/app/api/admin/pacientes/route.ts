// frontend/src/app/api/admin/pacientes/route.ts
import { NextResponse } from "next/server";
import pool from "@/lib/db";

export const dynamic = "force-dynamic";
export const revalidate = 0;

/* ==================== HELPERS BÁSICOS ==================== */
const toInt = (v: any, def = 0) => (Number.isFinite(Number(v)) ? Number(v) : def);
const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(max, n));
const isDef = (v: any) => v !== undefined && v !== null && v !== "";

/* ==================== ENUMS CANÓNICOS ==================== */
const ENUMS = {
  genero: ["masculino", "femenino", "no_binario", "prefiero_no_decir"],
  grupo_sanguineo: ["A+","A-","B+","B-","AB+","AB-","O+","O-","desconocido"],
  estado: ["activo", "inactivo", "bloqueado", "fallecido"],
};

/* ==================== INTROSPECCIÓN DE ESQUEMA ==================== */
async function getCurrentDB(): Promise<string> {
  const [rows]: any = await pool.query("SELECT DATABASE() AS db");
  return rows?.[0]?.db || "";
}
async function tableExists(table: string): Promise<boolean> {
  const db = await getCurrentDB();
  const [rows]: any = await pool.query(
    "SELECT 1 FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA=? AND TABLE_NAME=? LIMIT 1",
    [db, table]
  );
  return rows?.length > 0;
}
async function getColumns(table: string): Promise<Set<string>> {
  const db = await getCurrentDB();
  const [rows]: any = await pool.query(
    "SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA=? AND TABLE_NAME=?",
    [db, table]
  );
  return new Set<string>((rows || []).map((r: any) => String(r.COLUMN_NAME)));
}

/* ==================== NORMALIZACIONES ==================== */
function normalizeGenero(g: string | undefined) {
  if (!g) return undefined;
  if (g === "feminino") return "femenino";
  if (g === "otro") return "no_binario";
  return g;
}

function normalizeBodyForInsert(b: any) {
  const body = { ...b };

  // Normalizaciones desde el front
  body.genero = normalizeGenero(body.genero);
  if (body.tipo_sangre && !body.grupo_sanguineo) body.grupo_sanguineo = body.tipo_sangre;

  // activo -> estado (si llega activo)
  if (isDef(body.activo) && !body.estado) {
    body.estado = Number(body.activo) === 1 ? "activo" : "inactivo";
  }
  if (!isDef(body.estado)) body.estado = "activo";

  // telefono_secundario -> celular
  if (isDef(body.telefono_secundario) && !isDef(body.celular)) {
    body.celular = body.telefono_secundario;
  }

  // Defaults seguros
  if (!isDef(body.grupo_sanguineo)) body.grupo_sanguineo = "desconocido";
  if (!isDef(body.zona_horaria)) body.zona_horaria = "America/Santiago";
  if (!isDef(body.idioma_preferido)) body.idioma_preferido = "es-CL";
  if (!isDef(body.nivel_privacidad)) body.nivel_privacidad = "restringido";
  if (!isDef(body.preferencia_contacto)) body.preferencia_contacto = "telefono";

  // Validaciones básicas (según lo que pediste)
  if (!isDef(body.rut)) throw new Error("El RUT es requerido");
  if (!isDef(body.nombre)) throw new Error("El nombre es requerido");
  if (!isDef(body.apellido_paterno)) throw new Error("El apellido paterno es requerido");
  if (!isDef(body.fecha_nacimiento)) throw new Error("La fecha de nacimiento es requerida");
  if (!isDef(body.genero)) throw new Error("El género es requerido");

  if (!ENUMS.estado.includes(body.estado)) throw new Error(`Estado inválido: ${body.estado}`);
  if (!ENUMS.grupo_sanguineo.includes(body.grupo_sanguineo)) {
    throw new Error(`Grupo sanguíneo inválido: ${body.grupo_sanguineo}`);
  }
  if (!ENUMS.genero.includes(body.genero)) throw new Error(`Género inválido: ${body.genero}`);

  // IMC si viene peso/altura
  const peso = isDef(body.peso_kg) ? Number(body.peso_kg) : undefined;
  const altura = isDef(body.altura_cm) ? Number(body.altura_cm) : undefined;
  if (!isDef(body.imc) && peso && altura) {
    const m = altura / 100;
    if (m > 0) body.imc = Math.round((peso / (m * m)) * 100) / 100;
  }

  return body;
}

/* ==================== FILTROS (dinámicos según columnas reales) ==================== */
function buildFilters(params: URLSearchParams, pacCols: Set<string>, hasPacientesMedico: boolean) {
  const where: string[] = [];
  const args: any[] = [];

  // search dinámico (solo columnas existentes)
  const search = params.get("search");
  if (isDef(search)) {
    const s = `%${search}%`;
    const searchables = [
      "rut", "nombre", "apellido_paterno", "apellido_materno",
      "email", "telefono", "celular", "numero_historia_clinica"
    ].filter((c) => pacCols.has(c));
    if (searchables.length) {
      where.push("(" + searchables.map((c) => `p.${c} LIKE ?`).join(" OR ") + ")");
      for (let i = 0; i < searchables.length; i++) args.push(s);
    }
  }

  // activo -> estado
  const activo = params.get("activo"); // "1" | "0" | ""
  if (pacCols.has("estado") && isDef(activo)) {
    if (activo === "1") where.push(`p.estado = 'activo'`);
    else if (activo === "0") where.push(`p.estado IN ('inactivo','bloqueado','fallecido')`);
  }

  // genero
  const genero = normalizeGenero(params.get("genero") || undefined);
  if (pacCols.has("genero") && isDef(genero)) {
    where.push(`p.genero = ?`);
    args.push(genero);
  }

  // prevision_salud
  const prev = params.get("prevision_salud");
  if (pacCols.has("prevision_salud") && isDef(prev)) {
    where.push(`p.prevision_salud = ?`);
    args.push(prev);
  }

  // edad (requiere fecha_nacimiento)
  const edadMin = params.get("edad_min");
  if (pacCols.has("fecha_nacimiento") && isDef(edadMin)) {
    where.push(`TIMESTAMPDIFF(YEAR, p.fecha_nacimiento, CURDATE()) >= ?`);
    args.push(Number(edadMin));
  }
  const edadMax = params.get("edad_max");
  if (pacCols.has("fecha_nacimiento") && isDef(edadMax)) {
    where.push(`TIMESTAMPDIFF(YEAR, p.fecha_nacimiento, CURDATE()) <= ?`);
    args.push(Number(edadMax));
  }

  // región / comuna
  const region = params.get("region");
  if (pacCols.has("region") && isDef(region)) {
    where.push(`p.region = ?`);
    args.push(region);
  }
  const comuna = params.get("comuna");
  if (pacCols.has("comuna") && isDef(comuna)) {
    where.push(`p.comuna = ?`);
    args.push(comuna);
  }

  // con_medico (solo si existe la tabla)
  const conMedico = params.get("con_medico"); // "1" | "0" | ""
  if (hasPacientesMedico && isDef(conMedico)) {
    if (conMedico === "1") {
      where.push(`EXISTS (SELECT 1 FROM pacientes_medico pm WHERE pm.id_paciente = p.id_paciente AND pm.activo = 1)`);
    } else if (conMedico === "0") {
      where.push(`NOT EXISTS (SELECT 1 FROM pacientes_medico pm WHERE pm.id_paciente = p.id_paciente AND pm.activo = 1)`);
    }
  }

  // rango por fecha_registro
  const desde = params.get("desde");
  const hasta = params.get("hasta");
  if (pacCols.has("fecha_registro") && isDef(desde)) {
    where.push(`DATE(p.fecha_registro) >= ?`);
    args.push(desde);
  }
  if (pacCols.has("fecha_registro") && isDef(hasta)) {
    where.push(`DATE(p.fecha_registro) <= ?`);
    args.push(hasta);
  }

  const whereSQL = where.length ? `WHERE ${where.join(" AND ")}` : "";
  return { whereSQL, args };
}

/* ==================== GET (listado + stats) ==================== */
export async function GET(req: Request) {
  try {
    // Verificación mínima
    const pacientesOk = await tableExists("pacientes");
    if (!pacientesOk) {
      return NextResponse.json(
        { success: false, error: "Tabla 'pacientes' no existe en la base de datos" },
        { status: 500 }
      );
    }

    const pacCols = await getColumns("pacientes");
    const citasOk = await tableExists("citas");
    const pmOk = await tableExists("pacientes_medico");
    const medicosOk = await tableExists("medicos");
    const usuariosOk = await tableExists("usuarios");

    const url = new URL(req.url);
    const params = url.searchParams;

    const pagina = Math.max(1, toInt(params.get("pagina"), 1));
    const rawPageSize = toInt(params.get("pageSize"), 20);
    const pageSize = clamp(rawPageSize, 1, 100);
    const offset = (pagina - 1) * pageSize;

    const { whereSQL, args } = buildFilters(params, pacCols, pmOk);

    // Total de registros
    const [countRows]: any = await pool.query(
      `SELECT COUNT(*) AS total FROM pacientes p ${whereSQL}`,
      args
    );
    const total = Number(countRows?.[0]?.total || 0);

    // Expresiones calculadas según columnas/tables disponibles
    const activoExpr = pacCols.has("estado")
      ? `CASE WHEN p.estado = 'activo' THEN 1 ELSE 0 END AS activo`
      : `0 AS activo`;

    const edadExpr = pacCols.has("fecha_nacimiento")
      ? `TIMESTAMPDIFF(YEAR, p.fecha_nacimiento, CURDATE()) AS edad`
      : `NULL AS edad`;

    const nombreCompletoExpr =
      pacCols.has("nombre") && pacCols.has("apellido_paterno")
        ? `CONCAT(p.nombre, ' ', p.apellido_paterno, ' ', IFNULL(p.apellido_materno, '')) AS nombre_completo`
        : pacCols.has("nombre")
          ? `p.nombre AS nombre_completo`
          : `'' AS nombre_completo`;

    const totalCitasExpr = citasOk
      ? `(SELECT COUNT(*) FROM citas c WHERE c.id_paciente = p.id_paciente) AS total_citas`
      : `0 AS total_citas`;

    const ultimaCitaExpr = citasOk
      ? `(SELECT MAX(c.fecha_hora_inicio) FROM citas c WHERE c.id_paciente = p.id_paciente) AS ultima_cita`
      : `NULL AS ultima_cita`;

    const medicoTratanteExpr = (pmOk && medicosOk && usuariosOk)
      ? `(
           SELECT CONCAT(u.nombre, ' ', u.apellido_paterno)
             FROM pacientes_medico pm
             INNER JOIN medicos m ON m.id_medico = pm.id_medico
             INNER JOIN usuarios u ON u.id_usuario = m.id_usuario
            WHERE pm.id_paciente = p.id_paciente AND pm.activo = 1
            ORDER BY pm.es_principal DESC, pm.fecha_asignacion DESC
            LIMIT 1
         ) AS medico_tratante`
      : `NULL AS medico_tratante`;

    // Orden preferente por fecha_modificacion/fecha_registro si existen
    let orderBy = "p.id_paciente DESC";
    if (pacCols.has("fecha_modificacion")) orderBy = "p.fecha_modificacion DESC, p.id_paciente DESC";
    else if (pacCols.has("fecha_registro")) orderBy = "p.fecha_registro DESC, p.id_paciente DESC";
    else if (pacCols.has("updated_at")) orderBy = "p.updated_at DESC, p.id_paciente DESC";
    else if (pacCols.has("created_at")) orderBy = "p.created_at DESC, p.id_paciente DESC";

    // Datos paginados
    const [rows]: any = await pool.query(
      `SELECT
         p.*,
         ${activoExpr},
         ${edadExpr},
         ${nombreCompletoExpr},
         ${totalCitasExpr},
         ${ultimaCitaExpr},
         ${medicoTratanteExpr}
       FROM pacientes p
       ${whereSQL}
       ORDER BY ${orderBy}
       LIMIT ? OFFSET ?`,
      [...args, pageSize, offset]
    );

    // Stats (dinámicas, tolerantes a columnas)
    let stats = {
      total_pacientes: 0,
      pacientes_activos: 0,
      pacientes_nuevos_mes: 0,
      promedio_edad: 0,
      total_citas: 0,
      pacientes_con_medico: 0,
      pacientes_con_prevision: 0,
    };

    // Base: total y activos, promedio edad, prevision, nuevos del mes
    const statsSelect =
      `SELECT
         COUNT(*) AS total_pacientes
         ${pacCols.has("estado") ? `, SUM(CASE WHEN estado='activo' THEN 1 ELSE 0 END) AS pacientes_activos` : `, 0 AS pacientes_activos`}
         ${pacCols.has("fecha_nacimiento") ? `, ROUND(AVG(TIMESTAMPDIFF(YEAR, fecha_nacimiento, CURDATE()))) AS promedio_edad` : `, 0 AS promedio_edad`}
         ${pacCols.has("prevision_salud") ? `, SUM(CASE WHEN prevision_salud IS NOT NULL AND prevision_salud <> '' THEN 1 ELSE 0 END) AS pacientes_con_prevision` : `, 0 AS pacientes_con_prevision`}
         ${pacCols.has("fecha_registro") ? `, SUM(CASE WHEN YEAR(fecha_registro)=YEAR(CURDATE()) AND MONTH(fecha_registro)=MONTH(CURDATE()) THEN 1 ELSE 0 END) AS pacientes_nuevos_mes` : `, 0 AS pacientes_nuevos_mes`}
       FROM pacientes`;
    const [[stats1]]: any = await pool.query(statsSelect);

    stats.total_pacientes = Number(stats1?.total_pacientes || 0);
    stats.pacientes_activos = Number(stats1?.pacientes_activos || 0);
    stats.pacientes_nuevos_mes = Number(stats1?.pacientes_nuevos_mes || 0);
    stats.promedio_edad = Number(stats1?.promedio_edad || 0);
    stats.pacientes_con_prevision = Number(stats1?.pacientes_con_prevision || 0);

    // total_citas
    if (await tableExists("citas")) {
      const [[sc]]: any = await pool.query(`SELECT COUNT(*) AS total_citas FROM citas`);
      stats.total_citas = Number(sc?.total_citas || 0);
    }

    // pacientes con médico
    if (pmOk) {
      const [[sm]]: any = await pool.query(
        `SELECT COUNT(DISTINCT pm.id_paciente) AS pacientes_con_medico
           FROM pacientes_medico pm
          WHERE pm.activo = 1`
      );
      stats.pacientes_con_medico = Number(sm?.pacientes_con_medico || 0);
    }

    return NextResponse.json({
      success: true,
      pagina,
      pageSize,
      total,
      pacientes: rows || [],
      stats,
    });
  } catch (error: any) {
    console.error("❌ GET /api/admin/pacientes:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

/* ==================== POST (crear paciente, columnas reales + TX) ==================== */
export async function POST(req: Request) {
  let body: any = {};
  try {
    body = await req.json();
  } catch {
    body = {};
  }

  let conn: any = null;
  try {
    const pacientesOk = await tableExists("pacientes");
    if (!pacientesOk) {
      return NextResponse.json(
        { success: false, error: "Tabla 'pacientes' no existe en la base de datos" },
        { status: 500 }
      );
    }
    const pacCols = await getColumns("pacientes");
    const data = normalizeBodyForInsert(body);

    conn = await pool.getConnection();
    await conn.beginTransaction();

    // Duplicados (solo si la columna existe y el dato vino)
    if (pacCols.has("rut") && isDef(data.rut)) {
      const [r]: any = await conn.query(
        `SELECT id_paciente FROM pacientes WHERE rut = ? LIMIT 1`,
        [data.rut]
      );
      if (r?.length > 0) {
        await conn.rollback();
        conn.release();
        return NextResponse.json({ success: false, error: `Ya existe un paciente con RUT ${data.rut}` }, { status: 409 });
      }
    }
    if (pacCols.has("pasaporte") && isDef(data.pasaporte)) {
      const [p]: any = await conn.query(
        `SELECT id_paciente FROM pacientes WHERE pasaporte = ? LIMIT 1`,
        [data.pasaporte]
      );
      if (p?.length > 0) {
        await conn.rollback();
        conn.release();
        return NextResponse.json({ success: false, error: `Ya existe un paciente con pasaporte ${data.pasaporte}` }, { status: 409 });
      }
    }
    if (pacCols.has("numero_historia_clinica") && isDef(data.numero_historia_clinica)) {
      const [n]: any = await conn.query(
        `SELECT id_paciente FROM pacientes WHERE numero_historia_clinica = ? LIMIT 1`,
        [data.numero_historia_clinica]
      );
      if (n?.length > 0) {
        await conn.rollback();
        conn.release();
        return NextResponse.json({ success: false, error: `El número de historia clínica ya está en uso` }, { status: 409 });
      }
    }

    // Construcción segura del INSERT (solo columnas existentes y con valor)
    const cols: string[] = [];
    const vals: any[] = [];
    const add = (k: string, v: any) => {
      if (pacCols.has(k) && isDef(v)) {
        cols.push(k);
        vals.push(v);
      }
    };

    // Identidad multi-sistema
    add("uuid_global", data.uuid_global);
    add("sincronizado_externamente", data.sincronizado_externamente ? 1 : 0);
    add("sistema_origen", data.sistema_origen);
    add("id_externo", data.id_externo);
    add("id_usuario", data.id_usuario);

    // Documentos
    add("documento_tipo", data.documento_tipo || "rut");
    add("rut", data.rut);
    add("pasaporte", data.pasaporte);
    add("documento_pais_emision", data.documento_pais_emision);

    // Nombre
    add("nombre", data.nombre);
    add("segundo_nombre", data.segundo_nombre);
    add("apellido_paterno", data.apellido_paterno);
    add("apellido_materno", data.apellido_materno);
    add("apellido_casada", data.apellido_casada);
    add("nombre_preferido", data.nombre_preferido);
    add("pronombres", data.pronombres);

    // Demografía
    add("fecha_nacimiento", data.fecha_nacimiento);
    add("genero", data.genero);

    // Contacto
    add("email", data.email);
    add("email_verificado", data.email_verificado ? 1 : 0);
    add("telefono", data.telefono);
    add("telefono_verificado", data.telefono_verificado ? 1 : 0);
    add("celular", data.celular);
    add("celular_verificado", data.celular_verificado ? 1 : 0);
    add("whatsapp", data.whatsapp);
    add("telegram", data.telegram);
    add("red_social_preferida", data.red_social_preferida);
    add("url_red_social", data.url_red_social);
    add("preferencia_contacto", data.preferencia_contacto);

    // Dirección
    add("direccion", data.direccion);
    add("ciudad", data.ciudad);
    add("region", data.region);
    add("pais", data.pais);
    add("codigo_postal", data.codigo_postal);
    add("coordenadas_lat", data.coordenadas_lat);
    add("coordenadas_lng", data.coordenadas_lng);

    // Localización/idioma
    add("zona_horaria", data.zona_horaria);
    add("idioma_preferido", data.idioma_preferido);
    add("idiomas_adicionales", data.idiomas_adicionales);

    // Socio-cultural
    add("nacionalidad", data.nacionalidad);
    add("estado_civil", data.estado_civil);
    add("ocupacion", data.ocupacion);
    add("nivel_educacion", data.nivel_educacion);

    // Clínico básico
    add("grupo_sanguineo", data.grupo_sanguineo);
    add("peso_kg", data.peso_kg);
    add("altura_cm", data.altura_cm);
    add("imc", data.imc);
    add("lateralidad", data.lateralidad);
    add("religion", data.religion);
    add("etnia", data.etnia);
    add("discapacidades", data.discapacidades);
    add("alergias_criticas", data.alergias_criticas);
    add("clasificacion_riesgo", data.clasificacion_riesgo);

    // Flags & seguridad
    add("es_vip", data.es_vip ? 1 : 0);
    add("categoria_especial", data.categoria_especial);
    add("numero_historia_clinica", data.numero_historia_clinica);
    add("codigo_barra_historia", data.codigo_barra_historia);
    add("tags", data.tags);
    add("es_donante_organos", data.es_donante_organos ? 1 : 0);
    add("estado", data.estado);
    add("verificado", data.verificado ? 1 : 0);
    add("verificado_por", data.verificado_por);
    add("metodo_verificacion", data.metodo_verificacion);
    add("documento_verificacion_url", data.documento_verificacion_url);
    add("hash_huella_digital", data.hash_huella_digital);
    add("hash_facial", data.hash_facial);
    add("requiere_2fa", data.requiere_2fa ? 1 : 0);

    // Foto
    add("foto_url", data.foto_url);

    // Notificaciones
    add("token_notificaciones_push", data.token_notificaciones_push);
    add("dispositivos_registrados", data.dispositivos_registrados);
    add("acepta_notificaciones_push", data.acepta_notificaciones_push ? 1 : 0);
    add("horario_no_molestar_inicio", data.horario_no_molestar_inicio);
    add("horario_no_molestar_fin", data.horario_no_molestar_fin);

    // Consentimientos / previsión
    add("acepta_comunicaciones_marketing", data.acepta_comunicaciones_marketing ? 1 : 0);
    add("acepta_telemedicina", data.acepta_telemedicina ? 1 : 0);
    add("prevision_salud", data.prevision_salud);
    add("consentimiento_datos", data.consentimiento_datos ? 1 : 0);
    add("consentimiento_investigacion", data.consentimiento_investigacion ? 1 : 0);
    add("consentimiento_compartir_centros", data.consentimiento_compartir_centros ? 1 : 0);

    // Privacidad
    add("nivel_privacidad", data.nivel_privacidad);
    add("excluir_estadisticas", data.excluir_estadisticas ? 1 : 0);

    // Eliminación/retención
    add("fecha_eliminacion_solicitada", data.fecha_eliminacion_solicitada);
    add("motivo_eliminacion", data.motivo_eliminacion);

    // Origen del registro
    add("id_centro_registro", data.id_centro_registro);
    add("id_sucursal_registro", data.id_sucursal_registro);
    add("es_paciente_compartido", data.es_paciente_compartido ? 1 : 0);
    add("centros_autorizados", data.centros_autorizados);
    add("centro_principal", data.centro_principal);

    // Auditoría
    add("registrado_por", data.registrado_por);
    add("ip_registro", data.ip_registro);
    add("user_agent_registro", data.user_agent_registro);
    add("notas_administrativas", data.notas_administrativas);

    if (cols.length === 0) {
      await conn.rollback();
      conn.release();
      return NextResponse.json({ success: false, error: "No hay datos para crear el paciente" }, { status: 400 });
    }

    const placeholders = cols.map(() => "?").join(", ");
    const sql = `INSERT INTO pacientes (${cols.join(", ")}) VALUES (${placeholders})`;
    const [result]: any = await conn.query(sql, vals);

    await conn.commit();
    conn.release();

    const insertId = result?.insertId ?? result?.[0]?.insertId ?? null;
    return NextResponse.json({ success: true, id_paciente: insertId, message: "Paciente creado exitosamente" });
  } catch (error: any) {
    if (conn) {
      try { await conn.rollback(); } catch {}
      try { conn.release(); } catch {}
    }
    console.error("❌ POST /api/admin/pacientes:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
