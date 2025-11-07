// frontend/src/app/(dashboard)/admin/centros/[id]/editar/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { 
  ArrowLeft, 
  Building2, 
  Save, 
  X, 
  RefreshCw, 
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
  AlertCircle
} from "lucide-react";

export default function EditarCentroPage() {
  const params = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
    horario_apertura: "",
    horario_cierre: "",
    dias_atencion: "",
    estado: "activo",
    capacidad_pacientes_dia: 50,
    nivel_complejidad: "media",
    especializacion_principal: "",
  });

  useEffect(() => {
    cargarCentro();
  }, [params.id]);

  const cargarCentro = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/centros/${params.id}`);
      const data = await response.json();

      if (data.success) {
        const centro = data.data;
        setFormData({
          nombre: centro.nombre || "",
          razon_social: centro.razon_social || "",
          rut: centro.rut || "",
          direccion: centro.direccion || "",
          ciudad: centro.ciudad || "",
          region: centro.region || "",
          codigo_postal: centro.codigo_postal || "",
          telefono: centro.telefono || "",
          email: centro.email || "",
          sitio_web: centro.sitio_web || "",
          logo_url: centro.logo_url || "",
          descripcion: centro.descripcion || "",
          horario_apertura: centro.horario_apertura || "08:00",
          horario_cierre: centro.horario_cierre || "20:00",
          dias_atencion: centro.dias_atencion || "",
          estado: centro.estado || "activo",
          capacidad_pacientes_dia: centro.capacidad_pacientes_dia || 50,
          nivel_complejidad: centro.nivel_complejidad || "media",
          especializacion_principal: centro.especializacion_principal || "",
        });
      } else {
        setError(data.error);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const response = await fetch(`/api/admin/centros/${params.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        alert("✅ Centro actualizado exitosamente");
        router.push(`/admin/centros/${params.id}`);
      } else {
        setError(data.error || "Error al actualizar centro");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex flex-col items-center justify-center p-4">
        <div className="relative mb-8">
          <div className="w-24 h-24 border-4 border-indigo-200 rounded-full"></div>
          <div className="w-24 h-24 border-4 border-indigo-600 rounded-full absolute top-0 left-0 animate-spin border-t-transparent"></div>
        </div>
        <h2 className="text-2xl font-black text-gray-800 mb-3 animate-pulse">
          Cargando información...
        </h2>
        <p className="text-gray-600 font-medium">
          Preparando el formulario
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-4 md:p-6 lg:p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header Premium */}
        <div className="mb-8">
          <Link
            href={`/admin/centros/${params.id}`}
            className="group inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-xl rounded-xl shadow-lg hover:shadow-xl border border-white/50 text-indigo-600 font-bold hover:scale-105 transition-all duration-300 mb-6"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform duration-300" />
            Volver al Centro
          </Link>

          <div className="relative overflow-hidden bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-3xl shadow-2xl p-8 md:p-10">
            {/* Patrón de fondo decorativo */}
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzBoLTJWMGgydjMwem0tOCAwTDE4IDBoMnYzMGgtOHptMTYgMGgtMlYwaDJ2MzB6bTggMGgtMlYwaDJ2MzB6bS0yNCAwTDEwIDBoMnYzMGgtOHptMzIgMGgtMlYwaDJ2MzB6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-20"></div>
            
            <div className="relative z-10 flex items-center gap-4">
              <div className="p-4 bg-white/20 backdrop-blur-xl rounded-2xl shadow-xl">
                <Building2 className="w-10 h-10 md:w-12 md:h-12 text-white" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-black text-white mb-2 tracking-tight">
                  Editar Centro Médico
                </h1>
                <p className="text-base md:text-lg text-white/90 font-medium">
                  Actualiza la información del centro
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Error Premium */}
        {error && (
          <div className="bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-2xl p-6 shadow-2xl mb-8 animate-shake">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-white/20 backdrop-blur-xl rounded-xl flex-shrink-0">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-black mb-2">¡Error!</h3>
                <p className="text-white/90 font-medium">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Formulario Premium */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Información Básica */}
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/50 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-500 to-cyan-500 p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 backdrop-blur-xl rounded-xl">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-2xl font-black text-white">Información Básica</h2>
              </div>
            </div>
            
            <div className="p-6 md:p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Nombre del Centro */}
                <div className="group">
                  <label className="block text-sm font-black text-gray-700 mb-2 uppercase tracking-wide">
                    Nombre del Centro *
                  </label>
                  <div className="relative">
                    <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-600 transition-colors duration-300" />
                    <input
                      type="text"
                      name="nombre"
                      value={formData.nombre}
                      onChange={handleChange}
                      required
                      className="w-full pl-12 pr-4 py-4 bg-white border-2 border-gray-200 rounded-xl focus:border-blue-600 focus:ring-4 focus:ring-blue-100 outline-none transition-all duration-300 text-gray-900 font-semibold placeholder:text-gray-400"
                      placeholder="Ingrese el nombre del centro"
                    />
                  </div>
                </div>

                {/* Razón Social */}
                <div className="group">
                  <label className="block text-sm font-black text-gray-700 mb-2 uppercase tracking-wide">
                    Razón Social *
                  </label>
                  <div className="relative">
                    <FileText className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-600 transition-colors duration-300" />
                    <input
                      type="text"
                      name="razon_social"
                      value={formData.razon_social}
                      onChange={handleChange}
                      required
                      className="w-full pl-12 pr-4 py-4 bg-white border-2 border-gray-200 rounded-xl focus:border-blue-600 focus:ring-4 focus:ring-blue-100 outline-none transition-all duration-300 text-gray-900 font-semibold placeholder:text-gray-400"
                      placeholder="Ingrese la razón social"
                    />
                  </div>
                </div>

                {/* RUT */}
                <div className="group">
                  <label className="block text-sm font-black text-gray-700 mb-2 uppercase tracking-wide">
                    RUT *
                  </label>
                  <div className="relative">
                    <Shield className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-600 transition-colors duration-300" />
                    <input
                      type="text"
                      name="rut"
                      value={formData.rut}
                      onChange={handleChange}
                      required
                      className="w-full pl-12 pr-4 py-4 bg-white border-2 border-gray-200 rounded-xl focus:border-blue-600 focus:ring-4 focus:ring-blue-100 outline-none transition-all duration-300 text-gray-900 font-semibold placeholder:text-gray-400 font-mono"
                      placeholder="XX.XXX.XXX-X"
                    />
                  </div>
                </div>

                {/* Email */}
                <div className="group">
                  <label className="block text-sm font-black text-gray-700 mb-2 uppercase tracking-wide">
                    Email *
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-600 transition-colors duration-300" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full pl-12 pr-4 py-4 bg-white border-2 border-gray-200 rounded-xl focus:border-blue-600 focus:ring-4 focus:ring-blue-100 outline-none transition-all duration-300 text-gray-900 font-semibold placeholder:text-gray-400"
                      placeholder="contacto@centro.cl"
                    />
                  </div>
                </div>

                {/* Teléfono */}
                <div className="group">
                  <label className="block text-sm font-black text-gray-700 mb-2 uppercase tracking-wide">
                    Teléfono *
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-600 transition-colors duration-300" />
                    <input
                      type="tel"
                      name="telefono"
                      value={formData.telefono}
                      onChange={handleChange}
                      required
                      className="w-full pl-12 pr-4 py-4 bg-white border-2 border-gray-200 rounded-xl focus:border-blue-600 focus:ring-4 focus:ring-blue-100 outline-none transition-all duration-300 text-gray-900 font-semibold placeholder:text-gray-400"
                      placeholder="+56 9 1234 5678"
                    />
                  </div>
                </div>

                {/* Sitio Web */}
                <div className="group">
                  <label className="block text-sm font-black text-gray-700 mb-2 uppercase tracking-wide">
                    Sitio Web
                  </label>
                  <div className="relative">
                    <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-600 transition-colors duration-300" />
                    <input
                      type="url"
                      name="sitio_web"
                      value={formData.sitio_web}
                      onChange={handleChange}
                      className="w-full pl-12 pr-4 py-4 bg-white border-2 border-gray-200 rounded-xl focus:border-blue-600 focus:ring-4 focus:ring-blue-100 outline-none transition-all duration-300 text-gray-900 font-semibold placeholder:text-gray-400"
                      placeholder="https://www.centro.cl"
                    />
                  </div>
                </div>
              </div>

              {/* Descripción */}
              <div className="mt-6 group">
                <label className="block text-sm font-black text-gray-700 mb-2 uppercase tracking-wide">
                  Descripción
                </label>
                <textarea
                  name="descripcion"
                  value={formData.descripcion}
                  onChange={handleChange}
                  rows={4}
                  className="w-full px-4 py-4 bg-white border-2 border-gray-200 rounded-xl focus:border-blue-600 focus:ring-4 focus:ring-blue-100 outline-none transition-all duration-300 text-gray-900 font-medium placeholder:text-gray-400 resize-none"
                  placeholder="Describe brevemente el centro médico, sus servicios y características principales..."
                />
              </div>
            </div>
          </div>

          {/* Ubicación */}
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/50 overflow-hidden">
            <div className="bg-gradient-to-r from-emerald-500 to-teal-500 p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 backdrop-blur-xl rounded-xl">
                  <MapPin className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-2xl font-black text-white">Ubicación</h2>
              </div>
            </div>
            
            <div className="p-6 md:p-8">
              <div className="grid grid-cols-1 gap-6">
                {/* Dirección */}
                <div className="group">
                  <label className="block text-sm font-black text-gray-700 mb-2 uppercase tracking-wide">
                    Dirección *
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-emerald-600 transition-colors duration-300" />
                    <input
                      type="text"
                      name="direccion"
                      value={formData.direccion}
                      onChange={handleChange}
                      required
                      className="w-full pl-12 pr-4 py-4 bg-white border-2 border-gray-200 rounded-xl focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100 outline-none transition-all duration-300 text-gray-900 font-semibold placeholder:text-gray-400"
                      placeholder="Calle Principal #123"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Ciudad */}
                  <div className="group">
                    <label className="block text-sm font-black text-gray-700 mb-2 uppercase tracking-wide">
                      Ciudad *
                    </label>
                    <input
                      type="text"
                      name="ciudad"
                      value={formData.ciudad}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-4 bg-white border-2 border-gray-200 rounded-xl focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100 outline-none transition-all duration-300 text-gray-900 font-semibold placeholder:text-gray-400"
                      placeholder="Santiago"
                    />
                  </div>

                  {/* Región */}
                  <div className="group">
                    <label className="block text-sm font-black text-gray-700 mb-2 uppercase tracking-wide">
                      Región *
                    </label>
                    <div className="relative">
                      <select
                        name="region"
                        value={formData.region}
                        onChange={handleChange}
                        required
                        className="appearance-none w-full px-4 py-4 bg-white border-2 border-gray-200 rounded-xl focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100 outline-none transition-all duration-300 text-gray-900 font-semibold cursor-pointer"
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
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  {/* Código Postal */}
                  <div className="group">
                    <label className="block text-sm font-black text-gray-700 mb-2 uppercase tracking-wide">
                      Código Postal
                    </label>
                    <input
                      type="text"
                      name="codigo_postal"
                      value={formData.codigo_postal}
                      onChange={handleChange}
                      className="w-full px-4 py-4 bg-white border-2 border-gray-200 rounded-xl focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100 outline-none transition-all duration-300 text-gray-900 font-semibold placeholder:text-gray-400"
                      placeholder="7500000"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Configuración */}
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/50 overflow-hidden">
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 backdrop-blur-xl rounded-xl">
                  <Settings className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-2xl font-black text-white">Configuración</h2>
              </div>
            </div>
            
            <div className="p-6 md:p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Horario Apertura */}
                <div className="group">
                  <label className="block text-sm font-black text-gray-700 mb-2 uppercase tracking-wide">
                    Horario Apertura
                  </label>
                  <div className="relative">
                    <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-purple-600 transition-colors duration-300" />
                    <input
                      type="time"
                      name="horario_apertura"
                      value={formData.horario_apertura}
                      onChange={handleChange}
                      className="w-full pl-12 pr-4 py-4 bg-white border-2 border-gray-200 rounded-xl focus:border-purple-600 focus:ring-4 focus:ring-purple-100 outline-none transition-all duration-300 text-gray-900 font-semibold"
                    />
                  </div>
                </div>

                {/* Horario Cierre */}
                <div className="group">
                  <label className="block text-sm font-black text-gray-700 mb-2 uppercase tracking-wide">
                    Horario Cierre
                  </label>
                  <div className="relative">
                    <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-purple-600 transition-colors duration-300" />
                    <input
                      type="time"
                      name="horario_cierre"
                      value={formData.horario_cierre}
                      onChange={handleChange}
                      className="w-full pl-12 pr-4 py-4 bg-white border-2 border-gray-200 rounded-xl focus:border-purple-600 focus:ring-4 focus:ring-purple-100 outline-none transition-all duration-300 text-gray-900 font-semibold"
                    />
                  </div>
                </div>

                {/* Días de Atención */}
                <div className="group">
                  <label className="block text-sm font-black text-gray-700 mb-2 uppercase tracking-wide">
                    Días de Atención
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-purple-600 transition-colors duration-300" />
                    <input
                      type="text"
                      name="dias_atencion"
                      value={formData.dias_atencion}
                      onChange={handleChange}
                      placeholder="Ej: Lunes a Viernes"
                      className="w-full pl-12 pr-4 py-4 bg-white border-2 border-gray-200 rounded-xl focus:border-purple-600 focus:ring-4 focus:ring-purple-100 outline-none transition-all duration-300 text-gray-900 font-semibold placeholder:text-gray-400"
                    />
                  </div>
                </div>

                {/* Capacidad Pacientes/Día */}
                <div className="group">
                  <label className="block text-sm font-black text-gray-700 mb-2 uppercase tracking-wide">
                    Capacidad Pacientes/Día
                  </label>
                  <div className="relative">
                    <Users className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-purple-600 transition-colors duration-300" />
                    <input
                      type="number"
                      name="capacidad_pacientes_dia"
                      value={formData.capacidad_pacientes_dia}
                      onChange={handleChange}
                      min="1"
                      className="w-full pl-12 pr-4 py-4 bg-white border-2 border-gray-200 rounded-xl focus:border-purple-600 focus:ring-4 focus:ring-purple-100 outline-none transition-all duration-300 text-gray-900 font-semibold"
                    />
                  </div>
                </div>

                {/* Nivel de Complejidad */}
                <div className="group">
                  <label className="block text-sm font-black text-gray-700 mb-2 uppercase tracking-wide">
                    Nivel de Complejidad
                  </label>
                  <div className="relative">
                    <select
                      name="nivel_complejidad"
                      value={formData.nivel_complejidad}
                      onChange={handleChange}
                      className="appearance-none w-full px-4 py-4 bg-white border-2 border-gray-200 rounded-xl focus:border-purple-600 focus:ring-4 focus:ring-purple-100 outline-none transition-all duration-300 text-gray-900 font-semibold cursor-pointer"
                    >
                      <option value="baja">🟢 Baja</option>
                      <option value="media">🟡 Media</option>
                      <option value="alta">🔴 Alta</option>
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Estado */}
                <div className="group">
                  <label className="block text-sm font-black text-gray-700 mb-2 uppercase tracking-wide">
                    Estado
                  </label>
                  <div className="relative">
                    <select
                      name="estado"
                      value={formData.estado}
                      onChange={handleChange}
                      className="appearance-none w-full px-4 py-4 bg-white border-2 border-gray-200 rounded-xl focus:border-purple-600 focus:ring-4 focus:ring-purple-100 outline-none transition-all duration-300 text-gray-900 font-semibold cursor-pointer"
                    >
                      <option value="activo">✅ Activo</option>
                      <option value="inactivo">⛔ Inactivo</option>
                      <option value="suspendido">🚫 Suspendido</option>
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Especialización Principal */}
                <div className="md:col-span-2 group">
                  <label className="block text-sm font-black text-gray-700 mb-2 uppercase tracking-wide">
                    Especialización Principal
                  </label>
                  <div className="relative">
                    <Sparkles className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-purple-600 transition-colors duration-300" />
                    <input
                      type="text"
                      name="especializacion_principal"
                      value={formData.especializacion_principal}
                      onChange={handleChange}
                      placeholder="Ej: Medicina General, Pediatría, Cardiología, etc."
                      className="w-full pl-12 pr-4 py-4 bg-white border-2 border-gray-200 rounded-xl focus:border-purple-600 focus:ring-4 focus:ring-purple-100 outline-none transition-all duration-300 text-gray-900 font-semibold placeholder:text-gray-400"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Botones Premium - Sticky en Mobile */}
          <div className="sticky bottom-4 z-10 bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/50 p-4 md:p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                type="submit"
                disabled={saving}
                className="group flex-1 px-8 py-5 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white rounded-xl font-black shadow-2xl hover:shadow-indigo-500/50 hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-3 text-lg"
              >
                {saving ? (
                  <>
                    <RefreshCw className="w-6 h-6 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  <>
                    <Save className="w-6 h-6 group-hover:scale-110 transition-transform duration-300" />
                    Guardar Cambios
                    <Sparkles className="w-6 h-6 group-hover:animate-pulse" />
                  </>
                )}
              </button>

              <Link
                href={`/admin/centros/${params.id}`}
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