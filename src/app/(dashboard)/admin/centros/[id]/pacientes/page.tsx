// frontend/src/app/(dashboard)/admin/centros/[id]/pacientes/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  UserCheck,
  Search,
  Download,
  RefreshCw,
  Mail,
  Phone,
  Calendar,
  CheckCircle,
  XCircle,
  Eye,
  FileText,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

interface Paciente {
  id_paciente: number;
  nombre: string;
  apellido_paterno: string;
  apellido_materno: string;
  rut: string;
  email: string;
  telefono: string;
  fecha_nacimiento: string;
  estado: string;
  fecha_registro: string;
  total_consultas: number;
  ultima_consulta: string;
}

export default function PacientesCentroPage() {
  const params = useParams();
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busqueda, setBusqueda] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("todos");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const cargarPacientes = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/admin/centros/${params.id}/pacientes?page=${page}&limit=20`
      );
      const data = await response.json();

      if (data.success) {
        setPacientes(data.data);
        setTotalPages(data.pagination.totalPages);
        setTotal(data.pagination.total);
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
    cargarPacientes();
  }, [params.id, page]);

  const pacientesFiltrados = pacientes.filter((paciente) => {
    const matchBusqueda =
      busqueda === "" ||
      paciente.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      paciente.apellido_paterno.toLowerCase().includes(busqueda.toLowerCase()) ||
      paciente.rut.toLowerCase().includes(busqueda.toLowerCase()) ||
      paciente.email.toLowerCase().includes(busqueda.toLowerCase());

    const matchEstado = filtroEstado === "todos" || paciente.estado === filtroEstado;

    return matchBusqueda && matchEstado;
  });

  const calcularEdad = (fechaNacimiento: string) => {
    const hoy = new Date();
    const nacimiento = new Date(fechaNacimiento);
    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const mes = hoy.getMonth() - nacimiento.getMonth();
    if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
      edad--;
    }
    return edad;
  };

  const EstadoBadge = ({ estado }: { estado: string }) => {
    const estilos = {
      activo: "bg-green-100 text-green-800 border-green-200",
      inactivo: "bg-gray-100 text-gray-800 border-gray-200",
    };

    const iconos = {
      activo: <CheckCircle className="w-3 h-3" />,
      inactivo: <XCircle className="w-3 h-3" />,
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
                <UserCheck className="w-8 h-8 text-purple-600" />
                Pacientes del Centro
              </h1>
              <p className="text-gray-600 mt-2">
                {total} pacientes registrados
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={cargarPacientes}
                className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Actualizar
              </button>

              <button className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2">
                <Download className="w-4 h-4" />
                Exportar
              </button>
            </div>
          </div>
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Pacientes</p>
                <p className="text-2xl font-bold text-gray-900">{total}</p>
              </div>
              <UserCheck className="w-8 h-8 text-purple-600" />
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Activos</p>
                <p className="text-2xl font-bold text-green-600">
                  {pacientes.filter((p) => p.estado === "activo").length}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Consultas Totales</p>
                <p className="text-2xl font-bold text-blue-600">
                  {pacientes.reduce((sum, p) => sum + p.total_consultas, 0)}
                </p>
              </div>
              <FileText className="w-8 h-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Nuevos Este Mes</p>
                <p className="text-2xl font-bold text-orange-600">
                  {
                    pacientes.filter((p) => {
                      const registro = new Date(p.fecha_registro);
                      const hoy = new Date();
                      return (
                        registro.getMonth() === hoy.getMonth() &&
                        registro.getFullYear() === hoy.getFullYear()
                      );
                    }).length
                  }
                </p>
              </div>
              <Calendar className="w-8 h-8 text-orange-600" />
            </div>
          </div>
        </div>

        {/* Filtros */}
        <div className="bg-white p-4 rounded-lg border border-gray-200 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Buscar por nombre, RUT o email..."
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <select
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="todos">Todos los estados</option>
              <option value="activo">Activos</option>
              <option value="inactivo">Inactivos</option>
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

        {/* Tabla de Pacientes */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Paciente
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  RUT
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contacto
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Edad
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Consultas
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Última Consulta
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {pacientesFiltrados.map((paciente) => (
                <tr key={paciente.id_paciente} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-semibold">
                        {paciente.nombre.charAt(0)}
                        {paciente.apellido_paterno.charAt(0)}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {paciente.nombre} {paciente.apellido_paterno}{" "}
                          {paciente.apellido_materno}
                        </div>
                        <div className="text-sm text-gray-500">ID: {paciente.id_paciente}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {paciente.rut}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 flex items-center gap-2">
                      <Mail className="w-4 h-4 text-gray-400" />
                      {paciente.email}
                    </div>
                    {paciente.telefono && (
                      <div className="text-sm text-gray-500 flex items-center gap-2 mt-1">
                        <Phone className="w-4 h-4 text-gray-400" />
                        {paciente.telefono}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {calcularEdad(paciente.fecha_nacimiento)} años
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <EstadoBadge estado={paciente.estado} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <span className="font-semibold text-blue-600">
                      {paciente.total_consultas}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {paciente.ultima_consulta
                      ? new Date(paciente.ultima_consulta).toLocaleDateString("es-CL")
                      : "Sin consultas"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        className="text-blue-600 hover:text-blue-900"
                        title="Ver ficha"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        className="text-green-600 hover:text-green-900"
                        title="Ver historial"
                      >
                        <FileText className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {pacientesFiltrados.length === 0 && (
            <div className="text-center py-12">
              <UserCheck className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No se encontraron pacientes
              </h3>
              <p className="text-gray-600">Intenta ajustar los filtros de búsqueda</p>
            </div>
          )}
        </div>

        {/* Paginación */}
        {totalPages > 1 && (
          <div className="mt-6 flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Mostrando {pacientesFiltrados.length} de {total} pacientes
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
    </div>
  );
}
