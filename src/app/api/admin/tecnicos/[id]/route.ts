// frontend/src/app/api/admin/tecnicos/[id]/route.ts
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { RowDataPacket, ResultSetHeader } from "mysql2";
import { registrarLog } from "@/lib/logs";

// ============================================================================
// ⚙️ CONFIG / CONSTANTES
// ============================================================================

// TODO: reemplazar esto con el ID real del usuario autenticado (session / JWT)
const ADMIN_USER_ID_FALLBACK = 1;

// ============================================================================
// 📚 INTERFACES
// ============================================================================

interface Tecnico extends RowDataPacket {
  id_tecnico: number;
  id_usuario: number;
  id_centro: number | null;
  id_sucursal: number | null;
  id_departamento: number | null;
  area_tecnica: string;
  tipo_tecnico:
    | "soporte"
    | "mantenimiento"
    | "ingenieria"
    | "biomedico"
    | "sistemas"
    | "infraestructura";
  turno: "manana" | "tarde" | "noche" | "completo";
  hora_inicio: string | null;
  hora_fin: string | null;
  descripcion: string | null;
  nivel_acceso: "basico" | "intermedio" | "avanzado" | "administrador";
  extension_telefonica: string | null;
  estado: "activo" | "inactivo" | "suspendido";
  disponibilidad: "disponible" | "ocupado" | "fuera_servicio";
  prioridad: "baja" | "media" | "alta" | "critica";
  pais: string | null;
  region: string | null;
  zona_horaria: string | null;
  pin_seguridad: string | null;
  firma_digital: string | null;
  tickets_resueltos: number;
  tiempo_promedio_resolucion: number;
  calificacion_promedio: number;
  supervisor_id: number | null;
  fecha_inicio: string;
  fecha_termino: string | null;
  especialidad_tecnica: string | null;
  certificaciones: string | null;
  fecha_creacion: string;
  fecha_modificacion: string;
  es_global: 0 | 1;
  creado_por: number | null;
  modificado_por: number | null;
}

interface TecnicoDetalle extends Tecnico {
  username: string;
  usuario_nombre: string;
  usuario_apellido_paterno: string;
  usuario_apellido_materno: string | null;
  usuario_email: string;
  usuario_rut: string;
  usuario_telefono: string | null;
  usuario_celular: string | null;
  usuario_foto_perfil_url: string | null;
  centro_nombre: string | null;
  centro_ciudad: string | null;
  centro_region: string | null;
  centro_estado: string | null;
  sucursal_nombre: string | null;
  sucursal_direccion: string | null;
  sucursal_estado: string | null;
  nombre_completo: string | null;
  edad_usuario: number | null;
}

interface EstadisticasTecnico extends RowDataPacket {
  tickets_resueltos: number;
  tiempo_promedio_resolucion: number;
  calificacion_promedio: number;
  total_logs: number;
  logs_error: number;
  ultima_actividad: string | null;
}

interface Actividad extends RowDataPacket {
  fecha_hora: string;
  tipo: string;
  modulo: string;
  accion: string;
  descripcion: string;
  ip_origen: string;
  nivel_severidad?: number;
}

interface UpdateTecnicoBody {
  id_usuario?: number;
  id_centro?: number | null;
  id_sucursal?: number | null;
  id_departamento?: number | null;
  area_tecnica?: string;
  tipo_tecnico?:
    | "soporte"
    | "mantenimiento"
    | "ingenieria"
    | "biomedico"
    | "sistemas"
    | "infraestructura";
  turno?: "manana" | "tarde" | "noche" | "completo";
  hora_inicio?: string | null;
  hora_fin?: string | null;
  descripcion?: string | null;
  nivel_acceso?: "basico" | "intermedio" | "avanzado" | "administrador";
  extension_telefonica?: string | null;
  estado?: "activo" | "inactivo" | "suspendido";
  disponibilidad?: "disponible" | "ocupado" | "fuera_servicio";
  prioridad?: "baja" | "media" | "alta" | "critica";
  pais?: string | null;
  region?: string | null;
  zona_horaria?: string | null;
  pin_seguridad?: string | null;
  firma_digital?: string | null;
  supervisor_id?: number | null;
  fecha_inicio?: string;
  fecha_termino?: string | null;
  especialidad_tecnica?: string | null;
  certificaciones?: string | null;
  es_global?: boolean;
  // Métricas (normalmente se actualizan desde otros módulos, pero dejamos soporte)
  tickets_resueltos?: number;
  tiempo_promedio_resolucion?: number;
  calificacion_promedio?: number;
}

// ============================================================================
// 🔐 INTERFACES ACCIONES TÉCNICOS (POST)
// ============================================================================

interface AccionTecnicoBody {
  action:
    | "cambiar_estado"
    | "actualizar_disponibilidad"
    | "actualizar_prioridad"
    | "marcar_global"
    | "asignar_supervisor"
    | "reset_metricas";
  // cambiar_estado
  nuevo_estado?: "activo" | "inactivo" | "suspendido";
  // actualizar_disponibilidad
  nueva_disponibilidad?: "disponible" | "ocupado" | "fuera_servicio";
  // actualizar_prioridad
  nueva_prioridad?: "baja" | "media" | "alta" | "critica";
  // marcar_global
  es_global?: boolean;
  // asignar_supervisor
  supervisor_id?: number | null;
  motivo?: string;
  detalles?: string;
}

// ============================================================================
// 🛠 FUNCIONES AUXILIARES
// ============================================================================

function obtenerIP(request: NextRequest): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}

