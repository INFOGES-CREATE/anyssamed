// src/app/(dashboard)/admin/respondedores-comunitarios/page.tsx
"use client";

import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Users, UserPlus, MapPin, Phone, Mail, Navigation, Clock, AlertCircle,
  Activity, Search, Filter, Download, RefreshCw, Bell, Radio, Route,
  Target, Zap, MessageCircle, Calendar, Shield, Star, TrendingUp,
  Eye, Edit, Trash2, Plus, X, Check, AlertTriangle, Info, Settings,
  Map as MapIcon, List, Grid, BarChart3, ChevronDown, ChevronUp,
  Maximize2, Minimize2, Send, PhoneCall, MessageSquare, Navigation2
} from "lucide-react";
import dynamic from 'next/dynamic';

// Importar mapa dinámicamente (solo en cliente)
const MapaRespondedores = dynamic(
  () => import('./components/MapaRespondedores'),
  { ssr: false }
);

/* ==================== TIPOS ==================== */

type EstadoRespondedor = "DISPONIBLE" | "EN_RUTA" | "EN_SITIO" | "OCUPADO" | "FUERA_DE_SERVICIO";
type TipoRespondedor = "FUNCIONARIO" | "VOLUNTARIO" | "PARAMEDICO" | "ENFERMERO" | "MEDICO" | "VEHICULO" | "OTRO";
type NivelExperiencia = "BASICO" | "INTERMEDIO" | "AVANZADO" | "EXPERTO";

type Respondedor = {
  id_respondedor: number;
  nombres: string;
  apellido_paterno: string;
  apellido_materno?: string;
  nombre_completo?: string;
  rut?: string;
  celular_personal?: string;
  email_personal?: string;
  direccion_personal?: string;
  localidad?: string;
  comuna?: string;
  organizacion_pertenece?: string;
  tipo_respondedor: TipoRespondedor;
  rol_respondedor?: string;
  especialidad?: string;
  nivel_experiencia?: NivelExperiencia;
  estado: EstadoRespondedor;
  disponible: boolean;
  latitud?: number;
  longitud?: number;
  centro_nombre?: string;
  emergencia_nombre?: string;
  emergencias_activas?: number;
  total_emergencias?: number;
  tiempo_promedio_respuesta?: number;
  evaluacion_promedio?: number;
  fecha_asignacion?: string;
  ultima_ubicacion?: string;
  ultima_actualizacion?: string;
};

type Estadisticas = {
  total_respondedores: number;
  disponibles: number;
  en_servicio: number;
  fuera_servicio: number;
  tiempo_promedio_respuesta: number;
  evaluacion_promedio: number;
  emergencias_activas: number;
  cobertura_km2?: number;
};

type Emergencia = {
  id: number;
  nombre: string;
  direccion: string;
  latitud: number;
  longitud: number;
  severidad: "BAJA" | "MEDIA" | "ALTA" | "CRITICA";
  estado: "ABIERTA" | "EN_PROCESO" | "CERRADA";
  respondedores_asignados?: number;
  tiempo_transcurrido?: number;
};

type ViewMode = "map" | "table" | "split";

/* ==================== COMPONENTE PRINCIPAL ==================== */

