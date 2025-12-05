// src/app/(dashboard)/tecnico/tareas/page.tsx
"use client";

import { useState, useEffect, useMemo } from "react";
import SidebarTecnico from "@/components/tecnico/SidebarTecnico";

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
  Building2,
  WifiOff,
  X,
  Zap,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  Stethoscope,
  FileSpreadsheet,
  Pill,
  PhoneOutgoing,
  PhoneIncoming,
  Radio,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";

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

interface CentroResumen {
  id_centro: number;
  nombre: string;
}

interface SucursalResumen {
  id_sucursal: number;
  nombre: string;
  id_centro: number;
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

// ========================================
// CONFIGURACIÓN DE TEMAS ULTRA PREMIUM
// ========================================

const TEMAS: Record<TemaColor, ConfiguracionTema> = {
  light: {
    nombre: "Claro Profesional",
    icono: Sun,
    colores: {
      fondo: "from-slate-50 via-blue-50 to-indigo-50",
      fondoSecundario: "bg-white",
      texto: "text-gray-900",
      textoSecundario: "text-gray-600",
      primario:
        "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700",
      secundario: "bg-gray-100 hover:bg-gray-200",
      acento: "text-indigo-600",
      borde: "border-gray-200",
      sombra: "shadow-2xl shadow-indigo-500/10",
      gradiente: "from-indigo-500 via-purple-500 to-pink-500",
      sidebar: "bg-white/95 backdrop-blur-2xl border-gray-200",
      header: "bg-white/90 backdrop-blur-2xl border-gray-200",
      card: "bg-white/80 backdrop-blur-sm border-gray-200 hover:border-indigo-300 hover:shadow-xl hover:shadow-indigo-500/10",
      hover: "hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50",
    },
  },
  dark: {
    nombre: "Oscuro Elite",
    icono: Moon,
    colores: {
      fondo: "from-slate-950 via-indigo-950 to-purple-950",
      fondoSecundario: "bg-gray-900",
      texto: "text-white",
      textoSecundario: "text-gray-400",
      primario:
        "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500",
      secundario: "bg-gray-800/50 hover:bg-gray-700/50 backdrop-blur-sm",
      acento: "text-indigo-400",
      borde: "border-gray-800",
      sombra: "shadow-2xl shadow-indigo-500/20",
      gradiente: "from-indigo-500 via-purple-500 to-pink-500",
      sidebar: "bg-gray-900/95 backdrop-blur-2xl border-gray-800",
      header: "bg-gray-900/90 backdrop-blur-2xl border-gray-800",
      card: "bg-gray-800/50 backdrop-blur-sm border-gray-700 hover:border-indigo-500/50 hover:shadow-2xl hover:shadow-indigo-500/20",
      hover: "hover:bg-gradient-to-r hover:from-gray-800/80 hover:to-indigo-900/30",
    },
  },
  blue: {
    nombre: "Azul Océano Pro",
    icono: Wifi,
    colores: {
      fondo: "from-blue-950 via-cyan-950 to-teal-950",
      fondoSecundario: "bg-blue-900",
      texto: "text-white",
      textoSecundario: "text-cyan-300",
      primario:
        "bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500",
      secundario: "bg-blue-800/50 hover:bg-blue-700/50 backdrop-blur-sm",
      acento: "text-cyan-400",
      borde: "border-cyan-800",
      sombra: "shadow-2xl shadow-cyan-500/20",
      gradiente: "from-cyan-500 via-blue-500 to-indigo-500",
      sidebar: "bg-blue-900/95 backdrop-blur-2xl border-cyan-800",
      header: "bg-blue-900/90 backdrop-blur-2xl border-cyan-800",
      card: "bg-blue-800/50 backdrop-blur-sm border-cyan-700 hover:border-cyan-500/50 hover:shadow-2xl hover:shadow-cyan-500/20",
      hover: "hover:bg-gradient-to-r hover:from-blue-800/80 hover:to-cyan-900/30",
    },
  },
  purple: {
    nombre: "Púrpura Real Elite",
    icono: Sparkles,
    colores: {
      fondo: "from-purple-950 via-fuchsia-950 to-pink-950",
      fondoSecundario: "bg-purple-900",
      texto: "text-white",
      textoSecundario: "text-purple-300",
      primario:
        "bg-gradient-to-r from-fuchsia-600 to-purple-600 hover:from-fuchsia-500 hover:to-purple-500",
      secundario: "bg-purple-800/50 hover:bg-purple-700/50 backdrop-blur-sm",
      acento: "text-fuchsia-400",
      borde: "border-purple-800",
      sombra: "shadow-2xl shadow-fuchsia-500/20",
      gradiente: "from-fuchsia-500 via-purple-500 to-pink-500",
      sidebar: "bg-purple-900/95 backdrop-blur-2xl border-purple-800",
      header: "bg-purple-900/90 backdrop-blur-2xl border-purple-800",
      card: "bg-purple-800/50 backdrop-blur-sm border-purple-700 hover:border-fuchsia-500/50 hover:shadow-2xl hover:shadow-fuchsia-500/20",
      hover:
        "hover:bg-gradient-to-r hover:from-purple-800/80 hover:to-fuchsia-900/30",
    },
  },
  green: {
    nombre: "Verde Médico Pro",
    icono: HeartPulse,
    colores: {
      fondo: "from-emerald-950 via-teal-950 to-cyan-950",
      fondoSecundario: "bg-emerald-900",
      texto: "text-white",
      textoSecundario: "text-emerald-300",
      primario:
        "bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500",
      secundario: "bg-teal-800/50 hover:bg-teal-700/50 backdrop-blur-sm",
      acento: "text-emerald-400",
      borde: "border-emerald-800",
      sombra: "shadow-2xl shadow-emerald-500/20",
      gradiente: "from-emerald-500 via-teal-500 to-cyan-500",
      sidebar: "bg-emerald-900/95 backdrop-blur-2xl border-emerald-800",
      header: "bg-emerald-900/90 backdrop-blur-2xl border-emerald-800",
      card: "bg-emerald-800/50 backdrop-blur-sm border-emerald-700 hover:border-emerald-500/50 hover:shadow-2xl hover:shadow-emerald-500/20",
      hover:
        "hover:bg-gradient-to-r hover:from-emerald-800/80 hover:to-teal-900/30",
    },
  },
};

// ========================================
// COMPONENTE PRINCIPAL (tecnico)
// ========================================

const roleParam = "tecnico";
const roleLabel = "tecnico";

export default function TareastecnicoPage() {
  const pathname = usePathname();
  const router = useRouter();

  // Usuario y tema
  const [usuario, setUsuario] = useState<UsuarioSesion | null>(null);
  const [temaActual, setTemaActual] = useState<TemaColor>("dark");

  // Loading
  const [loadingUsuario, setLoadingUsuario] = useState(true);
  const [loadingTareas, setLoadingTareas] = useState(true);
  const [loadingEstadisticas, setLoadingEstadisticas] = useState(true);

  // Datos tareas
  const [tareas, setTareas] = useState<Tarea[]>([]);
  const [estadisticas, setEstadisticas] = useState<EstadisticasTareas | null>(
    null
  );

  // Catálogos derivados dinámicamente
  const centrosDisponibles = useMemo<CentroResumen[]>(() => {
    const mapa = new Map<number, CentroResumen>();
    tareas.forEach((t) => {
      if (t.centro) {
        if (!mapa.has(t.centro.id_centro)) {
          mapa.set(t.centro.id_centro, {
            id_centro: t.centro.id_centro,
            nombre: t.centro.nombre,
          });
        }
      }
    });
    return Array.from(mapa.values());
  }, [tareas]);

  const sucursalesDisponibles = useMemo<SucursalResumen[]>(() => {
    const mapa = new Map<number, SucursalResumen>();
    tareas.forEach((t) => {
      if (t.sucursal && t.centro) {
        if (!mapa.has(t.sucursal.id_sucursal)) {
          mapa.set(t.sucursal.id_sucursal, {
            id_sucursal: t.sucursal.id_sucursal,
            nombre: t.sucursal.nombre,
            id_centro: t.centro.id_centro,
          });
        }
      }
    });
    return Array.from(mapa.values());
  }, [tareas]);

  // Notificaciones
  const [notificaciones, setNotificaciones] = useState<NotificacionSistema[]>(
    []
  );

  // UI
  const [sidebarAbierto, setSidebarAbierto] = useState(true);

  const [notificacionesAbiertas, setNotificacionesAbiertas] = useState(false);
  const [perfilAbierto, setPerfilAbierto] = useState(false);

  // Filtros
  const [busqueda, setBusqueda] = useState("");
  const [filtroEstado, setFiltroEstado] = useState<string>("todas");
  const [filtroPrioridad, setFiltroPrioridad] = useState<string>("todas");
  const [filtroCentro, setFiltroCentro] = useState<string>("todos");
  const [filtroSucursal, setFiltroSucursal] = useState<string>("todas");
  const [filtroTipo, setFiltroTipo] = useState<string>("todos");
  const [fechaDesde, setFechaDesde] = useState<string>("");
  const [fechaHasta, setFechaHasta] = useState<string>("");

  // Menú de acciones por tarea
  const [tareaMenuAbierta, setTareaMenuAbierta] = useState<number | null>(null);
  const [tareaAEliminar, setTareaAEliminar] = useState<Tarea | null>(null);
  const [eliminando, setEliminando] = useState(false);
  const [cambiandoEstadoId, setCambiandoEstadoId] = useState<number | null>(
    null
  );

  const tema = useMemo(() => TEMAS[temaActual], [temaActual]);

  // Sección activa
  const seccionActiva = useMemo(() => {
    if (pathname === "/tecnico") return "dashboard";
    if (pathname.startsWith("/tecnico/tareas")) return "tareas";
    if (pathname.startsWith("/tecnico/agenda")) return "agenda";
    if (pathname.startsWith("/tecnico/confirmaciones"))
      return "confirmaciones";
    if (pathname.startsWith("/tecnico/llamadas")) return "llamadas";
    if (pathname.startsWith("/tecnico/pacientes")) return "pacientes";
    if (pathname.startsWith("/tecnico/medicos")) return "medicos";
    if (pathname.startsWith("/tecnico/recordatorios")) return "recordatorios";
    if (pathname.startsWith("/tecnico/documentos")) return "documentos";
    if (pathname.startsWith("/tecnico/mensajes")) return "mensajes";
    if (pathname.startsWith("/tecnico/telemedicina")) return "telemedicina";
    if (pathname.startsWith("/tecnico/reportes")) return "reportes";
    if (pathname.startsWith("/tecnico/perfil")) return "perfil";
    if (pathname.startsWith("/tecnico/configuracion")) return "configuracion";
    return "";
  }, [pathname]);

  // ========================================
  // MENU DE NAVEGACIÓN ESPECÍFICO tecnico
  // ========================================

  const menuItems: MenuItem[] = [
    {
      titulo: "Dashboard",
      icono: Home,
      url: "/tecnico",
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
          url: "/tecnico/agenda",
        },
        {
          titulo: "Nueva Cita",
          icono: CalendarPlus,
          url: "/tecnico/agenda/nueva",
        },
        {
          titulo: "Búsqueda Citas",
          icono: Search,
          url: "/tecnico/agenda/buscar",
        },
        {
          titulo: "Disponibilidad",
          icono: CalendarClock,
          url: "/tecnico/agenda/disponibilidad",
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
          url: "/tecnico/confirmaciones/pendientes",
        },
        {
          titulo: "Confirmadas",
          icono: CheckCircle2,
          url: "/tecnico/confirmaciones/confirmadas",
        },
        {
          titulo: "Cancelaciones",
          icono: X,
          url: "/tecnico/confirmaciones/cancelaciones",
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
          url: "/tecnico/llamadas/pendientes",
        },
        {
          titulo: "Realizadas",
          icono: PhoneIncoming,
          url: "/tecnico/llamadas/historial",
        },
        {
          titulo: "Registro",
          icono: ClipboardList,
          url: "/tecnico/llamadas/registro",
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
        { titulo: "Todos", icono: Users, url: "/tecnico/pacientes" },
        {
          titulo: "Nuevo Paciente",
          icono: UserPlus,
          url: "/tecnico/pacientes/nuevo",
        },
        {
          titulo: "Búsqueda",
          icono: Search,
          url: "/tecnico/pacientes/buscar",
        },
        {
          titulo: "Atención Hoy",
          icono: CalendarCheck,
          url: "/tecnico/pacientes/hoy",
        },
      ],
    },
    {
      titulo: "Médicos",
      icono: Stethoscope,
      url: "",
      activo: seccionActiva === "medicos",
      submenu: [
        { titulo: "Mis Médicos", icono: UserCog, url: "/tecnico/medicos" },
        {
          titulo: "Disponibilidad",
          icono: CalendarClock,
          url: "/tecnico/medicos/disponibilidad",
        },
        {
          titulo: "Contacto",
          icono: Phone,
          url: "/tecnico/medicos/contacto",
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
          url: "/tecnico/recordatorios/programados",
        },
        {
          titulo: "Enviados",
          icono: Send,
          url: "/tecnico/recordatorios/enviados",
        },
        {
          titulo: "Configuración",
          icono: Settings,
          url: "/tecnico/recordatorios/config",
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
          url: "/tecnico/documentos",
        },
        {
          titulo: "Certificados",
          icono: Award,
          url: "/tecnico/documentos/certificados",
        },
        {
          titulo: "Recetas",
          icono: Pill,
          url: "/tecnico/documentos/recetas",
        },
        {
          titulo: "Órdenes",
          icono: ClipboardList,
          url: "/tecnico/documentos/ordenes",
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
        { titulo: "Bandeja", icono: Mail, url: "/tecnico/mensajes" },
        {
          titulo: "WhatsApp",
          icono: MessageSquare,
          url: "https://web.whatsapp.com/",
          target: "_blank",
          rel: "noopener noreferrer",
        },
        { titulo: "SMS", icono: Phone, url: "/tecnico/mensajes/sms" },
        { titulo: "Email", icono: Mail, url: "/tecnico/mensajes/email" },
        {
          titulo: "Automáticos",
          icono: Mail,
          url: "/tecnico/mensajes/auto",
        },
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
          url: "/tecnico/telemedicina/espera",
        },
        {
          titulo: "Programadas",
          icono: CalendarCheck,
          url: "/tecnico/telemedicina/programadas",
        },
        {
          titulo: "Asistencia",
          icono: Settings,
          url: "/tecnico/telemedicina/asistencia",
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
          url: "/tecnico/tareas",
        },
        {
          titulo: "Pendientes",
          icono: Square,
          url: "/tecnico/tareas/pendientes",
        },
        {
          titulo: "Completadas",
          icono: CheckSquare2,
          url: "/tecnico/tareas/completadas",
        },
        {
          titulo: "Nueva Tarea",
          icono: Plus,
          url: "/tecnico/tareas/nueva",
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
          url: "/tecnico/reportes/metricas",
        },
        {
          titulo: "Citas",
          icono: Calendar,
          url: "/tecnico/reportes/citas",
        },
        {
          titulo: "Llamadas",
          icono: Phone,
          url: "/tecnico/reportes/llamadas",
        },
        {
          titulo: "Rendimiento",
          icono: Target,
          url: "/tecnico/reportes/rendimiento",
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
          url: "/tecnico/perfil",
        },
        {
          titulo: "Horarios",
          icono: Clock,
          url: "/tecnico/perfil/horarios",
        },
        {
          titulo: "Preferencias",
          icono: Settings,
          url: "/tecnico/perfil/preferencias",
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
          url: "/tecnico/configuracion/",
        },
        {
          titulo: "Notificaciones",
          icono: Bell,
          url: "/tecnico/configuracion/notificaciones",
        },
        {
          titulo: "Seguridad",
          icono: Shield,
          url: "/tecnico/configuracion/seguridad",
        },
        {
          titulo: "Temas",
          icono: Sparkles,
          url: "/tecnico/configuracion/temas",
        },
      ],
    },
  ];

