// frontend/src/app/(dashboard)/admin/centros/[id]/promociones/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  Gift,
  Moon,
  Sun,
  Sparkles,
  CheckCircle,
  AlertCircle,
  Search,
  Calendar,
  Percent,
  Image as ImageIcon,
  Eye,
  EyeOff,
  Tag,
  TrendingUp,
  DollarSign,
  Clock,
  Upload,
} from "lucide-react";

interface Promocion {
  id_promocion?: number;
  titulo: string;
  descripcion: string;
  descuento: number;
  imagen_url: string;
  fecha_inicio: string;
  fecha_fin: string;
  estado: "activa" | "programada" | "finalizada" | "pausada";
  tipo_descuento: "porcentaje" | "monto_fijo";
  monto_descuento: number;
  codigo_promocional?: string;
  limite_usos?: number;
  usos_actuales: number;
  prioridad: number;
}

export default function PromocionesPage() {
  const params = useParams();
  const [promociones, setPromociones] = useState<Promocion[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingPromocion, setEditingPromocion] = useState<Promocion | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterEstado, setFilterEstado] = useState<string>("todas");
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<Promocion>({
    titulo: "",
    descripcion: "",
    descuento: 0,
    imagen_url: "",
    fecha_inicio: new Date().toISOString().split("T")[0],
    fecha_fin: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    estado: "activa",
    tipo_descuento: "porcentaje",
    monto_descuento: 0,
    codigo_promocional: "",
    limite_usos: undefined,
    usos_actuales: 0,
    prioridad: 0,
  });

  useEffect(() => {
    cargarPromociones();
  }, [params.id]);

  const cargarPromociones = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/centros/${params.id}/promociones`);
      const data = await response.json();

      if (data.success) {
        setPromociones(data.data);
      } else {
        setError(data.error);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const url = editingPromocion
        ? `/api/admin/centros/${params.id}/promociones/${editingPromocion.id_promocion}`
        : `/api/admin/centros/${params.id}/promociones`;

      const response = await fetch(url, {
        method: editingPromocion ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(editingPromocion ? "✅ Promoción actualizada" : "✅ Promoción creada");
        setShowModal(false);
        setEditingPromocion(null);
        resetForm();
        cargarPromociones();
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError(data.error);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const resetForm = () => {
    setFormData({
      titulo: "",
      descripcion: "",
      descuento: 0,
      imagen_url: "",
      fecha_inicio: new Date().toISOString().split("T")[0],
      fecha_fin: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      estado: "activa",
      tipo_descuento: "porcentaje",
      monto_descuento: 0,
      codigo_promocional: "",
      limite_usos: undefined,
      usos_actuales: 0,
      prioridad: 0,
    });
  };

  const handleEdit = (promocion: Promocion) => {
    setEditingPromocion(promocion);
    setFormData(promocion);
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("¿Estás seguro de eliminar esta promoción?")) return;

    try {
      const response = await fetch(`/api/admin/centros/${params.id}/promociones/${id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (data.success) {
        setSuccess("✅ Promoción eliminada");
        cargarPromociones();
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError(data.error);
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  const getEstadoBadge = (estado: string) => {
    const badges: Record<string, { bg: string; text: string; label: string }> = {
      activa: { bg: "bg-green-100", text: "text-green-600", label: "Activa" },
      programada: { bg: "bg-blue-100", text: "text-blue-600", label: "Programada" },
      finalizada: { bg: "bg-gray-100", text: "text-gray-600", label: "Finalizada" },
      pausada: { bg: "bg-yellow-100", text: "text-yellow-600", label: "Pausada" },
    };
    return badges[estado] || badges.activa;
  };

  const promocionesFiltradas = promociones
    .filter((p) => {
      const matchSearch = p.titulo.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         p.descripcion.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchFilter = filterEstado === "todas" || p.estado === filterEstado;
      
      return matchSearch && matchFilter;
    })
    .sort((a, b) => (b.prioridad || 0) - (a.prioridad || 0));

  if (loading) {
    return (
      <div className={`min-h-screen flex flex-col items-center justify-center p-4 ${darkMode ? 'bg-gradient-to-br from-slate-950 via-indigo-950 to-purple-950' : 'bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50'}`}>
        <div className="relative mb-8">
          <div className={`w-24 h-24 border-4 rounded-full animate-spin ${darkMode ? 'border-indigo-400 border-t-transparent' : 'border-indigo-600 border-t-transparent'}`}></div>
          <Sparkles className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-10 h-10 ${darkMode ? 'text-indigo-400' : 'text-indigo-600'} animate-pulse`} />
        </div>
        <h2 className={`text-2xl md:text-3xl font-black mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          Cargando promociones...
        </h2>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 ${darkMode ? 'bg-gradient-to-br from-slate-950 via-indigo-950 to-purple-950' : 'bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50'} p-4 md:p-6 lg:p-8`}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
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
          </div>

          {/* Título */}
          <div className={`relative overflow-hidden rounded-3xl shadow-2xl p-6 md:p-10 border ${
            darkMode 
              ? 'bg-gradient-to-r from-orange-900/50 to-red-900/50 border-orange-500/20' 
              : 'bg-gradient-to-r from-orange-600 via-red-600 to-pink-600 border-orange-200'
          }`}>
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzBoLTJWMGgydjMwem0tOCAwTDE4IDBoMnYzMGgtOHptMTYgMGgtMlYwaDJ2MzB6bTggMGgtMlYwaDJ2MzB6bS0yNCAwTDEwIDBoMnYzMGgtOHptMzIgMGgtMlYwaDJ2MzB6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-20"></div>
            
            <div className="relative z-10 flex items-center gap-4">
              <div className={`p-4 rounded-2xl shadow-xl ${darkMode ? 'bg-white/20' : 'bg-white/20'} backdrop-blur-xl`}>
                <Gift className="w-10 h-10 md:w-12 md:h-12 text-white" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-black text-white mb-2 tracking-tight">
                  Gestión de Promociones
                </h1>
                <p className="text-base md:text-lg text-white/90 font-medium">
                  Crea ofertas especiales para atraer más pacientes
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

        {/* Toolbar */}
        <div className={`rounded-2xl p-6 shadow-xl border mb-6 ${
          darkMode 
            ? 'bg-gray-800/50 backdrop-blur-xl border-gray-700' 
            : 'bg-white/80 backdrop-blur-xl border-white/50'
        }`}>
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* Search */}
            <div className="relative flex-1 w-full md:max-w-md">
              <Search className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar promociones..."
                className={`w-full pl-12 pr-4 py-3 rounded-xl outline-none transition-all duration-300 font-semibold border-2 ${
                  darkMode
                    ? 'bg-gray-900/50 border-gray-700 text-white placeholder:text-gray-500 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/20'
                    : 'bg-white border-gray-200 text-gray-900 placeholder:text-gray-400 focus:border-orange-600 focus:ring-4 focus:ring-orange-100'
                }`}
              />
            </div>

            {/* Filters */}
            <div className="flex gap-2 flex-wrap">
              {["todas", "activa", "programada", "finalizada", "pausada"].map((filter) => (
                <button
                  key={filter}
                  onClick={() => setFilterEstado(filter)}
                  className={`px-4 py-2 rounded-xl font-bold text-sm transition-all duration-300 ${
                    filterEstado === filter
                      ? 'bg-gradient-to-r from-orange-600 to-red-600 text-white shadow-lg scale-105'
                      : darkMode
                      ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {filter.charAt(0).toUpperCase() + filter.slice(1)}
                </button>
              ))}
            </div>

            {/* Botón Agregar */}
            <button
              onClick={() => {
                setEditingPromocion(null);
                resetForm();
                setShowModal(true);
              }}
              className="px-6 py-3 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-xl font-bold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Nueva Promoción
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className={`p-6 rounded-2xl shadow-xl border ${
            darkMode 
              ? 'bg-gradient-to-br from-orange-900/50 to-red-900/50 border-orange-500/20' 
              : 'bg-gradient-to-br from-orange-50 to-red-50 border-orange-200'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <span className={`text-sm font-bold uppercase ${darkMode ? 'text-orange-400' : 'text-orange-600'}`}>
                Total
              </span>
              <Gift className={`w-6 h-6 ${darkMode ? 'text-orange-400' : 'text-orange-600'}`} />
            </div>
            <p className={`text-4xl font-black ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              {promociones.length}
            </p>
          </div>

          <div className={`p-6 rounded-2xl shadow-xl border ${
            darkMode 
              ? 'bg-gradient-to-br from-green-900/50 to-emerald-900/50 border-green-500/20' 
              : 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-200'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <span className={`text-sm font-bold uppercase ${darkMode ? 'text-green-400' : 'text-green-600'}`}>
                Activas
              </span>
              <TrendingUp className={`w-6 h-6 ${darkMode ? 'text-green-400' : 'text-green-600'}`} />
            </div>
            <p className={`text-4xl font-black ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              {promociones.filter(p => p.estado === "activa").length}
            </p>
          </div>

          <div className={`p-6 rounded-2xl shadow-xl border ${
            darkMode 
              ? 'bg-gradient-to-br from-blue-900/50 to-cyan-900/50 border-blue-500/20' 
              : 'bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <span className={`text-sm font-bold uppercase ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                Programadas
              </span>
              <Clock className={`w-6 h-6 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
            </div>
            <p className={`text-4xl font-black ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              {promociones.filter(p => p.estado === "programada").length}
            </p>
          </div>

          <div className={`p-6 rounded-2xl shadow-xl border ${
            darkMode 
              ? 'bg-gradient-to-br from-purple-900/50 to-pink-900/50 border-purple-500/20' 
              : 'bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <span className={`text-sm font-bold uppercase ${darkMode ? 'text-purple-400' : 'text-purple-600'}`}>
                Usos Totales
              </span>
              <Tag className={`w-6 h-6 ${darkMode ? 'text-purple-400' : 'text-purple-600'}`} />
            </div>
            <p className={`text-4xl font-black ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              {promociones.reduce((sum, p) => sum + p.usos_actuales, 0)}
            </p>
          </div>
        </div>

        {/* Lista de Promociones */}
        {promocionesFiltradas.length === 0 ? (
          <div className={`text-center p-12 rounded-2xl ${darkMode ? 'bg-gray-800/50' : 'bg-white/50'} backdrop-blur-xl border ${darkMode ? 'border-gray-700' : 'border-white/50'}`}>
            <Gift className={`w-16 h-16 mx-auto mb-4 ${darkMode ? 'text-gray-600' : 'text-gray-400'}`} />
            <p className={`text-lg font-bold ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              No se encontraron promociones
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {promocionesFiltradas.map((promocion) => {
              const estadoBadge = getEstadoBadge(promocion.estado);
              
              return (
                <div
                  key={promocion.id_promocion}
                  className={`group relative rounded-2xl overflow-hidden shadow-xl border transition-all duration-300 hover:scale-105 ${
                    darkMode 
                      ? 'bg-gray-800/50 backdrop-blur-xl border-gray-700' 
                      : 'bg-white/80 backdrop-blur-xl border-white/50'
                  }`}
                >
                  {/* Imagen */}
                  {promocion.imagen_url ? (
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={promocion.imagen_url}
                        alt={promocion.titulo}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute top-4 right-4 px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-full font-black text-lg shadow-lg">
                        {promocion.descuento}% OFF
                      </div>
                    </div>
                  ) : (
                    <div className="h-48 bg-gradient-to-br from-orange-600 to-red-600 flex items-center justify-center">
                      <Gift className="w-24 h-24 text-white" />
                    </div>
                  )}

                  {/* Content */}
                  <div className="p-6">
                    {/* Estado Badge */}
                    <div className="mb-3">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${estadoBadge.bg} ${estadoBadge.text}`}>
                        {estadoBadge.label}
                      </span>
                    </div>

                    <h3 className={`text-xl font-black mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {promocion.titulo}
                    </h3>
                    
                    <p className={`text-sm mb-4 line-clamp-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      {promocion.descripcion}
                    </p>

                    {/* Fechas */}
                    <div className="flex items-center gap-2 mb-4">
                      <Calendar className={`w-4 h-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`} />
                      <span className={`text-xs font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        {new Date(promocion.fecha_inicio).toLocaleDateString()} - {new Date(promocion.fecha_fin).toLocaleDateString()}
                      </span>
                    </div>

                    {/* Código Promocional */}
                    {promocion.codigo_promocional && (
                      <div className={`mb-4 p-3 rounded-lg border-2 border-dashed ${darkMode ? 'border-orange-500/30 bg-orange-900/20' : 'border-orange-300 bg-orange-50'}`}>
                        <p className={`text-xs font-bold uppercase mb-1 ${darkMode ? 'text-orange-400' : 'text-orange-600'}`}>
                          Código
                        </p>
                        <p className={`text-lg font-black ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                          {promocion.codigo_promocional}
                        </p>
                      </div>
                    )}

                    {/* Límite de usos */}
                    {promocion.limite_usos && (
                      <div className="mb-4">
                        <div className="flex items-center justify-between text-xs mb-2">
                          <span className={`font-bold ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            Usos: {promocion.usos_actuales}/{promocion.limite_usos}
                          </span>
                          <span className={`font-bold ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            {Math.round((promocion.usos_actuales / promocion.limite_usos) * 100)}%
                          </span>
                        </div>
                        <div className={`h-2 rounded-full overflow-hidden ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
                          <div
                            className="h-full bg-gradient-to-r from-orange-500 to-red-500 transition-all duration-500"
                            style={{ width: `${Math.min((promocion.usos_actuales / promocion.limite_usos) * 100, 100)}%` }}
                          />
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(promocion)}
                        className="flex-1 px-4 py-2 bg-blue-100 text-blue-600 rounded-xl font-bold hover:bg-blue-200 transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2"
                      >
                        <Edit className="w-4 h-4" />
                        Editar
                      </button>

                      <button
                        onClick={() => handleDelete(promocion.id_promocion!)}
                        className="px-4 py-2 bg-red-100 text-red-600 rounded-xl font-bold hover:bg-red-200 transition-all duration-300 hover:scale-105"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Modal (se añade en la siguiente parte debido a limitación de espacio) */}
      </div>
    </div>
  );
}