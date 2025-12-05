// src/app/(dashboard)/tecnico/mantenimiento/historial/page.tsx
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
  BookOpen,
  Box,
  Calendar,
  CalendarCheck,
  CalendarClock,
  CalendarDays,
  Camera,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Circle,
  Clock,
  ClipboardCheck,
  Cloud,
  Code,
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
  FileWarning,
  Filter,
  Flame,
  Globe,
  HardDrive,
  Hash,
  Heart,
  HeartPulse,
  History,
  Home,
  Image as ImageIcon,
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
  Paperclip,
  PieChart,
  Play,
  Plus,
  Power,
  PowerOff,
  Printer,
  Radio,
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
  Tag,
  Target,
  Terminal,
  TestTube,
  Thermometer,
  Timer,
  Tool,
  Trash2,
  TrendingDown,
  TrendingUp,
  Triangle,
  Trophy,
  Upload,
  User,
  UserCheck,
  Users,
  Video,
  Wifi,
  WifiOff,
  Wrench,
  X,
  XCircle,
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
  mantenimientos_totales: number;
  mantenimientos_completados: number;
  mantenimientos_mes: number;
}

interface RegistroHistorial {
  id_mantenimiento: number;
  codigo_orden: string;
  tipo_mantenimiento: "preventivo" | "correctivo" | "predictivo" | "calibracion" | "inspeccion";
  tipo_falla?: "mecanica" | "electrica" | "electronica" | "software" | "hidraulica" | "neumatica" | "estructural" | "otro";
  prioridad: "baja" | "media" | "alta" | "urgente" | "emergencia" | "critica";
  severidad?: "menor" | "moderada" | "grave" | "critica";
  estado: "completado" | "cancelado";
  fecha_inicio: string;
  fecha_fin: string;
  duracion_real: number; // minutos
  tiempo_respuesta?: number; // minutos
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
    criticidad: "baja" | "media" | "alta" | "critica";
    foto_url: string | null;
  };
  descripcion: string;
  diagnostico?: string | null;
  solucion_aplicada: string | null;
  causa_raiz?: string | null;
  acciones_realizadas: AccionHistorial[];
  repuestos_utilizados: RepuestoHistorial[];
  pruebas_realizadas: PruebaHistorial[];
  fotos: FotoHistorial[];
  documentos: DocumentoHistorial[];
  costo_mano_obra: number;
  costo_repuestos: number;
  costo_total: number;
  observaciones: string | null;
  calificacion_usuario: number | null;
  comentarios_usuario: string | null;
  aprobado_por_supervisor: boolean;
  supervisor_nombre: string | null;
  fecha_aprobacion: string | null;
  garantia_trabajo: number; // días
  requiere_seguimiento: boolean;
  fecha_seguimiento: string | null;
  seguimiento_completado: boolean;
  resultado: "exitoso" | "parcial" | "fallido";
  motivo_cancelacion?: string | null;
  impacto_operacional?: "ninguno" | "bajo" | "medio" | "alto" | "critico";
  created_at: string;
  updated_at: string;
}

interface AccionHistorial {
  id_accion: number;
  descripcion: string;
  fecha_hora: string;
  duracion_minutos: number;
  tecnico: string;
  resultado: "exitoso" | "parcial" | "fallido";
}

interface RepuestoHistorial {
  id_repuesto: number;
  nombre: string;
  codigo: string;
  cantidad: number;
  costo_unitario: number;
  costo_total: number;
  proveedor: string | null;
}

interface PruebaHistorial {
  id_prueba: number;
  tipo_prueba: string;
  descripcion: string;
  resultado: "aprobado" | "fallido" | "parcial";
  fecha_hora: string;
}

interface FotoHistorial {
  id_foto: number;
  url: string;
  descripcion: string | null;
  fecha_captura: string;
  tipo: "antes" | "durante" | "despues";
}

interface DocumentoHistorial {
  id_documento: number;
  tipo: "manual" | "diagrama" | "reporte" | "factura" | "orden_compra" | "certificado" | "otro";
  nombre: string;
  url: string;
  tamaño_kb: number;
}

interface FiltrosHistorial {
  tipo_mantenimiento: string[];
  tipo_falla: string[];
  prioridad: string[];
  resultado: string[];
  ubicacion: string;
  equipoNombre: string;
  fechaDesde: string;
  fechaHasta: string;
  tecnicoAsignado: string;
  soloAprobados: boolean;
  soloConSeguimiento: boolean;
  soloMisTrabjos: boolean;
  rangoCalificacion: [number, number];
  rangoCosto: [number, number];
  ordenarPor: "fecha_fin" | "duracion" | "costo" | "calificacion";
  ordenDireccion: "asc" | "desc";
}

