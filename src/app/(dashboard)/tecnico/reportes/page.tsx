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
  Filter,
  SlidersHorizontal,
  Maximize2,
  Minimize2,
  TrendingUpIcon,
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
  ComposedChart,
} from "recharts";

// 👇 agrega este import (puede ir justo debajo)
import type { PieLabelRenderProps } from "recharts";

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
// COMPONENTE: Skeleton Loader Premium
// ========================================

const SkeletonCard = ({ tema }: { tema: ConfiguracionTema }) => (
  <div
    className={`rounded-2xl p-6 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} animate-pulse`}
  >
    <div className="flex items-center justify-between mb-4">
      <div className="w-12 h-12 bg-gradient-to-br from-gray-700 to-gray-600 rounded-xl"></div>
      <div className="w-6 h-6 bg-gray-700 rounded"></div>
    </div>
    <div className="space-y-3">
      <div className="h-4 bg-gray-700 rounded w-3/4"></div>
      <div className="h-8 bg-gray-700 rounded w-1/2"></div>
      <div className="h-3 bg-gray-700 rounded w-2/3"></div>
    </div>
  </div>
);

const SkeletonChart = ({ tema }: { tema: ConfiguracionTema }) => (
  <div
    className={`rounded-2xl p-6 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} animate-pulse`}
  >
    <div className="flex items-center gap-3 mb-6">
      <div className="w-12 h-12 bg-gradient-to-br from-gray-700 to-gray-600 rounded-xl"></div>
      <div className="flex-1 space-y-2">
        <div className="h-5 bg-gray-700 rounded w-1/3"></div>
        <div className="h-3 bg-gray-700 rounded w-1/2"></div>
      </div>
    </div>
    <div className="h-[300px] bg-gray-700/30 rounded-xl"></div>
  </div>
);

// ========================================
// COMPONENTE: Tooltip Personalizado
// ========================================

