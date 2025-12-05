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
  ArrowLeft,
  History,
  Maximize2,
  Copy,
  ExternalLink,
  BookmarkPlus,
  Flag,
  Timer,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter, useParams } from "next/navigation";

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

interface Subtarea {
  id_subtarea: number;
  titulo: string;
  completada: boolean;
}

interface ComentarioTarea {
  id_comentario: number;
  contenido: string;
  fecha: string;
  autor: {
    id_usuario: number;
    nombre_completo: string;
    rol: string;
    foto_perfil_url?: string | null;
  };
  es_del_responsable?: boolean;
}

interface HistorialTarea {
  id_historial: number;
  fecha: string;
  accion: string;
  usuario: string;
  detalle?: string | null;
}

interface AdjuntoTarea {
  id_adjunto: number;
  nombre_archivo: string;
  tipo: string;
  url: string;
  fecha_subida: string;
}

interface TareaDetalle extends Tarea {
  descripcion_larga?: string | null;
  subtareas?: Subtarea[];
  comentarios?: ComentarioTarea[];
  historial?: HistorialTarea[];
  adjuntos?: AdjuntoTarea[];
  porcentaje_avance?: number;
  es_favorita?: boolean;
}

// ========================================
// CONFIGURACIÓN DE TEMAS PREMIUM
// ========================================

const TEMAS: Record<TemaColor, ConfiguracionTema> = {
  light: {
    nombre: "Claro Profesional",
    icono: Sun,
    colores: {
      fondo: "from-slate-50 via-blue-50/30 to-indigo-50/50",
      fondoSecundario: "bg-white",
      texto: "text-gray-900",
      textoSecundario: "text-gray-600",
      primario: "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700",
      secundario: "bg-gray-100 hover:bg-gray-200",
      acento: "text-indigo-600",
      borde: "border-gray-200/80",
      sombra: "shadow-2xl shadow-indigo-500/10",
      gradiente: "from-indigo-500 via-purple-500 to-pink-500",
      sidebar: "bg-white/98 backdrop-blur-2xl border-gray-200/80",
      header: "bg-white/95 backdrop-blur-2xl border-gray-200/80",
      card: "bg-white/95 backdrop-blur-sm border-gray-200/80 hover:border-indigo-300/60",
      hover: "hover:bg-gray-50/80",
    },
  },
  dark: {
    nombre: "Oscuro Elite",
    icono: Moon,
    colores: {
      fondo: "from-slate-950 via-indigo-950/50 to-purple-950/30",
      fondoSecundario: "bg-gray-900/95",
      texto: "text-white",
      textoSecundario: "text-gray-400",
      primario: "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500",
      secundario: "bg-gray-800/80 hover:bg-gray-700/80",
      acento: "text-indigo-400",
      borde: "border-gray-800/60",
      sombra: "shadow-2xl shadow-indigo-500/20",
      gradiente: "from-indigo-500 via-purple-500 to-pink-500",
      sidebar: "bg-gray-900/98 backdrop-blur-2xl border-gray-800/60",
      header: "bg-gray-900/95 backdrop-blur-2xl border-gray-800/60",
      card: "bg-gray-800/60 backdrop-blur-sm border-gray-700/60 hover:border-indigo-500/50",
      hover: "hover:bg-gray-800/80",
    },
  },
  blue: {
    nombre: "Azul Océano Premium",
    icono: Wifi,
    colores: {
      fondo: "from-blue-950 via-cyan-950/50 to-teal-950/30",
      fondoSecundario: "bg-blue-900/95",
      texto: "text-white",
      textoSecundario: "text-cyan-300",
      primario: "bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500",
      secundario: "bg-blue-800/80 hover:bg-blue-700/80",
      acento: "text-cyan-400",
      borde: "border-cyan-800/60",
      sombra: "shadow-2xl shadow-cyan-500/20",
      gradiente: "from-cyan-500 via-blue-500 to-indigo-500",
      sidebar: "bg-blue-900/98 backdrop-blur-2xl border-cyan-800/60",
      header: "bg-blue-900/95 backdrop-blur-2xl border-cyan-800/60",
      card: "bg-blue-800/60 backdrop-blur-sm border-cyan-700/60 hover:border-cyan-500/50",
      hover: "hover:bg-blue-800/80",
    },
  },
  purple: {
    nombre: "Púrpura Real Luxury",
    icono: Sparkles,
    colores: {
      fondo: "from-purple-950 via-fuchsia-950/50 to-pink-950/30",
      fondoSecundario: "bg-purple-900/95",
      texto: "text-white",
      textoSecundario: "text-purple-300",
      primario: "bg-gradient-to-r from-fuchsia-600 to-purple-600 hover:from-fuchsia-500 hover:to-purple-500",
      secundario: "bg-purple-800/80 hover:bg-purple-700/80",
      acento: "text-fuchsia-400",
      borde: "border-purple-800/60",
      sombra: "shadow-2xl shadow-fuchsia-500/20",
      gradiente: "from-fuchsia-500 via-purple-500 to-pink-500",
      sidebar: "bg-purple-900/98 backdrop-blur-2xl border-purple-800/60",
      header: "bg-purple-900/95 backdrop-blur-2xl border-purple-800/60",
      card: "bg-purple-800/60 backdrop-blur-sm border-purple-700/60 hover:border-fuchsia-500/50",
      hover: "hover:bg-purple-800/80",
    },
  },
  green: {
    nombre: "Verde Médico Pro",
    icono: HeartPulse,
    colores: {
      fondo: "from-emerald-950 via-teal-950/50 to-cyan-950/30",
      fondoSecundario: "bg-emerald-900/95",
      texto: "text-white",
      textoSecundario: "text-emerald-300",
      primario: "bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500",
      secundario: "bg-teal-800/80 hover:bg-teal-700/80",
      acento: "text-emerald-400",
      borde: "border-emerald-800/60",
      sombra: "shadow-2xl shadow-emerald-500/20",
      gradiente: "from-emerald-500 via-teal-500 to-cyan-500",
      sidebar: "bg-emerald-900/98 backdrop-blur-2xl border-emerald-800/60",
      header: "bg-emerald-900/95 backdrop-blur-2xl border-emerald-800/60",
      card: "bg-emerald-800/60 backdrop-blur-sm border-emerald-700/60 hover:border-emerald-500/50",
      hover: "hover:bg-emerald-800/80",
    },
  },
};

// ========================================
// COMPONENTE PRINCIPAL (DETALLE TAREA PREMIUM)
// ========================================

const roleParam = "tecnico";
const roleLabel = "Técnico";