function obtenerUserAgent(request: NextRequest): string {
  return request.headers.get("user-agent") || "unknown";
}

function isInArray<T extends string>(value: any, array: readonly T[]): value is T {
  return typeof value === "string" && array.includes(value as T);
}

// Enums válidos según la tabla `tecnicos`
const TIPOS_TECNICO = [
  "soporte",
  "mantenimiento",
  "ingenieria",
  "biomedico",
  "sistemas",
  "infraestructura",
] as const;

const TURNOS = ["manana", "tarde", "noche", "completo"] as const;

const NIVELES_ACCESO = ["basico", "intermedio", "avanzado", "administrador"] as const;

const ESTADOS_TECNICO = ["activo", "inactivo", "suspendido"] as const;

const DISPONIBILIDADES = ["disponible", "ocupado", "fuera_servicio"] as const;

const PRIORIDADES = ["baja", "media", "alta", "critica"] as const;

// Limpia campos que podrían contener información sensible si en el futuro se agregan
function limpiarTecnico<T extends Record<string, any>>(tecnico: T): T {
  const copia = { ...tecnico };
  // Aquí podrías remover futuros campos sensibles, por ahora no hay.
  return copia;
}

// ============================================================================
// GET - OBTENER DETALLE COMPLETO DEL TÉCNICO
// ============================================================================

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  let connection;

  try {
    const idTecnico = parseInt(params.id, 10);

    if (isNaN(idTecnico)) {
      return NextResponse.json(
        { success: false, error: "ID de técnico inválido" },
        { status: 400 }
      );
    }

    connection = await pool.getConnection();

    // ========== 1. DATOS PRINCIPALES DEL TÉCNICO + USUARIO + CENTRO/SUCURSAL ==========
    const [rowsTecnico] = await connection.query<
      (TecnicoDetalle & RowDataPacket)[]
    >(
      `
      SELECT
        t.*,
        u.username,
        u.nombre           AS usuario_nombre,
        u.apellido_paterno AS usuario_apellido_paterno,
        u.apellido_materno AS usuario_apellido_materno,
        u.email            AS usuario_email,
        u.rut              AS usuario_rut,
        u.telefono         AS usuario_telefono,
        u.celular          AS usuario_celular,
        u.foto_perfil_url  AS usuario_foto_perfil_url,
        c.nombre           AS centro_nombre,
        c.ciudad           AS centro_ciudad,
        c.region           AS centro_region,
        c.estado           AS centro_estado,
        s.nombre           AS sucursal_nombre,
        s.direccion        AS sucursal_direccion,
        s.estado           AS sucursal_estado,
        CONCAT(u.nombre, ' ', u.apellido_paterno, ' ', COALESCE(u.apellido_materno, '')) AS nombre_completo,
        CASE
          WHEN u.fecha_nacimiento IS NULL THEN NULL
          ELSE TIMESTAMPDIFF(YEAR, u.fecha_nacimiento, CURDATE())
        END AS edad_usuario
      FROM tecnicos t
      INNER JOIN usuarios u ON t.id_usuario = u.id_usuario
      LEFT JOIN centros_medicos c ON t.id_centro = c.id_centro
      LEFT JOIN sucursales s ON t.id_sucursal = s.id_sucursal
      WHERE t.id_tecnico = ?
      LIMIT 1
      `,
      [idTecnico]
    );

    if (rowsTecnico.length === 0) {
      connection.release();
      return NextResponse.json(
        { success: false, error: "Técnico no encontrado" },
        { status: 404 }
      );
    }

    const tecnico = rowsTecnico[0];

    // ========== 2. ESTADÍSTICAS DEL TÉCNICO ==========
    const [estadisticasRows] = await connection.query<EstadisticasTecnico[]>(
      `
      SELECT
        t.tickets_resueltos,
        t.tiempo_promedio_resolucion,
        t.calificacion_promedio,
        (
          SELECT COUNT(*) 
          FROM logs_sistema 
          WHERE id_usuario = t.id_usuario 
            AND modulo = 'tecnicos'
        ) AS total_logs,
        (
          SELECT COUNT(*) 
          FROM logs_sistema 
          WHERE id_usuario = t.id_usuario 
            AND modulo = 'tecnicos'
            AND tipo = 'error'
        ) AS logs_error,
        (
          SELECT fecha_hora 
          FROM logs_sistema 
          WHERE id_usuario = t.id_usuario 
            AND modulo = 'tecnicos'
          ORDER BY fecha_hora DESC 
          LIMIT 1
        ) AS ultima_actividad
      FROM tecnicos t
      WHERE t.id_tecnico = ?
      LIMIT 1
      `,
      [idTecnico]
    );

    const estadisticas =
      estadisticasRows[0] || {
        tickets_resueltos: tecnico.tickets_resueltos,
        tiempo_promedio_resolucion: tecnico.tiempo_promedio_resolucion,
        calificacion_promedio: tecnico.calificacion_promedio,
        total_logs: 0,
        logs_error: 0,
        ultima_actividad: null,
      };

    // ========== 3. ÚLTIMAS ACTIVIDADES (LOGS) ==========
    const [ultimasActividades] = await connection.query<Actividad[]>(
      `
      SELECT 
        fecha_hora,
        tipo,
        modulo,
        accion,
        descripcion,
        ip_origen,
        nivel_severidad
      FROM logs_sistema
      WHERE objeto_tipo = 'tecnico'
        AND objeto_id = ?
      ORDER BY fecha_hora DESC
      LIMIT 20
      `,
      [idTecnico]
    );

    // ========== 4. HISTORIAL DE CAMBIOS IMPORTANTES ==========
    const [historialEstados] = await connection.query<RowDataPacket[]>(
      `
      SELECT 
        fecha_hora,
        descripcion,
        datos_antiguos,
        datos_nuevos,
        ip_origen
      FROM logs_sistema
      WHERE objeto_tipo = 'tecnico'
        AND objeto_id = ?
        AND modulo = 'tecnicos'
        AND accion IN (
          'crear_tecnico',
          'editar_tecnico',
          'cambiar_estado_tecnico',
          'actualizar_disponibilidad_tecnico',
          'actualizar_prioridad_tecnico',
          'marcar_tecnico_global',
          'reset_metricas_tecnico'
        )
      ORDER BY fecha_hora DESC
      LIMIT 20
      `,
      [idTecnico]
    );

    connection.release();

    const tecnicoLimpio = limpiarTecnico(tecnico);

    return NextResponse.json({
      success: true,
      data: {
        ...tecnicoLimpio,
        estadisticas,
        ultimas_actividades: ultimasActividades,
        historial_estados: historialEstados,
      },
    });
  } catch (error: any) {
    if (connection) connection.release();
    console.error("❌ Error al obtener técnico:", error);

    await registrarLog({
      id_usuario: null,
      tipo: "error",
      modulo: "tecnicos",
      accion: "obtener_tecnico",
      descripcion: `Error al obtener técnico ID ${params.id}: ${error.message}`,
      nivel_severidad: 7,
      ip_origen: obtenerIP(request),
      agente_usuario: obtenerUserAgent(request),
    });

    return NextResponse.json(
      {
        success: false,
        error: "Error al obtener técnico",
        detalles: error.message,
      },
      { status: 500 }
    );
  }
}

