// frontend/src/app/api/admin/usuarios/[id]/password/route.ts
import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { RowDataPacket, ResultSetHeader } from "mysql2";
import { registrarLog } from "@/lib/logs";
import bcrypt from "bcryptjs";
import crypto from "crypto";

interface CambiarPasswordBody {
  nueva_password?: string;
  generar_temporal?: boolean;
  enviar_email?: boolean;
  requiere_cambio?: boolean;
}

function obtenerIP(request: NextRequest): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0] ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}

function obtenerUserAgent(request: NextRequest): string {
  return request.headers.get("user-agent") || "unknown";
}

function generarPasswordTemporal(): string {
  const caracteres =
    "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%&*";
  let password = "";
  for (let i = 0; i < 12; i++) {
    password += caracteres.charAt(Math.floor(Math.random() * caracteres.length));
  }
  return password;
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  let connection;

  try {
    const idUsuario = parseInt(params.id);

    if (isNaN(idUsuario)) {
      return NextResponse.json(
        { success: false, error: "ID de usuario inválido" },
        { status: 400 }
      );
    }

    const body: CambiarPasswordBody = await request.json();
    const {
      nueva_password,
      generar_temporal = false,
      enviar_email = true,
      requiere_cambio = true,
    } = body;

    connection = await pool.getConnection();
    await connection.beginTransaction();

    // Obtener usuario
    const [usuarios] = await connection.query<RowDataPacket[]>(
      "SELECT id_usuario, username, nombre, apellido_paterno, email FROM usuarios WHERE id_usuario = ?",
      [idUsuario]
    );

    if (usuarios.length === 0) {
      await connection.rollback();
      connection.release();
      return NextResponse.json(
        { success: false, error: "Usuario no encontrado" },
        { status: 404 }
      );
    }

    const usuario = usuarios[0];

    // Determinar la contraseña a usar
    let passwordFinal: string;
    let passwordTemporal: string | null = null;

    if (generar_temporal) {
      passwordFinal = generarPasswordTemporal();
      passwordTemporal = passwordFinal;
    } else if (nueva_password) {
      // Validar contraseña
      if (nueva_password.length < 8) {
        await connection.rollback();
        connection.release();
        return NextResponse.json(
          { success: false, error: "La contraseña debe tener al menos 8 caracteres" },
          { status: 400 }
        );
      }
      passwordFinal = nueva_password;
    } else {
      await connection.rollback();
      connection.release();
      return NextResponse.json(
        {
          success: false,
          error: "Debe proporcionar una contraseña o solicitar una temporal",
        },
        { status: 400 }
      );
    }

    // Hashear contraseña
    const passwordHash = await bcrypt.hash(passwordFinal, 10);

    // Actualizar contraseña
    await connection.query<ResultSetHeader>(
      `UPDATE usuarios SET 
        password_hash = ?,
        requiere_cambio_password = ?,
        intentos_fallidos = 0,
        fecha_modificacion = NOW()
      WHERE id_usuario = ?`,
      [passwordHash, requiere_cambio ? 1 : 0, idUsuario]
    );

    // Registrar log de seguridad
    await registrarLog({
      id_usuario: 1, // TODO: Obtener de sesión
      tipo: "security",
      modulo: "usuarios",
      accion: "cambiar_password",
      descripcion: `Contraseña ${
        generar_temporal ? "temporal generada" : "cambiada"
      } para usuario: ${usuario.nombre} ${usuario.apellido_paterno} (${usuario.username})`,
      objeto_tipo: "usuario",
      objeto_id: idUsuario.toString(),
      datos_nuevos: {
        requiere_cambio,
        password_temporal: generar_temporal,
      },
      ip_origen: obtenerIP(request),
      agente_usuario: obtenerUserAgent(request),
      nivel_severidad: 7,
    });

    await connection.commit();
    connection.release();

    // TODO: Enviar email con la contraseña temporal si se solicita
    if (enviar_email && passwordTemporal) {
      // Implementar envío de email
      console.log(`📧 Enviar email a ${usuario.email} con password: ${passwordTemporal}`);
    }

    return NextResponse.json({
      success: true,
      message: generar_temporal
        ? "Contraseña temporal generada exitosamente"
        : "Contraseña cambiada exitosamente",
      data: {
        id_usuario: idUsuario,
        requiere_cambio,
        password_temporal: passwordTemporal, // Solo en desarrollo, remover en producción
        email_enviado: enviar_email && passwordTemporal,
      },
    });
  } catch (error: any) {
    if (connection) {
      await connection.rollback();
      connection.release();
    }
    console.error("❌ Error al cambiar contraseña:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Error al cambiar contraseña",
        detalles: error.message,
      },
      { status: 500 }
    );
  }
}
