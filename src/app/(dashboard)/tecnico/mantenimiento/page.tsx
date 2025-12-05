// src/app/(dashboard)/tecnico/mantenimiento/page.tsx
"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import SidebarTecnico from "@/components/tecnico/SidebarTecnico";
import {
  Activity,
  AlertCircle,
  AlertTriangle,
  Archive,
  Award,
  BarChart3,
  Battery,
  Bell,
  SortAsc,
  CheckSquare,
  BellOff,
  Box,
  Calendar,
  CalendarCheck,
  CalendarClock,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  Circle,
  Clock,
  ClipboardCheck,
  ClipboardList,
  Cloud,
  Cpu,
  Database,
  Download,
  Edit,
  ExternalLink,
  Eye,
  FileDown,
  FileText,
  Filter,
  Flame,
  Globe,
  HardDrive,
  Heart,
  HeartPulse,
  History,
  Home,
  Info,
  Layers,
  Lightbulb,
  LineChart,
  Loader2,
  Lock,
  LogOut,
  Mail,
  MapPin,
  Maximize2,
  MessageSquare,
  Minimize2,
  Monitor,
  Moon,
  MoreVertical,
  Package,
  Pause,
  PieChart,
  Play,
  Plus,
  Power,
  PowerOff,
  Printer,
  RefreshCw,
  RotateCw,
  Save,
  Search,
  Send,
  Server,
  Settings,
  Share2,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Sliders,
  Sparkles,
  Star,
  Sun,
  Target,
  Terminal,
  Thermometer,
  Tool,
  Trash2,
  TrendingDown,
  TrendingUp,
  Triangle,
  Trophy,
  User,
  UserCheck,
  Users,
  Wifi,
  WifiOff,
  Wrench,
  X,
  Zap,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import {
  BarChart as RechartsBarChart,
  Bar,
  LineChart as RechartsLineChart,
  Line,
  AreaChart,
  Area,
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
    turno: "manana" | "tarde" | "noche" | "completo";
    hora_inicio: string | null;
    hora_fin: string | null;
    extension_telefonica: string | null;
    estado: "activo" | "inactivo" | "suspendido";
    disponibilidad: "disponible" | "ocupado" | "fuera_servicio";
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

interface EstadisticasTecnico {
  tickets_asignados_hoy: number;
  tickets_abiertos: number;
  tickets_en_progreso: number;
  tickets_resueltos_hoy: number;
  alertas_activas: number;
  alertas_criticas: number;
  tiempo_promedio_resolucion: number;
  calificacion_promedio: number;
  mantenimientos_programados: number;
  mantenimientos_vencidos: number;
  mantenimientos_completados_mes: number;
  equipos_en_mantenimiento: number;
}

interface OrdenMantenimiento {
  id_mantenimiento: number;
  id_equipo: number;
  tipo_mantenimiento: "preventivo" | "correctivo" | "predictivo" | "calibracion" | "inspeccion";
  estado: "programado" | "en_progreso" | "completado" | "cancelado" | "reprogramado";
  prioridad: "baja" | "media" | "alta" | "critica";
  fecha_programada: string;
  fecha_inicio: string | null;
  fecha_fin: string | null;
  duracion_estimada: number; // minutos
  duracion_real: number | null; // minutos
  tecnico_asignado: number;
  nombre_tecnico: string;
  foto_tecnico: string | null;
  equipo: {
    id_equipo: number;
    nombre: string;
    marca: string;
    modelo: string;
    serie: string;
    ubicacion: string;
    estado: string;
    criticidad: "baja" | "media" | "alta" | "critica";
    foto_url: string | null;
  };
  descripcion: string;
  observaciones: string | null;
  checklist: ChecklistItem[];
  repuestos_utilizados: RepuestoUtilizado[];
  costo_total: number;
  tiempo_fuera_servicio: number | null; // minutos
  proximo_mantenimiento: string | null;
  requiere_aprobacion: boolean;
  aprobado_por: number | null;
  nombre_aprobador: string | null;
  fecha_aprobacion: string | null;
  documentos: DocumentoMantenimiento[];
  historial: HistorialMantenimiento[];
  calificacion: number | null;
  comentarios_calificacion: string | null;
  created_at: string;
  updated_at: string;
}

interface ChecklistItem {
  id_item: number;
  descripcion: string;
  completado: boolean;
  observaciones: string | null;
  fecha_completado: string | null;
  completado_por: string | null;
  es_critico: boolean;
  orden: number;
}

interface RepuestoUtilizado {
  id_repuesto: number;
  nombre: string;
  codigo: string;
  cantidad: number;
  costo_unitario: number;
  costo_total: number;
  proveedor: string | null;
}

interface DocumentoMantenimiento {
  id_documento: number;
  tipo: "foto" | "pdf" | "reporte" | "certificado" | "factura";
  nombre: string;
  url: string;
  descripcion: string | null;
  fecha_subida: string;
  subido_por: string;
}

interface HistorialMantenimiento {
  id_historial: number;
  accion: string;
  descripcion: string;
  usuario: string;
  fecha: string;
}

interface FiltrosMantenimiento {
  tipo: string[];
  estado: string[];
  prioridad: string[];
  ubicacion: string;
  equipoNombre: string;
  fechaDesde: string;
  fechaHasta: string;
  tecnicoAsignado: string;
  soloVencidos: boolean;
  soloAsignadosAMi: boolean;
  ordenarPor: "fecha_programada" | "prioridad" | "estado" | "equipo";
  ordenDireccion: "asc" | "desc";
}

interface VistaMantenimiento {
  modo: "lista" | "tarjetas" | "tabla" | "calendario" | "kanban";
  densidad: "compacta" | "normal" | "espaciosa";
  agruparPor: "ninguno" | "tipo" | "estado" | "prioridad" | "ubicacion" | "tecnico";
  mostrarCompletados: boolean;
}

interface EstadisticasMantenimiento {
  total: number;
  programados: number;
  en_progreso: number;
  completados: number;
  vencidos: number;
  cancelados: number;
  porTipo: { [key: string]: number };
  porPrioridad: { [key: string]: number };
  porEstado: { [key: string]: number };
  tendencia: { fecha: string; cantidad: number; completados: number }[];
  tiempoPromedio: number;
  tasaCompletitud: number;
  equiposMasMantenimiento: { equipo: string; cantidad: number }[];
}

// ========================================
// 🎨 CONFIGURACIONES DE TEMAS
// ========================================

const TEMAS: Record<TemaColor, ConfiguracionTema> = {
  light: {
    nombre: "Claro Profesional",
    icono: Sun,
    descripcion: "Interfaz clara y moderna",
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
    descripcion: "Modo oscuro elegante",
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
    descripcion: "Tema azul profesional",
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
    descripcion: "Diseño moderno púrpura",
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
    descripcion: "Tema verde para monitoreo",
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
    descripcion: "Estilo futurista",
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
    icono: Globe,
    descripcion: "Colores del océano",
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
    descripcion: "Tonos cálidos",
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

const TIPOS_MANTENIMIENTO = [
  { value: "preventivo", label: "Preventivo", icon: Shield, color: "blue" },
  { value: "correctivo", label: "Correctivo", icon: Wrench, color: "orange" },
  { value: "predictivo", label: "Predictivo", icon: TrendingUp, color: "purple" },
  { value: "calibracion", label: "Calibración", icon: Sliders, color: "green" },
  { value: "inspeccion", label: "Inspección", icon: Eye, color: "cyan" },
];

const ESTADOS_MANTENIMIENTO = [
  { value: "programado", label: "Programado", icon: Calendar, color: "blue" },
  { value: "en_progreso", label: "En Progreso", icon: Play, color: "yellow" },
  { value: "completado", label: "Completado", icon: CheckCircle2, color: "green" },
  { value: "cancelado", label: "Cancelado", icon: X, color: "red" },
  { value: "reprogramado", label: "Reprogramado", icon: RotateCw, color: "purple" },
];

// ========================================
// 🎯 COMPONENTE PRINCIPAL
// ========================================

export default function MantenimientoPage() {
  // 📊 ESTADOS PRINCIPALES
  const [usuario, setUsuario] = useState<UsuarioSesion | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMantenimientos, setLoadingMantenimientos] = useState(true);
  const [mantenimientos, setMantenimientos] = useState<OrdenMantenimiento[]>([]);
  const [estadisticas, setEstadisticas] = useState<EstadisticasTecnico | null>(null);
  const [estadisticasMantenimiento, setEstadisticasMantenimiento] = useState<EstadisticasMantenimiento | null>(null);
  const [mantenimientoSeleccionado, setMantenimientoSeleccionado] = useState<OrdenMantenimiento | null>(null);
  
  // 🎨 ESTADOS DE UI
  const [temaActual, setTemaActual] = useState<TemaColor>("dark");
  const [sidebarAbierto, setSidebarAbierto] = useState(true);
  const [perfilAbierto, setPerfilAbierto] = useState(false);
  const [panelDetalleAbierto, setPanelDetalleAbierto] = useState(false);
  const [busqueda, setBusqueda] = useState("");
  const [disponibilidad, setDisponibilidad] = useState<"disponible" | "ocupado" | "fuera_servicio">("disponible");
  
  // 🔍 ESTADOS DE FILTROS Y VISTA
  const [filtros, setFiltros] = useState<FiltrosMantenimiento>({
    tipo: [],
    estado: [],
    prioridad: [],
    ubicacion: "",
    equipoNombre: "",
    fechaDesde: "",
    fechaHasta: "",
    tecnicoAsignado: "",
    soloVencidos: false,
    soloAsignadosAMi: false,
    ordenarPor: "fecha_programada",
    ordenDireccion: "asc",
  });

  const [vista, setVista] = useState<VistaMantenimiento>({
    modo: "tarjetas",
    densidad: "normal",
    agruparPor: "estado",
    mostrarCompletados: true,
  });

  // 📈 ESTADOS DE ACCIONES
  const [mantenimientosSeleccionados, setMantenimientosSeleccionados] = useState<number[]>([]);
  const [modoSeleccionMultiple, setModoSeleccionMultiple] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [intervaloRefresh, setIntervaloRefresh] = useState(300000); // 5 minutos
  const [mostrarFiltrosAvanzados, setMostrarFiltrosAvanzados] = useState(false);
  const [mostrarModalNuevo, setMostrarModalNuevo] = useState(false);

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
      cargarMantenimientos();
      cargarEstadisticas();
      cargarEstadisticasMantenimiento();
    }
  }, [usuario]);

  useEffect(() => {
    if (!autoRefresh || !usuario?.tecnico) return;

    const interval = setInterval(() => {
      cargarMantenimientos();
      cargarEstadisticas();
      cargarEstadisticasMantenimiento();
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

    const vistaGuardada = localStorage.getItem("vista_mantenimiento");
    if (vistaGuardada) {
      try {
        setVista(JSON.parse(vistaGuardada));
      } catch (e) {
        console.error("Error al cargar vista:", e);
      }
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
          (rol) => rol.includes("TECNICO") || rol.includes("SOPORTE") || rol.includes("MANTENIMIENTO")
        );

        if (!tieneRolTecnico) {
          mostrarNotificacion(
            "error",
            "Acceso Denegado",
            `Este panel es solo para técnicos.`
          );
          window.location.href = "/";
          return;
        }

        if (!result.usuario.tecnico) {
          mostrarNotificacion(
            "error",
            "Configuración Incompleta",
            "Tu usuario no está vinculado a un registro de técnico."
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

  const cargarMantenimientos = async () => {
    if (!usuario?.tecnico?.id_tecnico) return;

    try {
      setLoadingMantenimientos(true);

      const res = await fetch(
        `/api/tecnico/mantenimiento?id_tecnico=${usuario.tecnico.id_tecnico}`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        }
      );

      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data.success) {
        console.error("Error al cargar mantenimientos:", data);
        return;
      }

      setMantenimientos(data.mantenimientos || []);
    } catch (error) {
      console.error("Error al cargar mantenimientos:", error);
      mostrarNotificacion("error", "Error", "No se pudieron cargar los mantenimientos");
    } finally {
      setLoadingMantenimientos(false);
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

  const cargarEstadisticasMantenimiento = async () => {
    if (!usuario?.tecnico?.id_tecnico) return;

    try {
      const res = await fetch(
        `/api/tecnico/mantenimiento/estadisticas?id_tecnico=${usuario.tecnico.id_tecnico}`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        }
      );

      const data = await res.json().catch(() => ({}));

      if (res.ok && data.success) {
        setEstadisticasMantenimiento(data.estadisticas);
      }
    } catch (error) {
      console.error("Error al cargar estadísticas de mantenimiento:", error);
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

  const iniciarMantenimiento = async (idMantenimiento: number) => {
    try {
      const res = await fetch(`/api/tecnico/mantenimiento/${idMantenimiento}/iniciar`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      if (!res.ok) {
        throw new Error("Error al iniciar mantenimiento");
      }

      setMantenimientos((prev) =>
        prev.map((m) =>
          m.id_mantenimiento === idMantenimiento
            ? { ...m, estado: "en_progreso" as const, fecha_inicio: new Date().toISOString() }
            : m
        )
      );

      mostrarNotificacion("success", "Mantenimiento Iniciado", "El mantenimiento se marcó como en progreso");
      cargarEstadisticas();
    } catch (error) {
      console.error("Error al iniciar mantenimiento:", error);
      mostrarNotificacion("error", "Error", "No se pudo iniciar el mantenimiento");
    }
  };

  const completarMantenimiento = async (idMantenimiento: number) => {
    try {
      const res = await fetch(`/api/tecnico/mantenimiento/${idMantenimiento}/completar`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      if (!res.ok) {
        throw new Error("Error al completar mantenimiento");
      }

      setMantenimientos((prev) =>
        prev.map((m) =>
          m.id_mantenimiento === idMantenimiento
            ? { ...m, estado: "completado" as const, fecha_fin: new Date().toISOString() }
            : m
        )
      );

      mostrarNotificacion("success", "Mantenimiento Completado", "El mantenimiento se completó exitosamente");
      cargarEstadisticas();
    } catch (error) {
      console.error("Error al completar mantenimiento:", error);
      mostrarNotificacion("error", "Error", "No se pudo completar el mantenimiento");
    }
  };

  const reprogramarMantenimiento = async (idMantenimiento: number, nuevaFecha: string) => {
    try {
      const res = await fetch(`/api/tecnico/mantenimiento/${idMantenimiento}/reprogramar`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ nueva_fecha: nuevaFecha }),
      });

      if (!res.ok) {
        throw new Error("Error al reprogramar mantenimiento");
      }

      setMantenimientos((prev) =>
        prev.map((m) =>
          m.id_mantenimiento === idMantenimiento
            ? { ...m, estado: "reprogramado" as const, fecha_programada: nuevaFecha }
            : m
        )
      );

      mostrarNotificacion("success", "Mantenimiento Reprogramado", "La fecha fue actualizada correctamente");
    } catch (error) {
      console.error("Error al reprogramar mantenimiento:", error);
      mostrarNotificacion("error", "Error", "No se pudo reprogramar el mantenimiento");
    }
  };

  const cancelarMantenimiento = async (idMantenimiento: number, motivo: string) => {
    try {
      const res = await fetch(`/api/tecnico/mantenimiento/${idMantenimiento}/cancelar`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ motivo }),
      });

      if (!res.ok) {
        throw new Error("Error al cancelar mantenimiento");
      }

      setMantenimientos((prev) =>
        prev.map((m) =>
          m.id_mantenimiento === idMantenimiento
            ? { ...m, estado: "cancelado" as const }
            : m
        )
      );

      mostrarNotificacion("success", "Mantenimiento Cancelado", "El mantenimiento fue cancelado");
      cargarEstadisticas();
    } catch (error) {
      console.error("Error al cancelar mantenimiento:", error);
      mostrarNotificacion("error", "Error", "No se pudo cancelar el mantenimiento");
    }
  };

  const exportarMantenimientos = async (formato: "csv" | "excel" | "pdf") => {
    try {
      mostrarNotificacion("info", "Exportando", `Generando archivo ${formato.toUpperCase()}...`);

      const res = await fetch(
        `/api/tecnico/mantenimiento/exportar?formato=${formato}&id_tecnico=${usuario?.tecnico?.id_tecnico}`,
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
      a.download = `mantenimientos_${new Date().toISOString().split("T")[0]}.${formato}`;
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

  const cambiarVista = (nuevaVista: Partial<VistaMantenimiento>) => {
    const vistaActualizada = { ...vista, ...nuevaVista };
    setVista(vistaActualizada);

    if (typeof window !== "undefined") {
      localStorage.setItem("vista_mantenimiento", JSON.stringify(vistaActualizada));
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
    console.log(`[${tipo.toUpperCase()}] ${titulo}: ${mensaje}`);
    // Implementar sistema de toast real aquí
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
    }).format(d);
  };

  const formatearTiempo = (minutos: number): string => {
    if (minutos < 60) return `${minutos}m`;
    if (minutos < 1440) return `${Math.floor(minutos / 60)}h ${minutos % 60}m`;
    return `${Math.floor(minutos / 1440)}d ${Math.floor((minutos % 1440) / 60)}h`;
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

  const obtenerColorEstado = (estado: string) => {
    const colores: { [key: string]: string } = {
      programado: "bg-blue-500/20 text-blue-300 border-blue-500/40",
      en_progreso: "bg-yellow-500/20 text-yellow-300 border-yellow-500/40",
      completado: "bg-green-500/20 text-green-300 border-green-500/40",
      cancelado: "bg-red-500/20 text-red-300 border-red-500/40",
      reprogramado: "bg-purple-500/20 text-purple-300 border-purple-500/40",
    };

    return colores[estado] || "bg-gray-500/20 text-gray-300 border-gray-500/40";
  };

  const obtenerIconoTipo = (tipo: string) => {
    const iconos: { [key: string]: any } = {
      preventivo: Shield,
      correctivo: Wrench,
      predictivo: TrendingUp,
      calibracion: Sliders,
      inspeccion: Eye,
    };

    return iconos[tipo] || Tool;
  };

  const obtenerIconoEstado = (estado: string) => {
    const iconos: { [key: string]: any } = {
      programado: Calendar,
      en_progreso: Play,
      completado: CheckCircle2,
      cancelado: X,
      reprogramado: RotateCw,
    };

    return iconos[estado] || Circle;
  };

  const toggleSeleccionMantenimiento = (idMantenimiento: number) => {
    setMantenimientosSeleccionados((prev) =>
      prev.includes(idMantenimiento)
        ? prev.filter((id) => id !== idMantenimiento)
        : [...prev, idMantenimiento]
    );
  };

  const seleccionarTodos = () => {
    if (mantenimientosSeleccionados.length === mantenimientosFiltrados.length) {
      setMantenimientosSeleccionados([]);
    } else {
      setMantenimientosSeleccionados(mantenimientosFiltrados.map((m) => m.id_mantenimiento));
    }
  };

  const esVencido = (fechaProgramada: string, estado: string) => {
    if (estado === "completado" || estado === "cancelado") return false;
    return new Date(fechaProgramada) < new Date();
  };

  // ========================================
  // 📊 DATOS DERIVADOS Y CÁLCULOS
  // ========================================

  const mantenimientosFiltrados = useMemo(() => {
    let data = [...mantenimientos];

    // Filtro por tipo
    if (filtros.tipo.length > 0) {
      data = data.filter((m) => filtros.tipo.includes(m.tipo_mantenimiento));
    }

    // Filtro por estado
    if (filtros.estado.length > 0) {
      data = data.filter((m) => filtros.estado.includes(m.estado));
    }

    // Filtro por prioridad
    if (filtros.prioridad.length > 0) {
      data = data.filter((m) => filtros.prioridad.includes(m.prioridad));
    }

    // Filtro por ubicación
    if (filtros.ubicacion) {
      data = data.filter((m) =>
        m.equipo.ubicacion.toLowerCase().includes(filtros.ubicacion.toLowerCase())
      );
    }

    // Filtro por equipo
    if (filtros.equipoNombre) {
      data = data.filter((m) =>
        m.equipo.nombre.toLowerCase().includes(filtros.equipoNombre.toLowerCase())
      );
    }

    // Filtro por fechas
    if (filtros.fechaDesde) {
      const desde = new Date(filtros.fechaDesde).getTime();
      data = data.filter((m) => new Date(m.fecha_programada).getTime() >= desde);
    }

    if (filtros.fechaHasta) {
      const hasta = new Date(filtros.fechaHasta).getTime();
      data = data.filter((m) => new Date(m.fecha_programada).getTime() <= hasta);
    }

    // Solo vencidos
    if (filtros.soloVencidos) {
      data = data.filter((m) => esVencido(m.fecha_programada, m.estado));
    }

    // Solo asignados a mí
    if (filtros.soloAsignadosAMi) {
      data = data.filter((m) => m.tecnico_asignado === usuario?.tecnico?.id_tecnico);
    }

    // No mostrar completados si está desactivado
    if (!vista.mostrarCompletados) {
      data = data.filter((m) => m.estado !== "completado");
    }

    // Búsqueda
    if (busqueda.trim()) {
      const q = busqueda.toLowerCase();
      data = data.filter(
        (m) =>
          m.descripcion.toLowerCase().includes(q) ||
          m.equipo.nombre.toLowerCase().includes(q) ||
          m.equipo.marca.toLowerCase().includes(q) ||
          m.equipo.modelo.toLowerCase().includes(q) ||
          m.equipo.ubicacion.toLowerCase().includes(q) ||
          m.nombre_tecnico.toLowerCase().includes(q)
      );
    }

    // Ordenar
    data.sort((a, b) => {
      let comparacion = 0;

      switch (filtros.ordenarPor) {
        case "fecha_programada":
          comparacion =
            new Date(a.fecha_programada).getTime() -
            new Date(b.fecha_programada).getTime();
          break;
        case "prioridad":
          const prioridades = { critica: 4, alta: 3, media: 2, baja: 1 };
          comparacion =
            prioridades[b.prioridad as keyof typeof prioridades] -
            prioridades[a.prioridad as keyof typeof prioridades];
          break;
        case "estado":
          comparacion = a.estado.localeCompare(b.estado);
          break;
        case "equipo":
          comparacion = a.equipo.nombre.localeCompare(b.equipo.nombre);
          break;
      }

      return filtros.ordenDireccion === "asc" ? comparacion : -comparacion;
    });

    return data;
  }, [mantenimientos, filtros, busqueda, usuario, vista.mostrarCompletados]);

  const mantenimientosAgrupados = useMemo(() => {
    if (vista.agruparPor === "ninguno") {
      return { "Todos los mantenimientos": mantenimientosFiltrados };
    }

    const grupos: { [key: string]: OrdenMantenimiento[] } = {};

    mantenimientosFiltrados.forEach((mantenimiento) => {
      let clave = "";

      switch (vista.agruparPor) {
        case "tipo":
          clave = TIPOS_MANTENIMIENTO.find((t) => t.value === mantenimiento.tipo_mantenimiento)?.label || mantenimiento.tipo_mantenimiento;
          break;
        case "estado":
          clave = ESTADOS_MANTENIMIENTO.find((e) => e.value === mantenimiento.estado)?.label || mantenimiento.estado;
          break;
        case "prioridad":
          clave = mantenimiento.prioridad.toUpperCase();
          break;
        case "ubicacion":
          clave = mantenimiento.equipo.ubicacion || "Sin ubicación";
          break;
        case "tecnico":
          clave = mantenimiento.nombre_tecnico;
          break;
      }

      if (!grupos[clave]) {
        grupos[clave] = [];
      }
      grupos[clave].push(mantenimiento);
    });

    return grupos;
  }, [mantenimientosFiltrados, vista.agruparPor]);

  const resumenMantenimientos = useMemo(() => {
    const total = mantenimientos.length;
    const programados = mantenimientos.filter((m) => m.estado === "programado").length;
    const en_progreso = mantenimientos.filter((m) => m.estado === "en_progreso").length;
    const completados = mantenimientos.filter((m) => m.estado === "completado").length;
    const vencidos = mantenimientos.filter((m) => esVencido(m.fecha_programada, m.estado)).length;
    const asignadosAMi = mantenimientos.filter((m) => m.tecnico_asignado === usuario?.tecnico?.id_tecnico).length;

    const tiemposResolucion = mantenimientos
      .filter((m) => m.duracion_real !== null)
      .map((m) => m.duracion_real!);
    const tiempoPromedio =
      tiemposResolucion.length > 0
        ? tiemposResolucion.reduce((sum, t) => sum + t, 0) / tiemposResolucion.length
        : 0;

    return {
      total,
      programados,
      en_progreso,
      completados,
      vencidos,
      asignadosAMi,
      tiempoPromedio,
      porTipo: {
        preventivo: mantenimientos.filter((m) => m.tipo_mantenimiento === "preventivo").length,
        correctivo: mantenimientos.filter((m) => m.tipo_mantenimiento === "correctivo").length,
        predictivo: mantenimientos.filter((m) => m.tipo_mantenimiento === "predictivo").length,
        calibracion: mantenimientos.filter((m) => m.tipo_mantenimiento === "calibracion").length,
        inspeccion: mantenimientos.filter((m) => m.tipo_mantenimiento === "inspeccion").length,
      },
    };
  }, [mantenimientos, usuario]);

  const datosPorTipo = useMemo(
    () => [
      {
        nombre: "Preventivo",
        valor: resumenMantenimientos.porTipo.preventivo,
        color: "#3b82f6",
      },
      {
        nombre: "Correctivo",
        valor: resumenMantenimientos.porTipo.correctivo,
        color: "#f97316",
      },
      {
        nombre: "Predictivo",
        valor: resumenMantenimientos.porTipo.predictivo,
        color: "#a855f7",
      },
      {
        nombre: "Calibración",
        valor: resumenMantenimientos.porTipo.calibracion,
        color: "#22c55e",
      },
      {
        nombre: "Inspección",
        valor: resumenMantenimientos.porTipo.inspeccion,
        color: "#06b6d4",
      },
    ],
    [resumenMantenimientos]
  );

  const datosPorEstado = useMemo(
    () => [
      {
        nombre: "Programado",
        valor: resumenMantenimientos.programados,
        color: "#3b82f6",
      },
      {
        nombre: "En Progreso",
        valor: resumenMantenimientos.en_progreso,
        color: "#eab308",
      },
      {
        nombre: "Completado",
        valor: resumenMantenimientos.completados,
        color: "#22c55e",
      },
    ],
    [resumenMantenimientos]
  );

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
            <div className="w-32 h-32 border-4 border-orange-400 border-t-transparent rounded-full animate-spin"></div>
            <div
              className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-20 h-20 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center animate-pulse`}
            >
              <Wrench className="w-10 h-10 text-white" />
            </div>
          </div>
          <h2 className={`text-4xl font-black mb-4 ${tema.colores.texto}`}>
            Cargando Mantenimientos
          </h2>
          <p
            className={`text-lg font-semibold ${tema.colores.textoSecundario} animate-pulse`}
          >
            Sincronizando órdenes de mantenimiento...
          </p>
          <div className="mt-8 flex items-center justify-center gap-2">
            <div
              className="w-3 h-3 rounded-full bg-orange-500 animate-bounce"
              style={{ animationDelay: "0ms" }}
            ></div>
            <div
              className="w-3 h-3 rounded-full bg-red-500 animate-bounce"
              style={{ animationDelay: "150ms" }}
            ></div>
            <div
              className="w-3 h-3 rounded-full bg-yellow-500 animate-bounce"
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
            className={`w-24 h-24 bg-gradient-to-br from-red-500 to-orange-500 rounded-3xl flex items-center justify-center mx-auto mb-6 animate-pulse`}
          >
            <AlertTriangle className="w-12 h-12 text-white" />
          </div>
          <h2 className={`text-3xl font-black mb-4 ${tema.colores.texto}`}>
            Acceso No Autorizado
          </h2>
          <p className={`text-lg mb-8 ${tema.colores.textoSecundario}`}>
            No tienes permisos para acceder al módulo de mantenimiento.
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
          {/* Breadcrumb y búsqueda */}
          <div className="flex-1 max-w-3xl">
            <div className="flex items-center gap-2 mb-2">
              <Link
                href="/tecnico/dashboard"
                className={`text-sm font-semibold ${tema.colores.textoSecundario} hover:${tema.colores.acento} transition-colors`}
              >
                Dashboard
              </Link>
              <ChevronRight className="w-4 h-4 text-gray-500" />
              <span className={`text-sm font-bold ${tema.colores.acento}`}>
                Mantenimiento
              </span>
            </div>

            <div className="relative">
              <Search
                className={`absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 ${tema.colores.textoSecundario}`}
              />
              <input
                type="text"
                placeholder="Buscar por equipo, ubicación, descripción..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className={`w-full pl-12 pr-4 py-3 rounded-xl ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto} placeholder:${tema.colores.textoSecundario} focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition-all duration-300`}
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
            {/* Auto-refresh */}
            <div className="relative group">
              <button
                onClick={() => setAutoRefresh(!autoRefresh)}
                className={`p-3 rounded-xl font-semibold transition-all duration-300 ${
                  autoRefresh
                    ? `bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg`
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
                  ⚡ Auto-actualización
                </p>
                <div className="space-y-2">
                  <button
                    onClick={() => setIntervaloRefresh(60000)}
                    className={`w-full px-3 py-2 rounded-lg text-sm font-semibold transition-all ${
                      intervaloRefresh === 60000
                        ? `bg-gradient-to-r from-orange-500 to-red-500 text-white`
                        : `${tema.colores.hover} ${tema.colores.texto}`
                    }`}
                  >
                    1 minuto
                  </button>
                  <button
                    onClick={() => setIntervaloRefresh(300000)}
                    className={`w-full px-3 py-2 rounded-lg text-sm font-semibold transition-all ${
                      intervaloRefresh === 300000
                        ? `bg-gradient-to-r from-orange-500 to-red-500 text-white`
                        : `${tema.colores.hover} ${tema.colores.texto}`
                    }`}
                  >
                    5 minutos
                  </button>
                  <button
                    onClick={() => setIntervaloRefresh(600000)}
                    className={`w-full px-3 py-2 rounded-lg text-sm font-semibold transition-all ${
                      intervaloRefresh === 600000
                        ? `bg-gradient-to-r from-orange-500 to-red-500 text-white`
                        : `${tema.colores.hover} ${tema.colores.texto}`
                    }`}
                  >
                    10 minutos
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
                  className={`w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center text-white font-bold shadow-lg`}
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
                      className={`w-16 h-16 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center text-white font-bold text-xl shadow-lg`}
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
        } pt-32 p-8 ${panelDetalleAbierto ? "mr-[500px]" : ""}`}
      >
        {/* Encabezado */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2
                className={`text-5xl font-black mb-2 ${tema.colores.texto} flex items-center gap-3`}
              >
                {obtenerSaludo()}, {usuario.nombre}
                <span className="animate-pulse inline-block">🔧</span>
              </h2>
              <p className={`text-xl font-semibold ${tema.colores.textoSecundario}`}>
                Sistema de Gestión de Mantenimiento Preventivo y Correctivo
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
                  onClick={() => setMostrarModalNuevo(true)}
                  className={`flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white rounded-xl font-bold transition-all duration-300 hover:scale-105 shadow-xl shadow-orange-500/50`}
                >
                  <Plus className="w-5 h-5" />
                  Nueva Orden
                </button>

                <button
                  onClick={() => cargarMantenimientos()}
                  disabled={loadingMantenimientos}
                  className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all duration-300 ${tema.colores.secundario} ${tema.colores.texto} hover:scale-105`}
                >
                  <RefreshCw
                    className={`w-5 h-5 ${loadingMantenimientos ? "animate-spin" : ""}`}
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
                      onClick={() => exportarMantenimientos("csv")}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all ${tema.colores.hover} ${tema.colores.texto}`}
                    >
                      <FileText className="w-4 h-4" />
                      Exportar CSV
                    </button>
                    <button
                      onClick={() => exportarMantenimientos("excel")}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all ${tema.colores.hover} ${tema.colores.texto}`}
                    >
                      <FileText className="w-4 h-4" />
                      Exportar Excel
                    </button>
                    <button
                      onClick={() => exportarMantenimientos("pdf")}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all ${tema.colores.hover} ${tema.colores.texto}`}
                    >
                      <FileDown className="w-4 h-4" />
                      Exportar PDF
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tarjetas de resumen */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6 mb-8">
          {/* Total Mantenimientos */}
          <div
            className={`rounded-2xl p-6 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} transition-all duration-300 hover:scale-105 hover:-translate-y-1 cursor-pointer group`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <Wrench className="w-6 h-6 text-white" />
              </div>
              <Activity className="w-5 h-5 text-orange-400" />
            </div>
            <div className={`text-4xl font-black mb-1 ${tema.colores.texto}`}>
              {resumenMantenimientos.total}
            </div>
            <div
              className={`text-xs font-bold uppercase tracking-wider ${tema.colores.textoSecundario}`}
            >
              Total Órdenes
            </div>
          </div>

          {/* Programados */}
          <div
            className={`rounded-2xl p-6 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} transition-all duration-300 hover:scale-105 hover:-translate-y-1 cursor-pointer group`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <Clock className="w-5 h-5 text-blue-400" />
            </div>
            <div className={`text-4xl font-black mb-1 ${tema.colores.texto}`}>
              {resumenMantenimientos.programados}
            </div>
            <div
              className={`text-xs font-bold uppercase tracking-wider ${tema.colores.textoSecundario}`}
            >
              Programados
            </div>
          </div>

          {/* En Progreso */}
          <div
            className={`rounded-2xl p-6 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} transition-all duration-300 hover:scale-105 hover:-translate-y-1 cursor-pointer group`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-amber-500 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <Play className="w-6 h-6 text-white" />
              </div>
              <TrendingUp className="w-5 h-5 text-yellow-400" />
            </div>
            <div className={`text-4xl font-black mb-1 ${tema.colores.texto}`}>
              {resumenMantenimientos.en_progreso}
            </div>
            <div
              className={`text-xs font-bold uppercase tracking-wider ${tema.colores.textoSecundario}`}
            >
              En Progreso
            </div>
          </div>

          {/* Completados */}
          <div
            className={`rounded-2xl p-6 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} transition-all duration-300 hover:scale-105 hover:-translate-y-1 cursor-pointer group`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <CheckCircle2 className="w-6 h-6 text-white" />
              </div>
              <Trophy className="w-5 h-5 text-green-400" />
            </div>
            <div className={`text-4xl font-black mb-1 ${tema.colores.texto}`}>
              {resumenMantenimientos.completados}
            </div>
            <div
              className={`text-xs font-bold uppercase tracking-wider ${tema.colores.textoSecundario}`}
            >
              Completados
            </div>
          </div>

          {/* Vencidos */}
          <div
            className={`rounded-2xl p-6 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} transition-all duration-300 hover:scale-105 hover:-translate-y-1 cursor-pointer group`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-rose-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <AlertTriangle className="w-6 h-6 text-white" />
              </div>
              <Flame className="w-5 h-5 text-red-400" />
            </div>
            <div className={`text-4xl font-black mb-1 ${tema.colores.texto}`}>
              {resumenMantenimientos.vencidos}
            </div>
            <div
              className={`text-xs font-bold uppercase tracking-wider ${tema.colores.textoSecundario}`}
            >
              Vencidos
            </div>
          </div>

          {/* Asignados a Mí */}
          <div
            className={`rounded-2xl p-6 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} transition-all duration-300 hover:scale-105 hover:-translate-y-1 cursor-pointer group`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <UserCheck className="w-6 h-6 text-white" />
              </div>
              <User className="w-5 h-5 text-purple-400" />
            </div>
            <div className={`text-4xl font-black mb-1 ${tema.colores.texto}`}>
              {resumenMantenimientos.asignadosAMi}
            </div>
            <div
              className={`text-xs font-bold uppercase tracking-wider ${tema.colores.textoSecundario}`}
            >
              Asignados a Mí
            </div>
          </div>
        </div>

        {/* Gráficos de análisis */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Gráfico por tipo */}
          <div
            className={`rounded-2xl p-6 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra}`}
          >
            <div className="flex items-center gap-3 mb-6">
              <div
                className={`w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg`}
              >
                <PieChart className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className={`text-lg font-black ${tema.colores.texto}`}>
                  Por Tipo
                </h3>
                <p className={`text-xs font-semibold ${tema.colores.textoSecundario}`}>
                  Distribución
                </p>
              </div>
            </div>

            <ResponsiveContainer width="100%" height={250}>
              <RechartsPieChart>
                <Pie
                  data={datosPorTipo}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="valor"
                  label={({ nombre, valor }) => `${nombre}: ${valor}`}
                >
                  {datosPorTipo.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </RechartsPieChart>
            </ResponsiveContainer>
          </div>

          {/* Gráfico por estado */}
          <div
            className={`rounded-2xl p-6 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra}`}
          >
            <div className="flex items-center gap-3 mb-6">
              <div
                className={`w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg`}
              >
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className={`text-lg font-black ${tema.colores.texto}`}>
                  Por Estado
                </h3>
                <p className={`text-xs font-semibold ${tema.colores.textoSecundario}`}>
                  Progreso
                </p>
              </div>
            </div>

            <ResponsiveContainer width="100%" height={250}>
              <RechartsBarChart data={datosPorEstado}>
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
                    border: "1px solid rgba(249,115,22,0.3)",
                    borderRadius: "12px",
                    padding: "12px",
                  }}
                />
                <Bar dataKey="valor" radius={[8, 8, 0, 0]}>
                  {datosPorEstado.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </RechartsBarChart>
            </ResponsiveContainer>
          </div>

          {/* Estadísticas rápidas */}
          <div
            className={`rounded-2xl p-6 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra}`}
          >
            <div className="flex items-center gap-3 mb-6">
              <div
                className={`w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg`}
              >
                <Target className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className={`text-lg font-black ${tema.colores.texto}`}>
                  Métricas Clave
                </h3>
                <p className={`text-xs font-semibold ${tema.colores.textoSecundario}`}>
                  Rendimiento
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className={`p-4 rounded-xl ${tema.colores.secundario}`}>
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-sm font-semibold ${tema.colores.textoSecundario}`}>
                    Tiempo Promedio
                  </span>
                  <Clock className="w-4 h-4 text-blue-400" />
                </div>
                <p className={`text-2xl font-black ${tema.colores.texto}`}>
                  {formatearTiempo(Math.round(resumenMantenimientos.tiempoPromedio))}
                </p>
              </div>

              <div className={`p-4 rounded-xl ${tema.colores.secundario}`}>
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-sm font-semibold ${tema.colores.textoSecundario}`}>
                    Tasa Completitud
                  </span>
                  <TrendingUp className="w-4 h-4 text-green-400" />
                </div>
                <p className={`text-2xl font-black ${tema.colores.texto}`}>
                  {resumenMantenimientos.total > 0
                    ? Math.round(
                        (resumenMantenimientos.completados / resumenMantenimientos.total) * 100
                      )
                    : 0}
                  %
                </p>
              </div>

              <div className={`p-4 rounded-xl ${tema.colores.secundario}`}>
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-sm font-semibold ${tema.colores.textoSecundario}`}>
                    Preventivos
                  </span>
                  <Shield className="w-4 h-4 text-purple-400" />
                </div>
                <p className={`text-2xl font-black ${tema.colores.texto}`}>
                  {resumenMantenimientos.porTipo.preventivo}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Barra de herramientas */}
        <div
          className={`rounded-2xl p-5 mb-8 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra}`}
        >
          <div className="flex flex-wrap gap-4 items-center justify-between">
            {/* Controles de vista */}
            <div className="flex flex-wrap gap-2">
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-gray-500/10">
                <span className={`text-sm font-semibold ${tema.colores.texto}`}>
                  Vista:
                </span>
                <button
                  onClick={() => cambiarVista({ modo: "tarjetas" })}
                  className={`p-2 rounded-lg transition-all ${
                    vista.modo === "tarjetas"
                      ? `bg-gradient-to-r from-orange-500 to-red-500 text-white`
                      : `${tema.colores.hover} ${tema.colores.texto}`
                  }`}
                  title="Vista de tarjetas"
                >
                  <Box className="w-4 h-4" />
                </button>
                <button
                  onClick={() => cambiarVista({ modo: "lista" })}
                  className={`p-2 rounded-lg transition-all ${
                    vista.modo === "lista"
                      ? `bg-gradient-to-r from-orange-500 to-red-500 text-white`
                      : `${tema.colores.hover} ${tema.colores.texto}`
                  }`}
                  title="Vista de lista"
                >
                  <Layers className="w-4 h-4" />
                </button>
                <button
                  onClick={() => cambiarVista({ modo: "tabla" })}
                  className={`p-2 rounded-lg transition-all ${
                    vista.modo === "tabla"
                      ? `bg-gradient-to-r from-orange-500 to-red-500 text-white`
                      : `${tema.colores.hover} ${tema.colores.texto}`
                  }`}
                  title="Vista de tabla"
                >
                  <BarChart3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => cambiarVista({ modo: "calendario" })}
                  className={`p-2 rounded-lg transition-all ${
                    vista.modo === "calendario"
                      ? `bg-gradient-to-r from-orange-500 to-red-500 text-white`
                      : `${tema.colores.hover} ${tema.colores.texto}`
                  }`}
                  title="Vista de calendario"
                >
                  <Calendar className="w-4 h-4" />
                </button>
                <button
                  onClick={() => cambiarVista({ modo: "kanban" })}
                  className={`p-2 rounded-lg transition-all ${
                    vista.modo === "kanban"
                      ? `bg-gradient-to-r from-orange-500 to-red-500 text-white`
                      : `${tema.colores.hover} ${tema.colores.texto}`
                  }`}
                  title="Vista kanban"
                >
                  <Layers className="w-4 h-4" />
                </button>
              </div>

              <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-gray-500/10">
                <span className={`text-sm font-semibold ${tema.colores.texto}`}>
                  Agrupar:
                </span>
                <select
                  value={vista.agruparPor}
                  onChange={(e) =>
                    cambiarVista({
                      agruparPor: e.target.value as VistaMantenimiento["agruparPor"],
                    })
                  }
                  className={`px-3 py-1 rounded-lg ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto} text-sm font-semibold cursor-pointer`}
                >
                  <option value="ninguno">Sin agrupar</option>
                  <option value="tipo">Por tipo</option>
                  <option value="estado">Por estado</option>
                  <option value="prioridad">Por prioridad</option>
                  <option value="ubicacion">Por ubicación</option>
                  <option value="tecnico">Por técnico</option>
                </select>
              </div>

              <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-gray-500/10">
                <span className={`text-sm font-semibold ${tema.colores.texto}`}>
                  Ordenar:
                </span>
                <select
                  value={filtros.ordenarPor}
                  onChange={(e) =>
                    setFiltros({
                      ...filtros,
                      ordenarPor: e.target.value as FiltrosMantenimiento["ordenarPor"],
                    })
                  }
                  className={`px-3 py-1 rounded-lg ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto} text-sm font-semibold cursor-pointer`}
                >
                  <option value="fecha_programada">Fecha programada</option>
                  <option value="prioridad">Prioridad</option>
                  <option value="estado">Estado</option>
                  <option value="equipo">Equipo</option>
                </select>
                <button
                  onClick={() =>
                    setFiltros({
                      ...filtros,
                      ordenDireccion: filtros.ordenDireccion === "asc" ? "desc" : "asc",
                    })
                  }
                  className={`p-2 rounded-lg transition-all ${tema.colores.hover} ${tema.colores.texto}`}
                >
                  {filtros.ordenDireccion === "asc" ? (
                    <SortAsc className="w-4 h-4" />
                  ) : (
                    <SortDesc className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Acciones */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setModoSeleccionMultiple(!modoSeleccionMultiple)}
                className={`px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 transition-all duration-300 ${
                  modoSeleccionMultiple
                    ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg"
                    : `${tema.colores.secundario} ${tema.colores.texto}`
                }`}
              >
                <CheckSquare className="w-4 h-4" />
                Selección múltiple
              </button>

              <button
                onClick={() => cambiarVista({ mostrarCompletados: !vista.mostrarCompletados })}
                className={`px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 transition-all duration-300 ${
                  vista.mostrarCompletados
                    ? "bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg"
                    : `${tema.colores.secundario} ${tema.colores.texto}`
                }`}
              >
                {vista.mostrarCompletados ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                Completados
              </button>

              <button
                onClick={() => setMostrarFiltrosAvanzados(!mostrarFiltrosAvanzados)}
                className={`px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 transition-all duration-300 ${
                  mostrarFiltrosAvanzados
                    ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg"
                    : `${tema.colores.secundario} ${tema.colores.texto}`
                }`}
              >
                <Filter className="w-4 h-4" />
                Filtros avanzados
              </button>
            </div>
          </div>

          {/* Filtros avanzados colapsables */}
          {mostrarFiltrosAvanzados && (
            <div className="mt-4 pt-4 border-t border-gray-700/50">
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                <div>
                  <label
                    className={`block text-sm font-semibold mb-2 ${tema.colores.texto}`}
                  >
                    🔧 Tipo
                  </label>
                  <div className="space-y-2">
                    {TIPOS_MANTENIMIENTO.map((tipo) => (
                      <label
                        key={tipo.value}
                        className="flex items-center gap-2 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={filtros.tipo.includes(tipo.value)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFiltros({
                                ...filtros,
                                tipo: [...filtros.tipo, tipo.value],
                              });
                            } else {
                              setFiltros({
                                ...filtros,
                                tipo: filtros.tipo.filter((t) => t !== tipo.value),
                              });
                            }
                          }}
                          className="w-4 h-4 rounded"
                        />
                        <span
                          className={`text-sm font-semibold ${tema.colores.texto}`}
                        >
                          {tipo.label}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label
                    className={`block text-sm font-semibold mb-2 ${tema.colores.texto}`}
                  >
                    📊 Estado
                  </label>
                  <div className="space-y-2">
                    {ESTADOS_MANTENIMIENTO.map((estado) => (
                      <label
                        key={estado.value}
                        className="flex items-center gap-2 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={filtros.estado.includes(estado.value)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFiltros({
                                ...filtros,
                                estado: [...filtros.estado, estado.value],
                              });
                            } else {
                              setFiltros({
                                ...filtros,
                                estado: filtros.estado.filter((s) => s !== estado.value),
                              });
                            }
                          }}
                          className="w-4 h-4 rounded"
                        />
                        <span
                          className={`text-sm font-semibold ${tema.colores.texto}`}
                        >
                          {estado.label}
                        </span>
                      </label>
                    ))}
                  </div>
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

                <div>
                  <label
                    className={`block text-sm font-semibold mb-2 ${tema.colores.texto}`}
                  >
                    💻 Equipo
                  </label>
                  <input
                    type="text"
                    placeholder="Filtrar por equipo..."
                    value={filtros.equipoNombre}
                    onChange={(e) =>
                      setFiltros({ ...filtros, equipoNombre: e.target.value })
                    }
                    className={`w-full px-4 py-2 rounded-xl ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto} placeholder:${tema.colores.textoSecundario}`}
                  />
                </div>

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

                <div className="flex flex-col gap-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filtros.soloVencidos}
                      onChange={(e) =>
                        setFiltros({ ...filtros, soloVencidos: e.target.checked })
                      }
                      className="w-4 h-4 rounded"
                    />
                    <span className={`text-sm font-semibold ${tema.colores.texto}`}>
                      ⚠️ Solo vencidos
                    </span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filtros.soloAsignadosAMi}
                      onChange={(e) =>
                        setFiltros({ ...filtros, soloAsignadosAMi: e.target.checked })
                      }
                      className="w-4 h-4 rounded"
                    />
                    <span className={`text-sm font-semibold ${tema.colores.texto}`}>
                      👤 Solo asignados a mí
                    </span>
                  </label>
                </div>

                <div className="flex items-end">
                  <button
                    onClick={() =>
                      setFiltros({
                        tipo: [],
                        estado: [],
                        prioridad: [],
                        ubicacion: "",
                        equipoNombre: "",
                        fechaDesde: "",
                        fechaHasta: "",
                        tecnicoAsignado: "",
                        soloVencidos: false,
                        soloAsignadosAMi: false,
                        ordenarPor: "fecha_programada",
                        ordenDireccion: "asc",
                      })
                    }
                    className={`w-full px-4 py-2 rounded-xl text-sm font-semibold transition-all ${tema.colores.secundario} ${tema.colores.texto}`}
                  >
                    Limpiar filtros
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Contenido principal: Mantenimientos */}
        {loadingMantenimientos ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <Loader2 className="w-16 h-16 animate-spin text-orange-500 mx-auto mb-4" />
              <p className={`text-lg font-semibold ${tema.colores.textoSecundario}`}>
                Cargando órdenes de mantenimiento...
              </p>
            </div>
          </div>
        ) : mantenimientosFiltrados.length === 0 ? (
          <div
            className={`rounded-2xl p-12 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} text-center`}
          >
            <div
              className={`w-24 h-24 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse`}
            >
              <Package className="w-12 h-12 text-white" />
            </div>
            <h3 className={`text-3xl font-black mb-4 ${tema.colores.texto}`}>
              📦 Sin Resultados
            </h3>
            <p className={`text-lg ${tema.colores.textoSecundario} mb-6`}>
              No hay órdenes de mantenimiento que coincidan con los filtros aplicados.
            </p>
            <div className="flex items-center justify-center gap-4">
              <button
                onClick={() => {
                  setFiltros({
                    tipo: [],
                    estado: [],
                    prioridad: [],
                    ubicacion: "",
                    equipoNombre: "",
                    fechaDesde: "",
                    fechaHasta: "",
                    tecnicoAsignado: "",
                    soloVencidos: false,
                    soloAsignadosAMi: false,
                    ordenarPor: "fecha_programada",
                    ordenDireccion: "asc",
                  });
                  setBusqueda("");
                }}
                className={`px-6 py-3 rounded-xl font-bold transition-all duration-300 ${tema.colores.secundario} ${tema.colores.texto} hover:scale-105`}
              >
                Limpiar filtros
              </button>
              <button
                onClick={() => setMostrarModalNuevo(true)}
                className={`px-6 py-3 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white rounded-xl font-bold transition-all duration-300 hover:scale-105 shadow-xl`}
              >
                <Plus className="w-5 h-5 inline mr-2" />
                Nueva Orden
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(mantenimientosAgrupados).map(([grupo, mantenimientos]) => (
              <div key={grupo}>
                {vista.agruparPor !== "ninguno" && (
                  <div className="flex items-center gap-3 mb-4">
                    <h3 className={`text-2xl font-black ${tema.colores.texto}`}>
                      {grupo}
                    </h3>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-bold ${tema.colores.info}`}
                    >
                      {mantenimientos.length} órdenes
                    </span>
                  </div>
                )}

                {/* Vista de tarjetas */}
                {vista.modo === "tarjetas" && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                    {mantenimientos.map((mantenimiento) => {
                      const IconoTipo = obtenerIconoTipo(mantenimiento.tipo_mantenimiento);
                      const IconoEstado = obtenerIconoEstado(mantenimiento.estado);
                      const isSeleccionado = mantenimientosSeleccionados.includes(
                        mantenimiento.id_mantenimiento
                      );
                      const vencido = esVencido(mantenimiento.fecha_programada, mantenimiento.estado);

                      return (
                        <div
                          key={mantenimiento.id_mantenimiento}
                          className={`rounded-2xl p-6 ${tema.colores.card} ${
                            tema.colores.borde
                          } border ${
                            tema.colores.sombra
                          } transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1 cursor-pointer group ${
                            isSeleccionado ? "ring-2 ring-purple-500" : ""
                          } ${vencido ? "ring-2 ring-red-500/50" : ""} relative`}
                          onClick={() => {
                            if (modoSeleccionMultiple) {
                              toggleSeleccionMantenimiento(mantenimiento.id_mantenimiento);
                            } else {
                              setMantenimientoSeleccionado(mantenimiento);
                              setPanelDetalleAbierto(true);
                            }
                          }}
                        >
                          {/* Checkbox selección múltiple */}
                          {modoSeleccionMultiple && (
                            <div className="absolute top-4 right-4 z-10">
                              <input
                                type="checkbox"
                                checked={isSeleccionado}
                                onChange={() => toggleSeleccionMantenimiento(mantenimiento.id_mantenimiento)}
                                className="w-5 h-5 rounded"
                                onClick={(e) => e.stopPropagation()}
                              />
                            </div>
                          )}

                          {/* Badge de vencido */}
                          {vencido && (
                            <div className="absolute top-4 left-4">
                              <span className="px-2 py-1 rounded-full text-xs font-bold bg-red-500/20 text-red-300 border border-red-500/40 animate-pulse">
                                ⚠️ Vencido
                              </span>
                            </div>
                          )}

                          <div className="flex items-start gap-4 mt-8">
                            {/* Foto del equipo */}
                            <div
                              className={`relative w-20 h-20 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center text-white font-bold text-xl shadow-lg flex-shrink-0 group-hover:scale-110 transition-transform overflow-hidden`}
                            >
                              {mantenimiento.equipo.foto_url ? (
                                <Image
                                  src={mantenimiento.equipo.foto_url}
                                  alt={mantenimiento.equipo.nombre}
                                  fill
                                  className="object-cover"
                                />
                              ) : (
                                <IconoTipo className="w-10 h-10" />
                              )}
                              <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-orange-600 rounded-full flex items-center justify-center shadow-lg">
                                <IconoEstado className="w-4 h-4 text-white" />
                              </div>
                            </div>

                            {/* Info */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between mb-2">
                                <h4
                                  className={`text-lg font-black ${tema.colores.texto} mb-1 line-clamp-2`}
                                >
                                  {mantenimiento.equipo.nombre}
                                </h4>
                              </div>

                              <div className="flex flex-wrap items-center gap-2 mb-3">
                                <span
                                  className={`px-3 py-1 rounded-full text-xs font-bold border ${obtenerColorPrioridad(
                                    mantenimiento.prioridad
                                  )}`}
                                >
                                  {mantenimiento.prioridad.toUpperCase()}
                                </span>
                                <span
                                  className={`px-3 py-1 rounded-full text-xs font-bold border ${obtenerColorEstado(
                                    mantenimiento.estado
                                  )}`}
                                >
                                  {ESTADOS_MANTENIMIENTO.find((e) => e.value === mantenimiento.estado)?.label || mantenimiento.estado}
                                </span>
                                <span
                                  className={`px-3 py-1 rounded-full text-xs font-bold border ${tema.colores.info}`}
                                >
                                  {TIPOS_MANTENIMIENTO.find((t) => t.value === mantenimiento.tipo_mantenimiento)?.label || mantenimiento.tipo_mantenimiento}
                                </span>
                              </div>

                              <p
                                className={`text-sm mb-3 ${tema.colores.textoSecundario} line-clamp-2`}
                              >
                                {mantenimiento.descripcion}
                              </p>

                              <div className="space-y-2 mb-4">
                                <div className="flex items-center gap-2">
                                  <HardDrive className="w-4 h-4 text-gray-500" />
                                  <span
                                    className={`text-xs font-semibold ${tema.colores.texto}`}
                                  >
                                    {mantenimiento.equipo.marca} {mantenimiento.equipo.modelo}
                                  </span>
                                </div>

                                <div className="flex items-center gap-2">
                                  <MapPin className="w-4 h-4 text-gray-500" />
                                  <span
                                    className={`text-xs font-semibold ${tema.colores.texto}`}
                                  >
                                    {mantenimiento.equipo.ubicacion}
                                  </span>
                                </div>

                                <div className="flex items-center gap-2">
                                  <Calendar className="w-4 h-4 text-gray-500" />
                                  <span
                                    className={`text-xs font-semibold ${tema.colores.texto}`}
                                  >
                                    Programado: {formatearFecha(mantenimiento.fecha_programada)}
                                  </span>
                                </div>

                                <div className="flex items-center gap-2">
                                  <UserCheck className="w-4 h-4 text-gray-500" />
                                  <span
                                    className={`text-xs font-semibold ${tema.colores.texto}`}
                                  >
                                    {mantenimiento.nombre_tecnico}
                                  </span>
                                </div>

                                {mantenimiento.duracion_estimada && (
                                  <div className="flex items-center gap-2">
                                    <Clock className="w-4 h-4 text-gray-500" />
                                    <span
                                      className={`text-xs font-semibold ${tema.colores.texto}`}
                                    >
                                      Duración: {formatearTiempo(mantenimiento.duracion_estimada)}
                                    </span>
                                  </div>
                                )}
                              </div>

                              <div className="flex flex-wrap items-center gap-2">
                                {mantenimiento.estado === "programado" && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      iniciarMantenimiento(mantenimiento.id_mantenimiento);
                                    }}
                                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold text-xs transition-all duration-300 hover:scale-105 flex items-center gap-1 shadow-lg"
                                  >
                                    <Play className="w-3 h-3" />
                                    Iniciar
                                  </button>
                                )}

                                {mantenimiento.estado === "en_progreso" && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      completarMantenimiento(mantenimiento.id_mantenimiento);
                                    }}
                                    className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold text-xs transition-all duration-300 hover:scale-105 flex items-center gap-1 shadow-lg"
                                  >
                                    <CheckCircle2 className="w-3 h-3" />
                                    Completar
                                  </button>
                                )}

                                {(mantenimiento.estado === "programado" || mantenimiento.estado === "en_progreso") && (
                                  <>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        const nuevaFecha = prompt("Nueva fecha (YYYY-MM-DD HH:mm):");
                                        if (nuevaFecha) {
                                          reprogramarMantenimiento(mantenimiento.id_mantenimiento, nuevaFecha);
                                        }
                                      }}
                                      className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold text-xs transition-all duration-300 hover:scale-105 flex items-center gap-1 shadow-lg"
                                    >
                                      <RotateCw className="w-3 h-3" />
                                      Reprogramar
                                    </button>

                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        const motivo = prompt("Motivo de cancelación:");
                                        if (motivo) {
                                          cancelarMantenimiento(mantenimiento.id_mantenimiento, motivo);
                                        }
                                      }}
                                      className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold text-xs transition-all duration-300 hover:scale-105 flex items-center gap-1 shadow-lg"
                                    >
                                      <X className="w-3 h-3" />
                                      Cancelar
                                    </button>
                                  </>
                                )}

                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setMantenimientoSeleccionado(mantenimiento);
                                    setPanelDetalleAbierto(true);
                                  }}
                                  className={`p-1.5 rounded-lg ${tema.colores.secundario} ${tema.colores.texto} hover:scale-105 transition-all duration-300`}
                                >
                                  <MoreVertical className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          </div>

                          {/* Progress bar del checklist */}
                          {mantenimiento.checklist && mantenimiento.checklist.length > 0 && (
                            <div className="mt-4 pt-4 border-t border-gray-700/50">
                              <div className="flex items-center justify-between mb-2">
                                <span className={`text-xs font-semibold ${tema.colores.textoSecundario}`}>
                                  Checklist
                                </span>
                                <span className={`text-xs font-bold ${tema.colores.texto}`}>
                                  {mantenimiento.checklist.filter((c) => c.completado).length}/
                                  {mantenimiento.checklist.length}
                                </span>
                              </div>
                              <div className="w-full bg-gray-700 rounded-full h-2">
                                <div
                                  className="bg-gradient-to-r from-orange-500 to-red-500 h-2 rounded-full transition-all duration-300"
                                  style={{
                                    width: `${
                                      (mantenimiento.checklist.filter((c) => c.completado).length /
                                        mantenimiento.checklist.length) *
                                      100
                                    }%`,
                                  }}
                                ></div>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Vista de lista */}
                {vista.modo === "lista" && (
                  <div className="space-y-4">
                    {mantenimientos.map((mantenimiento) => {
                      const IconoTipo = obtenerIconoTipo(mantenimiento.tipo_mantenimiento);
                      const IconoEstado = obtenerIconoEstado(mantenimiento.estado);
                      const isSeleccionado = mantenimientosSeleccionados.includes(
                        mantenimiento.id_mantenimiento
                      );
                      const vencido = esVencido(mantenimiento.fecha_programada, mantenimiento.estado);

                      return (
                        <div
                          key={mantenimiento.id_mantenimiento}
                          className={`rounded-xl p-4 ${tema.colores.card} ${
                            tema.colores.borde
                          } border transition-all duration-300 hover:scale-[1.01] cursor-pointer ${
                            isSeleccionado ? "ring-2 ring-purple-500" : ""
                          } ${vencido ? "ring-2 ring-red-500/50" : ""}`}
                          onClick={() => {
                            if (modoSeleccionMultiple) {
                              toggleSeleccionMantenimiento(mantenimiento.id_mantenimiento);
                            } else {
                              setMantenimientoSeleccionado(mantenimiento);
                              setPanelDetalleAbierto(true);
                            }
                          }}
                        >
                          <div className="flex items-center gap-4">
                            {modoSeleccionMultiple && (
                              <input
                                type="checkbox"
                                checked={isSeleccionado}
                                onChange={() => toggleSeleccionMantenimiento(mantenimiento.id_mantenimiento)}
                                className="w-5 h-5 rounded"
                                onClick={(e) => e.stopPropagation()}
                              />
                            )}

                            <div
                              className={`w-12 h-12 rounded-lg bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center flex-shrink-0 relative overflow-hidden`}
                            >
                              {mantenimiento.equipo.foto_url ? (
                                <Image
                                  src={mantenimiento.equipo.foto_url}
                                  alt={mantenimiento.equipo.nombre}
                                  fill
                                  className="object-cover"
                                />
                              ) : (
                                <IconoTipo className="w-6 h-6 text-white" />
                              )}
                            </div>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <h4
                                  className={`text-base font-bold ${tema.colores.texto}`}
                                >
                                  {mantenimiento.equipo.nombre}
                                </h4>
                                <span
                                  className={`px-2 py-0.5 rounded-full text-xs font-bold border ${obtenerColorPrioridad(
                                    mantenimiento.prioridad
                                  )}`}
                                >
                                  {mantenimiento.prioridad}
                                </span>
                                <span
                                  className={`px-2 py-0.5 rounded-full text-xs font-bold border ${obtenerColorEstado(
                                    mantenimiento.estado
                                  )}`}
                                >
                                  {ESTADOS_MANTENIMIENTO.find((e) => e.value === mantenimiento.estado)?.label}
                                </span>
                                {vencido && (
                                  <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-red-500/20 text-red-300 border border-red-500/40 animate-pulse">
                                    Vencido
                                  </span>
                                )}
                              </div>
                              <p
                                className={`text-sm ${tema.colores.textoSecundario} line-clamp-1`}
                              >
                                {mantenimiento.descripcion} • {mantenimiento.equipo.ubicacion}
                              </p>
                            </div>

                            <div className="flex items-center gap-4">
                              <div className="text-right">
                                <p className={`text-sm font-semibold ${tema.colores.texto}`}>
                                  {formatearFecha(mantenimiento.fecha_programada)}
                                </p>
                                <p className={`text-xs ${tema.colores.textoSecundario}`}>
                                  {mantenimiento.nombre_tecnico}
                                </p>
                              </div>

                              <div className="flex items-center gap-2">
                                {mantenimiento.estado === "programado" && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      iniciarMantenimiento(mantenimiento.id_mantenimiento);
                                    }}
                                    className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all duration-300 hover:scale-105"
                                  >
                                    <Play className="w-4 h-4" />
                                  </button>
                                )}

                                {mantenimiento.estado === "en_progreso" && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      completarMantenimiento(mantenimiento.id_mantenimiento);
                                    }}
                                    className="p-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-all duration-300 hover:scale-105"
                                  >
                                    <CheckCircle2 className="w-4 h-4" />
                                  </button>
                                )}

                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setMantenimientoSeleccionado(mantenimiento);
                                    setPanelDetalleAbierto(true);
                                  }}
                                  className={`p-2 rounded-lg ${tema.colores.secundario} ${tema.colores.texto} hover:scale-105 transition-all duration-300`}
                                >
                                  <ChevronRight className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Vista de tabla */}
                {vista.modo === "tabla" && (
                  <div
                    className={`rounded-2xl overflow-hidden ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra}`}
                  >
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className={`${tema.colores.secundario}`}>
                          <tr>
                            {modoSeleccionMultiple && (
                              <th className="px-4 py-3 text-left">
                                <input
                                  type="checkbox"
                                  checked={
                                    mantenimientosSeleccionados.length === mantenimientos.length &&
                                    mantenimientos.length > 0
                                  }
                                  onChange={seleccionarTodos}
                                  className="w-5 h-5 rounded"
                                />
                              </th>
                            )}
                            <th
                              className={`px-4 py-3 text-left text-xs font-bold uppercase ${tema.colores.texto}`}
                            >
                              Estado
                            </th>
                            <th
                              className={`px-4 py-3 text-left text-xs font-bold uppercase ${tema.colores.texto}`}
                            >
                              Equipo
                            </th>
                            <th
                              className={`px-4 py-3 text-left text-xs font-bold uppercase ${tema.colores.texto}`}
                            >
                              Tipo
                            </th>
                            <th
                              className={`px-4 py-3 text-left text-xs font-bold uppercase ${tema.colores.texto}`}
                            >
                              Prioridad
                            </th>
                            <th
                              className={`px-4 py-3 text-left text-xs font-bold uppercase ${tema.colores.texto}`}
                            >
                              Ubicación
                            </th>
                            <th
                              className={`px-4 py-3 text-left text-xs font-bold uppercase ${tema.colores.texto}`}
                            >
                              Fecha Programada
                            </th>
                            <th
                              className={`px-4 py-3 text-left text-xs font-bold uppercase ${tema.colores.texto}`}
                            >
                              Técnico
                            </th>
                            <th
                              className={`px-4 py-3 text-left text-xs font-bold uppercase ${tema.colores.texto}`}
                            >
                              Acciones
                            </th>
                          </tr>
                        </thead>
                        <tbody className={`divide-y ${tema.colores.borde}`}>
                          {mantenimientos.map((mantenimiento) => {
                            const IconoTipo = obtenerIconoTipo(mantenimiento.tipo_mantenimiento);
                            const IconoEstado = obtenerIconoEstado(mantenimiento.estado);
                            const isSeleccionado = mantenimientosSeleccionados.includes(
                              mantenimiento.id_mantenimiento
                            );
                            const vencido = esVencido(mantenimiento.fecha_programada, mantenimiento.estado);

                            return (
                              <tr
                                key={mantenimiento.id_mantenimiento}
                                className={`${tema.colores.hover} transition-colors cursor-pointer ${
                                  isSeleccionado ? "bg-purple-500/10" : ""
                                } ${vencido ? "bg-red-500/5" : ""}`}
                                onClick={() => {
                                  if (modoSeleccionMultiple) {
                                    toggleSeleccionMantenimiento(mantenimiento.id_mantenimiento);
                                  } else {
                                    setMantenimientoSeleccionado(mantenimiento);
                                    setPanelDetalleAbierto(true);
                                  }
                                }}
                              >
                                {modoSeleccionMultiple && (
                                  <td className="px-4 py-3">
                                    <input
                                      type="checkbox"
                                      checked={isSeleccionado}
                                      onChange={() =>
                                        toggleSeleccionMantenimiento(mantenimiento.id_mantenimiento)
                                      }
                                      className="w-5 h-5 rounded"
                                      onClick={(e) => e.stopPropagation()}
                                    />
                                  </td>
                                )}
                                <td className="px-4 py-3">
                                  <div className="flex items-center gap-2">
                                    <IconoEstado className="w-5 h-5 text-orange-500" />
                                    {vencido && (
                                      <AlertTriangle className="w-4 h-4 text-red-500 animate-pulse" />
                                    )}
                                  </div>
                                </td>
                                <td className="px-4 py-3">
                                  <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center overflow-hidden">
                                      {mantenimiento.equipo.foto_url ? (
                                        <Image
                                          src={mantenimiento.equipo.foto_url}
                                          alt={mantenimiento.equipo.nombre}
                                          width={32}
                                          height={32}
                                          className="object-cover"
                                        />
                                      ) : (
                                        <IconoTipo className="w-4 h-4 text-white" />
                                      )}
                                    </div>
                                    <div>
                                      <p
                                        className={`text-sm font-bold ${tema.colores.texto}`}
                                      >
                                        {mantenimiento.equipo.nombre}
                                      </p>
                                      <p
                                        className={`text-xs ${tema.colores.textoSecundario}`}
                                      >
                                        {mantenimiento.equipo.marca} {mantenimiento.equipo.modelo}
                                      </p>
                                    </div>
                                  </div>
                                </td>
                                <td className="px-4 py-3">
                                  <span
                                    className={`text-xs font-semibold ${tema.colores.texto}`}
                                  >
                                    {TIPOS_MANTENIMIENTO.find((t) => t.value === mantenimiento.tipo_mantenimiento)?.label}
                                  </span>
                                </td>
                                <td className="px-4 py-3">
                                  <span
                                    className={`px-2 py-1 rounded-full text-xs font-bold border ${obtenerColorPrioridad(
                                      mantenimiento.prioridad
                                    )}`}
                                  >
                                    {mantenimiento.prioridad}
                                  </span>
                                </td>
                                <td className="px-4 py-3">
                                  <span
                                    className={`text-xs font-semibold ${tema.colores.texto}`}
                                  >
                                    {mantenimiento.equipo.ubicacion}
                                  </span>
                                </td>
                                <td className="px-4 py-3">
                                  <span
                                    className={`text-xs font-semibold ${tema.colores.texto}`}
                                  >
                                    {formatearFecha(mantenimiento.fecha_programada)}
                                  </span>
                                </td>
                                <td className="px-4 py-3">
                                  <div className="flex items-center gap-2">
                                    {mantenimiento.foto_tecnico ? (
                                      <Image
                                        src={mantenimiento.foto_tecnico}
                                        alt={mantenimiento.nombre_tecnico}
                                        width={24}
                                        height={24}
                                        className="rounded-full"
                                      />
                                    ) : (
                                      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center text-white text-xs font-bold">
                                        {mantenimiento.nombre_tecnico
                                          .split(" ")
                                          .map((n) => n[0])
                                          .join("")
                                          .slice(0, 2)}
                                      </div>
                                    )}
                                    <span
                                      className={`text-xs font-semibold ${tema.colores.texto}`}
                                    >
                                      {mantenimiento.nombre_tecnico}
                                    </span>
                                  </div>
                                </td>
                                <td className="px-4 py-3">
                                  <div className="flex items-center gap-1">
                                    {mantenimiento.estado === "programado" && (
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          iniciarMantenimiento(mantenimiento.id_mantenimiento);
                                        }}
                                        className="p-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded transition-all"
                                        title="Iniciar"
                                      >
                                        <Play className="w-3 h-3" />
                                      </button>
                                    )}
                                    {mantenimiento.estado === "en_progreso" && (
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          completarMantenimiento(mantenimiento.id_mantenimiento);
                                        }}
                                        className="p-1.5 bg-green-600 hover:bg-green-700 text-white rounded transition-all"
                                        title="Completar"
                                      >
                                        <CheckCircle2 className="w-3 h-3" />
                                      </button>
                                    )}
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setMantenimientoSeleccionado(mantenimiento);
                                        setPanelDetalleAbierto(true);
                                      }}
                                      className={`p-1.5 rounded ${tema.colores.secundario} ${tema.colores.texto} transition-all`}
                                      title="Ver detalles"
                                    >
                                      <ExternalLink className="w-3 h-3" />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Vista de calendario */}
                {vista.modo === "calendario" && (
                  <div
                    className={`rounded-2xl p-6 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra}`}
                  >
                    <div className="text-center py-12">
                      <Calendar className={`w-16 h-16 mx-auto mb-4 ${tema.colores.textoSecundario}`} />
                      <h3 className={`text-2xl font-black mb-2 ${tema.colores.texto}`}>
                        Vista de Calendario
                      </h3>
                      <p className={`text-sm ${tema.colores.textoSecundario}`}>
                        Funcionalidad en desarrollo - Próximamente disponible
                      </p>
                    </div>
                  </div>
                )}

                {/* Vista kanban */}
                {vista.modo === "kanban" && (
                  <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
                    {ESTADOS_MANTENIMIENTO.map((estado) => {
                      const mantenimientosEstado = mantenimientos.filter(
                        (m) => m.estado === estado.value
                      );
                      const IconoEstado = estado.icon;

                      return (
                        <div
                          key={estado.value}
                          className={`rounded-2xl p-4 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra}`}
                        >
                          <div className="flex items-center gap-3 mb-4">
                            <div
                              className={`w-10 h-10 rounded-xl bg-gradient-to-br from-${estado.color}-500 to-${estado.color}-600 flex items-center justify-center shadow-lg`}
                            >
                              <IconoEstado className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <h4 className={`text-sm font-black ${tema.colores.texto}`}>
                                {estado.label}
                              </h4>
                              <p className={`text-xs ${tema.colores.textoSecundario}`}>
                                {mantenimientosEstado.length} órdenes
                              </p>
                            </div>
                          </div>

                          <div className="space-y-3 max-h-[600px] overflow-y-auto custom-scrollbar">
                            {mantenimientosEstado.map((mantenimiento) => {
                              const IconoTipo = obtenerIconoTipo(mantenimiento.tipo_mantenimiento);
                              const vencido = esVencido(mantenimiento.fecha_programada, mantenimiento.estado);

                              return (
                                <div
                                  key={mantenimiento.id_mantenimiento}
                                  className={`p-3 rounded-xl ${tema.colores.secundario} ${tema.colores.borde} border cursor-pointer hover:scale-105 transition-all duration-300 ${
                                    vencido ? "ring-2 ring-red-500/50" : ""
                                  }`}
                                  onClick={() => {
                                    setMantenimientoSeleccionado(mantenimiento);
                                    setPanelDetalleAbierto(true);
                                  }}
                                >
                                  <div className="flex items-center gap-2 mb-2">
                                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center overflow-hidden">
                                      {mantenimiento.equipo.foto_url ? (
                                        <Image
                                          src={mantenimiento.equipo.foto_url}
                                          alt={mantenimiento.equipo.nombre}
                                          width={32}
                                          height={32}
                                          className="object-cover"
                                        />
                                      ) : (
                                        <IconoTipo className="w-4 h-4 text-white" />
                                      )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <p
                                        className={`text-xs font-bold ${tema.colores.texto} line-clamp-1`}
                                      >
                                        {mantenimiento.equipo.nombre}
                                      </p>
                                    </div>
                                  </div>

                                  <p
                                    className={`text-xs ${tema.colores.textoSecundario} line-clamp-2 mb-2`}
                                  >
                                    {mantenimiento.descripcion}
                                  </p>

                                  <div className="flex items-center justify-between">
                                    <span
                                      className={`px-2 py-0.5 rounded-full text-xs font-bold border ${obtenerColorPrioridad(
                                        mantenimiento.prioridad
                                      )}`}
                                    >
                                      {mantenimiento.prioridad}
                                    </span>
                                    <span
                                      className={`text-xs font-semibold ${tema.colores.textoSecundario}`}
                                    >
                                      {new Date(mantenimiento.fecha_programada).toLocaleDateString("es-CL", {
                                        day: "2-digit",
                                        month: "short",
                                      })}
                                    </span>
                                  </div>

                                  {vencido && (
                                    <div className="mt-2 pt-2 border-t border-red-500/30">
                                      <span className="text-xs font-bold text-red-400 flex items-center gap-1">
                                        <AlertTriangle className="w-3 h-3" />
                                        Vencido
                                      </span>
                                    </div>
                                  )}
                                </div>
                              );
                            })}

                            {mantenimientosEstado.length === 0 && (
                              <div className="text-center py-8">
                                <Package
                                  className={`w-12 h-12 mx-auto mb-2 ${tema.colores.textoSecundario} opacity-50`}
                                />
                                <p
                                  className={`text-xs ${tema.colores.textoSecundario}`}
                                >
                                  Sin órdenes
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Paginación */}
        {mantenimientosFiltrados.length > 0 && (
          <div
            className={`mt-8 rounded-2xl p-4 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra}`}
          >
            <div className="flex items-center justify-between">
              <p className={`text-sm font-semibold ${tema.colores.textoSecundario}`}>
                Mostrando {mantenimientosFiltrados.length} de {resumenMantenimientos.total} órdenes
              </p>
              <div className="flex items-center gap-2">
                <button
                  className={`px-4 py-2 rounded-xl font-semibold text-sm transition-all ${tema.colores.secundario} ${tema.colores.texto}`}
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <span className={`px-4 py-2 font-bold ${tema.colores.texto}`}>
                  Página 1
                </span>
                <button
                  className={`px-4 py-2 rounded-xl font-semibold text-sm transition-all ${tema.colores.secundario} ${tema.colores.texto}`}
                >
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <footer
          className={`mt-12 rounded-2xl ${tema.colores.card} ${tema.colores.borde} border py-6 px-8 ${tema.colores.sombra}`}
        >
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center shadow-lg`}
              >
                <Wrench className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className={`text-sm font-semibold ${tema.colores.texto}`}>
                  © 2025 AnyssaMed - Sistema de Mantenimiento Premium
                </p>
                <p className={`text-xs ${tema.colores.textoSecundario}`}>
                  Gestión Integral de Mantenimiento v4.5.0
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
              <span className={`text-xs ${tema.colores.textoSecundario}`}>
                🔄 Auto-refresh: {autoRefresh ? `${intervaloRefresh / 1000}s` : "Desactivado"}
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

      {/* PANEL LATERAL DE DETALLES */}
      {panelDetalleAbierto && mantenimientoSeleccionado && (
        <div
          className={`fixed top-0 right-0 h-full w-[500px] ${tema.colores.card} ${tema.colores.borde} border-l ${tema.colores.sombra} z-50 overflow-y-auto custom-scrollbar transition-transform duration-300`}
        >
          <div className="sticky top-0 bg-gradient-to-r from-orange-600 to-red-600 p-6 z-10">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-2xl font-black text-white flex items-center gap-2">
                <Wrench className="w-6 h-6" />
                Orden de Mantenimiento
              </h3>
              <button
                onClick={() => setPanelDetalleAbierto(false)}
                className="p-2 rounded-xl bg-white/20 hover:bg-white/30 text-white transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex items-center gap-3">
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold border bg-white/20 text-white border-white/40`}
              >
                ID: {mantenimientoSeleccionado.id_mantenimiento}
              </span>
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold border ${obtenerColorPrioridad(
                  mantenimientoSeleccionado.prioridad
                )}`}
              >
                {mantenimientoSeleccionado.prioridad.toUpperCase()}
              </span>
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold border ${obtenerColorEstado(
                  mantenimientoSeleccionado.estado
                )}`}
              >
                {ESTADOS_MANTENIMIENTO.find((e) => e.value === mantenimientoSeleccionado.estado)?.label}
              </span>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* Información del equipo */}
            <div>
              <h4 className={`text-xl font-black mb-3 ${tema.colores.texto} flex items-center gap-2`}>
                <HardDrive className="w-5 h-5" />
                Equipo
              </h4>
              <div
                className={`rounded-xl p-4 ${tema.colores.secundario} border ${tema.colores.borde}`}
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center overflow-hidden">
                    {mantenimientoSeleccionado.equipo.foto_url ? (
                      <Image
                        src={mantenimientoSeleccionado.equipo.foto_url}
                        alt={mantenimientoSeleccionado.equipo.nombre}
                        width={80}
                        height={80}
                        className="object-cover"
                      />
                    ) : (
                      <HardDrive className="w-10 h-10 text-white" />
                    )}
                  </div>
                  <div>
                    <p className={`text-lg font-black ${tema.colores.texto}`}>
                      {mantenimientoSeleccionado.equipo.nombre}
                    </p>
                    <p className={`text-sm ${tema.colores.textoSecundario}`}>
                      {mantenimientoSeleccionado.equipo.marca} {mantenimientoSeleccionado.equipo.modelo}
                    </p>
                    <p className={`text-xs ${tema.colores.textoSecundario}`}>
                      Serie: {mantenimientoSeleccionado.equipo.serie}
                    </p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className={`text-sm font-semibold ${tema.colores.textoSecundario}`}>
                      Ubicación
                    </span>
                    <span className={`text-sm font-bold ${tema.colores.texto}`}>
                      {mantenimientoSeleccionado.equipo.ubicacion}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className={`text-sm font-semibold ${tema.colores.textoSecundario}`}>
                      Estado
                    </span>
                    <span className={`text-sm font-bold ${tema.colores.texto}`}>
                      {mantenimientoSeleccionado.equipo.estado}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className={`text-sm font-semibold ${tema.colores.textoSecundario}`}>
                      Criticidad
                    </span>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-bold border ${obtenerColorPrioridad(
                        mantenimientoSeleccionado.equipo.criticidad
                      )}`}
                    >
                      {mantenimientoSeleccionado.equipo.criticidad.toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Descripción */}
            <div>
              <h4 className={`text-lg font-black mb-3 ${tema.colores.texto}`}>
                📋 Descripción del Mantenimiento
              </h4>
              <p className={`text-sm ${tema.colores.textoSecundario} leading-relaxed`}>
                {mantenimientoSeleccionado.descripcion}
              </p>
            </div>

            {/* Información de programación */}
            <div
              className={`rounded-xl p-4 ${tema.colores.info} border ${tema.colores.borde}`}
            >
              <h5
                className={`text-sm font-bold mb-3 ${tema.colores.texto} flex items-center gap-2`}
              >
                <Calendar className="w-4 h-4" />
                Información de Programación
              </h5>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span
                    className={`text-sm font-semibold ${tema.colores.textoSecundario}`}
                  >
                    Tipo
                  </span>
                  <span className={`text-sm font-bold ${tema.colores.texto}`}>
                    {TIPOS_MANTENIMIENTO.find((t) => t.value === mantenimientoSeleccionado.tipo_mantenimiento)?.label}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span
                    className={`text-sm font-semibold ${tema.colores.textoSecundario}`}
                  >
                    Fecha Programada
                  </span>
                  <span className={`text-sm font-bold ${tema.colores.texto}`}>
                    {formatearFechaCompleta(mantenimientoSeleccionado.fecha_programada)}
                  </span>
                </div>
                {mantenimientoSeleccionado.fecha_inicio && (
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-sm font-semibold ${tema.colores.textoSecundario}`}
                    >
                      Fecha Inicio
                    </span>
                    <span className={`text-sm font-bold ${tema.colores.texto}`}>
                      {formatearFechaCompleta(mantenimientoSeleccionado.fecha_inicio)}
                    </span>
                  </div>
                )}
                {mantenimientoSeleccionado.fecha_fin && (
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-sm font-semibold ${tema.colores.textoSecundario}`}
                    >
                      Fecha Fin
                    </span>
                    <span className={`text-sm font-bold ${tema.colores.texto}`}>
                      {formatearFechaCompleta(mantenimientoSeleccionado.fecha_fin)}
                    </span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span
                    className={`text-sm font-semibold ${tema.colores.textoSecundario}`}
                  >
                    Duración Estimada
                  </span>
                  <span className={`text-sm font-bold ${tema.colores.texto}`}>
                    {formatearTiempo(mantenimientoSeleccionado.duracion_estimada)}
                  </span>
                </div>
                {mantenimientoSeleccionado.duracion_real && (
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-sm font-semibold ${tema.colores.textoSecundario}`}
                    >
                      Duración Real
                    </span>
                    <span className={`text-sm font-bold ${tema.colores.texto}`}>
                      {formatearTiempo(mantenimientoSeleccionado.duracion_real)}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Técnico asignado */}
            <div>
              <h4 className={`text-lg font-black mb-3 ${tema.colores.texto} flex items-center gap-2`}>
                <UserCheck className="w-5 h-5" />
                Técnico Asignado
              </h4>
              <div
                className={`rounded-xl p-4 ${tema.colores.secundario} border ${tema.colores.borde} flex items-center gap-3`}
              >
                {mantenimientoSeleccionado.foto_tecnico ? (
                  <Image
                    src={mantenimientoSeleccionado.foto_tecnico}
                    alt={mantenimientoSeleccionado.nombre_tecnico}
                    width={48}
                    height={48}
                    className="rounded-full"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center text-white text-lg font-bold">
                    {mantenimientoSeleccionado.nombre_tecnico
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .slice(0, 2)}
                  </div>
                )}
                <div>
                  <p className={`text-base font-bold ${tema.colores.texto}`}>
                    {mantenimientoSeleccionado.nombre_tecnico}
                  </p>
                  <p className={`text-sm ${tema.colores.textoSecundario}`}>
                    Técnico de Mantenimiento
                  </p>
                </div>
              </div>
            </div>

            {/* Checklist */}
            {mantenimientoSeleccionado.checklist && mantenimientoSeleccionado.checklist.length > 0 && (
              <div>
                <h4 className={`text-lg font-black mb-3 ${tema.colores.texto} flex items-center gap-2`}>
                  <ClipboardCheck className="w-5 h-5" />
                  Checklist de Mantenimiento
                </h4>
                <div className="space-y-2">
                  {mantenimientoSeleccionado.checklist.map((item) => (
                    <div
                      key={item.id_item}
                      className={`p-3 rounded-xl ${tema.colores.secundario} border ${tema.colores.borde} flex items-start gap-3`}
                    >
                      <div className="flex-shrink-0 mt-0.5">
                        {item.completado ? (
                          <CheckCircle2 className="w-5 h-5 text-green-500" />
                        ) : (
                          <Circle className="w-5 h-5 text-gray-500" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p
                          className={`text-sm font-semibold ${
                            item.completado ? "line-through opacity-60" : ""
                          } ${tema.colores.texto}`}
                        >
                          {item.descripcion}
                          {item.es_critico && (
                            <span className="ml-2 px-2 py-0.5 rounded-full text-xs font-bold bg-red-500/20 text-red-300">
                              Crítico
                            </span>
                          )}
                        </p>
                        {item.observaciones && (
                          <p className={`text-xs ${tema.colores.textoSecundario} mt-1`}>
                            {item.observaciones}
                          </p>
                        )}
                        {item.completado && item.completado_por && (
                          <p className={`text-xs ${tema.colores.textoSecundario} mt-1`}>
                            Completado por {item.completado_por} •{" "}
                            {item.fecha_completado && formatearFecha(item.fecha_completado)}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-sm font-semibold ${tema.colores.textoSecundario}`}>
                      Progreso
                    </span>
                    <span className={`text-sm font-bold ${tema.colores.texto}`}>
                      {mantenimientoSeleccionado.checklist.filter((c) => c.completado).length}/
                      {mantenimientoSeleccionado.checklist.length}
                    </span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-3">
                    <div
                      className="bg-gradient-to-r from-orange-500 to-red-500 h-3 rounded-full transition-all duration-300"
                      style={{
                        width: `${
                          (mantenimientoSeleccionado.checklist.filter((c) => c.completado).length /
                            mantenimientoSeleccionado.checklist.length) *
                          100
                        }%`,
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            )}

            {/* Repuestos utilizados */}
            {mantenimientoSeleccionado.repuestos_utilizados &&
              mantenimientoSeleccionado.repuestos_utilizados.length > 0 && (
                <div>
                  <h4 className={`text-lg font-black mb-3 ${tema.colores.texto} flex items-center gap-2`}>
                    <Package className="w-5 h-5" />
                    Repuestos Utilizados
                  </h4>
                  <div className="space-y-2">
                    {mantenimientoSeleccionado.repuestos_utilizados.map((repuesto) => (
                      <div
                        key={repuesto.id_repuesto}
                        className={`p-3 rounded-xl ${tema.colores.secundario} border ${tema.colores.borde}`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <p className={`text-sm font-bold ${tema.colores.texto}`}>
                            {repuesto.nombre}
                          </p>
                          <span className={`text-sm font-bold ${tema.colores.texto}`}>
                            ${repuesto.costo_total.toLocaleString("es-CL")}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span className={tema.colores.textoSecundario}>
                            Código: {repuesto.codigo}
                          </span>
                          <span className={tema.colores.textoSecundario}>
                            Cantidad: {repuesto.cantidad}
                          </span>
                        </div>
                        {repuesto.proveedor && (
                          <p className={`text-xs ${tema.colores.textoSecundario} mt-1`}>
                            Proveedor: {repuesto.proveedor}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                  <div
                    className={`mt-4 p-4 rounded-xl ${tema.colores.warning} border ${tema.colores.borde}`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`text-sm font-bold ${tema.colores.texto}`}>
                        Costo Total
                      </span>
                      <span className={`text-lg font-black ${tema.colores.texto}`}>
                        ${mantenimientoSeleccionado.costo_total.toLocaleString("es-CL")}
                      </span>
                    </div>
                  </div>
                </div>
              )}

            {/* Observaciones */}
            {mantenimientoSeleccionado.observaciones && (
              <div>
                <h4 className={`text-lg font-black mb-3 ${tema.colores.texto}`}>
                  📝 Observaciones
                </h4>
                <div
                  className={`p-4 rounded-xl ${tema.colores.secundario} border ${tema.colores.borde}`}
                >
                  <p className={`text-sm ${tema.colores.texto} leading-relaxed`}>
                    {mantenimientoSeleccionado.observaciones}
                  </p>
                </div>
              </div>
            )}

            {/* Documentos */}
            {mantenimientoSeleccionado.documentos && mantenimientoSeleccionado.documentos.length > 0 && (
              <div>
                <h4 className={`text-lg font-black mb-3 ${tema.colores.texto} flex items-center gap-2`}>
                  <FileText className="w-5 h-5" />
                  Documentos Adjuntos
                </h4>
                <div className="space-y-2">
                  {mantenimientoSeleccionado.documentos.map((doc) => (
                    <a
                      key={doc.id_documento}
                      href={doc.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`flex items-center gap-3 p-3 rounded-xl ${tema.colores.secundario} border ${tema.colores.borde} hover:scale-105 transition-all duration-300`}
                    >
                      <FileText className="w-5 h-5 text-blue-400" />
                      <div className="flex-1">
                        <p className={`text-sm font-bold ${tema.colores.texto}`}>
                          {doc.nombre}
                        </p>
                        {doc.descripcion && (
                          <p className={`text-xs ${tema.colores.textoSecundario}`}>
                            {doc.descripcion}
                          </p>
                        )}
                        <p className={`text-xs ${tema.colores.textoSecundario}`}>
                          Subido por {doc.subido_por} • {formatearFecha(doc.fecha_subida)}
                        </p>
                      </div>
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Acciones principales */}
            <div className="space-y-3">
              <h5
                className={`text-sm font-bold mb-3 ${tema.colores.texto} flex items-center gap-2`}
              >
                ⚡ Acciones Disponibles
              </h5>

              {mantenimientoSeleccionado.estado === "programado" && (
                <button
                  onClick={() => {
                    iniciarMantenimiento(mantenimientoSeleccionado.id_mantenimiento);
                    setPanelDetalleAbierto(false);
                  }}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all duration-300 hover:scale-105 shadow-lg"
                >
                  <Play className="w-5 h-5" />
                  Iniciar Mantenimiento
                </button>
              )}

              {mantenimientoSeleccionado.estado === "en_progreso" && (
                <button
                  onClick={() => {
                    completarMantenimiento(mantenimientoSeleccionado.id_mantenimiento);
                    setPanelDetalleAbierto(false);
                  }}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold transition-all duration-300 hover:scale-105 shadow-lg"
                >
                  <CheckCircle2 className="w-5 h-5" />
                  Completar Mantenimiento
                </button>
              )}

              {(mantenimientoSeleccionado.estado === "programado" ||
                mantenimientoSeleccionado.estado === "en_progreso") && (
                <>
                  <button
                    onClick={() => {
                      const nuevaFecha = prompt("Nueva fecha (YYYY-MM-DD HH:mm):");
                      if (nuevaFecha) {
                        reprogramarMantenimiento(
                          mantenimientoSeleccionado.id_mantenimiento,
                          nuevaFecha
                        );
                      }
                    }}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold transition-all duration-300 hover:scale-105 shadow-lg"
                  >
                    <RotateCw className="w-5 h-5" />
                    Reprogramar
                  </button>

                  <button
                    onClick={() => {
                      const motivo = prompt("Motivo de cancelación:");
                      if (motivo) {
                                               cancelarMantenimiento(
                          mantenimientoSeleccionado.id_mantenimiento,
                          motivo
                        );
                        setPanelDetalleAbierto(false);
                      }
                    }}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold transition-all duration-300 hover:scale-105 shadow-lg"
                  >
                    <X className="w-5 h-5" />
                    Cancelar Mantenimiento
                  </button>
                </>
              )}
            </div>

            {/* Acciones secundarias */}
            <div className="grid grid-cols-2 gap-3">
              <button
                className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold transition-all ${tema.colores.secundario} ${tema.colores.texto}`}
              >
                <MessageSquare className="w-4 h-4" />
                Comentar
              </button>
              <button
                className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold transition-all ${tema.colores.secundario} ${tema.colores.texto}`}
              >
                <Share2 className="w-4 h-4" />
                Compartir
              </button>
              <button
                className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold transition-all ${tema.colores.secundario} ${tema.colores.texto}`}
              >
                <Printer className="w-4 h-4" />
                Imprimir
              </button>
              <button
                className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold transition-all ${tema.colores.secundario} ${tema.colores.texto}`}
              >
                <Download className="w-4 h-4" />
                Exportar
              </button>
            </div>

            {/* Historial */}
            {mantenimientoSeleccionado.historial && mantenimientoSeleccionado.historial.length > 0 && (
              <div>
                <h4 className={`text-lg font-black mb-3 ${tema.colores.texto} flex items-center gap-2`}>
                  <History className="w-5 h-5" />
                  Historial de Cambios
                </h4>
                <div className="space-y-3">
                  {mantenimientoSeleccionado.historial.map((item) => (
                    <div
                      key={item.id_historial}
                      className={`p-3 rounded-xl ${tema.colores.secundario} border ${tema.colores.borde}`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span
                          className={`text-xs font-bold ${tema.colores.texto} uppercase`}
                        >
                          {item.accion}
                        </span>
                        <span
                          className={`text-xs ${tema.colores.textoSecundario}`}
                        >
                          {formatearFecha(item.fecha)}
                        </span>
                      </div>
                      <p className={`text-sm ${tema.colores.textoSecundario}`}>
                        {item.descripcion}
                      </p>
                      <p
                        className={`text-xs font-semibold mt-1 ${tema.colores.texto}`}
                      >
                        Por: {item.usuario}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Información adicional */}
            <div
              className={`rounded-xl p-4 ${tema.colores.success} border ${tema.colores.borde}`}
            >
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 flex-shrink-0 mt-0.5 text-green-500" />
                <div>
                  <p className={`text-sm font-bold mb-1 ${tema.colores.texto}`}>
                    💡 Información Importante
                  </p>
                  <p className={`text-xs ${tema.colores.textoSecundario}`}>
                    Asegúrate de completar todos los items del checklist antes de finalizar el mantenimiento. Documenta cualquier anomalía encontrada durante la inspección.
                  </p>
                </div>
              </div>
            </div>

            {/* Próximo mantenimiento */}
            {mantenimientoSeleccionado.proximo_mantenimiento && (
              <div
                className={`rounded-xl p-4 ${tema.colores.info} border ${tema.colores.borde}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CalendarClock className="w-5 h-5 text-blue-400" />
                    <span className={`text-sm font-bold ${tema.colores.texto}`}>
                      Próximo Mantenimiento
                    </span>
                  </div>
                  <span className={`text-sm font-bold ${tema.colores.texto}`}>
                    {formatearFecha(mantenimientoSeleccionado.proximo_mantenimiento)}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL NUEVA ORDEN */}
      {mostrarModalNuevo && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div
            className={`w-full max-w-4xl rounded-3xl ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} overflow-hidden animate-fade-in-up`}
          >
            <div className="bg-gradient-to-r from-orange-600 to-red-600 p-6">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-black text-white flex items-center gap-2">
                  <Plus className="w-6 h-6" />
                  Nueva Orden de Mantenimiento
                </h3>
                <button
                  onClick={() => setMostrarModalNuevo(false)}
                  className="p-2 rounded-xl bg-white/20 hover:bg-white/30 text-white transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
              <div className="space-y-6">
                {/* Tipo de mantenimiento */}
                <div>
                  <label className={`block text-sm font-bold mb-3 ${tema.colores.texto}`}>
                    🔧 Tipo de Mantenimiento
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {TIPOS_MANTENIMIENTO.map((tipo) => {
                      const Icono = tipo.icon;
                      return (
                        <button
                          key={tipo.value}
                          className={`p-4 rounded-xl transition-all duration-300 ${tema.colores.secundario} ${tema.colores.borde} border hover:scale-105`}
                        >
                          <div className="flex flex-col items-center gap-2">
                            <Icono className="w-6 h-6" />
                            <span className="text-sm font-bold">{tipo.label}</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Selección de equipo */}
                <div>
                  <label className={`block text-sm font-bold mb-2 ${tema.colores.texto}`}>
                    💻 Equipo
                  </label>
                  <input
                    type="text"
                    placeholder="Buscar equipo..."
                    className={`w-full px-4 py-3 rounded-xl ${tema.colores.secundario} ${tema.colores.borde} border ${tema.colores.texto} placeholder:${tema.colores.textoSecundario}`}
                  />
                </div>

                {/* Prioridad */}
                <div>
                  <label className={`block text-sm font-bold mb-3 ${tema.colores.texto}`}>
                    🎯 Prioridad
                  </label>
                  <div className="grid grid-cols-4 gap-3">
                    {["baja", "media", "alta", "critica"].map((prioridad) => (
                      <button
                        key={prioridad}
                        className={`p-3 rounded-xl font-bold transition-all duration-300 ${tema.colores.secundario} ${tema.colores.borde} border hover:scale-105 capitalize`}
                      >
                        {prioridad}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Fecha programada */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-bold mb-2 ${tema.colores.texto}`}>
                      📅 Fecha Programada
                    </label>
                    <input
                      type="date"
                      className={`w-full px-4 py-3 rounded-xl ${tema.colores.secundario} ${tema.colores.borde} border ${tema.colores.texto}`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-bold mb-2 ${tema.colores.texto}`}>
                      ⏰ Hora
                    </label>
                    <input
                      type="time"
                      className={`w-full px-4 py-3 rounded-xl ${tema.colores.secundario} ${tema.colores.borde} border ${tema.colores.texto}`}
                    />
                  </div>
                </div>

                {/* Duración estimada */}
                <div>
                  <label className={`block text-sm font-bold mb-2 ${tema.colores.texto}`}>
                    ⏱️ Duración Estimada (minutos)
                  </label>
                  <input
                    type="number"
                    placeholder="120"
                    className={`w-full px-4 py-3 rounded-xl ${tema.colores.secundario} ${tema.colores.borde} border ${tema.colores.texto} placeholder:${tema.colores.textoSecundario}`}
                  />
                </div>

                {/* Técnico asignado */}
                <div>
                  <label className={`block text-sm font-bold mb-2 ${tema.colores.texto}`}>
                    👤 Técnico Asignado
                  </label>
                  <select
                    className={`w-full px-4 py-3 rounded-xl ${tema.colores.secundario} ${tema.colores.borde} border ${tema.colores.texto} cursor-pointer`}
                  >
                    <option value="">Seleccionar técnico...</option>
                    <option value="yo">Asignarme a mí</option>
                  </select>
                </div>

                {/* Descripción */}
                <div>
                  <label className={`block text-sm font-bold mb-2 ${tema.colores.texto}`}>
                    📝 Descripción del Mantenimiento
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Describe el trabajo a realizar..."
                    className={`w-full px-4 py-3 rounded-xl ${tema.colores.secundario} ${tema.colores.borde} border ${tema.colores.texto} placeholder:${tema.colores.textoSecundario} resize-none`}
                  ></textarea>
                </div>

                {/* Checklist */}
                <div>
                  <label className={`block text-sm font-bold mb-2 ${tema.colores.texto}`}>
                    ✅ Checklist (Opcional)
                  </label>
                  <div className="space-y-2">
                    <input
                      type="text"
                      placeholder="Agregar item al checklist..."
                      className={`w-full px-4 py-3 rounded-xl ${tema.colores.secundario} ${tema.colores.borde} border ${tema.colores.texto} placeholder:${tema.colores.textoSecundario}`}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-700/50 flex items-center justify-end gap-3">
              <button
                onClick={() => setMostrarModalNuevo(false)}
                className={`px-6 py-3 rounded-xl font-bold transition-all ${tema.colores.secundario} ${tema.colores.texto}`}
              >
                Cancelar
              </button>
              <button
                className="px-6 py-3 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white rounded-xl font-bold transition-all duration-300 hover:scale-105 shadow-xl"
              >
                Crear Orden
              </button>
            </div>
          </div>
        </div>
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
          background: linear-gradient(180deg, #f97316 0%, #dc2626 100%);
          border-radius: 10px;
          transition: background 0.3s ease;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(180deg, #ea580c 0%, #b91c1c 100%);
        }

        .custom-scrollbar {
          scrollbar-color: rgba(249, 115, 22, 0.5) transparent;
          scrollbar-width: thin;
        }

        /* Animaciones premium */
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in-up {
          animation: fadeInUp 0.5s ease-out;
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
            box-shadow: 0 0 20px rgba(249, 115, 22, 0.5);
          }
          50% {
            box-shadow: 0 0 40px rgba(249, 115, 22, 0.8);
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
          outline: 2px solid #f97316;
          outline-offset: 2px;
          border-radius: 8px;
        }

        /* Selection */
        ::selection {
          background-color: rgba(249, 115, 22, 0.3);
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

        /* Checkbox personalizado */
        input[type="checkbox"] {
          appearance: none;
          width: 20px;
          height: 20px;
          border: 2px solid #4b5563;
          border-radius: 4px;
          background-color: transparent;
          cursor: pointer;
          position: relative;
          transition: all 0.3s ease;
        }

        input[type="checkbox"]:checked {
          background: linear-gradient(135deg, #f97316 0%, #dc2626 100%);
          border-color: #f97316;
        }

        input[type="checkbox"]:checked::after {
          content: "✓";
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          color: white;
          font-size: 14px;
          font-weight: bold;
        }

        /* Select personalizado */
        select {
          appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 12px center;
          background-size: 20px;
          padding-right: 40px;
        }

        /* Animación de bounce mejorada */
        @keyframes bounce {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }

        .animate-bounce {
          animation: bounce 2s ease-in-out infinite;
        }

        /* Skeleton loading */
        @keyframes skeleton-loading {
          0% {
            background-position: -200% 0;
          }
          100% {
            background-position: 200% 0;
          }
        }

        .skeleton {
          background: linear-gradient(
            90deg,
            rgba(255, 255, 255, 0.05) 25%,
            rgba(255, 255, 255, 0.1) 50%,
            rgba(255, 255, 255, 0.05) 75%
          );
          background-size: 200% 100%;
          animation: skeleton-loading 1.5s ease-in-out infinite;
        }

        /* Transiciones suaves */
        * {
          transition-property: color, background-color, border-color, text-decoration-color, fill, stroke, opacity, box-shadow, transform, filter, backdrop-filter;
          transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
          transition-duration: 150ms;
        }

        /* Efectos de glassmorphism */
        .glass {
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        /* Sombras premium */
        .shadow-premium {
          box-shadow: 0 20px 50px -12px rgba(249, 115, 22, 0.25),
                      0 10px 20px -8px rgba(220, 38, 38, 0.15);
        }

        /* Gradientes de texto */
        .text-gradient {
          background: linear-gradient(135deg, #f97316 0%, #dc2626 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
      `}</style>
    </div>
  );
}


