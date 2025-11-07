// app/api/medico/recetas/[id]/route.ts
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
  id_centro_principal: number;
  numero_registro_medico: string;
  nombre_completo: string;
  especialidad_principal: string;
  firma_digital?: string;
}

interface RecetaCompleta {
  // Datos básicos de la receta
  id_receta: number;
  numero_receta: string;
  codigo_verificacion: string;
  fecha_emision: string;
  fecha_vencimiento: string | null;
  tipo_receta: string;
  diagnostico: string;
  codigo_cie10: string | null;
  estado: string;
  es_cronica: boolean;
  observaciones: string | null;
  firma_digital: string | null;
  fecha_firma: string | null;
  
  // Datos del paciente
  paciente: {
    id_paciente: number;
    rut: string;
    nombre_completo: string;
    fecha_nacimiento: string;
    edad: number;
    genero: string;
    telefono: string | null;
    email: string | null;
    direccion: string | null;
    ciudad: string | null;
    foto_url: string | null;
    prevision: string;
    numero_prevision: string | null;
    grupo_sanguineo: string | null;
    alergias: any[];
    condiciones_medicas: any[];
  };
  
  // Datos del médico
  medico: {
    id_medico: number;
    numero_registro_medico: string;
    nombre_completo: string;
    especialidad_principal: string;
    telefono: string | null;
    email: string | null;
    firma_digital: string | null;
  };
  
  // Datos del centro médico
  centro: {
    id_centro: number;
    nombre: string;
    direccion: string;
    ciudad: string;
    region: string;
    telefono: string;
    email: string;
    logo_url: string | null;
    codigo_establecimiento: string | null;
  };
  
  // Medicamentos
  medicamentos: any[];
  
  // Historial de cambios
  historial: any[];
  
