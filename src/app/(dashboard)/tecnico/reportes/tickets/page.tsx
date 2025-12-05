// src/app/(dashboard)/tecnico/reportes/tickets/page.tsx
"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import SidebarTecnico from "@/components/tecnico/SidebarTecnico";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

import {
  Activity,
  AlertCircle,
  AlertOctagon,
  AlertTriangle,
  Archive,
  ArrowDownRight,
  ArrowLeft,
  ArrowUpRight,
  Award,
  BarChart3,
  Paperclip,
  Bell,
  BellOff,
  BookOpen,
  Brain,
  BrainCircuit,
  Building2,
  Calendar,
  CalendarClock,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock,
  Clock3,
  ClipboardCheck,
  ClipboardList,
  Cpu,
  Database,
  Download,
  Edit,
  Eye,
  EyeOff,
  FileSpreadsheet,
  FileText,
  Filter,
  Flame,
  FolderOpen,
  Globe,
  Hash,
  Heart,
  HeartPulse,
  History,
  Inbox,
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
  Medal,
  MessageSquare,
  Minimize2,
  Moon,
  MoreVertical,
  Pause,
  Percent,
  Phone,
  PieChart,
  Play,
  Plus,
  Printer,
  RefreshCw,
  Rocket,
  Save,
  Search,
  Send,
  Settings,
  Share2,
  Shield,
  ShieldCheck,
  Sparkles,
  Star,
  Sun,
  Tag,
  Target,
  ThumbsDown,
  ThumbsUp,
  TrendingDown,
  TrendingUp,
  Trophy,
  Truck,
  User,
  UserCheck,
  UserCog,
  Users,
  Wifi,
  Wrench,
  X,
  XCircle,
  Zap,
} from "lucide-react";

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
  ComposedChart,
  Scatter,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts";

// ========================================
// TIPOS
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
  estado: "abierto" | "en_progreso" | "resuelto" | "cerrado" | "cancelado";
  prioridad: "baja" | "media" | "alta" | "critica";
  categoria: string;
  subcategoria: string | null;
  fecha_creacion: string;
  fecha_asignacion: string | null;
  fecha_resolucion: string | null;
  fecha_cierre: string | null;
  tiempo_resolucion_minutos: number | null;
  calificacion: number | null;
  comentario_calificacion: string | null;
  usuario_solicitante: {
    id_usuario: number;
    nombre: string;
    apellido_paterno: string;
    email: string;
    foto_perfil_url: string | null;
  };
  centro: {
    id_centro: number;
    nombre: string;
    ciudad: string;
  };
  tags: string[];
  archivos_adjuntos: number;
  comentarios_count: number;
  es_urgente: boolean;
  es_reabierto: boolean;
}

interface EstadisticasTickets {
  total: number;
  abiertos: number;
  en_progreso: number;
  resueltos: number;
  cerrados: number;
  cancelados: number;
  promedio_resolucion_minutos: number;
  promedio_calificacion: number;
  tickets_urgentes: number;
  tickets_reabiertos: number;
  tasa_resolucion_primer_contacto: number;
  cumplimiento_sla: number;
}

interface DistribucionCategoria {
  categoria: string;
  cantidad: number;
  porcentaje: number;
  color: string;
}

interface DistribucionPrioridad {
  prioridad: string;
  cantidad: number;
  porcentaje: number;
  color: string;
}

interface TendenciaTemporal {
  fecha: string;
  abiertos: number;
  resueltos: number;
  en_progreso: number;
}

interface RendimientoPorDia {
  dia: string;
  tickets_resueltos: number;
  tiempo_promedio: number;
  calificacion_promedio: number;
}

interface TopCategorias {
  categoria: string;
  cantidad: number;
  tiempo_promedio: number;
  calificacion_promedio: number;
}

type FiltroEstado = "todos" | "abierto" | "en_progreso" | "resuelto" | "cerrado" | "cancelado";
type FiltroPrioridad = "todos" | "baja" | "media" | "alta" | "critica";
type OrdenColumna = "fecha_creacion" | "prioridad" | "estado" | "calificacion" | "tiempo_resolucion";
type DireccionOrden = "asc" | "desc";

// ========================================
// TEMAS
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
// DATOS DE EJEMPLO (FALLBACK)
// ========================================

const ESTADISTICAS_TICKETS_DEFAULT: EstadisticasTickets = {
  total: 156,
  abiertos: 23,
  en_progreso: 18,
  resueltos: 98,
  cerrados: 15,
  cancelados: 2,
  promedio_resolucion_minutos: 145,
  promedio_calificacion: 4.6,
  tickets_urgentes: 8,
  tickets_reabiertos: 3,
  tasa_resolucion_primer_contacto: 87,
  cumplimiento_sla: 94,
};

const DISTRIBUCION_CATEGORIAS_DEFAULT: DistribucionCategoria[] = [
  { categoria: "Soporte Técnico", cantidad: 45, porcentaje: 28.8, color: "#3b82f6" },
  { categoria: "Mantenimiento", cantidad: 38, porcentaje: 24.4, color: "#10b981" },
  { categoria: "Infraestructura", cantidad: 28, porcentaje: 17.9, color: "#f59e0b" },
  { categoria: "Software", cantidad: 25, porcentaje: 16.0, color: "#8b5cf6" },
  { categoria: "Hardware", cantidad: 20, porcentaje: 12.8, color: "#ef4444" },
];

const DISTRIBUCION_PRIORIDADES_DEFAULT: DistribucionPrioridad[] = [
  { prioridad: "Crítica", cantidad: 12, porcentaje: 7.7, color: "#dc2626" },
  { prioridad: "Alta", cantidad: 35, porcentaje: 22.4, color: "#f59e0b" },
  { prioridad: "Media", cantidad: 78, porcentaje: 50.0, color: "#3b82f6" },
  { prioridad: "Baja", cantidad: 31, porcentaje: 19.9, color: "#10b981" },
];

const TENDENCIA_TEMPORAL_DEFAULT: TendenciaTemporal[] = [
  { fecha: "Lun", abiertos: 12, resueltos: 18, en_progreso: 8 },
  { fecha: "Mar", abiertos: 15, resueltos: 20, en_progreso: 10 },
  { fecha: "Mié", abiertos: 10, resueltos: 22, en_progreso: 7 },
  { fecha: "Jue", abiertos: 14, resueltos: 19, en_progreso: 9 },
  { fecha: "Vie", abiertos: 11, resueltos: 25, en_progreso: 6 },
  { fecha: "Sáb", abiertos: 5, resueltos: 8, en_progreso: 3 },
  { fecha: "Dom", abiertos: 3, resueltos: 6, en_progreso: 2 },
];

const RENDIMIENTO_POR_DIA_DEFAULT: RendimientoPorDia[] = [
  { dia: "Lun", tickets_resueltos: 18, tiempo_promedio: 152, calificacion_promedio: 4.5 },
  { dia: "Mar", tickets_resueltos: 20, tiempo_promedio: 145, calificacion_promedio: 4.6 },
  { dia: "Mié", tickets_resueltos: 22, tiempo_promedio: 138, calificacion_promedio: 4.7 },
  { dia: "Jue", tickets_resueltos: 19, tiempo_promedio: 148, calificacion_promedio: 4.6 },
  { dia: "Vie", tickets_resueltos: 25, tiempo_promedio: 142, calificacion_promedio: 4.8 },
  { dia: "Sáb", tickets_resueltos: 8, tiempo_promedio: 135, calificacion_promedio: 4.7 },
  { dia: "Dom", tickets_resueltos: 6, tiempo_promedio: 140, calificacion_promedio: 4.6 },
];

const TOP_CATEGORIAS_DEFAULT: TopCategorias[] = [
  { categoria: "Soporte Técnico", cantidad: 45, tiempo_promedio: 135, calificacion_promedio: 4.7 },
  { categoria: "Mantenimiento", cantidad: 38, tiempo_promedio: 165, calificacion_promedio: 4.5 },
  { categoria: "Infraestructura", cantidad: 28, tiempo_promedio: 180, calificacion_promedio: 4.4 },
  { categoria: "Software", cantidad: 25, tiempo_promedio: 125, calificacion_promedio: 4.8 },
  { categoria: "Hardware", cantidad: 20, tiempo_promedio: 155, calificacion_promedio: 4.6 },
];

const TICKETS_DEFAULT: Ticket[] = [
  {
    id_ticket: 1,
    numero_ticket: "TKT-2025-001",
    titulo: "Error en sistema de gestión hospitalaria",
    descripcion: "El sistema presenta errores al intentar registrar nuevos pacientes",
    estado: "en_progreso",
    prioridad: "alta",
    categoria: "Soporte Técnico",
    subcategoria: "Software",
    fecha_creacion: "2025-01-15T08:30:00",
    fecha_asignacion: "2025-01-15T08:35:00",
    fecha_resolucion: null,
    fecha_cierre: null,
    tiempo_resolucion_minutos: null,
    calificacion: null,
    comentario_calificacion: null,
    usuario_solicitante: {
      id_usuario: 101,
      nombre: "María",
      apellido_paterno: "González",
      email: "maria.gonzalez@hospital.cl",
      foto_perfil_url: null,
    },
    centro: {
      id_centro: 1,
      nombre: "Hospital Central",
      ciudad: "Santiago",
    },
    tags: ["urgente", "software", "pacientes"],
    archivos_adjuntos: 2,
    comentarios_count: 5,
    es_urgente: true,
    es_reabierto: false,
  },
  {
    id_ticket: 2,
    numero_ticket: "TKT-2025-002",
    titulo: "Impresora no funciona en piso 3",
    descripcion: "La impresora HP del piso 3 no responde",
    estado: "resuelto",
    prioridad: "media",
    categoria: "Hardware",
    subcategoria: "Impresoras",
    fecha_creacion: "2025-01-14T10:15:00",
    fecha_asignacion: "2025-01-14T10:20:00",
    fecha_resolucion: "2025-01-14T12:45:00",
    fecha_cierre: "2025-01-14T13:00:00",
    tiempo_resolucion_minutos: 145,
    calificacion: 5,
    comentario_calificacion: "Excelente servicio, muy rápido",
    usuario_solicitante: {
      id_usuario: 102,
      nombre: "Carlos",
      apellido_paterno: "Ramírez",
      email: "carlos.ramirez@hospital.cl",
      foto_perfil_url: null,
    },
    centro: {
      id_centro: 1,
      nombre: "Hospital Central",
      ciudad: "Santiago",
    },
    tags: ["hardware", "impresora"],
    archivos_adjuntos: 1,
    comentarios_count: 3,
    es_urgente: false,
    es_reabierto: false,
  },
];

