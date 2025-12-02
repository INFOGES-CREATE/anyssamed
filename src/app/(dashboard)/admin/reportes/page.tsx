"use client";

import { useState } from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  ArrowLeft,
  BarChart3,
  Calendar,
  Download,
  FileText,
  Filter,
  PieChart as PieIcon,
  Search,
  Sparkles,
  Sun,
  Moon,
} from "lucide-react";
import Link from "next/link";

type TimeRange = "7d" | "30d" | "90d" | "12m";

const COLORS = ["#4f46e5", "#22c55e", "#f97316", "#ec4899", "#06b6d4"];

// Datos de ejemplo (puedes luego reemplazarlos con datos reales desde tu API)
const lineDataBase = [
  { name: "Lun", consultas: 32, ingresos: 450000 },
  { name: "Mar", consultas: 45, ingresos: 620000 },
  { name: "Mié", consultas: 38, ingresos: 530000 },
  { name: "Jue", consultas: 52, ingresos: 710000 },
  { name: "Vie", consultas: 60, ingresos: 890000 },
  { name: "Sáb", consultas: 27, ingresos: 310000 },
  { name: "Dom", consultas: 18, ingresos: 180000 },
];

const barDataBase = [
  { name: "Centro Norte", consultas: 220, ingresos: 3200000 },
  { name: "Centro Sur", consultas: 180, ingresos: 2700000 },
  { name: "Centro Oriente", consultas: 140, ingresos: 2300000 },
  { name: "Centro Occidente", consultas: 95, ingresos: 1500000 },
];

const pieDataBase = [
  { name: "Fonasa", value: 45 },
  { name: "Isapre", value: 30 },
  { name: "Particular", value: 25 },
];

