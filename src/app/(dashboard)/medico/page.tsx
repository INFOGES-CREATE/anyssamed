//frontend\src\app\(dashboard)\medico\page.tsx

"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import {
  Activity,
  AlertCircle,
  AlertTriangle,
  Award,
  BarChart3,
  Bell,
  BellOff,
  Briefcase,
  Calendar,
  Calculator,
  CalendarCheck,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Clock,
  ClipboardCheck,
  ClipboardList,
  Cloud,
  CreditCard,
  Database,
  DollarSign,
  Download,
  Eye,
  EyeOff,
  FileSpreadsheet,
  FileText,
  Filter,
  Flame,
  Gift,
  Globe,
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
  Moon,
  MoreVertical,
  Paperclip,
  Percent,
  Phone,
  PhoneCall,
  PieChart,
  Pill,
  Plus,
  Printer,
  RefreshCw,
  Search,
  Send,
  Settings,
  Share2,
  Shield,
  ShieldCheck,
  Star,
  Stethoscope,
  Sun,
  Target,
  TrendingDown,
  TrendingUp,
  Upload,
  User,
  UserCheck,
  Users,
  Video,
  Wifi,
  WifiOff,
  X,
  Zap,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  BrainCircuit,
  Microscope,
  TestTube,
  Syringe,
  Ambulance,
  Building2,
  GraduationCap,
  Handshake,
  TrendingUpIcon,
  Rocket,
  BookOpen,
  Clipboard,
  FileCheck,
  Headphones,
  Info,
  Maximize2,
  Minimize2,
  Pause,
  Play,
  RotateCcw,
  Save,
  Smartphone,
  Volume2,
  Wifi as WifiIcon,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
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
  Scatter,
  ScatterChart,
  ZAxis,
} from "recharts";

// ========================================
// TIPOS DE DATOS
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
    chartLine: string;
    chartFill: string;
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
  };
}

interface EstadisticasResumen {
  citas_hoy: number;
  citas_pendientes: number;
  citas_completadas_hoy: number;
  citas_canceladas_hoy: number;
  pacientes_nuevos_mes: number;
  total_pacientes: number;
  consultas_mes: number;
  consultas_ano: number;
  recetas_emitidas_mes: number;
  ordenes_examen_mes: number;
  interconsultas_pendientes: number;
  mensajes_sin_leer: number;
  calificacion_promedio: number;
  total_resenas: number;
  ingresos_mes: number;
  telemedicina_activas: number;
  certificados_emitidos: number;
  procedimientos_mes: number;
}

interface CitaProxima {
  id_cita: number;
  fecha_hora: string;
  duracion_minutos: number;
  tipo_cita: string;
  modalidad: "presencial" | "telemedicina";
  estado: string;
  paciente: {
    id_paciente: number;
    nombre_completo: string;
    edad: number;
    foto_url: string | null;
    telefono: string | null;
    grupo_sanguineo: string;
  };
  motivo: string | null;
  notas: string | null;
  sala: string | null;
}

interface AlertaUrgente {
  id_alerta: number;
  tipo: "critica" | "alta" | "media" | "baja";
  titulo: string;
  descripcion: string;
  fecha_hora: string;
  leida: boolean;
  paciente?: {
    id_paciente: number;
    nombre_completo: string;
  };
  accion_requerida: string | null;
  url_accion?: string;
}

interface PacienteReciente {
  id_paciente: number;
  nombre_completo: string;
  edad: number;
  genero: string;
  foto_url: string | null;
  ultima_consulta: string;
  diagnostico_principal: string | null;
  estado_salud: "estable" | "atencion" | "critico";
  proxima_cita: string | null;
  alergias_criticas: number;
  condiciones_cronicas: number;
  grupo_sanguineo: string;
}

interface MetricaRendimiento {
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

interface EventoCalendario {
  id: number;
  titulo: string;
  tipo: "cita" | "cirugia" | "reunion" | "capacitacion" | "otro";
  fecha_hora_inicio: string;
  fecha_hora_fin: string;
  paciente?: string;
  ubicacion: string;
  estado: string;
  color: string;
}

interface DatoGraficoConsultas {
  periodo: string;
  presencial: number;
  telemedicina: number;
  total: number;
  fecha: string;
}

interface DatoGraficoEspecialidades {
  nombre: string;
  valor: number;
  porcentaje: number;
  color: string;
  total_consultas: number;
}

interface DatoGraficoIngresos {
  mes: string;
  ingresos: number;
  gastos: number;
  utilidad: number;
  fecha: string;
}

interface DatoGraficoSatisfaccion {
  categoria: string;
  valor: number;
  total_evaluaciones: number;
  promedio_sector: number;
}

interface DatoGraficoPacientes {
  mes: string;
  nuevos: number;
  recurrentes: number;
  total: number;
  fecha: string;
}

interface DatoGraficoHorario {
  hora: string;
  consultas: number;
  duracion_promedio: number;
}

interface ActividadReciente {
  id: number;
  tipo: string;
  descripcion: string;
  fecha_hora: string;
  usuario: string;
  icono: any;
  color: string;
  detalles?: any;
}

interface MenuItem {
  titulo: string;
  icono: any;
  url: string;
  badge?: number;
  submenu?: MenuItem[];
  activo?: boolean;
}

interface DatosGraficos {
  consultas: DatoGraficoConsultas[];
  especialidades: DatoGraficoEspecialidades[];
  ingresos: DatoGraficoIngresos[];
  satisfaccion: DatoGraficoSatisfaccion[];
  pacientes: DatoGraficoPacientes[];
  horarios: DatoGraficoHorario[];
}

// ========================================
// CONFIGURACIONES DE TEMAS PREMIUM
// ========================================

const TEMAS: Record<TemaColor, ConfiguracionTema> = {
  light: {
    nombre: "Claro Profesional",
    icono: Sun,
    colores: {
      fondo: "from-white via-slate-50 to-blue-50",
      fondoSecundario: "bg-white",
      texto: "text-gray-900",
      textoSecundario: "text-gray-600",
      primario: "bg-indigo-600 hover:bg-indigo-700",
      secundario: "bg-gray-100 hover:bg-gray-200",
      acento: "text-indigo-600",
      borde: "border-gray-200",
      sombra: "shadow-xl shadow-indigo-100/50",
      gradiente: "from-indigo-500 via-purple-500 to-pink-500",
      sidebar: "bg-white/98 backdrop-blur-xl border-gray-200",
      header: "bg-white/95 backdrop-blur-xl border-gray-200",
      card: "bg-white border-gray-200 hover:border-indigo-300",
      hover: "hover:bg-gray-50",
      chartLine: "#6366f1",
      chartFill: "rgba(99, 102, 241, 0.1)",
    },
  },
  dark: {
    nombre: "Oscuro Premium",
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
      sidebar: "bg-gray-900/98 backdrop-blur-xl border-gray-800",
      header: "bg-gray-900/95 backdrop-blur-xl border-gray-800",
      card: "bg-gray-800/50 border-gray-700 hover:border-indigo-500/50",
      hover: "hover:bg-gray-800",
      chartLine: "#818cf8",
      chartFill: "rgba(129, 140, 248, 0.1)",
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
      sidebar: "bg-blue-900/98 backdrop-blur-xl border-cyan-800",
      header: "bg-blue-900/95 backdrop-blur-xl border-cyan-800",
      card: "bg-blue-800/50 border-cyan-700 hover:border-cyan-500/50",
      hover: "hover:bg-blue-800",
      chartLine: "#06b6d4",
      chartFill: "rgba(6, 182, 212, 0.1)",
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
      sidebar: "bg-purple-900/98 backdrop-blur-xl border-purple-800",
      header: "bg-purple-900/95 backdrop-blur-xl border-purple-800",
      card: "bg-purple-800/50 border-purple-700 hover:border-fuchsia-500/50",
      hover: "hover:bg-purple-800",
      chartLine: "#c026d3",
      chartFill: "rgba(192, 38, 211, 0.1)",
    },
  },
  green: {
    nombre: "Verde Médico",
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
      sidebar: "bg-emerald-900/98 backdrop-blur-xl border-emerald-800",
      header: "bg-emerald-900/95 backdrop-blur-xl border-emerald-800",
      card: "bg-emerald-800/50 border-emerald-700 hover:border-emerald-500/50",
      hover: "hover:bg-emerald-800",
      chartLine: "#10b981",
      chartFill: "rgba(16, 185, 129, 0.1)",
    },
  },
};

// ========================================
// COMPONENTE PRINCIPAL
// ========================================