interface VistaHistorial {
  modo: "lista" | "tarjetas" | "tabla" | "timeline" | "estadisticas";
  densidad: "compacta" | "normal" | "espaciosa";
  agruparPor: "ninguno" | "mes" | "tipo" | "equipo" | "tecnico" | "resultado";
  mostrarFotos: boolean;
  mostrarCostos: boolean;
  mostrarCalificaciones: boolean;
}

interface EstadisticasHistorial {
  total: number;
  completados: number;
  cancelados: number;
  exitosos: number;
  parciales: number;
  fallidos: number;
  tiempo_promedio: number;
  costo_promedio: number;
  costo_total: number;
  calificacion_promedio: number;
  tasa_exito: number;
  porTipo: { [key: string]: number };
  porMes: { mes: string; cantidad: number; costo: number }[];
  equiposMasMantenimiento: { equipo: string; cantidad: number }[];
  tecnicosMasProductivos: { tecnico: string; cantidad: number; calificacion: number }[];
  tendenciaCalidad: { mes: string; calificacion: number; tasa_exito: number }[];
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
      fondo: "from-slate-50 via-purple-50 to-indigo-50",
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
      fondo: "from-slate-950 via-purple-950 to-indigo-950",
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

const RESULTADOS = [
  { value: "exitoso", label: "Exitoso", icon: CheckCircle2, color: "green" },
  { value: "parcial", label: "Parcial", icon: AlertCircle, color: "yellow" },
  { value: "fallido", label: "Fallido", icon: XCircle, color: "red" },
];

// ========================================
// 🎯 COMPONENTE PRINCIPAL
// ========================================

export default function HistorialMantenimientoPage() {
  // 📊 ESTADOS PRINCIPALES
  const [usuario, setUsuario] = useState<UsuarioSesion | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingHistorial, setLoadingHistorial] = useState(true);
  const [historial, setHistorial] = useState<RegistroHistorial[]>([]);
  const [estadisticas, setEstadisticas] = useState<EstadisticasTecnico | null>(null);
  const [estadisticasHistorial, setEstadisticasHistorial] = useState<EstadisticasHistorial | null>(null);
  const [registroSeleccionado, setRegistroSeleccionado] = useState<RegistroHistorial | null>(null);
  
  // 🎨 ESTADOS DE UI
  const [temaActual, setTemaActual] = useState<TemaColor>("dark");
  const [sidebarAbierto, setSidebarAbierto] = useState(true);
  const [perfilAbierto, setPerfilAbierto] = useState(false);
  const [panelDetalleAbierto, setPanelDetalleAbierto] = useState(false);
  const [busqueda, setBusqueda] = useState("");
  const [disponibilidad, setDisponibilidad] = useState<"disponible" | "ocupado" | "fuera_servicio">("disponible");
  
  // 🔍 ESTADOS DE FILTROS Y VISTA
  const [filtros, setFiltros] = useState<FiltrosHistorial>({
    tipo_mantenimiento: [],
    tipo_falla: [],
    prioridad: [],
    resultado: [],
    ubicacion: "",
    equipoNombre: "",
    fechaDesde: "",
    fechaHasta: "",
    tecnicoAsignado: "",
    soloAprobados: false,
    soloConSeguimiento: false,
    soloMisTrabjos: false,
    rangoCalificacion: [0, 5],
    rangoCosto: [0, 1000000],
    ordenarPor: "fecha_fin",
    ordenDireccion: "desc",
  });

  const [vista, setVista] = useState<VistaHistorial>({
    modo: "tarjetas",
    densidad: "normal",
    agruparPor: "mes",
    mostrarFotos: true,
    mostrarCostos: true,
    mostrarCalificaciones: true,
  });

