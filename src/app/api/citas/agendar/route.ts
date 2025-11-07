// src/app/api/citas/agendar/route.ts
import { NextResponse } from "next/server";
import pool from "@/lib/db";

/**
 * Crea la cita en `citas`
 * y bloquea el bloque horario tomado.
 */
export async function POST(req: Request) {
  let connection: any | null = null;

  try {
    const body = await req.json();

    const {
      id_paciente_existente,
      id_medico,
      id_centro,
      id_sucursal,
      fecha_cita,         // "YYYY-MM-DD"
      hora_cita,          // "09:00" o "09:00 a. m." (limpiamos abajo)
      duracion_minutos,   // ej 30
      tipo_cita,          // "primera_vez" | ...
      motivo,
      id_especialidad,
      id_bloque,          // <-- MUY IMPORTANTE
    } = body || {};

    // 1. Validaciones mínimas
    if (
      !id_paciente_existente ||
      !id_medico ||
      !id_centro ||
      !fecha_cita ||
      !hora_cita
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Faltan datos obligatorios: paciente, médico, centro, fecha u hora.",
        },
        { status: 400 }
      );
    }

    // 2. Normalizar hora ("09:00 a. m." -> "09:00")
    const horaLimpia = String(hora_cita)
      .replace(/[^\d:]/g, "")
      .slice(0, 5)
      .padStart(5, "0");

    const inicioSQL = `${fecha_cita} ${horaLimpia}:00`;

    const duracion = Number.isFinite(duracion_minutos)
      ? Number(duracion_minutos)
      : 30;

    const finSQL = sumarMinutosSQL(inicioSQL, duracion);

    // 3. Normalizar tipo_cita con ENUM permitido
    const TIPO_CITA_PERMITIDOS = [
      "primera_vez",
      "control",
      "procedimiento",
      "urgencia",
      "telemedicina",
    ] as const;

    const tipoCitaFinal = TIPO_CITA_PERMITIDOS.includes(
      (tipo_cita || "").toLowerCase() as any
    )
      ? (tipo_cita as string).toLowerCase()
      : "primera_vez";

    // 4. Verificamos que NO exista ya otra cita en esa hora exacta
    const [choqueRows]: any = await pool.query(
      `
        SELECT COUNT(*) AS total
        FROM citas
        WHERE id_medico = ?
          AND fecha_hora_inicio = ?
          AND estado NOT IN ('cancelada','no_asistio','reprogramada')
      `,
      [id_medico, inicioSQL]
    );

    if ((choqueRows?.[0]?.total ?? 0) > 0) {
      return NextResponse.json(
        {
          success: false,
          code: "HORARIO_OCUPADO",
          message:
            "Esa hora ya fue tomada para este profesional. Elige otro horario.",
        },
        { status: 409 }
      );
    }

    // 5. Si viene id_bloque, validamos que ese bloque aún esté disponible
    if (id_bloque) {
      const [bloqueRows]: any = await pool.query(
        `
          SELECT 
            id_bloque,
            estado,
            visible_web,
            cupo_maximo,
            cupo_actual,
            fecha_inicio
          FROM bloques_horarios
          WHERE id_bloque = ?
          FOR UPDATE
        `,
        [id_bloque]
      );

      const bloque = bloqueRows?.[0];

      if (
        !bloque ||
        bloque.estado !== "disponible" ||
        bloque.visible_web !== 1 ||
        (bloque.cupo_maximo !== null &&
          bloque.cupo_actual >= bloque.cupo_maximo)
      ) {
        return NextResponse.json(
          {
            success: false,
            code: "BLOQUE_NO_DISPONIBLE",
            message:
              "El horario seleccionado ya no está disponible. Por favor elige otro.",
          },
          { status: 409 }
        );
      }

      // también chequeamos que el inicio del bloque coincida con lo que el usuario cree
      // (defensa ante que el usuario edite el body a mano)
      if (
        new Date(bloque.fecha_inicio).toISOString().slice(0, 19).replace("T", " ")
        !== inicioSQL
      ) {
        return NextResponse.json(
          {
            success: false,
            code: "BLOQUE_TIMESTAMP_MISMATCH",
            message:
              "El bloque seleccionado no coincide con la hora elegida.",
          },
          { status: 400 }
        );
      }
    }

    // 6. Abrimos transacción
    connection = await pool.getConnection();
    await connection.beginTransaction();

    // 6.1 Insertar la cita
    const [resultado]: any = await connection.query(
      `
        INSERT INTO citas (
          id_paciente,
          id_medico,
          id_centro,
          id_sucursal,
          fecha_hora_inicio,
          fecha_hora_fin,
          duracion_minutos,
          tipo_cita,
          motivo,
          estado,
          prioridad,
          id_especialidad,
          origen,
          pagada,
          monto,
          id_sala,
          notas,
          notas_privadas,
          recordatorio_enviado,
          fecha_recordatorio,
          confirmacion_enviada,
          fecha_confirmacion,
          confirmado_por_paciente,
          creado_por,
          modificado_por,
          id_cita_anterior
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        id_paciente_existente, // id_paciente
        id_medico,
        id_centro,
        id_sucursal || null,
        inicioSQL,
        finSQL,
        duracion,
        tipoCitaFinal,
        motivo || "Sin motivo específico",
        "programada", // estado
        "normal",     // prioridad
        id_especialidad || null,
        "web",        // origen de la cita
        0,            // pagada
        null,         // monto
        null,         // id_sala
        null,         // notas
        null,         // notas_privadas
        0,            // recordatorio_enviado
        null,         // fecha_recordatorio
        0,            // confirmacion_enviada
        null,         // fecha_confirmacion
        0,            // confirmado_por_paciente
        1,            // creado_por (sistema)
        null,         // modificado_por
        null,         // id_cita_anterior
      ]
    );

    const id_cita_creada = resultado.insertId;

    // 6.2 Bloquear el bloque horario (si venía)
    if (id_bloque) {
      await connection.query(
        `
        UPDATE bloques_horarios
        SET
          estado = 'reservado',
          visible_web = 0,
          cupo_actual = LEAST(
            IFNULL(cupo_actual, 0) + 1,
            IFNULL(NULLIF(cupo_maximo,0), 1)
          )
        WHERE id_bloque = ?
      `,
        [id_bloque]
      );
    }

    // 6.3 Commit
    await connection.commit();

    return NextResponse.json({
      success: true,
      message: "✅ Cita guardada correctamente en la base de datos.",
      id_cita: id_cita_creada,
      id_bloque,
      fecha_hora_inicio: inicioSQL,
      fecha_hora_fin: finSQL,
    });
  } catch (error: any) {
    console.error("❌ Error en /api/citas/agendar:", error);

    if (connection) {
      try {
        await connection.rollback();
      } catch (rollbackErr) {
        console.error("⚠️ Error haciendo rollback:", rollbackErr);
      }
    }

    return NextResponse.json(
      {
        success: false,
        message: "Error al registrar la cita en la base de datos.",
        error: error?.message || "Error desconocido",
      },
      { status: 500 }
    );
  } finally {
    if (connection) {
      try {
        connection.release();
      } catch {
        /* ignore */
      }
    }
  }
}

/**
 * sumarMinutosSQL("YYYY-MM-DD HH:mm:ss", minutos) -> "YYYY-MM-DD HH:mm:ss"
 * No usa UTC para no romper la hora local
 */
function sumarMinutosSQL(
  fechaHoraSQL: string,
  minutosASumar: number
): string {
  const [fechaParte, horaParte] = fechaHoraSQL.split(" ");

  const [anioStr, mesStr, diaStr] = fechaParte.split("-");
  const [horaStr, minStr, segStr] = horaParte.split(":");

  const d = new Date(
    parseInt(anioStr, 10),
    parseInt(mesStr, 10) - 1,
    parseInt(diaStr, 10),
    parseInt(horaStr, 10),
    parseInt(minStr, 10),
    parseInt(segStr || "0", 10)
  );

  d.setMinutes(d.getMinutes() + minutosASumar);

  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(
    d.getDate()
  )} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}
