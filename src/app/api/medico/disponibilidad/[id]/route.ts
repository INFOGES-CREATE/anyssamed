// frontend/src/app/api/medico/disponibilidad/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { RowDataPacket, ResultSetHeader } from "mysql2";

export const dynamic = "force-dynamic";
// si tu proyecto lo necesita para mysql2 en app router:
// export const runtime = "nodejs";

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

// helper para devolver error bonito cuando no existe la tabla
function tableMissingResponse() {
  return NextResponse.json(
    {
      success: false,
      message:
        "Falta la tabla disponibilidad_medicos en la base de datos. Crea la tabla antes de usar este endpoint.",
    },
    { status: 500 }
  );
}

// ====================================================================
// GET /api/medico/disponibilidad/[id]
// ====================================================================
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const ctx = await getContext(request);
    if (!ctx.ok) {
      return NextResponse.json({ success: false, message: ctx.message }, { status: ctx.status });
    }

    const { idMedico } = ctx;
    const idDisp = Number(params.id);

    if (!idDisp) {
      return NextResponse.json(
        { success: false, message: "ID de disponibilidad inválido." },
        { status: 400 }
      );
    }

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
      WHERE d.id_medico = ? AND d.id_disponibilidad = ?
      LIMIT 1
      `,
      [idMedico, idDisp]
    );

    if (rows.length === 0) {
      return NextResponse.json(
        { success: false, message: "No se encontró esta disponibilidad en tu perfil." },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, disponibilidad: rows[0] }, { status: 200 });
  } catch (error: any) {
    console.error("❌ GET /api/medico/disponibilidad/[id]:", error);
    if (error?.code === "ER_NO_SUCH_TABLE" || error?.errno === 1146) {
      return tableMissingResponse();
    }
    return NextResponse.json(
      {
        success: false,
        message: "Error interno del servidor",
      },
      { status: 500 }
    );
  }
}

// ====================================================================
// PUT /api/medico/disponibilidad/[id]
// ====================================================================
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const ctx = await getContext(request);
    if (!ctx.ok) {
      return NextResponse.json({ success: false, message: ctx.message }, { status: ctx.status });
    }
    const { idMedico, idUsuario } = ctx;
    const idDisp = Number(params.id);

    if (!idDisp) {
      return NextResponse.json(
        { success: false, message: "ID de disponibilidad inválido." },
        { status: 400 }
      );
    }

    // comprobar que esa disponibilidad es del médico
    const [exists] = await pool.query<RowDataPacket[]>(
      `SELECT id_disponibilidad FROM disponibilidad_medicos WHERE id_medico = ? AND id_disponibilidad = ? LIMIT 1`,
      [idMedico, idDisp]
    );
    if (exists.length === 0) {
      return NextResponse.json(
        { success: false, message: "Esta disponibilidad no está asociada a tu perfil." },
        { status: 404 }
      );
    }

    const body = await request.json().catch(() => ({}));

    const {
      id_centro,
      id_sucursal,
      dia_semana,
      hora_inicio,
      hora_fin,
      fecha_especifica,
      es_recurrente,
      tipo_atencion,
      max_pacientes,
      estado,
      motivo_bloqueo,
      notas,
    } = body as Record<string, any>;

    const allowedDias = [
      "lunes",
      "martes",
      "miercoles",
      "jueves",
      "viernes",
      "sabado",
      "domingo",
    ];
    const allowedTipos = ["presencial", "telemedicina", "ambos"];
    const allowedEstados = ["activo", "inactivo", "bloqueado", "vacaciones", "capacitacion"];

    if (dia_semana !== undefined && dia_semana !== null && !allowedDias.includes(dia_semana)) {
      return NextResponse.json(
        { success: false, message: "Día de semana no válido." },
        { status: 400 }
      );
    }
    if (tipo_atencion !== undefined && tipo_atencion !== null && !allowedTipos.includes(tipo_atencion)) {
      return NextResponse.json(
        { success: false, message: "Tipo de atención no válido." },
        { status: 400 }
      );
    }
    if (estado !== undefined && estado !== null && !allowedEstados.includes(estado)) {
      return NextResponse.json(
        { success: false, message: "Estado no válido." },
        { status: 400 }
      );
    }

    const fields: string[] = [];
    const paramsArr: any[] = [];

    // ojo: tu tabla tiene id_centro NOT NULL, así que solo lo cambiamos si nos mandas valor
    if (id_centro !== undefined) {
      fields.push("id_centro = ?");
      paramsArr.push(id_centro);
    }
    if (id_sucursal !== undefined) {
      fields.push("id_sucursal = ?");
      paramsArr.push(id_sucursal);
    }
    if (dia_semana !== undefined) {
      fields.push("dia_semana = ?");
      paramsArr.push(dia_semana);
    }
    if (hora_inicio !== undefined) {
      fields.push("hora_inicio = ?");
      paramsArr.push(hora_inicio);
    }
    if (hora_fin !== undefined) {
      fields.push("hora_fin = ?");
      paramsArr.push(hora_fin);
    }
    if (fecha_especifica !== undefined) {
      fields.push("fecha_especifica = ?");
      paramsArr.push(fecha_especifica);
    }
    if (es_recurrente !== undefined) {
      fields.push("es_recurrente = ?");
      paramsArr.push(es_recurrente ? 1 : 0);
    }
    if (tipo_atencion !== undefined) {
      fields.push("tipo_atencion = ?");
      paramsArr.push(tipo_atencion);
    }
    if (max_pacientes !== undefined) {
      fields.push("max_pacientes = ?");
      paramsArr.push(max_pacientes);
    }
    if (estado !== undefined) {
      fields.push("estado = ?");
      paramsArr.push(estado);
    }
    if (motivo_bloqueo !== undefined) {
      fields.push("motivo_bloqueo = ?");
      paramsArr.push(motivo_bloqueo);
    }
    if (notas !== undefined) {
      fields.push("notas = ?");
      paramsArr.push(notas);
    }

    // siempre dejamos quién modificó
    fields.push("modificado_por = ?");
    paramsArr.push(idUsuario);

    if (fields.length > 0) {
      paramsArr.push(idMedico, idDisp);
      await pool.query<ResultSetHeader>(
        `
        UPDATE disponibilidad_medicos
        SET ${fields.join(", ")}
        WHERE id_medico = ? AND id_disponibilidad = ?
        `,
        paramsArr
      );
    }

    return NextResponse.json(
      { success: true, message: "Disponibilidad actualizada correctamente." },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("❌ PUT /api/medico/disponibilidad/[id]:", error);
    if (error?.code === "ER_NO_SUCH_TABLE" || error?.errno === 1146) {
      return tableMissingResponse();
    }
    return NextResponse.json(
      {
        success: false,
        message: "Error interno del servidor",
      },
      { status: 500 }
    );
  }
}

// ====================================================================
// DELETE /api/medico/disponibilidad/[id]
// ====================================================================
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const ctx = await getContext(request);
    if (!ctx.ok) {
      return NextResponse.json({ success: false, message: ctx.message }, { status: ctx.status });
    }
    const { idMedico } = ctx;
    const idDisp = Number(params.id);

    if (!idDisp) {
      return NextResponse.json(
        { success: false, message: "ID de disponibilidad inválido." },
        { status: 400 }
      );
    }

    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT 1 FROM disponibilidad_medicos WHERE id_medico = ? AND id_disponibilidad = ? LIMIT 1`,
      [idMedico, idDisp]
    );

    if (rows.length === 0) {
      return NextResponse.json(
        { success: false, message: "No se encontró esta disponibilidad en tu perfil." },
        { status: 404 }
      );
    }

    // si prefieres solo desactivar, cambia esto por un UPDATE estado='inactivo'
    await pool.query(
      `DELETE FROM disponibilidad_medicos WHERE id_medico = ? AND id_disponibilidad = ?`,
      [idMedico, idDisp]
    );

    return NextResponse.json(
      { success: true, message: "Disponibilidad eliminada." },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("❌ DELETE /api/medico/disponibilidad/[id]:", error);
    if (error?.code === "ER_NO_SUCH_TABLE" || error?.errno === 1146) {
      return tableMissingResponse();
    }
    return NextResponse.json(
      {
        success: false,
        message: "Error interno del servidor",
      },
      { status: 500 }
    );
  }
}
