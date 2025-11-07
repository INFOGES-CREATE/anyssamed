// frontend/src/app/(dashboard)/admin/centros/components/CentroStats.tsx
"use client";

import {
  Building2,
  CheckCircle,
  AlertCircle,
  Ban,
  TrendingUp,
  Users,
  Activity,
} from "lucide-react";

interface CentroStatsProps {
  estadisticas: {
    total_centros: number;
    centros_activos: number;
    centros_inactivos: number;
    centros_suspendidos: number;
    capacidad_promedio: number;
    capacidad_total: number;
    usuarios_totales?: number;
    consultas_mes?: number;
  };
}

export default function CentroStats({ estadisticas }: CentroStatsProps) {
  const stats = [
    {
      label: "Total Centros",
      value: estadisticas.total_centros,
      icon: Building2,
      color: "blue",
      bgColor: "bg-blue-500",
      lightBg: "bg-blue-50",
      textColor: "text-blue-600",
    },
    {
      label: "Centros Activos",
      value: estadisticas.centros_activos,
      icon: CheckCircle,
      color: "green",
      bgColor: "bg-green-500",
      lightBg: "bg-green-50",
      textColor: "text-green-600",
      percentage: ((estadisticas.centros_activos / estadisticas.total_centros) * 100).toFixed(1),
    },
    {
      label: "Centros Inactivos",
      value: estadisticas.centros_inactivos,
      icon: AlertCircle,
      color: "gray",
      bgColor: "bg-gray-500",
      lightBg: "bg-gray-50",
      textColor: "text-gray-600",
      percentage: ((estadisticas.centros_inactivos / estadisticas.total_centros) * 100).toFixed(1),
    },
    {
      label: "Centros Suspendidos",
      value: estadisticas.centros_suspendidos,
      icon: Ban,
      color: "red",
      bgColor: "bg-red-500",
      lightBg: "bg-red-50",
      textColor: "text-red-600",
      percentage: ((estadisticas.centros_suspendidos / estadisticas.total_centros) * 100).toFixed(1),
    },
    {
      label: "Capacidad Total",
      value: estadisticas.capacidad_total,
      icon: TrendingUp,
      color: "purple",
      bgColor: "bg-purple-500",
      lightBg: "bg-purple-50",
      textColor: "text-purple-600",
      suffix: "pac/día",
    },
    {
      label: "Capacidad Promedio",
      value: Math.round(estadisticas.capacidad_promedio),
      icon: Activity,
      color: "orange",
      bgColor: "bg-orange-500",
      lightBg: "bg-orange-50",
      textColor: "text-orange-600",
      suffix: "pac/día",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      {stats.map((stat, index) => (
        <div
          key={index}
          className={`${stat.lightBg} p-6 rounded-xl border border-${stat.color}-200 hover:shadow-lg transition-all duration-300 group`}
        >
          <div className="flex items-center justify-between mb-4">
            <div
              className={`w-12 h-12 ${stat.bgColor} rounded-lg flex items-center justify-center text-white group-hover:scale-110 transition-transform`}
            >
              <stat.icon className="w-6 h-6" />
            </div>
            {stat.percentage && (
              <span className={`text-xs font-semibold ${stat.textColor} bg-white px-2 py-1 rounded-full`}>
                {stat.percentage}%
              </span>
            )}
          </div>

          <div>
            <p className="text-sm font-medium text-gray-600 mb-1">{stat.label}</p>
            <div className="flex items-baseline gap-2">
              <p className={`text-3xl font-bold ${stat.textColor}`}>
                {stat.value.toLocaleString()}
              </p>
              {stat.suffix && (
                <span className="text-sm text-gray-500">{stat.suffix}</span>
              )}
            </div>
          </div>

          {/* Barra de progreso para porcentajes */}
          {stat.percentage && (
            <div className="mt-3">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`${stat.bgColor} h-2 rounded-full transition-all duration-500`}
                  style={{ width: `${stat.percentage}%` }}
                ></div>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
