// src/app/(dashboard)/tecnico/reportes/equipos/page.tsx
"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import SidebarTecnico from "@/components/tecnico/SidebarTecnico";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

import {
  Activity,
  AlertCircle,
  AlertOctagon,
  AlertTriangle,
  Archive,
  ArrowDownRight,
  ArrowLeft,
  ArrowUpRight,
  Award,
  BarChart3,
  Battery,
  BatteryCharging,
  BatteryLow,
  Bell,
  BellOff,
  BookOpen,
  Box,
  Brain,
  BrainCircuit,
  Building2,
  Calendar,
  CalendarClock,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock,
  Clock3,
  ClipboardCheck,
  ClipboardList,
  Cpu,
  Database,
  Download,
  Edit,
  Eye,
  FileSpreadsheet,
  FileText,
  Filter,
  Flame,
  FolderOpen,
  Globe,
  HardDrive,
  Hash,
  Heart,
  HeartPulse,
  History,
  Inbox,
  Info,
  Layers,
  Lightbulb,
  LineChart,
  Loader2,
  Lock,
  LogOut,
  Mail,
  MapPin,
  Maximize2,
  Medal,
  MessageSquare,
  Minimize2,
  Monitor,
  Moon,
  MoreVertical,
  Package,
  Pause,
  Percent,
  Phone,
  PieChart,
  Play,
  Plus,
  Power,
  Printer,
  Radio,
  RefreshCw,
  Rocket,
  Save,
  Search,
  Send,
  Server,
  Settings,
  Share2,
  Shield,
  ShieldCheck,
  Sparkles,
  Star,
  Sun,
  Tag,
  Target,
  ThumbsDown,
  ThumbsUp,
  TrendingDown,
  TrendingUp,
  Trophy,
  Truck,
  User,
  UserCheck,
  UserCog,
  Users,
  Wifi,
  WifiOff,
  Wrench,
  X,
  XCircle,
  Zap,
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
  ComposedChart,
  Scatter,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  RadialBarChart,
  RadialBar,
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

interface Equipo {
  id_equipo: number;
  codigo_equipo: string;
  nombre: string;
  marca: string;
  modelo: string;
  numero_serie: string;
  tipo_equipo: string;
  categoria: string;
  estado: "operativo" | "en_mantenimiento" | "fuera_servicio" | "en_reparacion" | "dado_de_baja";
  estado_operativo: "excelente" | "bueno" | "regular" | "malo" | "critico";
  ubicacion: string;
  centro: {
    id_centro: number;
    nombre: string;
    ciudad: string;
  };
  fecha_adquisicion: string;
  fecha_ultimo_mantenimiento: string | null;
  fecha_proximo_mantenimiento: string | null;
  vida_util_anos: number;
  anos_uso: number;
  porcentaje_vida_util: number;
  criticidad: "baja" | "media" | "alta" | "critica";
  requiere_calibracion: boolean;
  requiere_mantenimiento_urgente: boolean;
  total_mantenimientos: number;
  total_fallas: number;
  tiempo_fuera_servicio_horas: number;
  disponibilidad_porcentaje: number;
  costo_mantenimiento_total: number;
  valor_actual: number;
  tags: string[];
}

interface EstadisticasEquipos {
  total_equipos: number;
  operativos: number;
  en_mantenimiento: number;
  fuera_servicio: number;
  en_reparacion: number;
  dados_de_baja: number;
  disponibilidad_promedio: number;
  equipos_criticos: number;
  mantenimientos_pendientes: number;
  calibraciones_pendientes: number;
  costo_mantenimiento_total: number;
  valor_total_equipos: number;
}

interface DistribucionTipo {
  tipo: string;
  cantidad: number;
  porcentaje: number;
  color: string;
}

interface DistribucionEstado {
  estado: string;
  cantidad: number;
  porcentaje: number;
  color: string;
}

interface DistribucionCriticidad {
  criticidad: string;
  cantidad: number;
  porcentaje: number;
  color: string;
}

interface TendenciaMantenimiento {
  mes: string;
  preventivos: number;
  correctivos: number;
  calibraciones: number;
}

interface EquiposPorCentro {
  centro: string;
  total: number;
  operativos: number;
  en_mantenimiento: number;
  disponibilidad: number;
}

interface EquiposCriticos {
  id_equipo: number;
  codigo_equipo: string;
  nombre: string;
  tipo: string;
  estado: string;
  criticidad: string;
  dias_sin_mantenimiento: number;
  razon_critica: string;
}

interface AnalisisVidaUtil {
  rango: string;
  cantidad: number;
  porcentaje: number;
}

type FiltroEstado = "todos" | "operativo" | "en_mantenimiento" | "fuera_servicio" | "en_reparacion" | "dado_de_baja";
type FiltroCriticidad = "todos" | "baja" | "media" | "alta" | "critica";
type FiltroTipo = "todos" | string;
type OrdenColumna = "codigo_equipo" | "nombre" | "estado" | "criticidad" | "disponibilidad" | "fecha_ultimo_mantenimiento";
type DireccionOrden = "asc" | "desc";

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
// COMPONENTE: Custom Tooltip
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
              {typeof entry.value === "number" ? entry.value.toFixed(1) : entry.value}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

// ========================================
// COMPONENTE: Skeleton Loader
// ========================================

const SkeletonCard = ({ tema }: { tema: ConfiguracionTema }) => (
  <div
    className={`rounded-2xl p-6 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} animate-pulse`}
  >
    <div className="flex items-center justify-between mb-4">
      <div className="w-12 h-12 bg-gray-700 rounded-xl"></div>
      <div className="w-16 h-6 bg-gray-700 rounded"></div>
    </div>
    <div className="space-y-3">
      <div className="h-4 bg-gray-700 rounded w-3/4"></div>
      <div className="h-8 bg-gray-700 rounded w-1/2"></div>
      <div className="h-3 bg-gray-700 rounded w-2/3"></div>
    </div>
  </div>
);

const SkeletonTable = ({ tema }: { tema: ConfiguracionTema }) => (
  <div className="space-y-3">
    {[1, 2, 3, 4, 5].map((i) => (
      <div
        key={i}
        className={`p-4 rounded-xl ${tema.colores.card} ${tema.colores.borde} border animate-pulse`}
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gray-700 rounded-xl"></div>
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-700 rounded w-3/4"></div>
            <div className="h-3 bg-gray-700 rounded w-1/2"></div>
          </div>
          <div className="w-20 h-8 bg-gray-700 rounded"></div>
        </div>
      </div>
    ))}
  </div>
);

// ========================================
// COMPONENTE PRINCIPAL
// ========================================

export default function ReportesEquiposTecnicoPage() {
  const router = useRouter();

  // Estados
  const [usuario, setUsuario] = useState<UsuarioSesion | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingEquipos, setLoadingEquipos] = useState(true);
  const [estadisticas, setEstadisticas] = useState<EstadisticasTecnico | null>(null);
  const [estadisticasEquipos, setEstadisticasEquipos] = useState<EstadisticasEquipos | null>(null);
  const [equipos, setEquipos] = useState<Equipo[]>([]);
  const [distribucionTipo, setDistribucionTipo] = useState<DistribucionTipo[]>([]);
  const [distribucionEstado, setDistribucionEstado] = useState<DistribucionEstado[]>([]);
  const [distribucionCriticidad, setDistribucionCriticidad] = useState<DistribucionCriticidad[]>([]);
  const [tendenciaMantenimiento, setTendenciaMantenimiento] = useState<TendenciaMantenimiento[]>([]);
  const [equiposPorCentro, setEquiposPorCentro] = useState<EquiposPorCentro[]>([]);
  const [equiposCriticos, setEquiposCriticos] = useState<EquiposCriticos[]>([]);
  const [analisisVidaUtil, setAnalisisVidaUtil] = useState<AnalisisVidaUtil[]>([]);

  const [temaActual, setTemaActual] = useState<TemaColor>("dark");
  const [sidebarAbierto, setSidebarAbierto] = useState(true);
  const [notificacionesAbiertas, setNotificacionesAbiertas] = useState(false);
  const [perfilAbierto, setPerfilAbierto] = useState(false);
  const [busqueda, setBusqueda] = useState("");
  const [disponibilidad, setDisponibilidad] = useState<
    "disponible" | "ocupado" | "fuera_servicio"
  >("disponible");

  // Filtros y ordenamiento
  const [filtroEstado, setFiltroEstado] = useState<FiltroEstado>("todos");
  const [filtroCriticidad, setFiltroCriticidad] = useState<FiltroCriticidad>("todos");
  const [filtroTipo, setFiltroTipo] = useState<FiltroTipo>("todos");
  const [ordenColumna, setOrdenColumna] = useState<OrdenColumna>("codigo_equipo");
  const [direccionOrden, setDireccionOrden] = useState<DireccionOrden>("asc");
  const [paginaActual, setPaginaActual] = useState(1);
  const [equiposPorPagina] = useState(10);
  const [equipoSeleccionado, setEquipoSeleccionado] = useState<Equipo | null>(null);
  const [modalDetalleAbierto, setModalDetalleAbierto] = useState(false);
  const [vistaActual, setVistaActual] = useState<"tabla" | "tarjetas">("tabla");
  const [rangoFechas, setRangoFechas] = useState<"30d" | "90d" | "180d" | "anio">("30d");

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
            alert("Acceso denegado. Este panel es solo para técnicos.");
            router.push("/");
            return;
          }

          if (!result.usuario.tecnico) {
            alert("Tu usuario no está vinculado a un registro de técnico.");
            router.push("/");
            return;
          }

          setUsuario(result.usuario);
          setDisponibilidad(result.usuario.tecnico.disponibilidad);
        } else {
          router.push("/login");
        }
      } catch (error) {
        console.error("Error al cargar usuario:", error);
        router.push("/login");
      } finally {
        setLoading(false);
      }
    };

    cargarDatosUsuario();
  }, [router]);

  useEffect(() => {
    if (usuario?.tecnico?.id_tecnico) {
      cargarEquipos();
    }
  }, [usuario, rangoFechas]);

  useEffect(() => {
    if (!usuario?.tecnico?.id_tecnico) return;

    const interval = setInterval(() => {
      cargarEquipos();
    }, 300000); // 5 min

    return () => clearInterval(interval);
  }, [usuario, rangoFechas]);

  // ========================================
  // FUNCIONES
  // ========================================

  const cargarEquipos = async () => {
    if (!usuario?.tecnico?.id_tecnico) return;

    try {
      setLoadingEquipos(true);

      const params = new URLSearchParams({
        id_tecnico: String(usuario.tecnico.id_tecnico),
        rango: rangoFechas,
      });

      const res = await fetch(`/api/tecnico/equipos?${params.toString()}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      const data = await res.json().catch(() => ({ success: false }));

      if (!res.ok || !data.success) {
        console.error("Error al cargar equipos:", data);
        return;
      }

      // Actualizar con datos del API
      if (data.estadisticas_equipos) setEstadisticasEquipos(data.estadisticas_equipos);
      if (data.equipos) setEquipos(data.equipos);
      if (data.distribucion_tipo) setDistribucionTipo(data.distribucion_tipo);
      if (data.distribucion_estado) setDistribucionEstado(data.distribucion_estado);
      if (data.distribucion_criticidad) setDistribucionCriticidad(data.distribucion_criticidad);
      if (data.tendencia_mantenimiento) setTendenciaMantenimiento(data.tendencia_mantenimiento);
      if (data.equipos_por_centro) setEquiposPorCentro(data.equipos_por_centro);
      if (data.equipos_criticos) setEquiposCriticos(data.equipos_criticos);
      if (data.analisis_vida_util) setAnalisisVidaUtil(data.analisis_vida_util);
      if (data.estadisticas) setEstadisticas(data.estadisticas);
    } catch (err) {
      console.error("Error al cargar equipos:", err);
    } finally {
      setLoadingEquipos(false);
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
      router.push("/login");
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
      console.error("No se pudo guardar preferencia:", err);
    }
  };

  const obtenerColorEstado = (estado: string) => {
    const isDark = ["dark", "blue", "purple", "green"].includes(temaActual);
    const colores: { [key: string]: string } = {
      operativo: isDark
        ? "bg-green-500/20 text-green-400 border-green-500/30"
        : "bg-green-100 text-green-800 border-green-200",
      en_mantenimiento: isDark
        ? "bg-blue-500/20 text-blue-400 border-blue-500/30"
        : "bg-blue-100 text-blue-800 border-blue-200",
      fuera_servicio: isDark
        ? "bg-red-500/20 text-red-400 border-red-500/30"
        : "bg-red-100 text-red-800 border-red-200",
      en_reparacion: isDark
        ? "bg-orange-500/20 text-orange-400 border-orange-500/30"
        : "bg-orange-100 text-orange-800 border-orange-200",
      dado_de_baja: isDark
        ? "bg-gray-500/20 text-gray-400 border-gray-500/30"
        : "bg-gray-100 text-gray-800 border-gray-200",
    };
    return colores[estado.toLowerCase()] || colores.operativo;
  };

  const obtenerColorCriticidad = (criticidad: string) => {
    const isDark = ["dark", "blue", "purple", "green"].includes(temaActual);
    const colores: { [key: string]: string } = {
      critica: isDark
        ? "bg-red-500/20 text-red-400 border-red-500/30"
        : "bg-red-100 text-red-800 border-red-200",
      alta: isDark
        ? "bg-orange-500/20 text-orange-400 border-orange-500/30"
        : "bg-orange-100 text-orange-800 border-orange-200",
      media: isDark
        ? "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
        : "bg-yellow-100 text-yellow-800 border-yellow-200",
      baja: isDark
        ? "bg-green-500/20 text-green-400 border-green-500/30"
        : "bg-green-100 text-green-800 border-green-200",
    };
    return colores[criticidad.toLowerCase()] || colores.media;
  };

  const obtenerColorEstadoOperativo = (estado: string) => {
    const colores: { [key: string]: string } = {
      excelente: "text-green-400",
      bueno: "text-blue-400",
      regular: "text-yellow-400",
      malo: "text-orange-400",
      critico: "text-red-400",
    };
    return colores[estado.toLowerCase()] || colores.bueno;
  };

  const obtenerIconoEstado = (estado: string) => {
    const iconos: { [key: string]: any } = {
      operativo: CheckCircle2,
      en_mantenimiento: Wrench,
      fuera_servicio: XCircle,
      en_reparacion: Wrench,
      dado_de_baja: Archive,
    };
    return iconos[estado.toLowerCase()] || CheckCircle2;
  };

  const obtenerIconoCriticidad = (criticidad: string) => {
    const iconos: { [key: string]: any } = {
      critica: Flame,
      alta: AlertTriangle,
      media: Info,
      baja: CheckCircle2,
    };
    return iconos[criticidad.toLowerCase()] || Info;
  };

  const obtenerIconoTipo = (tipo: string) => {
    const iconos: { [key: string]: any } = {
      "Equipo Médico": HeartPulse,
      "Equipo de Diagnóstico": Activity,
      "Equipo de Laboratorio": Server,
      "Equipo de Cómputo": Monitor,
      "Equipo de Comunicación": Radio,
      "Equipo de Infraestructura": Building2,
    };
    return iconos[tipo] || Package;
  };

  const formatearFecha = (fecha: string | null) => {
    if (!fecha) return "N/A";
    const date = new Date(fecha);
    if (isNaN(date.getTime())) return "N/A";
    return new Intl.DateTimeFormat("es-CL", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(date);
  };

  const formatearMoneda = (valor: number) => {
    return new Intl.NumberFormat("es-CL", {
      style: "currency",
      currency: "CLP",
      minimumFractionDigits: 0,
    }).format(valor);
  };

  const calcularDiasSinMantenimiento = (fechaUltimoMantenimiento: string | null) => {
    if (!fechaUltimoMantenimiento) return 999;
    const ahora = new Date();
    const ultimo = new Date(fechaUltimoMantenimiento);
    const diffMs = ahora.getTime() - ultimo.getTime();
    return Math.floor(diffMs / (1000 * 60 * 60 * 24));
  };

  const handleOrdenar = (columna: OrdenColumna) => {
    if (ordenColumna === columna) {
      setDireccionOrden(direccionOrden === "asc" ? "desc" : "asc");
    } else {
      setOrdenColumna(columna);
      setDireccionOrden("asc");
    }
  };

  const abrirDetalleEquipo = (equipo: Equipo) => {
    setEquipoSeleccionado(equipo);
    setModalDetalleAbierto(true);
  };

  const cerrarDetalleEquipo = () => {
    setEquipoSeleccionado(null);
    setModalDetalleAbierto(false);
  };

  // Tipos únicos para filtro
  const tiposUnicos = useMemo(() => {
    return Array.from(new Set(equipos.map((e) => e.tipo_equipo)));
  }, [equipos]);

  // Filtrado y ordenamiento
  const equiposFiltrados = useMemo(() => {
    let resultado = [...equipos];

    // Filtro por búsqueda
    if (busqueda) {
      resultado = resultado.filter(
        (e) =>
          e.codigo_equipo.toLowerCase().includes(busqueda.toLowerCase()) ||
          e.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
          e.marca.toLowerCase().includes(busqueda.toLowerCase()) ||
          e.modelo.toLowerCase().includes(busqueda.toLowerCase()) ||
          e.numero_serie.toLowerCase().includes(busqueda.toLowerCase())
      );
    }

    // Filtro por estado
    if (filtroEstado !== "todos") {
      resultado = resultado.filter((e) => e.estado === filtroEstado);
    }

    // Filtro por criticidad
    if (filtroCriticidad !== "todos") {
      resultado = resultado.filter((e) => e.criticidad === filtroCriticidad);
    }

    // Filtro por tipo
    if (filtroTipo !== "todos") {
      resultado = resultado.filter((e) => e.tipo_equipo === filtroTipo);
    }

    // Ordenamiento
    resultado.sort((a, b) => {
      let comparacion = 0;

      switch (ordenColumna) {
        case "codigo_equipo":
          comparacion = a.codigo_equipo.localeCompare(b.codigo_equipo);
          break;
        case "nombre":
          comparacion = a.nombre.localeCompare(b.nombre);
          break;
        case "estado":
          comparacion = a.estado.localeCompare(b.estado);
          break;
        case "criticidad":
          const criticidades = { critica: 4, alta: 3, media: 2, baja: 1 };
          comparacion = criticidades[a.criticidad] - criticidades[b.criticidad];
          break;
        case "disponibilidad":
          comparacion = a.disponibilidad_porcentaje - b.disponibilidad_porcentaje;
          break;
        case "fecha_ultimo_mantenimiento":
          const fechaA = a.fecha_ultimo_mantenimiento
            ? new Date(a.fecha_ultimo_mantenimiento).getTime()
            : 0;
          const fechaB = b.fecha_ultimo_mantenimiento
            ? new Date(b.fecha_ultimo_mantenimiento).getTime()
            : 0;
          comparacion = fechaA - fechaB;
          break;
      }

      return direccionOrden === "asc" ? comparacion : -comparacion;
    });

    return resultado;
  }, [equipos, busqueda, filtroEstado, filtroCriticidad, filtroTipo, ordenColumna, direccionOrden]);

  // Paginación
  const equiposPaginados = useMemo(() => {
    const inicio = (paginaActual - 1) * equiposPorPagina;
    const fin = inicio + equiposPorPagina;
    return equiposFiltrados.slice(inicio, fin);
  }, [equiposFiltrados, paginaActual, equiposPorPagina]);

  const totalPaginas = Math.ceil(equiposFiltrados.length / equiposPorPagina);

  // Exportar funciones
  const exportarExcel = () => {
    window.open(
      `/api/tecnico/equipos/export?formato=excel&id_tecnico=${usuario?.tecnico?.id_tecnico}&rango=${rangoFechas}`,
      "_blank"
    );
  };

  const exportarPDF = () => {
    window.open(
      `/api/tecnico/equipos/export?formato=pdf&id_tecnico=${usuario?.tecnico?.id_tecnico}&rango=${rangoFechas}`,
      "_blank"
    );
  };

  const exportarCSV = () => {
    window.open(
      `/api/tecnico/equipos/export?formato=csv&id_tecnico=${usuario?.tecnico?.id_tecnico}&rango=${rangoFechas}`,
      "_blank"
    );
  };

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
              <Package className="w-10 h-10 text-white" />
            </div>
          </div>
          <h2 className={`text-4xl font-black mb-4 ${tema.colores.texto}`}>
            Cargando Reportes de Equipos
          </h2>
          <p
            className={`text-lg font-semibold ${tema.colores.textoSecundario} animate-pulse`}
          >
            Preparando análisis de inventario...
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
            No tienes permisos para acceder a los reportes de equipos.
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
                placeholder="Buscar equipos por código, nombre, marca, modelo..."
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
                  href="/tecnico/reportes"
                  className={`font-semibold ${tema.colores.textoSecundario} hover:${tema.colores.acento} transition-colors flex items-center gap-1`}
                >
                  <ArrowLeft className="w-4 h-4" />
                  Reportes
                </Link>
                <span className={tema.colores.textoSecundario}>/</span>
                <span className={`font-bold ${tema.colores.texto}`}>
                  Gestión de Equipos
                </span>
              </div>
              <h2
                className={`text-4xl font-black mb-1 ${tema.colores.texto} flex items-center gap-3`}
              >
                <Package className="w-10 h-10" />
                Inventario de Equipos
                <span className="inline-flex items-center justify-center px-3 py-1 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-sm font-bold shadow-lg shadow-indigo-500/50 animate-pulse">
                  PREMIUM
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
              {/* Rango de fechas */}
              <div className="flex flex-wrap gap-2">
                {(["30d", "90d", "180d", "anio"] as const).map((r) => (
                  <button
                    key={r}
                    onClick={() => setRangoFechas(r)}
                    className={`px-4 py-2 rounded-xl font-semibold text-sm transition-all duration-300 hover:scale-105 ${
                      rangoFechas === r
                        ? `bg-gradient-to-r ${tema.colores.gradiente} text-white shadow-lg`
                        : `${tema.colores.secundario} ${tema.colores.texto}`
                    }`}
                  >
                    {r === "30d"
                      ? "30 días"
                      : r === "90d"
                      ? "90 días"
                      : r === "180d"
                      ? "180 días"
                      : "Año"}
                  </button>
                ))}
              </div>

              <button
                onClick={() => cargarEquipos()}
                className={`flex items-center gap-2 px-4 py-2 ${tema.colores.primario} text-white rounded-xl font-bold transition-all duration-300 hover:scale-105 ${tema.colores.sombra}`}
              >
                <RefreshCw
                  className={`w-4 h-4 ${loadingEquipos ? "animate-spin" : ""}`}
                />
                Actualizar
              </button>

              {/* Exportar */}
              <div className="flex items-center gap-2">
                <button
                  onClick={exportarExcel}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold ${tema.colores.secundario} ${tema.colores.texto} hover:scale-105 transition-all duration-300`}
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  Excel
                </button>
                <button
                  onClick={exportarPDF}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold ${tema.colores.secundario} ${tema.colores.texto} hover:scale-105 transition-all duration-300`}
                >
                  <FileText className="w-4 h-4" />
                  PDF
                </button>
                <button
                  onClick={exportarCSV}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold ${tema.colores.secundario} ${tema.colores.texto} hover:scale-105 transition-all duration-300`}
                >
                  <Download className="w-4 h-4" />
                  CSV
                </button>
              </div>
            </div>
          </div>

          <p className={`text-sm ${tema.colores.textoSecundario}`}>
            Gestión completa del inventario de equipos con análisis de mantenimiento,
            disponibilidad, vida útil y costos operacionales.
          </p>
        </div>

        {loadingEquipos ? (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <SkeletonCard key={i} tema={tema} />
              ))}
            </div>
            <SkeletonTable tema={tema} />
          </div>
        ) : (
          <>
            {/* Estadísticas Principales */}
            {estadisticasEquipos && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {[
                  {
                    titulo: "Total Equipos",
                    valor: estadisticasEquipos.total_equipos,
                    descripcion: "Inventario completo",
                    icono: Package,
                    color: "from-indigo-500 to-purple-500",
                    extra: `${estadisticasEquipos.operativos} operativos`,
                    tendencia: "up" as const,
                    cambio: "+5%",
                  },
                  {
                    titulo: "Disponibilidad",
                    valor: `${estadisticasEquipos.disponibilidad_promedio.toFixed(1)}%`,
                    descripcion: "Promedio general",
                    icono: CheckCircle2,
                    color: "from-green-500 to-emerald-500",
                    extra: "Tiempo operativo",
                    tendencia: "up" as const,
                    cambio: "+2%",
                  },
                  {
                    titulo: "En Mantenimiento",
                    valor: estadisticasEquipos.en_mantenimiento,
                    descripcion: "Equipos en servicio",
                    icono: Wrench,
                    color: "from-blue-500 to-cyan-500",
                    extra: `${estadisticasEquipos.mantenimientos_pendientes} pendientes`,
                    tendencia: "neutral" as const,
                    cambio: "0%",
                  },
                  {
                                       titulo: "Equipos Críticos",
                    valor: estadisticasEquipos.equipos_criticos,
                    descripcion: "Requieren atención",
                    icono: Flame,
                    color: "from-red-500 to-orange-500",
                    extra: `${estadisticasEquipos.calibraciones_pendientes} calibraciones`,
                    tendencia: "down" as const,
                    cambio: "-3%",
                  },
                ].map((kpi, idx) => (
                  <div
                    key={kpi.titulo}
                    className={`rounded-2xl p-6 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} transition-all duration-300 hover:scale-105 hover:-translate-y-2 cursor-pointer group animate-slideUp`}
                    style={{ animationDelay: `${idx * 80}ms` }}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div
                        className={`w-14 h-14 bg-gradient-to-br ${kpi.color} rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}
                      >
                        <kpi.icono className="w-7 h-7 text-white" />
                      </div>
                      <div className="flex items-center gap-2">
                        {kpi.tendencia === "up" ? (
                          <TrendingUp className="w-5 h-5 text-emerald-400" />
                        ) : kpi.tendencia === "down" ? (
                          <TrendingDown className="w-5 h-5 text-red-400" />
                        ) : (
                          <Activity className="w-5 h-5 text-gray-400" />
                        )}
                        <span
                          className={`text-sm font-bold ${
                            kpi.tendencia === "up"
                              ? "text-emerald-400"
                              : kpi.tendencia === "down"
                              ? "text-red-400"
                              : "text-gray-400"
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
                    <p className={`text-xs font-semibold ${tema.colores.textoSecundario}`}>
                      {kpi.extra}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {/* Métricas Financieras */}
            {estadisticasEquipos && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {[
                  {
                    titulo: "Valor Total Equipos",
                    valor: formatearMoneda(estadisticasEquipos.valor_total_equipos),
                    icono: Award,
                    color: "from-yellow-500 to-amber-500",
                    descripcion: "Valor del inventario",
                  },
                  {
                    titulo: "Costo Mantenimiento",
                    valor: formatearMoneda(estadisticasEquipos.costo_mantenimiento_total),
                    icono: Wrench,
                    color: "from-purple-500 to-pink-500",
                    descripcion: "Total invertido",
                  },
                  {
                    titulo: "Fuera de Servicio",
                    valor: estadisticasEquipos.fuera_servicio,
                    icono: XCircle,
                    color: "from-red-500 to-pink-500",
                    descripcion: "Equipos no operativos",
                  },
                  {
                    titulo: "Dados de Baja",
                    valor: estadisticasEquipos.dados_de_baja,
                    icono: Archive,
                    color: "from-gray-500 to-gray-600",
                    descripcion: "Equipos retirados",
                  },
                ].map((metrica, idx) => (
                  <div
                    key={metrica.titulo}
                    className={`rounded-xl p-5 ${tema.colores.card} ${tema.colores.borde} border transition-all duration-300 hover:scale-105 animate-fadeIn`}
                    style={{ animationDelay: `${idx * 60}ms` }}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div
                        className={`w-12 h-12 bg-gradient-to-br ${metrica.color} rounded-xl flex items-center justify-center shadow-lg`}
                      >
                        <metrica.icono className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className={`text-sm font-bold ${tema.colores.textoSecundario}`}>
                          {metrica.titulo}
                        </p>
                        <p className={`text-2xl font-black ${tema.colores.texto}`}>
                          {metrica.valor}
                        </p>
                      </div>
                    </div>
                    <p className={`text-xs ${tema.colores.textoSecundario}`}>
                      {metrica.descripcion}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {/* Gráficos de Análisis */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              {/* Distribución por Tipo */}
              {distribucionTipo.length > 0 && (
                <div
                  className={`rounded-2xl p-6 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} animate-fadeIn`}
                >
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg`}
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
                          Clasificación de equipos
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-8">
                    <ResponsiveContainer width="60%" height={250}>
                      <RechartsPieChart>
                        <Pie
                          //data={distribucionTipo}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ nombre, porcentaje }) =>
                            `${nombre}: ${(Number(porcentaje) || 0).toFixed(1)}%`
                            }

                          outerRadius={90}
                          fill="#8884d8"
                          dataKey="cantidad"
                        >
                          {distribucionTipo.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip tema={tema} />} />
                      </RechartsPieChart>
                    </ResponsiveContainer>

                    <div className="flex-1 space-y-3">
                      {distribucionTipo.map((tipo, index) => (
                        <div
                          key={index}
                          className={`flex items-center justify-between p-3 rounded-xl ${tema.colores.hover} transition-all duration-200 hover:scale-105`}
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className="w-4 h-4 rounded-full"
                              style={{ backgroundColor: tipo.color }}
                            ></div>
                            <span className={`text-sm font-bold ${tema.colores.texto}`}>
                              {tipo.tipo}
                            </span>
                          </div>
                          <div className="text-right">
                            <p className={`text-lg font-black ${tema.colores.acento}`}>
                              {tipo.cantidad}
                            </p>
                            <p className={`text-xs ${tema.colores.textoSecundario}`}>
                              {tipo.porcentaje.toFixed(1)}%
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Distribución por Estado */}
              {distribucionEstado.length > 0 && (
                <div
                  className={`rounded-2xl p-6 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} animate-fadeIn`}
                >
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg`}
                      >
                        <Activity className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className={`text-xl font-black ${tema.colores.texto}`}>
                          Distribución por Estado
                        </h3>
                        <p
                          className={`text-sm font-semibold ${tema.colores.textoSecundario}`}
                        >
                          Estado operacional
                        </p>
                      </div>
                    </div>
                  </div>

                  <ResponsiveContainer width="100%" height={300}>
                    <RechartsBarChart data={distribucionEstado}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                      <XAxis
                        dataKey="estado"
                        stroke={tema.colores.textoSecundario}
                        style={{ fontSize: "12px", fontWeight: "600" }}
                      />
                      <YAxis
                        stroke={tema.colores.textoSecundario}
                        style={{ fontSize: "12px", fontWeight: "600" }}
                      />
                      <Tooltip content={<CustomTooltip tema={tema} />} />
                      <Bar dataKey="cantidad" name="Cantidad" radius={[8, 8, 0, 0]}>
                        {distribucionEstado.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </RechartsBarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>

            {/* Tendencia de Mantenimiento y Criticidad */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              {/* Tendencia de Mantenimiento */}
              {tendenciaMantenimiento.length > 0 && (
                <div
                  className={`rounded-2xl p-6 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} animate-fadeIn`}
                >
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg`}
                      >
                        <LineChart className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className={`text-xl font-black ${tema.colores.texto}`}>
                          Tendencia de Mantenimiento
                        </h3>
                        <p
                          className={`text-sm font-semibold ${tema.colores.textoSecundario}`}
                        >
                          Últimos 6 meses
                        </p>
                      </div>
                    </div>
                  </div>

                  <ResponsiveContainer width="100%" height={300}>
                    <ComposedChart data={tendenciaMantenimiento}>
                      <defs>
                        <linearGradient id="colorPreventivos" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0.1} />
                        </linearGradient>
                        <linearGradient id="colorCorrectivos" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8} />
                          <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.1} />
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
                      <Legend wrapperStyle={{ paddingTop: "20px" }} />
                      <Area
                        type="monotone"
                        dataKey="preventivos"
                        stroke="#10b981"
                        strokeWidth={3}
                        fillOpacity={1}
                        fill="url(#colorPreventivos)"
                        name="Preventivos"
                      />
                      <Area
                        type="monotone"
                        dataKey="correctivos"
                        stroke="#f59e0b"
                        strokeWidth={3}
                        fillOpacity={1}
                        fill="url(#colorCorrectivos)"
                        name="Correctivos"
                      />
                      <Line
                        type="monotone"
                        dataKey="calibraciones"
                        stroke="#3b82f6"
                        strokeWidth={3}
                        name="Calibraciones"
                        dot={{ fill: "#3b82f6", r: 5 }}
                      />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              )}

              {/* Distribución por Criticidad */}
              {distribucionCriticidad.length > 0 && (
                <div
                  className={`rounded-2xl p-6 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} animate-fadeIn`}
                >
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center shadow-lg`}
                      >
                        <Flame className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className={`text-xl font-black ${tema.colores.texto}`}>
                          Nivel de Criticidad
                        </h3>
                        <p
                          className={`text-sm font-semibold ${tema.colores.textoSecundario}`}
                        >
                          Clasificación por importancia
                        </p>
                      </div>
                    </div>
                  </div>

                  <ResponsiveContainer width="100%" height={300}>
                    <RadialBarChart
                      cx="50%"
                      cy="50%"
                      innerRadius="20%"
                      outerRadius="90%"
                      data={distribucionCriticidad.map((c, idx) => ({
                        ...c,
                        fill: c.color,
                        value: c.cantidad,
                      }))}
                    >
                      <PolarAngleAxis
                        type="number"
                        domain={[0, Math.max(...distribucionCriticidad.map((c) => c.cantidad))]}
                        angleAxisId={0}
                        tick={false}
                      />
                      <RadialBar
                        background
                        dataKey="value"
                        cornerRadius={10}
                        label={{ position: "insideStart", fill: "#fff", fontWeight: "bold" }}
                      />
                      <Tooltip content={<CustomTooltip tema={tema} />} />
                      <Legend
                        iconSize={10}
                        layout="vertical"
                        verticalAlign="middle"
                        align="right"
                      />
                    </RadialBarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>

            {/* Equipos por Centro */}
            {equiposPorCentro.length > 0 && (
              <div
                className={`rounded-2xl p-6 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} mb-8 animate-fadeIn`}
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
                        Equipos por Centro
                      </h3>
                      <p
                        className={`text-sm font-semibold ${tema.colores.textoSecundario}`}
                      >
                        Distribución por establecimiento
                      </p>
                    </div>
                  </div>
                </div>

                <div className="overflow-x-auto custom-scrollbar">
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr
                        className={`text-left text-xs uppercase tracking-wide border-b ${tema.colores.borde}`}
                      >
                        <th className="pb-4 pr-4 font-black text-gray-400">Centro</th>
                        <th className="pb-4 pr-4 font-black text-gray-400 text-center">
                          Total
                        </th>
                        <th className="pb-4 pr-4 font-black text-gray-400 text-center">
                          Operativos
                        </th>
                        <th className="pb-4 pr-4 font-black text-gray-400 text-center">
                          En Mantenimiento
                        </th>
                        <th className="pb-4 pr-4 font-black text-gray-400 text-center">
                          Disponibilidad
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {equiposPorCentro.map((centro, idx) => (
                        <tr
                          key={centro.centro}
                          className={`border-t ${tema.colores.borde} ${tema.colores.hover} transition-all duration-200 animate-slideUp`}
                          style={{ animationDelay: `${idx * 50}ms` }}
                        >
                          <td className="py-4 pr-4">
                            <div className="flex items-center gap-3">
                              <div
                                className={`w-10 h-10 rounded-xl bg-gradient-to-br ${tema.colores.gradiente} flex items-center justify-center text-white font-bold shadow-lg`}
                              >
                                {centro.centro.charAt(0)}
                              </div>
                              <p className={`font-bold ${tema.colores.texto}`}>
                                {centro.centro}
                              </p>
                            </div>
                          </td>
                          <td className="py-4 pr-4 text-center">
                            <span className={`text-lg font-black ${tema.colores.texto}`}>
                              {centro.total}
                            </span>
                          </td>
                          <td className="py-4 pr-4 text-center">
                            <span className="text-lg font-black text-emerald-400">
                              {centro.operativos}
                            </span>
                          </td>
                          <td className="py-4 pr-4 text-center">
                            <span className="text-lg font-black text-blue-400">
                              {centro.en_mantenimiento}
                            </span>
                          </td>
                          <td className="py-4 pr-4 text-center">
                            <div className="flex flex-col items-center gap-2">
                              <span
                                className={`text-lg font-black ${
                                  centro.disponibilidad >= 90
                                    ? "text-emerald-400"
                                    : centro.disponibilidad >= 75
                                    ? "text-yellow-400"
                                    : "text-red-400"
                                }`}
                              >
                                {centro.disponibilidad.toFixed(1)}%
                              </span>
                              <div className="w-full bg-gray-700/30 rounded-full h-2">
                                <div
                                  className={`h-full rounded-full transition-all duration-1000 ${
                                    centro.disponibilidad >= 90
                                      ? "bg-gradient-to-r from-green-500 to-emerald-500"
                                      : centro.disponibilidad >= 75
                                      ? "bg-gradient-to-r from-yellow-500 to-amber-500"
                                      : "bg-gradient-to-r from-red-500 to-orange-500"
                                  }`}
                                  style={{ width: `${centro.disponibilidad}%` }}
                                ></div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Equipos Críticos */}
            {equiposCriticos.length > 0 && (
              <div
                className={`rounded-2xl p-6 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} mb-8 animate-fadeIn`}
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-12 h-12 bg-gradient-to-br from-red-500 to-orange-500 rounded-xl flex items-center justify-center shadow-lg animate-pulse`}
                    >
                      <AlertTriangle className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className={`text-xl font-black ${tema.colores.texto}`}>
                        Equipos Críticos - Atención Urgente
                      </h3>
                      <p
                        className={`text-sm font-semibold ${tema.colores.textoSecundario}`}
                      >
                        Requieren intervención inmediata
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {equiposCriticos.map((equipo, idx) => (
                    <div
                      key={equipo.id_equipo}
                      className={`p-5 rounded-xl ${tema.colores.hover} border-2 border-red-500/30 transition-all duration-300 hover:scale-105 animate-slideUp cursor-pointer`}
                      style={{ animationDelay: `${idx * 50}ms` }}
                      onClick={() => {
                        const equipoCompleto = equipos.find(
                          (e) => e.id_equipo === equipo.id_equipo
                        );
                        if (equipoCompleto) abrirDetalleEquipo(equipoCompleto);
                      }}
                    >
                      <div className="flex items-start gap-3 mb-3">
                        <div
                          className={`w-12 h-12 bg-gradient-to-br from-red-500 to-orange-500 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0`}
                        >
                          <Flame className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <p className={`text-sm font-bold ${tema.colores.acento}`}>
                              {equipo.codigo_equipo}
                            </p>
                            <span
                              className={`px-2 py-0.5 rounded-full text-xs font-bold ${obtenerColorCriticidad(
                                equipo.criticidad
                              )}`}
                            >
                              {equipo.criticidad.toUpperCase()}
                            </span>
                          </div>
                          <p className={`text-base font-black ${tema.colores.texto} mb-1`}>
                            {equipo.nombre}
                          </p>
                          <p className={`text-xs ${tema.colores.textoSecundario}`}>
                            {equipo.tipo}
                          </p>
                        </div>
                      </div>

                      <div
                        className={`p-3 rounded-lg bg-red-500/10 border border-red-500/30 mb-3`}
                      >
                        <p className={`text-xs font-bold mb-1 ${tema.colores.texto}`}>
                          Razón Crítica:
                        </p>
                        <p className={`text-sm ${tema.colores.textoSecundario}`}>
                          {equipo.razon_critica}
                        </p>
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <p className={`text-xs font-bold ${tema.colores.textoSecundario}`}>
                            Sin mantenimiento
                          </p>
                          <p className={`text-lg font-black text-red-400`}>
                            {equipo.dias_sin_mantenimiento} días
                          </p>
                        </div>
                        <button
                          className={`px-4 py-2 rounded-lg ${tema.colores.primario} text-white font-semibold text-sm transition-all duration-200 hover:scale-105`}
                        >
                          Ver Detalles
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Análisis de Vida Útil */}
            {analisisVidaUtil.length > 0 && (
              <div
                className={`rounded-2xl p-6 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} mb-8 animate-fadeIn`}
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg`}
                    >
                      <Clock3 className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className={`text-xl font-black ${tema.colores.texto}`}>
                        Análisis de Vida Útil
                      </h3>
                      <p
                        className={`text-sm font-semibold ${tema.colores.textoSecundario}`}
                      >
                        Distribución por antigüedad
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {analisisVidaUtil.map((rango, idx) => (
                    <div
                      key={rango.rango}
                      className={`p-5 rounded-xl ${tema.colores.hover} border ${tema.colores.borde} transition-all duration-300 hover:scale-105 animate-slideUp`}
                      style={{ animationDelay: `${idx * 50}ms` }}
                    >
                      <p className={`text-sm font-bold mb-3 ${tema.colores.textoSecundario}`}>
                        {rango.rango}
                      </p>
                      <div className="flex items-end justify-between mb-3">
                        <div>
                          <p className={`text-4xl font-black ${tema.colores.texto}`}>
                            {rango.cantidad}
                          </p>
                          <p className={`text-xs ${tema.colores.textoSecundario}`}>
                            equipos
                          </p>
                        </div>
                        <p className={`text-2xl font-black ${tema.colores.acento}`}>
                          {rango.porcentaje.toFixed(1)}%
                        </p>
                      </div>
                      <div className="w-full bg-gray-700/30 rounded-full h-2">
                        <div
                          className={`h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-1000`}
                          style={{ width: `${rango.porcentaje}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Filtros y Vista */}
            <div
              className={`rounded-2xl p-6 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} mb-6 animate-fadeIn`}
            >
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div className="flex flex-wrap items-center gap-3">
                  {/* Filtro Estado */}
                  <div className="flex items-center gap-2">
                    <Filter className="w-5 h-5 text-gray-400" />
                    <span className={`text-sm font-bold ${tema.colores.texto}`}>
                      Estado:
                    </span>
                    <select
                      value={filtroEstado}
                      onChange={(e) => setFiltroEstado(e.target.value as FiltroEstado)}
                      className={`px-4 py-2 rounded-xl ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto} font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50`}
                    >
                      <option value="todos">Todos</option>
                      <option value="operativo">Operativo</option>
                      <option value="en_mantenimiento">En Mantenimiento</option>
                      <option value="fuera_servicio">Fuera de Servicio</option>
                      <option value="en_reparacion">En Reparación</option>
                      <option value="dado_de_baja">Dado de Baja</option>
                    </select>
                  </div>

                  {/* Filtro Criticidad */}
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-bold ${tema.colores.texto}`}>
                      Criticidad:
                    </span>
                    <select
                      value={filtroCriticidad}
                      onChange={(e) =>
                        setFiltroCriticidad(e.target.value as FiltroCriticidad)
                      }
                      className={`px-4 py-2 rounded-xl ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto} font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50`}
                    >
                      <option value="todos">Todas</option>
                      <option value="critica">Crítica</option>
                      <option value="alta">Alta</option>
                      <option value="media">Media</option>
                      <option value="baja">Baja</option>
                    </select>
                  </div>

                  {/* Filtro Tipo */}
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-bold ${tema.colores.texto}`}>
                      Tipo:
                    </span>
                    <select
                      value={filtroTipo}
                      onChange={(e) => setFiltroTipo(e.target.value)}
                      className={`px-4 py-2 rounded-xl ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto} font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50`}
                    >
                      <option value="todos">Todos</option>
                      {tiposUnicos.map((tipo) => (
                        <option key={tipo} value={tipo}>
                          {tipo}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className={`text-sm font-bold ${tema.colores.textoSecundario}`}>
                    {equiposFiltrados.length} equipos
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setVistaActual("tabla")}
                      className={`p-2 rounded-lg transition-all duration-200 ${
                        vistaActual === "tabla"
                          ? `${tema.colores.primario} text-white`
                          : `${tema.colores.secundario} ${tema.colores.texto}`
                      }`}
                    >
                      <Layers className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => setVistaActual("tarjetas")}
                      className={`p-2 rounded-lg transition-all duration-200 ${
                        vistaActual === "tarjetas"
                          ? `${tema.colores.primario} text-white`
                          : `${tema.colores.secundario} ${tema.colores.texto}`
                      }`}
                    >
                      <FolderOpen className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Lista de Equipos - Vista Tabla */}
            {vistaActual === "tabla" ? (
              <div
                className={`rounded-2xl p-6 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} mb-8 animate-fadeIn`}
              >
                <div className="overflow-x-auto custom-scrollbar">
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr
                        className={`text-left text-xs uppercase tracking-wide border-b ${tema.colores.borde}`}
                      >
                        <th
                          className="pb-4 pr-4 font-black text-gray-400 cursor-pointer hover:text-indigo-400"
                          onClick={() => handleOrdenar("codigo_equipo")}
                        >
                          <div className="flex items-center gap-2">
                            Equipo
                            {ordenColumna === "codigo_equipo" && (
                              <ChevronDown
                                className={`w-4 h-4 transition-transform ${
                                  direccionOrden === "asc" ? "rotate-180" : ""
                                }`}
                              />
                            )}
                          </div>
                        </th>
                        <th className="pb-4 pr-4 font-black text-gray-400">Ubicación</th>
                        <th
                          className="pb-4 pr-4 font-black text-gray-400 cursor-pointer hover:text-indigo-400"
                          onClick={() => handleOrdenar("estado")}
                        >
                          <div className="flex items-center gap-2">
                            Estado
                            {ordenColumna === "estado" && (
                              <ChevronDown
                                className={`w-4 h-4 transition-transform ${
                                  direccionOrden === "asc" ? "rotate-180" : ""
                                }`}
                              />
                            )}
                          </div>
                        </th>
                        <th
                          className="pb-4 pr-4 font-black text-gray-400 cursor-pointer hover:text-indigo-400"
                          onClick={() => handleOrdenar("criticidad")}
                        >
                          <div className="flex items-center gap-2">
                            Criticidad
                            {ordenColumna === "criticidad" && (
                              <ChevronDown
                                className={`w-4 h-4 transition-transform ${
                                  direccionOrden === "asc" ? "rotate-180" : ""
                                }`}
                              />
                            )}
                          </div>
                        </th>
                        <th
                          className="pb-4 pr-4 font-black text-gray-400 cursor-pointer hover:text-indigo-400"
                          onClick={() => handleOrdenar("disponibilidad")}
                        >
                          <div className="flex items-center gap-2">
                            Disponibilidad
                            {ordenColumna === "disponibilidad" && (
                              <ChevronDown
                                className={`w-4 h-4 transition-transform ${
                                  direccionOrden === "asc" ? "rotate-180" : ""
                                }`}
                              />
                            )}
                          </div>
                        </th>
                        <th
                          className="pb-4 pr-4 font-black text-gray-400 cursor-pointer hover:text-indigo-400"
                          onClick={() => handleOrdenar("fecha_ultimo_mantenimiento")}
                        >
                          <div className="flex items-center gap-2">
                            Último Mant.
                            {ordenColumna === "fecha_ultimo_mantenimiento" && (
                              <ChevronDown
                                className={`w-4 h-4 transition-transform ${
                                  direccionOrden === "asc" ? "rotate-180" : ""
                                }`}
                              />
                            )}
                          </div>
                        </th>
                        <th className="pb-4 pr-4 font-black text-gray-400">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {equiposPaginados.map((equipo, idx) => {
                        const IconoEstado = obtenerIconoEstado(equipo.estado);
                        const IconoCriticidad = obtenerIconoCriticidad(equipo.criticidad);
                        const IconoTipo = obtenerIconoTipo(equipo.tipo_equipo);

                        return (
                          <tr
                            key={equipo.id_equipo}
                            className={`border-t ${tema.colores.borde} ${tema.colores.hover} transition-all duration-200 animate-slideUp cursor-pointer`}
                            style={{ animationDelay: `${idx * 30}ms` }}
                            onClick={() => abrirDetalleEquipo(equipo)}
                          >
                            <td className="py-4 pr-4">
                              <div className="flex items-center gap-3">
                                <div
                                  className={`w-12 h-12 bg-gradient-to-br ${tema.colores.gradiente} rounded-xl flex items-center justify-center shadow-lg`}
                                >
                                  <IconoTipo className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                  <p className={`font-bold ${tema.colores.texto} mb-1`}>
                                    {equipo.codigo_equipo}
                                  </p>
                                  <p
                                    className={`text-xs ${tema.colores.textoSecundario} line-clamp-1`}
                                  >
                                    {equipo.nombre}
                                  </p>
                                  <p className={`text-xs ${tema.colores.textoSecundario}`}>
                                    {equipo.marca} - {equipo.modelo}
                                  </p>
                                </div>
                              </div>
                            </td>
                            <td className="py-4 pr-4">
                              <div>
                                <p className={`text-xs font-bold ${tema.colores.texto}`}>
                                  {equipo.ubicacion}
                                </p>
                                <p className={`text-xs ${tema.colores.textoSecundario}`}>
                                  {equipo.centro.nombre}
                                </p>
                              </div>
                            </td>
                            <td className="py-4 pr-4">
                              <span
                                className={`inline-flex items-center gap-2 px-3 py-1 rounded-lg text-xs font-bold border ${obtenerColorEstado(
                                  equipo.estado
                                )}`}
                              >
                                <IconoEstado className="w-3 h-3" />
                                {equipo.estado.replace("_", " ").charAt(0).toUpperCase() +
                                  equipo.estado.replace("_", " ").slice(1)}
                              </span>
                            </td>
                            <td className="py-4 pr-4">
                              <span
                                className={`inline-flex items-center gap-2 px-3 py-1 rounded-lg text-xs font-bold border ${obtenerColorCriticidad(
                                  equipo.criticidad
                                )}`}
                              >
                                <IconoCriticidad className="w-3 h-3" />
                                {equipo.criticidad.charAt(0).toUpperCase() +
                                  equipo.criticidad.slice(1)}
                              </span>
                            </td>
                            <td className="py-4 pr-4">
                              <div className="flex flex-col gap-2">
                                <div className="flex items-center gap-2">
                                  <span
                                    className={`text-sm font-black ${
                                      equipo.disponibilidad_porcentaje >= 90
                                        ? "text-emerald-400"
                                        : equipo.disponibilidad_porcentaje >= 75
                                        ? "text-yellow-400"
                                        : "text-red-400"
                                    }`}
                                  >
                                    {equipo.disponibilidad_porcentaje.toFixed(1)}%
                                  </span>
                                </div>
                                <div className="w-24 bg-gray-700/30 rounded-full h-2">
                                  <div
                                    className={`h-full rounded-full transition-all duration-1000 ${
                                      equipo.disponibilidad_porcentaje >= 90
                                        ? "bg-gradient-to-r from-green-500 to-emerald-500"
                                        : equipo.disponibilidad_porcentaje >= 75
                                        ? "bg-gradient-to-r from-yellow-500 to-amber-500"
                                        : "bg-gradient-to-r from-red-500 to-orange-500"
                                    }`}
                                    style={{
                                      width: `${equipo.disponibilidad_porcentaje}%`,
                                    }}
                                  ></div>
                                </div>
                              </div>
                            </td>
                            <td className="py-4 pr-4">
                              <div>
                                <p className={`text-xs font-bold ${tema.colores.texto}`}>
                                  {formatearFecha(equipo.fecha_ultimo_mantenimiento)}
                                </p>
                                {equipo.fecha_ultimo_mantenimiento && (
                                  <p className={`text-xs ${tema.colores.textoSecundario}`}>
                                    Hace{" "}
                                    {calcularDiasSinMantenimiento(
                                      equipo.fecha_ultimo_mantenimiento
                                    )}{" "}
                                    días
                                  </p>
                                )}
                              </div>
                            </td>
                            <td className="py-4 pr-4">
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    abrirDetalleEquipo(equipo);
                                  }}
                                  className={`p-2 rounded-lg ${tema.colores.hover} transition-all duration-200`}
                                >
                                  <Eye className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    // Acción editar
                                  }}
                                  className={`p-2 rounded-lg ${tema.colores.hover} transition-all duration-200`}
                                >
                                  <Edit className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Paginación */}
                {totalPaginas > 1 && (
                  <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-700/30">
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-semibold ${tema.colores.textoSecundario}`}>
                        Mostrando {(paginaActual - 1) * equiposPorPagina + 1} -{" "}
                        {Math.min(paginaActual * equiposPorPagina, equiposFiltrados.length)}{" "}
                        de {equiposFiltrados.length}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setPaginaActual(Math.max(1, paginaActual - 1))}
                        disabled={paginaActual === 1}
                        className={`p-2 rounded-lg ${tema.colores.secundario} ${tema.colores.texto} disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200`}
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </button>

                      {[...Array(totalPaginas)].map((_, i) => {
                        const pagina = i + 1;
                        if (
                          pagina === 1 ||
                          pagina === totalPaginas ||
                          (pagina >= paginaActual - 1 && pagina <= paginaActual + 1)
                        ) {
                          return (
                            <button
                              key={pagina}
                              onClick={() => setPaginaActual(pagina)}
                              className={`px-4 py-2 rounded-lg font-semibold transition-all duration-200 ${
                                paginaActual === pagina
                                  ? `bg-gradient-to-r ${tema.colores.gradiente} text-white`
                                  : `${tema.colores.secundario} ${tema.colores.texto}`
                              }`}
                            >
                              {pagina}
                            </button>
                          );
                        } else if (pagina === paginaActual - 2 || pagina === paginaActual + 2) {
                          return (
                            <span key={pagina} className={tema.colores.textoSecundario}>
                              ...
                            </span>
                          );
                        }
                        return null;
                      })}

                      <button
                        onClick={() =>
                          setPaginaActual(Math.min(totalPaginas, paginaActual + 1))
                        }
                        disabled={paginaActual === totalPaginas}
                        className={`p-2 rounded-lg ${tema.colores.secundario} ${tema.colores.texto} disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200`}
                      >
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              // Vista de Tarjetas
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {equiposPaginados.map((equipo, idx) => {
                  const IconoEstado = obtenerIconoEstado(equipo.estado);
                  const IconoCriticidad = obtenerIconoCriticidad(equipo.criticidad);
                  const IconoTipo = obtenerIconoTipo(equipo.tipo_equipo);

                  return (
                    <div
                      key={equipo.id_equipo}
                      className={`rounded-2xl p-6 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} transition-all duration-300 hover:scale-105 hover:-translate-y-2 cursor-pointer animate-slideUp`}
                      style={{ animationDelay: `${idx * 50}ms` }}
                      onClick={() => abrirDetalleEquipo(equipo)}
                    >
                      {/* Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-14 h-14 bg-gradient-to-br ${tema.colores.gradiente} rounded-xl flex items-center justify-center shadow-lg`}
                          >
                            <IconoTipo className="w-7 h-7 text-white" />
                          </div>
                          <div>
                            <p className={`text-sm font-bold ${tema.colores.acento} mb-1`}>
                              {equipo.codigo_equipo}
                            </p>
                            <p className={`text-xs ${tema.colores.textoSecundario}`}>
                              {equipo.tipo_equipo}
                            </p>
                          </div>
                        </div>
                        {equipo.requiere_mantenimiento_urgente && (
                          <Flame className="w-6 h-6 text-red-400 animate-pulse" />
                        )}
                      </div>

                      {/* Nombre */}
                      <h4 className={`text-lg font-black ${tema.colores.texto} mb-2`}>
                        {equipo.nombre}
                      </h4>
                      <p className={`text-sm ${tema.colores.textoSecundario} mb-4`}>
                        {equipo.marca} - {equipo.modelo}
                      </p>

                      {/* Badges */}
                      <div className="flex flex-wrap items-center gap-2 mb-4">
                        <span
                          className={`inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-bold border ${obtenerColorEstado(
                            equipo.estado
                          )}`}
                        >
                          <IconoEstado className="w-3 h-3" />
                          {equipo.estado.replace("_", " ").charAt(0).toUpperCase() +
                            equipo.estado.replace("_", " ").slice(1)}
                        </span>
                        <span
                          className={`inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-bold border ${obtenerColorCriticidad(
                            equipo.criticidad
                          )}`}
                        >
                          <IconoCriticidad className="w-3 h-3" />
                          {equipo.criticidad.charAt(0).toUpperCase() +
                            equipo.criticidad.slice(1)}
                        </span>
                      </div>

                      {/* Ubicación */}
                      <div className="flex items-center gap-2 mb-4 pb-4 border-b border-gray-700/30">
                        <MapPin className="w-4 h-4 text-gray-400" />
                        <div>
                          <p className={`text-xs font-bold ${tema.colores.texto}`}>
                            {equipo.ubicacion}
                          </p>
                          <p className={`text-xs ${tema.colores.textoSecundario}`}>
                            {equipo.centro.nombre}
                          </p>
                        </div>
                      </div>

                      {/* Disponibilidad */}
                      <div className="mb-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className={`text-xs font-bold ${tema.colores.textoSecundario}`}>
                            Disponibilidad
                          </span>
                          <span
                            className={`text-sm font-black ${
                              equipo.disponibilidad_porcentaje >= 90
                                ? "text-emerald-400"
                                : equipo.disponibilidad_porcentaje >= 75
                                ? "text-yellow-400"
                                : "text-red-400"
                            }`}
                          >
                            {equipo.disponibilidad_porcentaje.toFixed(1)}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-700/30 rounded-full h-2">
                          <div
                            className={`h-full rounded-full transition-all duration-1000 ${
                              equipo.disponibilidad_porcentaje >= 90
                                ? "bg-gradient-to-r from-green-500 to-emerald-500"
                                : equipo.disponibilidad_porcentaje >= 75
                                ? "bg-gradient-to-r from-yellow-500 to-amber-500"
                                : "bg-gradient-to-r from-red-500 to-orange-500"
                            }`}
                            style={{ width: `${equipo.disponibilidad_porcentaje}%` }}
                          ></div>
                        </div>
                      </div>

                      {/* Footer */}
                      <div className="flex items-center justify-between">
                        <div>
                          <p className={`text-xs font-bold ${tema.colores.textoSecundario}`}>
                            Último mantenimiento
                          </p>
                          <p className={`text-sm font-black ${tema.colores.texto}`}>
                            {formatearFecha(equipo.fecha_ultimo_mantenimiento)}
                          </p>
                        </div>
                        <button
                          className={`px-4 py-2 rounded-lg ${tema.colores.primario} text-white font-semibold text-sm transition-all duration-200 hover:scale-105`}
                        >
                          Ver Más
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </main>

      {/* MODAL DETALLE EQUIPO */}
      {modalDetalleAbierto && equipoSeleccionado && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
          <div
            className={`w-full max-w-5xl max-h-[90vh] overflow-y-auto rounded-2xl ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} animate-scaleIn custom-scrollbar`}
          >
            {/* Header Modal */}
            <div
              className={`sticky top-0 z-10 flex items-center justify-between p-6 border-b ${tema.colores.borde} ${tema.colores.card} backdrop-blur-xl`}
            >
              <div className="flex items-center gap-4">
                <div
                  className={`w-16 h-16 bg-gradient-to-br ${tema.colores.gradiente} rounded-xl flex items-center justify-center shadow-lg`}
                >
                  {obtenerIconoTipo(equipoSeleccionado.tipo_equipo)({
                    className: "w-8 h-8 text-white",
                  })}
                </div>
                <div>
                  <p className={`text-sm font-bold ${tema.colores.acento} mb-1`}>
                    {equipoSeleccionado.codigo_equipo}
                  </p>
                  <h3 className={`text-2xl font-black ${tema.colores.texto}`}>
                    {equipoSeleccionado.nombre}
                  </h3>
                  <p className={`text-sm ${tema.colores.textoSecundario}`}>
                    {equipoSeleccionado.marca} - {equipoSeleccionado.modelo}
                  </p>
                </div>
              </div>
              <button
                onClick={cerrarDetalleEquipo}
                className={`p-2 rounded-lg ${tema.colores.hover} transition-all duration-200`}
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Body Modal */}
            <div className="p-6 space-y-6">
              {/* Badges */}
              <div className="flex flex-wrap items-center gap-3">
                <span
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold border ${obtenerColorEstado(
                    equipoSeleccionado.estado
                  )}`}
                >
                  {obtenerIconoEstado(equipoSeleccionado.estado)({
                    className: "w-4 h-4",
                  })}
                  Estado: {equipoSeleccionado.estado.replace("_", " ").toUpperCase()}
                </span>
                <span
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold border ${obtenerColorCriticidad(
                    equipoSeleccionado.criticidad
                  )}`}
                >
                  {obtenerIconoCriticidad(equipoSeleccionado.criticidad)({
                    className: "w-4 h-4",
                  })}
                  Criticidad: {equipoSeleccionado.criticidad.toUpperCase()}
                </span>
                {equipoSeleccionado.requiere_mantenimiento_urgente && (
                  <span className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold bg-red-500/20 text-red-400 border border-red-500/30">
                    <AlertTriangle className="w-4 h-4" />
                    MANTENIMIENTO URGENTE
                  </span>
                )}
                {equipoSeleccionado.requiere_calibracion && (
                  <span className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">
                    <Wrench className="w-4 h-4" />
                    CALIBRACIÓN PENDIENTE
                  </span>
                )}
              </div>

              {/* Información General */}
              <div>
                <h4 className={`text-lg font-black ${tema.colores.texto} mb-4 flex items-center gap-2`}>
                  <Info className="w-5 h-5" />
                  Información General
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className={`p-4 rounded-xl ${tema.colores.hover} border ${tema.colores.borde}`}>
                    <p className={`text-xs font-bold ${tema.colores.textoSecundario} mb-2`}>
                      Tipo de Equipo
                    </p>
                    <p className={`text-sm font-black ${tema.colores.texto}`}>
                      {equipoSeleccionado.tipo_equipo}
                    </p>
                    <p className={`text-xs ${tema.colores.textoSecundario} mt-1`}>
                      {equipoSeleccionado.categoria}
                    </p>
                  </div>

                  <div className={`p-4 rounded-xl ${tema.colores.hover} border ${tema.colores.borde}`}>
                    <p className={`text-xs font-bold ${tema.colores.textoSecundario} mb-2`}>
                      Número de Serie
                    </p>
                    <p className={`text-sm font-black ${tema.colores.texto}`}>
                      {equipoSeleccionado.numero_serie}
                    </p>
                  </div>

                  <div className={`p-4 rounded-xl ${tema.colores.hover} border ${tema.colores.borde}`}>
                    <p className={`text-xs font-bold ${tema.colores.textoSecundario} mb-2`}>
                      Ubicación
                    </p>
                    <p className={`text-sm font-black ${tema.colores.texto}`}>
                      {equipoSeleccionado.ubicacion}
                    </p>
                    <p className={`text-xs ${tema.colores.textoSecundario} mt-1`}>
                      {equipoSeleccionado.centro.nombre} - {equipoSeleccionado.centro.ciudad}
                    </p>
                  </div>

                  <div className={`p-4 rounded-xl ${tema.colores.hover} border ${tema.colores.borde}`}>
                    <p className={`text-xs font-bold ${tema.colores.textoSecundario} mb-2`}>
                      Fecha de Adquisición
                    </p>
                    <p className={`text-sm font-black ${tema.colores.texto}`}>
                      {formatearFecha(equipoSeleccionado.fecha_adquisicion)}
                    </p>
                    <p className={`text-xs ${tema.colores.textoSecundario} mt-1`}>
                      Hace {equipoSeleccionado.anos_uso} años
                    </p>
                  </div>

                  <div className={`p-4 rounded-xl ${tema.colores.hover} border ${tema.colores.borde}`}>
                    <p className={`text-xs font-bold ${tema.colores.textoSecundario} mb-2`}>
                      Vida Útil
                    </p>
                    <p className={`text-sm font-black ${tema.colores.texto}`}>
                      {equipoSeleccionado.vida_util_anos} años
                    </p>
                    <div className="mt-2">
                      <div className="w-full bg-gray-700/30 rounded-full h-2">
                        <div
                          className={`h-full rounded-full transition-all duration-1000 ${
                            equipoSeleccionado.porcentaje_vida_util <= 30
                              ? "bg-gradient-to-r from-green-500 to-emerald-500"
                              : equipoSeleccionado.porcentaje_vida_util <= 70
                              ? "bg-gradient-to-r from-yellow-500 to-amber-500"
                              : "bg-gradient-to-r from-red-500 to-orange-500"
                          }`}
                          style={{ width: `${equipoSeleccionado.porcentaje_vida_util}%` }}
                        ></div>
                      </div>
                      <p className={`text-xs ${tema.colores.textoSecundario} mt-1`}>
                        {equipoSeleccionado.porcentaje_vida_util.toFixed(1)}% consumido
                      </p>
                    </div>
                  </div>

                  <div className={`p-4 rounded-xl ${tema.colores.hover} border ${tema.colores.borde}`}>
                    <p className={`text-xs font-bold ${tema.colores.textoSecundario} mb-2`}>
                      Estado Operativo
                    </p>
                    <p className={`text-sm font-black ${obtenerColorEstadoOperativo(equipoSeleccionado.estado_operativo)}`}>
                      {equipoSeleccionado.estado_operativo.toUpperCase()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Métricas de Rendimiento */}
              <div>
                <h4 className={`text-lg font-black ${tema.colores.texto} mb-4 flex items-center gap-2`}>
                  <Activity className="w-5 h-5" />
                  Métricas de Rendimiento
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className={`p-4 rounded-xl ${tema.colores.hover} border ${tema.colores.borde}`}>
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle2 className="w-5 h-5 text-green-400" />
                      <p className={`text-xs font-bold ${tema.colores.textoSecundario}`}>
                        Disponibilidad
                      </p>
                    </div>
                    <p className={`text-3xl font-black text-green-400`}>
                      {equipoSeleccionado.disponibilidad_porcentaje.toFixed(1)}%
                    </p>
                  </div>

                  <div className={`p-4 rounded-xl ${tema.colores.hover} border ${tema.colores.borde}`}>
                    <div className="flex items-center gap-2 mb-2">
                      <Wrench className="w-5 h-5 text-blue-400" />
                      <p className={`text-xs font-bold ${tema.colores.textoSecundario}`}>
                        Mantenimientos
                      </p>
                    </div>
                    <p className={`text-3xl font-black text-blue-400`}>
                      {equipoSeleccionado.total_mantenimientos}
                    </p>
                  </div>

                  <div className={`p-4 rounded-xl ${tema.colores.hover} border ${tema.colores.borde}`}>
                    <div className="flex items-center gap-2 mb-2">
                      <AlertOctagon className="w-5 h-5 text-orange-400" />
                      <p className={`text-xs font-bold ${tema.colores.textoSecundario}`}>
                        Fallas Totales
                      </p>
                    </div>
                    <p className={`text-3xl font-black text-orange-400`}>
                      {equipoSeleccionado.total_fallas}
                    </p>
                  </div>

                  <div className={`p-4 rounded-xl ${tema.colores.hover} border ${tema.colores.borde}`}>
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="w-5 h-5 text-red-400" />
                      <p className={`text-xs font-bold ${tema.colores.textoSecundario}`}>
                        Horas Fuera Servicio
                      </p>
                    </div>
                    <p className={`text-3xl font-black text-red-400`}>
                      {equipoSeleccionado.tiempo_fuera_servicio_horas}h
                    </p>
                  </div>
                </div>
              </div>

              {/* Información de Mantenimiento */}
              <div>
                <h4 className={`text-lg font-black ${tema.colores.texto} mb-4 flex items-center gap-2`}>
                  <Wrench className="w-5 h-5" />
                  Información de Mantenimiento
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className={`p-4 rounded-xl ${tema.colores.hover} border ${tema.colores.borde}`}>
                    <p className={`text-xs font-bold ${tema.colores.textoSecundario} mb-2`}>
                      Último Mantenimiento
                    </p>
                    <p className={`text-sm font-black ${tema.colores.texto}`}>
                      {formatearFecha(equipoSeleccionado.fecha_ultimo_mantenimiento)}
                    </p>
                    {equipoSeleccionado.fecha_ultimo_mantenimiento && (
                      <p className={`text-xs ${tema.colores.textoSecundario} mt-1`}>
                        Hace {calcularDiasSinMantenimiento(equipoSeleccionado.fecha_ultimo_mantenimiento)} días
                      </p>
                    )}
                  </div>

                  <div className={`p-4 rounded-xl ${tema.colores.hover} border ${tema.colores.borde}`}>
                    <p className={`text-xs font-bold ${tema.colores.textoSecundario} mb-2`}>
                      Próximo Mantenimiento
                    </p>
                    <p className={`text-sm font-black ${tema.colores.texto}`}>
                      {formatearFecha(equipoSeleccionado.fecha_proximo_mantenimiento)}
                    </p>
                    {equipoSeleccionado.fecha_proximo_mantenimiento && (
                      <p className={`text-xs ${tema.colores.textoSecundario} mt-1`}>
                        {new Date(equipoSeleccionado.fecha_proximo_mantenimiento) > new Date()
                          ? "Programado"
                          : "Vencido"}
                      </p>
                    )}
                  </div>

                  <div className={`p-4 rounded-xl ${tema.colores.hover} border ${tema.colores.borde}`}>
                    <p className={`text-xs font-bold ${tema.colores.textoSecundario} mb-2`}>
                      Costo Total Mantenimiento
                    </p>
                    <p className={`text-sm font-black ${tema.colores.texto}`}>
                      {formatearMoneda(equipoSeleccionado.costo_mantenimiento_total)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Información Financiera */}
              <div>
                <h4 className={`text-lg font-black ${tema.colores.texto} mb-4 flex items-center gap-2`}>
                  <Award className="w-5 h-5" />
                  Información Financiera
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className={`p-5 rounded-xl bg-gradient-to-br from-yellow-500/10 to-amber-500/10 border border-yellow-500/30`}>
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-amber-500 rounded-xl flex items-center justify-center shadow-lg">
                        <Award className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <p className={`text-xs font-bold ${tema.colores.textoSecundario}`}>
                          Valor Actual del Equipo
                        </p>
                        <p className={`text-2xl font-black text-yellow-400`}>
                          {formatearMoneda(equipoSeleccionado.valor_actual)}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className={`p-5 rounded-xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/30`}>
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
                        <Wrench className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <p className={`text-xs font-bold ${tema.colores.textoSecundario}`}>
                          Costo Acumulado Mantenimiento
                        </p>
                        <p className={`text-2xl font-black text-purple-400`}>
                          {formatearMoneda(equipoSeleccionado.costo_mantenimiento_total)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tags */}
              {equipoSeleccionado.tags && equipoSeleccionado.tags.length > 0 && (
                <div>
                  <h4 className={`text-lg font-black ${tema.colores.texto} mb-4 flex items-center gap-2`}>
                    <Tag className="w-5 h-5" />
                    Etiquetas
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {equipoSeleccionado.tags.map((tag, idx) => (
                      <span
                        key={idx}
                        className={`inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-bold ${tema.colores.secundario} ${tema.colores.texto}`}
                      >
                        <Tag className="w-3 h-3" />
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Acciones */}
              <div className="flex flex-wrap items-center gap-3 pt-6 border-t border-gray-700/30">
                <button
                  className={`flex items-center gap-2 px-6 py-3 ${tema.colores.primario} text-white rounded-xl font-bold transition-all duration-300 hover:scale-105 ${tema.colores.sombra}`}
                >
                  <Edit className="w-5 h-5" />
                  Editar Equipo
                </button>
                <button
                  className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold ${tema.colores.secundario} ${tema.colores.texto} hover:scale-105 transition-all duration-300`}
                >
                  <Wrench className="w-5 h-5" />
                  Programar Mantenimiento
                </button>
                <button
                  className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold ${tema.colores.secundario} ${tema.colores.texto} hover:scale-105 transition-all duration-300`}
                >
                  <History className="w-5 h-5" />
                  Ver Historial
                </button>
                <button
                  className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold ${tema.colores.secundario} ${tema.colores.texto} hover:scale-105 transition-all duration-300`}
                >
                  <FileText className="w-5 h-5" />
                  Generar Reporte
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* FOOTER */}
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
                  <Package className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className={`text-sm font-black ${tema.colores.texto}`}>
                    AnyssaMed Equipment Pro
                  </p>
                  <p className={`text-xs ${tema.colores.textoSecundario}`}>
                    Sistema de Gestión de Equipos Premium
                  </p>
                </div>
              </div>
              <p
                className={`text-xs font-semibold ${tema.colores.textoSecundario}`}
              >
                © 2025 AnyssaMed. Todos los derechos reservados. v2.3.0
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
                <BookOpen className="w-4 h-4" />
                Documentación
              </Link>
              <Link
                href="/privacidad"
                className={`text-sm font-bold transition-all duration-200 ${tema.colores.textoSecundario} hover:${tema.colores.acento} flex items-center gap-2`}
              >
                <Shield className="w-4 h-4" />
                Privacidad
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
                className={`px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r ${tema.colores.gradiente} text-white shadow-lg animate-pulse`}
              >
                PREMIUM
              </span>
              <span
                className={`px-4 py-2 rounded-xl text-xs font-bold ${tema.colores.secundario} ${tema.colores.texto}`}
              >
                Build 2025.01
              </span>
            </div>
          </div>

          {/* Barra de estado */}
          <div className="mt-6 pt-6 border-t border-gray-700/30">
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <p className={`text-xs font-bold ${tema.colores.texto}`}>Sistema</p>
                </div>
                <p className={`text-xs ${tema.colores.textoSecundario}`}>Operativo</p>
              </div>

              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <Database className="w-3 h-3 text-blue-400" />
                  <p className={`text-xs font-bold ${tema.colores.texto}`}>Base de Datos</p>
                </div>
                <p className={`text-xs ${tema.colores.textoSecundario}`}>Conectada</p>
              </div>

              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <Zap className="w-3 h-3 text-yellow-400" />
                  <p className={`text-xs font-bold ${tema.colores.texto}`}>API</p>
                </div>
                <p className={`text-xs ${tema.colores.textoSecundario}`}>Activa</p>
              </div>

              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <Shield className="w-3 h-3 text-green-400" />
                  <p className={`text-xs font-bold ${tema.colores.texto}`}>Seguridad</p>
                </div>
                <p className={`text-xs ${tema.colores.textoSecundario}`}>SSL Activo</p>
              </div>

              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <Package className="w-3 h-3 text-indigo-400" />
                  <p className={`text-xs font-bold ${tema.colores.texto}`}>Equipos</p>
                </div>
                <p className={`text-xs ${tema.colores.textoSecundario}`}>
                  {estadisticasEquipos?.total_equipos || 0}
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
            </div>
          </div>
        </div>
      </footer>

      {/* ESTILOS GLOBALES PREMIUM */}
      <style jsx global>{`
        @import url("https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap");

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

        .custom-scrollbar::-webkit-scrollbar {
          width: 10px;
          height: 10px;
        }

        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.1);
          border-radius: 10px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(180deg, rgba(99, 102, 241, 0.8), rgba(168, 85, 247, 0.8));
          border-radius: 10px;
          transition: all 0.3s ease;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(180deg, rgba(99, 102, 241, 1), rgba(168, 85, 247, 1));
          box-shadow: 0 0 10px rgba(99, 102, 241, 0.5);
        }

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

        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
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

        .animate-scaleIn {
          animation: scaleIn 0.4s ease-out forwards;
        }

        .line-clamp-1 {
          overflow: hidden;
          display: -webkit-box;
          -webkit-box-orient: vertical;
          -webkit-line-clamp: 1;
        }

        ::selection {
          background: rgba(99, 102, 241, 0.3);
          color: white;
        }

        @media print {
          .no-print {
            display: none !important;
          }
          body {
            background: white !important;
            color: black !important;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          *,
          *::before,
          *::after {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
        }
      `}</style>
    </div>
  );
}
