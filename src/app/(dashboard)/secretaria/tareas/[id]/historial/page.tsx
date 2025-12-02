// src/app/(dashboard)/secretaria/tareas/[id]/historial/page.tsx
"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter, useParams } from "next/navigation";

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
  Square,
  CalendarCheck,
  CalendarClock,
  CalendarDays,
  CalendarPlus,
  CalendarRange,
  Check,
  CheckSquare2,
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
  Edit,
  MoreVertical,
  Paperclip,
  Percent,
  Trash,
  Phone,
  PhoneCall,
  PieChart,
  Plus,
  RefreshCw,
  Search,
  Send,
  Settings,
  Share2,
  Shield,
  ShieldCheck,
  Star,
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
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  ArrowLeft,
  Stethoscope,
  FileSpreadsheet,
  Pill,
  PhoneOutgoing,
  PhoneIncoming,
} from "lucide-react";

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
  rol?: {
    id_rol: number;
    nombre: string;
    nivel_jerarquia: number;
  };
  roles?: Array<{
    id_rol: number;
    nombre: string;
    nivel_jerarquia: number;
  }>;
}

type TareaPrioridad = "baja" | "media" | "alta" | "urgente" | "critica";
type TareaEstado =
  | "pendiente"
  | "en_progreso"
  | "en_revision"
  | "completada"
  | "rechazada"
  | "cancelada";

interface Tarea {
  id_tarea: number;
  titulo: string;
  descripcion: string;
  prioridad: TareaPrioridad;
  estado: TareaEstado;
  tipo: string;
  centro: {
    id_centro: number;
    nombre: string;
  } | null;
  sucursal: {
    id_sucursal: number;
    nombre: string;
  } | null;
  creador: {
    id_usuario: number;
    nombre_completo: string;
    rol: string;
  };
  responsable: {
    id_usuario: number;
    nombre_completo: string;
    rol: string;
  };
  fecha_creacion: string;
  fecha_limite: string | null;
  tags: string[];
  puede_editar?: boolean;
  puede_cambiar_estado?: boolean;
  puede_eliminar?: boolean;
}

interface EstadisticasTareas {
  total: number;
  pendientes: number;
  en_progreso: number;
  en_revision: number;
  completadas: number;
  rechazadas: number;
  criticas: number;
  vencidas: number;
  hoy: number;
  citas_programadas_hoy?: number;
  citas_pendientes_confirmacion?: number;
  llamadas_pendientes?: number;
  pacientes_nuevos_mes?: number;
  recordatorios_enviados_hoy?: number;
  documentos_procesados_semana?: number;
  mensajes_sin_leer?: number;
  consultas_telemedicina_hoy?: number;
  tareas_pendientes?: number;
}

interface NotificacionSistema {
  id_notificacion: number;
  titulo: string;
  descripcion: string;
  fecha_hora: string;
  leida: boolean;
  prioridad: "baja" | "media" | "alta";
}

interface MenuItem {
  titulo: string;
  icono: any;
  url: string;
  badge?: number;
  submenu?: MenuItem[];
  activo?: boolean;
  target?: string;
  rel?: string;
}

interface EventoHistorial {
  id_evento: number;
  fecha_hora: string;
  accion: string;
  detalle: string | null;
  usuario: {
    id_usuario: number;
    nombre_completo: string;
    rol: string;
  } | null;
  estado_anterior?: TareaEstado | null;
  estado_nuevo?: TareaEstado | null;
}

type TipoCambioHistorial =
  | "todos"
  | "creacion"
  | "estado"
  | "contenido"
  | "asignaciones"
  | "sistema";

interface UsuarioHistorialResumen {
  id_usuario: number;
  nombre_completo: string;
}

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
// CONSTANTES DE ROL
// ========================================

const roleParam = "secretaria";
const roleLabel = "Secretaria";

// ========================================
// COMPONENTE PRINCIPAL (HISTORIAL TAREA)
// ========================================

