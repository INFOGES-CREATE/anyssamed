// src/app/(dashboard)/tecnico/alertas/page.tsx
"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
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
  Waves,
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
  Server,
  Monitor,
  Smartphone,
  Tablet,
  Wifi as WifiIcon,
  CloudOff,
  Power,
  PowerOff,
  Thermometer,
  Battery,
  BatteryCharging,
  BatteryWarning,
  Radio,
  Rss,
  Signal,
  SignalHigh,
  SignalLow,
  SignalMedium,
  SignalZero,
  Archive,
  ArchiveRestore,
  Trash2,
  Edit,
  Copy,
  ExternalLink,
  Maximize2,
  Minimize2,
  RotateCw,
  Save,
  FileDown,
  FileUp,
  FolderOpen,
  Package,
  Sliders,
  ToggleLeft,
  ToggleRight,
  Zap as ZapIcon,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import {
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
  LineChart as RechartsLineChart,
  Line,
  Area,
  AreaChart,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ComposedChart,
} from "recharts";

// ========================================
// 🎨 TIPOS DE DATOS AVANZADOS
// ========================================

type TemaColor = "light" | "dark" | "blue" | "purple" | "green" | "cyberpunk" | "ocean" | "sunset";

interface ConfiguracionTema {
  nombre: string;
  icono: any;
  descripcion: string;
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
    success: string;
    warning: string;
    error: string;
    info: string;
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
  alertas_criticas: number;
  alertas_resueltas_hoy: number;
  equipos_monitoreados: number;
  incidentes_prevenidos: number;
  tiempo_respuesta_promedio: number;
  nivel_satisfaccion: number;
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
    tipo_tecnico: "soporte" | "mantenimiento" | "ingenieria" | "biomedico" | "sistemas" | "infraestructura";
    extension_telefonica: string | null;
    estado: "activo" | "inactivo" | "suspendido" | "vacaciones";
    disponibilidad: "disponible" | "ocupado" | "fuera_servicio";
    turno: "manana" | "tarde" | "noche" | "completo";
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
    tickets_resueltos: number;
    tiempo_promedio_resolucion: number;
    calificacion_promedio: number;
  };
}

interface AlertaTecnico {
  id_alerta: number;
  tipo: "equipo_falla" | "mantenimiento_vencido" | "ticket_urgente" | "equipo_critico" | "sistema_caido" | "red_lenta" | "backup_fallido" | "seguridad_comprometida";
  titulo: string;
  descripcion: string;
  prioridad: "baja" | "media" | "alta" | "critica";
  fecha_creacion: string;
  fecha_actualizacion: string;
  leida: boolean;
  resuelta: boolean;
  url_accion: string | null;
  id_equipo: number | null;
  id_ticket: number | null;
  nombre_equipo: string | null;
  ubicacion: string | null;
  impacto_estimado: "bajo" | "medio" | "alto" | "critico";
  tiempo_estimado_resolucion: number | null;
  asignado_a: number | null;
  nombre_asignado: string | null;
  tags: string[];
  metadata: any;
}

interface ResumenAlertas {
  total: number;
  activas: number;
  criticas: number;
  mantenimientoVencido: number;
  equiposFalla: number;
  ticketsUrgentes: number;
  resueltasHoy: number;
  tiempoPromedioResolucion: number;
}

interface FiltrosAlertas {
  vista: "activas" | "resueltas" | "todas";
  tipo: string;
  prioridad: string;
  soloNoLeidas: boolean;
  fechaDesde: string;
  fechaHasta: string;
  ubicacion: string;
  asignado: string;
  impacto: string;
}

interface ConfiguracionNotificaciones {
  sonido: boolean;
  vibrar: boolean;
  desktop: boolean;
  email: boolean;
  sms: boolean;
  prioridadMinima: "baja" | "media" | "alta" | "critica";
}

// ========================================
// 🎨 CONFIGURACIONES DE TEMAS PREMIUM
// ========================================

const TEMAS: Record<TemaColor, ConfiguracionTema> = {
  light: {
    nombre: "Claro Profesional",
    icono: Sun,
    descripcion: "Interfaz clara y moderna para trabajo diurno",
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
      success: "bg-green-100 text-green-800 border-green-200",
      warning: "bg-yellow-100 text-yellow-800 border-yellow-200",
      error: "bg-red-100 text-red-800 border-red-200",
      info: "bg-blue-100 text-blue-800 border-blue-200",
    },
  },
  dark: {
    nombre: "Oscuro Premium",
    icono: Moon,
    descripcion: "Modo oscuro elegante para reducir fatiga visual",
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
      success: "bg-green-500/20 text-green-300 border-green-500/40",
      warning: "bg-yellow-500/20 text-yellow-300 border-yellow-500/40",
      error: "bg-red-500/20 text-red-300 border-red-500/40",
      info: "bg-blue-500/20 text-blue-300 border-blue-500/40",
    },
  },
  blue: {
    nombre: "Azul Técnico",
    icono: Wifi,
    descripcion: "Tema azul profesional para entornos técnicos",
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
      success: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
      warning: "bg-amber-500/20 text-amber-300 border-amber-500/40",
      error: "bg-rose-500/20 text-rose-300 border-rose-500/40",
      info: "bg-sky-500/20 text-sky-300 border-sky-500/40",
    },
  },
  purple: {
    nombre: "Púrpura Industrial",
    icono: Sparkles,
    descripcion: "Diseño moderno con toques de púrpura",
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
      success: "bg-green-500/20 text-green-300 border-green-500/40",
      warning: "bg-orange-500/20 text-orange-300 border-orange-500/40",
      error: "bg-red-500/20 text-red-300 border-red-500/40",
      info: "bg-violet-500/20 text-violet-300 border-violet-500/40",
    },
  },
  green: {
    nombre: "Verde Operacional",
    icono: HeartPulse,
    descripcion: "Tema verde para monitoreo de sistemas",
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
      success: "bg-green-500/20 text-green-300 border-green-500/40",
      warning: "bg-yellow-500/20 text-yellow-300 border-yellow-500/40",
      error: "bg-red-500/20 text-red-300 border-red-500/40",
      info: "bg-teal-500/20 text-teal-300 border-teal-500/40",
    },
  },
  cyberpunk: {
    nombre: "Cyberpunk Neon",
    icono: Zap,
    descripcion: "Estilo futurista con neones vibrantes",
    colores: {
      fondo: "from-black via-purple-950 to-pink-950",
      fondoSecundario: "bg-black",
      texto: "text-cyan-300",
      textoSecundario: "text-pink-400",
      primario: "bg-pink-600 hover:bg-pink-700",
      secundario: "bg-purple-900 hover:bg-purple-800",
      acento: "text-cyan-400",
      borde: "border-pink-500/30",
      sombra: "shadow-2xl shadow-pink-500/30",
      gradiente: "from-pink-500 via-purple-500 to-cyan-500",
      sidebar: "bg-black/95 backdrop-blur-xl border-pink-500/30",
      header: "bg-black/80 backdrop-blur-xl border-pink-500/30",
      card: "bg-purple-950/50 border-pink-500/30 hover:border-cyan-500/50",
      hover: "hover:bg-purple-900/50",
      success: "bg-green-500/20 text-green-300 border-green-500/40",
      warning: "bg-yellow-500/20 text-yellow-300 border-yellow-500/40",
      error: "bg-red-500/20 text-red-300 border-red-500/40",
      info: "bg-cyan-500/20 text-cyan-300 border-cyan-500/40",
    },
  },
  ocean: {
    nombre: "Océano Profundo",
    icono: Waves,
    descripcion: "Colores del océano para concentración",
    colores: {
      fondo: "from-blue-950 via-indigo-950 to-slate-950",
      fondoSecundario: "bg-blue-950",
      texto: "text-blue-100",
      textoSecundario: "text-blue-300",
      primario: "bg-blue-600 hover:bg-blue-700",
      secundario: "bg-slate-800 hover:bg-slate-700",
      acento: "text-blue-400",
      borde: "border-blue-800",
      sombra: "shadow-2xl shadow-blue-500/20",
      gradiente: "from-blue-500 via-indigo-500 to-purple-500",
      sidebar: "bg-blue-950/95 backdrop-blur-xl border-blue-800",
      header: "bg-blue-950/80 backdrop-blur-xl border-blue-800",
      card: "bg-slate-900/50 border-blue-800 hover:border-blue-500/50",
      hover: "hover:bg-slate-800",
      success: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
      warning: "bg-amber-500/20 text-amber-300 border-amber-500/40",
      error: "bg-rose-500/20 text-rose-300 border-rose-500/40",
      info: "bg-blue-500/20 text-blue-300 border-blue-500/40",
    },
  },
  sunset: {
    nombre: "Atardecer Cálido",
    icono: Sun,
    descripcion: "Tonos cálidos inspirados en el atardecer",
    colores: {
      fondo: "from-orange-950 via-red-950 to-pink-950",
      fondoSecundario: "bg-orange-900",
      texto: "text-orange-100",
      textoSecundario: "text-orange-300",
      primario: "bg-orange-600 hover:bg-orange-700",
      secundario: "bg-red-900 hover:bg-red-800",
      acento: "text-orange-400",
      borde: "border-orange-800",
      sombra: "shadow-2xl shadow-orange-500/20",
      gradiente: "from-orange-500 via-red-500 to-pink-500",
      sidebar: "bg-orange-950/95 backdrop-blur-xl border-orange-800",
      header: "bg-orange-950/80 backdrop-blur-xl border-orange-800",
      card: "bg-red-950/50 border-orange-800 hover:border-orange-500/50",
      hover: "hover:bg-red-900",
      success: "bg-green-500/20 text-green-300 border-green-500/40",
      warning: "bg-yellow-500/20 text-yellow-300 border-yellow-500/40",
      error: "bg-red-500/20 text-red-300 border-red-500/40",
      info: "bg-orange-500/20 text-orange-300 border-orange-500/40",
    },
  },
};

// ========================================
// 🎯 COMPONENTE PRINCIPAL
// ========================================

