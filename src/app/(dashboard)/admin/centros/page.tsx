"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Building2,
  Plus,
  Search,
  Filter,
  Download,
  RefreshCw,
  MoreVertical,
  Eye,
  Edit,
  Trash2,
  Power,
  Ban,
  CheckCircle,
  Users,
  Stethoscope,
  UserCheck,
  MapPin,
  Phone,
  Mail,
  Globe,
  Calendar,
  TrendingUp,
  AlertCircle,
  Sparkles,
  LayoutGrid,
  List,
  ArrowLeft,
  ChevronLeft,
  Star,
  Award,
  Zap,
  Activity,
  Shield,
  Heart,
  Crown,
} from "lucide-react";

interface Centro {
  id_centro: number;
  nombre: string;
  razon_social: string;
  rut: string;
  direccion: string;
  ciudad: string;
  region: string;
  telefono: string;
  email: string;
  sitio_web: string;
  logo_url: string;
  estado: "activo" | "inactivo" | "suspendido";
  fecha_creacion: string;
  fecha_actualizacion: string;
  usuarios_count: number;
  usuarios_activos: number;
  medicos_count: number;
  medicos_activos: number;
  pacientes_count: number;
  pacientes_activos: number;
  sucursales_count: number;
  consultas_mes: number;
  consultas_ano: number;
  plan: string;
  satisfaccion: number;
  ultima_actividad: string;
  capacidad_pacientes_dia: number;
  nivel_complejidad: string;
  especializacion_principal: string;
}

interface Estadisticas {
  total_centros: number;
  centros_activos: number;
  centros_inactivos: number;
  centros_suspendidos: number;
  capacidad_promedio: number;
  capacidad_total: number;
}

// 🌟 BADGE DE ESTADO
const EstadoBadge = ({ estado }: { estado: Centro["estado"] }) => {
  const configs = {
    activo: {
      bg: "bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-500",
      text: "text-white",
      icon: CheckCircle,
      label: "Activo",
      glow: "shadow-2xl shadow-emerald-500/60",
      ring: "ring-2 ring-emerald-300/50 ring-offset-2 ring-offset-white/10",
      pulse: "animate-pulse",
    },
    inactivo: {
      bg: "bg-gradient-to-r from-slate-400 via-gray-400 to-zinc-500",
      text: "text-white",
      icon: Ban,
      label: "Inactivo",
      glow: "shadow-2xl shadow-slate-500/60",
      ring: "ring-2 ring-slate-300/50 ring-offset-2 ring-offset-white/10",
      pulse: "",
    },
    suspendido: {
      bg: "bg-gradient-to-r from-red-500 via-rose-500 to-pink-600",
      text: "text-white",
      icon: AlertCircle,
      label: "Suspendido",
      glow: "shadow-2xl shadow-red-500/60",
      ring: "ring-2 ring-red-300/50 ring-offset-2 ring-offset-white/10",
      pulse: "animate-pulse",
    },
  };

  const config = configs[estado as keyof typeof configs] || configs.inactivo;
  const Icon = config.icon;

  return (
    <div
      className={`group relative inline-flex items-center gap-2.5 px-5 py-2 rounded-2xl ${config.bg} ${config.text} ${config.glow} ${config.ring} font-black text-xs tracking-wider uppercase transition-all duration-500 hover:scale-110 hover:rotate-1 ${config.pulse}`}
    >
      <div className="absolute inset-0 bg-white/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      <Icon className="w-4 h-4 relative z-10 drop-shadow-lg animate-bounce" />
      <span className="relative z-10 drop-shadow-lg">{config.label}</span>
      <div className="absolute -top-1 -right-1 w-3 h-3 bg-white rounded-full opacity-80 group-hover:animate-ping"></div>
    </div>
  );
};

// 👑 BADGE DE PLAN
const PlanBadge = ({ plan }: { plan: string }) => {
  const configs = {
    basico: {
      bg: "bg-gradient-to-r from-blue-500 via-cyan-500 to-sky-600",
      text: "text-white",
      icon: "💎",
      label: "Básico",
      glow: "shadow-2xl shadow-blue-500/60",
      particles:
        "before:absolute before:inset-0 before:bg-[radial-gradient(circle_at_50%_120%,rgba(120,119,198,0.3),rgba(255,255,255,0))]",
    },
    profesional: {
      bg: "bg-gradient-to-r from-purple-600 via-fuchsia-500 to-pink-600",
      text: "text-white",
      icon: "👑",
      label: "Profesional",
      glow: "shadow-2xl shadow-purple-500/60",
      particles:
        "before:absolute before:inset-0 before:bg-[radial-gradient(circle_at_50%_120%,rgba(184,147,247,0.3),rgba(255,255,255,0))]",
    },
    empresarial: {
      bg: "bg-gradient-to-r from-amber-500 via-orange-500 to-red-500",
      text: "text-white",
      icon: "🏆",
      label: "Empresarial",
      glow: "shadow-2xl shadow-orange-500/60",
      particles:
        "before:absolute before:inset-0 before:bg-[radial-gradient(circle_at_50%_120%,rgba(251,191,36,0.3),rgba(255,255,255,0))]",
    },
    premium: {
      bg: "bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-700",
      text: "text-white",
      icon: "⭐",
      label: "Premium",
      glow: "shadow-2xl shadow-indigo-500/60",
      particles:
        "before:absolute before:inset-0 before:bg-[radial-gradient(circle_at_50%_120%,rgba(129,140,248,0.3),rgba(255,255,255,0))]",
    },
  };

  const config = configs[plan?.toLowerCase() as keyof typeof configs] || configs.basico;

  return (
    <div
      className={`group relative inline-flex items-center gap-2.5 px-5 py-2 rounded-2xl ${config.bg} ${config.text} ${config.glow} ring-2 ring-white/30 ring-offset-2 ring-offset-white/10 font-black text-xs tracking-wider uppercase transition-all duration-500 hover:scale-110 hover:-rotate-1 ${config.particles} overflow-hidden`}
    >
      <div className="absolute inset-0 bg-gradient-to-t from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      <span className="text-lg relative z-10 drop-shadow-lg animate-pulse">{config.icon}</span>
      <span className="relative z-10 drop-shadow-lg">{config.label}</span>
      <Crown className="w-3.5 h-3.5 relative z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 animate-bounce" />
    </div>
  );
};

