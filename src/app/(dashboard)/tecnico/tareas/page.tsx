// src/app/(dashboard)/secretaria/tareas/page.tsx
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
// CONFIGURACIÓN DE TEMAS
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
// COMPONENTE PRINCIPAL (SECRETARIA)
// ========================================

const roleParam = "secretaria";
const roleLabel = "Secretaria";

export default function TareasSecretariaPage() {
  const pathname = usePathname();
  const router = useRouter();

  // Usuario y tema
  const [usuario, setUsuario] = useState<UsuarioSesion | null>(null);
  const [temaActual, setTemaActual] = useState<TemaColor>("light");

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
    if (pathname === "/secretaria") return "dashboard";
    if (pathname.startsWith("/secretaria/tareas")) return "tareas";
    if (pathname.startsWith("/secretaria/agenda")) return "agenda";
    if (pathname.startsWith("/secretaria/confirmaciones")) return "confirmaciones";
    if (pathname.startsWith("/secretaria/llamadas")) return "llamadas";
    if (pathname.startsWith("/secretaria/pacientes")) return "pacientes";
    if (pathname.startsWith("/secretaria/medicos")) return "medicos";
    if (pathname.startsWith("/secretaria/recordatorios")) return "recordatorios";
    if (pathname.startsWith("/secretaria/documentos")) return "documentos";
    if (pathname.startsWith("/secretaria/mensajes")) return "mensajes";
    if (pathname.startsWith("/secretaria/telemedicina")) return "telemedicina";
    if (pathname.startsWith("/secretaria/reportes")) return "reportes";
    if (pathname.startsWith("/secretaria/perfil")) return "perfil";
    if (pathname.startsWith("/secretaria/configuracion")) return "configuracion";
    return "";
  }, [pathname]);

  // ========================================
  // MENU DE NAVEGACIÓN ESPECÍFICO SECRETARIA
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
        { titulo: "Ver Agenda", icono: CalendarDays, url: "/secretaria/agenda" },
        { titulo: "Nueva Cita", icono: CalendarPlus, url: "/secretaria/agenda/nueva" },
        { titulo: "Búsqueda Citas", icono: Search, url: "/secretaria/agenda/buscar" },
        { titulo: "Disponibilidad", icono: CalendarClock, url: "/secretaria/agenda/disponibilidad" },
      ],
    },
    {
      titulo: "Confirmaciones",
      icono: CheckSquare2,
      url: "",
      badge: estadisticas?.citas_pendientes_confirmacion || 0,
      activo: seccionActiva === "confirmaciones",
      submenu: [
        { titulo: "Pendientes", icono: Clock, url: "/secretaria/confirmaciones/pendientes" },
        { titulo: "Confirmadas", icono: CheckCircle2, url: "/secretaria/confirmaciones/confirmadas" },
        { titulo: "Cancelaciones", icono: X, url: "/secretaria/confirmaciones/cancelaciones" },
      ],
    },
    {
      titulo: "Llamadas",
      icono: Phone,
      url: "",
      badge: estadisticas?.llamadas_pendientes || 0,
      activo: seccionActiva === "llamadas",
      submenu: [
        { titulo: "Por Realizar", icono: PhoneOutgoing, url: "/secretaria/llamadas/pendientes" },
        { titulo: "Realizadas", icono: PhoneIncoming, url: "/secretaria/llamadas/historial" },
        { titulo: "Registro", icono: ClipboardList, url: "/secretaria/llamadas/registro" },
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
        { titulo: "Nuevo Paciente", icono: UserPlus, url: "/secretaria/pacientes/nuevo" },
        { titulo: "Búsqueda", icono: Search, url: "/secretaria/pacientes/buscar" },
        { titulo: "Atención Hoy", icono: CalendarCheck, url: "/secretaria/pacientes/hoy" },
      ],
    },
    {
      titulo: "Médicos",
      icono: Stethoscope,
      url: "",
      activo: seccionActiva === "medicos",
      submenu: [
        { titulo: "Mis Médicos", icono: UserCog, url: "/secretaria/medicos" },
        { titulo: "Disponibilidad", icono: CalendarClock, url: "/secretaria/medicos/disponibilidad" },
        { titulo: "Contacto", icono: Phone, url: "/secretaria/medicos/contacto" },
      ],
    },
    {
      titulo: "Recordatorios",
      icono: Bell,
      url: "",
      badge: estadisticas?.recordatorios_enviados_hoy || 0,
      activo: seccionActiva === "recordatorios",
      submenu: [
        { titulo: "Programados", icono: Clock, url: "/secretaria/recordatorios/programados" },
        { titulo: "Enviados", icono: Send, url: "/secretaria/recordatorios/enviados" },
        { titulo: "Configuración", icono: Settings, url: "/secretaria/recordatorios/config" },
      ],
    },
    {
      titulo: "Documentos",
      icono: FileText,
      url: "",
      badge: estadisticas?.documentos_procesados_semana || 0,
      activo: seccionActiva === "documentos",
      submenu: [
        { titulo: "Gestión", icono: FileSpreadsheet, url: "/secretaria/documentos" },
        { titulo: "Certificados", icono: Award, url: "/secretaria/documentos/certificados" },
        { titulo: "Recetas", icono: Pill, url: "/secretaria/documentos/recetas" },
        { titulo: "Órdenes", icono: ClipboardList, url: "/secretaria/documentos/ordenes" },
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
        { titulo: "Sala Espera", icono: Clock, url: "/secretaria/telemedicina/espera" },
        { titulo: "Programadas", icono: CalendarCheck, url: "/secretaria/telemedicina/programadas" },
        { titulo: "Asistencia", icono: Settings, url: "/secretaria/telemedicina/asistencia" },
      ],
    },
    {
      titulo: "Tareas",
      icono: CheckSquare2,
      url: "",
      badge: estadisticas?.tareas_pendientes || 0,
      activo: seccionActiva === "tareas",
      submenu: [
        { titulo: "Todas Mis Tareas", icono: Square, url: "/secretaria/tareas" },
        { titulo: "Pendientes", icono: Square, url: "/secretaria/tareas/pendientes" },
        { titulo: "Completadas", icono: CheckSquare2, url: "/secretaria/tareas/completadas" },
        { titulo: "Nueva Tarea", icono: Plus, url: "/secretaria/tareas/nueva" },
      ],
    },
    {
      titulo: "Reportes",
      icono: BarChart3,
      url: "",
      activo: seccionActiva === "reportes",
      submenu: [
        { titulo: "Mis Métricas", icono: TrendingUp, url: "/secretaria/reportes/metricas" },
        { titulo: "Citas", icono: Calendar, url: "/secretaria/reportes/citas" },
        { titulo: "Llamadas", icono: Phone, url: "/secretaria/reportes/llamadas" },
        { titulo: "Rendimiento", icono: Target, url: "/secretaria/reportes/rendimiento" },
      ],
    },
    {
      titulo: "Mi Perfil",
      icono: User,
      url: "",
      activo: seccionActiva === "perfil",
      submenu: [
        { titulo: "Información Personal", icono: User, url: "/secretaria/perfil" },
        { titulo: "Horarios", icono: Clock, url: "/secretaria/perfil/horarios" },
        { titulo: "Preferencias", icono: Settings, url: "/secretaria/perfil/preferencias" },
      ],
    },
    {
      titulo: "Configuración",
      icono: Settings,
      url: "",
      activo: seccionActiva === "configuracion",
      submenu: [
        { titulo: "General", icono: Settings, url: "/secretaria/configuracion/" },
        { titulo: "Notificaciones", icono: Bell, url: "/secretaria/configuracion/notificaciones" },
        { titulo: "Seguridad", icono: Shield, url: "/secretaria/configuracion/seguridad" },
        { titulo: "Temas", icono: Sparkles, url: "/secretaria/configuracion/temas" },
      ],
    },
  ];

  // ========================================
  // EFECTOS
  // ========================================

  // Aplicar fondo al body
  useEffect(() => {
    document.body.className = `bg-gradient-to-br ${tema.colores.fondo} min-h-screen transition-all duration-500`;
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
    router.push(`/secretaria/tareas/${tarea.id_tarea}`);
  };

  const irAEditar = (tarea: Tarea) => {
    router.push(`/secretaria/tareas/${tarea.id_tarea}/editar`);
  };

  const irAHistorial = (tarea: Tarea) => {
    router.push(`/secretaria/tareas/${tarea.id_tarea}/historial`);
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
        className={`min-h-screen flex items-center justify-center bg-gradient-to-br ${tema.colores.fondo}`}
      >
        <div className="text-center">
          <div className="relative mb-8">
            <div className="w-32 h-32 border-4 border-indigo-400 border-t-transparent rounded-full animate-spin" />
            <div
              className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 bg-gradient-to-br ${tema.colores.gradiente} rounded-full flex items-center justify-center animate-pulse`}
            >
              <CheckSquare2 className="w-10 h-10 text-white" />
            </div>
          </div>
          <h2 className={`text-4xl font-black mb-4 ${tema.colores.texto}`}>
            Cargando módulo de tareas...
          </h2>
          <p
            className={`text-lg font-semibold ${tema.colores.textoSecundario} animate-pulse`}
          >
            Preparando tus tareas como secretaria
          </p>
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
          className={`text-center max-w-md mx-auto p-8 rounded-3xl ${tema.colores.card} ${tema.colores.sombra} ${tema.colores.borde} border`}
        >
          <div
            className={`w-24 h-24 bg-gradient-to-br ${tema.colores.gradiente} rounded-3xl flex items-center justify-center mx-auto mb-6 animate-pulse`}
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
  // RENDER PRINCIPAL
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
        } ${tema.colores.header} ${tema.colores.borde} border-b ${
          tema.colores.sombra
        }`}
      >
        <div className="flex items-center justify-between px-8 py-4">
          <div className="flex-1 max-w-2xl">
            <div className="relative">
              <Search
                className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 ${tema.colores.textoSecundario}`}
              />
              <input
                type="text"
                placeholder="Buscar tareas por título, responsable, centro, etiqueta..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className={`w-full pl-12 pr-4 py-3 rounded-xl ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto} placeholder:${tema.colores.textoSecundario} focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all duration-300`}
              />
              {busqueda && (
                <button
                  onClick={() => setBusqueda("")}
                  className={`absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded-lg ${tema.colores.hover}`}
                >
                  <X className="w-4 h-4" />
                </button>
              )}
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
        {/* Encabezado */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2
              className={`text-4xl md:text-5xl font-black mb-2 ${tema.colores.texto} flex items-center gap-3`}
            >
              {obtenerSaludo()}, {usuario.nombre}
              <span className="animate-wave inline-block">👋</span>
            </h2>
            <p
              className={`text-lg font-semibold ${tema.colores.textoSecundario}`}
            >
              Gestión inteligente de tareas · Rol:{" "}
              <span className={tema.colores.acento}>{roleLabel}</span>
            </p>
            <p className={`text-sm mt-1 ${tema.colores.textoSecundario}`}>
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
              className={`flex items-center gap-2 px-4 py-3 rounded-xl font-bold text-sm ${tema.colores.secundario} ${tema.colores.texto} ${tema.colores.sombra} hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              <RefreshCw
                className={`w-4 h-4 ${
                  loadingTareas || loadingEstadisticas ? "animate-spin" : ""
                }`}
              />
              Actualizar
            </button>
            <Link
              href={`/secretaria/tareas/nueva`}
              className={`flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-sm ${tema.colores.primario} text-white ${tema.colores.sombra} hover:scale-105 transition-all`}
            >
              <Plus className="w-4 h-4" />
              Crear nueva tarea
            </Link>
          </div>
        </div>

        {/* KPIs */}
        {loadingEstadisticas ? (
          <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-6 gap-6 mb-8">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className={`rounded-2xl p-6 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} animate-pulse`}
              >
                <div className="w-10 h-10 rounded-xl bg-gray-500/20 mb-4" />
                <div className="h-7 w-16 bg-gray-500/20 rounded mb-2" />
                <div className="h-3 w-24 bg-gray-500/20 rounded" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-6 gap-6 mb-8">
            <div
              className={`rounded-2xl p-6 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} hover:scale-105 hover:-translate-y-1 transition-all group cursor-pointer`}
              onClick={() => setFiltroEstado("todas")}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                  <CheckSquare2 className="w-6 h-6 text-white" />
                </div>
                {obtenerIconoTendencia(0)}
              </div>
              <div
                className={`text-3xl font-black mb-1 ${tema.colores.texto}`}
              >
                {estadisticas?.total ?? 0}
              </div>
              <div
                className={`text-xs font-bold uppercase tracking-wider ${tema.colores.textoSecundario}`}
              >
                Tareas Totales
              </div>
            </div>

            <div
              className={`rounded-2xl p-6 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} hover:scale-105 hover:-translate-y-1 transition-all group cursor-pointer`}
              onClick={() => setFiltroEstado("pendiente")}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                  <Clock className="w-6 h-6 text-white" />
                </div>
                {obtenerIconoTendencia(0)}
              </div>
              <div
                className={`text-3xl font-black mb-1 ${tema.colores.texto}`}
              >
                {estadisticas?.pendientes ?? 0}
              </div>
              <div
                className={`text-xs font-bold uppercase tracking-wider ${tema.colores.textoSecundario}`}
              >
                Pendientes
              </div>
            </div>

            <div
              className={`rounded-2xl p-6 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} hover:scale-105 hover:-translate-y-1 transition-all group cursor-pointer`}
              onClick={() => setFiltroEstado("en_progreso")}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-sky-500 to-blue-500 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                  <Activity className="w-6 h-6 text-white" />
                </div>
                {obtenerIconoTendencia(0)}
              </div>
              <div
                className={`text-3xl font-black mb-1 ${tema.colores.texto}`}
              >
                {estadisticas?.en_progreso ?? 0}
              </div>
              <div
                className={`text-xs font-bold uppercase tracking-wider ${tema.colores.textoSecundario}`}
              >
                En progreso
              </div>
            </div>

            <div
              className={`rounded-2xl p-6 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} hover:scale-105 hover:-translate-y-1 transition-all group cursor-pointer`}
              onClick={() => setFiltroPrioridad("critica")}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-rose-500 to-red-500 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                  <AlertCircle className="w-6 h-6 text-white" />
                </div>
                {obtenerIconoTendencia(0)}
              </div>
              <div
                className={`text-3xl font-black mb-1 ${tema.colores.texto}`}
              >
                {estadisticas?.criticas ?? 0}
              </div>
              <div
                className={`text-xs font-bold uppercase tracking-wider ${tema.colores.textoSecundario}`}
              >
                Críticas
              </div>
            </div>

            <div
              className={`rounded-2xl p-6 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} hover:scale-105 hover:-translate-y-1 transition-all group cursor-pointer`}
              onClick={() => setFiltroEstado("completada")}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-green-500 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                  <CheckCircle2 className="w-6 h-6 text-white" />
                </div>
                {obtenerIconoTendencia(0)}
              </div>
              <div
                className={`text-3xl font-black mb-1 ${tema.colores.texto}`}
              >
                {estadisticas?.completadas ?? 0}
              </div>
              <div
                className={`text-xs font-bold uppercase tracking-wider ${tema.colores.textoSecundario}`}
              >
                Completadas
              </div>
            </div>

            <div
              className={`rounded-2xl p-6 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} hover:scale-105 hover:-translate-y-1 transition-all group cursor-pointer`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-600 to-rose-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                  <AlertTriangle className="w-6 h-6 text-white" />
                </div>
              </div>
              <div
                className={`text-3xl font-black mb-1 ${tema.colores.texto}`}
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
        )}

        {/* Filtros avanzados */}
        <div
          className={`rounded-2xl p-5 mb-8 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra}`}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div
                className={`w-10 h-10 rounded-xl bg-gradient-to-br ${tema.colores.gradiente} flex items-center justify-center`}
              >
                <Filter className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className={`text-lg font-black ${tema.colores.texto}`}>
                  Filtros avanzados
                </h3>
                <p
                  className={`text-xs font-semibold ${tema.colores.textoSecundario}`}
                >
                  Combina estado, prioridad, centro, tipo y fechas para afinar
                  la vista
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
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold ${tema.colores.secundario} ${tema.colores.texto} hover:scale-105 transition-all`}
            >
              <X className="w-4 h-4" />
              Limpiar filtros
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-6 gap-3">
            <div className="space-y-1">
              <label
                className={`text-xs font-semibold uppercase tracking-wide ${tema.colores.textoSecundario}`}
              >
                Estado
              </label>
              <select
                value={filtroEstado}
                onChange={(e) => setFiltroEstado(e.target.value)}
                className={`w-full px-3 py-2 rounded-xl text-sm ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto} focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all`}
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

            <div className="space-y-1">
              <label
                className={`text-xs font-semibold uppercase tracking-wide ${tema.colores.textoSecundario}`}
              >
                Prioridad
              </label>
              <select
                value={filtroPrioridad}
                onChange={(e) => setFiltroPrioridad(e.target.value)}
                className={`w-full px-3 py-2 rounded-xl text-sm ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto} focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all`}
              >
                <option value="todas">Todas</option>
                <option value="critica">Crítica</option>
                <option value="urgente">Urgente</option>
                <option value="alta">Alta</option>
                <option value="media">Media</option>
                <option value="baja">Baja</option>
              </select>
            </div>

            <div className="space-y-1">
              <label
                className={`text-xs font-semibold uppercase tracking-wide ${tema.colores.textoSecundario}`}
              >
                Centro
              </label>
              <select
                value={filtroCentro}
                onChange={(e) => {
                  setFiltroCentro(e.target.value);
                  setFiltroSucursal("todas");
                }}
                className={`w-full px-3 py-2 rounded-xl text-sm ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto} focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all`}
              >
                <option value="todos">Todos mis centros</option>
                {centrosDisponibles.map((c) => (
                  <option key={c.id_centro} value={c.id_centro}>
                    {c.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label
                className={`text-xs font-semibold uppercase tracking-wide ${tema.colores.textoSecundario}`}
              >
                Sucursal
              </label>
              <select
                value={filtroSucursal}
                onChange={(e) => setFiltroSucursal(e.target.value)}
                disabled={filtroCentro === "todos"}
                className={`w-full px-3 py-2 rounded-xl text-sm ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto} focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed`}
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

            <div className="space-y-1">
              <label
                className={`text-xs font-semibold uppercase tracking-wide ${tema.colores.textoSecundario}`}
              >
                Tipo de tarea
              </label>
              <select
                value={filtroTipo}
                onChange={(e) => setFiltroTipo(e.target.value)}
                className={`w-full px-3 py-2 rounded-xl text-sm ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto} focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all`}
              >
                <option value="todos">Todos</option>
                {tiposDisponibles.map((tipo) => (
                  <option key={tipo} value={tipo}>
                    {tipo}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label
                className={`text-xs font-semibold uppercase tracking-wide ${tema.colores.textoSecundario}`}
              >
                Rango de fechas
              </label>
              <div className="flex gap-2">
                <input
                  type="date"
                  value={fechaDesde}
                  onChange={(e) => setFechaDesde(e.target.value)}
                  className={`w-1/2 px-2 py-2 rounded-xl text-xs ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto} focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all`}
                />
                <input
                  type="date"
                  value={fechaHasta}
                  onChange={(e) => setFechaHasta(e.target.value)}
                  className={`w-1/2 px-2 py-2 rounded-xl text-xs ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto} focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all`}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Tabla de tareas */}
        <div
          className={`rounded-2xl p-6 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra}`}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div
                className={`w-12 h-12 rounded-xl bg-gradient-to-br ${tema.colores.gradiente} flex items-center justify-center shadow-lg`}
              >
                <ClipboardList className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3
                  className={`text-2xl font-black ${tema.colores.texto} flex items-center gap-2`}
                >
                  Mis tareas
                  <span
                    className={`text-xs px-3 py-1 rounded-full ${tema.colores.secundario} ${tema.colores.texto} font-bold`}
                  >
                    {tareasFiltradas.length} visibles
                  </span>
                </h3>
                <p
                  className={`text-xs font-semibold ${tema.colores.textoSecundario}`}
                >
                  Tareas asignadas y creadas por ti, filtradas según tu rol y
                  permisos
                </p>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto custom-scrollbar">
            {loadingTareas ? (
              <div className="space-y-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={i}
                    className="grid grid-cols-1 md:grid-cols-12 gap-4 p-4 rounded-xl bg-white/5 animate-pulse"
                  >
                    <div className="md:col-span-4 h-4 bg-gray-500/20 rounded" />
                    <div className="md:col-span-2 h-4 bg-gray-500/20 rounded" />
                    <div className="md:col-span-2 h-4 bg-gray-500/20 rounded" />
                    <div className="md:col-span-2 h-4 bg-gray-500/20 rounded" />
                    <div className="md:col-span-2 h-4 bg-gray-500/20 rounded" />
                  </div>
                ))}
              </div>
            ) : tareasFiltradas.length === 0 ? (
              <div className="py-16 text-center">
                <div
                  className={`w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-br ${tema.colores.gradiente} flex items-center justify-center animate-pulse`}
                >
                  <ClipboardCheck className="w-12 h-12 text-white" />
                </div>
                <p className={`text-xl font-bold ${tema.colores.texto} mb-2`}>
                  No hay tareas que coincidan con los filtros
                </p>
                <p className={`${tema.colores.textoSecundario} mb-6`}>
                  Ajusta los filtros o crea una nueva tarea para comenzar.
                </p>
                <Link
                  href="/secretaria/tareas/nueva"
                  className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold ${tema.colores.primario} text-white ${tema.colores.sombra} hover:scale-105 transition-all`}
                >
                  <Plus className="w-5 h-5" />
                  Crear primera tarea
                </Link>
              </div>
            ) : (
              <table className="min-w-full text-sm align-middle">
                <thead>
                  <tr
                    className={`text-xs uppercase tracking-wide ${tema.colores.textoSecundario} border-b ${tema.colores.borde}`}
                  >
                    <th className="py-3 px-3 text-left font-semibold">
                      Tarea
                    </th>
                    <th className="py-3 px-3 text-left font-semibold">
                      Prioridad
                    </th>
                    <th className="py-3 px-3 text-left font-semibold">
                      Estado
                    </th>
                    <th className="py-3 px-3 text-left font-semibold hidden xl:table-cell">
                      Responsable
                    </th>
                    <th className="py-3 px-3 text-left font-semibold hidden lg:table-cell">
                      Centro / Sucursal
                    </th>
                    <th className="py-3 px-3 text-left font-semibold hidden lg:table-cell">
                      Fechas
                    </th>
                    <th className="py-3 px-3 text-left font-semibold hidden xl:table-cell">
                      Tags
                    </th>
                    <th className="py-3 px-3 text-right font-semibold">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${tema.colores.borde}`}>
                  {tareasFiltradas.map((tarea) => (
                    <tr
                      key={tarea.id_tarea}
                      className={`${tema.colores.hover} transition-colors group`}
                    >
                      {/* Tarea */}
                      <td className="py-3 px-3 align-top">
                        <div className="flex flex-col gap-1">
                          <button
                            onClick={() => irADetalle(tarea)}
                            className={`text-sm md:text-base font-bold text-left ${tema.colores.texto} hover:${tema.colores.acento} hover:underline transition-colors`}
                          >
                            {tarea.titulo}
                          </button>
                          <p
                            className={`text-xs md:text-sm line-clamp-2 ${tema.colores.textoSecundario}`}
                          >
                            {tarea.descripcion}
                          </p>
                          <div className="flex flex-wrap gap-2 mt-1">
                            <span className="inline-flex items-center gap-1 text-[10px] px-2 py-1 rounded-full bg-white/5 border border-white/10">
                              <User className="w-3 h-3" />
                              Creada por {tarea.creador.nombre_completo}
                            </span>
                            <span className="inline-flex items-center gap-1 text-[10px] px-2 py-1 rounded-full bg-white/5 border border-white/10">
                              <ClipboardList className="w-3 h-3" />
                              {tarea.tipo}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Prioridad */}
                      <td className="py-3 px-3 align-top">
                        <span
                          className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-bold border ${obtenerColorPrioridad(
                            tarea.prioridad
                          )}`}
                        >
                          <Flame className="w-3 h-3" />
                          {tarea.prioridad.toUpperCase()}
                        </span>
                      </td>

                      {/* Estado */}
                      <td className="py-3 px-3 align-top">
                        <span
                          className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-bold border ${obtenerColorEstado(
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
                          {tarea.estado.replace("_", " ").toUpperCase()}
                        </span>
                      </td>

                      {/* Responsable */}
                      <td className="py-3 px-3 align-top hidden xl:table-cell">
                        <div className="flex flex-col gap-1">
                          <span
                            className={`text-xs font-semibold ${tema.colores.texto}`}
                          >
                            {tarea.responsable.nombre_completo}
                          </span>
                          <span
                            className={`text-[11px] ${tema.colores.textoSecundario}`}
                          >
                            {tarea.responsable.rol}
                          </span>
                        </div>
                      </td>

                      {/* Centro */}
                      <td className="py-3 px-3 align-top hidden lg:table-cell">
                        <div className="flex flex-col gap-1">
                          <span
                            className={`text-xs font-semibold ${tema.colores.texto}`}
                          >
                            {tarea.centro?.nombre ?? "Sin centro"}
                          </span>
                          <span
                            className={`text-[11px] ${tema.colores.textoSecundario}`}
                          >
                            {tarea.sucursal?.nombre ?? "Sin sucursal"}
                          </span>
                        </div>
                      </td>

                      {/* Fechas */}
                      <td className="py-3 px-3 align-top hidden lg:table-cell">
                        <div className="flex flex-col gap-1 text-[11px]">
                          <span className={tema.colores.textoSecundario}>
                            Creada:{" "}
                            <span className="font-semibold">
                              {formatearFecha(tarea.fecha_creacion)}
                            </span>
                          </span>
                          <span className={tema.colores.textoSecundario}>
                            Límite:{" "}
                            <span className="font-semibold">
                              {formatearFecha(tarea.fecha_limite)}
                            </span>
                          </span>
                        </div>
                      </td>

                      {/* Tags */}
                      <td className="py-3 px-3 align-top hidden xl:table-cell">
                        <div className="flex flex-wrap gap-1">
                          {tarea.tags?.slice(0, 3).map((tag) => (
                            <span
                              key={tag}
                              className="px-2 py-0.5 rounded-full text-[10px] bg-white/5 border border-white/10"
                            >
                              #{tag}
                            </span>
                          ))}
                          {tarea.tags && tarea.tags.length > 3 && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] bg-white/5 border border-white/10">
                              +{tarea.tags.length - 3}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Acciones */}
                      <td className="py-3 px-3 align-top text-right relative">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => irADetalle(tarea)}
                            className={`hidden md:inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-[11px] font-semibold ${tema.colores.secundario} ${tema.colores.texto} hover:scale-105 transition-all`}
                          >
                            <Eye className="w-3 h-3" />
                            Ver
                          </button>
                          <button
                            onClick={() =>
                              setTareaMenuAbierta((prev) =>
                                prev === tarea.id_tarea ? null : tarea.id_tarea
                              )
                            }
                            className={`p-2 rounded-xl ${tema.colores.secundario} ${tema.colores.texto} hover:scale-105 transition-all`}
                          >
                            <MoreVertical className="w-4 h-4" />
                          </button>
                        </div>

                        {tareaMenuAbierta === tarea.id_tarea && (
                          <>
                            <div
                              className="fixed inset-0 z-10"
                              onClick={() => setTareaMenuAbierta(null)}
                            />
                            <div
                              className={`absolute right-3 mt-2 w-56 rounded-2xl ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} z-20`}
                            >
                              <div className="py-2">
                                <button
                                  onClick={() => irADetalle(tarea)}
                                  className={`w-full flex items-center gap-2 px-4 py-2 text-xs ${tema.colores.hover} text-left ${tema.colores.texto}`}
                                >
                                  <Eye className="w-4 h-4" />
                                  Ver detalle
                                </button>
                                <button
                                  onClick={() => irAEditar(tarea)}
                                  disabled={!tarea.puede_editar}
                                  className={`w-full flex items-center gap-2 px-4 py-2 text-xs ${tema.colores.hover} text-left ${tema.colores.texto} disabled:opacity-40 disabled:cursor-not-allowed`}
                                >
                                  <Edit className="w-4 h-4" />
                                  Editar
                                </button>
                                <button
                                  onClick={() => irAHistorial(tarea)}
                                  className={`w-full flex items-center gap-2 px-4 py-2 text-xs ${tema.colores.hover} text-left ${tema.colores.texto}`}
                                >
                                  <Clock className="w-4 h-4" />
                                  Ver historial
                                </button>
                              </div>
                              <div
                                className={`border-t ${tema.colores.borde} py-2`}
                              >
                                <p className="px-4 mb-1 text-[10px] uppercase tracking-wide text-gray-400">
                                  Cambiar estado
                                </p>
                                <div className="flex flex-wrap gap-1 px-2 pb-2">
                                  {(
                                    [
                                      "pendiente",
                                      "en_progreso",
                                      "en_revision",
                                      "completada",
                                    ] as TareaEstado[]
                                  ).map((estado) => (
                                    <button
                                      key={estado}
                                      disabled={
                                        !tarea.puede_cambiar_estado ||
                                        cambiandoEstadoId === tarea.id_tarea
                                      }
                                      onClick={() =>
                                        cambiarEstadoTarea(tarea, estado)
                                      }
                                      className={`px-2 py-1 rounded-full text-[10px] border ${obtenerColorEstado(
                                        estado
                                      )} disabled:opacity-40 disabled:cursor-not-allowed hover:scale-105 transition-all`}
                                    >
                                      {estado.replace("_", " ")}
                                    </button>
                                  ))}
                                </div>
                              </div>
                              <div
                                className={`border-t ${tema.colores.borde} py-2`}
                              >
                                <button
                                  onClick={() => confirmarEliminarTarea(tarea)}
                                  disabled={!tarea.puede_eliminar}
                                  className="w-full flex items-center gap-2 px-4 py-2 text-xs text-red-400 hover:bg-red-500/10 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                                >
                                  <Trash className="w-4 h-4" />
                                  Eliminar tarea
                                </button>
                              </div>
                            </div>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Modal eliminar */}
        {tareaAEliminar && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fadeIn">
            <div
              className={`w-full max-w-md rounded-2xl ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} p-6 animate-scaleIn`}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center">
                  <Trash className="w-5 h-5 text-red-400" />
                </div>
                <h3 className={`text-lg font-black ${tema.colores.texto}`}>
                  Eliminar tarea
                </h3>
              </div>
              <p className={`text-sm mb-4 ${tema.colores.textoSecundario}`}>
                ¿Estás seguro de que deseas eliminar la tarea{" "}
                <span className={`font-semibold ${tema.colores.texto}`}>
                  "{tareaAEliminar.titulo}"
                </span>
                ? Esta acción no se puede deshacer.
              </p>
              <div className="flex items-center justify-end gap-3">
                <button
                  onClick={() => setTareaAEliminar(null)}
                  disabled={eliminando}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold ${tema.colores.secundario} ${tema.colores.texto} hover:scale-105 transition-all disabled:opacity-50`}
                >
                  Cancelar
                </button>
                <button
                  onClick={eliminarTarea}
                  disabled={eliminando}
                  className="px-4 py-2 rounded-xl text-sm font-semibold bg-red-600 hover:bg-red-700 text-white flex items-center gap-2 disabled:opacity-50 hover:scale-105 transition-all"
                >
                  {eliminando && (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  )}
                  Eliminar definitivamente
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* FOOTER */}
      <footer
        className={`transition-all duration-300 ${
          sidebarAbierto ? "ml-72" : "ml-20"
        } ${tema.colores.card} ${tema.colores.borde} border-t py-6 mt-12`}
      >
        <div className="max-w-[1920px] mx-auto px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <p
              className={`text-sm font-semibold ${tema.colores.textoSecundario}`}
            >
              © 2025 AnyssaMed · Módulo de Tareas INFOGES (Secretaría).
            </p>
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r ${tema.colores.gradiente} text-white`}
            >
              v1.0.0 PREMIUM
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
            <button
              onClick={cerrarSesion}
              className="text-sm font-bold text-red-400 hover:text-red-300 transition-colors"
            >
              Cerrar Sesión
            </button>
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
