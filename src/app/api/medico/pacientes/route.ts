// app/api/medico/pacientes/route.ts
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { RowDataPacket, ResultSetHeader } from "mysql2";

// ========================================
// TIPOS DE DATOS
// ========================================

interface MedicoData {
  id_medico: number;
  id_usuario: number;
  id_centro_principal: number;
  numero_registro_medico: string;
  titulo_profesional: string;
  especialidad_principal: string;
}

interface Paciente {
  id_paciente: number;
  rut: string;
  nombre: string;
  apellido_paterno: string;
  apellido_materno: string | null;
  nombre_completo: string;
  fecha_nacimiento: string;
  edad: number;
  genero: string;
  email: string | null;
  telefono: string | null;
  celular: string | null;
  direccion: string | null;
  ciudad: string | null;
  region: string | null;
  foto_url: string | null;
  grupo_sanguineo: string;
  estado: "activo" | "inactivo" | "bloqueado" | "fallecido";
  es_vip: boolean;
  fecha_registro: string;
  ultima_consulta: string | null;
  proxima_cita: string | null;
  total_consultas: number;
  total_citas: number;
  alergias_criticas: number;
  condiciones_cronicas: number;
  medicamentos_activos: number;
  examenes_pendientes: number;
  documentos_pendientes: number;
  clasificacion_riesgo: "bajo" | "medio" | "alto" | "critico" | null;
  imc: number | null;
  peso_kg: number | null;
  altura_cm: number | null;
  diagnostico_principal: string | null;
  notas_importantes: string | null;
  tags: string[];
}

interface EstadisticasPacientes {
  total_pacientes: number;
  pacientes_activos: number;
  pacientes_nuevos_mes: number;
  pacientes_vip: number;
  pacientes_criticos: number;
  promedio_edad: number;
  distribucion_genero: {
    masculino: number;
    femenino: number;
    otro: number;
  };
  distribucion_grupo_sanguineo: Record<string, number>;
  pacientes_con_alergias: number;
  pacientes_con_cronicas: number;
  consultas_mes: number;
  citas_programadas: number;
}

interface FiltrosPacientes {
  busqueda?: string;
  estados?: string[];
  generos?: string[];
  grupos_sanguineos?: string[];
  edad_min?: number;
  edad_max?: number;
  con_alergias?: boolean;
  con_cronicas?: boolean;
  clasificacion_riesgo?: string[];
  es_vip?: boolean;
  ciudad?: string;
  fecha_registro_desde?: string;
  fecha_registro_hasta?: string;
  ultima_consulta_desde?: string;
  ultima_consulta_hasta?: string;
}

interface PaginacionParams {
  pagina: number;
  items_por_pagina: number;
  orden_campo: "nombre" | "fecha_registro" | "ultima_consulta" | "edad" | "estado";
  orden_direccion: "asc" | "desc";
}

// ========================================
// HELPER PARA OBTENER EL TOKEN
// ========================================

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

// ========================================
// FUNCIONES AUXILIARES
// ========================================

async function obtenerMedicoAutenticado(idUsuario: number): Promise<MedicoData | null> {
  const [rows] = await pool.query<RowDataPacket[]>(
    `
      SELECT 
        m.id_medico,
        m.id_usuario,
        m.id_centro_principal,
        m.numero_registro_medico,
        m.titulo_profesional,
        m.especialidad_principal
      FROM medicos m
      WHERE m.id_usuario = ? AND m.estado = 'activo'
      LIMIT 1
      `,
    [idUsuario]
  );

  if (rows.length === 0) {
    return null;
  }

  return rows[0] as MedicoData;
}

// asigna (o reactiva) un paciente a un médico en un centro
async function asignarPacienteAMedico(idPaciente: number, idMedico: number, idCentro: number) {
  await pool.query(
    `
    INSERT INTO pacientes_medico (
      id_paciente,
      id_medico,
      id_centro,
      fecha_asignacion,
      es_principal,
      activo
    ) VALUES (?, ?, ?, CURDATE(), 1, 1)
    ON DUPLICATE KEY UPDATE
      activo = 1,
      fecha_desasignacion = NULL,
      id_centro = VALUES(id_centro)
    `,
    [idPaciente, idMedico, idCentro]
  );
}

