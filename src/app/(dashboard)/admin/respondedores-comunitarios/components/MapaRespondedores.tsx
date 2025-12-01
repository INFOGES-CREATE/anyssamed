// src/app/(dashboard)/admin/respondedores-comunitarios/components/MapaRespondedores.tsx
"use client";

import React, { useEffect, useRef, useState } from 'react';
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Circle,
  Polyline,
  useMap,
  useMapEvents,
  LayersControl,
  FeatureGroup,
} from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  Navigation,
  Phone,
  Mail,
  MapPin,
  Clock,
  Star,
  Shield,
  Activity,
  AlertCircle,
  Target,
  Locate,
  Maximize2,
} from 'lucide-react';

// Fix para iconos de Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

/* ==================== TIPOS ==================== */

type Respondedor = {
  id_respondedor: number;
  nombre_completo?: string;
  nombres: string;
  apellido_paterno: string;
  tipo_respondedor: string;
  estado: string;
  disponible: boolean;
  latitud?: number;
  longitud?: number;
  celular_personal?: string;
  email_personal?: string;
  especialidad?: string;
  evaluacion_promedio?: number;
  tiempo_promedio_respuesta?: number;
  centro_nombre?: string;
};

type Emergencia = {
  id: number;
  nombre: string;
  direccion: string;
  latitud: number;
  longitud: number;
  severidad: "BAJA" | "MEDIA" | "ALTA" | "CRITICA";
  estado: string;
};

interface Props {
  respondedores: Respondedor[];
  emergencias: Emergencia[];
  onRespondedorClick?: (resp: Respondedor) => void;
  onEmergenciaClick?: (emerg: Emergencia) => void;
}

/* ==================== COMPONENTE PRINCIPAL ==================== */

