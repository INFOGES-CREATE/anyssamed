// app/api/medico/agenda/bloques/route.ts
export const dynamic = "force-dynamic";

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

function getSessionToken(req: NextRequest): string | null {
  const cookieHeader = req.headers.get("cookie") || "";
  if (cookieHeader) {
    const cookies = cookieHeader
      .split(";")
      .map((c) => c.trim())
      .reduce((acc, c) => {
        const [k, ...rest] = c.split("=");
        acc[k] = rest.join("=");
        return acc;
      }, {} as Record<string, string>);
    for (const c of SESSION_COOKIE_CANDIDATES) {
      if (cookies[c]) return decodeURIComponent(cookies[c]);
    }
  }
  const auth = req.headers.get("authorization");
  if (auth?.startsWith("Bearer ")) return auth.slice(7);
  return null;
}

async function obtenerMedicoPorUsuario(idUsuario: number) {
  const [rows] = await pool.query<RowDataPacket[]>(
    `
    SELECT m.id_medico, m.id_centro_principal
    FROM medicos m
    WHERE m.id_usuario = ? AND m.estado = 'activo'
    LIMIT 1
    `,
    [idUsuario]
  );
  return rows[0] || null;
}

function getRango(fechaISO: string, vista: string) {
  const base = new Date(fechaISO);
  const start = new Date(base);
  const end = new Date(base);

  if (vista === "semana") {
    const day = base.getDay();
    const diff = (day === 0 ? -6 : 1 - day);
    start.setDate(base.getDate() + diff);
    start.setHours(0, 0, 0, 0);

    end.setTime(start.getTime());
    end.setDate(start.getDate() + 6);
    end.setHours(23, 59, 59, 999);
  } else if (vista === "mes") {
    start.setDate(1);
    start.setHours(0, 0, 0, 0);
    end.setMonth(start.getMonth() + 1);
    end.setDate(0);
    end.setHours(23, 59, 59, 999);
  } else {
    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);
  }

  const toMySQL = (d: Date) =>
    d.toISOString().slice(0, 19).replace("T", " ");

  return { inicio: toMySQL(start), fin: toMySQL(end) };
}

export async function GET(req: NextRequest) {
  try {
    const token = getSessionToken(req);
    if (!token) return NextResponse.json({ success: false, error: "No hay sesión" }, { status: 401 });

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
      [token]
    );
    if (sesiones.length === 0) {
      return NextResponse.json({ success: false, error: "Sesión inválida" }, { status: 401 });
    }

    const medico = await obtenerMedicoPorUsuario(sesiones[0].id_usuario);
    if (!medico) {
      return NextResponse.json({ success: false, error: "Médico no encontrado" }, { status: 403 });
    }

    const sp = req.nextUrl.searchParams;
    const fecha = sp.get("fecha") || new Date().toISOString();
    const vista = sp.get("vista") || "dia";
    const idMedicoParam = sp.get("id_medico");
    const idMedico = idMedicoParam ? Number(idMedicoParam) : Number(medico.id_medico);

    const rango = getRango(fecha, vista);

    const [rows] = await pool.query<RowDataPacket[]>(
      `
      SELECT 
        b.*,
        s.nombre AS sala_nombre
      FROM bloques_horarios b
      LEFT JOIN salas s ON b.id_sala = s.id_sala
      WHERE b.id_medico = ?
        AND b.fecha_inicio BETWEEN ? AND ?
      ORDER BY b.fecha_inicio ASC
      `,
      [idMedico, rango.inicio, rango.fin]
    );

    return NextResponse.json(
      {
        success: true,
        data: rows.map((r) => ({
          id_bloque: r.id_bloque,
          fecha_inicio: r.fecha_inicio,
          fecha_fin: r.fecha_fin,
          estado: r.estado,
          tipo_atencion: r.tipo_atencion,
          duracion_minutos: r.duracion_minutos,
          sala: r.sala_nombre,
          cupo_maximo: r.cupo_maximo,
          cupo_actual: r.cupo_actual,
          visible_web: r.visible_web === 1,
        })),
        filtros: { fecha, vista },
      },
      { status: 200 }
    );
  } catch (err: any) {
    console.error("GET /api/medico/agenda/bloques error:", err);
    return NextResponse.json(
      { success: false, error: "Error interno", details: err.message },
      { status: 500 }
    );
  }
}