function construirCondicionesFiltros(
  filtros: FiltrosPacientes,
  params: any[],
  idMedico: number
): string {
  const condiciones: string[] = [];

  if (filtros.busqueda?.trim()) {
    condiciones.push(`(
      p.nombre LIKE ? OR 
      p.apellido_paterno LIKE ? OR 
      p.apellido_materno LIKE ? OR 
      p.rut LIKE ? OR 
      p.email LIKE ? OR 
      p.telefono LIKE ? OR 
      p.celular LIKE ?
    )`);
    const searchTerm = `%${filtros.busqueda.trim()}%`;
    params.push(
      searchTerm,
      searchTerm,
      searchTerm,
      searchTerm,
      searchTerm,
      searchTerm,
      searchTerm
    );
  }

  if (filtros.estados && filtros.estados.length > 0) {
    const placeholders = filtros.estados.map(() => "?").join(",");
    condiciones.push(`p.estado IN (${placeholders})`);
    params.push(...filtros.estados);
  }

  if (filtros.generos && filtros.generos.length > 0) {
    const placeholders = filtros.generos.map(() => "?").join(",");
    condiciones.push(`p.genero IN (${placeholders})`);
    params.push(...filtros.generos);
  }

  if (filtros.grupos_sanguineos && filtros.grupos_sanguineos.length > 0) {
    const placeholders = filtros.grupos_sanguineos.map(() => "?").join(",");
    condiciones.push(`p.grupo_sanguineo IN (${placeholders})`);
    params.push(...filtros.grupos_sanguineos);
  }

  if (filtros.edad_min !== undefined && filtros.edad_min !== null) {
    condiciones.push(`TIMESTAMPDIFF(YEAR, p.fecha_nacimiento, CURDATE()) >= ?`);
    params.push(filtros.edad_min);
  }

  if (filtros.edad_max !== undefined && filtros.edad_max !== null) {
    condiciones.push(`TIMESTAMPDIFF(YEAR, p.fecha_nacimiento, CURDATE()) <= ?`);
    params.push(filtros.edad_max);
  }

  if (filtros.con_alergias) {
    condiciones.push(`EXISTS (
      SELECT 1 FROM alergias_pacientes ap 
      WHERE ap.id_paciente = p.id_paciente 
      AND ap.estado = 'activa'
    )`);
  }

  if (filtros.con_cronicas) {
    condiciones.push(`EXISTS (
      SELECT 1 FROM condiciones_cronicas cc 
      WHERE cc.id_paciente = p.id_paciente 
      AND cc.estado IN ('activa', 'controlada', 'en_tratamiento')
    )`);
  }

  if (filtros.clasificacion_riesgo && filtros.clasificacion_riesgo.length > 0) {
    const placeholders = filtros.clasificacion_riesgo.map(() => "?").join(",");
    condiciones.push(`p.clasificacion_riesgo IN (${placeholders})`);
    params.push(...filtros.clasificacion_riesgo);
  }

  if (filtros.es_vip !== undefined && filtros.es_vip !== null) {
    condiciones.push(`p.es_vip = ?`);
    params.push(filtros.es_vip ? 1 : 0);
  }

  if (filtros.ciudad?.trim()) {
    condiciones.push(`p.ciudad LIKE ?`);
    params.push(`%${filtros.ciudad.trim()}%`);
  }

  if (filtros.fecha_registro_desde) {
    condiciones.push(`DATE(p.fecha_registro) >= ?`);
    params.push(filtros.fecha_registro_desde);
  }

  if (filtros.fecha_registro_hasta) {
    condiciones.push(`DATE(p.fecha_registro) <= ?`);
    params.push(filtros.fecha_registro_hasta);
  }

  // filtros por última consulta
  if (filtros.ultima_consulta_desde) {
    condiciones.push(`
      EXISTS (
        SELECT 1
        FROM historial_clinico hc
        WHERE hc.id_paciente = p.id_paciente
          AND hc.id_medico = ?
          AND hc.estado_registro != 'anulado'
          AND DATE(hc.fecha_atencion) >= ?
      )
    `);
    params.push(idMedico, filtros.ultima_consulta_desde);
  }

  if (filtros.ultima_consulta_hasta) {
    condiciones.push(`
      EXISTS (
        SELECT 1
        FROM historial_clinico hc
        WHERE hc.id_paciente = p.id_paciente
          AND hc.id_medico = ?
          AND hc.estado_registro != 'anulado'
          AND DATE(hc.fecha_atencion) <= ?
      )
    `);
    params.push(idMedico, filtros.ultima_consulta_hasta);
  }

  return condiciones.length > 0 ? `AND ${condiciones.join(" AND ")}` : "";
}