// ========================================
// COMPONENTE: Custom Tooltip
// ========================================

const CustomTooltip = ({ active, payload, label, tema }: any) => {
  if (active && payload && payload.length) {
    return (
      <div
        className={`rounded-xl p-4 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} backdrop-blur-xl`}
      >
        <p className={`font-bold mb-2 ${tema.colores.texto}`}>{label}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center justify-between gap-4 mb-1">
            <div className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: entry.color }}
              ></div>
              <span className={`text-sm font-semibold ${tema.colores.textoSecundario}`}>
                {entry.name}:
              </span>
            </div>
            <span className={`text-sm font-bold ${tema.colores.texto}`}>
              {typeof entry.value === "number" ? entry.value.toFixed(1) : entry.value}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

// ========================================
// COMPONENTE: Skeleton Loader
// ========================================

const SkeletonCard = ({ tema }: { tema: ConfiguracionTema }) => (
  <div
    className={`rounded-2xl p-6 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} animate-pulse`}
  >
    <div className="flex items-center justify-between mb-4">
      <div className="w-12 h-12 bg-gray-700 rounded-xl"></div>
      <div className="w-16 h-6 bg-gray-700 rounded"></div>
    </div>
    <div className="space-y-3">
      <div className="h-4 bg-gray-700 rounded w-3/4"></div>
      <div className="h-8 bg-gray-700 rounded w-1/2"></div>
      <div className="h-3 bg-gray-700 rounded w-2/3"></div>
    </div>
  </div>
);

const SkeletonTable = ({ tema }: { tema: ConfiguracionTema }) => (
  <div className="space-y-3">
    {[1, 2, 3, 4, 5].map((i) => (
      <div
        key={i}
        className={`p-4 rounded-xl ${tema.colores.card} ${tema.colores.borde} border animate-pulse`}
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gray-700 rounded-xl"></div>
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-700 rounded w-3/4"></div>
            <div className="h-3 bg-gray-700 rounded w-1/2"></div>
          </div>
          <div className="w-20 h-8 bg-gray-700 rounded"></div>
        </div>
      </div>
    ))}
  </div>
);

// ========================================
// COMPONENTE PRINCIPAL
// ========================================

export default function ReportesTicketsTecnicoPage() {
  const router = useRouter();

  // Estados
  const [usuario, setUsuario] = useState<UsuarioSesion | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingTickets, setLoadingTickets] = useState(true);
  const [estadisticas, setEstadisticas] = useState<EstadisticasTecnico | null>(null);
  const [estadisticasTickets, setEstadisticasTickets] = useState<EstadisticasTickets>(
    ESTADISTICAS_TICKETS_DEFAULT
  );
  const [tickets, setTickets] = useState<Ticket[]>(TICKETS_DEFAULT);
  const [distribucionCategorias, setDistribucionCategorias] = useState<
    DistribucionCategoria[]
  >(DISTRIBUCION_CATEGORIAS_DEFAULT);
  const [distribucionPrioridades, setDistribucionPrioridades] = useState<
    DistribucionPrioridad[]
  >(DISTRIBUCION_PRIORIDADES_DEFAULT);
  const [tendenciaTemporal, setTendenciaTemporal] = useState<TendenciaTemporal[]>(
    TENDENCIA_TEMPORAL_DEFAULT
  );
  const [rendimientoPorDia, setRendimientoPorDia] = useState<RendimientoPorDia[]>(
    RENDIMIENTO_POR_DIA_DEFAULT
  );
  const [topCategorias, setTopCategorias] = useState<TopCategorias[]>(
    TOP_CATEGORIAS_DEFAULT
  );

  const [temaActual, setTemaActual] = useState<TemaColor>("dark");
  const [sidebarAbierto, setSidebarAbierto] = useState(true);
  const [notificacionesAbiertas, setNotificacionesAbiertas] = useState(false);
  const [perfilAbierto, setPerfilAbierto] = useState(false);
  const [busqueda, setBusqueda] = useState("");
  const [disponibilidad, setDisponibilidad] = useState<
    "disponible" | "ocupado" | "fuera_servicio"
  >("disponible");

  // Filtros y ordenamiento
  const [filtroEstado, setFiltroEstado] = useState<FiltroEstado>("todos");
  const [filtroPrioridad, setFiltroPrioridad] = useState<FiltroPrioridad>("todos");
  const [ordenColumna, setOrdenColumna] = useState<OrdenColumna>("fecha_creacion");
  const [direccionOrden, setDireccionOrden] = useState<DireccionOrden>("desc");
  const [paginaActual, setPaginaActual] = useState(1);
  const [ticketsPorPagina] = useState(10);
  const [ticketSeleccionado, setTicketSeleccionado] = useState<Ticket | null>(null);
  const [modalDetalleAbierto, setModalDetalleAbierto] = useState(false);
  const [vistaActual, setVistaActual] = useState<"tabla" | "tarjetas">("tabla");
  const [rangoFechas, setRangoFechas] = useState<"7d" | "30d" | "90d" | "anio">("30d");

  const tema = useMemo(() => TEMAS[temaActual], [temaActual]);

  // ========================================
  // EFECTOS
  // ========================================

  useEffect(() => {
    if (typeof window !== "undefined") {
      const temaGuardado = localStorage.getItem("tema_tecnico") as TemaColor | null;
      if (temaGuardado && TEMAS[temaGuardado]) {
        setTemaActual(temaGuardado);
      }
    }
  }, []);

  useEffect(() => {
    document.body.className = `bg-gradient-to-br ${tema.colores.fondo} min-h-screen transition-all duration-500`;
  }, [tema]);

  useEffect(() => {
    const cargarDatosUsuario = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/auth/session", {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        });

        if (!response.ok) throw new Error("No hay sesión activa");

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
            alert("Acceso denegado. Este panel es solo para técnicos.");
            router.push("/");
            return;
          }

          if (!result.usuario.tecnico) {
            alert("Tu usuario no está vinculado a un registro de técnico.");
            router.push("/");
            return;
          }

          setUsuario(result.usuario);
          setDisponibilidad(result.usuario.tecnico.disponibilidad);
        } else {
          router.push("/login");
        }
      } catch (error) {
        console.error("Error al cargar usuario:", error);
        router.push("/login");
      } finally {
        setLoading(false);
      }
    };

    cargarDatosUsuario();
  }, [router]);

  useEffect(() => {
    if (usuario?.tecnico?.id_tecnico) {
      cargarTickets();
    }
  }, [usuario, rangoFechas]);

  useEffect(() => {
    if (!usuario?.tecnico?.id_tecnico) return;

    const interval = setInterval(() => {
      cargarTickets();
    }, 300000); // 5 min

    return () => clearInterval(interval);
  }, [usuario, rangoFechas]);

  // ========================================
  // FUNCIONES
  // ========================================

  const cargarTickets = async () => {
    if (!usuario?.tecnico?.id_tecnico) return;

    try {
      setLoadingTickets(true);

      const params = new URLSearchParams({
        id_tecnico: String(usuario.tecnico.id_tecnico),
        rango: rangoFechas,
      });

      const res = await fetch(`/api/tecnico/tickets?${params.toString()}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      const data = await res.json().catch(() => ({ success: false }));

      if (!res.ok || !data.success) {
        console.error("Error al cargar tickets:", data);
        return;
      }

      // Actualizar con datos del API si existen
      if (data.estadisticas_tickets) setEstadisticasTickets(data.estadisticas_tickets);
      if (data.tickets) setTickets(data.tickets);
      if (data.distribucion_categorias)
        setDistribucionCategorias(data.distribucion_categorias);
      if (data.distribucion_prioridades)
        setDistribucionPrioridades(data.distribucion_prioridades);
      if (data.tendencia_temporal) setTendenciaTemporal(data.tendencia_temporal);
      if (data.rendimiento_por_dia) setRendimientoPorDia(data.rendimiento_por_dia);
      if (data.top_categorias) setTopCategorias(data.top_categorias);
      if (data.estadisticas) setEstadisticas(data.estadisticas);
    } catch (err) {
      console.error("Error al cargar tickets:", err);
    } finally {
      setLoadingTickets(false);
    }
  };

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
      }
    } catch (error) {
      console.error("Error al cambiar disponibilidad:", error);
    }
  };

  const cerrarSesion = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
      router.push("/login");
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
      console.error("No se pudo guardar preferencia:", err);
    }
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
      cerrado: isDark
        ? "bg-gray-500/20 text-gray-400 border-gray-500/30"
        : "bg-gray-100 text-gray-800 border-gray-200",
      cancelado: isDark
        ? "bg-orange-500/20 text-orange-400 border-orange-500/30"
        : "bg-orange-100 text-orange-800 border-orange-200",
    };
    return colores[estado.toLowerCase()] || colores.abierto;
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
        ? "bg-blue-500/20 text-blue-400 border-blue-500/30"
        : "bg-blue-100 text-blue-800 border-blue-200",
      baja: isDark
        ? "bg-green-500/20 text-green-400 border-green-500/30"
        : "bg-green-100 text-green-800 border-green-200",
    };
    return colores[prioridad.toLowerCase()] || colores.media;
  };

  const obtenerIconoEstado = (estado: string) => {
    const iconos: { [key: string]: any } = {
      abierto: AlertOctagon,
      en_progreso: Clock,
      resuelto: CheckCircle2,
      cerrado: Archive,
      cancelado: XCircle,
    };
    return iconos[estado.toLowerCase()] || AlertOctagon;
  };

  const obtenerIconoPrioridad = (prioridad: string) => {
    const iconos: { [key: string]: any } = {
      critica: Flame,
      alta: AlertTriangle,
      media: Info,
      baja: CheckCircle2,
    };
    return iconos[prioridad.toLowerCase()] || Info;
  };

  const formatearFecha = (fecha: string) => {
    const date = new Date(fecha);
    if (isNaN(date.getTime())) return "Sin fecha";
    return new Intl.DateTimeFormat("es-CL", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  const formatearTiempo = (minutos: number | null) => {
    if (!minutos) return "N/A";
    const horas = Math.floor(minutos / 60);
    const mins = minutos % 60;
    if (horas > 0) {
      return `${horas}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const calcularTiempoTranscurrido = (fechaCreacion: string) => {
    const ahora = new Date();
    const creacion = new Date(fechaCreacion);
    const diffMs = ahora.getTime() - creacion.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHoras = Math.floor(diffMins / 60);
    const diffDias = Math.floor(diffHoras / 24);

    if (diffDias > 0) return `${diffDias}d`;
    if (diffHoras > 0) return `${diffHoras}h`;
    return `${diffMins}m`;
  };

  const handleOrdenar = (columna: OrdenColumna) => {
    if (ordenColumna === columna) {
      setDireccionOrden(direccionOrden === "asc" ? "desc" : "asc");
    } else {
      setOrdenColumna(columna);
      setDireccionOrden("desc");
    }
  };

  const abrirDetalleTicket = (ticket: Ticket) => {
    setTicketSeleccionado(ticket);
    setModalDetalleAbierto(true);
  };

  const cerrarDetalleTicket = () => {
    setTicketSeleccionado(null);
    setModalDetalleAbierto(false);
  };

  // Filtrado y ordenamiento
  const ticketsFiltrados = useMemo(() => {
    let resultado = [...tickets];

    // Filtro por búsqueda
    if (busqueda) {
      resultado = resultado.filter(
        (t) =>
          t.numero_ticket.toLowerCase().includes(busqueda.toLowerCase()) ||
          t.titulo.toLowerCase().includes(busqueda.toLowerCase()) ||
          t.descripcion.toLowerCase().includes(busqueda.toLowerCase()) ||
          t.usuario_solicitante.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
          t.usuario_solicitante.apellido_paterno
            .toLowerCase()
            .includes(busqueda.toLowerCase())
      );
    }

    // Filtro por estado
    if (filtroEstado !== "todos") {
      resultado = resultado.filter((t) => t.estado === filtroEstado);
    }

    // Filtro por prioridad
    if (filtroPrioridad !== "todos") {
      resultado = resultado.filter((t) => t.prioridad === filtroPrioridad);
    }

    // Ordenamiento
    resultado.sort((a, b) => {
      let comparacion = 0;

      switch (ordenColumna) {
        case "fecha_creacion":
          comparacion =
            new Date(a.fecha_creacion).getTime() -
            new Date(b.fecha_creacion).getTime();
          break;
        case "prioridad":
          const prioridades = { critica: 4, alta: 3, media: 2, baja: 1 };
          comparacion = prioridades[a.prioridad] - prioridades[b.prioridad];
          break;
        case "estado":
          comparacion = a.estado.localeCompare(b.estado);
          break;
        case "calificacion":
          comparacion = (a.calificacion || 0) - (b.calificacion || 0);
          break;
        case "tiempo_resolucion":
          comparacion =
            (a.tiempo_resolucion_minutos || 0) - (b.tiempo_resolucion_minutos || 0);
          break;
      }

      return direccionOrden === "asc" ? comparacion : -comparacion;
    });

    return resultado;
  }, [tickets, busqueda, filtroEstado, filtroPrioridad, ordenColumna, direccionOrden]);

  // Paginación
  const ticketsPaginados = useMemo(() => {
    const inicio = (paginaActual - 1) * ticketsPorPagina;
    const fin = inicio + ticketsPorPagina;
    return ticketsFiltrados.slice(inicio, fin);
  }, [ticketsFiltrados, paginaActual, ticketsPorPagina]);

  const totalPaginas = Math.ceil(ticketsFiltrados.length / ticketsPorPagina);

  // Exportar funciones
  const exportarExcel = () => {
    window.open(
      `/api/tecnico/tickets/export?formato=excel&id_tecnico=${usuario?.tecnico?.id_tecnico}&rango=${rangoFechas}`,
      "_blank"
    );
  };

  const exportarPDF = () => {
    window.open(
      `/api/tecnico/tickets/export?formato=pdf&id_tecnico=${usuario?.tecnico?.id_tecnico}&rango=${rangoFechas}`,
      "_blank"
    );
  };

  const exportarCSV = () => {
    window.open(
      `/api/tecnico/tickets/export?formato=csv&id_tecnico=${usuario?.tecnico?.id_tecnico}&rango=${rangoFechas}`,
      "_blank"
    );
  };

  // ========================================
  // RENDER LOADING
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
              <ClipboardList className="w-10 h-10 text-white" />
            </div>
          </div>
          <h2 className={`text-4xl font-black mb-4 ${tema.colores.texto}`}>
            Cargando Reportes de Tickets
          </h2>
          <p
            className={`text-lg font-semibold ${tema.colores.textoSecundario} animate-pulse`}
          >
            Preparando análisis detallado...
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
            No tienes permisos para acceder a los reportes de tickets.
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
  // RENDER COMPLETO
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
            <div className="relative group">
              <Search
                className={`absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 ${tema.colores.textoSecundario} transition-colors group-focus-within:text-indigo-500`}
              />
              <input
                type="text"
                placeholder="Buscar tickets por número, título, usuario..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className={`w-full pl-12 pr-4 py-3 rounded-xl ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto} placeholder:${tema.colores.textoSecundario} focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all duration-300`}
              />
              {busqueda && (
                <button
                  onClick={() => setBusqueda("")}
                  className={`absolute right-4 top-1/2 transform -translate-y-1/2 p-1 rounded-lg ${tema.colores.hover} transition-all duration-200`}
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
                className={`p-3 rounded-xl font-semibold transition-all duration-300 ${tema.colores.secundario} ${tema.colores.texto} hover:scale-105`}
              >
                <Sparkles className="w-5 h-5" />
              </button>

              <div
                className={`absolute right-0 mt-2 w-64 rounded-2xl ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 p-4 space-y-2`}
              >
                <p className={`text-sm font-bold mb-3 ${tema.colores.texto}`}>
                  Temas Disponibles
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

            {/* Disponibilidad */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => cambiarDisponibilidad("disponible")}
                className={`px-4 py-2 rounded-xl font-semibold text-sm transition-all duration-300 hover:scale-105 ${
                  disponibilidad === "disponible"
                    ? "bg-green-600 text-white shadow-lg shadow-green-500/50"
                    : `${tema.colores.secundario} ${tema.colores.texto}`
                }`}
              >
                ✓ Disponible
              </button>
              <button
                onClick={() => cambiarDisponibilidad("ocupado")}
                className={`px-4 py-2 rounded-xl font-semibold text-sm transition-all duration-300 hover:scale-105 ${
                  disponibilidad === "ocupado"
                    ? "bg-yellow-600 text-white shadow-lg shadow-yellow-500/50"
                    : `${tema.colores.secundario} ${tema.colores.texto}`
                }`}
              >
                ⏳ Ocupado
              </button>
              <button
                onClick={() => cambiarDisponibilidad("fuera_servicio")}
                className={`px-4 py-2 rounded-xl font-semibold text-sm transition-all duration-300 hover:scale-105 ${
                  disponibilidad === "fuera_servicio"
                    ? "bg-red-600 text-white shadow-lg shadow-red-500/50"
                    : `${tema.colores.secundario} ${tema.colores.texto}`
                }`}
              >
                ✕ Fuera
              </button>
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
                  <p className={`text-xs ${tema.colores.textoSecundario}`}>Técnico</p>
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
                  className={`absolute right-0 mt-2 w-80 rounded-2xl ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} p-4 animate-slideDown`}
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
        {/* Encabezado */}
        <div className="mb-8 animate-fadeIn">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-4">
            <div>
              <div className="flex items-center gap-2 text-sm mb-2">
                <Link
                  href="/tecnico/reportes"
                  className={`font-semibold ${tema.colores.textoSecundario} hover:${tema.colores.acento} transition-colors flex items-center gap-1`}
                >
                  <ArrowLeft className="w-4 h-4" />
                  Reportes
                </Link>
                <span className={tema.colores.textoSecundario}>/</span>
                <span className={`font-bold ${tema.colores.texto}`}>
                  Análisis de Tickets
                </span>
              </div>
              <h2
                className={`text-4xl font-black mb-1 ${tema.colores.texto} flex items-center gap-3`}
              >
                <ClipboardList className="w-10 h-10" />
                Gestión de Tickets
                <span className="inline-flex items-center justify-center px-3 py-1 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-sm font-bold shadow-lg shadow-indigo-500/50 animate-pulse">
                  PREMIUM
                </span>
              </h2>
              <p
                className={`text-sm md:text-base font-semibold ${tema.colores.textoSecundario} flex items-center gap-2`}
              >
                <MapPin className="w-4 h-4" />
                {usuario.tecnico?.centro?.nombre ?? "Centro no definido"} •{" "}
                {usuario.tecnico?.area_tecnica ?? "Área no definida"}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {/* Rango de fechas */}
              <div className="flex flex-wrap gap-2">
                {(["7d", "30d", "90d", "anio"] as const).map((r) => (
                  <button
                                        key={r}
                    onClick={() => setRangoFechas(r)}
                    className={`px-4 py-2 rounded-xl font-semibold text-sm transition-all duration-300 hover:scale-105 ${
                      rangoFechas === r
                        ? `bg-gradient-to-r ${tema.colores.gradiente} text-white shadow-lg`
                        : `${tema.colores.secundario} ${tema.colores.texto}`
                    }`}
                  >
                    {r === "7d"
                      ? "7 días"
                      : r === "30d"
                      ? "30 días"
                      : r === "90d"
                      ? "90 días"
                      : "Año"}
                  </button>
                ))}
              </div>

              <button
                onClick={() => cargarTickets()}
                className={`flex items-center gap-2 px-4 py-2 ${tema.colores.primario} text-white rounded-xl font-bold transition-all duration-300 hover:scale-105 ${tema.colores.sombra}`}
              >
                <RefreshCw
                  className={`w-4 h-4 ${loadingTickets ? "animate-spin" : ""}`}
                />
                Actualizar
              </button>

              {/* Exportar */}
              <div className="flex items-center gap-2">
                <button
                  onClick={exportarExcel}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold ${tema.colores.secundario} ${tema.colores.texto} hover:scale-105 transition-all duration-300`}
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  Excel
                </button>
                <button
                  onClick={exportarPDF}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold ${tema.colores.secundario} ${tema.colores.texto} hover:scale-105 transition-all duration-300`}
                >
                  <FileText className="w-4 h-4" />
                  PDF
                </button>
                <button
                  onClick={exportarCSV}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold ${tema.colores.secundario} ${tema.colores.texto} hover:scale-105 transition-all duration-300`}
                >
                  <Download className="w-4 h-4" />
                  CSV
                </button>
              </div>
            </div>
          </div>

          <p className={`text-sm ${tema.colores.textoSecundario}`}>
            Análisis completo de tickets con estadísticas avanzadas, tendencias temporales
            y exportación profesional en múltiples formatos.
          </p>
        </div>

        {loadingTickets ? (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <SkeletonCard key={i} tema={tema} />
              ))}
            </div>
            <SkeletonTable tema={tema} />
          </div>
        ) : (
          <>
            {/* Estadísticas Principales */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {[
                {
                  titulo: "Total Tickets",
                  valor: estadisticasTickets.total,
                  descripcion: "Tickets gestionados",
                  icono: ClipboardList,
                  color: "from-indigo-500 to-purple-500",
                  extra: `${estadisticasTickets.resueltos} resueltos`,
                  tendencia: "up" as const,
                  cambio: "+12%",
                },
                {
                  titulo: "En Progreso",
                  valor: estadisticasTickets.en_progreso,
                  descripcion: "Tickets activos",
                  icono: Clock,
                  color: "from-blue-500 to-cyan-500",
                  extra: `${estadisticasTickets.abiertos} abiertos`,
                  tendencia: "neutral" as const,
                  cambio: "0%",
                },
                {
                  titulo: "Tiempo Promedio",
                  valor: Math.round(estadisticasTickets.promedio_resolucion_minutos),
                  descripcion: "Minutos de resolución",
                  icono: Clock3,
                  color: "from-orange-500 to-red-500",
                  extra: formatearTiempo(estadisticasTickets.promedio_resolucion_minutos),
                  tendencia: "down" as const,
                  cambio: "-8%",
                },
                {
                  titulo: "Satisfacción",
                  valor: estadisticasTickets.promedio_calificacion.toFixed(1),
                  descripcion: "Calificación promedio",
                  icono: Star,
                  color: "from-yellow-500 to-amber-500",
                  extra: "de 5.0 estrellas",
                  tendencia: "up" as const,
                  cambio: "+5%",
                },
              ].map((kpi, idx) => (
                <div
                  key={kpi.titulo}
                  className={`rounded-2xl p-6 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} transition-all duration-300 hover:scale-105 hover:-translate-y-2 cursor-pointer group animate-slideUp`}
                  style={{ animationDelay: `${idx * 80}ms` }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div
                      className={`w-14 h-14 bg-gradient-to-br ${kpi.color} rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}
                    >
                      <kpi.icono className="w-7 h-7 text-white" />
                    </div>
                    <div className="flex items-center gap-2">
                      {kpi.tendencia === "up" ? (
                        <TrendingUp className="w-5 h-5 text-emerald-400" />
                      ) : kpi.tendencia === "down" ? (
                        <TrendingDown className="w-5 h-5 text-red-400" />
                      ) : (
                        <Activity className="w-5 h-5 text-gray-400" />
                      )}
                      <span
                        className={`text-sm font-bold ${
                          kpi.tendencia === "up"
                            ? "text-emerald-400"
                            : kpi.tendencia === "down"
                            ? "text-red-400"
                            : "text-gray-400"
                        }`}
                      >
                        {kpi.cambio}
                      </span>
                    </div>
                  </div>
                  <p
                    className={`text-xs font-bold uppercase tracking-wider mb-2 ${tema.colores.textoSecundario}`}
                  >
                    {kpi.descripcion}
                  </p>
                  <div
                    className={`text-4xl md:text-5xl font-black mb-2 ${tema.colores.texto} group-hover:scale-110 transition-transform`}
                  >
                    {kpi.valor}
                  </div>
                  <p className={`text-xs font-semibold ${tema.colores.textoSecundario}`}>
                    {kpi.extra}
                  </p>
                </div>
              ))}
            </div>

            {/* Métricas Adicionales */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {[
                {
                  titulo: "Cumplimiento SLA",
                  valor: `${estadisticasTickets.cumplimiento_sla}%`,
                  icono: Target,
                  color: "from-green-500 to-emerald-500",
                  descripcion: "Tickets dentro de SLA",
                },
                {
                  titulo: "Tasa Resolución",
                  valor: `${estadisticasTickets.tasa_resolucion_primer_contacto}%`,
                  icono: CheckCircle2,
                  color: "from-purple-500 to-pink-500",
                  descripcion: "Primer contacto exitoso",
                },
                {
                  titulo: "Tickets Urgentes",
                  valor: estadisticasTickets.tickets_urgentes,
                  icono: Flame,
                  color: "from-red-500 to-orange-500",
                  descripcion: "Requieren atención inmediata",
                },
                {
                  titulo: "Tickets Reabiertos",
                  valor: estadisticasTickets.tickets_reabiertos,
                  icono: RefreshCw,
                  color: "from-cyan-500 to-blue-500",
                  descripcion: "Requirieron seguimiento",
                },
              ].map((metrica, idx) => (
                <div
                  key={metrica.titulo}
                  className={`rounded-xl p-5 ${tema.colores.card} ${tema.colores.borde} border transition-all duration-300 hover:scale-105 animate-fadeIn`}
                  style={{ animationDelay: `${idx * 60}ms` }}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div
                      className={`w-12 h-12 bg-gradient-to-br ${metrica.color} rounded-xl flex items-center justify-center shadow-lg`}
                    >
                      <metrica.icono className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className={`text-sm font-bold ${tema.colores.textoSecundario}`}>
                        {metrica.titulo}
                      </p>
                      <p className={`text-2xl font-black ${tema.colores.texto}`}>
                        {metrica.valor}
                      </p>
                    </div>
                  </div>
                  <p className={`text-xs ${tema.colores.textoSecundario}`}>
                    {metrica.descripcion}
                  </p>
                </div>
              ))}
            </div>

            {/* Gráficos de Análisis */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              {/* Tendencia Temporal */}
              <div
                className={`rounded-2xl p-6 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} animate-fadeIn`}
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg`}
                    >
                      <LineChart className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className={`text-xl font-black ${tema.colores.texto}`}>
                        Tendencia de Tickets
                      </h3>
                      <p
                        className={`text-sm font-semibold ${tema.colores.textoSecundario}`}
                      >
                        Últimos 7 días
                      </p>
                    </div>
                  </div>
                </div>

                <ResponsiveContainer width="100%" height={300}>
                  <ComposedChart data={tendenciaTemporal}>
                    <defs>
                      <linearGradient id="colorAbiertos" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0.1} />
                      </linearGradient>
                      <linearGradient id="colorResueltos" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0.1} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                    <XAxis
                      dataKey="fecha"
                      stroke={tema.colores.textoSecundario}
                      style={{ fontSize: "12px", fontWeight: "600" }}
                    />
                    <YAxis
                      stroke={tema.colores.textoSecundario}
                      style={{ fontSize: "12px", fontWeight: "600" }}
                    />
                    <Tooltip content={<CustomTooltip tema={tema} />} />
                    <Legend wrapperStyle={{ paddingTop: "20px" }} />
                    <Area
                      type="monotone"
                      dataKey="abiertos"
                      stroke="#ef4444"
                      strokeWidth={3}
                      fillOpacity={1}
                      fill="url(#colorAbiertos)"
                      name="Abiertos"
                    />
                    <Area
                      type="monotone"
                      dataKey="resueltos"
                      stroke="#10b981"
                      strokeWidth={3}
                      fillOpacity={1}
                      fill="url(#colorResueltos)"
                      name="Resueltos"
                    />
                    <Line
                      type="monotone"
                      dataKey="en_progreso"
                      stroke="#3b82f6"
                      strokeWidth={3}
                      name="En Progreso"
                      dot={{ fill: "#3b82f6", r: 5 }}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>

              {/* Distribución por Categoría */}
              <div
                className={`rounded-2xl p-6 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} animate-fadeIn`}
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg`}
                    >
                      <PieChart className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className={`text-xl font-black ${tema.colores.texto}`}>
                        Distribución por Categoría
                      </h3>
                      <p
                        className={`text-sm font-semibold ${tema.colores.textoSecundario}`}
                      >
                        Top 5 categorías
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-8">
                  <ResponsiveContainer width="60%" height={250}>
                    <RechartsPieChart>
                      <Pie
                        //data={distribucionCategorias}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ nombre, porcentaje }) =>
  `${nombre}: ${(Number(porcentaje) || 0).toFixed(1)}%`
}

                        outerRadius={90}
                        fill="#8884d8"
                        dataKey="cantidad"
                      >
                        {distribucionCategorias.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip tema={tema} />} />
                    </RechartsPieChart>
                  </ResponsiveContainer>

                  <div className="flex-1 space-y-3">
                    {distribucionCategorias.map((cat, index) => (
                      <div
                        key={index}
                        className={`flex items-center justify-between p-3 rounded-xl ${tema.colores.hover} transition-all duration-200 hover:scale-105`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className="w-4 h-4 rounded-full"
                            style={{ backgroundColor: cat.color }}
                          ></div>
                          <span className={`text-sm font-bold ${tema.colores.texto}`}>
                            {cat.categoria}
                          </span>
                        </div>
                        <div className="text-right">
                          <p className={`text-lg font-black ${tema.colores.acento}`}>
                            {cat.cantidad}
                          </p>
                          <p className={`text-xs ${tema.colores.textoSecundario}`}>
                            {cat.porcentaje.toFixed(1)}%
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Distribución por Prioridad y Rendimiento */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              {/* Distribución por Prioridad */}
              <div
                className={`rounded-2xl p-6 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} animate-fadeIn`}
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center shadow-lg`}
                    >
                      <Flame className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className={`text-xl font-black ${tema.colores.texto}`}>
                        Distribución por Prioridad
                      </h3>
                      <p
                        className={`text-sm font-semibold ${tema.colores.textoSecundario}`}
                      >
                        Clasificación de urgencia
                      </p>
                    </div>
                  </div>
                </div>

                <ResponsiveContainer width="100%" height={300}>
                  <RechartsBarChart data={distribucionPrioridades}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                    <XAxis
                      dataKey="prioridad"
                      stroke={tema.colores.textoSecundario}
                      style={{ fontSize: "12px", fontWeight: "600" }}
                    />
                    <YAxis
                      stroke={tema.colores.textoSecundario}
                      style={{ fontSize: "12px", fontWeight: "600" }}
                    />
                    <Tooltip content={<CustomTooltip tema={tema} />} />
                    <Bar dataKey="cantidad" name="Cantidad" radius={[8, 8, 0, 0]}>
                      {distribucionPrioridades.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </RechartsBarChart>
                </ResponsiveContainer>
              </div>

              {/* Rendimiento por Día */}
              <div
                className={`rounded-2xl p-6 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} animate-fadeIn`}
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg`}
                    >
                      <BarChart3 className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className={`text-xl font-black ${tema.colores.texto}`}>
                        Rendimiento Diario
                      </h3>
                      <p
                        className={`text-sm font-semibold ${tema.colores.textoSecundario}`}
                      >
                        Tickets resueltos por día
                      </p>
                    </div>
                  </div>
                </div>

                <ResponsiveContainer width="100%" height={300}>
                  <RechartsBarChart data={rendimientoPorDia}>
                    <defs>
                      <linearGradient id="colorRendimiento" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={1} />
                        <stop offset="95%" stopColor="#059669" stopOpacity={1} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                    <XAxis
                      dataKey="dia"
                      stroke={tema.colores.textoSecundario}
                      style={{ fontSize: "12px", fontWeight: "600" }}
                    />
                    <YAxis
                      stroke={tema.colores.textoSecundario}
                      style={{ fontSize: "12px", fontWeight: "600" }}
                    />
                    <Tooltip content={<CustomTooltip tema={tema} />} />
                    <Bar
                      dataKey="tickets_resueltos"
                      fill="url(#colorRendimiento)"
                      name="Tickets Resueltos"
                      radius={[8, 8, 0, 0]}
                    />
                  </RechartsBarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Top Categorías */}
            <div
              className={`rounded-2xl p-6 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} mb-8 animate-fadeIn`}
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-xl flex items-center justify-center shadow-lg`}
                  >
                    <Trophy className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className={`text-xl font-black ${tema.colores.texto}`}>
                      Top Categorías por Rendimiento
                    </h3>
                    <p
                      className={`text-sm font-semibold ${tema.colores.textoSecundario}`}
                    >
                      Análisis detallado por categoría
                    </p>
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto custom-scrollbar">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr
                      className={`text-left text-xs uppercase tracking-wide border-b ${tema.colores.borde}`}
                    >
                      <th className="pb-4 pr-4 font-black text-gray-400">Categoría</th>
                      <th className="pb-4 pr-4 font-black text-gray-400 text-center">
                        Cantidad
                      </th>
                      <th className="pb-4 pr-4 font-black text-gray-400 text-center">
                        Tiempo Promedio
                      </th>
                      <th className="pb-4 pr-4 font-black text-gray-400 text-center">
                        Calificación
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {topCategorias.map((cat, idx) => (
                      <tr
                        key={cat.categoria}
                        className={`border-t ${tema.colores.borde} ${tema.colores.hover} transition-all duration-200 animate-slideUp`}
                        style={{ animationDelay: `${idx * 50}ms` }}
                      >
                        <td className="py-4 pr-4">
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-10 h-10 rounded-xl bg-gradient-to-br ${tema.colores.gradiente} flex items-center justify-center text-white font-bold shadow-lg`}
                            >
                              {idx + 1}
                            </div>
                            <p className={`font-bold ${tema.colores.texto}`}>
                              {cat.categoria}
                            </p>
                          </div>
                        </td>
                        <td className="py-4 pr-4 text-center">
                          <span className={`text-lg font-black ${tema.colores.texto}`}>
                            {cat.cantidad}
                          </span>
                        </td>
                        <td className="py-4 pr-4 text-center">
                          <span className="text-lg font-black text-blue-400">
                            {formatearTiempo(cat.tiempo_promedio)}
                          </span>
                        </td>
                        <td className="py-4 pr-4 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                            <span className="text-lg font-black text-yellow-400">
                              {cat.calificacion_promedio.toFixed(1)}
                            </span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Filtros y Vista */}
            <div
              className={`rounded-2xl p-6 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} mb-6 animate-fadeIn`}
            >
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div className="flex flex-wrap items-center gap-3">
                  {/* Filtro Estado */}
                  <div className="flex items-center gap-2">
                    <Filter className="w-5 h-5 text-gray-400" />
                    <span className={`text-sm font-bold ${tema.colores.texto}`}>
                      Estado:
                    </span>
                    <select
                      value={filtroEstado}
                      onChange={(e) => setFiltroEstado(e.target.value as FiltroEstado)}
                      className={`px-4 py-2 rounded-xl ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto} font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50`}
                    >
                      <option value="todos">Todos</option>
                      <option value="abierto">Abiertos</option>
                      <option value="en_progreso">En Progreso</option>
                      <option value="resuelto">Resueltos</option>
                      <option value="cerrado">Cerrados</option>
                      <option value="cancelado">Cancelados</option>
                    </select>
                  </div>

                  {/* Filtro Prioridad */}
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-bold ${tema.colores.texto}`}>
                      Prioridad:
                    </span>
                    <select
                      value={filtroPrioridad}
                      onChange={(e) =>
                        setFiltroPrioridad(e.target.value as FiltroPrioridad)
                      }
                      className={`px-4 py-2 rounded-xl ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto} font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50`}
                    >
                      <option value="todos">Todas</option>
                      <option value="critica">Crítica</option>
                      <option value="alta">Alta</option>
                      <option value="media">Media</option>
                      <option value="baja">Baja</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className={`text-sm font-bold ${tema.colores.textoSecundario}`}>
                    {ticketsFiltrados.length} tickets
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setVistaActual("tabla")}
                      className={`p-2 rounded-lg transition-all duration-200 ${
                        vistaActual === "tabla"
                          ? `${tema.colores.primario} text-white`
                          : `${tema.colores.secundario} ${tema.colores.texto}`
                      }`}
                    >
                      <Layers className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => setVistaActual("tarjetas")}
                      className={`p-2 rounded-lg transition-all duration-200 ${
                        vistaActual === "tarjetas"
                          ? `${tema.colores.primario} text-white`
                          : `${tema.colores.secundario} ${tema.colores.texto}`
                      }`}
                    >
                      <FolderOpen className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Lista de Tickets */}
            {vistaActual === "tabla" ? (
              <div
                className={`rounded-2xl p-6 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} mb-8 animate-fadeIn`}
              >
                <div className="overflow-x-auto custom-scrollbar">
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr
                        className={`text-left text-xs uppercase tracking-wide border-b ${tema.colores.borde}`}
                      >
                        <th
                          className="pb-4 pr-4 font-black text-gray-400 cursor-pointer hover:text-indigo-400"
                          onClick={() => handleOrdenar("fecha_creacion")}
                        >
                          <div className="flex items-center gap-2">
                            Ticket
                            {ordenColumna === "fecha_creacion" && (
                              <ChevronDown
                                className={`w-4 h-4 transition-transform ${
                                  direccionOrden === "asc" ? "rotate-180" : ""
                                }`}
                              />
                            )}
                          </div>
                        </th>
                        <th className="pb-4 pr-4 font-black text-gray-400">
                          Solicitante
                        </th>
                        <th
                          className="pb-4 pr-4 font-black text-gray-400 cursor-pointer hover:text-indigo-400"
                          onClick={() => handleOrdenar("prioridad")}
                        >
                          <div className="flex items-center gap-2">
                            Prioridad
                            {ordenColumna === "prioridad" && (
                              <ChevronDown
                                className={`w-4 h-4 transition-transform ${
                                  direccionOrden === "asc" ? "rotate-180" : ""
                                }`}
                              />
                            )}
                          </div>
                        </th>
                        <th
                          className="pb-4 pr-4 font-black text-gray-400 cursor-pointer hover:text-indigo-400"
                          onClick={() => handleOrdenar("estado")}
                        >
                          <div className="flex items-center gap-2">
                            Estado
                            {ordenColumna === "estado" && (
                              <ChevronDown
                                className={`w-4 h-4 transition-transform ${
                                  direccionOrden === "asc" ? "rotate-180" : ""
                                }`}
                              />
                            )}
                          </div>
                        </th>
                        <th className="pb-4 pr-4 font-black text-gray-400">Tiempo</th>
                        <th
                          className="pb-4 pr-4 font-black text-gray-400 cursor-pointer hover:text-indigo-400"
                          onClick={() => handleOrdenar("calificacion")}
                        >
                          <div className="flex items-center gap-2">
                            Calificación
                            {ordenColumna === "calificacion" && (
                              <ChevronDown
                                className={`w-4 h-4 transition-transform ${
                                  direccionOrden === "asc" ? "rotate-180" : ""
                                }`}
                              />
                            )}
                          </div>
                        </th>
                        <th className="pb-4 pr-4 font-black text-gray-400">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {ticketsPaginados.map((ticket, idx) => {
                        const IconoEstado = obtenerIconoEstado(ticket.estado);
                        const IconoPrioridad = obtenerIconoPrioridad(ticket.prioridad);

                        return (
                          <tr
                            key={ticket.id_ticket}
                            className={`border-t ${tema.colores.borde} ${tema.colores.hover} transition-all duration-200 animate-slideUp cursor-pointer`}
                            style={{ animationDelay: `${idx * 30}ms` }}
                            onClick={() => abrirDetalleTicket(ticket)}
                          >
                            <td className="py-4 pr-4">
                              <div>
                                <p className={`font-bold ${tema.colores.texto} mb-1`}>
                                  {ticket.numero_ticket}
                                </p>
                                <p
                                  className={`text-xs ${tema.colores.textoSecundario} line-clamp-1`}
                                >
                                  {ticket.titulo}
                                </p>
                                <div className="flex items-center gap-2 mt-1">
                                  <span
                                    className={`text-xs px-2 py-0.5 rounded-full ${tema.colores.secundario}`}
                                  >
                                    {ticket.categoria}
                                  </span>
                                  {ticket.es_urgente && (
                                    <Flame className="w-3 h-3 text-red-400" />
                                  )}
                                  {ticket.es_reabierto && (
                                    <RefreshCw className="w-3 h-3 text-yellow-400" />
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className="py-4 pr-4">
                              <div className="flex items-center gap-2">
                                <div
                                  className={`w-8 h-8 rounded-lg bg-gradient-to-br ${tema.colores.gradiente} flex items-center justify-center text-white font-bold text-xs`}
                                >
                                  {ticket.usuario_solicitante.nombre[0]}
                                  {ticket.usuario_solicitante.apellido_paterno[0]}
                                </div>
                                <div>
                                  <p className={`text-xs font-bold ${tema.colores.texto}`}>
                                    {ticket.usuario_solicitante.nombre}{" "}
                                    {ticket.usuario_solicitante.apellido_paterno}
                                  </p>
                                  <p
                                    className={`text-xs ${tema.colores.textoSecundario}`}
                                  >
                                    {ticket.centro.nombre}
                                  </p>
                                </div>
                              </div>
                            </td>
                            <td className="py-4 pr-4">
                              <span
                                className={`inline-flex items-center gap-2 px-3 py-1 rounded-lg text-xs font-bold border ${obtenerColorPrioridad(
                                  ticket.prioridad
                                )}`}
                              >
                                <IconoPrioridad className="w-3 h-3" />
                                {ticket.prioridad.charAt(0).toUpperCase() +
                                  ticket.prioridad.slice(1)}
                              </span>
                            </td>
                            <td className="py-4 pr-4">
                              <span
                                className={`inline-flex items-center gap-2 px-3 py-1 rounded-lg text-xs font-bold border ${obtenerColorEstado(
                                  ticket.estado
                                )}`}
                              >
                                <IconoEstado className="w-3 h-3" />
                                {ticket.estado.replace("_", " ").charAt(0).toUpperCase() +
                                  ticket.estado.replace("_", " ").slice(1)}
                              </span>
                            </td>
                            <td className="py-4 pr-4">
                              <div>
                                <p className={`text-xs font-bold ${tema.colores.texto}`}>
                                  {ticket.tiempo_resolucion_minutos
                                    ? formatearTiempo(ticket.tiempo_resolucion_minutos)
                                    : calcularTiempoTranscurrido(ticket.fecha_creacion)}
                                </p>
                                <p
                                  className={`text-xs ${tema.colores.textoSecundario}`}
                                >
                                  {ticket.tiempo_resolucion_minutos
                                    ? "Resuelto"
                                    : "Transcurrido"}
                                </p>
                              </div>
                            </td>
                            <td className="py-4 pr-4">
                              {ticket.calificacion ? (
                                <div className="flex items-center gap-1">
                                  {[...Array(5)].map((_, i) => (
                                    <Star
                                      key={i}
                                      className={`w-4 h-4 ${
                                        i < ticket.calificacion!
                                          ? "text-yellow-400 fill-yellow-400"
                                          : "text-gray-600"
                                      }`}
                                    />
                                  ))}
                                </div>
                              ) : (
                                <span
                                  className={`text-xs ${tema.colores.textoSecundario}`}
                                >
                                  Sin calificar
                                </span>
                              )}
                            </td>
                            <td className="py-4 pr-4">
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    abrirDetalleTicket(ticket);
                                  }}
                                  className={`p-2 rounded-lg ${tema.colores.hover} transition-all duration-200`}
                                >
                                  <Eye className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    // Acción editar
                                  }}
                                  className={`p-2 rounded-lg ${tema.colores.hover} transition-all duration-200`}
                                >
                                  <Edit className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Paginación */}
                {totalPaginas > 1 && (
                  <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-700/30">
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-semibold ${tema.colores.textoSecundario}`}>
                        Mostrando {(paginaActual - 1) * ticketsPorPagina + 1} -{" "}
                        {Math.min(paginaActual * ticketsPorPagina, ticketsFiltrados.length)}{" "}
                        de {ticketsFiltrados.length}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setPaginaActual(Math.max(1, paginaActual - 1))}
                        disabled={paginaActual === 1}
                        className={`p-2 rounded-lg ${tema.colores.secundario} ${tema.colores.texto} disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200`}
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </button>

                      {[...Array(totalPaginas)].map((_, i) => {
                        const pagina = i + 1;
                        if (
                          pagina === 1 ||
                          pagina === totalPaginas ||
                          (pagina >= paginaActual - 1 && pagina <= paginaActual + 1)
                        ) {
                          return (
                            <button
                              key={pagina}
                              onClick={() => setPaginaActual(pagina)}
                              className={`px-4 py-2 rounded-lg font-semibold transition-all duration-200 ${
                                paginaActual === pagina
                                  ? `bg-gradient-to-r ${tema.colores.gradiente} text-white`
                                  : `${tema.colores.secundario} ${tema.colores.texto}`
                              }`}
                            >
                              {pagina}
                            </button>
                          );
                        } else if (pagina === paginaActual - 2 || pagina === paginaActual + 2) {
                          return (
                            <span key={pagina} className={tema.colores.textoSecundario}>
                              ...
                            </span>
                          );
                        }
                        return null;
                      })}

                      <button
                        onClick={() =>
                          setPaginaActual(Math.min(totalPaginas, paginaActual + 1))
                        }
                        disabled={paginaActual === totalPaginas}
                        className={`p-2 rounded-lg ${tema.colores.secundario} ${tema.colores.texto} disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200`}
                      >
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {ticketsPaginados.map((ticket, idx) => {
                  const IconoEstado = obtenerIconoEstado(ticket.estado);
                  const IconoPrioridad = obtenerIconoPrioridad(ticket.prioridad);

                  return (
                    <div
                      key={ticket.id_ticket}
                      className={`rounded-2xl p-6 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} transition-all duration-300 hover:scale-105 hover:-translate-y-2 cursor-pointer animate-slideUp`}
                      style={{ animationDelay: `${idx * 50}ms` }}
                      onClick={() => abrirDetalleTicket(ticket)}
                    >
                      {/* Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <p className={`text-sm font-bold ${tema.colores.acento} mb-1`}>
                            {ticket.numero_ticket}
                          </p>
                          <h4 className={`text-lg font-black ${tema.colores.texto} mb-2`}>
                            {ticket.titulo}
                          </h4>
                        </div>
                        <div className="flex items-center gap-2">
                          {ticket.es_urgente && (
                            <Flame className="w-5 h-5 text-red-400" />
                          )}
                          {ticket.es_reabierto && (
                            <RefreshCw className="w-5 h-5 text-yellow-400" />
                          )}
                        </div>
                      </div>

                      {/* Descripción */}
                      <p
                        className={`text-sm ${tema.colores.textoSecundario} mb-4 line-clamp-2`}
                      >
                        {ticket.descripcion}
                      </p>

                      {/* Badges */}
                      <div className="flex flex-wrap items-center gap-2 mb-4">
                        <span
                          className={`inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-bold border ${obtenerColorPrioridad(
                            ticket.prioridad
                          )}`}
                        >
                          <IconoPrioridad className="w-3 h-3" />
                          {ticket.prioridad.charAt(0).toUpperCase() +
                            ticket.prioridad.slice(1)}
                        </span>
                        <span
                          className={`inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-bold border ${obtenerColorEstado(
                            ticket.estado
                          )}`}
                        >
                          <IconoEstado className="w-3 h-3" />
                          {ticket.estado.replace("_", " ").charAt(0).toUpperCase() +
                            ticket.estado.replace("_", " ").slice(1)}
                        </span>
                      </div>

                      {/* Solicitante */}
                      <div className="flex items-center gap-3 mb-4 pb-4 border-b border-gray-700/30">
                        <div
                          className={`w-10 h-10 rounded-lg bg-gradient-to-br ${tema.colores.gradiente} flex items-center justify-center text-white font-bold`}
                        >
                          {ticket.usuario_solicitante.nombre[0]}
                          {ticket.usuario_solicitante.apellido_paterno[0]}
                        </div>
                        <div className="flex-1">
                          <p className={`text-sm font-bold ${tema.colores.texto}`}>
                            {ticket.usuario_solicitante.nombre}{" "}
                            {ticket.usuario_solicitante.apellido_paterno}
                          </p>
                          <p className={`text-xs ${tema.colores.textoSecundario}`}>
                            {ticket.centro.nombre}
                          </p>
                        </div>
                      </div>

                      {/* Footer */}
                      <div className="flex items-center justify-between">
                        <div>
                          <p className={`text-xs font-bold ${tema.colores.textoSecundario}`}>
                            {ticket.tiempo_resolucion_minutos
                              ? "Tiempo de resolución"
                              : "Tiempo transcurrido"}
                          </p>
                          <p className={`text-sm font-black ${tema.colores.texto}`}>
                            {ticket.tiempo_resolucion_minutos
                              ? formatearTiempo(ticket.tiempo_resolucion_minutos)
                              : calcularTiempoTranscurrido(ticket.fecha_creacion)}
                          </p>
                        </div>

                        {ticket.calificacion ? (
                          <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-4 h-4 ${
                                  i < ticket.calificacion!
                                    ? "text-yellow-400 fill-yellow-400"
                                    : "text-gray-600"
                                }`}
                              />
                            ))}
                          </div>
                        ) : (
                          <span className={`text-xs ${tema.colores.textoSecundario}`}>
                            Sin calificar
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </main>

      {/* MODAL DETALLE TICKET */}
      {modalDetalleAbierto && ticketSeleccionado && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
          <div
            className={`w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} animate-scaleIn custom-scrollbar`}
          >
            {/* Header Modal */}
            <div
              className={`sticky top-0 z-10 flex items-center justify-between p-6 border-b ${tema.colores.borde} ${tema.colores.card} backdrop-blur-xl`}
            >
              <div>
                <p className={`text-sm font-bold ${tema.colores.acento} mb-1`}>
                  {ticketSeleccionado.numero_ticket}
                </p>
                <h3 className={`text-2xl font-black ${tema.colores.texto}`}>
                  {ticketSeleccionado.titulo}
                </h3>
              </div>
              <button
                onClick={cerrarDetalleTicket}
                className={`p-2 rounded-lg ${tema.colores.hover} transition-all duration-200`}
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Body Modal */}
            <div className="p-6 space-y-6">
              {/* Badges */}
              <div className="flex flex-wrap items-center gap-3">
                <span
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold border ${obtenerColorPrioridad(
                    ticketSeleccionado.prioridad
                  )}`}
                >
                  {obtenerIconoPrioridad(ticketSeleccionado.prioridad)({
                    className: "w-4 h-4",
                  })}
                  Prioridad: {ticketSeleccionado.prioridad.toUpperCase()}
                </span>
                <span
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold border ${obtenerColorEstado(
                    ticketSeleccionado.estado
                  )}`}
                >
                  {obtenerIconoEstado(ticketSeleccionado.estado)({
                    className: "w-4 h-4",
                  })}
                  Estado: {ticketSeleccionado.estado.replace("_", " ").toUpperCase()}
                </span>
                {ticketSeleccionado.es_urgente && (
                  <span className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold bg-red-500/20 text-red-400 border border-red-500/30">
                    <Flame className="w-4 h-4" />
                    URGENTE
                  </span>
                )}
              </div>

              {/* Descripción */}
              <div>
                <h4 className={`text-lg font-black ${tema.colores.texto} mb-3`}>
                  Descripción
                </h4>
                <p className={`text-sm ${tema.colores.textoSecundario}`}>
                  {ticketSeleccionado.descripcion}
                </p>
              </div>

              {/* Información del Solicitante */}
              <div>
                <h4 className={`text-lg font-black ${tema.colores.texto} mb-3`}>
                  Solicitante
                </h4>
                <div className="flex items-center gap-4">
                  <div
                    className={`w-16 h-16 rounded-xl bg-gradient-to-br ${tema.colores.gradiente} flex items-center justify-center text-white font-bold text-xl shadow-lg`}
                  >
                    {ticketSeleccionado.usuario_solicitante.nombre[0]}
                    {ticketSeleccionado.usuario_solicitante.apellido_paterno[0]}
                  </div>
                  <div>
                    <p className={`text-lg font-bold ${tema.colores.texto}`}>
                      {ticketSeleccionado.usuario_solicitante.nombre}{" "}
                      {ticketSeleccionado.usuario_solicitante.apellido_paterno}
                    </p>
                    <p className={`text-sm ${tema.colores.textoSecundario}`}>
                      {ticketSeleccionado.usuario_solicitante.email}
                    </p>
                    <p className={`text-sm ${tema.colores.textoSecundario}`}>
                      {ticketSeleccionado.centro.nombre} - {ticketSeleccionado.centro.ciudad}
                    </p>
                  </div>
                </div>
              </div>

              {/* Detalles Técnicos */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className={`p-4 rounded-xl ${tema.colores.hover} border ${tema.colores.borde}`}>
                  <p className={`text-xs font-bold ${tema.colores.textoSecundario} mb-2`}>
                    Categoría
                  </p>
                  <p className={`text-sm font-black ${tema.colores.texto}`}>
                    {ticketSeleccionado.categoria}
                  </p>
                  {ticketSeleccionado.subcategoria && (
                    <p className={`text-xs ${tema.colores.textoSecundario} mt-1`}>
                      {ticketSeleccionado.subcategoria}
                    </p>
                  )}
                </div>

                <div className={`p-4 rounded-xl ${tema.colores.hover} border ${tema.colores.borde}`}>
                  <p className={`text-xs font-bold ${tema.colores.textoSecundario} mb-2`}>
                    Fecha de Creación
                  </p>
                  <p className={`text-sm font-black ${tema.colores.texto}`}>
                    {formatearFecha(ticketSeleccionado.fecha_creacion)}
                  </p>
                </div>

                {ticketSeleccionado.fecha_asignacion && (
                  <div className={`p-4 rounded-xl ${tema.colores.hover} border ${tema.colores.borde}`}>
                    <p className={`text-xs font-bold ${tema.colores.textoSecundario} mb-2`}>
                      Fecha de Asignación
                    </p>
                    <p className={`text-sm font-black ${tema.colores.texto}`}>
                      {formatearFecha(ticketSeleccionado.fecha_asignacion)}
                    </p>
                  </div>
                )}

                {ticketSeleccionado.fecha_resolucion && (
                  <div className={`p-4 rounded-xl ${tema.colores.hover} border ${tema.colores.borde}`}>
                    <p className={`text-xs font-bold ${tema.colores.textoSecundario} mb-2`}>
                      Fecha de Resolución
                    </p>
                    <p className={`text-sm font-black ${tema.colores.texto}`}>
                      {formatearFecha(ticketSeleccionado.fecha_resolucion)}
                    </p>
                  </div>
                )}

                {ticketSeleccionado.tiempo_resolucion_minutos && (
                  <div className={`p-4 rounded-xl ${tema.colores.hover} border ${tema.colores.borde}`}>
                    <p className={`text-xs font-bold ${tema.colores.textoSecundario} mb-2`}>
                      Tiempo de Resolución
                    </p>
                    <p className={`text-sm font-black ${tema.colores.texto}`}>
                      {formatearTiempo(ticketSeleccionado.tiempo_resolucion_minutos)}
                    </p>
                  </div>
                )}

                <div className={`p-4 rounded-xl ${tema.colores.hover} border ${tema.colores.borde}`}>
                  <p className={`text-xs font-bold ${tema.colores.textoSecundario} mb-2`}>
                    Archivos Adjuntos
                  </p>
                  <p className={`text-sm font-black ${tema.colores.texto}`}>
                    {ticketSeleccionado.archivos_adjuntos} archivo(s)
                  </p>
                </div>
              </div>

              {/* Calificación */}
              {ticketSeleccionado.calificacion && (
                <div>
                  <h4 className={`text-lg font-black ${tema.colores.texto} mb-3`}>
                    Calificación del Usuario
                  </h4>
                  <div className="flex items-center gap-2 mb-2">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-6 h-6 ${
                          i < ticketSeleccionado.calificacion!
                            ? "text-yellow-400 fill-yellow-400"
                            : "text-gray-600"
                        }`}
                      />
                    ))}
                    <span className={`text-xl font-black ${tema.colores.texto} ml-2`}>
                      {ticketSeleccionado.calificacion.toFixed(1)} / 5.0
                    </span>
                  </div>
                  {ticketSeleccionado.comentario_calificacion && (
                    <p className={`text-sm ${tema.colores.textoSecundario} italic`}>
                      "{ticketSeleccionado.comentario_calificacion}"
                    </p>
                  )}
                </div>
              )}

              {/* Tags */}
              {ticketSeleccionado.tags && ticketSeleccionado.tags.length > 0 && (
                <div>
                  <h4 className={`text-lg font-black ${tema.colores.texto} mb-3`}>
                    Etiquetas
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {ticketSeleccionado.tags.map((tag, idx) => (
                      <span
                        key={idx}
                        className={`inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-bold ${tema.colores.secundario} ${tema.colores.texto}`}
                      >
                        <Tag className="w-3 h-3" />
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Acciones */}
              <div className="flex flex-wrap items-center gap-3 pt-6 border-t border-gray-700/30">
                <button
                  className={`flex items-center gap-2 px-6 py-3 ${tema.colores.primario} text-white rounded-xl font-bold transition-all duration-300 hover:scale-105 ${tema.colores.sombra}`}
                >
                  <Edit className="w-5 h-5" />
                  Editar Ticket
                </button>
                <button
                  className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold ${tema.colores.secundario} ${tema.colores.texto} hover:scale-105 transition-all duration-300`}
                >
                  <MessageSquare className="w-5 h-5" />
                  Ver Comentarios ({ticketSeleccionado.comentarios_count})
                </button>
                <button
                  className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold ${tema.colores.secundario} ${tema.colores.texto} hover:scale-105 transition-all duration-300`}
                >
                  <Paperclip className="w-5 h-5" />
                  Ver Archivos ({ticketSeleccionado.archivos_adjuntos})
                </button>
                <button
                  className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold ${tema.colores.secundario} ${tema.colores.texto} hover:scale-105 transition-all duration-300`}
                >
                  <History className="w-5 h-5" />
                  Ver Historial
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* FOOTER */}
      <footer
        className={`transition-all duration-300 ${
          sidebarAbierto ? "ml-72" : "ml-20"
        } ${tema.colores.card} ${tema.colores.borde} border-t py-8 mt-12`}
      >
        <div className="max-w-[1920px] mx-auto px-8">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
            <div className="flex flex-col items-center lg:items-start gap-3">
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 bg-gradient-to-br ${tema.colores.gradiente} rounded-xl flex items-center justify-center shadow-lg`}
                >
                  <ClipboardList className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className={`text-sm font-black ${tema.colores.texto}`}>
                    AnyssaMed Tickets Pro
                  </p>
                  <p className={`text-xs ${tema.colores.textoSecundario}`}>
                    Sistema de Gestión de Tickets Premium
                  </p>
                </div>
              </div>
              <p
                className={`text-xs font-semibold ${tema.colores.textoSecundario}`}
              >
                © 2025 AnyssaMed. Todos los derechos reservados. v2.2.0
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-6">
              <Link
                href="/ayuda"
                className={`text-sm font-bold transition-all duration-200 ${tema.colores.textoSecundario} hover:${tema.colores.acento} flex items-center gap-2`}
              >
                <Lightbulb className="w-4 h-4" />
                Ayuda
              </Link>
              <Link
                href="/documentacion"
                className={`text-sm font-bold transition-all duration-200 ${tema.colores.textoSecundario} hover:${tema.colores.acento} flex items-center gap-2`}
              >
                <BookOpen className="w-4 h-4" />
                Documentación
              </Link>
              <Link
                href="/privacidad"
                className={`text-sm font-bold transition-all duration-200 ${tema.colores.textoSecundario} hover:${tema.colores.acento} flex items-center gap-2`}
              >
                <Shield className="w-4 h-4" />
                Privacidad
              </Link>
              <button
                onClick={cerrarSesion}
                className={`text-sm font-bold transition-all duration-200 ${tema.colores.textoSecundario} hover:text-red-400 flex items-center gap-2`}
              >
                <LogOut className="w-4 h-4" />
                Cerrar Sesión
              </button>
            </div>

            <div className="flex items-center gap-3">
              <span
                className={`px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r ${tema.colores.gradiente} text-white shadow-lg animate-pulse`}
              >
                PREMIUM
              </span>
              <span
                className={`px-4 py-2 rounded-xl text-xs font-bold ${tema.colores.secundario} ${tema.colores.texto}`}
              >
                Build 2025.01
              </span>
            </div>
          </div>

          {/* Barra de estado */}
          <div className="mt-6 pt-6 border-t border-gray-700/30">
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <p className={`text-xs font-bold ${tema.colores.texto}`}>Sistema</p>
                </div>
                <p className={`text-xs ${tema.colores.textoSecundario}`}>Operativo</p>
              </div>

              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <Database className="w-3 h-3 text-blue-400" />
                  <p className={`text-xs font-bold ${tema.colores.texto}`}>Base de Datos</p>
                </div>
                <p className={`text-xs ${tema.colores.textoSecundario}`}>Conectada</p>
              </div>

              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <Zap className="w-3 h-3 text-yellow-400" />
                  <p className={`text-xs font-bold ${tema.colores.texto}`}>API</p>
                </div>
                <p className={`text-xs ${tema.colores.textoSecundario}`}>Activa</p>
              </div>

              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <Shield className="w-3 h-3 text-green-400" />
                  <p className={`text-xs font-bold ${tema.colores.texto}`}>Seguridad</p>
                </div>
                <p className={`text-xs ${tema.colores.textoSecundario}`}>SSL Activo</p>
              </div>

              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <ClipboardList className="w-3 h-3 text-indigo-400" />
                  <p className={`text-xs font-bold ${tema.colores.texto}`}>Tickets</p>
                </div>
                <p className={`text-xs ${tema.colores.textoSecundario}`}>
                  {estadisticasTickets.total}
                </p>
              </div>

              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <Clock className="w-3 h-3 text-purple-400" />
                  <p className={`text-xs font-bold ${tema.colores.texto}`}>
                    Última Actualización
                  </p>
                </div>
                <p className={`text-xs ${tema.colores.textoSecundario}`}>
                  {new Date().toLocaleTimeString("es-CL", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* ESTILOS GLOBALES PREMIUM */}
      <style jsx global>{`
        @import url("https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap");

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

        /* Scrollbar Premium */
        .custom-scrollbar::-webkit-scrollbar {
          width: 10px;
          height: 10px;
        }

        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.1);
          border-radius: 10px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(
            180deg,
            rgba(99, 102, 241, 0.8),
            rgba(168, 85, 247, 0.8)
          );
          border-radius: 10px;
          transition: all 0.3s ease;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(
            180deg,
            rgba(99, 102, 241, 1),
            rgba(168, 85, 247, 1)
          );
          box-shadow: 0 0 10px rgba(99, 102, 241, 0.5);
        }

        .custom-scrollbar {
          scrollbar-color: rgba(99, 102, 241, 0.8) rgba(0, 0, 0, 0.1);
          scrollbar-width: thin;
        }

        /* Animaciones Premium */
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
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

        @keyframes pulse {
          0%,
          100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        @keyframes bounce {
          0%,
          100% {
            transform: translateY(-25%);
            animation-timing-function: cubic-bezier(0.8, 0, 1, 1);
          }
          50% {
            transform: translateY(0);
            animation-timing-function: cubic-bezier(0, 0, 0.2, 1);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.6s ease-out forwards;
        }

        .animate-slideUp {
          animation: slideUp 0.6s ease-out forwards;
        }

        .animate-slideDown {
          animation: slideDown 0.4s ease-out forwards;
        }

        .animate-scaleIn {
          animation: scaleIn 0.4s ease-out forwards;
        }

        .animate-shimmer {
          animation: shimmer 2s linear infinite;
          background: linear-gradient(
            90deg,
            rgba(255, 255, 255, 0) 0%,
            rgba(255, 255, 255, 0.1) 50%,
            rgba(255, 255, 255, 0) 100%
          );
          background-size: 1000px 100%;
        }

        .animate-pulse {
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }

        .animate-spin {
          animation: spin 1s linear infinite;
        }

        .animate-bounce {
          animation: bounce 1s infinite;
        }

        /* Line Clamp */
        .line-clamp-1 {
          overflow: hidden;
          display: -webkit-box;
          -webkit-box-orient: vertical;
          -webkit-line-clamp: 1;
        }

        .line-clamp-2 {
          overflow: hidden;
          display: -webkit-box;
          -webkit-box-orient: vertical;
          -webkit-line-clamp: 2;
        }

        .line-clamp-3 {
          overflow: hidden;
          display: -webkit-box;
          -webkit-box-orient: vertical;
          -webkit-line-clamp: 3;
        }

        /* Glassmorphism */
        .glass-effect {
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        /* Hover Effects */
        .hover-lift {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .hover-lift:hover {
          transform: translateY(-8px) scale(1.02);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
        }

        /* Gradientes Animados */
        .gradient-animate {
          background: linear-gradient(
            -45deg,
            #6366f1,
            #8b5cf6,
            #ec4899,
            #f59e0b
          );
          background-size: 400% 400%;
          animation: gradientShift 15s ease infinite;
        }

        @keyframes gradientShift {
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

        /* Text Effects */
        .text-gradient {
          background: linear-gradient(
            135deg,
            #667eea 0%,
            #764ba2 50%,
            #f093fb 100%
          );
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .text-glow {
          text-shadow: 0 0 10px rgba(99, 102, 241, 0.5),
            0 0 20px rgba(99, 102, 241, 0.3);
        }

        /* Selection */
        ::selection {
          background: rgba(99, 102, 241, 0.3);
          color: white;
        }

        ::-moz-selection {
          background: rgba(99, 102, 241, 0.3);
          color: white;
        }

        /* Focus States */
        *:focus {
          outline: 2px solid rgba(99, 102, 241, 0.5);
          outline-offset: 2px;
        }

        *:focus:not(:focus-visible) {
          outline: none;
        }

        *:focus-visible {
          outline: 2px solid rgba(99, 102, 241, 0.8);
          outline-offset: 2px;
          box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.2);
        }

        /* Tooltips */
        [data-tooltip] {
          position: relative;
        }

        [data-tooltip]::before {
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
          transition: all 0.3s ease;
          z-index: 1000;
        }

        [data-tooltip]:hover::before {
          opacity: 1;
        }

        /* Loading Spinner */
        .loading-spinner {
          border: 3px solid rgba(99, 102, 241, 0.1);
          border-top-color: rgba(99, 102, 241, 0.8);
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        /* Card Effects */
        .card-premium {
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          overflow: hidden;
        }

        .card-premium::before {
          content: "";
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(255, 255, 255, 0.1),
            transparent
          );
          transition: left 0.5s ease;
        }

        .card-premium:hover::before {
          left: 100%;
        }

        .card-premium:hover {
          transform: translateY(-8px) scale(1.02);
          box-shadow: 0 20px 40px rgba(99, 102, 241, 0.3);
        }

        /* Badge Premium */
        .badge-premium {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          border-radius: 9999px;
          font-size: 12px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
          animation: badgePulse 2s ease-in-out infinite;
        }

        @keyframes badgePulse {
          0%,
          100% {
            box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
          }
          50% {
            box-shadow: 0 6px 20px rgba(102, 126, 234, 0.6);
          }
        }

        /* Progress Bar */
        .progress-bar-premium {
          position: relative;
          height: 8px;
          background: rgba(99, 102, 241, 0.1);
          border-radius: 9999px;
          overflow: hidden;
        }

        .progress-bar-premium::before {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          height: 100%;
          background: linear-gradient(
            90deg,
            #667eea 0%,
            #764ba2 50%,
            #f093fb 100%
          );
          border-radius: 9999px;
          transition: width 1s cubic-bezier(0.4, 0, 0.2, 1);
        }

        /* Button Effects */
        .btn-premium {
          position: relative;
          overflow: hidden;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .btn-premium::before {
          content: "";
          position: absolute;
          top: 50%;
          left: 50%;
          width: 0;
          height: 0;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.2);
          transform: translate(-50%, -50%);
          transition: width 0.6s ease, height 0.6s ease;
        }

        .btn-premium:hover::before {
          width: 300px;
          height: 300px;
        }

        .btn-premium:active {
          transform: scale(0.95);
        }

        /* Table Premium */
        .table-premium {
          border-collapse: separate;
          border-spacing: 0;
        }

        .table-premium thead tr {
          background: linear-gradient(
            135deg,
            rgba(99, 102, 241, 0.1) 0%,
            rgba(168, 85, 247, 0.1) 100%
          );
        }

        .table-premium tbody tr {
          transition: all 0.3s ease;
        }

        .table-premium tbody tr:hover {
          background: rgba(99, 102, 241, 0.05);
          transform: scale(1.01);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        /* Modal Effects */
        .modal-overlay {
          background: rgba(0, 0, 0, 0.7);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
        }

        .modal-content {
          animation: modalSlideUp 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }

        @keyframes modalSlideUp {
          from {
            opacity: 0;
            transform: translateY(50px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        /* Responsive Design */
        @media (max-width: 1536px) {
          .container-premium {
            max-width: 1280px;
          }
        }

        @media (max-width: 1280px) {
          .container-premium {
            max-width: 1024px;
          }
        }

        @media (max-width: 1024px) {
          .container-premium {
            max-width: 768px;
          }
        }

        @media (max-width: 768px) {
          .container-premium {
            max-width: 640px;
            padding: 0 1rem;
          }

          .hide-mobile {
            display: none;
          }

          .show-mobile {
            display: block;
          }
        }

        @media (max-width: 640px) {
          .container-premium {
            max-width: 100%;
            padding: 0 0.75rem;
          }
        }

        /* Print Styles */
        @media print {
          .no-print {
            display: none !important;
          }

          body {
            background: white !important;
            color: black !important;
          }

          .print-break {
            page-break-after: always;
          }

          .print-avoid-break {
            page-break-inside: avoid;
          }

          * {
            box-shadow: none !important;
            text-shadow: none !important;
          }
        }

        /* Accessibility */
        @media (prefers-reduced-motion: reduce) {
          *,
          *::before,
          *::after {
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

        @media (prefers-contrast: high) {
          * {
            border-width: 2px !important;
          }

          .text-gradient {
            -webkit-text-fill-color: currentColor;
            background: none;
          }
        }

        /* Performance Optimizations */
        .will-change-transform {
          will-change: transform;
        }

        .will-change-opacity {
          will-change: opacity;
        }

        .gpu-accelerated {
          transform: translateZ(0);
          backface-visibility: hidden;
          perspective: 1000px;
        }
      `}</style>
    </div>
  );
}
