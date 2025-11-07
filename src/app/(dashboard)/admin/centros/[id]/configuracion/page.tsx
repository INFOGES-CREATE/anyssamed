// frontend/src/app/(dashboard)/admin/centros/[id]/configuracion/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Settings,
  Save,
  RefreshCw,
  Clock,
  Calendar,
  Users,
  Award,
  Globe,
  Image,
  Moon,
  Sun,
  Sparkles,
  CheckCircle,
  AlertCircle,
  Building2,
  Zap,
  Eye,
} from "lucide-react";

interface Configuracion {
  horario_apertura: string;
  horario_cierre: string;
  dias_atencion: string;
  capacidad_pacientes_dia: number;
  nivel_complejidad: string;
  especializacion_principal: string;
  sitio_web: string;
  logo_url: string;
}

export default function ConfiguracionCentroPage() {
  const params = useParams();
  const router = useRouter();
  const [config, setConfig] = useState<Configuracion | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [darkMode, setDarkMode] = useState(false);

  const cargarConfiguracion = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/centros/${params.id}/configuracion`);
      const data = await response.json();

      if (data.success) {
        setConfig(data.data);
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
    cargarConfiguracion();
  }, [params.id]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    if (!config) return;
    const { name, value } = e.target;
    setConfig({ ...config, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch(`/api/admin/centros/${params.id}/configuracion`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess("✅ Configuración actualizada exitosamente");
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError(data.error || "Error al actualizar configuración");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className={`min-h-screen flex flex-col items-center justify-center p-4 ${darkMode ? 'bg-gradient-to-br from-slate-950 via-indigo-950 to-purple-950' : 'bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50'}`}>
        <div className="relative mb-8">
          <div className={`w-24 h-24 border-4 rounded-full animate-spin ${darkMode ? 'border-indigo-400 border-t-transparent' : 'border-indigo-600 border-t-transparent'}`}></div>
          <Sparkles className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-10 h-10 ${darkMode ? 'text-indigo-400' : 'text-indigo-600'} animate-pulse`} />
        </div>
        <h2 className={`text-2xl md:text-3xl font-black mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          Cargando configuración...
        </h2>
        <p className={`text-sm md:text-base ${darkMode ? 'text-indigo-300' : 'text-indigo-600'} font-medium`}>
          Obteniendo parámetros del centro
        </p>
      </div>
    );
  }

  if (!config) {
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
                  Error al cargar configuración
                </h3>
                <p className={`font-medium ${darkMode ? 'text-red-300' : 'text-red-600'}`}>
                  {error || "No se pudo cargar la configuración"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 ${darkMode ? 'bg-gradient-to-br from-slate-950 via-indigo-950 to-purple-950' : 'bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50'} p-4 md:p-6 lg:p-8`}>
      <div className="max-w-5xl mx-auto">
        {/* Header Premium */}
        <div className="mb-6 md:mb-8">
          <div className="flex items-center justify-between mb-6">
            <Link
              href={`/admin/centros/${params.id}`}
              className={`group inline-flex items-center gap-2 px-4 py-2 rounded-xl shadow-lg hover:shadow-xl border transition-all duration-300 hover:scale-105 ${
                darkMode 
                  ? 'bg-gray-800/50 backdrop-blur-xl border-gray-700 text-indigo-400' 
                  : 'bg-white/80 backdrop-blur-xl border-white/50 text-indigo-600'
              } font-bold`}
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform duration-300" />
              Volver al Centro
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

          {/* Título Principal */}
          <div className={`relative overflow-hidden rounded-3xl shadow-2xl p-6 md:p-10 border ${
            darkMode 
              ? 'bg-gradient-to-r from-indigo-900/50 to-purple-900/50 border-indigo-500/20' 
              : 'bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 border-indigo-200'
          }`}>
            {/* Patrón de fondo decorativo */}
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzBoLTJWMGgydjMwem0tOCAwTDE4IDBoMnYzMGgtOHptMTYgMGgtMlYwaDJ2MzB6bTggMGgtMlYwaDJ2MzB6bS0yNCAwTDEwIDBoMnYzMGgtOHptMzIgMGgtMlYwaDJ2MzB6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-20"></div>
            
            <div className="relative z-10 flex items-center gap-4">
              <div className={`p-4 rounded-2xl shadow-xl ${darkMode ? 'bg-white/20' : 'bg-white/20'} backdrop-blur-xl`}>
                <Settings className="w-10 h-10 md:w-12 md:h-12 text-white" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-black text-white mb-2 tracking-tight">
                  Configuración Avanzada
                </h1>
                <p className="text-base md:text-lg text-white/90 font-medium">
                  Ajusta los parámetros operativos del centro médico
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Success Message Premium */}
        {success && (
          <div className={`rounded-2xl p-6 shadow-2xl mb-8 animate-slide-in-down border ${
            darkMode 
              ? 'bg-gradient-to-r from-emerald-900/50 to-teal-900/50 border-emerald-500/20' 
              : 'bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-200'
          }`}>
            <div className="flex items-start gap-4">
              <div className={`p-3 rounded-xl flex-shrink-0 ${
                darkMode ? 'bg-white/20' : 'bg-emerald-100'
              } backdrop-blur-xl`}>
                <CheckCircle className={`w-6 h-6 ${darkMode ? 'text-emerald-400' : 'text-emerald-600'}`} />
              </div>
              <div className="flex-1">
                <p className={`text-lg font-black ${darkMode ? 'text-white' : 'text-emerald-900'}`}>
                  {success}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Error Message Premium */}
        {error && (
          <div className={`rounded-2xl p-6 shadow-2xl mb-8 animate-shake border ${
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
                  Error
                </h3>
                <p className={`font-medium ${darkMode ? 'text-red-300' : 'text-red-600'}`}>{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Formulario Premium */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Horarios de Atención */}
          <div className={`rounded-2xl shadow-xl border overflow-hidden ${
            darkMode 
              ? 'bg-gray-800/50 backdrop-blur-xl border-gray-700' 
              : 'bg-white/80 backdrop-blur-xl border-white/50'
          }`}>
            <div className="bg-gradient-to-r from-blue-500 to-cyan-500 p-6">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-xl ${darkMode ? 'bg-white/20' : 'bg-white/20'} backdrop-blur-xl`}>
                  <Clock className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-2xl font-black text-white">Horarios de Atención</h2>
              </div>
            </div>

            <div className="p-6 md:p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Horario Apertura */}
                <div className="group">
                  <label className={`block text-sm font-black mb-2 uppercase tracking-wide ${
                    darkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Horario de Apertura
                  </label>
                  <div className="relative">
                    <Clock className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors duration-300 ${
                      darkMode 
                        ? 'text-gray-500 group-focus-within:text-blue-400' 
                        : 'text-gray-400 group-focus-within:text-blue-600'
                    }`} />
                    <input
                      type="time"
                      name="horario_apertura"
                      value={config.horario_apertura}
                      onChange={handleChange}
                      className={`w-full pl-12 pr-4 py-4 rounded-xl outline-none transition-all duration-300 font-semibold border-2 ${
                        darkMode
                          ? 'bg-gray-900/50 border-gray-700 text-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20'
                          : 'bg-white border-gray-200 text-gray-900 focus:border-blue-600 focus:ring-4 focus:ring-blue-100'
                      }`}
                    />
                  </div>
                </div>

                {/* Horario Cierre */}
                <div className="group">
                  <label className={`block text-sm font-black mb-2 uppercase tracking-wide ${
                    darkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Horario de Cierre
                  </label>
                  <div className="relative">
                    <Clock className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors duration-300 ${
                      darkMode 
                        ? 'text-gray-500 group-focus-within:text-blue-400' 
                        : 'text-gray-400 group-focus-within:text-blue-600'
                    }`} />
                    <input
                      type="time"
                      name="horario_cierre"
                      value={config.horario_cierre}
                      onChange={handleChange}
                      className={`w-full pl-12 pr-4 py-4 rounded-xl outline-none transition-all duration-300 font-semibold border-2 ${
                        darkMode
                          ? 'bg-gray-900/50 border-gray-700 text-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20'
                          : 'bg-white border-gray-200 text-gray-900 focus:border-blue-600 focus:ring-4 focus:ring-blue-100'
                      }`}
                    />
                  </div>
                </div>

                {/* Días de Atención */}
                <div className="md:col-span-2 group">
                  <label className={`block text-sm font-black mb-2 uppercase tracking-wide ${
                    darkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Días de Atención
                  </label>
                  <div className="relative">
                    <Calendar className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors duration-300 ${
                      darkMode 
                        ? 'text-gray-500 group-focus-within:text-blue-400' 
                        : 'text-gray-400 group-focus-within:text-blue-600'
                    }`} />
                    <input
                      type="text"
                      name="dias_atencion"
                      value={config.dias_atencion}
                      onChange={handleChange}
                      placeholder="Ej: Lunes a Viernes"
                      className={`w-full pl-12 pr-4 py-4 rounded-xl outline-none transition-all duration-300 font-semibold border-2 ${
                        darkMode
                          ? 'bg-gray-900/50 border-gray-700 text-white placeholder:text-gray-500 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20'
                          : 'bg-white border-gray-200 text-gray-900 placeholder:text-gray-400 focus:border-blue-600 focus:ring-4 focus:ring-blue-100'
                      }`}
                    />
                  </div>
                  <p className={`text-sm mt-2 ml-12 font-medium ${
                    darkMode ? 'text-blue-400' : 'text-blue-600'
                  }`}>
                    Especifica los días de atención del centro
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Capacidad y Complejidad */}
          <div className={`rounded-2xl shadow-xl border overflow-hidden ${
            darkMode 
              ? 'bg-gray-800/50 backdrop-blur-xl border-gray-700' 
              : 'bg-white/80 backdrop-blur-xl border-white/50'
          }`}>
            <div className="bg-gradient-to-r from-emerald-500 to-teal-500 p-6">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-xl ${darkMode ? 'bg-white/20' : 'bg-white/20'} backdrop-blur-xl`}>
                  <Users className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-2xl font-black text-white">Capacidad y Complejidad</h2>
              </div>
            </div>

            <div className="p-6 md:p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Capacidad Pacientes */}
                <div className="group">
                  <label className={`block text-sm font-black mb-2 uppercase tracking-wide ${
                    darkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Capacidad de Pacientes por Día
                  </label>
                  <div className="relative">
                    <Users className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors duration-300 ${
                      darkMode 
                        ? 'text-gray-500 group-focus-within:text-emerald-400' 
                        : 'text-gray-400 group-focus-within:text-emerald-600'
                    }`} />
                    <input
                      type="number"
                      name="capacidad_pacientes_dia"
                      value={config.capacidad_pacientes_dia}
                      onChange={handleChange}
                      min="1"
                      className={`w-full pl-12 pr-4 py-4 rounded-xl outline-none transition-all duration-300 font-semibold border-2 ${
                        darkMode
                          ? 'bg-gray-900/50 border-gray-700 text-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/20'
                          : 'bg-white border-gray-200 text-gray-900 focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100'
                      }`}
                    />
                  </div>
                  <p className={`text-sm mt-2 ml-12 font-medium ${
                    darkMode ? 'text-emerald-400' : 'text-emerald-600'
                  }`}>
                    Número máximo de pacientes que puede atender el centro por día
                  </p>
                </div>

                {/* Nivel Complejidad */}
                <div className="group">
                  <label className={`block text-sm font-black mb-2 uppercase tracking-wide ${
                    darkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Nivel de Complejidad
                  </label>
                  <div className="relative">
                    <Zap className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors duration-300 ${
                      darkMode 
                        ? 'text-gray-500 group-focus-within:text-emerald-400' 
                        : 'text-gray-400 group-focus-within:text-emerald-600'
                    }`} />
                    <select
                      name="nivel_complejidad"
                      value={config.nivel_complejidad}
                      onChange={handleChange}
                      className={`appearance-none w-full pl-12 pr-4 py-4 rounded-xl outline-none transition-all duration-300 font-semibold cursor-pointer border-2 ${
                        darkMode
                          ? 'bg-gray-900/50 border-gray-700 text-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/20'
                          : 'bg-white border-gray-200 text-gray-900 focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100'
                      }`}
                    >
                      <option value="baja">🟢 Baja</option>
                      <option value="media">🟡 Media</option>
                      <option value="alta">🔴 Alta</option>
                    </select>
                    <div className={`absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none ${
                      darkMode ? 'text-gray-500' : 'text-gray-400'
                    }`}>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                  <p className={`text-sm mt-2 ml-12 font-medium ${
                    darkMode ? 'text-emerald-400' : 'text-emerald-600'
                  }`}>
                    Nivel de complejidad de los procedimientos médicos
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Especialización */}
          <div className={`rounded-2xl shadow-xl border overflow-hidden ${
            darkMode 
              ? 'bg-gray-800/50 backdrop-blur-xl border-gray-700' 
              : 'bg-white/80 backdrop-blur-xl border-white/50'
          }`}>
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-6">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-xl ${darkMode ? 'bg-white/20' : 'bg-white/20'} backdrop-blur-xl`}>
                  <Award className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-2xl font-black text-white">Especialización</h2>
              </div>
            </div>

            <div className="p-6 md:p-8">
              <div className="group">
                <label className={`block text-sm font-black mb-2 uppercase tracking-wide ${
                  darkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Especialización Principal
                </label>
                <div className="relative">
                  <Sparkles className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors duration-300 ${
                    darkMode 
                      ? 'text-gray-500 group-focus-within:text-purple-400' 
                      : 'text-gray-400 group-focus-within:text-purple-600'
                  }`} />
                  <input
                    type="text"
                    name="especializacion_principal"
                    value={config.especializacion_principal}
                    onChange={handleChange}
                    placeholder="Ej: Medicina General, Pediatría, Cardiología, etc."
                    className={`w-full pl-12 pr-4 py-4 rounded-xl outline-none transition-all duration-300 font-semibold border-2 ${
                      darkMode
                        ? 'bg-gray-900/50 border-gray-700 text-white placeholder:text-gray-500 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20'
                        : 'bg-white border-gray-200 text-gray-900 placeholder:text-gray-400 focus:border-purple-600 focus:ring-4 focus:ring-purple-100'
                    }`}
                  />
                </div>
                <p className={`text-sm mt-2 ml-12 font-medium ${
                  darkMode ? 'text-purple-400' : 'text-purple-600'
                }`}>
                  Área médica principal en la que se especializa el centro
                </p>
              </div>
            </div>
          </div>

          {/* Información Web */}
          <div className={`rounded-2xl shadow-xl border overflow-hidden ${
            darkMode 
              ? 'bg-gray-800/50 backdrop-blur-xl border-gray-700' 
              : 'bg-white/80 backdrop-blur-xl border-white/50'
          }`}>
            <div className="bg-gradient-to-r from-amber-500 to-orange-500 p-6">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-xl ${darkMode ? 'bg-white/20' : 'bg-white/20'} backdrop-blur-xl`}>
                  <Globe className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-2xl font-black text-white">Información Web</h2>
              </div>
            </div>

            <div className="p-6 md:p-8 space-y-6">
              {/* Sitio Web */}
              <div className="group">
                <label className={`block text-sm font-black mb-2 uppercase tracking-wide ${
                  darkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Sitio Web
                </label>
                <div className="relative">
                  <Globe className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors duration-300 ${
                    darkMode 
                      ? 'text-gray-500 group-focus-within:text-amber-400' 
                      : 'text-gray-400 group-focus-within:text-amber-600'
                  }`} />
                  <input
                    type="url"
                    name="sitio_web"
                    value={config.sitio_web}
                    onChange={handleChange}
                    placeholder="https://www.ejemplo.cl"
                    className={`w-full pl-12 pr-4 py-4 rounded-xl outline-none transition-all duration-300 font-semibold border-2 ${
                      darkMode
                        ? 'bg-gray-900/50 border-gray-700 text-white placeholder:text-gray-500 focus:border-amber-500 focus:ring-4 focus:ring-amber-500/20'
                        : 'bg-white border-gray-200 text-gray-900 placeholder:text-gray-400 focus:border-amber-600 focus:ring-4 focus:ring-amber-100'
                    }`}
                  />
                </div>
                <p className={`text-sm mt-2 ml-12 font-medium ${
                  darkMode ? 'text-amber-400' : 'text-amber-600'
                }`}>
                  URL del sitio web oficial del centro médico
                </p>
              </div>

              {/* Logo URL */}
              <div className="group">
                <label className={`block text-sm font-black mb-2 uppercase tracking-wide ${
                  darkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  URL del Logo
                </label>
                <div className="relative">
                  <Image className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors duration-300 ${
                    darkMode 
                      ? 'text-gray-500 group-focus-within:text-amber-400' 
                      : 'text-gray-400 group-focus-within:text-amber-600'
                  }`} />
                  <input
                    type="url"
                    name="logo_url"
                    value={config.logo_url}
                    onChange={handleChange}
                    placeholder="https://ejemplo.cl/logo.png"
                    className={`w-full pl-12 pr-4 py-4 rounded-xl outline-none transition-all duration-300 font-semibold border-2 ${
                      darkMode
                        ? 'bg-gray-900/50 border-gray-700 text-white placeholder:text-gray-500 focus:border-amber-500 focus:ring-4 focus:ring-amber-500/20'
                        : 'bg-white border-gray-200 text-gray-900 placeholder:text-gray-400 focus:border-amber-600 focus:ring-4 focus:ring-amber-100'
                    }`}
                  />
                </div>
                <p className={`text-sm mt-2 ml-12 font-medium ${
                  darkMode ? 'text-amber-400' : 'text-amber-600'
                }`}>
                  URL de la imagen del logo del centro (formato PNG o JPG)
                </p>
              </div>

              {/* Vista Previa del Logo */}
              {config.logo_url && (
                <div className={`mt-6 rounded-2xl border-2 overflow-hidden ${
                  darkMode ? 'border-amber-500/30 bg-gray-900/50' : 'border-amber-200 bg-amber-50'
                }`}>
                  <div className={`p-4 border-b-2 flex items-center gap-2 ${
                    darkMode ? 'border-amber-500/30 bg-amber-500/10' : 'border-amber-200 bg-amber-100'
                  }`}>
                    <Eye className={`w-5 h-5 ${darkMode ? 'text-amber-400' : 'text-amber-600'}`} />
                    <span className={`text-sm font-black uppercase tracking-wide ${
                      darkMode ? 'text-amber-400' : 'text-amber-700'
                    }`}>
                      Vista Previa del Logo
                    </span>
                  </div>
                  <div className="p-8 flex items-center justify-center">
                    <div className={`relative p-4 rounded-2xl shadow-2xl ${
                      darkMode ? 'bg-white/5' : 'bg-white'
                    }`}>
                      <img
                        src={config.logo_url}
                        alt="Logo del centro"
                        className="max-h-32 object-contain"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            "https://via.placeholder.com/150?text=Logo+No+Disponible";
                        }}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Botones Premium - Sticky en Mobile */}
          <div className={`sticky bottom-4 z-10 rounded-2xl shadow-2xl border p-4 md:p-6 ${
            darkMode 
              ? 'bg-gray-800/80 backdrop-blur-xl border-gray-700' 
              : 'bg-white/80 backdrop-blur-xl border-white/50'
          }`}>
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                type="submit"
                disabled={saving}
                className="group flex-1 px-8 py-5 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white rounded-xl font-black shadow-2xl hover:shadow-indigo-500/50 hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-3 text-lg"
              >
                {saving ? (
                  <>
                    <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Guardando Cambios...
                  </>
                ) : (
                  <>
                    <Save className="w-6 h-6 group-hover:scale-110 transition-transform duration-300" />
                    Guardar Configuración
                    <CheckCircle className="w-6 h-6 group-hover:animate-pulse" />
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={cargarConfiguracion}
                className="group px-8 py-5 bg-gradient-to-r from-gray-200 to-gray-300 text-gray-700 rounded-xl font-black shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 flex items-center justify-center gap-3 text-lg"
              >
                <RefreshCw className="w-6 h-6 group-hover:rotate-180 transition-transform duration-500" />
                Restaurar
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}