"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import SidebarTecnico from "@/components/tecnico/SidebarTecnico";

import { History } from "lucide-react";

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
} from "lucide-react";

// ========================================
// TIPOS DE DATOS
// ========================================

type TemaColor = "light" | "dark" | "blue" | "purple" | "green";

type RangoRapido = "7d" | "30d" | "90d" | "year" | "todo";

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
    nombre: "Azul Técnico",
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
    nombre: "Púrpura Industrial",
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
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [alertas, setAlertas] = useState<AlertaTecnico[]>([]);

  const [temaActual, setTemaActual] = useState<TemaColor>("blue");
  const [sidebarAbierto, setSidebarAbierto] = useState(true);
  const [notificacionesAbiertas, setNotificacionesAbiertas] = useState(false);
  const [perfilAbierto, setPerfilAbierto] = useState(false);

  const [busqueda, setBusqueda] = useState("");
  const [seccionActiva] = useState("tickets");

  const [filtroEstado, setFiltroEstado] = useState<string>("todos");
  const [filtroPrioridad, setFiltroPrioridad] = useState<string>("todas");
  const [filtroTipo, setFiltroTipo] = useState<string>("todos");
  const [filtroCentro, setFiltroCentro] = useState<string>("todos");

  const [disponibilidad, setDisponibilidad] = useState<
    "disponible" | "ocupado" | "fuera_servicio"
  >("disponible");

  const [ticketSeleccionado, setTicketSeleccionado] = useState<Ticket | null>(null);

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
  // MENÚ DE NAVEGACIÓN
  // ========================================

  

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
        alert(`Estado actualizado a: ${nuevoEstado}`);
      } else {
        alert("Error al actualizar disponibilidad");
      }
    } catch (error) {
      console.error("Error al cambiar disponibilidad:", error);
      alert("Error al actualizar disponibilidad");
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
      } else {
        alert("Error al actualizar estado del ticket");
      }
    } catch (error) {
      console.error("Error al actualizar estado del ticket:", error);
      alert("Error al actualizar estado del ticket");
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
      } else {
        alert("Error al actualizar prioridad");
      }
    } catch (error) {
      console.error("Error al actualizar prioridad", error);
      alert("Error al actualizar prioridad");
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
        alert("No se pudo exportar el historial. Intenta nuevamente.");
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
    } catch (error) {
      console.error("Error al exportar historial:", error);
      alert("Error al exportar historial");
    } finally {
      setExportando(null);
    }
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
              <FileText className="w-10 h-10 text-white" />
            </div>
          </div>
          <h2 className={`text-4xl font-black mb-4 ${tema.colores.texto}`}>
            Cargando Historial de Tickets
          </h2>
          <p
            className={`text-lg font-semibold ${tema.colores.textoSecundario} animate-pulse`}
          >
            Preparando tu histórico completo de incidencias...
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
            <AlertTriangle className="w-12 h-12 text-white" />
          </div>
          <h2 className={`text-3xl font-black mb-4 ${tema.colores.texto}`}>
            Acceso No Autorizado
          </h2>
          <p className={`text-lg mb-8 ${tema.colores.textoSecundario}`}>
            No tienes permisos para acceder al historial de tickets técnicos.
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
         <SidebarTecnico
        usuario={usuario}
        tema={tema}
        sidebarAbierto={sidebarAbierto}
        setSidebarAbierto={setSidebarAbierto}
        estadisticas={estadisticas}
      />

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
                placeholder="Buscar en el historial por número, título, centro o solicitante..."
                value={busqueda}
                onChange={(e) => {
                  setBusqueda(e.target.value);
                }}
                className={`w-full pl-12 pr-4 py-3 rounded-xl ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto} placeholder:${tema.colores.textoSecundario} focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all duration-300`}
              />
              {busqueda && (
                <button
                  onClick={() => {
                    setBusqueda("");
                  }}
                  className={`absolute right-4 top-1/2 transform -translate-y-1/2 p-1 rounded-lg ${tema.colores.hover}`}
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Acciones header */}
          <div className="flex items-center gap-3 ml-6">
            {/* Temas */}
            <div className="relative group">
              <button
                className={`p-3 rounded-xl font-semibold transition-all duration-300 ${tema.colores.secundario} ${tema.colores.texto}`}
              >
                <Sparkles className="w-5 h-5" />
              </button>

              <div
                className={`absolute right-0 mt-2 w-64 rounded-2xl ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 p-4 space-y-2 z-50`}
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

            {/* Alertas */}
            <div className="relative">
              <button
                onClick={() => setNotificacionesAbiertas(!notificacionesAbiertas)}
                className={`relative p-3 rounded-xl font-semibold transition-all duration-300 ${tema.colores.secundario} ${tema.colores.texto}`}
              >
                <AlertCircle className="w-5 h-5" />
                {alertas.filter((a) => !a.leida).length > 0 && (
                  <span className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center animate-pulse">
                    {alertas.filter((a) => !a.leida).length > 9
                      ? "9+"
                      : alertas.filter((a) => !a.leida).length}
                  </span>
                )}
              </button>

              {notificacionesAbiertas && (
                <div
                  className={`absolute right-0 mt-2 w-96 rounded-2xl ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} max-h-96 overflow-y-auto z-50`}
                >
                  <div
                    className={`p-4 border-b ${tema.colores.borde} sticky top-0 ${tema.colores.card}`}
                  >
                    <h3
                      className={`text-lg font-black ${tema.colores.texto}`}
                    >
                      Alertas Activas
                    </h3>
                  </div>

                  {alertas.length === 0 ? (
                    <div className="p-8 text-center">
                      <BellOff
                        className={`w-12 h-12 mx-auto mb-3 ${tema.colores.textoSecundario}`}
                      />
                      <p
                        className={`text-sm ${tema.colores.textoSecundario}`}
                      >
                        No tienes alertas activas
                      </p>
                    </div>
                  ) : (
                    <div className={`divide-y ${tema.colores.borde}`}>
                      {alertas.slice(0, 5).map((alerta) => (
                        <div
                          key={alerta.id_alerta}
                          className={`p-4 ${tema.colores.hover} transition-colors cursor-pointer ${
                            !alerta.leida ? "bg-indigo-500/5" : ""
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div
                              className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${obtenerColorPrioridad(
                                alerta.prioridad
                              )}`}
                            >
                              <AlertCircleIcon className="w-5 h-5" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p
                                className={`text-sm font-bold mb-1 ${tema.colores.texto}`}
                              >
                                {alerta.titulo}
                              </p>
                              <p
                                className={`text-xs mb-2 ${tema.colores.textoSecundario}`}
                              >
                                {alerta.descripcion}
                              </p>
                              <p
                                className={`text-xs font-medium ${tema.colores.textoSecundario}`}
                              >
                                {alerta?.fecha_creacion
                                  ? formatearFecha(alerta.fecha_creacion)
                                  : "Sin fecha"}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Disponibilidad */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => cambiarDisponibilidad("disponible")}
                className={`px-4 py-2 rounded-xl font-semibold text-sm transition-all duration-300 ${
                  disponibilidad === "disponible"
                    ? "bg-green-600 text-white"
                    : `${tema.colores.secundario} ${tema.colores.texto}`
                }`}
              >
                ✓ Disponible
              </button>
              <button
                onClick={() => cambiarDisponibilidad("ocupado")}
                className={`px-4 py-2 rounded-xl font-semibold text-sm transition-all duration-300 ${
                  disponibilidad === "ocupado"
                    ? "bg-yellow-600 text-white"
                    : `${tema.colores.secundario} ${tema.colores.texto}`
                }`}
              >
                ⏳ Ocupado
              </button>
              <button
                onClick={() => cambiarDisponibilidad("fuera_servicio")}
                className={`px-4 py-2 rounded-xl font-semibold text-sm transition-all duration-300 ${
                  disponibilidad === "fuera_servicio"
                    ? "bg-red-600 text-white"
                    : `${tema.colores.secundario} ${tema.colores.texto}`
                }`}
              >
                ✕ Fuera Servicio
              </button>
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
                    Técnico
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
                  className={`absolute right-0 mt-2 w-80 rounded-2xl ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} p-4 z-50`}
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
                        {usuario.tecnico?.tipo_tecnico}
                      </p>
                      <p
                        className={`text-xs font-medium ${tema.colores.textoSecundario}`}
                      >
                        {usuario.tecnico?.centro?.nombre ?? "Sin centro asignado"}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Link
                      href="/tecnico/perfil"
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all duration-300 ${tema.colores.hover} ${tema.colores.texto}`}
                    >
                      <User className="w-5 h-5" />
                      <span>Mi Perfil</span>
                    </Link>
                    <Link
                      href="/tecnico/configuracion"
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all duration-300 ${tema.colores.hover} ${tema.colores.texto}`}
                    >
                      <Settings className="w-5 h-5" />
                      <span>Configuración</span>
                    </Link>
                    <Link
                      href="/tecnico/ayuda"
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

      {/* MAIN */}
      <main
        className={`transition-all duration-300 ${
          sidebarAbierto ? "ml-72" : "ml-20"
        } pt-24 p-8`}
      >
        {/* Encabezado de página */}
        <div className="mb-8 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h2
              className={`text-4xl lg:text-5xl font-black mb-2 ${tema.colores.texto} flex items-center gap-3`}
            >
              {obtenerSaludo()}, {usuario.nombre}
              <span className="animate-wave inline-block">📚</span>
            </h2>
            <p
              className={`text-lg font-semibold ${tema.colores.textoSecundario}`}
            >
              Historial completo de tus tickets técnicos, con trazabilidad total.
            </p>
            <p
              className={`text-sm font-semibold mt-2 ${tema.colores.textoSecundario} flex items-center gap-2`}
            >
              <CalendarClock className="w-4 h-4" />
              Rango actual:{" "}
              <span className={tema.colores.texto}>
                {formatearFechaSoloDia(fechaDesde)} –{" "}
                {formatearFechaSoloDia(fechaHasta)}
              </span>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => cargarHistorialTickets()}
              className={`flex items-center gap-2 px-5 py-3 ${tema.colores.secundario} rounded-xl font-semibold text-sm ${tema.colores.texto} transition-all duration-300 hover:scale-105`}
            >
              <RefreshCw
                className={`w-4 h-4 ${loadingData ? "animate-spin" : ""}`}
              />
              Actualizar
            </button>
            <button
              onClick={() => exportarHistorial("excel")}
              className={`flex items-center gap-2 px-5 py-3 ${tema.colores.secundario} rounded-xl font-semibold text-sm ${tema.colores.texto} transition-all duration-300 hover:scale-105`}
              disabled={exportando === "excel"}
            >
              <FileSpreadsheet className="w-4 h-4" />
              {exportando === "excel" ? "Exportando..." : "Exportar Excel"}
            </button>
            <button
              onClick={() => exportarHistorial("pdf")}
              className={`flex items-center gap-2 px-5 py-3 ${tema.colores.primario} text-white rounded-xl font-bold text-sm transition-all duration-300 hover:scale-105 ${tema.colores.sombra}`}
              disabled={exportando === "pdf"}
            >
              <Printer className="w-4 h-4" />
              {exportando === "pdf" ? "Generando PDF..." : "Exportar PDF"}
            </button>
          </div>
        </div>

        {/* Resumen rápido */}
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-6 mb-8">
          <ResumenCard
            tema={tema}
            icono={ClipboardList}
            titulo="Tickets en rango"
            valor={resumenHistorial.total}
            chip="Historial filtrado"
            color="from-indigo-500 to-purple-500"
          />
          <ResumenCard
            tema={tema}
            icono={CheckCircle2}
            titulo="Resueltos"
            valor={resumenHistorial.resueltos}
            chip="Cerrados correctamente"
            color="from-emerald-500 to-teal-500"
          />
          <ResumenCard
            tema={tema}
            icono={AlertOctagon}
            titulo="Cancelados"
            valor={resumenHistorial.cancelados}
            chip="Incidentes anulados"
            color="from-slate-500 to-slate-700"
          />
          <ResumenCard
            tema={tema}
            icono={Clock3}
            titulo="Promedio resolución (min)"
            valor={resumenHistorial.promedioResolucion}
            chip="Tiempo real"
            color="from-blue-500 to-cyan-500"
          />
          <ResumenCard
            tema={tema}
            icono={Target}
            titulo="Cumplimiento SLA (%)"
            valor={resumenHistorial.dentroSla}
            chip="Dentro del objetivo"
            color="from-emerald-500 to-lime-500"
          />
          <ResumenCard
            tema={tema}
            icono={Flame}
            titulo="Pendientes"
            valor={resumenHistorial.abiertos + resumenHistorial.en_progreso}
            chip="Aún abiertos"
            color="from-orange-500 to-red-500"
          />
        </div>

        {/* Filtros avanzados + rango */}
        <div
          className={`rounded-2xl p-5 mb-6 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra}`}
        >
          <div className="flex flex-col lg:flex-row gap-4 lg:items-center lg:justify-between">
            {/* Rango rápido */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2">
                <CalendarRange className={`w-4 h-4 ${tema.colores.acento}`} />
                <span
                  className={`text-sm font-semibold ${tema.colores.textoSecundario}`}
                >
                  Rango rápido
                </span>
              </div>
              {[
                { id: "7d", label: "Últimos 7 días" },
                { id: "30d", label: "Últimos 30 días" },
                { id: "90d", label: "Últimos 90 días" },
                { id: "year", label: "Año actual" },
                { id: "todo", label: "Todo el historial" },
              ].map((r) => (
                <button
                  key={r.id}
                  onClick={() => cambiarRangoRapido(r.id as RangoRapido)}
                  className={`px-3 py-2 rounded-xl text-xs md:text-sm font-semibold border transition-all duration-300 ${
                    rangoRapido === r.id
                      ? `bg-gradient-to-r ${tema.colores.gradiente} text-white border-transparent`
                      : `${tema.colores.hover} ${tema.colores.textoSecundario} ${tema.colores.borde}`
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>

            {/* Rango exacto */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2">
                <span
                  className={`text-xs md:text-sm font-semibold ${tema.colores.textoSecundario}`}
                >
                  Desde
                </span>
                <input
                  type="date"
                  value={fechaDesde}
                  onChange={(e) => setFechaDesde(e.target.value)}
                  className={`px-3 py-2 rounded-xl text-xs md:text-sm ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto}`}
                />
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={`text-xs md:text-sm font-semibold ${tema.colores.textoSecundario}`}
                >
                  Hasta
                </span>
                <input
                  type="date"
                  value={fechaHasta}
                  onChange={(e) => setFechaHasta(e.target.value)}
                  className={`px-3 py-2 rounded-xl text-xs md:text-sm ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto}`}
                />
              </div>
              <button
                onClick={() => cargarHistorialTickets()}
                className={`px-4 py-2 rounded-xl text-xs md:text-sm font-semibold ${tema.colores.primario} text-white`}
              >
                Aplicar rango
              </button>
            </div>
          </div>

          {/* Línea divisoria */}
          <div className={`mt-4 pt-4 border-t ${tema.colores.borde}`}></div>

          {/* Filtros por estado/tipo/etc */}
          <div className="flex flex-col lg:flex-row gap-4 lg:items-center lg:justify-between mt-2">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2">
                <Filter className={`w-4 h-4 ${tema.colores.acento}`} />
                <span
                  className={`text-sm font-semibold ${tema.colores.textoSecundario}`}
                >
                  Filtros
                </span>
              </div>

              <select
                value={filtroEstado}
                onChange={(e) => setFiltroEstado(e.target.value)}
                className={`px-3 py-2 rounded-xl text-xs md:text-sm ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto}`}
              >
                <option value="todos">Todos los estados</option>
                <option value="abierto">Abiertos</option>
                <option value="en_progreso">En progreso</option>
                <option value="resuelto">Resueltos</option>
                <option value="cancelado">Cancelados</option>
              </select>

              <select
                value={filtroPrioridad}
                onChange={(e) => setFiltroPrioridad(e.target.value)}
                className={`px-3 py-2 rounded-xl text-xs md:text-sm ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto}`}
              >
                <option value="todas">Todas las prioridades</option>
                <option value="critica">Crítica</option>
                <option value="alta">Alta</option>
                <option value="media">Media</option>
                <option value="baja">Baja</option>
              </select>

              <select
                value={filtroTipo}
                onChange={(e) => setFiltroTipo(e.target.value)}
                className={`px-3 py-2 rounded-xl text-xs md:text-sm ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto}`}
              >
                <option value="todos">Todos los tipos</option>
                {tiposDisponibles.map((tipo) => (
                  <option key={tipo} value={tipo}>
                    {tipo.toUpperCase()}
                  </option>
                ))}
              </select>

              <select
                value={filtroCentro}
                onChange={(e) => setFiltroCentro(e.target.value)}
                className={`px-3 py-2 rounded-xl text-xs md:text-sm ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto}`}
              >
                <option value="todos">Todos los centros</option>
                {centrosDisponibles.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>

              <button
                onClick={() => {
                  setFiltroEstado("todos");
                  setFiltroPrioridad("todas");
                  setFiltroTipo("todos");
                  setFiltroCentro("todos");
                }}
                className={`px-3 py-2 rounded-xl font-semibold text-xs md:text-sm ${tema.colores.hover} ${tema.colores.texto}`}
              >
                Limpiar filtros
              </button>
            </div>

            <div className="flex items-center gap-3 text-xs md:text-sm">
              <span className={tema.colores.textoSecundario}>
                {ticketsFiltrados.length} tickets en el historial filtrado
              </span>
            </div>
          </div>
        </div>

        {/* Contenido principal: Timeline histórico */}
        {loadingData ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <Loader2 className="w-16 h-16 animate-spin text-indigo-500 mx-auto mb-4" />
              <p
                className={`text-lg font-semibold ${tema.colores.textoSecundario}`}
              >
                Cargando historial de tickets...
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
            <p className={tema.colores.textoSecundario}>
              Ajusta el rango de fechas o los filtros para visualizar el historial
              completo de tus incidencias.
            </p>
          </div>
        ) : (
          <div
            className={`rounded-2xl p-4 md:p-6 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra}`}
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-xl bg-gradient-to-br ${tema.colores.gradiente} flex items-center justify-center text-white`}
                >
                  <History className="w-5 h-5" />
                </div>
                <div>
                  <h3
                    className={`text-xl font-black ${tema.colores.texto}`}
                  >
                    Línea de tiempo de tickets
                  </h3>
                  <p
                    className={`text-xs md:text-sm font-semibold ${tema.colores.textoSecundario}`}
                  >
                    Visualiza la evolución cronológica de tus incidencias por día y
                    por estado.
                  </p>
                </div>
              </div>
            </div>

            {/* Timeline */}
            <div className="relative pl-4 md:pl-6">
              {/* Línea vertical */}
              <div className="absolute left-2 md:left-3 top-0 bottom-0 w-[2px] bg-gradient-to-b from-indigo-500/60 via-indigo-400/40 to-transparent pointer-events-none" />

              <div className="space-y-6">
                {historialAgrupado.map((grupo) => (
                  <div key={grupo.fecha} className="relative">
                    {/* Punto grande del día */}
                    <div className="flex items-center gap-3 mb-3">
                      <div className="relative">
                        <div className="w-4 h-4 rounded-full bg-indigo-500 shadow-lg shadow-indigo-500/40" />
                        <div className="w-7 h-7 rounded-full border border-indigo-400/60 absolute -top-1.5 -left-1.5 opacity-60" />
                      </div>
                      <div>
                        <h4
                          className={`text-sm md:text-base font-black ${tema.colores.texto}`}
                        >
                          {grupo.label}
                        </h4>
                        <p
                          className={`text-[11px] md:text-xs ${tema.colores.textoSecundario}`}
                        >
                          {grupo.tickets.length} ticket
                          {grupo.tickets.length !== 1 ? "s" : ""} en este día
                        </p>
                      </div>
                    </div>

                    {/* Tickets del día */}
                    <div className="space-y-3 md:space-y-4 ml-4 md:ml-6">
                      {grupo.tickets.map((ticket) => (
                        <div
                          key={ticket.id_ticket}
                          className="relative"
                        >
                          {/* Punto del ticket */}
                          <div className="absolute -left-4 md:-left-5 top-5 w-3 h-3 rounded-full bg-indigo-400 shadow-md shadow-indigo-400/40" />

                          <div
                            className={`rounded-2xl p-3 md:p-4 ${tema.colores.card} ${tema.colores.borde} border transition-all duration-300 hover:scale-[1.01] hover:-translate-y-0.5 cursor-pointer`}
                            onClick={() => setTicketSeleccionado(ticket)}
                          >
                            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
                              <div className="flex items-start gap-3">
                                <div
                                  className={`w-9 h-9 rounded-xl bg-gradient-to-br ${tema.colores.gradiente} flex items-center justify-center text-white flex-shrink-0`}
                                >
                                  {(() => {
                                    const Icono = obtenerIconoTipo(ticket.tipo);
                                    return <Icono className="w-4 h-4" />;
                                  })()}
                                </div>
                                <div className="min-w-0">
                                  <p
                                    className={`text-xs md:text-sm font-bold ${tema.colores.texto}`}
                                  >
                                    {ticket.numero_ticket} — {ticket.titulo}
                                  </p>
                                  <p
                                    className={`text-[11px] md:text-xs mt-1 ${tema.colores.textoSecundario} line-clamp-2`}
                                  >
                                    {ticket.descripcion}
                                  </p>

                                  <div className="mt-2 flex flex-wrap items-center gap-2 text-[10px] md:text-[11px]">
                                    <span
                                      className={`inline-flex items-center gap-1 px-2 py-1 rounded-full font-bold border ${obtenerColorEstado(
                                        ticket.estado
                                      )}`}
                                    >
                                      <Activity className="w-3 h-3" />
                                      {ticket.estado}
                                    </span>
                                    <span
                                      className={`inline-flex items-center gap-1 px-2 py-1 rounded-full font-bold border ${obtenerColorPrioridad(
                                        ticket.prioridad
                                      )}`}
                                    >
                                      {ticket.prioridad === "critica" ? (
                                        <Flame className="w-3 h-3" />
                                      ) : (
                                        <ZapIcon className="w-3 h-3" />
                                      )}
                                      {ticket.prioridad}
                                    </span>
                                    <span
                                      className={`inline-flex items-center gap-1 px-2 py-1 rounded-full font-semibold ${tema.colores.hover}`}
                                    >
                                      <MapPinIcon className="w-3 h-3" />
                                      {ticket.centro?.nombre ?? "Sin centro"}
                                    </span>
                                  </div>
                                </div>
                              </div>

                              <div className="text-[10px] md:text-[11px] flex flex-col items-start md:items-end gap-1 md:min-w-[170px]">
                                <div className="flex flex-col items-start md:items-end gap-0.5">
                                  <span className={tema.colores.textoSecundario}>
                                    Creado:{" "}
                                    <span className={tema.colores.texto}>
                                      {formatearFecha(ticket.fecha_creacion)}
                                    </span>
                                  </span>
                                  {ticket.fecha_asignacion && (
                                    <span className={tema.colores.textoSecundario}>
                                      Asignado:{" "}
                                      <span className={tema.colores.texto}>
                                        {formatearFecha(ticket.fecha_asignacion)}
                                      </span>
                                    </span>
                                  )}
                                  {ticket.fecha_resolucion && (
                                    <span className={tema.colores.textoSecundario}>
                                      Resuelto:{" "}
                                      <span className={tema.colores.texto}>
                                        {formatearFecha(ticket.fecha_resolucion)}
                                      </span>
                                    </span>
                                  )}
                                </div>

                                <div className="mt-1 flex flex-wrap items-center gap-1">
                                  <span
                                    className={`${tema.colores.textoSecundario} font-semibold`}
                                  >
                                    Estimado:{" "}
                                    <span className={tema.colores.texto}>
                                      {ticket.tiempo_estimado_minutos} min
                                    </span>
                                  </span>
                                  {ticket.tiempo_real_minutos !== null && (
                                    <span
                                      className={`${tema.colores.textoSecundario} font-semibold`}
                                    >
                                      • Real:{" "}
                                      <span className={tema.colores.texto}>
                                        {ticket.tiempo_real_minutos} min
                                      </span>
                                    </span>
                                  )}
                                </div>

                                <div className="mt-2 flex flex-wrap items-center gap-2">
                                  {ticket.solicitante.telefono && (
                                    <a
                                      href={`tel:${ticket.solicitante.telefono}`}
                                      onClick={(e) => e.stopPropagation()}
                                      className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg ${tema.colores.hover} ${tema.colores.texto}`}
                                    >
                                      <PhoneIcon className="w-3 h-3" />
                                      Llamar
                                    </a>
                                  )}
                                  <Link
                                    href={`/tecnico/tickets/${ticket.id_ticket}`}
                                    onClick={(e) => e.stopPropagation()}
                                    className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg ${tema.colores.primario} text-white text-[10px] md:text-[11px] font-semibold`}
                                  >
                                    <Eye className="w-3 h-3" />
                                    Ver detalle
                                  </Link>
                                </div>

                                <div className="mt-2 flex flex-wrap gap-1 text-[10px]">
                                  {ticket.estado !== "abierto" && (
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        actualizarEstadoTicket(ticket.id_ticket, "abierto");
                                      }}
                                      className="px-2 py-1 rounded-lg bg-gray-700/40 text-white"
                                    >
                                      ⇠ Abierto
                                    </button>
                                  )}
                                  {ticket.estado !== "en_progreso" && (
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        actualizarEstadoTicket(
                                          ticket.id_ticket,
                                          "en_progreso"
                                        );
                                      }}
                                      className="px-2 py-1 rounded-lg bg-blue-600/80 text-white"
                                    >
                                      ▶ En progreso
                                    </button>
                                  )}
                                  {ticket.estado !== "resuelto" && (
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        actualizarEstadoTicket(
                                          ticket.id_ticket,
                                          "resuelto"
                                        );
                                      }}
                                      className="px-2 py-1 rounded-lg bg-emerald-600/90 text-white"
                                    >
                                      ✓ Resuelto
                                    </button>
                                  )}
                                  {ticket.estado !== "cancelado" && (
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        actualizarEstadoTicket(
                                          ticket.id_ticket,
                                          "cancelado"
                                        );
                                      }}
                                      className="px-2 py-1 rounded-lg bg-gray-500/80 text-white"
                                    >
                                      ✕ Cancelar
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* FOOTER */}
        <footer
          className={`transition-all duration-300 mt-10 rounded-2xl px-6 py-4 ${tema.colores.card} ${tema.colores.borde} border`}
        >
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs md:text-sm">
            <div className="flex items-center gap-2">
              <p className={tema.colores.textoSecundario}>
                © 2025 AnyssaMed - Historial de Tickets Técnicos.
              </p>
              <span
                className={`px-3 py-1 rounded-full text-[10px] font-bold bg-gradient-to-r ${tema.colores.gradiente} text-white`}
              >
                v4.0.0
              </span>
            </div>
            <div className="flex items-center gap-4">
              <Link
                href="/ayuda"
                className={`text-xs md:text-sm font-bold transition-colors ${tema.colores.textoSecundario} hover:${tema.colores.acento}`}
              >
                Ayuda
              </Link>
              <Link
                href="/privacidad"
                className={`text-xs md:text-sm font-bold transition-colors ${tema.colores.textoSecundario} hover:${tema.colores.acento}`}
              >
                Privacidad
              </Link>
              <Link
                href="/terminos"
                className={`text-xs md:text-sm font-bold transition-colors ${tema.colores.textoSecundario} hover:${tema.colores.acento}`}
              >
                Términos
              </Link>
              <button
                onClick={cerrarSesion}
                className={`text-xs md:text-sm font-bold transition-colors ${tema.colores.textoSecundario} hover:text-red-400 flex items-center gap-1`}
              >
                <LogOut className="w-4 h-4" />
                Cerrar Sesión
              </button>
            </div>
          </div>
        </footer>
      </main>

      {/* PANEL DETALLE TICKET */}
      {ticketSeleccionado && (
        <div className="fixed inset-0 z-[55] flex justify-end">
          <div
            className="flex-1 bg-black/40"
            onClick={() => setTicketSeleccionado(null)}
          />
          <div
            className={`w-full max-w-md md:max-w-xl h-full ${tema.colores.card} ${tema.colores.borde} border-l ${tema.colores.sombra} p-5 md:p-6 overflow-y-auto custom-scrollbar`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-xl bg-gradient-to-br ${tema.colores.gradiente} flex items-center justify-center text-white`}
                >
                  {(() => {
                    const Icono = obtenerIconoTipo(ticketSeleccionado.tipo);
                    return <Icono className="w-5 h-5" />;
                  })()}
                </div>
                <div>
                  <p
                    className={`text-xs font-semibold ${tema.colores.textoSecundario}`}
                  >
                    {ticketSeleccionado.numero_ticket}
                  </p>
                  <h3
                    className={`text-lg font-black ${tema.colores.texto}`}
                  >
                    {ticketSeleccionado.titulo}
                  </h3>
                </div>
              </div>
              <button
                onClick={() => setTicketSeleccionado(null)}
                className="p-1 rounded-lg hover:bg-black/10"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 mb-4">
              <div>
                <p className="text-[11px] font-semibold uppercase opacity-70">
                  Estado
                </p>
                <div className="mt-1 flex flex-wrap gap-1">
                  <span
                    className={`px-3 py-1 rounded-full text-[11px] font-bold border ${obtenerColorEstado(
                      ticketSeleccionado.estado
                    )}`}
                  >
                    {ticketSeleccionado.estado}
                  </span>
                </div>
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase opacity-70">
                  Prioridad
                </p>
                <div className="mt-1 flex flex-wrap gap-1">
                  <span
                    className={`px-3 py-1 rounded-full text-[11px] font-bold border ${obtenerColorPrioridad(
                      ticketSeleccionado.prioridad
                    )}`}
                  >
                    {ticketSeleccionado.prioridad}
                  </span>
                </div>
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase opacity-70">
                  Tipo
                </p>
                <p className={`text-xs font-semibold ${tema.colores.texto}`}>
                  {ticketSeleccionado.tipo.toUpperCase()}
                </p>
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase opacity-70">
                  Centro
                </p>
                <p className={`text-xs font-semibold ${tema.colores.texto}`}>
                  {ticketSeleccionado.centro?.nombre}
                </p>
              </div>
            </div>

            <div className="mb-4">
              <p className="text-[11px] font-semibold uppercase opacity-70">
                Descripción
              </p>
              <p className={`mt-1 text-xs ${tema.colores.textoSecundario}`}>
                {ticketSeleccionado.descripcion}
              </p>
            </div>

            {ticketSeleccionado.equipo_afectado && (
              <div className="mb-4">
                <p className="text-[11px] font-semibold uppercase opacity-70">
                  Equipo afectado
                </p>
                <p className={`mt-1 text-xs ${tema.colores.texto}`}>
                  {ticketSeleccionado.equipo_afectado.nombre} (
                  {ticketSeleccionado.equipo_afectado.tipo}) —{" "}
                  {ticketSeleccionado.equipo_afectado.ubicacion}
                </p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-2 mb-4 text-[11px]">
              <div>
                <p className="font-semibold uppercase opacity-70">
                  Solicitante
                </p>
                <p className={tema.colores.texto}>
                  {ticketSeleccionado.solicitante.nombre_completo}
                </p>
                <p className={tema.colores.textoSecundario}>
                  {ticketSeleccionado.solicitante.email}
                </p>
                {ticketSeleccionado.solicitante.telefono && (
                  <a
                    href={`tel:${ticketSeleccionado.solicitante.telefono}`}
                    className={`inline-flex items-center gap-1 mt-1 text-[11px] ${tema.colores.acento}`}
                  >
                    <PhoneIcon className="w-3 h-3" />
                    {ticketSeleccionado.solicitante.telefono}
                  </a>
                )}
              </div>
              <div>
                <p className="font-semibold uppercase opacity-70">
                  Tiempos
                </p>
                <p className={tema.colores.textoSecundario}>
                  Creado: {formatearFecha(ticketSeleccionado.fecha_creacion)}
                </p>
                <p className={tema.colores.textoSecundario}>
                  Asignado: {formatearFecha(ticketSeleccionado.fecha_asignacion)}
                </p>
                {ticketSeleccionado.fecha_resolucion && (
                  <p className={tema.colores.textoSecundario}>
                    Resuelto: {formatearFecha(ticketSeleccionado.fecha_resolucion)}
                  </p>
                )}
                <p className={tema.colores.textoSecundario}>
                  Estimado: {ticketSeleccionado.tiempo_estimado_minutos} min
                </p>
                {ticketSeleccionado.tiempo_real_minutos && (
                  <p className={tema.colores.textoSecundario}>
                    Real: {ticketSeleccionado.tiempo_real_minutos} min
                  </p>
                )}
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mb-4 text-[11px]">
              <button
                onClick={() =>
                  actualizarEstadoTicket(ticketSeleccionado.id_ticket, "en_progreso")
                }
                className="px-3 py-2 rounded-xl bg-blue-600 text-white font-bold"
              >
                Marcar en progreso
              </button>
              <button
                onClick={() =>
                  actualizarEstadoTicket(ticketSeleccionado.id_ticket, "resuelto")
                }
                className="px-3 py-2 rounded-xl bg-emerald-600 text-white font-bold"
              >
                Marcar resuelto
              </button>
              <button
                onClick={() =>
                  actualizarEstadoTicket(ticketSeleccionado.id_ticket, "cancelado")
                }
                className="px-3 py-2 rounded-xl bg-gray-600 text-white font-bold"
              >
                Cancelar ticket
              </button>
              <Link
                href={`/tecnico/tickets/${ticketSeleccionado.id_ticket}`}
                className={`px-3 py-2 rounded-xl font-bold ${tema.colores.hover} ${tema.colores.texto} inline-flex items-center gap-1`}
              >
                <Eye className="w-3 h-3" />
                Ver en página completa
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* ESTILOS GLOBALES */}
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
        .custom-scrollbar {
          scrollbar-color: rgba(99, 102, 241, 0.5) transparent;
          scrollbar-width: thin;
        }

        @keyframes wave {
          0%,
          100% {
            transform: rotate(0deg);
          }
          10%,
          20% {
            transform: rotate(14deg);
          }
          30%,
          60%,
          90% {
            transform: rotate(-8deg);
          }
          40%,
          80% {
            transform: rotate(14deg);
          }
          50% {
            transform: rotate(10deg);
          }
        }
        .animate-wave {
          animation: wave 1s ease-in-out infinite;
          transform-origin: 70% 70%;
          display: inline-block;
        }

        @media (max-width: 768px) {
          .hidden.md\\:block {
            display: none;
          }
          .block.md\\:hidden {
            display: block;
          }
        }

        @media print {
          .no-print {
            display: none !important;
          }
          body {
            background: white;
            color: black;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          * {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
        }

        @media (prefers-color-scheme: dark) {
          input,
          select,
          textarea {
            color-scheme: dark;
          }
        }
      `}</style>
    </div>
  );
}

// ========================================
// COMPONENTES AUXILIARES
// ========================================

function ResumenCard({
  tema,
  icono: Icono,
  titulo,
  valor,
  chip,
  color,
}: {
  tema: ConfiguracionTema;
  icono: any;
  titulo: string;
  valor: number;
  chip: string;
  color: string;
}) {
  return (
    <div
      className={`rounded-2xl p-4 md:p-5 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} transition-all duration-300 hover:scale-105 hover:-translate-y-1 cursor-pointer group`}
    >
      <div className="flex items-center justify-between mb-3">
        <div
          className={`w-10 h-10 bg-gradient-to-br ${color} rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}
        >
          <Icono className="w-5 h-5 text-white" />
        </div>
      </div>
      <div className={`text-3xl font-black mb-1 ${tema.colores.texto}`}>
        {isNaN(valor) ? 0 : valor}
      </div>
      <div
        className={`text-xs font-bold uppercase tracking-wider ${tema.colores.textoSecundario}`}
      >
        {titulo}
      </div>
      <div className="mt-2">
        <span
          className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-semibold ${tema.colores.hover}`}
        >
          <ZapIcon className="w-3 h-3" />
          {chip}
        </span>
      </div>
    </div>
  );
}

function HistoryIcon() {
  return (
    <div className="relative">
      <Clock3 className="w-5 h-5" />
      <span className="absolute -right-0.5 -bottom-0.5 w-2 h-2 rounded-full bg-emerald-400" />
    </div>
  );
}
