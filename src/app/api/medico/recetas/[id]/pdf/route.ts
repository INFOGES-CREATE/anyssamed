// app/api/medico/recetas/[id]/pdf/route.ts
import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { RowDataPacket } from "mysql2";
import PDFDocument from "pdfkit";
import QRCode from "qrcode";
import { Readable } from "stream";

// ========================================
// TIPOS
// ========================================

interface MedicoData {
  id_medico: number;
  id_usuario: number;
  numero_registro_medico: string;
  nombre_completo: string;
  especialidad_principal: string;
  firma_digital?: string;
}

// ========================================
// HELPER PARA OBTENER EL TOKEN
// ========================================

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

// ========================================
// FUNCIONES AUXILIARES
// ========================================

/**
 * Obtiene la información del médico autenticado
 */
async function obtenerMedicoAutenticado(
  idUsuario: number
): Promise<MedicoData | null> {
  try {
    const [rows] = await pool.query<RowDataPacket[]>(
      `
      SELECT 
        m.id_medico,
        m.id_usuario,
        m.numero_registro_medico,
        CONCAT(u.nombre, ' ', u.apellido_paterno, ' ', COALESCE(u.apellido_materno, '')) as nombre_completo,
        e.nombre as especialidad_principal,
        m.firma_digital
      FROM medicos m
      INNER JOIN usuarios u ON m.id_usuario = u.id_usuario
      LEFT JOIN especialidades e ON m.id_especialidad_principal = e.id_especialidad
      WHERE m.id_usuario = ? AND m.estado = 'activo'
      LIMIT 1
      `,
      [idUsuario]
    );

    if (rows.length === 0) {
      return null;
    }

    return rows[0] as MedicoData;
  } catch (error) {
    console.error("Error al obtener médico:", error);
    throw error;
  }
}

/**
 * Obtiene los datos completos de la receta para el PDF
 */
async function obtenerDatosRecetaPDF(
  idReceta: number,
  idMedico: number
): Promise<any | null> {
  try {
    const [recetaRows] = await pool.query<RowDataPacket[]>(
      `
      SELECT 
        r.id_receta,
        r.numero_receta,
        r.codigo_verificacion,
        r.fecha_emision,
        r.fecha_vencimiento,
        r.tipo_receta,
        r.diagnostico,
        r.codigo_cie10,
        r.estado,
        r.es_cronica,
        r.observaciones,
        r.firma_digital,
        r.fecha_firma,
        
        -- Paciente
        p.rut as paciente_rut,
        CONCAT(p.nombre, ' ', p.apellido_paterno, ' ', COALESCE(p.apellido_materno, '')) as paciente_nombre,
        p.fecha_nacimiento as paciente_fecha_nacimiento,
        TIMESTAMPDIFF(YEAR, p.fecha_nacimiento, CURDATE()) as paciente_edad,
        p.genero as paciente_genero,
        p.direccion as paciente_direccion,
        p.ciudad as paciente_ciudad,
        p.telefono as paciente_telefono,
        p.email as paciente_email,
        p.prevision as paciente_prevision,
        p.numero_prevision as paciente_numero_prevision,
        
        -- Médico
        m.numero_registro_medico,
        CONCAT(um.nombre, ' ', um.apellido_paterno, ' ', COALESCE(um.apellido_materno, '')) as medico_nombre,
        e.nombre as medico_especialidad,
        um.telefono as medico_telefono,
        um.email as medico_email,
        m.firma_digital as medico_firma_digital,
        
        -- Centro
        c.nombre as centro_nombre,
        c.direccion as centro_direccion,
        c.ciudad as centro_ciudad,
        c.region as centro_region,
        c.telefono as centro_telefono,
        c.email as centro_email,
        c.logo_url as centro_logo_url,
        c.codigo_establecimiento as centro_codigo
        
      FROM recetas r
      INNER JOIN pacientes p ON r.id_paciente = p.id_paciente
      INNER JOIN medicos m ON r.id_medico = m.id_medico
      INNER JOIN usuarios um ON m.id_usuario = um.id_usuario
      LEFT JOIN especialidades e ON m.id_especialidad_principal = e.id_especialidad
      INNER JOIN centros_medicos c ON r.id_centro = c.id_centro
      WHERE r.id_receta = ? AND r.id_medico = ?
      LIMIT 1
      `,
      [idReceta, idMedico]
    );

    if (recetaRows.length === 0) {
      return null;
    }

    const receta = recetaRows[0];

    // Obtener medicamentos
    const [medicamentos] = await pool.query<RowDataPacket[]>(
      `
      SELECT 
        nombre_medicamento,
        dosis,
        frecuencia,
        duracion,
        cantidad,
        unidad,
        via_administracion,
        instrucciones,
        es_controlado
      FROM medicamentos_receta
      WHERE id_receta = ?
      ORDER BY id_medicamento_receta ASC
      `,
      [idReceta]
    );

    return {
      ...receta,
      medicamentos,
    };
  } catch (error) {
    console.error("Error al obtener datos de receta para PDF:", error);
    throw error;
  }
}