export default function RespondedoresComunitariosPage() {
  const router = useRouter();

  // Estados principales
  const [loading, setLoading] = useState(true);
  const [respondedores, setRespondedores] = useState<Respondedor[]>([]);
  const [respondedoresFiltrados, setRespondedoresFiltrados] = useState<Respondedor[]>([]);
  const [stats, setStats] = useState<Estadisticas>({
    total_respondedores: 0,
    disponibles: 0,
    en_servicio: 0,
    fuera_servicio: 0,
    tiempo_promedio_respuesta: 0,
    evaluacion_promedio: 0,
    emergencias_activas: 0,
  });
  const [emergencias, setEmergencias] = useState<Emergencia[]>([]);

  // Estados de UI
  const [viewMode, setViewMode] = useState<ViewMode>("map");
  const [mapaMaximizado, setMapaMaximizado] = useState(false);
  const [panelDespachoAbierto, setPanelDespachoAbierto] = useState(true);
  const [respondedorSeleccionado, setRespondedorSeleccionado] = useState<Respondedor | null>(null);
  const [emergenciaSeleccionada, setEmergenciaSeleccionada] = useState<Emergencia | null>(null);

  // Filtros
  const [filtros, setFiltros] = useState({
    busqueda: "",
    tipo: "",
    estado: "",
    especialidad: "",
    disponibilidad: "",
    centro: "",
    experiencia: "",
  });

  // Estados de modales
  const [mostrarFiltrosAvanzados, setMostrarFiltrosAvanzados] = useState(false);
  const [mostrarPanelComunicacion, setMostrarPanelComunicacion] = useState(false);
  const [mostrarDetalleRespondedor, setMostrarDetalleRespondedor] = useState(false);

  /* ==================== EFECTOS ==================== */

  useEffect(() => {
    cargarDatos();
  }, []);

  useEffect(() => {
    aplicarFiltros();
  }, [filtros, respondedores]);

  // Auto-refresh cada 30 segundos
  useEffect(() => {
    const interval = setInterval(() => {
      cargarDatos(false);
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  /* ==================== FUNCIONES ==================== */

  const cargarDatos = async (mostrarLoading = true) => {
    if (mostrarLoading) setLoading(true);
    try {
      // Aquí iría la llamada a tu API
      // const res = await fetch('/api/respondedores/listar');
      // const data = await res.json();

      // Datos de ejemplo - reemplazar con tu API
      const datosEjemplo: Respondedor[] = [
        {
          id_respondedor: 1,
          nombres: "Juan Carlos",
          apellido_paterno: "Pérez",
          apellido_materno: "González",
          nombre_completo: "Juan Carlos Pérez González",
          rut: "12.345.678-9",
          celular_personal: "+56912345678",
          email_personal: "juan.perez@email.com",
          direccion_personal: "Calle Principal 123",
          localidad: "Centro",
          comuna: "Curicó",
          tipo_respondedor: "PARAMEDICO",
          rol_respondedor: "COORDINADOR",
          especialidad: "Emergencias Médicas",
          nivel_experiencia: "EXPERTO",
          estado: "DISPONIBLE",
          disponible: true,
          latitud: -34.9806453,
          longitud: -71.2335392,
          centro_nombre: "Centro de Salud Central",
          emergencias_activas: 0,
          total_emergencias: 45,
          tiempo_promedio_respuesta: 8,
          evaluacion_promedio: 4.8,
        },
        {
          id_respondedor: 2,
          nombres: "María Elena",
          apellido_paterno: "Silva",
          nombre_completo: "María Elena Silva",
          celular_personal: "+56987654321",
          tipo_respondedor: "ENFERMERO",
          estado: "EN_SERVICIO",
          disponible: false,
          latitud: -34.9906453,
          longitud: -71.2435392,
          nivel_experiencia: "AVANZADO",
          evaluacion_promedio: 4.5,
        },
        {
          id_respondedor: 3,
          nombres: "Pedro",
          apellido_paterno: "Ramírez",
          nombre_completo: "Pedro Ramírez",
          tipo_respondedor: "VOLUNTARIO",
          estado: "DISPONIBLE",
          disponible: true,
          latitud: -34.9706453,
          longitud: -71.2235392,
          nivel_experiencia: "INTERMEDIO",
        },
      ];

      setRespondedores(datosEjemplo);

      // Calcular estadísticas
      const statsCalculadas: Estadisticas = {
        total_respondedores: datosEjemplo.length,
        disponibles: datosEjemplo.filter(r => r.disponible).length,
        en_servicio: datosEjemplo.filter(r => r.estado === "EN_SITIO" || r.estado === "EN_RUTA").length,
        fuera_servicio: datosEjemplo.filter(r => r.estado === "FUERA_DE_SERVICIO").length,
        tiempo_promedio_respuesta: 8.5,
        evaluacion_promedio: 4.6,
        emergencias_activas: 3,
      };
      setStats(statsCalculadas);

      // Emergencias de ejemplo
      setEmergencias([
        {
          id: 1,
          nombre: "Accidente de tránsito",
          direccion: "Av. Manso de Velasco 1234",
          latitud: -34.9856453,
          longitud: -71.2385392,
          severidad: "ALTA",
          estado: "ABIERTA",
          respondedores_asignados: 0,
        },
      ]);

    } catch (error) {
      console.error("Error al cargar datos:", error);
    } finally {
      if (mostrarLoading) setLoading(false);
    }
  };

  const aplicarFiltros = () => {
    let filtrados = [...respondedores];

    if (filtros.busqueda) {
      const busq = filtros.busqueda.toLowerCase();
      filtrados = filtrados.filter(r =>
        r.nombre_completo?.toLowerCase().includes(busq) ||
        r.nombres?.toLowerCase().includes(busq) ||
        r.rut?.includes(busq) ||
        r.celular_personal?.includes(busq)
      );
    }

    if (filtros.tipo) {
      filtrados = filtrados.filter(r => r.tipo_respondedor === filtros.tipo);
    }

    if (filtros.estado) {
      filtrados = filtrados.filter(r => r.estado === filtros.estado);
    }

    if (filtros.disponibilidad === "disponible") {
      filtrados = filtrados.filter(r => r.disponible === true);
    } else if (filtros.disponibilidad === "ocupado") {
      filtrados = filtrados.filter(r => r.disponible === false);
    }

    if (filtros.especialidad) {
      filtrados = filtrados.filter(r => r.especialidad?.toLowerCase().includes(filtros.especialidad.toLowerCase()));
    }

    if (filtros.experiencia) {
      filtrados = filtrados.filter(r => r.nivel_experiencia === filtros.experiencia);
    }

    setRespondedoresFiltrados(filtrados);
  };

  const limpiarFiltros = () => {
    setFiltros({
      busqueda: "",
      tipo: "",
      estado: "",
      especialidad: "",
      disponibilidad: "",
      centro: "",
      experiencia: "",
    });
  };

  const encontrarMasCercano = (emergencia: Emergencia) => {
    const disponibles = respondedores.filter(r => r.disponible && r.latitud && r.longitud);

    if (disponibles.length === 0) {
      alert("No hay respondedores disponibles");
      return null;
    }

    // Calcular distancias (fórmula simplificada)
    const conDistancias = disponibles.map(r => {
      const dx = (r.latitud! - emergencia.latitud) * 111; // km aprox
      const dy = (r.longitud! - emergencia.longitud) * 111 * Math.cos(emergencia.latitud * Math.PI / 180);
      const distancia = Math.sqrt(dx * dx + dy * dy);
      return { ...r, distancia };
    });

    // Ordenar por distancia
    conDistancias.sort((a, b) => a.distancia - b.distancia);

    return conDistancias[0];
  };

  const despacharRespondedor = (respondedor: Respondedor, emergencia: Emergencia) => {
    if (confirm(`¿Despachar a ${respondedor.nombre_completo} a ${emergencia.nombre}?`)) {
      // Aquí iría la lógica de despacho
      console.log("Despachando:", respondedor, "a", emergencia);
      alert(`✅ ${respondedor.nombre_completo} ha sido despachado correctamente`);
      cargarDatos(false);
    }
  };

  const exportarDatos = () => {
    // Implementar exportación a Excel/CSV
    console.log("Exportando datos...");
    alert("Funcionalidad de exportación próximamente");
  };

  /* ==================== RENDER ==================== */

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-lg font-medium text-gray-700">Cargando Respondedores Comunitarios...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">

      {/* HEADER */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl shadow-lg">
                  <Shield className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Respondedores Comunitarios</h1>
                  <p className="text-sm text-gray-600">Sistema de Gestión de Emergencias</p>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              {/* Notificaciones */}
              <button className="relative p-2 hover:bg-gray-100 rounded-lg transition">
                <Bell className="w-5 h-5 text-gray-600" />
                {stats.emergencias_activas > 0 && (
                  <span className="absolute top-0 right-0 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center animate-pulse">
                    {stats.emergencias_activas}
                  </span>
                )}
              </button>

              {/* Refresh */}
              <button
                onClick={() => cargarDatos()}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
                title="Actualizar"
              >
                <RefreshCw className="w-5 h-5 text-gray-600" />
              </button>

              {/* Export */}
              <button
                onClick={exportarDatos}
                className="flex items-center space-x-2 px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition shadow-md"
              >
                <Download className="w-4 h-4" />
                <span className="font-medium">Exportar</span>
              </button>

              {/* Nuevo */}
              <button
                onClick={() => router.push('/admin/respondedores-comunitarios/nuevo')}
                className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-lg hover:from-emerald-700 hover:to-teal-700 transition shadow-md"
              >
                <UserPlus className="w-4 h-4" />
                <span className="font-medium">Nuevo Respondedor</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* KPI CARDS */}
      <div className="px-6 py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-4">

          {/* Total */}
          <div className="bg-white rounded-xl p-5 shadow-md border border-gray-100 hover:shadow-lg transition">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <TrendingUp className="w-4 h-4 text-green-500" />
            </div>
            <div className="text-3xl font-bold text-gray-900">{stats.total_respondedores}</div>
            <div className="text-sm text-gray-600 mt-1">Total Respondedores</div>
          </div>

          {/* Disponibles */}
          <div className="bg-white rounded-xl p-5 shadow-md border border-gray-100 hover:shadow-lg transition">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Check className="w-5 h-5 text-green-600" />
              </div>
              <div className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
                {((stats.disponibles / stats.total_respondedores) * 100).toFixed(0)}%
              </div>
            </div>
            <div className="text-3xl font-bold text-green-600">{stats.disponibles}</div>
            <div className="text-sm text-gray-600 mt-1">Disponibles</div>
          </div>

          {/* En Servicio */}
          <div className="bg-white rounded-xl p-5 shadow-md border border-gray-100 hover:shadow-lg transition">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 bg-amber-100 rounded-lg">
                <Activity className="w-5 h-5 text-amber-600 animate-pulse" />
              </div>
            </div>
            <div className="text-3xl font-bold text-amber-600">{stats.en_servicio}</div>
            <div className="text-sm text-gray-600 mt-1">En Servicio</div>
          </div>

          {/* Emergencias Activas */}
          <div className="bg-white rounded-xl p-5 shadow-md border border-gray-100 hover:shadow-lg transition">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertCircle className="w-5 h-5 text-red-600 animate-pulse" />
              </div>
            </div>
            <div className="text-3xl font-bold text-red-600">{stats.emergencias_activas}</div>
            <div className="text-sm text-gray-600 mt-1">Emergencias Activas</div>
          </div>

          {/* Tiempo Promedio */}
          <div className="bg-white rounded-xl p-5 shadow-md border border-gray-100 hover:shadow-lg transition">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Clock className="w-5 h-5 text-purple-600" />
              </div>
            </div>
            <div className="text-3xl font-bold text-purple-600">{stats.tiempo_promedio_respuesta}</div>
            <div className="text-sm text-gray-600 mt-1">Min. Respuesta</div>
          </div>

          {/* Evaluación */}
          <div className="bg-white rounded-xl p-5 shadow-md border border-gray-100 hover:shadow-lg transition">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Star className="w-5 h-5 text-yellow-600" />
              </div>
            </div>
            <div className="text-3xl font-bold text-yellow-600">{stats.evaluacion_promedio.toFixed(1)}</div>
            <div className="text-sm text-gray-600 mt-1">Evaluación ⭐</div>
          </div>

          {/* Fuera de Servicio */}
          <div className="bg-white rounded-xl p-5 shadow-md border border-gray-100 hover:shadow-lg transition">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 bg-gray-100 rounded-lg">
                <X className="w-5 h-5 text-gray-600" />
              </div>
            </div>
            <div className="text-3xl font-bold text-gray-600">{stats.fuera_servicio}</div>
            <div className="text-sm text-gray-600 mt-1">Fuera de Servicio</div>
          </div>
        </div>
      </div>

      {/* BARRA DE FILTROS */}
      <div className="px-6 pb-4">
        <div className="bg-white rounded-xl p-5 shadow-md border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900 flex items-center space-x-2">
              <Filter className="w-5 h-5 text-emerald-600" />
              <span>Filtros</span>
            </h3>
            <button
              onClick={limpiarFiltros}
              className="text-sm text-emerald-600 hover:text-emerald-700 font-medium flex items-center space-x-1"
            >
              <X className="w-4 h-4" />
              <span>Limpiar</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {/* Búsqueda */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por nombre, RUT..."
                value={filtros.busqueda}
                onChange={(e) => setFiltros({...filtros, busqueda: e.target.value})}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>

            {/* Tipo */}
            <select
              value={filtros.tipo}
              onChange={(e) => setFiltros({...filtros, tipo: e.target.value})}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            >
              <option value="">Todos los tipos</option>
              <option value="PARAMEDICO">Paramédico</option>
              <option value="ENFERMERO">Enfermero</option>
              <option value="MEDICO">Médico</option>
              <option value="FUNCIONARIO">Funcionario</option>
              <option value="VOLUNTARIO">Voluntario</option>
              <option value="VEHICULO">Vehículo</option>
              <option value="OTRO">Otro</option>
            </select>

            {/* Estado */}
            <select
              value={filtros.estado}
              onChange={(e) => setFiltros({...filtros, estado: e.target.value})}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            >
              <option value="">Todos los estados</option>
              <option value="DISPONIBLE">Disponible</option>
              <option value="EN_RUTA">En Ruta</option>
              <option value="EN_SITIO">En Sitio</option>
              <option value="OCUPADO">Ocupado</option>
              <option value="FUERA_DE_SERVICIO">Fuera de Servicio</option>
            </select>

            {/* Disponibilidad */}
            <select
              value={filtros.disponibilidad}
              onChange={(e) => setFiltros({...filtros, disponibilidad: e.target.value})}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            >
              <option value="">Disponibilidad</option>
              <option value="disponible">Solo Disponibles</option>
              <option value="ocupado">Solo Ocupados</option>
            </select>

            {/* Experiencia */}
            <select
              value={filtros.experiencia}
              onChange={(e) => setFiltros({...filtros, experiencia: e.target.value})}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            >
              <option value="">Experiencia</option>
              <option value="BASICO">Básico</option>
              <option value="INTERMEDIO">Intermedio</option>
              <option value="AVANZADO">Avanzado</option>
              <option value="EXPERTO">Experto</option>
            </select>

            {/* Especialidad */}
            <input
              type="text"
              placeholder="Especialidad..."
              value={filtros.especialidad}
              onChange={(e) => setFiltros({...filtros, especialidad: e.target.value})}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* CONTROLES DE VISTA */}
      <div className="px-6 pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 bg-white rounded-lg p-1 shadow-sm border border-gray-200">
            <button
              onClick={() => setViewMode("map")}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md transition ${
                viewMode === "map"
                  ? "bg-emerald-500 text-white shadow-md"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              <MapIcon className="w-4 h-4" />
              <span className="font-medium">Mapa</span>
            </button>
            <button
              onClick={() => setViewMode("table")}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md transition ${
                viewMode === "table"
                  ? "bg-emerald-500 text-white shadow-md"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              <List className="w-4 h-4" />
              <span className="font-medium">Lista</span>
            </button>
            <button
              onClick={() => setViewMode("split")}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md transition ${
                viewMode === "split"
                  ? "bg-emerald-500 text-white shadow-md"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              <Grid className="w-4 h-4" />
              <span className="font-medium">Dividido</span>
            </button>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">
              Mostrando <span className="font-bold text-gray-900">{respondedoresFiltrados.length}</span> de <span className="font-bold text-gray-900">{respondedores.length}</span> respondedores
            </span>
          </div>
        </div>
      </div>

      {/* CONTENIDO PRINCIPAL */}
      <div className="px-6 pb-6">
        {viewMode === "map" && (
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-emerald-50 to-teal-50">
              <h3 className="text-lg font-bold text-gray-900 flex items-center space-x-2">
                <MapPin className="w-5 h-5 text-emerald-600" />
                <span>Mapa de Respondedores Comunitarios</span>
              </h3>
              <button
                onClick={() => setMapaMaximizado(!mapaMaximizado)}
                className="p-2 hover:bg-white rounded-lg transition"
              >
                {mapaMaximizado ? (
                  <Minimize2 className="w-5 h-5 text-gray-600" />
                ) : (
                  <Maximize2 className="w-5 h-5 text-gray-600" />
                )}
              </button>
            </div>
            <div style={{ height: mapaMaximizado ? '85vh' : '75vh' }}>
              <MapaRespondedores
                respondedores={respondedoresFiltrados}
                emergencias={emergencias}
                onRespondedorClick={setRespondedorSeleccionado}
                onEmergenciaClick={setEmergenciaSeleccionada}
              />
            </div>
          </div>
        )}

        {viewMode === "table" && (
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-emerald-50 to-teal-50">
              <h3 className="text-lg font-bold text-gray-900 flex items-center space-x-2">
                <List className="w-5 h-5 text-emerald-600" />
                <span>Listado de Respondedores</span>
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Respondedor</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Tipo</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Estado</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Especialidad</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Contacto</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Evaluación</th>
                    <th className="px-6 py-3 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {respondedoresFiltrados.map((resp) => (
                    <tr key={resp.id_respondedor} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-3">
                          <div className={`w-3 h-3 rounded-full ${resp.disponible ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
                          <div>
                            <div className="font-medium text-gray-900">{resp.nombre_completo}</div>
                            <div className="text-sm text-gray-500">{resp.rut || 'Sin RUT'}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-3 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                          {resp.tipo_respondedor}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <EstadoBadge estado={resp.estado} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {resp.especialidad || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{resp.celular_personal || '-'}</div>
                        <div className="text-xs text-gray-500">{resp.email_personal || '-'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {resp.evaluacion_promedio ? (
                          <div className="flex items-center space-x-1">
                            <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                            <span className="font-medium text-gray-900">{resp.evaluacion_promedio.toFixed(1)}</span>
                          </div>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <div className="flex items-center justify-center space-x-2">
                          <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition">
                            <Eye className="w-4 h-4" />
                          </button>
                          <button className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition">
                            <Phone className="w-4 h-4" />
                          </button>
                          <button className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition">
                            <Navigation className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {viewMode === "split" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Mapa */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-emerald-50 to-teal-50">
                <h3 className="text-lg font-bold text-gray-900 flex items-center space-x-2">
                  <MapPin className="w-5 h-5 text-emerald-600" />
                  <span>Mapa</span>
                </h3>
              </div>
              <div style={{ height: '65vh' }}>
                <MapaRespondedores
                  respondedores={respondedoresFiltrados}
                  emergencias={emergencias}
                  onRespondedorClick={setRespondedorSeleccionado}
                  onEmergenciaClick={setEmergenciaSeleccionada}
                />
              </div>
            </div>

            {/* Lista */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-emerald-50 to-teal-50">
                <h3 className="text-lg font-bold text-gray-900 flex items-center space-x-2">
                  <List className="w-5 h-5 text-emerald-600" />
                  <span>Respondedores ({respondedoresFiltrados.length})</span>
                </h3>
              </div>
              <div style={{ height: '65vh', overflowY: 'auto' }} className="p-4 space-y-3">
                {respondedoresFiltrados.map((resp) => (
                  <div
                    key={resp.id_respondedor}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition cursor-pointer"
                    onClick={() => setRespondedorSeleccionado(resp)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-3">
                        <div className={`w-3 h-3 rounded-full ${resp.disponible ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
                        <h4 className="font-bold text-gray-900">{resp.nombre_completo}</h4>
                      </div>
                      <EstadoBadge estado={resp.estado} />
                    </div>
                    <div className="text-sm text-gray-600 space-y-1">
                      <div className="flex items-center space-x-2">
                        <Shield className="w-4 h-4 text-emerald-600" />
                        <span>{resp.tipo_respondedor}</span>
                      </div>
                      {resp.celular_personal && (
                        <div className="flex items-center space-x-2">
                          <Phone className="w-4 h-4 text-blue-600" />
                          <span>{resp.celular_personal}</span>
                        </div>
                      )}
                      {resp.especialidad && (
                        <div className="flex items-center space-x-2">
                          <Activity className="w-4 h-4 text-purple-600" />
                          <span>{resp.especialidad}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* PANEL DE EMERGENCIAS ACTIVAS (Lateral) */}
      {emergencias.length > 0 && (
        <div className="fixed right-6 bottom-6 w-96 bg-white rounded-xl shadow-2xl border border-red-200 z-50">
          <div className="px-4 py-3 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-t-xl flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-5 h-5 animate-pulse" />
              <h3 className="font-bold">Emergencias Activas ({emergencias.length})</h3>
            </div>
            <button
              onClick={() => setEmergencias([])}
              className="p-1 hover:bg-white/20 rounded transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="p-4 space-y-3 max-h-96 overflow-y-auto">
            {emergencias.map((emerg) => (
              <div
                key={emerg.id}
                className="border-2 border-red-200 rounded-lg p-4 bg-red-50 hover:bg-red-100 transition cursor-pointer"
                onClick={() => setEmergenciaSeleccionada(emerg)}
              >
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-bold text-gray-900">{emerg.nombre}</h4>
                  <SeveridadBadge severidad={emerg.severidad} />
                </div>
                <p className="text-sm text-gray-600 mb-3">{emerg.direccion}</p>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    const masCercano = encontrarMasCercano(emerg);
                    if (masCercano) {
                      despacharRespondedor(masCercano, emerg);
                    }
                  }}
                  className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition font-medium"
                >
                  <Navigation className="w-4 h-4" />
                  <span>Despachar Respondedor</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ==================== COMPONENTES AUXILIARES ==================== */

function EstadoBadge({ estado }: { estado: EstadoRespondedor }) {
  const configs = {
    DISPONIBLE: { bg: 'bg-green-100', text: 'text-green-800', icon: Check },
    EN_RUTA: { bg: 'bg-blue-100', text: 'text-blue-800', icon: Navigation },
    EN_SITIO: { bg: 'bg-amber-100', text: 'text-amber-800', icon: MapPin },
    OCUPADO: { bg: 'bg-red-100', text: 'text-red-800', icon: X },
    FUERA_DE_SERVICIO: { bg: 'bg-gray-100', text: 'text-gray-800', icon: X },
  };

  const config = configs[estado] || configs.DISPONIBLE;
  const Icon = config.icon;

  return (
    <span className={`px-3 py-1 text-xs font-medium rounded-full ${config.bg} ${config.text} flex items-center space-x-1 w-fit`}>
      <Icon className="w-3 h-3" />
      <span>{estado.replace(/_/g, ' ')}</span>
    </span>
  );
}

function SeveridadBadge({ severidad }: { severidad: "BAJA" | "MEDIA" | "ALTA" | "CRITICA" }) {
  const configs = {
    BAJA: { bg: 'bg-blue-100', text: 'text-blue-800' },
    MEDIA: { bg: 'bg-yellow-100', text: 'text-yellow-800' },
    ALTA: { bg: 'bg-orange-100', text: 'text-orange-800' },
    CRITICA: { bg: 'bg-red-100', text: 'text-red-800' },
  };

  const config = configs[severidad];

  return (
    <span className={`px-2 py-1 text-xs font-bold rounded ${config.bg} ${config.text}`}>
      {severidad}
    </span>
  );
}
