// app/api/usuario/dashboard/route.ts
import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { RowDataPacket } from "mysql2";
import { jwtVerify } from "jose";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// ================================
// TIPOS (adaptados a tu esquema)
// ================================
interface UsuarioDTO {
  id_usuario: number;
  nombre_completo: string;
  email: string;
  foto_url: string | null;
  tipo_usuario: string;
  es_premium: boolean;
  fecha_expiracion_premium: string | null;
}

interface EstadisticasBasicas {
  citas_proximas: number;
  mensajes_sin_leer: number;
  notificaciones_pendientes: number;
  documentos_pendientes: number;
}

interface CitaProxima {
  id_cita: number;
  fecha_hora_inicio: string;
  fecha_hora_fin: string;
  tipo_cita: string;
  estado: string;
  medico: {
    nombre_completo: string;
    especialidad: string;
    foto_url: string | null;
  };
  centro: {
    nombre: string;
    direccion: string;
  };
  motivo: string | null;
}

interface NotificacionReciente {
  id_notificacion: number;
  tipo: string;
  titulo: string;
  mensaje: string;
  fecha_hora: string;
  leida: boolean;
  icono: string;
  color: string;
}

interface AccesoRapido {
  titulo: string;
  descripcion: string;
  icono: string;
  color: string;
  url: string;
  requiere_premium: boolean;
  badge?: string;
}

interface FuncionalidadPremium {
  titulo: string;
  descripcion: string;
  icono: string;
  beneficios: string[];
}

// ================================
// AUTH
// ================================
async function getUserIdFromAuthHeader(req: NextRequest): Promise<number | null> {
  try {
    const auth = req.headers.get("authorization") || req.headers.get("Authorization");
    if (!auth?.startsWith("Bearer ")) return null;

    const token = auth.slice("Bearer ".length).trim();
    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error("JWT_SECRET no configurado");

    const enc = new TextEncoder();
    const { payload } = await jwtVerify(token, enc.encode(secret));

    const id =
      (payload as any).id_usuario ??
      (payload as any).user_id ??
      (payload as any).sub ??
      null;

    if (!id) return null;
    const num = typeof id === "string" ? Number(id) : id;
    return Number.isFinite(num) ? num : null;
  } catch {
    return null;
  }
}

// ================================
// QUERIES
// ================================
async function obtenerUsuarioAutenticado(idUsuario: number): Promise<UsuarioDTO | null> {
  const [rows] = await pool.query<RowDataPacket[]>(
    `
    SELECT 
      u.id_usuario,
      u.email,
      u.nombre,
      u.apellido_paterno,
      u.apellido_materno,
      u.foto_perfil_url,
      u.estado
    FROM usuarios u
    WHERE u.id_usuario = ? AND u.estado = 'activo'
    LIMIT 1
    `,
    [idUsuario]
  );

  if (rows.length === 0) return null;

  const u = rows[0];

  return {
    id_usuario: u.id_usuario,
    nombre_completo: `${u.nombre} ${u.apellido_paterno} ${u.apellido_materno ?? ""}`.trim(),
    email: u.email,
    foto_url: u.foto_perfil_url,
    // estos 3 son para que tu dashboard renderice sin romper
    tipo_usuario: "paciente",
    es_premium: false,
    fecha_expiracion_premium: null,
  };
}

async function obtenerEstadisticasBasicas(idUsuario: number): Promise<EstadisticasBasicas> {
  // paciente?
  const [pacienteRows] = await pool.query<RowDataPacket[]>(
    `SELECT id_paciente FROM pacientes WHERE id_usuario = ? LIMIT 1`,
    [idUsuario]
  );

  let citas_proximas = 0;
  if (pacienteRows.length > 0) {
    const idPaciente = pacienteRows[0].id_paciente;
    const [citas] = await pool.query<RowDataPacket[]>(
      `
      SELECT COUNT(*) AS total
      FROM citas
      WHERE id_paciente = ?
        AND fecha_hora_inicio > NOW()
        AND estado NOT IN ('cancelada','no_asistio','completada')
      `,
      [idPaciente]
    );
    citas_proximas = Number(citas[0]?.total || 0);
  }

  // 👇 aquí el fix: tu tabla tiene id_usuario_receptor, no id_destinatario
  const [mensajes] = await pool.query<RowDataPacket[]>(
    `
    SELECT COUNT(*) AS total
    FROM mensajes_chat
    WHERE id_usuario_receptor = ?
      AND leido = 0
      AND eliminado_receptor = 0
    `,
    [idUsuario]
  );

  // notificaciones según tu tabla
  const [notificaciones] = await pool.query<RowDataPacket[]>(
    `
    SELECT COUNT(*) AS total
    FROM notificaciones
    WHERE id_usuario_destino = ?
      AND estado NOT IN ('eliminada','caducada')
      AND (fecha_programada IS NULL OR fecha_programada <= NOW())
      AND leida = 0
    `,
    [idUsuario]
  );

  // documentos (si la tabla existe así)
  const [documentos] = await pool.query<RowDataPacket[]>(
    `
    SELECT COUNT(*) AS total
    FROM documentos_compartidos
    WHERE id_usuario_destino = ?
      AND estado = 'pendiente'
      AND requiere_firma = 1
    `,
    [idUsuario]
  );

  return {
    citas_proximas,
    mensajes_sin_leer: Number(mensajes[0]?.total || 0),
    notificaciones_pendientes: Number(notificaciones[0]?.total || 0),
    documentos_pendientes: Number(documentos[0]?.total || 0),
  };
}

