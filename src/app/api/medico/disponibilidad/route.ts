// frontend/src/app/api/medico/disponibilidad/route.ts
import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { RowDataPacket, ResultSetHeader } from "mysql2";

export const dynamic = "force-dynamic";

const SESSION_COOKIE_CANDIDATES = [
  "session",
  "session_token",
  "medisalud_session",
  "auth_session",
  "next-auth.session-token",
  "__Secure-next-auth.session-token",
];

// MUY IMPORTANTE: aquí usamos el orden y los nombres EXACTOS de tu tabla
// ENUM('lunes','martes','miercoles','jueves','viernes','sabado','domingo')
const DIAS_ENUM = [
  "lunes",
  "martes",
  "miercoles",
  "jueves",
  "viernes",
  "sabado",
  "domingo",
] as const;

const TIPOS_ATENCION = ["presencial", "telemedicina", "ambos"] as const;
const ESTADOS = ["activo", "inactivo", "bloqueado", "vacaciones", "capacitacion"] as const;

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

async function getContext(request: NextRequest) {
  const sessionToken = getSessionToken(request);
  if (!sessionToken) {
    return { ok: false, status: 401, message: "No hay sesión activa" } as const;
  }

  const [sesiones] = await pool.query<RowDataPacket[]>(
    `
    SELECT su.id_usuario
    FROM sesiones_usuarios su
    INNER JOIN usuarios u ON u.id_usuario = su.id_usuario
    WHERE su.token = ?
      AND su.activa = 1
      AND (su.fecha_expiracion IS NULL OR su.fecha_expiracion > NOW())
      AND u.estado = 'activo'
    LIMIT 1
    `,
    [sessionToken]
  );

  if (sesiones.length === 0) {
    return { ok: false, status: 401, message: "Sesión inválida o expirada" } as const;
  }

  const idUsuario = sesiones[0].id_usuario as number;

  await pool.query(`UPDATE sesiones_usuarios SET ultima_actividad = NOW() WHERE token = ?`, [
    sessionToken,
  ]);

  const [medicos] = await pool.query<RowDataPacket[]>(
    `SELECT id_medico FROM medicos WHERE id_usuario = ? LIMIT 1`,
    [idUsuario]
  );

  if (medicos.length === 0) {
    return { ok: false, status: 404, message: "El usuario no tiene perfil de médico" } as const;
  }

  return {
    ok: true,
    idUsuario,
    idMedico: medicos[0].id_medico as number,
  } as const;
}

function tableMissing() {
  return NextResponse.json(
    {
      success: false,
      message:
        "Falta la tabla disponibilidad_medicos en la base de datos. Crea la tabla antes de usar este endpoint.",
    },
    { status: 500 }
  );
}

// util: de "2025-11-09" -> "domingo" (conforme a tu ENUM)
function diaDesdeFecha(fechaISO: string): string | null {
  const d = new Date(fechaISO);
  if (isNaN(d.getTime())) return null;
  const jsDay = d.getDay(); // 0=domingo ... 6=sábado

  // tu ENUM empieza en lunes, así que mapeamos uno por uno:
  switch (jsDay) {
    case 0:
      return "domingo";
    case 1:
      return "lunes";
    case 2:
      return "martes";
    case 3:
      return "miercoles";
    case 4:
      return "jueves";
    case 5:
      return "viernes";
    case 6:
      return "sabado";
    default:
      return null;
  }
}

// ==================================
// GET: lista de disponibilidad
// ==================================
export async function GET(request: NextRequest) {
  try {
    const ctx = await getContext(request);
    if (!ctx.ok) {
      return NextResponse.json({ success: false, message: ctx.message }, { status: ctx.status });
    }
    const { idMedico } = ctx;

    const [rows] = await pool.query<RowDataPacket[]>(
      `
      SELECT
        d.id_disponibilidad,
        d.id_medico,
        d.id_centro,
        d.id_sucursal,
        d.dia_semana,
        DATE_FORMAT(d.hora_inicio, '%H:%i') AS hora_inicio,
        DATE_FORMAT(d.hora_fin, '%H:%i') AS hora_fin,
        d.fecha_especifica,
        d.es_recurrente,
        d.tipo_atencion,
        d.max_pacientes,
        d.estado,
        d.motivo_bloqueo,
        d.notas,
        DATE_FORMAT(d.fecha_creacion, '%Y-%m-%d %H:%i:%s') AS fecha_creacion,
        DATE_FORMAT(d.fecha_modificacion, '%Y-%m-%d %H:%i:%s') AS fecha_modificacion
      FROM disponibilidad_medicos d
      WHERE d.id_medico = ?
      ORDER BY
        -- primero las recurrentes por día
        FIELD(d.dia_semana, 'lunes','martes','miercoles','jueves','viernes','sabado','domingo'),
        d.fecha_especifica IS NOT NULL,
        d.hora_inicio ASC
      `,
      [idMedico]
    );

    return NextResponse.json({ success: true, disponibilidad: rows }, { status: 200 });
  } catch (error: any) {
    console.error("❌ GET /api/medico/disponibilidad:", error);
    if (error?.code === "ER_NO_SUCH_TABLE" || error?.errno === 1146) {
      return tableMissing();
    }
    return NextResponse.json(
      { success: false, message: "Error interno del servidor", details: error.message },
      { status: 500 }
    );
  }
}

