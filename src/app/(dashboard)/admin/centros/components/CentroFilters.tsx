// frontend/src/app/(dashboard)/admin/centros/components/CentroFilters.tsx
"use client";

import { Search, Filter, X } from "lucide-react";
import { useState } from "react";

interface CentroFiltersProps {
  busqueda: string;
  onBusquedaChange: (value: string) => void;
  estadoFiltro: string;
  onEstadoChange: (value: string) => void;
  regionFiltro?: string;
  onRegionChange?: (value: string) => void;
  planFiltro?: string;
  onPlanChange?: (value: string) => void;
  onLimpiar?: () => void;
}

export default function CentroFilters({
  busqueda,
  onBusquedaChange,
  estadoFiltro,
  onEstadoChange,
  regionFiltro,
  onRegionChange,
  planFiltro,
  onPlanChange,
  onLimpiar,
}: CentroFiltersProps) {
  const [mostrarFiltrosAvanzados, setMostrarFiltrosAvanzados] = useState(false);

  const regiones = [
    "Región Metropolitana",
    "Región de Valparaíso",
    "Región del Biobío",
    "Región de La Araucanía",
    "Región de Los Lagos",
    "Región de Arica y Parinacota",
    "Región de Tarapacá",
    "Región de Antofagasta",
    "Región de Atacama",
    "Región de Coquimbo",
    "Región de O'Higgins",
    "Región del Maule",
    "Región de Ñuble",
    "Región de Los Ríos",
    "Región de Aysén",
    "Región de Magallanes",
  ];

  return (
    <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
      {/* Filtros Principales */}
      <div className="flex flex-col md:flex-row gap-4">
        {/* Búsqueda */}
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar por nombre, RUT, ciudad, región..."
              value={busqueda}
              onChange={(e) => onBusquedaChange(e.target.value)}
              className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
            {busqueda && (
              <button
                onClick={() => onBusquedaChange("")}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Filtro por Estado */}
        <select
          value={estadoFiltro}
          onChange={(e) => onEstadoChange(e.target.value)}
          className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
        >
          <option value="todos">📊 Todos los estados</option>
          <option value="activo">✅ Activos</option>
          <option value="inactivo">⏸️ Inactivos</option>
          <option value="suspendido">🚫 Suspendidos</option>
        </select>

        {/* Botón Filtros Avanzados */}
        <button
          onClick={() => setMostrarFiltrosAvanzados(!mostrarFiltrosAvanzados)}
          className={`px-4 py-2.5 border rounded-lg flex items-center gap-2 transition-all ${
            mostrarFiltrosAvanzados
              ? "bg-blue-50 border-blue-300 text-blue-700"
              : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
          }`}
        >
          <Filter className="w-4 h-4" />
          Filtros Avanzados
        </button>

        {/* Botón Limpiar */}
        {onLimpiar && (
          <button
            onClick={onLimpiar}
            className="px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 flex items-center gap-2 transition-all"
          >
            <X className="w-4 h-4" />
            Limpiar
          </button>
        )}
      </div>

      {/* Filtros Avanzados */}
      {mostrarFiltrosAvanzados && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Filtro por Región */}
            {onRegionChange && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Región
                </label>
                <select
                  value={regionFiltro || ""}
                  onChange={(e) => onRegionChange(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="">Todas las regiones</option>
                  {regiones.map((region) => (
                    <option key={region} value={region}>
                      {region}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Filtro por Plan */}
            {onPlanChange && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Plan
                </label>
                <select
                  value={planFiltro || ""}
                  onChange={(e) => onPlanChange(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="">Todos los planes</option>
                  <option value="basico">💙 Básico</option>
                  <option value="profesional">💜 Profesional</option>
                  <option value="premium">⭐ Premium</option>
                  <option value="enterprise">🔶 Enterprise</option>
                </select>
              </div>
            )}

            {/* Filtro por Capacidad */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Capacidad
              </label>
              <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white">
                <option value="">Todas las capacidades</option>
                <option value="0-50">0 - 50 pacientes/día</option>
                <option value="51-100">51 - 100 pacientes/día</option>
                <option value="101-200">101 - 200 pacientes/día</option>
                <option value="200+">Más de 200 pacientes/día</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Indicadores de Filtros Activos */}
      {(busqueda || estadoFiltro !== "todos" || regionFiltro || planFiltro) && (
        <div className="mt-4 flex flex-wrap gap-2">
          <span className="text-sm text-gray-600 font-medium">Filtros activos:</span>
          {busqueda && (
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
              Búsqueda: "{busqueda}"
              <button onClick={() => onBusquedaChange("")}>
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {estadoFiltro !== "todos" && (
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
              Estado: {estadoFiltro}
              <button onClick={() => onEstadoChange("todos")}>
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {regionFiltro && onRegionChange && (
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">
              Región: {regionFiltro}
              <button onClick={() => onRegionChange("")}>
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {planFiltro && onPlanChange && (
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm">
              Plan: {planFiltro}
              <button onClick={() => onPlanChange("")}>
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
        </div>
      )}
    </div>
  );
}
