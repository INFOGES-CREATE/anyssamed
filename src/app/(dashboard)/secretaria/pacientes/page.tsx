"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Activity,
  AlertCircle,
  AlertTriangle,
  BarChart3,
  Bell,
  BellOff,
  Calendar,
  CalendarCheck,
  CalendarClock,
  CalendarDays,
  CalendarPlus,
  RefreshCw,
  CheckSquare,
  Check,
  CheckCircle2,
  ChevronDown,
  Eye,
  Wifi,
  ChevronLeft,
  ChevronRight,
  Clock,
  Pill,
  ClipboardCheck,
  Send,
  TrendingUp,
  ClipboardList,
  Award,
  FileText,
  HeartPulse,
  Shield,
  Home,
  Lightbulb,
  Loader2,
  LogOut,
  Mail,
  MessageSquare,
  Phone,
  PhoneCall,
  PhoneIncoming,
  PhoneOutgoing,
  PieChart,
  Plus,
  CalendarRange,
  Search,
  Settings,
  Sparkles,
  Stethoscope,
  Sun,
  Target,
  User,
  UserCheck,
  UserPlus,
  Users,
  Video,
  X,
  Zap,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

// ========================================
// TIPOS DE DATOS
// ========================================

type TemaColor = "light" | "dark" | "blue" | "purple" | "green";

interface ConfiguracionTema {
  nombre: string;
  icono: any;
  colores: {
    fondo: string;
    fondoSecundario: string;
    texto: string;
    textoSecundario: string;
    primario: string;
    secundario: string;
    acento: string;
    borde: string;
    sombra: string;
    gradiente: string;
    sidebar: string;
    header: string;
    card: string;
    hover: string;
  };
}

interface UsuarioSesion {
  id_usuario: number;
  username: string;
  email: string;
  nombre: string;
  apellido_paterno: string;
  apellido_materno: string | null;
  foto_perfil_url: string | null;
  rol: {
    id_rol: number;
    nombre: string;
    nivel_jerarquia: number;
  };
  secretaria?: {
    id_secretaria: number;
    id_centro: number;
    id_sucursal: number | null;
    id_departamento: number | null;
    extension_telefonica: string | null;
    estado: "activo" | "inactivo" | "suspendido" | "vacaciones";
    jornada: "completa" | "media" | "parcial";
    centro: {
      id_centro: number;
      nombre: string;
      logo_url: string | null;
      ciudad: string;
      region: string;
    };
    medicos_asignados: Array<{
      id_profesional: number;
      nombre_completo: string;
      especialidad: string;
      foto_url: string | null;
      es_principal: boolean;
      email: string;
      extension_telefonica?: string | null;
    }>;
  };
}

interface EstadisticasSecretaria {
  citas_programadas_hoy: number;
  citas_pendientes_confirmacion: number;
  citas_confirmadas_hoy: number;
  citas_canceladas_hoy: number;
  llamadas_realizadas_hoy: number;
  llamadas_pendientes: number;
  pacientes_atendidos_semana: number;
  pacientes_nuevos_mes: number;
  mensajes_sin_leer: number;
  recordatorios_enviados_hoy: number;
  medicos_activos: number;
  tareas_pendientes: number;
  documentos_procesados_semana: number;
  consultas_telemedicina_hoy: number;
}

type EstadoCitaAgenda =
  | "programada"
  | "confirmada"
  | "en_sala_espera"
  | "en_atencion"
  | "completada"
  | "cancelada"
  | "no_asistio"
  | "reprogramada"
  | string;

type PrioridadCitaAgenda = "normal" | "alta" | "urgente" | string;

interface PacienteAgenda {
  id_paciente: number;
  nombre_completo: string;
  rut?: string | null;
  telefono?: string | null;
  celular?: string | null;
  email?: string | null;
  foto_url?: string | null;
}

interface MedicoAgenda {
  id_profesional: number;
  nombre_completo: string;
  especialidad: string;
  foto_url?: string | null;
}

interface SalaAgenda {
  id_sala: number;
  nombre: string;
  tipo: string;
}

interface TipoCitaAgenda {
  id_tipo_cita: number;
  nombre: string;
  color: string;
  duracion_predeterminada: number;
}

interface CitaAgenda {
  id_cita: number;
  id_paciente: number;
  id_profesional: number;
  id_centro: number;
  id_sucursal: number | null;
  fecha_hora_inicio: string;
  fecha_hora_fin?: string;
  duracion_minutos: number;
  tipo_cita: string;
  motivo: string | null;
  estado: EstadoCitaAgenda;
  prioridad: PrioridadCitaAgenda;
  origen: string;
  sala?: SalaAgenda | null;
  paciente: PacienteAgenda;
  medico: MedicoAgenda;
  recordatorios_enviados?: number;
  confirmaciones_registradas?: number;
}

interface BloqueHorarioAgenda {
  id_bloque: number;
  id_centro: number;
  id_sucursal: number | null;
  id_profesional: number;
  fecha_inicio: string;
  fecha_fin: string;
  duracion_minutos: number;
  estado: "disponible" | "reservado" | "bloqueado" | "completado" | "no_disponible" | string;
  tipo_atencion: "presencial" | "telemedicina" | "ambos" | string;
  sala?: SalaAgenda | null;
  cupo_maximo?: number | null;
  cupo_actual: number;
}

// ====== TIPOS ESPECÍFICOS MÓDULO PACIENTES ======

interface CentroResumen {
  id_centro: number;
  nombre: string;
}

interface MedicoAsignadoPaciente {
  id_profesional: number;
  nombre_completo: string;
  especialidad: string;
  es_principal: boolean;
  rol_en_equipo?: "tratante" | "interconsultor" | "apoyo" | "telemedicina" | string;
  canal_preferido?: "email" | "telefono" | "whatsapp" | "ninguno" | string;
  email?: string | null;
  extension_telefonica?: string | null;
}

type RiesgoPaciente = "bajo" | "medio" | "alto" | "critico" | string;

interface PacienteListado extends PacienteAgenda {
  edad?: number | null;
  sexo?: string | null;
  riesgo?: RiesgoPaciente;
  centro_principal?: CentroResumen | null;
  proxima_cita?: string | null;
  ultima_cita?: string | null;
  medicos_principales?: MedicoAsignadoPaciente[];
  etiquetas?: string[];
}

interface PacienteDetalle extends PacienteListado {
  direccion?: string | null;
  comuna?: string | null;
  region?: string | null;
  telefono_emergencia?: string | null;
  contacto_emergencia?: string | null;
  alergias_resumen?: string | null;
  diagnosticos_relevantes?: string | null;
}

interface ValoracionMedicaResumen {
  id_valoracion: number;
  id_profesional: number;
  calificacion: number; // 1 a 5
  comentario?: string | null;
  anonimo?: boolean;
  fecha_valoracion: string;
  medico?: {
    id_profesional: number;
    nombre_completo: string;
    especialidad: string;
  };
}

interface ResumenDisponibilidadPaciente {
  total_disponible: number;
  hoy_disponible: number;
  proximos_7_dias: number;
}

interface NotificacionSecretaria {
  id_notificacion: number;
  tipo: "cita_nueva" | "cancelacion" | "urgente" | "mensaje" | "recordatorio";
  titulo: string;
  descripcion: string;
  fecha_hora: string;
  leida: boolean;
  prioridad: "baja" | "media" | "alta";
  url_accion: string | null;
}

interface MenuItem {
  titulo: string;
  icono: any;
  url: string;
  badge?: number;
  submenu?: MenuItem[];
  activo?: boolean;
}

// ========================================
// CONFIGURACIONES DE TEMAS
// ========================================

const TEMAS: Record<TemaColor, ConfiguracionTema> = {
  light: {
    nombre: "Claro",
    icono: Sun,
    colores: {
      fondo: "from-slate-50 via-blue-50 to-indigo-50",
      fondoSecundario: "bg-white",
      texto: "text-gray-900",
      textoSecundario: "text-gray-600",
      primario: "bg-indigo-600 hover:bg-indigo-700",
      secundario: "bg-gray-200 hover:bg-gray-300",
      acento: "text-indigo-600",
      borde: "border-gray-200",
      sombra: "shadow-xl shadow-indigo-100/50",
      gradiente: "from-indigo-500 via-purple-500 to-pink-500",
      sidebar: "bg-white/95 backdrop-blur-xl border-gray-200",
      header: "bg-white/80 backdrop-blur-xl border-gray-200",
      card: "bg-white border-gray-200 hover:border-indigo-300",
      hover: "hover:bg-gray-50",
    },
  },
  dark: {
    nombre: "Oscuro",
    icono: Activity,
    colores: {
      fondo: "from-slate-950 via-indigo-950 to-purple-950",
      fondoSecundario: "bg-gray-900",
      texto: "text-white",
      textoSecundario: "text-gray-400",
      primario: "bg-indigo-600 hover:bg-indigo-700",
      secundario: "bg-gray-800 hover:bg-gray-700",
      acento: "text-indigo-400",
      borde: "border-gray-800",
      sombra: "shadow-2xl shadow-indigo-500/20",
      gradiente: "from-indigo-500 via-purple-500 to-pink-500",
      sidebar: "bg-gray-900/95 backdrop-blur-xl border-gray-800",
      header: "bg-gray-900/80 backdrop-blur-xl border-gray-800",
      card: "bg-gray-800/50 border-gray-700 hover:border-indigo-500/50",
      hover: "hover:bg-gray-800",
    },
  },
  blue: {
    nombre: "Azul Océano",
    icono: Wifi,
    colores: {
      fondo: "from-blue-950 via-cyan-950 to-teal-950",
      fondoSecundario: "bg-blue-900",
      texto: "text-white",
      textoSecundario: "text-cyan-300",
      primario: "bg-cyan-600 hover:bg-cyan-700",
      secundario: "bg-blue-800 hover:bg-blue-700",
      acento: "text-cyan-400",
      borde: "border-cyan-800",
      sombra: "shadow-2xl shadow-cyan-500/20",
      gradiente: "from-cyan-500 via-blue-500 to-indigo-500",
      sidebar: "bg-blue-900/95 backdrop-blur-xl border-cyan-800",
      header: "bg-blue-900/80 backdrop-blur-xl border-cyan-800",
      card: "bg-blue-800/50 border-cyan-700 hover:border-cyan-500/50",
      hover: "hover:bg-blue-800",
    },
  },
  purple: {
    nombre: "Púrpura Real",
    icono: Sparkles,
    colores: {
      fondo: "from-purple-950 via-fuchsia-950 to-pink-950",
      fondoSecundario: "bg-purple-900",
      texto: "text-white",
      textoSecundario: "text-purple-300",
      primario: "bg-fuchsia-600 hover:bg-fuchsia-700",
      secundario: "bg-purple-800 hover:bg-purple-700",
      acento: "text-fuchsia-400",
      borde: "border-purple-800",
      sombra: "shadow-2xl shadow-fuchsia-500/20",
      gradiente: "from-fuchsia-500 via-purple-500 to-pink-500",
      sidebar: "bg-purple-900/95 backdrop-blur-xl border-purple-800",
      header: "bg-purple-900/80 backdrop-blur-xl border-purple-800",
      card: "bg-purple-800/50 border-purple-700 hover:border-fuchsia-500/50",
      hover: "hover:bg-purple-800",
    },
  },
  green: {
    nombre: "Verde Médico",
    icono: HeartPulse,
    colores: {
      fondo: "from-emerald-950 via-teal-950 to-cyan-950",
      fondoSecundario: "bg-emerald-900",
      texto: "text-white",
      textoSecundario: "text-emerald-300",
      primario: "bg-emerald-600 hover:bg-emerald-700",
      secundario: "bg-teal-800 hover:bg-teal-700",
      acento: "text-emerald-400",
      borde: "border-emerald-800",
      sombra: "shadow-2xl shadow-emerald-500/20",
      gradiente: "from-emerald-500 via-teal-500 to-cyan-500",
      sidebar: "bg-emerald-900/95 backdrop-blur-xl border-emerald-800",
      header: "bg-emerald-900/80 backdrop-blur-xl border-emerald-800",
      card: "bg-emerald-800/50 border-emerald-700 hover:border-emerald-500/50",
      hover: "hover:bg-emerald-800",
    },
  },
};

