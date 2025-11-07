// app/api/medico/recetas/opciones/route.ts
import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { RowDataPacket, ResultSetHeader } from "mysql2";

// ========================================
// CONSTANTES DE TABLA (para que coincidan con tu schema)
// ========================================
const TABLE_RECETAS = "recetas_medicas";
const TABLE_RECETA_MEDICAMENTOS = "receta_medicamentos";

// ========================================
// TIPOS
// ========================================

interface MedicoData {
  id_medico: number;
  id_usuario: number;
  id_centro_principal: number;
}

interface Paciente {
  id_paciente: number;
  rut: string;
  nombre_completo: string;
  edad: number;
  genero: string;
  telefono: string | null;
  email: string | null;
  foto_url: string | null;
  prevision: string;
  grupo_sanguineo: string | null;
  alergias_criticas: number;
  ultima_consulta: string | null;
  total_consultas: number;
}

interface Medicamento {
  id_medicamento: number;
  codigo_registro_isp: string;
  nombre: string;
  nombre_generico: string;
  presentacion: string;
  concentracion: string;
  laboratorio: string;
  es_controlado: boolean;
  requiere_receta: boolean;
  precio_referencia: number | null;
  stock_disponible: number | null;
  categoria: string;
  via_administracion_sugerida: string;
}

interface DiagnosticoCIE10 {
  id_diagnostico: number;
  codigo: string;
  descripcion: string;
  categoria: string;
  subcategoria: string | null;
  uso_frecuente: boolean;
}

interface Especialidad {
  id_especialidad: number;
  nombre: string;
  codigo: string;
  descripcion: string | null;
}

