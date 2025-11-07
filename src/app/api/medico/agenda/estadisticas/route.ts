// app/api/medico/agenda/estadisticas/route.ts
import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { RowDataPacket } from "mysql2";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const fecha = searchParams.get("fecha");

    if (!fecha) {
      return NextResponse.json(
        { success: false, error: "Falta parámetro de fecha" },
        { status: 400 }
      );
    }

    const sessionToken = getSessionToken(request);
    if (!sessionToken) {
      return NextResponse.json(
        { success: false, error: "No hay sesión activa" },
        { status: 401 }
      );
    }

    const [sesiones] = await pool.query<RowDataPacket[]>(
      `SELECT su.id_usuario, m.id_medico
       FROM sesiones_usuarios su
       INNER JOIN medicos m ON su.id_usuario = m.id_usuario
       WHERE su.token = ? AND su.activa = 1 AND su.fecha_expiracion > NOW()`,
      [sessionToken]
    );

    if (sesiones.length === 0) {
      return NextResponse.json(
        { success: false, error: "Sesión inválida" },
        { status: 401 }
      );
    }

    const idMedico = sesiones[0].id_medico;
    const fechaObj = new Date(fecha);
    const fechaDia = fechaObj.toISOString().split("T")[0];

    // Consultas paralelas para estadísticas
    const [
      totalCitas,
      citasCompletadas,
      citasPendientes,
      citasCanceladas,
      telemedicina,
      ingresos,
      tiempoPromedio,
      pacientesNuevos,
      pacientesControl,
    ] = await Promise.all([
      // Total citas del día
      pool.query<RowDataPacket[]>(
        `SELECT COUNT(*) as total FROM citas 
         WHERE id_medico = ? AND DATE(fecha_hora_inicio) = ?`,
        [idMedico, fechaDia]
      ),

      // Citas completadas
      pool.query<RowDataPacket[]>(
        `SELECT COUNT(*) as total FROM citas 
         WHERE id_medico = ? AND DATE(fecha_hora_inicio) = ? AND estado = 'completada'`,
        [idMedico, fechaDia]
      ),

      // Citas pendientes
      pool.query<RowDataPacket[]>(
        `SELECT COUNT(*) as total FROM citas 
         WHERE id_medico = ? AND DATE(fecha_hora_inicio) = ? 
         AND estado IN ('programada', 'confirmada', 'en_sala_espera', 'en_atencion')`,
        [idMedico, fechaDia]
      ),

      // Citas canceladas
      pool.query<RowDataPacket[]>(
        `SELECT COUNT(*) as total FROM citas 
         WHERE id_medico = ? AND DATE(fecha_hora_inicio) = ? 
         AND estado IN ('cancelada', 'no_asistio')`,
        [idMedico, fechaDia]
      ),

      // Telemedicina
      pool.query<RowDataPacket[]>(
        `SELECT COUNT(*) as total FROM citas 
         WHERE id_medico = ? AND DATE(fecha_hora_inicio) = ? AND tipo_cita = 'telemedicina'`,
        [idMedico, fechaDia]
      ),

      // Ingresos del día
      pool.query<RowDataPacket[]>(
        `SELECT COALESCE(SUM(monto), 0) as total FROM citas 
         WHERE id_medico = ? AND DATE(fecha_hora_inicio) = ? 
         AND pagada = 1 AND estado = 'completada'`,
        [idMedico, fechaDia]
      ),

      // Tiempo promedio de consulta
      pool.query<RowDataPacket[]>(
        `SELECT AVG(duracion_minutos) as promedio FROM citas 
         WHERE id_medico = ? AND DATE(fecha_hora_inicio) = ? AND estado = 'completada'`,
        [idMedico, fechaDia]
      ),

      // Pacientes nuevos
      pool.query<RowDataPacket[]>(
        `SELECT COUNT(*) as total FROM citas 
         WHERE id_medico = ? AND DATE(fecha_hora_inicio) = ? AND tipo_cita = 'primera_vez'`,
        [idMedico, fechaDia]
      ),

      // Pacientes control
      pool.query<RowDataPacket[]>(
        `SELECT COUNT(*) as total FROM citas 
         WHERE id_medico = ? AND DATE(fecha_hora_inicio) = ? AND tipo_cita = 'control'`,
        [idMedico, fechaDia]
      ),
    ]);

    const total = totalCitas[0][0]?.total || 0;
    const completadas = citasCompletadas[0][0]?.total || 0;
    const tasaAsistencia = total > 0 ? Math.round((completadas / total) * 100) : 0;

    // Calcular horas ocupadas y disponibles
    const horasLaborales = 8; // 8 horas de trabajo
    const horasOcupadas = Math.round((completadas * (tiempoPromedio[0][0]?.promedio || 30)) / 60);
    const horasDisponibles = horasLaborales - horasOcupadas;
    const tasaOcupacion = Math.round((horasOcupadas / horasLaborales) * 100);

    const estadisticas = {
      total_citas_dia: total,
      citas_completadas: completadas,
      citas_pendientes: citasPendientes[0][0]?.total || 0,
      citas_canceladas: citasCanceladas[0][0]?.total || 0,
      tasa_asistencia: tasaAsistencia,
      tiempo_promedio_consulta: Math.round(tiempoPromedio[0][0]?.promedio || 0),
      pacientes_nuevos: pacientesNuevos[0][0]?.total || 0,
      pacientes_control: pacientesControl[0][0]?.total || 0,
      telemedicina_total: telemedicina[0][0]?.total || 0,
      ingresos_dia: parseFloat(ingresos[0][0]?.total || "0"),
      horas_ocupadas: horasOcupadas,
      horas_disponibles: horasDisponibles,
      tasa_ocupacion: tasaOcupacion,
    };

    return NextResponse.json(
      {
        success: true,
        estadisticas,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error al obtener estadísticas:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Error interno del servidor",
        details: process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}

function getSessionToken(request: NextRequest): string | null {
  const cookieHeader = request.headers.get("cookie") || "";
  const cookies = cookieHeader
    .split(";")
    .map((c) => c.trim())
    .reduce((acc, c) => {
      const [k, ...rest] = c.split("=");
      acc[k] = rest.join("=");
      return acc;
    }, {} as Record<string, string>);

  const candidates = ["session", "session_token", "medisalud_session"];
  for (const name of candidates) {
    if (cookies[name]) return decodeURIComponent(cookies[name]);
  }

  const auth = request.headers.get("authorization");
  if (auth?.startsWith("Bearer ")) return auth.slice(7);

  return null;
}
