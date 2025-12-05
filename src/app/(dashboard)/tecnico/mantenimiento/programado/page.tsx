// src/app/(dashboard)/tecnico/mantenimiento/programado/page.tsx
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
  BellOff,
  BellRing,
  Box,
  Calendar,
  CalendarCheck,
  CalendarClock,
  CalendarDays,
  CalendarPlus,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Circle,
  Clock,
  ClipboardCheck,
  ClipboardList,
  Cloud,
  Copy,
  Cpu,
  Database,
  Download,
  Edit,
  ExternalLink,
  Eye,
  EyeOff,
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
  Link as LinkIcon,
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
  Repeat,
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
  Video,
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
  ScatterChart,
  Scatter,
  ZAxis,
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
  mantenimientos_hoy: number;
  mantenimientos_semana: number;
  mantenimientos_mes: number;
}

interface MantenimientoProgramado {
  id_mantenimiento: number;
  id_equipo: number;
  tipo_mantenimiento: "preventivo" | "correctivo" | "predictivo" | "calibracion" | "inspeccion";
  prioridad: "baja" | "media" | "alta" | "critica";
  fecha_programada: string;
  hora_programada: string;
  duracion_estimada: number; // minutos
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
    ultimo_mantenimiento: string | null;
    proximo_mantenimiento: string | null;
  };
  descripcion: string;
  checklist: ChecklistItem[];
  repuestos_necesarios: RepuestoNecesario[];
  frecuencia: "unica" | "diaria" | "semanal" | "quincenal" | "mensual" | "trimestral" | "semestral" | "anual";
  es_recurrente: boolean;
  dias_anticipacion_alerta: number;
  requiere_aprobacion: boolean;
  aprobado: boolean;
  aprobado_por: number | null;
  nombre_aprobador: string | null;
  fecha_aprobacion: string | null;
  notas_tecnicas: string | null;
  documentos_referencia: DocumentoReferencia[];
  historial_ejecuciones: EjecucionHistorial[];
  ultima_ejecucion: string | null;
  proxima_ejecucion: string | null;
  estado_programacion: "activo" | "pausado" | "cancelado" | "completado";
  notificaciones_enviadas: boolean;
  recordatorios_configurados: Recordatorio[];
  created_at: string;
  updated_at: string;
}

interface ChecklistItem {
  id_item: number;
  descripcion: string;
  es_critico: boolean;
  orden: number;
  categoria: string;
  tiempo_estimado: number; // minutos
}

interface RepuestoNecesario {
  id_repuesto: number;
  nombre: string;
  codigo: string;
  cantidad_necesaria: number;
  cantidad_disponible: number;
  costo_estimado: number;
  proveedor: string | null;
  tiempo_entrega_dias: number;
  es_critico: boolean;
}

interface DocumentoReferencia {
  id_documento: number;
  tipo: "manual" | "procedimiento" | "diagrama" | "especificacion" | "certificado";
  nombre: string;
  url: string;
  version: string;
  fecha_actualizacion: string;
}

interface EjecucionHistorial {
  id_ejecucion: number;
  fecha_ejecucion: string;
  duracion_real: number;
  tecnico_ejecutor: string;
  resultado: "exitoso" | "parcial" | "fallido";
  observaciones: string;
  calificacion: number | null;
}

interface Recordatorio {
  id_recordatorio: number;
  tipo: "email" | "sms" | "push" | "sistema";
  dias_antes: number;
  enviado: boolean;
  fecha_envio: string | null;
}

interface FiltrosProgramado {
  tipo: string[];
  prioridad: string[];
  frecuencia: string[];
  ubicacion: string;
  equipoNombre: string;
  fechaDesde: string;
  fechaHasta: string;
  tecnicoAsignado: string;
  soloVencidos: boolean;
  soloHoy: boolean;
  soloSemana: boolean;
  soloMes: boolean;
  soloAsignadosAMi: boolean;
  soloRecurrentes: boolean;
  soloPendientesAprobacion: boolean;
  ordenarPor: "fecha_programada" | "prioridad" | "equipo" | "frecuencia";
  ordenDireccion: "asc" | "desc";
}

interface VistaProgramado {
  modo: "lista" | "tarjetas" | "calendario" | "timeline" | "gantt";
  densidad: "compacta" | "normal" | "espaciosa";
  agruparPor: "ninguno" | "fecha" | "tipo" | "prioridad" | "ubicacion" | "tecnico" | "frecuencia";
  mostrarCompletados: boolean;
  mostrarCancelados: boolean;
}

interface EstadisticasProgramado {
  total: number;
  activos: number;
  hoy: number;
  semana: number;
  mes: number;
  vencidos: number;
  recurrentes: number;
  pendientes_aprobacion: number;
  porTipo: { [key: string]: number };
  porFrecuencia: { [key: string]: number };
  porPrioridad: { [key: string]: number };
  tendencia: { fecha: string; cantidad: number }[];
  equiposMasMantenimiento: { equipo: string; cantidad: number }[];
  cumplimiento: number;
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
  { value: "preventivo", label: "Preventivo", icon: Shield, color: "blue", descripcion: "Mantenimiento planificado" },
  { value: "correctivo", label: "Correctivo", icon: Wrench, color: "orange", descripcion: "Reparación de fallas" },
  { value: "predictivo", label: "Predictivo", icon: TrendingUp, color: "purple", descripcion: "Basado en condición" },
  { value: "calibracion", label: "Calibración", icon: Sliders, color: "green", descripcion: "Ajuste de precisión" },
  { value: "inspeccion", label: "Inspección", icon: Eye, color: "cyan", descripcion: "Revisión visual" },
];

const FRECUENCIAS = [
  { value: "unica", label: "Única Vez", icon: Circle, dias: 0 },
  { value: "diaria", label: "Diaria", icon: Calendar, dias: 1 },
  { value: "semanal", label: "Semanal", icon: CalendarDays, dias: 7 },
  { value: "quincenal", label: "Quincenal", icon: CalendarDays, dias: 15 },
  { value: "mensual", label: "Mensual", icon: Calendar, dias: 30 },
  { value: "trimestral", label: "Trimestral", icon: Calendar, dias: 90 },
  { value: "semestral", label: "Semestral", icon: Calendar, dias: 180 },
  { value: "anual", label: "Anual", icon: Calendar, dias: 365 },
];

// ========================================
// 🎯 COMPONENTE PRINCIPAL
// ========================================

