// app/api/medico/recetas/[id]/duplicar/route.ts
import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { RowDataPacket, ResultSetHeader } from "mysql2";
import crypto from "crypto";

// ========================================
// TIPOS
// ========================================

interface MedicoData {
  id_medico: number;
  id_usuario: number;
  numero_registro_medico: string;
  nombre_completo: string;
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
 * Genera un nuevo número de receta único
 */
async function generarNumeroReceta(idCentro: number): Promise<string> {
  const año = new Date().getFullYear();
  const [rows] = await pool.query<RowDataPacket[]>(
    `
    SELECT COUNT(*) as total 
    FROM recetas 
    WHERE id_centro = ? AND YEAR(fecha_emision) = ?
    `,
    [idCentro, año]
  );

  const consecutivo = (rows[0].total + 1).toString().padStart(6, "0");
  return `REC-${año}-${idCentro}-${consecutivo}`;
}

/**
 * Genera código de verificación único
 */
function generarCodigoVerificacion(): string {
  return crypto.randomBytes(6).toString("hex").toUpperCase();
}

/**
 * Obtiene la receta original completa
 */
async function obtenerRecetaOriginal(
  idReceta: number,
  idMedico: number
): Promise<any | null> {
  try {
    const [recetas] = await pool.query<RowDataPacket[]>(
      `
      SELECT r.*, 
        CONCAT(p.nombre, ' ', p.apellido_paterno) as paciente_nombre
      FROM recetas r
      INNER JOIN pacientes p ON r.id_paciente = p.id_paciente
      WHERE r.id_receta = ? AND r.id_medico = ?
      LIMIT 1
      `,
      [idReceta, idMedico]
    );

    if (recetas.length === 0) {
      return null;
    }

    const receta = recetas[0];

    // Obtener medicamentos
    const [medicamentos] = await pool.query<RowDataPacket[]>(
      `
      SELECT * FROM medicamentos_receta
      WHERE id_receta = ?
      ORDER BY orden
      `,
      [idReceta]
    );

    return {
      ...receta,
      medicamentos,
    };
  } catch (error) {
    console.error("Error al obtener receta original:", error);
    throw error;
  }
}

/**
 * Duplica la receta completa
 */
async function duplicarReceta(
  recetaOriginal: any,
  idUsuario: number,
  opciones: {
    mantener_diagnostico?: boolean;
    mantener_observaciones?: boolean;
    ajustar_fechas?: boolean;
    nuevo_paciente_id?: number;
  } = {}
): Promise<number> {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const {
      mantener_diagnostico = true,
      mantener_observaciones = true,
      ajustar_fechas = true,
      nuevo_paciente_id,
    } = opciones;

    // 1. Generar nuevos identificadores
    const nuevoNumeroReceta = await generarNumeroReceta(
      recetaOriginal.id_centro
    );
    const nuevoCodigoVerificacion = generarCodigoVerificacion();

    // 2. Calcular fechas
    const fechaEmision = new Date();
    let fechaVencimiento = null;

    if (ajustar_fechas && recetaOriginal.fecha_vencimiento) {
      const diasVigencia = Math.floor(
        (new Date(recetaOriginal.fecha_vencimiento).getTime() -
          new Date(recetaOriginal.fecha_emision).getTime()) /
          (1000 * 60 * 60 * 24)
      );
      fechaVencimiento = new Date(
        fechaEmision.getTime() + diasVigencia * 24 * 60 * 60 * 1000
      );
    }

    // 3. Insertar nueva receta
    const [resultReceta] = await connection.query<ResultSetHeader>(
      `
      INSERT INTO recetas (
        numero_receta,
        codigo_verificacion,
        id_paciente,
        id_medico,
        id_centro,
        tipo_receta,
        diagnostico,
        observaciones,
        fecha_emision,
        fecha_vencimiento,
        estado,
        es_cronica,
        recurrencia_dias,
        duplicada_de,
        creada_por
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'emitida', ?, ?, ?, ?)
      `,
      [
        nuevoNumeroReceta,
        nuevoCodigoVerificacion,
        nuevo_paciente_id || recetaOriginal.id_paciente,
        recetaOriginal.id_medico,
        recetaOriginal.id_centro,
        recetaOriginal.tipo_receta,
        mantener_diagnostico ? recetaOriginal.diagnostico : null,
        mantener_observaciones ? recetaOriginal.observaciones : null,
        fechaEmision,
        fechaVencimiento,
        recetaOriginal.es_cronica,
        recetaOriginal.recurrencia_dias,
        recetaOriginal.id_receta,
        idUsuario,
      ]
    );

    const nuevaRecetaId = resultReceta.insertId;

    // 4. Duplicar medicamentos
    for (const med of recetaOriginal.medicamentos) {
      await connection.query(
        `
        INSERT INTO medicamentos_receta (
          id_receta,
          codigo_medicamento,
          nombre_medicamento,
          dosis,
          frecuencia,
          duracion,
          cantidad,
          unidad_medida,
          via_administracion,
          indicaciones,
          es_controlado,
          requiere_autorizacion,
          orden
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
        [
          nuevaRecetaId,
          med.codigo_medicamento,
          med.nombre_medicamento,
          med.dosis,
          med.frecuencia,
          med.duracion,
          med.cantidad,
          med.unidad_medida,
          med.via_administracion,
          med.indicaciones,
          med.es_controlado,
          med.requiere_autorizacion,
          med.orden,
        ]
      );
    }

    // 5. Registrar en auditoría
    await connection.query(
      `
      INSERT INTO auditoria_recetas (
        id_receta,
        accion,
        id_usuario,
        detalles,
        fecha_accion
      ) VALUES (?, 'DUPLICACION', ?, ?, NOW())
      `,
      [
        nuevaRecetaId,
        idUsuario,
        `Receta duplicada desde ${recetaOriginal.numero_receta}`,
      ]
    );

    // También registrar en la receta original
    await connection.query(
      `
      INSERT INTO auditoria_recetas (
        id_receta,
        accion,
        id_usuario,
        detalles,
        fecha_accion
      ) VALUES (?, 'DUPLICADA', ?, ?, NOW())
      `,
      [
        recetaOriginal.id_receta,
        idUsuario,
        `Receta duplicada como ${nuevoNumeroReceta}`,
      ]
    );

    await connection.commit();

    return nuevaRecetaId;
  } catch (error) {
    await connection.rollback();
    console.error("Error al duplicar receta:", error);
    throw error;
  } finally {
    connection.release();
  }
}

// ========================================
// HANDLER POST - Duplicar receta
// ========================================

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const idReceta = parseInt(params.id);

    if (isNaN(idReceta)) {
      return NextResponse.json(
        {
          success: false,
          error: "ID de receta inválido",
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

    // 4. Obtener opciones del body
    const body = await request.json();

    const {
      mantener_diagnostico = true,
      mantener_observaciones = true,
      ajustar_fechas = true,
      nuevo_paciente_id,
    } = body;

    // 5. Obtener receta original
    const recetaOriginal = await obtenerRecetaOriginal(
      idReceta,
      medico.id_medico
    );

    if (!recetaOriginal) {
      return NextResponse.json(
        {
          success: false,
          error: "Receta no encontrada o no tienes permisos para duplicarla",
        },
        { status: 404 }
      );
    }

    // 6. Verificar que la receta no esté anulada
    if (recetaOriginal.estado === "anulada") {
      return NextResponse.json(
        {
          success: false,
          error: "No se puede duplicar una receta anulada",
        },
        { status: 400 }
      );
    }

    // 7. Duplicar la receta
    const nuevaRecetaId = await duplicarReceta(recetaOriginal, idUsuario, {
      mantener_diagnostico,
      mantener_observaciones,
      ajustar_fechas,
      nuevo_paciente_id,
    });

    // 8. Obtener información de la nueva receta
    const [nuevaReceta] = await pool.query<RowDataPacket[]>(
      `
      SELECT 
        r.id_receta,
        r.numero_receta,
        r.codigo_verificacion,
        r.fecha_emision,
        r.fecha_vencimiento,
        r.estado,
        CONCAT(p.nombre, ' ', p.apellido_paterno) as paciente_nombre,
        (SELECT COUNT(*) FROM medicamentos_receta WHERE id_receta = r.id_receta) as total_medicamentos
      FROM recetas r
      INNER JOIN pacientes p ON r.id_paciente = p.id_paciente
      WHERE r.id_receta = ?
      `,
      [nuevaRecetaId]
    );

    return NextResponse.json(
      {
        success: true,
        mensaje: "Receta duplicada exitosamente",
        receta_original: {
          id: recetaOriginal.id_receta,
          numero: recetaOriginal.numero_receta,
        },
        receta_nueva: nuevaReceta[0],
        timestamp: new Date().toISOString(),
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error(
      "❌ Error en POST /api/medico/recetas/[id]/duplicar:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error: "Error al duplicar la receta",
        details:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}
