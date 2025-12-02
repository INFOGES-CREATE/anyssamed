// frontend/src/app/(dashboard)/administrativo/usuarios/[id]/estadisticas/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  TrendingUp,
  Activity,
  Calendar,
  Clock,
  AlertTriangle,
  CheckCircle,
  XCircle,
  BarChart3,
  PieChart,
  Loader2,
  Download,
  Moon,
  Sun,
  FileBarChart,
  Users,
  Target,
  Palette,
  Sparkles,
  X,
  Zap,
  Flame,
  Award,
  Shield,
  DollarSign,
  TrendingDown,
  Eye,
  EyeOff,
  RefreshCw,
  Filter,
  Search,
  ChevronDown,
  MapPin,
  Smartphone,
  Globe,
  Heart,
  AlertCircle,
  CheckSquare,
  Square,
  Layers,
  GitBranch,
  Cpu,
  Wifi,
  Headphones,
  MessageSquare,
  Send,
  Plus,
  Minus,
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

interface Estadisticas {
  resumen: {
    total_citas: number;
    citas_completadas: number;
    citas_canceladas: number;
    citas_programada: number;
    citas_confirmadas: number;
    citas_no_asistio: number;
    citas_futuras: number;
    citas_urgentes: number;
    ingresos_totales: number;
    citas_sin_pagar: number;
    total_logs: number;
    logs_error: number;
    logs_seguridad: number;
    logs_auditoria: number;
    logs_advertencia: number;
    logs_fallidos: number;
    ultima_actividad: string;
    actividad_hoy: number;
    actividad_semana: number;
    actividad_mes: number;
    pacientes_atendidos: number;
    medicos_consultados: number;
  };
  actividad_mensual: Array<{
    mes: string;
    mes_formato: string;
    total_actividades: number;
    dias_activos: number;
    errores: number;
    eventos_seguridad: number;
    acciones_fallidas: number;
  }>;
  citas_por_estado: Array<{
    estado: string;
    cantidad: number;
    porcentaje: number;
  }>;
  citas_por_tipo: Array<{
    tipo_cita: string;
    cantidad: number;
    porcentaje: number;
    ingresos: number;
  }>;
  citas_por_origen: Array<{
    origen: string;
    cantidad: number;
    porcentaje: number;
  }>;
  citas_por_prioridad: Array<{
    prioridad: string;
    cantidad: number;
    porcentaje: number;
  }>;
  modulos_mas_usados: Array<{
    modulo: string;
    accesos: number;
    dias_uso: number;
    ultimo_acceso: string;
    errores: number;
    fallos: number;
  }>;
  acciones_frecuentes: Array<{
    accion: string;
    modulo: string;
    frecuencia: number;
    ultima_vez: string;
    fallos: number;
    errores: number;
  }>;
  horario_actividad: Array<{
    hora: number;
    hora_formato: string;
    actividades: number;
    dias: number;
    errores: number;
  }>;
  dias_semana: Array<{
    dia_semana: string;
    dia_numero: number;
    actividades: number;
    ocurrencias: number;
    errores: number;
  }>;
  errores_recientes: Array<{
    id_log: number;
    fecha_hora: string;
    modulo: string;
    accion: string;
    descripcion: string;
    nivel_severidad: number;
    ip_origen: string;
    mensaje_error: string;
  }>;
  eventos_seguridad: Array<{
    id_log: number;
    fecha_hora: string;
    accion: string;
    descripcion: string;
    ip_origen: string;
    nivel_severidad: number;
    agente_usuario: string;
    objeto_tipo: string;
    objeto_id: string;
  }>;
  auditoria_reciente: Array<{
    id_log: number;
    fecha_hora: string;
    accion: string;
    modulo: string;
    descripcion: string;
    objeto_tipo: string;
    objeto_id: string;
    exitoso: number;
  }>;
  citas_recientes: Array<{
    id_cita: number;
    fecha_hora_inicio: string;
    fecha_hora_fin: string;
    tipo_cita: string;
    estado: string;
    prioridad: string;
    pagada: number;
    monto: number;
    origen: string;
    nombre_paciente: string;
    nombre_medico: string;
  }>;
  acciones_por_modulo: Array<{
    modulo: string;
    accion: string;
    cantidad: number;
  }>;
  distribucion_severidad: Array<{
    nivel_severidad: number;
    cantidad: number;
    porcentaje: number;
  }>;
  estadisticas_pagos: {
    total_citas: number;
    citas_pagadas: number;
    citas_sin_pagar: number;
    total_pagado: number;
    total_pendiente: number;
    promedio_pago: number;
  };
  tasa_exito: {
    total_acciones: number;
    acciones_exitosas: number;
    acciones_fallidas: number;
    porcentaje_exito: number;
  };
}

// ==============================
// 🎨 TEMAS PREMIUM AVANZADOS
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
              <TrendingDown className="w-3 h-3" />
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

