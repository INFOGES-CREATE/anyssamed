"use client";

import { useState, useEffect, useMemo } from "react";
import { usePathname } from "next/navigation";

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
  CalendarClock,
  CalendarDays,
  CalendarPlus,
  CalendarRange,
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
  TargetIcon,
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
  PhoneIncoming,
  PhoneOutgoing,
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
  Sparkles,
  Star,
  Stethoscope,
  Sun,
  Target,
  TrendingDown,
  TrendingUp,
  Upload,
  User,
  UserCheck,
  UserCog,
  UserPlus,
  Users,
  Video,
  Wifi,
  WifiOff,
  X,
  Zap,
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
  Rocket,
  CheckSquare,
  Square,
  Clock3,
  AlertOctagon,
  UserX,
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
  secretaria?: {
    id_secretaria: number;
    id_centro: number;
    id_sucursal: number | null;
    id_departamento: number | null;
    extension_telefonica: string | null;
    estado: "activo" | "inactivo" | "suspendido" | "vacaciones";
    jornada: "completa" | "media" | "parcial";
    centro: {
      id_centro: number;
      nombre: string;
      logo_url: string | null;
      ciudad: string;
      region: string;
    };
  };
}

interface EstadisticasSecretaria {
  citas_programadas_hoy: number;
  citas_pendientes_confirmacion: number;
  citas_confirmadas_hoy: number;
  citas_canceladas_hoy: number;
  llamadas_realizadas_hoy: number;
  llamadas_pendientes: number;
  pacientes_atendidos_semana: number;
  pacientes_nuevos_mes: number;
  mensajes_sin_leer: number;
  recordatorios_enviados_hoy: number;
  medicos_activos: number;
  tareas_pendientes: number;
  documentos_procesados_semana: number;
  consultas_telemedicina_hoy: number;
}

interface MedicoAsignado {
  id_profesional: number;
  nombre_completo: string;
  especialidad: string;
  foto_url: string | null;
  es_principal: boolean;
  citas_hoy: number;
  proxima_cita: string | null;
  disponible_ahora: boolean;
  extension_telefonica: string | null;
  email: string;
}

interface NotificacionSecretaria {
  id_notificacion: number;
  tipo: "cita_nueva" | "cancelacion" | "urgente" | "mensaje" | "recordatorio";
  titulo: string;
  descripcion: string;
  fecha_hora: string;
  leida: boolean;
  prioridad: "baja" | "media" | "alta";
  url_accion: string | null;
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

interface DatoGraficoSerie {
  etiqueta: string;
  valor1: number;
  valor2?: number;
  valor3?: number;
}

interface DatoLlamadasCanal {
  canal: string;
  realizadas: number;
  exitosas: number;
}

interface DatoDistribucionTipoCita {
  nombre: string;
  valor: number;
  color: string;
}

interface FiltrosReporte {
  periodo: "hoy" | "semana" | "mes" | "trimestre" | "anio" | "personalizado";
  fechaInicio: string | null;
  fechaFin: string | null;
  tipo:
    | "general"
    | "citas"
    | "llamadas"
    | "telemedicina"
    | "productividad"
    | "pacientes";
  centroId: number | "todos";
  medicoId: number | "todos" | null;
  canal:
    | "todos"
    | "presencial"
    | "telemedicina"
    | "telefono"
    | "whatsapp"
    | "sms"
    | "email";
}

interface ResumenReportes {
  total_citas: number;
  total_llamadas: number;
  total_telemedicina: number;
  total_pacientes_unicos: number;
  tasa_confirmacion: number;
  tasa_inasistencia: number;
  productividad_secretaria: number;
  periodo_desde: string;
  periodo_hasta: string;
}

interface FilaDetalleReporte {
  fecha: string;
  centro: string;
  medico: string;
  tipo: string;
  total_citas: number;
  confirmadas: number;
  canceladas: number;
  telemedicina: number;
  llamadas: number;
  asistencia: number;
  inasistencias: number;
}

interface ReporteGuardado {
  id_reporte: number;
  nombre: string;
  descripcion: string;
  tipo: string;
  periodo: string;
  creado_por: string;
  fecha_creacion: string;
  ultimo_uso: string | null;
  formato_preferido: "pantalla" | "pdf" | "excel";
  favorito: boolean;
}

interface MenuItem {
  titulo: string;
  icono: any;
  url: string;
  badge?: number;
  submenu?: MenuItem[];
  activo?: boolean;
}

// ========================================
// CONFIGURACIONES DE TEMAS
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
    icono: Users,
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
// COMPONENTE PRINCIPAL
// ========================================

export default function ReportesSecretariaPage() {
  // ========================================
  // ESTADOS
  // ========================================

  // Usuario y sesión
  const [usuario, setUsuario] = useState<UsuarioSesion | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingData, setLoadingData] = useState(true);
  const [loadingReporte, setLoadingReporte] = useState(false);

  // Datos de backend compartidos
  const [estadisticas, setEstadisticas] =
    useState<EstadisticasSecretaria | null>(null);
  const [medicosAsignados, setMedicosAsignados] = useState<MedicoAsignado[]>(
    []
  );
  const [notificaciones, setNotificaciones] = useState<
    NotificacionSecretaria[]
  >([]);
  const [metricasRendimiento, setMetricasRendimiento] = useState<
    MetricaRendimiento[]
  >([]);

  // Datos de reportes
  const [filtros, setFiltros] = useState<FiltrosReporte>({
    periodo: "mes",
    fechaInicio: null,
    fechaFin: null,
    tipo: "general",
    centroId: "todos",
    medicoId: "todos",
    canal: "todos",
  });

  const [resumenReportes, setResumenReportes] =
    useState<ResumenReportes | null>(null);
  const [detalleReporte, setDetalleReporte] = useState<FilaDetalleReporte[]>(
    []
  );
  const [reportesGuardados, setReportesGuardados] = useState<
    ReporteGuardado[]
  >([]);
  const [datosCitasPeriodo, setDatosCitasPeriodo] = useState<
    DatoGraficoSerie[]
  >([]);
  const [datosLlamadasCanal, setDatosLlamadasCanal] = useState<
    DatoLlamadasCanal[]
  >([]);
  const [datosDistribucionTipoCita, setDatosDistribucionTipoCita] = useState<
    DatoDistribucionTipoCita[]
  >([]);
  const [datosProductividad, setDatosProductividad] = useState<
    DatoGraficoSerie[]
  >([]);

  const [vistaDetalle, setVistaDetalle] = useState<"tabla" | "resumen">(
    "tabla"
  );

  // UI States
  const [temaActual, setTemaActual] = useState<TemaColor>("light");
  const [sidebarAbierto, setSidebarAbierto] = useState(true);
  const [notificacionesAbiertas, setNotificacionesAbiertas] = useState(false);
  const [perfilAbierto, setPerfilAbierto] = useState(false);
  const [busqueda, setBusqueda] = useState("");
  const [seccionActiva, setSeccionActiva] = useState<string>("reportes");
  const [menuExpandido, setMenuExpandido] = useState<string | null>(null);

  // ========================================
  // TEMA ACTUAL
  // ========================================

  const tema = useMemo(() => TEMAS[temaActual], [temaActual]);

  // ========================================
  // MENU DE NAVEGACIÓN
  // ========================================

