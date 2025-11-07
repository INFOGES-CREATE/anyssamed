// frontend/src/app/(dashboard)/admin/centros/[id]/usuarios/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Users,
  Search,
  Filter,
  Download,
  RefreshCw,
  Mail,
  Phone,
  Shield,
  CheckCircle,
  XCircle,
  AlertCircle,
  Eye,
  Edit,
  Trash2,
  UserPlus,
  X,
} from "lucide-react";

interface Usuario {
  id_usuario: number;
  nombre: string;
  apellido_paterno: string;
  apellido_materno: string;
  email: string;
  telefono: string;
  estado: string;
  fecha_creacion: string;
  rol: string;
  tipo_usuario: string;
}

export default function UsuariosCentroPage() {
  const params = useParams();
  const router = useRouter();
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busqueda, setBusqueda] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("todos");
  const [filtroTipo, setFiltroTipo] = useState("todos");
  
  // Estados para modales
  const [modalVerUsuario, setModalVerUsuario] = useState<Usuario | null>(null);
  const [modalEliminar, setModalEliminar] = useState<Usuario | null>(null);
  const [procesando, setProcesando] = useState(false);

  const cargarUsuarios = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`/api/admin/centros/${params.id}/usuarios`);
      const data = await response.json();

      if (data.success) {
        setUsuarios(data.data);
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
    cargarUsuarios();
  }, [params.id]);

  // ============================================================================
  // FUNCIONES DE ACCIONES
  // ============================================================================

  /**
   * Ver detalles del usuario
   */
  const handleVerUsuario = (usuario: Usuario) => {
    setModalVerUsuario(usuario);
  };

  /**
   * Editar usuario
   */
  const handleEditarUsuario = (usuario: Usuario) => {
    router.push(`/admin/usuarios/${usuario.id_usuario}/editar`);
  };

  /**
   * Abrir modal de confirmación para eliminar
   */
  const handleAbrirModalEliminar = (usuario: Usuario) => {
    setModalEliminar(usuario);
  };

  /**
   * Eliminar usuario
   */
  const handleEliminarUsuario = async () => {
    if (!modalEliminar) return;

    try {
      setProcesando(true);
      const response = await fetch(`/api/admin/usuarios/${modalEliminar.id_usuario}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (data.success) {
        // Recargar usuarios
        await cargarUsuarios();
        setModalEliminar(null);
        alert("Usuario eliminado exitosamente");
      } else {
        alert(`Error: ${data.error}`);
      }
    } catch (err: any) {
      alert(`Error al eliminar: ${err.message}`);
    } finally {
      setProcesando(false);
    }
  };

  /**
   * Crear nuevo usuario
   */
  const handleNuevoUsuario = () => {
    router.push(`/admin/centros/${params.id}/usuarios/nuevo`);
  };

  /**
   * Exportar usuarios a CSV
   */
  const handleExportar = () => {
    try {
      // Crear CSV
      const headers = [
        "ID",
        "Nombre",
        "Apellido Paterno",
        "Apellido Materno",
        "Email",
        "Teléfono",
        "Rol",
        "Tipo",
        "Estado",
        "Fecha Creación",
      ];

      const rows = usuariosFiltrados.map((u) => [
        u.id_usuario,
        u.nombre,
        u.apellido_paterno,
        u.apellido_materno,
        u.email,
        u.telefono || "",
        u.rol || "",
        u.tipo_usuario,
        u.estado,
        new Date(u.fecha_creacion).toLocaleDateString("es-CL"),
      ]);

      const csvContent = [
        headers.join(","),
        ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
      ].join("\n");

      // Descargar archivo
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", `usuarios_centro_${params.id}_${Date.now()}.csv`);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err: any) {
      alert(`Error al exportar: ${err.message}`);
    }
  };

  // Filtrar usuarios
  const usuariosFiltrados = usuarios.filter((usuario) => {
    const matchBusqueda =
      busqueda === "" ||
      usuario.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      usuario.apellido_paterno.toLowerCase().includes(busqueda.toLowerCase()) ||
      usuario.email.toLowerCase().includes(busqueda.toLowerCase());

    const matchEstado = filtroEstado === "todos" || usuario.estado === filtroEstado;
    const matchTipo = filtroTipo === "todos" || usuario.tipo_usuario === filtroTipo;

    return matchBusqueda && matchEstado && matchTipo;
  });

  const EstadoBadge = ({ estado }: { estado: string }) => {
    const estilos = {
      activo: "bg-green-100 text-green-800 border-green-200",
      inactivo: "bg-gray-100 text-gray-800 border-gray-200",
      bloqueado: "bg-red-100 text-red-800 border-red-200",
    };

    const iconos = {
      activo: <CheckCircle className="w-3 h-3" />,
      inactivo: <AlertCircle className="w-3 h-3" />,
      bloqueado: <XCircle className="w-3 h-3" />,
    };

    return (
      <span
        className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full border ${
          estilos[estado as keyof typeof estilos]
        }`}
      >
        {iconos[estado as keyof typeof iconos]}
        {estado.charAt(0).toUpperCase() + estado.slice(1)}
      </span>
    );
  };

  const TipoUsuarioBadge = ({ tipo }: { tipo: string }) => {
    const estilos = {
      medico: "bg-blue-100 text-blue-800 border-blue-200",
      administrativo: "bg-purple-100 text-purple-800 border-purple-200",
      secretaria: "bg-pink-100 text-pink-800 border-pink-200",
      otro: "bg-gray-100 text-gray-800 border-gray-200",
    };

    return (
      <span
        className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full border ${
          estilos[tipo as keyof typeof estilos]
        }`}
      >
        {tipo.charAt(0).toUpperCase() + tipo.slice(1)}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Link
            href={`/admin/centros/${params.id}`}
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver al Centro
          </Link>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <Users className="w-8 h-8 text-blue-600" />
                Usuarios del Centro
              </h1>
              <p className="text-gray-600 mt-2">
                {usuariosFiltrados.length} usuarios encontrados
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={cargarUsuarios}
                disabled={loading}
                className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
                Actualizar
              </button>

              <button
                onClick={handleExportar}
                disabled={usuariosFiltrados.length === 0}
                className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Download className="w-4 h-4" />
                Exportar
              </button>

              <button
                onClick={handleNuevoUsuario}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
              >
                <UserPlus className="w-4 h-4" />
                Nuevo Usuario
              </button>
            </div>
          </div>
        </div>

        {/* Estadísticas Rápidas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Usuarios</p>
                <p className="text-2xl font-bold text-gray-900">{usuarios.length}</p>
              </div>
              <Users className="w-8 h-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Activos</p>
                <p className="text-2xl font-bold text-green-600">
                  {usuarios.filter((u) => u.estado === "activo").length}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Médicos</p>
                <p className="text-2xl font-bold text-blue-600">
                  {usuarios.filter((u) => u.tipo_usuario === "medico").length}
                </p>
              </div>
              <Shield className="w-8 h-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Administrativos</p>
                <p className="text-2xl font-bold text-purple-600">
                  {usuarios.filter((u) => u.tipo_usuario === "administrativo").length}
                </p>
              </div>
              <Shield className="w-8 h-8 text-purple-600" />
            </div>
          </div>
        </div>

        {/* Filtros */}
        <div className="bg-white p-4 rounded-lg border border-gray-200 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Búsqueda */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Buscar por nombre, apellido o email..."
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Filtro Estado */}
            <select
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="todos">Todos los estados</option>
              <option value="activo">Activos</option>
              <option value="inactivo">Inactivos</option>
              <option value="bloqueado">Bloqueados</option>
            </select>

            {/* Filtro Tipo */}
            <select
              value={filtroTipo}
              onChange={(e) => setFiltroTipo(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="todos">Todos los tipos</option>
              <option value="medico">Médicos</option>
              <option value="administrativo">Administrativos</option>
              <option value="secretaria">Secretarias</option>
              <option value="otro">Otros</option>
            </select>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg mb-6">
            <p className="font-medium">Error</p>
            <p className="text-sm">{error}</p>
          </div>
        )}

        {/* Tabla de Usuarios */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Usuario
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contacto
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rol
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tipo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha Registro
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {usuariosFiltrados.map((usuario) => (
                <tr key={usuario.id_usuario} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold">
                        {usuario.nombre.charAt(0)}
                        {usuario.apellido_paterno.charAt(0)}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {usuario.nombre} {usuario.apellido_paterno} {usuario.apellido_materno}
                        </div>
                        <div className="text-sm text-gray-500">ID: {usuario.id_usuario}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 flex items-center gap-2">
                      <Mail className="w-4 h-4 text-gray-400" />
                      {usuario.email}
                    </div>
                    {usuario.telefono && (
                      <div className="text-sm text-gray-500 flex items-center gap-2 mt-1">
                        <Phone className="w-4 h-4 text-gray-400" />
                        {usuario.telefono}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{usuario.rol || "Sin rol"}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <TipoUsuarioBadge tipo={usuario.tipo_usuario} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <EstadoBadge estado={usuario.estado} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(usuario.fecha_creacion).toLocaleDateString("es-CL")}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleVerUsuario(usuario)}
                        className="text-blue-600 hover:text-blue-900 p-1 hover:bg-blue-50 rounded transition-colors"
                        title="Ver detalles"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleEditarUsuario(usuario)}
                        className="text-green-600 hover:text-green-900 p-1 hover:bg-green-50 rounded transition-colors"
                        title="Editar"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleAbrirModalEliminar(usuario)}
                        className="text-red-600 hover:text-red-900 p-1 hover:bg-red-50 rounded transition-colors"
                        title="Eliminar"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {usuariosFiltrados.length === 0 && (
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No se encontraron usuarios
              </h3>
              <p className="text-gray-600">Intenta ajustar los filtros de búsqueda</p>
            </div>
          )}
        </div>
      </div>

      {/* ======================================================================== */}
      {/* MODAL VER DETALLES */}
      {/* ======================================================================== */}
      {modalVerUsuario && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Detalles del Usuario</h2>
                <button
                  onClick={() => setModalVerUsuario(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-4 pb-4 border-b">
                  <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xl">
                    {modalVerUsuario.nombre.charAt(0)}
                    {modalVerUsuario.apellido_paterno.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">
                      {modalVerUsuario.nombre} {modalVerUsuario.apellido_paterno}{" "}
                      {modalVerUsuario.apellido_materno}
                    </h3>
                    <p className="text-gray-600">ID: {modalVerUsuario.id_usuario}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Email</label>
                    <p className="text-gray-900">{modalVerUsuario.email}</p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-500">Teléfono</label>
                    <p className="text-gray-900">{modalVerUsuario.telefono || "No especificado"}</p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-500">Rol</label>
                    <p className="text-gray-900">{modalVerUsuario.rol || "Sin rol"}</p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-500">Tipo de Usuario</label>
                    <div className="mt-1">
                      <TipoUsuarioBadge tipo={modalVerUsuario.tipo_usuario} />
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-500">Estado</label>
                    <div className="mt-1">
                      <EstadoBadge estado={modalVerUsuario.estado} />
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-500">Fecha de Registro</label>
                    <p className="text-gray-900">
                      {new Date(modalVerUsuario.fecha_creacion).toLocaleDateString("es-CL", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex gap-3 justify-end">
                <button
                  onClick={() => setModalVerUsuario(null)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cerrar
                </button>
                <button
                  onClick={() => {
                    setModalVerUsuario(null);
                    handleEditarUsuario(modalVerUsuario);
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Editar Usuario
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================================== */}
      {/* MODAL CONFIRMAR ELIMINACIÓN */}
      {/* ======================================================================== */}
      {modalEliminar && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                  <AlertCircle className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Confirmar Eliminación</h2>
                  <p className="text-gray-600 text-sm">Esta acción no se puede deshacer</p>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg mb-6">
                <p className="text-sm text-gray-600 mb-2">¿Estás seguro de eliminar al usuario?</p>
                <p className="font-semibold text-gray-900">
                  {modalEliminar.nombre} {modalEliminar.apellido_paterno}{" "}
                  {modalEliminar.apellido_materno}
                </p>
                <p className="text-sm text-gray-600">{modalEliminar.email}</p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setModalEliminar(null)}
                  disabled={procesando}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleEliminarUsuario}
                  disabled={procesando}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {procesando ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Eliminando...
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4" />
                      Eliminar
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
