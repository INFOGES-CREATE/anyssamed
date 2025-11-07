// frontend/src/app/(dashboard)/admin/usuarios/[id]/logs/page.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  FileText,
  AlertCircle,
  CheckCircle,
  Info,
  AlertTriangle,
  Shield,
  Clock,
  Filter,
  Download,
  Search,
  Loader2,
} from "lucide-react";

interface Log {
  id_log: number;
  fecha_hora: string;
  accion: string;
  modulo: string;
  descripcion: string;
  ip_origen: string;
  user_agent: string;
  nivel_severidad: number;
  detalles_json: string;
}

export default function LogsUsuarioPage({
  params,
}: {
  params: { id: string };
}) {
  const [logs, setLogs] = useState<Log[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [filtros, setFiltros] = useState({
    busqueda: "",
    modulo: "",
    accion: "",
    nivel_severidad: "",
    fecha_desde: "",
    fecha_hasta: "",
  });

  const [paginacion, setPaginacion] = useState({
    page: 1,
    limit: 50,
    total: 0,
    total_pages: 0,
  });

  useEffect(() => {
    cargarLogs();
  }, [params.id, paginacion.page, filtros]);

  const cargarLogs = async () => {
    try {
      setLoading(true);
      const params_url = new URLSearchParams({
        page: paginacion.page.toString(),
        limit: paginacion.limit.toString(),
        ...(filtros.busqueda && { busqueda: filtros.busqueda }),
        ...(filtros.modulo && { modulo: filtros.modulo }),
        ...(filtros.accion && { accion: filtros.accion }),
        ...(filtros.nivel_severidad && {
          nivel_severidad: filtros.nivel_severidad,
        }),
        ...(filtros.fecha_desde && { fecha_desde: filtros.fecha_desde }),
        ...(filtros.fecha_hasta && { fecha_hasta: filtros.fecha_hasta }),
      });

      const response = await fetch(
        `/api/admin/usuarios/${params.id}/logs?${params_url}`
      );
      const data = await response.json();

      if (data.success) {
        setLogs(data.data.logs);
        setPaginacion((prev) => ({
          ...prev,
          total: data.data.paginacion.total,
          total_pages: data.data.paginacion.total_pages,
        }));
      } else {
        setError(data.error || "Error al cargar logs");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getNivelSeveridadBadge = (nivel: number) => {
    const badges = {
      1: {
        color: "bg-blue-100 text-blue-800 border-blue-200",
        icon: Info,
        texto: "Info",
      },
      2: {
        color: "bg-green-100 text-green-800 border-green-200",
        icon: CheckCircle,
        texto: "Éxito",
      },
      3: {
        color: "bg-yellow-100 text-yellow-800 border-yellow-200",
        icon: AlertTriangle,
        texto: "Advertencia",
      },
      4: {
        color: "bg-red-100 text-red-800 border-red-200",
        icon: AlertCircle,
        texto: "Error",
      },
      5: {
        color: "bg-purple-100 text-purple-800 border-purple-200",
        icon: Shield,
        texto: "Crítico",
      },
    };

    const badge = badges[nivel as keyof typeof badges] || badges[1];
    const Icon = badge.icon;

    return (
      <span
        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border ${badge.color}`}
      >
        <Icon className="w-3 h-3" />
        {badge.texto}
      </span>
    );
  };

  const exportarLogs = () => {
    const csv = [
      [
        "Fecha/Hora",
        "Módulo",
        "Acción",
        "Descripción",
        "IP",
        "Severidad",
      ].join(","),
      ...logs.map((log) =>
        [
          new Date(log.fecha_hora).toLocaleString("es-CL"),
          log.modulo,
          log.accion,
          `"${log.descripcion}"`,
          log.ip_origen,
          log.nivel_severidad,
        ].join(",")
      ),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `logs-usuario-${params.id}.csv`;
    link.click();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mx-auto mb-4" />
          <p className="text-slate-600">Cargando logs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href={`/admin/usuarios/${params.id}`}
              className="p-2 hover:bg-white rounded-lg transition-colors"
            >
              <ArrowLeft className="w-6 h-6 text-slate-600" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
                <FileText className="w-8 h-8 text-indigo-600" />
                Historial de Logs
              </h1>
              <p className="text-slate-600 mt-1">
                {paginacion.total} registros encontrados
              </p>
            </div>
          </div>

          <button
            onClick={exportarLogs}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <Download className="w-5 h-5" />
            Exportar CSV
          </button>
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {/* Búsqueda */}
            <div className="lg:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Buscar en logs..."
                  value={filtros.busqueda}
                  onChange={(e) =>
                    setFiltros({ ...filtros, busqueda: e.target.value })
                  }
                  className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            {/* Módulo */}
            <div>
              <select
                value={filtros.modulo}
                onChange={(e) =>
                  setFiltros({ ...filtros, modulo: e.target.value })
                }
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Todos los módulos</option>
                <option value="USUARIOS">Usuarios</option>
                <option value="CITAS">Citas</option>
                <option value="PACIENTES">Pacientes</option>
                <option value="FICHAS">Fichas</option>
                <option value="SEGURIDAD">Seguridad</option>
              </select>
            </div>

            {/* Acción */}
            <div>
              <select
                value={filtros.accion}
                onChange={(e) =>
                  setFiltros({ ...filtros, accion: e.target.value })
                }
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Todas las acciones</option>
                <option value="LOGIN">Login</option>
                <option value="LOGOUT">Logout</option>
                <option value="CREAR">Crear</option>
                <option value="ACTUALIZAR">Actualizar</option>
                <option value="ELIMINAR">Eliminar</option>
                <option value="VER">Ver</option>
              </select>
            </div>

            {/* Severidad */}
            <div>
              <select
                value={filtros.nivel_severidad}
                onChange={(e) =>
                  setFiltros({ ...filtros, nivel_severidad: e.target.value })
                }
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Todas las severidades</option>
                <option value="1">Info</option>
                <option value="2">Éxito</option>
                <option value="3">Advertencia</option>
                <option value="4">Error</option>
                <option value="5">Crítico</option>
              </select>
            </div>

            {/* Limpiar */}
            <div>
              <button
                onClick={() =>
                  setFiltros({
                    busqueda: "",
                    modulo: "",
                    accion: "",
                    nivel_severidad: "",
                    fecha_desde: "",
                    fecha_hasta: "",
                  })
                }
                className="w-full px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
              >
                Limpiar
              </button>
            </div>
          </div>

          {/* Filtros de Fecha */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Desde
              </label>
              <input
                type="date"
                value={filtros.fecha_desde}
                onChange={(e) =>
                  setFiltros({ ...filtros, fecha_desde: e.target.value })
                }
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Hasta
              </label>
              <input
                type="date"
                value={filtros.fecha_hasta}
                onChange={(e) =>
                  setFiltros({ ...filtros, fecha_hasta: e.target.value })
                }
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Tabla de Logs */}
        {error ? (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6">
            <div className="flex items-center gap-3 text-red-800">
              <AlertCircle className="w-6 h-6" />
              <p className="font-medium">{error}</p>
            </div>
          </div>
        ) : logs.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-12 text-center">
            <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-900 mb-2">
              No se encontraron logs
            </h3>
            <p className="text-slate-600">
              No hay registros que coincidan con los filtros aplicados
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase">
                      Fecha/Hora
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase">
                      Módulo
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase">
                      Acción
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase">
                      Descripción
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase">
                      IP Origen
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase">
                      Severidad
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {logs.map((log) => (
                    <tr
                      key={log.id_log}
                      className="hover:bg-slate-50 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2 text-sm text-slate-700">
                          <Clock className="w-4 h-4 text-slate-400" />
                          {new Date(log.fecha_hora).toLocaleString("es-CL")}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-block px-2 py-1 bg-indigo-100 text-indigo-800 text-xs rounded-full">
                          {log.modulo}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                          {log.accion}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-slate-700 max-w-md truncate">
                          {log.descripcion}
                        </p>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {log.ip_origen}
                      </td>
                      <td className="px-6 py-4">
                        {getNivelSeveridadBadge(log.nivel_severidad)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Paginación */}
            {paginacion.total_pages > 1 && (
              <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-between">
                <div className="text-sm text-slate-600">
                  Mostrando {(paginacion.page - 1) * paginacion.limit + 1} -{" "}
                  {Math.min(
                    paginacion.page * paginacion.limit,
                    paginacion.total
                  )}{" "}
                  de {paginacion.total} logs
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() =>
                      setPaginacion({
                        ...paginacion,
                        page: paginacion.page - 1,
                      })
                    }
                    disabled={paginacion.page === 1}
                    className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Anterior
                  </button>
                  <span className="px-4 py-2 text-slate-700">
                    Página {paginacion.page} de {paginacion.total_pages}
                  </span>
                  <button
                    onClick={() =>
                      setPaginacion({
                        ...paginacion,
                        page: paginacion.page + 1,
                      })
                    }
                    disabled={paginacion.page === paginacion.total_pages}
                    className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Siguiente
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
