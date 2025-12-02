// src/app/(dashboard)/tecnico/reportes/page.tsx
"use client";

import { useState, useEffect, useMemo } from "react";
import SidebarTecnico from "@/components/tecnico/SidebarTecnico";

import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

import {
  Activity,
  AlertCircle,
  AlertTriangle,
  AlertOctagon,
  Award,
  BarChart3,
  Bell,
  BellOff,
  Building2,
  Calendar,
  CalendarCheck,
  CalendarClock,
  CalendarDays,
  CalendarPlus,
  CalendarRange,
  Check,
  CheckCircle2,
  CheckSquare,
  ChevronDown,
  ChevronRight,
  ClipboardCheck,
  ClipboardList,
  Clock,
  Cpu,
  Database,
  DollarSign,
  Download,
  Eye,
  FileSpreadsheet,
  FileText,
  Flame,
  Gift,
  Globe,
  Hammer,
  HardDrive,
  Headset,
  Heart,
  HeartPulse,
  Home,
  Layers,
  Lightbulb,
  LineChart,
  Loader2,
  Lock,
  LogOut,
  Mail,
  MapPin,
  MessageSquare,
  Mic,
  Microscope,
  Moon,
  MoreVertical,
  Paperclip,
  Percent,
  Phone,
  PhoneCall,
  PhoneIncoming,
  PhoneOutgoing,
  PieChart,
  Pill,
  Plus,
  Printer,
  RefreshCw,
  Rocket,
  Search,
  Send,
  Settings,
  Share2,
  Shield,
  ShieldCheck,
  Sparkles,
  Square,
  Star,
  Stethoscope,
  Sun,
  Syringe,
  Target,
  TestTube,
  TrendingDown,
  TrendingUp,
  Upload,
  User,
  UserCheck,
  UserCog,
  UserPlus,
  UserX,
  Users,
  Video,
  Wifi,
  WifiOff,
  Wrench,
  X,
  Zap,
  ArrowUpRight,
  ArrowDownRight,
  BrainCircuit,
  Ambulance,
  GraduationCap,
  Handshake,
  Clock3,
} from "lucide-react";

import {
  LineChart as RechartsLineChart,
  Line,
  AreaChart,
  Area,
  BarChart as RechartsBarChart,
  Bar,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts";

// ========================================
// TIPOS
// ========================================

type TemaColor = "light" | "dark" | "blue" | "purple" | "green";

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
  tecnico?: {
    id_tecnico: number;
    id_centro: number;
    id_sucursal: number | null;
    id_departamento: number | null;
    area_tecnica: string;
    tipo_tecnico: "soporte" | "mantenimiento" | "ingenieria" | "biomedico";
    extension_telefonica: string | null;
    estado: "activo" | "inactivo" | "suspendido" | "vacaciones";
    disponibilidad: "disponible" | "ocupado" | "fuera_servicio";
    turno: "matutino" | "vespertino" | "nocturno" | "rotativo";
    nivel_acceso: "basico" | "intermedio" | "avanzado" | "administrador";
    pais: string;
    region: string;
    zona_horaria: string;
    centro: {
      id_centro: number;
      nombre: string;
      logo_url: string | null;
      ciudad: string;
      region: string;
    };
    es_global: boolean;
  };
}

interface EstadisticasTecnico {
  tickets_asignados_hoy: number;
  tickets_abiertos: number;
  tickets_en_progreso: number;
  tickets_resueltos_hoy: number;
  tickets_pendientes_confirmacion: number;
  tiempo_promedio_resolucion: number;
  mensajes_sin_leer: number;
  calificacion_promedio: number;
  disponibilidad_porcentaje: number;
  llamadas_realizadas_hoy: number;
  equipos_mantenidos_semana: number;
  tareas_pendientes: number;
  alertas_activas: number;
}

type RangoReporte = "hoy" | "7d" | "30d" | "anio" | "personalizado";

interface SerieTicketsSemana {
  dia: string;
  abiertos: number;
  en_progreso: number;
  resueltos: number;
}

interface SerieMantenimientoMes {
  mes: string;
  preventivo: number;
  correctivo: number;
  inspecciones: number;
}

interface DistribucionTicketTipo {
  nombre: string;
  valor: number;
  color: string;
}

interface EficienciaTecnico {
  categoria: string;
  valor: number;
}

interface ResumenCentro {
  id_centro: number;
  nombre_centro: string;
  ciudad: string;
  tickets_totales: number;
  tickets_resueltos: number;
  tickets_pendientes: number;
  sla_cumplido: number;
  calificacion_promedio: number;
}

interface AlertaTecnico {
  id_alerta: number;
  tipo: "equipo_falla" | "mantenimiento_vencido" | "ticket_urgente" | "equipo_critico";
  titulo: string;
  descripcion: string;
  prioridad: "baja" | "media" | "alta" | "critica";
  fecha_creacion: string;
  leida: boolean;
  url_accion: string | null;
}

interface MetricaRendimientoTecnico {
  nombre: string;
  valor_actual: number;
  valor_anterior: number;
  unidad: string;
  tendencia: "up" | "down" | "neutral";
  porcentaje_cambio: number;
  icono: any;
  color: string;
  descripcion: string;
}

interface ReportesTecnicoAPI {
  success: boolean;
  estadisticas: EstadisticasTecnico;
  series_tickets_semana: SerieTicketsSemana[];
  series_mantenimiento_mes: SerieMantenimientoMes[];
  distribucion_tickets_tipo: DistribucionTicketTipo[];
  eficiencia_tecnico: EficienciaTecnico[];
  resumen_centros: ResumenCentro[];
  metricas_rendimiento: MetricaRendimientoTecnico[];
}

// ========================================
// TEMAS
// ========================================

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
    nombre: "Azul Técnico",
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
    nombre: "Púrpura Industrial",
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
    nombre: "Verde Operacional",
    icono: HeartPulse,
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

// ========================================
// DATOS DEFAULT PARA GRÁFICOS (fallback)
// ========================================

const DATOS_TICKETS_SEMANA_DEFAULT: SerieTicketsSemana[] = [
  { dia: "Lun", abiertos: 8, en_progreso: 5, resueltos: 12 },
  { dia: "Mar", abiertos: 10, en_progreso: 6, resueltos: 14 },
  { dia: "Mié", abiertos: 7, en_progreso: 8, resueltos: 16 },
  { dia: "Jue", abiertos: 9, en_progreso: 7, resueltos: 13 },
  { dia: "Vie", abiertos: 6, en_progreso: 4, resueltos: 15 },
  { dia: "Sáb", abiertos: 3, en_progreso: 2, resueltos: 5 },
  { dia: "Dom", abiertos: 2, en_progreso: 1, resueltos: 3 },
];

