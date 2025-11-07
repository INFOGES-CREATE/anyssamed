// frontend/src/app/admin/usuarios/[id]/estadisticas/page.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
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
} from "lucide-react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface Estadisticas {
  resumen: {
    total_citas: number;
    citas_completadas: number;
    citas_canceladas: number;
    citas_pendientes: number;
    citas_futuras: number;
    total_logs: number;
    logs_error: number;
    logs_seguridad: number;
    logs_auditoria: number;
    ultima_actividad: string;
    actividad_hoy: number;
    actividad_semana: number;
    actividad_mes: number;
  };
  actividad_mensual: Array<{
    mes: string;
    total_actividades: number;
    dias_activos: number;
    errores: number;
    eventos_seguridad: number;
  }>;
  citas_por_estado: Array<{
    estado: string;
    cantidad: number;
    porcentaje: number;
  }>;
  modulos_mas_usados: Array<{
    modulo: string;
    accesos: number;
    dias_uso: number;
    ultimo_acceso: string;
  }>;
  acciones_frecuentes: Array<{
    accion: string;
    modulo: string;
    frecuencia: number;
    ultima_vez: string;
  }>;
  horario_actividad: Array<{
    hora: number;
    actividades: number;
    dias: number;
  }>;
  dias_semana: Array<{
    dia_semana: string;
    dia_numero: number;
    actividades: number;
    ocurrencias: number;
  }>;
  errores_recientes: Array<{
    fecha_hora: string;
    modulo: string;
    accion: string;
    descripcion: string;
    nivel_severidad: number;
  }>;
  eventos_seguridad: Array<{
    fecha_hora: string;
    accion: string;
    descripcion: string;
    ip_origen: string;
    nivel_severidad: number;
  }>;
}

const COLORS_LIGHT = [
  "#6366f1",
  "#8b5cf6",
  "#ec4899",
  "#f59e0b",
  "#10b981",
  "#3b82f6",
];

const COLORS_DARK = [
  "#818cf8",
  "#a78bfa",
  "#f472b6",
  "#fbbf24",
  "#34d399",
  "#60a5fa",
];