// ==================================
// POST: crear franja
// ==================================
export async function POST(request: NextRequest) {
  try {
    const ctx = await getContext(request);
    if (!ctx.ok) {
      return NextResponse.json({ success: false, message: ctx.message }, { status: ctx.status });
    }
    const { idMedico, idUsuario } = ctx;
    const body = await request.json().catch(() => ({}));

    let {
      id_centro,
      id_sucursal = null,
      dia_semana,
      hora_inicio,
      hora_fin,
      fecha_especifica = null,
      es_recurrente = true,
      tipo_atencion = "presencial",
      max_pacientes = null,
      estado = "activo",
      motivo_bloqueo = null,
      notas = null,
    } = body as Record<string, any>;

    // 1) resolver id_centro si no viene
    if (!id_centro) {
      const [medCentro] = await pool.query<RowDataPacket[]>(
        `
        SELECT 
          COALESCE(m.id_centro_principal, m.id_centro) AS id_centro_principal
        FROM medicos m
        WHERE m.id_medico = ?
        LIMIT 1
        `,
        [idMedico]
      );
      if (medCentro.length > 0 && medCentro[0].id_centro_principal) {
        id_centro = medCentro[0].id_centro_principal;
      }
    }
    if (!id_centro) {
      return NextResponse.json(
        {
          success: false,
          message: "id_centro es obligatorio (o define id_centro_principal en la tabla medicos).",
        },
        { status: 400 }
      );
    }

    // 2) validar horas
    if (!hora_inicio || !hora_fin) {
      return NextResponse.json(
        { success: false, message: "Debe indicar hora_inicio y hora_fin." },
        { status: 400 }
      );
    }

    // 3) normalizar día de la semana
    let diaEnum: string | null = null;

    if (dia_semana !== undefined && dia_semana !== null) {
      // puede venir como número o string
      if (typeof dia_semana === "number") {
        // 0..6 pero tu ENUM empieza en lunes
        // vamos a aceptar 1..7 (1=lunes ... 7=domingo) y también 0..6 (0=domingo)
        if (dia_semana >= 1 && dia_semana <= 7) {
          diaEnum = DIAS_ENUM[dia_semana - 1] ?? null;
        } else if (dia_semana === 0) {
          diaEnum = "domingo";
        }
      } else if (typeof dia_semana === "string") {
        const lower = dia_semana.toLowerCase();
        if (DIAS_ENUM.includes(lower as any) || lower === "domingo") {
          diaEnum = lower;
        }
      }
    }

    // 4) si NO vino día pero sí fecha_especifica -> lo calculamos
    if (!diaEnum && fecha_especifica) {
      const calculado = diaDesdeFecha(fecha_especifica);
      if (calculado) {
        diaEnum = calculado;
      }
    }

    // si después de todo seguimos sin día -> error porque tu tabla no acepta NULL
    if (!diaEnum) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Debes indicar dia_semana (lunes..domingo) o una fecha_especifica válida para poder derivar el día.",
        },
        { status: 400 }
      );
    }

    // 5) validar tipo y estado según tu ENUM
    if (!TIPOS_ATENCION.includes(tipo_atencion)) {
      tipo_atencion = "presencial";
    }
    if (!ESTADOS.includes(estado)) {
      estado = "activo";
    }

    const [result] = await pool.query<ResultSetHeader>(
      `
      INSERT INTO disponibilidad_medicos
        (id_medico, id_centro, id_sucursal,
         dia_semana, hora_inicio, hora_fin,
         fecha_especifica, es_recurrente,
         tipo_atencion, max_pacientes,
         estado, motivo_bloqueo, notas, modificado_por)
      VALUES
        (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        idMedico,
        id_centro,
        id_sucursal,
        diaEnum, // <-- ya no es NULL
        hora_inicio,
        hora_fin,
        fecha_especifica,
        es_recurrente ? 1 : 0,
        tipo_atencion,
        max_pacientes,
        estado,
        motivo_bloqueo,
        notas,
        idUsuario,
      ]
    );

    return NextResponse.json(
      {
        success: true,
        message: "Disponibilidad registrada.",
        id_disponibilidad: result.insertId,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("❌ POST /api/medico/disponibilidad:", error);
    if (error?.code === "ER_NO_SUCH_TABLE" || error?.errno === 1146) {
      return tableMissing();
    }
    return NextResponse.json(
      { success: false, message: "Error interno del servidor", details: error.message },
      { status: 500 }
    );
  }
}

// ==================================
// DELETE por body
// ==================================
export async function DELETE(request: NextRequest) {
  try {
    const ctx = await getContext(request);
    if (!ctx.ok) {
      return NextResponse.json({ success: false, message: ctx.message }, { status: ctx.status });
    }
    const { idMedico } = ctx;
    const body = await request.json().catch(() => ({}));
    const id_disponibilidad = Number(body.id_disponibilidad);

    if (!id_disponibilidad) {
      return NextResponse.json(
        { success: false, message: "id_disponibilidad requerido" },
        { status: 400 }
      );
    }

    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT 1 FROM disponibilidad_medicos WHERE id_medico = ? AND id_disponibilidad = ? LIMIT 1`,
      [idMedico, id_disponibilidad]
    );
    if (rows.length === 0) {
      return NextResponse.json(
        { success: false, message: "No se encontró esta disponibilidad en tu perfil." },
        { status: 404 }
      );
    }

    await pool.query(
      `DELETE FROM disponibilidad_medicos WHERE id_medico = ? AND id_disponibilidad = ?`,
      [idMedico, id_disponibilidad]
    );

    return NextResponse.json({ success: true, message: "Disponibilidad eliminada." }, { status: 200 });
  } catch (error: any) {
    console.error("❌ DELETE /api/medico/disponibilidad:", error);
    if (error?.code === "ER_NO_SUCH_TABLE" || error?.errno === 1146) {
      return tableMissing();
    }
    return NextResponse.json(
      { success: false, message: "Error interno del servidor", details: error.message },
      { status: 500 }
    );
  }
}
