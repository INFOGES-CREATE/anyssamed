// frontend/src/app/(dashboard)/admin/page.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
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
  User,
  LogOut,
  ChevronDown,
  Menu,
  X as CloseIcon,
} from "lucide-react";
import Link from "next/link";

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
  id_medico: number;
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

export default function AdminDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState("7d");
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [selectedTab, setSelectedTab] = useState<"overview" | "analytics">("overview");
  const [darkMode, setDarkMode] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  // Datos del usuario
  const currentUser = {
    nombre: "Admin",
    apellido: "Principal",
    email: "admin@medisuite.com",
    rol: "Super Administrador",
    avatar: null,
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
        case "error": return "bg-gradient-to-r from-red-900/50 to-pink-900/50 border-red-500/50 text-red-200";
        case "advertencia": return "bg-gradient-to-r from-yellow-900/50 to-amber-900/50 border-yellow-500/50 text-yellow-200";
        case "info": return "bg-gradient-to-r from-blue-900/50 to-cyan-900/50 border-blue-500/50 text-blue-200";
        case "exito": return "bg-gradient-to-r from-green-900/50 to-emerald-900/50 border-green-500/50 text-green-200";
        default: return "bg-gradient-to-r from-gray-800/50 to-slate-800/50 border-gray-500/50 text-gray-200";
      }
    } else {
      switch (tipo) {
        case "error": return "bg-gradient-to-r from-red-50 to-pink-50 border-red-200 text-red-800";
        case "advertencia": return "bg-gradient-to-r from-yellow-50 to-amber-50 border-yellow-200 text-yellow-800";
        case "info": return "bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200 text-blue-800";
        case "exito": return "bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 text-green-800";
        default: return "bg-gradient-to-r from-gray-50 to-slate-50 border-gray-200 text-gray-800";
      }
    }
  };

  const getAlertIcon = (tipo: string) => {
    switch (tipo) {
      case "error": return <XCircle className="w-5 h-5" />;
      case "advertencia": return <AlertTriangle className="w-5 h-5" />;
      case "info": return <Activity className="w-5 h-5" />;
      case "exito": return <CheckCircle2 className="w-5 h-5" />;
      default: return <Bell className="w-5 h-5" />;
    }
  };

  const exportData = () => {
    if (!data) return;
    const exportObj = {
      fecha_exportacion: new Date().toISOString(),
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
    link.download = `dashboard-admin-${new Date().getTime()}.json`;
    link.click();
  };

  const getCurrentHour = (): string => {
    const hour = new Date().getHours();
    if (hour < 12) return "Buenos días";
    if (hour < 19) return "Buenas tardes";
    return "Buenas noches";
  };

  // BOTONES DE ACCESO RÁPIDO
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
      title: "Médicos",
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
      icon: <Shield className="w-6 h-6" />,
      href: "/admin/roles",
      gradient: "from-slate-500 via-gray-600 to-zinc-600",
      badge: "Seguridad",
      badgeColor: "bg-slate-100 text-slate-700",
    },
  ];

  if (loading && !data) {
    return (
      <div className={`min-h-screen flex items-center justify-center p-4 ${darkMode ? 'bg-gradient-to-br from-slate-950 via-indigo-950 to-purple-950' : 'bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50'}`}>
        <div className="text-center">
          <div className="relative mb-8">
            <div className={`w-24 h-24 border-4 rounded-full animate-spin ${darkMode ? 'border-indigo-400 border-t-transparent' : 'border-indigo-600 border-t-transparent'}`}></div>
            <Sparkles className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-10 h-10 ${darkMode ? 'text-indigo-400' : 'text-indigo-600'} animate-pulse`} />
          </div>
          <h2 className={`text-2xl md:text-3xl font-black mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Cargando Dashboard Premium
          </h2>
          <p className={`text-sm md:text-base ${darkMode ? 'text-indigo-300' : 'text-indigo-600'} font-medium`}>
            Obteniendo datos del sistema...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`min-h-screen flex items-center justify-center p-4 ${darkMode ? 'bg-gradient-to-br from-slate-950 via-indigo-950 to-purple-950' : 'bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50'}`}>
        <div className={`rounded-3xl shadow-2xl p-6 md:p-8 max-w-md w-full border ${darkMode ? 'bg-gray-900/50 backdrop-blur-xl border-red-500/20' : 'bg-white border-red-200'}`}>
          <div className={`flex items-center justify-center w-20 h-20 rounded-full mx-auto mb-6 ${darkMode ? 'bg-red-500/20' : 'bg-red-100'}`}>
            <XCircle className={`w-10 h-10 ${darkMode ? 'text-red-400' : 'text-red-600'}`} />
          </div>
          <h2 className={`text-2xl md:text-3xl font-black text-center mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Error al cargar datos
          </h2>
          <p className={`text-center mb-8 ${darkMode ? 'text-red-300' : 'text-red-600'} font-medium`}>{error}</p>
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
    <div className={`min-h-screen transition-colors duration-300 ${darkMode ? 'bg-gradient-to-br from-slate-950 via-indigo-950 to-purple-950' : 'bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50'}`}>
      {/* Header Premium - Totalmente Responsive */}
      <div className={`sticky top-0 z-50 backdrop-blur-xl border-b shadow-2xl transition-colors duration-300 ${darkMode ? 'bg-gray-900/80 border-gray-800' : 'bg-white/80 border-gray-200'}`}>
        <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Logo y Título */}
            <div className="flex items-center gap-3 md:gap-6">
              <Link
                href="/"
                className={`flex items-center gap-2 md:gap-3 px-3 md:px-4 py-2 rounded-xl transition-all duration-300 group ${darkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}`}
              >
                <ArrowLeft className={`w-4 h-4 md:w-5 md:h-5 transition-colors ${darkMode ? 'text-indigo-400 group-hover:text-white' : 'text-indigo-600 group-hover:text-indigo-800'}`} />
                <span className={`text-xs md:text-sm font-semibold hidden sm:inline transition-colors ${darkMode ? 'text-indigo-400 group-hover:text-white' : 'text-indigo-600 group-hover:text-indigo-800'}`}>Volver</span>
              </Link>
              
              <div className={`h-6 md:h-8 w-px hidden sm:block ${darkMode ? 'bg-gray-700' : 'bg-gray-300'}`}></div>
              
              <div className="flex items-center gap-2 md:gap-4">
                <div className="w-10 h-10 md:w-14 md:h-14 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-xl md:rounded-2xl flex items-center justify-center shadow-lg relative overflow-hidden">
                  <Shield className="w-5 h-5 md:w-8 md:h-8 text-white relative z-10" />
                  <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                </div>
                <div className="hidden md:block">
                  <h1 className={`text-xl md:text-2xl font-black tracking-tight ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    Dashboard Premium
                  </h1>
                  <p className={`text-xs font-medium ${darkMode ? 'text-indigo-400' : 'text-indigo-600'}`}>
                    Panel de Control Administrativo
                  </p>
                </div>
              </div>
            </div>

            {/* Desktop Actions */}
            <div className="hidden lg:flex items-center gap-3">
              {/* Theme Toggle */}
              <button
                onClick={() => setDarkMode(!darkMode)}
                className={`p-3 rounded-xl font-semibold text-sm transition-all duration-300 shadow-lg hover:scale-110 ${
                  darkMode
                    ? 'bg-gray-800 text-yellow-400 hover:bg-gray-700'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                title={darkMode ? "Modo Claro" : "Modo Oscuro"}
              >
                {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>

              <button
                onClick={() => setAutoRefresh(!autoRefresh)}
                className={`px-5 py-2.5 rounded-xl font-semibold text-sm transition-all duration-300 flex items-center gap-2 shadow-lg hover:scale-105 ${
                  autoRefresh
                    ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white'
                    : darkMode ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Wifi className={`w-4 h-4 ${autoRefresh ? "animate-pulse" : ""}`} />
                {autoRefresh ? "Auto ON" : "Auto OFF"}
              </button>

              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 shadow-lg border cursor-pointer ${
                  darkMode 
                    ? 'bg-gray-800 border-gray-700 text-white hover:bg-gray-700' 
                    : 'bg-white border-gray-200 text-gray-900 hover:bg-gray-50'
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
                className={`px-5 py-2.5 rounded-xl transition-all duration-300 flex items-center gap-2 disabled:opacity-50 shadow-lg hover:scale-105 border ${
                  darkMode 
                    ? 'bg-gray-800 border-gray-700 text-white hover:bg-gray-700' 
                    : 'bg-white border-gray-200 text-gray-900 hover:bg-gray-50'
                }`}
              >
                <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
                <span className="text-sm font-semibold hidden xl:inline">Actualizar</span>
              </button>

              <button
                onClick={exportData}
                className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl transition-all duration-300 flex items-center gap-2 font-semibold shadow-lg hover:scale-105"
              >
                <Download className="w-4 h-4" />
                <span className="text-sm hidden xl:inline">Exportar</span>
              </button>

              {/* User Menu */}
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-300 shadow-lg hover:scale-105 ${
                    darkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:bg-gray-50'
                  }`}
                >
                  <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold shadow-md">
                    {currentUser.nombre[0]}{currentUser.apellido[0]}
                  </div>
                  <div className="text-left hidden xl:block">
                    <p className={`text-sm font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {currentUser.nombre} {currentUser.apellido}
                    </p>
                    <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{currentUser.rol}</p>
                  </div>
                  <ChevronDown className={`w-4 h-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'} hidden xl:block`} />
                </button>

                {showUserMenu && (
                  <div className={`absolute right-0 mt-2 w-64 rounded-xl shadow-2xl border overflow-hidden z-50 ${
                    darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                  }`}>
                    <div className={`px-4 py-3 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                      <p className={`text-sm font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        {getCurrentHour()}, {currentUser.nombre}!
                      </p>
                      <p className={`text-xs mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        {currentUser.email}
                      </p>
                    </div>
                    <div className="py-2">
                      <Link
                        href="/admin/perfil"
                        className={`flex items-center gap-3 px-4 py-3 transition-colors ${
                          darkMode ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-50 text-gray-700'
                        }`}
                      >
                        <User className="w-4 h-4" />
                        <span className="text-sm font-medium">Mi Perfil</span>
                      </Link>
                      <Link
                        href="/admin/configuracion"
                        className={`flex items-center gap-3 px-4 py-3 transition-colors ${
                          darkMode ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-50 text-gray-700'
                        }`}
                      >
                        <Settings className="w-4 h-4" />
                        <span className="text-sm font-medium">Configuración</span>
                      </Link>
                      <div className={`my-2 border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}></div>
                      <button
                        className={`w-full flex items-center gap-3 px-4 py-3 transition-colors ${
                          darkMode ? 'hover:bg-red-900/30 text-red-400' : 'hover:bg-red-50 text-red-600'
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
              className={`lg:hidden p-2 rounded-xl ${darkMode ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-900'}`}
            >
              {showMobileMenu ? <CloseIcon className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Mobile Menu */}
          {showMobileMenu && (
            <div className={`lg:hidden border-t py-4 space-y-3 ${darkMode ? 'border-gray-800' : 'border-gray-200'}`}>
              <button
                onClick={() => setDarkMode(!darkMode)}
                className={`w-full p-3 rounded-xl font-semibold text-sm transition-all duration-300 flex items-center justify-center gap-2 ${
                  darkMode
                    ? 'bg-gray-800 text-yellow-400'
                    : 'bg-gray-100 text-gray-700'
                }`}
              >
                {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                {darkMode ? "Modo Claro" : "Modo Oscuro"}
              </button>

              <button
                onClick={() => setAutoRefresh(!autoRefresh)}
                className={`w-full px-5 py-3 rounded-xl font-semibold text-sm transition-all duration-300 flex items-center justify-center gap-2 ${
                  autoRefresh
                    ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white'
                    : darkMode ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'
                }`}
              >
                <Wifi className={`w-4 h-4 ${autoRefresh ? "animate-pulse" : ""}`} />
                {autoRefresh ? "Auto Refresh ON" : "Auto Refresh OFF"}
              </button>

              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className={`w-full px-5 py-3 rounded-xl text-sm font-semibold border ${
                  darkMode 
                    ? 'bg-gray-800 border-gray-700 text-white' 
                    : 'bg-white border-gray-200 text-gray-900'
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
                    ? 'bg-gray-800 border-gray-700 text-white' 
                    : 'bg-white border-gray-200 text-gray-900'
                }`}
              >
                <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
                <span className="text-sm font-semibold">Actualizar</span>
              </button>

              <button
                onClick={exportData}
                className="w-full px-5 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl transition-all duration-300 flex items-center justify-center gap-2 font-semibold"
              >
                <Download className="w-4 h-4" />
                <span className="text-sm">Exportar Datos</span>
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-8">
        {/* Saludo Personalizado - Responsive */}
        <div className={`mb-6 md:mb-8 rounded-2xl md:rounded-3xl p-6 md:p-8 shadow-xl border ${
          darkMode 
            ? 'bg-gradient-to-r from-indigo-900/50 to-purple-900/50 border-indigo-500/20' 
            : 'bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-200'
        }`}>
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <h2 className={`text-2xl md:text-3xl font-black mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {getCurrentHour()}, {currentUser.nombre}! 👋
              </h2>
              <p className={`text-sm md:text-lg ${darkMode ? 'text-indigo-300' : 'text-indigo-700'} font-medium`}>
                Bienvenido al panel de administración de MediSuite Pro
              </p>
            </div>
            <div className={`flex items-center gap-3 md:gap-4 px-4 md:px-6 py-3 rounded-xl md:rounded-2xl ${
              darkMode ? 'bg-gray-800/50' : 'bg-white/50'
            }`}>
              <Sparkles className="w-5 h-5 md:w-6 md:h-6 text-yellow-500 animate-pulse" />
              <div>
                <p className={`text-xs md:text-sm font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {estadisticas.usuarios_conectados} usuarios en línea
                </p>
                <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Sistema operativo al {estadisticas.uptime_sistema}%
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Alertas - Responsive */}
        {alertas && alertas.length > 0 && (
          <div className="mb-6 md:mb-8 space-y-3 md:space-y-4">
            {alertas.map((alerta) => (
              <div
                key={alerta.id}
                className={`rounded-xl md:rounded-2xl border p-4 md:p-5 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 ${getAlertColor(alerta.tipo)}`}
              >
                <div className="flex items-start gap-3 md:gap-4">
                  <div className="flex-shrink-0 mt-1">
                    {getAlertIcon(alerta.tipo)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2 gap-2">
                      <h4 className="text-sm md:text-base font-bold">{alerta.titulo}</h4>
                      <span className="text-xs font-semibold opacity-75 whitespace-nowrap">
                        {getTimeAgo(alerta.timestamp)}
                      </span>
                    </div>
                    <p className="text-xs md:text-sm opacity-90 mb-2">{alerta.mensaje}</p>
                    {alerta.accion_requerida && (
                      <p className="text-xs font-bold mt-3 opacity-75 flex items-center gap-2">
                        <Zap className="w-3 h-3" />
                        {alerta.accion_requerida}
                      </p>
                    )}
                  </div>
                  <button className={`flex-shrink-0 px-3 md:px-4 py-2 rounded-lg text-xs md:text-sm font-bold opacity-75 hover:opacity-100 transition-all duration-200 ${
                    darkMode ? 'bg-white/10 hover:bg-white/20' : 'bg-black/10 hover:bg-black/20'
                  }`}>
                    Resolver
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ACCESO RÁPIDO - Responsive Grid */}
        <div className="mb-6 md:mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 md:mb-6 gap-3">
            <div>
              <h2 className={`text-2xl md:text-3xl font-black mb-2 flex items-center gap-2 md:gap-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                <Zap className="w-6 h-6 md:w-8 md:h-8 text-yellow-500 animate-pulse" />
                Acceso Rápido
              </h2>
              <p className={`text-xs md:text-sm font-medium ${darkMode ? 'text-indigo-400' : 'text-indigo-600'}`}>
                Navega directamente a cualquier módulo del sistema
              </p>
            </div>
            <div className={`flex items-center gap-2 px-3 md:px-4 py-2 rounded-xl border ${
              darkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-white/50 border-gray-200'
            }`}>
              <Sparkles className="w-4 h-4 text-yellow-500" />
              <span className={`text-xs md:text-sm font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {quickAccessButtons.length} Módulos
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
            {quickAccessButtons.map((button, index) => (
              <Link
                key={index}
                href={button.href}
                className={`group relative overflow-hidden rounded-xl md:rounded-2xl p-5 md:p-6 transition-all duration-500 hover:scale-105 hover:shadow-2xl border ${
                  darkMode 
                    ? 'bg-gray-800/50 border-gray-700 hover:border-indigo-500/50' 
                    : 'bg-white border-gray-200 hover:border-indigo-300'
                }`}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${button.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500`}></div>
                
                <div className="flex items-center justify-between mb-4">
                  <span className={`px-2.5 md:px-3 py-1 rounded-full text-xs font-bold ${button.badgeColor}`}>
                    {button.badge}
                  </span>
                  <ChevronRight className={`w-4 h-4 md:w-5 md:h-5 transition-all duration-300 ${
                    darkMode ? 'text-indigo-400 group-hover:text-white' : 'text-indigo-600 group-hover:text-indigo-800'
                  } group-hover:translate-x-1`} />
                </div>

                <div className={`w-14 h-14 md:w-16 md:h-16 rounded-xl md:rounded-2xl bg-gradient-to-br ${button.gradient} flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform duration-500`}>
                  <div className="text-white">{button.icon}</div>
                </div>

                <h3 className={`text-base md:text-lg font-bold mb-2 transition-colors duration-300 ${
                  darkMode ? 'text-white group-hover:text-indigo-400' : 'text-gray-900 group-hover:text-indigo-600'
                }`}>
                  {button.title}
                </h3>
                <p className={`text-xs mb-3 line-clamp-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {button.description}
                </p>

                {button.count !== undefined && (
                  <div className={`mt-3 pt-3 border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-semibold ${darkMode ? 'text-indigo-400' : 'text-indigo-600'}`}>
                        Total
                      </span>
                      <span className={`text-lg md:text-xl font-black ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        {button.isCurrency ? formatCurrency(button.count) : formatNumber(button.count)}
                      </span>
                    </div>
                  </div>
                )}

                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
              </Link>
            ))}
          </div>
        </div>

        {/* Tabs Premium - Responsive */}
        <div className={`mb-6 md:mb-8 rounded-xl md:rounded-2xl p-2 border shadow-lg ${
          darkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-200'
        }`}>
          <div className="flex gap-2">
            <button
              onClick={() => setSelectedTab("overview")}
              className={`flex-1 px-4 md:px-6 py-3 md:py-4 rounded-lg md:rounded-xl font-bold text-xs md:text-sm transition-all duration-300 ${
                selectedTab === "overview"
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg'
                  : darkMode ? 'text-gray-400 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <Activity className="w-4 h-4 md:w-5 md:h-5" />
                <span className="hidden sm:inline">Vista General</span>
                <span className="sm:hidden">General</span>
              </div>
            </button>
            <button
              onClick={() => setSelectedTab("analytics")}
              className={`flex-1 px-4 md:px-6 py-3 md:py-4 rounded-lg md:rounded-xl font-bold text-xs md:text-sm transition-all duration-300 ${
                selectedTab === "analytics"
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg'
                  : darkMode ? 'text-gray-400 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <BarChart3 className="w-4 h-4 md:w-5 md:h-5" />
                <span className="hidden sm:inline">Analytics Avanzado</span>
                <span className="sm:hidden">Analytics</span>
              </div>
            </button>
          </div>
        </div>

        {/* VISTA GENERAL - Responsive */}
        {selectedTab === "overview" && (
          <div className="space-y-6 md:space-y-8">
            {/* KPIs Premium - Responsive Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              {/* Centros Médicos KPI */}
              <div className={`relative overflow-hidden rounded-2xl md:rounded-3xl p-6 md:p-8 shadow-2xl hover:shadow-blue-500/50 transition-all duration-500 group hover:scale-105 border ${
                darkMode 
                  ? 'bg-gradient-to-br from-blue-900/30 to-indigo-900/30 border-blue-500/20' 
                  : 'bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200'
              }`}>
                <div className={`absolute top-0 right-0 w-24 h-24 md:w-32 md:h-32 rounded-full blur-3xl transition-all duration-500 ${
                  darkMode ? 'bg-blue-500/20 group-hover:bg-blue-500/30' : 'bg-blue-300/30 group-hover:bg-blue-300/50'
                }`}></div>
                
                <div className="flex items-center justify-between mb-4 md:mb-6">
                  <div className="w-12 h-12 md:w-16 md:h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl md:rounded-2xl flex items-center justify-center shadow-lg relative z-10">
                    <Building2 className="w-6 h-6 md:w-8 md:h-8 text-white" />
                  </div>
                  <div className="text-right">
                    <div className={`text-3xl md:text-4xl font-black mb-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {formatNumber(estadisticas.total_centros)}
                    </div>
                    <div className={`text-xs font-bold uppercase tracking-wider ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                      Centros
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs md:text-sm">
                    <span className={`font-medium ${darkMode ? 'text-blue-300' : 'text-blue-600'}`}>Activos</span>
                    <span className="text-green-500 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 md:w-4 md:h-4" />
                      {estadisticas.centros_activos}
                    </span>
                  </div>
                  {estadisticas.centros_suspendidos > 0 && (
                    <div className="flex items-center justify-between text-xs md:text-sm">
                      <span className={`font-medium ${darkMode ? 'text-blue-300' : 'text-blue-600'}`}>Suspendidos</span>
                      <span className="text-red-500 font-bold">{estadisticas.centros_suspendidos}</span>
                    </div>
                  )}
                </div>

                <div className={`mt-4 pt-4 border-t ${darkMode ? 'border-blue-500/20' : 'border-blue-200'}`}>
                  <div className={`flex items-center gap-2 text-xs font-semibold ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                    <TrendingUp className="w-3 h-3 md:w-4 md:h-4" />
                    <span>Rendimiento óptimo</span>
                  </div>
                </div>
              </div>

              {/* Usuarios KPI */}
              <div className={`relative overflow-hidden rounded-2xl md:rounded-3xl p-6 md:p-8 shadow-2xl hover:shadow-purple-500/50 transition-all duration-500 group hover:scale-105 border ${
                darkMode 
                  ? 'bg-gradient-to-br from-purple-900/30 to-pink-900/30 border-purple-500/20' 
                  : 'bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200'
              }`}>
                <div className={`absolute top-0 right-0 w-24 h-24 md:w-32 md:h-32 rounded-full blur-3xl transition-all duration-500 ${
                  darkMode ? 'bg-purple-500/20 group-hover:bg-purple-500/30' : 'bg-purple-300/30 group-hover:bg-purple-300/50'
                }`}></div>
                
                <div className="flex items-center justify-between mb-4 md:mb-6">
                  <div className="w-12 h-12 md:w-16 md:h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl md:rounded-2xl flex items-center justify-center shadow-lg relative z-10">
                    <Users className="w-6 h-6 md:w-8 md:h-8 text-white" />
                  </div>
                  <div className="text-right">
                    <div className={`text-3xl md:text-4xl font-black mb-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {formatNumber(estadisticas.total_usuarios)}
                    </div>
                    <div className={`text-xs font-bold uppercase tracking-wider ${darkMode ? 'text-purple-400' : 'text-purple-600'}`}>
                      Usuarios
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs md:text-sm">
                    <span className={`font-medium ${darkMode ? 'text-purple-300' : 'text-purple-600'}`}>En Línea</span>
                    <span className="text-green-500 font-bold flex items-center gap-1">
                      <Wifi className="w-3 h-3 md:w-4 md:h-4 animate-pulse" />
                      {estadisticas.usuarios_conectados}
                    </span>
                  </div>
                  {estadisticas.usuarios_pendientes > 0 && (
                    <div className="flex items-center justify-between text-xs md:text-sm">
                      <span className={`font-medium ${darkMode ? 'text-purple-300' : 'text-purple-600'}`}>Pendientes</span>
                      <span className="text-yellow-500 font-bold">{estadisticas.usuarios_pendientes}</span>
                    </div>
                  )}
                </div>

                <div className={`mt-4 pt-4 border-t ${darkMode ? 'border-purple-500/20' : 'border-purple-200'}`}>
                  <div className={`flex items-center gap-2 text-xs font-semibold ${darkMode ? 'text-purple-400' : 'text-purple-600'}`}>
                    <Activity className="w-3 h-3 md:w-4 md:h-4" />
                    <span>Alta actividad</span>
                  </div>
                </div>
              </div>

              {/* Médicos KPI */}
              <div className={`relative overflow-hidden rounded-2xl md:rounded-3xl p-6 md:p-8 shadow-2xl hover:shadow-green-500/50 transition-all duration-500 group hover:scale-105 border ${
                darkMode 
                  ? 'bg-gradient-to-br from-green-900/30 to-emerald-900/30 border-green-500/20' 
                  : 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-200'
              }`}>
                <div className={`absolute top-0 right-0 w-24 h-24 md:w-32 md:h-32 rounded-full blur-3xl transition-all duration-500 ${
                  darkMode ? 'bg-green-500/20 group-hover:bg-green-500/30' : 'bg-green-300/30 group-hover:bg-green-300/50'
                }`}></div>
                
                <div className="flex items-center justify-between mb-4 md:mb-6">
                  <div className="w-12 h-12 md:w-16 md:h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl md:rounded-2xl flex items-center justify-center shadow-lg relative z-10">
                    <Stethoscope className="w-6 h-6 md:w-8 md:h-8 text-white" />
                  </div>
                  <div className="text-right">
                    <div className={`text-3xl md:text-4xl font-black mb-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {formatNumber(estadisticas.total_medicos)}
                    </div>
                    <div className={`text-xs font-bold uppercase tracking-wider ${darkMode ? 'text-green-400' : 'text-green-600'}`}>
                      Médicos
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs md:text-sm">
                    <span className={`font-medium ${darkMode ? 'text-green-300' : 'text-green-600'}`}>Activos</span>
                    <span className="text-green-500 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 md:w-4 md:h-4" />
                      {estadisticas.medicos_activos}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs md:text-sm">
                    <span className={`font-medium ${darkMode ? 'text-green-300' : 'text-green-600'}`}>Especialidades</span>
                    <span className="text-blue-500 font-bold">{estadisticas.total_especialidades}</span>
                  </div>
                </div>

                <div className={`mt-4 pt-4 border-t ${darkMode ? 'border-green-500/20' : 'border-green-200'}`}>
                  <div className={`flex items-center gap-2 text-xs font-semibold ${darkMode ? 'text-green-400' : 'text-green-600'}`}>
                    <Award className="w-3 h-3 md:w-4 md:h-4" />
                    <span>Equipo completo</span>
                  </div>
                </div>
              </div>

              {/* Pacientes KPI */}
              <div className={`relative overflow-hidden rounded-2xl md:rounded-3xl p-6 md:p-8 shadow-2xl hover:shadow-orange-500/50 transition-all duration-500 group hover:scale-105 border ${
                darkMode 
                  ? 'bg-gradient-to-br from-orange-900/30 to-red-900/30 border-orange-500/20' 
                  : 'bg-gradient-to-br from-orange-50 to-red-50 border-orange-200'
              }`}>
                <div className={`absolute top-0 right-0 w-24 h-24 md:w-32 md:h-32 rounded-full blur-3xl transition-all duration-500 ${
                  darkMode ? 'bg-orange-500/20 group-hover:bg-orange-500/30' : 'bg-orange-300/30 group-hover:bg-orange-300/50'
                }`}></div>
                
                <div className="flex items-center justify-between mb-4 md:mb-6">
                  <div className="w-12 h-12 md:w-16 md:h-16 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl md:rounded-2xl flex items-center justify-center shadow-lg relative z-10">
                    <UserPlus className="w-6 h-6 md:w-8 md:h-8 text-white" />
                  </div>
                  <div className="text-right">
                    <div className={`text-3xl md:text-4xl font-black mb-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {formatNumber(estadisticas.total_pacientes)}
                    </div>
                    <div className={`text-xs font-bold uppercase tracking-wider ${darkMode ? 'text-orange-400' : 'text-orange-600'}`}>
                      Pacientes
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs md:text-sm">
                    <span className={`font-medium ${darkMode ? 'text-orange-300' : 'text-orange-600'}`}>Nuevos/Mes</span>
                    <span className="text-green-500 font-bold flex items-center gap-1">
                      <TrendingUp className="w-3 h-3 md:w-4 md:h-4" />
                      +{estadisticas.nuevos_pacientes_mes}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs md:text-sm">
                    <span className={`font-medium ${darkMode ? 'text-orange-300' : 'text-orange-600'}`}>Activos</span>
                    <span className="text-blue-500 font-bold">{estadisticas.pacientes_activos}</span>
                  </div>
                </div>

                <div className={`mt-4 pt-4 border-t ${darkMode ? 'border-orange-500/20' : 'border-orange-200'}`}>
                  <div className={`flex items-center gap-2 text-xs font-semibold ${darkMode ? 'text-orange-400' : 'text-orange-600'}`}>
                    <Heart className="w-3 h-3 md:w-4 md:h-4" />
                    <span>Crecimiento sostenido</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Métricas Destacadas - Responsive */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {/* Consultas Hoy */}
              <div className="relative overflow-hidden rounded-2xl md:rounded-3xl bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 p-6 md:p-8 shadow-2xl">
                <div className="absolute top-0 right-0 w-32 h-32 md:w-40 md:h-40 bg-white/10 rounded-full blur-3xl"></div>
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <Activity className="w-8 h-8 md:w-10 md:h-10 text-white/80" />
                    <Calendar className="w-5 h-5 md:w-6 md:h-6 text-white/60" />
                  </div>
                  <div className="text-4xl md:text-5xl font-black text-white mb-2">
                    {formatNumber(estadisticas.consultas_hoy)}
                  </div>
                  <p className="text-indigo-100 text-xs md:text-sm font-bold mb-4">
                    Consultas de Hoy
                  </p>
                  <div className="flex flex-wrap items-center gap-2 md:gap-4 text-xs text-indigo-100 font-semibold">
                    <span>{formatNumber(estadisticas.consultas_mes)} este mes</span>
                    <span>•</span>
                    <span>{formatNumber(estadisticas.consultas_ano)} este año</span>
                  </div>
                </div>
              </div>

              {/* Ingresos del Mes */}
              <div className="relative overflow-hidden rounded-2xl md:rounded-3xl bg-gradient-to-br from-emerald-600 via-green-600 to-teal-600 p-6 md:p-8 shadow-2xl">
                <div className="absolute top-0 right-0 w-32 h-32 md:w-40 md:h-40 bg-white/10 rounded-full blur-3xl"></div>
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <DollarSign className="w-8 h-8 md:w-10 md:h-10 text-white/80" />
                    <TrendingUp className="w-5 h-5 md:w-6 md:h-6 text-white/60" />
                  </div>
                  <div className="text-2xl md:text-3xl font-black text-white mb-2">
                    {formatCurrency(estadisticas.ingresos_mes)}
                  </div>
                  <p className="text-emerald-100 text-xs md:text-sm font-bold mb-4">
                    Ingresos del Mes
                  </p>
                  <div className="flex items-center gap-2 text-xs text-emerald-100 font-semibold">
                    <span>{formatCurrency(estadisticas.ingresos_ano)} este año</span>
                  </div>
                </div>
              </div>

              {/* Pendiente de Cobro */}
              <div className="relative overflow-hidden rounded-2xl md:rounded-3xl bg-gradient-to-br from-amber-600 via-yellow-600 to-orange-600 p-6 md:p-8 shadow-2xl md:col-span-2 lg:col-span-1">
                <div className="absolute top-0 right-0 w-32 h-32 md:w-40 md:h-40 bg-white/10 rounded-full blur-3xl"></div>
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <Clock className="w-8 h-8 md:w-10 md:h-10 text-white/80" />
                    <AlertTriangle className="w-5 h-5 md:w-6 md:h-6 text-white/60" />
                  </div>
                  <div className="text-2xl md:text-3xl font-black text-white mb-2">
                    {formatCurrency(estadisticas.pendiente_cobro)}
                  </div>
                  <p className="text-amber-100 text-xs md:text-sm font-bold mb-4">
                    Pendiente de Cobro
                  </p>
                  <button className="mt-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-xl text-xs font-bold text-white transition-all duration-300 hover:scale-105">
                    Gestionar Cobros
                  </button>
                </div>
              </div>
            </div>

            {/* Métricas de Calidad - Responsive */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              {/* Satisfacción */}
              <div className={`rounded-xl md:rounded-2xl p-5 md:p-6 hover:shadow-xl transition-all duration-300 border ${
                darkMode ? 'bg-gray-800/50 border-gray-700 hover:border-yellow-500/50' : 'bg-white border-gray-200 hover:border-yellow-300'
              }`}>
                <div className="flex items-center gap-3 md:gap-4 mb-4">
                  <div className="w-12 h-12 md:w-14 md:h-14 bg-gradient-to-br from-yellow-500 to-amber-600 rounded-xl flex items-center justify-center shadow-lg">
                    <Star className="w-6 h-6 md:w-7 md:h-7 text-white" />
                  </div>
                  <div>
                    <div className={`text-2xl md:text-3xl font-black ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {estadisticas.satisfaccion_promedio}
                    </div>
                    <div className="text-xs text-yellow-600 font-semibold">Satisfacción</div>
                  </div>
                </div>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-4 h-4 md:w-5 md:h-5 ${
                        star <= estadisticas.satisfaccion_promedio
                          ? "fill-yellow-400 text-yellow-400"
                          : darkMode ? "text-gray-600" : "text-gray-300"
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Tiempo de Espera */}
              <div className={`rounded-xl md:rounded-2xl p-5 md:p-6 hover:shadow-xl transition-all duration-300 border ${
                darkMode ? 'bg-gray-800/50 border-gray-700 hover:border-blue-500/50' : 'bg-white border-gray-200 hover:border-blue-300'
              }`}>
                <div className="flex items-center gap-3 md:gap-4 mb-4">
                  <div className="w-12 h-12 md:w-14 md:h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                    <Clock className="w-6 h-6 md:w-7 md:h-7 text-white" />
                  </div>
                  <div>
                    <div className={`text-2xl md:text-3xl font-black ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {estadisticas.tiempo_espera_promedio}m
                    </div>
                    <div className="text-xs text-blue-600 font-semibold">Tiempo Espera</div>
                  </div>
                </div>
                <p className={`text-xs ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>Promedio de espera</p>
              </div>

              {/* Tasa de Cancelación */}
              <div className={`rounded-xl md:rounded-2xl p-5 md:p-6 hover:shadow-xl transition-all duration-300 border ${
                darkMode ? 'bg-gray-800/50 border-gray-700 hover:border-red-500/50' : 'bg-white border-gray-200 hover:border-red-300'
              }`}>
                <div className="flex items-center gap-3 md:gap-4 mb-4">
                  <div className="w-12 h-12 md:w-14 md:h-14 bg-gradient-to-br from-red-500 to-rose-600 rounded-xl flex items-center justify-center shadow-lg">
                    <XCircle className="w-6 h-6 md:w-7 md:h-7 text-white" />
                  </div>
                  <div>
                    <div className={`text-2xl md:text-3xl font-black ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {estadisticas.tasa_cancelacion}%
                    </div>
                    <div className="text-xs text-red-600 font-semibold">Cancelaciones</div>
                  </div>
                </div>
                <div className={`w-full rounded-full h-2 ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
                  <div
                    className="bg-gradient-to-r from-red-500 to-rose-600 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${estadisticas.tasa_cancelacion * 10}%` }}
                  ></div>
                </div>
              </div>

              {/* Uptime del Sistema */}
              <div className={`rounded-xl md:rounded-2xl p-5 md:p-6 hover:shadow-xl transition-all duration-300 border ${
                darkMode ? 'bg-gray-800/50 border-gray-700 hover:border-green-500/50' : 'bg-white border-gray-200 hover:border-green-300'
              }`}>
                <div className="flex items-center gap-3 md:gap-4 mb-4">
                  <div className="w-12 h-12 md:w-14 md:h-14 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                    <Server className="w-6 h-6 md:w-7 md:h-7 text-white" />
                  </div>
                  <div>
                    <div className={`text-2xl md:text-3xl font-black ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {estadisticas.uptime_sistema}%
                    </div>
                    <div className="text-xs text-green-600 font-semibold">Uptime</div>
                  </div>
                </div>
                <div className={`w-full rounded-full h-2 ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
                  <div
                    className="bg-gradient-to-r from-green-500 to-emerald-600 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${estadisticas.uptime_sistema}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Footer Premium - Responsive */}
        <div className={`mt-6 md:mt-8 rounded-xl md:rounded-2xl p-4 md:p-6 shadow-xl border ${
          darkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-200'
        }`}>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs md:text-sm">
            <div className="flex items-center gap-2 md:gap-3">
              <Clock className={`w-4 h-4 md:w-5 md:h-5 ${darkMode ? 'text-indigo-400' : 'text-indigo-600'}`} />
              <span className={`font-semibold ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Última actualización:{" "}
                <span className={`font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {lastUpdate ? formatDate(lastUpdate.toISOString()) : "N/A"}
                </span>
              </span>
            </div>
            <div className="flex items-center gap-2 md:gap-3">
              <div className="w-2 h-2 md:w-3 md:h-3 bg-green-500 rounded-full animate-pulse shadow-lg shadow-green-500/50"></div>
              <Server className="w-4 h-4 md:w-5 md:h-5 text-green-500" />
              <span className="text-green-500 font-bold">Sistema Operativo</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}