export default function AlertasTecnicoPage() {
  // 📊 ESTADOS PRINCIPALES
  const [usuario, setUsuario] = useState<UsuarioSesion | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingAlertas, setLoadingAlertas] = useState(true);
  const [alertas, setAlertas] = useState<AlertaTecnico[]>([]);
  const [estadisticas, setEstadisticas] = useState<EstadisticasTecnico | null>(null);
  
  // 🎨 ESTADOS DE UI
  const [temaActual, setTemaActual] = useState<TemaColor>("dark");
  const [sidebarAbierto, setSidebarAbierto] = useState(true);
  const [notificacionesAbiertas, setNotificacionesAbiertas] = useState(false);
  const [perfilAbierto, setPerfilAbierto] = useState(false);
  const [busqueda, setBusqueda] = useState("");
  const [disponibilidad, setDisponibilidad] = useState<"disponible" | "ocupado" | "fuera_servicio">("disponible");
  
  // 🔍 ESTADOS DE FILTROS
  const [filtros, setFiltros] = useState<FiltrosAlertas>({
    vista: "activas",
    tipo: "todos",
    prioridad: "todas",
    soloNoLeidas: true,
    fechaDesde: "",
    fechaHasta: "",
    ubicacion: "",
    asignado: "",
    impacto: "",
  });

  // 🔔 ESTADOS DE NOTIFICACIONES
  const [configNotificaciones, setConfigNotificaciones] = useState<ConfiguracionNotificaciones>({
    sonido: true,
    vibrar: true,
    desktop: true,
    email: false,
    sms: false,
    prioridadMinima: "media",
  });

  // 📈 ESTADOS DE VISTA
  const [vistaGrafico, setVistaGrafico] = useState<"pie" | "bar" | "line" | "area" | "radar">("pie");
  const [modoCompacto, setModoCompacto] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [intervaloRefresh, setIntervaloRefresh] = useState(180000); // 3 minutos

  const tema = useMemo(() => TEMAS[temaActual], [temaActual]);

  // ========================================
  // 🔄 EFECTOS Y CICLO DE VIDA
  // ========================================

  useEffect(() => {
    cargarConfiguracionLocal();
    cargarDatosUsuario();
  }, []);

  useEffect(() => {
    if (usuario?.tecnico) {
      cargarAlertas();
      cargarEstadisticas();
    }
  }, [usuario]);

  useEffect(() => {
    if (!autoRefresh || !usuario?.tecnico) return;

    const interval = setInterval(() => {
      cargarAlertas();
      cargarEstadisticas();
    }, intervaloRefresh);

    return () => clearInterval(interval);
  }, [usuario, autoRefresh, intervaloRefresh]);

  useEffect(() => {
    document.body.className = `bg-gradient-to-br ${tema.colores.fondo} min-h-screen transition-all duration-500`;
  }, [tema]);

  // ========================================
  // 📥 FUNCIONES DE CARGA DE DATOS
  // ========================================

  const cargarConfiguracionLocal = () => {
    if (typeof window === "undefined") return;

    const temaGuardado = localStorage.getItem("tema_tecnico") as TemaColor | null;
    if (temaGuardado && TEMAS[temaGuardado]) {
      setTemaActual(temaGuardado);
    }

    const configGuardada = localStorage.getItem("config_notificaciones");
    if (configGuardada) {
      try {
        setConfigNotificaciones(JSON.parse(configGuardada));
      } catch (e) {
        console.error("Error al cargar configuración:", e);
      }
    }

    const modoCompactoGuardado = localStorage.getItem("modo_compacto");
    if (modoCompactoGuardado) {
      setModoCompacto(modoCompactoGuardado === "true");
    }
  };

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
          mostrarNotificacion(
            "error",
            "Acceso Denegado",
            `Este panel es solo para técnicos. Tus roles: ${rolesUsuario.join(", ")}`
          );
          window.location.href = "/";
          return;
        }

        if (!result.usuario.tecnico) {
          mostrarNotificacion(
            "error",
            "Configuración Incompleta",
            "Tu usuario no está vinculado a un registro de técnico. Contacta al administrador."
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
      mostrarNotificacion("error", "Error de Sesión", "Serás redirigido al login.");
      window.location.href = "/login";
    } finally {
      setLoading(false);
    }
  };

  const cargarAlertas = async () => {
    if (!usuario?.tecnico?.id_tecnico) return;

    try {
      setLoadingAlertas(true);

      const res = await fetch(
        `/api/tecnico/alertas?id_tecnico=${usuario.tecnico.id_tecnico}`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        }
      );

      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data.success) {
        console.error("Error al cargar alertas:", data);
        return;
      }

      const nuevasAlertas = data.alertas || [];
      
      // Detectar nuevas alertas críticas
      if (alertas.length > 0) {
        const alertasCriticasNuevas = nuevasAlertas.filter(
          (alerta: AlertaTecnico) =>
            alerta.prioridad === "critica" &&
            !alerta.leida &&
            !alertas.some((a) => a.id_alerta === alerta.id_alerta)
        );

        if (alertasCriticasNuevas.length > 0) {
          notificarAlertaCritica(alertasCriticasNuevas[0]);
        }
      }

      setAlertas(nuevasAlertas);
    } catch (error) {
      console.error("Error al cargar alertas:", error);
      mostrarNotificacion("error", "Error", "No se pudieron cargar las alertas");
    } finally {
      setLoadingAlertas(false);
    }
  };

  const cargarEstadisticas = async () => {
    if (!usuario?.tecnico?.id_tecnico) return;

    try {
      const res = await fetch(
        `/api/tecnico/estadisticas?id_tecnico=${usuario.tecnico.id_tecnico}`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        }
      );

      const data = await res.json().catch(() => ({}));

      if (res.ok && data.success) {
        setEstadisticas(data.estadisticas);
      }
    } catch (error) {
      console.error("Error al cargar estadísticas:", error);
    }
  };

  // ========================================
  // 🎬 ACCIONES DE USUARIO
  // ========================================

  const cambiarDisponibilidad = async (
    nuevoEstado: "disponible" | "ocupado" | "fuera_servicio"
  ) => {
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
        mostrarNotificacion(
          "success",
          "Disponibilidad Actualizada",
          `Tu estado cambió a: ${nuevoEstado}`
        );
      } else {
        throw new Error("Error al actualizar");
      }
    } catch (error) {
      console.error("Error al cambiar disponibilidad:", error);
      mostrarNotificacion("error", "Error", "No se pudo actualizar tu disponibilidad");
    }
  };

  const marcarComoLeida = async (idAlerta: number) => {
    try {
      const res = await fetch(`/api/tecnico/alertas/${idAlerta}/leer`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      if (!res.ok) {
        throw new Error("Error al marcar como leída");
      }

      setAlertas((prev) =>
        prev.map((a) => (a.id_alerta === idAlerta ? { ...a, leida: true } : a))
      );

      mostrarNotificacion("success", "Alerta Marcada", "La alerta se marcó como leída");
    } catch (error) {
      console.error("Error al marcar alerta:", error);
      mostrarNotificacion("error", "Error", "No se pudo marcar la alerta");
    }
  };

  const marcarTodasComoLeidas = async () => {
    try {
      const res = await fetch(`/api/tecnico/alertas/marcar-todas`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          id_tecnico: usuario?.tecnico?.id_tecnico,
        }),
      });

      if (!res.ok) {
        throw new Error("Error al marcar todas");
      }

      setAlertas((prev) => prev.map((a) => ({ ...a, leida: true })));
      setFiltros((prev) => ({ ...prev, soloNoLeidas: false }));
      
      mostrarNotificacion("success", "Alertas Actualizadas", "Todas las alertas se marcaron como leídas");
    } catch (error) {
      console.error("Error al marcar todas:", error);
      mostrarNotificacion("error", "Error", "No se pudieron marcar todas las alertas");
    }
  };

  const resolverAlerta = async (idAlerta: number) => {
    try {
      const res = await fetch(`/api/tecnico/alertas/${idAlerta}/resolver`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      if (!res.ok) {
        throw new Error("Error al resolver alerta");
      }

      setAlertas((prev) =>
        prev.map((a) =>
          a.id_alerta === idAlerta ? { ...a, resuelta: true, leida: true } : a
        )
      );

      mostrarNotificacion("success", "Alerta Resuelta", "La alerta se marcó como resuelta");
      cargarEstadisticas();
    } catch (error) {
      console.error("Error al resolver alerta:", error);
      mostrarNotificacion("error", "Error", "No se pudo resolver la alerta");
    }
  };

  const exportarAlertas = async (formato: "csv" | "excel" | "pdf") => {
    try {
      mostrarNotificacion("info", "Exportando", `Generando archivo ${formato.toUpperCase()}...`);

      const res = await fetch(
        `/api/tecnico/alertas/exportar?formato=${formato}&id_tecnico=${usuario?.tecnico?.id_tecnico}`,
        {
          method: "GET",
          credentials: "include",
        }
      );

      if (!res.ok) {
        throw new Error("Error al exportar");
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `alertas_${new Date().toISOString().split("T")[0]}.${formato}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      mostrarNotificacion("success", "Exportación Completa", "El archivo se descargó correctamente");
    } catch (error) {
      console.error("Error al exportar:", error);
      mostrarNotificacion("error", "Error", "No se pudo exportar el archivo");
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

  // ========================================
  // 🔔 SISTEMA DE NOTIFICACIONES
  // ========================================

  const mostrarNotificacion = (
    tipo: "success" | "error" | "warning" | "info",
    titulo: string,
    mensaje: string
  ) => {
    // Implementar sistema de notificaciones toast
    console.log(`[${tipo.toUpperCase()}] ${titulo}: ${mensaje}`);
    
    // Notificación del navegador
    if (configNotificaciones.desktop && "Notification" in window) {
      if (Notification.permission === "granted") {
        new Notification(titulo, {
          body: mensaje,
          icon: "/logo.png",
        });
      }
    }

    // Sonido
    if (configNotificaciones.sonido) {
      reproducirSonido(tipo);
    }

    // Vibración
    if (configNotificaciones.vibrar && "vibrate" in navigator) {
      navigator.vibrate(tipo === "error" ? [200, 100, 200] : 200);
    }
  };

  const notificarAlertaCritica = (alerta: AlertaTecnico) => {
    const prioridadMinima = configNotificaciones.prioridadMinima;
    const prioridades = ["baja", "media", "alta", "critica"];
    
    if (prioridades.indexOf(alerta.prioridad) < prioridades.indexOf(prioridadMinima)) {
      return;
    }

    mostrarNotificacion(
      "error",
      "🚨 ALERTA CRÍTICA",
      `${alerta.titulo}: ${alerta.descripcion}`
    );

    // Enviar email si está configurado
    if (configNotificaciones.email) {
      enviarEmailAlerta(alerta);
    }

    // Enviar SMS si está configurado
    if (configNotificaciones.sms) {
      enviarSMSAlerta(alerta);
    }
  };

  const reproducirSonido = (tipo: string) => {
    try {
      const audio = new Audio(`/sounds/${tipo}.mp3`);
      audio.volume = 0.5;
      audio.play().catch((e) => console.log("No se pudo reproducir sonido:", e));
    } catch (e) {
      console.log("Error al reproducir sonido:", e);
    }
  };

  const enviarEmailAlerta = async (alerta: AlertaTecnico) => {
    try {
      await fetch("/api/notificaciones/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          destinatario: usuario?.email,
          asunto: `Alerta Crítica: ${alerta.titulo}`,
          contenido: alerta.descripcion,
        }),
      });
    } catch (error) {
      console.error("Error al enviar email:", error);
    }
  };

  const enviarSMSAlerta = async (alerta: AlertaTecnico) => {
    try {
      await fetch("/api/notificaciones/sms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          telefono: usuario?.tecnico?.extension_telefonica,
          mensaje: `Alerta Crítica: ${alerta.titulo}`,
        }),
      });
    } catch (error) {
      console.error("Error al enviar SMS:", error);
    }
  };

  // ========================================
  // 🛠️ FUNCIONES AUXILIARES
  // ========================================

  const formatearFecha = (fecha: string) => {
    const d = new Date(fecha);
    return new Intl.DateTimeFormat("es-CL", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    }).format(d);
  };

  const formatearFechaCompleta = (fecha: string) => {
    const d = new Date(fecha);
    return new Intl.DateTimeFormat("es-CL", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    }).format(d);
  };

  const obtenerSaludo = () => {
    const hora = new Date().getHours();
    if (hora < 6) return "Buenas madrugadas";
    if (hora < 12) return "Buenos días";
    if (hora < 19) return "Buenas tardes";
    return "Buenas noches";
  };

  const obtenerColorPrioridad = (prioridad: string) => {
    const isDark = !["light"].includes(temaActual);
    const colores: { [key: string]: string } = {
      critica: isDark
        ? "bg-red-500/20 text-red-300 border-red-500/40"
        : "bg-red-100 text-red-800 border-red-200",
      alta: isDark
        ? "bg-orange-500/20 text-orange-300 border-orange-500/40"
        : "bg-orange-100 text-orange-800 border-orange-200",
      media: isDark
        ? "bg-yellow-500/20 text-yellow-300 border-yellow-500/40"
        : "bg-yellow-100 text-yellow-800 border-yellow-200",
      baja: isDark
        ? "bg-green-500/20 text-green-300 border-green-500/40"
        : "bg-green-100 text-green-800 border-green-200",
    };

    return (
      colores[prioridad.toLowerCase()] ||
      (isDark
        ? "bg-gray-500/20 text-gray-300 border-gray-500/40"
        : "bg-gray-100 text-gray-800 border-gray-200")
    );
  };

  const obtenerIconoAlertaTipo = (tipo: AlertaTecnico["tipo"]) => {
    const iconos: { [key: string]: any } = {
      equipo_falla: HardDrive,
      mantenimiento_vencido: Wrench,
      ticket_urgente: AlertOctagon,
      equipo_critico: Cpu,
      sistema_caido: Server,
      red_lenta: WifiOff,
      backup_fallido: Database,
      seguridad_comprometida: Shield,
    };

    return iconos[tipo] || AlertCircle;
  };

  const obtenerColorImpacto = (impacto: string) => {
    const colores: { [key: string]: string } = {
      critico: "text-red-500",
      alto: "text-orange-500",
      medio: "text-yellow-500",
      bajo: "text-green-500",
    };

    return colores[impacto] || "text-gray-500";
  };

  // ========================================
  // 📊 DATOS DERIVADOS Y CÁLCULOS
  // ========================================

  const resumenAlertas: ResumenAlertas = useMemo(() => {
    const total = alertas.length;
    const activas = alertas.filter((a) => !a.resuelta).length;
    const criticas = alertas.filter((a) => a.prioridad === "critica" && !a.resuelta).length;
    const mantenimientoVencido = alertas.filter(
      (a) => a.tipo === "mantenimiento_vencido" && !a.resuelta
    ).length;
    const equiposFalla = alertas.filter(
      (a) => a.tipo === "equipo_falla" && !a.resuelta
    ).length;
    const ticketsUrgentes = alertas.filter(
      (a) => a.tipo === "ticket_urgente" && !a.resuelta
    ).length;
    
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const resueltasHoy = alertas.filter((a) => {
      if (!a.resuelta || !a.fecha_actualizacion) return false;
      const fechaResolucion = new Date(a.fecha_actualizacion);
      fechaResolucion.setHours(0, 0, 0, 0);
      return fechaResolucion.getTime() === hoy.getTime();
    }).length;

    const tiemposResolucion = alertas
      .filter((a) => a.resuelta && a.fecha_actualizacion && a.fecha_creacion)
      .map((a) => {
        const inicio = new Date(a.fecha_creacion).getTime();
        const fin = new Date(a.fecha_actualizacion).getTime();
        return (fin - inicio) / (1000 * 60); // minutos
      });

    const tiempoPromedioResolucion =
      tiemposResolucion.length > 0
        ? tiemposResolucion.reduce((a, b) => a + b, 0) / tiemposResolucion.length
        : 0;

    return {
      total,
      activas,
      criticas,
      mantenimientoVencido,
      equiposFalla,
      ticketsUrgentes,
      resueltasHoy,
      tiempoPromedioResolucion,
    };
  }, [alertas]);

  const alertasFiltradas = useMemo(() => {
    let data = [...alertas];

    // Vista
    if (filtros.vista === "activas") {
      data = data.filter((a) => !a.resuelta);
    } else if (filtros.vista === "resueltas") {
      data = data.filter((a) => a.resuelta);
    }

    // Tipo
    if (filtros.tipo !== "todos") {
      data = data.filter((a) => a.tipo === filtros.tipo);
    }

    // Prioridad
    if (filtros.prioridad !== "todas") {
      data = data.filter((a) => a.prioridad === filtros.prioridad);
    }

    // Solo no leídas
    if (filtros.soloNoLeidas) {
      data = data.filter((a) => !a.leida);
    }

    // Impacto
    if (filtros.impacto) {
      data = data.filter((a) => a.impacto_estimado === filtros.impacto);
    }

    // Ubicación
    if (filtros.ubicacion) {
      data = data.filter((a) =>
        a.ubicacion?.toLowerCase().includes(filtros.ubicacion.toLowerCase())
      );
    }

    // Fechas
    if (filtros.fechaDesde) {
      const desde = new Date(filtros.fechaDesde).getTime();
      data = data.filter((a) => new Date(a.fecha_creacion).getTime() >= desde);
    }

    if (filtros.fechaHasta) {
      const hasta = new Date(filtros.fechaHasta).getTime();
      data = data.filter((a) => new Date(a.fecha_creacion).getTime() <= hasta);
    }

    // Búsqueda
    if (busqueda.trim()) {
      const q = busqueda.toLowerCase();
      data = data.filter(
        (a) =>
          a.titulo.toLowerCase().includes(q) ||
          a.descripcion.toLowerCase().includes(q) ||
          a.tipo.toLowerCase().includes(q) ||
          a.prioridad.toLowerCase().includes(q) ||
          a.nombre_equipo?.toLowerCase().includes(q) ||
          a.ubicacion?.toLowerCase().includes(q)
      );
    }

    // Ordenar por fecha (más reciente primero)
    data.sort(
      (a, b) =>
        new Date(b.fecha_creacion).getTime() - new Date(a.fecha_creacion).getTime()
    );

    return data;
  }, [alertas, filtros, busqueda]);

  const datosPorPrioridad = useMemo(
    () => [
      {
        nombre: "Crítica",
        valor: alertas.filter((a) => a.prioridad === "critica" && !a.resuelta).length,
        color: "#ef4444",
      },
      {
        nombre: "Alta",
        valor: alertas.filter((a) => a.prioridad === "alta" && !a.resuelta).length,
        color: "#f97316",
      },
      {
        nombre: "Media",
        valor: alertas.filter((a) => a.prioridad === "media" && !a.resuelta).length,
        color: "#eab308",
      },
      {
        nombre: "Baja",
        valor: alertas.filter((a) => a.prioridad === "baja" && !a.resuelta).length,
        color: "#22c55e",
      },
    ],
    [alertas]
  );

  const datosPorTipo = useMemo(
    () => [
      {
        nombre: "Equipos en falla",
        valor: alertas.filter((a) => a.tipo === "equipo_falla" && !a.resuelta).length,
        color: "#ef4444",
      },
      {
        nombre: "Mantenimiento vencido",
        valor: alertas.filter((a) => a.tipo === "mantenimiento_vencido" && !a.resuelta)
          .length,
        color: "#f59e0b",
      },
      {
        nombre: "Tickets urgentes",
        valor: alertas.filter((a) => a.tipo === "ticket_urgente" && !a.resuelta).length,
        color: "#3b82f6",
      },
      {
        nombre: "Equipos críticos",
        valor: alertas.filter((a) => a.tipo === "equipo_critico" && !a.resuelta).length,
        color: "#8b5cf6",
      },
      {
        nombre: "Sistema caído",
        valor: alertas.filter((a) => a.tipo === "sistema_caido" && !a.resuelta).length,
        color: "#dc2626",
      },
      {
        nombre: "Red lenta",
        valor: alertas.filter((a) => a.tipo === "red_lenta" && !a.resuelta).length,
        color: "#f97316",
      },
    ],
    [alertas]
  );

  const datosEvolucionAlertas = useMemo(() => {
    const ultimos7Dias = Array.from({ length: 7 }, (_, i) => {
      const fecha = new Date();
      fecha.setDate(fecha.getDate() - (6 - i));
      fecha.setHours(0, 0, 0, 0);
      return fecha;
    });

    return ultimos7Dias.map((fecha) => {
      const fechaStr = fecha.toISOString().split("T")[0];
      const alertasDia = alertas.filter((a) => {
        const fechaAlerta = new Date(a.fecha_creacion);
        fechaAlerta.setHours(0, 0, 0, 0);
        return fechaAlerta.toISOString().split("T")[0] === fechaStr;
      });

      return {
        fecha: new Intl.DateTimeFormat("es-CL", {
          day: "numeric",
          month: "short",
        }).format(fecha),
        total: alertasDia.length,
        criticas: alertasDia.filter((a) => a.prioridad === "critica").length,
        resueltas: alertasDia.filter((a) => a.resuelta).length,
      };
    });
  }, [alertas]);

  const datosRadar = useMemo(() => {
    return [
      {
        categoria: "Equipos",
        valor: alertas.filter((a) => a.tipo.includes("equipo") && !a.resuelta).length,
        maximo: 10,
      },
      {
        categoria: "Mantenimiento",
        valor: alertas.filter((a) => a.tipo === "mantenimiento_vencido" && !a.resuelta)
          .length,
        maximo: 10,
      },
      {
        categoria: "Tickets",
        valor: alertas.filter((a) => a.tipo === "ticket_urgente" && !a.resuelta).length,
        maximo: 10,
      },
      {
        categoria: "Sistemas",
        valor: alertas.filter((a) => a.tipo === "sistema_caido" && !a.resuelta).length,
        maximo: 10,
      },
      {
        categoria: "Red",
        valor: alertas.filter((a) => a.tipo === "red_lenta" && !a.resuelta).length,
        maximo: 10,
      },
      {
        categoria: "Seguridad",
        valor: alertas.filter((a) => a.tipo === "seguridad_comprometida" && !a.resuelta)
          .length,
        maximo: 10,
      },
    ];
  }, [alertas]);

  // ========================================
  // 🎨 RENDER - LOADING
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
              <AlertOctagon className="w-10 h-10 text-white" />
            </div>
          </div>
          <h2 className={`text-4xl font-black mb-4 ${tema.colores.texto}`}>
            Cargando Centro de Alertas
          </h2>
          <p
            className={`text-lg font-semibold ${tema.colores.textoSecundario} animate-pulse`}
          >
            Sincronizando alertas críticas de tu infraestructura...
          </p>
          <div className="mt-8 flex items-center justify-center gap-2">
            <div
              className={`w-3 h-3 rounded-full bg-gradient-to-r ${tema.colores.gradiente} animate-bounce`}
              style={{ animationDelay: "0ms" }}
            ></div>
            <div
              className={`w-3 h-3 rounded-full bg-gradient-to-r ${tema.colores.gradiente} animate-bounce`}
              style={{ animationDelay: "150ms" }}
            ></div>
            <div
              className={`w-3 h-3 rounded-full bg-gradient-to-r ${tema.colores.gradiente} animate-bounce`}
              style={{ animationDelay: "300ms" }}
            ></div>
          </div>
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
            No tienes permisos para acceder al centro de alertas técnicas.
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
  // 🎨 RENDER PRINCIPAL
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
                placeholder="Buscar alerta por título, tipo, equipo, ubicación..."
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
            {/* Auto-refresh toggle */}
            <div className="relative group">
              <button
                onClick={() => setAutoRefresh(!autoRefresh)}
                className={`p-3 rounded-xl font-semibold transition-all duration-300 ${
                  autoRefresh
                    ? `bg-gradient-to-r ${tema.colores.gradiente} text-white`
                    : `${tema.colores.secundario} ${tema.colores.texto}`
                }`}
                title={autoRefresh ? "Desactivar auto-actualización" : "Activar auto-actualización"}
              >
                <RefreshCw className={`w-5 h-5 ${autoRefresh ? "animate-spin-slow" : ""}`} />
              </button>

              <div
                className={`absolute right-0 mt-2 w-64 rounded-2xl ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 p-4`}
              >
                <p className={`text-sm font-bold mb-3 ${tema.colores.texto}`}>
                  Auto-actualización
                </p>
                <div className="space-y-2">
                  <button
                    onClick={() => setIntervaloRefresh(60000)}
                    className={`w-full px-3 py-2 rounded-lg text-sm font-semibold transition-all ${
                      intervaloRefresh === 60000
                        ? `bg-gradient-to-r ${tema.colores.gradiente} text-white`
                        : `${tema.colores.hover} ${tema.colores.texto}`
                    }`}
                  >
                    1 minuto
                  </button>
                  <button
                    onClick={() => setIntervaloRefresh(180000)}
                    className={`w-full px-3 py-2 rounded-lg text-sm font-semibold transition-all ${
                      intervaloRefresh === 180000
                        ? `bg-gradient-to-r ${tema.colores.gradiente} text-white`
                        : `${tema.colores.hover} ${tema.colores.texto}`
                    }`}
                  >
                    3 minutos
                  </button>
                  <button
                    onClick={() => setIntervaloRefresh(300000)}
                    className={`w-full px-3 py-2 rounded-lg text-sm font-semibold transition-all ${
                      intervaloRefresh === 300000
                        ? `bg-gradient-to-r ${tema.colores.gradiente} text-white`
                        : `${tema.colores.hover} ${tema.colores.texto}`
                    }`}
                  >
                    5 minutos
                  </button>
                </div>
              </div>
            </div>

            {/* Selector de tema */}
            <div className="relative group">
              <button
                className={`p-3 rounded-xl font-semibold transition-all duration-300 ${tema.colores.secundario} ${tema.colores.texto}`}
              >
                <Sparkles className="w-5 h-5" />
              </button>

              <div
                className={`absolute right-0 mt-2 w-72 rounded-2xl ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 p-4 space-y-2 max-h-96 overflow-y-auto custom-scrollbar`}
              >
                <p className={`text-sm font-bold mb-3 ${tema.colores.texto}`}>
                  🎨 Seleccionar Tema
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
                      <div className="text-left">
                        <p className="font-bold">{t.nombre}</p>
                        <p className="text-xs opacity-80">{t.descripcion}</p>
                      </div>
                    </div>
                    {temaActual === key && <Check className="w-5 h-5" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Notificaciones */}
            <div className="relative">
              <button
                onClick={() => setNotificacionesAbiertas(!notificacionesAbiertas)}
                className={`relative p-3 rounded-xl font-semibold transition-all duration-300 ${tema.colores.secundario} ${tema.colores.texto}`}
              >
                <Bell className="w-5 h-5" />
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
                  className={`absolute right-0 mt-2 w-96 rounded-2xl ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} max-h-[500px] overflow-hidden`}
                >
                  <div
                    className={`p-4 border-b ${tema.colores.borde} sticky top-0 ${tema.colores.card} backdrop-blur-xl`}
                  >
                    <div className="flex items-center justify-between">
                      <h3 className={`text-lg font-black ${tema.colores.texto}`}>
                        🔔 Últimas Alertas
                      </h3>
                      <button
                        onClick={() => setNotificacionesAbiertas(false)}
                        className={`p-1 rounded-lg ${tema.colores.hover}`}
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="max-h-96 overflow-y-auto custom-scrollbar">
                    {alertas.length === 0 ? (
                      <div className="p-8 text-center">
                        <BellOff
                          className={`w-12 h-12 mx-auto mb-3 ${tema.colores.textoSecundario}`}
                        />
                        <p className={`text-sm ${tema.colores.textoSecundario}`}>
                          No tienes alertas registradas
                        </p>
                      </div>
                    ) : (
                      <div className={`divide-y ${tema.colores.borde}`}>
                        {alertas
                          .filter((a) => !a.leida)
                          .slice(0, 10)
                          .sort(
                            (a, b) =>
                              new Date(b.fecha_creacion).getTime() -
                              new Date(a.fecha_creacion).getTime()
                          )
                          .map((alerta) => {
                            const Icono = obtenerIconoAlertaTipo(alerta.tipo);
                            return (
                              <div
                                key={alerta.id_alerta}
                                onClick={() => marcarComoLeida(alerta.id_alerta)}
                                className={`p-4 ${tema.colores.hover} transition-all cursor-pointer ${
                                  !alerta.leida ? "bg-indigo-500/5" : ""
                                }`}
                              >
                                <div className="flex items-start gap-3">
                                  <div
                                    className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${obtenerColorPrioridad(
                                      alerta.prioridad
                                    )}`}
                                  >
                                    <Icono className="w-5 h-5" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p
                                      className={`text-sm font-bold mb-1 ${tema.colores.texto}`}
                                    >
                                      {alerta.titulo}
                                    </p>
                                    <p
                                      className={`text-xs mb-1 ${tema.colores.textoSecundario} line-clamp-2`}
                                    >
                                      {alerta.descripcion}
                                    </p>
                                    <div className="flex items-center gap-2">
                                      <span
                                        className={`text-xs font-medium ${tema.colores.textoSecundario}`}
                                      >
                                        {formatearFecha(alerta.fecha_creacion)}
                                      </span>
                                      {alerta.nombre_equipo && (
                                        <span
                                          className={`text-xs px-2 py-0.5 rounded-full ${tema.colores.info}`}
                                        >
                                          {alerta.nombre_equipo}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                      </div>
                    )}
                  </div>

                  {alertas.filter((a) => !a.leida).length > 0 && (
                    <div className={`p-3 border-t ${tema.colores.borde}`}>
                      <button
                        onClick={marcarTodasComoLeidas}
                        className={`w-full px-4 py-2 rounded-xl font-semibold text-sm transition-all duration-300 ${tema.colores.primario} text-white hover:scale-105`}
                      >
                        Marcar todas como leídas
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Disponibilidad */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => cambiarDisponibilidad("disponible")}
                className={`px-4 py-2 rounded-xl font-semibold text-sm transition-all duration-300 flex items-center gap-2 ${
                  disponibilidad === "disponible"
                    ? "bg-green-600 text-white shadow-lg shadow-green-500/50"
                    : `${tema.colores.secundario} ${tema.colores.texto}`
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                Disponible
              </button>
              <button
                onClick={() => cambiarDisponibilidad("ocupado")}
                className={`px-4 py-2 rounded-xl font-semibold text-sm transition-all duration-300 flex items-center gap-2 ${
                  disponibilidad === "ocupado"
                    ? "bg-yellow-600 text-white shadow-lg shadow-yellow-500/50"
                    : `${tema.colores.secundario} ${tema.colores.texto}`
                }`}
              >
                <Clock className="w-4 h-4" />
                Ocupado
              </button>
              <button
                onClick={() => cambiarDisponibilidad("fuera_servicio")}
                className={`px-4 py-2 rounded-xl font-semibold text-sm transition-all duration-300 flex items-center gap-2 ${
                  disponibilidad === "fuera_servicio"
                    ? "bg-red-600 text-white shadow-lg shadow-red-500/50"
                    : `${tema.colores.secundario} ${tema.colores.texto}`
                }`}
              >
                <PowerOff className="w-4 h-4" />
                Fuera
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
                    {usuario.tecnico?.tipo_tecnico}
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
                      <p className={`text-lg font-black ${tema.colores.texto}`}>
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
                        {usuario.tecnico?.centro?.nombre ?? "Sin centro"}
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
                      href="/tecnico/estadisticas"
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all duration-300 ${tema.colores.hover} ${tema.colores.texto}`}
                    >
                      <BarChart3 className="w-5 h-5" />
                      <span>Mis Estadísticas</span>
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

      {/* MAIN CONTENT */}
      <main
        className={`transition-all duration-300 ${
          sidebarAbierto ? "ml-72" : "ml-20"
        } pt-24 p-8`}
      >
        {/* Encabezado con saludo */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2
                className={`text-5xl font-black mb-2 ${tema.colores.texto} flex items-center gap-3`}
              >
                {obtenerSaludo()}, {usuario.nombre}
                <span className="animate-wave inline-block">🚨</span>
              </h2>
              <p className={`text-xl font-semibold ${tema.colores.textoSecundario}`}>
                Centro Avanzado de Monitoreo y Alertas Técnicas
              </p>
              {usuario.tecnico && (
                <div className="flex items-center gap-4 mt-3">
                  <p
                    className={`text-sm font-semibold ${tema.colores.textoSecundario} flex items-center gap-2`}
                  >
                    <MapPin className="w-4 h-4" />
                    {usuario.tecnico.centro?.nombre ?? "Centro no definido"} •{" "}
                    {usuario.tecnico.area_tecnica ?? "Área no definida"}
                  </p>
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-2 h-2 rounded-full ${
                        disponibilidad === "disponible"
                          ? "bg-green-500 animate-pulse"
                          : disponibilidad === "ocupado"
                          ? "bg-yellow-500 animate-pulse"
                          : "bg-red-500"
                      }`}
                    ></div>
                    <span className={`text-sm font-semibold ${tema.colores.textoSecundario}`}>
                      {disponibilidad === "disponible"
                        ? "Disponible"
                        : disponibilidad === "ocupado"
                        ? "Ocupado"
                        : "Fuera de servicio"}
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div className="flex flex-col items-end gap-3">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => cargarAlertas()}
                  disabled={loadingAlertas}
                  className={`flex items-center gap-2 px-6 py-3 ${tema.colores.primario} text-white rounded-xl font-bold transition-all duration-300 hover:scale-105 ${tema.colores.sombra} disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  <RefreshCw
                    className={`w-5 h-5 ${loadingAlertas ? "animate-spin" : ""}`}
                  />
                  Actualizar
                </button>

                <div className="relative group">
                  <button
                    className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all duration-300 ${tema.colores.secundario} ${tema.colores.texto}`}
                  >
                    <Download className="w-5 h-5" />
                    Exportar
                  </button>

                  <div
                    className={`absolute right-0 mt-2 w-48 rounded-2xl ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 p-2`}
                  >
                    <button
                      onClick={() => exportarAlertas("csv")}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all ${tema.colores.hover} ${tema.colores.texto}`}
                    >
                      <FileSpreadsheet className="w-4 h-4" />
                      Exportar CSV
                    </button>
                    <button
                      onClick={() => exportarAlertas("excel")}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all ${tema.colores.hover} ${tema.colores.texto}`}
                    >
                      <FileText className="w-4 h-4" />
                      Exportar Excel
                    </button>
                    <button
                      onClick={() => exportarAlertas("pdf")}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all ${tema.colores.hover} ${tema.colores.texto}`}
                    >
                      <FileDown className="w-4 h-4" />
                      Exportar PDF
                    </button>
                  </div>
                </div>
              </div>

              <button
                onClick={marcarTodasComoLeidas}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 ${tema.colores.secundario} ${tema.colores.texto}`}
              >
                <CheckCircle2 className="w-4 h-4" />
                Marcar todas como leídas
              </button>
            </div>
          </div>
        </div>

        {/* Tarjetas de resumen */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-6 mb-8">
          {/* Total */}
          <div
            className={`rounded-2xl p-6 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} transition-all duration-300 hover:scale-105 hover:-translate-y-1 cursor-pointer group`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <AlertCircle className="w-6 h-6 text-white" />
              </div>
              <PieChart className="w-5 h-5 text-indigo-400" />
            </div>
            <div className={`text-4xl font-black mb-1 ${tema.colores.texto}`}>
              {resumenAlertas.total}
            </div>
            <div
              className={`text-xs font-bold uppercase tracking-wider ${tema.colores.textoSecundario}`}
            >
              Total Alertas
            </div>
          </div>

          {/* Activas */}
          <div
            className={`rounded-2xl p-6 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} transition-all duration-300 hover:scale-105 hover:-translate-y-1 cursor-pointer group`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-orange-500 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <AlertOctagon className="w-6 h-6 text-white" />
              </div>
              <Activity className="w-5 h-5 text-red-400" />
            </div>
            <div className={`text-4xl font-black mb-1 ${tema.colores.texto}`}>
              {resumenAlertas.activas}
            </div>
            <div
              className={`text-xs font-bold uppercase tracking-wider ${tema.colores.textoSecundario}`}
            >
              Activas Ahora
            </div>
          </div>

          {/* Críticas */}
          <div
            className={`rounded-2xl p-6 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} transition-all duration-300 hover:scale-105 hover:-translate-y-1 cursor-pointer group`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-rose-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <Flame className="w-6 h-6 text-white" />
              </div>
              <ArrowUpRight className="w-5 h-5 text-rose-400" />
            </div>
            <div className={`text-4xl font-black mb-1 ${tema.colores.texto}`}>
              {resumenAlertas.criticas}
            </div>
            <div
              className={`text-xs font-bold uppercase tracking-wider ${tema.colores.textoSecundario}`}
            >
              Críticas
            </div>
          </div>

          {/* Mantenimiento */}
          <div
            className={`rounded-2xl p-6 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} transition-all duration-300 hover:scale-105 hover:-translate-y-1 cursor-pointer group`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-yellow-500 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <Wrench className="w-6 h-6 text-white" />
              </div>
              <CalendarClock className="w-5 h-5 text-amber-300" />
            </div>
            <div className={`text-4xl font-black mb-1 ${tema.colores.texto}`}>
              {resumenAlertas.mantenimientoVencido}
            </div>
            <div
              className={`text-xs font-bold uppercase tracking-wider ${tema.colores.textoSecundario}`}
            >
              Mantenciones
            </div>
          </div>

          {/* Equipos en falla */}
          <div
            className={`rounded-2xl p-6 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} transition-all duration-300 hover:scale-105 hover:-translate-y-1 cursor-pointer group`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <HardDrive className="w-6 h-6 text-white" />
              </div>
              <Server className="w-5 h-5 text-blue-400" />
            </div>
            <div className={`text-4xl font-black mb-1 ${tema.colores.texto}`}>
              {resumenAlertas.equiposFalla}
            </div>
            <div
              className={`text-xs font-bold uppercase tracking-wider ${tema.colores.textoSecundario}`}
            >
              Equipos Falla
            </div>
          </div>

          {/* Resueltas hoy */}
          <div
            className={`rounded-2xl p-6 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} transition-all duration-300 hover:scale-105 hover:-translate-y-1 cursor-pointer group`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <CheckCircle2 className="w-6 h-6 text-white" />
              </div>
              <TrendingUp className="w-5 h-5 text-green-400" />
            </div>
            <div className={`text-4xl font-black mb-1 ${tema.colores.texto}`}>
              {resumenAlertas.resueltasHoy}
            </div>
            <div
              className={`text-xs font-bold uppercase tracking-wider ${tema.colores.textoSecundario}`}
            >
              Resueltas Hoy
            </div>
          </div>
        </div>

        {/* Panel de filtros avanzados */}
        <div
          className={`rounded-2xl p-5 mb-8 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra}`}
        >
          <div className="flex flex-wrap gap-4 items-center justify-between">
            {/* Vista */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setFiltros({ ...filtros, vista: "activas" })}
                className={`px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 transition-all duration-300 ${
                  filtros.vista === "activas"
                    ? "bg-red-600 text-white shadow-lg shadow-red-500/50"
                    : `${tema.colores.secundario} ${tema.colores.texto}`
                }`}
              >
                <AlertCircle className="w-4 h-4" />
                Activas ({resumenAlertas.activas})
              </button>
              <button
                onClick={() => setFiltros({ ...filtros, vista: "resueltas" })}
                className={`px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 transition-all duration-300 ${
                  filtros.vista === "resueltas"
                    ? "bg-green-600 text-white shadow-lg shadow-green-500/50"
                    : `${tema.colores.secundario} ${tema.colores.texto}`
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                Resueltas
              </button>
              <button
                onClick={() => setFiltros({ ...filtros, vista: "todas" })}
                className={`px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 transition-all duration-300 ${
                  filtros.vista === "todas"
                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/50"
                    : `${tema.colores.secundario} ${tema.colores.texto}`
                }`}
              >
                <Layers className="w-4 h-4" />
                Todas ({resumenAlertas.total})
              </button>
            </div>

            {/* Filtros adicionales */}
            <div className="flex flex-wrap gap-3 items-center">
              <select
                value={filtros.tipo}
                onChange={(e) => setFiltros({ ...filtros, tipo: e.target.value })}
                className={`px-4 py-2 rounded-xl ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto} text-sm font-semibold cursor-pointer`}
              >
                <option value="todos">📋 Todos los tipos</option>
                <option value="equipo_falla">💻 Equipo en falla</option>
                <option value="mantenimiento_vencido">🔧 Mantenimiento vencido</option>
                <option value="ticket_urgente">🚨 Ticket urgente</option>
                <option value="equipo_critico">⚠️ Equipo crítico</option>
                <option value="sistema_caido">🔴 Sistema caído</option>
                <option value="red_lenta">📶 Red lenta</option>
                <option value="backup_fallido">💾 Backup fallido</option>
                <option value="seguridad_comprometida">🛡️ Seguridad comprometida</option>
              </select>

              <select
                value={filtros.prioridad}
                onChange={(e) => setFiltros({ ...filtros, prioridad: e.target.value })}
                className={`px-4 py-2 rounded-xl ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto} text-sm font-semibold cursor-pointer`}
              >
                <option value="todas">🎯 Todas las prioridades</option>
                <option value="critica">🔴 Crítica</option>
                <option value="alta">🟠 Alta</option>
                <option value="media">🟡 Media</option>
                <option value="baja">🟢 Baja</option>
              </select>

              <button
                onClick={() =>
                  setFiltros({ ...filtros, soloNoLeidas: !filtros.soloNoLeidas })
                }
                className={`px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 transition-all duration-300 ${
                  filtros.soloNoLeidas
                    ? "bg-emerald-600 text-white shadow-lg shadow-emerald-500/50"
                    : `${tema.colores.secundario} ${tema.colores.texto}`
                }`}
              >
                {filtros.soloNoLeidas ? (
                  <Eye className="w-4 h-4" />
                ) : (
                  <EyeOff className="w-4 h-4" />
                )}
                {filtros.soloNoLeidas ? "Solo no leídas" : "Incluir leídas"}
              </button>

              <button
                onClick={() => setModoCompacto(!modoCompacto)}
                className={`px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 transition-all duration-300 ${
                  modoCompacto
                    ? `bg-gradient-to-r ${tema.colores.gradiente} text-white`
                    : `${tema.colores.secundario} ${tema.colores.texto}`
                }`}
              >
                {modoCompacto ? (
                  <Maximize2 className="w-4 h-4" />
                ) : (
                  <Minimize2 className="w-4 h-4" />
                )}
                {modoCompacto ? "Vista completa" : "Vista compacta"}
              </button>
            </div>
          </div>

          {/* Filtros avanzados colapsables */}
          <details className="mt-4">
            <summary
              className={`cursor-pointer font-bold ${tema.colores.texto} flex items-center gap-2 hover:${tema.colores.acento} transition-colors`}
            >
              <Filter className="w-4 h-4" />
              Filtros Avanzados
            </summary>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              <div>
                <label
                  className={`block text-sm font-semibold mb-2 ${tema.colores.texto}`}
                >
                  📅 Fecha desde
                </label>
                <input
                  type="date"
                  value={filtros.fechaDesde}
                  onChange={(e) =>
                    setFiltros({ ...filtros, fechaDesde: e.target.value })
                  }
                  className={`w-full px-4 py-2 rounded-xl ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto}`}
                />
              </div>

              <div>
                <label
                  className={`block text-sm font-semibold mb-2 ${tema.colores.texto}`}
                >
                  📅 Fecha hasta
                </label>
                <input
                  type="date"
                  value={filtros.fechaHasta}
                  onChange={(e) =>
                    setFiltros({ ...filtros, fechaHasta: e.target.value })
                  }
                  className={`w-full px-4 py-2 rounded-xl ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto}`}
                />
              </div>

              <div>
                <label
                  className={`block text-sm font-semibold mb-2 ${tema.colores.texto}`}
                >
                  📍 Ubicación
                </label>
                <input
                  type="text"
                  placeholder="Filtrar por ubicación..."
                  value={filtros.ubicacion}
                  onChange={(e) =>
                    setFiltros({ ...filtros, ubicacion: e.target.value })
                  }
                  className={`w-full px-4 py-2 rounded-xl ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto} placeholder:${tema.colores.textoSecundario}`}
                />
              </div>
            </div>

            <div className="flex gap-2 mt-4">
              <button
                onClick={() =>
                  setFiltros({
                    vista: "activas",
                    tipo: "todos",
                    prioridad: "todas",
                    soloNoLeidas: true,
                    fechaDesde: "",
                    fechaHasta: "",
                    ubicacion: "",
                    asignado: "",
                    impacto: "",
                  })
                }
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${tema.colores.secundario} ${tema.colores.texto}`}
              >
                Limpiar filtros
              </button>
            </div>
          </details>
        </div>

        {/* Contenido principal: Lista + Gráficos */}
        {loadingAlertas ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <Loader2 className="w-16 h-16 animate-spin text-indigo-500 mx-auto mb-4" />
              <p className={`text-lg font-semibold ${tema.colores.textoSecundario}`}>
                Cargando alertas técnicas...
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
            {/* Lista de alertas */}
            <div
              className={`lg:col-span-2 rounded-2xl p-6 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra}`}
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-14 h-14 bg-gradient-to-br ${tema.colores.gradiente} rounded-xl flex items-center justify-center shadow-lg`}
                  >
                    <AlertOctagon className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h3 className={`text-2xl font-black ${tema.colores.texto}`}>
                      🚨 Alertas en Tiempo Real
                    </h3>
                    <p className={`text-sm font-semibold ${tema.colores.textoSecundario}`}>
                      {alertasFiltradas.length} alertas según los filtros aplicados
                    </p>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-1 text-xs">
                  <p className={tema.colores.textoSecundario}>
                    Total: <span className="font-bold">{resumenAlertas.total}</span>
                  </p>
                  <p className={tema.colores.textoSecundario}>
                    Activas: <span className="font-bold">{resumenAlertas.activas}</span>
                  </p>
                  <p className={tema.colores.textoSecundario}>
                    Última actualización:{" "}
                    <span className="font-bold">
                      {new Date().toLocaleTimeString("es-CL", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </p>
                </div>
              </div>

              <div
                className={`space-y-4 ${
                  modoCompacto ? "max-h-[500px]" : "max-h-[700px]"
                } overflow-y-auto custom-scrollbar pr-2`}
              >
                {alertasFiltradas.length === 0 ? (
                  <div className="text-center py-16">
                    <div
                      className={`w-24 h-24 bg-gradient-to-br ${tema.colores.gradiente} rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse`}
                    >
                      <AlertCircle className="w-12 h-12 text-white" />
                    </div>
                    <p className={`text-xl font-bold ${tema.colores.texto} mb-2`}>
                      ✅ Sin alertas para los filtros actuales
                    </p>
                    <p className={`text-sm ${tema.colores.textoSecundario}`}>
                      Ajusta los filtros o espera nuevas alertas del sistema.
                    </p>
                  </div>
                ) : (
                  alertasFiltradas.map((alerta) => {
                    const Icono = obtenerIconoAlertaTipo(alerta.tipo);

                    return (
                      <div
                        key={alerta.id_alerta}
                        className={`${
                          modoCompacto ? "p-4" : "p-5"
                        } rounded-2xl ${tema.colores.card} ${tema.colores.borde} border transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1 ${
                          tema.colores.sombra
                        } group ${!alerta.leida ? "ring-2 ring-indigo-500/50" : ""}`}
                      >
                        <div className="flex items-start gap-4">
                          {/* Icono */}
                          <div
                            className={`relative ${
                              modoCompacto ? "w-12 h-12" : "w-16 h-16"
                            } rounded-xl bg-gradient-to-br ${
                              tema.colores.gradiente
                            } flex items-center justify-center text-white font-bold text-xl shadow-lg flex-shrink-0 group-hover:scale-110 transition-transform`}
                          >
                            <Icono className={modoCompacto ? "w-6 h-6" : "w-8 h-8"} />
                            {!alerta.leida && (
                              <div className="absolute -top-2 -right-2 w-7 h-7 bg-red-600 rounded-full flex items-center justify-center shadow-lg animate-pulse">
                                <Zap className="w-4 h-4 text-white" />
                              </div>
                            )}
                          </div>

                          {/* Info alerta */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex-1">
                                <h4
                                  className={`${
                                    modoCompacto ? "text-base" : "text-lg"
                                  } font-black ${tema.colores.texto} mb-1`}
                                >
                                  {alerta.titulo}
                                </h4>
                                <div className="flex flex-wrap items-center gap-2">
                                  <span
                                    className={`px-3 py-1 rounded-full text-xs font-bold border ${obtenerColorPrioridad(
                                      alerta.prioridad
                                    )}`}
                                  >
                                    {alerta.prioridad.toUpperCase()}
                                  </span>
                                  <span
                                    className={`px-3 py-1 rounded-full text-xs font-bold border ${
                                      alerta.leida
                                        ? tema.colores.success
                                        : "bg-red-500/10 text-red-400 border-red-500/40"
                                    }`}
                                  >
                                    {alerta.leida ? "✓ Leída" : "● No leída"}
                                  </span>
                                  <span
                                    className={`px-3 py-1 rounded-full text-xs font-bold border ${
                                      alerta.resuelta
                                        ? tema.colores.success
                                        : tema.colores.warning
                                    }`}
                                  >
                                    {alerta.resuelta ? "✓ Resuelta" : "⏳ Pendiente"}
                                  </span>
                                  {alerta.nombre_equipo && (
                                    <span
                                      className={`px-3 py-1 rounded-full text-xs font-bold border ${tema.colores.info}`}
                                    >
                                      🖥️ {alerta.nombre_equipo}
                                    </span>
                                  )}
                                </div>
                              </div>
                              <p
                                className={`text-xs font-medium ${tema.colores.textoSecundario} ml-2`}
                              >
                                {formatearFecha(alerta.fecha_creacion)}
                              </p>
                            </div>

                            {!modoCompacto && (
                              <p
                                className={`text-sm mb-3 ${tema.colores.textoSecundario} line-clamp-2`}
                              >
                                {alerta.descripcion}
                              </p>
                            )}

                            {alerta.ubicacion && (
                              <p
                                className={`text-xs mb-2 ${tema.colores.textoSecundario} flex items-center gap-1`}
                              >
                                <MapPin className="w-3 h-3" />
                                {alerta.ubicacion}
                              </p>
                            )}

                            {alerta.impacto_estimado && (
                              <p
                                className={`text-xs mb-2 flex items-center gap-1 ${obtenerColorImpacto(
                                  alerta.impacto_estimado
                                )}`}
                              >
                                <Target className="w-3 h-3" />
                                Impacto: {alerta.impacto_estimado}
                              </p>
                            )}

                            <div className="flex flex-wrap items-center gap-2 mt-3">
                              {!alerta.leida && (
                                <button
                                  onClick={() => marcarComoLeida(alerta.id_alerta)}
                                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl font-semibold text-xs transition-all duration-300 hover:scale-105 flex items-center gap-2 shadow-lg"
                                >
                                  <Eye className="w-4 h-4" />
                                  Marcar leída
                                </button>
                              )}

                              {!alerta.resuelta && (
                                <button
                                  onClick={() => resolverAlerta(alerta.id_alerta)}
                                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold text-xs transition-all duration-300 hover:scale-105 flex items-center gap-2 shadow-lg"
                                >
                                  <CheckCircle2 className="w-4 h-4" />
                                  Resolver
                                </button>
                              )}

                              {alerta.url_accion && (
                                <Link
                                  href={alerta.url_accion}
                                  className={`px-4 py-2 ${tema.colores.primario} text-white rounded-xl font-semibold text-xs transition-all duration-300 hover:scale-105 flex items-center gap-2 shadow-lg`}
                                >
                                  <ExternalLink className="w-4 h-4" />
                                  Ir a la acción
                                </Link>
                              )}

                              <button
                                className={`p-2 rounded-xl ${tema.colores.secundario} ${tema.colores.texto} hover:scale-105 transition-all duration-300`}
                                title="Más opciones"
                              >
                                <MoreVertical className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Panel lateral: Gráficos */}
            <div className="space-y-6">
              {/* Selector de vista de gráfico */}
              <div
                className={`rounded-2xl p-4 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra}`}
              >
                <p className={`text-sm font-bold mb-3 ${tema.colores.texto}`}>
                  📊 Vista de Gráfico
                </p>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => setVistaGrafico("pie")}
                    className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                      vistaGrafico === "pie"
                        ? `bg-gradient-to-r ${tema.colores.gradiente} text-white`
                        : `${tema.colores.hover} ${tema.colores.texto}`
                    }`}
                  >
                    <PieChart className="w-4 h-4 mx-auto mb-1" />
                    Pastel
                  </button>
                  <button
                    onClick={() => setVistaGrafico("bar")}
                    className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                      vistaGrafico === "bar"
                        ? `bg-gradient-to-r ${tema.colores.gradiente} text-white`
                        : `${tema.colores.hover} ${tema.colores.texto}`
                    }`}
                  >
                    <BarChart3 className="w-4 h-4 mx-auto mb-1" />
                    Barras
                  </button>
                  <button
                    onClick={() => setVistaGrafico("line")}
                    className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                      vistaGrafico === "line"
                        ? `bg-gradient-to-r ${tema.colores.gradiente} text-white`
                        : `${tema.colores.hover} ${tema.colores.texto}`
                    }`}
                  >
                    <LineChart className="w-4 h-4 mx-auto mb-1" />
                    Línea
                  </button>
                </div>
              </div>

              {/* Gráfico de prioridad */}
              <div
                className={`rounded-2xl p-6 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra}`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg`}
                    >
                      <PieChart className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className={`text-lg font-black ${tema.colores.texto}`}>
                        Por Prioridad
                      </h3>
                      <p className={`text-xs font-semibold ${tema.colores.textoSecundario}`}>
                        Distribución actual
                      </p>
                    </div>
                  </div>
                </div>

                {vistaGrafico === "pie" && (
                  <div className="flex items-center gap-6">
                    <ResponsiveContainer width="60%" height={220}>
                      <RechartsPieChart>
                        <Pie
                          data={datosPorPrioridad}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="valor"
                        >
                          {datosPorPrioridad.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </RechartsPieChart>
                    </ResponsiveContainer>

                    <div className="flex-1 space-y-2">
                      {datosPorPrioridad.map((item, index) => (
                        <div key={index} className="flex items-center justify-between">
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
                          <span className={`text-sm font-bold ${tema.colores.acento}`}>
                            {item.valor}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {vistaGrafico === "bar" && (
                  <ResponsiveContainer width="100%" height={220}>
                    <RechartsBarChart data={datosPorPrioridad}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                      <XAxis
                        dataKey="nombre"
                        stroke={tema.colores.textoSecundario}
                        style={{ fontSize: "11px" }}
                      />
                      <YAxis
                        stroke={tema.colores.textoSecundario}
                        style={{ fontSize: "11px" }}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "rgba(17, 24, 39, 0.95)",
                          border: "1px solid rgba(59,130,246,0.3)",
                          borderRadius: "12px",
                          padding: "12px",
                        }}
                      />
                      <Bar dataKey="valor" radius={[8, 8, 0, 0]}>
                        {datosPorPrioridad.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </RechartsBarChart>
                  </ResponsiveContainer>
                )}
              </div>

              {/* Gráfico por tipo */}
              <div
                className={`rounded-2xl p-6 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra}`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg`}
                    >
                      <BarChart3 className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className={`text-lg font-black ${tema.colores.texto}`}>
                        Por Tipo
                      </h3>
                      <p className={`text-xs font-semibold ${tema.colores.textoSecundario}`}>
                        Categorías de alertas
                      </p>
                    </div>
                  </div>
                </div>

                <ResponsiveContainer width="100%" height={220}>
                  <RechartsBarChart data={datosPorTipo}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                    <XAxis
                      dataKey="nombre"
                      stroke={tema.colores.textoSecundario}
                      style={{ fontSize: "10px" }}
                      angle={-45}
                      textAnchor="end"
                      height={80}
                    />
                    <YAxis
                      stroke={tema.colores.textoSecundario}
                      style={{ fontSize: "11px" }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "rgba(17, 24, 39, 0.95)",
                        border: "1px solid rgba(59,130,246,0.3)",
                        borderRadius: "12px",
                        padding: "12px",
                      }}
                    />
                    <Bar dataKey="valor" radius={[8, 8, 0, 0]}>
                      {datosPorTipo.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </RechartsBarChart>
                </ResponsiveContainer>
              </div>

              {/* Evolución temporal */}
              <div
                className={`rounded-2xl p-6 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra}`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg`}
                    >
                      <TrendingUp className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className={`text-lg font-black ${tema.colores.texto}`}>
                        Evolución (7 días)
                      </h3>
                      <p className={`text-xs font-semibold ${tema.colores.textoSecundario}`}>
                        Tendencia semanal
                      </p>
                    </div>
                  </div>
                </div>

                <ResponsiveContainer width="100%" height={220}>
                  <AreaChart data={datosEvolucionAlertas}>
                    <defs>
                      <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorCriticas" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorResueltas" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#22c55e" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                    <XAxis
                      dataKey="fecha"
                      stroke={tema.colores.textoSecundario}
                      style={{ fontSize: "10px" }}
                    />
                    <YAxis
                      stroke={tema.colores.textoSecundario}
                      style={{ fontSize: "11px" }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "rgba(17, 24, 39, 0.95)",
                        border: "1px solid rgba(59,130,246,0.3)",
                        borderRadius: "12px",
                        padding: "12px",
                      }}
                    />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="total"
                      stroke="#3b82f6"
                      fillOpacity={1}
                      fill="url(#colorTotal)"
                      name="Total"
                    />
                    <Area
                      type="monotone"
                      dataKey="criticas"
                      stroke="#ef4444"
                      fillOpacity={1}
                      fill="url(#colorCriticas)"
                      name="Críticas"
                    />
                    <Area
                      type="monotone"
                      dataKey="resueltas"
                      stroke="#22c55e"
                      fillOpacity={1}
                      fill="url(#colorResueltas)"
                      name="Resueltas"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Gráfico Radar */}
              <div
                className={`rounded-2xl p-6 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra}`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center shadow-lg`}
                    >
                      <Target className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className={`text-lg font-black ${tema.colores.texto}`}>
                        Análisis Radar
                      </h3>
                      <p className={`text-xs font-semibold ${tema.colores.textoSecundario}`}>
                        Distribución por categoría
                      </p>
                    </div>
                  </div>
                </div>

                <ResponsiveContainer width="100%" height={250}>
                  <RadarChart data={datosRadar}>
                    <PolarGrid stroke={tema.colores.borde} />
                    <PolarAngleAxis
                      dataKey="categoria"
                      stroke={tema.colores.textoSecundario}
                      style={{ fontSize: "11px" }}
                    />
                    <PolarRadiusAxis
                      angle={90}
                      domain={[0, 10]}
                      stroke={tema.colores.textoSecundario}
                    />
                    <Radar
                      name="Alertas"
                      dataKey="valor"
                      stroke="#f97316"
                      fill="#f97316"
                      fillOpacity={0.6}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "rgba(17, 24, 39, 0.95)",
                        border: "1px solid rgba(249,115,22,0.3)",
                        borderRadius: "12px",
                        padding: "12px",
                      }}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>

              {/* Métricas de rendimiento */}
              <div
                className={`rounded-2xl p-6 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra}`}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className={`w-12 h-12 bg-gradient-to-br from-violet-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg`}
                  >
                    <Zap className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className={`text-lg font-black ${tema.colores.texto}`}>
                      Métricas Clave
                    </h3>
                    <p className={`text-xs font-semibold ${tema.colores.textoSecundario}`}>
                      Rendimiento del sistema
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className={`text-sm font-semibold ${tema.colores.texto}`}>
                        ⏱️ Tiempo promedio resolución
                      </span>
                      <span className={`text-sm font-bold ${tema.colores.acento}`}>
                        {Math.round(resumenAlertas.tiempoPromedioResolucion)} min
                      </span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full transition-all duration-500"
                        style={{
                          width: `${Math.min(
                            (resumenAlertas.tiempoPromedioResolucion / 120) * 100,
                            100
                          )}%`,
                        }}
                      ></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className={`text-sm font-semibold ${tema.colores.texto}`}>
                        📊 Tasa de resolución
                      </span>
                      <span className={`text-sm font-bold ${tema.colores.acento}`}>
                        {resumenAlertas.total > 0
                          ? Math.round(
                              (alertas.filter((a) => a.resuelta).length /
                                resumenAlertas.total) *
                                100
                            )
                          : 0}
                        %
                      </span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-blue-500 to-cyan-500 h-2 rounded-full transition-all duration-500"
                        style={{
                          width: `${
                            resumenAlertas.total > 0
                              ? (alertas.filter((a) => a.resuelta).length /
                                  resumenAlertas.total) *
                                100
                              : 0
                          }%`,
                        }}
                      ></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className={`text-sm font-semibold ${tema.colores.texto}`}>
                        🎯 Nivel de criticidad
                      </span>
                      <span className={`text-sm font-bold ${tema.colores.acento}`}>
                        {resumenAlertas.total > 0
                          ? Math.round(
                              (resumenAlertas.criticas / resumenAlertas.total) * 100
                            )
                          : 0}
                        %
                      </span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-red-500 to-orange-500 h-2 rounded-full transition-all duration-500"
                        style={{
                          width: `${
                            resumenAlertas.total > 0
                              ? (resumenAlertas.criticas / resumenAlertas.total) * 100
                              : 0
                          }%`,
                        }}
                      ></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className={`text-sm font-semibold ${tema.colores.texto}`}>
                        ✅ Alertas resueltas hoy
                      </span>
                      <span className={`text-sm font-bold ${tema.colores.acento}`}>
                        {resumenAlertas.resueltasHoy}
                      </span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-green-500 to-teal-500 h-2 rounded-full transition-all duration-500"
                        style={{
                          width: `${Math.min(
                            (resumenAlertas.resueltasHoy / 10) * 100,
                            100
                          )}%`,
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Estado del sistema */}
              <div
                className={`rounded-2xl p-6 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra}`}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className={`w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-xl flex items-center justify-center shadow-lg`}
                  >
                    <Activity className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className={`text-lg font-black ${tema.colores.texto}`}>
                      Estado del Sistema
                    </h3>
                    <p className={`text-xs font-semibold ${tema.colores.textoSecundario}`}>
                      Monitoreo en tiempo real
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-green-500/10 border border-green-500/30">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-green-400" />
                      <span className={`text-sm font-semibold ${tema.colores.texto}`}>
                        Servicios Operativos
                      </span>
                    </div>
                    <span className="text-sm font-bold text-green-400">98.5%</span>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xl bg-blue-500/10 border border-blue-500/30">
                    <div className="flex items-center gap-2">
                      <Server className="w-5 h-5 text-blue-400" />
                      <span className={`text-sm font-semibold ${tema.colores.texto}`}>
                        Servidores Activos
                      </span>
                    </div>
                    <span className="text-sm font-bold text-blue-400">24/25</span>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xl bg-yellow-500/10 border border-yellow-500/30">
                    <div className="flex items-center gap-2">
                      <WifiIcon className="w-5 h-5 text-yellow-400" />
                      <span className={`text-sm font-semibold ${tema.colores.texto}`}>
                        Conectividad Red
                      </span>
                    </div>
                    <span className="text-sm font-bold text-yellow-400">95.2%</span>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xl bg-purple-500/10 border border-purple-500/30">
                    <div className="flex items-center gap-2">
                      <Database className="w-5 h-5 text-purple-400" />
                      <span className={`text-sm font-semibold ${tema.colores.texto}`}>
                        Base de Datos
                      </span>
                    </div>
                    <span className="text-sm font-bold text-purple-400">100%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Panel de acciones rápidas */}
        <div
          className={`rounded-2xl p-6 mb-8 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra}`}
        >
          <div className="flex items-center gap-3 mb-6">
            <div
              className={`w-12 h-12 bg-gradient-to-br ${tema.colores.gradiente} rounded-xl flex items-center justify-center shadow-lg`}
            >
              <Zap className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className={`text-2xl font-black ${tema.colores.texto}`}>
                ⚡ Acciones Rápidas
              </h3>
              <p className={`text-sm font-semibold ${tema.colores.textoSecundario}`}>
                Herramientas y atajos para gestión eficiente
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            <button
              onClick={() => cargarAlertas()}
              className={`p-4 rounded-xl ${tema.colores.hover} ${tema.colores.texto} transition-all duration-300 hover:scale-105 flex flex-col items-center gap-2 group`}
            >
              <RefreshCw className="w-6 h-6 group-hover:rotate-180 transition-transform duration-500" />
              <span className="text-xs font-bold">Actualizar</span>
            </button>

            <button
              onClick={marcarTodasComoLeidas}
              className={`p-4 rounded-xl ${tema.colores.hover} ${tema.colores.texto} transition-all duration-300 hover:scale-105 flex flex-col items-center gap-2 group`}
            >
              <CheckCircle2 className="w-6 h-6 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-bold">Marcar Leídas</span>
            </button>

            <Link
              href="/tecnico/tickets"
              className={`p-4 rounded-xl ${tema.colores.hover} ${tema.colores.texto} transition-all duration-300 hover:scale-105 flex flex-col items-center gap-2 group`}
            >
              <ClipboardList className="w-6 h-6 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-bold">Tickets</span>
            </Link>

            <Link
              href="/tecnico/equipos"
              className={`p-4 rounded-xl ${tema.colores.hover} ${tema.colores.texto} transition-all duration-300 hover:scale-105 flex flex-col items-center gap-2 group`}
            >
              <HardDrive className="w-6 h-6 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-bold">Equipos</span>
            </Link>

            <Link
              href="/tecnico/mantenimiento"
              className={`p-4 rounded-xl ${tema.colores.hover} ${tema.colores.texto} transition-all duration-300 hover:scale-105 flex flex-col items-center gap-2 group`}
            >
              <Wrench className="w-6 h-6 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-bold">Mantenimiento</span>
            </Link>

            <Link
              href="/tecnico/reportes"
              className={`p-4 rounded-xl ${tema.colores.hover} ${tema.colores.texto} transition-all duration-300 hover:scale-105 flex flex-col items-center gap-2 group`}
            >
              <FileText className="w-6 h-6 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-bold">Reportes</span>
            </Link>

            <button
              onClick={() => exportarAlertas("pdf")}
              className={`p-4 rounded-xl ${tema.colores.hover} ${tema.colores.texto} transition-all duration-300 hover:scale-105 flex flex-col items-center gap-2 group`}
            >
              <Download className="w-6 h-6 group-hover:translate-y-1 transition-transform" />
              <span className="text-xs font-bold">Exportar</span>
            </button>

            <Link
              href="/tecnico/configuracion"
              className={`p-4 rounded-xl ${tema.colores.hover} ${tema.colores.texto} transition-all duration-300 hover:scale-105 flex flex-col items-center gap-2 group`}
            >
              <Settings className="w-6 h-6 group-hover:rotate-90 transition-transform duration-500" />
              <span className="text-xs font-bold">Configurar</span>
            </Link>

            <Link
              href="/tecnico/estadisticas"
              className={`p-4 rounded-xl ${tema.colores.hover} ${tema.colores.texto} transition-all duration-300 hover:scale-105 flex flex-col items-center gap-2 group`}
            >
              <BarChart3 className="w-6 h-6 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-bold">Estadísticas</span>
            </Link>

            <Link
              href="/tecnico/calendario"
              className={`p-4 rounded-xl ${tema.colores.hover} ${tema.colores.texto} transition-all duration-300 hover:scale-105 flex flex-col items-center gap-2 group`}
            >
              <Calendar className="w-6 h-6 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-bold">Calendario</span>
            </Link>

            <Link
              href="/tecnico/ayuda"
              className={`p-4 rounded-xl ${tema.colores.hover} ${tema.colores.texto} transition-all duration-300 hover:scale-105 flex flex-col items-center gap-2 group`}
            >
              <Lightbulb className="w-6 h-6 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-bold">Ayuda</span>
            </Link>

            <button
              onClick={() => window.print()}
              className={`p-4 rounded-xl ${tema.colores.hover} ${tema.colores.texto} transition-all duration-300 hover:scale-105 flex flex-col items-center gap-2 group`}
            >
              <Printer className="w-6 h-6 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-bold">Imprimir</span>
            </button>
          </div>
        </div>

        {/* Panel de información adicional */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* Tips y mejores prácticas */}
          <div
            className={`rounded-2xl p-6 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra}`}
          >
            <div className="flex items-center gap-3 mb-4">
              <div
                className={`w-10 h-10 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center shadow-lg`}
              >
                <Lightbulb className="w-5 h-5 text-white" />
              </div>
              <h3 className={`text-lg font-black ${tema.colores.texto}`}>
                💡 Tips del Día
              </h3>
            </div>
            <div className="space-y-3">
              <div className={`p-3 rounded-xl bg-yellow-500/10 border border-yellow-500/30`}>
                <p className={`text-sm font-semibold ${tema.colores.texto} mb-1`}>
                  Prioriza alertas críticas
                </p>
                <p className={`text-xs ${tema.colores.textoSecundario}`}>
                  Atiende primero las alertas de prioridad crítica para minimizar el
                  impacto en los servicios.
                </p>
              </div>
              <div className={`p-3 rounded-xl bg-blue-500/10 border border-blue-500/30`}>
                <p className={`text-sm font-semibold ${tema.colores.texto} mb-1`}>
                  Documenta tus acciones
                </p>
                <p className={`text-xs ${tema.colores.textoSecundario}`}>
                  Registra todas las soluciones aplicadas para crear una base de
                  conocimiento útil.
                </p>
              </div>
              <div className={`p-3 rounded-xl bg-green-500/10 border border-green-500/30`}>
                <p className={`text-sm font-semibold ${tema.colores.texto} mb-1`}>
                  Mantén comunicación
                </p>
                <p className={`text-xs ${tema.colores.textoSecundario}`}>
                  Informa a los usuarios afectados sobre el progreso de las soluciones.
                </p>
              </div>
            </div>
          </div>

          {/* Alertas recientes destacadas */}
          <div
            className={`rounded-2xl p-6 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra}`}
          >
            <div className="flex items-center gap-3 mb-4">
              <div
                className={`w-10 h-10 bg-gradient-to-br from-red-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg`}
              >
                <Flame className="w-5 h-5 text-white" />
              </div>
              <h3 className={`text-lg font-black ${tema.colores.texto}`}>
                🔥 Más Urgentes
              </h3>
            </div>
            <div className="space-y-2">
              {alertas
                .filter((a) => a.prioridad === "critica" && !a.resuelta)
                .slice(0, 5)
                .map((alerta) => {
                  const Icono = obtenerIconoAlertaTipo(alerta.tipo);
                  return (
                    <div
                      key={alerta.id_alerta}
                      className={`p-3 rounded-xl ${tema.colores.hover} cursor-pointer transition-all duration-300 hover:scale-105 flex items-center gap-3`}
                      onClick={() => marcarComoLeida(alerta.id_alerta)}
                    >
                      <div
                        className={`w-8 h-8 rounded-lg bg-red-500/20 flex items-center justify-center flex-shrink-0`}
                      >
                        <Icono className="w-4 h-4 text-red-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p
                          className={`text-sm font-bold ${tema.colores.texto} truncate`}
                        >
                          {alerta.titulo}
                        </p>
                        <p className={`text-xs ${tema.colores.textoSecundario}`}>
                          {formatearFecha(alerta.fecha_creacion)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              {alertas.filter((a) => a.prioridad === "critica" && !a.resuelta).length ===
                0 && (
                <div className="text-center py-8">
                  <CheckCircle2
                    className={`w-12 h-12 mx-auto mb-2 ${tema.colores.textoSecundario}`}
                  />
                  <p className={`text-sm ${tema.colores.textoSecundario}`}>
                    ✅ Sin alertas críticas
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Actividad reciente */}
          <div
            className={`rounded-2xl p-6 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra}`}
          >
            <div className="flex items-center gap-3 mb-4">
              <div
                className={`w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-xl flex items-center justify-center shadow-lg`}
              >
                <Activity className="w-5 h-5 text-white" />
              </div>
              <h3 className={`text-lg font-black ${tema.colores.texto}`}>
                📊 Actividad Reciente
              </h3>
            </div>
            <div className="space-y-2">
              {alertas
                .filter((a) => a.resuelta)
                .slice(0, 5)
                .map((alerta) => (
                  <div
                    key={alerta.id_alerta}
                    className={`p-3 rounded-xl bg-green-500/10 border border-green-500/30 flex items-center gap-3`}
                  >
                    <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p
                        className={`text-sm font-bold ${tema.colores.texto} truncate`}
                      >
                        {alerta.titulo}
                      </p>
                      <p className={`text-xs ${tema.colores.textoSecundario}`}>
                        Resuelta • {formatearFecha(alerta.fecha_actualizacion)}
                      </p>
                    </div>
                  </div>
                ))}
              {alertas.filter((a) => a.resuelta).length === 0 && (
                <div className="text-center py-8">
                  <Clock
                    className={`w-12 h-12 mx-auto mb-2 ${tema.colores.textoSecundario}`}
                  />
                  <p className={`text-sm ${tema.colores.textoSecundario}`}>
                    Sin actividad reciente
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer
          className={`rounded-2xl ${tema.colores.card} ${tema.colores.borde} border py-6 px-8 ${tema.colores.sombra}`}
        >
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 bg-gradient-to-br ${tema.colores.gradiente} rounded-xl flex items-center justify-center shadow-lg`}
              >
                <HeartPulse className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className={`text-sm font-semibold ${tema.colores.texto}`}>
                  © 2025 AnyssaMed - Centro de Alertas Técnicas Premium
                </p>
                <p className={`text-xs ${tema.colores.textoSecundario}`}>
                  Sistema de Monitoreo Avanzado v4.5.0
                </p>
              </div>
            </div>

            <div className="flex items-center gap-6">
              <Link
                href="/ayuda"
                className={`text-sm font-bold transition-colors ${tema.colores.textoSecundario} hover:${tema.colores.acento} flex items-center gap-1`}
              >
                <Lightbulb className="w-4 h-4" />
                Ayuda
              </Link>
              <Link
                href="/privacidad"
                className={`text-sm font-bold transition-colors ${tema.colores.textoSecundario} hover:${tema.colores.acento} flex items-center gap-1`}
              >
                <Shield className="w-4 h-4" />
                Privacidad
              </Link>
              <Link
                href="/terminos"
                className={`text-sm font-bold transition-colors ${tema.colores.textoSecundario} hover:${tema.colores.acento} flex items-center gap-1`}
              >
                <FileText className="w-4 h-4" />
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

          <div className="mt-4 pt-4 border-t border-gray-700/50 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className={`text-xs ${tema.colores.textoSecundario}`}>
                🌐 Conectado desde: {usuario.tecnico?.region}
              </span>
              <span className={`text-xs ${tema.colores.textoSecundario}`}>
                ⏰ Zona horaria: {usuario.tecnico?.zona_horaria}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold ${
                  disponibilidad === "disponible"
                    ? "bg-green-500/20 text-green-300 border border-green-500/40"
                    : disponibilidad === "ocupado"
                    ? "bg-yellow-500/20 text-yellow-300 border border-yellow-500/40"
                    : "bg-red-500/20 text-red-300 border border-red-500/40"
                }`}
              >
                {disponibilidad === "disponible"
                  ? "✓ Disponible"
                  : disponibilidad === "ocupado"
                  ? "⏳ Ocupado"
                  : "✕ Fuera de servicio"}
              </span>
            </div>
          </div>
        </footer>
      </main>

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
          font-family: "Inter", "Segoe UI", "Roboto", sans-serif;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
          overflow-x: hidden;
        }

        /* Scrollbar personalizado premium */
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }

        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
          border-radius: 10px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(180deg, #6366f1 0%, #8b5cf6 100%);
          border-radius: 10px;
          transition: background 0.3s ease;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(180deg, #4f46e5 0%, #7c3aed 100%);
        }

        .custom-scrollbar {
          scrollbar-color: rgba(99, 102, 241, 0.5) transparent;
          scrollbar-width: thin;
        }

        /* Animaciones premium */
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
          animation: wave 2s ease-in-out infinite;
          transform-origin: 70% 70%;
          display: inline-block;
        }

        @keyframes spin-slow {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        .animate-spin-slow {
          animation: spin-slow 3s linear infinite;
        }

        @keyframes pulse-glow {
          0%,
          100% {
            box-shadow: 0 0 20px rgba(99, 102, 241, 0.5);
          }
          50% {
            box-shadow: 0 0 40px rgba(99, 102, 241, 0.8);
          }
        }

        .animate-pulse-glow {
          animation: pulse-glow 2s ease-in-out infinite;
        }

        /* Efectos de hover premium */
        .hover-lift {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .hover-lift:hover {
          transform: translateY(-4px) scale(1.02);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
        }

        /* Gradientes animados */
        @keyframes gradient-shift {
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

        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient-shift 3s ease infinite;
        }

        /* Truncate text */
        .line-clamp-1 {
          display: -webkit-box;
          -webkit-line-clamp: 1;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .line-clamp-3 {
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        /* Responsive */
        @media (max-width: 768px) {
          .hidden\\.md\\:block {
            display: none;
          }

          .block\\.md\\:hidden {
            display: block;
          }
        }

        /* Print styles */
        @media print {
          .no-print {
            display: none !important;
          }

          body {
            background: white;
            color: black;
          }

          .custom-scrollbar {
            overflow: visible !important;
          }
        }

        /* Accesibilidad */
        @media (prefers-reduced-motion: reduce) {
          *,
          *::before,
          *::after {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
        }

        /* Dark mode support */
        @media (prefers-color-scheme: dark) {
          input,
          select,
          textarea {
            color-scheme: dark;
          }
        }

        /* Focus visible */
        *:focus-visible {
          outline: 2px solid #6366f1;
          outline-offset: 2px;
          border-radius: 8px;
        }

        /* Selection */
        ::selection {
          background-color: rgba(99, 102, 241, 0.3);
          color: inherit;
        }

        /* Placeholder */
        ::placeholder {
          opacity: 0.6;
        }

        /* Backdrop blur support */
        @supports (backdrop-filter: blur(10px)) {
          .backdrop-blur-xl {
            backdrop-filter: blur(20px);
          }
        }
      `}</style>
    </div>
  );
}
