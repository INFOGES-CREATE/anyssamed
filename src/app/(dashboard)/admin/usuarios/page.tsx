// frontend/src/app/(dashboard)/admin/usuarios/page.tsx
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
  Trash2,
  Ban,
  CheckCircle,
  Key,
  Building,
  UserCog,
  Activity,
  TrendingUp,
  AlertCircle,
  Clock,
  ArrowLeft,
  Moon,
  Sun,
  X,
} from "lucide-react";

interface Usuario {
  id_usuario: number;
  rut: string;
  nombre: string;
  apellido_paterno: string;
  apellido_materno: string;
  email: string;
  telefono: string;
  estado: string;
  tipo_usuario: string;
  nombre_completo: string;
  nombre_rol: string;
  centro_nombre: string;
  fecha_creacion: string;
  ultimo_acceso: string;
  total_citas: number;
  total_logs: number;
}

interface Estadisticas {
  total: number;
  activos: number;
  inactivos: number;
  bloqueados: number;
  medicos: number;
  administrativos: number;
  secretarias: number;
  pacientes: number;
  activos_ultima_semana: number;
  nuevos_ultimo_mes: number;
}

export default function UsuariosPage() {
  const router = useRouter();
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [estadisticas, setEstadisticas] = useState<Estadisticas | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Estados de filtros
  const [busqueda, setBusqueda] = useState("");
  const [estadoFiltro, setEstadoFiltro] = useState("todos");
  const [tipoFiltro, setTipoFiltro] = useState("todos");
  const [rolFiltro, setRolFiltro] = useState("todos");
  const [centroFiltro, setCentroFiltro] = useState("");
  const [ordenar, setOrdenar] = useState("fecha_desc");

  // Estados de paginación
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  // Estados de UI
  const [mostrarFiltros, setMostrarFiltros] = useState(false);
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState<number | null>(null);
  const [mostrarMenu, setMostrarMenu] = useState<number | null>(null);
  const [darkMode, setDarkMode] = useState(false);

  // Detectar preferencia de tema del sistema al cargar
  useEffect(() => {
    const darkModePreference = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const savedTheme = localStorage.getItem("theme");
    
    if (savedTheme) {
      setDarkMode(savedTheme === "dark");
    } else {
      setDarkMode(darkModePreference);
    }
  }, []);

  // Actualizar tema
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [darkMode]);

  // Cargar usuarios
  useEffect(() => {
    cargarUsuarios();
  }, [page, limit, estadoFiltro, tipoFiltro, rolFiltro, centroFiltro, ordenar]);

  const cargarUsuarios = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        estado: estadoFiltro,
        tipo: tipoFiltro,
        rol: rolFiltro,
        centro: centroFiltro,
        busqueda: busqueda,
        ordenar: ordenar,
      });

      const response = await fetch(`/api/admin/usuarios?${params}`);
      const data = await response.json();

      if (data.success) {
        setUsuarios(data.data);
        setEstadisticas(data.estadisticas);
        setTotalPages(data.pagination.totalPages);
        setTotal(data.pagination.total);
      } else {
        setError(data.error);
      }
    } catch (error) {
      console.error("Error al cargar usuarios:", error);
      setError("Error al cargar usuarios");
    } finally {
      setLoading(false);
    }
  };

  const handleBuscar = () => {
    setPage(1);
    cargarUsuarios();
  };

  const handleLimpiarFiltros = () => {
    setBusqueda("");
    setEstadoFiltro("todos");
    setTipoFiltro("todos");
    setRolFiltro("todos");
    setCentroFiltro("");
    setOrdenar("fecha_desc");
    setPage(1);
  };

  const handleSuspender = async (id: number) => {
    if (!confirm("¿Está seguro de suspender este usuario?")) return;

    const motivo = prompt("Ingrese el motivo de la suspensión:");
    if (!motivo) return;

    try {
      const response = await fetch(`/api/admin/usuarios/${id}/suspender`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ motivo }),
      });

      const data = await response.json();

      if (data.success) {
        alert("Usuario suspendido exitosamente");
        cargarUsuarios();
      } else {
        alert(data.error);
      }
    } catch (error) {
      alert("Error al suspender usuario");
    }
  };

  const handleActivar = async (id: number) => {
    if (!confirm("¿Está seguro de activar este usuario?")) return;

    try {
      const response = await fetch(`/api/admin/usuarios/${id}/activar`, {
        method: "POST",
      });

      const data = await response.json();

      if (data.success) {
        alert("Usuario activado exitosamente");
        cargarUsuarios();
      } else {
        alert(data.error);
      }
    } catch (error) {
      alert("Error al activar usuario");
    }
  };

  const handleEliminar = async (id: number) => {
    if (!confirm("¿Está seguro de eliminar este usuario? Esta acción no se puede deshacer.")) return;

    try {
      const response = await fetch(`/api/admin/usuarios/${id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (data.success) {
        alert("Usuario eliminado exitosamente");
        cargarUsuarios();
      } else {
        alert(data.error);
      }
    } catch (error) {
      alert("Error al eliminar usuario");
    }
  };

  const getEstadoBadge = (estado: string) => {
    const badges = {
      activo: darkMode
        ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
        : "bg-emerald-50 text-emerald-700 border-emerald-200",
      inactivo: darkMode
        ? "bg-slate-500/20 text-slate-300 border-slate-500/30"
        : "bg-slate-50 text-slate-700 border-slate-200",
      bloqueado: darkMode
        ? "bg-rose-500/20 text-rose-300 border-rose-500/30"
        : "bg-rose-50 text-rose-700 border-rose-200",
    };
    return badges[estado as keyof typeof badges] || badges.inactivo;
  };

  const getTipoBadge = (tipo: string) => {
    const badges = {
      medico: darkMode
        ? "bg-blue-500/20 text-blue-300 border-blue-500/30"
        : "bg-blue-50 text-blue-700 border-blue-200",
      administrativo: darkMode
        ? "bg-purple-500/20 text-purple-300 border-purple-500/30"
        : "bg-purple-50 text-purple-700 border-purple-200",
      secretaria: darkMode
        ? "bg-pink-500/20 text-pink-300 border-pink-500/30"
        : "bg-pink-50 text-pink-700 border-pink-200",
      paciente: darkMode
        ? "bg-teal-500/20 text-teal-300 border-teal-500/30"
        : "bg-teal-50 text-teal-700 border-teal-200",
      otro: darkMode
        ? "bg-amber-500/20 text-amber-300 border-amber-500/30"
        : "bg-amber-50 text-amber-700 border-amber-200",
    };
    return badges[tipo as keyof typeof badges] || badges.otro;
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      darkMode
        ? "bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900"
        : "bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50"
    } p-4 md:p-6 lg:p-8`}>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header con Botón de Volver y Toggle de Tema */}
        <div className={`${
          darkMode
            ? "bg-slate-800/95 backdrop-blur-xl border-slate-700/50"
            : "bg-white/95 backdrop-blur-xl border-slate-200"
        } rounded-2xl shadow-2xl border p-6 md:p-8 transition-all duration-300`}>
          <div className="flex flex-col gap-6">
            {/* Fila Superior: Volver y Tema */}
            <div className="flex items-center justify-between">
              <button
                onClick={() => router.push("/admin")}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold transition-all duration-300 ${
                  darkMode
                    ? "bg-slate-700/50 text-slate-300 hover:bg-slate-700 border border-slate-600"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200"
                }`}
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Volver</span>
              </button>

              <button
                onClick={() => setDarkMode(!darkMode)}
                className={`p-3 rounded-xl transition-all duration-300 ${
                  darkMode
                    ? "bg-amber-500/20 text-amber-400 hover:bg-amber-500/30 border border-amber-500/30"
                    : "bg-indigo-100 text-indigo-600 hover:bg-indigo-200 border border-indigo-200"
                }`}
                title={darkMode ? "Cambiar a tema claro" : "Cambiar a tema oscuro"}
              >
                {darkMode ? <Sun className="w-6 h-6" /> : <Moon className="w-6 h-6" />}
              </button>
            </div>

            {/* Título y Acciones */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className={`p-4 rounded-2xl shadow-lg transition-all duration-300 ${
                  darkMode
                    ? "bg-gradient-to-br from-blue-600 to-indigo-700"
                    : "bg-gradient-to-br from-blue-500 to-indigo-600"
                }`}>
                  <Users className="w-9 h-9 text-white" />
                </div>
                <div>
                  <h1 className={`text-3xl md:text-4xl font-bold transition-colors duration-300 ${
                    darkMode ? "text-white" : "text-slate-800"
                  }`}>
                    Gestión de Usuarios
                  </h1>
                  <p className={`mt-1 text-sm md:text-base transition-colors duration-300 ${
                    darkMode ? "text-slate-400" : "text-slate-600"
                  }`}>
                    Administra todos los usuarios del sistema
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => router.push("/admin/usuarios/nuevo")}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 font-semibold"
                >
                  <Plus className="w-5 h-5" />
                  <span>Nuevo Usuario</span>
                </button>
                <button className={`flex items-center gap-2 px-4 py-3 rounded-xl transition-all duration-300 font-semibold ${
                  darkMode
                    ? "bg-slate-700 border-2 border-slate-600 text-slate-300 hover:bg-slate-600"
                    : "bg-white border-2 border-slate-200 text-slate-700 hover:bg-slate-50"
                }`}>
                  <Download className="w-5 h-5" />
                  <span className="hidden sm:inline">Exportar</span>
                </button>
                <button className={`flex items-center gap-2 px-4 py-3 rounded-xl transition-all duration-300 font-semibold ${
                  darkMode
                    ? "bg-slate-700 border-2 border-slate-600 text-slate-300 hover:bg-slate-600"
                    : "bg-white border-2 border-slate-200 text-slate-700 hover:bg-slate-50"
                }`}>
                  <Upload className="w-5 h-5" />
                  <span className="hidden sm:inline">Importar</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Estadísticas */}
        {estadisticas && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-xl p-6 text-white transform hover:scale-105 transition-transform duration-300">
              <div className="flex items-center justify-between mb-3">
                <Users className="w-10 h-10 opacity-90" />
                <TrendingUp className="w-6 h-6 opacity-70" />
              </div>
              <div className="text-4xl font-bold mb-1">{estadisticas.total}</div>
              <div className="text-blue-100 text-sm font-medium">Total Usuarios</div>
            </div>

            <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl shadow-xl p-6 text-white transform hover:scale-105 transition-transform duration-300">
              <div className="flex items-center justify-between mb-3">
                <CheckCircle className="w-10 h-10 opacity-90" />
                <div className="text-xs bg-white/25 px-3 py-1 rounded-full font-bold">
                  {((estadisticas.activos / estadisticas.total) * 100).toFixed(0)}%
                </div>
              </div>
              <div className="text-4xl font-bold mb-1">{estadisticas.activos}</div>
              <div className="text-emerald-100 text-sm font-medium">Activos</div>
            </div>

            <div className="bg-gradient-to-br from-rose-500 to-rose-600 rounded-2xl shadow-xl p-6 text-white transform hover:scale-105 transition-transform duration-300">
              <div className="flex items-center justify-between mb-3">
                <Ban className="w-10 h-10 opacity-90" />
                <AlertCircle className="w-6 h-6 opacity-70" />
              </div>
              <div className="text-4xl font-bold mb-1">{estadisticas.bloqueados}</div>
              <div className="text-rose-100 text-sm font-medium">Bloqueados</div>
            </div>

            <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl shadow-xl p-6 text-white transform hover:scale-105 transition-transform duration-300">
              <div className="flex items-center justify-between mb-3">
                <Activity className="w-10 h-10 opacity-90" />
                <Clock className="w-6 h-6 opacity-70" />
              </div>
              <div className="text-4xl font-bold mb-1">
                {estadisticas.activos_ultima_semana}
              </div>
              <div className="text-purple-100 text-sm font-medium">Activos (7 días)</div>
            </div>

            <div className="bg-gradient-to-br from-teal-500 to-teal-600 rounded-2xl shadow-xl p-6 text-white transform hover:scale-105 transition-transform duration-300">
              <div className="flex items-center justify-between mb-3">
                <Users className="w-10 h-10 opacity-90" />
                <Plus className="w-6 h-6 opacity-70" />
              </div>
              <div className="text-4xl font-bold mb-1">
                {estadisticas.nuevos_ultimo_mes}
              </div>
              <div className="text-teal-100 text-sm font-medium">Nuevos (30 días)</div>
            </div>
          </div>
        )}

        {/* Filtros y Búsqueda */}
        <div className={`${
          darkMode
            ? "bg-slate-800/95 backdrop-blur-xl border-slate-700/50"
            : "bg-white/95 backdrop-blur-xl border-slate-200"
        } rounded-2xl shadow-2xl border p-6 transition-all duration-300`}>
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Búsqueda */}
            <div className="flex-1">
              <div className="relative">
                <Search className={`absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 ${
                  darkMode ? "text-slate-500" : "text-slate-400"
                }`} />
                <input
                  type="text"
                  placeholder="Buscar por nombre, email, RUT..."
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleBuscar()}
                  className={`w-full pl-12 pr-4 py-3 rounded-xl transition-all duration-300 font-medium ${
                    darkMode
                      ? "bg-slate-700/50 border-2 border-slate-600 text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      : "bg-white border-2 border-slate-200 text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  }`}
                />
              </div>
            </div>

            {/* Botones de acción */}
            <div className="flex gap-2">
              <button
                onClick={handleBuscar}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl font-semibold transform hover:-translate-y-0.5"
              >
                Buscar
              </button>
              <button
                onClick={() => setMostrarFiltros(!mostrarFiltros)}
                className={`flex items-center gap-2 px-4 py-3 rounded-xl transition-all duration-300 font-semibold ${
                  darkMode
                    ? "bg-slate-700 border-2 border-slate-600 text-slate-300 hover:bg-slate-600"
                    : "bg-white border-2 border-slate-200 text-slate-700 hover:bg-slate-50"
                }`}
              >
                {mostrarFiltros ? <X className="w-5 h-5" /> : <Filter className="w-5 h-5" />}
                <span className="hidden sm:inline">
                  {mostrarFiltros ? "Cerrar" : "Filtros"}
                </span>
              </button>
            </div>
          </div>

          {/* Panel de filtros expandible */}
          {mostrarFiltros && (
            <div className={`mt-6 pt-6 transition-all duration-300 ${
              darkMode ? "border-t border-slate-700" : "border-t border-slate-200"
            }`}>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className={`block text-sm font-bold mb-2 transition-colors duration-300 ${
                    darkMode ? "text-slate-300" : "text-slate-700"
                  }`}>
                    Estado
                  </label>
                  <select
                    value={estadoFiltro}
                    onChange={(e) => setEstadoFiltro(e.target.value)}
                    className={`w-full px-4 py-3 rounded-xl transition-all duration-300 font-medium ${
                      darkMode
                        ? "bg-slate-700/50 border-2 border-slate-600 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        : "bg-white border-2 border-slate-200 text-slate-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    }`}
                  >
                    <option value="todos">Todos</option>
                    <option value="activo">Activos</option>
                    <option value="inactivo">Inactivos</option>
                    <option value="bloqueado">Bloqueados</option>
                  </select>
                </div>

                <div>
                  <label className={`block text-sm font-bold mb-2 transition-colors duration-300 ${
                    darkMode ? "text-slate-300" : "text-slate-700"
                  }`}>
                    Tipo de Usuario
                  </label>
                  <select
                    value={tipoFiltro}
                    onChange={(e) => setTipoFiltro(e.target.value)}
                    className={`w-full px-4 py-3 rounded-xl transition-all duration-300 font-medium ${
                      darkMode
                        ? "bg-slate-700/50 border-2 border-slate-600 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        : "bg-white border-2 border-slate-200 text-slate-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    }`}
                  >
                    <option value="todos">Todos</option>
                    <option value="medico">Médicos</option>
                    <option value="administrativo">Administrativos</option>
                    <option value="secretaria">Secretarias</option>
                    <option value="paciente">Pacientes</option>
                  </select>
                </div>

                <div>
                  <label className={`block text-sm font-bold mb-2 transition-colors duration-300 ${
                    darkMode ? "text-slate-300" : "text-slate-700"
                  }`}>
                    Ordenar por
                  </label>
                  <select
                    value={ordenar}
                    onChange={(e) => setOrdenar(e.target.value)}
                    className={`w-full px-4 py-3 rounded-xl transition-all duration-300 font-medium ${
                      darkMode
                        ? "bg-slate-700/50 border-2 border-slate-600 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        : "bg-white border-2 border-slate-200 text-slate-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    }`}
                  >
                    <option value="fecha_desc">Más recientes</option>
                    <option value="fecha_asc">Más antiguos</option>
                    <option value="nombre_asc">Nombre A-Z</option>
                    <option value="nombre_desc">Nombre Z-A</option>
                    <option value="ultimo_acceso">Último acceso</option>
                  </select>
                </div>

                <div className="flex items-end">
                  <button
                    onClick={handleLimpiarFiltros}
                    className={`w-full px-4 py-3 rounded-xl transition-all duration-300 font-bold ${
                      darkMode
                        ? "bg-slate-700 text-slate-300 hover:bg-slate-600"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    }`}
                  >
                    Limpiar Filtros
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Tabla de Usuarios */}
        <div className={`${
          darkMode
            ? "bg-slate-800/95 backdrop-blur-xl border-slate-700/50"
            : "bg-white/95 backdrop-blur-xl border-slate-200"
        } rounded-2xl shadow-2xl border overflow-hidden transition-all duration-300`}>
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="relative">
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <Users className="w-8 h-8 text-blue-500" />
                </div>
              </div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <AlertCircle className={`w-16 h-16 mx-auto mb-4 ${
                  darkMode ? "text-rose-400" : "text-rose-500"
                }`} />
                <p className={`font-bold text-lg ${
                  darkMode ? "text-rose-400" : "text-rose-600"
                }`}>{error}</p>
              </div>
            </div>
          ) : usuarios.length === 0 ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <Users className={`w-16 h-16 mx-auto mb-4 ${
                  darkMode ? "text-slate-600" : "text-slate-400"
                }`} />
                <p className={`font-bold text-lg ${
                  darkMode ? "text-slate-400" : "text-slate-600"
                }`}>No se encontraron usuarios</p>
              </div>
            </div>
          ) : (
            <>
              {/* Vista Desktop */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="w-full">
                  <thead className={`${
                    darkMode
                      ? "bg-slate-700/50 border-b-2 border-slate-600"
                      : "bg-gradient-to-r from-slate-50 to-slate-100 border-b-2 border-slate-200"
                  } transition-colors duration-300`}>
                    <tr>
                      <th className={`px-6 py-4 text-left text-xs font-bold uppercase tracking-wider ${
                        darkMode ? "text-slate-300" : "text-slate-700"
                      }`}>
                        Usuario
                      </th>
                      <th className={`px-6 py-4 text-left text-xs font-bold uppercase tracking-wider ${
                        darkMode ? "text-slate-300" : "text-slate-700"
                      }`}>
                        Contacto
                      </th>
                      <th className={`px-6 py-4 text-left text-xs font-bold uppercase tracking-wider ${
                        darkMode ? "text-slate-300" : "text-slate-700"
                      }`}>
                        Tipo
                      </th>
                      <th className={`px-6 py-4 text-left text-xs font-bold uppercase tracking-wider ${
                        darkMode ? "text-slate-300" : "text-slate-700"
                      }`}>
                        Centro
                      </th>
                      <th className={`px-6 py-4 text-left text-xs font-bold uppercase tracking-wider ${
                        darkMode ? "text-slate-300" : "text-slate-700"
                      }`}>
                        Estado
                      </th>
                      <th className={`px-6 py-4 text-left text-xs font-bold uppercase tracking-wider ${
                        darkMode ? "text-slate-300" : "text-slate-700"
                      }`}>
                        Actividad
                      </th>
                      <th className={`px-6 py-4 text-center text-xs font-bold uppercase tracking-wider ${
                        darkMode ? "text-slate-300" : "text-slate-700"
                      }`}>
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${
                    darkMode ? "divide-slate-700" : "divide-slate-200"
                  }`}>
                    {usuarios.map((usuario) => (
                      <tr
                        key={usuario.id_usuario}
                        className={`transition-colors duration-200 ${
                          darkMode ? "hover:bg-slate-700/50" : "hover:bg-slate-50"
                        }`}
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold shadow-lg transform hover:scale-110 transition-transform duration-200">
                              {usuario.nombre.charAt(0)}
                              {usuario.apellido_paterno.charAt(0)}
                            </div>
                            <div>
                              <div className={`font-bold ${
                                darkMode ? "text-white" : "text-slate-800"
                              }`}>
                                {usuario.nombre_completo}
                              </div>
                              <div className={`text-sm ${
                                darkMode ? "text-slate-400" : "text-slate-500"
                              }`}>
                                RUT: {usuario.rut}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm">
                            <div className={darkMode ? "text-slate-300" : "text-slate-800"}>
                              {usuario.email}
                            </div>
                            <div className={darkMode ? "text-slate-500" : "text-slate-500"}>
                              {usuario.telefono || "Sin teléfono"}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold border ${getTipoBadge(
                              usuario.tipo_usuario
                            )}`}
                          >
                            {usuario.tipo_usuario}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className={`text-sm font-medium ${
                            darkMode ? "text-slate-400" : "text-slate-600"
                          }`}>
                            {usuario.centro_nombre || "Sin centro"}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold border ${getEstadoBadge(
                              usuario.estado
                            )}`}
                          >
                            {usuario.estado}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm">
                            <div className={`font-medium ${
                              darkMode ? "text-slate-300" : "text-slate-600"
                            }`}>
                              {usuario.total_citas} citas
                            </div>
                            <div className={darkMode ? "text-slate-500" : "text-slate-500"}>
                              {usuario.total_logs} logs
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() =>
                                router.push(`/admin/usuarios/${usuario.id_usuario}`)
                              }
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
                              onClick={() =>
                                router.push(`/admin/usuarios/${usuario.id_usuario}/editar`)
                              }
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
                                    mostrarMenu === usuario.id_usuario
                                      ? null
                                      : usuario.id_usuario
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

                              {mostrarMenu === usuario.id_usuario && (
                                <div className={`absolute right-0 mt-2 w-52 rounded-xl shadow-2xl border py-2 z-50 ${
                                  darkMode
                                    ? "bg-slate-800 border-slate-700"
                                    : "bg-white border-slate-200"
                                }`}>
                                  <button
                                    onClick={() => {
                                      router.push(
                                        `/admin/usuarios/${usuario.id_usuario}/logs`
                                      );
                                      setMostrarMenu(null);
                                    }}
                                    className={`w-full px-4 py-2.5 text-left text-sm font-medium flex items-center gap-3 transition-colors ${
                                      darkMode
                                        ? "text-slate-300 hover:bg-slate-700"
                                        : "text-slate-700 hover:bg-slate-50"
                                    }`}
                                  >
                                    <Activity className="w-4 h-4" />
                                    Ver Logs
                                  </button>
                                  <button
                                    onClick={() => {
                                      router.push(
                                        `/admin/usuarios/${usuario.id_usuario}/estadisticas`
                                      );
                                      setMostrarMenu(null);
                                    }}
                                    className={`w-full px-4 py-2.5 text-left text-sm font-medium flex items-center gap-3 transition-colors ${
                                      darkMode
                                        ? "text-slate-300 hover:bg-slate-700"
                                        : "text-slate-700 hover:bg-slate-50"
                                    }`}
                                  >
                                    <TrendingUp className="w-4 h-4" />
                                    Estadísticas
                                  </button>
                                  <div className={`border-t my-2 ${
                                    darkMode ? "border-slate-700" : "border-slate-200"
                                  }`}></div>
                                  {usuario.estado === "activo" ? (
                                    <button
                                      onClick={() => {
                                        handleSuspender(usuario.id_usuario);
                                        setMostrarMenu(null);
                                      }}
                                      className={`w-full px-4 py-2.5 text-left text-sm font-medium flex items-center gap-3 transition-colors ${
                                        darkMode
                                          ? "text-amber-400 hover:bg-amber-500/20"
                                          : "text-amber-600 hover:bg-amber-50"
                                      }`}
                                    >
                                      <Ban className="w-4 h-4" />
                                      Suspender
                                    </button>
                                  ) : (
                                    <button
                                      onClick={() => {
                                        handleActivar(usuario.id_usuario);
                                        setMostrarMenu(null);
                                      }}
                                      className={`w-full px-4 py-2.5 text-left text-sm font-medium flex items-center gap-3 transition-colors ${
                                        darkMode
                                          ? "text-emerald-400 hover:bg-emerald-500/20"
                                          : "text-emerald-600 hover:bg-emerald-50"
                                      }`}
                                    >
                                      <CheckCircle className="w-4 h-4" />
                                      Activar
                                    </button>
                                  )}
                                  <div className={`border-t my-2 ${
                                    darkMode ? "border-slate-700" : "border-slate-200"
                                  }`}></div>
                                  <button
                                    onClick={() => {
                                      handleEliminar(usuario.id_usuario);
                                      setMostrarMenu(null);
                                    }}
                                    className={`w-full px-4 py-2.5 text-left text-sm font-medium flex items-center gap-3 transition-colors ${
                                      darkMode
                                        ? "text-rose-400 hover:bg-rose-500/20"
                                        : "text-rose-600 hover:bg-rose-50"
                                    }`}
                                  >
                                    <Trash2 className="w-4 h-4" />
                                    Eliminar
                                  </button>
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

              {/* Vista Mobile */}
              <div className={`lg:hidden divide-y ${
                darkMode ? "divide-slate-700" : "divide-slate-200"
              }`}>
                {usuarios.map((usuario) => (
                  <div
                    key={usuario.id_usuario}
                    className={`p-4 transition-colors duration-200 ${
                      darkMode ? "hover:bg-slate-700/50" : "hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold shadow-lg flex-shrink-0 transform hover:scale-110 transition-transform duration-200">
                        {usuario.nombre.charAt(0)}
                        {usuario.apellido_paterno.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className={`font-bold text-lg truncate ${
                          darkMode ? "text-white" : "text-slate-800"
                        }`}>
                          {usuario.nombre_completo}
                        </h3>
                        <p className={`text-sm ${
                          darkMode ? "text-slate-400" : "text-slate-500"
                        }`}>{usuario.email}</p>
                        <div className="flex flex-wrap gap-2 mt-2">
                          <span
                            className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${getEstadoBadge(
                              usuario.estado
                            )}`}
                          >
                            {usuario.estado}
                          </span>
                          <span
                            className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${getTipoBadge(
                              usuario.tipo_usuario
                            )}`}
                          >
                            {usuario.tipo_usuario}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-3">
                      <button
                        onClick={() =>
                          router.push(`/admin/usuarios/${usuario.id_usuario}`)
                        }
                        className={`flex-1 px-3 py-2.5 rounded-lg text-sm font-bold transition-colors ${
                          darkMode
                            ? "bg-blue-500/20 text-blue-400 hover:bg-blue-500/30"
                            : "bg-blue-50 text-blue-600 hover:bg-blue-100"
                        }`}
                      >
                        Ver
                      </button>
                      <button
                        onClick={() =>
                          router.push(`/admin/usuarios/${usuario.id_usuario}/editar`)
                        }
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
                            mostrarMenu === usuario.id_usuario
                              ? null
                              : usuario.id_usuario
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
              <div className={`px-6 py-4 border-t transition-colors duration-300 ${
                darkMode
                  ? "bg-slate-800/50 border-slate-700"
                  : "bg-slate-50 border-slate-200"
              }`}>
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className={`text-sm font-medium ${
                    darkMode ? "text-slate-400" : "text-slate-600"
                  }`}>
                    Mostrando {(page - 1) * limit + 1} a{" "}
                    {Math.min(page * limit, total)} de {total} usuarios
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
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
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
                                ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg transform scale-110"
                                : darkMode
                                ? "bg-slate-700 border-2 border-slate-600 text-slate-300 hover:bg-slate-600"
                                : "bg-white border-2 border-slate-200 text-slate-700 hover:bg-slate-50"
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
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