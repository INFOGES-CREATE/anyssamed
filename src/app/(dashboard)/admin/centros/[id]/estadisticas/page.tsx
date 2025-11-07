// frontend/src/app/(dashboard)/admin/centros/[id]/estadisticas/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  BarChart3,
  TrendingUp,
  Users,
  Stethoscope,
  UserCheck,
  DollarSign,
  Calendar,
  RefreshCw,
} from "lucide-react";

interface Estadisticas {
  centro: {
    id_centro: number;
    nombre: string;
  };
  usuarios: {
    total: number;
    activos: number;
    bloqueados: number;
  };
  medicos: {
    total: number;
    activos: number;
    especialidades: number;
  };
  pacientes: {
    total: number;
    activos: number;
    nuevos_mes: number;
  };
  consultas_mes: Array<{
    mes: string;
    total: number;
  }>;
  ingresos_mes: Array<{
    mes: string;
    ingresos: number;
    facturas: number;
  }>;
  top_especialidades: Array<{
    nombre: string;
    consultas: number;
  }>;
}

export default function EstadisticasCentroPage() {
  const params = useParams();
  const [estadisticas, setEstadisticas] = useState<Estadisticas | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const cargarEstadisticas = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/centros/${params.id}/estadisticas`);
      const data = await response.json();

      if (data.success) {
        setEstadisticas(data.data);
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
    cargarEstadisticas();
  }, [params.id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error || !estadisticas) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
            <p className="font-medium">Error</p>
            <p className="text-sm">{error || "No se pudieron cargar las estadísticas"}</p>
          </div>
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
                <BarChart3 className="w-8 h-8 text-blue-600" />
                Estadísticas - {estadisticas.centro.nombre}
              </h1>
              <p className="text-gray-600 mt-2">Análisis detallado del centro médico</p>
            </div>

            <button
              onClick={cargarEstadisticas}
              className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Actualizar
            </button>
          </div>
        </div>

        {/* Resumen General */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6 rounded-lg shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <Users className="w-10 h-10 opacity-80" />
              <TrendingUp className="w-6 h-6 opacity-60" />
            </div>
            <h3 className="text-sm font-medium opacity-90 mb-1">Usuarios Totales</h3>
            <p className="text-4xl font-bold mb-2">{estadisticas.usuarios.total}</p>
            <div className="flex items-center gap-4 text-sm">
              <span className="opacity-90">✓ {estadisticas.usuarios.activos} activos</span>
              <span className="opacity-90">✗ {estadisticas.usuarios.bloqueados} bloqueados</span>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-6 rounded-lg shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <Stethoscope className="w-10 h-10 opacity-80" />
              <TrendingUp className="w-6 h-6 opacity-60" />
            </div>
            <h3 className="text-sm font-medium opacity-90 mb-1">Médicos</h3>
            <p className="text-4xl font-bold mb-2">{estadisticas.medicos.total}</p>
            <div className="flex items-center gap-4 text-sm">
              <span className="opacity-90">✓ {estadisticas.medicos.activos} activos</span>
              <span className="opacity-90">{estadisticas.medicos.especialidades} especialidades</span>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-6 rounded-lg shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <UserCheck className="w-10 h-10 opacity-80" />
              <TrendingUp className="w-6 h-6 opacity-60" />
            </div>
            <h3 className="text-sm font-medium opacity-90 mb-1">Pacientes</h3>
            <p className="text-4xl font-bold mb-2">{estadisticas.pacientes.total}</p>
            <div className="flex items-center gap-4 text-sm">
              <span className="opacity-90">✓ {estadisticas.pacientes.activos} activos</span>
              <span className="opacity-90">+{estadisticas.pacientes.nuevos_mes} este mes</span>
            </div>
          </div>

          <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white p-6 rounded-lg shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <Calendar className="w-10 h-10 opacity-80" />
              <TrendingUp className="w-6 h-6 opacity-60" />
            </div>
            <h3 className="text-sm font-medium opacity-90 mb-1">Consultas (Mes)</h3>
            <p className="text-4xl font-bold mb-2">
              {estadisticas.consultas_mes[0]?.total || 0}
            </p>
            <div className="text-sm opacity-90">
              Último mes registrado
            </div>
          </div>
        </div>

        {/* Gráficos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Consultas por Mes */}
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-600" />
              Consultas por Mes (Últimos 6 meses)
            </h2>

            <div className="space-y-3">
              {estadisticas.consultas_mes.map((item, index) => (
                <div key={index} className="flex items-center gap-4">
                  <div className="w-24 text-sm font-medium text-gray-700">
                    {new Date(item.mes + "-01").toLocaleDateString("es-CL", {
                      month: "short",
                      year: "numeric",
                    })}
                  </div>
                  <div className="flex-1">
                    <div className="bg-gray-200 rounded-full h-8 overflow-hidden">
                      <div
                        className="bg-blue-600 h-full flex items-center justify-end pr-3 text-white text-sm font-medium"
                        style={{
                          width: `${(item.total / Math.max(...estadisticas.consultas_mes.map((c) => c.total))) * 100}%`,
                        }}
                      >
                        {item.total}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Ingresos por Mes */}
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-green-600" />
              Ingresos por Mes (Últimos 6 meses)
            </h2>

            <div className="space-y-3">
              {estadisticas.ingresos_mes.map((item, index) => (
                <div key={index} className="flex items-center gap-4">
                  <div className="w-24 text-sm font-medium text-gray-700">
                    {new Date(item.mes + "-01").toLocaleDateString("es-CL", {
                      month: "short",
                      year: "numeric",
                    })}
                  </div>
                  <div className="flex-1">
                    <div className="bg-gray-200 rounded-full h-8 overflow-hidden">
                      <div
                        className="bg-green-600 h-full flex items-center justify-end pr-3 text-white text-sm font-medium"
                        style={{
                          width: `${(item.ingresos / Math.max(...estadisticas.ingresos_mes.map((i) => i.ingresos))) * 100}%`,
                        }}
                      >
                        ${item.ingresos.toLocaleString()}
                      </div>
                    </div>
                  </div>
                  <div className="w-20 text-sm text-gray-600">
                    {item.facturas} fact.
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Top Especialidades */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Stethoscope className="w-5 h-5 text-purple-600" />
            Top 5 Especialidades Más Consultadas
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {estadisticas.top_especialidades.map((item, index) => (
              <div
                key={index}
                className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-200"
              >
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600 mb-1">
                    #{index + 1}
                  </div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-2">
                    {item.nombre}
                  </h3>
                  <div className="text-2xl font-bold text-purple-700">
                    {item.consultas}
                  </div>
                  <div className="text-xs text-gray-600 mt-1">consultas</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
