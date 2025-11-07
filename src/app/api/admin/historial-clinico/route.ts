// frontend/src/app/api/admin/historial-clinico/route.ts
import { NextResponse } from "next/server";
import pool from "@/lib/db";
import type { RowDataPacket, ResultSetHeader } from "mysql2/promise";

export const dynamic = "force-dynamic";

/* ===================== Helpers ===================== */
const toInt = (v: any, d = 0) => (Number.isFinite(Number(v)) ? Number(v) : d);
const like = (s: string) => `%${s}%`;
const is01 = (v: any) => (v === "1" || v === 1 || v === true ? 1 : 0);
const toNull = (v: any) =>
  v === "" || v === undefined || v === "null" || v === "undefined" ? null : v;

/* ===================== Tipos de filas ===================== */
interface HcRow extends RowDataPacket {
  id_historial: number;
  id_paciente: number;
  id_medico: number;
  id_centro: number;
  id_especialidad: number | null;
  id_sucursal: number | null;
  id_ficha: number | null;
  fecha_atencion: string;
  motivo_consulta: string | null;
  anamnesis: string | null;
  examen_fisico: string | null;
  diagnostico_principal: string | null;
  codigo_cie10: string | null;
  plan_tratamiento: string | null;
  observaciones: string | null;
  estado_registro: string | null;
  tipo_atencion: string | null;
  duracion_minutos: number | null;
  es_ges: number | null;
  es_cronica: number | null;
  proximo_control: string | null;
  id_cita: number | null;

  uuid_global: string | null;
  paciente_documento_tipo: string | null;
  paciente_documento_pais: string | null;
  paciente_rut: string | null;
  paciente_pasaporte: string | null;
  paciente_nhc: string | null;
  paciente_documento_numero: string | null;

  nombre: string;
  segundo_nombre: string | null;
  apellido_paterno: string;
  apellido_materno: string | null;
  nombre_preferido: string | null;
  fecha_nacimiento: string | null;
  genero: string | null;
  email: string | null;
  email_verificado: number | null;
  telefono: string | null;
  telefono_verificado: number | null;
  celular: string | null;
  celular_verificado: number | null;
  prevision_salud: string | null;
  grupo_sanguineo: string | null;
  clasificacion_riesgo: string | null;
  estado: string | null;
  pais: string | null;

  medico_nombre: string;
  medico_especialidad: string | null;
  centro_nombre: string;
  sucursal_nombre: string | null;
}

interface CentroRow extends RowDataPacket { id_centro: number; nombre: string; }
interface SucursalRow extends RowDataPacket { id_sucursal: number; id_centro: number; nombre: string; }
interface EspecialidadRow extends RowDataPacket { id_especialidad: number; nombre: string; }
interface MedicoRow extends RowDataPacket {
  id_medico: number; id_centro: number;
  nombre: string; apellido_paterno: string; apm: string;
}
interface PacienteRow extends RowDataPacket {
  id_paciente: number; rut: string | null;
  nombre: string; apellido_paterno: string; apm: string;
}
interface TipoAtencionRow extends RowDataPacket { codigo: string; nombre: string; }