// ============================================================================
// PUT - ACTUALIZAR DATOS DEL TÉCNICO
// ============================================================================

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  let connection;

  try {
    const idTecnico = parseInt(params.id, 10);

    if (isNaN(idTecnico)) {
      return NextResponse.json(
        { success: false, error: "ID de técnico inválido" },
        { status: 400 }
      );
    }

    const body: UpdateTecnicoBody = await request.json();

    connection = await pool.getConnection();
    await connection.beginTransaction();

    // ========== 1. OBTENER TÉCNICO ANTERIOR ==========
    const [rowsAntiguo] = await connection.query<Tecnico[]>(
      "SELECT * FROM tecnicos WHERE id_tecnico = ?",
      [idTecnico]
    );

    if (rowsAntiguo.length === 0) {
      await connection.rollback();
      connection.release();
      return NextResponse.json(
        { success: false, error: "Técnico no encontrado" },
        { status: 404 }
      );
    }

    const tecnicoAntiguo = rowsAntiguo[0];

    // ========== 2. VALIDACIONES GENERALES ==========

    // id_usuario (si se quiere cambiar)
    if (
      typeof body.id_usuario !== "undefined" &&
      body.id_usuario !== tecnicoAntiguo.id_usuario
    ) {
      if (!Number.isInteger(body.id_usuario) || (body.id_usuario as number) <= 0) {
        await connection.rollback();
        connection.release();
        return NextResponse.json(
          { success: false, error: "ID de usuario inválido para el técnico" },
          { status: 400 }
        );
      }

      const [usuarioExiste] = await connection.query<RowDataPacket[]>(
        "SELECT id_usuario FROM usuarios WHERE id_usuario = ? AND activo = 1",
        [body.id_usuario]
      );

      if (usuarioExiste.length === 0) {
        await connection.rollback();
        connection.release();
        return NextResponse.json(
          {
            success: false,
            error: "El usuario asociado al técnico no existe o no está activo",
          },
          { status: 400 }
        );
      }

      // Revisar que no exista otro técnico con ese usuario
      const [otroTecnicoUsuario] = await connection.query<RowDataPacket[]>(
        "SELECT id_tecnico FROM tecnicos WHERE id_usuario = ? AND id_tecnico != ?",
        [body.id_usuario, idTecnico]
      );

      if (otroTecnicoUsuario.length > 0) {
        await connection.rollback();
        connection.release();
        return NextResponse.json(
          {
            success: false,
            error:
              "Este usuario ya está asociado a otro técnico. Cada usuario solo puede tener un técnico.",
          },
          { status: 400 }
        );
      }
    }

    // Centro
    if (typeof body.id_centro !== "undefined" && body.id_centro !== null) {
      const [centroExiste] = await connection.query<RowDataPacket[]>(
        "SELECT id_centro FROM centros_medicos WHERE id_centro = ? AND estado = 'activo'",
        [body.id_centro]
      );

      if (centroExiste.length === 0) {
        await connection.rollback();
        connection.release();
        return NextResponse.json(
          {
            success: false,
            error: "El centro médico no existe o no está activo",
          },
          { status: 400 }
        );
      }
    }

    // Sucursal
    if (
      typeof body.id_sucursal !== "undefined" &&
      body.id_sucursal !== null &&
      (body.id_centro || tecnicoAntiguo.id_centro)
    ) {
      const idCentroDestino = body.id_centro || tecnicoAntiguo.id_centro;

      const [sucursalExiste] = await connection.query<RowDataPacket[]>(
        "SELECT id_sucursal FROM sucursales WHERE id_sucursal = ? AND id_centro = ? AND estado = 'activo'",
        [body.id_sucursal, idCentroDestino]
      );

      if (sucursalExiste.length === 0) {
        await connection.rollback();
        connection.release();
        return NextResponse.json(
          {
            success: false,
            error:
              "La sucursal no existe, no pertenece al centro o no está activa",
          },
          { status: 400 }
        );
      }
    }

    // Enums
    if (
      typeof body.tipo_tecnico !== "undefined" &&
      !isInArray(body.tipo_tecnico, TIPOS_TECNICO)
    ) {
      await connection.rollback();
      connection.release();
      return NextResponse.json(
        {
          success: false,
          error:
            "Tipo de técnico inválido. Valores permitidos: " +
            TIPOS_TECNICO.join(", "),
        },
        { status: 400 }
      );
    }

    if (typeof body.turno !== "undefined" && !isInArray(body.turno, TURNOS)) {
      await connection.rollback();
      connection.release();
      return NextResponse.json(
        {
          success: false,
          error: "Turno inválido. Valores permitidos: " + TURNOS.join(", "),
        },
        { status: 400 }
      );
    }

    if (
      typeof body.nivel_acceso !== "undefined" &&
      !isInArray(body.nivel_acceso, NIVELES_ACCESO)
    ) {
      await connection.rollback();
      connection.release();
      return NextResponse.json(
        {
          success: false,
          error:
            "Nivel de acceso inválido. Valores permitidos: " +
            NIVELES_ACCESO.join(", "),
        },
        { status: 400 }
      );
    }

    if (
      typeof body.estado !== "undefined" &&
      !isInArray(body.estado, ESTADOS_TECNICO)
    ) {
      await connection.rollback();
      connection.release();
      return NextResponse.json(
        {
          success: false,
          error:
            "Estado del técnico inválido. Valores permitidos: " +
            ESTADOS_TECNICO.join(", "),
        },
        { status: 400 }
      );
    }

    if (
      typeof body.disponibilidad !== "undefined" &&
      !isInArray(body.disponibilidad, DISPONIBILIDADES)
    ) {
      await connection.rollback();
      connection.release();
      return NextResponse.json(
        {
          success: false,
          error:
            "Disponibilidad inválida. Valores permitidos: " +
            DISPONIBILIDADES.join(", "),
        },
        { status: 400 }
      );
    }

    if (
      typeof body.prioridad !== "undefined" &&
      !isInArray(body.prioridad, PRIORIDADES)
    ) {
      await connection.rollback();
      connection.release();
      return NextResponse.json(
        {
          success: false,
          error:
            "Prioridad inválida. Valores permitidos: " +
            PRIORIDADES.join(", "),
        },
        { status: 400 }
      );
    }

    // fecha_inicio mínimo requerido: si no viene, se mantiene el anterior
    const nuevaFechaInicio =
      typeof body.fecha_inicio !== "undefined" && body.fecha_inicio
        ? body.fecha_inicio
        : tecnicoAntiguo.fecha_inicio;

    if (!nuevaFechaInicio) {
      await connection.rollback();
      connection.release();
      return NextResponse.json(
        {
          success: false,
          error: "La fecha de inicio del técnico es obligatoria",
        },
        { status: 400 }
      );
    }

    // ========== 3. PREPARAR CAMPOS ACTUALIZADOS ==========
    const id_usuario_actualizado =
      typeof body.id_usuario !== "undefined"
        ? body.id_usuario
        : tecnicoAntiguo.id_usuario;

    const id_centro_actualizado =
      typeof body.id_centro !== "undefined"
        ? body.id_centro
        : tecnicoAntiguo.id_centro;

    const id_sucursal_actualizado =
      typeof body.id_sucursal !== "undefined"
        ? body.id_sucursal
        : tecnicoAntiguo.id_sucursal;

    const id_departamento_actualizado =
      typeof body.id_departamento !== "undefined"
        ? body.id_departamento
        : tecnicoAntiguo.id_departamento;

    const area_tecnica_actualizada =
      typeof body.area_tecnica !== "undefined" && body.area_tecnica
        ? body.area_tecnica.trim()
        : tecnicoAntiguo.area_tecnica;

    const tipo_tecnico_actualizado =
      typeof body.tipo_tecnico !== "undefined"
        ? body.tipo_tecnico
        : tecnicoAntiguo.tipo_tecnico;

    const turno_actualizado =
      typeof body.turno !== "undefined" ? body.turno : tecnicoAntiguo.turno;

    const hora_inicio_actualizada =
      typeof body.hora_inicio !== "undefined"
        ? body.hora_inicio || null
        : tecnicoAntiguo.hora_inicio;

    const hora_fin_actualizada =
      typeof body.hora_fin !== "undefined"
        ? body.hora_fin || null
        : tecnicoAntiguo.hora_fin;

    const descripcion_actualizada =
      typeof body.descripcion !== "undefined"
        ? body.descripcion || null
        : tecnicoAntiguo.descripcion;

    const nivel_acceso_actualizado =
      typeof body.nivel_acceso !== "undefined"
        ? body.nivel_acceso
        : tecnicoAntiguo.nivel_acceso;

    const extension_actualizada =
      typeof body.extension_telefonica !== "undefined"
        ? body.extension_telefonica || null
        : tecnicoAntiguo.extension_telefonica;

    const estado_actualizado =
      typeof body.estado !== "undefined" ? body.estado : tecnicoAntiguo.estado;

    const disponibilidad_actualizada =
      typeof body.disponibilidad !== "undefined"
        ? body.disponibilidad
        : tecnicoAntiguo.disponibilidad;

    const prioridad_actualizada =
      typeof body.prioridad !== "undefined"
        ? body.prioridad
        : tecnicoAntiguo.prioridad;

    const pais_actualizado =
      typeof body.pais !== "undefined" ? body.pais || null : tecnicoAntiguo.pais;

    const region_actualizada =
      typeof body.region !== "undefined"
        ? body.region || null
        : tecnicoAntiguo.region;

    const zona_horaria_actualizada =
      typeof body.zona_horaria !== "undefined"
        ? body.zona_horaria || null
        : tecnicoAntiguo.zona_horaria;

    const pin_seguridad_actualizado =
      typeof body.pin_seguridad !== "undefined"
        ? body.pin_seguridad || null
        : tecnicoAntiguo.pin_seguridad;

    const firma_digital_actualizada =
      typeof body.firma_digital !== "undefined"
        ? body.firma_digital || null
        : tecnicoAntiguo.firma_digital;

    const supervisor_actualizado =
      typeof body.supervisor_id !== "undefined"
        ? body.supervisor_id
        : tecnicoAntiguo.supervisor_id;

    const fecha_termino_actualizada =
      typeof body.fecha_termino !== "undefined"
        ? body.fecha_termino || null
        : tecnicoAntiguo.fecha_termino;

    const especialidad_actualizada =
      typeof body.especialidad_tecnica !== "undefined"
        ? body.especialidad_tecnica || null
        : tecnicoAntiguo.especialidad_tecnica;

    const certificaciones_actualizadas =
      typeof body.certificaciones !== "undefined"
        ? body.certificaciones || null
        : tecnicoAntiguo.certificaciones;

    const es_global_actualizado =
      typeof body.es_global !== "undefined"
        ? body.es_global
          ? 1
          : 0
        : tecnicoAntiguo.es_global;

    const tickets_resueltos_actualizado =
      typeof body.tickets_resueltos !== "undefined"
        ? body.tickets_resueltos
        : tecnicoAntiguo.tickets_resueltos;

    const tiempo_prom_resolucion_actualizado =
      typeof body.tiempo_promedio_resolucion !== "undefined"
        ? body.tiempo_promedio_resolucion
        : tecnicoAntiguo.tiempo_promedio_resolucion;

    const calificacion_promedio_actualizada =
      typeof body.calificacion_promedio !== "undefined"
        ? body.calificacion_promedio
        : tecnicoAntiguo.calificacion_promedio;

    // ========== 4. ACTUALIZAR REGISTRO ==========
    await connection.query<ResultSetHeader>(
      `
      UPDATE tecnicos SET
        id_usuario = ?,
        id_centro = ?,
        id_sucursal = ?,
        id_departamento = ?,
        area_tecnica = ?,
        tipo_tecnico = ?,
        turno = ?,
        hora_inicio = ?,
        hora_fin = ?,
        descripcion = ?,
        nivel_acceso = ?,
        extension_telefonica = ?,
        estado = ?,
        disponibilidad = ?,
        prioridad = ?,
        pais = ?,
        region = ?,
        zona_horaria = ?,
        pin_seguridad = ?,
        firma_digital = ?,
        tickets_resueltos = ?,
        tiempo_promedio_resolucion = ?,
        calificacion_promedio = ?,
        supervisor_id = ?,
        fecha_inicio = ?,
        fecha_termino = ?,
        especialidad_tecnica = ?,
        certificaciones = ?,
        es_global = ?,
        modificado_por = ?,
        fecha_modificacion = NOW()
      WHERE id_tecnico = ?
      `,
      [
        id_usuario_actualizado,
        id_centro_actualizado,
        id_sucursal_actualizado,
        id_departamento_actualizado,
        area_tecnica_actualizada,
        tipo_tecnico_actualizado,
        turno_actualizado,
        hora_inicio_actualizada,
        hora_fin_actualizada,
        descripcion_actualizada,
        nivel_acceso_actualizado,
        extension_actualizada,
        estado_actualizado,
        disponibilidad_actualizada,
        prioridad_actualizada,
        pais_actualizado,
        region_actualizada,
        zona_horaria_actualizada,
        pin_seguridad_actualizado,
        firma_digital_actualizada,
        tickets_resueltos_actualizado,
        tiempo_prom_resolucion_actualizado,
        calificacion_promedio_actualizada,
        supervisor_actualizado,
        nuevaFechaInicio,
        fecha_termino_actualizada,
        especialidad_actualizada,
        certificaciones_actualizadas,
        es_global_actualizado,
        ADMIN_USER_ID_FALLBACK,
        idTecnico,
      ]
    );

    // ========== 5. OBTENER TÉCNICO ACTUALIZADO PARA RESPUESTA ==========
    const [rowsActualizado] = await connection.query<
      (TecnicoDetalle & RowDataPacket)[]
    >(
      `
      SELECT
        t.*,
        u.username,
        u.nombre           AS usuario_nombre,
        u.apellido_paterno AS usuario_apellido_paterno,
        u.apellido_materno AS usuario_apellido_materno,
        u.email            AS usuario_email,
        u.rut              AS usuario_rut,
        u.telefono         AS usuario_telefono,
        u.celular          AS usuario_celular,
        u.foto_perfil_url  AS usuario_foto_perfil_url,
        c.nombre           AS centro_nombre,
        c.ciudad           AS centro_ciudad,
        c.region           AS centro_region,
        c.estado           AS centro_estado,
        s.nombre           AS sucursal_nombre,
        s.direccion        AS sucursal_direccion,
        s.estado           AS sucursal_estado,
        CONCAT(u.nombre, ' ', u.apellido_paterno, ' ', COALESCE(u.apellido_materno, '')) AS nombre_completo,
        CASE
          WHEN u.fecha_nacimiento IS NULL THEN NULL
          ELSE TIMESTAMPDIFF(YEAR, u.fecha_nacimiento, CURDATE())
        END AS edad_usuario
      FROM tecnicos t
      INNER JOIN usuarios u ON t.id_usuario = u.id_usuario
      LEFT JOIN centros_medicos c ON t.id_centro = c.id_centro
      LEFT JOIN sucursales s ON t.id_sucursal = s.id_sucursal
      WHERE t.id_tecnico = ?
      LIMIT 1
      `,
      [idTecnico]
    );

    const tecnicoActualizado = rowsActualizado[0];

    // ========== 6. LOG AUDITORÍA ==========
    await registrarLog({
      id_usuario: ADMIN_USER_ID_FALLBACK,
      tipo: "audit",
      modulo: "tecnicos",
      accion: "editar_tecnico",
      descripcion: `Técnico editado: ID ${idTecnico} (usuario ID ${id_usuario_actualizado})`,
      objeto_tipo: "tecnico",
      objeto_id: idTecnico.toString(),
      datos_antiguos: limpiarTecnico(tecnicoAntiguo),
      datos_nuevos: body,
      ip_origen: obtenerIP(request),
      agente_usuario: obtenerUserAgent(request),
      nivel_severidad: 5,
    });

    await connection.commit();
    connection.release();

    return NextResponse.json({
      success: true,
      message: "Técnico actualizado exitosamente",
      data: limpiarTecnico(tecnicoActualizado),
    });
  } catch (error: any) {
    if (connection) {
      await connection.rollback();
      connection.release();
    }

    console.error("❌ Error al actualizar técnico:", error);

    await registrarLog({
      id_usuario: null,
      tipo: "error",
      modulo: "tecnicos",
      accion: "editar_tecnico",
      descripcion: `Error al actualizar técnico ID ${params.id}: ${error.message}`,
      nivel_severidad: 8,
      ip_origen: obtenerIP(request),
      agente_usuario: obtenerUserAgent(request),
    });

    return NextResponse.json(
      {
        success: false,
        error: "Error al actualizar técnico",
        detalles: error.message,
      },
      { status: 500 }
    );
  }
}

