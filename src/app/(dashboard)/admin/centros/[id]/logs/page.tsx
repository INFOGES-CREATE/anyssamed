// frontend/src/app/(dashboard)/admin/centros/[id]/logs/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  FileText,
  Search,
  Download,
  RefreshCw,
  User,
  Activity,
  AlertCircle,
  CheckCircle,
  Info,
  AlertTriangle,
  XCircle,
  Clock,
  ChevronLeft,
  ChevronRight,
  Eye,
  Shield,
} from "lucide-react";

interface Log {
  id_log: number;
  accion: string;
  tipo_accion: string;
  descripcion: string;
  usuario_nombre: string;
  usuario_email: string;
  ip_address: string;
  user_agent: string;
  fecha_creacion: string;
  datos_anteriores?: any;
  datos_nuevos?: any;
  modulo: string;
  nivel: string;
  exitoso: boolean;
  mensaje_error?: string;
  nivel_severidad: number;
}

interface LogsResponse {
  success: boolean;
  data: Log[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  error?: string;
}

export default function LogsCentroPage() {
  const params = useParams();
  const [logs, setLogs] = useState<Log[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busqueda, setBusqueda] = useState("");
  const [filtroTipo, setFiltroTipo] = useState("todos");
  const [filtroNivel, setFiltroNivel] = useState("todos");
  const [filtroFecha, setFiltroFecha] = useState("todos");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [logSeleccionado, setLogSeleccionado] = useState<Log | null>(null);
  const [mostrarDetalles, setMostrarDetalles] = useState(false);

  const cargarLogs = async () => {
    try {
      setLoading(true);
      setError(null);

      const url = `/api/admin/centros/${params.id}/logs?page=${page}&limit=50&tipo=${filtroTipo}&nivel=${filtroNivel}`;
      console.log("Cargando logs desde:", url);

      const response = await fetch(url);
      const data: LogsResponse = await response.json();

      console.log("Respuesta de logs:", data);

      if (data.success) {
        setLogs(data.data || []);
        
        // Validar que pagination existe
        if (data.pagination) {
          setTotalPages(data.pagination.totalPages || 1);
          setTotal(data.pagination.total || 0);
        } else {
          console.warn("No se recibió información de paginación");
          setTotalPages(1);
          setTotal(data.data?.length || 0);
        }
      } else {
        setError(data.error || "Error al cargar logs");
        setLogs([]);
        setTotalPages(1);
        setTotal(0);
      }
    } catch (err: any) {
      console.error("Error al cargar logs:", err);
      setError(err.message || "Error de conexión");
      setLogs([]);
      setTotalPages(1);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarLogs();
  }, [params.id, page, filtroTipo, filtroNivel]);

  // Filtrar logs por búsqueda y fecha
  const logsFiltrados = logs.filter((log) => {
    const matchBusqueda =
      busqueda === "" ||
      log.accion.toLowerCase().includes(busqueda.toLowerCase()) ||
      log.descripcion.toLowerCase().includes(busqueda.toLowerCase()) ||
      log.usuario_nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      log.usuario_email.toLowerCase().includes(busqueda.toLowerCase());

    const matchFecha = (() => {
      if (filtroFecha === "todos") return true;
      const logDate = new Date(log.fecha_creacion);
      const hoy = new Date();
      
      switch (filtroFecha) {
        case "hoy":
          return logDate.toDateString() === hoy.toDateString();
        case "ayer":
          const ayer = new Date(hoy);
          ayer.setDate(ayer.getDate() - 1);
          return logDate.toDateString() === ayer.toDateString();
        case "semana":
          const semanaAtras = new Date(hoy);
          semanaAtras.setDate(semanaAtras.getDate() - 7);
          return logDate >= semanaAtras;
        case "mes":
          const mesAtras = new Date(hoy);
          mesAtras.setMonth(mesAtras.getMonth() - 1);
          return logDate >= mesAtras;
        default:
          return true;
      }
    })();

    return matchBusqueda && matchFecha;
  });

  const NivelBadge = ({ nivel }: { nivel: string }) => {
    const estilos = {
      info: {
        bg: "bg-blue-100",
        text: "text-blue-800",
        border: "border-blue-200",
        icon: <Info className="w-3 h-3" />,
      },
      warning: {
        bg: "bg-yellow-100",
        text: "text-yellow-800",
        border: "border-yellow-200",
        icon: <AlertTriangle className="w-3 h-3" />,
      },
      error: {
        bg: "bg-red-100",
        text: "text-red-800",
        border: "border-red-200",
        icon: <XCircle className="w-3 h-3" />,
      },
      security: {
        bg: "bg-purple-100",
        text: "text-purple-800",
        border: "border-purple-200",
        icon: <Shield className="w-3 h-3" />,
      },
      audit: {
        bg: "bg-green-100",
        text: "text-green-800",
        border: "border-green-200",
        icon: <CheckCircle className="w-3 h-3" />,
      },
    };

    const config = estilos[nivel as keyof typeof estilos] || estilos.info;

    return (
      <span
        className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full border ${config.bg} ${config.text} ${config.border}`}
      >
        {config.icon}
        {nivel.charAt(0).toUpperCase() + nivel.slice(1)}
      </span>
    );
  };

  const TipoAccionBadge = ({ tipo }: { tipo: string }) => {
    const estilos = {
      crear: "bg-green-100 text-green-800 border-green-200",
      editar: "bg-blue-100 text-blue-800 border-blue-200",
      eliminar: "bg-red-100 text-red-800 border-red-200",
      activar: "bg-green-100 text-green-800 border-green-200",
      desactivar: "bg-gray-100 text-gray-800 border-gray-200",
      suspender: "bg-red-100 text-red-800 border-red-200",
      restaurar: "bg-blue-100 text-blue-800 border-blue-200",
      login: "bg-purple-100 text-purple-800 border-purple-200",
      logout: "bg-gray-100 text-gray-800 border-gray-200",
      otro: "bg-gray-100 text-gray-800 border-gray-200",
    };

    return (
      <span
        className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full border ${
          estilos[tipo as keyof typeof estilos] || estilos.otro
        }`}
      >
        {tipo.charAt(0).toUpperCase() + tipo.slice(1)}
      </span>
    );
  };

