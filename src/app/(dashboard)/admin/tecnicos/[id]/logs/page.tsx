"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  FileText,
  AlertCircle,
  CheckCircle,
  Info,
  AlertTriangle,
  Shield,
  Clock,
  Filter,
  Download,
  Search,
  Loader2,
  Moon,
  Sun,
  Palette,
  Sparkles,
  BarChart3,
  TrendingUp,
  Eye,
  EyeOff,
  Copy,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Zap,
  Activity,
  Users,
  Layers,
  Target,
  Award,
  Flame,
  GitBranch,
  Cpu,
  Wifi,
  MessageSquare,
  Send,
  Plus,
  Minus,
  Calendar,
  MapPin,
  Globe,
  Smartphone,
  Heart,
  AlertCircle as AlertCircleIcon,
  CheckSquare,
  Square,
} from "lucide-react";
import {
  BarChart,
  Bar,
  LineChart,
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
  ScatterChart,
  Scatter,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ComposedChart,
} from "recharts";

interface Log {
  id_log: number;
  fecha_hora: string;
  accion: string;
  modulo: string;
  descripcion: string;
  ip_origen: string;
  user_agent: string;
  nivel_severidad: number;
  detalles_json: string;
}

interface LogStats {
  total_logs: number;
  logs_por_modulo: Array<{ modulo: string; cantidad: number }>;
  logs_por_accion: Array<{ accion: string; cantidad: number }>;
  logs_por_severidad: Array<{ nivel: number; cantidad: number; nombre: string }>;
  logs_por_hora: Array<{ hora: number; cantidad: number }>;
  logs_por_dia: Array<{ dia: string; cantidad: number }>;
  modulos_mas_activos: Array<{
    modulo: string;
    accesos: number;
    ultimo_acceso: string;
  }>;
  acciones_frecuentes: Array<{ accion: string; frecuencia: number }>;
  ips_mas_frecuentes: Array<{ ip: string; accesos: number }>;
  user_agents: Array<{ user_agent: string; accesos: number }>;
}

// ==============================
// 🎨 Temas de color premium
// ==============================
const colorThemes = {
  aurora: {
    name: "Aurora Boreal",
    primary: "from-violet-600 via-purple-600 to-fuchsia-600",
    accent: "from-purple-400 to-pink-400",
    glow: "shadow-purple-500/50",
    light: "#818cf8",
    dark: "#6366f1",
  },
  ocean: {
    name: "Océano Profundo",
    primary: "from-cyan-500 via-blue-600 to-indigo-700",
    accent: "from-cyan-400 to-blue-400",
    glow: "shadow-blue-500/50",
    light: "#60a5fa",
    dark: "#3b82f6",
  },
  sunset: {
    name: "Atardecer Dorado",
    primary: "from-orange-500 via-red-500 to-pink-600",
    accent: "from-orange-400 to-red-400",
    glow: "shadow-orange-500/50",
    light: "#fbbf24",
    dark: "#f59e0b",
  },
  forest: {
    name: "Bosque Esmeralda",
    primary: "from-emerald-500 via-green-600 to-teal-700",
    accent: "from-emerald-400 to-green-400",
    glow: "shadow-emerald-500/50",
    light: "#34d399",
    dark: "#10b981",
  },
  midnight: {
    name: "Medianoche Estelar",
    primary: "from-slate-600 via-slate-700 to-slate-900",
    accent: "from-slate-400 to-slate-500",
    glow: "shadow-slate-500/50",
    light: "#94a3b8",
    dark: "#64748b",
  },
  royal: {
    name: "Real Dorado",
    primary: "from-amber-500 via-yellow-600 to-orange-600",
    accent: "from-amber-400 to-yellow-400",
    glow: "shadow-amber-500/50",
    light: "#fbbf24",
    dark: "#f59e0b",
  },
  neon: {
    name: "Neón Ciberpunk",
    primary: "from-pink-500 via-purple-500 to-cyan-500",
    accent: "from-pink-400 to-cyan-400",
    glow: "shadow-pink-500/50",
    light: "#f472b6",
    dark: "#ec4899",
  },
  sakura: {
    name: "Flor de Cerezo",
    primary: "from-pink-400 via-rose-400 to-red-400",
    accent: "from-pink-300 to-rose-300",
    glow: "shadow-rose-500/50",
    light: "#fb7185",
    dark: "#f43f5e",
  },
} as const;

const COLORS_LIGHT = [
  "#6366f1",
  "#8b5cf6",
  "#ec4899",
  "#f59e0b",
  "#10b981",
  "#3b82f6",
  "#f97316",
  "#14b8a6",
];

const COLORS_DARK = [
  "#818cf8",
  "#a78bfa",
  "#f472b6",
  "#fbbf24",
  "#34d399",
  "#60a5fa",
  "#fb923c",
  "#2dd4bf",
];

// ==============================
// 📊 COMPONENTES REUTILIZABLES
// ==============================

interface StatCardProps {
  icon: React.ReactNode;
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: number;
  color: string;
  darkMode: boolean;
  theme: (typeof colorThemes)[keyof typeof colorThemes];
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  cardBg: string;
  borderColor: string;
}

const StatCard = ({
  icon,
  title,
  value,
  subtitle,
  trend,
  color,
  darkMode,
  theme,
  textPrimary,
  textSecondary,
  textMuted,
  cardBg,
  borderColor,
}: StatCardProps) => (
  <div
    className={`${cardBg} rounded-2xl shadow-2xl border ${borderColor} p-6 group hover:scale-105 transition-all duration-300 overflow-hidden relative`}
  >
    <div
      className={`absolute -top-1/2 -right-1/2 w-full h-full bg-gradient-to-br ${theme.primary} opacity-5 blur-3xl group-hover:opacity-10 transition-opacity`}
    ></div>
    <div className="relative z-10">
      <div className="flex items-center justify-between mb-4">
        <div
          className={`p-3 bg-gradient-to-br ${theme.primary} rounded-xl shadow-lg`}
        >
          {icon}
        </div>
        {trend !== undefined && (
          <div
            className={`flex items-center gap-1 text-xs font-black px-2 py-1 rounded-full ${
              trend > 0
                ? darkMode
                  ? "bg-emerald-500/20 text-emerald-300"
                  : "bg-emerald-50 text-emerald-600"
                : darkMode
                ? "bg-rose-500/20 text-rose-300"
                : "bg-rose-50 text-rose-600"
            }`}
          >
            {trend > 0 ? (
              <TrendingUp className="w-3 h-3" />
            ) : (
              <TrendingUp className="w-3 h-3 rotate-180" />
            )}
            {Math.abs(trend)}%
          </div>
        )}
      </div>
      <p className={`${textMuted} text-sm font-bold uppercase tracking-wider mb-1`}>
        {title}
      </p>
      <p className={`text-3xl font-black ${textPrimary}`}>{value}</p>
      {subtitle && (
        <div className="mt-4 flex items-center gap-2 text-sm">
          <div
            className={`w-2 h-2 rounded-full bg-gradient-to-r ${theme.primary}`}
          ></div>
          <span className={textSecondary}>{subtitle}</span>
        </div>
      )}
    </div>
  </div>
);

// ==============================
// 🎯 PÁGINA PRINCIPAL
// ==============================