/* ===================== GET: Listado + Opciones ===================== */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    // Paginación
    const pagina = Math.max(
      1,
      toInt(searchParams.get("pagina") ?? searchParams.get("page") ?? 1)
    );
    const pageSize = Math.min(
      100,
      Math.max(1, toInt(searchParams.get("pageSize") ?? 20))
    );
    const offset = (pagina - 1) * pageSize;

    // Búsquedas/filtros
    const search = (searchParams.get("search") ?? searchParams.get("q") ?? "").trim();

    // Estado/tipo del REGISTRO (tabla historial_clinico)
    const estado = (searchParams.get("estado") ?? "").trim();           // hc.estado_registro
    const tipoDocumento = (searchParams.get("tipo_documento") ?? searchParams.get("tipo") ?? "").trim(); // hc.tipo_atencion

    // Entidades
    const idPaciente = searchParams.get("id_paciente") ? Number(searchParams.get("id_paciente")) : null;
    const idMedico   = searchParams.get("id_medico")   ? Number(searchParams.get("id_medico"))   : null;
    const idCentro   = searchParams.get("id_centro")   ? Number(searchParams.get("id_centro"))   : null;

    // Rango de fechas
    const desde = (searchParams.get("desde") ?? "").trim();
    const hasta = (searchParams.get("hasta") ?? "").trim();

    // Filtros del PACIENTE (documentos)
    const docTipoPaciente =
      (searchParams.get("documento_tipo") ?? searchParams.get("doc_tipo") ?? "").trim(); // p.documento_tipo
    const docNum = (searchParams.get("documento") ?? searchParams.get("doc") ?? searchParams.get("rut") ?? "").trim();

    const where: string[] = [];
    const params: any[] = [];

    if (search) {
      where.push(`(
        p.rut LIKE ? OR p.pasaporte LIKE ? OR p.numero_historia_clinica LIKE ?
        OR p.nombre LIKE ? OR p.apellido_paterno LIKE ? OR p.apellido_materno LIKE ?
        OR hc.motivo_consulta LIKE ? OR hc.diagnostico_principal LIKE ? OR hc.codigo_cie10 LIKE ?
        OR CONCAT(musu.nombre,' ',musu.apellido_paterno,' ',IFNULL(musu.apellido_materno,'')) LIKE ?
      )`);
      params.push(
        like(search), like(search), like(search),
        like(search), like(search), like(search),
        like(search), like(search), like(search),
        like(search)
      );
    }

    if (estado)        { where.push(`hc.estado_registro = ?`); params.push(estado); }
    if (tipoDocumento) { where.push(`hc.tipo_atencion = ?`);   params.push(tipoDocumento); }
    if (idPaciente)    { where.push(`hc.id_paciente = ?`);     params.push(idPaciente); }
    if (idMedico)      { where.push(`hc.id_medico = ?`);       params.push(idMedico); }
    if (idCentro)      { where.push(`hc.id_centro = ?`);       params.push(idCentro); }
    if (desde)         { where.push(`hc.fecha_atencion >= ?`); params.push(desde); }
    if (hasta)         { where.push(`hc.fecha_atencion <= ?`); params.push(hasta); }

    if (docTipoPaciente) { where.push(`p.documento_tipo = ?`); params.push(docTipoPaciente); }
    if (docNum) {
      // Coincidencia exacta en los números reales que existen en tu tabla.
      where.push(`(p.rut = ? OR p.pasaporte = ? OR p.numero_historia_clinica = ?)`);
      params.push(docNum, docNum, docNum);
    }

    const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";

    // ---------- Conteo + Estadísticas ----------
    const countStatsSql = `
      SELECT 
        COUNT(*) AS total,
        SUM(CASE WHEN hc.estado_registro = 'firmado' THEN 1 ELSE 0 END) AS firmados,
        SUM(CASE WHEN hc.estado_registro IN ('borrador','pendiente') THEN 1 ELSE 0 END) AS borradores,
        SUM(CASE WHEN hc.estado_registro = 'archivado' THEN 1 ELSE 0 END) AS archivados,
        SUM(CASE WHEN hc.estado_registro = 'bloqueado' THEN 1 ELSE 0 END) AS bloqueados
      FROM historial_clinico hc
      JOIN pacientes p ON p.id_paciente = hc.id_paciente
      JOIN medicos md ON md.id_medico = hc.id_medico
      JOIN usuarios musu ON musu.id_usuario = md.id_usuario
      JOIN centros_medicos c ON c.id_centro = hc.id_centro
      LEFT JOIN especialidades e ON e.id_especialidad = hc.id_especialidad
      LEFT JOIN sucursales s ON s.id_sucursal = hc.id_sucursal
      ${whereSql}
    `;
    const [countRows] = await pool.query<RowDataPacket[]>(countStatsSql, params);

    const stats = {
      total: Number(countRows?.[0]?.total ?? 0),
      firmados: Number(countRows?.[0]?.firmados ?? 0),
      borradores: Number(countRows?.[0]?.borradores ?? 0),
      archivados: Number(countRows?.[0]?.archivados ?? 0),
      bloqueados: Number(countRows?.[0]?.bloqueados ?? 0),
    };

    // ---------- Data (solo columnas REALES + derivados 100% de BD) ----------
    const dataSql = `
      SELECT
        -- ====== REGISTRO (historial_clinico) ======
        hc.id_historial,
        hc.id_paciente,
        hc.id_medico,
        hc.id_centro,
        hc.id_especialidad,
        hc.id_sucursal,
        hc.id_ficha,
        hc.fecha_atencion,
        hc.motivo_consulta,
        hc.anamnesis,
        hc.examen_fisico,
        hc.diagnostico_principal,
        hc.codigo_cie10,
        hc.plan_tratamiento,
        hc.observaciones,
        hc.estado_registro,
        hc.tipo_atencion,
        hc.duracion_minutos,
        hc.es_ges,
        hc.es_cronica,
        hc.proximo_control,
        hc.id_cita,

        -- ====== PACIENTE ======
        p.uuid_global,
        p.documento_tipo                                AS paciente_documento_tipo,
        p.documento_pais_emision                        AS paciente_documento_pais,
        p.rut                                          AS paciente_rut,
        p.pasaporte                                    AS paciente_pasaporte,
        p.numero_historia_clinica                      AS paciente_nhc,
        COALESCE(
          CASE WHEN p.documento_tipo = 'rut'      AND p.rut IS NOT NULL AND p.rut <> '' THEN p.rut END,
          CASE WHEN p.documento_tipo = 'passport' AND p.pasaporte IS NOT NULL AND p.pasaporte <> '' THEN p.pasaporte END,
          NULLIF(p.numero_historia_clinica,''),
          NULLIF(p.rut,''),
          NULLIF(p.pasaporte,'')
        ) AS paciente_documento_numero,

        p.nombre,
        p.segundo_nombre,
        p.apellido_paterno,
        p.apellido_materno,
        p.nombre_preferido,
        p.fecha_nacimiento,
        p.genero,
        p.email,
        p.email_verificado,
        p.telefono,
        p.telefono_verificado,
        p.celular,
        p.celular_verificado,
        p.prevision_salud,
        p.grupo_sanguineo,
        p.clasificacion_riesgo,
        p.estado,
        p.pais,

        -- ====== MÉDICO / CENTRO ======
        CONCAT(musu.nombre,' ',musu.apellido_paterno,' ',IFNULL(musu.apellido_materno,'')) AS medico_nombre,
        e.nombre AS medico_especialidad,
        c.nombre AS centro_nombre,
        s.nombre AS sucursal_nombre

      FROM historial_clinico hc
      JOIN pacientes p     ON p.id_paciente = hc.id_paciente
      JOIN medicos md      ON md.id_medico  = hc.id_medico
      JOIN usuarios musu   ON musu.id_usuario = md.id_usuario
      JOIN centros_medicos c ON c.id_centro = hc.id_centro
      LEFT JOIN especialidades e ON e.id_especialidad = hc.id_especialidad
      LEFT JOIN sucursales s     ON s.id_sucursal = hc.id_sucursal
      ${whereSql}
      ORDER BY hc.fecha_atencion DESC, hc.id_historial DESC
      LIMIT ? OFFSET ?
    `;
    const [rows] = await pool.query<HcRow[]>(dataSql, [...params, pageSize, offset]);

    /* ---------- Opciones para dropdowns (centros, pacientes, etc.) ---------- */
    const qPaciente = (searchParams.get("q_paciente") ?? searchParams.get("q") ?? "").trim();
    const limitPac = Math.min(5000, Math.max(50, toInt(searchParams.get("limit_pacientes") ?? 1000)));
    const paramsCentro: (string | number)[] = [];
    if (idCentro) paramsCentro.push(idCentro);

    const tiposAtencionPromise = pool
      .query<TipoAtencionRow[]>(
        `SELECT codigo, nombre FROM tipos_atencion ORDER BY nombre`
      )
      .then(([r]) => r)
      .catch(() => [] as TipoAtencionRow[]);

    const [
      [centros],
      [sucursales],
      [especialidades],
      [medicos],
      [pacientes],
      tiposAtencionRows,
    ] = await Promise.all([
      pool.query<CentroRow[]>(
        `SELECT id_centro, nombre
         FROM centros_medicos
         ORDER BY nombre`
      ),
      pool.query<SucursalRow[]>(
        `SELECT id_sucursal, id_centro, nombre
         FROM sucursales
         ORDER BY nombre`
      ),
      pool.query<EspecialidadRow[]>(
        `SELECT id_especialidad, nombre
         FROM especialidades
         ORDER BY nombre`
      ),
      pool.query<MedicoRow[]>(
        `SELECT m.id_medico, m.id_centro,
                u.nombre, u.apellido_paterno, IFNULL(u.apellido_materno,'') AS apm
         FROM medicos m
         JOIN usuarios u ON u.id_usuario = m.id_usuario
         ${idCentro ? "WHERE m.id_centro = ?" : ""}
         ORDER BY u.nombre, u.apellido_paterno`,
        paramsCentro
      ),
      pool.query<PacienteRow[]>(
        `SELECT p.id_paciente, p.rut, p.nombre, p.apellido_paterno, IFNULL(p.apellido_materno,'') AS apm
         FROM pacientes p
         ${qPaciente ? "WHERE (p.rut LIKE ? OR p.nombre LIKE ? OR p.apellido_paterno LIKE ? OR p.apellido_materno LIKE ?)" : ""}
         ORDER BY p.nombre, p.apellido_paterno
         LIMIT ?`,
        qPaciente
          ? [like(qPaciente), like(qPaciente), like(qPaciente), like(qPaciente), limitPac]
          : [limitPac]
      ),
      tiposAtencionPromise,
    ]);

    const opCentros = (centros as CentroRow[]).map(c => ({
      value: c.id_centro, label: c.nombre, id_centro: c.id_centro,
    }));
    const opSucursales = (sucursales as SucursalRow[]).map(s => ({
      value: s.id_sucursal, label: s.nombre, id_centro: s.id_centro,
    }));
    const opEspecialidades = (especialidades as EspecialidadRow[]).map(e => ({
      value: e.id_especialidad, label: e.nombre,
    }));
    const opMedicos = (medicos as MedicoRow[]).map(m => ({
      value: m.id_medico,
      label: `${m.nombre} ${m.apellido_paterno} ${m.apm}`.replace(/\s+/g, " ").trim(),
      id_centro: m.id_centro,
    }));
    const opPacientes = (pacientes as PacienteRow[]).map(p => ({
      value: p.id_paciente,
      label: `${p.nombre} ${p.apellido_paterno} ${p.apm}${p.rut ? ` • ${p.rut}` : ""}`.replace(/\s+/g, " ").trim(),
      rut: p.rut,
    }));
    const opTiposAtencion =
      (tiposAtencionRows?.length ?? 0) > 0
        ? tiposAtencionRows.map(t => ({ value: t.codigo, label: t.nombre }))
        : [
            { value: "consulta", label: "Consulta" },
            { value: "control", label: "Control" },
            { value: "urgencia", label: "Urgencia" },
            { value: "procedimiento", label: "Procedimiento" },
            { value: "telemedicina", label: "Telemedicina" },
          ];

    return NextResponse.json({
      success: true,
      pagina,
      pageSize,
      total: stats.total,
      stats,
      items: rows,
      // Opciones para cargar dropdowns en la UI (centros, pacientes, etc.)
      opciones: {
        centros: opCentros,
        sucursales: opSucursales,
        especialidades: opEspecialidades,
        medicos: opMedicos,
        pacientes: opPacientes,
        tiposAtencion: opTiposAtencion,
        limitPacientes: limitPac,
      },
    });
  } catch (err: any) {
    console.error("GET /historial-clinico error:", err);
    return NextResponse.json(
      { success: false, error: err?.message ?? "Error inesperado" },
      { status: 500 }
    );
  }
}

