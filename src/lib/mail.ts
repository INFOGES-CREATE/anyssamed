//src\lib\mail.ts

import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,          // smtp.gmail.com
  port: Number(process.env.SMTP_PORT),  // 587
  secure: false,                        // Gmail 587 usa STARTTLS
  auth: {
    user: process.env.SMTP_USER,        // tu Gmail
    pass: process.env.SMTP_PASS,        // clave de aplicación
  },
  tls: {
    rejectUnauthorized: false,          // evita bloqueos SSL
  }
});

export async function sendMail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) {
  try {
    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM,      // Gmail como remitente
      to,
      subject,
      html,
    });

    console.log("📧 Email enviado:", info.messageId);
    return true;
  } catch (error) {
    console.error("❌ ERROR enviando correo:", error);
    return false;
  }
}

export default { sendMail };