  const menuItems: MenuItem[] = [
    {
      titulo: "Dashboard",
      icono: Home,
      url: "/secretaria",
      activo: seccionActiva === "dashboard",
    },
    {
      titulo: "Agenda",
      icono: Calendar,
      url: "",
      badge: estadisticas?.citas_programadas_hoy || 0,
      submenu: [
        { titulo: "Ver Agenda", icono: CalendarDays, url: "/secretaria/agenda" },
        {
          titulo: "Nueva Cita",
          icono: CalendarPlus,
          url: "/secretaria/agenda/nueva",
        },
        {
          titulo: "Búsqueda Citas",
          icono: Search,
          url: "/secretaria/agenda/buscar",
        },
        {
          titulo: "Disponibilidad",
          icono: CalendarClock,
          url: "/secretaria/agenda/disponibilidad",
        },
      ],
    },
    {
      titulo: "Confirmaciones",
      icono: CheckSquare,
      url: "",
      badge: estadisticas?.citas_pendientes_confirmacion || 0,
      submenu: [
        {
          titulo: "Pendientes",
          icono: Clock,
          url: "/secretaria/confirmaciones/pendientes",
        },
        {
          titulo: "Confirmadas",
          icono: CheckCircle2,
          url: "/secretaria/confirmaciones/confirmadas",
        },
        {
          titulo: "Cancelaciones",
          icono: X,
          url: "/secretaria/confirmaciones/cancelaciones",
        },
      ],
    },
    {
      titulo: "Llamadas",
      icono: Phone,
      url: "",
      badge: estadisticas?.llamadas_pendientes || 0,
      submenu: [
        {
          titulo: "Por Realizar",
          icono: PhoneOutgoing,
          url: "/secretaria/llamadas/pendientes",
        },
        {
          titulo: "Realizadas",
          icono: PhoneIncoming,
          url: "/secretaria/llamadas/historial",
        },
        {
          titulo: "Registro",
          icono: ClipboardList,
          url: "/secretaria/llamadas/registro",
        },
      ],
    },
    {
      titulo: "Pacientes",
      icono: Users,
      url: "",
      badge: estadisticas?.pacientes_nuevos_mes || 0,
      submenu: [
        { titulo: "Todos", icono: Users, url: "/secretaria/pacientes" },
        {
          titulo: "Nuevo Paciente",
          icono: UserPlus,
          url: "/secretaria/pacientes/nuevo",
        },
        {
          titulo: "Búsqueda",
          icono: Search,
          url: "/secretaria/pacientes/buscar",
        },
        {
          titulo: "Atención Hoy",
          icono: CalendarCheck,
          url: "/secretaria/pacientes/hoy",
        },
      ],
    },
    {
      titulo: "Médicos",
      icono: Stethoscope,
      url: "",
      submenu: [
        { titulo: "Mis Médicos", icono: UserCog, url: "/secretaria/medicos" },
        {
          titulo: "Disponibilidad",
          icono: CalendarClock,
          url: "/secretaria/medicos/disponibilidad",
        },
        {
          titulo: "Contacto",
          icono: Phone,
          url: "/secretaria/medicos/contacto",
        },
      ],
    },
    {
      titulo: "Recordatorios",
      icono: Bell,
      url: "",
      badge: estadisticas?.recordatorios_enviados_hoy || 0,
      submenu: [
        {
          titulo: "Programados",
          icono: Clock,
          url: "/secretaria/recordatorios/programados",
        },
        {
          titulo: "Enviados",
          icono: Send,
          url: "/secretaria/recordatorios/enviados",
        },
        {
          titulo: "Configuración",
          icono: Settings,
          url: "/secretaria/recordatorios/config",
        },
      ],
    },
    {
      titulo: "Documentos",
      icono: FileText,
      url: "",
      badge: estadisticas?.documentos_procesados_semana || 0,
      submenu: [
        {
          titulo: "Gestión",
          icono: FileSpreadsheet,
          url: "/secretaria/documentos",
        },
        {
          titulo: "Certificados",
          icono: Award,
          url: "/secretaria/documentos/certificados",
        },
        {
          titulo: "Recetas",
          icono: Pill,
          url: "/secretaria/documentos/recetas",
        },
        {
          titulo: "Órdenes",
          icono: ClipboardList,
          url: "/secretaria/documentos/ordenes",
        },
      ],
    },
    {
      titulo: "Mensajes",
      icono: MessageSquare,
      url: "",
      badge: estadisticas?.mensajes_sin_leer || 0,
      submenu: [
        { titulo: "Bandeja", icono: Mail, url: "/secretaria/mensajes" },
        {
          titulo: "WhatsApp",
          icono: MessageSquare,
          url: "https://web.whatsapp.com/",
        },
        { titulo: "SMS", icono: Phone, url: "/secretaria/mensajes/sms" },
        { titulo: "Email", icono: Mail, url: "/secretaria/mensajes/email" },
        {
          titulo: "Automáticos",
          icono: Mail,
          url: "/secretaria/mensajes/auto",
        },
      ],
    },
    {
      titulo: "Telemedicina",
      icono: Video,
      url: "",
      badge: estadisticas?.consultas_telemedicina_hoy || 0,
      submenu: [
        {
          titulo: "Sala Espera",
          icono: Clock,
          url: "/secretaria/telemedicina/espera",
        },
        {
          titulo: "Programadas",
          icono: CalendarCheck,
          url: "/secretaria/telemedicina/programadas",
        },
        {
          titulo: "Asistencia",
          icono: Settings,
          url: "/secretaria/telemedicina/asistencia",
        },
      ],
    },
    {
      titulo: "Tareas",
      icono: CheckSquare,
      url: "",
      badge: estadisticas?.tareas_pendientes || 0,
      submenu: [
        {
          titulo: "Todos Mis Tareas",
          icono: Square,
          url: "/secretaria/tareas",
        },
        {
          titulo: "Pendientes",
          icono: Square,
          url: "/secretaria/tareas/pendientes",
        },
        {
          titulo: "Completadas",
          icono: CheckSquare,
          url: "/secretaria/tareas/completadas",
        },
        {
          titulo: "Nueva Tarea",
          icono: Plus,
          url: "/secretaria/tareas/nueva",
        },
      ],
    },
    {
      titulo: "Reportes",
      icono: BarChart3,
      url: "",
      submenu: [
        { titulo: "Mis Métricas", icono: TrendingUp, url: "/secretaria/reportes/" },
        { titulo: "Citas", icono: Calendar, url: "/secretaria/reportes/citas" },
        { titulo: "Llamadas", icono: Phone, url: "/secretaria/reportes/llamadas" },
        {
          titulo: "Rendimiento",
          icono: Target,
          url: "/secretaria/reportes/rendimiento",
        },
      ],
    },
    {
      titulo: "Mi Perfil",
      icono: User,
      url: "",
      submenu: [
        {
          titulo: "Información Personal",
          icono: User,
          url: "/secretaria/perfil",
        },
        {
          titulo: "Horarios",
          icono: Clock,
          url: "/secretaria/perfil/horarios",
        },
        {
          titulo: "Preferencias",
          icono: Settings,
          url: "/secretaria/perfil/preferencias",
        },
      ],
    },
    {
      titulo: "Configuración",
      icono: Settings,
      url: "",
      submenu: [
        {
          titulo: "General",
          icono: Settings,
          url: "/secretaria/configuracion/",
        },
        {
          titulo: "Notificaciones",
          icono: Bell,
          url: "/secretaria/configuracion/notificaciones",
        },
        {
          titulo: "Seguridad",
          icono: Shield,
          url: "/secretaria/configuracion/seguridad",
        },
        {
          titulo: "Temas",
          icono: Sparkles,
          url: "/secretaria/configuracion/temas",
        },
      ],
    },
  ];

  // ========================================
  // EFECTOS
  // ========================================

  const pathname = usePathname();

  useEffect(() => {
    if (pathname.startsWith("/secretaria/reportes")) {
      setSeccionActiva("reportes");
    }
  }, [pathname]);