async function obtenerPacientes(
  idMedico: number,
  filtros: FiltrosPacientes,
  paginacion: PaginacionParams
): Promise<{ pacientes: Paciente[]; total: number }> {
  const params: any[] = [idMedico];
  const condicionesFiltros = construirCondicionesFiltros(filtros, params, idMedico);

  const camposOrden: Record<string, string> = {
    nombre: "p.nombre, p.apellido_paterno, p.apellido_materno",
    fecha_registro: "p.fecha_registro",
    ultima_consulta: "ultima_consulta",
    edad: "edad",
    estado: "p.estado",
  };

  const ordenSQL = `${
    camposOrden[paginacion.orden_campo] || camposOrden.nombre
  } ${paginacion.orden_direccion.toUpperCase()}`;

  const queryPacientes = `
      SELECT 
        p.id_paciente,
        p.rut,
        p.nombre,
        p.apellido_paterno,
        p.apellido_materno,
        CONCAT(p.nombre, ' ', p.apellido_paterno, ' ', COALESCE(p.apellido_materno, '')) as nombre_completo,
        p.fecha_nacimiento,
        TIMESTAMPDIFF(YEAR, p.fecha_nacimiento, CURDATE()) as edad,
        p.genero,
        p.email,
        p.telefono,
        p.celular,
        p.direccion,
        p.ciudad,
        p.region,
        p.foto_url,
        p.grupo_sanguineo,
        p.estado,
        p.es_vip,
        p.fecha_registro,
        p.clasificacion_riesgo,
        p.peso_kg,
        p.altura_cm,
        p.imc,
        (
          SELECT MAX(hc.fecha_atencion)
          FROM historial_clinico hc
          WHERE hc.id_paciente = p.id_paciente
            AND hc.id_medico = ?
            AND hc.estado_registro != 'anulado'
        ) as ultima_consulta,
        (
          SELECT MIN(c.fecha_hora_inicio)
          FROM citas c
          WHERE c.id_paciente = p.id_paciente
            AND c.id_medico = ?
            AND c.fecha_hora_inicio > NOW()
            AND c.estado NOT IN ('cancelada', 'no_asistio')
        ) as proxima_cita,
        (
          SELECT COUNT(*)
          FROM historial_clinico hc
          WHERE hc.id_paciente = p.id_paciente
            AND hc.id_medico = ?
            AND hc.estado_registro != 'anulado'
        ) as total_consultas,
        (
          SELECT COUNT(*)
          FROM citas c
          WHERE c.id_paciente = p.id_paciente
            AND c.id_medico = ?
        ) as total_citas,
        (
          SELECT COUNT(*)
          FROM alergias_pacientes ap
          WHERE ap.id_paciente = p.id_paciente
            AND ap.estado = 'activa'
            AND ap.severidad IN ('severa', 'potencialmente_mortal')
        ) as alergias_criticas,
        (
          SELECT COUNT(*)
          FROM condiciones_cronicas cc
          WHERE cc.id_paciente = p.id_paciente
            AND cc.estado IN ('activa', 'controlada', 'en_tratamiento')
        ) as condiciones_cronicas,
        (
          SELECT COUNT(DISTINCT rm.id_medicamento)
          FROM receta_medicamentos rm
          INNER JOIN recetas_medicas rec ON rm.id_receta = rec.id_receta
          WHERE rec.id_paciente = p.id_paciente
            AND rec.id_medico = ?
            AND rec.estado IN ('emitida', 'dispensada')
            AND (
              rec.fecha_vencimiento IS NULL
              OR rec.fecha_vencimiento >= CURDATE()
              OR rec.es_cronica = 1
            )
        ) as medicamentos_activos,
        (
          SELECT COUNT(*)
          FROM ordenes_examenes oe
          WHERE oe.id_paciente = p.id_paciente
            AND oe.id_medico = ?
            AND oe.estado IN ('pendiente', 'en_proceso')
        ) as examenes_pendientes,
        (
          SELECT COUNT(*)
          FROM documentos_adjuntos da
          WHERE da.id_paciente = p.id_paciente
            AND da.estado = 'activo'
            AND da.es_publico = 0
        ) as documentos_pendientes,
        (
          SELECT d.diagnostico
          FROM diagnosticos d
          WHERE d.id_paciente = p.id_paciente
            AND d.id_medico = ?
            AND d.tipo = 'principal'
            AND d.estado IN ('activo', 'cronico', 'en_tratamiento')
          ORDER BY d.fecha_diagnostico DESC
          LIMIT 1
        ) as diagnostico_principal,
        p.notas_administrativas as notas_importantes,
        p.tags
      FROM pacientes p
      INNER JOIN pacientes_medico pm ON p.id_paciente = pm.id_paciente
      WHERE pm.id_medico = ?
        AND pm.activo = 1
        ${condicionesFiltros}
      ORDER BY ${ordenSQL}
      LIMIT ? OFFSET ?
    `;

  const queryTotal = `
      SELECT COUNT(*) as total
      FROM pacientes p
      INNER JOIN pacientes_medico pm ON p.id_paciente = pm.id_paciente
      WHERE pm.id_medico = ?
        AND pm.activo = 1
        ${condicionesFiltros}
    `;

  const offset = (paginacion.pagina - 1) * paginacion.items_por_pagina;

  const paramsConsulta = [
    idMedico, // ultima
    idMedico, // proxima
    idMedico, // total consultas
    idMedico, // total citas
    idMedico, // meds
    idMedico, // examenes
    idMedico, // diagnostico
    ...params,
    paginacion.items_por_pagina,
    offset,
  ];

  const [pacientesRows, totalRows] = await Promise.all([
    pool.query<RowDataPacket[]>(queryPacientes, paramsConsulta),
    pool.query<RowDataPacket[]>(queryTotal, params),
  ]);

  const pacientes = pacientesRows[0].map((row) => {
    // normalizar numéricos que MySQL puede devolver como string
    const imc =
      row.imc !== null && row.imc !== undefined && row.imc !== ""
        ? Number(row.imc)
        : null;
    const peso_kg =
      row.peso_kg !== null && row.peso_kg !== undefined && row.peso_kg !== ""
        ? Number(row.peso_kg)
        : null;
    const altura_cm =
      row.altura_cm !== null && row.altura_cm !== undefined && row.altura_cm !== ""
        ? Number(row.altura_cm)
        : null;

    return {
      id_paciente: row.id_paciente,
      rut: row.rut,
      nombre: row.nombre,
      apellido_paterno: row.apellido_paterno,
      apellido_materno: row.apellido_materno,
      nombre_completo: row.nombre_completo,
      fecha_nacimiento: row.fecha_nacimiento,
      edad: row.edad,
      genero: row.genero,
      email: row.email,
      telefono: row.telefono,
      celular: row.celular,
      direccion: row.direccion,
      ciudad: row.ciudad,
      region: row.region,
      foto_url: row.foto_url,
      grupo_sanguineo: row.grupo_sanguineo || "desconocido",
      estado: row.estado,
      es_vip: Boolean(row.es_vip),
      fecha_registro: row.fecha_registro,
      ultima_consulta: row.ultima_consulta,
      proxima_cita: row.proxima_cita,
      total_consultas: row.total_consultas || 0,
      total_citas: row.total_citas || 0,
      alergias_criticas: row.alergias_criticas || 0,
      condiciones_cronicas: row.condiciones_cronicas || 0,
      medicamentos_activos: row.medicamentos_activos || 0,
      examenes_pendientes: row.examenes_pendientes || 0,
      documentos_pendientes: row.documentos_pendientes || 0,
      clasificacion_riesgo: row.clasificacion_riesgo,
      imc,
      peso_kg,
      altura_cm,
      diagnostico_principal: row.diagnostico_principal,
      notas_importantes: row.notas_importantes,
      tags: row.tags
        ? typeof row.tags === "string"
          ? JSON.parse(row.tags)
          : row.tags
        : [],
    } as Paciente;
  });

  const total = totalRows[0][0]?.total || 0;

  return { pacientes, total };
}

