"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import {
  Wrench,
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Building2,
  Shield,
  Activity,
  Clock,
  Edit,
  Trash2,
  ArrowLeft,
  CheckCircle,
  XCircle,
  AlertCircle,
  Flame,
  Crown,
  Star,
  Award,
  TrendingUp,
  Download,
  Sparkles,
  Moon,
  Sun,
  Palette,
  FileText, // 👈🔥 FALTA ESTE
} from "lucide-react";


// ==============================
// 🔍 INTERFACES
// ==============================
interface UltimoTicket {
  id_ticket: number;
  codigo: string;
  titulo: string;
  estado: string;
  prioridad: "baja" | "media" | "alta" | "critica" | string;
  fecha_apertura: string;
  fecha_cierre: string | null;
  centro: string | null;
  sucursal: string | null;
}

interface EstadisticasTecnicoDetalle {
  tickets_totales: number;
  tickets_mes: number;
  tickets_hoy: number;
  tickets_criticos: number;
  sla_cumplido: number;
  sla_incumplido: number;
  promedio_tiempo_resolucion: number;
  promedio_calificacion: number;
}

interface TecnicoDetalle {
  id_tecnico: number;
  id_usuario: number;
  id_centro: number | null;
  id_sucursal: number | null;

  area_tecnica: string;
  tipo_tecnico:
    | "soporte"
    | "mantenimiento"
    | "ingenieria"
    | "biomedico"
    | "sistemas"
    | "infraestructura"
    | string;
  turno: "manana" | "tarde" | "noche" | "completo" | string;
  hora_inicio: string | null;
  hora_fin: string | null;
  descripcion: string | null;
  nivel_acceso: "basico" | "intermedio" | "avanzado" | "administrador" | string;
  extension_telefonica: string | null;
  estado: "activo" | "inactivo" | "suspendido" | string;
  disponibilidad: "disponible" | "ocupado" | "fuera_servicio" | string;
  prioridad: "baja" | "media" | "alta" | "critica" | string;

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

  // Campos derivados / joins
  usuario_nombre: string;
  usuario_email: string | null;
  usuario_telefono: string | null;
  usuario_celular: string | null;

  centro_nombre: string | null;
  centro_direccion: string | null;
  centro_telefono: string | null;
  centro_email: string | null;

  sucursal_nombre: string | null;
  sucursal_direccion: string | null;

  supervisor_nombre: string | null;

  estadisticas?: EstadisticasTecnicoDetalle;
  ultimos_tickets?: UltimoTicket[];
}

// ==============================
// 🎨 Temas Premium Mejorados (igual que usuarios)
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

type TabId = "general" | "organizacion" | "performance" | "actividad";

