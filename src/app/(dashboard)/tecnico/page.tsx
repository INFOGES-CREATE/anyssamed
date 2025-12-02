//src\app\(dashboard)\tecnico\page.tsx

"use client";

import { useState, useEffect, useMemo } from "react";
import SidebarTecnico from "@/components/tecnico/SidebarTecnico";


import {
  Activity,
  AlertCircle,
  AlertTriangle,
  Award,
  Key,
  BarChart3,
  Bell,
  RefreshCcw,
  BellOff,
  PenTool,
  Briefcase,
  History,
  Calendar,
  Calculator,
  CalendarCheck,
  SlidersHorizontal,
  CalendarClock,
  Headset,
  Smartphone,
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
  AlertCircleIcon,
  MapPinIcon,
  PhoneIcon,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import {
  LineChart as RechartsLineChart,
  Line,
  AreaChart,
  Area,
  BarChart as RechartsBarChart,
  Bar,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts";

// ========================================
// TIPOS DE DATOS - TÉCNICO
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

interface TareaTecnico {
  id_tarea: number;
  tipo: "mantenimiento" | "reparacion" | "instalacion" | "revision" | "calibracion";
  descripcion: string;
  prioridad: "baja" | "media" | "alta" | "urgente";
  fecha_programada: string;
  fecha_vencimiento: string;
  estado: "pendiente" | "en_proceso" | "completada" | "cancelada";
  equipo: {
    id_equipo: number;
    nombre: string;
    tipo: string;
  };
  centro: {
    id_centro: number;
    nombre: string;
  };
  tiempo_estimado_minutos: number;
}

interface EquipoTecnico {
  id_equipo: number;
  nombre: string;
  tipo: string;
  marca: string;
  modelo: string;
  serie: string;
  ubicacion: string;
  estado: "operativo" | "mantenimiento" | "fuera_servicio" | "reparacion";
  proxima_revision: string;
  ultimo_mantenimiento: string;
  centro: {
    id_centro: number;
    nombre: string;
  };
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

interface MetricaRendimientoTecnico {
  nombre: string;
  valor_actual: number;
  valor_anterior: number;
  unidad: string;
  tendencia: "up" | "down" | "neutral";
  porcentaje_cambio: number;
  icono: any;
  color: string;
  descripcion: string;
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
// DATOS DE EJEMPLO PARA GRÁFICOS
// ========================================

const datosTicketsSemana = [
  { dia: "Lun", abiertos: 8, en_progreso: 5, resueltos: 12 },
  { dia: "Mar", abiertos: 10, en_progreso: 6, resueltos: 14 },
  { dia: "Mié", abiertos: 7, en_progreso: 8, resueltos: 16 },
  { dia: "Jue", abiertos: 9, en_progreso: 7, resueltos: 13 },
  { dia: "Vie", abiertos: 6, en_progreso: 4, resueltos: 15 },
  { dia: "Sáb", abiertos: 3, en_progreso: 2, resueltos: 5 },
  { dia: "Dom", abiertos: 2, en_progreso: 1, resueltos: 3 },
];

const datosMantenimientoMes = [
  { mes: "Ene", preventivo: 15, correctivo: 8, inspecciones: 20 },
  { mes: "Feb", preventivo: 18, correctivo: 6, inspecciones: 22 },
  { mes: "Mar", preventivo: 20, correctivo: 7, inspecciones: 25 },
  { mes: "Abr", preventivo: 22, correctivo: 5, inspecciones: 28 },
  { mes: "May", preventivo: 19, correctivo: 9, inspecciones: 24 },
  { mes: "Jun", preventivo: 25, correctivo: 4, inspecciones: 30 },
];

const datosTiposTickets = [
  { nombre: "Soporte", valor: 35, color: "#3b82f6" },
  { nombre: "Mantenimiento", valor: 28, color: "#10b981" },
  { nombre: "Ingeniería", valor: 18, color: "#f59e0b" },
  { nombre: "Biomédico", valor: 12, color: "#8b5cf6" },
  { nombre: "Infraestructura", valor: 7, color: "#ef4444" },
];

const datosEficienciaTecnico = [
  { categoria: "Resolución", valor: 95 },
  { categoria: "Puntualidad", valor: 92 },
  { categoria: "Calidad", valor: 96 },
  { categoria: "Disponibilidad", valor: 94 },
  { categoria: "Comunicación", valor: 98 },
];

// ========================================
// COMPONENTE PRINCIPAL
// ========================================

export default function DashboardTecnicoPage() {
  // ========================================
  // ESTADOS
  // ========================================

  const [usuario, setUsuario] = useState<UsuarioSesion | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingData, setLoadingData] = useState(true);

  const [estadisticas, setEstadisticas] = useState<EstadisticasTecnico | null>(null);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [tareas, setTareas] = useState<TareaTecnico[]>([]);
  const [equipos, setEquipos] = useState<EquipoTecnico[]>([]);
  const [alertas, setAlertas] = useState<AlertaTecnico[]>([]);
  const [metricasRendimiento, setMetricasRendimiento] = useState<MetricaRendimientoTecnico[]>([]);

  const [temaActual, setTemaActual] = useState<TemaColor>("light");
  const [sidebarAbierto, setSidebarAbierto] = useState(true);
  const [notificacionesAbiertas, setNotificacionesAbiertas] = useState(false);
  const [perfilAbierto, setPerfilAbierto] = useState(false);
  const [busqueda, setBusqueda] = useState("");
  const [seccionActiva, setSeccionActiva] = useState("dashboard");
  const [filtroEstado, setFiltroEstado] = useState<string>("todos");
  const [filtroPrioridad, setFiltroPrioridad] = useState<string>("todas");
  const [disponibilidad, setDisponibilidad] = useState<"disponible" | "ocupado" | "fuera_servicio">("disponible");

  // ========================================
  // TEMA ACTUAL
  // ========================================

  const tema = useMemo(() => TEMAS[temaActual], [temaActual]);

  // ========================================
  // MENU DE NAVEGACIÓN
  // ========================================



  // ========================================
  // EFECTOS
  // ========================================

  useEffect(() => {
    cargarDatosUsuario();
  }, []);

  useEffect(() => {
    if (usuario?.tecnico) {
      cargarDatosDashboard();
    }
  }, [usuario]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (usuario?.tecnico) {
        cargarDatosDashboard();
      }
    }, 180000); // Cada 3 minutos

    return () => clearInterval(interval);
  }, [usuario]);

  useEffect(() => {
    document.body.className = `bg-gradient-to-br ${tema.colores.fondo} min-h-screen transition-all duration-500`;
  }, [tema]);

  // ========================================
  // FUNCIONES DE CARGA DE DATOS
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

        const tieneRolTecnico = rolesUsuario.some((rol) =>
          rol.includes("TECNICO") || rol.includes("SOPORTE")
        );

        if (!tieneRolTecnico) {
          alert(
            `Acceso denegado. Este panel es solo para técnicos. Tus roles actuales son: ${rolesUsuario.join(", ")}`
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

  const cargarDatosDashboard = async () => {
    if (!usuario?.tecnico?.id_tecnico) return;

    try {
      setLoadingData(true);

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
        console.error("Respuesta del dashboard:", data);
        return;
      }

      setEstadisticas(data.estadisticas || null);
      setTickets(data.tickets || []);
      setTareas(data.tareas || []);
      setEquipos(data.equipos || []);
      setAlertas(data.alertas || []);
      setMetricasRendimiento(data.metricas_rendimiento || []);
    } catch (err) {
      console.error("Error al cargar dashboard:", err);
    } finally {
      setLoadingData(false);
    }
  };

  // ========================================
  // FUNCIONES DE ACCIONES
  // ========================================

  const cambiarDisponibilidad = async (nuevoEstado: "disponible" | "ocupado" | "fuera_servicio") => {
    try {
      const response = await fetch(
        `/api/tecnico/${usuario?.tecnico?.id_tecnico}/disponibilidad`,
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

  const actualizarEstadoTicket = async (idTicket: number, nuevoEstado: string) => {
    try {
      const response = await fetch(
        `/api/tecnico/tickets/${idTicket}/estado`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ estado: nuevoEstado }),
        }
      );

      if (response.ok) {
        setTickets((prev) =>
          prev.map((ticket) =>
            ticket.id_ticket === idTicket
              ? { ...ticket, estado: nuevoEstado as any }
              : ticket
          )
        );
        alert("Ticket actualizado exitosamente");
        cargarDatosDashboard();
      } else {
        alert("Error al actualizar ticket");
      }
    } catch (error) {
      console.error("Error al actualizar ticket:", error);
      alert("Error al actualizar ticket");
    }
  };

  const completarTarea = async (idTarea: number) => {
    try {
      const response = await fetch(
        `/api/tecnico/tareas/${idTarea}/completar`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        }
      );

      if (response.ok) {
        setTareas((prev) =>
          prev.filter((tarea) => tarea.id_tarea !== idTarea)
        );
        alert("Tarea completada exitosamente");
        cargarDatosDashboard();
      } else {
        alert("Error al completar la tarea");
      }
    } catch (error) {
      console.error("Error al completar tarea:", error);
      alert("Error al completar la tarea");
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

  // ========================================
  // FUNCIONES AUXILIARES
  // ========================================

  const formatearFecha = (fecha: string) => {
    const date = new Date(fecha);
    return new Intl.DateTimeFormat("es-CL", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  const formatearHora = (fecha: string) => {
    const date = new Date(fecha);
    return new Intl.DateTimeFormat("es-CL", {
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  const obtenerColorEstado = (estado: string) => {
    const isDark = ["dark", "blue", "purple", "green"].includes(temaActual);
    const colores: { [key: string]: string } = {
      abierto: isDark
        ? "bg-red-500/20 text-red-400 border-red-500/30"
        : "bg-red-100 text-red-800 border-red-200",
      en_progreso: isDark
        ? "bg-blue-500/20 text-blue-400 border-blue-500/30"
        : "bg-blue-100 text-blue-800 border-blue-200",
      resuelto: isDark
        ? "bg-green-500/20 text-green-400 border-green-500/30"
        : "bg-green-100 text-green-800 border-green-200",
      cancelado: isDark
        ? "bg-gray-500/20 text-gray-400 border-gray-500/30"
        : "bg-gray-100 text-gray-800 border-gray-200",
      pendiente: isDark
        ? "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
        : "bg-yellow-100 text-yellow-800 border-yellow-200",
      completada: isDark
        ? "bg-green-500/20 text-green-400 border-green-500/30"
        : "bg-green-100 text-green-800 border-green-200",
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
      critica: isDark
        ? "bg-red-500/20 text-red-400 border-red-500/30"
        : "bg-red-100 text-red-800 border-red-200",
      alta: isDark
        ? "bg-orange-500/20 text-orange-400 border-orange-500/30"
        : "bg-orange-100 text-orange-800 border-orange-200",
      media: isDark
        ? "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
        : "bg-yellow-100 text-yellow-800 border-yellow-200",
      baja: isDark
        ? "bg-green-500/20 text-green-400 border-green-500/30"
        : "bg-green-100 text-green-800 border-green-200",
      urgente: isDark
        ? "bg-red-500/20 text-red-400 border-red-500/30"
        : "bg-red-100 text-red-800 border-red-200",
    };

    return (
      colores[prioridad.toLowerCase()] ||
      (isDark
        ? "bg-gray-500/20 text-gray-400 border-gray-500/30"
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
  // RENDER - LOADING
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
              <Wrench className="w-10 h-10 text-white" />
            </div>
          </div>
          <h2 className={`text-4xl font-black mb-4 ${tema.colores.texto}`}>
            Iniciando Sistema Técnico
          </h2>
          <p
            className={`text-lg font-semibold ${tema.colores.textoSecundario} animate-pulse`}
          >
            Preparando tu espacio de trabajo...
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
            No tienes permisos para acceder a este panel de técnico
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
  // RENDER - DASHBOARD COMPLETO
  // ========================================

  return (
    <div
      className={`min-h-screen transition-all duration-500 bg-gradient-to-br ${tema.colores.fondo}`}
    >
      {/* ========================================
          SIDEBAR
          ======================================== */}
            <SidebarTecnico
        usuario={usuario}
        tema={tema}
        sidebarAbierto={sidebarAbierto}
        setSidebarAbierto={setSidebarAbierto}
        estadisticas={estadisticas}
      />


      {/* ========================================
          HEADER
          ======================================== */}
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
                placeholder="Buscar ticket, equipo, tarea, técnico..."
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

            {/* Alertas */}
            <div className="relative">
              <button
                onClick={() =>
                  setNotificacionesAbiertas(!notificacionesAbiertas)
                }
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

              {/* Dropdown Alertas */}
              {notificacionesAbiertas && (
                <div
                  className={`absolute right-0 mt-2 w-96 rounded-2xl ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} max-h-96 overflow-y-auto`}
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
                              <AlertCircle className="w-5 h-5" />
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

      {/* ========================================
          CONTENIDO PRINCIPAL
          ======================================== */}
      <main
        className={`transition-all duration-300 ${
          sidebarAbierto ? "ml-72" : "ml-20"
        } pt-24 p-8`}
      >
        {/* Saludo y Fecha */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2
                className={`text-5xl font-black mb-2 ${tema.colores.texto} flex items-center gap-3`}
              >
                {obtenerSaludo()}, {usuario.nombre}
                <span className="animate-wave inline-block">👋</span>
              </h2>
              <p
                className={`text-xl font-semibold ${tema.colores.textoSecundario}`}
              >
                {new Date().toLocaleDateString("es-CL", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
              {usuario.tecnico && (
               <p
  className={`text-sm font-semibold mt-2 ${tema.colores.textoSecundario} flex items-center gap-2`}
>
  <MapPin className="w-4 h-4" />

  {(usuario?.tecnico?.centro?.nombre ?? "Centro no definido")} •{" "}
  {(usuario?.tecnico?.area_tecnica ?? "Área no definida")}
</p>

              )}
            </div>

            <button
              onClick={() => cargarDatosDashboard()}
              className={`flex items-center gap-2 px-6 py-3 ${tema.colores.primario} text-white rounded-xl font-bold transition-all duration-300 hover:scale-105 ${tema.colores.sombra}`}
            >
              <RefreshCw
                className={`w-5 h-5 ${loadingData ? "animate-spin" : ""}`}
              />
              Actualizar
            </button>
          </div>
        </div>

        {loadingData ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <Loader2 className="w-16 h-16 animate-spin text-indigo-500 mx-auto mb-4" />
              <p
                className={`text-lg font-semibold ${tema.colores.textoSecundario}`}
              >
                Cargando datos del dashboard técnico...
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* ========================================
                ESTADÍSTICAS PRINCIPALES - TÉCNICO
                ======================================== */}
            {estadisticas && (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6 mb-8">
                {/* Tickets Asignados */}
                <div
                  className={`rounded-2xl p-6 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} transition-all duration-300 hover:scale-105 hover:-translate-y-1 cursor-pointer group`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                      <AlertOctagon className="w-6 h-6 text-white" />
                    </div>
                    <ClipboardList className="w-5 h-5 text-red-400" />
                  </div>
                  <div
                    className={`text-4xl font-black mb-1 ${tema.colores.texto}`}
                  >
                    {estadisticas.tickets_asignados_hoy}
                  </div>
                  <div
                    className={`text-xs font-bold uppercase tracking-wider ${tema.colores.textoSecundario}`}
                  >
                    Tickets Hoy
                  </div>
                  <div className="mt-3 pt-3 border-t border-gray-700/50">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-blue-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {estadisticas.tickets_en_progreso} en progreso
                      </span>
                    </div>
                  </div>
                </div>

                {/* Tickets Abiertos */}
                <div
                  className={`rounded-2xl p-6 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} transition-all duration-300 hover:scale-105 hover:-translate-y-1 cursor-pointer group`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-yellow-500 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                      <FileText className="w-6 h-6 text-white" />
                    </div>
                    <AlertCircle className="w-5 h-5 text-orange-400" />
                  </div>
                  <div
                    className={`text-4xl font-black mb-1 ${tema.colores.texto}`}
                  >
                    {estadisticas.tickets_abiertos}
                  </div>
                  <div
                    className={`text-xs font-bold uppercase tracking-wider ${tema.colores.textoSecundario}`}
                  >
                    Abiertos
                  </div>
                  <div className="mt-3 pt-3 border-t border-gray-700/50">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-orange-400 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        Requiere atención
                      </span>
                    </div>
                  </div>
                </div>

                {/* Tickets Resueltos Hoy */}
                <div
                  className={`rounded-2xl p-6 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} transition-all duration-300 hover:scale-105 hover:-translate-y-1 cursor-pointer group`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                      <CheckCircle2 className="w-6 h-6 text-white" />
                    </div>
                    <TrendingUp className="w-5 h-5 text-green-400" />
                  </div>
                  <div
                    className={`text-4xl font-black mb-1 ${tema.colores.texto}`}
                  >
                    {estadisticas.tickets_resueltos_hoy}
                  </div>
                  <div
                    className={`text-xs font-bold uppercase tracking-wider ${tema.colores.textoSecundario}`}
                  >
                    Resueltos Hoy
                  </div>
                  <div className="mt-3 pt-3 border-t border-gray-700/50">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-green-400 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        Completados
                      </span>
                    </div>
                  </div>
                </div>

                {/* Tiempo Promedio Resolución */}
                <div
                  className={`rounded-2xl p-6 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} transition-all duration-300 hover:scale-105 hover:-translate-y-1 cursor-pointer group`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                      <Clock className="w-6 h-6 text-white" />
                    </div>
                    <TrendingDown className="w-5 h-5 text-blue-400" />
                  </div>
                  <div
                    className={`text-4xl font-black mb-1 ${tema.colores.texto}`}
                  >
                    {estadisticas.tiempo_promedio_resolucion}
                  </div>
                  <div
                    className={`text-xs font-bold uppercase tracking-wider ${tema.colores.textoSecundario}`}
                  >
                    Min. Promedio
                  </div>
                  <div className="mt-3 pt-3 border-t border-gray-700/50">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-blue-400 flex items-center gap-1">
                        <Zap className="w-3 h-3" />
                        Tiempo resolución
                      </span>
                    </div>
                  </div>
                </div>

                {/* Calificación Promedio */}
                <div
                  className={`rounded-2xl p-6 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} transition-all duration-300 hover:scale-105 hover:-translate-y-1 cursor-pointer group`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                      <Star className="w-6 h-6 text-white" />
                    </div>
                    <Award className="w-5 h-5 text-purple-400" />
                  </div>
                  <div
                    className={`text-4xl font-black mb-1 ${tema.colores.texto}`}
                  >
                    {estadisticas.calificacion_promedio.toFixed(1)}
                  </div>
                  <div
                    className={`text-xs font-bold uppercase tracking-wider ${tema.colores.textoSecundario}`}
                  >
                    Calificación
                  </div>
                  <div className="mt-3 pt-3 border-t border-gray-700/50">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-purple-400 flex items-center gap-1">
                        <Star className="w-3 h-3" />
                        De 5.0
                      </span>
                    </div>
                  </div>
                </div>

                {/* Disponibilidad */}
                <div
                  className={`rounded-2xl p-6 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} transition-all duration-300 hover:scale-105 hover:-translate-y-1 cursor-pointer group`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                      <Activity className="w-6 h-6 text-white" />
                    </div>
                    <Percent className="w-5 h-5 text-teal-400" />
                  </div>
                  <div
                    className={`text-4xl font-black mb-1 ${tema.colores.texto}`}
                  >
                    {estadisticas.disponibilidad_porcentaje}%
                  </div>
                  <div
                    className={`text-xs font-bold uppercase tracking-wider ${tema.colores.textoSecundario}`}
                  >
                    Disponibilidad
                  </div>
                  <div className="mt-3 pt-3 border-t border-gray-700/50">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-teal-400 flex items-center gap-1">
                        <Activity className="w-3 h-3" />
                        Operativo
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ========================================
                GRID PRINCIPAL: Tickets + Tareas + Equipos
                ======================================== */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
              {/* TICKETS ASIGNADOS */}
              <div
                className={`lg:col-span-2 rounded-2xl p-6 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra}`}
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-14 h-14 bg-gradient-to-br ${tema.colores.gradiente} rounded-xl flex items-center justify-center shadow-lg`}
                    >
                      <ClipboardList className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <h3
                        className={`text-2xl font-black ${tema.colores.texto}`}
                      >
                        Mis Tickets
                      </h3>
                      <p
                        className={`text-sm font-semibold ${tema.colores.textoSecundario}`}
                      >
                        {tickets.length} tickets asignados
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <select
                      value={filtroEstado}
                      onChange={(e) => setFiltroEstado(e.target.value)}
                      className={`px-4 py-2 rounded-xl ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto} text-sm font-semibold`}
                    >
                      <option value="todos">Todos</option>
                      <option value="abierto">Abiertos</option>
                      <option value="en_progreso">En Progreso</option>
                      <option value="resuelto">Resueltos</option>
                    </select>

                    <select
                      value={filtroPrioridad}
                      onChange={(e) => setFiltroPrioridad(e.target.value)}
                      className={`px-4 py-2 rounded-xl ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto} text-sm font-semibold`}
                    >
                      <option value="todas">Todas Prioridades</option>
                      <option value="critica">Crítica</option>
                      <option value="alta">Alta</option>
                      <option value="media">Media</option>
                      <option value="baja">Baja</option>
                    </select>

                    <Link
                      href="/tecnico/tickets"
                      className={`px-6 py-3 ${tema.colores.primario} text-white rounded-xl font-bold transition-all duration-300 hover:scale-105 flex items-center gap-2`}
                    >
                      Ver Todos
                      <ChevronRight className="w-5 h-5" />
                    </Link>
                  </div>
                </div>

                <div className="space-y-4 max-h-[600px] overflow-y-auto custom-scrollbar pr-2">
                  {tickets.length === 0 ? (
                    <div className="text-center py-16">
                      <div
                        className={`w-24 h-24 bg-gradient-to-br ${tema.colores.gradiente} rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse`}
                      >
                        <ClipboardList className="w-12 h-12 text-white" />
                      </div>
                      <p
                        className={`text-xl font-bold ${tema.colores.texto} mb-2`}
                      >
                        No hay tickets asignados
                      </p>
                      <p
                        className={`text-sm ${tema.colores.textoSecundario}`}
                      >
                        Los tickets aparecerán aquí cuando se asignen
                      </p>
                    </div>
                  ) : (
                    tickets.map((ticket, index) => (
                      <div
                        key={ticket.id_ticket}
                        className={`p-5 rounded-2xl ${tema.colores.card} ${tema.colores.borde} border transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1 ${tema.colores.sombra} group`}
                        style={{ animationDelay: `${index * 100}ms` }}
                      >
                        <div className="flex items-start gap-4">
                          {/* Icono Tipo */}
                          <div
                            className={`relative w-16 h-16 rounded-xl bg-gradient-to-br ${tema.colores.gradiente} flex items-center justify-center text-white font-bold text-xl shadow-lg flex-shrink-0 group-hover:scale-110 transition-transform`}
                          >
                            {(() => {
                              const IconoTipo = obtenerIconoTipo(ticket.tipo);
                              return <IconoTipo className="w-8 h-8" />;
                            })()}
                            {ticket.prioridad === "critica" && (
                              <div className="absolute -top-2 -right-2 w-8 h-8 bg-red-600 rounded-full flex items-center justify-center shadow-lg animate-pulse">
                                <Flame className="w-4 h-4 text-white" />
                              </div>
                            )}
                          </div>

                          {/* Info Ticket */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <h4
                                  className={`text-xl font-black ${tema.colores.texto} mb-1`}
                                >
                                  {ticket.numero_ticket} - {ticket.titulo}
                                </h4>
                                <p
                                  className={`text-sm font-semibold ${tema.colores.textoSecundario} flex items-center gap-2 mb-1`}
                                >
                                  <Building2 className="w-4 h-4" />
                                  {ticket.centro.nombre} - {ticket.centro.ciudad}
                                </p>
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span
                                    className={`px-3 py-1 rounded-full text-xs font-bold border ${obtenerColorEstado(
                                      ticket.estado
                                    )}`}
                                  >
                                    {ticket.estado}
                                  </span>
                                  <span
                                    className={`px-3 py-1 rounded-full text-xs font-bold border ${obtenerColorPrioridad(
                                      ticket.prioridad
                                    )}`}
                                  >
                                    {ticket.prioridad}
                                  </span>
                                </div>
                              </div>
                            </div>

                            <p
                              className={`text-sm mb-3 ${tema.colores.textoSecundario} flex items-start gap-2`}
                            >
                              <FileText className="w-4 h-4 flex-shrink-0 mt-0.5" />
                              <span>{ticket.descripcion}</span>
                            </p>

                            {ticket.equipo_afectado && (
                              <p
                                className={`text-sm mb-3 ${tema.colores.textoSecundario} flex items-start gap-2`}
                              >
                                <Cpu className="w-4 h-4 flex-shrink-0 mt-0.5" />
                                <span>
                                  <strong>Equipo:</strong> {ticket.equipo_afectado.nombre} ({ticket.equipo_afectado.tipo})
                                </span>
                              </p>
                            )}

                            <div className="grid grid-cols-2 gap-3 mb-3">
                              <div
                                className={`flex items-center gap-2 px-3 py-2 rounded-lg ${tema.colores.secundario}`}
                              >
                                <Clock
                                  className={`w-4 h-4 ${tema.colores.acento}`}
                                />
                                <span
                                  className={`text-sm font-bold ${tema.colores.texto}`}
                                >
                                  {ticket.tiempo_estimado_minutos} min
                                </span>
                              </div>

                              <div
                                className={`flex items-center gap-2 px-3 py-2 rounded-lg ${tema.colores.secundario}`}
                              >
                                <User
                                  className={`w-4 h-4 ${tema.colores.acento}`}
                                />
                                <span
                                  className={`text-sm font-bold ${tema.colores.texto}`}
                                >
                                  {ticket.solicitante.nombre_completo}
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 flex-wrap">
                              {ticket.estado === "abierto" && (
                                <button
                                  onClick={() =>
                                    actualizarEstadoTicket(
                                      ticket.id_ticket,
                                      "en_progreso"
                                    )
                                  }
                                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold text-sm transition-all duration-300 hover:scale-105 flex items-center gap-2"
                                >
                                  <Clock className="w-4 h-4" />
                                  Iniciar
                                </button>
                              )}

                              {ticket.estado === "en_progreso" && (
                                <button
                                  onClick={() =>
                                    actualizarEstadoTicket(
                                      ticket.id_ticket,
                                      "resuelto"
                                    )
                                  }
                                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl font-semibold text-sm transition-all duration-300 hover:scale-105 flex items-center gap-2"
                                >
                                  <CheckCircle2 className="w-4 h-4" />
                                  Resolver
                                </button>
                              )}

                              <a
                                href={`tel:${ticket.solicitante.telefono}`}
                                className={`px-4 py-2 rounded-xl font-semibold text-sm transition-all duration-300 flex items-center gap-2 ${tema.colores.secundario} ${tema.colores.texto} hover:scale-105`}
                              >
                                <Phone className="w-4 h-4" />
                                Llamar
                              </a>

                              <Link
                                href={`/tecnico/tickets/${ticket.id_ticket}`}
                                className={`px-4 py-2 ${tema.colores.primario} text-white rounded-xl font-semibold text-sm transition-all duration-300 hover:scale-105 flex items-center gap-2`}
                              >
                                <Eye className="w-4 h-4" />
                                Detalles
                              </Link>

                              <button
                                className={`p-2 rounded-xl ${tema.colores.secundario} ${tema.colores.texto} hover:scale-105 transition-all duration-300`}
                              >
                                <MoreVertical className="w-5 h-5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* TAREAS PENDIENTES */}
              <div
                className={`rounded-2xl p-6 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra}`}
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg`}
                    >
                      <CheckSquare className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <h3
                        className={`text-2xl font-black ${tema.colores.texto}`}
                      >
                        Tareas Técnicas
                      </h3>
                      <p
                        className={`text-sm font-semibold ${tema.colores.textoSecundario}`}
                      >
                        {tareas.length} tareas
                      </p>
                    </div>
                  </div>

                  <Link
                    href="/tecnico/tareas"
                    className={`p-3 rounded-xl ${tema.colores.hover} transition-all duration-300 hover:scale-105`}
                  >
                    <ChevronRight
                      className={`w-5 h-5 ${tema.colores.texto}`}
                    />
                  </Link>
                </div>

                <div className="space-y-3 max-h-[600px] overflow-y-auto custom-scrollbar pr-2">
                  {tareas.length === 0 ? (
                    <div className="text-center py-16">
                      <div
                        className={`w-24 h-24 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse`}
                      >
                        <CheckSquare className="w-12 h-12 text-white" />
                      </div>
                      <p
                        className={`text-xl font-bold ${tema.colores.texto} mb-2`}
                      >
                        No hay tareas pendientes
                      </p>
                      <p
                        className={`text-sm ${tema.colores.textoSecundario}`}
                      >
                        ¡Excelente trabajo!
                      </p>
                    </div>
                  ) : (
                    tareas.map((tarea, index) => (
                      <div
                        key={tarea.id_tarea}
                        className={`block p-4 rounded-xl ${tema.colores.card} ${tema.colores.borde} border transition-all duration-300 hover:scale-[1.02] ${tema.colores.sombra} group`}
                        style={{ animationDelay: `${index * 100}ms` }}
                      >
                        <div className="flex items-start gap-3">
                          <div
                            className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${obtenerColorPrioridad(
                              tarea.prioridad
                            )}`}
                          >
                            {tarea.tipo === "mantenimiento" && (
                              <Wrench className="w-5 h-5" />
                            )}
                            {tarea.tipo === "reparacion" && (
                              <Hammer className="w-5 h-5" />
                            )}
                            {tarea.tipo === "instalacion" && (
                              <Plus className="w-5 h-5" />
                            )}
                            {tarea.tipo === "revision" && (
                              <Eye className="w-5 h-5" />
                            )}
                            {tarea.tipo === "calibracion" && (
                              <Target className="w-5 h-5" />
                            )}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between mb-2">
                              <h4
                                className={`font-black ${tema.colores.texto} text-sm`}
                              >
                                {tarea.descripcion}
                              </h4>
                              <span
                                className={`px-2 py-1 rounded-lg text-xs font-bold ${obtenerColorPrioridad(
                                  tarea.prioridad
                                )}`}
                              >
                                {tarea.prioridad}
                              </span>
                            </div>

                            <p
                              className={`text-xs mb-2 ${tema.colores.textoSecundario} flex items-center gap-1`}
                            >
                              <Cpu className="w-3 h-3" />
                              {tarea.equipo.nombre}
                            </p>

                            <p
                              className={`text-xs mb-2 ${tema.colores.textoSecundario} flex items-center gap-1`}
                            >
                              <Building2 className="w-3 h-3" />
                              {tarea.centro.nombre}
                            </p>

                            <div className="flex items-center justify-between">
                              <p
                                className={`text-xs font-medium ${tema.colores.textoSecundario} flex items-center gap-1`}
                              >
                                <Calendar className="w-3 h-3" />
                                {formatearFecha(tarea.fecha_programada)}
                              </p>

                              <button
                                onClick={() => completarTarea(tarea.id_tarea)}
                                className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded-lg text-xs font-bold transition-all duration-300 hover:scale-105"
                              >
                                Completar
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* ========================================
                EQUIPOS EN MANTENIMIENTO
                ======================================== */}
            {equipos.length > 0 && (
              <div
                className={`rounded-2xl p-6 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} mb-8`}
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-14 h-14 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg`}
                    >
                      <Cpu className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <h3
                        className={`text-2xl font-black ${tema.colores.texto}`}
                      >
                        Equipos Bajo Mi Responsabilidad
                      </h3>
                      <p
                        className={`text-sm font-semibold ${tema.colores.textoSecundario}`}
                      >
                        {equipos.length} equipos
                      </p>
                    </div>
                  </div>

                  <Link
                    href="/tecnico/equipos"
                    className={`px-6 py-3 ${tema.colores.primario} text-white rounded-xl font-bold transition-all duration-300 hover:scale-105 flex items-center gap-2`}
                  >
                    Ver Todos
                    <ChevronRight className="w-5 h-5" />
                  </Link>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {equipos.map((equipo) => (
                    <div
                      key={equipo.id_equipo}
                      className={`p-5 rounded-2xl ${tema.colores.card} ${tema.colores.borde} border transition-all duration-300 hover:scale-105 hover:-translate-y-1 ${tema.colores.sombra} cursor-pointer group`}
                    >
                      <div className="flex flex-col items-center text-center">
                        <div
                          className={`relative w-20 h-20 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-bold text-2xl shadow-lg mb-4 group-hover:scale-110 transition-transform`}
                        >
                          <Cpu className="w-10 h-10" />
                          {equipo.estado === "operativo" && (
                            <div className="absolute -bottom-2 -right-2 w-6 h-6 bg-green-500 rounded-full border-2 border-white animate-pulse"></div>
                          )}
                          {equipo.estado === "mantenimiento" && (
                            <div className="absolute -bottom-2 -right-2 w-6 h-6 bg-yellow-500 rounded-full border-2 border-white animate-pulse"></div>
                          )}
                          {equipo.estado === "fuera_servicio" && (
                            <div className="absolute -bottom-2 -right-2 w-6 h-6 bg-red-500 rounded-full border-2 border-white"></div>
                          )}
                        </div>

                        <h4
                          className={`text-lg font-black mb-1 ${tema.colores.texto}`}
                        >
                          {equipo.nombre}
                        </h4>

                        <p
                          className={`text-sm font-semibold mb-1 ${tema.colores.textoSecundario}`}
                        >
                          {equipo.marca} {equipo.modelo}
                        </p>

                        <p
                          className={`text-xs font-medium mb-3 ${tema.colores.textoSecundario} flex items-center justify-center gap-1`}
                        >
                          <MapPin className="w-3 h-3" />
                          {equipo.ubicacion}
                        </p>

                        <div
                          className={`w-full px-3 py-2 rounded-lg ${tema.colores.secundario} mb-3`}
                        >
                          <p
                            className={`text-xs font-bold ${tema.colores.texto}`}
                          >
                            {equipo.estado}
                          </p>
                        </div>

                        <div className="flex items-center gap-2 w-full text-xs">
                          <p className={`flex-1 ${tema.colores.textoSecundario}`}>
                            Próxima revisión:
                          </p>
                          <p className={`font-bold ${tema.colores.acento}`}>
                            {formatearFecha(equipo.proxima_revision)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ========================================
                GRÁFICOS Y MÉTRICAS
                ======================================== */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              {/* GRÁFICO DE TICKETS SEMANA */}
              <div
                className={`rounded-2xl p-6 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra}`}
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg`}
                    >
                      <LineChart className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3
                        className={`text-xl font-black ${tema.colores.texto}`}
                      >
                        Tickets Semanales
                      </h3>
                      <p
                        className={`text-sm font-semibold ${tema.colores.textoSecundario}`}
                      >
                        Abiertos vs Resueltos
                      </p>
                    </div>
                  </div>
                </div>

                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={datosTicketsSemana}>
                    <defs>
                      <linearGradient
                        id="colorAbiertos"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="#ef4444"
                          stopOpacity={0.8}
                        />
                        <stop
                          offset="95%"
                          stopColor="#ef4444"
                          stopOpacity={0}
                        />
                      </linearGradient>
                      <linearGradient
                        id="colorResueltos"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="#10b981"
                          stopOpacity={0.8}
                        />
                        <stop
                          offset="95%"
                          stopColor="#10b981"
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                    <XAxis
                      dataKey="dia"
                      stroke={tema.colores.textoSecundario}
                      style={{ fontSize: "12px" }}
                    />
                    <YAxis
                      stroke={tema.colores.textoSecundario}
                      style={{ fontSize: "12px" }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "rgba(17, 24, 39, 0.95)",
                        border: "1px solid rgba(99, 102, 241, 0.3)",
                        borderRadius: "12px",
                        padding: "12px",
                      }}
                    />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="abiertos"
                      stroke="#ef4444"
                      fillOpacity={1}
                      fill="url(#colorAbiertos)"
                      name="Abiertos"
                    />
                    <Area
                      type="monotone"
                      dataKey="resueltos"
                      stroke="#10b981"
                      fillOpacity={1}
                      fill="url(#colorResueltos)"
                      name="Resueltos"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* GRÁFICO DE MANTENIMIENTO */}
              <div
                className={`rounded-2xl p-6 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra}`}
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg`}
                    >
                      <Wrench className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3
                        className={`text-xl font-black ${tema.colores.texto}`}
                      >
                        Mantenimiento Mensual
                      </h3>
                      <p
                        className={`text-sm font-semibold ${tema.colores.textoSecundario}`}
                      >
                        Preventivo vs Correctivo
                      </p>
                    </div>
                  </div>
                </div>

                <ResponsiveContainer width="100%" height={300}>
                  <RechartsBarChart data={datosMantenimientoMes}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                    <XAxis
                      dataKey="mes"
                      stroke={tema.colores.textoSecundario}
                      style={{ fontSize: "12px" }}
                    />
                    <YAxis
                      stroke={tema.colores.textoSecundario}
                      style={{ fontSize: "12px" }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "rgba(17, 24, 39, 0.95)",
                        border: "1px solid rgba(16, 185, 129, 0.3)",
                        borderRadius: "12px",
                        padding: "12px",
                      }}
                    />
                    <Legend />
                    <Bar
                      dataKey="preventivo"
                      fill="#10b981"
                      name="Preventivo"
                      radius={[8, 8, 0, 0]}
                    />
                    <Bar
                      dataKey="correctivo"
                      fill="#f59e0b"
                      name="Correctivo"
                      radius={[8, 8, 0, 0]}
                    />
                    <Bar
                      dataKey="inspecciones"
                      fill="#3b82f6"
                      name="Inspecciones"
                      radius={[8, 8, 0, 0]}
                    />
                  </RechartsBarChart>
                </ResponsiveContainer>
              </div>

              {/* GRÁFICO DE TIPOS DE TICKETS */}
              <div
                className={`rounded-2xl p-6 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra}`}
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg`}
                    >
                      <PieChart className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3
                        className={`text-xl font-black ${tema.colores.texto}`}
                      >
                        Distribución de Tickets
                      </h3>
                      <p
                        className={`text-sm font-semibold ${tema.colores.textoSecundario}`}
                      >
                        Por tipo de servicio
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-8">
                  <ResponsiveContainer width="60%" height={250}>
                    <RechartsPieChart>
                      <Pie
                        data={datosTiposTickets}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="valor"
                      >
                        {datosTiposTickets.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </RechartsPieChart>
                  </ResponsiveContainer>

                  <div className="flex-1 space-y-2">
                    {datosTiposTickets.map((item, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between"
                      >
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: item.color }}
                          ></div>
                          <span
                            className={`text-sm font-semibold ${tema.colores.texto}`}
                          >
                            {item.nombre}
                          </span>
                        </div>
                        <span
                          className={`text-sm font-bold ${tema.colores.acento}`}
                        >
                          {item.valor}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* GRÁFICO RADAR DE EFICIENCIA */}
              <div
                className={`rounded-2xl p-6 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra}`}
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center shadow-lg`}
                    >
                      <Target className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3
                        className={`text-xl font-black ${tema.colores.texto}`}
                      >
                        Mi Desempeño
                      </h3>
                      <p
                        className={`text-sm font-semibold ${tema.colores.textoSecundario}`}
                      >
                        Evaluación técnica
                      </p>
                    </div>
                  </div>
                </div>

                <ResponsiveContainer width="100%" height={300}>
                  <RadarChart data={datosEficienciaTecnico}>
                    <PolarGrid stroke="rgba(99, 102, 241, 0.2)" />
                    <PolarAngleAxis
                      dataKey="categoria"
                      stroke={tema.colores.textoSecundario}
                      style={{ fontSize: "12px" }}
                    />
                    <PolarRadiusAxis
                      angle={90}
                      domain={[0, 100]}
                      stroke={tema.colores.textoSecundario}
                    />
                    <Radar
                      name="Desempeño"
                      dataKey="valor"
                      stroke="#f59e0b"
                      fill="#f59e0b"
                      fillOpacity={0.6}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "rgba(17, 24, 39, 0.95)",
                        border: "1px solid rgba(245, 158, 11, 0.3)",
                        borderRadius: "12px",
                        padding: "12px",
                      }}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* ========================================
                ACCESOS RÁPIDOS
                ======================================== */}
            <div
              className={`rounded-2xl p-6 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} mb-8`}
            >
              <div className="flex items-center gap-3 mb-6">
                <div
                  className={`w-14 h-14 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-xl flex items-center justify-center shadow-lg`}
                >
                  <Zap className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h3 className={`text-2xl font-black ${tema.colores.texto}`}>
                    Accesos Rápidos
                  </h3>
                  <p
                    className={`text-sm font-semibold ${tema.colores.textoSecundario}`}
                  >
                    Herramientas más utilizadas
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                {[
                  {
                    titulo: "Nuevo Ticket",
                    icono: Plus,
                    url: "/tecnico/tickets/nuevo",
                    color: "from-indigo-500 to-purple-500",
                  },
                  {
                    titulo: "Mis Tickets",
                    icono: ClipboardList,
                    url: "/tecnico/tickets",
                    color: "from-red-500 to-pink-500",
                  },
                  {
                    titulo: "Tareas",
                    icono: CheckSquare,
                    url: "/tecnico/tareas",
                    color: "from-purple-500 to-pink-500",
                  },
                  {
                    titulo: "Equipos",
                    icono: Cpu,
                    url: "/tecnico/equipos",
                    color: "from-blue-500 to-cyan-500",
                  },
                  {
                    titulo: "Mantenimiento",
                    icono: Wrench,
                    url: "/tecnico/mantenimiento",
                    color: "from-green-500 to-emerald-500",
                  },
                  {
                    titulo: "Alertas",
                    icono: AlertCircle,
                    url: "/tecnico/alertas",
                    color: "from-orange-500 to-red-500",
                  },
                  {
                    titulo: "Reportes",
                    icono: BarChart3,
                    url: "/tecnico/reportes",
                    color: "from-violet-500 to-purple-500",
                  },
                  {
                    titulo: "Inventario",
                    icono: Database,
                    url: "/tecnico/equipos/inventario",
                    color: "from-cyan-500 to-teal-500",
                  },
                  {
                    titulo: "Documentos",
                    icono: FileText,
                    url: "/tecnico/documentos",
                    color: "from-yellow-500 to-orange-500",
                  },
                  {
                    titulo: "Mi Disponibilidad",
                    icono: Activity,
                    url: "/tecnico/perfil/disponibilidad",
                    color: "from-pink-500 to-rose-500",
                  },
                  {
                    titulo: "Horarios",
                    icono: Clock,
                    url: "/tecnico/perfil/horarios",
                    color: "from-emerald-500 to-green-500",
                  },
                  {
                    titulo: "Configuración",
                    icono: Settings,
                    url: "/tecnico/configuracion",
                    color: "from-gray-500 to-slate-500",
                  },
                ].map((item, index) => (
                  <Link
                    key={index}
                    href={item.url}
                    className={`p-6 rounded-xl ${tema.colores.card} ${tema.colores.borde} border transition-all duration-300 hover:scale-105 hover:-translate-y-1 ${tema.colores.sombra} text-center group`}
                  >
                    <div
                      className={`w-14 h-14 bg-gradient-to-br ${item.color} rounded-xl flex items-center justify-center mx-auto mb-3 shadow-lg group-hover:scale-110 transition-transform`}
                    >
                      <item.icono className="w-7 h-7 text-white" />
                    </div>
                    <p className={`text-sm font-bold ${tema.colores.texto}`}>
                      {item.titulo}
                    </p>
                  </Link>
                ))}
              </div>
            </div>

            {/* ========================================
                ALERTAS CRÍTICAS
                ======================================== */}
            {alertas.length > 0 && (
              <div
                className={`rounded-2xl p-6 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} mb-8`}
              >
                <div className="flex items-center gap-3 mb-6">
                  <div
                    className={`w-14 h-14 bg-gradient-to-br from-red-500 to-orange-500 rounded-xl flex items-center justify-center shadow-lg`}
                  >
                    <AlertOctagon className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h3 className={`text-2xl font-black ${tema.colores.texto}`}>
                      Alertas Activas
                    </h3>
                    <p
                      className={`text-sm font-semibold ${tema.colores.textoSecundario}`}
                    >
                      {alertas.length} alertas requieren atención
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  {alertas.slice(0, 5).map((alerta) => (
                    <div
                      key={alerta.id_alerta}
                      className={`flex items-start gap-4 p-4 rounded-xl ${tema.colores.card} ${tema.colores.borde} border transition-all duration-300 hover:scale-[1.02]`}
                    >
                      <div
                        className={`w-10 h-10 bg-gradient-to-br ${obtenerColorPrioridad(
                          alerta.prioridad
                        )} rounded-xl flex items-center justify-center shadow-lg flex-shrink-0`}
                      >
                        <AlertCircle className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p
                          className={`text-sm font-bold ${tema.colores.texto} mb-1`}
                        >
                          {alerta.titulo}
                        </p>
                        <p
                          className={`text-xs ${tema.colores.textoSecundario} mb-2`}
                        >
                          {alerta.descripcion}
                        </p>
                        <div className="flex items-center gap-3 text-xs">
                          <span
                            className={`px-2 py-1 rounded-lg font-bold ${obtenerColorPrioridad(
                              alerta.prioridad
                            )}`}
                          >
                            {alerta.prioridad}
                          </span>
                          <span className={tema.colores.textoSecundario}>
                            {formatearFecha(alerta.fecha_creacion)}
                          </span>
                        </div>
                      </div>
                      {alerta.url_accion && (
                        <Link
                          href={alerta.url_accion}
                          className={`px-4 py-2 ${tema.colores.primario} text-white rounded-lg font-semibold text-sm transition-all duration-300 hover:scale-105 flex-shrink-0`}
                        >
                          Resolver
                        </Link>
                      )}
                    </div>
                  ))}
                </div>

                {alertas.length > 5 && (
                  <div className="mt-4 text-center">
                    <Link
                      href="/tecnico/alertas"
                      className={`text-sm font-bold ${tema.colores.acento} hover:underline`}
                    >
                      Ver todas las alertas ({alertas.length})
                    </Link>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </main>

      {/* ========================================
          FOOTER
          ======================================== */}
      <footer
        className={`transition-all duration-300 ${
          sidebarAbierto ? "ml-72" : "ml-20"
        } ${tema.colores.card} ${tema.colores.borde} border-t py-6 mt-12`}
      >
        <div className="max-w-[1920px] mx-auto px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <p
                className={`text-sm font-semibold ${tema.colores.textoSecundario}`}
              >
                © 2025 AnyssaMed - Sistema Técnico. Todos los derechos reservados.
              </p>
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r ${tema.colores.gradiente} text-white`}
              >
                v4.0.0
              </span>
            </div>

            <div className="flex items-center gap-6">
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
                Cerrar Sesión
              </button>
            </div>
          </div>
        </div>
      </footer>

      {/* ========================================
          ESTILOS GLOBALES (CSS)
          ======================================== */}
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

        /* Scrollbar Personalizado */
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

        /* Firefox */
        .custom-scrollbar {
          scrollbar-color: rgba(99, 102, 241, 0.5) transparent;
          scrollbar-width: thin;
        }

        /* Animaciones Personalizadas */
        @keyframes slideInDown {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slideInLeft {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }

        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        @keyframes bounce {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }

        @keyframes wave {
          0%, 100% {
            transform: rotate(0deg);
          }
          10%, 20% {
            transform: rotate(14deg);
          }
          30%, 60%, 90% {
            transform: rotate(-8deg);
          }
          40%, 80% {
            transform: rotate(14deg);
          }
          50% {
            transform: rotate(10deg);
          }
        }

        @keyframes shimmer {
          0% {
            background-position: -1000px 0;
          }
          100% {
            background-position: 1000px 0;
          }
        }

        @keyframes glow {
          0%, 100% {
            box-shadow: 0 0 5px rgba(99, 102, 241, 0.5);
          }
          50% {
            box-shadow: 0 0 20px rgba(99, 102, 241, 0.8);
          }
        }

        .animate-wave {
          animation: wave 1s ease-in-out infinite;
          transform-origin: 70% 70%;
          display: inline-block;
        }

        .animate-slide-in-down {
          animation: slideInDown 0.5s ease-out;
        }

        .animate-slide-in-up {
          animation: slideInUp 0.5s ease-out;
        }

        .animate-slide-in-left {
          animation: slideInLeft 0.5s ease-out;
        }

        .animate-slide-in-right {
          animation: slideInRight 0.5s ease-out;
        }

        .animate-glow {
          animation: glow 2s ease-in-out infinite;
        }

        /* Efectos de Hover */
        .transition-all {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .hover\:scale-105:hover {
          transform: scale(1.05);
        }

        .hover\:scale-110:hover {
          transform: scale(1.1);
        }

        .hover\:-translate-y-1:hover {
          transform: translateY(-4px);
        }

        /* Gradientes Dinámicos */
        .bg-gradient-animated {
          background-size: 200% 200%;
          animation: gradient 15s ease infinite;
        }

        @keyframes gradient {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }

        /* Efectos de Sombra */
        .shadow-glow {
          box-shadow: 0 0 30px rgba(99, 102, 241, 0.3);
        }

        .shadow-glow-lg {
          box-shadow: 0 0 50px rgba(99, 102, 241, 0.4);
        }

        /* Inputs Personalizados */
        input:focus,
        select:focus,
        textarea:focus {
          outline: none;
          box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
        }

        /* Backdrop Blur */
        .backdrop-blur-xl {
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
        }

        /* Glassmorphism */
        .glass {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        /* Responsive */
        @media (max-width: 768px) {
          .hidden.md\:block {
            display: none;
          }

          .block.md\:hidden {
            display: block;
          }
        }

        /* Print Styles */
        @media print {
          .no-print {
            display: none !important;
          }

          body {
            background: white;
            color: black;
          }
        }

        /* Accesibilidad */
        @media (prefers-reduced-motion: reduce) {
          * {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
        }

        /* Dark Mode */
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
