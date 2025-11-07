// app/dashboard/page.tsx
"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Calendar,
  CalendarPlus,
  FileText,
  Pill,
  Video,
  Heart,
  Brain,
  FolderOpen,
  Bell,
  MessageSquare,
  AlertCircle,
  Info,
  CheckCircle2,
  Clock,
  MapPin,
  User,
  Star,
  TrendingUp,
  Zap,
  Activity,
  Tag,
  Crown,
  Lock,
  ArrowRight,
  X,
  Menu,
} from "lucide-react";

// ========================================
// TIPOS
// ========================================

interface UsuarioData {
  id_usuario: number;
  nombre_completo: string;
  email: string;
  foto_url: string | null;
  tipo_usuario: string;
  es_premium: boolean;
  fecha_expiracion_premium: string | null;
}

interface EstadisticasBasicas {
  citas_proximas: number;
  mensajes_sin_leer: number;
  notificaciones_pendientes: number;
  documentos_pendientes: number;
}

interface CitaProxima {
  id_cita: number;
  fecha_hora_inicio: string;
  fecha_hora_fin: string;
  tipo_cita: string;
  estado: string;
  medico: {
    nombre_completo: string;
    especialidad: string;
    foto_url: string | null;
  };
  centro: {
    nombre: string;
    direccion: string;
  };
  motivo: string | null;
}

interface NotificacionReciente {
  id_notificacion: number;
  tipo: string;
  titulo: string;
  mensaje: string;
  fecha_hora: string;
  leida: boolean;
  icono: string;
  color: string;
}

interface AccesoRapido {
  titulo: string;
  descripcion: string;
  icono: string;
  color: string;
  url: string;
  requiere_premium: boolean;
  badge?: string;
}

interface FuncionalidadPremium {
  titulo: string;
  descripcion: string;
  icono: string;
  beneficios: string[];
}

interface DashboardData {
  usuario: UsuarioData;
  estadisticas: EstadisticasBasicas;
  citas_proximas: CitaProxima[];
  notificaciones_recientes: NotificacionReciente[];
  accesos_rapidos: AccesoRapido[];
  funcionalidades_premium: FuncionalidadPremium[];
}

// ========================================
// MAPEO DE ICONOS
// ========================================

const iconMap: Record<string, any> = {
  Calendar,
  CalendarPlus,
  FileText,
  Pill,
  Video,
  Heart,
  Brain,
  FolderOpen,
  Bell,
  MessageSquare,
  AlertCircle,
  Info,
  CheckCircle2,
  Clock,
  MapPin,
  User,
  Star,
  TrendingUp,
  Zap,
  Activity,
  Tag,
  Crown,
  Lock,
};

// ========================================
// COMPONENTE PRINCIPAL
// ========================================