  // Auditoría
  auditoria: any[];
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

/**
 * Obtiene una receta completa por ID
 */
async function obtenerRecetaCompleta(
  idReceta: number,
  idMedico: number
): Promise<RecetaCompleta | null> {
  try {
    // 1. Obtener datos básicos de la receta
    const [recetaRows] = await pool.query<RowDataPacket[]>(
      `
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
        r.firma_digital,
        r.fecha_firma,
        r.creado_en,
        r.modificado_en,
        
        -- Datos del paciente
        p.id_paciente,
        p.rut as paciente_rut,
        CONCAT(p.nombre, ' ', p.apellido_paterno, ' ', COALESCE(p.apellido_materno, '')) as paciente_nombre_completo,
        p.fecha_nacimiento as paciente_fecha_nacimiento,
        TIMESTAMPDIFF(YEAR, p.fecha_nacimiento, CURDATE()) as paciente_edad,
        p.genero as paciente_genero,
        p.telefono as paciente_telefono,
        p.email as paciente_email,
        p.direccion as paciente_direccion,
        p.ciudad as paciente_ciudad,
        p.foto_url as paciente_foto_url,
        p.prevision as paciente_prevision,
        p.numero_prevision as paciente_numero_prevision,
        p.grupo_sanguineo as paciente_grupo_sanguineo,
        
        -- Datos del médico
        m.id_medico,
        m.numero_registro_medico,
        CONCAT(um.nombre, ' ', um.apellido_paterno, ' ', COALESCE(um.apellido_materno, '')) as medico_nombre_completo,
        e.nombre as medico_especialidad,
        um.telefono as medico_telefono,
        um.email as medico_email,
        m.firma_digital as medico_firma_digital,
        
        -- Datos del centro
        c.id_centro,
        c.nombre as centro_nombre,
        c.direccion as centro_direccion,
        c.ciudad as centro_ciudad,
        c.region as centro_region,
        c.telefono as centro_telefono,
        c.email as centro_email,
        c.logo_url as centro_logo_url,
        c.codigo_establecimiento as centro_codigo_establecimiento
        
      FROM recetas r
      INNER JOIN pacientes p ON r.id_paciente = p.id_paciente
      INNER JOIN medicos m ON r.id_medico = m.id_medico
      INNER JOIN usuarios um ON m.id_usuario = um.id_usuario
      LEFT JOIN especialidades e ON m.id_especialidad_principal = e.id_especialidad
      INNER JOIN centros_medicos c ON r.id_centro = c.id_centro
      WHERE r.id_receta = ? AND r.id_medico = ?
      LIMIT 1
      `,
      [idReceta, idMedico]
    );

    if (recetaRows.length === 0) {
      return null;
    }

    const receta = recetaRows[0];

    // 2. Obtener medicamentos
    const [medicamentos] = await pool.query<RowDataPacket[]>(
      `
      SELECT 
        id_medicamento_receta,
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
        fecha_dispensacion,
        dispensado_por,
        farmacia,
        precio_unitario,
        precio_total,
        lote_medicamento,
        fecha_vencimiento_medicamento
      FROM medicamentos_receta
      WHERE id_receta = ?
      ORDER BY id_medicamento_receta ASC
      `,
      [idReceta]
    );

    // 3. Obtener alergias del paciente
    const [alergias] = await pool.query<RowDataPacket[]>(
      `
      SELECT 
        id_alergia,
        tipo_alergia,
        nombre_alergia,
        severidad,
        reaccion,
        fecha_diagnostico,
        notas
      FROM alergias
      WHERE id_paciente = ?
        AND estado = 'activa'
      ORDER BY severidad DESC, fecha_diagnostico DESC
      `,
      [receta.id_paciente]
    );

    // 4. Obtener condiciones médicas del paciente
    const [condiciones] = await pool.query<RowDataPacket[]>(
      `
      SELECT 
        id_condicion,
        nombre_condicion,
        codigo_cie10,
        fecha_diagnostico,
        estado_condicion,
        tratamiento_actual,
        notas
      FROM condiciones_medicas
      WHERE id_paciente = ?
        AND estado = 'activa'
      ORDER BY fecha_diagnostico DESC
      `,
      [receta.id_paciente]
    );

    // 5. Obtener historial de cambios
    const [historial] = await pool.query<RowDataPacket[]>(
      `
      SELECT 
        id_historial,
        campo_modificado,
        valor_anterior,
        valor_nuevo,
        fecha_modificacion,
        modificado_por,
        CONCAT(u.nombre, ' ', u.apellido_paterno) as modificado_por_nombre
      FROM historial_recetas hr
      LEFT JOIN usuarios u ON hr.modificado_por = u.id_usuario
      WHERE hr.id_receta = ?
      ORDER BY hr.fecha_modificacion DESC
      `,
      [idReceta]
    );

    // 6. Obtener auditoría
    const [auditoria] = await pool.query<RowDataPacket[]>(
      `
      SELECT 
        id_auditoria,
        accion,
        detalles,
        fecha_accion,
        id_usuario,
        CONCAT(u.nombre, ' ', u.apellido_paterno) as usuario_nombre,
        ip_address
      FROM auditoria_recetas ar
      LEFT JOIN usuarios u ON ar.id_usuario = u.id_usuario
      WHERE ar.id_receta = ?
      ORDER BY ar.fecha_accion DESC
      `,
      [idReceta]
    );

    // 7. Construir objeto completo
    return {
      id_receta: receta.id_receta,
      numero_receta: receta.numero_receta,
      codigo_verificacion: receta.codigo_verificacion,
      fecha_emision: receta.fecha_emision,
      fecha_vencimiento: receta.fecha_vencimiento,
      tipo_receta: receta.tipo_receta,
      diagnostico: receta.diagnostico,
      codigo_cie10: receta.codigo_cie10,
      estado: receta.estado,
      es_cronica: receta.es_cronica === 1,
      observaciones: receta.observaciones,
      firma_digital: receta.firma_digital,
      fecha_firma: receta.fecha_firma,
      
      paciente: {
        id_paciente: receta.id_paciente,
        rut: receta.paciente_rut,
        nombre_completo: receta.paciente_nombre_completo,
        fecha_nacimiento: receta.paciente_fecha_nacimiento,
        edad: receta.paciente_edad,
        genero: receta.paciente_genero,
        telefono: receta.paciente_telefono,
        email: receta.paciente_email,
        direccion: receta.paciente_direccion,
        ciudad: receta.paciente_ciudad,
        foto_url: receta.paciente_foto_url,
        prevision: receta.paciente_prevision,
        numero_prevision: receta.paciente_numero_prevision,
        grupo_sanguineo: receta.paciente_grupo_sanguineo,
        alergias: alergias.map((a) => ({
          id_alergia: a.id_alergia,
          tipo_alergia: a.tipo_alergia,
          nombre_alergia: a.nombre_alergia,
          severidad: a.severidad,
          reaccion: a.reaccion,
          fecha_diagnostico: a.fecha_diagnostico,
          notas: a.notas,
        })),
        condiciones_medicas: condiciones.map((c) => ({
          id_condicion: c.id_condicion,
          nombre_condicion: c.nombre_condicion,
          codigo_cie10: c.codigo_cie10,
          fecha_diagnostico: c.fecha_diagnostico,
          estado_condicion: c.estado_condicion,
          tratamiento_actual: c.tratamiento_actual,
          notas: c.notas,
        })),
      },
      
      medico: {
        id_medico: receta.id_medico,
        numero_registro_medico: receta.numero_registro_medico,
        nombre_completo: receta.medico_nombre_completo,
        especialidad_principal: receta.medico_especialidad,
        telefono: receta.medico_telefono,
        email: receta.medico_email,
        firma_digital: receta.medico_firma_digital,
      },
      
      centro: {
        id_centro: receta.id_centro,
        nombre: receta.centro_nombre,
        direccion: receta.centro_direccion,
        ciudad: receta.centro_ciudad,
        region: receta.centro_region,
        telefono: receta.centro_telefono,
        email: receta.centro_email,
        logo_url: receta.centro_logo_url,
        codigo_establecimiento: receta.centro_codigo_establecimiento,
      },
      
      medicamentos: medicamentos.map((m) => ({
        id_medicamento_receta: m.id_medicamento_receta,
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
        dispensado_por: m.dispensado_por,
        farmacia: m.farmacia,
        precio_unitario: m.precio_unitario,
        precio_total: m.precio_total,
        lote_medicamento: m.lote_medicamento,
        fecha_vencimiento_medicamento: m.fecha_vencimiento_medicamento,
      })),
      
      historial: historial.map((h) => ({
        id_historial: h.id_historial,
        campo_modificado: h.campo_modificado,
        valor_anterior: h.valor_anterior,
        valor_nuevo: h.valor_nuevo,
        fecha_modificacion: h.fecha_modificacion,
        modificado_por: h.modificado_por,
        modificado_por_nombre: h.modificado_por_nombre,
      })),
      
      auditoria: auditoria.map((a) => ({
        id_auditoria: a.id_auditoria,
        accion: a.accion,
        detalles: a.detalles,
        fecha_accion: a.fecha_accion,
        id_usuario: a.id_usuario,
        usuario_nombre: a.usuario_nombre,
        ip_address: a.ip_address,
      })),
    };
  } catch (error) {
    console.error("Error al obtener receta completa:", error);
    throw error;
  }
}

/**
 * Registra la auditoría de la receta
 */
async function registrarAuditoria(
  idReceta: number,
  accion: string,
  idUsuario: number,
  detalles?: string,
  ipAddress?: string
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
      [idReceta, accion, idUsuario, detalles || null, ipAddress || "0.0.0.0"]
    );
  } catch (error) {
    console.error("Error al registrar auditoría:", error);
    // No lanzar error para no interrumpir el flujo principal
  }
}

