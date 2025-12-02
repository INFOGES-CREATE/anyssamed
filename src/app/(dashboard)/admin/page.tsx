// frontend/src/app/(dashboard)/admin/page.tsx
"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { ShieldCheck, User, ClipboardList, Wrench } from "lucide-react";

import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
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
  Funnel,
  FunnelChart,
  Surface,
} from "recharts";
import {
  Users,
  Building2,
  Stethoscope,
  UserPlus,
  Activity,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  Calendar,
  FileText,
  Shield,
  Server,
  Database,
  Wifi,
  RefreshCw,
  Download,
  Search,
  Star,
  Award,
  Zap,
  Bell,
  Settings,
  ArrowLeft,
  Video,
  Pill,
  BarChart3,
  Receipt,
  TestTube,
  Eye,
  ChevronRight,
  Sparkles,
  TrendingDown,
  Heart,
  Moon,
  Sun,
  LogOut,
  ChevronDown,
  Menu,
  X as CloseIcon,
  Filter,
  Download as DownloadIcon,
  Share2,
  Maximize2,
  Grid3x3,
  List,
  MoreVertical,
  Bookmark,
  Flag,
  Zap as Lightning,
  Cpu,
  HardDrive,
  Network,
  Gauge,
  TrendingUp as TrendUp,
  BarChart as BarChartIcon,
  PieChart as PieChartIcon,
  LineChart as LineChartIcon,
  GitBranch,
  Target,
  Layers,
  Map,
  Navigation,
  Compass,
  Crosshair,
  Hexagon,
  Infinity,
  Maximize,
  Volume2,
  WifiOff,
} from "lucide-react";
import Link from "next/link";

// ==================== INTERFACES ====================
interface Estadisticas {
  total_centros: number;
  centros_activos: number;
  centros_inactivos: number;
  centros_suspendidos: number;
  total_usuarios: number;
  usuarios_activos: number;
  usuarios_bloqueados: number;
  usuarios_pendientes: number;
  total_medicos: number;
  medicos_activos: number;
  total_especialidades: number;
  total_pacientes: number;
  pacientes_activos: number;
  nuevos_pacientes_mes: number;
  consultas_hoy: number;
  consultas_mes: number;
  consultas_ano: number;
  ingresos_mes: number;
  ingresos_ano: number;
  pendiente_cobro: number;
  usuarios_conectados: number;
  uptime_sistema: number;
  espacio_usado_gb: number;
  espacio_total_gb: number;
  satisfaccion_promedio: number;
  tiempo_espera_promedio: number;
  tasa_cancelacion: number;
  tasa_ocupacion: number;
  eficiencia_medicos: number;
  retorno_pacientes: number;
  costo_promedio_consulta: number;
  margen_ganancia: number;
  velocidad_respuesta_ms: number;
}

interface CentroMedico {
  id_centro: number;
  nombre: string;
  tipo_centro: string;
  direccion: string;
  ciudad: string;
  telefono: string;
  email: string;
  estado: string;
  usuarios_count: number;
  pacientes_count: number;
  consultas_mes: number;
  ultima_actividad: string;
  plan: string;
  satisfaccion: number;
  capacidad_pacientes_dia: number;
}

interface Usuario {
  id_usuario: number;
  nombre: string;
  apellido_paterno: string;
  apellido_materno: string;
  email: string;
  telefono: string;
  estado: string;
  fecha_creacion: string;
  ultimo_acceso: string;
  rol_nombre: string;
  rol_nivel: number;
  centro_nombre: string;
  sucursal_nombre: string;
  tipo_usuario: string;
}

interface Medico {
  id_profesional: number;
  nombre_completo: string;
  especialidad_principal: string;
  centro_nombre: string;
  pacientes_activos: number;
  consultas_mes: number;
  calificacion_promedio: number;
  anos_experiencia: number;
  estado: string;
  cedula_profesional: string;
  universidad_origen: string;
}

interface Actividad {
  id_log: number;
  usuario_nombre: string;
  centro_nombre: string;
  accion: string;
  modulo: string;
  descripcion: string;
  ip_address: string;
  fecha_hora: string;
  nivel: string;
}

interface Alerta {
  id: string;
  tipo: "error" | "advertencia" | "info" | "exito";
  titulo: string;
  mensaje: string;
  timestamp: string;
  leida: boolean;
  modulo: string;
  accion_requerida?: string;
  prioridad: number;
}

interface DashboardData {
  success: boolean;
  estadisticas: Estadisticas;
  centros: CentroMedico[];
  usuarios: Usuario[];
  medicos: Medico[];
  actividades: Actividad[];
  alertas: Alerta[];
  timestamp: string;
}

interface ChartDataPoint {
  name: string;
  value: number;
  fill?: string;
  [key: string]: any;
}

// ==================== COMPONENTES REUTILIZABLES ====================

interface KPICardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  gradient: string;
  trend?: number;
  subtitle?: string;
  details?: { label: string; value: string | number; color: string }[];
  darkMode: boolean;
  onClick?: () => void;
  badge?: string;
  badgeColor?: string;
}

const KPICard: React.FC<KPICardProps> = ({
  title,
  value,
  icon,
  gradient,
  trend,
  subtitle,
  details,
  darkMode,
  onClick,
  badge,
  badgeColor,
}) => (
  <div
    onClick={onClick}
    className={`relative overflow-hidden rounded-2xl md:rounded-3xl p-6 md:p-8 shadow-2xl transition-all duration-500 group hover:scale-105 border cursor-pointer ${
      darkMode
        ? `bg-gradient-to-br ${gradient} border-opacity-20 border-white/10`
        : `bg-gradient-to-br ${gradient} border-opacity-20 border-white/30`
    }`}
  >
    <div
      className={`absolute top-0 right-0 w-24 h-24 md:w-32 md:h-32 rounded-full blur-3xl transition-all duration-500 ${
        darkMode ? "bg-white/10 group-hover:bg-white/20" : "bg-white/20 group-hover:bg-white/40"
      }`}
    ></div>

    <div className="relative z-10">
      <div className="flex items-center justify-between mb-4 md:mb-6">
        <div className="text-white/80">{icon}</div>
        {badge && (
          <span className={`px-3 py-1 rounded-full text-xs font-bold ${badgeColor}`}>
            {badge}
          </span>
        )}
      </div>

      <div className={`text-3xl md:text-4xl font-black mb-2 text-white`}>{value}</div>
      <p className="text-white/90 text-xs md:text-sm font-bold mb-4">{title}</p>

      {trend !== undefined && (
        <div className="flex items-center gap-2 text-xs font-semibold text-white/80 mb-4">
          {trend >= 0 ? (
            <TrendingUp className="w-4 h-4 text-green-300" />
          ) : (
            <TrendingDown className="w-4 h-4 text-red-300" />
          )}
          <span>{trend >= 0 ? "+" : ""}{trend}%</span>
        </div>
      )}

      {details && details.length > 0 && (
        <div className="space-y-2 pt-4 border-t border-white/20">
          {details.map((detail, idx) => (
            <div key={idx} className="flex items-center justify-between text-xs">
              <span className="text-white/70">{detail.label}</span>
              <span className={`font-bold ${detail.color}`}>{detail.value}</span>
            </div>
          ))}
        </div>
      )}

      {subtitle && (
        <p className="text-white/70 text-xs mt-3 italic">{subtitle}</p>
      )}
    </div>

    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
  </div>
);

interface ChartCardProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  darkMode: boolean;
  icon?: React.ReactNode;
  actions?: React.ReactNode;
  fullHeight?: boolean;
}

