// frontend/src/app/(dashboard)/admin/centros/[id]/micrositio/editar/page.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Globe,
  Save,
  RefreshCw,
  Eye,
  Moon,
  Sun,
  Sparkles,
  CheckCircle,
  AlertCircle,
  Plus,
  Edit,
  Trash2,
  Image as ImageIcon,
  FileText,
  Users,
  Gift,
  Star,
  Settings,
  Layout,
  Palette,
  Upload,
  X,
  Loader2,
} from "lucide-react";

interface MicrositioConfig {
  // Información básica
  nombre: string;
  descripcion: string;
  logo_url: string;
  banner_url: string;
  colores_tema: {
    primario: string;
    secundario: string;
    acento: string;
  };
  
  // Secciones visibles
  mostrar_servicios: boolean;
  mostrar_profesionales: boolean;
  mostrar_promociones: boolean;
  mostrar_resenas: boolean;
  mostrar_galeria: boolean;
  mostrar_blog: boolean;
  
  // Redes sociales
  facebook_url: string;
  instagram_url: string;
  twitter_url: string;
  linkedin_url: string;
  youtube_url: string;
  
  // SEO
  meta_titulo: string;
  meta_descripcion: string;
  meta_keywords: string;
  
  // Configuración avanzada
  analytics_id: string;
  chat_widget_enabled: boolean;
  booking_widget_enabled: boolean;
}