  useEffect(() => {
    cargarDatosUsuario();
  }, []);

  useEffect(() => {
    if (usuario?.secretaria) {
      cargarDatosDashboard();
      // 🔹 Carga inicial SOLO con datos reales del backend
      generarReporte("pantalla");
    }
  }, [usuario]);

  useEffect(() => {
    // Recarga básica de estadísticas cada 5 minutos
    const interval = setInterval(() => {
      if (usuario?.secretaria) {
        cargarDatosDashboard();
      }
    }, 300000);
    return () => clearInterval(interval);
  }, [usuario]);

  useEffect(() => {
    document.body.className = `bg-gradient-to-br ${tema.colores.fondo} min-h-screen transition-all duration-500`;
  }, [tema]);

  useEffect(() => {
    const cargarPreferenciaTema = async () => {
      try {
        const res = await fetch("/api/users/preferencias/tema", {
          method: "GET",
          credentials: "include",
        });
        const data = await res.json();
        if (data.success && data.tema_color) {
          setTemaActual(data.tema_color);
          localStorage.setItem("tema_secretaria", data.tema_color);
        }
      } catch (e) {
        console.error("No se pudo cargar la preferencia de tema:", e);
      }
    };

    cargarPreferenciaTema();
  }, []);

  // ========================================
  // FUNCIONES DE CARGA DE DATOS
  // ========================================

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

        const tieneRolSecretaria = rolesUsuario.some((rol) =>
          rol.includes("SECRETARIA")
        );

        if (!tieneRolSecretaria) {
          alert(
            `Acceso denegado. Este panel de reportes es solo para secretarias. Tus roles actuales son: ${rolesUsuario.join(
              ", "
            )}`
          );
          window.location.href = "/";
          return;
        }

        if (!result.usuario.secretaria) {
          alert(
            "Tu usuario tiene rol de SECRETARIA pero no está vinculado a un registro de secretaria. Contacta al administrador."
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
      alert("Error al verificar sesión. Serás redirigido al login.");
      window.location.href = "/login";
    } finally {
      setLoading(false);
    }
  };

  const cargarDatosDashboard = async () => {
    if (!usuario?.secretaria?.id_secretaria) return;

    try {
      setLoadingData(true);

      const res = await fetch(
        `/api/secretaria/dashboard?id_secretaria=${usuario.secretaria.id_secretaria}`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        }
      );

      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data.success) {
        console.error("Respuesta del dashboard:", data);
        return;
      }