const CustomTooltip = ({ active, payload, label, tema }: any) => {
  if (active && payload && payload.length) {
    return (
      <div
        className={`rounded-xl p-4 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} backdrop-blur-xl`}
      >
        <p className={`font-bold mb-2 ${tema.colores.texto}`}>{label}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center justify-between gap-4 mb-1">
            <div className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: entry.color }}
              ></div>
              <span className={`text-sm font-semibold ${tema.colores.textoSecundario}`}>
                {entry.name}:
              </span>
            </div>
            <span className={`text-sm font-bold ${tema.colores.texto}`}>
              {entry.value}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

// ========================================
// COMPONENTE PRINCIPAL
// ========================================

export default function ReportesTecnicoPage() {
  const pathname = usePathname();

  // Estados
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
  const [metricasRendimiento, setMetricasRendimiento] = useState<
    MetricaRendimientoTecnico[]
  >([]);
  const [alertas, setAlertas] = useState<AlertaTecnico[]>([]);

  const [temaActual, setTemaActual] = useState<TemaColor>("dark");
  const [sidebarAbierto, setSidebarAbierto] = useState(true);
  const [notificacionesAbiertas, setNotificacionesAbiertas] = useState(false);
  const [perfilAbierto, setPerfilAbierto] = useState(false);
  const [busqueda, setBusqueda] = useState("");
  const [disponibilidad, setDisponibilidad] = useState<
    "disponible" | "ocupado" | "fuera_servicio"
  >("disponible");
  const [rangoReporte, setRangoReporte] = useState<RangoReporte>("30d");
  const [filtroActivo, setFiltroActivo] = useState<string | null>(null);
  const [vistaExpandida, setVistaExpandida] = useState<string | null>(null);

  const tema = useMemo(() => TEMAS[temaActual], [temaActual]);

  // ========================================
  // EFECTOS
  // ========================================

  useEffect(() => {
    if (typeof window !== "undefined") {
      const temaGuardado = localStorage.getItem("tema_tecnico") as TemaColor | null;
      if (temaGuardado && TEMAS[temaGuardado]) {
        setTemaActual(temaGuardado);
      }
    }
  }, []);

  useEffect(() => {
    document.body.className = `bg-gradient-to-br ${tema.colores.fondo} min-h-screen transition-all duration-500`;
  }, [tema]);

  useEffect(() => {
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

  useEffect(() => {
    if (usuario?.tecnico?.id_tecnico) {
      cargarReportes(rangoReporte);
    }
  }, [usuario]);

  useEffect(() => {
    if (!usuario?.tecnico?.id_tecnico) return;

    const interval = setInterval(() => {
      cargarReportes(rangoReporte);
    }, 300000);

    return () => clearInterval(interval);
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

      const data: ReportesTecnicoAPI = (await res.json().catch(() => ({
        success: false,
      }))) as any;

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
      }
    } catch (error) {
      console.error("Error al cambiar disponibilidad:", error);
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
      alta: isDark
        ? "bg-red-500/20 text-red-400 border-red-500/30"
        : "bg-red-100 text-red-800 border-red-200",
      media: isDark
        ? "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
        : "bg-yellow-100 text-yellow-800 border-yellow-200",
      baja: isDark
        ? "bg-green-500/20 text-green-400 border-green-500/30"
        : "bg-green-100 text-green-800 border-green-200",
      critica: isDark
        ? "bg-purple-500/20 text-purple-400 border-purple-500/30"
        : "bg-purple-100 text-purple-800 border-purple-200",
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
      ? "bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg shadow-indigo-500/50"
      : `${tema.colores.secundario} ${tema.colores.texto}`;

  const obtenerTextoRango = (r: RangoReporte) => {
    switch (r) {
      case "hoy":
        return "Hoy";
      case "7d":
        return "7 días";
      case "30d":
        return "30 días";
      case "anio":
        return "Año";
      case "personalizado":
        return "Personalizado";
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
        descripcion: "Total en el período",
        icono: ClipboardList,
        color: "from-indigo-500 to-purple-500",
        extra: `${estadisticas?.tickets_resueltos_hoy || 0} resueltos`,
        tendencia: "up" as const,
        cambio: "+12%",
      },
      {
        titulo: "Tickets Abiertos",
        valor: estadisticas?.tickets_abiertos ?? 0,
        descripcion: "Pendientes",
        icono: AlertOctagon,
        color: "from-orange-500 to-red-500",
        extra: `${estadisticas?.tickets_en_progreso || 0} en progreso`,
        tendencia: "down" as const,
        cambio: "-5%",
      },
      {
        titulo: "Tiempo Promedio",
        valor: estadisticas?.tiempo_promedio_resolucion ?? 0,
        descripcion: "Minutos",
        icono: Clock3,
        color: "from-blue-500 to-cyan-500",
        extra: "Menor es mejor",
        tendencia: "down" as const,
        cambio: "-8%",
      },
      {
        titulo: "Calificación",
        valor: estadisticas?.calificacion_promedio
          ? estadisticas.calificacion_promedio.toFixed(1)
          : "0.0",
        descripcion: "Satisfacción",
        icono: Star,
        color: "from-yellow-500 to-amber-500",
        extra: "Escala 1-5",
        tendencia: "up" as const,
        cambio: "+3%",
      },
    ];
  }, [estadisticas]);

  // ========================================
  // RENDER LOADING
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
            Cargando Reportes Premium
          </h2>
          <p
            className={`text-lg font-semibold ${tema.colores.textoSecundario} animate-pulse`}
          >
            Preparando análisis avanzados...
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
            <div className="relative group">
              <Search
                className={`absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 ${tema.colores.textoSecundario} transition-colors group-focus-within:text-indigo-500`}
              />
              <input
                type="text"
                placeholder="Buscar en reportes..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className={`w-full pl-12 pr-4 py-3 rounded-xl ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto} placeholder:${tema.colores.textoSecundario} focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all duration-300`}
              />
              {busqueda && (
                <button
                  onClick={() => setBusqueda("")}
                  className={`absolute right-4 top-1/2 transform -translate-y-1/2 p-1 rounded-lg ${tema.colores.hover} transition-all duration-200`}
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Acciones header */}
          <div className="flex items-center gap-3 ml-6">
            {/* Filtros */}
            <div className="relative group">
              <button
                className={`p-3 rounded-xl font-semibold transition-all duration-300 ${tema.colores.secundario} ${tema.colores.texto} hover:scale-105`}
              >
                <SlidersHorizontal className="w-5 h-5" />
              </button>

              <div
                className={`absolute right-0 mt-2 w-64 rounded-2xl ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 p-4 space-y-2`}
              >
                <p className={`text-sm font-bold mb-3 ${tema.colores.texto}`}>
                  Filtros Avanzados
                </p>
                {["Todos", "Alta Prioridad", "Pendientes", "Completados"].map((filtro) => (
                  <button
                    key={filtro}
                    onClick={() => setFiltroActivo(filtro === "Todos" ? null : filtro)}
                    className={`w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl font-semibold transition-all duration-300 ${
                      filtroActivo === filtro || (filtro === "Todos" && !filtroActivo)
                        ? `bg-gradient-to-r ${tema.colores.gradiente} text-white`
                        : `${tema.colores.hover} ${tema.colores.texto}`
                    }`}
                  >
                    <span>{filtro}</span>
                    {(filtroActivo === filtro || (filtro === "Todos" && !filtroActivo)) && (
                      <Check className="w-5 h-5" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Temas */}
            <div className="relative group">
              <button
                className={`p-3 rounded-xl font-semibold transition-all duration-300 ${tema.colores.secundario} ${tema.colores.texto} hover:scale-105`}
              >
                <Sparkles className="w-5 h-5" />
              </button>

              <div
                className={`absolute right-0 mt-2 w-64 rounded-2xl ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 p-4 space-y-2`}
              >
                <p className={`text-sm font-bold mb-3 ${tema.colores.texto}`}>
                  Temas Disponibles
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
                onClick={() => setNotificacionesAbiertas(!notificacionesAbiertas)}
                className={`relative p-3 rounded-xl font-semibold transition-all duration-300 ${tema.colores.secundario} ${tema.colores.texto} hover:scale-105`}
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
                  className={`absolute right-0 mt-2 w-96 rounded-2xl ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} max-h-96 overflow-y-auto animate-slideDown`}
                >
                  <div
                    className={`p-4 border-b ${tema.colores.borde} sticky top-0 ${tema.colores.card} backdrop-blur-xl`}
                  >
                    <h3 className={`text-lg font-black ${tema.colores.texto}`}>
                      Alertas Activas
                    </h3>
                  </div>

                  {alertas.length === 0 ? (
                    <div className="p-8 text-center">
                      <BellOff
                        className={`w-12 h-12 mx-auto mb-3 ${tema.colores.textoSecundario}`}
                      />
                      <p className={`text-sm ${tema.colores.textoSecundario}`}>
                        No tienes alertas activas
                      </p>
                    </div>
                  ) : (
                    <div className={`divide-y ${tema.colores.borde}`}>
                      {alertas.slice(0, 5).map((alerta) => (
                        <div
                          key={alerta.id_alerta}
                          className={`p-4 ${tema.colores.hover} transition-all duration-200 cursor-pointer ${
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
                              <p className={`text-sm font-bold mb-1 ${tema.colores.texto}`}>
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
                className={`px-4 py-2 rounded-xl font-semibold text-sm transition-all duration-300 hover:scale-105 ${
                  disponibilidad === "disponible"
                    ? "bg-green-600 text-white shadow-lg shadow-green-500/50"
                    : `${tema.colores.secundario} ${tema.colores.texto}`
                }`}
              >
                ✓ Disponible
              </button>
              <button
                onClick={() => cambiarDisponibilidad("ocupado")}
                className={`px-4 py-2 rounded-xl font-semibold text-sm transition-all duration-300 hover:scale-105 ${
                  disponibilidad === "ocupado"
                    ? "bg-yellow-600 text-white shadow-lg shadow-yellow-500/50"
                    : `${tema.colores.secundario} ${tema.colores.texto}`
                }`}
              >
                ⏳ Ocupado
              </button>
              <button
                onClick={() => cambiarDisponibilidad("fuera_servicio")}
                className={`px-4 py-2 rounded-xl font-semibold text-sm transition-all duration-300 hover:scale-105 ${
                  disponibilidad === "fuera_servicio"
                    ? "bg-red-600 text-white shadow-lg shadow-red-500/50"
                    : `${tema.colores.secundario} ${tema.colores.texto}`
                }`}
              >
                ✕ Fuera
              </button>
            </div>

            {/* Perfil */}
            <div className="relative">
              <button
                onClick={() => setPerfilAbierto(!perfilAbierto)}
                className={`flex items-center gap-3 px-4 py-2 rounded-xl transition-all duration-300 ${tema.colores.hover} hover:scale-105`}
              >
                <div className="text-right hidden md:block">
                  <p className={`text-sm font-bold ${tema.colores.texto}`}>
                    {usuario.nombre} {usuario.apellido_paterno}
                  </p>
                  <p className={`text-xs ${tema.colores.textoSecundario}`}>Técnico</p>
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
                  className={`absolute right-0 mt-2 w-80 rounded-2xl ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} p-4 animate-slideDown`}
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
                      <p className={`text-lg font-black ${tema.colores.texto}`}>
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
                        {usuario.tecnico?.centro?.nombre ?? "Sin centro"}
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
        {/* Encabezado */}
        <div className="mb-8 animate-fadeIn">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-4">
            <div>
              <div className="flex items-center gap-2 text-sm mb-2">
                <Link
                  href="/tecnico"
                  className={`font-semibold ${tema.colores.textoSecundario} hover:${tema.colores.acento} transition-colors`}
                >
                  Dashboard
                </Link>
                <span className={tema.colores.textoSecundario}>/</span>
                <span className={`font-bold ${tema.colores.texto}`}>
                  Reportes Premium
                </span>
              </div>
              <h2
                className={`text-4xl font-black mb-1 ${tema.colores.texto} flex items-center gap-3`}
              >
                Analítica Avanzada
                <span className="inline-flex items-center justify-center px-3 py-1 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-sm font-bold shadow-lg shadow-indigo-500/50 animate-pulse">
                  PRO
                </span>
              </h2>
              <p
                className={`text-sm md:text-base font-semibold ${tema.colores.textoSecundario} flex items-center gap-2`}
              >
                <MapPin className="w-4 h-4" />
                {usuario.tecnico?.centro?.nombre ?? "Centro no definido"} •{" "}
                {usuario.tecnico?.area_tecnica ?? "Área no definida"}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {/* Rango */}
              <div className="flex flex-wrap gap-2">
                {(["hoy", "7d", "30d", "anio"] as RangoReporte[]).map((r) => (
                  <button
                    key={r}
                    onClick={() => cargarReportes(r)}
                    className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 hover:scale-105 ${obtenerColorRango(
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
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold ${tema.colores.secundario} ${tema.colores.texto} hover:scale-105 transition-all duration-300`}
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  Excel
                </button>
                <button
                  onClick={() => window.print()}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold ${tema.colores.secundario} ${tema.colores.texto} hover:scale-105 transition-all duration-300`}
                >
                  <Printer className="w-4 h-4" />
                  PDF
                </button>
                <button
                  onClick={() =>
                    window.open(
                      `/api/tecnico/reportes/export?formato=csv&rango=${rangoReporte}`,
                      "_blank"
                    )
                  }
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold ${tema.colores.secundario} ${tema.colores.texto} hover:scale-105 transition-all duration-300`}
                >
                  <Download className="w-4 h-4" />
                  CSV
                </button>
              </div>
            </div>
          </div>

          <p className={`text-sm ${tema.colores.textoSecundario}`}>
            Panel de análisis profesional con métricas en tiempo real, comparativas
            históricas y exportación avanzada de datos.
          </p>
        </div>

        {loadingReportes ? (
          <div className="space-y-8">
            {/* Skeleton KPIs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <SkeletonCard key={i} tema={tema} />
              ))}
            </div>

            {/* Skeleton Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {[1, 2].map((i) => (
                <SkeletonChart key={i} tema={tema} />
              ))}
            </div>
          </div>
        ) : (
          <>
            {/* KPIs Premium */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
              {kpisPrincipales.map((kpi, idx) => (
                <div
                  key={kpi.titulo}
                  className={`rounded-2xl p-6 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} transition-all duration-300 hover:scale-105 hover:-translate-y-2 cursor-pointer group animate-slideUp`}
                  style={{ animationDelay: `${idx * 100}ms` }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div
                      className={`w-14 h-14 bg-gradient-to-br ${kpi.color} rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}
                    >
                      <kpi.icono className="w-7 h-7 text-white" />
                    </div>
                    <div className="flex items-center gap-1">
                      {kpi.tendencia === "up" ? (
                        <TrendingUp className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <TrendingDown className="w-4 h-4 text-red-400" />
                      )}
                      <span
                        className={`text-xs font-bold ${
                          kpi.tendencia === "up" ? "text-emerald-400" : "text-red-400"
                        }`}
                      >
                        {kpi.cambio}
                      </span>
                    </div>
                  </div>
                  <p
                    className={`text-xs font-bold uppercase tracking-wider mb-2 ${tema.colores.textoSecundario}`}
                  >
                    {kpi.descripcion}
                  </p>
                  <div
                    className={`text-4xl md:text-5xl font-black mb-2 ${tema.colores.texto} group-hover:scale-110 transition-transform`}
                  >
                    {kpi.valor}
                  </div>
                  <div className="flex items-center justify-between">
                    <p
                      className={`text-xs font-semibold ${tema.colores.textoSecundario}`}
                    >
                      {kpi.extra}
                    </p>
                    <Eye className="w-4 h-4 text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>

                  {/* Barra de progreso animada */}
                  <div className="mt-4 h-1 bg-gray-700/30 rounded-full overflow-hidden">
                    <div
                      className={`h-full bg-gradient-to-r ${kpi.color} rounded-full transition-all duration-1000 ease-out`}
                      style={{
                        width: `${
                          typeof kpi.valor === "number"
                            ? Math.min((kpi.valor / 100) * 100, 100)
                            : 75
                        }%`,
                      }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>

            {/* Gráficos Principales Premium */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              {/* Tickets Semanales - Area Chart Mejorado */}
              <div
                className={`rounded-2xl p-6 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} transition-all duration-300 hover:shadow-2xl animate-fadeIn relative group`}
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}
                    >
                      <LineChart className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className={`text-xl font-black ${tema.colores.texto}`}>
                        Evolución de Tickets
                      </h3>
                      <p
                        className={`text-sm font-semibold ${tema.colores.textoSecundario}`}
                      >
                        Últimos 7 días • Comparativa
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() =>
                      setVistaExpandida(
                        vistaExpandida === "tickets" ? null : "tickets"
                      )
                    }
                    className={`p-2 rounded-lg ${tema.colores.hover} transition-all duration-200`}
                  >
                    {vistaExpandida === "tickets" ? (
                      <Minimize2 className="w-5 h-5" />
                    ) : (
                      <Maximize2 className="w-5 h-5" />
                    )}
                  </button>
                </div>

                <ResponsiveContainer
                  width="100%"
                  height={vistaExpandida === "tickets" ? 500 : 320}
                >
                  <ComposedChart data={datosTicketsSemana}>
                    <defs>
                      <linearGradient
                        id="colorAbiertos"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0.1} />
                      </linearGradient>
                      <linearGradient
                        id="colorProgreso"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.1} />
                      </linearGradient>
                      <linearGradient
                        id="colorResueltos"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0.1} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                    <XAxis
                      dataKey="dia"
                      stroke={tema.colores.textoSecundario}
                      style={{ fontSize: "12px", fontWeight: "600" }}
                    />
                    <YAxis
                      stroke={tema.colores.textoSecundario}
                      style={{ fontSize: "12px", fontWeight: "600" }}
                    />
                    <Tooltip content={<CustomTooltip tema={tema} />} />
                    <Legend
                      wrapperStyle={{ paddingTop: "20px" }}
                      iconType="circle"
                    />
                    <Area
                      type="monotone"
                      dataKey="abiertos"
                      stroke="#ef4444"
                      strokeWidth={3}
                      fillOpacity={1}
                      fill="url(#colorAbiertos)"
                      name="Abiertos"
                      animationDuration={1500}
                    />
                    <Area
                      type="monotone"
                      dataKey="en_progreso"
                      stroke="#f59e0b"
                      strokeWidth={3}
                      fillOpacity={1}
                      fill="url(#colorProgreso)"
                      name="En Progreso"
                      animationDuration={1500}
                    />
                    <Area
                      type="monotone"
                      dataKey="resueltos"
                      stroke="#10b981"
                      strokeWidth={3}
                      fillOpacity={1}
                      fill="url(#colorResueltos)"
                      name="Resueltos"
                      animationDuration={1500}
                    />
                  </ComposedChart>
                </ResponsiveContainer>

                {/* Estadísticas rápidas */}
                <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-700/30">
                  <div className="text-center">
                    <p className={`text-2xl font-black text-red-400`}>
                      {datosTicketsSemana.reduce((acc, d) => acc + d.abiertos, 0)}
                    </p>
                    <p className={`text-xs font-semibold ${tema.colores.textoSecundario}`}>
                      Total Abiertos
                    </p>
                  </div>
                  <div className="text-center">
                    <p className={`text-2xl font-black text-amber-400`}>
                      {datosTicketsSemana.reduce((acc, d) => acc + d.en_progreso, 0)}
                    </p>
                    <p className={`text-xs font-semibold ${tema.colores.textoSecundario}`}>
                      En Progreso
                    </p>
                  </div>
                  <div className="text-center">
                    <p className={`text-2xl font-black text-emerald-400`}>
                      {datosTicketsSemana.reduce((acc, d) => acc + d.resueltos, 0)}
                    </p>
                    <p className={`text-xs font-semibold ${tema.colores.textoSecundario}`}>
                      Resueltos
                    </p>
                  </div>
                </div>
              </div>

              {/* Mantenimiento Mensual - Bar Chart Premium */}
              <div
                className={`rounded-2xl p-6 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} transition-all duration-300 hover:shadow-2xl animate-fadeIn relative group`}
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}
                    >
                      <Wrench className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className={`text-xl font-black ${tema.colores.texto}`}>
                        Mantenimiento Mensual
                      </h3>
                      <p
                        className={`text-sm font-semibold ${tema.colores.textoSecundario}`}
                      >
                        Preventivo vs Correctivo
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() =>
                      setVistaExpandida(
                        vistaExpandida === "mantenimiento" ? null : "mantenimiento"
                      )
                    }
                    className={`p-2 rounded-lg ${tema.colores.hover} transition-all duration-200`}
                  >
                    {vistaExpandida === "mantenimiento" ? (
                      <Minimize2 className="w-5 h-5" />
                    ) : (
                      <Maximize2 className="w-5 h-5" />
                    )}
                  </button>
                </div>

                <ResponsiveContainer
                  width="100%"
                  height={vistaExpandida === "mantenimiento" ? 500 : 320}
                >
                  <RechartsBarChart data={datosMantenimientoMes}>
                    <defs>
                      <linearGradient
                        id="colorPreventivo"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop offset="5%" stopColor="#10b981" stopOpacity={1} />
                        <stop offset="95%" stopColor="#059669" stopOpacity={1} />
                      </linearGradient>
                      <linearGradient
                        id="colorCorrectivo"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop offset="5%" stopColor="#f59e0b" stopOpacity={1} />
                        <stop offset="95%" stopColor="#d97706" stopOpacity={1} />
                      </linearGradient>
                      <linearGradient
                        id="colorInspecciones"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={1} />
                        <stop offset="95%" stopColor="#2563eb" stopOpacity={1} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                    <XAxis
                      dataKey="mes"
                      stroke={tema.colores.textoSecundario}
                      style={{ fontSize: "12px", fontWeight: "600" }}
                    />
                    <YAxis
                      stroke={tema.colores.textoSecundario}
                      style={{ fontSize: "12px", fontWeight: "600" }}
                    />
                    <Tooltip content={<CustomTooltip tema={tema} />} />
                    <Legend
                      wrapperStyle={{ paddingTop: "20px" }}
                      iconType="circle"
                    />
                    <Bar
                      dataKey="preventivo"
                      fill="url(#colorPreventivo)"
                      name="Preventivo"
                      radius={[8, 8, 0, 0]}
                      animationDuration={1500}
                    />
                    <Bar
                      dataKey="correctivo"
                      fill="url(#colorCorrectivo)"
                      name="Correctivo"
                      radius={[8, 8, 0, 0]}
                      animationDuration={1500}
                    />
                    <Bar
                      dataKey="inspecciones"
                      fill="url(#colorInspecciones)"
                      name="Inspecciones"
                      radius={[8, 8, 0, 0]}
                      animationDuration={1500}
                    />
                  </RechartsBarChart>
                </ResponsiveContainer>

                {/* Resumen */}
                <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-700/30">
                  <div className="text-center">
                    <p className={`text-2xl font-black text-emerald-400`}>
                      {datosMantenimientoMes.reduce(
                        (acc, d) => acc + d.preventivo,
                        0
                      )}
                    </p>
                    <p className={`text-xs font-semibold ${tema.colores.textoSecundario}`}>
                      Preventivos
                    </p>
                  </div>
                  <div className="text-center">
                    <p className={`text-2xl font-black text-amber-400`}>
                      {datosMantenimientoMes.reduce(
                        (acc, d) => acc + d.correctivo,
                        0
                      )}
                    </p>
                    <p className={`text-xs font-semibold ${tema.colores.textoSecundario}`}>
                      Correctivos
                    </p>
                  </div>
                  <div className="text-center">
                    <p className={`text-2xl font-black text-blue-400`}>
                      {datosMantenimientoMes.reduce(
                        (acc, d) => acc + d.inspecciones,
                        0
                      )}
                    </p>
                    <p className={`text-xs font-semibold ${tema.colores.textoSecundario}`}>
                      Inspecciones
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Distribución y Radar Premium */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              {/* Pie Chart Mejorado */}
              <div
                className={`rounded-2xl p-6 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} transition-all duration-300 hover:shadow-2xl animate-fadeIn group`}
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}
                    >
                      <PieChart className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className={`text-xl font-black ${tema.colores.texto}`}>
                        Distribución por Tipo
                      </h3>
                      <p
                        className={`text-sm font-semibold ${tema.colores.textoSecundario}`}
                      >
                        Categorías de tickets
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() =>
                      setVistaExpandida(
                        vistaExpandida === "distribucion" ? null : "distribucion"
                      )
                    }
                    className={`p-2 rounded-lg ${tema.colores.hover} transition-all duration-200`}
                  >
                    {vistaExpandida === "distribucion" ? (
                      <Minimize2 className="w-5 h-5" />
                    ) : (
                      <Maximize2 className="w-5 h-5" />
                    )}
                  </button>
                </div>

                <div className="flex items-center gap-8">
                  <ResponsiveContainer
                    width="60%"
                    height={vistaExpandida === "distribucion" ? 400 : 280}
                  >
                    <RechartsPieChart>
                      <defs>
                        {datosTiposTickets.map((entry, index) => (
                          <linearGradient
                            key={`gradient-${index}`}
                            id={`gradient-${index}`}
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1"
                          >
                            <stop offset="5%" stopColor={entry.color} stopOpacity={1} />
                            <stop
                              offset="95%"
                              stopColor={entry.color}
                              stopOpacity={0.7}
                            />
                          </linearGradient>
                        ))}
                      </defs>
                      <Pie
                        //data={datosTiposTickets}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={(props: any) =>
                          `${props.name}: ${(props.percent * 100).toFixed(0)}%`
                        }
                        outerRadius={vistaExpandida === "distribucion" ? 140 : 100}
                        fill="#8884d8"
                        dataKey="valor"
                        animationDuration={1500}
                      >
                        {datosTiposTickets.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={`url(#gradient-${index})`}
                            stroke={tema.colores.card}
                            strokeWidth={2}
                          />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip tema={tema} />} />
                    </RechartsPieChart>
                  </ResponsiveContainer>

                  <div className="flex-1 space-y-3">
                    {datosTiposTickets.map((item, index) => (
                      <div
                        key={index}
                        className={`flex items-center justify-between p-3 rounded-xl ${tema.colores.hover} transition-all duration-200 hover:scale-105 cursor-pointer`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className="w-4 h-4 rounded-full shadow-lg"
                            style={{ backgroundColor: item.color }}
                          ></div>
                          <span
                            className={`text-sm font-bold ${tema.colores.texto}`}
                          >
                            {item.nombre}
                          </span>
                        </div>
                        <div className="text-right">
                          <p className={`text-lg font-black ${tema.colores.acento}`}>
                            {item.valor}%
                          </p>
                          <p className={`text-xs ${tema.colores.textoSecundario}`}>
                            {Math.round(
                              (item.valor / 100) *
                                datosTicketsSemana.reduce(
                                  (acc, d) =>
                                    acc + d.abiertos + d.en_progreso + d.resueltos,
                                  0
                                )
                            )}{" "}
                            tickets
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Radar Chart Premium */}
              <div
                className={`rounded-2xl p-6 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} transition-all duration-300 hover:shadow-2xl animate-fadeIn group`}
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}
                    >
                      <Target className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className={`text-xl font-black ${tema.colores.texto}`}>
                        Desempeño Técnico
                      </h3>
                      <p
                        className={`text-sm font-semibold ${tema.colores.textoSecundario}`}
                      >
                        Evaluación multidimensional
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() =>
                      setVistaExpandida(
                        vistaExpandida === "desempeno" ? null : "desempeno"
                      )
                    }
                    className={`p-2 rounded-lg ${tema.colores.hover} transition-all duration-200`}
                  >
                    {vistaExpandida === "desempeno" ? (
                      <Minimize2 className="w-5 h-5" />
                    ) : (
                      <Maximize2 className="w-5 h-5" />
                    )}
                  </button>
                </div>

                <ResponsiveContainer
                  width="100%"
                  height={vistaExpandida === "desempeno" ? 400 : 280}
                >
                  <RadarChart data={datosEficienciaTecnico}>
                    <defs>
                      <linearGradient
                        id="radarGradient"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0.3} />
                      </linearGradient>
                    </defs>
                    <PolarGrid
                      stroke="rgba(99,102,241,0.3)"
                      strokeWidth={1.5}
                    />
                    <PolarAngleAxis
                      dataKey="categoria"
                      stroke={tema.colores.texto}
                      style={{ fontSize: "13px", fontWeight: "700" }}
                    />
                    <PolarRadiusAxis
                      angle={90}
                      domain={[0, 100]}
                      stroke={tema.colores.textoSecundario}
                      style={{ fontSize: "11px" }}
                    />
                    <Radar
                      name="Desempeño"
                      dataKey="valor"
                      stroke="#f59e0b"
                      strokeWidth={3}
                      fill="url(#radarGradient)"
                      fillOpacity={0.7}
                      animationDuration={1500}
                    />
                    <Tooltip content={<CustomTooltip tema={tema} />} />
                  </RadarChart>
                </ResponsiveContainer>

                {/* Promedio general */}
                <div className="mt-6 pt-6 border-t border-gray-700/30 text-center">
                  <p
                    className={`text-sm font-bold mb-2 ${tema.colores.textoSecundario}`}
                  >
                    Promedio General
                  </p>
                  <div className="flex items-center justify-center gap-3">
                    <div
                      className={`text-5xl font-black bg-gradient-to-r ${tema.colores.gradiente} bg-clip-text text-transparent`}
                    >
                      {(
                        datosEficienciaTecnico.reduce(
                          (acc, d) => acc + d.valor,
                          0
                        ) / datosEficienciaTecnico.length
                      ).toFixed(1)}
                    </div>
                    <div className="text-left">
                      <p className={`text-sm font-bold ${tema.colores.texto}`}>
                        Puntos
                      </p>
                      <p className={`text-xs ${tema.colores.textoSecundario}`}>
                        de 100
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Tabla de Centros Premium */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 mb-8">
              <div
                className={`xl:col-span-2 rounded-2xl p-6 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} transition-all duration-300 hover:shadow-2xl animate-fadeIn`}
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-xl flex items-center justify-center shadow-lg`}
                    >
                      <Building2 className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className={`text-xl font-black ${tema.colores.texto}`}>
                        Rendimiento por Centro
                      </h3>
                      <p
                        className={`text-sm font-semibold ${tema.colores.textoSecundario}`}
                      >
                        Comparativa de establecimientos
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      className={`p-2 rounded-lg ${tema.colores.hover} transition-all duration-200`}
                    >
                      <Filter className="w-5 h-5" />
                    </button>
                    <button
                      className={`p-2 rounded-lg ${tema.colores.hover} transition-all duration-200`}
                    >
                      <Download className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {resumenCentros.length === 0 ? (
                  <div className="py-16 text-center">
                    <div
                      className={`w-24 h-24 rounded-full bg-gradient-to-br ${tema.colores.gradiente} flex items-center justify-center mx-auto mb-4 animate-pulse`}
                    >
                      <Database className="w-12 h-12 text-white" />
                    </div>
                    <p className={`text-lg font-bold ${tema.colores.texto} mb-2`}>
                      Sin datos disponibles
                    </p>
                    <p className={`text-sm ${tema.colores.textoSecundario}`}>
                      No hay información de centros para el rango seleccionado
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto custom-scrollbar">
                    <table className="min-w-full text-sm">
                      <thead>
                        <tr
                          className={`text-left text-xs uppercase tracking-wide border-b ${tema.colores.borde}`}
                        >
                          <th className="pb-4 pr-4 font-black text-gray-400">
                            Centro
                          </th>
                          <th className="pb-4 pr-4 font-black text-gray-400 text-center">
                            Tickets
                          </th>
                          <th className="pb-4 pr-4 font-black text-gray-400 text-center">
                            Resueltos
                          </th>
                          <th className="pb-4 pr-4 font-black text-gray-400 text-center">
                            Pendientes
                          </th>
                          <th className="pb-4 pr-4 font-black text-gray-400 text-center">
                            SLA
                          </th>
                          <th className="pb-4 pr-4 font-black text-gray-400 text-center">
                            Calificación
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {resumenCentros.map((c, idx) => {
                          const porcentajeResueltos =
                            c.tickets_totales > 0
                              ? Math.round(
                                  (c.tickets_resueltos / c.tickets_totales) * 100
                                )
                              : 0;
                          return (
                            <tr
                              key={c.id_centro}
                              className={`border-t ${tema.colores.borde} ${tema.colores.hover} transition-all duration-200 animate-slideUp`}
                              style={{ animationDelay: `${idx * 50}ms` }}
                            >
                              <td className="py-4 pr-4">
                                <div className="flex items-center gap-3">
                                  <div
                                    className={`w-10 h-10 rounded-xl bg-gradient-to-br ${tema.colores.gradiente} flex items-center justify-center text-white font-bold shadow-lg`}
                                  >
                                    {c.nombre_centro.charAt(0)}
                                  </div>
                                  <div>
                                    <p
                                      className={`font-bold ${tema.colores.texto}`}
                                    >
                                      {c.nombre_centro}
                                    </p>
                                    <p
                                      className={`text-xs ${tema.colores.textoSecundario} flex items-center gap-1`}
                                    >
                                      <MapPin className="w-3 h-3" />
                                      {c.ciudad}
                                    </p>
                                  </div>
                                </div>
                              </td>
                              <td className="py-4 pr-4 text-center">
                                <p
                                  className={`text-lg font-black ${tema.colores.texto}`}
                                >
                                  {c.tickets_totales}
                                </p>
                                <div className="w-full bg-gray-700/30 rounded-full h-1.5 mt-2">
                                  <div
                                    className="bg-gradient-to-r from-indigo-500 to-purple-500 h-1.5 rounded-full transition-all duration-1000"
                                    style={{ width: `${porcentajeResueltos}%` }}
                                  ></div>
                                </div>
                              </td>
                              <td className="py-4 pr-4 text-center">
                                <span className="text-lg font-black text-emerald-400">
                                  {c.tickets_resueltos}
                                </span>
                              </td>
                              <td className="py-4 pr-4 text-center">
                                <span className="text-lg font-black text-amber-400">
                                  {c.tickets_pendientes}
                                </span>
                              </td>
                              <td className="py-4 pr-4 text-center">
                                <span
                                  className={`inline-flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-black ${
                                    c.sla_cumplido >= 90
                                      ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                                      : c.sla_cumplido >= 75
                                      ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
                                      : "bg-red-500/20 text-red-400 border border-red-500/30"
                                  }`}
                                >
                                  {c.sla_cumplido >= 90 ? (
                                    <CheckCircle2 className="w-4 h-4" />
                                  ) : (
                                    <AlertCircle className="w-4 h-4" />
                                  )}
                                  {c.sla_cumplido.toFixed(1)}%
                                </span>
                              </td>
                              <td className="py-4 pr-4 text-center">
                                <div className="flex items-center justify-center gap-1">
                                  <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                                  <span className="text-lg font-black text-yellow-400">
                                    {c.calificacion_promedio.toFixed(1)}
                                  </span>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Métricas Adicionales Premium */}
              <div
                className={`rounded-2xl p-6 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} transition-all duration-300 hover:shadow-2xl animate-fadeIn`}
              >
                <div className="flex items-center gap-3 mb-6">
                  <div
                    className={`w-12 h-12 bg-gradient-to-br from-rose-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg`}
                  >
                    <BrainCircuit className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className={`text-xl font-black ${tema.colores.texto}`}>
                      Insights Avanzados
                    </h3>
                    <p
                      className={`text-sm font-semibold ${tema.colores.textoSecundario}`}
                    >
                      Análisis inteligente
                    </p>
                  </div>
                </div>

                <div className="space-y-4 max-h-[500px] overflow-y-auto custom-scrollbar pr-2">
                  {metricasRendimiento.length === 0 ? (
                    <>
                      {/* Métricas por defecto cuando no hay datos del API */}
                      <div
                        className={`p-4 rounded-xl ${tema.colores.hover} border ${tema.colores.borde} transition-all duration-200 hover:scale-105 cursor-pointer group`}
                      >
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                            <Clock className="w-5 h-5 text-white" />
                          </div>
                          <div className="flex-1">
                            <p
                              className={`text-sm font-bold ${tema.colores.texto}`}
                            >
                              Tiempo de Respuesta
                            </p>
                            <p
                              className={`text-xs ${tema.colores.textoSecundario}`}
                            >
                              Promedio de primera respuesta
                            </p>
                          </div>
                        </div>
                        <div className="flex items-end justify-between">
                          <div>
                            <p
                              className={`text-3xl font-black ${tema.colores.texto}`}
                            >
                              12
                              <span className="text-sm ml-1">min</span>
                            </p>
                          </div>
                          <div className="flex items-center gap-1 text-emerald-400">
                            <TrendingDown className="w-4 h-4" />
                            <span className="text-sm font-bold">-15%</span>
                          </div>
                        </div>
                      </div>

                      <div
                        className={`p-4 rounded-xl ${tema.colores.hover} border ${tema.colores.borde} transition-all duration-200 hover:scale-105 cursor-pointer group`}
                      >
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                            <CheckCircle2 className="w-5 h-5 text-white" />
                          </div>
                          <div className="flex-1">
                            <p
                              className={`text-sm font-bold ${tema.colores.texto}`}
                            >
                              Tasa de Resolución
                            </p>
                            <p
                              className={`text-xs ${tema.colores.textoSecundario}`}
                            >
                              Tickets resueltos al primer contacto
                            </p>
                          </div>
                        </div>
                        <div className="flex items-end justify-between">
                          <div>
                            <p
                              className={`text-3xl font-black ${tema.colores.texto}`}
                            >
                              87
                              <span className="text-sm ml-1">%</span>
                            </p>
                          </div>
                          <div className="flex items-center gap-1 text-emerald-400">
                            <TrendingUp className="w-4 h-4" />
                            <span className="text-sm font-bold">+8%</span>
                          </div>
                        </div>
                      </div>

                      <div
                        className={`p-4 rounded-xl ${tema.colores.hover} border ${tema.colores.borde} transition-all duration-200 hover:scale-105 cursor-pointer group`}
                      >
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                            <Users className="w-5 h-5 text-white" />
                          </div>
                          <div className="flex-1">
                            <p
                              className={`text-sm font-bold ${tema.colores.texto}`}
                            >
                              Satisfacción Cliente
                            </p>
                            <p
                              className={`text-xs ${tema.colores.textoSecundario}`}
                            >
                              NPS Score promedio
                            </p>
                          </div>
                        </div>
                        <div className="flex items-end justify-between">
                          <div>
                            <p
                              className={`text-3xl font-black ${tema.colores.texto}`}
                            >
                              92
                              <span className="text-sm ml-1">pts</span>
                            </p>
                          </div>
                          <div className="flex items-center gap-1 text-emerald-400">
                            <TrendingUp className="w-4 h-4" />
                            <span className="text-sm font-bold">+5%</span>
                          </div>
                        </div>
                      </div>

                      <div
                        className={`p-4 rounded-xl ${tema.colores.hover} border ${tema.colores.borde} transition-all duration-200 hover:scale-105 cursor-pointer group`}
                      >
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                            <Zap className="w-5 h-5 text-white" />
                          </div>
                          <div className="flex-1">
                            <p
                              className={`text-sm font-bold ${tema.colores.texto}`}
                            >
                              Productividad
                            </p>
                            <p
                              className={`text-xs ${tema.colores.textoSecundario}`}
                            >
                              Tickets por hora
                            </p>
                          </div>
                        </div>
                        <div className="flex items-end justify-between">
                          <div>
                            <p
                              className={`text-3xl font-black ${tema.colores.texto}`}
                            >
                              8.5
                              <span className="text-sm ml-1">/h</span>
                            </p>
                          </div>
                          <div className="flex items-center gap-1 text-emerald-400">
                            <TrendingUp className="w-4 h-4" />
                            <span className="text-sm font-bold">+12%</span>
                          </div>
                        </div>
                      </div>

                      <div
                        className={`p-4 rounded-xl ${tema.colores.hover} border ${tema.colores.borde} transition-all duration-200 hover:scale-105 cursor-pointer group`}
                      >
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-500 to-amber-500 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                            <Award className="w-5 h-5 text-white" />
                          </div>
                          <div className="flex-1">
                            <p
                              className={`text-sm font-bold ${tema.colores.texto}`}
                            >
                              Ranking Mensual
                            </p>
                            <p
                              className={`text-xs ${tema.colores.textoSecundario}`}
                            >
                              Posición entre técnicos
                            </p>
                          </div>
                        </div>
                        <div className="flex items-end justify-between">
                          <div>
                            <p
                              className={`text-3xl font-black ${tema.colores.texto}`}
                            >
                              #3
                              <span className="text-sm ml-1">de 45</span>
                            </p>
                          </div>
                          <div className="flex items-center gap-1 text-emerald-400">
                            <TrendingUp className="w-4 h-4" />
                            <span className="text-sm font-bold">↑2</span>
                          </div>
                        </div>
                      </div>
                    </>
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
                          ? TrendingUp
                          : m.tendencia === "down"
                          ? TrendingDown
                          : Activity;

                      return (
                        <div
                          key={`${m.nombre}-${idx}`}
                          className={`p-4 rounded-xl ${tema.colores.hover} border ${tema.colores.borde} transition-all duration-200 hover:scale-105 cursor-pointer group animate-slideUp`}
                          style={{ animationDelay: `${idx * 50}ms` }}
                        >
                          <div className="flex items-center gap-3 mb-3">
                            <div
                              className={`w-10 h-10 rounded-xl bg-gradient-to-br ${m.color} flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}
                            >
                              <Icono className="w-5 h-5 text-white" />
                            </div>
                            <div className="flex-1">
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
                          </div>
                          <div className="flex items-end justify-between">
                            <div>
                              <p
                                className={`text-3xl font-black ${tema.colores.texto}`}
                              >
                                {m.valor_actual}
                                <span className="text-sm ml-1">
                                  {m.unidad || ""}
                                </span>
                              </p>
                            </div>
                            <div
                              className={`flex items-center gap-1 ${colorTendencia}`}
                            >
                              <IconoTrend className="w-4 h-4" />
                              <span className="text-sm font-bold">
                                {m.porcentaje_cambio > 0 ? "+" : ""}
                                {m.porcentaje_cambio.toFixed(1)}%
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>

            {/* Sección de Exportación Avanzada */}
            <div
              className={`rounded-2xl p-6 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} transition-all duration-300 hover:shadow-2xl animate-fadeIn mb-8`}
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg`}
                  >
                    <Download className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className={`text-xl font-black ${tema.colores.texto}`}>
                      Exportación Profesional
                    </h3>
                    <p
                      className={`text-sm font-semibold ${tema.colores.textoSecundario}`}
                    >
                      Descarga reportes en múltiples formatos
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <button
                  onClick={() =>
                    window.open(
                      `/api/tecnico/reportes/export?formato=excel&rango=${rangoReporte}`,
                      "_blank"
                    )
                  }
                  className={`flex items-center gap-3 p-4 rounded-xl ${tema.colores.hover} border ${tema.colores.borde} transition-all duration-300 hover:scale-105 hover:shadow-lg group`}
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <FileSpreadsheet className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-left flex-1">
                    <p className={`text-sm font-bold ${tema.colores.texto}`}>
                      Excel Completo
                    </p>
                    <p className={`text-xs ${tema.colores.textoSecundario}`}>
                      .xlsx con gráficos
                    </p>
                  </div>
                  <ArrowUpRight className="w-5 h-5 text-gray-500 group-hover:text-emerald-400 transition-colors" />
                </button>

                <button
                  onClick={() => window.print()}
                  className={`flex items-center gap-3 p-4 rounded-xl ${tema.colores.hover} border ${tema.colores.borde} transition-all duration-300 hover:scale-105 hover:shadow-lg group`}
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-pink-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <FileText className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-left flex-1">
                    <p className={`text-sm font-bold ${tema.colores.texto}`}>
                      PDF Premium
                    </p>
                    <p className={`text-xs ${tema.colores.textoSecundario}`}>
                      Formato ejecutivo
                    </p>
                  </div>
                  <ArrowUpRight className="w-5 h-5 text-gray-500 group-hover:text-pink-400 transition-colors" />
                </button>

                <button
                  onClick={() =>
                    window.open(
                      `/api/tecnico/reportes/export?formato=csv&rango=${rangoReporte}`,
                      "_blank"
                    )
                  }
                  className={`flex items-center gap-3 p-4 rounded-xl ${tema.colores.hover} border ${tema.colores.borde} transition-all duration-300 hover:scale-105 hover:shadow-lg group`}
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Database className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-left flex-1">
                    <p className={`text-sm font-bold ${tema.colores.texto}`}>
                      CSV Data
                    </p>
                    <p className={`text-xs ${tema.colores.textoSecundario}`}>
                      Datos tabulares
                    </p>
                  </div>
                  <ArrowUpRight className="w-5 h-5 text-gray-500 group-hover:text-cyan-400 transition-colors" />
                </button>

                <button
                  onClick={() =>
                    window.open(
                      `/api/tecnico/reportes/export?formato=json&rango=${rangoReporte}`,
                      "_blank"
                    )
                  }
                  className={`flex items-center gap-3 p-4 rounded-xl ${tema.colores.hover} border ${tema.colores.borde} transition-all duration-300 hover:scale-105 hover:shadow-lg group`}
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Cpu className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-left flex-1">
                    <p className={`text-sm font-bold ${tema.colores.texto}`}>
                      JSON API
                    </p>
                    <p className={`text-xs ${tema.colores.textoSecundario}`}>
                      Para integración
                    </p>
                  </div>
                  <ArrowUpRight className="w-5 h-5 text-gray-500 group-hover:text-purple-400 transition-colors" />
                </button>
              </div>
            </div>
          </>
        )}
      </main>

      {/* FOOTER PREMIUM */}
      <footer
        className={`transition-all duration-300 ${
          sidebarAbierto ? "ml-72" : "ml-20"
        } ${tema.colores.card} ${tema.colores.borde} border-t py-8 mt-12`}
      >
        <div className="max-w-[1920px] mx-auto px-8">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
            <div className="flex flex-col items-center lg:items-start gap-3">
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 bg-gradient-to-br ${tema.colores.gradiente} rounded-xl flex items-center justify-center shadow-lg`}
                >
                  <BarChart3 className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className={`text-sm font-black ${tema.colores.texto}`}>
                    AnyssaMed Analytics Pro
                  </p>
                  <p className={`text-xs ${tema.colores.textoSecundario}`}>
                    Sistema de Reportes Técnicos Premium
                  </p>
                </div>
              </div>
              <p
                className={`text-xs font-semibold ${tema.colores.textoSecundario}`}
              >
                © 2025 AnyssaMed. Todos los derechos reservados. v2.0.0
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-6">
              <Link
                href="/ayuda"
                className={`text-sm font-bold transition-all duration-200 ${tema.colores.textoSecundario} hover:${tema.colores.acento} flex items-center gap-2`}
              >
                <Lightbulb className="w-4 h-4" />
                Ayuda
              </Link>
              <Link
                href="/documentacion"
                className={`text-sm font-bold transition-all duration-200 ${tema.colores.textoSecundario} hover:${tema.colores.acento} flex items-center gap-2`}
              >
                <FileText className="w-4 h-4" />
                Documentación
              </Link>
              <Link
                href="/privacidad"
                className={`text-sm font-bold transition-all duration-200 ${tema.colores.textoSecundario} hover:${tema.colores.acento} flex items-center gap-2`}
              >
                <Shield className="w-4 h-4" />
                Privacidad
              </Link>
              <Link
                href="/terminos"
                className={`text-sm font-bold transition-all duration-200 ${tema.colores.textoSecundario} hover:${tema.colores.acento} flex items-center gap-2`}
              >
                <FileText className="w-4 h-4" />
                Términos
              </Link>
              <button
                onClick={cerrarSesion}
                className={`text-sm font-bold transition-all duration-200 ${tema.colores.textoSecundario} hover:text-red-400 flex items-center gap-2`}
              >
                <LogOut className="w-4 h-4" />
                Cerrar Sesión
              </button>
            </div>

            <div className="flex items-center gap-3">
              <span
                className={`px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r ${tema.colores.gradiente} text-white shadow-lg`}
              >
                PRO VERSION
              </span>
              <span
                className={`px-4 py-2 rounded-xl text-xs font-bold ${tema.colores.secundario} ${tema.colores.texto}`}
              >
                Build 2025.01
              </span>
            </div>
          </div>

          {/* Barra de estado del sistema */}
          <div className="mt-6 pt-6 border-t border-gray-700/30">
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <p className={`text-xs font-bold ${tema.colores.texto}`}>
                    Sistema
                  </p>
                </div>
                <p className={`text-xs ${tema.colores.textoSecundario}`}>
                  Operativo
                </p>
              </div>

              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <Database className="w-3 h-3 text-blue-400" />
                  <p className={`text-xs font-bold ${tema.colores.texto}`}>
                    Base de Datos
                  </p>
                </div>
                <p className={`text-xs ${tema.colores.textoSecundario}`}>
                  Conectada
                </p>
              </div>

              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <Zap className="w-3 h-3 text-yellow-400" />
                  <p className={`text-xs font-bold ${tema.colores.texto}`}>
                    API
                  </p>
                </div>
                <p className={`text-xs ${tema.colores.textoSecundario}`}>
                  Activa
                </p>
              </div>

              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <Clock className="w-3 h-3 text-purple-400" />
                  <p className={`text-xs font-bold ${tema.colores.texto}`}>
                    Última Actualización
                  </p>
                </div>
                <p className={`text-xs ${tema.colores.textoSecundario}`}>
                  {new Date().toLocaleTimeString("es-CL", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>

              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <Shield className="w-3 h-3 text-green-400" />
                  <p className={`text-xs font-bold ${tema.colores.texto}`}>
                    Seguridad
                  </p>
                </div>
                <p className={`text-xs ${tema.colores.textoSecundario}`}>
                  SSL Activo
                </p>
              </div>

              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <Users className="w-3 h-3 text-indigo-400" />
                  <p className={`text-xs font-bold ${tema.colores.texto}`}>
                    Usuarios Activos
                  </p>
                </div>
                <p className={`text-xs ${tema.colores.textoSecundario}`}>
                  {estadisticas?.tickets_asignados_hoy || 0}
                </p>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* ESTILOS GLOBALES PREMIUM */}
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
          font-family: "Inter", "Segoe UI", "Roboto", sans-serif;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
          overflow-x: hidden;
        }

        /* Scrollbar Premium */
        .custom-scrollbar::-webkit-scrollbar {
          width: 10px;
          height: 10px;
        }

        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.1);
          border-radius: 10px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(
            180deg,
            rgba(99, 102, 241, 0.8),
            rgba(168, 85, 247, 0.8)
          );
          border-radius: 10px;
          transition: all 0.3s ease;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(
            180deg,
            rgba(99, 102, 241, 1),
            rgba(168, 85, 247, 1)
          );
          box-shadow: 0 0 10px rgba(99, 102, 241, 0.5);
        }

        .custom-scrollbar {
          scrollbar-color: rgba(99, 102, 241, 0.8) rgba(0, 0, 0, 0.1);
          scrollbar-width: thin;
        }

        /* Animaciones Premium */
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slideRight {
          from {
            opacity: 0;
            transform: translateX(-30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes pulse {
          0%,
          100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }

        @keyframes shimmer {
          0% {
            background-position: -1000px 0;
          }
          100% {
            background-position: 1000px 0;
          }
        }

        @keyframes glow {
          0%,
          100% {
            box-shadow: 0 0 20px rgba(99, 102, 241, 0.5);
          }
          50% {
            box-shadow: 0 0 40px rgba(99, 102, 241, 0.8);
          }
        }

        @keyframes float {
          0%,
          100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-10px);
          }
        }

        @keyframes rotate {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
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

        .animate-fadeIn {
          animation: fadeIn 0.6s ease-out forwards;
        }

        .animate-slideUp {
          animation: slideUp 0.6s ease-out forwards;
        }

        .animate-slideDown {
          animation: slideDown 0.4s ease-out forwards;
        }

        .animate-slideRight {
          animation: slideRight 0.6s ease-out forwards;
        }

        .animate-scaleIn {
          animation: scaleIn 0.4s ease-out forwards;
        }

        .animate-pulse {
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }

        .animate-shimmer {
          animation: shimmer 2s linear infinite;
          background: linear-gradient(
            90deg,
            rgba(255, 255, 255, 0) 0%,
            rgba(255, 255, 255, 0.1) 50%,
            rgba(255, 255, 255, 0) 100%
          );
          background-size: 1000px 100%;
        }

        .animate-glow {
          animation: glow 2s ease-in-out infinite;
        }

        .animate-float {
          animation: float 3s ease-in-out infinite;
        }

        .animate-rotate {
          animation: rotate 2s linear infinite;
        }

        .animate-wave {
          animation: wave 1s ease-in-out infinite;
          transform-origin: 70% 70%;
          display: inline-block;
        }

        /* Efectos de Glassmorphism */
        .glass-effect {
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .glass-effect-dark {
          background: rgba(0, 0, 0, 0.2);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.05);
        }

        /* Efectos de Hover Premium */
        .hover-lift {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .hover-lift:hover {
          transform: translateY(-8px) scale(1.02);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
        }

        .hover-glow:hover {
          box-shadow: 0 0 30px rgba(99, 102, 241, 0.6);
          border-color: rgba(99, 102, 241, 0.8);
        }

        /* Gradientes Animados */
        .gradient-animate {
          background: linear-gradient(
            -45deg,
            #6366f1,
            #8b5cf6,
            #ec4899,
            #f59e0b
          );
          background-size: 400% 400%;
          animation: gradientShift 15s ease infinite;
        }

        @keyframes gradientShift {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }

        /* Efectos de Texto */
        .text-gradient {
          background: linear-gradient(
            135deg,
            #667eea 0%,
            #764ba2 50%,
            #f093fb 100%
          );
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .text-glow {
          text-shadow: 0 0 10px rgba(99, 102, 241, 0.5),
            0 0 20px rgba(99, 102, 241, 0.3);
        }

        /* Skeleton Loading Premium */
        .skeleton {
          background: linear-gradient(
            90deg,
            rgba(255, 255, 255, 0.05) 25%,
            rgba(255, 255, 255, 0.1) 50%,
            rgba(255, 255, 255, 0.05) 75%
          );
          background-size: 200% 100%;
          animation: loading 1.5s ease-in-out infinite;
        }

        @keyframes loading {
          0% {
            background-position: 200% 0;
          }
          100% {
            background-position: -200% 0;
          }
        }

        /* Efectos de Partículas */
        .particle-effect::before {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: radial-gradient(
            circle at 50% 50%,
            rgba(99, 102, 241, 0.1) 0%,
            transparent 50%
          );
          animation: particlePulse 3s ease-in-out infinite;
        }

        @keyframes particlePulse {
          0%,
          100% {
            opacity: 0.3;
            transform: scale(1);
          }
          50% {
            opacity: 0.6;
            transform: scale(1.1);
          }
        }

        /* Responsive Design Premium */
        @media (max-width: 1536px) {
          .container-premium {
            max-width: 1280px;
          }
        }

        @media (max-width: 1280px) {
          .container-premium {
            max-width: 1024px;
          }
        }

        @media (max-width: 1024px) {
          .container-premium {
            max-width: 768px;
          }

          .grid-responsive {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 768px) {
          .container-premium {
            max-width: 640px;
            padding: 0 1rem;
          }

          .grid-responsive {
            grid-template-columns: 1fr;
          }

          .text-responsive {
            font-size: 0.875rem;
          }

          .hide-mobile {
            display: none;
          }

          .show-mobile {
            display: block;
          }
        }

        @media (max-width: 640px) {
          .container-premium {
            max-width: 100%;
            padding: 0 0.75rem;
          }

          .text-responsive-sm {
            font-size: 0.75rem;
          }
        }

        /* Efectos de Impresión */
        @media print {
          .no-print {
            display: none !important;
          }

          body {
            background: white !important;
            color: black !important;
          }

          .print-break {
            page-break-after: always;
          }

          .print-avoid-break {
            page-break-inside: avoid;
          }

          * {
            box-shadow: none !important;
            text-shadow: none !important;
          }
        }

        /* Accesibilidad */
        @media (prefers-reduced-motion: reduce) {
          *,
          *::before,
          *::after {
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

        /* Focus States Premium */
        *:focus {
          outline: 2px solid rgba(99, 102, 241, 0.5);
          outline-offset: 2px;
        }

        *:focus:not(:focus-visible) {
          outline: none;
        }

        *:focus-visible {
          outline: 2px solid rgba(99, 102, 241, 0.8);
          outline-offset: 2px;
          box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.2);
        }

        /* Selection Premium */
        ::selection {
          background: rgba(99, 102, 241, 0.3);
          color: white;
        }

        ::-moz-selection {
          background: rgba(99, 102, 241, 0.3);
          color: white;
        }

        /* Tooltips Premium */
        [data-tooltip] {
          position: relative;
        }

        [data-tooltip]::before {
          content: attr(data-tooltip);
          position: absolute;
          bottom: 100%;
          left: 50%;
          transform: translateX(-50%) translateY(-8px);
          padding: 8px 12px;
          background: rgba(0, 0, 0, 0.9);
          color: white;
          font-size: 12px;
          font-weight: 600;
          border-radius: 8px;
          white-space: nowrap;
          opacity: 0;
          pointer-events: none;
          transition: all 0.3s ease;
          z-index: 1000;
        }

        [data-tooltip]::after {
          content: "";
          position: absolute;
          bottom: 100%;
          left: 50%;
          transform: translateX(-50%);
          border: 6px solid transparent;
          border-top-color: rgba(0, 0, 0, 0.9);
          opacity: 0;
          pointer-events: none;
          transition: all 0.3s ease;
        }

        [data-tooltip]:hover::before,
        [data-tooltip]:hover::after {
          opacity: 1;
        }

        /* Loading States Premium */
        .loading-spinner {
          border: 3px solid rgba(99, 102, 241, 0.1);
          border-top-color: rgba(99, 102, 241, 0.8);
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        /* Card Hover Effects Premium */
        .card-premium {
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          overflow: hidden;
        }

        .card-premium::before {
          content: "";
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(255, 255, 255, 0.1),
            transparent
          );
          transition: left 0.5s ease;
        }

        .card-premium:hover::before {
          left: 100%;
        }

        .card-premium:hover {
          transform: translateY(-8px) scale(1.02);
          box-shadow: 0 20px 40px rgba(99, 102, 241, 0.3);
        }

        /* Badge Premium */
        .badge-premium {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          border-radius: 9999px;
          font-size: 12px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
          animation: badgePulse 2s ease-in-out infinite;
        }

        @keyframes badgePulse {
          0%,
          100% {
            box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
          }
          50% {
            box-shadow: 0 6px 20px rgba(102, 126, 234, 0.6);
          }
        }

        /* Progress Bar Premium */
        .progress-bar-premium {
          position: relative;
          height: 8px;
          background: rgba(99, 102, 241, 0.1);
          border-radius: 9999px;
          overflow: hidden;
        }

        .progress-bar-premium::before {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          height: 100%;
          background: linear-gradient(
            90deg,
            #667eea 0%,
            #764ba2 50%,
            #f093fb 100%
          );
          border-radius: 9999px;
          transition: width 1s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .progress-bar-premium::after {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 100%;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(255, 255, 255, 0.3),
            transparent
          );
          animation: progressShine 2s ease-in-out infinite;
        }

        @keyframes progressShine {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }

        /* Button Premium Effects */
        .btn-premium {
          position: relative;
          overflow: hidden;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .btn-premium::before {
          content: "";
          position: absolute;
          top: 50%;
          left: 50%;
          width: 0;
          height: 0;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.2);
          transform: translate(-50%, -50%);
          transition: width 0.6s ease, height 0.6s ease;
        }

        .btn-premium:hover::before {
          width: 300px;
          height: 300px;
        }

        .btn-premium:active {
          transform: scale(0.95);
        }

        /* Chart Animations */
        .recharts-surface {
          overflow: visible;
        }

        .recharts-layer {
          animation: chartFadeIn 1s ease-out;
        }

        @keyframes chartFadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* Table Premium */
        .table-premium {
          border-collapse: separate;
          border-spacing: 0;
        }

        .table-premium thead tr {
          background: linear-gradient(
            135deg,
            rgba(99, 102, 241, 0.1) 0%,
            rgba(168, 85, 247, 0.1) 100%
          );
        }

        .table-premium tbody tr {
          transition: all 0.3s ease;
        }

        .table-premium tbody tr:hover {
          background: rgba(99, 102, 241, 0.05);
          transform: scale(1.01);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        /* Modal Premium */
        .modal-overlay {
          background: rgba(0, 0, 0, 0.7);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
        }

        .modal-content {
          animation: modalSlideUp 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }

        @keyframes modalSlideUp {
          from {
            opacity: 0;
            transform: translateY(50px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        /* Notification Premium */
        .notification-premium {
          animation: notificationSlide 0.5s cubic-bezier(0.4, 0, 0.2, 1);
        }

        @keyframes notificationSlide {
          from {
            opacity: 0;
            transform: translateX(100%);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        /* Dark Mode Optimizations */
        @media (prefers-color-scheme: dark) {
          .auto-dark {
            filter: brightness(0.9) contrast(1.1);
          }
        }

        /* High Contrast Mode */
        @media (prefers-contrast: high) {
          * {
            border-width: 2px !important;
          }

          .text-gradient {
            -webkit-text-fill-color: currentColor;
            background: none;
          }
        }

        /* Performance Optimizations */
        .will-change-transform {
          will-change: transform;
        }

        .will-change-opacity {
          will-change: opacity;
        }

        .gpu-accelerated {
          transform: translateZ(0);
          backface-visibility: hidden;
          perspective: 1000px;
        }
      `}</style>
    </div>
  );
}