/**
 * Genera el código QR con la información de la receta
 */
async function generarCodigoQR(
  numeroReceta: string,
  codigoVerificacion: string
): Promise<string> {
  try {
    const urlVerificacion = `${process.env.NEXT_PUBLIC_APP_URL}/verificar-receta?numero=${numeroReceta}&codigo=${codigoVerificacion}`;
    const qrDataURL = await QRCode.toDataURL(urlVerificacion, {
      width: 150,
      margin: 1,
      color: {
        dark: "#000000",
        light: "#FFFFFF",
      },
    });
    return qrDataURL;
  } catch (error) {
    console.error("Error al generar código QR:", error);
    throw error;
  }
}

/**
 * Formatea fecha en formato legible
 */
function formatearFecha(fecha: string | Date): string {
  const f = new Date(fecha);
  const opciones: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "long",
    day: "numeric",
  };
  return f.toLocaleDateString("es-CL", opciones);
}

/**
 * Genera el PDF de la receta
 */
async function generarPDFReceta(datos: any): Promise<Buffer> {
  return new Promise(async (resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: "LETTER",
        margins: {
          top: 50,
          bottom: 50,
          left: 50,
          right: 50,
        },
        info: {
          Title: `Receta Médica - ${datos.numero_receta}`,
          Author: datos.medico_nombre,
          Subject: "Receta Médica Electrónica",
          Keywords: "receta, médica, electrónica",
          Creator: "MediSalud",
          Producer: "MediSalud",
        },
      });

      const buffers: Buffer[] = [];

      doc.on("data", buffers.push.bind(buffers));
      doc.on("end", () => {
        const pdfBuffer = Buffer.concat(buffers);
        resolve(pdfBuffer);
      });
      doc.on("error", reject);

      // ========================================
      // ENCABEZADO
      // ========================================

      // Logo del centro (si existe)
      if (datos.centro_logo_url) {
        try {
          // Aquí deberías cargar el logo desde la URL
          // doc.image(datos.centro_logo_url, 50, 50, { width: 100 });
        } catch (error) {
          console.log("No se pudo cargar el logo");
        }
      }

      // Información del centro
      doc
        .fontSize(16)
        .font("Helvetica-Bold")
        .text(datos.centro_nombre, 50, 50, { align: "center" });

      doc
        .fontSize(10)
        .font("Helvetica")
        .text(
          `${datos.centro_direccion}, ${datos.centro_ciudad}, ${datos.centro_region}`,
          { align: "center" }
        );

      doc.text(`Tel: ${datos.centro_telefono} | Email: ${datos.centro_email}`, {
        align: "center",
      });

      if (datos.centro_codigo) {
        doc.text(`Código Establecimiento: ${datos.centro_codigo}`, {
          align: "center",
        });
      }

      // Línea separadora
      doc
        .moveTo(50, 120)
        .lineTo(562, 120)
        .stroke();

      // ========================================
      // TÍTULO
      // ========================================

      doc
        .fontSize(18)
        .font("Helvetica-Bold")
        .text("RECETA MÉDICA", 50, 135, { align: "center" });

      // Tipo de receta
      const tipoRecetaLabel = {
        simple: "RECETA SIMPLE",
        retenida: "RECETA RETENIDA",
        controlada: "RECETA CONTROLADA",
        magistral: "RECETA MAGISTRAL",
      }[datos.tipo_receta] || "RECETA";

      doc
        .fontSize(12)
        .font("Helvetica-Bold")
        .fillColor("#DC2626")
        .text(tipoRecetaLabel, { align: "center" });

      doc.fillColor("#000000");

      // ========================================
      // INFORMACIÓN DE LA RECETA
      // ========================================

      let yPos = 180;

      doc
        .fontSize(10)
        .font("Helvetica")
        .text(`N° Receta: ${datos.numero_receta}`, 50, yPos);

      doc.text(
        `Fecha Emisión: ${formatearFecha(datos.fecha_emision)}`,
        350,
        yPos
      );

      yPos += 15;

      if (datos.fecha_vencimiento) {
        doc.text(
          `Válida hasta: ${formatearFecha(datos.fecha_vencimiento)}`,
          350,
          yPos
        );
        yPos += 15;
      }

      if (datos.es_cronica) {
        doc
          .font("Helvetica-Bold")
          .fillColor("#DC2626")
          .text("RECETA CRÓNICA", 350, yPos);
        doc.fillColor("#000000");
        yPos += 15;
      }

      yPos += 10;

      // ========================================
      // DATOS DEL PACIENTE
      // ========================================

      doc
        .fontSize(12)
        .font("Helvetica-Bold")
        .text("DATOS DEL PACIENTE", 50, yPos);

      yPos += 20;

      doc
        .fontSize(10)
        .font("Helvetica")
        .text(`Nombre: ${datos.paciente_nombre}`, 50, yPos);

      yPos += 15;

      doc.text(`RUT: ${datos.paciente_rut}`, 50, yPos);
      doc.text(
        `Edad: ${datos.paciente_edad} años | Sexo: ${datos.paciente_genero === "M" ? "Masculino" : "Femenino"}`,
        250,
        yPos
      );

      yPos += 15;

      if (datos.paciente_direccion) {
        doc.text(`Dirección: ${datos.paciente_direccion}`, 50, yPos);
        yPos += 15;
      }

      doc.text(`Previsión: ${datos.paciente_prevision}`, 50, yPos);

      if (datos.paciente_numero_prevision) {
        doc.text(`N° Previsión: ${datos.paciente_numero_prevision}`, 250, yPos);
      }

      yPos += 25;

      // ========================================
      // DIAGNÓSTICO
      // ========================================

      doc
        .fontSize(12)
        .font("Helvetica-Bold")
        .text("DIAGNÓSTICO", 50, yPos);

      yPos += 20;

      doc
        .fontSize(10)
        .font("Helvetica")
        .text(datos.diagnostico, 50, yPos, {
          width: 512,
          align: "justify",
        });

      yPos += doc.heightOfString(datos.diagnostico, { width: 512 }) + 5;

      if (datos.codigo_cie10) {
        doc
          .font("Helvetica-Bold")
          .text(`Código CIE-10: ${datos.codigo_cie10}`, 50, yPos);
        yPos += 15;
      }

      yPos += 15;

      // ========================================
      // MEDICAMENTOS
      // ========================================

      doc
        .fontSize(12)
        .font("Helvetica-Bold")
        .text("MEDICAMENTOS PRESCRITOS", 50, yPos);

      yPos += 20;

      // Verificar si necesitamos una nueva página
      if (yPos > 650) {
        doc.addPage();
        yPos = 50;
      }

      datos.medicamentos.forEach((med: any, index: number) => {
        // Verificar espacio disponible
        if (yPos > 680) {
          doc.addPage();
          yPos = 50;
        }

        // Número de medicamento
        doc
          .fontSize(11)
          .font("Helvetica-Bold")
          .text(`${index + 1}. ${med.nombre_medicamento}`, 50, yPos);

        if (med.es_controlado) {
          doc
            .fillColor("#DC2626")
            .text(" (CONTROLADO)", { continued: true });
          doc.fillColor("#000000");
        }

        yPos += 18;

        // Detalles del medicamento
        doc
          .fontSize(10)
          .font("Helvetica")
          .text(`   Dosis: ${med.dosis}`, 50, yPos);

        yPos += 15;

        doc.text(`   Frecuencia: ${med.frecuencia}`, 50, yPos);

        yPos += 15;

        doc.text(`   Duración: ${med.duracion}`, 50, yPos);

        yPos += 15;

        doc.text(
          `   Cantidad: ${med.cantidad} ${med.unidad}`,
          50,
          yPos
        );

        yPos += 15;

        doc.text(`   Vía: ${med.via_administracion}`, 50, yPos);

        yPos += 15;

        if (med.instrucciones) {
          doc.text(`   Instrucciones: ${med.instrucciones}`, 50, yPos, {
            width: 512,
          });
          yPos += doc.heightOfString(`   Instrucciones: ${med.instrucciones}`, {
            width: 512,
          });
        }

        yPos += 10;

        // Línea separadora entre medicamentos
        if (index < datos.medicamentos.length - 1) {
          doc
            .moveTo(50, yPos)
            .lineTo(562, yPos)
            .strokeOpacity(0.3)
            .stroke()
            .strokeOpacity(1);
          yPos += 15;
        }
      });

      yPos += 20;

      // ========================================
      // OBSERVACIONES
      // ========================================

      if (datos.observaciones) {
        if (yPos > 650) {
          doc.addPage();
          yPos = 50;
        }

        doc
          .fontSize(12)
          .font("Helvetica-Bold")
          .text("OBSERVACIONES", 50, yPos);

        yPos += 20;

        doc
          .fontSize(10)
          .font("Helvetica")
          .text(datos.observaciones, 50, yPos, {
            width: 512,
            align: "justify",
          });

        yPos += doc.heightOfString(datos.observaciones, { width: 512 }) + 20;
      }

      // ========================================
      // DATOS DEL MÉDICO Y FIRMA
      // ========================================

      // Verificar si necesitamos nueva página
      if (yPos > 600) {
        doc.addPage();
        yPos = 50;
      }

      yPos += 30;

      doc
        .fontSize(12)
        .font("Helvetica-Bold")
        .text("MÉDICO TRATANTE", 50, yPos);

      yPos += 20;

      doc
        .fontSize(10)
        .font("Helvetica")
        .text(`Nombre: ${datos.medico_nombre}`, 50, yPos);

      yPos += 15;

      doc.text(`Especialidad: ${datos.medico_especialidad}`, 50, yPos);

      yPos += 15;

      doc.text(`RNM: ${datos.numero_registro_medico}`, 50, yPos);

      yPos += 15;

      doc.text(`Tel: ${datos.medico_telefono} | Email: ${datos.medico_email}`, 50, yPos);

      yPos += 40;

      // Línea para firma
      doc
        .moveTo(50, yPos)
        .lineTo(250, yPos)
        .stroke();

      yPos += 10;

      doc
        .fontSize(9)
        .font("Helvetica")
        .text("Firma del Médico", 50, yPos);

      // ========================================
      // CÓDIGO QR Y VERIFICACIÓN
      // ========================================

      const qrCode = await generarCodigoQR(
        datos.numero_receta,
        datos.codigo_verificacion
      );

      // Posicionar QR en la esquina inferior derecha
      const qrYPos = yPos - 100;

      // Insertar QR
      doc.image(qrCode, 420, qrYPos, {
        width: 120,
        height: 120,
      });

      doc
        .fontSize(8)
        .font("Helvetica-Bold")
        .text("Código de Verificación:", 420, qrYPos + 125, {
          width: 120,
          align: "center",
        });

      doc
        .fontSize(10)
        .font("Helvetica-Bold")
        .text(datos.codigo_verificacion, 420, qrYPos + 140, {
          width: 120,
          align: "center",
        });

      // ========================================
      // PIE DE PÁGINA
      // ========================================

      const pageCount = (doc as any).bufferedPageRange().count;

      for (let i = 0; i < pageCount; i++) {
        doc.switchToPage(i);

        // Línea superior del pie
        doc
          .moveTo(50, 742)
          .lineTo(562, 742)
          .strokeOpacity(0.3)
          .stroke()
          .strokeOpacity(1);

        // Texto del pie
        doc
          .fontSize(8)
          .font("Helvetica")
          .text(
            `Receta Médica Electrónica - ${datos.numero_receta}`,
            50,
            750,
            { align: "left" }
          );

        doc.text(
          `Página ${i + 1} de ${pageCount}`,
          0,
          750,
          { align: "center" }
        );

        doc.text(
          `Generado: ${formatearFecha(new Date())}`,
          0,
          750,
          { align: "right", width: 512 }
        );

        // Advertencia legal
        doc
          .fontSize(7)
          .font("Helvetica-Oblique")
          .text(
            "Este documento es una receta médica electrónica válida. Verifique su autenticidad escaneando el código QR.",
            50,
            762,
            { align: "center", width: 512 }
          );
      }

      // Finalizar el documento
      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * Registra la generación del PDF en auditoría
 */
async function registrarGeneracionPDF(
  idReceta: number,
  idUsuario: number,
  ipAddress: string
): Promise<void> {
  try {
    await pool.query(
      `
      INSERT INTO auditoria_recetas (
        id_receta,
        accion,
        id_usuario,
        detalles,
        fecha_accion,
        ip_address
      ) VALUES (?, 'GENERACION_PDF', ?, 'PDF generado y descargado', NOW(), ?)
      `,
      [idReceta, idUsuario, ipAddress]
    );
  } catch (error) {
    console.error("Error al registrar generación de PDF:", error);
  }
}

// ========================================
// HANDLER GET - Generar y descargar PDF
// ========================================

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const idReceta = parseInt(params.id);

    if (isNaN(idReceta)) {
      return NextResponse.json(
        {
          success: false,
          error: "ID de receta inválido",
        },
        { status: 400 }
      );
    }

    // 1. Obtener token
    const sessionToken = getSessionToken(request);

    if (!sessionToken) {
      return NextResponse.json(
        {
          success: false,
          error: "No hay sesión activa",
        },
        { status: 401 }
      );
    }

    // 2. Verificar sesión
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

    if (sesiones.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Sesión inválida o expirada",
        },
        { status: 401 }
      );
    }

    const idUsuario = sesiones[0].id_usuario;

    // 3. Verificar que sea médico
    const medico = await obtenerMedicoAutenticado(idUsuario);

    if (!medico) {
      return NextResponse.json(
        {
          success: false,
          error: "No tienes un registro de médico activo",
        },
        { status: 403 }
      );
    }

    // 4. Obtener datos de la receta
    const datosReceta = await obtenerDatosRecetaPDF(idReceta, medico.id_medico);

    if (!datosReceta) {
      return NextResponse.json(
        {
          success: false,
          error: "Receta no encontrada o no tienes permisos para verla",
        },
        { status: 404 }
      );
    }

    // 5. Generar PDF
    const pdfBuffer = await generarPDFReceta(datosReceta);

    // 6. Registrar en auditoría
    await registrarGeneracionPDF(
      idReceta,
      idUsuario,
      request.headers.get("x-forwarded-for") || "0.0.0.0"
    );

    // 7. Preparar nombre del archivo
    const nombreArchivo = `Receta_${datosReceta.numero_receta.replace(/[^a-zA-Z0-9]/g, "_")}.pdf`;

    // 8. Retornar PDF
    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${nombreArchivo}"`,
        "Content-Length": pdfBuffer.length.toString(),
        "Cache-Control": "no-cache, no-store, must-revalidate",
        Pragma: "no-cache",
        Expires: "0",
      },
    });
  } catch (error: any) {
    console.error("❌ Error en GET /api/medico/recetas/[id]/pdf:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Error al generar el PDF",
        details:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}