const DATOS_MANTENIMIENTO_MES_DEFAULT: SerieMantenimientoMes[] = [
  { mes: "Ene", preventivo: 15, correctivo: 8, inspecciones: 20 },
  { mes: "Feb", preventivo: 18, correctivo: 6, inspecciones: 22 },
  { mes: "Mar", preventivo: 20, correctivo: 7, inspecciones: 25 },
  { mes: "Abr", preventivo: 22, correctivo: 5, inspecciones: 28 },
  { mes: "May", preventivo: 19, correctivo: 9, inspecciones: 24 },
  { mes: "Jun", preventivo: 25, correctivo: 4, inspecciones: 30 },
];

const DATOS_TIPOS_TICKETS_DEFAULT: DistribucionTicketTipo[] = [
  { nombre: "Soporte", valor: 35, color: "#3b82f6" },
  { nombre: "Mantenimiento", valor: 28, color: "#10b981" },
  { nombre: "Ingeniería", valor: 18, color: "#f59e0b" },
  { nombre: "Biomédico", valor: 12, color: "#8b5cf6" },
  { nombre: "Infraestructura", valor: 7, color: "#ef4444" },
];

const DATOS_EFICIENCIA_TECNICO_DEFAULT: EficienciaTecnico[] = [
  { categoria: "Resolución", valor: 95 },
  { categoria: "Puntualidad", valor: 92 },
  { categoria: "Calidad", valor: 96 },
  { categoria: "Disponibilidad", valor: 94 },
  { categoria: "Comunicación", valor: 98 },
];

// ========================================
// COMPONENTE PRINCIPAL
// ========================================

