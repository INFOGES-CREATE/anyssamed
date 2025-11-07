//frontend\src\app\(dashboard)\medico\telemedicina\page.tsx

"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import {
  Activity,
  AlertCircle,
  AlertTriangle,
  BarChart3,
  Bell,
  Calendar,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock,
  ClipboardList,
  Download,
  Edit,
  Filter,
  History,
  Info,
  Loader2,
  LogOut,
  Mail,
  MessageSquare,
  MoreVertical,
  Phone,
  RefreshCw,
  Search,
  Settings,
  Signal,
  Sparkles,
  Star,
  Sun,
  TrendingUp,
  User,
  Users,
  Video,
  Wifi,
  X,
  Zap,
  Moon,
  Maximize2,
  Minimize2,
  DollarSign,
  MapPin,
  Siren,
  Plus, // 👈 este faltaba
} from "lucide-react";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

// =========================
// TIPOS
// =========================
type TemaColor = "light" | "dark" | "blue" | "purple" | "green";
type EstadoSesion =
  | "programada"
  | "en_espera"
  | "en_curso"
  | "finalizada"
  | "cancelada"
  | "no_asistio"
  | "problema_tecnico";
type TipoCita =
  | "consulta"
  | "control"
  | "urgencia"
  | "procedimiento"
  | "telemedicina";
type TipoVista = "cards" | "lista" | "calendario";

interface UsuarioSesion {
  id_usuario: number;
  username: string;
  email: string;
  nombre: string;
  apellido_paterno: string;
  apellido_materno: string | null;
  foto_perfil_url: string | null;
  rol: {
    id_rol: number;
    nombre: string;
    nivel_jerarquia: number;
  };
  medico?: {
    id_medico: number;
    numero_registro_medico: string;
    titulo_profesional: string;
    especialidades: Array<{
      id_especialidad: number;
      nombre: string;
      es_principal: boolean;
    }>;
    id_centro_principal: number;
    centro_principal: {
      id_centro: number;
      nombre: string;
      plan: "basico" | "profesional" | "enterprise";
      logo_url: string | null;
      ciudad: string;
      region: string;
    };
    calificacion_promedio: number;
    anos_experiencia: number;
    consulta_telemedicina: boolean;
  };
}

interface SesionTelemedicina {
  id_sesion: number;
  id_cita: number;
  id_paciente: number;
  id_medico: number;
  token_acceso: string;
  url_sesion: string;
  estado: EstadoSesion;
  fecha_hora_inicio_programada: string;
  fecha_hora_fin_programada: string;
  fecha_hora_inicio_real: string | null;
  fecha_hora_fin_real: string | null;
  duracion_segundos: number | null;
  proveedor_servicio: string;
  calidad_conexion:
    | "excelente"
    | "buena"
    | "regular"
    | "mala"
    | "muy_mala"
    | null;
  paciente: {
    id_paciente: number;
    nombre_completo: string;
    edad: number;
    genero: string;
    foto_url: string | null;
    telefono: string | null;
    email: string | null;
    grupo_sanguineo: string;
    alergias: string[];
    condiciones_cronicas: string[];
  };
  cita: {
    id_cita: number;
    motivo: string | null;
    tipo_cita: TipoCita;
    notas_previas: string | null;
  };
}

interface EstadisticasTelemedicina {
  total_sesiones_hoy: number;
  sesiones_completadas: number;
  sesiones_pendientes: number;
  sesiones_canceladas: number;
  tiempo_promedio_sesion: number;
  calificacion_promedio: number;
  pacientes_atendidos_mes: number;
  ingresos_mes: number;
  tasa_asistencia: number;
  tiempo_espera_promedio: number;
}

interface ConfiguracionTema {
  nombre: string;
  icono: any;
  colores: {
    fondo: string;
    fondoSecundario: string;
    texto: string;
    textoSecundario: string;
    primario: string;
    secundario: string;
    acento: string;
    borde: string;
    sombra: string;
    gradiente: string;
    sidebar: string;
    header: string;
    card: string;
    hover: string;
  };
}

interface Notificacion {
  id: string;
  tipo: "info" | "success" | "warning" | "error";
  titulo: string;
  mensaje: string;
  timestamp: Date;
  leida: boolean;
  accion?: {
    texto: string;
    url: string;
  };
}

// =========================
// TEMAS
// =========================
const TEMAS: Record<TemaColor, ConfiguracionTema> = {
  light: {
    nombre: "Claro",
    icono: Sun,
    colores: {
      fondo: "from-slate-50 via-blue-50 to-indigo-50",
      fondoSecundario: "bg-white",
      texto: "text-gray-900",
      textoSecundario: "text-gray-600",
      primario: "bg-indigo-600 hover:bg-indigo-700",
      secundario: "bg-gray-200 hover:bg-gray-300",
      acento: "text-indigo-600",
      borde: "border-gray-200",
      sombra: "shadow-xl shadow-indigo-100/50",
      gradiente: "from-indigo-500 via-purple-500 to-pink-500",
      sidebar: "bg-white/95 backdrop-blur-xl border-gray-200",
      header: "bg-white/80 backdrop-blur-xl border-gray-200",
      card: "bg-white border-gray-200 hover:border-indigo-300",
      hover: "hover:bg-gray-50",
    },
  },
  dark: {
    nombre: "Oscuro",
    icono: Moon,
    colores: {
      fondo: "from-slate-950 via-indigo-950 to-purple-950",
      fondoSecundario: "bg-gray-900",
      texto: "text-white",
      textoSecundario: "text-gray-400",
      primario: "bg-indigo-600 hover:bg-indigo-700",
      secundario: "bg-gray-800 hover:bg-gray-700",
      acento: "text-indigo-400",
      borde: "border-gray-800",
      sombra: "shadow-2xl shadow-indigo-500/20",
      gradiente: "from-indigo-500 via-purple-500 to-pink-500",
      sidebar: "bg-gray-900/95 backdrop-blur-xl border-gray-800",
      header: "bg-gray-900/80 backdrop-blur-xl border-gray-800",
      card: "bg-gray-800/50 border-gray-700 hover:border-indigo-500/50",
      hover: "hover:bg-gray-800",
    },
  },
  blue: {
    nombre: "Azul Océano",
    icono: Wifi,
    colores: {
      fondo: "from-blue-950 via-cyan-950 to-teal-950",
      fondoSecundario: "bg-blue-900",
      texto: "text-white",
      textoSecundario: "text-cyan-300",
      primario: "bg-cyan-600 hover:bg-cyan-700",
      secundario: "bg-blue-800 hover:bg-blue-700",
      acento: "text-cyan-400",
      borde: "border-cyan-800",
      sombra: "shadow-2xl shadow-cyan-500/20",
      gradiente: "from-cyan-500 via-blue-500 to-indigo-500",
      sidebar: "bg-blue-900/95 backdrop-blur-xl border-cyan-800",
      header: "bg-blue-900/80 backdrop-blur-xl border-cyan-800",
      card: "bg-blue-800/50 border-cyan-700 hover:border-cyan-500/50",
      hover: "hover:bg-blue-800",
    },
  },
  purple: {
    nombre: "Púrpura Real",
    icono: Sparkles,
    colores: {
      fondo: "from-purple-950 via-fuchsia-950 to-pink-950",
      fondoSecundario: "bg-purple-900",
      texto: "text-white",
      textoSecundario: "text-purple-300",
      primario: "bg-fuchsia-600 hover:bg-fuchsia-700",
      secundario: "bg-purple-800 hover:bg-purple-700",
      acento: "text-fuchsia-400",
      borde: "border-purple-800",
      sombra: "shadow-2xl shadow-fuchsia-500/20",
      gradiente: "from-fuchsia-500 via-purple-500 to-pink-500",
      sidebar: "bg-purple-900/95 backdrop-blur-xl border-purple-800",
      header: "bg-purple-900/80 backdrop-blur-xl border-purple-800",
      card: "bg-purple-800/50 border-purple-700 hover:border-fuchsia-500/50",
      hover: "hover:bg-purple-800",
    },
  },
  green: {
    nombre: "Verde Médico",
    icono: Video,
    colores: {
      fondo: "from-emerald-950 via-teal-950 to-cyan-950",
      fondoSecundario: "bg-emerald-900",
      texto: "text-white",
      textoSecundario: "text-emerald-300",
      primario: "bg-emerald-600 hover:bg-emerald-700",
      secundario: "bg-teal-800 hover:bg-teal-700",
      acento: "text-emerald-400",
      borde: "border-emerald-800",
      sombra: "shadow-2xl shadow-emerald-500/20",
      gradiente: "from-emerald-500 via-teal-500 to-cyan-500",
      sidebar: "bg-emerald-900/95 backdrop-blur-xl border-emerald-800",
      header: "bg-emerald-900/80 backdrop-blur-xl border-emerald-800",
      card: "bg-emerald-800/50 border-emerald-700 hover:border-emerald-500/50",
      hover: "hover:bg-emerald-800",
    },
  },
};

