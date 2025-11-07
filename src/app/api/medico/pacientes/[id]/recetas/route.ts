// frontend\src\app\api\medico\pacientes\[id]\recetas\route.ts
import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { RowDataPacket } from "mysql2";

// ========================================
// TIPOS
// ========================================

interface MedicoData {
  id_medico: number;
  id_usuario: number;
  numero_registro_medico: string;
  nombre_completo: string;
}

interface FiltrosHistorial {
  fecha_desde?: string;
  fecha_hasta?: string;
  estado?: string;
  tipo_receta?: string;
  solo_cronicas?: boolean;
  incluir_anuladas?: boolean;
  medicamento?: string;
  diagnostico?: string;
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

/**
 * Obtiene la información del médico autenticado
 */
async function obtenerMedicoAutenticado(
  idUsuario: number
): Promise<MedicoData | null> {
  try {
    const [rows] = await pool.query<RowDataPacket[]>(
      `
      SELECT 
        m.id_medico,
        m.id_usuario,
        m.numero_registro_medico,
        CONCAT(u.nombre, ' ', u.apellido_paterno, ' ', COALESCE(u.apellido_materno, '')) as nombre_completo
      FROM medicos m
      INNER JOIN usuarios u ON m.id_usuario = u.id_usuario
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
 * Verifica que el paciente existe
 */
async function verificarPaciente(idPaciente: number): Promise<any | null> {
  try {
    const [rows] = await pool.query<RowDataPacket[]>(
      `
      SELECT 
        p.*,
        CONCAT(p.nombre, ' ', p.apellido_paterno, ' ', COALESCE(p.apellido_materno, '')) as nombre_completo
      FROM pacientes p
      WHERE p.id_paciente = ? AND p.estado = 'activo'
      LIMIT 1
      `,
      [idPaciente]
    );

    return rows.length > 0 ? rows[0] : null;
  } catch (error) {
    console.error("Error al verificar paciente:", error);
    throw error;
  }
}

/**
 * Obtiene el historial de recetas del paciente
 */
async function obtenerHistorialRecetas(
  idPaciente: number,
  filtros: FiltrosHistorial,
  pagina: number = 1,
  limite: number = 20
): Promise<{
  recetas: any[];
  total: number;
  pagina: number;
  total_paginas: number;
}> {
  try {
    // Construir WHERE dinámico
    let whereConditions = ["r.id_paciente = ?"];
    let queryParams: any[] = [idPaciente];

    if (filtros.fecha_desde) {
      whereConditions.push("r.fecha_emision >= ?");
      queryParams.push(filtros.fecha_desde);
    }

    if (filtros.fecha_hasta) {
      whereConditions.push("r.fecha_emision <= ?");
      queryParams.push(filtros.fecha_hasta);
    }

    if (filtros.estado) {
      whereConditions.push("r.estado = ?");
      queryParams.push(filtros.estado);
    }

    if (filtros.tipo_receta) {
      whereConditions.push("r.tipo_receta = ?");
      queryParams.push(filtros.tipo_receta);
    }

    if (filtros.solo_cronicas) {
      whereConditions.push("r.es_cronica = 1");
    }

    if (!filtros.incluir_anuladas) {
      whereConditions.push("r.estado != 'anulada'");
    }

    if (filtros.diagnostico) {
      whereConditions.push("r.diagnostico LIKE ?");
      queryParams.push(`%${filtros.diagnostico}%`);
    }

    const whereClause = whereConditions.join(" AND ");

    // Contar total
    const [countResult] = await pool.query<RowDataPacket[]>(
      `
      SELECT COUNT(DISTINCT r.id_receta) as total
      FROM recetas r
      ${filtros.medicamento ? "INNER JOIN medicamentos_receta mr ON r.id_receta = mr.id_receta" : ""}
      WHERE ${whereClause}
      ${filtros.medicamento ? "AND mr.nombre_medicamento LIKE ?" : ""}
      `,
      filtros.medicamento
        ? [...queryParams, `%${filtros.medicamento}%`]
        : queryParams
    );

    const total = countResult[0].total;
    const totalPaginas = Math.ceil(total / limite);
    const offset = (pagina - 1) * limite;

    // Obtener recetas
    const [recetas] = await pool.query<RowDataPacket[]>(
      `
      SELECT DISTINCT
        r.id_receta,
        r.numero_receta,
        r.codigo_verificacion,
        r.tipo_receta,
        r.diagnostico,
        r.observaciones,
        r.fecha_emision,
        r.fecha_vencimiento,
        r.estado,
        r.es_cronica,
        r.recurrencia_dias,
        
        -- Médico
        CONCAT(um.nombre, ' ', um.apellido_paterno, ' ', COALESCE(um.apellido_materno, '')) as medico_nombre,
        m.numero_registro_medico,
        
        -- Centro
        c.nombre as centro_nombre,
        
        -- Estadísticas
        (SELECT COUNT(*) FROM medicamentos_receta WHERE id_receta = r.id_receta) as total_medicamentos,
        (SELECT COUNT(*) FROM medicamentos_receta WHERE id_receta = r.id_receta AND dispensado = 1) as medicamentos_dispensados,
        (SELECT COUNT(*) FROM medicamentos_receta WHERE id_receta = r.id_receta AND es_controlado = 1) as medicamentos_controlados
        
      FROM recetas r
      INNER JOIN medicos m ON r.id_medico = m.id_medico
      INNER JOIN usuarios um ON m.id_usuario = um.id_usuario
      INNER JOIN centros_medicos c ON r.id_centro = c.id_centro
      ${filtros.medicamento ? "INNER JOIN medicamentos_receta mr ON r.id_receta = mr.id_receta" : ""}
      WHERE ${whereClause}
      ${filtros.medicamento ? "AND mr.nombre_medicamento LIKE ?" : ""}
      ORDER BY r.fecha_emision DESC
      LIMIT ? OFFSET ?
      `,
      filtros.medicamento
        ? [...queryParams, `%${filtros.medicamento}%`, limite, offset]
        : [...queryParams, limite, offset]
    );

    return {
      recetas,
      total,
      pagina,
      total_paginas: totalPaginas,
    };
  } catch (error) {
    console.error("Error al obtener historial de recetas:", error);
    throw error;
  }
}

/**
 * Obtiene estadísticas del historial
 */
async function obtenerEstadisticasHistorial(
  idPaciente: number
): Promise<any> {
  try {
    const [stats] = await pool.query<RowDataPacket[]>(
      `
      SELECT 
        COUNT(*) as total_recetas,
        COUNT(CASE WHEN estado = 'emitida' THEN 1 END) as emitidas,
        COUNT(CASE WHEN estado = 'dispensada' THEN 1 END) as dispensadas,
        COUNT(CASE WHEN estado = 'anulada' THEN 1 END) as anuladas,
        COUNT(CASE WHEN es_cronica = 1 THEN 1 END) as cronicas,
        MIN(fecha_emision) as primera_receta,
        MAX(fecha_emision) as ultima_receta
      FROM recetas
      WHERE id_paciente = ?
      `,
      [idPaciente]
    );

    const [medicamentosStats] = await pool.query<RowDataPacket[]>(
      `
      SELECT 
        COUNT(DISTINCT mr.nombre_medicamento) as medicamentos_unicos,
        COUNT(*) as total_prescripciones,
        COUNT(CASE WHEN mr.es_controlado = 1 THEN 1 END) as controlados_prescritos
      FROM medicamentos_receta mr
      INNER JOIN recetas r ON mr.id_receta = r.id_receta
      WHERE r.id_paciente = ?
      `,
      [idPaciente]
    );

    const [medicamentosFrecuentes] = await pool.query<RowDataPacket[]>(
      `
      SELECT 
        mr.nombre_medicamento,
        COUNT(*) as veces_prescrito
      FROM medicamentos_receta mr
      INNER JOIN recetas r ON mr.id_receta = r.id_receta
      WHERE r.id_paciente = ?
      GROUP BY mr.nombre_medicamento
      ORDER BY veces_prescrito DESC
      LIMIT 5
      `,
      [idPaciente]
    );

    const [diagnosticosFrecuentes] = await pool.query<RowDataPacket[]>(
      `
      SELECT 
        diagnostico,
        COUNT(*) as frecuencia
      FROM recetas
      WHERE id_paciente = ? AND diagnostico IS NOT NULL
      GROUP BY diagnostico
      ORDER BY frecuencia DESC
      LIMIT 5
      `,
      [idPaciente]
    );

    return {
      resumen: {
        ...stats[0],
        ...medicamentosStats[0],
      },
      medicamentos_frecuentes: medicamentosFrecuentes,
      diagnosticos_frecuentes: diagnosticosFrecuentes,
    };
  } catch (error) {
    console.error("Error al obtener estadísticas:", error);
    throw error;
  }
}

/**
 * Obtiene línea de tiempo de recetas
 */
async function obtenerLineaTiempo(idPaciente: number): Promise<any[]> {
  try {
    const [eventos] = await pool.query<RowDataPacket[]>(
      `
      SELECT 
        'receta' as tipo_evento,
        r.id_receta as id_referencia,
        r.numero_receta,
        r.fecha_emision as fecha,
        r.estado,
        r.diagnostico as descripcion,
        CONCAT(um.nombre, ' ', um.apellido_paterno) as medico,
        c.nombre as centro
      FROM recetas r
      INNER JOIN medicos m ON r.id_medico = m.id_medico
      INNER JOIN usuarios um ON m.id_usuario = um.id_usuario
      INNER JOIN centros_medicos c ON r.id_centro = c.id_centro
      WHERE r.id_paciente = ?
      
      UNION ALL
      
      SELECT 
        'dispensacion' as tipo_evento,
        mr.id_receta as id_referencia,
        r.numero_receta,
        mr.fecha_dispensacion as fecha,
        'dispensado' as estado,
        mr.nombre_medicamento as descripcion,
        NULL as medico,
        NULL as centro
      FROM medicamentos_receta mr
      INNER JOIN recetas r ON mr.id_receta = r.id_receta
      WHERE r.id_paciente = ? AND mr.dispensado = 1
      
      ORDER BY fecha DESC
      LIMIT 50
      `,
      [idPaciente, idPaciente]
    );

    return eventos;
  } catch (error) {
    console.error("Error al obtener línea de tiempo:", error);
    throw error;
  }
}

// ========================================
// HANDLER GET - Obtener historial
// ========================================

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const idPaciente = parseInt(params.id);

    if (isNaN(idPaciente)) {
      return NextResponse.json(
        {
          success: false,
          error: "ID de paciente inválido",
        },
        { status: 400 }
      );
    }

    // 1. Obtener token
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

    // 2. Verificar sesión
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
        {
          success: false,
          error: "Sesión inválida o expirada",
        },
        { status: 401 }
      );
    }

    const idUsuario = sesiones[0].id_usuario;

    // 3. Verificar que sea médico
    const medico = await obtenerMedicoAutenticado(idUsuario);

    if (!medico) {
      return NextResponse.json(
        {
          success: false,
          error: "No tienes un registro de médico activo",
        },
        { status: 403 }
      );
    }

    // 4. Verificar que el paciente existe
    const paciente = await verificarPaciente(idPaciente);

    if (!paciente) {
      return NextResponse.json(
        {
          success: false,
          error: "Paciente no encontrado",
        },
        { status: 404 }
      );
    }

    // 5. Obtener parámetros de consulta
    const searchParams = request.nextUrl.searchParams;

    const filtros: FiltrosHistorial = {
      fecha_desde: searchParams.get("fecha_desde") || undefined,
      fecha_hasta: searchParams.get("fecha_hasta") || undefined,
      estado: searchParams.get("estado") || undefined,
      tipo_receta: searchParams.get("tipo_receta") || undefined,
      solo_cronicas: searchParams.get("solo_cronicas") === "true",
      incluir_anuladas: searchParams.get("incluir_anuladas") === "true",
      medicamento: searchParams.get("medicamento") || undefined,
      diagnostico: searchParams.get("diagnostico") || undefined,
    };

    const pagina = parseInt(searchParams.get("pagina") || "1");
    const limite = parseInt(searchParams.get("limite") || "20");
    const incluirEstadisticas = searchParams.get("estadisticas") === "true";
    const incluirLineaTiempo = searchParams.get("linea_tiempo") === "true";

    // 6. Obtener historial
    const historial = await obtenerHistorialRecetas(
      idPaciente,
      filtros,
      pagina,
      limite
    );

    // 7. Preparar respuesta
    const respuesta: any = {
      success: true,
      paciente: {
        id: paciente.id_paciente,
        nombre: paciente.nombre_completo,
        rut: paciente.rut,
        fecha_nacimiento: paciente.fecha_nacimiento,
      },
      historial: {
        recetas: historial.recetas,
        paginacion: {
          total: historial.total,
          pagina: historial.pagina,
          total_paginas: historial.total_paginas,
          limite,
        },
      },
      filtros_aplicados: filtros,
    };

    // 8. Agregar estadísticas si se solicitan
    if (incluirEstadisticas) {
      respuesta.estadisticas = await obtenerEstadisticasHistorial(idPaciente);
    }

    // 9. Agregar línea de tiempo si se solicita
    if (incluirLineaTiempo) {
      respuesta.linea_tiempo = await obtenerLineaTiempo(idPaciente);
    }

    return NextResponse.json(respuesta, { status: 200 });
  } catch (error: any) {
    console.error(
      "❌ Error en GET /api/medico/pacientes/[id]/recetas:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error: "Error al obtener el historial de recetas",
        details:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}