export default function EstadisticasUsuarioPage({
  params,
}: {
  params: { id: string };
}) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [estadisticas, setEstadisticas] = useState<Estadisticas | null>(null);
  const [darkMode, setDarkMode] = useState(false);

  // Detectar preferencia de tema del sistema al cargar
  useEffect(() => {
    const darkModePreference = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const savedTheme = localStorage.getItem("theme");
    
    if (savedTheme) {
      setDarkMode(savedTheme === "dark");
    } else {
      setDarkMode(darkModePreference);
    }
  }, []);

  // Actualizar tema
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [darkMode]);

  useEffect(() => {
    cargarEstadisticas();
  }, [params.id]);

  const cargarEstadisticas = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/admin/usuarios/${params.id}/estadisticas`
      );
      const data = await response.json();

      if (data.success) {
        setEstadisticas(data.data);
      } else {
        setError(data.error || "Error al cargar estadísticas");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const exportarEstadisticas = () => {
    if (!estadisticas) return;

    const dataStr = JSON.stringify(estadisticas, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `estadisticas-usuario-${params.id}.json`;
    link.click();
  };

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center transition-colors duration-300 ${
        darkMode
          ? "bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900"
          : "bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50"
      }`}>
        <div className="text-center">
          <div className="relative mb-6">
            <Loader2 className="w-16 h-16 text-blue-600 animate-spin mx-auto" />
            <div className="absolute inset-0 flex items-center justify-center">
              <BarChart3 className="w-8 h-8 text-blue-500" />
            </div>
          </div>
          <p className={`font-bold text-lg mb-2 transition-colors duration-300 ${
            darkMode ? "text-white" : "text-slate-800"
          }`}>
            Cargando estadísticas...
          </p>
          <p className={`text-sm transition-colors duration-300 ${
            darkMode ? "text-slate-400" : "text-slate-600"
          }`}>
            Analizando datos del usuario
          </p>
        </div>
      </div>
    );
  }

  if (error || !estadisticas) {
    return (
      <div className={`min-h-screen transition-colors duration-300 ${
        darkMode
          ? "bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900"
          : "bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50"
      } p-6`}>
        <div className="max-w-7xl mx-auto">
          <div className={`${
            darkMode
              ? "bg-rose-500/10 border-rose-500/30"
              : "bg-rose-50 border-rose-200"
          } border-2 rounded-2xl p-6`}>
            <div className="flex items-center gap-3">
              <AlertTriangle className={`w-6 h-6 ${
                darkMode ? "text-rose-400" : "text-rose-600"
              }`} />
              <p className={`font-bold ${
                darkMode ? "text-rose-400" : "text-rose-800"
              }`}>
                {error || "Error desconocido"}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const { resumen } = estadisticas;
  const COLORS = darkMode ? COLORS_DARK : COLORS_LIGHT;

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      darkMode
        ? "bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900"
        : "bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50"
    } p-4 md:p-6 lg:p-8`}>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className={`${
          darkMode
            ? "bg-slate-800/95 backdrop-blur-xl border-slate-700/50"
            : "bg-white/95 backdrop-blur-xl border-slate-200"
        } rounded-2xl shadow-2xl border p-6 transition-all duration-300`}>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-4">
              <Link
                href={`/admin/usuarios/${params.id}`}
                className={`p-3 rounded-xl transition-all duration-300 ${
                  darkMode
                    ? "hover:bg-slate-700 text-slate-300"
                    : "hover:bg-slate-100 text-slate-600"
                }`}
              >
                <ArrowLeft className="w-6 h-6" />
              </Link>
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg">
                  <BarChart3 className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className={`text-3xl font-bold transition-colors duration-300 ${
                    darkMode ? "text-white" : "text-slate-900"
                  }`}>
                    Estadísticas del Usuario
                  </h1>
                  <p className={`mt-1 transition-colors duration-300 ${
                    darkMode ? "text-slate-400" : "text-slate-600"
                  }`}>
                    Análisis detallado de actividad y comportamiento
                  </p>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setDarkMode(!darkMode)}
                className={`p-3 rounded-xl transition-all duration-300 ${
                  darkMode
                    ? "bg-amber-500/20 text-amber-400 hover:bg-amber-500/30 border border-amber-500/30"
                    : "bg-indigo-100 text-indigo-600 hover:bg-indigo-200 border border-indigo-200"
                }`}
                title={darkMode ? "Cambiar a tema claro" : "Cambiar a tema oscuro"}
              >
                {darkMode ? <Sun className="w-6 h-6" /> : <Moon className="w-6 h-6" />}
              </button>

              <button
                onClick={exportarEstadisticas}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl font-semibold"
              >
                <Download className="w-5 h-5" />
                <span className="hidden sm:inline">Exportar</span>
              </button>
            </div>
          </div>
        </div>

        {/* Resumen General */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Citas */}
          <div className={`${
            darkMode
              ? "bg-slate-800/95 backdrop-blur-xl border-slate-700/50"
              : "bg-white/95 backdrop-blur-xl border-slate-200"
          } rounded-2xl shadow-xl border p-6 transition-all duration-300 transform hover:scale-105`}>
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <div className={`text-xs font-bold px-3 py-1 rounded-full ${
                darkMode
                  ? "bg-blue-500/20 text-blue-300"
                  : "bg-blue-50 text-blue-600"
              }`}>
                {resumen.citas_completadas > 0 
                  ? `${Math.round((resumen.citas_completadas / resumen.total_citas) * 100)}%`
                  : "0%"}
              </div>
            </div>
            <p className={`text-sm font-bold mb-1 transition-colors duration-300 ${
              darkMode ? "text-slate-400" : "text-slate-600"
            }`}>
              Total Citas
            </p>
            <p className={`text-4xl font-bold transition-colors duration-300 ${
              darkMode ? "text-white" : "text-slate-900"
            }`}>
              {resumen.total_citas}
            </p>
            <div className="mt-4 flex items-center gap-2 text-sm">
              <CheckCircle className={`w-4 h-4 ${
                darkMode ? "text-emerald-400" : "text-emerald-600"
              }`} />
              <span className={darkMode ? "text-emerald-400" : "text-emerald-600"}>
                {resumen.citas_completadas} completadas
              </span>
            </div>
          </div>

          {/* Actividad Hoy */}
          <div className={`${
            darkMode
              ? "bg-slate-800/95 backdrop-blur-xl border-slate-700/50"
              : "bg-white/95 backdrop-blur-xl border-slate-200"
          } rounded-2xl shadow-xl border p-6 transition-all duration-300 transform hover:scale-105`}>
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl shadow-lg">
                <Activity className="w-6 h-6 text-white" />
              </div>
              <TrendingUp className={`w-5 h-5 ${
                darkMode ? "text-emerald-400" : "text-emerald-600"
              }`} />
            </div>
            <p className={`text-sm font-bold mb-1 transition-colors duration-300 ${
              darkMode ? "text-slate-400" : "text-slate-600"
            }`}>
              Actividad Hoy
            </p>
            <p className={`text-4xl font-bold transition-colors duration-300 ${
              darkMode ? "text-white" : "text-slate-900"
            }`}>
              {resumen.actividad_hoy}
            </p>
            <div className={`mt-4 text-sm ${
              darkMode ? "text-slate-400" : "text-slate-600"
            }`}>
              {resumen.actividad_semana} esta semana
            </div>
          </div>

          {/* Total Logs */}
          <div className={`${
            darkMode
              ? "bg-slate-800/95 backdrop-blur-xl border-slate-700/50"
              : "bg-white/95 backdrop-blur-xl border-slate-200"
          } rounded-2xl shadow-xl border p-6 transition-all duration-300 transform hover:scale-105`}>
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg">
                <FileBarChart className="w-6 h-6 text-white" />
              </div>
              <div className={`text-xs font-bold px-3 py-1 rounded-full ${
                darkMode
                  ? "bg-purple-500/20 text-purple-300"
                  : "bg-purple-50 text-purple-600"
              }`}>
                LOGS
              </div>
            </div>
            <p className={`text-sm font-bold mb-1 transition-colors duration-300 ${
              darkMode ? "text-slate-400" : "text-slate-600"
            }`}>
              Total Logs
            </p>
            <p className={`text-4xl font-bold transition-colors duration-300 ${
              darkMode ? "text-white" : "text-slate-900"
            }`}>
              {resumen.total_logs}
            </p>
            <div className="mt-4 flex items-center gap-2 text-sm">
              <AlertTriangle className={`w-4 h-4 ${
                darkMode ? "text-rose-400" : "text-rose-600"
              }`} />
              <span className={darkMode ? "text-rose-400" : "text-rose-600"}>
                {resumen.logs_error} errores
              </span>
            </div>
          </div>

          {/* Última Actividad */}
          <div className={`${
            darkMode
              ? "bg-slate-800/95 backdrop-blur-xl border-slate-700/50"
              : "bg-white/95 backdrop-blur-xl border-slate-200"
          } rounded-2xl shadow-xl border p-6 transition-all duration-300 transform hover:scale-105`}>
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl shadow-lg">
                <Clock className="w-6 h-6 text-white" />
              </div>
              <Activity className={`w-5 h-5 ${
                darkMode ? "text-amber-400" : "text-amber-600"
              }`} />
            </div>
            <p className={`text-sm font-bold mb-1 transition-colors duration-300 ${
              darkMode ? "text-slate-400" : "text-slate-600"
            }`}>
              Última Actividad
            </p>
            <p className={`text-lg font-bold transition-colors duration-300 ${
              darkMode ? "text-white" : "text-slate-900"
            }`}>
              {resumen.ultima_actividad
                ? new Date(resumen.ultima_actividad).toLocaleString("es-CL", {
                    day: "2-digit",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit"
                  })
                : "Sin actividad"}
            </p>
          </div>
        </div>

        {/* Gráficos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Actividad Mensual */}
          <div className={`${
            darkMode
              ? "bg-slate-800/95 backdrop-blur-xl border-slate-700/50"
              : "bg-white/95 backdrop-blur-xl border-slate-200"
          } rounded-2xl shadow-2xl border p-6 transition-all duration-300`}>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <h3 className={`text-xl font-bold transition-colors duration-300 ${
                darkMode ? "text-white" : "text-slate-900"
              }`}>
                Actividad Mensual
              </h3>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={estadisticas.actividad_mensual}>
                <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? "#374151" : "#e2e8f0"} />
                <XAxis 
                  dataKey="mes" 
                  stroke={darkMode ? "#94a3b8" : "#64748b"}
                  style={{ fontSize: '12px', fontWeight: 600 }}
                />
                <YAxis 
                  stroke={darkMode ? "#94a3b8" : "#64748b"}
                  style={{ fontSize: '12px', fontWeight: 600 }}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: darkMode ? "#1e293b" : "#ffffff",
                    border: `1px solid ${darkMode ? "#475569" : "#e2e8f0"}`,
                    borderRadius: "12px",
                    padding: "12px",
                    fontWeight: 600
                  }}
                  labelStyle={{ color: darkMode ? "#e2e8f0" : "#0f172a", fontWeight: 700 }}
                />
                <Legend 
                  wrapperStyle={{ paddingTop: "20px", fontWeight: 600 }}
                />
                <Line
                  type="monotone"
                  dataKey="total_actividades"
                  stroke="#6366f1"
                  strokeWidth={3}
                  name="Actividades"
                  dot={{ fill: "#6366f1", r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="errores"
                  stroke="#ef4444"
                  strokeWidth={3}
                  name="Errores"
                  dot={{ fill: "#ef4444", r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Citas por Estado */}
          <div className={`${
            darkMode
              ? "bg-slate-800/95 backdrop-blur-xl border-slate-700/50"
              : "bg-white/95 backdrop-blur-xl border-slate-200"
          } rounded-2xl shadow-2xl border p-6 transition-all duration-300`}>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl">
                <PieChart className="w-5 h-5 text-white" />
              </div>
              <h3 className={`text-xl font-bold transition-colors duration-300 ${
                darkMode ? "text-white" : "text-slate-900"
              }`}>
                Citas por Estado
              </h3>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <RechartsPieChart>
                <Pie
                  data={estadisticas.citas_por_estado}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => `${entry.estado}: ${entry.cantidad}`}
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
                    fontWeight: 600
                  }}
                />
              </RechartsPieChart>
            </ResponsiveContainer>
          </div>

          {/* Horario de Actividad */}
          <div className={`${
            darkMode
              ? "bg-slate-800/95 backdrop-blur-xl border-slate-700/50"
              : "bg-white/95 backdrop-blur-xl border-slate-200"
          } rounded-2xl shadow-2xl border p-6 transition-all duration-300`}>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl">
                <Clock className="w-5 h-5 text-white" />
              </div>
              <h3 className={`text-xl font-bold transition-colors duration-300 ${
                darkMode ? "text-white" : "text-slate-900"
              }`}>
                Horario de Actividad
              </h3>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={estadisticas.horario_actividad}>
                <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? "#374151" : "#e2e8f0"} />
                <XAxis 
                  dataKey="hora" 
                  stroke={darkMode ? "#94a3b8" : "#64748b"}
                  style={{ fontSize: '12px', fontWeight: 600 }}
                />
                <YAxis 
                  stroke={darkMode ? "#94a3b8" : "#64748b"}
                  style={{ fontSize: '12px', fontWeight: 600 }}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: darkMode ? "#1e293b" : "#ffffff",
                    border: `1px solid ${darkMode ? "#475569" : "#e2e8f0"}`,
                    borderRadius: "12px",
                    padding: "12px",
                    fontWeight: 600
                  }}
                />
                <Bar 
                  dataKey="actividades" 
                  fill="#6366f1" 
                  radius={[8, 8, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Días de la Semana */}
          <div className={`${
            darkMode
              ? "bg-slate-800/95 backdrop-blur-xl border-slate-700/50"
              : "bg-white/95 backdrop-blur-xl border-slate-200"
          } rounded-2xl shadow-2xl border p-6 transition-all duration-300`}>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-gradient-to-br from-orange-500 to-rose-600 rounded-xl">
                <Calendar className="w-5 h-5 text-white" />
              </div>
              <h3 className={`text-xl font-bold transition-colors duration-300 ${
                darkMode ? "text-white" : "text-slate-900"
              }`}>
                Actividad por Día
              </h3>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={estadisticas.dias_semana}>
                <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? "#374151" : "#e2e8f0"} />
                <XAxis 
                  dataKey="dia_semana" 
                  stroke={darkMode ? "#94a3b8" : "#64748b"}
                  style={{ fontSize: '12px', fontWeight: 600 }}
                />
                <YAxis 
                  stroke={darkMode ? "#94a3b8" : "#64748b"}
                  style={{ fontSize: '12px', fontWeight: 600 }}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: darkMode ? "#1e293b" : "#ffffff",
                    border: `1px solid ${darkMode ? "#475569" : "#e2e8f0"}`,
                    borderRadius: "12px",
                    padding: "12px",
                    fontWeight: 600
                  }}
                />
                <Bar 
                  dataKey="actividades" 
                  fill="#8b5cf6" 
                  radius={[8, 8, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Módulos Más Usados */}
        <div className={`${
          darkMode
            ? "bg-slate-800/95 backdrop-blur-xl border-slate-700/50"
            : "bg-white/95 backdrop-blur-xl border-slate-200"
        } rounded-2xl shadow-2xl border p-6 transition-all duration-300`}>
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-xl">
              <Target className="w-5 h-5 text-white" />
            </div>
            <h3 className={`text-xl font-bold transition-colors duration-300 ${
              darkMode ? "text-white" : "text-slate-900"
            }`}>
              Módulos Más Utilizados
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className={`${
                darkMode ? "bg-slate-700/50" : "bg-slate-50"
              } border-b-2 transition-colors duration-300 ${
                darkMode ? "border-slate-600" : "border-slate-200"
              }`}>
                <tr>
                  <th className={`px-6 py-4 text-left text-xs font-bold uppercase tracking-wider ${
                    darkMode ? "text-slate-300" : "text-slate-700"
                  }`}>
                    Módulo
                  </th>
                  <th className={`px-6 py-4 text-left text-xs font-bold uppercase tracking-wider ${
                    darkMode ? "text-slate-300" : "text-slate-700"
                  }`}>
                    Accesos
                  </th>
                  <th className={`px-6 py-4 text-left text-xs font-bold uppercase tracking-wider ${
                    darkMode ? "text-slate-300" : "text-slate-700"
                  }`}>
                    Días de Uso
                  </th>
                  <th className={`px-6 py-4 text-left text-xs font-bold uppercase tracking-wider ${
                    darkMode ? "text-slate-300" : "text-slate-700"
                  }`}>
                    Último Acceso
                  </th>
                </tr>
              </thead>
              <tbody className={`divide-y transition-colors duration-300 ${
                darkMode ? "divide-slate-700" : "divide-slate-200"
              }`}>
                {estadisticas.modulos_mas_usados.map((modulo, idx) => (
                  <tr 
                    key={idx} 
                    className={`transition-colors duration-200 ${
                      darkMode ? "hover:bg-slate-700/50" : "hover:bg-slate-50"
                    }`}
                  >
                    <td className={`px-6 py-4 font-bold ${
                      darkMode ? "text-white" : "text-slate-900"
                    }`}>
                      {modulo.modulo}
                    </td>
                    <td className={`px-6 py-4 font-semibold ${
                      darkMode ? "text-blue-400" : "text-blue-600"
                    }`}>
                      {modulo.accesos}
                    </td>
                    <td className={`px-6 py-4 ${
                      darkMode ? "text-slate-300" : "text-slate-700"
                    }`}>
                      {modulo.dias_uso}
                    </td>
                    <td className={`px-6 py-4 ${
                      darkMode ? "text-slate-400" : "text-slate-600"
                    }`}>
                      {new Date(modulo.ultimo_acceso).toLocaleDateString("es-CL")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Acciones Frecuentes */}
        <div className={`${
          darkMode
            ? "bg-slate-800/95 backdrop-blur-xl border-slate-700/50"
            : "bg-white/95 backdrop-blur-xl border-slate-200"
        } rounded-2xl shadow-2xl border p-6 transition-all duration-300`}>
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <h3 className={`text-xl font-bold transition-colors duration-300 ${
              darkMode ? "text-white" : "text-slate-900"
            }`}>
              Acciones Más Frecuentes
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {estadisticas.acciones_frecuentes.map((accion, idx) => (
              <div
                key={idx}
                className={`flex items-center justify-between p-5 rounded-2xl border-2 transition-all duration-300 ${
                  darkMode
                    ? "bg-slate-700/30 border-slate-600 hover:border-blue-500"
                    : "bg-slate-50 border-slate-200 hover:border-blue-400"
                }`}
              >
                <div className="flex-1">
                  <p className={`font-bold text-lg ${
                    darkMode ? "text-white" : "text-slate-900"
                  }`}>
                    {accion.accion}
                  </p>
                  <p className={`text-sm mt-1 ${
                    darkMode ? "text-slate-400" : "text-slate-600"
                  }`}>
                    {accion.modulo}
                  </p>
                </div>
                <div className="text-right ml-4">
                  <p className={`text-3xl font-bold ${
                    darkMode ? "text-blue-400" : "text-indigo-600"
                  }`}>
                    {accion.frecuencia}
                  </p>
                  <p className={`text-xs font-semibold ${
                    darkMode ? "text-slate-500" : "text-slate-500"
                  }`}>
                    veces
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Errores Recientes */}
        {estadisticas.errores_recientes.length > 0 && (
          <div className={`${
            darkMode
              ? "bg-slate-800/95 backdrop-blur-xl border-slate-700/50"
              : "bg-white/95 backdrop-blur-xl border-slate-200"
          } rounded-2xl shadow-2xl border p-6 transition-all duration-300`}>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-gradient-to-br from-rose-500 to-red-600 rounded-xl">
                <AlertTriangle className="w-5 h-5 text-white" />
              </div>
              <h3 className={`text-xl font-bold transition-colors duration-300 ${
                darkMode ? "text-white" : "text-slate-900"
              }`}>
                Errores Recientes
              </h3>
            </div>
            <div className="space-y-3">
              {estadisticas.errores_recientes.map((error, idx) => (
                <div
                  key={idx}
                  className={`p-5 rounded-2xl border-2 transition-all duration-300 ${
                    darkMode
                      ? "bg-rose-500/10 border-rose-500/30"
                      : "bg-rose-50 border-rose-200"
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <p className={`font-bold text-lg ${
                        darkMode ? "text-rose-400" : "text-rose-900"
                      }`}>
                        {error.modulo} - {error.accion}
                      </p>
                      <p className={`text-sm mt-2 ${
                        darkMode ? "text-rose-300" : "text-rose-700"
                      }`}>
                        {error.descripcion}
                      </p>
                    </div>
                    <span className={`text-xs font-semibold whitespace-nowrap ${
                      darkMode ? "text-rose-400" : "text-rose-600"
                    }`}>
                      {new Date(error.fecha_hora).toLocaleString("es-CL")}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Eventos de Seguridad */}
        {estadisticas.eventos_seguridad.length > 0 && (
          <div className={`${
            darkMode
              ? "bg-slate-800/95 backdrop-blur-xl border-slate-700/50"
              : "bg-white/95 backdrop-blur-xl border-slate-200"
          } rounded-2xl shadow-2xl border p-6 transition-all duration-300`}>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl">
                <AlertTriangle className="w-5 h-5 text-white" />
              </div>
              <h3 className={`text-xl font-bold transition-colors duration-300 ${
                darkMode ? "text-white" : "text-slate-900"
              }`}>
                Eventos de Seguridad
              </h3>
            </div>
            <div className="space-y-3">
              {estadisticas.eventos_seguridad.map((evento, idx) => (
                <div
                  key={idx}
                  className={`p-5 rounded-2xl border-2 transition-all duration-300 ${
                    darkMode
                      ? "bg-amber-500/10 border-amber-500/30"
                      : "bg-amber-50 border-amber-200"
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <p className={`font-bold text-lg ${
                        darkMode ? "text-amber-400" : "text-amber-900"
                      }`}>
                        {evento.accion}
                      </p>
                      <p className={`text-sm mt-2 ${
                        darkMode ? "text-amber-300" : "text-amber-700"
                      }`}>
                        {evento.descripcion}
                      </p>
                      <p className={`text-xs mt-3 font-semibold ${
                        darkMode ? "text-amber-400" : "text-amber-600"
                      }`}>
                        IP: {evento.ip_origen}
                      </p>
                    </div>
                    <span className={`text-xs font-semibold whitespace-nowrap ${
                      darkMode ? "text-amber-400" : "text-amber-600"
                    }`}>
                      {new Date(evento.fecha_hora).toLocaleString("es-CL")}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}