// estadísticas por defecto para no romper UI
const ESTADISTICAS_BASE: EstadisticasTelemedicina = {
  total_sesiones_hoy: 0,
  sesiones_completadas: 0,
  sesiones_pendientes: 0,
  sesiones_canceladas: 0,
  tiempo_promedio_sesion: 0,
  calificacion_promedio: 0,
  pacientes_atendidos_mes: 0,
  ingresos_mes: 0,
  tasa_asistencia: 0,
  tiempo_espera_promedio: 0,
};

export default function TelemedicinaEntradaPage() {
  const router = useRouter();

  // =========================
  // STATES
  // =========================
  const [usuario, setUsuario] = useState<UsuarioSesion | null>(null);
  const [loading, setLoading] = useState(true);
  const [sesiones, setSesiones] = useState<SesionTelemedicina[]>([]);
  const [estadisticas, setEstadisticas] =
    useState<EstadisticasTelemedicina | null>(null);
  const [loadingSesiones, setLoadingSesiones] = useState(false);
  const [loadingEstadisticas, setLoadingEstadisticas] = useState(false);
  const [notificaciones, setNotificaciones] = useState<Notificacion[]>([]);

  // UI
  const [temaActual, setTemaActual] = useState<TemaColor>("light");
  const [sidebarAbierto, setSidebarAbierto] = useState(true);
  const [vistaActual, setVistaActual] = useState<
    "hoy" | "semana" | "mes" | "todas"
  >("hoy");
  const [tipoVista, setTipoVista] = useState<TipoVista>("cards");
  const [filtroEstado, setFiltroEstado] = useState<EstadoSesion | "todas">(
    "todas"
  );
  const [busqueda, setBusqueda] = useState("");
  const [mostrarEstadisticas, setMostrarEstadisticas] = useState(true);
  const [mostrarNotificaciones, setMostrarNotificaciones] = useState(false);
  const [sesionExpandida, setSesionExpandida] = useState<number | null>(null);
  const [modoFullscreen, setModoFullscreen] = useState(false);

  // período para el endpoint
  const [periodoEstadisticas, setPeriodoEstadisticas] = useState<
    "hoy" | "semana" | "mes"
  >("hoy");

  // tema actual
  const tema = useMemo(() => TEMAS[temaActual], [temaActual]);

  // =========================
  // EFFECTS
  // =========================
  useEffect(() => {
    cargarDatosUsuario();
    cargarNotificacionesIniciales();
  }, []);

  // cuando hay usuario médico, cargo datos
  useEffect(() => {
    if (usuario?.medico) {
      cargarSesiones();
      cargarEstadisticas(periodoEstadisticas);

      const interval = setInterval(() => {
        cargarSesiones();
        cargarEstadisticas(periodoEstadisticas);
        verificarNuevasNotificaciones();
      }, 30000);

      return () => clearInterval(interval);
    }
  }, [usuario, periodoEstadisticas]);

  // guardo preferencias
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("tema_telemedicina", temaActual);
      localStorage.setItem("vista_telemedicina", tipoVista);
      localStorage.setItem("sidebar_abierto", JSON.stringify(sidebarAbierto));
    }
  }, [temaActual, tipoVista, sidebarAbierto]);

  // cargo preferencias
  useEffect(() => {
    if (typeof window !== "undefined") {
      const temaGuardado = localStorage.getItem("tema_telemedicina");
      const vistaGuardada = localStorage.getItem("vista_telemedicina");
      const sidebarGuardado = localStorage.getItem("sidebar_abierto");

      if (temaGuardado) setTemaActual(temaGuardado as TemaColor);
      if (vistaGuardada) setTipoVista(vistaGuardada as TipoVista);
      if (sidebarGuardado) setSidebarAbierto(JSON.parse(sidebarGuardado));
    }
  }, []);

  // =========================
  // LOADERS
  // =========================
  const cargarDatosUsuario = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/auth/session", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
      if (!response.ok) throw new Error("No hay sesión activa");

      const result = await response.json();

      if (result.success && result.usuario) {
        const rolesUsuario: string[] = [];
        if (result.usuario.rol) {
          rolesUsuario.push(
            result.usuario.rol.nombre
              ?.normalize("NFD")
              .replace(/[\u0300-\u036f]/g, "")
              .trim()
              .toUpperCase()
          );
        }
        if (Array.isArray(result.usuario.roles)) {
          result.usuario.roles.forEach((r: any) => {
            if (r?.nombre) {
              rolesUsuario.push(
                r.nombre
                  .normalize("NFD")
                  .replace(/[\u0300-\u036f]/g, "")
                  .trim()
                  .toUpperCase()
              );
            }
          });
        }
        const tieneRolMedico = rolesUsuario.some((rol) =>
          rol.includes("MEDICO")
        );
        if (!tieneRolMedico) {
          agregarNotificacion({
            tipo: "error",
            titulo: "Acceso Denegado",
            mensaje: "Este módulo es solo para médicos.",
          });
          setTimeout(() => {
            window.location.href = "/";
          }, 2000);
          return;
        }
        if (!result.usuario.medico) {
          agregarNotificacion({
            tipo: "error",
            titulo: "Perfil Incompleto",
            mensaje: "Tu usuario no está vinculado a un registro médico.",
          });
          setTimeout(() => {
            window.location.href = "/";
          }, 2000);
          return;
        }
        setUsuario(result.usuario);
        agregarNotificacion({
          tipo: "success",
          titulo: "Bienvenido",
          mensaje: `Dr. ${result.usuario.nombre} ${result.usuario.apellido_paterno}`,
        });
      } else {
        window.location.href = "/login";
      }
    } catch (error) {
      console.error("Error al cargar usuario:", error);
      agregarNotificacion({
        tipo: "error",
        titulo: "Error de Sesión",
        mensaje: "No se pudo cargar tu sesión. Redirigiendo...",
      });
      setTimeout(() => {
        window.location.href = "/login";
      }, 2000);
    } finally {
      setLoading(false);
    }
  };

  const cargarSesiones = async () => {
    if (!usuario?.medico) return;
    try {
      setLoadingSesiones(true);
      const response = await fetch("/api/telemedicina/sesiones", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
      if (!response.ok) throw new Error("Error al cargar sesiones");
      const result = await response.json();
      if (result.success && result.sesiones) {
        const sesionesEnEspera = result.sesiones.filter(
          (s: SesionTelemedicina) => s.estado === "en_espera"
        );
        const sesionesEnEsperaAnterior = sesiones.filter(
          (s) => s.estado === "en_espera"
        );
        if (sesionesEnEspera.length > sesionesEnEsperaAnterior.length) {
          agregarNotificacion({
            tipo: "warning",
            titulo: "Nuevo Paciente en Espera",
            mensaje: "Hay pacientes esperando para ser atendidos",
            accion: { texto: "Ver Pacientes", url: "#sesiones" },
          });
          reproducirSonidoNotificacion();
        }
        setSesiones(result.sesiones);
      }
    } catch (error) {
      console.error("Error al cargar sesiones:", error);
      agregarNotificacion({
        tipo: "error",
        titulo: "Error al Cargar",
        mensaje: "No se pudieron cargar las sesiones",
      });
    } finally {
      setLoadingSesiones(false);
    }
  };

  // <- AQUÍ está el cambio importante
  const cargarEstadisticas = async (
    periodo: "hoy" | "semana" | "mes" = "hoy"
  ) => {
    if (!usuario?.medico) return;
    try {
      setLoadingEstadisticas(true);
      const response = await fetch(
        `/api/telemedicina/estadisticas?periodo=${periodo}`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          cache: "no-store",
        }
      );

      if (!response.ok) {
        // si tu backend devuelve 401 porque no encuentra la sesión en la tabla,
        // no rompemos la UI
        setEstadisticas(ESTADISTICAS_BASE);
        return;
      }

      const result = await response.json();
      if (result.success && result.estadisticas) {
        setEstadisticas({
          total_sesiones_hoy:
            Number(result.estadisticas.total_sesiones_hoy) || 0,
          sesiones_completadas:
            Number(result.estadisticas.sesiones_completadas) || 0,
          sesiones_pendientes:
            Number(result.estadisticas.sesiones_pendientes) || 0,
          sesiones_canceladas:
            Number(result.estadisticas.sesiones_canceladas) || 0,
          tiempo_promedio_sesion:
            Number(result.estadisticas.tiempo_promedio_sesion) || 0,
          calificacion_promedio:
            Number(result.estadisticas.calificacion_promedio) || 0,
          pacientes_atendidos_mes:
            Number(result.estadisticas.pacientes_atendidos_mes) || 0,
          ingresos_mes: Number(result.estadisticas.ingresos_mes) || 0,
          tasa_asistencia: Number(result.estadisticas.tasa_asistencia) || 0,
          tiempo_espera_promedio:
            Number(result.estadisticas.tiempo_espera_promedio) || 0,
        });
      } else {
        setEstadisticas(ESTADISTICAS_BASE);
      }
    } catch (error) {
      console.error("Error al cargar estadísticas:", error);
      setEstadisticas(ESTADISTICAS_BASE);
    } finally {
      setLoadingEstadisticas(false);
    }
  };

  const cargarNotificacionesIniciales = () => {
    if (typeof window !== "undefined") {
      const notificacionesGuardadas = localStorage.getItem(
        "notificaciones_telemedicina"
      );
      if (notificacionesGuardadas) {
        try {
          const notifs = JSON.parse(notificacionesGuardadas);
          setNotificaciones(
            notifs.map((n: any) => ({
              ...n,
              timestamp: new Date(n.timestamp),
            }))
          );
        } catch (error) {
          console.error("Error al cargar notificaciones:", error);
        }
      }
    }
  };

  const verificarNuevasNotificaciones = async () => {
    // placeholder
  };

  // =========================
  // UTILIDADES
  // =========================
  const agregarNotificacion = useCallback(
    (notif: Omit<Notificacion, "id" | "timestamp" | "leida">) => {
      const nuevaNotificacion: Notificacion = {
        ...notif,
        id: `notif-${Date.now()}-${Math.random()}`,
        timestamp: new Date(),
        leida: false,
      };
      setNotificaciones((prev) => {
        const nuevas = [nuevaNotificacion, ...prev].slice(0, 50);
        if (typeof window !== "undefined") {
          localStorage.setItem(
            "notificaciones_telemedicina",
            JSON.stringify(nuevas)
          );
        }
        return nuevas;
      });
    },
    []
  );

  const reproducirSonidoNotificacion = () => {
    if (typeof window !== "undefined" && "Audio" in window) {
      try {
        const audio = new Audio("/sounds/notification.mp3");
        audio.volume = 0.5;
        audio.play().catch(() => {});
      } catch (error) {
        console.log("Audio no disponible");
      }
    }
  };

  const formatearFecha = (fecha: string) => {
    const date = new Date(fecha);
    return date.toLocaleDateString("es-CL", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };
  const formatearHora = (fecha: string) => {
    const date = new Date(fecha);
    return date.toLocaleTimeString("es-CL", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };
  const formatearFechaRelativa = (fecha: Date) => {
    const ahora = new Date();
    const diff = ahora.getTime() - fecha.getTime();
    const minutos = Math.floor(diff / 60000);
    const horas = Math.floor(diff / 3600000);
    const dias = Math.floor(diff / 86400000);
    if (minutos < 1) return "Ahora";
    if (minutos < 60) return `Hace ${minutos} min`;
    if (horas < 24) return `Hace ${horas} h`;
    return `Hace ${dias} días`;
  };

  const obtenerColorEstado = (estado: EstadoSesion) => {
    switch (estado) {
      case "en_espera":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      case "en_curso":
        return "bg-green-500/20 text-green-400 border-green-500/30";
      case "finalizada":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      case "cancelada":
        return "bg-red-500/20 text-red-400 border-red-500/30";
      case "no_asistio":
        return "bg-orange-500/20 text-orange-400 border-orange-500/30";
      case "problema_tecnico":
        return "bg-purple-500/20 text-purple-400 border-purple-500/30";
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    }
  };

  const obtenerTextoEstado = (estado: EstadoSesion) => {
    switch (estado) {
      case "programada":
        return "Programada";
      case "en_espera":
        return "En Espera";
      case "en_curso":
        return "En Curso";
      case "finalizada":
        return "Finalizada";
      case "cancelada":
        return "Cancelada";
      case "no_asistio":
        return "No Asistió";
      case "problema_tecnico":
        return "Problema Técnico";
      default:
        return estado;
    }
  };

  const obtenerIconoEstado = (estado: EstadoSesion) => {
    switch (estado) {
      case "en_espera":
        return Clock;
      case "en_curso":
        return Video;
      case "finalizada":
        return CheckCircle2;
      case "cancelada":
        return X;
      case "no_asistio":
        return AlertCircle;
      case "problema_tecnico":
        return AlertTriangle;
      default:
        return Calendar;
    }
  };

  const obtenerColorCalidadConexion = (calidad: string | null): string => {
    if (!calidad) return "bg-gray-500/20 text-gray-400";
    switch (calidad) {
      case "excelente":
        return "bg-green-500/20 text-green-400";
      case "buena":
        return "bg-blue-500/20 text-blue-400";
      case "regular":
        return "bg-yellow-500/20 text-yellow-400";
      case "mala":
        return "bg-orange-500/20 text-orange-400";
      case "muy_mala":
        return "bg-red-500/20 text-red-400";
      default:
        return "bg-gray-500/20 text-gray-400";
    }
  };

  // sesiones filtradas
  const sesionesFiltradas = useMemo(() => {
    let resultado = sesiones;
    if (filtroEstado !== "todas") {
      resultado = resultado.filter((s) => s.estado === filtroEstado);
    }
    if (busqueda.trim()) {
      const termino = busqueda.toLowerCase();
      resultado = resultado.filter(
        (s) =>
          s.paciente.nombre_completo.toLowerCase().includes(termino) ||
          s.cita.motivo?.toLowerCase().includes(termino) ||
          s.paciente.email?.toLowerCase().includes(termino) ||
          s.paciente.telefono?.includes(termino)
      );
    }
    if (vistaActual !== "todas") {
      const ahora = new Date();
      const hoy = new Date(
        ahora.getFullYear(),
        ahora.getMonth(),
        ahora.getDate()
      );
      resultado = resultado.filter((s) => {
        const fechaSesion = new Date(s.fecha_hora_inicio_programada);
        switch (vistaActual) {
          case "hoy":
            return (
              fechaSesion >= hoy &&
              fechaSesion < new Date(hoy.getTime() + 86400000)
            );
          case "semana": {
            const inicioSemana = new Date(hoy);
            inicioSemana.setDate(hoy.getDate() - hoy.getDay());
            const finSemana = new Date(inicioSemana.getTime() + 7 * 86400000);
            return fechaSesion >= inicioSemana && fechaSesion < finSemana;
          }
          case "mes":
            return (
              fechaSesion.getMonth() === ahora.getMonth() &&
              fechaSesion.getFullYear() === ahora.getFullYear()
            );
          default:
            return true;
        }
      });
    }
    resultado.sort((a, b) => {
      if (a.estado === "en_espera" && b.estado !== "en_espera") return -1;
      if (a.estado !== "en_espera" && b.estado === "en_espera") return 1;
      if (a.estado === "en_curso" && b.estado !== "en_curso") return -1;
      if (a.estado !== "en_curso" && b.estado === "en_curso") return 1;
      const fechaA = new Date(a.fecha_hora_inicio_programada).getTime();
      const fechaB = new Date(b.fecha_hora_inicio_programada).getTime();
      return fechaA - fechaB;
    });
    return resultado;
  }, [sesiones, filtroEstado, busqueda, vistaActual]);

  // =========================
  // ACCIONES
  // =========================
  const entrarSala = async (sesion: SesionTelemedicina) => {
    try {
      agregarNotificacion({
        tipo: "info",
        titulo: "Preparando Sala",
        mensaje: "Generando acceso seguro...",
      });
      const response = await fetch("/api/telemedicina/sala/acceso", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ id_sesion: sesion.id_sesion }),
      });
      if (!response.ok) throw new Error("Error al generar acceso a la sala");
      const result = await response.json();
      if (result.success && result.acceso) {
        agregarNotificacion({
          tipo: "success",
          titulo: "Acceso Generado",
          mensaje: "Redirigiendo a la sala...",
        });
        setTimeout(() => {
          router.push(result.acceso.url_sala);
        }, 1000);
      } else {
        throw new Error(result.error || "No se pudo acceder a la sala");
      }
    } catch (error: any) {
      agregarNotificacion({
        tipo: "error",
        titulo: "Error de Acceso",
        mensaje: error.message || "No se pudo acceder a la sala",
      });
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setModoFullscreen(true);
    } else {
      document.exitFullscreen();
      setModoFullscreen(false);
    }
  };

  const exportarDatos = () => {
    const datos = {
      estadisticas: estadisticas ?? ESTADISTICAS_BASE,
      sesiones: sesionesFiltradas,
      fecha_exportacion: new Date().toISOString(),
      medico: {
        nombre: `${usuario?.nombre} ${usuario?.apellido_paterno}`,
        especialidad:
          usuario?.medico?.especialidades[0]?.nombre || "Médico General",
      },
    };
    const blob = new Blob([JSON.stringify(datos, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `telemedicina-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    agregarNotificacion({
      tipo: "success",
      titulo: "Datos Exportados",
      mensaje: "Los datos se han descargado correctamente",
    });
  };

  const crearNuevaSesion = () => router.push("/medico/telemedicina/nueva");
  const verAgenda = () => router.push("/medico/agenda");
  const verHistorial = () => router.push("/medico/telemedicina/historial");
  const abrirConfiguracion = () =>
    router.push("/medico/configuracion/telemedicina");

  const enviarMensajePaciente = (sesion: SesionTelemedicina) => {
    if (sesion.paciente.email) {
      window.location.href = `mailto:${sesion.paciente.email}?subject=Consulta%20telemedicina&body=Hola%20${encodeURIComponent(
        sesion.paciente.nombre_completo
      )}`;
      return;
    }
    if (sesion.paciente.telefono) {
      window.location.href = `tel:${sesion.paciente.telefono}`;
      return;
    }
    agregarNotificacion({
      tipo: "error",
      titulo: "Sin contacto",
      mensaje: "El paciente no tiene correo ni teléfono registrados.",
    });
  };

  const editarCita = (sesion: SesionTelemedicina) => {
    router.push(`/medico/citas/${sesion.id_cita}/editar`);
  };

  const cancelarSesion = async (sesion: SesionTelemedicina) => {
    try {
      const confirmar = window.confirm(
        "¿Seguro que deseas cancelar esta sesión?"
      );
      if (!confirmar) return;
      const response = await fetch("/api/telemedicina/sesiones/cancelar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ id_sesion: sesion.id_sesion }),
      });
      if (!response.ok) throw new Error("No se pudo cancelar la sesión");
      const result = await response.json();
      if (result.success) {
        agregarNotificacion({
          tipo: "success",
          titulo: "Sesión cancelada",
          mensaje: "La sesión fue cancelada correctamente.",
        });
        cargarSesiones();
        cargarEstadisticas(periodoEstadisticas);
      } else {
        throw new Error(result.error || "No se pudo cancelar la sesión");
      }
    } catch (error: any) {
      agregarNotificacion({
        tipo: "error",
        titulo: "Error al cancelar",
        mensaje: error.message || "Intenta nuevamente.",
      });
    }
  };

  const irATerminos = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    router.push("/legal/terminos");
  };
  const irAPrivacidad = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    router.push("/legal/privacidad");
  };
  const irASoporte = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    router.push("/soporte");
  };
  const irADocumentacion = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    router.push("/documentacion/telemedicina");
  };

  const marcarNotificacionLeida = (id: string) => {
    setNotificaciones((prev) =>
      prev.map((n) => (n.id === id ? { ...n, leida: true } : n))
    );
  };
  const eliminarNotificacion = (id: string) => {
    setNotificaciones((prev) => prev.filter((n) => n.id !== id));
  };
  const limpiarNotificaciones = () => {
    setNotificaciones([]);
    if (typeof window !== "undefined") {
      localStorage.removeItem("notificaciones_telemedicina");
    }
  };

  // =========================
  // RENDER LOADING
  // =========================
  if (loading) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center bg-gradient-to-br ${tema.colores.fondo}`}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <div className="relative mb-8">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="w-32 h-32 border-4 border-cyan-400 border-t-transparent rounded-full"
            ></motion.div>
            <div
              className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-20 h-20 bg-gradient-to-br ${tema.colores.gradiente} rounded-full flex items-center justify-center`}
            >
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <Video className="w-10 h-10 text-white" />
              </motion.div>
            </div>
          </div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className={`text-4xl font-black mb-4 ${tema.colores.texto}`}
          >
            Cargando Telemedicina
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className={`text-lg font-semibold ${tema.colores.textoSecundario}`}
          >
            Preparando tu plataforma profesional...
          </motion.p>
        </motion.div>
      </div>
    );
  }

  if (!usuario || !usuario.medico) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center bg-gradient-to-br ${tema.colores.fondo}`}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className={`text-center max-w-md mx-auto p-8 rounded-3xl ${tema.colores.card} ${tema.colores.sombra} ${tema.colores.borde} border`}
        >
          <div
            className={`w-24 h-24 bg-gradient-to-br ${tema.colores.gradiente} rounded-3xl flex items-center justify-center mx-auto mb-6`}
          >
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 2 }}
            >
              <AlertTriangle className="w-12 h-12 text-white" />
            </motion.div>
          </div>
          <h2 className={`text-3xl font-black mb-4 ${tema.colores.texto}`}>
            Acceso No Autorizado
          </h2>
          <p className={`text-lg mb-8 ${tema.colores.textoSecundario}`}>
            No tienes permisos para acceder a este módulo
          </p>
          <Link
            href="/login"
            className={`inline-flex items-center gap-3 px-8 py-4 ${tema.colores.primario} text-white rounded-2xl font-bold text-lg transition-all duration-300 hover:scale-105 ${tema.colores.sombra}`}
          >
            <LogOut className="w-5 h-5" />
            Ir al Login
          </Link>
        </motion.div>
      </div>
    );
  }

  const notificacionesNoLeidas = notificaciones.filter((n) => !n.leida).length;

  return (
    <div className={`min-h-screen bg-gradient-to-br ${tema.colores.fondo}`}>
      {/* HEADER */}
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 100 }}
        className={`${tema.colores.header} ${tema.colores.borde} border-b ${tema.colores.sombra} sticky top-0 z-50`}
      >
        <div className="max-w-[1920px] mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* izquierda */}
            <div className="flex items-center gap-4">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setSidebarAbierto(!sidebarAbierto)}
                className={`p-2 rounded-xl ${tema.colores.secundario} ${tema.colores.texto}`}
              >
                {sidebarAbierto ? (
                  <ChevronLeft className="w-5 h-5" />
                ) : (
                  <ChevronRight className="w-5 h-5" />
                )}
              </motion.button>
              <motion.div
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.5 }}
                className={`w-12 h-12 rounded-xl bg-gradient-to-br ${tema.colores.gradiente} flex items-center justify-center shadow-lg`}
              >
                <Video className="w-6 h-6 text-white" />
              </motion.div>
              <div>
                <h1 className={`text-2xl font-black ${tema.colores.texto}`}>
                  Telemedicina Profesional
                </h1>
                <p className={`text-sm ${tema.colores.textoSecundario}`}>
                  {usuario.medico.centro_principal.nombre}
                </p>
              </div>
            </div>

            {/* derecha */}
            <div className="flex items-center gap-3">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={toggleFullscreen}
                className={`p-3 rounded-xl ${tema.colores.secundario} ${tema.colores.texto}`}
              >
                {modoFullscreen ? (
                  <Minimize2 className="w-5 h-5" />
                ) : (
                  <Maximize2 className="w-5 h-5" />
                )}
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={exportarDatos}
                className={`p-3 rounded-xl ${tema.colores.secundario} ${tema.colores.texto}`}
              >
                <Download className="w-5 h-5" />
              </motion.button>

              {/* notificaciones */}
              <div className="relative">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() =>
                    setMostrarNotificaciones(!mostrarNotificaciones)
                  }
                  className={`p-3 rounded-xl ${tema.colores.secundario} ${tema.colores.texto}`}
                >
                  <Bell className="w-5 h-5" />
                  {notificacionesNoLeidas > 0 && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center"
                    >
                      {notificacionesNoLeidas}
                    </motion.span>
                  )}
                </motion.button>

                <AnimatePresence>
                  {mostrarNotificaciones && (
                    <motion.div
                      initial={{ opacity: 0, y: -20, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -20, scale: 0.95 }}
                      className={`absolute top-full right-0 mt-2 w-96 max-h-[600px] overflow-y-auto rounded-xl ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} z-50`}
                    >
                      <div className="p-4 border-b border-gray-700 flex items-center justify-between sticky top-0 bg-inherit">
                        <h3
                          className={`text-lg font-black ${tema.colores.texto}`}
                        >
                          Notificaciones
                        </h3>
                        <button
                          onClick={limpiarNotificaciones}
                          className={`text-xs font-semibold ${tema.colores.textoSecundario}`}
                        >
                          Limpiar Todo
                        </button>
                      </div>
                      <div className="p-2">
                        {notificaciones.length === 0 ? (
                          <div className="text-center py-8">
                            <Bell
                              className={`w-12 h-12 ${tema.colores.textoSecundario} mx-auto mb-2`}
                            />
                            <p
                              className={`text-sm ${tema.colores.textoSecundario}`}
                            >
                              No hay notificaciones
                            </p>
                          </div>
                        ) : (
                          notificaciones.map((notif) => (
                            <motion.div
                              key={notif.id}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0, x: 20 }}
                              className={`p-3 rounded-lg mb-2 ${
                                notif.leida
                                  ? tema.colores.secundario
                                  : "bg-indigo-500/10 border border-indigo-500/30"
                              }`}
                            >
                              <div className="flex items-start justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  {notif.tipo === "success" && (
                                    <CheckCircle2 className="w-4 h-4 text-green-400" />
                                  )}
                                  {notif.tipo === "error" && (
                                    <AlertCircle className="w-4 h-4 text-red-400" />
                                  )}
                                  {notif.tipo === "warning" && (
                                    <AlertTriangle className="w-4 h-4 text-yellow-400" />
                                  )}
                                  {notif.tipo === "info" && (
                                    <Info className="w-4 h-4 text-blue-400" />
                                  )}
                                  <span
                                    className={`text-sm font-bold ${tema.colores.texto}`}
                                  >
                                    {notif.titulo}
                                  </span>
                                </div>
                                <button
                                  onClick={() => eliminarNotificacion(notif.id)}
                                  className={`text-xs ${tema.colores.textoSecundario}`}
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                              <p
                                className={`text-xs ${tema.colores.textoSecundario} mb-2`}
                              >
                                {notif.mensaje}
                              </p>
                              <div className="flex items-center justify-between">
                                <span
                                  className={`text-xs ${tema.colores.textoSecundario}`}
                                >
                                  {formatearFechaRelativa(notif.timestamp)}
                                </span>
                                {notif.accion && (
                                  <a
                                    href={notif.accion.url}
                                    className="text-xs font-bold text-indigo-400"
                                    onClick={() =>
                                      marcarNotificacionLeida(notif.id)
                                    }
                                  >
                                    {notif.accion.texto}
                                  </a>
                                )}
                              </div>
                            </motion.div>
                          ))
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* selector tema */}
              <div className="relative group">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className={`p-3 rounded-xl ${tema.colores.secundario} ${tema.colores.texto}`}
                >
                  <tema.icono className="w-5 h-5" />
                </motion.button>
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  whileHover={{ opacity: 1, y: 0 }}
                  className={`absolute top-full right-0 mt-2 w-48 rounded-xl ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 p-2 z-50`}
                >
                  {Object.entries(TEMAS).map(([key, t]) => (
                    <motion.button
                      key={key}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setTemaActual(key as TemaColor)}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg font-semibold ${
                        temaActual === key
                          ? `bg-gradient-to-r ${tema.colores.gradiente} text-white`
                          : `${tema.colores.hover} ${tema.colores.texto}`
                      }`}
                    >
                      <t.icono className="w-4 h-4" />
                      <span className="text-sm">{t.nombre}</span>
                    </motion.button>
                  ))}
                </motion.div>
              </div>

              {/* perfil */}
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className={`text-sm font-bold ${tema.colores.texto}`}>
                    Dr. {usuario.nombre} {usuario.apellido_paterno}
                  </p>
                  <p className={`text-xs ${tema.colores.textoSecundario}`}>
                    {usuario.medico.especialidades[0]?.nombre ||
                      "Médico General"}
                  </p>
                </div>
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  className={`w-12 h-12 rounded-xl bg-gradient-to-br ${tema.colores.gradiente} flex items-center justify-center text-white font-bold shadow-lg cursor-pointer`}
                  onClick={() => router.push("/perfil")}
                >
                  {usuario.foto_perfil_url ? (
                    <Image
                      src={usuario.foto_perfil_url}
                      alt={usuario.nombre}
                      width={48}
                      height={48}
                      className="rounded-xl object-cover"
                    />
                  ) : (
                    `${usuario.nombre[0]}${usuario.apellido_paterno[0]}`
                  )}
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      </motion.header>

      {/* LAYOUT */}
      <div className="flex">
        {/* SIDEBAR */}
        <AnimatePresence>
          {sidebarAbierto && (
            <motion.aside
              initial={{ x: -320, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -320, opacity: 0 }}
              transition={{ type: "spring", stiffness: 100 }}
              className={`w-80 ${tema.colores.sidebar} ${tema.colores.borde} border-r ${tema.colores.sombra} sticky top-[73px] h-[calc(100vh-73px)] overflow-hidden`}
            >
              <div className="p-6 space-y-6 overflow-y-auto h-full custom-scrollbar">
                {/* FILTROS */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className={`rounded-xl ${tema.colores.card} ${tema.colores.borde} border p-4`}
                >
                  <h3
                    className={`text-sm font-black ${tema.colores.texto} mb-3 flex items-center gap-2`}
                  >
                    <Filter className="w-4 h-4" />
                    FILTROS
                  </h3>
                  <div className="space-y-3">
                    {/* periodo */}
                    <div>
                      <label
                        className={`text-xs font-semibold ${tema.colores.textoSecundario} mb-2 block`}
                      >
                        Período
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          { id: "hoy", label: "Hoy", icon: Calendar },
                          { id: "semana", label: "Semana", icon: Calendar },
                          { id: "mes", label: "Mes", icon: Calendar },
                          { id: "todas", label: "Todas", icon: History },
                        ].map((vista) => (
                          <motion.button
                            key={vista.id}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => {
                              setVistaActual(vista.id as any);
                              // si es hoy/semana/mes, también muevo las estadísticas
                              if (
                                vista.id === "hoy" ||
                                vista.id === "semana" ||
                                vista.id === "mes"
                              ) {
                                setPeriodoEstadisticas(vista.id);
                                cargarEstadisticas(vista.id);
                              }
                            }}
                            className={`px-3 py-2 rounded-lg font-bold text-xs flex items-center justify-center gap-2 ${
                              vistaActual === vista.id
                                ? `bg-gradient-to-r ${tema.colores.gradiente} text-white`
                                : `${tema.colores.secundario} ${tema.colores.texto}`
                            }`}
                          >
                            <vista.icon className="w-3 h-3" />
                            {vista.label}
                          </motion.button>
                        ))}
                      </div>
                    </div>

                    {/* estado */}
                    <div>
                      <label
                        className={`text-xs font-semibold ${tema.colores.textoSecundario} mb-2 block`}
                      >
                        Estado
                      </label>
                      <select
                        value={filtroEstado}
                        onChange={(e) =>
                          setFiltroEstado(e.target.value as any)
                        }
                        className={`w-full px-3 py-2 rounded-lg ${tema.colores.secundario} ${tema.colores.texto} text-sm`}
                      >
                        <option value="todas">Todas</option>
                        <option value="programada">Programadas</option>
                        <option value="en_espera">En Espera</option>
                        <option value="en_curso">En Curso</option>
                        <option value="finalizada">Finalizadas</option>
                        <option value="cancelada">Canceladas</option>
                      </select>
                    </div>

                    {/* tipo de vista */}
                    <div>
                      <label
                        className={`text-xs font-semibold ${tema.colores.textoSecundario} mb-2 block`}
                      >
                        Tipo de Vista
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { id: "cards", label: "Cards", icon: ClipboardList },
                          { id: "lista", label: "Lista", icon: Video },
                          { id: "calendario", label: "Cal", icon: Calendar },
                        ].map((vista) => (
                          <motion.button
                            key={vista.id}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setTipoVista(vista.id as TipoVista)}
                            className={`px-2 py-2 rounded-lg font-bold text-xs flex flex-col items-center gap-1 ${
                              tipoVista === vista.id
                                ? `bg-gradient-to-r ${tema.colores.gradiente} text-white`
                                : `${tema.colores.secundario} ${tema.colores.texto}`
                            }`}
                          >
                            <vista.icon className="w-4 h-4" />
                            {vista.label}
                          </motion.button>
                        ))}
                      </div>
                    </div>

                    {/* búsqueda */}
                    <div>
                      <label
                        className={`text-xs font-semibold ${tema.colores.textoSecundario} mb-2 block`}
                      >
                        Buscar Paciente
                      </label>
                      <div className="relative">
                        <Search
                          className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${tema.colores.textoSecundario}`}
                        />
                        <input
                          value={busqueda}
                          onChange={(e) => setBusqueda(e.target.value)}
                          placeholder="Nombre, email, teléfono..."
                          className={`w-full pl-10 pr-4 py-2 rounded-lg ${tema.colores.secundario} ${tema.colores.texto} text-sm`}
                        />
                        {busqueda && (
                          <motion.button
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            onClick={() => setBusqueda("")}
                            className={`absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-full ${tema.colores.hover}`}
                          >
                            <X className="w-3 h-3" />
                          </motion.button>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* ACCIONES RÁPIDAS */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className={`rounded-xl ${tema.colores.card} ${tema.colores.borde} border p-4`}
                >
                  <h3
                    className={`text-sm font-black ${tema.colores.texto} mb-3 flex items-center gap-2`}
                  >
                    <Zap className="w-4 h-4" />
                    ACCIONES RÁPIDAS
                  </h3>
                  <div className="space-y-2">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={crearNuevaSesion}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg ${tema.colores.primario} text-white font-bold text-sm`}
                    >
                      <Plus className="w-4 h-4" />
                      Nueva Sesión
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={verAgenda}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg ${tema.colores.secundario} ${tema.colores.texto} font-bold text-sm`}
                    >
                      <Calendar className="w-4 h-4" />
                      Ver Agenda
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={verHistorial}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg ${tema.colores.secundario} ${tema.colores.texto} font-bold text-sm`}
                    >
                      <History className="w-4 h-4" />
                      Historial
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={abrirConfiguracion}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg ${tema.colores.secundario} ${tema.colores.texto} font-bold text-sm`}
                    >
                      <Settings className="w-4 h-4" />
                      Configuración
                    </motion.button>
                  </div>
                </motion.div>

                {/* RESUMEN LATERAL */}
                {estadisticas && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className={`rounded-xl ${tema.colores.card} ${tema.colores.borde} border p-4`}
                  >
                    <h3
                      className={`text-sm font-black ${tema.colores.texto} mb-3 flex items-center gap-2`}
                    >
                      <BarChart3 className="w-4 h-4" />
                      RESUMEN HOY
                    </h3>
                    <div className="space-y-3">
                      <div
                        className={`p-3 rounded-lg ${tema.colores.secundario}`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span
                            className={`text-xs ${tema.colores.textoSecundario}`}
                          >
                            Total Sesiones
                          </span>
                          <span
                            className={`text-lg font-black ${tema.colores.texto}`}
                          >
                            {estadisticas.total_sesiones_hoy}
                          </span>
                        </div>
                        <div className="w-full h-1 bg-gray-700 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{
                              width: `${
                                estadisticas.total_sesiones_hoy > 0
                                  ? (estadisticas.sesiones_completadas /
                                      estadisticas.total_sesiones_hoy) *
                                    100
                                  : 0
                              }%`,
                            }}
                            transition={{ duration: 1, delay: 0.5 }}
                            className="h-full bg-gradient-to-r from-green-500 to-emerald-500"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <motion.div
                          whileHover={{ scale: 1.05 }}
                          className={`p-3 rounded-lg ${tema.colores.secundario} text-center cursor-pointer`}
                          onClick={verHistorial}
                        >
                          <p
                            className={`text-xs ${tema.colores.textoSecundario}`}
                          >
                            Completadas
                          </p>
                          <p className={`text-xl font-black text-green-400`}>
                            {estadisticas.sesiones_completadas}
                          </p>
                        </motion.div>
                        <motion.div
                          whileHover={{ scale: 1.05 }}
                          className={`p-3 rounded-lg ${tema.colores.secundario} text-center cursor-pointer`}
                          onClick={() => {
                            setFiltroEstado("en_espera");
                            setVistaActual("todas");
                          }}
                        >
                          <p
                            className={`text-xs ${tema.colores.textoSecundario}`}
                          >
                            Pendientes
                          </p>
                          <p className={`text-xl font-black text-yellow-400`}>
                            {estadisticas.sesiones_pendientes}
                          </p>
                        </motion.div>
                      </div>

                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        className={`p-3 rounded-lg ${tema.colores.secundario} cursor-pointer`}
                        onClick={() => router.push("/medico/evaluaciones")}
                      >
                        <div className="flex items-center justify-between">
                          <span
                            className={`text-xs ${tema.colores.textoSecundario}`}
                          >
                            Calificación
                          </span>
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                            <span
                              className={`text-lg font-black ${tema.colores.texto}`}
                            >
                              {estadisticas.calificacion_promedio.toFixed(1)}
                            </span>
                          </div>
                        </div>
                      </motion.div>
                    </div>
                  </motion.div>
                )}

                {/* soporte */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className={`rounded-xl bg-gradient-to-br from-indigo-900/50 to-purple-900/50 border border-indigo-500/30 p-4`}
                >
                  <h3 className="text-sm font-black text-white mb-2 flex items-center gap-2">
                    <Signal className="w-4 h-4" />
                    SOPORTE TÉCNICO
                  </h3>
                  <p className="text-xs text-white/80 mb-3">
                    ¿Problemas con la conexión o el video?
                  </p>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() =>
                      window.open(
                        "mailto:soporte@anyssa.cl?subject=Soporte%20Telemedicina",
                        "_blank"
                      )
                    }
                    className="w-full px-4 py-2 bg-white/20 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-2"
                  >
                    <Phone className="w-4 h-4" />
                    Contactar Soporte
                  </motion.button>
                </motion.div>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* CONTENIDO */}
        <main className="flex-1 p-6 space-y-6">
          {/* CARDS ESTADÍSTICAS */}
          {mostrarEstadisticas && (
            <>
              {loadingEstadisticas ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className={`rounded-2xl ${tema.colores.card} ${tema.colores.borde} border p-6 animate-pulse`}
                    >
                      <div className="w-14 h-14 bg-gray-300/30 rounded-xl mb-4" />
                      <div className="h-6 bg-gray-300/30 rounded mb-2" />
                      <div className="h-4 bg-gray-300/20 rounded w-1/2" />
                    </div>
                  ))}
                </div>
              ) : (
                estadisticas && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
                  >
                    {/* total */}
                    <motion.div
                      whileHover={{ scale: 1.05, y: -5 }}
                      className={`rounded-2xl ${tema.colores.card} ${tema.colores.borde} border p-6 ${tema.colores.sombra} cursor-pointer`}
                      onClick={() => {
                        setVistaActual("hoy");
                        setFiltroEstado("todas");
                      }}
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg">
                          <Video className="w-7 h-7 text-white" />
                        </div>
                        <div className="text-right">
                          <motion.p
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className={`text-3xl font-black ${tema.colores.texto}`}
                          >
                            {estadisticas.total_sesiones_hoy}
                          </motion.p>
                          <p
                            className={`text-sm ${tema.colores.textoSecundario}`}
                          >
                            Sesiones Hoy
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-green-500" />
                        <span className="text-sm font-bold text-green-500">
                          +12% vs ayer
                        </span>
                      </div>
                    </motion.div>

                    {/* completadas */}
                    <motion.div
                      whileHover={{ scale: 1.05, y: -5 }}
                      className={`rounded-2xl ${tema.colores.card} ${tema.colores.borde} border p-6 ${tema.colores.sombra} cursor-pointer`}
                      onClick={() => {
                        setFiltroEstado("finalizada");
                        setVistaActual("todas");
                      }}
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center shadow-lg">
                          <CheckCircle2 className="w-7 h-7 text-white" />
                        </div>
                        <div className="text-right">
                          <motion.p
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.1 }}
                            className={`text-3xl font-black ${tema.colores.texto}`}
                          >
                            {estadisticas.sesiones_completadas}
                          </motion.p>
                          <p
                            className={`text-sm ${tema.colores.textoSecundario}`}
                          >
                            Completadas
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-blue-500" />
                        <span className="text-sm font-bold text-blue-500">
                          {estadisticas.tiempo_promedio_sesion} min promedio
                        </span>
                      </div>
                    </motion.div>

                    {/* pacientes */}
                    <motion.div
                      whileHover={{ scale: 1.05, y: -5 }}
                      className={`rounded-2xl ${tema.colores.card} ${tema.colores.borde} border p-6 ${tema.colores.sombra} cursor-pointer`}
                      onClick={() => router.push("/medico/pacientes")}
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center shadow-lg">
                          <Users className="w-7 h-7 text-white" />
                        </div>
                        <div className="text-right">
                          <motion.p
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.2 }}
                            className={`text-3xl font-black ${tema.colores.texto}`}
                          >
                            {estadisticas.pacientes_atendidos_mes}
                          </motion.p>
                          <p
                            className={`text-sm ${tema.colores.textoSecundario}`}
                          >
                            Pacientes/Mes
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                        <span className="text-sm font-bold text-yellow-500">
                          {estadisticas.calificacion_promedio.toFixed(1)}{" "}
                          calificación
                        </span>
                      </div>
                    </motion.div>

                    {/* ingresos */}
                    <motion.div
                      whileHover={{ scale: 1.05, y: -5 }}
                      className={`rounded-2xl ${tema.colores.card} ${tema.colores.borde} border p-6 ${tema.colores.sombra} cursor-pointer`}
                      onClick={() => router.push("/medico/finanzas")}
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg">
                          <DollarSign className="w-7 h-7 text-white" />
                        </div>
                        <div className="text-right">
                          <motion.p
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.3 }}
                            className={`text-3xl font-black ${tema.colores.texto}`}
                          >
                            ${(estadisticas.ingresos_mes / 1000).toFixed(0)}K
                          </motion.p>
                          <p
                            className={`text-sm ${tema.colores.textoSecundario}`}
                          >
                            Ingresos/Mes
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-green-500" />
                        <span className="text-sm font-bold text-green-500">
                          +8% vs mes anterior
                        </span>
                      </div>
                    </motion.div>
                  </motion.div>
                )
              )}
            </>
          )}

          {/* BARRA HERRAMIENTAS */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className={`rounded-2xl ${tema.colores.card} ${tema.colores.borde} border p-4 ${tema.colores.sombra}`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setMostrarEstadisticas(!mostrarEstadisticas)}
                  className={`px-4 py-2 rounded-lg ${tema.colores.secundario} ${tema.colores.texto} text-sm font-bold flex items-center gap-2`}
                >
                  <BarChart3 className="w-4 h-4" />
                  {mostrarEstadisticas ? "Ocultar" : "Mostrar"} Estadísticas
                </motion.button>

                {/* cambio rápido de período (solo estadísticas) */}
                <div className="flex items-center gap-2">
                  {(["hoy", "semana", "mes"] as const).map((p) => (
                    <button
                      key={p}
                      onClick={() => {
                        setPeriodoEstadisticas(p);
                        cargarEstadisticas(p);
                      }}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold ${
                        periodoEstadisticas === p
                          ? "bg-indigo-500 text-white"
                          : `${tema.colores.secundario} ${tema.colores.texto}`
                      }`}
                    >
                      {p === "hoy" ? "Hoy" : p === "semana" ? "Semana" : "Mes"}
                    </button>
                  ))}
                </div>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    cargarSesiones();
                    cargarEstadisticas(periodoEstadisticas);
                  }}
                  disabled={loadingSesiones || loadingEstadisticas}
                  className={`px-4 py-2 rounded-lg ${tema.colores.secundario} ${tema.colores.texto} text-sm font-bold flex items-center gap-2 disabled:opacity-50`}
                >
                  <RefreshCw
                    className={`w-4 h-4 ${
                      loadingSesiones || loadingEstadisticas
                        ? "animate-spin"
                        : ""
                    }`}
                  />
                  Actualizar
                </motion.button>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-sm ${tema.colores.textoSecundario}`}>
                  {sesionesFiltradas.length} sesiones
                </span>
              </div>
            </div>
          </motion.div>

          {/* LISTA SESIONES */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            id="sesiones"
            className={`rounded-2xl ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra}`}
          >
            <div className="p-6 border-b border-gray-800">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className={`text-2xl font-black ${tema.colores.texto}`}>
                    Sesiones de Telemedicina
                  </h2>
                  <p className={`text-sm ${tema.colores.textoSecundario}`}>
                    {sesionesFiltradas.length} sesiones encontradas •{" "}
                    {vistaActual === "hoy"
                      ? "Hoy"
                      : vistaActual === "semana"
                        ? "Esta semana"
                        : vistaActual === "mes"
                          ? "Este mes"
                          : "Todas"}
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6">
              {loadingSesiones ? (
                <div className="text-center py-12">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                  >
                    <Loader2
                      className={`w-12 h-12 ${tema.colores.textoSecundario} mx-auto mb-4`}
                    />
                  </motion.div>
                  <p className={`text-lg font-bold ${tema.colores.texto} mb-2`}>
                    Cargando sesiones...
                  </p>
                </div>
              ) : sesionesFiltradas.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-12"
                >
                  <Video
                    className={`w-16 h-16 ${tema.colores.textoSecundario} mx-auto mb-4`}
                  />
                  <p className={`text-lg font-bold ${tema.colores.texto} mb-2`}>
                    No hay sesiones
                  </p>
                  <p
                    className={`text-sm ${tema.colores.textoSecundario} mb-6`}
                  >
                    No se encontraron sesiones con los filtros aplicados
                  </p>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      setFiltroEstado("todas");
                      setVistaActual("todas");
                      setBusqueda("");
                    }}
                    className={`px-6 py-3 ${tema.colores.primario} text-white rounded-xl font-bold flex items-center gap-2 mx-auto`}
                  >
                    <RefreshCw className="w-4 h-4" />
                    Limpiar Filtros
                  </motion.button>
                </motion.div>
              ) : (
                <div className="space-y-4">
                  <AnimatePresence>
                    {sesionesFiltradas.map((sesion, index) => {
                      const IconoEstado = obtenerIconoEstado(sesion.estado);
                      const esExpandida = sesionExpandida === sesion.id_sesion;
                      return (
                        <motion.div
                          key={sesion.id_sesion}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          transition={{ delay: index * 0.05 }}
                          className={`rounded-xl ${tema.colores.secundario} ${tema.colores.borde} border p-6 hover:scale-[1.02] transition ${
                            sesion.estado === "en_espera"
                              ? "ring-2 ring-yellow-500/50 animate-pulse"
                              : ""
                          }`}
                        >
                          <div className="flex items-start justify-between gap-4">
                            {/* paciente */}
                            <div className="flex items-start gap-4 flex-1">
                              <motion.div
                                whileHover={{ scale: 1.1, rotate: 5 }}
                                className={`w-16 h-16 rounded-xl bg-gradient-to-br ${tema.colores.gradiente} flex items-center justify-center text-white font-bold text-xl shadow-lg cursor-pointer`}
                                onClick={() =>
                                  router.push(
                                    `/medico/pacientes/${sesion.id_paciente}`
                                  )
                                }
                              >
                                {sesion.paciente.foto_url ? (
                                  <Image
                                    src={sesion.paciente.foto_url}
                                    alt={sesion.paciente.nombre_completo}
                                    width={64}
                                    height={64}
                                    className="rounded-xl object-cover"
                                  />
                                ) : (
                                  sesion.paciente.nombre_completo
                                    .split(" ")
                                    .map((n) => n[0])
                                    .join("")
                                    .substring(0, 2)
                                )}
                              </motion.div>

                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2 flex-wrap">
                                  <h3
                                    className={`text-xl font-black ${tema.colores.texto}`}
                                  >
                                    {sesion.paciente.nombre_completo}
                                  </h3>
                                  <motion.span
                                    whileHover={{ scale: 1.1 }}
                                    className={`px-3 py-1 rounded-full text-xs font-bold border ${obtenerColorEstado(
                                      sesion.estado
                                    )} flex items-center gap-1`}
                                  >
                                    <IconoEstado className="w-3 h-3" />
                                    {obtenerTextoEstado(sesion.estado)}
                                  </motion.span>
                                  {sesion.cita.tipo_cita === "urgencia" && (
                                    <motion.span
                                      animate={{ scale: [1, 1.1, 1] }}
                                      transition={{
                                        duration: 1,
                                        repeat: Infinity,
                                      }}
                                      className="px-3 py-1 rounded-full text-xs font-bold bg-red-500/20 text-red-400 border border-red-500/30 flex items-center gap-1"
                                    >
                                      <Siren className="w-3 h-3" />
                                      URGENCIA
                                    </motion.span>
                                  )}
                                </div>

                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                                  <div>
                                    <p
                                      className={`text-xs ${tema.colores.textoSecundario}`}
                                    >
                                      Edad
                                    </p>
                                    <p
                                      className={`text-sm font-bold ${tema.colores.texto}`}
                                    >
                                      {sesion.paciente.edad} años
                                    </p>
                                  </div>
                                  <div>
                                    <p
                                      className={`text-xs ${tema.colores.textoSecundario}`}
                                    >
                                      Género
                                    </p>
                                    <p
                                      className={`text-sm font-bold ${tema.colores.texto}`}
                                    >
                                      {sesion.paciente.genero}
                                    </p>
                                  </div>
                                  <div>
                                    <p
                                      className={`text-xs ${tema.colores.textoSecundario}`}
                                    >
                                      Grupo Sanguíneo
                                    </p>
                                    <p
                                      className={`text-sm font-bold ${tema.colores.texto}`}
                                    >
                                      {sesion.paciente.grupo_sanguineo}
                                    </p>
                                  </div>
                                  <div>
                                    <p
                                      className={`text-xs ${tema.colores.textoSecundario}`}
                                    >
                                      Hora
                                    </p>
                                    <p
                                      className={`text-sm font-bold ${tema.colores.texto}`}
                                    >
                                      {formatearHora(
                                        sesion.fecha_hora_inicio_programada
                                      )}
                                    </p>
                                  </div>
                                </div>

                                <div className="flex items-center gap-2 mb-3">
                                  <ClipboardList
                                    className={`w-4 h-4 ${tema.colores.textoSecundario}`}
                                  />
                                  <p
                                    className={`text-sm ${tema.colores.texto}`}
                                  >
                                    <strong>Motivo:</strong>{" "}
                                    {sesion.cita.motivo || "No especificado"}
                                  </p>
                                </div>

                                {sesion.paciente.alergias.length > 0 && (
                                  <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="flex items-center gap-2 flex-wrap mb-2"
                                  >
                                    <AlertTriangle className="w-4 h-4 text-red-500" />
                                    <span className="text-xs font-bold text-red-400">
                                      ALERGIAS:
                                    </span>
                                    {sesion.paciente.alergias.map((alergia) => (
                                      <motion.span
                                        key={alergia}
                                        whileHover={{ scale: 1.1 }}
                                        className="px-2 py-1 bg-red-500/20 text-red-400 rounded-full text-xs font-bold border border-red-500/30"
                                      >
                                        {alergia}
                                      </motion.span>
                                    ))}
                                  </motion.div>
                                )}
                              </div>
                            </div>

                            {/* acciones */}
                            <div className="flex flex-col gap-2 ml-4">
                              {(sesion.estado === "en_espera" ||
                                sesion.estado === "programada") && (
                                <motion.button
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  onClick={() => entrarSala(sesion)}
                                  className={`px-6 py-3 bg-gradient-to-r ${tema.colores.gradiente} text-white rounded-xl font-bold flex items-center gap-2 ${tema.colores.sombra}`}
                                >
                                  <Video className="w-5 h-5" />
                                  Entrar a Sala
                                </motion.button>
                              )}
                              {sesion.estado === "en_curso" && (
                                <motion.button
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  onClick={() => entrarSala(sesion)}
                                  className={`px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl font-bold flex items-center gap-2 ${tema.colores.sombra} animate-pulse`}
                                >
                                  <Video className="w-5 h-5" />
                                  Reingresar
                                </motion.button>
                              )}
                              {sesion.estado === "finalizada" && (
                                <motion.button
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  onClick={() =>
                                    router.push(
                                      `/medico/telemedicina/pacientes/${sesion.id_paciente}/historial`
                                    )
                                  }
                                  className={`px-6 py-3 ${tema.colores.secundario} ${tema.colores.texto} rounded-xl font-bold flex items-center gap-2`}
                                >
                                  <Video className="w-5 h-5" />
                                  Ver Resumen
                                </motion.button>
                              )}

                              {/* menú 3 puntos */}
                              <div className="relative group">
                                <motion.button
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  className={`p-3 ${tema.colores.secundario} ${tema.colores.texto} rounded-xl`}
                                >
                                  <MoreVertical className="w-5 h-5" />
                                </motion.button>
                                <motion.div
                                  initial={{ opacity: 0, scale: 0.95, y: -10 }}
                                  whileHover={{ opacity: 1, scale: 1, y: 0 }}
                                  className={`absolute right-0 top-full mt-2 w-56 rounded-xl ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 overflow-hidden`}
                                >
                                  <div className="p-2">
                                    <motion.button
                                      whileHover={{ scale: 1.05 }}
                                      whileTap={{ scale: 0.95 }}
                                      onClick={() =>
                                        router.push(
                                          `/medico/pacientes/${sesion.id_paciente}`
                                        )
                                      }
                                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg ${tema.colores.hover} ${tema.colores.texto} text-sm`}
                                    >
                                      <User className="w-4 h-4" />
                                      Ver Perfil Paciente
                                    </motion.button>

                                    <motion.button
                                      whileHover={{ scale: 1.05 }}
                                      whileTap={{ scale: 0.95 }}
                                      onClick={() =>
                                        setSesionExpandida(
                                          esExpandida ? null : sesion.id_sesion
                                        )
                                      }
                                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg ${tema.colores.hover} ${tema.colores.texto} text-sm`}
                                    >
                                      {esExpandida ? (
                                        <>
                                          <ChevronDown className="w-4 h-4" />
                                          Ocultar Detalles
                                        </>
                                      ) : (
                                        <>
                                          <ChevronRight className="w-4 h-4" />
                                          Ver Detalles
                                        </>
                                      )}
                                    </motion.button>

                                    <div className="h-px bg-gray-700 my-2" />

                                    <motion.button
                                      whileHover={{ scale: 1.05 }}
                                      whileTap={{ scale: 0.95 }}
                                      onClick={() => enviarMensajePaciente(sesion)}
                                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg ${tema.colores.hover} ${tema.colores.texto} text-sm`}
                                    >
                                      <MessageSquare className="w-4 h-4" />
                                      Enviar Mensaje
                                    </motion.button>

                                    {sesion.estado === "programada" && (
                                      <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => cancelarSesion(sesion)}
                                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-red-500/20 text-red-400 text-sm`}
                                      >
                                        <X className="w-4 h-4" />
                                        Cancelar Sesión
                                      </motion.button>
                                    )}
                                  </div>
                                </motion.div>
                              </div>
                            </div>
                          </div>

                          {/* expandible */}
                          <AnimatePresence>
                            {esExpandida && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                className="mt-4 pt-4 border-t border-gray-700 space-y-4"
                              >
                                {sesion.cita.notas_previas && (
                                  <div className="flex items-start gap-2">
                                    <Info className="w-4 h-4 text-blue-400 mt-1" />
                                    <div className="flex-1">
                                      <p className="text-xs font-bold text-blue-400 mb-1">
                                        Notas Previas:
                                      </p>
                                      <p
                                        className={`text-sm ${tema.colores.texto} bg-blue-500/10 p-3 rounded-lg`}
                                      >
                                        {sesion.cita.notas_previas}
                                      </p>
                                    </div>
                                  </div>
                                )}

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                  <div
                                    className={`p-3 rounded-lg ${tema.colores.secundario}`}
                                  >
                                    <p
                                      className={`text-xs ${tema.colores.textoSecundario}`}
                                    >
                                      Proveedor
                                    </p>
                                    <p
                                      className={`text-sm font-bold ${tema.colores.texto}`}
                                    >
                                      {sesion.proveedor_servicio}
                                    </p>
                                  </div>
                                  {sesion.calidad_conexion && (
                                    <div
                                      className={`p-3 rounded-lg ${tema.colores.secundario}`}
                                    >
                                      <p
                                        className={`text-xs ${tema.colores.textoSecundario}`}
                                      >
                                        Calidad Conexión
                                      </p>
                                      <div className="flex items-center gap-2">
                                        <Signal className="w-4 h-4 text-green-400" />
                                        <span className="text-sm font-bold capitalize">
                                          {sesion.calidad_conexion}
                                        </span>
                                      </div>
                                    </div>
                                  )}
                                  {sesion.duracion_segundos && (
                                    <div
                                      className={`p-3 rounded-lg ${tema.colores.secundario}`}
                                    >
                                      <p
                                        className={`text-xs ${tema.colores.textoSecundario}`}
                                      >
                                        Duración
                                      </p>
                                      <p
                                        className={`text-sm font-bold ${tema.colores.texto}`}
                                      >
                                        {Math.floor(
                                          sesion.duracion_segundos / 60
                                        )}{" "}
                                        minutos
                                      </p>
                                    </div>
                                  )}
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div
                                    className={`p-3 rounded-lg ${tema.colores.secundario}`}
                                  >
                                    <p
                                      className={`text-xs ${tema.colores.textoSecundario}`}
                                    >
                                      Programada para
                                    </p>
                                    <p
                                      className={`text-sm font-bold ${tema.colores.texto}`}
                                    >
                                      {formatearFecha(
                                        sesion.fecha_hora_inicio_programada
                                      )}{" "}
                                      a las{" "}
                                      {formatearHora(
                                        sesion.fecha_hora_inicio_programada
                                      )}
                                    </p>
                                  </div>
                                  {sesion.fecha_hora_inicio_real && (
                                    <div
                                      className={`p-3 rounded-lg ${tema.colores.secundario}`}
                                    >
                                      <p
                                        className={`text-xs ${tema.colores.textoSecundario}`}
                                      >
                                        Inicio Real
                                      </p>
                                      <p
                                        className={`text-sm font-bold ${tema.colores.texto}`}
                                      >
                                        {formatearFecha(
                                          sesion.fecha_hora_inicio_real
                                        )}{" "}
                                        a las{" "}
                                        {formatearHora(
                                          sesion.fecha_hora_inicio_real
                                        )}
                                      </p>
                                    </div>
                                  )}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>

                          {/* contacto */}
                          <div className="mt-4 pt-4 border-t border-gray-700 flex items-center gap-4 flex-wrap">
                            {sesion.paciente.telefono && (
                              <motion.a
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                href={`tel:${sesion.paciente.telefono}`}
                                className={`flex items-center gap-2 px-3 py-2 rounded-lg ${tema.colores.secundario} ${tema.colores.texto}`}
                              >
                                <Phone className="w-4 h-4" />
                                <span className="text-sm font-semibold">
                                  {sesion.paciente.telefono}
                                </span>
                              </motion.a>
                            )}
                            {sesion.paciente.email && (
                              <motion.a
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                href={`mailto:${sesion.paciente.email}`}
                                className={`flex items-center gap-2 px-3 py-2 rounded-lg ${tema.colores.secundario} ${tema.colores.texto}`}
                              >
                                <Mail className="w-4 h-4" />
                                <span className="text-sm font-semibold">
                                  {sesion.paciente.email}
                                </span>
                              </motion.a>
                            )}
                            {sesion.calidad_conexion && (
                              <div
                                className={`flex items-center gap-2 px-3 py-2 rounded-lg ${obtenerColorCalidadConexion(
                                  sesion.calidad_conexion
                                )}`}
                              >
                                <Signal className="w-4 h-4" />
                                <span className="text-sm font-semibold capitalize">
                                  {sesion.calidad_conexion}
                                </span>
                              </div>
                            )}
                            <div
                              className={`flex items-center gap-2 px-3 py-2 rounded-lg ${tema.colores.secundario} ${tema.colores.texto}`}
                            >
                              <MapPin className="w-4 h-4" />
                              <span className="text-sm font-semibold">
                                ID: {sesion.id_sesion}
                              </span>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>
              )}
            </div>
          </motion.div>
        </main>
      </div>

      {/* FOOTER */}
      <motion.footer
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className={`${tema.colores.header} ${tema.colores.borde} border-t mt-12`}
      >
        <div className="max-w-[1920px] mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <motion.div
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.5 }}
                className={`w-10 h-10 rounded-lg bg-gradient-to-br ${tema.colores.gradiente} flex items-center justify-center`}
              >
                <Video className="w-5 h-5 text-white" />
              </motion.div>
              <div>
                <p className={`text-sm font-bold ${tema.colores.texto}`}>
                  AnySSA Telemedicina
                </p>
                <p className={`text-xs ${tema.colores.textoSecundario}`}>
                  Versión 2.0.0 - © 2024 Todos los derechos reservados
                </p>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <motion.a
                whileHover={{ scale: 1.05 }}
                href="#"
                onClick={irATerminos}
                className={`text-sm font-semibold ${tema.colores.textoSecundario}`}
              >
                Términos de Uso
              </motion.a>
              <motion.a
                whileHover={{ scale: 1.05 }}
                href="#"
                onClick={irAPrivacidad}
                className={`text-sm font-semibold ${tema.colores.textoSecundario}`}
              >
                Privacidad
              </motion.a>
              <motion.a
                whileHover={{ scale: 1.05 }}
                href="#"
                onClick={irASoporte}
                className={`text-sm font-semibold ${tema.colores.textoSecundario}`}
              >
                Soporte
              </motion.a>
              <motion.a
                whileHover={{ scale: 1.05 }}
                href="#"
                onClick={irADocumentacion}
                className={`text-sm font-semibold ${tema.colores.textoSecundario}`}
              >
                Documentación
              </motion.a>
            </div>
          </div>
        </div>
      </motion.footer>

      {/* scrollbar */}
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.1);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(99, 102, 241, 0.5);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(99, 102, 241, 0.8);
        }
      `}</style>
    </div>
  );
}
