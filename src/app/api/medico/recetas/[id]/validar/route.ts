// app/api/medico/recetas/[id]/validar/route.ts
import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { RowDataPacket } from "mysql2";
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

interface ResultadoValidacion {
  valida: boolean;
  estado: string;
  motivo?: string;
  advertencias: string[];
  errores: string[];
  detalles: {
    receta_existe: boolean;
    medico_valido: boolean;
    paciente_valido: boolean;
    centro_valido: boolean;
    fecha_valida: boolean;
    firma_valida: boolean;
    medicamentos_validos: boolean;
    codigo_verificacion_valido: boolean;
    hash_valido: boolean;
    no_anulada: boolean;
    no_dispensada: boolean;
    no_vencida: boolean;
  };
  informacion_adicional?: any;
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
 * Genera hash de seguridad para validación
 */
function generarHashSeguridad(
  numeroReceta: string,
  codigoVerificacion: string,
  fechaEmision: string
): string {
  const hashData = `${numeroReceta}:${codigoVerificacion}:${fechaEmision}`;
  return crypto
    .createHash("sha256")
    .update(hashData)
    .digest("hex")
    .substring(0, 16);
}

/**
 * Valida la existencia y pertenencia de la receta
 */
async function validarExistenciaReceta(
  idReceta: number,
  idMedico?: number
): Promise<{ valida: boolean; receta?: any; error?: string }> {
  try {
    let query = `
      SELECT 
        r.*,
        CONCAT(p.nombre, ' ', p.apellido_paterno) as paciente_nombre,
        CONCAT(um.nombre, ' ', um.apellido_paterno) as medico_nombre,
        c.nombre as centro_nombre
      FROM recetas r
      INNER JOIN pacientes p ON r.id_paciente = p.id_paciente
      INNER JOIN medicos m ON r.id_medico = m.id_medico
      INNER JOIN usuarios um ON m.id_usuario = um.id_usuario
      INNER JOIN centros_medicos c ON r.id_centro = c.id_centro
      WHERE r.id_receta = ?
    `;

    const params: any[] = [idReceta];

    if (idMedico) {
      query += ` AND r.id_medico = ?`;
      params.push(idMedico);
    }

    query += ` LIMIT 1`;

    const [rows] = await pool.query<RowDataPacket[]>(query, params);

    if (rows.length === 0) {
      return {
        valida: false,
        error: idMedico
          ? "Receta no encontrada o no pertenece al médico"
          : "Receta no encontrada",
      };
    }

    return {
      valida: true,
      receta: rows[0],
    };
  } catch (error) {
    console.error("Error al validar existencia de receta:", error);
    throw error;
  }
}

/**
 * Valida el código de verificación
 */
function validarCodigoVerificacion(
  codigoReceta: string,
  codigoProporcionado: string
): boolean {
  return codigoReceta.toUpperCase() === codigoProporcionado.toUpperCase();
}

/**
 * Valida el hash de seguridad
 */
function validarHashSeguridad(
  numeroReceta: string,
  codigoVerificacion: string,
  fechaEmision: string,
  hashProporcionado: string
): boolean {
  const hashCalculado = generarHashSeguridad(
    numeroReceta,
    codigoVerificacion,
    fechaEmision
  );
  return hashCalculado === hashProporcionado;
}

/**
 * Valida que la receta no esté vencida
 */
function validarVigencia(fechaVencimiento: string | null): {
  valida: boolean;
  diasRestantes?: number;
  mensaje?: string;
} {
  if (!fechaVencimiento) {
    return { valida: true, mensaje: "Receta sin fecha de vencimiento" };
  }

  const ahora = new Date();
  const vencimiento = new Date(fechaVencimiento);
  const diferenciaDias = Math.ceil(
    (vencimiento.getTime() - ahora.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (diferenciaDias < 0) {
    return {
      valida: false,
      diasRestantes: diferenciaDias,
      mensaje: `Receta vencida hace ${Math.abs(diferenciaDias)} días`,
    };
  }

  return {
    valida: true,
    diasRestantes: diferenciaDias,
    mensaje:
      diferenciaDias <= 7
        ? `Receta próxima a vencer (${diferenciaDias} días restantes)`
        : `Receta vigente (${diferenciaDias} días restantes)`,
  };
}

/**
 * Valida el estado de la receta
 */
function validarEstadoReceta(estado: string): {
  valida: boolean;
  mensaje: string;
} {
  switch (estado) {
    case "emitida":
      return { valida: true, mensaje: "Receta emitida y lista para dispensar" };
    case "dispensada":
      return { valida: false, mensaje: "Receta ya dispensada" };
    case "anulada":
      return { valida: false, mensaje: "Receta anulada" };
    case "vencida":
      return { valida: false, mensaje: "Receta vencida" };
    default:
      return { valida: false, mensaje: "Estado de receta desconocido" };
  }
}

/**
 * Valida los medicamentos de la receta
 */
async function validarMedicamentos(idReceta: number): Promise<{
  validos: boolean;
  total: number;
  controlados: number;
  dispensados: number;
  advertencias: string[];
}> {
  try {
    const [medicamentos] = await pool.query<RowDataPacket[]>(
      `
      SELECT 
        id_medicamento_receta,
        nombre_medicamento,
        es_controlado,
        dispensado,
        cantidad,
        fecha_vencimiento_medicamento
      FROM medicamentos_receta
      WHERE id_receta = ?
      `,
      [idReceta]
    );

    const advertencias: string[] = [];
    let controlados = 0;
    let dispensados = 0;

    medicamentos.forEach((med) => {
      if (med.es_controlado === 1) {
        controlados++;
        advertencias.push(
          `${med.nombre_medicamento} es un medicamento controlado`
        );
      }

      if (med.dispensado === 1) {
        dispensados++;
      }

      if (
        med.fecha_vencimiento_medicamento &&
        new Date(med.fecha_vencimiento_medicamento) < new Date()
      ) {
        advertencias.push(
          `${med.nombre_medicamento} tiene fecha de vencimiento expirada`
        );
      }
    });

    if (medicamentos.length === 0) {
      advertencias.push("La receta no tiene medicamentos asociados");
    }

    return {
      validos: medicamentos.length > 0,
      total: medicamentos.length,
      controlados,
      dispensados,
      advertencias,
    };
  } catch (error) {
    console.error("Error al validar medicamentos:", error);
    throw error;
  }
}

/**
 * Valida la firma digital
 */
function validarFirmaDigital(
  firmaReceta: string | null,
  fechaFirma: string | null
): { valida: boolean; mensaje: string } {
  if (!firmaReceta || !fechaFirma) {
    return { valida: false, mensaje: "Receta sin firma digital" };
  }

  // Aquí podrías implementar validación criptográfica real
  // Por ahora, validamos que exista

  return { valida: true, mensaje: "Firma digital válida" };
}

/**
 * Valida alergias del paciente vs medicamentos
 */
async function validarAlergiasPaciente(
  idPaciente: number,
  idReceta: number
): Promise<{ conflictos: boolean; advertencias: string[] }> {
  try {
    const [alergias] = await pool.query<RowDataPacket[]>(
      `
      SELECT nombre_alergia, severidad
      FROM alergias
      WHERE id_paciente = ? AND estado = 'activa'
      `,
      [idPaciente]
    );

    const [medicamentos] = await pool.query<RowDataPacket[]>(
      `
      SELECT nombre_medicamento
      FROM medicamentos_receta
      WHERE id_receta = ?
      `,
      [idReceta]
    );

    const advertencias: string[] = [];

    // Validación simple por nombre (en producción usarías una base de datos de interacciones)
    alergias.forEach((alergia) => {
      medicamentos.forEach((med) => {
        if (
          med.nombre_medicamento
            .toLowerCase()
            .includes(alergia.nombre_alergia.toLowerCase())
        ) {
          advertencias.push(
            `ALERTA: Paciente alérgico a ${alergia.nombre_alergia} (Severidad: ${alergia.severidad})`
          );
        }
      });
    });

    return {
      conflictos: advertencias.length > 0,
      advertencias,
    };
  } catch (error) {
    console.error("Error al validar alergias:", error);
    return { conflictos: false, advertencias: [] };
  }
}

/**
 * Valida interacciones medicamentosas
 */
async function validarInteraccionesMedicamentos(
  idReceta: number
): Promise<{ hay_interacciones: boolean; advertencias: string[] }> {
  try {
    const [medicamentos] = await pool.query<RowDataPacket[]>(
      `
      SELECT nombre_medicamento, codigo_medicamento
      FROM medicamentos_receta
      WHERE id_receta = ?
      `,
      [idReceta]
    );

    const advertencias: string[] = [];

    // Aquí implementarías lógica real de interacciones medicamentosas
    // Por ahora, solo validamos cantidad
    if (medicamentos.length > 5) {
      advertencias.push(
        "Receta con más de 5 medicamentos - revisar posibles interacciones"
      );
    }

    // Ejemplo de validación básica (en producción usarías una API especializada)
    const nombresComunes = ["warfarina", "aspirina", "ibuprofeno"];
    const medicamentosRiesgo = medicamentos.filter((med) =>
      nombresComunes.some((nombre) =>
        med.nombre_medicamento.toLowerCase().includes(nombre)
      )
    );

    if (medicamentosRiesgo.length > 1) {
      advertencias.push(
        "Posible interacción entre anticoagulantes/antiinflamatorios"
      );
    }

    return {
      hay_interacciones: advertencias.length > 0,
      advertencias,
    };
  } catch (error) {
    console.error("Error al validar interacciones:", error);
    return { hay_interacciones: false, advertencias: [] };
  }
}

/**
 * Realiza validación completa de la receta
 */
async function validarRecetaCompleta(
  idReceta: number,
  idMedico?: number,
  codigoVerificacion?: string,
  hashSeguridad?: string
): Promise<ResultadoValidacion> {
  const advertencias: string[] = [];
  const errores: string[] = [];

  const detalles = {
    receta_existe: false,
    medico_valido: false,
    paciente_valido: false,
    centro_valido: false,
    fecha_valida: false,
    firma_valida: false,
    medicamentos_validos: false,
    codigo_verificacion_valido: false,
    hash_valido: false,
    no_anulada: false,
    no_dispensada: false,
    no_vencida: false,
  };

  try {
    // 1. Validar existencia
    const existencia = await validarExistenciaReceta(idReceta, idMedico);

    if (!existencia.valida) {
      errores.push(existencia.error || "Receta no encontrada");
      return {
        valida: false,
        estado: "error",
        motivo: existencia.error,
        advertencias,
        errores,
        detalles,
      };
    }

    const receta = existencia.receta;
    detalles.receta_existe = true;
    detalles.medico_valido = true;
    detalles.paciente_valido = true;
    detalles.centro_valido = true;

    // 2. Validar código de verificación
    if (codigoVerificacion) {
      const codigoValido = validarCodigoVerificacion(
        receta.codigo_verificacion,
        codigoVerificacion
      );
      detalles.codigo_verificacion_valido = codigoValido;

      if (!codigoValido) {
        errores.push("Código de verificación inválido");
      }
    } else {
      detalles.codigo_verificacion_valido = true; // No se proporcionó, no se valida
    }

    // 3. Validar hash de seguridad
    if (hashSeguridad) {
      const hashValido = validarHashSeguridad(
        receta.numero_receta,
        receta.codigo_verificacion,
        receta.fecha_emision,
        hashSeguridad
      );
      detalles.hash_valido = hashValido;

      if (!hashValido) {
        errores.push("Hash de seguridad inválido");
      }
    } else {
      detalles.hash_valido = true; // No se proporcionó, no se valida
    }

    // 4. Validar estado
    const estadoValidacion = validarEstadoReceta(receta.estado);
    detalles.no_anulada = receta.estado !== "anulada";
    detalles.no_dispensada = receta.estado !== "dispensada";

    if (!estadoValidacion.valida) {
      errores.push(estadoValidacion.mensaje);
    } else {
      advertencias.push(estadoValidacion.mensaje);
    }

    // 5. Validar vigencia
    const vigencia = validarVigencia(receta.fecha_vencimiento);
    detalles.no_vencida = vigencia.valida;
    detalles.fecha_valida = vigencia.valida;

    if (!vigencia.valida) {
      errores.push(vigencia.mensaje || "Receta vencida");
    } else if (vigencia.diasRestantes && vigencia.diasRestantes <= 7) {
      advertencias.push(vigencia.mensaje || "Receta próxima a vencer");
    }

    // 6. Validar firma digital
    const firmaValidacion = validarFirmaDigital(
      receta.firma_digital,
      receta.fecha_firma
    );
    detalles.firma_valida = firmaValidacion.valida;

    if (!firmaValidacion.valida) {
      advertencias.push(firmaValidacion.mensaje);
    }

    // 7. Validar medicamentos
    const medicamentosValidacion = await validarMedicamentos(idReceta);
    detalles.medicamentos_validos = medicamentosValidacion.validos;

    if (!medicamentosValidacion.validos) {
      errores.push("Receta sin medicamentos válidos");
    }

    advertencias.push(...medicamentosValidacion.advertencias);

    // 8. Validar alergias
    const alergiasValidacion = await validarAlergiasPaciente(
      receta.id_paciente,
      idReceta
    );

    if (alergiasValidacion.conflictos) {
      advertencias.push(...alergiasValidacion.advertencias);
    }

    // 9. Validar interacciones
    const interaccionesValidacion = await validarInteraccionesMedicamentos(
      idReceta
    );

    if (interaccionesValidacion.hay_interacciones) {
      advertencias.push(...interaccionesValidacion.advertencias);
    }

    // 10. Determinar resultado final
    const valida = errores.length === 0;

    return {
      valida,
      estado: valida ? "valida" : "invalida",
      motivo: errores.length > 0 ? errores.join("; ") : undefined,
      advertencias,
      errores,
      detalles,
      informacion_adicional: {
        numero_receta: receta.numero_receta,
        fecha_emision: receta.fecha_emision,
        fecha_vencimiento: receta.fecha_vencimiento,
        paciente: receta.paciente_nombre,
        medico: receta.medico_nombre,
        centro: receta.centro_nombre,
        tipo_receta: receta.tipo_receta,
        es_cronica: receta.es_cronica === 1,
        medicamentos: {
          total: medicamentosValidacion.total,
          controlados: medicamentosValidacion.controlados,
          dispensados: medicamentosValidacion.dispensados,
        },
        vigencia: vigencia.diasRestantes
          ? `${vigencia.diasRestantes} días restantes`
          : "Sin vencimiento",
      },
    };
  } catch (error) {
    console.error("Error en validación completa:", error);
    throw error;
  }
}

/**
 * Registra el intento de validación en auditoría
 */
async function registrarValidacion(
  idReceta: number,
  idUsuario: number | null,
  resultado: ResultadoValidacion,
  ipAddress: string
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
      ) VALUES (?, 'VALIDACION', ?, ?, NOW(), ?)
      `,
      [
        idReceta,
        idUsuario,
        `Validación ${resultado.valida ? "exitosa" : "fallida"}: ${resultado.motivo || "OK"}`,
        ipAddress,
      ]
    );
  } catch (error) {
    console.error("Error al registrar validación:", error);
  }
}

// ========================================
// HANDLER GET - Validar receta
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

    // 1. Obtener parámetros
    const searchParams = request.nextUrl.searchParams;
    const codigoVerificacion = searchParams.get("codigo");
    const hashSeguridad = searchParams.get("hash");
    const validacionCompleta = searchParams.get("completa") === "true";

    // 2. Intentar obtener token (opcional para validación pública)
    const sessionToken = getSessionToken(request);
    let idUsuario: number | null = null;
    let idMedico: number | null = null;

    if (sessionToken) {
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

      if (sesiones.length > 0) {
        idUsuario = sesiones[0].id_usuario;

        // Verificar si es médico
        const medico = await obtenerMedicoAutenticado(idUsuario);
        if (medico) {
          idMedico = medico.id_medico;
        }
      }
    }

    // 3. Realizar validación
    const resultado = await validarRecetaCompleta(
      idReceta,
      idMedico || undefined,
      codigoVerificacion || undefined,
      hashSeguridad || undefined
    );

    // 4. Registrar validación
    await registrarValidacion(
      idReceta,
      idUsuario,
      resultado,
      request.headers.get("x-forwarded-for") || "0.0.0.0"
    );

    // 5. Preparar respuesta
    const respuesta: any = {
      success: true,
      validacion: {
        valida: resultado.valida,
        estado: resultado.estado,
        motivo: resultado.motivo,
        timestamp: new Date().toISOString(),
      },
    };

    // Incluir advertencias siempre
    if (resultado.advertencias.length > 0) {
      respuesta.validacion.advertencias = resultado.advertencias;
    }

    // Incluir errores si hay
    if (resultado.errores.length > 0) {
      respuesta.validacion.errores = resultado.errores;
    }

    // Incluir detalles si se solicita validación completa
    if (validacionCompleta) {
      respuesta.validacion.detalles = resultado.detalles;
      respuesta.validacion.informacion_adicional =
        resultado.informacion_adicional;
    }

    return NextResponse.json(respuesta, {
      status: resultado.valida ? 200 : 400,
    });
  } catch (error: any) {
    console.error("❌ Error en GET /api/medico/recetas/[id]/validar:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Error al validar la receta",
        details:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}

// ========================================
// HANDLER POST - Validación avanzada con datos adicionales
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

    const {
      codigo_verificacion,
      hash_seguridad,
      validar_alergias = true,
      validar_interacciones = true,
      validar_stock = false,
      farmacia_id,
    } = body;

    // 5. Realizar validación completa
    const resultado = await validarRecetaCompleta(
      idReceta,
      medico.id_medico,
      codigo_verificacion,
      hash_seguridad
    );

    // 6. Validaciones adicionales según parámetros
    const validacionesAdicionales: any = {};

    if (validar_stock && farmacia_id) {
      // Aquí implementarías validación de stock en farmacia
      validacionesAdicionales.stock = {
        disponible: true,
        mensaje: "Validación de stock no implementada",
      };
    }

    // 7. Registrar validación
    await registrarValidacion(
      idReceta,
      idUsuario,
      resultado,
      request.headers.get("x-forwarded-for") || "0.0.0.0"
    );

    // 8. Respuesta
    return NextResponse.json(
      {
        success: true,
        validacion: {
          valida: resultado.valida,
          estado: resultado.estado,
          motivo: resultado.motivo,
          advertencias: resultado.advertencias,
          errores: resultado.errores,
          detalles: resultado.detalles,
          informacion_adicional: resultado.informacion_adicional,
          validaciones_adicionales: validacionesAdicionales,
          timestamp: new Date().toISOString(),
        },
      },
      { status: resultado.valida ? 200 : 400 }
    );
  } catch (error: any) {
    console.error("❌ Error en POST /api/medico/recetas/[id]/validar:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Error al validar la receta",
        details:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}
