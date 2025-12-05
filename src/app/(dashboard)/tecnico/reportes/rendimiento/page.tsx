// src/app/(dashboard)/tecnico/reportes/rendimiento/page.tsx
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
  ArrowDownRight,
  ArrowLeft,
  ArrowUpRight,
  Award,
  BarChart3,
  Battery,
  BatteryCharging,
  Bell,
  BookOpen,
  Brain,
  BrainCircuit,
  Building2,
  Calendar,
  CalendarClock,
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
  Eye,
  FileSpreadsheet,
  FileText,
  Filter,
  Flame,
  Globe,
  Hash,
  Heart,
  HeartPulse,
  History,
  Lightbulb,
  LineChart,
  Loader2,
  LogOut,
  MapPin,
  Maximize2,
  Medal,
  MessageSquare,
  Minimize2,
  Moon,
  MoreVertical,
  Percent,
  Phone,
  PieChart,
  Printer,
  RefreshCw,
  Rocket,
  Search,
  Settings,
  Shield,
  Sparkles,
  Star,
  Sun,
  Target,
  ThumbsDown,
  ThumbsUp,
  TrendingDown,
  TrendingUp,
  Trophy,
  User,
  UserCheck,
  Users,
  Wifi,
  Wrench,
  X,
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

interface MetricasRendimiento {
  periodo: string;
  tickets_resueltos: number;
  tickets_asignados: number;
  tiempo_promedio_resolucion: number;
  calificacion_promedio: number;
  tasa_resolucion_primer_contacto: number;
  cumplimiento_sla: number;
  productividad: number;
  eficiencia: number;
}

interface ComparativaEquipo {
  tecnico: string;
  tickets_resueltos: number;
  calificacion: number;
  tiempo_promedio: number;
  productividad: number;
  es_yo: boolean;
}

interface RendimientoPorCategoria {
  categoria: string;
  cantidad: number;
  tiempo_promedio: number;
  calificacion_promedio: number;
  tasa_exito: number;
}

interface RendimientoPorHora {
  hora: string;
  tickets_resueltos: number;
  eficiencia: number;
}

interface RendimientoPorDia {
  dia: string;
  tickets_resueltos: number;
  calificacion: number;
  tiempo_promedio: number;
  productividad: number;
}

interface ObjetivoRendimiento {
  id: string;
  nombre: string;
  descripcion: string;
  valor_actual: number;
  valor_objetivo: number;
  unidad: string;
  progreso: number;
  estado: "alcanzado" | "en_progreso" | "critico";
  icono: any;
  color: string;
}

interface LogroDesbloqueado {
  id: string;
  nombre: string;
  descripcion: string;
  fecha_obtencion: string;
  icono: any;
  color: string;
  rareza: "comun" | "raro" | "epico" | "legendario";
}

interface RankingPosicion {
  posicion: number;
  total_tecnicos: number;
  percentil: number;
  categoria: string;
}

interface AnalisisFortalezas {
  fortaleza: string;
  nivel: number;
  descripcion: string;
  icono: any;
  color: string;
}

interface AnalisisDebilidades {
  debilidad: string;
  nivel: number;
  descripcion: string;
  recomendacion: string;
  icono: any;
  color: string;
}

interface TendenciaRendimiento {
  fecha: string;
  rendimiento_general: number;
  productividad: number;
  calidad: number;
  velocidad: number;
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

// ========================================
// COMPONENTE PRINCIPAL
// ========================================

export default function RendimientoTecnicoPage() {
  const router = useRouter();

  // Estados
  const [usuario, setUsuario] = useState<UsuarioSesion | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingRendimiento, setLoadingRendimiento] = useState(true);
  const [estadisticas, setEstadisticas] = useState<EstadisticasTecnico | null>(null);
  const [metricasRendimiento, setMetricasRendimiento] = useState<MetricasRendimiento[]>([]);
  const [comparativaEquipo, setComparativaEquipo] = useState<ComparativaEquipo[]>([]);
  const [rendimientoPorCategoria, setRendimientoPorCategoria] = useState<
    RendimientoPorCategoria[]
  >([]);
  const [rendimientoPorHora, setRendimientoPorHora] = useState<RendimientoPorHora[]>([]);
  const [rendimientoPorDia, setRendimientoPorDia] = useState<RendimientoPorDia[]>([]);
  const [objetivosRendimiento, setObjetivosRendimiento] = useState<ObjetivoRendimiento[]>([]);
  const [logrosDesbloqueados, setLogrosDesbloqueados] = useState<LogroDesbloqueado[]>([]);
  const [rankingPosicion, setRankingPosicion] = useState<RankingPosicion | null>(null);
  const [analisisFortalezas, setAnalisisFortalezas] = useState<AnalisisFortalezas[]>([]);
  const [analisisDebilidades, setAnalisisDebilidades] = useState<AnalisisDebilidades[]>([]);
  const [tendenciaRendimiento, setTendenciaRendimiento] = useState<TendenciaRendimiento[]>([]);

