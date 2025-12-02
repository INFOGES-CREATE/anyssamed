// src/app/api/admin/tecnicos/nuevo/route.ts
// o src/app/api/admin/tecnicos/route.ts si quieres que POST sea directamente /api/admin/tecnicos
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { RowDataPacket, ResultSetHeader } from "mysql2";
import { registrarLog } from "@/lib/logs";

// ============================================================================
// 🔧 Helpers
// ============================================================================

function toInt(value: any): number | null {
  if (value === null || value === undefined || value === "") return null;
  const n = Number(value);
  return Number.isInteger(n) ? n : null;
}

function toTinyIntBool(value: any): 0 | 1 {
  if (
    value === 1 ||
    value === "1" ||
    value === true ||
    value === "true" ||
    value === "on"
  ) {
    return 1;
  }
  return 0;
}

function validarEnum(
  valor: any,
  permitidos: string[],
  nombreCampo: string
): string | null {
  if (valor === null || valor === undefined || valor === "") return null;
  if (!permitidos.includes(valor)) {
    return `Valor inválido para ${nombreCampo}. Debe ser uno de: ${permitidos.join(
      ", "
    )}`;
  }
  return null;
}

// ============================================================================
// POST - CREAR NUEVO TÉCNICO
// ============================================================================

export async function POST(request: NextRequest) {
  let connection;

  try {
    const body = await request.json();

    const {
      // FK principal
      id_usuario,
      id_centro,
      id_sucursal,

      // Datos propios del técnico
      area_tecnica,
      tipo_tecnico,
      turno,
      hora_inicio,
      hora_fin,
      descripcion,
      nivel_acceso,
      extension_telefonica,
      estado,
      disponibilidad,
      prioridad,

      // Datos de ubicación "sueltos" (no FK)
      pais,
      region,
      zona_horaria,

      // Seguridad
      pin_seguridad,
      firma_digital,

      // Métricas (opcionales)
      tickets_resueltos,
      tiempo_promedio_resolucion,
      calificacion_promedio,

      // Supervisor / vigencia
      supervisor_id,
      fecha_inicio,
      fecha_termino,
      especialidad_tecnica,
      certificaciones,

      // Flag global
      es_global,

      // Campos de auditoría opcionales
      comentario,
    } = body;

    // ============================================================================
    // ✅ VALIDACIONES INICIALES (OBLIGATORIOS BÁSICOS)
    // ============================================================================

    const idUsuarioInt = toInt(id_usuario);
    const idCentroInt = toInt(id_centro);
    const idSucursalInt = toInt(id_sucursal);
    const supervisorIdInt = toInt(supervisor_id);
    const esGlobal = toTinyIntBool(es_global);

    const camposObligatorios: Record<string, any> = {
      id_usuario: idUsuarioInt,
      area_tecnica,
      nivel_acceso,
      fecha_inicio,
    };

    const camposFaltantes = Object.entries(camposObligatorios)
      .filter(([_, valor]) => !valor)
      .map(([campo]) => campo);

    if (camposFaltantes.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: `Faltan campos obligatorios: ${camposFaltantes.join(", ")}`,
        },
        { status: 400 }
      );
    }

    // Debe tener centro o ser global
    if (!idCentroInt && esGlobal === 0) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Debe seleccionar un centro médico o marcar al técnico como global (es_global = 1)",
        },
        { status: 400 }
      );
    }

    // ============================================================================
    // ✅ VALIDACIONES ENUMS (según tu tabla `tecnicos`)
    // ============================================================================

    const errorTipo = validarEnum(
      tipo_tecnico,
      [
        "soporte",
        "mantenimiento",
        "redes",
        "infraestructura",
        "biomedico",
        "sistemas",
        "helpdesk",
        "otro",
      ],
      "tipo_tecnico"
    );
    if (errorTipo) {
      return NextResponse.json(
        { success: false, error: errorTipo },
        { status: 400 }
      );
    }

    const errorTurno = validarEnum(
      turno,
      [
        "manana",
        "tarde",
        "noche",
        "completo",
        "fines_de_semana",
        "turno_rotativo",
      ],
      "turno"
    );
    if (errorTurno) {
      return NextResponse.json(
        { success: false, error: errorTurno },
        { status: 400 }
      );
    }

    const errorNivel = validarEnum(
      nivel_acceso,
      ["basico", "intermedio", "avanzado", "administrador"],
      "nivel_acceso"
    );
    if (errorNivel) {
      return NextResponse.json(
        { success: false, error: errorNivel },
        { status: 400 }
      );
    }

    const errorEstado = validarEnum(
      estado,
      ["activo", "inactivo", "suspendido", "vacaciones", "licencia", "en_capacitacion"],
      "estado"
    );
    if (errorEstado) {
      return NextResponse.json(
        { success: false, error: errorEstado },
        { status: 400 }
      );
    }

    const errorDisp = validarEnum(
      disponibilidad,
      ["inmediata", "programada", "no_disponible"],
      "disponibilidad"
    );
    if (errorDisp) {
      return NextResponse.json(
        { success: false, error: errorDisp },
        { status: 400 }
      );
    }

    const errorPrioridad = validarEnum(
      prioridad,
      ["baja", "media", "alta", "critica"],
      "prioridad"
    );
    if (errorPrioridad) {
      return NextResponse.json(
        { success: false, error: errorPrioridad },
        { status: 400 }
      );
    }

    // ============================================================================
    // 🔗 CONEXIÓN A BD
    // ============================================================================

    connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      // ============================================================================
      // ✅ VALIDAR USUARIO EXISTE
      // ============================================================================

      const [usuarioRows] = await connection.query<RowDataPacket[]>(
        "SELECT id_usuario FROM usuarios WHERE id_usuario = ?",
        [idUsuarioInt]
      );

      if (usuarioRows.length === 0) {
        await connection.rollback();
        return NextResponse.json(
          {
            success: false,
            error: "El usuario asociado no existe",
          },
          { status: 400 }
        );
      }

      // ============================================================================
      // ✅ VALIDAR QUE NO TENGA YA UN TÉCNICO ASOCIADO (UNIQUE idx_tecnico_usuario)
      // ============================================================================

      const [tecnicoExistente] = await connection.query<RowDataPacket[]>(
        "SELECT id_tecnico FROM tecnicos WHERE id_usuario = ?",
        [idUsuarioInt]
      );

      if (tecnicoExistente.length > 0) {
        await connection.rollback();
        return NextResponse.json(
          {
            success: false,
            error:
              "Este usuario ya tiene un técnico asociado (constraint idx_tecnico_usuario)",
          },
          { status: 400 }
        );
      }

      // ============================================================================
      // ✅ VALIDAR CENTRO / SUCURSAL (si vienen)
      // ============================================================================

      let centroFinal: number | null = idCentroInt;
      let sucursalFinal: number | null = idSucursalInt;

      if (centroFinal) {
        const [centroRows] = await connection.query<RowDataPacket[]>(
          "SELECT id_centro FROM centros_medicos WHERE id_centro = ?",
          [centroFinal]
        );

        if (centroRows.length === 0) {
          await connection.rollback();
          return NextResponse.json(
            {
              success: false,
              error: "El centro médico seleccionado no existe",
            },
            { status: 400 }
          );
        }
      }

      if (sucursalFinal) {
        const [sucRows] = await connection.query<RowDataPacket[]>(
          "SELECT id_sucursal, id_centro FROM sucursales WHERE id_sucursal = ?",
          [sucursalFinal]
        );

        if (sucRows.length === 0) {
          await connection.rollback();
          return NextResponse.json(
            {
              success: false,
              error: "La sucursal seleccionada no existe",
            },
            { status: 400 }
          );
        }

        const suc = sucRows[0];

        // Si no vino centro pero sí sucursal, usamos el del registro
        if (!centroFinal && suc.id_centro) {
          centroFinal = suc.id_centro;
        }

        // Si vino centro, validamos que la sucursal pertenezca a él
        if (centroFinal && suc.id_centro && suc.id_centro !== centroFinal) {
          await connection.rollback();
          return NextResponse.json(
            {
              success: false,
              error: "La sucursal no pertenece al centro seleccionado",
            },
            { status: 400 }
          );
        }
      }

      // ============================================================================
      // ✅ VALIDAR SUPERVISOR (administrativos) SI VIENE
      // ============================================================================

      if (supervisorIdInt) {
        const [supRows] = await connection.query<RowDataPacket[]>(
          "SELECT id_administrativo FROM administrativos WHERE id_administrativo = ?",
          [supervisorIdInt]
        );

        if (supRows.length === 0) {
          await connection.rollback();
          return NextResponse.json(
            {
              success: false,
              error: "El supervisor seleccionado no existe en administrativos",
            },
            { status: 400 }
          );
        }
      }

      // ============================================================================
      // 🔢 PREPARAR MÉTRICAS (opcionales)
      // ============================================================================

      const ticketsResueltosInt =
        typeof tickets_resueltos === "number"
          ? tickets_resueltos
          : toInt(tickets_resueltos) ?? 0;

      const tiempoPromedioInt =
        typeof tiempo_promedio_resolucion === "number"
          ? tiempo_promedio_resolucion
          : toInt(tiempo_promedio_resolucion);

      const calificacionPromedioNum =
        typeof calificacion_promedio === "number"
          ? calificacion_promedio
          : calificacion_promedio
          ? Number(calificacion_promedio)
          : null;

      // ============================================================================
      // 💾 INSERTAR TÉCNICO
      // ============================================================================

      const [result] = await connection.query<ResultSetHeader>(
        `INSERT INTO tecnicos (
          id_usuario,
          id_centro,
          id_sucursal,
          area_tecnica,
          tipo_tecnico,
          turno,
          hora_inicio,
          hora_fin,
          descripcion,
          nivel_acceso,
          extension_telefonica,
          estado,
          disponibilidad,
          prioridad,
          pais,
          region,
          zona_horaria,
          pin_seguridad,
          firma_digital,
          tickets_resueltos,
          tiempo_promedio_resolucion,
          calificacion_promedio,
          supervisor_id,
          fecha_inicio,
          fecha_termino,
          especialidad_tecnica,
          certificaciones,
          es_global,
          comentario
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          idUsuarioInt,
          centroFinal,
          sucursalFinal,
          area_tecnica,
          tipo_tecnico || "soporte",
          turno || "completo",
          hora_inicio || null,
          hora_fin || null,
          descripcion || null,
          nivel_acceso || "basico",
          extension_telefonica || null,
          estado || "activo",
          disponibilidad || "programada",
          prioridad || "media",
          pais || null,
          region || null,
          zona_horaria || null,
          pin_seguridad || null,
          firma_digital || null,
          ticketsResueltosInt,
          tiempoPromedioInt,
          calificacionPromedioNum,
          supervisorIdInt,
          fecha_inicio || null,
          fecha_termino || null,
          especialidad_tecnica || null,
          certificaciones || null,
          esGlobal,
          comentario || null,
        ]
      );

      const nuevoTecnicoId = result.insertId;

      // ============================================================================
      // 📊 OBTENER TÉCNICO CREADO CON DETALLES
      //   (usando tu tabla usuarios real: nombre_usuario, nombres, apellidos, email, etc.)
// ============================================================================

      const [tecnicoCreado] = await connection.query<RowDataPacket[]>(
        `SELECT 
          t.*,
          u.nombre_usuario,
          u.nombres,
          u.apellidos,
          u.email AS usuario_email,
          c.nombre AS centro_nombre,
          s.nombre AS sucursal_nombre
        FROM tecnicos t
        LEFT JOIN usuarios u ON t.id_usuario = u.id_usuario
        LEFT JOIN centros_medicos c ON t.id_centro = c.id_centro
        LEFT JOIN sucursales s ON t.id_sucursal = s.id_sucursal
        WHERE t.id_tecnico = ?`,
        [nuevoTecnicoId]
      );

      // ============================================================================
      // 📝 REGISTRAR LOG
      // ============================================================================

      await registrarLog({
        id_usuario: 1, // TODO: reemplazar por el usuario autenticado cuando tengas sesión
        tipo: "audit",
        modulo: "tecnicos",
        accion: "crear_tecnico",
        descripcion: `Nuevo técnico creado (id_tecnico=${nuevoTecnicoId}) para usuario id=${idUsuarioInt} en área ${area_tecnica}`,
        objeto_tipo: "tecnico",
        objeto_id: nuevoTecnicoId.toString(),
        datos_nuevos: {
          id_tecnico: nuevoTecnicoId,
          id_usuario: idUsuarioInt,
          id_centro: centroFinal,
          id_sucursal: sucursalFinal,
          area_tecnica,
          tipo_tecnico,
          turno,
          estado: estado || "activo",
          disponibilidad: disponibilidad || "programada",
          prioridad: prioridad || "media",
          es_global: esGlobal,
        },
        ip_origen:
          request.headers.get("x-forwarded-for") ||
          request.headers.get("x-real-ip") ||
          "unknown",
        agente_usuario: request.headers.get("user-agent") || "unknown",
        nivel_severidad: 5,
      });

      // ============================================================================
      // ✅ COMMIT
      // ============================================================================

      await connection.commit();

      return NextResponse.json(
        {
          success: true,
          message: "Técnico creado exitosamente",
          data: tecnicoCreado[0] || null,
        },
        { status: 201 }
      );
    } catch (innerError: any) {
      await connection.rollback();
      throw innerError;
    }
  } catch (error: any) {
    console.error("❌ Error al crear técnico:", error);

    try {
      await registrarLog({
        tipo: "error",
        modulo: "tecnicos",
        accion: "crear_tecnico",
        descripcion: "Error al crear nuevo técnico",
        mensaje_error: error.message,
        exitoso: false,
        nivel_severidad: 8,
      });
    } catch (logError) {
      console.error("Error al registrar log de error:", logError);
    }

    let mensajeError = "Error al crear técnico";
    let statusCode = 500;

    if (error?.message?.includes("Duplicate entry")) {
      mensajeError =
        "Ya existe un registro que viola una restricción única (probablemente idx_tecnico_usuario)";
      statusCode = 400;
    } else if (error?.message?.includes("foreign key")) {
      mensajeError = "Referencia inválida a usuario, centro, sucursal o supervisor";
      statusCode = 400;
    }

    return NextResponse.json(
      {
        success: false,
        error: mensajeError,
        detalles:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: statusCode }
    );
  } finally {
    if (connection) {
      connection.release();
    }
  }
}
