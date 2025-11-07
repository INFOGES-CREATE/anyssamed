// app/api/medico/recetas/[id]/enviar/route.ts
import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { RowDataPacket } from "mysql2";
import nodemailer from "nodemailer";
import twilio from "twilio";
import QRCode from "qrcode";
import PDFDocument from "pdfkit";

// ========================================
// TIPOS
// ========================================

interface MedicoData {
  id_medico: number;
  id_usuario: number;
  numero_registro_medico: string;
  nombre_completo: string;
  email: string;
}

interface DatosEnvio {
  receta: any;
  paciente: {
    nombre: string;
    email: string;
    telefono: string;
  };
  medico: {
    nombre: string;
    email: string;
  };
  centro: {
    nombre: string;
    email: string;
  };
}

interface ResultadoEnvio {
  success: boolean;
  canal: string;
  destinatario: string;
  mensaje: string;
  detalles?: any;
  error?: string;
}

// ========================================
// CONFIGURACIÓN DE SERVICIOS
// ========================================

// Configuración de Nodemailer (Gmail, SendGrid, etc.)
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Configuración de Twilio (WhatsApp)
const twilioClient = process.env.TWILIO_ACCOUNT_SID
  ? twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
  : null;

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
        u.email
      FROM medicos m
      INNER JOIN usuarios u ON m.id_usuario = u.id_usuario
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
 * Obtiene los datos completos para el envío
 */
async function obtenerDatosEnvio(
  idReceta: number,
  idMedico: number
): Promise<DatosEnvio | null> {
  try {
    const [rows] = await pool.query<RowDataPacket[]>(
      `
      SELECT 
        r.*,
        
        -- Paciente
        p.rut as paciente_rut,
        CONCAT(p.nombre, ' ', p.apellido_paterno, ' ', COALESCE(p.apellido_materno, '')) as paciente_nombre,
        p.email as paciente_email,
        p.telefono as paciente_telefono,
        
        -- Médico
        CONCAT(um.nombre, ' ', um.apellido_paterno, ' ', COALESCE(um.apellido_materno, '')) as medico_nombre,
        um.email as medico_email,
        m.numero_registro_medico,
        
        -- Centro
        c.nombre as centro_nombre,
        c.email as centro_email,
        c.telefono as centro_telefono
        
      FROM recetas r
      INNER JOIN pacientes p ON r.id_paciente = p.id_paciente
      INNER JOIN medicos m ON r.id_medico = m.id_medico
      INNER JOIN usuarios um ON m.id_usuario = um.id_usuario
      INNER JOIN centros_medicos c ON r.id_centro = c.id_centro
      WHERE r.id_receta = ? AND r.id_medico = ?
      LIMIT 1
      `,
      [idReceta, idMedico]
    );

    if (rows.length === 0) {
      return null;
    }

    const data = rows[0];

    return {
      receta: data,
      paciente: {
        nombre: data.paciente_nombre,
        email: data.paciente_email,
        telefono: data.paciente_telefono,
      },
      medico: {
        nombre: data.medico_nombre,
        email: data.medico_email,
      },
      centro: {
        nombre: data.centro_nombre,
        email: data.centro_email,
      },
    };
  } catch (error) {
    console.error("Error al obtener datos de envío:", error);
    throw error;
  }
}

/**
 * Genera el código QR para adjuntar
 */
async function generarQRParaEnvio(
  numeroReceta: string,
  codigoVerificacion: string
): Promise<Buffer> {
  try {
    const urlVerificacion = `${process.env.NEXT_PUBLIC_APP_URL}/verificar-receta?numero=${numeroReceta}&codigo=${codigoVerificacion}`;

    const qrBuffer = await QRCode.toBuffer(urlVerificacion, {
      type: "png",
      width: 300,
      margin: 2,
      color: {
        dark: "#000000",
        light: "#FFFFFF",
      },
    });

    return qrBuffer;
  } catch (error) {
    console.error("Error al generar QR:", error);
    throw error;
  }
}

/**
 * Genera PDF simplificado para envío
 */