export default function AdminReportesPage() {
  const [darkMode, setDarkMode] = useState(false);
  const [timeRange, setTimeRange] = useState<TimeRange>("30d");
  const [reportType, setReportType] = useState<
    "productividad" | "ingresos" | "pacientes"
  >("productividad");

  // Puedes hacer que los datos cambien un poco según el rango seleccionado
  const lineData = lineDataBase.map((item) => ({
    ...item,
    consultas:
      timeRange === "7d"
        ? item.consultas
        : timeRange === "30d"
        ? Math.round(item.consultas * 3.5)
        : timeRange === "90d"
        ? Math.round(item.consultas * 10)
        : Math.round(item.consultas * 40),
    ingresos:
      timeRange === "7d"
        ? item.ingresos
        : timeRange === "30d"
        ? item.ingresos * 4
        : timeRange === "90d"
        ? item.ingresos * 12
        : item.ingresos * 48,
  }));

  const barData = barDataBase;
  const pieData = pieDataBase;

  const bgClass = darkMode
    ? "bg-gradient-to-br from-slate-950 via-indigo-950 to-purple-950"
    : "bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50";

  const cardBg = darkMode
    ? "bg-gray-900/70 border-gray-800"
    : "bg-white border-gray-200";

  const textPrimary = darkMode ? "text-white" : "text-gray-900";
  const textSecondary = darkMode ? "text-gray-300" : "text-gray-600";

  const formatCurrency = (amount: number): string =>
    new Intl.NumberFormat("es-CL", {
      style: "currency",
      currency: "CLP",
      maximumFractionDigits: 0,
    }).format(amount);

  const formatNumber = (n: number): string =>
    new Intl.NumberFormat("es-CL").format(n);

  return (
    <div className={`min-h-screen ${bgClass} transition-colors duration-300`}>
      {/* HEADER */}
      <div
        className={`sticky top-0 z-40 border-b backdrop-blur-xl shadow-2xl ${
          darkMode
            ? "bg-gray-950/80 border-gray-800"
            : "bg-white/80 border-gray-200"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 md:h-20 flex items-center justify-between">
          {/* Izquierda: volver + título */}
          <div className="flex items-center gap-4">
            <Link
              href="/admin"
              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold transition-all duration-300 group ${
                darkMode ? "hover:bg-gray-800" : "hover:bg-gray-100"
              }`}
            >
              <ArrowLeft
                className={`w-4 h-4 ${
                  darkMode ? "text-indigo-300" : "text-indigo-600"
                } group-hover:-translate-x-0.5 transition-transform`}
              />
              <span
                className={`hidden sm:inline ${
                  darkMode ? "text-indigo-200" : "text-indigo-700"
                }`}
              >
                Volver al Dashboard
              </span>
            </Link>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg">
                <BarChart3 className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className={`text-lg md:text-xl font-black ${textPrimary}`}>
                  Reportes y Analytics
                </h1>
                <p className={`text-xs font-medium ${textSecondary}`}>
                  Reportes avanzados de gestión y rendimiento
                </p>
              </div>
            </div>
          </div>

          {/* Derecha: filtros globales */}
          <div className="flex items-center gap-3">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value as TimeRange)}
              className={`hidden sm:block px-3 py-2 text-xs md:text-sm rounded-xl border font-semibold cursor-pointer ${
                darkMode
                  ? "bg-gray-900 border-gray-700 text-white"
                  : "bg-white border-gray-200 text-gray-900"
              }`}
            >
              <option value="7d">Últimos 7 días</option>
              <option value="30d">Últimos 30 días</option>
              <option value="90d">Últimos 90 días</option>
              <option value="12m">Últimos 12 meses</option>
            </select>

            <button
              onClick={() => setDarkMode((v) => !v)}
              className={`p-2 rounded-xl transition-all duration-300 shadow-md ${
                darkMode
                  ? "bg-gray-800 text-yellow-400 hover:bg-gray-700"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
              title={darkMode ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
            >
              {darkMode ? (
                <Sun className="w-4 h-4" />
              ) : (
                <Moon className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* CONTENIDO */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8 space-y-6 md:space-y-8">
        {/* Encabezado bonito + filtros */}
        <div
          className={`rounded-2xl md:rounded-3xl p-6 md:p-8 border shadow-xl ${
            darkMode
              ? "bg-gradient-to-r from-indigo-900/50 via-purple-900/50 to-slate-900/70 border-indigo-500/30"
              : "bg-gradient-to-r from-indigo-50 via-purple-50 to-slate-50 border-indigo-200"
          }`}
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-5 h-5 text-yellow-400 animate-pulse" />
                <span
                  className={`text-xs font-bold uppercase tracking-wide ${
                    darkMode ? "text-indigo-200" : "text-indigo-700"
                  }`}
                >
                  Centro de Inteligencia
                </span>
              </div>
              <h2
                className={`text-2xl md:text-3xl font-black mb-2 ${textPrimary}`}
              >
                Reportes gerenciales en tiempo real
              </h2>
              <p className={`text-sm md:text-base font-medium ${textSecondary}`}>
                Filtra, analiza y exporta información clave de centros médicos,
                médicos, pacientes e ingresos.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
              <div
                className={`flex items-center gap-2 px-3 py-2 rounded-xl border ${
                  darkMode
                    ? "bg-gray-900/70 border-gray-700"
                    : "bg-white/80 border-gray-200"
                }`}
              >
                <Search className="w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar en reportes..."
                  className={`bg-transparent text-xs md:text-sm outline-none flex-1 ${
                    darkMode ? "text-white" : "text-gray-900"
                  }`}
                />
              </div>

              <button
                className={`flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs md:text-sm font-semibold border shadow-md ${
                  darkMode
                    ? "bg-gray-900/70 border-gray-700 text-gray-100 hover:bg-gray-800"
                    : "bg-white border-gray-200 text-gray-800 hover:bg-gray-100"
                }`}
              >
                <Filter className="w-4 h-4" />
                Filtros Avanzados
              </button>

              <button className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs md:text-sm font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg hover:shadow-2xl hover:scale-[1.02] transition-all">
                <Download className="w-4 h-4" />
                Exportar
              </button>
            </div>
          </div>
        </div>

        {/* Selector de tipo de reporte */}
        <div
          className={`rounded-2xl p-2 border shadow-md ${
            darkMode ? "bg-gray-900/60 border-gray-800" : "bg-white border-gray-200"
          }`}
        >
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => setReportType("productividad")}
              className={`flex flex-col items-center justify-center gap-1 py-3 rounded-xl text-xs md:text-sm font-semibold transition-all ${
                reportType === "productividad"
                  ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg"
                  : darkMode
                  ? "text-gray-300 hover:bg-gray-800"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <ActivityIcon />
              Productividad
            </button>
            <button
              onClick={() => setReportType("ingresos")}
              className={`flex flex-col items-center justify-center gap-1 py-3 rounded-xl text-xs md:text-sm font-semibold transition-all ${
                reportType === "ingresos"
                  ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg"
                  : darkMode
                  ? "text-gray-300 hover:bg-gray-800"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              Ingresos
            </button>
            <button
              onClick={() => setReportType("pacientes")}
              className={`flex flex-col items-center justify-center gap-1 py-3 rounded-xl text-xs md:text-sm font-semibold transition-all ${
                reportType === "pacientes"
                  ? "bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg"
                  : darkMode
                  ? "text-gray-300 hover:bg-gray-800"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <FileText className="w-4 h-4" />
              Pacientes
            </button>
          </div>
        </div>

        {/* Resumen numérico superior */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6">
          <div
            className={`rounded-2xl p-4 md:p-5 border shadow-md flex flex-col justify-between ${cardBg}`}
          >
            <div className="flex items-center justify-between mb-2">
              <span
                className={`text-xs font-bold uppercase tracking-wide ${
                  darkMode ? "text-indigo-300" : "text-indigo-600"
                }`}
              >
                Consultas en el período
              </span>
              <BarChart3
                className={`w-5 h-5 ${
                  darkMode ? "text-indigo-300" : "text-indigo-600"
                }`}
              />
            </div>
            <div className={`text-2xl md:text-3xl font-black ${textPrimary}`}>
              {formatNumber(
                lineData.reduce((acc, d) => acc + d.consultas, 0)
              )}
            </div>
            <p className={`text-xs mt-1 ${textSecondary}`}>
              Incluye todas las modalidades (presencial y telemedicina).
            </p>
          </div>

          <div
            className={`rounded-2xl p-4 md:p-5 border shadow-md flex flex-col justify-between ${cardBg}`}
          >
            <div className="flex items-center justify-between mb-2">
              <span
                className={`text-xs font-bold uppercase tracking-wide ${
                  darkMode ? "text-emerald-300" : "text-emerald-600"
                }`}
              >
                Ingresos estimados
              </span>
              <PieIcon
                className={`w-5 h-5 ${
                  darkMode ? "text-emerald-300" : "text-emerald-600"
                }`}
              />
            </div>
            <div className={`text-2xl md:text-3xl font-black ${textPrimary}`}>
              {formatCurrency(
                lineData.reduce((acc, d) => acc + d.ingresos, 0)
              )}
            </div>
            <p className={`text-xs mt-1 ${textSecondary}`}>
              Sumatoria de todos los centros en el rango seleccionado.
            </p>
          </div>

          <div
            className={`rounded-2xl p-4 md:p-5 border shadow-md flex flex-col justify-between ${cardBg}`}
          >
            <div className="flex items-center justify-between mb-2">
              <span
                className={`text-xs font-bold uppercase tracking-wide ${
                  darkMode ? "text-pink-300" : "text-pink-600"
                }`}
              >
                Mezcla de pagadores
              </span>
              <FileText
                className={`w-5 h-5 ${
                  darkMode ? "text-pink-300" : "text-pink-600"
                }`}
              />
            </div>
            <div className={`text-2xl md:text-3xl font-black ${textPrimary}`}>
              {pieData[0].value}% Fonasa
            </div>
            <p className={`text-xs mt-1 ${textSecondary}`}>
              Distribución entre Fonasa, Isapres y pacientes particulares.
            </p>
          </div>
        </div>

        {/* Gráficos principales */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
          {/* Línea */}
          <div
            className={`rounded-2xl p-4 md:p-6 border shadow-md lg:col-span-2 ${cardBg}`}
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className={`text-base md:text-lg font-bold ${textPrimary}`}>
                  Evolución de consultas e ingresos
                </h3>
                <p className={`text-xs ${textSecondary}`}>
                  Curva comparativa de volumen de atención e ingresos.
                </p>
              </div>
              <Calendar
                className={`w-4 h-4 ${
                  darkMode ? "text-gray-400" : "text-gray-500"
                }`}
              />
            </div>
            <div className="h-64 md:h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={lineData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke={darkMode ? "#1f2937" : "#e5e7eb"}
                  />
                  <XAxis dataKey="name" stroke={darkMode ? "#9ca3af" : "#6b7280"} />
                  <YAxis
                    yAxisId="left"
                    stroke={darkMode ? "#9ca3af" : "#6b7280"}
                  />
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    stroke={darkMode ? "#9ca3af" : "#6b7280"}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: darkMode ? "#020617" : "#ffffff",
                      borderColor: darkMode ? "#1f2937" : "#e5e7eb",
                      borderRadius: 12,
                    }}
                    formatter={(value: any, name) =>
                      name === "consultas"
                        ? [formatNumber(value as number), "Consultas"]
                        : [formatCurrency(value as number), "Ingresos"]
                    }
                  />
                  <Legend />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="consultas"
                    stroke="#6366f1"
                    strokeWidth={2.2}
                    activeDot={{ r: 6 }}
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="ingresos"
                    stroke="#22c55e"
                    strokeWidth={2.2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Pie */}
          <div
            className={`rounded-2xl p-4 md:p-6 border shadow-md flex flex-col ${cardBg}`}
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className={`text-base md:text-lg font-bold ${textPrimary}`}>
                  Mezcla de pagadores
                </h3>
                <p className={`text-xs ${textSecondary}`}>
                  Porcentaje de pacientes por tipo de cobertura.
                </p>
              </div>
            </div>
            <div className="flex-1 flex flex-col items-center justify-center">
              <div className="h-52 w-full">
                <ResponsiveContainer>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={70}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: darkMode ? "#020617" : "#ffffff",
                        borderColor: darkMode ? "#1f2937" : "#e5e7eb",
                        borderRadius: 12,
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="mt-4 w-full space-y-2">
                {pieData.map((item, i) => (
                  <div
                    key={item.name}
                    className="flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: COLORS[i % COLORS.length] }}
                      />
                      <span className={textSecondary}>{item.name}</span>
                    </div>
                    <span className={`font-bold ${textPrimary}`}>
                      {item.value}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Barras por centro */}
        <div
          className={`rounded-2xl p-4 md:p-6 border shadow-md ${cardBg}`}
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className={`text-base md:text-lg font-bold ${textPrimary}`}>
                Comparativo por centro médico
              </h3>
              <p className={`text-xs ${textSecondary}`}>
                Consultas e ingresos por cada centro en el período.
              </p>
            </div>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke={darkMode ? "#1f2937" : "#e5e7eb"}
                />
                <XAxis dataKey="name" stroke={darkMode ? "#9ca3af" : "#6b7280"} />
                <YAxis stroke={darkMode ? "#9ca3af" : "#6b7280"} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: darkMode ? "#020617" : "#ffffff",
                    borderColor: darkMode ? "#1f2937" : "#e5e7eb",
                    borderRadius: 12,
                  }}
                  formatter={(value: any, name) =>
                    name === "consultas"
                      ? [formatNumber(value as number), "Consultas"]
                      : [formatCurrency(value as number), "Ingresos"]
                  }
                />
                <Legend />
                <Bar dataKey="consultas" fill="#6366f1" radius={[6, 6, 0, 0]} />
                <Bar dataKey="ingresos" fill="#22c55e" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Footer */}
        <div
          className={`rounded-2xl p-4 border shadow-md flex flex-col md:flex-row items-center justify-between gap-3 ${
            cardBg
          }`}
        >
          <div className="flex items-center gap-2 text-xs md:text-sm">
            <FileText
              className={`w-4 h-4 ${
                darkMode ? "text-gray-400" : "text-gray-500"
              }`}
            />
            <span className={textSecondary}>
              Esta sección está diseñada como base para tus reportes. Luego
              puedes conectarla a tus APIs reales de reportes.
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs md:text-sm">
            <Sparkles className="w-4 h-4 text-yellow-400" />
            <span className={textSecondary}>AnyssaMed · Módulo de Reportes</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/** Iconito simple para no importar Activity del dashboard grande */
function ActivityIcon() {
  return (
    <svg
      className="w-4 h-4"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
    </svg>
  );
}