// ============================================================================
// POST - ACCIONES ESPECIALES SOBRE TÉCNICOS
// ============================================================================
//
// Soporta acciones administrativas similares a las de usuarios,
// pero orientadas a la gestión operativa del técnico:
//
// Body esperado (JSON):
// {
//   action: "cambiar_estado" | "actualizar_disponibilidad" |
//           "actualizar_prioridad" | "marcar_global" |
//           "asignar_supervisor" | "reset_metricas",
//   ...según acción...
// }
//
// ============================================================================

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  let connection;

  try {
    const idTecnico = parseInt(params.id, 10);

    if (isNaN(idTecnico)) {
      return NextResponse.json(
        { success: false, error: "ID de técnico inválido" },
        { status: 400 }
      );
    }

    const cuerpo: AccionTecnicoBody = await request.json();
    const ip = obtenerIP(request);
    const agente = obtenerUserAgent(request);

    connection = await pool.getConnection();
    await connection.beginTransaction();

    // Obtener técnico actual
    const [rowsTecnico] = await connection.query<Tecnico[]>(
      "SELECT * FROM tecnicos WHERE id_tecnico = ?",
      [idTecnico]
    );

    if (rowsTecnico.length === 0) {
      await connection.rollback();
      connection.release();
      return NextResponse.json(
        { success: false, error: "Técnico no encontrado" },
        { status: 404 }
      );
    }

    const tecnicoActual = rowsTecnico[0];

    let respuestaAccion: any = {};
    let logAccion = "";
    let logDescripcion = "";
    let nivel_severidad_log = 6;

    switch (cuerpo.action) {
      // --------------------------------------------------
      // CAMBIAR ESTADO (activo / inactivo / suspendido)
      // --------------------------------------------------
      case "cambiar_estado": {
        const nuevoEstado = cuerpo.nuevo_estado;

        if (!nuevoEstado || !isInArray(nuevoEstado, ESTADOS_TECNICO)) {
          await connection.rollback();
          connection.release();
          return NextResponse.json(
            {
              success: false,
              error:
                "Estado de técnico inválido. Valores permitidos: " +
                ESTADOS_TECNICO.join(", "),
            },
            { status: 400 }
          );
        }

        await connection.query<ResultSetHeader>(
          `
          UPDATE tecnicos
          SET estado = ?, fecha_modificacion = NOW(), modificado_por = ?
          WHERE id_tecnico = ?
          `,
          [nuevoEstado, ADMIN_USER_ID_FALLBACK, idTecnico]
        );

        respuestaAccion = {
          estado: nuevoEstado,
        };

        logAccion = "cambiar_estado_tecnico";
        logDescripcion = `Estado del técnico ID ${idTecnico} actualizado a ${nuevoEstado}`;
        nivel_severidad_log = 6;
        break;
      }

      // --------------------------------------------------
      // ACTUALIZAR DISPONIBILIDAD (disponible / ocupado / fuera_servicio)
      // --------------------------------------------------
      case "actualizar_disponibilidad": {
        const nuevaDisp = cuerpo.nueva_disponibilidad;

        if (!nuevaDisp || !isInArray(nuevaDisp, DISPONIBILIDADES)) {
          await connection.rollback();
          connection.release();
          return NextResponse.json(
            {
              success: false,
              error:
                "Disponibilidad inválida. Valores permitidos: " +
                DISPONIBILIDADES.join(", "),
            },
            { status: 400 }
          );
        }

        await connection.query<ResultSetHeader>(
          `
          UPDATE tecnicos
          SET disponibilidad = ?, fecha_modificacion = NOW(), modificado_por = ?
          WHERE id_tecnico = ?
          `,
          [nuevaDisp, ADMIN_USER_ID_FALLBACK, idTecnico]
        );

        respuestaAccion = {
          disponibilidad: nuevaDisp,
        };

        logAccion = "actualizar_disponibilidad_tecnico";
        logDescripcion = `Disponibilidad del técnico ID ${idTecnico} actualizada a ${nuevaDisp}`;
        nivel_severidad_log = 5;
        break;
      }

      // --------------------------------------------------
      // ACTUALIZAR PRIORIDAD (baja / media / alta / critica)
// --------------------------------------------------
      case "actualizar_prioridad": {
        const nuevaPrio = cuerpo.nueva_prioridad;

        if (!nuevaPrio || !isInArray(nuevaPrio, PRIORIDADES)) {
          await connection.rollback();
          connection.release();
          return NextResponse.json(
            {
              success: false,
              error:
                "Prioridad inválida. Valores permitidos: " +
                PRIORIDADES.join(", "),
            },
            { status: 400 }
          );
        }

        await connection.query<ResultSetHeader>(
          `
          UPDATE tecnicos
          SET prioridad = ?, fecha_modificacion = NOW(), modificado_por = ?
          WHERE id_tecnico = ?
          `,
          [nuevaPrio, ADMIN_USER_ID_FALLBACK, idTecnico]
        );

        respuestaAccion = {
          prioridad: nuevaPrio,
        };

        logAccion = "actualizar_prioridad_tecnico";
        logDescripcion = `Prioridad del técnico ID ${idTecnico} actualizada a ${nuevaPrio}`;
        nivel_severidad_log = 5;
        break;
      }

      // --------------------------------------------------
      // MARCAR TÉCNICO GLOBAL / LOCAL
      // --------------------------------------------------
      case "marcar_global": {
        const esGlobal = cuerpo.es_global === true;
        const es_global_val = esGlobal ? 1 : 0;

        await connection.query<ResultSetHeader>(
          `
          UPDATE tecnicos
          SET es_global = ?, fecha_modificacion = NOW(), modificado_por = ?
          WHERE id_tecnico = ?
          `,
          [es_global_val, ADMIN_USER_ID_FALLBACK, idTecnico]
        );

        respuestaAccion = {
          es_global: es_global_val,
        };

        logAccion = "marcar_tecnico_global";
        logDescripcion = `Técnico ID ${idTecnico} marcado como ${
          esGlobal ? "GLOBAL" : "no global"
        }`;
        nivel_severidad_log = 6;
        break;
      }

      // --------------------------------------------------
      // ASIGNAR / CAMBIAR SUPERVISOR
      // --------------------------------------------------
      case "asignar_supervisor": {
        const supervisor_id = cuerpo.supervisor_id ?? null;

        if (supervisor_id !== null) {
          if (!Number.isInteger(supervisor_id) || supervisor_id <= 0) {
            await connection.rollback();
            connection.release();
            return NextResponse.json(
              {
                success: false,
                error: "ID de supervisor inválido",
              },
              { status: 400 }
            );
          }

          // Validar que el supervisor exista en administrativos
          const [supExiste] = await connection.query<RowDataPacket[]>(
            "SELECT id_administrativo FROM administrativos WHERE id_administrativo = ?",
            [supervisor_id]
          );

          if (supExiste.length === 0) {
            await connection.rollback();
            connection.release();
            return NextResponse.json(
              {
                success: false,
                error: "El supervisor indicado no existe",
              },
              { status: 400 }
            );
          }
        }

        await connection.query<ResultSetHeader>(
          `
          UPDATE tecnicos
          SET supervisor_id = ?, fecha_modificacion = NOW(), modificado_por = ?
          WHERE id_tecnico = ?
          `,
          [supervisor_id, ADMIN_USER_ID_FALLBACK, idTecnico]
        );

        respuestaAccion = {
          supervisor_id,
        };

        logAccion = "asignar_supervisor_tecnico";
        logDescripcion = `Supervisor del técnico ID ${idTecnico} actualizado a ${
          supervisor_id ?? "NULL"
        }`;
        nivel_severidad_log = 6;
        break;
      }

      // --------------------------------------------------
      // RESETEAR MÉTRICAS (tickets_resueltos, tiempos, calificación)
// --------------------------------------------------
      case "reset_metricas": {
        await connection.query<ResultSetHeader>(
          `
          UPDATE tecnicos
          SET tickets_resueltos = 0,
              tiempo_promedio_resolucion = 0,
              calificacion_promedio = 0,
              fecha_modificacion = NOW(),
              modificado_por = ?
          WHERE id_tecnico = ?
          `,
          [ADMIN_USER_ID_FALLBACK, idTecnico]
        );

        respuestaAccion = {
          tickets_resueltos: 0,
          tiempo_promedio_resolucion: 0,
          calificacion_promedio: 0,
        };

        logAccion = "reset_metricas_tecnico";
        logDescripcion = `Métricas del técnico ID ${idTecnico} reseteadas`;
        nivel_severidad_log = 7;
        break;
      }

      // --------------------------------------------------
      default: {
        await connection.rollback();
        connection.release();
        return NextResponse.json(
          {
            success: false,
            error: "Acción inválida o no soportada para técnicos",
            detalle: cuerpo.action,
          },
          { status: 400 }
        );
      }
    }

    // ======================================================================
    // REGISTRAR EN logs_sistema
    // ======================================================================
    await registrarLog({
      id_usuario: ADMIN_USER_ID_FALLBACK,
      tipo: "audit",
      modulo: "tecnicos",
      accion: logAccion,
      descripcion: logDescripcion,
      objeto_tipo: "tecnico",
      objeto_id: idTecnico.toString(),
      datos_antiguos: limpiarTecnico(tecnicoActual),
      datos_nuevos: respuestaAccion,
      ip_origen: ip,
      agente_usuario: agente,
      nivel_severidad: nivel_severidad_log,
    });

    await connection.commit();
    connection.release();

    return NextResponse.json({
      success: true,
      message: "Acción realizada correctamente sobre el técnico",
      data: respuestaAccion,
    });
  } catch (error: any) {
    if (connection) {
      await connection.rollback();
      connection.release();
    }

    console.error("❌ Error en acción sobre técnico:", error);

    await registrarLog({
      id_usuario: null,
      tipo: "error",
      modulo: "tecnicos",
      accion: "accion_tecnico",
      descripcion: `Error al ejecutar acción en técnico ID ${params.id}: ${error.message}`,
      nivel_severidad: 9,
      ip_origen: obtenerIP(request),
      agente_usuario: obtenerUserAgent(request),
    });

    return NextResponse.json(
      {
        success: false,
        error: "Error al ejecutar acción sobre el técnico",
        detalles: error.message,
      },
      { status: 500 }
    );
  }
}