export default function DetalleTecnicoPage() {
  const router = useRouter();
  const params = useParams() as { id: string };

  const [tecnico, setTecnico] = useState<TecnicoDetalle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [activeTab, setActiveTab] = useState<TabId>("general");

  const [darkMode, setDarkMode] = useState(false);
  const [showThemeSelector, setShowThemeSelector] = useState(false);
  const [selectedTheme, setSelectedTheme] =
    useState<keyof typeof colorThemes>("aurora");

  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const [banner, setBanner] = useState<
    { type: "success" | "error"; msg: string } | null
  >(null);

  // ====== THEME PERSIST ======
  useEffect(() => {
    const savedDarkMode = localStorage.getItem("darkMode") === "true";
    const savedTheme =
      (localStorage.getItem("colorTheme") as keyof typeof colorThemes) ||
      "aurora";
    setDarkMode(savedDarkMode);
    if (savedTheme && colorThemes[savedTheme]) setSelectedTheme(savedTheme);
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
    setShowThemeSelector(false);
  };

  const setOk = (msg: string) => setBanner({ type: "success", msg });
  const setErr = (msg: string) => setBanner({ type: "error", msg });

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

  // ==========================
  // 📥 CARGA DE DATOS
  // ==========================
  const cargarTecnico = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await fetch(`/api/admin/tecnicos/${params.id}`);
      const data = await res.json();
      if (data.success) {
        setTecnico(data.data as TecnicoDetalle);
      } else {
        setError(data.error || "Error al cargar técnico");
      }
    } catch (e) {
      console.error(e);
      setError("Error al cargar técnico");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (params?.id) {
      cargarTecnico();
    }
  }, [params.id]);

  // ==========================
  // 🏷 HELPERS
  // ==========================
  const getEstadoBadge = (estado: string) => {
    const map: Record<
      string,
      {
        bg: string;
        text: string;
        Icon: typeof CheckCircle | typeof XCircle | typeof AlertCircle;
        label: string;
      }
    > = {
      activo: {
        bg: darkMode
          ? "bg-emerald-500/20 border-emerald-500/30"
          : "bg-emerald-50 border-emerald-200",
        text: darkMode ? "text-emerald-300" : "text-emerald-700",
        Icon: CheckCircle,
        label: "Activo",
      },
      inactivo: {
        bg: darkMode
          ? "bg-slate-500/20 border-slate-500/30"
          : "bg-slate-50 border-slate-200",
        text: darkMode ? "text-slate-300" : "text-slate-700",
        Icon: XCircle,
        label: "Inactivo",
      },
      suspendido: {
        bg: darkMode
          ? "bg-amber-500/20 border-amber-500/30"
          : "bg-amber-50 border-amber-200",
        text: darkMode ? "text-amber-300" : "text-amber-700",
        Icon: AlertCircle,
        label: "Suspendido",
      },
    };

    const badge = map[estado] || map.inactivo;
    const Icon = badge.Icon;

    return (
      <span
        className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl font-black border-2 ${badge.bg} ${badge.text} shadow-lg uppercase text-xs tracking-wider`}
      >
        <Icon className="w-4 h-4" />
        {badge.label}
      </span>
    );
  };

  const getDisponibilidadBadge = (disp: string) => {
    const map: Record<string, { label: string; cls: string }> = {
      disponible: {
        label: "Disponible",
        cls: darkMode
          ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
          : "bg-emerald-50 text-emerald-700 border-emerald-200",
      },
      ocupado: {
        label: "Ocupado",
        cls: darkMode
          ? "bg-blue-500/20 text-blue-300 border-blue-500/40"
          : "bg-blue-50 text-blue-700 border-blue-200",
      },
      fuera_servicio: {
        label: "Fuera de servicio",
        cls: darkMode
          ? "bg-rose-500/20 text-rose-300 border-rose-500/40"
          : "bg-rose-50 text-rose-700 border-rose-200",
      },
    };

    const badge = map[disp] || map.ocupado;

    return (
      <span
        className={`inline-flex items-center px-4 py-2 rounded-xl text-xs font-black border ${badge.cls}`}
      >
        {badge.label}
      </span>
    );
  };

  const getPrioridadBadge = (prioridad: string) => {
    const base =
      "inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold border";
    if (prioridad === "critica") {
      return (
        <span
          className={`${base} ${
            darkMode
              ? "bg-red-600/30 text-red-200 border-red-500/40"
              : "bg-red-50 text-red-700 border-red-200"
          }`}
        >
          <Flame className="w-3 h-3 mr-1" />
          Crítica
        </span>
      );
    }
    if (prioridad === "alta") {
      return (
        <span
          className={`${base} ${
            darkMode
              ? "bg-orange-500/25 text-orange-200 border-orange-500/40"
              : "bg-orange-50 text-orange-700 border-orange-200"
          }`}
        >
          <Crown className="w-3 h-3 mr-1" />
          Alta
        </span>
      );
    }
    if (prioridad === "media") {
      return (
        <span
          className={`${base} ${
            darkMode
              ? "bg-amber-500/25 text-amber-200 border-amber-500/40"
              : "bg-amber-50 text-amber-700 border-amber-200"
          }`}
        >
          Media
        </span>
      );
    }
    return (
      <span
        className={`${base} ${
          darkMode
            ? "bg-slate-500/20 text-slate-200 border-slate-500/40"
            : "bg-slate-50 text-slate-700 border-slate-200"
        }`}
      >
        Baja
      </span>
    );
  };

  const formatFecha = (fecha?: string | null) => {
    if (!fecha) return "N/A";
    const d = new Date(fecha);
    if (Number.isNaN(d.getTime())) return fecha;
    return d.toLocaleDateString("es-CL", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatFechaCorta = (fecha?: string | null) => {
    if (!fecha) return "N/A";
    const d = new Date(fecha);
    if (Number.isNaN(d.getTime())) return fecha;
    return d.toLocaleDateString("es-CL", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatHora = (hora?: string | null) => {
    if (!hora) return "N/A";
    // asume HH:MM:SS
    return hora.substring(0, 5);
  };

  const downloadFromResponse = async (
    res: Response,
    fallbackName: string
  ) => {
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;

    const dispo = res.headers.get("Content-Disposition") || "";
    const match = dispo.match(/filename="(.+)"/);
    const filename = match ? match[1] : fallbackName;

    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportTecnico = async () => {
    try {
      setActionLoading("export");
      const res = await fetch(`/api/admin/tecnicos/${params.id}/export`);
      if (!res.ok) throw new Error();
      await downloadFromResponse(res, `tecnico_${params.id}.json`);
      setOk("Ficha del técnico exportada");
    } catch {
      setErr("Error al exportar ficha del técnico");
    } finally {
      setActionLoading(null);
    }
  };

  const handleEliminar = async () => {
    try {
      setDeleting(true);
      const res = await fetch(`/api/admin/tecnicos/${params.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        router.push("/admin/tecnicos?deleted=true");
      } else {
        setErr(data.error || "Error al eliminar técnico");
        setShowDeleteModal(false);
      }
    } catch {
      setErr("Error al eliminar técnico");
      setShowDeleteModal(false);
    } finally {
      setDeleting(false);
    }
  };

  const tabs: Array<{
    id: TabId;
    label: string;
    icon: any;
    color: string;
  }> = [
    { id: "general", label: "General", icon: Wrench, color: "text-sky-500" },
    {
      id: "organizacion",
      label: "Organización",
      icon: Building2,
      color: "text-emerald-500",
    },
    {
      id: "performance",
      label: "Performance",
      icon: Activity,
      color: "text-amber-500",
    },
    {
      id: "actividad",
      label: "Actividad",
      icon: Clock,
      color: "text-purple-500",
    },
  ];

  // ==========================
  // LOADING PREMIUM
  // ==========================
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
              className={`w-20 h-20 border-4 ${borderColor} border-t-transparent rounded-full animate-spin mx-auto mb-6`}
            ></div>
            <div
              className={`absolute inset-0 w-20 h-20 border-4 border-transparent border-t-current rounded-full animate-spin mx-auto bg-gradient-to-r ${theme.primary} bg-clip-text text-transparent`}
              style={{
                animationDirection: "reverse",
                animationDuration: "1s",
              }}
            ></div>
          </div>

          <div className="relative z-10">
            <h3
              className={`text-2xl font-black ${textPrimary} mb-2 flex items-center gap-2 justify-center`}
            >
              <Sparkles className="w-6 h-6 animate-pulse" />
              Cargando Técnico
            </h3>
            <p className={`${textSecondary} font-medium animate-pulse`}>
              Preparando el perfil técnico...
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

  // ==========================
  // ERROR STATE
  // ==========================
  if (error || !tecnico) {
    return (
      <div
        className={`min-h-screen ${bgClass} p-4 md:p-6 lg:p-8 transition-colors duration-300`}
      >
        <div className="max-w-4xl mx-auto">
          <div
            className={`${cardBg} border-2 ${
              darkMode ? "border-red-500/30" : "border-red-200"
            } rounded-3xl p-12 text-center shadow-2xl`}
          >
            <div className="relative mb-6">
              <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-pink-500 blur-3xl opacity-20"></div>
              <AlertCircle className="relative w-24 h-24 text-red-500 mx-auto" />
            </div>
            <h2 className={`text-4xl font-black ${textPrimary} mb-4`}>
              Error
            </h2>
            <p className={`${textSecondary} mb-8 text-lg`}>
              {error || "Técnico no encontrado"}
            </p>
            <button
              onClick={() => router.back()}
              className={`px-8 py-4 bg-gradient-to-r ${theme.primary} text-white rounded-2xl hover:shadow-2xl ${theme.glow} transition-all duration-300 font-bold text-lg hover:scale-105`}
            >
              Volver
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ==========================
  // RENDER PRINCIPAL
  // ==========================
  const iniciales =
    tecnico.usuario_nombre
      ?.split(" ")
      .map((p) => p[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "T";

  const estad = tecnico.estadisticas;

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
        {/* CONTROLES FLOTANTES */}
        <div className="fixed top-6 right-6 z-50 flex flex-col gap-3">
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

          <div className="relative">
            <button
              onClick={() => setShowThemeSelector(!showThemeSelector)}
              className={`p-3 ${cardBg} shadow-2xl ${theme.glow} rounded-2xl border ${borderColor} transition-all duration-300 hover:scale-110 group`}
              title="Cambiar Tema"
            >
              <Palette
                className={`w-5 h-5 bg-gradient-to-r ${theme.primary} bg-clip-text text-transparent group-hover:rotate-12 transition-transform duration-300`}
              />
            </button>

            {showThemeSelector && (
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

        {/* BANNER */}
        {banner && (
          <div
            className={`rounded-2xl p-4 border-2 shadow-2xl animate-in slide-in-from-top-4 duration-300 ${
              banner.type === "success"
                ? "bg-gradient-to-r from-emerald-500/10 to-green-500/10 border-emerald-500/50 text-emerald-700 dark:text-emerald-300"
                : "bg-gradient-to-r from-rose-500/10 to-red-500/10 border-rose-500/50 text-rose-700 dark:text-rose-300"
            }`}
          >
            <div className="flex items-center gap-3">
              {banner.type === "success" ? (
                <CheckCircle className="w-5 h-5 flex-shrink-0" />
              ) : (
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
              )}
              <span className="font-bold">{banner.msg}</span>
            </div>
          </div>
        )}

        {/* HEADER PREMIUM TÉCNICO */}
        <div
          className={`${cardBg} rounded-3xl shadow-2xl border ${borderColor} overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500`}
        >
          <div className={`h-2 bg-gradient-to-r ${theme.primary}`}></div>

          <div className="p-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              {/* Info Principal */}
              <div className="flex items-center gap-6">
                <button
                  onClick={() => router.push("/admin/tecnicos")}
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
                    className={`relative w-24 h-24 rounded-2xl bg-gradient-to-br ${theme.primary} flex items-center justify-center border-2 ${
                      darkMode ? "border-slate-700" : "border-white"
                    } shadow-xl`}
                  >
                    <span className="text-3xl font-black text-white">
                      {iniciales}
                    </span>
                  </div>

                  {/* Pulso disponible si está disponible */}
                  {tecnico.disponibilidad === "disponible" && (
                    <div className="absolute -top-2 -right-2">
                      <div className="relative">
                        <div className="absolute inset-0 bg-emerald-500 rounded-full animate-ping opacity-75"></div>
                        <div
                          className={`relative w-4 h-4 bg-emerald-500 rounded-full border-2 ${
                            darkMode ? "border-slate-800" : "border-white"
                          }`}
                        ></div>
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <div className="flex flex-wrap items-center gap-3 mb-2">
                    <h1 className={`text-3xl font-black ${textPrimary}`}>
                      {tecnico.usuario_nombre}
                    </h1>
                    {getEstadoBadge(tecnico.estado)}
                    {getDisponibilidadBadge(tecnico.disponibilidad)}
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-sm mb-3">
                    <span
                      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-black border-2 shadow-lg transition-all duration-300 ${
                        darkMode
                          ? "bg-sky-500/20 border-sky-500/40 text-sky-200"
                          : "bg-sky-50 border-sky-200 text-sky-700"
                      }`}
                    >
                      <Wrench className="w-3.5 h-3.5" />
                      {tecnico.area_tecnica}
                    </span>
                    <span
                      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-black border-2 shadow-lg transition-all duration-300 ${
                        darkMode
                          ? "bg-purple-500/20 border-purple-500/40 text-purple-200"
                          : "bg-purple-50 border-purple-200 text-purple-700"
                      }`}
                    >
                      <Shield className="w-3.5 h-3.5" />
                      {tecnico.tipo_tecnico}
                    </span>
                    {getPrioridadBadge(tecnico.prioridad)}
                  </div>

                  <div className="flex flex-wrap gap-4 text-sm">
                    {tecnico.usuario_email && (
                      <div
                        className={`flex items-center gap-2 ${textSecondary} font-medium`}
                      >
                        <Mail className="w-4 h-4" />
                        <span>{tecnico.usuario_email}</span>
                      </div>
                    )}
                    {tecnico.usuario_telefono && (
                      <div
                        className={`flex items-center gap-2 ${textSecondary} font-medium`}
                      >
                        <Phone className="w-4 h-4" />
                        <span>{tecnico.usuario_telefono}</span>
                      </div>
                    )}
                    {tecnico.extension_telefonica && (
                      <div
                        className={`flex items-center gap-2 ${textSecondary} font-medium`}
                      >
                        <Phone className="w-4 h-4" />
                        <span>Ext. {tecnico.extension_telefonica}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Acciones */}
              <div className="flex flex-wrap gap-3">
                <Link
                  href={`/admin/tecnicos/${params.id}/editar`}
                  className={`flex items-center gap-2 px-6 py-3 bg-gradient-to-r ${theme.primary} text-white rounded-xl shadow-lg ${theme.glow} hover:shadow-2xl transition-all duration-300 font-bold group hover:scale-105`}
                >
                  <Edit className="w-5 h-5 group-hover:rotate-12 transition-transform duration-300" />
                  <span>Editar Técnico</span>
                </Link>

                <button
                  onClick={() =>
                    router.push(`/admin/usuarios/${tecnico.id_usuario}`)
                  }
                  className={`flex items-center gap-2 px-6 py-3 ${
                    darkMode ? "bg-slate-800/70" : "bg-slate-100"
                  } ${textPrimary} rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 font-bold group hover:scale-105 border ${borderColor}`}
                >
                  <User className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
                  <span>Ver Usuario</span>
                </button>

                <button
                  onClick={exportTecnico}
                  disabled={actionLoading === "export"}
                  className={`flex items-center gap-2 px-6 py-3 ${
                    darkMode ? "bg-slate-800/70" : "bg-slate-100"
                  } ${textPrimary} rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 font-bold group hover:scale-105 border ${borderColor} disabled:opacity-50`}
                >
                  <Download className="w-5 h-5 group-hover:rotate-12 transition-transform duration-300" />
                  <span>
                    {actionLoading === "export"
                      ? "Exportando..."
                      : "Exportar Ficha"}
                  </span>
                </button>

             <button
  onClick={() => setShowDeleteModal(true)}
  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-red-600 to-rose-700 text-white rounded-xl shadow-lg shadow-red-500/30 hover:shadow-2xl transition-all duration-300 font-bold group hover:scale-105"
>

                  <Trash2 className="w-5 h-5 group-hover:rotate-12 transition-transform duration-300" />
                  <span>Eliminar</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ESTADÍSTICAS PREMIUM */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* Tickets totales */}
          <div
            className={`${cardBg} rounded-2xl shadow-xl border ${borderColor} p-6 group hover:shadow-2xl transition-all duration-300 hover:scale-105 relative overflow-hidden`}
          >
            <div
              className={`absolute inset-0 bg-gradient-to-br ${theme.primary} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}
            ></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div
                  className={`p-3 rounded-2xl shadow-lg bg-gradient-to-br ${theme.primary}`}
                >
                  <Activity className="w-7 h-7 text-white" />
                </div>
                <TrendingUp className="w-5 h-5 text-emerald-500" />
              </div>
              <div className={`text-4xl font-black ${textPrimary} mb-2`}>
                {tecnico.tickets_resueltos}
              </div>
              <div
                className={`text-sm ${textMuted} font-black uppercase tracking-wider`}
              >
                Tickets Resueltos
              </div>
              {estad && estad.tickets_mes > 0 && (
                <div className="flex items-center gap-2 mt-3 text-xs">
                  <Star className="w-4 h-4 text-amber-400" />
                  <span className={textSecondary}>
                    {estad.tickets_mes} este mes · {estad.tickets_hoy} hoy
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* SLA / Tiempo promedio */}
          <div
            className={`${cardBg} rounded-2xl shadow-xl border ${borderColor} p-6 group hover:shadow-2xl transition-all duration-300 hover:scale-105 relative overflow-hidden`}
          >
            <div
              className={`absolute inset-0 bg-gradient-to-br from-emerald-500 to-green-500 opacity-0 group-hover:opacity-5 transition-opacity duration-300`}
            ></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div
                  className={`p-3 rounded-2xl shadow-lg ${
                    darkMode
                      ? "bg-emerald-500/20"
                      : "bg-gradient-to-br from-emerald-400 to-emerald-600"
                  }`}
                >
                  <Clock
                    className={`w-7 h-7 ${
                      darkMode ? "text-emerald-300" : "text-white"
                    }`}
                  />
                </div>
                {estad && (
                  <span className="text-xs font-black text-emerald-500 dark:text-emerald-300">
                    SLA:{" "}
                    {estad.sla_cumplido + estad.sla_incumplido > 0
                      ? Math.round(
                          (estad.sla_cumplido /
                            (estad.sla_cumplido + estad.sla_incumplido)) *
                            100
                        )
                      : 0}
                    %
                  </span>
                )}
              </div>
              <div className={`text-lg font-bold ${textPrimary} mb-2`}>
                {Number(
                  estad?.promedio_tiempo_resolucion ??
                    tecnico.tiempo_promedio_resolucion ??
                    0
                ).toFixed(1)}{" "}
                min promedio
              </div>
              <div
                className={`text-sm ${textMuted} font-black uppercase tracking-wider`}
              >
                Tiempo de Resolución
              </div>
            </div>
          </div>

          {/* Calificación */}
          <div
            className={`${cardBg} rounded-2xl shadow-xl border ${borderColor} p-6 group hover:shadow-2xl transition-all duration-300 hover:scale-105 relative overflow-hidden`}
          >
            <div
              className={`absolute inset-0 bg-gradient-to-br from-yellow-400 to-amber-500 opacity-0 group-hover:opacity-5 transition-opacity duration-300`}
            ></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div
                  className={`p-3 rounded-2xl shadow-lg ${
                    darkMode
                      ? "bg-amber-500/20"
                      : "bg-gradient-to-br from-amber-400 to-yellow-500"
                  }`}
                >
                  <Award
                    className={`w-7 h-7 ${
                      darkMode ? "text-amber-300" : "text-white"
                    }`}
                  />
                </div>
                <div className="flex items-center gap-1">
                  <Star className="w-5 h-5 text-amber-400" />
                  <Star className="w-5 h-5 text-amber-400" />
                </div>
              </div>
              <div className={`text-4xl font-black ${textPrimary} mb-2`}>
                {Number(
                  estad?.promedio_calificacion ??
                    tecnico.calificacion_promedio ??
                    0
                ).toFixed(2)}
              </div>
              <div
                className={`text-sm ${textMuted} font-black uppercase tracking-wider`}
              >
                Calificación Promedio
              </div>
            </div>
          </div>

          {/* Prioridad / Críticos */}
          <div
            className={`${cardBg} rounded-2xl shadow-xl border ${borderColor} p-6 group hover:shadow-2xl transition-all duration-300 hover:scale-105 relative overflow-hidden`}
          >
            <div
              className={`absolute inset-0 bg-gradient-to-br from-rose-500 to-red-600 opacity-0 group-hover:opacity-5 transition-opacity duration-300`}
            ></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div
                  className={`p-3 rounded-2xl shadow-lg ${
                    darkMode
                      ? "bg-rose-500/20"
                      : "bg-gradient-to-br from-rose-400 to-red-600"
                  }`}
                >
                  <Flame
                    className={`w-7 h-7 ${
                      darkMode ? "text-rose-300" : "text-white"
                    }`}
                  />
                </div>
                <Crown className="w-5 h-5 text-yellow-400" />
              </div>
              <div className={`text-lg font-bold ${textPrimary} mb-2`}>
Prioridad: {(tecnico.prioridad ?? "N/A").toString().toUpperCase()}
              </div>
              <div
                className={`text-sm ${textMuted} font-black uppercase tracking-wider`}
              >
                Tickets Críticos
              </div>
              {estad && (
                <div className="flex items-center gap-2 mt-2 text-sm">
                  <span className="font-bold text-rose-500 dark:text-rose-300">
                    {estad.tickets_criticos}
                  </span>
                  <span className={textSecondary}>casos críticos este mes</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* TABS */}
        <div
          className={`${cardBg} rounded-3xl shadow-2xl border ${borderColor} p-2 animate-in fade-in slide-in-from-bottom-4 duration-500`}
          style={{ animationDelay: "100ms" }}
        >
          <div className="flex flex-wrap gap-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold transition-all duration-300 group ${
                    isActive
                      ? `bg-gradient-to-r ${theme.primary} text-white shadow-lg scale-105`
                      : `${hoverBg} ${textSecondary} hover:scale-102`
                  }`}
                >
                  <Icon
                    className={`w-5 h-5 ${
                      isActive ? "text-white" : tab.color
                    } group-hover:scale-110 transition-transform duration-300`}
                  />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* CONTENIDO TABS */}
        <div
          className={`${cardBg} rounded-3xl shadow-2xl border ${borderColor} p-8 animate-in fade-in slide-in-from-bottom-4 duration-500`}
          style={{ animationDelay: "200ms" }}
        >
          {/* GENERAL */}
          {activeTab === "general" && (
            <div className="space-y-6 animate-in fade-in zoom-in duration-300">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Tipo / Área / Nivel / Turno */}
                {[
                  {
                    label: "Área Técnica",
                    value: tecnico.area_tecnica,
                    icon: Wrench,
                  },
                  {
                    label: "Tipo de Técnico",
                    value: tecnico.tipo_tecnico,
                    icon: Shield,
                  },
                  {
                    label: "Nivel de Acceso",
value: String(tecnico.nivel_acceso ?? "N/A").toUpperCase(),
                    icon: Shield,
                  },
                  {
                    label: "Turno",
                    value:
                      tecnico.turno === "manana"
                        ? "Mañana"
                        : tecnico.turno === "tarde"
                        ? "Tarde"
                        : tecnico.turno === "noche"
                        ? "Noche"
                        : "Jornada Completa",
                    icon: Clock,
                  },
                ].map((field, index) => {
                  const Icon = field.icon;
                  return (
                    <div
                      key={index}
                      className={`p-5 rounded-2xl ${
                        darkMode ? "bg-slate-800/30" : "bg-slate-50/50"
                      } ${borderColor} border group hover:shadow-lg transition-all duration-300 hover:scale-[1.02]`}
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <div
                          className={`p-2 rounded-xl ${
                            darkMode ? "bg-slate-700" : "bg-white"
                          } shadow`}
                        >
                          <Icon className={`w-5 h-5 ${textMuted}`} />
                        </div>
                        <label
                          className={`text-xs font-black ${textMuted} uppercase tracking-wider`}
                        >
                          {field.label}
                        </label>
                      </div>
                      <p
                        className={`text-lg font-semibold ${textPrimary} capitalize`}
                      >
                        {field.value}
                      </p>
                    </div>
                  );
                })}

                {/* Horario */}
                <div
                  className={`p-5 rounded-2xl ${
                    darkMode ? "bg-slate-800/30" : "bg-slate-50/50"
                  } ${borderColor} border group hover:shadow-lg transition-all duration-300`}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div
                      className={`p-2 rounded-xl ${
                        darkMode ? "bg-slate-700" : "bg-white"
                      } shadow`}
                    >
                      <Clock className={`w-5 h-5 ${textMuted}`} />
                    </div>
                    <label
                      className={`text-xs font-black ${textMuted} uppercase tracking-wider`}
                    >
                      Horario
                    </label>
                  </div>
                  <p className={`text-lg font-semibold ${textPrimary}`}>
                    {tecnico.hora_inicio && tecnico.hora_fin
                      ? `${formatHora(tecnico.hora_inicio)} - ${formatHora(
                          tecnico.hora_fin
                        )}`
                      : "No definido"}
                  </p>
                </div>

                {/* Global / Supervisor */}
                <div
                  className={`p-5 rounded-2xl ${
                    darkMode ? "bg-slate-800/30" : "bg-slate-50/50"
                  } ${borderColor} border group hover:shadow-lg transition-all duration-300`}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div
                      className={`p-2 rounded-xl ${
                        darkMode ? "bg-slate-700" : "bg-white"
                      } shadow`}
                    >
                      <Shield className={`w-5 h-5 ${textMuted}`} />
                    </div>
                    <label
                      className={`text-xs font-black ${textMuted} uppercase tracking-wider`}
                    >
                      Alcance / Supervisor
                    </label>
                  </div>
                  <p className={`text-lg font-semibold ${textPrimary}`}>
                    {tecnico.es_global ? "Técnico Global" : "Asociado a centro"}
                  </p>
                  <p className={`text-sm ${textSecondary} mt-1`}>
                    Supervisor:{" "}
                    <span className={textPrimary}>
                      {tecnico.supervisor_nombre || "No asignado"}
                    </span>
                  </p>
                </div>

                {/* Fechas */}
                {[
                  {
                    label: "Inicio en el cargo",
                    value: formatFechaCorta(tecnico.fecha_inicio),
                    icon: Calendar,
                  },
                  {
                    label: "Término del cargo",
                    value: tecnico.fecha_termino
                      ? formatFechaCorta(tecnico.fecha_termino)
                      : "Activo",
                    icon: Calendar,
                  },
                  {
                    label: "Fecha de Creación",
                    value: formatFecha(tecnico.fecha_creacion),
                    icon: Calendar,
                  },
                  {
                    label: "Última Modificación",
                    value: formatFecha(tecnico.fecha_modificacion),
                    icon: Clock,
                  },
                ].map((field, index) => {
                  const Icon = field.icon;
                  return (
                    <div
                      key={index}
                      className={`p-5 rounded-2xl ${
                        darkMode ? "bg-slate-800/30" : "bg-slate-50/50"
                      } ${borderColor} border group hover:shadow-lg transition-all duration-300 hover:scale-[1.02]`}
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <div
                          className={`p-2 rounded-xl ${
                            darkMode ? "bg-slate-700" : "bg-white"
                          } shadow`}
                        >
                          <Icon className={`w-5 h-5 ${textMuted}`} />
                        </div>
                        <label
                          className={`text-xs font-black ${textMuted} uppercase tracking-wider`}
                        >
                          {field.label}
                        </label>
                      </div>
                      <p className={`text-lg font-semibold ${textPrimary}`}>
                        {field.value}
                      </p>
                    </div>
                  );
                })}

                {/* Especialidad / Certificaciones */}
                <div
                  className={`md:col-span-2 p-5 rounded-2xl ${
                    darkMode ? "bg-slate-800/30" : "bg-slate-50/50"
                  } ${borderColor} border group hover:shadow-lg transition-all duration-300`}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div
                      className={`p-2 rounded-xl ${
                        darkMode ? "bg-slate-700" : "bg-white"
                      } shadow`}
                    >
                      <Star className={`w-5 h-5 ${textMuted}`} />
                    </div>
                    <label
                      className={`text-xs font-black ${textMuted} uppercase tracking-wider`}
                    >
                      Especialidad y Certificaciones
                    </label>
                  </div>
                  <p className={`text-lg font-semibold ${textPrimary}`}>
                    {tecnico.especialidad_tecnica ||
                      "Sin especialidad específica registrada"}
                  </p>
                  {tecnico.certificaciones && (
                    <p className={`text-sm ${textSecondary} mt-2 whitespace-pre-line`}>
                      {tecnico.certificaciones}
                    </p>
                  )}
                </div>

                {/* Descripción */}
                <div
                  className={`md:col-span-2 p-5 rounded-2xl ${
                    darkMode ? "bg-slate-800/30" : "bg-slate-50/50"
                  } ${borderColor} border group hover:shadow-lg transition-all duration-300`}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div
                      className={`p-2 rounded-xl ${
                        darkMode ? "bg-slate-700" : "bg-white"
                      } shadow`}
                    >
                      <File />
                    </div>
                    <label
                      className={`text-xs font-black ${textMuted} uppercase tracking-wider`}
                    >
                      Descripción del Rol
                    </label>
                  </div>
                  <p className={`text-lg font-semibold ${textPrimary}`}>
                    {tecnico.descripcion || "Sin descripción registrada"}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ORGANIZACIÓN */}
          {activeTab === "organizacion" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in zoom-in duration-300">
              {/* Centro */}
              <div
                className={`p-6 rounded-2xl ${borderColor} border ${
                  darkMode ? "bg-slate-800/60" : "bg-slate-50"
                } hover:shadow-lg transition-all duration-300`}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className={`p-3 rounded-xl bg-gradient-to-br ${theme.primary}`}
                  >
                    <Building2 className="w-6 h-6 text-white" />
                  </div>
                  <h4 className={`text-xl font-black ${textPrimary}`}>
                    Centro Asociado
                  </h4>
                </div>
                <div className="space-y-3">
                  <div className={`${textSecondary} font-medium`}>
                    <strong className={`${textPrimary}`}>Nombre:</strong>{" "}
                    {tecnico.centro_nombre || "—"}
                  </div>
                  <div className={`${textSecondary} font-medium`}>
                    <strong className={`${textPrimary}`}>Dirección:</strong>{" "}
                    {tecnico.centro_direccion || "—"}
                  </div>
                  <div className={`${textSecondary} font-medium`}>
                    <strong className={`${textPrimary}`}>Teléfono:</strong>{" "}
                    {tecnico.centro_telefono || "—"}
                  </div>
                  <div className={`${textSecondary} font-medium`}>
                    <strong className={`${textPrimary}`}>Email:</strong>{" "}
                    {tecnico.centro_email || "—"}
                  </div>
                </div>
              </div>

              {/* Sucursal */}
              <div
                className={`p-6 rounded-2xl ${borderColor} border ${
                  darkMode ? "bg-slate-800/60" : "bg-slate-50"
                } hover:shadow-lg transition-all duration-300`}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className={`p-3 rounded-xl bg-gradient-to-br ${theme.accent}`}
                  >
                    <MapPin className="w-6 h-6 text-white" />
                  </div>
               

                  <h4 className={`text-xl font-black ${textPrimary}`}>
                    Sucursal Asociada
                  </h4>
                </div>
                <div className="space-y-3">
                  <div className={`${textSecondary} font-medium`}>
                    <strong className={`${textPrimary}`}>Nombre:</strong>{" "}
                    {tecnico.sucursal_nombre || "—"}
                  </div>
                  <div className={`${textSecondary} font-medium`}>
                    <strong className={`${textPrimary}`}>Dirección:</strong>{" "}
                    {tecnico.sucursal_direccion || "—"}
                  </div>
                  <div className={`${textSecondary} font-medium`}>
                    <strong className={`${textPrimary}`}>Región:</strong>{" "}
                    {tecnico.region || "—"}
                  </div>
                  <div className={`${textSecondary} font-medium`}>
                    <strong className={`${textPrimary}`}>País:</strong>{" "}
                    {tecnico.pais || "—"}
                  </div>
                  <div className={`${textSecondary} font-medium`}>
                    <strong className={`${textPrimary}`}>Zona Horaria:</strong>{" "}
                    {tecnico.zona_horaria || "—"}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* PERFORMANCE DETALLADA */}
          {activeTab === "performance" && (
            <div className="space-y-6 animate-in fade-in zoom-in duration-300">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Tickets totales */}
                <div
                  className={`p-6 rounded-2xl ${borderColor} border ${
                    darkMode ? "bg-slate-800/60" : "bg-slate-50"
                  } hover:shadow-lg transition-all duration-300`}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div
                      className={`p-3 rounded-xl ${
                        darkMode ? "bg-slate-700" : "bg-white"
                      } shadow`}
                    >
                      <Activity className={`w-6 h-6 ${textMuted}`} />
                    </div>
                    <h4 className={`text-lg font-black ${textPrimary}`}>
                      Tickets Totales
                    </h4>
                  </div>
                  <p className={`text-3xl font-black ${textPrimary}`}>
                    {tecnico.tickets_resueltos}
                  </p>
                  {estad && (
                    <p className={`${textSecondary} text-sm mt-2`}>
                      {estad.tickets_mes} este mes · {estad.tickets_hoy} hoy
                    </p>
                  )}
                </div>

                {/* Tiempo promedio */}
                <div
                  className={`p-6 rounded-2xl ${borderColor} border ${
                    darkMode ? "bg-slate-800/60" : "bg-slate-50"
                  } hover:shadow-lg transition-all duration-300`}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div
                      className={`p-3 rounded-xl ${
                        darkMode ? "bg-slate-700" : "bg-white"
                      } shadow`}
                    >
                      <Clock className={`w-6 h-6 ${textMuted}`} />
                    </div>
                    <h4 className={`text-lg font-black ${textPrimary}`}>
                      Tiempo Promedio
                    </h4>
                  </div>
                  <p className={`text-3xl font-black ${textPrimary}`}>
                    {Number(
                      estad?.promedio_tiempo_resolucion ??
                        tecnico.tiempo_promedio_resolucion ??
                        0
                    ).toFixed(1)}{" "}
                    min
                  </p>
                </div>

                {/* Calificación */}
                <div
                  className={`p-6 rounded-2xl ${borderColor} border ${
                    darkMode ? "bg-slate-800/60" : "bg-slate-50"
                  } hover:shadow-lg transition-all duration-300`}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div
                      className={`p-3 rounded-xl ${
                        darkMode ? "bg-slate-700" : "bg-white"
                      } shadow`}
                    >
                      <Star className={`w-6 h-6 ${textMuted}`} />
                    </div>
                    <h4 className={`text-lg font-black ${textPrimary}`}>
                      Calificación
                    </h4>
                  </div>
                  <p className={`text-3xl font-black ${textPrimary}`}>
                    {Number(
                      estad?.promedio_calificacion ??
                        tecnico.calificacion_promedio ??
                        0
                    ).toFixed(2)}
                  </p>
                </div>
              </div>

              {estad && (
                <div
                  className={`p-6 rounded-2xl ${borderColor} border ${
                    darkMode ? "bg-slate-800/60" : "bg-slate-50"
                  } hover:shadow-lg transition-all duration-300`}
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div
                      className={`p-3 rounded-xl ${
                        darkMode ? "bg-slate-700" : "bg-white"
                      } shadow`}
                    >
                      <Shield className={`w-6 h-6 ${textMuted}`} />
                    </div>
                    <h4 className={`text-lg font-black ${textPrimary}`}>
                      SLA y Críticos
                    </h4>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div className={textSecondary}>
                      <strong className={textPrimary}>Críticos:</strong>{" "}
                      {estad.tickets_criticos}
                    </div>
                    <div className={textSecondary}>
                      <strong className={textPrimary}>SLA Cumplido:</strong>{" "}
                      {estad.sla_cumplido}
                    </div>
                    <div className={textSecondary}>
                      <strong className={textPrimary}>SLA Incumplido:</strong>{" "}
                      {estad.sla_incumplido}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ACTIVIDAD / ÚLTIMOS TICKETS */}
          {activeTab === "actividad" && (
            <div className="space-y-4 animate-in fade-in zoom-in duration-300">
              {tecnico.ultimos_tickets && tecnico.ultimos_tickets.length > 0 ? (
                tecnico.ultimos_tickets.map((t, idx) => (
                  <div
                    key={t.id_ticket}
                    className={`p-5 rounded-2xl ${borderColor} border flex items-start gap-4 ${
                      darkMode ? "bg-slate-800/50" : "bg-white"
                    } hover:shadow-lg transition-all duration-300 hover:scale-[1.01]`}
                    style={{ animationDelay: `${idx * 40}ms` }}
                  >
                    <div
                      className={`p-3 rounded-xl ${
                        darkMode ? "bg-slate-700" : "bg-slate-100"
                      }`}
                    >
                      <Activity className={`w-5 h-5 ${textMuted}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap gap-3 items-center mb-2">
                        <span
                          className={`text-xs font-black ${textMuted} uppercase tracking-wide`}
                        >
                          {new Date(t.fecha_apertura).toLocaleString("es-CL")}
                        </span>
                        <span
                          className={`text-xs font-bold px-3 py-1 rounded-lg ${
                            darkMode
                              ? "bg-slate-700/80"
                              : "bg-slate-100 border border-slate-200"
                          }`}
                        >
                          {t.codigo}
                        </span>
                        <span
                          className={`text-xs font-bold px-3 py-1 rounded-lg ${
                            darkMode
                              ? "bg-slate-700/80"
                              : "bg-slate-100 border border-slate-200"
                          }`}
                        >
                          {t.estado}
                        </span>
                        <span
                          className={`text-xs font-bold px-3 py-1 rounded-lg`}
                        >
                          {getPrioridadBadge(t.prioridad)}
                        </span>
                      </div>
                      <div
                        className={`${textPrimary} font-semibold truncate`}
                        title={t.titulo}
                      >
                        {t.titulo}
                      </div>
                      <div className={`${textMuted} text-xs mt-1`}>
                        {t.centro || "Sin centro"} ·{" "}
                        {t.sucursal || "Sin sucursal"}
                      </div>
                      {t.fecha_cierre && (
                        <div className={`${textMuted} text-xs mt-1`}>
                          Cerrado:{" "}
                          {new Date(t.fecha_cierre).toLocaleString("es-CL")}
                        </div>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12">
                  <Activity
                    className={`w-16 h-16 ${textMuted} mx-auto mb-4 opacity-50`}
                  />
                  <p className={`${textMuted} font-medium`}>
                    Sin tickets recientes para este técnico.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* MODAL ELIMINAR TÉCNICO */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div
            className={`${cardBg} ${borderColor} border rounded-3xl p-8 max-w-md w-full shadow-2xl animate-in zoom-in duration-300`}
          >
            <div className="flex items-center gap-4 mb-6">
              <div className="p-4 rounded-2xl bg-gradient-to-br from-red-500 to-rose-600">
                <AlertCircle className="w-8 h-8 text-white" />
              </div>
              <div>
                <h3 className={`text-2xl font-black ${textPrimary}`}>
                  Eliminar Técnico
                </h3>
                <p className={`${textSecondary} text-sm`}>
                  Acción irreversible
                </p>
              </div>
            </div>

            <p className={`${textSecondary} mb-8 font-medium`}>
              ¿Estás seguro que deseas eliminar al técnico{" "}
              <strong className={textPrimary}>{tecnico.usuario_nombre}</strong>?
              Esta acción no se puede deshacer.
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className={`px-6 py-3 rounded-xl ${hoverBg} ${borderColor} border font-bold transition-all duration-300 hover:scale-105`}
              >
                Cancelar
              </button>
              <button
                onClick={handleEliminar}
                disabled={deleting}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-red-600 to-rose-700 text-white font-bold shadow-lg shadow-red-500/30 hover:shadow-2xl transition-all duration-300 hover:scale-105 disabled:opacity-50"
              >
                {deleting ? "Eliminando..." : "Eliminar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Pequeño helper que usé arriba para el icono de descripción
function File(props: React.SVGProps<SVGSVGElement>) {
  return <FileText {...props} />;
}