      setEstadisticas(data.estadisticas || null);
      setMedicosAsignados(data.medicos_asignados || []);
      setNotificaciones(data.notificaciones || []);
      setMetricasRendimiento(data.metricas_rendimiento || []);
    } catch (err) {
      console.error("Error al cargar dashboard:", err);
    } finally {
      setLoadingData(false);
    }
  };

  // ========================================
  // FUNCIONES DE REPORTES
  // ========================================

  const generarReporte = async (modo: "pantalla" | "excel" | "pdf") => {
    try {
      setLoadingReporte(true);

      const params = new URLSearchParams();
      params.set("periodo", filtros.periodo);
      if (filtros.fechaInicio) params.set("desde", filtros.fechaInicio);
      if (filtros.fechaFin) params.set("hasta", filtros.fechaFin);
      params.set("tipo", filtros.tipo);
      params.set(
        "centro",
        filtros.centroId === "todos" ? "todos" : String(filtros.centroId)
      );
      if (filtros.medicoId && filtros.medicoId !== "todos") {
        params.set("medico", String(filtros.medicoId));
      }
      params.set("canal", filtros.canal);

      const baseUrl =
        modo === "pantalla"
          ? "/api/secretaria/reportes/generar"
          : "/api/secretaria/reportes/exportar";

      const res = await fetch(`${baseUrl}?${params.toString()}`, {
        method: "GET",
        credentials: "include",
      });

      if (!res.ok) {
        console.error("Error en respuesta de reportes");
        if (modo === "pantalla") {
          alert("No se pudo generar el reporte con datos reales.");
          // Limpiamos datos para no mostrar estadísticas falsas
          setResumenReportes(null);
          setDetalleReporte([]);
          setMetricasRendimiento([]);
          setDatosCitasPeriodo([]);
          setDatosLlamadasCanal([]);
          setDatosDistribucionTipoCita([]);
          setDatosProductividad([]);
        } else {
          alert(
            "No se pudo exportar el reporte. Revisa el backend /api/secretaria/reportes/exportar"
          );
        }
        return;
      }

      if (modo === "pantalla") {
        const data = await res.json().catch(() => ({} as any));

        setResumenReportes(data.resumen || null);
        setDetalleReporte(data.detalle || []);
        setMetricasRendimiento(data.metricas_rendimiento || []);

        setDatosCitasPeriodo(
          (data.graficos && data.graficos.citas_periodo) || []
        );
        setDatosLlamadasCanal(
          (data.graficos && data.graficos.llamadas_canal) || []
        );
        setDatosDistribucionTipoCita(
          (data.graficos && data.graficos.distribucion_tipo_cita) || []
        );
        setDatosProductividad(
          (data.graficos && data.graficos.productividad) || []
        );
      } else {
        const blob = await res.blob();
        const extension = modo === "pdf" ? "pdf" : "xlsx";
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `reporte_${filtros.tipo}_${filtros.periodo}.${extension}`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
      }
    } catch (err) {
      console.error("Error al generar reporte:", err);
      if (modo === "pantalla") {
        alert(
          "Ocurrió un error al generar el reporte con datos reales. Revisa el backend."
        );
        setResumenReportes(null);
        setDetalleReporte([]);
        setMetricasRendimiento([]);
        setDatosCitasPeriodo([]);
        setDatosLlamadasCanal([]);
        setDatosDistribucionTipoCita([]);
        setDatosProductividad([]);
      } else {
        alert("Error al exportar el reporte. Revisa la consola y el backend.");
      }
    } finally {
      setLoadingReporte(false);
    }
  };

  // ========================================
  // FUNCIONES AUXILIARES
  // ========================================

  const cambiarTema = async (nuevoTema: TemaColor) => {
    setTemaActual(nuevoTema);
    if (typeof window !== "undefined") {
      localStorage.setItem("tema_secretaria", nuevoTema);
    }

    try {
      await fetch("/api/users/preferencias/tema", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ tema_color: nuevoTema }),
      });
    } catch (err) {
      console.error("No se pudo guardar preferencia de tema:", err);
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

  const formatearFecha = (fecha: string) => {
    const date = new Date(fecha);
    return new Intl.DateTimeFormat("es-CL", {
      day: "2-digit",
      month: "2-digit",
      year: "2-digit",
    }).format(date);
  };

  const formatearFechaLarga = (fecha: string) => {
    const date = new Date(fecha);
    return new Intl.DateTimeFormat("es-CL", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    }).format(date);
  };

  const formatearRangoPeriodo = () => {
    if (!resumenReportes) return "Sin datos";
    return `${formatearFechaLarga(
      resumenReportes.periodo_desde
    )} al ${formatearFechaLarga(resumenReportes.periodo_hasta)}`;
  };

  const formatearNumero = (valor: number) =>
    new Intl.NumberFormat("es-CL").format(Math.round(valor));

  const formatearPorcentaje = (valor: number) =>
    `${valor.toFixed(1).replace(".", ",")}%`;

  const obtenerSaludo = () => {
    const hora = new Date().getHours();
    if (hora < 12) return "Buenos días";
    if (hora < 19) return "Buenas tardes";
    return "Buenas noches";
  };

  const obtenerIconoTendencia = (tendencia: "up" | "down" | "neutral") => {
    if (tendencia === "up")
      return <TrendingUp className="w-4 h-4 text-emerald-400" />;
    if (tendencia === "down")
      return <TrendingDown className="w-4 h-4 text-rose-400" />;
    return <Activity className="w-4 h-4 text-slate-400" />;
  };

  const marcarNotificacionLeida = async (idNotificacion: number) => {
    try {
      const response = await fetch(
        `/api/secretaria/notificaciones/${idNotificacion}/leer`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        }
      );

      if (response.ok) {
        setNotificaciones((prev) =>
          prev.map((notif) =>
            notif.id_notificacion === idNotificacion
              ? { ...notif, leida: true }
              : notif
          )
        );
      }
    } catch (error) {
      console.error("Error al marcar notificación como leída:", error);
    }
  };

  const descripcionPeriodo = () => {
    switch (filtros.periodo) {
      case "hoy":
        return "Hoy";
      case "semana":
        return "Últimos 7 días";
      case "mes":
        return "Mes actual";
      case "trimestre":
        return "Últimos 3 meses";
      case "anio":
        return "Año actual";
      case "personalizado":
        return "Rango personalizado";
      default:
        return "Periodo seleccionado";
    }
  };

  // ========================================
  // RENDER - LOADING / ACCESO
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
            Cargando panel de reportes
          </h2>
          <p
            className={`text-lg font-semibold ${tema.colores.textoSecundario} animate-pulse`}
          >
            Preparando tus métricas e indicadores...
          </p>
        </div>
      </div>
    );
  }

  if (!usuario || !usuario.secretaria) {
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
            No tienes permisos para acceder a este panel de reportes.
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
  // RENDER - PÁGINA COMPLETA
  // ========================================

  return (
    <div
      className={`min-h-screen transition-all duration-500 bg-gradient-to-br ${tema.colores.fondo}`}
    >
      {/* SIDEBAR */}
      <aside
        className={`fixed left-0 top-0 h-full z-50 transition-all duration-300 ${
          sidebarAbierto ? "w-72" : "w-20"
        } ${tema.colores.sidebar} ${tema.colores.borde} border-r ${tema.colores.sombra}`}
      >
        <div className="flex flex-col h-full">
          {/* Logo y Toggle */}
          <div className="flex items-center justify-between p-6 border-b border-gray-700/50">
            {sidebarAbierto ? (
              <div className="flex items-center gap-3">
                <div
                  className={`w-12 h-12 bg-gradient-to-br ${tema.colores.gradiente} rounded-xl flex items-center justify-center shadow-lg`}
                >
                  <BarChart3 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className={`text-xl font-black ${tema.colores.texto}`}>
                    AnyssaMed
                  </h1>
                  <p className={`text-xs font-semibold ${tema.colores.acento}`}>
                    Reportes & Métricas
                  </p>
                </div>
              </div>
            ) : (
              <div
                className={`w-12 h-12 bg-gradient-to-br ${tema.colores.gradiente} rounded-xl flex items-center justify-center shadow-lg mx-auto`}
              >
                <BarChart3 className="w-6 h-6 text-white" />
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

          {/* Menú */}
          <nav className="flex-1 overflow-y-auto py-6 px-3 custom-scrollbar">
            {menuItems.map((item, index) => (
              <div key={index} className="mb-1">
                <Link
                  href={item.url}
                  className={`flex items-center justify-between gap-3 px-4 py-3 rounded-xl font-semibold transition-all duration-300 group ${
                    item.activo
                      ? `bg-gradient-to-r ${tema.colores.gradiente} text-white ${tema.colores.sombra}`
                      : `${tema.colores.hover} ${tema.colores.texto}`
                  }`}
                  onClick={() => {
                    setSeccionActiva(
                      item.titulo.toLowerCase().includes("reporte")
                        ? "reportes"
                        : item.titulo.toLowerCase()
                    );
                    if (item.submenu) {
                      setMenuExpandido(
                        menuExpandido === item.titulo ? null : item.titulo
                      );
                    }
                  }}
                  onMouseEnter={() => item.submenu && setSidebarAbierto(true)}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <item.icono
                      className={`w-5 h-5 flex-shrink-0 ${
                        item.activo ? "text-white" : tema.colores.acento
                      }`}
                    />
                    {sidebarAbierto && (
                      <span className="truncate">{item.titulo}</span>
                    )}
                  </div>

                  {sidebarAbierto && item.badge && item.badge > 0 && (
                    <span
                      className={`px-2 py-1 text-xs font-bold rounded-full ${
                        item.activo
                          ? "bg-white/20 text-white"
                          : "bg-red-500 text-white"
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
                {sidebarAbierto &&
                  item.submenu &&
                  menuExpandido === item.titulo && (
                    <div className="mt-2 ml-4 space-y-1">
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
            ))}
          </nav>

          {/* Usuario bottom */}
          <div className={`p-4 border-t ${tema.colores.borde}`}>
            {sidebarAbierto ? (
              <div className="flex items-center gap-3">
                <div
                  className={`w-12 h-12 rounded-xl bg-gradient-to-br ${tema.colores.gradiente} flex items-center justify-center text-white font-bold shadow-lg`}
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
                </div>
                <div className="flex-1 min-w-0">
                  <p
                    className={`text-sm font-bold truncate ${tema.colores.texto}`}
                  >
                    {usuario.nombre} {usuario.apellido_paterno}
                  </p>
                  <p
                    className={`text-xs font-medium truncate ${tema.colores.textoSecundario}`}
                  >
                    Secretaria
                  </p>
                </div>
              </div>
            ) : (
              <div
                className={`w-12 h-12 rounded-xl bg-gradient-to-br ${tema.colores.gradiente} flex items-center justify-center text-white font-bold shadow-lg mx-auto`}
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
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* HEADER */}
      <header
        className={`fixed top-0 right-0 z-40 transition-all duration-300 ${
          sidebarAbierto ? "left-72" : "left-20"
        } ${tema.colores.header} ${tema.colores.borde} border-b ${tema.colores.sombra}`}
      >
        <div className="flex items-center justify-between px-8 py-4">
          {/* Búsqueda global */}
          <div className="flex-1 max-w-2xl">
            <div className="relative">
              <Search
                className={`absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 ${tema.colores.textoSecundario}`}
              />
              <input
                type="text"
                placeholder="Buscar paciente, reporte, médico, teléfono..."
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
            {/* Selector Tema */}
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

            {/* Notificaciones */}
            <div className="relative">
              <button
                onClick={() =>
                  setNotificacionesAbiertas(!notificacionesAbiertas)
                }
                className={`relative p-3 rounded-xl font-semibold transition-all duration-300 ${tema.colores.secundario} ${tema.colores.texto}`}
              >
                <Bell className="w-5 h-5" />
                {notificaciones.filter((n) => !n.leida).length > 0 && (
                  <span className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center animate-pulse">
                    {notificaciones.filter((n) => !n.leida).length > 9
                      ? "9+"
                      : notificaciones.filter((n) => !n.leida).length}
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
                    <div className="flex items-center justify-between">
                      <h3
                        className={`text-lg font-black ${tema.colores.texto}`}
                      >
                        Notificaciones
                      </h3>
                      <button
                        className={`text-sm font-semibold ${tema.colores.acento} hover:underline`}
                        onClick={() => {
                          // Marcar todas como leídas
                          const ids = notificaciones
                            .filter((n) => !n.leida)
                            .map((n) => n.id_notificacion);
                          ids.forEach((id) => marcarNotificacionLeida(id));
                        }}
                      >
                        Marcar todas leídas
                      </button>
                    </div>
                  </div>

                  {notificaciones.length === 0 ? (
                    <div className="p-8 text-center">
                      <BellOff
                        className={`w-12 h-12 mx-auto mb-3 ${tema.colores.textoSecundario}`}
                      />
                      <p
                        className={`text-sm ${tema.colores.textoSecundario}`}
                      >
                        No tienes notificaciones nuevas
                      </p>
                    </div>
                  ) : (
                    <div className={`divide-y ${tema.colores.borde}`}>
                      {notificaciones.slice(0, 5).map((notif) => (
                        <div
                          key={notif.id_notificacion}
                          className={`p-4 ${tema.colores.hover} transition-colors cursor-pointer ${
                            !notif.leida ? "bg-indigo-500/5" : ""
                          }`}
                          onClick={() =>
                            marcarNotificacionLeida(notif.id_notificacion)
                          }
                        >
                          <div className="flex items-start gap-3">
                            <div
                              className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                                notif.prioridad === "alta"
                                  ? "bg-rose-500/10 text-rose-400 border border-rose-500/30"
                                  : "bg-indigo-500/10 text-indigo-400 border border-indigo-500/30"
                              }`}
                            >
                              <Bell className="w-5 h-5" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p
                                className={`text-sm font-bold mb-1 ${tema.colores.texto}`}
                              >
                                {notif.titulo}
                              </p>
                              <p
                                className={`text-xs mb-2 ${tema.colores.textoSecundario}`}
                              >
                                {notif.descripcion}
                              </p>
                              <p
                                className={`text-xs font-medium ${tema.colores.textoSecundario}`}
                              >
                                {formatearFecha(notif.fecha_hora)}
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
                    Secretaria
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
                        Secretaria
                      </p>
                      <p
                        className={`text-xs font-medium ${tema.colores.textoSecundario}`}
                      >
                        {usuario.secretaria.centro.nombre}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Link
                      href="/secretaria/perfil"
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all duration-300 ${tema.colores.hover} ${tema.colores.texto}`}
                    >
                      <User className="w-5 h-5" />
                      <span>Mi Perfil</span>
                    </Link>
                    <Link
                      href="/secretaria/configuracion"
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all duration-300 ${tema.colores.hover} ${tema.colores.texto}`}
                    >
                      <Settings className="w-5 h-5" />
                      <span>Configuración</span>
                    </Link>
                    <Link
                      href="/secretaria/ayuda"
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

      {/* CONTENIDO PRINCIPAL */}
      <main
        className={`transition-all duration-300 ${
          sidebarAbierto ? "ml-72" : "ml-20"
        } pt-24 p-8`}
      >
        {/* Encabezado de sección */}
        <div className="mb-8 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div
                className={`w-12 h-12 bg-gradient-to-br ${tema.colores.gradiente} rounded-xl flex items-center justify-center shadow-lg`}
              >
                <BarChart3 className="w-7 h-7 text-white" />
              </div>
              <div>
                <h2
                  className={`text-3xl lg:text-4xl font-black ${tema.colores.texto} flex items-center gap-2`}
                >
                  Panel de reportes
                </h2>
                <p
                  className={`text-sm lg:text-base font-semibold ${tema.colores.textoSecundario}`}
                >
                  {obtenerSaludo()}, {usuario.nombre}. Visualiza, compara y
                  exporta tus indicadores clave del centro{" "}
                  <span className={tema.colores.acento}>
                    {usuario?.secretaria?.centro?.nombre ??
                      "Centro no asignado"}
                  </span>
                  .
                </p>
              </div>
            </div>
            {resumenReportes && (
              <p
                className={`text-xs lg:text-sm font-medium ${tema.colores.textoSecundario}`}
              >
                Periodo actual:{" "}
                <span className={tema.colores.acento}>
                  {formatearRangoPeriodo()} ({descripcionPeriodo()})
                </span>
              </p>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => generarReporte("pantalla")}
              disabled={loadingReporte}
              className={`inline-flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-sm ${tema.colores.primario} text-white transition-all duration-300 hover:scale-105 ${tema.colores.sombra} disabled:opacity-60 disabled:cursor-not-allowed`}
            >
              {loadingReporte ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4" />
              )}
              Generar reporte
            </button>

            <button
              onClick={() => generarReporte("excel")}
              className={`inline-flex items-center gap-2 px-4 py-3 rounded-xl font-semibold text-xs lg:text-sm ${tema.colores.secundario} ${tema.colores.texto} transition-all duration-300 hover:scale-105`}
            >
              <Download className="w-4 h-4" />
              Excel
            </button>

            <button
              onClick={() => generarReporte("pdf")}
              className={`inline-flex items-center gap-2 px-4 py-3 rounded-xl font-semibold text-xs lg:text-sm ${tema.colores.secundario} ${tema.colores.texto} transition-all duration-300 hover:scale-105`}
            >
              <Printer className="w-4 h-4" />
              PDF
            </button>
          </div>
        </div>

        {/* Filtros de reporte */}
        <section
          className={`rounded-2xl p-6 mb-8 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra}`}
        >
          <div className="flex items-center justify-between mb-4 gap-3">
            <div className="flex items-center gap-3">
              <Filter className={`w-6 h-6 ${tema.colores.acento}`} />
              <div>
                <h3 className={`text-xl font-black ${tema.colores.texto}`}>
                  Filtros de reportes
                </h3>
                <p
                  className={`text-xs font-semibold ${tema.colores.textoSecundario}`}
                >
                  Ajusta el periodo, el tipo de reporte y los filtros clínicos
                  para obtener exactamente lo que necesitas.
                </p>
              </div>
            </div>

            <span
              className={`hidden md:inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r ${tema.colores.gradiente} text-white`}
            >
              <Shield className="w-4 h-4" />
              Datos reales del sistema
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-4">
            {/* Periodo */}
            <div className="space-y-2">
              <label className={`text-xs font-bold ${tema.colores.texto}`}>
                Periodo
              </label>
              <select
                value={filtros.periodo}
                onChange={(e) =>
                  setFiltros((prev) => ({
                    ...prev,
                    periodo: e.target.value as FiltrosReporte["periodo"],
                  }))
                }
                className={`w-full px-3 py-2 rounded-xl text-sm font-semibold ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto}`}
              >
                <option value="hoy">Hoy</option>
                <option value="semana">Últimos 7 días</option>
                <option value="mes">Mes actual</option>
                <option value="trimestre">Últimos 3 meses</option>
                <option value="anio">Año actual</option>
                <option value="personalizado">Rango personalizado</option>
              </select>
            </div>

            {/* Tipo de reporte */}
            <div className="space-y-2">
              <label className={`text-xs font-bold ${tema.colores.texto}`}>
                Tipo de reporte
              </label>
              <select
                value={filtros.tipo}
                onChange={(e) =>
                  setFiltros((prev) => ({
                    ...prev,
                    tipo: e.target.value as FiltrosReporte["tipo"],
                  }))
                }
                className={`w-full px-3 py-2 rounded-xl text-sm font-semibold ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto}`}
              >
                <option value="general">General</option>
                <option value="citas">Citas</option>
                <option value="llamadas">Llamadas y contactos</option>
                <option value="telemedicina">Telemedicina</option>
                <option value="productividad">
                  Productividad secretaría
                </option>
                <option value="pacientes">Pacientes y cobertura</option>
              </select>
            </div>

            {/* Centro */}
            <div className="space-y-2">
              <label className={`text-xs font-bold ${tema.colores.texto}`}>
                Centro
              </label>
              <select
                value={String(filtros.centroId)}
                onChange={(e) =>
                  setFiltros((prev) => ({
                    ...prev,
                    centroId:
                      e.target.value === "todos"
                        ? "todos"
                        : Number(e.target.value),
                  }))
                }
                className={`w-full px-3 py-2 rounded-xl text-sm font-semibold ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto}`}
              >
                <option value="todos">Todos mis centros</option>
                <option value={usuario?.secretaria?.centro?.id_centro ?? ""}>
                  {usuario?.secretaria?.centro?.nombre ||
                    "Centro no asignado"}
                </option>
              </select>
            </div>

            {/* Canal */}
            <div className="space-y-2">
              <label className={`text-xs font-bold ${tema.colores.texto}`}>
                Canal
              </label>
              <select
                value={filtros.canal}
                onChange={(e) =>
                  setFiltros((prev) => ({
                    ...prev,
                    canal: e.target.value as FiltrosReporte["canal"],
                  }))
                }
                className={`w-full px-3 py-2 rounded-xl text-sm font-semibold ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto}`}
              >
                <option value="todos">Todos</option>
                <option value="presencial">Presencial</option>
                <option value="telemedicina">Telemedicina</option>
                <option value="telefono">Teléfono</option>
                <option value="whatsapp">WhatsApp</option>
                <option value="sms">SMS</option>
                <option value="email">Email</option>
              </select>
            </div>
          </div>

          {/* Filtros extra */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Médico */}
            <div className="space-y-2">
              <label className={`text-xs font-bold ${tema.colores.texto}`}>
                Profesional
              </label>
              <select
                value={String(filtros.medicoId ?? "todos")}
                onChange={(e) =>
                  setFiltros((prev) => ({
                    ...prev,
                    medicoId:
                      e.target.value === "todos"
                        ? "todos"
                        : Number(e.target.value),
                  }))
                }
                className={`w-full px-3 py-2 rounded-xl text-sm font-semibold ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto}`}
              >
                <option value="todos">Todos los profesionales</option>
                {medicosAsignados.map((m) => (
                  <option key={m.id_profesional} value={m.id_profesional}>
                    {m.nombre_completo} ({m.especialidad})
                  </option>
                ))}
              </select>
            </div>

            {/* Fechas personalizadas */}
            <div className="space-y-2">
              <label className={`text-xs font-bold ${tema.colores.texto}`}>
                Desde
              </label>
              <input
                type="date"
                value={filtros.fechaInicio || ""}
                onChange={(e) =>
                  setFiltros((prev) => ({
                    ...prev,
                    fechaInicio: e.target.value || null,
                    periodo:
                      prev.periodo === "personalizado"
                        ? "personalizado"
                        : prev.periodo,
                  }))
                }
                className={`w-full px-3 py-2 rounded-xl text-sm font-semibold ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto}`}
              />
            </div>

            <div className="space-y-2">
              <label className={`text-xs font-bold ${tema.colores.texto}`}>
                Hasta
              </label>
              <input
                type="date"
                value={filtros.fechaFin || ""}
                onChange={(e) =>
                  setFiltros((prev) => ({
                    ...prev,
                    fechaFin: e.target.value || null,
                    periodo:
                      prev.periodo === "personalizado"
                        ? "personalizado"
                        : prev.periodo,
                  }))
                }
                className={`w-full px-3 py-2 rounded-xl text-sm font-semibold ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto}`}
              />
            </div>
          </div>
        </section>

        {loadingData && !resumenReportes ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <Loader2 className="w-16 h-16 animate-spin text-indigo-500 mx-auto mb-4" />
              <p
                className={`text-lg font-semibold ${tema.colores.textoSecundario}`}
              >
                Cargando datos y métricas del centro...
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Resumen KPI */}
            {resumenReportes && (
              <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
                {/* Total citas */}
                <div
                  className={`rounded-2xl p-5 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} hover:scale-[1.02] hover:-translate-y-1 transition-all duration-300`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-white" />
                    </div>
                    <BarChart3 className="w-4 h-4 text-indigo-400" />
                  </div>
                  <p
                    className={`text-xs font-bold uppercase tracking-wider ${tema.colores.textoSecundario}`}
                  >
                    Total de citas
                  </p>
                  <p
                    className={`text-3xl font-black ${tema.colores.texto} mt-1`}
                  >
                    {formatearNumero(resumenReportes.total_citas)}
                  </p>
                  <p
                    className={`mt-2 text-xs ${tema.colores.textoSecundario}`}
                  >
                    Incluye citas presenciales y telemedicina
                  </p>
                </div>

                {/* Llamadas */}
                <div
                  className={`rounded-2xl p-5 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} hover:scale-[1.02] hover:-translate-y-1 transition-all duration-300`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
                      <Phone className="w-5 h-5 text-white" />
                    </div>
                    <Activity className="w-4 h-4 text-emerald-400" />
                  </div>
                  <p
                    className={`text-xs font-bold uppercase tracking-wider ${tema.colores.textoSecundario}`}
                  >
                    Llamadas y contactos
                  </p>
                  <p
                    className={`text-3xl font-black ${tema.colores.texto} mt-1`}
                  >
                    {formatearNumero(resumenReportes.total_llamadas)}
                  </p>
                  <p
                    className={`mt-2 text-xs ${tema.colores.textoSecundario}`}
                  >
                    Teléfono, WhatsApp, SMS y email
                  </p>
                </div>

                {/* Tasa confirmación */}
                <div
                  className={`rounded-2xl p-5 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} hover:scale-[1.02] hover:-translate-y-1 transition-all duration-300`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-green-500 flex items-center justify-center">
                      <CheckCircle2 className="w-5 h-5 text-white" />
                    </div>
                    <TrendingUp className="w-4 h-4 text-emerald-400" />
                  </div>
                  <p
                    className={`text-xs font-bold uppercase tracking-wider ${tema.colores.textoSecundario}`}
                  >
                    Tasa de confirmación
                  </p>
                  <p
                    className={`text-3xl font-black ${tema.colores.texto} mt-1`}
                  >
                    {formatearPorcentaje(resumenReportes.tasa_confirmacion)}
                  </p>
                  <div className="mt-2 h-2 rounded-full bg-slate-700/40 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-400 to-emerald-500"
                      style={{
                        width: `${Math.min(
                          100,
                          Math.max(0, resumenReportes.tasa_confirmacion)
                        )}%`,
                      }}
                    />
                  </div>
                  <p
                    className={`mt-2 text-xs ${tema.colores.textoSecundario}`}
                  >
                    Meta recomendada: &gt; 90%
                  </p>
                </div>

                {/* Productividad */}
                <div
                  className={`rounded-2xl p-5 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} hover:scale-[1.02] hover:-translate-y-1 transition-all duration-300`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center">
                      <UserCog className="w-5 h-5 text-white" />
                    </div>
                    <Target className="w-4 h-4 text-pink-400" />
                  </div>
                  <p
                    className={`text-xs font-bold uppercase tracking-wider ${tema.colores.textoSecundario}`}
                  >
                    Productividad secretaría
                  </p>
                  <p
                    className={`text-3xl font-black ${tema.colores.texto} mt-1`}
                  >
                    {formatearPorcentaje(
                      resumenReportes.productividad_secretaria
                    )}
                  </p>
                  <p
                    className={`mt-2 text-xs ${tema.colores.textoSecundario}`}
                  >
                    Basado en citas, llamadas y tareas completadas
                  </p>
                </div>
              </section>
            )}

            {/* Gráficos principales */}
            <section className="grid grid-cols-1 xl:grid-cols-3 gap-8 mb-8">
              {/* Citas por periodo */}
              <div
                className={`xl:col-span-2 rounded-2xl p-6 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra}`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
                      <LineChart className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3
                        className={`text-lg font-black ${tema.colores.texto}`}
                      >
                        Citas en el periodo
                      </h3>
                      <p
                        className={`text-xs font-semibold ${tema.colores.textoSecundario}`}
                      >
                        Programadas, confirmadas y telemedicina
                      </p>
                    </div>
                  </div>
                  <span
                    className={`text-xs font-semibold ${tema.colores.textoSecundario}`}
                  >
                    {descripcionPeriodo()}
                  </span>
                </div>

                <ResponsiveContainer width="100%" height={280}>
                  <AreaChart data={datosCitasPeriodo}>
                    <defs>
                      <linearGradient
                        id="citasProgramadas"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="#6366f1"
                          stopOpacity={0.8}
                        />
                        <stop
                          offset="95%"
                          stopColor="#6366f1"
                          stopOpacity={0}
                        />
                      </linearGradient>
                      <linearGradient
                        id="citasConfirmadas"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="#22c55e"
                          stopOpacity={0.8}
                        />
                        <stop
                          offset="95%"
                          stopColor="#22c55e"
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                    <XAxis
                      dataKey="etiqueta"
                      stroke="#9ca3af"
                      style={{ fontSize: "12px" }}
                    />
                    <YAxis
                      stroke="#9ca3af"
                      style={{ fontSize: "12px" }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "rgba(15,23,42,0.95)",
                        borderRadius: 12,
                        border: "1px solid rgba(129,140,248,0.4)",
                        padding: 12,
                      }}
                    />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="valor1"
                      name="Programadas"
                      stroke="#6366f1"
                      fillOpacity={1}
                      fill="url(#citasProgramadas)"
                    />
                    <Area
                      type="monotone"
                      dataKey="valor2"
                      name="Confirmadas"
                      stroke="#22c55e"
                      fillOpacity={1}
                      fill="url(#citasConfirmadas)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Llamadas por canal */}
              <div
                className={`rounded-2xl p-6 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra}`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
                      <Phone className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3
                        className={`text-lg font-black ${tema.colores.texto}`}
                      >
                        Llamadas por canal
                      </h3>
                      <p
                        className={`text-xs font-semibold ${tema.colores.textoSecundario}`}
                      >
                        Realizadas vs exitosas
                      </p>
                    </div>
                  </div>
                </div>

                <ResponsiveContainer width="100%" height={260}>
                  <RechartsBarChart data={datosLlamadasCanal}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                    <XAxis
                      dataKey="canal"
                      stroke="#9ca3af"
                      style={{ fontSize: "12px" }}
                    />
                    <YAxis
                      stroke="#9ca3af"
                      style={{ fontSize: "12px" }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "rgba(15,23,42,0.95)",
                        borderRadius: 12,
                        border: "1px solid rgba(16,185,129,0.4)",
                        padding: 12,
                      }}
                    />
                    <Legend />
                    <Bar
                      dataKey="realizadas"
                      name="Realizadas"
                      fill="#22c55e"
                      radius={[8, 8, 0, 0]}
                    />
                    <Bar
                      dataKey="exitosas"
                      name="Exitosas"
                      fill="#059669"
                      radius={[8, 8, 0, 0]}
                    />
                  </RechartsBarChart>
                </ResponsiveContainer>
              </div>
            </section>

            {/* Distribución + Productividad */}
            <section className="grid grid-cols-1 xl:grid-cols-3 gap-8 mb-8">
              {/* Distribución tipo de cita */}
              <div
                className={`rounded-2xl p-6 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra}`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center">
                      <PieChart className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3
                        className={`text-lg font-black ${tema.colores.texto}`}
                      >
                        Distribución de tipo de cita
                      </h3>
                      <p
                        className={`text-xs font-semibold ${tema.colores.textoSecundario}`}
                      >
                        Presencial vs telemedicina y controles
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <ResponsiveContainer width="60%" height={220}>
                    <RechartsPieChart>
                      <Pie
                        //data={datosDistribucionTipoCita}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="valor"
                      >
                        {datosDistribucionTipoCita.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </RechartsPieChart>
                  </ResponsiveContainer>

                  <div className="flex-1 space-y-2">
                    {datosDistribucionTipoCita.map((item, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between"
                      >
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: item.color }}
                          />
                          <span
                            className={`text-xs font-semibold ${tema.colores.texto}`}
                          >
                            {item.nombre}
                          </span>
                        </div>
                        <span
                          className={`text-xs font-bold ${tema.colores.acento}`}
                        >
                          {item.valor}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Productividad comparativa */}
              <div
                className={`xl:col-span-2 rounded-2xl p-6 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra}`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center">
                      <Target className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3
                        className={`text-lg font-black ${tema.colores.texto}`}
                      >
                        Productividad de secretaría
                      </h3>
                      <p
                        className={`text-xs font-semibold ${tema.colores.textoSecundario}`}
                      >
                        Comparación contigo, centro y meta comunal
                      </p>
                    </div>
                  </div>
                </div>

                <ResponsiveContainer width="100%" height={240}>
                  <RechartsBarChart data={datosProductividad}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                    <XAxis
                      dataKey="etiqueta"
                      stroke="#9ca3af"
                      style={{ fontSize: "12px" }}
                    />
                    <YAxis
                      stroke="#9ca3af"
                      style={{ fontSize: "12px" }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "rgba(15,23,42,0.95)",
                        borderRadius: 12,
                        border: "1px solid rgba(59,130,246,0.4)",
                        padding: 12,
                      }}
                    />
                    <Legend />
                    <Bar
                      dataKey="valor1"
                      name="Índice global"
                      fill="#4f46e5"
                      radius={[8, 8, 0, 0]}
                    />
                    <Bar
                      dataKey="valor2"
                      name="Eficiencia llamadas"
                      fill="#22c55e"
                      radius={[8, 8, 0, 0]}
                    />
                  </RechartsBarChart>
                </ResponsiveContainer>
              </div>
            </section>

            {/* Detalle + Reportes guardados */}
            <section className="grid grid-cols-1 xl:grid-cols-3 gap-8 mb-8">
              {/* Tabla detalle */}
              <div
                className={`xl:col-span-2 rounded-2xl p-6 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra}`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500 to-indigo-500 flex items-center justify-center">
                      <ClipboardList className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3
                        className={`text-lg font-black ${tema.colores.texto}`}
                      >
                        Detalle del reporte
                      </h3>
                      <p
                        className={`text-xs font-semibold ${tema.colores.textoSecundario}`}
                      >
                        Resumen por día, centro y profesional
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setVistaDetalle("tabla")}
                      className={`px-3 py-1 rounded-xl text-xs font-semibold ${
                        vistaDetalle === "tabla"
                          ? `bg-gradient-to-r ${tema.colores.gradiente} text-white`
                          : `${tema.colores.hover} ${tema.colores.texto}`
                      }`}
                    >
                      Tabla
                    </button>
                    <button
                      onClick={() => setVistaDetalle("resumen")}
                      className={`px-3 py-1 rounded-xl text-xs font-semibold ${
                        vistaDetalle === "resumen"
                          ? `bg-gradient-to-r ${tema.colores.gradiente} text-white`
                          : `${tema.colores.hover} ${tema.colores.texto}`
                      }`}
                    >
                      Resumen
                    </button>
                  </div>
                </div>

                {vistaDetalle === "tabla" ? (
                  <div className="overflow-x-auto custom-scrollbar max-h-[360px]">
                    <table className="min-w-full text-xs">
                      <thead>
                        <tr
                          className={`sticky top-0 z-10 ${tema.colores.fondoSecundario} bg-opacity-90`}
                        >
                          {[
                            "Fecha",
                            "Centro",
                            "Profesional",
                            "Tipo",
                            "Citas",
                            "Conf.",
                            "Canc.",
                            "Telemed.",
                            "Llamadas",
                            "Asist.",
                            "No asist.",
                          ].map((head) => (
                            <th
                              key={head}
                              className={`px-3 py-2 text-left font-bold uppercase tracking-wider ${tema.colores.textoSecundario} border-b ${tema.colores.borde}`}
                            >
                              {head}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {detalleReporte.length === 0 ? (
                          <tr>
                            <td
                              colSpan={11}
                              className={`px-4 py-8 text-center ${tema.colores.textoSecundario}`}
                            >
                              No hay filas para mostrar. Genera un reporte para
                              ver el detalle.
                            </td>
                          </tr>
                        ) : (
                          detalleReporte.map((fila, idx) => (
                            <tr
                              key={idx}
                              className={`border-b ${tema.colores.borde} hover:bg-white/5`}
                            >
                              <td className="px-3 py-2 whitespace-nowrap">
                                {formatearFecha(fila.fecha)}
                              </td>
                              <td className="px-3 py-2 whitespace-nowrap">
                                {fila.centro}
                              </td>
                              <td className="px-3 py-2 whitespace-nowrap">
                                {fila.medico}
                              </td>
                              <td className="px-3 py-2 whitespace-nowrap">
                                {fila.tipo}
                              </td>
                              <td className="px-3 py-2 text-right">
                                {fila.total_citas}
                              </td>
                              <td className="px-3 py-2 text-right">
                                {fila.confirmadas}
                              </td>
                              <td className="px-3 py-2 text-right">
                                {fila.canceladas}
                              </td>
                              <td className="px-3 py-2 text-right">
                                {fila.telemedicina}
                              </td>
                              <td className="px-3 py-2 text-right">
                                {fila.llamadas}
                              </td>
                              <td className="px-3 py-2 text-right">
                                {fila.asistencia}
                              </td>
                              <td className="px-3 py-2 text-right">
                                {fila.inasistencias}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {metricasRendimiento.map((m, idx) => (
                      <div
                        key={idx}
                        className={`rounded-2xl p-4 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra}`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <m.icono
                              className={`w-4 h-4 ${
                                m.color || tema.colores.acento
                              }`}
                            />
                            <p
                              className={`text-xs font-bold ${tema.colores.texto}`}
                            >
                              {m.nombre}
                            </p>
                          </div>
                          {obtenerIconoTendencia(m.tendencia)}
                        </div>
                        <p
                          className={`text-xl font-black ${tema.colores.texto}`}
                        >
                          {m.unidad === "%"
                            ? formatearPorcentaje(m.valor_actual)
                            : formatearNumero(m.valor_actual)}
                        </p>
                        <p
                          className={`mt-1 text-[11px] ${tema.colores.textoSecundario}`}
                        >
                          Anterior:{" "}
                          {m.unidad === "%"
                            ? formatearPorcentaje(m.valor_anterior)
                            : formatearNumero(m.valor_anterior)}
                          {" · "}
                          <span
                            className={
                              m.porcentaje_cambio >= 0
                                ? "text-emerald-400"
                                : "text-rose-400"
                            }
                          >
                            {m.porcentaje_cambio >= 0 ? "+" : ""}
                            {m.porcentaje_cambio.toFixed(1)}%
                          </span>
                        </p>
                        <p
                          className={`mt-2 text-[11px] ${tema.colores.textoSecundario}`}
                        >
                          {m.descripcion}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Reportes guardados */}
              <div
                className={`rounded-2xl p-6 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra}`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
                      <FileSpreadsheet className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3
                        className={`text-lg font-black ${tema.colores.texto}`}
                      >
                        Reportes guardados
                      </h3>
                      <p
                        className={`text-xs font-semibold ${tema.colores.textoSecundario}`}
                      >
                        Plantillas rápidas para reutilizar
                      </p>
                    </div>
                  </div>
                  <button className={`p-2 rounded-xl ${tema.colores.hover}`}>
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-3 max-h-[320px] overflow-y-auto custom-scrollbar pr-1">
                  {reportesGuardados.length === 0 ? (
                    <div className="text-center py-8">
                      <p
                        className={`text-sm ${tema.colores.textoSecundario}`}
                      >
                        Aún no tienes reportes guardados.
                      </p>
                      <p
                        className={`text-xs mt-1 ${tema.colores.textoSecundario}`}
                      >
                        Genera un reporte y guárdalo como plantilla desde el
                        backend.
                      </p>
                    </div>
                  ) : (
                    reportesGuardados.map((rep) => (
                      <div
                        key={rep.id_reporte}
                        className={`p-4 rounded-2xl ${tema.colores.card} ${tema.colores.borde} border hover:scale-[1.02] hover:-translate-y-0.5 transition-all duration-300 cursor-pointer`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <p
                                className={`text-sm font-black ${tema.colores.texto} truncate`}
                              >
                                {rep.nombre}
                              </p>
                              {rep.favorito && (
                                <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/40">
                                  ★ Favorito
                                </span>
                              )}
                            </div>
                            <p
                              className={`text-[11px] ${tema.colores.textoSecundario} mb-1`}
                            >
                              {rep.descripcion}
                            </p>
                            <p className="text-[10px] text-slate-400">
                              {rep.tipo.toUpperCase()} · {rep.periodo}
                            </p>
                          </div>
                          <button
                            className={`p-1 rounded-lg ${tema.colores.hover}`}
                          >
                            <MoreVertical className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="mt-3 flex items-center justify-between text-[10px] text-slate-400">
                          <span>
                            Creado por {rep.creado_por} ·{" "}
                            {formatearFecha(rep.fecha_creacion)}
                          </span>
                          {rep.ultimo_uso && (
                            <span>
                              Último uso: {formatearFecha(rep.ultimo_uso)}
                            </span>
                          )}
                        </div>
                        <div className="mt-3 flex items-center gap-2 text-[10px]">
                          <button
                            className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg ${tema.colores.secundario} ${tema.colores.texto}`}
                          >
                            <BarChart3 className="w-3 h-3" />
                            Cargar en pantalla
                          </button>
                          <button
                            className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg ${tema.colores.secundario} ${tema.colores.texto}`}
                          >
                            {rep.formato_preferido === "pdf" ? (
                              <>
                                <Printer className="w-3 h-3" />
                                PDF
                              </>
                            ) : (
                              <>
                                <Download className="w-3 h-3" />
                                Excel
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </section>
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
                © 2025 AnyssaMed. Módulo de reportes avanzados.
              </p>
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r ${tema.colores.gradiente} text-white`}
              >
                v4.0.0
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
                className="text-sm font-bold text-red-400 hover:text-red-300 transition-colors"
              >
                Cerrar Sesión
              </button>
            </div>
          </div>
        </div>
      </footer>

      {/* ESTILOS GLOBALES */}
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

        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }

        .custom-scrollbar::-webkit-scrollbar-track {
          background: ${["dark", "blue", "purple", "green"].includes(
            temaActual
          )
            ? "rgba(31, 41, 55, 0.5)"
            : "rgba(243, 244, 246, 0.5)"};
          border-radius: 10px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: ${["dark", "blue", "purple", "green"].includes(
            temaActual
          )
            ? "rgba(99, 102, 241, 0.5)"
            : "rgba(99, 102, 241, 0.7)"};
          border-radius: 10px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: ${["dark", "blue", "purple", "green"].includes(
            temaActual
          )
            ? "rgba(99, 102, 241, 0.7)"
            : "rgba(99, 102, 241, 0.9)"};
        }
      `}</style>
    </div>
  );
}