  const [temaActual, setTemaActual] = useState<TemaColor>("dark");
  const [sidebarAbierto, setSidebarAbierto] = useState(true);
  const [perfilAbierto, setPerfilAbierto] = useState(false);
  const [busqueda, setBusqueda] = useState("");
  const [disponibilidad, setDisponibilidad] = useState<
    "disponible" | "ocupado" | "fuera_servicio"
  >("disponible");
  const [rangoFechas, setRangoFechas] = useState<"7d" | "30d" | "90d" | "anio">("30d");
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
      cargarRendimiento();
    }
  }, [usuario, rangoFechas]);

  useEffect(() => {
    if (!usuario?.tecnico?.id_tecnico) return;

    const interval = setInterval(() => {
      cargarRendimiento();
    }, 300000); // 5 min

    return () => clearInterval(interval);
  }, [usuario, rangoFechas]);

  // ========================================
  // FUNCIONES
  // ========================================

  const cargarRendimiento = async () => {
    if (!usuario?.tecnico?.id_tecnico) return;

    try {
      setLoadingRendimiento(true);

      const params = new URLSearchParams({
        id_tecnico: String(usuario.tecnico.id_tecnico),
        rango: rangoFechas,
      });

      const res = await fetch(`/api/tecnico/rendimiento?${params.toString()}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      const data = await res.json().catch(() => ({ success: false }));

      if (!res.ok || !data.success) {
        console.error("Error al cargar rendimiento:", data);
        return;
      }

      // Actualizar con datos del API
      if (data.metricas_rendimiento) setMetricasRendimiento(data.metricas_rendimiento);
      if (data.comparativa_equipo) setComparativaEquipo(data.comparativa_equipo);
      if (data.rendimiento_por_categoria)
        setRendimientoPorCategoria(data.rendimiento_por_categoria);
      if (data.rendimiento_por_hora) setRendimientoPorHora(data.rendimiento_por_hora);
      if (data.rendimiento_por_dia) setRendimientoPorDia(data.rendimiento_por_dia);
      if (data.objetivos_rendimiento) setObjetivosRendimiento(data.objetivos_rendimiento);
      if (data.logros_desbloqueados) setLogrosDesbloqueados(data.logros_desbloqueados);
      if (data.ranking_posicion) setRankingPosicion(data.ranking_posicion);
      if (data.analisis_fortalezas) setAnalisisFortalezas(data.analisis_fortalezas);
      if (data.analisis_debilidades) setAnalisisDebilidades(data.analisis_debilidades);
      if (data.tendencia_rendimiento) setTendenciaRendimiento(data.tendencia_rendimiento);
      if (data.estadisticas) setEstadisticas(data.estadisticas);
    } catch (err) {
      console.error("Error al cargar rendimiento:", err);
    } finally {
      setLoadingRendimiento(false);
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

  const obtenerColorRareza = (rareza: string) => {
    const colores: { [key: string]: string } = {
      comun: "from-gray-500 to-gray-600",
      raro: "from-blue-500 to-cyan-500",
      epico: "from-purple-500 to-pink-500",
      legendario: "from-yellow-500 to-amber-500",
    };
    return colores[rareza] || colores.comun;
  };

  const exportarExcel = () => {
    window.open(
      `/api/tecnico/rendimiento/export?formato=excel&id_tecnico=${usuario?.tecnico?.id_tecnico}&rango=${rangoFechas}`,
      "_blank"
    );
  };

  const exportarPDF = () => {
    window.open(
      `/api/tecnico/rendimiento/export?formato=pdf&id_tecnico=${usuario?.tecnico?.id_tecnico}&rango=${rangoFechas}`,
      "_blank"
    );
  };

  const exportarCSV = () => {
    window.open(
      `/api/tecnico/rendimiento/export?formato=csv&id_tecnico=${usuario?.tecnico?.id_tecnico}&rango=${rangoFechas}`,
      "_blank"
    );
  };

  // Calcular métricas promedio
  const metricasPromedio = useMemo(() => {
    if (metricasRendimiento.length === 0) {
      return {
        tickets_resueltos: 0,
        tiempo_promedio: 0,
        calificacion: 0,
        productividad: 0,
        cumplimiento_sla: 0,
        tasa_resolucion: 0,
      };
    }

    const suma = metricasRendimiento.reduce(
      (acc, m) => ({
        tickets_resueltos: acc.tickets_resueltos + m.tickets_resueltos,
        tiempo_promedio: acc.tiempo_promedio + m.tiempo_promedio_resolucion,
        calificacion: acc.calificacion + m.calificacion_promedio,
        productividad: acc.productividad + m.productividad,
        cumplimiento_sla: acc.cumplimiento_sla + m.cumplimiento_sla,
        tasa_resolucion: acc.tasa_resolucion + m.tasa_resolucion_primer_contacto,
      }),
      {
        tickets_resueltos: 0,
        tiempo_promedio: 0,
        calificacion: 0,
        productividad: 0,
        cumplimiento_sla: 0,
        tasa_resolucion: 0,
      }
    );

    const count = metricasRendimiento.length;
    return {
      tickets_resueltos: Math.round(suma.tickets_resueltos / count),
      tiempo_promedio: Math.round(suma.tiempo_promedio / count),
      calificacion: suma.calificacion / count,
      productividad: suma.productividad / count,
      cumplimiento_sla: suma.cumplimiento_sla / count,
      tasa_resolucion: suma.tasa_resolucion / count,
    };
  }, [metricasRendimiento]);

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
              <Trophy className="w-10 h-10 text-white" />
            </div>
          </div>
          <h2 className={`text-4xl font-black mb-4 ${tema.colores.texto}`}>
            Cargando Análisis de Rendimiento
          </h2>
          <p
            className={`text-lg font-semibold ${tema.colores.textoSecundario} animate-pulse`}
          >
            Preparando métricas avanzadas...
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
            No tienes permisos para acceder al análisis de rendimiento.
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
                placeholder="Buscar métricas de rendimiento..."
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
                  Análisis de Rendimiento
                </span>
              </div>
              <h2
                className={`text-4xl font-black mb-1 ${tema.colores.texto} flex items-center gap-3`}
              >
                <Trophy className="w-10 h-10" />
                Mi Rendimiento
                <span className="inline-flex items-center justify-center px-3 py-1 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-sm font-bold shadow-lg shadow-indigo-500/50 animate-pulse">
                  PRO ANALYTICS
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
                {(["7d", "30d", "90d", "anio"] as const).map((r) => (
                  <button
                    key={r}
                    onClick={() => setRangoFechas(r)}
                    className={`px-4 py-2 rounded-xl font-semibold text-sm transition-all duration-300 hover:scale-105 ${
                      rangoFechas === r
                        ? `bg-gradient-to-r ${tema.colores.gradiente} text-white shadow-lg`
                        : `${tema.colores.secundario} ${tema.colores.texto}`
                    }`}
                  >
                    {r === "7d"
                      ? "7 días"
                      : r === "30d"
                      ? "30 días"
                      : r === "90d"
                      ? "90 días"
                      : "Año"}
                  </button>
                ))}
              </div>

              <button
                onClick={() => cargarRendimiento()}
                className={`flex items-center gap-2 px-4 py-2 ${tema.colores.primario} text-white rounded-xl font-bold transition-all duration-300 hover:scale-105 ${tema.colores.sombra}`}
              >
                <RefreshCw
                  className={`w-4 h-4 ${loadingRendimiento ? "animate-spin" : ""}`}
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
            Análisis completo de tu rendimiento con métricas avanzadas, comparativas de equipo,
            logros desbloqueados y recomendaciones personalizadas con IA.
          </p>
        </div>

        {loadingRendimiento ? (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <SkeletonCard key={i} tema={tema} />
              ))}
            </div>
          </div>
        ) : (
          <>
            {/* Métricas Principales */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {[
                {
                  titulo: "Tickets Resueltos",
                  valor: metricasPromedio.tickets_resueltos,
                  descripcion: "Promedio por período",
                  icono: CheckCircle2,
                  color: "from-green-500 to-emerald-500",
                  extra: `${rangoFechas === "7d" ? "Última semana" : rangoFechas === "30d" ? "Último mes" : rangoFechas === "90d" ? "Últimos 3 meses" : "Último año"}`,
                  tendencia: "up" as const,
                  cambio: "+12%",
                },
                {
                  titulo: "Tiempo Promedio",
                  valor: `${metricasPromedio.tiempo_promedio}m`,
                  descripcion: "Resolución de tickets",
                  icono: Clock,
                  color: "from-blue-500 to-cyan-500",
                  extra: "Por ticket",
                  tendencia: "down" as const,
                  cambio: "-8%",
                },
                {
                  titulo: "Calificación",
                  valor: metricasPromedio.calificacion.toFixed(1),
                  descripcion: "Satisfacción del usuario",
                  icono: Star,
                  color: "from-yellow-500 to-amber-500",
                  extra: "de 5.0 estrellas",
                  tendencia: "up" as const,
                  cambio: "+5%",
                },
                {
                  titulo: "Productividad",
                  valor: `${metricasPromedio.productividad.toFixed(1)}`,
                  descripcion: "Tickets por hora",
                  icono: Zap,
                  color: "from-orange-500 to-red-500",
                  extra: "Índice de eficiencia",
                  tendencia: "up" as const,
                  cambio: "+15%",
                },
                {
                  titulo: "Cumplimiento SLA",
                  valor: `${metricasPromedio.cumplimiento_sla.toFixed(1)}%`,
                  descripcion: "Dentro del tiempo",
                  icono: Target,
                  color: "from-purple-500 to-pink-500",
                  extra: "Objetivo: 90%",
                  tendencia: "up" as const,
                  cambio: "+3%",
                },
                {
                  titulo: "Tasa Resolución",
                  valor: `${metricasPromedio.tasa_resolucion.toFixed(1)}%`,
                  descripcion: "Primer contacto",
                  icono: ThumbsUp,
                  color: "from-indigo-500 to-blue-500",
                  extra: "Solución efectiva",
                  tendencia: "up" as const,
                  cambio: "+7%",
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

            {/* Ranking y Posición */}
            {rankingPosicion && (
              <div
                className={`rounded-2xl p-6 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} mb-8 animate-fadeIn`}
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-12 h-12 bg-gradient-to-br from-yellow-500 to-amber-500 rounded-xl flex items-center justify-center shadow-lg`}
                    >
                      <Trophy className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className={`text-xl font-black ${tema.colores.texto}`}>
                        Tu Posición en el Ranking
                      </h3>
                      <p
                        className={`text-sm font-semibold ${tema.colores.textoSecundario}`}
                      >
                        {rankingPosicion.categoria}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-2 mb-3">
                      <Medal className="w-8 h-8 text-yellow-400" />
                      <span
                        className={`text-6xl font-black bg-gradient-to-r ${tema.colores.gradiente} bg-clip-text text-transparent`}
                      >
                        #{rankingPosicion.posicion}
                      </span>
                    </div>
                    <p className={`text-sm font-bold ${tema.colores.texto}`}>
                      Posición Actual
                    </p>
                    <p className={`text-xs ${tema.colores.textoSecundario}`}>
                      de {rankingPosicion.total_tecnicos} técnicos
                    </p>
                  </div>

                  <div className="text-center">
                    <div className="flex items-center justify-center gap-2 mb-3">
                      <Percent className="w-8 h-8 text-purple-400" />
                      <span className={`text-6xl font-black text-purple-400`}>
                        {rankingPosicion.percentil}
                      </span>
                    </div>
                    <p className={`text-sm font-bold ${tema.colores.texto}`}>
                      Percentil
                    </p>
                    <p className={`text-xs ${tema.colores.textoSecundario}`}>
                      Top {100 - rankingPosicion.percentil}%
                    </p>
                  </div>

                  <div className="text-center">
                    <div className="flex items-center justify-center gap-2 mb-3">
                      <TrendingUp className="w-8 h-8 text-emerald-400" />
                      <span className={`text-6xl font-black text-emerald-400`}>
                        {Math.max(0, rankingPosicion.total_tecnicos - rankingPosicion.posicion)}
                      </span>
                    </div>
                    <p className={`text-sm font-bold ${tema.colores.texto}`}>
                      Técnicos Superados
                    </p>
                    <p className={`text-xs ${tema.colores.textoSecundario}`}>
                      En este período
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Tendencia de Rendimiento */}
            {tendenciaRendimiento.length > 0 && (
              <div
                className={`rounded-2xl p-6 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} mb-8 animate-fadeIn`}
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg`}
                    >
                      <LineChart className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className={`text-xl font-black ${tema.colores.texto}`}>
                        Tendencia de Rendimiento General
                      </h3>
                      <p
                        className={`text-sm font-semibold ${tema.colores.textoSecundario}`}
                      >
                        Evolución de tus métricas clave
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() =>
                      setVistaExpandida(
                        vistaExpandida === "tendencia" ? null : "tendencia"
                      )
                    }
                    className={`p-2 rounded-lg ${tema.colores.secundario} transition-all duration-200`}
                  >
                    {vistaExpandida === "tendencia" ? (
                      <Minimize2 className="w-5 h-5" />
                    ) : (
                      <Maximize2 className="w-5 h-5" />
                    )}
                  </button>
                </div>

                <ResponsiveContainer
                  width="100%"
                  height={vistaExpandida === "tendencia" ? 500 : 350}
                >
                  <ComposedChart data={tendenciaRendimiento}>
                    <defs>
                      <linearGradient id="colorRendimiento" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0.1} />
                      </linearGradient>
                      <linearGradient id="colorProductividad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.1} />
                      </linearGradient>
                      <linearGradient id="colorCalidad" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0.1} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                    <XAxis
                      dataKey="fecha"
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
                      dataKey="rendimiento_general"
                      stroke="#6366f1"
                      strokeWidth={3}
                      fillOpacity={1}
                      fill="url(#colorRendimiento)"
                      name="Rendimiento General"
                    />
                    <Area
                      type="monotone"
                      dataKey="productividad"
                      stroke="#f59e0b"
                      strokeWidth={3}
                      fillOpacity={1}
                      fill="url(#colorProductividad)"
                      name="Productividad"
                    />
                    <Area
                      type="monotone"
                      dataKey="calidad"
                      stroke="#10b981"
                      strokeWidth={3}
                      fillOpacity={1}
                      fill="url(#colorCalidad)"
                      name="Calidad"
                    />
                    <Line
                      type="monotone"
                      dataKey="velocidad"
                      stroke="#ec4899"
                      strokeWidth={3}
                      name="Velocidad"
                      dot={{ fill: "#ec4899", r: 5 }}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Comparativa con el Equipo */}
            {comparativaEquipo.length > 0 && (
              <div
                className={`rounded-2xl p-6 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} mb-8 animate-fadeIn`}
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg`}
                    >
                      <Users className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className={`text-xl font-black ${tema.colores.texto}`}>
                        Comparativa con el Equipo
                      </h3>
                      <p
                        className={`text-sm font-semibold ${tema.colores.textoSecundario}`}
                      >
                        Top 5 técnicos del período
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
                        <th className="pb-4 pr-4 font-black text-gray-400">Posición</th>
                        <th className="pb-4 pr-4 font-black text-gray-400">Técnico</th>
                        <th className="pb-4 pr-4 font-black text-gray-400 text-center">
                          Tickets Resueltos
                        </th>
                        <th className="pb-4 pr-4 font-black text-gray-400 text-center">
                          Calificación
                        </th>
                        <th className="pb-4 pr-4 font-black text-gray-400 text-center">
                          Tiempo Promedio
                        </th>
                        <th className="pb-4 pr-4 font-black text-gray-400 text-center">
                          Productividad
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {comparativaEquipo.map((tecnico, idx) => (
                        <tr
                          key={tecnico.tecnico}
                          className={`border-t ${tema.colores.borde} ${
                            tecnico.es_yo
                              ? "bg-indigo-500/10 border-indigo-500/30"
                              : tema.colores.hover
                          } transition-all duration-200 animate-slideUp`}
                          style={{ animationDelay: `${idx * 50}ms` }}
                        >
                          <td className="py-4 pr-4">
                            <div className="flex items-center gap-2">
                              {idx === 0 && (
                                <Medal className="w-6 h-6 text-yellow-400" />
                              )}
                              {idx === 1 && (
                                <Medal className="w-6 h-6 text-gray-400" />
                              )}
                              {idx === 2 && (
                                <Medal className="w-6 h-6 text-amber-600" />
                              )}
                              <span
                                className={`text-lg font-black ${
                                  tecnico.es_yo ? tema.colores.acento : tema.colores.texto
                                }`}
                              >
                                #{idx + 1}
                              </span>
                            </div>
                          </td>
                          <td className="py-4 pr-4">
                            <div className="flex items-center gap-3">
                              <div
                                className={`w-10 h-10 rounded-xl ${
                                  tecnico.es_yo
                                    ? `bg-gradient-to-br ${tema.colores.gradiente}`
                                    : "bg-gray-700"
                                } flex items-center justify-center text-white font-bold shadow-lg`}
                              >
                                {tecnico.tecnico.charAt(0)}
                              </div>
                              <div>
                                <p
                                  className={`font-bold ${
                                    tecnico.es_yo ? tema.colores.acento : tema.colores.texto
                                  }`}
                                >
                                  {tecnico.tecnico}
                                  {tecnico.es_yo && (
                                    <span className="ml-2 px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-400 text-xs font-bold">
                                      TÚ
                                    </span>
                                  )}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 pr-4 text-center">
                            <span className={`text-lg font-black ${tema.colores.texto}`}>
                              {tecnico.tickets_resueltos}
                            </span>
                          </td>
                          <td className="py-4 pr-4 text-center">
                            <div className="flex items-center justify-center gap-1">
                              <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                              <span className="text-lg font-black text-yellow-400">
                                {tecnico.calificacion.toFixed(1)}
                              </span>
                            </div>
                          </td>
                          <td className="py-4 pr-4 text-center">
                            <span className="text-lg font-black text-blue-400">
                              {tecnico.tiempo_promedio}m
                            </span>
                          </td>
                          <td className="py-4 pr-4 text-center">
                            <span className="text-lg font-black text-emerald-400">
                              {tecnico.productividad.toFixed(1)}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Rendimiento por Categoría */}
            {rendimientoPorCategoria.length > 0 && (
              <div
                className={`rounded-2xl p-6 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} mb-8 animate-fadeIn`}
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg`}
                    >
                      <BarChart3 className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className={`text-xl font-black ${tema.colores.texto}`}>
                        Rendimiento por Categoría
                      </h3>
                      <p
                        className={`text-sm font-semibold ${tema.colores.textoSecundario}`}
                      >
                        Análisis detallado por tipo de ticket
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {rendimientoPorCategoria.map((cat, idx) => (
                    <div
                      key={cat.categoria}
                      className={`p-5 rounded-xl ${tema.colores.hover} border ${tema.colores.borde} transition-all duration-300 hover:scale-105 animate-slideUp`}
                      style={{ animationDelay: `${idx * 50}ms` }}
                    >
                      <div className="flex items-center justify-between mb-4">
                        <h4 className={`text-lg font-black ${tema.colores.texto}`}>
                          {cat.categoria}
                        </h4>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-purple-500 to-pink-500 text-white`}
                        >
                          {cat.cantidad} tickets
                        </span>
                      </div>

                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <p className={`text-xs font-bold ${tema.colores.textoSecundario} mb-1`}>
                            Tiempo Promedio
                          </p>
                          <p className={`text-xl font-black text-blue-400`}>
                            {cat.tiempo_promedio}m
                          </p>
                        </div>
                        <div>
                          <p className={`text-xs font-bold ${tema.colores.textoSecundario} mb-1`}>
                            Calificación
                          </p>
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                            <p className={`text-xl font-black text-yellow-400`}>
                              {cat.calificacion_promedio.toFixed(1)}
                            </p>
                          </div>
                        </div>
                        <div>
                          <p className={`text-xs font-bold ${tema.colores.textoSecundario} mb-1`}>
                            Tasa Éxito
                          </p>
                          <p className={`text-xl font-black text-emerald-400`}>
                            {cat.tasa_exito.toFixed(0)}%
                          </p>
                        </div>
                      </div>

                      <div className="mt-4">
                        <div className="w-full bg-gray-700/30 rounded-full h-2">
                          <div
                            className={`h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-1000`}
                            style={{ width: `${cat.tasa_exito}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Rendimiento por Hora del Día */}
            {rendimientoPorHora.length > 0 && (
              <div
                className={`rounded-2xl p-6 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} mb-8 animate-fadeIn`}
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center shadow-lg`}
                    >
                      <Clock className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className={`text-xl font-black ${tema.colores.texto}`}>
                        Rendimiento por Hora del Día
                      </h3>
                      <p
                        className={`text-sm font-semibold ${tema.colores.textoSecundario}`}
                      >
                        Identifica tus horas más productivas
                      </p>
                    </div>
                  </div>
                </div>

                <ResponsiveContainer width="100%" height={300}>
                  <RechartsBarChart data={rendimientoPorHora}>
                    <defs>
                      <linearGradient id="colorHora" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f97316" stopOpacity={1} />
                        <stop offset="95%" stopColor="#ef4444" stopOpacity={1} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                    <XAxis
                      dataKey="hora"
                      stroke={tema.colores.textoSecundario}
                      style={{ fontSize: "12px", fontWeight: "600" }}
                    />
                    <YAxis
                      stroke={tema.colores.textoSecundario}
                      style={{ fontSize: "12px", fontWeight: "600" }}
                    />
                    <Tooltip content={<CustomTooltip tema={tema} />} />
                    <Bar
                      dataKey="tickets_resueltos"
                      fill="url(#colorHora)"
                      name="Tickets Resueltos"
                      radius={[8, 8, 0, 0]}
                    />
                    <Line
                      type="monotone"
                      dataKey="eficiencia"
                      stroke="#10b981"
                      strokeWidth={3}
                      name="Eficiencia %"
                      dot={{ fill: "#10b981", r: 5 }}
                    />
                  </RechartsBarChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Rendimiento por Día de la Semana */}
            {rendimientoPorDia.length > 0 && (
              <div
                className={`rounded-2xl p-6 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} mb-8 animate-fadeIn`}
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg`}
                    >
                      <Calendar className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className={`text-xl font-black ${tema.colores.texto}`}>
                        Rendimiento por Día de la Semana
                      </h3>
                      <p
                        className={`text-sm font-semibold ${tema.colores.textoSecundario}`}
                      >
                        Análisis semanal de productividad
                      </p>
                    </div>
                  </div>
                </div>

                <ResponsiveContainer width="100%" height={350}>
                  <RadarChart data={rendimientoPorDia}>
                    <PolarGrid stroke={tema.colores.borde} />
                    <PolarAngleAxis
                      dataKey="dia"
                      stroke={tema.colores.textoSecundario}
                      style={{ fontSize: "12px", fontWeight: "600" }}
                    />
                    <PolarRadiusAxis stroke={tema.colores.textoSecundario} />
                    <Radar
                      name="Tickets Resueltos"
                      dataKey="tickets_resueltos"
                      stroke="#10b981"
                      fill="#10b981"
                      fillOpacity={0.6}
                    />
                    <Radar
                      name="Calificación"
                      dataKey="calificacion"
                      stroke="#f59e0b"
                      fill="#f59e0b"
                      fillOpacity={0.6}
                    />
                    <Radar
                      name="Productividad"
                      dataKey="productividad"
                      stroke="#6366f1"
                      fill="#6366f1"
                      fillOpacity={0.6}
                    />
                    <Legend />
                    <Tooltip content={<CustomTooltip tema={tema} />} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Objetivos de Rendimiento */}
            {objetivosRendimiento.length > 0 && (
              <div
                className={`rounded-2xl p-6 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} mb-8 animate-fadeIn`}
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-xl flex items-center justify-center shadow-lg`}
                    >
                      <Target className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className={`text-xl font-black ${tema.colores.texto}`}>
                        Objetivos de Rendimiento
                      </h3>
                      <p
                        className={`text-sm font-semibold ${tema.colores.textoSecundario}`}
                      >
                        Seguimiento de tus metas personales
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {objetivosRendimiento.map((objetivo, idx) => {
                    const Icono = objetivo.icono;
                    return (
                      <div
                        key={objetivo.id}
                        className={`p-6 rounded-xl ${tema.colores.hover} border ${
                          objetivo.estado === "alcanzado"
                            ? "border-green-500/30"
                            : objetivo.estado === "critico"
                            ? "border-red-500/30"
                            : tema.colores.borde
                        } transition-all duration-300 hover:scale-105 animate-slideUp`}
                        style={{ animationDelay: `${idx * 50}ms` }}
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-start gap-3">
                            <div
                              className={`w-12 h-12 bg-gradient-to-br ${objetivo.color} rounded-xl flex items-center justify-center shadow-lg flex-shrink-0`}
                            >
                              <Icono className="w-6 h-6 text-white" />
                            </div>
                            <div className="flex-1">
                              <h4
                                className={`text-lg font-black mb-1 ${tema.colores.texto}`}
                              >
                                {objetivo.nombre}
                              </h4>
                              <p className={`text-xs ${tema.colores.textoSecundario}`}>
                                {objetivo.descripcion}
                              </p>
                            </div>
                          </div>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-bold ${
                              objetivo.estado === "alcanzado"
                                ? "bg-green-500/20 text-green-400 border border-green-500/30"
                                : objetivo.estado === "critico"
                                ? "bg-red-500/20 text-red-400 border border-red-500/30"
                                : "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                            }`}
                          >
                            {objetivo.estado === "alcanzado"
                              ? "✓ Alcanzado"
                              : objetivo.estado === "critico"
                              ? "! Crítico"
                              : "En Progreso"}
                          </span>
                        </div>

                        <div className="mb-4">
                          <div className="flex items-center justify-between mb-2">
                            <span
                              className={`text-sm font-bold ${tema.colores.textoSecundario}`}
                            >
                              Progreso
                            </span>
                            <span className={`text-sm font-black ${tema.colores.texto}`}>
                              {objetivo.progreso}%
                            </span>
                          </div>
                          <div className="h-3 bg-gray-700/30 rounded-full overflow-hidden">
                            <div
                              className={`h-full bg-gradient-to-r ${objetivo.color} rounded-full transition-all duration-1000 ease-out relative overflow-hidden`}
                              style={{ width: `${objetivo.progreso}%` }}
                            >
                              <div className="absolute inset-0 bg-white/20 animate-shimmer"></div>
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <p
                              className={`text-xs font-bold mb-1 ${tema.colores.textoSecundario}`}
                            >
                              Actual
                            </p>
                            <p className={`text-2xl font-black ${tema.colores.texto}`}>
                              {objetivo.valor_actual}
                              {objetivo.unidad}
                            </p>
                          </div>
                          <div>
                            <p
                              className={`text-xs font-bold mb-1 ${tema.colores.textoSecundario}`}
                            >
                              Objetivo
                            </p>
                            <p className={`text-2xl font-black ${tema.colores.texto}`}>
                              {objetivo.valor_objetivo}
                              {objetivo.unidad}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Análisis de Fortalezas y Debilidades */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              {/* Fortalezas */}
              {analisisFortalezas.length > 0 && (
                <div
                  className={`rounded-2xl p-6 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} animate-fadeIn`}
                >
                  <div className="flex items-center gap-3 mb-6">
                    <div
                      className={`w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg`}
                    >
                      <ThumbsUp className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className={`text-xl font-black ${tema.colores.texto}`}>
                        Tus Fortalezas
                      </h3>
                      <p
                        className={`text-sm font-semibold ${tema.colores.textoSecundario}`}
                      >
                        Áreas donde destacas
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {analisisFortalezas.map((fortaleza, idx) => {
                      const Icono = fortaleza.icono;
                      return (
                        <div
                          key={fortaleza.fortaleza}
                          className={`p-4 rounded-xl ${tema.colores.hover} border ${tema.colores.borde} transition-all duration-300 hover:scale-105 animate-slideUp`}
                          style={{ animationDelay: `${idx * 50}ms` }}
                        >
                          <div className="flex items-center gap-3 mb-3">
                            <div
                              className={`w-10 h-10 bg-gradient-to-br ${fortaleza.color} rounded-lg flex items-center justify-center shadow-lg`}
                            >
                              <Icono className="w-5 h-5 text-white" />
                            </div>
                            <div className="flex-1">
                              <p className={`text-sm font-black ${tema.colores.texto}`}>
                                {fortaleza.fortaleza}
                              </p>
                              <p className={`text-xs ${tema.colores.textoSecundario}`}>
                                {fortaleza.descripcion}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-2 bg-gray-700/30 rounded-full overflow-hidden">
                              <div
                                className={`h-full bg-gradient-to-r ${fortaleza.color} rounded-full transition-all duration-1000`}
                                style={{ width: `${fortaleza.nivel}%` }}
                              ></div>
                            </div>
                            <span className={`text-sm font-black text-emerald-400`}>
                              {fortaleza.nivel}%
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Debilidades */}
              {analisisDebilidades.length > 0 && (
                <div
                  className={`rounded-2xl p-6 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} animate-fadeIn`}
                >
                  <div className="flex items-center gap-3 mb-6">
                    <div
                      className={`w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center shadow-lg`}
                    >
                      <AlertTriangle className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className={`text-xl font-black ${tema.colores.texto}`}>
                        Áreas de Mejora
                      </h3>
                      <p
                        className={`text-sm font-semibold ${tema.colores.textoSecundario}`}
                      >
                        Oportunidades de crecimiento
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {analisisDebilidades.map((debilidad, idx) => {
                      const Icono = debilidad.icono;
                      return (
                        <div
                          key={debilidad.debilidad}
                          className={`p-4 rounded-xl ${tema.colores.hover} border ${tema.colores.borde} transition-all duration-300 hover:scale-105 animate-slideUp`}
                          style={{ animationDelay: `${idx * 50}ms` }}
                        >
                          <div className="flex items-center gap-3 mb-3">
                            <div
                              className={`w-10 h-10 bg-gradient-to-br ${debilidad.color} rounded-lg flex items-center justify-center shadow-lg`}
                            >
                              <Icono className="w-5 h-5 text-white" />
                            </div>
                            <div className="flex-1">
                              <p className={`text-sm font-black ${tema.colores.texto}`}>
                                {debilidad.debilidad}
                              </p>
                              <p className={`text-xs ${tema.colores.textoSecundario}`}>
                                {debilidad.descripcion}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 mb-3">
                            <div className="flex-1 h-2 bg-gray-700/30 rounded-full overflow-hidden">
                              <div
                                className={`h-full bg-gradient-to-r ${debilidad.color} rounded-full transition-all duration-1000`}
                                style={{ width: `${debilidad.nivel}%` }}
                              ></div>
                            </div>
                            <span className={`text-sm font-black text-orange-400`}>
                              {debilidad.nivel}%
                            </span>
                          </div>
                          <div
                            className={`p-3 rounded-lg bg-blue-500/10 border border-blue-500/30`}
                          >
                            <div className="flex items-start gap-2">
                              <Lightbulb className="w-4 h-4 mt-0.5 flex-shrink-0 text-blue-400" />
                              <div>
                                <p
                                  className={`text-xs font-bold mb-1 ${tema.colores.texto}`}
                                >
                                  Recomendación
                                </p>
                                <p className={`text-xs ${tema.colores.textoSecundario}`}>
                                  {debilidad.recomendacion}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Logros Desbloqueados */}
            {logrosDesbloqueados.length > 0 && (
              <div
                className={`rounded-2xl p-6 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} mb-8 animate-fadeIn`}
              >
                <div className="flex items-center gap-3 mb-6">
                  <div
                    className={`w-12 h-12 bg-gradient-to-br from-yellow-500 to-amber-500 rounded-xl flex items-center justify-center shadow-lg animate-pulse`}
                  >
                    <Award className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className={`text-xl font-black ${tema.colores.texto}`}>
                      Logros Desbloqueados
                    </h3>
                    <p
                      className={`text-sm font-semibold ${tema.colores.textoSecundario}`}
                    >
                      {logrosDesbloqueados.length} logros conseguidos
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {logrosDesbloqueados.map((logro, idx) => {
                    const Icono = logro.icono;
                    return (
                      <div
                        key={logro.id}
                        className={`p-5 rounded-xl bg-gradient-to-br ${obtenerColorRareza(
                          logro.rareza
                        )} border-2 ${
                          logro.rareza === "legendario"
                            ? "border-yellow-400 shadow-lg shadow-yellow-500/50"
                            : logro.rareza === "epico"
                            ? "border-purple-400 shadow-lg shadow-purple-500/50"
                            : logro.rareza === "raro"
                            ? "border-blue-400 shadow-lg shadow-blue-500/50"
                            : "border-gray-400"
                        } transition-all duration-300 hover:scale-105 animate-slideUp cursor-pointer group`}
                        style={{ animationDelay: `${idx * 50}ms` }}
                      >
                        <div className="flex flex-col items-center text-center">
                          <div
                            className={`w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}
                          >
                            <Icono className="w-8 h-8 text-white" />
                          </div>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-bold mb-2 ${
                              logro.rareza === "legendario"
                                ? "bg-yellow-400/20 text-yellow-100 border border-yellow-400/50"
                                : logro.rareza === "epico"
                                ? "bg-purple-400/20 text-purple-100 border border-purple-400/50"
                                : logro.rareza === "raro"
                                ? "bg-blue-400/20 text-blue-100 border border-blue-400/50"
                                : "bg-gray-400/20 text-gray-100 border border-gray-400/50"
                            }`}
                          >
                            {logro.rareza.toUpperCase()}
                          </span>
                          <h4 className="text-lg font-black text-white mb-2">
                            {logro.nombre}
                          </h4>
                          <p className="text-sm text-white/80 mb-3">
                            {logro.descripcion}
                          </p>
                          <p className="text-xs text-white/60">
                            Desbloqueado: {new Date(logro.fecha_obtencion).toLocaleDateString("es-CL")}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        )}
      </main>

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
                  <Trophy className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className={`text-sm font-black ${tema.colores.texto}`}>
                    AnyssaMed Performance Pro
                  </p>
                  <p className={`text-xs ${tema.colores.textoSecundario}`}>
                    Sistema de Análisis de Rendimiento con IA
                  </p>
                </div>
              </div>
              <p
                className={`text-xs font-semibold ${tema.colores.textoSecundario}`}
              >
                © 2025 AnyssaMed. Todos los derechos reservados. v2.4.0
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
                PRO ANALYTICS
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
                  <Brain className="w-3 h-3 text-purple-400" />
                  <p className={`text-xs font-bold ${tema.colores.texto}`}>IA</p>
                </div>
                <p className={`text-xs ${tema.colores.textoSecundario}`}>Activa</p>
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

        @keyframes shimmer {
          0% {
            background-position: -1000px 0;
          }
          100% {
            background-position: 1000px 0;
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

