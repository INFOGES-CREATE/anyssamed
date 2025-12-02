// src\app\api\auth\sms\send-sms
// 📲 Enviar código SMS (Twilio o modo local) + registrar auditoría
// Compatible con Next.js 14 – App Router
export const dynamic = "force-dynamic";

export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { RowDataPacket, ResultSetHeader } from "mysql2";
import pool from "@/lib/db";

// -----------------------------------------------------
// Helpers
// -----------------------------------------------------
function normalizePhone(phone: string): string {
  return phone.replace(/\D/g, "").trim();
}

function generarCodigo(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// -----------------------------------------------------
// POST handler
// -----------------------------------------------------
export async function POST(req: Request) {
  const connection = await pool.getConnection();

  try {
    const body = await req.json();
    const rawPhone = String(body.telefono ?? "");
    const ip = String(req.headers.get("x-forwarded-for") || "127.0.0.1");
    const userAgent = String(req.headers.get("user-agent") || "");

    const normalizedPhone = normalizePhone(rawPhone);

    if (!normalizedPhone) {
      return NextResponse.json(
        { ok: false, error: "Debe enviar un número de teléfono válido." },
        { status: 400 }
      );
    }

    await connection.beginTransaction();

    // -------------------------------------------------------------
    // 1) Buscar usuario por teléfono o celular
    // -------------------------------------------------------------
    const [userRows] = await connection.query<RowDataPacket[]>(
      `
      SELECT id_usuario
      FROM usuarios
      WHERE telefono = ? OR celular = ?
      LIMIT 1
      `,
      [normalizedPhone, normalizedPhone]
    );

    if (userRows.length === 0) {
      await connection.rollback();
      return NextResponse.json(
        {
          ok: false,
          message: "No hay ningún usuario asociado a ese número de teléfono.",
        },
        { status: 404 }
      );
    }

    const idUsuario = Number(userRows[0].id_usuario);

    // -------------------------------------------------------------
    // 2) Revisar SMS anterior (cooldown)
    // -------------------------------------------------------------
    const [lastSmsRows] = await connection.query<RowDataPacket[]>(
      `
      SELECT id_sms, enviado_en, estado, intentos, max_intentos
      FROM sms_verificacion
      WHERE id_usuario = ?
      ORDER BY enviado_en DESC
      LIMIT 1
      `,
      [idUsuario]
    );

    if (lastSmsRows.length > 0) {
      const last = lastSmsRows[0];
      const enviadoHaceMs =
        Date.now() - new Date(last.enviado_en).getTime();

      if (enviadoHaceMs < 60 * 1000) {
        await connection.rollback();
        return NextResponse.json(
          {
            ok: false,
            message: "Debes esperar 60 segundos antes de pedir otro código.",
          },
          { status: 429 }
        );
      }
    }

    // -------------------------------------------------------------
    // 3) Crear código de verificación
    // -------------------------------------------------------------
    const codigo = generarCodigo();
    const expiraEn = new Date(Date.now() + 5 * 60 * 1000); // 5 minutos

    const [insertSMS] = await connection.query<ResultSetHeader>(
      `
      INSERT INTO sms_verificacion
      (id_usuario, numero_telefono, codigo_verificacion, expira_en, ip_origen, user_agent)
      VALUES (?, ?, ?, ?, ?, ?)
      `,
      [idUsuario, normalizedPhone, codigo, expiraEn, ip, userAgent]
    );

    const smsId = insertSMS.insertId;

    // -------------------------------------------------------------
    // 4) Enviar SMS (modo local por ahora)
    // -------------------------------------------------------------
    console.log("📲 Modo local - código enviado:", codigo);

    // Registrar auditoría (envío exitoso)
    await connection.query<ResultSetHeader>(
      `
      INSERT INTO auditoria_sms
      (id_sms, id_usuario, tipo_evento, resultado, ip_origen)
      VALUES (?, ?, 'envio', 'exitoso', ?)
      `,
      [smsId, idUsuario, ip]
    );

    await connection.commit();

    return NextResponse.json({
      ok: true,
      message: "Código enviado correctamente",
      modo: "local",
      smsId,
    });
  } catch (err: any) {
    console.error("❌ Error en envío de SMS:", err);

    try {
      await connection.rollback();
    } catch (_) {}

    return NextResponse.json(
      {
        ok: false,
        error: "Error interno al enviar SMS",
        details:
          process.env.NODE_ENV === "development" ? err.message : undefined,
      },
      { status: 500 }
    );
  } finally {
    connection.release();
  }
}