export default function LogsUsuarioPage({
  params,
}: {
  params: { id: string };
}) {
  const [logs, setLogs] = useState<Log[]>([]);
  const [logStats, setLogStats] = useState<LogStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const [filtros, setFiltros] = useState({
    busqueda: "",
    modulo: "",
    accion: "",
    nivel_severidad: "",
    fecha_desde: "",
    fecha_hasta: "",
  });

  const [paginacion, setPaginacion] = useState({
    page: 1,
    limit: 50,
    total: 0,
    total_pages: 0,
  });

  // ==========================
  // 🌗 Tema / UI
  // ==========================
  const [darkMode, setDarkMode] = useState(false);
  const [selectedTheme, setSelectedTheme] =
    useState<keyof typeof colorThemes>("aurora");
  const [mostrarThemeSelector, setMostrarThemeSelector] = useState(false);
  const [expandedLog, setExpandedLog] = useState<number | null>(null);
  const [mostrarEstadisticas, setMostrarEstadisticas] = useState(true);
  const [mostrarDetalles, setMostrarDetalles] = useState<{
    [key: string]: boolean;
  }>({});

  const theme = colorThemes[selectedTheme];

  const bgClass = darkMode
    ? "bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-800 to-black"
    : "bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-50 via-white to-slate-100";

  const cardBg = darkMode
    ? "bg-gradient-to-br from-slate-800/40 via-slate-900/40 to-slate-800/40 backdrop-blur-2xl border-white/5"
    : "bg-white/60 backdrop-blur-2xl border-white/20";

  const textPrimary = darkMode ? "text-white" : "text-slate-900";
  const textSecondary = darkMode ? "text-slate-300" : "text-slate-600";
  const textMuted = darkMode ? "text-slate-400" : "text-slate-500";
  const borderColor = darkMode ? "border-white/10" : "border-slate-200/50";
  const hoverBg = darkMode ? "hover:bg-white/5" : "hover:bg-slate-50/50";
  const inputBg = darkMode ? "bg-slate-900/50" : "bg-white";

  useEffect(() => {
    const savedDarkMode = localStorage.getItem("darkMode") === "true";
    const savedTheme =
      (localStorage.getItem("colorTheme") as keyof typeof colorThemes) ||
      "aurora";

    setDarkMode(savedDarkMode);
    if (savedTheme && colorThemes[savedTheme]) {
      setSelectedTheme(savedTheme);
    }
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    if (darkMode) root.classList.add("dark");
    else root.classList.remove("dark");
    localStorage.setItem("darkMode", String(darkMode));
  }, [darkMode]);

  const toggleDarkMode = () => setDarkMode((v) => !v);

  const changeTheme = (themeKey: keyof typeof colorThemes) => {
    setSelectedTheme(themeKey);
    localStorage.setItem("colorTheme", themeKey);
    setMostrarThemeSelector(false);
  };

  // ==========================
  // 📥 Datos
  // ==========================
  useEffect(() => {
    cargarLogs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id, paginacion.page, filtros]);

  const cargarLogs = async () => {
    try {
      setLoading(true);
      const params_url = new URLSearchParams({
        page: paginacion.page.toString(),
        limit: paginacion.limit.toString(),
        ...(filtros.busqueda && { busqueda: filtros.busqueda }),
        ...(filtros.modulo && { modulo: filtros.modulo }),
        ...(filtros.accion && { accion: filtros.accion }),
        ...(filtros.nivel_severidad && {
          nivel_severidad: filtros.nivel_severidad,
        }),
        ...(filtros.fecha_desde && { fecha_desde: filtros.fecha_desde }),
        ...(filtros.fecha_hasta && { fecha_hasta: filtros.fecha_hasta }),
      });

      const response = await fetch(
        `/api/admin/usuarios/${params.id}/logs?${params_url}`
      );
      const data = await response.json();

      if (data.success) {
        setLogs(data.data.logs);
        setLogStats(data.data.stats || null);
        setPaginacion((prev) => ({
          ...prev,
          total: data.data.paginacion.total,
          total_pages: data.data.paginacion.total_pages,
        }));
        setError(null);
      } else {
        setError(data.error || "Error al cargar logs");
      }
    } catch (err: any) {
      setError(err.message || "Error al cargar logs");
    } finally {
      setLoading(false);
    }
  };

  const refrescarDatos = async () => {
    setRefreshing(true);
    await cargarLogs();
    setRefreshing(false);
  };

  const getNivelSeveridadBadge = (nivel: number) => {
    const badges = {
      1: {
        color: darkMode
          ? "bg-blue-500/20 text-blue-300 border-blue-500/40"
          : "bg-blue-50 text-blue-800 border-blue-200",
        icon: Info,
        texto: "Info",
        bgGradient: "from-blue-500 to-cyan-600",
      },
      2: {
        color: darkMode
          ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
          : "bg-green-50 text-green-800 border-green-200",
        icon: CheckCircle,
        texto: "Éxito",
        bgGradient: "from-emerald-500 to-green-600",
      },
      3: {
        color: darkMode
          ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
          : "bg-yellow-50 text-yellow-800 border-yellow-200",
        icon: AlertTriangle,
        texto: "Advertencia",
        bgGradient: "from-amber-500 to-orange-600",
      },
      4: {
        color: darkMode
          ? "bg-rose-500/20 text-rose-300 border-rose-500/40"
          : "bg-red-50 text-red-800 border-red-200",
        icon: AlertCircle,
        texto: "Error",
        bgGradient: "from-rose-500 to-red-600",
      },
      5: {
        color: darkMode
          ? "bg-purple-500/20 text-purple-300 border-purple-500/40"
          : "bg-purple-50 text-purple-800 border-purple-200",
        icon: Shield,
        texto: "Crítico",
        bgGradient: "from-purple-500 to-indigo-600",
      },
    };

    const badge = badges[nivel as keyof typeof badges] || badges[1];
    const Icon = badge.icon;

    return (
      <span
        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border ${badge.color}`}
      >
        <Icon className="w-3 h-3" />
        {badge.texto}
      </span>
    );
  };

  const exportarLogs = (formato: "csv" | "json") => {
    if (formato === "csv") {
      const csv = [
        [
          "Fecha/Hora",
          "Módulo",
          "Acción",
          "Descripción",
          "IP",
          "Severidad",
        ].join(","),
        ...logs.map((log) =>
          [
            new Date(log.fecha_hora).toLocaleString("es-CL"),
            log.modulo,
            log.accion,
            `"${log.descripcion}"`,
            log.ip_origen,
            log.nivel_severidad,
          ].join(",")
        ),
      ].join("\n");

      const blob = new Blob([csv], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `logs-usuario-${params.id}-${new Date().toISOString().split("T")[0]}.csv`;
      link.click();
    } else if (formato === "json") {
      const dataStr = JSON.stringify(logs, null, 2);
      const dataBlob = new Blob([dataStr], { type: "application/json" });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `logs-usuario-${params.id}-${new Date().toISOString().split("T")[0]}.json`;
      link.click();
    }
  };

  const copiarAlPortapapeles = (texto: string) => {
    navigator.clipboard.writeText(texto);
  };

  // ==========================
  // ⏳ Loading premium
  // ==========================
  if (loading && logs.length === 0) {
    return (
      <div
        className={`min-h-screen ${bgClass} flex items-center justify-center transition-all duration-500`}
      >
        <div className="text-center relative">
          <div className="absolute inset-0 flex items-center justify-center">
            <div
              className={`w-32 h-32 bg-gradient-to-r ${theme.primary} rounded-full blur-3xl opacity-20 animate-pulse`}
            ></div>
          </div>

          <div className="relative mb-6">
            <div
              className={`w-20 h-20 border-4 border-transparent rounded-full animate-spin mx-auto bg-gradient-to-r ${theme.primary} bg-clip-border`}
            ></div>
          </div>

          <div className="relative z-10">
            <h3
              className={`text-2xl font-black ${textPrimary} mb-2 flex items-center gap-2 justify-center`}
            >
              <Sparkles className="w-6 h-6 animate-pulse" />
              Cargando Logs Premium
            </h3>
            <p className={`${textSecondary} font-medium animate-pulse`}>
              Analizando historial del usuario...
            </p>
          </div>
        </div>
      </div>
    );
  }

  const COLORS = darkMode ? COLORS_DARK : COLORS_LIGHT;

  // ==========================
  // 🖼 Layout principal
  // ==========================
  return (
    <div
      className={`min-h-screen ${bgClass} p-3 md:p-6 transition-all duration-500 relative overflow-hidden`}
    >
      {/* Fondo animado */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div
          className={`absolute -top-1/2 -right-1/2 w-full h-full bg-gradient-to-br ${theme.primary} opacity-5 blur-3xl animate-pulse`}
        ></div>
        <div
          className={`absolute -bottom-1/2 -left-1/2 w-full h-full bg-gradient-to-tr ${theme.primary} opacity-5 blur-3xl animate-pulse`}
          style={{ animationDelay: "1s" }}
        ></div>
      </div>

      <div className="max-w-7xl mx-auto space-y-6 relative z-10">
        {/* Controles flotantes */}
        <div className="fixed top-6 right-6 z-50 flex flex-col gap-3">
          {/* Refrescar */}
          <button
            onClick={refrescarDatos}
            disabled={refreshing}
            className={`p-3 ${cardBg} shadow-2xl ${theme.glow} rounded-2xl border ${borderColor} transition-all duration-300 hover:scale-110 group disabled:opacity-50`}
            title="Refrescar datos"
          >
            <RefreshCw
              className={`w-5 h-5 text-blue-400 ${
                refreshing ? "animate-spin" : "group-hover:rotate-180"
              } transition-transform duration-500`}
            />
          </button>

          {/* Dark / Light */}
          <button
            onClick={toggleDarkMode}
            className={`p-3 ${cardBg} shadow-2xl ${theme.glow} rounded-2xl border ${borderColor} transition-all duration-300 hover:scale-110 group`}
            title={darkMode ? "Modo Claro" : "Modo Oscuro"}
          >
            {darkMode ? (
              <Sun className="w-5 h-5 text-yellow-400 group-hover:rotate-180 transition-transform duration-500" />
            ) : (
              <Moon className="w-5 h-5 text-slate-700 group-hover:rotate-12 transition-transform duration-300" />
            )}
          </button>

          {/* Selector de tema */}
          <div className="relative">
            <button
              onClick={() => setMostrarThemeSelector(!mostrarThemeSelector)}
              className={`p-3 ${cardBg} shadow-2xl ${theme.glow} rounded-2xl border ${borderColor} transition-all duration-300 hover:scale-110 group`}
              title="Cambiar Tema"
            >
              <Palette
                className={`w-5 h-5 bg-gradient-to-r ${theme.primary} bg-clip-text text-transparent group-hover:rotate-12 transition-transform duration-300`}
              />
            </button>

            {mostrarThemeSelector && (
              <div
                className={`absolute top-full right-0 mt-3 ${cardBg} ${borderColor} border rounded-2xl shadow-2xl p-4 min-w-[280px] animate-in fade-in slide-in-from-top-2 duration-200 max-h-[400px] overflow-y-auto`}
              >
                <div className="flex items-center gap-2 mb-4 sticky top-0">
                  <Sparkles className={`w-4 h-4 ${textPrimary}`} />
                  <p
                    className={`${textPrimary} font-black text-sm uppercase tracking-wider`}
                  >
                    Temas Premium
                  </p>
                </div>
                <div className="space-y-2">
                  {Object.entries(colorThemes).map(([key, t]) => (
                    <button
                      key={key}
                      onClick={() =>
                        changeTheme(key as keyof typeof colorThemes)
                      }
                      className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-200 group ${
                        selectedTheme === key
                          ? `bg-gradient-to-r ${t.primary} text-white shadow-lg scale-[1.02]`
                          : `${hoverBg} ${textSecondary} hover:scale-[1.01]`
                      }`}
                    >
                      <div
                        className={`w-10 h-10 rounded-lg bg-gradient-to-r ${t.primary} shadow-lg group-hover:scale-110 transition-transform`}
                      ></div>
                      <span className="font-bold text-sm">{t.name}</span>
                      {selectedTheme === key && (
                        <CheckCircle className="w-5 h-5 ml-auto animate-in zoom-in duration-200" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Toggle Estadísticas */}
          <button
            onClick={() => setMostrarEstadisticas(!mostrarEstadisticas)}
            className={`p-3 ${cardBg} shadow-2xl ${theme.glow} rounded-2xl border ${borderColor} transition-all duration-300 hover:scale-110 group`}
            title="Toggle Estadísticas"
          >
            {mostrarEstadisticas ? (
              <Eye className="w-5 h-5 text-green-400 group-hover:scale-110 transition-transform duration-300" />
            ) : (
              <EyeOff className="w-5 h-5 text-slate-400 group-hover:scale-110 transition-transform duration-300" />
            )}
          </button>
        </div>

        {/* Header */}
        <div
          className={`${cardBg} rounded-3xl shadow-2xl border ${borderColor} overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500`}
        >
          <div className={`h-2 bg-gradient-to-r ${theme.primary}`}></div>
          <div className="p-6 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="flex items-center gap-4">
              <Link
                href={`/admin/usuarios/${params.id}`}
                className={`p-3 ${
                  darkMode ? "bg-slate-800/80" : "bg-white/80"
                } border ${borderColor} rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 group hover:scale-105`}
              >
                <ArrowLeft
                  className={`w-5 h-5 ${textPrimary} group-hover:-translate-x-1 transition-transform duration-300`}
                />
              </Link>

              <div className="flex items-center gap-4">
                <div className="relative group">
                  <div
                    className={`absolute -inset-1 bg-gradient-to-r ${theme.primary} rounded-2xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity`}
                  ></div>
                  <div
                    className={`relative w-16 h-16 rounded-2xl bg-gradient-to-br ${theme.primary} flex items-center justify-center border-2 ${
                      darkMode ? "border-slate-700" : "border-white"
                    } shadow-xl`}
                  >
                    <FileText className="w-8 h-8 text-white" />
                  </div>
                </div>
                <div>
                  <h1
                    className={`text-2xl md:text-3xl font-black ${textPrimary}`}
                  >
                    Historial de Logs Premium
                  </h1>
                  <p className={`${textSecondary} font-medium mt-1`}>
                    {paginacion.total} registros encontrados
                  </p>
                </div>
              </div>
            </div>

            <div className="flex gap-3 flex-wrap">
              <button
                onClick={() => exportarLogs("csv")}
                className={`flex items-center gap-2 px-6 py-3 bg-gradient-to-r ${theme.primary} text-white rounded-xl shadow-lg ${theme.glow} hover:shadow-2xl transition-all duration-300 font-bold group hover:scale-105`}
              >
                <Download className="w-5 h-5 group-hover:rotate-12 transition-transform duration-300" />
                <span>CSV</span>
              </button>
              <button
                onClick={() => exportarLogs("json")}
                className={`flex items-center gap-2 px-6 py-3 bg-gradient-to-r ${theme.primary} text-white rounded-xl shadow-lg ${theme.glow} hover:shadow-2xl transition-all duration-300 font-bold group hover:scale-105`}
              >
                <Download className="w-5 h-5 group-hover:rotate-12 transition-transform duration-300" />
                <span>JSON</span>
              </button>
            </div>
          </div>
        </div>

        {/* ESTADÍSTICAS PREMIUM */}
        {mostrarEstadisticas && logStats && (
          <>
            {/* Fila 1 - Estadísticas Principales */}
            <div
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500"
              style={{ animationDelay: "100ms" }}
            >
              <StatCard
                icon={<FileText className="w-6 h-6 text-white" />}
                title="Total Logs"
                value={logStats.total_logs}
                color="blue"
                darkMode={darkMode}
                theme={theme}
                textPrimary={textPrimary}
                textSecondary={textSecondary}
                textMuted={textMuted}
                cardBg={cardBg}
                borderColor={borderColor}
              />

              <StatCard
                icon={<Layers className="w-6 h-6 text-white" />}
                title="Módulos"
                value={logStats.logs_por_modulo.length}
                subtitle={`${logStats.logs_por_modulo[0]?.modulo || "N/A"} más activo`}
                color="purple"
                darkMode={darkMode}
                theme={theme}
                textPrimary={textPrimary}
                textSecondary={textSecondary}
                textMuted={textMuted}
                cardBg={cardBg}
                borderColor={borderColor}
              />

              <StatCard
                icon={<Zap className="w-6 h-6 text-white" />}
                title="Acciones"
                value={logStats.logs_por_accion.length}
                subtitle={`${logStats.acciones_frecuentes[0]?.accion || "N/A"} frecuente`}
                color="amber"
                darkMode={darkMode}
                theme={theme}
                textPrimary={textPrimary}
                textSecondary={textSecondary}
                textMuted={textMuted}
                cardBg={cardBg}
                borderColor={borderColor}
              />

              <StatCard
                icon={<AlertTriangle className="w-6 h-6 text-white" />}
                title="Severidades"
                value={logStats.logs_por_severidad.length}
                subtitle="Niveles registrados"
                color="rose"
                darkMode={darkMode}
                theme={theme}
                textPrimary={textPrimary}
                textSecondary={textSecondary}
                textMuted={textMuted}
                cardBg={cardBg}
                borderColor={borderColor}
              />
            </div>

            {/* Gráficos Estadísticas */}
            <div
              className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500"
              style={{ animationDelay: "150ms" }}
            >
              {/* Logs por Módulo */}
              <div
                className={`${cardBg} rounded-3xl shadow-2xl border ${borderColor} p-6 overflow-hidden`}
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-3 bg-gradient-to-br ${theme.primary} rounded-xl shadow-lg`}
                    >
                      <Layers className="w-6 h-6 text-white" />
                    </div>
                    <h3 className={`text-xl font-black ${textPrimary}`}>
                      Logs por Módulo
                    </h3>
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={logStats.logs_por_modulo}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke={darkMode ? "#374151" : "#e2e8f0"}
                    />
                    <XAxis
                      dataKey="modulo"
                      stroke={darkMode ? "#94a3b8" : "#64748b"}
                      style={{ fontSize: "12px", fontWeight: 600 }}
                    />
                    <YAxis
                      stroke={darkMode ? "#94a3b8" : "#64748b"}
                      style={{ fontSize: "12px", fontWeight: 600 }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: darkMode ? "#1e293b" : "#ffffff",
                        border: `1px solid ${
                          darkMode ? "#475569" : "#e2e8f0"
                        }`,
                        borderRadius: "12px",
                        padding: "12px",
                        fontWeight: 600,
                      }}
                    />
                    <Bar
                      dataKey="cantidad"
                      fill={theme.light}
                      radius={[8, 8, 0, 0]}
                      name="Cantidad"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Logs por Severidad */}
              <div
                className={`${cardBg} rounded-3xl shadow-2xl border ${borderColor} p-6 overflow-hidden`}
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-3 bg-gradient-to-br ${theme.primary} rounded-xl shadow-lg`}
                    >
                      <AlertTriangle className="w-6 h-6 text-white" />
                    </div>
                    <h3 className={`text-xl font-black ${textPrimary}`}>
                      Distribución de Severidad
                    </h3>
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsPieChart>
                   <Pie
                      data={logStats.logs_por_severidad}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ payload }) => {
                        const p = payload as { nombre: string; cantidad: number };
                        return `${p.nombre}: ${p.cantidad}`;
                      }}
                      outerRadius={90}
                      fill="#8884d8"
                      dataKey="cantidad"
                    >
                      {logStats.logs_por_severidad.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>

                    <Tooltip
                      contentStyle={{
                        backgroundColor: darkMode ? "#1e293b" : "#ffffff",
                        border: `1px solid ${
                          darkMode ? "#475569" : "#e2e8f0"
                        }`,
                        borderRadius: "12px",
                        padding: "12px",
                        fontWeight: 600,
                      }}
                    />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Gráficos Actividad */}
            <div
              className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500"
              style={{ animationDelay: "200ms" }}
            >
              {/* Actividad por Hora */}
              <div
                className={`${cardBg} rounded-3xl shadow-2xl border ${borderColor} p-6 overflow-hidden`}
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-3 bg-gradient-to-br ${theme.primary} rounded-xl shadow-lg`}
                    >
                      <Clock className="w-6 h-6 text-white" />
                    </div>
                    <h3 className={`text-xl font-black ${textPrimary}`}>
                      Actividad por Hora
                    </h3>
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={logStats.logs_por_hora}>
                    <defs>
                      <linearGradient id="colorHora" x1="0" y1="0" x2="0" y2="1">
                        <stop
                          offset="5%"
                          stopColor={theme.light}
                          stopOpacity={0.8}
                        />
                        <stop
                          offset="95%"
                          stopColor={theme.light}
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke={darkMode ? "#374151" : "#e2e8f0"}
                    />
                    <XAxis
                      dataKey="hora"
                      stroke={darkMode ? "#94a3b8" : "#64748b"}
                      style={{ fontSize: "12px", fontWeight: 600 }}
                    />
                    <YAxis
                      stroke={darkMode ? "#94a3b8" : "#64748b"}
                      style={{ fontSize: "12px", fontWeight: 600 }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: darkMode ? "#1e293b" : "#ffffff",
                        border: `1px solid ${
                          darkMode ? "#475569" : "#e2e8f0"
                        }`,
                        borderRadius: "12px",
                        padding: "12px",
                        fontWeight: 600,
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="cantidad"
                      stroke={theme.dark}
                      strokeWidth={3}
                      fillOpacity={1}
                      fill="url(#colorHora)"
                      name="Logs"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Actividad por Día */}
              <div
                className={`${cardBg} rounded-3xl shadow-2xl border ${borderColor} p-6 overflow-hidden`}
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-3 bg-gradient-to-br ${theme.primary} rounded-xl shadow-lg`}
                    >
                      <Calendar className="w-6 h-6 text-white" />
                    </div>
                    <h3 className={`text-xl font-black ${textPrimary}`}>
                      Actividad por Día
                    </h3>
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={logStats.logs_por_dia}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke={darkMode ? "#374151" : "#e2e8f0"}
                    />
                    <XAxis
                      dataKey="dia"
                      stroke={darkMode ? "#94a3b8" : "#64748b"}
                      style={{ fontSize: "12px", fontWeight: 600 }}
                    />
                    <YAxis
                      stroke={darkMode ? "#94a3b8" : "#64748b"}
                      style={{ fontSize: "12px", fontWeight: 600 }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: darkMode ? "#1e293b" : "#ffffff",
                        border: `1px solid ${
                          darkMode ? "#475569" : "#e2e8f0"
                        }`,
                        borderRadius: "12px",
                        padding: "12px",
                        fontWeight: 600,
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="cantidad"
                      stroke={theme.dark}
                      strokeWidth={3}
                      dot={{ fill: theme.light, r: 5 }}
                      activeDot={{ r: 7 }}
                      name="Logs"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Tablas de Información */}
            <div
              className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500"
              style={{ animationDelay: "250ms" }}
            >
              {/* Módulos Más Activos */}
              <div
                className={`${cardBg} rounded-3xl shadow-2xl border ${borderColor} p-6 overflow-hidden`}
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-3 bg-gradient-to-br ${theme.primary} rounded-xl shadow-lg`}
                    >
                      <Target className="w-6 h-6 text-white" />
                    </div>
                    <h3 className={`text-xl font-black ${textPrimary}`}>
                      Módulos Más Activos
                    </h3>
                  </div>
                </div>
                <div className="space-y-3">
                  {logStats.modulos_mas_activos.slice(0, 5).map((mod, idx) => (
                    <div
                      key={idx}
                      className={`p-4 rounded-2xl border-2 transition-all duration-300 group cursor-pointer ${
                        darkMode
                          ? "bg-slate-700/30 border-slate-600 hover:border-blue-500 hover:bg-slate-700/50"
                          : "bg-slate-50 border-slate-200 hover:border-blue-400 hover:bg-slate-100"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className={`font-bold text-lg ${textPrimary}`}>
                            {mod.modulo}
                          </p>
                          <p className={`text-sm mt-1 ${textMuted}`}>
                            Último acceso:{" "}
                            {new Date(mod.ultimo_acceso).toLocaleString(
                              "es-CL"
                            )}
                          </p>
                        </div>
                        <p
                          className={`text-3xl font-black ${
                            darkMode ? "text-blue-400" : "text-indigo-600"
                          }`}
                        >
                          {mod.accesos}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* IPs Más Frecuentes */}
              <div
                className={`${cardBg} rounded-3xl shadow-2xl border ${borderColor} p-6 overflow-hidden`}
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-3 bg-gradient-to-br ${theme.primary} rounded-xl shadow-lg`}
                    >
                      <Globe className="w-6 h-6 text-white" />
                    </div>
                    <h3 className={`text-xl font-black ${textPrimary}`}>
                      IPs Más Frecuentes
                    </h3>
                  </div>
                </div>
                <div className="space-y-3">
                  {logStats.ips_mas_frecuentes.slice(0, 5).map((ip, idx) => (
                    <div
                      key={idx}
                      className={`p-4 rounded-2xl border-2 transition-all duration-300 group cursor-pointer ${
                        darkMode
                          ? "bg-slate-700/30 border-slate-600 hover:border-green-500 hover:bg-slate-700/50"
                          : "bg-slate-50 border-slate-200 hover:border-green-400 hover:bg-slate-100"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex-1">
                          <p className={`font-mono font-bold ${textPrimary}`}>
                            {ip.ip}
                          </p>
                        </div>
                        <button
                          onClick={() => copiarAlPortapapeles(ip.ip)}
                          className={`p-2 rounded-lg transition-all duration-300 ${
                            darkMode
                              ? "bg-slate-800 hover:bg-slate-700"
                              : "bg-white hover:bg-slate-100"
                          }`}
                          title="Copiar IP"
                        >
                          <Copy className="w-4 h-4 text-blue-500" />
                        </button>
                        <p
                          className={`text-2xl font-black ${
                            darkMode ? "text-green-400" : "text-green-600"
                          }`}
                        >
                          {ip.accesos}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Acciones Frecuentes */}
            <div
              className={`${cardBg} rounded-3xl shadow-2xl border ${borderColor} p-6 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500`}
              style={{ animationDelay: "300ms" }}
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div
                    className={`p-3 bg-gradient-to-br ${theme.primary} rounded-xl shadow-lg`}
                  >
                    <Zap className="w-6 h-6 text-white" />
                  </div>
                  <h3 className={`text-xl font-black ${textPrimary}`}>
                    Acciones Más Frecuentes
                  </h3>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {logStats.acciones_frecuentes.slice(0, 9).map((accion, idx) => (
                  <div
                    key={idx}
                    className={`flex items-center justify-between p-5 rounded-2xl border-2 transition-all duration-300 group cursor-pointer ${
                      darkMode
                        ? "bg-slate-700/30 border-slate-600 hover:border-purple-500 hover:bg-slate-700/50"
                        : "bg-slate-50 border-slate-200 hover:border-purple-400 hover:bg-slate-100"
                    }`}
                  >
                    <div className="flex-1">
                      <p className={`font-bold text-lg ${textPrimary}`}>
                        {accion.accion}
                      </p>
                    </div>
                    <p
                      className={`text-3xl font-black ${
                        darkMode ? "text-purple-400" : "text-purple-600"
                      }`}
                    >
                      {accion.frecuencia}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Filtros */}
        <div
          className={`${cardBg} rounded-3xl shadow-2xl border ${borderColor} p-6 animate-in fade-in slide-in-from-bottom-4 duration-500`}
          style={{ animationDelay: mostrarEstadisticas ? "350ms" : "100ms" }}
        >
          <div className="flex items-center gap-3 mb-6">
            <div
              className={`p-2 rounded-xl bg-gradient-to-br ${theme.primary} shadow-lg`}
            >
              <Filter className="w-5 h-5 text-white" />
            </div>
            <div>
              <p
                className={`text-xs font-black uppercase tracking-wider ${textMuted}`}
              >
                Filtros de búsqueda avanzada
              </p>
              <p className={`text-sm ${textSecondary}`}>
                Refina el historial por módulo, acción, severidad, fecha y más.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {/* Búsqueda */}
            <div className="lg:col-span-2">
              <div className="relative group">
                <Search
                  className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${
                    darkMode ? "text-slate-500" : "text-slate-400"
                  }`}
                />
                <input
                  type="text"
                  placeholder="Buscar en logs..."
                  value={filtros.busqueda}
                  onChange={(e) =>
                    setFiltros({ ...filtros, busqueda: e.target.value })
                  }
                  className={`w-full pl-10 pr-4 py-3 rounded-xl font-medium transition-all duration-300 ${inputBg} border-2 ${
                    darkMode
                      ? "border-white/10 focus:border-blue-500/50"
                      : "border-slate-200 focus:border-blue-500"
                  } ${textPrimary} placeholder-slate-400 focus:ring-4 focus:ring-blue-500/20 group-hover:border-blue-500/50`}
                />
              </div>
            </div>

            {/* Módulo */}
            <div>
              <select
                value={filtros.modulo}
                onChange={(e) =>
                  setFiltros({ ...filtros, modulo: e.target.value })
                }
                className={`w-full px-4 py-3 rounded-xl font-medium transition-all duration-300 ${inputBg} border-2 ${
                  darkMode
                    ? "border-white/10 focus:border-blue-500/50"
                    : "border-slate-200 focus:border-blue-500"
                } ${textPrimary} focus:ring-4 focus:ring-blue-500/20 cursor-pointer hover:border-blue-500/50`}
              >
                <option value="">Todos los módulos</option>
                {logStats?.logs_por_modulo.map((mod) => (
                  <option key={mod.modulo} value={mod.modulo}>
                    {mod.modulo}
                  </option>
                ))}
              </select>
            </div>

            {/* Acción */}
            <div>
              <select
                value={filtros.accion}
                onChange={(e) =>
                  setFiltros({ ...filtros, accion: e.target.value })
                }
                className={`w-full px-4 py-3 rounded-xl font-medium transition-all duration-300 ${inputBg} border-2 ${
                  darkMode
                    ? "border-white/10 focus:border-blue-500/50"
                    : "border-slate-200 focus:border-blue-500"
                } ${textPrimary} focus:ring-4 focus:ring-blue-500/20 cursor-pointer hover:border-blue-500/50`}
              >
                <option value="">Todas las acciones</option>
                {logStats?.logs_por_accion.map((acc) => (
                  <option key={acc.accion} value={acc.accion}>
                    {acc.accion}
                  </option>
                ))}
              </select>
            </div>

            {/* Severidad */}
            <div>
              <select
                value={filtros.nivel_severidad}
                onChange={(e) =>
                  setFiltros({ ...filtros, nivel_severidad: e.target.value })
                }
                className={`w-full px-4 py-3 rounded-xl font-medium transition-all duration-300 ${inputBg} border-2 ${
                  darkMode
                    ? "border-white/10 focus:border-blue-500/50"
                    : "border-slate-200 focus:border-blue-500"
                } ${textPrimary} focus:ring-4 focus:ring-blue-500/20 cursor-pointer hover:border-blue-500/50`}
              >
                <option value="">Todas las severidades</option>
                <option value="1">Info</option>
                <option value="2">Éxito</option>
                <option value="3">Advertencia</option>
                <option value="4">Error</option>
                <option value="5">Crítico</option>
              </select>
            </div>

            {/* Limpiar */}
            <div>
              <button
                onClick={() =>
                  setFiltros({
                    busqueda: "",
                    modulo: "",
                    accion: "",
                    nivel_severidad: "",
                    fecha_desde: "",
                    fecha_hasta: "",
                  })
                }
                className={`w-full px-4 py-3 rounded-xl font-bold transition-all duration-300 ${
                  darkMode
                    ? "bg-slate-800/60 text-slate-300 hover:bg-slate-800"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                } border ${borderColor} hover:scale-105`}
              >
                Limpiar
              </button>
            </div>
          </div>

          {/* Fechas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            <div>
              <label
                className={`block text-sm font-black mb-2 uppercase tracking-wider ${textMuted}`}
              >
                Desde
              </label>
              <input
                type="date"
                value={filtros.fecha_desde}
                onChange={(e) =>
                  setFiltros({ ...filtros, fecha_desde: e.target.value })
                }
                className={`w-full px-4 py-3 rounded-xl font-medium transition-all duration-300 ${inputBg} border-2 ${
                  darkMode
                    ? "border-white/10 focus:border-blue-500/50"
                    : "border-slate-200 focus:border-blue-500"
                } ${textPrimary} focus:ring-4 focus:ring-blue-500/20`}
              />
            </div>
            <div>
              <label
                className={`block text-sm font-black mb-2 uppercase tracking-wider ${textMuted}`}
              >
                Hasta
              </label>
              <input
                type="date"
                value={filtros.fecha_hasta}
                onChange={(e) =>
                  setFiltros({ ...filtros, fecha_hasta: e.target.value })
                }
                className={`w-full px-4 py-3 rounded-xl font-medium transition-all duration-300 ${inputBg} border-2 ${
                  darkMode
                    ? "border-white/10 focus:border-blue-500/50"
                    : "border-slate-200 focus:border-blue-500"
                } ${textPrimary} focus:ring-4 focus:ring-blue-500/20`}
              />
            </div>
          </div>
        </div>

        {/* Tabla / Contenido */}
        <div
          className={`${cardBg} rounded-3xl shadow-2xl border ${borderColor} overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500`}
          style={{
            animationDelay: mostrarEstadisticas ? "400ms" : "150ms",
          }}
        >
          {error ? (
            <div className="p-8">
              <div
                className={`flex items-center gap-3 rounded-2xl p-4 border-2 ${
                  darkMode
                    ? "bg-rose-500/10 border-rose-500/40"
                    : "bg-rose-50 border-rose-200"
                }`}
              >
                <AlertCircle
                  className={`w-6 h-6 ${
                    darkMode ? "text-rose-400" : "text-rose-600"
                  }`}
                />
                <p
                  className={`font-semibold ${
                    darkMode ? "text-rose-300" : "text-rose-800"
                  }`}
                >
                  {error}
                </p>
              </div>
            </div>
          ) : logs.length === 0 ? (
            <div className="p-12 text-center">
              <FileText
                className={`w-16 h-16 mx-auto mb-4 ${
                  darkMode ? "text-slate-600" : "text-slate-300"
                }`}
              />
              <h3 className={`text-xl font-semibold ${textPrimary} mb-2`}>
                No se encontraron logs
              </h3>
              <p className={textSecondary}>
                No hay registros que coincidan con los filtros aplicados.
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead
                    className={`${
                      darkMode
                        ? "bg-slate-700/60 border-b-2 border-white/10"
                        : "bg-gradient-to-r from-slate-50 to-slate-100 border-b-2 border-slate-200"
                    }`}
                  >
                    <tr>
                      <th
                        className={`px-6 py-4 text-left text-xs font-black uppercase tracking-wider ${textMuted}`}
                      >
                        Fecha/Hora
                      </th>
                      <th
                        className={`px-6 py-4 text-left text-xs font-black uppercase tracking-wider ${textMuted}`}
                      >
                        Módulo
                      </th>
                      <th
  className={`px-6 py-4 text-left text-xs font-black uppercase tracking-wider ${textMuted}`}
>
  Acción
</th>

                      <th
                        className={`px-6 py-4 text-left text-xs font-black uppercase tracking-wider ${textMuted}`}
                      >
                        Descripción
                      </th>
                      <th
                        className={`px-6 py-4 text-left text-xs font-black uppercase tracking-wider ${textMuted}`}
                      >
                        IP Origen
                      </th>
                      <th
                        className={`px-6 py-4 text-left text-xs font-black uppercase tracking-wider ${textMuted}`}
                      >
                        Severidad
                      </th>
                      <th
                        className={`px-6 py-4 text-center text-xs font-black uppercase tracking-wider ${textMuted}`}
                      >
                        Detalles
                      </th>
                    </tr>
                  </thead>
                  <tbody
                    className={`divide-y ${
                      darkMode ? "divide-white/5" : "divide-slate-200"
                    }`}
                  >
                    {logs.map((log) => (
                      <tr
                        key={log.id_log}
                        className={`transition-colors duration-200 group ${
                          darkMode ? "hover:bg-white/5" : "hover:bg-slate-50"
                        }`}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2 text-sm">
                            <Clock
                              className={`w-4 h-4 ${
                                darkMode ? "text-slate-400" : "text-slate-500"
                              }`}
                            />
                            <span className={textSecondary}>
                              {new Date(log.fecha_hora).toLocaleString("es-CL")}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-block px-3 py-1 text-xs rounded-full font-semibold transition-all duration-300 ${
                              darkMode
                                ? "bg-indigo-500/20 text-indigo-300 group-hover:bg-indigo-500/40"
                                : "bg-indigo-50 text-indigo-800 group-hover:bg-indigo-100"
                            }`}
                          >
                            {log.modulo}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-block px-3 py-1 text-xs rounded-full font-semibold transition-all duration-300 ${
                              darkMode
                                ? "bg-blue-500/20 text-blue-300 group-hover:bg-blue-500/40"
                                : "bg-blue-50 text-blue-800 group-hover:bg-blue-100"
                            }`}
                          >
                            {log.accion}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <p
                            className={`text-sm max-w-md truncate ${textSecondary}`}
                            title={log.descripcion}
                          >
                            {log.descripcion}
                          </p>
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <div className="flex items-center gap-2">
                            <span className={textSecondary}>{log.ip_origen}</span>
                            <button
                              onClick={() => copiarAlPortapapeles(log.ip_origen)}
                              className={`p-1 rounded transition-all duration-200 ${
                                darkMode
                                  ? "hover:bg-slate-700"
                                  : "hover:bg-slate-200"
                              }`}
                              title="Copiar IP"
                            >
                              <Copy className="w-3 h-3 text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </button>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {getNivelSeveridadBadge(log.nivel_severidad)}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <button
                            onClick={() =>
                              setExpandedLog(
                                expandedLog === log.id_log ? null : log.id_log
                              )
                            }
                            className={`p-2 rounded-lg transition-all duration-300 ${
                              expandedLog === log.id_log
                                ? darkMode
                                  ? "bg-blue-500/20 text-blue-300"
                                  : "bg-blue-50 text-blue-600"
                                : darkMode
                                ? "bg-slate-700/50 text-slate-400 hover:bg-slate-700"
                                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                            }`}
                          >
                            {expandedLog === log.id_log ? (
                              <ChevronUp className="w-4 h-4" />
                            ) : (
                              <ChevronDown className="w-4 h-4" />
                            )}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Fila Expandida de Detalles */}
              {expandedLog && (
                <div
                  className={`border-t-2 ${
                    darkMode ? "border-white/10" : "border-slate-200"
                  } p-6 animate-in fade-in slide-in-from-top-2 duration-300`}
                >
                  {logs.find((l) => l.id_log === expandedLog) && (
                    <div className="space-y-6">
                      {(() => {
                        const log = logs.find((l) => l.id_log === expandedLog)!;
                        let detalles: any = {};
                        try {
                          detalles = JSON.parse(log.detalles_json || "{}");
                        } catch {
                          detalles = { error: "No se pudo parsear JSON" };
                        }

                        return (
                          <>
                            {/* Información General */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                              <div
                                className={`p-4 rounded-2xl border-2 ${
                                  darkMode
                                    ? "bg-slate-700/30 border-slate-600"
                                    : "bg-slate-50 border-slate-200"
                                }`}
                              >
                                <p className={`text-xs font-black uppercase ${textMuted} mb-2`}>
                                  ID Log
                                </p>
                                <p className={`font-mono font-bold ${textPrimary}`}>
                                  #{log.id_log}
                                </p>
                              </div>

                              <div
                                className={`p-4 rounded-2xl border-2 ${
                                  darkMode
                                    ? "bg-slate-700/30 border-slate-600"
                                    : "bg-slate-50 border-slate-200"
                                }`}
                              >
                                <p className={`text-xs font-black uppercase ${textMuted} mb-2`}>
                                  User Agent
                                </p>
                                <p className={`font-mono text-sm ${textSecondary} truncate`}>
                                  {log.user_agent}
                                </p>
                              </div>

                              <div
                                className={`p-4 rounded-2xl border-2 ${
                                  darkMode
                                    ? "bg-slate-700/30 border-slate-600"
                                    : "bg-slate-50 border-slate-200"
                                }`}
                              >
                                <p className={`text-xs font-black uppercase ${textMuted} mb-2`}>
                                  Timestamp
                                </p>
                                <p className={`font-mono text-sm ${textSecondary}`}>
                                  {new Date(log.fecha_hora).getTime()}
                                </p>
                              </div>
                            </div>

                            {/* JSON Detalles */}
                            <div
                              className={`p-6 rounded-2xl border-2 ${
                                darkMode
                                  ? "bg-slate-900/50 border-slate-700"
                                  : "bg-slate-50 border-slate-200"
                              }`}
                            >
                              <div className="flex items-center justify-between mb-4">
                                <h4 className={`font-black text-lg ${textPrimary}`}>
                                  Detalles JSON
                                </h4>
                                <button
                                  onClick={() =>
                                    copiarAlPortapapeles(
                                      JSON.stringify(detalles, null, 2)
                                    )
                                  }
                                  className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-300 ${
                                    darkMode
                                      ? "bg-slate-800 hover:bg-slate-700 text-slate-300"
                                      : "bg-white hover:bg-slate-100 text-slate-600"
                                  }`}
                                >
                                  <Copy className="w-4 h-4" />
                                  <span className="text-xs font-bold">Copiar</span>
                                </button>
                              </div>
                              <pre
                                className={`font-mono text-xs p-4 rounded-xl overflow-x-auto ${
                                  darkMode
                                    ? "bg-black/30 text-green-400"
                                    : "bg-white text-slate-800"
                                }`}
                              >
                                {JSON.stringify(detalles, null, 2)}
                              </pre>
                            </div>

                            {/* Análisis de Seguridad */}
                            <div
                              className={`p-6 rounded-2xl border-2 ${
                                darkMode
                                  ? "bg-slate-700/30 border-slate-600"
                                  : "bg-slate-50 border-slate-200"
                              }`}
                            >
                              <h4 className={`font-black text-lg ${textPrimary} mb-4`}>
                                Análisis de Seguridad
                              </h4>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div
                                  className={`flex items-center gap-3 p-4 rounded-xl ${
                                    log.nivel_severidad >= 4
                                      ? darkMode
                                        ? "bg-rose-500/10 border-2 border-rose-500/40"
                                        : "bg-rose-50 border-2 border-rose-200"
                                      : darkMode
                                      ? "bg-emerald-500/10 border-2 border-emerald-500/40"
                                      : "bg-emerald-50 border-2 border-emerald-200"
                                  }`}
                                >
                                  {log.nivel_severidad >= 4 ? (
                                    <AlertTriangle
                                      className={`w-6 h-6 ${
                                        darkMode
                                          ? "text-rose-400"
                                          : "text-rose-600"
                                      }`}
                                    />
                                  ) : (
                                    <CheckCircle
                                      className={`w-6 h-6 ${
                                        darkMode
                                          ? "text-emerald-400"
                                          : "text-emerald-600"
                                      }`}
                                    />
                                  )}
                                  <div>
                                    <p
                                      className={`font-bold ${
                                        log.nivel_severidad >= 4
                                          ? darkMode
                                            ? "text-rose-300"
                                            : "text-rose-800"
                                          : darkMode
                                          ? "text-emerald-300"
                                          : "text-emerald-800"
                                      }`}
                                    >
                                      {log.nivel_severidad >= 4
                                        ? "Evento de Riesgo"
                                        : "Evento Normal"}
                                    </p>
                                    <p
                                      className={`text-sm ${
                                        log.nivel_severidad >= 4
                                          ? darkMode
                                            ? "text-rose-400"
                                            : "text-rose-700"
                                          : darkMode
                                          ? "text-emerald-400"
                                          : "text-emerald-700"
                                      }`}
                                    >
                                      Nivel {log.nivel_severidad}
                                    </p>
                                  </div>
                                </div>

                                <div
                                  className={`flex items-center gap-3 p-4 rounded-xl ${
                                    darkMode
                                      ? "bg-blue-500/10 border-2 border-blue-500/40"
                                      : "bg-blue-50 border-2 border-blue-200"
                                  }`}
                                >
                                  <Wifi
                                    className={`w-6 h-6 ${
                                      darkMode
                                        ? "text-blue-400"
                                        : "text-blue-600"
                                    }`}
                                  />
                                  <div>
                                    <p
                                      className={`font-bold ${
                                        darkMode
                                          ? "text-blue-300"
                                          : "text-blue-800"
                                      }`}
                                    >
                                      Origen de IP
                                    </p>
                                    <p
                                      className={`text-sm font-mono ${
                                        darkMode
                                          ? "text-blue-400"
                                          : "text-blue-700"
                                      }`}
                                    >
                                      {log.ip_origen}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </>
                        );
                      })()}
                    </div>
                  )}
                </div>
              )}

              {/* Paginación Premium */}
              {paginacion.total_pages > 1 && (
                <div
                  className={`px-6 py-4 border-t flex flex-col sm:flex-row items-center justify-between gap-4 ${
                    darkMode
                      ? "bg-slate-900/40 border-white/10"
                      : "bg-slate-50/80 border-slate-200"
                  }`}
                >
                  <div className={`text-sm font-medium ${textMuted}`}>
                    Mostrando{" "}
                    {(paginacion.page - 1) * paginacion.limit + 1} -{" "}
                    {Math.min(
                      paginacion.page * paginacion.limit,
                      paginacion.total
                    )}{" "}
                    de {paginacion.total} logs
                  </div>
                  <div className="flex items-center gap-2 flex-wrap justify-center">
                    <button
                      onClick={() =>
                        setPaginacion((prev) => ({
                          ...prev,
                          page: Math.max(1, prev.page - 1),
                        }))
                      }
                      disabled={paginacion.page === 1}
                      className={`px-4 py-2 rounded-lg font-bold transition-all duration-200 flex items-center gap-2 ${
                        darkMode
                          ? "bg-slate-800 border-2 border-slate-700 text-slate-200 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
                          : "bg-white border-2 border-slate-200 text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      }`}
                    >
                      <ChevronUp className="w-4 h-4 rotate-180" />
                      Anterior
                    </button>

                    {/* Números de página */}
                    <div className="flex items-center gap-1">
                      {Array.from(
                        {
                          length: Math.min(
                            5,
                            paginacion.total_pages
                          ),
                        },
                        (_, i) => {
                          const pageNum =
                            paginacion.page <= 3
                              ? i + 1
                              : paginacion.page - 2 + i;
                          return pageNum <= paginacion.total_pages ? (
                            <button
                              key={pageNum}
                              onClick={() =>
                                setPaginacion((prev) => ({
                                  ...prev,
                                  page: pageNum,
                                }))
                              }
                              className={`px-3 py-2 rounded-lg font-bold transition-all duration-200 ${
                                pageNum === paginacion.page
                                  ? `bg-gradient-to-r ${theme.primary} text-white shadow-lg`
                                  : darkMode
                                  ? "bg-slate-800 border-2 border-slate-700 text-slate-200 hover:bg-slate-700"
                                  : "bg-white border-2 border-slate-200 text-slate-700 hover:bg-slate-50"
                              }`}
                            >
                              {pageNum}
                            </button>
                          ) : null;
                        }
                      )}
                    </div>

                    <button
                      onClick={() =>
                        setPaginacion((prev) => ({
                          ...prev,
                          page: Math.min(prev.total_pages, prev.page + 1),
                        }))
                      }
                      disabled={
                        paginacion.page === paginacion.total_pages ||
                        paginacion.total_pages === 0
                      }
                      className={`px-4 py-2 rounded-lg font-bold transition-all duration-200 flex items-center gap-2 ${
                        darkMode
                          ? "bg-slate-800 border-2 border-slate-700 text-slate-200 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
                          : "bg-white border-2 border-slate-200 text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      }`}
                    >
                      Siguiente
                      <ChevronUp className="w-4 h-4" />
                    </button>
                  </div>

                  <span
                    className={`text-sm font-bold px-4 py-2 rounded-lg ${
                      darkMode
                        ? "bg-slate-800 text-slate-300"
                        : "bg-slate-100 text-slate-700"
                    }`}
                  >
                    Página {paginacion.page} de {paginacion.total_pages}
                  </span>
                </div>
              )}
            </>
          )}
        </div>

        {/* SECCIÓN AVANZADA - ANÁLISIS PROFUNDO */}
        {logs.length > 0 && (
          <>
            {/* Patrones de Comportamiento */}
            <div
              className={`${cardBg} rounded-3xl shadow-2xl border ${borderColor} p-6 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500`}
              style={{
                animationDelay: mostrarEstadisticas ? "450ms" : "200ms",
              }}
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div
                    className={`p-3 bg-gradient-to-br ${theme.primary} rounded-xl shadow-lg`}
                  >
                    <Activity className="w-6 h-6 text-white" />
                  </div>
                  <h3 className={`text-xl font-black ${textPrimary}`}>
                    Patrones de Comportamiento
                  </h3>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Módulo Más Usado */}
                <div
                  className={`p-6 rounded-2xl border-2 transition-all duration-300 ${
                    darkMode
                      ? "bg-indigo-500/10 border-indigo-500/30 hover:border-indigo-500/50"
                      : "bg-indigo-50 border-indigo-200 hover:border-indigo-400"
                  }`}
                >
                  <div className="flex items-center gap-3 mb-4">
                    <Layers
                      className={`w-6 h-6 ${
                        darkMode ? "text-indigo-400" : "text-indigo-600"
                      }`}
                    />
                    <p className={`text-sm font-bold ${textMuted} uppercase`}>
                      Módulo Más Usado
                    </p>
                  </div>
                  <p
                    className={`text-2xl font-black ${
                      darkMode ? "text-indigo-400" : "text-indigo-600"
                    }`}
                  >
                    {logStats?.modulos_mas_activos[0]?.modulo || "N/A"}
                  </p>
                  <p className={`text-sm mt-2 ${textSecondary}`}>
                    {logStats?.modulos_mas_activos[0]?.accesos || 0} accesos
                  </p>
                </div>

                {/* Acción Más Frecuente */}
                <div
                  className={`p-6 rounded-2xl border-2 transition-all duration-300 ${
                    darkMode
                      ? "bg-purple-500/10 border-purple-500/30 hover:border-purple-500/50"
                      : "bg-purple-50 border-purple-200 hover:border-purple-400"
                  }`}
                >
                  <div className="flex items-center gap-3 mb-4">
                    <Zap
                      className={`w-6 h-6 ${
                        darkMode ? "text-purple-400" : "text-purple-600"
                      }`}
                    />
                    <p className={`text-sm font-bold ${textMuted} uppercase`}>
                      Acción Frecuente
                    </p>
                  </div>
                  <p
                    className={`text-2xl font-black ${
                      darkMode ? "text-purple-400" : "text-purple-600"
                    }`}
                  >
                    {logStats?.acciones_frecuentes[0]?.accion || "N/A"}
                  </p>
                  <p className={`text-sm mt-2 ${textSecondary}`}>
                    {logStats?.acciones_frecuentes[0]?.frecuencia || 0} veces
                  </p>
                </div>

                {/* Severidad Promedio */}
                <div
                  className={`p-6 rounded-2xl border-2 transition-all duration-300 ${
                    darkMode
                      ? "bg-rose-500/10 border-rose-500/30 hover:border-rose-500/50"
                      : "bg-rose-50 border-rose-200 hover:border-rose-400"
                  }`}
                >
                  <div className="flex items-center gap-3 mb-4">
                    <AlertTriangle
                      className={`w-6 h-6 ${
                        darkMode ? "text-rose-400" : "text-rose-600"
                      }`}
                    />
                    <p className={`text-sm font-bold ${textMuted} uppercase`}>
                      Severidad Promedio
                    </p>
                  </div>
                  <p
                      className={`text-2xl font-black ${
                        darkMode ? "text-rose-400" : "text-rose-600"
                      }`}
                    >
                      {(() => {
                        if (!logStats?.logs_por_severidad?.length || !logStats?.total_logs) {
                          return "0.00";
                        }

                        const total = logStats.logs_por_severidad.reduce(
                          (acc, s) => acc + s.nivel * s.cantidad,
                          0
                        );

                        return (total / logStats.total_logs).toFixed(2);
                      })()}
                    </p>

                  <p className={`text-sm mt-2 ${textSecondary}`}>
                    Escala 1-5
                  </p>
                </div>
              </div>
            </div>

            {/* Información de Dispositivos y Navegadores */}
            <div
              className={`${cardBg} rounded-3xl shadow-2xl border ${borderColor} p-6 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500`}
              style={{
                animationDelay: mostrarEstadisticas ? "500ms" : "250ms",
              }}
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div
                    className={`p-3 bg-gradient-to-br ${theme.primary} rounded-xl shadow-lg`}
                  >
                    <Smartphone className="w-6 h-6 text-white" />
                  </div>
                  <h3 className={`text-xl font-black ${textPrimary}`}>
                    Dispositivos y Navegadores
                  </h3>
                </div>
              </div>

              <div className="space-y-3 max-h-96 overflow-y-auto">
                {logStats?.user_agents.slice(0, 10).map((ua, idx) => (
                  <div
                    key={idx}
                    className={`p-4 rounded-2xl border-2 transition-all duration-300 group cursor-pointer ${
                      darkMode
                        ? "bg-slate-700/30 border-slate-600 hover:border-cyan-500 hover:bg-slate-700/50"
                        : "bg-slate-50 border-slate-200 hover:border-cyan-400 hover:bg-slate-100"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <p className={`font-mono text-sm ${textSecondary} truncate`}>
                          {ua.user_agent}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() =>
                            copiarAlPortapapeles(ua.user_agent)
                          }
                          className={`p-2 rounded-lg transition-all duration-300 ${
                            darkMode
                              ? "bg-slate-800 hover:bg-slate-700"
                              : "bg-white hover:bg-slate-100"
                          }`}
                          title="Copiar User Agent"
                        >
                          <Copy className="w-4 h-4 text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </button>
                        <span
                          className={`text-lg font-black ${
                            darkMode ? "text-cyan-400" : "text-cyan-600"
                          }`}
                        >
                          {ua.accesos}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Comparativa Temporal */}
            <div
              className={`${cardBg} rounded-3xl shadow-2xl border ${borderColor} p-6 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500`}
              style={{
                animationDelay: mostrarEstadisticas ? "550ms" : "300ms",
              }}
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div
                    className={`p-3 bg-gradient-to-br ${theme.primary} rounded-xl shadow-lg`}
                  >
                    <TrendingUp className="w-6 h-6 text-white" />
                  </div>
                  <h3 className={`text-xl font-black ${textPrimary}`}>
                    Análisis Temporal Comparativo
                  </h3>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Comparativa Hora */}
                <ResponsiveContainer width="100%" height={300}>
                  <ComposedChart data={logStats?.logs_por_hora}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke={darkMode ? "#374151" : "#e2e8f0"}
                    />
                    <XAxis
                      dataKey="hora"
                      stroke={darkMode ? "#94a3b8" : "#64748b"}
                      style={{ fontSize: "12px", fontWeight: 600 }}
                    />
                    <YAxis
                      stroke={darkMode ? "#94a3b8" : "#64748b"}
                      style={{ fontSize: "12px", fontWeight: 600 }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: darkMode ? "#1e293b" : "#ffffff",
                        border: `1px solid ${
                          darkMode ? "#475569" : "#e2e8f0"
                        }`,
                        borderRadius: "12px",
                        padding: "12px",
                        fontWeight: 600,
                      }}
                    />
                    <Bar
                      dataKey="cantidad"
                      fill={theme.light}
                      radius={[8, 8, 0, 0]}
                      name="Logs"
                      opacity={0.7}
                    />
                    <Line
                      type="monotone"
                      dataKey="cantidad"
                      stroke={theme.dark}
                      strokeWidth={3}
                      dot={{ fill: theme.light, r: 4 }}
                      name="Tendencia"
                    />
                  </ComposedChart>
                </ResponsiveContainer>

                {/* Scatter - Hora vs Severidad */}
                <ResponsiveContainer width="100%" height={300}>
                  <ScatterChart
                    margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke={darkMode ? "#374151" : "#e2e8f0"}
                    />
                    <XAxis
                      dataKey="hora"
                      stroke={darkMode ? "#94a3b8" : "#64748b"}
                      name="Hora"
                      style={{ fontSize: "12px", fontWeight: 600 }}
                    />
                    <YAxis
                      dataKey="cantidad"
                      stroke={darkMode ? "#94a3b8" : "#64748b"}
                      name="Cantidad"
                      style={{ fontSize: "12px", fontWeight: 600 }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: darkMode ? "#1e293b" : "#ffffff",
                        border: `1px solid ${
                          darkMode ? "#475569" : "#e2e8f0"
                        }`,
                        borderRadius: "12px",
                        padding: "12px",
                        fontWeight: 600,
                      }}
                      cursor={{ strokeDasharray: "3 3" }}
                    />
                    <Scatter
                      name="Actividad"
                      data={logStats?.logs_por_hora}
                      fill={theme.light}
                      fillOpacity={0.6}
                    />
                  </ScatterChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Resumen Ejecutivo */}
            <div
              className={`${cardBg} rounded-3xl shadow-2xl border ${borderColor} p-6 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500`}
              style={{
                animationDelay: mostrarEstadisticas ? "600ms" : "350ms",
              }}
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div
                    className={`p-3 bg-gradient-to-br ${theme.primary} rounded-xl shadow-lg`}
                  >
                    <Award className="w-6 h-6 text-white" />
                  </div>
                  <h3 className={`text-xl font-black ${textPrimary}`}>
                    Resumen Ejecutivo
                  </h3>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Estadísticas Clave */}
                <div className="space-y-4">
                  <h4 className={`font-bold text-lg ${textPrimary} mb-4`}>
                    Estadísticas Clave
                  </h4>

                  <div
                    className={`flex items-center justify-between p-4 rounded-xl border-2 ${
                      darkMode
                        ? "bg-slate-700/30 border-slate-600"
                        : "bg-slate-50 border-slate-200"
                    }`}
                  >
                    <span className={`font-semibold ${textSecondary}`}>
                      Total de Logs
                    </span>
                    <span className={`text-2xl font-black ${textPrimary}`}>
                      {logStats?.total_logs}
                    </span>
                  </div>

                  <div
                    className={`flex items-center justify-between p-4 rounded-xl border-2 ${
                      darkMode
                        ? "bg-slate-700/30 border-slate-600"
                        : "bg-slate-50 border-slate-200"
                    }`}
                  >
                    <span className={`font-semibold ${textSecondary}`}>
                      Módulos Únicos
                    </span>
                    <span className={`text-2xl font-black ${textPrimary}`}>
                      {logStats?.logs_por_modulo.length}
                    </span>
                  </div>

                  <div
                    className={`flex items-center justify-between p-4 rounded-xl border-2 ${
                      darkMode
                        ? "bg-slate-700/30 border-slate-600"
                        : "bg-slate-50 border-slate-200"
                    }`}
                  >
                    <span className={`font-semibold ${textSecondary}`}>
                      Acciones Únicas
                    </span>
                    <span className={`text-2xl font-black ${textPrimary}`}>
                      {logStats?.logs_por_accion.length}
                    </span>
                  </div>

                  <div
                    className={`flex items-center justify-between p-4 rounded-xl border-2 ${
                      darkMode
                        ? "bg-slate-700/30 border-slate-600"
                        : "bg-slate-50 border-slate-200"
                    }`}
                  >
                    <span className={`font-semibold ${textSecondary}`}>
                      Niveles de Severidad
                    </span>
                    <span className={`text-2xl font-black ${textPrimary}`}>
                      {logStats?.logs_por_severidad.length}
                    </span>
                  </div>
                </div>

                {/* Recomendaciones */}
                <div className="space-y-4">
                  <h4 className={`font-bold text-lg ${textPrimary} mb-4`}>
                    Recomendaciones
                  </h4>

                  <div
                    className={`p-4 rounded-xl border-2 ${
                      darkMode
                        ? "bg-blue-500/10 border-blue-500/40"
                        : "bg-blue-50 border-blue-200"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <Info
                        className={`w-5 h-5 mt-0.5 flex-shrink-0 ${
                          darkMode ? "text-blue-400" : "text-blue-600"
                        }`}
                      />
                      <p className={`text-sm ${textSecondary}`}>
                        Monitorear módulo <strong>{logStats?.modulos_mas_activos[0]?.modulo}</strong> regularmente para detectar anomalías.
                      </p>
                    </div>
                  </div>

                  <div
                    className={`p-4 rounded-xl border-2 ${
                      darkMode
                        ? "bg-amber-500/10 border-amber-500/40"
                        : "bg-amber-50 border-amber-200"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <AlertTriangle
                        className={`w-5 h-5 mt-0.5 flex-shrink-0 ${
                          darkMode ? "text-amber-400" : "text-amber-600"
                        }`}
                      />
                      <p className={`text-sm ${textSecondary}`}>
                        Revisar eventos de severidad crítica para identificar posibles problemas de seguridad.
                      </p>
                    </div>
                  </div>

                  <div
                    className={`p-4 rounded-xl border-2 ${
                      darkMode
                        ? "bg-emerald-500/10 border-emerald-500/40"
                        : "bg-emerald-50 border-emerald-200"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <CheckCircle
                        className={`w-5 h-5 mt-0.5 flex-shrink-0 ${
                          darkMode ? "text-emerald-400" : "text-emerald-600"
                        }`}
                      />
                      <p className={`text-sm ${textSecondary}`}>
                        Mantener registros de auditoría actualizados para cumplimiento normativo.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Footer */}
        <div
          className={`${cardBg} rounded-3xl shadow-2xl border ${borderColor} p-6 animate-in fade-in slide-in-from-bottom-4 duration-500`}
          style={{
            animationDelay: mostrarEstadisticas ? "650ms" : "400ms",
          }}
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className={`text-xs font-black uppercase tracking-wider ${textMuted} mb-2`}>
                Información
              </p>
              <p className={`${textSecondary} text-sm`}>
                ID Usuario: <span className="font-mono font-bold">{params.id}</span>
              </p>
              <p className={`${textSecondary} text-sm mt-1`}>
                Generado: {new Date().toLocaleString("es-CL")}
              </p>
            </div>

            <div>
              <p className={`text-xs font-black uppercase tracking-wider ${textMuted} mb-2`}>
                Estadísticas
              </p>
              <p className={`${textSecondary} text-sm`}>
                Total Registros: {paginacion.total}
              </p>
              <p className={`${textSecondary} text-sm mt-1`}>
                Página: {paginacion.page} de {paginacion.total_pages}
              </p>
            </div>

            <div>
              <p className={`text-xs font-black uppercase tracking-wider ${textMuted} mb-2`}>
                Acciones
              </p>
              <button
                onClick={refrescarDatos}
                disabled={refreshing}
                className={`w-full px-4 py-2 bg-gradient-to-r ${theme.primary} text-white rounded-lg font-bold text-sm hover:shadow-lg transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-2`}
              >
                <RefreshCw
                  className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`}
                />
                {refreshing ? "Refrescando..." : "Refrescar"}
              </button>
            </div>
          </div>
        </div>

        {/* Espaciador Final */}
        <div className="h-10"></div>
      </div>
    </div>
  );
}

