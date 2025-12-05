// src/app/(dashboard)/tecnico/reportes/metricas/page.tsx
"use client";

import { useState, useEffect, useMemo } from "react";
import SidebarTecnico from "@/components/tecnico/SidebarTecnico";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

import {
  Activity,
  AlertCircle,
  AlertTriangle,
  ArrowDownRight,
  ArrowLeft,
  ArrowUpRight,
  Award,
  BarChart3,
  Bell,
  BellOff,
  BookOpen,
  Brain,
  BrainCircuit,
  Building2,
  Calendar,
  CheckCircle2,
  ChevronDown,
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
  PieChart,
  Printer,
  RefreshCw,
  Rocket,
  Search,
  Settings,
  Share2,
  Shield,
  ShieldCheck,
  Sparkles,
  Star,
  Sun,
  Target,
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
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart,
  Scatter,
  RadialBarChart,
  RadialBar,
  PolarAngleAxis,
  Cell,
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

interface MetricaDetallada {
  id: string;
  nombre: string;
  categoria: string;
  valor_actual: number;
  valor_objetivo: number;
  valor_minimo: number;
  valor_maximo: number;
  unidad: string;
  tendencia: "up" | "down" | "neutral";
  porcentaje_cambio: number;
  porcentaje_cumplimiento: number;
  icono: any;
  color: string;
  descripcion: string;
  recomendacion: string;
  historico: Array<{ fecha: string; valor: number }>;
}

interface ComparativaRendimiento {
  periodo: string;
  mi_rendimiento: number;
  promedio_equipo: number;
  mejor_tecnico: number;
}

interface ObjetivoMeta {
  id: string;
  nombre: string;
  descripcion: string;
  valor_actual: number;
  valor_objetivo: number;
  fecha_inicio: string;
  fecha_fin: string;
  progreso: number;
  estado: "en_progreso" | "completado" | "atrasado";
  icono: any;
  color: string;
}

interface InsightInteligente {
  id: string;
  tipo: "exito" | "advertencia" | "oportunidad" | "critico";
  titulo: string;
  descripcion: string;
  impacto: "alto" | "medio" | "bajo";
  accion_sugerida: string;
  icono: any;
  color: string;
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
// DATOS DE EJEMPLO (FALLBACK)
// ========================================

const METRICAS_DETALLADAS_DEFAULT: MetricaDetallada[] = [
  {
    id: "tiempo_respuesta",
    nombre: "Tiempo de Primera Respuesta",
    categoria: "Eficiencia",
    valor_actual: 12,
    valor_objetivo: 15,
    valor_minimo: 5,
    valor_maximo: 30,
    unidad: "min",
    tendencia: "down",
    porcentaje_cambio: -15,
    porcentaje_cumplimiento: 120,
    icono: Clock,
    color: "from-blue-500 to-cyan-500",
    descripcion: "Tiempo promedio desde la asignación hasta la primera respuesta",
    recomendacion: "Excelente rendimiento. Mantén este nivel de respuesta rápida.",
    historico: [
      { fecha: "Lun", valor: 14 },
      { fecha: "Mar", valor: 13 },
      { fecha: "Mié", valor: 15 },
      { fecha: "Jue", valor: 11 },
      { fecha: "Vie", valor: 12 },
      { fecha: "Sáb", valor: 10 },
      { fecha: "Dom", valor: 12 },
    ],
  },
  {
    id: "tasa_resolucion",
    nombre: "Tasa de Resolución",
    categoria: "Calidad",
    valor_actual: 87,
    valor_objetivo: 85,
    valor_minimo: 70,
    valor_maximo: 100,
    unidad: "%",
    tendencia: "up",
    porcentaje_cambio: 8,
    porcentaje_cumplimiento: 102,
    icono: CheckCircle2,
    color: "from-green-500 to-emerald-500",
    descripcion: "Porcentaje de tickets resueltos al primer contacto",
    recomendacion: "Superando el objetivo. Considera compartir tus mejores prácticas.",
    historico: [
      { fecha: "Lun", valor: 82 },
      { fecha: "Mar", valor: 84 },
      { fecha: "Mié", valor: 85 },
      { fecha: "Jue", valor: 86 },
      { fecha: "Vie", valor: 87 },
      { fecha: "Sáb", valor: 88 },
      { fecha: "Dom", valor: 87 },
    ],
  },
  {
    id: "satisfaccion_cliente",
    nombre: "Satisfacción del Cliente",
    categoria: "Experiencia",
    valor_actual: 4.7,
    valor_objetivo: 4.5,
    valor_minimo: 3.0,
    valor_maximo: 5.0,
    unidad: "/5",
    tendencia: "up",
    porcentaje_cambio: 5,
    porcentaje_cumplimiento: 104,
    icono: Star,
    color: "from-yellow-500 to-amber-500",
    descripcion: "Calificación promedio de satisfacción de usuarios",
    recomendacion: "Excelente nivel de satisfacción. Sigue brindando un servicio excepcional.",
    historico: [
      { fecha: "Lun", valor: 4.5 },
      { fecha: "Mar", valor: 4.6 },
      { fecha: "Mié", valor: 4.6 },
      { fecha: "Jue", valor: 4.7 },
      { fecha: "Vie", valor: 4.7 },
      { fecha: "Sáb", valor: 4.8 },
      { fecha: "Dom", valor: 4.7 },
    ],
  },
  {
    id: "productividad",
    nombre: "Productividad",
    categoria: "Rendimiento",
    valor_actual: 8.5,
    valor_objetivo: 7.0,
    valor_minimo: 4.0,
    valor_maximo: 12.0,
    unidad: "tickets/h",
    tendencia: "up",
    porcentaje_cambio: 12,
    porcentaje_cumplimiento: 121,
    icono: Zap,
    color: "from-orange-500 to-red-500",
    descripcion: "Número promedio de tickets procesados por hora",
    recomendacion: "Productividad sobresaliente. Asegúrate de mantener la calidad.",
    historico: [
      { fecha: "Lun", valor: 7.5 },
      { fecha: "Mar", valor: 8.0 },
      { fecha: "Mié", valor: 8.2 },
      { fecha: "Jue", valor: 8.5 },
      { fecha: "Vie", valor: 8.5 },
      { fecha: "Sáb", valor: 8.7 },
      { fecha: "Dom", valor: 8.5 },
    ],
  },
  {
    id: "cumplimiento_sla",
    nombre: "Cumplimiento SLA",
    categoria: "Compromiso",
    valor_actual: 94,
    valor_objetivo: 90,
    valor_minimo: 80,
    valor_maximo: 100,
    unidad: "%",
    tendencia: "up",
    porcentaje_cambio: 3,
    porcentaje_cumplimiento: 104,
    icono: Target,
    color: "from-purple-500 to-pink-500",
    descripcion: "Porcentaje de tickets resueltos dentro del SLA",
    recomendacion: "Excelente cumplimiento. Mantén el enfoque en los plazos.",
    historico: [
      { fecha: "Lun", valor: 91 },
      { fecha: "Mar", valor: 92 },
      { fecha: "Mié", valor: 93 },
      { fecha: "Jue", valor: 94 },
      { fecha: "Vie", valor: 94 },
      { fecha: "Sáb", valor: 95 },
      { fecha: "Dom", valor: 94 },
    ],
  },
  {
    id: "reaberturas",
    nombre: "Tasa de Reapertura",
    categoria: "Calidad",
    valor_actual: 5,
    valor_objetivo: 8,
    valor_minimo: 0,
    valor_maximo: 15,
    unidad: "%",
    tendencia: "down",
    porcentaje_cambio: -20,
    porcentaje_cumplimiento: 160,
    icono: RefreshCw,
    color: "from-indigo-500 to-blue-500",
    descripcion: "Porcentaje de tickets que se reabren después de cerrados",
    recomendacion: "Muy bajo nivel de reaperturas. Indica soluciones efectivas.",
    historico: [
      { fecha: "Lun", valor: 7 },
      { fecha: "Mar", valor: 6 },
      { fecha: "Mié", valor: 6 },
      { fecha: "Jue", valor: 5 },
      { fecha: "Vie", valor: 5 },
      { fecha: "Sáb", valor: 4 },
      { fecha: "Dom", valor: 5 },
    ],
  },
];

const COMPARATIVA_RENDIMIENTO_DEFAULT: ComparativaRendimiento[] = [
  { periodo: "Ene", mi_rendimiento: 85, promedio_equipo: 78, mejor_tecnico: 92 },
  { periodo: "Feb", mi_rendimiento: 87, promedio_equipo: 80, mejor_tecnico: 93 },
  { periodo: "Mar", mi_rendimiento: 89, promedio_equipo: 82, mejor_tecnico: 94 },
  { periodo: "Abr", mi_rendimiento: 91, promedio_equipo: 83, mejor_tecnico: 95 },
  { periodo: "May", mi_rendimiento: 93, promedio_equipo: 85, mejor_tecnico: 96 },
  { periodo: "Jun", mi_rendimiento: 94, promedio_equipo: 86, mejor_tecnico: 97 },
];

const OBJETIVOS_METAS_DEFAULT: ObjetivoMeta[] = [
  {
    id: "obj_1",
    nombre: "Reducir Tiempo de Respuesta",
    descripcion: "Lograr un tiempo promedio de respuesta menor a 10 minutos",
    valor_actual: 12,
    valor_objetivo: 10,
    fecha_inicio: "2025-01-01",
    fecha_fin: "2025-03-31",
    progreso: 80,
    estado: "en_progreso",
    icono: Clock3,
    color: "from-blue-500 to-cyan-500",
  },
  {
    id: "obj_2",
    nombre: "Aumentar Satisfacción",
    descripcion: "Alcanzar una calificación promedio de 4.8/5.0",
    valor_actual: 4.7,
    valor_objetivo: 4.8,
    fecha_inicio: "2025-01-01",
    fecha_fin: "2025-06-30",
    progreso: 95,
    estado: "en_progreso",
    icono: Star,
    color: "from-yellow-500 to-amber-500",
  },
  {
    id: "obj_3",
    nombre: "Certificación Avanzada",
    descripcion: "Completar certificación técnica nivel avanzado",
    valor_actual: 75,
    valor_objetivo: 100,
    fecha_inicio: "2025-01-01",
    fecha_fin: "2025-12-31",
    progreso: 75,
    estado: "en_progreso",
    icono: Award,
    color: "from-purple-500 to-pink-500",
  },
  {
    id: "obj_4",
    nombre: "Reducir Reaperturas",
    descripcion: "Mantener tasa de reapertura por debajo del 5%",
    valor_actual: 5,
    valor_objetivo: 5,
    fecha_inicio: "2025-01-01",
    fecha_fin: "2025-12-31",
    progreso: 100,
    estado: "completado",
    icono: CheckCircle2,
    color: "from-green-500 to-emerald-500",
  },
];

const INSIGHTS_INTELIGENTES_DEFAULT: InsightInteligente[] = [
  {
    id: "insight_1",
    tipo: "exito",
    titulo: "Rendimiento Excepcional",
    descripcion:
      "Tu productividad está un 21% por encima del promedio del equipo en los últimos 7 días.",
    impacto: "alto",
    accion_sugerida: "Considera compartir tus técnicas con el equipo en la próxima reunión.",
    icono: Trophy,
    color: "from-green-500 to-emerald-500",
  },
  {
    id: "insight_2",
    tipo: "oportunidad",
    titulo: "Oportunidad de Mejora",
    descripcion:
      "Los tickets de la categoría 'Infraestructura' toman un 30% más de tiempo que otras categorías.",
    impacto: "medio",
    accion_sugerida:
      "Considera solicitar capacitación adicional en infraestructura de red.",
    icono: Lightbulb,
    color: "from-blue-500 to-cyan-500",
  },
  {
    id: "insight_3",
    tipo: "advertencia",
    titulo: "Pico de Carga Próximo",
    descripcion:
      "Históricamente, los lunes tienen un 40% más de tickets. El próximo lunes es feriado recuperado.",
    impacto: "medio",
    accion_sugerida: "Prepara respuestas predefinidas para consultas frecuentes.",
    icono: AlertTriangle,
    color: "from-yellow-500 to-amber-500",
  },
  {
    id: "insight_4",
    tipo: "exito",
    titulo: "Satisfacción en Aumento",
    descripcion:
      "Tu calificación promedio ha aumentado 0.3 puntos en el último mes.",
    impacto: "alto",
    accion_sugerida: "Continúa con tu enfoque actual en la experiencia del usuario.",
    icono: ThumbsUp,
    color: "from-purple-500 to-pink-500",
  },
];

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
      <div className="h-2 bg-gray-700 rounded-full w-full"></div>
    </div>
  </div>
);

// ========================================
// COMPONENTE PRINCIPAL
// ========================================

export default function MetricasTecnicoPage() {
  const router = useRouter();

  // Estados
  const [usuario, setUsuario] = useState<UsuarioSesion | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMetricas, setLoadingMetricas] = useState(true);
  const [estadisticas, setEstadisticas] = useState<EstadisticasTecnico | null>(null);
  const [metricasDetalladas, setMetricasDetalladas] = useState<MetricaDetallada[]>(
    METRICAS_DETALLADAS_DEFAULT
  );
  const [comparativaRendimiento, setComparativaRendimiento] =
    useState<ComparativaRendimiento[]>(COMPARATIVA_RENDIMIENTO_DEFAULT);
  const [objetivosMetas, setObjetivosMetas] = useState<ObjetivoMeta[]>(
    OBJETIVOS_METAS_DEFAULT
  );
  const [insightsInteligentes, setInsightsInteligentes] = useState<InsightInteligente[]>(
    INSIGHTS_INTELIGENTES_DEFAULT
  );

  const [temaActual, setTemaActual] = useState<TemaColor>("dark");
  const [sidebarAbierto, setSidebarAbierto] = useState(true);
  const [notificacionesAbiertas, setNotificacionesAbiertas] = useState(false);
  const [perfilAbierto, setPerfilAbierto] = useState(false);
  const [busqueda, setBusqueda] = useState("");
  const [disponibilidad, setDisponibilidad] = useState<
    "disponible" | "ocupado" | "fuera_servicio"
  >("disponible");
  const [categoriaFiltro, setCategoriaFiltro] = useState<string | null>(null);
  const [metricaExpandida, setMetricaExpandida] = useState<string | null>(null);

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
      cargarMetricas();
    }
  }, [usuario]);

  useEffect(() => {
    if (!usuario?.tecnico?.id_tecnico) return;

    const interval = setInterval(() => {
      cargarMetricas();
    }, 300000); // 5 min

    return () => clearInterval(interval);
  }, [usuario]);

  // ========================================
  // FUNCIONES
  // ========================================

  const cargarMetricas = async () => {
    if (!usuario?.tecnico?.id_tecnico) return;

    try {
      setLoadingMetricas(true);

      const params = new URLSearchParams({
        id_tecnico: String(usuario.tecnico.id_tecnico),
      });

      const res = await fetch(`/api/tecnico/metricas?${params.toString()}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      const data = await res.json().catch(() => ({ success: false }));

      if (!res.ok || !data.success) {
        console.error("Error al cargar métricas:", data);
        return;
      }

      // Actualizar con datos del API si existen
      if (data.metricas_detalladas) setMetricasDetalladas(data.metricas_detalladas);
      if (data.comparativa_rendimiento)
        setComparativaRendimiento(data.comparativa_rendimiento);
      if (data.objetivos_metas) setObjetivosMetas(data.objetivos_metas);
      if (data.insights_inteligentes)
        setInsightsInteligentes(data.insights_inteligentes);
      if (data.estadisticas) setEstadisticas(data.estadisticas);
    } catch (err) {
      console.error("Error al cargar métricas:", err);
    } finally {
      setLoadingMetricas(false);
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

  const obtenerColorCategoria = (categoria: string) => {
    const colores: { [key: string]: string } = {
      Eficiencia: "from-blue-500 to-cyan-500",
      Calidad: "from-green-500 to-emerald-500",
      Experiencia: "from-yellow-500 to-amber-500",
      Rendimiento: "from-orange-500 to-red-500",
      Compromiso: "from-purple-500 to-pink-500",
    };
    return colores[categoria] || "from-gray-500 to-gray-600";
  };

  const obtenerColorInsight = (tipo: string) => {
    const colores: { [key: string]: string } = {
      exito: "from-green-500 to-emerald-500",
      advertencia: "from-yellow-500 to-amber-500",
      oportunidad: "from-blue-500 to-cyan-500",
      critico: "from-red-500 to-pink-500",
    };
    return colores[tipo] || "from-gray-500 to-gray-600";
  };

  const metricasFiltradas = useMemo(() => {
    if (!categoriaFiltro) return metricasDetalladas;
    return metricasDetalladas.filter((m) => m.categoria === categoriaFiltro);
  }, [metricasDetalladas, categoriaFiltro]);

  const categorias = useMemo(() => {
    return Array.from(new Set(metricasDetalladas.map((m) => m.categoria)));
  }, [metricasDetalladas]);

  const promedioGeneral = useMemo(() => {
    if (metricasDetalladas.length === 0) return 0;
    const suma = metricasDetalladas.reduce(
      (acc, m) => acc + m.porcentaje_cumplimiento,
      0
    );
    return Math.round(suma / metricasDetalladas.length);
  }, [metricasDetalladas]);

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
            Cargando Métricas Avanzadas
          </h2>
          <p
            className={`text-lg font-semibold ${tema.colores.textoSecundario} animate-pulse`}
          >
            Preparando análisis de rendimiento...
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
            No tienes permisos para acceder a las métricas técnicas.
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
                placeholder="Buscar métricas..."
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
                    {temaActual === key && <CheckCircle2 className="w-5 h-5" />}
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
                  Métricas Detalladas
                </span>
              </div>
              <h2
                className={`text-4xl font-black mb-1 ${tema.colores.texto} flex items-center gap-3`}
              >
                <BrainCircuit className="w-10 h-10" />
                Análisis de Rendimiento
                <span className="inline-flex items-center justify-center px-3 py-1 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-sm font-bold shadow-lg shadow-indigo-500/50 animate-pulse">
                  ADVANCED
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
              <button
                onClick={() => cargarMetricas()}
                className={`flex items-center gap-2 px-4 py-2 ${tema.colores.primario} text-white rounded-xl font-bold transition-all duration-300 hover:scale-105 ${tema.colores.sombra}`}
              >
                <RefreshCw
                  className={`w-4 h-4 ${loadingMetricas ? "animate-spin" : ""}`}
                />
                Actualizar
              </button>

              <button
                onClick={() => window.print()}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold ${tema.colores.secundario} ${tema.colores.texto} hover:scale-105 transition-all duration-300`}
              >
                <Printer className="w-4 h-4" />
                Imprimir
              </button>

              <button
                onClick={() =>
                  window.open(
                    `/api/tecnico/metricas/export?formato=pdf&id_tecnico=${usuario.tecnico?.id_tecnico}`,
                    "_blank"
                  )
                }
                className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold ${tema.colores.secundario} ${tema.colores.texto} hover:scale-105 transition-all duration-300`}
              >
                <Download className="w-4 h-4" />
                Exportar
              </button>
            </div>
          </div>

          <p className={`text-sm ${tema.colores.textoSecundario}`}>
            Monitorea tu desempeño con métricas avanzadas, comparativas de equipo y
            recomendaciones inteligentes basadas en IA.
          </p>
        </div>

        {loadingMetricas ? (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <SkeletonCard key={i} tema={tema} />
              ))}
            </div>
          </div>
        ) : (
          <>
            {/* Resumen General */}
            <div
              className={`rounded-2xl p-6 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} mb-8 animate-fadeIn`}
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-12 h-12 bg-gradient-to-br ${tema.colores.gradiente} rounded-xl flex items-center justify-center shadow-lg`}
                  >
                    <Trophy className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className={`text-xl font-black ${tema.colores.texto}`}>
                      Resumen de Rendimiento
                    </h3>
                    <p
                      className={`text-sm font-semibold ${tema.colores.textoSecundario}`}
                    >
                      Promedio general de cumplimiento de objetivos
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div
                    className={`text-6xl font-black mb-2 bg-gradient-to-r ${tema.colores.gradiente} bg-clip-text text-transparent`}
                  >
                    {promedioGeneral}%
                  </div>
                  <p className={`text-sm font-bold ${tema.colores.texto} mb-1`}>
                    Cumplimiento Promedio
                  </p>
                  <p className={`text-xs ${tema.colores.textoSecundario}`}>
                    Basado en {metricasDetalladas.length} métricas
                  </p>
                </div>

                <div className="text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <TrendingUp className="w-8 h-8 text-emerald-400" />
                    <span className="text-4xl font-black text-emerald-400">
                      {metricasDetalladas.filter((m) => m.tendencia === "up").length}
                    </span>
                  </div>
                  <p className={`text-sm font-bold ${tema.colores.texto} mb-1`}>
                    Métricas en Mejora
                  </p>
                  <p className={`text-xs ${tema.colores.textoSecundario}`}>
                    Tendencia positiva
                  </p>
                </div>

                <div className="text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Target className="w-8 h-8 text-purple-400" />
                    <span className="text-4xl font-black text-purple-400">
                      {
                        metricasDetalladas.filter(
                          (m) => m.porcentaje_cumplimiento >= 100
                        ).length
                      }
                    </span>
                  </div>
                  <p className={`text-sm font-bold ${tema.colores.texto} mb-1`}>
                    Objetivos Alcanzados
                  </p>
                  <p className={`text-xs ${tema.colores.textoSecundario}`}>
                    100% o más de cumplimiento
                  </p>
                </div>
              </div>
            </div>

            {/* Filtros de Categoría */}
            <div className="flex flex-wrap items-center gap-3 mb-6">
              <button
                onClick={() => setCategoriaFiltro(null)}
                className={`px-4 py-2 rounded-xl font-semibold text-sm transition-all duration-300 hover:scale-105 ${
                  categoriaFiltro === null
                    ? `bg-gradient-to-r ${tema.colores.gradiente} text-white shadow-lg`
                    : `${tema.colores.secundario} ${tema.colores.texto}`
                }`}
              >
                Todas las Categorías
              </button>
              {categorias.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategoriaFiltro(cat)}
                  className={`px-4 py-2 rounded-xl font-semibold text-sm transition-all duration-300 hover:scale-105 ${
                    categoriaFiltro === cat
                      ? `bg-gradient-to-r ${obtenerColorCategoria(cat)} text-white shadow-lg`
                      : `${tema.colores.secundario} ${tema.colores.texto}`
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

                {/* Métricas Detalladas */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {metricasFiltradas.map((metrica, idx) => {
                const Icono = metrica.icono;
                const IconoTendencia =
                  metrica.tendencia === "up"
                    ? TrendingUp
                    : metrica.tendencia === "down"
                    ? TrendingDown
                    : Activity;
                const colorTendencia =
                  metrica.tendencia === "up"
                    ? "text-emerald-400"
                    : metrica.tendencia === "down"
                    ? "text-red-400"
                    : "text-gray-400";

                return (
                  <div
                    key={metrica.id}
                    className={`rounded-2xl p-6 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} transition-all duration-300 hover:scale-105 hover:-translate-y-2 cursor-pointer group animate-slideUp`}
                    style={{ animationDelay: `${idx * 80}ms` }}
                    onClick={() =>
                      setMetricaExpandida(
                        metricaExpandida === metrica.id ? null : metrica.id
                      )
                    }
                  >
                    {/* Header */}
                    <div className="flex items-center justify-between mb-4">
                      <div
                        className={`w-14 h-14 bg-gradient-to-br ${metrica.color} rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}
                      >
                        <Icono className="w-7 h-7 text-white" />
                      </div>
                      <div className="flex items-center gap-2">
                        <IconoTendencia className={`w-5 h-5 ${colorTendencia}`} />
                        <span className={`text-sm font-bold ${colorTendencia}`}>
                          {metrica.porcentaje_cambio > 0 ? "+" : ""}
                          {metrica.porcentaje_cambio}%
                        </span>
                      </div>
                    </div>

                    {/* Categoría */}
                    <div className="flex items-center gap-2 mb-3">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r ${obtenerColorCategoria(
                          metrica.categoria
                        )} text-white`}
                      >
                        {metrica.categoria}
                      </span>
                      {metrica.porcentaje_cumplimiento >= 100 && (
                        <Award className="w-4 h-4 text-yellow-400" />
                      )}
                    </div>

                    {/* Nombre */}
                    <h4 className={`text-lg font-black mb-2 ${tema.colores.texto}`}>
                      {metrica.nombre}
                    </h4>

                    {/* Valor Actual */}
                    <div className="flex items-end gap-2 mb-4">
                      <span
                        className={`text-4xl font-black ${tema.colores.texto} group-hover:scale-110 transition-transform`}
                      >
                        {metrica.valor_actual}
                      </span>
                      <span className={`text-lg font-bold ${tema.colores.textoSecundario} mb-1`}>
                        {metrica.unidad}
                      </span>
                      <span className={`text-sm font-semibold ${tema.colores.textoSecundario} mb-1`}>
                        / {metrica.valor_objetivo}
                        {metrica.unidad}
                      </span>
                    </div>

                    {/* Barra de Progreso */}
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className={`text-xs font-bold ${tema.colores.textoSecundario}`}>
                          Cumplimiento
                        </span>
                        <span
                          className={`text-xs font-black ${
                            metrica.porcentaje_cumplimiento >= 100
                              ? "text-emerald-400"
                              : metrica.porcentaje_cumplimiento >= 80
                              ? "text-yellow-400"
                              : "text-red-400"
                          }`}
                        >
                          {metrica.porcentaje_cumplimiento}%
                        </span>
                      </div>
                      <div className="h-2 bg-gray-700/30 rounded-full overflow-hidden">
                        <div
                          className={`h-full bg-gradient-to-r ${metrica.color} rounded-full transition-all duration-1000 ease-out`}
                          style={{
                            width: `${Math.min(metrica.porcentaje_cumplimiento, 100)}%`,
                          }}
                        ></div>
                      </div>
                    </div>

                    {/* Descripción */}
                    <p className={`text-xs ${tema.colores.textoSecundario} mb-3`}>
                      {metrica.descripcion}
                    </p>

                    {/* Expandir/Contraer */}
                    <button
                      className={`w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg ${tema.colores.hover} transition-all duration-200 text-sm font-semibold ${tema.colores.texto}`}
                    >
                      {metricaExpandida === metrica.id ? (
                        <>
                          <Minimize2 className="w-4 h-4" />
                          Ver menos
                        </>
                      ) : (
                        <>
                          <Maximize2 className="w-4 h-4" />
                          Ver detalles
                        </>
                      )}
                    </button>

                    {/* Sección Expandida */}
                    {metricaExpandida === metrica.id && (
                      <div className="mt-4 pt-4 border-t border-gray-700/30 animate-slideDown">
                        {/* Gráfico Histórico */}
                        <div className="mb-4">
                          <p
                            className={`text-xs font-bold mb-3 ${tema.colores.texto} flex items-center gap-2`}
                          >
                            <LineChart className="w-4 h-4" />
                            Histórico (7 días)
                          </p>
                          <ResponsiveContainer width="100%" height={120}>
                            <AreaChart data={metrica.historico}>
                              <defs>
                                <linearGradient
                                  id={`gradient-${metrica.id}`}
                                  x1="0"
                                  y1="0"
                                  x2="0"
                                  y2="1"
                                >
                                  <stop
                                    offset="5%"
                                    stopColor={
                                      metrica.color.includes("blue")
                                        ? "#3b82f6"
                                        : metrica.color.includes("green")
                                        ? "#10b981"
                                        : metrica.color.includes("yellow")
                                        ? "#f59e0b"
                                        : metrica.color.includes("orange")
                                        ? "#f97316"
                                        : "#a855f7"
                                    }
                                    stopOpacity={0.8}
                                  />
                                  <stop
                                    offset="95%"
                                    stopColor={
                                      metrica.color.includes("blue")
                                        ? "#3b82f6"
                                        : metrica.color.includes("green")
                                        ? "#10b981"
                                        : metrica.color.includes("yellow")
                                        ? "#f59e0b"
                                        : metrica.color.includes("orange")
                                        ? "#f97316"
                                        : "#a855f7"
                                    }
                                    stopOpacity={0.1}
                                  />
                                </linearGradient>
                              </defs>
                              <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                              <XAxis
                                dataKey="fecha"
                                stroke={tema.colores.textoSecundario}
                                style={{ fontSize: "10px" }}
                              />
                              <YAxis
                                stroke={tema.colores.textoSecundario}
                                style={{ fontSize: "10px" }}
                              />
                              <Tooltip content={<CustomTooltip tema={tema} />} />
                              <Area
                                type="monotone"
                                dataKey="valor"
                                stroke={
                                  metrica.color.includes("blue")
                                    ? "#3b82f6"
                                    : metrica.color.includes("green")
                                    ? "#10b981"
                                    : metrica.color.includes("yellow")
                                    ? "#f59e0b"
                                    : metrica.color.includes("orange")
                                    ? "#f97316"
                                    : "#a855f7"
                                }
                                strokeWidth={2}
                                fillOpacity={1}
                                fill={`url(#gradient-${metrica.id})`}
                              />
                            </AreaChart>
                          </ResponsiveContainer>
                        </div>

                        {/* Rango Min/Max */}
                        <div className="grid grid-cols-2 gap-3 mb-4">
                          <div
                            className={`p-3 rounded-lg ${tema.colores.hover} border ${tema.colores.borde}`}
                          >
                            <p
                              className={`text-xs font-bold mb-1 ${tema.colores.textoSecundario}`}
                            >
                              Mínimo
                            </p>
                            <p className={`text-lg font-black ${tema.colores.texto}`}>
                              {metrica.valor_minimo}
                              {metrica.unidad}
                            </p>
                          </div>
                          <div
                            className={`p-3 rounded-lg ${tema.colores.hover} border ${tema.colores.borde}`}
                          >
                            <p
                              className={`text-xs font-bold mb-1 ${tema.colores.textoSecundario}`}
                            >
                              Máximo
                            </p>
                            <p className={`text-lg font-black ${tema.colores.texto}`}>
                              {metrica.valor_maximo}
                              {metrica.unidad}
                            </p>
                          </div>
                        </div>

                        {/* Recomendación */}
                        <div
                          className={`p-3 rounded-lg bg-gradient-to-r ${metrica.color} bg-opacity-10 border border-opacity-30`}
                        >
                          <div className="flex items-start gap-2">
                            <Lightbulb className="w-4 h-4 mt-0.5 flex-shrink-0 text-yellow-400" />
                            <div>
                              <p
                                className={`text-xs font-bold mb-1 ${tema.colores.texto}`}
                              >
                                Recomendación
                              </p>
                              <p className={`text-xs ${tema.colores.textoSecundario}`}>
                                {metrica.recomendacion}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Comparativa de Rendimiento */}
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
                      Comparativa de Rendimiento
                    </h3>
                    <p
                      className={`text-sm font-semibold ${tema.colores.textoSecundario}`}
                    >
                      Tu desempeño vs promedio del equipo
                    </p>
                  </div>
                </div>
              </div>

              <ResponsiveContainer width="100%" height={350}>
                <ComposedChart data={comparativaRendimiento}>
                  <defs>
                    <linearGradient id="colorMi" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0.1} />
                    </linearGradient>
                    <linearGradient id="colorEquipo" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.1} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                  <XAxis
                    dataKey="periodo"
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
                    dataKey="mi_rendimiento"
                    stroke="#6366f1"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorMi)"
                    name="Mi Rendimiento"
                  />
                  <Area
                    type="monotone"
                    dataKey="promedio_equipo"
                    stroke="#10b981"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorEquipo)"
                    name="Promedio Equipo"
                  />
                  <Line
                    type="monotone"
                    dataKey="mejor_tecnico"
                    stroke="#f59e0b"
                    strokeWidth={3}
                    strokeDasharray="5 5"
                    name="Mejor Técnico"
                    dot={{ fill: "#f59e0b", r: 5 }}
                  />
                </ComposedChart>
              </ResponsiveContainer>

              {/* Estadísticas de Comparativa */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-700/30">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <User className="w-5 h-5 text-indigo-400" />
                    <span className="text-3xl font-black text-indigo-400">
                      {comparativaRendimiento[comparativaRendimiento.length - 1]
                        ?.mi_rendimiento || 0}
                    </span>
                  </div>
                  <p className={`text-sm font-bold ${tema.colores.texto}`}>
                    Mi Rendimiento Actual
                  </p>
                  <p className={`text-xs ${tema.colores.textoSecundario}`}>
                    Último período registrado
                  </p>
                </div>

                <div className="text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Users className="w-5 h-5 text-emerald-400" />
                    <span className="text-3xl font-black text-emerald-400">
                      {comparativaRendimiento[comparativaRendimiento.length - 1]
                        ?.promedio_equipo || 0}
                    </span>
                  </div>
                  <p className={`text-sm font-bold ${tema.colores.texto}`}>
                    Promedio del Equipo
                  </p>
                  <p className={`text-xs ${tema.colores.textoSecundario}`}>
                    Todos los técnicos
                  </p>
                </div>

                <div className="text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Trophy className="w-5 h-5 text-amber-400" />
                    <span className="text-3xl font-black text-amber-400">
                      {comparativaRendimiento[comparativaRendimiento.length - 1]
                        ?.mejor_tecnico || 0}
                    </span>
                  </div>
                  <p className={`text-sm font-bold ${tema.colores.texto}`}>
                    Mejor Técnico
                  </p>
                  <p className={`text-xs ${tema.colores.textoSecundario}`}>
                    Referencia de excelencia
                  </p>
                </div>
              </div>
            </div>

            {/* Objetivos y Metas */}
            <div
              className={`rounded-2xl p-6 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} mb-8 animate-fadeIn`}
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg`}
                  >
                    <Target className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className={`text-xl font-black ${tema.colores.texto}`}>
                      Objetivos y Metas
                    </h3>
                    <p
                      className={`text-sm font-semibold ${tema.colores.textoSecundario}`}
                    >
                      Seguimiento de tus objetivos personales
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {objetivosMetas.map((objetivo, idx) => {
                  const Icono = objetivo.icono;
                  const porcentajeProgreso = Math.min(
                    (objetivo.valor_actual / objetivo.valor_objetivo) * 100,
                    100
                  );

                  return (
                    <div
                      key={objetivo.id}
                      className={`p-6 rounded-xl ${tema.colores.hover} border ${tema.colores.borde} transition-all duration-300 hover:scale-105 animate-slideUp`}
                      style={{ animationDelay: `${idx * 100}ms` }}
                    >
                      {/* Header */}
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
                            objetivo.estado === "completado"
                              ? "bg-green-500/20 text-green-400 border border-green-500/30"
                              : objetivo.estado === "en_progreso"
                              ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                              : "bg-red-500/20 text-red-400 border border-red-500/30"
                          }`}
                        >
                          {objetivo.estado === "completado"
                            ? "Completado"
                            : objetivo.estado === "en_progreso"
                            ? "En Progreso"
                            : "Atrasado"}
                        </span>
                      </div>

                      {/* Progreso */}
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

                      {/* Valores */}
                      <div className="grid grid-cols-2 gap-3 mb-4">
                        <div>
                          <p
                            className={`text-xs font-bold mb-1 ${tema.colores.textoSecundario}`}
                          >
                            Actual
                          </p>
                          <p className={`text-2xl font-black ${tema.colores.texto}`}>
                            {objetivo.valor_actual}
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
                          </p>
                        </div>
                      </div>

                      {/* Fechas */}
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-gray-500" />
                          <span className={tema.colores.textoSecundario}>
                            {new Date(objetivo.fecha_inicio).toLocaleDateString("es-CL")}
                          </span>
                        </div>
                        <ChevronRight className="w-3 h-3 text-gray-500" />
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-gray-500" />
                          <span className={tema.colores.textoSecundario}>
                            {new Date(objetivo.fecha_fin).toLocaleDateString("es-CL")}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Insights Inteligentes */}
            <div
              className={`rounded-2xl p-6 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} mb-8 animate-fadeIn`}
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center shadow-lg`}
                  >
                    <Brain className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className={`text-xl font-black ${tema.colores.texto}`}>
                      Insights Inteligentes
                    </h3>
                    <p
                      className={`text-sm font-semibold ${tema.colores.textoSecundario}`}
                    >
                      Recomendaciones basadas en IA y análisis de datos
                    </p>
                  </div>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-orange-500 to-red-500 text-white flex items-center gap-1`}
                >
                  <Sparkles className="w-3 h-3" />
                  AI Powered
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {insightsInteligentes.map((insight, idx) => {
                  const Icono = insight.icono;
                  const colorBorde =
                    insight.tipo === "exito"
                      ? "border-green-500/30"
                      : insight.tipo === "advertencia"
                      ? "border-yellow-500/30"
                      : insight.tipo === "oportunidad"
                      ? "border-blue-500/30"
                      : "border-red-500/30";

                  return (
                    <div
                      key={insight.id}
                      className={`p-5 rounded-xl ${tema.colores.hover} border-2 ${colorBorde} transition-all duration-300 hover:scale-105 animate-slideUp`}
                      style={{ animationDelay: `${idx * 100}ms` }}
                    >
                      {/* Header */}
                      <div className="flex items-start gap-3 mb-3">
                        <div
                          className={`w-10 h-10 bg-gradient-to-br ${obtenerColorInsight(
                            insight.tipo
                          )} rounded-lg flex items-center justify-center shadow-lg flex-shrink-0`}
                        >
                          <Icono className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4
                              className={`text-base font-black ${tema.colores.texto}`}
                            >
                              {insight.titulo}
                            </h4>
                            <span
                              className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                                insight.impacto === "alto"
                                  ? "bg-red-500/20 text-red-400"
                                  : insight.impacto === "medio"
                                  ? "bg-yellow-500/20 text-yellow-400"
                                  : "bg-blue-500/20 text-blue-400"
                              }`}
                            >
                              {insight.impacto === "alto"
                                ? "Alto Impacto"
                                : insight.impacto === "medio"
                                ? "Medio Impacto"
                                : "Bajo Impacto"}
                            </span>
                          </div>
                          <p className={`text-sm ${tema.colores.textoSecundario} mb-3`}>
                            {insight.descripcion}
                          </p>
                        </div>
                      </div>

                      {/* Acción Sugerida */}
                      <div
                        className={`p-3 rounded-lg bg-gradient-to-r ${obtenerColorInsight(
                          insight.tipo
                        )} bg-opacity-10 border border-opacity-30`}
                      >
                        <div className="flex items-start gap-2">
                          <Rocket className="w-4 h-4 mt-0.5 flex-shrink-0 text-indigo-400" />
                          <div>
                            <p
                              className={`text-xs font-bold mb-1 ${tema.colores.texto}`}
                            >
                              Acción Sugerida
                            </p>
                            <p className={`text-xs ${tema.colores.textoSecundario}`}>
                              {insight.accion_sugerida}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Sección de Exportación */}
            <div
              className={`rounded-2xl p-6 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} animate-fadeIn`}
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
                      Exportar Métricas
                    </h3>
                    <p
                      className={`text-sm font-semibold ${tema.colores.textoSecundario}`}
                    >
                      Descarga tus métricas en diferentes formatos
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button
                  onClick={() =>
                    window.open(
                      `/api/tecnico/metricas/export?formato=pdf&id_tecnico=${usuario.tecnico?.id_tecnico}`,
                      "_blank"
                    )
                  }
                  className={`flex items-center gap-3 p-4 rounded-xl ${tema.colores.hover} border ${tema.colores.borde} transition-all duration-300 hover:scale-105 hover:shadow-lg group`}
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-pink-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <FileText className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-left flex-1">
                    <p className={`text-sm font-bold ${tema.colores.texto}`}>
                      Reporte PDF
                    </p>
                    <p className={`text-xs ${tema.colores.textoSecundario}`}>
                      Informe completo
                    </p>
                  </div>
                  <ArrowUpRight className="w-5 h-5 text-gray-500 group-hover:text-pink-400 transition-colors" />
                </button>

                <button
                  onClick={() =>
                    window.open(
                      `/api/tecnico/metricas/export?formato=excel&id_tecnico=${usuario.tecnico?.id_tecnico}`,
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
                      Con gráficos
                    </p>
                  </div>
                  <ArrowUpRight className="w-5 h-5 text-gray-500 group-hover:text-emerald-400 transition-colors" />
                </button>

                <button
                  onClick={() =>
                    window.open(
                      `/api/tecnico/metricas/export?formato=json&id_tecnico=${usuario.tecnico?.id_tecnico}`,
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
                  <BrainCircuit className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className={`text-sm font-black ${tema.colores.texto}`}>
                    AnyssaMed Metrics Pro
                  </p>
                  <p className={`text-xs ${tema.colores.textoSecundario}`}>
                    Sistema de Métricas Avanzadas con IA
                  </p>
                </div>
              </div>
              <p
                className={`text-xs font-semibold ${tema.colores.textoSecundario}`}
              >
                © 2025 AnyssaMed. Todos los derechos reservados. v2.1.0
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
                ADVANCED AI
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

      {/* ESTILOS GLOBALES */}
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
          background: linear-gradient(180deg, rgba(99, 102, 241, 0.8), rgba(168, 85, 247, 0.8));
          border-radius: 10px;
          transition: all 0.3s ease;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(180deg, rgba(99, 102, 241, 1), rgba(168, 85, 247, 1));
          box-shadow: 0 0 10px rgba(99, 102, 241, 0.5);
        }

        /* Animaciones */
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

        /* Efectos de Hover */
        .hover-lift {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .hover-lift:hover {
          transform: translateY(-8px) scale(1.02);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
        }

        /* Selection */
        ::selection {
          background: rgba(99, 102, 241, 0.3);
          color: white;
        }

        /* Print */
        @media print {
          .no-print {
            display: none !important;
          }
          body {
            background: white !important;
            color: black !important;
          }
        }

        /* Reduced Motion */
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