// ========================================
// FUNCIONES AUXILIARES DE FECHAS
// ========================================

const limpiarFecha = (fechaStr: string | undefined | null) => {
  if (!fechaStr) return null;
  const d = new Date(fechaStr);
  if (Number.isNaN(d.getTime())) return null;
  return d;
};

const formatearFechaLarga = (fecha: Date) =>
  new Intl.DateTimeFormat("es-CL", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(fecha);

const formatearFechaCorta = (fecha: Date) =>
  new Intl.DateTimeFormat("es-CL", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(fecha);

const formatearHora = (fecha: Date) =>
  new Intl.DateTimeFormat("es-CL", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(fecha);

// ========================================
// COMPONENTE PRINCIPAL
// ========================================

export default function PacientesSecretariaPage() {
  // ========================================
  // ESTADOS
  // ========================================

  // Usuario y sesión
  const [usuario, setUsuario] = useState<UsuarioSesion | null>(null);
  const [loading, setLoading] = useState(true);

  // Datos generales (para badges, notificaciones, etc.)
  const [estadisticas, setEstadisticas] = useState<EstadisticasSecretaria | null>(null);
  const [medicosAsignados, setMedicosAsignados] = useState<MedicoAsignadoPaciente[]>([]);
  const [notificaciones, setNotificaciones] = useState<NotificacionSecretaria[]>([]);

  // Pacientes
  const [pacientes, setPacientes] = useState<PacienteListado[]>([]);
  const [pacienteSeleccionado, setPacienteSeleccionado] = useState<PacienteDetalle | null>(null);
  const [loadingPacientes, setLoadingPacientes] = useState(true);
  const [loadingDetallePaciente, setLoadingDetallePaciente] = useState(false);

  // Citas y disponibilidad del paciente
  const [citasProximas, setCitasProximas] = useState<CitaAgenda[]>([]);
  const [historialCitas, setHistorialCitas] = useState<CitaAgenda[]>([]);
  const [bloquesDisponibilidad, setBloquesDisponibilidad] = useState<BloqueHorarioAgenda[]>([]);
  const [resumenDisponibilidad, setResumenDisponibilidad] =
    useState<ResumenDisponibilidadPaciente | null>(null);
  const [loadingDisponibilidad, setLoadingDisponibilidad] = useState(false);
  const [valoraciones, setValoraciones] = useState<ValoracionMedicaResumen[]>([]);

  // Paginación y filtros
  const [paginaActual, setPaginaActual] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [totalPacientes, setTotalPacientes] = useState(0);
  const [filtroCentro, setFiltroCentro] = useState<number | "todos">("todos");
  const [filtroRiesgo, setFiltroRiesgo] = useState<string>("todas");

  // UI States
  const [temaActual, setTemaActual] = useState<TemaColor>("light");
  const [sidebarAbierto, setSidebarAbierto] = useState(true);
  const [notificacionesAbiertas, setNotificacionesAbiertas] = useState(false);
  const [perfilAbierto, setPerfilAbierto] = useState(false);
  const [busqueda, setBusqueda] = useState("");
  const [seccionActiva] = useState("pacientes");
  const [menuExpandido, setMenuExpandido] = useState<string | null>(null);

  // Crear paciente rápido
  const [rutNuevo, setRutNuevo] = useState("");
  const [nombresNuevo, setNombresNuevo] = useState("");
  const [apellidosNuevo, setApellidosNuevo] = useState("");
  const [fechaNacimientoNuevo, setFechaNacimientoNuevo] = useState("");
  const [telefonoNuevo, setTelefonoNuevo] = useState("");
  const [celularNuevo, setCelularNuevo] = useState("");
  const [emailNuevo, setEmailNuevo] = useState("");
  const [creandoPaciente, setCreandoPaciente] = useState(false);

  // ========================================
  // TEMA ACTUAL
  // ========================================

  const tema = useMemo(() => TEMAS[temaActual], [temaActual]);

  // ========================================
  // MENU DE NAVEGACIÓN
  // ========================================

  const menuItems: MenuItem[] = [
    {
      titulo: "Dashboard",
      icono: Home,
      url: "/secretaria",
      activo: seccionActiva === "dashboard",
    },
    {
      titulo: "Agenda",
      icono: Calendar,
      url: "/secretaria/agenda",
      badge: estadisticas?.citas_programadas_hoy || 0,
      activo: seccionActiva === "agenda",
      submenu: [
        { titulo: "Ver Agenda", icono: CalendarDays, url: "/secretaria/agenda" },
        { titulo: "Nueva Cita", icono: CalendarPlus, url: "/secretaria/agenda/nueva" },
        { titulo: "Búsqueda Citas", icono: Search, url: "/secretaria/agenda/buscar" },
        { titulo: "Disponibilidad", icono: CalendarClock, url: "/secretaria/agenda/disponibilidad" },
      ],
    },
    {
      titulo: "Confirmaciones",
      icono: CheckSquare,
      url: "/secretaria/confirmaciones",
      badge: estadisticas?.citas_pendientes_confirmacion || 0,
      submenu: [
        { titulo: "Pendientes", icono: Clock, url: "/secretaria/confirmaciones/pendientes" },
        { titulo: "Confirmadas", icono: CheckCircle2, url: "/secretaria/confirmaciones/confirmadas" },
        { titulo: "Cancelaciones", icono: X, url: "/secretaria/confirmaciones/cancelaciones" },
      ],
    },
    {
      titulo: "Llamadas",
      icono: Phone,
      url: "/secretaria/llamadas",
      badge: estadisticas?.llamadas_pendientes || 0,
      submenu: [
        { titulo: "Por Realizar", icono: PhoneOutgoing, url: "/secretaria/llamadas/pendientes" },
        { titulo: "Realizadas", icono: PhoneIncoming, url: "/secretaria/llamadas/historial" },
        { titulo: "Registro", icono: ClipboardList, url: "/secretaria/llamadas/registro" },
      ],
    },
    {
      titulo: "Pacientes",
      icono: Users,
      url: "/secretaria/pacientes",
      badge: estadisticas?.pacientes_nuevos_mes || 0,
      activo: seccionActiva === "pacientes",
      submenu: [
        { titulo: "Todos", icono: Users, url: "/secretaria/pacientes" },
        { titulo: "Nuevo Paciente", icono: UserPlus, url: "/secretaria/pacientes/nuevo" },
        { titulo: "Búsqueda", icono: Search, url: "/secretaria/pacientes/buscar" },
        { titulo: "Atención Hoy", icono: CalendarCheck, url: "/secretaria/pacientes/hoy" },
      ],
    },
    {
      titulo: "Médicos",
      icono: Stethoscope,
      url: "/secretaria/medicos",
      submenu: [
        { titulo: "Mis Médicos", icono: UserCheck, url: "/secretaria/medicos" },
        { titulo: "Disponibilidad", icono: CalendarClock, url: "/secretaria/medicos/disponibilidad" },
        { titulo: "Contacto", icono: Phone, url: "/secretaria/medicos/contacto" },
      ],
    },
    {
      titulo: "Recordatorios",
      icono: Bell,
      url: "/secretaria/recordatorios",
      badge: estadisticas?.recordatorios_enviados_hoy || 0,
      submenu: [
        { titulo: "Programados", icono: Clock, url: "/secretaria/recordatorios/programados" },
        { titulo: "Enviados", icono: Send, url: "/secretaria/recordatorios/enviados" },
        { titulo: "Configuración", icono: Settings, url: "/secretaria/recordatorios/config" },
      ],
    },
    {
      titulo: "Documentos",
      icono: FileText,
      url: "/secretaria/documentos",
      badge: estadisticas?.documentos_procesados_semana || 0,
      submenu: [
        { titulo: "Gestión", icono: FileText, url: "/secretaria/documentos" },
        { titulo: "Certificados", icono: Award, url: "/secretaria/documentos/certificados" },
        { titulo: "Recetas", icono: Pill, url: "/secretaria/documentos/recetas" },
        { titulo: "Órdenes", icono: ClipboardList, url: "/secretaria/documentos/ordenes" },
      ],
    },
    {
      titulo: "Mensajes",
      icono: MessageSquare,
      url: "/secretaria/mensajes",
      badge: estadisticas?.mensajes_sin_leer || 0,
      submenu: [
        { titulo: "Bandeja", icono: Mail, url: "/secretaria/mensajes" },
        { titulo: "WhatsApp", icono: MessageSquare, url: "/secretaria/mensajes/whatsapp" },
        { titulo: "SMS", icono: Phone, url: "/secretaria/mensajes/sms" },
        { titulo: "Email", icono: Mail, url: "/secretaria/mensajes/email" },
      ],
    },
    {
      titulo: "Telemedicina",
      icono: Video,
      url: "/secretaria/telemedicina",
      badge: estadisticas?.consultas_telemedicina_hoy || 0,
      submenu: [
        { titulo: "Sala Espera", icono: Clock, url: "/secretaria/telemedicina/espera" },
        { titulo: "Programadas", icono: CalendarCheck, url: "/secretaria/telemedicina/programadas" },
        { titulo: "Asistencia", icono: Settings, url: "/secretaria/telemedicina/asistencia" },
      ],
    },
    {
      titulo: "Reportes",
      icono: BarChart3,
      url: "/secretaria/reportes",
      submenu: [
        { titulo: "Mis Métricas", icono: TrendingUp, url: "/secretaria/reportes/metricas" },
        { titulo: "Citas", icono: Calendar, url: "/secretaria/reportes/citas" },
        { titulo: "Llamadas", icono: Phone, url: "/secretaria/reportes/llamadas" },
        { titulo: "Rendimiento", icono: Target, url: "/secretaria/reportes/rendimiento" },
      ],
    },
    {
      titulo: "Mi Perfil",
      icono: User,
      url: "/secretaria/perfil",
      submenu: [
        { titulo: "Información Personal", icono: User, url: "/secretaria/perfil" },
        { titulo: "Horarios", icono: Clock, url: "/secretaria/perfil/horarios" },
        { titulo: "Preferencias", icono: Settings, url: "/secretaria/perfil/preferencias" },
      ],
    },
    {
      titulo: "Configuración",
      icono: Settings,
      url: "/secretaria/configuracion",
      submenu: [
        { titulo: "General", icono: Settings, url: "/secretaria/configuracion/general" },
        { titulo: "Notificaciones", icono: Bell, url: "/secretaria/configuracion/notificaciones" },
        { titulo: "Seguridad", icono: Shield, url: "/secretaria/configuracion/seguridad" },
        { titulo: "Temas", icono: Sparkles, url: "/secretaria/configuracion/temas" },
      ],
    },
  ];

  // ========================================
  // EFECTOS
  // ========================================

  useEffect(() => {
    cargarDatosUsuario();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (usuario?.secretaria) {
      cargarDatosDashboard();
      cargarPacientes();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [usuario, filtroCentro, paginaActual]);

  useEffect(() => {
    document.body.className = `bg-gradient-to-br ${tema.colores.fondo} min-h-screen transition-all duration-500`;
  }, [tema]);

  useEffect(() => {
    const cargarPreferenciaTema = async () => {
      try {
        const res = await fetch("/api/users/preferencias/tema", {
          method: "GET",
          credentials: "include",
        });
        const data = await res.json();
        if (data.success && data.tema_color) {
          setTemaActual(data.tema_color);
          localStorage.setItem("tema_secretaria", data.tema_color);
        }
      } catch (e) {
        console.error("No se pudo cargar la preferencia de tema:", e);
      }
    };

    cargarPreferenciaTema();
  }, []);

  // ========================================
  // CARGA DE DATOS
  // ========================================

  const cargarDatosUsuario = async () => {
    try {
      setLoading(true);

      const response = await fetch("/api/auth/session", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("No hay sesión activa");
      }

      const result = await response.json();

      if (result.success && result.usuario) {
        const rolesUsuario: string[] = [];

        if (result.usuario.rol) {
          rolesUsuario.push(
            result.usuario.rol.nombre
              ?.normalize("NFD")
              .replace(/[\u0300-\u036f]/g, "")
              .trim()
              .toUpperCase()
          );
        }

        if (Array.isArray(result.usuario.roles)) {
          result.usuario.roles.forEach((r: any) => {
            if (r?.nombre) {
              rolesUsuario.push(
                r.nombre
                  .normalize("NFD")
                  .replace(/[\u0300-\u036f]/g, "")
                  .trim()
                  .toUpperCase()
              );
            }
          });
        }

        const tieneRolSecretaria = rolesUsuario.some((rol) => rol.includes("SECRETARIA"));

        if (!tieneRolSecretaria) {
          alert(
            `Acceso denegado. Este módulo de pacientes es solo para secretarias. Tus roles actuales son: ${rolesUsuario.join(
              ", "
            )}`
          );
          window.location.href = "/";
          return;
        }

        if (!result.usuario.secretaria) {
          alert(
            "Tu usuario tiene rol de SECRETARIA pero no está vinculado a un registro de secretaria. Contacta al administrador."
          );
          window.location.href = "/";
          return;
        }

        setUsuario(result.usuario);
      } else {
        window.location.href = "/login";
      }
    } catch (error) {
      console.error("Error al cargar usuario:", error);
      alert("Error al verificar sesión. Serás redirigido al login.");
      window.location.href = "/login";
    } finally {
      setLoading(false);
    }
  };

  const cargarDatosDashboard = async () => {
    if (!usuario?.secretaria?.id_secretaria) return;

    try {
      const res = await fetch(
        `/api/secretaria/dashboard?id_secretaria=${usuario.secretaria.id_secretaria}`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        }
      );

      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data.success) {
        console.error("Respuesta del dashboard:", data);
        return;
      }

      setEstadisticas(data.estadisticas || null);
      setMedicosAsignados(data.medicos_asignados || []);
      setNotificaciones(data.notificaciones || []);
    } catch (err) {
      console.error("Error al cargar dashboard:", err);
    }
  };

  const cargarPacientes = async () => {
    if (!usuario?.secretaria?.id_secretaria) return;

    try {
      setLoadingPacientes(true);

      const params = new URLSearchParams();
      params.append("id_secretaria", String(usuario.secretaria.id_secretaria));
      params.append("page", String(paginaActual));
      params.append("per_page", "20");
      if (filtroCentro !== "todos") {
        params.append("id_centro", String(filtroCentro));
      }

      const res = await fetch(`/api/secretaria/pacientes?${params.toString()}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data.success) {
        console.error("Respuesta pacientes:", data);
        return;
      }

      const lista: PacienteListado[] = data.pacientes || [];
      setPacientes(lista);
      setTotalPacientes(data.total || lista.length || 0);
      setTotalPaginas(data.total_pages || 1);

      // Seleccionar automáticamente el primero si no hay uno seleccionado
      if (!pacienteSeleccionado && lista.length > 0) {
        const primero = lista[0];
        setPacienteSeleccionado(primero as PacienteDetalle);
        cargarDetallePaciente(primero.id_paciente);
      }
    } catch (err) {
      console.error("Error al cargar pacientes:", err);
    } finally {
      setLoadingPacientes(false);
    }
  };

  const cargarDetallePaciente = async (idPaciente: number) => {
    if (!usuario?.secretaria?.id_secretaria) return;

    try {
      setLoadingDetallePaciente(true);

      const params = new URLSearchParams();
      params.append("id_secretaria", String(usuario.secretaria.id_secretaria));

      const res = await fetch(
        `/api/secretaria/pacientes/${idPaciente}?${params.toString()}`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        }
      );

      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data.success) {
        console.error("Detalle paciente:", data);
        return;
      }

      if (data.paciente) {
        setPacienteSeleccionado(data.paciente as PacienteDetalle);
      }

      setCitasProximas(data.citas_proximas || []);
      setHistorialCitas(data.historial_citas || []);
      setValoraciones(data.valoraciones || []);
      setBloquesDisponibilidad([]);
      setResumenDisponibilidad(null);

      // Cargar disponibilidad ligada a sus médicos/centro
      cargarDisponibilidadPaciente(idPaciente);
    } catch (err) {
      console.error("Error al cargar detalle de paciente:", err);
    } finally {
      setLoadingDetallePaciente(false);
    }
  };

  const cargarDisponibilidadPaciente = async (idPaciente: number) => {
    if (!usuario?.secretaria?.id_secretaria) return;

    try {
      setLoadingDisponibilidad(true);

      const params = new URLSearchParams();
      params.append("id_secretaria", String(usuario.secretaria.id_secretaria));
      params.append("id_paciente", String(idPaciente));

      const res = await fetch(
        `/api/secretaria/pacientes/disponibilidad?${params.toString()}`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        }
      );

      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data.success) {
        console.error("Disponibilidad paciente:", data);
        return;
      }

      const bloques: BloqueHorarioAgenda[] = data.bloques || [];
      setBloquesDisponibilidad(bloques);

      setResumenDisponibilidad({
        total_disponible:
          data.total_disponible ?? (Array.isArray(bloques) ? bloques.length : 0),
        hoy_disponible: data.hoy_disponible ?? 0,
        proximos_7_dias: data.proximos_7_dias ?? 0,
      });
    } catch (err) {
      console.error("Error al cargar disponibilidad del paciente:", err);
    } finally {
      setLoadingDisponibilidad(false);
    }
  };

  // ========================================
  // ACCIONES
  // ========================================

  const cerrarSesion = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });

      window.location.href = "/login";
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  const cambiarTema = async (nuevoTema: TemaColor) => {
    setTemaActual(nuevoTema);
    if (typeof window !== "undefined") {
      localStorage.setItem("tema_secretaria", nuevoTema);
    }

    try {
      await fetch("/api/users/preferencias/tema", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ tema_color: nuevoTema }),
      });
    } catch (err) {
      console.error("No se pudo guardar preferencia en BD:", err);
    }
  };

  const obtenerSaludo = () => {
    const hora = new Date().getHours();
    if (hora < 12) return "Buenos días";
    if (hora < 19) return "Buenas tardes";
    return "Buenas noches";
  };

  const formatearFechaTexto = (fechaStr: string | null | undefined) => {
    const d = limpiarFecha(fechaStr);
    if (!d) return "-";
    return `${formatearFechaCorta(d)} • ${formatearHora(d)}`;
  };

  const obtenerColorRiesgo = (riesgo?: RiesgoPaciente) => {
    if (!riesgo) return "bg-gray-100 text-gray-800 border-gray-200";
    const r = riesgo.toString().toLowerCase();

    const isDark = ["dark", "blue", "purple", "green"].includes(temaActual);

    if (r === "bajo") {
      return isDark
        ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/30"
        : "bg-emerald-100 text-emerald-800 border-emerald-200";
    }
    if (r === "medio") {
      return isDark
        ? "bg-yellow-500/15 text-yellow-300 border-yellow-500/30"
        : "bg-yellow-100 text-yellow-800 border-yellow-200";
    }
    if (r === "alto") {
      return isDark
        ? "bg-orange-500/15 text-orange-300 border-orange-500/30"
        : "bg-orange-100 text-orange-800 border-orange-200";
    }
    if (r === "critico" || r === "crítico") {
      return isDark
        ? "bg-red-500/20 text-red-300 border-red-500/30"
        : "bg-red-100 text-red-800 border-red-200";
    }

    return isDark
      ? "bg-gray-500/20 text-gray-300 border-gray-500/30"
      : "bg-gray-100 text-gray-800 border-gray-200";
  };

  const obtenerColorPrioridad = (prioridad: string) => {
    const isDark = ["dark", "blue", "purple", "green"].includes(temaActual);
    const colores: { [key: string]: string } = {
      urgente: isDark
        ? "bg-red-500/20 text-red-400 border-red-500/30"
        : "bg-red-100 text-red-800 border-red-200",
      alta: isDark
        ? "bg-orange-500/20 text-orange-400 border-orange-500/30"
        : "bg-orange-100 text-orange-800 border-orange-200",
      normal: isDark
        ? "bg-blue-500/20 text-blue-400 border-blue-500/30"
        : "bg-blue-100 text-blue-800 border-blue-200",
    };

    return (
      colores[prioridad.toLowerCase()] ||
      (isDark
        ? "bg-gray-500/20 text-gray-400 border-gray-500/30"
        : "bg-gray-100 text-gray-800 border-gray-200")
    );
  };

  const manejarCrearPacienteRapido = async (e: any) => {
    e.preventDefault();
    if (!usuario?.secretaria) return;

    if (!rutNuevo.trim() || !nombresNuevo.trim() || !apellidosNuevo.trim()) {
      alert("Completa al menos RUT, nombres y apellidos para crear el paciente.");
      return;
    }

    try {
      setCreandoPaciente(true);

      const payload = {
        id_secretaria: usuario.secretaria.id_secretaria,
        rut: rutNuevo.trim(),
        nombres: nombresNuevo.trim(),
        apellidos: apellidosNuevo.trim(),
        fecha_nacimiento: fechaNacimientoNuevo || null,
        telefono: telefonoNuevo || null,
        celular: celularNuevo || null,
        email: emailNuevo || null,
      };

      const res = await fetch("/api/secretaria/pacientes/crear-rapido", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data.success) {
        console.error("Error al crear paciente rápido:", data);
        alert(data.message || "No se pudo crear el paciente.");
        return;
      }

      alert("Paciente creado correctamente.");

      setRutNuevo("");
      setNombresNuevo("");
      setApellidosNuevo("");
      setFechaNacimientoNuevo("");
      setTelefonoNuevo("");
      setCelularNuevo("");
      setEmailNuevo("");
      setPaginaActual(1);

      await cargarPacientes();

      const idNuevo =
        data.id_paciente || (data.paciente && data.paciente.id_paciente) || null;
      if (idNuevo) {
        await cargarDetallePaciente(Number(idNuevo));
      }
    } catch (error) {
      console.error("Error en crear paciente rápido:", error);
      alert("Error inesperado al crear el paciente.");
    } finally {
      setCreandoPaciente(false);
    }
  };

  const marcarNotificacionLeida = async (idNotificacion: number) => {
    try {
      const response = await fetch(
        `/api/secretaria/notificaciones/${idNotificacion}/leer`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        }
      );

      if (response.ok) {
        setNotificaciones((prev) =>
          prev.map((notif) =>
            notif.id_notificacion === idNotificacion
              ? { ...notif, leida: true }
              : notif
          )
        );
      }
    } catch (error) {
      console.error("Error al marcar notificación como leída:", error);
    }
  };

  // ========================================
  // DERIVADOS (PACIENTES / DISPONIBILIDAD)
  // ========================================

  const pacientesFiltrados = useMemo(() => {
    let lista = [...pacientes];

    if (filtroCentro !== "todos") {
      lista = lista.filter(
        (p) => p.centro_principal && p.centro_principal.id_centro === filtroCentro
      );
    }

    if (filtroRiesgo !== "todas") {
      const r = filtroRiesgo.toLowerCase();
      lista = lista.filter(
        (p) => (p.riesgo || "").toString().toLowerCase() === r
      );
    }

    if (busqueda.trim()) {
      const q = busqueda.trim().toLowerCase();
      lista = lista.filter((p) => {
        const medicoPrincipal = p.medicos_principales?.find((m) => m.es_principal);
        return (
          p.nombre_completo.toLowerCase().includes(q) ||
          (p.rut || "").toLowerCase().includes(q) ||
          (p.telefono || "").toLowerCase().includes(q) ||
          (p.celular || "").toLowerCase().includes(q) ||
          (p.email || "").toLowerCase().includes(q) ||
          (medicoPrincipal?.nombre_completo || "").toLowerCase().includes(q)
        );
      });
    }

    return lista;
  }, [pacientes, filtroCentro, filtroRiesgo, busqueda]);

  const resumenPacientes = useMemo(() => {
    const total = totalPacientes || pacientes.length;
    const conProximaCita = pacientes.filter((p) => p.proxima_cita).length;
    const riesgoAltoOCritico = pacientes.filter((p) => {
      const r = (p.riesgo || "").toString().toLowerCase();
      return r === "alto" || r === "critico" || r === "crítico";
    }).length;
    const asignaciones = pacientes.reduce((acc, p) => {
      return acc + (p.medicos_principales ? p.medicos_principales.length : 0);
    }, 0);

    return {
      total,
      conProximaCita,
      riesgoAltoOCritico,
      asignaciones,
    };
  }, [pacientes, totalPacientes]);

  const promedioValoraciones = useMemo(() => {
    if (!valoraciones.length) return null;
    const suma = valoraciones.reduce((acc, v) => acc + Number(v.calificacion || 0), 0);
    return (suma / valoraciones.length).toFixed(1);
  }, [valoraciones]);

  // ========================================
  // RENDER - LOADING / ACCESO
  // ========================================

  if (loading) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center bg-gradient-to-br ${tema.colores.fondo}`}
      >
        <div className="text-center">
          <div className="relative mb-8">
            <div className="w-32 h-32 border-4 border-indigo-400 border-t-transparent rounded-full animate-spin"></div>
            <div
              className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-20 h-20 bg-gradient-to-br ${tema.colores.gradiente} rounded-full flex items-center justify-center animate-pulse`}
            >
              <Users className="w-10 h-10 text-white" />
            </div>
          </div>
          <h2 className={`text-4xl font-black mb-4 ${tema.colores.texto}`}>
            Cargando Pacientes
          </h2>
          <p
            className={`text-lg font-semibold ${tema.colores.textoSecundario} animate-pulse`}
          >
            Preparando tu panel maestro de pacientes...
          </p>
        </div>
      </div>
    );
  }

  if (!usuario || !usuario.secretaria) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center bg-gradient-to-br ${tema.colores.fondo}`}
      >
        <div
          className={`text-center max-w-md mx-auto p-8 rounded-3xl ${tema.colores.card} ${tema.colores.sombra} ${tema.colores.borde} border`}
        >
          <div
            className={`w-24 h-24 bg-gradient-to-br ${tema.colores.gradiente} rounded-3xl flex items-center justify-center mx-auto mb-6 animate-pulse`}
          >
            <AlertTriangle className="w-12 h-12 text-white" />
          </div>
          <h2 className={`text-3xl font-black mb-4 ${tema.colores.texto}`}>
            Acceso No Autorizado
          </h2>
          <p className={`text-lg mb-8 ${tema.colores.textoSecundario}`}>
            No tienes permisos para acceder al módulo de pacientes.
          </p>
          <Link
            href="/login"
            className={`inline-flex items-center gap-3 px-8 py-4 ${tema.colores.primario} text-white rounded-2xl font-bold text-lg transition-all duration-300 hover:scale-105 ${tema.colores.sombra}`}
          >
            <LogOut className="w-5 h-5" />
            Ir al Login
          </Link>
        </div>
      </div>
    );
  }

  // ========================================
  // RENDER
  // ========================================

  return (
    <div
      className={`min-h-screen transition-all duration-500 bg-gradient-to-br ${tema.colores.fondo}`}
    >
      {/* SIDEBAR */}
      <aside
        className={`fixed left-0 top-0 h-full z-50 transition-all duration-300 ${
          sidebarAbierto ? "w-72" : "w-20"
        } ${tema.colores.sidebar} ${tema.colores.borde} border-r ${tema.colores.sombra}`}
      >
        <div className="flex flex-col h-full">
          {/* Logo y Toggle */}
          <div className="flex items-center justify-between p-6 border-b border-gray-700/50">
            {sidebarAbierto ? (
              <div className="flex items-center gap-3">
                <div
                  className={`w-12 h-12 bg-gradient-to-br ${tema.colores.gradiente} rounded-xl flex items-center justify-center shadow-lg`}
                >
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className={`text-xl font-black ${tema.colores.texto}`}>
                    AnyssaMed
                  </h1>
                  <p className={`text-xs font-semibold ${tema.colores.acento}`}>
                    Pacientes & Citas
                  </p>
                </div>
              </div>
            ) : (
              <div
                className={`w-12 h-12 bg-gradient-to-br ${tema.colores.gradiente} rounded-xl flex items-center justify-center shadow-lg mx-auto`}
              >
                <Users className="w-6 h-6 text-white" />
              </div>
            )}

            <button
              onClick={() => setSidebarAbierto(!sidebarAbierto)}
              className={`p-2 rounded-lg ${tema.colores.hover} transition-colors ${
                !sidebarAbierto && "mx-auto mt-4"
              }`}
            >
              <ChevronRight
                className={`w-5 h-5 ${tema.colores.texto} transition-transform ${
                  sidebarAbierto ? "rotate-180" : ""
                }`}
              />
            </button>
          </div>

          {/* Menú de Navegación */}
          <nav className="flex-1 overflow-y-auto py-6 px-3 custom-scrollbar">
            {menuItems.map((item, index) => (
              <div key={index} className="mb-1">
                <Link
                  href={item.url}
                  className={`flex items-center justify-between gap-3 px-4 py-3 rounded-xl font-semibold transition-all duración-300 group ${
                    item.activo
                      ? `bg-gradient-to-r ${tema.colores.gradiente} text-white ${tema.colores.sombra}`
                      : `${tema.colores.hover} ${tema.colores.texto}`
                  }`}
                  onClick={() => {
                    if (item.submenu) {
                      setMenuExpandido(
                        menuExpandido === item.titulo ? null : item.titulo
                      );
                    }
                  }}
                  onMouseEnter={() => item.submenu && setSidebarAbierto(true)}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <item.icono
                      className={`w-5 h-5 flex-shrink-0 ${
                        item.activo ? "text-white" : tema.colores.acento
                      }`}
                    />
                    {sidebarAbierto && (
                      <span className="truncate">{item.titulo}</span>
                    )}
                  </div>

                  {sidebarAbierto && item.badge && item.badge > 0 && (
                    <span
                      className={`px-2 py-1 text-xs font-bold rounded-full ${
                        item.activo
                          ? "bg-white/20 text-white"
                          : "bg-red-500 text-white"
                      }`}
                    >
                      {item.badge > 99 ? "99+" : item.badge}
                    </span>
                  )}

                  {sidebarAbierto && item.submenu && (
                    <ChevronDown
                      className={`w-4 h-4 transition-transform ${
                        menuExpandido === item.titulo ? "rotate-180" : ""
                      }`}
                    />
                  )}
                </Link>

                {/* Submenú */}
                {sidebarAbierto &&
                  item.submenu &&
                  menuExpandido === item.titulo && (
                    <div className="mt-2 ml-4 space-y-1">
                      {item.submenu.map((subitem, subindex) => (
                        <Link
                          key={subindex}
                          href={subitem.url}
                          className={`flex items-center gap-3 px-4 py-2 rounded-lg font-medium text-sm transition-all duración-300 ${tema.colores.hover} ${tema.colores.textoSecundario} hover:${tema.colores.acento}`}
                        >
                          <subitem.icono className="w-4 h-4" />
                          <span>{subitem.titulo}</span>
                        </Link>
                      ))}
                    </div>
                  )}
              </div>
            ))}
          </nav>

          {/* Usuario Info Bottom */}
          <div className={`p-4 border-t ${tema.colores.borde}`}>
            {sidebarAbierto ? (
              <div className="flex items-center gap-3">
                <div
                  className={`w-12 h-12 rounded-xl bg-gradient-to-br ${tema.colores.gradiente} flex items-center justify-center text-white font-bold shadow-lg`}
                >
                  {usuario.foto_perfil_url ? (
                    <Image
                      src={usuario.foto_perfil_url}
                      alt={usuario.nombre}
                      width={48}
                      height={48}
                      className="rounded-xl object-cover"
                    />
                  ) : (
                    `${usuario.nombre[0]}${usuario.apellido_paterno[0]}`
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p
                    className={`text-sm font-bold truncate ${tema.colores.texto}`}
                  >
                    {usuario.nombre} {usuario.apellido_paterno}
                  </p>
                  <p
                    className={`text-xs font-medium truncate ${tema.colores.textoSecundario}`}
                  >
                    Secretaria
                  </p>
                </div>
              </div>
            ) : (
              <div
                className={`w-12 h-12 rounded-xl bg-gradient-to-br ${tema.colores.gradiente} flex items-center justify-center text-white font-bold shadow-lg mx-auto`}
              >
                {usuario.foto_perfil_url ? (
                  <Image
                    src={usuario.foto_perfil_url}
                    alt={usuario.nombre}
                    width={48}
                    height={48}
                    className="rounded-xl object-cover"
                  />
                ) : (
                  `${usuario.nombre[0]}${usuario.apellido_paterno[0]}`
                )}
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* HEADER */}
      <header
        className={`fixed top-0 right-0 z-40 transition-all duration-300 ${
          sidebarAbierto ? "left-72" : "left-20"
        } ${tema.colores.header} ${tema.colores.borde} border-b ${tema.colores.sombra}`}
      >
        <div className="flex items-center justify-between px-8 py-4">
          {/* Búsqueda */}
          <div className="flex-1 max-w-2xl">
            <div className="relative">
              <Search
                className={`absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 ${tema.colores.textoSecundario}`}
              />
              <input
                type="text"
                placeholder="Buscar paciente por nombre, RUT, teléfono, email..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className={`w-full pl-12 pr-4 py-3 rounded-xl ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto} placeholder:${tema.colores.textoSecundario} focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all duration-300`}
              />
              {busqueda && (
                <button
                  onClick={() => setBusqueda("")}
                  className={`absolute right-4 top-1/2 transform -translate-y-1/2 p-1 rounded-lg ${tema.colores.hover}`}
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Acciones Header */}
          <div className="flex items-center gap-3 ml-6">
            {/* Selector de Temas */}
            <div className="relative group">
              <button
                className={`p-3 rounded-xl font-semibold transition-all duration-300 ${tema.colores.secundario} ${tema.colores.texto}`}
              >
                <Sparkles className="w-5 h-5" />
              </button>

              <div
                className={`absolute right-0 mt-2 w-64 rounded-2xl ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 p-4 space-y-2`}
              >
                <p className={`text-sm font-bold mb-3 ${tema.colores.texto}`}>
                  Seleccionar Tema
                </p>
                {Object.entries(TEMAS).map(([key, t]) => (
                  <button
                    key={key}
                    onClick={() => cambiarTema(key as TemaColor)}
                    className={`w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl font-semibold transition-all duration-300 ${
                      temaActual === key
                        ? `bg-gradient-to-r ${t.colores.gradiente} text-white`
                        : `${tema.colores.hover} ${tema.colores.texto}`
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <t.icono className="w-5 h-5" />
                      <span>{t.nombre}</span>
                    </div>
                    {temaActual === key && <Check className="w-5 h-5" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Notificaciones */}
            <div className="relative">
              <button
                onClick={() =>
                  setNotificacionesAbiertas(!notificacionesAbiertas)
                }
                className={`relative p-3 rounded-xl font-semibold transition-all duration-300 ${tema.colores.secundario} ${tema.colores.texto}`}
              >
                <Bell className="w-5 h-5" />
                {notificaciones.filter((n) => !n.leida).length > 0 && (
                  <span className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center animate-pulse">
                    {notificaciones.filter((n) => !n.leida).length > 9
                      ? "9+"
                      : notificaciones.filter((n) => !n.leida).length}
                  </span>
                )}
              </button>

              {/* Dropdown Notificaciones */}
              {notificacionesAbiertas && (
                <div
                  className={`absolute right-0 mt-2 w-96 rounded-2xl ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} max-h-96 overflow-y-auto`}
                >
                  <div
                    className={`p-4 border-b ${tema.colores.borde} sticky top-0 ${tema.colores.card}`}
                  >
                    <div className="flex items-center justify-between">
                      <h3
                        className={`text-lg font-black ${tema.colores.texto}`}
                      >
                        Notificaciones
                      </h3>
                      <button
                        className={`text-sm font-semibold ${tema.colores.acento} hover:underline`}
                      >
                        Marcar todas leídas
                      </button>
                    </div>
                  </div>

                  {notificaciones.length === 0 ? (
                    <div className="p-8 text-center">
                      <BellOff
                        className={`w-12 h-12 mx-auto mb-3 ${tema.colores.textoSecundario}`}
                      />
                      <p
                        className={`text-sm ${tema.colores.textoSecundario}`}
                      >
                        No tienes notificaciones nuevas
                      </p>
                    </div>
                  ) : (
                    <div className={`divide-y ${tema.colores.borde}`}>
                      {notificaciones.slice(0, 8).map((notif) => (
                        <div
                          key={notif.id_notificacion}
                          className={`p-4 ${tema.colores.hover} transition-colors cursor-pointer ${
                            !notif.leida ? "bg-indigo-500/5" : ""
                          }`}
                          onClick={() =>
                            marcarNotificacionLeida(notif.id_notificacion)
                          }
                        >
                          <div className="flex items-start gap-3">
                            <div
                              className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${obtenerColorPrioridad(
                                notif.prioridad
                              )}`}
                            >
                              <Bell className="w-5 h-5" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p
                                className={`text-sm font-bold mb-1 ${tema.colores.texto}`}
                              >
                                {notif.titulo}
                              </p>
                              <p
                                className={`text-xs mb-2 ${tema.colores.textoSecundario}`}
                              >
                                {notif.descripcion}
                              </p>
                              <p
                                className={`text-xs font-medium ${tema.colores.textoSecundario}`}
                              >
                                {formatearFechaTexto(notif.fecha_hora)}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {notificaciones.length > 8 && (
                    <div
                      className={`p-4 border-t ${tema.colores.borde} text-center`}
                    >
                      <Link
                        href="/secretaria/notificaciones"
                        className={`text-sm font-bold ${tema.colores.acento} hover:underline`}
                      >
                        Ver todas las notificaciones
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Perfil Usuario */}
            <div className="relative">
              <button
                onClick={() => setPerfilAbierto(!perfilAbierto)}
                className={`flex items-center gap-3 px-4 py-2 rounded-xl transition-all duration-300 ${tema.colores.hover}`}
              >
                <div className="text-right hidden md:block">
                  <p className={`text-sm font-bold ${tema.colores.texto}`}>
                    {usuario.nombre} {usuario.apellido_paterno}
                  </p>
                  <p className={`text-xs ${tema.colores.textoSecundario}`}>
                    Secretaria
                  </p>
                </div>
                <div
                  className={`w-10 h-10 rounded-xl bg-gradient-to-br ${tema.colores.gradiente} flex items-center justify-center text-white font-bold shadow-lg`}
                >
                  {usuario.foto_perfil_url ? (
                    <Image
                      src={usuario.foto_perfil_url}
                      alt={usuario.nombre}
                      width={40}
                      height={40}
                      className="rounded-xl object-cover"
                    />
                  ) : (
                    `${usuario.nombre[0]}${usuario.apellido_paterno[0]}`
                  )}
                </div>
                <ChevronDown
                  className={`w-4 h-4 ${tema.colores.texto} transition-transform ${
                    perfilAbierto ? "rotate-180" : ""
                  }`}
                />
              </button>

              {/* Dropdown Perfil */}
              {perfilAbierto && (
                <div
                  className={`absolute right-0 mt-2 w-80 rounded-2xl ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} p-4`}
                >
                  <div className="flex items-center gap-4 mb-4 pb-4 border-b border-gray-700/50">
                    <div
                      className={`w-16 h-16 rounded-xl bg-gradient-to-br ${tema.colores.gradiente} flex items-center justify-center text-white font-bold text-xl shadow-lg`}
                    >
                      {usuario.foto_perfil_url ? (
                        <Image
                          src={usuario.foto_perfil_url}
                          alt={usuario.nombre}
                          width={64}
                          height={64}
                          className="rounded-xl object-cover"
                        />
                      ) : (
                        `${usuario.nombre[0]}${usuario.apellido_paterno[0]}`
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p
                        className={`text-lg font-black ${tema.colores.texto}`}
                      >
                        {usuario.nombre} {usuario.apellido_paterno}
                      </p>
                      <p
                        className={`text-sm font-medium ${tema.colores.textoSecundario} mb-1`}
                      >
                        Secretaria
                      </p>
                      <p
                        className={`text-xs font-medium ${tema.colores.textoSecundario}`}
                      >
                        {usuario?.secretaria?.centro?.nombre ?? "Centro no asignado"}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Link
                      href="/secretaria/perfil"
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all duración-300 ${tema.colores.hover} ${tema.colores.texto}`}
                    >
                      <User className="w-5 h-5" />
                      <span>Mi Perfil</span>
                    </Link>
                    <Link
                      href="/secretaria/configuracion"
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all duración-300 ${tema.colores.hover} ${tema.colores.texto}`}
                    >
                      <Settings className="w-5 h-5" />
                      <span>Configuración</span>
                    </Link>
                    <Link
                      href="/secretaria/ayuda"
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all duración-300 ${tema.colores.hover} ${tema.colores.texto}`}
                    >
                      <Lightbulb className="w-5 h-5" />
                      <span>Ayuda</span>
                    </Link>
                    <button
                      onClick={cerrarSesion}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all duración-300 ${tema.colores.hover} text-red-500 hover:text-red-400`}
                    >
                      <LogOut className="w-5 h-5" />
                      <span>Cerrar Sesión</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* CONTENIDO PRINCIPAL */}
      <main
        className={`transition-all duration-300 ${
          sidebarAbierto ? "ml-72" : "ml-20"
        } pt-24 p-8`}
      >
        {/* Saludo y resumen encabezado */}
        <div className="mb-8 flex flex-col xl:flex-row gap-6 xl:items-center xl:justify-between">
          <div>
            <h2
              className={`text-4xl xl:text-5xl font-black mb-2 ${tema.colores.texto} flex items-center gap-3`}
            >
              {obtenerSaludo()}, {usuario.nombre}
              <span className="animate-wave inline-block">🧑‍⚕️</span>
            </h2>
            <p
              className={`text-lg xl:text-xl font-semibold ${tema.colores.textoSecundario}`}
            >
              Panel maestro de{" "}
              <span className="font-bold">
                pacientes y disponibilidad de citas
              </span>{" "}
              en{" "}
              <span className="font-bold">
                {usuario?.secretaria?.centro?.nombre ?? "Centro no asignado"}
              </span>
              .
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3">
            {/* Filtro centro rápido */}
            <div
              className={`flex items-center rounded-2xl p-1 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra}`}
            >
              <select
                value={filtroCentro}
                onChange={(e) =>
                  setFiltroCentro(
                    e.target.value === "todos"
                      ? "todos"
                      : Number(e.target.value)
                  )
                }
                className={`px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-transparent ${tema.colores.texto}`}
              >
                <option value="todos">Todos mis centros</option>
                {usuario.secretaria.centro && (
                  <option
                    value={usuario.secretaria.centro.id_centro}
                  >
                    {usuario.secretaria.centro.nombre} (principal)
                  </option>
                )}
              </select>
            </div>

            {/* Filtro riesgo rápido */}
            <div
              className={`flex items-center rounded-2xl px-3 py-2 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra}`}
            >
              <span
                className={`hidden sm:inline text-xs font-semibold mr-2 ${tema.colores.textoSecundario}`}
              >
                Riesgo:
              </span>
              <select
                value={filtroRiesgo}
                onChange={(e) => setFiltroRiesgo(e.target.value)}
                className={`px-2 py-1 rounded-xl text-xs sm:text-sm font-semibold bg-transparent ${tema.colores.texto}`}
              >
                <option value="todas">Todos</option>
                <option value="bajo">Bajo</option>
                <option value="medio">Medio</option>
                <option value="alto">Alto</option>
                <option value="critico">Crítico</option>
              </select>
            </div>
          </div>
        </div>

        {/* Resumen Pacientes */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {/* Total Pacientes */}
          <div
            className={`rounded-2xl p-4 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} hover:scale-105 hover:-translate-y-1 transition-all duration-300`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg">
                <Users className="w-5 h-5 text-white" />
              </div>
              <span className="text-xs font-bold uppercase text-indigo-400">
                Pacientes
              </span>
            </div>
            <p className={`text-2xl font-black ${tema.colores.texto}`}>
              {resumenPacientes.total}
            </p>
            <p className={`text-xs font-semibold ${tema.colores.textoSecundario}`}>
              Pacientes en el sistema
            </p>
          </div>

          {/* Con próxima cita */}
          <div
            className={`rounded-2xl p-4 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} hover:scale-105 hover:-translate-y-1 transition-all duration-300`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-green-500 flex items-center justify-center shadow-lg">
                <CalendarCheck className="w-5 h-5 text-white" />
              </div>
              <span className="text-xs font-bold uppercase text-emerald-300">
                Próximas citas
              </span>
            </div>
            <p className={`text-2xl font-black ${tema.colores.texto}`}>
              {resumenPacientes.conProximaCita}
            </p>
            <p className={`text-xs font-semibold ${tema.colores.textoSecundario}`}>
              Con cita futura registrada
            </p>
          </div>

          {/* Riesgo alto / crítico */}
          <div
            className={`rounded-2xl p-4 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} hover:scale-105 hover:-translate-y-1 transition-all duration-300`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-rose-500 flex items-center justify-center shadow-lg">
                <AlertCircle className="w-5 h-5 text-white" />
              </div>
              <span className="text-xs font-bold uppercase text-rose-300">
                Riesgo
              </span>
            </div>
            <p className={`text-2xl font-black ${tema.colores.texto}`}>
              {resumenPacientes.riesgoAltoOCritico}
            </p>
            <p className={`text-xs font-semibold ${tema.colores.textoSecundario}`}>
              Alto o crítico
            </p>
          </div>

          {/* Asignaciones médico-paciente */}
          <div
            className={`rounded-2xl p-4 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} hover:scale-105 hover:-translate-y-1 transition-all duración-300`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center shadow-lg">
                <Stethoscope className="w-5 h-5 text-white" />
              </div>
              <span className="text-xs font-bold uppercase text-cyan-300">
                Vinculaciones
              </span>
            </div>
            <p className={`text-2xl font-black ${tema.colores.texto}`}>
              {resumenPacientes.asignaciones}
            </p>
            <p className={`text-xs font-semibold ${tema.colores.textoSecundario}`}>
              Paciente ↔ médico por centro
            </p>
          </div>
        </div>

        {/* Layout principal: listado + detalle */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Columna izquierda: listado de pacientes + alta rápida */}
          <div className="space-y-6 xl:col-span-1">
            {/* Listado */}
            <div
              className={`rounded-2xl p-6 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra}`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-12 h-12 bg-gradient-to-br ${tema.colores.gradiente} rounded-xl flex items-center justify-center shadow-lg`}
                  >
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3
                      className={`text-xl font-black ${tema.colores.texto}`}
                    >
                      Pacientes del centro
                    </h3>
                    <p
                      className={`text-xs font-semibold ${tema.colores.textoSecundario}`}
                    >
                      Selecciona un paciente para ver su ficha, próximas citas y
                      disponibilidad.
                    </p>
                  </div>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold ${tema.colores.hover}`}
                >
                  {pacientesFiltrados.length} en la lista
                </span>
              </div>

              <div className="space-y-3 max-h-[540px] overflow-y-auto custom-scrollbar pr-1">
                {loadingPacientes ? (
                  <div className="flex items-center justify-center py-10">
                    <div className="text-center">
                      <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-indigo-500" />
                      <p
                        className={`text-sm ${tema.colores.textoSecundario}`}
                      >
                        Cargando pacientes...
                      </p>
                    </div>
                  </div>
                ) : pacientesFiltrados.length === 0 ? (
                  <div className="text-center py-10">
                    <div
                      className={`w-20 h-20 bg-gradient-to-br ${tema.colores.gradiente} rounded-full flex items-center justify-center mx-auto mb-4`}
                    >
                      <UserPlus className="w-10 h-10 text-white" />
                    </div>
                    <p
                      className={`text-sm font-semibold ${tema.colores.texto}`}
                    >
                      No se encontraron pacientes con los filtros actuales.
                    </p>
                    <p
                      className={`text-xs ${tema.colores.textoSecundario}`}
                    >
                      Ajusta tu búsqueda o crea un nuevo paciente.
                    </p>
                  </div>
                ) : (
                  pacientesFiltrados.map((p) => {
                    const seleccionado =
                      pacienteSeleccionado &&
                      pacienteSeleccionado.id_paciente === p.id_paciente;

                    const medicoPrincipal = p.medicos_principales?.find(
                      (m) => m.es_principal
                    );

                    const fechaProxima = p.proxima_cita
                      ? limpiarFecha(p.proxima_cita)
                      : null;

                    return (
                      <button
                        key={p.id_paciente}
                        onClick={() => {
                          setPacienteSeleccionado(p as PacienteDetalle);
                          cargarDetallePaciente(p.id_paciente);
                        }}
                        className={`w-full text-left rounded-2xl px-3 py-3 flex items-start gap-3 border transition-all duration-200 ${
                          seleccionado
                            ? `bg-gradient-to-r ${tema.colores.gradiente} text-white border-transparent scale-[1.02]`
                            : `${tema.colores.hover} ${tema.colores.card} ${tema.colores.borde} border`
                        }`}
                      >
                        {/* Avatar */}
                        <div
                          className={`relative w-12 h-12 rounded-xl flex items-center justify-center font-bold text-sm shadow-lg ${
                            seleccionado
                              ? "bg-white/15 text-white"
                              : `bg-gradient-to-br ${tema.colores.gradiente} text-white`
                          }`}
                        >
                          {p.foto_url ? (
                            <Image
                              src={p.foto_url}
                              alt={p.nombre_completo}
                              width={48}
                              height={48}
                              className="rounded-xl object-cover"
                            />
                          ) : (
                            p.nombre_completo
                              .split(" ")
                              .map((n) => n[0])
                              .join("")
                              .substring(0, 2)
                          )}
                          {p.riesgo && (
                            <span
                              className="absolute -bottom-1 -right-1 text-[0.55rem] px-1.5 py-0.5 rounded-full font-black bg-red-500 text-white"
                              title="Nivel de riesgo"
                            >
                              {p.riesgo.toString().toUpperCase().slice(0, 2)}
                            </span>
                          )}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0 space-y-1">
                          <div className="flex items-center justify-between gap-2">
                            <p
                              className={`text-sm font-black truncate ${
                                seleccionado
                                  ? "text-white"
                                  : tema.colores.texto
                              }`}
                            >
                              {p.nombre_completo}
                            </p>
                            {p.centro_principal && (
                              <span
                                className={`text-[0.6rem] font-semibold px-2 py-0.5 rounded-full ${
                                  seleccionado
                                    ? "bg-white/15 text-white"
                                    : tema.colores.hover
                                }`}
                              >
                                {p.centro_principal.nombre}
                              </span>
                            )}
                          </div>

                          <div className="flex flex-wrap items-center gap-1 text-[0.65rem]">
                            {p.rut && (
                              <span
                                className={`px-2 py-0.5 rounded-full border ${seleccionado ? "border-white/40 text-white/90" : "border-gray-300 text-gray-600"}`}
                              >
                                RUT: {p.rut}
                              </span>
                            )}
                            {p.edad != null && (
                              <span
                                className={`px-2 py-0.5 rounded-full ${seleccionado ? "bg-white/10 text-white" : tema.colores.hover}`}
                              >
                                {p.edad} años
                              </span>
                            )}
                            {medicoPrincipal && (
                              <span
                                className={`px-2 py-0.5 rounded-full flex items-center gap-1 ${seleccionado ? "bg-white/10 text-white" : tema.colores.hover}`}
                              >
                                <Stethoscope className="w-3 h-3" />
                                {medicoPrincipal.nombre_completo}
                              </span>
                            )}
                          </div>

                          <div className="flex items-center justify-between gap-2 text-[0.65rem]">
                            <div className="flex items-center gap-1 flex-wrap">
                              {p.telefono && (
                                <a
                                  href={`tel:${p.telefono}`}
                                  className={`flex items-center gap-1 px-1.5 py-0.5 rounded-full ${
                                    seleccionado
                                      ? "bg-white/10 text-white"
                                      : tema.colores.hover
                                  }`}
                                >
                                  <Phone className="w-3 h-3" />
                                  {p.telefono}
                                </a>
                              )}
                              {p.celular && (
                                <a
                                  href={`tel:${p.celular}`}
                                  className={`flex items-center gap-1 px-1.5 py-0.5 rounded-full ${
                                    seleccionado
                                      ? "bg-white/10 text-white"
                                      : tema.colores.hover
                                  }`}
                                >
                                  <PhoneCall className="w-3 h-3" />
                                  {p.celular}
                                </a>
                              )}
                            </div>
                            {fechaProxima && (
                              <span className="flex items-center gap-1 text-[0.6rem]">
                                <CalendarClock className="w-3 h-3" />
                                {formatearFechaCorta(fechaProxima)}
                              </span>
                            )}
                          </div>
                        </div>
                      </button>
                    );
                  })
                )}
              </div>

              {/* Paginación */}
              {totalPaginas > 1 && (
                <div className="flex items-center justify-between mt-4 text-xs">
                  <button
                    disabled={paginaActual <= 1}
                    onClick={() => setPaginaActual((p) => Math.max(1, p - 1))}
                    className={`flex items-center gap-1 px-3 py-1.5 rounded-xl border text-xs font-semibold ${
                      paginaActual <= 1
                        ? "opacity-40 cursor-not-allowed"
                        : tema.colores.hover
                    }`}
                  >
                    <ChevronLeft className="w-3 h-3" />
                    Anterior
                  </button>
                  <span
                    className={`text-xs font-semibold ${tema.colores.textoSecundario}`}
                  >
                    Página {paginaActual} de {totalPaginas}
                  </span>
                  <button
                    disabled={paginaActual >= totalPaginas}
                    onClick={() =>
                      setPaginaActual((p) => Math.min(totalPaginas, p + 1))
                    }
                    className={`flex items-center gap-1 px-3 py-1.5 rounded-xl border text-xs font-semibold ${
                      paginaActual >= totalPaginas
                        ? "opacity-40 cursor-not-allowed"
                        : tema.colores.hover
                    }`}
                  >
                    Siguiente
                    <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>

            {/* Alta rápida de paciente */}
            <div
              className={`rounded-2xl p-6 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra}`}
            >
              <div className="flex items-center gap-3 mb-4">
                <div
                  className={`w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg`}
                >
                  <UserPlus className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3
                    className={`text-xl font-black ${tema.colores.texto}`}
                  >
                    Nuevo paciente rápido
                  </h3>
                  <p
                    className={`text-xs font-semibold ${tema.colores.textoSecundario}`}
                  >
                    Registra a un paciente básico en segundos para agendarle
                    una cita.
                  </p>
                </div>
              </div>

              <form
                onSubmit={manejarCrearPacienteRapido}
                className="space-y-3 text-xs sm:text-sm"
              >
                <div>
                  <label className="block mb-1 font-semibold">RUT</label>
                  <input
                    type="text"
                    value={rutNuevo}
                    onChange={(e) => setRutNuevo(e.target.value)}
                    placeholder="Ej: 12.345.678-9"
                    className={`w-full px-3 py-2 rounded-xl ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto} text-xs sm:text-sm`}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block mb-1 font-semibold">
                      Nombres
                    </label>
                    <input
                      type="text"
                      value={nombresNuevo}
                      onChange={(e) => setNombresNuevo(e.target.value)}
                      className={`w-full px-3 py-2 rounded-xl ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto} text-xs sm:text-sm`}
                    />
                  </div>
                  <div>
                    <label className="block mb-1 font-semibold">
                      Apellidos
                    </label>
                    <input
                      type="text"
                      value={apellidosNuevo}
                      onChange={(e) => setApellidosNuevo(e.target.value)}
                      className={`w-full px-3 py-2 rounded-xl ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto} text-xs sm:text-sm`}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block mb-1 font-semibold">
                      Fecha nac.
                    </label>
                    <input
                      type="date"
                      value={fechaNacimientoNuevo}
                      onChange={(e) =>
                        setFechaNacimientoNuevo(e.target.value)
                      }
                      className={`w-full px-3 py-2 rounded-xl ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto} text-xs sm:text-sm`}
                    />
                  </div>
                  <div>
                    <label className="block mb-1 font-semibold">
                      Teléfono
                    </label>
                    <input
                      type="tel"
                      value={telefonoNuevo}
                      onChange={(e) => setTelefonoNuevo(e.target.value)}
                      className={`w-full px-3 py-2 rounded-xl ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto} text-xs sm:text-sm`}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block mb-1 font-semibold">
                      Celular
                    </label>
                    <input
                      type="tel"
                      value={celularNuevo}
                      onChange={(e) => setCelularNuevo(e.target.value)}
                      className={`w-full px-3 py-2 rounded-xl ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto} text-xs sm:text-sm`}
                    />
                  </div>
                  <div>
                    <label className="block mb-1 font-semibold">
                      Email
                    </label>
                    <input
                      type="email"
                      value={emailNuevo}
                      onChange={(e) => setEmailNuevo(e.target.value)}
                      className={`w-full px-3 py-2 rounded-xl ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto} text-xs sm:text-sm`}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={creandoPaciente}
                  className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-xs sm:text-sm font-bold ${tema.colores.primario} text-white ${tema.colores.sombra} hover:scale-105 transition-all duración-300 disabled:opacity-60 disabled:cursor-not-allowed`}
                >
                  {creandoPaciente ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <UserPlus className="w-4 h-4" />
                  )}
                  {creandoPaciente
                    ? "Creando paciente..."
                    : "Crear paciente rápido"}
                </button>
              </form>
            </div>
          </div>

          {/* Columna derecha: ficha paciente + citas + disponibilidad */}
          <div className="xl:col-span-2 space-y-6">
            {!pacienteSeleccionado ? (
              <div
                className={`rounded-2xl p-8 text-center ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra}`}
              >
                <div
                  className={`w-24 h-24 bg-gradient-to-br ${tema.colores.gradiente} rounded-full flex items-center justify-center mx-auto mb-4`}
                >
                  <Eye className="w-12 h-12 text-white" />
                </div>
                <p
                  className={`text-xl font-bold mb-2 ${tema.colores.texto}`}
                >
                  Selecciona un paciente de la lista
                </p>
                <p
                  className={`text-sm ${tema.colores.textoSecundario}`}
                >
                  Aquí verás su ficha, próximas citas, historial y disponibilidad
                  rápida para agendar.
                </p>
              </div>
            ) : (
              <>
                {/* Ficha principal */}
                <div
                  className={`rounded-2xl p-6 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra}`}
                >
                  <div className="flex flex-col md:flex-row gap-4 md:gap-6 md:items-center">
                    {/* Avatar grande */}
                    <div className="relative">
                      <div
                        className={`w-20 h-20 md:w-24 md:h-24 rounded-2xl bg-gradient-to-br ${tema.colores.gradiente} flex items-center justify-center text-white text-2xl font-black shadow-2xl`}
                      >
                        {pacienteSeleccionado.foto_url ? (
                          <Image
                            src={pacienteSeleccionado.foto_url}
                            alt={pacienteSeleccionado.nombre_completo}
                            width={96}
                            height={96}
                            className="rounded-2xl object-cover"
                          />
                        ) : (
                          pacienteSeleccionado.nombre_completo
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .substring(0, 2)
                        )}
                      </div>
                      {pacienteSeleccionado.riesgo && (
                        <div
                          className={`absolute -bottom-2 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full border text-[0.6rem] font-bold whitespace-nowrap ${obtenerColorRiesgo(
                            pacienteSeleccionado.riesgo
                          )}`}
                        >
                          RIESGO:{" "}
                          {pacienteSeleccionado.riesgo
                            .toString()
                            .toUpperCase()}
                        </div>
                      )}
                    </div>

                    {/* Info básica */}
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <h3
                          className={`text-2xl md:text-3xl font-black ${tema.colores.texto}`}
                        >
                          {pacienteSeleccionado.nombre_completo}
                        </h3>
                        {pacienteSeleccionado.centro_principal && (
                          <span
                            className={`px-3 py-1 rounded-full text-[0.7rem] font-semibold ${tema.colores.hover}`}
                          >
                            Centro:{" "}
                            {pacienteSeleccionado.centro_principal.nombre}
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-2 text-xs md:text-sm">
                        {pacienteSeleccionado.rut && (
                          <span
                            className={`px-3 py-1 rounded-full border ${tema.colores.borde} ${tema.colores.textoSecundario}`}
                          >
                            RUT: {pacienteSeleccionado.rut}
                          </span>
                        )}
                        {pacienteSeleccionado.edad != null && (
                          <span
                            className={`px-3 py-1 rounded-full ${tema.colores.hover} ${tema.colores.textoSecundario}`}
                          >
                            Edad: {pacienteSeleccionado.edad} años
                          </span>
                        )}
                        {pacienteSeleccionado.sexo && (
                          <span
                            className={`px-3 py-1 rounded-full ${tema.colores.hover} ${tema.colores.textoSecundario}`}
                          >
                            Sexo: {pacienteSeleccionado.sexo}
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-2 text-xs md:text-sm mt-1">
                        {pacienteSeleccionado.telefono && (
                          <a
                            href={`tel:${pacienteSeleccionado.telefono}`}
                            className={`flex items-center gap-1 px-3 py-1 rounded-full ${tema.colores.hover} ${tema.colores.texto}`}
                          >
                            <Phone className="w-3 h-3" />
                            {pacienteSeleccionado.telefono}
                          </a>
                        )}
                        {pacienteSeleccionado.celular && (
                          <a
                            href={`tel:${pacienteSeleccionado.celular}`}
                            className={`flex items-center gap-1 px-3 py-1 rounded-full ${tema.colores.hover} ${tema.colores.texto}`}
                          >
                            <PhoneCall className="w-3 h-3" />
                            {pacienteSeleccionado.celular}
                          </a>
                        )}
                        {pacienteSeleccionado.email && (
                          <a
                            href={`mailto:${pacienteSeleccionado.email}`}
                            className={`flex items-center gap-1 px-3 py-1 rounded-full ${tema.colores.hover} ${tema.colores.texto}`}
                          >
                            <Mail className="w-3 h-3" />
                            {pacienteSeleccionado.email}
                          </a>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-2 text-[0.7rem] mt-2">
                        {pacienteSeleccionado.ultima_cita && (
                          <span
                            className={`px-3 py-1 rounded-full ${tema.colores.hover} ${tema.colores.textoSecundario}`}
                          >
                            Última cita:{" "}
                            {formatearFechaTexto(
                              pacienteSeleccionado.ultima_cita
                            )}
                          </span>
                        )}
                        {pacienteSeleccionado.proxima_cita && (
                          <span
                            className={`px-3 py-1 rounded-full border text-[0.7rem] font-semibold ${tema.colores.borde} ${tema.colores.texto}`}
                          >
                            Próxima cita:{" "}
                            {formatearFechaTexto(
                              pacienteSeleccionado.proxima_cita
                            )}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Acciones rápidas */}
                    <div className="flex flex-col gap-2 min-w-[160px]">
                      <Link
                        href={`/secretaria/pacientes/${pacienteSeleccionado.id_paciente}`}
                        className={`flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-bold ${tema.colores.primario} text-white ${tema.colores.sombra} hover:scale-105 transition-all duración-300`}
                      >
                        <Eye className="w-4 h-4" />
                        Ver ficha completa
                      </Link>
                      <Link
                        href={`/secretaria/agenda/nueva?paciente=${pacienteSeleccionado.id_paciente}`}
                        className={`flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-bold ${tema.colores.secundario} ${tema.colores.texto}`}
                      >
                        <CalendarPlus className="w-4 h-4" />
                        Agendar cita
                      </Link>
                    </div>
                  </div>
                </div>

                {/* Citas próximas + Disponibilidad */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Próximas citas */}
                  <div
                    className={`rounded-2xl p-6 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra}`}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center shadow-lg`}
                        >
                          <CalendarCheck className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h3
                            className={`text-lg font-black ${tema.colores.texto}`}
                          >
                            Próximas citas
                          </h3>
                          <p
                            className={`text-xs font-semibold ${tema.colores.textoSecundario}`}
                          >
                            Vista de las próximas atenciones agendadas.
                          </p>
                        </div>
                      </div>
                      <Link
                        href={`/secretaria/agenda?paciente=${pacienteSeleccionado.id_paciente}`}
                        className={`hidden sm:inline-flex items-center gap-1 px-3 py-1 rounded-xl text-[0.7rem] font-bold ${tema.colores.hover} ${tema.colores.texto}`}
                      >
                        <Calendar className="w-3 h-3" />
                        Ver en agenda
                      </Link>
                    </div>

                    <div className="space-y-2 max-h-64 overflow-y-auto custom-scrollbar pr-1">
                      {citasProximas.length === 0 ? (
                        <p
                          className={`text-sm ${tema.colores.textoSecundario}`}
                        >
                          No hay próximas citas registradas para este paciente.
                        </p>
                      ) : (
                        citasProximas.map((c) => {
                          const d =
                            limpiarFecha(c.fecha_hora_inicio) || new Date();
                          return (
                            <div
                              key={c.id_cita}
                              className={`rounded-xl px-3 py-2 flex items-start gap-3 ${tema.colores.hover}`}
                            >
                              <div className="mt-0.5">
                                <span
                                  className="w-2 h-2 rounded-full block"
                                  style={{
                                    backgroundColor: "#4f46e5",
                                  }}
                                ></span>
                              </div>
                              <div className="flex-1 min-w-0">
                                <p
                                  className={`text-xs font-bold ${tema.colores.texto}`}
                                >
                                  {formatearFechaTexto(
                                    c.fecha_hora_inicio
                                  )}{" "}
                                  · {c.tipo_cita}
                                </p>
                                <p
                                  className={`text-[0.7rem] ${tema.colores.textoSecundario}`}
                                >
                                  <Stethoscope className="inline w-3 h-3 mr-1" />
                                  {c.medico.nombre_completo} ·{" "}
                                  {c.medico.especialidad}
                                </p>
                                {c.motivo && (
                                  <p
                                    className={`text-[0.7rem] mt-1 ${tema.colores.textoSecundario}`}
                                  >
                                    <FileText className="inline w-3 h-3 mr-1" />
                                    {c.motivo}
                                  </p>
                                )}
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>

                  {/* Disponibilidad ultra rápida por centro/médico */}
                  <div
                    className={`rounded-2xl p-6 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra}`}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-xl flex items-center justify-center shadow-lg`}
                        >
                          <CalendarClock className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h3
                            className={`text-lg font-black ${tema.colores.texto}`}
                          >
                            Disponibilidad para este paciente
                          </h3>
                          <p
                            className={`text-xs font-semibold ${tema.colores.textoSecundario}`}
                          >
                            Bloques libres según sus médicos y centro.
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() =>
                          cargarDisponibilidadPaciente(
                            pacienteSeleccionado.id_paciente
                          )
                        }
                        className={`flex items-center gap-1 px-3 py-1 rounded-xl text-[0.7rem] font-bold ${tema.colores.hover} ${tema.colores.texto}`}
                      >
                        <RefreshCw className="w-3 h-3" />
                        Actualizar
                      </button>
                    </div>

                    {loadingDisponibilidad ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
                      </div>
                    ) : (
                      <>
                        <div className="grid grid-cols-3 gap-2 mb-4 text-[0.7rem]">
                          <div
                            className={`rounded-xl px-3 py-2 ${tema.colores.hover}`}
                          >
                            <p
                              className={`font-bold ${tema.colores.textoSecundario}`}
                            >
                              Hoy
                            </p>
                            <p
                              className={`text-lg font-black ${tema.colores.texto}`}
                            >
                              {resumenDisponibilidad?.hoy_disponible ?? 0}
                            </p>
                          </div>
                          <div
                            className={`rounded-xl px-3 py-2 ${tema.colores.hover}`}
                          >
                            <p
                              className={`font-bold ${tema.colores.textoSecundario}`}
                            >
                              Próx. 7 días
                            </p>
                            <p
                              className={`text-lg font-black ${tema.colores.texto}`}
                            >
                              {resumenDisponibilidad?.proximos_7_dias ?? 0}
                            </p>
                          </div>
                          <div
                            className={`rounded-xl px-3 py-2 ${tema.colores.hover}`}
                          >
                            <p
                              className={`font-bold ${tema.colores.textoSecundario}`}
                            >
                              Total visible
                            </p>
                            <p
                              className={`text-lg font-black ${tema.colores.texto}`}
                            >
                              {resumenDisponibilidad?.total_disponible ??
                                bloquesDisponibilidad.length}
                            </p>
                          </div>
                        </div>

                        <div className="space-y-2 max-h-64 overflow-y-auto custom-scrollbar pr-1">
                          {bloquesDisponibilidad.length === 0 ? (
                            <p
                              className={`text-sm ${tema.colores.textoSecundario}`}
                            >
                              No hay bloques disponibles asociados a sus
                              médicos/centro en este rango.
                            </p>
                          ) : (
                            bloquesDisponibilidad.slice(0, 8).map((b) => {
                              const dInicio =
                                limpiarFecha(b.fecha_inicio) || new Date();
                              const dFin =
                                limpiarFecha(b.fecha_fin) || dInicio;
                              const medico = medicosAsignados.find(
                                (m) => m.id_profesional === b.id_profesional
                              );

                              return (
                                <div
                                  key={b.id_bloque}
                                  className={`flex items-center gap-3 rounded-xl px-3 py-2 ${tema.colores.hover}`}
                                >
                                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500 to-indigo-500 flex items-center justify-center text-white text-[0.7rem] font-bold">
                                    {formatearHora(dInicio)}
                                    <span className="block text-[0.6rem] font-normal">
                                      {formatearFechaCorta(dInicio)}
                                    </span>
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p
                                      className={`text-xs font-bold ${tema.colores.texto}`}
                                    >
                                      {medico
                                        ? medico.nombre_completo
                                        : `Profesional #${b.id_profesional}`}
                                    </p>
                                    <p
                                      className={`text-[0.7rem] ${tema.colores.textoSecundario}`}
                                    >
                                      {formatearHora(dInicio)} –{" "}
                                      {formatearHora(dFin)} · {b.tipo_atencion}
                                    </p>
                                    {b.sala && (
                                      <p
                                        className={`text-[0.65rem] ${tema.colores.textoSecundario}`}
                                      >
                                        Sala {b.sala.nombre} · {b.sala.tipo}
                                      </p>
                                    )}
                                  </div>
                                  <Link
                                    href={`/secretaria/agenda/nueva?paciente=${pacienteSeleccionado.id_paciente}&bloque=${b.id_bloque}`}
                                    className={`px-3 py-1 rounded-xl text-[0.7rem] font-bold ${tema.colores.primario} text-white ${tema.colores.sombra} hover:scale-105 transition-all`}
                                  >
                                    Agendar aquí
                                  </Link>
                                </div>
                              );
                            })
                          )}
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Historial + valoraciones */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Historial de citas */}
                  <div
                    className={`rounded-2xl p-6 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra}`}
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <div
                        className={`w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl flex items-center justify-center shadow-lg`}
                      >
                        <ClipboardList className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3
                          className={`text-lg font-black ${tema.colores.texto}`}
                        >
                          Historial reciente
                        </h3>
                        <p
                          className={`text-xs font-semibold ${tema.colores.textoSecundario}`}
                        >
                          Últimas atenciones registradas.
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2 max-h-64 overflow-y-auto custom-scrollbar pr-1">
                      {historialCitas.length === 0 ? (
                        <p
                          className={`text-sm ${tema.colores.textoSecundario}`}
                        >
                          No se encontró historial registrado.
                        </p>
                      ) : (
                        historialCitas.slice(0, 8).map((c) => {
                          const d =
                            limpiarFecha(c.fecha_hora_inicio) || new Date();
                          return (
                            <div
                              key={c.id_cita}
                              className={`rounded-xl px-3 py-2 ${tema.colores.hover} text-[0.7rem]`}
                            >
                              <p
                                className={`font-bold ${tema.colores.texto}`}
                              >
                                {formatearFechaTexto(c.fecha_hora_inicio)} ·{" "}
                                {c.tipo_cita}
                              </p>
                              <p
                                className={`font-medium ${tema.colores.textoSecundario}`}
                              >
                                <Stethoscope className="inline w-3 h-3 mr-1" />
                                {c.medico.nombre_completo} ·{" "}
                                {c.medico.especialidad}
                              </p>
                              <div className="flex items-center gap-2 mt-1">
                                <span
                                  className={`px-2 py-0.5 rounded-full text-[0.6rem] font-bold border ${obtenerColorPrioridad(
                                    c.prioridad || "normal"
                                  )}`}
                                >
                                  {c.prioridad || "normal"}
                                </span>
                                <span
                                  className={`px-2 py-0.5 rounded-full text-[0.6rem] font-bold border`}
                                >
                                  {c.estado}
                                </span>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>

                  {/* Valoraciones / experiencia */}
                  <div
                    className={`rounded-2xl p-6 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra}`}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 bg-gradient-to-br from-pink-500 to-rose-500 rounded-xl flex items-center justify-center shadow-lg`}
                        >
                          <Award className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h3
                            className={`text-lg font-black ${tema.colores.texto}`}
                          >
                            Valoraciones del equipo
                          </h3>
                          <p
                            className={`text-xs font-semibold ${tema.colores.textoSecundario}`}
                          >
                            Percepción del paciente sobre sus médicos.
                          </p>
                        </div>
                      </div>
                      {promedioValoraciones && (
                        <div className="text-right">
                          <p
                            className={`text-xs font-semibold ${tema.colores.textoSecundario}`}
                          >
                            Promedio
                          </p>
                          <p className="text-lg font-black text-yellow-300">
                            ⭐ {promedioValoraciones}
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="space-y-2 max-h-64 overflow-y-auto custom-scrollbar pr-1">
                      {valoraciones.length === 0 ? (
                        <p
                          className={`text-sm ${tema.colores.textoSecundario}`}
                        >
                          Aún no hay valoraciones asociadas a este paciente.
                        </p>
                      ) : (
                        valoraciones.slice(0, 5).map((v) => (
                          <div
                            key={v.id_valoracion}
                            className={`rounded-xl px-3 py-2 ${tema.colores.hover} text-[0.7rem]`}
                          >
                            <div className="flex items-center justify-between">
                              <p
                                className={`font-bold ${tema.colores.texto}`}
                              >
                                {v.medico
                                  ? v.medico.nombre_completo
                                  : "Médico"}
                              </p>
                              <span className="text-yellow-300 font-black text-xs">
                                {"⭐".repeat(Number(v.calificacion || 0))}
                              </span>
                            </div>
                            {v.comentario && (
                              <p
                                className={`mt-1 ${tema.colores.textoSecundario}`}
                              >
                                “{v.comentario}”
                              </p>
                            )}
                            <p
                              className={`mt-1 text-[0.6rem] ${tema.colores.textoSecundario}`}
                            >
                              {formatearFechaTexto(v.fecha_valoracion)}
                            </p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* FOOTER */}
        <footer
          className={`transition-all duration-300 mt-12 rounded-2xl px-6 py-4 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra}`}
        >
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <p
                className={`text-sm font-semibold ${tema.colores.textoSecundario}`}
              >
                © 2025 AnyssaMed · Módulo Pacientes & Agenda Inteligente.
              </p>
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r ${tema.colores.gradiente} text-white`}
              >
                v4.0.0
              </span>
            </div>
            <div className="flex items-center gap-4 text-xs sm:text-sm">
              <Link
                href="/ayuda"
                className={`font-bold transition-colors ${tema.colores.textoSecundario} hover:${tema.colores.acento}`}
              >
                Ayuda
              </Link>
              <Link
                href="/privacidad"
                className={`font-bold transition-colors ${tema.colores.textoSecundario} hover:${tema.colores.acento}`}
              >
                Privacidad
              </Link>
              <Link
                href="/terminos"
                className={`font-bold transition-colors ${tema.colores.textoSecundario} hover:${tema.colores.acento}`}
              >
                Términos
              </Link>
              <button
                onClick={cerrarSesion}
                className="font-bold text-red-400 hover:text-red-300 transition-colors"
              >
                Cerrar Sesión
              </button>
            </div>
          </div>
        </footer>
      </main>

      {/* ESTILOS GLOBALES */}
      <style jsx global>{`
        @keyframes wave {
          0%,
          100% {
            transform: rotate(0deg);
          }
          25% {
            transform: rotate(20deg);
          }
          75% {
            transform: rotate(-20deg);
          }
        }

        .animate-wave {
          animation: wave 1s ease-in-out infinite;
        }

        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }

        .custom-scrollbar::-webkit-scrollbar-track {
          background: ${["dark", "blue", "purple", "green"].includes(
            temaActual
          )
            ? "rgba(31, 41, 55, 0.5)"
            : "rgba(243, 244, 246, 0.5)"};
          border-radius: 10px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: ${["dark", "blue", "purple", "green"].includes(
            temaActual
          )
            ? "rgba(99, 102, 241, 0.5)"
            : "rgba(99, 102, 241, 0.7)"};
          border-radius: 10px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: ${["dark", "blue", "purple", "green"].includes(
            temaActual
          )
            ? "rgba(99, 102, 241, 0.7)"
            : "rgba(99, 102, 241, 0.9)"};
        }
      `}</style>
    </div>
  );
}
