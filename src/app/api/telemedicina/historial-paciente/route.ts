// frontend/src/app/api/telemedicina/historial-paciente/route.ts

import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { RowDataPacket } from "mysql2";

// ========================================
// TIPOS
// ========================================

interface MedicoData {
  id_medico: number;
  id_usuario: number;
  id_centro_principal: number;
}

// ========================================
// HELPER PARA OBTENER TOKEN
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
      [idUsuario]// frontend/src/app/api/telemedicina/historial-paciente/route.ts (CONTINUACIÓN)

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

async function calcularEdad(fechaNacimiento: string): Promise<number> {
  const hoy = new Date();
  const nacimiento = new Date(fechaNacimiento);
  let edad = hoy.getFullYear() - nacimiento.getFullYear();
  const mes = hoy.getMonth() - nacimiento.getMonth();
  if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
    edad--;
  }
  return edad;
}

// ========================================
// HANDLER GET - Obtener historial completo
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

    // Validar sesión
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

    // Obtener ID del paciente
    const searchParams = request.nextUrl.searchParams;
    const idPaciente = searchParams.get("id_paciente");

    if (!idPaciente) {
      return NextResponse.json(
        { success: false, error: "ID de paciente requerido" },
        { status: 400 }
      );
    }

    // ========================================
    // 1. DATOS DEMOGRÁFICOS DEL PACIENTE
    // ========================================

    const [pacienteRows] = await pool.query<RowDataPacket[]>(
      `
      SELECT 
        p.id_paciente,
        p.rut,
        p.nombre,
        p.segundo_nombre,
        p.apellido_paterno,
        p.apellido_materno,
        p.fecha_nacimiento,
        p.genero,
        p.email,
        p.telefono,
        p.celular,
        p.direccion,
        p.ciudad,
        p.region,
        p.pais,
        p.grupo_sanguineo,
        p.peso_kg,
        p.altura_cm,
        p.imc,
        p.estado_civil,
        p.ocupacion,
        p.nivel_educacion,
        p.foto_url,
        p.estado,
        p.fecha_registro
      FROM pacientes p
      WHERE p.id_paciente = ?
      LIMIT 1
      `,
      [idPaciente]
    );

    if (pacienteRows.length === 0) {
      return NextResponse.json(
        { success: false, error: "Paciente no encontrado" },
        { status: 404 }
      );
    }

    const paciente = pacienteRows[0];
    const edad = await calcularEdad(paciente.fecha_nacimiento);

    // ========================================
    // 2. CONTACTOS DE EMERGENCIA
    // ========================================

    const [contactosEmergencia] = await pool.query<RowDataPacket[]>(
      `
      SELECT 
        ce.id_contacto,
        ce.nombre,
        ce.apellido,
        ce.relacion,
        ce.telefono,
        ce.celular,
        ce.email,
        ce.direccion,
        ce.es_contacto_principal,
        ce.notas
      FROM contactos_emergencia ce
      WHERE ce.id_paciente = ?
      ORDER BY ce.es_contacto_principal DESC, ce.fecha_creacion ASC
      `,
      [idPaciente]
    );

    // ========================================
    // 3. SEGUROS MÉDICOS
    // ========================================

    const [seguros] = await pool.query<RowDataPacket[]>(
      `
      SELECT 
        sm.id_seguro,
        sm.tipo_seguro,
        sm.nombre_aseguradora,
        sm.numero_poliza,
        sm.tipo_plan,
        sm.grupo_fonasa,
        sm.fecha_inicio,
        sm.fecha_vencimiento,
        sm.cobertura_ambulatoria,
        sm.cobertura_hospitalaria,
        sm.cobertura_medicamentos,
        sm.cobertura_examenes,
        sm.es_seguro_principal,
        sm.estado
      FROM seguros_medicos sm
      WHERE sm.id_paciente = ?
        AND sm.estado = 'activo'
      ORDER BY sm.es_seguro_principal DESC
      `,
      [idPaciente]
    );

    // ========================================
    // 4. ALERGIAS
    // ========================================

    const [alergias] = await pool.query<RowDataPacket[]>(
      `
      SELECT 
        a.id_alergia,
        a.tipo_alergia,
        a.alergeno,
        a.severidad,
        a.reaccion,
        a.fecha_diagnostico,
        a.fecha_ultima_reaccion,
        a.comentarios,
        a.verificado,
        a.estado
      FROM alergias a
      WHERE a.id_paciente = ?
        AND a.estado = 'activa'
      ORDER BY a.severidad DESC, a.fecha_diagnostico DESC
      `,
      [idPaciente]
    );

    // ========================================
    // 5. ANTECEDENTES MÉDICOS
    // ========================================

    const [antecedentes] = await pool.query<RowDataPacket[]>(
      `
      SELECT 
        a.id_antecedente,
        a.tipo,
        a.descripcion,
        a.fecha_diagnostico,
        a.estado,
        a.nivel_importancia,
        a.observaciones,
        a.validado,
        a.fecha_creacion
      FROM antecedentes a
      WHERE a.id_paciente = ?
        AND a.estado IN ('activo', 'resuelto')
      ORDER BY a.nivel_importancia DESC, a.tipo ASC, a.fecha_diagnostico DESC
      `,
      [idPaciente]
    );

    // ========================================
    // 6. DIAGNÓSTICOS ACTIVOS
    // ========================================

    const [diagnosticos] = await pool.query<RowDataPacket[]>(
      `
      SELECT 
        d.id_diagnostico,
        d.diagnostico,
        d.codigo_cie10,
        d.descripcion,
        d.fecha_diagnostico,
        d.tipo,
        d.estado,
        d.es_ges,
        d.es_notificacion_obligatoria,
        d.fecha_resolucion,
        d.observaciones,
        CONCAT(m.nombre, ' ', m.apellido_paterno) as medico_nombre,
        e.nombre as especialidad
      FROM diagnosticos d
      INNER JOIN medicos med ON d.id_medico = med.id_medico
      INNER JOIN usuarios m ON med.id_usuario = m.id_usuario
      LEFT JOIN especialidades e ON med.id_especialidad_principal = e.id_especialidad
      WHERE d.id_paciente = ?
        AND d.estado IN ('activo', 'cronico', 'en_tratamiento')
      ORDER BY d.fecha_diagnostico DESC
      LIMIT 20
      `,
      [idPaciente]
    );

    // ========================================
    // 7. HISTORIAL CLÍNICO (ÚLTIMAS CONSULTAS)
    // ========================================

    const [historialClinico] = await pool.query<RowDataPacket[]>(
      `
      SELECT 
        hc.id_historial,
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
        CONCAT(m.nombre, ' ', m.apellido_paterno) as medico_nombre,
        e.nombre as especialidad,
        cm.nombre as centro_nombre
      FROM historial_clinico hc
      INNER JOIN medicos med ON hc.id_medico = med.id_medico
      INNER JOIN usuarios m ON med.id_usuario = m.id_usuario
      LEFT JOIN especialidades e ON hc.id_especialidad = e.id_especialidad
      INNER JOIN centros_medicos cm ON hc.id_centro = cm.id_centro
      WHERE hc.id_paciente = ?
        AND hc.estado_registro IN ('completo', 'revisado')
      ORDER BY hc.fecha_atencion DESC
      LIMIT 10
      `,
      [idPaciente]
    );

    // ========================================
    // 8. MEDICAMENTOS ACTUALES (RECETAS ACTIVAS)
    // ========================================

    const [medicamentosActuales] = await pool.query<RowDataPacket[]>(
      `
      SELECT DISTINCT
        rm.nombre_medicamento,
        rm.dosis,
        rm.frecuencia,
        rm.duracion,
        rm.via_administracion,
        rm.instrucciones,
        rm.es_controlado,
        r.fecha_emision,
        r.fecha_vencimiento,
        r.es_cronica,
        CONCAT(m.nombre, ' ', m.apellido_paterno) as medico_prescriptor
      FROM receta_medicamentos rm
      INNER JOIN recetas_medicas r ON rm.id_receta = r.id_receta
      INNER JOIN medicos med ON r.id_medico = med.id_medico
      INNER JOIN usuarios m ON med.id_usuario = m.id_usuario
      WHERE r.id_paciente = ?
        AND r.estado = 'emitida'
        AND (r.fecha_vencimiento IS NULL OR r.fecha_vencimiento >= CURDATE())
        AND rm.dispensado = 0
      ORDER BY r.fecha_emision DESC
      `,
      [idPaciente]
    );

    // ========================================
    // 9. SIGNOS VITALES (ÚLTIMOS 5 REGISTROS)
    // ========================================

    const [signosVitales] = await pool.query<RowDataPacket[]>(
      `
      SELECT 
        sv.id_signo_vital,
        sv.fecha_medicion,
        sv.presion_sistolica,
        sv.presion_diastolica,
        sv.pulso,
        sv.frecuencia_respiratoria,
        sv.temperatura,
        sv.saturacion_oxigeno,
        sv.peso,
        sv.talla,
        sv.imc,
        sv.circunferencia_cintura,
        sv.dolor_eva,
        sv.glucemia,
        sv.estado_conciencia,
        sv.observaciones,
        CONCAT(u.nombre, ' ', u.apellido_paterno) as registrado_por_nombre
      FROM signos_vitales sv
      INNER JOIN usuarios u ON sv.registrado_por = u.id_usuario
      WHERE sv.id_paciente = ?
      ORDER BY sv.fecha_medicion DESC
      LIMIT 5
      `,
      [idPaciente]
    );

    // ========================================
    // 10. EXÁMENES MÉDICOS RECIENTES
    // ========================================

    const [examenes] = await pool.query<RowDataPacket[]>(
      `
      SELECT 
        em.id_examen,
        em.fecha_solicitud,
        em.fecha_programada,
        em.fecha_realizacion,
        em.estado,
        em.prioridad,
        em.motivo_solicitud,
        em.diagnostico,
        em.numero_orden,
        te.nombre as tipo_examen,
        te.categoria as categoria_examen,
        CONCAT(m.nombre, ' ', m.apellido_paterno) as medico_solicitante,
        (
          SELECT COUNT(*)
          FROM resultados_examenes re
          WHERE re.id_examen = em.id_examen
        ) as tiene_resultados
      FROM examenes_medicos em
      INNER JOIN tipos_examenes te ON em.id_tipo_examen = te.id_tipo_examen
      INNER JOIN medicos med ON em.id_medico_solicitante = med.id_medico
      INNER JOIN usuarios m ON med.id_usuario = m.id_usuario
      WHERE em.id_paciente = ?
      ORDER BY em.fecha_solicitud DESC
      LIMIT 10
      `,
      [idPaciente]
    );

    // ========================================
    // 11. PROCEDIMIENTOS REALIZADOS
    // ========================================

    const [procedimientos] = await pool.query<RowDataPacket[]>(
      `
      SELECT 
        p.id_procedimiento,
        p.nombre_procedimiento,
        p.descripcion,
        p.fecha_procedimiento,
        p.duracion_minutos,
        p.tipo_procedimiento,
        p.estado,
        p.resultado,
        p.complicaciones,
        p.requiere_seguimiento,
        p.fecha_seguimiento,
        CONCAT(m.nombre, ' ', m.apellido_paterno) as medico_nombre,
        cm.nombre as centro_nombre
      FROM procedimientos p
      INNER JOIN medicos med ON p.id_medico = med.id_medico
      INNER JOIN usuarios m ON med.id_usuario = m.id_usuario
      INNER JOIN centros_medicos cm ON p.id_centro = cm.id_centro
      WHERE p.id_paciente = ?
        AND p.estado IN ('realizado', 'programado')
      ORDER BY p.fecha_procedimiento DESC
      LIMIT 10
      `,
      [idPaciente]
    );

    // ========================================
    // 12. HOSPITALIZACIONES
    // ========================================

    const [hospitalizaciones] = await pool.query<RowDataPacket[]>(
      `
      SELECT 
        h.id_hospitalizacion,
        h.fecha_ingreso,
        h.fecha_egreso,
        h.motivo_ingreso,
        h.diagnostico_ingreso,
        h.diagnostico_egreso,
        h.tipo_alta,
        h.resumen_clinico,
        h.recomendaciones_alta,
        cm.nombre as centro_nombre,
        CONCAT(m.nombre, ' ', m.apellido_paterno) as medico_tratante
      FROM hospitalizaciones h
      INNER JOIN centros_medicos cm ON h.id_centro = cm.id_centro
      LEFT JOIN medicos med ON h.id_medico_tratante = med.id_medico
      LEFT JOIN usuarios m ON med.id_usuario = m.id_usuario
      WHERE h.id_paciente = ?
      ORDER BY h.fecha_ingreso DESC
      LIMIT 5
      `,
      [idPaciente]
    );

    // ========================================
    // 13. VACUNAS
    // ========================================

    const [vacunas] = await pool.query<RowDataPacket[]>(
      `
      SELECT 
        v.id_vacuna,
        v.nombre_vacuna,
        v.fecha_aplicacion,
        v.dosis,
        v.lote,
        v.proxima_dosis,
        v.observaciones,
        cm.nombre as centro_aplicacion
      FROM vacunas v
      LEFT JOIN centros_medicos cm ON v.id_centro = cm.id_centro
      WHERE v.id_paciente = ?
      ORDER BY v.fecha_aplicacion DESC
      `,
      [idPaciente]
    );

    // ========================================
    // 14. DOCUMENTOS ADJUNTOS
    // ========================================

    const [documentos] = await pool.query<RowDataPacket[]>(
      `
      SELECT 
        da.id_documento,
        da.tipo_documento,
        da.nombre_archivo,
        da.url_archivo,
        da.tamano_bytes,
        da.descripcion,
        da.fecha_documento,
        da.fecha_subida,
        CONCAT(u.nombre, ' ', u.apellido_paterno) as subido_por_nombre
      FROM documentos_adjuntos da
      INNER JOIN usuarios u ON da.subido_por = u.id_usuario
      WHERE da.id_paciente = ?
        AND da.estado = 'activo'
      ORDER BY da.fecha_subida DESC
      LIMIT 10
      `,
      [idPaciente]
    );

    // ========================================
    // 15. ESTADÍSTICAS GENERALES
    // ========================================

    const [estadisticas] = await pool.query<RowDataPacket[]>(
      `
      SELECT 
        (SELECT COUNT(*) FROM historial_clinico WHERE id_paciente = ?) as total_consultas,
        (SELECT COUNT(*) FROM hospitalizaciones WHERE id_paciente = ?) as total_hospitalizaciones,
        (SELECT COUNT(*) FROM procedimientos WHERE id_paciente = ? AND estado = 'realizado') as total_procedimientos,
        (SELECT COUNT(*) FROM examenes_medicos WHERE id_paciente = ?) as total_examenes,
        (SELECT COUNT(*) FROM recetas_medicas WHERE id_paciente = ?) as total_recetas,
        (SELECT MAX(fecha_atencion) FROM historial_clinico WHERE id_paciente = ?) as ultima_consulta,
        (SELECT COUNT(*) FROM alergias WHERE id_paciente = ? AND estado = 'activa') as total_alergias,
        (SELECT COUNT(*) FROM diagnosticos WHERE id_paciente = ? AND estado IN ('activo', 'cronico')) as total_diagnosticos_activos
      `,
      [
        idPaciente,
        idPaciente,
        idPaciente,
        idPaciente,
        idPaciente,
        idPaciente,
        idPaciente,
        idPaciente,
      ]
    );

    // ========================================
    // 16. ALERTAS Y BANDERAS ROJAS
    // ========================================

    const alertas: any[] = [];

    // Alergias críticas
    const alergiasCriticas = alergias.filter(
      (a: any) => a.severidad === "severa" || a.severidad === "fatal"
    );
    if (alergiasCriticas.length > 0) {
      alertas.push({
        tipo: "alergia_critica",
        nivel: "critico",
        mensaje: `ALERTA: Paciente con ${alergiasCriticas.length} alergia(s) severa(s)`,
        datos: alergiasCriticas.map((a: any) => a.alergeno),
      });
    }

    // Diagnósticos GES
    const diagnosticosGES = diagnosticos.filter((d: any) => d.es_ges === 1);
    if (diagnosticosGES.length > 0) {
      alertas.push({
        tipo: "diagnostico_ges",
        nivel: "importante",
        mensaje: `Paciente con ${diagnosticosGES.length} diagnóstico(s) GES`,
        datos: diagnosticosGES.map((d: any) => d.diagnostico),
      });
    }

    // Medicamentos controlados
    const medicamentosControlados = medicamentosActuales.filter(
      (m: any) => m.es_controlado === 1
    );
    if (medicamentosControlados.length > 0) {
      alertas.push({
        tipo: "medicamento_controlado",
        nivel: "advertencia",
        mensaje: `Paciente con ${medicamentosControlados.length} medicamento(s) controlado(s)`,
        datos: medicamentosControlados.map((m: any) => m.nombre_medicamento),
      });
    }

    // Signos vitales anormales (último registro)
    if (signosVitales.length > 0) {
      const ultimoSigno = signosVitales[0];
      if (
        ultimoSigno.presion_sistolica > 140 ||
        ultimoSigno.presion_diastolica > 90
      ) {
        alertas.push({
          tipo: "presion_alta",
          nivel: "advertencia",
          mensaje: `Presión arterial elevada: ${ultimoSigno.presion_sistolica}/${ultimoSigno.presion_diastolica} mmHg`,
          datos: { fecha: ultimoSigno.fecha_medicion },
        });
      }

      if (ultimoSigno.saturacion_oxigeno && ultimoSigno.saturacion_oxigeno < 90) {
        alertas.push({
          tipo: "saturacion_baja",
          nivel: "critico",
          mensaje: `Saturación de oxígeno baja: ${ultimoSigno.saturacion_oxigeno}%`,
          datos: { fecha: ultimoSigno.fecha_medicion },
        });
      }

      if (ultimoSigno.temperatura && ultimoSigno.temperatura >= 38.0) {
        alertas.push({
          tipo: "fiebre",
          nivel: "advertencia",
          mensaje: `Temperatura elevada: ${ultimoSigno.temperatura}°C`,
          datos: { fecha: ultimoSigno.fecha_medicion },
        });
      }
    }

    // ========================================
    // 17. LÍNEA DE TIEMPO (EVENTOS IMPORTANTES)
    // ========================================

    const lineaTiempo: any[] = [];

    // Agregar consultas
    historialClinico.forEach((hc: any) => {
      lineaTiempo.push({
        tipo: "consulta",
        fecha: hc.fecha_atencion,
        titulo: `Consulta - ${hc.tipo_atencion}`,
        descripcion: hc.motivo_consulta,
        medico: hc.medico_nombre,
        centro: hc.centro_nombre,
      });
    });

    // Agregar hospitalizaciones
    hospitalizaciones.forEach((h: any) => {
      lineaTiempo.push({
        tipo: "hospitalizacion",
        fecha: h.fecha_ingreso,
        titulo: "Hospitalización",
        descripcion: h.motivo_ingreso,
        centro: h.centro_nombre,
      });
    });

    // Agregar procedimientos
    procedimientos.forEach((p: any) => {
      lineaTiempo.push({
        tipo: "procedimiento",
        fecha: p.fecha_procedimiento,
        titulo: p.nombre_procedimiento,
        descripcion: p.descripcion,
        medico: p.medico_nombre,
      });
    });

    // Ordenar línea de tiempo por fecha descendente
    lineaTiempo.sort(
      (a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
    );

    // ========================================
    // CONSTRUIR RESPUESTA FINAL
    // ========================================

    const historialCompleto = {
      // Datos demográficos
      paciente: {
        ...paciente,
        edad: edad,
        nombre_completo: `${paciente.nombre} ${paciente.segundo_nombre || ""} ${
          paciente.apellido_paterno
        } ${paciente.apellido_materno || ""}`.trim(),
      },

      // Contactos y seguros
      contactos_emergencia: contactosEmergencia,
      seguros_medicos: seguros,

      // Información clínica crítica
      alergias: alergias,
      antecedentes: antecedentes,
      diagnosticos_activos: diagnosticos,

      // Historial de atenciones
      historial_clinico: historialClinico,
      hospitalizaciones: hospitalizaciones,
      procedimientos: procedimientos,

      // Tratamiento actual
      medicamentos_actuales: medicamentosActuales,
      signos_vitales_recientes: signosVitales,

      // Exámenes y documentos
      examenes_recientes: examenes,
      vacunas: vacunas,
      documentos: documentos,

      // Estadísticas y resumen
      estadisticas: estadisticas[0],
      alertas: alertas,
      linea_tiempo: lineaTiempo.slice(0, 20), // Últimos 20 eventos

      // Metadata
      fecha_consulta: new Date().toISOString(),
      medico_consultante: {
        id_medico: medico.id_medico,
        id_usuario: medico.id_usuario,
      },
    };

    // Registrar acceso al historial (auditoría HIPAA)
    await pool.query(
      `
      INSERT INTO accesos_paciente_log (
        id_paciente,
        id_usuario,
        tipo_acceso,
        seccion_accedida,
        id_centro,
        motivo_acceso,
        ip_address
      ) VALUES (?, ?, 'lectura', 'historial_completo', ?, 'Consulta de telemedicina', ?)
      `,
      [
        idPaciente,
        idUsuario,
        medico.id_centro_principal,
        request.headers.get("x-forwarded-for") ||
          request.headers.get("x-real-ip") ||
          "unknown",
      ]
    );

    // Actualizar última actividad
    await pool.query(
      `UPDATE sesiones_usuarios SET ultima_actividad = NOW() WHERE token = ?`,
      [sessionToken]
    );

    return NextResponse.json(
      {
        success: true,
        historial: historialCompleto,
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error(
      "❌ Error en GET /api/telemedicina/historial-paciente:",
      error
    );
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

