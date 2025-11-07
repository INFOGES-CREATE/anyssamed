// src/app/api/pacientes/upsert/route.ts
import { NextResponse } from "next/server";
import pool from "@/lib/db";

/**
 * Upsert de paciente:
 * - Busca por RUT (único en la tabla)
 * - Si existe -> UPDATE
 * - Si no existe -> INSERT
 *
 * Campos NOT NULL en tu tabla:
 *   rut (unique)
 *   nombre
 *   apellido_paterno
 *   fecha_nacimiento
 *   genero
 *   grupo_sanguineo (default 'desconocido')
 *   estado (default 'activo')
 *   acepta_comunicaciones_marketing (0)
 *   acepta_telemedicina (0)
 *
 * Lo demás puede ir como NULL / default.
 */

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Datos que vienen del formulario Paso 1
    const {
      rut,
      nombre,
      apellido_paterno,
      apellido_materno,
      fecha_nacimiento,
      genero,
      email,
      telefono,
      celular,

      // opcionales (algunos los rellenaste si paciente ya existe)
      direccion,
      ciudad,
      region,
      codigo_postal,
      nacionalidad,
      estado_civil,
      ocupacion,
      nivel_educacion,
      grupo_sanguineo,
      preferencia_contacto,
      acepta_notificaciones, // boolean del checkbox marketing
      acepta_telemedicina,   // si quieres marcarlo, si no llega -> 0
      id_centro_registro,
      id_sucursal_registro,
      notas_administrativas,
    } = body || {};

    // =========================
    // 1. Validaciones mínimas
    // =========================
    if (
      !rut ||
      !nombre ||
      !apellido_paterno ||
      !fecha_nacimiento ||
      !genero
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Faltan campos obligatorios del paciente (rut, nombre, apellido_paterno, fecha_nacimiento, genero).",
        },
        { status: 400 }
      );
    }

    // =========================
    // 2. Normalizar RUT
    // guardamos un formato consistente "12345678-9"
    // =========================
    const rutNormalizado = normalizarRut(rut);

    // defaults seguros para columnas NOT NULL
    const grupoSanguineoFinal = grupo_sanguineo || "desconocido";
    const nacionalidadFinal = nacionalidad || "Chilena";
    const preferenciaContactoFinal = preferencia_contacto || "telefono";
    const aceptaMarketingFinal = acepta_notificaciones ? 1 : 0;
    const aceptaTelemedicinaFinal = acepta_telemedicina ? 1 : 0;

    // =========================
    // 3. ¿Paciente ya existe?
    // =========================
    const [rows]: any = await pool.query(
      "SELECT id_paciente FROM pacientes WHERE rut = ? LIMIT 1",
      [rutNormalizado]
    );

    let id_paciente: number;

    if (rows.length > 0) {
      // ====================================
      // 3.A UPDATE paciente existente
      // ====================================
      id_paciente = rows[0].id_paciente;

      await pool.query(
        `
        UPDATE pacientes SET
          nombre = ?,
          apellido_paterno = ?,
          apellido_materno = ?,
          fecha_nacimiento = ?,
          genero = ?,
          email = ?,
          telefono = ?,
          celular = ?,
          direccion = ?,
          ciudad = ?,
          region = ?,
          codigo_postal = ?,
          nacionalidad = ?,
          estado_civil = ?,
          ocupacion = ?,
          nivel_educacion = ?,
          grupo_sanguineo = ?,
          preferencia_contacto = ?,
          acepta_comunicaciones_marketing = ?,
          acepta_telemedicina = ?,
          id_centro_registro = ?,
          id_sucursal_registro = ?,
          registrado_por = ?, -- usuario que hace el cambio
          notas_administrativas = ?,
          estado = 'activo'
        WHERE rut = ?
        `,
        [
          nombre,
          apellido_paterno,
          apellido_materno || null,
          fecha_nacimiento,
          genero,
          email || null,
          telefono || null,
          celular || null,
          direccion || null,
          ciudad || null,
          region || null,
          codigo_postal || null,
          nacionalidadFinal,
          estado_civil || null,
          ocupacion || null,
          nivel_educacion || null,
          grupoSanguineoFinal,
          preferenciaContactoFinal,
          aceptaMarketingFinal,
          aceptaTelemedicinaFinal,
          id_centro_registro || null,
          id_sucursal_registro || null,
          1, // registrado_por (admin / sistema)
          notas_administrativas || null,
          rutNormalizado,
        ]
      );
    } else {
      // ====================================
      // 3.B INSERT paciente nuevo
      // ====================================
      const [insertRes]: any = await pool.query(
        `
        INSERT INTO pacientes (
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
          foto_url,
          preferencia_contacto,
          acepta_comunicaciones_marketing,
          acepta_telemedicina,
          id_centro_registro,
          id_sucursal_registro,
          registrado_por,
          notas_administrativas
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
        [
          rutNormalizado,
          null, // pasaporte (si agregas flujo extranjero después)
          nombre,
          apellido_paterno,
          apellido_materno || null,
          fecha_nacimiento,
          genero,
          email || null,
          telefono || null,
          celular || null,
          direccion || null,
          ciudad || null,
          region || null,
          codigo_postal || null,
          nacionalidadFinal,
          estado_civil || null,
          ocupacion || null,
          nivel_educacion || null,
          grupoSanguineoFinal,
          null, // es_donante_organos
          "activo", // estado
          null, // foto_url
          preferenciaContactoFinal,
          aceptaMarketingFinal,
          aceptaTelemedicinaFinal,
          id_centro_registro || null,
          id_sucursal_registro || null,
          1, // registrado_por
          notas_administrativas || null,
        ]
      );

      id_paciente = insertRes.insertId;
    }

    // =========================
    // 4. Respuesta
    // =========================
    return NextResponse.json({
      success: true,
      message: "Paciente guardado/actualizado correctamente.",
      paciente: {
        id_paciente,
        rut: rutNormalizado,
        nombre,
        apellido_paterno,
        apellido_materno: apellido_materno || "",
        email: email || "",
        telefono: telefono || "",
        celular: celular || "",
        fecha_nacimiento,
        genero,
      },
    });
  } catch (error: any) {
    console.error("❌ Error en /api/pacientes/upsert:", error);
    return NextResponse.json(
      {
        success: false,
        message: "No se pudo guardar el paciente.",
        error: error?.message || "Error desconocido",
      },
      { status: 500 }
    );
  }
}

/**
 * normalizarRut:
 *   "12.345.678-9" -> "12345678-9"
 *   "123456789"    -> "12345678-9"
 */
function normalizarRut(rutInput: string): string {
  const limpio = rutInput.replace(/[^\dkK]/g, "").toUpperCase();
  if (limpio.length < 2) return limpio;
  const cuerpo = limpio.slice(0, -1);
  const dv = limpio.slice(-1);
  return `${cuerpo}-${dv}`;
}