  // ========================================
  // EFECTOS
  // ========================================

  // Aplicar fondo al body
  useEffect(() => {
    document.body.className = `bg-gradient-to-br ${tema.colores.fondo} min-h-screen transition-all duration-700`;
  }, [tema]);

  // Cargar tema guardado
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

  // Cargar tareas y estadísticas cuando hay usuario
  useEffect(() => {
    if (!usuario) return;

    const cargarTareas = async () => {
      try {
        setLoadingTareas(true);
        const res = await fetch(
          `/api/tareas?usuario=${usuario.id_usuario}&rol=${roleParam}`,
          {
            method: "GET",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
          }
        );

        const data = await res.json().catch(() => ({}));
        if (!res.ok || !data.success) {
          console.error("Error al cargar tareas:", data);
          return;
        }

        setTareas((data.tareas || []) as Tarea[]);
      } catch (error) {
        console.error("Error al cargar tareas:", error);
      } finally {
        setLoadingTareas(false);
      }
    };

    const cargarEstadisticas = async () => {
      try {
        setLoadingEstadisticas(true);
        const res = await fetch(
          `/api/tareas/estadisticas?usuario=${usuario.id_usuario}&rol=${roleParam}`,
          {
            method: "GET",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
          }
        );

        const data = await res.json().catch(() => ({}));
        if (!res.ok || !data.success) {
          console.error("Error al cargar estadísticas de tareas:", data);
          return;
        }

        setEstadisticas(data.estadisticas as EstadisticasTareas);
      } catch (error) {
        console.error("Error al cargar estadísticas de tareas:", error);
      } finally {
        setLoadingEstadisticas(false);
      }
    };

    cargarTareas();
    cargarEstadisticas();

    const interval = setInterval(() => {
      cargarTareas();
      cargarEstadisticas();
    }, 180000); // cada 3 minutos

    return () => clearInterval(interval);
  }, [usuario]);

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
    return new Intl.DateTimeFormat("es-CL", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(d);
  };