export default function EstadisticasUsuarioPage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();

  // ==============================
  // 🧠 STATE PRINCIPAL
  // ==============================
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [estadisticas, setEstadisticas] = useState<Estadisticas | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // ==============================
  // 🌗 THEME / UI PREFS
  // ==============================
  const [darkMode, setDarkMode] = useState(false);
  const [selectedTheme, setSelectedTheme] =
    useState<keyof typeof colorThemes>("aurora");
  const [mostrarThemeSelector, setMostrarThemeSelector] = useState(false);
  const [filtroModulo, setFiltroModulo] = useState<string>("todos");
  const [mostrarDetalles, setMostrarDetalles] = useState<{
    [key: string]: boolean;
  }>({});

  // ==============================
  // 🎨 CLASES DINÁMICAS
  // ==============================
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
  const porcentajeExito = Number(
    estadisticas?.tasa_exito?.porcentaje_exito ?? 0
  );

  const totalAccionesExito =
    estadisticas?.tasa_exito?.total_acciones &&
    estadisticas.tasa_exito.total_acciones > 0
      ? estadisticas.tasa_exito.total_acciones
      : 1;

  // ==============================
  // 🎛 THEME EFFECTS
  // ==============================
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

  // ==============================
  // 📥 CARGA DE DATOS
  // ==============================
  useEffect(() => {
    cargarEstadisticas();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id]);

  const cargarEstadisticas = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(
        `/api/admin/usuarios/${params.id}/estadisticas`,
        { cache: "no-store" }
      );
      const data = await response.json();

      if (data.success) {
        setEstadisticas(data.data);
      } else {
        setError(data.error || "Error al cargar estadísticas");
      }
    } catch (err: any) {
      console.error(err);
      setError("Error al cargar estadísticas");
    } finally {
      setLoading(false);
    }
  };

  const refrescarDatos = async () => {
    setRefreshing(true);
    await cargarEstadisticas();
    setRefreshing(false);
  };

  const exportarEstadisticas = (formato: "json" | "csv") => {
    if (!estadisticas) return;

    if (formato === "json") {
      const dataStr = JSON.stringify(estadisticas, null, 2);
      const dataBlob = new Blob([dataStr], { type: "application/json" });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `estadisticas-usuario-${params.id}-${new Date()
        .toISOString()
        .split("T")[0]}.json`;
      link.click();
    } else if (formato === "csv") {
      let csv = "Reporte de Estadísticas\n";
      csv += `Generado: ${new Date().toLocaleString("es-CL")}\n\n`;
      csv += "RESUMEN GENERAL\n";
      csv += `Total Citas,${estadisticas.resumen.total_citas}\n`;
      csv += `Citas Completadas,${estadisticas.resumen.citas_completadas}\n`;
      csv += `Ingresos Totales,${estadisticas.resumen.ingresos_totales}\n`;
      csv += `Total Logs,${estadisticas.resumen.total_logs}\n`;

      const dataBlob = new Blob([csv], { type: "text/csv" });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `estadisticas-usuario-${params.id}-${new Date()
        .toISOString()
        .split("T")[0]}.csv`;
      link.click();
    }
  };

  // ==============================
  // ⏳ LOADING PREMIUM
  // ==============================
  if (loading) {
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

          <div className="relative">
            <div
              className={`w-20 h-20 border-4 border-transparent rounded-full animate-spin mx-auto mb-6 bg-gradient-to-r ${theme.primary} bg-clip-border`}
            ></div>
          </div>

          <div className="relative z-10">
            <h3
              className={`text-2xl font-black ${textPrimary} mb-2 flex items-center gap-2 justify-center`}
            >
              <Sparkles className="w-6 h-6 animate-pulse" />
              Cargando Estadísticas Premium
            </h3>
            <p className={`${textSecondary} font-medium animate-pulse`}>
              Analizando datos del usuario...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className={`min-h-screen ${bgClass} p-6 flex items-center justify-center transition-all duration-500`}
      >
        <div
          className={`${cardBg} rounded-3xl shadow-2xl border ${borderColor} p-8 max-w-md w-full`}
        >
          <div className="flex items-center justify-center mb-4">
            <div className="p-4 bg-gradient-to-br from-rose-500 to-red-600 rounded-2xl shadow-lg">
              <AlertTriangle className="w-8 h-8 text-white" />
            </div>
          </div>
          <h3 className={`text-xl font-black ${textPrimary} text-center mb-2`}>
            Error al Cargar
          </h3>
          <p className={`${textSecondary} text-center mb-6`}>{error}</p>
          <button
            onClick={() => router.back()}
            className={`w-full px-6 py-3 bg-gradient-to-r ${theme.primary} text-white rounded-xl shadow-lg ${theme.glow} hover:shadow-2xl transition-all duration-300 font-bold`}
          >
            Volver Atrás
          </button>
        </div>
      </div>
    );
  }

  if (!estadisticas) {
    return null;
  }

  const { resumen } = estadisticas;
  const COLORS = darkMode ? COLORS_DARK : COLORS_LIGHT;

  // Calcular tendencias
  const tendenciaCitas =
    resumen.citas_completadas > 0
      ? Math.round(
          ((resumen.citas_completadas - resumen.citas_canceladas) /
            resumen.citas_completadas) *
            100
        )
      : 0;

  const tendenciaIngresos =
    resumen.ingresos_totales > 0
      ? Math.round(
          ((resumen.ingresos_totales - resumen.citas_sin_pagar) /
            resumen.ingresos_totales) *
            100
        )
      : 0;

  // ==============================
  // 🖼 RENDER PRINCIPAL PREMIUM
  // ==============================
  return (
    <div
      className={`min-h-screen ${bgClass} p-3 md:p-6 transition-all duration-500 relative overflow-hidden`}
    >
      {/* Efecto de fondo animado */}
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
        {/* ========================== */}
        {/* CONTROLES FLOTANTES */}
        {/* ========================== */}
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
        </div>

        {/* ========================== */}
        {/* HEADER PREMIUM */}
        {/* ========================== */}
        <div
          className={`${cardBg} rounded-3xl shadow-2xl border ${borderColor} overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500`}
        >
          {/* Barra superior con gradiente */}
          <div className={`h-2 bg-gradient-to-r ${theme.primary}`}></div>

          <div className="p-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              {/* Info */}
              <div className="flex items-center gap-6">
                <button
                  onClick={() => router.push(`/admin/usuarios/`)}
                  className={`p-3 ${
                    darkMode ? "bg-slate-800/80" : "bg-white/80"
                  } ${borderColor} border rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 group hover:scale-105`}
                >
                  <ArrowLeft
                    className={`w-5 h-5 ${textPrimary} group-hover:-translate-x-1 transition-transform duration-300`}
                  />
                </button>

                {/* Avatar */}
                <div className="relative group">
                  <div
                    className={`absolute -inset-1 bg-gradient-to-r ${theme.primary} rounded-2xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity`}
                  ></div>
                  <div
                    className={`relative w-20 h-20 rounded-2xl bg-gradient-to-br ${theme.primary} flex items-center justify-center border-2 ${
                      darkMode ? "border-slate-700" : "border-white"
                    } shadow-xl`}
                  >
                    <BarChart3 className="w-10 h-10 text-white" />
                  </div>
                </div>

                {/* Texto */}
                <div>
                  <h1 className={`text-3xl font-black ${textPrimary}`}>
                    Dashboard Premium
                  </h1>
                  <p className={`${textSecondary} font-medium mt-1`}>
                    Análisis completo de actividad, citas y comportamiento
                  </p>
                </div>
              </div>

              {/* Botones exportar */}
              <div className="flex gap-3">
                <button
                  onClick={() => exportarEstadisticas("json")}
                  className={`flex items-center gap-2 px-4 py-3 bg-gradient-to-r ${theme.primary} text-white rounded-xl shadow-lg ${theme.glow} hover:shadow-2xl transition-all duration-300 font-bold group hover:scale-105 text-sm`}
                >
                  <Download className="w-4 h-4 group-hover:rotate-12 transition-transform duration-300" />
                  <span>JSON</span>
                </button>
                <button
                  onClick={() => exportarEstadisticas("csv")}
                  className={`flex items-center gap-2 px-4 py-3 bg-gradient-to-r ${theme.primary} text-white rounded-xl shadow-lg ${theme.glow} hover:shadow-2xl transition-all duration-300 font-bold group hover:scale-105 text-sm`}
                >
                  <FileBarChart className="w-4 h-4 group-hover:rotate-12 transition-transform duration-300" />
                  <span>CSV</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ========================== */}
        {/* ESTADÍSTICAS PRINCIPALES - FILA 1 */}
        {/* ========================== */}
        <div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500"
          style={{ animationDelay: "100ms" }}
        >
          <StatCard
            icon={<Calendar className="w-6 h-6 text-white" />}
            title="Total Citas"
            value={resumen.total_citas}
            subtitle={`${resumen.citas_completadas} completadas`}
            trend={tendenciaCitas}
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
            icon={<Activity className="w-6 h-6 text-white" />}
            title="Actividad Hoy"
            value={resumen.actividad_hoy}
            subtitle={`${resumen.actividad_semana} esta semana`}
            trend={
              resumen.actividad_hoy > 0 && resumen.actividad_semana > 0
                ? Math.round(
                    (resumen.actividad_hoy /
                      (resumen.actividad_semana / 7)) *
                      100 -
                      100
                  )
                : 0
            }
            color="green"
            darkMode={darkMode}
            theme={theme}
            textPrimary={textPrimary}
            textSecondary={textSecondary}
            textMuted={textMuted}
            cardBg={cardBg}
            borderColor={borderColor}
          />

          <StatCard
            icon={<DollarSign className="w-6 h-6 text-white" />}
            title="Ingresos Totales"
            value={`$${resumen.ingresos_totales.toLocaleString("es-CL")}`}
            subtitle={`${resumen.citas_sin_pagar} citas sin pagar`}
            trend={tendenciaIngresos}
            color="emerald"
            darkMode={darkMode}
            theme={theme}
            textPrimary={textPrimary}
            textSecondary={textSecondary}
            textMuted={textMuted}
            cardBg={cardBg}
            borderColor={borderColor}
          />

          <StatCard
            icon={<FileBarChart className="w-6 h-6 text-white" />}
            title="Total Logs"
            value={resumen.total_logs}
            subtitle={`${resumen.logs_error} errores`}
            trend={
              resumen.logs_error > 0 && resumen.total_logs > 0
                ? -Math.round((resumen.logs_error / resumen.total_logs) * 100)
                : 0
            }
            color="purple"
            darkMode={darkMode}
            theme={theme}
            textPrimary={textPrimary}
            textSecondary={textSecondary}
            textMuted={textMuted}
            cardBg={cardBg}
            borderColor={borderColor}
          />
        </div>

        {/* ========================== */}
        {/* ESTADÍSTICAS SECUNDARIAS - FILA 2 */}
        {/* ========================== */}
        <div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500"
          style={{ animationDelay: "150ms" }}
        >
          <StatCard
            icon={<CheckCircle className="w-6 h-6 text-white" />}
            title="Completadas"
            value={resumen.citas_completadas}
            color="emerald"
            darkMode={darkMode}
            theme={theme}
            textPrimary={textPrimary}
            textSecondary={textSecondary}
            textMuted={textMuted}
            cardBg={cardBg}
            borderColor={borderColor}
          />

          <StatCard
            icon={<XCircle className="w-6 h-6 text-white" />}
            title="Canceladas"
            value={resumen.citas_canceladas}
            color="rose"
            darkMode={darkMode}
            theme={theme}
            textPrimary={textPrimary}
            textSecondary={textSecondary}
            textMuted={textMuted}
            cardBg={cardBg}
            borderColor={borderColor}
          />

          <StatCard
            icon={<Clock className="w-6 h-6 text-white" />}
            title="Programadas"
            value={resumen.citas_programada}
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
            icon={<Users className="w-6 h-6 text-white" />}
            title="Pacientes"
            value={resumen.pacientes_atendidos}
            color="cyan"
            darkMode={darkMode}
            theme={theme}
            textPrimary={textPrimary}
            textSecondary={textSecondary}
            textMuted={textMuted}
            cardBg={cardBg}
            borderColor={borderColor}
          />

          <StatCard
            icon={<Shield className="w-6 h-6 text-white" />}
            title="Tasa Éxito"
            value={`${porcentajeExito.toFixed(1)}%`}
            color="indigo"
            darkMode={darkMode}
            theme={theme}
            textPrimary={textPrimary}
            textSecondary={textSecondary}
            textMuted={textMuted}
            cardBg={cardBg}
            borderColor={borderColor}
          />
        </div>

        {/* ========================== */}
        {/* GRÁFICOS PRINCIPALES - FILA 1 */}
        {/* ========================== */}
        <div
          className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500"
          style={{ animationDelay: "200ms" }}
        >
          {/* Actividad Mensual - Línea */}
          <div
            className={`${cardBg} rounded-3xl shadow-2xl border ${borderColor} p-6 overflow-hidden`}
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div
                  className={`p-3 bg-gradient-to-br ${theme.primary} rounded-xl shadow-lg`}
                >
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <h3 className={`text-xl font-black ${textPrimary}`}>
                  Actividad Mensual
                </h3>
              </div>
              <span
                className={`text-xs font-black px-3 py-1 rounded-full ${
                  darkMode
                    ? "bg-blue-500/20 text-blue-300"
                    : "bg-blue-50 text-blue-600"
                }`}
              >
                ÚLTIMOS 6 MESES
              </span>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={estadisticas.actividad_mensual}>
                <defs>
                  <linearGradient id="colorActividad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={theme.light} stopOpacity={0.8} />
                    <stop offset="95%" stopColor={theme.light} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke={darkMode ? "#374151" : "#e2e8f0"}
                />
                <XAxis
                  dataKey="mes_formato"
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
                    border: `1px solid ${darkMode ? "#475569" : "#e2e8f0"}`,
                    borderRadius: "12px",
                    padding: "12px",
                    fontWeight: 600,
                  }}
                  labelStyle={{
                    color: darkMode ? "#e2e8f0" : "#0f172a",
                    fontWeight: 700,
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="total_actividades"
                  stroke={theme.dark}
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorActividad)"
                  name="Actividades"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Citas por Estado - Pie */}
          <div
            className={`${cardBg} rounded-3xl shadow-2xl border ${borderColor} p-6 overflow-hidden`}
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div
                  className={`p-3 bg-gradient-to-br ${theme.primary} rounded-xl shadow-lg`}
                >
                  <PieChart className="w-6 h-6 text-white" />
                </div>
                <h3 className={`text-xl font-black ${textPrimary}`}>
                  Citas por Estado
                </h3>
              </div>
              <span
                className={`text-xs font-black px-3 py-1 rounded-full ${
                  darkMode
                    ? "bg-purple-500/20 text-purple-300"
                    : "bg-purple-50 text-purple-600"
                }`}
              >
                {estadisticas.citas_por_estado.length} ESTADOS
              </span>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <RechartsPieChart>
                <Pie
                  data={estadisticas.citas_por_estado}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry: any) => `${entry.estado}: ${entry.cantidad}`}
                  outerRadius={90}
                  fill="#8884d8"
                  dataKey="cantidad"
                >
                  {estadisticas.citas_por_estado.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: darkMode ? "#1e293b" : "#ffffff",
                    border: `1px solid ${darkMode ? "#475569" : "#e2e8f0"}`,
                    borderRadius: "12px",
                    padding: "12px",
                    fontWeight: 600,
                  }}
                />
              </RechartsPieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* ========================== */}
        {/* GRÁFICOS PRINCIPALES - FILA 2 */}
        {/* ========================== */}
        <div
          className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500"
          style={{ animationDelay: "250ms" }}
        >
          {/* Horario de Actividad */}
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
              <BarChart data={estadisticas.horario_actividad}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke={darkMode ? "#374151" : "#e2e8f0"}
                />
                <XAxis
                  dataKey="hora_formato"
                  stroke={darkMode ? "#94a3b8" : "#64748b"}
                  style={{ fontSize: "11px", fontWeight: 600 }}
                />
                <YAxis
                  stroke={darkMode ? "#94a3b8" : "#64748b"}
                  style={{ fontSize: "12px", fontWeight: 600 }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: darkMode ? "#1e293b" : "#ffffff",
                    border: `1px solid ${darkMode ? "#475569" : "#e2e8f0"}`,
                    borderRadius: "12px",
                    padding: "12px",
                    fontWeight: 600,
                  }}
                />
                <Bar
                  dataKey="actividades"
                  fill={theme.light}
                  radius={[8, 8, 0, 0]}
                  name="Actividades"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Días de la Semana */}
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
              <BarChart data={estadisticas.dias_semana}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke={darkMode ? "#374151" : "#e2e8f0"}
                />
                <XAxis
                  dataKey="dia_semana"
                  stroke={darkMode ? "#94a3b8" : "#64748b"}
                  style={{ fontSize: "12px", fontWeight: 600 }}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis
                  stroke={darkMode ? "#94a3b8" : "#64748b"}
                  style={{ fontSize: "12px", fontWeight: 600 }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: darkMode ? "#1e293b" : "#ffffff",
                    border: `1px solid ${darkMode ? "#475569" : "#e2e8f0"}`,
                    borderRadius: "12px",
                    padding: "12px",
                    fontWeight: 600,
                  }}
                />
                <Bar
                  dataKey="actividades"
                  fill="#8b5cf6"
                  radius={[8, 8, 0, 0]}
                  name="Actividades"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* ========================== */}
        {/* GRÁFICOS SECUNDARIOS - FILA 3 */}
        {/* ========================== */}
        <div
          className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500"
          style={{ animationDelay: "300ms" }}
        >
          {/* Citas por Tipo */}
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
                  Citas por Tipo
                </h3>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={estadisticas.citas_por_tipo}
                layout="vertical"
                margin={{ left: 100 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke={darkMode ? "#374151" : "#e2e8f0"}
                />
                <XAxis
                  type="number"
                  stroke={darkMode ? "#94a3b8" : "#64748b"}
                  style={{ fontSize: "12px", fontWeight: 600 }}
                />
                <YAxis
                  dataKey="tipo_cita"
                  type="category"
                  stroke={darkMode ? "#94a3b8" : "#64748b"}
                  style={{ fontSize: "12px", fontWeight: 600 }}
                  width={95}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: darkMode ? "#1e293b" : "#ffffff",
                    border: `1px solid ${darkMode ? "#475569" : "#e2e8f0"}`,
                    borderRadius: "12px",
                    padding: "12px",
                    fontWeight: 600,
                  }}
                />
                <Bar
                  dataKey="cantidad"
                  fill={theme.light}
                  radius={[0, 8, 8, 0]}
                  name="Cantidad"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Citas por Origen */}
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
                  Citas por Origen
                </h3>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <RechartsPieChart>
                <Pie
                  data={estadisticas.citas_por_origen}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry: any) => `${entry.origen}: ${entry.cantidad}`}
                  outerRadius={90}
                  fill="#8884d8"
                  dataKey="cantidad"
                >
                  {estadisticas.citas_por_origen.map((entry, index) => (
                    <Cell
                      key={`cell-origen-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: darkMode ? "#1e293b" : "#ffffff",
                    border: `1px solid ${darkMode ? "#475569" : "#e2e8f0"}`,
                    borderRadius: "12px",
                    padding: "12px",
                    fontWeight: 600,
                  }}
                />
              </RechartsPieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* ========================== */}
        {/* MÓDULOS MÁS USADOS */}
        {/* ========================== */}
        <div
          className={`${cardBg} rounded-3xl shadow-2xl border ${borderColor} p-6 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500`}
          style={{ animationDelay: "350ms" }}
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div
                className={`p-3 bg-gradient-to-br ${theme.primary} rounded-xl shadow-lg`}
              >
                <Target className="w-6 h-6 text-white" />
              </div>
              <h3 className={`text-xl font-black ${textPrimary}`}>
                Módulos Más Utilizados
              </h3>
            </div>
            <span
              className={`text-xs font-black px-3 py-1 rounded-full ${
                darkMode
                  ? "bg-indigo-500/20 text-indigo-300"
                  : "bg-indigo-50 text-indigo-600"
              }`}
            >
              ÚLTIMOS 30 DÍAS
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead
                className={`${
                  darkMode ? "bg-slate-700/50" : "bg-slate-50"
                } border-b-2 transition-colors duration-300 ${
                  darkMode ? "border-slate-600" : "border-slate-200"
                }`}
              >
                <tr>
                  <th
                    className={`px-6 py-4 text-left text-xs font-black uppercase tracking-wider ${textMuted}`}
                  >
                    Módulo
                  </th>
                  <th
                    className={`px-6 py-4 text-left text-xs font-black uppercase tracking-wider ${textMuted}`}
                  >
                    Accesos
                  </th>
                  <th
                    className={`px-6 py-4 text-left text-xs font-black uppercase tracking-wider ${textMuted}`}
                  >
                    Días Uso
                  </th>
                  <th
                    className={`px-6 py-4 text-left text-xs font-black uppercase tracking-wider ${textMuted}`}
                  >
                    Errores
                  </th>
                  <th
                    className={`px-6 py-4 text-left text-xs font-black uppercase tracking-wider ${textMuted}`}
                  >
                    Último Acceso
                  </th>
                </tr>
              </thead>
              <tbody
                className={`divide-y transition-colors duration-300 ${
                  darkMode ? "divide-slate-700" : "divide-slate-200"
                }`}
              >
                {estadisticas.modulos_mas_usados.map((modulo, idx) => (
                  <tr
                    key={idx}
                    className={`transition-colors duration-200 ${
                      darkMode ? "hover:bg-slate-700/50" : "hover:bg-slate-50"
                    }`}
                  >
                    <td
                      className={`px-6 py-4 font-bold ${
                        darkMode ? "text-white" : "text-slate-900"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-3 h-3 rounded-full bg-gradient-to-r ${theme.primary}`}
                        ></div>
                        {modulo.modulo}
                      </div>
                    </td>
                    <td
                      className={`px-6 py-4 font-black text-lg ${
                        darkMode ? "text-blue-400" : "text-blue-600"
                      }`}
                    >
                      {modulo.accesos}
                    </td>
                    <td className={`px-6 py-4 font-semibold ${textSecondary}`}>
                      {modulo.dias_uso}
                    </td>
                    <td
                      className={`px-6 py-4 font-bold ${
                        modulo.errores > 0
                          ? darkMode
                            ? "text-rose-400"
                            : "text-rose-600"
                          : textSecondary
                      }`}
                    >
                      {modulo.errores}
                    </td>
                    <td className={`px-6 py-4 ${textMuted}`}>
                      {new Date(modulo.ultimo_acceso).toLocaleDateString(
                        "es-CL"
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ========================== */}
        {/* ACCIONES FRECUENTES */}
        {/* ========================== */}
        <div
          className={`${cardBg} rounded-3xl shadow-2xl border ${borderColor} p-6 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500`}
          style={{ animationDelay: "400ms" }}
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
            <span
              className={`text-xs font-black px-3 py-1 rounded-full ${
                darkMode
                  ? "bg-yellow-500/20 text-yellow-300"
                  : "bg-yellow-50 text-yellow-600"
              }`}
            >
              TOP 15
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {estadisticas.acciones_frecuentes.slice(0, 10).map((accion, idx) => (
              <div
                key={idx}
                className={`flex items-center justify-between p-5 rounded-2xl border-2 transition-all duration-300 group cursor-pointer ${
                  darkMode
                    ? "bg-slate-700/30 border-slate-600 hover:border-blue-500 hover:bg-slate-700/50"
                    : "bg-slate-50 border-slate-200 hover:border-blue-400 hover:bg-slate-100"
                }`}
              >
                <div className="flex-1">
                  <p className={`font-bold text-lg ${textPrimary}`}>
                    {accion.accion}
                  </p>
                  <p className={`text-sm mt-1 ${textMuted}`}>{accion.modulo}</p>
                </div>
                <div className="text-right ml-4">
                  <p
                    className={`text-3xl font-black ${
                      darkMode ? "text-blue-400" : "text-indigo-600"
                    }`}
                  >
                    {accion.frecuencia}
                  </p>
                  <p className={`text-xs font-semibold ${textMuted}`}>veces</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ========================== */}
        {/* ESTADÍSTICAS DE PAGOS */}
        {/* ========================== */}
        <div
          className={`${cardBg} rounded-3xl shadow-2xl border ${borderColor} p-6 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500`}
          style={{ animationDelay: "450ms" }}
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div
                className={`p-3 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl shadow-lg`}
              >
                <DollarSign className="w-6 h-6 text-white" />
              </div>
              <h3 className={`text-xl font-black ${textPrimary}`}>
                Análisis de Pagos
              </h3>
            </div>
            <span
              className={`text-xs font-black px-3 py-1 rounded-full ${
                darkMode
                  ? "bg-emerald-500/20 text-emerald-300"
                  : "bg-emerald-50 text-emerald-600"
              }`}
            >
              FINANCIERO
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Gráfico de Pagos */}
            <div>
              <ResponsiveContainer width="100%" height={250}>
                <RechartsPieChart>
                  <Pie
                    data={[
                      {
                        name: "Pagadas",
                        value: estadisticas.estadisticas_pagos.citas_pagadas,
                      },
                      {
                        name: "Sin Pagar",
                        value: estadisticas.estadisticas_pagos.citas_sin_pagar,
                      },
                    ]}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(entry: any) => `${entry.name}: ${entry.value}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    <Cell fill="#10b981" />
                    <Cell fill="#ef4444" />
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

            {/* Detalles de Pagos */}
            <div className="space-y-4">
              <div
                className={`p-4 rounded-2xl ${
                  darkMode ? "bg-emerald-500/10" : "bg-emerald-50"
                } border-2 ${
                  darkMode ? "border-emerald-500/30" : "border-emerald-200"
                }`}
              >
                <p className={`text-sm ${textMuted} uppercase font-bold mb-1`}>
                  Total Pagado
                </p>
                <p
                  className={`text-3xl font-black ${
                    darkMode ? "text-emerald-400" : "text-emerald-600"
                  }`}
                >
                  $
                  {estadisticas.estadisticas_pagos.total_pagado.toLocaleString(
                    "es-CL"
                  )}
                </p>
              </div>

              <div
                className={`p-4 rounded-2xl ${
                  darkMode ? "bg-rose-500/10" : "bg-rose-50"
                } border-2 ${
                  darkMode ? "border-rose-500/30" : "border-rose-200"
                }`}
              >
                <p className={`text-sm ${textMuted} uppercase font-bold mb-1`}>
                  Total Pendiente
                </p>
                <p
                  className={`text-3xl font-black ${
                    darkMode ? "text-rose-400" : "text-rose-600"
                  }`}
                >
                  $
                  {estadisticas.estadisticas_pagos.total_pendiente.toLocaleString(
                    "es-CL"
                  )}
                </p>
              </div>

              <div
                className={`p-4 rounded-2xl ${
                  darkMode ? "bg-blue-500/10" : "bg-blue-50"
                } border-2 ${
                  darkMode ? "border-blue-500/30" : "border-blue-200"
                }`}
              >
                <p className={`text-sm ${textMuted} uppercase font-bold mb-1`}>
                  Promedio por Cita
                </p>
                <p
                  className={`text-3xl font-black ${
                    darkMode ? "text-blue-400" : "text-blue-600"
                  }`}
                >
                  $
                  {estadisticas.estadisticas_pagos.promedio_pago.toLocaleString(
                    "es-CL"
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ========================== */}
        {/* TASA DE ÉXITO Y CONFIABILIDAD */}
        {/* ========================== */}
        <div
          className={`${cardBg} rounded-3xl shadow-2xl border ${borderColor} p-6 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500`}
          style={{ animationDelay: "500ms" }}
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div
                className={`p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-lg`}
              >
                <Award className="w-6 h-6 text-white" />
              </div>
              <h3 className={`text-xl font-black ${textPrimary}`}>
                Tasa de Éxito y Confiabilidad
              </h3>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Tasa de Éxito */}
            <div className="relative">
              <div className="flex flex-col items-center justify-center h-64">
                <div className="relative w-40 h-40">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle
                      cx="80"
                      cy="80"
                      r="70"
                      fill="none"
                      stroke={darkMode ? "#374151" : "#e2e8f0"}
                      strokeWidth="8"
                    />
                    <circle
                      cx="80"
                      cy="80"
                      r="70"
                      fill="none"
                      stroke={theme.light}
                      strokeWidth="8"
                      strokeDasharray={`${
                        (estadisticas.tasa_exito.porcentaje_exito / 100) * 440
                      } 440`}
                      strokeLinecap="round"
                      className="transition-all duration-1000"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <p
                      className={`text-4xl font-black ${
                        darkMode ? "text-indigo-400" : "text-indigo-600"
                      }`}
                    >
                      {porcentajeExito.toFixed(1)}%
                    </p>
                    <p className={`text-xs font-bold ${textMuted} mt-2`}>
                      Éxito
                    </p>
                  </div>
                </div>
              </div>
              <p className={`text-center text-sm ${textMuted} font-bold mt-4`}>
                {estadisticas.tasa_exito.acciones_exitosas} de{" "}
                {estadisticas.tasa_exito.total_acciones} acciones
              </p>
            </div>

            {/* Acciones Exitosas */}
            <div
              className={`p-6 rounded-2xl border-2 ${
                darkMode
                  ? "bg-emerald-500/10 border-emerald-500/30"
                  : "bg-emerald-50 border-emerald-200"
              }`}
            >
              <div className="flex items-center gap-3 mb-4">
                <div
                  className={`p-3 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600`}
                >
                  <CheckCircle className="w-6 h-6 text-white" />
                </div>
                <h4 className={`font-black ${textPrimary}`}>Exitosas</h4>
              </div>
              <p
                className={`text-4xl font-black ${
                  darkMode ? "text-emerald-400" : "text-emerald-600"
                } mb-2`}
              >
                {estadisticas.tasa_exito.acciones_exitosas}
              </p>
              <p className={`text-sm ${textMuted}`}>
                Acciones completadas sin errores
              </p>
              <div className="mt-4 w-full bg-gray-300 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-emerald-500 to-green-600 h-2 rounded-full transition-all duration-1000"
                  style={{
                    width: `${
                      (estadisticas.tasa_exito.acciones_exitosas /
                        totalAccionesExito) *
                      100
                    }%`,
                  }}
                ></div>
              </div>
            </div>

            {/* Acciones Fallidas */}
            <div
              className={`p-6 rounded-2xl border-2 ${
                darkMode
                  ? "bg-rose-500/10 border-rose-500/30"
                  : "bg-rose-50 border-rose-200"
              }`}
            >
              <div className="flex items-center gap-3 mb-4">
                <div
                  className={`p-3 rounded-xl bg-gradient-to-br from-rose-500 to-red-600`}
                >
                  <XCircle className="w-6 h-6 text-white" />
                </div>
                <h4 className={`font-black ${textPrimary}`}>Fallidas</h4>
              </div>
              <p
                className={`text-4xl font-black ${
                  darkMode ? "text-rose-400" : "text-rose-600"
                } mb-2`}
              >
                {estadisticas.tasa_exito.acciones_fallidas}
              </p>
              <p className={`text-sm ${textMuted}`}>
                Acciones con errores o interrupciones
              </p>
              <div className="mt-4 w-full bg-gray-300 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-rose-500 to-red-600 h-2 rounded-full transition-all duration-1000"
                  style={{
                    width: `${
                      (estadisticas.tasa_exito.acciones_fallidas /
                        totalAccionesExito) *
                      100
                    }%`,
                  }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* ========================== */}
        {/* ERRORES RECIENTES DETALLADOS */}
        {/* ========================== */}
        {estadisticas.errores_recientes.length > 0 && (
          <div
            className={`${cardBg} rounded-3xl shadow-2xl border ${borderColor} p-6 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500`}
            style={{ animationDelay: "550ms" }}
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-gradient-to-br from-rose-500 to-red-600 rounded-xl shadow-lg">
                  <AlertTriangle className="w-6 h-6 text-white" />
                </div>
                <h3 className={`text-xl font-black ${textPrimary}`}>
                  Errores Recientes
                </h3>
              </div>
              <span
                className={`text-xs font-black px-3 py-1 rounded-full ${
                  darkMode
                    ? "bg-rose-500/20 text-rose-300"
                    : "bg-rose-50 text-rose-600"
                }`}
              >
                {estadisticas.errores_recientes.length} ERRORES
              </span>
            </div>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {estadisticas.errores_recientes.map((errItem, idx) => (
                <div
                  key={idx}
                  className={`p-5 rounded-2xl border-2 transition-all duration-300 group cursor-pointer hover:scale-[1.02] ${
                    darkMode
                      ? "bg-rose-500/10 border-rose-500/30 hover:border-rose-500/50"
                      : "bg-rose-50 border-rose-200 hover:border-rose-400"
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span
                          className={`text-xs font-black px-2 py-1 rounded-full ${
                            errItem.nivel_severidad >= 3
                              ? darkMode
                                ? "bg-rose-500/20 text-rose-300"
                                : "bg-rose-100 text-rose-700"
                              : darkMode
                              ? "bg-amber-500/20 text-amber-300"
                              : "bg-amber-100 text-amber-700"
                          }`}
                        >
                          NIVEL {errItem.nivel_severidad}
                        </span>
                        <p
                          className={`font-bold text-lg ${
                            darkMode ? "text-rose-400" : "text-rose-900"
                          }`}
                        >
                          {errItem.modulo} - {errItem.accion}
                        </p>
                      </div>
                      <p
                        className={`text-sm mt-2 ${
                          darkMode ? "text-rose-300" : "text-rose-700"
                        }`}
                      >
                        {errItem.descripcion}
                      </p>
                      <p
                        className={`text-xs mt-3 font-mono ${
                          darkMode ? "text-rose-400" : "text-rose-600"
                        }`}
                      >
                        {errItem.mensaje_error}
                      </p>
                      <p className={`text-xs mt-2 ${textMuted}`}>
                        IP: {errItem.ip_origen}
                      </p>
                    </div>
                    <span
                      className={`text-xs font-semibold whitespace-nowrap ${
                        darkMode ? "text-rose-400" : "text-rose-600"
                      }`}
                    >
                      {new Date(errItem.fecha_hora).toLocaleString("es-CL")}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================== */}
        {/* EVENTOS DE SEGURIDAD DETALLADOS */}
        {/* ========================== */}
        {estadisticas.eventos_seguridad.length > 0 && (
          <div
            className={`${cardBg} rounded-3xl shadow-2xl border ${borderColor} p-6 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500`}
            style={{ animationDelay: "600ms" }}
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl shadow-lg">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <h3 className={`text-xl font-black ${textPrimary}`}>
                  Eventos de Seguridad
                </h3>
              </div>
              <span
                className={`text-xs font-black px-3 py-1 rounded-full ${
                  darkMode
                    ? "bg-amber-500/20 text-amber-300"
                    : "bg-amber-50 text-amber-600"
                }`}
              >
                {estadisticas.eventos_seguridad.length} EVENTOS
              </span>
            </div>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {estadisticas.eventos_seguridad.map((evento, idx) => (
                <div
                  key={idx}
                  className={`p-5 rounded-2xl border-2 transition-all duration-300 group cursor-pointer hover:scale-[1.02] ${
                    darkMode
                      ? "bg-amber-500/10 border-amber-500/30 hover:border-amber-500/50"
                      : "bg-amber-50 border-amber-200 hover:border-amber-400"
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span
                          className={`text-xs font-black px-2 py-1 rounded-full ${
                            evento.nivel_severidad >= 3
                              ? darkMode
                                ? "bg-amber-500/20 text-amber-300"
                                : "bg-amber-100 text-amber-700"
                              : darkMode
                              ? "bg-blue-500/20 text-blue-300"
                              : "bg-blue-100 text-blue-700"
                          }`}
                        >
                          NIVEL {evento.nivel_severidad}
                        </span>
                        <p
                          className={`font-bold text-lg ${
                            darkMode ? "text-amber-400" : "text-amber-900"
                          }`}
                        >
                          {evento.accion}
                        </p>
                      </div>
                      <p
                        className={`text-sm mt-2 ${
                          darkMode ? "text-amber-300" : "text-amber-700"
                        }`}
                      >
                        {evento.descripcion}
                      </p>
                      <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                        <p className={`font-semibold ${textMuted}`}>
                          Objeto: {evento.objeto_tipo} (ID: {evento.objeto_id})
                        </p>
                        <p className={`font-semibold ${textMuted}`}>
                          IP: {evento.ip_origen}
                        </p>
                      </div>
                      <p
                        className={`text-xs mt-2 font-mono ${
                          darkMode ? "text-amber-400" : "text-amber-600"
                        }`}
                      >
                        {evento.agente_usuario}
                      </p>
                    </div>
                    <span
                      className={`text-xs font-semibold whitespace-nowrap ${
                        darkMode ? "text-amber-400" : "text-amber-600"
                      }`}
                    >
                      {new Date(evento.fecha_hora).toLocaleString("es-CL")}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================== */}
        {/* AUDITORÍA RECIENTE */}
        {/* ========================== */}
        {estadisticas.auditoria_reciente.length > 0 && (
          <div
            className={`${cardBg} rounded-3xl shadow-2xl border ${borderColor} p-6 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500`}
            style={{ animationDelay: "650ms" }}
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl shadow-lg">
                  <FileBarChart className="w-6 h-6 text-white" />
                </div>
                <h3 className={`text-xl font-black ${textPrimary}`}>
                  Auditoría Reciente
                </h3>
              </div>
              <span
                className={`text-xs font-black px-3 py-1 rounded-full ${
                  darkMode
                    ? "bg-cyan-500/20 text-cyan-300"
                    : "bg-cyan-50 text-cyan-600"
                }`}
              >
                ÚLTIMOS 20
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead
                  className={`${
                    darkMode ? "bg-slate-700/50" : "bg-slate-50"
                  } border-b-2 transition-colors duration-300 ${
                    darkMode ? "border-slate-600" : "border-slate-200"
                  }`}
                >
                  <tr>
                    <th
                      className={`px-4 py-3 text-left text-xs font-black uppercase tracking-wider ${textMuted}`}
                    >
                      Fecha/Hora
                    </th>
                    <th
                      className={`px-4 py-3 text-left text-xs font-black uppercase tracking-wider ${textMuted}`}
                    >
                      Acción
                    </th>
                    <th
                      className={`px-4 py-3 text-left text-xs font-black uppercase tracking-wider ${textMuted}`}
                    >
                      Módulo
                    </th>
                    <th
                      className={`px-4 py-3 text-left text-xs font-black uppercase tracking-wider ${textMuted}`}
                    >
                      Objeto
                    </th>
                    <th
                      className={`px-4 py-3 text-left text-xs font-black uppercase tracking-wider ${textMuted}`}
                    >
                      Estado
                    </th>
                  </tr>
                </thead>
                <tbody
                  className={`divide-y transition-colors duration-300 ${
                    darkMode ? "divide-slate-700" : "divide-slate-200"
                  }`}
                >
                  {estadisticas.auditoria_reciente
                    .slice(0, 15)
                    .map((audit, idx) => (
                      <tr
                        key={idx}
                        className={`transition-colors duration-200 ${
                          darkMode
                            ? "hover:bg-slate-700/50"
                            : "hover:bg-slate-50"
                        }`}
                      >
                        <td
                          className={`px-4 py-3 font-semibold ${textSecondary}`}
                        >
                          {new Date(audit.fecha_hora).toLocaleString("es-CL", {
                            day: "2-digit",
                            month: "2-digit",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </td>
                        <td className={`px-4 py-3 font-bold ${textPrimary}`}>
                          {audit.accion}
                        </td>
                        <td className={`px-4 py-3 ${textMuted}`}>
                          {audit.modulo}
                        </td>
                        <td className={`px-4 py-3 ${textMuted}`}>
                          {audit.objeto_tipo} (ID: {audit.objeto_id})
                        </td>
                        <td className={`px-4 py-3`}>
                          {audit.exitoso ? (
                            <span
                              className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold ${
                                darkMode
                                  ? "bg-emerald-500/20 text-emerald-300"
                                  : "bg-emerald-100 text-emerald-700"
                              }`}
                            >
                              <CheckCircle className="w-3 h-3" />
                              Exitoso
                            </span>
                          ) : (
                            <span
                              className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold ${
                                darkMode
                                  ? "bg-rose-500/20 text-rose-300"
                                  : "bg-rose-100 text-rose-700"
                              }`}
                            >
                              <XCircle className="w-3 h-3" />
                              Fallido
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ========================== */}
        {/* CITAS RECIENTES */}
        {/* ========================== */}
        {estadisticas.citas_recientes.length > 0 && (
          <div
            className={`${cardBg} rounded-3xl shadow-2xl border ${borderColor} p-6 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500`}
            style={{ animationDelay: "700ms" }}
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl shadow-lg">
                  <Calendar className="w-6 h-6 text-white" />
                </div>
                <h3 className={`text-xl font-black ${textPrimary}`}>
                  Citas Recientes
                </h3>
              </div>
              <span
                className={`text-xs font-black px-3 py-1 rounded-full ${
                  darkMode
                    ? "bg-violet-500/20 text-violet-300"
                    : "bg-violet-50 text-violet-600"
                }`}
              >
                ÚLTIMAS 10
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead
                  className={`${
                    darkMode ? "bg-slate-700/50" : "bg-slate-50"
                  } border-b-2 transition-colors duration-300 ${
                    darkMode ? "border-slate-600" : "border-slate-200"
                  }`}
                >
                  <tr>
                    <th
                      className={`px-4 py-3 text-left text-xs font-black uppercase tracking-wider ${textMuted}`}
                    >
                      Paciente
                    </th>
                    <th
                      className={`px-4 py-3 text-left text-xs font-black uppercase tracking-wider ${textMuted}`}
                    >
                      Médico
                    </th>
                    <th
                      className={`px-4 py-3 text-left text-xs font-black uppercase tracking-wider ${textMuted}`}
                    >
                      Fecha/Hora
                    </th>
                    <th
                      className={`px-4 py-3 text-left text-xs font-black uppercase tracking-wider ${textMuted}`}
                    >
                      Tipo
                    </th>
                    <th
                      className={`px-4 py-3 text-left text-xs font-black uppercase tracking-wider ${textMuted}`}
                    >
                      Estado
                    </th>
                    <th
                      className={`px-4 py-3 text-left text-xs font-black uppercase tracking-wider ${textMuted}`}
                    >
                      Monto
                    </th>
                  </tr>
                </thead>
                <tbody
                  className={`divide-y transition-colors duration-300 ${
                    darkMode ? "divide-slate-700" : "divide-slate-200"
                  }`}
                >
                  {estadisticas.citas_recientes.slice(0, 10).map((cita, idx) => (
                    <tr
                      key={idx}
                      className={`transition-colors duration-200 ${
                        darkMode ? "hover:bg-slate-700/50" : "hover:bg-slate-50"
                      }`}
                    >
                      <td className={`px-4 py-3 font-semibold ${textPrimary}`}>
                        {cita.nombre_paciente}
                      </td>
                      <td className={`px-4 py-3 ${textSecondary}`}>
                        {cita.nombre_medico}
                      </td>
                      <td className={`px-4 py-3 ${textMuted}`}>
                        {new Date(cita.fecha_hora_inicio).toLocaleString(
                          "es-CL",
                          {
                            day: "2-digit",
                            month: "2-digit",
                            hour: "2-digit",
                            minute: "2-digit",
                          }
                        )}
                      </td>
                      <td className={`px-4 py-3 font-bold ${textSecondary}`}>
                        {cita.tipo_cita}
                      </td>
                      <td className={`px-4 py-3`}>
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold ${
                            cita.estado === "completada"
                              ? darkMode
                                ? "bg-emerald-500/20 text-emerald-300"
                                : "bg-emerald-100 text-emerald-700"
                              : cita.estado === "cancelada"
                              ? darkMode
                                ? "bg-rose-500/20 text-rose-300"
                                : "bg-rose-100 text-rose-700"
                              : darkMode
                              ? "bg-amber-500/20 text-amber-300"
                              : "bg-amber-100 text-amber-700"
                          }`}
                        >
                          {cita.estado}
                        </span>
                      </td>
                      <td
                        className={`px-4 py-3 font-bold ${
                          cita.pagada
                            ? darkMode
                              ? "text-emerald-400"
                              : "text-emerald-600"
                            : darkMode
                            ? "text-rose-400"
                            : "text-rose-600"
                        }`}
                      >
                        $
                        {Number(cita.monto ?? 0).toLocaleString("es-CL")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ========================== */}
        {/* DISTRIBUCIÓN DE SEVERIDAD */}
        {/* ========================== */}
        <div
          className={`${cardBg} rounded-3xl shadow-2xl border ${borderColor} p-6 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500`}
          style={{ animationDelay: "750ms" }}
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl shadow-lg">
                <AlertCircle className="w-6 h-6 text-white" />
              </div>
              <h3 className={`text-xl font-black ${textPrimary}`}>
                Distribución de Severidad
              </h3>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Gráfico */}
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={estadisticas.distribucion_severidad}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke={darkMode ? "#374151" : "#e2e8f0"}
                />
                <XAxis
                  dataKey="nivel_severidad"
                  stroke={darkMode ? "#94a3b8" : "#64748b"}
                  style={{ fontSize: "12px", fontWeight: 600 }}
                  label={{
                    value: "Nivel",
                    position: "insideBottomRight",
                    offset: -5,
                  }}
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

            {/* Detalles */}
            <div className="space-y-3">
              {estadisticas.distribucion_severidad.map((item, idx) => (
                <div
                  key={idx}
                  className={`p-4 rounded-2xl border-2 transition-all duration-300 ${
                    item.nivel_severidad >= 3
                      ? darkMode
                        ? "bg-rose-500/10 border-rose-500/30"
                        : "bg-rose-50 border-rose-200"
                      : item.nivel_severidad === 2
                      ? darkMode
                        ? "bg-amber-500/10 border-amber-500/30"
                        : "bg-amber-50 border-amber-200"
                      : darkMode
                      ? "bg-blue-500/10 border-blue-500/30"
                      : "bg-blue-50 border-blue-200"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p
                        className={`font-bold ${
                          item.nivel_severidad >= 3
                            ? darkMode
                              ? "text-rose-400"
                              : "text-rose-600"
                            : item.nivel_severidad === 2
                            ? darkMode
                              ? "text-amber-400"
                              : "text-amber-600"
                            : darkMode
                            ? "text-blue-400"
                            : "text-blue-600"
                        }`}
                      >
                        Nivel {item.nivel_severidad}
                      </p>
                      <p className={`text-sm ${textMuted}`}>
                        {item.cantidad} eventos (
                        {Number(item.porcentaje ?? 0).toFixed(1)}%)
                      </p>
                    </div>
                    <p
                      className={`text-2xl font-black ${
                        item.nivel_severidad >= 3
                          ? darkMode
                            ? "text-rose-400"
                            : "text-rose-600"
                          : item.nivel_severidad === 2
                          ? darkMode
                            ? "text-amber-400"
                            : "text-amber-600"
                          : darkMode
                          ? "text-blue-400"
                          : "text-blue-600"
                      }`}
                    >
                      {item.cantidad}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ========================== */}
        {/* ACCIONES POR MÓDULO - HEATMAP */}
        {/* ========================== */}
        <div
          className={`${cardBg} rounded-3xl shadow-2xl border ${borderColor} p-6 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500`}
          style={{ animationDelay: "800ms" }}
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-pink-500 to-rose-600 rounded-xl shadow-lg">
                <Layers className="w-6 h-6 text-white" />
              </div>
              <h3 className={`text-xl font-black ${textPrimary}`}>
                Acciones por Módulo
              </h3>
            </div>
          </div>

          <div className="overflow-x-auto">
            <div className="grid gap-4 min-w-max">
              {Array.from(
                new Set(estadisticas.acciones_por_modulo.map((a) => a.modulo))
              ).map((modulo) => (
                <div key={modulo} className="space-y-2">
                  <h4 className={`font-bold text-sm ${textPrimary} uppercase`}>
                    {modulo}
                  </h4>
                  <div className="flex gap-2 flex-wrap">
                    {estadisticas.acciones_por_modulo
                      .filter((a) => a.modulo === modulo)
                      .map((accion, idx) => {
                        const maxCantidad = Math.max(
                          ...estadisticas.acciones_por_modulo.map(
                            (a) => a.cantidad
                          )
                        );
                        const intensity =
                          maxCantidad > 0
                            ? (accion.cantidad / maxCantidad) * 100
                            : 0;

                        return (
                          <div
                            key={idx}
                            className={`px-3 py-2 rounded-lg font-bold text-sm transition-all duration-300 hover:scale-110 cursor-pointer`}
                            style={{
                              backgroundColor:
                                intensity > 70
                                  ? theme.dark
                                  : intensity > 40
                                  ? theme.light
                                  : darkMode
                                  ? "#475569"
                                  : "#cbd5e1",
                              opacity: 0.6 + intensity / 200,
                              color: intensity > 40 ? "white" : "inherit",
                            }}
                            title={`${accion.accion}: ${accion.cantidad} veces`}
                          >
                            {accion.accion} ({accion.cantidad})
                          </div>
                        );
                      })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ========================== */}
        {/* FOOTER CON INFORMACIÓN */}
        {/* ========================== */}
        <div
          className={`${cardBg} rounded-3xl shadow-2xl border ${borderColor} p-6 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500`}
          style={{ animationDelay: "850ms" }}
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Información General */}
            <div>
              <h4 className={`font-black text-lg ${textPrimary} mb-4`}>
                Información General
              </h4>
              <div className="space-y-2">
                <p className={`text-sm ${textMuted}`}>
                  <span className="font-bold">ID Usuario:</span> {params.id}
                </p>
                <p className={`text-sm ${textMuted}`}>
                  <span className="font-bold">Generado:</span>{" "}
                  {new Date().toLocaleString("es-CL")}
                </p>
                <p className={`text-sm ${textMuted}`}>
                  <span className="font-bold">Período:</span> Últimos 30 días
                </p>
              </div>
            </div>

            {/* Resumen de Datos */}
            <div>
              <h4 className={`font-black text-lg ${textPrimary} mb-4`}>
                Resumen de Datos
              </h4>
              <div className="space-y-2">
                <p className={`text-sm ${textMuted}`}>
                  <span className="font-bold">Total de Registros:</span>{" "}
                  {resumen.total_logs.toLocaleString("es-CL")}
                </p>
                <p className={`text-sm ${textMuted}`}>
                  <span className="font-bold">Período Analizado:</span> 30 días
                </p>
                <p className={`text-sm ${textMuted}`}>
                  <span className="font-bold">Última Actualización:</span>{" "}
                  {new Date(resumen.ultima_actividad).toLocaleString("es-CL")}
                </p>
              </div>
            </div>

            {/* Exportar y Acciones */}
            <div>
              <h4 className={`font-black text-lg ${textPrimary} mb-4`}>
                Acciones
              </h4>
              <div className="space-y-2">
                <button
                  onClick={refrescarDatos}
                  className={`w-full px-4 py-2 bg-gradient-to-r ${theme.primary} text-white rounded-lg font-bold text-sm hover:shadow-lg transition-all duration-300`}
                >
                  🔄 Refrescar Datos
                </button>
                <button
                  onClick={() => window.print()}
                  className={`w-full px-4 py-2 bg-gradient-to-r ${theme.primary} text-white rounded-lg font-bold text-sm hover:shadow-lg transition-all duration-300`}
                >
                  🖨️ Imprimir
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Espaciador final */}
        <div className="h-10"></div>
      </div>
    </div>
  );
}
