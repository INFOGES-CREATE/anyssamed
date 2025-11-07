// frontend/src/app/(dashboard)/admin/centros/[id]/servicios/page.tsx
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
  Stethoscope,
  Moon,
  Sun,
  Sparkles,
  CheckCircle,
  AlertCircle,
  Search,
  Filter,
  GripVertical,
  Eye,
  EyeOff,
  TrendingUp,
} from "lucide-react";

interface Servicio {
  id_servicio?: number;
  nombre_servicio: string;
  descripcion_servicio: string;
  activo: boolean;
  prioridad: number;
}

export default function ServiciosCentroPage() {
  const params = useParams();
  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingServicio, setEditingServicio] = useState<Servicio | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterActivo, setFilterActivo] = useState<"todos" | "activos" | "inactivos">("todos");
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<Servicio>({
    nombre_servicio: "",
    descripcion_servicio: "",
    activo: true,
    prioridad: 0,
  });

  useEffect(() => {
    cargarServicios();
  }, [params.id]);

  const cargarServicios = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/centros/${params.id}/servicios`);
      const data = await response.json();

      if (data.success) {
        setServicios(data.data);
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
      const url = editingServicio
        ? `/api/admin/centros/${params.id}/servicios/${editingServicio.id_servicio}`
        : `/api/admin/centros/${params.id}/servicios`;

      const response = await fetch(url, {
        method: editingServicio ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(editingServicio ? "✅ Servicio actualizado" : "✅ Servicio creado");
        setShowModal(false);
        setEditingServicio(null);
        setFormData({
          nombre_servicio: "",
          descripcion_servicio: "",
          activo: true,
          prioridad: 0,
        });
        cargarServicios();
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

  const handleEdit = (servicio: Servicio) => {
    setEditingServicio(servicio);
    setFormData(servicio);
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("¿Estás seguro de eliminar este servicio?")) return;

    try {
      const response = await fetch(`/api/admin/centros/${params.id}/servicios/${id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (data.success) {
        setSuccess("✅ Servicio eliminado");
        cargarServicios();
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError(data.error);
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  const toggleActivo = async (servicio: Servicio) => {
    try {
      const response = await fetch(`/api/admin/centros/${params.id}/servicios/${servicio.id_servicio}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...servicio, activo: !servicio.activo }),
      });

      const data = await response.json();

      if (data.success) {
        cargarServicios();
      }
    } catch (err: any) {
      console.error(err);
    }
  };

  const serviciosFiltrados = servicios
    .filter((s) => {
      const matchSearch = s.nombre_servicio.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         s.descripcion_servicio.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchFilter = filterActivo === "todos" ? true :
                         filterActivo === "activos" ? s.activo :
                         !s.activo;
      
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
          Cargando servicios...
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
              ? 'bg-gradient-to-r from-blue-900/50 to-cyan-900/50 border-blue-500/20' 
              : 'bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-600 border-blue-200'
          }`}>
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzBoLTJWMGgydjMwem0tOCAwTDE4IDBoMnYzMGgtOHptMTYgMGgtMlYwaDJ2MzB6bTggMGgtMlYwaDJ2MzB6bS0yNCAwTDEwIDBoMnYzMGgtOHptMzIgMGgtMlYwaDJ2MzB6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-20"></div>
            
            <div className="relative z-10 flex items-center gap-4">
              <div className={`p-4 rounded-2xl shadow-xl ${darkMode ? 'bg-white/20' : 'bg-white/20'} backdrop-blur-xl`}>
                <Stethoscope className="w-10 h-10 md:w-12 md:h-12 text-white" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-black text-white mb-2 tracking-tight">
                  Gestión de Servicios
                </h1>
                <p className="text-base md:text-lg text-white/90 font-medium">
                  Administra los servicios que ofrece tu centro médico
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
                placeholder="Buscar servicios..."
                className={`w-full pl-12 pr-4 py-3 rounded-xl outline-none transition-all duration-300 font-semibold border-2 ${
                  darkMode
                    ? 'bg-gray-900/50 border-gray-700 text-white placeholder:text-gray-500 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20'
                    : 'bg-white border-gray-200 text-gray-900 placeholder:text-gray-400 focus:border-blue-600 focus:ring-4 focus:ring-blue-100'
                }`}
              />
            </div>

            {/* Filters */}
            <div className="flex gap-2">
              {["todos", "activos", "inactivos"].map((filter) => (
                <button
                  key={filter}
                  onClick={() => setFilterActivo(filter as any)}
                  className={`px-4 py-2 rounded-xl font-bold text-sm transition-all duration-300 ${
                    filterActivo === filter
                      ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg scale-105'
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
                setEditingServicio(null);
                setFormData({
                  nombre_servicio: "",
                  descripcion_servicio: "",
                  activo: true,
                  prioridad: 0,
                });
                setShowModal(true);
              }}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl font-bold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Nuevo Servicio
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className={`p-6 rounded-2xl shadow-xl border ${
            darkMode 
              ? 'bg-gradient-to-br from-blue-900/50 to-cyan-900/50 border-blue-500/20' 
              : 'bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <span className={`text-sm font-bold uppercase ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                Total
              </span>
              <Stethoscope className={`w-6 h-6 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
            </div>
            <p className={`text-4xl font-black ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              {servicios.length}
            </p>
          </div>

          <div className={`p-6 rounded-2xl shadow-xl border ${
            darkMode 
              ? 'bg-gradient-to-br from-green-900/50 to-emerald-900/50 border-green-500/20' 
              : 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-200'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <span className={`text-sm font-bold uppercase ${darkMode ? 'text-green-400' : 'text-green-600'}`}>
                Activos
              </span>
              <Eye className={`w-6 h-6 ${darkMode ? 'text-green-400' : 'text-green-600'}`} />
            </div>
            <p className={`text-4xl font-black ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              {servicios.filter(s => s.activo).length}
            </p>
          </div>

          <div className={`p-6 rounded-2xl shadow-xl border ${
            darkMode 
              ? 'bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700' 
              : 'bg-gradient-to-br from-gray-50 to-gray-100 border-gray-200'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <span className={`text-sm font-bold uppercase ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Inactivos
              </span>
              <EyeOff className={`w-6 h-6 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`} />
            </div>
            <p className={`text-4xl font-black ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              {servicios.filter(s => !s.activo).length}
            </p>
          </div>
        </div>

        {/* Lista de Servicios */}
        {serviciosFiltrados.length === 0 ? (
          <div className={`text-center p-12 rounded-2xl ${darkMode ? 'bg-gray-800/50' : 'bg-white/50'} backdrop-blur-xl border ${darkMode ? 'border-gray-700' : 'border-white/50'}`}>
            <Stethoscope className={`w-16 h-16 mx-auto mb-4 ${darkMode ? 'text-gray-600' : 'text-gray-400'}`} />
            <p className={`text-lg font-bold ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              No se encontraron servicios
            </p>
          </div>
        ) : (
          <div className="grid gap-6">
            {serviciosFiltrados.map((servicio, index) => (
              <div
                key={servicio.id_servicio}
                className={`group relative rounded-2xl p-6 shadow-xl border transition-all duration-300 hover:scale-[1.02] ${
                  darkMode 
                    ? 'bg-gray-800/50 backdrop-blur-xl border-gray-700' 
                    : 'bg-white/80 backdrop-blur-xl border-white/50'
                } ${!servicio.activo && 'opacity-50'}`}
              >
                <div className="flex items-start gap-4">
                  {/* Drag Handle */}
                  <div className={`mt-1 cursor-move ${darkMode ? 'text-gray-600' : 'text-gray-400'}`}>
                    <GripVertical className="w-5 h-5" />
                  </div>

                  {/* Priority Badge */}
                  <div className={`px-3 py-1 rounded-lg font-black text-sm ${
                    darkMode ? 'bg-blue-900/50 text-blue-400' : 'bg-blue-100 text-blue-600'
                  }`}>
                    #{servicio.prioridad || index + 1}
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <h3 className={`text-xl font-black mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {servicio.nombre_servicio}
                    </h3>
                    <p className={`text-sm leading-relaxed ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      {servicio.descripcion_servicio}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleActivo(servicio)}
                      className={`p-2 rounded-xl transition-all duration-300 hover:scale-110 ${
                        servicio.activo
                          ? 'bg-green-100 text-green-600 hover:bg-green-200'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                      title={servicio.activo ? "Desactivar" : "Activar"}
                    >
                      {servicio.activo ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                    </button>

                    <button
                      onClick={() => handleEdit(servicio)}
                      className="p-2 rounded-xl bg-blue-100 text-blue-600 hover:bg-blue-200 transition-all duration-300 hover:scale-110"
                    >
                      <Edit className="w-5 h-5" />
                    </button>

                    <button
                      onClick={() => handleDelete(servicio.id_servicio!)}
                      className="p-2 rounded-xl bg-red-100 text-red-600 hover:bg-red-200 transition-all duration-300 hover:scale-110"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className={`w-full max-w-2xl rounded-3xl shadow-2xl border overflow-hidden ${
              darkMode 
                ? 'bg-gray-800 border-gray-700' 
                : 'bg-white border-gray-200'
            }`}>
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-blue-600 to-cyan-600 p-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-black text-white">
                    {editingServicio ? "Editar Servicio" : "Nuevo Servicio"}
                  </h2>
                  <button
                    onClick={() => {
                      setShowModal(false);
                      setEditingServicio(null);
                    }}
                    className="p-2 rounded-xl bg-white/20 hover:bg-white/30 text-white transition-all duration-300"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>

              {/* Modal Body */}
              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                <div className="group">
                  <label className={`block text-sm font-black mb-2 uppercase tracking-wide ${
                    darkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Nombre del Servicio *
                  </label>
                  <input
                    type="text"
                    value={formData.nombre_servicio}
                    onChange={(e) => setFormData({ ...formData, nombre_servicio: e.target.value })}
                    required
                    className={`w-full px-4 py-4 rounded-xl outline-none transition-all duration-300 font-semibold border-2 ${
                      darkMode
                        ? 'bg-gray-900/50 border-gray-700 text-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20'
                        : 'bg-white border-gray-200 text-gray-900 focus:border-blue-600 focus:ring-4 focus:ring-blue-100'
                    }`}
                  />
                </div>

                <div className="group">
                  <label className={`block text-sm font-black mb-2 uppercase tracking-wide ${
                    darkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Descripción *
                  </label>
                  <textarea
                    value={formData.descripcion_servicio}
                    onChange={(e) => setFormData({ ...formData, descripcion_servicio: e.target.value })}
                    required
                    rows={4}
                    className={`w-full px-4 py-4 rounded-xl outline-none transition-all duration-300 font-medium resize-none border-2 ${
                      darkMode
                        ? 'bg-gray-900/50 border-gray-700 text-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20'
                        : 'bg-white border-gray-200 text-gray-900 focus:border-blue-600 focus:ring-4 focus:ring-blue-100'
                    }`}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="group">
                    <label className={`block text-sm font-black mb-2 uppercase tracking-wide ${
                      darkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      Prioridad
                    </label>
                    <input
                      type="number"
                      value={formData.prioridad}
                      onChange={(e) => setFormData({ ...formData, prioridad: parseInt(e.target.value) })}
                      min="0"
                      className={`w-full px-4 py-4 rounded-xl outline-none transition-all duration-300 font-semibold border-2 ${
                        darkMode
                          ? 'bg-gray-900/50 border-gray-700 text-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20'
                          : 'bg-white border-gray-200 text-gray-900 focus:border-blue-600 focus:ring-4 focus:ring-blue-100'
                      }`}
                    />
                  </div>

                  <div className="group">
                    <label className={`block text-sm font-black mb-2 uppercase tracking-wide ${
                      darkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      Estado
                    </label>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, activo: !formData.activo })}
                      className={`w-full px-4 py-4 rounded-xl font-bold transition-all duration-300 ${
                        formData.activo
                          ? 'bg-green-100 text-green-600 hover:bg-green-200'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {formData.activo ? "Activo" : "Inactivo"}
                    </button>
                  </div>
                </div>

                {/* Modal Actions */}
                <div className="flex gap-4 pt-4">
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex-1 px-6 py-4 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl font-black shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
                  >
                    {saving ? (
                      <>
                        <div className="w-5 h-5 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
                        Guardando...
                      </>
                    ) : (
                      <>
                        <Save className="w-5 h-5" />
                        {editingServicio ? "Actualizar" : "Crear"} Servicio
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      setEditingServicio(null);
                    }}
                    className="px-6 py-4 bg-gray-200 text-gray-700 rounded-xl font-black hover:bg-gray-300 transition-all duration-300"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}