  const formatearFechaHora = (fecha: string) => {
    const d = new Date(fecha);
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
        ? "bg-yellow-500/20 text-yellow-300 border-yellow-500/60 shadow-lg shadow-yellow-500/20"
        : "bg-yellow-100 text-yellow-800 border-yellow-300 shadow-sm",
      en_progreso: isDark
        ? "bg-sky-500/20 text-sky-300 border-sky-500/60 shadow-lg shadow-sky-500/20 animate-pulse"
        : "bg-sky-100 text-sky-800 border-sky-300 shadow-sm animate-pulse",
      en_revision: isDark
        ? "bg-purple-500/20 text-purple-300 border-purple-500/60 shadow-lg shadow-purple-500/20"
        : "bg-purple-100 text-purple-800 border-purple-300 shadow-sm",
      completada: isDark
        ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/60 shadow-lg shadow-emerald-500/20"
        : "bg-emerald-100 text-emerald-800 border-emerald-300 shadow-sm",
      rechazada: isDark
        ? "bg-red-500/20 text-red-300 border-red-500/60 shadow-lg shadow-red-500/20"
        : "bg-red-100 text-red-800 border-red-300 shadow-sm",
      cancelada: isDark
        ? "bg-rose-500/20 text-rose-300 border-rose-500/60 shadow-lg shadow-rose-500/20"
        : "bg-rose-100 text-rose-800 border-rose-300 shadow-sm",
    };