// ============================================================================
// DELETE - ELIMINAR TÉCNICO (RESPETANDO HISTÓRICOS BÁSICOS)
// ============================================================================
//
// Por seguridad, si el técnico tiene métricas (tickets_resueltos > 0),
// se sugiere marcarlo como inactivo en vez de eliminarlo.
//
// ============================================================================

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  let connection;

  try {
    const idTecnico = parseInt(params.id, 10);

    if (isNaN(idTecnico)) {
      return NextResponse.json(
        { success: false, error: "ID de técnico inválido" },
        { status: 400 }
      );
    }

    connection = await pool.getConnection();
    await connection.beginTransaction();

    // 1. ¿Existe el técnico?
    const [rowsTecnico] = await connection.query<Tecnico[]>(
      "SELECT * FROM tecnicos WHERE id_tecnico = ?",
      [idTecnico]
    );

    if (rowsTecnico.length === 0) {
      await connection.rollback();
      connection.release();
      return NextResponse.json(
        { success: false, error: "Técnico no encontrado" },
        { status: 404 }
      );
    }

    const tecnico = rowsTecnico[0];

    // 2. Verificar métricas básicas para evitar borrar históricos importantes
    if (
      (tecnico.tickets_resueltos ?? 0) > 0 ||
      (tecnico.tiempo_promedio_resolucion ?? 0) > 0 ||
      (tecnico.calificacion_promedio ?? 0) > 0
    ) {
      await connection.rollback();
      connection.release();

      return NextResponse.json(
        {
          success: false,
          error:
            "No se puede eliminar el técnico porque tiene métricas históricas asociadas (tickets resueltos, tiempos, calificación).",
          detalles: {
            tickets_resueltos: tecnico.tickets_resueltos,
            tiempo_promedio_resolucion: tecnico.tiempo_promedio_resolucion,
            calificacion_promedio: tecnico.calificacion_promedio,
          },
          sugerencia:
            "Marcar el técnico como 'inactivo' y/o 'fuera de servicio' en lugar de eliminarlo para mantener la integridad de los datos.",
        },
        { status: 400 }
      );
    }

    // 3. Eliminar técnico (las FKs a centros/sucursales/usuarios se manejan por la BD)
    await connection.query<ResultSetHeader>(
      "DELETE FROM tecnicos WHERE id_tecnico = ?",
      [idTecnico]
    );

    await registrarLog({
      id_usuario: ADMIN_USER_ID_FALLBACK,
      tipo: "security",
      modulo: "tecnicos",
      accion: "eliminar_tecnico",
      descripcion: `Técnico eliminado: ID ${idTecnico} (usuario ID ${tecnico.id_usuario})`,
      objeto_tipo: "tecnico",
      objeto_id: idTecnico.toString(),
      datos_antiguos: limpiarTecnico(tecnico),
      ip_origen: obtenerIP(request),
      agente_usuario: obtenerUserAgent(request),
      nivel_severidad: 9,
    });

    await connection.commit();
    connection.release();

    return NextResponse.json({
      success: true,
      message: "Técnico eliminado exitosamente",
      data: {
        id_tecnico: idTecnico,
        id_usuario: tecnico.id_usuario,
        area_tecnica: tecnico.area_tecnica,
        tipo_tecnico: tecnico.tipo_tecnico,
      },
    });
  } catch (error: any) {
    if (connection) {
      await connection.rollback();
      connection.release();
    }

    console.error("❌ Error al eliminar técnico:", error);

    await registrarLog({
      id_usuario: null,
      tipo: "error",
      modulo: "tecnicos",
      accion: "eliminar_tecnico",
      descripcion: `Error al eliminar técnico ID ${params.id}: ${error.message}`,
      nivel_severidad: 9,
      ip_origen: obtenerIP(request),
      agente_usuario: obtenerUserAgent(request),
    });

    return NextResponse.json(
      {
        success: false,
        error: "Error al eliminar técnico",
        detalles: error.message,
      },
      { status: 500 }
    );
  }
}