export default function ReportesTecnicoPage() {
  const pathname = usePathname();

  // Sesión / estado general
  const [usuario, setUsuario] = useState<UsuarioSesion | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingReportes, setLoadingReportes] = useState(true);

  const [estadisticas, setEstadisticas] = useState<EstadisticasTecnico | null>(null);

  const [datosTicketsSemana, setDatosTicketsSemana] = useState<SerieTicketsSemana[]>(
    DATOS_TICKETS_SEMANA_DEFAULT
  );
  const [datosMantenimientoMes, setDatosMantenimientoMes] =
    useState<SerieMantenimientoMes[]>(DATOS_MANTENIMIENTO_MES_DEFAULT);
  const [datosTiposTickets, setDatosTiposTickets] = useState<DistribucionTicketTipo[]>(
    DATOS_TIPOS_TICKETS_DEFAULT
  );
  const [datosEficienciaTecnico, setDatosEficienciaTecnico] =
    useState<EficienciaTecnico[]>(DATOS_EFICIENCIA_TECNICO_DEFAULT);
  const [resumenCentros, setResumenCentros] = useState<ResumenCentro[]>([]);
  const [metricasRendimiento, setMetricasRendimiento] = useState<MetricaRendimientoTecnico[]>(
    []
  );
  const [alertas, setAlertas] = useState<AlertaTecnico[]>([]);

  const [temaActual, setTemaActual] = useState<TemaColor>("light");
  const [sidebarAbierto, setSidebarAbierto] = useState(true);
  const [notificacionesAbiertas, setNotificacionesAbiertas] = useState(false);
  const [perfilAbierto, setPerfilAbierto] = useState(false);
  const [busqueda, setBusqueda] = useState("");
  const [disponibilidad, setDisponibilidad] = useState<
    "disponible" | "ocupado" | "fuera_servicio"
  >("disponible");
  const [rangoReporte, setRangoReporte] = useState<RangoReporte>("30d");

  const tema = useMemo(() => TEMAS[temaActual], [temaActual]);

  // ========================================
  // MENÚ LATERAL
  // ========================================

 

  // ========================================
  // EFECTOS
  // ========================================

  // Tema guardado
  useEffect(() => {
    if (typeof window !== "undefined") {
      const temaGuardado = localStorage.getItem("tema_tecnico") as TemaColor | null;
      if (temaGuardado && TEMAS[temaGuardado]) {
        setTemaActual(temaGuardado);
      }
    }
  }, []);

  // Fondo / body
  useEffect(() => {
    document.body.className = `bg-gradient-to-br ${tema.colores.fondo} min-h-screen transition-all duration-500`;
  }, [tema]);

  // Cargar usuario
  useEffect(() => {
    const cargarDatosUsuario = async () => {
      try {
        setLoading(true);

        const response = await fetch("/api/auth/session", {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        });

        if (!response.ok) {
          throw new Error("No hay sesión activa");
        }

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

          const tieneRolTecnico = rolesUsuario.some(
            (rol) => rol.includes("TECNICO") || rol.includes("SOPORTE")
          );

          if (!tieneRolTecnico) {
            alert(
              `Acceso denegado. Este panel de reportes es solo para técnicos. Tus roles actuales son: ${rolesUsuario.join(
                ", "
              )}`
            );
            window.location.href = "/";
            return;
          }

          if (!result.usuario.tecnico) {
            alert(
              "Tu usuario tiene rol de TÉCNICO pero no está vinculado a un registro de técnico. Contacta al administrador."
            );
            window.location.href = "/";
            return;
          }

          setUsuario(result.usuario);
          setDisponibilidad(result.usuario.tecnico.disponibilidad);
        } else {
          window.location.href = "/login";
        }
      } catch (error) {
        console.error("Error al cargar usuario:", error);
        alert("Error al verificar sesión. Serás redirigido al login.");
        window.location.href = "/login";
      } finally {
        setLoading(false);
      }
    };

    cargarDatosUsuario();
  }, []);

  // Cargar reportes cuando hay usuario técnico
  useEffect(() => {
    if (usuario?.tecnico?.id_tecnico) {
      cargarReportes(rangoReporte);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [usuario]);

  // Refresh periódico
  useEffect(() => {
    if (!usuario?.tecnico?.id_tecnico) return;

    const interval = setInterval(() => {
      cargarReportes(rangoReporte);
    }, 300000); // 5 min

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [usuario, rangoReporte]);

  // ========================================
  // FUNCIONES
  // ========================================

  const cargarReportes = async (rango: RangoReporte) => {
    if (!usuario?.tecnico?.id_tecnico) return;

    try {
      setLoadingReportes(true);

      const params = new URLSearchParams({
        id_tecnico: String(usuario.tecnico.id_tecnico),
        rango,
      });

      const res = await fetch(`/api/tecnico/reportes?${params.toString()}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      const data: ReportesTecnicoAPI = await res.json().catch(() => ({
        success: false,
      })) as any;

      if (!res.ok || !data.success) {
        console.error("Error al cargar reportes técnico:", data);
        return;
      }

      setEstadisticas(data.estadisticas || null);
      setDatosTicketsSemana(
        data.series_tickets_semana && data.series_tickets_semana.length > 0
          ? data.series_tickets_semana
          : DATOS_TICKETS_SEMANA_DEFAULT
      );
      setDatosMantenimientoMes(
        data.series_mantenimiento_mes && data.series_mantenimiento_mes.length > 0
          ? data.series_mantenimiento_mes
          : DATOS_MANTENIMIENTO_MES_DEFAULT
      );
      setDatosTiposTickets(
        data.distribucion_tickets_tipo && data.distribucion_tickets_tipo.length > 0
          ? data.distribucion_tickets_tipo
          : DATOS_TIPOS_TICKETS_DEFAULT
      );
      setDatosEficienciaTecnico(
        data.eficiencia_tecnico && data.eficiencia_tecnico.length > 0
          ? data.eficiencia_tecnico
          : DATOS_EFICIENCIA_TECNICO_DEFAULT
      );
      setResumenCentros(data.resumen_centros || []);
      setMetricasRendimiento(data.metricas_rendimiento || []);
      setAlertas((prev) => prev); // puedes añadir alertas desde el API si quieres
      setRangoReporte(rango);
    } catch (err) {
      console.error("Error al cargar reportes:", err);
    } finally {
      setLoadingReportes(false);
    }
  };

  const cambiarDisponibilidad = async (
    nuevoEstado: "disponible" | "ocupado" | "fuera_servicio"
  ) => {
    if (!usuario?.tecnico?.id_tecnico) return;

    try {
      const response = await fetch(
        `/api/tecnico/${usuario.tecnico.id_tecnico}/disponibilidad`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ disponibilidad: nuevoEstado }),
        }
      );

      if (response.ok) {
        setDisponibilidad(nuevoEstado);
        alert(`Estado actualizado a: ${nuevoEstado}`);
      } else {
        alert("Error al actualizar disponibilidad");
      }
    } catch (error) {
      console.error("Error al cambiar disponibilidad:", error);
      alert("Error al actualizar disponibilidad");
    }
  };

  const cerrarSesion = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });

      window.location.href = "/login";
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  const cambiarTema = async (nuevoTema: TemaColor) => {
    setTemaActual(nuevoTema);
    if (typeof window !== "undefined") {
      localStorage.setItem("tema_tecnico", nuevoTema);
    }

    try {
      await fetch("/api/users/preferencias/tema", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ tema_color: nuevoTema }),
      });
    } catch (err) {
      console.error("No se pudo guardar preferencia en BD:", err);
    }
  };

  const formatearFecha = (fecha: string) => {
    const date = new Date(fecha);
    if (isNaN(date.getTime())) return "Sin fecha";
    return new Intl.DateTimeFormat("es-CL", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(date);
  };

  const obtenerColorEstado = (estado: string) => {
    const isDark = ["dark", "blue", "purple", "green"].includes(temaActual);
    const colores: { [key: string]: string } = {
      abierto: isDark
        ? "bg-red-500/20 text-red-400 border-red-500/30"
        : "bg-red-100 text-red-800 border-red-200",
      en_progreso: isDark
        ? "bg-blue-500/20 text-blue-400 border-blue-500/30"
        : "bg-blue-100 text-blue-800 border-blue-200",
      resuelto: isDark
        ? "bg-green-500/20 text-green-400 border-green-500/30"
        : "bg-green-100 text-green-800 border-green-200",
      cancelado: isDark
        ? "bg-gray-500/20 text-gray-400 border-gray-500/30"
        : "bg-gray-100 text-gray-800 border-gray-200",
      pendiente: isDark
        ? "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
        : "bg-yellow-100 text-yellow-800 border-yellow-200",
      completada: isDark
        ? "bg-green-500/20 text-green-400 border-green-500/30"
        : "bg-green-100 text-green-800 border-green-200",
    };

    return (
      colores[estado.toLowerCase()] ||
      (isDark
        ? "bg-gray-500/20 text-gray-400 border-gray-500/30"
        : "bg-gray-100 text-gray-800 border-gray-200")
    );
  };

  const obtenerColorRango = (r: RangoReporte) =>
    rangoReporte === r
      ? "bg-gradient-to-r from-indigo-500 to-purple-500 text-white"
      : `${tema.colores.secundario} ${tema.colores.texto}`;

  const obtenerTextoRango = (r: RangoReporte) => {
    switch (r) {
      case "hoy":
        return "Hoy";
      case "7d":
        return "Últimos 7 días";
      case "30d":
        return "Últimos 30 días";
      case "anio":
        return "Año actual";
      case "personalizado":
        return "Rango personalizado";
      default:
        return r;
    }
  };

  const kpisPrincipales = useMemo(() => {
    const totalTickets =
      (estadisticas?.tickets_abiertos || 0) +
      (estadisticas?.tickets_en_progreso || 0) +
      (estadisticas?.tickets_resueltos_hoy || 0);

    return [
      {
        titulo: "Tickets Totales",
        valor: totalTickets,
        descripcion: "Sumatoria en el rango seleccionado",
        icono: ClipboardList,
        color: "from-indigo-500 to-purple-500",
        extra: `${estadisticas?.tickets_resueltos_hoy || 0} resueltos hoy`,
      },
      {
        titulo: "Tickets Abiertos",
        valor: estadisticas?.tickets_abiertos ?? 0,
        descripcion: "Pendientes de resolución",
        icono: AlertOctagon,
        color: "from-orange-500 to-red-500",
        extra: `${estadisticas?.tickets_en_progreso || 0} en progreso`,
      },
      {
        titulo: "Tiempo Promedio",
        valor: estadisticas?.tiempo_promedio_resolucion ?? 0,
        descripcion: "Minutos promedio de resolución",
        icono: Clock3,
        color: "from-blue-500 to-cyan-500",
        extra: "Menor es mejor",
      },
      {
        titulo: "Calificación Promedio",
        valor: estadisticas?.calificacion_promedio
          ? estadisticas.calificacion_promedio.toFixed(1)
          : "0.0",
        descripcion: "Satisfacción de usuarios",
        icono: Star,
        color: "from-yellow-500 to-amber-500",
        extra: "Escala 1.0 a 5.0",
      },
    ];
  }, [estadisticas]);

  // ========================================
  // RENDER LOADING / ACCESO
  // ========================================

  if (loading) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center bg-gradient-to-br ${tema.colores.fondo}`}
      >
        <div className="text-center">
          <div className="relative mb-8">
            <div className="w-32 h-32 border-4 border-indigo-400 border-t-transparent rounded-full animate-spin"></div>
            <div
              className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-20 h-20 bg-gradient-to-br ${tema.colores.gradiente} rounded-full flex items-center justify-center animate-pulse`}
            >
              <BarChart3 className="w-10 h-10 text-white" />
            </div>
          </div>
          <h2 className={`text-4xl font-black mb-4 ${tema.colores.texto}`}>
            Cargando Reportes Técnicos
          </h2>
          <p
            className={`text-lg font-semibold ${tema.colores.textoSecundario} animate-pulse`}
          >
            Preparando tus métricas y gráficos...
          </p>
        </div>
      </div>
    );
  }

  if (!usuario || !usuario.tecnico) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center bg-gradient-to-br ${tema.colores.fondo}`}
      >
        <div
          className={`text-center max-w-md mx-auto p-8 rounded-3xl ${tema.colores.card} ${tema.colores.sombra} ${tema.colores.borde} border`}
        >
          <div
            className={`w-24 h-24 bg-gradient-to-br ${tema.colores.gradiente} rounded-3xl flex items-center justify-center mx-auto mb-6 animate-pulse`}
          >
            <AlertTriangle className="w-12 h-12 text-white" />
          </div>
          <h2 className={`text-3xl font-black mb-4 ${tema.colores.texto}`}>
            Acceso No Autorizado
          </h2>
          <p className={`text-lg mb-8 ${tema.colores.textoSecundario}`}>
            No tienes permisos para acceder al panel de reportes técnicos.
          </p>
          <Link
            href="/login"
            className={`inline-flex items-center gap-3 px-8 py-4 ${tema.colores.primario} text-white rounded-2xl font-bold text-lg transition-all duration-300 hover:scale-105 ${tema.colores.sombra}`}
          >
            <LogOut className="w-5 h-5" />
            Ir al Login
          </Link>
        </div>
      </div>
    );
  }

  // ========================================
  // RENDER COMPLETO
  // ========================================

  return (
    <div
      className={`min-h-screen transition-all duration-500 bg-gradient-to-br ${tema.colores.fondo}`}
    >
      {/* SIDEBAR */}
           <SidebarTecnico
        usuario={usuario}
        tema={tema}
        sidebarAbierto={sidebarAbierto}
        setSidebarAbierto={setSidebarAbierto}
        estadisticas={estadisticas}
      />


      {/* HEADER */}
      <header
        className={`fixed top-0 right-0 z-40 transition-all duration-300 ${
          sidebarAbierto ? "left-72" : "left-20"
        } ${tema.colores.header} ${tema.colores.borde} border-b ${tema.colores.sombra}`}
      >
        <div className="flex items-center justify-between px-8 py-4">
          {/* Búsqueda */}
          <div className="flex-1 max-w-2xl">
            <div className="relative">
              <Search
                className={`absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 ${tema.colores.textoSecundario}`}
              />
              <input
                type="text"
                placeholder="Buscar ticket, centro, indicador..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className={`w-full pl-12 pr-4 py-3 rounded-xl ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto} placeholder:${tema.colores.textoSecundario} focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all duration-300`}
              />
              {busqueda && (
                <button
                  onClick={() => setBusqueda("")}
                  className={`absolute right-4 top-1/2 transform -translate-y-1/2 p-1 rounded-lg ${tema.colores.hover}`}
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Acciones header */}
          <div className="flex items-center gap-3 ml-6">
            {/* Temas */}
            <div className="relative group">
              <button
                className={`p-3 rounded-xl font-semibold transition-all duration-300 ${tema.colores.secundario} ${tema.colores.texto}`}
              >
                <Sparkles className="w-5 h-5" />
              </button>

              <div
                className={`absolute right-0 mt-2 w-64 rounded-2xl ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 p-4 space-y-2`}
              >
                <p className={`text-sm font-bold mb-3 ${tema.colores.texto}`}>
                  Seleccionar Tema
                </p>
                {Object.entries(TEMAS).map(([key, t]) => (
                  <button
                    key={key}
                    onClick={() => cambiarTema(key as TemaColor)}
                    className={`w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl font-semibold transition-all duration-300 ${
                      temaActual === key
                        ? `bg-gradient-to-r ${t.colores.gradiente} text-white`
                        : `${tema.colores.hover} ${tema.colores.texto}`
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <t.icono className="w-5 h-5" />
                      <span>{t.nombre}</span>
                    </div>
                    {temaActual === key && <Check className="w-5 h-5" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Alertas */}
            <div className="relative">
              <button
                onClick={() =>
                  setNotificacionesAbiertas(!notificacionesAbiertas)
                }
                className={`relative p-3 rounded-xl font-semibold transition-all duration-300 ${tema.colores.secundario} ${tema.colores.texto}`}
              >
                <AlertCircle className="w-5 h-5" />
                {alertas.filter((a) => !a.leida).length > 0 && (
                  <span className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center animate-pulse">
                    {alertas.filter((a) => !a.leida).length > 9
                      ? "9+"
                      : alertas.filter((a) => !a.leida).length}
                  </span>
                )}
              </button>

              {notificacionesAbiertas && (
                <div
                  className={`absolute right-0 mt-2 w-96 rounded-2xl ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} max-h-96 overflow-y-auto`}
                >
                  <div
                    className={`p-4 border-b ${tema.colores.borde} sticky top-0 ${tema.colores.card}`}
                  >
                    <h3
                      className={`text-lg font-black ${tema.colores.texto}`}
                    >
                      Alertas Activas
                    </h3>
                  </div>

                  {alertas.length === 0 ? (
                    <div className="p-8 text-center">
                      <BellOff
                        className={`w-12 h-12 mx-auto mb-3 ${tema.colores.textoSecundario}`}
                      />
                      <p
                        className={`text-sm ${tema.colores.textoSecundario}`}
                      >
                        No tienes alertas activas
                      </p>
                    </div>
                  ) : (
                    <div className={`divide-y ${tema.colores.borde}`}>
                      {alertas.slice(0, 5).map((alerta) => (
                        <div
                          key={alerta.id_alerta}
                          className={`p-4 ${tema.colores.hover} transition-colors cursor-pointer ${
                            !alerta.leida ? "bg-indigo-500/5" : ""
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div
                              className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${obtenerColorEstado(
                                alerta.prioridad
                              )}`}
                            >
                              <AlertCircle className="w-5 h-5" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p
                                className={`text-sm font-bold mb-1 ${tema.colores.texto}`}
                              >
                                {alerta.titulo}
                              </p>
                              <p
                                className={`text-xs mb-2 ${tema.colores.textoSecundario}`}
                              >
                                {alerta.descripcion}
                              </p>
                              <p
                                className={`text-xs font-medium ${tema.colores.textoSecundario}`}
                              >
                                {alerta?.fecha_creacion
                                  ? formatearFecha(alerta.fecha_creacion)
                                  : "Sin fecha"}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Disponibilidad */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => cambiarDisponibilidad("disponible")}
                className={`px-4 py-2 rounded-xl font-semibold text-sm transition-all duration-300 ${
                  disponibilidad === "disponible"
                    ? "bg-green-600 text-white"
                    : `${tema.colores.secundario} ${tema.colores.texto}`
                }`}
              >
                ✓ Disponible
              </button>
              <button
                onClick={() => cambiarDisponibilidad("ocupado")}
                className={`px-4 py-2 rounded-xl font-semibold text-sm transition-all duration-300 ${
                  disponibilidad === "ocupado"
                    ? "bg-yellow-600 text-white"
                    : `${tema.colores.secundario} ${tema.colores.texto}`
                }`}
              >
                ⏳ Ocupado
              </button>
              <button
                onClick={() => cambiarDisponibilidad("fuera_servicio")}
                className={`px-4 py-2 rounded-xl font-semibold text-sm transition-all duration-300 ${
                  disponibilidad === "fuera_servicio"
                    ? "bg-red-600 text-white"
                    : `${tema.colores.secundario} ${tema.colores.texto}`
                }`}
              >
                ✕ Fuera Servicio
              </button>
            </div>

            {/* Perfil */}
            <div className="relative">
              <button
                onClick={() => setPerfilAbierto(!perfilAbierto)}
                className={`flex items-center gap-3 px-4 py-2 rounded-xl transition-all duration-300 ${tema.colores.hover}`}
              >
                <div className="text-right hidden md:block">
                  <p className={`text-sm font-bold ${tema.colores.texto}`}>
                    {usuario.nombre} {usuario.apellido_paterno}
                  </p>
                  <p className={`text-xs ${tema.colores.textoSecundario}`}>
                    Técnico
                  </p>
                </div>
                <div
                  className={`w-10 h-10 rounded-xl bg-gradient-to-br ${tema.colores.gradiente} flex items-center justify-center text-white font-bold shadow-lg`}
                >
                  {usuario.foto_perfil_url ? (
                    <Image
                      src={usuario.foto_perfil_url}
                      alt={usuario.nombre}
                      width={40}
                      height={40}
                      className="rounded-xl object-cover"
                    />
                  ) : (
                    `${usuario.nombre[0]}${usuario.apellido_paterno[0]}`
                  )}
                </div>
                <ChevronDown
                  className={`w-4 h-4 ${tema.colores.texto} transition-transform ${
                    perfilAbierto ? "rotate-180" : ""
                  }`}
                />
              </button>

              {perfilAbierto && (
                <div
                  className={`absolute right-0 mt-2 w-80 rounded-2xl ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} p-4`}
                >
                  <div className="flex items-center gap-4 mb-4 pb-4 border-b border-gray-700/50">
                    <div
                      className={`w-16 h-16 rounded-xl bg-gradient-to-br ${tema.colores.gradiente} flex items-center justify-center text-white font-bold text-xl shadow-lg`}
                    >
                      {usuario.foto_perfil_url ? (
                        <Image
                          src={usuario.foto_perfil_url}
                          alt={usuario.nombre}
                          width={64}
                          height={64}
                          className="rounded-xl object-cover"
                        />
                      ) : (
                        `${usuario.nombre[0]}${usuario.apellido_paterno[0]}`
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p
                        className={`text-lg font-black ${tema.colores.texto}`}
                      >
                        {usuario.nombre} {usuario.apellido_paterno}
                      </p>
                      <p
                        className={`text-sm font-medium ${tema.colores.textoSecundario} mb-1`}
                      >
                        {usuario.tecnico?.tipo_tecnico}
                      </p>
                      <p
                        className={`text-xs font-medium ${tema.colores.textoSecundario}`}
                      >
                        {usuario.tecnico?.centro?.nombre ?? "Sin centro asignado"}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Link
                      href="/tecnico/perfil"
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all duration-300 ${tema.colores.hover} ${tema.colores.texto}`}
                    >
                      <User className="w-5 h-5" />
                      <span>Mi Perfil</span>
                    </Link>
                    <Link
                      href="/tecnico/configuracion"
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all duration-300 ${tema.colores.hover} ${tema.colores.texto}`}
                    >
                      <Settings className="w-5 h-5" />
                      <span>Configuración</span>
                    </Link>
                    <Link
                      href="/tecnico/ayuda"
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all duration-300 ${tema.colores.hover} ${tema.colores.texto}`}
                    >
                      <Lightbulb className="w-5 h-5" />
                      <span>Ayuda</span>
                    </Link>
                    <button
                      onClick={cerrarSesion}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all duration-300 ${tema.colores.hover} text-red-500 hover:text-red-400`}
                    >
                      <LogOut className="w-5 h-5" />
                      <span>Cerrar Sesión</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* MAIN */}
      <main
        className={`transition-all duration-300 ${
          sidebarAbierto ? "ml-72" : "ml-20"
        } pt-24 p-8`}
      >
        {/* Encabezado de reportes */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-4">
            <div>
              <div className="flex items-center gap-2 text-sm mb-2">
                <Link
                  href="/tecnico"
                  className={`font-semibold ${tema.colores.textoSecundario} hover:${tema.colores.acento}`}
                >
                  Dashboard Técnico
                </Link>
                <span className={tema.colores.textoSecundario}>/</span>
                <span className={`font-bold ${tema.colores.texto}`}>
                  Reportes y Analítica
                </span>
              </div>
              <h2
                className={`text-4xl font-black mb-1 ${tema.colores.texto} flex items-center gap-3`}
              >
                Reportes Técnicos
                <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 text-white text-sm font-bold shadow-glow">
                  PRO
                </span>
              </h2>
              <p
                className={`text-sm md:text-base font-semibold ${tema.colores.textoSecundario} flex items-center gap-2`}
              >
                <MapPin className="w-4 h-4" />
                {usuario.tecnico?.centro?.nombre ?? "Centro no definido"} •{" "}
                {usuario.tecnico?.area_tecnica ?? "Área técnica no definida"}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {/* Rango de fechas */}
              <div className="flex flex-wrap gap-2">
                {(["hoy", "7d", "30d", "anio"] as RangoReporte[]).map((r) => (
                  <button
                    key={r}
                    onClick={() => cargarReportes(r)}
                    className={`px-3 py-2 rounded-xl text-xs md:text-sm font-semibold transition-all duration-300 ${obtenerColorRango(
                      r
                    )}`}
                  >
                    {obtenerTextoRango(r)}
                  </button>
                ))}
              </div>

              <button
                onClick={() => cargarReportes(rangoReporte)}
                className={`flex items-center gap-2 px-4 py-2 ${tema.colores.primario} text-white rounded-xl font-bold transition-all duration-300 hover:scale-105 ${tema.colores.sombra}`}
              >
                <RefreshCw
                  className={`w-4 h-4 ${loadingReportes ? "animate-spin" : ""}`}
                />
                Actualizar
              </button>

              {/* Exportar */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() =>
                    window.open(
                      `/api/tecnico/reportes/export?formato=excel&rango=${rangoReporte}`,
                      "_blank"
                    )
                  }
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs md:text-sm font-semibold ${tema.colores.secundario} ${tema.colores.texto}`}
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  Excel
                </button>
                <button
                  onClick={() => window.print()}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs md:text-sm font-semibold ${tema.colores.secundario} ${tema.colores.texto}`}
                >
                  <Printer className="w-4 h-4" />
                  Imprimir
                </button>
                <button
                  onClick={() =>
                    window.open(
                      `/api/tecnico/reportes/export?formato=pdf&rango=${rangoReporte}`,
                      "_blank"
                    )
                  }
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs md:text-sm font-semibold ${tema.colores.secundario} ${tema.colores.texto}`}
                >
                  <Download className="w-4 h-4" />
                  PDF
                </button>
              </div>
            </div>
          </div>

          <p className={`text-sm ${tema.colores.textoSecundario}`}>
            Analiza el rendimiento de tus tickets, mantenimiento y desempeño técnico con
            métricas avanzadas, comparaciones por centro y distribución por tipo de
            requerimiento.
          </p>
        </div>

        {loadingReportes ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <Loader2 className="w-16 h-16 animate-spin text-indigo-500 mx-auto mb-4" />
              <p
                className={`text-lg font-semibold ${tema.colores.textoSecundario}`}
              >
                Cargando datos de reportes técnicos...
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* KPIs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
              {kpisPrincipales.map((kpi, idx) => (
                <div
                  key={kpi.titulo}
                  className={`rounded-2xl p-6 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} transition-all duration-300 hover:scale-105 hover:-translate-y-1 cursor-pointer group`}
                  style={{ animationDelay: `${idx * 80}ms` }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div
                      className={`w-12 h-12 bg-gradient-to-br ${kpi.color} rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}
                    >
                      <kpi.icono className="w-6 h-6 text-white" />
                    </div>
                    <ArrowUpRight className="w-4 h-4 text-emerald-400" />
                  </div>
                  <p
                    className={`text-xs font-bold uppercase tracking-wider mb-1 ${tema.colores.textoSecundario}`}
                  >
                    {kpi.descripcion}
                  </p>
                  <div
                    className={`text-3xl md:text-4xl font-black mb-1 ${tema.colores.texto}`}
                  >
                    {kpi.valor}
                  </div>
                  <p
                    className={`text-xs font-semibold ${tema.colores.textoSecundario}`}
                  >
                    {kpi.extra}
                  </p>
                </div>
              ))}
            </div>

            {/* Gráficos principales */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              {/* Tickets semanales */}
              <div
                className={`rounded-2xl p-6 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra}`}
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg`}
                    >
                      <LineChart className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3
                        className={`text-xl font-black ${tema.colores.texto}`}
                      >
                        Tickets por Día
                      </h3>
                      <p
                        className={`text-sm font-semibold ${tema.colores.textoSecundario}`}
                      >
                        Abiertos vs Resueltos en la última semana
                      </p>
                    </div>
                  </div>
                </div>

                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={datosTicketsSemana}>
                    <defs>
                      <linearGradient id="ticketsAbiertos" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="ticketsResueltos" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                    <XAxis
                      dataKey="dia"
                      stroke={tema.colores.textoSecundario}
                      style={{ fontSize: "12px" }}
                    />
                    <YAxis
                      stroke={tema.colores.textoSecundario}
                      style={{ fontSize: "12px" }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "rgba(17, 24, 39, 0.95)",
                        border: "1px solid rgba(99, 102, 241, 0.3)",
                        borderRadius: "12px",
                        padding: "12px",
                      }}
                    />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="abiertos"
                      stroke="#ef4444"
                      fillOpacity={1}
                      fill="url(#ticketsAbiertos)"
                      name="Abiertos"
                    />
                    <Area
                      type="monotone"
                      dataKey="resueltos"
                      stroke="#10b981"
                      fillOpacity={1}
                      fill="url(#ticketsResueltos)"
                      name="Resueltos"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Mantenimiento mensual */}
              <div
                className={`rounded-2xl p-6 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra}`}
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg`}
                    >
                      <Wrench className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3
                        className={`text-xl font-black ${tema.colores.texto}`}
                      >
                        Mantenimiento Mensual
                      </h3>
                      <p
                        className={`text-sm font-semibold ${tema.colores.textoSecundario}`}
                      >
                        Preventivo, Correctivo e Inspecciones
                      </p>
                    </div>
                  </div>
                </div>

                <ResponsiveContainer width="100%" height={300}>
                  <RechartsBarChart data={datosMantenimientoMes}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                    <XAxis
                      dataKey="mes"
                      stroke={tema.colores.textoSecundario}
                      style={{ fontSize: "12px" }}
                    />
                    <YAxis
                      stroke={tema.colores.textoSecundario}
                      style={{ fontSize: "12px" }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "rgba(17, 24, 39, 0.95)",
                        border: "1px solid rgba(16, 185, 129, 0.3)",
                        borderRadius: "12px",
                        padding: "12px",
                      }}
                    />
                    <Legend />
                    <Bar
                      dataKey="preventivo"
                      fill="#10b981"
                      name="Preventivo"
                      radius={[8, 8, 0, 0]}
                    />
                    <Bar
                      dataKey="correctivo"
                      fill="#f59e0b"
                      name="Correctivo"
                      radius={[8, 8, 0, 0]}
                    />
                    <Bar
                      dataKey="inspecciones"
                      fill="#3b82f6"
                      name="Inspecciones"
                      radius={[8, 8, 0, 0]}
                    />
                  </RechartsBarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Distribución / Radar */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              {/* Pie tipos de ticket */}
              <div
                className={`rounded-2xl p-6 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra}`}
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg`}
                    >
                      <PieChart className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3
                        className={`text-xl font-black ${tema.colores.texto}`}
                      >
                        Distribución por Tipo
                      </h3>
                      <p
                        className={`text-sm font-semibold ${tema.colores.textoSecundario}`}
                      >
                        Por categoría de tickets
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-8">
                  <ResponsiveContainer width="60%" height={250}>
                    <RechartsPieChart>
                      <Pie
                        //data={datosTiposTickets}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="valor"
                      >
                        {datosTiposTickets.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={entry.color}
                          />
                        ))}
                      </Pie>
                      <Tooltip />
                    </RechartsPieChart>
                  </ResponsiveContainer>

                  <div className="flex-1 space-y-2">
                    {datosTiposTickets.map((item, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between"
                      >
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: item.color }}
                          ></div>
                          <span
                            className={`text-sm font-semibold ${tema.colores.texto}`}
                          >
                            {item.nombre}
                          </span>
                        </div>
                        <span
                          className={`text-sm font-bold ${tema.colores.acento}`}
                        >
                          {item.valor}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Radar desempeño */}
              <div
                className={`rounded-2xl p-6 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra}`}
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center shadow-lg`}
                    >
                      <Target className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3
                        className={`text-xl font-black ${tema.colores.texto}`}
                      >
                        Desempeño Técnico
                      </h3>
                      <p
                        className={`text-sm font-semibold ${tema.colores.textoSecundario}`}
                      >
                        Evaluación por dimensión
                      </p>
                    </div>
                  </div>
                </div>

                <ResponsiveContainer width="100%" height={300}>
                  <RadarChart data={datosEficienciaTecnico}>
                    <PolarGrid stroke="rgba(99,102,241,0.2)" />
                    <PolarAngleAxis
                      dataKey="categoria"
                      stroke={tema.colores.textoSecundario}
                      style={{ fontSize: "12px" }}
                    />
                    <PolarRadiusAxis
                      angle={90}
                      domain={[0, 100]}
                      stroke={tema.colores.textoSecundario}
                    />
                    <Radar
                      name="Desempeño"
                      dataKey="valor"
                      stroke="#f59e0b"
                      fill="#f59e0b"
                      fillOpacity={0.6}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "rgba(17, 24, 39, 0.95)",
                        border: "1px solid rgba(245, 158, 11, 0.3)",
                        borderRadius: "12px",
                        padding: "12px",
                      }}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Resumen por centro + métricas adicionales */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 mb-8">
              {/* Tabla centros */}
              <div
                className={`xl:col-span-2 rounded-2xl p-6 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra}`}
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-xl flex items-center justify-center shadow-lg`}
                    >
                      <Building2 className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3
                        className={`text-xl font-black ${tema.colores.texto}`}
                      >
                        Rendimiento por Centro
                      </h3>
                      <p
                        className={`text-sm font-semibold ${tema.colores.textoSecundario}`}
                      >
                        Tickets, SLA y calificación por establecimiento
                      </p>
                    </div>
                  </div>
                </div>

                {resumenCentros.length === 0 ? (
                  <div className="py-10 text-center">
                    <div
                      className={`w-20 h-20 rounded-full bg-gradient-to-br ${tema.colores.gradiente} flex items-center justify-center mx-auto mb-3`}
                    >
                      <Database className="w-10 h-10 text-white" />
                    </div>
                    <p
                      className={`text-sm ${tema.colores.textoSecundario}`}
                    >
                      Aún no hay datos de centros para el rango seleccionado.
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto custom-scrollbar">
                    <table className="min-w-full text-sm">
                      <thead>
                        <tr className="text-left text-xs uppercase tracking-wide">
                          <th className="pb-3 pr-4 text-gray-400">Centro</th>
                          <th className="pb-3 pr-4 text-gray-400">Tickets</th>
                          <th className="pb-3 pr-4 text-gray-400">Resueltos</th>
                          <th className="pb-3 pr-4 text-gray-400">Pendientes</th>
                          <th className="pb-3 pr-4 text-gray-400">SLA</th>
                          <th className="pb-3 pr-4 text-gray-400">Calif.</th>
                        </tr>
                      </thead>
                      <tbody>
                        {resumenCentros.map((c) => {
                          const porcentajeResueltos =
                            c.tickets_totales > 0
                              ? Math.round(
                                  (c.tickets_resueltos / c.tickets_totales) * 100
                                )
                              : 0;
                          return (
                            <tr
                              key={c.id_centro}
                              className={`border-t ${tema.colores.borde} hover:bg-white/5`}
                            >
                              <td className="py-3 pr-4">
                                <div className="flex items-center gap-2">
                                  <MapPin className="w-4 h-4 text-indigo-400" />
                                  <div>
                                    <p
                                      className={`font-semibold ${tema.colores.texto}`}
                                    >
                                      {c.nombre_centro}
                                    </p>
                                    <p
                                      className={`text-xs ${tema.colores.textoSecundario}`}
                                    >
                                      {c.ciudad}
                                    </p>
                                  </div>
                                </div>
                              </td>
                              <td className="py-3 pr-4">
                                <p className={`font-bold ${tema.colores.texto}`}>
                                  {c.tickets_totales}
                                </p>
                                <p className="text-xs text-gray-400">
                                  {porcentajeResueltos}% resueltos
                                </p>
                              </td>
                              <td className="py-3 pr-4">
                                <span className="font-semibold text-emerald-400">
                                  {c.tickets_resueltos}
                                </span>
                              </td>
                              <td className="py-3 pr-4">
                                <span className="font-semibold text-amber-400">
                                  {c.tickets_pendientes}
                                </span>
                              </td>
                              <td className="py-3 pr-4">
                                <span
                                  className={`px-2 py-1 rounded-lg text-xs font-bold ${
                                    c.sla_cumplido >= 90
                                      ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                                      : c.sla_cumplido >= 75
                                      ? "bg-yellow-500/10 text-yellow-400 border border-yellow-500/30"
                                      : "bg-red-500/10 text-red-400 border border-red-500/30"
                                  }`}
                                >
                                  {c.sla_cumplido.toFixed(1)}%
                                </span>
                              </td>
                              <td className="py-3 pr-4">
                                <span className="font-semibold text-indigo-300">
                                  {c.calificacion_promedio.toFixed(1)}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Métricas adicionales */}
              <div
                className={`rounded-2xl p-6 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra}`}
              >
                <div className="flex items-center gap-3 mb-6">
                  <div
                    className={`w-12 h-12 bg-gradient-to-br from-rose-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg`}
                  >
                    <BrainCircuit className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3
                      className={`text-xl font-black ${tema.colores.texto}`}
                    >
                      Métricas Avanzadas
                    </h3>
                    <p
                      className={`text-sm font-semibold ${tema.colores.textoSecundario}`}
                    >
                      Análisis complementario de tu trabajo
                    </p>
                  </div>
                </div>

                <div className="space-y-3 max-h-[360px] overflow-y-auto custom-scrollbar pr-2">
                  {metricasRendimiento.length === 0 ? (
                    <p
                      className={`text-sm ${tema.colores.textoSecundario}`}
                    >
                      Cuando el API de reportes entregue métricas adicionales,
                      aparecerán aquí tus indicadores avanzados de rendimiento.
                    </p>
                  ) : (
                    metricasRendimiento.map((m, idx) => {
                      const Icono = m.icono || Activity;
                      const colorTendencia =
                        m.tendencia === "up"
                          ? "text-emerald-400"
                          : m.tendencia === "down"
                          ? "text-red-400"
                          : "text-gray-400";
                      const IconoTrend =
                        m.tendencia === "up"
                          ? ArrowUpRight
                          : m.tendencia === "down"
                          ? ArrowDownRight
                          : Activity;

                      return (
                        <div
                          key={`${m.nombre}-${idx}`}
                          className={`p-4 rounded-xl ${tema.colores.card} ${tema.colores.borde} border flex items-center gap-3`}
                        >
                          <div
                            className={`w-10 h-10 rounded-xl bg-gradient-to-br ${m.color} flex items-center justify-center flex-shrink-0`}
                          >
                            <Icono className="w-5 h-5 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p
                              className={`text-sm font-bold ${tema.colores.texto}`}
                            >
                              {m.nombre}
                            </p>
                            <p
                              className={`text-xs ${tema.colores.textoSecundario}`}
                            >
                              {m.descripcion}
                            </p>
                          </div>
                          <div className="text-right">
                            <p
                              className={`text-lg font-black ${tema.colores.texto}`}
                            >
                              {m.valor_actual}
                              <span className="text-xs ml-1">
                                {m.unidad || ""}
                              </span>
                            </p>
                            <div
                              className={`flex items-center justify-end gap-1 text-xs font-semibold ${colorTendencia}`}
                            >
                              <IconoTrend className="w-3 h-3" />
                              <span>{m.porcentaje_cambio.toFixed(1)}%</span>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </main>

      {/* FOOTER */}
      <footer
        className={`transition-all duration-300 ${
          sidebarAbierto ? "ml-72" : "ml-20"
        } ${tema.colores.card} ${tema.colores.borde} border-t py-6 mt-12`}
      >
        <div className="max-w-[1920px] mx-auto px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <p
                className={`text-sm font-semibold ${tema.colores.textoSecundario}`}
              >
                © 2025 AnyssaMed - Reportes Técnicos. Todos los derechos reservados.
              </p>
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r ${tema.colores.gradiente} text-white`}
              >
                Analytics v1.0.0
              </span>
            </div>

            <div className="flex items-center gap-6">
              <Link
                href="/ayuda"
                className={`text-sm font-bold transition-colors ${tema.colores.textoSecundario} hover:${tema.colores.acento}`}
              >
                Ayuda
              </Link>
              <Link
                href="/privacidad"
                className={`text-sm font-bold transition-colors ${tema.colores.textoSecundario} hover:${tema.colores.acento}`}
              >
                Privacidad
              </Link>
              <Link
                href="/terminos"
                className={`text-sm font-bold transition-colors ${tema.colores.textoSecundario} hover:${tema.colores.acento}`}
              >
                Términos
              </Link>
              <button
                onClick={cerrarSesion}
                className={`text-sm font-bold transition-colors ${tema.colores.textoSecundario} hover:text-red-400 flex items-center gap-1`}
              >
                <LogOut className="w-4 h-4" />
                Cerrar Sesión
              </button>
            </div>
          </div>
        </div>
      </footer>

      {/* ESTILOS GLOBALES */}
      <style jsx global>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        html {
          scroll-behavior: smooth;
        }

        body {
          font-family: "Inter", "Segoe UI", sans-serif;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }

        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }

        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(99, 102, 241, 0.5);
          border-radius: 10px;
          transition: background 0.3s ease;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(99, 102, 241, 0.8);
        }

        .custom-scrollbar {
          scrollbar-color: rgba(99, 102, 241, 0.5) transparent;
          scrollbar-width: thin;
        }

        @keyframes wave {
          0%,
          100% {
            transform: rotate(0deg);
          }
          10%,
          20% {
            transform: rotate(14deg);
          }
          30%,
          60%,
          90% {
            transform: rotate(-8deg);
          }
          40%,
          80% {
            transform: rotate(14deg);
          }
          50% {
            transform: rotate(10deg);
          }
        }

        .animate-wave {
          animation: wave 1s ease-in-out infinite;
          transform-origin: 70% 70%;
          display: inline-block;
        }

        @media (max-width: 768px) {
          .hidden.md\\:block {
            display: none;
          }

          .block.md\\:hidden {
            display: block;
          }
        }

        @media print {
          .no-print {
            display: none !important;
          }

          body {
            background: white;
            color: black;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          * {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
        }

        @media (prefers-color-scheme: dark) {
          input,
          select,
          textarea {
            color-scheme: dark;
          }
        }
      `}</style>
    </div>
  );
}
