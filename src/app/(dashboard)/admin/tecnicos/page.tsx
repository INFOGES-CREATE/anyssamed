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
  AlertCircle,
  Clock,
  ArrowLeft,
  Moon,
  Sun,
  X,
  Sparkles,
  Palette,
  CheckCircle,
  Activity,
  TrendingUp,
  Award,
  Zap,
  Shield,
  Flame,
  Crown,
  Wrench,
  MapPin,
} from "lucide-react";

interface Tecnico {
  id_tecnico: number;
  id_usuario: number;
  id_centro: number | null;
  id_sucursal: number | null;
  area_tecnica: string;
  tipo_tecnico: string;
  turno: string;
  hora_inicio: string | null;
  hora_fin: string | null;
  descripcion: string | null;
  nivel_acceso: string;
  extension_telefonica: string | null;
  estado: string; // activo, inactivo, suspendido
  disponibilidad: string; // disponible, ocupado, fuera_servicio
  prioridad: string; // baja, media, alta, critica
  pais: string | null;
  region: string | null;
  zona_horaria: string | null;
  tickets_resueltos: number;
  tiempo_promedio_resolucion: number;
  calificacion_promedio: number;
  supervisor_id: number | null;
  fecha_inicio: string;
  fecha_termino: string | null;
  especialidad_tecnica: string | null;
  certificaciones: string | null;
  fecha_creacion: string;
  fecha_modificacion: string;
  es_global: 0 | 1;
  creado_por: number | null;
  modificado_por: number | null;
  // Campos calculados desde el SELECT
  usuario_nombre: string;
  centro_nombre: string | null;
  sucursal_nombre: string | null;
  supervisor_nombre: string | null;
}

interface EstadisticasTecnicos {
  total_tecnicos: number;
  tecnicos_activos: number;
  tecnicos_inactivos: number;
  tecnicos_suspendidos: number;
  tecnicos_disponibles: number;
  tecnicos_ocupados: number;
  tecnicos_fuera_servicio: number;
  promedio_calificacion: number;
  promedio_tickets_resueltos: number;
  promedio_tiempo_resolucion: number;
}

// ==============================
// 🎨 Temas de color (igual que usuarios)
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