    return (
      map[estado.toLowerCase()] ||
      (isDark
        ? "bg-gray-500/20 text-gray-300 border-gray-500/60"
        : "bg-gray-100 text-gray-800 border-gray-300")
    );
  };

  const obtenerColorPrioridad = (prioridad: string) => {
    const isDark = ["dark", "blue", "purple", "green"].includes(temaActual);
    const map: Record<string, string> = {
      critica: isDark
        ? "bg-red-600/30 text-red-200 border-red-500/70 shadow-xl shadow-red-500/30 animate-pulse"
        : "bg-red-100 text-red-800 border-red-400 shadow-md animate-pulse",
      urgente: isDark
        ? "bg-orange-500/30 text-orange-200 border-orange-500/70 shadow-lg shadow-orange-500/20"
        : "bg-orange-100 text-orange-800 border-orange-400 shadow-sm",
      alta: isDark
        ? "bg-amber-500/30 text-amber-200 border-amber-500/70 shadow-lg shadow-amber-500/20"
        : "bg-amber-100 text-amber-800 border-amber-400 shadow-sm",
      media: isDark
        ? "bg-sky-500/30 text-sky-200 border-sky-500/70 shadow-lg shadow-sky-500/20"
        : "bg-sky-100 text-sky-800 border-sky-400 shadow-sm",
      baja: isDark
        ? "bg-emerald-500/30 text-emerald-200 border-emerald-500/70 shadow-lg shadow-emerald-500/20"
        : "bg-emerald-100 text-emerald-800 border-emerald-400 shadow-sm",
    };

    return (
      map[prioridad.toLowerCase()] ||
      (isDark
        ? "bg-gray-500/30 text-gray-200 border-gray-500/70"
        : "bg-gray-100 text-gray-800 border-gray-400")
    );
  };

  const obtenerIconoTendencia = (valor: number | undefined) => {
    if (!valor || valor === 0) {
      return <Activity className="w-4 h-4 text-gray-400" />;
    }
    if (valor > 0) {
      return <ArrowUpRight className="w-4 h-4 text-green-500" />;
    }
    return <ArrowDownRight className="w-4 h-4 text-red-500" />;
  };

  const filtrarPorFecha = (t: Tarea) => {
    if (!fechaDesde && !fechaHasta) return true;
    const fecha = new Date(t.fecha_creacion).getTime();

    if (fechaDesde) {
      const dDesde = new Date(fechaDesde);
      dDesde.setHours(0, 0, 0, 0);
      if (fecha < dDesde.getTime()) return false;
    }

    if (fechaHasta) {
      const dHasta = new Date(fechaHasta);
      dHasta.setHours(23, 59, 59, 999);
      if (fecha > dHasta.getTime()) return false;
    }

    return true;
  };

  const tareasFiltradas = useMemo(() => {
    let resultado = [...tareas];

    if (filtroEstado !== "todas") {
      resultado = resultado.filter((t) => t.estado === filtroEstado);
    }

    if (filtroPrioridad !== "todas") {
      resultado = resultado.filter(
        (t) => t.prioridad.toLowerCase() === filtroPrioridad.toLowerCase()
      );
    }

    if (filtroCentro !== "todos") {
      const idCentro = Number(filtroCentro);
      resultado = resultado.filter((t) => t.centro?.id_centro === idCentro);
    }

    if (filtroSucursal !== "todas") {
      const idSucursal = Number(filtroSucursal);
      resultado = resultado.filter(
        (t) => t.sucursal?.id_sucursal === idSucursal
      );
    }

    if (filtroTipo !== "todos") {
      resultado = resultado.filter(
        (t) => t.tipo.toLowerCase() === filtroTipo.toLowerCase()
      );
    }

    resultado = resultado.filter(filtrarPorFecha);

    if (busqueda.trim() !== "") {
      const term = busqueda.trim().toLowerCase();
      resultado = resultado.filter((t) => {
        const texto =
          [
            t.titulo,
            t.descripcion,
            t.tipo,
            t.centro?.nombre,
            t.sucursal?.nombre,
            t.creador?.nombre_completo,
            t.responsable?.nombre_completo,
            ...(t.tags || []),
          ]
            .filter(Boolean)
            .join(" ")
            .toLowerCase();
        return texto.includes(term);
      });
    }

    // Orden: críticas/urgentes primero y luego fecha límite más cercana
    resultado.sort((a, b) => {
      const prioridadPeso = (p: TareaPrioridad) => {
        switch (p) {
          case "critica":
            return 5;
          case "urgente":
            return 4;
          case "alta":
            return 3;
          case "media":
            return 2;
          case "baja":
          default:
            return 1;
        }
      };

      const diffPrioridad =
        prioridadPeso(b.prioridad) - prioridadPeso(a.prioridad);
      if (diffPrioridad !== 0) return diffPrioridad;

      const fechaA = a.fecha_limite
        ? new Date(a.fecha_limite).getTime()
        : Number.MAX_SAFE_INTEGER;
      const fechaB = b.fecha_limite
        ? new Date(b.fecha_limite).getTime()
        : Number.MAX_SAFE_INTEGER;

      return fechaA - fechaB;
    });

    return resultado;
  }, [
    tareas,
    filtroEstado,
    filtroPrioridad,
    filtroCentro,
    filtroSucursal,
    filtroTipo,
    fechaDesde,
    fechaHasta,
    busqueda,
  ]);

  // Tipos de tarea disponibles (dinámico)
  const tiposDisponibles = useMemo(() => {
    const set = new Set<string>();
    tareas.forEach((t) => {
      if (t.tipo) set.add(t.tipo);
    });
    return Array.from(set.values());
  }, [tareas]);

  // ========================================
  // ACCIONES SOBRE TAREAS
  // ========================================

  const recargarTodo = async () => {
    if (!usuario) return;
    setLoadingTareas(true);
    setLoadingEstadisticas(true);

    try {
      const [resT, resE] = await Promise.all([
        fetch(`/api/tareas?usuario=${usuario.id_usuario}&rol=${roleParam}`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        }),
        fetch(
          `/api/tareas/estadisticas?usuario=${usuario.id_usuario}&rol=${roleParam}`,
          {
            method: "GET",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
          }
        ),
      ]);

      const dataT = await resT.json().catch(() => ({}));
      const dataE = await resE.json().catch(() => ({}));

      if (resT.ok && dataT.success) {
        setTareas((dataT.tareas || []) as Tarea[]);
      }

      if (resE.ok && dataE.success) {
        setEstadisticas(dataE.estadisticas as EstadisticasTareas);
      }
    } catch (error) {
      console.error("Error al recargar tareas/estadísticas:", error);
    } finally {
      setLoadingTareas(false);
      setLoadingEstadisticas(false);
    }
  };

  const cambiarEstadoTarea = async (
    tarea: Tarea,
    nuevoEstado: TareaEstado
  ) => {
    try {
      setCambiandoEstadoId(tarea.id_tarea);
      const res = await fetch(`/api/tareas/${tarea.id_tarea}/estado`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ estado: nuevoEstado }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.success) {
        alert("No se pudo cambiar el estado de la tarea");
        return;
      }

      setTareas((prev) =>
        prev.map((t) =>
          t.id_tarea === tarea.id_tarea ? { ...t, estado: nuevoEstado } : t
        )
      );
      await recargarTodo();
    } catch (error) {
      console.error("Error al cambiar estado de tarea:", error);
    } finally {
      setCambiandoEstadoId(null);
      setTareaMenuAbierta(null);
    }
  };

  const confirmarEliminarTarea = (tarea: Tarea) => {
    setTareaAEliminar(tarea);
  };

  const eliminarTarea = async () => {
    if (!tareaAEliminar) return;

    try {
      setEliminando(true);
      const res = await fetch(`/api/tareas/${tareaAEliminar.id_tarea}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.success) {
        alert("No se pudo eliminar la tarea");
        return;
      }

      setTareas((prev) =>
        prev.filter((t) => t.id_tarea !== tareaAEliminar.id_tarea)
      );
      await recargarTodo();
      setTareaAEliminar(null);
    } catch (error) {
      console.error("Error al eliminar tarea:", error);
    } finally {
      setEliminando(false);
    }
  };

  const irADetalle = (tarea: Tarea) => {
    router.push(`/tecnico/tareas/${tarea.id_tarea}`);
  };

  const irAEditar = (tarea: Tarea) => {
    router.push(`/tecnico/tareas/${tarea.id_tarea}/editar`);
  };

  const irAHistorial = (tarea: Tarea) => {
    router.push(`/tecnico/tareas/${tarea.id_tarea}/historial`);
  };

  const marcarNotificacionLeida = (idNotificacion: number) => {
    setNotificaciones((prev) =>
      prev.map((n) =>
        n.id_notificacion === idNotificacion ? { ...n, leida: true } : n
      )
    );
  };

  // ========================================
  // RENDER LOADING / ACCESO
  // ========================================

  if (loadingUsuario) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center bg-gradient-to-br ${tema.colores.fondo} relative overflow-hidden`}
      >
        {/* Efectos de fondo */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-gradient-to-br from-pink-500/10 to-rose-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
        </div>

        <div className="text-center relative z-10">
          <div className="relative mb-8">
            <div className="w-32 h-32 border-4 border-indigo-500/40 border-t-transparent rounded-full animate-spin" />
            <div
              className={`absolute inset-3 rounded-full bg-gradient-to-br ${tema.colores.gradiente} flex items-center justify-center shadow-2xl`}
            >
              <CheckSquare2 className="w-12 h-12 text-white animate-pulse" />
            </div>
          </div>
          <h2
            className={`text-5xl font-black mb-4 ${tema.colores.texto} bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent animate-gradient`}
          >
            Cargando Módulo de Tareas
          </h2>
          <p
            className={`text-lg font-semibold ${tema.colores.textoSecundario} animate-pulse`}
          >
            Preparando tu espacio de trabajo...
          </p>
          <div className="flex items-center justify-center gap-1 mt-6">
            <div className="w-3 h-3 rounded-full bg-indigo-500 animate-bounce" />
            <div
              className="w-3 h-3 rounded-full bg-purple-500 animate-bounce"
              style={{ animationDelay: "0.1s" }}
            />
            <div
              className="w-3 h-3 rounded-full bg-pink-500 animate-bounce"
              style={{ animationDelay: "0.2s" }}
            />
          </div>
        </div>
      </div>
    );
  }

  if (!usuario) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center bg-gradient-to-br ${tema.colores.fondo}`}
      >
        <div
          className={`text-center max-w-md mx-auto p-10 rounded-3xl ${tema.colores.card} ${tema.colores.sombra} ${tema.colores.borde} border-2 transform hover:scale-105 transition-all duration-300`}
        >
          <div
            className={`w-24 h-24 bg-gradient-to-br ${tema.colores.gradiente} rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl animate-pulse`}
          >
            <AlertCircle className="w-12 h-12 text-white" />
          </div>
          <h2 className={`text-3xl font-black mb-4 ${tema.colores.texto}`}>
            Sesión no válida
          </h2>
          <p className={`text-lg mb-8 ${tema.colores.textoSecundario}`}>
            Debes iniciar sesión para acceder al módulo de tareas de
            secretaría.
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
  // RENDER PRINCIPAL ULTRA PREMIUM
  // ========================================

  return (
    <div
      className={`min-h-screen transition-all duration-700 bg-gradient-to-br ${tema.colores.fondo} relative overflow-hidden`}
    >
      {/* Efectos de fondo animados */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 rounded-full blur-3xl animate-pulse" />
        <div
          className="absolute bottom-0 right-1/4 w-96 h-96 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "1s" }}
        />
        <div
          className="absolute top-1/2 left-1/2 w-96 h-96 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "2s" }}
        />
      </div>

      {/* SIDEBAR */}
      <SidebarTecnico
        usuario={usuario}
        tema={tema}
        sidebarAbierto={sidebarAbierto}
        setSidebarAbierto={setSidebarAbierto}
        estadisticas={estadisticas}
      />

      {/* HEADER ULTRA PREMIUM */}
      <header
        className={`fixed top-0 right-0 z-40 transition-all duration-500 ${
          sidebarAbierto ? "left-72" : "left-20"
        } ${tema.colores.header} ${tema.colores.borde} border-b-2 ${
          tema.colores.sombra
        }`}
      >
        <div className="flex items-center justify-between px-8 py-5">
          <div className="flex-1 max-w-2xl">
            <div className="relative group">
              <Search
                className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 ${tema.colores.textoSecundario} group-focus-within:text-indigo-500 transition-colors duration-300`}
              />
              <input
                type="text"
                placeholder="Buscar tareas por título, responsable, centro, etiqueta..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className={`w-full pl-12 pr-12 py-3.5 rounded-2xl ${tema.colores.card} ${tema.colores.borde} border-2 text-sm ${tema.colores.texto} placeholder:${tema.colores.textoSecundario} focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all duration-300 shadow-lg`}
              />
              {busqueda && (
                <button
                  onClick={() => setBusqueda("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-xl hover:bg-rose-500/20 transition-all duration-200 group"
                >
                  <X className="w-4 h-4 text-rose-400 group-hover:rotate-90 transition-transform duration-300" />
                </button>
              )}
              {busqueda && (
                <div className="absolute left-0 right-0 top-full mt-2 p-2 rounded-xl bg-indigo-500/10 backdrop-blur-sm border border-indigo-500/30 animate-fadeIn">
                  <p className="text-xs text-indigo-300 font-semibold">
                    🔍 {tareasFiltradas.length} tareas encontradas
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3 ml-6">
            {/* Temas */}
            <div className="relative group">
              <button
                className={`p-3 rounded-2xl font-semibold transition-all duration-300 ${tema.colores.secundario} ${tema.colores.texto} transform hover:scale-110 shadow-lg hover:shadow-xl`}
              >
                <Sparkles className="w-5 h-5 animate-pulse" />
              </button>
              <div
                className={`absolute right-0 mt-3 w-72 rounded-3xl ${tema.colores.card} ${tema.colores.borde} border-2 ${tema.colores.sombra} opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 p-5 space-y-2 transform group-hover:translate-y-0 translate-y-2`}
              >
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles className="w-5 h-5 text-indigo-400" />
                  <p className={`text-sm font-bold ${tema.colores.texto}`}>
                    Temas Premium
                  </p>
                </div>
                {Object.entries(TEMAS).map(([key, t]) => (
                  <button
                    key={key}
                    onClick={() => cambiarTema(key as TemaColor)}
                    className={`w-full flex items-center justify-between gap-3 px-4 py-3 rounded-2xl font-bold text-xs transition-all duration-300 transform hover:scale-105 ${
                      temaActual === key
                        ? `bg-gradient-to-r ${t.colores.gradiente} text-white shadow-xl`
                        : `${tema.colores.hover} ${tema.colores.texto}`
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <t.icono className="w-5 h-5" />
                      <span>{t.nombre}</span>
                    </div>
                    {temaActual === key && <Check className="w-5 h-5 animate-bounce" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Notificaciones Ultra Premium */}
            <div className="relative">
              <button
                onClick={() => setNotificacionesAbiertas((v) => !v)}
                className={`relative p-3 rounded-2xl font-semibold transition-all duration-300 ${tema.colores.secundario} ${tema.colores.texto} transform hover:scale-110 shadow-lg hover:shadow-xl`}
              >
                <Bell className="w-5 h-5" />
                {notificaciones.filter((n) => !n.leida).length > 0 && (
                  <>
                    <span className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-r from-rose-500 to-red-500 text-white text-[10px] font-black rounded-full flex items-center justify-center animate-ping" />
                    <span className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-r from-rose-500 to-red-500 text-white text-[10px] font-black rounded-full flex items-center justify-center shadow-xl">
                      {notificaciones.filter((n) => !n.leida).length > 9
                        ? "9+"
                        : notificaciones.filter((n) => !n.leida).length}
                    </span>
                  </>
                )}
              </button>
              {notificacionesAbiertas && (
                <div
                  className={`absolute right-0 mt-3 w-96 rounded-3xl ${tema.colores.card} ${tema.colores.borde} border-2 ${tema.colores.sombra} max-h-[500px] overflow-y-auto custom-scrollbar-premium animate-fadeIn`}
                >
                  <div
                    className={`p-5 border-b-2 ${tema.colores.borde} sticky top-0 ${tema.colores.card} backdrop-blur-2xl z-10`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Bell className="w-5 h-5 text-indigo-400" />
                        <h3
                          className={`text-lg font-black ${tema.colores.texto}`}
                        >
                          Notificaciones
                        </h3>
                      </div>
                      <button
                        className={`text-xs font-bold px-3 py-1.5 rounded-xl ${tema.colores.primario} text-white hover:scale-105 transition-all duration-300 shadow-lg`}
                        onClick={() =>
                          setNotificaciones((prev) =>
                            prev.map((n) => ({ ...n, leida: true }))
                          )
                        }
                      >
                        Marcar todas
                      </button>
                    </div>
                  </div>

                  {notificaciones.length === 0 ? (
                    <div className="p-12 text-center">
                      <div
                        className={`w-20 h-20 rounded-3xl bg-gradient-to-br ${tema.colores.gradiente} mx-auto flex items-center justify-center mb-4 shadow-2xl animate-pulse`}
                      >
                        <BellOff className="w-10 h-10 text-white" />
                      </div>
                      <p
                        className={`text-sm font-bold ${tema.colores.texto} mb-2`}
                      >
                        Sin notificaciones
                      </p>
                      <p className={`text-xs ${tema.colores.textoSecundario}`}>
                        No tienes notificaciones nuevas
                      </p>
                    </div>
                  ) : (
                    <div className="p-3 space-y-2">
                      {notificaciones.map((notif) => (
                        <div
                          key={notif.id_notificacion}
                          className={`p-4 rounded-2xl ${
                            tema.colores.hover
                          } cursor-pointer transition-all duration-300 transform hover:scale-[1.02] border-2 ${
                            !notif.leida
                              ? "border-indigo-500/50 bg-indigo-500/5"
                              : "border-transparent"
                          }`}
                          onClick={() =>
                            marcarNotificacionLeida(notif.id_notificacion)
                          }
                        >
                          <div className="flex items-start gap-3">
                            <div
                              className={`w-3 h-3 rounded-full mt-1.5 ${
                                !notif.leida
                                  ? "bg-gradient-to-r from-indigo-500 to-purple-500 animate-pulse shadow-lg shadow-indigo-500/50"
                                  : "bg-gray-500"
                              }`}
                            />
                            <div className="flex-1 min-w-0">
                              <p
                                className={`text-sm font-bold mb-1 ${tema.colores.texto}`}
                              >
                                {notif.titulo}
                              </p>
                              <p
                                className={`text-xs mb-2 ${tema.colores.textoSecundario} line-clamp-2`}
                              >
                                {notif.descripcion}
                              </p>
                              <div className="flex items-center gap-2">
                                <Clock className="w-3 h-3 text-gray-400" />
                                <p
                                  className={`text-xs font-medium ${tema.colores.textoSecundario}`}
                                >
                                  {formatearFechaHora(notif.fecha_hora)}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Perfil Ultra Premium */}
            <div className="relative">
              <button
                onClick={() => setPerfilAbierto((v) => !v)}
                className={`flex items-center gap-3 px-4 py-2 rounded-2xl transition-all duration-300 ${tema.colores.hover} transform hover:scale-105 shadow-lg`}
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
                  className={`w-10 h-10 rounded-2xl bg-gradient-to-br ${tema.colores.gradiente} flex items-center justify-center text-white font-bold shadow-xl ring-2 ring-white/20`}
                >
                  {usuario.foto_perfil_url ? (
                    <Image
                      src={usuario.foto_perfil_url}
                      alt={usuario.nombre}
                      width={40}
                      height={40}
                      className="rounded-2xl object-cover"
                    />
                  ) : (
                    `${usuario.nombre[0]}${usuario.apellido_paterno[0]}`
                  )}
                </div>
                <ChevronDown
                  className={`w-4 h-4 ${
                    tema.colores.texto
                  } transition-transform duration-300 ${
                    perfilAbierto ? "rotate-180" : ""
                  }`}
                />
              </button>
              {perfilAbierto && (
                <div
                  className={`absolute right-0 mt-3 w-80 rounded-3xl ${tema.colores.card} ${tema.colores.borde} border-2 ${tema.colores.sombra} p-5 animate-fadeIn`}
                >
                  <div className="flex items-center gap-4 mb-4 pb-4 border-b-2 border-white/10">
                    <div
                      className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${tema.colores.gradiente} flex items-center justify-center text-white font-bold text-xl shadow-2xl`}
                    >
                      {usuario.foto_perfil_url ? (
                        <Image
                          src={usuario.foto_perfil_url}
                          alt={usuario.nombre}
                          width={64}
                          height={64}
                          className="rounded-2xl object-cover"
                        />
                      ) : (
                        `${usuario.nombre[0]}${usuario.apellido_paterno[0]}`
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p
                        className={`text-lg font-black ${tema.colores.texto} truncate`}
                      >
                        {usuario.nombre} {usuario.apellido_paterno}
                      </p>
                      <p
                        className={`text-sm font-medium ${tema.colores.textoSecundario} mb-1`}
                      >
                        {roleLabel}
                      </p>
                      <p
                        className={`text-xs ${tema.colores.textoSecundario} truncate`}
                      >
                        {usuario.email}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Link
                      href={`/tecnico/perfil`}
                      className={`flex items-center gap-3 px-4 py-3 rounded-2xl font-semibold transition-all duration-300 ${tema.colores.hover} ${tema.colores.texto} transform hover:scale-105`}
                    >
                      <User className="w-5 h-5" />
                      <span>Mi Perfil</span>
                    </Link>
                    <Link
                      href={`/tecnico/configuracion`}
                      className={`flex items-center gap-3 px-4 py-3 rounded-2xl font-semibold transition-all duration-300 ${tema.colores.hover} ${tema.colores.texto} transform hover:scale-105`}
                    >
                      <Settings className="w-5 h-5" />
                      <span>Configuración</span>
                    </Link>
                    <button
                      onClick={cerrarSesion}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-semibold transition-all duration-300 text-rose-400 hover:bg-rose-500/20 transform hover:scale-105`}
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

      {/* CONTENIDO PRINCIPAL ULTRA PREMIUM */}
      <main
        className={`transition-all duration-500 ${
          sidebarAbierto ? "ml-72" : "ml-20"
        } pt-28 p-8 relative z-10`}
      >
        {/* Encabezado Ultra Premium */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2
              className={`text-5xl md:text-6xl font-black mb-2 ${tema.colores.texto} flex items-center gap-3`}
            >
              <span className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                {obtenerSaludo()}, {usuario.nombre}
              </span>
              <span className="animate-wave inline-block">👋</span>
            </h2>
            <p
              className={`text-lg font-semibold ${tema.colores.textoSecundario} flex items-center gap-2`}
            >
              <Sparkles className="w-5 h-5 text-indigo-400 animate-pulse" />
              Gestión inteligente de tareas · Rol:{" "}
              <span className={`${tema.colores.acento} font-black`}>
                {roleLabel}
              </span>
            </p>
            <p
              className={`text-sm mt-2 ${tema.colores.textoSecundario} flex items-center gap-2`}
            >
              <Calendar className="w-4 h-4" />
              {new Date().toLocaleDateString("es-CL", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={recargarTodo}
              disabled={loadingTareas || loadingEstadisticas}
              className={`flex items-center gap-2 px-5 py-3 rounded-2xl font-bold text-sm ${tema.colores.secundario} ${tema.colores.texto} ${tema.colores.sombra} hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg`}
            >
              <RefreshCw
                className={`w-4 h-4 ${
                  loadingTareas || loadingEstadisticas ? "animate-spin" : ""
                }`}
              />
              Actualizar
            </button>
            <Link
              href={`/tecnico/tareas/nueva`}
              className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-sm ${tema.colores.primario} text-white ${tema.colores.sombra} hover:scale-105 transition-all duration-300 shadow-xl`}
            >
              <Plus className="w-5 h-5" />
              Nueva Tarea
            </Link>
          </div>
        </div>

        {/* KPIs Ultra Premium con Animaciones Avanzadas */}
        {loadingEstadisticas ? (
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-6 mb-8">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className={`rounded-3xl p-6 ${tema.colores.card} ${tema.colores.borde} border-2 ${tema.colores.sombra} animate-pulse`}
              >
                <div className="w-12 h-12 rounded-2xl bg-gray-500/20 mb-4" />
                <div className="h-8 w-20 bg-gray-500/20 rounded-xl mb-2" />
                <div className="h-3 w-28 bg-gray-500/20 rounded-lg" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-6 mb-8">
            {/* Total */}
            <div
              className={`rounded-3xl p-6 ${tema.colores.card} ${tema.colores.borde} border-2 ${tema.colores.sombra} hover:scale-105 hover:-translate-y-2 transition-all duration-500 group cursor-pointer relative overflow-hidden`}
              onClick={() => setFiltroEstado("todas")}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center shadow-2xl group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                    <CheckSquare2 className="w-7 h-7 text-white" />
                  </div>
                  {obtenerIconoTendencia(0)}
                </div>
                <div
                  className={`text-4xl font-black mb-2 ${tema.colores.texto} group-hover:scale-110 transition-transform duration-300`}
                >
                  {estadisticas?.total ?? 0}
                </div>
                <div
                  className={`text-xs font-bold uppercase tracking-wider ${tema.colores.textoSecundario}`}
                >
                  Tareas Totales
                </div>
              </div>
            </div>

            {/* Pendientes */}
            <div
              className={`rounded-3xl p-6 ${tema.colores.card} ${tema.colores.borde} border-2 ${tema.colores.sombra} hover:scale-105 hover:-translate-y-2 transition-all duration-500 group cursor-pointer relative overflow-hidden`}
              onClick={() => setFiltroEstado("pendiente")}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 to-orange-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-2xl group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 animate-pulse">
                    <Clock className="w-7 h-7 text-white" />
                  </div>
                  {obtenerIconoTendencia(0)}
                </div>
                <div
                  className={`text-4xl font-black mb-2 ${tema.colores.texto} group-hover:scale-110 transition-transform duration-300`}
                >
                  {estadisticas?.pendientes ?? 0}
                </div>
                <div
                  className={`text-xs font-bold uppercase tracking-wider ${tema.colores.textoSecundario}`}
                >
                  Pendientes
                </div>
              </div>
            </div>

            {/* En Progreso */}
            <div
              className={`rounded-3xl p-6 ${tema.colores.card} ${tema.colores.borde} border-2 ${tema.colores.sombra} hover:scale-105 hover:-translate-y-2 transition-all duration-500 group cursor-pointer relative overflow-hidden`}
              onClick={() => setFiltroEstado("en_progreso")}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-sky-500/10 to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-sky-500 to-blue-500 flex items-center justify-center shadow-2xl group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                    <Activity className="w-7 h-7 text-white animate-pulse" />
                  </div>
                  {obtenerIconoTendencia(0)}
                </div>
                <div
                  className={`text-4xl font-black mb-2 ${tema.colores.texto} group-hover:scale-110 transition-transform duration-300`}
                >
                  {estadisticas?.en_progreso ?? 0}
                </div>
                <div
                  className={`text-xs font-bold uppercase tracking-wider ${tema.colores.textoSecundario}`}
                >
                  En Progreso
                </div>
              </div>
            </div>

            {/* Críticas */}
            <div
              className={`rounded-3xl p-6 ${tema.colores.card} ${tema.colores.borde} border-2 ${tema.colores.sombra} hover:scale-105 hover:-translate-y-2 transition-all duration-500 group cursor-pointer relative overflow-hidden`}
              onClick={() => setFiltroPrioridad("critica")}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-rose-500/10 to-red-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-rose-500 to-red-500 flex items-center justify-center shadow-2xl group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 animate-pulse">
                    <AlertCircle className="w-7 h-7 text-white" />
                  </div>
                  {obtenerIconoTendencia(0)}
                </div>
                <div
                  className={`text-4xl font-black mb-2 ${tema.colores.texto} group-hover:scale-110 transition-transform duration-300 animate-pulse`}
                >
                  {estadisticas?.criticas ?? 0}
                </div>
                <div
                  className={`text-xs font-bold uppercase tracking-wider ${tema.colores.textoSecundario}`}
                >
                  Críticas
                </div>
              </div>
            </div>

            {/* Completadas */}
            <div
              className={`rounded-3xl p-6 ${tema.colores.card} ${tema.colores.borde} border-2 ${tema.colores.sombra} hover:scale-105 hover:-translate-y-2 transition-all duration-500 group cursor-pointer relative overflow-hidden`}
              onClick={() => setFiltroEstado("completada")}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-green-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-green-500 flex items-center justify-center shadow-2xl group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                    <CheckCircle2 className="w-7 h-7 text-white" />
                  </div>
                  {obtenerIconoTendencia(0)}
                </div>
                <div
                  className={`text-4xl font-black mb-2 ${tema.colores.texto} group-hover:scale-110 transition-transform duration-300`}
                >
                  {estadisticas?.completadas ?? 0}
                </div>
                <div
                  className={`text-xs font-bold uppercase tracking-wider ${tema.colores.textoSecundario}`}
                >
                  Completadas
                </div>
              </div>
            </div>

            {/* Vencidas */}
            <div
              className={`rounded-3xl p-6 ${tema.colores.card} ${tema.colores.borde} border-2 ${tema.colores.sombra} hover:scale-105 hover:-translate-y-2 transition-all duration-500 group cursor-pointer relative overflow-hidden`}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-red-600/10 to-rose-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-red-600 to-rose-600 flex items-center justify-center shadow-2xl group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 animate-pulse">
                    <AlertTriangle className="w-7 h-7 text-white" />
                  </div>
                </div>
                <div
                  className={`text-4xl font-black mb-2 ${tema.colores.texto} group-hover:scale-110 transition-transform duration-300`}
                >
                  {estadisticas?.vencidas ?? 0}
                </div>
                <div
                  className={`text-xs font-bold uppercase tracking-wider ${tema.colores.textoSecundario}`}
                >
                  Vencidas
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filtros Ultra Premium */}
        <div
          className={`rounded-3xl p-6 mb-8 ${tema.colores.card} ${tema.colores.borde} border-2 ${tema.colores.sombra} transform hover:shadow-2xl transition-all duration-300`}
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div
                className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${tema.colores.gradiente} flex items-center justify-center shadow-xl`}
              >
                <Filter className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className={`text-xl font-black ${tema.colores.texto}`}>
                  Filtros Avanzados
                </h3>
                <p
                  className={`text-xs font-semibold ${tema.colores.textoSecundario}`}
                >
                  Combina múltiples criterios para afinar tu búsqueda
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                setFiltroEstado("todas");
                setFiltroPrioridad("todas");
                setFiltroCentro("todos");
                setFiltroSucursal("todas");
                setFiltroTipo("todos");
                setFechaDesde("");
                setFechaHasta("");
              }}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-sm font-bold ${tema.colores.secundario} ${tema.colores.texto} hover:scale-105 transition-all duration-300 shadow-lg`}
            >
              <X className="w-4 h-4" />
              Limpiar Filtros
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-6 gap-4">
            <div className="space-y-2">
              <label
                className={`text-xs font-bold uppercase tracking-wide ${tema.colores.textoSecundario} flex items-center gap-1`}
              >
                <Activity className="w-3 h-3" />
                Estado
              </label>
              <select
                value={filtroEstado}
                onChange={(e) => setFiltroEstado(e.target.value)}
                className={`w-full px-4 py-3 rounded-2xl text-sm ${tema.colores.card} ${tema.colores.borde} border-2 ${tema.colores.texto} focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all duration-300 cursor-pointer shadow-lg hover:shadow-xl`}
              >
                <option value="todas">Todas</option>
                <option value="pendiente">Pendientes</option>
                <option value="en_progreso">En progreso</option>
                <option value="en_revision">En revisión</option>
                <option value="completada">Completadas</option>
                <option value="rechazada">Rechazadas</option>
                <option value="cancelada">Canceladas</option>
              </select>
            </div>

            <div className="space-y-2">
              <label
                className={`text-xs font-bold uppercase tracking-wide ${tema.colores.textoSecundario} flex items-center gap-1`}
              >
                <Flame className="w-3 h-3" />
                Prioridad
              </label>
              <select
                value={filtroPrioridad}
                onChange={(e) => setFiltroPrioridad(e.target.value)}
                className={`w-full px-4 py-3 rounded-2xl text-sm ${tema.colores.card} ${tema.colores.borde} border-2 ${tema.colores.texto} focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all duration-300 cursor-pointer shadow-lg hover:shadow-xl`}
              >
                <option value="todas">Todas</option>
                <option value="critica">Crítica</option>
                <option value="urgente">Urgente</option>
                <option value="alta">Alta</option>
                <option value="media">Media</option>
                <option value="baja">Baja</option>
              </select>
            </div>

            <div className="space-y-2">
              <label
                className={`text-xs font-bold uppercase tracking-wide ${tema.colores.textoSecundario} flex items-center gap-1`}
              >
                <Building2 className="w-3 h-3" />
                Centro
              </label>
              <select
                value={filtroCentro}
                onChange={(e) => {
                  setFiltroCentro(e.target.value);
                  setFiltroSucursal("todas");
                }}
                className={`w-full px-4 py-3 rounded-2xl text-sm ${tema.colores.card} ${tema.colores.borde} border-2 ${tema.colores.texto} focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all duration-300 cursor-pointer shadow-lg hover:shadow-xl`}
              >
                <option value="todos">Todos</option>
                {centrosDisponibles.map((c) => (
                  <option key={c.id_centro} value={c.id_centro}>
                    {c.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label
                className={`text-xs font-bold uppercase tracking-wide ${tema.colores.textoSecundario} flex items-center gap-1`}
              >
                <MapPin className="w-3 h-3" />
                Sucursal
              </label>
              <select
                value={filtroSucursal}
                onChange={(e) => setFiltroSucursal(e.target.value)}
                disabled={filtroCentro === "todos"}
                className={`w-full px-4 py-3 rounded-2xl text-sm ${tema.colores.card} ${tema.colores.borde} border-2 ${tema.colores.texto} focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all duration-300 cursor-pointer shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                <option value="todas">Todas</option>
                {sucursalesDisponibles
                  .filter((s) =>
                    filtroCentro === "todos"
                      ? true
                      : s.id_centro === Number(filtroCentro)
                  )
                  .map((s) => (
                    <option key={s.id_sucursal} value={s.id_sucursal}>
                      {s.nombre}
                    </option>
                  ))}
              </select>
            </div>

            <div className="space-y-2">
              <label
                className={`text-xs font-bold uppercase tracking-wide ${tema.colores.textoSecundario} flex items-center gap-1`}
              >
                <Layers className="w-3 h-3" />
                Tipo
              </label>
              <select
                value={filtroTipo}
                onChange={(e) => setFiltroTipo(e.target.value)}
                className={`w-full px-4 py-3 rounded-2xl text-sm ${tema.colores.card} ${tema.colores.borde} border-2 ${tema.colores.texto} focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all duration-300 cursor-pointer shadow-lg hover:shadow-xl`}
              >
                <option value="todos">Todos</option>
                {tiposDisponibles.map((tipo) => (
                  <option key={tipo} value={tipo}>
                    {tipo}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label
                className={`text-xs font-bold uppercase tracking-wide ${tema.colores.textoSecundario} flex items-center gap-1`}
              >
                <Calendar className="w-3 h-3" />
                Rango
              </label>
              <div className="flex gap-2">
                <input
                  type="date"
                  value={fechaDesde}
                  onChange={(e) => setFechaDesde(e.target.value)}
                  className={`w-1/2 px-3 py-3 rounded-2xl text-xs ${tema.colores.card} ${tema.colores.borde} border-2 ${tema.colores.texto} focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all duration-300 shadow-lg`}
                />
                <input
                  type="date"
                  value={fechaHasta}
                  onChange={(e) => setFechaHasta(e.target.value)}
                  className={`w-1/2 px-3 py-3 rounded-2xl text-xs ${tema.colores.card} ${tema.colores.borde} border-2 ${tema.colores.texto} focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all duration-300 shadow-lg`}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Tabla Ultra Premium */}
        <div
          className={`rounded-3xl p-8 ${tema.colores.card} ${tema.colores.borde} border-2 ${tema.colores.sombra} transform hover:shadow-2xl transition-all duration-300`}
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div
                className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${tema.colores.gradiente} flex items-center justify-center shadow-2xl`}
              >
                <ClipboardList className="w-7 h-7 text-white" />
              </div>
              <div>
                <h3
                  className={`text-2xl font-black ${tema.colores.texto} flex items-center gap-2`}
                >
                  Mis Tareas
                  <span
                    className={`text-xs px-4 py-1.5 rounded-full ${tema.colores.secundario} ${tema.colores.texto} font-bold shadow-lg`}
                  >
                    {tareasFiltradas.length} visibles
                  </span>
                </h3>
                <p
                  className={`text-sm font-semibold ${tema.colores.textoSecundario} mt-1`}
                >
                  Tareas asignadas y creadas, filtradas según tu rol y permisos
                </p>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto custom-scrollbar-premium">
            {loadingTareas ? (
              <div className="space-y-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={i}
                    className="grid grid-cols-1 md:grid-cols-12 gap-4 p-5 rounded-2xl bg-white/5 animate-pulse"
                  >
                    <div className="md:col-span-4 h-5 bg-gray-500/20 rounded-xl" />
                    <div className="md:col-span-2 h-5 bg-gray-500/20 rounded-xl" />
                    <div className="md:col-span-2 h-5 bg-gray-500/20 rounded-xl" />
                    <div className="md:col-span-2 h-5 bg-gray-500/20 rounded-xl" />
                    <div className="md:col-span-2 h-5 bg-gray-500/20 rounded-xl" />
                  </div>
                ))}
              </div>
            ) : tareasFiltradas.length === 0 ? (
              <div className="py-20 text-center">
                <div
                  className={`w-28 h-28 mx-auto mb-6 rounded-3xl bg-gradient-to-br ${tema.colores.gradiente} flex items-center justify-center shadow-2xl animate-pulse`}
                >
                  <ClipboardCheck className="w-14 h-14 text-white" />
                </div>
                <p
                  className={`text-2xl font-black ${tema.colores.texto} mb-3`}
                >
                  No hay tareas que coincidan
                </p>
                <p className={`${tema.colores.textoSecundario} mb-8 text-lg`}>
                  Ajusta los filtros o crea una nueva tarea para comenzar.
                </p>
                <Link
                  href="/tecnico/tareas/nueva"
                  className={`inline-flex items-center gap-3 px-8 py-4 rounded-2xl font-bold ${tema.colores.primario} text-white ${tema.colores.sombra} hover:scale-105 transition-all duration-300 shadow-2xl`}
                >
                  <Plus className="w-5 h-5" />
                  Crear Primera Tarea
                </Link>
              </div>
            ) : (
              <table className="min-w-full text-sm">
                <thead>
                  <tr
                    className={`text-xs uppercase tracking-wider ${tema.colores.textoSecundario} border-b-2 ${tema.colores.borde}`}
                  >
                    <th className="py-4 px-4 text-left font-black">Tarea</th>
                    <th className="py-4 px-4 text-left font-black">
                      Prioridad
                    </th>
                    <th className="py-4 px-4 text-left font-black">Estado</th>
                    <th className="py-4 px-4 text-left font-black hidden xl:table-cell">
                      Responsable
                    </th>
                    <th className="py-4 px-4 text-left font-black hidden lg:table-cell">
                      Centro / Sucursal
                    </th>
                    <th className="py-4 px-4 text-left font-black hidden lg:table-cell">
                      Fechas
                    </th>
                    <th className="py-4 px-4 text-left font-black hidden xl:table-cell">
                      Tags
                    </th>
                    <th className="py-4 px-4 text-right font-black">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className={`divide-y-2 ${tema.colores.borde}`}>
                  {tareasFiltradas.map((tarea, idx) => (
                    <tr
                      key={tarea.id_tarea}
                      className={`${tema.colores.hover} transition-all duration-300 group transform hover:scale-[1.01]`}
                      style={{
                        animationDelay: `${idx * 50}ms`,
                      }}
                    >
                      {/* Tarea */}
                      <td className="py-4 px-4">
                        <div className="flex flex-col gap-2">
                          <button
                            onClick={() => irADetalle(tarea)}
                            className={`text-base font-black text-left ${tema.colores.texto} hover:${tema.colores.acento} hover:underline transition-colors duration-200`}
                          >
                            {tarea.titulo}
                          </button>
                          <p
                            className={`text-sm line-clamp-2 ${tema.colores.textoSecundario}`}
                          >
                            {tarea.descripcion}
                          </p>
                          <div className="flex flex-wrap gap-2 mt-1">
                            <span className="inline-flex items-center gap-1 text-[11px] px-3 py-1 rounded-full bg-white/5 border border-white/20 font-semibold">
                              <User className="w-3 h-3" />
                              {tarea.creador.nombre_completo}
                            </span>
                            <span className="inline-flex items-center gap-1 text-[11px] px-3 py-1 rounded-full bg-white/5 border border-white/20 font-semibold">
                              <ClipboardList className="w-3 h-3" />
                              {tarea.tipo}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Prioridad */}
                      <td className="py-4 px-4">
                        <span
                          className={`inline-flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-black border-2 ${obtenerColorPrioridad(
                            tarea.prioridad
                          )} transform group-hover:scale-110 transition-all duration-300`}
                        >
                          <Flame className="w-4 h-4" />
                          {tarea.prioridad.toUpperCase()}
                        </span>
                      </td>

                      {/* Estado */}
                      <td className="py-4 px-4">
                        <span
                          className={`inline-flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-black border-2 ${obtenerColorEstado(
                            tarea.estado
                          )} transform group-hover:scale-110 transition-all duration-300`}
                        >
                          {tarea.estado === "completada" ? (
                            <CheckCircle2 className="w-4 h-4" />
                          ) : tarea.estado === "pendiente" ? (
                            <Clock className="w-4 h-4" />
                          ) : (
                            <Activity className="w-4 h-4" />
                          )}
                          {tarea.estado.replace("_", " ").toUpperCase()}
                        </span>
                      </td>

                      {/* Responsable */}
                      <td className="py-4 px-4 hidden xl:table-cell">
                        <div className="flex flex-col gap-1">
                          <span
                            className={`text-sm font-bold ${tema.colores.texto}`}
                          >
                            {tarea.responsable.nombre_completo}
                          </span>
                          <span
                            className={`text-xs ${tema.colores.textoSecundario}`}
                          >
                            {tarea.responsable.rol}
                          </span>
                        </div>
                      </td>

                      {/* Centro */}
                      <td className="py-4 px-4 hidden lg:table-cell">
                        <div className="flex flex-col gap-1">
                          <span
                            className={`text-sm font-bold ${tema.colores.texto}`}
                          >
                            {tarea.centro?.nombre ?? "Sin centro"}
                          </span>
                          <span
                            className={`text-xs ${tema.colores.textoSecundario}`}
                          >
                            {tarea.sucursal?.nombre ?? "Sin sucursal"}
                          </span>
                        </div>
                      </td>

                      {/* Fechas */}
                      <td className="py-4 px-4 hidden lg:table-cell">
                        <div className="flex flex-col gap-2 text-xs">
                          <span className={tema.colores.textoSecundario}>
                            Creada:{" "}
                            <span className="font-bold">
                              {formatearFecha(tarea.fecha_creacion)}
                            </span>
                          </span>
                          <span className={tema.colores.textoSecundario}>
                            Límite:{" "}
                            <span className="font-bold">
                              {formatearFecha(tarea.fecha_limite)}
                            </span>
                          </span>
                        </div>
                      </td>

                      {/* Tags */}
                      <td className="py-4 px-4 hidden xl:table-cell">
                        <div className="flex flex-wrap gap-1.5">
                          {tarea.tags?.slice(0, 3).map((tag) => (
                            <span
                              key={tag}
                              className="px-3 py-1 rounded-full text-[10px] font-bold bg-white/5 border border-white/20"
                            >
                              #{tag}
                            </span>
                          ))}
                          {tarea.tags && tarea.tags.length > 3 && (
                            <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-white/5 border border-white/20">
                              +{tarea.tags.length - 3}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Acciones */}
                      <td className="py-4 px-4 text-right">
  <div className="flex flex-wrap justify-end gap-2">

    {/* Ver Detalle */}
    <button
      onClick={() => irADetalle(tarea)}
      className={`flex items-center gap-2 px-3 py-2 text-xs font-bold rounded-xl 
        ${tema.colores.hover} ${tema.colores.texto} transition-all duration-200 
        hover:scale-105 shadow`}
    >
      <Eye className="w-4 h-4" />
      Ver
    </button>

    {/* Editar */}
    <button
      onClick={() => irAEditar(tarea)}
      disabled={!tarea.puede_editar}
      className={`flex items-center gap-2 px-3 py-2 text-xs font-bold rounded-xl 
        ${tema.colores.hover} ${tema.colores.texto} transition-all duration-200 
        hover:scale-105 shadow disabled:opacity-40 disabled:cursor-not-allowed`}
    >
      <Edit className="w-4 h-4" />
      Editar
    </button>

    {/* Historial */}
    <button
      onClick={() => irAHistorial(tarea)}
      className={`flex items-center gap-2 px-3 py-2 text-xs font-bold rounded-xl 
        ${tema.colores.hover} ${tema.colores.texto} transition-all duration-200 
        hover:scale-105 shadow`}
    >
      <Clock className="w-4 h-4" />
      Historial
    </button>

    {/* Cambiar Estado (mini botones) */}
    <div className="flex items-center gap-2">
      {(
        ["pendiente", "en_progreso", "en_revision", "completada"] as TareaEstado[]
      ).map((estado) => (
        <button
          key={estado}
          onClick={() => cambiarEstadoTarea(tarea, estado)}
          disabled={
            !tarea.puede_cambiar_estado ||
            cambiandoEstadoId === tarea.id_tarea
          }
          className={`px-3 py-1 text-[10px] font-black rounded-xl 
            border-2 ${obtenerColorEstado(estado)} 
            hover:scale-105 transition-all duration-200
            disabled:opacity-40 disabled:cursor-not-allowed`}
        >
          {estado.replace("_", " ")}
        </button>
      ))}
    </div>

    {/* Eliminar */}
    <button
      onClick={() => confirmarEliminarTarea(tarea)}
      disabled={!tarea.puede_eliminar}
      className="flex items-center gap-2 px-3 py-2 text-xs font-bold rounded-xl 
        text-rose-400 hover:bg-rose-500/20 transition-all duration-200 
        hover:scale-105 shadow disabled:opacity-40 disabled:cursor-not-allowed"
    >
      <Trash className="w-4 h-4" />
      Eliminar
    </button>

  </div>
</td>

                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Modal Eliminar Ultra Premium */}
        {tareaAEliminar && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md animate-fadeIn">
            <div
              className={`w-full max-w-lg rounded-3xl ${tema.colores.card} ${tema.colores.borde} border-2 ${tema.colores.sombra} p-8 animate-scaleIn`}
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-rose-500 to-red-500 flex items-center justify-center shadow-2xl">
                  <Trash className="w-7 h-7 text-white" />
                </div>
                <h3 className={`text-2xl font-black ${tema.colores.texto}`}>
                  Eliminar Tarea
                </h3>
              </div>
              <p className={`text-base mb-6 ${tema.colores.textoSecundario}`}>
                ¿Estás seguro de que deseas eliminar la tarea{" "}
                <span className={`font-black ${tema.colores.texto}`}>
                  "{tareaAEliminar.titulo}"
                </span>
                ? Esta acción no se puede deshacer.
              </p>
              <div className="flex items-center justify-end gap-3">
                <button
                  onClick={() => setTareaAEliminar(null)}
                  disabled={eliminando}
                  className={`px-6 py-3 rounded-2xl text-sm font-bold ${tema.colores.secundario} ${tema.colores.texto} hover:scale-105 transition-all duration-300 disabled:opacity-50 shadow-lg`}
                >
                  Cancelar
                </button>
                <button
                  onClick={eliminarTarea}
                  disabled={eliminando}
                  className="px-6 py-3 rounded-2xl text-sm font-bold bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white flex items-center gap-2 disabled:opacity-50 hover:scale-105 transition-all duration-300 shadow-2xl"
                >
                  {eliminando && <Loader2 className="w-4 h-4 animate-spin" />}
                  Eliminar Definitivamente
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* FOOTER ULTRA PREMIUM */}
      <footer
        className={`transition-all duration-500 ${
          sidebarAbierto ? "ml-72" : "ml-20"
        } ${tema.colores.card} ${tema.colores.borde} border-t-2 py-8 mt-12 relative z-10`}
      >
        <div className="max-w-[1920px] mx-auto px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-xl bg-gradient-to-br ${tema.colores.gradiente} flex items-center justify-center shadow-xl`}
            >
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div>
              <p
                className={`text-sm font-bold ${tema.colores.texto}`}
              >
                © 2025 AnyssaMed
              </p>
              <p className={`text-xs ${tema.colores.textoSecundario}`}>
                Módulo Ultra Premium de Tareas (Secretaría)
              </p>
            </div>
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
            <button
              onClick={cerrarSesion}
              className="text-sm font-bold text-rose-400 hover:text-rose-300 transition-colors"
            >
              Cerrar Sesión
            </button>
          </div>
        </div>
      </footer>

      {/* ESTILOS GLOBALES ULTRA PREMIUM */}
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

        @keyframes gradient {
          0%, 100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }

        .animate-wave {
          animation: wave 1s ease-in-out infinite;
        }

        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }

        .animate-scaleIn {
          animation: scaleIn 0.3s ease-out;
        }

        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 3s ease infinite;
        }

        .custom-scrollbar-premium::-webkit-scrollbar {
          width: 10px;
          height: 10px;
        }

        .custom-scrollbar-premium::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.1);
          border-radius: 10px;
        }

        .custom-scrollbar-premium::-webkit-scrollbar-thumb {
          background: linear-gradient(
            135deg,
            rgba(99, 102, 241, 0.8),
            rgba(168, 85, 247, 0.8)
          );
          border-radius: 10px;
          border: 2px solid transparent;
          background-clip: padding-box;
        }

        .custom-scrollbar-premium::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(
            135deg,
            rgba(99, 102, 241, 1),
            rgba(168, 85, 247, 1)
          );
        }

        /* Animación de entrada para filas */
        tbody tr {
          animation: fadeIn 0.3s ease-out backwards;
        }

        /* Efecto de brillo en hover */
        .group:hover .shadow-lg {
          box-shadow: 0 20px 25px -5px rgba(99, 102, 241, 0.3),
            0 10px 10px -5px rgba(99, 102, 241, 0.2);
        }

        /* Transiciones suaves */
        * {
          transition-property: background-color, border-color, color, fill, stroke, opacity, box-shadow, transform;
          transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
        }
      `}</style>
    </div>
  );
}

