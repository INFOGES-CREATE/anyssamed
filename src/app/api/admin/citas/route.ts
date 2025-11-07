// frontend/src/app/api/admin/citas/route.ts

import { NextResponse } from "next/server";
import pool from "@/lib/db";

const toBool = (v: any) => (v ? 1 : 0);

/**
 * GET /api/admin/citas
 * Listado de citas con filtros avanzados, paginación y estadísticas
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    // ==================== PARÁMETROS DE PAGINACIÓN ====================
    const pagina = Math.max(1, Number(searchParams.get("pagina")) || 1);
    const pageSize = Math.max(1, Math.min(100, Number(searchParams.get("pageSize")) || 20));
    const offset = (pagina - 1) * pageSize;

    // ==================== PARÁMETROS DE FILTROS ====================
    const id_centro = searchParams.get("id_centro");
    const id_medico = searchParams.get("id_medico");
    const id_sucursal = searchParams.get("id_sucursal");
    const id_paciente = searchParams.get("id_paciente");
    const estado = searchParams.get("estado");
    const prioridad = searchParams.get("prioridad");
    const origen = searchParams.get("origen");
    const tipo_cita = searchParams.get("tipo_cita");
    const id_sala = searchParams.get("id_sala");
    const pagada = searchParams.get("pagada");
    const recordatorio_enviado = searchParams.get("recordatorio_enviado");
    const confirmado_por_paciente = searchParams.get("confirmado_por_paciente");
    const search = searchParams.get("search"); // búsqueda en paciente, rut, médico
    const desde = searchParams.get("desde"); // fecha desde
    const hasta = searchParams.get("hasta"); // fecha hasta

    // ==================== CONSTRUCCIÓN DE FILTROS ====================
    let whereClauses: string[] = ["1=1"]; // siempre verdadero para facilitar construcción
    let queryParams: any[] = [];

    if (id_centro) {
      whereClauses.push("c.id_centro = ?");
      queryParams.push(Number(id_centro));
    }

    if (id_medico) {
      whereClauses.push("c.id_medico = ?");
      queryParams.push(Number(id_medico));
    }

    if (id_sucursal) {
      whereClauses.push("c.id_sucursal = ?");
      queryParams.push(Number(id_sucursal));
    }

    if (id_paciente) {
      whereClauses.push("c.id_paciente = ?");
      queryParams.push(Number(id_paciente));
    }

    if (estado) {
      whereClauses.push("c.estado = ?");
      queryParams.push(estado);
    }

    if (prioridad) {
      whereClauses.push("c.prioridad = ?");
      queryParams.push(prioridad);
    }

    if (origen) {
      whereClauses.push("c.origen = ?");
      queryParams.push(origen);
    }

    if (tipo_cita) {
      whereClauses.push("c.tipo_cita = ?");
      queryParams.push(tipo_cita);
    }

    if (id_sala) {
      whereClauses.push("c.id_sala = ?");
      queryParams.push(Number(id_sala));
    }

    if (pagada !== null && pagada !== undefined && pagada !== "") {
      whereClauses.push("c.pagada = ?");
      queryParams.push(Number(pagada));
    }

    if (recordatorio_enviado !== null && recordatorio_enviado !== undefined && recordatorio_enviado !== "") {
      whereClauses.push("c.recordatorio_enviado = ?");
      queryParams.push(Number(recordatorio_enviado));
    }

    if (confirmado_por_paciente !== null && confirmado_por_paciente !== undefined && confirmado_por_paciente !== "") {
      whereClauses.push("c.confirmado_por_paciente = ?");
      queryParams.push(Number(confirmado_por_paciente));
    }

    // Filtro de búsqueda (paciente, RUT, médico)
    if (search && search.trim()) {
      whereClauses.push(
        `(
          p.nombre LIKE ? OR 
          p.apellido_paterno LIKE ? OR 
          p.apellido_materno LIKE ? OR 
          p.rut LIKE ? OR
          CONCAT(u.nombre, ' ', u.apellido_paterno, ' ', IFNULL(u.apellido_materno, '')) LIKE ?
        )`
      );
      const searchTerm = `%${search.trim()}%`;
      queryParams.push(searchTerm, searchTerm, searchTerm, searchTerm, searchTerm);
    }

    // Filtro de fechas
    if (desde) {
      whereClauses.push("DATE(c.fecha_hora_inicio) >= ?");
      queryParams.push(desde);
    }

    if (hasta) {
      whereClauses.push("DATE(c.fecha_hora_inicio) <= ?");
      queryParams.push(hasta);
    }

    const whereSQL = whereClauses.join(" AND ");

    // ==================== CONSULTA PRINCIPAL ====================
    const [citas]: any = await pool.query(
      `SELECT 
        c.*,
        p.rut AS paciente_rut,
        p.email AS paciente_email,
        p.telefono AS paciente_telefono,
        CONCAT(p.nombre, ' ', p.apellido_paterno, ' ', IFNULL(p.apellido_materno, '')) AS paciente_nombre,
        CONCAT(u.nombre, ' ', u.apellido_paterno, ' ', IFNULL(u.apellido_materno, '')) AS medico_nombre,
        cm.nombre AS centro_nombre,
        s.nombre AS sucursal_nombre,
        sa.nombre AS sala_nombre,
        e.nombre AS especialidad_nombre,
        GROUP_CONCAT(DISTINCT esp.nombre ORDER BY esp.nombre SEPARATOR ', ') AS medico_especialidad
       FROM citas c
       INNER JOIN pacientes p ON p.id_paciente = c.id_paciente
       INNER JOIN medicos m ON m.id_medico = c.id_medico
       INNER JOIN usuarios u ON u.id_usuario = m.id_usuario
       INNER JOIN centros_medicos cm ON cm.id_centro = c.id_centro
       LEFT JOIN sucursales s ON s.id_sucursal = c.id_sucursal
       LEFT JOIN salas sa ON sa.id_sala = c.id_sala
       LEFT JOIN especialidades e ON e.id_especialidad = c.id_especialidad
       LEFT JOIN medicos_especialidades me ON me.id_medico = m.id_medico
       LEFT JOIN especialidades esp ON esp.id_especialidad = me.id_especialidad
       WHERE ${whereSQL}
       GROUP BY c.id_cita, p.rut, p.email, p.telefono, p.nombre, p.apellido_paterno, p.apellido_materno,
                u.nombre, u.apellido_paterno, u.apellido_materno, cm.nombre, s.nombre, sa.nombre, e.nombre
       ORDER BY c.fecha_hora_inicio DESC
       LIMIT ? OFFSET ?`,
      [...queryParams, pageSize, offset]
    );

    // ==================== CONTEO TOTAL ====================
    const [countResult]: any = await pool.query(
      `SELECT COUNT(DISTINCT c.id_cita) AS total
       FROM citas c
       INNER JOIN pacientes p ON p.id_paciente = c.id_paciente
       INNER JOIN medicos m ON m.id_medico = c.id_medico
       INNER JOIN usuarios u ON u.id_usuario = m.id_usuario
       INNER JOIN centros_medicos cm ON cm.id_centro = c.id_centro
       LEFT JOIN sucursales s ON s.id_sucursal = c.id_sucursal
       LEFT JOIN salas sa ON sa.id_sala = c.id_sala
       LEFT JOIN especialidades e ON e.id_especialidad = c.id_especialidad
       WHERE ${whereSQL}`,
      queryParams
    );

    const total = countResult?.[0]?.total || 0;

    // ==================== ESTADÍSTICAS ====================
    const [statsResult]: any = await pool.query(
      `SELECT 
        COUNT(*) AS total_citas,
        SUM(CASE WHEN c.estado = 'programada' THEN 1 ELSE 0 END) AS programadas,
        SUM(CASE WHEN c.estado = 'confirmada' THEN 1 ELSE 0 END) AS confirmadas,
        SUM(CASE WHEN c.estado = 'completada' THEN 1 ELSE 0 END) AS completadas,
        SUM(CASE WHEN c.estado = 'cancelada' THEN 1 ELSE 0 END) AS canceladas,
        SUM(CASE WHEN c.estado = 'no_asistio' THEN 1 ELSE 0 END) AS no_asistio,
        SUM(CASE WHEN c.pagada = 1 AND c.monto IS NOT NULL THEN c.monto ELSE 0 END) AS ingresos_total,
        SUM(CASE WHEN c.pagada = 0 AND c.monto IS NOT NULL THEN c.monto ELSE 0 END) AS ingresos_pendientes,
        ROUND(
          (SUM(CASE WHEN c.estado IN ('completada', 'confirmada') THEN 1 ELSE 0 END) * 100.0) / 
          NULLIF(COUNT(*), 0), 
          2
        ) AS tasa_asistencia,
        ROUND(AVG(c.duracion_minutos), 0) AS promedio_duracion
       FROM citas c
       INNER JOIN pacientes p ON p.id_paciente = c.id_paciente
       INNER JOIN medicos m ON m.id_medico = c.id_medico
       INNER JOIN usuarios u ON u.id_usuario = m.id_usuario
       INNER JOIN centros_medicos cm ON cm.id_centro = c.id_centro
       LEFT JOIN sucursales s ON s.id_sucursal = c.id_sucursal
       LEFT JOIN salas sa ON sa.id_sala = c.id_sala
       LEFT JOIN especialidades e ON e.id_especialidad = c.id_especialidad
       WHERE ${whereSQL}`,
      queryParams
    );

    const stats = statsResult?.[0] || {};
    
    // Asegurar que todos los valores sean números válidos
    const processedStats = {
      total_citas: Number(stats.total_citas) || 0,
      programadas: Number(stats.programadas) || 0,
      confirmadas: Number(stats.confirmadas) || 0,
      completadas: Number(stats.completadas) || 0,
      canceladas: Number(stats.canceladas) || 0,
      no_asistio: Number(stats.no_asistio) || 0,
      ingresos_total: Number(stats.ingresos_total) || 0,
      ingresos_pendientes: Number(stats.ingresos_pendientes) || 0,
      tasa_asistencia: Number(stats.tasa_asistencia) || 0,
      promedio_duracion: Number(stats.promedio_duracion) || 0,
    };

    // ==================== RESPUESTA ====================
    return NextResponse.json({
      success: true,
      citas: citas || [],
      total: total,
      pagina: pagina,
      pageSize: pageSize,
      totalPaginas: Math.ceil(total / pageSize),
      stats: processedStats,
    });

  } catch (error: any) {
    console.error("❌ GET /api/admin/citas:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Error al obtener citas",
        details: process.env.NODE_ENV === "development" ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/citas
 * Crear una nueva cita
 */