export default function EditarMicrositioPage() {
  const params = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [activeTab, setActiveTab] = useState("general");
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);
  
  // Referencias para los inputs de archivo
  const logoInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  const [config, setConfig] = useState<MicrositioConfig>({
    nombre: "",
    descripcion: "",
    logo_url: "",
    banner_url: "",
    colores_tema: {
      primario: "#4F46E5",
      secundario: "#7C3AED",
      acento: "#EC4899",
    },
    mostrar_servicios: true,
    mostrar_profesionales: true,
    mostrar_promociones: true,
    mostrar_resenas: true,
    mostrar_galeria: true,
    mostrar_blog: false,
    facebook_url: "",
    instagram_url: "",
    twitter_url: "",
    linkedin_url: "",
    youtube_url: "",
    meta_titulo: "",
    meta_descripcion: "",
    meta_keywords: "",
    analytics_id: "",
    chat_widget_enabled: false,
    booking_widget_enabled: true,
  });

  useEffect(() => {
    cargarConfiguracion();
  }, [params.id]);

  const cargarConfiguracion = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/centros/${params.id}/micrositio/config`);
      const data = await response.json();

      if (data.success) {
        setConfig(data.data);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      setSuccess(null);

      const response = await fetch(`/api/admin/centros/${params.id}/micrositio/config`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess("✅ Cambios guardados exitosamente");
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError(data.error || "Error al guardar");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  // Función para manejar la subida del logo
  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tipo de archivo
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setError('❌ Por favor, selecciona una imagen válida (JPG, PNG, GIF o WEBP)');
      return;
    }

    // Validar tamaño de archivo (máximo 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      setError('❌ La imagen es demasiado grande. El tamaño máximo es 5MB');
      return;
    }

    try {
      setUploadingLogo(true);
      setError(null);

      const formData = new FormData();
      formData.append('file', file);
      formData.append('tipo', 'logo');
      formData.append('centro_id', params.id as string);

      const response = await fetch(`/api/admin/centros/${params.id}/micrositio/upload`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        setConfig({ ...config, logo_url: data.url });
        setSuccess('✅ Logo subido exitosamente');
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError(data.error || 'Error al subir el logo');
      }
    } catch (err: any) {
      setError('❌ Error al subir el logo: ' + err.message);
    } finally {
      setUploadingLogo(false);
      if (logoInputRef.current) {
        logoInputRef.current.value = '';
      }
    }
  };

  // Función para manejar la subida del banner
  const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tipo de archivo
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setError('❌ Por favor, selecciona una imagen válida (JPG, PNG, GIF o WEBP)');
      return;
    }

    // Validar tamaño de archivo (máximo 10MB para banners)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      setError('❌ La imagen es demasiado grande. El tamaño máximo es 10MB');
      return;
    }

    try {
      setUploadingBanner(true);
      setError(null);

      const formData = new FormData();
      formData.append('file', file);
      formData.append('tipo', 'banner');
      formData.append('centro_id', params.id as string);

      const response = await fetch(`/api/admin/centros/${params.id}/micrositio/upload`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        setConfig({ ...config, banner_url: data.url });
        setSuccess('✅ Banner subido exitosamente');
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError(data.error || 'Error al subir el banner');
      }
    } catch (err: any) {
      setError('❌ Error al subir el banner: ' + err.message);
    } finally {
      setUploadingBanner(false);
      if (bannerInputRef.current) {
        bannerInputRef.current.value = '';
      }
    }
  };

  // Función para eliminar el logo
  const handleRemoveLogo = () => {
    setConfig({ ...config, logo_url: '' });
  };

  // Función para eliminar el banner
  const handleRemoveBanner = () => {
    setConfig({ ...config, banner_url: '' });
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
      </div>
    );
  }

  const micrositioUrl = `/centros/${params.id}-${config.nombre.toLowerCase().replace(/\s+/g, '-')}`;

  return (
    <div className={`min-h-screen transition-colors duration-300 ${darkMode ? 'bg-gradient-to-br from-slate-950 via-indigo-950 to-purple-950' : 'bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50'} p-4 md:p-6 lg:p-8`}>
      <div className="max-w-7xl mx-auto">
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

            <div className="flex items-center gap-3">
              {/* Theme Toggle */}
              <button
                onClick={() => setDarkMode(!darkMode)}
                className={`p-3 rounded-xl font-semibold text-sm transition-all duration-300 shadow-lg hover:scale-110 ${
                  darkMode
                    ? 'bg-gray-800 text-yellow-400 hover:bg-gray-700'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>

              {/* Vista Previa */}
              <Link
                href={micrositioUrl}
                target="_blank"
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-bold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 flex items-center gap-2"
              >
                <Eye className="w-5 h-5" />
                Vista Previa
              </Link>
            </div>
          </div>

          {/* Título Principal */}
          <div className={`relative overflow-hidden rounded-3xl shadow-2xl p-6 md:p-10 border ${
            darkMode 
              ? 'bg-gradient-to-r from-indigo-900/50 to-purple-900/50 border-indigo-500/20' 
              : 'bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 border-indigo-200'
          }`}>
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzBoLTJWMGgydjMwem0tOCAwTDE4IDBoMnYzMGgtOHptMTYgMGgtMlYwaDJ2MzB6bTggMGgtMlYwaDJ2MzB6bS0yNCAwTDEwIDBoMnYzMGgtOHptMzIgMGgtMlYwaDJ2MzB6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-20"></div>
            
            <div className="relative z-10 flex items-center gap-4">
              <div className={`p-4 rounded-2xl shadow-xl ${darkMode ? 'bg-white/20' : 'bg-white/20'} backdrop-blur-xl`}>
                <Globe className="w-10 h-10 md:w-12 md:h-12 text-white" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-black text-white mb-2 tracking-tight">
                  Editor de Micrositio
                </h1>
                <p className="text-base md:text-lg text-white/90 font-medium">
                  Personaliza tu presencia online y atrae más pacientes
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Messages */}
        {success && (
          <div className={`rounded-2xl p-6 shadow-2xl mb-8 animate-slide-in-down border ${
            darkMode 
              ? 'bg-gradient-to-r from-emerald-900/50 to-teal-900/50 border-emerald-500/20' 
              : 'bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-200'
          }`}>
            <div className="flex items-start gap-4">
              <CheckCircle className={`w-6 h-6 ${darkMode ? 'text-emerald-400' : 'text-emerald-600'}`} />
              <p className={`text-lg font-black ${darkMode ? 'text-white' : 'text-emerald-900'}`}>{success}</p>
            </div>
          </div>
        )}

        {error && (
          <div className={`rounded-2xl p-6 shadow-2xl mb-8 border ${
            darkMode 
              ? 'bg-gradient-to-r from-red-900/50 to-pink-900/50 border-red-500/20' 
              : 'bg-gradient-to-r from-red-50 to-pink-50 border-red-200'
          }`}>
            <div className="flex items-start gap-4">
              <AlertCircle className={`w-6 h-6 ${darkMode ? 'text-red-400' : 'text-red-600'}`} />
              <div>
                <h3 className={`text-xl font-black mb-2 ${darkMode ? 'text-white' : 'text-red-900'}`}>Error</h3>
                <p className={`font-medium ${darkMode ? 'text-red-300' : 'text-red-600'}`}>{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex overflow-x-auto gap-2 mb-6 pb-2">
          {[
            { id: "general", label: "General", icon: Layout },
            { id: "imagenes", label: "Imágenes", icon: ImageIcon },
            { id: "diseno", label: "Diseño", icon: Palette },
            { id: "contenido", label: "Contenido", icon: FileText },
            { id: "secciones", label: "Secciones", icon: Settings },
            { id: "redes", label: "Redes Sociales", icon: Globe },
            { id: "seo", label: "SEO", icon: Sparkles },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all duration-300 whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg scale-105'
                    : darkMode
                    ? 'bg-gray-800/50 text-gray-300 hover:bg-gray-800'
                    : 'bg-white/50 text-gray-700 hover:bg-white'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Contenido de Tabs */}
        <div className={`rounded-2xl p-6 md:p-8 shadow-xl border ${
          darkMode 
            ? 'bg-gray-800/50 backdrop-blur-xl border-gray-700' 
            : 'bg-white/80 backdrop-blur-xl border-white/50'
        }`}>
          {/* General Tab */}
          {activeTab === "general" && (
            <div className="space-y-6">
              <h2 className={`text-2xl font-black ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Información General
              </h2>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="group md:col-span-2">
                  <label className={`block text-sm font-black mb-2 uppercase tracking-wide ${
                    darkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Nombre del Centro
                  </label>
                  <input
                    type="text"
                    value={config.nombre}
                    onChange={(e) => setConfig({ ...config, nombre: e.target.value })}
                    className={`w-full px-4 py-4 rounded-xl outline-none transition-all duration-300 font-semibold border-2 ${
                      darkMode
                        ? 'bg-gray-900/50 border-gray-700 text-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20'
                        : 'bg-white border-gray-200 text-gray-900 focus:border-indigo-600 focus:ring-4 focus:ring-indigo-100'
                    }`}
                  />
                </div>

                <div className="md:col-span-2 group">
                  <label className={`block text-sm font-black mb-2 uppercase tracking-wide ${
                    darkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Descripción
                  </label>
                  <textarea
                    value={config.descripcion}
                    onChange={(e) => setConfig({ ...config, descripcion: e.target.value })}
                    rows={4}
                    placeholder="Describe tu centro médico, sus servicios y lo que lo hace especial..."
                    className={`w-full px-4 py-4 rounded-xl outline-none transition-all duration-300 font-medium resize-none border-2 ${
                      darkMode
                        ? 'bg-gray-900/50 border-gray-700 text-white placeholder:text-gray-500 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20'
                        : 'bg-white border-gray-200 text-gray-900 placeholder:text-gray-400 focus:border-indigo-600 focus:ring-4 focus:ring-indigo-100'
                    }`}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Nueva Tab de Imágenes */}
          {activeTab === "imagenes" && (
            <div className="space-y-8">
              <h2 className={`text-2xl font-black ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Gestión de Imágenes
              </h2>

              {/* Logo Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className={`text-xl font-black ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      Logo del Centro
                    </h3>
                    <p className={`text-sm mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Tamaño recomendado: 400x400px • Formato: PNG, JPG, WEBP • Máximo: 5MB
                    </p>
                  </div>
                </div>

                <div className={`border-2 border-dashed rounded-2xl p-8 transition-all duration-300 ${
                  darkMode 
                    ? 'border-gray-700 hover:border-indigo-500 bg-gray-900/30' 
                    : 'border-gray-300 hover:border-indigo-400 bg-gray-50'
                }`}>
                  {config.logo_url ? (
                    <div className="flex flex-col items-center gap-4">
                      <div className="relative group">
                        <img 
                          src={config.logo_url} 
                          alt="Logo" 
                          className="w-48 h-48 object-contain rounded-xl border-4 border-gray-200 shadow-lg"
                        />
                        <button
                          onClick={handleRemoveLogo}
                          className="absolute -top-2 -right-2 p-2 bg-red-500 text-white rounded-full shadow-lg hover:bg-red-600 transition-all duration-300 opacity-0 group-hover:opacity-100"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      <button
                        onClick={() => logoInputRef.current?.click()}
                        disabled={uploadingLogo}
                        className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-bold shadow-lg hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                      >
                        {uploadingLogo ? (
                          <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Subiendo...
                          </>
                        ) : (
                          <>
                            <Upload className="w-5 h-5" />
                            Cambiar Logo
                          </>
                        )}
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-4 py-8">
                      <div className={`p-6 rounded-full ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
                        <ImageIcon className={`w-12 h-12 ${darkMode ? 'text-gray-600' : 'text-gray-400'}`} />
                      </div>
                      <div className="text-center">
                        <h4 className={`text-lg font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                          No hay logo cargado
                        </h4>
                        <p className={`text-sm mb-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          Sube el logo de tu centro médico
                        </p>
                        <button
                          onClick={() => logoInputRef.current?.click()}
                          disabled={uploadingLogo}
                          className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-bold shadow-lg hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 mx-auto"
                        >
                          {uploadingLogo ? (
                            <>
                              <Loader2 className="w-5 h-5 animate-spin" />
                              Subiendo...
                            </>
                          ) : (
                            <>
                              <Upload className="w-5 h-5" />
                              Subir Logo
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  )}
                  <input
                    ref={logoInputRef}
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                    onChange={handleLogoUpload}
                    className="hidden"
                  />
                </div>

                {/* URL Manual del Logo */}
                <div className="group">
                  <label className={`block text-sm font-black mb-2 uppercase tracking-wide ${
                    darkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    O ingresa URL del Logo manualmente
                  </label>
                  <input
                    type="url"
                    value={config.logo_url}
                    onChange={(e) => setConfig({ ...config, logo_url: e.target.value })}
                    placeholder="https://ejemplo.com/logo.png"
                    className={`w-full px-4 py-4 rounded-xl outline-none transition-all duration-300 font-semibold border-2 ${
                      darkMode
                        ? 'bg-gray-900/50 border-gray-700 text-white placeholder:text-gray-500 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20'
                        : 'bg-white border-gray-200 text-gray-900 placeholder:text-gray-400 focus:border-indigo-600 focus:ring-4 focus:ring-indigo-100'
                    }`}
                  />
                </div>
              </div>

              {/* Banner Section */}
              <div className="space-y-4 pt-8 border-t-2 border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className={`text-xl font-black ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      Banner Principal
                    </h3>
                    <p className={`text-sm mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Tamaño recomendado: 1920x600px • Formato: PNG, JPG, WEBP • Máximo: 10MB
                    </p>
                  </div>
                </div>

                <div className={`border-2 border-dashed rounded-2xl p-8 transition-all duration-300 ${
                  darkMode 
                    ? 'border-gray-700 hover:border-indigo-500 bg-gray-900/30' 
                    : 'border-gray-300 hover:border-indigo-400 bg-gray-50'
                }`}>
                  {config.banner_url ? (
                    <div className="flex flex-col items-center gap-4">
                      <div className="relative group w-full">
                        <img 
                          src={config.banner_url} 
                          alt="Banner" 
                          className="w-full h-64 object-cover rounded-xl border-4 border-gray-200 shadow-lg"
                        />
                        <button
                          onClick={handleRemoveBanner}
                          className="absolute top-4 right-4 p-2 bg-red-500 text-white rounded-full shadow-lg hover:bg-red-600 transition-all duration-300 opacity-0 group-hover:opacity-100"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      <button
                        onClick={() => bannerInputRef.current?.click()}
                        disabled={uploadingBanner}
                        className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-bold shadow-lg hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                      >
                        {uploadingBanner ? (
                          <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Subiendo...
                          </>
                        ) : (
                          <>
                            <Upload className="w-5 h-5" />
                            Cambiar Banner
                          </>
                        )}
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-4 py-8">
                      <div className={`p-6 rounded-full ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
                        <ImageIcon className={`w-12 h-12 ${darkMode ? 'text-gray-600' : 'text-gray-400'}`} />
                      </div>
                      <div className="text-center">
                        <h4 className={`text-lg font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                          No hay banner cargado
                        </h4>
                        <p className={`text-sm mb-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          Sube una imagen de banner para la portada de tu micrositio
                        </p>
                        <button
                          onClick={() => bannerInputRef.current?.click()}
                          disabled={uploadingBanner}
                          className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-bold shadow-lg hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 mx-auto"
                        >
                          {uploadingBanner ? (
                            <>
                              <Loader2 className="w-5 h-5 animate-spin" />
                              Subiendo...
                            </>
                          ) : (
                            <>
                              <Upload className="w-5 h-5" />
                              Subir Banner
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  )}
                  <input
                    ref={bannerInputRef}
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                    onChange={handleBannerUpload}
                    className="hidden"
                  />
                </div>

                {/* URL Manual del Banner */}
                <div className="group">
                  <label className={`block text-sm font-black mb-2 uppercase tracking-wide ${
                    darkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    O ingresa URL del Banner manualmente
                  </label>
                  <input
                    type="url"
                    value={config.banner_url}
                    onChange={(e) => setConfig({ ...config, banner_url: e.target.value })}
                    placeholder="https://ejemplo.com/banner.jpg"
                    className={`w-full px-4 py-4 rounded-xl outline-none transition-all duration-300 font-semibold border-2 ${
                      darkMode
                        ? 'bg-gray-900/50 border-gray-700 text-white placeholder:text-gray-500 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20'
                        : 'bg-white border-gray-200 text-gray-900 placeholder:text-gray-400 focus:border-indigo-600 focus:ring-4 focus:ring-indigo-100'
                    }`}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Diseño Tab */}
          {activeTab === "diseno" && (
            <div className="space-y-6">
              <h2 className={`text-2xl font-black ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Personalización de Diseño
              </h2>

              <div className="grid md:grid-cols-3 gap-6">
                {["primario", "secundario", "acento"].map((colorKey) => (
                  <div key={colorKey} className="group">
                    <label className={`block text-sm font-black mb-2 uppercase tracking-wide ${
                      darkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      Color {colorKey}
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={config.colores_tema[colorKey as keyof typeof config.colores_tema]}
                        onChange={(e) => setConfig({
                          ...config,
                          colores_tema: { ...config.colores_tema, [colorKey]: e.target.value }
                        })}
                        className="w-16 h-16 rounded-xl cursor-pointer border-4 border-gray-300"
                      />
                      <input
                        type="text"
                        value={config.colores_tema[colorKey as keyof typeof config.colores_tema]}
                        onChange={(e) => setConfig({
                          ...config,
                          colores_tema: { ...config.colores_tema, [colorKey]: e.target.value }
                        })}
                        className={`flex-1 px-4 py-4 rounded-xl outline-none transition-all duration-300 font-mono font-bold border-2 ${
                          darkMode
                            ? 'bg-gray-900/50 border-gray-700 text-white'
                            : 'bg-white border-gray-200 text-gray-900'
                        }`}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Preview de colores */}
              <div className={`p-6 rounded-2xl border-2 ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                <h3 className={`text-lg font-black mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  Vista Previa de Colores
                </h3>
                <div className="flex gap-4">
                  <div 
                    className="flex-1 h-24 rounded-xl shadow-lg flex items-center justify-center text-white font-bold"
                    style={{ backgroundColor: config.colores_tema.primario }}
                  >
                    Primario
                  </div>
                  <div 
                    className="flex-1 h-24 rounded-xl shadow-lg flex items-center justify-center text-white font-bold"
                    style={{ backgroundColor: config.colores_tema.secundario }}
                  >
                    Secundario
                  </div>
                  <div 
                    className="flex-1 h-24 rounded-xl shadow-lg flex items-center justify-center text-white font-bold"
                    style={{ backgroundColor: config.colores_tema.acento }}
                  >
                    Acento
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Contenido Tab */}
          {activeTab === "contenido" && (
            <div className="space-y-6">
              <h2 className={`text-2xl font-black ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Configuración de Contenido
              </h2>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="group">
                  <label className={`block text-sm font-black mb-2 uppercase tracking-wide ${
                    darkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Google Analytics ID
                  </label>
                  <input
                    type="text"
                    value={config.analytics_id}
                    onChange={(e) => setConfig({ ...config, analytics_id: e.target.value })}
                    placeholder="G-XXXXXXXXXX"
                    className={`w-full px-4 py-4 rounded-xl outline-none transition-all duration-300 font-mono font-semibold border-2 ${
                      darkMode
                        ? 'bg-gray-900/50 border-gray-700 text-white placeholder:text-gray-500 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20'
                        : 'bg-white border-gray-200 text-gray-900 placeholder:text-gray-400 focus:border-indigo-600 focus:ring-4 focus:ring-indigo-100'
                    }`}
                  />
                </div>

                <div className="group">
                  <label className={`block text-sm font-black mb-2 uppercase tracking-wide ${
                    darkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Widget de Chat
                  </label>
                  <button
                    onClick={() => setConfig({ ...config, chat_widget_enabled: !config.chat_widget_enabled })}
                    className={`w-full flex items-center justify-between p-6 rounded-2xl border-2 transition-all duration-300 ${
                      config.chat_widget_enabled
                        ? darkMode
                          ? 'bg-indigo-900/30 border-indigo-500'
                          : 'bg-indigo-50 border-indigo-600'
                        : darkMode
                        ? 'bg-gray-800/50 border-gray-700'
                        : 'bg-white border-gray-200'
                    }`}
                  >
                    <span className={`font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {config.chat_widget_enabled ? 'Habilitado' : 'Deshabilitado'}
                    </span>
                    <div className={`w-14 h-8 rounded-full relative transition-all duration-300 ${
                      config.chat_widget_enabled
                        ? 'bg-indigo-600'
                        : darkMode
                        ? 'bg-gray-700'
                        : 'bg-gray-300'
                    }`}>
                      <div className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition-all duration-300 ${
                        config.chat_widget_enabled ? 'translate-x-6' : 'translate-x-0'
                      }`}></div>
                    </div>
                  </button>
                </div>

                <div className="group">
                  <label className={`block text-sm font-black mb-2 uppercase tracking-wide ${
                    darkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Widget de Reservas
                  </label>
                  <button
                    onClick={() => setConfig({ ...config, booking_widget_enabled: !config.booking_widget_enabled })}
                    className={`w-full flex items-center justify-between p-6 rounded-2xl border-2 transition-all duration-300 ${
                      config.booking_widget_enabled
                        ? darkMode
                          ? 'bg-indigo-900/30 border-indigo-500'
                          : 'bg-indigo-50 border-indigo-600'
                        : darkMode
                        ? 'bg-gray-800/50 border-gray-700'
                        : 'bg-white border-gray-200'
                    }`}
                  >
                    <span className={`font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {config.booking_widget_enabled ? 'Habilitado' : 'Deshabilitado'}
                    </span>
                    <div className={`w-14 h-8 rounded-full relative transition-all duration-300 ${
                      config.booking_widget_enabled
                        ? 'bg-indigo-600'
                        : darkMode
                        ? 'bg-gray-700'
                        : 'bg-gray-300'
                    }`}>
                      <div className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition-all duration-300 ${
                        config.booking_widget_enabled ? 'translate-x-6' : 'translate-x-0'
                      }`}></div>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Secciones Tab */}
          {activeTab === "secciones" && (
            <div className="space-y-6">
              <h2 className={`text-2xl font-black ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Secciones Visibles
              </h2>

              <div className="grid md:grid-cols-2 gap-4">
                {[
                  { key: "mostrar_servicios", label: "Mostrar Servicios", icon: FileText },
                  { key: "mostrar_profesionales", label: "Mostrar Profesionales", icon: Users },
                  { key: "mostrar_promociones", label: "Mostrar Promociones", icon: Gift },
                  { key: "mostrar_resenas", label: "Mostrar Reseñas", icon: Star },
                  { key: "mostrar_galeria", label: "Mostrar Galería", icon: ImageIcon },
                  { key: "mostrar_blog", label: "Mostrar Blog", icon: FileText },
                ].map((seccion) => {
                  const Icon = seccion.icon;
                  return (
                    <button
                      key={seccion.key}
                      onClick={() => setConfig({ ...config, [seccion.key]: !config[seccion.key as keyof MicrositioConfig] })}
                      className={`flex items-center justify-between p-6 rounded-2xl border-2 transition-all duration-300 ${
                        config[seccion.key as keyof MicrositioConfig]
                          ? darkMode
                            ? 'bg-indigo-900/30 border-indigo-500'
                            : 'bg-indigo-50 border-indigo-600'
                          : darkMode
                          ? 'bg-gray-800/50 border-gray-700'
                          : 'bg-white border-gray-200'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className={`w-6 h-6 ${
                          config[seccion.key as keyof MicrositioConfig]
                            ? 'text-indigo-600'
                            : darkMode
                            ? 'text-gray-400'
                            : 'text-gray-600'
                        }`} />
                        <span className={`font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                          {seccion.label}
                        </span>
                      </div>
                      <div className={`w-14 h-8 rounded-full relative transition-all duration-300 ${
                        config[seccion.key as keyof MicrositioConfig]
                          ? 'bg-indigo-600'
                          : darkMode
                          ? 'bg-gray-700'
                          : 'bg-gray-300'
                      }`}>
                        <div className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition-all duration-300 ${
                          config[seccion.key as keyof MicrositioConfig] ? 'translate-x-6' : 'translate-x-0'
                        }`}></div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Redes Sociales Tab */}
          {activeTab === "redes" && (
            <div className="space-y-6">
              <h2 className={`text-2xl font-black ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Redes Sociales
              </h2>

              <div className="space-y-4">
                {[
                  { key: "facebook_url", label: "Facebook", placeholder: "https://facebook.com/tucentro" },
                  { key: "instagram_url", label: "Instagram", placeholder: "https://instagram.com/tucentro" },
                  { key: "twitter_url", label: "Twitter", placeholder: "https://twitter.com/tucentro" },
                  { key: "linkedin_url", label: "LinkedIn", placeholder: "https://linkedin.com/company/tucentro" },
                  { key: "youtube_url", label: "YouTube", placeholder: "https://youtube.com/@tucentro" },
                ].map((red) => (
                  <div key={red.key} className="group">
                    <label className={`block text-sm font-black mb-2 uppercase tracking-wide ${
                      darkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      {red.label}
                    </label>
                    <input
                      type="url"
                      value={config[red.key as keyof MicrositioConfig] as string}
                      onChange={(e) => setConfig({ ...config, [red.key]: e.target.value })}
                      placeholder={red.placeholder}
                      className={`w-full px-4 py-4 rounded-xl outline-none transition-all duration-300 font-semibold border-2 ${
                        darkMode
                          ? 'bg-gray-900/50 border-gray-700 text-white placeholder:text-gray-500 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20'
                          : 'bg-white border-gray-200 text-gray-900 placeholder:text-gray-400 focus:border-indigo-600 focus:ring-4 focus:ring-indigo-100'
                      }`}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SEO Tab */}
          {activeTab === "seo" && (
            <div className="space-y-6">
              <h2 className={`text-2xl font-black ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Optimización SEO
              </h2>

              <div className="space-y-6">
                <div className="group">
                  <label className={`block text-sm font-black mb-2 uppercase tracking-wide ${
                    darkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Meta Título
                  </label>
                  <input
                    type="text"
                    value={config.meta_titulo}
                    onChange={(e) => setConfig({ ...config, meta_titulo: e.target.value })}
                    maxLength={60}
                    placeholder="Tu Centro Médico - Los Mejores Especialistas"
                    className={`w-full px-4 py-4 rounded-xl outline-none transition-all duration-300 font-semibold border-2 ${
                      darkMode
                        ? 'bg-gray-900/50 border-gray-700 text-white placeholder:text-gray-500 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20'
                        : 'bg-white border-gray-200 text-gray-900 placeholder:text-gray-400 focus:border-indigo-600 focus:ring-4 focus:ring-indigo-100'
                    }`}
                  />
                  <p className={`text-xs mt-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {config.meta_titulo.length}/60 caracteres
                  </p>
                </div>

                <div className="group">
                  <label className={`block text-sm font-black mb-2 uppercase tracking-wide ${
                    darkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Meta Descripción
                  </label>
                  <textarea
                    value={config.meta_descripcion}
                    onChange={(e) => setConfig({ ...config, meta_descripcion: e.target.value })}
                    maxLength={160}
                    rows={3}
                    placeholder="Centro médico de excelencia con especialistas altamente calificados. Agenda tu cita hoy y recibe atención médica de primera calidad."
                    className={`w-full px-4 py-4 rounded-xl outline-none transition-all duration-300 font-medium resize-none border-2 ${
                      darkMode
                        ? 'bg-gray-900/50 border-gray-700 text-white placeholder:text-gray-500 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20'
                        : 'bg-white border-gray-200 text-gray-900 placeholder:text-gray-400 focus:border-indigo-600 focus:ring-4 focus:ring-indigo-100'
                    }`}
                  />
                  <p className={`text-xs mt-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {config.meta_descripcion.length}/160 caracteres
                  </p>
                </div>

                <div className="group">
                  <label className={`block text-sm font-black mb-2 uppercase tracking-wide ${
                    darkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Palabras Clave (separadas por comas)
                  </label>
                  <input
                    type="text"
                    value={config.meta_keywords}
                    onChange={(e) => setConfig({ ...config, meta_keywords: e.target.value })}
                    placeholder="centro médico, salud, especialistas, médicos, consultas médicas"
                    className={`w-full px-4 py-4 rounded-xl outline-none transition-all duration-300 font-semibold border-2 ${
                      darkMode
                        ? 'bg-gray-900/50 border-gray-700 text-white placeholder:text-gray-500 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20'
                        : 'bg-white border-gray-200 text-gray-900 placeholder:text-gray-400 focus:border-indigo-600 focus:ring-4 focus:ring-indigo-100'
                    }`}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Botones de Acción Sticky */}
        <div className={`sticky bottom-4 z-10 rounded-2xl shadow-2xl border p-4 md:p-6 mt-6 ${
          darkMode 
            ? 'bg-gray-800/80 backdrop-blur-xl border-gray-700' 
            : 'bg-white/80 backdrop-blur-xl border-white/50'
        }`}>
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={handleSave}
              disabled={saving}
              className="group flex-1 px-8 py-5 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white rounded-xl font-black shadow-2xl hover:shadow-indigo-500/50 hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-3 text-lg"
            >
              {saving ? (
                <>
                  <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="w-6 h-6 group-hover:scale-110 transition-transform duration-300" />
                  Guardar Cambios
                  <CheckCircle className="w-6 h-6 group-hover:animate-pulse" />
                </>
              )}
            </button>

            <button
              onClick={cargarConfiguracion}
              disabled={loading}
              className="group px-8 py-5 bg-gradient-to-r from-gray-200 to-gray-300 text-gray-700 rounded-xl font-black shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 text-lg"
            >
              <RefreshCw className={`w-6 h-6 ${loading ? 'animate-spin' : 'group-hover:rotate-180'} transition-transform duration-500`} />
              Restaurar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}