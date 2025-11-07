// frontend/src/app/(dashboard)/admin/centros/[id]/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Building2,
  Edit,
  Trash2,
  Power,
  Ban,
  CheckCircle,
  RefreshCw,
  MapPin,
  Phone,
  Mail,
  Globe,
  Clock,
  Calendar,
  Users,
  Stethoscope,
  UserCheck,
  TrendingUp,
  Settings,
  BarChart3,
  Moon,
  Sun,
  Sparkles,
  AlertCircle,
  ChevronRight,
} from "lucide-react";

interface Centro {
  id_centro: number;
  nombre: string;
  razon_social: string;
  rut: string;
  direccion: string;
  ciudad: string;
  region: string;
  codigo_postal: string;
  telefono: string;
  email: string;
  sitio_web: string;
  logo_url: string;
  descripcion: string;
  horario_apertura: string;
  horario_cierre: string;
  dias_atencion: string;
  estado: string;
  fecha_inicio_operacion: string;
  capacidad_pacientes_dia: number;
  nivel_complejidad: string;
  especializacion_principal: string;
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
}

export default function DetalleCentroPage() {
  const params = useParams();
  const router = useRouter();
  const [centro, setCentro] = useState<Centro | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [darkMode, setDarkMode] = useState(false);

  const cargarCentro = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/centros/${params.id}`);
      const data = await response.json();

      if (data.success) {
        setCentro(data.data);
      } else {
        setError(data.error);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarCentro();
  }, [params.id]);

  const eliminarCentro = async () => {
    if (!confirm("⚠️ ¿ESTÁS SEGURO? Esta acción NO se puede deshacer.")) return;

    try {
      const response = await fetch(`/api/admin/centros/${params.id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (data.success) {
        alert("Centro eliminado exitosamente");
        router.push("/admin/centros");
      } else {
        alert(`Error: ${data.error}`);
      }
    } catch (error: any) {
      alert(`Error: ${error.message}`);
    }
  };

  const cambiarEstado = async (nuevoEstado: string) => {
    try {
      const response = await fetch(`/api/admin/centros/${params.id}/estado`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ estado: nuevoEstado }),
      });

      const data = await response.json();

      if (data.success) {
        alert(`Estado actualizado a: ${nuevoEstado}`);
        cargarCentro();
      } else {
        alert(`Error: ${data.error}`);
      }
    } catch (error: any) {
      alert(`Error: ${error.message}`);
    }
  };

  const EstadoBadge = ({ estado }: { estado: string }) => {
    const configs = {
      activo: {
        bg: darkMode 
          ? "bg-gradient-to-r from-emerald-900/50 to-teal-900/50 border-emerald-500/50" 
          : "bg-gradient-to-r from-emerald-500 to-teal-500 border-emerald-200",
        text: "text-white",
        icon: CheckCircle,
        label: "Activo",
      },
      inactivo: {
        bg: darkMode 
          ? "bg-gradient-to-r from-gray-800/50 to-slate-800/50 border-gray-500/50" 
          : "bg-gradient-to-r from-gray-500 to-slate-500 border-gray-200",
        text: "text-white",
        icon: Ban,
        label: "Inactivo",
      },
      suspendido: {
        bg: darkMode 
          ? "bg-gradient-to-r from-red-900/50 to-pink-900/50 border-red-500/50" 
          : "bg-gradient-to-r from-red-500 to-pink-500 border-red-200",
        text: "text-white",
        icon: AlertCircle,
        label: "Suspendido",
      },
    };

    const config = configs[estado as keyof typeof configs] || configs.inactivo;
    const Icon = config.icon;

    return (
      <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border-2 ${config.bg} ${config.text} font-bold text-sm shadow-lg hover:scale-105 transition-all duration-300`}>
        <Icon className="w-4 h-4" />
        {config.label}
      </div>
    );
  };

  if (loading) {
    return (
      <div className={`min-h-screen flex flex-col items-center justify-center p-4 ${darkMode ? 'bg-gradient-to-br from-slate-950 via-indigo-950 to-purple-950' : 'bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50'}`}>
        <div className="relative mb-8">
          <div className={`w-24 h-24 border-4 rounded-full animate-spin ${darkMode ? 'border-indigo-400 border-t-transparent' : 'border-indigo-600 border-t-transparent'}`}></div>
          <Sparkles className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-10 h-10 ${darkMode ? 'text-indigo-400' : 'text-indigo-600'} animate-pulse`} />
        </div>
        <h2 className={`text-2xl md:text-3xl font-black mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          Cargando información...
        </h2>
        <p className={`text-sm md:text-base ${darkMode ? 'text-indigo-300' : 'text-indigo-600'} font-medium`}>
          Obteniendo detalles del centro
        </p>
      </div>
    );
  }

  if (error || !centro) {
    return (
      <div className={`min-h-screen p-4 md:p-6 ${darkMode ? 'bg-gradient-to-br from-slate-950 via-indigo-950 to-purple-950' : 'bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50'}`}>
        <div className="max-w-4xl mx-auto">
          <div className={`rounded-2xl p-6 shadow-2xl mb-6 border ${
            darkMode 
              ? 'bg-gradient-to-r from-red-900/50 to-pink-900/50 border-red-500/20' 
              : 'bg-gradient-to-r from-red-50 to-pink-50 border-red-200'
          }`}>
            <div className="flex items-start gap-4">
              <div className={`p-3 rounded-xl flex-shrink-0 ${
                darkMode ? 'bg-white/20' : 'bg-red-100'
              } backdrop-blur-xl`}>
                <AlertCircle className={`w-6 h-6 ${darkMode ? 'text-red-400' : 'text-red-600'}`} />
              </div>
              <div className="flex-1">
                <h3 className={`text-xl font-black mb-2 ${darkMode ? 'text-white' : 'text-red-900'}`}>
                  Error al cargar centro
                </h3>
                <p className={`font-medium ${darkMode ? 'text-red-300' : 'text-red-600'}`}>
                  {error || "Centro no encontrado"}
                </p>
              </div>
            </div>
          </div>
          <Link
            href="/admin/centros"
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl shadow-lg hover:shadow-xl border transition-all duration-300 hover:scale-105 ${
              darkMode 
                ? 'bg-gray-800/50 backdrop-blur-xl border-gray-700 text-indigo-400' 
                : 'bg-white/80 backdrop-blur-xl border-white/50 text-indigo-600'
            } font-bold`}
          >
            <ArrowLeft className="w-4 h-4" />
            Volver a Centros
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 ${darkMode ? 'bg-gradient-to-br from-slate-950 via-indigo-950 to-purple-950' : 'bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50'} p-4 md:p-6 lg:p-8`}>
      <div className="max-w-7xl mx-auto">
        {/* Header Premium */}
        <div className="mb-6 md:mb-8">
          <div className="flex items-center justify-between mb-6">
            <Link
              href="/admin/centros"
              className={`group inline-flex items-center gap-2 px-4 py-2 rounded-xl shadow-lg hover:shadow-xl border transition-all duration-300 hover:scale-105 ${
                darkMode 
                  ? 'bg-gray-800/50 backdrop-blur-xl border-gray-700 text-indigo-400' 
                  : 'bg-white/80 backdrop-blur-xl border-white/50 text-indigo-600'
              } font-bold`}
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform duration-300" />
              Volver a Centros
            </Link>

            {/* Theme Toggle */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`p-3 rounded-xl font-semibold text-sm transition-all duration-300 shadow-lg hover:scale-110 ${
                darkMode
                  ? 'bg-gray-800 text-yellow-400 hover:bg-gray-700'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
              title={darkMode ? "Modo Claro" : "Modo Oscuro"}
            >
              {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
          </div>

          {/* Información Principal */}
          <div className={`relative overflow-hidden rounded-3xl shadow-2xl p-6 md:p-8 border ${
            darkMode 
              ? 'bg-gradient-to-r from-indigo-900/50 to-purple-900/50 border-indigo-500/20' 
              : 'bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 border-indigo-200'
          }`}>
            {/* Patrón de fondo */}
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzBoLTJWMGgydjMwem0tOCAwTDE4IDBoMnYzMGgtOHptMTYgMGgtMlYwaDJ2MzB6bTggMGgtMlYwaDJ2MzB6bS0yNCAwTDEwIDBoMnYzMGgtOHptMzIgMGgtMlYwaDJ2MzB6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-20"></div>
            
            <div className="relative z-10">
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                <div className="flex items-start gap-4 flex-1">
                  {centro.logo_url ? (
                    <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-white shadow-xl p-2 overflow-hidden flex-shrink-0">
                      <img
                        src={centro.logo_url}
                        alt={centro.nombre}
                        className="w-full h-full object-contain"
                      />
                    </div>
                  ) : (
                    <div className={`w-16 h-16 md:w-20 md:h-20 rounded-2xl shadow-xl flex items-center justify-center flex-shrink-0 ${
                      darkMode ? 'bg-white/20' : 'bg-white/20'
                    } backdrop-blur-xl`}>
                      <Building2 className="w-8 h-8 md:w-10 md:h-10 text-white" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h1 className="text-2xl md:text-3xl lg:text-4xl font-black text-white mb-2 tracking-tight">
                      {centro.nombre}
                    </h1>
                    <p className="text-base md:text-lg text-white/90 font-medium mb-3">
                      {centro.razon_social}
                    </p>
                    <EstadoBadge estado={centro.estado} />
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 md:gap-3">
                  {centro.estado === "activo" && (
                    <>
                      <button
                        onClick={() => cambiarEstado("inactivo")}
                        className="px-4 py-2 bg-white/20 backdrop-blur-xl border border-white/30 text-white rounded-xl hover:bg-white/30 flex items-center gap-2 font-bold transition-all duration-300 hover:scale-105 shadow-lg"
                      >
                        <Power className="w-4 h-4" />
                        <span className="hidden md:inline">Desactivar</span>
                      </button>
                      <button
                        onClick={() => cambiarEstado("suspendido")}
                        className="px-4 py-2 bg-red-500/80 backdrop-blur-xl border border-red-400/50 text-white rounded-xl hover:bg-red-600 flex items-center gap-2 font-bold transition-all duration-300 hover:scale-105 shadow-lg"
                      >
                        <Ban className="w-4 h-4" />
                        <span className="hidden md:inline">Suspender</span>
                      </button>
                    </>
                  )}

                  {centro.estado === "inactivo" && (
                    <button
                      onClick={() => cambiarEstado("activo")}
                      className="px-4 py-2 bg-emerald-500/80 backdrop-blur-xl border border-emerald-400/50 text-white rounded-xl hover:bg-emerald-600 flex items-center gap-2 font-bold transition-all duration-300 hover:scale-105 shadow-lg"
                    >
                      <CheckCircle className="w-4 h-4" />
                      <span className="hidden md:inline">Activar</span>
                    </button>
                  )}

                  {centro.estado === "suspendido" && (
                    <button
                      onClick={() => cambiarEstado("activo")}
                      className="px-4 py-2 bg-blue-500/80 backdrop-blur-xl border border-blue-400/50 text-white rounded-xl hover:bg-blue-600 flex items-center gap-2 font-bold transition-all duration-300 hover:scale-105 shadow-lg"
                    >
                      <RefreshCw className="w-4 h-4" />
                      <span className="hidden md:inline">Restaurar</span>
                    </button>
                  )}

                  <Link
                    href={`/admin/centros/${centro.id_centro}/editar`}
                    className="px-4 py-2 bg-white text-indigo-600 rounded-xl hover:bg-gray-50 flex items-center gap-2 font-bold transition-all duration-300 hover:scale-105 shadow-lg"
                  >
                    <Edit className="w-4 h-4" />
                    <span className="hidden md:inline">Editar</span>
                  </Link>

                  <button
                    onClick={eliminarCentro}
                    className="px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 flex items-center gap-2 font-bold transition-all duration-300 hover:scale-105 shadow-lg"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span className="hidden md:inline">Eliminar</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Estadísticas Rápidas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
          {/* Usuarios */}
          <div className={`relative overflow-hidden rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-500 group hover:scale-105 border ${
            darkMode 
              ? 'bg-gradient-to-br from-blue-900/30 to-indigo-900/30 border-blue-500/20' 
              : 'bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200'
          }`}>
            <div className={`absolute top-0 right-0 w-24 h-24 md:w-32 md:h-32 rounded-full blur-3xl transition-all duration-500 ${
              darkMode ? 'bg-blue-500/20 group-hover:bg-blue-500/30' : 'bg-blue-300/30 group-hover:bg-blue-300/50'
            }`}></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 md:w-14 md:h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Users className="w-6 h-6 md:w-7 md:h-7 text-white" />
                </div>
                <span className={`text-xs font-bold uppercase tracking-wider ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                  Usuarios
                </span>
              </div>
              <p className={`text-3xl md:text-4xl font-black mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {centro.usuarios_count}
              </p>
              <p className="text-sm text-green-500 font-bold flex items-center gap-1">
                <CheckCircle className="w-4 h-4" />
                {centro.usuarios_activos} activos
              </p>
            </div>
          </div>

          {/* Médicos */}
          <div className={`relative overflow-hidden rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-500 group hover:scale-105 border ${
            darkMode 
              ? 'bg-gradient-to-br from-green-900/30 to-emerald-900/30 border-green-500/20' 
              : 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-200'
          }`}>
            <div className={`absolute top-0 right-0 w-24 h-24 md:w-32 md:h-32 rounded-full blur-3xl transition-all duration-500 ${
              darkMode ? 'bg-green-500/20 group-hover:bg-green-500/30' : 'bg-green-300/30 group-hover:bg-green-300/50'
            }`}></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 md:w-14 md:h-14 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Stethoscope className="w-6 h-6 md:w-7 md:h-7 text-white" />
                </div>
                <span className={`text-xs font-bold uppercase tracking-wider ${darkMode ? 'text-green-400' : 'text-green-600'}`}>
                  Médicos
                </span>
              </div>
              <p className={`text-3xl md:text-4xl font-black mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {centro.medicos_count}
              </p>
              <p className="text-sm text-green-500 font-bold flex items-center gap-1">
                <CheckCircle className="w-4 h-4" />
                {centro.medicos_activos} activos
              </p>
            </div>
          </div>

          {/* Pacientes */}
          <div className={`relative overflow-hidden rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-500 group hover:scale-105 border ${
            darkMode 
              ? 'bg-gradient-to-br from-purple-900/30 to-pink-900/30 border-purple-500/20' 
              : 'bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200'
          }`}>
            <div className={`absolute top-0 right-0 w-24 h-24 md:w-32 md:h-32 rounded-full blur-3xl transition-all duration-500 ${
              darkMode ? 'bg-purple-500/20 group-hover:bg-purple-500/30' : 'bg-purple-300/30 group-hover:bg-purple-300/50'
            }`}></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 md:w-14 md:h-14 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
                  <UserCheck className="w-6 h-6 md:w-7 md:h-7 text-white" />
                </div>
                <span className={`text-xs font-bold uppercase tracking-wider ${darkMode ? 'text-purple-400' : 'text-purple-600'}`}>
                  Pacientes
                </span>
              </div>
              <p className={`text-3xl md:text-4xl font-black mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {centro.pacientes_count}
              </p>
              <p className="text-sm text-green-500 font-bold flex items-center gap-1">
                <CheckCircle className="w-4 h-4" />
                {centro.pacientes_activos} activos
              </p>
            </div>
          </div>

          {/* Consultas */}
          <div className={`relative overflow-hidden rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-500 group hover:scale-105 border ${
            darkMode 
              ? 'bg-gradient-to-br from-orange-900/30 to-red-900/30 border-orange-500/20' 
              : 'bg-gradient-to-br from-orange-50 to-red-50 border-orange-200'
          }`}>
            <div className={`absolute top-0 right-0 w-24 h-24 md:w-32 md:h-32 rounded-full blur-3xl transition-all duration-500 ${
              darkMode ? 'bg-orange-500/20 group-hover:bg-orange-500/30' : 'bg-orange-300/30 group-hover:bg-orange-300/50'
            }`}></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 md:w-14 md:h-14 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg">
                  <TrendingUp className="w-6 h-6 md:w-7 md:h-7 text-white" />
                </div>
                <span className={`text-xs font-bold uppercase tracking-wider ${darkMode ? 'text-orange-400' : 'text-orange-600'}`}>
                  Consultas
                </span>
              </div>
              <p className={`text-3xl md:text-4xl font-black mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {centro.consultas_mes}
              </p>
              <p className={`text-sm font-bold ${darkMode ? 'text-orange-400' : 'text-orange-600'}`}>
                Este mes
              </p>
            </div>
          </div>
        </div>

        {/* Accesos Rápidos */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
          <Link
            href={`/admin/centros/${centro.id_centro}/usuarios`}
            className="group relative overflow-hidden bg-gradient-to-br from-blue-500 to-indigo-600 text-white p-6 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-105"
          >
            <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative z-10">
              <Users className="w-10 h-10 mb-4 group-hover:scale-110 transition-transform duration-500" />
              <h3 className="text-xl font-black mb-2">Usuarios</h3>
              <p className="text-sm opacity-90 mb-3">Gestionar usuarios del centro</p>
              <ChevronRight className="w-5 h-5 group-hover:translate-x-2 transition-transform duration-300" />
            </div>
          </Link>

          <Link
            href={`/admin/centros/${centro.id_centro}/medicos`}
            className="group relative overflow-hidden bg-gradient-to-br from-green-500 to-emerald-600 text-white p-6 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-105"
          >
            <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative z-10">
              <Stethoscope className="w-10 h-10 mb-4 group-hover:scale-110 transition-transform duration-500" />
              <h3 className="text-xl font-black mb-2">Médicos</h3>
              <p className="text-sm opacity-90 mb-3">Ver médicos del centro</p>
              <ChevronRight className="w-5 h-5 group-hover:translate-x-2 transition-transform duration-300" />
            </div>
          </Link>

          <Link
            href={`/admin/centros/${centro.id_centro}/pacientes`}
            className="group relative overflow-hidden bg-gradient-to-br from-purple-500 to-pink-600 text-white p-6 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-105"
          >
            <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative z-10">
              <UserCheck className="w-10 h-10 mb-4 group-hover:scale-110 transition-transform duration-500" />
              <h3 className="text-xl font-black mb-2">Pacientes</h3>
              <p className="text-sm opacity-90 mb-3">Ver pacientes registrados</p>
              <ChevronRight className="w-5 h-5 group-hover:translate-x-2 transition-transform duration-300" />
            </div>
          </Link>

          <Link
            href={`/admin/centros/${centro.id_centro}/estadisticas`}
            className="group relative overflow-hidden bg-gradient-to-br from-orange-500 to-red-600 text-white p-6 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-105"
          >
            <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative z-10">
              <BarChart3 className="w-10 h-10 mb-4 group-hover:scale-110 transition-transform duration-500" />
              <h3 className="text-xl font-black mb-2">Estadísticas</h3>
              <p className="text-sm opacity-90 mb-3">Ver estadísticas detalladas</p>
              <ChevronRight className="w-5 h-5 group-hover:translate-x-2 transition-transform duration-300" />
            </div>
          </Link>
        </div>

        {/* Información Detallada */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
          {/* Información General */}
          <div className={`rounded-2xl p-6 md:p-8 shadow-xl border ${
            darkMode 
              ? 'bg-gray-800/50 backdrop-blur-xl border-gray-700' 
              : 'bg-white/80 backdrop-blur-xl border-white/50'
          }`}>
            <h2 className={`text-xl md:text-2xl font-black mb-6 flex items-center gap-3 ${
              darkMode ? 'text-white' : 'text-gray-900'
            }`}>
              <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl">
                <Building2 className="w-5 h-5 text-white" />
              </div>
              Información General
            </h2>

            <div className="space-y-5">
              <div>
                <label className={`text-sm font-bold uppercase tracking-wider mb-2 block ${
                  darkMode ? 'text-blue-400' : 'text-blue-600'
                }`}>
                  RUT
                </label>
                <p className={`text-lg font-semibold font-mono ${
                  darkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  {centro.rut}
                </p>
              </div>

              <div>
                <label className={`text-sm font-bold uppercase tracking-wider mb-2 block ${
                  darkMode ? 'text-blue-400' : 'text-blue-600'
                }`}>
                  Razón Social
                </label>
                <p className={`text-lg font-semibold ${
                  darkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  {centro.razon_social}
                </p>
              </div>

              <div>
                <label className={`text-sm font-bold uppercase tracking-wider mb-2 block ${
                  darkMode ? 'text-blue-400' : 'text-blue-600'
                }`}>
                  Descripción
                </label>
                <p className={`text-base ${
                  darkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  {centro.descripcion || "Sin descripción"}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`text-sm font-bold uppercase tracking-wider mb-2 block ${
                    darkMode ? 'text-blue-400' : 'text-blue-600'
                  }`}>
                    Complejidad
                  </label>
                  <div className={`inline-flex px-3 py-1.5 rounded-lg font-bold text-sm ${
                    centro.nivel_complejidad === 'alta' 
                      ? 'bg-red-500/20 text-red-500'
                      : centro.nivel_complejidad === 'media'
                      ? 'bg-yellow-500/20 text-yellow-500'
                      : 'bg-green-500/20 text-green-500'
                  }`}>
                    {centro.nivel_complejidad === 'alta' ? '🔴' : centro.nivel_complejidad === 'media' ? '🟡' : '🟢'} {centro.nivel_complejidad}
                  </div>
                </div>

                <div>
                  <label className={`text-sm font-bold uppercase tracking-wider mb-2 block ${
                    darkMode ? 'text-blue-400' : 'text-blue-600'
                  }`}>
                    Capacidad Diaria
                  </label>
                  <p className={`text-lg font-black ${
                    darkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    {centro.capacidad_pacientes_dia} <span className="text-sm font-normal">pac/día</span>
                  </p>
                </div>
              </div>

              <div>
                <label className={`text-sm font-bold uppercase tracking-wider mb-2 block ${
                  darkMode ? 'text-blue-400' : 'text-blue-600'
                }`}>
                  Especialización Principal
                </label>
                <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl font-bold ${
                  darkMode ? 'bg-purple-500/20 text-purple-400' : 'bg-purple-100 text-purple-700'
                }`}>
                  <Sparkles className="w-4 h-4" />
                  {centro.especializacion_principal || "No especificada"}
                </div>
              </div>
            </div>
          </div>

          {/* Contacto y Ubicación */}
          <div className={`rounded-2xl p-6 md:p-8 shadow-xl border ${
            darkMode 
              ? 'bg-gray-800/50 backdrop-blur-xl border-gray-700' 
              : 'bg-white/80 backdrop-blur-xl border-white/50'
          }`}>
            <h2 className={`text-xl md:text-2xl font-black mb-6 flex items-center gap-3 ${
              darkMode ? 'text-white' : 'text-gray-900'
            }`}>
              <div className="p-2 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl">
                <MapPin className="w-5 h-5 text-white" />
              </div>
              Contacto y Ubicación
            </h2>

            <div className="space-y-5">
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-xl flex-shrink-0 ${
                  darkMode ? 'bg-emerald-500/20' : 'bg-emerald-100'
                }`}>
                  <MapPin className={`w-6 h-6 ${
                    darkMode ? 'text-emerald-400' : 'text-emerald-600'
                  }`} />
                </div>
                <div className="flex-1">
                  <label className={`text-sm font-bold uppercase tracking-wider mb-2 block ${
                    darkMode ? 'text-emerald-400' : 'text-emerald-600'
                  }`}>
                    Dirección
                  </label>
                  <p className={`text-base font-semibold mb-1 ${
                    darkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    {centro.direccion}
                  </p>
                  <p className={`text-sm ${
                    darkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    {centro.ciudad}, {centro.region}
                  </p>
                  {centro.codigo_postal && (
                    <p className={`text-sm font-mono ${
                      darkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      CP: {centro.codigo_postal}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-xl flex-shrink-0 ${
                  darkMode ? 'bg-blue-500/20' : 'bg-blue-100'
                }`}>
                  <Phone className={`w-6 h-6 ${
                    darkMode ? 'text-blue-400' : 'text-blue-600'
                  }`} />
                </div>
                <div className="flex-1">
                  <label className={`text-sm font-bold uppercase tracking-wider mb-1 block ${
                    darkMode ? 'text-blue-400' : 'text-blue-600'
                  }`}>
                    Teléfono
                  </label>
                  <a href={`tel:${centro.telefono}`} className={`text-lg font-semibold hover:underline ${
                    darkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    {centro.telefono}
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-xl flex-shrink-0 ${
                  darkMode ? 'bg-purple-500/20' : 'bg-purple-100'
                }`}>
                  <Mail className={`w-6 h-6 ${
                    darkMode ? 'text-purple-400' : 'text-purple-600'
                  }`} />
                </div>
                <div className="flex-1">
                  <label className={`text-sm font-bold uppercase tracking-wider mb-1 block ${
                    darkMode ? 'text-purple-400' : 'text-purple-600'
                  }`}>
                    Email
                  </label>
                  <a href={`mailto:${centro.email}`} className={`text-base font-semibold hover:underline ${
                    darkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    {centro.email}
                  </a>
                </div>
              </div>

              {centro.sitio_web && (
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-xl flex-shrink-0 ${
                    darkMode ? 'bg-indigo-500/20' : 'bg-indigo-100'
                  }`}>
                    <Globe className={`w-6 h-6 ${
                      darkMode ? 'text-indigo-400' : 'text-indigo-600'
                    }`} />
                  </div>
                  <div className="flex-1">
                    <label className={`text-sm font-bold uppercase tracking-wider mb-1 block ${
                      darkMode ? 'text-indigo-400' : 'text-indigo-600'
                    }`}>
                      Sitio Web
                    </label>
                    <a
                      href={centro.sitio_web}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-base font-semibold text-blue-500 hover:text-blue-600 hover:underline flex items-center gap-2"
                    >
                      {centro.sitio_web}
                      <ChevronRight className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Horarios */}
          <div className={`rounded-2xl p-6 md:p-8 shadow-xl border ${
            darkMode 
              ? 'bg-gray-800/50 backdrop-blur-xl border-gray-700' 
              : 'bg-white/80 backdrop-blur-xl border-white/50'
          }`}>
            <h2 className={`text-xl md:text-2xl font-black mb-6 flex items-center gap-3 ${
              darkMode ? 'text-white' : 'text-gray-900'
            }`}>
              <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl">
                <Clock className="w-5 h-5 text-white" />
              </div>
              Horarios de Atención
            </h2>

            <div className="space-y-5">
              <div>
                <label className={`text-sm font-bold uppercase tracking-wider mb-3 block ${
                  darkMode ? 'text-purple-400' : 'text-purple-600'
                }`}>
                  Días de Atención
                </label>
                <div className={`inline-flex items-center gap-2 px-4 py-3 rounded-xl font-bold text-lg ${
                  darkMode ? 'bg-purple-500/20 text-purple-400' : 'bg-purple-100 text-purple-700'
                }`}>
                  <Calendar className="w-5 h-5" />
                  {centro.dias_atencion}
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <label className={`text-sm font-bold uppercase tracking-wider mb-3 block ${
                    darkMode ? 'text-purple-400' : 'text-purple-600'
                  }`}>
                    Apertura
                  </label>
                  <div className={`text-center p-4 rounded-xl ${
                    darkMode ? 'bg-emerald-500/20' : 'bg-emerald-100'
                  }`}>
                    <p className={`text-3xl font-black ${
                      darkMode ? 'text-emerald-400' : 'text-emerald-600'
                    }`}>
                      {centro.horario_apertura}
                    </p>
                  </div>
                </div>
                <div className={`text-2xl font-black ${
                  darkMode ? 'text-purple-400' : 'text-purple-600'
                }`}>
                  →
                </div>
                <div className="flex-1">
                  <label className={`text-sm font-bold uppercase tracking-wider mb-3 block ${
                    darkMode ? 'text-purple-400' : 'text-purple-600'
                  }`}>
                    Cierre
                  </label>
                  <div className={`text-center p-4 rounded-xl ${
                    darkMode ? 'bg-red-500/20' : 'bg-red-100'
                  }`}>
                    <p className={`text-3xl font-black ${
                      darkMode ? 'text-red-400' : 'text-red-600'
                    }`}>
                      {centro.horario_cierre}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Fechas */}
          <div className={`rounded-2xl p-6 md:p-8 shadow-xl border ${
            darkMode 
              ? 'bg-gray-800/50 backdrop-blur-xl border-gray-700' 
              : 'bg-white/80 backdrop-blur-xl border-white/50'
          }`}>
            <h2 className={`text-xl md:text-2xl font-black mb-6 flex items-center gap-3 ${
              darkMode ? 'text-white' : 'text-gray-900'
            }`}>
              <div className="p-2 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl">
                <Calendar className="w-5 h-5 text-white" />
              </div>
              Información de Fechas
            </h2>

            <div className="space-y-5">
              <div>
                <label className={`text-sm font-bold uppercase tracking-wider mb-2 block ${
                  darkMode ? 'text-amber-400' : 'text-amber-600'
                }`}>
                  Fecha de Creación
                </label>
                <p className={`text-base font-semibold ${
                  darkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  {new Date(centro.fecha_creacion).toLocaleDateString("es-CL", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>

              <div>
                <label className={`text-sm font-bold uppercase tracking-wider mb-2 block ${
                  darkMode ? 'text-amber-400' : 'text-amber-600'
                }`}>
                  Última Actualización
                </label>
                <p className={`text-base font-semibold ${
                  darkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  {new Date(centro.fecha_actualizacion).toLocaleDateString("es-CL", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>

              {centro.fecha_inicio_operacion && (
                <div>
                  <label className={`text-sm font-bold uppercase tracking-wider mb-2 block ${
                    darkMode ? 'text-amber-400' : 'text-amber-600'
                  }`}>
                    Inicio de Operaciones
                  </label>
                  <p className={`text-base font-semibold ${
                    darkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    {new Date(centro.fecha_inicio_operacion).toLocaleDateString("es-CL", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Acciones Adicionales */}
        <div className={`mt-6 md:mt-8 rounded-2xl p-6 md:p-8 shadow-xl border ${
          darkMode 
            ? 'bg-gray-800/50 backdrop-blur-xl border-gray-700' 
            : 'bg-white/80 backdrop-blur-xl border-white/50'
        }`}>
          <h2 className={`text-xl md:text-2xl font-black mb-6 flex items-center gap-3 ${
            darkMode ? 'text-white' : 'text-gray-900'
          }`}>
            <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl">
              <Settings className="w-5 h-5 text-white" />
            </div>
            Acciones Adicionales
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              href={`/admin/centros/${centro.id_centro}/configuracion`}
              className={`group flex items-center gap-4 p-5 rounded-xl border-2 transition-all duration-300 hover:scale-105 shadow-lg ${
                darkMode 
                  ? 'border-gray-700 bg-gray-900/50 hover:border-blue-500/50' 
                  : 'border-gray-200 bg-white hover:border-blue-300'
              }`}
            >
              <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
                <Settings className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className={`font-black text-base mb-1 ${
                  darkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  Configuración
                </h3>
                <p className={`text-sm ${
                  darkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  Ajustes avanzados
                </p>
              </div>
              <ChevronRight className={`w-5 h-5 group-hover:translate-x-2 transition-transform duration-300 ${
                darkMode ? 'text-blue-400' : 'text-blue-600'
              }`} />
            </Link>

            <button
              onClick={cargarCentro}
              className={`group flex items-center gap-4 p-5 rounded-xl border-2 transition-all duration-300 hover:scale-105 shadow-lg ${
                darkMode 
                  ? 'border-gray-700 bg-gray-900/50 hover:border-green-500/50' 
                  : 'border-gray-200 bg-white hover:border-green-300'
              }`}
            >
              <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-lg">
                <RefreshCw className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1 text-left">
                <h3 className={`font-black text-base mb-1 ${
                  darkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  Actualizar
                </h3>
                <p className={`text-sm ${
                  darkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  Recargar datos
                </p>
              </div>
              <ChevronRight className={`w-5 h-5 group-hover:translate-x-2 transition-transform duration-300 ${
                darkMode ? 'text-green-400' : 'text-green-600'
              }`} />
            </button>

            <Link
              href={`/admin/centros/${centro.id_centro}/logs`}
              className={`group flex items-center gap-4 p-5 rounded-xl border-2 transition-all duration-300 hover:scale-105 shadow-lg ${
                darkMode 
                  ? 'border-gray-700 bg-gray-900/50 hover:border-purple-500/50' 
                  : 'border-gray-200 bg-white hover:border-purple-300'
              }`}
            >
              <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl shadow-lg">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className={`font-black text-base mb-1 ${
                  darkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  Historial
                </h3>
                <p className={`text-sm ${
                  darkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  Ver logs
                </p>
              </div>
              <ChevronRight className={`w-5 h-5 group-hover:translate-x-2 transition-transform duration-300 ${
                darkMode ? 'text-purple-400' : 'text-purple-600'
              }`} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}