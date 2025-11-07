// app/api/medico/recetas/route.ts
import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { RowDataPacket, ResultSetHeader } from "mysql2";
import crypto from "crypto";

// ========================================
// CONSTANTES DE TABLAS (ajustadas a tu schema)
// ========================================
const TABLE_RECETAS = "recetas_medicas";
const TABLE_MEDICAMENTOS = "receta_medicamentos";

// ========================================
// TIPOS
// ========================================

interface MedicoData {
  id_medico: number;
  id_usuario: number;
  id_centro_principal: number;
  numero_registro_medico: string;
  nombre_completo: string;
  especialidad_principal: string;
  firma_digital?: string;
}

interface EstadisticasRecetas {
  total_recetas: number;
  emitidas: number;
  dispensadas: number;
  vencidas: number;
  anuladas: number;
  total_medicamentos: number;
  medicamentos_controlados: number;
  recetas_cronicas: number;
  tasa_dispensacion: number;
  valor_total_prescrito: number;
  promedio_medicamentos_por_receta: number;
  tipos_receta: {
    simple: number;
    retenida: number;
    controlada: number;
    magistral: number;
  };
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
        m.id_centro_principal,
        m.numero_registro_medico,
        CONCAT(u.nombre, ' ', u.apellido_paterno, ' ', COALESCE(u.apellido_materno, '')) as nombre_completo,
        e.nombre as especialidad_principal,
        m.firma_digital
      FROM medicos m
      INNER JOIN usuarios u ON m.id_usuario = u.id_usuario
      LEFT JOIN especialidades e ON m.id_especialidad_principal = e.id_especialidad
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

function generarNumeroReceta(
  idMedico: number,
  idCentro: number,
  tipoReceta: string
): string {
  const fecha = new Date();
  const año = fecha.getFullYear();
  const mes = String(fecha.getMonth() + 1).padStart(2, "0");
  const dia = String(fecha.getDate()).padStart(2, "0");
  const timestamp = Date.now().toString().slice(-6);

  const prefijo = tipoReceta === "controlada" ? "RC" : "RX";
  return `${prefijo}-${año}${mes}${dia}-${idMedico}-${idCentro}-${timestamp}`;
}

function generarCodigoVerificacion(): string {
  return crypto.randomBytes(6).toString("hex").toUpperCase();
}

async function obtenerRecetas(
  idMedico: number,
  fechaInicio: string,
  fechaFin: string,
  estados?: string[],
  tipos?: string[],
  paciente?: string,
  esCronica?: boolean
): Promise<any[]> {
  try {
    let query = `
      SELECT 
        r.id_receta,
        r.numero_receta,
        r.codigo_verificacion,
        r.id_paciente,
        r.id_medico,
        r.id_centro,
        r.fecha_emision,
        r.fecha_vencimiento,
        r.tipo_receta,
        r.diagnostico,
        r.codigo_cie10,
        r.estado,
        r.es_cronica,
        r.observaciones,

        -- datos paciente
        p.id_paciente,
        p.rut AS paciente_rut,
        CONCAT(p.nombre, ' ', p.apellido_paterno, ' ', COALESCE(p.apellido_materno, '')) AS paciente_nombre_completo,
        TIMESTAMPDIFF(YEAR, p.fecha_nacimiento, CURDATE()) AS paciente_edad,
        p.genero AS paciente_genero,
        p.telefono AS paciente_telefono,
        p.email AS paciente_email,
        p.foto_url AS paciente_foto_url,
        p.prevision AS paciente_prevision,

        -- datos medico
        m.id_medico,
        m.numero_registro_medico,
        CONCAT(um.nombre, ' ', um.apellido_paterno, ' ', COALESCE(um.apellido_materno, '')) AS medico_nombre_completo,
        e.nombre AS medico_especialidad,

        -- centro
        c.id_centro,
        c.nombre AS centro_nombre,
        c.direccion AS centro_direccion,
        c.ciudad AS centro_ciudad,
        c.telefono AS centro_telefono,
        c.email AS centro_email,
        c.logo_url AS centro_logo_url,

        (SELECT COUNT(*) FROM ${TABLE_MEDICAMENTOS} WHERE id_receta = r.id_receta) AS total_medicamentos,
        (SELECT COUNT(*) FROM ${TABLE_MEDICAMENTOS} WHERE id_receta = r.id_receta AND es_controlado = 1) AS medicamentos_controlados,
        (SELECT COUNT(*) FROM ${TABLE_MEDICAMENTOS} WHERE id_receta = r.id_receta AND dispensado = 1) AS medicamentos_dispensados
      FROM ${TABLE_RECETAS} r
      INNER JOIN pacientes p ON r.id_paciente = p.id_paciente
      INNER JOIN medicos m ON r.id_medico = m.id_medico
      INNER JOIN usuarios um ON m.id_usuario = um.id_usuario
      LEFT JOIN especialidades e ON m.id_especialidad_principal = e.id_especialidad
      INNER JOIN centros_medicos c ON r.id_centro = c.id_centro
      WHERE r.id_medico = ?
        AND DATE(r.fecha_emision) BETWEEN ? AND ?
    `;

    const params: any[] = [idMedico, fechaInicio, fechaFin];

    if (estados && estados.length > 0) {
      query += ` AND r.estado IN (${estados.map(() => "?").join(",")})`;
      params.push(...estados);
    }

    if (tipos && tipos.length > 0) {
      query += ` AND r.tipo_receta IN (${tipos.map(() => "?").join(",")})`;
      params.push(...tipos);
    }

    if (paciente && paciente.trim()) {
      query += ` AND (
        CONCAT(p.nombre, ' ', p.apellido_paterno, ' ', COALESCE(p.apellido_materno, '')) LIKE ?
        OR p.rut LIKE ?
        OR p.email LIKE ?
      )`;
      const term = `%${paciente}%`;
      params.push(term, term, term);
    }

    if (esCronica !== undefined) {
      query += ` AND r.es_cronica = ?`;
      params.push(esCronica ? 1 : 0);
    }

    query += ` ORDER BY r.fecha_emision DESC`;

    const [rows] = await pool.query<RowDataPacket[]>(query, params);

    const recetas = await Promise.all(
      rows.map(async (row) => {
        const [meds] = await pool.query<RowDataPacket[]>(
          `
          SELECT
            id_receta_medicamento,
            nombre_medicamento,
            codigo_medicamento,
            dosis,
            frecuencia,
            duracion,
            cantidad,
            unidad,
            via_administracion,
            instrucciones,
            es_controlado,
            dispensado,
            fecha_dispensacion
          FROM ${TABLE_MEDICAMENTOS}
          WHERE id_receta = ?
          ORDER BY id_receta_medicamento ASC
          `,
          [row.id_receta]
        );

        return {
          id_receta: row.id_receta,
          numero_receta: row.numero_receta,
          codigo_verificacion: row.codigo_verificacion,
          fecha_emision: row.fecha_emision,
          fecha_vencimiento: row.fecha_vencimiento,
          tipo_receta: row.tipo_receta,
          diagnostico: row.diagnostico,
          codigo_cie10: row.codigo_cie10,
          estado: row.estado,
          es_cronica: row.es_cronica === 1,
          observaciones: row.observaciones,
          paciente: {
            id_paciente: row.id_paciente,
            rut: row.paciente_rut,
            nombre_completo: row.paciente_nombre_completo,
            edad: row.paciente_edad,
            genero: row.paciente_genero,
            telefono: row.paciente_telefono,
            email: row.paciente_email,
            foto_url: row.paciente_foto_url,
            prevision: row.paciente_prevision,
          },
          medico: {
            id_medico: row.id_medico,
            numero_registro_medico: row.numero_registro_medico,
            nombre_completo: row.medico_nombre_completo,
            especialidad_principal: row.medico_especialidad,
          },
          centro: {
            id_centro: row.id_centro,
            nombre: row.centro_nombre,
            direccion: row.centro_direccion,
            ciudad: row.centro_ciudad,
            telefono: row.centro_telefono,
            email: row.centro_email,
            logo_url: row.centro_logo_url,
          },
          medicamentos: meds.map((m) => ({
            id_medicamento_receta: m.id_receta_medicamento,
            nombre_medicamento: m.nombre_medicamento,
            codigo_medicamento: m.codigo_medicamento,
            dosis: m.dosis,
            frecuencia: m.frecuencia,
            duracion: m.duracion,
            cantidad: m.cantidad,
            unidad: m.unidad,
            via_administracion: m.via_administracion,
            instrucciones: m.instrucciones,
            es_controlado: m.es_controlado === 1,
            dispensado: m.dispensado === 1,
            fecha_dispensacion: m.fecha_dispensacion,
          })),
          estadisticas: {
            total_medicamentos: row.total_medicamentos,
            medicamentos_controlados: row.medicamentos_controlados,
            medicamentos_dispensados: row.medicamentos_dispensados,
          },
        };
      })
    );

    return recetas;
  } catch (error) {
    console.error("Error al obtener recetas:", error);
    throw error;
  }
}

async function calcularEstadisticas(
  idMedico: number,
  fechaInicio: string,
  fechaFin: string
): Promise<EstadisticasRecetas> {
  try {
    const [estadisticas] = await pool.query<RowDataPacket[]>(
      `
      SELECT 
        COUNT(DISTINCT r.id_receta) AS total_recetas,
        SUM(CASE WHEN r.estado = 'emitida' THEN 1 ELSE 0 END) AS emitidas,
        SUM(CASE WHEN r.estado = 'dispensada' THEN 1 ELSE 0 END) AS dispensadas,
        SUM(CASE WHEN r.estado = 'vencida' THEN 1 ELSE 0 END) AS vencidas,
        SUM(CASE WHEN r.estado = 'anulada' THEN 1 ELSE 0 END) AS anuladas,
        SUM(CASE WHEN r.es_cronica = 1 THEN 1 ELSE 0 END) AS recetas_cronicas,
        SUM(CASE WHEN r.tipo_receta = 'simple' THEN 1 ELSE 0 END) AS tipo_simple,
        SUM(CASE WHEN r.tipo_receta = 'retenida' THEN 1 ELSE 0 END) AS tipo_retenida,
        SUM(CASE WHEN r.tipo_receta = 'controlada' THEN 1 ELSE 0 END) AS tipo_controlada,
        SUM(CASE WHEN r.tipo_receta = 'magistral' THEN 1 ELSE 0 END) AS tipo_magistral,
        COUNT(mr.id_receta_medicamento) AS total_medicamentos,
        SUM(CASE WHEN mr.es_controlado = 1 THEN 1 ELSE 0 END) AS medicamentos_controlados,
        SUM(CASE WHEN mr.dispensado = 1 THEN 1 ELSE 0 END) AS medicamentos_dispensados
      FROM ${TABLE_RECETAS} r
      LEFT JOIN ${TABLE_MEDICAMENTOS} mr ON r.id_receta = mr.id_receta
      WHERE r.id_medico = ?
        AND DATE(r.fecha_emision) BETWEEN ? AND ?
      `,
      [idMedico, fechaInicio, fechaFin]
    );

    const stats = estadisticas[0];

    const tasa_dispensacion =
      stats.total_recetas > 0
        ? (stats.dispensadas / stats.total_recetas) * 100
        : 0;

    const promedio_medicamentos =
      stats.total_recetas > 0
        ? stats.total_medicamentos / stats.total_recetas
        : 0;

    return {
      total_recetas: stats.total_recetas || 0,
      emitidas: stats.emitidas || 0,
      dispensadas: stats.dispensadas || 0,
      vencidas: stats.vencidas || 0,
      anuladas: stats.anuladas || 0,
      total_medicamentos: stats.total_medicamentos || 0,
      medicamentos_controlados: stats.medicamentos_controlados || 0,
      recetas_cronicas: stats.recetas_cronicas || 0,
      tasa_dispensacion: parseFloat(tasa_dispensacion.toFixed(2)),
      // tu tabla de medicamentos no tiene precio, así que lo dejamos en 0
      valor_total_prescrito: 0,
      promedio_medicamentos_por_receta: parseFloat(
        promedio_medicamentos.toFixed(2)
      ),
      tipos_receta: {
        simple: stats.tipo_simple || 0,
        retenida: stats.tipo_retenida || 0,
        controlada: stats.tipo_controlada || 0,
        magistral: stats.tipo_magistral || 0,
      },
    };
  } catch (error) {
    console.error("Error al calcular estadísticas:", error);
    throw error;
  }
}

async function validarPaciente(idPaciente: number): Promise<boolean> {
  try {
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT id_paciente FROM pacientes WHERE id_paciente = ? AND estado = 'activo'`,
      [idPaciente]
    );
    return rows.length > 0;
  } catch (error) {
    console.error("Error al validar paciente:", error);
    throw error;
  }
}

async function registrarAuditoria(
  idReceta: number,
  accion: string,
  idUsuario: number,
  detalles?: string
): Promise<void> {
  try {
    await pool.query(
      `
      INSERT INTO auditoria_recetas (
        id_receta,
        accion,
        id_usuario,
        detalles,
        fecha_accion,
        ip_address
      ) VALUES (?, ?, ?, ?, NOW(), ?)
      `,
      [idReceta, accion, idUsuario, detalles || null, "0.0.0.0"]
    );
  } catch (error) {
    console.error("Error al registrar auditoría:", error);
  }
}

// ========================================
// GET
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
    const fechaInicio =
      searchParams.get("fecha_inicio") ||
      new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0];
    const fechaFin =
      searchParams.get("fecha_fin") || new Date().toISOString().split("T")[0];
    const estados = searchParams.get("estados")?.split(",");
    const tipos = searchParams.get("tipos")?.split(",");
    const paciente = searchParams.get("paciente") || "";
    const esCronica = searchParams.get("es_cronica")
      ? searchParams.get("es_cronica") === "true"
      : undefined;

    // actualizar actividad
    await pool.query(
      `UPDATE sesiones_usuarios SET ultima_actividad = NOW() WHERE token = ?`,
      [sessionToken]
    );

    const [recetas, estadisticas] = await Promise.all([
      obtenerRecetas(
        medico.id_medico,
        fechaInicio,
        fechaFin,
        estados,
        tipos,
        paciente,
        esCronica
      ),
      calcularEstadisticas(medico.id_medico, fechaInicio, fechaFin),
    ]);

    return NextResponse.json(
      {
        success: true,
        recetas,
        estadisticas,
        filtros: {
          fecha_inicio: fechaInicio,
          fecha_fin: fechaFin,
          estados: estados || [],
          tipos: tipos || [],
          paciente: paciente || "",
          es_cronica: esCronica,
        },
        medico: {
          id_medico: medico.id_medico,
          nombre_completo: medico.nombre_completo,
          numero_registro_medico: medico.numero_registro_medico,
          especialidad_principal: medico.especialidad_principal,
        },
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("❌ Error en GET /api/medico/recetas:", error);
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
// POST - Crear nueva receta
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
      id_paciente,
      tipo_receta = "simple",
      diagnostico,
      codigo_cie10,
      fecha_vencimiento,
      es_cronica = false,
      observaciones,
      medicamentos = [],
    } = body;

    if (!id_paciente || !diagnostico || medicamentos.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Faltan datos requeridos (paciente, diagnóstico, medicamentos)",
        },
        { status: 400 }
      );
    }

    const pacienteValido = await validarPaciente(id_paciente);
    if (!pacienteValido) {
      return NextResponse.json(
        { success: false, error: "Paciente no encontrado o inactivo" },
        { status: 404 }
      );
    }

    await connection.beginTransaction();

    const numeroReceta = generarNumeroReceta(
      medico.id_medico,
      medico.id_centro_principal,
      tipo_receta
    );
    const codigoVerificacion = generarCodigoVerificacion();

    // esta es tu tabla real
    const [resultReceta] = await connection.query<ResultSetHeader>(
      `
      INSERT INTO ${TABLE_RECETAS} (
        id_centro,
        id_paciente,
        id_medico,
        tipo_receta,
        fecha_emision,
        fecha_vencimiento,
        estado,
        numero_receta,
        codigo_verificacion,
        diagnostico,
        codigo_cie10,
        es_cronica,
        observaciones
      ) VALUES (?, ?, ?, ?, NOW(), ?, 'emitida', ?, ?, ?, ?, ?, ?)
      `,
      [
        medico.id_centro_principal,
        id_paciente,
        medico.id_medico,
        tipo_receta,
        fecha_vencimiento || null,
        numeroReceta,
        codigoVerificacion,
        diagnostico,
        codigo_cie10 || null,
        es_cronica ? 1 : 0,
        observaciones || null,
      ]
    );

    const idReceta = resultReceta.insertId;

    for (const med of medicamentos) {
      await connection.query(
        `
        INSERT INTO ${TABLE_MEDICAMENTOS} (
          id_receta,
          id_medicamento,
          nombre_medicamento,
          dosis,
          frecuencia,
          duracion,
          cantidad,
          unidad,
          via_administracion,
          instrucciones,
          es_controlado,
          codigo_medicamento
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
        [
          idReceta,
          null, // si tienes id de catálogo lo pones aquí
          med.nombre_medicamento,
          med.dosis,
          med.frecuencia,
          med.duracion || null,
          med.cantidad,
          med.unidad || "unidades",
          med.via_administracion || "oral",
          med.instrucciones || null,
          med.es_controlado ? 1 : 0,
          med.codigo_medicamento || null,
        ]
      );
    }

    await registrarAuditoria(
      idReceta,
      "CREACION",
      idUsuario,
      `Receta creada con ${medicamentos.length} medicamentos`
    );

    await connection.commit();

    // traerla de nuevo para devolverla completa
    const recetasDelDia = await obtenerRecetas(
      medico.id_medico,
      new Date().toISOString().split("T")[0],
      new Date().toISOString().split("T")[0]
    );

    const recetaNueva =
      recetasDelDia.find((r) => r.id_receta === idReceta) || null;

    return NextResponse.json(
      {
        success: true,
        message: "Receta emitida exitosamente",
        receta: recetaNueva,
        id_receta: idReceta,
        numero_receta: numeroReceta,
        codigo_verificacion: codigoVerificacion,
      },
      { status: 201 }
    );
  } catch (error: any) {
    await connection.rollback();
    console.error("❌ Error en POST /api/medico/recetas:", error);
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

// ========================================
// PUT - Actualizar receta
// ========================================

export async function PUT(request: NextRequest) {
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
      id_receta,
      diagnostico,
      codigo_cie10,
      fecha_vencimiento,
      observaciones,
      medicamentos,
    } = body;

    // validar que exista y sea del médico
    const [recetaActual] = await connection.query<RowDataPacket[]>(
      `SELECT * FROM ${TABLE_RECETAS} WHERE id_receta = ? AND id_medico = ?`,
      [id_receta, medico.id_medico]
    );

    if (recetaActual.length === 0) {
      return NextResponse.json(
        { success: false, error: "Receta no encontrada" },
        { status: 404 }
      );
    }

    // solo editar emitidas
    if (recetaActual[0].estado !== "emitida") {
      return NextResponse.json(
        {
          success: false,
          error: "Solo se pueden editar recetas en estado 'emitida'",
        },
        { status: 400 }
      );
    }

    await connection.beginTransaction();

    const updates: string[] = [];
    const params: any[] = [];

    if (diagnostico !== undefined) {
      updates.push("diagnostico = ?");
      params.push(diagnostico);
    }
    if (codigo_cie10 !== undefined) {
      updates.push("codigo_cie10 = ?");
      params.push(codigo_cie10);
    }
    if (fecha_vencimiento !== undefined) {
      updates.push("fecha_vencimiento = ?");
      params.push(fecha_vencimiento);
    }
    if (observaciones !== undefined) {
      updates.push("observaciones = ?");
      params.push(observaciones);
    }

    if (updates.length > 0) {
      params.push(id_receta);
      await connection.query(
        `UPDATE ${TABLE_RECETAS} SET ${updates.join(", ")} WHERE id_receta = ?`,
        params
      );
    }

    // actualizar medicamentos
    if (medicamentos && Array.isArray(medicamentos)) {
      await connection.query(
        `DELETE FROM ${TABLE_MEDICAMENTOS} WHERE id_receta = ?`,
        [id_receta]
      );

      for (const med of medicamentos) {
        await connection.query(
          `
          INSERT INTO ${TABLE_MEDICAMENTOS} (
            id_receta,
            id_medicamento,
            nombre_medicamento,
            dosis,
            frecuencia,
            duracion,
            cantidad,
            unidad,
            via_administracion,
            instrucciones,
            es_controlado,
            codigo_medicamento
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `,
          [
            id_receta,
            null,
            med.nombre_medicamento,
            med.dosis,
            med.frecuencia,
            med.duracion || null,
            med.cantidad,
            med.unidad || "unidades",
            med.via_administracion || "oral",
            med.instrucciones || null,
            med.es_controlado ? 1 : 0,
            med.codigo_medicamento || null,
          ]
        );
      }
    }

    await registrarAuditoria(
      id_receta,
      "ACTUALIZACION",
      idUsuario,
      "Receta actualizada"
    );

    await connection.commit();

    // volver a traerla
    const recetasActualizadas = await obtenerRecetas(
      medico.id_medico,
      new Date().toISOString().split("T")[0],
      new Date().toISOString().split("T")[0]
    );

    const recetaActualizada = recetasActualizadas.find(
      (r) => r.id_receta === id_receta
    );

    return NextResponse.json(
      {
        success: true,
        message: "Receta actualizada exitosamente",
        receta: recetaActualizada,
      },
      { status: 200 }
    );
  } catch (error: any) {
    await connection.rollback();
    console.error("❌ Error en PUT /api/medico/recetas:", error);
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

// ========================================
// DELETE - Anular receta
// ========================================

export async function DELETE(request: NextRequest) {
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
    const idReceta = searchParams.get("id_receta");
    const motivo = searchParams.get("motivo") || "Anulada por el médico";

    if (!idReceta) {
      return NextResponse.json(
        { success: false, error: "ID de receta requerido" },
        { status: 400 }
      );
    }

    const [receta] = await pool.query<RowDataPacket[]>(
      `SELECT * FROM ${TABLE_RECETAS} WHERE id_receta = ? AND id_medico = ?`,
      [idReceta, medico.id_medico]
    );

    if (receta.length === 0) {
      return NextResponse.json(
        { success: false, error: "Receta no encontrada" },
        { status: 404 }
      );
    }

    if (receta[0].estado === "anulada") {
      return NextResponse.json(
        { success: false, error: "La receta ya está anulada" },
        { status: 400 }
      );
    }

    if (receta[0].estado === "dispensada") {
      return NextResponse.json(
        {
          success: false,
          error: "No se puede anular una receta ya dispensada",
        },
        { status: 400 }
      );
    }

    await pool.query(
      `UPDATE ${TABLE_RECETAS} SET estado = 'anulada' WHERE id_receta = ?`,
      [idReceta]
    );

    await registrarAuditoria(
      Number(idReceta),
      "ANULACION",
      idUsuario,
      motivo
    );

    return NextResponse.json(
      { success: true, message: "Receta anulada exitosamente" },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("❌ Error en DELETE /api/medico/recetas:", error);
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
