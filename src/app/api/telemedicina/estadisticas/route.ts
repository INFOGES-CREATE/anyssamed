import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { RowDataPacket } from "mysql2";

const SESSION_COOKIE_CANDIDATES = [
  "session",
  "session_token",
  "medisalud_session",
  "auth_session",
  "next-auth.session-token",
  "__Secure-next-auth.session-token",
];

// mismo helper que usas en /sesiones
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

  const authLower = request.headers.get("authorization");
  const authUpper = request.headers.get("Authorization");
  const auth = authLower || authUpper;

  if (auth && auth.startsWith("Bearer ")) {
    return auth.slice(7);
  }

  return null;
}

async function obtenerMedicoAutenticado(idUsuario: number): Promise<any> {
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
    [idUsuario]
  );

  return rows.length ? rows[0] : null;
}

export async function GET(request: NextRequest) {
  try {
    const sessionToken = getSessionToken(request);
    console.log("🧩 GET /telemedicina/estadisticas token:", sessionToken);

    if (!sessionToken) {
      return NextResponse.json(
        { success: false, error: "No hay sesión activa" },
        { status: 401 }
      );
    }

    // validar sesión
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

    if (!sesiones.length) {
      return NextResponse.json(
        { success: false, error: "Sesión inválida o expirada" },
        { status: 401 }
      );
    }

    const idUsuario = sesiones[0].id_usuario as number;
    const medico = await obtenerMedicoAutenticado(idUsuario);

    if (!medico) {
      return NextResponse.json(
        { success: false, error: "No tienes un registro de médico activo" },
        { status: 403 }
      );
    }

    // opcional: marcar actividad
    await pool.query(
      `UPDATE sesiones_usuarios SET ultima_actividad = NOW() WHERE token = ?`,
      [sessionToken]
    );

    // === período igual que en el frontend ===
    const searchParams = request.nextUrl.searchParams;
    const periodo = searchParams.get("periodo") || "hoy";

    // ESTE es el "hoy" que usa tu app (igual que en /sesiones)
    const hoyApp = new Date().toISOString().split("T")[0];

    let fechaInicio: string;
    const fechaFin = hoyApp;

    switch (periodo) {
      case "semana":
        fechaInicio = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split("T")[0];
        break;
      case "mes":
        fechaInicio = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split("T")[0];
        break;
      default:
        // hoy
        fechaInicio = fechaFin;
        break;
    }

    // ===== 1) estadísticas del rango =====
    const [rowsEstadisticas] = await pool.query<RowDataPacket[]>(
      `
      SELECT 
        COUNT(*) AS total_sesiones_rango,
        SUM(CASE WHEN estado = 'finalizada' THEN 1 ELSE 0 END) AS sesiones_completadas,
        SUM(CASE WHEN estado IN ('programada','en_espera') THEN 1 ELSE 0 END) AS sesiones_pendientes,
        SUM(CASE WHEN estado = 'cancelada' THEN 1 ELSE 0 END) AS sesiones_canceladas,
        AVG(
          CASE 
            WHEN duracion_segundos IS NOT NULL THEN duracion_segundos / 60
            ELSE NULL
          END
        ) AS tiempo_promedio_sesion,
        AVG(
          CASE 
            WHEN evaluacion_medico IS NOT NULL THEN evaluacion_medico
            ELSE NULL
          END
        ) AS calificacion_promedio,
        COUNT(DISTINCT id_paciente) AS pacientes_atendidos_mes,
        SUM(
          CASE 
            WHEN estado = 'finalizada' THEN 25000
            ELSE 0
          END
        ) AS ingresos_mes,
        SUM(
          CASE 
            WHEN estado IN ('finalizada','en_curso') THEN 1
            ELSE 0
          END
        ) AS sesiones_asistidas,
        SUM(
          CASE 
            WHEN estado IN ('cancelada','no_asistio','problema_tecnico') THEN 1
            ELSE 0
          END
        ) AS sesiones_no_asistidas,
        AVG(
          CASE 
            WHEN fecha_hora_inicio_real IS NOT NULL 
            THEN TIMESTAMPDIFF(MINUTE, fecha_hora_inicio_programada, fecha_hora_inicio_real)
            ELSE NULL
          END
        ) AS tiempo_espera_promedio
      FROM telemedicina_sesiones
      WHERE id_medico = ?
        AND DATE(fecha_hora_inicio_programada) BETWEEN ? AND ?
      `,
      [medico.id_medico, fechaInicio, fechaFin]
    );

    const statsRango = rowsEstadisticas[0] || ({} as RowDataPacket);

    // ===== 2) total de HOY usando el mismo "hoyApp" =====
    const [rowsHoy] = await pool.query<RowDataPacket[]>(
      `
      SELECT COUNT(*) AS total_hoy
      FROM telemedicina_sesiones
      WHERE id_medico = ?
        AND DATE(fecha_hora_inicio_programada) = ?
      `,
      [medico.id_medico, hoyApp]
    );
    const totalHoy = Number(rowsHoy[0]?.total_hoy ?? 0);

    // tasa asistencia real
    const sesionesAsistidas = Number(statsRango.sesiones_asistidas ?? 0);
    const sesionesNoAsistidas = Number(statsRango.sesiones_no_asistidas ?? 0);
    const totalParaAsistencia = sesionesAsistidas + sesionesNoAsistidas;
    const tasaAsistencia =
      totalParaAsistencia > 0
        ? (sesionesAsistidas / totalParaAsistencia) * 100
        : 0;

    return NextResponse.json(
      {
        success: true,
        estadisticas: {
          // <-- esto alimenta la card que te sale en 0
          total_sesiones_hoy: totalHoy,

          sesiones_completadas: Number(statsRango.sesiones_completadas ?? 0),
          sesiones_pendientes: Number(statsRango.sesiones_pendientes ?? 0),
          sesiones_canceladas: Number(statsRango.sesiones_canceladas ?? 0),
          tiempo_promedio_sesion: Number(
            (statsRango.tiempo_promedio_sesion ?? 0).toFixed(2)
          ),
          calificacion_promedio: Number(
            (statsRango.calificacion_promedio ?? 0).toFixed(1)
          ),
          pacientes_atendidos_mes: Number(
            statsRango.pacientes_atendidos_mes ?? 0
          ),
          ingresos_mes: Number(statsRango.ingresos_mes ?? 0),
          tasa_asistencia: Number(tasaAsistencia.toFixed(0)),
          tiempo_espera_promedio: Number(
            ((statsRango.tiempo_espera_promedio as number) ?? 0).toFixed(2)
          ),
        },
        periodo: {
          tipo: periodo,
          fecha_inicio: fechaInicio,
          fecha_fin: fechaFin,
        },
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("❌ Error en GET /api/telemedicina/estadisticas:", error);
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