export default function TecnicosPage() {
  const router = useRouter();

  // ==============================
  // 🧠 STATE PRINCIPAL
  // ==============================
  const [tecnicos, setTecnicos] = useState<Tecnico[]>([]);
  const [estadisticas, setEstadisticas] =
    useState<EstadisticasTecnicos | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Filtros
  const [busqueda, setBusqueda] = useState("");
  const [estadoFiltro, setEstadoFiltro] = useState("todos");
  const [disponibilidadFiltro, setDisponibilidadFiltro] = useState("todos");
  const [turnoFiltro, setTurnoFiltro] = useState("todos");
  const [tipoFiltro, setTipoFiltro] = useState("todos");
  const [centroFiltro, setCentroFiltro] = useState("");
  const [ordenar, setOrdenar] = useState("prioridad_desc");

  // Paginación
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  // UI
  const [mostrarFiltros, setMostrarFiltros] = useState(false);
  const [mostrarMenu, setMostrarMenu] = useState<number | null>(null);
  const [mostrarThemeSelector, setMostrarThemeSelector] = useState(false);

  // ==============================
  // 🌗 THEME / UI PREFS
  // ==============================
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

  const changeTheme = (theme: keyof typeof colorThemes) => {
    setSelectedTheme(theme);
    localStorage.setItem("colorTheme", theme);
    setMostrarThemeSelector(false);
  };

  // ==============================
  // 📥 CARGA DE DATOS
  // ==============================
  useEffect(() => {
    cargarTecnicos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    page,
    limit,
    estadoFiltro,
    disponibilidadFiltro,
    turnoFiltro,
    tipoFiltro,
    centroFiltro,
    ordenar,
  ]);

  const cargarTecnicos = async () => {
    try {
      setLoading(true);
      setError("");

      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        estado: estadoFiltro,
        disponibilidad: disponibilidadFiltro,
        turno: turnoFiltro,
        tipo: tipoFiltro,
        centro: centroFiltro,
        busqueda: busqueda,
        ordenar: ordenar,
      });

      const response = await fetch(`/api/admin/tecnicos?${params}`, {
        cache: "no-store",
      });

      const data = await response.json();

      if (data.success) {
        // el API devuelve { tecnicos, data, pagination, estadisticas }
        setTecnicos(data.tecnicos || data.data || []);
        setEstadisticas(data.estadisticas || null);
        setTotalPages(data.pagination?.totalPages || 1);
        setTotal(data.pagination?.total || 0);
      } else {
        setError(data.error || "Error al cargar técnicos");
      }
    } catch (err) {
      console.error(err);
      setError("Error al cargar técnicos");
    } finally {
      setLoading(false);
    }
  };

  const handleBuscar = () => {
    setPage(1);
    cargarTecnicos();
  };

  const handleLimpiarFiltros = () => {
    setBusqueda("");
    setEstadoFiltro("todos");
    setDisponibilidadFiltro("todos");
    setTurnoFiltro("todos");
    setTipoFiltro("todos");
    setCentroFiltro("");
    setOrdenar("prioridad_desc");
    setPage(1);
  };

  // (Opcional) Ir al detalle de técnico
  const irDetalleTecnico = (id_tecnico: number) => {
    router.push(`/admin/tecnicos/${id_tecnico}`);
  };

  const irEditarTecnico = (id_tecnico: number) => {
    router.push(`/admin/tecnicos/${id_tecnico}/editar`);
  };

  // ==============================
  // 🎨 FUNCIONES DE ESTILOS
  // ==============================
  const getEstadoBadge = (estado: string) => {
    const badges = {
      activo: darkMode
        ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
        : "bg-emerald-50 text-emerald-700 border-emerald-200",
      inactivo: darkMode
        ? "bg-slate-500/20 text-slate-300 border-slate-500/30"
        : "bg-slate-50 text-slate-700 border-slate-200",
      suspendido: darkMode
        ? "bg-amber-500/20 text-amber-300 border-amber-500/30"
        : "bg-amber-50 text-amber-700 border-amber-200",
    };
    return badges[estado as keyof typeof badges] || badges.inactivo;
  };

  const getDisponibilidadBadge = (disp: string) => {
    const badges = {
      disponible: darkMode
        ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
        : "bg-emerald-50 text-emerald-700 border-emerald-200",
      ocupado: darkMode
        ? "bg-blue-500/20 text-blue-300 border-blue-500/30"
        : "bg-blue-50 text-blue-700 border-blue-200",
      fuera_servicio: darkMode
        ? "bg-rose-500/20 text-rose-300 border-rose-500/30"
        : "bg-rose-50 text-rose-700 border-rose-200",
    };
    return badges[disp as keyof typeof badges] || badges.ocupado;
  };

  const getPrioridadBadge = (prioridad: string) => {
    const badges = {
      critica: darkMode
        ? "bg-red-600/30 text-red-200 border-red-500/40"
        : "bg-red-50 text-red-700 border-red-200",
      alta: darkMode
        ? "bg-orange-500/25 text-orange-200 border-orange-500/40"
        : "bg-orange-50 text-orange-700 border-orange-200",
      media: darkMode
        ? "bg-amber-500/25 text-amber-200 border-amber-500/40"
        : "bg-amber-50 text-amber-700 border-amber-200",
      baja: darkMode
        ? "bg-slate-500/20 text-slate-200 border-slate-500/40"
        : "bg-slate-50 text-slate-700 border-slate-200",
    };
    return badges[prioridad as keyof typeof badges] || badges.media;
  };

  const getTipoTecnicoBadge = (tipo: string) => {
    const badges: Record<string, string> = {
      soporte: darkMode
        ? "bg-sky-500/20 text-sky-300 border-sky-500/30"
        : "bg-sky-50 text-sky-700 border-sky-200",
      mantenimiento: darkMode
        ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
        : "bg-emerald-50 text-emerald-700 border-emerald-200",
      ingenieria: darkMode
        ? "bg-indigo-500/20 text-indigo-300 border-indigo-500/30"
        : "bg-indigo-50 text-indigo-700 border-indigo-200",
      biomedico: darkMode
        ? "bg-pink-500/20 text-pink-300 border-pink-500/30"
        : "bg-pink-50 text-pink-700 border-pink-200",
      sistemas: darkMode
        ? "bg-purple-500/20 text-purple-300 border-purple-500/30"
        : "bg-purple-50 text-purple-700 border-purple-200",
      infraestructura: darkMode
        ? "bg-teal-500/20 text-teal-300 border-teal-500/30"
        : "bg-teal-50 text-teal-700 border-teal-200",
    };
    return badges[tipo] || badges.soporte;
  };

  // ==============================
  // ⏳ LOADING PREMIUM
  // ==============================
  if (loading && tecnicos.length === 0) {
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
              className={`w-20 h-20 border-4 ${borderColor} border-t-transparent rounded-full animate-spin mx-auto mb-6`}
            ></div>
            <div
              className={`absolute inset-0 w-20 h-20 border-4 border-transparent border-t-current rounded-full animate-spin mx-auto bg-gradient-to-r ${theme.primary} bg-clip-text text-transparent`}
              style={{ animationDirection: "reverse", animationDuration: "1s" }}
            ></div>
          </div>

          <div className="relative z-10">
            <h3
              className={`text-2xl font-black ${textPrimary} mb-2 flex items-center gap-2 justify-center`}
            >
              <Sparkles className="w-6 h-6 animate-pulse" />
              Cargando Técnicos
            </h3>
            <p className={`${textSecondary} font-medium animate-pulse`}>
              Optimizando la red de soporte técnico...
            </p>
          </div>

          <div className="mt-12 space-y-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className={`h-2 rounded-full ${
                  darkMode ? "bg-white/5" : "bg-slate-200/50"
                } animate-pulse`}
                style={{
                  width: `${100 - i * 15}%`,
                  margin: "0 auto",
                  animationDelay: `${i * 0.2}s`,
                }}
              ></div>
            ))}
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
      {/* Fondos */}
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
        {/* CONTROLES FLOTANTES */}
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

        {/* HEADER */}
        <div
          className={`${cardBg} rounded-3xl shadow-2xl border ${borderColor} overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500`}
        >
          <div className={`h-2 bg-gradient-to-r ${theme.primary}`}></div>

          <div className="p-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              {/* Info */}
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

                <div className="relative group">
                  <div
                    className={`absolute -inset-1 bg-gradient-to-r ${theme.primary} rounded-2xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity`}
                  ></div>
                  <div
                    className={`relative w-20 h-20 rounded-2xl bg-gradient-to-br ${theme.primary} flex items-center justify-center border-2 ${
                      darkMode ? "border-slate-700" : "border-white"
                    } shadow-xl`}
                  >
                    <Wrench className="w-10 h-10 text-white" />
                  </div>
                </div>

                <div>
                  <h1 className={`text-3xl font-black ${textPrimary}`}>
                    Gestión de Técnicos
                  </h1>
                  <p className={`${textSecondary} font-medium mt-1`}>
                    Administra el personal técnico y su capacidad operativa
                  </p>
                </div>
              </div>

              {/* Acciones */}
              <div className="flex gap-3 flex-wrap">
                <button
                  onClick={() => router.push("/admin/tecnicos/nuevo")}
                  className={`flex items-center gap-2 px-6 py-3 bg-gradient-to-r ${theme.primary} text-white rounded-xl shadow-lg ${theme.glow} hover:shadow-2xl transition-all duration-300 font-bold group hover:scale-105`}
                >
                  <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
                  <span>Nuevo Técnico</span>
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

        {/* ESTADÍSTICAS */}
        {estadisticas && (
          <div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500"
            style={{ animationDelay: "100ms" }}
          >
            {/* Total técnicos */}
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
                  Total Técnicos
                </p>
                <p className={`text-3xl font-black ${textPrimary}`}>
                  {estadisticas.total_tecnicos}
                </p>
              </div>
            </div>

            {/* Activos / Disponibles */}
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
                    <Shield className="w-6 h-6 text-white" />
                  </div>
                  <div
                    className={`text-xs font-black px-2 py-1 rounded-full ${
                      darkMode
                        ? "bg-emerald-500/20 text-emerald-300"
                        : "bg-emerald-100 text-emerald-700"
                    }`}
                  >
                    {estadisticas.total_tecnicos > 0
                      ? (
                          (estadisticas.tecnicos_disponibles /
                            estadisticas.total_tecnicos) *
                          100
                        ).toFixed(0)
                      : 0}
                    % disponibles
                  </div>
                </div>
                <p
                  className={`${textMuted} text-sm font-bold uppercase tracking-wider mb-1`}
                >
                  Activos / Disponibles
                </p>
                <p className={`text-lg font-bold ${textPrimary}`}>
                  {estadisticas.tecnicos_activos} activos ·{" "}
                  {estadisticas.tecnicos_disponibles} disponibles
                </p>
              </div>
            </div>

            {/* Calificación */}
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
                    <Award className="w-6 h-6 text-white" />
                  </div>
                  <Zap className={`w-5 h-5 ${textSecondary}`} />
                </div>
                <p
                  className={`${textMuted} text-sm font-bold uppercase tracking-wider mb-1`}
                >
                  Calificación Promedio
                </p>
                <p className={`text-3xl font-black ${textPrimary}`}>
                    {Number(estadisticas.promedio_calificacion ?? 0).toFixed(2)}
                </p>
              </div>
            </div>

            {/* Tickets / SLA */}
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
                    <Activity className="w-6 h-6 text-white" />
                  </div>
                  <Clock className={`w-5 h-5 ${textSecondary}`} />
                </div>
                <p
                  className={`${textMuted} text-sm font-bold uppercase tracking-wider mb-1`}
                >
                  Performance Promedio
                </p>
                <p className={`text-lg font-bold ${textPrimary}`}>
{Number(estadisticas.promedio_tickets_resueltos ?? 0).toFixed(1)}
                  tickets ·{" "}
{Number(estadisticas.promedio_tiempo_resolucion ?? 0).toFixed(1)}{" "}
                  min
                </p>
              </div>
            </div>
          </div>
        )}

        {/* FILTROS / BÚSQUEDA */}
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
                  placeholder="Buscar por técnico, área, centro, región..."
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
                    <option value="todos">Todos</option>
                    <option value="activo">Activos</option>
                    <option value="inactivo">Inactivos</option>
                    <option value="suspendido">Suspendidos</option>
                  </select>
                </div>

                {/* Disponibilidad */}
                <div className="space-y-2">
                  <label
                    className={`block text-sm font-black ${textMuted} uppercase tracking-wider`}
                  >
                    Disponibilidad
                  </label>
                  <select
                    value={disponibilidadFiltro}
                    onChange={(e) => setDisponibilidadFiltro(e.target.value)}
                    className={`w-full px-4 py-3 rounded-xl font-medium transition-all duration-300 ${inputBg} border-2 ${
                      darkMode
                        ? "border-white/10 focus:border-blue-500/50"
                        : "border-slate-200 focus:border-blue-500"
                    } ${textPrimary} focus:ring-4 focus:ring-blue-500/20 cursor-pointer hover:border-blue-500/50`}
                  >
                    <option value="todos">Todas</option>
                    <option value="disponible">Disponibles</option>
                    <option value="ocupado">Ocupados</option>
                    <option value="fuera_servicio">Fuera de servicio</option>
                  </select>
                </div>

                {/* Tipo técnico */}
                <div className="space-y-2">
                  <label
                    className={`block text-sm font-black ${textMuted} uppercase tracking-wider`}
                  >
                    Tipo de Técnico
                  </label>
                  <select
                    value={tipoFiltro}
                    onChange={(e) => setTipoFiltro(e.target.value)}
                    className={`w-full px-4 py-3 rounded-xl font-medium transition-all duration-300 ${inputBg} border-2 ${
                      darkMode
                        ? "border-white/10 focus:border-blue-500/50"
                        : "border-slate-200 focus:border-blue-500"
                    } ${textPrimary} focus:ring-4 focus:ring-blue-500/20 cursor-pointer hover:border-blue-500/50`}
                  >
                    <option value="todos">Todos</option>
                    <option value="soporte">Soporte</option>
                    <option value="mantenimiento">Mantenimiento</option>
                    <option value="ingenieria">Ingeniería</option>
                    <option value="biomedico">Biomédico</option>
                    <option value="sistemas">Sistemas</option>
                    <option value="infraestructura">Infraestructura</option>
                  </select>
                </div>

                {/* Turno */}
                <div className="space-y-2">
                  <label
                    className={`block text-sm font-black ${textMuted} uppercase tracking-wider`}
                  >
                    Turno
                  </label>
                  <select
                    value={turnoFiltro}
                    onChange={(e) => setTurnoFiltro(e.target.value)}
                    className={`w-full px-4 py-3 rounded-xl font-medium transition-all duration-300 ${inputBg} border-2 ${
                      darkMode
                        ? "border-white/10 focus:border-blue-500/50"
                        : "border-slate-200 focus:border-blue-500"
                    } ${textPrimary} focus:ring-4 focus:ring-blue-500/20 cursor-pointer hover:border-blue-500/50`}
                  >
                    <option value="todos">Todos</option>
                    <option value="manana">Mañana</option>
                    <option value="tarde">Tarde</option>
                    <option value="noche">Noche</option>
                    <option value="completo">Jornada Completa</option>
                  </select>
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
                    <option value="prioridad_desc">
                      Prioridad (alta a baja)
                    </option>
                    <option value="prioridad_asc">
                      Prioridad (baja a alta)
                    </option>
                    <option value="nombre_asc">Nombre A-Z</option>
                    <option value="nombre_desc">Nombre Z-A</option>
                    <option value="calificacion_desc">
                      Mejor calificación
                    </option>
                    <option value="calificacion_asc">
                      Menor calificación
                    </option>
                    <option value="tickets_desc">
                      Más tickets resueltos
                    </option>
                    <option value="tickets_asc">
                      Menos tickets resueltos
                    </option>
                    <option value="fecha_inicio_desc">
                      Más recientes en el cargo
                    </option>
                    <option value="fecha_inicio_asc">
                      Más antiguos en el cargo
                    </option>
                  </select>
                </div>
              </div>

              <div className="mt-4 flex justify-end">
                <button
                  onClick={handleLimpiarFiltros}
                  className={`px-4 py-3 rounded-xl transition-all duration-300 font-bold ${
                    darkMode
                      ? "bg-slate-800/50 text-slate-300 hover:bg-slate-800"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  } border ${borderColor} hover:scale-105`}
                >
                  Limpiar Filtros
                </button>
              </div>
            </div>
          )}
        </div>

        {/* TABLA DE TÉCNICOS */}
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
                  <Wrench className={`w-8 h-8 ${textSecondary}`} />
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
          ) : tecnicos.length === 0 ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <Wrench className={`w-16 h-16 ${textMuted} mx-auto mb-4`} />
                <p className={`font-bold text-lg ${textSecondary}`}>
                  No se encontraron técnicos
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
                        Técnico
                      </th>
                      <th
                        className={`px-6 py-4 text-left text-xs font-black uppercase tracking-wider ${textMuted}`}
                      >
                        Centro / Ubicación
                      </th>
                      <th
                        className={`px-6 py-4 text-left text-xs font-black uppercase tracking-wider ${textMuted}`}
                      >
                        Tipo / Turno
                      </th>
                      <th
                        className={`px-6 py-4 text-left text-xs font-black uppercase tracking-wider ${textMuted}`}
                      >
                        Estado / Disponibilidad
                      </th>
                      <th
                        className={`px-6 py-4 text-left text-xs font-black uppercase tracking-wider ${textMuted}`}
                      >
                        Prioridad / Supervisor
                      </th>
                      <th
                        className={`px-6 py-4 text-left text-xs font-black uppercase tracking-wider ${textMuted}`}
                      >
                        Performance
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
                    {tecnicos.map((tec) => (
                      <tr
                        key={tec.id_tecnico}
                        className={`transition-colors duration-200 ${
                          darkMode ? "hover:bg-white/5" : "hover:bg-slate-50"
                        }`}
                      >
                        {/* Técnico */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-10 h-10 rounded-full bg-gradient-to-br ${theme.primary} flex items-center justify-center text-white font-bold shadow-lg transform hover:scale-110 transition-transform duration-200`}
                            >
                              {tec.usuario_nombre
                                ?.split(" ")
                                .map((p) => p[0])
                                .join("")
                                .slice(0, 2)
                                .toUpperCase() || "T"}
                            </div>
                            <div>
                              <div className={`font-bold ${textPrimary}`}>
                                {tec.usuario_nombre}
                              </div>
                              <div
                                className={`text-xs uppercase tracking-wide ${textMuted} font-semibold`}
                              >
                                {tec.area_tecnica}
                                {tec.especialidad_tecnica
                                  ? ` · ${tec.especialidad_tecnica}`
                                  : ""}
                              </div>
                              <div className={`text-xs ${textMuted}`}>
                                Desde {tec.fecha_inicio}
                                {tec.es_global ? " · Técnico Global" : ""}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Centro / Ubicación */}
                        <td className="px-6 py-4">
                          <div className="text-sm">
                            <div className={`font-medium ${textSecondary}`}>
                              {tec.centro_nombre || "Sin centro"}
                            </div>
                            <div className={`flex items-center gap-1 ${textMuted}`}>
                              <MapPin className="w-3 h-3" />
                              <span>
                                {tec.sucursal_nombre || "Sin sucursal"}{" "}
                                {tec.region ? ` · ${tec.region}` : ""}{" "}
                                {tec.pais ? ` · ${tec.pais}` : ""}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Tipo / Turno */}
                        <td className="px-6 py-4">
                          <div className="flex flex-col gap-2">
                            <span
                              className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold border ${getTipoTecnicoBadge(
                                tec.tipo_tecnico
                              )}`}
                            >
                              {tec.tipo_tecnico}
                            </span>
                            <span
                              className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold ${
                                darkMode
                                  ? "bg-slate-700 text-slate-200 border border-slate-600"
                                  : "bg-slate-50 text-slate-700 border border-slate-200"
                              }`}
                            >
                              Turno: {tec.turno}
                              {tec.hora_inicio && tec.hora_fin
                                ? ` (${tec.hora_inicio} - ${tec.hora_fin})`
                                : ""}
                            </span>
                          </div>
                        </td>

                        {/* Estado / Disponibilidad */}
                        <td className="px-6 py-4">
                          <div className="flex flex-col gap-2">
                            <span
                              className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold border ${getEstadoBadge(
                                tec.estado
                              )}`}
                            >
                              {tec.estado}
                            </span>
                            <span
                              className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold border ${getDisponibilidadBadge(
                                tec.disponibilidad
                              )}`}
                            >
                              {tec.disponibilidad}
                            </span>
                          </div>
                        </td>

                        {/* Prioridad / Supervisor */}
                        <td className="px-6 py-4">
                          <div className="flex flex-col gap-2">
                            <span
                              className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold border ${getPrioridadBadge(
                                tec.prioridad
                              )}`}
                            >
                              {tec.prioridad === "critica" && (
                                <Flame className="w-3 h-3 mr-1" />
                              )}
                              {tec.prioridad === "alta" && (
                                <Crown className="w-3 h-3 mr-1" />
                              )}
                              {tec.prioridad}
                            </span>
                            <span className={`text-xs ${textMuted}`}>
                              Supervisor:{" "}
                              {tec.supervisor_nombre || "No asignado"}
                            </span>
                          </div>
                        </td>

                        {/* Performance */}
                        <td className="px-6 py-4">
                          <div className="text-sm">
                            <div className={`font-medium ${textSecondary}`}>
                              {tec.tickets_resueltos} tickets resueltos
                            </div>
                            <div className={`text-xs ${textMuted}`}>
                              T. prom: {tec.tiempo_promedio_resolucion} min
                            </div>
                            <div className="flex items-center gap-1 text-xs mt-1">
                              <Award className="w-3 h-3 text-yellow-400" />
                              <span className={textMuted}>
                                Rating:{" "}
                                {Number(tec.calificacion_promedio || 0).toFixed(
                                  2
                                )}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Acciones */}
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => irDetalleTecnico(tec.id_tecnico)}
                              className={`p-2 rounded-lg transition-all duration-200 ${
                                darkMode
                                  ? "text-blue-400 hover:bg-blue-500/20"
                                  : "text-blue-600 hover:bg-blue-50"
                              }`}
                              title="Ver detalle"
                            >
                              <Eye className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => irEditarTecnico(tec.id_tecnico)}
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
                                    mostrarMenu === tec.id_tecnico
                                      ? null
                                      : tec.id_tecnico
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

                              {mostrarMenu === tec.id_tecnico && (
                                <div
                                  className={`absolute right-0 mt-2 w-56 rounded-xl shadow-2xl border py-2 z-50 ${
                                    darkMode
                                      ? "bg-slate-800 border-slate-700"
                                      : "bg-white border-slate-200"
                                  }`}
                                >
                                  <button
                                    onClick={() => {
                                      router.push(
                                        `/admin/usuarios/${tec.id_usuario}`
                                      );
                                      setMostrarMenu(null);
                                    }}
                                    className={`w-full px-4 py-2.5 text-left text-sm font-medium flex items-center gap-3 transition-colors ${
                                      darkMode
                                        ? "text-slate-300 hover:bg-slate-700"
                                        : "text-slate-700 hover:bg-slate-50"
                                    }`}
                                  >
                                    <Users className="w-4 h-4" />
                                    Ver Usuario Asociado
                                  </button>
                                  {/* Aquí después puedes agregar acciones específicas
                                      como cambiar estado del técnico, etc., cuando
                                      tengas los endpoints correspondientes */}
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
                {tecnicos.map((tec) => (
                  <div
                    key={tec.id_tecnico}
                    className={`p-4 transition-colors duration-200 ${
                      darkMode ? "hover:bg-white/5" : "hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-start gap-3 mb-3">
                      <div
                        className={`w-14 h-14 rounded-full bg-gradient-to-br ${theme.primary} flex items-center justify-center text-white font-bold shadow-lg flex-shrink-0 transform hover:scale-110 transition-transform duration-200`}
                      >
                        {tec.usuario_nombre
                          ?.split(" ")
                          .map((p) => p[0])
                          .join("")
                          .slice(0, 2)
                          .toUpperCase() || "T"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3
                          className={`font-bold text-lg truncate ${textPrimary}`}
                        >
                          {tec.usuario_nombre}
                        </h3>
                        <p className={`text-sm ${textMuted}`}>
                          {tec.area_tecnica}
                          {tec.especialidad_tecnica
                            ? ` · ${tec.especialidad_tecnica}`
                            : ""}
                        </p>
                        <p className={`text-xs ${textMuted} mt-1`}>
                          {tec.centro_nombre || "Sin centro"} ·{" "}
                          {tec.region || "Sin región"}
                        </p>
                        <div className="flex flex-wrap gap-2 mt-2">
                          <span
                            className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${getEstadoBadge(
                              tec.estado
                            )}`}
                          >
                            {tec.estado}
                          </span>
                          <span
                            className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${getDisponibilidadBadge(
                              tec.disponibilidad
                            )}`}
                          >
                            {tec.disponibilidad}
                          </span>
                          <span
                            className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${getTipoTecnicoBadge(
                              tec.tipo_tecnico
                            )}`}
                          >
                            {tec.tipo_tecnico}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-3">
                      <button
                        onClick={() => irDetalleTecnico(tec.id_tecnico)}
                        className={`flex-1 px-3 py-2.5 rounded-lg text-sm font-bold transition-colors ${
                          darkMode
                            ? "bg-blue-500/20 text-blue-400 hover:bg-blue-500/30"
                            : "bg-blue-50 text-blue-600 hover:bg-blue-100"
                        }`}
                      >
                        Ver
                      </button>
                      <button
                        onClick={() => irEditarTecnico(tec.id_tecnico)}
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
                            mostrarMenu === tec.id_tecnico ? null : tec.id_tecnico
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
                    {Math.min(page * limit, total)} de {total} técnicos
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
                      onClick={() => setPage(Math.min(totalPages, page + 1))}
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
