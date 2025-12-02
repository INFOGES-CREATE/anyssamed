// app/api/mensajes/escribiendo/route.ts
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { RowDataPacket, ResultSetHeader } from "mysql2";

// ========================================
// TIPOS
// ========================================

interface EscribiendoBody {
  id_usuario_receptor: number;
  escribiendo: boolean;
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

async function obtenerUsuarioAutenticado(token: string): Promise<number | null> {
  try {
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
      [token]
    );

    if (sesiones.length === 0) {
      return null;
    }

    return sesiones[0].id_usuario;
  } catch (error) {
    console.error("Error al obtener usuario:", error);
    throw error;
  }
}

function generarIdConversacion(idUsuario1: number, idUsuario2: number): string {
  const ids = [idUsuario1, idUsuario2].sort((a, b) => a - b);
  return `conv_${ids[0]}_${ids[1]}`;
}

/**
 * Registra el estado de "escribiendo" del usuario
 * En producción, esto debería usar WebSockets o Server-Sent Events
 * Para simplificar, guardamos en una tabla temporal o caché (Redis)
 */
async function registrarEstadoEscribiendo(
  idUsuarioEmisor: number,
  idUsuarioReceptor: number,
  escribiendo: boolean
): Promise<void> {
  try {
    const idConversacion = generarIdConversacion(idUsuarioEmisor, idUsuarioReceptor);

    // En producción, esto iría a Redis con TTL de 3 segundos:
    // redis.setex(`escribiendo:${idConversacion}:${idUsuarioEmisor}`, 3, escribiendo ? '1' : '0')

    // O en una tabla temporal:
    // CREATE TABLE estados_escribiendo (
    //   id_conversacion VARCHAR(100),
    //   id_usuario INT UNSIGNED,
    //   escribiendo TINYINT(1),
    //   timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    //   PRIMARY KEY (id_conversacion, id_usuario),
    //   INDEX idx_timestamp (timestamp)
    // )

    console.log(
      `Usuario ${idUsuarioEmisor} ${escribiendo ? 'está escribiendo' : 'dejó de escribir'} a ${idUsuarioReceptor}`
    );

    // Simulación: guardar en tabla temporal
    if (escribiendo) {
      await pool.query(
        `
        INSERT INTO estados_escribiendo (id_conversacion, id_usuario, escribiendo, timestamp)
        VALUES (?, ?, 1, NOW())
        ON DUPLICATE KEY UPDATE escribiendo = 1, timestamp = NOW()
        `,
        [idConversacion, idUsuarioEmisor]
      );
    } else {
      await pool.query(
        `
        UPDATE estados_escribiendo 
        SET escribiendo = 0, timestamp = NOW()
        WHERE id_conversacion = ? AND id_usuario = ?
        `,
        [idConversacion, idUsuarioEmisor]
      );
    }

    // Limpiar estados antiguos (más de 5 segundos)
    await pool.query(
      `
      DELETE FROM estados_escribiendo
      WHERE timestamp < DATE_SUB(NOW(), INTERVAL 5 SECOND)
      `
    );
  } catch (error: any) {
    // Si la tabla no existe, solo logear (no es crítico)
    if (error.code === 'ER_NO_SUCH_TABLE') {
      console.log('Tabla estados_escribiendo no existe (funcionalidad opcional)');
    } else {
      console.error("Error al registrar estado escribiendo:", error);
    }
  }
}

// ========================================
// HANDLER POST - Indicador de escribiendo
// ========================================

export async function POST(request: NextRequest) {
  try {
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
    const idUsuario = await obtenerUsuarioAutenticado(sessionToken);

    if (!idUsuario) {
      return NextResponse.json(
        {
          success: false,
          error: "Sesión inválida o expirada",
        },
        { status: 401 }
      );
    }

    // 3. Obtener body
    const body: EscribiendoBody = await request.json();

    if (!body.id_usuario_receptor || typeof body.escribiendo !== "boolean") {
      return NextResponse.json(
        {
          success: false,
          error: "Faltan datos requeridos: id_usuario_receptor y escribiendo",
        },
        { status: 400 }
      );
    }

    // 4. Validar que el receptor existe
    const [receptor] = await pool.query<RowDataPacket[]>(
      `SELECT id_usuario FROM usuarios WHERE id_usuario = ? AND estado = 'activo' LIMIT 1`,
      [body.id_usuario_receptor]
    );

    if (receptor.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Usuario receptor no válido",
        },
        { status: 400 }
      );
    }

    // 5. Registrar estado
    await registrarEstadoEscribiendo(
      idUsuario,
      body.id_usuario_receptor,
      body.escribiendo
    );

    // 6. En una implementación real con WebSocket, aquí se emitiría un evento
    // socketIO.to(`user_${body.id_usuario_receptor}`).emit('usuario_escribiendo', {
    //   id_usuario: idUsuario,
    //   escribiendo: body.escribiendo
    // })

    // 7. Respuesta exitosa
    return NextResponse.json(
      {
        success: true,
        message: `Estado de escritura ${body.escribiendo ? 'activado' : 'desactivado'}`,
        escribiendo: body.escribiendo,
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("❌ Error en POST /api/mensajes/escribiendo:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Error interno del servidor",
        details: process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}

// ========================================
// HANDLER GET - Obtener estados de escribiendo
// ========================================

export async function GET(request: NextRequest) {
  try {
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
    const idUsuario = await obtenerUsuarioAutenticado(sessionToken);

    if (!idUsuario) {
      return NextResponse.json(
        {
          success: false,
          error: "Sesión inválida o expirada",
        },
        { status: 401 }
      );
    }

    // 3. Obtener estados de escribiendo activos
    try {
      const [estados] = await pool.query<RowDataPacket[]>(
        `
        SELECT 
          id_conversacion,
          id_usuario,
          escribiendo,
          timestamp
        FROM estados_escribiendo
        WHERE escribiendo = 1
          AND timestamp >= DATE_SUB(NOW(), INTERVAL 5 SECOND)
          AND id_conversacion LIKE CONCAT('%_', ?, '_%')
        `,
        [idUsuario]
      );

      return NextResponse.json(
        {
          success: true,
          data: estados,
          timestamp: new Date().toISOString(),
        },
        { status: 200 }
      );
    } catch (error: any) {
      // Si la tabla no existe, retornar array vacío
      if (error.code === 'ER_NO_SUCH_TABLE') {
        return NextResponse.json(
          {
            success: true,
            data: [],
            timestamp: new Date().toISOString(),
          },
          { status: 200 }
        );
      }
      throw error;
    }
  } catch (error: any) {
    console.error("❌ Error en GET /api/mensajes/escribiendo:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Error interno del servidor",
        details: process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}

// ========================================
// MÉTODOS NO PERMITIDOS
// ========================================

export async function PUT() {
  return NextResponse.json(
    { success: false, error: "Método no permitido" },
    { status: 405 }
  );
}

export async function DELETE() {
  return NextResponse.json(
    { success: false, error: "Método no permitido" },
    { status: 405 }
  );
}