async function obtenerEstadisticas(idMedico: number): Promise<EstadisticasPacientes> {
  const inicioMes = new Date(new Date().getFullYear(), new Date().getMonth(), 1)
    .toISOString()
    .split("T")[0];

  const [
    totalPacientes,
    pacientesActivos,
    pacientesNuevosMes,
    pacientesVip,
    pacientesCriticos,
    promedioEdad,
    distribucionGenero,
    distribucionGrupoSanguineo,
    pacientesConAlergias,
    pacientesConCronicas,
    consultasMes,
    citasProgramadas,
  ] = await Promise.all([
    pool.query<RowDataPacket[]>(
      `SELECT COUNT(*) as total FROM pacientes_medico 
         WHERE id_medico = ? AND activo = 1`,
      [idMedico]
    ),
    pool.query<RowDataPacket[]>(
      `SELECT COUNT(*) as total FROM pacientes p
         INNER JOIN pacientes_medico pm ON p.id_paciente = pm.id_paciente
         WHERE pm.id_medico = ? AND pm.activo = 1 AND p.estado = 'activo'`,
      [idMedico]
    ),
    pool.query<RowDataPacket[]>(
      `SELECT COUNT(*) as total FROM pacientes_medico 
         WHERE id_medico = ? AND activo = 1 AND fecha_asignacion >= ?`,
      [idMedico, inicioMes]
    ),
    pool.query<RowDataPacket[]>(
      `SELECT COUNT(*) as total FROM pacientes p
         INNER JOIN pacientes_medico pm ON p.id_paciente = pm.id_paciente
         WHERE pm.id_medico = ? AND pm.activo = 1 AND p.es_vip = 1`,
      [idMedico]
    ),
    pool.query<RowDataPacket[]>(
      `SELECT COUNT(*) as total FROM pacientes p
         INNER JOIN pacientes_medico pm ON p.id_paciente = pm.id_paciente
         WHERE pm.id_medico = ? AND pm.activo = 1 AND p.clasificacion_riesgo = 'critico'`,
      [idMedico]
    ),
    pool.query<RowDataPacket[]>(
      `SELECT AVG(TIMESTAMPDIFF(YEAR, p.fecha_nacimiento, CURDATE())) as promedio
         FROM pacientes p
         INNER JOIN pacientes_medico pm ON p.id_paciente = pm.id_paciente
         WHERE pm.id_medico = ? AND pm.activo = 1`,
      [idMedico]
    ),
    pool.query<RowDataPacket[]>(
      `SELECT 
           p.genero,
           COUNT(*) as cantidad
         FROM pacientes p
         INNER JOIN pacientes_medico pm ON p.id_paciente = pm.id_paciente
         WHERE pm.id_medico = ? AND pm.activo = 1
         GROUP BY p.genero`,
      [idMedico]
    ),
    pool.query<RowDataPacket[]>(
      `SELECT 
           p.grupo_sanguineo,
           COUNT(*) as cantidad
         FROM pacientes p
         INNER JOIN pacientes_medico pm ON p.id_paciente = pm.id_paciente
         WHERE pm.id_medico = ? AND pm.activo = 1
         GROUP BY p.grupo_sanguineo`,
      [idMedico]
    ),
    pool.query<RowDataPacket[]>(
      `SELECT COUNT(DISTINCT ap.id_paciente) as total
         FROM alergias_pacientes ap
         INNER JOIN pacientes_medico pm ON ap.id_paciente = pm.id_paciente
         WHERE pm.id_medico = ? AND pm.activo = 1 AND ap.estado = 'activa'`,
      [idMedico]
    ),
    pool.query<RowDataPacket[]>(
      `SELECT COUNT(DISTINCT cc.id_paciente) as total
         FROM condiciones_cronicas cc
         INNER JOIN pacientes_medico pm ON cc.id_paciente = pm.id_paciente
         WHERE pm.id_medico = ? AND pm.activo = 1 
         AND cc.estado IN ('activa', 'controlada', 'en_tratamiento')`,
      [idMedico]
    ),
    pool.query<RowDataPacket[]>(
      `SELECT COUNT(*) as total FROM historial_clinico 
         WHERE id_medico = ? AND fecha_atencion >= ? AND estado_registro != 'anulado'`,
      [idMedico, inicioMes]
    ),
    pool.query<RowDataPacket[]>(
      `SELECT COUNT(*) as total FROM citas 
         WHERE id_medico = ? AND estado IN ('programada', 'confirmada') 
         AND fecha_hora_inicio > NOW()`,
      [idMedico]
    ),
  ]);

  const distGenero = {
    masculino: 0,
    femenino: 0,
    otro: 0,
  };

  distribucionGenero[0].forEach((row: any) => {
    if (row.genero === "masculino") distGenero.masculino = row.cantidad;
    else if (row.genero === "femenino") distGenero.femenino = row.cantidad;
    else distGenero.otro += row.cantidad;
  });

  const distGrupoSanguineo: Record<string, number> = {};
  distribucionGrupoSanguineo[0].forEach((row: any) => {
    distGrupoSanguineo[row.grupo_sanguineo || "desconocido"] = row.cantidad;
  });

  return {
    total_pacientes: totalPacientes[0][0]?.total || 0,
    pacientes_activos: pacientesActivos[0][0]?.total || 0,
    pacientes_nuevos_mes: pacientesNuevosMes[0][0]?.total || 0,
    pacientes_vip: pacientesVip[0][0]?.total || 0,
    pacientes_criticos: pacientesCriticos[0][0]?.total || 0,
    promedio_edad: Math.round(promedioEdad[0][0]?.promedio || 0),
    distribucion_genero: distGenero,
    distribucion_grupo_sanguineo: distGrupoSanguineo,
    pacientes_con_alergias: pacientesConAlergias[0][0]?.total || 0,
    pacientes_con_cronicas: pacientesConCronicas[0][0]?.total || 0,
    consultas_mes: consultasMes[0][0]?.total || 0,
    citas_programadas: citasProgramadas[0][0]?.total || 0,
  };
}

