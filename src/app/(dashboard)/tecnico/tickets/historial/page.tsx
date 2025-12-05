"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import SidebarTecnico from "@/components/tecnico/SidebarTecnico";

import {
  Activity,
  AlertCircle,
  AlertTriangle,
  Award,
  BarChart3,
  Bell,
  BellOff,
  Briefcase,
  Calendar,
  Calculator,
  CalendarCheck,
  CalendarClock,
  Headset,
  CalendarDays,
  CalendarPlus,
  CalendarRange,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Clock,
  ClipboardCheck,
  ClipboardList,
  Cloud,
  CreditCard,
  Database,
  DollarSign,
  Download,
  Eye,
  EyeOff,
  FileSpreadsheet,
  FileText,
  Filter,
  Flame,
  Gift,
  Globe,
  Heart,
  HeartPulse,
  Home,
  Layers,
  Lightbulb,
  LineChart,
  Loader2,
  Lock,
  LogOut,
  Mail,
  MapPin,
  MessageSquare,
  Mic,
  Moon,
  MoreVertical,
  Paperclip,
  Percent,
  Phone,
  PhoneCall,
  PhoneIncoming,
  PhoneOutgoing,
  PieChart,
  Pill,
  Plus,
  Printer,
  RefreshCw,
  Search,
  Send,
  Settings,
  Share2,
  Shield,
  ShieldCheck,
  Star,
  Stethoscope,
  Sun,
  Target,
  TrendingDown,
  TrendingUp,
  Upload,
  User,
  UserCheck,
  UserCog,
  UserPlus,
  Users,
  Video,
  Wifi,
  WifiOff,
  X,
  Zap,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  BrainCircuit,
  Microscope,
  TestTube,
  Syringe,
  Ambulance,
  Building2,
  GraduationCap,
  Handshake,
  Rocket,
  CheckSquare,
  Square,
  Clock3,
  AlertOctagon,
  UserX,
  Wrench,
  Hammer,
  Cpu,
  HardDrive,
  Zap as ZapIcon,
  AlertCircle as AlertCircleIcon,
  MapPin as MapPinIcon,
  Phone as PhoneIcon,
  History,
  TrendingUp as TrendingUpIcon,
  Package,
  Boxes,
  FileCheck,
  FileClock,
  FileX,
  Gauge,
  Timer,
  Hourglass,
  PlayCircle,
  PauseCircle,
  StopCircle,
  FastForward,
  Rewind,
  SkipForward,
  SkipBack,
  Maximize2,
  Minimize2,
  ZoomIn,
  ZoomOut,
  Move,
  Copy,
  Clipboard,
  ExternalLink,
  Info,
  HelpCircle,
  BookOpen,
  FileSignature,
  Stamp,
  BadgeCheck,
  ShieldAlert,
  AlertTriangle as AlertTriangleIcon,
} from "lucide-react";

// ========================================
// TIPOS DE DATOS
// ========================================

type TemaColor = "light" | "dark" | "blue" | "purple" | "green";

type RangoRapido = "7d" | "30d" | "90d" | "year" | "todo";

type VistaHistorial = "timeline" | "tabla" | "kanban" | "calendario";

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
  tecnico?: {
    id_tecnico: number;
    id_centro: number;
    id_sucursal: number | null;
    id_departamento: number | null;
    area_tecnica: string;
    tipo_tecnico: "soporte" | "mantenimiento" | "ingenieria" | "biomedico";
    extension_telefonica: string | null;
    estado: "activo" | "inactivo" | "suspendido" | "vacaciones";
    disponibilidad: "disponible" | "ocupado" | "fuera_servicio";
    turno: "matutino" | "vespertino" | "nocturno" | "rotativo";
    nivel_acceso: "basico" | "intermedio" | "avanzado" | "administrador";
    pais: string;
    region: string;
    zona_horaria: string;
    centro: {
      id_centro: number;
      nombre: string;
      logo_url: string | null;
      ciudad: string;
      region: string;
    };
    es_global: boolean;
  };
}

interface EstadisticasTecnico {
  tickets_asignados_hoy: number;
  tickets_abiertos: number;
  tickets_en_progreso: number;
  tickets_resueltos_hoy: number;
  tickets_pendientes_confirmacion: number;
  tiempo_promedio_resolucion: number;
  mensajes_sin_leer: number;
  calificacion_promedio: number;
  disponibilidad_porcentaje: number;
  llamadas_realizadas_hoy: number;
  equipos_mantenidos_semana: number;
  tareas_pendientes: number;
  alertas_activas: number;
}

interface Ticket {
  id_ticket: number;
  numero_ticket: string;
  titulo: string;
  descripcion: string;
  estado: "abierto" | "en_progreso" | "resuelto" | "cancelado";
  prioridad: "baja" | "media" | "alta" | "critica";
  tipo: "soporte" | "mantenimiento" | "ingenieria" | "biomedico" | "infraestructura";
  fecha_creacion: string;
  fecha_asignacion: string;
  fecha_resolucion: string | null;
  tiempo_estimado_minutos: number;
  tiempo_real_minutos: number | null;
  centro: {
    id_centro: number;
    nombre: string;
    ciudad: string;
  };
  departamento: {
    id_departamento: number;
    nombre: string;
  } | null;
  solicitante: {
    id_usuario: number;
    nombre_completo: string;
    email: string;
    telefono: string | null;
  };
  equipo_afectado: {
    id_equipo: number;
    nombre: string;
    tipo: string;
    ubicacion: string;
  } | null;
  notas_tecnico: string | null;
  calificacion: number | null;
  comentario_cliente: string | null;
}

interface AlertaTecnico {
  id_alerta: number;
  tipo: "equipo_falla" | "mantenimiento_vencido" | "ticket_urgente" | "equipo_critico";
  titulo: string;
  descripcion: string;
  prioridad: "baja" | "media" | "alta" | "critica";
  fecha_creacion: string;
  leida: boolean;
  url_accion: string | null;
}

interface GrupoHistorial {
  fecha: string;
  label: string;
  tickets: Ticket[];
}

interface EstadisticasAvanzadas {
  tasa_resolucion_primera_vez: number;
  tickets_reabiertos: number;
  satisfaccion_cliente: number;
  tiempo_respuesta_promedio: number;
  tickets_por_tipo: { tipo: string; cantidad: number }[];
  tickets_por_prioridad: { prioridad: string; cantidad: number }[];
  tendencia_semanal: { semana: string; cantidad: number }[];
  top_centros: { centro: string; cantidad: number }[];
}

// ========================================
// CONFIGURACIONES DE TEMAS
// ========================================