/**
 * Registra cambios en el historial
 */
async function registrarHistorial(
  idReceta: number,
  campoModificado: string,
  valorAnterior: string,
  valorNuevo: string,
  idUsuario: number
): Promise<void> {
  try {
    await pool.query(
      `
      INSERT INTO historial_recetas (
        id_receta,
        campo_modificado,
        valor_anterior,
        valor_nuevo,
        fecha_modificacion,
        modificado_por
      ) VALUES (?, ?, ?, ?, NOW(), ?)
      `,
      [idReceta, campoModificado, valorAnterior, valorNuevo, idUsuario]
    );
  } catch (error) {
    console.error("Error al registrar historial:", error);
  }
}

/**
 * Genera un nuevo código de verificación
 */
function generarCodigoVerificacion(): string {
  return crypto.randomBytes(6).toString("hex").toUpperCase();
}

// ========================================
// HANDLER GET - Obtener receta por ID
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

    // 4. Actualizar última actividad
    await pool.query(
      `UPDATE sesiones_usuarios SET ultima_actividad = NOW() WHERE token = ?`,
      [sessionToken]
    );

    // 5. Obtener receta completa
    const receta = await obtenerRecetaCompleta(idReceta, medico.id_medico);

    if (!receta) {
      return NextResponse.json(
        {
          success: false,
          error: "Receta no encontrada o no tienes permisos para verla",
        },
        { status: 404 }
      );
    }

    // 6. Registrar acceso en auditoría
    await registrarAuditoria(
      idReceta,
      "VISUALIZACION",
      idUsuario,
      "Receta visualizada",
      request.headers.get("x-forwarded-for") || "0.0.0.0"
    );

    // 7. Respuesta exitosa
    return NextResponse.json(
      {
        success: true,
        receta,
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("❌ Error en GET /api/medico/recetas/[id]:", error);

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
// HANDLER PUT - Actualizar receta específica
// ========================================

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const connection = await pool.getConnection();

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

    // 4. Verificar que la receta existe y pertenece al médico
    const [recetaActual] = await connection.query<RowDataPacket[]>(
      `SELECT * FROM recetas WHERE id_receta = ? AND id_medico = ?`,
      [idReceta, medico.id_medico]
    );

    if (recetaActual.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Receta no encontrada",
        },
        { status: 404 }
      );
    }

    const receta = recetaActual[0];

    // 5. Validar que la receta puede ser editada
    if (receta.estado !== "emitida") {
      return NextResponse.json(
        {
          success: false,
          error: "Solo se pueden editar recetas en estado 'emitida'",
        },
        { status: 400 }
      );
    }

    // 6. Obtener datos del body
    const body = await request.json();

    const {
      diagnostico,
      codigo_cie10,
      fecha_vencimiento,
      observaciones,
      medicamentos,
    } = body;

    // 7. Iniciar transacción
    await connection.beginTransaction();

    // 8. Actualizar campos y registrar cambios
    const cambios: Array<{
      campo: string;
      anterior: string;
      nuevo: string;
    }> = [];

    if (diagnostico !== undefined && diagnostico !== receta.diagnostico) {
      await connection.query(
        `UPDATE recetas SET diagnostico = ? WHERE id_receta = ?`,
        [diagnostico, idReceta]
      );
      cambios.push({
        campo: "diagnostico",
        anterior: receta.diagnostico,
        nuevo: diagnostico,
      });
    }

    if (codigo_cie10 !== undefined && codigo_cie10 !== receta.codigo_cie10) {
      await connection.query(
        `UPDATE recetas SET codigo_cie10 = ? WHERE id_receta = ?`,
        [codigo_cie10, idReceta]
      );
      cambios.push({
        campo: "codigo_cie10",
        anterior: receta.codigo_cie10 || "",
        nuevo: codigo_cie10 || "",
      });
    }

    if (
      fecha_vencimiento !== undefined &&
      fecha_vencimiento !== receta.fecha_vencimiento
    ) {
      await connection.query(
        `UPDATE recetas SET fecha_vencimiento = ? WHERE id_receta = ?`,
        [fecha_vencimiento, idReceta]
      );
      cambios.push({
        campo: "fecha_vencimiento",
        anterior: receta.fecha_vencimiento || "",
        nuevo: fecha_vencimiento || "",
      });
    }

    if (
      observaciones !== undefined &&
      observaciones !== receta.observaciones
    ) {
      await connection.query(
        `UPDATE recetas SET observaciones = ? WHERE id_receta = ?`,
        [observaciones, idReceta]
      );
      cambios.push({
        campo: "observaciones",
        anterior: receta.observaciones || "",
        nuevo: observaciones || "",
      });
    }

    // 9. Actualizar medicamentos si se proporcionan
    if (medicamentos && Array.isArray(medicamentos)) {
      // Obtener medicamentos actuales
      const [medicamentosActuales] = await connection.query<RowDataPacket[]>(
        `SELECT * FROM medicamentos_receta WHERE id_receta = ?`,
        [idReceta]
      );

      // Eliminar medicamentos anteriores
      await connection.query(
        `DELETE FROM medicamentos_receta WHERE id_receta = ?`,
        [idReceta]
      );

      // Insertar nuevos medicamentos
      for (const med of medicamentos) {
        const precioTotal = med.precio_unitario
          ? med.precio_unitario * med.cantidad
          : null;

        await connection.query(
          `
          INSERT INTO medicamentos_receta (
            id_receta,
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
            precio_unitario,
            precio_total
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `,
          [
            idReceta,
            med.nombre_medicamento,
            med.codigo_medicamento || null,
            med.dosis,
            med.frecuencia,
            med.duracion,
            med.cantidad,
            med.unidad || "unidades",
            med.via_administracion || "oral",
            med.instrucciones || null,
            med.es_controlado ? 1 : 0,
            med.precio_unitario || null,
            precioTotal,
          ]
        );
      }

      cambios.push({
        campo: "medicamentos",
        anterior: `${medicamentosActuales.length} medicamentos`,
        nuevo: `${medicamentos.length} medicamentos`,
      });
    }

    // 10. Actualizar fecha de modificación
    await connection.query(
      `UPDATE recetas SET modificado_en = NOW(), modificado_por = ? WHERE id_receta = ?`,
      [idUsuario, idReceta]
    );

    // 11. Registrar cambios en el historial
    for (const cambio of cambios) {
      await registrarHistorial(
        idReceta,
        cambio.campo,
        cambio.anterior,
        cambio.nuevo,
        idUsuario
      );
    }

    // 12. Registrar auditoría
    await registrarAuditoria(
      idReceta,
      "ACTUALIZACION",
      idUsuario,
      `Campos actualizados: ${cambios.map((c) => c.campo).join(", ")}`,
      request.headers.get("x-forwarded-for") || "0.0.0.0"
    );

    // 13. Commit de la transacción
    await connection.commit();

    // 14. Obtener receta actualizada
    const recetaActualizada = await obtenerRecetaCompleta(
      idReceta,
      medico.id_medico
    );

    // 15. Respuesta exitosa
    return NextResponse.json(
      {
        success: true,
        message: "Receta actualizada exitosamente",
        receta: recetaActualizada,
        cambios_realizados: cambios.length,
      },
      { status: 200 }
    );
  } catch (error: any) {
    // Rollback en caso de error
    await connection.rollback();

    console.error("❌ Error en PUT /api/medico/recetas/[id]:", error);

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
// HANDLER DELETE - Anular receta específica
// ========================================

export async function DELETE(
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

    // 4. Obtener parámetros
    const searchParams = request.nextUrl.searchParams;
    const motivo = searchParams.get("motivo") || "Anulada por el médico";

    // 5. Validar que la receta existe y pertenece al médico
    const [receta] = await pool.query<RowDataPacket[]>(
      `SELECT * FROM recetas WHERE id_receta = ? AND id_medico = ?`,
      [idReceta, medico.id_medico]
    );

    if (receta.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Receta no encontrada",
        },
        { status: 404 }
      );
    }

    // 6. Validar que la receta puede ser anulada
    if (receta[0].estado === "anulada") {
      return NextResponse.json(
        {
          success: false,
          error: "La receta ya está anulada",
        },
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

    // 7. Anular receta
    await pool.query(
      `UPDATE recetas SET estado = 'anulada', modificado_por = ?, modificado_en = NOW() WHERE id_receta = ?`,
      [idUsuario, idReceta]
    );

    // 8. Registrar en historial
    await registrarHistorial(
      idReceta,
      "estado",
      receta[0].estado,
      "anulada",
      idUsuario
    );

    // 9. Registrar auditoría
    await registrarAuditoria(
      idReceta,
      "ANULACION",
      idUsuario,
      motivo,
      request.headers.get("x-forwarded-for") || "0.0.0.0"
    );

    // 10. Respuesta exitosa
    return NextResponse.json(
      {
        success: true,
        message: "Receta anulada exitosamente",
        motivo,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("❌ Error en DELETE /api/medico/recetas/[id]:", error);

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
// HANDLER PATCH - Acciones específicas
// ========================================

export async function PATCH(
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

    // 4. Obtener acción del body
    const body = await request.json();
    const { accion } = body;

    // 5. Validar que la receta existe y pertenece al médico
    const [receta] = await pool.query<RowDataPacket[]>(
      `SELECT * FROM recetas WHERE id_receta = ? AND id_medico = ?`,
      [idReceta, medico.id_medico]
    );

    if (receta.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Receta no encontrada",
        },
        { status: 404 }
      );
    }

    // 6. Ejecutar acción específica
    switch (accion) {
      case "firmar":
        // Firmar receta digitalmente
        if (receta[0].firma_digital) {
          return NextResponse.json(
            {
              success: false,
              error: "La receta ya está firmada",
            },
            { status: 400 }
          );
        }

        await pool.query(
          `UPDATE recetas SET firma_digital = ?, fecha_firma = NOW() WHERE id_receta = ?`,
          [medico.firma_digital || "FIRMA_DIGITAL", idReceta]
        );

        await registrarAuditoria(
          idReceta,
          "FIRMA_DIGITAL",
          idUsuario,
          "Receta firmada digitalmente",
          request.headers.get("x-forwarded-for") || "0.0.0.0"
        );

        return NextResponse.json(
          {
            success: true,
            message: "Receta firmada exitosamente",
          },
          { status: 200 }
        );

      case "regenerar_codigo":
        // Regenerar código de verificación
        const nuevoCodigo = generarCodigoVerificacion();

        await pool.query(
          `UPDATE recetas SET codigo_verificacion = ? WHERE id_receta = ?`,
          [nuevoCodigo, idReceta]
        );

        await registrarHistorial(
          idReceta,
          "codigo_verificacion",
          receta[0].codigo_verificacion,
          nuevoCodigo,
          idUsuario
        );

        await registrarAuditoria(
          idReceta,
          "REGENERACION_CODIGO",
          idUsuario,
          "Código de verificación regenerado",
          request.headers.get("x-forwarded-for") || "0.0.0.0"
        );

        return NextResponse.json(
          {
            success: true,
            message: "Código de verificación regenerado",
            nuevo_codigo: nuevoCodigo,
          },
          { status: 200 }
        );

      case "duplicar":
        // Duplicar receta (crear una nueva basada en esta)
        const recetaCompleta = await obtenerRecetaCompleta(
          idReceta,
          medico.id_medico
        );

        if (!recetaCompleta) {
          return NextResponse.json(
            {
              success: false,
              error: "No se pudo obtener la receta para duplicar",
            },
            { status: 500 }
          );
        }

        // Aquí implementarías la lógica de duplicación
        // (similar al POST de crear receta)

        return NextResponse.json(
          {
            success: true,
            message: "Funcionalidad de duplicación en desarrollo",
          },
          { status: 501 }
        );

      default:
        return NextResponse.json(
          {
            success: false,
            error: "Acción no válida",
          },
          { status: 400 }
        );
    }
  } catch (error: any) {
    console.error("❌ Error en PATCH /api/medico/recetas/[id]:", error);

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