const ChartCard: React.FC<ChartCardProps> = ({
  title,
  description,
  children,
  darkMode,
  icon,
  actions,
  fullHeight = false,
}) => (
  <div
    className={`rounded-2xl md:rounded-3xl p-6 md:p-8 shadow-2xl border transition-all duration-300 hover:shadow-blue-500/20 ${
      darkMode
        ? "bg-gray-800/50 border-gray-700 hover:border-indigo-500/50"
        : "bg-white border-gray-200 hover:border-indigo-300"
    } ${fullHeight ? "h-full" : ""}`}
  >
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-3">
        {icon && <div className="text-indigo-500">{icon}</div>}
        <div>
          <h3
            className={`text-lg md:text-xl font-black ${
              darkMode ? "text-white" : "text-gray-900"
            }`}
          >
            {title}
          </h3>
          {description && (
            <p className={`text-xs md:text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
              {description}
            </p>
          )}
        </div>
      </div>
      {actions && <div className="flex gap-2">{actions}</div>}
    </div>
    <div className="overflow-x-auto">{children}</div>
  </div>
);

// ==================== COMPONENTE PRINCIPAL ====================

export default function AdminDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState("7d");
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [selectedTab, setSelectedTab] = useState<"overview" | "analytics" | "advanced" | "reports">("overview");
  const [darkMode, setDarkMode] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedMetric, setSelectedMetric] = useState<string | null>(null);
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());
  const [filterActive, setFilterActive] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [fullscreenChart, setFullscreenChart] = useState<string | null>(null);

  const currentUser = {
    nombre: "Admin",
    apellido: "Principal",
    email: "admin@medisuite.com",
    rol: "Super Administrador",
    avatar: null,
    departamento: "Administración",
    ultimaActividad: new Date(),
  };

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `/api/admin/dashboard?timeRange=${timeRange}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();

      if (result.success) {
        setData(result);
        setLastUpdate(new Date());
      } else {
        throw new Error(result.error || "Error al cargar datos");
      }
    } catch (err: any) {
      console.error("Error fetching dashboard:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [timeRange]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (autoRefresh) {
      interval = setInterval(() => {
        fetchDashboardData();
      }, 30000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh, fetchDashboardData]);

  // ==================== FUNCIONES UTILITARIAS ====================

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat("es-CL", {
      style: "currency",
      currency: "CLP",
    }).format(amount);
  };

  const formatNumber = (num: number): string => {
    return new Intl.NumberFormat("es-CL").format(num);
  };

  const formatDate = (dateString: string): string => {
    return new Intl.DateTimeFormat("es-CL", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(dateString));
  };

  const getTimeAgo = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 1) return "Justo ahora";
    if (minutes < 60) return `Hace ${minutes} min`;
    if (hours < 24) return `Hace ${hours} h`;
    return `Hace ${days} d`;
  };

  const getAlertColor = (tipo: string): string => {
    if (darkMode) {
      switch (tipo) {
        case "error":
          return "bg-gradient-to-r from-red-900/50 to-pink-900/50 border-red-500/50 text-red-200";
        case "advertencia":
          return "bg-gradient-to-r from-yellow-900/50 to-amber-900/50 border-yellow-500/50 text-yellow-200";
        case "info":
          return "bg-gradient-to-r from-blue-900/50 to-cyan-900/50 border-blue-500/50 text-blue-200";
        case "exito":
          return "bg-gradient-to-r from-green-900/50 to-emerald-900/50 border-green-500/50 text-green-200";
        default:
          return "bg-gradient-to-r from-gray-800/50 to-slate-800/50 border-gray-500/50 text-gray-200";
      }
    } else {
      switch (tipo) {
        case "error":
          return "bg-gradient-to-r from-red-50 to-pink-50 border-red-200 text-red-800";
        case "advertencia":
          return "bg-gradient-to-r from-yellow-50 to-amber-50 border-yellow-200 text-yellow-800";
        case "info":
          return "bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200 text-blue-800";
        case "exito":
          return "bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 text-green-800";
        default:
          return "bg-gradient-to-r from-gray-50 to-slate-50 border-gray-200 text-gray-800";
      }
    }
  };

  const getAlertIcon = (tipo: string) => {
    switch (tipo) {
      case "error":
        return <XCircle className="w-5 h-5" />;
      case "advertencia":
        return <AlertTriangle className="w-5 h-5" />;
      case "info":
        return <Activity className="w-5 h-5" />;
      case "exito":
        return <CheckCircle2 className="w-5 h-5" />;
      default:
        return <Bell className="w-5 h-5" />;
    }
  };

  const exportData = (format: "json" | "csv" | "pdf" = "json") => {
    if (!data) return;

    const exportObj = {
      fecha_exportacion: new Date().toISOString(),
      formato: format,
      estadisticas: data.estadisticas,
      resumen: {
        total_centros: data.centros.length,
        total_usuarios: data.usuarios.length,
        total_medicos: data.medicos.length,
        total_actividades: data.actividades.length,
      },
    };

    const dataStr = JSON.stringify(exportObj, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `dashboard-admin-${new Date().getTime()}.${format}`;
    link.click();
  };

  const getCurrentHour = (): string => {
    const hour = new Date().getHours();
    if (hour < 12) return "Buenos días";
    if (hour < 19) return "Buenas tardes";
    return "Buenas noches";
  };

  const toggleCardExpand = (cardId: string) => {
    const newExpanded = new Set(expandedCards);
    if (newExpanded.has(cardId)) {
      newExpanded.delete(cardId);
    } else {
      newExpanded.add(cardId);
    }
    setExpandedCards(newExpanded);
  };

  // ==================== DATOS PARA GRÁFICOS ====================

  const chartData: ChartDataPoint[] = useMemo(() => [
    { name: "Lun", value: 240, consultas: 24, pacientes: 2400 },
    { name: "Mar", value: 321, consultas: 13, pacientes: 2210 },
    { name: "Mié", value: 200, consultas: 29, pacientes: 2290 },
    { name: "Jue", value: 278, consultas: 39, pacientes: 2000 },
    { name: "Vie", value: 189, consultas: 23, pacientes: 2181 },
    { name: "Sáb", value: 239, consultas: 34, pacientes: 2500 },
    { name: "Dom", value: 349, consultas: 43, pacientes: 2100 },
  ], []);

  const pieData: ChartDataPoint[] = useMemo(() => [
    { name: "Consultas", value: 400, fill: "#3b82f6" },
    { name: "Exámenes", value: 300, fill: "#8b5cf6" },
    { name: "Recetas", value: 200, fill: "#ec4899" },
    { name: "Otros", value: 100, fill: "#f59e0b" },
  ], []);

  const radarData: ChartDataPoint[] = useMemo(() => [
    { name: "Calidad", value: 85, fullMark: 100 },
    { name: "Velocidad", value: 90, fullMark: 100 },
    { name: "Satisfacción", value: 88, fullMark: 100 },
    { name: "Eficiencia", value: 92, fullMark: 100 },
    { name: "Disponibilidad", value: 95, fullMark: 100 },
  ], []);

  const quickAccessButtons = [
    {
      title: "Centros Médicos",
      description: "Gestionar centros de salud",
      icon: <Building2 className="w-6 h-6" />,
      href: "/admin/centros",
      gradient: "from-blue-500 via-blue-600 to-indigo-600",
      count: data?.estadisticas.total_centros,
      badge: "Centros",
      badgeColor: "bg-blue-100 text-blue-700",
    },
    {
      title: "Usuarios",
      description: "Control de usuarios del sistema",
      icon: <Users className="w-6 h-6" />,
      href: "/admin/usuarios",
      gradient: "from-purple-500 via-purple-600 to-pink-600",
      count: data?.estadisticas.total_usuarios,
      badge: "Usuarios",
      badgeColor: "bg-purple-100 text-purple-700",
    },
    {
      title: "Profesionales Médicos",
      description: "Personal médico y especialidades",
      icon: <Stethoscope className="w-6 h-6" />,
      href: "/admin/medicos",
      gradient: "from-green-500 via-emerald-600 to-teal-600",
      count: data?.estadisticas.total_medicos,
      badge: "Médicos",
      badgeColor: "bg-green-100 text-green-700",
    },
    {
      title: "Pacientes",
      description: "Base de datos de pacientes",
      icon: <UserPlus className="w-6 h-6" />,
      href: "/admin/pacientes",
      gradient: "from-orange-500 via-orange-600 to-red-600",
      count: data?.estadisticas.total_pacientes,
      badge: "Pacientes",
      badgeColor: "bg-orange-100 text-orange-700",
    },
    {
      title: "Citas Médicas",
      description: "Agendamiento y calendario",
      icon: <Calendar className="w-6 h-6" />,
      href: "/admin/citas",
      gradient: "from-cyan-500 via-blue-600 to-indigo-600",
      count: data?.estadisticas.consultas_hoy,
      badge: "Hoy",
      badgeColor: "bg-cyan-100 text-cyan-700",
    },
    {
      title: "Historial Clínico",
      description: "Expedientes médicos electrónicos",
      icon: <FileText className="w-6 h-6" />,
      href: "/admin/historial-clinico",
      gradient: "from-indigo-500 via-purple-600 to-pink-600",
      badge: "EMR",
      badgeColor: "bg-indigo-100 text-indigo-700",
    },
    {
      title: "Facturación",
      description: "Gestión financiera y cobros",
      icon: <Receipt className="w-6 h-6" />,
      href: "/admin/facturacion",
      gradient: "from-emerald-500 via-green-600 to-teal-600",
      count: data?.estadisticas.ingresos_mes,
      badge: "Ingresos",
      badgeColor: "bg-emerald-100 text-emerald-700",
      isCurrency: true,
    },
    {
      title: "Recetas Médicas",
      description: "Prescripciones y medicamentos",
      icon: <Pill className="w-6 h-6" />,
      href: "/admin/recetas-medicas",
      gradient: "from-pink-500 via-rose-600 to-red-600",
      badge: "Recetas",
      badgeColor: "bg-pink-100 text-pink-700",
    },
    {
      title: "Exámenes",
      description: "Órdenes y resultados de laboratorio",
      icon: <TestTube className="w-6 h-6" />,
      href: "/admin/examenes-medicos",
      gradient: "from-violet-500 via-purple-600 to-fuchsia-600",
      badge: "Lab",
      badgeColor: "bg-violet-100 text-violet-700",
    },
    {
      title: "Telemedicina",
      description: "Consultas virtuales y videollamadas",
      icon: <Video className="w-6 h-6" />,
      href: "/admin/telemedicina-sesiones",
      gradient: "from-sky-500 via-blue-600 to-indigo-600",
      badge: "Virtual",
      badgeColor: "bg-sky-100 text-sky-700",
    },
    {
      title: "Analytics & BI",
      description: "Reportes e inteligencia de negocios",
      icon: <BarChart3 className="w-6 h-6" />,
      href: "/admin/bi-dashboards",
      gradient: "from-amber-500 via-orange-600 to-red-600",
      badge: "BI",
      badgeColor: "bg-amber-100 text-amber-700",
    },
    {
  title: "Roles y Permisos",
  description: "Control de acceso y seguridad",
  icon: <ShieldCheck className="w-6 h-6" />,
  href: "/admin/roles",
  gradient: "from-slate-500 via-gray-600 to-zinc-600",
  badge: "Seguridad",
  badgeColor: "bg-slate-100 text-slate-700",
},
{
  title: "Secretarias",
  description: "Gestión de personal administrativo",
  icon: <User className="w-6 h-6" />,
  href: "/admin/secretarias",
  gradient: "from-blue-500 via-indigo-600 to-violet-600",
  badge: "Personal",
  badgeColor: "bg-blue-100 text-blue-700",
},
{
  title: "Administrativos",
  description: "Coordinación y tareas internas",
  icon: <ClipboardList className="w-6 h-6" />,
  href: "/admin/administrativos",
  gradient: "from-teal-500 via-cyan-600 to-sky-600",
  badge: "Gestión",
  badgeColor: "bg-teal-100 text-teal-700",
},
{
  title: "Técnicos",
  description: "Soporte, mantenimiento y operaciones",
  icon: <Wrench className="w-6 h-6" />,
  href: "/admin/tecnicos",
  gradient: "from-amber-500 via-orange-600 to-red-600",
  badge: "Operaciones",
  badgeColor: "bg-amber-100 text-amber-700",
},

   
  ];

  // ==================== LOADING STATE ====================

  if (loading && !data) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center p-4 ${
          darkMode
            ? "bg-gradient-to-br from-slate-950 via-indigo-950 to-purple-950"
            : "bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50"
        }`}
      >
        <div className="text-center">
          <div className="relative mb-8">
            <div
              className={`w-24 h-24 border-4 rounded-full animate-spin ${
                darkMode
                  ? "border-indigo-400 border-t-transparent"
                  : "border-indigo-600 border-t-transparent"
              }`}
            ></div>
            <Sparkles
              className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-10 h-10 ${
                darkMode ? "text-indigo-400" : "text-indigo-600"
              } animate-pulse`}
            />
          </div>
          <h2
            className={`text-2xl md:text-3xl font-black mb-3 ${
              darkMode ? "text-white" : "text-gray-900"
            }`}
          >
            Cargando Dashboard Premium
          </h2>
          <p
            className={`text-sm md:text-base ${
              darkMode ? "text-indigo-300" : "text-indigo-600"
            } font-medium`}
          >
            Obteniendo datos del sistema...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center p-4 ${
          darkMode
            ? "bg-gradient-to-br from-slate-950 via-indigo-950 to-purple-950"
            : "bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50"
        }`}
      >
        <div
          className={`rounded-3xl shadow-2xl p-6 md:p-8 max-w-md w-full border ${
            darkMode
              ? "bg-gray-900/50 backdrop-blur-xl border-red-500/20"
              : "bg-white border-red-200"
          }`}
        >
          <div
            className={`flex items-center justify-center w-20 h-20 rounded-full mx-auto mb-6 ${
              darkMode ? "bg-red-500/20" : "bg-red-100"
            }`}
          >
            <XCircle
              className={`w-10 h-10 ${
                darkMode ? "text-red-400" : "text-red-600"
              }`}
            />
          </div>
          <h2
            className={`text-2xl md:text-3xl font-black text-center mb-3 ${
              darkMode ? "text-white" : "text-gray-900"
            }`}
          >
            Error al cargar datos
          </h2>
          <p
            className={`text-center mb-8 ${
              darkMode ? "text-red-300" : "text-red-600"
            } font-medium`}
          >
            {error}
          </p>
          <button
            onClick={fetchDashboardData}
            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold py-4 px-8 rounded-xl transition-all duration-300 flex items-center justify-center gap-3 shadow-lg hover:scale-105"
          >
            <RefreshCw className="w-6 h-6" />
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const { estadisticas, centros, usuarios, medicos, actividades, alertas } = data;

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${
        darkMode
          ? "bg-gradient-to-br from-slate-950 via-indigo-950 to-purple-950"
          : "bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50"
      }`}
    >
      {/* ==================== HEADER PREMIUM ====================  */}
      <div
        className={`sticky top-0 z-50 backdrop-blur-xl border-b shadow-2xl transition-colors duration-300 ${
          darkMode
            ? "bg-gray-900/80 border-gray-800"
            : "bg-white/80 border-gray-200"
        }`}
      >
        <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Logo y Título */}
            <div className="flex items-center gap-3 md:gap-6">
              <Link
                href="/"
                className={`flex items-center gap-2 md:gap-3 px-3 md:px-4 py-2 rounded-xl transition-all duration-300 group ${
                  darkMode ? "hover:bg-gray-800" : "hover:bg-gray-100"
                }`}
              >
                <ArrowLeft
                  className={`w-4 h-4 md:w-5 md:h-5 transition-colors ${
                    darkMode
                      ? "text-indigo-400 group-hover:text-white"
                      : "text-indigo-600 group-hover:text-indigo-800"
                  }`}
                />
                <span
                  className={`text-xs md:text-sm font-semibold hidden sm:inline transition-colors ${
                    darkMode
                      ? "text-indigo-400 group-hover:text-white"
                      : "text-indigo-600 group-hover:text-indigo-800"
                  }`}
                >
                  Volver
                </span>
              </Link>

              <div
                className={`h-6 md:h-8 w-px hidden sm:block ${
                  darkMode ? "bg-gray-700" : "bg-gray-300"
                }`}
              ></div>

              <div className="flex items-center gap-2 md:gap-4">
                <div className="w-10 h-10 md:w-14 md:h-14 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-xl md:rounded-2xl flex items-center justify-center shadow-lg relative overflow-hidden">
                  <Shield className="w-5 h-5 md:w-8 md:h-8 text-white relative z-10" />
                  <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                </div>
                <div className="hidden md:block">
                  <h1
                    className={`text-xl md:text-2xl font-black tracking-tight ${
                      darkMode ? "text-white" : "text-gray-900"
                    }`}
                  >
                    Dashboard Premium
                  </h1>
                  <p
                    className={`text-xs font-medium ${
                      darkMode ? "text-indigo-400" : "text-indigo-600"
                    }`}
                  >
                    Panel de Control Administrativo
                  </p>
                </div>
              </div>
            </div>

            {/* Desktop Actions */}
            <div className="hidden lg:flex items-center gap-3">
              {/* Search */}
              <div
                className={`relative hidden xl:flex items-center px-4 py-2.5 rounded-xl border transition-all duration-300 ${
                  darkMode
                    ? "bg-gray-800 border-gray-700 focus-within:border-indigo-500"
                    : "bg-white border-gray-200 focus-within:border-indigo-500"
                }`}
              >
                <Search className="w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`ml-2 bg-transparent outline-none text-sm w-32 ${
                    darkMode ? "text-white placeholder-gray-500" : "text-gray-900"
                  }`}
                />
              </div>

              {/* Theme Toggle */}
              <button
                onClick={() => setDarkMode(!darkMode)}
                className={`p-3 rounded-xl font-semibold text-sm transition-all duration-300 shadow-lg hover:scale-110 ${
                  darkMode
                    ? "bg-gray-800 text-yellow-400 hover:bg-gray-700"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
                title={darkMode ? "Modo Claro" : "Modo Oscuro"}
              >
                {darkMode ? (
                  <Sun className="w-5 h-5" />
                ) : (
                  <Moon className="w-5 h-5" />
                )}
              </button>

              {/* Auto Refresh */}
              <button
                onClick={() => setAutoRefresh(!autoRefresh)}
                className={`px-5 py-2.5 rounded-xl font-semibold text-sm transition-all duration-300 flex items-center gap-2 shadow-lg hover:scale-105 ${
                  autoRefresh
                    ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white"
                    : darkMode
                      ? "bg-gray-800 text-gray-300 hover:bg-gray-700"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                <Wifi
                  className={`w-4 h-4 ${autoRefresh ? "animate-pulse" : ""}`}
                />
                {autoRefresh ? "Auto ON" : "Auto OFF"}
              </button>

              {/* Time Range */}
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 shadow-lg border cursor-pointer ${
                  darkMode
                    ? "bg-gray-800 border-gray-700 text-white hover:bg-gray-700"
                    : "bg-white border-gray-200 text-gray-900 hover:bg-gray-50"
                }`}
              >
                <option value="24h">Últimas 24h</option>
                <option value="7d">7 días</option>
                <option value="30d">30 días</option>
                <option value="90d">90 días</option>
              </select>

              {/* Refresh Button */}
              <button
                onClick={fetchDashboardData}
                disabled={loading}
                className={`px-5 py-2.5 rounded-xl transition-all duration-300 flex items-center gap-2 disabled:opacity-50 shadow-lg hover:scale-105 border ${
                  darkMode
                    ? "bg-gray-800 border-gray-700 text-white hover:bg-gray-700"
                    : "bg-white border-gray-200 text-gray-900 hover:bg-gray-50"
                }`}
              >
                <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
                <span className="text-sm font-semibold hidden xl:inline">
                  Actualizar
                </span>
              </button>

              {/* Export Dropdown */}
              <div className="relative group">
                <button className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl transition-all duration-300 flex items-center gap-2 font-semibold shadow-lg hover:scale-105">
                  <Download className="w-4 h-4" />
                  <span className="text-sm hidden xl:inline">Exportar</span>
                </button>
                <div
                  className={`absolute right-0 mt-2 w-40 rounded-xl shadow-2xl border overflow-hidden z-50 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none group-hover:pointer-events-auto ${
                    darkMode
                      ? "bg-gray-800 border-gray-700"
                      : "bg-white border-gray-200"
                  }`}
                >
                  <button
                    onClick={() => exportData("json")}
                    className={`w-full px-4 py-3 text-left text-sm font-medium transition-colors flex items-center gap-2 ${
                      darkMode
                        ? "hover:bg-gray-700 text-gray-300"
                        : "hover:bg-gray-50 text-gray-700"
                    }`}
                  >
                    <FileText className="w-4 h-4" />
                    JSON
                  </button>
                  <button
                    onClick={() => exportData("csv")}
                    className={`w-full px-4 py-3 text-left text-sm font-medium transition-colors flex items-center gap-2 ${
                      darkMode
                        ? "hover:bg-gray-700 text-gray-300"
                        : "hover:bg-gray-50 text-gray-700"
                    }`}
                  >
                    <BarChartIcon className="w-4 h-4" />
                    CSV
                  </button>
                  <button
                    onClick={() => exportData("pdf")}
                    className={`w-full px-4 py-3 text-left text-sm font-medium transition-colors flex items-center gap-2 ${
                      darkMode
                        ? "hover:bg-gray-700 text-gray-300"
                        : "hover:bg-gray-50 text-gray-700"
                    }`}
                  >
                    <Download className="w-4 h-4" />
                    PDF
                  </button>
                </div>
              </div>

              {/* Notifications */}
              <div className="relative">
                <button
                  onClick={() => setNotificationsOpen(!notificationsOpen)}
                  className={`p-3 rounded-xl relative transition-all duration-300 shadow-lg hover:scale-110 ${
                    darkMode
                      ? "bg-gray-800 text-gray-300 hover:bg-gray-700"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  <Bell className="w-5 h-5" />
                  {alertas && alertas.length > 0 && (
                    <span className="absolute top-1 right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></span>
                  )}
                </button>
              </div>

              {/* User Menu */}
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-300 shadow-lg hover:scale-105 ${
                    darkMode
                      ? "bg-gray-800 hover:bg-gray-700"
                      : "bg-white hover:bg-gray-50"
                  }`}
                >
                  <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold shadow-md">
                    {currentUser.nombre[0]}{currentUser.apellido[0]}
                  </div>
                  <div className="text-left hidden xl:block">
                    <p
                      className={`text-sm font-bold ${
                        darkMode ? "text-white" : "text-gray-900"
                      }`}
                    >
                      {currentUser.nombre} {currentUser.apellido}
                    </p>
                    <p
                      className={`text-xs ${
                        darkMode ? "text-gray-400" : "text-gray-500"
                      }`}
                    >
                      {currentUser.rol}
                    </p>
                  </div>
                  <ChevronDown
                    className={`w-4 h-4 ${
                      darkMode ? "text-gray-400" : "text-gray-500"
                    } hidden xl:block`}
                  />
                </button>

                {showUserMenu && (
                  <div
                    className={`absolute right-0 mt-2 w-64 rounded-xl shadow-2xl border overflow-hidden z-50 ${
                      darkMode
                        ? "bg-gray-800 border-gray-700"
                        : "bg-white border-gray-200"
                    }`}
                  >
                    <div
                      className={`px-4 py-3 border-b ${
                        darkMode ? "border-gray-700" : "border-gray-200"
                      }`}
                    >
                      <p
                        className={`text-sm font-bold ${
                          darkMode ? "text-white" : "text-gray-900"
                        }`}
                      >
                        {getCurrentHour()}, {currentUser.nombre}!
                      </p>
                      <p
                        className={`text-xs mt-1 ${
                          darkMode ? "text-gray-400" : "text-gray-500"
                        }`}
                      >
                        {currentUser.email}
                      </p>
                    </div>
                    <div className="py-2">
                      <Link
                        href="/admin/perfil"
                        className={`flex items-center gap-3 px-4 py-3 transition-colors ${
                          darkMode
                            ? "hover:bg-gray-700 text-gray-300"
                            : "hover:bg-gray-50 text-gray-700"
                        }`}
                      >
                        <User className="w-4 h-4" />
                        <span className="text-sm font-medium">Mi Perfil</span>
                      </Link>
                      <Link
                        href="/admin/configuracion"
                        className={`flex items-center gap-3 px-4 py-3 transition-colors ${
                          darkMode
                            ? "hover:bg-gray-700 text-gray-300"
                            : "hover:bg-gray-50 text-gray-700"
                        }`}
                      >
                        <Settings className="w-4 h-4" />
                        <span className="text-sm font-medium">Configuración</span>
                      </Link>
                      <div
                        className={`my-2 border-t ${
                          darkMode ? "border-gray-700" : "border-gray-200"
                        }`}
                      ></div>
                      <button
                        className={`w-full flex items-center gap-3 px-4 py-3 transition-colors ${
                          darkMode
                            ? "hover:bg-red-900/30 text-red-400"
                            : "hover:bg-red-50 text-red-600"
                        }`}
                      >
                        <LogOut className="w-4 h-4" />
                        <span className="text-sm font-medium">Cerrar Sesión</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className={`lg:hidden p-2 rounded-xl ${
                darkMode
                  ? "bg-gray-800 text-white"
                  : "bg-gray-100 text-gray-900"
              }`}
            >
              {showMobileMenu ? (
                <CloseIcon className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>

          {/* Mobile Menu */}
          {showMobileMenu && (
            <div
              className={`lg:hidden border-t py-4 space-y-3 ${
                darkMode ? "border-gray-800" : "border-gray-200"
              }`}
            >
              <div
                className={`relative px-3 py-2.5 rounded-xl border ${
                  darkMode
                    ? "bg-gray-800 border-gray-700"
                    : "bg-white border-gray-200"
                }`}
              >
                <Search className="w-4 h-4 text-gray-400 absolute left-4 top-3" />
                <input
                  type="text"
                  placeholder="Buscar..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`ml-6 bg-transparent outline-none text-sm w-full ${
                    darkMode
                      ? "text-white placeholder-gray-500"
                      : "text-gray-900"
                  }`}
                />
              </div>

              <button
                onClick={() => setDarkMode(!darkMode)}
                className={`w-full p-3 rounded-xl font-semibold text-sm transition-all duration-300 flex items-center justify-center gap-2 ${
                  darkMode
                    ? "bg-gray-800 text-yellow-400"
                    : "bg-gray-100 text-gray-700"
                }`}
              >
                {darkMode ? (
                  <Sun className="w-5 h-5" />
                ) : (
                  <Moon className="w-5 h-5" />
                )}
                {darkMode ? "Modo Claro" : "Modo Oscuro"}
              </button>

              <button
                onClick={() => setAutoRefresh(!autoRefresh)}
                className={`w-full px-5 py-3 rounded-xl font-semibold text-sm transition-all duration-300 flex items-center justify-center gap-2 ${
                  autoRefresh
                    ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white"
                    : darkMode
                      ? "bg-gray-800 text-gray-300"
                      : "bg-gray-100 text-gray-700"
                }`}
              >
                <Wifi
                  className={`w-4 h-4 ${autoRefresh ? "animate-pulse" : ""}`}
                />
                {autoRefresh ? "Auto Refresh ON" : "Auto Refresh OFF"}
              </button>

              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className={`w-full px-5 py-3 rounded-xl text-sm font-semibold border ${
                  darkMode
                    ? "bg-gray-800 border-gray-700 text-white"
                    : "bg-white border-gray-200 text-gray-900"
                }`}
              >
                <option value="24h">Últimas 24h</option>
                <option value="7d">7 días</option>
                <option value="30d">30 días</option>
                <option value="90d">90 días</option>
              </select>

              <button
                onClick={fetchDashboardData}
                disabled={loading}
                className={`w-full px-5 py-3 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 border ${
                  darkMode
                    ? "bg-gray-800 border-gray-700 text-white"
                    : "bg-white border-gray-200 text-gray-900"
                }`}
              >
                <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
                <span className="text-sm font-semibold">Actualizar</span>
              </button>

              <button
                onClick={() => exportData("json")}
                className="w-full px-5 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl transition-all duration-300 flex items-center justify-center gap-2 font-semibold"
              >
                <Download className="w-4 h-4" />
                <span className="text-sm">Exportar Datos</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ==================== MAIN CONTENT ====================  */}
      <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-8">
        {/* Saludo Personalizado */}
        <div
          className={`mb-6 md:mb-8 rounded-2xl md:rounded-3xl p-6 md:p-8 shadow-xl border ${
            darkMode
              ? "bg-gradient-to-r from-indigo-900/50 to-purple-900/50 border-indigo-500/20"
              : "bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-200"
          }`}
        >
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <h2
                className={`text-2xl md:text-3xl font-black mb-2 ${
                  darkMode ? "text-white" : "text-gray-900"
                }`}
              >
                {getCurrentHour()}, {currentUser.nombre}! 👋
              </h2>
              <p
                className={`text-sm md:text-lg ${
                  darkMode ? "text-indigo-300" : "text-indigo-700"
                } font-medium`}
              >
                Bienvenido al panel de administración de AnyssaMed
              </p>
            </div>
            <div
              className={`flex items-center gap-3 md:gap-4 px-4 md:px-6 py-3 rounded-xl md:rounded-2xl ${
                darkMode ? "bg-gray-800/50" : "bg-white/50"
              }`}
            >
              <Sparkles className="w-5 h-5 md:w-6 md:h-6 text-yellow-500 animate-pulse" />
              <div>
                <p
                  className={`text-xs md:text-sm font-bold ${
                    darkMode ? "text-white" : "text-gray-900"
                  }`}
                >
                  {estadisticas.usuarios_conectados} usuarios en línea
                </p>
                <p
                  className={`text-xs ${
                    darkMode ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  Sistema operativo al {estadisticas.uptime_sistema}%
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Alertas */}
        {alertas && alertas.length > 0 && (
          <div className="mb-6 md:mb-8 space-y-3 md:space-y-4">
            {alertas.slice(0, 3).map((alerta) => (
              <div
                key={alerta.id}
                className={`rounded-xl md:rounded-2xl border p-4 md:p-5 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 ${getAlertColor(
                  alerta.tipo
                )}`}
              >
                <div className="flex items-start gap-3 md:gap-4">
                  <div className="flex-shrink-0 mt-1">
                    {getAlertIcon(alerta.tipo)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2 gap-2">
                      <h4 className="text-sm md:text-base font-bold">
                        {alerta.titulo}
                      </h4>
                      <span className="text-xs font-semibold opacity-75 whitespace-nowrap">
                        {getTimeAgo(alerta.timestamp)}
                      </span>
                    </div>
                    <p className="text-xs md:text-sm opacity-90 mb-2">
                      {alerta.mensaje}
                    </p>
                    {alerta.accion_requerida && (
                      <p className="text-xs font-bold mt-3 opacity-75 flex items-center gap-2">
                        <Zap className="w-3 h-3" />
                        {alerta.accion_requerida}
                      </p>
                    )}
                  </div>
                  <button
                    className={`flex-shrink-0 px-3 md:px-4 py-2 rounded-lg text-xs md:text-sm font-bold opacity-75 hover:opacity-100 transition-all duration-200 ${
                      darkMode
                        ? "bg-white/10 hover:bg-white/20"
                        : "bg-black/10 hover:bg-black/20"
                    }`}
                  >
                    Resolver
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tabs Premium */}
        <div
          className={`mb-6 md:mb-8 rounded-xl md:rounded-2xl p-2 border shadow-lg ${
            darkMode
              ? "bg-gray-800/50 border-gray-700"
              : "bg-white border-gray-200"
          }`}
        >
          <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
            {["overview", "analytics", "advanced", "reports"].map((tab) => (
              <button
                key={tab}
                onClick={() => setSelectedTab(tab as any)}
                className={`flex-shrink-0 px-4 md:px-6 py-3 md:py-4 rounded-lg md:rounded-xl font-bold text-xs md:text-sm transition-all duration-300 whitespace-nowrap ${
                  selectedTab === tab
                    ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg"
                    : darkMode
                      ? "text-gray-400 hover:bg-gray-700"
                      : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  {tab === "overview" && (
                    <>
                      <Activity className="w-4 h-4 md:w-5 md:h-5" />
                      <span className="hidden sm:inline">Vista General</span>
                      <span className="sm:hidden">General</span>
                    </>
                  )}
                  {tab === "analytics" && (
                    <>
                      <BarChart3 className="w-4 h-4 md:w-5 md:h-5" />
                      <span className="hidden sm:inline">Analytics</span>
                      <span className="sm:hidden">Analytics</span>
                    </>
                  )}
                  {tab === "advanced" && (
                    <>
                      <Cpu className="w-4 h-4 md:w-5 md:h-5" />
                      <span className="hidden sm:inline">Avanzado</span>
                      <span className="sm:hidden">Avanzado</span>
                    </>
                  )}
                  {tab === "reports" && (
                    <>
                      <FileText className="w-4 h-4 md:w-5 md:h-5" />
                      <span className="hidden sm:inline">Reportes</span>
                      <span className="sm:hidden">Reportes</span>
                    </>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* ==================== VISTA GENERAL ====================  */}
             {selectedTab === "overview" && (
          <div className="space-y-6 md:space-y-8">
            {/* KPIs Premium - Grid Responsivo */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              <KPICard
                title="Centros Médicos"
                value={formatNumber(estadisticas.total_centros)}
                icon={<Building2 className="w-8 h-8" />}
                gradient="from-blue-600/80 via-blue-700/80 to-indigo-700/80"
                trend={12.5}
                subtitle="Crecimiento mensual"
                details={[
                  {
                    label: "Activos",
                    value: estadisticas.centros_activos,
                    color: "text-green-400",
                  },
                  {
                    label: "Suspendidos",
                    value: estadisticas.centros_suspendidos,
                    color: "text-red-400",
                  },
                ]}
                darkMode={darkMode}
                badge="Operativos"
                badgeColor="bg-blue-100/20 text-blue-300"
              />

              <KPICard
                title="Usuarios Activos"
                value={formatNumber(estadisticas.usuarios_activos)}
                icon={<Users className="w-8 h-8" />}
                gradient="from-purple-600/80 via-purple-700/80 to-pink-700/80"
                trend={8.3}
                subtitle="Usuarios en línea"
                details={[
                  {
                    label: "Conectados",
                    value: estadisticas.usuarios_conectados,
                    color: "text-green-400",
                  },
                  {
                    label: "Bloqueados",
                    value: estadisticas.usuarios_bloqueados,
                    color: "text-red-400",
                  },
                ]}
                darkMode={darkMode}
                badge="Sistema"
                badgeColor="bg-purple-100/20 text-purple-300"
              />

              <KPICard
                title="Médicos Registrados"
                value={formatNumber(estadisticas.total_medicos)}
                icon={<Stethoscope className="w-8 h-8" />}
                gradient="from-green-600/80 via-emerald-700/80 to-teal-700/80"
                trend={5.7}
                subtitle="Profesionales activos"
                details={[
                  {
                    label: "Activos",
                    value: estadisticas.medicos_activos,
                    color: "text-green-400",
                  },
                  {
                    label: "Especialidades",
                    value: estadisticas.total_especialidades,
                    color: "text-blue-400",
                  },
                ]}
                darkMode={darkMode}
                badge="Equipo"
                badgeColor="bg-green-100/20 text-green-300"
              />

              <KPICard
                title="Pacientes Totales"
                value={formatNumber(estadisticas.total_pacientes)}
                icon={<UserPlus className="w-8 h-8" />}
                gradient="from-orange-600/80 via-red-700/80 to-pink-700/80"
                trend={15.2}
                subtitle="Nuevos este mes"
                details={[
                  {
                    label: "Activos",
                    value: estadisticas.pacientes_activos,
                    color: "text-green-400",
                  },
                  {
                    label: "Nuevos",
                    value: `+${estadisticas.nuevos_pacientes_mes}`,
                    color: "text-yellow-400",
                  },
                ]}
                darkMode={darkMode}
                badge="Crecimiento"
                badgeColor="bg-orange-100/20 text-orange-300"
              />
            </div>

            {/* Métricas Destacadas - Responsive Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {/* Consultas Hoy */}
              <div className="relative overflow-hidden rounded-2xl md:rounded-3xl bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 p-6 md:p-8 shadow-2xl hover:shadow-indigo-500/50 transition-all duration-300 hover:scale-105 cursor-pointer group">
                <div className="absolute top-0 right-0 w-32 h-32 md:w-40 md:h-40 bg-white/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-500"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 md:w-32 md:h-32 bg-white/5 rounded-full blur-2xl"></div>
                
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                      <Activity className="w-6 h-6 md:w-8 md:h-8 text-white" />
                    </div>
                    <span className="text-xs font-bold text-white/80 bg-white/10 px-3 py-1 rounded-full">
                      Hoy
                    </span>
                  </div>
                  <div className="text-4xl md:text-5xl font-black text-white mb-2">
                    {formatNumber(estadisticas.consultas_hoy)}
                  </div>
                  <p className="text-indigo-100 text-xs md:text-sm font-bold mb-4">
                    Consultas Realizadas
                  </p>
                  <div className="space-y-2 pt-4 border-t border-white/20">
                    <div className="flex items-center justify-between text-xs text-indigo-100 font-semibold">
                      <span>Este mes</span>
                      <span className="text-white font-black">
                        {formatNumber(estadisticas.consultas_mes)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-indigo-100 font-semibold">
                      <span>Este año</span>
                      <span className="text-white font-black">
                        {formatNumber(estadisticas.consultas_ano)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Ingresos del Mes */}
              <div className="relative overflow-hidden rounded-2xl md:rounded-3xl bg-gradient-to-br from-emerald-600 via-green-600 to-teal-600 p-6 md:p-8 shadow-2xl hover:shadow-emerald-500/50 transition-all duration-300 hover:scale-105 cursor-pointer group">
                <div className="absolute top-0 right-0 w-32 h-32 md:w-40 md:h-40 bg-white/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-500"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 md:w-32 md:h-32 bg-white/5 rounded-full blur-2xl"></div>
                
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                      <DollarSign className="w-6 h-6 md:w-8 md:h-8 text-white" />
                    </div>
                    <span className="text-xs font-bold text-white/80 bg-white/10 px-3 py-1 rounded-full">
                      Mes
                    </span>
                  </div>
                  <div className="text-2xl md:text-3xl font-black text-white mb-2">
                    {formatCurrency(estadisticas.ingresos_mes)}
                  </div>
                  <p className="text-emerald-100 text-xs md:text-sm font-bold mb-4">
                    Ingresos Mensuales
                  </p>
                  <div className="space-y-2 pt-4 border-t border-white/20">
                    <div className="flex items-center justify-between text-xs text-emerald-100 font-semibold">
                      <span>Anual</span>
                      <span className="text-white font-black">
                        {formatCurrency(estadisticas.ingresos_ano)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-emerald-100 font-semibold">
                      <span>Margen</span>
                      <span className="text-white font-black">
                        {estadisticas.margen_ganancia}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Pendiente de Cobro */}
              <div className="relative overflow-hidden rounded-2xl md:rounded-3xl bg-gradient-to-br from-amber-600 via-yellow-600 to-orange-600 p-6 md:p-8 shadow-2xl hover:shadow-amber-500/50 transition-all duration-300 hover:scale-105 cursor-pointer group md:col-span-2 lg:col-span-1">
                <div className="absolute top-0 right-0 w-32 h-32 md:w-40 md:h-40 bg-white/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-500"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 md:w-32 md:h-32 bg-white/5 rounded-full blur-2xl"></div>
                
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                      <Clock className="w-6 h-6 md:w-8 md:h-8 text-white" />
                    </div>
                    <span className="text-xs font-bold text-white/80 bg-white/10 px-3 py-1 rounded-full">
                      Urgente
                    </span>
                  </div>
                  <div className="text-2xl md:text-3xl font-black text-white mb-2">
                    {formatCurrency(estadisticas.pendiente_cobro)}
                  </div>
                  <p className="text-amber-100 text-xs md:text-sm font-bold mb-4">
                    Pendiente de Cobro
                  </p>
                  <button className="w-full mt-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-xl text-xs font-bold text-white transition-all duration-300 hover:scale-105 backdrop-blur-sm">
                    Gestionar Cobros
                  </button>
                </div>
              </div>
            </div>

            {/* Métricas de Calidad y Rendimiento */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              {/* Satisfacción */}
              <div
                className={`rounded-2xl md:rounded-3xl p-6 md:p-8 hover:shadow-2xl transition-all duration-300 border group cursor-pointer transform hover:scale-105 ${
                  darkMode
                    ? "bg-gray-800/50 border-gray-700 hover:border-yellow-500/50"
                    : "bg-white border-gray-200 hover:border-yellow-300"
                }`}
              >
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-14 h-14 md:w-16 md:h-16 bg-gradient-to-br from-yellow-500 to-amber-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <Star className="w-7 h-7 md:w-8 md:h-8 text-white" />
                  </div>
                  <div>
                    <div
                      className={`text-3xl md:text-4xl font-black ${
                        darkMode ? "text-white" : "text-gray-900"
                      }`}
                    >
                      {estadisticas.satisfaccion_promedio}
                    </div>
                    <div className="text-xs md:text-sm text-yellow-600 font-semibold">
                      Satisfacción
                    </div>
                  </div>
                </div>
                <div className="flex gap-1 mb-4">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-4 h-4 md:w-5 md:h-5 transition-all duration-300 ${
                        star <= estadisticas.satisfaccion_promedio
                          ? "fill-yellow-400 text-yellow-400 scale-110"
                          : darkMode
                            ? "text-gray-600"
                            : "text-gray-300"
                      }`}
                    />
                  ))}
                </div>
                <p
                  className={`text-xs md:text-sm font-semibold ${
                    darkMode ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  Promedio de calificación de pacientes
                </p>
              </div>

              {/* Tiempo de Espera */}
              <div
                className={`rounded-2xl md:rounded-3xl p-6 md:p-8 hover:shadow-2xl transition-all duration-300 border group cursor-pointer transform hover:scale-105 ${
                  darkMode
                    ? "bg-gray-800/50 border-gray-700 hover:border-blue-500/50"
                    : "bg-white border-gray-200 hover:border-blue-300"
                }`}
              >
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-14 h-14 md:w-16 md:h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <Clock className="w-7 h-7 md:w-8 md:h-8 text-white" />
                  </div>
                  <div>
                    <div
                      className={`text-3xl md:text-4xl font-black ${
                        darkMode ? "text-white" : "text-gray-900"
                      }`}
                    >
                      {estadisticas.tiempo_espera_promedio}m
                    </div>
                    <div className="text-xs md:text-sm text-blue-600 font-semibold">
                      Tiempo Espera
                    </div>
                  </div>
                </div>
                <div
                  className={`w-full rounded-full h-2 mb-3 ${
                    darkMode ? "bg-gray-700" : "bg-gray-200"
                  }`}
                >
                  <div
                    className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(estadisticas.tiempo_espera_promedio * 5, 100)}%` }}
                  ></div>
                </div>
                <p
                  className={`text-xs md:text-sm font-semibold ${
                    darkMode ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  Promedio de espera en consultas
                </p>
              </div>

              {/* Tasa de Cancelación */}
              <div
                className={`rounded-2xl md:rounded-3xl p-6 md:p-8 hover:shadow-2xl transition-all duration-300 border group cursor-pointer transform hover:scale-105 ${
                  darkMode
                    ? "bg-gray-800/50 border-gray-700 hover:border-red-500/50"
                    : "bg-white border-gray-200 hover:border-red-300"
                }`}
              >
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-14 h-14 md:w-16 md:h-16 bg-gradient-to-br from-red-500 to-rose-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <XCircle className="w-7 h-7 md:w-8 md:h-8 text-white" />
                  </div>
                  <div>
                    <div
                      className={`text-3xl md:text-4xl font-black ${
                        darkMode ? "text-white" : "text-gray-900"
                      }`}
                    >
                      {estadisticas.tasa_cancelacion}%
                    </div>
                    <div className="text-xs md:text-sm text-red-600 font-semibold">
                      Cancelaciones
                    </div>
                  </div>
                </div>
                <div
                  className={`w-full rounded-full h-2 mb-3 ${
                    darkMode ? "bg-gray-700" : "bg-gray-200"
                  }`}
                >
                  <div
                    className="bg-gradient-to-r from-red-500 to-rose-600 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${estadisticas.tasa_cancelacion * 10}%` }}
                  ></div>
                </div>
                <p
                  className={`text-xs md:text-sm font-semibold ${
                    darkMode ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  Tasa de cancelación de citas
                </p>
              </div>

              {/* Uptime del Sistema */}
              <div
                className={`rounded-2xl md:rounded-3xl p-6 md:p-8 hover:shadow-2xl transition-all duration-300 border group cursor-pointer transform hover:scale-105 ${
                  darkMode
                    ? "bg-gray-800/50 border-gray-700 hover:border-green-500/50"
                    : "bg-white border-gray-200 hover:border-green-300"
                }`}
              >
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-14 h-14 md:w-16 md:h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <Server className="w-7 h-7 md:w-8 md:h-8 text-white" />
                  </div>
                  <div>
                    <div
                      className={`text-3xl md:text-4xl font-black ${
                        darkMode ? "text-white" : "text-gray-900"
                      }`}
                    >
                      {estadisticas.uptime_sistema}%
                    </div>
                    <div className="text-xs md:text-sm text-green-600 font-semibold">
                      Uptime
                    </div>
                  </div>
                </div>
                <div
                  className={`w-full rounded-full h-2 mb-3 ${
                    darkMode ? "bg-gray-700" : "bg-gray-200"
                  }`}
                >
                  <div
                    className="bg-gradient-to-r from-green-500 to-emerald-600 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${estadisticas.uptime_sistema}%` }}
                  ></div>
                </div>
                <p
                  className={`text-xs md:text-sm font-semibold ${
                    darkMode ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  Disponibilidad del sistema
                </p>
              </div>
            </div>

            {/* ACCESO RÁPIDO - Grid Responsivo */}
            <div className="mt-8">
              <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-3">
                <div>
                  <h2
                    className={`text-2xl md:text-3xl font-black mb-2 flex items-center gap-2 md:gap-3 ${
                      darkMode ? "text-white" : "text-gray-900"
                    }`}
                  >
                    <Zap className="w-6 h-6 md:w-8 md:h-8 text-yellow-500 animate-pulse" />
                    Acceso Rápido a Módulos
                  </h2>
                  <p
                    className={`text-xs md:text-sm font-medium ${
                      darkMode ? "text-indigo-400" : "text-indigo-600"
                    }`}
                  >
                    Navega directamente a cualquier sección del sistema
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setViewMode(viewMode === "grid" ? "list" : "grid")}
                    className={`p-2.5 rounded-xl transition-all duration-300 ${
                      darkMode
                        ? "bg-gray-800 text-gray-300 hover:bg-gray-700"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {viewMode === "grid" ? (
                      <List className="w-5 h-5" />
                    ) : (
                      <Grid3x3 className="w-5 h-5" />
                    )}
                  </button>
                  <div
                    className={`flex items-center gap-2 px-3 md:px-4 py-2 rounded-xl border ${
                      darkMode
                        ? "bg-gray-800/50 border-gray-700"
                        : "bg-white/50 border-gray-200"
                    }`}
                  >
                    <Sparkles className="w-4 h-4 text-yellow-500" />
                    <span
                      className={`text-xs md:text-sm font-bold ${
                        darkMode ? "text-white" : "text-gray-900"
                      }`}
                    >
                      {quickAccessButtons.length} Módulos
                    </span>
                  </div>
                </div>
              </div>

              <div
                className={`grid gap-4 md:gap-6 ${
                  viewMode === "grid"
                    ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                    : "grid-cols-1"
                }`}
              >
                {quickAccessButtons.map((button, index) => (
                  <Link
                    key={index}
                    href={button.href}
                    className={`group relative overflow-hidden rounded-2xl md:rounded-3xl p-5 md:p-6 transition-all duration-500 hover:scale-105 hover:shadow-2xl border ${
                      darkMode
                        ? "bg-gray-800/50 border-gray-700 hover:border-indigo-500/50"
                        : "bg-white border-gray-200 hover:border-indigo-300"
                    }`}
                  >
                    <div
                      className={`absolute inset-0 bg-gradient-to-br ${button.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500`}
                    ></div>

                    <div className="flex items-center justify-between mb-4">
                      <span
                        className={`px-2.5 md:px-3 py-1 rounded-full text-xs font-bold ${button.badgeColor}`}
                      >
                        {button.badge}
                      </span>
                      <ChevronRight
                        className={`w-4 h-4 md:w-5 md:h-5 transition-all duration-300 ${
                          darkMode
                            ? "text-indigo-400 group-hover:text-white"
                            : "text-indigo-600 group-hover:text-indigo-800"
                        } group-hover:translate-x-1`}
                      />
                    </div>

                    <div
                      className={`w-14 h-14 md:w-16 md:h-16 rounded-xl md:rounded-2xl bg-gradient-to-br ${button.gradient} flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform duration-500`}
                    >
                      <div className="text-white">{button.icon}</div>
                    </div>

                    <h3
                      className={`text-base md:text-lg font-black mb-2 transition-colors duration-300 ${
                        darkMode
                          ? "text-white group-hover:text-indigo-400"
                          : "text-gray-900 group-hover:text-indigo-600"
                      }`}
                    >
                      {button.title}
                    </h3>
                    <p
                      className={`text-xs md:text-sm mb-3 line-clamp-2 ${
                        darkMode ? "text-gray-400" : "text-gray-600"
                      }`}
                    >
                      {button.description}
                    </p>

                    {button.count !== undefined && (
                      <div
                        className={`mt-4 pt-4 border-t ${
                          darkMode ? "border-gray-700" : "border-gray-200"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span
                            className={`text-xs font-semibold ${
                              darkMode ? "text-indigo-400" : "text-indigo-600"
                            }`}
                          >
                            Total
                          </span>
                          <span
                            className={`text-lg md:text-xl font-black ${
                              darkMode ? "text-white" : "text-gray-900"
                            }`}
                          >
                            {button.isCurrency
                              ? formatCurrency(button.count)
                              : formatNumber(button.count)}
                          </span>
                        </div>
                      </div>
                    )}

                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Gráficos Analytics - Responsive */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
              {/* Gráfico de Líneas - Consultas */}
              <ChartCard
                title="Tendencia de Consultas"
                description="Últimos 7 días"
                icon={<LineChartIcon className="w-5 h-5" />}
                darkMode={darkMode}
                actions={
                  <button
                    onClick={() => setFullscreenChart("line")}
                    className={`p-2 rounded-lg transition-all duration-300 ${
                      darkMode
                        ? "hover:bg-gray-700 text-gray-400"
                        : "hover:bg-gray-100 text-gray-600"
                    }`}
                  >
                    <Maximize2 className="w-4 h-4" />
                  </button>
                }
              >
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={chartData}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke={darkMode ? "#374151" : "#e5e7eb"}
                    />
                    <XAxis stroke={darkMode ? "#9ca3af" : "#6b7280"} />
                    <YAxis stroke={darkMode ? "#9ca3af" : "#6b7280"} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: darkMode ? "#1f2937" : "#ffffff",
                        border: `1px solid ${darkMode ? "#374151" : "#e5e7eb"}`,
                        borderRadius: "8px",
                      }}
                      labelStyle={{ color: darkMode ? "#f3f4f6" : "#111827" }}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="value"
                      stroke="#3b82f6"
                      strokeWidth={3}
                      dot={{ fill: "#3b82f6", r: 5 }}
                      activeDot={{ r: 7 }}
                      name="Consultas"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </ChartCard>

              {/* Gráfico de Barras - Comparativa */}
              <ChartCard
                title="Comparativa Mensual"
                description="Consultas vs Pacientes"
                icon={<BarChartIcon className="w-5 h-5" />}
                darkMode={darkMode}
                actions={
                  <button
                    onClick={() => setFullscreenChart("bar")}
                    className={`p-2 rounded-lg transition-all duration-300 ${
                      darkMode
                        ? "hover:bg-gray-700 text-gray-400"
                        : "hover:bg-gray-100 text-gray-600"
                    }`}
                  >
                    <Maximize2 className="w-4 h-4" />
                  </button>
                }
              >
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartData}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke={darkMode ? "#374151" : "#e5e7eb"}
                    />
                    <XAxis stroke={darkMode ? "#9ca3af" : "#6b7280"} />
                    <YAxis stroke={darkMode ? "#9ca3af" : "#6b7280"} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: darkMode ? "#1f2937" : "#ffffff",
                        border: `1px solid ${darkMode ? "#374151" : "#e5e7eb"}`,
                        borderRadius: "8px",
                      }}
                      labelStyle={{ color: darkMode ? "#f3f4f6" : "#111827" }}
                    />
                    <Legend />
                    <Bar
                      dataKey="consultas"
                      fill="#8b5cf6"
                      name="Consultas"
                      radius={[8, 8, 0, 0]}
                    />
                    <Bar
                      dataKey="pacientes"
                      fill="#ec4899"
                      name="Pacientes"
                      radius={[8, 8, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </ChartCard>

              {/* Gráfico Circular - Distribución */}
              <ChartCard
                title="Distribución de Servicios"
                description="Porcentaje por tipo"
                icon={<PieChartIcon className="w-5 h-5" />}
                darkMode={darkMode}
                actions={
                  <button
                    onClick={() => setFullscreenChart("pie")}
                    className={`p-2 rounded-lg transition-all duration-300 ${
                      darkMode
                        ? "hover:bg-gray-700 text-gray-400"
                        : "hover:bg-gray-100 text-gray-600"
                    }`}
                  >
                    <Maximize2 className="w-4 h-4" />
                  </button>
                }
              >
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: darkMode ? "#1f2937" : "#ffffff",
                        border: `1px solid ${darkMode ? "#374151" : "#e5e7eb"}`,
                        borderRadius: "8px",
                      }}
                      labelStyle={{ color: darkMode ? "#f3f4f6" : "#111827" }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </ChartCard>

              {/* Gráfico Radar - Rendimiento */}
              <ChartCard
                title="Matriz de Rendimiento"
                description="Indicadores clave"
                icon={<Compass className="w-5 h-5" />}
                darkMode={darkMode}
                actions={
                  <button
                    onClick={() => setFullscreenChart("radar")}
                    className={`p-2 rounded-lg transition-all duration-300 ${
                      darkMode
                        ? "hover:bg-gray-700 text-gray-400"
                        : "hover:bg-gray-100 text-gray-600"
                    }`}
                  >
                    <Maximize2 className="w-4 h-4" />
                  </button>
                }
              >
                <ResponsiveContainer width="100%" height={300}>
                  <RadarChart data={radarData}>
                    <PolarGrid stroke={darkMode ? "#374151" : "#e5e7eb"} />
                    <PolarAngleAxis
                      dataKey="name"
                      stroke={darkMode ? "#9ca3af" : "#6b7280"}
                    />
                    <PolarRadiusAxis
                      stroke={darkMode ? "#9ca3af" : "#6b7280"}
                    />
                    <Radar
                      name="Rendimiento"
                      dataKey="value"
                      stroke="#3b82f6"
                      fill="#3b82f6"
                      fillOpacity={0.6}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: darkMode ? "#1f2937" : "#ffffff",
                        border: `1px solid ${darkMode ? "#374151" : "#e5e7eb"}`,
                        borderRadius: "8px",
                      }}
                      labelStyle={{ color: darkMode ? "#f3f4f6" : "#111827" }}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </ChartCard>
            </div>

            {/* Tabla de Actividades Recientes */}
            <ChartCard
              title="Actividades Recientes"
              description="Últimas acciones en el sistema"
              icon={<Activity className="w-5 h-5" />}
              darkMode={darkMode}
            >
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr
                      className={`border-b ${
                        darkMode ? "border-gray-700" : "border-gray-200"
                      }`}
                    >
                      <th
                        className={`px-4 py-3 text-left font-bold ${
                          darkMode ? "text-gray-300" : "text-gray-700"
                        }`}
                      >
                        Usuario
                      </th>
                      <th
                        className={`px-4 py-3 text-left font-bold ${
                          darkMode ? "text-gray-300" : "text-gray-700"
                        }`}
                      >
                        Acción
                      </th>
                      <th
                        className={`px-4 py-3 text-left font-bold ${
                          darkMode ? "text-gray-300" : "text-gray-700"
                        }`}
                      >
                        Módulo
                      </th>
                      <th
                        className={`px-4 py-3 text-left font-bold ${
                          darkMode ? "text-gray-300" : "text-gray-700"
                        }`}
                      >
                        Hora
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {actividades.slice(0, 10).map((actividad) => (
                      <tr
                        key={actividad.id_log}
                        className={`border-b transition-colors hover:${
                          darkMode ? "bg-gray-700/50" : "bg-gray-50"
                        } ${darkMode ? "border-gray-700" : "border-gray-200"}`}
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                              {actividad.usuario_nombre[0]}
                            </div>
                            <span
                              className={`font-medium ${
                                darkMode ? "text-white" : "text-gray-900"
                              }`}
                            >
                              {actividad.usuario_nombre}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-bold ${
                              actividad.accion === "CREATE"
                                ? "bg-green-100/20 text-green-400"
                                : actividad.accion === "UPDATE"
                                  ? "bg-blue-100/20 text-blue-400"
                                  : actividad.accion === "DELETE"
                                    ? "bg-red-100/20 text-red-400"
                                    : "bg-gray-100/20 text-gray-400"
                            }`}
                          >
                            {actividad.accion}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`${
                              darkMode ? "text-gray-300" : "text-gray-600"
                            }`}
                          >
                            {actividad.modulo}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`text-xs ${
                              darkMode ? "text-gray-400" : "text-gray-500"
                            }`}
                          >
                            {getTimeAgo(actividad.fecha_hora)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </ChartCard>
          </div>
        )}

        {/* ==================== VISTA ANALYTICS ====================  */}
        {selectedTab === "analytics" && (
          <div className="space-y-6 md:space-y-8">
            <div
              className={`rounded-2xl md:rounded-3xl p-6 md:p-8 border ${
                darkMode
                  ? "bg-gray-800/50 border-gray-700"
                  : "bg-white border-gray-200"
              }`}
            >
              <h3
                className={`text-2xl font-black mb-4 ${
                  darkMode ? "text-white" : "text-gray-900"
                }`}
              >
                📊 Análisis Avanzado de Datos
              </h3>
              <p
                className={`text-sm md:text-base ${
                  darkMode ? "text-gray-400" : "text-gray-600"
                }`}
              >
                Visualización detallada de métricas y tendencias del sistema
              </p>
            </div>

            {/* Área Chart - Ingresos */}
            <ChartCard
              title="Evolución de Ingresos"
              description="Tendencia mensual de ingresos"
              icon={<TrendUp className="w-5 h-5" />}
              darkMode={darkMode}
            >
              <ResponsiveContainer width="100%" height={350}>
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke={darkMode ? "#374151" : "#e5e7eb"}
                  />
                  <XAxis stroke={darkMode ? "#9ca3af" : "#6b7280"} />
                  <YAxis stroke={darkMode ? "#9ca3af" : "#6b7280"} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: darkMode ? "#1f2937" : "#ffffff",
                      border: `1px solid ${darkMode ? "#374151" : "#e5e7eb"}`,
                      borderRadius: "8px",
                    }}
                    labelStyle={{ color: darkMode ? "#f3f4f6" : "#111827" }}
                  />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="#3b82f6"
                    fillOpacity={1}
                    fill="url(#colorIncome)"
                    name="Ingresos"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>
        )}

        {/* ==================== VISTA AVANZADA ====================  */}
        {selectedTab === "advanced" && (
          <div className="space-y-6 md:space-y-8">
            <div
              className={`rounded-2xl md:rounded-3xl p-6 md:p-8 border ${
                darkMode
                  ? "bg-gray-800/50 border-gray-700"
                  : "bg-white border-gray-200"
              }`}
            >
              <h3
                className={`text-2xl font-black mb-4 ${
                  darkMode ? "text-white" : "text-gray-900"
                }`}
              >
                🚀 Monitoreo Avanzado del Sistema
              </h3>
              <p
                className={`text-sm md:text-base ${
                  darkMode ? "text-gray-400" : "text-gray-600"
                }`}
              >
                Métricas técnicas y rendimiento en tiempo real
              </p>
            </div>

            {/* Métricas Técnicas */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              <div
                className={`rounded-2xl md:rounded-3xl p-6 md:p-8 border ${
                  darkMode
                    ? "bg-gray-800/50 border-gray-700"
                    : "bg-white border-gray-200"
                }`}
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center">
                    <Cpu className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p
                      className={`text-2xl font-black ${
                        darkMode ? "text-white" : "text-gray-900"
                      }`}
                    >
                      {estadisticas.velocidad_respuesta_ms}ms
                    </p>
                    <p
                      className={`text-xs font-semibold ${
                        darkMode ? "text-cyan-400" : "text-cyan-600"
                      }`}
                    >
                      Velocidad de Respuesta
                    </p>
                  </div>
                </div>
                <div
                  className={`w-full rounded-full h-2 ${
                    darkMode ? "bg-gray-700" : "bg-gray-200"
                  }`}
                >
                  <div
                    className="bg-gradient-to-r from-cyan-500 to-blue-600 h-2 rounded-full"
                    style={{ width: `${Math.min((500 - estadisticas.velocidad_respuesta_ms) / 5, 100)}%` }}
                  ></div>
                </div>
              </div>

              <div
                className={`rounded-2xl md:rounded-3xl p-6 md:p-8 border ${
                  darkMode
                    ? "bg-gray-800/50 border-gray-700"
                    : "bg-white border-gray-200"
                }`}
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
                    <HardDrive className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p
                      className={`text-2xl font-black ${
                        darkMode ? "text-white" : "text-gray-900"
                      }`}
                    >
                      {estadisticas.espacio_usado_gb}GB
                    </p>
                    <p
                      className={`text-xs font-semibold ${
                        darkMode ? "text-purple-400" : "text-purple-600"
                      }`}
                    >
                      Espacio Usado
                    </p>
                  </div>
                </div>
                <div
                  className={`w-full rounded-full h-2 ${
                    darkMode ? "bg-gray-700" : "bg-gray-200"
                  }`}
                >
                  <div
                    className="bg-gradient-to-r from-purple-500 to-pink-600 h-2 rounded-full"
                    style={{
                      width: `${(estadisticas.espacio_usado_gb / estadisticas.espacio_total_gb) * 100}%`,
                    }}
                  ></div>
                </div>
              </div>

              <div
                className={`rounded-2xl md:rounded-3xl p-6 md:p-8 border ${
                  darkMode
                    ? "bg-gray-800/50 border-gray-700"
                    : "bg-white border-gray-200"
                }`}
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                    <Network className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p
                      className={`text-2xl font-black ${
                        darkMode ? "text-white" : "text-gray-900"
                      }`}
                    >
                      {estadisticas.eficiencia_medicos}%
                    </p>
                    <p
                      className={`text-xs font-semibold ${
                        darkMode ? "text-green-400" : "text-green-600"
                      }`}
                    >
                      Eficiencia Médicos
                    </p>
                  </div>
                </div>
                <div
                  className={`w-full rounded-full h-2 ${
                    darkMode ? "bg-gray-700" : "bg-gray-200"
                  }`}
                >
                  <div
                    className="bg-gradient-to-r from-green-500 to-emerald-600 h-2 rounded-full"
                    style={{ width: `${estadisticas.eficiencia_medicos}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ==================== VISTA REPORTES ====================  */}
        {selectedTab === "reports" && (
          <div className="space-y-6 md:space-y-8">
            <div
              className={`rounded-2xl md:rounded-3xl p-6 md:p-8 border ${
                darkMode
                  ? "bg-gray-800/50 border-gray-700"
                  : "bg-white border-gray-200"
              }`}
            >
              <h3
                className={`text-2xl font-black mb-4 ${
                  darkMode ? "text-white" : "text-gray-900"
                }`}
              >
                📋 Centro de Reportes
              </h3>
              <p
                className={`text-sm md:text-base ${
                  darkMode ? "text-gray-400" : "text-gray-600"
                }`}
              >
                Genera y descarga reportes personalizados del sistema
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {[
                {
                  title: "Reporte Mensual",
                  description: "Resumen completo del mes",
                  icon: Calendar,
                  color: "from-blue-500 to-indigo-600",
                },
                {
                  title: "Reporte de Ingresos",
                  description: "Análisis financiero detallado",
                  icon: DollarSign,
                  color: "from-green-500 to-emerald-600",
                },
                {
                  title: "Reporte de Usuarios",
                  description: "Estadísticas de usuarios",
                  icon: Users,
                  color: "from-purple-500 to-pink-600",
                },
                {
                  title: "Reporte de Médicos",
                  description: "Desempeño del personal médico",
                  icon: Stethoscope,
                  color: "from-orange-500 to-red-600",
                },
                {
                  title: "Reporte de Pacientes",
                  description: "Análisis de la base de pacientes",
                  icon: UserPlus,
                  color: "from-cyan-500 to-blue-600",
                },
                {
                  title: "Reporte de Seguridad",
                  description: "Auditoría y logs del sistema",
                  icon: Shield,
                  color: "from-slate-500 to-gray-600",
                },
              ].map((report, idx) => {
                const IconComponent = report.icon;
                return (
                  <button
                    key={idx}
                    className={`relative overflow-hidden rounded-2xl md:rounded-3xl p-6 md:p-8 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 border group text-left ${
                      darkMode
                        ? "bg-gray-800/50 border-gray-700 hover:border-indigo-500/50"
                        : "bg-white border-gray-200 hover:border-indigo-300"
                    }`}
                  >
                    <div
                      className={`absolute inset-0 bg-gradient-to-br ${report.color} opacity-0 group-hover:opacity-10 transition-opacity duration-500`}
                    ></div>

                    <div className="relative z-10">
                      <div
                        className={`w-12 h-12 md:w-14 md:h-14 rounded-xl bg-gradient-to-br ${report.color} flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}
                      >
                        <IconComponent className="w-6 h-6 md:w-7 md:h-7 text-white" />
                      </div>

                      <h4
                        className={`text-base md:text-lg font-black mb-2 ${
                          darkMode ? "text-white" : "text-gray-900"
                        }`}
                      >
                        {report.title}
                      </h4>
                      <p
                        className={`text-xs md:text-sm mb-4 ${
                          darkMode ? "text-gray-400" : "text-gray-600"
                        }`}
                      >
                        {report.description}
                      </p>

                      <button
                        onClick={() => exportData("pdf")}
                        className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all duration-300 ${
                          darkMode
                            ? "bg-gray-700 hover:bg-gray-600 text-white"
                            : "bg-gray-100 hover:bg-gray-200 text-gray-900"
                        }`}
                      >
                        <Download className="w-4 h-4" />
                        Descargar
                      </button>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Footer Premium */}
        <div
          className={`mt-8 md:mt-12 rounded-2xl md:rounded-3xl p-6 md:p-8 shadow-xl border ${
            darkMode
              ? "bg-gradient-to-r from-gray-800/50 to-gray-900/50 border-gray-700"
              : "bg-gradient-to-r from-gray-50 to-white border-gray-200"
          }`}
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <Clock
                  className={`w-5 h-5 ${
                    darkMode ? "text-indigo-400" : "text-indigo-600"
                  }`}
                />
                <h4
                  className={`font-bold text-sm md:text-base ${
                    darkMode ? "text-white" : "text-gray-900"
                  }`}
                >
                  Última Actualización
                </h4>
              </div>
              <p
                className={`text-xs md:text-sm ${
                  darkMode ? "text-gray-400" : "text-gray-600"
                }`}
              >
                {lastUpdate ? formatDate(lastUpdate.toISOString()) : "N/A"}
              </p>
            </div>

            <div>
              <div className="flex items-center gap-3 mb-3">
                <Server
                  className={`w-5 h-5 ${
                    darkMode ? "text-green-400" : "text-green-600"
                  }`}
                />
                <h4
                  className={`font-bold text-sm md:text-base ${
                    darkMode ? "text-white" : "text-gray-900"
                  }`}
                >
                  Estado del Sistema
                </h4>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 md:w-3 md:h-3 bg-green-500 rounded-full animate-pulse shadow-lg shadow-green-500/50"></div>
                <p
                  className={`text-xs md:text-sm font-semibold ${
                    darkMode ? "text-green-400" : "text-green-600"
                  }`}
                >
                  Operativo
                </p>
              </div>
            </div>

            <div>
              <div className="flex items-center gap-3 mb-3">
                <Sparkles
                  className={`w-5 h-5 ${
                    darkMode ? "text-yellow-400" : "text-yellow-600"
                  }`}
                />
                <h4
                  className={`font-bold text-sm md:text-base ${
                    darkMode ? "text-white" : "text-gray-900"
                  }`}
                >
                  Versión
                </h4>
              </div>
              <p
                className={`text-xs md:text-sm ${
                  darkMode ? "text-gray-400" : "text-gray-600"
                }`}
              >
                Dashboard Premium v2.5.0
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
