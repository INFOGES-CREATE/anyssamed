// frontend/src/app/api/admin/citas/opciones/route.ts

import { NextResponse } from "next/server";
import pool from "@/lib/db";

/**
 * GET /api/admin/citas/opciones
 * Retorna todas las opciones necesarias para los filtros y formularios de citas
 */
export async function GET() {
  try {
    // ==================== CENTROS MÉDICOS ====================
    const [centros]: any = await pool.query(
      `SELECT 
        id_centro AS value,
        nombre AS label,
        direccion,
        telefono,
        email,
        activo
       FROM centros_medicos
       WHERE activo = 1
       ORDER BY nombre ASC`
    );

    // ==================== SUCURSALES ====================
    const [sucursales]: any = await pool.query(
      `SELECT 
        s.id_sucursal AS value,
        s.nombre AS label,
        s.id_centro,
        s.direccion,
        s.telefono,
        s.activo,
        c.nombre AS centro_nombre
       FROM sucursales s
       INNER JOIN centros_medicos c ON c.id_centro = s.id_centro
       WHERE s.activo = 1
       ORDER BY s.nombre ASC`
    );

    // ==================== MÉDICOS ====================
    const [medicos]: any = await pool.query(
      `SELECT 
        m.id_medico AS value,
        CONCAT(u.nombre, ' ', u.apellido_paterno, ' ', IFNULL(u.apellido_materno, '')) AS label,
        m.id_centro,
        m.rut,
        m.registro_nacional,
        m.activo,
        c.nombre AS centro_nombre,
        GROUP_CONCAT(DISTINCT e.nombre ORDER BY e.nombre SEPARATOR ', ') AS especialidades
       FROM medicos m
       INNER JOIN usuarios u ON u.id_usuario = m.id_usuario
       INNER JOIN centros_medicos c ON c.id_centro = m.id_centro
       LEFT JOIN medicos_especialidades me ON me.id_medico = m.id_medico
       LEFT JOIN especialidades e ON e.id_especialidad = me.id_especialidad
       WHERE m.activo = 1 AND u.activo = 1
       GROUP BY m.id_medico, u.nombre, u.apellido_paterno, u.apellido_materno, 
                m.id_centro, m.rut, m.registro_nacional, m.activo, c.nombre
       ORDER BY u.apellido_paterno ASC, u.apellido_materno ASC, u.nombre ASC`
    );

    // ==================== PACIENTES ====================
    const [pacientes]: any = await pool.query(
      `SELECT 
        id_paciente AS value,
        CONCAT(nombre, ' ', apellido_paterno, ' ', IFNULL(apellido_materno, ''), ' (', rut, ')') AS label,
        rut,
        nombre,
        apellido_paterno,
        apellido_materno,
        email,
        telefono,
        fecha_nacimiento,
        activo
       FROM pacientes
       WHERE activo = 1
       ORDER BY apellido_paterno ASC, apellido_materno ASC, nombre ASC
       LIMIT 500`
    );

    // ==================== TIPOS DE CITA ====================
    const [tiposCita]: any = await pool.query(
      `SELECT 
        id_tipo_cita AS value,
        nombre AS label,
        id_centro,
        descripcion,
        duracion_predeterminada,
        color,
        precio_sugerido,
        requiere_preparacion,
        instrucciones_preparacion,
        visible_web,
        activo
       FROM tipos_cita
       WHERE activo = 1 AND visible_web = 1
       ORDER BY nombre ASC`
    );

    // ==================== SALAS ====================
    const [salas]: any = await pool.query(
      `SELECT 
        s.id_sala AS value,
        CONCAT(s.nombre, ' - ', s.tipo, 
               CASE 
                 WHEN s.piso IS NOT NULL THEN CONCAT(' (Piso ', s.piso, ')')
                 ELSE ''
               END) AS label,
        s.id_centro,
        s.id_sucursal,
        s.nombre,
        s.tipo,
        s.piso,
        s.numero,
        s.capacidad,
        s.estado,
        s.descripcion,
        c.nombre AS centro_nombre,
        suc.nombre AS sucursal_nombre
       FROM salas s
       INNER JOIN centros_medicos c ON c.id_centro = s.id_centro
       LEFT JOIN sucursales suc ON suc.id_sucursal = s.id_sucursal
       WHERE s.estado IN ('activa', 'ocupada')
       ORDER BY s.nombre ASC`
    );

    // ==================== ESPECIALIDADES ====================
    const [especialidades]: any = await pool.query(
      `SELECT 
        id_especialidad AS value,
        nombre AS label,
        descripcion,
        codigo_fonasa,
        activo
       FROM especialidades
       WHERE activo = 1
       ORDER BY nombre ASC`
    );

    // ==================== OPCIONES ESTÁTICAS ====================
    // Estados de cita
    const estados = [
      { value: "programada", label: "Programada" },
      { value: "confirmada", label: "Confirmada" },
      { value: "en_sala_espera", label: "En sala de espera" },
      { value: "en_atencion", label: "En atención" },
      { value: "completada", label: "Completada" },
      { value: "cancelada", label: "Cancelada" },
      { value: "no_asistio", label: "No asistió" },
      { value: "reprogramada", label: "Reprogramada" }
    ];

    // Prioridades
    const prioridades = [
      { value: "normal", label: "Normal" },
      { value: "alta", label: "Alta" },
      { value: "urgente", label: "Urgente" }
    ];

    // Orígenes de cita
    const origenes = [
      { value: "presencial", label: "Presencial" },
      { value: "telefono", label: "Teléfono" },
      { value: "web", label: "Web" },
      { value: "whatsapp", label: "WhatsApp" },
      { value: "chatbot", label: "Chatbot" },
      { value: "app_movil", label: "App móvil" }
    ];

    // Tipos de cita (enum de la tabla citas)
    const tiposEnum = [
      { value: "primera_vez", label: "Primera vez" },
      { value: "control", label: "Control" },
      { value: "procedimiento", label: "Procedimiento" },
      { value: "urgencia", label: "Urgencia" },
      { value: "telemedicina", label: "Telemedicina" }
    ];

    // Tipos de sala
    const tiposSala = [
      { value: "consulta", label: "Consulta" },
      { value: "procedimiento", label: "Procedimiento" },
      { value: "cirugia", label: "Cirugía" },
      { value: "telemedicina", label: "Telemedicina" },
      { value: "reuniones", label: "Reuniones" },
      { value: "otro", label: "Otro" }
    ];

    // Motivos de cancelación
    const motivosCancelacion = [
      { value: "paciente_solicita", label: "Paciente solicita" },
      { value: "medico_no_disponible", label: "Médico no disponible" },
      { value: "error_programacion", label: "Error de programación" },
      { value: "reprogramacion", label: "Reprogramación" },
      { value: "otro", label: "Otro" }
    ];

    // Tipos de recordatorio
    const tiposRecordatorio = [
      { value: "email", label: "Email" },
      { value: "sms", label: "SMS" },
      { value: "whatsapp", label: "WhatsApp" },
      { value: "llamada", label: "Llamada" },
      { value: "app_notificacion", label: "Notificación App" }
    ];

    // Tipo de confirmación
    const tiposConfirmacion = [
      { value: "email", label: "Email" },
      { value: "sms", label: "SMS" },
      { value: "whatsapp", label: "WhatsApp" },
      { value: "llamada", label: "Llamada" },
      { value: "presencial", label: "Presencial" },
      { value: "app_movil", label: "App móvil" }
    ];

    // Tipos de cancelado por
    const tiposCanceladoPor = [
      { value: "medico", label: "Médico" },
      { value: "secretaria", label: "Secretaría" },
      { value: "administrativo", label: "Administrativo" },
      { value: "paciente", label: "Paciente" },
      { value: "sistema", label: "Sistema" }
    ];

    // ==================== ESTADÍSTICAS ADICIONALES ====================
    // Contar totales por categoría
    const [totales]: any = await pool.query(
      `SELECT 
        (SELECT COUNT(*) FROM centros_medicos WHERE activo = 1) AS total_centros,
        (SELECT COUNT(*) FROM sucursales WHERE activo = 1) AS total_sucursales,
        (SELECT COUNT(*) FROM medicos WHERE activo = 1) AS total_medicos,
        (SELECT COUNT(*) FROM pacientes WHERE activo = 1) AS total_pacientes,
        (SELECT COUNT(*) FROM tipos_cita WHERE activo = 1) AS total_tipos_cita,
        (SELECT COUNT(*) FROM salas WHERE estado IN ('activa', 'ocupada')) AS total_salas,
        (SELECT COUNT(*) FROM especialidades WHERE activo = 1) AS total_especialidades
      `
    );

    // ==================== RESPUESTA ====================
    return NextResponse.json({
      success: true,
      // Opciones principales
      centros: centros || [],
      sucursales: sucursales || [],
      medicos: medicos || [],
      pacientes: pacientes || [],
      tipos: tiposCita || [], // tipos de cita configurados en tipos_cita
      salas: salas || [],
      especialidades: especialidades || [],
      
      // Opciones estáticas (enums)
      estados: estados,
      prioridades: prioridades,
      origenes: origenes,
      tiposEnum: tiposEnum, // tipos de la tabla citas (enum)
      tiposSala: tiposSala,
      motivosCancelacion: motivosCancelacion,
      tiposRecordatorio: tiposRecordatorio,
      tiposConfirmacion: tiposConfirmacion,
      tiposCanceladoPor: tiposCanceladoPor,
      
      // Metadatos
      totales: totales?.[0] || {},
      timestamp: new Date().toISOString(),
    });

  } catch (error: any) {
    console.error("❌ GET /api/admin/citas/opciones:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || "Error al obtener opciones",
        details: process.env.NODE_ENV === "development" ? error.stack : undefined
      }, 
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/citas/opciones
 * Búsqueda avanzada de pacientes (para autocompletado)
 */
export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { 
      buscar, // término de búsqueda
      tipo = "pacientes", // qué tipo buscar: pacientes, medicos, salas, etc
      id_centro, // filtrar por centro
      limite = 50 
    } = body;

    if (!buscar || buscar.trim().length < 2) {
      return NextResponse.json({
        success: false,
        error: "Debe ingresar al menos 2 caracteres para buscar"
      }, { status: 400 });
    }

    const searchTerm = `%${buscar.trim()}%`;
    let resultados: any[] = [];

    // ==================== BÚSQUEDA SEGÚN TIPO ====================
    switch (tipo) {
      case "pacientes":
        const [pacientesRes]: any = await pool.query(
          `SELECT 
            id_paciente AS value,
            CONCAT(nombre, ' ', apellido_paterno, ' ', IFNULL(apellido_materno, ''), ' (', rut, ')') AS label,
            rut,
            nombre,
            apellido_paterno,
            apellido_materno,
            email,
            telefono,
            fecha_nacimiento
           FROM pacientes
           WHERE activo = 1
             AND (
               nombre LIKE ? OR
               apellido_paterno LIKE ? OR
               apellido_materno LIKE ? OR
               rut LIKE ? OR
               email LIKE ?
             )
           ORDER BY apellido_paterno ASC, nombre ASC
           LIMIT ?`,
          [searchTerm, searchTerm, searchTerm, searchTerm, searchTerm, Number(limite)]
        );
        resultados = pacientesRes || [];
        break;

      case "medicos":
        const whereClauseMedico = id_centro ? `AND m.id_centro = ${Number(id_centro)}` : "";
        const [medicosRes]: any = await pool.query(
          `SELECT 
            m.id_medico AS value,
            CONCAT(u.nombre, ' ', u.apellido_paterno, ' ', IFNULL(u.apellido_materno, '')) AS label,
            m.id_centro,
            m.rut,
            m.registro_nacional,
            c.nombre AS centro_nombre,
            GROUP_CONCAT(DISTINCT e.nombre ORDER BY e.nombre SEPARATOR ', ') AS especialidades
           FROM medicos m
           INNER JOIN usuarios u ON u.id_usuario = m.id_usuario
           INNER JOIN centros_medicos c ON c.id_centro = m.id_centro
           LEFT JOIN medicos_especialidades me ON me.id_medico = m.id_medico
           LEFT JOIN especialidades e ON e.id_especialidad = me.id_especialidad
           WHERE m.activo = 1 AND u.activo = 1
             ${whereClauseMedico}
             AND (
               u.nombre LIKE ? OR
               u.apellido_paterno LIKE ? OR
               u.apellido_materno LIKE ? OR
               m.rut LIKE ? OR
               m.registro_nacional LIKE ?
             )
           GROUP BY m.id_medico, u.nombre, u.apellido_paterno, u.apellido_materno,
                    m.id_centro, m.rut, m.registro_nacional, c.nombre
           ORDER BY u.apellido_paterno ASC, u.nombre ASC
           LIMIT ?`,
          [searchTerm, searchTerm, searchTerm, searchTerm, searchTerm, Number(limite)]
        );
        resultados = medicosRes || [];
        break;

      case "salas":
        const whereClauseSala = id_centro ? `AND s.id_centro = ${Number(id_centro)}` : "";
        const [salasRes]: any = await pool.query(
          `SELECT 
            s.id_sala AS value,
            CONCAT(s.nombre, ' - ', s.tipo) AS label,
            s.id_centro,
            s.id_sucursal,
            s.nombre,
            s.tipo,
            s.piso,
            s.estado,
            c.nombre AS centro_nombre
           FROM salas s
           INNER JOIN centros_medicos c ON c.id_centro = s.id_centro
           WHERE s.estado IN ('activa', 'ocupada')
             ${whereClauseSala}
             AND s.nombre LIKE ?
           ORDER BY s.nombre ASC
           LIMIT ?`,
          [searchTerm, Number(limite)]
        );
        resultados = salasRes || [];
        break;

      case "especialidades":
        const [especialidadesRes]: any = await pool.query(
          `SELECT 
            id_especialidad AS value,
            nombre AS label,
            descripcion,
            codigo_fonasa
           FROM especialidades
           WHERE activo = 1
             AND nombre LIKE ?
           ORDER BY nombre ASC
           LIMIT ?`,
          [searchTerm, Number(limite)]
        );
        resultados = especialidadesRes || [];
        break;

      default:
        return NextResponse.json({
          success: false,
          error: `Tipo de búsqueda no soportado: ${tipo}`
        }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      resultados: resultados,
      total: resultados.length,
      tipo: tipo,
      buscar: buscar
    });

  } catch (error: any) {
    console.error("❌ POST /api/admin/citas/opciones:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || "Error en búsqueda",
        details: process.env.NODE_ENV === "development" ? error.stack : undefined
      }, 
      { status: 500 }
    );
  }
}