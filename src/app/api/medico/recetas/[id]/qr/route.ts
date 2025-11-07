// app/api/medico/recetas/[id]/qr/route.ts
import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { RowDataPacket } from "mysql2";
import QRCode from "qrcode";
import crypto from "crypto";

// ========================================
// CONSTANTES
// ========================================

const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL ||
  process.env.APP_URL ||
  "http://localhost:3000";

// ========================================
// TIPOS
// ========================================

interface MedicoData {
  id_medico: number;
  id_usuario: number;
  numero_registro_medico: string;
  nombre_completo: string;
}

interface DatosQR {
  numero_receta: string;
  codigo_verificacion: string;
  fecha_emision: string;
  id_paciente: number;
  id_medico: number;
  hash_seguridad: string;
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
        CONCAT(u.nombre, ' ', u.apellido_paterno, ' ', COALESCE(u.apellido_materno, '')) as nombre_completo
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
 * Obtiene los datos de la receta para el QR
 */
async function obtenerDatosRecetaQR(
  idReceta: number,
  idMedico: number
): Promise<DatosQR | null> {
  try {
    const [rows] = await pool.query<RowDataPacket[]>(
      `
      SELECT 
        r.numero_receta,
        r.codigo_verificacion,
        r.fecha_emision,
        r.id_paciente,
        r.id_medico,
        r.estado
      FROM recetas r
      WHERE r.id_receta = ? AND r.id_medico = ?
      LIMIT 1
      `,
      [idReceta, idMedico]
    );

    if (rows.length === 0) {
      return null;
    }

    const receta = rows[0];

    // Generar hash de seguridad
    const hashData = `${receta.numero_receta}:${receta.codigo_verificacion}:${receta.fecha_emision}`;
    const hash = crypto
      .createHash("sha256")
      .update(hashData)
      .digest("hex")
      .substring(0, 16);

    return {
      numero_receta: receta.numero_receta,
      codigo_verificacion: receta.codigo_verificacion,
      fecha_emision: receta.fecha_emision,
      id_paciente: receta.id_paciente,
      id_medico: receta.id_medico,
      hash_seguridad: hash,
    };
  } catch (error) {
    console.error("Error al obtener datos de receta para QR:", error);
    throw error;
  }
}

/**
 * Genera el código QR en diferentes formatos
 */
async function generarCodigoQR(
  datos: DatosQR,
  formato: "png" | "svg" | "dataurl" | "json" = "dataurl",
  opciones: any = {}
): Promise<string | Buffer> {
  try {
    // URL de verificación pública
    const urlVerificacion = `${APP_URL}/verificar-receta?numero=${encodeURIComponent(
      datos.numero_receta
    )}&codigo=${encodeURIComponent(
      datos.codigo_verificacion
    )}&hash=${encodeURIComponent(datos.hash_seguridad)}`;

    // Datos completos en formato JSON (para QR avanzado)
    const datosCompletos = {
      version: "1.0",
      tipo: "receta_medica",
      numero_receta: datos.numero_receta,
      codigo_verificacion: datos.codigo_verificacion,
      fecha_emision: datos.fecha_emision,
      hash: datos.hash_seguridad,
      url_verificacion: urlVerificacion,
      timestamp: new Date().toISOString(),
    };

    // Configuración por defecto del QR
    const opcionesQR = {
      errorCorrectionLevel: opciones.errorCorrection || "H",
      type: "image/png",
      quality: opciones.quality || 1,
      margin: opciones.margin || 2,
      width: opciones.width || 300,
      color: {
        dark: opciones.darkColor || "#000000",
        light: opciones.lightColor || "#FFFFFF",
      },
    };

    switch (formato) {
      case "png":
        return await QRCode.toBuffer(urlVerificacion, {
          ...opcionesQR,
          type: "png",
        });

      case "svg":
        return await QRCode.toString(urlVerificacion, {
          ...opcionesQR,
          type: "svg",
        });

      case "dataurl":
        return await QRCode.toDataURL(urlVerificacion, opcionesQR);

      case "json": {
        const qrDataURL = await QRCode.toDataURL(urlVerificacion, opcionesQR);
        return JSON.stringify({
          ...datosCompletos,
          qr_code: qrDataURL,
        });
      }

      default:
        return await QRCode.toDataURL(urlVerificacion, opcionesQR);
    }
  } catch (error) {
    console.error("Error al generar código QR:", error);
    throw error;
  }
}

/**
 * Genera múltiples versiones del QR (diferentes tamaños)
 */
async function generarQRMultiplesTamaños(
  datos: DatosQR
): Promise<{
  small: string;
  medium: string;
  large: string;
  xlarge: string;
}> {
  try {
    const [small, medium, large, xlarge] = await Promise.all([
      generarCodigoQR(datos, "dataurl", { width: 150 }),
      generarCodigoQR(datos, "dataurl", { width: 300 }),
      generarCodigoQR(datos, "dataurl", { width: 500 }),
      generarCodigoQR(datos, "dataurl", { width: 800 }),
    ]);

    return {
      small: small as string,
      medium: medium as string,
      large: large as string,
      xlarge: xlarge as string,
    };
  } catch (error) {
    console.error("Error al generar QR múltiples tamaños:", error);
    throw error;
  }
}

/**
 * Genera QR con logo personalizado (placeholder)
 */
async function generarQRConLogo(
  datos: DatosQR,
  _logoUrl?: string
): Promise<string> {
  // Aquí iría la superposición real con sharp/canvas
  const qrBase = await generarCodigoQR(datos, "dataurl", {
    width: 400,
    errorCorrection: "H",
  });
  return qrBase as string;
}

/**
 * Genera QR personalizado con colores del centro médico
 */
async function generarQRPersonalizado(
  datos: DatosQR,
  colorPrimario: string = "#1E40AF",
  colorSecundario: string = "#FFFFFF"
): Promise<string> {
  const qr = await generarCodigoQR(datos, "dataurl", {
    width: 400,
    darkColor: colorPrimario,
    lightColor: colorSecundario,
    errorCorrection: "H",
    margin: 3,
  });
  return qr as string;
}

/**
 * Registra la generación del QR en auditoría
 */
async function registrarGeneracionQR(
  idReceta: number,
  idUsuario: number,
  formato: string,
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
      ) VALUES (?, 'GENERACION_QR', ?, ?, NOW(), ?)
      `,
      [idReceta, idUsuario, `QR generado en formato: ${formato}`, ipAddress]
    );
  } catch (error) {
    console.error("Error al registrar generación de QR:", error);
  }
}

/**
 * Incrementa contador de generaciones de QR
 */
async function incrementarContadorQR(idReceta: number): Promise<void> {
  try {
    await pool.query(
      `
      INSERT INTO estadisticas_recetas (id_receta, qr_generados, ultima_generacion_qr)
      VALUES (?, 1, NOW())
      ON DUPLICATE KEY UPDATE 
        qr_generados = qr_generados + 1,
        ultima_generacion_qr = NOW()
      `,
      [idReceta]
    );
  } catch (error) {
    // Si la tabla no existe o no hay PK, no rompemos el flujo
    console.error("Error al incrementar contador de QR:", error);
  }
}

// ========================================
// HANDLER GET - Generar código QR
// ========================================

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const idReceta = Number(params.id);

    if (Number.isNaN(idReceta)) {
      return NextResponse.json(
        {
          success: false,
          error: "ID de receta inválido",
        },
        { status: 400 }
      );
    }

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

    const searchParams = request.nextUrl.searchParams;
    const formato = (searchParams.get("formato") || "dataurl") as
      | "png"
      | "svg"
      | "dataurl"
      | "json";
    const tamaño = searchParams.get("tamaño") || "medium";
    const multiple = searchParams.get("multiple") === "true";
    const personalizado = searchParams.get("personalizado") === "true";
    const colorPrimario = searchParams.get("color_primario") || "#1E40AF";
    const colorSecundario = searchParams.get("color_secundario") || "#FFFFFF";
    const conLogo = searchParams.get("con_logo") === "true";
    const download = searchParams.get("download") === "true";

    const datosReceta = await obtenerDatosRecetaQR(
      idReceta,
      medico.id_medico
    );

    if (!datosReceta) {
      return NextResponse.json(
        {
          success: false,
          error: "Receta no encontrada o no tienes permisos para verla",
        },
        { status: 404 }
      );
    }

    let resultado: string | Buffer;

    if (multiple) {
      const resultadoMultiple = await generarQRMultiplesTamaños(datosReceta);

      await registrarGeneracionQR(
        idReceta,
        idUsuario,
        "multiple",
        request.headers.get("x-forwarded-for") || "0.0.0.0"
      );
      await incrementarContadorQR(idReceta);

      return NextResponse.json(
        {
          success: true,
          formato: "multiple",
          qr_codes: resultadoMultiple,
          datos_receta: {
            numero_receta: datosReceta.numero_receta,
            codigo_verificacion: datosReceta.codigo_verificacion,
            fecha_emision: datosReceta.fecha_emision,
            hash_seguridad: datosReceta.hash_seguridad,
          },
          url_verificacion: `${APP_URL}/verificar-receta?numero=${datosReceta.numero_receta}&codigo=${datosReceta.codigo_verificacion}&hash=${datosReceta.hash_seguridad}`,
          timestamp: new Date().toISOString(),
        },
        { status: 200 }
      );
    } else if (personalizado) {
      resultado = await generarQRPersonalizado(
        datosReceta,
        colorPrimario,
        colorSecundario
      );
    } else if (conLogo) {
      resultado = await generarQRConLogo(datosReceta);
    } else {
      const tamañosMap: Record<string, number> = {
        small: 150,
        medium: 300,
        large: 500,
        xlarge: 800,
      };

      resultado = await generarCodigoQR(datosReceta, formato, {
        width: tamañosMap[tamaño] || 300,
      });
    }

    await registrarGeneracionQR(
      idReceta,
      idUsuario,
      formato,
      request.headers.get("x-forwarded-for") || "0.0.0.0"
    );
    await incrementarContadorQR(idReceta);

    // Descarga de binarios
    if (formato === "png" && download) {
      return new Response(resultado as Buffer, {
        status: 200,
        headers: {
          "Content-Type": "image/png",
          "Content-Disposition": `attachment; filename="QR_Receta_${datosReceta.numero_receta.replace(
            /[^a-zA-Z0-9]/g,
            "_"
          )}.png"`,
          "Cache-Control": "no-cache, no-store, must-revalidate",
        },
      });
    }

    if (formato === "svg" && download) {
      return new Response(resultado as string, {
        status: 200,
        headers: {
          "Content-Type": "image/svg+xml",
          "Content-Disposition": `attachment; filename="QR_Receta_${datosReceta.numero_receta.replace(
            /[^a-zA-Z0-9]/g,
            "_"
          )}.svg"`,
          "Cache-Control": "no-cache, no-store, must-revalidate",
        },
      });
    }

    if (formato === "json") {
      return NextResponse.json(JSON.parse(resultado as string), {
        status: 200,
      });
    }

    // Respuesta por defecto (dataurl / info)
    return NextResponse.json(
      {
        success: true,
        formato,
        tamaño,
        qr_code: resultado,
        datos_receta: {
          numero_receta: datosReceta.numero_receta,
          codigo_verificacion: datosReceta.codigo_verificacion,
          fecha_emision: datosReceta.fecha_emision,
          hash_seguridad: datosReceta.hash_seguridad,
        },
        url_verificacion: `${APP_URL}/verificar-receta?numero=${datosReceta.numero_receta}&codigo=${datosReceta.codigo_verificacion}&hash=${datosReceta.hash_seguridad}`,
        opciones: {
          personalizado,
          con_logo: conLogo,
          color_primario: colorPrimario,
          color_secundario: colorSecundario,
        },
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("❌ Error en GET /api/medico/recetas/[id]/qr:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Error al generar el código QR",
        details:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}

// ========================================
// HANDLER POST - Generar QR personalizado avanzado
// ========================================

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const idReceta = Number(params.id);

    if (Number.isNaN(idReceta)) {
      return NextResponse.json(
        {
          success: false,
          error: "ID de receta inválido",
        },
        { status: 400 }
      );
    }

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

    const body = await request.json();

    const {
      formato = "dataurl",
      width = 300,
      errorCorrection = "H",
      margin = 2,
      darkColor = "#000000",
      lightColor = "#FFFFFF",
      incluir_logo = false,
      logo_url,
      incluir_marca_agua = false,
      texto_marca_agua = "",
    } = body;

    const datosReceta = await obtenerDatosRecetaQR(idReceta, medico.id_medico);
    if (!datosReceta) {
      return NextResponse.json(
        {
          success: false,
          error: "Receta no encontrada o no tienes permisos para verla",
        },
        { status: 404 }
      );
    }

    const qrCode = await generarCodigoQR(datosReceta, formato, {
      width,
      errorCorrection,
      margin,
      darkColor,
      lightColor,
    });

    await registrarGeneracionQR(
      idReceta,
      idUsuario,
      `${formato}_personalizado`,
      request.headers.get("x-forwarded-for") || "0.0.0.0"
    );
    await incrementarContadorQR(idReceta);

    return NextResponse.json(
      {
        success: true,
        qr_code: qrCode,
        configuracion: {
          formato,
          width,
          errorCorrection,
          margin,
          darkColor,
          lightColor,
          incluir_logo,
          logo_url: incluir_logo ? logo_url || null : null,
          incluir_marca_agua,
          texto_marca_agua: incluir_marca_agua ? texto_marca_agua : null,
        },
        datos_receta: {
          numero_receta: datosReceta.numero_receta,
          codigo_verificacion: datosReceta.codigo_verificacion,
          hash_seguridad: datosReceta.hash_seguridad,
        },
        url_verificacion: `${APP_URL}/verificar-receta?numero=${datosReceta.numero_receta}&codigo=${datosReceta.codigo_verificacion}&hash=${datosReceta.hash_seguridad}`,
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("❌ Error en POST /api/medico/recetas/[id]/qr:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Error al generar el código QR personalizado",
        details:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}
