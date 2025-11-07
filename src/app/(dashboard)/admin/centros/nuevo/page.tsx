// frontend/src/app/(dashboard)/admin/centros/nuevo/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  ArrowLeft, 
  Building2, 
  Save, 
  X, 
  FileText, 
  MapPin, 
  Settings,
  Sparkles,
  Mail,
  Phone,
  Globe,
  Clock,
  Calendar,
  Users,
  Shield,
  AlertCircle,
  Moon,
  Sun,
  CheckCircle
} from "lucide-react";

export default function NuevoCentroPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [darkMode, setDarkMode] = useState(false);

  const [formData, setFormData] = useState({
    nombre: "",
    razon_social: "",
    rut: "",
    direccion: "",
    ciudad: "",
    region: "",
    codigo_postal: "",
    telefono: "",
    email: "",
    sitio_web: "",
    logo_url: "",
    descripcion: "",
    horario_apertura: "08:00",
    horario_cierre: "20:00",
    dias_atencion: "Lunes a Viernes",
    estado: "activo",
    capacidad_pacientes_dia: 50,
    nivel_complejidad: "media",
    especializacion_principal: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/admin/centros", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        alert("✅ Centro creado exitosamente");
        router.push("/admin/centros");
      } else {
        setError(data.error || "Error al crear centro");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${darkMode ? 'bg-gradient-to-br from-slate-950 via-indigo-950 to-purple-950' : 'bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50'} p-4 md:p-6 lg:p-8`}>
      <div className="max-w-5xl mx-auto">
        {/* Header Premium con Theme Toggle */}
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

          <div className={`relative overflow-hidden rounded-3xl shadow-2xl p-8 md:p-10 border ${
            darkMode 
              ? 'bg-gradient-to-r from-indigo-900/50 to-purple-900/50 border-indigo-500/20' 
              : 'bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 border-indigo-200'
          }`}>
            {/* Patrón de fondo decorativo */}
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzBoLTJWMGgydjMwem0tOCAwTDE4IDBoMnYzMGgtOHptMTYgMGgtMlYwaDJ2MzB6bTggMGgtMlYwaDJ2MzB6bS0yNCAwTDEwIDBoMnYzMGgtOHptMzIgMGgtMlYwaDJ2MzB6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-20"></div>
            
            <div className="relative z-10 flex items-center gap-4">
              <div className={`p-4 rounded-2xl shadow-xl ${darkMode ? 'bg-white/20' : 'bg-white/20'} backdrop-blur-xl`}>
                <Building2 className="w-10 h-10 md:w-12 md:h-12 text-white" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-black text-white mb-2 tracking-tight">
                  Crear Nuevo Centro Médico
                </h1>
                <p className="text-base md:text-lg text-white/90 font-medium">
                  Completa la información para registrar un nuevo centro
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Error Premium */}
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
                  ¡Error!
                </h3>
                <p className={`font-medium ${darkMode ? 'text-red-300' : 'text-red-600'}`}>{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Formulario Premium */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Información Básica */}
          <div className={`rounded-2xl shadow-xl border overflow-hidden ${
            darkMode 
              ? 'bg-gray-800/50 backdrop-blur-xl border-gray-700' 
              : 'bg-white/80 backdrop-blur-xl border-white/50'
          }`}>
            <div className="bg-gradient-to-r from-blue-500 to-cyan-500 p-6">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-xl ${darkMode ? 'bg-white/20' : 'bg-white/20'} backdrop-blur-xl`}>
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-2xl font-black text-white">Información Básica</h2>
              </div>
            </div>
            
            <div className="p-6 md:p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Nombre del Centro */}
                <div className="group">
                  <label className={`block text-sm font-black mb-2 uppercase tracking-wide ${
                    darkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Nombre del Centro *
                  </label>
                  <div className="relative">
                    <Building2 className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors duration-300 ${
                      darkMode 
                        ? 'text-gray-500 group-focus-within:text-blue-400' 
                        : 'text-gray-400 group-focus-within:text-blue-600'
                    }`} />
                    <input
                      type="text"
                      name="nombre"
                      value={formData.nombre}
                      onChange={handleChange}
                      required
                      className={`w-full pl-12 pr-4 py-4 rounded-xl outline-none transition-all duration-300 font-semibold border-2 ${
                        darkMode
                          ? 'bg-gray-900/50 border-gray-700 text-white placeholder:text-gray-500 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20'
                          : 'bg-white border-gray-200 text-gray-900 placeholder:text-gray-400 focus:border-blue-600 focus:ring-4 focus:ring-blue-100'
                      }`}
                      placeholder="Ingrese el nombre del centro"
                    />
                  </div>
                </div>

                {/* Razón Social */}
                <div className="group">
                  <label className={`block text-sm font-black mb-2 uppercase tracking-wide ${
                    darkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Razón Social *
                  </label>
                  <div className="relative">
                    <FileText className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors duration-300 ${
                      darkMode 
                        ? 'text-gray-500 group-focus-within:text-blue-400' 
                        : 'text-gray-400 group-focus-within:text-blue-600'
                    }`} />
                    <input
                      type="text"
                      name="razon_social"
                      value={formData.razon_social}
                      onChange={handleChange}
                      required
                      className={`w-full pl-12 pr-4 py-4 rounded-xl outline-none transition-all duration-300 font-semibold border-2 ${
                        darkMode
                          ? 'bg-gray-900/50 border-gray-700 text-white placeholder:text-gray-500 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20'
                          : 'bg-white border-gray-200 text-gray-900 placeholder:text-gray-400 focus:border-blue-600 focus:ring-4 focus:ring-blue-100'
                      }`}
                      placeholder="Ingrese la razón social"
                    />
                  </div>
                </div>

                {/* RUT */}
                <div className="group">
                  <label className={`block text-sm font-black mb-2 uppercase tracking-wide ${
                    darkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    RUT *
                  </label>
                  <div className="relative">
                    <Shield className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors duration-300 ${
                      darkMode 
                        ? 'text-gray-500 group-focus-within:text-blue-400' 
                        : 'text-gray-400 group-focus-within:text-blue-600'
                    }`} />
                    <input
                      type="text"
                      name="rut"
                      value={formData.rut}
                      onChange={handleChange}
                      required
                      placeholder="XX.XXX.XXX-X"
                      className={`w-full pl-12 pr-4 py-4 rounded-xl outline-none transition-all duration-300 font-semibold font-mono border-2 ${
                        darkMode
                          ? 'bg-gray-900/50 border-gray-700 text-white placeholder:text-gray-500 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20'
                          : 'bg-white border-gray-200 text-gray-900 placeholder:text-gray-400 focus:border-blue-600 focus:ring-4 focus:ring-blue-100'
                      }`}
                    />
                  </div>
                </div>

                {/* Email */}
                <div className="group">
                  <label className={`block text-sm font-black mb-2 uppercase tracking-wide ${
                    darkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Email *
                  </label>
                  <div className="relative">
                    <Mail className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors duration-300 ${
                      darkMode 
                        ? 'text-gray-500 group-focus-within:text-blue-400' 
                        : 'text-gray-400 group-focus-within:text-blue-600'
                    }`} />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className={`w-full pl-12 pr-4 py-4 rounded-xl outline-none transition-all duration-300 font-semibold border-2 ${
                        darkMode
                          ? 'bg-gray-900/50 border-gray-700 text-white placeholder:text-gray-500 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20'
                          : 'bg-white border-gray-200 text-gray-900 placeholder:text-gray-400 focus:border-blue-600 focus:ring-4 focus:ring-blue-100'
                      }`}
                      placeholder="contacto@centro.cl"
                    />
                  </div>
                </div>

                {/* Teléfono */}
                <div className="group">
                  <label className={`block text-sm font-black mb-2 uppercase tracking-wide ${
                    darkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Teléfono *
                  </label>
                  <div className="relative">
                    <Phone className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors duration-300 ${
                      darkMode 
                        ? 'text-gray-500 group-focus-within:text-blue-400' 
                        : 'text-gray-400 group-focus-within:text-blue-600'
                    }`} />
                    <input
                      type="tel"
                      name="telefono"
                      value={formData.telefono}
                      onChange={handleChange}
                      required
                      className={`w-full pl-12 pr-4 py-4 rounded-xl outline-none transition-all duration-300 font-semibold border-2 ${
                        darkMode
                          ? 'bg-gray-900/50 border-gray-700 text-white placeholder:text-gray-500 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20'
                          : 'bg-white border-gray-200 text-gray-900 placeholder:text-gray-400 focus:border-blue-600 focus:ring-4 focus:ring-blue-100'
                      }`}
                      placeholder="+56 9 1234 5678"
                    />
                  </div>
                </div>

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
                        ? 'text-gray-500 group-focus-within:text-blue-400' 
                        : 'text-gray-400 group-focus-within:text-blue-600'
                    }`} />
                    <input
                      type="url"
                      name="sitio_web"
                      value={formData.sitio_web}
                      onChange={handleChange}
                      placeholder="https://www.centro.cl"
                      className={`w-full pl-12 pr-4 py-4 rounded-xl outline-none transition-all duration-300 font-semibold border-2 ${
                        darkMode
                          ? 'bg-gray-900/50 border-gray-700 text-white placeholder:text-gray-500 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20'
                          : 'bg-white border-gray-200 text-gray-900 placeholder:text-gray-400 focus:border-blue-600 focus:ring-4 focus:ring-blue-100'
                      }`}
                    />
                  </div>
                </div>
              </div>

              {/* Descripción */}
              <div className="mt-6 group">
                <label className={`block text-sm font-black mb-2 uppercase tracking-wide ${
                  darkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Descripción
                </label>
                <textarea
                  name="descripcion"
                  value={formData.descripcion}
                  onChange={handleChange}
                  rows={4}
                  className={`w-full px-4 py-4 rounded-xl outline-none transition-all duration-300 font-medium resize-none border-2 ${
                    darkMode
                      ? 'bg-gray-900/50 border-gray-700 text-white placeholder:text-gray-500 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20'
                      : 'bg-white border-gray-200 text-gray-900 placeholder:text-gray-400 focus:border-blue-600 focus:ring-4 focus:ring-blue-100'
                  }`}
                  placeholder="Describe brevemente el centro médico, sus servicios y características principales..."
                />
              </div>
            </div>
          </div>

          {/* Ubicación */}
          <div className={`rounded-2xl shadow-xl border overflow-hidden ${
            darkMode 
              ? 'bg-gray-800/50 backdrop-blur-xl border-gray-700' 
              : 'bg-white/80 backdrop-blur-xl border-white/50'
          }`}>
            <div className="bg-gradient-to-r from-emerald-500 to-teal-500 p-6">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-xl ${darkMode ? 'bg-white/20' : 'bg-white/20'} backdrop-blur-xl`}>
                  <MapPin className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-2xl font-black text-white">Ubicación</h2>
              </div>
            </div>
            
            <div className="p-6 md:p-8">
              <div className="grid grid-cols-1 gap-6">
                {/* Dirección */}
                <div className="group">
                  <label className={`block text-sm font-black mb-2 uppercase tracking-wide ${
                    darkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Dirección *
                  </label>
                  <div className="relative">
                    <MapPin className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors duration-300 ${
                      darkMode 
                        ? 'text-gray-500 group-focus-within:text-emerald-400' 
                        : 'text-gray-400 group-focus-within:text-emerald-600'
                    }`} />
                    <input
                      type="text"
                      name="direccion"
                      value={formData.direccion}
                      onChange={handleChange}
                      required
                      className={`w-full pl-12 pr-4 py-4 rounded-xl outline-none transition-all duration-300 font-semibold border-2 ${
                        darkMode
                          ? 'bg-gray-900/50 border-gray-700 text-white placeholder:text-gray-500 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/20'
                          : 'bg-white border-gray-200 text-gray-900 placeholder:text-gray-400 focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100'
                      }`}
                      placeholder="Calle Principal #123"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Ciudad */}
                  <div className="group">
                    <label className={`block text-sm font-black mb-2 uppercase tracking-wide ${
                      darkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      Ciudad *
                    </label>
                    <input
                      type="text"
                      name="ciudad"
                      value={formData.ciudad}
                      onChange={handleChange}
                      required
                      className={`w-full px-4 py-4 rounded-xl outline-none transition-all duration-300 font-semibold border-2 ${
                        darkMode
                          ? 'bg-gray-900/50 border-gray-700 text-white placeholder:text-gray-500 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/20'
                          : 'bg-white border-gray-200 text-gray-900 placeholder:text-gray-400 focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100'
                      }`}
                      placeholder="Santiago"
                    />
                  </div>

                  {/* Región */}
                  <div className="group">
                    <label className={`block text-sm font-black mb-2 uppercase tracking-wide ${
                      darkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      Región *
                    </label>
                    <div className="relative">
                      <select
                        name="region"
                        value={formData.region}
                        onChange={handleChange}
                        required
                        className={`appearance-none w-full px-4 py-4 rounded-xl outline-none transition-all duration-300 font-semibold cursor-pointer border-2 ${
                          darkMode
                            ? 'bg-gray-900/50 border-gray-700 text-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/20'
                            : 'bg-white border-gray-200 text-gray-900 focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100'
                        }`}
                      >
                        <option value="">Seleccionar región</option>
                        <option value="Región Metropolitana">Región Metropolitana</option>
                        <option value="Región de Valparaíso">Región de Valparaíso</option>
                        <option value="Región del Biobío">Región del Biobío</option>
                        <option value="Región de La Araucanía">Región de La Araucanía</option>
                        <option value="Región de Los Lagos">Región de Los Lagos</option>
                        <option value="Región de Arica y Parinacota">Región de Arica y Parinacota</option>
                        <option value="Región de Tarapacá">Región de Tarapacá</option>
                        <option value="Región de Antofagasta">Región de Antofagasta</option>
                        <option value="Región de Atacama">Región de Atacama</option>
                        <option value="Región de Coquimbo">Región de Coquimbo</option>
                        <option value="Región de O'Higgins">Región de O'Higgins</option>
                        <option value="Región del Maule">Región del Maule</option>
                        <option value="Región de Ñuble">Región de Ñuble</option>
                        <option value="Región de Los Ríos">Región de Los Ríos</option>
                        <option value="Región de Aysén">Región de Aysén</option>
                        <option value="Región de Magallanes">Región de Magallanes</option>
                      </select>
                      <div className={`absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none ${
                        darkMode ? 'text-gray-500' : 'text-gray-400'
                      }`}>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  {/* Código Postal */}
                  <div className="group">
                    <label className={`block text-sm font-black mb-2 uppercase tracking-wide ${
                      darkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      Código Postal
                    </label>
                    <input
                      type="text"
                      name="codigo_postal"
                      value={formData.codigo_postal}
                      onChange={handleChange}
                      className={`w-full px-4 py-4 rounded-xl outline-none transition-all duration-300 font-semibold border-2 ${
                        darkMode
                          ? 'bg-gray-900/50 border-gray-700 text-white placeholder:text-gray-500 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/20'
                          : 'bg-white border-gray-200 text-gray-900 placeholder:text-gray-400 focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100'
                      }`}
                      placeholder="7500000"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Configuración */}
          <div className={`rounded-2xl shadow-xl border overflow-hidden ${
            darkMode 
              ? 'bg-gray-800/50 backdrop-blur-xl border-gray-700' 
              : 'bg-white/80 backdrop-blur-xl border-white/50'
          }`}>
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-6">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-xl ${darkMode ? 'bg-white/20' : 'bg-white/20'} backdrop-blur-xl`}>
                  <Settings className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-2xl font-black text-white">Configuración</h2>
              </div>
            </div>
            
            <div className="p-6 md:p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Horario Apertura */}
                <div className="group">
                  <label className={`block text-sm font-black mb-2 uppercase tracking-wide ${
                    darkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Horario Apertura
                  </label>
                  <div className="relative">
                    <Clock className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors duration-300 ${
                      darkMode 
                        ? 'text-gray-500 group-focus-within:text-purple-400' 
                        : 'text-gray-400 group-focus-within:text-purple-600'
                    }`} />
                    <input
                      type="time"
                      name="horario_apertura"
                      value={formData.horario_apertura}
                      onChange={handleChange}
                      className={`w-full pl-12 pr-4 py-4 rounded-xl outline-none transition-all duration-300 font-semibold border-2 ${
                        darkMode
                          ? 'bg-gray-900/50 border-gray-700 text-white focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20'
                          : 'bg-white border-gray-200 text-gray-900 focus:border-purple-600 focus:ring-4 focus:ring-purple-100'
                      }`}
                    />
                  </div>
                </div>

                {/* Horario Cierre */}
                <div className="group">
                  <label className={`block text-sm font-black mb-2 uppercase tracking-wide ${
                    darkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Horario Cierre
                  </label>
                  <div className="relative">
                    <Clock className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors duration-300 ${
                      darkMode 
                        ? 'text-gray-500 group-focus-within:text-purple-400' 
                        : 'text-gray-400 group-focus-within:text-purple-600'
                    }`} />
                    <input
                      type="time"
                      name="horario_cierre"
                      value={formData.horario_cierre}
                      onChange={handleChange}
                      className={`w-full pl-12 pr-4 py-4 rounded-xl outline-none transition-all duration-300 font-semibold border-2 ${
                        darkMode
                          ? 'bg-gray-900/50 border-gray-700 text-white focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20'
                          : 'bg-white border-gray-200 text-gray-900 focus:border-purple-600 focus:ring-4 focus:ring-purple-100'
                      }`}
                    />
                  </div>
                </div>

                {/* Días de Atención */}
                <div className="group">
                  <label className={`block text-sm font-black mb-2 uppercase tracking-wide ${
                    darkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Días de Atención
                  </label>
                  <div className="relative">
                    <Calendar className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors duration-300 ${
                      darkMode 
                        ? 'text-gray-500 group-focus-within:text-purple-400' 
                        : 'text-gray-400 group-focus-within:text-purple-600'
                    }`} />
                    <input
                      type="text"
                      name="dias_atencion"
                      value={formData.dias_atencion}
                      onChange={handleChange}
                      placeholder="Ej: Lunes a Viernes"
                      className={`w-full pl-12 pr-4 py-4 rounded-xl outline-none transition-all duration-300 font-semibold border-2 ${
                        darkMode
                          ? 'bg-gray-900/50 border-gray-700 text-white placeholder:text-gray-500 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20'
                          : 'bg-white border-gray-200 text-gray-900 placeholder:text-gray-400 focus:border-purple-600 focus:ring-4 focus:ring-purple-100'
                      }`}
                    />
                  </div>
                </div>

                {/* Capacidad Pacientes/Día */}
                <div className="group">
                  <label className={`block text-sm font-black mb-2 uppercase tracking-wide ${
                    darkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Capacidad Pacientes/Día
                  </label>
                  <div className="relative">
                    <Users className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors duration-300 ${
                      darkMode 
                        ? 'text-gray-500 group-focus-within:text-purple-400' 
                        : 'text-gray-400 group-focus-within:text-purple-600'
                    }`} />
                    <input
                      type="number"
                      name="capacidad_pacientes_dia"
                      value={formData.capacidad_pacientes_dia}
                      onChange={handleChange}
                      min="1"
                      className={`w-full pl-12 pr-4 py-4 rounded-xl outline-none transition-all duration-300 font-semibold border-2 ${
                        darkMode
                          ? 'bg-gray-900/50 border-gray-700 text-white focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20'
                          : 'bg-white border-gray-200 text-gray-900 focus:border-purple-600 focus:ring-4 focus:ring-purple-100'
                      }`}
                    />
                  </div>
                </div>

                {/* Nivel de Complejidad */}
                <div className="group">
                  <label className={`block text-sm font-black mb-2 uppercase tracking-wide ${
                    darkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Nivel de Complejidad
                  </label>
                  <div className="relative">
                    <select
                      name="nivel_complejidad"
                      value={formData.nivel_complejidad}
                      onChange={handleChange}
                      className={`appearance-none w-full px-4 py-4 rounded-xl outline-none transition-all duration-300 font-semibold cursor-pointer border-2 ${
                        darkMode
                          ? 'bg-gray-900/50 border-gray-700 text-white focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20'
                          : 'bg-white border-gray-200 text-gray-900 focus:border-purple-600 focus:ring-4 focus:ring-purple-100'
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
                </div>

                {/* Estado */}
                <div className="group">
                  <label className={`block text-sm font-black mb-2 uppercase tracking-wide ${
                    darkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Estado
                  </label>
                  <div className="relative">
                    <select
                      name="estado"
                      value={formData.estado}
                      onChange={handleChange}
                      className={`appearance-none w-full px-4 py-4 rounded-xl outline-none transition-all duration-300 font-semibold cursor-pointer border-2 ${
                        darkMode
                          ? 'bg-gray-900/50 border-gray-700 text-white focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20'
                          : 'bg-white border-gray-200 text-gray-900 focus:border-purple-600 focus:ring-4 focus:ring-purple-100'
                      }`}
                    >
                      <option value="activo">✅ Activo</option>
                      <option value="inactivo">⛔ Inactivo</option>
                    </select>
                    <div className={`absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none ${
                      darkMode ? 'text-gray-500' : 'text-gray-400'
                    }`}>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Especialización Principal */}
                <div className="md:col-span-2 group">
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
                      value={formData.especializacion_principal}
                      onChange={handleChange}
                      placeholder="Ej: Medicina General, Pediatría, Cardiología, etc."
                      className={`w-full pl-12 pr-4 py-4 rounded-xl outline-none transition-all duration-300 font-semibold border-2 ${
                        darkMode
                          ? 'bg-gray-900/50 border-gray-700 text-white placeholder:text-gray-500 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20'
                          : 'bg-white border-gray-200 text-gray-900 placeholder:text-gray-400 focus:border-purple-600 focus:ring-4 focus:ring-purple-100'
                      }`}
                    />
                  </div>
                </div>
              </div>
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
                disabled={loading}
                className="group flex-1 px-8 py-5 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white rounded-xl font-black shadow-2xl hover:shadow-indigo-500/50 hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-3 text-lg"
              >
                {loading ? (
                  <>
                    <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Creando Centro...
                  </>
                ) : (
                  <>
                    <Save className="w-6 h-6 group-hover:scale-110 transition-transform duration-300" />
                    Crear Centro
                    <CheckCircle className="w-6 h-6 group-hover:animate-pulse" />
                  </>
                )}
              </button>

              <Link
                href="/admin/centros"
                className="group px-8 py-5 bg-gradient-to-r from-gray-200 to-gray-300 text-gray-700 rounded-xl font-black shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 flex items-center justify-center gap-3 text-lg"
              >
                <X className="w-6 h-6 group-hover:rotate-90 transition-transform duration-300" />
                Cancelar
              </Link>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}