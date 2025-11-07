// app/api/medico/pacientes/crear/route.ts
import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { RowDataPacket, ResultSetHeader } from "mysql2";

export async function POST(request: NextRequest) {
  try {
    const sessionToken = getSessionToken(request);
    if (!sessionToken) {
      return NextResponse.json({ success: false, error: "No hay sesión activa" }, { status: 401 });
    }

    // Verificar sesión
    const [sesiones] = await pool.query<RowDataPacket[]>(
      `SELECT su.id_usuario FROM sesiones_usuarios su
       WHERE su.token = ? AND su.activa = 1 AND su.fecha_expiracion > NOW()`,
      [sessionToken]
    );

    if (sesiones.length === 0) {
      return NextResponse.json({ success: false, error: "Sesión inválida" }, { status: 401 });
    }

    const idUsuario = sesiones[0].id_usuario;

    // Verificar que sea médico
    const [medico] = await pool.query<RowDataPacket[]>(
      `SELECT id_medico, id_centro_principal FROM medicos WHERE id_usuario = ? AND estado = 'activo'`,
      [idUsuario]
    );

    if (medico.length === 0) {
      return NextResponse.json({ success: false, error: "No eres médico" }, { status: 403 });
    }

    const body = await request.json();

    // Validar RUT único
    const [rutExistente] = await pool.query<RowDataPacket[]>(
      `SELECT id_paciente FROM pacientes WHERE rut = ?`,
      [body.rut]
    );

    if (rutExistente.length > 0) {
      return NextResponse.json({ success: false, error: "El RUT ya está registrado" }, { status: 400 });
    }

    // Insertar paciente
    const [result] = await pool.query<ResultSetHeader>(
      `INSERT INTO pacientes (
        rut, nombre, apellido_paterno, apellido_materno, fecha_nacimiento, genero,
        email, telefono, celular, direccion, ciudad, region, grupo_sanguineo,
        es_vip, clasificacion_riesgo, peso_kg, altura_cm, imc, estado_civil,
        ocupacion, notas_importantes, id_centro_registro, registrado_por,
        estado, fecha_registro
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'activo', NOW())`,
      [
        body.rut, body.nombre, body.apellido_paterno, body.apellido_materno || null,
        body.fecha_nacimiento, body.genero, body.email || null, body.telefono || null,
        body.celular || null, body.direccion || null, body.ciudad || null, body.region || null,
        body.grupo_sanguineo, body.es_vip ? 1 : 0, body.clasificacion_riesgo || null,
        body.peso_kg || null, body.altura_cm || null, body.imc || null,
        body.estado_civil || null, body.ocupacion || null, body.notas_importantes || null,
        medico[0].id_centro_principal, idUsuario
      ]
    );

    const idPaciente = result.insertId;

    // Asignar paciente al médico
    await pool.query(
      `INSERT INTO pacientes_medico (id_paciente, id_medico, fecha_asignacion, es_principal, activo)
       VALUES (?, ?, NOW(), 1, 1)`,
      [idPaciente, medico[0].id_medico]
    );

    return NextResponse.json({
      success: true,
      message: "Paciente creado correctamente",
      id_paciente: idPaciente
    });

  } catch (error: any) {
    console.error("Error al crear paciente:", error);
    return NextResponse.json({ success: false, error: "Error al crear paciente" }, { status: 500 });
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