export default function MapaRespondedores({
  respondedores,
  emergencias,
  onRespondedorClick,
  onEmergenciaClick,
}: Props) {
  const [ubicacionUsuario, setUbicacionUsuario] = useState<[number, number] | null>(null);
  const [mostrarCirculos, setMostrarCirculos] = useState(true);
  const [radioCobertura, setRadioCobertura] = useState(3000); // metros
  const [capaActual, setCapaActual] = useState<'satelite' | 'calles'>('calles');

  // Centro inicial: Curicó, Chile
  const centroInicial: [number, number] = [-34.9806453, -71.2335392];

  useEffect(() => {
    // Obtener ubicación del usuario
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUbicacionUsuario([position.coords.latitude, position.coords.longitude]);
        },
        (error) => {
          console.log('No se pudo obtener ubicación:', error);
        }
      );
    }
  }, []);

  /* ==================== ICONOS PERSONALIZADOS ==================== */

  const crearIconoRespondedor = (respondedor: Respondedor): L.DivIcon => {
    let color = '#10b981'; // verde por defecto (disponible)
    let icono = 'fa-user-shield';

    if (!respondedor.disponible || respondedor.estado === 'FUERA_DE_SERVICIO') {
      color = '#6b7280'; // gris (fuera de servicio)
    } else if (respondedor.estado === 'EN_RUTA') {
      color = '#3b82f6'; // azul (en ruta)
      icono = 'fa-truck-medical';
    } else if (respondedor.estado === 'EN_SITIO') {
      color = '#f59e0b'; // amarillo (en sitio)
      icono = 'fa-house-medical';
    } else if (respondedor.estado === 'OCUPADO') {
      color = '#ef4444'; // rojo (ocupado)
    }

    const html = `
      <div style="
        background-color: ${color};
        width: 40px;
        height: 40px;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        border: 4px solid white;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        position: relative;
        ${respondedor.disponible ? 'animation: pulse-marker 2s infinite;' : ''}
      ">
        <i class="fas ${icono}" style="
          color: white;
          font-size: 16px;
          transform: rotate(45deg);
        "></i>
        ${respondedor.disponible ? `
          <div style="
            position: absolute;
            top: -8px;
            right: -8px;
            background: #10b981;
            width: 16px;
            height: 16px;
            border-radius: 50%;
            border: 3px solid white;
            animation: pulse-dot 1.5s infinite;
          "></div>
        ` : ''}
      </div>
      <style>
        @keyframes pulse-marker {
          0%, 100% { transform: rotate(-45deg) scale(1); }
          50% { transform: rotate(-45deg) scale(1.1); }
        }
        @keyframes pulse-dot {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.2); opacity: 0.8; }
        }
      </style>
    `;

    return L.divIcon({
      html,
      className: 'custom-marker-respondedor',
      iconSize: [40, 40],
      iconAnchor: [20, 40],
      popupAnchor: [0, -40],
    });
  };

  const crearIconoEmergencia = (emergencia: Emergencia): L.DivIcon => {
    const colores = {
      BAJA: '#3b82f6',
      MEDIA: '#f59e0b',
      ALTA: '#f97316',
      CRITICA: '#ef4444',
    };

    const color = colores[emergencia.severidad];

    const html = `
      <div style="
        background-color: ${color};
        width: 50px;
        height: 50px;
        border-radius: 50%;
        border: 5px solid white;
        box-shadow: 0 6px 20px rgba(0,0,0,0.4);
        display: flex;
        align-items: center;
        justify-content: center;
        animation: pulse-emergency 1s infinite;
        position: relative;
      ">
        <i class="fas fa-exclamation-triangle" style="
          color: white;
          font-size: 22px;
        "></i>
        <div style="
          position: absolute;
          inset: -10px;
          border: 3px solid ${color};
          border-radius: 50%;
          animation: ripple 1.5s infinite;
        "></div>
      </div>
      <style>
        @keyframes pulse-emergency {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.15); }
        }
        @keyframes ripple {
          0% { transform: scale(1); opacity: 0.8; }
          100% { transform: scale(2); opacity: 0; }
        }
      </style>
    `;

    return L.divIcon({
      html,
      className: 'custom-marker-emergencia',
      iconSize: [50, 50],
      iconAnchor: [25, 25],
      popupAnchor: [0, -25],
    });
  };

  const crearIconoUsuario = (): L.DivIcon => {
    const html = `
      <div style="
        background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
        width: 30px;
        height: 30px;
        border-radius: 50%;
        border: 4px solid white;
        box-shadow: 0 4px 12px rgba(99, 102, 241, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        animation: pulse-user 2s infinite;
      ">
        <i class="fas fa-street-view" style="color: white; font-size: 14px;"></i>
      </div>
      <style>
        @keyframes pulse-user {
          0%, 100% { box-shadow: 0 4px 12px rgba(99, 102, 241, 0.5); }
          50% { box-shadow: 0 4px 20px rgba(99, 102, 241, 0.8); }
        }
      </style>
    `;

    return L.divIcon({
      html,
      className: 'custom-marker-usuario',
      iconSize: [30, 30],
      iconAnchor: [15, 15],
      popupAnchor: [0, -15],
    });
  };

  /* ==================== COMPONENTES AUXILIARES ==================== */

  function RecenterMap({ center }: { center: [number, number] }) {
    const map = useMap();

    useEffect(() => {
      if (center) {
        map.setView(center, map.getZoom());
      }
    }, [center, map]);

    return null;
  }

  function MapClickHandler() {
    useMapEvents({
      click: (e) => {
        console.log('Click en mapa:', e.latlng);
        // Aquí podrías agregar funcionalidad para crear nueva emergencia
      },
    });
    return null;
  }

  /* ==================== RENDER ==================== */

  return (
    <div className="relative w-full h-full">
      {/* Capa de Font Awesome para iconos */}
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
      />

      {/* CONTROLES SUPERIORES */}
      <div className="absolute top-4 left-4 z-[1000] space-y-2">
        {/* Toggle círculos de cobertura */}
        <button
          onClick={() => setMostrarCirculos(!mostrarCirculos)}
          className={`px-4 py-2 rounded-lg font-medium shadow-lg transition ${
            mostrarCirculos
              ? 'bg-emerald-500 text-white'
              : 'bg-white text-gray-700 hover:bg-gray-100'
          }`}
        >
          <Target className="w-4 h-4 inline mr-2" />
          Círculos de Cobertura
        </button>

        {/* Selector de radio */}
        {mostrarCirculos && (
          <div className="bg-white rounded-lg p-3 shadow-lg">
            <label className="text-sm font-medium text-gray-700 block mb-2">
              Radio: {(radioCobertura / 1000).toFixed(1)} km
            </label>
            <input
              type="range"
              min="500"
              max="10000"
              step="500"
              value={radioCobertura}
              onChange={(e) => setRadioCobertura(Number(e.target.value))}
              className="w-full"
            />
          </div>
        )}

        {/* Info */}
        <div className="bg-white rounded-lg p-4 shadow-lg space-y-2">
          <div className="text-sm font-bold text-gray-900 border-b pb-2 mb-2">
            Leyenda
          </div>
          <div className="flex items-center space-x-2 text-xs">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-gray-700">Disponible</span>
          </div>
          <div className="flex items-center space-x-2 text-xs">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span className="text-gray-700">En Ruta</span>
          </div>
          <div className="flex items-center space-x-2 text-xs">
            <div className="w-3 h-3 bg-amber-500 rounded-full"></div>
            <span className="text-gray-700">En Sitio</span>
          </div>
          <div className="flex items-center space-x-2 text-xs">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <span className="text-gray-700">Ocupado/Emergencia</span>
          </div>
          <div className="flex items-center space-x-2 text-xs">
            <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
            <span className="text-gray-700">Fuera de Servicio</span>
          </div>
        </div>
      </div>

      {/* ESTADÍSTICAS EN MAPA */}
      <div className="absolute top-4 right-4 z-[1000] bg-white rounded-lg p-4 shadow-lg">
        <div className="text-lg font-bold text-gray-900 mb-3">Estadísticas en Mapa</div>
        <div className="space-y-2 text-sm">
          <div className="flex items-center justify-between space-x-4">
            <span className="text-gray-600">Total Respondedores:</span>
            <span className="font-bold text-gray-900">{respondedores.length}</span>
          </div>
          <div className="flex items-center justify-between space-x-4">
            <span className="text-gray-600">Disponibles:</span>
            <span className="font-bold text-green-600">
              {respondedores.filter(r => r.disponible).length}
            </span>
          </div>
          <div className="flex items-center justify-between space-x-4">
            <span className="text-gray-600">Emergencias:</span>
            <span className="font-bold text-red-600">{emergencias.length}</span>
          </div>
          <div className="flex items-center justify-between space-x-4">
            <span className="text-gray-600">En Servicio:</span>
            <span className="font-bold text-amber-600">
              {respondedores.filter(r => r.estado === 'EN_SITIO' || r.estado === 'EN_RUTA').length}
            </span>
          </div>
        </div>
      </div>

      {/* MAPA */}
      <MapContainer
        center={ubicacionUsuario || centroInicial}
        zoom={13}
        style={{ height: '100%', width: '100%' }}
        className="rounded-lg"
        zoomControl={true}
      >
        <LayersControl position="bottomleft">
          <LayersControl.BaseLayer checked name="🗺️ Calles">
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
          </LayersControl.BaseLayer>

          <LayersControl.BaseLayer name="🛰️ Satélite">
            <TileLayer
              attribution='Imagery &copy; Esri'
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
            />
          </LayersControl.BaseLayer>

          <LayersControl.BaseLayer name="🌍 Topográfico">
            <TileLayer
              attribution='&copy; OpenTopoMap'
              url="https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png"
            />
          </LayersControl.BaseLayer>

          <LayersControl.BaseLayer name="🌙 Oscuro">
            <TileLayer
              attribution='&copy; CartoDB'
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            />
          </LayersControl.BaseLayer>
        </LayersControl>

        <MapClickHandler />

        {/* MARCADORES DE RESPONDEDORES CON CLUSTERING */}
        <MarkerClusterGroup
          chunkedLoading
          showCoverageOnHover={false}
          spiderfyOnMaxZoom={true}
          removeOutsideVisibleBounds={true}
          animate={true}
          maxClusterRadius={60}
        >
          {respondedores.filter(r => r.latitud && r.longitud).map((resp) => (
            <Marker
              key={resp.id_respondedor}
              position={[resp.latitud!, resp.longitud!]}
              icon={crearIconoRespondedor(resp)}
              eventHandlers={{
                click: () => onRespondedorClick?.(resp),
              }}
            >
              <Popup maxWidth={350} className="custom-popup">
                <div className="p-3">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-3 pb-3 border-b border-gray-200">
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-900 mb-1">
                        {resp.nombre_completo || `${resp.nombres} ${resp.apellido_paterno}`}
                      </h3>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 text-xs font-bold rounded ${
                          resp.disponible
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {resp.estado.replace(/_/g, ' ')}
                        </span>
                        <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded">
                          {resp.tipo_respondedor}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Información */}
                  <div className="space-y-2 mb-3">
                    {resp.especialidad && (
                      <div className="flex items-center space-x-2 text-sm">
                        <Activity className="w-4 h-4 text-purple-600" />
                        <span className="text-gray-700">{resp.especialidad}</span>
                      </div>
                    )}
                    {resp.centro_nombre && (
                      <div className="flex items-center space-x-2 text-sm">
                        <Shield className="w-4 h-4 text-emerald-600" />
                        <span className="text-gray-700">{resp.centro_nombre}</span>
                      </div>
                    )}
                    {resp.celular_personal && (
                      <div className="flex items-center space-x-2 text-sm">
                        <Phone className="w-4 h-4 text-blue-600" />
                        <a
                          href={`tel:${resp.celular_personal}`}
                          className="text-blue-600 hover:text-blue-800 font-medium"
                        >
                          {resp.celular_personal}
                        </a>
                      </div>
                    )}
                    {resp.email_personal && (
                      <div className="flex items-center space-x-2 text-sm">
                        <Mail className="w-4 h-4 text-indigo-600" />
                        <a
                          href={`mailto:${resp.email_personal}`}
                          className="text-indigo-600 hover:text-indigo-800 text-xs"
                        >
                          {resp.email_personal}
                        </a>
                      </div>
                    )}
                  </div>

                  {/* Métricas */}
                  <div className="grid grid-cols-2 gap-3 mb-3 pb-3 border-b border-gray-200">
                    {resp.evaluacion_promedio && (
                      <div className="text-center">
                        <div className="flex items-center justify-center space-x-1 mb-1">
                          <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                          <span className="text-lg font-bold text-gray-900">
                            {resp.evaluacion_promedio.toFixed(1)}
                          </span>
                        </div>
                        <div className="text-xs text-gray-600">Evaluación</div>
                      </div>
                    )}
                    {resp.tiempo_promedio_respuesta && (
                      <div className="text-center">
                        <div className="flex items-center justify-center space-x-1 mb-1">
                          <Clock className="w-4 h-4 text-blue-500" />
                          <span className="text-lg font-bold text-gray-900">
                            {resp.tiempo_promedio_respuesta}m
                          </span>
                        </div>
                        <div className="text-xs text-gray-600">Tiempo</div>
                      </div>
                    )}
                  </div>

                  {/* Acciones */}
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => window.open(`tel:${resp.celular_personal}`, '_blank')}
                      className="px-3 py-2 bg-green-500 text-white rounded-lg text-sm font-medium hover:bg-green-600 transition flex items-center justify-center space-x-1"
                      disabled={!resp.celular_personal}
                    >
                      <Phone className="w-3 h-3" />
                      <span>Llamar</span>
                    </button>
                    <button
                      onClick={() => onRespondedorClick?.(resp)}
                      className="px-3 py-2 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600 transition flex items-center justify-center space-x-1"
                    >
                      <Navigation className="w-3 h-3" />
                      <span>Despachar</span>
                    </button>
                  </div>
                </div>
              </Popup>

              {/* Círculo de cobertura */}
              {mostrarCirculos && resp.disponible && (
                <Circle
                  center={[resp.latitud!, resp.longitud!]}
                  radius={radioCobertura}
                  pathOptions={{
                    color: '#10b981',
                    fillColor: '#10b981',
                    fillOpacity: 0.1,
                    weight: 2,
                    dashArray: '5, 5',
                  }}
                />
              )}
            </Marker>
          ))}
        </MarkerClusterGroup>

        {/* MARCADORES DE EMERGENCIAS */}
        {emergencias.map((emerg) => (
          <Marker
            key={emerg.id}
            position={[emerg.latitud, emerg.longitud]}
            icon={crearIconoEmergencia(emerg)}
            eventHandlers={{
              click: () => onEmergenciaClick?.(emerg),
            }}
          >
            <Popup maxWidth={300}>
              <div className="p-3">
                <h3 className="text-lg font-bold text-red-600 mb-2">
                  ⚠️ {emerg.nombre}
                </h3>
                <p className="text-sm text-gray-700 mb-3">{emerg.direccion}</p>
                <div className="flex items-center justify-between mb-3">
                  <span className={`px-3 py-1 text-xs font-bold rounded ${
                    emerg.severidad === 'CRITICA' ? 'bg-red-600 text-white' :
                    emerg.severidad === 'ALTA' ? 'bg-orange-500 text-white' :
                    emerg.severidad === 'MEDIA' ? 'bg-yellow-500 text-white' :
                    'bg-blue-500 text-white'
                  }`}>
                    {emerg.severidad}
                  </span>
                  <span className="text-xs text-gray-600">{emerg.estado}</span>
                </div>
                <button
                  onClick={() => onEmergenciaClick?.(emerg)}
                  className="w-full px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition"
                >
                  Asignar Respondedor
                </button>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* MARCADOR DE UBICACIÓN DEL USUARIO */}
        {ubicacionUsuario && (
          <Marker position={ubicacionUsuario} icon={crearIconoUsuario()}>
            <Popup>
              <div className="p-2 text-center">
                <p className="font-bold text-purple-600">📍 Tu ubicación</p>
                <p className="text-xs text-gray-600 mt-1">
                  {ubicacionUsuario[0].toFixed(6)}, {ubicacionUsuario[1].toFixed(6)}
                </p>
              </div>
            </Popup>
          </Marker>
        )}
      </MapContainer>
    </div>
  );
}
