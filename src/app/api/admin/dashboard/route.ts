// src/app/api/admin/dashboard/route.ts
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { RowDataPacket } from "mysql2";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const timeRange = searchParams.get("timeRange") || "7d";

    // ============================================================
    // 📊 ESTADÍSTICAS PRINCIPALES
    // ============================================================

    // 1. CENTROS MÉDICOS
    const [centrosStatsRows] = await pool.query<RowDataPacket[]>(`
      SELECT 
        COUNT(*) as total_centros,
        SUM(CASE WHEN estado='activo' THEN 1 ELSE 0 END) as centros_activos,
        SUM(CASE WHEN estado='inactivo' THEN 1 ELSE 0 END) as centros_inactivos,
        SUM(CASE WHEN estado='suspendido' THEN 1 ELSE 0 END) as centros_suspendidos
      FROM centros_medicos
    `);

    const centrosStats = centrosStatsRows[0] || {
      total_centros: 0,
      centros_activos: 0,
      centros_inactivos: 0,
      centros_suspendidos: 0,
    };

    // 2. USUARIOS
    const [usuariosStatsRows] = await pool.query<RowDataPacket[]>(`
      SELECT 
        COUNT(*) as total_usuarios,
        SUM(CASE WHEN estado='activo' THEN 1 ELSE 0 END) as usuarios_activos,
        SUM(CASE WHEN estado='bloqueado' THEN 1 ELSE 0 END) as usuarios_bloqueados,
        SUM(CASE WHEN estado='pendiente_activacion' THEN 1 ELSE 0 END) as usuarios_pendientes
      FROM usuarios
    `);

    const usuariosStats = usuariosStatsRows[0] || {
      total_usuarios: 0,
      usuarios_activos: 0,
      usuarios_bloqueados: 0,
      usuarios_pendientes: 0,
    };

    // 3. PROFESIONALES (MÉDICOS) DESDE profesionales_salud
    const [medicosStatsRows] = await pool.query<RowDataPacket[]>(`
      SELECT 
        COUNT(*) as total_medicos,
        SUM(CASE WHEN estado='activo' THEN 1 ELSE 0 END) as medicos_activos
      FROM profesionales_salud
      WHERE tipo_profesional = 'medico'
    `);

    const medicosStats = medicosStatsRows[0] || {
      total_medicos: 0,
      medicos_activos: 0,
    };

    // Total especialidades (catálogo)
    const [especialidadesRows] = await pool.query<RowDataPacket[]>(`
      SELECT COUNT(DISTINCT id_especialidad) as total_especialidades 
      FROM especialidades 
      WHERE activo = 1
    `);

    const total_especialidades =
      especialidadesRows[0]?.total_especialidades || 0;

    // 4. PACIENTES
    const [pacientesStatsRows] = await pool.query<RowDataPacket[]>(`
      SELECT 
        COUNT(*) as total_pacientes,
        SUM(CASE WHEN estado='activo' THEN 1 ELSE 0 END) as pacientes_activos,
        SUM(
          CASE 
            WHEN MONTH(fecha_registro) = MONTH(CURDATE()) 
             AND YEAR(fecha_registro) = YEAR(CURDATE()) 
            THEN 1 ELSE 0 
          END
        ) as nuevos_pacientes_mes
      FROM pacientes
    `);

    const pacientesStats = pacientesStatsRows[0] || {
      total_pacientes: 0,
      pacientes_activos: 0,
      nuevos_pacientes_mes: 0,
    };

    // 5. CONSULTAS (historial_clinico)
    const [consultasStatsRows] = await pool.query<RowDataPacket[]>(`
      SELECT 
        SUM(CASE WHEN DATE(fecha_atencion) = CURDATE() THEN 1 ELSE 0 END) as consultas_hoy,
        SUM(
          CASE 
            WHEN MONTH(fecha_atencion) = MONTH(CURDATE()) 
             AND YEAR(fecha_atencion) = YEAR(CURDATE()) 
            THEN 1 ELSE 0 
          END
        ) as consultas_mes,
        SUM(
          CASE 
            WHEN YEAR(fecha_atencion) = YEAR(CURDATE()) 
            THEN 1 ELSE 0 
          END
        ) as consultas_ano
      FROM historial_clinico
    `);

    const consultasStats = consultasStatsRows[0] || {
      consultas_hoy: 0,
      consultas_mes: 0,
      consultas_ano: 0,
    };

    // 6. FACTURACIÓN
    const [facturacionStatsRows] = await pool.query<RowDataPacket[]>(`
      SELECT 
        IFNULL(
          SUM(
            CASE 
              WHEN MONTH(fecha_emision) = MONTH(CURDATE()) 
               AND YEAR(fecha_emision) = YEAR(CURDATE()) 
              THEN total ELSE 0 
            END
          ),
          0
        ) as ingresos_mes,
        IFNULL(
          SUM(
            CASE 
              WHEN YEAR(fecha_emision) = YEAR(CURDATE()) 
              THEN total ELSE 0 
            END
          ),
          0
        ) as ingresos_ano,
        IFNULL(
          SUM(
            CASE 
              WHEN estado = 'pendiente' 
              THEN total ELSE 0 
            END
          ),
          0
        ) as pendiente_cobro
      FROM facturacion
    `);

    const facturacionStats = facturacionStatsRows[0] || {
      ingresos_mes: 0,
      ingresos_ano: 0,
      pendiente_cobro: 0,
    };

    // 7. USUARIOS CONECTADOS (últimos 15 minutos)
    const [sistemaStatsRows] = await pool.query<RowDataPacket[]>(`
      SELECT COUNT(DISTINCT id_usuario) as usuarios_conectados
      FROM logs_sistema
      WHERE fecha_hora >= DATE_SUB(NOW(), INTERVAL 15 MINUTE)
    `);

    const usuarios_conectados =
      sistemaStatsRows[0]?.usuarios_conectados || 0;

    // ============================================================
    // 🏥 CENTROS MÉDICOS DETALLADOS
    // ============================================================
    const [centrosMedicos] = await pool.query<RowDataPacket[]>(`
      SELECT 
        cm.*,
        COUNT(DISTINCT u.id_usuario) as usuarios_count,
        COUNT(DISTINCT p.id_paciente) as pacientes_count,
        COUNT(
          DISTINCT 
          CASE 
            WHEN MONTH(hc.fecha_atencion) = MONTH(CURDATE()) 
             AND YEAR(hc.fecha_atencion) = YEAR(CURDATE()) 
            THEN hc.id_historial 
          END
        ) as consultas_mes,
        'Hace 2 horas' as ultima_actividad,
        CASE 
          WHEN cm.capacidad_pacientes_dia > 100 THEN 'enterprise'
          WHEN cm.capacidad_pacientes_dia > 50 THEN 'profesional'
          ELSE 'basico'
        END as plan,
        4.5 as satisfaccion
      FROM centros_medicos cm
      LEFT JOIN usuarios u 
        ON cm.id_centro = u.id_centro_principal 
       AND u.estado = 'activo'
      LEFT JOIN pacientes p 
        ON cm.id_centro = p.id_centro_registro 
       AND p.estado = 'activo'
      LEFT JOIN historial_clinico hc 
        ON cm.id_centro = hc.id_centro
      GROUP BY cm.id_centro
      ORDER BY cm.fecha_creacion DESC
      LIMIT 10
    `);

    // ============================================================
    // 👥 USUARIOS RECIENTES (detectando tipo por profesionales_salud)
    // ============================================================
    const [usuariosRecientes] = await pool.query<RowDataPacket[]>(`
      SELECT 
        u.*,
        COALESCE(r.nombre, 'Sin Rol') as rol_nombre,
        COALESCE(r.nivel_jerarquia, 0) as rol_nivel,
        COALESCE(cm.nombre, 'Sin Centro') as centro_nombre,
        s.nombre as sucursal_nombre,
        CASE
          WHEN EXISTS(
            SELECT 1 
            FROM profesionales_salud ps 
            WHERE ps.id_usuario = u.id_usuario 
              AND ps.tipo_profesional = 'medico'
          ) THEN 'medico'
          WHEN EXISTS(
            SELECT 1 
            FROM profesionales_salud ps 
            WHERE ps.id_usuario = u.id_usuario 
              AND ps.tipo_profesional <> 'medico'
          ) THEN 'profesional_salud'
          WHEN EXISTS(
            SELECT 1 
            FROM administrativos a 
            WHERE a.id_usuario = u.id_usuario
          ) THEN 'administrativo'
          WHEN EXISTS(
            SELECT 1 
            FROM secretarias sec 
            WHERE sec.id_usuario = u.id_usuario
          ) THEN 'secretaria'
          WHEN EXISTS(
            SELECT 1 
            FROM tecnicos t 
            WHERE t.id_usuario = u.id_usuario
          ) THEN 'tecnico'
          ELSE 'super_admin'
        END as tipo_usuario
      FROM usuarios u
      LEFT JOIN usuarios_roles ur 
        ON u.id_usuario = ur.id_usuario 
       AND ur.activo = 1
      LEFT JOIN roles r 
        ON ur.id_rol = r.id_rol
      LEFT JOIN centros_medicos cm 
        ON u.id_centro_principal = cm.id_centro
      LEFT JOIN sucursales s 
        ON u.id_sucursal_principal = s.id_sucursal
      ORDER BY u.fecha_creacion DESC
      LIMIT 10
    `);

    // ============================================================
    // 👨‍⚕️ PROFESIONALES (MÉDICOS) DESTACADOS
    //   -> se basa en profesionales_salud, filtrando tipo_profesional='medico'
    // ============================================================
    const [medicosDestacados] = await pool.query<RowDataPacket[]>(`
      SELECT 
        ps.id_profesional AS id_profesional,
        CONCAT(
          u.nombre, ' ', 
          u.apellido_paterno, ' ', 
          IFNULL(u.apellido_materno, '')
        ) as nombre_completo,
        COALESCE(e.nombre, 'Medicina General') as especialidad_principal,
        COALESCE(cm.nombre, 'Sin Centro') as centro_nombre,
        COUNT(DISTINCT hc.id_paciente) as pacientes_activos,
        COUNT(
          DISTINCT 
          CASE 
            WHEN MONTH(hc.fecha_atencion) = MONTH(CURDATE()) 
             AND YEAR(hc.fecha_atencion) = YEAR(CURDATE()) 
            THEN hc.id_historial 
          END
        ) as consultas_mes,
        ps.calificacion_promedio as calificacion_promedio,
        CASE 
          WHEN ps.anos_experiencia IS NOT NULL 
               AND ps.anos_experiencia > 0 
          THEN ps.anos_experiencia
          WHEN ps.ano_graduacion IS NOT NULL 
          THEN YEAR(CURDATE()) - ps.ano_graduacion
          ELSE 0
        END as anos_experiencia,
        ps.estado,
        ps.numero_registro_profesional as cedula_profesional,
        ps.universidad as universidad_origen
      FROM profesionales_salud ps
      INNER JOIN usuarios u 
        ON ps.id_usuario = u.id_usuario
      LEFT JOIN centros_medicos cm 
        ON ps.id_centro_principal = cm.id_centro
      LEFT JOIN profesionales_especialidades pe 
        ON ps.id_profesional = pe.id_profesional 
       AND pe.es_principal = 1
      LEFT JOIN especialidades e 
        ON pe.id_especialidad = e.id_especialidad
      LEFT JOIN historial_clinico hc 
        ON hc.id_profesional = ps.id_profesional
      WHERE ps.estado = 'activo'
        AND ps.tipo_profesional = 'medico'
      GROUP BY ps.id_profesional
      ORDER BY ps.fecha_creacion DESC
      LIMIT 5
    `);

    // ============================================================
    // 📋 ACTIVIDAD RECIENTE
    // ============================================================
    const [actividadReciente] = await pool.query<RowDataPacket[]>(`
      SELECT 
        l.*,
        CONCAT(
          COALESCE(u.nombre, 'Sistema'), ' ', 
          COALESCE(u.apellido_paterno, '')
        ) as usuario_nombre,
        cm.nombre as centro_nombre
      FROM logs_sistema l
      LEFT JOIN usuarios u 
        ON l.id_usuario = u.id_usuario
      LEFT JOIN usuarios_roles ur 
        ON u.id_usuario = ur.id_usuario 
       AND ur.activo = 1
      LEFT JOIN centros_medicos cm 
        ON ur.id_centro = cm.id_centro
      ORDER BY l.fecha_hora DESC
      LIMIT 20
    `);

    // ============================================================
    // 🚨 ALERTAS DEL SISTEMA (mock por ahora)
    // ============================================================
    const alertas = [
      {
        id: "alert-1",
        tipo: "advertencia" as const,
        titulo: "Espacio en disco bajo",
        mensaje:
          "El servidor principal tiene menos del 20% de espacio disponible",
        timestamp: new Date().toISOString(),
        leida: false,
        modulo: "Sistema",
        accion_requerida: "Liberar espacio o ampliar capacidad",
        prioridad: 2,
      },
      {
        id: "alert-2",
        tipo: "info" as const,
        titulo: "Actualización disponible",
        mensaje:
          "Nueva versión 2.6.0 disponible con mejoras de seguridad",
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        leida: false,
        modulo: "Actualizaciones",
        prioridad: 1,
      },
    ];

    // ============================================================
    // 🔢 CÁLCULOS DERIVADOS (para campos avanzados del dashboard)
    // ============================================================
    const consultasMesNumber =
      Number(consultasStats.consultas_mes) || 0;
    const ingresosMesNumber =
      Number(facturacionStats.ingresos_mes) || 0;

    const costo_promedio_consulta =
      consultasMesNumber > 0
        ? Math.round(ingresosMesNumber / consultasMesNumber)
        : 0;

    // Valores de ejemplo (los puedes reemplazar por cálculos reales)
    const tasa_ocupacion = 85.0;
    const eficiencia_medicos = 92.0;
    const retorno_pacientes = 68.0;
    const margen_ganancia = 35.0;
    const velocidad_respuesta_ms = 180;

    // ============================================================
    // 📊 RESPUESTA FINAL CON VALORES SEGUROS
    // ============================================================
    const estadisticas = {
      // Centros
      total_centros: Number(centrosStats.total_centros) || 0,
      centros_activos: Number(centrosStats.centros_activos) || 0,
      centros_inactivos: Number(centrosStats.centros_inactivos) || 0,
      centros_suspendidos: Number(centrosStats.centros_suspendidos) || 0,

      // Usuarios
      total_usuarios: Number(usuariosStats.total_usuarios) || 0,
      usuarios_activos: Number(usuariosStats.usuarios_activos) || 0,
      usuarios_bloqueados: Number(usuariosStats.usuarios_bloqueados) || 0,
      usuarios_pendientes: Number(usuariosStats.usuarios_pendientes) || 0,

      // Profesionales (médicos)
      total_medicos: Number(medicosStats.total_medicos) || 0,
      medicos_activos: Number(medicosStats.medicos_activos) || 0,
      total_especialidades: Number(total_especialidades) || 0,

      // Pacientes
      total_pacientes: Number(pacientesStats.total_pacientes) || 0,
      pacientes_activos: Number(pacientesStats.pacientes_activos) || 0,
      nuevos_pacientes_mes:
        Number(pacientesStats.nuevos_pacientes_mes) || 0,

      // Consultas
      consultas_hoy: Number(consultasStats.consultas_hoy) || 0,
      consultas_mes: consultasMesNumber,
      consultas_ano: Number(consultasStats.consultas_ano) || 0,

      // Facturación
      ingresos_mes: ingresosMesNumber,
      ingresos_ano: Number(facturacionStats.ingresos_ano) || 0,
      pendiente_cobro: Number(facturacionStats.pendiente_cobro) || 0,

      // Sistema / Performance
      usuarios_conectados: Number(usuarios_conectados) || 0,
      uptime_sistema: 99.8,
      espacio_usado_gb: 45.2,
      espacio_total_gb: 500,
      satisfaccion_promedio: 4.7,
      tiempo_espera_promedio: 15,
      tasa_cancelacion: 2.3,

      // Campos avanzados extra que usa el frontend
      tasa_ocupacion,
      eficiencia_medicos,
      retorno_pacientes,
      costo_promedio_consulta,
      margen_ganancia,
      velocidad_respuesta_ms,
    };

    console.log("✅ Estadísticas cargadas:", estadisticas);
    console.log("✅ Centros encontrados:", centrosMedicos.length);
    console.log("✅ Usuarios encontrados:", usuariosRecientes.length);
    console.log(
      "✅ Profesionales (médicos) encontrados:",
      medicosDestacados.length
    );
    console.log("✅ Actividades encontradas:", actividadReciente.length);

    return NextResponse.json({
      success: true,
      estadisticas,
      centros: centrosMedicos,
      usuarios: usuariosRecientes,
      medicos: medicosDestacados, // sigue llamándose "medicos" para el frontend
      actividades: actividadReciente,
      alertas,
      timestamp: new Date().toISOString(),
      debug: {
        timeRange,
        hasData: {
          centros: centrosMedicos.length > 0,
          usuarios: usuariosRecientes.length > 0,
          medicos: medicosDestacados.length > 0,
          actividades: actividadReciente.length > 0,
        },
      },
    });
  } catch (error: any) {
    console.error("❌ Error en dashboard admin:", error);
    console.error("Stack:", error.stack);

    return NextResponse.json(
      {
        success: false,
        error: "Error al cargar datos del dashboard",
        details: error.message,
        stack:
          process.env.NODE_ENV === "development"
            ? error.stack
            : undefined,
      },
      { status: 500 }
    );
  }
}