export default function CentrosPage() {
  const router = useRouter();
  const [centros, setCentros] = useState<Centro[]>([]);
  const [estadisticas, setEstadisticas] = useState<Estadisticas | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filtros
  const [busqueda, setBusqueda] = useState("");
  const [estadoFiltro, setEstadoFiltro] = useState("todos");
  const [vistaActual, setVistaActual] = useState<"grid" | "list">("grid");

  // Paginación
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  // Cargar centros
  const cargarCentros = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        page: page.toString(),
        limit: "12",
        ...(estadoFiltro !== "todos" && { estado: estadoFiltro }),
        ...(busqueda && { busqueda }),
      });

      const response = await fetch(`/api/admin/centros?${params}`, {
        method: "GET",
      });

      if (!response.ok) {
        throw new Error("No se pudo obtener la información de los centros");
      }

      const data = await response.json();

      if (data.success) {
        setCentros(data.data || []);
        setEstadisticas(data.estadisticas || null);
        setTotalPages(data.pagination?.totalPages || 1);
        setTotal(data.pagination?.total || (data.data ? data.data.length : 0));
      } else {
        setError(data.error || "Error al cargar centros");
      }
    } catch (err: any) {
      setError(err.message || "Error inesperado");
      console.error("Error al cargar centros:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarCentros();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, estadoFiltro, busqueda]);

  // Cambiar estado del centro
  const cambiarEstado = async (idCentro: number, nuevoEstado: Centro["estado"]) => {
    try {
      const response = await fetch(`/api/admin/centros/${idCentro}/estado`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ estado: nuevoEstado }),
      });

      const data = await response.json();

      if (data.success) {
        alert(`Estado actualizado a: ${nuevoEstado}`);
        cargarCentros();
      } else {
        alert(`Error: ${data.error}`);
      }
    } catch (error: any) {
      alert(`Error: ${error.message}`);
    }
  };

  // Eliminar centro
  const eliminarCentro = async (idCentro: number) => {
    if (
      !confirm(
        "⚠️ ¿Estás seguro de eliminar este centro? Esta acción no se puede deshacer."
      )
    )
      return;

    try {
      const response = await fetch(`/api/admin/centros/${idCentro}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (data.success) {
        alert("Centro eliminado exitosamente");
        cargarCentros();
      } else {
        alert(`Error: ${data.error}`);
      }
    } catch (error: any) {
      alert(`Error: ${error.message}`);
    }
  };

  // Descargar reporte
  const descargarReporte = async () => {
    try {
      const params = new URLSearchParams({
        ...(estadoFiltro !== "todos" && { estado: estadoFiltro }),
        ...(busqueda && { busqueda }),
      });

      window.open(`/api/admin/centros/reporte?${params}`, "_blank");
    } catch (error: any) {
      alert(`Error: ${error.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/50 to-indigo-50 relative overflow-hidden">
      {/* Fondo animado */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiM2MzY2ZjEiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djJoLTJ2LTJoMnptMC00aDJ2Mmgtdi0yem0tMiAydjJoLTJ2LTJoMnptMi0yaDJ2Mmgtdi0yem0tMiAyaDJ2Mmgtdi0yem0tMi0ydjJoLTJ2LTJoMnptMi0yaDJ2Mmgtdi0yem0tMiAyaDJ2Mmgtdi0yem0tMi0ydjJoLTJ2LTJoMnoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-30 animate-pulse"></div>
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-300/20 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-300/20 rounded-full blur-3xl animate-pulse delay-700"></div>

      <div className="relative z-10 p-4 md:p-8">
        {/* Botón regresar */}
        <div className="mb-6">
          <button
            onClick={() => router.back()}
            className="group inline-flex items-center gap-3 px-6 py-3.5 bg-gradient-to-r from-slate-800 via-slate-700 to-slate-900 text-white rounded-2xl font-bold shadow-2xl shadow-slate-900/50 hover:shadow-slate-900/80 hover:scale-105 transition-all duration-300 ring-2 ring-slate-600/50 ring-offset-2 ring-offset-white/50 hover:ring-offset-4"
          >
            <div className="relative">
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-2 transition-transform duration-300" />
              <div className="absolute inset-0 bg-white/30 rounded-full blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>
            <span className="text-base tracking-wide">Regresar</span>
            <ChevronLeft className="w-4 h-4 opacity-70 group-hover:opacity-100 group-hover:-translate-x-1 transition-all duration-300" />
          </button>
        </div>

        {/* Header */}
        <div className="mb-8">
          <div className="relative overflow-hidden bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-[2rem] shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-br from-black/20 to-transparent"></div>
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzBoLTJWMGgydjMwem0tOCAwTDE4IDBoMnYzMGgtOHptMTYgMGgtMlYwaDJ2MzB6bTggMGgtMlYwaDJ2MzB6bS0yNCAwTDEwIDBoMnYzMGgtOHptMzIgMGgtMlYwaDJ2MzB6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-20"></div>
            <div className="absolute top-0 left-0 w-40 h-40 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-0 right-0 w-60 h-60 bg-pink-300/20 rounded-full blur-3xl animate-pulse delay-300"></div>

            <div className="relative z-10 p-8 md:p-12">
              <div className="flex items-center justify-between flex-wrap gap-6">
                <div className="flex items-center gap-5">
                  <div className="relative group">
                    <div className="absolute inset-0 bg-white/30 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-300"></div>
                    <div className="relative p-5 bg-white/20 backdrop-blur-2xl rounded-3xl shadow-2xl ring-2 ring-white/30 group-hover:scale-110 transition-transform duration-300">
                      <Building2 className="w-12 h-12 text-white drop-shadow-2xl" />
                      <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full animate-ping"></div>
                      <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full"></div>
                    </div>
                  </div>
                  <div>
                    <h1 className="text-4xl md:text-6xl font-black text-white mb-3 tracking-tight drop-shadow-2xl">
                      Centros Médicos
                      <span className="inline-block ml-3 animate-bounce">✨</span>
                    </h1>
                    <p className="text-lg md:text-xl text-white/95 font-bold drop-shadow-lg flex items-center gap-2">
                      <Shield className="w-5 h-5 animate-pulse" />
                      Gestión completa de centros de salud
                      <Heart className="w-5 h-5 animate-pulse delay-100" />
                    </p>
                  </div>
                </div>
                <div className="flex gap-4 items-center">
                  <Link
                    href="/admin/centros/nuevo"
                    className="group relative flex items-center gap-4 px-10 py-5 bg-white text-indigo-600 rounded-[1.5rem] font-black text-lg shadow-2xl hover:shadow-white/70 hover:scale-110 transition-all duration-500 ring-4 ring-white/50 ring-offset-4 ring-offset-transparent overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-yellow-200/50 to-pink-200/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <Plus className="relative z-10 w-6 h-6 group-hover:rotate-180 transition-transform duration-500" />
                    <span className="relative z-10 tracking-wide">Nuevo Centro</span>
                    <Sparkles className="relative z-10 w-6 h-6 group-hover:animate-spin" />
                    <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-yellow-300 to-pink-300 rounded-full blur-2xl opacity-0 group-hover:opacity-50 transition-opacity duration-500"></div>
                  </Link>
                  {/* botón decorativo para usar MoreVertical y que no se queje TS */}
                  <button
                    type="button"
                    className="p-3 rounded-2xl bg-white/10 text-white hover:bg-white/20 transition-all duration-300 ring-2 ring-white/20"
                    title="Opciones"
                  >
                    <MoreVertical className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Estadísticas */}
        {estadisticas && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Total centros */}
            <div className="group relative overflow-hidden bg-gradient-to-br from-blue-500 via-cyan-500 to-sky-600 rounded-3xl p-7 shadow-2xl hover:shadow-blue-500/60 transition-all duration-500 hover:scale-105 hover:-rotate-1 ring-2 ring-blue-300/50 ring-offset-2 ring-offset-white/50">
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl group-hover:blur-2xl transition-all duration-500"></div>

              <div className="relative z-10">
                <div className="flex items-center justify-between mb-5">
                  <div className="relative">
                    <div className="p-4 bg-white/20 backdrop-blur-xl rounded-2xl shadow-lg ring-2 ring-white/30 group-hover:scale-110 transition-transform duration-300">
                      <Building2 className="w-10 h-10 text-white drop-shadow-lg" />
                    </div>
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full animate-pulse"></div>
                  </div>
                  <div className="flex items-center gap-2 text-white/80">
                    <TrendingUp className="w-7 h-7 animate-bounce" />
                  </div>
                </div>
                <div>
                  <p className="text-white/90 text-sm font-black uppercase tracking-wider mb-3 flex items-center gap-2">
                    <Zap className="w-4 h-4 animate-pulse" />
                    Total Centros
                  </p>
                  <p className="text-6xl font-black text-white mb-2 drop-shadow-2xl">
                    {estadisticas.total_centros}
                  </p>
                  <p className="text-white/80 text-sm font-bold flex items-center gap-2">
                    <Activity className="w-4 h-4" />
                    Registrados en el sistema
                  </p>
                </div>
              </div>
              <div className="absolute bottom-0 right-0 w-32 h-32 bg-gradient-to-tl from-white/10 to-transparent rounded-tl-full"></div>
            </div>

            {/* Activos */}
            <div className="group relative overflow-hidden bg-gradient-to-br from-emerald-500 via-teal-500 to-green-600 rounded-3xl p-7 shadow-2xl hover:shadow-emerald-500/60 transition-all duration-500 hover:scale-105 hover:rotate-1 ring-2 ring-emerald-300/50 ring-offset-2 ring-offset-white/50">
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl group-hover:blur-2xl transition-all duration-500"></div>

              <div className="relative z-10">
                <div className="flex items-center justify-between mb-5">
                  <div className="relative">
                    <div className="p-4 bg-white/20 backdrop-blur-xl rounded-2xl shadow-lg ring-2 ring-white/30 group-hover:scale-110 transition-transform duration-300">
                      <CheckCircle className="w-10 h-10 text-white drop-shadow-lg animate-pulse" />
                    </div>
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full animate-ping"></div>
                  </div>
                  <div className="px-4 py-2 bg-white/20 backdrop-blur-xl rounded-2xl ring-2 ring-white/30">
                    <span className="text-white font-black text-lg drop-shadow-lg">
                      {estadisticas.total_centros > 0
                        ? Math.round(
                            (estadisticas.centros_activos /
                              estadisticas.total_centros) *
                              100
                          )
                        : 0}
                      %
                    </span>
                  </div>
                </div>
                <div>
                  <p className="text-white/90 text-sm font-black uppercase tracking-wider mb-3 flex items-center gap-2">
                    <Star className="w-4 h-4 animate-spin" />
                    Centros Activos
                  </p>
                  <p className="text-6xl font-black text-white mb-2 drop-shadow-2xl">
                    {estadisticas.centros_activos}
                  </p>
                  <p className="text-white/80 text-sm font-bold flex items-center gap-2">
                    <Award className="w-4 h-4 animate-bounce" />
                    Operando actualmente
                  </p>
                </div>
              </div>
              <div className="absolute bottom-0 right-0 w-32 h-32 bg-gradient-to-tl from-white/10 to-transparent rounded-tl-full"></div>
            </div>

            {/* Capacidad total */}
            <div className="group relative overflow-hidden bg-gradient-to-br from-purple-500 via-fuchsia-500 to-pink-600 rounded-3xl p-7 shadow-2xl hover:shadow-purple-500/60 transition-all duration-500 hover:scale-105 hover:-rotate-1 ring-2 ring-purple-300/50 ring-offset-2 ring-offset-white/50">
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl group-hover:blur-2xl transition-all duration-500"></div>

              <div className="relative z-10">
                <div className="flex items-center justify-between mb-5">
                  <div className="relative">
                    <div className="p-4 bg-white/20 backdrop-blur-xl rounded-2xl shadow-lg ring-2 ring-white/30 group-hover:scale-110 transition-transform duration-300">
                      <Users className="w-10 h-10 text-white drop-shadow-lg" />
                    </div>
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full animate-pulse"></div>
                  </div>
                  <Sparkles className="w-8 h-8 text-white/80 animate-pulse" />
                </div>
                <div>
                  <p className="text-white/90 text-sm font-black uppercase tracking-wider mb-3 flex items-center gap-2">
                    <Heart className="w-4 h-4 animate-pulse" />
                    Capacidad Total
                  </p>
                  <p className="text-6xl font-black text-white mb-2 drop-shadow-2xl">
                    {estadisticas.capacidad_total?.toLocaleString() || 0}
                  </p>
                  <p className="text-white/80 text-sm font-bold flex items-center gap-2">
                    <Activity className="w-4 h-4" />
                    Pacientes por día
                  </p>
                </div>
              </div>
              <div className="absolute bottom-0 right-0 w-32 h-32 bg-gradient-to-tl from-white/10 to-transparent rounded-tl-full"></div>
            </div>

            {/* Capacidad promedio */}
            <div className="group relative overflow-hidden bg-gradient-to-br from-amber-500 via-orange-500 to-red-600 rounded-3xl p-7 shadow-2xl hover:shadow-amber-500/60 transition-all duration-500 hover:scale-105 hover:rotate-1 ring-2 ring-amber-300/50 ring-offset-2 ring-offset-white/50">
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl group-hover:blur-2xl transition-all duration-500"></div>

              <div className="relative z-10">
                <div className="flex items-center justify-between mb-5">
                  <div className="relative">
                    <div className="p-4 bg-white/20 backdrop-blur-xl rounded-2xl shadow-lg ring-2 ring-white/30 group-hover:scale-110 transition-transform duration-300">
                      <TrendingUp className="w-10 h-10 text-white drop-shadow-lg animate-bounce" />
                    </div>
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full animate-ping"></div>
                  </div>
                  <div className="px-4 py-2 bg-white/20 backdrop-blur-xl rounded-2xl ring-2 ring-white/30">
                    <span className="text-white font-black text-sm drop-shadow-lg">AVG</span>
                  </div>
                </div>
                <div>
                  <p className="text-white/90 text-sm font-black uppercase tracking-wider mb-3 flex items-center gap-2">
                    <Crown className="w-4 h-4 animate-bounce" />
                    Capacidad Promedio
                  </p>
                  <p className="text-6xl font-black text-white mb-2 drop-shadow-2xl">
                    {Math.round(estadisticas.capacidad_promedio || 0)}
                  </p>
                  <p className="text-white/80 text-sm font-bold flex items-center gap-2">
                    <Shield className="w-4 h-4 animate-pulse" />
                    Por centro
                  </p>
                </div>
              </div>
              <div className="absolute bottom-0 right-0 w-32 h-32 bg-gradient-to-tl from-white/10 to-transparent rounded-tl-full"></div>
            </div>
          </div>
        )}

        {/* Barra de búsqueda / filtros */}
        <div className="relative bg-white/90 backdrop-blur-2xl rounded-3xl shadow-2xl p-7 mb-8 border-2 border-white/80 ring-4 ring-indigo-500/10 ring-offset-2 ring-offset-transparent">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 to-purple-500/5 rounded-3xl"></div>

          <div className="relative z-10 flex flex-col lg:flex-row gap-5">
            {/* Búsqueda */}
            <div className="flex-1 relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-2xl blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-500"></div>
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-400 group-focus-within:text-indigo-600 group-focus-within:scale-110 transition-all duration-300 z-10" />
              <input
                type="text"
                placeholder="Buscar centros médicos..."
                value={busqueda}
                onChange={(e) => {
                  setPage(1);
                  setBusqueda(e.target.value);
                }}
                className="relative w-full pl-14 pr-6 py-5 bg-white/80 backdrop-blur-xl border-[3px] border-gray-200 rounded-2xl focus:border-indigo-600 focus:ring-4 focus:ring-indigo-100 outline-none transition-all duration-300 text-gray-900 font-bold placeholder:text-gray-400 placeholder:font-medium shadow-lg hover:shadow-xl"
              />
            </div>

            {/* Filtro estado */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-2xl blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-500"></div>
              <Filter className="absolute left-5 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-400 group-focus-within:text-blue-600 group-focus-within:scale-110 transition-all duration-300 pointer-events-none z-10" />
              <select
                value={estadoFiltro}
                onChange={(e) => {
                  setPage(1);
                  setEstadoFiltro(e.target.value);
                }}
                className="relative appearance-none pl-14 pr-12 py-5 bg-white/80 backdrop-blur-xl border-[3px] border-gray-200 rounded-2xl focus:border-blue-600 focus:ring-4 focus:ring-blue-100 outline-none transition-all duration-300 text-gray-900 font-bold cursor-pointer min-w-[220px] shadow-lg hover:shadow-xl"
              >
                <option value="todos">Todos los estados</option>
                <option value="activo">✅ Activos</option>
                <option value="inactivo">⚪ Inactivos</option>
                <option value="suspendido">🔴 Suspendidos</option>
              </select>
              <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none">
                <svg
                  className="w-6 h-6 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>

            {/* Acciones */}
            <div className="flex gap-4">
              {/* Toggle vista */}
              <div className="flex bg-gradient-to-r from-gray-100 to-gray-200 rounded-2xl p-1.5 shadow-lg ring-2 ring-gray-300/50">
                <button
                  onClick={() => setVistaActual("grid")}
                  className={`p-4 rounded-xl transition-all duration-300 ${
                    vistaActual === "grid"
                      ? "bg-gradient-to-r from-indigo-600 to-purple-600 shadow-2xl shadow-indigo-500/50 text-white scale-110 ring-2 ring-white"
                      : "text-gray-400 hover:text-gray-600 hover:bg-white/50"
                  }`}
                  title="Vista Grid"
                >
                  <LayoutGrid className="w-6 h-6" />
                </button>
                <button
                  onClick={() => setVistaActual("list")}
                  className={`p-4 rounded-xl transition-all duration-300 ${
                    vistaActual === "list"
                      ? "bg-gradient-to-r from-indigo-600 to-purple-600 shadow-2xl shadow-indigo-500/50 text-white scale-110 ring-2 ring-white"
                      : "text-gray-400 hover:text-gray-600 hover:bg-white/50"
                  }`}
                  title="Vista Lista"
                >
                  <List className="w-6 h-6" />
                </button>
              </div>

              {/* Actualizar */}
              <button
                onClick={() => cargarCentros()}
                disabled={loading}
                className="group relative px-6 py-4 bg-gradient-to-r from-blue-600 via-cyan-600 to-sky-600 text-white rounded-2xl font-black shadow-2xl shadow-blue-500/50 hover:shadow-blue-500/80 hover:scale-110 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed ring-2 ring-blue-400/50 ring-offset-2 overflow-hidden"
                title="Actualizar"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <RefreshCw
                  className={`relative z-10 w-6 h-6 ${
                    loading ? "animate-spin" : "group-hover:rotate-180 transition-transform duration-500"
                  }`}
                />
              </button>

              {/* Descargar */}
              <button
                onClick={descargarReporte}
                className="group relative px-6 py-4 bg-gradient-to-r from-emerald-600 via-teal-600 to-green-600 text-white rounded-2xl font-black shadow-2xl shadow-emerald-500/50 hover:shadow-emerald-500/80 hover:scale-110 transition-all duration-300 ring-2 ring-emerald-400/50 ring-offset-2 overflow-hidden"
                title="Descargar Reporte"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <Download className="relative z-10 w-6 h-6 group-hover:animate-bounce" />
              </button>
            </div>
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-32">
            <div className="relative">
              <div className="w-32 h-32 border-8 border-indigo-200 rounded-full absolute"></div>
              <div className="w-32 h-32 border-8 border-indigo-600 rounded-full absolute animate-spin border-t-transparent"></div>
              <div className="w-24 h-24 border-[6px] border-purple-400 rounded-full absolute top-4 left-4 animate-spin animate-reverse border-b-transparent"></div>
              <div className="w-16 h-16 border-4 border-pink-500 rounded-full absolute top-8 left-8 animate-ping"></div>
              <div className="w-32 h-32 flex items-center justify-center">
                <Sparkles className="w-12 h-12 text-indigo-600 animate-pulse" />
              </div>
            </div>
            <p className="mt-10 text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 animate-pulse">
              ✨ Cargando centros médicos...
            </p>
            <div className="mt-4 flex gap-2">
              <div className="w-3 h-3 bg-indigo-600 rounded-full animate-bounce"></div>
              <div className="w-3 h-3 bg-purple-600 rounded-full animate-bounce delay-100"></div>
              <div className="w-3 h-3 bg-pink-600 rounded-full animate-bounce delay-200"></div>
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="relative overflow-hidden bg-gradient-to-r from-red-500 via-rose-500 to-pink-600 text-white rounded-3xl p-8 shadow-2xl mb-8 ring-4 ring-red-300/50 ring-offset-2">
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>

            <div className="relative z-10 flex items-center gap-5">
              <div className="p-5 bg-white/20 backdrop-blur-xl rounded-2xl shadow-2xl ring-2 ring-white/30 animate-pulse">
                <AlertCircle className="w-12 h-12 drop-shadow-lg" />
              </div>
              <div>
                <h3 className="text-2xl font-black mb-2 drop-shadow-lg flex items-center gap-3">
                  ⚠️ Error al cargar datos
                  <Zap className="w-6 h-6 animate-bounce" />
                </h3>
                <p className="text-white/95 text-lg font-bold drop-shadow-lg">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* GRID */}
        {!loading && vistaActual === "grid" && centros.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-7">
            {centros.map((centro, index) => (
              <div
                key={centro.id_centro}
                className="group relative bg-white rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 overflow-hidden border-2 border-gray-100 hover:border-indigo-300 hover:-translate-y-3 hover:rotate-1 ring-2 ring-transparent hover:ring-indigo-400/50 ring-offset-2"
                style={{
                  animationDelay: `${index * 50}ms`,
                  animation: "fadeInUp 0.5s ease-out forwards",
                }}
              >
                {/* header card */}
                <div className="relative h-36 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 p-7">
                  <div className="absolute inset-0 bg-black/10"></div>
                  <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzBoLTJWMGgydjMwem0tOCAwTDE4IDBoMnYzMGgtOHptMTYgMGgtMlYwaDJ2MzB6bTggMGgtMlYwaDJ2MzB6bS0yNCAwTDEwIDBoMnYzMGgtOHptMzIgMGgtMlYwaDJ2MzB6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-20"></div>
                  <div className="absolute top-0 left-0 w-32 h-32 bg-white/10 rounded-full blur-2xl animate-pulse"></div>

                  <div className="relative z-10 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-4">
                      {centro.logo_url ? (
                        <div className="relative group/logo">
                          <div className="absolute inset-0 bg-white/30 rounded-2xl blur-xl group-hover/logo:blur-2xl transition-all duration-300"></div>
                          <div className="relative w-16 h-16 rounded-2xl bg-white shadow-2xl p-2.5 overflow-hidden ring-2 ring-white/50 group-hover/logo:scale-110 transition-transform duration-300">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={centro.logo_url}
                              alt={centro.nombre}
                              className="w-full h-full object-contain"
                            />
                          </div>
                        </div>
                      ) : (
                        <div className="relative group/logo">
                          <div className="absolute inset-0 bg-white/30 rounded-2xl blur-xl group-hover/logo:blur-2xl transition-all duration-300"></div>
                          <div className="relative w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-xl shadow-2xl flex items-center justify-center ring-2 ring-white/50 group-hover/logo:scale-110 transition-transform duration-300">
                            <Building2 className="w-9 h-9 text-white drop-shadow-lg" />
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <Link
                        href={`/admin/centros/${centro.id_centro}`}
                        className="relative group/btn p-3 bg-white/20 backdrop-blur-xl rounded-xl hover:bg-white/30 transition-all duration-300 ring-2 ring-white/30 hover:scale-110"
                        title="Ver detalles"
                      >
                        <Eye className="w-5 h-5 text-white group-hover/btn:scale-125 transition-transform duration-300 drop-shadow-lg" />
                        <div className="absolute inset-0 bg-white/20 rounded-xl opacity-0 group-hover/btn:opacity-100 blur-lg transition-opacity duration-300"></div>
                      </Link>
                      <Link
                        href={`/admin/centros/${centro.id_centro}/editar`}
                        className="relative group/btn p-3 bg-white/20 backdrop-blur-xl rounded-xl hover:bg-white/30 transition-all duration-300 ring-2 ring-white/30 hover:scale-110"
                        title="Editar"
                      >
                        <Edit className="w-5 h-5 text-white group-hover/btn:scale-125 transition-transform duration-300 drop-shadow-lg" />
                        <div className="absolute inset-0 bg-white/20 rounded-xl opacity-0 group-hover/btn:opacity-100 blur-lg transition-opacity duration-300"></div>
                      </Link>
                      <button
                        onClick={() =>
                          cambiarEstado(
                            centro.id_centro,
                            centro.estado === "activo" ? "inactivo" : "activo"
                          )
                        }
                        className="relative group/btn p-3 bg-white/20 backdrop-blur-xl rounded-xl hover:bg-emerald-500/80 transition-all duration-300 ring-2 ring-white/30 hover:scale-110"
                        title={
                          centro.estado === "activo"
                            ? "Marcar como inactivo"
                            : "Activar centro"
                        }
                      >
                        <Power className="w-5 h-5 text-white group-hover/btn:scale-125 transition-transform duration-300 drop-shadow-lg" />
                        <div className="absolute inset-0 bg-emerald-500/40 rounded-xl opacity-0 group-hover/btn:opacity-100 blur-lg transition-opacity duration-300"></div>
                      </button>
                      <button
                        onClick={() => eliminarCentro(centro.id_centro)}
                        className="relative group/btn p-3 bg-white/20 backdrop-blur-xl rounded-xl hover:bg-red-500 transition-all duration-300 ring-2 ring-white/30 hover:scale-110"
                        title="Eliminar"
                      >
                        <Trash2 className="w-5 h-5 text-white group-hover/btn:scale-125 transition-transform duration-300 drop-shadow-lg" />
                        <div className="absolute inset-0 bg-red-500/50 rounded-xl opacity-0 group-hover/btn:opacity-100 blur-lg transition-opacity duration-300"></div>
                      </button>
                    </div>
                  </div>
                </div>

                {/* contenido card */}
                <div className="relative z-10 p-7">
                  {/* Nombre y badges */}
                  <div className="mb-5">
                    <div className="flex items-start justify-between gap-3 mb-4">
                      <h3 className="text-xl font-black text-gray-900 leading-tight group-hover:text-indigo-600 transition-colors duration-300 drop-shadow-sm">
                        {centro.nombre}
                      </h3>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 mb-4">
                      <EstadoBadge estado={centro.estado} />
                      <PlanBadge plan={centro.plan} />
                    </div>
                    <p className="text-sm text-gray-600 font-bold mb-3">{centro.razon_social}</p>
                    <p className="text-xs text-gray-500 font-mono bg-gradient-to-r from-gray-50 to-gray-100 px-4 py-2 rounded-xl inline-block shadow-sm ring-2 ring-gray-200/50">
                      {centro.rut}
                    </p>
                  </div>

                  {/* contacto */}
                  <div className="space-y-3 mb-5 pb-5 border-b-2 border-gray-100">
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 p-2 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl ring-2 ring-indigo-100/50">
                        <MapPin className="w-5 h-5 text-indigo-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-900 font-bold leading-snug">
                          {centro.direccion}
                        </p>
                        <p className="text-xs text-gray-600 font-semibold mt-1 flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 bg-indigo-600 rounded-full"></span>
                          {centro.ciudad}, {centro.region}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl ring-2 ring-emerald-100/50">
                        <Phone className="w-5 h-5 text-emerald-600" />
                      </div>
                      <a
                        href={`tel:${centro.telefono}`}
                        className="text-sm text-gray-700 hover:text-emerald-600 font-bold transition-colors duration-300 hover:underline"
                      >
                        {centro.telefono}
                      </a>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl ring-2 ring-blue-100/50">
                        <Mail className="w-5 h-5 text-blue-600" />
                      </div>
                      <a
                        href={`mailto:${centro.email}`}
                        className="text-sm text-gray-700 hover:text-blue-600 font-bold transition-colors duration-300 truncate hover:underline"
                      >
                        {centro.email}
                      </a>
                    </div>
                    {centro.sitio_web && (
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl ring-2 ring-purple-100/50">
                          <Globe className="w-5 h-5 text-purple-600" />
                        </div>
                        <a
                          href={centro.sitio_web}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-purple-600 hover:text-purple-700 font-bold hover:underline truncate transition-colors duration-300 flex items-center gap-1.5"
                        >
                          {centro.sitio_web}
                          <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                        </a>
                      </div>
                    )}
                  </div>

                  {/* stats */}
                  <div className="space-y-4">
                    {/* fila 1 */}
                    <div className="grid grid-cols-3 gap-3">
                      <div className="relative group/stat overflow-hidden bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-4 text-center border-2 border-blue-100 hover:border-blue-300 transition-all duration-300 hover:scale-105">
                        <div className="absolute inset-0 bg-gradient-to-t from-blue-100/50 to-transparent opacity-0 group-hover/stat:opacity-100 transition-opacity duration-300"></div>
                        <div className="relative z-10">
                          <div className="flex items-center justify-center mb-2">
                            <div className="p-2 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl shadow-lg ring-2 ring-blue-400/50 group-hover/stat:scale-110 transition-transform duration-300">
                              <Users className="w-4 h-4 text-white drop-shadow-lg" />
                            </div>
                          </div>
                          <p className="text-3xl font-black text-blue-600 mb-1 drop-shadow-sm">
                            {centro.usuarios_count}
                          </p>
                          <p className="text-xs text-blue-700 font-black uppercase tracking-wide">
                            Usuarios
                          </p>
                        </div>
                      </div>
                      <div className="relative group/stat overflow-hidden bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-4 text-center border-2 border-emerald-100 hover:border-emerald-300 transition-all duration-300 hover:scale-105">
                        <div className="absolute inset-0 bg-gradient-to-t from-emerald-100/50 to-transparent opacity-0 group-hover/stat:opacity-100 transition-opacity duration-300"></div>
                        <div className="relative z-10">
                          <div className="flex items-center justify-center mb-2">
                            <div className="p-2 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl shadow-lg ring-2 ring-emerald-400/50 group-hover/stat:scale-110 transition-transform duration-300">
                              <Stethoscope className="w-4 h-4 text-white drop-shadow-lg" />
                            </div>
                          </div>
                          <p className="text-3xl font-black text-emerald-600 mb-1 drop-shadow-sm">
                            {centro.medicos_count}
                          </p>
                          <p className="text-xs text-emerald-700 font-black uppercase tracking-wide">
                            Médicos
                          </p>
                        </div>
                      </div>
                      <div className="relative group/stat overflow-hidden bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-4 text-center border-2 border-purple-100 hover:border-purple-300 transition-all duration-300 hover:scale-105">
                        <div className="absolute inset-0 bg-gradient-to-t from-purple-100/50 to-transparent opacity-0 group-hover/stat:opacity-100 transition-opacity duration-300"></div>
                        <div className="relative z-10">
                          <div className="flex items-center justify-center mb-2">
                            <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl shadow-lg ring-2 ring-purple-400/50 group-hover/stat:scale-110 transition-transform duration-300">
                              <UserCheck className="w-4 h-4 text-white drop-shadow-lg" />
                            </div>
                          </div>
                          <p className="text-3xl font-black text-purple-600 mb-1 drop-shadow-sm">
                            {centro.pacientes_count}
                          </p>
                          <p className="text-xs text-purple-700 font-black uppercase tracking-wide">
                            Pacientes
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* fila 2 */}
                    <div className="space-y-2.5 bg-gradient-to-br from-gray-50 to-slate-50 rounded-2xl p-4 border-2 border-gray-100 shadow-inner">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-600 font-black flex items-center gap-2">
                          <Activity className="w-4 h-4 text-indigo-600 animate-pulse" />
                          Consultas mes:
                        </span>
                        <span className="text-sm font-black text-gray-900 bg-gradient-to-r from-white to-gray-50 px-4 py-2 rounded-xl shadow-sm ring-2 ring-gray-200/50">
                          {centro.consultas_mes}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-600 font-black flex items-center gap-2">
                          <TrendingUp className="w-4 h-4 text-emerald-600 animate-bounce" />
                          Capacidad diaria:
                        </span>
                        <span className="text-sm font-black text-gray-900 bg-gradient-to-r from-white to-gray-50 px-4 py-2 rounded-xl shadow-sm ring-2 ring-gray-200/50">
                          {centro.capacidad_pacientes_dia}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* footer */}
                <div className="relative px-7 py-5 bg-gradient-to-r from-gray-50 via-slate-50 to-gray-100 border-t-2 border-gray-100">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 text-gray-600 font-bold">
                      <div className="p-1.5 bg-white rounded-lg shadow-sm ring-2 ring-gray-200/50">
                        <Calendar className="w-4 h-4 text-indigo-600" />
                      </div>
                      <span>
                        {new Date(centro.fecha_creacion).toLocaleDateString("es-ES", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-emerald-600 font-black">
                      <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse shadow-lg shadow-emerald-500/50"></div>
                      {centro.ultima_actividad}
                    </div>
                  </div>
                </div>

                <div className="absolute inset-0 rounded-3xl ring-4 ring-transparent group-hover:ring-indigo-400 transition-all duration-500 pointer-events-none"></div>
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-100 group-hover:animate-shimmer transition-opacity duration-500"></div>
              </div>
            ))}
          </div>
        )}

        {/* LISTA */}
        {!loading && vistaActual === "list" && centros.length > 0 && (
          <div className="relative bg-white/90 backdrop-blur-2xl rounded-3xl border-2 border-white/80 overflow-hidden shadow-2xl ring-4 ring-indigo-500/10 ring-offset-2 mb-8">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5"></div>

            <div className="relative z-10 overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 sticky top-0 z-20">
                  <tr>
                    <th className="px-7 py-5 text-left text-xs font-black text-white uppercase tracking-wider">
                      <div className="flex items-center gap-2">
                        <Building2 className="w-5 h-5 animate-pulse" />
                        Centro
                      </div>
                    </th>
                    <th className="px-7 py-5 text-left text-xs font-black text-white uppercase tracking-wider">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-5 h-5 animate-pulse delay-100" />
                        Ubicación
                      </div>
                    </th>
                    <th className="px-7 py-5 text-left text-xs font-black text-white uppercase tracking-wider">
                      <div className="flex items-center gap-2">
                        <Activity className="w-5 h-5 animate-pulse delay-200" />
                        Estado
                      </div>
                    </th>
                    <th className="px-7 py-5 text-left text-xs font-black text-white uppercase tracking-wider">
                      <div className="flex items-center gap-2">
                        <Crown className="w-5 h-5 animate-pulse delay-300" />
                        Plan
                      </div>
                    </th>
                    <th className="px-7 py-5 text-left text-xs font-black text-white uppercase tracking-wider">
                      <div className="flex items-center gap-2">
                        <Users className="w-5 h-5 animate-pulse delay-75" />
                        Usuarios
                      </div>
                    </th>
                    <th className="px-7 py-5 text-left text-xs font-black text-white uppercase tracking-wider">
                      <div className="flex items-center gap-2">
                        <Stethoscope className="w-5 h-5 animate-pulse delay-150" />
                        Médicos
                      </div>
                    </th>
                    <th className="px-7 py-5 text-left text-xs font-black text-white uppercase tracking-wider">
                      <div className="flex items-center gap-2">
                        <UserCheck className="w-5 h-5 animate-pulse delay-225" />
                        Pacientes
                      </div>
                    </th>
                    <th className="px-7 py-5 text-right text-xs font-black text-white uppercase tracking-wider">
                      <div className="flex items-center justify-end gap-2">
                        <Zap className="w-5 h-5 animate-pulse delay-300" />
                        Acciones
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {centros.map((centro, index) => (
                    <tr
                      key={centro.id_centro}
                      className={`group transition-all duration-300 hover:bg-gradient-to-r hover:from-indigo-50 hover:via-purple-50 hover:to-pink-50 ${
                        index % 2 === 0 ? "bg-white" : "bg-gray-50/50"
                      }`}
                    >
                      <td className="px-7 py-6 whitespace-nowrap">
                        <div className="flex items-center gap-4">
                          {centro.logo_url ? (
                            <div className="relative group/logo">
                              <div className="absolute inset-0 bg-indigo-500/20 rounded-2xl blur-xl opacity-0 group-hover/logo:opacity-100 transition-opacity duration-300"></div>
                              <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-100 to-purple-100 p-2.5 shadow-lg ring-2 ring-indigo-200/50 group-hover/logo:scale-110 transition-transform duration-300">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                  src={centro.logo_url}
                                  alt={centro.nombre}
                                  className="w-full h-full object-contain"
                                />
                              </div>
                            </div>
                          ) : (
                            <div className="relative group/logo">
                              <div className="absolute inset-0 bg-indigo-500/20 rounded-2xl blur-xl opacity-0 group-hover/logo:opacity-100 transition-opacity duration-300"></div>
                              <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg ring-2 ring-indigo-400/50 group-hover/logo:scale-110 transition-transform duration-300">
                                <Building2 className="w-7 h-7 text-white drop-shadow-lg" />
                              </div>
                            </div>
                          )}
                          <div>
                            <div className="text-sm font-black text-gray-900 group-hover:text-indigo-600 transition-colors duration-300">
                              {centro.nombre}
                            </div>
                            <div className="text-xs text-gray-500 font-mono mt-1 bg-gradient-to-r from-gray-100 to-gray-50 px-3 py-1 rounded-lg inline-block shadow-sm ring-1 ring-gray-200/50">
                              {centro.rut}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-7 py-6 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-black text-gray-900 flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-indigo-600" />
                            {centro.ciudad}
                          </div>
                          <div className="text-xs text-gray-600 font-semibold mt-1">{centro.region}</div>
                        </div>
                      </td>
                      <td className="px-7 py-6 whitespace-nowrap">
                        <EstadoBadge estado={centro.estado} />
                      </td>
                      <td className="px-7 py-6 whitespace-nowrap">
                        <PlanBadge plan={centro.plan} />
                      </td>
                      <td className="px-7 py-6 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-xl ring-2 ring-blue-200/50">
                            <Users className="w-5 h-5 text-blue-600" />
                          </div>
                          <span className="text-sm font-black text-gray-900">
                            {centro.usuarios_count}
                          </span>
                        </div>
                      </td>
                      <td className="px-7 py-6 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-xl ring-2 ring-emerald-200/50">
                            <Stethoscope className="w-5 h-5 text-emerald-600" />
                          </div>
                          <span className="text-sm font-black text-gray-900">
                            {centro.medicos_count}
                          </span>
                        </div>
                      </td>
                      <td className="px-7 py-6 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl ring-2 ring-purple-200/50">
                            <UserCheck className="w-5 h-5 text-purple-600" />
                          </div>
                          <span className="text-sm font-black text-gray-900">
                            {centro.pacientes_count}
                          </span>
                        </div>
                      </td>
                      <td className="px-7 py-6 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-3">
                          <Link
                            href={`/admin/centros/${centro.id_centro}`}
                            className="group/btn relative p-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl hover:shadow-2xl hover:shadow-blue-500/50 hover:scale-125 transition-all duration-300 ring-2 ring-blue-400/50"
                            title="Ver detalles"
                          >
                            <Eye className="w-5 h-5 group-hover/btn:scale-110 transition-transform duration-300 drop-shadow-lg" />
                            <div className="absolute inset-0 bg-white/20 rounded-xl opacity-0 group-hover/btn:opacity-100 blur-xl transition-opacity duration-300"></div>
                          </Link>
                          <Link
                            href={`/admin/centros/${centro.id_centro}/editar`}
                            className="group/btn relative p-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl hover:shadow-2xl hover:shadow-emerald-500/50 hover:scale-125 transition-all duration-300 ring-2 ring-emerald-400/50"
                            title="Editar"
                          >
                            <Edit className="w-5 h-5 group-hover/btn:scale-110 transition-transform duration-300 drop-shadow-lg" />
                            <div className="absolute inset-0 bg-white/20 rounded-xl opacity-0 group-hover/btn:opacity-100 blur-xl transition-opacity duration-300"></div>
                          </Link>
                          <button
                            onClick={() =>
                              cambiarEstado(
                                centro.id_centro,
                                centro.estado === "activo" ? "inactivo" : "activo"
                              )
                            }
                            className="group/btn relative p-3 bg-gradient-to-r from-slate-500 to-slate-700 text-white rounded-xl hover:shadow-2xl hover:shadow-slate-500/50 hover:scale-125 transition-all duration-300 ring-2 ring-slate-400/50"
                            title={
                              centro.estado === "activo"
                                ? "Marcar como inactivo"
                                : "Activar centro"
                            }
                          >
                            <Power className="w-5 h-5 group-hover/btn:scale-110 transition-transform duration-300 drop-shadow-lg" />
                            <div className="absolute inset-0 bg-white/20 rounded-xl opacity-0 group-hover/btn:opacity-100 blur-xl transition-opacity duration-300"></div>
                          </button>
                          <button
                            onClick={() => eliminarCentro(centro.id_centro)}
                            className="group/btn relative p-3 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-xl hover:shadow-2xl hover:shadow-red-500/50 hover:scale-125 transition-all duration-300 ring-2 ring-red-400/50"
                            title="Eliminar"
                          >
                            <Trash2 className="w-5 h-5 group-hover/btn:scale-110 transition-transform duration-300 drop-shadow-lg" />
                            <div className="absolute inset-0 bg-white/20 rounded-xl opacity-0 group-hover/btn:opacity-100 blur-xl transition-opacity duration-300"></div>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* sin resultados */}
        {!loading && centros.length === 0 && !error && (
          <div className="relative text-center py-32">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-96 h-96 bg-gradient-to-r from-indigo-300/20 via-purple-300/20 to-pink-300/20 rounded-full blur-3xl animate-pulse"></div>
            </div>

            <div className="relative z-10">
              <div className="inline-flex p-12 bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100 rounded-[3rem] shadow-2xl mb-8 ring-4 ring-indigo-200/50 ring-offset-4 animate-bounce">
                <Building2 className="w-32 h-32 text-indigo-600 drop-shadow-2xl" />
              </div>
              <h3 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 mb-5">
                No se encontraron centros ✨
              </h3>
              <p className="text-xl text-gray-600 font-bold mb-10 max-w-md mx-auto">
                Intenta ajustar los filtros o crea un nuevo centro para comenzar
              </p>
              <Link
                href="/admin/centros/nuevo"
                className="group inline-flex items-center gap-4 px-12 py-6 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white rounded-[2rem] font-black text-lg shadow-2xl hover:shadow-indigo-500/70 hover:scale-110 transition-all duration-500 ring-4 ring-indigo-400/50 ring-offset-4"
              >
                <Plus className="w-7 h-7 group-hover:rotate-90 transition-transform duration-500" />
                Crear Primer Centro
                <Sparkles className="w-7 h-7 group-hover:animate-spin" />
              </Link>
            </div>
          </div>
        )}

        {/* paginación */}
        {totalPages > 1 && centros.length > 0 && (
          <div className="mt-8 relative bg-white/90 backdrop-blur-2xl rounded-3xl shadow-2xl p-8 border-2 border-white/80 ring-4 ring-indigo-500/10 ring-offset-2">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 to-purple-500/5 rounded-3xl"></div>

            <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="text-base font-black text-gray-700 flex items-center gap-3">
                <div className="p-3 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-2xl ring-2 ring-indigo-200/50">
                  <Activity className="w-5 h-5 text-indigo-600 animate-pulse" />
                </div>
                Mostrando{" "}
                <span className="text-xl text-indigo-600 mx-2 px-3 py-1 bg-indigo-50 rounded-xl ring-2 ring-indigo-200/50">
                  {centros.length}
                </span>{" "}
                de{" "}
                <span className="text-xl text-purple-600 mx-2 px-3 py-1 bg-purple-50 rounded-xl ring-2 ring-purple-200/50">
                  {total}
                </span>{" "}
                centros
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setPage((p) => p - 1)}
                  disabled={page === 1}
                  className="group relative px-7 py-3.5 bg-white border-[3px] border-gray-300 rounded-2xl font-black text-gray-700 hover:border-indigo-600 hover:text-indigo-600 hover:shadow-2xl hover:shadow-indigo-500/30 hover:scale-110 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:border-gray-300 disabled:hover:text-gray-700 disabled:hover:scale-100 ring-2 ring-gray-200/50 overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <span className="relative z-10 flex items-center gap-2">
                    <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-300" />
                    Anterior
                  </span>
                </button>
                <div className="flex items-center gap-3">
                  {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                    let pageNum: number;
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
                        key={pageNum}
                        onClick={() => setPage(pageNum)}
                        className={`relative w-14 h-14 rounded-2xl font-black text-base transition-all duration-300 overflow-hidden ${
                          page === pageNum
                            ? "bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white shadow-2xl shadow-indigo-500/50 scale-125 ring-4 ring-indigo-400/50 ring-offset-2"
                            : "bg-white border-[3px] border-gray-300 text-gray-700 hover:border-indigo-600 hover:text-indigo-600 hover:shadow-xl hover:scale-110 ring-2 ring-gray-200/50"
                        }`}
                      >
                        <span className="relative z-10">{pageNum}</span>
                        {page === pageNum && (
                          <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                        )}
                      </button>
                    );
                  })}
                </div>
                <button
                  onClick={() => setPage((p) => p + 1)}
                  disabled={page === totalPages}
                  className="group relative px-7 py-3.5 bg-white border-[3px] border-gray-300 rounded-2xl font-black text-gray-700 hover:border-indigo-600 hover:text-indigo-600 hover:shadow-2xl hover:shadow-indigo-500/30 hover:scale-110 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:border-gray-300 disabled:hover:text-gray-700 disabled:hover:scale-100 ring-2 ring-gray-200/50 overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <span className="relative z-10 flex items-center gap-2">
                    Siguiente
                    <ChevronLeft className="w-5 h-5 rotate-180 group-hover:translate-x-1 transition-transform duration-300" />
                  </span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* estilos extra para las clases "raras" que pusiste */}
      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }

        .animate-shimmer {
          animation: shimmer 2s infinite;
        }

        .delay-100 {
          animation-delay: 100ms;
        }

        .delay-200 {
          animation-delay: 200ms;
        }

        .delay-300 {
          animation-delay: 300ms;
        }

        .delay-700 {
          animation-delay: 700ms;
        }

        /* para que no reviente con tailwind */
        .border-3,
        .border-[3px] {
          border-width: 3px;
        }
        .border-6,
        .border-[6px] {
          border-width: 6px;
        }
        .animate-reverse {
          animation-direction: reverse;
        }
      `}</style>
    </div>
  );
}