export default function MantenimientoProgramadoPage() {
  // 📊 ESTADOS PRINCIPALES
  const [usuario, setUsuario] = useState<UsuarioSesion | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMantenimientos, setLoadingMantenimientos] = useState(true);
  const [mantenimientos, setMantenimientos] = useState<MantenimientoProgramado[]>([]);
  const [estadisticas, setEstadisticas] = useState<EstadisticasTecnico | null>(null);
  const [estadisticasProgramado, setEstadisticasProgramado] = useState<EstadisticasProgramado | null>(null);
  const [mantenimientoSeleccionado, setMantenimientoSeleccionado] = useState<MantenimientoProgramado | null>(null);
  
  // 🎨 ESTADOS DE UI
  const [temaActual, setTemaActual] = useState<TemaColor>("dark");
  const [sidebarAbierto, setSidebarAbierto] = useState(true);
  const [perfilAbierto, setPerfilAbierto] = useState(false);
  const [panelDetalleAbierto, setPanelDetalleAbierto] = useState(false);
  const [busqueda, setBusqueda] = useState("");
  const [disponibilidad, setDisponibilidad] = useState<"disponible" | "ocupado" | "fuera_servicio">("disponible");
  
  // 🔍 ESTADOS DE FILTROS Y VISTA
  const [filtros, setFiltros] = useState<FiltrosProgramado>({
    tipo: [],
    prioridad: [],
    frecuencia: [],
    ubicacion: "",
    equipoNombre: "",
    fechaDesde: "",
    fechaHasta: "",
    tecnicoAsignado: "",
    soloVencidos: false,
    soloHoy: false,
    soloSemana: false,
    soloMes: false,
    soloAsignadosAMi: false,
    soloRecurrentes: false,
    soloPendientesAprobacion: false,
    ordenarPor: "fecha_programada",
    ordenDireccion: "asc",
  });

  const [vista, setVista] = useState<VistaProgramado>({
    modo: "calendario",
    densidad: "normal",
    agruparPor: "fecha",
    mostrarCompletados: false,
    mostrarCancelados: false,
  });

  // 📈 ESTADOS DE ACCIONES
  const [mantenimientosSeleccionados, setMantenimientosSeleccionados] = useState<number[]>([]);
  const [modoSeleccionMultiple, setModoSeleccionMultiple] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [intervaloRefresh, setIntervaloRefresh] = useState(300000); // 5 minutos
  const [mostrarFiltrosAvanzados, setMostrarFiltrosAvanzados] = useState(false);
  const [mostrarModalNuevo, setMostrarModalNuevo] = useState(false);
  const [mostrarModalRecurrente, setMostrarModalRecurrente] = useState(false);
  
  // 📅 ESTADOS DE CALENDARIO
  const [mesActual, setMesActual] = useState(new Date().getMonth());
  const [añoActual, setAñoActual] = useState(new Date().getFullYear());
  const [diaSeleccionado, setDiaSeleccionado] = useState<Date | null>(null);

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
      cargarMantenimientosProgramados();
      cargarEstadisticas();
      cargarEstadisticasProgramado();
    }
  }, [usuario, mesActual, añoActual]);

  useEffect(() => {
    if (!autoRefresh || !usuario?.tecnico) return;

    const interval = setInterval(() => {
      cargarMantenimientosProgramados();
      cargarEstadisticas();
      cargarEstadisticasProgramado();
    }, intervaloRefresh);

    return () => clearInterval(interval);
  }, [usuario, autoRefresh, intervaloRefresh, mesActual, añoActual]);

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

    const vistaGuardada = localStorage.getItem("vista_mantenimiento_programado");
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

  const cargarMantenimientosProgramados = async () => {
    if (!usuario?.tecnico?.id_tecnico) return;

    try {
      setLoadingMantenimientos(true);

      const res = await fetch(
        `/api/tecnico/mantenimiento/programado?id_tecnico=${usuario.tecnico.id_tecnico}&mes=${mesActual + 1}&año=${añoActual}`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        }
      );

      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data.success) {
        console.error("Error al cargar mantenimientos programados:", data);
        return;
      }

      setMantenimientos(data.mantenimientos || []);
    } catch (error) {
      console.error("Error al cargar mantenimientos programados:", error);
      mostrarNotificacion("error", "Error", "No se pudieron cargar los mantenimientos programados");
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

  const cargarEstadisticasProgramado = async () => {
    if (!usuario?.tecnico?.id_tecnico) return;

    try {
      const res = await fetch(
        `/api/tecnico/mantenimiento/programado/estadisticas?id_tecnico=${usuario.tecnico.id_tecnico}`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        }
      );

      const data = await res.json().catch(() => ({}));

      if (res.ok && data.success) {
        setEstadisticasProgramado(data.estadisticas);
      }
    } catch (error) {
      console.error("Error al cargar estadísticas programado:", error);
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

  const pausarMantenimiento = async (idMantenimiento: number) => {
    try {
      const res = await fetch(`/api/tecnico/mantenimiento/programado/${idMantenimiento}/pausar`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      if (!res.ok) {
        throw new Error("Error al pausar mantenimiento");
      }

      setMantenimientos((prev) =>
        prev.map((m) =>
          m.id_mantenimiento === idMantenimiento
            ? { ...m, estado_programacion: "pausado" as const }
            : m
        )
      );

      mostrarNotificacion("success", "Mantenimiento Pausado", "El mantenimiento fue pausado correctamente");
    } catch (error) {
      console.error("Error al pausar mantenimiento:", error);
      mostrarNotificacion("error", "Error", "No se pudo pausar el mantenimiento");
    }
  };

  const reanudarMantenimiento = async (idMantenimiento: number) => {
    try {
      const res = await fetch(`/api/tecnico/mantenimiento/programado/${idMantenimiento}/reanudar`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      if (!res.ok) {
        throw new Error("Error al reanudar mantenimiento");
      }

      setMantenimientos((prev) =>
        prev.map((m) =>
          m.id_mantenimiento === idMantenimiento
            ? { ...m, estado_programacion: "activo" as const }
            : m
        )
      );

      mostrarNotificacion("success", "Mantenimiento Reanudado", "El mantenimiento fue reanudado correctamente");
    } catch (error) {
      console.error("Error al reanudar mantenimiento:", error);
      mostrarNotificacion("error", "Error", "No se pudo reanudar el mantenimiento");
    }
  };

  const cancelarMantenimiento = async (idMantenimiento: number, motivo: string) => {
    try {
      const res = await fetch(`/api/tecnico/mantenimiento/programado/${idMantenimiento}/cancelar`, {
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
            ? { ...m, estado_programacion: "cancelado" as const }
            : m
        )
      );

      mostrarNotificacion("success", "Mantenimiento Cancelado", "El mantenimiento fue cancelado");
    } catch (error) {
      console.error("Error al cancelar mantenimiento:", error);
      mostrarNotificacion("error", "Error", "No se pudo cancelar el mantenimiento");
    }
  };

  const duplicarMantenimiento = async (idMantenimiento: number) => {
    try {
      const res = await fetch(`/api/tecnico/mantenimiento/programado/${idMantenimiento}/duplicar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      if (!res.ok) {
        throw new Error("Error al duplicar mantenimiento");
      }

      const data = await res.json();
      
      setMantenimientos((prev) => [...prev, data.mantenimiento]);
      mostrarNotificacion("success", "Mantenimiento Duplicado", "Se creó una copia del mantenimiento");
      cargarMantenimientosProgramados();
    } catch (error) {
      console.error("Error al duplicar mantenimiento:", error);
      mostrarNotificacion("error", "Error", "No se pudo duplicar el mantenimiento");
    }
  };

  const exportarMantenimientos = async (formato: "csv" | "excel" | "pdf" | "ical") => {
    try {
      mostrarNotificacion("info", "Exportando", `Generando archivo ${formato.toUpperCase()}...`);

      const res = await fetch(
        `/api/tecnico/mantenimiento/programado/exportar?formato=${formato}&id_tecnico=${usuario?.tecnico?.id_tecnico}&mes=${mesActual + 1}&año=${añoActual}`,
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
      a.download = `mantenimientos_programados_${mesActual + 1}_${añoActual}.${formato}`;
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

  const cambiarVista = (nuevaVista: Partial<VistaProgramado>) => {
    const vistaActualizada = { ...vista, ...nuevaVista };
    setVista(vistaActualizada);

    if (typeof window !== "undefined") {
      localStorage.setItem("vista_mantenimiento_programado", JSON.stringify(vistaActualizada));
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

  const obtenerNombreMes = (mes: number) => {
    const meses = [
      "Enero",
      "Febrero",
      "Marzo",
      "Abril",
      "Mayo",
      "Junio",
      "Julio",
      "Agosto",
      "Septiembre",
      "Octubre",
      "Noviembre",
      "Diciembre",
    ];
    return meses[mes];
  };

  const obtenerDiasDelMes = (mes: number, año: number) => {
    const primerDia = new Date(año, mes, 1);
    const ultimoDia = new Date(año, mes + 1, 0);
    const diasEnMes = ultimoDia.getDate();
    const primerDiaSemana = primerDia.getDay();

    const dias: (Date | null)[] = [];

    // Agregar días vacíos al inicio
    for (let i = 0; i < primerDiaSemana; i++) {
      dias.push(null);
    }

    // Agregar días del mes
    for (let dia = 1; dia <= diasEnMes; dia++) {
      dias.push(new Date(año, mes, dia));
    }

    return dias;
  };

  const obtenerMantenimientosDelDia = (fecha: Date) => {
    return mantenimientos.filter((m) => {
      const fechaMantenimiento = new Date(m.fecha_programada);
      return (
        fechaMantenimiento.getDate() === fecha.getDate() &&
        fechaMantenimiento.getMonth() === fecha.getMonth() &&
        fechaMantenimiento.getFullYear() === fecha.getFullYear()
      );
    });
  };

  const esHoy = (fecha: Date) => {
    const hoy = new Date();
    return (
      fecha.getDate() === hoy.getDate() &&
      fecha.getMonth() === hoy.getMonth() &&
      fecha.getFullYear() === hoy.getFullYear()
    );
  };

  const esPasado = (fecha: Date) => {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    return fecha < hoy;
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

  // ========================================
  // 📊 DATOS DERIVADOS Y CÁLCULOS
  // ========================================

  const mantenimientosFiltrados = useMemo(() => {
    let data = [...mantenimientos];

    // Filtro por tipo
    if (filtros.tipo.length > 0) {
      data = data.filter((m) => filtros.tipo.includes(m.tipo_mantenimiento));
    }

    // Filtro por prioridad
    if (filtros.prioridad.length > 0) {
      data = data.filter((m) => filtros.prioridad.includes(m.prioridad));
    }

    // Filtro por frecuencia
    if (filtros.frecuencia.length > 0) {
      data = data.filter((m) => filtros.frecuencia.includes(m.frecuencia));
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

    // Solo hoy
    if (filtros.soloHoy) {
      const hoy = new Date();
      data = data.filter((m) => {
        const fecha = new Date(m.fecha_programada);
        return esHoy(fecha);
      });
    }

    // Solo semana
    if (filtros.soloSemana) {
      const hoy = new Date();
      const finSemana = new Date(hoy);
      finSemana.setDate(hoy.getDate() + 7);
      data = data.filter((m) => {
        const fecha = new Date(m.fecha_programada);
        return fecha >= hoy && fecha <= finSemana;
      });
    }

    // Solo mes
    if (filtros.soloMes) {
      const hoy = new Date();
      data = data.filter((m) => {
        const fecha = new Date(m.fecha_programada);
        return fecha.getMonth() === hoy.getMonth() && fecha.getFullYear() === hoy.getFullYear();
      });
    }

    // Solo asignados a mí
    if (filtros.soloAsignadosAMi) {
      data = data.filter((m) => m.tecnico_asignado === usuario?.tecnico?.id_tecnico);
    }

    // Solo recurrentes
    if (filtros.soloRecurrentes) {
      data = data.filter((m) => m.es_recurrente);
    }

    // Solo pendientes de aprobación
    if (filtros.soloPendientesAprobacion) {
      data = data.filter((m) => m.requiere_aprobacion && !m.aprobado);
    }

    // No mostrar completados si está desactivado
    if (!vista.mostrarCompletados) {
      data = data.filter((m) => m.estado_programacion !== "completado");
    }

    // No mostrar cancelados si está desactivado
    if (!vista.mostrarCancelados) {
      data = data.filter((m) => m.estado_programacion !== "cancelado");
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
        case "equipo":
          comparacion = a.equipo.nombre.localeCompare(b.equipo.nombre);
          break;
        case "frecuencia":
          comparacion = a.frecuencia.localeCompare(b.frecuencia);
          break;
      }

      return filtros.ordenDireccion === "asc" ? comparacion : -comparacion;
    });

    return data;
  }, [mantenimientos, filtros, busqueda, usuario, vista.mostrarCompletados, vista.mostrarCancelados]);

  const resumenProgramado = useMemo(() => {
    const total = mantenimientos.length;
    const activos = mantenimientos.filter((m) => m.estado_programacion === "activo").length;
    
    const hoy = new Date();
    const mantenimientosHoy = mantenimientos.filter((m) => {
      const fecha = new Date(m.fecha_programada);
      return esHoy(fecha);
    }).length;

    const finSemana = new Date(hoy);
    finSemana.setDate(hoy.getDate() + 7);
    const mantenimientosSemana = mantenimientos.filter((m) => {
      const fecha = new Date(m.fecha_programada);
      return fecha >= hoy && fecha <= finSemana;
    }).length;

    const mantenimientosMes = mantenimientos.filter((m) => {
      const fecha = new Date(m.fecha_programada);
      return fecha.getMonth() === hoy.getMonth() && fecha.getFullYear() === hoy.getFullYear();
    }).length;

    const vencidos = mantenimientos.filter((m) => {
      const fecha = new Date(m.fecha_programada);
      return esPasado(fecha) && m.estado_programacion === "activo";
    }).length;

    const recurrentes = mantenimientos.filter((m) => m.es_recurrente).length;
    const pendientesAprobacion = mantenimientos.filter((m) => m.requiere_aprobacion && !m.aprobado).length;
    const asignadosAMi = mantenimientos.filter((m) => m.tecnico_asignado === usuario?.tecnico?.id_tecnico).length;

    return {
      total,
      activos,
      hoy: mantenimientosHoy,
      semana: mantenimientosSemana,
      mes: mantenimientosMes,
      vencidos,
      recurrentes,
      pendientesAprobacion,
      asignadosAMi,
      porTipo: {
        preventivo: mantenimientos.filter((m) => m.tipo_mantenimiento === "preventivo").length,
        correctivo: mantenimientos.filter((m) => m.tipo_mantenimiento === "correctivo").length,
        predictivo: mantenimientos.filter((m) => m.tipo_mantenimiento === "predictivo").length,
        calibracion: mantenimientos.filter((m) => m.tipo_mantenimiento === "calibracion").length,
        inspeccion: mantenimientos.filter((m) => m.tipo_mantenimiento === "inspeccion").length,
      },
      porFrecuencia: {
        unica: mantenimientos.filter((m) => m.frecuencia === "unica").length,
        diaria: mantenimientos.filter((m) => m.frecuencia === "diaria").length,
        semanal: mantenimientos.filter((m) => m.frecuencia === "semanal").length,
        quincenal: mantenimientos.filter((m) => m.frecuencia === "quincenal").length,
        mensual: mantenimientos.filter((m) => m.frecuencia === "mensual").length,
        trimestral: mantenimientos.filter((m) => m.frecuencia === "trimestral").length,
        semestral: mantenimientos.filter((m) => m.frecuencia === "semestral").length,
        anual: mantenimientos.filter((m) => m.frecuencia === "anual").length,
      },
    };
  }, [mantenimientos, usuario]);

  const datosPorTipo = useMemo(
    () => [
      {
        nombre: "Preventivo",
        valor: resumenProgramado.porTipo.preventivo,
        color: "#3b82f6",
      },
      {
        nombre: "Correctivo",
        valor: resumenProgramado.porTipo.correctivo,
        color: "#f97316",
      },
      {
        nombre: "Predictivo",
        valor: resumenProgramado.porTipo.predictivo,
        color: "#a855f7",
      },
      {
        nombre: "Calibración",
        valor: resumenProgramado.porTipo.calibracion,
        color: "#22c55e",
      },
      {
        nombre: "Inspección",
        valor: resumenProgramado.porTipo.inspeccion,
        color: "#06b6d4",
      },
    ],
    [resumenProgramado]
  );

  const datosPorFrecuencia = useMemo(
    () => [
      { nombre: "Única", valor: resumenProgramado.porFrecuencia.unica, color: "#6366f1" },
      { nombre: "Diaria", valor: resumenProgramado.porFrecuencia.diaria, color: "#8b5cf6" },
      { nombre: "Semanal", valor: resumenProgramado.porFrecuencia.semanal, color: "#d946ef" },
      { nombre: "Quincenal", valor: resumenProgramado.porFrecuencia.quincenal, color: "#ec4899" },
      { nombre: "Mensual", valor: resumenProgramado.porFrecuencia.mensual, color: "#f43f5e" },
      { nombre: "Trimestral", valor: resumenProgramado.porFrecuencia.trimestral, color: "#ef4444" },
      { nombre: "Semestral", valor: resumenProgramado.porFrecuencia.semestral, color: "#f97316" },
      { nombre: "Anual", valor: resumenProgramado.porFrecuencia.anual, color: "#eab308" },
    ],
    [resumenProgramado]
  );

  const diasDelMes = useMemo(
    () => obtenerDiasDelMes(mesActual, añoActual),
    [mesActual, añoActual]
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
            <div className="w-32 h-32 border-4 border-indigo-400 border-t-transparent rounded-full animate-spin"></div>
            <div
              className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-20 h-20 bg-gradient-to-br ${tema.colores.gradiente} rounded-full flex items-center justify-center animate-pulse`}
            >
              <CalendarCheck className="w-10 h-10 text-white" />
            </div>
          </div>
          <h2 className={`text-4xl font-black mb-4 ${tema.colores.texto}`}>
            Cargando Mantenimientos Programados
          </h2>
          <p
            className={`text-lg font-semibold ${tema.colores.textoSecundario} animate-pulse`}
          >
            Sincronizando calendario de mantenimiento...
          </p>
          <div className="mt-8 flex items-center justify-center gap-2">
            <div
              className="w-3 h-3 rounded-full bg-indigo-500 animate-bounce"
              style={{ animationDelay: "0ms" }}
            ></div>
            <div
              className="w-3 h-3 rounded-full bg-purple-500 animate-bounce"
              style={{ animationDelay: "150ms" }}
            ></div>
            <div
              className="w-3 h-3 rounded-full bg-pink-500 animate-bounce"
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
            No tienes permisos para acceder al módulo de mantenimiento programado.
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
              <Link
                href="/tecnico/mantenimiento"
                className={`text-sm font-semibold ${tema.colores.textoSecundario} hover:${tema.colores.acento} transition-colors`}
              >
                Mantenimiento
              </Link>
              <ChevronRight className="w-4 h-4 text-gray-500" />
              <span className={`text-sm font-bold ${tema.colores.acento}`}>
                Programado
              </span>
            </div>

            <div className="relative">
              <Search
                className={`absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 ${tema.colores.textoSecundario}`}
              />
              <input
                type="text"
                placeholder="Buscar mantenimientos programados..."
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
            {/* Auto-refresh */}
            <div className="relative group">
              <button
                onClick={() => setAutoRefresh(!autoRefresh)}
                className={`p-3 rounded-xl font-semibold transition-all duration-300 ${
                  autoRefresh
                    ? `bg-gradient-to-r ${tema.colores.gradiente} text-white shadow-lg`
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
                        ? `bg-gradient-to-r ${tema.colores.gradiente} text-white`
                        : `${tema.colores.hover} ${tema.colores.texto}`
                    }`}
                  >
                    1 minuto
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
                  <button
                    onClick={() => setIntervaloRefresh(600000)}
                    className={`w-full px-3 py-2 rounded-lg text-sm font-semibold transition-all ${
                      intervaloRefresh === 600000
                        ? `bg-gradient-to-r ${tema.colores.gradiente} text-white`
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
                <span className="animate-pulse inline-block">📅</span>
              </h2>
              <p className={`text-xl font-semibold ${tema.colores.textoSecundario}`}>
                Calendario de Mantenimiento Programado y Preventivo
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
                  className={`flex items-center gap-2 px-6 py-3 bg-gradient-to-r ${tema.colores.gradiente} text-white rounded-xl font-bold transition-all duration-300 hover:scale-105 shadow-xl`}
                >
                  <Plus className="w-5 h-5" />
                  Programar Nuevo
                </button>

                <button
                  onClick={() => setMostrarModalRecurrente(true)}
                  className={`flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-xl font-bold transition-all duration-300 hover:scale-105 shadow-xl`}
                >
                  <Repeat className="w-5 h-5" />
                  Recurrente
                </button>

                <button
                  onClick={() => cargarMantenimientosProgramados()}
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
                    <button
                      onClick={() => exportarMantenimientos("ical")}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all ${tema.colores.hover} ${tema.colores.texto}`}
                    >
                      <Calendar className="w-4 h-4" />
                      Exportar iCal
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tarjetas de resumen */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6 mb-8">
          {/* Total Programados */}
          <div
            className={`rounded-2xl p-6 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} transition-all duration-300 hover:scale-105 hover:-translate-y-1 cursor-pointer group`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 bg-gradient-to-br ${tema.colores.gradiente} rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                <CalendarCheck className="w-6 h-6 text-white" />
              </div>
              <Activity className="w-5 h-5 text-indigo-400" />
            </div>
            <div className={`text-4xl font-black mb-1 ${tema.colores.texto}`}>
              {resumenProgramado.total}
            </div>
            <div
              className={`text-xs font-bold uppercase tracking-wider ${tema.colores.textoSecundario}`}
            >
              Total Programados
            </div>
          </div>

          {/* Hoy */}
          <div
            onClick={() => setFiltros({ ...filtros, soloHoy: !filtros.soloHoy })}
            className={`rounded-2xl p-6 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} transition-all duration-300 hover:scale-105 hover:-translate-y-1 cursor-pointer group ${
              filtros.soloHoy ? "ring-2 ring-blue-500" : ""
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <CalendarDays className="w-6 h-6 text-white" />
              </div>
              <Clock className="w-5 h-5 text-blue-400" />
            </div>
            <div className={`text-4xl font-black mb-1 ${tema.colores.texto}`}>
              {resumenProgramado.hoy}
            </div>
            <div
              className={`text-xs font-bold uppercase tracking-wider ${tema.colores.textoSecundario}`}
            >
              Para Hoy
            </div>
          </div>

          {/* Esta Semana */}
          <div
            onClick={() => setFiltros({ ...filtros, soloSemana: !filtros.soloSemana })}
            className={`rounded-2xl p-6 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} transition-all duration-300 hover:scale-105 hover:-translate-y-1 cursor-pointer group ${
              filtros.soloSemana ? "ring-2 ring-purple-500" : ""
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <TrendingUp className="w-5 h-5 text-purple-400" />
            </div>
            <div className={`text-4xl font-black mb-1 ${tema.colores.texto}`}>
              {resumenProgramado.semana}
            </div>
            <div
              className={`text-xs font-bold uppercase tracking-wider ${tema.colores.textoSecundario}`}
            >
              Esta Semana
            </div>
          </div>

          {/* Este Mes */}
          <div
            onClick={() => setFiltros({ ...filtros, soloMes: !filtros.soloMes })}
            className={`rounded-2xl p-6 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} transition-all duration-300 hover:scale-105 hover:-translate-y-1 cursor-pointer group ${
              filtros.soloMes ? "ring-2 ring-green-500" : ""
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <CalendarClock className="w-6 h-6 text-white" />
              </div>
              <Trophy className="w-5 h-5 text-green-400" />
            </div>
            <div className={`text-4xl font-black mb-1 ${tema.colores.texto}`}>
              {resumenProgramado.mes}
            </div>
            <div
              className={`text-xs font-bold uppercase tracking-wider ${tema.colores.textoSecundario}`}
            >
              Este Mes
            </div>
          </div>

          {/* Vencidos */}
          <div
            onClick={() => setFiltros({ ...filtros, soloVencidos: !filtros.soloVencidos })}
            className={`rounded-2xl p-6 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} transition-all duration-300 hover:scale-105 hover:-translate-y-1 cursor-pointer group ${
              filtros.soloVencidos ? "ring-2 ring-red-500" : ""
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-rose-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <AlertTriangle className="w-6 h-6 text-white" />
              </div>
              <Flame className="w-5 h-5 text-red-400 animate-pulse" />
            </div>
            <div className={`text-4xl font-black mb-1 ${tema.colores.texto}`}>
              {resumenProgramado.vencidos}
            </div>
            <div
              className={`text-xs font-bold uppercase tracking-wider ${tema.colores.textoSecundario}`}
            >
              Vencidos
            </div>
          </div>

          {/* Recurrentes */}
          <div
            onClick={() => setFiltros({ ...filtros, soloRecurrentes: !filtros.soloRecurrentes })}
            className={`rounded-2xl p-6 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} transition-all duration-300 hover:scale-105 hover:-translate-y-1 cursor-pointer group ${
              filtros.soloRecurrentes ? "ring-2 ring-yellow-500" : ""
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-amber-500 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <Repeat className="w-6 h-6 text-white" />
              </div>
              <Zap className="w-5 h-5 text-yellow-400" />
            </div>
            <div className={`text-4xl font-black mb-1 ${tema.colores.texto}`}>
              {resumenProgramado.recurrentes}
            </div>
            <div
              className={`text-xs font-bold uppercase tracking-wider ${tema.colores.textoSecundario}`}
            >
              Recurrentes
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

          {/* Gráfico por frecuencia */}
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
                  Por Frecuencia
                </h3>
                <p className={`text-xs font-semibold ${tema.colores.textoSecundario}`}>
                  Periodicidad
                </p>
              </div>
            </div>

            <ResponsiveContainer width="100%" height={250}>
              <RechartsBarChart data={datosPorFrecuencia}>
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
                    border: "1px solid rgba(99,102,241,0.3)",
                    borderRadius: "12px",
                    padding: "12px",
                  }}
                />
                <Bar dataKey="valor" radius={[8, 8, 0, 0]}>
                  {datosPorFrecuencia.map((entry, index) => (
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
                    Activos
                  </span>
                  <CheckCircle2 className="w-4 h-4 text-green-400" />
                </div>
                <p className={`text-2xl font-black ${tema.colores.texto}`}>
                  {resumenProgramado.activos}
                </p>
              </div>

              <div className={`p-4 rounded-xl ${tema.colores.secundario}`}>
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-sm font-semibold ${tema.colores.textoSecundario}`}>
                    Asignados a Mí
                  </span>
                  <UserCheck className="w-4 h-4 text-blue-400" />
                </div>
                <p className={`text-2xl font-black ${tema.colores.texto}`}>
                  {resumenProgramado.asignadosAMi}
                </p>
              </div>

              <div className={`p-4 rounded-xl ${tema.colores.secundario}`}>
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-sm font-semibold ${tema.colores.textoSecundario}`}>
                    Pendientes Aprobación
                  </span>
                  <AlertCircle className="w-4 h-4 text-yellow-400" />
                </div>
                <p className={`text-2xl font-black ${tema.colores.texto}`}>
                  {resumenProgramado.pendientesAprobacion}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Control de navegación del calendario */}
        <div
          className={`rounded-2xl p-5 mb-8 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra}`}
        >
          <div className="flex flex-wrap gap-4 items-center justify-between">
            {/* Navegación de mes */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => {
                  if (mesActual === 0) {
                    setMesActual(11);
                    setAñoActual(añoActual - 1);
                  } else {
                    setMesActual(mesActual - 1);
                  }
                }}
                className={`p-3 rounded-xl ${tema.colores.secundario} ${tema.colores.texto} hover:scale-110 transition-all duration-300`}
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              <div className="text-center">
                <h3 className={`text-2xl font-black ${tema.colores.texto}`}>
                  {obtenerNombreMes(mesActual)} {añoActual}
                </h3>
                <p className={`text-sm ${tema.colores.textoSecundario}`}>
                  {resumenProgramado.mes} mantenimientos programados
                </p>
              </div>

              <button
                onClick={() => {
                  if (mesActual === 11) {
                    setMesActual(0);
                    setAñoActual(añoActual + 1);
                  } else {
                    setMesActual(mesActual + 1);
                  }
                }}
                className={`p-3 rounded-xl ${tema.colores.secundario} ${tema.colores.texto} hover:scale-110 transition-all duration-300`}
              >
                <ChevronRight className="w-5 h-5" />
              </button>

              <button
                onClick={() => {
                  const hoy = new Date();
                  setMesActual(hoy.getMonth());
                  setAñoActual(hoy.getFullYear());
                }}
                className={`px-4 py-2 rounded-xl font-semibold text-sm transition-all ${tema.colores.secundario} ${tema.colores.texto}`}
              >
                Hoy
              </button>
            </div>

            {/* Controles de vista */}
            <div className="flex flex-wrap gap-2">
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-gray-500/10">
                <span className={`text-sm font-semibold ${tema.colores.texto}`}>
                  Vista:
                </span>
                <button
                  onClick={() => cambiarVista({ modo: "calendario" })}
                  className={`p-2 rounded-lg transition-all ${
                    vista.modo === "calendario"
                      ? `bg-gradient-to-r ${tema.colores.gradiente} text-white`
                      : `${tema.colores.hover} ${tema.colores.texto}`
                  }`}
                  title="Vista de calendario"
                >
                  <Calendar className="w-4 h-4" />
                </button>
                <button
                  onClick={() => cambiarVista({ modo: "lista" })}
                  className={`p-2 rounded-lg transition-all ${
                    vista.modo === "lista"
                      ? `bg-gradient-to-r ${tema.colores.gradiente} text-white`
                      : `${tema.colores.hover} ${tema.colores.texto}`
                  }`}
                  title="Vista de lista"
                >
                  <Layers className="w-4 h-4" />
                </button>
                <button
                  onClick={() => cambiarVista({ modo: "timeline" })}
                  className={`p-2 rounded-lg transition-all ${
                    vista.modo === "timeline"
                      ? `bg-gradient-to-r ${tema.colores.gradiente} text-white`
                      : `${tema.colores.hover} ${tema.colores.texto}`
                  }`}
                  title="Vista de línea de tiempo"
                >
                  <History className="w-4 h-4" />
                </button>
                <button
                  onClick={() => cambiarVista({ modo: "gantt" })}
                  className={`p-2 rounded-lg transition-all ${
                    vista.modo === "gantt"
                      ? `bg-gradient-to-r ${tema.colores.gradiente} text-white`
                      : `${tema.colores.hover} ${tema.colores.texto}`
                  }`}
                  title="Vista Gantt"
                >
                  <BarChart3 className="w-4 h-4" />
                </button>
              </div>

              <button
                onClick={() => setMostrarFiltrosAvanzados(!mostrarFiltrosAvanzados)}
                className={`px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 transition-all duration-300 ${
                  mostrarFiltrosAvanzados
                    ? `bg-gradient-to-r ${tema.colores.gradiente} text-white shadow-lg`
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
                    🎯 Prioridad
                  </label>
                  <div className="space-y-2">
                    {["baja", "media", "alta", "critica"].map((prioridad) => (
                      <label
                        key={prioridad}
                        className="flex items-center gap-2 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={filtros.prioridad.includes(prioridad)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFiltros({
                                ...filtros,
                                prioridad: [...filtros.prioridad, prioridad],
                              });
                            } else {
                              setFiltros({
                                ...filtros,
                                prioridad: filtros.prioridad.filter((p) => p !== prioridad),
                              });
                            }
                          }}
                          className="w-4 h-4 rounded"
                        />
                        <span
                          className={`text-sm font-semibold ${tema.colores.texto} capitalize`}
                        >
                          {prioridad}
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

                <div className="flex items-end">
                  <button
                    onClick={() =>
                      setFiltros({
                        tipo: [],
                        prioridad: [],
                        frecuencia: [],
                        ubicacion: "",
                        equipoNombre: "",
                        fechaDesde: "",
                        fechaHasta: "",
                        tecnicoAsignado: "",
                        soloVencidos: false,
                        soloHoy: false,
                        soloSemana: false,
                        soloMes: false,
                        soloAsignadosAMi: false,
                        soloRecurrentes: false,
                        soloPendientesAprobacion: false,
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

        {/* Vista de Calendario */}
        {vista.modo === "calendario" && (
          <div
            className={`rounded-2xl p-6 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra}`}
          >
            {/* Encabezado del calendario */}
            <div className="grid grid-cols-7 gap-2 mb-4">
              {["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"].map((dia) => (
                <div
                  key={dia}
                  className={`text-center py-3 font-black text-sm ${tema.colores.texto}`}
                >
                  {dia}
                </div>
              ))}
            </div>

            {/* Días del calendario */}
            <div className="grid grid-cols-7 gap-2">
              {diasDelMes.map((fecha, index) => {
                if (!fecha) {
                  return (
                    <div
                      key={`empty-${index}`}
                      className={`aspect-square rounded-xl ${tema.colores.secundario} opacity-30`}
                    ></div>
                  );
                }

                const mantenimientosDia = obtenerMantenimientosDelDia(fecha);
                const hoy = esHoy(fecha);
                const pasado = esPasado(fecha);

                return (
                  <div
                    key={index}
                    onClick={() => setDiaSeleccionado(fecha)}
                    className={`aspect-square rounded-xl p-2 cursor-pointer transition-all duration-300 hover:scale-105 ${
                      hoy
                        ? `bg-gradient-to-br ${tema.colores.gradiente} text-white shadow-xl`
                        : pasado
                        ? `${tema.colores.secundario} opacity-60`
                        : `${tema.colores.secundario}`
                    } ${
                      diaSeleccionado?.getDate() === fecha.getDate() &&
                      diaSeleccionado?.getMonth() === fecha.getMonth()
                        ? "ring-2 ring-indigo-500"
                        : ""
                    }`}
                  >
                    <div className="flex flex-col h-full">
                      <div className="flex items-center justify-between mb-1">
                        <span
                          className={`text-sm font-black ${
                            hoy ? "text-white" : tema.colores.texto
                          }`}
                        >
                          {fecha.getDate()}
                        </span>
                        {mantenimientosDia.length > 0 && (
                          <span
                            className={`px-1.5 py-0.5 rounded-full text-xs font-bold ${
                              hoy
                                ? "bg-white/20 text-white"
                                : "bg-indigo-500/20 text-indigo-300"
                            }`}
                          >
                            {mantenimientosDia.length}
                          </span>
                        )}
                      </div>

                      <div className="flex-1 space-y-1 overflow-y-auto custom-scrollbar">
                        {mantenimientosDia.slice(0, 3).map((mantenimiento) => {
                          const IconoTipo = obtenerIconoTipo(mantenimiento.tipo_mantenimiento);
                          return (
                            <div
                              key={mantenimiento.id_mantenimiento}
                              className={`px-1.5 py-1 rounded text-xs font-semibold truncate ${
                                hoy
                                  ? "bg-white/20 text-white"
                                  : obtenerColorPrioridad(mantenimiento.prioridad)
                              } flex items-center gap-1`}
                              title={mantenimiento.equipo.nombre}
                            >
                              <IconoTipo className="w-3 h-3 flex-shrink-0" />
                              <span className="truncate">{mantenimiento.equipo.nombre}</span>
                            </div>
                          );
                        })}
                        {mantenimientosDia.length > 3 && (
                          <div
                            className={`text-xs font-bold text-center ${
                              hoy ? "text-white/80" : tema.colores.textoSecundario
                            }`}
                          >
                            +{mantenimientosDia.length - 3} más
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Detalle del día seleccionado */}
            {diaSeleccionado && (
              <div className="mt-6 pt-6 border-t border-gray-700/50">
                <h4 className={`text-xl font-black mb-4 ${tema.colores.texto}`}>
                  📅 Mantenimientos del{" "}
                  {diaSeleccionado.toLocaleDateString("es-CL", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </h4>

                {obtenerMantenimientosDelDia(diaSeleccionado).length === 0 ? (
                  <div className="text-center py-8">
                    <Package
                      className={`w-16 h-16 mx-auto mb-4 ${tema.colores.textoSecundario} opacity-50`}
                    />
                    <p className={`text-lg ${tema.colores.textoSecundario}`}>
                      No hay mantenimientos programados para este día
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {obtenerMantenimientosDelDia(diaSeleccionado).map((mantenimiento) => {
                      const IconoTipo = obtenerIconoTipo(mantenimiento.tipo_mantenimiento);

                      return (
                        <div
                          key={mantenimiento.id_mantenimiento}
                          onClick={() => {
                            setMantenimientoSeleccionado(mantenimiento);
                            setPanelDetalleAbierto(true);
                          }}
                          className={`rounded-xl p-4 ${tema.colores.secundario} ${tema.colores.borde} border hover:scale-105 transition-all duration-300 cursor-pointer group`}
                        >
                          <div className="flex items-start gap-3 mb-3">
                            <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center overflow-hidden flex-shrink-0">
                              {mantenimiento.equipo.foto_url ? (
                                <Image
                                  src={mantenimiento.equipo.foto_url}
                                  alt={mantenimiento.equipo.nombre}
                                  width={48}
                                  height={48}
                                  className="object-cover"
                                />
                              ) : (
                                <IconoTipo className="w-6 h-6 text-white" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h5 className={`text-sm font-bold ${tema.colores.texto} line-clamp-1 mb-1`}>
                                {mantenimiento.equipo.nombre}
                              </h5>
                              <div className="flex items-center gap-2 mb-2">
                                <span
                                  className={`px-2 py-0.5 rounded-full text-xs font-bold border ${obtenerColorPrioridad(
                                    mantenimiento.prioridad
                                  )}`}
                                >
                                  {mantenimiento.prioridad}
                                </span>
                                <span className={`text-xs ${tema.colores.textoSecundario}`}>
                                  {mantenimiento.hora_programada}
                                </span>
                              </div>
                            </div>
                          </div>

                          <p className={`text-xs ${tema.colores.textoSecundario} line-clamp-2 mb-3`}>
                            {mantenimiento.descripcion}
                          </p>

                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1">
                              <Clock className="w-3 h-3 text-gray-500" />
                              <span className={`text-xs font-semibold ${tema.colores.texto}`}>
                                {formatearTiempo(mantenimiento.duracion_estimada)}
                              </span>
                            </div>
                            {mantenimiento.es_recurrente && (
                              <div className="flex items-center gap-1">
                                <Repeat className="w-3 h-3 text-purple-400" />
                                <span className={`text-xs font-semibold ${tema.colores.texto}`}>
                                  {FRECUENCIAS.find((f) => f.value === mantenimiento.frecuencia)?.label}
                                </span>
                              </div>
                            )}
                          </div>

                          {mantenimiento.requiere_aprobacion && !mantenimiento.aprobado && (
                            <div className="mt-3 pt-3 border-t border-gray-700/50">
                              <span className="px-2 py-1 rounded-full text-xs font-bold bg-yellow-500/20 text-yellow-300 border border-yellow-500/40">
                                ⏳ Pendiente aprobación
                              </span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Vista de Lista */}
        {vista.modo === "lista" && (
          <div className="space-y-4">
            {loadingMantenimientos ? (
              <div className="flex items-center justify-center py-20">
                <div className="text-center">
                  <Loader2 className="w-16 h-16 animate-spin text-indigo-500 mx-auto mb-4" />
                  <p className={`text-lg font-semibold ${tema.colores.textoSecundario}`}>
                    Cargando mantenimientos programados...
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
                  No hay mantenimientos programados que coincidan con los filtros aplicados.
                </p>
                <div className="flex items-center justify-center gap-4">
                  <button
                    onClick={() => {
                      setFiltros({
                        tipo: [],
                        prioridad: [],
                        frecuencia: [],
                        ubicacion: "",
                        equipoNombre: "",
                        fechaDesde: "",
                        fechaHasta: "",
                        tecnicoAsignado: "",
                        soloVencidos: false,
                        soloHoy: false,
                        soloSemana: false,
                        soloMes: false,
                        soloAsignadosAMi: false,
                        soloRecurrentes: false,
                        soloPendientesAprobacion: false,
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
                    className={`px-6 py-3 bg-gradient-to-r ${tema.colores.gradiente} text-white rounded-xl font-bold transition-all duration-300 hover:scale-105 shadow-xl`}
                  >
                    <Plus className="w-5 h-5 inline mr-2" />
                    Programar Nuevo
                  </button>
                </div>
              </div>
            ) : (
              mantenimientosFiltrados.map((mantenimiento) => {
                const IconoTipo = obtenerIconoTipo(mantenimiento.tipo_mantenimiento);
                const isSeleccionado = mantenimientosSeleccionados.includes(
                  mantenimiento.id_mantenimiento
                );
                const fechaMantenimiento = new Date(mantenimiento.fecha_programada);
                const vencido = esPasado(fechaMantenimiento) && mantenimiento.estado_programacion === "activo";

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
                        className={`w-16 h-16 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center flex-shrink-0 relative overflow-hidden`}
                      >
                        {mantenimiento.equipo.foto_url ? (
                          <Image
                            src={mantenimiento.equipo.foto_url}
                            alt={mantenimiento.equipo.nombre}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <IconoTipo className="w-8 h-8 text-white" />
                        )}
                        {mantenimiento.es_recurrente && (
                          <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center shadow-lg">
                            <Repeat className="w-3 h-3 text-white" />
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className={`text-base font-bold ${tema.colores.texto}`}>
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
                            className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                              mantenimiento.estado_programacion === "activo"
                                ? "bg-green-500/20 text-green-300 border border-green-500/40"
                                : mantenimiento.estado_programacion === "pausado"
                                ? "bg-yellow-500/20 text-yellow-300 border border-yellow-500/40"
                                : "bg-gray-500/20 text-gray-300 border border-gray-500/40"
                            }`}
                          >
                            {mantenimiento.estado_programacion}
                          </span>
                          {vencido && (
                            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-red-500/20 text-red-300 border border-red-500/40 animate-pulse">
                              ⚠️ Vencido
                            </span>
                          )}
                          {mantenimiento.requiere_aprobacion && !mantenimiento.aprobado && (
                            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-yellow-500/20 text-yellow-300 border border-yellow-500/40">
                              ⏳ Pendiente
                            </span>
                          )}
                        </div>
                        <p className={`text-sm ${tema.colores.textoSecundario} line-clamp-1 mb-2`}>
                          {mantenimiento.descripcion} • {mantenimiento.equipo.ubicacion}
                        </p>
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-gray-500" />
                            <span className={`text-xs font-semibold ${tema.colores.texto}`}>
                              {formatearFecha(mantenimiento.fecha_programada)}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3 text-gray-500" />
                            <span className={`text-xs font-semibold ${tema.colores.texto}`}>
                              {mantenimiento.hora_programada} • {formatearTiempo(mantenimiento.duracion_estimada)}
                            </span>
                          </div>
                          {mantenimiento.es_recurrente && (
                            <div className="flex items-center gap-1">
                              <Repeat className="w-3 h-3 text-purple-400" />
                              <span className={`text-xs font-semibold ${tema.colores.texto}`}>
                                {FRECUENCIAS.find((f) => f.value === mantenimiento.frecuencia)?.label}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {mantenimiento.estado_programacion === "activo" && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              pausarMantenimiento(mantenimiento.id_mantenimiento);
                            }}
                            className="p-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition-all duration-300 hover:scale-105"
                            title="Pausar"
                          >
                            <Pause className="w-4 h-4" />
                          </button>
                        )}

                        {mantenimiento.estado_programacion === "pausado" && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              reanudarMantenimiento(mantenimiento.id_mantenimiento);
                            }}
                            className="p-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-all duration-300 hover:scale-105"
                            title="Reanudar"
                          >
                            <Play className="w-4 h-4" />
                          </button>
                        )}

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            duplicarMantenimiento(mantenimiento.id_mantenimiento);
                          }}
                          className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all duration-300 hover:scale-105"
                          title="Duplicar"
                        >
                          <Copy className="w-4 h-4" />
                        </button>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setMantenimientoSeleccionado(mantenimiento);
                            setPanelDetalleAbierto(true);
                          }}
                          className={`p-2 rounded-lg ${tema.colores.secundario} ${tema.colores.texto} hover:scale-105 transition-all duration-300`}
                          title="Ver detalles"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* Vista Timeline */}
        {vista.modo === "timeline" && (
          <div
            className={`rounded-2xl p-6 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra}`}
          >
            <div className="relative">
              {/* Línea vertical */}
              <div
                className={`absolute left-8 top-0 bottom-0 w-0.5 ${tema.colores.borde}`}
              ></div>

              <div className="space-y-8">
                {mantenimientosFiltrados.map((mantenimiento, index) => {
                  const IconoTipo = obtenerIconoTipo(mantenimiento.tipo_mantenimiento);
                  const fechaMantenimiento = new Date(mantenimiento.fecha_programada);
                  const vencido = esPasado(fechaMantenimiento) && mantenimiento.estado_programacion === "activo";

                  return (
                    <div
                      key={mantenimiento.id_mantenimiento}
                      className="relative pl-20"
                      onClick={() => {
                        setMantenimientoSeleccionado(mantenimiento);
                        setPanelDetalleAbierto(true);
                      }}
                    >
                      {/* Punto en la línea */}
                      <div
                        className={`absolute left-6 w-5 h-5 rounded-full ${
                          vencido
                            ? "bg-gradient-to-br from-red-500 to-rose-600"
                            : "bg-gradient-to-br from-indigo-500 to-purple-500"
                        } border-4 ${tema.colores.fondoSecundario} shadow-lg flex items-center justify-center`}
                      >
                        <IconoTipo className="w-3 h-3 text-white" />
                      </div>

                      {/* Tarjeta de timeline */}
                      <div
                        className={`rounded-2xl p-6 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} transition-all duration-300 hover:scale-[1.02] cursor-pointer group ${
                          vencido ? "ring-2 ring-red-500/50" : ""
                        }`}
                      >
                        <div className="flex items-start gap-4">
                          <div
                            className={`w-16 h-16 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform overflow-hidden`}
                          >
                            {mantenimiento.equipo.foto_url ? (
                              <Image
                                src={mantenimiento.equipo.foto_url}
                                alt={mantenimiento.equipo.nombre}
                                width={64}
                                height={64}
                                className="object-cover"
                              />
                            ) : (
                              <IconoTipo className="w-8 h-8 text-white" />
                            )}
                          </div>

                          <div className="flex-1">
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <h4
                                  className={`text-lg font-black ${tema.colores.texto} mb-1`}
                                >
                                  {mantenimiento.equipo.nombre}
                                </h4>
                                <div className="flex items-center gap-2">
                                  <span
                                    className={`px-2 py-1 rounded-full text-xs font-bold border ${obtenerColorPrioridad(
                                      mantenimiento.prioridad
                                    )}`}
                                  >
                                    {mantenimiento.prioridad}
                                  </span>
                                  <span
                                    className={`px-2 py-1 rounded-full text-xs font-bold border ${tema.colores.info}`}
                                  >
                                    {TIPOS_MANTENIMIENTO.find((t) => t.value === mantenimiento.tipo_mantenimiento)?.label}
                                  </span>
                                  {mantenimiento.es_recurrente && (
                                    <span className="px-2 py-1 rounded-full text-xs font-bold bg-purple-500/20 text-purple-300 border border-purple-500/40">
                                      <Repeat className="w-3 h-3 inline mr-1" />
                                      {FRECUENCIAS.find((f) => f.value === mantenimiento.frecuencia)?.label}
                                    </span>
                                  )}
                                  {vencido && (
                                    <span className="px-2 py-1 rounded-full text-xs font-bold bg-red-500/20 text-red-300 border border-red-500/40 animate-pulse">
                                      ⚠️ Vencido
                                    </span>
                                  )}
                                </div>
                              </div>
                              <div className="text-right">
                                <p className={`text-sm font-semibold ${tema.colores.texto}`}>
                                  {formatearFecha(mantenimiento.fecha_programada)}
                                </p>
                                <p className={`text-xs ${tema.colores.textoSecundario}`}>
                                  {mantenimiento.hora_programada}
                                </p>
                              </div>
                            </div>

                            <p
                              className={`text-sm mb-3 ${tema.colores.textoSecundario}`}
                            >
                              {mantenimiento.descripcion}
                            </p>

                            <div className="grid grid-cols-2 gap-4 mb-4">
                              <div
                                className={`p-3 rounded-xl ${tema.colores.secundario}`}
                              >
                                <p
                                  className={`text-xs font-semibold ${tema.colores.textoSecundario} mb-1`}
                                >
                                  Equipo
                                </p>
                                <p className={`text-sm font-bold ${tema.colores.texto}`}>
                                  {mantenimiento.equipo.marca} {mantenimiento.equipo.modelo}
                                </p>
                              </div>

                              <div
                                className={`p-3 rounded-xl ${tema.colores.secundario}`}
                              >
                                <p
                                  className={`text-xs font-semibold ${tema.colores.textoSecundario} mb-1`}
                                >
                                  Ubicación
                                </p>
                                <p className={`text-sm font-bold ${tema.colores.texto}`}>
                                  {mantenimiento.equipo.ubicacion}
                                </p>
                              </div>

                              <div
                                className={`p-3 rounded-xl ${tema.colores.secundario}`}
                              >
                                <p
                                  className={`text-xs font-semibold ${tema.colores.textoSecundario} mb-1`}
                                >
                                  Duración Estimada
                                </p>
                                <p className={`text-sm font-bold ${tema.colores.texto}`}>
                                  {formatearTiempo(mantenimiento.duracion_estimada)}
                                </p>
                              </div>

                              <div
                                className={`p-3 rounded-xl ${tema.colores.secundario}`}
                              >
                                <p
                                  className={`text-xs font-semibold ${tema.colores.textoSecundario} mb-1`}
                                >
                                  Técnico Asignado
                                </p>
                                <p className={`text-sm font-bold ${tema.colores.texto}`}>
                                  {mantenimiento.nombre_tecnico}
                                </p>
                              </div>
                            </div>

                            {mantenimiento.checklist && mantenimiento.checklist.length > 0 && (
                              <div className="mb-4">
                                <p className={`text-xs font-semibold ${tema.colores.textoSecundario} mb-2`}>
                                  Checklist: {mantenimiento.checklist.length} items
                                </p>
                                <div className="w-full bg-gray-700 rounded-full h-2">
                                  <div
                                    className="bg-gradient-to-r from-indigo-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                                    style={{ width: "0%" }}
                                  ></div>
                                </div>
                              </div>
                            )}

                            <div className="flex items-center gap-2">
                              {mantenimiento.estado_programacion === "activo" && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    pausarMantenimiento(mantenimiento.id_mantenimiento);
                                  }}
                                  className="px-3 py-1.5 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg font-semibold text-xs transition-all duration-300 hover:scale-105 flex items-center gap-1"
                                >
                                  <Pause className="w-3 h-3" />
                                  Pausar
                                </button>
                              )}

                              {mantenimiento.estado_programacion === "pausado" && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    reanudarMantenimiento(mantenimiento.id_mantenimiento);
                                  }}
                                  className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold text-xs transition-all duration-300 hover:scale-105 flex items-center gap-1"
                                >
                                  <Play className="w-3 h-3" />
                                  Reanudar
                                </button>
                              )}

                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  duplicarMantenimiento(mantenimiento.id_mantenimiento);
                                }}
                                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold text-xs transition-all duration-300 hover:scale-105 flex items-center gap-1"
                              >
                                <Copy className="w-3 h-3" />
                                Duplicar
                              </button>

                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const motivo = prompt("Motivo de cancelación:");
                                  if (motivo) {
                                    cancelarMantenimiento(mantenimiento.id_mantenimiento, motivo);
                                  }
                                }}
                                className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold text-xs transition-all duration-300 hover:scale-105 flex items-center gap-1"
                              >
                                <X className="w-3 h-3" />
                                Cancelar
                              </button>

                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setMantenimientoSeleccionado(mantenimiento);
                                  setPanelDetalleAbierto(true);
                                }}
                                className={`px-3 py-1.5 rounded-lg font-semibold text-xs transition-all duration-300 ${tema.colores.secundario} ${tema.colores.texto}`}
                              >
                                Ver detalles completos
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Vista Gantt */}
        {vista.modo === "gantt" && (
          <div
            className={`rounded-2xl p-6 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra}`}
          >
            <div className="text-center py-12">
              <BarChart3 className={`w-16 h-16 mx-auto mb-4 ${tema.colores.textoSecundario}`} />
              <h3 className={`text-2xl font-black mb-2 ${tema.colores.texto}`}>
                Vista Gantt
              </h3>
              <p className={`text-sm ${tema.colores.textoSecundario}`}>
                Funcionalidad en desarrollo - Próximamente disponible
              </p>
            </div>
          </div>
        )}

        {/* Paginación */}
        {mantenimientosFiltrados.length > 0 && vista.modo !== "calendario" && (
          <div
            className={`mt-8 rounded-2xl p-4 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra}`}
          >
            <div className="flex items-center justify-between">
              <p className={`text-sm font-semibold ${tema.colores.textoSecundario}`}>
                Mostrando {mantenimientosFiltrados.length} de {resumenProgramado.total} mantenimientos programados
              </p>
              <div className="flex items-center gap-2">
                <button
                  className={`px-4 py-2 rounded-xl font-semibold text-sm transition-all ${tema.colores.secundario} ${tema.colores.texto}`}
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className={`px-4 py-2 font-bold ${tema.colores.texto}`}>
                  Página 1
                </span>
                <button
                  className={`px-4 py-2 rounded-xl font-semibold text-sm transition-all ${tema.colores.secundario} ${tema.colores.texto}`}
                >
                  <ChevronRight className="w-4 h-4" />
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
                className={`w-10 h-10 bg-gradient-to-br ${tema.colores.gradiente} rounded-xl flex items-center justify-center shadow-lg`}
              >
                <CalendarCheck className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className={`text-sm font-semibold ${tema.colores.texto}`}>
                  © 2025 AnyssaMed - Sistema de Mantenimiento Programado Premium
                </p>
                <p className={`text-xs ${tema.colores.textoSecundario}`}>
                  Gestión Integral de Mantenimiento Preventivo v4.5.0
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
                📅 Mes: {obtenerNombreMes(mesActual)} {añoActual}
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
          <div className={`sticky top-0 bg-gradient-to-r ${tema.colores.gradiente} p-6 z-10`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-2xl font-black text-white flex items-center gap-2">
                <CalendarCheck className="w-6 h-6" />
                Mantenimiento Programado
              </h3>
              <button
                onClick={() => setPanelDetalleAbierto(false)}
                className="p-2 rounded-xl bg-white/20 hover:bg-white/30 text-white transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
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
                className={`px-3 py-1 rounded-full text-xs font-bold ${
                  mantenimientoSeleccionado.estado_programacion === "activo"
                    ? "bg-green-500/20 text-green-300 border border-green-500/40"
                    : mantenimientoSeleccionado.estado_programacion === "pausado"
                    ? "bg-yellow-500/20 text-yellow-300 border border-yellow-500/40"
                    : "bg-gray-500/20 text-gray-300 border border-gray-500/40"
                }`}
              >
                {mantenimientoSeleccionado.estado_programacion}
              </span>
              {mantenimientoSeleccionado.es_recurrente && (
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-purple-500/20 text-purple-300 border border-purple-500/40">
                  <Repeat className="w-3 h-3 inline mr-1" />
                  Recurrente
                </span>
              )}
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
                  <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center overflow-hidden">
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
                <div className="flex items-center justify-between">
                  <span
                    className={`text-sm font-semibold ${tema.colores.textoSecundario}`}
                  >
                    Hora
                  </span>
                  <span className={`text-sm font-bold ${tema.colores.texto}`}>
                    {mantenimientoSeleccionado.hora_programada}
                  </span>
                </div>
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
                {mantenimientoSeleccionado.es_recurrente && (
                  <>
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-sm font-semibold ${tema.colores.textoSecundario}`}
                      >
                        Frecuencia
                      </span>
                      <span className={`text-sm font-bold ${tema.colores.texto}`}>
                        {FRECUENCIAS.find((f) => f.value === mantenimientoSeleccionado.frecuencia)?.label}
                      </span>
                    </div>
                    {mantenimientoSeleccionado.proxima_ejecucion && (
                      <div className="flex items-center justify-between">
                        <span
                          className={`text-sm font-semibold ${tema.colores.textoSecundario}`}
                        >
                          Próxima Ejecución
                        </span>
                        <span className={`text-sm font-bold ${tema.colores.texto}`}>
                          {formatearFecha(mantenimientoSeleccionado.proxima_ejecucion)}
                        </span>
                      </div>
                    )}
                  </>
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
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-lg font-bold">
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
                      <Circle className="w-5 h-5 text-gray-500 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <p
                          className={`text-sm font-semibold ${tema.colores.texto}`}
                        >
                          {item.descripcion}
                          {item.es_critico && (
                            <span className="ml-2 px-2 py-0.5 rounded-full text-xs font-bold bg-red-500/20 text-red-300">
                              Crítico
                            </span>
                          )}
                        </p>
                        {item.categoria && (
                          <p className={`text-xs ${tema.colores.textoSecundario} mt-1`}>
                            Categoría: {item.categoria}
                          </p>
                        )}
                        {item.tiempo_estimado > 0 && (
                          <p className={`text-xs ${tema.colores.textoSecundario} mt-1`}>
                            Tiempo estimado: {formatearTiempo(item.tiempo_estimado)}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Repuestos necesarios */}
            {mantenimientoSeleccionado.repuestos_necesarios &&
              mantenimientoSeleccionado.repuestos_necesarios.length > 0 && (
                <div>
                  <h4 className={`text-lg font-black mb-3 ${tema.colores.texto} flex items-center gap-2`}>
                    <Package className="w-5 h-5" />
                    Repuestos Necesarios
                  </h4>
                  <div className="space-y-2">
                    {mantenimientoSeleccionado.repuestos_necesarios.map((repuesto) => (
                      <div
                        key={repuesto.id_repuesto}
                        className={`p-3 rounded-xl ${tema.colores.secundario} border ${tema.colores.borde}`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <p className={`text-sm font-bold ${tema.colores.texto}`}>
                            {repuesto.nombre}
                            {repuesto.es_critico && (
                              <span className="ml-2 px-2 py-0.5 rounded-full text-xs font-bold bg-red-500/20 text-red-300">
                                Crítico
                              </span>
                            )}
                          </p>
                          <span className={`text-sm font-bold ${tema.colores.texto}`}>
                            ${repuesto.costo_estimado.toLocaleString("es-CL")}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className={tema.colores.textoSecundario}>
                            Código: {repuesto.codigo}
                          </span>
                          <span className={tema.colores.textoSecundario}>
                            Necesario: {repuesto.cantidad_necesaria}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span className={`${
                            repuesto.cantidad_disponible >= repuesto.cantidad_necesaria
                              ? "text-green-400"
                              : "text-red-400"
                          } font-semibold`}>
                            Disponible: {repuesto.cantidad_disponible}
                          </span>
                          {repuesto.tiempo_entrega_dias > 0 && (
                            <span className={tema.colores.textoSecundario}>
                              Entrega: {repuesto.tiempo_entrega_dias} días
                            </span>
                          )}
                        </div>
                        {repuesto.proveedor && (
                          <p className={`text-xs ${tema.colores.textoSecundario} mt-1`}>
                            Proveedor: {repuesto.proveedor}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

            {/* Documentos de referencia */}
            {mantenimientoSeleccionado.documentos_referencia &&
              mantenimientoSeleccionado.documentos_referencia.length > 0 && (
                <div>
                  <h4 className={`text-lg font-black mb-3 ${tema.colores.texto} flex items-center gap-2`}>
                    <FileText className="w-5 h-5" />
                    Documentos de Referencia
                  </h4>
                  <div className="space-y-2">
                    {mantenimientoSeleccionado.documentos_referencia.map((doc) => (
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
                          <p className={`text-xs ${tema.colores.textoSecundario}`}>
                            {doc.tipo} • Versión {doc.version}
                          </p>
                        </div>
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    ))}
                  </div>
                </div>
              )}

            {/* Historial de ejecuciones */}
            {mantenimientoSeleccionado.historial_ejecuciones &&
              mantenimientoSeleccionado.historial_ejecuciones.length > 0 && (
                <div>
                  <h4 className={`text-lg font-black mb-3 ${tema.colores.texto} flex items-center gap-2`}>
                    <History className="w-5 h-5" />
                    Historial de Ejecuciones
                  </h4>
                  <div className="space-y-3">
                    {mantenimientoSeleccionado.historial_ejecuciones.map((ejecucion) => (
                      <div
                        key={ejecucion.id_ejecucion}
                        className={`p-3 rounded-xl ${tema.colores.secundario} border ${tema.colores.borde}`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span
                            className={`text-xs font-bold ${tema.colores.texto} uppercase`}
                          >
                            {formatearFecha(ejecucion.fecha_ejecucion)}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                              ejecucion.resultado === "exitoso"
                                ? "bg-green-500/20 text-green-300 border border-green-500/40"
                                : ejecucion.resultado === "parcial"
                                ? "bg-yellow-500/20 text-yellow-300 border border-yellow-500/40"
                                : "bg-red-500/20 text-red-300 border border-red-500/40"
                            }`}
                          >
                            {ejecucion.resultado}
                          </span>
                        </div>
                        <p className={`text-sm ${tema.colores.textoSecundario} mb-2`}>
                          {ejecucion.observaciones}
                        </p>
                        <div className="flex items-center justify-between">
                          <span
                            className={`text-xs font-semibold ${tema.colores.texto}`}
                          >
                            Por: {ejecucion.tecnico_ejecutor}
                          </span>
                          <span
                            className={`text-xs ${tema.colores.textoSecundario}`}
                          >
                            Duración: {formatearTiempo(ejecucion.duracion_real)}
                          </span>
                        </div>
                        {ejecucion.calificacion && (
                          <div className="mt-2 flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-3 h-3 ${
                                  i < ejecucion.calificacion!
                                    ? "text-yellow-500 fill-yellow-500"
                                    : "text-gray-400"
                                }`}
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

            {/* Notas técnicas */}
            {mantenimientoSeleccionado.notas_tecnicas && (
              <div>
                <h4 className={`text-lg font-black mb-3 ${tema.colores.texto}`}>
                  📝 Notas Técnicas
                </h4>
                <div
                  className={`p-4 rounded-xl ${tema.colores.secundario} border ${tema.colores.borde}`}
                >
                  <p className={`text-sm ${tema.colores.texto} leading-relaxed`}>
                    {mantenimientoSeleccionado.notas_tecnicas}
                  </p>
                </div>
              </div>
            )}

            {/* Recordatorios */}
            {mantenimientoSeleccionado.recordatorios_configurados &&
              mantenimientoSeleccionado.recordatorios_configurados.length > 0 && (
                <div>
                  <h4 className={`text-lg font-black mb-3 ${tema.colores.texto} flex items-center gap-2`}>
                    <BellRing className="w-5 h-5" />
                    Recordatorios Configurados
                  </h4>
                  <div className="space-y-2">
                    {mantenimientoSeleccionado.recordatorios_configurados.map((recordatorio) => (
                      <div
                        key={recordatorio.id_recordatorio}
                        className={`p-3 rounded-xl ${tema.colores.secundario} border ${tema.colores.borde} flex items-center justify-between`}
                      >
                        <div className="flex items-center gap-2">
                          {recordatorio.tipo === "email" && <Mail className="w-4 h-4 text-blue-400" />}
                          {recordatorio.tipo === "sms" && <MessageSquare className="w-4 h-4 text-green-400" />}
                          {recordatorio.tipo === "push" && <Bell className="w-4 h-4 text-purple-400" />}
                          {recordatorio.tipo === "sistema" && <Monitor className="w-4 h-4 text-cyan-400" />}
                          <span className={`text-sm font-semibold ${tema.colores.texto}`}>
                            {recordatorio.dias_antes} días antes • {recordatorio.tipo}
                          </span>
                        </div>
                        {recordatorio.enviado ? (
                          <CheckCircle2 className="w-4 h-4 text-green-400" />
                        ) : (
                          <Clock className="w-4 h-4 text-gray-500" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

            {/* Aprobación */}
            {mantenimientoSeleccionado.requiere_aprobacion && (
              <div
                className={`rounded-xl p-4 ${
                  mantenimientoSeleccionado.aprobado
                    ? tema.colores.success
                    : tema.colores.warning
                } border ${tema.colores.borde}`}
              >
                <div className="flex items-start gap-3">
                  {mantenimientoSeleccionado.aprobado ? (
                    <ShieldCheck className="w-5 h-5 flex-shrink-0 mt-0.5 text-green-500" />
                  ) : (
                    <ShieldAlert className="w-5 h-5 flex-shrink-0 mt-0.5 text-yellow-500" />
                  )}
                  <div>
                    <p className={`text-sm font-bold mb-1 ${tema.colores.texto}`}>
                      {mantenimientoSeleccionado.aprobado
                        ? "✅ Mantenimiento Aprobado"
                        : "⏳ Pendiente de Aprobación"}
                    </p>
                                        <p className={`text-xs ${tema.colores.textoSecundario}`}>
                      {mantenimientoSeleccionado.aprobado
                        ? `Aprobado por ${mantenimientoSeleccionado.nombre_aprobador} el ${formatearFecha(
                            mantenimientoSeleccionado.fecha_aprobacion!
                          )}`
                        : "Este mantenimiento requiere aprobación antes de ejecutarse"}
                    </p>
                  </div>
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

              {mantenimientoSeleccionado.estado_programacion === "activo" && (
                <button
                  onClick={() => {
                    pausarMantenimiento(mantenimientoSeleccionado.id_mantenimiento);
                    setPanelDetalleAbierto(false);
                  }}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-yellow-600 hover:bg-yellow-700 text-white rounded-xl font-bold transition-all duration-300 hover:scale-105 shadow-lg"
                >
                  <Pause className="w-5 h-5" />
                  Pausar Mantenimiento
                </button>
              )}

              {mantenimientoSeleccionado.estado_programacion === "pausado" && (
                <button
                  onClick={() => {
                    reanudarMantenimiento(mantenimientoSeleccionado.id_mantenimiento);
                    setPanelDetalleAbierto(false);
                  }}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold transition-all duration-300 hover:scale-105 shadow-lg"
                >
                  <Play className="w-5 h-5" />
                  Reanudar Mantenimiento
                </button>
              )}

              <button
                onClick={() => {
                  duplicarMantenimiento(mantenimientoSeleccionado.id_mantenimiento);
                  setPanelDetalleAbierto(false);
                }}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all duration-300 hover:scale-105 shadow-lg"
              >
                <Copy className="w-5 h-5" />
                Duplicar Mantenimiento
              </button>

              {(mantenimientoSeleccionado.estado_programacion === "activo" ||
                mantenimientoSeleccionado.estado_programacion === "pausado") && (
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
              )}
            </div>

            {/* Acciones secundarias */}
            <div className="grid grid-cols-2 gap-3">
              <button
                className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold transition-all ${tema.colores.secundario} ${tema.colores.texto}`}
              >
                <Edit className="w-4 h-4" />
                Editar
              </button>
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
              <button
                className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold transition-all ${tema.colores.secundario} ${tema.colores.texto}`}
              >
                <BellRing className="w-4 h-4" />
                Recordatorios
              </button>
            </div>

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
                    Este mantenimiento está programado para ejecutarse automáticamente. Asegúrate de tener todos los repuestos necesarios disponibles antes de la fecha programada.
                  </p>
                </div>
              </div>
            </div>

            {/* Última actualización */}
            <div className="text-center">
              <p className={`text-xs ${tema.colores.textoSecundario}`}>
                Última actualización: {formatearFechaCompleta(mantenimientoSeleccionado.updated_at)}
              </p>
              <p className={`text-xs ${tema.colores.textoSecundario}`}>
                Creado: {formatearFechaCompleta(mantenimientoSeleccionado.created_at)}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* MODAL NUEVO MANTENIMIENTO */}
      {mostrarModalNuevo && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div
            className={`w-full max-w-4xl rounded-3xl ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} overflow-hidden animate-fade-in-up max-h-[90vh] overflow-y-auto custom-scrollbar`}
          >
            <div className={`bg-gradient-to-r ${tema.colores.gradiente} p-6`}>
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-black text-white flex items-center gap-2">
                  <CalendarPlus className="w-6 h-6" />
                  Programar Nuevo Mantenimiento
                </h3>
                <button
                  onClick={() => setMostrarModalNuevo(false)}
                  className="p-2 rounded-xl bg-white/20 hover:bg-white/30 text-white transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6">
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
                          className={`p-4 rounded-xl transition-all duration-300 ${tema.colores.secundario} ${tema.colores.borde} border hover:scale-105 group`}
                        >
                          <div className="flex flex-col items-center gap-2">
                            <div className={`w-12 h-12 bg-gradient-to-br from-${tipo.color}-500 to-${tipo.color}-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
                              <Icono className="w-6 h-6 text-white" />
                            </div>
                            <span className="text-sm font-bold">{tipo.label}</span>
                            <span className={`text-xs ${tema.colores.textoSecundario} text-center`}>
                              {tipo.descripcion}
                            </span>
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
                  <div className="relative">
                    <Search className={`absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 ${tema.colores.textoSecundario}`} />
                    <input
                      type="text"
                      placeholder="Buscar equipo por nombre, marca, modelo o serie..."
                      className={`w-full pl-12 pr-4 py-3 rounded-xl ${tema.colores.secundario} ${tema.colores.borde} border ${tema.colores.texto} placeholder:${tema.colores.textoSecundario}`}
                    />
                  </div>
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

                {/* Fecha y hora programada */}
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

                {/* Requiere aprobación */}
                <div className={`p-4 rounded-xl ${tema.colores.secundario} flex items-center justify-between`}>
                  <div className="flex items-center gap-3">
                    <ShieldCheck className="w-5 h-5 text-purple-400" />
                    <div>
                      <p className={`font-bold ${tema.colores.texto}`}>
                        Requiere Aprobación
                      </p>
                      <p className={`text-sm ${tema.colores.textoSecundario}`}>
                        Este mantenimiento necesitará aprobación antes de ejecutarse
                      </p>
                    </div>
                  </div>
                  <button
                    className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors bg-gray-600`}
                  >
                    <span
                      className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform translate-x-1`}
                    />
                  </button>
                </div>

                {/* Días de anticipación para alerta */}
                <div>
                  <label className={`block text-sm font-bold mb-2 ${tema.colores.texto}`}>
                    🔔 Días de Anticipación para Alerta
                  </label>
                  <div className="flex items-center gap-4">
                    <input
                      type="range"
                      min="1"
                      max="30"
                      defaultValue="7"
                      className="flex-1"
                    />
                    <span className={`text-2xl font-black ${tema.colores.texto} min-w-[60px] text-right`}>
                      7 días
                    </span>
                  </div>
                  <p className={`text-xs mt-2 ${tema.colores.textoSecundario}`}>
                    Se enviará una alerta con esta anticipación antes de la fecha programada
                  </p>
                </div>

                {/* Checklist */}
                <div>
                  <label className={`block text-sm font-bold mb-2 ${tema.colores.texto}`}>
                    ✅ Checklist (Opcional)
                  </label>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        placeholder="Agregar item al checklist..."
                        className={`flex-1 px-4 py-3 rounded-xl ${tema.colores.secundario} ${tema.colores.borde} border ${tema.colores.texto} placeholder:${tema.colores.textoSecundario}`}
                      />
                      <button
                        className={`px-4 py-3 rounded-xl font-bold transition-all ${tema.colores.primario} text-white`}
                      >
                        <Plus className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Notas técnicas */}
                <div>
                  <label className={`block text-sm font-bold mb-2 ${tema.colores.texto}`}>
                    📋 Notas Técnicas (Opcional)
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Información adicional, precauciones, recomendaciones..."
                    className={`w-full px-4 py-3 rounded-xl ${tema.colores.secundario} ${tema.colores.borde} border ${tema.colores.texto} placeholder:${tema.colores.textoSecundario} resize-none`}
                  ></textarea>
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
                className={`px-6 py-3 bg-gradient-to-r ${tema.colores.gradiente} text-white rounded-xl font-bold transition-all duration-300 hover:scale-105 shadow-xl`}
              >
                Programar Mantenimiento
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL MANTENIMIENTO RECURRENTE */}
      {mostrarModalRecurrente && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div
            className={`w-full max-w-4xl rounded-3xl ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} overflow-hidden animate-fade-in-up max-h-[90vh] overflow-y-auto custom-scrollbar`}
          >
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-6">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-black text-white flex items-center gap-2">
                  <Repeat className="w-6 h-6" />
                  Programar Mantenimiento Recurrente
                </h3>
                <button
                  onClick={() => setMostrarModalRecurrente(false)}
                  className="p-2 rounded-xl bg-white/20 hover:bg-white/30 text-white transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="space-y-6">
                {/* Información sobre recurrencia */}
                <div
                  className={`rounded-xl p-4 ${tema.colores.info} border ${tema.colores.borde}`}
                >
                  <div className="flex items-start gap-3">
                    <Info className="w-5 h-5 flex-shrink-0 mt-0.5 text-blue-500" />
                    <div>
                      <p className={`text-sm font-bold mb-1 ${tema.colores.texto}`}>
                        💡 Mantenimiento Recurrente
                      </p>
                      <p className={`text-xs ${tema.colores.textoSecundario}`}>
                        Los mantenimientos recurrentes se programarán automáticamente según la frecuencia seleccionada. El sistema creará nuevas órdenes de trabajo de forma automática.
                      </p>
                    </div>
                  </div>
                </div>

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
                          className={`p-4 rounded-xl transition-all duration-300 ${tema.colores.secundario} ${tema.colores.borde} border hover:scale-105 group`}
                        >
                          <div className="flex flex-col items-center gap-2">
                            <div className={`w-12 h-12 bg-gradient-to-br from-${tipo.color}-500 to-${tipo.color}-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
                              <Icono className="w-6 h-6 text-white" />
                            </div>
                            <span className="text-sm font-bold">{tipo.label}</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Frecuencia */}
                <div>
                  <label className={`block text-sm font-bold mb-3 ${tema.colores.texto}`}>
                    🔄 Frecuencia de Recurrencia
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {FRECUENCIAS.filter((f) => f.value !== "unica").map((frecuencia) => {
                      const Icono = frecuencia.icon;
                      return (
                        <button
                          key={frecuencia.value}
                          className={`p-4 rounded-xl transition-all duration-300 ${tema.colores.secundario} ${tema.colores.borde} border hover:scale-105 group`}
                        >
                          <div className="flex flex-col items-center gap-2">
                            <Icono className="w-6 h-6 text-purple-400 group-hover:scale-110 transition-transform" />
                            <span className="text-sm font-bold">{frecuencia.label}</span>
                            <span className={`text-xs ${tema.colores.textoSecundario}`}>
                              Cada {frecuencia.dias} días
                            </span>
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
                  <div className="relative">
                    <Search className={`absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 ${tema.colores.textoSecundario}`} />
                    <input
                      type="text"
                      placeholder="Buscar equipo..."
                      className={`w-full pl-12 pr-4 py-3 rounded-xl ${tema.colores.secundario} ${tema.colores.borde} border ${tema.colores.texto} placeholder:${tema.colores.textoSecundario}`}
                    />
                  </div>
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

                {/* Fecha de inicio */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-bold mb-2 ${tema.colores.texto}`}>
                      📅 Fecha de Inicio
                    </label>
                    <input
                      type="date"
                      className={`w-full px-4 py-3 rounded-xl ${tema.colores.secundario} ${tema.colores.borde} border ${tema.colores.texto}`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-bold mb-2 ${tema.colores.texto}`}>
                      ⏰ Hora Preferida
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
                    <option value="auto">Asignación automática</option>
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

                {/* Días de anticipación para recordatorios */}
                <div>
                  <label className={`block text-sm font-bold mb-2 ${tema.colores.texto}`}>
                    🔔 Configurar Recordatorios
                  </label>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <input type="checkbox" className="w-5 h-5 rounded" defaultChecked />
                      <span className={`text-sm font-semibold ${tema.colores.texto}`}>
                        7 días antes (Email)
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <input type="checkbox" className="w-5 h-5 rounded" defaultChecked />
                      <span className={`text-sm font-semibold ${tema.colores.texto}`}>
                        3 días antes (Push)
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <input type="checkbox" className="w-5 h-5 rounded" defaultChecked />
                      <span className={`text-sm font-semibold ${tema.colores.texto}`}>
                        1 día antes (SMS)
                      </span>
                    </div>
                  </div>
                </div>

                {/* Opciones avanzadas */}
                <div className={`p-4 rounded-xl ${tema.colores.secundario} space-y-3`}>
                  <h5 className={`text-sm font-bold ${tema.colores.texto}`}>
                    ⚙️ Opciones Avanzadas
                  </h5>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className={`font-bold ${tema.colores.texto}`}>
                        Requiere Aprobación
                      </p>
                      <p className={`text-sm ${tema.colores.textoSecundario}`}>
                        Cada mantenimiento necesitará aprobación
                      </p>
                    </div>
                    <button
                      className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors bg-gray-600`}
                    >
                      <span
                        className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform translate-x-1`}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className={`font-bold ${tema.colores.texto}`}>
                        Crear Checklist Automático
                      </p>
                      <p className={`text-sm ${tema.colores.textoSecundario}`}>
                        Usar plantilla de checklist predefinida
                      </p>
                    </div>
                    <button
                      className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors bg-green-600`}
                    >
                      <span
                        className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform translate-x-7`}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className={`font-bold ${tema.colores.texto}`}>
                        Notificar a Supervisor
                      </p>
                      <p className={`text-sm ${tema.colores.textoSecundario}`}>
                        Enviar copia de notificaciones al supervisor
                      </p>
                    </div>
                    <button
                      className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors bg-gray-600`}
                    >
                      <span
                        className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform translate-x-1`}
                      />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-700/50 flex items-center justify-end gap-3">
              <button
                onClick={() => setMostrarModalRecurrente(false)}
                className={`px-6 py-3 rounded-xl font-bold transition-all ${tema.colores.secundario} ${tema.colores.texto}`}
              >
                Cancelar
              </button>
              <button
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-xl font-bold transition-all duration-300 hover:scale-105 shadow-xl"
              >
                <Repeat className="w-5 h-5 inline mr-2" />
                Crear Mantenimiento Recurrente
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

        /* Efectos de hover premium */
        .hover-lift {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .hover-lift:hover {
          transform: translateY(-4px) scale(1.02);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
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

        /* Responsive */
        @media (max-width: 768px) {
          .hidden\\.md\\:block {
            display: none;
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
          background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
          border-color: #6366f1;
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

        /* Range input personalizado */
        input[type="range"] {
          -webkit-appearance: none;
          appearance: none;
          width: 100%;
          height: 8px;
          border-radius: 5px;
          background: linear-gradient(
            to right,
            #6366f1 0%,
            #6366f1 50%,
            #374151 50%,
            #374151 100%
          );
          outline: none;
          opacity: 0.9;
          transition: opacity 0.2s;
        }

        input[type="range"]:hover {
          opacity: 1;
        }

        input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
          cursor: pointer;
          box-shadow: 0 4px 12px rgba(99, 102, 241, 0.4);
          transition: all 0.3s ease;
        }

        input[type="range"]::-webkit-slider-thumb:hover {
          transform: scale(1.2);
          box-shadow: 0 6px 16px rgba(99, 102, 241, 0.6);
        }
      `}</style>
    </div>
  );
}                         