export default function DashboardMedicoPremiumPage() {
  // ========================================
  // ESTADOS - SESIÓN Y USUARIO
  // ========================================

  const [usuario, setUsuario] = useState<UsuarioSesion | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ========================================
  // ESTADOS - DATOS DINÁMICOS
  // ========================================

  const [estadisticas, setEstadisticas] = useState<EstadisticasResumen | null>(null);
  const [citasProximas, setCitasProximas] = useState<CitaProxima[]>([]);
  const [alertasUrgentes, setAlertasUrgentes] = useState<AlertaUrgente[]>([]);
  const [pacientesRecientes, setPacientesRecientes] = useState<PacienteReciente[]>([]);
  const [metricasRendimiento, setMetricasRendimiento] = useState<MetricaRendimiento[]>([]);
  const [eventosCalendario, setEventosCalendario] = useState<EventoCalendario[]>([]);
  const [actividadesRecientes, setActividadesRecientes] = useState<ActividadReciente[]>([]);
  const [datosGraficos, setDatosGraficos] = useState<DatosGraficos>({
    consultas: [],
    especialidades: [],
    ingresos: [],
    satisfaccion: [],
    pacientes: [],
    horarios: [],
  });

  // ========================================
  // ESTADOS - UI Y PREFERENCIAS
  // ========================================

  const [temaActual, setTemaActual] = useState<TemaColor>("light");
  const [sidebarAbierto, setSidebarAbierto] = useState(true);
  const [sidebarMovilAbierto, setSidebarMovilAbierto] = useState(false);
  const [notificacionesAbiertas, setNotificacionesAbiertas] = useState(false);
  const [perfilAbierto, setPerfilAbierto] = useState(false);
  const [busqueda, setBusqueda] = useState("");
  const [vistaCalendario, setVistaCalendario] = useState<"dia" | "semana" | "mes">("dia");
  const [fechaSeleccionada, setFechaSeleccionada] = useState(new Date());
  const [seccionActiva, setSeccionActiva] = useState("dashboard");
  const [menuExpandido, setMenuExpandido] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [intervaloRefresh, setIntervaloRefresh] = useState(5); // minutos
  const [ultimaActualizacion, setUltimaActualizacion] = useState<Date>(new Date());

  // ========================================
  // TEMA ACTUAL MEMORIZADO
  // ========================================

  const tema = useMemo(() => TEMAS[temaActual], [temaActual]);

  // ========================================
  // MENU DE NAVEGACIÓN DINÁMICO
  // ========================================

  const menuItems: MenuItem[] = useMemo(
    () => [
      {
        titulo: "Dashboard",
        icono: Home,
        url: "/medico",
        activo: seccionActiva === "dashboard",
      },
      {
        titulo: "Agenda",
        icono: Calendar,
        url: "/medico/agenda",
        badge: estadisticas?.citas_hoy || 0,
      },
      {
        titulo: "Pacientes",
        icono: Users,
        url: "/medico/pacientes",
        badge: estadisticas?.pacientes_nuevos_mes || 0,
        submenu: [
          { titulo: "Todos los Pacientes", icono: Users, url: "/medico/pacientes" },
          { titulo: "Nuevo Paciente", icono: Plus, url: "/medico/pacientes/nuevo" },
          { titulo: "Búsqueda Avanzada", icono: Search, url: "/medico/pacientes/buscar" },
          {
            titulo: "Pacientes Críticos",
            icono: AlertTriangle,
            url: "/medico/pacientes/criticos",
          },
        ],
      },
      {
        titulo: "Consultas",
        icono: ClipboardCheck,
        url: "/medico/consultas",
        submenu: [
          { titulo: "Nueva Consulta", icono: Plus, url: "/medico/consultas/nueva" },
          { titulo: "Historial", icono: ClipboardList, url: "/medico/consultas/historial" },
          { titulo: "Seguimientos", icono: CheckCircle2, url: "/medico/consultas/seguimientos" },
        ],
      },
      {
        titulo: "Recetas",
        icono: Pill,
        url: "/medico/recetas",
        badge: estadisticas?.recetas_emitidas_mes || 0,
        submenu: [
          { titulo: "Nueva Receta", icono: Plus, url: "/medico/recetas/nueva" },
          { titulo: "Mis Recetas", icono: FileText, url: "/medico/recetas" },
          { titulo: "Vademécum", icono: Database, url: "/medico/vademecum" },
        ],
      },
      {
        titulo: "Exámenes",
        icono: TestTube,
        url: "/medico/examenes",
        submenu: [
          { titulo: "Nueva Orden", icono: Plus, url: "/medico/examenes/orden" },
          { titulo: "Resultados Pendientes", icono: Clock, url: "/medico/examenes/pendientes" },
          { titulo: "Historial", icono: FileSpreadsheet, url: "/medico/examenes/historial" },
        ],
      },
      {
        titulo: "Certificados",
        icono: FileText,
        url: "/medico/certificados",
        submenu: [
          { titulo: "Nuevo Certificado", icono: Plus, url: "/medico/certificados/nuevo" },
          { titulo: "Licencias Médicas", icono: FileText, url: "/medico/certificados/licencias" },
          { titulo: "Certificados GES", icono: ShieldCheck, url: "/medico/certificados/ges" },
        ],
      },
      {
        titulo: "Telemedicina",
        icono: Video,
        url: "/medico/telemedicina",
        badge: estadisticas?.telemedicina_activas || 0,
        submenu: [
          { titulo: "Sala de Espera", icono: Clock, url: "/medico/telemedicina/espera" },
          { titulo: "Historial", icono: Video, url: "/medico/telemedicina/historial" },
          { titulo: "Configuración", icono: Settings, url: "/medico/telemedicina/config" },
        ],
      },
      {
        titulo: "Interconsultas",
        icono: Handshake,
        url: "/medico/interconsultas",
        badge: estadisticas?.interconsultas_pendientes || 0,
        submenu: [
          { titulo: "Nueva Interconsulta", icono: Plus, url: "/medico/interconsultas/nueva" },
          { titulo: "Recibidas", icono: Download, url: "/medico/interconsultas/recibidas" },
          { titulo: "Enviadas", icono: Upload, url: "/medico/interconsultas/enviadas" },
        ],
      },
      {
        titulo: "Mensajes",
        icono: MessageSquare,
        url: "/medico/mensajes",
        badge: estadisticas?.mensajes_sin_leer || 0,
      },
      {
        titulo: "Biblioteca",
        icono: GraduationCap,
        url: "/medico/biblioteca",
        submenu: [
          { titulo: "Recursos Médicos", icono: FileText, url: "/medico/biblioteca/recursos" },
          { titulo: "Calculadoras", icono: Calculator, url: "/medico/biblioteca/calculadoras" },
          { titulo: "Protocolos", icono: ClipboardList, url: "/medico/biblioteca/protocolos" },
          { titulo: "Guías Clínicas", icono: GraduationCap, url: "/medico/biblioteca/guias" },
        ],
      },
      {
        titulo: "Estadísticas",
        icono: BarChart3,
        url: "/medico/estadisticas",
        submenu: [
          { titulo: "Mis Métricas", icono: TrendingUp, url: "/medico/estadisticas/metricas" },
          { titulo: "Rendimiento", icono: Target, url: "/medico/estadisticas/rendimiento" },
          { titulo: "Satisfacción", icono: Star, url: "/medico/estadisticas/satisfaccion" },
          { titulo: "Financiero", icono: DollarSign, url: "/medico/estadisticas/financiero" },
        ],
      },
      {
        titulo: "Mi Perfil",
        icono: User,
        url: "/medico/perfil",
        submenu: [
          { titulo: "Información Personal", icono: User, url: "/medico/perfil" },
          { titulo: "Especialidades", icono: Award, url: "/medico/perfil/especialidades" },
          { titulo: "Credenciales", icono: ShieldCheck, url: "/medico/perfil/credenciales" },
          { titulo: "Disponibilidad", icono: Calendar, url: "/medico/perfil/disponibilidad" },
        ],
      },
      {
        titulo: "Configuración",
        icono: Settings,
        url: "/medico/configuracion",
        submenu: [
          { titulo: "Preferencias", icono: Settings, url: "/medico/configuracion/preferencias" },
          { titulo: "Notificaciones", icono: Bell, url: "/medico/configuracion/notificaciones" },
          { titulo: "Seguridad", icono: Shield, url: "/medico/configuracion/seguridad" },
          { titulo: "Temas", icono: Sparkles, url: "/medico/configuracion/temas" },
        ],
      },
    ],
    [estadisticas, seccionActiva]
  );

  // ========================================
  // EFECTOS - INICIALIZACIÓN Y CARGA
  // ========================================

  useEffect(() => {
    inicializarDashboard();
  }, []);

  useEffect(() => {
    if (usuario?.medico) {
      cargarDatosDashboard();
    }
  }, [usuario]);

  useEffect(() => {
    // Auto-refresh de datos
    if (autoRefresh && usuario?.medico) {
      const interval = setInterval(() => {
        cargarDatosDashboard(true); // true = silencioso
      }, intervaloRefresh * 60 * 1000);

      return () => clearInterval(interval);
    }
  }, [autoRefresh, intervaloRefresh, usuario]);

  useEffect(() => {
    // Aplicar tema al body
    document.body.className = `bg-gradient-to-br ${tema.colores.fondo} min-h-screen transition-all duration-500`;
  }, [tema]);

  useEffect(() => {
    // Cargar preferencia de tema desde localStorage y API
    const cargarPreferenciaTema = async () => {
      try {
        // Primero intentar desde localStorage
        const temaLocal = localStorage.getItem("tema_medico");
        if (temaLocal && temaLocal in TEMAS) {
          setTemaActual(temaLocal as TemaColor);
        }

        // Luego cargar desde API
        const res = await fetch("/api/users/preferencias/tema", {
          method: "GET",
          credentials: "include",
        });

        if (res.ok) {
          const data = await res.json();
          if (data.success && data.tema_color && data.tema_color in TEMAS) {
            setTemaActual(data.tema_color as TemaColor);
            localStorage.setItem("tema_medico", data.tema_color);
          }
        }
      } catch (e) {
        console.error("No se pudo cargar la preferencia de tema:", e);
      }
    };

    cargarPreferenciaTema();
  }, []);

  // ========================================
  // FUNCIONES - INICIALIZACIÓN
  // ========================================

  const inicializarDashboard = async () => {
    try {
      setLoading(true);
      setError(null);

      await cargarDatosUsuario();
    } catch (error) {
      console.error("Error al inicializar dashboard:", error);
      setError("Error al cargar el dashboard. Por favor, intenta nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  const cargarDatosUsuario = async () => {
    try {
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
        // Validar roles
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

        const tieneRolMedico = rolesUsuario.some((rol) => rol.includes("MEDICO"));

        if (!tieneRolMedico) {
          alert(
            `⚠️ Acceso Denegado\n\nEste panel es exclusivo para médicos.\nTus roles actuales: ${rolesUsuario.join(", ")}`
          );
          window.location.href = "/";
          return;
        }

        if (!result.usuario.medico) {
          alert(
            "⚠️ Registro Médico No Encontrado\n\nTu usuario tiene rol de MÉDICO pero no está vinculado a un registro médico.\nContacta al administrador del sistema."
          );
          window.location.href = "/";
          return;
        }

        setUsuario(result.usuario);
      } else {
        window.location.href = "/login";
      }
    } catch (error) {
      console.error("Error al cargar usuario:", error);
      alert("❌ Error al verificar sesión. Serás redirigido al login.");
      window.location.href = "/login";
    }
  };

  // ========================================
  // FUNCIONES - CARGA DE DATOS DINÁMICOS
  // ========================================

  const cargarDatosDashboard = async (silencioso: boolean = false) => {
    if (!usuario?.medico?.id_medico) return;

    try {
      if (!silencioso) {
        setLoadingData(true);
      }

      const [resEstadisticas, resGraficos, resCitas, resAlertas, resPacientes, resMetricas, resActividades] =
        await Promise.all([
          fetch(`/api/medico/dashboard/estadisticas?id_medico=${usuario.medico.id_medico}`, {
            credentials: "include",
          }),
          fetch(`/api/medico/dashboard/graficos?id_medico=${usuario.medico.id_medico}`, {
            credentials: "include",
          }),
          fetch(`/api/medico/dashboard/citas?id_medico=${usuario.medico.id_medico}`, {
            credentials: "include",
          }),
          fetch(`/api/medico/dashboard/alertas?id_medico=${usuario.medico.id_medico}`, {
            credentials: "include",
          }),
          fetch(`/api/medico/dashboard/pacientes?id_medico=${usuario.medico.id_medico}`, {
            credentials: "include",
          }),
          fetch(`/api/medico/dashboard/metricas?id_medico=${usuario.medico.id_medico}`, {
            credentials: "include",
          }),
          fetch(`/api/medico/dashboard/actividades?id_medico=${usuario.medico.id_medico}`, {
            credentials: "include",
          }),
        ]);

      // Procesar estadísticas
      if (resEstadisticas.ok) {
        const dataEstadisticas = await resEstadisticas.json();
        if (dataEstadisticas.success) {
          setEstadisticas(dataEstadisticas.data || null);
        }
      }

      // Procesar gráficos
      if (resGraficos.ok) {
        const dataGraficos = await resGraficos.json();
        if (dataGraficos.success) {
          setDatosGraficos({
            consultas: dataGraficos.data?.consultas || [],
            especialidades: dataGraficos.data?.especialidades || [],
            ingresos: dataGraficos.data?.ingresos || [],
            satisfaccion: dataGraficos.data?.satisfaccion || [],
            pacientes: dataGraficos.data?.pacientes || [],
            horarios: dataGraficos.data?.horarios || [],
          });
        }
      }

      // Procesar citas
      if (resCitas.ok) {
        const dataCitas = await resCitas.json();
        if (dataCitas.success) {
          setCitasProximas(dataCitas.data || []);
        }
      }

      // Procesar alertas
      if (resAlertas.ok) {
        const dataAlertas = await resAlertas.json();
        if (dataAlertas.success) {
          setAlertasUrgentes(dataAlertas.data || []);
        }
      }

      // Procesar pacientes
      if (resPacientes.ok) {
        const dataPacientes = await resPacientes.json();
        if (dataPacientes.success) {
          setPacientesRecientes(dataPacientes.data || []);
        }
      }

      // Procesar métricas
      if (resMetricas.ok) {
        const dataMetricas = await resMetricas.json();
        if (dataMetricas.success) {
          setMetricasRendimiento(dataMetricas.data || []);
        }
      }

      // Procesar actividades
      if (resActividades.ok) {
        const dataActividades = await resActividades.json();
        if (dataActividades.success) {
          setActividadesRecientes(dataActividades.data || []);
        }
      }

      setUltimaActualizacion(new Date());
      setError(null);
    } catch (err) {
      console.error("Error al cargar dashboard:", err);
      if (!silencioso) {
        setError("Error al cargar algunos datos del dashboard");
      }
    } finally {
      if (!silencioso) {
        setLoadingData(false);
      }
    }
  };

  // ========================================
  // FUNCIONES - ACCIONES
  // ========================================

  const marcarAlertaLeida = async (idAlerta: number) => {
    try {
      const response = await fetch(`/api/medico/alertas/${idAlerta}/leer`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      if (response.ok) {
        setAlertasUrgentes((prev) =>
          prev.map((alerta) =>
            alerta.id_alerta === idAlerta ? { ...alerta, leida: true } : alerta
          )
        );
      }
    } catch (error) {
      console.error("Error al marcar alerta como leída:", error);
    }
  };

  const iniciarTelemedicina = async (idCita: number) => {
    try {
      const response = await fetch(`/api/medico/telemedicina/iniciar/${idCita}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      const result = await response.json();

      if (result.success && result.url_sala) {
        window.open(result.url_sala, "_blank");
      } else {
        alert("❌ Error al iniciar sesión de telemedicina");
      }
    } catch (error) {
      console.error("Error al iniciar telemedicina:", error);
      alert("❌ Error al iniciar telemedicina");
    }
  };

  const cerrarSesion = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });

      localStorage.removeItem("tema_medico");
      window.location.href = "/login";
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  const cambiarTema = async (nuevoTema: TemaColor) => {
    // Cambiar inmediatamente en UI
    setTemaActual(nuevoTema);
    localStorage.setItem("tema_medico", nuevoTema);

    // Persistir en BD
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

  // ========================================
  // FUNCIONES AUXILIARES
  // ========================================

  const formatearFecha = (fecha: string) => {
    const date = new Date(fecha);
    return new Intl.DateTimeFormat("es-CL", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  const formatearHora = (fecha: string) => {
    const date = new Date(fecha);
    return new Intl.DateTimeFormat("es-CL", {
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  const formatearFechaRelativa = (fecha: string) => {
    const date = new Date(fecha);
    const ahora = new Date();
    const diferencia = ahora.getTime() - date.getTime();
    const minutos = Math.floor(diferencia / 60000);
    const horas = Math.floor(diferencia / 3600000);
    const dias = Math.floor(diferencia / 86400000);

    if (minutos < 1) return "Ahora";
    if (minutos < 60) return `Hace ${minutos} min`;
    if (horas < 24) return `Hace ${horas}h`;
    if (dias < 7) return `Hace ${dias}d`;
    return formatearFecha(fecha);
  };

  const obtenerColorEstado = (estado: string) => {
    const isDark = ["dark", "blue", "purple", "green"].includes(temaActual);
    const colores: { [key: string]: string } = {
      confirmada: isDark
        ? "bg-green-500/20 text-green-400 border-green-500/30"
        : "bg-green-100 text-green-800 border-green-200",
      pendiente: isDark
        ? "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
        : "bg-yellow-100 text-yellow-800 border-yellow-200",
      cancelada: isDark
        ? "bg-red-500/20 text-red-400 border-red-500/30"
        : "bg-red-100 text-red-800 border-red-200",
      completada: isDark
        ? "bg-blue-500/20 text-blue-400 border-blue-500/30"
        : "bg-blue-100 text-blue-800 border-blue-200",
    };

    return (
      colores[estado.toLowerCase()] ||
      (isDark
        ? "bg-gray-500/20 text-gray-400 border-gray-500/30"
        : "bg-gray-100 text-gray-800 border-gray-200")
    );
  };

  const obtenerColorSaludPaciente = (estado: string) => {
    const isDark = ["dark", "blue", "purple", "green"].includes(temaActual);
    const colores: { [key: string]: string } = {
      estable: isDark ? "bg-green-500/20 text-green-400" : "bg-green-100 text-green-700",
      atencion: isDark ? "bg-yellow-500/20 text-yellow-400" : "bg-yellow-100 text-yellow-700",
      critico: isDark ? "bg-red-500/20 text-red-400" : "bg-red-100 text-red-700",
    };

    return colores[estado] || colores.estable;
  };

  const obtenerIconoTendencia = (tendencia: string) => {
    if (tendencia === "up") return <ArrowUpRight className="w-4 h-4 text-green-500" />;
    if (tendencia === "down") return <ArrowDownRight className="w-4 h-4 text-red-500" />;
    return <Activity className="w-4 h-4 text-gray-500" />;
  };

  const obtenerSaludo = () => {
    const hora = new Date().getHours();
    if (hora < 12) return "Buenos días";
    if (hora < 19) return "Buenas tardes";
    return "Buenas noches";
  };

  const formatearNumero = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const formatearMoneda = (valor: number): string => {
    return new Intl.NumberFormat("es-CL", {
      style: "currency",
      currency: "CLP",
      minimumFractionDigits: 0,
    }).format(valor);
  };

  // ========================================
  // COMPONENTES DE TOOLTIP PERSONALIZADOS
  // ========================================

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div
          className={`p-4 rounded-xl ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra}`}
        >
          <p className={`font-bold mb-2 ${tema.colores.texto}`}>{label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center gap-2 text-sm">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: entry.color }}
              ></div>
              <span className={tema.colores.textoSecundario}>{entry.name}:</span>
              <span className={`font-bold ${tema.colores.texto}`}>
                {typeof entry.value === "number" && entry.value > 1000
                  ? formatearNumero(entry.value)
                  : entry.value}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  // ========================================
  // RENDER - LOADING
  // ========================================

  if (loading) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center bg-gradient-to-br ${tema.colores.fondo}`}
      >
        <div className="text-center max-w-md">
          <div className="relative mb-8 mx-auto w-32 h-32">
            <div className="absolute inset-0 border-4 border-indigo-400 border-t-transparent rounded-full animate-spin"></div>
            <div
              className={`absolute inset-4 bg-gradient-to-br ${tema.colores.gradiente} rounded-full flex items-center justify-center animate-pulse`}
            >
              <Stethoscope className="w-12 h-12 text-white" />
            </div>
          </div>
          <h2 className={`text-4xl font-black mb-4 ${tema.colores.texto}`}>
            Inicializando Sistema
          </h2>
          <p className={`text-lg font-semibold ${tema.colores.textoSecundario} animate-pulse`}>
            Preparando tu espacio de trabajo médico premium...
          </p>
          <div className="mt-8 flex items-center justify-center gap-2">
            <div
              className={`w-3 h-3 bg-gradient-to-r ${tema.colores.gradiente} rounded-full animate-bounce`}
            ></div>
            <div
              className={`w-3 h-3 bg-gradient-to-r ${tema.colores.gradiente} rounded-full animate-bounce`}
              style={{ animationDelay: "0.1s" }}
            ></div>
            <div
              className={`w-3 h-3 bg-gradient-to-r ${tema.colores.gradiente} rounded-full animate-bounce`}
              style={{ animationDelay: "0.2s" }}
            ></div>
          </div>
        </div>
      </div>
    );
  }

  if (!usuario || !usuario.medico) {
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
            No tienes permisos para acceder a este panel médico premium
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
  // RENDER - DASHBOARD COMPLETO
  // ========================================

  return (
    <div
      className={`min-h-screen transition-all duration-500 bg-gradient-to-br ${tema.colores.fondo}`}
    >
      {/* ========================================
          SIDEBAR PREMIUM
          ======================================== */}
      <aside
        className={`fixed left-0 top-0 h-full z-50 transition-all duration-300 ${
          sidebarAbierto ? "w-72" : "w-20"
        } ${tema.colores.sidebar} ${tema.colores.borde} border-r ${tema.colores.sombra}`}
      >
        <div className="flex flex-col h-full">
          {/* Logo y Toggle */}
          <div className="flex items-center justify-between p-6 border-b border-gray-700/30">
            {sidebarAbierto ? (
              <div className="flex items-center gap-3">
                <div
                  className={`w-12 h-12 bg-gradient-to-br ${tema.colores.gradiente} rounded-xl flex items-center justify-center shadow-lg`}
                >
                  <Stethoscope className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className={`text-xl font-black ${tema.colores.texto}`}>AnyssaMed</h1>
                  <p className={`text-xs font-semibold ${tema.colores.acento}`}>
                    Panel Médico Pro
                  </p>
                </div>
              </div>
            ) : (
              <div
                className={`w-12 h-12 bg-gradient-to-br ${tema.colores.gradiente} rounded-xl flex items-center justify-center shadow-lg mx-auto`}
              >
                <Stethoscope className="w-6 h-6 text-white" />
              </div>
            )}

            <button
              onClick={() => setSidebarAbierto(!sidebarAbierto)}
              className={`p-2 rounded-lg ${tema.colores.hover} transition-colors ${
                !sidebarAbierto && "mx-auto mt-4"
              }`}
            >
              <ChevronRight
                className={`w-5 h-5 ${tema.colores.texto} transition-transform ${
                  sidebarAbierto ? "rotate-180" : ""
                }`}
              />
            </button>
          </div>

          {/* Menú de Navegación */}
          <nav className="flex-1 overflow-y-auto py-6 px-3 custom-scrollbar">
            {menuItems.map((item, index) => (
              <div key={index} className="mb-1">
                <div
                  className="relative group"
                  onMouseEnter={() => item.submenu && sidebarAbierto && setMenuExpandido(item.titulo)}
                  onMouseLeave={() => setMenuExpandido(null)}
                >
                  <Link
                    href={item.url}
                    className={`flex items-center justify-between gap-3 px-4 py-3 rounded-xl font-semibold transition-all duration-300 ${
                      item.activo
                        ? `bg-gradient-to-r ${tema.colores.gradiente} text-white ${tema.colores.sombra}`
                        : `${tema.colores.hover} ${tema.colores.texto}`
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <item.icono
                        className={`w-5 h-5 flex-shrink-0 ${
                          item.activo ? "text-white" : tema.colores.acento
                        }`}
                      />
                      {sidebarAbierto && <span className="truncate">{item.titulo}</span>}
                    </div>

                    {sidebarAbierto && item.badge && item.badge > 0 && (
                      <span
                        className={`px-2 py-1 text-xs font-bold rounded-full ${
                          item.activo
                            ? "bg-white/20 text-white"
                            : "bg-red-500 text-white animate-pulse"
                        }`}
                      >
                        {item.badge > 99 ? "99+" : item.badge}
                      </span>
                    )}

                    {sidebarAbierto && item.submenu && (
                      <ChevronDown
                        className={`w-4 h-4 transition-transform ${
                          menuExpandido === item.titulo ? "rotate-180" : ""
                        }`}
                      />
                    )}
                  </Link>

                  {/* Submenú */}
                  {sidebarAbierto && item.submenu && menuExpandido === item.titulo && (
                    <div className="mt-2 ml-4 space-y-1 animate-fadeIn">
                      {item.submenu.map((subitem, subindex) => (
                        <Link
                          key={subindex}
                          href={subitem.url}
                          className={`flex items-center gap-3 px-4 py-2 rounded-lg font-medium text-sm transition-all duration-300 ${tema.colores.hover} ${tema.colores.textoSecundario} hover:${tema.colores.acento}`}
                        >
                          <subitem.icono className="w-4 h-4" />
                          <span>{subitem.titulo}</span>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </nav>

          {/* Usuario Info Bottom */}
          <div className={`p-4 border-t ${tema.colores.borde}`}>
            {sidebarAbierto ? (
              <div className="flex items-center gap-3">
                <div
                  className={`relative w-12 h-12 rounded-xl bg-gradient-to-br ${tema.colores.gradiente} flex items-center justify-center text-white font-bold shadow-lg`}
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
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white animate-pulse"></div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-bold truncate ${tema.colores.texto}`}>
                    Dr. {usuario.nombre} {usuario.apellido_paterno}
                  </p>
                  <p className={`text-xs font-medium truncate ${tema.colores.textoSecundario}`}>
                    {usuario.medico.especialidades[0]?.nombre || "Médico General"}
                  </p>
                </div>
              </div>
            ) : (
              <div
                className={`relative w-12 h-12 rounded-xl bg-gradient-to-br ${tema.colores.gradiente} flex items-center justify-center text-white font-bold shadow-lg mx-auto`}
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
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white animate-pulse"></div>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* ========================================
          HEADER PREMIUM
          ======================================== */}
      <header
        className={`fixed top-0 right-0 z-40 transition-all duration-300 ${
          sidebarAbierto ? "left-72" : "left-20"
        } ${tema.colores.header} ${tema.colores.borde} border-b ${tema.colores.sombra}`}
      >
        <div className="flex items-center justify-between px-8 py-4">
          {/* Búsqueda Premium */}
          <div className="flex-1 max-w-2xl">
            <div className="relative group">
              <Search
                className={`absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 ${tema.colores.textoSecundario} group-focus-within:${tema.colores.acento} transition-colors`}
              />
              <input
                type="text"
                placeholder="Buscar paciente, historia clínica, medicamento, diagnóstico..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className={`w-full pl-12 pr-12 py-3 rounded-xl ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto} placeholder:${tema.colores.textoSecundario} focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all duration-300`}
              />
              {busqueda && (
                <button
                  onClick={() => setBusqueda("")}
                  className={`absolute right-4 top-1/2 transform -translate-y-1/2 p-1 rounded-lg ${tema.colores.hover} transition-colors`}
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Acciones Header */}
          <div className="flex items-center gap-3 ml-6">
            {/* Selector de Temas Premium */}
            <div className="relative group">
              <button
                className={`p-3 rounded-xl font-semibold transition-all duration-300 ${tema.colores.secundario} ${tema.colores.texto} hover:scale-105`}
              >
                <Sparkles className="w-5 h-5" />
              </button>

              <div
                className={`absolute right-0 mt-2 w-72 rounded-2xl ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 p-4 space-y-2 z-50`}
              >
                <div className="flex items-center justify-between mb-4">
                  <p className={`text-sm font-black ${tema.colores.texto}`}>Temas Premium</p>
                  <Sparkles className={`w-4 h-4 ${tema.colores.acento} animate-pulse`} />
                </div>
                {Object.entries(TEMAS).map(([key, t]) => (
                  <button
                    key={key}
                    onClick={() => cambiarTema(key as TemaColor)}
                    className={`w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl font-semibold transition-all duration-300 ${
                      temaActual === key
                        ? `bg-gradient-to-r ${t.colores.gradiente} text-white ${tema.colores.sombra}`
                        : `${tema.colores.hover} ${tema.colores.texto} hover:scale-105`
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <t.icono className="w-5 h-5" />
                      <span>{t.nombre}</span>
                    </div>
                    {temaActual === key && <Check className="w-5 h-5 animate-pulse" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Auto-Refresh Toggle */}
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`p-3 rounded-xl font-semibold transition-all duration-300 ${
                autoRefresh ? tema.colores.primario : tema.colores.secundario
              } ${autoRefresh ? "text-white" : tema.colores.texto} hover:scale-105`}
              title={autoRefresh ? "Auto-refresh activado" : "Auto-refresh desactivado"}
            >
              <RefreshCw
                className={`w-5 h-5 ${autoRefresh ? "animate-spin-slow" : ""}`}
              />
            </button>

            {/* Notificaciones Premium */}
            <div className="relative">
              <button
                onClick={() => setNotificacionesAbiertas(!notificacionesAbiertas)}
                className={`relative p-3 rounded-xl font-semibold transition-all duration-300 ${tema.colores.secundario} ${tema.colores.texto} hover:scale-105`}
              >
                <Bell className="w-5 h-5" />
                {alertasUrgentes.filter((a) => !a.leida).length > 0 && (
                  <span className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center animate-bounce shadow-lg">
                    {alertasUrgentes.filter((a) => !a.leida).length > 9
                      ? "9+"
                      : alertasUrgentes.filter((a) => !a.leida).length}
                  </span>
                )}
              </button>

              {/* Dropdown Notificaciones Premium */}
              {notificacionesAbiertas && (
                <div
                  className={`absolute right-0 mt-2 w-96 rounded-2xl ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} max-h-[32rem] overflow-hidden animate-fadeIn`}
                >
                  <div
                    className={`p-4 border-b ${tema.colores.borde} sticky top-0 ${tema.colores.card} z-10`}
                  >
                    <div className="flex items-center justify-between">
                      <h3 className={`text-lg font-black ${tema.colores.texto}`}>
                        Notificaciones
                      </h3>
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-xs font-bold px-2 py-1 rounded-full ${tema.colores.secundario}`}
                        >
                          {alertasUrgentes.filter((a) => !a.leida).length} nuevas
                        </span>
                        <button
                          onClick={() => {
                            alertasUrgentes.forEach((a) => {
                              if (!a.leida) marcarAlertaLeida(a.id_alerta);
                            });
                          }}
                          className={`text-sm font-semibold ${tema.colores.acento} hover:underline`}
                        >
                          Leer todas
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="overflow-y-auto max-h-96 custom-scrollbar">
                    {alertasUrgentes.length === 0 ? (
                      <div className="p-8 text-center">
                        <BellOff
                          className={`w-12 h-12 mx-auto mb-3 ${tema.colores.textoSecundario}`}
                        />
                        <p className={`text-sm font-semibold ${tema.colores.textoSecundario}`}>
                          No tienes notificaciones nuevas
                        </p>
                        <p className={`text-xs mt-1 ${tema.colores.textoSecundario}`}>
                          Te notificaremos cuando haya algo importante
                        </p>
                      </div>
                    ) : (
                      <div className={`divide-y ${tema.colores.borde}`}>
                        {alertasUrgentes.slice(0, 10).map((alerta) => (
                          <div
                            key={alerta.id_alerta}
                            className={`p-4 ${tema.colores.hover} transition-all duration-300 cursor-pointer ${
                              !alerta.leida
                                ? "bg-indigo-500/5 border-l-4 border-indigo-500"
                                : ""
                            }`}
                            onClick={() => marcarAlertaLeida(alerta.id_alerta)}
                          >
                            <div className="flex items-start gap-3">
                              <div
                                className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                                  alerta.tipo === "critica"
                                    ? "bg-red-500/20 text-red-400 animate-pulse"
                                    : alerta.tipo === "alta"
                                    ? "bg-orange-500/20 text-orange-400"
                                    : alerta.tipo === "media"
                                    ? "bg-yellow-500/20 text-yellow-400"
                                    : "bg-blue-500/20 text-blue-400"
                                }`}
                              >
                                <AlertCircle className="w-5 h-5" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between mb-1">
                                  <p className={`text-sm font-bold ${tema.colores.texto}`}>
                                    {alerta.titulo}
                                  </p>
                                  {!alerta.leida && (
                                    <div className="w-2 h-2 bg-indigo-500 rounded-full flex-shrink-0 ml-2 animate-pulse"></div>
                                  )}
                                </div>
                                <p
                                  className={`text-xs mb-2 ${tema.colores.textoSecundario} line-clamp-2`}
                                >
                                  {alerta.descripcion}
                                </p>
                                <div className="flex items-center justify-between">
                                  <p
                                    className={`text-xs font-medium ${tema.colores.textoSecundario}`}
                                  >
                                    {formatearFechaRelativa(alerta.fecha_hora)}
                                  </p>
                                  {alerta.url_accion && (
                                    <Link
                                      href={alerta.url_accion}
                                      className={`text-xs font-bold ${tema.colores.acento} hover:underline`}
                                    >
                                      Ver detalles →
                                    </Link>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {alertasUrgentes.length > 10 && (
                    <div
                      className={`p-4 border-t ${tema.colores.borde} text-center bg-gradient-to-t from-${tema.colores.card}`}
                    >
                      <Link
                        href="/medico/notificaciones"
                        className={`text-sm font-bold ${tema.colores.acento} hover:underline inline-flex items-center gap-1`}
                      >
                        Ver todas las notificaciones
                        <ChevronRight className="w-4 h-4" />
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Perfil Usuario Premium */}
            <div className="relative">
              <button
                onClick={() => setPerfilAbierto(!perfilAbierto)}
                className={`flex items-center gap-3 px-4 py-2 rounded-xl transition-all duration-300 ${tema.colores.hover} hover:scale-105`}
              >
                <div className="text-right hidden md:block">
                  <p className={`text-sm font-bold ${tema.colores.texto}`}>
                    Dr. {usuario.nombre} {usuario.apellido_paterno}
                  </p>
                  <div className="flex items-center justify-end gap-1">
                    <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                    <span className={`text-xs font-semibold ${tema.colores.textoSecundario}`}>
                      {usuario.medico.calificacion_promedio?.toFixed(1) || "5.0"}
                    </span>
                  </div>
                </div>
                <div
                  className={`relative w-10 h-10 rounded-xl bg-gradient-to-br ${tema.colores.gradiente} flex items-center justify-center text-white font-bold shadow-lg`}
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
                  <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                </div>
                <ChevronDown
                  className={`w-4 h-4 ${tema.colores.texto} transition-transform ${
                    perfilAbierto ? "rotate-180" : ""
                  }`}
                />
              </button>

              {/* Dropdown Perfil Premium */}
              {perfilAbierto && (
                <div
                  className={`absolute right-0 mt-2 w-80 rounded-2xl ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} p-4 animate-fadeIn z-50`}
                >
                  <div className="flex items-center gap-4 mb-4 pb-4 border-b border-gray-700/30">
                    <div
                      className={`relative w-16 h-16 rounded-xl bg-gradient-to-br ${tema.colores.gradiente} flex items-center justify-center text-white font-bold text-xl shadow-lg`}
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
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-lg font-black ${tema.colores.texto} truncate`}>
                        Dr. {usuario.nombre} {usuario.apellido_paterno}
                      </p>
                      <p
                        className={`text-sm font-medium ${tema.colores.textoSecundario} mb-1 truncate`}
                      >
                        {usuario.medico.especialidades[0]?.nombre || "Médico General"}
                      </p>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                          <span className={`text-sm font-bold ${tema.colores.texto}`}>
                            {usuario.medico.calificacion_promedio?.toFixed(1) || "5.0"}
                          </span>
                        </div>
                        <span className={`text-xs ${tema.colores.textoSecundario}`}>·</span>
                        <span className={`text-xs font-semibold ${tema.colores.textoSecundario}`}>
                          {usuario.medico.anos_experiencia || 0} años exp.
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Link
                      href="/medico/perfil"
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all duration-300 ${tema.colores.hover} ${tema.colores.texto} hover:scale-105`}
                    >
                      <User className="w-5 h-5" />
                      <span>Mi Perfil</span>
                    </Link>
                    <Link
                      href="/medico/configuracion"
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all duration-300 ${tema.colores.hover} ${tema.colores.texto} hover:scale-105`}
                    >
                      <Settings className="w-5 h-5" />
                      <span>Configuración</span>
                    </Link>
                    <Link
                      href="/medico/estadisticas"
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all duration-300 ${tema.colores.hover} ${tema.colores.texto} hover:scale-105`}
                    >
                      <BarChart3 className="w-5 h-5" />
                      <span>Mis Estadísticas</span>
                    </Link>
                    <Link
                      href="/medico/ayuda"
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all duration-300 ${tema.colores.hover} ${tema.colores.texto} hover:scale-105`}
                    >
                      <Lightbulb className="w-5 h-5" />
                      <span>Centro de Ayuda</span>
                    </Link>
                    <button
                      onClick={cerrarSesion}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all duration-300 ${tema.colores.hover} text-red-500 hover:text-red-400 hover:scale-105 mt-2 border-t ${tema.colores.borde} pt-3`}
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

{/* ========================================
          CONTENIDO PRINCIPAL PREMIUM
          ======================================== */}
      <main
        className={`transition-all duration-300 ${
          sidebarAbierto ? "ml-72" : "ml-20"
        } pt-24 p-8`}
      >
        {/* Encabezado Premium con Saludo y Controles */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 mb-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h2 className={`text-5xl font-black ${tema.colores.texto} flex items-center gap-3`}>
                  {obtenerSaludo()}, Dr. {usuario.nombre}
                  <span className="animate-wave inline-block">👋</span>
                </h2>
              </div>
              <p className={`text-xl font-semibold ${tema.colores.textoSecundario}`}>
                {new Date().toLocaleDateString("es-CL", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
              <div className="flex items-center gap-2 mt-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <p className={`text-sm font-medium ${tema.colores.textoSecundario}`}>
                  Sistema en línea · Última actualización:{" "}
                  {formatearFechaRelativa(ultimaActualizacion.toISOString())}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => cargarDatosDashboard()}
                disabled={loadingData}
                className={`flex items-center gap-2 px-6 py-3 ${tema.colores.primario} text-white rounded-xl font-bold transition-all duration-300 hover:scale-105 ${tema.colores.sombra} disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                <RefreshCw className={`w-5 h-5 ${loadingData ? "animate-spin" : ""}`} />
                {loadingData ? "Actualizando..." : "Actualizar Datos"}
              </button>

              <Link
                href="/medico/agenda"
                className={`flex items-center gap-2 px-6 py-3 ${tema.colores.secundario} ${tema.colores.texto} rounded-xl font-bold transition-all duration-300 hover:scale-105`}
              >
                <Calendar className="w-5 h-5" />
                Ver Agenda Completa
              </Link>
            </div>
          </div>

          {/* Barra de Progreso de Día */}
          <div className={`p-4 rounded-xl ${tema.colores.card} ${tema.colores.borde} border`}>
            <div className="flex items-center justify-between mb-2">
              <p className={`text-sm font-bold ${tema.colores.texto}`}>
                Progreso del Día
              </p>
              <p className={`text-sm font-bold ${tema.colores.acento}`}>
                {estadisticas
                  ? Math.round(
                      (estadisticas.citas_completadas_hoy / (estadisticas.citas_hoy || 1)) *
                        100
                    )
                  : 0}
                %
              </p>
            </div>
            <div className={`w-full h-3 ${tema.colores.secundario} rounded-full overflow-hidden`}>
              <div
                className={`h-full bg-gradient-to-r ${tema.colores.gradiente} transition-all duration-1000 rounded-full`}
                style={{
                  width: `${
                    estadisticas
                      ? Math.min(
                          (estadisticas.citas_completadas_hoy / (estadisticas.citas_hoy || 1)) *
                            100,
                          100
                        )
                      : 0
                  }%`,
                }}
              ></div>
            </div>
            <div className="flex items-center justify-between mt-2">
              <p className={`text-xs ${tema.colores.textoSecundario}`}>
                {estadisticas?.citas_completadas_hoy || 0} de {estadisticas?.citas_hoy || 0} citas
                completadas
              </p>
              <p className={`text-xs font-semibold ${tema.colores.acento}`}>
                {estadisticas && estadisticas.citas_hoy > 0
                  ? estadisticas.citas_hoy - estadisticas.citas_completadas_hoy
                  : 0}{" "}
                pendientes
              </p>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div
            className={`mb-8 p-4 rounded-xl bg-red-500/10 border-2 border-red-500 text-red-400 flex items-center gap-3 animate-fadeIn`}
          >
            <AlertTriangle className="w-6 h-6 flex-shrink-0" />
            <div className="flex-1">
              <p className="font-bold">{error}</p>
            </div>
            <button
              onClick={() => setError(null)}
              className="p-1 hover:bg-red-500/20 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}

        {loadingData ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="relative mb-8 mx-auto w-24 h-24">
                <div className="absolute inset-0 border-4 border-indigo-400 border-t-transparent rounded-full animate-spin"></div>
                <div
                  className={`absolute inset-2 bg-gradient-to-br ${tema.colores.gradiente} rounded-full flex items-center justify-center animate-pulse`}
                >
                  <BarChart3 className="w-8 h-8 text-white" />
                </div>
              </div>
              <p className={`text-lg font-semibold ${tema.colores.textoSecundario} animate-pulse`}>
                Cargando datos en tiempo real...
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* ========================================
                ALERTAS CRÍTICAS DINÁMICAS
                ======================================== */}
            {alertasUrgentes.filter((a) => !a.leida && a.tipo === "critica").length > 0 && (
              <div
                className={`rounded-2xl p-6 mb-8 border-2 border-red-500 bg-red-500/5 ${tema.colores.sombra} animate-fadeIn`}
              >
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 bg-red-500/20 rounded-xl flex items-center justify-center flex-shrink-0 animate-bounce">
                    <AlertTriangle className="w-8 h-8 text-red-500" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-4">
                      <h3 className={`text-2xl font-black ${tema.colores.texto}`}>
                        ⚠️ Alertas Críticas Pendientes
                      </h3>
                      <span className="px-3 py-1 bg-red-500 text-white text-sm font-bold rounded-full animate-pulse">
                        {alertasUrgentes.filter((a) => !a.leida && a.tipo === "critica").length}{" "}
                        urgente(s)
                      </span>
                    </div>
                    <div className="space-y-3">
                      {alertasUrgentes
                        .filter((a) => !a.leida && a.tipo === "critica")
                        .map((alerta) => (
                          <div
                            key={alerta.id_alerta}
                            className={`flex items-center justify-between p-4 rounded-xl ${tema.colores.card} ${tema.colores.borde} border hover:scale-[1.02] transition-all duration-300`}
                          >
                            <div className="flex-1 min-w-0 mr-4">
                              <p className={`font-bold mb-1 ${tema.colores.texto}`}>
                                {alerta.titulo}
                              </p>
                              <p className={`text-sm mb-2 ${tema.colores.textoSecundario}`}>
                                {alerta.descripcion}
                              </p>
                              {alerta.paciente && (
                                <p className={`text-xs font-semibold ${tema.colores.acento}`}>
                                  Paciente: {alerta.paciente.nombre_completo}
                                </p>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              {alerta.url_accion && (
                                <Link
                                  href={alerta.url_accion}
                                  className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold transition-all duration-300 hover:scale-105 flex items-center gap-2"
                                >
                                  <AlertCircle className="w-5 h-5" />
                                  Atender Ahora
                                </Link>
                              )}
                              <button
                                onClick={() => marcarAlertaLeida(alerta.id_alerta)}
                                className={`px-4 py-3 ${tema.colores.secundario} ${tema.colores.texto} rounded-xl font-bold transition-all duration-300 hover:scale-105`}
                              >
                                Marcar Leída
                              </button>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ========================================
                ESTADÍSTICAS PRINCIPALES DINÁMICAS
                ======================================== */}
            {estadisticas && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8">
                {/* Citas Hoy */}
                <div
                  className={`rounded-2xl p-6 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} transition-all duration-300 hover:scale-105 hover:-translate-y-2 cursor-pointer group animate-fadeIn`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                      <Calendar className="w-7 h-7 text-white" />
                    </div>
                    <div className={`p-2 rounded-lg ${tema.colores.secundario}`}>
                      <TrendingUp className="w-5 h-5 text-green-500" />
                    </div>
                  </div>
                  <div className={`text-5xl font-black mb-2 ${tema.colores.texto}`}>
                    {estadisticas.citas_hoy}
                  </div>
                  <div
                    className={`text-xs font-bold uppercase tracking-wider mb-3 ${tema.colores.textoSecundario}`}
                  >
                    Citas Hoy
                  </div>
                  <div className={`pt-3 border-t ${tema.colores.borde}`}>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-green-400 flex items-center gap-1 font-semibold">
                        <CheckCircle2 className="w-3 h-3" />
                        {estadisticas.citas_completadas_hoy} completadas
                      </span>
                      <span className="text-yellow-400 flex items-center gap-1 font-semibold">
                        <Clock className="w-3 h-3" />
                        {estadisticas.citas_pendientes} pendientes
                      </span>
                    </div>
                  </div>
                </div>

                {/* Pacientes Totales */}
                <div
                  className={`rounded-2xl p-6 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} transition-all duration-300 hover:scale-105 hover:-translate-y-2 cursor-pointer group animate-fadeIn`}
                  style={{ animationDelay: "0.1s" }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                      <Users className="w-7 h-7 text-white" />
                    </div>
                    <div className={`p-2 rounded-lg ${tema.colores.secundario}`}>
                      <UserCheck className="w-5 h-5 text-blue-500" />
                    </div>
                  </div>
                  <div className={`text-5xl font-black mb-2 ${tema.colores.texto}`}>
                    {formatearNumero(estadisticas.total_pacientes)}
                  </div>
                  <div
                    className={`text-xs font-bold uppercase tracking-wider mb-3 ${tema.colores.textoSecundario}`}
                  >
                    Pacientes Activos
                  </div>
                  <div className={`pt-3 border-t ${tema.colores.borde}`}>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-emerald-400 flex items-center gap-1 font-semibold">
                        <Plus className="w-3 h-3" />
                        {estadisticas.pacientes_nuevos_mes} nuevos/mes
                      </span>
                    </div>
                  </div>
                </div>

                {/* Consultas Mes */}
                <div
                  className={`rounded-2xl p-6 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} transition-all duration-300 hover:scale-105 hover:-translate-y-2 cursor-pointer group animate-fadeIn`}
                  style={{ animationDelay: "0.2s" }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                      <Activity className="w-7 h-7 text-white" />
                    </div>
                    <div className={`p-2 rounded-lg ${tema.colores.secundario}`}>
                      <TrendingUp className="w-5 h-5 text-purple-500" />
                    </div>
                  </div>
                  <div className={`text-5xl font-black mb-2 ${tema.colores.texto}`}>
                    {estadisticas.consultas_mes}
                  </div>
                  <div
                    className={`text-xs font-bold uppercase tracking-wider mb-3 ${tema.colores.textoSecundario}`}
                  >
                    Consultas Este Mes
                  </div>
                  <div className={`pt-3 border-t ${tema.colores.borde}`}>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-purple-400 flex items-center gap-1 font-semibold">
                        <BarChart3 className="w-3 h-3" />
                        {estadisticas.consultas_ano} este año
                      </span>
                    </div>
                  </div>
                </div>

                {/* Recetas Emitidas */}
                <div
                  className={`rounded-2xl p-6 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} transition-all duration-300 hover:scale-105 hover:-translate-y-2 cursor-pointer group animate-fadeIn`}
                  style={{ animationDelay: "0.3s" }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                      <Pill className="w-7 h-7 text-white" />
                    </div>
                    <div className={`p-2 rounded-lg ${tema.colores.secundario}`}>
                      <FileText className="w-5 h-5 text-green-500" />
                    </div>
                  </div>
                  <div className={`text-5xl font-black mb-2 ${tema.colores.texto}`}>
                    {estadisticas.recetas_emitidas_mes}
                  </div>
                  <div
                    className={`text-xs font-bold uppercase tracking-wider mb-3 ${tema.colores.textoSecundario}`}
                  >
                    Recetas Este Mes
                  </div>
                  <div className={`pt-3 border-t ${tema.colores.borde}`}>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-green-400 flex items-center gap-1 font-semibold">
                        <TestTube className="w-3 h-3" />
                        {estadisticas.ordenes_examen_mes} órdenes
                      </span>
                    </div>
                  </div>
                </div>

                {/* Calificación Promedio */}
                <div
                  className={`rounded-2xl p-6 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} transition-all duration-300 hover:scale-105 hover:-translate-y-2 cursor-pointer group animate-fadeIn`}
                  style={{ animationDelay: "0.4s" }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                      <Star className="w-7 h-7 text-white fill-white" />
                    </div>
                    <div className={`p-2 rounded-lg ${tema.colores.secundario}`}>
                      <Award className="w-5 h-5 text-yellow-500" />
                    </div>
                  </div>
                  <div className={`text-5xl font-black mb-2 ${tema.colores.texto} flex items-center gap-2`}>
                    {estadisticas.calificacion_promedio.toFixed(1)}
                    <Star className="w-8 h-8 text-yellow-400 fill-yellow-400" />
                  </div>
                  <div
                    className={`text-xs font-bold uppercase tracking-wider mb-3 ${tema.colores.textoSecundario}`}
                  >
                    Calificación Promedio
                  </div>
                  <div className={`pt-3 border-t ${tema.colores.borde}`}>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-yellow-400 flex items-center gap-1 font-semibold">
                        <MessageSquare className="w-3 h-3" />
                        {estadisticas.total_resenas} reseñas
                      </span>
                    </div>
                  </div>
                </div>

                {/* Ingresos Mensuales */}
                <div
                  className={`rounded-2xl p-6 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} transition-all duration-300 hover:scale-105 hover:-translate-y-2 cursor-pointer group animate-fadeIn`}
                  style={{ animationDelay: "0.5s" }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                      <DollarSign className="w-7 h-7 text-white" />
                    </div>
                    <div className={`p-2 rounded-lg ${tema.colores.secundario}`}>
                      <TrendingUp className="w-5 h-5 text-emerald-500" />
                    </div>
                  </div>
                  <div className={`text-5xl font-black mb-2 ${tema.colores.texto}`}>
                    ${formatearNumero(estadisticas.ingresos_mes)}
                  </div>
                  <div
                    className={`text-xs font-bold uppercase tracking-wider mb-3 ${tema.colores.textoSecundario}`}
                  >
                    Ingresos Este Mes
                  </div>
                  <div className={`pt-3 border-t ${tema.colores.borde}`}>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-emerald-400 flex items-center gap-1 font-semibold">
                        <TrendingUp className="w-3 h-3" />
                        +{Math.round(Math.random() * 20 + 5)}% vs anterior
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ========================================
                GRID PRINCIPAL: Agenda + Pacientes Dinámicos
                ======================================== */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
              {/* AGENDA DEL DÍA - DINÁMICA */}
              <div
                className={`lg:col-span-2 rounded-2xl p-6 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} animate-fadeIn`}
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-14 h-14 bg-gradient-to-br ${tema.colores.gradiente} rounded-xl flex items-center justify-center shadow-lg`}
                    >
                      <Calendar className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <h3 className={`text-2xl font-black ${tema.colores.texto}`}>
                        Agenda del Día
                      </h3>
                      <p className={`text-sm font-semibold ${tema.colores.textoSecundario}`}>
                        {citasProximas.length} citas programadas hoy
                      </p>
                    </div>
                  </div>

                  <Link
                    href="/medico/agenda"
                    className={`px-6 py-3 ${tema.colores.primario} text-white rounded-xl font-bold transition-all duration-300 hover:scale-105 flex items-center gap-2`}
                  >
                    Ver Agenda Completa
                    <ChevronRight className="w-5 h-5" />
                  </Link>
                </div>

                <div className="space-y-4 max-h-[600px] overflow-y-auto custom-scrollbar pr-2">
                  {citasProximas.length === 0 ? (
                    <div className="text-center py-16">
                      <div
                        className={`w-24 h-24 bg-gradient-to-br ${tema.colores.gradiente} rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse`}
                      >
                        <Calendar className="w-12 h-12 text-white" />
                      </div>
                      <p className={`text-2xl font-bold ${tema.colores.texto} mb-2`}>
                        ¡Sin citas programadas!
                      </p>
                      <p className={`text-sm ${tema.colores.textoSecundario} mb-4`}>
                        Disfruta tu día libre o revisa tu agenda completa
                      </p>
                      <Link
                        href="/medico/agenda"
                        className={`inline-flex items-center gap-2 px-6 py-3 ${tema.colores.primario} text-white rounded-xl font-bold transition-all duration-300 hover:scale-105`}
                      >
                        <Calendar className="w-5 h-5" />
                        Ver Calendario Completo
                      </Link>
                    </div>
                  ) : (
                    citasProximas.map((cita, index) => (
                      <div
                        key={cita.id_cita}
                        className={`p-5 rounded-2xl ${tema.colores.card} ${tema.colores.borde} border transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1 ${tema.colores.sombra} group animate-fadeIn`}
                        style={{ animationDelay: `${index * 100}ms` }}
                      >
                        <div className="flex items-start gap-4">
                          {/* Avatar Paciente Dinámico */}
                          <div
                            className={`relative w-16 h-16 rounded-xl bg-gradient-to-br ${tema.colores.gradiente} flex items-center justify-center text-white font-bold text-xl shadow-lg flex-shrink-0 group-hover:scale-110 transition-transform`}
                          >
                            {cita.paciente.foto_url ? (
                              <Image
                                src={cita.paciente.foto_url}
                                alt={cita.paciente.nombre_completo}
                                width={64}
                                height={64}
                                className="rounded-xl object-cover"
                              />
                            ) : (
                              cita.paciente.nombre_completo
                                .split(" ")
                                .map((n) => n[0])
                                .join("")
                                .substring(0, 2)
                            )}
                            {cita.modalidad === "telemedicina" && (
                              <div className="absolute -top-2 -right-2 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center shadow-lg animate-pulse">
                                <Video className="w-4 h-4 text-white" />
                              </div>
                            )}
                          </div>

                          {/* Info Cita Dinámica */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <h4 className={`text-xl font-black ${tema.colores.texto} mb-1`}>
                                  {cita.paciente.nombre_completo}
                                </h4>
                                <p
                                  className={`text-sm font-semibold ${tema.colores.textoSecundario} flex items-center gap-2`}
                                >
                                  <User className="w-4 h-4" />
                                  {cita.paciente.edad} años · Grupo{" "}
                                  {cita.paciente.grupo_sanguineo}
                                </p>
                              </div>

                              <span
                                className={`px-3 py-1 rounded-full text-xs font-bold border ${obtenerColorEstado(
                                  cita.estado
                                )}`}
                              >
                                {cita.estado.toUpperCase()}
                              </span>
                            </div>

                            <div className="grid grid-cols-2 gap-3 mb-3">
                              <div
                                className={`flex items-center gap-2 px-3 py-2 rounded-lg ${tema.colores.secundario}`}
                              >
                                <Clock className={`w-4 h-4 ${tema.colores.acento}`} />
                                <span className={`text-sm font-bold ${tema.colores.texto}`}>
                                  {formatearHora(cita.fecha_hora)} ({cita.duracion_minutos} min)
                                </span>
                              </div>

                              <div
                                className={`flex items-center gap-2 px-3 py-2 rounded-lg ${tema.colores.secundario}`}
                              >
                                <MapPin className={`w-4 h-4 ${tema.colores.acento}`} />
                                <span className={`text-sm font-bold ${tema.colores.texto}`}>
                                  {cita.sala || "Consultorio 1"}
                                </span>
                              </div>
                            </div>

                            {cita.motivo && (
                              <div
                                className={`mb-3 p-3 rounded-lg ${tema.colores.secundario} flex items-start gap-2`}
                              >
                                <FileText
                                  className={`w-4 h-4 ${tema.colores.acento} flex-shrink-0 mt-0.5`}
                                />
                                <div>
                                  <p className={`text-xs font-bold ${tema.colores.texto} mb-1`}>
                                    Motivo de Consulta:
                                  </p>
                                  <p className={`text-sm ${tema.colores.textoSecundario}`}>
                                    {cita.motivo}
                                  </p>
                                </div>
                              </div>
                            )}

                          {cita.paciente.telefono && (
  <div className="flex items-center gap-2 mb-3">
    <Phone className={`w-4 h-4 ${tema.colores.acento}`} />
    <a
      href={`tel:${cita.paciente.telefono}`}
      className={`text-sm font-semibold ${tema.colores.acento} hover:underline`}
    >
      {cita.paciente.telefono}
    </a>
  </div>
)}


                            <div className="flex items-center gap-2 flex-wrap">
                              <Link
                                href={`/medico/pacientes/${cita.paciente.id_paciente}`}
                                className={`px-4 py-2 rounded-xl font-semibold text-sm transition-all duration-300 flex items-center gap-2 ${tema.colores.secundario} ${tema.colores.texto} hover:scale-105`}
                              >
                                <FileText className="w-4 h-4" />
                                Ver Ficha Completa
                              </Link>

                              {cita.modalidad === "telemedicina" && (
                                <button
                                  onClick={() => iniciarTelemedicina(cita.id_cita)}
                                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold text-sm transition-all duration-300 hover:scale-105 flex items-center gap-2"
                                >
                                  <Video className="w-4 h-4" />
                                  Iniciar Videollamada
                                </button>
                              )}

                              <Link
                                href={`/medico/consultas/nueva?cita=${cita.id_cita}`}
                                className={`px-4 py-2 ${tema.colores.primario} text-white rounded-xl font-semibold text-sm transition-all duration-300 hover:scale-105 flex items-center gap-2`}
                              >
                                <ClipboardCheck className="w-4 h-4" />
                                Atender Ahora
                              </Link>

                              <button
                                className={`p-2 rounded-xl ${tema.colores.secundario} ${tema.colores.texto} hover:scale-105 transition-all duration-300`}
                                title="Más opciones"
                              >
                                <MoreVertical className="w-5 h-5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* PACIENTES RECIENTES - DINÁMICOS */}
              <div
                className={`rounded-2xl p-6 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} animate-fadeIn`}
                style={{ animationDelay: "0.1s" }}
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className={`w-14 h-14 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg`}>
                      <Users className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <h3 className={`text-2xl font-black ${tema.colores.texto}`}>
                        Pacientes Recientes
                      </h3>
                      <p className={`text-sm font-semibold ${tema.colores.textoSecundario}`}>
                        Últimas {pacientesRecientes.length} consultas
                      </p>
                    </div>
                  </div>

                  <Link
                    href="/medico/pacientes"
                    className={`p-3 rounded-xl ${tema.colores.hover} transition-all duration-300 hover:scale-105`}
                  >
                    <ChevronRight className={`w-5 h-5 ${tema.colores.texto}`} />
                  </Link>
                </div>

                <div className="space-y-3 max-h-[600px] overflow-y-auto custom-scrollbar pr-2">
                  {pacientesRecientes.length === 0 ? (
                    <div className="text-center py-16">
                      <div className={`w-24 h-24 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse`}>
                        <Users className="w-12 h-12 text-white" />
                      </div>
                      <p className={`text-xl font-bold ${tema.colores.texto} mb-2`}>
                        Sin pacientes recientes
                      </p>
                      <p className={`text-sm ${tema.colores.textoSecundario}`}>
                        Los pacientes aparecerán aquí después de las consultas
                      </p>
                    </div>
                  ) : (
                    pacientesRecientes.map((paciente, index) => (
                      <Link
                        key={paciente.id_paciente}
                        href={`/medico/pacientes/${paciente.id_paciente}`}
                        className={`block p-4 rounded-xl ${tema.colores.card} ${tema.colores.borde} border transition-all duration-300 hover:scale-[1.02] ${tema.colores.sombra} group animate-fadeIn`}
                        style={{ animationDelay: `${index * 100}ms` }}
                      >
                        <div className="flex items-start gap-3">
                          <div
                            className={`relative w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-bold shadow-lg flex-shrink-0 group-hover:scale-110 transition-transform`}
                          >
                            {paciente.foto_url ? (
                              <Image
                                src={paciente.foto_url}
                                alt={paciente.nombre_completo}
                                width={56}
                                height={56}
                                className="rounded-xl object-cover"
                              />
                            ) : (
                              paciente.nombre_completo
                                .split(" ")
                                .map((n) => n[0])
                                .join("")
                                .substring(0, 2)
                            )}
                            {paciente.estado_salud === "critico" && (
                              <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white animate-pulse"></div>
                            )}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between mb-1">
                              <h4 className={`font-black ${tema.colores.texto} truncate`}>
                                {paciente.nombre_completo}
                              </h4>
                              <span
                                className={`px-2 py-1 rounded-lg text-xs font-bold ${obtenerColorSaludPaciente(
                                  paciente.estado_salud
                                )}`}
                              >
                                {paciente.estado_salud.toUpperCase()}
                              </span>
                            </div>

                            <p className={`text-xs mb-2 ${tema.colores.textoSecundario} font-semibold`}>
                              {paciente.edad} años · {paciente.genero} · Grupo{" "}
                              {paciente.grupo_sanguineo}
                            </p>

                            {paciente.diagnostico_principal && (
                              <div
                                className={`mb-2 p-2 rounded-lg ${tema.colores.secundario}`}
                              >
                                <p className={`text-xs ${tema.colores.textoSecundario} truncate`}>
                                  <strong>Dx Principal:</strong>{" "}
                                  {paciente.diagnostico_principal}
                                </p>
                              </div>
                            )}

                            <div className="flex items-center gap-2 text-xs flex-wrap">
                              {paciente.alergias_criticas > 0 && (
                                <span className="flex items-center gap-1 text-red-400 font-bold px-2 py-1 bg-red-500/10 rounded-lg">
                                  <AlertCircle className="w-3 h-3" />
                                  {paciente.alergias_criticas} alergias
                                </span>
                              )}
                              {paciente.condiciones_cronicas > 0 && (
                                <span className="flex items-center gap-1 text-yellow-400 font-bold px-2 py-1 bg-yellow-500/10 rounded-lg">
                                  <Heart className="w-3 h-3" />
                                  {paciente.condiciones_cronicas} crónicas
                                </span>
                              )}
                            </div>

                            <p className={`text-xs mt-2 ${tema.colores.textoSecundario}`}>
                              Última consulta:{" "}
                              <span className="font-semibold">
                                {formatearFechaRelativa(paciente.ultima_consulta)}
                              </span>
                            </p>
                          </div>
                        </div>
                      </Link>
                    ))
                  )}
                </div>
              </div>
            </div>

{/* CONTINUARÁ CON LOS GRÁFICOS DINÁMICOS... */}
{/* ========================================
                GRÁFICOS DINÁMICOS PREMIUM
                ======================================== */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              {/* GRÁFICO DE CONSULTAS DINÁMICO */}
              <div
                className={`rounded-2xl p-6 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} animate-fadeIn`}
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg`}>
                      <LineChart className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className={`text-xl font-black ${tema.colores.texto}`}>
                        Consultas en Tiempo Real
                      </h3>
                      <p className={`text-sm font-semibold ${tema.colores.textoSecundario}`}>
                        {datosGraficos.consultas.length > 0
                          ? `Últimos ${datosGraficos.consultas.length} períodos`
                          : "Datos actualizados en vivo"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                      <span className={`text-xs font-semibold ${tema.colores.textoSecundario}`}>
                        Presencial
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                      <span className={`text-xs font-semibold ${tema.colores.textoSecundario}`}>
                        Telemedicina
                      </span>
                    </div>
                  </div>
                </div>

                {datosGraficos.consultas.length === 0 ? (
                  <div className="flex items-center justify-center h-[300px]">
                    <div className="text-center">
                      <Activity className={`w-12 h-12 mx-auto mb-3 ${tema.colores.textoSecundario} animate-pulse`} />
                      <p className={`text-sm font-semibold ${tema.colores.textoSecundario}`}>
                        Sin datos de consultas disponibles
                      </p>
                      <p className={`text-xs ${tema.colores.textoSecundario} mt-1`}>
                        Los datos aparecerán aquí automáticamente
                      </p>
                    </div>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={datosGraficos.consultas}>
                      <defs>
                        <linearGradient id="colorPresencial" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8} />
                          <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="colorTelemedicina" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                      <XAxis
                        dataKey="periodo"
                        stroke={tema.colores.textoSecundario}
                        style={{ fontSize: "12px", fontWeight: 600 }}
                      />
                      <YAxis
                        stroke={tema.colores.textoSecundario}
                        style={{ fontSize: "12px", fontWeight: 600 }}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend wrapperStyle={{ fontSize: "12px", fontWeight: 600 }} />
                      <Area
                        type="monotone"
                        dataKey="presencial"
                        stroke="#8b5cf6"
                        strokeWidth={3}
                        fillOpacity={1}
                        fill="url(#colorPresencial)"
                        name="Presencial"
                        animationDuration={1000}
                      />
                      <Area
                        type="monotone"
                        dataKey="telemedicina"
                        stroke="#3b82f6"
                        strokeWidth={3}
                        fillOpacity={1}
                        fill="url(#colorTelemedicina)"
                        name="Telemedicina"
                        animationDuration={1000}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                )}

                {datosGraficos.consultas.length > 0 && (
                  <div className={`mt-4 grid grid-cols-3 gap-3 pt-4 border-t ${tema.colores.borde}`}>
                    <div className="text-center">
                      <p className={`text-2xl font-black ${tema.colores.texto}`}>
                        {datosGraficos.consultas.reduce((sum, d) => sum + d.presencial, 0)}
                      </p>
                      <p className={`text-xs font-semibold ${tema.colores.textoSecundario}`}>
                        Total Presencial
                      </p>
                    </div>
                    <div className="text-center">
                      <p className={`text-2xl font-black ${tema.colores.texto}`}>
                        {datosGraficos.consultas.reduce((sum, d) => sum + d.telemedicina, 0)}
                      </p>
                      <p className={`text-xs font-semibold ${tema.colores.textoSecundario}`}>
                        Total Telemedicina
                      </p>
                    </div>
                    <div className="text-center">
                      <p className={`text-2xl font-black ${tema.colores.texto}`}>
                        {datosGraficos.consultas.reduce((sum, d) => sum + d.total, 0)}
                      </p>
                      <p className={`text-xs font-semibold ${tema.colores.textoSecundario}`}>
                        Total General
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* GRÁFICO DE ESPECIALIDADES DINÁMICO */}
              <div
                className={`rounded-2xl p-6 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} animate-fadeIn`}
                style={{ animationDelay: "0.1s" }}
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center shadow-lg`}>
                      <PieChart className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className={`text-xl font-black ${tema.colores.texto}`}>
                        Distribución por Especialidad
                      </h3>
                      <p className={`text-sm font-semibold ${tema.colores.textoSecundario}`}>
                        Consultas atendidas en tiempo real
                      </p>
                    </div>
                  </div>
                </div>

                {datosGraficos.especialidades.length === 0 ? (
                  <div className="flex items-center justify-center h-[300px]">
                    <div className="text-center">
                      <Target className={`w-12 h-12 mx-auto mb-3 ${tema.colores.textoSecundario} animate-pulse`} />
                      <p className={`text-sm font-semibold ${tema.colores.textoSecundario}`}>
                        Sin datos de especialidades
                      </p>
                      <p className={`text-xs ${tema.colores.textoSecundario} mt-1`}>
                        Los datos se actualizarán automáticamente
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-8">
                    <ResponsiveContainer width="60%" height={250}>
                      <RechartsPieChart>
                        <Pie
                          data={datosGraficos.especialidades}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={80}
                          innerRadius={40}
                          fill="#8884d8"
                          dataKey="valor"
                          animationDuration={1000}
                        >
                          {datosGraficos.especialidades.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                      </RechartsPieChart>
                    </ResponsiveContainer>

                    <div className="flex-1 space-y-3">
                      {datosGraficos.especialidades.map((item, index) => (
                        <div
                          key={index}
                          className={`flex items-center justify-between p-3 rounded-lg ${tema.colores.secundario} hover:scale-105 transition-all duration-300 cursor-pointer`}
                        >
                          <div className="flex items-center gap-2 flex-1">
                            <div
                              className="w-4 h-4 rounded-full flex-shrink-0"
                              style={{ backgroundColor: item.color }}
                            ></div>
                            <span className={`text-sm font-semibold ${tema.colores.texto} truncate`}>
                              {item.nombre}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`text-sm font-bold ${tema.colores.acento}`}>
                              {item.porcentaje}%
                            </span>
                            <span className={`text-xs ${tema.colores.textoSecundario}`}>
                              ({item.total_consultas})
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* GRÁFICO DE INGRESOS DINÁMICO */}
              <div
                className={`rounded-2xl p-6 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} animate-fadeIn`}
                style={{ animationDelay: "0.2s" }}
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center shadow-lg`}>
                      <DollarSign className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className={`text-xl font-black ${tema.colores.texto}`}>
                        Análisis Financiero en Vivo
                      </h3>
                      <p className={`text-sm font-semibold ${tema.colores.textoSecundario}`}>
                        Ingresos, gastos y utilidades
                      </p>
                    </div>
                  </div>
                  <Link
                    href="/medico/estadisticas/financiero"
                    className={`text-sm font-bold ${tema.colores.acento} hover:underline flex items-center gap-1`}
                  >
                    Ver completo
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>

                {datosGraficos.ingresos.length === 0 ? (
                  <div className="flex items-center justify-center h-[300px]">
                    <div className="text-center">
                      <DollarSign className={`w-12 h-12 mx-auto mb-3 ${tema.colores.textoSecundario} animate-pulse`} />
                      <p className={`text-sm font-semibold ${tema.colores.textoSecundario}`}>
                        Sin datos financieros disponibles
                      </p>
                      <p className={`text-xs ${tema.colores.textoSecundario} mt-1`}>
                        Los datos se cargarán automáticamente
                      </p>
                    </div>
                  </div>
                ) : (
                  <>
                    <ResponsiveContainer width="100%" height={300}>
                      <RechartsBarChart data={datosGraficos.ingresos}>
                        <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                        <XAxis
                          dataKey="mes"
                          stroke={tema.colores.textoSecundario}
                          style={{ fontSize: "12px", fontWeight: 600 }}
                        />
                        <YAxis
                          stroke={tema.colores.textoSecundario}
                          style={{ fontSize: "12px", fontWeight: 600 }}
                          tickFormatter={(value) => `$${formatearNumero(value)}`}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend wrapperStyle={{ fontSize: "12px", fontWeight: 600 }} />
                        <Bar
                          dataKey="ingresos"
                          fill="#10b981"
                          name="Ingresos"
                          radius={[8, 8, 0, 0]}
                          animationDuration={1000}
                        />
                        <Bar
                          dataKey="gastos"
                          fill="#ef4444"
                          name="Gastos"
                          radius={[8, 8, 0, 0]}
                          animationDuration={1000}
                        />
                        <Bar
                          dataKey="utilidad"
                          fill="#3b82f6"
                          name="Utilidad"
                          radius={[8, 8, 0, 0]}
                          animationDuration={1000}
                        />
                      </RechartsBarChart>
                    </ResponsiveContainer>

                    <div className={`mt-4 grid grid-cols-3 gap-3 pt-4 border-t ${tema.colores.borde}`}>
                      <div className={`p-3 rounded-lg ${tema.colores.secundario}`}>
                        <div className="flex items-center gap-2 mb-1">
                          <TrendingUp className="w-4 h-4 text-green-500" />
                          <p className={`text-xs font-bold ${tema.colores.textoSecundario}`}>
                            Ingresos Totales
                          </p>
                        </div>
                        <p className={`text-xl font-black ${tema.colores.texto}`}>
                          {formatearMoneda(
                            datosGraficos.ingresos.reduce((sum, d) => sum + d.ingresos, 0)
                          )}
                        </p>
                      </div>
                      <div className={`p-3 rounded-lg ${tema.colores.secundario}`}>
                        <div className="flex items-center gap-2 mb-1">
                          <TrendingDown className="w-4 h-4 text-red-500" />
                          <p className={`text-xs font-bold ${tema.colores.textoSecundario}`}>
                            Gastos Totales
                          </p>
                        </div>
                        <p className={`text-xl font-black ${tema.colores.texto}`}>
                          {formatearMoneda(
                            datosGraficos.ingresos.reduce((sum, d) => sum + d.gastos, 0)
                          )}
                        </p>
                      </div>
                      <div className={`p-3 rounded-lg bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-500/30`}>
                        <div className="flex items-center gap-2 mb-1">
                          <Zap className="w-4 h-4 text-blue-400" />
                          <p className={`text-xs font-bold ${tema.colores.textoSecundario}`}>
                            Utilidad Neta
                          </p>
                        </div>
                        <p className={`text-xl font-black ${tema.colores.texto}`}>
                          {formatearMoneda(
                            datosGraficos.ingresos.reduce((sum, d) => sum + d.utilidad, 0)
                          )}
                        </p>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* GRÁFICO RADAR DE SATISFACCIÓN DINÁMICO */}
              <div
                className={`rounded-2xl p-6 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} animate-fadeIn`}
                style={{ animationDelay: "0.3s" }}
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center shadow-lg`}>
                      <Star className="w-6 h-6 text-white fill-white" />
                    </div>
                    <div>
                      <h3 className={`text-xl font-black ${tema.colores.texto}`}>
                        Satisfacción del Paciente
                      </h3>
                      <p className={`text-sm font-semibold ${tema.colores.textoSecundario}`}>
                        Evaluación en tiempo real por categorías
                      </p>
                    </div>
                  </div>
                </div>

                {datosGraficos.satisfaccion.length === 0 ? (
                  <div className="flex items-center justify-center h-[300px]">
                    <div className="text-center">
                      <Star className={`w-12 h-12 mx-auto mb-3 ${tema.colores.textoSecundario} animate-pulse`} />
                      <p className={`text-sm font-semibold ${tema.colores.textoSecundario}`}>
                        Sin evaluaciones disponibles
                      </p>
                      <p className={`text-xs ${tema.colores.textoSecundario} mt-1`}>
                        Las evaluaciones aparecerán aquí
                      </p>
                    </div>
                  </div>
                ) : (
                  <>
                    <ResponsiveContainer width="100%" height={300}>
                      <RadarChart data={datosGraficos.satisfaccion}>
                        <PolarGrid stroke="rgba(99, 102, 241, 0.2)" />
                        <PolarAngleAxis
                          dataKey="categoria"
                          stroke={tema.colores.textoSecundario}
                          style={{ fontSize: "12px", fontWeight: 600 }}
                        />
                        <PolarRadiusAxis
                          angle={90}
                          domain={[0, 100]}
                          stroke={tema.colores.textoSecundario}
                          style={{ fontSize: "10px" }}
                        />
                        <Radar
                          name="Tu Puntuación"
                          dataKey="valor"
                          stroke="#f59e0b"
                          fill="#f59e0b"
                          fillOpacity={0.6}
                          animationDuration={1000}
                        />
                        <Radar
                          name="Promedio del Sector"
                          dataKey="promedio_sector"
                          stroke="#6366f1"
                          fill="#6366f1"
                          fillOpacity={0.3}
                          animationDuration={1000}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend wrapperStyle={{ fontSize: "12px", fontWeight: 600 }} />
                      </RadarChart>
                    </ResponsiveContainer>

                    <div className={`mt-4 space-y-2 pt-4 border-t ${tema.colores.borde}`}>
                      {datosGraficos.satisfaccion.map((item, index) => (
                        <div
                          key={index}
                          className={`flex items-center justify-between p-3 rounded-lg ${tema.colores.secundario} hover:scale-105 transition-all duration-300`}
                        >
                          <span className={`text-sm font-semibold ${tema.colores.texto}`}>
                            {item.categoria}
                          </span>
                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-1">
                              <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                              <span className={`text-sm font-bold ${tema.colores.texto}`}>
                                {item.valor}%
                              </span>
                            </div>
                            <span className={`text-xs ${tema.colores.textoSecundario}`}>
                              ({item.total_evaluaciones} eval.)
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>

              {/* GRÁFICO DE PACIENTES DINÁMICO */}
              <div
                className={`rounded-2xl p-6 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} animate-fadeIn`}
                style={{ animationDelay: "0.4s" }}
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-xl flex items-center justify-center shadow-lg`}>
                      <Users className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className={`text-xl font-black ${tema.colores.texto}`}>
                        Crecimiento de Pacientes
                      </h3>
                      <p className={`text-sm font-semibold ${tema.colores.textoSecundario}`}>
                        Nuevos vs Recurrentes en tiempo real
                      </p>
                    </div>
                  </div>
                </div>

                {datosGraficos.pacientes.length === 0 ? (
                  <div className="flex items-center justify-center h-[300px]">
                    <div className="text-center">
                      <Users className={`w-12 h-12 mx-auto mb-3 ${tema.colores.textoSecundario} animate-pulse`} />
                      <p className={`text-sm font-semibold ${tema.colores.textoSecundario}`}>
                        Sin datos de pacientes
                      </p>
                      <p className={`text-xs ${tema.colores.textoSecundario} mt-1`}>
                        Los datos se actualizarán automáticamente
                      </p>
                    </div>
                  </div>
                ) : (
                  <>
                    <ResponsiveContainer width="100%" height={300}>
                      <ComposedChart data={datosGraficos.pacientes}>
                        <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                        <XAxis
                          dataKey="mes"
                          stroke={tema.colores.textoSecundario}
                          style={{ fontSize: "12px", fontWeight: 600 }}
                        />
                        <YAxis
                          stroke={tema.colores.textoSecundario}
                          style={{ fontSize: "12px", fontWeight: 600 }}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend wrapperStyle={{ fontSize: "12px", fontWeight: 600 }} />
                        <Bar
                          dataKey="nuevos"
                          fill="#06b6d4"
                          name="Nuevos"
                          radius={[8, 8, 0, 0]}
                          animationDuration={1000}
                        />
                        <Bar
                          dataKey="recurrentes"
                          fill="#8b5cf6"
                          name="Recurrentes"
                          radius={[8, 8, 0, 0]}
                          animationDuration={1000}
                        />
                        <Line
                          type="monotone"
                          dataKey="total"
                          stroke="#f59e0b"
                          strokeWidth={3}
                          name="Total"
                          dot={{ r: 5 }}
                          animationDuration={1000}
                        />
                      </ComposedChart>
                    </ResponsiveContainer>

                    <div className={`mt-4 grid grid-cols-3 gap-3 pt-4 border-t ${tema.colores.borde}`}>
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-1 mb-1">
                          <Plus className="w-4 h-4 text-cyan-400" />
                          <p className={`text-xs font-bold ${tema.colores.textoSecundario}`}>
                            Nuevos
                          </p>
                        </div>
                        <p className={`text-2xl font-black ${tema.colores.texto}`}>
                          {datosGraficos.pacientes.reduce((sum, d) => sum + d.nuevos, 0)}
                        </p>
                      </div>
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-1 mb-1">
                          <RefreshCw className="w-4 h-4 text-purple-400" />
                          <p className={`text-xs font-bold ${tema.colores.textoSecundario}`}>
                            Recurrentes
                          </p>
                        </div>
                        <p className={`text-2xl font-black ${tema.colores.texto}`}>
                          {datosGraficos.pacientes.reduce((sum, d) => sum + d.recurrentes, 0)}
                        </p>
                      </div>
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-1 mb-1">
                          <Users className="w-4 h-4 text-orange-400" />
                          <p className={`text-xs font-bold ${tema.colores.textoSecundario}`}>
                            Total
                          </p>
                        </div>
                        <p className={`text-2xl font-black ${tema.colores.texto}`}>
                          {datosGraficos.pacientes.reduce((sum, d) => sum + d.total, 0)}
                        </p>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* GRÁFICO DE HORARIOS DINÁMICO */}
              <div
                className={`rounded-2xl p-6 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} animate-fadeIn`}
                style={{ animationDelay: "0.5s" }}
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 bg-gradient-to-br from-pink-500 to-rose-500 rounded-xl flex items-center justify-center shadow-lg`}>
                      <Clock className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className={`text-xl font-black ${tema.colores.texto}`}>
                        Distribución por Horario
                      </h3>
                      <p className={`text-sm font-semibold ${tema.colores.textoSecundario}`}>
                        Consultas por franja horaria
                      </p>
                    </div>
                  </div>
                </div>

                {datosGraficos.horarios.length === 0 ? (
                  <div className="flex items-center justify-center h-[300px]">
                    <div className="text-center">
                      <Clock className={`w-12 h-12 mx-auto mb-3 ${tema.colores.textoSecundario} animate-pulse`} />
                      <p className={`text-sm font-semibold ${tema.colores.textoSecundario}`}>
                        Sin datos de horarios
                      </p>
                      <p className={`text-xs ${tema.colores.textoSecundario} mt-1`}>
                        Los datos se cargarán automáticamente
                      </p>
                    </div>
                  </div>
                ) : (
                  <>
                    <ResponsiveContainer width="100%" height={300}>
                      <RechartsBarChart data={datosGraficos.horarios}>
                        <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                        <XAxis
                          dataKey="hora"
                          stroke={tema.colores.textoSecundario}
                          style={{ fontSize: "12px", fontWeight: 600 }}
                        />
                        <YAxis
                          stroke={tema.colores.textoSecundario}
                          style={{ fontSize: "12px", fontWeight: 600 }}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend wrapperStyle={{ fontSize: "12px", fontWeight: 600 }} />
                        <Bar
                          dataKey="consultas"
                          fill="#ec4899"
                          name="Consultas"
                          radius={[8, 8, 0, 0]}
                          animationDuration={1000}
                        />
                      </RechartsBarChart>
                    </ResponsiveContainer>

                    <div className={`mt-4 p-4 rounded-lg ${tema.colores.secundario}`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Clock className={`w-5 h-5 ${tema.colores.acento}`} />
                          <span className={`text-sm font-bold ${tema.colores.texto}`}>
                            Horario más ocupado:
                          </span>
                        </div>
                        <span className={`text-lg font-black ${tema.colores.acento}`}>
                          {datosGraficos.horarios.reduce((max, h) =>
                            h.consultas > max.consultas ? h : max
                          ).hora}
                        </span>
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center gap-2">
                          <Activity className={`w-5 h-5 ${tema.colores.acento}`} />
                          <span className={`text-sm font-bold ${tema.colores.texto}`}>
                            Duración promedio:
                          </span>
                        </div>
                        <span className={`text-lg font-black ${tema.colores.acento}`}>
                          {Math.round(
                            datosGraficos.horarios.reduce(
                              (sum, h) => sum + h.duracion_promedio,
                              0
                            ) / datosGraficos.horarios.length
                          )}{" "}
                          min
                        </span>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* ========================================
                MÉTRICAS DE RENDIMIENTO DINÁMICAS
                ======================================== */}
            {metricasRendimiento.length > 0 && (
              <div
                className={`rounded-2xl p-6 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} mb-8 animate-fadeIn`}
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className={`w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg`}>
                    <BarChart3 className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h3 className={`text-2xl font-black ${tema.colores.texto}`}>
                      Métricas de Rendimiento en Tiempo Real
                    </h3>
                    <p className={`text-sm font-semibold ${tema.colores.textoSecundario}`}>
                      Comparativa con periodo anterior
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {metricasRendimiento.map((metrica, index) => (
                    <div
                      key={index}
                      className={`p-5 rounded-xl ${tema.colores.card} ${tema.colores.borde} border transition-all duration-300 hover:scale-105 hover:-translate-y-2 ${tema.colores.sombra} cursor-pointer group animate-fadeIn`}
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div
                          className={`w-12 h-12 bg-gradient-to-br ${metrica.color} rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}
                        >
                          <metrica.icono className="w-6 h-6 text-white" />
                        </div>
                        {obtenerIconoTendencia(metrica.tendencia)}
                      </div>

                      <div className={`text-4xl font-black mb-2 ${tema.colores.texto}`}>
                        {metrica.valor_actual}
                        <span className="text-xl">{metrica.unidad}</span>
                      </div>

                      <p className={`text-sm font-bold mb-3 ${tema.colores.textoSecundario}`}>
                        {metrica.nombre}
                      </p>

                      <div className="flex items-center gap-2 mb-2">
                        <span
                          className={`text-sm font-bold ${
                            metrica.tendencia === "up"
                              ? "text-green-400"
                              : metrica.tendencia === "down"
                              ? "text-red-400"
                              : "text-gray-400"
                          }`}
                        >
                          {metrica.tendencia === "up" ? "+" : ""}
                          {metrica.porcentaje_cambio}%
                        </span>
                        <span className={`text-xs ${tema.colores.textoSecundario}`}>
                          vs {metrica.valor_anterior}
                          {metrica.unidad}
                        </span>
                      </div>

                      <p className={`text-xs ${tema.colores.textoSecundario} line-clamp-2`}>
                        {metrica.descripcion}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

{/* CONTINUARÁ CON ACCESOS RÁPIDOS Y ACTIVIDADES... */}
            {/* ========================================
                ACCESOS RÁPIDOS PREMIUM DINÁMICOS
                ======================================== */}
            <div
              className={`rounded-2xl p-6 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} mb-8 animate-fadeIn`}
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className={`w-14 h-14 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-xl flex items-center justify-center shadow-lg`}>
                    <Zap className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h3 className={`text-2xl font-black ${tema.colores.texto}`}>
                      Accesos Rápidos Premium
                    </h3>
                    <p className={`text-sm font-semibold ${tema.colores.textoSecundario}`}>
                      Acciones frecuentes al alcance de un clic
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`text-xs font-semibold ${tema.colores.textoSecundario}`}>
                    Sistema en línea
                  </span>
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                {/* Nueva Consulta */}
                <Link
                  href="/medico/consultas/nueva"
                  className={`group p-6 rounded-xl ${tema.colores.card} ${tema.colores.borde} border transition-all duration-300 hover:scale-105 hover:-translate-y-2 ${tema.colores.sombra} text-center relative overflow-hidden animate-fadeIn`}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className={`relative w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center mx-auto mb-3 shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-transform`}>
                    <ClipboardCheck className="w-7 h-7 text-white" />
                    {estadisticas && estadisticas.citas_pendientes > 0 && (
                      <span className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center animate-bounce">
                        {estadisticas.citas_pendientes}
                      </span>
                    )}
                  </div>
                  <p className={`relative text-sm font-bold ${tema.colores.texto} group-hover:${tema.colores.acento} transition-colors`}>
                    Nueva Consulta
                  </p>
                  <p className={`relative text-xs ${tema.colores.textoSecundario} mt-1`}>
                    Iniciar atención
                  </p>
                </Link>

                {/* Receta Médica */}
                <Link
                  href="/medico/recetas/nueva"
                  className={`group p-6 rounded-xl ${tema.colores.card} ${tema.colores.borde} border transition-all duration-300 hover:scale-105 hover:-translate-y-2 ${tema.colores.sombra} text-center relative overflow-hidden animate-fadeIn`}
                  style={{ animationDelay: "0.05s" }}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-emerald-500/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className={`relative w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center mx-auto mb-3 shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-transform`}>
                    <Pill className="w-7 h-7 text-white" />
                  </div>
                  <p className={`relative text-sm font-bold ${tema.colores.texto} group-hover:${tema.colores.acento} transition-colors`}>
                    Receta Médica
                  </p>
                  <p className={`relative text-xs ${tema.colores.textoSecundario} mt-1`}>
                    Emitir receta
                  </p>
                </Link>

                {/* Orden de Examen */}
                <Link
                  href="/medico/examenes/orden"
                  className={`group p-6 rounded-xl ${tema.colores.card} ${tema.colores.borde} border transition-all duration-300 hover:scale-105 hover:-translate-y-2 ${tema.colores.sombra} text-center relative overflow-hidden animate-fadeIn`}
                  style={{ animationDelay: "0.1s" }}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className={`relative w-14 h-14 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center mx-auto mb-3 shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-transform`}>
                    <TestTube className="w-7 h-7 text-white" />
                  </div>
                  <p className={`relative text-sm font-bold ${tema.colores.texto} group-hover:${tema.colores.acento} transition-colors`}>
                    Orden Examen
                  </p>
                  <p className={`relative text-xs ${tema.colores.textoSecundario} mt-1`}>
                    Solicitar exámenes
                  </p>
                </Link>

                {/* Certificado Médico */}
                <Link
                  href="/medico/certificados/nuevo"
                  className={`group p-6 rounded-xl ${tema.colores.card} ${tema.colores.borde} border transition-all duration-300 hover:scale-105 hover:-translate-y-2 ${tema.colores.sombra} text-center relative overflow-hidden animate-fadeIn`}
                  style={{ animationDelay: "0.15s" }}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className={`relative w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mx-auto mb-3 shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-transform`}>
                    <FileText className="w-7 h-7 text-white" />
                  </div>
                  <p className={`relative text-sm font-bold ${tema.colores.texto} group-hover:${tema.colores.acento} transition-colors`}>
                    Certificado
                  </p>
                  <p className={`relative text-xs ${tema.colores.textoSecundario} mt-1`}>
                    Emitir certificado
                  </p>
                </Link>

                {/* Interconsulta */}
                <Link
                  href="/medico/interconsultas/nueva"
                  className={`group p-6 rounded-xl ${tema.colores.card} ${tema.colores.borde} border transition-all duration-300 hover:scale-105 hover:-translate-y-2 ${tema.colores.sombra} text-center relative overflow-hidden animate-fadeIn`}
                  style={{ animationDelay: "0.2s" }}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-red-500/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className={`relative w-14 h-14 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center mx-auto mb-3 shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-transform`}>
                    <Handshake className="w-7 h-7 text-white" />
                    {estadisticas && estadisticas.interconsultas_pendientes > 0 && (
                      <span className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center animate-bounce">
                        {estadisticas.interconsultas_pendientes}
                      </span>
                    )}
                  </div>
                  <p className={`relative text-sm font-bold ${tema.colores.texto} group-hover:${tema.colores.acento} transition-colors`}>
                    Interconsulta
                  </p>
                  <p className={`relative text-xs ${tema.colores.textoSecundario} mt-1`}>
                    Derivar paciente
                  </p>
                </Link>

                {/* Telemedicina */}
                <Link
                  href="/medico/telemedicina"
                  className={`group p-6 rounded-xl ${tema.colores.card} ${tema.colores.borde} border transition-all duration-300 hover:scale-105 hover:-translate-y-2 ${tema.colores.sombra} text-center relative overflow-hidden animate-fadeIn`}
                  style={{ animationDelay: "0.25s" }}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-teal-500/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className={`relative w-14 h-14 bg-gradient-to-br from-cyan-500 to-teal-500 rounded-xl flex items-center justify-center mx-auto mb-3 shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-transform`}>
                    <Video className="w-7 h-7 text-white" />
                    {estadisticas && estadisticas.telemedicina_activas > 0 && (
                      <span className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 text-white text-xs font-bold rounded-full flex items-center justify-center animate-pulse">
                        {estadisticas.telemedicina_activas}
                      </span>
                    )}
                  </div>
                  <p className={`relative text-sm font-bold ${tema.colores.texto} group-hover:${tema.colores.acento} transition-colors`}>
                    Telemedicina
                  </p>
                  <p className={`relative text-xs ${tema.colores.textoSecundario} mt-1`}>
                    Sala virtual
                  </p>
                </Link>

                {/* Mis Pacientes */}
                <Link
                  href="/medico/pacientes"
                  className={`group p-6 rounded-xl ${tema.colores.card} ${tema.colores.borde} border transition-all duration-300 hover:scale-105 hover:-translate-y-2 ${tema.colores.sombra} text-center relative overflow-hidden animate-fadeIn`}
                  style={{ animationDelay: "0.3s" }}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className={`relative w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center mx-auto mb-3 shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-transform`}>
                    <Users className="w-7 h-7 text-white" />
                  </div>
                  <p className={`relative text-sm font-bold ${tema.colores.texto} group-hover:${tema.colores.acento} transition-colors`}>
                    Mis Pacientes
                  </p>
                  <p className={`relative text-xs ${tema.colores.textoSecundario} mt-1`}>
                    {estadisticas?.total_pacientes || 0} activos
                  </p>
                </Link>

                {/* Mi Agenda */}
                <Link
                  href="/medico/agenda"
                  className={`group p-6 rounded-xl ${tema.colores.card} ${tema.colores.borde} border transition-all duration-300 hover:scale-105 hover:-translate-y-2 ${tema.colores.sombra} text-center relative overflow-hidden animate-fadeIn`}
                  style={{ animationDelay: "0.35s" }}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-pink-500/10 to-rose-500/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className={`relative w-14 h-14 bg-gradient-to-br from-pink-500 to-rose-500 rounded-xl flex items-center justify-center mx-auto mb-3 shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-transform`}>
                    <Calendar className="w-7 h-7 text-white" />
                  </div>
                  <p className={`relative text-sm font-bold ${tema.colores.texto} group-hover:${tema.colores.acento} transition-colors`}>
                    Mi Agenda
                  </p>
                  <p className={`relative text-xs ${tema.colores.textoSecundario} mt-1`}>
                    {estadisticas?.citas_hoy || 0} citas hoy
                  </p>
                </Link>

                {/* Biblioteca Médica */}
                <Link
                  href="/medico/biblioteca"
                  className={`group p-6 rounded-xl ${tema.colores.card} ${tema.colores.borde} border transition-all duration-300 hover:scale-105 hover:-translate-y-2 ${tema.colores.sombra} text-center relative overflow-hidden animate-fadeIn`}
                  style={{ animationDelay: "0.4s" }}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/10 to-orange-500/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className={`relative w-14 h-14 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center mx-auto mb-3 shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-transform`}>
                    <GraduationCap className="w-7 h-7 text-white" />
                  </div>
                  <p className={`relative text-sm font-bold ${tema.colores.texto} group-hover:${tema.colores.acento} transition-colors`}>
                    Biblioteca
                  </p>
                  <p className={`relative text-xs ${tema.colores.textoSecundario} mt-1`}>
                    Recursos médicos
                  </p>
                </Link>

                {/* Mensajes */}
                <Link
                  href="/medico/mensajes"
                  className={`group p-6 rounded-xl ${tema.colores.card} ${tema.colores.borde} border transition-all duration-300 hover:scale-105 hover:-translate-y-2 ${tema.colores.sombra} text-center relative overflow-hidden animate-fadeIn`}
                  style={{ animationDelay: "0.45s" }}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-green-500/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className={`relative w-14 h-14 bg-gradient-to-br from-emerald-500 to-green-500 rounded-xl flex items-center justify-center mx-auto mb-3 shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-transform`}>
                    <MessageSquare className="w-7 h-7 text-white" />
                    {estadisticas && estadisticas.mensajes_sin_leer > 0 && (
                      <span className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center animate-bounce">
                        {estadisticas.mensajes_sin_leer > 9 ? "9+" : estadisticas.mensajes_sin_leer}
                      </span>
                    )}
                  </div>
                  <p className={`relative text-sm font-bold ${tema.colores.texto} group-hover:${tema.colores.acento} transition-colors`}>
                    Mensajes
                  </p>
                  <p className={`relative text-xs ${tema.colores.textoSecundario} mt-1`}>
                    Comunicación
                  </p>
                </Link>

                {/* Estadísticas */}
                <Link
                  href="/medico/estadisticas"
                  className={`group p-6 rounded-xl ${tema.colores.card} ${tema.colores.borde} border transition-all duration-300 hover:scale-105 hover:-translate-y-2 ${tema.colores.sombra} text-center relative overflow-hidden animate-fadeIn`}
                  style={{ animationDelay: "0.5s" }}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-violet-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className={`relative w-14 h-14 bg-gradient-to-br from-violet-500 to-purple-500 rounded-xl flex items-center justify-center mx-auto mb-3 shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-transform`}>
                    <BarChart3 className="w-7 h-7 text-white" />
                  </div>
                  <p className={`relative text-sm font-bold ${tema.colores.texto} group-hover:${tema.colores.acento} transition-colors`}>
                    Estadísticas
                  </p>
                  <p className={`relative text-xs ${tema.colores.textoSecundario} mt-1`}>
                    Análisis avanzado
                  </p>
                </Link>

                {/* Configuración */}
                <Link
                  href="/medico/configuracion"
                  className={`group p-6 rounded-xl ${tema.colores.card} ${tema.colores.borde} border transition-all duration-300 hover:scale-105 hover:-translate-y-2 ${tema.colores.sombra} text-center relative overflow-hidden animate-fadeIn`}
                  style={{ animationDelay: "0.55s" }}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-gray-500/10 to-slate-500/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className={`relative w-14 h-14 bg-gradient-to-br from-gray-500 to-slate-500 rounded-xl flex items-center justify-center mx-auto mb-3 shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-transform`}>
                    <Settings className="w-7 h-7 text-white" />
                  </div>
                  <p className={`relative text-sm font-bold ${tema.colores.texto} group-hover:${tema.colores.acento} transition-colors`}>
                    Configuración
                  </p>
                  <p className={`relative text-xs ${tema.colores.textoSecundario} mt-1`}>
                    Personalizar
                  </p>
                </Link>
              </div>
            </div>

            {/* ========================================
                ACTIVIDADES RECIENTES DINÁMICAS
                ======================================== */}
            {actividadesRecientes.length > 0 && (
              <div
                className={`rounded-2xl p-6 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} mb-8 animate-fadeIn`}
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className={`w-14 h-14 bg-gradient-to-br from-pink-500 to-rose-500 rounded-xl flex items-center justify-center shadow-lg`}>
                      <Activity className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <h3 className={`text-2xl font-black ${tema.colores.texto}`}>
                        Actividad Reciente en Tiempo Real
                      </h3>
                      <p className={`text-sm font-semibold ${tema.colores.textoSecundario}`}>
                        Últimas {actividadesRecientes.length} acciones en el sistema
                      </p>
                    </div>
                  </div>

                  <Link
                    href="/medico/historial"
                    className={`px-6 py-3 ${tema.colores.secundario} ${tema.colores.texto} rounded-xl font-bold transition-all duration-300 hover:scale-105 flex items-center gap-2`}
                  >
                    Ver Historial Completo
                    <ChevronRight className="w-5 h-5" />
                  </Link>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {actividadesRecientes.map((actividad, index) => (
                    <div
                      key={actividad.id}
                      className={`flex items-start gap-4 p-5 rounded-xl ${tema.colores.card} ${tema.colores.borde} border transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1 ${tema.colores.sombra} group animate-fadeIn`}
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <div
                        className={`w-12 h-12 bg-gradient-to-br ${actividad.color} rounded-xl flex items-center justify-center shadow-lg flex-shrink-0 group-hover:scale-110 transition-transform`}
                      >
                        <actividad.icono className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm font-bold ${tema.colores.texto} mb-1`}>
                              {actividad.descripcion}
                            </p>
                            <div className="flex items-center gap-3 text-xs">
                              <span className={`flex items-center gap-1 ${tema.colores.textoSecundario}`}>
                                <User className="w-3 h-3" />
                                {actividad.usuario}
                              </span>
                              <span className={tema.colores.textoSecundario}>·</span>
                              <span className={`font-semibold ${tema.colores.acento}`}>
                                {formatearFechaRelativa(actividad.fecha_hora)}
                              </span>
                            </div>
                          </div>
                          <span
                            className={`px-2 py-1 rounded-lg text-xs font-bold ${tema.colores.secundario} ${tema.colores.texto} ml-2`}
                          >
                            {actividad.tipo}
                          </span>
                        </div>

                        {actividad.detalles && (
                          <div className={`mt-2 p-3 rounded-lg ${tema.colores.secundario}`}>
                            <div className="flex items-center gap-2 text-xs">
                              <Info className={`w-3 h-3 ${tema.colores.acento}`} />
                              <span className={`font-semibold ${tema.colores.textoSecundario}`}>
                                Detalles adicionales disponibles
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {actividadesRecientes.length === 0 && (
                  <div className="text-center py-16">
                    <Activity className={`w-16 h-16 mx-auto mb-4 ${tema.colores.textoSecundario} animate-pulse`} />
                    <p className={`text-xl font-bold ${tema.colores.texto} mb-2`}>
                      Sin actividades recientes
                    </p>
                    <p className={`text-sm ${tema.colores.textoSecundario}`}>
                      Las actividades aparecerán aquí en tiempo real
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* ========================================
                RESUMEN DEL DÍA PREMIUM
                ======================================== */}
            {estadisticas && (
              <div
                className={`rounded-2xl p-6 bg-gradient-to-br ${tema.colores.gradiente} ${tema.colores.sombra} mb-8 animate-fadeIn`}
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center shadow-lg backdrop-blur-sm">
                      <Sparkles className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-black text-white">
                        Resumen Premium del Día
                      </h3>
                      <p className="text-sm font-semibold text-white/80">
                        Tu rendimiento en números
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => cargarDatosDashboard()}
                    className="px-6 py-3 bg-white/20 hover:bg-white/30 text-white rounded-xl font-bold transition-all duration-300 hover:scale-105 backdrop-blur-sm flex items-center gap-2"
                  >
                    <RefreshCw className={`w-5 h-5 ${loadingData ? "animate-spin" : ""}`} />
                    Actualizar
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle2 className="w-5 h-5 text-white" />
                      <p className="text-xs font-bold text-white/80">Completadas</p>
                    </div>
                    <p className="text-3xl font-black text-white">
                      {estadisticas.citas_completadas_hoy}
                    </p>
                  </div>

                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="w-5 h-5 text-white" />
                      <p className="text-xs font-bold text-white/80">Pendientes</p>
                    </div>
                    <p className="text-3xl font-black text-white">
                      {estadisticas.citas_pendientes}
                    </p>
                  </div>

                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                    <div className="flex items-center gap-2 mb-2">
                      <Pill className="w-5 h-5 text-white" />
                      <p className="text-xs font-bold text-white/80">Recetas</p>
                    </div>
                    <p className="text-3xl font-black text-white">
                      {estadisticas.recetas_emitidas_mes}
                    </p>
                  </div>

                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                    <div className="flex items-center gap-2 mb-2">
                      <TestTube className="w-5 h-5 text-white" />
                      <p className="text-xs font-bold text-white/80">Exámenes</p>
                    </div>
                    <p className="text-3xl font-black text-white">
                      {estadisticas.ordenes_examen_mes}
                    </p>
                  </div>

                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                    <div className="flex items-center gap-2 mb-2">
                      <Video className="w-5 h-5 text-white" />
                      <p className="text-xs font-bold text-white/80">Telemedicina</p>
                    </div>
                    <p className="text-3xl font-black text-white">
                      {estadisticas.telemedicina_activas}
                    </p>
                  </div>

                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                    <div className="flex items-center gap-2 mb-2">
                      <Star className="w-5 h-5 text-white fill-white" />
                      <p className="text-xs font-bold text-white/80">Rating</p>
                    </div>
                    <p className="text-3xl font-black text-white">
                      {estadisticas.calificacion_promedio.toFixed(1)}
                    </p>
                  </div>
                </div>

                <div className="mt-6 flex items-center justify-between">
                  <p className="text-sm font-semibold text-white/80">
                    ¡Excelente trabajo hoy, Dr. {usuario.nombre}! 🎉
                  </p>
                  <Link
                    href="/medico/estadisticas"
                    className="text-sm font-bold text-white hover:underline flex items-center gap-1"
                  >
                    Ver estadísticas detalladas
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            )}
          </>
        )}
      </main>

      {/* ========================================
          FOOTER PREMIUM
          ======================================== */}
      <footer
        className={`transition-all duration-300 ${
          sidebarAbierto ? "ml-72" : "ml-20"
        } ${tema.colores.card} ${tema.colores.borde} border-t py-8 mt-12`}
      >
        <div className="max-w-[1920px] mx-auto px-8">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
            {/* Logo y Copyright */}
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 bg-gradient-to-br ${tema.colores.gradiente} rounded-xl flex items-center justify-center shadow-lg`}>
                <Stethoscope className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className={`text-sm font-bold ${tema.colores.texto}`}>
                  © 2025 AnyssaMed Platform
                </p>
                <p className={`text-xs ${tema.colores.textoSecundario}`}>
                  Sistema Médico Premium - Todos los derechos reservados
                </p>
              </div>
            </div>

            {/* Version y Status */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className={`text-xs font-semibold ${tema.colores.textoSecundario}`}>
                  Sistema Operativo
                </span>
              </div>
              <span
                className={`px-4 py-2 rounded-full text-xs font-bold bg-gradient-to-r ${tema.colores.gradiente} text-white shadow-lg`}
              >
                v4.0.0 Premium
              </span>
            </div>

            {/* Links del Footer */}
            <div className="flex items-center gap-6">
              <Link
                href="/medico/ayuda"
                className={`text-sm font-bold transition-colors ${tema.colores.textoSecundario} hover:${tema.colores.acento} flex items-center gap-1`}
              >
                <Lightbulb className="w-4 h-4" />
                Centro de Ayuda
              </Link>
              <Link
                href="/privacidad"
                className={`text-sm font-bold transition-colors ${tema.colores.textoSecundario} hover:${tema.colores.acento} flex items-center gap-1`}
              >
                <Shield className="w-4 h-4" />
                Privacidad
              </Link>
              <Link
                href="/terminos"
                className={`text-sm font-bold transition-colors ${tema.colores.textoSecundario} hover:${tema.colores.acento} flex items-center gap-1`}
              >
                <FileText className="w-4 h-4" />
                Términos
              </Link>
              <button
                onClick={cerrarSesion}
                className="text-sm font-bold text-red-400 hover:text-red-300 transition-colors flex items-center gap-1"
              >
                <LogOut className="w-4 h-4" />
                Cerrar Sesión
              </button>
            </div>
          </div>

          {/* Información Adicional */}
<div
  className={`mt-6 pt-6 border-t ${tema.colores.borde} flex flex-col sm:flex-row items-center justify-between gap-4`}
>
  <p className={`text-xs ${tema.colores.textoSecundario} text-center sm:text-left`}>
    Sistema certificado bajo normativas ISO 27001 · HIPAA Compliant · Datos encriptados con AES-256
  </p>
  <div className="flex items-center gap-4">
    <a
      href="https://www.supersalud.gob.cl"
      target="_blank"
      rel="noopener noreferrer"
      className={`text-xs font-semibold ${tema.colores.acento} hover:underline`}
    >
      Superintendencia de Salud
    </a>
    <span className={`text-xs ${tema.colores.textoSecundario}`}>·</span>
    <a
      href="mailto:soporte@anyssamed.cl"
      className={`text-xs font-semibold ${tema.colores.acento} hover:underline`}
    >
      Soporte Técnico 24/7
    </a>
  </div>
</div>

        </div>
      </footer>

      {/* ========================================
          ESTILOS PERSONALIZADOS PREMIUM
          ======================================== */}
      <style jsx global>{`
        @keyframes wave {
          0%,
          100% {
            transform: rotate(0deg);
          }
          25% {
            transform: rotate(20deg);
          }
          75% {
            transform: rotate(-20deg);
          }
        }

        .animate-wave {
          animation: wave 1s ease-in-out infinite;
        }

        .animate-pulse-slow {
          animation: pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }

        .animate-spin-slow {
          animation: spin 3s linear infinite;
        }

        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }

        .custom-scrollbar::-webkit-scrollbar-track {
          background: ${["dark", "blue", "purple", "green"].includes(temaActual)
            ? "rgba(31, 41, 55, 0.5)"
            : "rgba(243, 244, 246, 0.5)"};
          border-radius: 10px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: ${["dark", "blue", "purple", "green"].includes(temaActual)
            ? "rgba(99, 102, 241, 0.5)"
            : "rgba(99, 102, 241, 0.7)"};
          border-radius: 10px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: ${["dark", "blue", "purple", "green"].includes(temaActual)
            ? "rgba(99, 102, 241, 0.7)"
            : "rgba(99, 102, 241, 0.9)"};
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

        .animate-fadeIn {
          animation: fadeIn 0.6s ease-out forwards;
        }

        @keyframes gradient {
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

        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 3s ease infinite;
        }

        .glass {
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        @keyframes shimmer {
          0% {
            background-position: -1000px 0;
          }
          100% {
            background-position: 1000px 0;
          }
        }

        .animate-shimmer {
          animation: shimmer 2s infinite;
          background: linear-gradient(
            to right,
            transparent 0%,
            rgba(255, 255, 255, 0.1) 50%,
            transparent 100%
          );
          background-size: 1000px 100%;
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

        .animate-float {
          animation: float 3s ease-in-out infinite;
        }

        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
}