// ========================================
// HANDLER GET
// ========================================

export async function GET(request: NextRequest) {
  try {
    const sessionToken = getSessionToken(request);

    if (!sessionToken) {
      return NextResponse.json(
        {
          success: false,
          error: "No hay sesión activa",
        },
        { status: 401 }
      );
    }

    const [sesiones] = await pool.query<RowDataPacket[]>(
      `
      SELECT su.id_usuario, u.nombre, u.apellido_paterno
      FROM sesiones_usuarios su
      INNER JOIN usuarios u ON su.id_usuario = u.id_usuario
      WHERE su.token = ?
        AND su.activa = 1
        AND su.fecha_expiracion > NOW()
        AND u.estado = 'activo'
      LIMIT 1
      `,
      [sessionToken]
    );

    if (sesiones.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Sesión inválida o expirada",
        },
        { status: 401 }
      );
    }

    const idUsuario = sesiones[0].id_usuario;
    const medico = await obtenerMedicoAutenticado(idUsuario);

    if (!medico) {
      return NextResponse.json(
        {
          success: false,
          error:
            "No tienes un registro de médico activo. Contacta al administrador.",
        },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);

    const filtros: FiltrosPacientes = {
      busqueda: searchParams.get("busqueda") || undefined,
      estados: searchParams.get("estados")?.split(",").filter(Boolean),
      generos: searchParams.get("generos")?.split(",").filter(Boolean),
      grupos_sanguineos: searchParams.get("grupos_sanguineos")?.split(",").filter(Boolean),
      edad_min: searchParams.get("edad_min")
        ? parseInt(searchParams.get("edad_min")!)
        : undefined,
      edad_max: searchParams.get("edad_max")
        ? parseInt(searchParams.get("edad_max")!)
        : undefined,
      con_alergias: searchParams.get("con_alergias")
        ? searchParams.get("con_alergias") === "true"
        : undefined,
      con_cronicas: searchParams.get("con_cronicas")
        ? searchParams.get("con_cronicas") === "true"
        : undefined,
      clasificacion_riesgo: searchParams.get("clasificacion_riesgo")?.split(",").filter(Boolean),
      es_vip: searchParams.get("es_vip") ? searchParams.get("es_vip") === "true" : undefined,
      ciudad: searchParams.get("ciudad") || undefined,
      fecha_registro_desde: searchParams.get("fecha_registro_desde") || undefined,
      fecha_registro_hasta: searchParams.get("fecha_registro_hasta") || undefined,
      ultima_consulta_desde: searchParams.get("ultima_consulta_desde") || undefined,
      ultima_consulta_hasta: searchParams.get("ultima_consulta_hasta") || undefined,
    };

    const paginacion: PaginacionParams = {
      pagina: parseInt(searchParams.get("pagina") || "1"),
      items_por_pagina: parseInt(searchParams.get("items_por_pagina") || "20"),
      orden_campo: (searchParams.get("orden_campo") || "nombre") as any,
      orden_direccion: (searchParams.get("orden_direccion") || "asc") as any,
    };

    await pool.query(`UPDATE sesiones_usuarios SET ultima_actividad = NOW() WHERE token = ?`, [
      sessionToken,
    ]);

    const [resultadoPacientes, estadisticas] = await Promise.all([
      obtenerPacientes(medico.id_medico, filtros, paginacion),
      obtenerEstadisticas(medico.id_medico),
    ]);

    return NextResponse.json(
      {
        success: true,
        pacientes: resultadoPacientes.pacientes,
        total: resultadoPacientes.total,
        pagina_actual: paginacion.pagina,
        items_por_pagina: paginacion.items_por_pagina,
        total_paginas: Math.ceil(resultadoPacientes.total / paginacion.items_por_pagina),
        estadisticas,
        filtros_aplicados: filtros,
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("❌ Error en GET /api/medico/pacientes:", error);

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
// HANDLER POST (crear paciente + asignar a médico)
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
      INNER JOIN usuarios u ON su.id_usuario = u.id_usuario
      WHERE su.token = ?
        AND su.activa = 1
        AND su.fecha_expiracion > NOW()
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
        {
          success: false,
          error:
            "No tienes un registro de médico activo. Contacta al administrador.",
        },
        { status: 403 }
      );
    }

    const body = await request.json();

    if (!body.rut || !body.nombre || !body.apellido_paterno) {
      return NextResponse.json(
        {
          success: false,
          error: "Faltan campos obligatorios (rut, nombre, apellido_paterno)",
        },
        { status: 400 }
      );
    }

    // limpiar rut (viene con puntos y guión del front)
    const rutLimpio: string = (body.rut as string).replace(/[^0-9kK]/g, "");

    try {
      // 1) intento crear el paciente nuevo
      const [insertPaciente] = await pool.query<ResultSetHeader>(
        `
        INSERT INTO pacientes (
          rut,
          nombre,
          apellido_paterno,
          apellido_materno,
          fecha_nacimiento,
          genero,
          email,
          telefono,
          celular,
          direccion,
          ciudad,
          region,
          grupo_sanguineo,
          es_vip,
          clasificacion_riesgo,
          peso_kg,
          altura_cm,
          imc,
          id_centro_registro,
          centro_principal,
          registrado_por,
          estado,
          fecha_registro,
          notas_administrativas
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'activo', NOW(), ?)
        `,
        [
          rutLimpio,
          body.nombre,
          body.apellido_paterno,
          body.apellido_materno ?? null,
          body.fecha_nacimiento ?? null,
          body.genero ?? null,
          body.email ?? null,
          body.telefono ?? null,
          body.celular ?? null,
          body.direccion ?? null,
          body.ciudad ?? null,
          body.region ?? null,
          body.grupo_sanguineo ?? "desconocido",
          body.es_vip ? 1 : 0,
          body.clasificacion_riesgo ?? null,
          body.peso_kg ?? null,
          body.altura_cm ?? null,
          body.imc ?? null,
          medico.id_centro_principal ?? null,
          medico.id_centro_principal ?? null,
          idUsuario,
          body.notas_importantes ?? null,
        ]
      );

      const nuevoIdPaciente = insertPaciente.insertId;

      // 2) lo asigno al médico
      await asignarPacienteAMedico(
        nuevoIdPaciente,
        medico.id_medico,
        medico.id_centro_principal
      );

      await pool.query(`UPDATE sesiones_usuarios SET ultima_actividad = NOW() WHERE token = ?`, [
        sessionToken,
      ]);

      return NextResponse.json(
        {
          success: true,
          id_paciente: nuevoIdPaciente,
          message: "Paciente creado y asignado al médico",
        },
        { status: 201 }
      );
    } catch (err: any) {
      if (err.code === "ER_DUP_ENTRY") {
        // 1) buscamos el paciente por rut
        const [pacRows] = await pool.query<RowDataPacket[]>(
          `SELECT id_paciente FROM pacientes WHERE rut = ? LIMIT 1`,
          [rutLimpio]
        );

        if (pacRows.length === 0) {
          return NextResponse.json(
            {
              success: false,
              error: "El RUT ya existe pero no se pudo recuperar el paciente.",
            },
            { status: 500 }
          );
        }

        const idPacienteExistente = pacRows[0].id_paciente as number;

        // 2) asignar al médico (si ya estaba, lo reactiva)
        await asignarPacienteAMedico(
          idPacienteExistente,
          medico.id_medico,
          medico.id_centro_principal
        );

        await pool.query(`UPDATE sesiones_usuarios SET ultima_actividad = NOW() WHERE token = ?`, [
          sessionToken,
        ]);

        return NextResponse.json(
          {
            success: true,
            id_paciente: idPacienteExistente,
            message: "Paciente ya existía. Se asignó/re-activó para este médico.",
          },
          { status: 200 }
        );
      }

      console.error("❌ Error al insertar paciente:", err);
      return NextResponse.json(
        {
          success: false,
          error: "Error al crear el paciente",
          details: process.env.NODE_ENV === "development" ? err.message : undefined,
        },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error("❌ Error en POST /api/medico/pacientes:", error);
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
// HANDLERS NO PERMITIDOS
// ========================================

export async function PUT() {
  return NextResponse.json(
    { success: false, error: "Método no permitido en esta ruta" },
    { status: 405 }
  );
}

export async function DELETE() {
  return NextResponse.json(
    { success: false, error: "Método no permitido en esta ruta" },
    { status: 405 }
  );
}