export default function DashboardGenerico() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mostrarModalPremium, setMostrarModalPremium] = useState(false);
  const [menuMovilAbierto, setMenuMovilAbierto] = useState(false);

  // Cargar datos del dashboard
  useEffect(() => {
    cargarDashboard();
  }, []);

  const cargarDashboard = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/users/dashboard", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!response.ok) {
        throw new Error("Error al cargar el dashboard");
      }

      const result = await response.json();
      setData(result);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Formatear fecha
  const formatearFecha = (fecha: string) => {
    const date = new Date(fecha);
    const opciones: Intl.DateTimeFormatOptions = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    return date.toLocaleDateString("es-ES", opciones);
  };

  // Formatear fecha relativa
  const formatearFechaRelativa = (fecha: string) => {
    const ahora = new Date();
    const fechaCita = new Date(fecha);
    const diff = fechaCita.getTime() - ahora.getTime();
    const dias = Math.floor(diff / (1000 * 60 * 60 * 24));
    const horas = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    if (dias === 0 && horas < 24) {
      return `En ${horas} hora${horas !== 1 ? "s" : ""}`;
    } else if (dias === 0) {
      return "Hoy";
    } else if (dias === 1) {
      return "Mañana";
    } else if (dias < 7) {
      return `En ${dias} días`;
    } else {
      return fechaCita.toLocaleDateString("es-ES", {
        day: "numeric",
        month: "short",
      });
    }
  };

  const obtenerEstadoCita = (estado: string) => {
  const estados: Record<
    string,
    { texto: string; color: string; bg: string }
  > = {
    programada: {
      texto: "Programada",
      color: "text-blue-600",
      bg: "bg-blue-100",
    },
    confirmada: {
      texto: "Confirmada",
      color: "text-green-600",
      bg: "bg-green-100",
    },
    en_sala_espera: {
      texto: "En Espera",
      color: "text-yellow-600",
      bg: "bg-yellow-100",
    },
    en_atencion: {
      texto: "En Atención",
      color: "text-purple-600",
      bg: "bg-purple-100",
    },
  };

  return (
    estados[estado] || {
      texto: estado,
      color: "text-gray-600",
      bg: "bg-gray-100",
    }
  );
};


  // Manejar click en acceso rápido
  const manejarClickAcceso = (acceso: AccesoRapido) => {
    if (acceso.requiere_premium && !data?.usuario.es_premium) {
      setMostrarModalPremium(true);
    } else {
      window.location.href = acceso.url;
    }
  };

  // Renderizado condicional
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando dashboard...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="text-center bg-white p-8 rounded-2xl shadow-xl">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Error al cargar
          </h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={cargarDashboard}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative">
                {data.usuario.foto_url ? (
                  <img
                    src={data.usuario.foto_url}
                    alt={data.usuario.nombre_completo}
                    className="w-12 h-12 rounded-full object-cover ring-2 ring-blue-500"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center ring-2 ring-blue-500">
                    <User className="w-6 h-6 text-white" />
                  </div>
                )}
                {data.usuario.es_premium && (
                  <Crown className="w-5 h-5 text-yellow-500 absolute -top-1 -right-1 bg-white rounded-full p-0.5" />
                )}
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-800">
                  ¡Hola, {data.usuario.nombre_completo.split(" ")[0]}!
                </h1>
                <p className="text-sm text-gray-500">
                  {new Date().toLocaleDateString("es-ES", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
            </div>

            <div className="hidden md:flex items-center space-x-4">
              {!data.usuario.es_premium && (
                <button
                  onClick={() => setMostrarModalPremium(true)}
                  className="px-6 py-2 bg-gradient-to-r from-yellow-400 to-yellow-600 text-white rounded-full font-semibold hover:from-yellow-500 hover:to-yellow-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center space-x-2"
                >
                  <Crown className="w-5 h-5" />
                  <span>Hazte Premium</span>
                </button>
              )}
              <button className="relative p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-full transition-all">
                <Bell className="w-6 h-6" />
                {data.estadisticas.notificaciones_pendientes > 0 && (
                  <span className="absolute top-0 right-0 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                    {data.estadisticas.notificaciones_pendientes}
                  </span>
                )}
              </button>
            </div>

            <button
              className="md:hidden p-2 text-gray-600 hover:text-gray-800"
              onClick={() => setMenuMovilAbierto(!menuMovilAbierto)}
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>
      </header>

      {/* Contenido Principal */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tarjetas de Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow border border-gray-100"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-100 rounded-xl">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
              <span className="text-3xl font-bold text-blue-600">
                {data.estadisticas.citas_proximas}
              </span>
            </div>
            <h3 className="text-sm font-medium text-gray-600">
              Citas Próximas
            </h3>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow border border-gray-100"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-purple-100 rounded-xl">
                <MessageSquare className="w-6 h-6 text-purple-600" />
              </div>
              <span className="text-3xl font-bold text-purple-600">
                {data.estadisticas.mensajes_sin_leer}
              </span>
            </div>
            <h3 className="text-sm font-medium text-gray-600">
              Mensajes Sin Leer
            </h3>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow border border-gray-100"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-yellow-100 rounded-xl">
                <Bell className="w-6 h-6 text-yellow-600" />
              </div>
              <span className="text-3xl font-bold text-yellow-600">
                {data.estadisticas.notificaciones_pendientes}
              </span>
            </div>
            <h3 className="text-sm font-medium text-gray-600">
              Notificaciones
            </h3>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow border border-gray-100"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-green-100 rounded-xl">
                <FileText className="w-6 h-6 text-green-600" />
              </div>
              <span className="text-3xl font-bold text-green-600">
                {data.estadisticas.documentos_pendientes}
              </span>
            </div>
            <h3 className="text-sm font-medium text-gray-600">
              Documentos Pendientes
            </h3>
          </motion.div>
        </div>

        {/* Grid Principal */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Columna Izquierda */}
          <div className="lg:col-span-2 space-y-8">
            {/* Citas Próximas */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-white rounded-2xl shadow-lg border border-gray-100"
            >
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-gray-800 flex items-center space-x-2">
                    <Calendar className="w-6 h-6 text-blue-600" />
                    <span>Próximas Citas</span>
                  </h2>
                  <button className="text-blue-600 hover:text-blue-700 font-medium text-sm">
                    Ver todas
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-4">
                {data.citas_proximas.length === 0 ? (
                  <div className="text-center py-12">
                    <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 mb-4">
                      No tienes citas programadas
                    </p>
                    <button
                      onClick={() => (window.location.href = "/agendar-cita")}
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Agendar Cita
                    </button>
                  </div>
                ) : (
                  data.citas_proximas.map((cita, index) => {
                    const estadoCita = obtenerEstadoCita(cita.estado);
                    return (
                      <motion.div
                        key={cita.id_cita}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.6 + index * 0.1 }}
                        className="flex items-start space-x-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl hover:shadow-md transition-all cursor-pointer"
                      >
                        <div className="flex-shrink-0">
                          {cita.medico.foto_url ? (
                            <img
                              src={cita.medico.foto_url}
                              alt={cita.medico.nombre_completo}
                              className="w-12 h-12 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                              <User className="w-6 h-6 text-white" />
                            </div>
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <h3 className="text-sm font-semibold text-gray-800 truncate">
                              Dr. {cita.medico.nombre_completo}
                            </h3>
                            <span
                              className={`px-2 py-1 text-xs font-medium rounded-full ${estadoCita.bg} ${estadoCita.color}`}
                            >
                              {estadoCita.texto}
                            </span>
                          </div>

                          <p className="text-xs text-gray-600 mb-2">
                            {cita.medico.especialidad}
                          </p>

                          <div className="flex items-center space-x-4 text-xs text-gray-500">
                            <span className="flex items-center space-x-1">
                              <Clock className="w-3 h-3" />
                              <span>{formatearFechaRelativa(cita.fecha_hora_inicio)}</span>
                            </span>
                            <span className="flex items-center space-x-1">
                              <MapPin className="w-3 h-3" />
                              <span className="truncate">{cita.centro.nombre}</span>
                            </span>
                          </div>

                          {cita.motivo && (
                            <p className="text-xs text-gray-600 mt-2 italic">
                              Motivo: {cita.motivo}
                            </p>
                          )}
                        </div>
                      </motion.div>
                    );
                  })
                )}
              </div>
            </motion.div>

            {/* Accesos Rápidos */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6"
            >
              <h2 className="text-xl font-bold text-gray-800 mb-6">
                Accesos Rápidos
              </h2>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {data.accesos_rapidos.map((acceso, index) => {
                  const IconComponent = iconMap[acceso.icono];
                  const esBloqueado =
                    acceso.requiere_premium && !data.usuario.es_premium;

                  return (
                    <motion.button
                      key={index}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.8 + index * 0.05 }}
                      onClick={() => manejarClickAcceso(acceso)}
                      className={`relative p-4 rounded-xl transition-all ${
                        esBloqueado
                          ? "bg-gray-100 hover:bg-gray-200 cursor-not-allowed"
                          : "bg-gradient-to-br from-blue-50 to-purple-50 hover:shadow-lg hover:scale-105"
                      }`}
                    >
                      {esBloqueado && (
                        <div className="absolute top-2 right-2">
                          <Lock className="w-4 h-4 text-gray-400" />
                        </div>
                      )}

                      {acceso.badge && (
                        <div className="absolute -top-2 -right-2 bg-gradient-to-r from-yellow-400 to-yellow-600 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg">
                          {acceso.badge}
                        </div>
                      )}

                      <div
                        className={`w-12 h-12 ${acceso.color} rounded-xl flex items-center justify-center mb-3 mx-auto`}
                      >
                        {IconComponent && (
                          <IconComponent className="w-6 h-6 text-white" />
                        )}
                      </div>

                      <h3 className="text-sm font-semibold text-gray-800 mb-1">
                        {acceso.titulo}
                      </h3>
                      <p className="text-xs text-gray-600 line-clamp-2">
                        {acceso.descripcion}
                      </p>
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          </div>

          {/* Columna Derecha */}
          <div className="space-y-8">
            {/* Notificaciones Recientes */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
              className="bg-white rounded-2xl shadow-lg border border-gray-100"
            >
              <div className="p-6 border-b border-gray-100">
                <h2 className="text-xl font-bold text-gray-800 flex items-center space-x-2">
                  <Bell className="w-6 h-6 text-yellow-600" />
                  <span>Notificaciones</span>
                </h2>
              </div>

              <div className="p-4 space-y-3 max-h-96 overflow-y-auto">
                {data.notificaciones_recientes.length === 0 ? (
                  <div className="text-center py-8">
                    <Bell className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">
                      No tienes notificaciones
                    </p>
                  </div>
                ) : (
                  data.notificaciones_recientes.map((notif, index) => {
                    const IconComponent = iconMap[notif.icono];
                    return (
                      <motion.div
                        key={notif.id_notificacion}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 1.0 + index * 0.05 }}
                        className={`p-3 rounded-lg border ${
                          notif.leida
                            ? "bg-gray-50 border-gray-200"
                            : "bg-blue-50 border-blue-200"
                        } hover:shadow-md transition-all cursor-pointer`}
                      >
                        <div className="flex items-start space-x-3">
                          <div
                            className={`flex-shrink-0 p-2 rounded-lg ${notif.color} bg-opacity-10`}
                          >
                            {IconComponent && (
                              <IconComponent
                                className={`w-5 h-5 ${notif.color}`}
                              />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-semibold text-gray-800 mb-1">
                              {notif.titulo}
                            </h4>
                            <p className="text-xs text-gray-600 line-clamp-2">
                              {notif.mensaje}
                            </p>
                            <p className="text-xs text-gray-400 mt-1">
                              {formatearFechaRelativa(notif.fecha_hora)}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })
                )}
              </div>
            </motion.div>

            {/* Banner Premium */}
            {!data.usuario.es_premium && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.1 }}
                className="bg-gradient-to-br from-yellow-400 via-yellow-500 to-yellow-600 rounded-2xl shadow-xl overflow-hidden"
              >
                <div className="p-6 text-white relative">
                  <Crown className="w-12 h-12 mb-4 opacity-90" />
                  <h3 className="text-2xl font-bold mb-2">
                    Hazte Premium
                  </h3>
                  <p className="text-yellow-100 text-sm mb-4">
                    Desbloquea todas las funcionalidades y disfruta de una
                    experiencia médica completa
                  </p>

                  <ul className="space-y-2 mb-6">
                    <li className="flex items-center space-x-2 text-sm">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Telemedicina ilimitada</span>
                    </li>
                    <li className="flex items-center space-x-2 text-sm">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Análisis con IA</span>
                    </li>
                    <li className="flex items-center space-x-2 text-sm">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Historia clínica completa</span>
                    </li>
                    <li className="flex items-center space-x-2 text-sm">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Descuentos exclusivos</span>
                    </li>
                  </ul>

                  <button
                    onClick={() => setMostrarModalPremium(true)}
                    className="w-full py-3 bg-white text-yellow-600 rounded-xl font-bold hover:bg-yellow-50 transition-colors flex items-center justify-center space-x-2 shadow-lg"
                  >
                    <span>Ver Planes Premium</span>
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </main>

      {/* Modal Premium */}
      {mostrarModalPremium && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="sticky top-0 bg-gradient-to-r from-yellow-400 to-yellow-600 p-6 rounded-t-3xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Crown className="w-8 h-8 text-white" />
                  <h2 className="text-2xl font-bold text-white">
                    Funcionalidades Premium
                  </h2>
                </div>
                <button
                  onClick={() => setMostrarModalPremium(false)}
                  className="p-2 hover:bg-yellow-500 rounded-full transition-colors"
                >
                  <X className="w-6 h-6 text-white" />
                </button>
              </div>
            </div>

            <div className="p-8">
              <p className="text-gray-600 text-center mb-8">
                Desbloquea todo el potencial de nuestra plataforma médica con
                Premium
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {data.funcionalidades_premium.map((func, index) => {
                  const IconComponent = iconMap[func.icono];
                  return (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-6 border border-gray-200 hover:shadow-lg transition-all"
                    >
                      <div className="flex items-start space-x-4">
                        <div className="flex-shrink-0 p-3 bg-white rounded-xl shadow-md">
                          {IconComponent && (
                            <IconComponent className="w-6 h-6 text-blue-600" />
                          )}
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-gray-800 mb-2">
                            {func.titulo}
                          </h3>
                          <p className="text-sm text-gray-600 mb-3">
                            {func.descripcion}
                          </p>
                          <ul className="space-y-2">
                            {func.beneficios.map((beneficio, idx) => (
                              <li
                                key={idx}
                                className="flex items-center space-x-2 text-sm text-gray-700"
                              >
                                <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                                <span>{beneficio}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {/* Planes de precios */}
              <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 rounded-2xl p-8 text-center">
                <h3 className="text-2xl font-bold text-gray-800 mb-4">
                  Elige tu plan Premium
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <div className="bg-white rounded-xl p-6 shadow-lg">
                    <h4 className="text-lg font-bold text-gray-800 mb-2">
                      Mensual
                    </h4>
                    <div className="text-4xl font-bold text-blue-600 mb-4">
                      $29
                      <span className="text-lg text-gray-500">/mes</span>
                    </div>
                    <button className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                      Seleccionar
                    </button>
                  </div>

                  <div className="bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-xl p-6 shadow-xl transform scale-105 relative">
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                      MÁS POPULAR
                    </div>
                    <h4 className="text-lg font-bold text-white mb-2">
                      Trimestral
                    </h4>
                    <div className="text-4xl font-bold text-white mb-4">
                      $69
                      <span className="text-lg text-yellow-100">/3 meses</span>
                    </div>
                    <button className="w-full py-2 bg-white text-yellow-600 rounded-lg hover:bg-yellow-50 transition-colors font-bold">
                      Seleccionar
                    </button>
                    <p className="text-xs text-yellow-100 mt-2">
                      Ahorra 20%
                    </p>
                  </div>

                  <div className="bg-white rounded-xl p-6 shadow-lg">
                    <h4 className="text-lg font-bold text-gray-800 mb-2">
                      Anual
                    </h4>
                    <div className="text-4xl font-bold text-green-600 mb-4">
                      $199
                      <span className="text-lg text-gray-500">/año</span>
                    </div>
                    <button className="w-full py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                      Seleccionar
                    </button>
                    <p className="text-xs text-green-600 mt-2 font-semibold">
                      Ahorra 43%
                    </p>
                  </div>
                </div>

                <p className="text-sm text-gray-600">
                  Garantía de satisfacción de 30 días • Cancela cuando quieras
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}