/* ===================== POST: Crear registro (sin valores estáticos) ===================== */
export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Mapeo directo a columnas REALES de historial_clinico
    const mapped = {
      id_ficha:            toNull(body.id_ficha),
      id_paciente:         toNull(body.id_paciente),
      fecha_atencion:      toNull(body.fecha_atencion),
      id_medico:           toNull(body.id_medico),
      id_especialidad:     toNull(body.id_especialidad),
      id_centro:           toNull(body.id_centro),
      id_sucursal:         toNull(body.id_sucursal),

      motivo_consulta:         toNull(body.motivo_consulta),
      anamnesis:               toNull(body.anamnesis),
      examen_fisico:           toNull(body.examen_fisico),
      diagnostico_principal:   toNull(body.diagnostico_principal),
      codigo_cie10:            toNull(body.codigo_cie10),
      plan_tratamiento:        toNull(body.plan_tratamiento),
      observaciones:           toNull(body.observaciones),

      estado_registro: toNull(body.estado_registro),
      tipo_atencion:   toNull(body.tipo_atencion),

      duracion_minutos:  toNull(body.duracion_minutos),
      es_ges:            is01(body.es_ges),
      es_cronica:        is01(body.es_cronica),
      proximo_control:   toNull(body.proximo_control),
      id_cita:           toNull(body.id_cita),
    };

    // Requeridos mínimos coherentes
    const requeridos = ["id_paciente","fecha_atencion","id_medico","id_centro","tipo_atencion","motivo_consulta"] as const;
    const faltantes = requeridos.filter((k) => !(mapped as any)[k]);
    if (faltantes.length > 0) {
      return NextResponse.json(
        { success: false, error: `Campos requeridos faltantes: ${faltantes.join(", ")}` },
        { status: 400 }
      );
    }

    // Inserción con columnas FIJAS reales (evita 1136)
    const fields = [
      "id_ficha","id_paciente","fecha_atencion","id_medico","id_especialidad","id_centro","id_sucursal",
      "motivo_consulta","anamnesis","examen_fisico","diagnostico_principal","codigo_cie10","plan_tratamiento",
      "observaciones","estado_registro","tipo_atencion","duracion_minutos","es_ges","es_cronica","proximo_control","id_cita",
    ] as const;

    const values = fields.map((k) => toNull((mapped as any)[k]));
    const placeholders = fields.map(() => "?").join(",");

    const sql = `
      INSERT INTO historial_clinico (${fields.join(",")})
      VALUES (${placeholders})
    `;

    const [res] = await pool.query<ResultSetHeader>(sql, values);
    return NextResponse.json({
      success: true,
      id_historial: (res as ResultSetHeader).insertId,
    });
  } catch (err: any) {
    console.error("POST /historial-clinico error:", err);
    return NextResponse.json(
      { success: false, error: err?.message ?? "Error inesperado" },
      { status: 500 }
    );
  }
}