async function obtenerCitasProximas(idUsuario: number): Promise<CitaProxima[]> {
  const [pacienteRows] = await pool.query<RowDataPacket[]>(
    `SELECT id_paciente FROM pacientes WHERE id_usuario = ? LIMIT 1`,
    [idUsuario]
  );
  if (pacienteRows.length === 0) return [];

  const idPaciente = pacienteRows[0].id_paciente;

  const [rows] = await pool.query<RowDataPacket[]>(
    `
    SELECT 
      c.id_cita,
      c.fecha_hora_inicio,
      c.fecha_hora_fin,
      c.tipo_cita,
      c.estado,
      c.motivo,
      CONCAT(u.nombre, ' ', u.apellido_paterno, ' ', COALESCE(u.apellido_materno, '')) AS medico_nombre_completo,
      m.especialidad_principal AS medico_especialidad,
      u.foto_perfil_url AS medico_foto,
      cm.nombre AS centro_nombre,
      CONCAT(cm.direccion, ', ', cm.ciudad, ', ', cm.region) AS centro_direccion
    FROM citas c
    INNER JOIN medicos m ON c.id_medico = m.id_medico
    INNER JOIN usuarios u ON m.id_usuario = u.id_usuario
    INNER JOIN centros_medicos cm ON c.id_centro = cm.id_centro
    WHERE c.id_paciente = ?
      AND c.fecha_hora_inicio > NOW()
      AND c.estado NOT IN ('cancelada','no_asistio','completada')
    ORDER BY c.fecha_hora_inicio ASC
    LIMIT 3
    `,
    [idPaciente]
  );

  return rows.map((row) => ({
    id_cita: row.id_cita,
    fecha_hora_inicio: row.fecha_hora_inicio,
    fecha_hora_fin: row.fecha_hora_fin,
    tipo_cita: row.tipo_cita,
    estado: row.estado,
    medico: {
      nombre_completo: row.medico_nombre_completo,
      especialidad: row.medico_especialidad,
      foto_url: row.medico_foto ?? null,
    },
    centro: {
      nombre: row.centro_nombre,
      direccion: row.centro_direccion,
    },
    motivo: row.motivo,
  }));
}

async function obtenerNotificacionesRecientes(
  idUsuario: number
): Promise<NotificacionReciente[]> {
  const [rows] = await pool.query<RowDataPacket[]>(
    `
    SELECT 
      id_notificacion,
      tipo,
      titulo,
      mensaje,
      fecha_generacion,
      fecha_lectura,
      leida,
      estado
    FROM notificaciones
    WHERE id_usuario_destino = ?
      AND estado NOT IN ('eliminada','caducada')
      AND (fecha_programada IS NULL OR fecha_programada <= NOW())
    ORDER BY fecha_generacion DESC
    LIMIT 5
    `,
    [idUsuario]
  );

  const tipoConfig: Record<string, { icono: string; color: string }> = {
    cita: { icono: "Calendar", color: "text-blue-500" },
    resultado: { icono: "FileText", color: "text-green-500" },
    recordatorio: { icono: "Bell", color: "text-yellow-500" },
    mensaje: { icono: "MessageSquare", color: "text-purple-500" },
    alerta: { icono: "AlertCircle", color: "text-red-500" },
    sistema: { icono: "Info", color: "text-gray-500" },
  };

  return rows.map((row) => ({
    id_notificacion: row.id_notificacion,
    tipo: row.tipo,
    titulo: row.titulo,
    mensaje: row.mensaje,
    // el frontend espera "fecha_hora", le damos fecha_generacion
    fecha_hora: row.fecha_generacion,
    leida: row.leida === 1 || !!row.fecha_lectura,
    icono: tipoConfig[row.tipo]?.icono || "Bell",
    color: tipoConfig[row.tipo]?.color || "text-gray-500",
  }));
}