async function generarPDFParaEnvio(datos: DatosEnvio): Promise<Buffer> {
  return new Promise(async (resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: "LETTER",
        margins: { top: 50, bottom: 50, left: 50, right: 50 },
      });

      const buffers: Buffer[] = [];
      doc.on("data", buffers.push.bind(buffers));
      doc.on("end", () => resolve(Buffer.concat(buffers)));
      doc.on("error", reject);

      // Encabezado
      doc
        .fontSize(18)
        .font("Helvetica-Bold")
        .text("RECETA MÉDICA ELECTRÓNICA", { align: "center" });

      doc.moveDown();

      // Información de la receta
      doc
        .fontSize(12)
        .font("Helvetica")
        .text(`N° Receta: ${datos.receta.numero_receta}`);
      doc.text(`Fecha: ${new Date(datos.receta.fecha_emision).toLocaleDateString("es-CL")}`);
      doc.text(`Código: ${datos.receta.codigo_verificacion}`);

      doc.moveDown();

      // Paciente
      doc.fontSize(14).font("Helvetica-Bold").text("PACIENTE");
      doc.fontSize(11).font("Helvetica").text(datos.paciente.nombre);

      doc.moveDown();

      // Médico
      doc.fontSize(14).font("Helvetica-Bold").text("MÉDICO");
      doc.fontSize(11).font("Helvetica").text(datos.medico.nombre);

      doc.moveDown();

      // Diagnóstico
      doc.fontSize(14).font("Helvetica-Bold").text("DIAGNÓSTICO");
      doc.fontSize(11).font("Helvetica").text(datos.receta.diagnostico);

      doc.moveDown();

      // Medicamentos
      const [medicamentos] = await pool.query<RowDataPacket[]>(
        `SELECT * FROM medicamentos_receta WHERE id_receta = ?`,
        [datos.receta.id_receta]
      );

      doc.fontSize(14).font("Helvetica-Bold").text("MEDICAMENTOS");
      doc.moveDown(0.5);

      medicamentos.forEach((med: any, index: number) => {
        doc
          .fontSize(11)
          .font("Helvetica-Bold")
          .text(`${index + 1}. ${med.nombre_medicamento}`);
        doc
          .fontSize(10)
          .font("Helvetica")
          .text(`   Dosis: ${med.dosis} - Frecuencia: ${med.frecuencia}`);
        doc.text(`   Duración: ${med.duracion}`);
        doc.moveDown(0.5);
      });

      doc.moveDown();

      // QR Code
      const qrBuffer = await generarQRParaEnvio(
        datos.receta.numero_receta,
        datos.receta.codigo_verificacion
      );
      doc.image(qrBuffer, { width: 150, align: "center" });

      doc
        .fontSize(9)
        .text("Escanee el código QR para verificar la receta", {
          align: "center",
        });

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * Envía la receta por email
 */
async function enviarPorEmail(
  datos: DatosEnvio,
  destinatario: string,
  incluirPDF: boolean = true,
  incluirQR: boolean = true
): Promise<ResultadoEnvio> {
  try {
    // Validar email
    if (!destinatario || !destinatario.includes("@")) {
      return {
        success: false,
        canal: "email",
        destinatario,
        mensaje: "Email inválido",
        error: "Dirección de email no válida",
      };
    }

    // Generar adjuntos
    const attachments: any[] = [];

    if (incluirPDF) {
      const pdfBuffer = await generarPDFParaEnvio(datos);
      attachments.push({
        filename: `Receta_${datos.receta.numero_receta}.pdf`,
        content: pdfBuffer,
        contentType: "application/pdf",
      });
    }

    if (incluirQR) {
      const qrBuffer = await generarQRParaEnvio(
        datos.receta.numero_receta,
        datos.receta.codigo_verificacion
      );
      attachments.push({
        filename: `QR_${datos.receta.numero_receta}.png`,
        content: qrBuffer,
        contentType: "image/png",
      });
    }

    // URL de verificación
    const urlVerificacion = `${process.env.NEXT_PUBLIC_APP_URL}/verificar-receta?numero=${datos.receta.numero_receta}&codigo=${datos.receta.codigo_verificacion}`;

    // Contenido HTML del email
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #1E40AF 0%, #3B82F6 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
          .info-box { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; border-left: 4px solid #1E40AF; }
          .button { display: inline-block; background: #1E40AF; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; font-size: 12px; }
          .warning { background: #FEF3C7; border-left: 4px solid #F59E0B; padding: 15px; margin: 20px 0; border-radius: 6px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📋 Receta Médica Electrónica</h1>
            <p>Sistema MediSalud</p>
          </div>
          
          <div class="content">
            <p>Estimado/a <strong>${datos.paciente.nombre}</strong>,</p>
            
            <p>Se ha generado una nueva receta médica electrónica para usted.</p>
            
            <div class="info-box">
              <h3>📄 Información de la Receta</h3>
              <p><strong>Número de Receta:</strong> ${datos.receta.numero_receta}</p>
              <p><strong>Código de Verificación:</strong> ${datos.receta.codigo_verificacion}</p>
              <p><strong>Fecha de Emisión:</strong> ${new Date(datos.receta.fecha_emision).toLocaleDateString("es-CL")}</p>
              ${datos.receta.fecha_vencimiento ? `<p><strong>Válida hasta:</strong> ${new Date(datos.receta.fecha_vencimiento).toLocaleDateString("es-CL")}</p>` : ""}
            </div>
            
            <div class="info-box">
              <h3>👨‍⚕️ Médico Tratante</h3>
              <p><strong>${datos.medico.nombre}</strong></p>
              <p>${datos.centro.nombre}</p>
            </div>
            
            <div class="info-box">
              <h3>💊 Diagnóstico</h3>
              <p>${datos.receta.diagnostico}</p>
            </div>
            
            ${datos.receta.observaciones ? `
            <div class="warning">
              <h4>⚠️ Observaciones Importantes</h4>
              <p>${datos.receta.observaciones}</p>
            </div>
            ` : ""}
            
            <div style="text-align: center;">
              <a href="${urlVerificacion}" class="button">
                🔍 Verificar Receta Online
              </a>
            </div>
            
            <p><strong>Documentos adjuntos:</strong></p>
            <ul>
              ${incluirPDF ? "<li>📄 Receta completa en PDF</li>" : ""}
              ${incluirQR ? "<li>📱 Código QR para verificación</li>" : ""}
            </ul>
            
            <div class="warning">
              <p><strong>⚠️ Importante:</strong></p>
              <ul>
                <li>Esta receta es válida y puede ser dispensada en cualquier farmacia</li>
                <li>Presente el código QR o el número de receta en la farmacia</li>
                <li>Verifique la fecha de vencimiento de la receta</li>
                <li>Siga las indicaciones de su médico</li>
              </ul>
            </div>
          </div>
          
          <div class="footer">
            <p>Este es un correo automático generado por MediSalud</p>
            <p>Por favor no responda a este correo</p>
            <p>© ${new Date().getFullYear()} MediSalud - Todos los derechos reservados</p>
          </div>
        </div>
      </body>
      </html>
    `;

    // Enviar email
    const info = await transporter.sendMail({
      from: `"${datos.centro.nombre}" <${process.env.SMTP_USER}>`,
      to: destinatario,
      subject: `📋 Receta Médica - ${datos.receta.numero_receta}`,
      html: htmlContent,
      attachments,
    });

    return {
      success: true,
      canal: "email",
      destinatario,
      mensaje: "Email enviado exitosamente",
      detalles: {
        messageId: info.messageId,
        response: info.response,
      },
    };
  } catch (error: any) {
    console.error("Error al enviar email:", error);
    return {
      success: false,
      canal: "email",
      destinatario,
      mensaje: "Error al enviar email",
      error: error.message,
    };
  }
}

/**
 * Envía la receta por WhatsApp
 */
async function enviarPorWhatsApp(
  datos: DatosEnvio,
  numeroTelefono: string,
  incluirPDF: boolean = false
): Promise<ResultadoEnvio> {
  try {
    if (!twilioClient) {
      return {
        success: false,
        canal: "whatsapp",
        destinatario: numeroTelefono,
        mensaje: "Servicio de WhatsApp no configurado",
        error: "Twilio no está configurado",
      };
    }

    // Formatear número de teléfono (debe incluir código de país)
    let telefonoFormateado = numeroTelefono.replace(/\D/g, "");
    if (!telefonoFormateado.startsWith("56")) {
      telefonoFormateado = "56" + telefonoFormateado; // Chile
    }

    // URL de verificación
    const urlVerificacion = `${process.env.NEXT_PUBLIC_APP_URL}/verificar-receta?numero=${datos.receta.numero_receta}&codigo=${datos.receta.codigo_verificacion}`;

    // Mensaje de texto
    const mensaje = `
🏥 *RECETA MÉDICA ELECTRÓNICA*

📋 *Información de la Receta*
• N° Receta: ${datos.receta.numero_receta}
• Código: ${datos.receta.codigo_verificacion}
• Fecha: ${new Date(datos.receta.fecha_emision).toLocaleDateString("es-CL")}

👨‍⚕️ *Médico*
${datos.medico.nombre}
${datos.centro.nombre}

💊 *Diagnóstico*
${datos.receta.diagnostico}

🔍 *Verificar receta:*
${urlVerificacion}

⚠️ *Importante:*
• Presente este código en la farmacia
• Verifique la fecha de vencimiento
• Siga las indicaciones médicas

_Este es un mensaje automático de MediSalud_
    `.trim();

    // Enviar mensaje
    const messageResult = await twilioClient.messages.create({
      from: `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`,
      to: `whatsapp:+${telefonoFormateado}`,
      body: mensaje,
    });

    // Si se solicita PDF, enviarlo como segundo mensaje
    if (incluirPDF) {
      const pdfBuffer = await generarPDFParaEnvio(datos);
      
      // Aquí necesitarías subir el PDF a un servidor y obtener URL
      // Por ahora solo enviamos el mensaje de texto
    }

    return {
      success: true,
      canal: "whatsapp",
      destinatario: numeroTelefono,
      mensaje: "WhatsApp enviado exitosamente",
      detalles: {
        sid: messageResult.sid,
        status: messageResult.status,
      },
    };
  } catch (error: any) {
    console.error("Error al enviar WhatsApp:", error);
    return {
      success: false,
      canal: "whatsapp",
      destinatario: numeroTelefono,
      mensaje: "Error al enviar WhatsApp",
      error: error.message,
    };
  }
}

/**
 * Envía la receta por SMS
 */
async function enviarPorSMS(
  datos: DatosEnvio,
  numeroTelefono: string
): Promise<ResultadoEnvio> {
  try {
    if (!twilioClient) {
      return {
        success: false,
        canal: "sms",
        destinatario: numeroTelefono,
        mensaje: "Servicio de SMS no configurado",
        error: "Twilio no está configurado",
      };
    }

    // Formatear número
    let telefonoFormateado = numeroTelefono.replace(/\D/g, "");
    if (!telefonoFormateado.startsWith("56")) {
      telefonoFormateado = "56" + telefonoFormateado;
    }

    // URL corta
    const urlVerificacion = `${process.env.NEXT_PUBLIC_APP_URL}/verificar-receta?numero=${datos.receta.numero_receta}&codigo=${datos.receta.codigo_verificacion}`;

    // Mensaje SMS (máximo 160 caracteres recomendado)
    const mensaje = `MediSalud: Nueva receta ${datos.receta.numero_receta}. Código: ${datos.receta.codigo_verificacion}. Verificar: ${urlVerificacion}`;

    // Enviar SMS
    const messageResult = await twilioClient.messages.create({
      from: process.env.TWILIO_PHONE_NUMBER,
      to: `+${telefonoFormateado}`,
      body: mensaje,
    });

    return {
      success: true,
      canal: "sms",
      destinatario: numeroTelefono,
      mensaje: "SMS enviado exitosamente",
      detalles: {
        sid: messageResult.sid,
        status: messageResult.status,
      },
    };
  } catch (error: any) {
    console.error("Error al enviar SMS:", error);
    return {
      success: false,
      canal: "sms",
      destinatario: numeroTelefono,
      mensaje: "Error al enviar SMS",
      error: error.message,
    };
  }
}

/**
 * Registra el envío en la base de datos
 */
async function registrarEnvio(
  idReceta: number,
  idUsuario: number,
  canal: string,
  destinatario: string,
  resultado: ResultadoEnvio,
  ipAddress: string
): Promise<void> {
  try {
    await pool.query(
      `
      INSERT INTO envios_recetas (
        id_receta,
        id_usuario,
        canal,
        destinatario,
        estado,
        detalles,
        fecha_envio,
        ip_address
      ) VALUES (?, ?, ?, ?, ?, ?, NOW(), ?)
      `,
      [
        idReceta,
        idUsuario,
        canal,
        destinatario,
        resultado.success ? "enviado" : "fallido",
        JSON.stringify(resultado),
        ipAddress,
      ]
    );

    // También registrar en auditoría
    await pool.query(
      `
      INSERT INTO auditoria_recetas (
        id_receta,
        accion,
        id_usuario,
        detalles,
        fecha_accion,
        ip_address
      ) VALUES (?, 'ENVIO', ?, ?, NOW(), ?)
      `,
      [
        idReceta,
        idUsuario,
        `Envío por ${canal} a ${destinatario}: ${resultado.mensaje}`,
        ipAddress,
      ]
    );
  } catch (error) {
    console.error("Error al registrar envío:", error);
  }
}

// ========================================
// HANDLER POST - Enviar receta
// ========================================

export async function POST(
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

    // 4. Obtener datos del body
    const body = await request.json();

    const {
      canal = "email", // email, whatsapp, sms, todos
      destinatario, // email o teléfono específico (opcional)
      incluir_pdf = true,
      incluir_qr = true,
      enviar_a_paciente = true,
      enviar_copia_medico = false,
    } = body;

    // 5. Obtener datos de la receta
    const datos = await obtenerDatosEnvio(idReceta, medico.id_medico);

    if (!datos) {
      return NextResponse.json(
        {
          success: false,
          error: "Receta no encontrada o no tienes permisos para enviarla",
        },
        { status: 404 }
      );
    }

    // 6. Realizar envíos según canal
    const resultados: ResultadoEnvio[] = [];

    if (canal === "email" || canal === "todos") {
      // Enviar al paciente
      if (enviar_a_paciente && datos.paciente.email) {
        const resultado = await enviarPorEmail(
          datos,
          destinatario || datos.paciente.email,
          incluir_pdf,
          incluir_qr
        );
        resultados.push(resultado);

        await registrarEnvio(
          idReceta,
          idUsuario,
          "email",
          destinatario || datos.paciente.email,
          resultado,
          request.headers.get("x-forwarded-for") || "0.0.0.0"
        );
      }

      // Enviar copia al médico
      if (enviar_copia_medico && datos.medico.email) {
        const resultado = await enviarPorEmail(
          datos,
          datos.medico.email,
          incluir_pdf,
          incluir_qr
        );
        resultados.push(resultado);

        await registrarEnvio(
          idReceta,
          idUsuario,
          "email",
          datos.medico.email,
          resultado,
          request.headers.get("x-forwarded-for") || "0.0.0.0"
        );
      }
    }

    if (canal === "whatsapp" || canal === "todos") {
      if (enviar_a_paciente && datos.paciente.telefono) {
        const resultado = await enviarPorWhatsApp(
          datos,
          destinatario || datos.paciente.telefono,
          incluir_pdf
        );
        resultados.push(resultado);

        await registrarEnvio(
          idReceta,
          idUsuario,
          "whatsapp",
          destinatario || datos.paciente.telefono,
          resultado,
          request.headers.get("x-forwarded-for") || "0.0.0.0"
        );
      }
    }

    if (canal === "sms") {
      if (enviar_a_paciente && datos.paciente.telefono) {
        const resultado = await enviarPorSMS(
          datos,
          destinatario || datos.paciente.telefono
        );
        resultados.push(resultado);

        await registrarEnvio(
          idReceta,
          idUsuario,
          "sms",
          destinatario || datos.paciente.telefono,
          resultado,
          request.headers.get("x-forwarded-for") || "0.0.0.0"
        );
      }
    }

    // 7. Verificar resultados
    const exitosos = resultados.filter((r) => r.success).length;
    const fallidos = resultados.filter((r) => !r.success).length;

    return NextResponse.json(
      {
        success: exitosos > 0,
        mensaje:
          exitosos > 0
            ? `Receta enviada exitosamente por ${exitosos} canal(es)`
            : "No se pudo enviar la receta por ningún canal",
        resumen: {
          total: resultados.length,
          exitosos,
          fallidos,
        },
        resultados,
        timestamp: new Date().toISOString(),
      },
      { status: exitosos > 0 ? 200 : 400 }
    );
  } catch (error: any) {
    console.error("❌ Error en POST /api/medico/recetas/[id]/enviar:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Error al enviar la receta",
        details:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}