const TEMAS: Record<TemaColor, ConfiguracionTema> = {
  light: {
    nombre: "Claro Profesional",
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
    nombre: "Oscuro Elite",
    icono: Moon,
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
    nombre: "Azul Técnico Pro",
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
    nombre: "Púrpura Premium",
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
    nombre: "Verde Operacional",
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
// COMPONENTE PRINCIPAL: HISTORIAL TICKETS
// ========================================

export default function HistorialTicketsTecnicoPage() {
  // Estados base
  const [usuario, setUsuario] = useState<UsuarioSesion | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingData, setLoadingData] = useState(true);

  const [estadisticas, setEstadisticas] = useState<EstadisticasTecnico | null>(null);
  const [estadisticasAvanzadas, setEstadisticasAvanzadas] =
    useState<EstadisticasAvanzadas | null>(null);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [alertas, setAlertas] = useState<AlertaTecnico[]>([]);

  const [temaActual, setTemaActual] = useState<TemaColor>("blue");
  const [sidebarAbierto, setSidebarAbierto] = useState(true);
  const [notificacionesAbiertas, setNotificacionesAbiertas] = useState(false);
  const [perfilAbierto, setPerfilAbierto] = useState(false);

  const [busqueda, setBusqueda] = useState("");
  const [vistaActual, setVistaActual] = useState<VistaHistorial>("timeline");

  const [filtroEstado, setFiltroEstado] = useState<string>("todos");
  const [filtroPrioridad, setFiltroPrioridad] = useState<string>("todas");
  const [filtroTipo, setFiltroTipo] = useState<string>("todos");
  const [filtroCentro, setFiltroCentro] = useState<string>("todos");

  const [disponibilidad, setDisponibilidad] = useState<
    "disponible" | "ocupado" | "fuera_servicio"
  >("disponible");

  const [ticketSeleccionado, setTicketSeleccionado] = useState<Ticket | null>(null);
  const [mostrarEstadisticasAvanzadas, setMostrarEstadisticasAvanzadas] =
    useState(false);

  const [fechaDesde, setFechaDesde] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d.toISOString().slice(0, 10);
  });
  const [fechaHasta, setFechaHasta] = useState(() =>
    new Date().toISOString().slice(0, 10)
  );
  const [rangoRapido, setRangoRapido] = useState<RangoRapido>("30d");
  const [exportando, setExportando] = useState<"excel" | "pdf" | null>(null);

  const tema = useMemo(() => TEMAS[temaActual], [temaActual]);

  // ========================================
  // EFECTOS
  // ========================================

  useEffect(() => {
    // Tema desde localStorage
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("tema_tecnico") as TemaColor | null;
      if (saved && TEMAS[saved]) {
        setTemaActual(saved);
      }
    }
  }, []);

  useEffect(() => {
    cargarDatosUsuario();
  }, []);

  useEffect(() => {
    if (usuario?.tecnico) {
      cargarContextoTecnico();
      cargarHistorialTickets();
      cargarEstadisticasAvanzadas();
    }
  }, [usuario, fechaDesde, fechaHasta]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (usuario?.tecnico) {
        cargarHistorialTickets(false);
      }
    }, 300000); // cada 5 minutos

    return () => clearInterval(interval);
  }, [usuario, fechaDesde, fechaHasta]);

  useEffect(() => {
    document.body.className = `bg-gradient-to-br ${tema.colores.fondo} min-h-screen transition-all duration-500`;
  }, [tema]);

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

        const tieneRolTecnico = rolesUsuario.some(
          (rol) => rol.includes("TECNICO") || rol.includes("SOPORTE")
        );

        if (!tieneRolTecnico) {
          alert(
            `Acceso denegado. Este módulo es solo para técnicos. Tus roles actuales son: ${rolesUsuario.join(
              ", "
            )}`
          );
          window.location.href = "/";
          return;
        }

        if (!result.usuario.tecnico) {
          alert(
            "Tu usuario tiene rol de TÉCNICO pero no está vinculado a un registro de técnico. Contacta al administrador."
          );
          window.location.href = "/";
          return;
        }

        setUsuario(result.usuario);
        setDisponibilidad(result.usuario.tecnico.disponibilidad);
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

  const cargarContextoTecnico = async () => {
    if (!usuario?.tecnico?.id_tecnico) return;

    try {
      const res = await fetch(
        `/api/tecnico/dashboard?id_tecnico=${usuario.tecnico.id_tecnico}`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        }
      );

      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data.success) {
        console.error("Respuesta dashboard contexto:", data);
        return;
      }

      setEstadisticas(data.estadisticas || null);
      setAlertas(data.alertas || []);
    } catch (err) {
      console.error("Error al cargar contexto técnico:", err);
    }
  };

  const cargarHistorialTickets = async (mostrarLoader: boolean = true) => {
    if (!usuario?.tecnico?.id_tecnico) return;

    try {
      if (mostrarLoader) setLoadingData(true);

      const params = new URLSearchParams({
        id_tecnico: String(usuario.tecnico.id_tecnico),
        desde: fechaDesde,
        hasta: fechaHasta,
      });

      const res = await fetch(`/api/tecnico/tickets/historial?${params.toString()}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data.success) {
        console.error("Respuesta historial tickets:", data);
        return;
      }

      setTickets(data.tickets || []);
    } catch (err) {
      console.error("Error al cargar historial:", err);
    } finally {
      if (mostrarLoader) setLoadingData(false);
    }
  };

  const cargarEstadisticasAvanzadas = async () => {
    if (!usuario?.tecnico?.id_tecnico) return;

    try {
      const params = new URLSearchParams({
        id_tecnico: String(usuario.tecnico.id_tecnico),
        desde: fechaDesde,
        hasta: fechaHasta,
      });

      const res = await fetch(
        `/api/tecnico/tickets/estadisticas-avanzadas?${params.toString()}`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        }
      );

      const data = await res.json().catch(() => ({}));

      if (res.ok && data.success) {
        setEstadisticasAvanzadas(data.estadisticas);
      }
    } catch (err) {
      console.error("Error al cargar estadísticas avanzadas:", err);
    }
  };

  // ========================================
  // ACCIONES
  // ========================================

  const cambiarDisponibilidad = async (
    nuevoEstado: "disponible" | "ocupado" | "fuera_servicio"
  ) => {
    if (!usuario?.tecnico?.id_tecnico) return;

    try {
      const response = await fetch(
        `/api/tecnico/${usuario.tecnico.id_tecnico}/disponibilidad`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ disponibilidad: nuevoEstado }),
        }
      );

      if (response.ok) {
        setDisponibilidad(nuevoEstado);
        mostrarNotificacion("Estado actualizado correctamente", "success");
      } else {
        mostrarNotificacion("Error al actualizar disponibilidad", "error");
      }
    } catch (error) {
      console.error("Error al cambiar disponibilidad:", error);
      mostrarNotificacion("Error al actualizar disponibilidad", "error");
    }
  };

  const actualizarEstadoTicket = async (
    idTicket: number,
    nuevoEstado: Ticket["estado"]
  ) => {
    try {
      const response = await fetch(`/api/tecnico/tickets/${idTicket}/estado`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ estado: nuevoEstado }),
      });

      if (response.ok) {
        setTickets((prev) =>
          prev.map((ticket) =>
            ticket.id_ticket === idTicket ? { ...ticket, estado: nuevoEstado } : ticket
          )
        );
        cargarHistorialTickets(false);
        mostrarNotificacion("Estado del ticket actualizado", "success");
      } else {
        mostrarNotificacion("Error al actualizar estado del ticket", "error");
      }
    } catch (error) {
      console.error("Error al actualizar estado del ticket:", error);
      mostrarNotificacion("Error al actualizar estado del ticket", "error");
    }
  };

  const actualizarPrioridadTicket = async (
    idTicket: number,
    nuevaPrioridad: Ticket["prioridad"]
  ) => {
    try {
      const response = await fetch(
        `/api/tecnico/tickets/${idTicket}/prioridad`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ prioridad: nuevaPrioridad }),
        }
      );

      if (response.ok) {
        setTickets((prev) =>
          prev.map((ticket) =>
            ticket.id_ticket === idTicket
              ? { ...ticket, prioridad: nuevaPrioridad }
              : ticket
          )
        );
        mostrarNotificacion("Prioridad actualizada", "success");
      } else {
        mostrarNotificacion("Error al actualizar prioridad", "error");
      }
    } catch (error) {
      console.error("Error al actualizar prioridad", error);
      mostrarNotificacion("Error al actualizar prioridad", "error");
    }
  };

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
      localStorage.setItem("tema_tecnico", nuevoTema);
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

  const cambiarRangoRapido = (rango: RangoRapido) => {
    const hoy = new Date();
    let desde = new Date(hoy);

    if (rango === "7d") {
      desde.setDate(hoy.getDate() - 7);
    } else if (rango === "30d") {
      desde.setDate(hoy.getDate() - 30);
    } else if (rango === "90d") {
      desde.setDate(hoy.getDate() - 90);
    } else if (rango === "year") {
      desde = new Date(hoy.getFullYear(), 0, 1);
    } else if (rango === "todo") {
      desde = new Date(2000, 0, 1);
    }

    const desdeISO = desde.toISOString().slice(0, 10);
    const hastaISO = hoy.toISOString().slice(0, 10);

    setRangoRapido(rango);
    setFechaDesde(desdeISO);
    setFechaHasta(hastaISO);
    cargarHistorialTickets();
  };

  const exportarHistorial = async (formato: "excel" | "pdf") => {
    if (!usuario?.tecnico?.id_tecnico) return;

    try {
      setExportando(formato);

      const params = new URLSearchParams({
        id_tecnico: String(usuario.tecnico.id_tecnico),
        desde: fechaDesde,
        hasta: fechaHasta,
        formato,
      });

      const res = await fetch(
        `/api/tecnico/tickets/historial/export?${params.toString()}`,
        {
          method: "GET",
          credentials: "include",
        }
      );

      if (!res.ok) {
        mostrarNotificacion("No se pudo exportar el historial", "error");
        return;
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `historial_tickets_${fechaDesde}_${fechaHasta}.${
        formato === "excel" ? "xlsx" : "pdf"
      }`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      mostrarNotificacion("Historial exportado correctamente", "success");
    } catch (error) {
      console.error("Error al exportar historial:", error);
      mostrarNotificacion("Error al exportar historial", "error");
    } finally {
      setExportando(null);
    }
  };

  const mostrarNotificacion = (mensaje: string, tipo: "success" | "error" | "info") => {
    // Implementación simple de notificación
    const color = tipo === "success" ? "green" : tipo === "error" ? "red" : "blue";
    console.log(`[${tipo.toUpperCase()}]: ${mensaje}`);
    // Aquí podrías integrar una librería de notificaciones como react-toastify
  };

  // ========================================
  // FUNCIONES AUXILIARES
  // ========================================

  const formatearFecha = (fecha: string) => {
    const date = new Date(fecha);
    if (Number.isNaN(date.getTime())) return fecha;
    return new Intl.DateTimeFormat("es-CL", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  const formatearFechaSoloDia = (fecha: string) => {
    const date = new Date(fecha);
    if (Number.isNaN(date.getTime())) return fecha;
    return new Intl.DateTimeFormat("es-CL", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(date);
  };

  const obtenerFechaBaseTicket = (ticket: Ticket) =>
    ticket.fecha_resolucion || ticket.fecha_asignacion || ticket.fecha_creacion;

  const obtenerColorEstado = (estado: string) => {
    const isDark = ["dark", "blue", "purple", "green"].includes(temaActual);
    const colores: { [key: string]: string } = {
      abierto: isDark
        ? "bg-red-500/20 text-red-300 border-red-400/40"
        : "bg-red-100 text-red-800 border-red-200",
      en_progreso: isDark
        ? "bg-blue-500/20 text-blue-300 border-blue-400/40"
        : "bg-blue-100 text-blue-800 border-blue-200",
      resuelto: isDark
        ? "bg-emerald-500/20 text-emerald-300 border-emerald-400/40"
        : "bg-emerald-100 text-emerald-800 border-emerald-200",
      cancelado: isDark
        ? "bg-gray-500/20 text-gray-300 border-gray-400/40"
        : "bg-gray-100 text-gray-800 border-gray-200",
    };

    return (
      colores[estado.toLowerCase()] ||
      (isDark
        ? "bg-gray-500/20 text-gray-300 border-gray-400/40"
        : "bg-gray-100 text-gray-800 border-gray-200")
    );
  };

  const obtenerColorPrioridad = (prioridad: string) => {
    const isDark = ["dark", "blue", "purple", "green"].includes(temaActual);
    const colores: { [key: string]: string } = {
      critica: isDark
        ? "bg-red-500/20 text-red-300 border-red-400/50"
        : "bg-red-100 text-red-800 border-red-200",
      alta: isDark
        ? "bg-orange-500/20 text-orange-300 border-orange-400/50"
        : "bg-orange-100 text-orange-800 border-orange-200",
      media: isDark
        ? "bg-yellow-500/20 text-yellow-300 border-yellow-400/50"
        : "bg-yellow-100 text-yellow-800 border-yellow-200",
      baja: isDark
        ? "bg-green-500/20 text-green-300 border-green-400/50"
        : "bg-green-100 text-green-800 border-green-200",
    };

    return (
      colores[prioridad.toLowerCase()] ||
      (isDark
        ? "bg-gray-500/20 text-gray-300 border-gray-400/40"
        : "bg-gray-100 text-gray-800 border-gray-200")
    );
  };

  const obtenerIconoTipo = (tipo: string) => {
    const iconos: { [key: string]: any } = {
      soporte: Headset,
      mantenimiento: Wrench,
      ingenieria: BrainCircuit,
      biomedico: Microscope,
      infraestructura: Database,
    };
    return iconos[tipo.toLowerCase()] || ClipboardList;
  };

  const obtenerSaludo = () => {
    const hora = new Date().getHours();
    if (hora < 12) return "Buenos días";
    if (hora < 19) return "Buenas tardes";
    return "Buenas noches";
  };

  // ========================================
  // DERIVADOS: FILTROS / RESÚMENES / GRUPOS
  // ========================================

  const tiposDisponibles = useMemo(
    () => Array.from(new Set(tickets.map((t) => t.tipo))),
    [tickets]
  );

  const centrosDisponibles = useMemo(
    () =>
      Array.from(
        new Set(tickets.map((t) => t.centro?.nombre).filter((x): x is string => !!x))
      ),
    [tickets]
  );

  const ticketsFiltrados = useMemo(() => {
    return tickets.filter((ticket) => {
      if (filtroEstado !== "todos" && ticket.estado !== filtroEstado) return false;
      if (filtroPrioridad !== "todas" && ticket.prioridad !== filtroPrioridad)
        return false;
      if (filtroTipo !== "todos" && ticket.tipo !== filtroTipo) return false;
      if (
        filtroCentro !== "todos" &&
        ticket.centro?.nombre &&
        ticket.centro.nombre !== filtroCentro
      ) {
        return false;
      }

      if (busqueda.trim().length > 0) {
        const term = busqueda.toLowerCase();
        const fechaBase = obtenerFechaBaseTicket(ticket) || "";
        const texto = `${ticket.numero_ticket} ${ticket.titulo} ${
          ticket.descripcion || ""
        } ${ticket.solicitante.nombre_completo} ${
          ticket.centro?.nombre || ""
        } ${ticket.centro?.ciudad || ""} ${fechaBase}`.toLowerCase();

        if (!texto.includes(term)) return false;
      }

      return true;
    });
  }, [tickets, filtroEstado, filtroPrioridad, filtroTipo, filtroCentro, busqueda]);

  const resumenHistorial = useMemo(() => {
    const base = {
      total: ticketsFiltrados.length,
      resueltos: 0,
      cancelados: 0,
      abiertos: 0,
      en_progreso: 0,
      promedioResolucion: 0,
      dentroSla: 0,
    };

    let sumaResolucion = 0;
    let conTiempo = 0;
    let dentroSlaCount = 0;

    for (const t of ticketsFiltrados) {
      if (t.estado === "resuelto") base.resueltos++;
      if (t.estado === "cancelado") base.cancelados++;
      if (t.estado === "abierto") base.abiertos++;
      if (t.estado === "en_progreso") base.en_progreso++;

      const tiempoReal =
        typeof t.tiempo_real_minutos === "number"
          ? t.tiempo_real_minutos
          : t.tiempo_estimado_minutos;

      if (tiempoReal && tiempoReal > 0) {
        sumaResolucion += tiempoReal;
        conTiempo++;
      }

      if (
        t.estado === "resuelto" &&
        t.tiempo_real_minutos !== null &&
        t.tiempo_estimado_minutos &&
        t.tiempo_real_minutos <= t.tiempo_estimado_minutos
      ) {
        dentroSlaCount++;
      }
    }

    if (conTiempo > 0) {
      base.promedioResolucion = Math.round(sumaResolucion / conTiempo);
    }

    if (base.resueltos > 0) {
      base.dentroSla = Math.round((dentroSlaCount / base.resueltos) * 100);
    }

    return base;
  }, [ticketsFiltrados]);

  const historialAgrupado: GrupoHistorial[] = useMemo(() => {
    if (ticketsFiltrados.length === 0) return [];

    const mapa: Record<string, Ticket[]> = {};

    for (const t of ticketsFiltrados) {
      const fechaBase = obtenerFechaBaseTicket(t) || "";
      const dia = fechaBase.slice(0, 10);
      if (!dia) continue;
      if (!mapa[dia]) mapa[dia] = [];
      mapa[dia].push(t);
    }

    return Object.entries(mapa)
      .map(([fecha, lista]) => ({
        fecha,
        label: formatearFechaSoloDia(fecha),
        tickets: lista.sort((a, b) => {
          const fa = obtenerFechaBaseTicket(a) || "";
          const fb = obtenerFechaBaseTicket(b) || "";
          return fb.localeCompare(fa);
        }),
      }))
      .sort((a, b) => b.fecha.localeCompare(a.fecha));
  }, [ticketsFiltrados]);

  // ========================================
  // RENDER: ESTADOS ESPECIALES
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
              <History className="w-10 h-10 text-white" />
            </div>
          </div>
          <h2 className={`text-4xl font-black mb-4 ${tema.colores.texto}`}>
            Cargando Historial Premium
          </h2>
          <p
            className={`text-lg font-semibold ${tema.colores.textoSecundario} animate-pulse`}
          >
            Preparando tu histórico completo de incidencias con análisis avanzado...
          </p>
        </div>
      </div>
    );
  }

  if (!usuario || !usuario.tecnico) {
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
            <ShieldAlert className="w-12 h-12 text-white" />
          </div>
          <h2 className={`text-3xl font-black mb-4 ${tema.colores.texto}`}>
            Acceso No Autorizado
          </h2>
          <p className={`text-lg mb-8 ${tema.colores.textoSecundario}`}>
            No tienes permisos para acceder al historial de tickets técnicos premium.
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
      <SidebarTecnico
        usuario={usuario}
        tema={tema}
        sidebarAbierto={sidebarAbierto}
        setSidebarAbierto={setSidebarAbierto}
        estadisticas={estadisticas}
      />

      {/* HEADER PREMIUM */}
      <header
        className={`fixed top-0 right-0 z-40 transition-all duration-300 ${
          sidebarAbierto ? "left-72" : "left-20"
        } ${tema.colores.header} ${tema.colores.borde} border-b ${tema.colores.sombra}`}
      >
        <div className="flex items-center justify-between px-8 py-4">
          {/* Búsqueda avanzada */}
          <div className="flex-1 max-w-2xl">
            <div className="relative group">
              <Search
                className={`absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 ${tema.colores.textoSecundario} group-focus-within:text-indigo-500 transition-colors`}
              />
              <input
                type="text"
                placeholder="Búsqueda inteligente: número, título, centro, solicitante, fecha..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className={`w-full pl-12 pr-12 py-3 rounded-xl ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto} placeholder:${tema.colores.textoSecundario} focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all duration-300`}
              />
              {busqueda && (
                <button
                  onClick={() => setBusqueda("")}
                  className={`absolute right-4 top-1/2 transform -translate-y-1/2 p-1 rounded-lg ${tema.colores.hover} transition-all duration-200 hover:scale-110`}
                >
                  <X className="w-4 h-4" />
                </button>
              )}
              <div className="absolute left-0 right-0 -bottom-1 h-0.5 bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-0 group-focus-within:opacity-100 transition-opacity" />
            </div>
          </div>

          {/* Acciones header */}
          <div className="flex items-center gap-3 ml-6">
            {/* Selector de vista */}
            <div className="flex items-center gap-1 p-1 rounded-xl bg-black/10">
              {[
                { id: "timeline", icon: History, label: "Timeline" },
                { id: "tabla", icon: ClipboardList, label: "Tabla" },
                { id: "kanban", icon: Layers, label: "Kanban" },
                { id: "calendario", icon: Calendar, label: "Calendario" },
              ].map((vista) => (
                <button
                  key={vista.id}
                  onClick={() => setVistaActual(vista.id as VistaHistorial)}
                  className={`px-3 py-2 rounded-lg font-semibold text-xs transition-all duration-300 ${
                    vistaActual === vista.id
                      ? `bg-gradient-to-r ${tema.colores.gradiente} text-white shadow-lg`
                      : `${tema.colores.texto} hover:bg-white/10`
                  }`}
                  title={vista.label}
                >
                  <vista.icon className="w-4 h-4" />
                </button>
              ))}
            </div>

            {/* Temas */}
            <div className="relative group">
              <button
                className={`p-3 rounded-xl font-semibold transition-all duration-300 ${tema.colores.secundario} ${tema.colores.texto} hover:scale-105`}
              >
                <Sparkles className="w-5 h-5" />
              </button>

              <div
                className={`absolute right-0 mt-2 w-64 rounded-2xl ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 p-4 space-y-2 z-50`}
              >
                <p className={`text-sm font-bold mb-3 ${tema.colores.texto}`}>
                  Temas Premium
                </p>
                {Object.entries(TEMAS).map(([key, t]) => (
                  <button
                    key={key}
                    onClick={() => cambiarTema(key as TemaColor)}
                    className={`w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl font-semibold transition-all duration-300 ${
                      temaActual === key
                        ? `bg-gradient-to-r ${t.colores.gradiente} text-white shadow-lg scale-105`
                        : `${tema.colores.hover} ${tema.colores.texto}`
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <t.icono className="w-5 h-5" />
                      <span>{t.nombre}</span>
                    </div>
                    {temaActual === key && <BadgeCheck className="w-5 h-5" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Alertas */}
            <div className="relative">
              <button
                onClick={() => setNotificacionesAbiertas(!notificacionesAbiertas)}
                className={`relative p-3 rounded-xl font-semibold transition-all duration-300 ${tema.colores.secundario} ${tema.colores.texto} hover:scale-105`}
              >
                <Bell className="w-5 h-5" />
                {alertas.filter((a) => !a.leida).length > 0 && (
                  <span className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold rounded-full flex items-center justify-center animate-pulse shadow-lg">
                    {alertas.filter((a) => !a.leida).length > 9
                      ? "9+"
                      : alertas.filter((a) => !a.leida).length}
                  </span>
                )}
              </button>

              {notificacionesAbiertas && (
                <div
                  className={`absolute right-0 mt-2 w-96 rounded-2xl ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} max-h-96 overflow-y-auto custom-scrollbar z-50 animate-slideDown`}
                >
                  <div
                    className={`p-4 border-b ${tema.colores.borde} sticky top-0 ${tema.colores.card} backdrop-blur-xl`}
                  >
                    <div className="flex items-center justify-between">
                      <h3 className={`text-lg font-black ${tema.colores.texto}`}>
                        Alertas Activas
                      </h3>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold ${tema.colores.secundario}`}
                      >
                        {alertas.filter((a) => !a.leida).length} nuevas
                      </span>
                    </div>
                  </div>

                  {alertas.length === 0 ? (
                    <div className="p-8 text-center">
                      <BellOff
                        className={`w-12 h-12 mx-auto mb-3 ${tema.colores.textoSecundario} opacity-50`}
                      />
                      <p className={`text-sm font-semibold ${tema.colores.textoSecundario}`}>
                        No tienes alertas activas
                      </p>
                      <p className={`text-xs mt-1 ${tema.colores.textoSecundario}`}>
                        Te notificaremos cuando haya novedades
                      </p>
                    </div>
                  ) : (
                    <div className={`divide-y ${tema.colores.borde}`}>
                      {alertas.slice(0, 5).map((alerta) => (
                        <div
                          key={alerta.id_alerta}
                          className={`p-4 ${tema.colores.hover} transition-all duration-200 cursor-pointer hover:scale-[1.02] ${
                            !alerta.leida ? "bg-indigo-500/5 border-l-4 border-indigo-500" : ""
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div
                              className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${obtenerColorPrioridad(
                                alerta.prioridad
                              )} shadow-lg`}
                            >
                              <AlertCircleIcon className="w-5 h-5" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className={`text-sm font-bold mb-1 ${tema.colores.texto}`}>
                                {alerta.titulo}
                              </p>
                              <p
                                className={`text-xs mb-2 ${tema.colores.textoSecundario} line-clamp-2`}
                              >
                                {alerta.descripcion}
                              </p>
                              <div className="flex items-center justify-between">
                                <p
                                  className={`text-xs font-medium ${tema.colores.textoSecundario}`}
                                >
                                  {alerta?.fecha_creacion
                                    ? formatearFecha(alerta.fecha_creacion)
                                    : "Sin fecha"}
                                </p>
                                {!alerta.leida && (
                                  <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Disponibilidad mejorada */}
            <div className="flex items-center gap-2 p-1 rounded-xl bg-black/10">
              {[
                { id: "disponible", label: "Disponible", icon: CheckCircle2, color: "green" },
                { id: "ocupado", label: "Ocupado", icon: Clock, color: "yellow" },
                { id: "fuera_servicio", label: "Fuera", icon: X, color: "red" },
              ].map((estado) => (
                <button
                  key={estado.id}
                  onClick={() =>
                    cambiarDisponibilidad(
                      estado.id as "disponible" | "ocupado" | "fuera_servicio"
                    )
                  }
                  className={`px-3 py-2 rounded-lg font-semibold text-xs transition-all duration-300 flex items-center gap-2 ${
                    disponibilidad === estado.id
                      ? `bg-${estado.color}-600 text-white shadow-lg scale-105`
                      : `${tema.colores.texto} hover:bg-white/10`
                  }`}
                >
                  <estado.icon className="w-4 h-4" />
                  <span className="hidden lg:inline">{estado.label}</span>
                </button>
              ))}
            </div>

            {/* Perfil */}
            <div className="relative">
              <button
                onClick={() => setPerfilAbierto(!perfilAbierto)}
                className={`flex items-center gap-3 px-4 py-2 rounded-xl transition-all duration-300 ${tema.colores.hover} hover:scale-105`}
              >
                <div className="text-right hidden md:block">
                  <p className={`text-sm font-bold ${tema.colores.texto}`}>
                    {usuario.nombre} {usuario.apellido_paterno}
                  </p>
                  <p className={`text-xs ${tema.colores.textoSecundario}`}>
                    Técnico Premium
                  </p>
                </div>
                <div
                  className={`w-10 h-10 rounded-xl bg-gradient-to-br ${tema.colores.gradiente} flex items-center justify-center text-white font-bold shadow-lg ring-2 ring-white/20`}
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
                  className={`w-4 h-4 ${tema.colores.texto} transition-transform duration-300 ${
                    perfilAbierto ? "rotate-180" : ""
                  }`}
                />
              </button>

              {perfilAbierto && (
                <div
                  className={`absolute right-0 mt-2 w-80 rounded-2xl ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} p-4 z-50 animate-slideDown`}
                >
                  <div
                    className={`flex items-center gap-4 mb-4 pb-4 border-b ${tema.colores.borde}`}
                  >
                    <div
                      className={`w-16 h-16 rounded-xl bg-gradient-to-br ${tema.colores.gradiente} flex items-center justify-center text-white font-bold text-xl shadow-lg ring-4 ring-white/10`}
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
                      <p className={`text-lg font-black ${tema.colores.texto}`}>
                        {usuario.nombre} {usuario.apellido_paterno}
                      </p>
                      <p
                        className={`text-sm font-medium ${tema.colores.textoSecundario} mb-1`}
                      >
                        {usuario.tecnico?.tipo_tecnico}
                      </p>
                      <p className={`text-xs font-medium ${tema.colores.textoSecundario}`}>
                        {usuario.tecnico?.centro?.nombre ?? "Sin centro asignado"}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Link
                      href="/tecnico/perfil"
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all duration-300 ${tema.colores.hover} ${tema.colores.texto} hover:scale-105`}
                    >
                      <User className="w-5 h-5" />
                      <span>Mi Perfil</span>
                      <ChevronRight className="w-4 h-4 ml-auto" />
                    </Link>
                    <Link
                      href="/tecnico/configuracion"
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all duration-300 ${tema.colores.hover} ${tema.colores.texto} hover:scale-105`}
                    >
                      <Settings className="w-5 h-5" />
                      <span>Configuración</span>
                      <ChevronRight className="w-4 h-4 ml-auto" />
                    </Link>
                    <Link
                      href="/tecnico/ayuda"
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all duration-300 ${tema.colores.hover} ${tema.colores.texto} hover:scale-105`}
                    >
                      <HelpCircle className="w-5 h-5" />
                      <span>Ayuda y Soporte</span>
                      <ChevronRight className="w-4 h-4 ml-auto" />
                    </Link>
                    <button
                      onClick={cerrarSesion}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all duration-300 ${tema.colores.hover} text-red-500 hover:text-red-400 hover:scale-105`}
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

      {/* MAIN CONTENT */}
      <main
        className={`transition-all duration-300 ${
          sidebarAbierto ? "ml-72" : "ml-20"
        } pt-24 p-8`}
      >
        {/* Encabezado de página premium */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-4 mb-3">
                <div
                  className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${tema.colores.gradiente} flex items-center justify-center shadow-2xl animate-float`}
                >
                  <History className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1
                    className={`text-4xl lg:text-5xl font-black ${tema.colores.texto} flex items-center gap-3`}
                  >
                    {obtenerSaludo()}, {usuario.nombre}
                    <span className="animate-wave inline-block text-3xl">👋</span>
                  </h1>
                  <p
                    className={`text-lg font-semibold ${tema.colores.textoSecundario} mt-1`}
                  >
                    Historial completo de tickets con análisis avanzado y trazabilidad
                    total
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3 mt-4">
                <div
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl ${tema.colores.card} ${tema.colores.borde} border`}
                >
                  <CalendarClock className={`w-4 h-4 ${tema.colores.acento}`} />
                  <span className={`text-sm font-semibold ${tema.colores.texto}`}>
                    {formatearFechaSoloDia(fechaDesde)} – {formatearFechaSoloDia(fechaHasta)}
                  </span>
                </div>
                <div
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl ${tema.colores.card} ${tema.colores.borde} border`}
                >
                  <TrendingUpIcon className={`w-4 h-4 ${tema.colores.acento}`} />
                  <span className={`text-sm font-semibold ${tema.colores.texto}`}>
                    {ticketsFiltrados.length} tickets en rango
                  </span>
                </div>
                <div
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r ${tema.colores.gradiente} text-white shadow-lg`}
                >
                  <Sparkles className="w-4 h-4" />
                  <span className="text-sm font-bold">Vista {vistaActual}</span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => cargarHistorialTickets()}
                disabled={loadingData}
                className={`flex items-center gap-2 px-5 py-3 ${tema.colores.secundario} rounded-xl font-semibold text-sm ${tema.colores.texto} transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                <RefreshCw
                  className={`w-4 h-4 ${loadingData ? "animate-spin" : ""}`}
                />
                Actualizar
              </button>
              <button
                onClick={() => setMostrarEstadisticasAvanzadas(!mostrarEstadisticasAvanzadas)}
                className={`flex items-center gap-2 px-5 py-3 rounded-xl font-semibold text-sm transition-all duration-300 hover:scale-105 ${
                  mostrarEstadisticasAvanzadas
                    ? `bg-gradient-to-r ${tema.colores.gradiente} text-white shadow-lg`
                    : `${tema.colores.secundario} ${tema.colores.texto}`
                }`}
              >
                <BarChart3 className="w-4 h-4" />
                Estadísticas
              </button>
              <button
                onClick={() => exportarHistorial("excel")}
                disabled={exportando === "excel"}
                className={`flex items-center gap-2 px-5 py-3 ${tema.colores.secundario} rounded-xl font-semibold text-sm ${tema.colores.texto} transition-all duration-300 hover:scale-105 disabled:opacity-50`}
              >
                <FileSpreadsheet className="w-4 h-4" />
                {exportando === "excel" ? "Exportando..." : "Excel"}
              </button>
              <button
                onClick={() => exportarHistorial("pdf")}
                disabled={exportando === "pdf"}
                className={`flex items-center gap-2 px-5 py-3 ${tema.colores.primario} text-white rounded-xl font-bold text-sm transition-all duration-300 hover:scale-105 ${tema.colores.sombra} disabled:opacity-50`}
              >
                <Printer className="w-4 h-4" />
                {exportando === "pdf" ? "Generando..." : "PDF"}
              </button>
            </div>
          </div>
        </div>

        {/* Estadísticas avanzadas desplegable */}
        {mostrarEstadisticasAvanzadas && estadisticasAvanzadas && (
          <div
            className={`mb-8 rounded-2xl p-6 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} animate-slideDown`}
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div
                  className={`w-12 h-12 rounded-xl bg-gradient-to-br ${tema.colores.gradiente} flex items-center justify-center shadow-lg`}
                >
                  <BarChart3 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className={`text-2xl font-black ${tema.colores.texto}`}>
                    Análisis Avanzado
                  </h3>
                  <p className={`text-sm ${tema.colores.textoSecundario}`}>
                    Métricas detalladas de rendimiento y calidad
                  </p>
                </div>
              </div>
              <button
                onClick={() => setMostrarEstadisticasAvanzadas(false)}
                className={`p-2 rounded-lg ${tema.colores.hover}`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <MetricaAvanzada
                tema={tema}
                icono={Target}
                titulo="Tasa Primera Resolución"
                valor={`${estadisticasAvanzadas.tasa_resolucion_primera_vez}%`}
                tendencia="up"
                color="from-emerald-500 to-teal-500"
              />
              <MetricaAvanzada
                tema={tema}
                icono={RefreshCw}
                titulo="Tickets Reabiertos"
                valor={estadisticasAvanzadas.tickets_reabiertos}
                tendencia="down"
                color="from-orange-500 to-red-500"
              />
              <MetricaAvanzada
                tema={tema}
                icono={Star}
                titulo="Satisfacción Cliente"
                valor={`${estadisticasAvanzadas.satisfaccion_cliente}%`}
                tendencia="up"
                color="from-yellow-500 to-orange-500"
              />
              <MetricaAvanzada
                tema={tema}
                icono={Timer}
                titulo="Tiempo Respuesta Promedio"
                valor={`${estadisticasAvanzadas.tiempo_respuesta_promedio} min`}
                tendencia="down"
                color="from-blue-500 to-cyan-500"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Tickets por tipo */}
              <div
                className={`rounded-xl p-4 ${tema.colores.fondoSecundario} ${tema.colores.borde} border`}
              >
                <h4 className={`text-sm font-bold mb-3 ${tema.colores.texto}`}>
                  Distribución por Tipo
                </h4>
                <div className="space-y-2">
                  {estadisticasAvanzadas.tickets_por_tipo.map((item) => (
                    <div key={item.tipo} className="flex items-center gap-3">
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span
                            className={`text-xs font-semibold ${tema.colores.texto}`}
                          >
                            {item.tipo.toUpperCase()}
                          </span>
                          <span
                            className={`text-xs font-bold ${tema.colores.acento}`}
                          >
                            {item.cantidad}
                          </span>
                        </div>
                        <div className="h-2 bg-black/10 rounded-full overflow-hidden">
                          <div
                            className={`h-full bg-gradient-to-r ${tema.colores.gradiente} rounded-full transition-all duration-500`}
                            style={{
                              width: `${
                                (item.cantidad /
                                  estadisticasAvanzadas.tickets_por_tipo.reduce(
                                    (a, b) => a + b.cantidad,
                                    0
                                  )) *
                                100
                              }%`,
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tickets por prioridad */}
              <div
                className={`rounded-xl p-4 ${tema.colores.fondoSecundario} ${tema.colores.borde} border`}
              >
                <h4 className={`text-sm font-bold mb-3 ${tema.colores.texto}`}>
                  Distribución por Prioridad
                </h4>
                <div className="space-y-2">
                  {estadisticasAvanzadas.tickets_por_prioridad.map((item) => (
                    <div key={item.prioridad} className="flex items-center gap-3">
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span
                            className={`text-xs font-semibold ${tema.colores.texto}`}
                          >
                            {item.prioridad.toUpperCase()}
                          </span>
                          <span
                            className={`text-xs font-bold ${tema.colores.acento}`}
                          >
                            {item.cantidad}
                          </span>
                        </div>
                        <div className="h-2 bg-black/10 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              item.prioridad === "critica"
                                ? "bg-gradient-to-r from-red-500 to-pink-500"
                                : item.prioridad === "alta"
                                ? "bg-gradient-to-r from-orange-500 to-yellow-500"
                                : item.prioridad === "media"
                                ? "bg-gradient-to-r from-yellow-500 to-green-500"
                                : "bg-gradient-to-r from-green-500 to-emerald-500"
                            }`}
                            style={{
                              width: `${
                                (item.cantidad /
                                  estadisticasAvanzadas.tickets_por_prioridad.reduce(
                                    (a, b) => a + b.cantidad,
                                    0
                                  )) *
                                100
                              }%`,
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Resumen rápido mejorado */}
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-6 mb-8">
          <ResumenCardPremium
            tema={tema}
            icono={Package}
            titulo="Total Tickets"
            valor={resumenHistorial.total}
            chip="Historial filtrado"
            color="from-indigo-500 to-purple-500"
            animacion="pulse"
          />
          <ResumenCardPremium
            tema={tema}
            icono={CheckCircle2}
            titulo="Resueltos"
            valor={resumenHistorial.resueltos}
            chip="Cerrados exitosamente"
            color="from-emerald-500 to-teal-500"
            animacion="bounce"
          />
          <ResumenCardPremium
            tema={tema}
            icono={FileX}
            titulo="Cancelados"
            valor={resumenHistorial.cancelados}
            chip="Anulados"
            color="from-slate-500 to-slate-700"
            animacion="fade"
          />
          <ResumenCardPremium
            tema={tema}
            icono={Timer}
            titulo="Tiempo Promedio"
            valor={`${resumenHistorial.promedioResolucion}m`}
            chip="Resolución real"
            color="from-blue-500 to-cyan-500"
            animacion="slide"
          />
          <ResumenCardPremium
            tema={tema}
            icono={Gauge}
            titulo="Cumplimiento SLA"
            valor={`${resumenHistorial.dentroSla}%`}
            chip="Dentro del objetivo"
            color="from-emerald-500 to-lime-500"
            animacion="scale"
          />
          <ResumenCardPremium
            tema={tema}
            icono={Flame}
            titulo="Pendientes"
            valor={resumenHistorial.abiertos + resumenHistorial.en_progreso}
            chip="Aún activos"
            color="from-orange-500 to-red-500"
            animacion="shake"
          />
        </div>

        {/* Filtros avanzados premium */}
        <div
          className={`rounded-2xl p-6 mb-6 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra}`}
        >
          <div className="flex items-center gap-3 mb-4">
            <div
              className={`w-10 h-10 rounded-xl bg-gradient-to-br ${tema.colores.gradiente} flex items-center justify-center shadow-lg`}
            >
              <Filter className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className={`text-lg font-black ${tema.colores.texto}`}>
                Filtros Avanzados
              </h3>
              <p className={`text-xs ${tema.colores.textoSecundario}`}>
                Personaliza tu vista del historial
              </p>
            </div>
          </div>

          {/* Rango rápido */}
          <div className="mb-4">
            <label className={`text-sm font-bold mb-2 block ${tema.colores.texto}`}>
              Rango Temporal
            </label>
            <div className="flex flex-wrap gap-2">
              {[
                { id: "7d", label: "7 días", icon: Clock },
                { id: "30d", label: "30 días", icon: CalendarDays },
                { id: "90d", label: "90 días", icon: CalendarRange },
                { id: "year", label: "Año actual", icon: Calendar },
                { id: "todo", label: "Todo", icon: History },
              ].map((r) => (
                <button
                  key={r.id}
                  onClick={() => cambiarRangoRapido(r.id as RangoRapido)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border transition-all duration-300 hover:scale-105 ${
                    rangoRapido === r.id
                      ? `bg-gradient-to-r ${tema.colores.gradiente} text-white border-transparent shadow-lg`
                      : `${tema.colores.hover} ${tema.colores.textoSecundario} ${tema.colores.borde}`
                  }`}
                >
                  <r.icon className="w-4 h-4" />
                  {r.label}
                </button>
              ))}
            </div>
          </div>

          {/* Rango personalizado */}
          <div className="mb-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className={`text-xs font-bold mb-2 block ${tema.colores.texto}`}>
                Fecha Desde
              </label>
              <input
                type="date"
                value={fechaDesde}
                onChange={(e) => setFechaDesde(e.target.value)}
                className={`w-full px-4 py-2 rounded-xl text-sm ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto} focus:ring-2 focus:ring-indigo-500/50 transition-all`}
              />
            </div>
            <div>
              <label className={`text-xs font-bold mb-2 block ${tema.colores.texto}`}>
                Fecha Hasta
              </label>
              <input
                type="date"
                value={fechaHasta}
                onChange={(e) => setFechaHasta(e.target.value)}
                className={`w-full px-4 py-2 rounded-xl text-sm ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto} focus:ring-2 focus:ring-indigo-500/50 transition-all`}
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={() => cargarHistorialTickets()}
                className={`w-full px-4 py-2 rounded-xl text-sm font-bold ${tema.colores.primario} text-white transition-all duration-300 hover:scale-105 shadow-lg`}
              >
                Aplicar Rango
              </button>
            </div>
          </div>

          {/* Filtros por categoría */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className={`text-xs font-bold mb-2 block ${tema.colores.texto}`}>
                Estado
              </label>
              <select
                value={filtroEstado}
                onChange={(e) => setFiltroEstado(e.target.value)}
                className={`w-full px-4 py-2 rounded-xl text-sm ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto} focus:ring-2 focus:ring-indigo-500/50 transition-all`}
              >
                <option value="todos">Todos los estados</option>
                <option value="abierto">🔴 Abiertos</option>
                <option value="en_progreso">🔵 En progreso</option>
                <option value="resuelto">🟢 Resueltos</option>
                <option value="cancelado">⚫ Cancelados</option>
              </select>
            </div>

            <div>
              <label className={`text-xs font-bold mb-2 block ${tema.colores.texto}`}>
                Prioridad
              </label>
              <select
                value={filtroPrioridad}
                onChange={(e) => setFiltroPrioridad(e.target.value)}
                className={`w-full px-4 py-2 rounded-xl text-sm ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto} focus:ring-2 focus:ring-indigo-500/50 transition-all`}
              >
                <option value="todas">Todas las prioridades</option>
                <option value="critica">🔥 Crítica</option>
                <option value="alta">⚡ Alta</option>
                <option value="media">⚠️ Media</option>
                <option value="baja">✅ Baja</option>
              </select>
            </div>

            <div>
              <label className={`text-xs font-bold mb-2 block ${tema.colores.texto}`}>
                Tipo
              </label>
              <select
                value={filtroTipo}
                onChange={(e) => setFiltroTipo(e.target.value)}
                className={`w-full px-4 py-2 rounded-xl text-sm ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto} focus:ring-2 focus:ring-indigo-500/50 transition-all`}
              >
                <option value="todos">Todos los tipos</option>
                {tiposDisponibles.map((tipo) => (
                  <option key={tipo} value={tipo}>
                    {tipo.toUpperCase()}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className={`text-xs font-bold mb-2 block ${tema.colores.texto}`}>
                Centro
              </label>
              <select
                value={filtroCentro}
                onChange={(e) => setFiltroCentro(e.target.value)}
                className={`w-full px-4 py-2 rounded-xl text-sm ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto} focus:ring-2 focus:ring-indigo-500/50 transition-all`}
              >
                <option value="todos">Todos los centros</option>
                {centrosDisponibles.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between">
            <button
              onClick={() => {
                setFiltroEstado("todos");
                setFiltroPrioridad("todas");
                setFiltroTipo("todos");
                setFiltroCentro("todos");
                setBusqueda("");
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-sm ${tema.colores.hover} ${tema.colores.texto} transition-all duration-300 hover:scale-105`}
            >
              <X className="w-4 h-4" />
              Limpiar Filtros
            </button>
            <div className="flex items-center gap-2">
              <span
                className={`text-sm font-semibold ${tema.colores.textoSecundario}`}
              >
                Mostrando
              </span>
              <span
                className={`px-3 py-1 rounded-full text-sm font-bold bg-gradient-to-r ${tema.colores.gradiente} text-white shadow-lg`}
              >
                {ticketsFiltrados.length}
              </span>
              <span
                className={`text-sm font-semibold ${tema.colores.textoSecundario}`}
              >
                de {tickets.length} tickets
              </span>
            </div>
          </div>
        </div>

        {/* Contenido principal según vista */}
        {loadingData ? (
          <div
            className={`rounded-2xl p-12 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra}`}
          >
            <div className="flex flex-col items-center justify-center py-12">
              <div className="relative mb-6">
                <div className="w-20 h-20 border-4 border-indigo-400 border-t-transparent rounded-full animate-spin"></div>
                <div
                  className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-gradient-to-br ${tema.colores.gradiente} rounded-full flex items-center justify-center animate-pulse`}
                >
                  <History className="w-6 h-6 text-white" />
                </div>
              </div>
              <h3 className={`text-2xl font-black mb-2 ${tema.colores.texto}`}>
                Cargando Historial Premium
              </h3>
              <p className={`text-sm ${tema.colores.textoSecundario}`}>
                Procesando datos con análisis avanzado...
              </p>
            </div>
          </div>
        ) : ticketsFiltrados.length === 0 ? (
          <div
            className={`rounded-2xl p-12 text-center ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra}`}
          >
            <div
              className={`w-24 h-24 bg-gradient-to-br ${tema.colores.gradiente} rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse`}
            >
              <History className="w-12 h-12 text-white" />
            </div>
            <h3 className={`text-2xl font-black mb-2 ${tema.colores.texto}`}>
              No hay tickets en este rango
            </h3>
            <p className={`text-lg mb-6 ${tema.colores.textoSecundario}`}>
              Ajusta el rango de fechas o los filtros para visualizar el historial
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <button
                onClick={() => cambiarRangoRapido("30d")}
                className={`px-6 py-3 rounded-xl font-bold ${tema.colores.primario} text-white transition-all duration-300 hover:scale-105 shadow-lg`}
              >
                Ver últimos 30 días
              </button>
              <button
                onClick={() => cambiarRangoRapido("todo")}
                className={`px-6 py-3 rounded-xl font-bold ${tema.colores.secundario} ${tema.colores.texto} transition-all duration-300 hover:scale-105`}
              >
                Ver todo el historial
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Vista Timeline */}
            {vistaActual === "timeline" && (
              <VistaTimeline
                tema={tema}
                historialAgrupado={historialAgrupado}
                setTicketSeleccionado={setTicketSeleccionado}
                obtenerIconoTipo={obtenerIconoTipo}
                obtenerColorEstado={obtenerColorEstado}
                obtenerColorPrioridad={obtenerColorPrioridad}
                formatearFecha={formatearFecha}
                actualizarEstadoTicket={actualizarEstadoTicket}
              />
            )}

            {/* Vista Tabla */}
            {vistaActual === "tabla" && (
              <VistaTabla
                tema={tema}
                ticketsFiltrados={ticketsFiltrados}
                setTicketSeleccionado={setTicketSeleccionado}
                obtenerIconoTipo={obtenerIconoTipo}
                obtenerColorEstado={obtenerColorEstado}
                obtenerColorPrioridad={obtenerColorPrioridad}
                formatearFecha={formatearFecha}
              />
            )}

            {/* Vista Kanban */}
            {vistaActual === "kanban" && (
              <VistaKanban
                tema={tema}
                ticketsFiltrados={ticketsFiltrados}
                setTicketSeleccionado={setTicketSeleccionado}
                obtenerIconoTipo={obtenerIconoTipo}
                obtenerColorPrioridad={obtenerColorPrioridad}
                formatearFecha={formatearFecha}
                actualizarEstadoTicket={actualizarEstadoTicket}
              />
            )}

            {/* Vista Calendario */}
            {vistaActual === "calendario" && (
              <VistaCalendario
                tema={tema}
                ticketsFiltrados={ticketsFiltrados}
                setTicketSeleccionado={setTicketSeleccionado}
                obtenerColorEstado={obtenerColorEstado}
                obtenerColorPrioridad={obtenerColorPrioridad}
                formatearFecha={formatearFecha}
              />
            )}
          </>
        )}

        {/* FOOTER PREMIUM */}
        <footer
          className={`transition-all duration-300 mt-10 rounded-2xl px-6 py-4 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra}`}
        >
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div
                className={`w-8 h-8 rounded-lg bg-gradient-to-br ${tema.colores.gradiente} flex items-center justify-center shadow-lg`}
              >
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className={`text-sm font-bold ${tema.colores.texto}`}>
                  © 2025 AnyssaMed Premium
                </p>
                <p className={`text-xs ${tema.colores.textoSecundario}`}>
                  Historial de Tickets con IA y Analytics
                </p>
              </div>
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r ${tema.colores.gradiente} text-white shadow-lg`}
              >
                v5.0.0 Premium
              </span>
            </div>
            <div className="flex items-center gap-4">
              <Link
                href="/ayuda"
                className={`text-sm font-bold transition-colors ${tema.colores.textoSecundario} hover:${tema.colores.acento}`}
              >
                Ayuda
              </Link>
              <Link
                href="/privacidad"
                className={`text-sm font-bold transition-colors ${tema.colores.textoSecundario} hover:${tema.colores.acento}`}
              >
                Privacidad
              </Link>
              <Link
                href="/terminos"
                className={`text-sm font-bold transition-colors ${tema.colores.textoSecundario} hover:${tema.colores.acento}`}
              >
                Términos
              </Link>
              <button
                onClick={cerrarSesion}
                className={`text-sm font-bold transition-colors ${tema.colores.textoSecundario} hover:text-red-400 flex items-center gap-1`}
              >
                <LogOut className="w-4 h-4" />
                Salir
              </button>
            </div>
          </div>
        </footer>
      </main>

      {/* PANEL DETALLE TICKET PREMIUM */}
      {ticketSeleccionado && (
        <PanelDetalleTicket
          ticket={ticketSeleccionado}
          tema={tema}
          onClose={() => setTicketSeleccionado(null)}
          obtenerIconoTipo={obtenerIconoTipo}
          obtenerColorEstado={obtenerColorEstado}
          obtenerColorPrioridad={obtenerColorPrioridad}
          formatearFecha={formatearFecha}
          actualizarEstadoTicket={actualizarEstadoTicket}
          actualizarPrioridadTicket={actualizarPrioridadTicket}
        />
      )}

      {/* ESTILOS GLOBALES PREMIUM */}
      <style jsx global>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        html {
          scroll-behavior: smooth;
        }

        body {
          font-family: "Inter", "Segoe UI", sans-serif;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }

        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(99, 102, 241, 0.5);
          border-radius: 10px;
          transition: background 0.3s ease;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(99, 102, 241, 0.8);
        }

        @keyframes wave {
          0%, 100% { transform: rotate(0deg); }
          10%, 20% { transform: rotate(14deg); }
          30%, 60%, 90% { transform: rotate(-8deg); }
          40%, 80% { transform: rotate(14deg); }
          50% { transform: rotate(10deg); }
        }
        .animate-wave {
          animation: wave 1s ease-in-out infinite;
          transform-origin: 70% 70%;
          display: inline-block;
        }

        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }

        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slideDown {
          animation: slideDown 0.3s ease-out;
        }

        @keyframes pulse-glow {
          0%, 100% {
            box-shadow: 0 0 20px rgba(99, 102, 241, 0.5);
          }
          50% {
            box-shadow: 0 0 40px rgba(99, 102, 241, 0.8);
          }
        }
        .animate-pulse-glow {
          animation: pulse-glow 2s ease-in-out infinite;
        }

        @media (max-width: 768px) {
          .hidden\\.md\\:block {
            display: none;
          }
        }

        @media print {
          .no-print {
            display: none !important;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          * {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
        }
      `}</style>
    </div>
  );
}

// ========================================
// COMPONENTES AUXILIARES PREMIUM
// ========================================

function ResumenCardPremium({
  tema,
  icono: Icono,
  titulo,
  valor,
  chip,
  color,
  animacion,
}: {
  tema: ConfiguracionTema;
  icono: any;
  titulo: string;
  valor: number | string;
  chip: string;
  color: string;
  animacion: string;
}) {
  return (
    <div
      className={`rounded-2xl p-5 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} transition-all duration-300 hover:scale-105 hover:-translate-y-2 cursor-pointer group relative overflow-hidden`}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-3">
          <div
            className={`w-12 h-12 bg-gradient-to-br ${color} rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-300`}
          >
            <Icono className="w-6 h-6 text-white" />
          </div>
          <div
            className={`w-8 h-8 rounded-lg bg-gradient-to-br ${color} opacity-20 group-hover:opacity-40 transition-opacity`}
          />
        </div>
        
        <div className={`text-3xl font-black mb-1 ${tema.colores.texto} group-hover:scale-110 transition-transform origin-left`}>
          {isNaN(Number(valor)) ? valor : Number(valor).toLocaleString()}
        </div>
        
        <div
          className={`text-xs font-bold uppercase tracking-wider ${tema.colores.textoSecundario} mb-2`}
        >
          {titulo}
        </div>
        
        <div className="flex items-center justify-between">
          <span
            className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-semibold ${tema.colores.hover}`}
          >
            <Sparkles className="w-3 h-3" />
            {chip}
          </span>
          <ChevronRight className={`w-4 h-4 ${tema.colores.textoSecundario} group-hover:translate-x-1 transition-transform`} />
        </div>
      </div>
    </div>
  );
}

function MetricaAvanzada({
  tema,
  icono: Icono,
  titulo,
  valor,
  tendencia,
  color,
}: {
  tema: ConfiguracionTema;
  icono: any;
  titulo: string;
  valor: number | string;
  tendencia: "up" | "down";
  color: string;
}) {
  return (
    <div
      className={`rounded-xl p-4 ${tema.colores.fondoSecundario} ${tema.colores.borde} border transition-all duration-300 hover:scale-105`}
    >
      <div className="flex items-center justify-between mb-2">
        <div
          className={`w-10 h-10 bg-gradient-to-br ${color} rounded-lg flex items-center justify-center shadow-lg`}
        >
          <Icono className="w-5 h-5 text-white" />
        </div>
        {tendencia === "up" ? (
          <TrendingUp className="w-5 h-5 text-emerald-500" />
        ) : (
          <TrendingDown className="w-5 h-5 text-red-500" />
        )}
      </div>
      <div className={`text-2xl font-black ${tema.colores.texto} mb-1`}>
        {valor}
      </div>
      <div className={`text-xs font-semibold ${tema.colores.textoSecundario}`}>
        {titulo}
      </div>
    </div>
  );
}

// Continúa en el siguiente mensaje con los componentes de vistas...
// ========================================
// COMPONENTE: VISTA TIMELINE PREMIUM
// ========================================

function VistaTimeline({
  tema,
  historialAgrupado,
  setTicketSeleccionado,
  obtenerIconoTipo,
  obtenerColorEstado,
  obtenerColorPrioridad,
  formatearFecha,
  actualizarEstadoTicket,
}: {
  tema: ConfiguracionTema;
  historialAgrupado: GrupoHistorial[];
  setTicketSeleccionado: (ticket: Ticket) => void;
  obtenerIconoTipo: (tipo: string) => any;
  obtenerColorEstado: (estado: string) => string;
  obtenerColorPrioridad: (prioridad: string) => string;
  formatearFecha: (fecha: string) => string;
  actualizarEstadoTicket: (id: number, estado: Ticket["estado"]) => void;
}) {
  return (
    <div
      className={`rounded-2xl p-6 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} animate-slideDown`}
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div
            className={`w-12 h-12 rounded-xl bg-gradient-to-br ${tema.colores.gradiente} flex items-center justify-center shadow-lg animate-pulse-glow`}
          >
            <History className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className={`text-2xl font-black ${tema.colores.texto}`}>
              Timeline de Tickets
            </h3>
            <p className={`text-sm ${tema.colores.textoSecundario}`}>
              Visualización cronológica completa con análisis temporal
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`px-4 py-2 rounded-xl text-sm font-bold bg-gradient-to-r ${tema.colores.gradiente} text-white shadow-lg`}
          >
            {historialAgrupado.reduce((acc, g) => acc + g.tickets.length, 0)} tickets
          </span>
        </div>
      </div>

      {/* Timeline */}
      <div className="relative pl-8">
        {/* Línea vertical principal */}
        <div className="absolute left-3 top-0 bottom-0 w-1 bg-gradient-to-b from-indigo-500 via-purple-500 to-pink-500 rounded-full shadow-lg" />

        <div className="space-y-8">
          {historialAgrupado.map((grupo, grupoIdx) => (
            <div key={grupo.fecha} className="relative animate-slideDown" style={{ animationDelay: `${grupoIdx * 0.1}s` }}>
              {/* Punto del día */}
              <div className="flex items-center gap-4 mb-4">
                <div className="relative">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 shadow-xl shadow-indigo-500/50 animate-pulse" />
                  <div className="absolute inset-0 w-6 h-6 rounded-full border-4 border-indigo-400/30 animate-ping" />
                </div>
                <div className="flex-1">
                  <h4 className={`text-lg font-black ${tema.colores.texto}`}>
                    {grupo.label}
                  </h4>
                  <p className={`text-xs ${tema.colores.textoSecundario}`}>
                    {grupo.tickets.length} ticket{grupo.tickets.length !== 1 ? "s" : ""} •{" "}
                    {grupo.tickets.filter((t) => t.estado === "resuelto").length} resueltos
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {grupo.tickets.some((t) => t.prioridad === "critica") && (
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-red-500/20 text-red-300 border border-red-400/40 flex items-center gap-1">
                      <Flame className="w-3 h-3" />
                      Críticos
                    </span>
                  )}
                </div>
              </div>

              {/* Tickets del día */}
              <div className="space-y-4 ml-6">
                {grupo.tickets.map((ticket, ticketIdx) => {
                  const IconoTipo = obtenerIconoTipo(ticket.tipo);
                  
                  return (
                    <div
                      key={ticket.id_ticket}
                      className="relative group animate-slideDown"
                      style={{ animationDelay: `${(grupoIdx * 0.1) + (ticketIdx * 0.05)}s` }}
                    >
                      {/* Punto del ticket */}
                      <div className="absolute -left-6 top-6 w-4 h-4 rounded-full bg-gradient-to-br from-indigo-400 to-purple-400 shadow-lg shadow-indigo-400/50 group-hover:scale-125 transition-transform" />

                      <div
                        onClick={() => setTicketSeleccionado(ticket)}
                        className={`rounded-2xl p-5 ${tema.colores.card} ${tema.colores.borde} border transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1 cursor-pointer group-hover:shadow-2xl group-hover:border-indigo-500/50 relative overflow-hidden`}
                      >
                        {/* Efecto de brillo */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />

                        <div className="relative z-10">
                          <div className="flex items-start justify-between gap-4 mb-4">
                            <div className="flex items-start gap-4 flex-1">
                              {/* Icono del tipo */}
                              <div
                                className={`w-14 h-14 rounded-xl bg-gradient-to-br ${tema.colores.gradiente} flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 flex-shrink-0`}
                              >
                                <IconoTipo className="w-7 h-7 text-white" />
                              </div>

                              {/* Información principal */}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-2 mb-2">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                      <span
                                        className={`text-xs font-bold px-3 py-1 rounded-full bg-gradient-to-r ${tema.colores.gradiente} text-white shadow-lg`}
                                      >
                                        {ticket.numero_ticket}
                                      </span>
                                      <span
                                        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold border ${obtenerColorEstado(
                                          ticket.estado
                                        )}`}
                                      >
                                        <Activity className="w-3 h-3" />
                                        {ticket.estado.replace("_", " ").toUpperCase()}
                                      </span>
                                      <span
                                        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold border ${obtenerColorPrioridad(
                                          ticket.prioridad
                                        )}`}
                                      >
                                        {ticket.prioridad === "critica" ? (
                                          <Flame className="w-3 h-3 animate-pulse" />
                                        ) : (
                                          <ZapIcon className="w-3 h-3" />
                                        )}
                                        {ticket.prioridad.toUpperCase()}
                                      </span>
                                    </div>
                                    <h5
                                      className={`text-base font-black ${tema.colores.texto} mb-2 group-hover:text-indigo-500 transition-colors`}
                                    >
                                      {ticket.titulo}
                                    </h5>
                                    <p
                                      className={`text-sm ${tema.colores.textoSecundario} line-clamp-2 mb-3`}
                                    >
                                      {ticket.descripcion}
                                    </p>
                                  </div>
                                </div>

                                {/* Metadatos */}
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                                  <div
                                    className={`flex items-center gap-2 px-3 py-2 rounded-lg ${tema.colores.hover}`}
                                  >
                                    <MapPinIcon className={`w-4 h-4 ${tema.colores.acento}`} />
                                    <div className="min-w-0">
                                      <p className="text-[10px] font-semibold opacity-70">
                                        Centro
                                      </p>
                                      <p
                                        className={`text-xs font-bold ${tema.colores.texto} truncate`}
                                      >
                                        {ticket.centro?.nombre}
                                      </p>
                                    </div>
                                  </div>

                                  <div
                                    className={`flex items-center gap-2 px-3 py-2 rounded-lg ${tema.colores.hover}`}
                                  >
                                    <User className={`w-4 h-4 ${tema.colores.acento}`} />
                                    <div className="min-w-0">
                                      <p className="text-[10px] font-semibold opacity-70">
                                        Solicitante
                                      </p>
                                      <p
                                        className={`text-xs font-bold ${tema.colores.texto} truncate`}
                                      >
                                        {ticket.solicitante.nombre_completo}
                                      </p>
                                    </div>
                                  </div>

                                  <div
                                    className={`flex items-center gap-2 px-3 py-2 rounded-lg ${tema.colores.hover}`}
                                  >
                                    <Clock className={`w-4 h-4 ${tema.colores.acento}`} />
                                    <div className="min-w-0">
                                      <p className="text-[10px] font-semibold opacity-70">
                                        Tiempo Est.
                                      </p>
                                      <p
                                        className={`text-xs font-bold ${tema.colores.texto}`}
                                      >
                                        {ticket.tiempo_estimado_minutos} min
                                      </p>
                                    </div>
                                  </div>

                                  {ticket.tiempo_real_minutos && (
                                    <div
                                      className={`flex items-center gap-2 px-3 py-2 rounded-lg ${tema.colores.hover}`}
                                    >
                                      <Timer className={`w-4 h-4 ${tema.colores.acento}`} />
                                      <div className="min-w-0">
                                        <p className="text-[10px] font-semibold opacity-70">
                                          Tiempo Real
                                        </p>
                                        <p
                                          className={`text-xs font-bold ${
                                            ticket.tiempo_real_minutos <=
                                            ticket.tiempo_estimado_minutos
                                              ? "text-emerald-500"
                                              : "text-red-500"
                                          }`}
                                        >
                                          {ticket.tiempo_real_minutos} min
                                        </p>
                                      </div>
                                    </div>
                                  )}
                                </div>

                                {/* Fechas */}
                                <div className="flex flex-wrap items-center gap-3 mb-3 text-xs">
                                  <div className="flex items-center gap-1">
                                    <CalendarPlus
                                      className={`w-3 h-3 ${tema.colores.textoSecundario}`}
                                    />
                                    <span className={tema.colores.textoSecundario}>
                                      Creado:
                                    </span>
                                    <span className={tema.colores.texto}>
                                      {formatearFecha(ticket.fecha_creacion)}
                                    </span>
                                  </div>
                                  {ticket.fecha_resolucion && (
                                    <div className="flex items-center gap-1">
                                      <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                                      <span className={tema.colores.textoSecundario}>
                                        Resuelto:
                                      </span>
                                      <span className="text-emerald-500 font-bold">
                                        {formatearFecha(ticket.fecha_resolucion)}
                                      </span>
                                    </div>
                                  )}
                                </div>

                                {/* Acciones rápidas */}
                                <div className="flex flex-wrap items-center gap-2">
                                  {ticket.estado !== "resuelto" && (
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        actualizarEstadoTicket(
                                          ticket.id_ticket,
                                          "resuelto"
                                        );
                                      }}
                                      className="px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 transition-all duration-300 hover:scale-105 shadow-lg flex items-center gap-1"
                                    >
                                      <CheckCircle2 className="w-3 h-3" />
                                      Resolver
                                    </button>
                                  )}
                                  {ticket.estado !== "en_progreso" &&
                                    ticket.estado !== "resuelto" && (
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          actualizarEstadoTicket(
                                            ticket.id_ticket,
                                            "en_progreso"
                                          );
                                        }}
                                        className="px-3 py-1.5 rounded-lg text-xs font-bold bg-blue-600 text-white hover:bg-blue-700 transition-all duration-300 hover:scale-105 shadow-lg flex items-center gap-1"
                                      >
                                        <PlayCircle className="w-3 h-3" />
                                        Iniciar
                                      </button>
                                    )}
                                  {ticket.solicitante.telefono && (
                                    <a
                                      href={`tel:${ticket.solicitante.telefono}`}
                                      onClick={(e) => e.stopPropagation()}
                                      className={`px-3 py-1.5 rounded-lg text-xs font-bold ${tema.colores.hover} ${tema.colores.texto} transition-all duration-300 hover:scale-105 flex items-center gap-1`}
                                    >
                                      <PhoneIcon className="w-3 h-3" />
                                      Llamar
                                    </a>
                                  )}
                                  <Link
                                    href={`/tecnico/tickets/${ticket.id_ticket}`}
                                    onClick={(e) => e.stopPropagation()}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold ${tema.colores.primario} text-white transition-all duration-300 hover:scale-105 shadow-lg flex items-center gap-1`}
                                  >
                                    <Eye className="w-3 h-3" />
                                    Ver Detalle
                                  </Link>
                                </div>
                              </div>
                            </div>

                            {/* Indicador de calificación */}
                            {ticket.calificacion && (
                              <div className="flex items-center gap-1 px-3 py-2 rounded-lg bg-yellow-500/20 border border-yellow-400/40">
                                <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                                <span className="text-sm font-bold text-yellow-500">
                                  {ticket.calificacion.toFixed(1)}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ========================================
// COMPONENTE: VISTA TABLA PREMIUM
// ========================================

function VistaTabla({
  tema,
  ticketsFiltrados,
  setTicketSeleccionado,
  obtenerIconoTipo,
  obtenerColorEstado,
  obtenerColorPrioridad,
  formatearFecha,
}: {
  tema: ConfiguracionTema;
  ticketsFiltrados: Ticket[];
  setTicketSeleccionado: (ticket: Ticket) => void;
  obtenerIconoTipo: (tipo: string) => any;
  obtenerColorEstado: (estado: string) => string;
  obtenerColorPrioridad: (prioridad: string) => string;
  formatearFecha: (fecha: string) => string;
}) {
  const [ordenarPor, setOrdenarPor] = useState<"fecha" | "prioridad" | "estado">("fecha");
  const [ordenAsc, setOrdenAsc] = useState(false);

  const ticketsOrdenados = useMemo(() => {
    const copia = [...ticketsFiltrados];
    
    copia.sort((a, b) => {
      if (ordenarPor === "fecha") {
        const fechaA = a.fecha_resolucion || a.fecha_asignacion || a.fecha_creacion;
        const fechaB = b.fecha_resolucion || b.fecha_asignacion || b.fecha_creacion;
        return ordenAsc
          ? fechaA.localeCompare(fechaB)
          : fechaB.localeCompare(fechaA);
      } else if (ordenarPor === "prioridad") {
        const prioridades = { critica: 4, alta: 3, media: 2, baja: 1 };
        const diff =
          prioridades[b.prioridad as keyof typeof prioridades] -
          prioridades[a.prioridad as keyof typeof prioridades];
        return ordenAsc ? -diff : diff;
      } else {
        return ordenAsc
          ? a.estado.localeCompare(b.estado)
          : b.estado.localeCompare(a.estado);
      }
    });

    return copia;
  }, [ticketsFiltrados, ordenarPor, ordenAsc]);

  return (
    <div
      className={`rounded-2xl ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} overflow-hidden animate-slideDown`}
    >
      <div className="p-6 border-b border-gray-700/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`w-12 h-12 rounded-xl bg-gradient-to-br ${tema.colores.gradiente} flex items-center justify-center shadow-lg`}
            >
              <ClipboardList className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className={`text-2xl font-black ${tema.colores.texto}`}>
                Vista de Tabla
              </h3>
              <p className={`text-sm ${tema.colores.textoSecundario}`}>
                Visualización compacta y ordenable
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className={`text-sm font-semibold ${tema.colores.textoSecundario}`}>
              Ordenar por:
            </span>
            <select
              value={ordenarPor}
              onChange={(e) =>
                setOrdenarPor(e.target.value as "fecha" | "prioridad" | "estado")
              }
              className={`px-3 py-2 rounded-lg text-sm font-bold ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto}`}
            >
              <option value="fecha">Fecha</option>
              <option value="prioridad">Prioridad</option>
              <option value="estado">Estado</option>
            </select>
            <button
              onClick={() => setOrdenAsc(!ordenAsc)}
              className={`p-2 rounded-lg ${tema.colores.hover} transition-all duration-300 hover:scale-110`}
            >
              {ordenAsc ? (
                <TrendingUp className="w-5 h-5" />
              ) : (
                <TrendingDown className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto custom-scrollbar">
        <table className="w-full">
          <thead className={`${tema.colores.fondoSecundario} border-b ${tema.colores.borde}`}>
            <tr>
              <th className={`px-6 py-4 text-left text-xs font-black ${tema.colores.texto} uppercase tracking-wider`}>
                Ticket
              </th>
              <th className={`px-6 py-4 text-left text-xs font-black ${tema.colores.texto} uppercase tracking-wider`}>
                Estado
              </th>
              <th className={`px-6 py-4 text-left text-xs font-black ${tema.colores.texto} uppercase tracking-wider`}>
                Prioridad
              </th>
              <th className={`px-6 py-4 text-left text-xs font-black ${tema.colores.texto} uppercase tracking-wider`}>
                Tipo
              </th>
              <th className={`px-6 py-4 text-left text-xs font-black ${tema.colores.texto} uppercase tracking-wider`}>
                Centro
              </th>
              <th className={`px-6 py-4 text-left text-xs font-black ${tema.colores.texto} uppercase tracking-wider`}>
                Fecha
              </th>
              <th className={`px-6 py-4 text-left text-xs font-black ${tema.colores.texto} uppercase tracking-wider`}>
                Tiempo
              </th>
              <th className={`px-6 py-4 text-center text-xs font-black ${tema.colores.texto} uppercase tracking-wider`}>
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className={`divide-y ${tema.colores.borde}`}>
            {ticketsOrdenados.map((ticket, idx) => {
              const IconoTipo = obtenerIconoTipo(ticket.tipo);
              
              return (
                <tr
                  key={ticket.id_ticket}
                  onClick={() => setTicketSeleccionado(ticket)}
                  className={`${tema.colores.hover} transition-all duration-300 cursor-pointer hover:scale-[1.01] animate-slideDown`}
                  style={{ animationDelay: `${idx * 0.03}s` }}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-lg bg-gradient-to-br ${tema.colores.gradiente} flex items-center justify-center shadow-lg flex-shrink-0`}
                      >
                        <IconoTipo className="w-5 h-5 text-white" />
                      </div>
                      <div className="min-w-0">
                        <p
                          className={`text-sm font-bold ${tema.colores.texto} truncate`}
                        >
                          {ticket.numero_ticket}
                        </p>
                        <p
                          className={`text-xs ${tema.colores.textoSecundario} truncate`}
                        >
                          {ticket.titulo}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold border ${obtenerColorEstado(
                        ticket.estado
                      )}`}
                    >
                      <Activity className="w-3 h-3" />
                      {ticket.estado.replace("_", " ")}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold border ${obtenerColorPrioridad(
                        ticket.prioridad
                      )}`}
                    >
                      {ticket.prioridad === "critica" ? (
                        <Flame className="w-3 h-3 animate-pulse" />
                      ) : (
                        <ZapIcon className="w-3 h-3" />
                      )}
                      {ticket.prioridad}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-sm font-semibold ${tema.colores.texto}`}>
                      {ticket.tipo.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <MapPinIcon className={`w-4 h-4 ${tema.colores.acento}`} />
                      <span className={`text-sm font-semibold ${tema.colores.texto}`}>
                        {ticket.centro?.nombre}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className={`text-xs ${tema.colores.texto}`}>
                      {formatearFecha(
                        ticket.fecha_resolucion ||
                          ticket.fecha_asignacion ||
                          ticket.fecha_creacion
                      )}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Timer className={`w-4 h-4 ${tema.colores.acento}`} />
                      <span
                        className={`text-sm font-bold ${
                          ticket.tiempo_real_minutos &&
                          ticket.tiempo_real_minutos <= ticket.tiempo_estimado_minutos
                            ? "text-emerald-500"
                            : tema.colores.texto
                        }`}
                      >
                        {ticket.tiempo_real_minutos || ticket.tiempo_estimado_minutos} min
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setTicketSeleccionado(ticket);
                        }}
                        className={`p-2 rounded-lg ${tema.colores.primario} text-white transition-all duration-300 hover:scale-110 shadow-lg`}
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      {ticket.solicitante.telefono && (
                        <a
                          href={`tel:${ticket.solicitante.telefono}`}
                          onClick={(e) => e.stopPropagation()}
                          className={`p-2 rounded-lg ${tema.colores.hover} transition-all duration-300 hover:scale-110`}
                        >
                          <PhoneIcon className="w-4 h-4" />
                        </a>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ========================================
// COMPONENTE: VISTA KANBAN PREMIUM
// ========================================

function VistaKanban({
  tema,
  ticketsFiltrados,
  setTicketSeleccionado,
  obtenerIconoTipo,
  obtenerColorPrioridad,
  formatearFecha,
  actualizarEstadoTicket,
}: {
  tema: ConfiguracionTema;
  ticketsFiltrados: Ticket[];
  setTicketSeleccionado: (ticket: Ticket) => void;
  obtenerIconoTipo: (tipo: string) => any;
  obtenerColorPrioridad: (prioridad: string) => string;
  formatearFecha: (fecha: string) => string;
  actualizarEstadoTicket: (id: number, estado: Ticket["estado"]) => void;
}) {
  const columnas: { estado: Ticket["estado"]; titulo: string; icono: any; color: string }[] = [
    { estado: "abierto", titulo: "Abiertos", icono: AlertCircle, color: "from-red-500 to-pink-500" },
    { estado: "en_progreso", titulo: "En Progreso", icono: PlayCircle, color: "from-blue-500 to-cyan-500" },
    { estado: "resuelto", titulo: "Resueltos", icono: CheckCircle2, color: "from-emerald-500 to-teal-500" },
    { estado: "cancelado", titulo: "Cancelados", icono: X, color: "from-gray-500 to-slate-500" },
  ];

  const ticketsPorEstado = useMemo(() => {
    const mapa: Record<string, Ticket[]> = {
      abierto: [],
      en_progreso: [],
      resuelto: [],
      cancelado: [],
    };

    ticketsFiltrados.forEach((ticket) => {
      mapa[ticket.estado].push(ticket);
    });

    return mapa;
  }, [ticketsFiltrados]);

  return (
    <div className="animate-slideDown">
      <div
        className={`rounded-2xl p-6 mb-6 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra}`}
      >
        <div className="flex items-center gap-3">
          <div
            className={`w-12 h-12 rounded-xl bg-gradient-to-br ${tema.colores.gradiente} flex items-center justify-center shadow-lg`}
          >
            <Layers className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className={`text-2xl font-black ${tema.colores.texto}`}>
              Vista Kanban
            </h3>
            <p className={`text-sm ${tema.colores.textoSecundario}`}>
              Gestión visual por estados con drag & drop
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {columnas.map((columna, colIdx) => (
          <div
            key={columna.estado}
            className={`rounded-2xl ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} overflow-hidden animate-slideDown`}
            style={{ animationDelay: `${colIdx * 0.1}s` }}
          >
            {/* Header de columna */}
            <div className={`p-4 bg-gradient-to-r ${columna.color} border-b ${tema.colores.borde}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 backdrop-blur-xl rounded-lg flex items-center justify-center">
                    <columna.icono className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h4 className="text-lg font-black text-white">{columna.titulo}</h4>
                    <p className="text-xs font-semibold text-white/80">
                      {ticketsPorEstado[columna.estado].length} tickets
                    </p>
                  </div>
                </div>
                <span className="px-3 py-1 rounded-full text-sm font-bold bg-white/20 backdrop-blur-xl text-white">
                  {ticketsPorEstado[columna.estado].length}
                </span>
              </div>
            </div>

            {/* Tickets */}
            <div className="p-4 space-y-3 max-h-[600px] overflow-y-auto custom-scrollbar">
              {ticketsPorEstado[columna.estado].length === 0 ? (
                <div className="text-center py-8">
                  <columna.icono
                    className={`w-12 h-12 mx-auto mb-3 ${tema.colores.textoSecundario} opacity-30`}
                  />
                  <p className={`text-sm font-semibold ${tema.colores.textoSecundario}`}>
                    No hay tickets
                  </p>
                </div>
              ) : (
                ticketsPorEstado[columna.estado].map((ticket, ticketIdx) => {
                  const IconoTipo = obtenerIconoTipo(ticket.tipo);
                  
                  return (
                    <div
                      key={ticket.id_ticket}
                      onClick={() => setTicketSeleccionado(ticket)}
                      className={`rounded-xl p-4 ${tema.colores.fondoSecundario} ${tema.colores.borde} border transition-all duration-300 hover:scale-105 hover:shadow-xl cursor-pointer group animate-slideDown`}
                      style={{ animationDelay: `${ticketIdx * 0.05}s` }}
                    >
                      <div className="flex items-start gap-3 mb-3">
                        <div
                          className={`w-10 h-10 rounded-lg bg-gradient-to-br ${tema.colores.gradiente} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform flex-shrink-0`}
                        >
                          <IconoTipo className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p
                            className={`text-xs font-bold mb-1 px-2 py-1 rounded-md bg-gradient-to-r ${tema.colores.gradiente} text-white inline-block`}
                          >
                            {ticket.numero_ticket}
                          </p>
                          <h5
                            className={`text-sm font-black ${tema.colores.texto} line-clamp-2 group-hover:text-indigo-500 transition-colors`}
                          >
                            {ticket.titulo}
                          </h5>
                        </div>
                      </div>

                      <div className="space-y-2 mb-3">
                        <div className="flex items-center gap-2">
                          <span
                            className={`flex-1 px-2 py-1 rounded-md text-xs font-bold border ${obtenerColorPrioridad(
                              ticket.prioridad
                            )}`}
                          >
                            {ticket.prioridad === "critica" ? "🔥" : "⚡"}{" "}
                            {ticket.prioridad.toUpperCase()}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-xs">
                          <MapPinIcon className={`w-3 h-3 ${tema.colores.acento}`} />
                          <span className={`font-semibold ${tema.colores.texto} truncate`}>
                            {ticket.centro?.nombre}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-xs">
                          <Clock className={`w-3 h-3 ${tema.colores.acento}`} />
                          <span className={`font-semibold ${tema.colores.textoSecundario}`}>
                            {formatearFecha(ticket.fecha_creacion)}
                          </span>
                        </div>
                      </div>

                      {/* Acciones rápidas de cambio de estado */}
                      <div className="flex flex-wrap gap-1">
                        {columnas
                          .filter((c) => c.estado !== columna.estado)
                          .map((c) => (
                            <button
                              key={c.estado}
                              onClick={(e) => {
                                e.stopPropagation();
                                actualizarEstadoTicket(ticket.id_ticket, c.estado);
                              }}
                              className={`flex-1 px-2 py-1 rounded-md text-[10px] font-bold bg-gradient-to-r ${c.color} text-white transition-all duration-300 hover:scale-105 shadow-lg`}
                              title={`Mover a ${c.titulo}`}
                            >
                              <c.icono className="w-3 h-3 mx-auto" />
                            </button>
                          ))}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ========================================
// COMPONENTE: VISTA CALENDARIO PREMIUM
// ========================================

function VistaCalendario({
  tema,
  ticketsFiltrados,
  setTicketSeleccionado,
  obtenerColorEstado,
  obtenerColorPrioridad,
  formatearFecha,
}: {
  tema: ConfiguracionTema;
  ticketsFiltrados: Ticket[];
  setTicketSeleccionado: (ticket: Ticket) => void;
  obtenerColorEstado: (estado: string) => string;
  obtenerColorPrioridad: (prioridad: string) => string;
  formatearFecha: (fecha: string) => string;
}) {
  const [mesActual, setMesActual] = useState(new Date());

  const ticketsPorDia = useMemo(() => {
    const mapa: Record<string, Ticket[]> = {};

    ticketsFiltrados.forEach((ticket) => {
      const fecha =
        ticket.fecha_resolucion || ticket.fecha_asignacion || ticket.fecha_creacion;
      const dia = fecha.slice(0, 10);
      if (!mapa[dia]) mapa[dia] = [];
      mapa[dia].push(ticket);
    });

    return mapa;
  }, [ticketsFiltrados]);

  const diasDelMes = useMemo(() => {
    const year = mesActual.getFullYear();
    const month = mesActual.getMonth();
    const primerDia = new Date(year, month, 1);
    const ultimoDia = new Date(year, month + 1, 0);
    const dias: Date[] = [];

    // Días del mes anterior para completar la primera semana
    const diaSemana = primerDia.getDay();
    for (let i = diaSemana - 1; i >= 0; i--) {
      dias.push(new Date(year, month, -i));
    }

    // Días del mes actual
    for (let i = 1; i <= ultimoDia.getDate(); i++) {
      dias.push(new Date(year, month, i));
    }

    // Días del mes siguiente para completar la última semana
    const diasRestantes = 7 - (dias.length % 7);
    if (diasRestantes < 7) {
      for (let i = 1; i <= diasRestantes; i++) {
        dias.push(new Date(year, month + 1, i));
      }
    }

    return dias;
  }, [mesActual]);

  const cambiarMes = (direccion: number) => {
    setMesActual(
      new Date(mesActual.getFullYear(), mesActual.getMonth() + direccion, 1)
    );
  };

  return (
    <div className="animate-slideDown">
      <div
        className={`rounded-2xl p-6 mb-6 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra}`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`w-12 h-12 rounded-xl bg-gradient-to-br ${tema.colores.gradiente} flex items-center justify-center shadow-lg`}
            >
              <Calendar className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className={`text-2xl font-black ${tema.colores.texto}`}>
                Vista Calendario
              </h3>
              <p className={`text-sm ${tema.colores.textoSecundario}`}>
                Visualización temporal por días
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => cambiarMes(-1)}
              className={`p-2 rounded-lg ${tema.colores.hover} transition-all duration-300 hover:scale-110`}
            >
              <SkipBack className="w-5 h-5" />
            </button>
            <div className="text-center">
              <p className={`text-xl font-black ${tema.colores.texto}`}>
                {mesActual.toLocaleDateString("es-CL", { month: "long", year: "numeric" })}
              </p>
            </div>
            <button
              onClick={() => cambiarMes(1)}
              className={`p-2 rounded-lg ${tema.colores.hover} transition-all duration-300 hover:scale-110`}
            >
              <SkipForward className="w-5 h-5" />
            </button>
            <button
              onClick={() => setMesActual(new Date())}
              className={`px-4 py-2 rounded-lg font-bold ${tema.colores.primario} text-white transition-all duration-300 hover:scale-105 shadow-lg`}
            >
              Hoy
            </button>
          </div>
        </div>
      </div>

      <div
        className={`rounded-2xl overflow-hidden ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra}`}
      >
        {/* Encabezado de días */}
        <div className={`grid grid-cols-7 gap-px ${tema.colores.fondoSecundario}`}>
          {["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"].map((dia) => (
            <div
              key={dia}
              className={`p-4 text-center font-black text-sm ${tema.colores.texto} bg-gradient-to-r ${tema.colores.gradiente} text-white`}
            >
              {dia}
            </div>
          ))}
        </div>

        {/* Días del mes */}
        <div className={`grid grid-cols-7 gap-px ${tema.colores.borde} bg-gray-700/20`}>
          {diasDelMes.map((dia, idx) => {
            const diaStr = dia.toISOString().slice(0, 10);
            const ticketsDelDia = ticketsPorDia[diaStr] || [];
            const esMesActual = dia.getMonth() === mesActual.getMonth();
            const esHoy =
              dia.toDateString() === new Date().toDateString();

            return (
              <div
                key={idx}
                className={`min-h-[120px] p-3 ${tema.colores.card} transition-all duration-300 hover:scale-105 cursor-pointer ${
                  !esMesActual ? "opacity-30" : ""
                } ${esHoy ? `ring-2 ring-indigo-500 shadow-lg` : ""}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span
                    className={`text-sm font-bold ${
                      esHoy
                        ? `px-2 py-1 rounded-full bg-gradient-to-r ${tema.colores.gradiente} text-white`
                        : tema.colores.texto
                    }`}
                  >
                    {dia.getDate()}
                  </span>
                  {ticketsDelDia.length > 0 && (
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-bold bg-gradient-to-r ${tema.colores.gradiente} text-white shadow-lg`}
                    >
                      {ticketsDelDia.length}
                    </span>
                  )}
                </div>

                <div className="space-y-1">
                  {ticketsDelDia.slice(0, 3).map((ticket) => (
                    <div
                      key={ticket.id_ticket}
                      onClick={() => setTicketSeleccionado(ticket)}
                      className={`px-2 py-1 rounded-lg text-xs font-semibold ${tema.colores.hover} ${tema.colores.texto} truncate transition-all duration-300 hover:scale-105 cursor-pointer border-l-2 ${
                        ticket.prioridad === "critica"
                          ? "border-red-500"
                          : ticket.prioridad === "alta"
                          ? "border-orange-500"
                          : ticket.prioridad === "media"
                          ? "border-yellow-500"
                          : "border-green-500"
                      }`}
                      title={ticket.titulo}
                    >
                      {ticket.numero_ticket}
                    </div>
                  ))}
                  {ticketsDelDia.length > 3 && (
                    <div
                      className={`px-2 py-1 rounded-lg text-xs font-bold text-center ${tema.colores.hover} ${tema.colores.acento}`}
                    >
                      +{ticketsDelDia.length - 3} más
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ========================================
// COMPONENTE: PANEL DETALLE TICKET PREMIUM
// ========================================

function PanelDetalleTicket({
  ticket,
  tema,
  onClose,
  obtenerIconoTipo,
  obtenerColorEstado,
  obtenerColorPrioridad,
  formatearFecha,
  actualizarEstadoTicket,
  actualizarPrioridadTicket,
}: {
  ticket: Ticket;
  tema: ConfiguracionTema;
  onClose: () => void;
  obtenerIconoTipo: (tipo: string) => any;
  obtenerColorEstado: (estado: string) => string;
  obtenerColorPrioridad: (prioridad: string) => string;
  formatearFecha: (fecha: string) => string;
  actualizarEstadoTicket: (id: number, estado: Ticket["estado"]) => void;
  actualizarPrioridadTicket: (id: number, prioridad: Ticket["prioridad"]) => void;
}) {
  const IconoTipo = obtenerIconoTipo(ticket.tipo);

  return (
    <div className="fixed inset-0 z-[60] flex items-end md:items-center justify-center p-0 md:p-4 animate-slideDown">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <div
        className={`relative w-full md:max-w-3xl max-h-[90vh] rounded-t-3xl md:rounded-3xl ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} overflow-hidden animate-slideUp`}
      >
        {/* Header con gradiente */}
        <div className={`relative p-6 bg-gradient-to-r ${tema.colores.gradiente} text-white overflow-hidden`}>
          <div className="absolute inset-0 bg-black/20" />
          <div className="relative z-10">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-white/20 backdrop-blur-xl rounded-2xl flex items-center justify-center shadow-2xl">
                  <IconoTipo className="w-8 h-8 text-white" />
                </div>
                <div>
                  <p className="text-sm font-bold mb-1 opacity-90">
                    {ticket.numero_ticket}
                  </p>
                  <h3 className="text-2xl font-black">{ticket.titulo}</h3>
                  <p className="text-sm opacity-80 mt-1">{ticket.tipo.toUpperCase()}</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-xl bg-white/20 backdrop-blur-xl hover:bg-white/30 transition-all duration-300 hover:scale-110"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="flex flex-wrap gap-2">
              <span
                className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold bg-white/20 backdrop-blur-xl border border-white/30`}
              >
                <Activity className="w-3 h-3" />
                {ticket.estado.replace("_", " ").toUpperCase()}
              </span>
              <span
                className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold bg-white/20 backdrop-blur-xl border border-white/30`}
              >
                {ticket.prioridad === "critica" ? (
                  <Flame className="w-3 h-3 animate-pulse" />
                ) : (
                  <ZapIcon className="w-3 h-3" />
                )}
                {ticket.prioridad.toUpperCase()}
              </span>
              {ticket.calificacion && (
                <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold bg-white/20 backdrop-blur-xl border border-white/30">
                  <Star className="w-3 h-3 fill-white" />
                  {ticket.calificacion.toFixed(1)}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Contenido */}
        <div className="p-6 max-h-[calc(90vh-200px)] overflow-y-auto custom-scrollbar">
          {/* Descripción */}
          <div className="mb-6">
            <h4 className={`text-sm font-black mb-2 ${tema.colores.texto} uppercase tracking-wider flex items-center gap-2`}>
              <FileText className="w-4 h-4" />
              Descripción
            </h4>
            <p className={`text-sm ${tema.colores.textoSecundario} leading-relaxed`}>
              {ticket.descripcion}
            </p>
          </div>

          {/* Información del solicitante */}
          <div className={`mb-6 p-4 rounded-xl ${tema.colores.fondoSecundario} ${tema.colores.borde} border`}>
            <h4 className={`text-sm font-black mb-3 ${tema.colores.texto} uppercase tracking-wider flex items-center gap-2`}>
              <User className="w-4 h-4" />
              Solicitante
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <p className="text-xs font-semibold opacity-70 mb-1">Nombre</p>
                <p className={`text-sm font-bold ${tema.colores.texto}`}>
                  {ticket.solicitante.nombre_completo}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold opacity-70 mb-1">Email</p>
                <a
                  href={`mailto:${ticket.solicitante.email}`}
                  className={`text-sm font-bold ${tema.colores.acento} hover:underline`}
                >
                  {ticket.solicitante.email}
                </a>
              </div>
              {ticket.solicitante.telefono && (
                <div>
                  <p className="text-xs font-semibold opacity-70 mb-1">Teléfono</p>
                  <a
                    href={`tel:${ticket.solicitante.telefono}`}
                    className={`text-sm font-bold ${tema.colores.acento} hover:underline flex items-center gap-2`}
                  >
                    <PhoneIcon className="w-4 h-4" />
                    {ticket.solicitante.telefono}
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Información del centro y equipo */}
          <div className={`mb-6 p-4 rounded-xl ${tema.colores.fondoSecundario} ${tema.colores.borde} border`}>
            <h4 className={`text-sm font-black mb-3 ${tema.colores.texto} uppercase tracking-wider flex items-center gap-2`}>
              <Building2 className="w-4 h-4" />
              Ubicación y Equipo
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <p className="text-xs font-semibold opacity-70 mb-1">Centro</p>
                <p className={`text-sm font-bold ${tema.colores.texto}`}>
                  {ticket.centro?.nombre}
                </p>
                <p className={`text-xs ${tema.colores.textoSecundario}`}>
                  {ticket.centro?.ciudad}
                </p>
              </div>
              {ticket.departamento && (
                <div>
                  <p className="text-xs font-semibold opacity-70 mb-1">Departamento</p>
                  <p className={`text-sm font-bold ${tema.colores.texto}`}>
                    {ticket.departamento.nombre}
                  </p>
                </div>
              )}
              {ticket.equipo_afectado && (
                <>
                  <div>
                    <p className="text-xs font-semibold opacity-70 mb-1">Equipo</p>
                    <p className={`text-sm font-bold ${tema.colores.texto}`}>
                      {ticket.equipo_afectado.nombre}
                    </p>
                    <p className={`text-xs ${tema.colores.textoSecundario}`}>
                      {ticket.equipo_afectado.tipo}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold opacity-70 mb-1">Ubicación</p>
                    <p className={`text-sm font-bold ${tema.colores.texto}`}>
                      {ticket.equipo_afectado.ubicacion}
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Timeline de fechas */}
          <div className={`mb-6 p-4 rounded-xl ${tema.colores.fondoSecundario} ${tema.colores.borde} border`}>
            <h4 className={`text-sm font-black mb-3 ${tema.colores.texto} uppercase tracking-wider flex items-center gap-2`}>
              <Clock className="w-4 h-4" />
              Timeline
            </h4>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
                  <CalendarPlus className="w-4 h-4 text-blue-500" />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-semibold opacity-70">Creado</p>
                  <p className={`text-sm font-bold ${tema.colores.texto}`}>
                    {formatearFecha(ticket.fecha_creacion)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center">
                  <UserCheck className="w-4 h-4 text-indigo-500" />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-semibold opacity-70">Asignado</p>
                  <p className={`text-sm font-bold ${tema.colores.texto}`}>
                    {formatearFecha(ticket.fecha_asignacion)}
                  </p>
                </div>
              </div>
              {ticket.fecha_resolucion && (
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-semibold opacity-70">Resuelto</p>
                    <p className="text-sm font-bold text-emerald-500">
                      {formatearFecha(ticket.fecha_resolucion)}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Tiempos */}
          <div className={`mb-6 p-4 rounded-xl ${tema.colores.fondoSecundario} ${tema.colores.borde} border`}>
            <h4 className={`text-sm font-black mb-3 ${tema.colores.texto} uppercase tracking-wider flex items-center gap-2`}>
              <Timer className="w-4 h-4" />
              Tiempos de Resolución
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-semibold opacity-70 mb-1">Tiempo Estimado</p>
                <p className={`text-2xl font-black ${tema.colores.texto}`}>
                  {ticket.tiempo_estimado_minutos}
                  <span className="text-sm font-semibold ml-1">min</span>
                </p>
              </div>
              {ticket.tiempo_real_minutos && (
                <div>
                  <p className="text-xs font-semibold opacity-70 mb-1">Tiempo Real</p>
                  <p
                    className={`text-2xl font-black ${
                      ticket.tiempo_real_minutos <= ticket.tiempo_estimado_minutos
                        ? "text-emerald-500"
                        : "text-red-500"
                    }`}
                  >
                    {ticket.tiempo_real_minutos}
                    <span className="text-sm font-semibold ml-1">min</span>
                  </p>
                  {ticket.tiempo_real_minutos <= ticket.tiempo_estimado_minutos ? (
                    <div className="flex items-center gap-1 mt-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                      <span className="text-xs font-bold text-emerald-500">
                        Dentro del SLA
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 mt-1">
                      <AlertTriangle className="w-3 h-3 text-red-500" />
                      <span className="text-xs font-bold text-red-500">
                        Fuera del SLA
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Notas del técnico */}
          {ticket.notas_tecnico && (
            <div className={`mb-6 p-4 rounded-xl ${tema.colores.fondoSecundario} ${tema.colores.borde} border`}>
              <h4 className={`text-sm font-black mb-2 ${tema.colores.texto} uppercase tracking-wider flex items-center gap-2`}>
                <FileSignature className="w-4 h-4" />
                Notas del Técnico
              </h4>
              <p className={`text-sm ${tema.colores.textoSecundario} leading-relaxed`}>
                {ticket.notas_tecnico}
              </p>
            </div>
          )}

          {/* Calificación y comentario del cliente */}
          {(ticket.calificacion || ticket.comentario_cliente) && (
            <div className={`mb-6 p-4 rounded-xl bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/30`}>
              <h4 className={`text-sm font-black mb-3 ${tema.colores.texto} uppercase tracking-wider flex items-center gap-2`}>
                <Star className="w-4 h-4 text-yellow-500" />
                Evaluación del Cliente
              </h4>
              {ticket.calificacion && (
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-5 h-5 ${
                          star <= ticket.calificacion!
                            ? "text-yellow-500 fill-yellow-500"
                            : "text-gray-400"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-2xl font-black text-yellow-500">
                    {ticket.calificacion.toFixed(1)}
                  </span>
                  <span className={`text-sm font-semibold ${tema.colores.textoSecundario}`}>
                    / 5.0
                  </span>
                </div>
              )}
              {ticket.comentario_cliente && (
                <div>
                  <p className="text-xs font-semibold opacity-70 mb-1">Comentario</p>
                  <p className={`text-sm ${tema.colores.texto} italic leading-relaxed`}>
                    "{ticket.comentario_cliente}"
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Acciones de cambio de estado */}
          <div className={`mb-6 p-4 rounded-xl ${tema.colores.fondoSecundario} ${tema.colores.borde} border`}>
            <h4 className={`text-sm font-black mb-3 ${tema.colores.texto} uppercase tracking-wider flex items-center gap-2`}>
              <Settings className="w-4 h-4" />
              Cambiar Estado
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {[
                { estado: "abierto", label: "Abierto", icon: AlertCircle, color: "from-red-500 to-pink-500" },
                { estado: "en_progreso", label: "En Progreso", icon: PlayCircle, color: "from-blue-500 to-cyan-500" },
                { estado: "resuelto", label: "Resuelto", icon: CheckCircle2, color: "from-emerald-500 to-teal-500" },
                { estado: "cancelado", label: "Cancelado", icon: X, color: "from-gray-500 to-slate-500" },
              ].map((item) => (
                <button
                  key={item.estado}
                  onClick={() => {
                    actualizarEstadoTicket(ticket.id_ticket, item.estado as Ticket["estado"]);
                    onClose();
                  }}
                  disabled={ticket.estado === item.estado}
                  className={`flex flex-col items-center gap-2 p-3 rounded-xl font-bold text-sm transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed ${
                    ticket.estado === item.estado
                      ? `bg-gradient-to-r ${item.color} text-white shadow-lg`
                      : `${tema.colores.hover} ${tema.colores.texto}`
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Acciones de cambio de prioridad */}
          <div className={`mb-6 p-4 rounded-xl ${tema.colores.fondoSecundario} ${tema.colores.borde} border`}>
            <h4 className={`text-sm font-black mb-3 ${tema.colores.texto} uppercase tracking-wider flex items-center gap-2`}>
              <Flame className="w-4 h-4" />
              Cambiar Prioridad
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {[
                { prioridad: "baja", label: "Baja", icon: CheckSquare, color: "from-green-500 to-emerald-500" },
                { prioridad: "media", label: "Media", icon: AlertCircle, color: "from-yellow-500 to-orange-500" },
                { prioridad: "alta", label: "Alta", icon: AlertTriangle, color: "from-orange-500 to-red-500" },
                { prioridad: "critica", label: "Crítica", icon: Flame, color: "from-red-500 to-pink-500" },
              ].map((item) => (
                <button
                  key={item.prioridad}
                  onClick={() => {
                    actualizarPrioridadTicket(ticket.id_ticket, item.prioridad as Ticket["prioridad"]);
                  }}
                  disabled={ticket.prioridad === item.prioridad}
                  className={`flex flex-col items-center gap-2 p-3 rounded-xl font-bold text-sm transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed ${
                    ticket.prioridad === item.prioridad
                      ? `bg-gradient-to-r ${item.color} text-white shadow-lg`
                      : `${tema.colores.hover} ${tema.colores.texto}`
                  }`}
                >
                  <item.icon className={`w-5 h-5 ${item.prioridad === "critica" ? "animate-pulse" : ""}`} />
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Acciones rápidas */}
          <div className="flex flex-wrap gap-3">
            <Link
              href={`/tecnico/tickets/${ticket.id_ticket}`}
              className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold ${tema.colores.primario} text-white transition-all duration-300 hover:scale-105 shadow-lg`}
            >
              <ExternalLink className="w-5 h-5" />
              Ver Página Completa
            </Link>
            {ticket.solicitante.telefono && (
              <a
                href={`tel:${ticket.solicitante.telefono}`}
                className={`flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold ${tema.colores.secundario} ${tema.colores.texto} transition-all duration-300 hover:scale-105`}
              >
                <PhoneCall className="w-5 h-5" />
                Llamar
              </a>
            )}
            <a
              href={`mailto:${ticket.solicitante.email}`}
              className={`flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold ${tema.colores.secundario} ${tema.colores.texto} transition-all duration-300 hover:scale-105`}
            >
              <Mail className="w-5 h-5" />
              Email
            </a>
          </div>
        </div>

        {/* Footer del panel */}
        <div className={`p-4 border-t ${tema.colores.borde} bg-gradient-to-r ${tema.colores.gradiente}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-white">
              <Info className="w-4 h-4" />
              <span className="text-xs font-semibold">
                ID: {ticket.id_ticket} • Última actualización: {formatearFecha(ticket.fecha_asignacion)}
              </span>
            </div>
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl font-bold bg-white/20 backdrop-blur-xl text-white hover:bg-white/30 transition-all duration-300 hover:scale-105"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ========================================
// ESTILOS ADICIONALES Y ANIMACIONES
// ========================================

const estilosGlobalesAdicionales = `
  @keyframes slideUp {
    from {
      opacity: 0;
      transform: translateY(100px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .animate-slideUp {
    animation: slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1);
  }

  @keyframes shimmer {
    0% {
      background-position: -1000px 0;
    }
    100% {
      background-position: 1000px 0;
    }
  }

  .animate-shimmer {
    animation: shimmer 2s infinite linear;
    background: linear-gradient(
      to right,
      transparent 0%,
      rgba(255, 255, 255, 0.1) 50%,
      transparent 100%
    );
    background-size: 1000px 100%;
  }

  @keyframes gradient-shift {
    0%, 100% {
      background-position: 0% 50%;
    }
    50% {
      background-position: 100% 50%;
    }
  }

  .animate-gradient {
    background-size: 200% 200%;
    animation: gradient-shift 3s ease infinite;
  }

  @keyframes bounce-subtle {
    0%, 100% {
      transform: translateY(0);
    }
    50% {
      transform: translateY(-5px);
    }
  }

  .animate-bounce-subtle {
    animation: bounce-subtle 2s ease-in-out infinite;
  }

  @keyframes rotate-slow {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }

  .animate-rotate-slow {
    animation: rotate-slow 20s linear infinite;
  }

  @keyframes fade-in {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  .animate-fade-in {
    animation: fade-in 0.5s ease-out;
  }

  /* Scrollbar personalizada premium */
  .custom-scrollbar::-webkit-scrollbar {
    width: 10px;
    height: 10px;
  }

  .custom-scrollbar::-webkit-scrollbar-track {
    background: rgba(0, 0, 0, 0.1);
    border-radius: 10px;
  }

  .custom-scrollbar::-webkit-scrollbar-thumb {
    background: linear-gradient(180deg, #6366f1 0%, #8b5cf6 50%, #ec4899 100%);
    border-radius: 10px;
    border: 2px solid rgba(0, 0, 0, 0.1);
    transition: all 0.3s ease;
  }

  .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background: linear-gradient(180deg, #4f46e5 0%, #7c3aed 50%, #db2777 100%);
    box-shadow: 0 0 10px rgba(99, 102, 241, 0.5);
  }

  /* Efectos de hover premium */
  .hover-lift {
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .hover-lift:hover {
    transform: translateY(-4px);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
  }

  /* Efectos de glassmorphism */
  .glass-effect {
    background: rgba(255, 255, 255, 0.05);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.1);
  }

  /* Efectos de neomorphism */
  .neo-effect {
    box-shadow: 
      8px 8px 16px rgba(0, 0, 0, 0.2),
      -8px -8px 16px rgba(255, 255, 255, 0.05);
  }

  /* Gradientes animados */
  .gradient-animated {
    background: linear-gradient(
      -45deg,
      #6366f1,
      #8b5cf6,
      #ec4899,
      #f59e0b
    );
    background-size: 400% 400%;
    animation: gradient-shift 15s ease infinite;
  }

  /* Efectos de texto brillante */
  .text-glow {
    text-shadow: 
      0 0 10px rgba(99, 102, 241, 0.5),
      0 0 20px rgba(139, 92, 246, 0.3),
      0 0 30px rgba(236, 72, 153, 0.2);
  }

  /* Bordes animados */
  @keyframes border-spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }

  .border-animated::before {
    content: '';
    position: absolute;
    inset: -2px;
    background: linear-gradient(45deg, #6366f1, #8b5cf6, #ec4899, #f59e0b);
    border-radius: inherit;
    animation: border-spin 3s linear infinite;
    z-index: -1;
  }

  /* Efectos de partículas */
  @keyframes float-particles {
    0%, 100% {
      transform: translateY(0) translateX(0);
    }
    33% {
      transform: translateY(-20px) translateX(10px);
    }
    66% {
      transform: translateY(-10px) translateX(-10px);
    }
  }

  .particle-effect {
    animation: float-particles 6s ease-in-out infinite;
  }

  /* Efectos de pulso mejorado */
  @keyframes pulse-ring {
    0% {
      transform: scale(0.95);
      box-shadow: 0 0 0 0 rgba(99, 102, 241, 0.7);
    }
    70% {
      transform: scale(1);
      box-shadow: 0 0 0 10px rgba(99, 102, 241, 0);
    }
    100% {
      transform: scale(0.95);
      box-shadow: 0 0 0 0 rgba(99, 102, 241, 0);
    }
  }

  .pulse-ring {
    animation: pulse-ring 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
  }

  /* Efectos de carga skeleton */
  @keyframes skeleton-loading {
    0% {
      background-position: -200px 0;
    }
    100% {
      background-position: calc(200px + 100%) 0;
    }
  }

  .skeleton {
    background: linear-gradient(
      90deg,
      rgba(255, 255, 255, 0.05) 0px,
      rgba(255, 255, 255, 0.15) 40px,
      rgba(255, 255, 255, 0.05) 80px
    );
    background-size: 200px 100%;
    animation: skeleton-loading 1.5s infinite;
  }

  /* Transiciones suaves para todo */
  * {
    transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  }

  /* Mejoras de accesibilidad */
  @media (prefers-reduced-motion: reduce) {
    *,
    *::before,
    *::after {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
    }
  }

  /* Mejoras para modo oscuro */
  @media (prefers-color-scheme: dark) {
    .glass-effect {
      background: rgba(0, 0, 0, 0.3);
      border: 1px solid rgba(255, 255, 255, 0.1);
    }
  }

  /* Efectos de hover para botones */
  .btn-premium {
    position: relative;
    overflow: hidden;
    isolation: isolate;
  }

  .btn-premium::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(
      45deg,
      transparent,
      rgba(255, 255, 255, 0.1),
      transparent
    );
    transform: translateX(-100%);
    transition: transform 0.6s;
  }

  .btn-premium:hover::before {
    transform: translateX(100%);
  }

  /* Efectos de badge */
  .badge-premium {
    position: relative;
    overflow: hidden;
  }

  .badge-premium::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 0;
    height: 0;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.3);
    transform: translate(-50%, -50%);
    transition: width 0.6s, height 0.6s;
  }

  .badge-premium:hover::after {
    width: 300px;
    height: 300px;
  }

  /* Efectos de card premium */
  .card-premium {
    position: relative;
    transform-style: preserve-3d;
    transition: transform 0.6s;
  }

  .card-premium:hover {
    transform: rotateY(5deg) rotateX(5deg);
  }

  .card-premium::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(
      135deg,
      rgba(99, 102, 241, 0.1) 0%,
      transparent 50%,
      rgba(236, 72, 153, 0.1) 100%
    );
    opacity: 0;
    transition: opacity 0.3s;
    pointer-events: none;
  }

  .card-premium:hover::before {
    opacity: 1;
  }

  /* Efectos de tooltip premium */
  .tooltip-premium {
    position: relative;
  }

  .tooltip-premium::after {
    content: attr(data-tooltip);
    position: absolute;
    bottom: 100%;
    left: 50%;
    transform: translateX(-50%) translateY(-8px);
    padding: 8px 12px;
    background: rgba(0, 0, 0, 0.9);
    color: white;
    font-size: 12px;
    font-weight: 600;
    border-radius: 8px;
    white-space: nowrap;
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.3s, transform 0.3s;
  }

  .tooltip-premium:hover::after {
    opacity: 1;
    transform: translateX(-50%) translateY(-4px);
  }

  /* Efectos de input premium */
  .input-premium {
    position: relative;
  }

  .input-premium input:focus {
    box-shadow: 
      0 0 0 3px rgba(99, 102, 241, 0.1),
      0 0 20px rgba(99, 102, 241, 0.2);
  }

  /* Efectos de tabla premium */
  .table-premium tbody tr {
    transition: all 0.3s ease;
  }

  .table-premium tbody tr:hover {
    background: linear-gradient(
      90deg,
      transparent,
      rgba(99, 102, 241, 0.05),
      transparent
    );
    transform: scale(1.01);
  }

  /* Efectos de timeline premium */
  .timeline-premium::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 2px;
    background: linear-gradient(
      180deg,
      #6366f1 0%,
      #8b5cf6 50%,
      #ec4899 100%
    );
    box-shadow: 0 0 10px rgba(99, 102, 241, 0.5);
  }

  /* Efectos de modal premium */
  .modal-premium {
    animation: modal-appear 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  }

  @keyframes modal-appear {
    from {
      opacity: 0;
      transform: scale(0.95) translateY(20px);
    }
    to {
      opacity: 1;
      transform: scale(1) translateY(0);
    }
  }

  /* Efectos de notificación premium */
  @keyframes notification-slide {
    from {
      transform: translateX(400px);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }

  .notification-premium {
    animation: notification-slide 0.4s cubic-bezier(0.16, 1, 0.3, 1);
  }

  /* Efectos de progreso premium */
  @keyframes progress-indeterminate {
    0% {
      transform: translateX(-100%);
    }
    100% {
      transform: translateX(400%);
    }
  }

  .progress-indeterminate::after {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(
      90deg,
      transparent,
      rgba(255, 255, 255, 0.3),
      transparent
    );
    animation: progress-indeterminate 1.5s infinite;
  }

  /* Mejoras de rendimiento */
  .gpu-accelerated {
    transform: translateZ(0);
    will-change: transform;
  }

  /* Efectos de focus premium */
  *:focus-visible {
    outline: 2px solid #6366f1;
    outline-offset: 2px;
    border-radius: 4px;
  }

  /* Efectos de selección premium */
  ::selection {
    background: rgba(99, 102, 241, 0.3);
    color: white;
  }

  /* Efectos de placeholder premium */
  ::placeholder {
    color: rgba(156, 163, 175, 0.5);
    font-weight: 500;
  }

  /* Efectos de autofill premium */
  input:-webkit-autofill {
    -webkit-box-shadow: 0 0 0 1000px rgba(99, 102, 241, 0.1) inset;
    -webkit-text-fill-color: currentColor;
  }
`;

// Exportar el componente principal
//export default TicketDetalleModal;

