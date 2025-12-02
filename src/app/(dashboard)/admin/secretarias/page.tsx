// frontend/src/app/(dashboard)/admin/secretarias/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Users,
  Search,
  Filter,
  Plus,
  Download,
  Upload,
  MoreVertical,
  Eye,
  Edit,
  Trash2,
  Ban,
  CheckCircle,
  Building,
  UserCog,
  Activity,
  TrendingUp,
  AlertCircle,
  Clock,
  ArrowLeft,
  Moon,
  Sun,
  X,
  Sparkles,
  Palette,
} from "lucide-react";

// =======================================
// TIPOS SEGÚN TABLAS SECRETARIAS*
// =======================================
interface Secretaria {
  id_secretaria: number;
  id_usuario: number;
  rut: string;
  nombre: string;
  apellido_paterno: string;
  apellido_materno: string | null;
  nombre_completo: string;
  email: string;
  telefono: string | null;

  id_centro: number;
  id_sucursal: number | null;
  id_departamento: number | null;

  centro_nombre: string;
  sucursal_nombre: string | null;
  departamento_nombre: string | null;

  estado: "activo" | "inactivo" | "suspendido" | "vacaciones";
  jornada: "completa" | "media" | "parcial";
  extension_telefonica: string | null;

  fecha_inicio: string;
  fecha_termino: string | null;

  supervisor_id: number | null;
  supervisor_nombre: string | null;

  numero_empleado: string | null;

  id_medico_asignado: number | null;
  medico_principal_nombre: string | null;

  total_medicos_asignados: number;
}

interface EstadisticasSecretarias {
  total: number;
  activas: number;
  inactivas: number;
  suspendidas: number;
  en_vacaciones: number;
  jornada_completa: number;
  jornada_media: number;
  jornada_parcial: number;
  con_medico_principal: number;
  sin_medico_principal: number;
  nuevas_ultimo_mes: number;
}

// ==============================
// 🎨 Temas de color mejorados
// ==============================
const colorThemes = {
  aurora: {
    name: "Aurora Boreal",
    primary: "from-violet-600 via-purple-600 to-fuchsia-600",
    accent: "from-purple-400 to-pink-400",
    glow: "shadow-purple-500/50",
  },
  ocean: {
    name: "Océano Profundo",
    primary: "from-cyan-500 via-blue-600 to-indigo-700",
    accent: "from-cyan-400 to-blue-400",
    glow: "shadow-blue-500/50",
  },
  sunset: {
    name: "Atardecer Dorado",
    primary: "from-orange-500 via-red-500 to-pink-600",
    accent: "from-orange-400 to-red-400",
    glow: "shadow-orange-500/50",
  },
  forest: {
    name: "Bosque Esmeralda",
    primary: "from-emerald-500 via-green-600 to-teal-700",
    accent: "from-emerald-400 to-green-400",
    glow: "shadow-emerald-500/50",
  },
  midnight: {
    name: "Medianoche Estelar",
    primary: "from-slate-600 via-slate-700 to-slate-900",
    accent: "from-slate-400 to-slate-500",
    glow: "shadow-slate-500/50",
  },
  royal: {
    name: "Real Dorado",
    primary: "from-amber-500 via-yellow-600 to-orange-600",
    accent: "from-amber-400 to-yellow-400",
    glow: "shadow-amber-500/50",
  },
} as const;

