// app/api/medico/consultas/crear/route.ts
import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { RowDataPacket, ResultSetHeader } from "mysql2";

export async function POST(request: NextRequest) {
  try {
    const sessionToken = getSessionToken(request);
    if (!sessionToken) {
      return NextResponse.json({ success: false, error: "No hay sesión activa" }, { status: 401 });
    }

    const [sesiones] = await pool.query<RowDataPacket[]>(
      `SELECT su.id_usuario FROM sesiones_usuarios su
       WHERE su.token = ? AND su.activa = 1 AND su.fecha_expiracion > NOW()`,
      [sessionToken]
    );

    if (sesiones.length === 0) {
      return NextResponse.json({ success: false, error: "Sesión inválida" }, { status: 401 });
    }

    const idUsuario = sesiones[0].id_usuario;

    const [medico] = await pool.query<RowDataPacket[]>(
      `SELECT id_medico FROM medicos WHERE id_usuario = ? AND estado = 'activo'`,
      [idUsuario]
    );

    if (medico.length === 0) {
      return NextResponse.json({ success: false, error: "No eres médico" }, { status: 403 });
    }

    const body = await request.json();

    // Crear ficha médica si no existe
    let idFicha;
    const [fichaExistente] = await pool.query<RowDataPacket[]>(
      `SELECT id_ficha FROM fichas_medicas 
       WHERE id_paciente = ? AND id_centro = ? AND estado = 'activa'`,
      [body.id_paciente, body.id_centro]
    );

    if (fichaExistente.length > 0) {
      idFicha = fichaExistente[0].id_ficha;
    } else {
      const codigoFicha = `FM-${body.id_centro}-${body.id_paciente}-${Date.now()}`;
      const [resultFicha] = await pool.query<ResultSetHeader>(
        `INSERT INTO fichas_medicas (
          id_paciente, id_centro, codigo_ficha, fecha_apertura, creado_por
        ) VALUES (?, ?, ?, NOW(), ?)`,
        [body.id_paciente, body.id_centro, codigoFicha, idUsuario]
      );
      idFicha = resultFicha.insertId;
    }

    // Insertar historial clínico
    const [resultHistorial] = await pool.query<ResultSetHeader>(
      `INSERT INTO historial_clinico (
        id_ficha, id_paciente, fecha_atencion, id_medico, id_especialidad,
        id_centro, motivo_consulta, anamnesis, examen_fisico,
        diagnostico_principal, codigo_cie10, plan_tratamiento, observaciones,
        estado_registro, tipo_atencion, es_ges, es_cronica, proximo_control
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        idFicha,
        body.id_paciente,
        body.fecha_atencion,
        body.id_medico,
        body.id_especialidad,
        body.id_centro,
        body.motivo_consulta,
        body.anamnesis,
        body.examen_fisico,
        body.diagnostico_principal,
        body.codigo_cie10,
        body.plan_tratamiento,
        body.observaciones,
        body.estado_registro,
        body.tipo_atencion,
        body.es_ges ? 1 : 0,
        body.es_cronica ? 1 : 0,
        body.proximo_control || null,
      ]
    );

    const idHistorial = resultHistorial.insertId;

    // Guardar medicamentos
    if (body.medicamentos && body.medicamentos.length > 0) {
      for (const med of body.medicamentos) {
        await pool.query(
          `INSERT INTO receta_medicamentos (
            id_historial, id_paciente, medicamento, dosis, via_administracion,
            frecuencia, duracion, indicaciones, fecha_prescripcion
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
          [
            idHistorial,
            body.id_paciente,
            med.nombre,
            med.dosis,
            med.via,
            med.frecuencia,
            med.duracion,
            med.indicaciones,
          ]
        );
      }
    }

    // Guardar órdenes de examen
    if (body.ordenes_examen && body.ordenes_examen.length > 0) {
      for (const orden of body.ordenes_examen) {
        await pool.query(
          `INSERT INTO ordenes_examenes (
            id_historial, id_paciente, id_medico, tipo_examen,
            nombre_examen, indicaciones, urgente, fecha_orden, estado
          ) VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), 'pendiente')`,
          [
            idHistorial,
            body.id_paciente,
            body.id_medico,
            orden.tipo_examen,
            orden.nombre_examen,
            orden.indicaciones,
            orden.urgente ? 1 : 0,
          ]
        );
      }
    }

    return NextResponse.json({
      success: true,
      message: "Consulta guardada correctamente",
      id_historial: idHistorial,
    });

  } catch (error: any) {
    console.error("Error al crear consulta:", error);
    return NextResponse.json({ success: false, error: "Error al crear consulta" }, { status: 500 });
  }
}

function getSessionToken(request: NextRequest): string | null {
  const cookies = ["session", "session_token", "medisalud_session"];
  for (const name of cookies) {
    const value = request.cookies.get(name)?.value;
    if (value) return value;
  }
  const auth = request.headers.get("authorization");
  return auth?.startsWith("Bearer ") ? auth.slice(7) : null;
}