  const formatearFecha = (fecha: string) => {
    const date = new Date(fecha);
    const hoy = new Date();
    const ayer = new Date(hoy);
    ayer.setDate(ayer.getDate() - 1);

    if (date.toDateString() === hoy.toDateString()) {
      return `Hoy a las ${date.toLocaleTimeString("es-CL", {
        hour: "2-digit",
        minute: "2-digit",
      })}`;
    } else if (date.toDateString() === ayer.toDateString()) {
      return `Ayer a las ${date.toLocaleTimeString("es-CL", {
        hour: "2-digit",
        minute: "2-digit",
      })}`;
    } else {
      return date.toLocaleString("es-CL", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    }
  };

  const exportarLogs = () => {
    const csvContent = [
      ["Fecha", "Usuario", "Acción", "Tipo", "Nivel", "Descripción", "IP", "Exitoso"],
      ...logsFiltrados.map((log) => [
        new Date(log.fecha_creacion).toLocaleString("es-CL"),
        log.usuario_nombre,
        log.accion,
        log.tipo_accion,
        log.nivel,
        log.descripcion,
        log.ip_address,
        log.exitoso ? "Sí" : "No",
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `logs_centro_${params.id}_${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
  };

  const verDetalles = (log: Log) => {
    setLogSeleccionado(log);
    setMostrarDetalles(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Cargando historial de cambios...</p>
        </div>
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
                <FileText className="w-8 h-8 text-blue-600" />
                Historial de Cambios (Logs)
              </h1>
              <p className="text-gray-600 mt-2">
                {total} registros encontrados
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={cargarLogs}
                className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Actualizar
              </button>

              <button
                onClick={exportarLogs}
                disabled={logsFiltrados.length === 0}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Download className="w-4 h-4" />
                Exportar CSV
              </button>
            </div>
          </div>
        </div>

        {/* Estadísticas Rápidas */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Logs</p>
                <p className="text-2xl font-bold text-gray-900">{total}</p>
              </div>
              <FileText className="w-8 h-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Info</p>
                <p className="text-2xl font-bold text-blue-600">
                  {logs.filter((l) => l.nivel === "info").length}
                </p>
              </div>
              <Info className="w-8 h-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Audit</p>
                <p className="text-2xl font-bold text-green-600">
                  {logs.filter((l) => l.nivel === "audit").length}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Warnings</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {logs.filter((l) => l.nivel === "warning").length}
                </p>
              </div>
              <AlertTriangle className="w-8 h-8 text-yellow-600" />
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Errors</p>
                <p className="text-2xl font-bold text-red-600">
                  {logs.filter((l) => l.nivel === "error").length}
                </p>
              </div>
              <XCircle className="w-8 h-8 text-red-600" />
            </div>
          </div>
        </div>

        {/* Filtros */}
        <div className="bg-white p-4 rounded-lg border border-gray-200 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Búsqueda */}
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Buscar por acción, usuario o descripción..."
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Filtro Tipo */}
            <select
              value={filtroTipo}
              onChange={(e) => {
                setFiltroTipo(e.target.value);
                setPage(1);
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="todos">Todos los tipos</option>
              <option value="crear">Crear</option>
              <option value="editar">Editar</option>
              <option value="eliminar">Eliminar</option>
              <option value="activar">Activar</option>
              <option value="desactivar">Desactivar</option>
              <option value="suspender">Suspender</option>
              <option value="restaurar">Restaurar</option>
              <option value="login">Login</option>
              <option value="logout">Logout</option>
            </select>

            {/* Filtro Nivel */}
            <select
              value={filtroNivel}
              onChange={(e) => {
                setFiltroNivel(e.target.value);
                setPage(1);
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="todos">Todos los niveles</option>
              <option value="info">Info</option>
              <option value="audit">Audit</option>
              <option value="warning">Warning</option>
              <option value="error">Error</option>
              <option value="security">Security</option>
            </select>
          </div>

          {/* Filtro Fecha */}
          <div className="mt-4 flex gap-2">
            <button
              onClick={() => setFiltroFecha("todos")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filtroFecha === "todos"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Todos
            </button>
            <button
              onClick={() => setFiltroFecha("hoy")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filtroFecha === "hoy"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Hoy
            </button>
            <button
              onClick={() => setFiltroFecha("ayer")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filtroFecha === "ayer"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Ayer
            </button>
            <button
              onClick={() => setFiltroFecha("semana")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filtroFecha === "semana"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Última Semana
            </button>
            <button
              onClick={() => setFiltroFecha("mes")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filtroFecha === "mes"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Último Mes
            </button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg mb-6">
            <p className="font-medium">Error</p>
            <p className="text-sm">{error}</p>
          </div>
        )}

        {/* Timeline de Logs */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="p-6">
            {logsFiltrados.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No se encontraron logs
                </h3>
                <p className="text-gray-600">
                  {logs.length === 0
                    ? "No hay registros de actividad para este centro"
                    : "Intenta ajustar los filtros de búsqueda"}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {logsFiltrados.map((log) => (
                  <div
                    key={log.id_log}
                    className="relative pl-8 pb-8 border-l-2 border-gray-200 last:border-l-0 last:pb-0 hover:bg-gray-50 p-4 rounded-lg transition-colors group"
                  >
                    {/* Punto en la línea de tiempo */}
                    <div
                      className={`absolute left-0 top-6 -ml-2 w-4 h-4 rounded-full border-2 border-white ${
                        log.nivel === "error"
                          ? "bg-red-500"
                          : log.nivel === "warning"
                          ? "bg-yellow-500"
                          : log.nivel === "audit"
                          ? "bg-green-500"
                          : log.nivel === "security"
                          ? "bg-purple-500"
                          : "bg-blue-500"
                      }`}
                    ></div>

                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        {/* Header del Log */}
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {log.accion}
                          </h3>
                          <TipoAccionBadge tipo={log.tipo_accion} />
                          <NivelBadge nivel={log.nivel} />
                          {!log.exitoso && (
                            <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full border bg-red-100 text-red-800 border-red-200">
                              <XCircle className="w-3 h-3" />
                              Fallido
                            </span>
                          )}
                        </div>

                        {/* Descripción */}
                        <p className="text-gray-700 mb-3">{log.descripcion}</p>

                        {/* Mensaje de Error */}
                        {log.mensaje_error && (
                          <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-sm text-red-800">
                              <strong>Error:</strong> {log.mensaje_error}
                            </p>
                          </div>
                        )}

                        {/* Metadata */}
                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-gray-400" />
                            <span className="font-medium">{log.usuario_nombre}</span>
                            <span className="text-gray-400">({log.usuario_email})</span>
                          </div>

                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-gray-400" />
                            <span>{formatearFecha(log.fecha_creacion)}</span>
                          </div>

                          <div className="flex items-center gap-2">
                            <Activity className="w-4 h-4 text-gray-400" />
                            <span>IP: {log.ip_address}</span>
                          </div>

                          {log.modulo && (
                            <div className="flex items-center gap-2">
                              <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs font-medium">
                                {log.modulo}
                              </span>
                            </div>
                          )}

                          <div className="flex items-center gap-2">
                            <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                              Severidad: {log.nivel_severidad}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Botón Ver Detalles */}
                      <button
                        onClick={() => verDetalles(log)}
                        className="ml-4 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 flex items-center gap-2 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Eye className="w-4 h-4" />
                        Ver Detalles
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Paginación */}
        {totalPages > 1 && (
          <div className="mt-6 flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Mostrando {logsFiltrados.length} de {total} logs
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(page - 1)}
                disabled={page === 1}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <ChevronLeft className="w-4 h-4" />
                Anterior
              </button>
              <div className="flex items-center gap-2">
                <span className="px-4 py-2 bg-blue-600 text-white rounded-lg">
                  {page}
                </span>
                <span className="text-gray-600">de {totalPages}</span>
              </div>
              <button
                onClick={() => setPage(page + 1)}
                disabled={page === totalPages}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                Siguiente
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal de Detalles */}
      {mostrarDetalles && logSeleccionado && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div
            className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
            onClick={() => setMostrarDetalles(false)}
          ></div>

          <div className="flex min-h-full items-center justify-center p-4">
            <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-4xl transform transition-all">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h2 className="text-2xl font-bold text-gray-900">
                  Detalles del Log #{logSeleccionado.id_log}
                </h2>
                <button
                  onClick={() => setMostrarDetalles(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <XCircle className="w-5 h-5 text-gray-600" />
                </button>
              </div>

              {/* Body */}
              <div className="p-6 max-h-[calc(100vh-200px)] overflow-y-auto">
                <div className="space-y-6">
                  {/* Información General */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">
                      Información General
                    </h3>
                    <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
                      <div>
                        <label className="text-sm font-medium text-gray-600">Acción</label>
                        <p className="text-gray-900 font-semibold">
                          {logSeleccionado.accion}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">Tipo</label>
                        <div className="mt-1">
                          <TipoAccionBadge tipo={logSeleccionado.tipo_accion} />
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">Nivel</label>
                        <div className="mt-1">
                          <NivelBadge nivel={logSeleccionado.nivel} />
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">Módulo</label>
                        <p className="text-gray-900">{logSeleccionado.modulo}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">Estado</label>
                        <p className="text-gray-900">
                          {logSeleccionado.exitoso ? (
                            <span className="text-green-600 font-semibold">✓ Exitoso</span>
                          ) : (
                            <span className="text-red-600 font-semibold">✗ Fallido</span>
                          )}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">Severidad</label>
                        <p className="text-gray-900">{logSeleccionado.nivel_severidad}</p>
                      </div>
                      <div className="col-span-2">
                        <label className="text-sm font-medium text-gray-600">Descripción</label>
                        <p className="text-gray-900">{logSeleccionado.descripcion}</p>
                      </div>
                    </div>
                  </div>

                  {/* Usuario */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">
                      Usuario Responsable
                    </h3>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-center gap-4 mb-3">
                        <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-lg">
                          {logSeleccionado.usuario_nombre.charAt(0)}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">
                            {logSeleccionado.usuario_nombre}
                          </p>
                          <p className="text-sm text-gray-600">
                            {logSeleccionado.usuario_email}
                          </p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4 mt-4">
                        <div>
                          <label className="text-sm font-medium text-gray-600">
                            Dirección IP
                          </label>
                          <p className="text-gray-900">{logSeleccionado.ip_address}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-600">Fecha</label>
                          <p className="text-gray-900">
                            {formatearFecha(logSeleccionado.fecha_creacion)}
                          </p>
                        </div>
                      </div>
                      {logSeleccionado.user_agent && (
                        <div className="mt-4">
                          <label className="text-sm font-medium text-gray-600">
                            Navegador
                          </label>
                          <p className="text-gray-900 text-sm break-all">
                            {logSeleccionado.user_agent}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Mensaje de Error */}
                  {logSeleccionado.mensaje_error && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">
                        Mensaje de Error
                      </h3>
                      <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
                        <p className="text-red-800">{logSeleccionado.mensaje_error}</p>
                      </div>
                    </div>
                  )}

                  {/* Datos Anteriores */}
                  {logSeleccionado.datos_anteriores && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">
                        Datos Anteriores
                      </h3>
                      <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-sm">
                        {JSON.stringify(logSeleccionado.datos_anteriores, null, 2)}
                      </pre>
                    </div>
                  )}

                  {/* Datos Nuevos */}
                  {logSeleccionado.datos_nuevos && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">
                        Datos Nuevos
                      </h3>
                      <pre className="bg-gray-900 text-blue-400 p-4 rounded-lg overflow-x-auto text-sm">
                        {JSON.stringify(logSeleccionado.datos_nuevos, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
                <button
                  onClick={() => setMostrarDetalles(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