export default function SecretariasPage() {
  const router = useRouter();

  // ==============================
  // 🧠 STATE PRINCIPAL
  // ==============================
  const [secretarias, setSecretarias] = useState<Secretaria[]>([]);
  const [estadisticas, setEstadisticas] =
    useState<EstadisticasSecretarias | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Filtros
  const [busqueda, setBusqueda] = useState("");
  const [estadoFiltro, setEstadoFiltro] = useState("todas");
  const [jornadaFiltro, setJornadaFiltro] = useState("todas");
  const [centroFiltro, setCentroFiltro] = useState("");
  const [ordenar, setOrdenar] = useState("fecha_desc");

  // Paginación
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  // UI
  const [mostrarFiltros, setMostrarFiltros] = useState(false);
  const [mostrarMenu, setMostrarMenu] = useState<number | null>(null);
  const [mostrarThemeSelector, setMostrarThemeSelector] = useState(false);

  // Theme
  const [darkMode, setDarkMode] = useState(false);
  const [selectedTheme, setSelectedTheme] =
    useState<keyof typeof colorThemes>("aurora");

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

  // ==============================
  // 🌗 THEME EFFECTS
  // ==============================
  useEffect(() => {
    const savedDarkMode = localStorage.getItem("darkModeSecretarias") === "true";
    const savedTheme =
      (localStorage.getItem(
        "colorThemeSecretarias"
      ) as keyof typeof colorThemes) || "aurora";

    setDarkMode(savedDarkMode);
    if (savedTheme && colorThemes[savedTheme]) {
      setSelectedTheme(savedTheme);
    }
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    if (darkMode) root.classList.add("dark");
    else root.classList.remove("dark");
    localStorage.setItem("darkModeSecretarias", String(darkMode));
  }, [darkMode]);

  const toggleDarkMode = () => setDarkMode((v) => !v);

  const changeTheme = (themeKey: keyof typeof colorThemes) => {
    setSelectedTheme(themeKey);
    localStorage.setItem("colorThemeSecretarias", themeKey);
    setMostrarThemeSelector(false);
  };

  // ==============================
  // 📥 CARGA DE DATOS
  // ==============================
  useEffect(() => {
    cargarSecretarias();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, limit, estadoFiltro, jornadaFiltro, centroFiltro, ordenar]);

  const cargarSecretarias = async () => {
    try {
      setLoading(true);
      setError("");

      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        estado: estadoFiltro,
        jornada: jornadaFiltro,
        centro: centroFiltro,
        buscar: busqueda,
        ordenar,
      });

      const response = await fetch(`/api/admin/secretarias?${params}`, {
        cache: "no-store",
      });

      const data = await response.json();

      if (data.success) {
        setSecretarias(data.data || []);
        setEstadisticas(data.estadisticas || null);
        setTotalPages(data.pagination?.totalPages || 1);
        setTotal(data.pagination?.total || (data.data?.length ?? 0));
      } else {
        setError(data.error || "Error al cargar secretarias");
      }
    } catch (err) {
      console.error(err);
      setError("Error al cargar secretarias");
    } finally {
      setLoading(false);
    }
  };

  const handleBuscar = () => {
    setPage(1);
    cargarSecretarias();
  };

  const handleLimpiarFiltros = () => {
    setBusqueda("");
    setEstadoFiltro("todas");
    setJornadaFiltro("todas");
    setCentroFiltro("");
    setOrdenar("fecha_desc");
    setPage(1);
  };

  const handleSuspender = async (id_secretaria: number) => {
    if (!confirm("¿Está seguro de suspender esta secretaria?")) return;

    const motivo = prompt("Ingrese el motivo de la suspensión:");
    if (!motivo) return;

    try {
      const response = await fetch(
        `/api/admin/secretarias/${id_secretaria}/suspender`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ motivo }),
        }
      );

      const data = await response.json();

      if (data.success) {
        alert("Secretaria suspendida exitosamente");
        cargarSecretarias();
      } else {
        alert(data.error || "Error al suspender secretaria");
      }
    } catch (error) {
      console.error(error);
      alert("Error al suspender secretaria");
    }
  };

  const handleActivar = async (id_secretaria: number) => {
    if (!confirm("¿Está seguro de activar esta secretaria?")) return;

    try {
      const response = await fetch(
        `/api/admin/secretarias/${id_secretaria}/activar`,
        {
          method: "POST",
        }
      );

      const data = await response.json();

      if (data.success) {
        alert("Secretaria activada exitosamente");
        cargarSecretarias();
      } else {
        alert(data.error || "Error al activar secretaria");
      }
    } catch (error) {
      console.error(error);
      alert("Error al activar secretaria");
    }
  };

  const handleEliminar = async (id_secretaria: number) => {
    if (
      !confirm(
        "¿Está seguro de eliminar esta secretaria? Esta acción no se puede deshacer."
      )
    )
      return;

    try {
      const response = await fetch(`/api/admin/secretarias/${id_secretaria}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (data.success) {
        alert("Secretaria eliminada exitosamente");
        cargarSecretarias();
      } else {
        alert(data.error || "Error al eliminar secretaria");
      }
    } catch (error) {
      console.error(error);
      alert("Error al eliminar secretaria");
    }
  };

  // ==============================
  // 🎨 FUNCIONES DE ESTILO
  // ==============================
  const getEstadoBadge = (estado: string) => {
    const badges: Record<string, string> = {
      activo: darkMode
        ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
        : "bg-emerald-50 text-emerald-700 border-emerald-200",
      inactivo: darkMode
        ? "bg-slate-500/20 text-slate-300 border-slate-500/30"
        : "bg-slate-50 text-slate-700 border-slate-200",
      suspendido: darkMode
        ? "bg-amber-500/20 text-amber-300 border-amber-500/30"
        : "bg-amber-50 text-amber-700 border-amber-200",
      vacaciones: darkMode
        ? "bg-blue-500/20 text-blue-300 border-blue-500/30"
        : "bg-blue-50 text-blue-700 border-blue-200",
    };
    return badges[estado] || badges.inactivo;
  };

  const getJornadaBadge = (jornada: string) => {
    const badges: Record<string, string> = {
      completa: darkMode
        ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
        : "bg-emerald-50 text-emerald-700 border-emerald-200",
      media: darkMode
        ? "bg-purple-500/20 text-purple-300 border-purple-500/30"
        : "bg-purple-50 text-purple-700 border-purple-200",
      parcial: darkMode
        ? "bg-pink-500/20 text-pink-300 border-pink-500/30"
        : "bg-pink-50 text-pink-700 border-pink-200",
    };
    return badges[jornada] || badges.completa;
  };

  const safePercent = (partial: number, totalBase: number) => {
    if (!totalBase || totalBase <= 0) return "0";
    return ((partial / totalBase) * 100).toFixed(0);
  };

  // ==============================
  // ⏳ LOADING PREMIUM
  // ==============================
  if (loading && secretarias.length === 0) {
    return (
      <div
        className={`min-h-screen ${bgClass} flex items-center justify-center transition-all duration-500`}
      >
        <div className="text-center relative">
          {/* glow */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div
              className={`w-32 h-32 bg-gradient-to-r ${theme.primary} rounded-full blur-3xl opacity-20 animate-pulse`}
            ></div>
          </div>

          {/* spinner */}
          <div className="relative">
            <div
              className={`w-20 h-20 border-4 ${borderColor} border-t-transparent rounded-full animate-spin mx-auto mb-6`}
            ></div>
          </div>

          <div className="relative z-10">
            <h3
              className={`text-2xl font-black ${textPrimary} mb-2 flex items-center gap-2 justify-center`}
            >
              <Sparkles className="w-6 h-6 animate-pulse" />
              Cargando Secretarias
            </h3>
            <p className={`${textSecondary} font-medium animate-pulse`}>
              Preparando panel administrativo premium...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ==============================
  // 🖼 RENDER PRINCIPAL
  // ==============================
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
        {/* ========================== */}
        {/* CONTROLES FLOTANTES        */}
        {/* ========================== */}
        <div className="fixed top-6 right-6 z-50 flex flex-col gap-3">
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
                className={`absolute top-full right-0 mt-3 ${cardBg} ${borderColor} border rounded-2xl shadow-2xl p-4 min-w-[280px] animate-in fade-in slide-in-from-top-2 duration-200`}
              >
                <div className="flex items-center gap-2 mb-4">
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
        {/* HEADER PREMIUM             */}
        {/* ========================== */}
        <div
          className={`${cardBg} rounded-3xl shadow-2xl border ${borderColor} overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500`}
        >
          <div className={`h-2 bg-gradient-to-r ${theme.primary}`}></div>

          <div className="p-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              {/* Izquierda */}
              <div className="flex items-center gap-6">
                <button
                  onClick={() => router.push("/admin")}
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
                    <Users className="w-10 h-10 text-white" />
                  </div>
                </div>

                <div>
                  <h1 className={`text-3xl font-black ${textPrimary}`}>
                    Gestión de Secretarias
                  </h1>
                  <p className={`${textSecondary} font-medium mt-1`}>
                    Administra personal de secretaría, jornadas y asignación a
                    médicos
                  </p>
                </div>
              </div>

              {/* Derecha: acciones */}
              <div className="flex gap-3 flex-wrap">
                <button
                  onClick={() => router.push("/admin/secretarias/nueva")}
                  className={`flex items-center gap-2 px-6 py-3 bg-gradient-to-r ${theme.primary} text-white rounded-xl shadow-lg ${theme.glow} hover:shadow-2xl transition-all duration-300 font-bold group hover:scale-105`}
                >
                  <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
                  <span>Nueva Secretaria</span>
                </button>

                <button
                  className={`flex items-center gap-2 px-6 py-3 ${
                    darkMode ? "bg-slate-800/50" : "bg-slate-100"
                  } ${textPrimary} rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 font-bold group hover:scale-105 border ${borderColor}`}
                >
                  <Download className="w-5 h-5 group-hover:rotate-12 transition-transform duration-300" />
                  <span>Exportar</span>
                </button>

                <button
                  className={`flex items-center gap-2 px-6 py-3 ${
                    darkMode ? "bg-slate-800/50" : "bg-slate-100"
                  } ${textPrimary} rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 font-bold group hover:scale-105 border ${borderColor}`}
                >
                  <Upload className="w-5 h-5 group-hover:rotate-12 transition-transform duration-300" />
                  <span>Importar</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ========================== */}
        {/* ESTADÍSTICAS               */}
        {/* ========================== */}
        {estadisticas && (
          <div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500"
            style={{ animationDelay: "100ms" }}
          >
            {/* Total Secretarias */}
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
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <TrendingUp className={`w-5 h-5 ${textSecondary}`} />
                </div>
                <p
                  className={`${textMuted} text-sm font-bold uppercase tracking-wider mb-1`}
                >
                  Total Secretarias
                </p>
                <p className={`text-3xl font-black ${textPrimary}`}>
                  {estadisticas.total}
                </p>
              </div>
            </div>

            {/* Activas */}
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
                    <CheckCircle className="w-6 h-6 text-white" />
                  </div>
                  <div
                    className={`text-xs font-black px-2 py-1 rounded-full ${
                      darkMode
                        ? "bg-emerald-500/20 text-emerald-300"
                        : "bg-emerald-100 text-emerald-700"
                    }`}
                  >
                    {safePercent(estadisticas.activas, estadisticas.total)}%
                  </div>
                </div>
                <p
                  className={`${textMuted} text-sm font-bold uppercase tracking-wider mb-1`}
                >
                  Activas
                </p>
                <p className={`text-3xl font-black ${textPrimary}`}>
                  {estadisticas.activas}
                </p>
              </div>
            </div>

            {/* En Vacaciones */}
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
                    <Sun className="w-6 h-6 text-yellow-300" />
                  </div>
                  <Clock className={`w-5 h-5 ${textSecondary}`} />
                </div>
                <p
                  className={`${textMuted} text-sm font-bold uppercase tracking-wider mb-1`}
                >
                  En Vacaciones
                </p>
                <p className={`text-3xl font-black ${textPrimary}`}>
                  {estadisticas.en_vacaciones}
                </p>
              </div>
            </div>

            {/* Jornada Completa */}
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
                    <Clock className="w-6 h-6 text-white" />
                  </div>
                  <span className={`text-xs font-bold ${textMuted}`}>
                    {safePercent(
                      estadisticas.jornada_completa,
                      estadisticas.total
                    )}
                    %
                  </span>
                </div>
                <p
                  className={`${textMuted} text-sm font-bold uppercase tracking-wider mb-1`}
                >
                  Jornada Completa
                </p>
                <p className={`text-3xl font-black ${textPrimary}`}>
                  {estadisticas.jornada_completa}
                </p>
              </div>
            </div>

            {/* Con Médico Principal */}
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
                    <UserCog className="w-6 h-6 text-white" />
                  </div>
                  <Building className={`w-5 h-5 ${textSecondary}`} />
                </div>
                <p
                  className={`${textMuted} text-sm font-bold uppercase tracking-wider mb-1`}
                >
                  Con Médico Principal
                </p>
                <p className={`text-3xl font-black ${textPrimary}`}>
                  {estadisticas.con_medico_principal}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ========================== */}
        {/* FILTROS Y BÚSQUEDA         */}
        {/* ========================== */}
        <div
          className={`${cardBg} rounded-3xl shadow-2xl border ${borderColor} p-6 animate-in fade-in slide-in-from-bottom-4 duration-500`}
          style={{ animationDelay: "200ms" }}
        >
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Búsqueda */}
            <div className="flex-1">
              <div className="relative group">
                <Search
                  className={`absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 ${
                    darkMode ? "text-slate-500" : "text-slate-400"
                  }`}
                />
                <input
                  type="text"
                  placeholder="Buscar por nombre, RUT, centro..."
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleBuscar()}
                  className={`w-full pl-12 pr-4 py-3 rounded-xl font-medium transition-all duration-300 ${inputBg} border-2 ${
                    darkMode
                      ? "border-white/10 focus:border-blue-500/50"
                      : "border-slate-200 focus:border-blue-500"
                  } ${textPrimary} placeholder-slate-400 focus:ring-4 focus:ring-blue-500/20 group-hover:border-blue-500/50`}
                />
              </div>
            </div>

            {/* Botones */}
            <div className="flex gap-2">
              <button
                onClick={handleBuscar}
                className={`px-6 py-3 bg-gradient-to-r ${theme.primary} text-white rounded-xl shadow-lg ${theme.glow} hover:shadow-2xl transition-all duration-300 font-bold group hover:scale-105`}
              >
                <Search className="w-5 h-5 group-hover:rotate-12 transition-transform duration-300" />
              </button>
              <button
                onClick={() => setMostrarFiltros(!mostrarFiltros)}
                className={`flex items-center gap-2 px-4 py-3 rounded-xl transition-all duration-300 font-bold ${
                  darkMode
                    ? "bg-slate-800/50 border-white/10 text-slate-300 hover:bg-slate-800"
                    : "bg-white/50 border-slate-200 text-slate-700 hover:bg-white"
                } border hover:scale-105`}
              >
                {mostrarFiltros ? (
                  <X className="w-5 h-5" />
                ) : (
                  <Filter className="w-5 h-5" />
                )}
                <span className="hidden sm:inline">
                  {mostrarFiltros ? "Cerrar" : "Filtros"}
                </span>
              </button>
            </div>
          </div>

          {mostrarFiltros && (
            <div
              className={`mt-6 pt-6 transition-all duration-300 ${
                darkMode ? "border-t border-white/10" : "border-t border-slate-200"
              }`}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                {/* Estado */}
                <div className="space-y-2">
                  <label
                    className={`block text-sm font-black ${textMuted} uppercase tracking-wider`}
                  >
                    Estado
                  </label>
                  <select
                    value={estadoFiltro}
                    onChange={(e) => setEstadoFiltro(e.target.value)}
                    className={`w-full px-4 py-3 rounded-xl font-medium transition-all duration-300 ${inputBg} border-2 ${
                      darkMode
                        ? "border-white/10 focus:border-blue-500/50"
                        : "border-slate-200 focus:border-blue-500"
                    } ${textPrimary} focus:ring-4 focus:ring-blue-500/20 cursor-pointer hover:border-blue-500/50`}
                  >
                    <option value="todas">Todas</option>
                    <option value="activo">Activas</option>
                    <option value="inactivo">Inactivas</option>
                    <option value="suspendido">Suspendidas</option>
                    <option value="vacaciones">En vacaciones</option>
                  </select>
                </div>

                {/* Jornada */}
                <div className="space-y-2">
                  <label
                    className={`block text-sm font-black ${textMuted} uppercase tracking-wider`}
                  >
                    Jornada
                  </label>
                  <select
                    value={jornadaFiltro}
                    onChange={(e) => setJornadaFiltro(e.target.value)}
                    className={`w-full px-4 py-3 rounded-xl font-medium transition-all duration-300 ${inputBg} border-2 ${
                      darkMode
                        ? "border-white/10 focus:border-blue-500/50"
                        : "border-slate-200 focus:border-blue-500"
                    } ${textPrimary} focus:ring-4 focus:ring-blue-500/20 cursor-pointer hover:border-blue-500/50`}
                  >
                    <option value="todas">Todas</option>
                    <option value="completa">Completa</option>
                    <option value="media">Media jornada</option>
                    <option value="parcial">Parcial</option>
                  </select>
                </div>

                {/* Centro */}
                <div className="space-y-2">
                  <label
                    className={`block text-sm font-black ${textMuted} uppercase tracking-wider`}
                  >
                    Centro
                  </label>
                  <input
                    value={centroFiltro}
                    onChange={(e) => setCentroFiltro(e.target.value)}
                    placeholder="Nombre centro..."
                    className={`w-full px-4 py-3 rounded-xl font-medium transition-all duration-300 ${inputBg} border-2 ${
                      darkMode
                        ? "border-white/10 focus:border-blue-500/50"
                        : "border-slate-200 focus:border-blue-500"
                    } ${textPrimary} focus:ring-4 focus:ring-blue-500/20 placeholder-slate-400`}
                  />
                </div>

                {/* Ordenar */}
                <div className="space-y-2">
                  <label
                    className={`block text-sm font-black ${textMuted} uppercase tracking-wider`}
                  >
                    Ordenar por
                  </label>
                  <select
                    value={ordenar}
                    onChange={(e) => setOrdenar(e.target.value)}
                    className={`w-full px-4 py-3 rounded-xl font-medium transition-all duration-300 ${inputBg} border-2 ${
                      darkMode
                        ? "border-white/10 focus:border-blue-500/50"
                        : "border-slate-200 focus:border-blue-500"
                    } ${textPrimary} focus:ring-4 focus:ring-blue-500/20 cursor-pointer hover:border-blue-500/50`}
                  >
                    <option value="fecha_desc">Más recientes</option>
                    <option value="fecha_asc">Más antiguas</option>
                    <option value="nombre_asc">Nombre A-Z</option>
                    <option value="nombre_desc">Nombre Z-A</option>
                    <option value="centro">Centro</option>
                  </select>
                </div>

                {/* Limpiar */}
                <div className="flex items-end">
                  <button
                    onClick={handleLimpiarFiltros}
                    className={`w-full px-4 py-3 rounded-xl transition-all duration-300 font-bold ${
                      darkMode
                        ? "bg-slate-800/50 text-slate-300 hover:bg-slate-800"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    } border ${borderColor} hover:scale-105`}
                  >
                    Limpiar Filtros
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ========================== */}
        {/* TABLA DE SECRETARIAS       */}
        {/* ========================== */}
        <div
          className={`${cardBg} rounded-3xl shadow-2xl border ${borderColor} overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500`}
          style={{ animationDelay: "300ms" }}
        >
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="relative">
                <div
                  className={`animate-spin rounded-full h-16 w-16 border-4 border-transparent border-t-current bg-gradient-to-r ${theme.primary} bg-clip-border`}
                ></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <Users className={`w-8 h-8 ${textSecondary}`} />
                </div>
              </div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <AlertCircle className="w-16 h-16 text-rose-500 mx-auto mb-4" />
                <p className={`font-bold text-lg ${textPrimary}`}>{error}</p>
              </div>
            </div>
          ) : secretarias.length === 0 ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <Users className={`w-16 h-16 ${textMuted} mx-auto mb-4`} />
                <p className={`font-bold text-lg ${textSecondary}`}>
                  No se encontraron secretarias
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* Desktop */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="w-full">
                  <thead
                    className={`${
                      darkMode
                        ? "bg-slate-700/50 border-b-2 border-white/10"
                        : "bg-gradient-to-r from-slate-50 to-slate-100 border-b-2 border-slate-200"
                    } transition-colors duration-300`}
                  >
                    <tr>
                      <th
                        className={`px-6 py-4 text-left text-xs font-black uppercase tracking-wider ${textMuted}`}
                      >
                        Secretaria
                      </th>
                      <th
                        className={`px-6 py-4 text-left text-xs font-black uppercase tracking-wider ${textMuted}`}
                      >
                        Contacto
                      </th>
                      <th
                        className={`px-6 py-4 text-left text-xs font-black uppercase tracking-wider ${textMuted}`}
                      >
                        Jornada
                      </th>
                      <th
                        className={`px-6 py-4 text-left text-xs font-black uppercase tracking-wider ${textMuted}`}
                      >
                        Centro / Sucursal
                      </th>
                      <th
                        className={`px-6 py-4 text-left text-xs font-black uppercase tracking-wider ${textMuted}`}
                      >
                        Estado
                      </th>
                      <th
                        className={`px-6 py-4 text-left text-xs font-black uppercase tracking-wider ${textMuted}`}
                      >
                        Asignación Médica
                      </th>
                      <th
                        className={`px-6 py-4 text-center text-xs font-black uppercase tracking-wider ${textMuted}`}
                      >
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody
                    className={`divide-y ${
                      darkMode ? "divide-white/5" : "divide-slate-200"
                    }`}
                  >
                    {secretarias.map((sec) => (
                      <tr
                        key={sec.id_secretaria}
                        className={`transition-colors duration-200 ${
                          darkMode ? "hover:bg-white/5" : "hover:bg-slate-50"
                        }`}
                      >
                        {/* Secretaria */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-10 h-10 rounded-full bg-gradient-to-br ${theme.primary} flex items-center justify-center text-white font-bold shadow-lg transform hover:scale-110 transition-transform duration-200`}
                            >
                              {sec.nombre.charAt(0)}
                              {sec.apellido_paterno.charAt(0)}
                            </div>
                            <div>
                              <div className={`font-bold ${textPrimary}`}>
                                {sec.nombre_completo}
                              </div>
                              <div className={`text-sm ${textMuted}`}>
                                RUT: {sec.rut}
                              </div>
                              {sec.numero_empleado && (
                                <div className={`text-xs ${textSecondary}`}>
                                  Nº Empleado: {sec.numero_empleado}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Contacto */}
                        <td className="px-6 py-4">
                          <div className="text-sm">
                            <div className={textSecondary}>{sec.email}</div>
                            <div className={textMuted}>
                              {sec.telefono || "Sin teléfono"}
                            </div>
                            <div className={textMuted}>
                              Ext: {sec.extension_telefonica || "N/A"}
                            </div>
                          </div>
                        </td>

                        {/* Jornada */}
                        <td className="px-6 py-4">
                          <div className="space-y-1 text-sm">
                            <span
                              className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold border ${getJornadaBadge(
                                sec.jornada
                              )}`}
                            >
                              {sec.jornada === "completa"
                                ? "Jornada completa"
                                : sec.jornada === "media"
                                ? "Media jornada"
                                : "Parcial"}
                            </span>
                            <div className={textMuted}>
                              Inicio: {sec.fecha_inicio}
                            </div>
                            {sec.fecha_termino && (
                              <div className={textMuted}>
                                Término: {sec.fecha_termino}
                              </div>
                            )}
                          </div>
                        </td>

                        {/* Centro / Sucursal */}
                        <td className="px-6 py-4">
                          <div className="text-sm">
                            <div
                              className={`font-medium ${textSecondary} flex items-center gap-1`}
                            >
                              <Building className="w-4 h-4" />
                              {sec.centro_nombre || "Sin centro"}
                            </div>
                            <div className={textMuted}>
                              {sec.sucursal_nombre
                                ? `Sucursal: ${sec.sucursal_nombre}`
                                : "Sin sucursal"}
                            </div>
                            {sec.departamento_nombre && (
                              <div className={textMuted}>
                                Depto: {sec.departamento_nombre}
                              </div>
                            )}
                          </div>
                        </td>

                        {/* Estado */}
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold border ${getEstadoBadge(
                              sec.estado
                            )}`}
                          >
                            {sec.estado}
                          </span>
                          {sec.supervisor_nombre && (
                            <div className={`text-xs mt-2 ${textMuted}`}>
                              Sup.: {sec.supervisor_nombre}
                            </div>
                          )}
                        </td>

                        {/* Asignación médica */}
                        <td className="px-6 py-4">
                          <div className="text-sm">
                            <div className={textSecondary}>
                              Médico principal:{" "}
                              {sec.medico_principal_nombre ||
                                "Sin médico principal"}
                            </div>
                            <div className={textMuted}>
                              Médicos asignados: {sec.total_medicos_asignados}
                            </div>
                          </div>
                        </td>

                        {/* Acciones */}
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() =>
                                router.push(
                                  `/admin/secretarias/${sec.id_secretaria}`
                                )
                              }
                              className={`p-2 rounded-lg transition-all duration-200 ${
                                darkMode
                                  ? "text-blue-400 hover:bg-blue-500/20"
                                  : "text-blue-600 hover:bg-blue-50"
                              }`}
                              title="Ver ficha"
                            >
                              <Eye className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() =>
                                router.push(
                                  `/admin/secretarias/${sec.id_secretaria}/editar`
                                )
                              }
                              className={`p-2 rounded-lg transition-all duration-200 ${
                                darkMode
                                  ? "text-emerald-400 hover:bg-emerald-500/20"
                                  : "text-emerald-600 hover:bg-emerald-50"
                              }`}
                              title="Editar"
                            >
                              <Edit className="w-5 h-5" />
                            </button>
                            <div className="relative">
                              <button
                                onClick={() =>
                                  setMostrarMenu(
                                    mostrarMenu === sec.id_secretaria
                                      ? null
                                      : sec.id_secretaria
                                  )
                                }
                                className={`p-2 rounded-lg transition-all duration-200 ${
                                  darkMode
                                    ? "text-slate-400 hover:bg-slate-700"
                                    : "text-slate-600 hover:bg-slate-100"
                                }`}
                              >
                                <MoreVertical className="w-5 h-5" />
                              </button>

                              {mostrarMenu === sec.id_secretaria && (
                                <div
                                  className={`absolute right-0 mt-2 w-60 rounded-xl shadow-2xl border py-2 z-50 ${
                                    darkMode
                                      ? "bg-slate-800 border-slate-700"
                                      : "bg-white border-slate-200"
                                  }`}
                                >
                                  <button
                                    onClick={() => {
                                      router.push(
                                        `/admin/usuarios/${sec.id_usuario}`
                                      );
                                      setMostrarMenu(null);
                                    }}
                                    className={`w-full px-4 py-2.5 text-left text-sm font-medium flex items-center gap-3 transition-colors ${
                                      darkMode
                                        ? "text-slate-300 hover:bg-slate-700"
                                        : "text-slate-700 hover:bg-slate-50"
                                    }`}
                                  >
                                    <UserCog className="w-4 h-4" />
                                    Ver usuario vinculado
                                  </button>
                                  <button
                                    onClick={() => {
                                      router.push(
                                        `/admin/secretarias/${sec.id_secretaria}/medicos`
                                      );
                                      setMostrarMenu(null);
                                    }}
                                    className={`w-full px-4 py-2.5 text-left text-sm font-medium flex items-center gap-3 transition-colors ${
                                      darkMode
                                        ? "text-slate-300 hover:bg-slate-700"
                                        : "text-slate-700 hover:bg-slate-50"
                                    }`}
                                  >
                                    <Activity className="w-4 h-4" />
                                    Médicos asignados
                                  </button>
                                  <button
                                    onClick={() => {
                                      router.push(
                                        `/admin/secretarias/${sec.id_secretaria}/estadisticas`
                                      );
                                      setMostrarMenu(null);
                                    }}
                                    className={`w-full px-4 py-2.5 text-left text-sm font-medium flex items-center gap-3 transition-colors ${
                                      darkMode
                                        ? "text-slate-300 hover:bg-slate-700"
                                        : "text-slate-700 hover:bg-slate-50"
                                    }`}
                                  >
                                    <TrendingUp className="w-4 h-4" />
                                    Estadísticas
                                  </button>
                                  <div
                                    className={`border-t my-2 ${
                                      darkMode
                                        ? "border-slate-700"
                                        : "border-slate-200"
                                    }`}
                                  ></div>
                                  {sec.estado === "activo" ? (
                                    <button
                                      onClick={() => {
                                        handleSuspender(sec.id_secretaria);
                                        setMostrarMenu(null);
                                      }}
                                      className={`w-full px-4 py-2.5 text-left text-sm font-medium flex items-center gap-3 transition-colors ${
                                        darkMode
                                          ? "text-amber-400 hover:bg-amber-500/20"
                                          : "text-amber-600 hover:bg-amber-50"
                                      }`}
                                    >
                                      <Ban className="w-4 h-4" />
                                      Suspender
                                    </button>
                                  ) : (
                                    <button
                                      onClick={() => {
                                        handleActivar(sec.id_secretaria);
                                        setMostrarMenu(null);
                                      }}
                                      className={`w-full px-4 py-2.5 text-left text-sm font-medium flex items-center gap-3 transition-colors ${
                                        darkMode
                                          ? "text-emerald-400 hover:bg-emerald-500/20"
                                          : "text-emerald-600 hover:bg-emerald-50"
                                      }`}
                                    >
                                      <CheckCircle className="w-4 h-4" />
                                      Activar
                                    </button>
                                  )}
                                  <div
                                    className={`border-t my-2 ${
                                      darkMode
                                        ? "border-slate-700"
                                        : "border-slate-200"
                                    }`}
                                  ></div>
                                  <button
                                    onClick={() => {
                                      handleEliminar(sec.id_secretaria);
                                      setMostrarMenu(null);
                                    }}
                                    className={`w-full px-4 py-2.5 text-left text-sm font-medium flex items-center gap-3 transition-colors ${
                                      darkMode
                                        ? "text-rose-400 hover:bg-rose-500/20"
                                        : "text-rose-600 hover:bg-rose-50"
                                    }`}
                                  >
                                    <Trash2 className="w-4 h-4" />
                                    Eliminar
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile */}
              <div
                className={`lg:hidden divide-y ${
                  darkMode ? "divide-white/5" : "divide-slate-200"
                }`}
              >
                {secretarias.map((sec) => (
                  <div
                    key={sec.id_secretaria}
                    className={`p-4 transition-colors duration-200 ${
                      darkMode ? "hover:bg-white/5" : "hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-start gap-3 mb-3">
                      <div
                        className={`w-14 h-14 rounded-full bg-gradient-to-br ${theme.primary} flex items-center justify-center text-white font-bold shadow-lg flex-shrink-0 transform hover:scale-110 transition-transform duration-200`}
                      >
                        {sec.nombre.charAt(0)}
                        {sec.apellido_paterno.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3
                          className={`font-bold text-lg truncate ${textPrimary}`}
                        >
                          {sec.nombre_completo}
                        </h3>
                        <p className={`text-sm ${textMuted}`}>{sec.email}</p>
                        <p className={`text-xs ${textMuted}`}>
                          Centro: {sec.centro_nombre}
                        </p>
                        <div className="flex flex-wrap gap-2 mt-2">
                          <span
                            className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${getEstadoBadge(
                              sec.estado
                            )}`}
                          >
                            {sec.estado}
                          </span>
                          <span
                            className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${getJornadaBadge(
                              sec.jornada
                            )}`}
                          >
                            {sec.jornada}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-3">
                      <button
                        onClick={() =>
                          router.push(`/admin/secretarias/${sec.id_secretaria}`)
                        }
                        className={`flex-1 px-3 py-2.5 rounded-lg text-sm font-bold transition-colors ${
                          darkMode
                            ? "bg-blue-500/20 text-blue-400 hover:bg-blue-500/30"
                            : "bg-blue-50 text-blue-600 hover:bg-blue-100"
                        }`}
                      >
                        Ver
                      </button>
                      <button
                        onClick={() =>
                          router.push(
                            `/admin/secretarias/${sec.id_secretaria}/editar`
                          )
                        }
                        className={`flex-1 px-3 py-2.5 rounded-lg text-sm font-bold transition-colors ${
                          darkMode
                            ? "bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30"
                            : "bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
                        }`}
                      >
                        Editar
                      </button>
                      <button
                        onClick={() =>
                          setMostrarMenu(
                            mostrarMenu === sec.id_secretaria
                              ? null
                              : sec.id_secretaria
                          )
                        }
                        className={`px-3 py-2.5 rounded-lg transition-colors ${
                          darkMode
                            ? "bg-slate-700 text-slate-300 hover:bg-slate-600"
                            : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                        }`}
                      >
                        <MoreVertical className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Paginación */}
              <div
                className={`px-6 py-4 border-t transition-colors duration-300 ${
                  darkMode
                    ? "bg-slate-800/50 border-white/10"
                    : "bg-slate-50 border-slate-200"
                }`}
              >
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className={`text-sm font-medium ${textMuted}`}>
                    Mostrando {(page - 1) * limit + 1} a{" "}
                    {Math.min(page * limit, total)} de {total} secretarias
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setPage(Math.max(1, page - 1))}
                      disabled={page === 1}
                      className={`px-4 py-2 rounded-lg font-bold transition-all duration-200 ${
                        darkMode
                          ? "bg-slate-700 border-2 border-slate-600 text-slate-300 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed"
                          : "bg-white border-2 border-slate-200 text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      }`}
                    >
                      Anterior
                    </button>
                    <div className="flex gap-1">
                      {Array.from(
                        { length: Math.min(5, totalPages) },
                        (_, i) => {
                          let pageNum;
                          if (totalPages <= 5) {
                            pageNum = i + 1;
                          } else if (page <= 3) {
                            pageNum = i + 1;
                          } else if (page >= totalPages - 2) {
                            pageNum = totalPages - 4 + i;
                          } else {
                            pageNum = page - 2 + i;
                          }
                          return (
                            <button
                              key={i}
                              onClick={() => setPage(pageNum)}
                              className={`w-10 h-10 rounded-lg font-bold transition-all duration-200 ${
                                page === pageNum
                                  ? `bg-gradient-to-r ${theme.primary} text-white shadow-lg transform scale-110`
                                  : darkMode
                                  ? "bg-slate-700 border-2 border-slate-600 text-slate-300 hover:bg-slate-600"
                                  : "bg-white border-2 border-slate-200 text-slate-700 hover:bg-slate-50"
                              }`}
                            >
                              {pageNum}
                            </button>
                          );
                        }
                      )}
                    </div>
                    <button
                      onClick={() =>
                        setPage(Math.min(totalPages, page + 1))
                      }
                      disabled={page === totalPages}
                      className={`px-4 py-2 rounded-lg font-bold transition-all duration-200 ${
                        darkMode
                          ? "bg-slate-700 border-2 border-slate-600 text-slate-300 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed"
                          : "bg-white border-2 border-slate-200 text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      }`}
                    >
                      Siguiente
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