interface CentroMedico {
  id_centro: number;
  nombre: string;
  direccion: string;
  ciudad: string;
  telefono: string;
  email: string;
  logo_url: string | null;
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

async function obtenerMedicoAutenticado(
  idUsuario: number
): Promise<MedicoData | null> {
  try {
    const [rows] = await pool.query<RowDataPacket[]>(
      `
      SELECT 
        m.id_medico,
        m.id_usuario,
        m.id_centro_principal
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
  } catch (error) {
    console.error("Error al obtener médico:", error);
    throw error;
  }
}

/**
 * Pacientes del médico (por citas)
 */
async function obtenerPacientes(
  idMedico: number,
  busqueda?: string,
  limite: number = 50
): Promise<Paciente[]> {
  try {
    let query = `
      SELECT DISTINCT
        p.id_paciente,
        p.rut,
        CONCAT(p.nombre, ' ', p.apellido_paterno, ' ', COALESCE(p.apellido_materno, '')) AS nombre_completo,
        TIMESTAMPDIFF(YEAR, p.fecha_nacimiento, CURDATE()) AS edad,
        p.genero,
        p.telefono,
        p.email,
        p.foto_url,
        p.prevision,
        p.grupo_sanguineo,
        (
          SELECT COUNT(*)
          FROM alergias
          WHERE id_paciente = p.id_paciente
            AND estado = 'activa'
            AND severidad IN ('severa', 'fatal')
        ) AS alergias_criticas,
        (
          SELECT MAX(fecha_hora_inicio)
          FROM citas
          WHERE id_paciente = p.id_paciente
            AND id_medico = ?
            AND estado = 'completada'
        ) AS ultima_consulta,
        (
          SELECT COUNT(*)
          FROM citas
          WHERE id_paciente = p.id_paciente
            AND id_medico = ?
            AND estado = 'completada'
        ) AS total_consultas
      FROM pacientes p
      INNER JOIN citas c ON p.id_paciente = c.id_paciente
      WHERE c.id_medico = ?
        AND p.estado = 'activo'
    `;

    const params: any[] = [idMedico, idMedico, idMedico];

    if (busqueda && busqueda.trim()) {
      query += ` AND (
        CONCAT(p.nombre, ' ', p.apellido_paterno, ' ', COALESCE(p.apellido_materno, '')) LIKE ?
        OR p.rut LIKE ?
        OR p.email LIKE ?
        OR p.telefono LIKE ?
      )`;
      const searchTerm = `%${busqueda}%`;
      params.push(searchTerm, searchTerm, searchTerm, searchTerm);
    }

    query += ` ORDER BY nombre_completo ASC LIMIT ?`;
    params.push(limite);

    const [rows] = await pool.query<RowDataPacket[]>(query, params);

    return rows.map((row) => ({
      id_paciente: row.id_paciente,
      rut: row.rut,
      nombre_completo: row.nombre_completo,
      edad: row.edad,
      genero: row.genero,
      telefono: row.telefono,
      email: row.email,
      foto_url: row.foto_url,
      prevision: row.prevision,
      grupo_sanguineo: row.grupo_sanguineo,
      alergias_criticas: row.alergias_criticas,
      ultima_consulta: row.ultima_consulta,
      total_consultas: row.total_consultas,
    }));
  } catch (error) {
    console.error("Error al obtener pacientes:", error);
    throw error;
  }
}

/**
 * Catálogo de medicamentos
 */
async function obtenerMedicamentos(
  busqueda?: string,
  soloControlados?: boolean,
  categoria?: string,
  limite: number = 100
): Promise<Medicamento[]> {
  try {
    let query = `
      SELECT 
        m.id_medicamento,
        m.codigo_registro_isp,
        m.nombre,
        m.nombre_generico,
        m.presentacion,
        m.concentracion,
        m.laboratorio,
        m.es_controlado,
        m.requiere_receta,
        m.precio_referencia,
        m.stock_disponible,
        m.categoria,
        m.via_administracion_sugerida,
        m.uso_frecuente
      FROM medicamentos m
      WHERE m.estado = 'activo'
    `;

    const params: any[] = [];

    if (busqueda && busqueda.trim()) {
      query += ` AND (
        m.nombre LIKE ?
        OR m.nombre_generico LIKE ?
        OR m.laboratorio LIKE ?
        OR m.codigo_registro_isp LIKE ?
      )`;
      const searchTerm = `%${busqueda}%`;
      params.push(searchTerm, searchTerm, searchTerm, searchTerm);
    }

    if (soloControlados !== undefined) {
      query += ` AND m.es_controlado = ?`;
      params.push(soloControlados ? 1 : 0);
    }

    if (categoria) {
      query += ` AND m.categoria = ?`;
      params.push(categoria);
    }

    query += ` ORDER BY m.uso_frecuente DESC, m.nombre ASC LIMIT ?`;
    params.push(limite);

    const [rows] = await pool.query<RowDataPacket[]>(query, params);

    return rows.map((row) => ({
      id_medicamento: row.id_medicamento,
      codigo_registro_isp: row.codigo_registro_isp,
      nombre: row.nombre,
      nombre_generico: row.nombre_generico,
      presentacion: row.presentacion,
      concentracion: row.concentracion,
      laboratorio: row.laboratorio,
      es_controlado: row.es_controlado === 1,
      requiere_receta: row.requiere_receta === 1,
      precio_referencia: row.precio_referencia,
      stock_disponible: row.stock_disponible,
      categoria: row.categoria,
      via_administracion_sugerida: row.via_administracion_sugerida,
    }));
  } catch (error) {
    console.error("Error al obtener medicamentos:", error);
    throw error;
  }
}

/**
 * Diagnósticos CIE-10
 */
async function obtenerDiagnosticosCIE10(
  busqueda?: string,
  categoria?: string,
  soloFrecuentes?: boolean,
  limite: number = 100
): Promise<DiagnosticoCIE10[]> {
  try {
    let query = `
      SELECT 
        d.id_diagnostico,
        d.codigo,
        d.descripcion,
        d.categoria,
        d.subcategoria,
        d.uso_frecuente
      FROM diagnosticos_cie10 d
      WHERE d.estado = 'activo'
    `;

    const params: any[] = [];

    if (busqueda && busqueda.trim()) {
      query += ` AND (
        d.codigo LIKE ?
        OR d.descripcion LIKE ?
        OR d.categoria LIKE ?
      )`;
      const searchTerm = `%${busqueda}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }

    if (categoria) {
      query += ` AND d.categoria = ?`;
      params.push(categoria);
    }

    if (soloFrecuentes) {
      query += ` AND d.uso_frecuente = 1`;
    }

    query += ` ORDER BY d.uso_frecuente DESC, d.codigo ASC LIMIT ?`;
    params.push(limite);

    const [rows] = await pool.query<RowDataPacket[]>(query, params);

    return rows.map((row) => ({
      id_diagnostico: row.id_diagnostico,
      codigo: row.codigo,
      descripcion: row.descripcion,
      categoria: row.categoria,
      subcategoria: row.subcategoria,
      uso_frecuente: row.uso_frecuente === 1,
    }));
  } catch (error) {
    console.error("Error al obtener diagnósticos CIE-10:", error);
    throw error;
  }
}

/**
 * Especialidades (tu tabla usa `activo` en el schema)
 */
async function obtenerEspecialidades(): Promise<Especialidad[]> {
  try {
    const [rows] = await pool.query<RowDataPacket[]>(
      `
      SELECT 
        id_especialidad,
        nombre,
        codigo,
        descripcion
      FROM especialidades
      WHERE activo = 1
      ORDER BY nombre ASC
      `
    );

    return rows.map((row) => ({
      id_especialidad: row.id_especialidad,
      nombre: row.nombre,
      codigo: row.codigo,
      descripcion: row.descripcion,
    }));
  } catch (error) {
    console.error("Error al obtener especialidades:", error);
    throw error;
  }
}

/**
 * Centros del médico
 * (adaptado: no usamos medicos_centros, usamos los centros del propio médico)
 */
async function obtenerCentrosMedicos(idMedico: number): Promise<CentroMedico[]> {
  try {
    const [rows] = await pool.query<RowDataPacket[]>(
      `
      SELECT DISTINCT
        c.id_centro,
        c.nombre,
        c.direccion,
        c.ciudad,
        c.telefono,
        c.email,
        c.logo_url
      FROM medicos m
      JOIN centros_medicos c ON (
        c.id_centro = m.id_centro_principal
        OR (m.id_centro IS NOT NULL AND c.id_centro = m.id_centro)
      )
      WHERE m.id_medico = ?
        AND c.estado = 'activo'
      ORDER BY c.nombre ASC
      `,
      [idMedico]
    );

    return rows.map((row) => ({
      id_centro: row.id_centro,
      nombre: row.nombre,
      direccion: row.direccion,
      ciudad: row.ciudad,
      telefono: row.telefono,
      email: row.email,
      logo_url: row.logo_url,
    }));
  } catch (error) {
    console.error("Error al obtener centros médicos:", error);
    throw error;
  }
}

/**
 * Categorías de medicamentos
 */
async function obtenerCategoriasMedicamentos(): Promise<string[]> {
  try {
    const [rows] = await pool.query<RowDataPacket[]>(
      `
      SELECT DISTINCT categoria
      FROM medicamentos
      WHERE estado = 'activo'
        AND categoria IS NOT NULL
      ORDER BY categoria ASC
      `
    );

    return rows.map((row) => row.categoria);
  } catch (error) {
    console.error("Error al obtener categorías de medicamentos:", error);
    throw error;
  }
}

/**
 * Categorías de diagnósticos
 */
async function obtenerCategoriasDiagnosticos(): Promise<string[]> {
  try {
    const [rows] = await pool.query<RowDataPacket[]>(
      `
      SELECT DISTINCT categoria
      FROM diagnosticos_cie10
      WHERE estado = 'activo'
        AND categoria IS NOT NULL
      ORDER BY categoria ASC
      `
    );

    return rows.map((row) => row.categoria);
  } catch (error) {
    console.error("Error al obtener categorías de diagnósticos:", error);
    throw error;
  }
}

function obtenerViasAdministracion(): Array<{ value: string; label: string }> {
  return [
    { value: "oral", label: "Oral" },
    { value: "sublingual", label: "Sublingual" },
    { value: "intravenosa", label: "Intravenosa (IV)" },
    { value: "intramuscular", label: "Intramuscular (IM)" },
    { value: "subcutanea", label: "Subcutánea (SC)" },
    { value: "topica", label: "Tópica" },
    { value: "oftalmica", label: "Oftálmica" },
    { value: "otica", label: "Ótica" },
    { value: "nasal", label: "Nasal" },
    { value: "inhalatoria", label: "Inhalatoria" },
    { value: "rectal", label: "Rectal" },
    { value: "vaginal", label: "Vaginal" },
    { value: "transdermica", label: "Transdérmica" },
  ];
}

function obtenerTiposReceta(): Array<{ value: string; label: string; descripcion: string }> {
  return [
    {
      value: "simple",
      label: "Receta Simple",
      descripcion: "Medicamentos de venta libre o bajo receta simple",
    },
    {
      value: "retenida",
      label: "Receta Retenida",
      descripcion: "Medicamentos que requieren retención de receta en farmacia",
    },
    {
      value: "controlada",
      label: "Receta Controlada",
      descripcion: "Medicamentos controlados (estupefacientes y psicotrópicos)",
    },
    {
      value: "magistral",
      label: "Receta Magistral",
      descripcion: "Preparaciones farmacéuticas personalizadas",
    },
  ];
}

function obtenerEstadosReceta(): Array<{ value: string; label: string; color: string }> {
  return [
    { value: "emitida", label: "Emitida", color: "#3B82F6" },
    { value: "dispensada", label: "Dispensada", color: "#10B981" },
    { value: "vencida", label: "Vencida", color: "#EF4444" },
    { value: "anulada", label: "Anulada", color: "#6B7280" },
  ];
}

function obtenerUnidadesMedida(): string[] {
  return [
    "comprimidos",
    "cápsulas",
    "tabletas",
    "ml",
    "mg",
    "g",
    "mcg",
    "unidades",
    "sobres",
    "ampollas",
    "frascos",
    "cajas",
    "gotas",
    "puff",
    "parches",
    "óvulos",
    "supositorios",
  ];
}

/**
 * Plantillas de recetas del médico
 * (dejamos los nombres de tablas como los tenías;
 * si tu esquema usa otras, hay que cambiarlos igual que hicimos con recetas)
 */
async function obtenerPlantillasRecetas(idMedico: number): Promise<any[]> {
  try {
    const [rows] = await pool.query<RowDataPacket[]>(
      `
      SELECT 
        pr.id_plantilla,
        pr.nombre,
        pr.descripcion,
        pr.tipo_receta,
        pr.diagnostico_sugerido,
        pr.codigo_cie10_sugerido,
        pr.observaciones_predeterminadas,
        pr.uso_frecuente,
        (
          SELECT COUNT(*)
          FROM plantillas_medicamentos
          WHERE id_plantilla = pr.id_plantilla
        ) AS total_medicamentos
      FROM plantillas_recetas pr
      WHERE pr.id_medico = ?
        AND pr.estado = 'activa'
      ORDER BY pr.uso_frecuente DESC, pr.nombre ASC
      `,
      [idMedico]
    );

    const plantillas = await Promise.all(
      rows.map(async (row) => {
        const [medicamentos] = await pool.query<RowDataPacket[]>(
          `
          SELECT 
            nombre_medicamento,
            dosis,
            frecuencia,
            duracion,
            cantidad,
            unidad,
            via_administracion,
            instrucciones,
            es_controlado
          FROM plantillas_medicamentos
          WHERE id_plantilla = ?
          ORDER BY orden ASC
          `,
          [row.id_plantilla]
        );

        return {
          id_plantilla: row.id_plantilla,
          nombre: row.nombre,
          descripcion: row.descripcion,
          tipo_receta: row.tipo_receta,
          diagnostico_sugerido: row.diagnostico_sugerido,
          codigo_cie10_sugerido: row.codigo_cie10_sugerido,
          observaciones_predeterminadas: row.observaciones_predeterminadas,
          uso_frecuente: row.uso_frecuente === 1,
          total_medicamentos: row.total_medicamentos,
          medicamentos: medicamentos.map((med) => ({
            nombre_medicamento: med.nombre_medicamento,
            dosis: med.dosis,
            frecuencia: med.frecuencia,
            duracion: med.duracion,
            cantidad: med.cantidad,
            unidad: med.unidad,
            via_administracion: med.via_administracion,
            instrucciones: med.instrucciones,
            es_controlado: med.es_controlado === 1,
          })),
        };
      })
    );

    return plantillas;
  } catch (error) {
    console.error("Error al obtener plantillas de recetas:", error);
    throw error;
  }
}

/**
 * Medicamentos más prescritos (ahora usando receta_medicamentos y recetas_medicas)
 */
async function obtenerMedicamentosFrecuentes(
  idMedico: number,
  limite: number = 20
): Promise<any[]> {
  try {
    const [rows] = await pool.query<RowDataPacket[]>(
      `
      SELECT 
        mr.nombre_medicamento,
        mr.dosis,
        mr.frecuencia,
        mr.duracion,
        mr.via_administracion,
        COUNT(*) AS veces_prescrito,
        MAX(r.fecha_emision) AS ultima_prescripcion
      FROM ${TABLE_RECETA_MEDICAMENTOS} mr
      INNER JOIN ${TABLE_RECETAS} r ON mr.id_receta = r.id_receta
      WHERE r.id_medico = ?
        AND r.fecha_emision >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
      GROUP BY 
        mr.nombre_medicamento,
        mr.dosis,
        mr.frecuencia,
        mr.duracion,
        mr.via_administracion
      ORDER BY veces_prescrito DESC
      LIMIT ?
      `,
      [idMedico, limite]
    );

    return rows.map((row) => ({
      nombre_medicamento: row.nombre_medicamento,
      dosis: row.dosis,
      frecuencia: row.frecuencia,
      duracion: row.duracion,
      via_administracion: row.via_administracion,
      veces_prescrito: row.veces_prescrito,
      ultima_prescripcion: row.ultima_prescripcion,
    }));
  } catch (error) {
    console.error("Error al obtener medicamentos frecuentes:", error);
    throw error;
  }
}

/**
 * Diagnósticos más usados (ahora usando recetas_medicas)
 */
async function obtenerDiagnosticosFrecuentes(
  idMedico: number,
  limite: number = 20
): Promise<any[]> {
  try {
    const [rows] = await pool.query<RowDataPacket[]>(
      `
      SELECT 
        r.diagnostico,
        r.codigo_cie10,
        COUNT(*) AS veces_diagnosticado,
        MAX(r.fecha_emision) AS ultimo_diagnostico
      FROM ${TABLE_RECETAS} r
      WHERE r.id_medico = ?
        AND r.fecha_emision >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
        AND r.diagnostico IS NOT NULL
      GROUP BY r.diagnostico, r.codigo_cie10
      ORDER BY veces_diagnosticado DESC
      LIMIT ?
      `,
      [idMedico, limite]
    );

    return rows.map((row) => ({
      diagnostico: row.diagnostico,
      codigo_cie10: row.codigo_cie10,
      veces_diagnosticado: row.veces_diagnosticado,
      ultimo_diagnostico: row.ultimo_diagnostico,
    }));
  } catch (error) {
    console.error("Error al obtener diagnósticos frecuentes:", error);
    throw error;
  }
}

// ========================================
// HANDLER GET - Obtener opciones
// ========================================

export async function GET(request: NextRequest) {
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
        { success: false, error: "No tienes un registro de médico activo" },
        { status: 403 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const tipo = searchParams.get("tipo");
    const busqueda = searchParams.get("busqueda") || "";
    const categoria = searchParams.get("categoria") || "";
    const soloControlados = searchParams.get("solo_controlados") === "true";
    const soloFrecuentes = searchParams.get("solo_frecuentes") === "true";
    const limite = parseInt(searchParams.get("limite") || "100", 10);

    await pool.query(
      `UPDATE sesiones_usuarios SET ultima_actividad = NOW() WHERE token = ?`,
      [sessionToken]
    );

    let datos: any = {};

    switch (tipo) {
      case "pacientes":
        datos.pacientes = await obtenerPacientes(
          medico.id_medico,
          busqueda,
          limite
        );
        break;

      case "medicamentos":
        datos.medicamentos = await obtenerMedicamentos(
          busqueda,
          soloControlados,
          categoria,
          limite
        );
        datos.categorias = await obtenerCategoriasMedicamentos();
        break;

      case "diagnosticos":
        datos.diagnosticos = await obtenerDiagnosticosCIE10(
          busqueda,
          categoria,
          soloFrecuentes,
          limite
        );
        datos.categorias = await obtenerCategoriasDiagnosticos();
        break;

      case "especialidades":
        datos.especialidades = await obtenerEspecialidades();
        break;

      case "centros":
        datos.centros = await obtenerCentrosMedicos(medico.id_medico);
        break;

      case "plantillas":
        datos.plantillas = await obtenerPlantillasRecetas(medico.id_medico);
        break;

      case "medicamentos_frecuentes":
        datos.medicamentos_frecuentes = await obtenerMedicamentosFrecuentes(
          medico.id_medico,
          limite
        );
        break;

      case "diagnosticos_frecuentes":
        datos.diagnosticos_frecuentes = await obtenerDiagnosticosFrecuentes(
          medico.id_medico,
          limite
        );
        break;

      case "todas":
      case "all":
        const [
          pacientes,
          medicamentos,
          diagnosticos,
          especialidades,
          centros,
          plantillas,
          medicamentosFrecuentes,
          diagnosticosFrecuentes,
          categoriasMedicamentos,
          categoriasDiagnosticos,
        ] = await Promise.all([
          obtenerPacientes(medico.id_medico, "", 50),
          obtenerMedicamentos("", false, "", 50),
          obtenerDiagnosticosCIE10("", "", true, 50),
          obtenerEspecialidades(),
          obtenerCentrosMedicos(medico.id_medico),
          obtenerPlantillasRecetas(medico.id_medico),
          obtenerMedicamentosFrecuentes(medico.id_medico, 10),
          obtenerDiagnosticosFrecuentes(medico.id_medico, 10),
          obtenerCategoriasMedicamentos(),
          obtenerCategoriasDiagnosticos(),
        ]);

        datos = {
          pacientes,
          medicamentos,
          diagnosticos,
          especialidades,
          centros,
          plantillas,
          medicamentos_frecuentes: medicamentosFrecuentes,
          diagnosticos_frecuentes: diagnosticosFrecuentes,
          categorias_medicamentos: categoriasMedicamentos,
          categorias_diagnosticos: categoriasDiagnosticos,
          vias_administracion: obtenerViasAdministracion(),
          tipos_receta: obtenerTiposReceta(),
          estados_receta: obtenerEstadosReceta(),
          unidades_medida: obtenerUnidadesMedida(),
        };
        break;

      default:
        datos = {
          vias_administracion: obtenerViasAdministracion(),
          tipos_receta: obtenerTiposReceta(),
          estados_receta: obtenerEstadosReceta(),
          unidades_medida: obtenerUnidadesMedida(),
        };
        break;
    }

    return NextResponse.json(
      {
        success: true,
        tipo: tipo || "catalogos",
        datos,
        filtros: {
          busqueda: busqueda || "",
          categoria: categoria || "",
          solo_controlados: soloControlados,
          solo_frecuentes: soloFrecuentes,
          limite,
        },
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("❌ Error en GET /api/medico/recetas/opciones:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Error interno del servidor",
        details:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}

// ========================================
// POST - Crear plantilla de receta
// ========================================

export async function POST(request: NextRequest) {
  const connection = await pool.getConnection();

  try {
    const sessionToken = getSessionToken(request);

    if (!sessionToken) {
      return NextResponse.json(
        { success: false, error: "No hay sesión activa" },
        { status: 401 }
      );
    }

    const [sesiones] = await connection.query<RowDataPacket[]>(
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
        { success: false, error: "No tienes un registro de médico activo" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      nombre,
      descripcion,
      tipo_receta = "simple",
      diagnostico_sugerido,
      codigo_cie10_sugerido,
      observaciones_predeterminadas,
      medicamentos = [],
    } = body;

    if (!nombre || medicamentos.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Faltan datos requeridos (nombre, medicamentos)",
        },
        { status: 400 }
      );
    }

    await connection.beginTransaction();

    // dejamos el nombre de tabla que ya tenías
    const [resultPlantilla] = await connection.query<ResultSetHeader>(
      `
      INSERT INTO plantillas_recetas (
        id_medico,
        nombre,
        descripcion,
        tipo_receta,
        diagnostico_sugerido,
        codigo_cie10_sugerido,
        observaciones_predeterminadas,
        creado_por
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        medico.id_medico,
        nombre,
        descripcion || null,
        tipo_receta,
        diagnostico_sugerido || null,
        codigo_cie10_sugerido || null,
        observaciones_predeterminadas || null,
        idUsuario,
      ]
    );

    const idPlantilla = resultPlantilla.insertId;

    for (let i = 0; i < medicamentos.length; i++) {
      const med = medicamentos[i];

      await connection.query(
        `
        INSERT INTO plantillas_medicamentos (
          id_plantilla,
          nombre_medicamento,
          dosis,
          frecuencia,
          duracion,
          cantidad,
          unidad,
          via_administracion,
          instrucciones,
          es_controlado,
          orden
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
        [
          idPlantilla,
          med.nombre_medicamento,
          med.dosis,
          med.frecuencia,
          med.duracion,
          med.cantidad,
          med.unidad || "unidades",
          med.via_administracion || "oral",
          med.instrucciones || null,
          med.es_controlado ? 1 : 0,
          i + 1,
        ]
      );
    }

    await connection.commit();

    return NextResponse.json(
      {
        success: true,
        message: "Plantilla de receta creada exitosamente",
        id_plantilla: idPlantilla,
      },
      { status: 201 }
    );
  } catch (error: any) {
    await connection.rollback();
    console.error("❌ Error en POST /api/medico/recetas/opciones:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Error interno del servidor",
        details:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 }
    );
  } finally {
    connection.release();
  }
}