export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));

    const {
      id_paciente,
      id_medico,
      id_centro,
      id_sucursal = null,
      fecha_hora_inicio,
      duracion_minutos,
      tipo_cita,
      motivo = null,
      prioridad = "normal",
      id_especialidad = null,
      origen = "web",
      pagada = 0,
      monto = null,
      id_sala = null,
      notas = null,
      notas_privadas = null,
      creado_por,
    } = body;

    // ==================== VALIDACIONES ====================
    if (!id_paciente || !id_medico || !id_centro || !fecha_hora_inicio || !tipo_cita) {
      return NextResponse.json(
        {
          success: false,
          error: "Faltan campos requeridos: id_paciente, id_medico, id_centro, fecha_hora_inicio, tipo_cita",
        },
        { status: 400 }
      );
    }

    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();

      // Calcular fecha_hora_fin
      const inicio = new Date(fecha_hora_inicio);
      let dur = Number(duracion_minutos);

      // Si no se proporciona duración, obtener la predeterminada del tipo de cita
      if (!dur || dur <= 0) {
        const [tipoCitaRows]: any = await conn.query(
          `SELECT duracion_predeterminada FROM tipos_cita WHERE nombre = ? LIMIT 1`,
          [tipo_cita]
        );
        dur = tipoCitaRows?.[0]?.duracion_predeterminada || 30;
      }

      const fin = new Date(inicio.getTime() + dur * 60000);

      // ==================== VERIFICAR DISPONIBILIDAD ====================
      // Verificar que el médico no tenga otra cita en ese horario
      const [overlap]: any = await conn.query(
        `SELECT COUNT(*) AS solapes
         FROM citas
         WHERE id_medico = ?
           AND estado IN ('programada', 'confirmada', 'en_sala_espera', 'en_atencion')
           AND (? < fecha_hora_fin) AND (? > fecha_hora_inicio)`,
        [id_medico, inicio, fin]
      );

      if (overlap?.[0]?.solapes > 0) {
        await conn.rollback();
        conn.release();
        return NextResponse.json(
          {
            success: false,
            error: "Colisión de horario: el médico ya tiene otra cita en ese rango de tiempo.",
          },
          { status: 409 }
        );
      }

      // Verificar disponibilidad de sala (si se asigna)
      if (id_sala) {
        const [salaOverlap]: any = await conn.query(
          `SELECT COUNT(*) AS solapes
           FROM citas
           WHERE id_sala = ?
             AND estado IN ('programada', 'confirmada', 'en_sala_espera', 'en_atencion')
             AND (? < fecha_hora_fin) AND (? > fecha_hora_inicio)`,
          [id_sala, inicio, fin]
        );

        if (salaOverlap?.[0]?.solapes > 0) {
          await conn.rollback();
          conn.release();
          return NextResponse.json(
            {
              success: false,
              error: "Colisión de sala: la sala ya está ocupada en ese horario.",
            },
            { status: 409 }
          );
        }
      }

      // ==================== INSERTAR CITA ====================
      const [result]: any = await conn.query(
        `INSERT INTO citas (
          id_paciente, id_medico, id_centro, id_sucursal,
          fecha_hora_inicio, fecha_hora_fin, duracion_minutos,
          tipo_cita, motivo, estado, prioridad, id_especialidad,
          origen, pagada, monto, id_sala, notas, notas_privadas,
          recordatorio_enviado, confirmacion_enviada, confirmado_por_paciente,
          creado_por
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'programada', ?, ?, ?, ?, ?, ?, ?, ?, 0, 0, 0, ?)`,
        [
          id_paciente,
          id_medico,
          id_centro,
          id_sucursal,
          inicio,
          fin,
          dur,
          tipo_cita,
          motivo,
          prioridad,
          id_especialidad,
          origen,
          toBool(pagada),
          monto,
          id_sala,
          notas,
          notas_privadas,
          creado_por || null,
        ]
      );

      await conn.commit();
      conn.release();

      return NextResponse.json({
        success: true,
        message: "Cita creada exitosamente",
        id_cita: result.insertId,
      });

    } catch (e: any) {
      await conn.rollback();
      conn.release();
      console.error("❌ POST /api/admin/citas TX:", e);
      return NextResponse.json(
        { success: false, error: e.message },
        { status: 500 }
      );
    }

  } catch (error: any) {
    console.error("❌ POST /api/admin/citas:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}