  // 📈 ESTADOS DE ACCIONES
  const [registrosSeleccionados, setRegistrosSeleccionados] = useState<number[]>([]);
  const [modoSeleccionMultiple, setModoSeleccionMultiple] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [intervaloRefresh, setIntervaloRefresh] = useState(300000); // 5 minutos
  const [mostrarFiltrosAvanzados, setMostrarFiltrosAvanzados] = useState(false);
  const [mostrarModalComparar, setMostrarModalComparar] = useState(false);
  const [mostrarModalReporte, setMostrarModalReporte] = useState(false);

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
      cargarHistorial();
      cargarEstadisticas();
      cargarEstadisticasHistorial();
    }
  }, [usuario]);

  useEffect(() => {
    if (!autoRefresh || !usuario?.tecnico) return;

    const interval = setInterval(() => {
      cargarHistorial();
      cargarEstadisticas();
      cargarEstadisticasHistorial();
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

    const vistaGuardada = localStorage.getItem("vista_historial");
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

  const cargarHistorial = async () => {
    if (!usuario?.tecnico?.id_tecnico) return;

    try {
      setLoadingHistorial(true);

      const res = await fetch(
        `/api/tecnico/mantenimiento/historial?id_tecnico=${usuario.tecnico.id_tecnico}`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        }
      );

      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data.success) {
        console.error("Error al cargar historial:", data);
        return;
      }

      setHistorial(data.historial || []);
    } catch (error) {
      console.error("Error al cargar historial:", error);
      mostrarNotificacion("error", "Error", "No se pudo cargar el historial");
    } finally {
      setLoadingHistorial(false);
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

  const cargarEstadisticasHistorial = async () => {
    if (!usuario?.tecnico?.id_tecnico) return;

    try {
      const res = await fetch(
        `/api/tecnico/mantenimiento/historial/estadisticas?id_tecnico=${usuario.tecnico.id_tecnico}`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        }
      );

      const data = await res.json().catch(() => ({}));

      if (res.ok && data.success) {
        setEstadisticasHistorial(data.estadisticas);
      }
    } catch (error) {
      console.error("Error al cargar estadísticas historial:", error);
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

  const exportarHistorial = async (formato: "csv" | "excel" | "pdf") => {
    try {
      mostrarNotificacion("info", "Exportando", `Generando archivo ${formato.toUpperCase()}...`);

      const res = await fetch(
        `/api/tecnico/mantenimiento/historial/exportar?formato=${formato}&id_tecnico=${usuario?.tecnico?.id_tecnico}`,
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
      a.download = `historial_mantenimiento_${new Date().toISOString().split("T")[0]}.${formato}`;
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

  const cambiarVista = (nuevaVista: Partial<VistaHistorial>) => {
    const vistaActualizada = { ...vista, ...nuevaVista };
    setVista(vistaActualizada);

    if (typeof window !== "undefined") {
      localStorage.setItem("vista_historial", JSON.stringify(vistaActualizada));
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
      year: "numeric",
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

  const obtenerColorResultado = (resultado: string) => {
    const colores: { [key: string]: string } = {
      exitoso: "bg-green-500/20 text-green-300 border-green-500/40",
      parcial: "bg-yellow-500/20 text-yellow-300 border-yellow-500/40",
      fallido: "bg-red-500/20 text-red-300 border-red-500/40",
    };

    return colores[resultado] || "bg-gray-500/20 text-gray-300 border-gray-500/40";
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

  const toggleSeleccionRegistro = (idMantenimiento: number) => {
    setRegistrosSeleccionados((prev) =>
      prev.includes(idMantenimiento)
        ? prev.filter((id) => id !== idMantenimiento)
        : [...prev, idMantenimiento]
    );
  };

  const seleccionarTodos = () => {
    if (registrosSeleccionados.length === historialFiltrado.length) {
      setRegistrosSeleccionados([]);
    } else {
      setRegistrosSeleccionados(historialFiltrado.map((r) => r.id_mantenimiento));
    }
  };

  // ========================================
  // 📊 DATOS DERIVADOS Y CÁLCULOS
  // ========================================

  const historialFiltrado = useMemo(() => {
    let data = [...historial];

    // Filtro por tipo de mantenimiento
    if (filtros.tipo_mantenimiento.length > 0) {
      data = data.filter((r) => filtros.tipo_mantenimiento.includes(r.tipo_mantenimiento));
    }

    // Filtro por resultado
    if (filtros.resultado.length > 0) {
      data = data.filter((r) => filtros.resultado.includes(r.resultado));
    }

    // Filtro por ubicación
    if (filtros.ubicacion) {
      data = data.filter((r) =>
        r.equipo.ubicacion.toLowerCase().includes(filtros.ubicacion.toLowerCase())
      );
    }

    // Filtro por equipo
    if (filtros.equipoNombre) {
      data = data.filter((r) =>
        r.equipo.nombre.toLowerCase().includes(filtros.equipoNombre.toLowerCase())
      );
    }

    // Filtro por fechas
    if (filtros.fechaDesde) {
      const desde = new Date(filtros.fechaDesde).getTime();
      data = data.filter((r) => new Date(r.fecha_fin).getTime() >= desde);
    }

    if (filtros.fechaHasta) {
      const hasta = new Date(filtros.fechaHasta).getTime();
      data = data.filter((r) => new Date(r.fecha_fin).getTime() <= hasta);
    }

    // Solo aprobados
    if (filtros.soloAprobados) {
      data = data.filter((r) => r.aprobado_por_supervisor);
    }

    // Solo con seguimiento
    if (filtros.soloConSeguimiento) {
      data = data.filter((r) => r.requiere_seguimiento);
    }

    // Solo mis trabajos
    if (filtros.soloMisTrabjos) {
      data = data.filter((r) => r.tecnico_asignado === usuario?.tecnico?.id_tecnico);
    }

    // Rango de calificación
    data = data.filter(
      (r) =>
        r.calificacion_usuario === null ||
        (r.calificacion_usuario >= filtros.rangoCalificacion[0] &&
          r.calificacion_usuario <= filtros.rangoCalificacion[1])
    );

    // Rango de costo
    data = data.filter(
      (r) =>
        r.costo_total >= filtros.rangoCosto[0] && r.costo_total <= filtros.rangoCosto[1]
    );

    // Búsqueda
    if (busqueda.trim()) {
      const q = busqueda.toLowerCase();
      data = data.filter(
        (r) =>
          r.descripcion.toLowerCase().includes(q) ||
          r.equipo.nombre.toLowerCase().includes(q) ||
          r.equipo.marca.toLowerCase().includes(q) ||
          r.equipo.modelo.toLowerCase().includes(q) ||
          r.equipo.ubicacion.toLowerCase().includes(q) ||
          r.nombre_tecnico.toLowerCase().includes(q) ||
          r.codigo_orden.toLowerCase().includes(q)
      );
    }

    // Ordenar
    data.sort((a, b) => {
      let comparacion = 0;

      switch (filtros.ordenarPor) {
        case "fecha_fin":
          comparacion =
            new Date(a.fecha_fin).getTime() - new Date(b.fecha_fin).getTime();
          break;
        case "duracion":
          comparacion = a.duracion_real - b.duracion_real;
          break;
        case "costo":
          comparacion = a.costo_total - b.costo_total;
          break;
        case "calificacion":
          comparacion =
            (b.calificacion_usuario || 0) - (a.calificacion_usuario || 0);
          break;
      }

      return filtros.ordenDireccion === "asc" ? comparacion : -comparacion;
    });

    return data;
  }, [historial, filtros, busqueda, usuario]);

  const historialAgrupado = useMemo(() => {
    if (vista.agruparPor === "ninguno") {
      return { "Todos los registros": historialFiltrado };
    }

    const grupos: { [key: string]: RegistroHistorial[] } = {};

    historialFiltrado.forEach((registro) => {
      let clave = "";

      switch (vista.agruparPor) {
        case "mes":
          const fecha = new Date(registro.fecha_fin);
          clave = `${fecha.toLocaleString("es-CL", { month: "long", year: "numeric" })}`;
          break;
        case "tipo":
          clave = TIPOS_MANTENIMIENTO.find((t) => t.value === registro.tipo_mantenimiento)?.label || registro.tipo_mantenimiento;
          break;
        case "equipo":
          clave = registro.equipo.nombre;
          break;
        case "tecnico":
          clave = registro.nombre_tecnico;
          break;
        case "resultado":
          clave = RESULTADOS.find((r) => r.value === registro.resultado)?.label || registro.resultado;
          break;
      }

      if (!grupos[clave]) {
        grupos[clave] = [];
      }
      grupos[clave].push(registro);
    });

    return grupos;
  }, [historialFiltrado, vista.agruparPor]);

  const resumenHistorial = useMemo(() => {
    const total = historial.length;
    const completados = historial.filter((r) => r.estado === "completado").length;
    const cancelados = historial.filter((r) => r.estado === "cancelado").length;
    const exitosos = historial.filter((r) => r.resultado === "exitoso").length;
    const parciales = historial.filter((r) => r.resultado === "parcial").length;
    const fallidos = historial.filter((r) => r.resultado === "fallido").length;

    const tiempos = historial.map((r) => r.duracion_real);
    const tiempoPromedio =
      tiempos.length > 0 ? tiempos.reduce((sum, t) => sum + t, 0) / tiempos.length : 0;

    const costos = historial.map((r) => r.costo_total);
    const costoPromedio =
      costos.length > 0 ? costos.reduce((sum, c) => sum + c, 0) / costos.length : 0;
    const costoTotal = costos.reduce((sum, c) => sum + c, 0);

    const calificaciones = historial
      .filter((r) => r.calificacion_usuario !== null)
      .map((r) => r.calificacion_usuario!);
    const calificacionPromedio =
      calificaciones.length > 0
        ? calificaciones.reduce((sum, c) => sum + c, 0) / calificaciones.length
        : 0;

    const tasaExito = total > 0 ? (exitosos / total) * 100 : 0;

    return {
      total,
      completados,
      cancelados,
      exitosos,
      parciales,
      fallidos,
      tiempoPromedio,
      costoPromedio,
      costoTotal,
      calificacionPromedio,
      tasaExito,
      porTipo: {
        preventivo: historial.filter((r) => r.tipo_mantenimiento === "preventivo").length,
        correctivo: historial.filter((r) => r.tipo_mantenimiento === "correctivo").length,
        predictivo: historial.filter((r) => r.tipo_mantenimiento === "predictivo").length,
        calibracion: historial.filter((r) => r.tipo_mantenimiento === "calibracion").length,
        inspeccion: historial.filter((r) => r.tipo_mantenimiento === "inspeccion").length,
      },
    };
  }, [historial]);

  const datosPorTipo = useMemo(
    () => [
      { nombre: "Preventivo", valor: resumenHistorial.porTipo.preventivo, color: "#3b82f6" },
      { nombre: "Correctivo", valor: resumenHistorial.porTipo.correctivo, color: "#f97316" },
      { nombre: "Predictivo", valor: resumenHistorial.porTipo.predictivo, color: "#a855f7" },
      { nombre: "Calibración", valor: resumenHistorial.porTipo.calibracion, color: "#22c55e" },
      { nombre: "Inspección", valor: resumenHistorial.porTipo.inspeccion, color: "#06b6d4" },
    ],
    [resumenHistorial]
  );

  const datosPorResultado = useMemo(
    () => [
      { nombre: "Exitoso", valor: resumenHistorial.exitosos, color: "#22c55e" },
      { nombre: "Parcial", valor: resumenHistorial.parciales, color: "#eab308" },
      { nombre: "Fallido", valor: resumenHistorial.fallidos, color: "#ef4444" },
    ],
    [resumenHistorial]
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
              <History className="w-10 h-10 text-white" />
            </div>
          </div>
          <h2 className={`text-4xl font-black mb-4 ${tema.colores.texto}`}>
            Cargando Historial de Mantenimiento
          </h2>
          <p
            className={`text-lg font-semibold ${tema.colores.textoSecundario} animate-pulse`}
          >
            Recuperando registros históricos...
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
            No tienes permisos para acceder al historial de mantenimiento.
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
                Historial
              </span>
            </div>

            <div className="relative">
              <Search
                className={`absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 ${tema.colores.textoSecundario}`}
              />
              <input
                type="text"
                placeholder="Buscar en historial por código, equipo, descripción..."
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
                <span className="animate-pulse inline-block">📜</span>
              </h2>
              <p className={`text-xl font-semibold ${tema.colores.textoSecundario}`}>
                Historial Completo de Mantenimientos y Análisis de Desempeño
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
                  onClick={() => cargarHistorial()}
                  disabled={loadingHistorial}
                  className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all duration-300 ${tema.colores.secundario} ${tema.colores.texto} hover:scale-105`}
                >
                  <RefreshCw
                    className={`w-5 h-5 ${loadingHistorial ? "animate-spin" : ""}`}
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
                      onClick={() => exportarHistorial("csv")}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all ${tema.colores.hover} ${tema.colores.texto}`}
                    >
                      <FileText className="w-4 h-4" />
                      Exportar CSV
                    </button>
                    <button
                      onClick={() => exportarHistorial("excel")}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all ${tema.colores.hover} ${tema.colores.texto}`}
                    >
                      <FileText className="w-4 h-4" />
                      Exportar Excel
                    </button>
                    <button
                      onClick={() => exportarHistorial("pdf")}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all ${tema.colores.hover} ${tema.colores.texto}`}
                    >
                      <FileDown className="w-4 h-4" />
                      Exportar PDF
                    </button>
                  </div>
                </div>

                <button
                  onClick={() => setMostrarModalReporte(true)}
                  className={`flex items-center gap-2 px-6 py-3 bg-gradient-to-r ${tema.colores.gradiente} text-white rounded-xl font-bold transition-all duration-300 hover:scale-105 shadow-xl`}
                >
                  <BarChart3 className="w-5 h-5" />
                  Generar Reporte
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Tarjetas de resumen */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6 mb-8">
          {/* Total Registros */}
          <div
            className={`rounded-2xl p-6 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} transition-all duration-300 hover:scale-105 hover:-translate-y-1 cursor-pointer group`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 bg-gradient-to-br ${tema.colores.gradiente} rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                <History className="w-6 h-6 text-white" />
              </div>
              <Activity className="w-5 h-5 text-indigo-400" />
            </div>
            <div className={`text-4xl font-black mb-1 ${tema.colores.texto}`}>
              {resumenHistorial.total}
            </div>
            <div
              className={`text-xs font-bold uppercase tracking-wider ${tema.colores.textoSecundario}`}
            >
              Total Registros
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
              {resumenHistorial.completados}
            </div>
            <div
              className={`text-xs font-bold uppercase tracking-wider ${tema.colores.textoSecundario}`}
            >
              Completados
            </div>
          </div>

          {/* Exitosos */}
          <div
            onClick={() => setFiltros({ ...filtros, resultado: ["exitoso"] })}
            className={`rounded-2xl p-6 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} transition-all duration-300 hover:scale-105 hover:-translate-y-1 cursor-pointer group`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <Target className="w-6 h-6 text-white" />
              </div>
              <TrendingUp className="w-5 h-5 text-blue-400" />
            </div>
            <div className={`text-4xl font-black mb-1 ${tema.colores.texto}`}>
              {resumenHistorial.exitosos}
            </div>
            <div
              className={`text-xs font-bold uppercase tracking-wider ${tema.colores.textoSecundario}`}
            >
              Exitosos
            </div>
          </div>

          {/* Tiempo Promedio */}
          <div
            className={`rounded-2xl p-6 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} transition-all duration-300 hover:scale-105 hover:-translate-y-1 cursor-pointer group`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-amber-500 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <Timer className="w-6 h-6 text-white" />
              </div>
              <Clock className="w-5 h-5 text-orange-400" />
            </div>
            <div className={`text-4xl font-black mb-1 ${tema.colores.texto}`}>
              {formatearTiempo(Math.round(resumenHistorial.tiempoPromedio))}
            </div>
            <div
              className={`text-xs font-bold uppercase tracking-wider ${tema.colores.textoSecundario}`}
            >
              Tiempo Promedio
            </div>
          </div>

          {/* Costo Total */}
          <div
            className={`rounded-2xl p-6 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} transition-all duration-300 hover:scale-105 hover:-translate-y-1 cursor-pointer group`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-fuchsia-500 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <Award className="w-5 h-5 text-purple-400" />
            </div>
            <div className={`text-3xl font-black mb-1 ${tema.colores.texto}`}>
              ${(resumenHistorial.costoTotal / 1000).toFixed(0)}K
            </div>
            <div
              className={`text-xs font-bold uppercase tracking-wider ${tema.colores.textoSecundario}`}
            >
              Costo Total
            </div>
          </div>

          {/* Calificación Promedio */}
          <div
            className={`rounded-2xl p-6 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} transition-all duration-300 hover:scale-105 hover:-translate-y-1 cursor-pointer group`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-amber-500 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <Star className="w-6 h-6 text-white fill-white" />
              </div>
              <Heart className="w-5 h-5 text-yellow-400" />
            </div>
            <div className={`text-4xl font-black mb-1 ${tema.colores.texto}`}>
              {resumenHistorial.calificacionPromedio.toFixed(1)}
            </div>
            <div
              className={`text-xs font-bold uppercase tracking-wider ${tema.colores.textoSecundario}`}
            >
              Calificación
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
                className={`w-12 h-12 bg-gradient-to-br ${tema.colores.gradiente} rounded-xl flex items-center justify-center shadow-lg`}
              >
                <PieChart className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className={`text-lg font-black ${tema.colores.texto}`}>
                  Por Tipo de Mantenimiento
                </h3>
                <p className={`text-xs font-semibold ${tema.colores.textoSecundario}`}>
                  Distribución
                </p>
              </div>
            </div>

            <ResponsiveContainer width="100%" height={250}>
              <RechartsPieChart>
                <Pie
                  data={datosPorTipo.filter((d) => d.valor > 0)}
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

          {/* Gráfico por resultado */}
          <div
            className={`rounded-2xl p-6 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra}`}
          >
            <div className="flex items-center gap-3 mb-6">
              <div
                className={`w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg`}
              >
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className={`text-lg font-black ${tema.colores.texto}`}>
                  Por Resultado
                </h3>
                <p className={`text-xs font-semibold ${tema.colores.textoSecundario}`}>
                  Efectividad
                </p>
              </div>
            </div>

            <ResponsiveContainer width="100%" height={250}>
              <RechartsBarChart data={datosPorResultado}>
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
                    border: "1px solid rgba(99,102,241,0.3)",
                    borderRadius: "12px",
                    padding: "12px",
                  }}
                />
                <Bar dataKey="valor" radius={[8, 8, 0, 0]}>
                  {datosPorResultado.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </RechartsBarChart>
            </ResponsiveContainer>
          </div>

          {/* Tasa de éxito */}
          <div
            className={`rounded-2xl p-6 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra}`}
          >
            <div className="flex items-center gap-3 mb-6">
              <div
                className={`w-12 h-12 bg-gradient-to-br from-purple-500 to-fuchsia-500 rounded-xl flex items-center justify-center shadow-lg`}
              >
                <Target className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className={`text-lg font-black ${tema.colores.texto}`}>
                  Tasa de Éxito
                </h3>
                <p className={`text-xs font-semibold ${tema.colores.textoSecundario}`}>
                  Rendimiento
                </p>
              </div>
            </div>

            <div className="flex items-center justify-center h-[250px]">
              <div className="relative w-48 h-48">
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="96"
                    cy="96"
                    r="80"
                    stroke="currentColor"
                    strokeWidth="16"
                    fill="none"
                    className="text-gray-700"
                  />
                  <circle
                    cx="96"
                    cy="96"
                    r="80"
                    stroke="url(#gradient)"
                    strokeWidth="16"
                    fill="none"
                    strokeDasharray={`${(resumenHistorial.tasaExito / 100) * 502.4} 502.4`}
                    className="transition-all duration-1000"
                  />
                  <defs>
                    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#22c55e" />
                      <stop offset="100%" stopColor="#10b981" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className={`text-5xl font-black ${tema.colores.texto}`}>
                    {resumenHistorial.tasaExito.toFixed(0)}%
                  </span>
                  <span className={`text-sm font-semibold ${tema.colores.textoSecundario}`}>
                    Éxito
                  </span>
                </div>
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
                      ? `bg-gradient-to-r ${tema.colores.gradiente} text-white`
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
                      ? `bg-gradient-to-r ${tema.colores.gradiente} text-white`
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
                      ? `bg-gradient-to-r ${tema.colores.gradiente} text-white`
                      : `${tema.colores.hover} ${tema.colores.texto}`
                  }`}
                  title="Vista de tabla"
                >
                  <BarChart3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => cambiarVista({ modo: "timeline" })}
                  className={`p-2 rounded-lg transition-all ${
                    vista.modo === "timeline"
                      ? `bg-gradient-to-r ${tema.colores.gradiente} text-white`
                      : `${tema.colores.hover} ${tema.colores.texto}`
                  }`}
                  title="Vista timeline"
                >
                  <History className="w-4 h-4" />
                </button>
                <button
                  onClick={() => cambiarVista({ modo: "estadisticas" })}
                  className={`p-2 rounded-lg transition-all ${
                    vista.modo === "estadisticas"
                      ? `bg-gradient-to-r ${tema.colores.gradiente} text-white`
                      : `${tema.colores.hover} ${tema.colores.texto}`
                  }`}
                  title="Vista estadísticas"
                >
                  <PieChart className="w-4 h-4" />
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
                      agruparPor: e.target.value as VistaHistorial["agruparPor"],
                    })
                  }
                  className={`px-3 py-1 rounded-lg ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto} text-sm font-semibold cursor-pointer`}
                >
                  <option value="ninguno">Sin agrupar</option>
                  <option value="mes">Por mes</option>
                  <option value="tipo">Por tipo</option>
                  <option value="equipo">Por equipo</option>
                  <option value="tecnico">Por técnico</option>
                  <option value="resultado">Por resultado</option>
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
                      ordenarPor: e.target.value as FiltrosHistorial["ordenarPor"],
                    })
                  }
                  className={`px-3 py-1 rounded-lg ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto} text-sm font-semibold cursor-pointer`}
                >
                  <option value="fecha_fin">Fecha finalización</option>
                  <option value="duracion">Duración</option>
                  <option value="costo">Costo</option>
                  <option value="calificacion">Calificación</option>
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
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
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
                <Check className="w-4 h-4" />
                Selección múltiple
              </button>

              <button
                onClick={() => cambiarVista({ mostrarFotos: !vista.mostrarFotos })}
                className={`px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 transition-all duration-300 ${
                  vista.mostrarFotos
                    ? "bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg"
                    : `${tema.colores.secundario} ${tema.colores.texto}`
                }`}
              >
                {vista.mostrarFotos ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                Fotos
              </button>

              <button
                onClick={() => cambiarVista({ mostrarCostos: !vista.mostrarCostos })}
                className={`px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 transition-all duration-300 ${
                  vista.mostrarCostos
                    ? "bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg"
                    : `${tema.colores.secundario} ${tema.colores.texto}`
                }`}
              >
                <TrendingUp className="w-4 h-4" />
                Costos
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
                    🔧 Tipo de Mantenimiento
                  </label>
                  <div className="space-y-2">
                    {TIPOS_MANTENIMIENTO.map((tipo) => (
                      <label
                        key={tipo.value}
                        className="flex items-center gap-2 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={filtros.tipo_mantenimiento.includes(tipo.value)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFiltros({
                                ...filtros,
                                tipo_mantenimiento: [...filtros.tipo_mantenimiento, tipo.value],
                              });
                            } else {
                              setFiltros({
                                ...filtros,
                                tipo_mantenimiento: filtros.tipo_mantenimiento.filter((t) => t !== tipo.value),
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
                    🎯 Resultado
                  </label>
                  <div className="space-y-2">
                    {RESULTADOS.map((resultado) => (
                      <label
                        key={resultado.value}
                        className="flex items-center gap-2 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={filtros.resultado.includes(resultado.value)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFiltros({
                                ...filtros,
                                resultado: [...filtros.resultado, resultado.value],
                              });
                            } else {
                              setFiltros({
                                ...filtros,
                                resultado: filtros.resultado.filter((r) => r !== resultado.value),
                              });
                            }
                          }}
                          className="w-4 h-4 rounded"
                        />
                        <span
                          className={`text-sm font-semibold ${tema.colores.texto}`}
                        >
                          {resultado.label}
                        </span>
                      </label>
                    ))}
                  </div>
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
                      checked={filtros.soloAprobados}
                      onChange={(e) =>
                        setFiltros({ ...filtros, soloAprobados: e.target.checked })
                      }
                      className="w-4 h-4 rounded"
                    />
                    <span className={`text-sm font-semibold ${tema.colores.texto}`}>
                      ✅ Solo aprobados
                    </span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filtros.soloConSeguimiento}
                      onChange={(e) =>
                        setFiltros({ ...filtros, soloConSeguimiento: e.target.checked })
                      }
                      className="w-4 h-4 rounded"
                    />
                    <span className={`text-sm font-semibold ${tema.colores.texto}`}>
                      👁️ Con seguimiento
                    </span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filtros.soloMisTrabjos}
                      onChange={(e) =>
                        setFiltros({ ...filtros, soloMisTrabjos: e.target.checked })
                      }
                      className="w-4 h-4 rounded"
                    />
                    <span className={`text-sm font-semibold ${tema.colores.texto}`}>
                      👤 Mis trabajos
                    </span>
                  </label>
                </div>

                <div className="flex items-end">
                  <button
                    onClick={() =>
                      setFiltros({
                        tipo_mantenimiento: [],
                        tipo_falla: [],
                        prioridad: [],
                        resultado: [],
                        ubicacion: "",
                        equipoNombre: "",
                        fechaDesde: "",
                        fechaHasta: "",
                        tecnicoAsignado: "",
                        soloAprobados: false,
                        soloConSeguimiento: false,
                        soloMisTrabjos: false,
                        rangoCalificacion: [0, 5],
                        rangoCosto: [0, 1000000],
                        ordenarPor: "fecha_fin",
                        ordenDireccion: "desc",
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

        {/* Contenido: Historial */}
        {loadingHistorial ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <Loader2 className="w-16 h-16 animate-spin text-indigo-500 mx-auto mb-4" />
              <p className={`text-lg font-semibold ${tema.colores.textoSecundario}`}>
                Cargando historial...
              </p>
            </div>
          </div>
        ) : historialFiltrado.length === 0 ? (
          <div
            className={`rounded-2xl p-12 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} text-center`}
          >
            <div
              className={`w-24 h-24 bg-gradient-to-br ${tema.colores.gradiente} rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse`}
            >
              <Package className="w-12 h-12 text-white" />
            </div>
            <h3 className={`text-3xl font-black mb-4 ${tema.colores.texto}`}>
              📦 Sin Registros
            </h3>
            <p className={`text-lg ${tema.colores.textoSecundario} mb-6`}>
              No hay registros en el historial que coincidan con los filtros aplicados.
            </p>
            <button
              onClick={() => {
                setFiltros({
                  tipo_mantenimiento: [],
                  tipo_falla: [],
                  prioridad: [],
                  resultado: [],
                  ubicacion: "",
                  equipoNombre: "",
                  fechaDesde: "",
                  fechaHasta: "",
                  tecnicoAsignado: "",
                  soloAprobados: false,
                  soloConSeguimiento: false,
                  soloMisTrabjos: false,
                  rangoCalificacion: [0, 5],
                  rangoCosto: [0, 1000000],
                  ordenarPor: "fecha_fin",
                  ordenDireccion: "desc",
                });
                setBusqueda("");
              }}
              className={`px-6 py-3 rounded-xl font-bold transition-all duration-300 ${tema.colores.secundario} ${tema.colores.texto} hover:scale-105`}
            >
              Limpiar filtros
            </button>
          </div>
        ) : (
          <div className="text-center py-12">
            <p className={`text-lg ${tema.colores.textoSecundario}`}>
              Vista de historial en construcción - {historialFiltrado.length} registros encontrados
            </p>
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
                <History className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className={`text-sm font-semibold ${tema.colores.texto}`}>
                  © 2025 AnyssaMed - Sistema de Historial de Mantenimiento Premium
                </p>
                <p className={`text-xs ${tema.colores.textoSecundario}`}>
                  Análisis Completo de Desempeño y Trazabilidad v4.5.0
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
              <button
                onClick={cerrarSesion}
                className={`text-sm font-bold transition-colors ${tema.colores.textoSecundario} hover:text-red-400 flex items-center gap-1`}
              >
                <LogOut className="w-4 h-4" />
                Cerrar Sesión
              </button>
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

        *:focus-visible {
          outline: 2px solid #6366f1;
          outline-offset: 2px;
          border-radius: 8px;
        }

        ::selection {
          background-color: rgba(99, 102, 241, 0.3);
          color: inherit;
        }
      `}</style>
    </div>
  );
}
