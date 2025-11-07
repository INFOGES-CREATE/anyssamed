import { NextResponse } from "next/server";
import pool from "@/lib/db";

/**
 * ============================================================
 * 👤 API: Buscar Paciente por RUT
 * Sistema MediSuite Pro - Compatible con tu estructura real
 * ============================================================
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const rut = searchParams.get("rut");

    if (!rut) {
      return NextResponse.json(
        { success: false, message: "Falta el parámetro 'rut'." },
        { status: 400 }
      );
    }

    // 🔹 Limpieza del formato del RUT (quita puntos y espacios)
    const rutLimpio = rut.replace(/\./g, "").trim();

    // 🔹 Consulta SQL basada en tu estructura real
    const [rows]: any = await pool.query(
      `
      SELECT 
        id_paciente,
        id_usuario,
        rut,
        pasaporte,
        nombre,
        apellido_paterno,
        apellido_materno,
        fecha_nacimiento,
        genero,
        email,
        telefono,
        celular,
        direccion,
        ciudad,
        region,
        codigo_postal,
        nacionalidad,
        estado_civil,
        ocupacion,
        nivel_educacion,
        grupo_sanguineo,
        es_donante_organos,
        estado,
        preferencia_contacto,
        acepta_comunicaciones_marketing,
        acepta_telemedicina,
        id_centro_registro,
        id_sucursal_registro,
        registrado_por
      FROM pacientes
      WHERE REPLACE(rut, '.', '') = ? OR rut = ?
      LIMIT 1;
      `,
      [rutLimpio, rut]
    );

    if (rows.length === 0) {
      return NextResponse.json({
        success: true,
        paciente: null,
        message: "Paciente no encontrado.",
      });
    }

    const p = rows[0];

    // 🔹 Retorno estructurado del paciente
    return NextResponse.json({
      success: true,
      paciente: {
        id_paciente: p.id_paciente,
        id_usuario: p.id_usuario,
        rut: p.rut,
        pasaporte: p.pasaporte,
        nombre: p.nombre,
        apellido_paterno: p.apellido_paterno,
        apellido_materno: p.apellido_materno,
        fecha_nacimiento: p.fecha_nacimiento,
        genero: p.genero,
        email: p.email,
        telefono: p.telefono,
        celular: p.celular,
        direccion: p.direccion,
        ciudad: p.ciudad,
        region: p.region,
        nacionalidad: p.nacionalidad,
        estado_civil: p.estado_civil,
        ocupacion: p.ocupacion,
        nivel_educacion: p.nivel_educacion,
        grupo_sanguineo: p.grupo_sanguineo,
        es_donante_organos: p.es_donante_organos,
        estado: p.estado,
        preferencia_contacto: p.preferencia_contacto,
        acepta_telemedicina: p.acepta_telemedicina,
      },
    });
  } catch (err: any) {
    console.error("❌ Error en /api/pacientes/buscar-rut:", err);
    return NextResponse.json(
      {
        success: false,
        message: "Error al buscar paciente.",
        error: err.message,
      },
      { status: 500 }
    );
  }
}
