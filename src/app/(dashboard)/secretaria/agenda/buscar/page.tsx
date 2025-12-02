"use client";

import { useState, useEffect, useMemo } from "react";
import type { FormEvent } from "react";
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

interface MedicoAsignado extends MedicoAgenda {
  es_principal: boolean;
  citas_hoy?: number;
  proxima_cita?: string | null;
  disponible_ahora?: boolean;
  extension_telefonica?: string | null;
  email: string;
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

// Extensión para resultados de búsqueda (campos opcionales extra)
interface CitaBusqueda extends CitaAgenda {
  cantidad_recordatorios?: number;
  cantidad_confirmaciones?: number;
  cantidad_cancelaciones?: number;
  ultima_confirmacion?: string | null;
  ultima_cancelacion?: string | null;
  motivo_cancelacion?: string | null;
  tiene_telemedicina?: boolean;
  estado_telemedicina?: string | null;
  valoracion_promedio?: number | null;
}

interface ResumenBusqueda {
  total: number;
  confirmadas: number;
  pendientes: number;
  canceladas: number;
  telemedicina: number;
  porcentajeConfirmadas: number;
}

type OrdenCampoCita = "fecha" | "paciente" | "medico" | "estado" | "tipo" | "prioridad" | "origen";
type OrdenDireccion = "asc" | "desc";

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

const esMismoDia = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

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

// Rango inicial: últimos 7 días
const HOY = new Date();
const HACE_7 = new Date(HOY.getTime());
HACE_7.setDate(HOY.getDate() - 7);
const FECHA_DESDE_DEFAULT = HACE_7.toISOString().substring(0, 10);
const FECHA_HASTA_DEFAULT = HOY.toISOString().substring(0, 10);

// ========================================
// COMPONENTE PRINCIPAL
// ========================================

export default function BusquedaCitasSecretariaPage() {
  // Usuario y sesión
  const [usuario, setUsuario] = useState<UsuarioSesion | null>(null);
  const [loading, setLoading] = useState(true);

  // Datos generales (para badges, notificaciones, etc.)
  const [estadisticas, setEstadisticas] = useState<EstadisticasSecretaria | null>(null);
  const [medicosAsignados, setMedicosAsignados] = useState<MedicoAsignado[]>([]);
  const [notificaciones, setNotificaciones] = useState<NotificacionSecretaria[]>([]);

  // UI general
  const [temaActual, setTemaActual] = useState<TemaColor>("light");
  const [sidebarAbierto, setSidebarAbierto] = useState(true);
  const [notificacionesAbiertas, setNotificacionesAbiertas] = useState(false);
  const [perfilAbierto, setPerfilAbierto] = useState(false);
  const [busqueda, setBusqueda] = useState("");
  const [menuExpandido, setMenuExpandido] = useState<string | null>(null);
  const [seccionActiva] = useState("agenda"); // para resaltar "Agenda"

  // Filtros de búsqueda
  const [fechaDesde, setFechaDesde] = useState<string>(FECHA_DESDE_DEFAULT);
  const [fechaHasta, setFechaHasta] = useState<string>(FECHA_HASTA_DEFAULT);
  const [filtroEstadoCita, setFiltroEstadoCita] = useState<string>("todas");
  const [filtroPrioridad, setFiltroPrioridad] = useState<string>("todas");
  const [filtroTipoCita, setFiltroTipoCita] = useState<string>("todas");
  const [filtroOrigen, setFiltroOrigen] = useState<string>("todos");
  const [soloTelemedicina, setSoloTelemedicina] = useState<boolean>(false);
  const [soloSinConfirmar, setSoloSinConfirmar] = useState<boolean>(false);
  const [rutPacienteFiltro, setRutPacienteFiltro] = useState<string>("");
  const [nombrePacienteFiltro, setNombrePacienteFiltro] = useState<string>("");
  const [nombreMedicoFiltro, setNombreMedicoFiltro] = useState<string>("");
  const [filtroMedico, setFiltroMedico] = useState<number | "todos">("todos");

  // Catálogo tipos de cita
  const [tiposCita, setTiposCita] = useState<TipoCitaAgenda[]>([]);

  // Resultados
  const [resultados, setResultados] = useState<CitaBusqueda[]>([]);
  const [loadingBusqueda, setLoadingBusqueda] = useState(false);
  const [citaSeleccionada, setCitaSeleccionada] = useState<CitaBusqueda | null>(null);
  const [ordenCampo, setOrdenCampo] = useState<OrdenCampoCita>("fecha");
  const [ordenDireccion, setOrdenDireccion] = useState<OrdenDireccion>("asc");

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
  // FUNCIONES DE NEGOCIO / ACCIONES
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

  const formatearFechaTexto = (fechaStr: string) => {
    const d = limpiarFecha(fechaStr);
    if (!d) return "-";
    return formatearFechaCorta(d) + " • " + formatearHora(d);
  };

  const obtenerFechaInicioCita = (cita: CitaAgenda | CitaBusqueda) => {
    const d =
      limpiarFecha((cita as any).fecha_hora_inicio) ||
      limpiarFecha((cita as any).fecha_hora);
    return d || new Date();
  };

  const obtenerColorEstado = (estado: string) => {
    const isDark = ["dark", "blue", "purple", "green"].includes(temaActual);
    const colores: { [key: string]: string } = {
      programada: isDark
        ? "bg-blue-500/20 text-blue-300 border-blue-500/30"
        : "bg-blue-100 text-blue-800 border-blue-200",
      confirmada: isDark
        ? "bg-green-500/20 text-green-400 border-green-500/30"
        : "bg-green-100 text-green-800 border-green-200",
      en_sala_espera: isDark
        ? "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
        : "bg-yellow-100 text-yellow-800 border-yellow-200",
      en_atencion: isDark
        ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
        : "bg-emerald-100 text-emerald-800 border-emerald-200",
      completada: isDark
        ? "bg-indigo-500/20 text-indigo-300 border-indigo-500/30"
        : "bg-indigo-100 text-indigo-800 border-indigo-200",
      cancelada: isDark
        ? "bg-red-500/20 text-red-400 border-red-500/30"
        : "bg-red-100 text-red-800 border-red-200",
      no_asistio: isDark
        ? "bg-rose-500/20 text-rose-300 border-rose-500/30"
        : "bg-rose-100 text-rose-800 border-rose-200",
      reprogramada: isDark
        ? "bg-purple-500/20 text-purple-300 border-purple-500/30"
        : "bg-purple-100 text-purple-800 border-purple-200",
    };

    return (
      colores[estado.toLowerCase()] ||
      (isDark
        ? "bg-gray-500/20 text-gray-400 border-gray-500/30"
        : "bg-gray-100 text-gray-800 border-gray-200")
    );
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

  const obtenerColorTipoCita = (tipo: string) => {
    const tipoEncontrado = tiposCita.find(
      (t) => t.nombre.toLowerCase() === tipo.toLowerCase()
    );
    if (tipoEncontrado) {
      return tipoEncontrado.color;
    }

    switch (tipo) {
      case "primera_vez":
        return "#3b82f6";
      case "control":
        return "#10b981";
      case "procedimiento":
        return "#f59e0b";
      case "urgencia":
        return "#ef4444";
      case "telemedicina":
        return "#6366f1";
      default:
        return "#6b7280";
    }
  };

  const cambiarOrden = (campo: OrdenCampoCita) => {
    setOrdenCampo((actual) => {
      if (actual === campo) {
        setOrdenDireccion((dir) => (dir === "asc" ? "desc" : "asc"));
        return actual;
      }
      setOrdenDireccion("asc");
      return campo;
    });
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
  // CARGA DE DATOS (SESSION / DASHBOARD / TEMA / BÚSQUEDA)
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

        const tieneRolSecretaria = rolesUsuario.some((rol) =>
          rol.includes("SECRETARIA")
        );

        if (!tieneRolSecretaria) {
          alert(
            `Acceso denegado. Este panel es solo para secretarias. Tus roles actuales son: ${rolesUsuario.join(
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

  const cargarPreferenciaTema = async () => {
    try {
      const res = await fetch("/api/users/preferencias/tema", {
        method: "GET",
        credentials: "include",
      });
      const data = await res.json();
      if (data.success && data.tema_color) {
        setTemaActual(data.tema_color);
        if (typeof window !== "undefined") {
          localStorage.setItem("tema_secretaria", data.tema_color);
        }
      } else if (typeof window !== "undefined") {
        const localTema = localStorage.getItem("tema_secretaria") as TemaColor | null;
        if (localTema && TEMAS[localTema]) {
          setTemaActual(localTema);
        }
      }
    } catch (e) {
      console.error("No se pudo cargar la preferencia de tema:", e);
    }
  };

  const ejecutarBusqueda = async () => {
    if (!usuario?.secretaria?.id_secretaria) return;

    try {
      setLoadingBusqueda(true);

      const params = new URLSearchParams();
      params.append("id_secretaria", String(usuario.secretaria.id_secretaria));

      if (fechaDesde) params.append("fecha_desde", fechaDesde);
      if (fechaHasta) params.append("fecha_hasta", fechaHasta);

      if (filtroEstadoCita !== "todas") params.append("estado", filtroEstadoCita);
      if (filtroPrioridad !== "todas") params.append("prioridad", filtroPrioridad);
      if (filtroTipoCita !== "todas") params.append("tipo_cita", filtroTipoCita);
      if (filtroOrigen !== "todos") params.append("origen", filtroOrigen);
      if (soloTelemedicina) params.append("solo_telemedicina", "1");
      if (soloSinConfirmar) params.append("solo_sin_confirmar", "1");
      if (rutPacienteFiltro.trim()) params.append("rut_paciente", rutPacienteFiltro.trim());
      if (nombrePacienteFiltro.trim()) params.append("paciente", nombrePacienteFiltro.trim());
      if (nombreMedicoFiltro.trim()) params.append("medico", nombreMedicoFiltro.trim());
      if (filtroMedico !== "todos") {
        params.append("id_profesional", String(filtroMedico));
      }
      if (busqueda.trim()) params.append("q", busqueda.trim());

      const res = await fetch(
        `/api/secretaria/agenda/buscar?${params.toString()}`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        }
      );

      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data.success) {
        console.error("Respuesta búsqueda:", data);
        alert(data.message || "No se pudo obtener los resultados de búsqueda.");
        return;
      }

      setResultados((data.citas || []) as CitaBusqueda[]);
      if (Array.isArray(data.tipos_cita)) {
        setTiposCita(data.tipos_cita);
      }
      if (Array.isArray(data.medicos_asignados) && data.medicos_asignados.length > 0) {
        setMedicosAsignados(data.medicos_asignados);
      }

      setCitaSeleccionada(null);
    } catch (err) {
      console.error("Error al buscar citas:", err);
      alert("Error inesperado al realizar la búsqueda de citas.");
    } finally {
      setLoadingBusqueda(false);
    }
  };

  // ========================================
  // EFECTOS
  // ========================================

  useEffect(() => {
    cargarDatosUsuario();
    cargarPreferenciaTema();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (usuario?.secretaria) {
      cargarDatosDashboard();
      ejecutarBusqueda();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [usuario]);

  useEffect(() => {
    document.body.className = `bg-gradient-to-br ${tema.colores.fondo} min-h-screen transition-all duration-500`;
  }, [tema]);

  // ========================================
  // DERIVADOS (RESULTADOS)
  // ========================================

  const resultadosFiltrados = useMemo(() => {
    let lista = [...resultados];

    if (busqueda.trim()) {
      const q = busqueda.trim().toLowerCase();
      lista = lista.filter((c) => {
        const p = c.paciente;
        const m = c.medico;
        return (
          p.nombre_completo.toLowerCase().includes(q) ||
          (p.rut || "").toLowerCase().includes(q) ||
          (p.telefono || "").toLowerCase().includes(q) ||
          (p.celular || "").toLowerCase().includes(q) ||
          m.nombre_completo.toLowerCase().includes(q) ||
          (c.motivo || "").toLowerCase().includes(q) ||
          c.tipo_cita.toLowerCase().includes(q)
        );
      });
    }

    if (nombrePacienteFiltro.trim()) {
      const q = nombrePacienteFiltro.trim().toLowerCase();
      lista = lista.filter((c) =>
        c.paciente.nombre_completo.toLowerCase().includes(q)
      );
    }

    if (nombreMedicoFiltro.trim()) {
      const q = nombreMedicoFiltro.trim().toLowerCase();
      lista = lista.filter((c) =>
        c.medico.nombre_completo.toLowerCase().includes(q)
      );
    }

    if (rutPacienteFiltro.trim()) {
      const q = rutPacienteFiltro.trim().toLowerCase();
      lista = lista.filter((c) => (c.paciente.rut || "").toLowerCase().includes(q));
    }

    if (soloTelemedicina) {
      lista = lista.filter(
        (c) =>
          c.tipo_cita === "telemedicina" ||
          c.origen === "telemedicina" ||
          (c as CitaBusqueda).tiene_telemedicina
      );
    }

    if (soloSinConfirmar) {
      lista = lista.filter((c) => {
        const estado = (c.estado || "").toLowerCase();
        return (
          estado === "programada" ||
          estado === "en_sala_espera" ||
          estado === "en_atencion"
        );
      });
    }

    // Ordenamiento
    lista.sort((a, b) => {
      const da = obtenerFechaInicioCita(a);
      const db = obtenerFechaInicioCita(b);

      const getValue = (c: CitaBusqueda) => {
        switch (ordenCampo) {
          case "fecha":
            return obtenerFechaInicioCita(c).getTime();
          case "paciente":
            return c.paciente.nombre_completo.toLowerCase();
          case "medico":
            return c.medico.nombre_completo.toLowerCase();
          case "estado":
            return (c.estado || "").toLowerCase();
          case "tipo":
            return (c.tipo_cita || "").toLowerCase();
          case "prioridad":
            return (c.prioridad || "").toLowerCase();
          case "origen":
            return (c.origen || "").toLowerCase();
          default:
            return da.getTime();
        }
      };

      const va = getValue(a);
      const vb = getValue(b);

      if (typeof va === "number" && typeof vb === "number") {
        return ordenDireccion === "asc" ? va - vb : vb - va;
      }

      const sa = String(va);
      const sb = String(vb);
      if (sa < sb) return ordenDireccion === "asc" ? -1 : 1;
      if (sa > sb) return ordenDireccion === "asc" ? 1 : -1;
      // si empata, por fecha
      return ordenDireccion === "asc"
        ? da.getTime() - db.getTime()
        : db.getTime() - da.getTime();
    });

    return lista;
  }, [
    resultados,
    busqueda,
    nombrePacienteFiltro,
    nombreMedicoFiltro,
    rutPacienteFiltro,
    soloTelemedicina,
    soloSinConfirmar,
    ordenCampo,
    ordenDireccion,
  ]);

  const resumenBusqueda: ResumenBusqueda = useMemo(() => {
    const total = resultados.length;
    const confirmadas = resultados.filter(
      (c) => (c.estado || "").toLowerCase() === "confirmada"
    ).length;
    const canceladas = resultados.filter(
      (c) => (c.estado || "").toLowerCase() === "cancelada"
    ).length;
    const telemedicina = resultados.filter(
      (c) =>
        c.tipo_cita === "telemedicina" ||
        c.origen === "telemedicina" ||
        (c as CitaBusqueda).tiene_telemedicina
    ).length;
    const pendientes = resultados.filter((c) => {
      const e = (c.estado || "").toLowerCase();
      return e === "programada" || e === "en_sala_espera" || e === "en_atencion";
    }).length;

    const porcentajeConfirmadas =
      total > 0 ? Math.round((confirmadas / total) * 100) : 0;

    return {
      total,
      confirmadas,
      canceladas,
      pendientes,
      telemedicina,
      porcentajeConfirmadas,
    } as ResumenBusqueda & { pendientes: number };
  }, [resultados]) as ResumenBusqueda & { pendientes: number };

  // ========================================
  // HANDLERS DE FORMULARIO
  // ========================================

  const manejarSubmitFiltros = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    ejecutarBusqueda();
  };

  const limpiarFiltros = () => {
    setFechaDesde(FECHA_DESDE_DEFAULT);
    setFechaHasta(FECHA_HASTA_DEFAULT);
    setFiltroEstadoCita("todas");
    setFiltroPrioridad("todas");
    setFiltroTipoCita("todas");
    setFiltroOrigen("todos");
    setSoloTelemedicina(false);
    setSoloSinConfirmar(false);
    setRutPacienteFiltro("");
    setNombrePacienteFiltro("");
    setNombreMedicoFiltro("");
    setFiltroMedico("todos");
    setBusqueda("");
    setResultados([]);
    setCitaSeleccionada(null);
  };

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
              <Search className="w-10 h-10 text-white" />
            </div>
          </div>
          <h2 className={`text-4xl font-black mb-4 ${tema.colores.texto}`}>
            Cargando Buscador de Citas
          </h2>
          <p
            className={`text-lg font-semibold ${tema.colores.textoSecundario} animate-pulse`}
          >
            Preparando tu buscador inteligente...
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
            No tienes permisos para acceder al buscador de citas de secretaría.
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
  // RENDER PRINCIPAL
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
                  <Search className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className={`text-xl font-black ${tema.colores.texto}`}>
                    AnyssaMed
                  </h1>
                  <p className={`text-xs font-semibold ${tema.colores.acento}`}>
                    Buscador de Citas
                  </p>
                </div>
              </div>
            ) : (
              <div
                className={`w-12 h-12 bg-gradient-to-br ${tema.colores.gradiente} rounded-xl flex items-center justify-center shadow-lg mx-auto`}
              >
                <Search className="w-6 h-6 text-white" />
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

          {/* Menú */}
          <nav className="flex-1 overflow-y-auto py-6 px-3 custom-scrollbar">
            {menuItems.map((item, index) => (
              <div key={index} className="mb-1">
                <Link
                  href={item.url}
                  className={`flex items-center justify-between gap-3 px-4 py-3 rounded-xl font-semibold transition-all duration-300 group ${
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
                          className={`flex items-center gap-3 px-4 py-2 rounded-lg font-medium text-sm transition-all duration-300 ${tema.colores.hover} ${tema.colores.textoSecundario} hover:${tema.colores.acento}`}
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

          {/* Usuario abajo */}
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
          {/* Búsqueda global */}
          <div className="flex-1 max-w-2xl">
            <div className="relative">
              <Search
                className={`absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 ${tema.colores.textoSecundario}`}
              />
              <input
                type="text"
                placeholder="Buscar en resultados: paciente, cita, médico, teléfono, motivo..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    ejecutarBusqueda();
                  }
                }}
                className={`w-full pl-12 pr-20 py-3 rounded-xl ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto} placeholder:${tema.colores.textoSecundario} focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all duration-300`}
              />
              {busqueda && (
                <button
                  onClick={() => setBusqueda("")}
                  className={`absolute right-12 top-1/2 transform -translate-y-1/2 p-1 rounded-lg ${tema.colores.hover}`}
                >
                  <X className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={ejecutarBusqueda}
                className={`absolute right-2 top-1/2 transform -translate-y-1/2 px-3 py-1.5 rounded-lg text-xs font-bold ${tema.colores.primario} text-white ${tema.colores.sombra}`}
              >
                Ir
              </button>
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

            {/* Perfil */}
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
                        {usuario?.secretaria?.centro?.nombre ??
                          "Centro no asignado"}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Link
                      href="/secretaria/perfil"
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all duration-300 ${tema.colores.hover} ${tema.colores.texto}`}
                    >
                      <User className="w-5 h-5" />
                      <span>Mi Perfil</span>
                    </Link>
                    <Link
                      href="/secretaria/configuracion"
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all duration-300 ${tema.colores.hover} ${tema.colores.texto}`}
                    >
                      <Settings className="w-5 h-5" />
                      <span>Configuración</span>
                    </Link>
                    <Link
                      href="/secretaria/ayuda"
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all duration-300 ${tema.colores.hover} ${tema.colores.texto}`}
                    >
                      <Lightbulb className="w-5 h-5" />
                      <span>Ayuda</span>
                    </Link>
                    <button
                      onClick={cerrarSesion}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all duration-300 ${tema.colores.hover} text-red-500 hover:text-red-400`}
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
        {/* Título y acciones rápidas */}
        <div className="mb-8 flex flex-col xl:flex-row gap-6 xl:items-center xl:justify-between">
          <div>
            <h2
              className={`text-4xl xl:text-5xl font-black mb-2 ${tema.colores.texto} flex items-center gap-3`}
            >
              {obtenerSaludo()}, {usuario.nombre}
              <span className="animate-wave inline-block">🔍</span>
            </h2>
            <p
              className={`text-lg xl:text-xl font-semibold ${tema.colores.textoSecundario}`}
            >
              Buscador avanzado de citas de{" "}
              <span className="font-bold">
                {usuario?.secretaria?.centro?.nombre ?? "Centro no asignado"}
              </span>
              .
            </p>
            <p
              className={`text-sm mt-1 ${tema.colores.textoSecundario}`}
            >
              Explora, filtra y gestiona citas históricas, del día y futuras en un
              solo lugar.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 justify-start xl:justify-end">
            <Link
              href="/secretaria/agenda/nueva"
              className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-bold ${tema.colores.primario} text-white ${tema.colores.sombra} hover:scale-105 transition-all duration-300`}
            >
              <CalendarPlus className="w-4 h-4" />
              Nueva Cita
            </Link>
            <Link
              href="/secretaria/agenda"
              className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-bold ${tema.colores.secundario} ${tema.colores.texto} hover:scale-105 transition-all duration-300`}
            >
              <CalendarCheck className="w-4 h-4" />
              Ver Agenda del Día
            </Link>
          </div>
        </div>

        {/* Resumen de búsqueda */}
        <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-5 gap-4 mb-8">
          {/* Total resultados */}
          <div
            className={`rounded-2xl p-4 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} hover:scale-105 hover:-translate-y-1 transition-all duration-300`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg">
                <Search className="w-5 h-5 text-white" />
              </div>
              <span className="text-xs font-bold uppercase text-indigo-400">
                Resultados
              </span>
            </div>
            <p className={`text-2xl font-black ${tema.colores.texto}`}>
              {resumenBusqueda.total}
            </p>
            <p className={`text-xs font-semibold ${tema.colores.textoSecundario}`}>
              Citas encontradas
            </p>
          </div>

          {/* Confirmadas */}
          <div
            className={`rounded-2xl p-4 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} hover:scale-105 hover:-translate-y-1 transition-all duration-300`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-green-500 flex items-center justify-center shadow-lg">
                <CheckCircle2 className="w-5 h-5 text-white" />
              </div>
              <span className="text-xs font-bold uppercase text-emerald-300">
                Confirmadas
              </span>
            </div>
            <p className={`text-2xl font-black ${tema.colores.texto}`}>
              {resumenBusqueda.confirmadas}
            </p>
            <p className={`text-xs font-semibold ${tema.colores.textoSecundario}`}>
              {resumenBusqueda.porcentajeConfirmadas}% del total
            </p>
          </div>

          {/* Pendientes */}
          <div
            className={`rounded-2xl p-4 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} hover:scale-105 hover:-translate-y-1 transition-all duration-300`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-lg">
                <Clock className="w-5 h-5 text-white" />
              </div>
              <span className="text-xs font-bold uppercase text-amber-300">
                Pendientes
              </span>
            </div>
            <p className={`text-2xl font-black ${tema.colores.texto}`}>
              {(resumenBusqueda as any).pendientes ?? 0}
            </p>
            <p className={`text-xs font-semibold ${tema.colores.textoSecundario}`}>
              Aún sin confirmar/atender
            </p>
          </div>

          {/* Canceladas */}
          <div
            className={`rounded-2xl p-4 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} hover:scale-105 hover:-translate-y-1 transition-all duration-300`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-rose-500 flex items-center justify-center shadow-lg">
                <X className="w-5 h-5 text-white" />
              </div>
              <span className="text-xs font-bold uppercase text-rose-300">
                Canceladas
              </span>
            </div>
            <p className={`text-2xl font-black ${tema.colores.texto}`}>
              {resumenBusqueda.canceladas}
            </p>
            <p className={`text-xs font-semibold ${tema.colores.textoSecundario}`}>
              Incluye reprogramaciones
            </p>
          </div>

          {/* Telemedicina */}
          <div
            className={`rounded-2xl p-4 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} hover:scale-105 hover:-translate-y-1 transition-all duration-300`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500 to-blue-500 flex items-center justify-center shadow-lg">
                <Video className="w-5 h-5 text-white" />
              </div>
              <span className="text-xs font-bold uppercase text-sky-300">
                Telemedicina
              </span>
            </div>
            <p className={`text-2xl font-black ${tema.colores.texto}`}>
              {resumenBusqueda.telemedicina}
            </p>
            <p className={`text-xs font-semibold ${tema.colores.textoSecundario}`}>
              Citas con componente virtual
            </p>
          </div>
        </div>

        {/* Layout filtros + resultados */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Filtros avanzados */}
          <section
            className={`xl:col-span-1 rounded-2xl p-6 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra}`}
          >
            <div className="flex items-center gap-3 mb-4">
              <div
                className={`w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg`}
              >
                <Filter className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3
                  className={`text-xl font-black ${tema.colores.texto}`}
                >
                  Filtros de búsqueda
                </h3>
                <p
                  className={`text-xs font-semibold ${tema.colores.textoSecundario}`}
                >
                  Acota las citas por fecha, estado, prioridad, tipo y más.
                </p>
              </div>
            </div>

            <form
              onSubmit={manejarSubmitFiltros}
              className="space-y-4 text-xs sm:text-sm"
            >
              {/* Rango fechas */}
              <div>
                <label className="block mb-1 font-semibold">
                  Rango de fechas
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="date"
                    value={fechaDesde}
                    onChange={(e) => setFechaDesde(e.target.value)}
                    className={`w-full px-3 py-2 rounded-xl ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto}`}
                  />
                  <input
                    type="date"
                    value={fechaHasta}
                    onChange={(e) => setFechaHasta(e.target.value)}
                    className={`w-full px-3 py-2 rounded-xl ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto}`}
                  />
                </div>
                <p
                  className={`text-[0.7rem] mt-1 ${tema.colores.textoSecundario}`}
                >
                  Según <strong>fecha/hora inicio</strong> de la cita.
                </p>
              </div>

              {/* Identificación paciente */}
              <div className="grid grid-cols-1 gap-2">
                <div>
                  <label className="block mb-1 font-semibold">
                    RUT paciente
                  </label>
                  <input
                    type="text"
                    value={rutPacienteFiltro}
                    onChange={(e) => setRutPacienteFiltro(e.target.value)}
                    placeholder="Ej: 12.345.678-9"
                    className={`w-full px-3 py-2 rounded-xl ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto}`}
                  />
                </div>
                <div>
                  <label className="block mb-1 font-semibold">
                    Nombre paciente
                  </label>
                  <input
                    type="text"
                    value={nombrePacienteFiltro}
                    onChange={(e) => setNombrePacienteFiltro(e.target.value)}
                    placeholder="Nombre o apellidos"
                    className={`w-full px-3 py-2 rounded-xl ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto}`}
                  />
                </div>
              </div>

              {/* Médico */}
              <div>
                <label className="block mb-1 font-semibold">Médico</label>
                <select
                  value={
                    filtroMedico === "todos" ? "todos" : String(filtroMedico)
                  }
                  onChange={(e) =>
                    setFiltroMedico(
                      e.target.value === "todos"
                        ? "todos"
                        : Number(e.target.value)
                    )
                  }
                  className={`w-full px-3 py-2 rounded-xl mb-2 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto}`}
                >
                  <option value="todos">Todos los médicos</option>
                  {medicosAsignados.map((m) => (
                    <option key={m.id_profesional} value={m.id_profesional}>
                      {m.nombre_completo} · {m.especialidad}
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  value={nombreMedicoFiltro}
                  onChange={(e) => setNombreMedicoFiltro(e.target.value)}
                  placeholder="Buscar por nombre de médico"
                  className={`w-full px-3 py-2 rounded-xl ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto}`}
                />
              </div>

              {/* Estado / Prioridad / Tipo */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div>
                  <label className="block mb-1 font-semibold">
                    Estado
                  </label>
                  <select
                    value={filtroEstadoCita}
                    onChange={(e) => setFiltroEstadoCita(e.target.value)}
                    className={`w-full px-3 py-2 rounded-xl ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto}`}
                  >
                    <option value="todas">Todos</option>
                    <option value="programada">Programada</option>
                    <option value="confirmada">Confirmada</option>
                    <option value="en_sala_espera">En sala de espera</option>
                    <option value="en_atencion">En atención</option>
                    <option value="completada">Completada</option>
                    <option value="cancelada">Cancelada</option>
                    <option value="no_asistio">No asistió</option>
                    <option value="reprogramada">Reprogramada</option>
                  </select>
                </div>
                <div>
                  <label className="block mb-1 font-semibold">
                    Prioridad
                  </label>
                  <select
                    value={filtroPrioridad}
                    onChange={(e) => setFiltroPrioridad(e.target.value)}
                    className={`w-full px-3 py-2 rounded-xl ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto}`}
                  >
                    <option value="todas">Todas</option>
                    <option value="urgente">Urgente</option>
                    <option value="alta">Alta</option>
                    <option value="normal">Normal</option>
                  </select>
                </div>
                <div>
                  <label className="block mb-1 font-semibold">
                    Tipo cita
                  </label>
                  <select
                    value={filtroTipoCita}
                    onChange={(e) => setFiltroTipoCita(e.target.value)}
                    className={`w-full px-3 py-2 rounded-xl ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto}`}
                  >
                    <option value="todas">Todos</option>
                    {tiposCita.map((t) => (
                      <option key={t.id_tipo_cita} value={t.nombre}>
                        {t.nombre}
                      </option>
                    ))}
                    {tiposCita.length === 0 && (
                      <>
                        <option value="primera_vez">Primera vez</option>
                        <option value="control">Control</option>
                        <option value="procedimiento">Procedimiento</option>
                        <option value="urgencia">Urgencia</option>
                        <option value="telemedicina">Telemedicina</option>
                      </>
                    )}
                  </select>
                </div>
              </div>

              {/* Origen / flags */}
              <div>
                <label className="block mb-1 font-semibold">Origen</label>
                <select
                  value={filtroOrigen}
                  onChange={(e) => setFiltroOrigen(e.target.value)}
                  className={`w-full px-3 py-2 rounded-xl mb-2 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto}`}
                >
                  <option value="todos">Todos</option>
                  <option value="presencial">Presencial</option>
                  <option value="telefono">Teléfono</option>
                  <option value="web">Web</option>
                  <option value="whatsapp">WhatsApp</option>
                  <option value="chatbot">Chatbot</option>
                  <option value="app_movil">App móvil</option>
                </select>

                <div className="flex flex-col gap-1">
                  <label className="inline-flex items-center gap-2 text-xs sm:text-sm cursor-pointer">
                    <input
                      type="checkbox"
                      checked={soloTelemedicina}
                      onChange={(e) => setSoloTelemedicina(e.target.checked)}
                      className="rounded-md"
                    />
                    <span className="font-semibold">
                      Solo citas con telemedicina
                    </span>
                  </label>
                  <label className="inline-flex items-center gap-2 text-xs sm:text-sm cursor-pointer">
                    <input
                      type="checkbox"
                      checked={soloSinConfirmar}
                      onChange={(e) => setSoloSinConfirmar(e.target.checked)}
                      className="rounded-md"
                    />
                    <span className="font-semibold">
                      Solo citas sin confirmación de asistencia
                    </span>
                  </label>
                </div>
              </div>

              {/* Botones */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  type="submit"
                  disabled={loadingBusqueda}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-xs sm:text-sm font-bold ${tema.colores.primario} text-white ${tema.colores.sombra} hover:scale-105 transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed`}
                >
                  {loadingBusqueda ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Search className="w-4 h-4" />
                  )}
                  {loadingBusqueda ? "Buscando..." : "Buscar citas"}
                </button>
                <button
                  type="button"
                  onClick={limpiarFiltros}
                  className={`px-4 py-3 rounded-xl text-xs sm:text-sm font-bold ${tema.colores.secundario} ${tema.colores.texto}`}
                >
                  Limpiar filtros
                </button>
              </div>

              <div
                className={`mt-3 p-3 rounded-xl text-[0.7rem] ${tema.colores.hover}`}
              >
                <p className={`${tema.colores.textoSecundario}`}>
                  Consejo: combina el texto de la parte superior con estos
                  filtros para localizar una cita específica en segundos.
                </p>
              </div>
            </form>
          </section>

          {/* Resultados y detalle */}
          <section className="xl:col-span-2 space-y-6">
            {/* Resultados */}
            <div
              className={`rounded-2xl p-6 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra}`}
            >
              <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-12 h-12 bg-gradient-to-br ${tema.colores.gradiente} rounded-xl flex items-center justify-center shadow-lg`}
                  >
                    <ClipboardList className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3
                      className={`text-xl font-black ${tema.colores.texto}`}
                    >
                      Resultados de búsqueda
                    </h3>
                    <p
                      className={`text-xs sm:text-sm font-semibold ${tema.colores.textoSecundario}`}
                    >
                      Mostrando {resultadosFiltrados.length} de{" "}
                      {resumenBusqueda.total} resultados totales en el rango{" "}
                      <strong>
                        {fechaDesde || "sin inicio"} — {fechaHasta || "sin fin"}
                      </strong>
                      .
                    </p>
                  </div>
                </div>

                <button
                  onClick={ejecutarBusqueda}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold ${tema.colores.secundario} ${tema.colores.texto} hover:scale-105 transition-all duration-300`}
                >
                  <RefreshCw
                    className={`w-4 h-4 ${loadingBusqueda ? "animate-spin" : ""}`}
                  />
                  Actualizar
                </button>
              </div>

              {/* Orden */}
              <div className="flex flex-wrap items-center justify-between gap-3 mb-3 text-xs sm:text-sm">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`font-semibold ${tema.colores.textoSecundario}`}>
                    Ordenar por:
                  </span>
                  {(
                    [
                      ["fecha", "Fecha / hora"],
                      ["paciente", "Paciente"],
                      ["medico", "Médico"],
                      ["estado", "Estado"],
                      ["tipo", "Tipo"],
                      ["prioridad", "Prioridad"],
                    ] as [OrdenCampoCita, string][]
                  ).map(([campo, label]) => (
                    <button
                      key={campo}
                      type="button"
                      onClick={() => cambiarOrden(campo)}
                      className={`px-2.5 py-1.5 rounded-full flex items-center gap-1 font-semibold ${
                        ordenCampo === campo
                          ? `bg-gradient-to-r ${tema.colores.gradiente} text-white`
                          : `${tema.colores.hover} ${tema.colores.texto}`
                      }`}
                    >
                      <span>{label}</span>
                      {ordenCampo === campo && (
                        <ChevronDown
                          className={`w-3 h-3 ${
                            ordenDireccion === "asc" ? "rotate-180" : ""
                          }`}
                        />
                      )}
                    </button>
                  ))}
                </div>
                <span className={`text-[0.7rem] ${tema.colores.textoSecundario}`}>
                  Haz clic en una fila para ver el detalle a la derecha.
                </span>
              </div>

              {/* Tabla / tarjetas */}
              {loadingBusqueda ? (
                <div className="flex items-center justify-center py-16">
                  <div className="text-center">
                    <Loader2 className="w-10 h-10 animate-spin text-indigo-500 mx-auto mb-3" />
                    <p
                      className={`text-sm font-semibold ${tema.colores.textoSecundario}`}
                    >
                      Buscando citas coincidentes...
                    </p>
                  </div>
                </div>
              ) : resultadosFiltrados.length === 0 ? (
                <div className="text-center py-16">
                  <div
                    className={`w-24 h-24 bg-gradient-to-br ${tema.colores.gradiente} rounded-full flex items-center justify-center mx-auto mb-4`}
                  >
                    <Calendar className="w-12 h-12 text-white" />
                  </div>
                  <p
                    className={`text-xl font-bold ${tema.colores.texto} mb-2`}
                  >
                    Sin resultados para estos filtros
                  </p>
                  <p
                    className={`text-sm ${tema.colores.textoSecundario}`}
                  >
                    Ajusta el rango de fechas o simplifica los filtros para
                    ampliar la búsqueda.
                  </p>
                </div>
              ) : (
                <>
                  {/* Vista tabla para escritorio */}
                  <div className="hidden md:block max-h-[520px] overflow-y-auto custom-scrollbar">
                    <table className="w-full text-xs sm:text-sm">
                      <thead>
                        <tr className="sticky top-0 z-10">
                          <th
                            className={`px-3 py-2 text-left font-bold text-[0.7rem] uppercase ${tema.colores.textoSecundario} bg-opacity-80 backdrop-blur-md ${tema.colores.fondoSecundario}`}
                          >
                            Fecha / Hora
                          </th>
                          <th
                            className={`px-3 py-2 text-left font-bold text-[0.7rem] uppercase ${tema.colores.textoSecundario} bg-opacity-80 backdrop-blur-md ${tema.colores.fondoSecundario}`}
                          >
                            Paciente
                          </th>
                          <th
                            className={`px-3 py-2 text-left font-bold text-[0.7rem] uppercase ${tema.colores.textoSecundario} bg-opacity-80 backdrop-blur-md ${tema.colores.fondoSecundario}`}
                          >
                            Médico
                          </th>
                          <th
                            className={`px-3 py-2 text-left font-bold text-[0.7rem] uppercase ${tema.colores.textoSecundario} bg-opacity-80 backdrop-blur-md ${tema.colores.fondoSecundario}`}
                          >
                            Tipo / Prioridad
                          </th>
                          <th
                            className={`px-3 py-2 text-left font-bold text-[0.7rem] uppercase ${tema.colores.textoSecundario} bg-opacity-80 backdrop-blur-md ${tema.colores.fondoSecundario}`}
                          >
                            Estado / Origen
                          </th>
                          <th
                            className={`px-3 py-2 text-left font-bold text-[0.7rem] uppercase ${tema.colores.textoSecundario} bg-opacity-80 backdrop-blur-md ${tema.colores.fondoSecundario}`}
                          >
                            Acciones
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {resultadosFiltrados.map((cita) => {
                          const d = obtenerFechaInicioCita(cita);
                          const tipoColor = obtenerColorTipoCita(cita.tipo_cita);
                          const selected =
                            citaSeleccionada &&
                            citaSeleccionada.id_cita === cita.id_cita;

                          return (
                            <tr
                              key={cita.id_cita}
                              className={`border-t ${tema.colores.borde} cursor-pointer transition-all duration-200 ${
                                selected ? "bg-indigo-500/10" : tema.colores.hover
                              }`}
                              onClick={() => setCitaSeleccionada(cita)}
                            >
                              <td className="px-3 py-2 align-top">
                                <div className="flex flex-col">
                                  <span
                                    className={`font-bold ${tema.colores.texto}`}
                                  >
                                    {formatearHora(d)}
                                  </span>
                                  <span
                                    className={`text-[0.65rem] ${tema.colores.textoSecundario}`}
                                  >
                                    {formatearFechaCorta(d)}
                                  </span>
                                  <span
                                    className={`text-[0.65rem] ${tema.colores.textoSecundario}`}
                                  >
                                    {cita.duracion_minutos} min
                                  </span>
                                </div>
                              </td>
                              <td className="px-3 py-2 align-top">
                                <div className="flex flex-col gap-1">
                                  <span
                                    className={`font-bold ${tema.colores.texto}`}
                                  >
                                    {cita.paciente.nombre_completo}
                                  </span>
                                  <div className="flex flex-wrap gap-1 text-[0.65rem]">
                                    {cita.paciente.rut && (
                                      <span className={tema.colores.textoSecundario}>
                                        RUT: {cita.paciente.rut}
                                      </span>
                                    )}
                                    {cita.paciente.telefono && (
                                      <a
                                        href={`tel:${cita.paciente.telefono}`}
                                        className={`flex items-center gap-1 ${tema.colores.textoSecundario}`}
                                      >
                                        <Phone className="w-3 h-3" />
                                        {cita.paciente.telefono}
                                      </a>
                                    )}
                                    {cita.paciente.celular && (
                                      <a
                                        href={`tel:${cita.paciente.celular}`}
                                        className={`flex items-center gap-1 ${tema.colores.textoSecundario}`}
                                      >
                                        <PhoneCall className="w-3 h-3" />
                                        {cita.paciente.celular}
                                      </a>
                                    )}
                                  </div>
                                </div>
                              </td>
                              <td className="px-3 py-2 align-top">
                                <div className="flex flex-col">
                                  <span
                                    className={`font-semibold ${tema.colores.texto}`}
                                  >
                                    {cita.medico.nombre_completo}
                                  </span>
                                  <span
                                    className={`text-[0.65rem] ${tema.colores.textoSecundario}`}
                                  >
                                    {cita.medico.especialidad}
                                  </span>
                                  {(cita as CitaBusqueda).valoracion_promedio && (
                                    <span className="text-[0.65rem] text-yellow-400 font-bold">
                                      ★ {(
                                        cita as CitaBusqueda
                                      ).valoracion_promedio?.toFixed(1)}
                                    </span>
                                  )}
                                </div>
                              </td>
                              <td className="px-3 py-2 align-top">
                                <div className="flex flex-col gap-1">
                                  <span
                                    className="px-2 py-1 rounded-full text-[0.65rem] font-bold text-white"
                                    style={{ backgroundColor: tipoColor }}
                                  >
                                    {cita.tipo_cita}
                                  </span>
                                  <span
                                    className={`px-2 py-1 rounded-full text-[0.65rem] font-bold border ${obtenerColorPrioridad(
                                      cita.prioridad || "normal"
                                    )}`}
                                  >
                                    {cita.prioridad || "normal"}
                                  </span>
                                </div>
                              </td>
                              <td className="px-3 py-2 align-top">
                                <div className="flex flex-col gap-1">
                                  <span
                                    className={`px-2 py-1 rounded-full text-[0.65rem] font-bold border ${obtenerColorEstado(
                                      cita.estado || "programada"
                                    )}`}
                                  >
                                    {cita.estado}
                                  </span>
                                  <span
                                    className={`text-[0.65rem] ${tema.colores.textoSecundario}`}
                                  >
                                    Origen: {cita.origen}
                                  </span>
                                  {(cita as CitaBusqueda).tiene_telemedicina && (
                                    <span className="text-[0.65rem] text-sky-400 flex items-center gap-1">
                                      <Video className="w-3 h-3" />
                                      Telemedicina
                                    </span>
                                  )}
                                </div>
                              </td>
                              <td className="px-3 py-2 align-top">
                                <div className="flex flex-col gap-1">
                                  <Link
                                    href={`/secretaria/agenda/cita/${cita.id_cita}`}
                                    className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-[0.7rem] font-bold ${tema.colores.primario} text-white ${tema.colores.sombra} hover:scale-105 transition-all`}
                                  >
                                    <Eye className="w-3 h-3" />
                                    Detalle
                                  </Link>
                                  <Link
                                    href={`/secretaria/pacientes/${cita.paciente.id_paciente}`}
                                    className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-[0.7rem] font-bold ${tema.colores.secundario} ${tema.colores.texto} hover:scale-105 transition-all`}
                                  >
                                    <ClipboardCheck className="w-3 h-3" />
                                    Ficha
                                  </Link>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Vista tarjetas para móvil */}
                  <div className="md:hidden space-y-3 max-h-[520px] overflow-y-auto custom-scrollbar mt-3">
                    {resultadosFiltrados.map((cita) => {
                      const d = obtenerFechaInicioCita(cita);
                      const tipoColor = obtenerColorTipoCita(cita.tipo_cita);
                      const selected =
                        citaSeleccionada &&
                        citaSeleccionada.id_cita === cita.id_cita;

                      return (
                        <div
                          key={cita.id_cita}
                          className={`p-4 rounded-2xl border ${tema.colores.borde} ${tema.colores.card} ${tema.colores.sombra} flex gap-3 cursor-pointer transition-all duration-200 ${
                            selected ? "scale-[1.02]" : ""
                          }`}
                          onClick={() => setCitaSeleccionada(cita)}
                        >
                          <div
                            className={`w-10 h-10 rounded-xl bg-gradient-to-br ${tema.colores.gradiente} flex items-center justify-center text-white text-xs font-bold`}
                          >
                            {cita.paciente.nombre_completo
                              .split(" ")
                              .map((n) => n[0])
                              .join("")
                              .substring(0, 2)}
                          </div>
                          <div className="flex-1 min-w-0 space-y-1">
                            <div className="flex items-center justify-between gap-2">
                              <p
                                className={`text-sm font-bold ${tema.colores.texto} truncate`}
                              >
                                {cita.paciente.nombre_completo}
                              </p>
                              <span
                                className={`px-2 py-0.5 rounded-full text-[0.6rem] font-bold border ${obtenerColorEstado(
                                  cita.estado
                                )}`}
                              >
                                {cita.estado}
                              </span>
                            </div>
                            <p
                              className={`text-[0.65rem] ${tema.colores.textoSecundario}`}
                            >
                              {formatearHora(d)} · {formatearFechaCorta(d)} ·{" "}
                              {cita.duracion_minutos} min
                            </p>
                            <p
                              className={`text-[0.65rem] ${tema.colores.textoSecundario} flex items-center gap-1`}
                            >
                              <Stethoscope className="w-3 h-3" />
                              {cita.medico.nombre_completo} ·{" "}
                              {cita.medico.especialidad}
                            </p>
                            <div className="flex flex-wrap gap-1 mt-1">
                              <span
                                className="px-2 py-0.5 rounded-full text-[0.6rem] font-bold text-white"
                                style={{ backgroundColor: tipoColor }}
                              >
                                {cita.tipo_cita}
                              </span>
                              <span
                                className={`px-2 py-0.5 rounded-full text-[0.6rem] font-bold border ${obtenerColorPrioridad(
                                  cita.prioridad || "normal"
                                )}`}
                              >
                                {cita.prioridad || "normal"}
                              </span>
                              {(cita as CitaBusqueda).tiene_telemedicina && (
                                <span className="px-2 py-0.5 rounded-full text-[0.6rem] font-bold bg-sky-500/20 text-sky-300 border border-sky-500/40 flex items-center gap-1">
                                  <Video className="w-3 h-3" />
                                  Telemedicina
                                </span>
                              )}
                            </div>
                            <div className="flex flex-wrap gap-2 mt-2 text-[0.65rem]">
                              <Link
                                href={`/secretaria/agenda/cita/${cita.id_cita}`}
                                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-xl font-bold ${tema.colores.primario} text-white ${tema.colores.sombra}`}
                              >
                                <Eye className="w-3 h-3" />
                                Detalle
                              </Link>
                              <Link
                                href={`/secretaria/pacientes/${cita.paciente.id_paciente}`}
                                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-xl font-bold ${tema.colores.secundario} ${tema.colores.texto}`}
                              >
                                <ClipboardCheck className="w-3 h-3" />
                                Ficha
                              </Link>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </div>

            {/* Detalle de cita seleccionada */}
            <div
              className={`rounded-2xl p-6 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra}`}
            >
              <div className="flex items-center gap-3 mb-4">
                <div
                  className={`w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center shadow-lg`}
                >
                  <Eye className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3
                    className={`text-xl font-black ${tema.colores.texto}`}
                  >
                    Detalle de la cita
                  </h3>
                  <p
                    className={`text-xs font-semibold ${tema.colores.textoSecundario}`}
                  >
                    Selecciona una cita en la tabla para ver más información
                    aquí.
                  </p>
                </div>
              </div>

              {!citaSeleccionada ? (
                <div className="text-center py-10">
                  <p
                    className={`text-sm ${tema.colores.textoSecundario}`}
                  >
                    No hay ninguna cita seleccionada todavía.
                  </p>
                </div>
              ) : (
                (() => {
                  const cita = citaSeleccionada;
                  const d = obtenerFechaInicioCita(cita);
                  const tipoColor = obtenerColorTipoCita(cita.tipo_cita);

                  return (
                    <div className="space-y-4 text-xs sm:text-sm">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-12 h-12 rounded-xl bg-gradient-to-br ${tema.colores.gradiente} flex items-center justify-center text-white font-bold text-lg`}
                          >
                            {cita.paciente.nombre_completo
                              .split(" ")
                              .map((n) => n[0])
                              .join("")
                              .substring(0, 2)}
                          </div>
                          <div>
                            <p
                              className={`text-lg font-black ${tema.colores.texto}`}
                            >
                              {cita.paciente.nombre_completo}
                            </p>
                            <p
                              className={`text-xs ${tema.colores.textoSecundario}`}
                            >
                              {cita.paciente.rut && `RUT: ${cita.paciente.rut}`}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p
                            className={`text-sm font-bold ${tema.colores.texto}`}
                          >
                            {formatearFechaLarga(d)}
                          </p>
                          <p
                            className={`text-xs ${tema.colores.textoSecundario}`}
                          >
                            {formatearHora(d)} · {cita.duracion_minutos} min
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div
                          className={`rounded-xl px-3 py-2 ${tema.colores.hover}`}
                        >
                          <p
                            className={`font-bold mb-1 ${tema.colores.texto}`}
                          >
                            Médico
                          </p>
                          <p className={tema.colores.textoSecundario}>
                            {cita.medico.nombre_completo}
                          </p>
                          <p
                            className={`text-[0.7rem] ${tema.colores.textoSecundario}`}
                          >
                            {cita.medico.especialidad}
                          </p>
                        </div>
                        <div
                          className={`rounded-xl px-3 py-2 ${tema.colores.hover}`}
                        >
                          <p
                            className={`font-bold mb-1 ${tema.colores.texto}`}
                          >
                            Contacto paciente
                          </p>
                          <div className="space-y-0.5">
                            {cita.paciente.telefono && (
                              <p className={tema.colores.textoSecundario}>
                                Tel: {cita.paciente.telefono}
                              </p>
                            )}
                            {cita.paciente.celular && (
                              <p className={tema.colores.textoSecundario}>
                                Cel: {cita.paciente.celular}
                              </p>
                            )}
                            {cita.paciente.email && (
                              <p className={tema.colores.textoSecundario}>
                                Email: {cita.paciente.email}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div
                          className={`rounded-xl px-3 py-2 ${tema.colores.hover}`}
                        >
                          <p
                            className={`font-bold mb-1 ${tema.colores.texto}`}
                          >
                            Tipo y prioridad
                          </p>
                          <div className="flex flex-wrap gap-1">
                            <span
                              className="px-2 py-1 rounded-full text-[0.7rem] font-bold text-white"
                              style={{ backgroundColor: tipoColor }}
                            >
                              {cita.tipo_cita}
                            </span>
                            <span
                              className={`px-2 py-1 rounded-full text-[0.7rem] font-bold border ${obtenerColorPrioridad(
                                cita.prioridad || "normal"
                              )}`}
                            >
                              {cita.prioridad || "normal"}
                            </span>
                          </div>
                          <p
                            className={`text-[0.7rem] mt-1 ${tema.colores.textoSecundario}`}
                          >
                            Origen: {cita.origen}
                          </p>
                        </div>
                        <div
                          className={`rounded-xl px-3 py-2 ${tema.colores.hover}`}
                        >
                          <p
                            className={`font-bold mb-1 ${tema.colores.texto}`}
                          >
                            Estado
                          </p>
                          <span
                            className={`inline-flex items-center px-2 py-1 rounded-full text-[0.7rem] font-bold border ${obtenerColorEstado(
                              cita.estado
                            )}`}
                          >
                            {cita.estado}
                          </span>
                          {(cita as CitaBusqueda).cantidad_confirmaciones !=
                            null && (
                            <p
                              className={`text-[0.7rem] mt-1 ${tema.colores.textoSecundario}`}
                            >
                              Confirmaciones registradas:{" "}
                              {(cita as CitaBusqueda).cantidad_confirmaciones ??
                                0}
                            </p>
                          )}
                        </div>
                        <div
                          className={`rounded-xl px-3 py-2 ${tema.colores.hover}`}
                        >
                          <p
                            className={`font-bold mb-1 ${tema.colores.texto}`}
                          >
                            Telemedicina / rating
                          </p>
                          {(cita as CitaBusqueda).tiene_telemedicina ? (
                            <p className="text-[0.7rem] text-sky-300 flex items-center gap-1">
                              <Video className="w-3 h-3" />
                              Sesión de telemedicina asociada.
                            </p>
                          ) : (
                            <p
                              className={`text-[0.7rem] ${tema.colores.textoSecundario}`}
                            >
                              Sin telemedicina asociada.
                            </p>
                          )}
                          {(cita as CitaBusqueda).valoracion_promedio && (
                            <p className="text-[0.7rem] text-yellow-400 font-bold">
                              ★ Valoración promedio del médico:{" "}
                              {(cita as CitaBusqueda).valoracion_promedio?.toFixed(
                                1
                              )}
                            </p>
                          )}
                        </div>
                      </div>

                      {cita.motivo && (
                        <div
                          className={`rounded-xl px-3 py-2 ${tema.colores.hover}`}
                        >
                          <p
                            className={`font-bold mb-1 ${tema.colores.texto}`}
                          >
                            Motivo de la consulta
                          </p>
                          <p className={tema.colores.textoSecundario}>
                            {cita.motivo}
                          </p>
                        </div>
                      )}

                      {(cita as CitaBusqueda).motivo_cancelacion && (
                        <div
                          className={`rounded-xl px-3 py-2 border border-red-400/60 bg-red-500/5`}
                        >
                          <p className="text-xs font-bold text-red-400 mb-1 flex items-center gap-1">
                            <AlertCircle className="w-4 h-4" />
                            Detalle cancelación
                          </p>
                          <p className="text-[0.75rem] text-red-200">
                            {(cita as CitaBusqueda).motivo_cancelacion}
                          </p>
                        </div>
                      )}

                      <div className="flex flex-wrap gap-2 pt-2">
                        <Link
                          href={`/secretaria/agenda/cita/${cita.id_cita}`}
                          className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold ${tema.colores.primario} text-white ${tema.colores.sombra} hover:scale-105 transition-all`}
                        >
                          <CalendarCheck className="w-4 h-4" />
                          Abrir ficha de la cita
                        </Link>
                        <Link
                          href={`/secretaria/pacientes/${cita.paciente.id_paciente}`}
                          className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold ${tema.colores.secundario} ${tema.colores.texto} hover:scale-105 transition-all`}
                        >
                          <User className="w-4 h-4" />
                          Ver paciente
                        </Link>
                      </div>
                    </div>
                  );
                })()
              )}
            </div>
          </section>
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
                © 2025 AnyssaMed · Módulo de Búsqueda de Citas.
              </p>
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r ${tema.colores.gradiente} text-white`}
              >
                v1.0.0
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

// Icono Filter usado en la sección de filtros
function Filter(props: any) {
  return <BarChart3 {...props} />;
}