export default function DetalleTareaTecnicoPage() {
  const pathname = usePathname();
  const router = useRouter();
  const params = useParams<{ id: string }>();

  const idTarea = useMemo(() => {
    if (!params?.id) return null;
    const n = Number(params.id);
    return Number.isFinite(n) && n > 0 ? n : null;
  }, [params]);

  // Usuario y tema
  const [usuario, setUsuario] = useState<UsuarioSesion | null>(null);
  const [temaActual, setTemaActual] = useState<TemaColor>("dark");

  // Loading
  const [loadingUsuario, setLoadingUsuario] = useState(true);
  const [loadingTarea, setLoadingTarea] = useState(true);
  const [loadingEstadisticas, setLoadingEstadisticas] = useState(true);

  // Datos tarea
  const [tarea, setTarea] = useState<TareaDetalle | null>(null);
  const [estadisticas, setEstadisticas] = useState<EstadisticasTareas | null>(
    null
  );
  const [comentarios, setComentarios] = useState<ComentarioTarea[]>([]);
  const [historial, setHistorial] = useState<HistorialTarea[]>([]);
  const [adjuntos, setAdjuntos] = useState<AdjuntoTarea[]>([]);

  // Notificaciones
  const [notificaciones, setNotificaciones] = useState<NotificacionSistema[]>(
    []
  );

  // UI
  const [sidebarAbierto, setSidebarAbierto] = useState(true);
  const [notificacionesAbiertas, setNotificacionesAbiertas] = useState(false);
  const [perfilAbierto, setPerfilAbierto] = useState(false);
  const [vistaExpandida, setVistaExpandida] = useState(false);

  // Acciones UI
  const [nuevoComentario, setNuevoComentario] = useState("");
  const [guardandoComentario, setGuardandoComentario] = useState(false);
  const [cambiandoEstado, setCambiandoEstado] = useState(false);
  const [cambiandoPrioridad, setCambiandoPrioridad] = useState(false);
  const [eliminando, setEliminando] = useState(false);
  const [modalEliminarAbierto, setModalEliminarAbierto] = useState(false);
  const [copiado, setCopiado] = useState(false);

  const tema = useMemo(() => TEMAS[temaActual], [temaActual]);

  // Progreso de subtareas
  const progresoTarea = useMemo(() => {
    if (!tarea?.subtareas || tarea.subtareas.length === 0) return null;
    const total = tarea.subtareas.length;
    const completadas = tarea.subtareas.filter((s) => s.completada).length;
    const porcentaje = Math.round((completadas / total) * 100);
    return { total, completadas, porcentaje };
  }, [tarea]);

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
    if (pathname.startsWith("/tecnico/recordatorios"))
      return "recordatorios";
    if (pathname.startsWith("/tecnico/documentos")) return "documentos";
    if (pathname.startsWith("/tecnico/mensajes")) return "mensajes";
    if (pathname.startsWith("/tecnico/telemedicina")) return "telemedicina";
    if (pathname.startsWith("/tecnico/reportes")) return "reportes";
    if (pathname.startsWith("/tecnico/perfil")) return "perfil";
    if (pathname.startsWith("/tecnico/configuracion"))
      return "configuracion";
    return "";
  }, [pathname]);

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

  // Cargar tarea + estadísticas + comentarios
  const recargarTodo = async () => {
    if (!usuario || !idTarea) return;

    try {
      setLoadingTarea(true);
      setLoadingEstadisticas(true);

      const [resT, resE, resC] = await Promise.all([
        fetch(`/api/tareas/${idTarea}?rol=${roleParam}`, {
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
        fetch(`/api/tareas/${idTarea}/comentarios`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        }),
      ]);

      const dataT = await resT.json().catch(() => ({}));
      const dataE = await resE.json().catch(() => ({}));
      const dataC = await resC.json().catch(() => ({}));

      if (resT.ok && dataT.success && dataT.tarea) {
        const t = dataT.tarea as TareaDetalle;
        setTarea(t);

        setHistorial(
          (dataT.historial || t.historial || []) as HistorialTarea[]
        );
        setAdjuntos((dataT.adjuntos || t.adjuntos || []) as AdjuntoTarea[]);

        if (Array.isArray(dataT.notificaciones)) {
          setNotificaciones(dataT.notificaciones as NotificacionSistema[]);
        }
      } else {
        setTarea(null);
      }

      if (resE.ok && dataE.success) {
        setEstadisticas(dataE.estadisticas as EstadisticasTareas);
      }

      if (resC.ok && dataC.success && Array.isArray(dataC.comentarios)) {
        setComentarios(dataC.comentarios as ComentarioTarea[]);
      } else if (resT.ok && dataT.success) {
        const t = dataT.tarea as TareaDetalle;
        setComentarios(
          (dataT.comentarios || t.comentarios || []) as ComentarioTarea[]
        );
      } else {
        setComentarios([]);
      }
    } catch (error) {
      console.error(
        "Error al cargar detalle de tarea/estadísticas/comentarios:",
        error
      );
    } finally {
      setLoadingTarea(false);
      setLoadingEstadisticas(false);
    }
  };

  useEffect(() => {
    if (!usuario || !idTarea) return;
    recargarTodo();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [usuario, idTarea]);

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

  const formatearFechaHora = (fecha: any) => {
    if (!fecha) return "Sin fecha";

    const d = new Date(fecha);

    if (isNaN(d.getTime())) return "Fecha inválida";

    return new Intl.DateTimeFormat("es-CL", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
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

  const marcarNotificacionLeida = (idNotificacion: number) => {
    setNotificaciones((prev) =>
      prev.map((n) =>
        n.id_notificacion === idNotificacion ? { ...n, leida: true } : n
      )
    );
  };

  const copiarEnlace = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    }
  };

  // ========================================
  // ACCIONES SOBRE TAREA (DETALLE)
  // ========================================

  const cambiarEstadoTarea = async (nuevoEstado: TareaEstado) => {
    if (!tarea) return;
    try {
      setCambiandoEstado(true);
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

      setTarea((prev) => (prev ? { ...prev, estado: nuevoEstado } : prev));
      await recargarTodo();
    } catch (error) {
      console.error("Error al cambiar estado de tarea:", error);
    } finally {
      setCambiandoEstado(false);
    }
  };

  const cambiarPrioridad = async (nuevaPrioridad: TareaPrioridad) => {
    if (!tarea) return;
    try {
      setCambiandoPrioridad(true);
      const res = await fetch(`/api/tareas/${tarea.id_tarea}/prioridad`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ prioridad: nuevaPrioridad }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.success) {
        alert("No se pudo cambiar la prioridad de la tarea");
        return;
      }

      setTarea((prev) =>
        prev ? { ...prev, prioridad: nuevaPrioridad } : prev
      );
    } catch (error) {
      console.error("Error al cambiar prioridad de tarea:", error);
    } finally {
      setCambiandoPrioridad(false);
    }
  };

  const toggleFavorita = async () => {
    if (!tarea) return;
    try {
      const nuevoEstado = !tarea.es_favorita;
      const res = await fetch(`/api/tareas/${tarea.id_tarea}/favorita`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ es_favorita: nuevoEstado }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.success) {
        console.error("No se pudo cambiar favorito, se revierte sólo en UI");
      }

      setTarea((prev) =>
        prev ? { ...prev, es_favorita: nuevoEstado } : prev
      );
    } catch (error) {
      console.error("Error al marcar tarea como favorita:", error);
    }
  };

  const marcarSubtarea = async (subtarea: Subtarea, completada: boolean) => {
    if (!tarea) return;
    try {
      const res = await fetch(
        `/api/tareas/${tarea.id_tarea}/subtareas/${subtarea.id_subtarea}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ completada }),
        }
      );

      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.success) {
        alert("No se pudo actualizar la subtarea");
        return;
      }

      setTarea((prev) =>
        prev
          ? {
              ...prev,
              subtareas: prev.subtareas?.map((s) =>
                s.id_subtarea === subtarea.id_subtarea
                  ? { ...s, completada }
                  : s
              ),
            }
          : prev
      );
    } catch (error) {
      console.error("Error al actualizar subtarea:", error);
    }
  };

  const agregarComentario = async () => {
    if (!tarea || !nuevoComentario.trim()) return;

    try {
      setGuardandoComentario(true);
      const res = await fetch(`/api/tareas/${tarea.id_tarea}/comentarios`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ contenido: nuevoComentario.trim() }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.success) {
        alert("No se pudo agregar el comentario");
        return;
      }

      if (data.comentario) {
        setComentarios((prev) => [data.comentario as ComentarioTarea, ...prev]);
      } else {
        await recargarTodo();
      }

      setNuevoComentario("");
    } catch (error) {
      console.error("Error al agregar comentario:", error);
    } finally {
      setGuardandoComentario(false);
    }
  };

  const eliminarTarea = async () => {
    if (!tarea) return;

    try {
      setEliminando(true);
      const res = await fetch(`/api/tareas/${tarea.id_tarea}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.success) {
        alert("No se pudo eliminar la tarea");
        return;
      }

      setModalEliminarAbierto(false);
      router.push("/tecnico/tareas");
    } catch (error) {
      console.error("Error al eliminar tarea:", error);
    } finally {
      setEliminando(false);
    }
  };

  const irAEditar = () => {
    if (!tarea) return;
    router.push(`/tecnico/tareas/${tarea.id_tarea}/editar`);
  };

  const irAHistorial = () => {
    if (!tarea) return;
    router.push(`/tecnico/tareas/${tarea.id_tarea}/historial`);
  };

  // ========================================
  // RENDER LOADING / ACCESO
  // ========================================

  if (loadingUsuario || (loadingTarea && !tarea)) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center bg-gradient-to-br ${tema.colores.fondo}`}
      >
        <div className="text-center relative">
          <div className="relative mb-8">
            <div className="w-40 h-40 border-4 border-indigo-400/30 border-t-indigo-600 rounded-full animate-spin" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 border-4 border-purple-400/30 border-t-purple-600 rounded-full animate-spin-reverse" />
            <div
              className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 bg-gradient-to-br ${tema.colores.gradiente} rounded-full flex items-center justify-center animate-pulse shadow-2xl`}
            >
              <CheckSquare2 className="w-12 h-12 text-white animate-bounce" />
            </div>
          </div>
          <h2
            className={`text-5xl font-black mb-4 ${tema.colores.texto} bg-clip-text text-transparent bg-gradient-to-r ${tema.colores.gradiente}`}
          >
            Cargando Detalle Premium
          </h2>
          <p
            className={`text-xl font-bold ${tema.colores.textoSecundario} animate-pulse flex items-center justify-center gap-2`}
          >
            <Sparkles className="w-5 h-5 animate-spin" />
            Preparando vista avanzada de gestión
            <Sparkles className="w-5 h-5 animate-spin" />
          </p>
          <div className="mt-8 flex items-center justify-center gap-2">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className={`w-3 h-3 rounded-full bg-gradient-to-r ${tema.colores.gradiente} animate-bounce`}
                style={{ animationDelay: `${i * 0.2}s` }}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!usuario) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center bg-gradient-to-br ${tema.colores.fondo} p-4`}
      >
        <div
          className={`text-center max-w-md mx-auto p-10 rounded-3xl ${tema.colores.card} ${tema.colores.sombra} ${tema.colores.borde} border-2 backdrop-blur-xl`}
        >
          <div
            className={`w-28 h-28 bg-gradient-to-br ${tema.colores.gradiente} rounded-3xl flex items-center justify-center mx-auto mb-6 animate-pulse shadow-2xl`}
          >
            <AlertCircle className="w-14 h-14 text-white" />
          </div>
          <h2
            className={`text-4xl font-black mb-4 ${tema.colores.texto} bg-clip-text text-transparent bg-gradient-to-r ${tema.colores.gradiente}`}
          >
            Acceso Restringido
          </h2>
          <p className={`text-lg mb-8 ${tema.colores.textoSecundario}`}>
            Necesitas autenticación para acceder al módulo premium de gestión
            de tareas.
          </p>
          <Link
            href="/login"
            className={`inline-flex items-center gap-3 px-10 py-5 ${tema.colores.primario} text-white rounded-2xl font-black text-lg transition-all duration-300 hover:scale-110 ${tema.colores.sombra}`}
          >
            <LogOut className="w-6 h-6" />
            Iniciar Sesión
          </Link>
        </div>
      </div>
    );
  }

  // ========================================
  // RENDER PRINCIPAL PREMIUM
  // ========================================

  return (
    <div
      className={`min-h-screen transition-all duration-700 bg-gradient-to-br ${tema.colores.fondo} relative overflow-hidden`}
    >
      {/* Efectos de fondo animados */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div
          className={`absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-br ${tema.colores.gradiente} opacity-10 rounded-full blur-3xl animate-float`}
        />
        <div
          className={`absolute bottom-0 left-0 w-[500px] h-[500px] bg-gradient-to-tr ${tema.colores.gradiente} opacity-10 rounded-full blur-3xl animate-float-delayed`}
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

      {/* HEADER PREMIUM */}
      <header
        className={`fixed top-0 right-0 z-40 transition-all duration-300 ${
          sidebarAbierto ? "left-72" : "left-20"
        } ${tema.colores.header} ${tema.colores.borde} border-b-2 ${
          tema.colores.sombra
        }`}
      >
        <div className="flex items-center justify-between px-8 py-5">
          <div className="flex-1 max-w-2xl">
            <div className="relative group">
              <Search
                className={`absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 ${tema.colores.textoSecundario} group-hover:scale-110 transition-transform`}
              />
              <input
                type="text"
                placeholder="Buscar tareas con IA (CTRL+K para búsqueda rápida)"
                className={`w-full pl-14 pr-5 py-4 rounded-2xl ${tema.colores.card} ${tema.colores.borde} border-2 ${tema.colores.texto} placeholder:${tema.colores.textoSecundario} focus:outline-none focus:ring-4 focus:ring-indigo-500/30 transition-all duration-300 hover:border-indigo-400/50`}
                readOnly
                onClick={() => router.push("/tecnico/tareas")}
              />
              <kbd
                className={`absolute right-5 top-1/2 -translate-y-1/2 px-3 py-1 rounded-lg text-xs font-bold ${tema.colores.secundario} ${tema.colores.texto} border ${tema.colores.borde}`}
              >
                CTRL+K
              </kbd>
            </div>
          </div>

          <div className="flex items-center gap-4 ml-6">
            {/* Selector de temas premium */}
            <div className="relative group">
              <button
                className={`p-4 rounded-2xl font-bold transition-all duration-300 ${tema.colores.secundario} ${tema.colores.texto} hover:scale-110 ${tema.colores.sombra}`}
              >
                <Sparkles className="w-6 h-6" />
              </button>
              <div
                className={`absolute right-0 mt-3 w-72 rounded-2xl ${tema.colores.card} ${tema.colores.borde} border-2 ${tema.colores.sombra} opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 p-5 space-y-3 backdrop-blur-xl`}
              >
                <div className="flex items-center justify-between mb-4">
                  <p
                    className={`text-sm font-black ${tema.colores.texto} flex items-center gap-2`}
                  >
                    <Sparkles className="w-4 h-4" />
                    Temas Premium
                  </p>
                  <span
                    className={`text-xs px-2 py-1 rounded-full bg-gradient-to-r ${tema.colores.gradiente} text-white font-bold`}
                  >
                    PRO
                  </span>
                </div>
                {Object.entries(TEMAS).map(([key, t]) => (
                  <button
                    key={key}
                    onClick={() => cambiarTema(key as TemaColor)}
                    className={`w-full flex items-center justify-between gap-3 px-5 py-4 rounded-xl font-bold transition-all duration-300 ${
                      temaActual === key
                        ? `bg-gradient-to-r ${t.colores.gradiente} text-white shadow-xl scale-105`
                        : `${tema.colores.hover} ${tema.colores.texto} hover:scale-105`
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <t.icono className="w-5 h-5" />
                      <span>{t.nombre}</span>
                    </div>
                    {temaActual === key && (
                      <CheckCircle2 className="w-5 h-5 animate-pulse" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Notificaciones premium */}
            <div className="relative">
              <button
                onClick={() => setNotificacionesAbiertas((v) => !v)}
                className={`relative p-4 rounded-2xl font-bold transition-all duration-300 ${tema.colores.secundario} ${tema.colores.texto} hover:scale-110 ${tema.colores.sombra}`}
              >
                <Bell className="w-6 h-6" />
                {notificaciones.filter((n) => !n.leida).length > 0 && (
                  <span className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-black rounded-full flex items-center justify-center animate-bounce shadow-lg">
                    {notificaciones.filter((n) => !n.leida).length > 9
                      ? "9+"
                      : notificaciones.filter((n) => !n.leida).length}
                  </span>
                )}
              </button>
              {notificacionesAbiertas && (
                <div
                  className={`absolute right-0 mt-3 w-[420px] rounded-2xl ${tema.colores.card} ${tema.colores.borde} border-2 ${tema.colores.sombra} max-h-[500px] overflow-y-auto custom-scrollbar backdrop-blur-xl animate-slideDown`}
                >
                  <div
                    className={`p-5 border-b-2 ${tema.colores.borde} sticky top-0 ${tema.colores.card} backdrop-blur-xl z-10`}
                  >
                    <div className="flex items-center justify-between">
                      <h3
                        className={`text-xl font-black ${tema.colores.texto} flex items-center gap-2`}
                      >
                        <Bell className="w-5 h-5" />
                        Notificaciones
                      </h3>
                      <button
                        className={`text-sm font-bold ${tema.colores.acento} hover:underline flex items-center gap-1`}
                        onClick={() =>
                          setNotificaciones((prev) =>
                            prev.map((n) => ({ ...n, leida: true }))
                          )
                        }
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        Marcar todas
                      </button>
                    </div>
                  </div>

                  {notificaciones.length === 0 ? (
                    <div className="p-10 text-center">
                      <BellOff
                        className={`w-16 h-16 mx-auto mb-4 ${tema.colores.textoSecundario} opacity-50`}
                      />
                      <p
                        className={`text-base font-bold ${tema.colores.textoSecundario}`}
                      >
                        No hay notificaciones
                      </p>
                      <p className={`text-sm ${tema.colores.textoSecundario}`}>
                        Estás al día con todo
                      </p>
                    </div>
                  ) : (
                    <div className={`divide-y-2 ${tema.colores.borde}`}>
                      {notificaciones.map((notif) => (
                        <div
                          key={notif.id_notificacion}
                          className={`p-5 ${tema.colores.hover} cursor-pointer transition-all hover:scale-[1.02] ${
                            !notif.leida
                              ? "bg-indigo-500/10 border-l-4 border-indigo-500"
                              : ""
                          }`}
                          onClick={() =>
                            marcarNotificacionLeida(notif.id_notificacion)
                          }
                        >
                          <div className="flex items-start gap-4">
                            <div
                              className={`w-3 h-3 rounded-full mt-2 ${
                                !notif.leida
                                  ? "bg-indigo-500 animate-pulse"
                                  : "bg-gray-500"
                              }`}
                            />
                            <div className="flex-1">
                              <p
                                className={`text-base font-black mb-2 ${tema.colores.texto}`}
                              >
                                {notif.titulo}
                              </p>
                              <p
                                className={`text-sm mb-3 ${tema.colores.textoSecundario}`}
                              >
                                {notif.descripcion}
                              </p>
                              <p
                                className={`text-xs font-bold ${tema.colores.textoSecundario} flex items-center gap-2`}
                              >
                                <Clock className="w-3 h-3" />
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

            {/* Perfil premium */}
            <div className="relative">
              <button
                onClick={() => setPerfilAbierto((v) => !v)}
                className={`flex items-center gap-4 px-5 py-3 rounded-2xl transition-all duration-300 ${tema.colores.hover} hover:scale-105 ${tema.colores.sombra}`}
              >
                <div className="text-right hidden md:block">
                  <p className={`text-base font-black ${tema.colores.texto}`}>
                    {usuario.nombre} {usuario.apellido_paterno}
                  </p>
                  <p
                    className={`text-xs font-bold ${tema.colores.textoSecundario}`}
                  >
                    {roleLabel} · Premium
                  </p>
                </div>
                <div
                  className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${tema.colores.gradiente} flex items-center justify-center text-white font-black shadow-xl ring-4 ring-white/10`}
                >
                  {usuario.foto_perfil_url ? (
                    <Image
                      src={usuario.foto_perfil_url}
                      alt={usuario.nombre}
                      width={48}
                      height={48}
                      className="rounded-2xl object-cover"
                    />
                  ) : (
                    `${usuario.nombre[0]}${usuario.apellido_paterno[0]}`
                  )}
                </div>
                <ChevronDown
                  className={`w-5 h-5 ${tema.colores.texto} transition-transform duration-300 ${
                    perfilAbierto ? "rotate-180" : ""
                  }`}
                />
              </button>
              {perfilAbierto && (
                <div
                  className={`absolute right-0 mt-3 w-96 rounded-2xl ${tema.colores.card} ${tema.colores.borde} border-2 ${tema.colores.sombra} p-6 backdrop-blur-xl animate-slideDown`}
                >
                  <div className="flex items-center gap-5 mb-6 pb-6 border-b-2 border-gray-700/40">
                    <div
                      className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${tema.colores.gradiente} flex items-center justify-center text-white font-black text-2xl shadow-2xl ring-4 ring-white/10`}
                    >
                      {usuario.foto_perfil_url ? (
                        <Image
                          src={usuario.foto_perfil_url}
                          alt={usuario.nombre}
                          width={80}
                          height={80}
                          className="rounded-2xl object-cover"
                        />
                      ) : (
                        `${usuario.nombre[0]}${usuario.apellido_paterno[0]}`
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p
                        className={`text-xl font-black ${tema.colores.texto} mb-1`}
                      >
                        {usuario.nombre} {usuario.apellido_paterno}
                      </p>
                      <p
                        className={`text-sm font-bold ${tema.colores.textoSecundario} mb-2 flex items-center gap-2`}
                      >
                        <Shield className="w-4 h-4" />
                        {roleLabel}
                      </p>
                      <p
                        className={`text-xs ${tema.colores.textoSecundario} truncate`}
                      >
                        {usuario.email}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Link
                      href={`/tecnico/perfil`}
                      className={`flex items-center gap-4 px-5 py-4 rounded-xl font-bold transition-all duration-300 ${tema.colores.hover} ${tema.colores.texto} hover:scale-105`}
                    >
                      <User className="w-5 h-5" />
                      <span>Mi Perfil</span>
                      <ChevronRight className="w-4 h-4 ml-auto" />
                    </Link>
                    <Link
                      href={`/tecnico/configuracion`}
                      className={`flex items-center gap-4 px-5 py-4 rounded-xl font-bold transition-all duration-300 ${tema.colores.hover} ${tema.colores.texto} hover:scale-105`}
                    >
                      <Settings className="w-5 h-5" />
                      <span>Configuración</span>
                      <ChevronRight className="w-4 h-4 ml-auto" />
                    </Link>
                    <button
                      onClick={cerrarSesion}
                      className={`w-full flex items-center gap-4 px-5 py-4 rounded-xl font-bold transition-all duration-300 bg-red-500/10 text-red-400 hover:bg-red-500/20 hover:scale-105`}
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

      {/* CONTENIDO PRINCIPAL PREMIUM */}
      <main
        className={`transition-all duration-300 ${
          sidebarAbierto ? "ml-72" : "ml-20"
        } pt-28 p-8 relative z-10`}
      >
        {/* Encabezado detalle premium */}
        <div className="mb-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <button
              onClick={() => router.push("/tecnico/tareas")}
              className={`inline-flex items-center gap-2 px-4 py-2 mb-4 rounded-full text-sm font-bold ${tema.colores.secundario} ${tema.colores.texto} ${tema.colores.sombra} hover:scale-110 transition-all`}
            >
              <ArrowLeft className="w-4 h-4" />
              Volver a tareas
            </button>
            <h2
              className={`text-4xl md:text-5xl font-black mb-2 ${tema.colores.texto} flex items-center gap-4 bg-clip-text text-transparent bg-gradient-to-r ${tema.colores.gradiente}`}
            >
              {obtenerSaludo()}, {usuario.nombre}
              <span className="animate-wave inline-block text-5xl">👋</span>
            </h2>
            <p
              className={`text-xl font-bold ${tema.colores.textoSecundario} flex items-center gap-2`}
            >
              <Sparkles className="w-5 h-5" />
              Vista Premium de Detalle de Tarea · Rol:{" "}
              <span className={tema.colores.acento}>{roleLabel}</span>
            </p>
            <p className={`text-base mt-2 ${tema.colores.textoSecundario}`}>
              {new Date().toLocaleDateString("es-CL", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={copiarEnlace}
              className={`flex items-center gap-2 px-5 py-4 rounded-xl font-bold text-sm ${tema.colores.secundario} ${tema.colores.texto} ${tema.colores.sombra} hover:scale-110 transition-all`}
            >
              {copiado ? (
                <>
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                  ¡Copiado!
                </>
              ) : (
                <>
                  <Copy className="w-5 h-5" />
                  Copiar enlace
                </>
              )}
            </button>
            <button
              onClick={recargarTodo}
              disabled={loadingTarea || loadingEstadisticas}
              className={`flex items-center gap-2 px-5 py-4 rounded-xl font-bold text-sm ${tema.colores.secundario} ${tema.colores.texto} ${tema.colores.sombra} hover:scale-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              <RefreshCw
                className={`w-5 h-5 ${
                  loadingTarea || loadingEstadisticas ? "animate-spin" : ""
                }`}
              />
              Actualizar
            </button>
            <button
              onClick={irAHistorial}
              disabled={!tarea}
              className={`flex items-center gap-2 px-5 py-4 rounded-xl font-bold text-sm ${tema.colores.secundario} ${tema.colores.texto} ${tema.colores.sombra} hover:scale-110 transition-all disabled:opacity-50`}
            >
              <History className="w-5 h-5" />
              Historial
            </button>
            <button
              onClick={irAEditar}
              disabled={!tarea || !tarea.puede_editar}
              className={`flex items-center gap-2 px-6 py-4 rounded-xl font-bold text-sm ${tema.colores.primario} text-white ${tema.colores.sombra} hover:scale-110 transition-all disabled:opacity-40`}
            >
              <Edit className="w-5 h-5" />
              Editar tarea
            </button>
          </div>
        </div>

        {/* Si no hay tarea */}
        {!loadingTarea && !tarea && (
          <div
            className={`rounded-3xl p-12 ${tema.colores.card} ${tema.colores.borde} border-2 ${tema.colores.sombra} mb-10 backdrop-blur-xl animate-slideUp`}
          >
            <div className="flex items-center gap-6 mb-6">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-red-500 to-pink-500 flex items-center justify-center shadow-2xl animate-pulse">
                <AlertTriangle className="w-10 h-10 text-white" />
              </div>
              <div>
                <h3
                  className={`text-3xl font-black ${tema.colores.texto} mb-2`}
                >
                  Tarea no encontrada
                </h3>
                <p className={`text-lg ${tema.colores.textoSecundario}`}>
                  No pudimos encontrar la tarea solicitada. Es posible que haya
                  sido eliminada o que el enlace no sea válido.
                </p>
              </div>
            </div>
            <button
              onClick={() => router.push("/tecnico/tareas")}
              className={`inline-flex items-center gap-3 px-8 py-4 rounded-2xl font-black text-base ${tema.colores.primario} text-white ${tema.colores.sombra} hover:scale-110 transition-all`}
            >
              <ArrowLeft className="w-5 h-5" />
              Volver al listado de tareas
            </button>
          </div>
        )}

        {/* Contenido cuando hay tarea */}
        {tarea && (
          <>
            {/* Hero + resumen premium */}
            <section className="grid grid-cols-1 xl:grid-cols-3 gap-8 mb-10">
              {/* Hero premium */}
              <div
                className={`xl:col-span-2 rounded-3xl p-8 ${tema.colores.card} ${tema.colores.borde} border-2 ${tema.colores.sombra} backdrop-blur-xl hover:scale-[1.01] transition-all duration-300 animate-slideUp`}
              >
                <div className="flex items-start justify-between gap-6">
                  <div className="flex-1 min-w-0 space-y-4">
                    <div className="flex items-center gap-3 flex-wrap">
                      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-indigo-500/20 to-purple-500/20 border-2 border-indigo-500/40 text-sm font-black uppercase tracking-wider backdrop-blur-sm">
                        <CheckSquare2 className="w-4 h-4" />
                        <span>Tarea #{tarea.id_tarea}</span>
                      </div>
                      {tarea.es_favorita && (
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-amber-500/20 to-yellow-500/20 border-2 border-amber-500/40 text-sm font-black text-amber-400 backdrop-blur-sm animate-pulse">
                          <Star className="w-4 h-4 fill-amber-400" />
                          Favorita
                        </div>
                      )}
                      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border-2 border-emerald-500/40 text-sm font-black text-emerald-400 backdrop-blur-sm">
                        <Zap className="w-4 h-4" />
                        Premium
                      </div>
                    </div>
                    <h3
                      className={`text-3xl md:text-4xl font-black ${tema.colores.texto} break-words leading-tight`}
                    >
                      {tarea.titulo}
                    </h3>
                    <p
                      className={`text-base md:text-lg ${tema.colores.textoSecundario} whitespace-pre-line leading-relaxed`}
                    >
                      {tarea.descripcion_larga || tarea.descripcion}
                    </p>
                  </div>

                  <div className="flex flex-col items-end gap-4">
                    <button
                      onClick={toggleFavorita}
                      className={`p-3 rounded-2xl border-2 ${tema.colores.borde} ${tema.colores.hover} ${tema.colores.sombra} transition-all hover:scale-125 hover:rotate-12`}
                    >
                      <Star
                        className={`w-6 h-6 ${
                          tarea.es_favorita
                            ? "text-amber-400 animate-pulse"
                            : tema.colores.textoSecundario
                        }`}
                        fill={tarea.es_favorita ? "currentColor" : "none"}
                      />
                    </button>

                    <div className="space-y-3">
                      <span
                        className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-black border-2 ${obtenerColorPrioridad(
                          tarea.prioridad
                        )} shadow-lg`}
                      >
                        <Flame className="w-4 h-4" />
                        {tarea.prioridad.toUpperCase()}
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {(
                          [
                            "critica",
                            "urgente",
                            "alta",
                            "media",
                            "baja",
                          ] as TareaPrioridad[]
                        ).map((p) => (
                          <button
                            key={p}
                            onClick={() => cambiarPrioridad(p)}
                            disabled={cambiandoPrioridad}
                            className={`px-3 py-1 rounded-lg text-xs font-bold border-2 ${
                              tarea.prioridad === p
                                ? obtenerColorPrioridad(p)
                                : "bg-black/10 text-gray-400 border-transparent hover:border-white/30"
                            } disabled:opacity-40 disabled:cursor-not-allowed transition-all hover:scale-110`}
                          >
                            {p}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex flex-wrap gap-4">
                  <div
                    className={`inline-flex items-center gap-3 text-sm px-5 py-3 rounded-xl bg-gradient-to-r from-black/10 to-black/5 border-2 ${tema.colores.borde} ${tema.colores.textoSecundario} backdrop-blur-sm`}
                  >
                    <Activity className="w-5 h-5" />
                    <span className="font-bold">Estado:</span>
                    <span
                      className={`font-black px-3 py-1 rounded-lg border-2 ${obtenerColorEstado(
                        tarea.estado
                      )} shadow-lg`}
                    >
                      {tarea.estado.replace("_", " ").toUpperCase()}
                    </span>
                  </div>

                  <div className="inline-flex items-center gap-3 text-sm px-5 py-3 rounded-xl bg-gradient-to-r from-black/10 to-black/5 border-2 border-white/10 backdrop-blur-sm">
                    <UserCheck className="w-5 h-5 text-emerald-400" />
                    <span className="font-bold">Responsable:</span>
                    <span className="font-black">
                      {tarea.responsable.nombre_completo}
                    </span>
                    <span className="text-xs opacity-70 px-2 py-1 rounded-full bg-black/20">
                      {tarea.responsable.rol}
                    </span>
                  </div>

                  <div className="inline-flex items-center gap-3 text-sm px-5 py-3 rounded-xl bg-gradient-to-r from-black/10 to-black/5 border-2 border-white/10 backdrop-blur-sm">
                    <User className="w-5 h-5 text-indigo-400" />
                    <span className="font-bold">Creador:</span>
                    <span className="font-black">
                      {tarea.creador.nombre_completo}
                    </span>
                  </div>

                  <div className="inline-flex items-center gap-3 text-sm px-5 py-3 rounded-xl bg-gradient-to-r from-black/10 to-black/5 border-2 border-white/10 backdrop-blur-sm">
                    <MapPin className="w-5 h-5 text-cyan-400" />
                    <span className="font-black">
                      {tarea.centro?.nombre || "Sin centro"}
                    </span>
                    {tarea.sucursal && (
                      <span className="text-xs opacity-70">
                        · {tarea.sucursal.nombre}
                      </span>
                    )}
                  </div>

                  <div className="inline-flex items-center gap-3 text-sm px-5 py-3 rounded-xl bg-gradient-to-r from-black/10 to-black/5 border-2 border-white/10 backdrop-blur-sm">
                    <Calendar className="w-5 h-5 text-purple-400" />
                    <span className="font-bold">Creada:</span>
                    <span className="font-black">
                      {formatearFecha(tarea.fecha_creacion)}
                    </span>
                    <span className="opacity-60">·</span>
                    <span className="font-bold">Límite:</span>
                    <span className="font-black">
                      {formatearFecha(tarea.fecha_limite)}
                    </span>
                  </div>
                </div>

                {tarea.tags && tarea.tags.length > 0 && (
                  <div className="mt-6 flex flex-wrap gap-2">
                    {tarea.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-4 py-2 rounded-xl text-sm font-bold bg-gradient-to-r from-indigo-500/20 to-purple-500/20 border-2 border-indigo-500/30 backdrop-blur-sm hover:scale-110 transition-all cursor-pointer"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Resumen rápido premium */}
              <div
                className={`rounded-3xl p-8 ${tema.colores.card} ${tema.colores.borde} border-2 ${tema.colores.sombra} backdrop-blur-xl hover:scale-[1.02] transition-all duration-300 animate-slideUp`}
                style={{ animationDelay: "0.1s" }}
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${tema.colores.gradiente} flex items-center justify-center shadow-2xl`}
                    >
                      <PieChart className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <h3
                        className={`text-xl font-black ${tema.colores.texto}`}
                      >
                        Resumen de impacto
                      </h3>
                      <p
                        className={`text-xs font-bold ${tema.colores.textoSecundario}`}
                      >
                        Análisis en tiempo real
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-2xl bg-gradient-to-r from-black/10 to-black/5 border-2 border-white/10 backdrop-blur-sm">
                    <span
                      className={`text-sm font-bold ${tema.colores.textoSecundario} flex items-center gap-2`}
                    >
                      <Activity className="w-4 h-4" />
                      Estado actual
                    </span>
                    <span
                      className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black border-2 ${obtenerColorEstado(
                        tarea.estado
                      )} shadow-lg`}
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
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-2xl bg-gradient-to-r from-black/10 to-black/5 border-2 border-white/10 backdrop-blur-sm">
                    <span
                      className={`text-sm font-bold ${tema.colores.textoSecundario} flex items-center gap-2`}
                    >
                      <Flame className="w-4 h-4" />
                      Prioridad
                    </span>
                    <span
                      className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black border-2 ${obtenerColorPrioridad(
                        tarea.prioridad
                      )} shadow-lg`}
                    >
                      <Flame className="w-4 h-4" />
                      {tarea.prioridad.toUpperCase()}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-2xl bg-gradient-to-r from-black/10 to-black/5 border-2 border-white/10 backdrop-blur-sm">
                    <span
                      className={`text-sm font-bold ${tema.colores.textoSecundario} flex items-center gap-2`}
                    >
                      <CalendarClock className="w-4 h-4" />
                      Vencimiento
                    </span>
                    <span
                      className={`inline-flex items-center gap-2 text-xs font-black px-4 py-2 rounded-xl bg-gradient-to-r from-purple-500/20 to-pink-500/20 border-2 border-purple-500/40`}
                    >
                      <CalendarClock className="w-4 h-4" />
                      {formatearFecha(tarea.fecha_limite)}
                    </span>
                  </div>

                  {progresoTarea && (
                    <div className="mt-6 p-5 rounded-2xl bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border-2 border-indigo-500/30 backdrop-blur-sm">
                      <div className="flex items-center justify-between mb-3">
                        <span
                          className={`text-sm font-bold ${tema.colores.textoSecundario} flex items-center gap-2`}
                        >
                          <Target className="w-4 h-4" />
                          Avance checklist
                        </span>
                        <span
                          className={`text-lg font-black ${tema.colores.texto}`}
                        >
                          {progresoTarea.completadas}/{progresoTarea.total} ·{" "}
                          {progresoTarea.porcentaje}%
                        </span>
                      </div>
                      <div className="w-full h-4 rounded-full bg-black/20 overflow-hidden border-2 border-white/10">
                        <div
                          className={`h-4 rounded-full bg-gradient-to-r ${tema.colores.gradiente} transition-all duration-1000 ease-out shadow-lg`}
                          style={{
                            width: `${progresoTarea.porcentaje}%`,
                          }}
                        />
                      </div>
                    </div>
                  )}

                  <div className="mt-6 grid grid-cols-2 gap-4 text-sm">
                    <div className="rounded-2xl bg-gradient-to-br from-red-500/10 to-pink-500/10 border-2 border-red-500/30 p-5 flex flex-col gap-2 backdrop-blur-sm hover:scale-105 transition-all">
                      <div className="flex items-center justify-between">
                        <span
                          className={`font-bold ${tema.colores.textoSecundario}`}
                        >
                          Criticidad
                        </span>
                        {obtenerIconoTendencia(estadisticas?.criticas ?? 0)}
                      </div>
                      <div
                        className={`text-3xl font-black ${tema.colores.texto}`}
                      >
                        {estadisticas?.criticas ?? 0}
                      </div>
                      <span className="text-xs opacity-70">
                        Tareas críticas activas
                      </span>
                    </div>

                    <div className="rounded-2xl bg-gradient-to-br from-orange-500/10 to-amber-500/10 border-2 border-orange-500/30 p-5 flex flex-col gap-2 backdrop-blur-sm hover:scale-105 transition-all">
                      <div className="flex items-center justify-between">
                        <span
                          className={`font-bold ${tema.colores.textoSecundario}`}
                        >
                          Vencidas
                        </span>
                        <AlertTriangle className="w-5 h-5 text-orange-400" />
                      </div>
                      <div
                        className={`text-3xl font-black ${tema.colores.texto}`}
                      >
                        {estadisticas?.vencidas ?? 0}
                      </div>
                      <span className="text-xs opacity-70">
                        Requieren atención urgente
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Zona principal: descripción, checklist, historial y comentarios PREMIUM */}
            <section className="grid grid-cols-1 xl:grid-cols-3 gap-8">
              {/* Columna izquierda (2/3) */}
              <div className="xl:col-span-2 space-y-8">
                {/* Descripción detallada premium */}
                <div
                  className={`rounded-3xl p-8 ${tema.colores.card} ${tema.colores.borde} border-2 ${tema.colores.sombra} backdrop-blur-xl hover:scale-[1.01] transition-all duration-300 animate-slideUp`}
                >
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${tema.colores.gradiente} flex items-center justify-center shadow-xl`}
                      >
                        <FileText className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3
                          className={`text-2xl font-black ${tema.colores.texto}`}
                        >
                          Detalle funcional de la tarea
                        </h3>
                        <p
                          className={`text-sm font-bold ${tema.colores.textoSecundario}`}
                        >
                          Contexto completo y especificaciones técnicas
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setVistaExpandida(!vistaExpandida)}
                      className={`p-3 rounded-xl ${tema.colores.secundario} ${tema.colores.texto} hover:scale-110 transition-all`}
                    >
                      <Maximize2 className="w-5 h-5" />
                    </button>
                  </div>

                  <div
                    className={`${
                      vistaExpandida ? "max-h-none" : "max-h-96"
                    } overflow-y-auto custom-scrollbar`}
                  >
                    <p
                      className={`text-base md:text-lg leading-relaxed ${tema.colores.textoSecundario} whitespace-pre-line`}
                    >
                      {tarea.descripcion_larga || tarea.descripcion}
                    </p>
                  </div>
                </div>

                {/* Checklist / subtareas premium */}
                {tarea.subtareas && tarea.subtareas.length > 0 && (
                  <div
                    className={`rounded-3xl p-8 ${tema.colores.card} ${tema.colores.borde} border-2 ${tema.colores.sombra} backdrop-blur-xl hover:scale-[1.01] transition-all duration-300 animate-slideUp`}
                    style={{ animationDelay: "0.1s" }}
                  >
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-4">
                        <div
                          className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${tema.colores.gradiente} flex items-center justify-center shadow-xl`}
                        >
                          <ClipboardCheck className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h3
                            className={`text-2xl font-black ${tema.colores.texto}`}
                          >
                            Checklist operativo
                          </h3>
                          <p
                            className={`text-sm font-bold ${tema.colores.textoSecundario}`}
                          >
                            Seguimiento paso a paso del progreso
                          </p>
                        </div>
                      </div>
                      {progresoTarea && (
                        <div className="text-right">
                          <span
                            className={`text-sm font-bold ${tema.colores.textoSecundario}`}
                          >
                            {progresoTarea.completadas}/{progresoTarea.total}{" "}
                            completados
                          </span>
                          <div
                            className={`text-2xl font-black ${tema.colores.texto}`}
                          >
                            {progresoTarea.porcentaje}%
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="space-y-3 max-h-96 overflow-y-auto custom-scrollbar pr-2">
                      {tarea.subtareas.map((s, index) => (
                        <button
                          key={s.id_subtarea}
                          onClick={() => marcarSubtarea(s, !s.completada)}
                          className={`w-full flex items-start gap-4 px-5 py-4 rounded-2xl text-left transition-all hover:scale-[1.02] ${
                            s.completada
                              ? "bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border-2 border-emerald-500/50 shadow-lg"
                              : "bg-gradient-to-r from-black/10 to-black/5 border-2 border-white/10 hover:border-indigo-400/60"
                          }`}
                          style={{ animationDelay: `${index * 0.05}s` }}
                        >
                          <div
                            className={`mt-1 w-7 h-7 rounded-xl border-2 flex items-center justify-center transition-all ${
                              s.completada
                                ? "bg-gradient-to-br from-emerald-500 to-teal-500 border-emerald-500 shadow-lg scale-110"
                                : "border-gray-500/50 hover:border-indigo-500"
                            }`}
                          >
                            {s.completada && (
                              <Check className="w-5 h-5 text-white font-bold" />
                            )}
                          </div>
                          <div className="flex-1">
                            <p
                              className={`text-base font-bold ${
                                s.completada
                                  ? "line-through opacity-70"
                                  : tema.colores.texto
                              }`}
                            >
                              {s.titulo}
                            </p>
                            {s.completada && (
                              <span className="text-xs text-emerald-400 font-bold mt-1 inline-flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3" />
                                Completado
                              </span>
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Historial premium */}
                <div
                  className={`rounded-3xl p-8 ${tema.colores.card} ${tema.colores.borde} border-2 ${tema.colores.sombra} backdrop-blur-xl hover:scale-[1.01] transition-all duration-300 animate-slideUp`}
                  style={{ animationDelay: "0.2s" }}
                >
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${tema.colores.gradiente} flex items-center justify-center shadow-xl`}
                      >
                        <History className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3
                          className={`text-2xl font-black ${tema.colores.texto}`}
                        >
                          Línea de tiempo de cambios
                        </h3>
                        <p
                          className={`text-sm font-bold ${tema.colores.textoSecundario}`}
                        >
                          Trazabilidad completa de modificaciones
                        </p>
                      </div>
                    </div>
                    <span
                      className={`px-4 py-2 rounded-xl text-sm font-bold bg-gradient-to-r from-indigo-500/20 to-purple-500/20 border-2 border-indigo-500/40`}
                    >
                      {historial.length} eventos
                    </span>
                  </div>

                  {historial.length === 0 ? (
                    <div className="text-center py-10">
                      <History
                        className={`w-16 h-16 mx-auto mb-4 ${tema.colores.textoSecundario} opacity-50`}
                      />
                      <p
                        className={`font-bold ${tema.colores.textoSecundario}`}
                      >
                        Aún no hay historial para esta tarea.
                      </p>
                    </div>
                  ) : (
                    <div className="relative pl-6 max-h-96 overflow-y-auto custom-scrollbar">
                      <div className="absolute left-2 top-0 bottom-0 w-1 bg-gradient-to-b from-indigo-500 via-purple-500 to-pink-500 rounded-full" />
                      <div className="space-y-6">
                        {historial.map((h, index) => (
                          <div
                            key={h.id_historial}
                            className="relative flex gap-4 animate-slideRight"
                            style={{ animationDelay: `${index * 0.05}s` }}
                          >
                            <div className="flex flex-col items-center">
                              <div className="w-5 h-5 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 border-4 border-white shadow-xl" />
                            </div>
                            <div className="flex-1 pb-6">
                              <div className="flex items-center justify-between mb-2">
                                <p
                                  className={`text-base font-black ${tema.colores.texto}`}
                                >
                                  {h.accion}
                                </p>
                                <span
                                  className={`text-xs font-bold ${tema.colores.textoSecundario} flex items-center gap-1`}
                                >
                                  <Clock className="w-3 h-3" />
                                  {formatearFechaHora(h.fecha)}
                                </span>
                              </div>
                              <p
                                className={`text-sm font-bold ${tema.colores.textoSecundario} flex items-center gap-2`}
                              >
                                <User className="w-4 h-4" />
                                {h.usuario}
                              </p>
                              {h.detalle && (
                                <p className="text-sm mt-2 text-gray-400 italic">
                                  {h.detalle}
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Comentarios premium */}
                <div
                  className={`rounded-3xl p-8 ${tema.colores.card} ${tema.colores.borde} border-2 ${tema.colores.sombra} backdrop-blur-xl hover:scale-[1.01] transition-all duration-300 animate-slideUp`}
                  style={{ animationDelay: "0.3s" }}
                >
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${tema.colores.gradiente} flex items-center justify-center shadow-xl`}
                      >
                        <MessageSquare className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3
                          className={`text-2xl font-black ${tema.colores.texto}`}
                        >
                          Conversación del equipo
                        </h3>
                        <p
                          className={`text-sm font-bold ${tema.colores.textoSecundario}`}
                        >
                          Colaboración en tiempo real
                        </p>
                      </div>
                    </div>
                    <span
                      className={`px-4 py-2 rounded-xl text-sm font-bold bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border-2 border-cyan-500/40`}
                    >
                      {comentarios.length} comentarios
                    </span>
                  </div>

                  {/* Nuevo comentario premium */}
                  <div className="mb-6">
                    <div
                      className={`rounded-2xl border-2 ${tema.colores.borde} ${tema.colores.card} p-5 flex gap-4 backdrop-blur-sm hover:border-indigo-400/60 transition-all`}
                    >
                      <div
                        className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${tema.colores.gradiente} flex items-center justify-center text-white font-black shadow-xl flex-shrink-0`}
                      >
                        {usuario.foto_perfil_url ? (
                          <Image
                            src={usuario.foto_perfil_url}
                            alt={usuario.nombre}
                            width={48}
                            height={48}
                            className="rounded-2xl object-cover"
                          />
                        ) : (
                          `${usuario.nombre[0]}${usuario.apellido_paterno[0]}`
                        )}
                      </div>
                      <div className="flex-1 flex flex-col gap-3">
                        <textarea
                          value={nuevoComentario}
                          onChange={(e) => setNuevoComentario(e.target.value)}
                          rows={3}
                          placeholder="Escribe un comentario para coordinar con tu equipo..."
                          className={`w-full text-base bg-transparent border-none outline-none resize-none ${tema.colores.texto} placeholder:${tema.colores.textoSecundario} font-medium`}
                        />
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3 text-sm text-gray-400">
                            <button className="hover:text-indigo-400 transition-colors">
                              <Paperclip className="w-5 h-5" />
                            </button>
                            <button className="hover:text-indigo-400 transition-colors">
                              <Mic className="w-5 h-5" />
                            </button>
                          </div>
                          <button
                            onClick={agregarComentario}
                            disabled={
                              guardandoComentario ||
                              !nuevoComentario.trim().length
                            }
                            className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-black ${tema.colores.primario} text-white ${tema.colores.sombra} hover:scale-110 transition-all disabled:opacity-40 disabled:cursor-not-allowed`}
                          >
                            {guardandoComentario ? (
                              <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Enviando...
                              </>
                            ) : (
                              <>
                                <Send className="w-4 h-4" />
                                Enviar comentario
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Lista de comentarios premium */}
                  {comentarios.length === 0 ? (
                    <div className="text-center py-10">
                      <MessageSquare
                        className={`w-16 h-16 mx-auto mb-4 ${tema.colores.textoSecundario} opacity-50`}
                      />
                      <p
                        className={`font-bold ${tema.colores.textoSecundario}`}
                      >
                        Aún no hay comentarios. Inicia la conversación con tu
                        equipo.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4 max-h-96 overflow-y-auto custom-scrollbar pr-2">
                      {comentarios.map((c, index) => {
                        const autor = c.autor || {
                          nombre_completo: "Usuario desconocido",
                          rol: "sin rol",
                          foto_perfil_url: null,
                        };

                        const iniciales = autor.nombre_completo
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .slice(0, 2);

                        return (
                          <div
                            key={c.id_comentario}
                            className="flex gap-4 rounded-2xl bg-gradient-to-r from-black/10 to-black/5 border-2 border-white/10 p-5 backdrop-blur-sm hover:scale-[1.01] hover:border-indigo-400/40 transition-all animate-slideUp"
                            style={{ animationDelay: `${index * 0.05}s` }}
                          >
                            {/* AVATAR premium */}
                            <div
                              className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${tema.colores.gradiente} flex items-center justify-center text-white text-sm font-black flex-shrink-0 shadow-xl`}
                            >
                              {autor.foto_perfil_url ? (
                                <Image
                                  src={autor.foto_perfil_url}
                                  alt={autor.nombre_completo}
                                  width={48}
                                  height={48}
                                  className="rounded-2xl object-cover"
                                />
                              ) : (
                                iniciales
                              )}
                            </div>

                            <div className="flex-1 min-w-0">
                              {/* Nombre y fecha */}
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-3">
                                  <p
                                    className={`text-base font-black ${tema.colores.texto}`}
                                  >
                                    {autor.nombre_completo}
                                  </p>

                                  <span
                                    className={`text-xs px-3 py-1 rounded-full bg-gradient-to-r from-indigo-500/20 to-purple-500/20 border border-indigo-500/40 font-bold ${tema.colores.textoSecundario}`}
                                  >
                                    {autor.rol}
                                    {c.es_del_responsable && " · Responsable"}
                                  </span>
                                </div>

                                <span
                                  className={`text-xs font-bold ${tema.colores.textoSecundario} flex items-center gap-1`}
                                >
                                  <Clock className="w-3 h-3" />
                                  {formatearFechaHora(c.fecha)}
                                </span>
                              </div>

                              {/* Contenido */}
                              <p
                                className={`text-base ${tema.colores.textoSecundario} leading-relaxed`}
                              >
                                {c.contenido}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* Columna derecha (metadatos y adjuntos) PREMIUM */}
              <div className="space-y-8">
                {/* Información de responsables premium */}
                <div
                  className={`rounded-3xl p-8 ${tema.colores.card} ${tema.colores.borde} border-2 ${tema.colores.sombra} backdrop-blur-xl hover:scale-[1.02] transition-all duration-300 animate-slideUp`}
                  style={{ animationDelay: "0.2s" }}
                >
                  <div className="flex items-center gap-4 mb-6">
                    <div
                      className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${tema.colores.gradiente} flex items-center justify-center shadow-xl`}
                    >
                      <Users className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3
                        className={`text-xl font-black ${tema.colores.texto}`}
                      >
                        Equipo asociado
                      </h3>
                      <p
                        className={`text-xs font-bold ${tema.colores.textoSecundario}`}
                      >
                        Personas clave en esta tarea
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4 text-base">
                    <div className="flex items-center gap-4 p-4 rounded-2xl bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border-2 border-emerald-500/30 backdrop-blur-sm">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg">
                        <UserCheck className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <p
                          className={`text-xs font-bold ${tema.colores.textoSecundario}`}
                        >
                          Responsable
                        </p>
                        <p className={`font-black ${tema.colores.texto}`}>
                          {tarea.responsable.nombre_completo}
                        </p>
                        <p
                          className={`text-xs font-bold ${tema.colores.textoSecundario}`}
                        >
                          {tarea.responsable.rol}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 p-4 rounded-2xl bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border-2 border-indigo-500/30 backdrop-blur-sm">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg">
                        <User className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <p
                          className={`text-xs font-bold ${tema.colores.textoSecundario}`}
                        >
                          Creador
                        </p>
                        <p className={`font-black ${tema.colores.texto}`}>
                          {tarea.creador.nombre_completo}
                        </p>
                        <p
                          className={`text-xs font-bold ${tema.colores.textoSecundario}`}
                        >
                          {tarea.creador.rol}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Centro y fechas premium */}
                <div
                  className={`rounded-3xl p-8 ${tema.colores.card} ${tema.colores.borde} border-2 ${tema.colores.sombra} backdrop-blur-xl hover:scale-[1.02] transition-all duration-300 animate-slideUp`}
                  style={{ animationDelay: "0.3s" }}
                >
                  <div className="flex items-center gap-4 mb-6">
                    <div
                      className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${tema.colores.gradiente} flex items-center justify-center shadow-xl`}
                    >
                      <MapPin className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3
                        className={`text-xl font-black ${tema.colores.texto}`}
                      >
                        Contexto asistencial
                      </h3>
                      <p
                        className={`text-xs font-bold ${tema.colores.textoSecundario}`}
                      >
                        Ubicación y temporalidad
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4 text-base">
                    <div className="p-4 rounded-2xl bg-gradient-to-r from-black/10 to-black/5 border-2 border-white/10 backdrop-blur-sm">
                      <p
                        className={`text-xs font-bold ${tema.colores.textoSecundario} mb-1`}
                      >
                        Centro de salud
                      </p>
                      <p
                        className={`text-base font-black ${tema.colores.texto}`}
                      >
                        {tarea.centro?.nombre || "Sin centro asignado"}
                      </p>
                    </div>
                    <div className="p-4 rounded-2xl bg-gradient-to-r from-black/10 to-black/5 border-2 border-white/10 backdrop-blur-sm">
                      <p
                        className={`text-xs font-bold ${tema.colores.textoSecundario} mb-1`}
                      >
                        Sucursal / dispositivo
                      </p>
                      <p
                        className={`text-base font-black ${tema.colores.texto}`}
                      >
                        {tarea.sucursal?.nombre || "Sin sucursal asignada"}
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="rounded-2xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-2 border-purple-500/30 p-4 backdrop-blur-sm">
                        <p
                          className={`text-xs font-bold ${tema.colores.textoSecundario} mb-1`}
                        >
                          Fecha creación
                        </p>
                        <p
                          className={`text-base font-black ${tema.colores.texto}`}
                        >
                          {formatearFecha(tarea.fecha_creacion)}
                        </p>
                      </div>
                      <div className="rounded-2xl bg-gradient-to-br from-orange-500/10 to-red-500/10 border-2 border-orange-500/30 p-4 backdrop-blur-sm">
                        <p
                          className={`text-xs font-bold ${tema.colores.textoSecundario} mb-1`}
                        >
                          Fecha límite
                        </p>
                        <p
                          className={`text-base font-black ${tema.colores.texto}`}
                        >
                          {formatearFecha(tarea.fecha_limite)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Adjuntos premium */}
                <div
                  className={`rounded-3xl p-8 ${tema.colores.card} ${tema.colores.borde} border-2 ${tema.colores.sombra} backdrop-blur-xl hover:scale-[1.02] transition-all duration-300 animate-slideUp`}
                  style={{ animationDelay: "0.4s" }}
                >
                  <div className="flex items-center gap-4 mb-6">
                    <div
                      className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${tema.colores.gradiente} flex items-center justify-center shadow-xl`}
                    >
                      <Paperclip className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3
                        className={`text-xl font-black ${tema.colores.texto}`}
                      >
                        Archivos adjuntos
                      </h3>
                      <p
                        className={`text-xs font-bold ${tema.colores.textoSecundario}`}
                      >
                        Documentación de respaldo
                      </p>
                    </div>
                  </div>

                  {adjuntos.length === 0 ? (
                    <div className="text-center py-8">
                      <Paperclip
                        className={`w-12 h-12 mx-auto mb-3 ${tema.colores.textoSecundario} opacity-50`}
                      />
                      <p
                        className={`text-sm font-bold ${tema.colores.textoSecundario}`}
                      >
                        No hay archivos adjuntos
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3 text-base max-h-64 overflow-y-auto custom-scrollbar">
                      {adjuntos.map((a, index) => (
                        <a
                          key={a.id_adjunto}
                          href={a.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-between gap-4 px-5 py-4 rounded-2xl bg-gradient-to-r from-black/10 to-black/5 border-2 border-white/10 hover:border-indigo-400/60 hover:scale-[1.02] transition-all animate-slideUp"
                          style={{ animationDelay: `${index * 0.05}s` }}
                        >
                          <div className="flex items-center gap-4 min-w-0">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg">
                              <FileText className="w-5 h-5 text-white" />
                            </div>
                            <div className="min-w-0">
                              <p
                                className={`text-sm font-black truncate ${tema.colores.texto}`}
                              >
                                {a.nombre_archivo}
                              </p>
                              <p
                                className={`text-xs font-bold ${tema.colores.textoSecundario}`}
                              >
                                {a.tipo} · {formatearFecha(a.fecha_subida)}
                              </p>
                            </div>
                          </div>
                          <Download className="w-5 h-5 text-indigo-400 flex-shrink-0" />
                        </a>
                      ))}
                    </div>
                  )}
                </div>

                {/* Acciones peligrosas premium */}
                <div
                  className={`rounded-3xl p-8 border-2 border-red-500/50 bg-gradient-to-br from-red-500/10 to-pink-500/10 ${tema.colores.sombra} backdrop-blur-xl hover:scale-[1.02] transition-all duration-300 animate-slideUp`}
                  style={{ animationDelay: "0.5s" }}
                >
                  <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-red-500 to-pink-500 flex items-center justify-center shadow-xl">
                        <Trash className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-black text-red-300">
                          Zona de peligro
                        </h3>
                        <p className="text-xs font-bold text-red-200/80">
                          Acciones irreversibles
                        </p>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setModalEliminarAbierto(true)}
                    disabled={!tarea.puede_eliminar}
                    className="inline-flex items-center gap-3 px-6 py-4 rounded-2xl text-sm font-black bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white disabled:opacity-40 disabled:cursor-not-allowed hover:scale-110 transition-all shadow-xl"
                  >
                    <Trash className="w-5 h-5" />
                    Eliminar tarea definitivamente
                  </button>
                </div>
              </div>
            </section>
          </>
        )}

        {/* Modal eliminar premium */}
        {modalEliminarAbierto && tarea && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md animate-fadeIn">
            <div
              className={`w-full max-w-lg rounded-3xl ${tema.colores.card} ${tema.colores.borde} border-2 ${tema.colores.sombra} p-8 animate-scaleIn backdrop-blur-xl`}
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-red-500 to-pink-500 flex items-center justify-center shadow-2xl">
                  <Trash className="w-8 h-8 text-white" />
                </div>
                <h3 className={`text-2xl font-black ${tema.colores.texto}`}>
                  Eliminar tarea
                </h3>
              </div>
              <p className={`text-base mb-6 ${tema.colores.textoSecundario}`}>
                ¿Estás seguro de que deseas eliminar la tarea{" "}
                <span className={`font-black ${tema.colores.texto}`}>
                  "{tarea.titulo}"
                </span>
                ? Esta acción no se puede deshacer y se eliminará de todos los
                reportes y sistemas.
              </p>
              <div className="flex items-center justify-end gap-4">
                <button
                  onClick={() => setModalEliminarAbierto(false)}
                  disabled={eliminando}
                  className={`px-6 py-4 rounded-2xl text-base font-bold ${tema.colores.secundario} ${tema.colores.texto} hover:scale-110 transition-all disabled:opacity-50`}
                >
                  Cancelar
                </button>
                <button
                  onClick={eliminarTarea}
                  disabled={eliminando}
                  className="px-6 py-4 rounded-2xl text-base font-black bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white flex items-center gap-3 disabled:opacity-50 hover:scale-110 transition-all shadow-xl"
                >
                  {eliminando && (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  )}
                  Eliminar definitivamente
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* FOOTER PREMIUM */}
      <footer
        className={`transition-all duration-300 ${
          sidebarAbierto ? "ml-72" : "ml-20"
        } ${tema.colores.card} ${tema.colores.borde} border-t-2 py-8 mt-16 backdrop-blur-xl`}
      >
        <div className="max-w-[1920px] mx-auto px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <p
              className={`text-base font-bold ${tema.colores.textoSecundario}`}
            >
              © 2025 AnyssaMed · Módulo Premium de Tareas INFOGES.
            </p>
            <span
              className={`px-4 py-2 rounded-xl text-xs font-black bg-gradient-to-r ${tema.colores.gradiente} text-white shadow-lg`}
            >
              v2.0.0 PREMIUM · Detalle Extraordinario
            </span>
          </div>
          <div className="flex items-center gap-8">
            <Link
              href="/ayuda"
              className={`text-base font-black transition-colors ${tema.colores.textoSecundario} hover:${tema.colores.acento}`}
            >
              Ayuda
            </Link>
            <Link
              href="/privacidad"
              className={`text-base font-black transition-colors ${tema.colores.textoSecundario} hover:${tema.colores.acento}`}
            >
              Privacidad
            </Link>
            <button
              onClick={cerrarSesion}
              className="text-base font-black text-red-400 hover:text-red-300 transition-colors"
            >
              Cerrar Sesión
            </button>
          </div>
        </div>
      </footer>

      {/* ESTILOS GLOBALES PREMIUM */}
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

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slideRight {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes float {
          0%,
          100% {
            transform: translateY(0px) rotate(0deg);
          }
          50% {
            transform: translateY(-20px) rotate(5deg);
          }
        }

        @keyframes float-delayed {
          0%,
          100% {
            transform: translateY(0px) rotate(0deg);
          }
          50% {
            transform: translateY(-30px) rotate(-5deg);
          }
        }

        @keyframes spin-reverse {
          from {
            transform: rotate(360deg);
          }
          to {
            transform: rotate(0deg);
          }
        }

        .animate-wave {
          animation: wave 1s ease-in-out infinite;
        }

        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }

        .animate-scaleIn {
          animation: scaleIn 0.4s ease-out;
        }

        .animate-slideDown {
          animation: slideDown 0.4s ease-out;
        }

        .animate-slideUp {
          animation: slideUp 0.5s ease-out;
        }

        .animate-slideRight {
          animation: slideRight 0.4s ease-out;
        }

        .animate-float {
          animation: float 6s ease-in-out infinite;
        }

        .animate-float-delayed {
          animation: float-delayed 8s ease-in-out infinite;
        }

        .animate-spin-reverse {
          animation: spin-reverse 3s linear infinite;
        }

        .custom-scrollbar::-webkit-scrollbar {
          width: 10px;
          height: 10px;
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
          background: linear-gradient(
            135deg,
            rgba(99, 102, 241, 0.8),
            rgba(168, 85, 247, 0.8)
          );
          border-radius: 10px;
          border: 2px solid
            ${["dark", "blue", "purple", "green"].includes(temaActual)
              ? "rgba(31, 41, 55, 0.5)"
              : "rgba(243, 244, 246, 0.5)"};
        }

        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(
            135deg,
            rgba(99, 102, 241, 1),
            rgba(168, 85, 247, 1)
          );
          box-shadow: 0 0 10px rgba(99, 102, 241, 0.5);
        }

        /* Efectos de brillo premium */
        .glow-effect {
          box-shadow: 0 0 20px rgba(99, 102, 241, 0.3),
            0 0 40px rgba(168, 85, 247, 0.2);
        }

        /* Transiciones suaves premium */
        * {
          transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
        }

        /* Animación de carga premium */
        @keyframes shimmer {
          0% {
            background-position: -1000px 0;
          }
          100% {
            background-position: 1000px 0;
          }
        }

        .shimmer {
          animation: shimmer 2s infinite linear;
          background: linear-gradient(
            to right,
            transparent 0%,
            rgba(255, 255, 255, 0.1) 50%,
            transparent 100%
          );
          background-size: 1000px 100%;
        }

        /* Efectos de hover premium */
        .hover-lift {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .hover-lift:hover {
          transform: translateY(-4px);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
        }

        /* Gradientes animados premium */
        @keyframes gradient-shift {
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

        .animated-gradient {
          background-size: 200% 200%;
          animation: gradient-shift 3s ease infinite;
        }

        /* Efectos de texto premium */
        .text-glow {
          text-shadow: 0 0 10px rgba(99, 102, 241, 0.5),
            0 0 20px rgba(168, 85, 247, 0.3);
        }

        /* Bordes animados premium */
        @keyframes border-dance {
          0%,
          100% {
            border-color: rgba(99, 102, 241, 0.5);
          }
          50% {
            border-color: rgba(168, 85, 247, 0.8);
          }
        }

        .animated-border {
          animation: border-dance 2s ease-in-out infinite;
        }

        /* Efectos de pulso premium */
        @keyframes pulse-ring {
          0% {
            transform: scale(0.95);
            box-shadow: 0 0 0 0 rgba(99, 102, 241, 0.7);
          }
          70% {
            transform: scale(1);
            box-shadow: 0 0 0 10px rgba(99, 102, 241, 0);
          }
          100% {
            transform: scale(0.95);
            box-shadow: 0 0 0 0 rgba(99, 102, 241, 0);
          }
        }

        .pulse-ring {
          animation: pulse-ring 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }

        /* Efectos de partículas premium */
        @keyframes particle-float {
          0%,
          100% {
            transform: translateY(0) translateX(0) rotate(0deg);
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          90% {
            opacity: 1;
          }
          100% {
            transform: translateY(-100px) translateX(50px) rotate(360deg);
            opacity: 0;
          }
        }

        .particle {
          animation: particle-float 4s ease-in-out infinite;
        }

        /* Efectos de glassmorphism premium */
        .glass-effect {
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(20px) saturate(180%);
          -webkit-backdrop-filter: blur(20px) saturate(180%);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        /* Efectos de neomorphism premium */
        .neo-effect-light {
          background: linear-gradient(145deg, #ffffff, #f0f0f0);
          box-shadow: 8px 8px 16px #d1d1d1, -8px -8px 16px #ffffff;
        }

        .neo-effect-dark {
          background: linear-gradient(145deg, #1a1a1a, #2d2d2d);
          box-shadow: 8px 8px 16px #0d0d0d, -8px -8px 16px #272727;
        }

        /* Animaciones de entrada premium */
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fade-in-down {
          from {
            opacity: 0;
            transform: translateY(-30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fade-in-left {
          from {
            opacity: 0;
            transform: translateX(-30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes fade-in-right {
          from {
            opacity: 0;
            transform: translateX(30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes zoom-in {
          from {
            opacity: 0;
            transform: scale(0.8);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes rotate-in {
          from {
            opacity: 0;
            transform: rotate(-180deg) scale(0.5);
          }
          to {
            opacity: 1;
            transform: rotate(0deg) scale(1);
          }
        }

        /* Efectos de hover avanzados premium */
        .hover-glow:hover {
          box-shadow: 0 0 30px rgba(99, 102, 241, 0.6),
            0 0 60px rgba(168, 85, 247, 0.4);
          transform: translateY(-2px);
        }

        .hover-rotate:hover {
          transform: rotate(5deg) scale(1.05);
        }

        .hover-flip:hover {
          transform: rotateY(180deg);
        }

        /* Efectos de texto premium avanzados */
        @keyframes text-shimmer {
          0% {
            background-position: -500px 0;
          }
          100% {
            background-position: 500px 0;
          }
        }

        .text-shimmer {
          background: linear-gradient(
            90deg,
            currentColor 0%,
            rgba(255, 255, 255, 0.8) 50%,
            currentColor 100%
          );
          background-size: 500px 100%;
          -webkit-background-clip: text;
          background-clip: text;
          animation: text-shimmer 3s linear infinite;
        }

        /* Efectos de botón premium */
        .button-premium {
          position: relative;
          overflow: hidden;
        }

        .button-premium::before {
          content: "";
          position: absolute;
          top: 50%;
          left: 50%;
          width: 0;
          height: 0;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.3);
          transform: translate(-50%, -50%);
          transition: width 0.6s, height 0.6s;
        }

        .button-premium:hover::before {
          width: 300px;
          height: 300px;
        }

        /* Efectos de card premium */
        .card-premium {
          position: relative;
          overflow: hidden;
        }

        .card-premium::after {
          content: "";
          position: absolute;
          top: -50%;
          right: -50%;
          bottom: -50%;
          left: -50%;
          background: linear-gradient(
            to bottom,
            rgba(255, 255, 255, 0) 0%,
            rgba(255, 255, 255, 0.1) 50%,
            rgba(255, 255, 255, 0) 100%
          );
          transform: rotate(45deg);
          transition: all 0.5s;
        }

        .card-premium:hover::after {
          animation: shine 1.5s ease-in-out;
        }

        @keyframes shine {
          0% {
            top: -50%;
            right: -50%;
            bottom: -50%;
            left: -50%;
          }
          100% {
            top: 150%;
            right: 150%;
            bottom: 150%;
            left: 150%;
          }
        }

        /* Efectos de loading premium */
        @keyframes loading-dots {
          0%,
          20% {
            opacity: 0;
          }
          50% {
            opacity: 1;
          }
          100% {
            opacity: 0;
          }
        }

        .loading-dot {
          animation: loading-dots 1.4s infinite;
        }

        .loading-dot:nth-child(2) {
          animation-delay: 0.2s;
        }

        .loading-dot:nth-child(3) {
          animation-delay: 0.4s;
        }

        /* Efectos de skeleton premium */
        @keyframes skeleton-loading {
          0% {
            background-position: -200px 0;
          }
          100% {
            background-position: calc(200px + 100%) 0;
          }
        }

        .skeleton {
          background: linear-gradient(
            90deg,
            rgba(255, 255, 255, 0.05) 0px,
            rgba(255, 255, 255, 0.15) 40px,
            rgba(255, 255, 255, 0.05) 80px
          );
          background-size: 200px 100%;
          animation: skeleton-loading 1.5s ease-in-out infinite;
        }

        /* Efectos de badge premium */
        @keyframes badge-pulse {
          0%,
          100% {
            transform: scale(1);
            opacity: 1;
          }
          50% {
            transform: scale(1.1);
            opacity: 0.8;
          }
        }

        .badge-pulse {
          animation: badge-pulse 2s ease-in-out infinite;
        }

        /* Efectos de tooltip premium */
        .tooltip {
          position: relative;
        }

        .tooltip::before {
          content: attr(data-tooltip);
          position: absolute;
          bottom: 100%;
          left: 50%;
          transform: translateX(-50%) translateY(-8px);
          padding: 8px 12px;
          background: rgba(0, 0, 0, 0.9);
          color: white;
          border-radius: 8px;
          font-size: 12px;
          white-space: nowrap;
          opacity: 0;
          pointer-events: none;
          transition: all 0.3s;
          z-index: 1000;
        }

        .tooltip::after {
          content: "";
          position: absolute;
          bottom: 100%;
          left: 50%;
          transform: translateX(-50%);
          border: 6px solid transparent;
          border-top-color: rgba(0, 0, 0, 0.9);
          opacity: 0;
          pointer-events: none;
          transition: all 0.3s;
        }

        .tooltip:hover::before,
        .tooltip:hover::after {
          opacity: 1;
        }

        /* Efectos de progress bar premium */
        @keyframes progress-bar-stripes {
          0% {
            background-position: 40px 0;
          }
          100% {
            background-position: 0 0;
          }
        }

        .progress-bar-animated {
          background-image: linear-gradient(
            45deg,
            rgba(255, 255, 255, 0.15) 25%,
            transparent 25%,
            transparent 50%,
            rgba(255, 255, 255, 0.15) 50%,
            rgba(255, 255, 255, 0.15) 75%,
            transparent 75%,
            transparent
          );
          background-size: 40px 40px;
          animation: progress-bar-stripes 1s linear infinite;
        }

        /* Efectos de ripple premium */
        @keyframes ripple {
          0% {
            transform: scale(0);
            opacity: 1;
          }
          100% {
            transform: scale(4);
            opacity: 0;
          }
        }

        .ripple-effect {
          position: relative;
          overflow: hidden;
        }

        .ripple-effect::after {
          content: "";
          position: absolute;
          top: 50%;
          left: 50%;
          width: 20px;
          height: 20px;
          background: rgba(255, 255, 255, 0.5);
          border-radius: 50%;
          transform: translate(-50%, -50%) scale(0);
          pointer-events: none;
        }

        .ripple-effect:active::after {
          animation: ripple 0.6s ease-out;
        }

        /* Efectos de modal premium */
        @keyframes modal-fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes modal-slide-up {
          from {
            transform: translateY(100px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        .modal-overlay {
          animation: modal-fade-in 0.3s ease-out;
        }

        .modal-content {
          animation: modal-slide-up 0.4s ease-out;
        }

        /* Efectos de notification premium */
        @keyframes notification-slide-in {
          from {
            transform: translateX(400px);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }

        @keyframes notification-slide-out {
          from {
            transform: translateX(0);
            opacity: 1;
          }
          to {
            transform: translateX(400px);
            opacity: 0;
          }
        }

        .notification-enter {
          animation: notification-slide-in 0.4s ease-out;
        }

        .notification-exit {
          animation: notification-slide-out 0.3s ease-in;
        }

        /* Efectos de accordion premium */
        @keyframes accordion-expand {
          from {
            max-height: 0;
            opacity: 0;
          }
          to {
            max-height: 1000px;
            opacity: 1;
          }
        }

        .accordion-content {
          animation: accordion-expand 0.4s ease-out;
        }

        /* Efectos de tabs premium */
        .tab-indicator {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        /* Efectos de dropdown premium */
        @keyframes dropdown-fade-in {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .dropdown-menu {
          animation: dropdown-fade-in 0.2s ease-out;
        }

        /* Efectos de checkbox premium */
        @keyframes checkbox-check {
          0% {
            transform: scale(0) rotate(45deg);
          }
          50% {
            transform: scale(1.2) rotate(45deg);
          }
          100% {
            transform: scale(1) rotate(45deg);
          }
        }

        .checkbox-check {
          animation: checkbox-check 0.3s ease-out;
        }

        /* Efectos de radio premium */
        @keyframes radio-check {
          0% {
            transform: scale(0);
          }
          50% {
            transform: scale(1.2);
          }
          100% {
            transform: scale(1);
          }
        }

        .radio-check {
          animation: radio-check 0.3s ease-out;
        }

        /* Efectos de switch premium */
        .switch-toggle {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        /* Efectos de slider premium */
        .slider-thumb {
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .slider-thumb:hover {
          transform: scale(1.2);
        }

        /* Efectos de avatar premium */
        .avatar-ring {
          position: relative;
        }

        .avatar-ring::before {
          content: "";
          position: absolute;
          inset: -4px;
          border-radius: inherit;
          padding: 2px;
          background: linear-gradient(
            135deg,
            rgba(99, 102, 241, 0.8),
            rgba(168, 85, 247, 0.8)
          );
          -webkit-mask: linear-gradient(#fff 0 0) content-box,
            linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
        }

        /* Efectos de divider premium */
        .divider-gradient {
          background: linear-gradient(
            90deg,
            transparent 0%,
            rgba(99, 102, 241, 0.5) 50%,
            transparent 100%
          );
          height: 2px;
        }

        /* Efectos de code block premium */
        .code-block {
          position: relative;
          background: rgba(0, 0, 0, 0.5);
          border-radius: 12px;
          padding: 20px;
          overflow-x: auto;
        }

        .code-block::before {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 30px;
          background: linear-gradient(
            to bottom,
            rgba(255, 255, 255, 0.05),
            transparent
          );
          border-radius: 12px 12px 0 0;
        }

        /* Efectos de table premium */
        .table-row-hover {
          transition: all 0.2s ease;
        }

        .table-row-hover:hover {
          background: rgba(99, 102, 241, 0.1);
          transform: scale(1.01);
        }

        /* Efectos de pagination premium */
        .pagination-item {
          transition: all 0.3s ease;
        }

        .pagination-item:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
        }

        /* Efectos de breadcrumb premium */
        .breadcrumb-separator {
          opacity: 0.5;
          transition: opacity 0.3s ease;
        }

        .breadcrumb-item:hover .breadcrumb-separator {
          opacity: 1;
        }

        /* Efectos de stepper premium */
        .stepper-line {
          transition: all 0.5s ease;
        }

        .stepper-step {
          transition: all 0.3s ease;
        }

        .stepper-step.active {
          transform: scale(1.1);
        }

        /* Efectos de timeline premium */
        .timeline-item {
          position: relative;
        }

        .timeline-item::before {
          content: "";
          position: absolute;
          left: 0;
          top: 0;
          bottom: 0;
          width: 2px;
          background: linear-gradient(
            to bottom,
            rgba(99, 102, 241, 0.8),
            rgba(168, 85, 247, 0.8)
          );
        }

        /* Efectos de carousel premium */
        @keyframes carousel-slide {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }

        .carousel-item {
          animation: carousel-slide 0.5s ease-out;
        }

        /* Efectos de gallery premium */
        .gallery-item {
          transition: all 0.3s ease;
          overflow: hidden;
        }

        .gallery-item:hover {
          transform: scale(1.05);
          z-index: 10;
        }

        .gallery-item img {
          transition: transform 0.5s ease;
        }

        .gallery-item:hover img {
          transform: scale(1.1);
        }

        /* Efectos de masonry premium */
        .masonry-item {
          break-inside: avoid;
          margin-bottom: 20px;
          transition: all 0.3s ease;
        }

        .masonry-item:hover {
          transform: translateY(-4px);
        }

        /* Efectos de infinite scroll premium */
        @keyframes infinite-scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }

        .infinite-scroll {
          animation: infinite-scroll 30s linear infinite;
        }

        /* Efectos de parallax premium */
        .parallax-layer {
          transition: transform 0.1s ease-out;
        }

        /* Efectos de zoom premium */
        .zoom-container {
          overflow: hidden;
          cursor: zoom-in;
        }

        .zoom-container img {
          transition: transform 0.3s ease;
        }

        .zoom-container:hover img {
          transform: scale(1.5);
        }

        /* Efectos de flip card premium */
        .flip-card {
          perspective: 1000px;
        }

        .flip-card-inner {
          transition: transform 0.6s;
          transform-style: preserve-3d;
        }

        .flip-card:hover .flip-card-inner {
          transform: rotateY(180deg);
        }

        .flip-card-front,
        .flip-card-back {
          backface-visibility: hidden;
        }

        .flip-card-back {
          transform: rotateY(180deg);
        }

        /* Efectos de 3D card premium */
        .card-3d {
          transform-style: preserve-3d;
          transition: transform 0.3s ease;
        }

        .card-3d:hover {
          transform: rotateY(10deg) rotateX(10deg);
        }

        /* Efectos de confetti premium */
        @keyframes confetti-fall {
          0% {
            transform: translateY(-100vh) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
          }
        }

        .confetti {
          animation: confetti-fall 3s ease-in infinite;
        }

        /* Efectos de fireworks premium */
        @keyframes firework {
          0% {
            transform: translate(0, 0);
            opacity: 1;
          }
          100% {
            transform: translate(var(--x), var(--y));
            opacity: 0;
          }
        }

        .firework {
          animation: firework 1s ease-out;
        }

        /* Efectos de typing premium */
        @keyframes typing {
          from {
            width: 0;
          }
          to {
            width: 100%;
          }
        }

        @keyframes blink-caret {
          from,
          to {
            border-color: transparent;
          }
          50% {
            border-color: currentColor;
          }
        }

        .typing-effect {
          overflow: hidden;
          border-right: 2px solid;
          white-space: nowrap;
          animation: typing 3.5s steps(40, end),
            blink-caret 0.75s step-end infinite;
        }

        /* Optimizaciones de rendimiento */
        .gpu-accelerated {
          transform: translateZ(0);
          will-change: transform;
        }

        /* Modo oscuro suave */
        @media (prefers-color-scheme: dark) {
          .auto-dark {
            filter: invert(1) hue-rotate(180deg);
          }
        }

        /* Responsive premium */
        @media (max-width: 768px) {
          .mobile-stack {
            flex-direction: column;
          }

          .mobile-full {
            width: 100%;
          }

          .mobile-hide {
            display: none;
          }
        }

        /* Print styles premium */
        @media print {
          .no-print {
            display: none !important;
          }

          .print-break {
            page-break-after: always;
          }
        }

        /* Accesibilidad premium */
        .focus-visible:focus-visible {
          outline: 3px solid rgba(99, 102, 241, 0.6);
          outline-offset: 2px;
        }

        .sr-only {
          position: absolute;
          width: 1px;
          height: 1px;
          padding: 0;
          margin: -1px;
          overflow: hidden;
          clip: rect(0, 0, 0, 0);
          white-space: nowrap;
          border-width: 0;
        }

        /* Reducir movimiento para usuarios con preferencias */
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