function obtenerAccesosRapidos(_esPremium: boolean): AccesoRapido[] {
  return [
    {
      titulo: "Agendar Cita",
      descripcion: "Programa tu próxima consulta médica",
      icono: "CalendarPlus",
      color: "bg-blue-500",
      url: "/agendar-cita",
      requiere_premium: false,
    },
    {
      titulo: "Mis Citas",
      descripcion: "Ver historial y citas programadas",
      icono: "Calendar",
      color: "bg-green-500",
      url: "/mis-citas",
      requiere_premium: false,
    },
    {
      titulo: "Resultados",
      descripcion: "Consulta tus resultados de exámenes",
      icono: "FileText",
      color: "bg-purple-500",
      url: "/resultados",
      requiere_premium: false,
    },
    {
      titulo: "Recetas",
      descripcion: "Accede a tus recetas médicas",
      icono: "Pill",
      color: "bg-pink-500",
      url: "/recetas",
      requiere_premium: false,
    },
    {
      titulo: "Telemedicina",
      descripcion: "Consultas médicas en línea",
      icono: "Video",
      color: "bg-indigo-500",
      url: "/telemedicina",
      requiere_premium: true,
      badge: "Premium",
    },
    {
      titulo: "Historia Clínica",
      descripcion: "Tu historial médico completo",
      icono: "FileText",
      color: "bg-red-500",
      url: "/historia-clinica",
      requiere_premium: true,
      badge: "Premium",
    },
    {
      titulo: "Análisis IA",
      descripcion: "Análisis inteligente de tu salud",
      icono: "Brain",
      color: "bg-cyan-500",
      url: "/analisis-ia",
      requiere_premium: true,
      badge: "Premium",
    },
    {
      titulo: "Documentos",
      descripcion: "Gestiona tus documentos médicos",
      icono: "FolderOpen",
      color: "bg-amber-500",
      url: "/documentos",
      requiere_premium: false,
    },
  ];
}

function obtenerFuncionalidadesPremium(): FuncionalidadPremium[] {
  return [
    {
      titulo: "Telemedicina 24/7",
      descripcion: "Consultas médicas por videollamada en cualquier momento",
      icono: "Video",
      beneficios: ["Consultas ilimitadas", "Sin tiempo de espera", "Especialistas disponibles", "Grabación de consultas"],
    },
    {
      titulo: "Historia Clínica Digital",
      descripcion: "Accede a tu historial médico completo desde cualquier lugar",
      icono: "FileText",
      beneficios: ["Historial completo", "Compartir con médicos", "Backup en la nube", "Exportar en PDF"],
    },
    {
      titulo: "Análisis con IA",
      descripcion: "Análisis inteligente de tus datos de salud y recomendaciones",
      icono: "Brain",
      beneficios: ["Detección temprana", "Recomendaciones personalizadas", "Predicción de riesgos", "Alertas proactivas"],
    },
    {
      titulo: "Prioridad en Atención",
      descripcion: "Acceso prioritario a citas y atención médica",
      icono: "Zap",
      beneficios: ["Citas preferenciales", "Sin tiempos de espera", "Soporte prioritario", "Cancelación flexible"],
    },
    {
      titulo: "Seguimiento Personalizado",
      descripcion: "Monitoreo continuo de tu salud con recordatorios",
      icono: "Activity",
      beneficios: ["Recordatorios inteligentes", "Tracking de medicamentos", "Gráficos de evolución", "Reportes mensuales"],
    },
    {
      titulo: "Descuentos Exclusivos",
      descripcion: "Descuentos en consultas, exámenes y medicamentos",
      icono: "Tag",
      beneficios: ["Hasta 30% descuento", "Promociones exclusivas", "Puntos de recompensa", "Partners médicos"],
    },
  ];
}

// ================================
// HANDLER
// ================================
export async function GET(request: NextRequest) {
  try {
    let idUsuario = await getUserIdFromAuthHeader(request);
    if (!idUsuario) {
      // dev: forzamos uno
      idUsuario = 1;
    }

    const usuario = await obtenerUsuarioAutenticado(idUsuario);
    if (!usuario) {
      return NextResponse.json(
        { success: false, error: "Usuario no encontrado o inactivo" },
        { status: 404 }
      );
    }

    const [estadisticas, citas_proximas, notificaciones_recientes] =
      await Promise.all([
        obtenerEstadisticasBasicas(idUsuario),
        obtenerCitasProximas(idUsuario),
        obtenerNotificacionesRecientes(idUsuario),
      ]);

    const accesos_rapidos = obtenerAccesosRapidos(usuario.es_premium);
    const funcionalidades_premium = obtenerFuncionalidadesPremium();

    return NextResponse.json(
      {
        success: true,
        usuario,
        estadisticas,
        citas_proximas,
        notificaciones_recientes,
        accesos_rapidos,
        funcionalidades_premium,
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error en GET /api/usuario/dashboard:", error);
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

export async function POST() {
  return NextResponse.json(
    { success: false, error: "Método no permitido" },
    { status: 405 }
  );
}
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
