// app/api/medico/recetas/[id]/anular/route.ts
import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { RowDataPacket, ResultSetHeader } from "mysql2";

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
 * Verifica si la receta puede ser anulada
 */
async function verificarRecetaAnulable(
  idReceta: number,
  idMedico: number
): Promise<{
  puede_anular: boolean;
  motivo?: string;
  receta?: any;
}> {
  try {
    const [rows] = await pool.query<RowDataPacket[]>(
      `
      SELECT 
        r.*,
        CONCAT(p.nombre, ' ', p.apellido_paterno) as paciente_nombre
      FROM recetas r
      INNER JOIN pacientes p ON r.id_paciente = p.id_paciente
      WHERE r.id_receta = ? AND r.id_medico = ?
      LIMIT 1
      `,
      [idReceta, idMedico]
    );

    if (rows.length === 0) {
      return {
        puede_anular: false,
        motivo: "Receta no encontrada o no pertenece al médico",
      };
    }

    const receta = rows[0];

    // Verificar si ya está anulada
    if (receta.estado === "anulada") {
      return {
        puede_anular: false,
        motivo: "La receta ya está anulada",
        receta,
      };
    }

    // Verificar si ya fue dispensada
    if (receta.estado === "dispensada") {
      return {
        puede_anular: false,
        motivo:
          "No se puede anular una receta que ya fue dispensada. Contacte a la farmacia.",
        receta,
      };
    }

    // Verificar si tiene medicamentos dispensados
    const [medicamentosDispensados] = await pool.query<RowDataPacket[]>(
      `
      SELECT COUNT(*) as total
      FROM medicamentos_receta
      WHERE id_receta = ? AND dispensado = 1
      `,
      [idReceta]
    );

    if (medicamentosDispensados[0].total > 0) {
      return {
        puede_anular: false,
        motivo:
          "La receta tiene medicamentos ya dispensados. No se puede anular completamente.",
        receta,
      };
    }

    // Verificar antigüedad (opcional: no permitir anular recetas muy antiguas)
    const diasDesdeEmision = Math.floor(
      (Date.now() - new Date(receta.fecha_emision).getTime()) /
        (1000 * 60 * 60 * 24)
    );

    if (diasDesdeEmision > 90) {
      return {
        puede_anular: false,
        motivo: "No se pueden anular recetas con más de 90 días de antigüedad",
        receta,
      };
    }

    return {
      puede_anular: true,
      receta,
    };
  } catch (error) {
    console.error("Error al verificar receta anulable:", error);
    throw error;
  }
}

/**
 * Anula la receta y todos sus componentes
 */
async function anularReceta(
  idReceta: number,
  idUsuario: number,
  motivoAnulacion: string,
  observaciones?: string
): Promise<void> {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    // 1. Actualizar estado de la receta
    await connection.query(
      `
      UPDATE recetas
      SET 
        estado = 'anulada',
        motivo_anulacion = ?,
        observaciones_anulacion = ?,
        fecha_anulacion = NOW(),
        anulada_por = ?
      WHERE id_receta = ?
      `,
      [motivoAnulacion, observaciones, idUsuario, idReceta]
    );

    // 2. Marcar medicamentos como anulados
    await connection.query(
      `
      UPDATE medicamentos_receta
      SET 
        estado = 'anulado',
        fecha_anulacion = NOW()
      WHERE id_receta = ? AND dispensado = 0
      `,
      [idReceta]
    );

    // 3. Registrar en auditoría
    await connection.query(
      `
      INSERT INTO auditoria_recetas (
        id_receta,
        accion,
        id_usuario,
        detalles,
        fecha_accion
      ) VALUES (?, 'ANULACION', ?, ?, NOW())
      `,
      [
        idReceta,
        idUsuario,
        `Receta anulada. Motivo: ${motivoAnulacion}. ${observaciones || ""}`,
      ]
    );

    // 4. Notificar al paciente (opcional - crear registro de notificación)
    await connection.query(
      `
      INSERT INTO notificaciones_pacientes (
        id_receta,
        tipo,
        mensaje,
        estado,
        fecha_creacion
      ) VALUES (?, 'anulacion_receta', ?, 'pendiente', NOW())
      `,
      [
        idReceta,
        `Su receta ha sido anulada por el médico. Motivo: ${motivoAnulacion}`,
      ]
    );

    await connection.commit();
  } catch (error) {
    await connection.rollback();
    console.error("Error al anular receta:", error);
    throw error;
  } finally {
    connection.release();
  }
}

// ========================================
// HANDLER POST - Anular receta
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

    // 4. Obtener datos del body
    const body = await request.json();

    const { motivo_anulacion, observaciones, confirmar = false } = body;

    // Validar motivo
    if (!motivo_anulacion || motivo_anulacion.trim().length < 10) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Debe proporcionar un motivo de anulación (mínimo 10 caracteres)",
        },
        { status: 400 }
      );
    }

    // 5. Verificar si la receta puede ser anulada
    const verificacion = await verificarRecetaAnulable(
      idReceta,
      medico.id_medico
    );

    if (!verificacion.puede_anular) {
      return NextResponse.json(
        {
          success: false,
          error: verificacion.motivo,
          puede_anular: false,
        },
        { status: 400 }
      );
    }

    // 6. Si no está confirmado, retornar información para confirmación
    if (!confirmar) {
      return NextResponse.json(
        {
          success: false,
          requiere_confirmacion: true,
          mensaje:
            "Por favor confirme la anulación de la receta. Esta acción no se puede deshacer.",
          receta: {
            numero_receta: verificacion.receta.numero_receta,
            paciente: verificacion.receta.paciente_nombre,
            fecha_emision: verificacion.receta.fecha_emision,
            diagnostico: verificacion.receta.diagnostico,
          },
          advertencia:
            "La anulación de la receta notificará al paciente y quedará registrada en el historial.",
        },
        { status: 200 }
      );
    }

    // 7. Anular la receta
    await anularReceta(
      idReceta,
      idUsuario,
      motivo_anulacion,
      observaciones
    );

    // 8. Obtener información actualizada
    const [recetaAnulada] = await pool.query<RowDataPacket[]>(
      `
      SELECT 
        r.numero_receta,
        r.estado,
        r.motivo_anulacion,
        r.fecha_anulacion,
        CONCAT(p.nombre, ' ', p.apellido_paterno) as paciente_nombre
      FROM recetas r
      INNER JOIN pacientes p ON r.id_paciente = p.id_paciente
      WHERE r.id_receta = ?
      `,
      [idReceta]
    );

    return NextResponse.json(
      {
        success: true,
        mensaje: "Receta anulada exitosamente",
        receta: recetaAnulada[0],
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("❌ Error en POST /api/medico/recetas/[id]/anular:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Error al anular la receta",
        details:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}

// ========================================
// HANDLER GET - Verificar si puede anular
// ========================================

export async function GET(
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

    // 4. Verificar si puede anular
    const verificacion = await verificarRecetaAnulable(
      idReceta,
      medico.id_medico
    );

    return NextResponse.json(
      {
        success: true,
        puede_anular: verificacion.puede_anular,
        motivo: verificacion.motivo,
        receta: verificacion.receta
          ? {
              numero_receta: verificacion.receta.numero_receta,
              estado: verificacion.receta.estado,
              fecha_emision: verificacion.receta.fecha_emision,
              paciente: verificacion.receta.paciente_nombre,
            }
          : null,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("❌ Error en GET /api/medico/recetas/[id]/anular:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Error al verificar la receta",
        details:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}
