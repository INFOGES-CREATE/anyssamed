// frontend/src/app/(dashboard)/admin/centros/[id]/medicos/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Stethoscope,
  Search,
  Download,
  RefreshCw,
  Mail,
  Award,
  CheckCircle,
  XCircle,
  TrendingUp,
  Calendar,
  Eye,
  Edit,
} from "lucide-react";

interface Medico {
  id_medico: number;
  nombre_completo: string;
  email: string;
  numero_colegiatura: string;
  estado: string;
  especialidad_principal: string;
  total_consultas: number;
  consultas_mes: number;
}

export default function MedicosCentroPage() {
  const params = useParams();
  const [medicos, setMedicos] = useState<Medico[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busqueda, setBusqueda] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("todos");

  const cargarMedicos = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/centros/${params.id}/medicos`);
      const data = await response.json();

      if (data.success) {
        setMedicos(data.data);
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
    cargarMedicos();
  }, [params.id]);

  const medicosFiltrados = medicos.filter((medico) => {
    const matchBusqueda =
      busqueda === "" ||
      medico.nombre_completo.toLowerCase().includes(busqueda.toLowerCase()) ||
      medico.numero_colegiatura.toLowerCase().includes(busqueda.toLowerCase()) ||
      (medico.especialidad_principal &&
        medico.especialidad_principal.toLowerCase().includes(busqueda.toLowerCase()));

    const matchEstado = filtroEstado === "todos" || medico.estado === filtroEstado;

    return matchBusqueda && matchEstado;
  });

  const EstadoBadge = ({ estado }: { estado: string }) => {
    const estilos = {
      activo: "bg-green-100 text-green-800 border-green-200",
      inactivo: "bg-gray-100 text-gray-800 border-gray-200",
      suspendido: "bg-red-100 text-red-800 border-red-200",
    };

    const iconos = {
      activo: <CheckCircle className="w-3 h-3" />,
      inactivo: <XCircle className="w-3 h-3" />,
      suspendido: <XCircle className="w-3 h-3" />,
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
                <Stethoscope className="w-8 h-8 text-green-600" />
                Médicos del Centro
              </h1>
              <p className="text-gray-600 mt-2">
                {medicosFiltrados.length} médicos encontrados
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={cargarMedicos}
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
                <p className="text-sm text-gray-600">Total Médicos</p>
                <p className="text-2xl font-bold text-gray-900">{medicos.length}</p>
              </div>
              <Stethoscope className="w-8 h-8 text-green-600" />
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Activos</p>
                <p className="text-2xl font-bold text-green-600">
                  {medicos.filter((m) => m.estado === "activo").length}
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
                  {medicos.reduce((sum, m) => sum + m.total_consultas, 0)}
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Consultas Este Mes</p>
                <p className="text-2xl font-bold text-purple-600">
                  {medicos.reduce((sum, m) => sum + m.consultas_mes, 0)}
                </p>
              </div>
              <Calendar className="w-8 h-8 text-purple-600" />
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
                  placeholder="Buscar por nombre, colegiatura o especialidad..."
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
              <option value="suspendido">Suspendidos</option>
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

        {/* Grid de Médicos */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {medicosFiltrados.map((medico) => (
            <div
              key={medico.id_medico}
              className="bg-white rounded-lg border border-gray-200 hover:shadow-lg transition-shadow"
            >
              <div className="p-6">
                {/* Avatar y Estado */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-green-600 font-bold text-lg">
                      {medico.nombre_completo.split(" ")[0].charAt(0)}
                      {medico.nombre_completo.split(" ")[1]?.charAt(0) || ""}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">{medico.nombre_completo}</h3>
                      <p className="text-sm text-gray-600">ID: {medico.id_medico}</p>
                    </div>
                  </div>
                  <EstadoBadge estado={medico.estado} />
                </div>

                {/* Información */}
                <div className="space-y-3 mb-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Award className="w-4 h-4" />
                    <span className="font-medium">Colegiatura:</span>
                    <span>{medico.numero_colegiatura}</span>
                  </div>

                  {medico.especialidad_principal && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Stethoscope className="w-4 h-4" />
                      <span className="font-medium">Especialidad:</span>
                      <span>{medico.especialidad_principal}</span>
                    </div>
                  )}

                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Mail className="w-4 h-4" />
                    <span className="truncate">{medico.email}</span>
                  </div>
                </div>

                {/* Estadísticas */}
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <p className="text-2xl font-bold text-blue-600">
                        {medico.total_consultas}
                      </p>
                      <p className="text-xs text-gray-600">Consultas Totales</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-green-600">
                        {medico.consultas_mes}
                      </p>
                      <p className="text-xs text-gray-600">Este Mes</p>
                    </div>
                  </div>
                </div>

                {/* Acciones */}
                <div className="flex gap-2">
                  <button className="flex-1 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 flex items-center justify-center gap-2 text-sm">
                    <Eye className="w-4 h-4" />
                    Ver Perfil
                  </button>
                  <button className="flex-1 px-4 py-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 flex items-center justify-center gap-2 text-sm">
                    <Edit className="w-4 h-4" />
                    Editar
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Sin resultados */}
        {medicosFiltrados.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
            <Stethoscope className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No se encontraron médicos
            </h3>
            <p className="text-gray-600">Intenta ajustar los filtros de búsqueda</p>
          </div>
        )}
      </div>
    </div>
  );
}