export default function HistorialTareaSecretariaPage() {
  const pathname = usePathname();
  const router = useRouter();
  const params = useParams();
  const idParam = params?.id as string | undefined;
  const tareaId = idParam ? Number(idParam) : NaN;

  // Usuario y tema
  const [usuario, setUsuario] = useState<UsuarioSesion | null>(null);
  const [temaActual, setTemaActual] = useState<TemaColor>("light");

  // Loading
  const [loadingUsuario, setLoadingUsuario] = useState(true);
  const [loadingTarea, setLoadingTarea] = useState(true);
  const [loadingHistorial, setLoadingHistorial] = useState(true);

  // Datos
  const [tarea, setTarea] = useState<Tarea | null>(null);
  const [estadisticas, setEstadisticas] = useState<EstadisticasTareas | null>(
    null
  );
  const [historial, setHistorial] = useState<EventoHistorial[]>([]);

  // Filtros historial
  const [busqueda, setBusqueda] = useState("");
  const [filtroAccion, setFiltroAccion] = useState<string>("todos");
  const [filtroUsuario, setFiltroUsuario] = useState<number | "todos">("todos");
  const [filtroTipoCambio, setFiltroTipoCambio] =
    useState<TipoCambioHistorial>("todos");
  const [ordenAscendente, setOrdenAscendente] = useState(false);
  const [soloCambiosEstado, setSoloCambiosEstado] = useState(false);

  // Notificaciones y UI
  const [notificaciones, setNotificaciones] = useState<NotificacionSistema[]>(
    []
  );
  const [sidebarAbierto, setSidebarAbierto] = useState(true);
  const [menuExpandido, setMenuExpandido] = useState<string | null>("Tareas");
  const [notificacionesAbiertas, setNotificacionesAbiertas] = useState(false);
  const [perfilAbierto, setPerfilAbierto] = useState(false);

  const tema = useMemo(() => TEMAS[temaActual], [temaActual]);

  // Sección activa
  const seccionActiva = useMemo(() => {
    if (pathname === "/secretaria") return "dashboard";
    if (pathname.startsWith("/secretaria/tareas")) return "tareas";
    if (pathname.startsWith("/secretaria/agenda")) return "agenda";
    if (pathname.startsWith("/secretaria/confirmaciones"))
      return "confirmaciones";
    if (pathname.startsWith("/secretaria/llamadas")) return "llamadas";
    if (pathname.startsWith("/secretaria/pacientes")) return "pacientes";
    if (pathname.startsWith("/secretaria/medicos")) return "medicos";
    if (pathname.startsWith("/secretaria/recordatorios")) return "recordatorios";
    if (pathname.startsWith("/secretaria/documentos")) return "documentos";
    if (pathname.startsWith("/secretaria/mensajes")) return "mensajes";
    if (pathname.startsWith("/secretaria/telemedicina")) return "telemedicina";
    if (pathname.startsWith("/secretaria/reportes")) return "reportes";
    if (pathname.startsWith("/secretaria/perfil")) return "perfil";
    if (pathname.startsWith("/secretaria/configuracion"))
      return "configuracion";
    return "";
  }, [pathname]);

  // ========================================
  // MENÚ PRINCIPAL
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
      activo: seccionActiva === "agenda",
      submenu: [
        {
          titulo: "Ver Agenda",
          icono: CalendarDays,
          url: "/secretaria/agenda",
        },
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
      icono: CheckSquare2,
      url: "",
      badge: estadisticas?.citas_pendientes_confirmacion || 0,
      activo: seccionActiva === "confirmaciones",
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
      activo: seccionActiva === "llamadas",
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
      activo: seccionActiva === "pacientes",
      submenu: [
        { titulo: "Todos", icono: Users, url: "/secretaria/pacientes" },
        {
          titulo: "Nuevo Paciente",
          icono: UserPlus,
          url: "/secretaria/pacientes/nuevo",
        },
        { titulo: "Búsqueda", icono: Search, url: "/secretaria/pacientes/buscar" },
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
      activo: seccionActiva === "medicos",
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
      activo: seccionActiva === "recordatorios",
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
      activo: seccionActiva === "documentos",
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
        { titulo: "Recetas", icono: Pill, url: "/secretaria/documentos/recetas" },
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
      activo: seccionActiva === "mensajes",
      submenu: [
        { titulo: "Bandeja", icono: Mail, url: "/secretaria/mensajes" },
        {
          titulo: "WhatsApp",
          icono: MessageSquare,
          url: "https://web.whatsapp.com/",
          target: "_blank",
          rel: "noopener noreferrer",
        },
        { titulo: "SMS", icono: Phone, url: "/secretaria/mensajes/sms" },
        { titulo: "Email", icono: Mail, url: "/secretaria/mensajes/email" },
        { titulo: "Automáticos", icono: Mail, url: "/secretaria/mensajes/auto" },
      ],
    },
    {
      titulo: "Telemedicina",
      icono: Video,
      url: "",
      badge: estadisticas?.consultas_telemedicina_hoy || 0,
      activo: seccionActiva === "telemedicina",
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
      icono: CheckSquare2,
      url: "",
      badge: estadisticas?.tareas_pendientes || 0,
      activo: seccionActiva === "tareas",
      submenu: [
        {
          titulo: "Todas Mis Tareas",
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
          icono: CheckSquare2,
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
      activo: seccionActiva === "reportes",
      submenu: [
        {
          titulo: "Mis Métricas",
          icono: TrendingUp,
          url: "/secretaria/reportes/metricas",
        },
        {
          titulo: "Citas",
          icono: Calendar,
          url: "/secretaria/reportes/citas",
        },
        {
          titulo: "Llamadas",
          icono: Phone,
          url: "/secretaria/reportes/llamadas",
        },
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
      activo: seccionActiva === "perfil",
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
      activo: seccionActiva === "configuracion",
      submenu: [
        {
          titulo: "General",
          icono: Settings,
          url: "/secretaria/configuracion",
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

  // Fondo
  useEffect(() => {
    document.body.className = `bg-gradient-to-br ${tema.colores.fondo} min-h-screen transition-all duration-500`;
  }, [tema]);

  // Cargar tema
  useEffect(() => {
    const key = `tema_tareas_${roleParam}`;
    if (typeof window !== "undefined") {
      const guardado = window.localStorage.getItem(key) as TemaColor | null;
      if (guardado && TEMAS[guardado]) {
        setTemaActual(guardado);
      }
    }
  }, []);

  // Cargar usuario
  useEffect(() => {
    const cargarUsuario = async () => {
      try {
        setLoadingUsuario(true);
        const response = await fetch("/api/auth/session", {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        });

        if (!response.ok) {
          window.location.href = "/login";
          return;
        }

        const result = await response.json();
        if (!result.success || !result.usuario) {
          window.location.href = "/login";
          return;
        }

        setUsuario(result.usuario);
      } catch (error) {
        console.error("Error al cargar usuario:", error);
        window.location.href = "/login";
      } finally {
        setLoadingUsuario(false);
      }
    };

    cargarUsuario();
  }, []);

  // Cargar tarea + historial + estadísticas
  useEffect(() => {
    if (!usuario || !tareaId || Number.isNaN(tareaId)) return;

    const cargarTodo = async () => {
      try {
        setLoadingTarea(true);
        setLoadingHistorial(true);

        const [resTarea, resHist, resEst] = await Promise.all([
          fetch(`/api/tareas/${tareaId}?rol=${roleParam}`, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
          }),
          fetch(`/api/tareas/${tareaId}/historial`, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
          }).catch(() => null),
          fetch(
            `/api/tareas/estadisticas?usuario=${usuario.id_usuario}&rol=${roleParam}`,
            {
              method: "GET",
              headers: { "Content-Type": "application/json" },
              credentials: "include",
            }
          ).catch(() => null),
        ]);

        const dataTarea = await resTarea.json().catch(() => ({}));
        if (resTarea.ok && dataTarea.success && dataTarea.tarea) {
          setTarea(dataTarea.tarea as Tarea);
        } else {
          console.error("No se pudo cargar la tarea", dataTarea);
        }

        if (resHist && resHist.ok) {
          const dataHist = await resHist.json().catch(() => ({}));
          if (dataHist.success && Array.isArray(dataHist.historial)) {
            setHistorial(dataHist.historial as EventoHistorial[]);
          }
        }

        if (resEst && resEst.ok) {
          const dataEst = await resEst.json().catch(() => ({}));
          if (dataEst.success && dataEst.estadisticas) {
            setEstadisticas(dataEst.estadisticas as EstadisticasTareas);
          }
        }
      } catch (error) {
        console.error(
          "Error al cargar datos de historial de tarea (secretaría):",
          error
        );
      } finally {
        setLoadingTarea(false);
        setLoadingHistorial(false);
      }
    };

    cargarTodo();
  }, [usuario, tareaId]);

  // ========================================
  // FUNCIONES AUXILIARES
  // ========================================

  const cambiarTema = async (nuevoTema: TemaColor) => {
    setTemaActual(nuevoTema);
    const key = `tema_tareas_${roleParam}`;
    if (typeof window !== "undefined") {
      window.localStorage.setItem(key, nuevoTema);
    }
    try {
      await fetch("/api/users/preferencias/tema", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ tema_color: nuevoTema }),
      });
    } catch (error) {
      console.error("No se pudo guardar preferencia de tema:", error);
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

  const obtenerSaludo = () => {
    const hora = new Date().getHours();
    if (hora < 12) return "Buenos días";
    if (hora < 19) return "Buenas tardes";
    return "Buenas noches";
  };

  const formatearFecha = (fecha: string | null) => {
    if (!fecha) return "Sin fecha";
    const d = new Date(fecha);
    if (Number.isNaN(d.getTime())) return "Sin fecha";
    return new Intl.DateTimeFormat("es-CL", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(d);
  };

  const formatearFechaHora = (fecha: string) => {
    const d = new Date(fecha);
    if (Number.isNaN(d.getTime())) return fecha;
    return new Intl.DateTimeFormat("es-CL", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    }).format(d);
  };

  const obtenerColorEstado = (estado: string) => {
    const isDark = ["dark", "blue", "purple", "green"].includes(temaActual);
    const map: Record<string, string> = {
      pendiente: isDark
        ? "bg-yellow-500/20 text-yellow-300 border-yellow-500/40"
        : "bg-yellow-100 text-yellow-800 border-yellow-200",
      en_progreso: isDark
        ? "bg-sky-500/20 text-sky-300 border-sky-500/40"
        : "bg-sky-100 text-sky-800 border-sky-200",
      en_revision: isDark
        ? "bg-purple-500/20 text-purple-300 border-purple-500/40"
        : "bg-purple-100 text-purple-800 border-purple-200",
      completada: isDark
        ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
        : "bg-emerald-100 text-emerald-800 border-emerald-200",
      rechazada: isDark
        ? "bg-red-500/20 text-red-300 border-red-500/40"
        : "bg-red-100 text-red-800 border-red-200",
      cancelada: isDark
        ? "bg-rose-500/20 text-rose-300 border-rose-500/40"
        : "bg-rose-100 text-rose-800 border-rose-200",
    };

    return (
      map[estado.toLowerCase()] ||
      (isDark
        ? "bg-gray-500/20 text-gray-300 border-gray-500/40"
        : "bg-gray-100 text-gray-800 border-gray-200")
    );
  };

  const obtenerColorPrioridad = (prioridad: string) => {
    const isDark = ["dark", "blue", "purple", "green"].includes(temaActual);
    const map: Record<string, string> = {
      critica: isDark
        ? "bg-red-600/30 text-red-200 border-red-500/60"
        : "bg-red-100 text-red-800 border-red-300",
      urgente: isDark
        ? "bg-orange-500/30 text-orange-200 border-orange-500/60"
        : "bg-orange-100 text-orange-800 border-orange-300",
      alta: isDark
        ? "bg-amber-500/30 text-amber-200 border-amber-500/60"
        : "bg-amber-100 text-amber-800 border-amber-300",
      media: isDark
        ? "bg-sky-500/30 text-sky-200 border-sky-500/60"
        : "bg-sky-100 text-sky-800 border-sky-300",
      baja: isDark
        ? "bg-emerald-500/30 text-emerald-200 border-emerald-500/60"
        : "bg-emerald-100 text-emerald-800 border-emerald-300",
    };

    return (
      map[prioridad.toLowerCase()] ||
      (isDark
        ? "bg-gray-500/30 text-gray-200 border-gray-500/60"
        : "bg-gray-100 text-gray-800 border-gray-300")
    );
  };

  const marcarNotificacionLeida = (idNotificacion: number) => {
    setNotificaciones((prev) =>
      prev.map((n) =>
        n.id_notificacion === idNotificacion ? { ...n, leida: true } : n
      )
    );
  };

  const volverALista = () => {
    router.push("/secretaria/tareas");
  };

  const irADetalle = () => {
    if (tarea) router.push(`/secretaria/tareas/${tarea.id_tarea}`);
    else if (!Number.isNaN(tareaId)) router.push(`/secretaria/tareas/${tareaId}`);
    else router.push("/secretaria/tareas");
  };

  const irAEditar = () => {
    if (tarea) router.push(`/secretaria/tareas/${tarea.id_tarea}/editar`);
    else if (!Number.isNaN(tareaId))
      router.push(`/secretaria/tareas/${tareaId}/editar`);
  };

  const recargarHistorial = async () => {
    if (!tareaId || Number.isNaN(tareaId)) return;
    try {
      setLoadingHistorial(true);
      const resHist = await fetch(`/api/tareas/${tareaId}/historial`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
      const dataHist = await resHist.json().catch(() => ({}));
      if (resHist.ok && dataHist.success && Array.isArray(dataHist.historial)) {
        setHistorial(dataHist.historial as EventoHistorial[]);
      }
    } catch (error) {
      console.error("Error al recargar historial:", error);
    } finally {
      setLoadingHistorial(false);
    }
  };

  const exportarHistorialJSON = () => {
    try {
      const blob = new Blob([JSON.stringify(historial, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `historial_tarea_${tarea?.id_tarea ?? tareaId}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("No se pudo exportar el historial:", error);
    }
  };

  const obtenerIconoTendencia = (valor: number | undefined) => {
    if (valor === undefined || valor === 0) {
      return <Activity className="w-4 h-4 text-gray-400" />;
    }
    if (valor > 0) {
      return <ArrowUpRight className="w-4 h-4 text-green-500" />;
    }
    return <ArrowDownRight className="w-4 h-4 text-red-500" />;
  };

  const clasificarTipoCambio = (ev: EventoHistorial): TipoCambioHistorial => {
    const accion = (ev.accion || "").toLowerCase();

    if (accion.includes("crea") || accion === "creacion") return "creacion";
    if (ev.estado_anterior || ev.estado_nuevo || accion.includes("estado"))
      return "estado";
    if (
      accion.includes("responsable") ||
      accion.includes("asignacion") ||
      accion.includes("asignación")
    )
      return "asignaciones";
    if (accion.includes("sistema")) return "sistema";
    return "contenido";
  };

  // ========================================
  // DERIVADOS PARA FILTROS Y RESÚMENES
  // ========================================

  const usuariosHistorial: UsuarioHistorialResumen[] = useMemo(() => {
    const map = new Map<number, string>();
    historial.forEach((ev) => {
      if (ev.usuario?.id_usuario) {
        map.set(ev.usuario.id_usuario, ev.usuario.nombre_completo);
      }
    });
    return Array.from(map.entries()).map(([id, nombre]) => ({
      id_usuario: id,
      nombre_completo: nombre,
    }));
  }, [historial]);

  const accionesDisponibles: string[] = useMemo(() => {
    const set = new Set<string>();
    historial.forEach((ev) => {
      if (ev.accion) set.add(ev.accion);
    });
    return Array.from(set.values());
  }, [historial]);

  const historialOrdenado = useMemo(() => {
    const copia = [...historial];
    copia.sort((a, b) => {
      const da = new Date(a.fecha_hora).getTime() || 0;
      const db = new Date(b.fecha_hora).getTime() || 0;
      return ordenAscendente ? da - db : db - da;
    });
    return copia;
  }, [historial, ordenAscendente]);

  const historialFiltrado = useMemo(() => {
    let lista = [...historialOrdenado];

    if (filtroAccion !== "todos") {
      lista = lista.filter((ev) => ev.accion === filtroAccion);
    }

    if (filtroUsuario !== "todos") {
      lista = lista.filter(
        (ev) => ev.usuario?.id_usuario === (filtroUsuario as number)
      );
    }

    if (filtroTipoCambio !== "todos") {
      lista = lista.filter(
        (ev) => clasificarTipoCambio(ev) === filtroTipoCambio
      );
    }

    if (soloCambiosEstado) {
      lista = lista.filter((ev) => ev.estado_anterior || ev.estado_nuevo);
    }

    if (busqueda.trim()) {
      const q = busqueda.toLowerCase();
      lista = lista.filter((ev) => {
        const texto =
          `${ev.accion} ${ev.detalle ?? ""} ${
            ev.usuario?.nombre_completo ?? ""
          } ${formatearFechaHora(ev.fecha_hora)}`.toLowerCase();
        return texto.includes(q);
      });
    }

    return lista;
  }, [
    historialOrdenado,
    filtroAccion,
    filtroUsuario,
    filtroTipoCambio,
    soloCambiosEstado,
    busqueda,
  ]);

  const totalCambiosEstado = useMemo(
    () =>
      historial.filter((ev) => ev.estado_anterior || ev.estado_nuevo).length,
    [historial]
  );
  const totalEventos = historial.length;
  const primerEvento = historialOrdenado[0];
  const ultimoEvento = historialOrdenado[historialOrdenado.length - 1];

  const totalPorTipoCambio = useMemo(() => {
    const cont: Record<TipoCambioHistorial, number> = {
      todos: totalEventos,
      creacion: 0,
      estado: 0,
      contenido: 0,
      asignaciones: 0,
      sistema: 0,
    };
    historial.forEach((ev) => {
      const tipo = clasificarTipoCambio(ev);
      cont[tipo] = (cont[tipo] || 0) + 1;
    });
    return cont;
  }, [historial, totalEventos]);

  // ========================================
  // RENDER: ESTADOS ESPECIALES
  // ========================================

  if (loadingUsuario || !usuario) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center bg-gradient-to-br ${tema.colores.fondo}`}
      >
        <div className="text-center">
          <div className="relative mb-8">
            <div className="w-32 h-32 border-4 border-indigo-400 border-t-transparent rounded-full animate-spin" />
            <div
              className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 bg-gradient-to-br ${tema.colores.gradiente} rounded-full flex items-center justify-center animate-pulse`}
            >
              <Clock className="w-10 h-10 text-white" />
            </div>
          </div>
          <h2 className={`text-4xl font-black mb-4 ${tema.colores.texto}`}>
            Cargando historial de la tarea...
          </h2>
          <p
            className={`text-lg font-semibold ${tema.colores.textoSecundario} animate-pulse`}
          >
            Preparando la trazabilidad completa para la Secretaría
          </p>
        </div>
      </div>
    );
  }

  if (!tareaId || Number.isNaN(tareaId)) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center bg-gradient-to-br ${tema.colores.fondo}`}
      >
        <div
          className={`max-w-md mx-auto p-8 rounded-3xl ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} text-center`}
        >
          <div className="w-16 h-16 rounded-2xl bg-red-500/20 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-400" />
          </div>
          <h2 className={`text-2xl font-black mb-2 ${tema.colores.texto}`}>
            Tarea no válida
          </h2>
          <p className={tema.colores.textoSecundario}>
            No se pudo identificar el identificador de la tarea para mostrar su
            historial.
          </p>
          <button
            onClick={volverALista}
            className={`mt-6 inline-flex items-center gap-2 px-6 py-3 rounded-2xl font-bold ${tema.colores.primario} text-white ${tema.colores.sombra}`}
          >
            <ArrowLeft className="w-4 h-4" />
            Volver a mis tareas
          </button>
        </div>
      </div>
    );
  }

  // ========================================
  // RENDER PRINCIPAL
  // ========================================

  return (
    <div
      className={`min-h-screen transition-all duration-500 bg-gradient-to-br ${tema.colores.fondo}`}
    >
      {/* SIDEBAR */}
      <aside
        className={`fixed left-0 top-0 h-full z-50 transition-all duration-300 ${
          sidebarAbierto ? "w-72" : "w-20"
        } ${tema.colores.sidebar} ${tema.colores.borde} border-r ${
          tema.colores.sombra
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo y Toggle */}
          <div className="flex items-center justify-between p-6 border-b border-gray-700/40">
            {sidebarAbierto ? (
              <div className="flex items-center gap-3">
                <div
                  className={`w-12 h-12 bg-gradient-to-br ${tema.colores.gradiente} rounded-xl flex items-center justify-center shadow-lg`}
                >
                  <Clock className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className={`text-xl font-black ${tema.colores.texto}`}>
                    AnyssaMed
                  </h1>
                  <p
                    className={`text-xs font-semibold ${tema.colores.acento}`}
                  >
                    Historial Tarea · Secretaría
                  </p>
                </div>
              </div>
            ) : (
              <div
                className={`w-12 h-12 bg-gradient-to-br ${tema.colores.gradiente} rounded-xl flex items-center justify-center shadow-lg mx-auto`}
              >
                <Clock className="w-6 h-6 text-white" />
              </div>
            )}

            <button
              onClick={() => setSidebarAbierto((v) => !v)}
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
                {item.submenu ? (
                  <>
                    <button
                      onClick={() =>
                        setMenuExpandido(
                          menuExpandido === item.titulo ? null : item.titulo
                        )
                      }
                      onMouseEnter={() => setSidebarAbierto(true)}
                      className={`w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl font-semibold transition-all duration-300 group ${
                        item.activo
                          ? `bg-gradient-to-r ${tema.colores.gradiente} text-white ${tema.colores.sombra}`
                          : `${tema.colores.hover} ${tema.colores.texto}`
                      }`}
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

                      {sidebarAbierto && (
                        <ChevronDown
                          className={`w-4 h-4 transition-transform ${
                            menuExpandido === item.titulo ? "rotate-180" : ""
                          }`}
                        />
                      )}
                    </button>

                    {sidebarAbierto && menuExpandido === item.titulo && (
                      <div className="mt-2 ml-4 space-y-1">
                        {item.submenu.map((sub, subindex) => (
                          <Link
                            key={subindex}
                            href={sub.url}
                            target={sub.target}
                            rel={sub.rel}
                            className={`flex items-center gap-3 px-4 py-2 rounded-lg font-medium text-sm transition-all duration-300 ${tema.colores.hover} ${tema.colores.textoSecundario} hover:${tema.colores.acento}`}
                          >
                            <sub.icono className="w-4 h-4" />
                            <span>{sub.titulo}</span>
                          </Link>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <Link
                    href={item.url}
                    className={`flex items-center justify-between gap-3 px-4 py-3 rounded-xl font-semibold transition-all duration-300 group ${
                      item.activo
                        ? `bg-gradient-to-r ${tema.colores.gradiente} text-white ${tema.colores.sombra}`
                        : `${tema.colores.hover} ${tema.colores.texto}`
                    }`}
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
                  </Link>
                )}
              </div>
            ))}
          </nav>

          {/* Usuario */}
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
                    {roleLabel}
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
        } ${tema.colores.header} ${tema.colores.borde} border-b ${
          tema.colores.sombra
        }`}
      >
        <div className="flex items-center justify-between px-8 py-4">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <button
              onClick={volverALista}
              className={`hidden sm:inline-flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold ${tema.colores.secundario} ${tema.colores.texto}`}
            >
              <ArrowLeft className="w-4 h-4" />
              Volver a mis tareas
            </button>
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2
                  className={`text-xl md:text-2xl font-black truncate ${tema.colores.texto}`}
                >
                  Historial de la tarea
                  {tarea && ` · #${tarea.id_tarea}`}
                </h2>
                {tarea && (
                  <span
                    className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border ${obtenerColorEstado(
                      tarea.estado
                    )} text-[10px] font-bold`}
                  >
                    <Activity className="w-3 h-3" />
                    Estado actual: {tarea.estado.toUpperCase()}
                  </span>
                )}
              </div>
              <p
                className={`text-xs md:text-sm ${tema.colores.textoSecundario}`}
              >
                {obtenerSaludo()}, {usuario.nombre}. Estás revisando la
                trazabilidad completa de esta tarea para garantizar auditoría y
                seguridad clínica.
              </p>
            </div>
          </div>

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
                  Seleccionar tema
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
                onClick={() => setNotificacionesAbiertas((v) => !v)}
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
                  className={`absolute right-0 mt-2 w-96 rounded-2xl ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} max-h-96 overflow-y-auto custom-scrollbar`}
                >
                  <div
                    className={`p-4 border-b ${tema.colores.borde} sticky top-0 ${tema.colores.card} backdrop-blur-xl`}
                  >
                    <div className="flex items-center justify-between">
                      <h3
                        className={`text-lg font-black ${tema.colores.texto}`}
                      >
                        Notificaciones
                      </h3>
                      <button
                        className={`text-sm font-semibold ${tema.colores.acento} hover:underline`}
                        onClick={() =>
                          setNotificaciones((prev) =>
                            prev.map((n) => ({ ...n, leida: true }))
                          )
                        }
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
                      <p className={`text-sm ${tema.colores.textoSecundario}`}>
                        No tienes notificaciones nuevas
                      </p>
                    </div>
                  ) : (
                    <div className={`divide-y ${tema.colores.borde}`}>
                      {notificaciones.map((notif) => (
                        <div
                          key={notif.id_notificacion}
                          className={`p-4 ${tema.colores.hover} cursor-pointer transition-all ${
                            !notif.leida ? "bg-indigo-500/5" : ""
                          }`}
                          onClick={() =>
                            marcarNotificacionLeida(notif.id_notificacion)
                          }
                        >
                          <div className="flex items-start gap-3">
                            <div
                              className={`w-2 h-2 rounded-full mt-2 ${
                                !notif.leida ? "bg-indigo-500" : "bg-gray-500"
                              }`}
                            />
                            <div className="flex-1">
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
                                {formatearFechaHora(notif.fecha_hora)}
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

            {/* Acciones rápidas historial */}
            <button
              onClick={recargarHistorial}
              disabled={loadingHistorial}
              className={`hidden sm:inline-flex items-center gap-2 px-4 py-3 rounded-xl font-bold text-sm ${tema.colores.secundario} ${tema.colores.texto} ${tema.colores.sombra} hover:scale-105 transition-all disabled:opacity-50`}
            >
              <RefreshCw
                className={`w-4 h-4 ${
                  loadingHistorial ? "animate-spin" : ""
                }`}
              />
              Recargar historial
            </button>

            <button
              onClick={exportarHistorialJSON}
              disabled={historial.length === 0}
              className={`hidden sm:inline-flex items-center gap-2 px-4 py-3 rounded-xl font-bold text-sm ${tema.colores.primario} text-white ${tema.colores.sombra} hover:scale-105 transition-all disabled:opacity-50`}
            >
              <Download className="w-4 h-4" />
              Exportar JSON
            </button>

            {/* Perfil */}
            <div className="relative">
              <button
                onClick={() => setPerfilAbierto((v) => !v)}
                className={`flex items-center gap-3 px-4 py-2 rounded-xl transition-all duration-300 ${tema.colores.hover}`}
              >
                <div className="text-right hidden md:block">
                  <p className={`text-sm font-bold ${tema.colores.texto}`}>
                    {usuario.nombre} {usuario.apellido_paterno}
                  </p>
                  <p className={`text-xs ${tema.colores.textoSecundario}`}>
                    {roleLabel}
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
                  <div className="flex items-center gap-4 mb-4 pb-4 border-b border-gray-700/40">
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
                        {roleLabel}
                      </p>
                      <p
                        className={`text-xs ${tema.colores.textoSecundario}`}
                      >
                        {usuario.email}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Link
                      href={`/secretaria/perfil`}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all duration-300 ${tema.colores.hover} ${tema.colores.texto}`}
                    >
                      <User className="w-5 h-5" />
                      <span>Mi Perfil</span>
                    </Link>
                    <Link
                      href={`/secretaria/configuracion`}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all duration-300 ${tema.colores.hover} ${tema.colores.texto}`}
                    >
                      <Settings className="w-5 h-5" />
                      <span>Configuración</span>
                    </Link>
                    <button
                      onClick={cerrarSesion}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all duration-300 ${tema.colores.hover} text-red-400 hover:text-red-300`}
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
        {/* Breadcrumb / encabezado secundario */}
        <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex flex-col gap-2">
            <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-wide">
              <button
                onClick={volverALista}
                className={`inline-flex items-center gap-1 px-3 py-1 rounded-full ${tema.colores.secundario} ${tema.colores.texto}`}
              >
                <ArrowLeft className="w-3 h-3" />
                Volver a tareas
              </button>
              <span className={tema.colores.textoSecundario}>·</span>
              <span className={tema.colores.textoSecundario}>
                Tarea #{tarea?.id_tarea ?? tareaId}
              </span>
              <span className={tema.colores.textoSecundario}>·</span>
              <span className={tema.colores.textoSecundario}>Historial</span>
            </div>
            <h2
              className={`text-3xl md:text-4xl font-black flex items-center gap-2 ${tema.colores.texto}`}
            >
              Historial inteligente y trazabilidad
              <Sparkles className="w-6 h-6 text-yellow-400" />
            </h2>
            <p className={tema.colores.textoSecundario}>
              Visualiza cada cambio realizado en esta tarea: quién lo hizo,
              cuándo y qué se modificó. Optimizado para auditorías clínicas y
              gestión avanzada.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={irADetalle}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold ${tema.colores.secundario} ${tema.colores.texto} ${tema.colores.sombra} hover:scale-105 transition-all`}
            >
              <Eye className="w-4 h-4" />
              Ver detalle de la tarea
            </button>
            <button
              onClick={irAEditar}
              className={`inline-flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-sm ${tema.colores.primario} text-white ${tema.colores.sombra} hover:scale-105 transition-all`}
            >
              <Edit className="w-4 h-4" />
              Ir al editor de tarea
            </button>
          </div>
        </div>

        {/* GRID PRINCIPAL */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
          {/* Columna izquierda: resumen de la tarea */}
          <div className="space-y-6">
            <div
              className={`rounded-2xl p-5 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra}`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
                    <PieChart className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3
                      className={`text-sm font-black ${tema.colores.texto}`}
                    >
                      Resumen de la tarea
                    </h3>
                    <p
                      className={`text-[11px] ${tema.colores.textoSecundario}`}
                    >
                      Datos clave para entender el contexto del historial
                    </p>
                  </div>
                </div>
                {tarea && (
                  <span
                    className={`inline-flex items-center gap-1 px-3 py-1 rounded-full border ${obtenerColorPrioridad(
                      tarea.prioridad
                    )} text-[10px] font-bold`}
                  >
                    <Flame className="w-3 h-3" />
                    {tarea.prioridad.toUpperCase()}
                  </span>
                )}
              </div>

              {loadingTarea && !tarea ? (
                <div className="space-y-4 animate-pulse text-xs">
                  <div className="h-4 w-40 bg-gray-500/20 rounded" />
                  <div className="h-3 w-24 bg-gray-500/20 rounded" />
                  <div className="h-3 w-32 bg-gray-500/20 rounded" />
                  <div className="h-3 w-28 bg-gray-500/20 rounded" />
                </div>
              ) : tarea ? (
                <div className="space-y-4 text-xs">
                  <div>
                    <p
                      className={`text-[11px] uppercase font-semibold ${tema.colores.textoSecundario}`}
                    >
                      Título
                    </p>
                    <p className={`text-sm font-bold ${tema.colores.texto}`}>
                      {tarea.titulo}
                    </p>
                  </div>

                  <div>
                    <p
                      className={`text-[11px] uppercase font-semibold ${tema.colores.textoSecundario}`}
                    >
                      Descripción
                    </p>
                    <p className={`text-xs ${tema.colores.textoSecundario}`}>
                      {tarea.descripcion || "Sin descripción registrada"}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p
                        className={`text-[11px] uppercase font-semibold ${tema.colores.textoSecundario}`}
                      >
                        Estado actual
                      </p>
                      <span
                        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full border ${obtenerColorEstado(
                          tarea.estado
                        )}`}
                      >
                        {tarea.estado === "completada" ? (
                          <CheckCircle2 className="w-3 h-3" />
                        ) : tarea.estado === "pendiente" ? (
                          <Clock className="w-3 h-3" />
                        ) : (
                          <Activity className="w-3 h-3" />
                        )}
                        {tarea.estado.toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p
                        className={`text-[11px] uppercase font-semibold ${tema.colores.textoSecundario}`}
                      >
                        Tipo
                      </p>
                      <span
                        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full border ${tema.colores.borde} ${tema.colores.textoSecundario}`}
                      >
                        <Briefcase className="w-3 h-3" />
                        {tarea.tipo}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p
                        className={`text-[11px] uppercase font-semibold ${tema.colores.textoSecundario}`}
                      >
                        Centro
                      </p>
                      <p className={`text-[11px] ${tema.colores.texto}`}>
                        {tarea.centro?.nombre ?? "Sin centro asociado"}
                      </p>
                    </div>
                    <div>
                      <p
                        className={`text-[11px] uppercase font-semibold ${tema.colores.textoSecundario}`}
                      >
                        Sucursal
                      </p>
                      <p className={`text-[11px] ${tema.colores.texto}`}>
                        {tarea.sucursal?.nombre ?? "Sin sucursal"}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p
                        className={`text-[11px] uppercase font-semibold ${tema.colores.textoSecundario}`}
                      >
                        Creada
                      </p>
                      <p className={`text-[11px] ${tema.colores.texto}`}>
                        {formatearFecha(tarea.fecha_creacion)}
                      </p>
                    </div>
                    <div>
                      <p
                        className={`text-[11px] uppercase font-semibold ${tema.colores.textoSecundario}`}
                      >
                        Fecha límite
                      </p>
                      <p className={`text-[11px] ${tema.colores.texto}`}>
                        {tarea.fecha_limite
                          ? formatearFecha(tarea.fecha_limite)
                          : "Sin fecha límite"}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p
                        className={`text-[11px] uppercase font-semibold ${tema.colores.textoSecundario}`}
                      >
                        Creador
                      </p>
                      <p className={`text-[11px] ${tema.colores.texto}`}>
                        {tarea.creador.nombre_completo}
                      </p>
                    </div>
                    <div>
                      <p
                        className={`text-[11px] uppercase font-semibold ${tema.colores.textoSecundario}`}
                      >
                        Responsable
                      </p>
                      <p className={`text-[11px] ${tema.colores.texto}`}>
                        {tarea.responsable.nombre_completo}
                      </p>
                    </div>
                  </div>

                  {tarea.tags?.length > 0 && (
                    <div>
                      <p
                        className={`text-[11px] uppercase font-semibold mb-1 ${tema.colores.textoSecundario}`}
                      >
                        Etiquetas
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {tarea.tags.map((tag) => (
                          <span
                            key={tag}
                            className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] bg-indigo-500/10 border border-indigo-500/40 text-indigo-300"
                          >
                            <HashIcon />
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="h-24 flex items-center justify-center text-xs text-gray-400">
                  No se pudo cargar la información de la tarea.
                </div>
              )}
            </div>

            {/* Métricas del historial */}
            <div
              className={`rounded-2xl p-5 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra}`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
                    <BarChart3 className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3
                      className={`text-sm font-black ${tema.colores.texto}`}
                    >
                      Métricas del historial
                    </h3>
                    <p
                      className={`text-[11px] ${tema.colores.textoSecundario}`}
                    >
                      Vista rápida de los eventos registrados
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="rounded-xl px-3 py-3 bg-black/5 border border-white/5 flex flex-col gap-1">
                  <span className={tema.colores.textoSecundario}>
                    Eventos totales
                  </span>
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-lg font-black ${tema.colores.texto}`}
                    >
                      {totalEventos}
                    </span>
                    {obtenerIconoTendencia(totalEventos)}
                  </div>
                </div>

                <div className="rounded-xl px-3 py-3 bg-black/5 border border-white/5 flex flex-col gap-1">
                  <span className={tema.colores.textoSecundario}>
                    Cambios de estado
                  </span>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-black text-emerald-400">
                      {totalCambiosEstado}
                    </span>
                    <CheckSquare2 className="w-4 h-4 text-emerald-400" />
                  </div>
                </div>

                <div className="rounded-xl px-3 py-3 bg-black/5 border border-white/5 flex flex-col gap-1">
                  <span className={tema.colores.textoSecundario}>
                    Eventos de creación
                  </span>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-black text-indigo-400">
                      {totalPorTipoCambio.creacion}
                    </span>
                    <Sparkles className="w-4 h-4 text-indigo-400" />
                  </div>
                </div>

                <div className="rounded-xl px-3 py-3 bg-black/5 border border-white/5 flex flex-col gap-1">
                  <span className={tema.colores.textoSecundario}>
                    Cambios de contenido
                  </span>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-black text-amber-400">
                      {totalPorTipoCambio.contenido}
                    </span>
                    <Edit className="w-4 h-4 text-amber-400" />
                  </div>
                </div>
              </div>

              <div className="mt-4 text-[11px] space-y-1">
                <div className="flex items-center justify-between">
                  <span className={tema.colores.textoSecundario}>
                    Primer evento
                  </span>
                  <span className={tema.colores.texto}>
                    {primerEvento
                      ? formatearFechaHora(primerEvento.fecha_hora)
                      : "-"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className={tema.colores.textoSecundario}>
                    Último evento
                  </span>
                  <span className={tema.colores.texto}>
                    {ultimoEvento
                      ? formatearFechaHora(ultimoEvento.fecha_hora)
                      : "-"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Columna principal: filtros + línea de tiempo */}
          <div className="xl:col-span-2 space-y-6">
            {/* Filtros avanzados */}
            <div className="relative rounded-3xl p-[1px] bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-500">
              <div
                className={`rounded-[1.4rem] p-5 md:p-6 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra}`}
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
                  <div>
                    <h3
                      className={`text-sm md:text-base font-black flex items-center gap-2 ${tema.colores.texto}`}
                    >
                      Filtros del historial
                      <Filter className="w-4 h-4" />
                    </h3>
                    <p
                      className={`text-[11px] ${tema.colores.textoSecundario}`}
                    >
                      Combina filtros por acción, usuario, tipo de cambio y
                      búsqueda de texto libre.
                    </p>
                  </div>
                  <div className="text-[11px] text-right">
                    <p className={tema.colores.textoSecundario}>
                      Mostrando{" "}
                      <span className="font-bold text-emerald-300">
                        {historialFiltrado.length}
                      </span>{" "}
                      de{" "}
                      <span className="font-bold">
                        {historialOrdenado.length}
                      </span>{" "}
                      eventos
                    </p>
                    {busqueda.trim() ||
                    filtroAccion !== "todos" ||
                    filtroUsuario !== "todos" ||
                    filtroTipoCambio !== "todos" ||
                    soloCambiosEstado ? (
                      <button
                        onClick={() => {
                          setBusqueda("");
                          setFiltroAccion("todos");
                          setFiltroUsuario("todos");
                          setFiltroTipoCambio("todos");
                          setSoloCambiosEstado(false);
                        }}
                        className={`mt-1 inline-flex items-center gap-1 px-2 py-1 rounded-full border ${tema.colores.borde} ${tema.colores.textoSecundario}`}
                      >
                        <X className="w-3 h-3" />
                        Limpiar filtros
                      </button>
                    ) : null}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
                  {/* Búsqueda */}
                  <div className="md:col-span-2">
                    <label
                      className={`text-[11px] font-semibold uppercase tracking-wide ${tema.colores.textoSecundario}`}
                    >
                      Buscar en el historial
                    </label>
                    <div className="mt-1 flex items-center gap-2 px-3 py-2 rounded-xl border bg-black/5">
                      <Search className="w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        value={busqueda}
                        onChange={(e) => setBusqueda(e.target.value)}
                        placeholder="Paciente, usuario, acción, detalle..."
                        className={`flex-1 bg-transparent outline-none border-none text-xs ${tema.colores.texto} placeholder:${tema.colores.textoSecundario}`}
                      />
                    </div>
                  </div>

                  {/* Acción */}
                  <div>
                    <label
                      className={`text-[11px] font-semibold uppercase tracking-wide ${tema.colores.textoSecundario}`}
                    >
                      Acción
                    </label>
                    <select
                      value={filtroAccion}
                      onChange={(e) => setFiltroAccion(e.target.value)}
                      className={`mt-1 w-full px-3 py-2 rounded-xl border text-xs ${tema.colores.card} ${tema.colores.texto} ${tema.colores.borde} focus:outline-none focus:ring-2 focus:ring-indigo-500/50`}
                    >
                      <option value="todos">Todas las acciones</option>
                      {accionesDisponibles.map((ac) => (
                        <option key={ac} value={ac}>
                          {ac}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Usuario */}
                  <div>
                    <label
                      className={`text-[11px] font-semibold uppercase tracking-wide ${tema.colores.textoSecundario}`}
                    >
                      Usuario
                    </label>
                    <select
                      value={filtroUsuario === "todos" ? "todos" : filtroUsuario}
                      onChange={(e) =>
                        setFiltroUsuario(
                          e.target.value === "todos"
                            ? "todos"
                            : Number(e.target.value)
                        )
                      }
                      className={`mt-1 w-full px-3 py-2 rounded-xl border text-xs ${tema.colores.card} ${tema.colores.texto} ${tema.colores.borde} focus:outline-none focus:ring-2 focus:ring-indigo-500/50`}
                    >
                      <option value="todos">Todos los usuarios</option>
                      {usuariosHistorial.map((u) => (
                        <option key={u.id_usuario} value={u.id_usuario}>
                          {u.nombre_completo}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-3 text-[11px]">
                  {/* Tipo de cambio */}
                  <div className="flex flex-wrap gap-2">
                    {(
                      [
                        "todos",
                        "creacion",
                        "estado",
                        "contenido",
                        "asignaciones",
                        "sistema",
                      ] as TipoCambioHistorial[]
                    ).map((tipo) => {
                      const labelMap: Record<TipoCambioHistorial, string> = {
                        todos: "Todos",
                        creacion: "Creación",
                        estado: "Estado",
                        contenido: "Contenido",
                        asignaciones: "Asignaciones",
                        sistema: "Sistema",
                      };
                      const Icono =
                        tipo === "creacion"
                          ? Sparkles
                          : tipo === "estado"
                          ? Activity
                          : tipo === "contenido"
                          ? Edit
                          : tipo === "asignaciones"
                          ? UserCheck
                          : tipo === "sistema"
                          ? Shield
                          : Filter;

                      return (
                        <button
                          key={tipo}
                          onClick={() => setFiltroTipoCambio(tipo)}
                          className={`inline-flex items-center gap-1 px-3 py-1 rounded-full border transition-all ${
                            filtroTipoCambio === tipo
                              ? `bg-gradient-to-r ${tema.colores.gradiente} text-white`
                              : `${tema.colores.hover} ${tema.colores.textoSecundario} ${tema.colores.borde}`
                          }`}
                        >
                          <Icono className="w-3 h-3" />
                          {labelMap[tipo]}
                          {tipo !== "todos" && (
                            <span className="font-bold">
                              {totalPorTipoCambio[tipo]}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Solo cambios de estado */}
                  <button
                    onClick={() => setSoloCambiosEstado((v) => !v)}
                    className={`inline-flex items-center gap-1 px-3 py-1 rounded-full border transition-all ${
                      soloCambiosEstado
                        ? "bg-emerald-500/20 border-emerald-400 text-emerald-200"
                        : `${tema.colores.hover} ${tema.colores.textoSecundario} ${tema.colores.borde}`
                    }`}
                  >
                    <ShieldCheck className="w-3 h-3" />
                    Solo cambios de estado
                  </button>

                  {/* Orden */}
                  <button
                    onClick={() => setOrdenAscendente((v) => !v)}
                    className={`inline-flex items-center gap-1 px-3 py-1 rounded-full border transition-all ${tema.colores.hover} ${tema.colores.textoSecundario} ${tema.colores.borde}`}
                  >
                    {ordenAscendente ? (
                      <ArrowUpRight className="w-3 h-3" />
                    ) : (
                      <ArrowDownRight className="w-3 h-3" />
                    )}
                    Orden:{" "}
                    {ordenAscendente ? "Más antiguo → más reciente" : "Más reciente → más antiguo"}
                  </button>
                </div>
              </div>
            </div>

            {/* Línea de tiempo */}
            <div
              className={`rounded-2xl p-5 md:p-6 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} max-h-[650px] overflow-hidden flex flex-col`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
                    <Clock className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3
                      className={`text-sm font-black ${tema.colores.texto}`}
                    >
                      Línea de tiempo de eventos
                    </h3>
                    <p
                      className={`text-[11px] ${tema.colores.textoSecundario}`}
                    >
                      Cada punto representa un evento registrado en el sistema.
                    </p>
                  </div>
                </div>
                <span
                  className={`text-[11px] ${tema.colores.textoSecundario}`}
                >
                  {loadingHistorial
                    ? "Cargando historial..."
                    : historialFiltrado.length === 0
                    ? "Sin eventos con los filtros actuales"
                    : `${historialFiltrado.length} evento(s) visibles`}
                </span>
              </div>

              <div className="flex-1 overflow-y-auto custom-scrollbar pr-1">
                {loadingHistorial ? (
                  <div className="space-y-3 animate-pulse">
                    {Array.from({ length: 6 }).map((_, i) => (
                      <div key={i} className="flex gap-3">
                        <div className="w-6 flex justify-center">
                          <div className="w-2 h-2 rounded-full bg-gray-500/40 mt-2" />
                        </div>
                        <div className="flex-1 space-y-1">
                          <div className="h-3 w-40 bg-gray-500/20 rounded" />
                          <div className="h-3 w-24 bg-gray-500/20 rounded" />
                          <div className="h-3 w-full bg-gray-500/20 rounded" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : historialFiltrado.length === 0 ? (
                  <div className="py-10 text-center text-xs">
                    <ClipboardCheck
                      className={`w-8 h-8 mx-auto mb-2 ${tema.colores.textoSecundario}`}
                    />
                    <p className={tema.colores.textoSecundario}>
                      No hay eventos para mostrar con los filtros actuales.
                    </p>
                  </div>
                ) : (
                  <div className="relative pl-3">
                    <div className="absolute left-[6px] top-1 bottom-1 w-px bg-gradient-to-b from-indigo-500/60 via-purple-500/60 to-emerald-500/40" />
                    <div className="space-y-4">
                      {historialFiltrado.map((ev, idx) => {
                        const tipoCambio = clasificarTipoCambio(ev);
                        const esCambioEstado =
                          tipoCambio === "estado" ||
                          ev.estado_anterior ||
                          ev.estado_nuevo;

                        return (
                          <div key={ev.id_evento ?? idx} className="flex gap-3">
                            <div className="w-4 flex justify-center">
                              <div
                                className={`w-3 h-3 rounded-full mt-1 shadow ring-2 ${
                                  esCambioEstado
                                    ? "bg-emerald-400 ring-emerald-500/40"
                                    : tipoCambio === "creacion"
                                    ? "bg-indigo-400 ring-indigo-500/40"
                                    : tipoCambio === "asignaciones"
                                    ? "bg-sky-400 ring-sky-500/40"
                                    : tipoCambio === "sistema"
                                    ? "bg-purple-400 ring-purple-500/40"
                                    : "bg-amber-400 ring-amber-500/40"
                                }`}
                              />
                            </div>
                            <div className="flex-1 space-y-0.5 text-xs">
                              <div className="flex items-center justify-between gap-2">
                                <div className="flex flex-wrap items-center gap-2">
                                  <span
                                    className={`font-bold ${tema.colores.texto}`}
                                  >
                                    {ev.accion}
                                  </span>
                                  {tipoCambio === "creacion" && (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/40 text-[10px] text-indigo-200">
                                      <Sparkles className="w-3 h-3" />
                                      Creación de tarea
                                    </span>
                                  )}
                                  {esCambioEstado && (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/40 text-[10px] text-emerald-200">
                                      <Activity className="w-3 h-3" />
                                      Cambio de estado
                                    </span>
                                  )}
                                </div>
                                <span
                                  className={`text-[10px] ${tema.colores.textoSecundario}`}
                                >
                                  {formatearFechaHora(ev.fecha_hora)}
                                </span>
                              </div>

                              {ev.detalle && (
                                <p
                                  className={`text-[11px] ${tema.colores.textoSecundario}`}
                                >
                                  {ev.detalle}
                                </p>
                              )}

                              <div className="flex flex-wrap items-center gap-2 mt-1 text-[10px]">
                                {ev.usuario && (
                                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-white/5 border border-white/10">
                                    <User className="w-3 h-3" />
                                    {ev.usuario.nombre_completo}
                                  </span>
                                )}

                                {ev.estado_anterior && (
                                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-amber-500/10 border border-amber-500/40 text-amber-200">
                                    <ArrowDownRight className="w-3 h-3" />
                                    {ev.estado_anterior.replace("_", " ")}
                                  </span>
                                )}

                                {ev.estado_nuevo && (
                                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/40 text-emerald-200">
                                    <ArrowUpRight className="w-3 h-3" />
                                    {ev.estado_nuevo.replace("_", " ")}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Leyenda / nota legal */}
            <div
              className={`rounded-2xl p-4 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} flex flex-col md:flex-row md:items-center md:justify-between gap-3 text-xs`}
            >
              <div className="flex items-center gap-3">
                <Shield className="w-6 h-6 text-emerald-400" />
                <div>
                  <p className={tema.colores.texto}>
                    Este historial forma parte de la trazabilidad oficial de
                    INFOGES para auditorías internas y externas.
                  </p>
                  <p className={tema.colores.textoSecundario}>
                    No se eliminan eventos: cada cambio queda registrado con
                    fecha, usuario y acción ejecutada.
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2 mt-1 md:mt-0">
                <button
                  onClick={exportarHistorialJSON}
                  disabled={historial.length === 0}
                  className={`inline-flex items-center gap-2 px-3 py-2 rounded-xl font-semibold ${tema.colores.secundario} ${tema.colores.texto} ${tema.colores.sombra} disabled:opacity-50`}
                >
                  <Download className="w-3 h-3" />
                  Exportar copia
                </button>
                <button
                  onClick={irADetalle}
                  className={`inline-flex items-center gap-2 px-3 py-2 rounded-xl font-semibold ${tema.colores.hover} ${tema.colores.texto}`}
                >
                  <Eye className="w-3 h-3" />
                  Ver tarea
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer
          className={`transition-all duration-300 mt-10 rounded-2xl ${tema.colores.card} ${tema.colores.borde} border py-4 px-6 flex flex-col sm:flex-row items-center justify-between gap-3`}
        >
          <div className="flex items-center gap-2">
            <p
              className={`text-xs sm:text-sm font-semibold ${tema.colores.textoSecundario}`}
            >
              © 2025 AnyssaMed · Historial de Tareas INFOGES (Secretaría).
            </p>
            <span
              className={`px-3 py-1 rounded-full text-[10px] font-bold bg-gradient-to-r ${tema.colores.gradiente} text-white`}
            >
              v1.0.0 ULTRA PREMIUM
            </span>
          </div>
          <div className="flex items-center gap-4 text-xs sm:text-sm">
            <Link
              href="/ayuda"
              className={`font-bold transition-colors ${tema.colores.textoSecundario} hover:${tema.colores.acento}`}
            >
              Ayuda
            </Link>
            <Link
              href="/privacidad"
              className={`font-bold transition-colors ${tema.colores.textoSecundario} hover:${tema.colores.acento}`}
            >
              Privacidad
            </Link>
            <button
              onClick={cerrarSesion}
              className="font-bold text-red-400 hover:text-red-300 transition-colors"
            >
              Cerrar Sesión
            </button>
          </div>
        </footer>
      </main>

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

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
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

        .animate-wave {
          animation: wave 1s ease-in-out infinite;
        }

        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }

        .animate-scaleIn {
          animation: scaleIn 0.3s ease-out;
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

// Pequeño icono de hash para las tags (evita importar otro icono)
function HashIcon() {
  return (
    <span className="inline-block w-3 h-3 border-[1.5px] border-current rounded-[4px] leading-none" />
  );
}
